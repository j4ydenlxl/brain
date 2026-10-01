// country-numeric-code-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"country-numeric-code-neo-g6","class":"country-numeric-code","generation":6,"lane":"neo","grownFrom":["what is the ISO numeric code of Canada","what is the ISO numeric code of Jersey","what is the ISO numeric code of Uruguay","what is the ISO numeric code of Jamaica","give the three-digit country code of Zambia","what is the ISO numeric code of Saint Lucia","give the three-digit country code of Seychelles","give the three-digit country code of Bouvet Island","give the three-digit country code of Russian Federation","give the three-digit country code of Mali","give the three-digit country code of Palestine, State of","which numeric ISO 3166 code does Papua New Guinea have","which numeric ISO 3166 code does Kenya have","what is the ISO numeric code of French Polynesia","which numeric ISO 3166 code does British Indian Ocean Territory have","give the three-digit country code of Nigeria","give the three-digit country code of Kazakhstan","which numeric ISO 3166 code does Israel have","give the three-digit country code of Armenia","give the three-digit country code of Turkmenistan"],"version":1});

// <KERNEL>
const KERNEL_VERSION = 1;
const MAX_DEPTH = 64;
const MAX_LIST = 10000;
const MAX_BITS = 65536;
const MAX_TEXT = 100000;
const SAFE = 9007199254740991n;
const NEAR = 0.5;
const TYPES = Object.freeze(['text', 'num', 'nums', 'str', 'strs', 'bool', 'kv', 'tpl']);
const FAMILIES = Object.freeze(['sense', 'transform', 'aggregate', 'compare', 'compute', 'memory', 'route', 'iterate', 'render']);
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
const CHECK = Object.freeze({
  text: (v) => typeof v === 'string', str: (v) => typeof v === 'string', num: isNum, bool: (v) => typeof v === 'boolean',
  nums: (v) => Array.isArray(v) && v.every(isNum), strs: (v) => Array.isArray(v) && v.every((s) => typeof s === 'string'),
  kv: isKv, tpl: isTpl,
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
  return Object.freeze(out);
}

// ---- evaluation: nodes, types, shape
function isLit(node) { return isKv(node) && Object.hasOwn(node, 'lit'); }
/** The argument types a node of this primitive carries (its in list without the implicit "text"), or null. */
function argTypes(name) { return typeof name === 'string' && Object.hasOwn(ARGS, name) ? ARGS[name].slice() : null; }
/** Evaluate a node on a prompt and a mem: a value of the node's type, or null (a miss, never a guess). */
function evalNode(node, q, mem, depth = 0) {
  try {
    if (depth > MAX_DEPTH) return null;
    if (isLit(node)) return clean(node.lit);
    if (!Array.isArray(node) || typeof node[0] !== 'string' || !Object.hasOwn(PRIMS, node[0])) return null;
    const p = PRIMS[node[0]], ts = ARGS[node[0]], n = node.length - 1;
    if (n < ts.length || (n > ts.length && !p.rest)) return null;
    const args = [];
    for (let i = 1; i <= n; i++) { const v = evalNode(node[i], q, mem, depth + 1); if (v === null && !p.lazy) return null; args.push(v); }
    return p.fn(args, { q: typeof q === 'string' ? q : '', mem: isKv(mem) ? mem : null });
  } catch { return null; }
}
/** Whether a node is well typed and yields the wanted type (any type when want is undefined). */
function wellTyped(node, want, depth = 0) {
  if (depth > MAX_DEPTH) return false;
  if (isLit(node)) return typeof want === 'string' && want !== 'text' && Object.hasOwn(CHECK, want) && CHECK[want](clean(node.lit));
  if (!Array.isArray(node) || typeof node[0] !== 'string' || !Object.hasOwn(PRIMS, node[0])) return false;
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
  if (node.length === 1) return ['sense', 'memory'].includes(PRIMS[node[0]]?.family);
  return node.slice(1).every((x) => leavesOk(x, depth + 1));
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
  else if (PRIMS[c.pyramid[0]].family !== 'render') errors.push('the apex is not a render primitive');
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
const COLONY = [
{"id":"n-6f6b884f","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Jersey":"832","what is the ISO numeric code of Uruguay":"858","what is the ISO numeric code of Jamaica":"388","what is the ISO numeric code of Canada":"124","give the three-digit country code of Zambia":"894","what is the ISO numeric code of Saint Lucia":"662","give the three-digit country code of Seychelles":"690","give the three-digit country code of Bouvet Island":"074","give the three-digit country code of Russian Federation":"643","give the three-digit country code of Mali":"466","give the three-digit country code of Palestine, State of":"275","which numeric ISO 3166 code does Papua New Guinea have":"598","which numeric ISO 3166 code does Kenya have":"404","what is the ISO numeric code of French Polynesia":"258","which numeric ISO 3166 code does British Indian Ocean Territory have":"086","give the three-digit country code of Nigeria":"566","give the three-digit country code of Kazakhstan":"398","which numeric ISO 3166 code does Israel have":"376","give the three-digit country code of Armenia":"051","give the three-digit country code of Turkmenistan":"795","which numeric ISO 3166 code does Mayotte have":"175","which numeric ISO 3166 code does Chile have":"152","which numeric ISO 3166 code does India have":"356","what is the ISO numeric code of Bolivia, Plurinational State of":"068","which numeric ISO 3166 code does Saint Helena, Ascension and Tristan da Cunha have":"654","what is the ISO numeric code of Kyrgyzstan":"417","give the three-digit country code of North Macedonia":"807","give the three-digit country code of Serbia":"688","give the three-digit country code of Lebanon":"422","what is the ISO numeric code of Bosnia and Herzegovina":"070","which numeric ISO 3166 code does Comoros have":"174","give the three-digit country code of Libya":"434","which numeric ISO 3166 code does Luxembourg have":"442","what is the ISO numeric code of Cabo Verde":"132","give the three-digit country code of Syrian Arab Republic":"760","what is the ISO numeric code of Bangladesh":"050","which numeric ISO 3166 code does Spain have":"724","what is the ISO numeric code of Latvia":"428","what is the ISO numeric code of Venezuela, Bolivarian Republic of":"862","give the three-digit country code of Isle of Man":"833","what is the ISO numeric code of Bermuda":"060","which numeric ISO 3166 code does Australia have":"036","which numeric ISO 3166 code does South Georgia and the South Sandwich Islands have":"239","which numeric ISO 3166 code does Peru have":"604","what is the ISO numeric code of Viet Nam":"704","what is the ISO numeric code of Singapore":"702","which numeric ISO 3166 code does Croatia have":"191","which numeric ISO 3166 code does Lao People's Democratic Republic have":"418","which numeric ISO 3166 code does Mongolia have":"496","give the three-digit country code of Mauritius":"480","what is the ISO numeric code of Barbados":"052","which numeric ISO 3166 code does Pakistan have":"586","give the three-digit country code of Italy":"380","what is the ISO numeric code of Aruba":"533","which numeric ISO 3166 code does Malta have":"470","which numeric ISO 3166 code does Bonaire, Sint Eustatius and Saba have":"535","what is the ISO numeric code of Nepal":"524","give the three-digit country code of Philippines":"608","give the three-digit country code of Northern Mariana Islands":"580","which numeric ISO 3166 code does Macao have":"446","what is the ISO numeric code of Zimbabwe":"716","give the three-digit country code of Suriname":"740","give the three-digit country code of Congo, Democratic Republic of the":"180","which numeric ISO 3166 code does Tunisia have":"788","which numeric ISO 3166 code does Netherlands, Kingdom of the have":"528","which numeric ISO 3166 code does Slovenia have":"705","give the three-digit country code of Sint Maarten (Dutch part)":"534","give the three-digit country code of South Africa":"710","what is the ISO numeric code of Dominica":"212","what is the ISO numeric code of Sweden":"752","give the three-digit country code of Yemen":"887","what is the ISO numeric code of Switzerland":"756","what is the ISO numeric code of Germany":"276","give the three-digit country code of Belgium":"056","which numeric ISO 3166 code does Bahamas have":"044","which numeric ISO 3166 code does New Zealand have":"554","which numeric ISO 3166 code does Mozambique have":"508","which numeric ISO 3166 code does Faroe Islands have":"234","give the three-digit country code of Iran, Islamic Republic of":"364","what is the ISO numeric code of Guadeloupe":"312","give the three-digit country code of Greenland":"304","what is the ISO numeric code of Heard Island and McDonald Islands":"334","what is the ISO numeric code of Falkland Islands (Malvinas)":"238","give the three-digit country code of Gambia":"270","which numeric ISO 3166 code does Burundi have":"108","what is the ISO numeric code of United Kingdom of Great Britain and Northern Ireland":"826","which numeric ISO 3166 code does Holy See have":"336","which numeric ISO 3166 code does Iraq have":"368","give the three-digit country code of Denmark":"208","give the three-digit country code of Czechia":"203","what is the ISO numeric code of Guyana":"328","what is the ISO numeric code of Moldova, Republic of":"498","what is the ISO numeric code of Christmas Island":"162","what is the ISO numeric code of Korea, Republic of":"410","which numeric ISO 3166 code does Bahrain have":"048","give the three-digit country code of Algeria":"012","what is the ISO numeric code of Montenegro":"499","what is the ISO numeric code of Haiti":"332","give the three-digit country code of China":"156","which numeric ISO 3166 code does Virgin Islands (U.S.) have":"850"}}},
{"id":"n-e2e2f043","guard":[["has","code"],["not",["has","calling"]],["not",["has","twoletter"]],["not",["has","alpha2"]],["not",["has","currency"]],["not",["has","threeletter"]],["not",["has","alpha3"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"code"}]]],"mem":{"table":{"of Jersey":"832","of Uruguay":"858","of Jamaica":"388","of Canada":"124","of Zambia":"894","of Saint Lucia":"662","of Seychelles":"690","of Bouvet Island":"074","of Russian Federation":"643","of Mali":"466","of Palestine, State of":"275","does Papua New Guinea have":"598","does Kenya have":"404","of French Polynesia":"258","does British Indian Ocean Territory have":"086","of Nigeria":"566","of Kazakhstan":"398","does Israel have":"376","of Armenia":"051","of Turkmenistan":"795","does Mayotte have":"175","does Chile have":"152","does India have":"356","of Bolivia, Plurinational State of":"068","does Saint Helena, Ascension and Tristan da Cunha have":"654","of Kyrgyzstan":"417","of North Macedonia":"807","of Serbia":"688","of Lebanon":"422","of Bosnia and Herzegovina":"070","does Comoros have":"174","of Libya":"434","does Luxembourg have":"442","of Cabo Verde":"132","of Syrian Arab Republic":"760","of Bangladesh":"050","does Spain have":"724","of Latvia":"428","of Venezuela, Bolivarian Republic of":"862","of Isle of Man":"833","of Bermuda":"060","does Australia have":"036","does South Georgia and the South Sandwich Islands have":"239","does Peru have":"604","of Viet Nam":"704","of Singapore":"702","does Croatia have":"191","does Lao People's Democratic Republic have":"418","does Mongolia have":"496","of Mauritius":"480","of Barbados":"052","does Pakistan have":"586","of Italy":"380","of Aruba":"533","does Malta have":"470","does Bonaire, Sint Eustatius and Saba have":"535","of Nepal":"524","of Philippines":"608","of Northern Mariana Islands":"580","does Macao have":"446","of Zimbabwe":"716","of Suriname":"740","of Congo, Democratic Republic of the":"180","does Tunisia have":"788","does Netherlands, Kingdom of the have":"528","does Slovenia have":"705","of Sint Maarten (Dutch part)":"534","of South Africa":"710","of Dominica":"212","of Sweden":"752","of Yemen":"887","of Switzerland":"756","of Germany":"276","of Belgium":"056","does Bahamas have":"044","does New Zealand have":"554","does Mozambique have":"508","does Faroe Islands have":"234","of Iran, Islamic Republic of":"364","of Guadeloupe":"312","of Greenland":"304","of Heard Island and McDonald Islands":"334","of Falkland Islands (Malvinas)":"238","of Gambia":"270","does Burundi have":"108","of United Kingdom of Great Britain and Northern Ireland":"826","does Holy See have":"336","does Iraq have":"368","of Denmark":"208","of Czechia":"203","of Guyana":"328","of Moldova, Republic of":"498","of Christmas Island":"162","of Korea, Republic of":"410","does Bahrain have":"048","of Algeria":"012","of Montenegro":"499","of Haiti":"332","of China":"156","does Virgin Islands (U.S.) have":"850"}}},
{"id":"n-5a9bff18","guard":[["has","code"],["nums==",0],["has","the"],["not",["has","currency"]],["not",["has","domain"]],["not",["has","twoletter"]],["not",["has","calling"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Jersey":"832","what is the ISO numeric code of Uruguay":"858","what is the ISO numeric code of Jamaica":"388","what is the ISO numeric code of Canada":"124","give the three-digit country code of Zambia":"894","what is the ISO numeric code of Saint Lucia":"662","give the three-digit country code of Seychelles":"690","give the three-digit country code of Bouvet Island":"074","give the three-digit country code of Russian Federation":"643","give the three-digit country code of Mali":"466","give the three-digit country code of Palestine, State of":"275","what is the ISO numeric code of French Polynesia":"258","give the three-digit country code of Nigeria":"566","give the three-digit country code of Kazakhstan":"398","give the three-digit country code of Armenia":"051","give the three-digit country code of Turkmenistan":"795","what is the ISO numeric code of Bolivia, Plurinational State of":"068","what is the ISO numeric code of Kyrgyzstan":"417","give the three-digit country code of North Macedonia":"807","give the three-digit country code of Serbia":"688","give the three-digit country code of Lebanon":"422","what is the ISO numeric code of Bosnia and Herzegovina":"070","give the three-digit country code of Libya":"434","what is the ISO numeric code of Cabo Verde":"132","give the three-digit country code of Syrian Arab Republic":"760","what is the ISO numeric code of Bangladesh":"050","what is the ISO numeric code of Latvia":"428","what is the ISO numeric code of Venezuela, Bolivarian Republic of":"862","give the three-digit country code of Isle of Man":"833","what is the ISO numeric code of Bermuda":"060","what is the ISO numeric code of Viet Nam":"704","what is the ISO numeric code of Singapore":"702","give the three-digit country code of Mauritius":"480","what is the ISO numeric code of Barbados":"052","give the three-digit country code of Italy":"380","what is the ISO numeric code of Aruba":"533","what is the ISO numeric code of Nepal":"524","give the three-digit country code of Philippines":"608","give the three-digit country code of Northern Mariana Islands":"580","what is the ISO numeric code of Zimbabwe":"716","give the three-digit country code of Suriname":"740","give the three-digit country code of Congo, Democratic Republic of the":"180","give the three-digit country code of Sint Maarten (Dutch part)":"534","give the three-digit country code of South Africa":"710","what is the ISO numeric code of Dominica":"212","what is the ISO numeric code of Sweden":"752","give the three-digit country code of Yemen":"887","what is the ISO numeric code of Switzerland":"756","what is the ISO numeric code of Germany":"276","give the three-digit country code of Belgium":"056","give the three-digit country code of Iran, Islamic Republic of":"364","what is the ISO numeric code of Guadeloupe":"312","give the three-digit country code of Greenland":"304","what is the ISO numeric code of Heard Island and McDonald Islands":"334","what is the ISO numeric code of Falkland Islands (Malvinas)":"238","give the three-digit country code of Gambia":"270","what is the ISO numeric code of United Kingdom of Great Britain and Northern Ireland":"826","give the three-digit country code of Denmark":"208","give the three-digit country code of Czechia":"203","what is the ISO numeric code of Guyana":"328","what is the ISO numeric code of Moldova, Republic of":"498","what is the ISO numeric code of Christmas Island":"162","what is the ISO numeric code of Korea, Republic of":"410","give the three-digit country code of Algeria":"012","what is the ISO numeric code of Montenegro":"499","what is the ISO numeric code of Haiti":"332","give the three-digit country code of China":"156"}}},
{"id":"n-521df3e8","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"numeric"}]]],"mem":{"table":{"code of Jersey":"832","code of Uruguay":"858","code of Jamaica":"388","code of Canada":"124","code of Saint Lucia":"662","ISO 3166 code does Papua New Guinea have":"598","ISO 3166 code does Kenya have":"404","code of French Polynesia":"258","ISO 3166 code does British Indian Ocean Territory have":"086","ISO 3166 code does Israel have":"376","ISO 3166 code does Mayotte have":"175","ISO 3166 code does Chile have":"152","ISO 3166 code does India have":"356","code of Bolivia, Plurinational State of":"068","ISO 3166 code does Saint Helena, Ascension and Tristan da Cunha have":"654","code of Kyrgyzstan":"417","code of Bosnia and Herzegovina":"070","ISO 3166 code does Comoros have":"174","ISO 3166 code does Luxembourg have":"442","code of Cabo Verde":"132","code of Bangladesh":"050","ISO 3166 code does Spain have":"724","code of Latvia":"428","code of Venezuela, Bolivarian Republic of":"862","code of Bermuda":"060","ISO 3166 code does Australia have":"036","ISO 3166 code does South Georgia and the South Sandwich Islands have":"239","ISO 3166 code does Peru have":"604","code of Viet Nam":"704","code of Singapore":"702","ISO 3166 code does Croatia have":"191","ISO 3166 code does Lao People's Democratic Republic have":"418","ISO 3166 code does Mongolia have":"496","code of Barbados":"052","ISO 3166 code does Pakistan have":"586","code of Aruba":"533","ISO 3166 code does Malta have":"470","ISO 3166 code does Bonaire, Sint Eustatius and Saba have":"535","code of Nepal":"524","ISO 3166 code does Macao have":"446","code of Zimbabwe":"716","ISO 3166 code does Tunisia have":"788","ISO 3166 code does Netherlands, Kingdom of the have":"528","ISO 3166 code does Slovenia have":"705","code of Dominica":"212","code of Sweden":"752","code of Switzerland":"756","code of Germany":"276","ISO 3166 code does Bahamas have":"044","ISO 3166 code does New Zealand have":"554","ISO 3166 code does Mozambique have":"508","ISO 3166 code does Faroe Islands have":"234","code of Guadeloupe":"312","code of Heard Island and McDonald Islands":"334","code of Falkland Islands (Malvinas)":"238","ISO 3166 code does Burundi have":"108","code of United Kingdom of Great Britain and Northern Ireland":"826","ISO 3166 code does Holy See have":"336","ISO 3166 code does Iraq have":"368","code of Guyana":"328","code of Moldova, Republic of":"498","code of Christmas Island":"162","code of Korea, Republic of":"410","ISO 3166 code does Bahrain have":"048","code of Montenegro":"499","code of Haiti":"332","ISO 3166 code does Virgin Islands (U.S.) have":"850"}}},
{"id":"n-e0a9d1f9","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"iso"}]]],"mem":{"table":{"numeric code of Jersey":"832","numeric code of Uruguay":"858","numeric code of Jamaica":"388","numeric code of Canada":"124","numeric code of Saint Lucia":"662","3166 code does Papua New Guinea have":"598","3166 code does Kenya have":"404","numeric code of French Polynesia":"258","3166 code does British Indian Ocean Territory have":"086","3166 code does Israel have":"376","3166 code does Mayotte have":"175","3166 code does Chile have":"152","3166 code does India have":"356","numeric code of Bolivia, Plurinational State of":"068","3166 code does Saint Helena, Ascension and Tristan da Cunha have":"654","numeric code of Kyrgyzstan":"417","numeric code of Bosnia and Herzegovina":"070","3166 code does Comoros have":"174","3166 code does Luxembourg have":"442","numeric code of Cabo Verde":"132","numeric code of Bangladesh":"050","3166 code does Spain have":"724","numeric code of Latvia":"428","numeric code of Venezuela, Bolivarian Republic of":"862","numeric code of Bermuda":"060","3166 code does Australia have":"036","3166 code does South Georgia and the South Sandwich Islands have":"239","3166 code does Peru have":"604","numeric code of Viet Nam":"704","numeric code of Singapore":"702","3166 code does Croatia have":"191","3166 code does Lao People's Democratic Republic have":"418","3166 code does Mongolia have":"496","numeric code of Barbados":"052","3166 code does Pakistan have":"586","numeric code of Aruba":"533","3166 code does Malta have":"470","3166 code does Bonaire, Sint Eustatius and Saba have":"535","numeric code of Nepal":"524","3166 code does Macao have":"446","numeric code of Zimbabwe":"716","3166 code does Tunisia have":"788","3166 code does Netherlands, Kingdom of the have":"528","3166 code does Slovenia have":"705","numeric code of Dominica":"212","numeric code of Sweden":"752","numeric code of Switzerland":"756","numeric code of Germany":"276","3166 code does Bahamas have":"044","3166 code does New Zealand have":"554","3166 code does Mozambique have":"508","3166 code does Faroe Islands have":"234","numeric code of Guadeloupe":"312","numeric code of Heard Island and McDonald Islands":"334","numeric code of Falkland Islands (Malvinas)":"238","3166 code does Burundi have":"108","numeric code of United Kingdom of Great Britain and Northern Ireland":"826","3166 code does Holy See have":"336","3166 code does Iraq have":"368","numeric code of Guyana":"328","numeric code of Moldova, Republic of":"498","numeric code of Christmas Island":"162","numeric code of Korea, Republic of":"410","3166 code does Bahrain have":"048","numeric code of Montenegro":"499","numeric code of Haiti":"332","3166 code does Virgin Islands (U.S.) have":"850"}}},
{"id":"n-816e8b3f","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the ISO numeric code of Jersey":"832","the ISO numeric code of Uruguay":"858","the ISO numeric code of Jamaica":"388","the ISO numeric code of Canada":"124","the ISO numeric code of Saint Lucia":"662","the ISO numeric code of French Polynesia":"258","the ISO numeric code of Bolivia, Plurinational State of":"068","the ISO numeric code of Kyrgyzstan":"417","the ISO numeric code of Bosnia and Herzegovina":"070","the ISO numeric code of Cabo Verde":"132","the ISO numeric code of Bangladesh":"050","the ISO numeric code of Latvia":"428","the ISO numeric code of Venezuela, Bolivarian Republic of":"862","the ISO numeric code of Bermuda":"060","the ISO numeric code of Viet Nam":"704","the ISO numeric code of Singapore":"702","the ISO numeric code of Barbados":"052","the ISO numeric code of Aruba":"533","the ISO numeric code of Nepal":"524","the ISO numeric code of Zimbabwe":"716","the ISO numeric code of Dominica":"212","the ISO numeric code of Sweden":"752","the ISO numeric code of Switzerland":"756","the ISO numeric code of Germany":"276","the ISO numeric code of Guadeloupe":"312","the ISO numeric code of Heard Island and McDonald Islands":"334","the ISO numeric code of Falkland Islands (Malvinas)":"238","the ISO numeric code of United Kingdom of Great Britain and Northern Ireland":"826","the ISO numeric code of Guyana":"328","the ISO numeric code of Moldova, Republic of":"498","the ISO numeric code of Christmas Island":"162","the ISO numeric code of Korea, Republic of":"410","the ISO numeric code of Montenegro":"499","the ISO numeric code of Haiti":"332"}}},
{"id":"n-3af395a1","guard":[["hasAny",["count","double","holy","how many numbers","number of values","twice","two times"]]],"pyramid":["render.number",["transform.double",["aggregate.count",["iterate.collatz",["sense.first"]]]]],"mem":null},
{"id":"n-58c9655d","guard":[["hasAny",["congo","how many items","interest earned","number of items","simple interest"]],["has","threedigit"]],"pyramid":["render.number",["compute.interest",{"lit":3},{"lit":1000},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-894a5e93","guard":[["hasAny",["how many items","interest earned","mauritius","number of items","simple interest"]],["has","threedigit"]],"pyramid":["render.number",["compute.interest",{"lit":12},{"lit":1000},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-05da2aee","guard":[["hasAny",["code","country","lebanon","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Lebanon":"422"}}},
{"id":"n-079a5f2c","guard":[["hasAny",["code","guinea","have","iso","new","numeric","papua"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Papua New Guinea have":"598"}}},
{"id":"n-0ab6aca9","guard":[["hasAny",["code","country","suriname","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Suriname":"740"}}},
{"id":"n-0e5a7c71","guard":[["hasAny",["code","have","iso","mayotte","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Mayotte have":"175"}}},
{"id":"n-0f23938e","guard":[["hasAny",["code","country","mali","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Mali":"466"}}},
{"id":"n-10b2d48e","guard":[["hasAny",["africa","south"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of South Africa":"710"}}},
{"id":"n-10dc2744","guard":[["has","guyana"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Guyana":"328"}}},
{"id":"n-112d5377","guard":[["has","mauritius"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Mauritius":"480"}}},
{"id":"n-12eff4d4","guard":[["has","korea"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Korea, Republic of":"410"}}},
{"id":"n-13389485","guard":[["hasAny",["french","polynesia"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of French Polynesia":"258"}}},
{"id":"n-19b06059","guard":[["hasAny",["code","guyana","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Guyana":"328"}}},
{"id":"n-1a6e4e11","guard":[["has","china"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of China":"156"}}},
{"id":"n-1b080564","guard":[["has","bermuda"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Bermuda":"060"}}},
{"id":"n-1f72c395","guard":[["hasAny",["code","iso","korea","numeric","republic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Korea, Republic of":"410"}}},
{"id":"n-20e0289a","guard":[["hasAny",["code","have","iso","israel","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Israel have":"376"}}},
{"id":"n-20f956ec","guard":[["has","germany"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Germany":"276"}}},
{"id":"n-2173891e","guard":[["hasAny",["arab","syrian"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Syrian Arab Republic":"760"}}},
{"id":"n-22d5d8a1","guard":[["hasAny",["code","have","iso","numeric","peru"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Peru have":"604"}}},
{"id":"n-259356cf","guard":[["has","mali"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Mali":"466"}}},
{"id":"n-26cbc1b1","guard":[["has","yemen"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Yemen":"887"}}},
{"id":"n-28184311","guard":[["hasAny",["code","comoros","have","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Comoros have":"174"}}},
{"id":"n-29cbd60c","guard":[["hasAny",["code","have","iso","luxembourg","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Luxembourg have":"442"}}},
{"id":"n-2a333b16","guard":[["hasAny",["code","haiti","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Haiti":"332"}}},
{"id":"n-2a692388","guard":[["hasAny",["code","have","iso","numeric","slovenia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Slovenia have":"705"}}},
{"id":"n-2b8cd515","guard":[["hasAny",["code","iso","kyrgyzstan","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Kyrgyzstan":"417"}}},
{"id":"n-2f97744d","guard":[["hasAny",["code","country","italy","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Italy":"380"}}},
{"id":"n-30c2004b","guard":[["hasAny",["code","country","nigeria","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Nigeria":"566"}}},
{"id":"n-31a50905","guard":[["hasAny",["code","iso","nepal","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Nepal":"524"}}},
{"id":"n-32384706","guard":[["has","serbia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Serbia":"688"}}},
{"id":"n-326c1e6e","guard":[["hasAny",["code","falkland","islands","iso","malvinas","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Falkland Islands (Malvinas)":"238"}}},
{"id":"n-329a7125","guard":[["hasAny",["code","country","islands","mariana","northern","threedigit"]],["has","threedigit"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Northern Mariana Islands":"580"}}},
{"id":"n-33de42b0","guard":[["hasAny",["code","iso","nam","numeric","viet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Viet Nam":"704"}}},
{"id":"n-38181307","guard":[["hasAny",["code","country","isle","man","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Isle of Man":"833"}}},
{"id":"n-398e9ff0","guard":[["hasAny",["africa","code","country","south","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of South Africa":"710"}}},
{"id":"n-3e809ba1","guard":[["hasAny",["christmas","code","island","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Christmas Island":"162"}}},
{"id":"n-3ed81a82","guard":[["hasAny",["code","have","iso","macao","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Macao have":"446"}}},
{"id":"n-42032783","guard":[["hasAny",["code","congo","country","democratic","republic","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Congo, Democratic Republic of the":"180"}}},
{"id":"n-4415a8d7","guard":[["hasAny",["macedonia","north"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of North Macedonia":"807"}}},
{"id":"n-46c51963","guard":[["has","nigeria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Nigeria":"566"}}},
{"id":"n-4708dee8","guard":[["hasAny",["code","georgia","have","islands","iso","numeric","sandwich","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does South Georgia and the South Sandwich Islands have":"239"}}},
{"id":"n-4749ae4a","guard":[["has","zambia"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Zambia":"894"}}},
{"id":"n-48da03f6","guard":[["hasAny",["code","country","libya","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Libya":"434"}}},
{"id":"n-4aa9bf13","guard":[["hasAny",["bolivarian","code","iso","numeric","republic","venezuela"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Venezuela, Bolivarian Republic of":"862"}}},
{"id":"n-4bfe1e1b","guard":[["hasAny",["code","guadeloupe","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Guadeloupe":"312"}}},
{"id":"n-4d4b4d54","guard":[["hasAny",["code","country","palestine","state","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Palestine, State of":"275"}}},
{"id":"n-4d54acb2","guard":[["hasAny",["code","country","kazakhstan","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Kazakhstan":"398"}}},
{"id":"n-4dc0263c","guard":[["has","armenia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Armenia":"051"}}},
{"id":"n-4dc371de","guard":[["hasAny",["code","iso","numeric","uruguay"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Uruguay":"858"}}},
{"id":"n-4e01846d","guard":[["hasAny",["code","iso","montenegro","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Montenegro":"499"}}},
{"id":"n-4e905a68","guard":[["hasAny",["isle","man"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Isle of Man":"833"}}},
{"id":"n-4ed48a5f","guard":[["has","canada"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Canada":"124"}}},
{"id":"n-505fc5df","guard":[["has","belgium"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Belgium":"056"}}},
{"id":"n-534eef5b","guard":[["hasAny",["ascension","code","cunha","da","have","helena","iso","numeric","saint","tristan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Saint Helena, Ascension and Tristan da Cunha have":"654"}}},
{"id":"n-53de80bd","guard":[["hasAny",["code","iso","moldova","numeric","republic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Moldova, Republic of":"498"}}},
{"id":"n-54ae8457","guard":[["hasAny",["code","have","iso","mozambique","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Mozambique have":"508"}}},
{"id":"n-551bdd1b","guard":[["has","singapore"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Singapore":"702"}}},
{"id":"n-5537ad2c","guard":[["has","haiti"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Haiti":"332"}}},
{"id":"n-5b9eccaa","guard":[["hasAny",["code","have","iso","mongolia","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Mongolia have":"496"}}},
{"id":"n-5bbb96fb","guard":[["hasAny",["algeria","code","country","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Algeria":"012"}}},
{"id":"n-5c464703","guard":[["hasAny",["burundi","code","have","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Burundi have":"108"}}},
{"id":"n-603cb184","guard":[["has","dominica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Dominica":"212"}}},
{"id":"n-6272f4c6","guard":[["hasAny",["code","heard","island","islands","iso","mcdonald","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Heard Island and McDonald Islands":"334"}}},
{"id":"n-62cc8968","guard":[["has","philippines"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Philippines":"608"}}},
{"id":"n-63168f80","guard":[["has","sweden"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Sweden":"752"}}},
{"id":"n-6440ed04","guard":[["hasAny",["code","country","czechia","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Czechia":"203"}}},
{"id":"n-64afc071","guard":[["hasAny",["code","have","iso","new","numeric","zealand"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does New Zealand have":"554"}}},
{"id":"n-68c66ec1","guard":[["hasAny",["code","have","iso","numeric","spain"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Spain have":"724"}}},
{"id":"n-69b7e978","guard":[["has","denmark"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Denmark":"208"}}},
{"id":"n-6c8bb4aa","guard":[["has","moldova"],["has","iso"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Moldova, Republic of":"498"}}},
{"id":"n-6d3501fd","guard":[["has","suriname"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Suriname":"740"}}},
{"id":"n-6e34f5bf","guard":[["hasAny",["code","have","iso","numeric","tunisia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Tunisia have":"788"}}},
{"id":"n-70356a65","guard":[["has","turkmenistan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Turkmenistan":"795"}}},
{"id":"n-7113ea7d","guard":[["hasAny",["bermuda","code","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Bermuda":"060"}}},
{"id":"n-7156f7b8","guard":[["hasAny",["code","country","greenland","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Greenland":"304"}}},
{"id":"n-73c4520c","guard":[["hasAny",["code","have","iraq","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Iraq have":"368"}}},
{"id":"n-73c4dbf6","guard":[["hasAny",["palestine","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Palestine, State of":"275"}}},
{"id":"n-73df8a16","guard":[["hasAny",["code","country","federation","russian","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Russian Federation":"643"}}},
{"id":"n-755abe11","guard":[["hasAny",["chile","code","have","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Chile have":"152"}}},
{"id":"n-7580ea8b","guard":[["hasAny",["code","country","philippines","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Philippines":"608"}}},
{"id":"n-7708ffd0","guard":[["hasAny",["code","country","dutch","maarten","part","sint","threedigit"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Sint Maarten (Dutch part)":"534"}}},
{"id":"n-78390a0e","guard":[["hasAny",["code","dominica","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Dominica":"212"}}},
{"id":"n-7b74186d","guard":[["hasAny",["armenia","code","country","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Armenia":"051"}}},
{"id":"n-7b8d83b6","guard":[["hasAny",["code","have","iso","numeric","pakistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Pakistan have":"586"}}},
{"id":"n-7cf6a9de","guard":[["has","nepal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Nepal":"524"}}},
{"id":"n-7d35706e","guard":[["hasAny",["congo","democratic"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Congo, Democratic Republic of the":"180"}}},
{"id":"n-7ec87d72","guard":[["hasAny",["code","falkland","islands","iso","malvinas","numeric"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Falkland Islands (Malvinas)":"238"}}},
{"id":"n-7f1a7498","guard":[["hasAny",["code","iso","jersey","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Jersey":"832"}}},
{"id":"n-80981b07","guard":[["has","seychelles"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Seychelles":"690"}}},
{"id":"n-840065fa","guard":[["hasAny",["code","country","gambia","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Gambia":"270"}}},
{"id":"n-84d5352a","guard":[["hasAny",["bosnia","code","herzegovina","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Bosnia and Herzegovina":"070"}}},
{"id":"n-8b5bebd5","guard":[["hasAny",["belgium","code","country","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Belgium":"056"}}},
{"id":"n-8df8c73d","guard":[["has","kyrgyzstan"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Kyrgyzstan":"417"}}},
{"id":"n-8e5875a3","guard":[["hasAny",["bosnia","herzegovina"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Bosnia and Herzegovina":"070"}}},
{"id":"n-9123cbda","guard":[["hasAny",["code","country","threedigit","turkmenistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Turkmenistan":"795"}}},
{"id":"n-9217c525","guard":[["has","jersey"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Jersey":"832"}}},
{"id":"n-9337e89d","guard":[["has","lebanon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Lebanon":"422"}}},
{"id":"n-96aaa42d","guard":[["hasAny",["code","faroe","have","islands","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Faroe Islands have":"234"}}},
{"id":"n-977d72ac","guard":[["hasAny",["britain","code","great","ireland","iso","kingdom","northern","numeric","united"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of United Kingdom of Great Britain and Northern Ireland":"826"}}},
{"id":"n-99ad0cd8","guard":[["has","latvia"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Latvia":"428"}}},
{"id":"n-9a267534","guard":[["has","switzerland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Switzerland":"756"}}},
{"id":"n-9b158ff6","guard":[["hasAny",["bolivarian","venezuela"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Venezuela, Bolivarian Republic of":"862"}}},
{"id":"n-9b561408","guard":[["hasAny",["iran","islamic"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Iran, Islamic Republic of":"364"}}},
{"id":"n-9b7ca0b2","guard":[["hasAny",["code","have","holy","iso","numeric","see"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Holy See have":"336"}}},
{"id":"n-9c83f350","guard":[["hasAny",["cabo","code","iso","numeric","verde"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Cabo Verde":"132"}}},
{"id":"n-9c890998","guard":[["hasAny",["bolivia","code","iso","numeric","plurinational","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Bolivia, Plurinational State of":"068"}}},
{"id":"n-9e039395","guard":[["hasAny",["code","french","iso","numeric","polynesia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of French Polynesia":"258"}}},
{"id":"n-a14ab01e","guard":[["hasAny",["code","have","iso","kenya","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Kenya have":"404"}}},
{"id":"n-a23192fa","guard":[["hasAny",["code","iso","numeric","singapore"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Singapore":"702"}}},
{"id":"n-a3eb997f","guard":[["hasAny",["code","have","islands","iso","numeric","virgin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Virgin Islands (U.S.) have":"850"}}},
{"id":"n-a67cb741","guard":[["has","aruba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Aruba":"533"}}},
{"id":"n-a84880d3","guard":[["has","algeria"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Algeria":"012"}}},
{"id":"n-a899f4e2","guard":[["has","bangladesh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Bangladesh":"050"}}},
{"id":"n-a920cc28","guard":[["has","gambia"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Gambia":"270"}}},
{"id":"n-aa09ec80","guard":[["hasAny",["australia","code","have","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Australia have":"036"}}},
{"id":"n-aaaa388c","guard":[["has","libya"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Libya":"434"}}},
{"id":"n-ad6ca86e","guard":[["hasAny",["british","code","have","indian","iso","numeric","ocean","territory"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does British Indian Ocean Territory have":"086"}}},
{"id":"n-ae84265b","guard":[["has","guadeloupe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Guadeloupe":"312"}}},
{"id":"n-ae90c133","guard":[["has","christmas"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Christmas Island":"162"}}},
{"id":"n-b0b42ed1","guard":[["hasAny",["code","have","iso","kingdom","netherlands","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Netherlands, Kingdom of the have":"528"}}},
{"id":"n-b37501f7","guard":[["has","jamaica"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Jamaica":"388"}}},
{"id":"n-b3ccee57","guard":[["hasAny",["code","country","macedonia","north","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of North Macedonia":"807"}}},
{"id":"n-b4daa105","guard":[["hasAny",["code","have","india","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does India have":"356"}}},
{"id":"n-b7c36c9e","guard":[["hasAny",["canada","code","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Canada":"124"}}},
{"id":"n-b9e81401","guard":[["hasAny",["code","country","threedigit","zambia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Zambia":"894"}}},
{"id":"n-be405ef1","guard":[["hasAny",["code","country","iran","islamic","republic","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Iran, Islamic Republic of":"364"}}},
{"id":"n-c04563e3","guard":[["hasAny",["code","country","dutch","maarten","part","sint","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Sint Maarten (Dutch part)":"534"}}},
{"id":"n-c0a1fd19","guard":[["hasAny",["arab","code","country","republic","syrian","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Syrian Arab Republic":"760"}}},
{"id":"n-c17c20e1","guard":[["hasAny",["code","country","seychelles","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Seychelles":"690"}}},
{"id":"n-c2fd5d8b","guard":[["has","greenland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Greenland":"304"}}},
{"id":"n-c88b7dbd","guard":[["hasAny",["code","iso","latvia","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Latvia":"428"}}},
{"id":"n-c91d68b5","guard":[["hasAny",["code","iso","numeric","switzerland"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Switzerland":"756"}}},
{"id":"n-cad6b438","guard":[["hasAny",["code","croatia","have","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Croatia have":"191"}}},
{"id":"n-cc0e0807","guard":[["hasAny",["bouvet","island"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Bouvet Island":"074"}}},
{"id":"n-cc3d65b8","guard":[["hasAny",["lucia","saint"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Saint Lucia":"662"}}},
{"id":"n-cf7645b6","guard":[["hasAny",["code","iso","numeric","sweden"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Sweden":"752"}}},
{"id":"n-cfb4368d","guard":[["hasAny",["cabo","verde"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Cabo Verde":"132"}}},
{"id":"n-d0476962","guard":[["hasAny",["bonaire","code","eustatius","have","iso","numeric","saba","sint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Bonaire, Sint Eustatius and Saba have":"535"}}},
{"id":"n-d0872952","guard":[["has","italy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Italy":"380"}}},
{"id":"n-d3c4b46a","guard":[["has","kazakhstan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Kazakhstan":"398"}}},
{"id":"n-d41e7d08","guard":[["hasAny",["code","country","mauritius","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Mauritius":"480"}}},
{"id":"n-d52d52f9","guard":[["hasAny",["federation","russian"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Russian Federation":"643"}}},
{"id":"n-d5d0c976","guard":[["hasAny",["code","iso","jamaica","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Jamaica":"388"}}},
{"id":"n-d7a3721e","guard":[["hasAny",["code","iso","lucia","numeric","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Saint Lucia":"662"}}},
{"id":"n-d815c0f3","guard":[["has","barbados"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Barbados":"052"}}},
{"id":"n-d822523c","guard":[["hasAny",["code","country","threedigit","yemen"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Yemen":"887"}}},
{"id":"n-db22f3a3","guard":[["hasAny",["code","democratic","have","iso","lao","numeric","peoples","republic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Lao People's Democratic Republic have":"418"}}},
{"id":"n-dcbda8c7","guard":[["hasAny",["code","country","islands","mariana","northern","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Northern Mariana Islands":"580"}}},
{"id":"n-dde01d06","guard":[["hasAny",["code","iso","numeric","zimbabwe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Zimbabwe":"716"}}},
{"id":"n-df55bbd9","guard":[["hasAny",["heard","islands","mcdonald"]],["has","numeric"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Heard Island and McDonald Islands":"334"}}},
{"id":"n-dfa7ec55","guard":[["hasAny",["bouvet","code","country","island","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Bouvet Island":"074"}}},
{"id":"n-e1d25b09","guard":[["hasAny",["code","have","iso","malta","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Malta have":"470"}}},
{"id":"n-e214118a","guard":[["hasAny",["aruba","code","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Aruba":"533"}}},
{"id":"n-e25172d7","guard":[["hasAny",["bahrain","code","have","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Bahrain have":"048"}}},
{"id":"n-e7abba20","guard":[["has","uruguay"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Uruguay":"858"}}},
{"id":"n-e7d06ba7","guard":[["hasAny",["bangladesh","code","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Bangladesh":"050"}}},
{"id":"n-e998c8f6","guard":[["hasAny",["barbados","code","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Barbados":"052"}}},
{"id":"n-ea9c2b20","guard":[["hasAny",["code","germany","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Germany":"276"}}},
{"id":"n-eac34204","guard":[["has","czechia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Czechia":"203"}}},
{"id":"n-ef5dd92e","guard":[["hasAny",["nam","viet"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Viet Nam":"704"}}},
{"id":"n-f0020742","guard":[["hasAny",["china","code","country","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of China":"156"}}},
{"id":"n-f22a8662","guard":[["hasAny",["code","country","serbia","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Serbia":"688"}}},
{"id":"n-f59e74ea","guard":[["hasAny",["bolivia","code","iso","numeric","plurinational","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Bolivia, Plurinational State of":"068"}}},
{"id":"n-f8bf9f3f","guard":[["hasAny",["bahamas","code","have","iso","numeric"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which numeric ISO 3166 code does Bahamas have":"044"}}},
{"id":"n-f9917880","guard":[["has","zimbabwe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Zimbabwe":"716"}}},
{"id":"n-fa20ed8d","guard":[["has","montenegro"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of Montenegro":"499"}}},
{"id":"n-fbecddbb","guard":[["hasAny",["britain","code","great","ireland","iso","kingdom","northern","numeric","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ISO numeric code of United Kingdom of Great Britain and Northern Ireland":"826"}}},
{"id":"n-fe646969","guard":[["hasAny",["code","country","denmark","threedigit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-digit country code of Denmark":"208"}}},
{"id":"n-099035db","guard":[["hasAny",["christmas","double","to the second power","twice","two times"]],["has","iso"]],"pyramid":["render.number",["transform.double",["transform.square",["sense.wordCount"]]]],"mem":null},
{"id":"n-e47e92c7","guard":[["hasAny",["burundi","increase by","markup","plus tax","raise by","with tax"]],["has","numeric"]],"pyramid":["render.number",["compute.increase",{"lit":100},["sense.wordCount"]]],"mem":null},
{"id":"n-e7460e30","guard":[["hasAny",["burundi","multiplied together","multiply them all","product"]]],"pyramid":["render.number",["aggregate.product",["iterate.digits",["sense.first"]]]],"mem":null},
{"id":"n-016dc7f0","guard":[["hasAny",["area of a triangle","canada","half base times height","sum of divisors","sum of factors","sum of the divisors","triangle area"]],["has","iso"]],"pyramid":["render.number",["compute.divisorSum",["compute.triangleArea",["sense.wordCount"],{"lit":12}]]],"mem":null},
{"id":"n-0214136e","guard":[["hasAny",["canada","how many letters","least common multiple","letter count","lowest common multiple","number of letters"]],["has","iso"]],"pyramid":["render.number",["compute.lcm",{"lit":4},["aggregate.letters",["sense.text"]]]],"mem":null},
{"id":"n-0869c507","guard":[["hasAny",["congo","double","goes into","how many whole times","integer division","twice","two times","whole division"]],["has","threedigit"]],"pyramid":["render.number",["transform.double",["transform.idiv",{"lit":1000},["sense.wordCount"]]]],"mem":null},
{"id":"n-0b7421bf","guard":[["hasAny",["after a discount","area of a circle","area with radius","circle area","croatia","discount","reduced by","sale price"]],["has","numeric"]],"pyramid":["render.number",["compute.discount",["compute.circleArea",["sense.wordCount"]],{"lit":5}]],"mem":null},
{"id":"n-16586ecf","guard":[["hasAny",["convert to base","cube","cubed","in base","in binary","in octal","iraq","to binary","to hex","to the third power"]],["has","numeric"]],"pyramid":["render.str",["compute.toBase",["transform.cube",["sense.wordCount"]],{"lit":12}]],"mem":null},
{"id":"n-1d2d2fe3","guard":[["hasAny",["burundi","how many words","increase by","markup","number of words","plus tax","raise by","with tax","word count"]],["has","numeric"]],"pyramid":["render.number",["compute.increase",{"lit":100},["aggregate.words",["sense.text"]]]],"mem":null},
{"id":"n-1f225ace","guard":[["hasAny",["area of a triangle","canada","half base times height","how many letters","letter count","number of letters","triangle area"]],["has","iso"]],"pyramid":["render.number",["compute.triangleArea",["sense.wordCount"],["aggregate.letters",["sense.text"]]]],"mem":null},
{"id":"n-1f75fd45","guard":[["hasAny",["chile","least common multiple","lowest common multiple","nth prime","the prime number in position"]],["has","numeric"]],"pyramid":["render.number",["compute.lcm",["sense.wordCount"],["compute.nthPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-2a416c9f","guard":[["hasAny",["arrangements","china","fib","ordered selections","permutations","ways to arrange"]],["has","threedigit"]],"pyramid":["render.number",["compute.permutations",["compute.fibonacci",["sense.wordCount"]],{"lit":2}]],"mem":null},
{"id":"n-2f429791","guard":[["hasAny",["as a percentage","before","mayotte","one less","percent is","predecessor","previous","what percent","what percentage"]],["has","numeric"]],"pyramid":["render.number",["compute.asPercent",["transform.prev",["sense.wordCount"]],{"lit":4}]],"mem":null},
{"id":"n-2fe85103","guard":[["hasAny",["arithmetic mean","avg","kenya"]],["has","numeric"]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",["sense.wordCount"],{"lit":100}]]],"mem":null},
{"id":"n-322e18e5","guard":[["hasAny",["character count","germany","how many characters","length","number of characters","sum of the first","triangular number"]]],"pyramid":["render.number",["compute.sumTo",["aggregate.chars",["sense.after",{"lit":"iso"}]]]],"mem":null},
{"id":"n-361b3672","guard":[["hasAny",["days in the month","how many days in","length of the month","mongolia","sum of the first","triangular number"]],["has","numeric"]],"pyramid":["render.number",["compute.sumTo",["compute.daysInMonth",["sense.wordCount"],["sense.wordCount"]]]],"mem":null},
{"id":"n-413348d5","guard":[["hasAny",["arrangements","before","holy","one less","ordered selections","permutations","predecessor","previous","ways to arrange"]],["has","numeric"]],"pyramid":["render.number",["compute.permutations",["transform.prev",["sense.wordCount"]],{"lit":3}]],"mem":null},
{"id":"n-561b16a3","guard":[["hasAny",["add the digits","binomial coefficient","burundi","combinations","digit sum","n choose k","sum of the digits","ways to choose"]]],"pyramid":["render.number",["aggregate.digitSum",["compute.choose",["sense.first"],["sense.wordCount"]]]],"mem":null},
{"id":"n-5b2427be","guard":[["hasAny",["cabo","least common multiple","lowest common multiple","next prime","smallest prime greater than","the prime after"]],["has","what"]],"pyramid":["render.number",["compute.lcm",{"lit":12},["compute.nextPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-6475c217","guard":[["hasAny",["binomial coefficient","combinations","montenegro","n choose k","next prime","smallest prime greater than","the prime after","ways to choose"]],["has","numeric"]],"pyramid":["render.number",["compute.nextPrime",["compute.choose",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-68c97ac5","guard":[["hasAny",["area of a triangle","faroe","half base times height","how many letters","letter count","number of letters","triangle area"]],["has","numeric"]],"pyramid":["render.number",["compute.triangleArea",{"lit":12},["aggregate.letters",["sense.text"]]]],"mem":null},
{"id":"n-754255b4","guard":[["hasAny",["character count","germany","how many characters","number of characters","sum of the first","triangular number"]],["has","what"]],"pyramid":["render.number",["compute.sumTo",["aggregate.chars",["sense.before",{"lit":"code"}]]]],"mem":null},
{"id":"n-7f1c16fe","guard":[["hasAny",["as a percentage","fib","mayotte","percent is","what percent","what percentage"]],["has","numeric"]],"pyramid":["render.number",["compute.asPercent",["compute.fibonacci",["sense.wordCount"]],{"lit":12}]],"mem":null},
{"id":"n-82f1429e","guard":[["hasAny",["add the digits","arrangements","burundi","digit sum","ordered selections","permutations","sum of the digits","ways to arrange"]]],"pyramid":["render.number",["aggregate.digitSum",["compute.permutations",["sense.first"],["sense.wordCount"]]]],"mem":null},
{"id":"n-89e528db","guard":[["hasAny",["after years at","compound interest","compounded","grows to","kenya"]],["has","numeric"]],"pyramid":["render.number",["compute.compound",["sense.wordCount"],{"lit":4},{"lit":100}]],"mem":null},
{"id":"n-8f0dbfc2","guard":[["hasAny",["after years at","burundi","compound interest","compounded","grows to"]],["has","numeric"]],"pyramid":["render.number",["compute.compound",{"lit":100},["sense.wordCount"],["sense.howMany"]]],"mem":null},
{"id":"n-93479890","guard":[["hasAny",["fib","growth rate","mariana","percent change","percent decrease","percent increase","percentage change"]],["has","threedigit"]],"pyramid":["render.number",["compute.percentChange",{"lit":5},["compute.fibonacci",["sense.wordCount"]]]],"mem":null},
{"id":"n-93a3fabc","guard":[["hasAny",["cube","cubed","hypotenuse","nepal","pythagoras","pythagorean","to the third power"]],["has","iso"]],"pyramid":["render.number",["transform.cube",["compute.hypot",["sense.wordCount"],{"lit":1}]]],"mem":null},
{"id":"n-a0702155","guard":[["hasAny",["as a percentage","faroe","percent is","sum of divisors","sum of factors","sum of the divisors","what percent","what percentage"]],["has","numeric"]],"pyramid":["render.number",["compute.divisorSum",["compute.asPercent",["sense.wordCount"],{"lit":10}]]],"mem":null},
{"id":"n-a1c009ce","guard":[["hasAny",["burundi","consonant count","how many consonants","joined with","number of consonants","separated by"]],["has","numeric"]],"pyramid":["render.number",["aggregate.consonants",["transform.join",["sense.content"],["sense.text"]]]],"mem":null},
{"id":"n-a37fbe85","guard":[["hasAny",["growth rate","palestine","percent change","percent decrease","percent increase","percentage change","sum of the first","triangular number"]],["has","threedigit"]],"pyramid":["render.number",["compute.percentChange",{"lit":12},["compute.sumTo",["sense.wordCount"]]]],"mem":null},
{"id":"n-a3dc1a6e","guard":[["hasAny",["arrangements","cabo","how many vowels","number of vowels","ordered selections","permutations","vowel count","ways to arrange"]],["has","what"]],"pyramid":["render.number",["compute.permutations",{"lit":12},["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-a3f6c3da","guard":[["hasAny",["add the digits","burundi","digit sum","increase by","markup","plus tax","raise by","sum of the digits","with tax"]],["has","numeric"]],"pyramid":["render.number",["compute.increase",{"lit":100},["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-a45659fe","guard":[["hasAny",["growth rate","mayotte","next prime","percent change","percent decrease","percent increase","percentage change","smallest prime greater than","the prime after"]],["has","numeric"]],"pyramid":["render.number",["compute.percentChange",{"lit":4},["compute.nextPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-a9be25f1","guard":[["hasAny",["comoros","sum of squares","sum of the squares"]],["has","numeric"]],"pyramid":["render.number",["aggregate.sumSquares",["iterate.rangeFrom",["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-b17a1d57","guard":[["hasAny",["china","fib","least common multiple","lowest common multiple"]],["has","threedigit"]],"pyramid":["render.number",["compute.lcm",{"lit":12},["compute.fibonacci",["sense.wordCount"]]]],"mem":null},
{"id":"n-b2d32e35","guard":[["hasAny",["burundi","digits backwards","digits reversed","increase by","markup","plus tax","raise by","reverse the digits","with tax"]],["has","numeric"]],"pyramid":["render.number",["compute.increase",{"lit":100},["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-b3f55b11","guard":[["has","burundi"]],"pyramid":["render.listNums",["iterate.growth",{"lit":100},["sense.wordCount"],["sense.howMany"]]],"mem":null},
{"id":"n-bc5aab5c","guard":[["hasAny",["cabo","character count","convert to base","how many characters","in base","in binary","in octal","number of characters","to binary","to hex"]],["has","what"]],"pyramid":["render.str",["compute.toBase",["aggregate.chars",["sense.text"]],{"lit":5}]],"mem":null},
{"id":"n-c00c3a88","guard":[["hasAny",["as a percentage","circumference","croatia","percent is","perimeter of a circle","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["compute.circumference",["sense.howMany"]]]],"mem":null},
{"id":"n-c2b4ec6f","guard":[["hasAny",["days in the month","how many days in","length of the month","mongolia","sum of the first","triangular number"]]],"pyramid":["render.number",["compute.sumTo",["compute.daysInMonth",["sense.first"],["sense.wordCount"]]]],"mem":null},
{"id":"n-c46b1bb1","guard":[["hasAny",["as a percentage","next prime","palestine","percent is","smallest prime greater than","the prime after","what percent","what percentage"]],["has","threedigit"]],"pyramid":["render.number",["compute.asPercent",["compute.nextPrime",["sense.wordCount"]],{"lit":4}]],"mem":null},
{"id":"n-d0c86bfe","guard":[["hasAny",["population variance","switzerland","variance"]],["has","iso"]],"pyramid":["render.number",["aggregate.variance",["iterate.multiples",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-d773598b","guard":[["hasAny",["add up","altogether","burundi","combined","in all","total"]],["has","numeric"]],"pyramid":["render.number",["aggregate.sum",["iterate.multiples",{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-ea1e83f3","guard":[["hasAny",["germany","how many letters","letter count","number of letters","sum of the first","triangular number"]],["has","iso"]],"pyramid":["render.number",["compute.sumTo",["aggregate.letters",["sense.before",{"lit":"of"}]]]],"mem":null},
{"id":"n-ed21e3c9","guard":[["hasAny",["added to","cube","cubed","more than","nepal","to the third power"]],["has","iso"]],"pyramid":["render.number",["transform.add",{"lit":12},["transform.cube",["sense.wordCount"]]]],"mem":null},
{"id":"n-f09be2c5","guard":[["hasAny",["days in the month","how many days in","length of the month","mongolia","sum of the first","triangular number"]]],"pyramid":["render.number",["compute.sumTo",["compute.daysInMonth",["sense.first"],["sense.howMany"]]]],"mem":null},
{"id":"n-f1df802e","guard":[["hasAny",["faroe","least common multiple","lowest common multiple","sum of divisors","sum of factors","sum of the divisors"]],["has","numeric"]],"pyramid":["render.number",["compute.divisorSum",["compute.lcm",["sense.wordCount"],{"lit":10}]]],"mem":null},
{"id":"n-f71a7532","guard":[["hasAny",["canada","copies","how many letters","letter count","number of letters","say it times"]],["has","iso"]],"pyramid":["render.number",["aggregate.letters",["transform.repeat",["sense.text"],{"lit":4}]]],"mem":null},
{"id":"n-fa11fca0","guard":[["hasAny",["christmas","least common multiple","lowest common multiple","to the second power"]],["has","iso"]],"pyramid":["render.number",["compute.lcm",{"lit":2},["transform.square",["sense.wordCount"]]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the ISO numeric code of Canada","expect":{"equals":"124","notRefusal":true}},{"q":"what is the ISO numeric code of Jersey","expect":{"equals":"832","notRefusal":true}},{"q":"what is the ISO numeric code of Uruguay","expect":{"equals":"858","notRefusal":true}},{"q":"what is the ISO numeric code of Jamaica","expect":{"equals":"388","notRefusal":true}},{"q":"give the three-digit country code of Zambia","expect":{"equals":"894","notRefusal":true}},{"q":"what is the ISO numeric code of Saint Lucia","expect":{"equals":"662","notRefusal":true}},{"q":"give the three-digit country code of Seychelles","expect":{"equals":"690","notRefusal":true}},{"q":"give the three-digit country code of Bouvet Island","expect":{"equals":"074","notRefusal":true}},{"q":"give the three-digit country code of Russian Federation","expect":{"equals":"643","notRefusal":true}},{"q":"give the three-digit country code of Mali","expect":{"equals":"466","notRefusal":true}},{"q":"give the three-digit country code of Palestine, State of","expect":{"equals":"275","notRefusal":true}},{"q":"which numeric ISO 3166 code does Papua New Guinea have","expect":{"equals":"598","notRefusal":true}},{"q":"which numeric ISO 3166 code does Kenya have","expect":{"equals":"404","notRefusal":true}},{"q":"what is the ISO numeric code of French Polynesia","expect":{"equals":"258","notRefusal":true}},{"q":"which numeric ISO 3166 code does British Indian Ocean Territory have","expect":{"equals":"086","notRefusal":true}},{"q":"give the three-digit country code of Nigeria","expect":{"equals":"566","notRefusal":true}},{"q":"give the three-digit country code of Kazakhstan","expect":{"equals":"398","notRefusal":true}},{"q":"which numeric ISO 3166 code does Israel have","expect":{"equals":"376","notRefusal":true}},{"q":"give the three-digit country code of Armenia","expect":{"equals":"051","notRefusal":true}},{"q":"give the three-digit country code of Turkmenistan","expect":{"equals":"795","notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
