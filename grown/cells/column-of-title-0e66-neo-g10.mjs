// column-of-title-0e66-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"column-of-title-0e66-neo-g10","class":"column-of-title-0e66","generation":10,"lane":"neo","grownFrom":["give the column for Annual CO₂ emissions","what is the column of Annual CO₂ emissions from other industry (per capita)","tell me the column of the title Cumulative CO₂ emissions including land-use change","tell me the column of the title Annual CO₂ emissions from cement","give the column for Share of global cumulative CO₂ emissions from flaring","give the column for Primary energy consumption","what is the column of Share of global cumulative CO₂ emissions from gas","give the column for Annual CO₂ emissions including land-use change per capita","what is the column of CO₂ emissions per unit energy","give the column for CO₂ emissions including land-use change per unit energy","give the column for Change in global mean surface temperature caused by methane emissions","what is the column of Annual CO₂ emissions embedded in trade","tell me the column of the title Primary energy consumption per GDP","what is the column of Share of global cumulative CO₂ emissions from other industry","give the column for Share of annual CO₂ emissions embedded in trade","tell me the column of the title Annual CO₂ emissions from coal","give the column for ISO code","what is the column of Cumulative CO₂ emissions from coal","give the column for Annual CO₂ emissions from oil","give the column for Annual nitrous oxide emissions including land use"],"version":1});

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
knowLoad([{"id":"fr-co2-data-owid-co2-codebook-4bc0ff","columns":["title","column","unit"],"n":79,"cols":[{"f":"0Annual CO₂ emissions from cement|w (per capita)|0Growth rate of emissions including land-use change|0Annual CO₂ emissions including land-use change per GDP|0CO₂ emissions including land-use change per unit energy|0Per capita greenhouse gas emissions from fossil fuels and industry|0Change in global mean surface temperature caused by methane emissions|0Annual CO₂ emissions|k embedded in trade|lfrom coal|u (per capita)|qflaring|x (per capita)|qgas|t (per capita)|qland-use change|zchange per capita|qoil|t (per capita)|rther industry|zustry (per capita)|lgrowth (%)|tabs)|lincluding land-use change|z-use change per capita|lper GDP (kg per international-$)|7consumption-based CO₂ emissions|zons per GDP (kg per international-$)|7greenhouse gas emissions from fossil fuels and industry|wincluding land use|7methane emissions including land use|7nitrous oxide emissions including land use|0CO₂ emissions per capita|iunit energy|1hange in global mean surface temperature caused by CO₂ emissions|zrature caused by greenhouse gas emissions|zrature caused by nitrous oxide emissions|1ountry|1umulative CO₂ emissions|o from cement|voal|uflaring|ugas|uland-use change|uoil|vther industry|pincluding land-use change|0Gross domestic product (GDP)|3wth rate of emissions including land-use change (%)|0ISO code|0Per capita consumption-based CO₂ emissions|bgreenhouse gas emissions including land use|bmethane emissions including land use|bnitrous oxide emissions including land use|1opulation|1rimary energy consumption|q per GDP|vcapita|0Share of annual CO₂ emissions embedded in trade|9contribution to global warming|9global annual CO₂ emissions|zs from cement|zs from coal|zs from flaring|zs from gas|zs from land-use change|zs from oil|zs from other industry|zs including land-use change|gcumulative CO₂ emissions|zsions from cement|zsions from coal|zsions from flaring|zsions from gas|zsions from land-use change|zsions from oil|zsions from other industry|zsions including land-use change|0Year","sep":"|"},{"f":"0cement_co2|a_per_capita|1o2_including_luc_growth_abs|iper_gdp|munit_energy|0ghg_excluding_lucf_per_capita|0temperature_change_from_ch4|0co2|0trade_co2|0coal_co2|8_per_capita|0flaring_co2|b_per_capita|0gas_co2|7_per_capita|0land_use_change_co2|j_per_capita|0oil_co2|7_per_capita|1ther_industry_co2|6co2_per_capita|0co2_growth_prct|babs|4including_luc|h_per_capita|4per_gdp|2nsumption_co2|f_per_gdp|0total_ghg_excluding_lucf|9|0methane|0nitrous_oxide|0co2_per_capita|8unit_energy|0temperature_change_from_co2|oghg|on2o|0country|1umulative_co2|cement_co2|coal_co2|bflaring_co2|bgas_co2|bluc_co2|boil_co2|cther_co2|bco2_including_luc|0gdp|0co2_including_luc_growth_prct|0iso_code|0consumption_co2_per_capita|0ghg_per_capita|0methane_per_capita|0nitrous_oxide_per_capita|0population|1rimary_energy_consumption|0energy_per_gdp|bcapita|0trade_co2_share|0share_of_temperature_change_from_ghg|6global_co2|eement_co2|eoal_co2|dflaring_co2|dgas_co2|dluc_co2|doil_co2|ether_co2|dco2_including_luc|eumulative_co2|pement_co2|poal_co2|oflaring_co2|ogas_co2|oluc_co2|ooil_co2|pther_co2|oco2_including_luc|0year","sep":"|"},{"d":"million tonnes (Mt)|tonnes per person (t/person)|kilograms per international-$ (kg/$)|grams per kilowatt-hour (g/kWh)|tonnes of CO₂ equivalents per person (t/person)|°C|%||international-$ in 2011 prices ($)|people|terawatt-hours (TWh)|kilowatt-hours per $ (kWh)|kilowatt-hours per person (kWh)","i":"0,1,0,2,3,4,5,0,0,0,1,0,1,0,1,0,1,0,1,0,1,6,0,0,1,2,0,2,0,0,0,0,1,3,5,5,5,7,0,0,0,0,0,0,0,0,0,8,6,7,1,4,4,4,9,a,b,c,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7","sep":"|"}]}]);
const COLONY = [
{"id":"n-e2a2b40d","guard":[["has","column"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the column of Annual CO₂ emissions from other industry (per capita)":"The column of Annual CO₂ emissions from other industry (per capita) is other_co2_per_capita.","the column of Share of global cumulative CO₂ emissions from gas":"The column of Share of global cumulative CO₂ emissions from gas is share_global_cumulative_gas_co2.","the column of CO₂ emissions per unit energy":"The column of CO₂ emissions per unit energy is co2_per_unit_energy.","the column of Annual CO₂ emissions embedded in trade":"The column of Annual CO₂ emissions embedded in trade is trade_co2.","the column of Share of global cumulative CO₂ emissions from other industry":"The column of Share of global cumulative CO₂ emissions from other industry is share_global_cumulative_other_co2.","the column of Cumulative CO₂ emissions from coal":"The column of Cumulative CO₂ emissions from coal is cumulative_coal_co2.","the column of Cumulative CO₂ emissions from gas":"The column of Cumulative CO₂ emissions from gas is cumulative_gas_co2.","the column of Annual CO₂ emissions from other industry":"The column of Annual CO₂ emissions from other industry is other_industry_co2.","the column of Per capita nitrous oxide emissions including land use":"The column of Per capita nitrous oxide emissions including land use is nitrous_oxide_per_capita.","the column of Share of global annual CO₂ emissions from other industry":"The column of Share of global annual CO₂ emissions from other industry is share_global_other_co2.","the column of Change in global mean surface temperature caused by nitrous oxide emissions":"The column of Change in global mean surface temperature caused by nitrous oxide emissions is temperature_change_from_n2o.","the column of Share of global cumulative CO₂ emissions from land-use change":"The column of Share of global cumulative CO₂ emissions from land-use change is share_global_cumulative_luc_co2.","the column of Share of global annual CO₂ emissions including land-use change":"The column of Share of global annual CO₂ emissions including land-use change is share_global_co2_including_luc.","the column of Per capita consumption-based CO₂ emissions":"The column of Per capita consumption-based CO₂ emissions is consumption_co2_per_capita.","the column of Annual CO₂ emissions per GDP (kg per international-$)":"The column of Annual CO₂ emissions per GDP (kg per international-$) is co2_per_gdp.","the column of Annual CO₂ emissions from gas (per capita)":"The column of Annual CO₂ emissions from gas (per capita) is gas_co2_per_capita.","the column of Per capita methane emissions including land use":"The column of Per capita methane emissions including land use is methane_per_capita.","the column of Share of global annual CO₂ emissions from oil":"The column of Share of global annual CO₂ emissions from oil is share_global_oil_co2.","the column of Share of contribution to global warming":"The column of Share of contribution to global warming is share_of_temperature_change_from_ghg."}}},
{"id":"n-b96fb3e2","guard":[["has","column"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"Annual CO₂ emissions":"The column of Annual CO₂ emissions is co2.","Share of global cumulative CO₂ emissions from flaring":"The column of Share of global cumulative CO₂ emissions from flaring is share_global_cumulative_flaring_co2.","Primary energy consumption":"The column of Primary energy consumption is primary_energy_consumption.","Annual CO₂ emissions including land-use change per capita":"The column of Annual CO₂ emissions including land-use change per capita is co2_including_luc_per_capita.","CO₂ emissions including land-use change per unit energy":"The column of CO₂ emissions including land-use change per unit energy is co2_including_luc_per_unit_energy.","Change in global mean surface temperature caused by methane emissions":"The column of Change in global mean surface temperature caused by methane emissions is temperature_change_from_ch4.","Share of annual CO₂ emissions embedded in trade":"The column of Share of annual CO₂ emissions embedded in trade is trade_co2_share.","ISO code":"The column of ISO code is iso_code.","Annual CO₂ emissions from oil":"The column of Annual CO₂ emissions from oil is oil_co2.","Annual nitrous oxide emissions including land use":"The column of Annual nitrous oxide emissions including land use is nitrous_oxide.","Annual CO₂ emissions from coal (per capita)":"The column of Annual CO₂ emissions from coal (per capita) is coal_co2_per_capita.","Annual CO₂ emissions from flaring":"The column of Annual CO₂ emissions from flaring is flaring_co2.","Annual greenhouse gas emissions from fossil fuels and industry":"The column of Annual greenhouse gas emissions from fossil fuels and industry is total_ghg_excluding_lucf.","Annual CO₂ emissions growth (%)":"The column of Annual CO₂ emissions growth (%) is co2_growth_prct.","Annual CO₂ emissions from oil (per capita)":"The column of Annual CO₂ emissions from oil (per capita) is oil_co2_per_capita.","Change in global mean surface temperature caused by CO₂ emissions":"The column of Change in global mean surface temperature caused by CO₂ emissions is temperature_change_from_co2.","Change in global mean surface temperature caused by greenhouse gas emissions":"The column of Change in global mean surface temperature caused by greenhouse gas emissions is temperature_change_from_ghg.","Cumulative CO₂ emissions from flaring":"The column of Cumulative CO₂ emissions from flaring is cumulative_flaring_co2."}}},
{"id":"n-b4297c6b","guard":[["hasAny",["contribution","delete","embedded","industry","item number","nth","per","position","remove","strip out","without"]],["has","column"],["not",["has","consumption"]],["not",["has","change"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-dd9dcc85","guard":[["hasAny",["contribution","delete","embedded","industry","item number","nth","per","position","remove","strip out","without"]],["has","column"],["not",["has","consumption"]],["not",["has","change"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-5a4d13ac","guard":[["hasAny",["contribution","delete","element","embedded","growth","item number","nth","position","remove","strip out","without"]],["has","column"],["not",["has","name"]],["not",["has","comes"]],["not",["has","power"]],["not",["has","renewables"]],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-ceda2da0","guard":[["hasAny",["contribution","delete","element","embedded","growth","item number","nth","position","remove","strip out","without"]],["has","column"],["not",["has","name"]],["not",["has","comes"]],["not",["has","power"]],["not",["has","renewables"]],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-01fa9873","guard":[["hasAny",["code","contribution","growth","item number","nth","position"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.code",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]],"mem":null},
{"id":"n-cc3dc5bf","guard":[["hasAny",["code","contribution","growth","item number","nth","position"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]],"mem":null},
{"id":"n-2765cd66","guard":[["hasAny",["code","contribution","growth","invert case","item number","nth","position","swap case","toggle case"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]]],"mem":null},
{"id":"n-83bc877c","guard":[["hasAny",["code","contribution","growth","invert case","item number","nth","position","swap case","toggle case"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]]],"mem":null},
{"id":"n-d350ad38","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","contribution","growth","item number","nth","position","title case"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]]],"mem":null},
{"id":"n-d72a2026","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","contribution","growth","item number","nth","position","title case"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]]],"mem":null},
{"id":"n-42449cd0","guard":[["hasAny",["code","contribution","delete","growth","item number","nth","position","remove","strip out","without"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":"global"}]],"mem":null},
{"id":"n-46269bde","guard":[["hasAny",["code","contribution","growth","item number","nth","position","separate by","split","split by"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":"global"}]],"mem":null},
{"id":"n-535b6be6","guard":[["hasAny",["code","contribution","growth","item number","nth","position","separate by","split","split by"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":"global"}]],"mem":null},
{"id":"n-65acc025","guard":[["hasAny",["contribution","greenhouse","item number","nth","position","separate by","split","split by"]],["has","column"],["not",["has","name"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.lastWord"]]],"mem":null},
{"id":"n-704e9914","guard":[["hasAny",["code","contribution","growth","item number","nth","position","separate by","split","split by"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":"global"}]],"mem":null},
{"id":"n-79bc258d","guard":[["hasAny",["contribution","greenhouse","item number","nth","position","separate by","split","split by"]],["has","column"],["not",["has","name"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.lastWord"]]],"mem":null},
{"id":"n-801ba80e","guard":[["hasAny",["contribution","greenhouse","item number","nth","position","separate by","split","split by"]],["has","column"],["not",["has","name"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.lastWord"]]],"mem":null},
{"id":"n-972a7086","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","contribution","growth","invert case","item number","nth","position","swap case","title case","toggle case"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.swapCase",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]]]],"mem":null},
{"id":"n-a3e28a46","guard":[["hasAny",["code","contribution","delete","growth","item number","nth","position","remove","strip out","without"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":"global"}]],"mem":null},
{"id":"n-b976a406","guard":[["hasAny",["contribution","delete","greenhouse","item number","nth","position","remove","strip out","without"]],["has","column"],["not",["has","name"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.lastWord"]]],"mem":null},
{"id":"n-ca68d815","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","contribution","growth","invert case","item number","nth","position","swap case","title case","toggle case"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.swapCase",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]]]],"mem":null},
{"id":"n-ee7729b3","guard":[["hasAny",["contribution","delete","greenhouse","item number","nth","position","remove","strip out","without"]],["has","column"],["not",["has","name"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.lastWord"]]],"mem":null},
{"id":"n-065563ec","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":4},["sense.lastWord"]]],"mem":null},
{"id":"n-06db404d","guard":[["hasAny",["code","contribution","delete","growth","item number","nth","position","remove","strip out","without"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-0bee7192","guard":[["hasAny",["code","contribution","growth","item number","nth","position","separate by","split","split by"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-241c649b","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",14],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-31209ce5","guard":[["hasAny",["code","contribution","growth","item number","nth","position","separate by","split","split by"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-39237e68","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",14],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-41ab4b26","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","delete","element","for","item number","nth","position","remove","strip out","title case","without"]],["has","column"],["not",["has","from"]]],"pyramid":["render.str",["transform.remove",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-49212a40","guard":[["hasAny",["code","contribution","delete","growth","item number","nth","position","remove","strip out","without"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-581094af","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":4},["sense.text"]]],"mem":null},
{"id":"n-6b6adb02","guard":[["hasAny",["code","contribution","delete","growth","item number","nth","position","remove","strip out","without"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-6d97fdb2","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",14],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-80c39281","guard":[["hasAny",["change to","contribution","greenhouse","item number","nth","position","replace","substitute","swap"]],["has","column"],["not",["has","name"]]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-84871c90","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-a25bc878","guard":[["hasAny",["code","contribution","growth","item number","nth","position","separate by","split","split by"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-abc6cbf9","guard":[["hasAny",["annual","camel case","camelcase","code","consumption","delete","element","item number","lower camel case","nth","position","remove","strip out","without"]],["has","give"],["not",["has","from"]],["has","column"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-b004fd40","guard":[["hasAny",["annual","camel case","camelcase","code","delete","element","for","item number","lower camel case","nth","position","remove","strip out","without"]],["has","column"],["not",["has","from"]],["has","give"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-b017513c","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":4},["sense.text"]]],"mem":null},
{"id":"n-b3ba83c4","guard":[["hasAny",["annual","camel case","camelcase","code","delete","element","for","item number","lower camel case","nth","position","remove","strip out","without"]],["has","column"],["not",["has","from"]],["has","give"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-b58e07b5","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",14],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-bad2625b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","delete","element","for","item number","nth","position","remove","strip out","title case","without"]],["has","column"],["not",["has","from"]]],"pyramid":["render.str",["transform.remove",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-c195cf6a","guard":[["hasAny",["code","contribution","growth","item number","nth","position","separate by","split","split by"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-c416881e","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":5},["sense.lastWord"]]],"mem":null},
{"id":"n-c80cb6e1","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":4},["sense.lastWord"]]],"mem":null},
{"id":"n-d22bd965","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-d3e00de5","guard":[["hasAny",["code","contribution","growth","item number","nth","position","separate by","split","split by"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-f0d037f3","guard":[["hasAny",["code","contribution","delete","growth","item number","nth","position","remove","strip out","without"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-f1f07b29","guard":[["hasAny",["change to","contribution","greenhouse","item number","nth","position","replace","substitute","swap"]],["has","column"],["not",["has","name"]]],"pyramid":["render.code",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-f41edc24","guard":[["hasAny",["code","contribution","growth","item number","nth","position","separate by","split","split by"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-f871c275","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":5},["sense.lastWord"]]],"mem":null},
{"id":"n-540a352e","guard":[["hasAny",["change to","column","item number","nth","position","replace","substitute","swap"]],["not",["has","from"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-9ecb24bc","guard":[["hasAny",["change to","column","item number","nth","position","replace","substitute","swap"]],["not",["has","from"]]],"pyramid":["render.code",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-026d0623","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-70af49db","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-a6398a76","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["render.list",["transform.split",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-005a597f","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":4},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-0508d699","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",14],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-170091ea","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-32ef52bb","guard":[["hasAny",["change to","contribution","greenhouse","item number","nth","position","replace","substitute","swap"]],["has","column"],["not",["has","name"]]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-7507f525","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":4},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-7e83dfa3","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["transform.split",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-b0b66e78","guard":[["hasAny",["change to","contribution","greenhouse","item number","nth","position","replace","substitute","swap"]],["has","column"],["not",["has","name"]]],"pyramid":["render.code",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-b8c74ebe","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",14],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-ec71d288","guard":[["hasAny",["code","contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",15],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-13aa7dea","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-527b34e2","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["render.list",["transform.split",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-e7f66376","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-b1bd79c0","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["render.list",["transform.split",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-681efa94","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," CO₂ emissions from ",{"slot":1}," is ",{"slot":2},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-e74cf383","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-2c3cefae","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-901fee93","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.pascal",["sense.lastWord"]]],"mem":null},
{"id":"n-b61e2159","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-bde0c7f4","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-155af774","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-197ac8ef","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.pascal",["sense.lastWord"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-2a9c6ce9","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.camel",["sense.lastWord"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-6a884ae0","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.lastWord"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-79bf666c","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-d3ec3b17","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dc8e1a3c","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.upper",["sense.lastWord"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-10ca4022","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-55393f66","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.lastWord"]]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-93b633d8","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Annual ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-cde2cc96","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.lastWord"]]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-6efbd36e","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," CO₂ ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-b441cd1c","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," emissions from ",{"slot":3}," is ",{"slot":4},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-4fa3979f","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-18fb66fa","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3a8aeecc","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.pascal",["sense.lastWord"]]],"mem":null},
{"id":"n-5ead081f","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-a5d74952","guard":[["has","capita"],["has","from"],["words<=",12],["has","column"],["not",["has","me"]]],"pyramid":["render.template",{"lit":["The column of Annual ",{"slot":0}," ",{"slot":1}," from ",{"slot":2}," (per ",{"slot":3},") is ",{"slot":4},"_co2_per_",{"slot":5},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":5}],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-b117d505","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-150dbc89","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.upper",["sense.lastWord"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-48cf2a34","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-740aad00","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7707fdaf","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-856e5189","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a612d572","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-ae87e032","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.pascal",["sense.lastWord"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-dc10d465","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.lastWord"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-e4c2e809","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-03b45adf","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.lastWord"]]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-0a7be16e","guard":[["has","tell"],["words<=",12],["has","annual"],["has","from"],["has","title"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.lastWord"]]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-4f1fff17","guard":[["hasAny",["annual","code","join","joined with","separated by"]],["has","column"],["not",["has","comes"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-749853a9","guard":[["hasAny",["annual","code","join","joined with","month name","name of month","separated by","which month"]],["has","column"],["has","give"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["compute.monthName",["sense.wordCount"]]]],"mem":null},
{"id":"n-80df828c","guard":[["hasAny",["column","factorial","first n","n factorial","take"]],["has","give"],["not",["has","from"]]],"pyramid":["render.list",["transform.takeStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["compute.factorial",["sense.wordCount"]]]],"mem":null},
{"id":"n-8af49901","guard":[["hasAny",["annual","code","join","joined with","month name","name of month","separated by","which month"]],["has","column"],["has","give"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["compute.monthName",["sense.wordCount"]]]],"mem":null},
{"id":"n-9d554438","guard":[["hasAny",["code","digit count","element","for","how many digits","item number","nth","number of digits","position"]],["has","column"],["words<=",7]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-f5ad6605","guard":[["hasAny",["annual","code","join","joined with","separated by"]],["has","column"],["not",["has","comes"]]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-fe49e067","guard":[["hasAny",["code","digit count","element","for","how many digits","item number","nth","number of digits","position"]],["has","column"],["words<=",7]],"pyramid":["render.code",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-0778a5a5","guard":[["hasAny",["annual","code","delete","element","item number","month name","name of month","nth","position","remove","strip out","which month","without"]],["has","column"],["has","give"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["compute.monthName",["sense.wordCount"]]]],"mem":null},
{"id":"n-14d47ca9","guard":[["hasAny",["code","consumption","delete","invert case","item number","nth","position","remove","strip out","swap case","toggle case","without"]],["has","column"],["words<=",7]],"pyramid":["render.str",["transform.remove",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]],["sense.lastWord"]]],"mem":null},
{"id":"n-3aa953b5","guard":[["hasAny",["annual","code","delete","element","item number","month name","name of month","nth","position","remove","strip out","which month","without"]],["has","column"],["has","give"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["compute.monthName",["sense.wordCount"]]]],"mem":null},
{"id":"n-94bb48f3","guard":[["hasAny",["code","consumption","delete","invert case","item number","nth","position","remove","strip out","swap case","toggle case","without"]],["has","column"],["words<=",7]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.swapCase",["sense.lastWord"]]]],"mem":null},
{"id":"n-d1950255","guard":[["hasAny",["annual","code","delete","element","item number","month name","name of month","nth","position","remove","strip out","which month","without"]],["has","column"],["has","give"]],"pyramid":["render.code",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["compute.monthName",["sense.wordCount"]]]],"mem":null},
{"id":"n-f709e960","guard":[["hasAny",["annual","code","delete","element","item number","month name","name of month","nth","position","remove","strip out","which month","without"]],["has","column"],["has","give"]],"pyramid":["render.code",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["compute.monthName",["sense.wordCount"]]]],"mem":null},
{"id":"n-00591fa8","guard":[["hasAny",["annual","consumption","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","from"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":10},["sense.before",{"lit":"for"}]]],"mem":null},
{"id":"n-094aa6d1","guard":[["words<=",11],["not",["has","code"]],["has","give"],["not",["has","from"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":12},["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-13d054f8","guard":[["words<=",11],["not",["has","code"]],["has","give"],["not",["has","from"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":10},["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-1a488128","guard":[["words<=",11],["not",["has","code"]],["has","give"],["not",["has","from"]]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":10},["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-2798903d","guard":[["words<=",11],["not",["has","code"]],["has","give"],["not",["has","from"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":10},["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-31f7de89","guard":[["hasAny",["annual","consumption","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","from"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":10},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-386cdc22","guard":[["hasAny",["annual","consumption","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","from"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":12},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-45ebb0b4","guard":[["words<=",11],["not",["has","code"]],["has","give"],["not",["has","from"]]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":10},["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-540f97c7","guard":[["hasAny",["annual","consumption","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","from"]]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":12},["sense.before",{"lit":"for"}]]],"mem":null},
{"id":"n-57b77ab2","guard":[["hasAny",["annual","code","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","comes"]]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.before",{"lit":"for"}]]],"mem":null},
{"id":"n-59bcbb7d","guard":[["hasAny",["annual","code","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","comes"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-62170ba6","guard":[["hasAny",["annual","consumption","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","from"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":12},["sense.before",{"lit":"for"}]]],"mem":null},
{"id":"n-6bebdad4","guard":[["words<=",11],["not",["has","code"]],["has","give"],["not",["has","from"]]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":12},["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-7b9c6400","guard":[["hasAny",["annual","code","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","comes"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.before",{"lit":"for"}]]],"mem":null},
{"id":"n-8004d226","guard":[["hasAny",["annual","consumption","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","from"]]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":10},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-9d9b22f0","guard":[["words<=",11],["not",["has","code"]],["has","give"],["not",["has","from"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":12},["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-aa30c94f","guard":[["words<=",11],["not",["has","code"]],["has","give"],["not",["has","from"]]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":12},["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-ad9e7ef2","guard":[["hasAny",["annual","code","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","comes"]]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-cd1d8a97","guard":[["hasAny",["annual","consumption","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","from"]]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":12},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-f9be4f25","guard":[["hasAny",["annual","consumption","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","from"]]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":10},["sense.before",{"lit":"for"}]]],"mem":null},
{"id":"n-10191e46","guard":[["hasAny",["code","element","for","item number","join","joined with","most common letter","most frequent letter","nth","position","separated by","which letter appears most"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.commonLetter",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-254efabc","guard":[["hasAny",["annual","code","first n","how many vowels","item number","nth","number of vowels","position","take","vowel count"]],["has","column"],["has","give"]],"pyramid":["render.and",["transform.takeStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-86d1b010","guard":[["hasAny",["annual","code","first n","how many vowels","item number","nth","number of vowels","position","take","vowel count"]],["has","column"],["has","give"]],"pyramid":["render.list",["transform.takeStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-aebdd025","guard":[["hasAny",["annual","code","first n","how many vowels","item number","nth","number of vowels","position","take","vowel count"]],["has","column"],["has","give"]],"pyramid":["render.lines",["transform.takeStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-e287585c","guard":[["hasAny",["code","element","for","item number","join","joined with","most common letter","most frequent letter","nth","position","separated by","which letter appears most"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.commonLetter",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-49ff508e","guard":[["hasAny",["code","delete","growth","item number","nth","position","remove","strip out","without"]],["has","column"],["words<=",13]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":"per"}]],"mem":null},
{"id":"n-4ad1371c","guard":[["hasAny",["code","delete","growth","item number","nth","position","remove","strip out","without"]],["has","column"],["words<=",13]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":"per"}]],"mem":null},
{"id":"n-55b486c1","guard":[["hasAny",["code","growth","item number","nth","position","separate by","split","split by"]],["has","column"],["words<=",13]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":"per"}]],"mem":null},
{"id":"n-8f0cc391","guard":[["hasAny",["code","growth","item number","nth","position","separate by","split","split by"]],["has","column"],["words<=",13]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":"per"}]],"mem":null},
{"id":"n-a8185cbe","guard":[["hasAny",["code","growth","item number","nth","position","separate by","split","split by"]],["has","column"],["words<=",13]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":"per"}]],"mem":null},
{"id":"n-02eb09f5","guard":[["hasAny",["annual","delete","item number","nth","position","remove","strip out","without"]],["has","column"],["not",["has","name"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-19a0ae8a","guard":[["hasAny",["annual","code","delete","item number","no vowels","nth","position","remove","remove vowels","strip out","without","without vowels"]],["has","column"],["has","give"],["words<=",11]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-2042f6f3","guard":[["hasAny",["annual","code","delete","item number","no vowels","nth","position","remove","remove vowels","strip out","without","without vowels"]],["has","column"],["has","give"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-313221ea","guard":[["hasAny",["contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","comes"]],["not",["has","name"]],["not",["has","power"]],["not",["has","renewables"]],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":12},["sense.lastWord"]]],"mem":null},
{"id":"n-40f9c801","guard":[["hasAny",["contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","comes"]],["not",["has","name"]],["not",["has","power"]],["not",["has","renewables"]],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-7b230d26","guard":[["hasAny",["annual","delete","item number","nth","position","remove","strip out","without"]],["has","column"],["not",["has","name"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-acb9d44a","guard":[["hasAny",["contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","comes"]],["not",["has","name"]],["not",["has","power"]],["not",["has","renewables"]],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":10},["sense.lastWord"]]],"mem":null},
{"id":"n-bee6a5d9","guard":[["hasAny",["annual","code","delete","item number","no vowels","nth","position","remove","remove vowels","strip out","without","without vowels"]],["has","column"],["has","give"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-d35fdb51","guard":[["hasAny",["contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","comes"]],["not",["has","name"]],["not",["has","power"]],["not",["has","renewables"]],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-df56f853","guard":[["hasAny",["contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","comes"]],["not",["has","name"]],["not",["has","power"]],["not",["has","renewables"]],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":10},["sense.lastWord"]]],"mem":null},
{"id":"n-e1fde482","guard":[["hasAny",["contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","comes"]],["not",["has","name"]],["not",["has","power"]],["not",["has","renewables"]],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-e846a64d","guard":[["hasAny",["contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","comes"]],["not",["has","name"]],["not",["has","power"]],["not",["has","renewables"]],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":12},["sense.lastWord"]]],"mem":null},
{"id":"n-fcb4551b","guard":[["hasAny",["contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","comes"]],["not",["has","name"]],["not",["has","power"]],["not",["has","renewables"]],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-222d92bf","guard":[["hasAny",["element","for","item number","join","joined with","nth","position","separated by"]],["not",["has","from"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-6f4f5c6f","guard":[["hasAny",["element","for","item number","join","joined with","nth","position","separated by"]],["not",["has","from"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-e04124f0","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-2e797288","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-37c907e2","guard":[["hasAny",["delete","element","for","item number","nth","position","remove","strip out","without"]],["not",["has","from"]],["has","column"]],"pyramid":["render.code",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-3abd2895","guard":[["hasAny",["delete","element","for","item number","nth","position","remove","strip out","without"]],["not",["has","from"]],["has","column"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-a276c386","guard":[["hasAny",["delete","element","for","item number","nth","position","remove","strip out","without"]],["not",["has","from"]],["has","column"]],"pyramid":["render.code",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-dde8bd70","guard":[["hasAny",["delete","element","for","item number","nth","position","remove","strip out","without"]],["not",["has","from"]],["has","column"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-df56a11b","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["render.list",["transform.split",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-0a309f0a","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-116b51c5","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":12},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-1472a830","guard":[["hasAny",["contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","comes"]],["not",["has","name"]],["not",["has","power"]],["not",["has","renewables"]],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-2b5553e2","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["transform.split",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-2b7a4223","guard":[["hasAny",["contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","comes"]],["not",["has","name"]],["not",["has","power"]],["not",["has","renewables"]],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-3d803bcd","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":10},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-42528367","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-55921f2c","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-564d01ad","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":10},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-685c6ba1","guard":[["hasAny",["contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","comes"]],["not",["has","name"]],["not",["has","power"]],["not",["has","renewables"]],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-6a67b781","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-7714d259","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-8ce424d2","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-8dbbbb10","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-8f597d73","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":10},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-9ae706ff","guard":[["hasAny",["contribution","growth","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["not",["has","comes"]],["not",["has","name"]],["not",["has","power"]],["not",["has","renewables"]],["not",["has","biofuels"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-aad2918e","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":10},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-ace52697","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-b6365391","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-bbb26768","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":12},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-c3b0f407","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-c89f61a6","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":12},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-cb74ea83","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":12},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-d54d2a53","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-f19ad3b1","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","from"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-89ab7b97","guard":[["words<=",7],["not",["has","code"]],["has","column"],["has","give"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]],"mem":null},
{"id":"n-d948e554","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-08547460","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-0a66eaaa","guard":[["hasAny",["append","combine","concatenate","contribution","element","growth","item number","nth","position","put together"]],["has","column"]],"pyramid":["render.str",["transform.concat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-18ec494b","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-2927f94b","guard":[["words<=",7],["not",["has","code"]],["has","column"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is ",{"slot":4},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]],"mem":null},
{"id":"n-31abebaf","guard":[["hasAny",["append","combine","concatenate","contribution","element","growth","item number","nth","position","put together"]],["has","column"]],"pyramid":["render.code",["transform.concat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}]]],"mem":null},
{"id":"n-4392494c","guard":[["hasAny",["append","combine","concatenate","contribution","element","growth","item number","nth","position","put together"]],["has","column"]],"pyramid":["render.str",["transform.concat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]]],"mem":null},
{"id":"n-688ff5e3","guard":[["has","including"],["has","tell"],["has","co₂"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," emissions including land-use ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]],"mem":null},
{"id":"n-697ffa38","guard":[["hasAny",["append","combine","concatenate","contribution","element","growth","item number","nth","position","put together"]],["has","column"]],"pyramid":["render.code",["transform.concat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"unit"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]]],"mem":null},
{"id":"n-8251236d","guard":[["has","other"],["has","share"],["has","what"],["has","column"]],"pyramid":["render.template",{"lit":["The column of Share of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," emissions from other ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]],"mem":null},
{"id":"n-0df0168b","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["transform.split",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-6c8a0353","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-5d715017","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.split",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-b97abf31","guard":[["has","including"],["has","tell"],["has","co₂"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," including land-use ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]],"mem":null},
{"id":"n-d22a8ebe","guard":[["has","including"],["has","tell"],["has","co₂"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," including land-use ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]],"mem":null},
{"id":"n-2d860f48","guard":[["hasAny",["code","consumption","snake case","snakecase","underscores","variable name"]],["has","column"],["words<=",7]],"pyramid":["render.str",["transform.snake",["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-d3c1b58b","guard":[["hasAny",["code","consumption","snake case","snakecase","underscores","variable name"]],["has","column"],["words<=",7]],"pyramid":["render.code",["transform.snake",["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-0b6e4000","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","consumption","snake case","snakecase","title case","underscores","variable name"]],["has","column"],["words<=",7]],"pyramid":["render.code",["transform.title",["transform.snake",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-3fa87adb","guard":[["hasAny",["code","consumption","invert case","snake case","snakecase","swap case","toggle case","underscores","variable name"]],["has","column"],["words<=",7]],"pyramid":["render.str",["transform.swapCase",["transform.snake",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-42c8e70c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","consumption","snake case","snakecase","title case","underscores","variable name"]],["has","column"],["words<=",7]],"pyramid":["render.str",["transform.title",["transform.snake",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-e6d1eb13","guard":[["hasAny",["code","consumption","invert case","snake case","snakecase","swap case","toggle case","underscores","variable name"]],["has","column"],["words<=",7]],"pyramid":["render.code",["transform.swapCase",["transform.snake",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-fc023e8e","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," CO₂ emissions from ",{"slot":1}," is cumulative_",{"slot":2},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-f76d843c","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-25a87472","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-33826a72","guard":[["words<=",9],["has","annual"],["has","from"],["has","column"]],"pyramid":["render.template",{"lit":["The column of Annual ",{"slot":0}," ",{"slot":1}," from ",{"slot":2}," is ",{"slot":3},"_co2."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-3a41344e","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-72cbfdfe","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.pascal",["sense.lastWord"]]],"mem":null},
{"id":"n-77d9d2c9","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The column of Annual ",{"slot":0}," ",{"slot":1}," from ",{"slot":2}," is ",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-a4459e3f","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The column of Annual ",{"slot":0}," ",{"slot":1}," from ",{"slot":2}," is ",{"slot":3},"_co2."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-c5e12c05","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-207663ee","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Annual ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_co2."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-44a68282","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.pascal",["sense.lastWord"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-4922d006","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.camel",["sense.lastWord"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-6661af87","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7bb68df3","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-a0586e14","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b230dbf0","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.lastWord"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-b7559813","guard":[["words<=",9],["has","annual"],["has","from"],["has","column"]],"pyramid":["render.template",{"lit":["The column of Annual ",{"slot":0}," ",{"slot":1}," from ",{"slot":2}," is ",{"slot":3},"_co2."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-e8b11897","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.upper",["sense.lastWord"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-1b5d0f50","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of Cumulative ",{"slot":0}," ",{"slot":1}," from ",{"slot":2}," is ",{"slot":3},"_",{"slot":4},"_co2."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-40882b2f","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is ",{"slot":3},"_",{"slot":4},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-4e55223b","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_co2."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-579016ee","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.lastWord"]]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-9f666df2","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," CO₂ ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-a0ffde68","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," emissions from ",{"slot":2}," is cumulative_",{"slot":3},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.lastWord"]]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-e0fa89b5","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," emissions from ",{"slot":3}," is ",{"slot":4},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-5983130d","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-af7ec838","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," CO₂ ",{"slot":1}," from ",{"slot":2}," is ",{"slot":3},"_",{"slot":4},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-b7be006c","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is cumulative_",{"slot":4},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-6e916146","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-70996d45","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.pascal",["sense.lastWord"]]],"mem":null},
{"id":"n-72f2b71b","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-91137c7b","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-cc239a55","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-d437b5c2","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-e11dfb0d","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-0cd6be40","guard":[["words<=",9],["has","annual"],["has","from"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-10508aad","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.pascal",["sense.lastWord"]]],"mem":null},
{"id":"n-13b821f9","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-2fa3e212","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3ef1f48f","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.lastWord"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-5d3ef85d","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.upper",["sense.lastWord"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-8251e346","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-84541a3a","guard":[["has","cumulative"],["words<=",12],["has","tell"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-8e74d316","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-b649d355","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-c8c83783","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-de0db744","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e0a3acc1","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-e2ac2059","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.pascal",["sense.lastWord"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-e72aa4cb","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-ea2ba447","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-201547f4","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-2ce6faac","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-38fdafd0","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.lastWord"]]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-5d3f64bf","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.lastWord"]]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-72efeee0","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.pascal",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-8cc89426","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-91e91f53","guard":[["words<=",9],["has","from"],["has","annual"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-a5164478","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bf20308c","guard":[["words<=",9],["has","annual"],["has","from"],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is ",{"slot":5},"_co2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-c95e2c0c","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-d5759357","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-e78ad451","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.camel",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-eec6d2b4","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-f38534d0","guard":[["words<=",10],["has","cumulative"],["has","what"],["has","column"],["not",["has","cement"]],["not",["has","oil"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is cumulative_",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-0cb372ed","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-513b8fa3","guard":[["has","cumulative"],["has","tell"],["words<=",12],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," from ",{"slot":3}," is ",{"slot":4},"_",{"slot":5},"_co2."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-e4fde349","guard":[["words<=",10],["has","cumulative"],["has","what"],["has","column"],["not",["has","cement"]],["not",["has","oil"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," from ",{"slot":4}," is cumulative_",{"slot":5},"_co2."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-033312fa","guard":[["hasAny",["code","divide","divided by","first n","over","quotient","split","take"]],["has","column"]],"pyramid":["render.lines",["transform.takeStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.div",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-18c50e54","guard":[["hasAny",["code","divide","divided by","first n","over","quotient","split","take","top"]],["has","column"]],"pyramid":["render.list",["transform.takeStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.div",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-a44cb96e","guard":[["hasAny",["code","divide","divided by","first n","quotient","split","take","top"]],["has","column"]],"pyramid":["render.lines",["transform.takeStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.div",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-cc4e9b2d","guard":[["hasAny",["code","divide","divided by","first n","quotient","split","take","top"]],["has","column"]],"pyramid":["render.list",["transform.takeStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.div",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-d37cff8a","guard":[["hasAny",["code","divide","divided by","first n","quotient","split","take","top"]],["has","column"]],"pyramid":["render.and",["transform.takeStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.div",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-dc526852","guard":[["hasAny",["code","divide","divided by","first n","over","quotient","split","take"]],["has","column"]],"pyramid":["render.and",["transform.takeStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.div",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-f6571be8","guard":[["hasAny",["code","divide","divided by","first n","over","quotient","split","take"]],["has","column"]],"pyramid":["render.list",["transform.takeStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.div",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-5ea5398e","guard":[["hasAny",["backwards","code","reverse","reverse order","reversed"]],["has","column"]],"pyramid":["render.and",["transform.reverseStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]]],"mem":null},
{"id":"n-7010ebbb","guard":[["hasAny",["backwards","code","reverse","reverse order","reversed"]],["has","column"]],"pyramid":["render.list",["transform.reverseStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]]],"mem":null},
{"id":"n-8f0926a9","guard":[["hasAny",["backwards","code","reverse","reverse order","reversed"]],["has","column"]],"pyramid":["render.lines",["transform.reverseStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]]],"mem":null},
{"id":"n-09724dfd","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":"column"}]],"mem":null},
{"id":"n-0a0bd587","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":"annual"}]],"mem":null},
{"id":"n-252cd91f","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":"co₂"}]],"mem":null},
{"id":"n-3ebe76d2","guard":[["hasAny",["code","item number","nth","position"]],["has","column"]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]],"mem":null},
{"id":"n-5d9d7c90","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":"annual"}]],"mem":null},
{"id":"n-5f1c0c06","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":"per"}]],"mem":null},
{"id":"n-61ffbd6e","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":"per"}]],"mem":null},
{"id":"n-683df230","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":"co₂"}]],"mem":null},
{"id":"n-81dbd0da","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.text"]]],"mem":null},
{"id":"n-9cc68215","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.text"]]],"mem":null},
{"id":"n-9e466c05","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":"global"}]],"mem":null},
{"id":"n-a3663304","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.lastWord"]]],"mem":null},
{"id":"n-a97f6ef9","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":"global"}]],"mem":null},
{"id":"n-b2e7db61","guard":[["hasAny",["code","item number","nth","position"]],["has","column"]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]],"mem":null},
{"id":"n-c08a6315","guard":[["hasAny",["code","item number","nth","position"]],["has","column"]],"pyramid":["render.code",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]],"mem":null},
{"id":"n-dd49cc74","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.lastWord"]]],"mem":null},
{"id":"n-de3d35df","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":"column"}]],"mem":null},
{"id":"n-de85d7c5","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":"emissions"}]],"mem":null},
{"id":"n-e7756e00","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":"emissions"}]],"mem":null},
{"id":"n-e9443e14","guard":[["hasAny",["code","item number","nth","position"]],["has","column"]],"pyramid":["render.code",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]],"mem":null},
{"id":"n-021d0148","guard":[["hasAny",["camel case","camelcase","code","join","joined with","lower camel case","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.camel",["sense.text"]]]],"mem":null},
{"id":"n-042a7036","guard":[["hasAny",["abbreviate","acronym","code","join","joined with","separated by","short form"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.acronym",["sense.text"]]]],"mem":null},
{"id":"n-05212cde","guard":[["hasAny",["code","join","joined with","no vowels","remove vowels","separated by","without vowels"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.noVowels",["sense.text"]]]],"mem":null},
{"id":"n-126f098b","guard":[["hasAny",["all caps","capital letters","capitals","code","join","joined with","separated by","upper case","uppercase"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.upper",["sense.text"]]]],"mem":null},
{"id":"n-1382b8e3","guard":[["hasAny",["all caps","capital letters","capitals","code","join","joined with","separated by","upper case","uppercase"]],["has","column"]],"pyramid":["render.str",["transform.upper",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.text"]]]],"mem":null},
{"id":"n-1aa5d877","guard":[["hasAny",["code","join","joined with","longest","longest one","longest word","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-207c48c4","guard":[["hasAny",["code","invert case","item number","nth","position","swap case","toggle case"]],["has","column"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]],"mem":null},
{"id":"n-212ccbf7","guard":[["hasAny",["code","join","joined with","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.before",{"lit":"column"}]]],"mem":null},
{"id":"n-218b9bcc","guard":[["hasAny",["backwards","code","join","joined with","mirror","reverse","reversed","separated by","spell backwards"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.reverse",["sense.lastWord"]]]],"mem":null},
{"id":"n-232540bb","guard":[["hasAny",["code","join","joined with","lower case","lowercase","separated by","small letters"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.lower",["sense.text"]]]],"mem":null},
{"id":"n-297ac307","guard":[["hasAny",["backwards","code","join","joined with","mirror","reverse","reversed","separated by","spell backwards"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.reverse",["sense.text"]]]],"mem":null},
{"id":"n-29ae22e0","guard":[["hasAny",["code","invert case","item number","nth","position","swap case","toggle case"]],["has","column"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-29b0f174","guard":[["hasAny",["code","invert case","join","joined with","separated by","swap case","toggle case"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.swapCase",["sense.text"]]]],"mem":null},
{"id":"n-2bb41ee5","guard":[["hasAny",["code","item number","nth","position","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.snake",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-2c637c4a","guard":[["hasAny",["code","join","joined with","separated by","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.snake",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.lastWord"]]]],"mem":null},
{"id":"n-2f2c8929","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-30ebb391","guard":[["hasAny",["for","join","joined with","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.after",{"lit":"emissions"}]]],"mem":null},
{"id":"n-31331ba6","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-36af8fc9","guard":[["hasAny",["alphabetize the letters","code","join","joined with","letters in order","separated by","sort the letters"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.sortLetters",["sense.text"]]]],"mem":null},
{"id":"n-375ae017","guard":[["hasAny",["class name","code","join","joined with","pascal case","pascalcase","separated by","upper camel case"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.pascal",["sense.text"]]]],"mem":null},
{"id":"n-39bb84d1","guard":[["hasAny",["all caps","capital letters","capitals","code","join","joined with","separated by","upper case","uppercase"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.upper",["sense.text"]]]],"mem":null},
{"id":"n-3b962f84","guard":[["hasAny",["code","join","joined with","lower case","lowercase","separated by","small letters"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.lower",["sense.text"]]]],"mem":null},
{"id":"n-420119d5","guard":[["hasAny",["code","join","joined with","separated by","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.snake",["sense.text"]]]],"mem":null},
{"id":"n-4536f09e","guard":[["hasAny",["code","join","joined with","reverse the words","reverse word order","separated by","words backwards"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.reverseWords",["sense.text"]]]],"mem":null},
{"id":"n-4a4119db","guard":[["hasAny",["code","dashes","hyphens","join","joined with","kebab case","kebabcase","separated by","slug"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.kebab",["sense.text"]]]],"mem":null},
{"id":"n-51b68470","guard":[["hasAny",["code","invert case","item number","nth","position","swap case","toggle case"]],["has","column"]],"pyramid":["render.code",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]],"mem":null},
{"id":"n-52ef759c","guard":[["hasAny",["code","join","joined with","reverse the words","reverse word order","separated by","words backwards"]],["has","column"]],"pyramid":["render.str",["transform.reverseWords",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.text"]]]],"mem":null},
{"id":"n-55fda010","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","join","joined with","separated by","title case"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.title",["sense.text"]]]],"mem":null},
{"id":"n-5aa673fb","guard":[["hasAny",["code","invert case","join","joined with","separated by","swap case","toggle case"]],["has","column"]],"pyramid":["render.str",["transform.swapCase",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.lastWord"]]]],"mem":null},
{"id":"n-5ac9bb58","guard":[["hasAny",["code","join","joined with","separated by","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.snake",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.text"]]]],"mem":null},
{"id":"n-604ea90a","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-60b5f2ab","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-61f120fd","guard":[["hasAny",["backwards","code","join","joined with","reverse","reverse order","reversed","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]],["sense.text"]]],"mem":null},
{"id":"n-6319b8b7","guard":[["hasAny",["camel case","camelcase","code","join","joined with","lower camel case","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.camel",["sense.text"]]]],"mem":null},
{"id":"n-63e20c89","guard":[["hasAny",["annual","consonant count","how many consonants","item number","nth","number of consonants","position"]],["has","give"]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-647dbd35","guard":[["hasAny",["code","invert case","join","joined with","separated by","swap case","toggle case"]],["has","column"]],"pyramid":["render.code",["transform.swapCase",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.lastWord"]]]],"mem":null},
{"id":"n-6f101679","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","nth","position","title case"]],["has","column"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]],"mem":null},
{"id":"n-700db490","guard":[["hasAny",["all caps","capital letters","capitals","code","join","joined with","separated by","upper case","uppercase"]],["has","column"]],"pyramid":["render.code",["transform.upper",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.text"]]]],"mem":null},
{"id":"n-7139455d","guard":[["hasAny",["code","join","joined with","separated by","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.snake",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.lastWord"]]]],"mem":null},
{"id":"n-71b0e4b0","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.base64",["sense.text"]]]],"mem":null},
{"id":"n-75aa10f3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","join","joined with","separated by","title case"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.title",["sense.text"]]]],"mem":null},
{"id":"n-75d7225e","guard":[["hasAny",["code","join","joined with","separated by","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.snake",["sense.text"]]]],"mem":null},
{"id":"n-7a406be4","guard":[["hasAny",["code","join","joined with","separated by"]]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-8588c300","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","join","joined with","separated by","title case"]],["has","column"]],"pyramid":["render.code",["transform.title",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.text"]]]],"mem":null},
{"id":"n-860db7e3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","nth","position","title case"]],["has","column"]],"pyramid":["render.code",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]],"mem":null},
{"id":"n-8871d03e","guard":[["hasAny",["backwards","code","join","joined with","mirror","reverse","reversed","separated by","spell backwards"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.reverse",["sense.lastWord"]]]],"mem":null},
{"id":"n-9345ec33","guard":[["hasAny",["code","dashes","hyphens","join","joined with","kebab case","kebabcase","separated by","slug"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.kebab",["sense.text"]]]],"mem":null},
{"id":"n-9737ff8c","guard":[["hasAny",["including","join","joined with","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.after",{"lit":"annual"}]]],"mem":null},
{"id":"n-99140a27","guard":[["hasAny",["as a roman numeral","code","in roman numerals","join","joined with","roman numeral","separated by","to roman"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["compute.toRoman",["sense.wordCount"]]]],"mem":null},
{"id":"n-9aed012f","guard":[["hasAny",["alphabetize the letters","code","join","joined with","letters in order","separated by","sort the letters"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.sortLetters",["sense.text"]]]],"mem":null},
{"id":"n-9eeab815","guard":[["hasAny",["code","join","joined with","most common letter","most frequent letter","separated by","which letter appears most"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.commonLetter",["sense.text"]]]],"mem":null},
{"id":"n-9f6fe9ec","guard":[["hasAny",["code","invert case","item number","nth","position","swap case","toggle case"]],["has","column"]],"pyramid":["render.code",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-a6007373","guard":[["hasAny",["abbreviate","acronym","code","join","joined with","separated by","short form"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.acronym",["sense.text"]]]],"mem":null},
{"id":"n-a62776d0","guard":[["hasAny",["for","join","joined with","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.after",{"lit":"emissions"}]]],"mem":null},
{"id":"n-a8e94e45","guard":[["hasAny",["code","join","joined with","no vowels","remove vowels","separated by","without vowels"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.noVowels",["sense.text"]]]],"mem":null},
{"id":"n-aa3d19fc","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-ac648984","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.base64",["sense.text"]]]],"mem":null},
{"id":"n-adfa8e1c","guard":[["hasAny",["code","join","joined with","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-b14ce8e4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","nth","position","title case"]],["has","column"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-b1b6da3c","guard":[["hasAny",["code","join","joined with","longest","longest one","longest word","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-c0c2f161","guard":[["hasAny",["code","join","joined with","separated by","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.snake",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.text"]]]],"mem":null},
{"id":"n-c69072d1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","join","joined with","separated by","title case"]],["has","column"]],"pyramid":["render.str",["transform.title",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.text"]]]],"mem":null},
{"id":"n-c740938a","guard":[["hasAny",["code","join","joined with","separated by"]]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.before",{"lit":"column"}]]],"mem":null},
{"id":"n-c89db922","guard":[["hasAny",["code","first letters of the name","initials","join","joined with","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.initials",["sense.text"]]]],"mem":null},
{"id":"n-cc6b0c27","guard":[["hasAny",["code","invert case","join","joined with","separated by","swap case","toggle case"]],["has","column"]],"pyramid":["render.str",["transform.swapCase",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.text"]]]],"mem":null},
{"id":"n-cf8155e0","guard":[["hasAny",["code","first letters of the name","initials","join","joined with","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.initials",["sense.text"]]]],"mem":null},
{"id":"n-cfb06736","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.base64",["sense.lastWord"]]]],"mem":null},
{"id":"n-d1c3b83d","guard":[["hasAny",["backwards","code","join","joined with","reverse","reverse order","reversed","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]],["sense.lastWord"]]],"mem":null},
{"id":"n-d46ae598","guard":[["hasAny",["class name","code","join","joined with","pascal case","pascalcase","separated by","upper camel case"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.pascal",["sense.text"]]]],"mem":null},
{"id":"n-d4cde874","guard":[["hasAny",["alphabetize the letters","code","join","joined with","letters in order","separated by","sort the letters"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.sortLetters",["sense.lastWord"]]]],"mem":null},
{"id":"n-d50853e9","guard":[["hasAny",["code","join","joined with","most common letter","most frequent letter","separated by","which letter appears most"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.commonLetter",["sense.text"]]]],"mem":null},
{"id":"n-d72d3f38","guard":[["hasAny",["code","item number","nth","position","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.snake",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-dac0ce95","guard":[["hasAny",["code","invert case","join","joined with","separated by","swap case","toggle case"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.swapCase",["sense.text"]]]],"mem":null},
{"id":"n-dbe9b018","guard":[["hasAny",["code","join","joined with","reverse the words","reverse word order","separated by","words backwards"]],["has","column"]],"pyramid":["render.code",["transform.reverseWords",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.text"]]]],"mem":null},
{"id":"n-de0e5744","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","nth","position","title case"]],["has","column"]],"pyramid":["render.code",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-dec12b66","guard":[["hasAny",["backwards","code","join","joined with","mirror","reverse","reversed","separated by","spell backwards"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.reverse",["sense.text"]]]],"mem":null},
{"id":"n-df05ce11","guard":[["hasAny",["as a roman numeral","code","in roman numerals","join","joined with","roman numeral","separated by","to roman"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["compute.toRoman",["sense.wordCount"]]]],"mem":null},
{"id":"n-e1f47ae5","guard":[["hasAny",["code","join","joined with","reverse the words","reverse word order","separated by","words backwards"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.reverseWords",["sense.text"]]]],"mem":null},
{"id":"n-e21913c1","guard":[["hasAny",["annual","consonant count","how many consonants","item number","nth","number of consonants","position"]],["has","give"]],"pyramid":["render.code",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-e37f345b","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-ec26f46f","guard":[["hasAny",["including","join","joined with","separated by"]],["has","give"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.after",{"lit":"annual"}]]],"mem":null},
{"id":"n-ef375cc1","guard":[["hasAny",["code","invert case","join","joined with","separated by","swap case","toggle case"]],["has","column"]],"pyramid":["render.code",["transform.swapCase",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["sense.text"]]]],"mem":null},
{"id":"n-f23265c2","guard":[["hasAny",["alphabetize the letters","code","join","joined with","letters in order","separated by","sort the letters"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.sortLetters",["sense.lastWord"]]]],"mem":null},
{"id":"n-f9cf11b4","guard":[["hasAny",["backwards","code","join","joined with","reverse","reverse order","reversed","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["transform.reverseStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]],["sense.lastWord"]]],"mem":null},
{"id":"n-fd941c64","guard":[["hasAny",["code","join","joined with","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.base64",["sense.lastWord"]]]],"mem":null},
{"id":"n-ff3b6053","guard":[["hasAny",["backwards","code","join","joined with","reverse","reverse order","reversed","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["transform.reverseStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]],["sense.text"]]],"mem":null},
{"id":"n-1a0c6d93","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","invert case","item number","nth","position","swap case","title case","toggle case"]],["has","column"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-2b63a7d6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","invert case","item number","nth","position","swap case","title case","toggle case"]],["has","column"]],"pyramid":["render.code",["transform.swapCase",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-2beac7c1","guard":[["hasAny",["code","invert case","item number","nth","position","snake case","snakecase","swap case","toggle case","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.snake",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-2e27d420","guard":[["hasAny",["code","invert case","item number","nth","position","snake case","snakecase","swap case","toggle case","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.swapCase",["transform.snake",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-3bd9dd95","guard":[["hasAny",["code","invert case","item number","nth","position","snake case","snakecase","swap case","toggle case","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.snake",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-7f127ae6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","invert case","item number","nth","position","swap case","title case","toggle case"]],["has","column"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-7f9d4e7c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","nth","position","snake case","snakecase","title case","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.title",["transform.snake",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-9d68ee17","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","nth","position","snake case","snakecase","title case","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.title",["transform.snake",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-bcdd3fdc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","invert case","item number","nth","position","swap case","title case","toggle case"]],["has","column"]],"pyramid":["render.code",["transform.swapCase",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-c3a5b79a","guard":[["hasAny",["code","invert case","item number","nth","position","snake case","snakecase","swap case","toggle case","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.swapCase",["transform.snake",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-02043cdd","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],{"lit":"column"}]],"mem":null},
{"id":"n-027dade4","guard":[["hasAny",["code","item number","normalise","normalize","nth","position","simplify the text","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.snake",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":1}]]],"mem":null},
{"id":"n-039dd365","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},{"lit":"per"}]],"mem":null},
{"id":"n-04d57e8c","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},{"lit":"column"}]],"mem":null},
{"id":"n-055d7d7f","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},{"lit":"annual"}]],"mem":null},
{"id":"n-075f8d3e","guard":[["hasAny",["code","delete","item number","longest","longest one","longest word","nth","position","remove","strip out","without"]],["has","column"]],"pyramid":["render.code",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-07efa6de","guard":[["hasAny",["code","delete","item number","no vowels","nth","position","remove","remove vowels","strip out","without","without vowels"]],["has","column"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-07f25192","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-0dfac9eb","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-0e7036e3","guard":[["hasAny",["code","delete","item number","longest","longest one","longest word","nth","position","remove","strip out","without"]],["has","column"]],"pyramid":["render.code",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-0f37d3da","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-1466072e","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},{"lit":"annual"}]],"mem":null},
{"id":"n-16509aea","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},{"lit":"annual"}]],"mem":null},
{"id":"n-18adf8c3","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],{"lit":"per"}]],"mem":null},
{"id":"n-19d6bb85","guard":[["hasAny",["code","invert case","item number","nth","position","swap case","toggle case"]],["has","column"]],"pyramid":["render.list",["iterate.repeat",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]],{"lit":1}]],"mem":null},
{"id":"n-1e927880","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},{"lit":"emissions"}]],"mem":null},
{"id":"n-1f8ee26d","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},{"lit":"column"}]],"mem":null},
{"id":"n-20505af4","guard":[["hasAny",["code","digit count","how many digits","item number","nth","number of digits","position"]],["has","column"]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-25aead23","guard":[["hasAny",["code","delete","item number","no vowels","nth","position","remove","remove vowels","strip out","without","without vowels"]],["has","column"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-27a668a0","guard":[["hasAny",["characters from","code","item number","letters from to","nth","position","slice of the text","substring"]],["has","column"]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-297b0c2e","guard":[["hasAny",["code","digit count","how many digits","item number","nth","number of digits","position"]],["has","column"]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-2a5dff1e","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},{"lit":"annual"}]],"mem":null},
{"id":"n-2acdfef9","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],{"lit":"co₂"}]],"mem":null},
{"id":"n-36264ebc","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},{"lit":"annual"}]],"mem":null},
{"id":"n-39c95023","guard":[["hasAny",["characters from","code","item number","letters from to","nth","position","slice of the text","substring"]],["has","column"]],"pyramid":["render.code",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-3d725bbc","guard":[["hasAny",["code","digit count","how many digits","item number","nth","number of digits","position"]],["has","column"]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-3e9a61cb","guard":[["hasAny",["characters from","code","item number","letters from to","nth","position","slice of the text","substring"]],["has","column"]],"pyramid":["render.code",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-3f480c49","guard":[["hasAny",["characters from","code","item number","letters from to","nth","position","slice of the text","substring"]],["has","column"]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-44317b3f","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},{"lit":"column"}]],"mem":null},
{"id":"n-4875525f","guard":[["hasAny",["code","delete","item number","longest","longest one","longest word","nth","position","remove","strip out","without"]],["has","column"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-499bb6ac","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},{"lit":"emissions"}]],"mem":null},
{"id":"n-4aa99393","guard":[["hasAny",["code","invert case","item number","nth","position","swap case","toggle case"]],["has","column"]],"pyramid":["render.list",["iterate.repeat",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]],{"lit":1}]],"mem":null},
{"id":"n-4c4340c7","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},{"lit":"per"}]],"mem":null},
{"id":"n-4e3f2ce6","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],{"lit":"co₂"}]],"mem":null},
{"id":"n-53868ec5","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},{"lit":"emissions"}]],"mem":null},
{"id":"n-5833391d","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-58e399da","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],{"lit":"per"}]],"mem":null},
{"id":"n-5aede983","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],{"lit":"annual"}]],"mem":null},
{"id":"n-5dd6e4c7","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},{"lit":"per"}]],"mem":null},
{"id":"n-5fad45cd","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["sense.text"]]],"mem":null},
{"id":"n-606ad5ab","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],{"lit":"global"}]],"mem":null},
{"id":"n-6110e4d7","guard":[["hasAny",["characters from","code","item number","letters from to","nth","position","slice of the text","substring"]],["has","column"]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-62bc7739","guard":[["hasAny",["code","delete","item number","no vowels","nth","position","remove","remove vowels","strip out","without","without vowels"]],["has","column"]],"pyramid":["render.code",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-632fbcf3","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-640aac90","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},{"lit":"global"}]],"mem":null},
{"id":"n-64c213d1","guard":[["hasAny",["code","delete","invert case","item number","nth","position","remove","strip out","swap case","toggle case","without"]],["has","column"]],"pyramid":["render.code",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.swapCase",["sense.lastWord"]]]],"mem":null},
{"id":"n-664baedb","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],{"lit":"emissions"}]],"mem":null},
{"id":"n-66f66db0","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},{"lit":"global"}]],"mem":null},
{"id":"n-68e767ef","guard":[["hasAny",["code","item number","no vowels","nth","position","remove vowels","separate by","split","split by","without vowels"]],["has","column"]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-6ad35c18","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-761e4a6d","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},{"lit":"emissions"}]],"mem":null},
{"id":"n-77f208c2","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],{"lit":"per"}]],"mem":null},
{"id":"n-78731a77","guard":[["hasAny",["code","delete","invert case","item number","nth","position","remove","strip out","swap case","toggle case","without"]],["has","column"]],"pyramid":["render.code",["transform.remove",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]],["sense.lastWord"]]],"mem":null},
{"id":"n-7a763a8e","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},{"lit":"per"}]],"mem":null},
{"id":"n-7ac936c3","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],{"lit":"annual"}]],"mem":null},
{"id":"n-7c4cd27e","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},{"lit":"annual"}]],"mem":null},
{"id":"n-7c8dd062","guard":[["hasAny",["characters from","code","item number","letters from to","nth","position","slice of the text","substring"]],["has","column"]],"pyramid":["render.code",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-7ff95a2f","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},{"lit":"global"}]],"mem":null},
{"id":"n-813355ff","guard":[["hasAny",["code","copies","digit count","how many digits","item number","nth","number of digits","position","repeat","say it times"]],["has","column"]],"pyramid":["render.str",["transform.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-814b20ce","guard":[["hasAny",["code","item number","no vowels","nth","position","remove vowels","separate by","split","split by","without vowels"]],["has","column"]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-83b90490","guard":[["hasAny",["code","item number","no vowels","nth","position","remove vowels","separate by","split","split by","without vowels"]],["has","column"]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-859a8130","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},{"lit":"annual"}]],"mem":null},
{"id":"n-85ea1a4e","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},{"lit":"emissions"}]],"mem":null},
{"id":"n-85eaf3fa","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],{"lit":"global"}]],"mem":null},
{"id":"n-88098ab8","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},{"lit":"emissions"}]],"mem":null},
{"id":"n-90dd1b1d","guard":[["hasAny",["code","copies","digit count","how many digits","item number","nth","number of digits","position","repeat","say it times"]],["has","column"]],"pyramid":["render.str",["transform.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-915eeb4b","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["sense.text"]]],"mem":null},
{"id":"n-93524eb3","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["sense.lastWord"]]],"mem":null},
{"id":"n-943e92bb","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},{"lit":"column"}]],"mem":null},
{"id":"n-94c6c2f3","guard":[["hasAny",["characters from","code","item number","letters from to","nth","position","slice of the text","substring"]],["has","column"]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-9692b505","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","nth","position","title case"]],["has","column"]],"pyramid":["render.list",["iterate.repeat",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]],{"lit":1}]],"mem":null},
{"id":"n-9dade8f1","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],{"lit":"emissions"}]],"mem":null},
{"id":"n-9e1e4aac","guard":[["hasAny",["code","item number","normalise","normalize","nth","position","simplify the text","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.snake",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":2}]]],"mem":null},
{"id":"n-a022e4c3","guard":[["hasAny",["code","item number","nth","position","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.list",["iterate.repeat",["transform.snake",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]],{"lit":1}]],"mem":null},
{"id":"n-a06f0115","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-a180c8b7","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},{"lit":"emissions"}]],"mem":null},
{"id":"n-a4a74d5c","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],{"lit":"annual"}]],"mem":null},
{"id":"n-a901454b","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],{"lit":"emissions"}]],"mem":null},
{"id":"n-abfae499","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-ac0abff5","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-ace63fb5","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["sense.lastWord"]]],"mem":null},
{"id":"n-acedc9b7","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],{"lit":"global"}]],"mem":null},
{"id":"n-ae6b23e5","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-aee89789","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},{"lit":"global"}]],"mem":null},
{"id":"n-aff24707","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},{"lit":"emissions"}]],"mem":null},
{"id":"n-b2645649","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},{"lit":"per"}]],"mem":null},
{"id":"n-b8b2cfbe","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],{"lit":"column"}]],"mem":null},
{"id":"n-b917bd59","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["sense.lastWord"]]],"mem":null},
{"id":"n-ba3f0736","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},{"lit":"column"}]],"mem":null},
{"id":"n-bc84f871","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-bd057136","guard":[["hasAny",["code","copies","digit count","how many digits","item number","nth","number of digits","position","repeat","say it times"]],["has","column"]],"pyramid":["render.code",["transform.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-be3d103e","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],{"lit":"emissions"}]],"mem":null},
{"id":"n-c0ad7ecf","guard":[["hasAny",["code","delete","item number","no vowels","nth","position","remove","remove vowels","strip out","without","without vowels"]],["has","column"]],"pyramid":["render.code",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-c1d5d60c","guard":[["hasAny",["code","delete","item number","longest","longest one","longest word","nth","position","remove","strip out","without"]],["has","column"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-c4fdcb80","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},{"lit":"per"}]],"mem":null},
{"id":"n-c60f0df3","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},{"lit":"per"}]],"mem":null},
{"id":"n-c74f9889","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],{"lit":"global"}]],"mem":null},
{"id":"n-c996f5f5","guard":[["hasAny",["code","item number","no vowels","nth","position","remove vowels","separate by","split","split by","without vowels"]],["has","column"]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-cd021040","guard":[["hasAny",["characters from","code","item number","letters from to","nth","position","slice of the text","substring"]],["has","column"]],"pyramid":["render.code",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-ceb3448a","guard":[["hasAny",["code","item number","normalise","normalize","nth","position","simplify the text","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.snake",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":1}]]],"mem":null},
{"id":"n-d1207e93","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],{"lit":"column"}]],"mem":null},
{"id":"n-d22f2d18","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["sense.lastWord"]]],"mem":null},
{"id":"n-d2a468b2","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],{"lit":"co₂"}]],"mem":null},
{"id":"n-d7887ee9","guard":[["hasAny",["code","item number","no vowels","nth","position","remove vowels","separate by","split","split by","without vowels"]],["has","column"]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-d82b43d1","guard":[["hasAny",["code","item number","no vowels","nth","position","remove vowels","separate by","split","split by","without vowels"]],["has","column"]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-d83dfd0e","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},{"lit":"annual"}]],"mem":null},
{"id":"n-d901bbb3","guard":[["hasAny",["code","digit count","how many digits","item number","nth","number of digits","position"]],["has","column"]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-d9231337","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["sense.text"]]],"mem":null},
{"id":"n-dd4e46d2","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["sense.lastWord"]]],"mem":null},
{"id":"n-dd84b2a7","guard":[["hasAny",["code","item number","normalise","normalize","nth","position","simplify the text","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.snake",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":2}]]],"mem":null},
{"id":"n-dfc6c364","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],{"lit":"annual"}]],"mem":null},
{"id":"n-e2912902","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],{"lit":"column"}]],"mem":null},
{"id":"n-e2b95c5c","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],{"lit":"co₂"}]],"mem":null},
{"id":"n-e3668b76","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},{"lit":"column"}]],"mem":null},
{"id":"n-e3ca36cd","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["sense.text"]]],"mem":null},
{"id":"n-e50d4023","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},{"lit":"per"}]],"mem":null},
{"id":"n-e5c704a6","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},{"lit":"column"}]],"mem":null},
{"id":"n-e605d898","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],{"lit":"per"}]],"mem":null},
{"id":"n-e62ee52e","guard":[["hasAny",["code","digit count","how many digits","item number","nth","number of digits","position"]],["has","column"]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-e8dade14","guard":[["hasAny",["code","digit count","how many digits","item number","nth","number of digits","position"]],["has","column"]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-ebe36a82","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","nth","position","title case"]],["has","column"]],"pyramid":["render.list",["iterate.repeat",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]],{"lit":1}]],"mem":null},
{"id":"n-eeeb61c1","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},{"lit":"column"}]],"mem":null},
{"id":"n-f0f06ae0","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["sense.lastWord"]]],"mem":null},
{"id":"n-f566cbda","guard":[["hasAny",["code","copies","digit count","how many digits","item number","nth","number of digits","position","repeat","say it times"]],["has","column"]],"pyramid":["render.code",["transform.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-f57e87a0","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["sense.lastWord"]]],"mem":null},
{"id":"n-fba05c46","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-fbc3dc86","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["sense.lastWord"]]],"mem":null},
{"id":"n-060b0fb6","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-0a9f7bce","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-0da5428f","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":12},["sense.after",{"lit":"annual"}]]],"mem":null},
{"id":"n-1013f75a","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-1682cc23","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.after",{"lit":"emissions"}]]],"mem":null},
{"id":"n-16d84aca","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-16f9a881","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-1ad51a36","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":12},["sense.before",{"lit":"annual"}]]],"mem":null},
{"id":"n-1b30ef98","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-209f415b","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":10},["sense.after",{"lit":"annual"}]]],"mem":null},
{"id":"n-26b5182a","guard":[["hasAny",["annual","change to","item number","nth","position","replace","substitute","swap"]],["has","column"]],"pyramid":["render.code",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.lastWord"],["sense.before",{"lit":"for"}]]],"mem":null},
{"id":"n-28060114","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-291026f1","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["sense.after",{"lit":"emissions"}]]],"mem":null},
{"id":"n-2aab708c","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["sense.after",{"lit":"annual"}]]],"mem":null},
{"id":"n-323a608b","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-33324295","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["sense.after",{"lit":"annual"}]]],"mem":null},
{"id":"n-37a005cb","guard":[["hasAny",["code","element","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-3a588168","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":10},["sense.after",{"lit":"emissions"}]]],"mem":null},
{"id":"n-3c641d17","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.after",{"lit":"annual"}]]],"mem":null},
{"id":"n-404ed0c5","guard":[["hasAny",["annual","change to","item number","nth","position","replace","substitute","swap"]],["has","column"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.lastWord"],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-4466d8aa","guard":[["hasAny",["code","element","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-45311407","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["sense.after",{"lit":"annual"}]]],"mem":null},
{"id":"n-4f3508d8","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-52708bb9","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["sense.after",{"lit":"annual"}]]],"mem":null},
{"id":"n-547e3c59","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["sense.after",{"lit":"emissions"}]]],"mem":null},
{"id":"n-54914954","guard":[["hasAny",["code","element","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-573960f5","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-5909bf05","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["sense.before",{"lit":"annual"}]]],"mem":null},
{"id":"n-5b1b18c9","guard":[["hasAny",["code","element","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-5b92fa0f","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.after",{"lit":"emissions"}]]],"mem":null},
{"id":"n-5dc568d2","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-65c72d5a","guard":[["hasAny",["code","element","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-677b5228","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-67c0d071","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-6e298cfc","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["sense.after",{"lit":"emissions"}]]],"mem":null},
{"id":"n-72b5074b","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["sense.before",{"lit":"annual"}]]],"mem":null},
{"id":"n-744dbd68","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-75db7935","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-7a61057c","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]],"mem":null},
{"id":"n-7e2d361a","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-7ff67f51","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-802dadd1","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-8221c712","guard":[["hasAny",["annual","change to","item number","nth","position","replace","substitute","swap"]],["has","column"]],"pyramid":["render.code",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.lastWord"],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-82e433f8","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-91bac9ba","guard":[["hasAny",["code","element","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-9a0aaa5f","guard":[["hasAny",["code","element","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-9cd2a9b6","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":10},["sense.after",{"lit":"annual"}]]],"mem":null},
{"id":"n-a019620b","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":12},["sense.after",{"lit":"emissions"}]]],"mem":null},
{"id":"n-a04f59d4","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":12},["sense.after",{"lit":"annual"}]]],"mem":null},
{"id":"n-a426062b","guard":[["hasAny",["code","element","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-a581e243","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.before",{"lit":"annual"}]]],"mem":null},
{"id":"n-ab6f211f","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["sense.before",{"lit":"annual"}]]],"mem":null},
{"id":"n-aba7e771","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-aee09543","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":10},["sense.before",{"lit":"annual"}]]],"mem":null},
{"id":"n-b42d6b97","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-b4583e05","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.before",{"lit":"annual"}]]],"mem":null},
{"id":"n-bac07129","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-c0cc4e2f","guard":[["hasAny",["code","element","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-c11ab7c0","guard":[["hasAny",["code","element","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-c5c756dc","guard":[["hasAny",["annual","change to","item number","nth","position","replace","substitute","swap"]],["has","column"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.lastWord"],["sense.before",{"lit":"for"}]]],"mem":null},
{"id":"n-c6f06a5c","guard":[["hasAny",["code","element","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-c7ba9b41","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":10},["sense.before",{"lit":"annual"}]]],"mem":null},
{"id":"n-c97a7e85","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-cbd08209","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["sense.before",{"lit":"annual"}]]],"mem":null},
{"id":"n-d07d0821","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-d0f86411","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]],"mem":null},
{"id":"n-e0314602","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":10},["sense.after",{"lit":"emissions"}]]],"mem":null},
{"id":"n-e0cc53ec","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.after",{"lit":"annual"}]]],"mem":null},
{"id":"n-e102e06d","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-e3d1f5ea","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["sense.after",{"lit":"emissions"}]]],"mem":null},
{"id":"n-e5ae0d66","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-e93f1132","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-ec9dd527","guard":[["hasAny",["element","including","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","give"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":12},["sense.before",{"lit":"annual"}]]],"mem":null},
{"id":"n-f076e63a","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-f2b05a52","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-f2b22797","guard":[["hasAny",["element","for","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":12},["sense.after",{"lit":"emissions"}]]],"mem":null},
{"id":"n-f7f62839","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-ff7a2d84","guard":[["hasAny",["code","element","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["sense.after",{"lit":"column"}]]],"mem":null},
{"id":"n-0274bd1d","guard":[["hasAny",["abbreviate","acronym","code","item number","join","joined with","nth","position","separated by","short form"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-0571a831","guard":[["hasAny",["alphabetize the letters","code","item number","join","joined with","letters in order","nth","position","separated by","sort the letters"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-064b3027","guard":[["hasAny",["code","item number","nth","position","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]],"mem":null},
{"id":"n-09a3f24e","guard":[["hasAny",["code","count","how many","how many items","item number","nth","number of items","position"]],["has","column"]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["aggregate.countStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]]]],"mem":null},
{"id":"n-09b61cd6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","join","joined with","nth","position","separated by","title case"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-0c2d2cb8","guard":[["hasAny",["abbreviate","acronym","code","item number","join","joined with","nth","position","separated by","short form"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-0dba55b8","guard":[["hasAny",["backwards","code","item number","join","joined with","nth","position","reverse","reverse order","reversed","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["transform.reverseStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-0fc545e7","guard":[["hasAny",["code","element","item number","join","joined with","most common letter","most frequent letter","nth","position","separated by","which letter appears most"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.commonLetter",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-0fd5349d","guard":[["hasAny",["code","first letters of the name","initials","item number","join","joined with","nth","position","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-10eb0b96","guard":[["hasAny",["code","invert case","item number","join","joined with","nth","position","separated by","swap case","toggle case"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-119b7857","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by","snake case","snakecase","underscores","variable name"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.snake",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-127581ea","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","join","joined with","nth","position","separated by","title case"]],["has","column"]],"pyramid":["render.code",["transform.title",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-15ee1960","guard":[["hasAny",["code","item number","join","joined with","nth","position","reverse the words","reverse word order","separated by","words backwards"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.reverseWords",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-176840b8","guard":[["hasAny",["code","invert case","item number","join","joined with","nth","position","separated by","swap case","toggle case"]],["has","column"]],"pyramid":["render.str",["transform.swapCase",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-19322614","guard":[["hasAny",["code","copies","count","how many","how many items","item number","nth","number of items","position","repeat","say it times"]],["has","column"]],"pyramid":["render.code",["transform.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["aggregate.countStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]]]],"mem":null},
{"id":"n-1c06efda","guard":[["hasAny",["backwards","code","item number","join","joined with","nth","position","reverse","reverse order","reversed","separated by"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-20196293","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.snake",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-213fa755","guard":[["hasAny",["code","first letters of the name","initials","item number","join","joined with","nth","position","separated by"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-215d1d0b","guard":[["hasAny",["all caps","capital letters","capitals","code","item number","join","joined with","nth","position","separated by","upper case","uppercase"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-226da027","guard":[["hasAny",["class name","code","item number","join","joined with","nth","pascal case","pascalcase","position","separated by","upper camel case"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-2b1da5b6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","join","joined with","nth","position","separated by","title case"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-2bb13376","guard":[["hasAny",["code","invert case","item number","join","joined with","nth","position","separated by","swap case","toggle case"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-2e912c9a","guard":[["hasAny",["code","dashes","hyphens","item number","join","joined with","kebab case","kebabcase","nth","position","separated by","slug"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.kebab",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-2ea6a83f","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by","snake case","snakecase","underscores","variable name"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.snake",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-2ef0d2b4","guard":[["hasAny",["code","item number","nth","position","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]],"mem":null},
{"id":"n-2ffe1f1d","guard":[["hasAny",["code","invert case","item number","join","joined with","nth","position","separated by","swap case","toggle case"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.swapCase",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-336e86d5","guard":[["hasAny",["abbreviate","acronym","code","item number","join","joined with","nth","position","separated by","short form"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-344abc56","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","join","joined with","nth","position","separated by","title case"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-349e7501","guard":[["hasAny",["backwards","code","item number","join","joined with","mirror","nth","position","reverse","reversed","separated by","spell backwards"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.reverse",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-382343a7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","join","joined with","nth","position","separated by","title case"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.title",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-3ca3d885","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","join","joined with","nth","position","separated by","title case"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.title",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-3d0f6e3a","guard":[["hasAny",["code","invert case","item number","join","joined with","nth","position","separated by","swap case","toggle case"]],["has","column"]],"pyramid":["render.code",["transform.swapCase",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-3eb4547c","guard":[["hasAny",["backwards","code","item number","join","joined with","mirror","nth","position","reverse","reversed","separated by","spell backwards"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.reverse",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-42a9fb95","guard":[["hasAny",["code","first letters of the name","initials","item number","join","joined with","nth","position","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-45511b65","guard":[["hasAny",["backwards","code","item number","join","joined with","mirror","nth","position","reverse","reversed","separated by","spell backwards"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.reverse",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-49059847","guard":[["hasAny",["code","item number","nth","position","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]],"mem":null},
{"id":"n-493d3f7a","guard":[["hasAny",["abbreviate","acronym","code","item number","join","joined with","nth","position","separated by","short form"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-510b540f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","join","joined with","nth","position","separated by","title case"]],["has","column"]],"pyramid":["render.str",["transform.title",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-5396761d","guard":[["hasAny",["class name","code","item number","join","joined with","nth","pascal case","pascalcase","position","separated by","upper camel case"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-54f23bfc","guard":[["hasAny",["camel case","camelcase","code","item number","join","joined with","lower camel case","nth","position","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-55325cf8","guard":[["hasAny",["abbreviate","acronym","code","item number","join","joined with","nth","position","separated by","short form"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-57c84fb3","guard":[["hasAny",["code","invert case","item number","join","joined with","nth","position","separated by","swap case","toggle case"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-5a38ee49","guard":[["hasAny",["all caps","capital letters","capitals","code","item number","join","joined with","nth","position","separated by","upper case","uppercase"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.upper",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-5b50feb3","guard":[["hasAny",["code","copies","count","how many","how many items","item number","nth","number of items","position","repeat","say it times"]],["has","column"]],"pyramid":["render.code",["transform.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["aggregate.countStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]]]],"mem":null},
{"id":"n-5d07d9f5","guard":[["hasAny",["backwards","code","item number","join","joined with","nth","position","reverse","reverse order","reversed","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-5ed89a14","guard":[["hasAny",["alphabetize the letters","code","item number","join","joined with","letters in order","nth","position","separated by","sort the letters"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-64d956b1","guard":[["hasAny",["code","element","item number","join","joined with","most common letter","most frequent letter","nth","position","separated by","which letter appears most"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.commonLetter",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-666959ec","guard":[["hasAny",["code","item number","join","joined with","nth","position","reverse the words","reverse word order","separated by","words backwards"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-6b3ff12b","guard":[["hasAny",["class name","code","item number","join","joined with","nth","pascal case","pascalcase","position","separated by","upper camel case"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-6e7da10e","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by","snake case","snakecase","underscores","variable name"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.snake",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-7043f89a","guard":[["hasAny",["code","invert case","item number","join","joined with","nth","position","separated by","swap case","toggle case"]],["has","column"]],"pyramid":["render.str",["transform.swapCase",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-71552013","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.base64",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-756f8377","guard":[["hasAny",["code","invert case","item number","join","joined with","nth","position","separated by","swap case","toggle case"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-77b97abf","guard":[["hasAny",["alphabetize the letters","code","item number","join","joined with","letters in order","nth","position","separated by","sort the letters"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-77c98dec","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.base64",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-7a877062","guard":[["hasAny",["code","copies","count","how many","how many items","item number","nth","number of items","position","repeat","say it times"]],["has","column"]],"pyramid":["render.str",["transform.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["aggregate.countStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]]]],"mem":null},
{"id":"n-7a98e60e","guard":[["hasAny",["backwards","code","item number","join","joined with","nth","position","reverse","reverse order","reversed","separated by"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["transform.reverseStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-7dfe676c","guard":[["hasAny",["code","invert case","item number","join","joined with","nth","position","separated by","swap case","toggle case"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.swapCase",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-87db636a","guard":[["hasAny",["camel case","camelcase","code","item number","join","joined with","lower camel case","nth","position","separated by"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-886cf328","guard":[["hasAny",["code","first letters of the name","initials","item number","join","joined with","nth","position","separated by"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-8989c28b","guard":[["hasAny",["code","item number","join","joined with","lower case","lowercase","nth","position","separated by","small letters"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-8b7b8e0b","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by","snake case","snakecase","underscores","variable name"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.snake",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-8fe2a6bc","guard":[["hasAny",["class name","code","item number","join","joined with","nth","pascal case","pascalcase","position","separated by","upper camel case"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-96209a06","guard":[["hasAny",["code","dashes","hyphens","item number","join","joined with","kebab case","kebabcase","nth","position","separated by","slug"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.kebab",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-9a7657c6","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.base64",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-9af1e2de","guard":[["hasAny",["code","item number","nth","position","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]],"mem":null},
{"id":"n-9f76c1fb","guard":[["hasAny",["camel case","camelcase","code","item number","join","joined with","lower camel case","nth","position","separated by"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-a03c5eba","guard":[["hasAny",["code","invert case","item number","join","joined with","nth","position","separated by","swap case","toggle case"]],["has","column"]],"pyramid":["render.code",["transform.swapCase",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-a27fcb3f","guard":[["hasAny",["class name","code","item number","join","joined with","nth","pascal case","pascalcase","position","separated by","upper camel case"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-a3607472","guard":[["hasAny",["camel case","camelcase","code","item number","join","joined with","lower camel case","nth","position","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-ab1a2924","guard":[["hasAny",["code","item number","join","joined with","nth","position","reverse the words","reverse word order","separated by","words backwards"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-acbe30ce","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","join","joined with","nth","position","separated by","title case"]],["has","column"]],"pyramid":["render.code",["transform.title",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-b1b6560c","guard":[["hasAny",["backwards","code","item number","join","joined with","mirror","nth","position","reverse","reversed","separated by","spell backwards"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.reverse",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-b3eca680","guard":[["hasAny",["code","item number","join","joined with","no vowels","nth","position","remove vowels","separated by","without vowels"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-b4103d0b","guard":[["hasAny",["code","item number","join","joined with","lower case","lowercase","nth","position","separated by","small letters"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-b438d82f","guard":[["hasAny",["code","dashes","hyphens","item number","join","joined with","kebab case","kebabcase","nth","position","separated by","slug"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.kebab",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-b53118cf","guard":[["hasAny",["character count","code","first n","how many characters","item number","nth","number of characters","position","take"]],["has","column"],["words<=",11]],"pyramid":["render.list",["transform.takeStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-b5c6f069","guard":[["hasAny",["backwards","code","item number","join","joined with","mirror","nth","position","reverse","reversed","separated by","spell backwards"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.reverse",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-b83ca8ee","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.base64",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-b9789be0","guard":[["hasAny",["code","first letters of the name","initials","item number","join","joined with","nth","position","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-bbbdedd5","guard":[["hasAny",["code","count","how many","how many items","item number","nth","number of items","position"]],["has","column"]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["aggregate.countStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]]]],"mem":null},
{"id":"n-bbd529bc","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by","snake case","snakecase","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.snake",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-be5f4ff8","guard":[["hasAny",["code","count","how many","how many items","item number","nth","number of items","position"]],["has","column"]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["aggregate.countStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]]]],"mem":null},
{"id":"n-c1b7ad61","guard":[["hasAny",["backwards","code","item number","join","joined with","mirror","nth","position","reverse","reversed","separated by","spell backwards"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.reverse",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-c341d108","guard":[["hasAny",["code","item number","join","joined with","no vowels","nth","position","remove vowels","separated by","without vowels"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-c377d2b4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","join","joined with","nth","position","separated by","title case"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-c3eca728","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.base64",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-c582130c","guard":[["hasAny",["code","item number","join","joined with","no vowels","nth","position","remove vowels","separated by","without vowels"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-c7621e9b","guard":[["hasAny",["all caps","capital letters","capitals","code","item number","join","joined with","nth","position","separated by","upper case","uppercase"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.upper",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-cad77de2","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.base64",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-caec7798","guard":[["hasAny",["abbreviate","acronym","code","item number","join","joined with","nth","position","separated by","short form"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-cd5fd339","guard":[["hasAny",["alphabetize the letters","code","item number","join","joined with","letters in order","nth","position","separated by","sort the letters"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-d4453c3e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","join","joined with","nth","position","separated by","title case"]],["has","column"]],"pyramid":["render.str",["transform.title",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-da9dd519","guard":[["hasAny",["alphabetize the letters","code","item number","join","joined with","letters in order","nth","position","separated by","sort the letters"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-dad1d6d5","guard":[["hasAny",["character count","code","first n","how many characters","item number","nth","number of characters","position","take"]],["has","column"],["words<=",11]],"pyramid":["render.lines",["transform.takeStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-de20c772","guard":[["hasAny",["code","first letters of the name","initials","item number","join","joined with","nth","position","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-e01692e6","guard":[["hasAny",["all caps","capital letters","capitals","code","item number","join","joined with","nth","position","separated by","upper case","uppercase"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-e35c012f","guard":[["hasAny",["backwards","code","item number","join","joined with","nth","position","reverse","reverse order","reversed","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["transform.reverseStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]],"mem":null},
{"id":"n-e5c4bd14","guard":[["hasAny",["code","dashes","hyphens","item number","join","joined with","kebab case","kebabcase","nth","position","separated by","slug"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.kebab",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-e9e5881f","guard":[["hasAny",["code","copies","count","how many","how many items","item number","nth","number of items","position","repeat","say it times"]],["has","column"]],"pyramid":["render.str",["transform.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["aggregate.countStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]]]],"mem":null},
{"id":"n-eb6cd96f","guard":[["hasAny",["backwards","code","item number","join","joined with","nth","position","reverse","reverse order","reversed","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]],"mem":null},
{"id":"n-ed4eb2e1","guard":[["hasAny",["alphabetize the letters","code","item number","join","joined with","letters in order","nth","position","separated by","sort the letters"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-eeed4e54","guard":[["hasAny",["code","count","how many","how many items","item number","nth","number of items","position"]],["has","column"]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["aggregate.countStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]]]],"mem":null},
{"id":"n-f101e449","guard":[["hasAny",["character count","code","first n","how many characters","item number","nth","number of characters","position","take"]],["has","column"],["words<=",11]],"pyramid":["render.and",["transform.takeStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-f24dbedf","guard":[["hasAny",["class name","code","item number","join","joined with","nth","pascal case","pascalcase","position","separated by","upper camel case"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-f251cb99","guard":[["hasAny",["code","item number","join","joined with","nth","position","reverse the words","reverse word order","separated by","words backwards"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.reverseWords",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-fc0c8775","guard":[["hasAny",["code","count","how many","how many items","item number","nth","number of items","position"]],["has","column"]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["aggregate.countStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]]]],"mem":null},
{"id":"n-fd15d88f","guard":[["hasAny",["code","count","how many","how many items","item number","nth","number of items","position"]],["has","column"]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["aggregate.countStrs",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}]]]],"mem":null},
{"id":"n-ff3f7fd2","guard":[["hasAny",["code","item number","join","joined with","no vowels","nth","position","remove vowels","separated by","without vowels"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-2f2fc6c3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","nth","position","snake case","snakecase","title case","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.title",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]]],"mem":null},
{"id":"n-41bd1894","guard":[["hasAny",["code","invert case","item number","nth","position","snake case","snakecase","swap case","toggle case","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.swapCase",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]]],"mem":null},
{"id":"n-43720c25","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","nth","position","snake case","snakecase","title case","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.title",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]]],"mem":null},
{"id":"n-4496e153","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","nth","position","snake case","snakecase","title case","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.title",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]]],"mem":null},
{"id":"n-5921d110","guard":[["hasAny",["annual","delete","element","item number","nth","position","remove","strip out","without"]],["has","what"],["has","column"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.unit"]]],"mem":null},
{"id":"n-596f84f9","guard":[["hasAny",["code","delete","item number","nth","position","remove","strip out","without"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-658e15ff","guard":[["hasAny",["annual","delete","item number","nth","position","remove","strip out","without"]],["has","what"],["has","column"]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.unit"]]],"mem":null},
{"id":"n-6a44e505","guard":[["hasAny",["code","delete","item number","nth","position","remove","strip out","without"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-85e41661","guard":[["hasAny",["code","invert case","item number","nth","position","snake case","snakecase","swap case","toggle case","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.snake",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]]],"mem":null},
{"id":"n-964a939d","guard":[["hasAny",["code","delete","item number","nth","position","remove","strip out","without"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-9bdfe60f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","item number","nth","position","snake case","snakecase","title case","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.title",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]]],"mem":null},
{"id":"n-ac91623f","guard":[["hasAny",["code","invert case","item number","nth","position","snake case","snakecase","swap case","toggle case","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.swapCase",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]]],"mem":null},
{"id":"n-b0611053","guard":[["hasAny",["code","invert case","item number","nth","position","snake case","snakecase","swap case","toggle case","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.snake",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]]],"mem":null},
{"id":"n-b6d19477","guard":[["hasAny",["code","invert case","item number","nth","position","snake case","snakecase","swap case","toggle case","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.swapCase",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]]],"mem":null},
{"id":"n-cbccd49d","guard":[["hasAny",["code","invert case","item number","nth","position","snake case","snakecase","swap case","toggle case","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.swapCase",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]]],"mem":null},
{"id":"n-db6a70d8","guard":[["hasAny",["code","invert case","item number","nth","position","snake case","snakecase","swap case","toggle case","underscores","variable name"]],["has","column"]],"pyramid":["render.code",["transform.snake",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]]],"mem":null},
{"id":"n-edb17d76","guard":[["hasAny",["code","delete","item number","nth","position","remove","strip out","without"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-fb7c95fd","guard":[["not",["hasAny",["abbreviation","actions","add","aeronautic","album","attendance","become","beyoncelyrics","bigmac","birdcounts","boardgames","bond","brazilloss","brewingmaterials","calfireincidents","capturefisheriesvsaquaculture","cb","chaininvestment","chips","christmaslyrics","christmassongs","cm","coffeeratings","compare","cpu","crangraphedges","datasaurus","day","deathfuel","demographics","description","diversityschool","dogdescriptions","dogmoves","droughtfips","eclipsepartial2023","emperors","employedgender","erasmus","eruption","expeditions","femalebachstudents","fifteens","foot","fortuneagg","friends","frogs","fuelaccess","furniture","gbp","greater","had","historicalspending","holidayepisodegenres","hr","id","incomelimits","incomemean","incometime","independence","individuals","iso2","items","jobsgender","juryvotes","kgs","km","larger","lb","lesser","lgbtqmovies","lifetimeearn","loadouts","loans","lyrics","makes","malariadeaths","malariainc","manorama","meteorites","mg","mm","month","ms","myersbriggs","name","newsorgs","nhlrosters","nominees","numbats","nycrestaurants","nyttitles","nzbird","outerspaceobjects","outlookmeanings","patientriskprofiles","pell","penguins","pfwcountsitedatapublic2021","plastics","pound","prideaggregates","prideindex","prisonpopulation","psychstats","publicpicks","pumpkins","races","ratings","recentgrads","recessions","reputation","richmondway","saw","scenedescription","sector","shelters","smaller","spotifysongs","stagedata","statenameetymology","stationinfo","strangerthingsalldialogue","studentdebt","sum","swallow","t0047","t0205","table2","tell","title","trend","unit","userreviews","videogames","villagers","w00296","w00456","w0050","w00630","w00681","w01767","w02508","w02633","w02803","w02845","w02916","w03114","w03139","w03272","w0388","w04590","w04843","w04959","w04980","w05026","w05043","w05054","w05176","w0530","w05910","w05942","w06104","w06351","w0651","w06518","w06669","w07106","w07212","w07450","w07886","w07965","w0836","w08708","w08840","w0887","w08934","w09223","w09412","w09419","w10267","w10377","w10396","w10500","w10632","w10756","w10757","w10820","w10926","w11525","w11765","w12015","w12024","w12071","w12084","w12468","w13020","w13326","w13487","w13630","w13693","w14268","w14295","w14300","w14459","w14966","w15282","w15401","w15409","w15601","w15639","w15798","w1587","w15946","w16156","w16427","w16448","w16572","w16629","w16853","w16995","w1709","w17132","w17547","w17691","w17700","w17767","w18246","w18323","w18431","w18497","w18581","w18795","w18850","w19081","w19082","w19954","w20023","w20104","w20157","w20466","w20641","w20816","w20864","w20962","w21043","w21059","w21313","w21514","w21745","w21889","w22030","w22588","w2269","w22700","w23328","w23440","w23571","w23918","w24553","w24607","w24695","w25085","w25121","w25191","w25778","w25908","w26537","w2678","w27106","w27170","w27223","w27268","w27645","w28011","w28432","w28852","w2894","w28958","w3749","w3844","w4826","w4859","w5028","w5097","w5541","w5826","w6314","w6474","w6773","w7410","w8367","w8726","w8783","w9271","w9370","w9493","w9652","w9685","w9847","w9973","wcmatches","week12googletrends","week12mediacloudstates","week13alcoholglobal","week16exercise","wreck","yarn","year","youtube"]]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.unit"]]],"mem":null},
{"id":"n-fd3f1c47","guard":[["hasAny",["code","invert case","item number","nth","position","snake case","snakecase","swap case","toggle case","underscores","variable name"]],["has","column"]],"pyramid":["render.str",["transform.snake",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]]],"mem":null},
{"id":"n-003f2aef","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]],"mem":null},
{"id":"n-0373408b","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-06420e0b","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-1026b020","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-19d5155d","guard":[["hasAny",["camel case","camelcase","code","delete","item number","lower camel case","nth","position","remove","strip out","without"]],["has","column"]],"pyramid":["render.code",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-1c1659ab","guard":[["hasAny",["characters from","code","item number","letters from to","nth","position","slice of the text","substring"]],["has","column"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-1c375f45","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-1d5c0931","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-1e627ba9","guard":[["hasAny",["camel case","camelcase","code","delete","item number","lower camel case","nth","position","remove","strip out","without"]],["has","column"]],"pyramid":["render.code",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-31bae1a8","guard":[["hasAny",["code","delete","invert case","item number","nth","position","remove","strip out","swap case","toggle case","without"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.remove",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-36eabd4e","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]],"mem":null},
{"id":"n-3c40cf20","guard":[["hasAny",["code","delete","item number","no vowels","nth","position","remove","remove vowels","strip out","without","without vowels"]],["has","column"]],"pyramid":["render.code",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-44bc90ab","guard":[["hasAny",["contribution","delete","item number","nth","position","remove","strip out","without"]],["has","column"],["not",["has","comes"]],["words>=",10],["not",["has","and"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-498efa54","guard":[["hasAny",["contribution","delete","item number","nth","position","remove","strip out","without"]],["has","column"],["not",["has","comes"]],["words>=",10],["not",["has","and"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-4b452c30","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]],"mem":null},
{"id":"n-4be987f7","guard":[["hasAny",["code","delete","invert case","item number","nth","position","remove","strip out","swap case","toggle case","without"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.remove",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-4dce4c31","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-52905c0d","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-57de9fc8","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-5ab2fcf9","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-5bfe773b","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-6de354a6","guard":[["hasAny",["delete","element","for","item number","nth","position","remove","snake case","snakecase","strip out","underscores","variable name","without"]],["has","column"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.snake",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-7458dc2e","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-74c89dc8","guard":[["hasAny",["code","delete","item number","nth","position","remove","snake case","snakecase","strip out","underscores","variable name","without"]],["has","column"]],"pyramid":["render.str",["transform.snake",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-787619ef","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-7e81ea54","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-7fb082a6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","delete","item number","nth","position","remove","strip out","title case","without"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.remove",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-83b85e58","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","delete","item number","nth","position","remove","strip out","title case","without"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.remove",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-8f04ad25","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-904421c2","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-91c258b5","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-9d8721e9","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-9f1d8ff5","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]],"mem":null},
{"id":"n-a7344958","guard":[["hasAny",["characters from","code","item number","letters from to","nth","position","slice of the text","substring"]],["has","column"]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-b37d4aa4","guard":[["hasAny",["code","delete","item number","nth","position","remove","snake case","snakecase","strip out","underscores","variable name","without"]],["has","column"]],"pyramid":["render.code",["transform.snake",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-b4357c3e","guard":[["hasAny",["code","delete","invert case","item number","nth","position","remove","strip out","swap case","toggle case","without"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.remove",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-b787ad20","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-b9d1316c","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-c138dc5b","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]],"mem":null},
{"id":"n-c5aedcf4","guard":[["hasAny",["camel case","camelcase","code","delete","item number","lower camel case","nth","position","remove","strip out","without"]],["has","column"]],"pyramid":["render.code",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]]],"mem":null},
{"id":"n-c709d3d3","guard":[["hasAny",["characters from","international","item number","letters from to","nth","position","slice of the text","substring"]],["has","column"],["has","what"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-c7b0b095","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-c957918c","guard":[["hasAny",["code","delete","item number","no vowels","nth","position","remove","remove vowels","strip out","without","without vowels"]],["has","column"]],"pyramid":["render.code",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-cc47e179","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-cfb7a650","guard":[["hasAny",["characters from","code","item number","letters from to","nth","position","slice of the text","substring"]],["has","column"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-d4ab1c7a","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-d8bce52d","guard":[["hasAny",["characters from","code","item number","letters from to","nth","position","slice of the text","substring"]],["has","column"]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-d96bd7ff","guard":[["hasAny",["delete","element","for","item number","nth","position","remove","snake case","snakecase","strip out","underscores","variable name","without"]],["has","column"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["transform.snake",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-dda1dc35","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-e758ddea","guard":[["hasAny",["code","delete","invert case","item number","nth","position","remove","strip out","swap case","toggle case","without"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.remove",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-eac89f02","guard":[["hasAny",["characters from","international","item number","letters from to","nth","position","slice of the text","substring"]],["has","column"],["has","what"]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-eebf458a","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}]]],"mem":null},
{"id":"n-f2497dd3","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-fb95b727","guard":[["hasAny",["code","delete","item number","no vowels","nth","position","remove","remove vowels","strip out","without","without vowels"]],["has","column"]],"pyramid":["render.code",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]]],"mem":null},
{"id":"n-1aabe470","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]]],"mem":null},
{"id":"n-4933fd40","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]],"mem":null},
{"id":"n-4f9fe4e0","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]],"mem":null},
{"id":"n-6f86c210","guard":[["hasAny",["code","delete","item number","longest","longest one","longest word","nth","position","remove","shortest","shortest one","shortest word","strip out","without"]],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," is iso_",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-8cece030","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]],"mem":null},
{"id":"n-97222bf9","guard":[["hasAny",["delete","growth","item number","longest","longest one","longest word","nth","position","remove","shortest","shortest one","shortest word","strip out","without"]],["has","column"]],"pyramid":["render.template",{"lit":["The column of Annual ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (%) is co2_",{"slot":3},"_prct."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["sense.lastWord"],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-ada4502d","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"]],"pyramid":["render.code",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]],"mem":null},
{"id":"n-b78892e3","guard":[["hasAny",["code","item number","join","joined with","nth","position","separated by"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]]],"mem":null},
{"id":"n-130dd7bd","guard":[["hasAny",["camel case","camelcase","code","delete","item number","longest","longest one","longest word","lower camel case","nth","position","remove","shortest","shortest one","shortest word","strip out","without"]],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," is iso_",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-1b75edb3","guard":[["hasAny",["camel case","camelcase","code","item number","longest","longest one","longest word","lower camel case","nth","position","separate by","split","split by"]],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ISO ",{"slot":1}," is ",{"slot":2},"_",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["sense.lastWord"],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],["sense.lastWord"]]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-40394631","guard":[["hasAny",["camel case","camelcase","code","item number","longest","longest one","longest word","lower camel case","nth","position","separate by","split","split by"]],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," is iso_",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],["sense.lastWord"]]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-56b959a2","guard":[["hasAny",["code","item number","longest","longest one","longest word","nth","position","separate by","shortest","shortest one","shortest word","split","split by"]],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"_code."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-959eed38","guard":[["hasAny",["camel case","camelcase","code","item number","longest","longest one","longest word","lower camel case","nth","position","separate by","split","split by"]],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," is iso_",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],["sense.lastWord"]]],["sense.lastWord"],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-9c3c0a20","guard":[["hasAny",["camel case","camelcase","code","item number","lower camel case","nth","position","separate by","shortest","shortest one","shortest word","split","split by"]],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"_",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],["sense.lastWord"]]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-c14830a9","guard":[["hasAny",["camel case","camelcase","delete","growth","item number","longest","longest one","longest word","lower camel case","nth","position","remove","shortest","shortest one","shortest word","strip out","without"]],["has","column"]],"pyramid":["render.template",{"lit":["The column of Annual ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (%) is co2_",{"slot":3},"_prct."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-00c259a4","guard":[["hasAny",["code","item number","longest","longest one","longest word","nth","position","separate by","shortest","shortest one","shortest word","split","split by"]],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"_",{"slot":4},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-1677cf5e","guard":[["hasAny",["delete","item number","longest","longest one","longest word","methane","nth","position","remove","shortest","shortest one","shortest word","strip out","without"]],["has","what"],["has","column"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," ",{"slot":1}," methane ",{"slot":2}," including land ",{"slot":3}," is methane_per_capita."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-dc013c89","guard":[["hasAny",["camel case","camelcase","code","item number","longest","longest one","longest word","lower camel case","nth","position","separate by","shortest","shortest one","shortest word","split","split by"]],["has","column"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," code is ",{"slot":2},"_",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],["sense.lastWord"]]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-e9c43ea7","guard":[["hasAny",["consumption","delete","element","item number","nth","position","remove","strip out","without"]],["has","title"],["has","column"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-01138efa","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}],["sense.wordCount"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]]],"mem":null},
{"id":"n-01ab752b","guard":[["hasAny",["delete","international","item number","nth","position","remove","shortest","shortest one","shortest word","strip out","without"]],["has","column"],["has","what"]],"pyramid":["render.template",{"lit":["The column of Annual ",{"slot":0}," ",{"slot":1}," per GDP (",{"slot":2}," per ",{"slot":3},"-$) is co2_per_gdp."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-073c5e19","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",13],["not",["has","biofuels"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":1}]]],"mem":null},
{"id":"n-0885704e","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",11]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],["sense.wordCount"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]]],"mem":null},
{"id":"n-11c64088","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]],"mem":null},
{"id":"n-1fe57eb2","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"],["words<=",11]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":4},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"},{"lit":"column"}]]],"mem":null},
{"id":"n-25e87918","guard":[["hasAny",["code","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","column"]],"pyramid":["render.code",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":5},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"}],{"lit":-1}],{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"column"},{"lit":"title"}]]],"mem":null},
{"id":"n-27574ec7","guard":[["hasAny",["contribution","delete","item number","nth","position","remove","shortest","shortest one","shortest word","strip out","without"]],["has","what"]],"pyramid":["render.template",{"lit":["The column of ",{"slot":0}," of ",{"slot":1}," to ",{"slot":2}," ",{"slot":3}," is share_of_temperature_change_from_ghg."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-co2-data-owid-co2-codebook-4bc0ff"},{"lit":"title"}],{"lit":1}]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"give the column for Annual CO₂ emissions","expect":{"contains":["co2"],"notRefusal":true}},{"q":"what is the column of Annual CO₂ emissions from other industry (per capita)","expect":{"contains":["other_co2_per_capita"],"notRefusal":true}},{"q":"tell me the column of the title Cumulative CO₂ emissions including land-use change","expect":{"contains":["cumulative_co2_including_luc"],"notRefusal":true}},{"q":"tell me the column of the title Annual CO₂ emissions from cement","expect":{"contains":["cement_co2"],"notRefusal":true}},{"q":"give the column for Share of global cumulative CO₂ emissions from flaring","expect":{"contains":["share_global_cumulative_flaring_co2"],"notRefusal":true}},{"q":"give the column for Primary energy consumption","expect":{"contains":["primary_energy_consumption"],"notRefusal":true}},{"q":"what is the column of Share of global cumulative CO₂ emissions from gas","expect":{"contains":["share_global_cumulative_gas_co2"],"notRefusal":true}},{"q":"give the column for Annual CO₂ emissions including land-use change per capita","expect":{"contains":["co2_including_luc_per_capita"],"notRefusal":true}},{"q":"what is the column of CO₂ emissions per unit energy","expect":{"contains":["co2_per_unit_energy"],"notRefusal":true}},{"q":"give the column for CO₂ emissions including land-use change per unit energy","expect":{"contains":["co2_including_luc_per_unit_energy"],"notRefusal":true}},{"q":"give the column for Change in global mean surface temperature caused by methane emissions","expect":{"contains":["temperature_change_from_ch4"],"notRefusal":true}},{"q":"what is the column of Annual CO₂ emissions embedded in trade","expect":{"contains":["trade_co2"],"notRefusal":true}},{"q":"tell me the column of the title Primary energy consumption per GDP","expect":{"contains":["energy_per_gdp"],"notRefusal":true}},{"q":"what is the column of Share of global cumulative CO₂ emissions from other industry","expect":{"contains":["share_global_cumulative_other_co2"],"notRefusal":true}},{"q":"give the column for Share of annual CO₂ emissions embedded in trade","expect":{"contains":["trade_co2_share"],"notRefusal":true}},{"q":"tell me the column of the title Annual CO₂ emissions from coal","expect":{"contains":["coal_co2"],"notRefusal":true}},{"q":"give the column for ISO code","expect":{"contains":["iso_code"],"notRefusal":true}},{"q":"what is the column of Cumulative CO₂ emissions from coal","expect":{"contains":["cumulative_coal_co2"],"notRefusal":true}},{"q":"give the column for Annual CO₂ emissions from oil","expect":{"contains":["oil_co2"],"notRefusal":true}},{"q":"give the column for Annual nitrous oxide emissions including land use","expect":{"contains":["nitrous_oxide"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
