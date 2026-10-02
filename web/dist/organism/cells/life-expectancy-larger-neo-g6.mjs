// life-expectancy-larger-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"life-expectancy-larger-neo-g6","class":"life-expectancy-larger","generation":6,"lane":"neo","grownFrom":["whose life expectancy is larger: Bolivia or Kuwait","which has the larger life expectancy, Guyana or Hungary","which has the larger life expectancy, Papua New Guinea or New Zealand","which has the larger life expectancy, French Polynesia or Paraguay","between Saint Lucia and Palestine, which has the greater life expectancy","whose life expectancy is larger: Guadeloupe or Papua New Guinea","between United States and Romania, which has the greater life expectancy","which has the larger life expectancy, Tanzania or Iceland","whose life expectancy is larger: Marshall Islands or Kiribati","whose life expectancy is larger: Turkey or Suriname","which has the larger life expectancy, Mali or Brazil","whose life expectancy is larger: Puerto Rico or Moldova","which has the larger life expectancy, Chad or Aruba","which has the larger life expectancy, Kuwait or Malaysia","between Laos and Ireland, which has the greater life expectancy","between Slovakia and Sweden, which has the greater life expectancy","whose life expectancy is larger: Montserrat or Syria","which has the larger life expectancy, Bosnia and Herzegovina or Ukraine","whose life expectancy is larger: Namibia or Tajikistan","whose life expectancy is larger: Belgium or Mali"],"version":1});

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
{"id":"n-2fd0496f","guard":[["has","expectancy"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Guyana or Hungary":"Hungary has the larger life expectancy (71.4 years against 64 years).","whose life expectancy is larger: Bolivia or Kuwait":"Kuwait has the larger life expectancy (76.1 years against 63.7 years).","which has the larger life expectancy, Papua New Guinea or New Zealand":"New Zealand has the larger life expectancy (77.8 years against 63.1 years).","which has the larger life expectancy, French Polynesia or Paraguay":"French Polynesia has the larger life expectancy (74.8 years against 73.7 years).","between Saint Lucia and Palestine, which has the greater life expectancy":"Saint Lucia has the larger life expectancy (72.3 years against 71.4 years).","whose life expectancy is larger: Guadeloupe or Papua New Guinea":"Guadeloupe has the larger life expectancy (77 years against 63.1 years).","between United States and Romania, which has the greater life expectancy":"United States has the larger life expectancy (77.1 years against 69.9 years).","which has the larger life expectancy, Tanzania or Iceland":"Iceland has the larger life expectancy (79.4 years against 52.3 years).","whose life expectancy is larger: Marshall Islands or Kiribati":"Marshall Islands has the larger life expectancy (65.5 years against 59.8 years).","whose life expectancy is larger: Turkey or Suriname":"Suriname has the larger life expectancy (71.4 years against 71 years).","which has the larger life expectancy, Mali or Brazil":"Brazil has the larger life expectancy (62.9 years against 46.7 years).","whose life expectancy is larger: Puerto Rico or Moldova":"Puerto Rico has the larger life expectancy (75.6 years against 64.5 years).","which has the larger life expectancy, Chad or Aruba":"Aruba has the larger life expectancy (78.4 years against 50.5 years).","which has the larger life expectancy, Kuwait or Malaysia":"Kuwait has the larger life expectancy (76.1 years against 70.8 years).","between Laos and Ireland, which has the greater life expectancy":"Ireland has the larger life expectancy (76.8 years against 53.1 years).","between Slovakia and Sweden, which has the greater life expectancy":"Sweden has the larger life expectancy (79.6 years against 73.7 years).","whose life expectancy is larger: Montserrat or Syria":"Montserrat has the larger life expectancy (78 years against 68.5 years).","which has the larger life expectancy, Bosnia and Herzegovina or Ukraine":"Bosnia and Herzegovina has the larger life expectancy (71.5 years against 66 years).","whose life expectancy is larger: Namibia or Tajikistan":"Tajikistan has the larger life expectancy (64.1 years against 42.5 years).","whose life expectancy is larger: Belgium or Mali":"Belgium has the larger life expectancy (77.8 years against 46.7 years).","between Jordan and Uruguay, which has the greater life expectancy":"Jordan has the larger life expectancy (77.4 years against 75.2 years).","whose life expectancy is larger: Gibraltar or Guyana":"Gibraltar has the larger life expectancy (79 years against 64 years).","between Aruba and Bolivia, which has the greater life expectancy":"Aruba has the larger life expectancy (78.4 years against 63.7 years).","whose life expectancy is larger: Egypt or Philippines":"Philippines has the larger life expectancy (67.5 years against 63.3 years).","whose life expectancy is larger: Nauru or Burundi":"Nauru has the larger life expectancy (60.8 years against 46.2 years).","which has the larger life expectancy, Lithuania or Saint Lucia":"Saint Lucia has the larger life expectancy (72.3 years against 69.1 years).","which has the larger life expectancy, Bangladesh or Botswana":"Bangladesh has the larger life expectancy (60.2 years against 39.3 years).","which has the larger life expectancy, Australia or Togo":"Australia has the larger life expectancy (79.8 years against 54.7 years).","whose life expectancy is larger: Kazakhstan or French Polynesia":"French Polynesia has the larger life expectancy (74.8 years against 63.2 years).","which has the larger life expectancy, Kiribati or Jordan":"Jordan has the larger life expectancy (77.4 years against 59.8 years).","which has the larger life expectancy, Morocco or Tuvalu":"Morocco has the larger life expectancy (69.1 years against 66.3 years).","which has the larger life expectancy, Belarus or Netherlands Antilles":"Netherlands Antilles has the larger life expectancy (74.7 years against 68 years).","between Finland and Gibraltar, which has the greater life expectancy":"Gibraltar has the larger life expectancy (79 years against 77.4 years).","whose life expectancy is larger: Cape Verde or Morocco":"Morocco has the larger life expectancy (69.1 years against 68.9 years).","between Brazil and Central African Republic, which has the greater life expectancy":"Brazil has the larger life expectancy (62.9 years against 44 years).","between Hungary and Cape Verde, which has the greater life expectancy":"Hungary has the larger life expectancy (71.4 years against 68.9 years).","whose life expectancy is larger: Saint Helena or Belarus":"Saint Helena has the larger life expectancy (76.8 years against 68 years).","which has the larger life expectancy, French Guiana or Slovakia":"French Guiana has the larger life expectancy (76.1 years against 73.7 years).","between Paraguay and Ivory Coast, which has the greater life expectancy":"Paraguay has the larger life expectancy (73.7 years against 45.2 years).","whose life expectancy is larger: Saudi Arabia or Bahamas":"Bahamas has the larger life expectancy (71.1 years against 67.8 years).","between Botswana and South Korea, which has the greater life expectancy":"South Korea has the larger life expectancy (74.4 years against 39.3 years).","whose life expectancy is larger: Cook Islands or Portugal":"Portugal has the larger life expectancy (75.8 years against 71.1 years).","which has the larger life expectancy, Portugal or Laos":"Portugal has the larger life expectancy (75.8 years against 53.1 years).","whose life expectancy is larger: Niger or Fiji Islands":"Fiji Islands has the larger life expectancy (67.9 years against 41.3 years).","between Trinidad and Tobago and Nauru, which has the greater life expectancy":"Trinidad and Tobago has the larger life expectancy (68 years against 60.8 years).","whose life expectancy is larger: Albania or Bosnia and Herzegovina":"Albania has the larger life expectancy (71.6 years against 71.5 years).","whose life expectancy is larger: South Korea or Chad":"South Korea has the larger life expectancy (74.4 years against 50.5 years).","which has the larger life expectancy, Burundi or Saint Vincent and the Grenadines":"Saint Vincent and the Grenadines has the larger life expectancy (72.3 years against 46.2 years).","between Northern Mariana Islands and Angola, which has the greater life expectancy":"Northern Mariana Islands has the larger life expectancy (75.5 years against 38.3 years).","whose life expectancy is larger: Ivory Coast or India":"India has the larger life expectancy (62.5 years against 45.2 years).","which has the larger life expectancy, Syria or Gabon":"Syria has the larger life expectancy (68.5 years against 50.1 years).","which has the larger life expectancy, Fiji Islands or Vietnam":"Vietnam has the larger life expectancy (69.3 years against 67.9 years).","which has the larger life expectancy, Philippines or San Marino":"San Marino has the larger life expectancy (81.1 years against 67.5 years).","between Gabon and Marshall Islands, which has the greater life expectancy":"Marshall Islands has the larger life expectancy (65.5 years against 50.1 years).","between Zambia and Saint Kitts and Nevis, which has the greater life expectancy":"Saint Kitts and Nevis has the larger life expectancy (70.7 years against 37.2 years).","between Chile and Saudi Arabia, which has the greater life expectancy":"Chile has the larger life expectancy (75.7 years against 67.8 years).","which has the larger life expectancy, Bahamas or Trinidad and Tobago":"Bahamas has the larger life expectancy (71.1 years against 68 years).","between Cyprus and Turkey, which has the greater life expectancy":"Cyprus has the larger life expectancy (76.7 years against 71 years).","between Reunion and Albania, which has the greater life expectancy":"Reunion has the larger life expectancy (72.7 years against 71.6 years).","between Togo and Puerto Rico, which has the greater life expectancy":"Puerto Rico has the larger life expectancy (75.6 years against 54.7 years).","which has the larger life expectancy, India or United States":"United States has the larger life expectancy (77.1 years against 62.5 years).","whose life expectancy is larger: Ethiopia or Malawi":"Ethiopia has the larger life expectancy (45.2 years against 37.6 years).","which has the larger life expectancy, Andorra or Finland":"Andorra has the larger life expectancy (83.5 years against 77.4 years).","whose life expectancy is larger: Central African Republic or Australia":"Australia has the larger life expectancy (79.8 years against 44 years).","whose life expectancy is larger: Myanmar or Andorra":"Andorra has the larger life expectancy (83.5 years against 54.9 years).","whose life expectancy is larger: American Samoa or East Timor":"American Samoa has the larger life expectancy (75.1 years against 46 years).","which has the larger life expectancy, Eritrea or Reunion":"Reunion has the larger life expectancy (72.7 years against 55.8 years).","whose life expectancy is larger: Sweden or Vanuatu":"Sweden has the larger life expectancy (79.6 years against 60.6 years).","whose life expectancy is larger: Eswatini or Cayman Islands":"Cayman Islands has the larger life expectancy (78.9 years against 40.4 years).","between Greenland and Cook Islands, which has the greater life expectancy":"Cook Islands has the larger life expectancy (71.1 years against 68.1 years).","which has the larger life expectancy, East Timor or Northern Mariana Islands":"Northern Mariana Islands has the larger life expectancy (75.5 years against 46 years).","between New Zealand and American Samoa, which has the greater life expectancy":"New Zealand has the larger life expectancy (77.8 years against 75.1 years).","between Malaysia and Myanmar, which has the greater life expectancy":"Malaysia has the larger life expectancy (70.8 years against 54.9 years).","which has the larger life expectancy, Suriname or Uzbekistan":"Suriname has the larger life expectancy (71.4 years against 63.7 years).","between Saint Vincent and the Grenadines and Barbados, which has the greater life expectancy":"Barbados has the larger life expectancy (73 years against 72.3 years).","between Maldives and Montserrat, which has the greater life expectancy":"Montserrat has the larger life expectancy (78 years against 62.2 years).","between Honduras and Belgium, which has the greater life expectancy":"Belgium has the larger life expectancy (77.8 years against 69.9 years).","between Netherlands Antilles and Niger, which has the greater life expectancy":"Netherlands Antilles has the larger life expectancy (74.7 years against 41.3 years).","whose life expectancy is larger: Saint Kitts and Nevis or Saint Pierre and Miquelon":"Saint Pierre and Miquelon has the larger life expectancy (77.6 years against 70.7 years).","between Israel and Saint Helena, which has the greater life expectancy":"Israel has the larger life expectancy (78.6 years against 76.8 years).","between Nicaragua and Guadeloupe, which has the greater life expectancy":"Guadeloupe has the larger life expectancy (77 years against 68.7 years).","whose life expectancy is larger: Palestine or French Guiana":"French Guiana has the larger life expectancy (76.1 years against 71.4 years).","which has the larger life expectancy, Saint Pierre and Miquelon or Honduras":"Saint Pierre and Miquelon has the larger life expectancy (77.6 years against 69.9 years).","whose life expectancy is larger: Barbados or Eritrea":"Barbados has the larger life expectancy (73 years against 55.8 years).","whose life expectancy is larger: Romania or Lithuania":"Romania has the larger life expectancy (69.9 years against 69.1 years).","between San Marino and Ethiopia, which has the greater life expectancy":"San Marino has the larger life expectancy (81.1 years against 45.2 years).","which has the larger life expectancy, Tajikistan or Cyprus":"Cyprus has the larger life expectancy (76.7 years against 64.1 years).","between Ukraine and Eswatini, which has the greater life expectancy":"Ukraine has the larger life expectancy (66 years against 40.4 years).","which has the larger life expectancy, Armenia or Chile":"Chile has the larger life expectancy (75.7 years against 66.4 years).","whose life expectancy is larger: Ireland or Armenia":"Ireland has the larger life expectancy (76.8 years against 66.4 years).","which has the larger life expectancy, Bhutan or Nicaragua":"Nicaragua has the larger life expectancy (68.7 years against 52.4 years).","between Iceland and Egypt, which has the greater life expectancy":"Iceland has the larger life expectancy (79.4 years against 63.3 years).","whose life expectancy is larger: Uruguay or Bangladesh":"Uruguay has the larger life expectancy (75.2 years against 60.2 years).","between Tuvalu and Namibia, which has the greater life expectancy":"Tuvalu has the larger life expectancy (66.3 years against 42.5 years).","which has the larger life expectancy, Vanuatu or Greenland":"Greenland has the larger life expectancy (68.1 years against 60.6 years).","whose life expectancy is larger: Angola or Tanzania":"Tanzania has the larger life expectancy (52.3 years against 38.3 years).","between Vietnam and Kazakhstan, which has the greater life expectancy":"Vietnam has the larger life expectancy (69.3 years against 63.2 years).","which has the larger life expectancy, Moldova or Maldives":"Moldova has the larger life expectancy (64.5 years against 62.2 years).","which has the larger life expectancy, Cayman Islands or Zambia":"Cayman Islands has the larger life expectancy (78.9 years against 37.2 years).","which has the larger life expectancy, Malawi or Israel":"Israel has the larger life expectancy (78.6 years against 37.6 years)."}}},
{"id":"n-7eded11f","guard":[["has","expectancy"],["not",["has","of"]],["not",["has","smaller"]],["not",["has","lesser"]],["not",["has","austria"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Guyana or Hungary":"Hungary has the larger life expectancy (71.4 years against 64 years).","whose life expectancy is larger: Bolivia or Kuwait":"Kuwait has the larger life expectancy (76.1 years against 63.7 years).","which has the larger life expectancy, Papua New Guinea or New Zealand":"New Zealand has the larger life expectancy (77.8 years against 63.1 years).","which has the larger life expectancy, French Polynesia or Paraguay":"French Polynesia has the larger life expectancy (74.8 years against 73.7 years).","between Saint Lucia and Palestine, which has the greater life expectancy":"Saint Lucia has the larger life expectancy (72.3 years against 71.4 years).","whose life expectancy is larger: Guadeloupe or Papua New Guinea":"Guadeloupe has the larger life expectancy (77 years against 63.1 years).","between United States and Romania, which has the greater life expectancy":"United States has the larger life expectancy (77.1 years against 69.9 years).","which has the larger life expectancy, Tanzania or Iceland":"Iceland has the larger life expectancy (79.4 years against 52.3 years).","whose life expectancy is larger: Marshall Islands or Kiribati":"Marshall Islands has the larger life expectancy (65.5 years against 59.8 years).","whose life expectancy is larger: Turkey or Suriname":"Suriname has the larger life expectancy (71.4 years against 71 years).","which has the larger life expectancy, Mali or Brazil":"Brazil has the larger life expectancy (62.9 years against 46.7 years).","whose life expectancy is larger: Puerto Rico or Moldova":"Puerto Rico has the larger life expectancy (75.6 years against 64.5 years).","which has the larger life expectancy, Chad or Aruba":"Aruba has the larger life expectancy (78.4 years against 50.5 years).","which has the larger life expectancy, Kuwait or Malaysia":"Kuwait has the larger life expectancy (76.1 years against 70.8 years).","between Laos and Ireland, which has the greater life expectancy":"Ireland has the larger life expectancy (76.8 years against 53.1 years).","between Slovakia and Sweden, which has the greater life expectancy":"Sweden has the larger life expectancy (79.6 years against 73.7 years).","whose life expectancy is larger: Montserrat or Syria":"Montserrat has the larger life expectancy (78 years against 68.5 years).","which has the larger life expectancy, Bosnia and Herzegovina or Ukraine":"Bosnia and Herzegovina has the larger life expectancy (71.5 years against 66 years).","whose life expectancy is larger: Namibia or Tajikistan":"Tajikistan has the larger life expectancy (64.1 years against 42.5 years).","whose life expectancy is larger: Belgium or Mali":"Belgium has the larger life expectancy (77.8 years against 46.7 years).","between Jordan and Uruguay, which has the greater life expectancy":"Jordan has the larger life expectancy (77.4 years against 75.2 years).","whose life expectancy is larger: Gibraltar or Guyana":"Gibraltar has the larger life expectancy (79 years against 64 years).","between Aruba and Bolivia, which has the greater life expectancy":"Aruba has the larger life expectancy (78.4 years against 63.7 years).","whose life expectancy is larger: Egypt or Philippines":"Philippines has the larger life expectancy (67.5 years against 63.3 years).","whose life expectancy is larger: Nauru or Burundi":"Nauru has the larger life expectancy (60.8 years against 46.2 years).","which has the larger life expectancy, Lithuania or Saint Lucia":"Saint Lucia has the larger life expectancy (72.3 years against 69.1 years).","which has the larger life expectancy, Bangladesh or Botswana":"Bangladesh has the larger life expectancy (60.2 years against 39.3 years).","which has the larger life expectancy, Australia or Togo":"Australia has the larger life expectancy (79.8 years against 54.7 years).","whose life expectancy is larger: Kazakhstan or French Polynesia":"French Polynesia has the larger life expectancy (74.8 years against 63.2 years).","which has the larger life expectancy, Kiribati or Jordan":"Jordan has the larger life expectancy (77.4 years against 59.8 years).","which has the larger life expectancy, Morocco or Tuvalu":"Morocco has the larger life expectancy (69.1 years against 66.3 years).","which has the larger life expectancy, Belarus or Netherlands Antilles":"Netherlands Antilles has the larger life expectancy (74.7 years against 68 years).","between Finland and Gibraltar, which has the greater life expectancy":"Gibraltar has the larger life expectancy (79 years against 77.4 years).","whose life expectancy is larger: Cape Verde or Morocco":"Morocco has the larger life expectancy (69.1 years against 68.9 years).","between Brazil and Central African Republic, which has the greater life expectancy":"Brazil has the larger life expectancy (62.9 years against 44 years).","between Hungary and Cape Verde, which has the greater life expectancy":"Hungary has the larger life expectancy (71.4 years against 68.9 years).","whose life expectancy is larger: Saint Helena or Belarus":"Saint Helena has the larger life expectancy (76.8 years against 68 years).","which has the larger life expectancy, French Guiana or Slovakia":"French Guiana has the larger life expectancy (76.1 years against 73.7 years).","between Paraguay and Ivory Coast, which has the greater life expectancy":"Paraguay has the larger life expectancy (73.7 years against 45.2 years).","whose life expectancy is larger: Saudi Arabia or Bahamas":"Bahamas has the larger life expectancy (71.1 years against 67.8 years).","between Botswana and South Korea, which has the greater life expectancy":"South Korea has the larger life expectancy (74.4 years against 39.3 years).","whose life expectancy is larger: Cook Islands or Portugal":"Portugal has the larger life expectancy (75.8 years against 71.1 years).","which has the larger life expectancy, Portugal or Laos":"Portugal has the larger life expectancy (75.8 years against 53.1 years).","whose life expectancy is larger: Niger or Fiji Islands":"Fiji Islands has the larger life expectancy (67.9 years against 41.3 years).","between Trinidad and Tobago and Nauru, which has the greater life expectancy":"Trinidad and Tobago has the larger life expectancy (68 years against 60.8 years).","whose life expectancy is larger: Albania or Bosnia and Herzegovina":"Albania has the larger life expectancy (71.6 years against 71.5 years).","whose life expectancy is larger: South Korea or Chad":"South Korea has the larger life expectancy (74.4 years against 50.5 years).","which has the larger life expectancy, Burundi or Saint Vincent and the Grenadines":"Saint Vincent and the Grenadines has the larger life expectancy (72.3 years against 46.2 years).","between Northern Mariana Islands and Angola, which has the greater life expectancy":"Northern Mariana Islands has the larger life expectancy (75.5 years against 38.3 years).","whose life expectancy is larger: Ivory Coast or India":"India has the larger life expectancy (62.5 years against 45.2 years).","which has the larger life expectancy, Syria or Gabon":"Syria has the larger life expectancy (68.5 years against 50.1 years).","which has the larger life expectancy, Fiji Islands or Vietnam":"Vietnam has the larger life expectancy (69.3 years against 67.9 years).","which has the larger life expectancy, Philippines or San Marino":"San Marino has the larger life expectancy (81.1 years against 67.5 years).","between Gabon and Marshall Islands, which has the greater life expectancy":"Marshall Islands has the larger life expectancy (65.5 years against 50.1 years).","between Zambia and Saint Kitts and Nevis, which has the greater life expectancy":"Saint Kitts and Nevis has the larger life expectancy (70.7 years against 37.2 years).","between Chile and Saudi Arabia, which has the greater life expectancy":"Chile has the larger life expectancy (75.7 years against 67.8 years).","which has the larger life expectancy, Bahamas or Trinidad and Tobago":"Bahamas has the larger life expectancy (71.1 years against 68 years).","between Cyprus and Turkey, which has the greater life expectancy":"Cyprus has the larger life expectancy (76.7 years against 71 years).","between Reunion and Albania, which has the greater life expectancy":"Reunion has the larger life expectancy (72.7 years against 71.6 years).","between Togo and Puerto Rico, which has the greater life expectancy":"Puerto Rico has the larger life expectancy (75.6 years against 54.7 years).","which has the larger life expectancy, India or United States":"United States has the larger life expectancy (77.1 years against 62.5 years).","whose life expectancy is larger: Ethiopia or Malawi":"Ethiopia has the larger life expectancy (45.2 years against 37.6 years).","which has the larger life expectancy, Andorra or Finland":"Andorra has the larger life expectancy (83.5 years against 77.4 years).","whose life expectancy is larger: Central African Republic or Australia":"Australia has the larger life expectancy (79.8 years against 44 years).","whose life expectancy is larger: Myanmar or Andorra":"Andorra has the larger life expectancy (83.5 years against 54.9 years).","whose life expectancy is larger: American Samoa or East Timor":"American Samoa has the larger life expectancy (75.1 years against 46 years).","which has the larger life expectancy, Eritrea or Reunion":"Reunion has the larger life expectancy (72.7 years against 55.8 years).","whose life expectancy is larger: Sweden or Vanuatu":"Sweden has the larger life expectancy (79.6 years against 60.6 years).","whose life expectancy is larger: Eswatini or Cayman Islands":"Cayman Islands has the larger life expectancy (78.9 years against 40.4 years).","between Greenland and Cook Islands, which has the greater life expectancy":"Cook Islands has the larger life expectancy (71.1 years against 68.1 years).","which has the larger life expectancy, East Timor or Northern Mariana Islands":"Northern Mariana Islands has the larger life expectancy (75.5 years against 46 years).","between New Zealand and American Samoa, which has the greater life expectancy":"New Zealand has the larger life expectancy (77.8 years against 75.1 years).","between Malaysia and Myanmar, which has the greater life expectancy":"Malaysia has the larger life expectancy (70.8 years against 54.9 years).","which has the larger life expectancy, Suriname or Uzbekistan":"Suriname has the larger life expectancy (71.4 years against 63.7 years).","between Saint Vincent and the Grenadines and Barbados, which has the greater life expectancy":"Barbados has the larger life expectancy (73 years against 72.3 years).","between Maldives and Montserrat, which has the greater life expectancy":"Montserrat has the larger life expectancy (78 years against 62.2 years).","between Honduras and Belgium, which has the greater life expectancy":"Belgium has the larger life expectancy (77.8 years against 69.9 years).","between Netherlands Antilles and Niger, which has the greater life expectancy":"Netherlands Antilles has the larger life expectancy (74.7 years against 41.3 years).","whose life expectancy is larger: Saint Kitts and Nevis or Saint Pierre and Miquelon":"Saint Pierre and Miquelon has the larger life expectancy (77.6 years against 70.7 years).","between Israel and Saint Helena, which has the greater life expectancy":"Israel has the larger life expectancy (78.6 years against 76.8 years).","between Nicaragua and Guadeloupe, which has the greater life expectancy":"Guadeloupe has the larger life expectancy (77 years against 68.7 years).","whose life expectancy is larger: Palestine or French Guiana":"French Guiana has the larger life expectancy (76.1 years against 71.4 years).","which has the larger life expectancy, Saint Pierre and Miquelon or Honduras":"Saint Pierre and Miquelon has the larger life expectancy (77.6 years against 69.9 years).","whose life expectancy is larger: Barbados or Eritrea":"Barbados has the larger life expectancy (73 years against 55.8 years).","whose life expectancy is larger: Romania or Lithuania":"Romania has the larger life expectancy (69.9 years against 69.1 years).","between San Marino and Ethiopia, which has the greater life expectancy":"San Marino has the larger life expectancy (81.1 years against 45.2 years).","which has the larger life expectancy, Tajikistan or Cyprus":"Cyprus has the larger life expectancy (76.7 years against 64.1 years).","between Ukraine and Eswatini, which has the greater life expectancy":"Ukraine has the larger life expectancy (66 years against 40.4 years).","which has the larger life expectancy, Armenia or Chile":"Chile has the larger life expectancy (75.7 years against 66.4 years).","whose life expectancy is larger: Ireland or Armenia":"Ireland has the larger life expectancy (76.8 years against 66.4 years).","which has the larger life expectancy, Bhutan or Nicaragua":"Nicaragua has the larger life expectancy (68.7 years against 52.4 years).","between Iceland and Egypt, which has the greater life expectancy":"Iceland has the larger life expectancy (79.4 years against 63.3 years).","whose life expectancy is larger: Uruguay or Bangladesh":"Uruguay has the larger life expectancy (75.2 years against 60.2 years).","between Tuvalu and Namibia, which has the greater life expectancy":"Tuvalu has the larger life expectancy (66.3 years against 42.5 years).","which has the larger life expectancy, Vanuatu or Greenland":"Greenland has the larger life expectancy (68.1 years against 60.6 years).","whose life expectancy is larger: Angola or Tanzania":"Tanzania has the larger life expectancy (52.3 years against 38.3 years).","between Vietnam and Kazakhstan, which has the greater life expectancy":"Vietnam has the larger life expectancy (69.3 years against 63.2 years).","which has the larger life expectancy, Moldova or Maldives":"Moldova has the larger life expectancy (64.5 years against 62.2 years).","which has the larger life expectancy, Cayman Islands or Zambia":"Cayman Islands has the larger life expectancy (78.9 years against 37.2 years).","which has the larger life expectancy, Malawi or Israel":"Israel has the larger life expectancy (78.6 years against 37.6 years)."}}},
{"id":"n-4a99f9b6","guard":[["has","expectancy"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"larger: Bolivia or Kuwait":"Kuwait has the larger life expectancy (76.1 years against 63.7 years).","larger: Guadeloupe or Papua New Guinea":"Guadeloupe has the larger life expectancy (77 years against 63.1 years).","larger: Marshall Islands or Kiribati":"Marshall Islands has the larger life expectancy (65.5 years against 59.8 years).","larger: Turkey or Suriname":"Suriname has the larger life expectancy (71.4 years against 71 years).","larger: Puerto Rico or Moldova":"Puerto Rico has the larger life expectancy (75.6 years against 64.5 years).","larger: Montserrat or Syria":"Montserrat has the larger life expectancy (78 years against 68.5 years).","larger: Namibia or Tajikistan":"Tajikistan has the larger life expectancy (64.1 years against 42.5 years).","larger: Belgium or Mali":"Belgium has the larger life expectancy (77.8 years against 46.7 years).","larger: Gibraltar or Guyana":"Gibraltar has the larger life expectancy (79 years against 64 years).","larger: Egypt or Philippines":"Philippines has the larger life expectancy (67.5 years against 63.3 years).","larger: Nauru or Burundi":"Nauru has the larger life expectancy (60.8 years against 46.2 years).","larger: Kazakhstan or French Polynesia":"French Polynesia has the larger life expectancy (74.8 years against 63.2 years).","larger: Cape Verde or Morocco":"Morocco has the larger life expectancy (69.1 years against 68.9 years).","larger: Saint Helena or Belarus":"Saint Helena has the larger life expectancy (76.8 years against 68 years).","larger: Saudi Arabia or Bahamas":"Bahamas has the larger life expectancy (71.1 years against 67.8 years).","larger: Cook Islands or Portugal":"Portugal has the larger life expectancy (75.8 years against 71.1 years).","larger: Niger or Fiji Islands":"Fiji Islands has the larger life expectancy (67.9 years against 41.3 years).","larger: Albania or Bosnia and Herzegovina":"Albania has the larger life expectancy (71.6 years against 71.5 years).","larger: South Korea or Chad":"South Korea has the larger life expectancy (74.4 years against 50.5 years).","larger: Ivory Coast or India":"India has the larger life expectancy (62.5 years against 45.2 years).","larger: Ethiopia or Malawi":"Ethiopia has the larger life expectancy (45.2 years against 37.6 years).","larger: Central African Republic or Australia":"Australia has the larger life expectancy (79.8 years against 44 years).","larger: Myanmar or Andorra":"Andorra has the larger life expectancy (83.5 years against 54.9 years).","larger: American Samoa or East Timor":"American Samoa has the larger life expectancy (75.1 years against 46 years).","larger: Sweden or Vanuatu":"Sweden has the larger life expectancy (79.6 years against 60.6 years).","larger: Eswatini or Cayman Islands":"Cayman Islands has the larger life expectancy (78.9 years against 40.4 years).","larger: Saint Kitts and Nevis or Saint Pierre and Miquelon":"Saint Pierre and Miquelon has the larger life expectancy (77.6 years against 70.7 years).","larger: Palestine or French Guiana":"French Guiana has the larger life expectancy (76.1 years against 71.4 years).","larger: Barbados or Eritrea":"Barbados has the larger life expectancy (73 years against 55.8 years).","larger: Romania or Lithuania":"Romania has the larger life expectancy (69.9 years against 69.1 years).","larger: Ireland or Armenia":"Ireland has the larger life expectancy (76.8 years against 66.4 years).","larger: Uruguay or Bangladesh":"Uruguay has the larger life expectancy (75.2 years against 60.2 years).","larger: Angola or Tanzania":"Tanzania has the larger life expectancy (52.3 years against 38.3 years)."}}},
{"id":"n-10df1d12","guard":[["hasAny",["angola","arabia","aruba","australia","barbados","bhutan","botswana","each word","egypt","ethiopia","finland","greenland","guadeloupe","guyana","ireland","longest","longest one","longest word","mali","morocco","namibia","portugal","split into words","syria","turkey","words"]],["has","larger"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"expectancy"}]]]],"mem":null},
{"id":"n-db4d8ca5","guard":[["hasAny",["african","arabia","aruba","bhutan","bolivia","brazil","cape","chile","coast","cook","delete","egypt","greenland","hungary","israel","jordan","myanmar","remove","reunion","strip out","tajikistan","tanzania","turkey","vietnam","without"]],["has","larger"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"expectancy"}]]],"mem":null},
{"id":"n-40efb736","guard":[["hasAny",["albania","american","angola","armenia","barbados","belarus","belgium","cayman","chad","egypt","ethiopia","fiji","first n","french","gibraltar","kiribati","longest","longest one","longest word","moldova","montserrat","namibia","suriname","take","top"]],["has","life"],["has","larger"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-d2650bae","guard":[["hasAny",["american","angola","armenia","barbados","belarus","belgium","cayman","chad","egypt","ethiopia","fiji","french","gibraltar","kiribati","longest","longest one","longest word","moldova","montserrat","namibia","suriname"]],["has","life"],["has","larger"]],"pyramid":["render.str",["aggregate.longest",["sense.list"]]],"mem":null},
{"id":"n-1de2dc92","guard":[["hasAny",["american","andorra","angola","backwards","barbados","belarus","belgium","cayman","chad","egypt","ethiopia","fiji","french","gibraltar","kiribati","longest","longest one","longest word","moldova","montserrat","namibia","reverse","reverse order","reversed","suriname"]],["has","life"],["has","larger"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["sense.list"]]]],"mem":null},
{"id":"n-8f0264b2","guard":[["hasAny",["american","angola","armenia","barbados","belarus","belgium","cayman","chad","egypt","ethiopia","fiji","french","gibraltar","invert case","kiribati","longest","longest one","longest word","moldova","montserrat","namibia","suriname","swap case","toggle case"]],["has","life"],["has","larger"]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-9519b83d","guard":[["hasAny",["american","angola","armenia","barbados","belarus","belgium","cayman","chad","egypt","ethiopia","fiji","french","gibraltar","kiribati","longest","longest one","longest word","lower case","lowercase","moldova","montserrat","namibia","small letters","suriname"]],["has","life"],["has","larger"]],"pyramid":["render.str",["transform.lower",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-d11676a9","guard":[["hasAny",["all caps","american","angola","armenia","barbados","belarus","belgium","capital letters","capitals","cayman","chad","egypt","ethiopia","fiji","french","gibraltar","kiribati","longest","longest one","longest word","moldova","montserrat","namibia","suriname","upper case","uppercase"]],["has","life"],["has","larger"]],"pyramid":["render.str",["transform.upper",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-cbda5bf7","guard":[["hasAny",["albania","american","armenia","bangladesh","barbados","belarus","belgium","burundi","chad","element","ethiopia","gibraltar","guadeloupe","item number","kiribati","lithuania","moldova","montserrat","nth","position","sweden"]],["has","life"],["has","larger"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":1}]],"mem":null},
{"id":"n-9fe8e32b","guard":[["hasAny",["african","andorra","angola","arabia","bolivia","cape","cayman","coast","cook","egypt","element","fiji","french","item number","namibia","nth","position","suriname"]],["has","life"],["has","larger"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":2}]],"mem":null},
{"id":"n-ecf2f22b","guard":[["hasAny",["armenia","bhutan","each word","eritrea","guyana","longest","longest one","longest word","malawi","mali","split into words","tajikistan","tanzania"]],["has","larger"],["has","life"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-1d4aa2fb","guard":[["hasAny",["african","angola","arabia","armenia","barbados","belgium","cape","cook","each word","egypt","ethiopia","gibraltar","guadeloupe","longest","longest one","longest word","montserrat","namibia","split into words","suriname","words"]],["has","larger"],["has","life"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-3358b38f","guard":[["hasAny",["african","andorra","angola","arabia","bolivia","cape","cayman","coast","cook","egypt","fiji","french","from position","items from to","namibia","slice","suriname"]],["has","life"],["has","larger"]],"pyramid":["render.and",["transform.sliceStrs",["sense.list"],{"lit":2},{"lit":3}]],"mem":null},
{"id":"n-574481c2","guard":[["hasAny",["african","andorra","angola","arabia","bolivia","cape","cayman","coast","cook","egypt","fiji","french","from position","items from to","namibia","slice","suriname"]],["has","life"],["has","larger"]],"pyramid":["render.list",["transform.sliceStrs",["sense.list"],{"lit":2},{"lit":3}]],"mem":null},
{"id":"n-79fd3c99","guard":[["hasAny",["african","angola","arabia","barbados","belgium","cape","cook","each word","egypt","ethiopia","gibraltar","guadeloupe","ireland","longest","longest one","longest word","montserrat","namibia","split into words","turkey","words"]],["has","life"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"larger"}]]]],"mem":null},
{"id":"n-7ad8e60b","guard":[["hasAny",["african","andorra","angola","arabia","bolivia","cape","cayman","coast","cook","egypt","fiji","french","from position","items from to","namibia","slice","suriname"]],["has","life"],["has","larger"]],"pyramid":["render.and",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-c862b5a4","guard":[["hasAny",["african","andorra","angola","arabia","bolivia","cape","cayman","coast","cook","egypt","fiji","french","from position","items from to","namibia","slice","suriname"]],["has","life"],["has","larger"]],"pyramid":["render.list",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-cfdc05f8","guard":[["hasAny",["african","andorra","angola","arabia","bolivia","cape","cayman","coast","cook","egypt","fiji","french","from position","items from to","namibia","slice","suriname"]],["has","life"],["has","larger"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-dd0d52fc","guard":[["hasAny",["african","andorra","angola","arabia","bolivia","cape","cayman","coast","cook","egypt","fiji","french","from position","items from to","namibia","slice","suriname"]],["has","life"],["has","larger"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.list"],{"lit":2},{"lit":3}]],"mem":null},
{"id":"n-e57d3151","guard":[["hasAny",["african","arabia","bhutan","brazil","cape","chile","coast","cook","from position","greenland","hungary","israel","items from to","slice","tajikistan","tanzania"]],["has","larger"],["has","life"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],["sense.wordCount"],{"lit":10}]],"mem":null},
{"id":"n-c0847c22","guard":[["hasAny",["african","arabia","armenia","bangladesh","bolivia","burundi","cape","coast","cook","guadeloupe","lithuania","shortest","shortest one","shortest word","sweden"]],["has","life"],["has","larger"]],"pyramid":["render.str",["aggregate.shortest",["sense.list"]]],"mem":null},
{"id":"n-03a1cfc5","guard":[["hasAny",["african","all caps","arabia","armenia","bangladesh","bolivia","burundi","cape","capital letters","capitals","coast","cook","guadeloupe","lithuania","shortest","shortest one","shortest word","sweden","upper case","uppercase"]],["has","life"],["has","larger"]],"pyramid":["render.str",["transform.upper",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-11c42c47","guard":[["hasAny",["african","arabia","armenia","bangladesh","bolivia","burundi","cape","coast","cook","each word","guadeloupe","lithuania","shortest","shortest one","shortest word","split into words","sweden"]],["has","life"],["has","larger"]],"pyramid":["render.and",["transform.words",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-1f9b82df","guard":[["hasAny",["african","arabia","armenia","bangladesh","bolivia","burundi","cape","coast","cook","guadeloupe","lithuania","lower case","lowercase","shortest","shortest one","shortest word","small letters","sweden"]],["has","life"],["has","larger"]],"pyramid":["render.str",["transform.lower",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-4f41a9e4","guard":[["hasAny",["african","arabia","armenia","bangladesh","bolivia","burundi","cape","coast","cook","each word","guadeloupe","lithuania","shortest","shortest one","shortest word","split into words","sweden"]],["has","life"],["has","larger"]],"pyramid":["render.lines",["transform.words",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-64056f57","guard":[["hasAny",["african","arabia","armenia","bangladesh","bolivia","burundi","cape","coast","cook","each word","guadeloupe","lithuania","shortest","shortest one","shortest word","split into words","sweden"]],["has","life"],["has","larger"]],"pyramid":["render.list",["transform.words",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-67100770","guard":[["hasAny",["african","arabia","armenia","bangladesh","bolivia","burundi","cape","coast","cook","guadeloupe","invert case","lithuania","shortest","shortest one","shortest word","swap case","sweden","toggle case"]],["has","life"],["has","larger"]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-a4b7f60e","guard":[["hasAny",["african","arabia","armenia","bangladesh","bolivia","burundi","cape","coast","cook","guadeloupe","lithuania","reverse the words","reverse word order","shortest","shortest one","shortest word","sweden","words backwards"]],["has","life"],["has","larger"]],"pyramid":["render.str",["transform.reverseWords",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-f5e38e90","guard":[["hasAny",["african","andorra","arabia","backwards","bangladesh","bolivia","burundi","cape","coast","cook","guadeloupe","lithuania","reverse","reverse order","reversed","shortest","shortest one","shortest word","sweden"]],["has","life"],["has","larger"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.list"]]]],"mem":null},
{"id":"n-38254170","guard":[["hasAny",["armenia","aruba","bhutan","brazil","cyprus","delete","eritrea","fiji","greenland","guyana","iceland","israel","jordan","remove","strip out","without"]],["has","life"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.after",{"lit":"larger"}]]],"mem":null},
{"id":"n-6687eecb","guard":[["hasAny",["aruba","bhutan","brazil","chile","cyprus","delete","greenland","hungary","iceland","israel","jordan","remove","reunion","strip out","vietnam","without"]],["has","larger"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.after",{"lit":"expectancy"}]]],"mem":null},
{"id":"n-9e675375","guard":[["hasAny",["armenia","bhutan","chad","delete","eritrea","fiji","guyana","kiribati","malawi","mali","remove","strip out","tajikistan","tanzania","vanuatu","without"]],["has","larger"],["has","life"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"has"}]]],"mem":null},
{"id":"n-7609f559","guard":[["hasAny",["african","andorra","angola","arabia","bolivia","cape","coast","cook","delete","egypt","namibia","remove","strip out","suriname","without"]],["has","life"],["has","larger"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-151501cd","guard":[["hasAny",["angola","armenia","barbados","belgium","each word","egypt","ethiopia","gibraltar","longest","longest one","longest word","montserrat","namibia","split into words","suriname"]],["has","larger"],["has","life"]],"pyramid":["render.and",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-28756cf2","guard":[["hasAny",["angola","armenia","barbados","belgium","egypt","ethiopia","gibraltar","longest","longest one","longest word","montserrat","namibia","reverse the words","reverse word order","suriname","words backwards"]],["has","larger"],["has","life"]],"pyramid":["render.str",["transform.reverseWords",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-6d74fffb","guard":[["hasAny",["angola","armenia","barbados","belgium","each word","egypt","ethiopia","gibraltar","longest","longest one","longest word","montserrat","namibia","split into words","suriname"]],["has","larger"],["has","life"]],"pyramid":["render.list",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-a3b6e03b","guard":[["hasAny",["angola","armenia","barbados","belgium","each word","egypt","ethiopia","gibraltar","longest","longest one","longest word","montserrat","namibia","split into words","suriname"]],["has","larger"],["has","life"]],"pyramid":["render.lines",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-28435d17","guard":[["hasAny",["andorra","element","item number","kuwait","nth","position","suriname"]],["has","life"],["has","larger"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-1416eebd","guard":[["hasAny",["bhutan","each word","split into words","tajikistan","tanzania"]],["has","larger"],["has","life"]],"pyramid":["render.list",["transform.words",["sense.lastWord"]]],"mem":null},
{"id":"n-45ee0587","guard":[["hasAny",["bhutan","capitalise","capitalize","capitalize each word","tajikistan","tanzania","title case"]],["has","larger"],["has","life"]],"pyramid":["render.str",["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5f420fc9","guard":[["hasAny",["bhutan","lower case","lowercase","small letters","tajikistan","tanzania"]],["has","larger"],["has","life"]],"pyramid":["render.str",["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b929ab97","guard":[["hasAny",["all caps","bhutan","capital letters","capitals","tajikistan","tanzania","upper case","uppercase"]],["has","larger"],["has","life"]],"pyramid":["render.str",["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-eb3adec1","guard":[["hasAny",["bhutan","invert case","swap case","tajikistan","tanzania","toggle case"]],["has","larger"],["has","life"]],"pyramid":["render.str",["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-29919619","guard":[["hasAny",["bhutan","delete","remove","strip out","tajikistan","tanzania","without"]],["has","larger"],["has","life"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Australia"}]],"mem":null},
{"id":"n-43ed9714","guard":[["hasAny",["bhutan","delete","remove","strip out","tajikistan","tanzania","without"]],["has","larger"],["has","life"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Bahamas"}]],"mem":null},
{"id":"n-63845b8f","guard":[["hasAny",["bhutan","delete","remove","strip out","tajikistan","tanzania","without"]],["has","larger"],["has","life"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Chile"}]],"mem":null},
{"id":"n-78371d65","guard":[["hasAny",["bhutan","delete","remove","strip out","tajikistan","tanzania","without"]],["has","larger"],["has","life"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Brazil"}]],"mem":null},
{"id":"n-86fcdc43","guard":[["hasAny",["bhutan","capitalise","capitalize","capitalize each word","invert case","swap case","tajikistan","tanzania","title case","toggle case"]],["has","larger"],["has","life"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-88d3365a","guard":[["hasAny",["bhutan","delete","remove","strip out","tajikistan","tanzania","without"]],["has","larger"],["has","life"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Aruba"}]],"mem":null},
{"id":"n-f6322bfc","guard":[["hasAny",["bhutan","delete","remove","strip out","tajikistan","tanzania","without"]],["has","larger"],["has","life"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Andorra"}]],"mem":null},
{"id":"n-0a9940ad","guard":[["hasAny",["bhutan","from position","items from to","slice","tajikistan","tanzania"]],["has","larger"],["has","life"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],["sense.wordCount"],{"lit":12}]],"mem":null},
{"id":"n-a64a646d","guard":[["hasAny",["coast","each word","gibraltar","guadeloupe","longest","longest one","longest word","montserrat","myanmar","split into words","words"]],["has","greater"],["has","life"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.before",{"lit":"has"}]]]],"mem":null},
{"id":"n-1af5a0b8","guard":[["hasAny",["bhutan","delete","remove","strip out","tajikistan","tanzania","without"]],["has","larger"],["has","life"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Cyprus"}]],"mem":null},
{"id":"n-53ef4654","guard":[["hasAny",["australia","element","fiji","item number","nth","position"]],["has","larger"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-ab9b976e","guard":[["hasAny",["cayman","separate by","split","split by"]],["has","larger"]],"pyramid":["render.list",["transform.split",{"lit":"Cayman Islands"},["sense.subject"]]],"mem":null},
{"id":"n-b642a3f6","guard":[["hasAny",["cayman","delete","remove","strip out","without"]],["has","larger"]],"pyramid":["render.str",["transform.remove",{"lit":"Cayman Islands"},["sense.subject"]]],"mem":null},
{"id":"n-1b1c1ca2","guard":[["hasAny",["australia","fiji","from position","items from to","slice"]],["has","larger"]],"pyramid":["render.and",["transform.sliceStrs",["sense.words"],{"lit":10},["sense.wordCount"]]],"mem":null},
{"id":"n-34d1dba3","guard":[["hasAny",["australia","fiji","from position","items from to","slice"]],["has","larger"]],"pyramid":["render.and",["transform.sliceStrs",["sense.words"],{"lit":10},{"lit":12}]],"mem":null},
{"id":"n-6e18784d","guard":[["hasAny",["australia","fiji","from position","items from to","slice"]],["has","larger"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.words"],{"lit":10},["sense.wordCount"]]],"mem":null},
{"id":"n-709eb60d","guard":[["hasAny",["australia","fiji","from position","items from to","slice"]],["has","larger"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],{"lit":10},{"lit":12}]],"mem":null},
{"id":"n-cb1a5560","guard":[["hasAny",["australia","fiji","from position","items from to","slice"]],["has","larger"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.words"],{"lit":10},{"lit":12}]],"mem":null},
{"id":"n-ef59bb37","guard":[["hasAny",["australia","fiji","from position","items from to","slice"]],["has","larger"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],{"lit":10},["sense.wordCount"]]],"mem":null},
{"id":"n-0076329b","guard":[["hasAny",["albania","reunion"]],["has","reunion"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Reunion and Albania, which has the greater life expectancy":"Reunion has the larger life expectancy (72.7 years against 71.6 years)."}}},
{"id":"n-007aa66a","guard":[["has","ireland"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Ireland or Armenia":"Ireland has the larger life expectancy (76.8 years against 66.4 years)."}}},
{"id":"n-01aaa10a","guard":[["hasAny",["expectancy","has","larger","life","maldives","moldova"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Moldova or Maldives":"Moldova has the larger life expectancy (64.5 years against 62.2 years)."}}},
{"id":"n-0253938f","guard":[["hasAny",["bhutan","each word","split into words"]],["has","nicaragua"]],"pyramid":["render.and",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-028f59d0","guard":[["hasAny",["cyprus","expectancy","has","larger","life","tajikistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Tajikistan or Cyprus":"Cyprus has the larger life expectancy (76.7 years against 64.1 years)."}}},
{"id":"n-036405be","guard":[["hasAny",["expectancy","has","larger","life","morocco","tuvalu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Morocco or Tuvalu":"Morocco has the larger life expectancy (69.1 years against 66.3 years)."}}},
{"id":"n-0377b36c","guard":[["hasAny",["belarus","expectancy","helena","larger","life","saint"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Saint Helena or Belarus":"Saint Helena has the larger life expectancy (76.8 years against 68 years)."}}},
{"id":"n-03931b8a","guard":[["has","burundi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Burundi or Saint Vincent and the Grenadines":"Saint Vincent and the Grenadines has the larger life expectancy (72.3 years against 46.2 years)."}}},
{"id":"n-049b4f1b","guard":[["hasAny",["between","ethiopia","expectancy","greater","has","life","marino","san"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between San Marino and Ethiopia, which has the greater life expectancy":"San Marino has the larger life expectancy (81.1 years against 45.2 years)."}}},
{"id":"n-04a2b077","guard":[["hasAny",["expectancy","french","kazakhstan","larger","life","polynesia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Kazakhstan or French Polynesia":"French Polynesia has the larger life expectancy (74.8 years against 63.2 years)."}}},
{"id":"n-06487262","guard":[["has","botswana"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Bangladesh or Botswana":"Bangladesh has the larger life expectancy (60.2 years against 39.3 years)."}}},
{"id":"n-07b2f182","guard":[["hasAny",["between","expectancy","greater","has","life","romania","states","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between United States and Romania, which has the greater life expectancy":"United States has the larger life expectancy (77.1 years against 69.9 years)."}}},
{"id":"n-07d3beec","guard":[["hasAny",["expectancy","has","iceland","larger","life","tanzania"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Tanzania or Iceland":"Iceland has the larger life expectancy (79.4 years against 52.3 years)."}}},
{"id":"n-081fd853","guard":[["has","aruba"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Chad or Aruba":"Aruba has the larger life expectancy (78.4 years against 50.5 years)."}}},
{"id":"n-082df568","guard":[["hasAny",["andorra","expectancy","finland","has","larger","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Andorra or Finland":"Andorra has the larger life expectancy (83.5 years against 77.4 years)."}}},
{"id":"n-08acf53f","guard":[["has","zambia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Cayman Islands or Zambia":"Cayman Islands has the larger life expectancy (78.9 years against 37.2 years)."}}},
{"id":"n-098f19f7","guard":[["hasAny",["coast","expectancy","india","ivory","larger","life"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Ivory Coast or India":"India has the larger life expectancy (62.5 years against 45.2 years)."}}},
{"id":"n-0de7cc78","guard":[["hasAny",["belarus","larger"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Belarus or Netherlands Antilles":"Netherlands Antilles has the larger life expectancy (74.7 years against 68 years)."}}},
{"id":"n-0ed59343","guard":[["hasAny",["between","egypt","expectancy","greater","has","iceland","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Iceland and Egypt, which has the greater life expectancy":"Iceland has the larger life expectancy (79.4 years against 63.3 years)."}}},
{"id":"n-0f4755b3","guard":[["hasAny",["belgium","expectancy","larger","life","mali"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Belgium or Mali":"Belgium has the larger life expectancy (77.8 years against 46.7 years)."}}},
{"id":"n-0f741947","guard":[["hasAny",["cape","expectancy","larger","life","morocco","verde"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Cape Verde or Morocco":"Morocco has the larger life expectancy (69.1 years against 68.9 years)."}}},
{"id":"n-0f827ebe","guard":[["hasAny",["antilles","between","expectancy","greater","has","life","netherlands","niger"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Netherlands Antilles and Niger, which has the greater life expectancy":"Netherlands Antilles has the larger life expectancy (74.7 years against 41.3 years)."}}},
{"id":"n-0fde5067","guard":[["hasAny",["expectancy","gibraltar","guyana","larger","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Gibraltar or Guyana":"Gibraltar has the larger life expectancy (79 years against 64 years)."}}},
{"id":"n-11d40ec8","guard":[["has","chile"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Armenia or Chile":"Chile has the larger life expectancy (75.7 years against 66.4 years)."}}},
{"id":"n-14153c76","guard":[["hasAny",["expectancy","islands","kiribati","larger","life","marshall"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Marshall Islands or Kiribati":"Marshall Islands has the larger life expectancy (65.5 years against 59.8 years)."}}},
{"id":"n-144a239f","guard":[["hasAny",["expectancy","has","larger","life","suriname","uzbekistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Suriname or Uzbekistan":"Suriname has the larger life expectancy (71.4 years against 63.7 years)."}}},
{"id":"n-14aa2272","guard":[["has","montserrat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Montserrat or Syria":"Montserrat has the larger life expectancy (78 years against 68.5 years)."}}},
{"id":"n-1624b1e4","guard":[["hasAny",["expectancy","has","jordan","kiribati","larger","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Kiribati or Jordan":"Jordan has the larger life expectancy (77.4 years against 59.8 years)."}}},
{"id":"n-176025f1","guard":[["has","egypt"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Egypt or Philippines":"Philippines has the larger life expectancy (67.5 years against 63.3 years)."}}},
{"id":"n-1997a64e","guard":[["hasAny",["maldives","montserrat"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Maldives and Montserrat, which has the greater life expectancy":"Montserrat has the larger life expectancy (78 years against 62.2 years)."}}},
{"id":"n-1a6d62b4","guard":[["hasAny",["has","zealand"]],["has","larger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Papua New Guinea or New Zealand":"New Zealand has the larger life expectancy (77.8 years against 63.1 years)."}}},
{"id":"n-1bdb1405","guard":[["hasAny",["expectancy","has","india","larger","life","states","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, India or United States":"United States has the larger life expectancy (77.1 years against 62.5 years)."}}},
{"id":"n-1c5cc5c9","guard":[["has","niger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Netherlands Antilles and Niger, which has the greater life expectancy":"Netherlands Antilles has the larger life expectancy (74.7 years against 41.3 years)."}}},
{"id":"n-1c8cf85b","guard":[["has","reunion"],["has","larger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Eritrea or Reunion":"Reunion has the larger life expectancy (72.7 years against 55.8 years)."}}},
{"id":"n-1d47cb54","guard":[["hasAny",["chad","expectancy","korea","larger","life","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: South Korea or Chad":"South Korea has the larger life expectancy (74.4 years against 50.5 years)."}}},
{"id":"n-1dd35877","guard":[["hasAny",["burundi","expectancy","grenadines","has","larger","life","saint","vincent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Burundi or Saint Vincent and the Grenadines":"Saint Vincent and the Grenadines has the larger life expectancy (72.3 years against 46.2 years)."}}},
{"id":"n-1f20dcad","guard":[["hasAny",["jordan","uruguay"]],["has","jordan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Jordan and Uruguay, which has the greater life expectancy":"Jordan has the larger life expectancy (77.4 years against 75.2 years)."}}},
{"id":"n-1f462867","guard":[["has","gibraltar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Gibraltar or Guyana":"Gibraltar has the larger life expectancy (79 years against 64 years)."}}},
{"id":"n-20971617","guard":[["hasAny",["angola","expectancy","larger","life","tanzania"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Angola or Tanzania":"Tanzania has the larger life expectancy (52.3 years against 38.3 years)."}}},
{"id":"n-24b26046","guard":[["hasAny",["antilles","belarus","expectancy","has","larger","life","netherlands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Belarus or Netherlands Antilles":"Netherlands Antilles has the larger life expectancy (74.7 years against 68 years)."}}},
{"id":"n-26c27c10","guard":[["has","myanmar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Myanmar or Andorra":"Andorra has the larger life expectancy (83.5 years against 54.9 years)."}}},
{"id":"n-27dbd47b","guard":[["hasAny",["kitts","nevis","zambia"]],["has","zambia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Zambia and Saint Kitts and Nevis, which has the greater life expectancy":"Saint Kitts and Nevis has the larger life expectancy (70.7 years against 37.2 years)."}}},
{"id":"n-29f3ef19","guard":[["has","israel"],["has","larger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Malawi or Israel":"Israel has the larger life expectancy (78.6 years against 37.6 years)."}}},
{"id":"n-2c4c7cca","guard":[["hasAny",["coast","expectancy","india","ivory","larger","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Ivory Coast or India":"India has the larger life expectancy (62.5 years against 45.2 years)."}}},
{"id":"n-2d72cac2","guard":[["hasAny",["eswatini","ukraine"]],["has","eswatini"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Ukraine and Eswatini, which has the greater life expectancy":"Ukraine has the larger life expectancy (66 years against 40.4 years)."}}},
{"id":"n-3362de9f","guard":[["hasAny",["expectancy","kitts","larger","life","miquelon","nevis","pierre","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Saint Kitts and Nevis or Saint Pierre and Miquelon":"Saint Pierre and Miquelon has the larger life expectancy (77.6 years against 70.7 years)."}}},
{"id":"n-35b83421","guard":[["hasAny",["american","between","expectancy","greater","has","life","new","samoa","zealand"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between New Zealand and American Samoa, which has the greater life expectancy":"New Zealand has the larger life expectancy (77.8 years against 75.1 years)."}}},
{"id":"n-35bd7932","guard":[["hasAny",["between","eswatini","expectancy","greater","has","life","ukraine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Ukraine and Eswatini, which has the greater life expectancy":"Ukraine has the larger life expectancy (66 years against 40.4 years)."}}},
{"id":"n-37a879be","guard":[["hasAny",["american","east","expectancy","larger","life","samoa","timor"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: American Samoa or East Timor":"American Samoa has the larger life expectancy (75.1 years against 46 years)."}}},
{"id":"n-386424a9","guard":[["hasAny",["belgium","honduras"]],["has","belgium"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Honduras and Belgium, which has the greater life expectancy":"Belgium has the larger life expectancy (77.8 years against 69.9 years)."}}},
{"id":"n-3a8d6adf","guard":[["hasAny",["albania","between","expectancy","greater","has","life","reunion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Reunion and Albania, which has the greater life expectancy":"Reunion has the larger life expectancy (72.7 years against 71.6 years)."}}},
{"id":"n-3ac8c4ab","guard":[["hasAny",["puerto","rico"]],["has","larger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Puerto Rico or Moldova":"Puerto Rico has the larger life expectancy (75.6 years against 64.5 years)."}}},
{"id":"n-3ca6c67d","guard":[["hasAny",["expectancy","larger","life","moldova","puerto","rico"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Puerto Rico or Moldova":"Puerto Rico has the larger life expectancy (75.6 years against 64.5 years)."}}},
{"id":"n-3e047715","guard":[["hasAny",["arabia","bahamas","expectancy","larger","life","saudi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Saudi Arabia or Bahamas":"Bahamas has the larger life expectancy (71.1 years against 67.8 years)."}}},
{"id":"n-3e257a51","guard":[["hasAny",["expectancy","has","israel","larger","life","malawi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Malawi or Israel":"Israel has the larger life expectancy (78.6 years against 37.6 years)."}}},
{"id":"n-4001bdd0","guard":[["hasAny",["burundi","expectancy","larger","life","nauru"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Nauru or Burundi":"Nauru has the larger life expectancy (60.8 years against 46.2 years)."}}},
{"id":"n-4038b95b","guard":[["hasAny",["bhutan","expectancy","has","larger","life","nicaragua"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Bhutan or Nicaragua":"Nicaragua has the larger life expectancy (68.7 years against 52.4 years)."}}},
{"id":"n-40b463d5","guard":[["has","barbados"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Saint Vincent and the Grenadines and Barbados, which has the greater life expectancy":"Barbados has the larger life expectancy (73 years against 72.3 years)."}}},
{"id":"n-4194bb63","guard":[["has","tuvalu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Morocco or Tuvalu":"Morocco has the larger life expectancy (69.1 years against 66.3 years)."}}},
{"id":"n-422a829c","guard":[["hasAny",["india","larger"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, India or United States":"United States has the larger life expectancy (77.1 years against 62.5 years)."}}},
{"id":"n-44227d64","guard":[["hasAny",["expectancy","has","honduras","larger","life","miquelon","pierre","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Saint Pierre and Miquelon or Honduras":"Saint Pierre and Miquelon has the larger life expectancy (77.6 years against 69.9 years)."}}},
{"id":"n-44d55dd3","guard":[["has","namibia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Namibia or Tajikistan":"Tajikistan has the larger life expectancy (64.1 years against 42.5 years)."}}},
{"id":"n-45730a5a","guard":[["hasAny",["all caps","bhutan","capital letters","capitals","upper case","uppercase"]],["has","nicaragua"]],"pyramid":["render.str",["transform.upper",["sense.subject"]]],"mem":null},
{"id":"n-4588a06c","guard":[["has","eswatini"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Eswatini or Cayman Islands":"Cayman Islands has the larger life expectancy (78.9 years against 40.4 years)."}}},
{"id":"n-49b4bf6f","guard":[["has","finland"],["has","larger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Andorra or Finland":"Andorra has the larger life expectancy (83.5 years against 77.4 years)."}}},
{"id":"n-49cc32de","guard":[["hasAny",["expectancy","gabon","has","larger","life","syria"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Syria or Gabon":"Syria has the larger life expectancy (68.5 years against 50.1 years)."}}},
{"id":"n-4b2942fb","guard":[["hasAny",["between","expectancy","greater","has","kazakhstan","life","vietnam"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Vietnam and Kazakhstan, which has the greater life expectancy":"Vietnam has the larger life expectancy (69.3 years against 63.2 years)."}}},
{"id":"n-4b7adba2","guard":[["has","marshall"],["has","larger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Marshall Islands or Kiribati":"Marshall Islands has the larger life expectancy (65.5 years against 59.8 years)."}}},
{"id":"n-4c16d4a3","guard":[["hasAny",["cape","verde"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Cape Verde or Morocco":"Morocco has the larger life expectancy (69.1 years against 68.9 years)."}}},
{"id":"n-4d3ea7df","guard":[["hasAny",["between","cook","expectancy","greater","greenland","has","islands","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Greenland and Cook Islands, which has the greater life expectancy":"Cook Islands has the larger life expectancy (71.1 years against 68.1 years)."}}},
{"id":"n-4f56a01d","guard":[["has","nauru"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Trinidad and Tobago and Nauru, which has the greater life expectancy":"Trinidad and Tobago has the larger life expectancy (68 years against 60.8 years)."}}},
{"id":"n-5025aa9a","guard":[["has","gabon"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Syria or Gabon":"Syria has the larger life expectancy (68.5 years against 50.1 years)."}}},
{"id":"n-50bb136b","guard":[["hasAny",["barbados","between","expectancy","greater","grenadines","has","life","saint","vincent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Saint Vincent and the Grenadines and Barbados, which has the greater life expectancy":"Barbados has the larger life expectancy (73 years against 72.3 years)."}}},
{"id":"n-50dac609","guard":[["hasAny",["expectancy","fiji","islands","larger","life","niger"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Niger or Fiji Islands":"Fiji Islands has the larger life expectancy (67.9 years against 41.3 years)."}}},
{"id":"n-52f13fa7","guard":[["hasAny",["expectancy","guadeloupe","guinea","larger","life","new","papua"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Guadeloupe or Papua New Guinea":"Guadeloupe has the larger life expectancy (77 years against 63.1 years)."}}},
{"id":"n-532582bc","guard":[["hasAny",["malaysia","myanmar"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Malaysia and Myanmar, which has the greater life expectancy":"Malaysia has the larger life expectancy (70.8 years against 54.9 years)."}}},
{"id":"n-54be2178","guard":[["hasAny",["helena","israel"]],["has","israel"],["has","saint"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Israel and Saint Helena, which has the greater life expectancy":"Israel has the larger life expectancy (78.6 years against 76.8 years)."}}},
{"id":"n-56744695","guard":[["hasAny",["bhutan","capitalise","capitalize","capitalize each word","title case"]],["has","nicaragua"]],"pyramid":["render.str",["transform.title",["sense.subject"]]],"mem":null},
{"id":"n-571cee76","guard":[["has","vietnam"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Fiji Islands or Vietnam":"Vietnam has the larger life expectancy (69.3 years against 67.9 years)."}}},
{"id":"n-57d057e5","guard":[["hasAny",["kazakhstan","vietnam"]],["has","kazakhstan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Vietnam and Kazakhstan, which has the greater life expectancy":"Vietnam has the larger life expectancy (69.3 years against 63.2 years)."}}},
{"id":"n-5890b3a8","guard":[["hasAny",["between","botswana","expectancy","greater","has","korea","life","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Botswana and South Korea, which has the greater life expectancy":"South Korea has the larger life expectancy (74.4 years against 39.3 years)."}}},
{"id":"n-5915ea62","guard":[["hasAny",["african","between","brazil","central","expectancy","greater","has","life","republic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Brazil and Central African Republic, which has the greater life expectancy":"Brazil has the larger life expectancy (62.9 years against 44 years)."}}},
{"id":"n-5b7ed829","guard":[["has","romania"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Romania or Lithuania":"Romania has the larger life expectancy (69.9 years against 69.1 years)."}}},
{"id":"n-5d4cf005","guard":[["hasAny",["east","expectancy","has","islands","larger","life","mariana","northern","timor"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, East Timor or Northern Mariana Islands":"Northern Mariana Islands has the larger life expectancy (75.5 years against 46 years)."}}},
{"id":"n-5f37965b","guard":[["hasAny",["angola","between","expectancy","greater","has","islands","life","mariana","northern"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Northern Mariana Islands and Angola, which has the greater life expectancy":"Northern Mariana Islands has the larger life expectancy (75.5 years against 38.3 years)."}}},
{"id":"n-60c9f176","guard":[["hasAny",["expectancy","has","kuwait","larger","life","malaysia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Kuwait or Malaysia":"Kuwait has the larger life expectancy (76.1 years against 70.8 years)."}}},
{"id":"n-60e014a9","guard":[["has","guadeloupe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Guadeloupe or Papua New Guinea":"Guadeloupe has the larger life expectancy (77 years against 63.1 years)."}}},
{"id":"n-638fb49b","guard":[["hasAny",["american","east","expectancy","larger","life","samoa","timor"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: American Samoa or East Timor":"American Samoa has the larger life expectancy (75.1 years against 46 years)."}}},
{"id":"n-64e50b6b","guard":[["hasAny",["botswana","korea","south"]],["has","botswana"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Botswana and South Korea, which has the greater life expectancy":"South Korea has the larger life expectancy (74.4 years against 39.3 years)."}}},
{"id":"n-66ceb0ea","guard":[["has","uzbekistan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Suriname or Uzbekistan":"Suriname has the larger life expectancy (71.4 years against 63.7 years)."}}},
{"id":"n-66f89f34","guard":[["hasAny",["puerto","rico","togo"]],["has","greater"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Togo and Puerto Rico, which has the greater life expectancy":"Puerto Rico has the larger life expectancy (75.6 years against 54.7 years)."}}},
{"id":"n-681106ea","guard":[["hasAny",["barbados","eritrea","expectancy","larger","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Barbados or Eritrea":"Barbados has the larger life expectancy (73 years against 55.8 years)."}}},
{"id":"n-682f6b52","guard":[["has","cook"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Cook Islands or Portugal":"Portugal has the larger life expectancy (75.8 years against 71.1 years)."}}},
{"id":"n-6a1cb594","guard":[["hasAny",["expectancy","larger","life","lithuania","romania"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Romania or Lithuania":"Romania has the larger life expectancy (69.9 years against 69.1 years)."}}},
{"id":"n-6a7652a9","guard":[["hasAny",["cayman","eswatini","expectancy","islands","larger","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Eswatini or Cayman Islands":"Cayman Islands has the larger life expectancy (78.9 years against 40.4 years)."}}},
{"id":"n-6a78186c","guard":[["hasAny",["between","expectancy","greater","has","life","nauru","tobago","trinidad"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Trinidad and Tobago and Nauru, which has the greater life expectancy":"Trinidad and Tobago has the larger life expectancy (68 years against 60.8 years)."}}},
{"id":"n-6ac0b472","guard":[["has","angola"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Angola or Tanzania":"Tanzania has the larger life expectancy (52.3 years against 38.3 years)."}}},
{"id":"n-6acb7e10","guard":[["hasAny",["cook","expectancy","islands","larger","life","portugal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Cook Islands or Portugal":"Portugal has the larger life expectancy (75.8 years against 71.1 years)."}}},
{"id":"n-6babcff3","guard":[["hasAny",["bhutan","invert case","swap case","toggle case"]],["has","nicaragua"]],"pyramid":["render.str",["transform.swapCase",["sense.subject"]]],"mem":null},
{"id":"n-6be99fe8","guard":[["hasAny",["cayman","expectancy","has","islands","larger","life","zambia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Cayman Islands or Zambia":"Cayman Islands has the larger life expectancy (78.9 years against 37.2 years)."}}},
{"id":"n-6e27e228","guard":[["hasAny",["between","expectancy","greater","has","life","slovakia","sweden"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Slovakia and Sweden, which has the greater life expectancy":"Sweden has the larger life expectancy (79.6 years against 73.7 years)."}}},
{"id":"n-719cd97f","guard":[["has","palestine"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Palestine or French Guiana":"French Guiana has the larger life expectancy (76.1 years against 71.4 years)."}}},
{"id":"n-72a11546","guard":[["has","belgium"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Belgium or Mali":"Belgium has the larger life expectancy (77.8 years against 46.7 years)."}}},
{"id":"n-72ef3f56","guard":[["hasAny",["aruba","chad","expectancy","has","larger","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Chad or Aruba":"Aruba has the larger life expectancy (78.4 years against 50.5 years)."}}},
{"id":"n-737c76ee","guard":[["has","honduras"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Saint Pierre and Miquelon or Honduras":"Saint Pierre and Miquelon has the larger life expectancy (77.6 years against 69.9 years)."}}},
{"id":"n-73c7ff9d","guard":[["hasAny",["arabia","chile","saudi"]],["has","between"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Chile and Saudi Arabia, which has the greater life expectancy":"Chile has the larger life expectancy (75.7 years against 67.8 years)."}}},
{"id":"n-766f2e41","guard":[["has","bolivia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Bolivia or Kuwait":"Kuwait has the larger life expectancy (76.1 years against 63.7 years)."}}},
{"id":"n-76a41017","guard":[["has","paraguay"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, French Polynesia or Paraguay":"French Polynesia has the larger life expectancy (74.8 years against 73.7 years)."}}},
{"id":"n-77ccbf3d","guard":[["hasAny",["expectancy","guinea","has","larger","life","new","papua","zealand"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Papua New Guinea or New Zealand":"New Zealand has the larger life expectancy (77.8 years against 63.1 years)."}}},
{"id":"n-7820cc81","guard":[["hasAny",["between","expectancy","greater","has","ireland","laos","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Laos and Ireland, which has the greater life expectancy":"Ireland has the larger life expectancy (76.8 years against 53.1 years)."}}},
{"id":"n-79634da2","guard":[["has","uruguay"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Uruguay or Bangladesh":"Uruguay has the larger life expectancy (75.2 years against 60.2 years)."}}},
{"id":"n-7c3e9a16","guard":[["has","ethiopia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Ethiopia or Malawi":"Ethiopia has the larger life expectancy (45.2 years against 37.6 years)."}}},
{"id":"n-7e20428f","guard":[["hasAny",["coast","ivory","paraguay"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Paraguay and Ivory Coast, which has the greater life expectancy":"Paraguay has the larger life expectancy (73.7 years against 45.2 years)."}}},
{"id":"n-7f6abd7c","guard":[["hasAny",["korea","south"]],["has","larger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: South Korea or Chad":"South Korea has the larger life expectancy (74.4 years against 50.5 years)."}}},
{"id":"n-81ddae08","guard":[["hasAny",["expectancy","larger","life","sweden","vanuatu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Sweden or Vanuatu":"Sweden has the larger life expectancy (79.6 years against 60.6 years)."}}},
{"id":"n-854be02f","guard":[["hasAny",["finland","gibraltar"]],["has","gibraltar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Finland and Gibraltar, which has the greater life expectancy":"Gibraltar has the larger life expectancy (79 years against 77.4 years)."}}},
{"id":"n-857dc944","guard":[["has","cyprus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Tajikistan or Cyprus":"Cyprus has the larger life expectancy (76.7 years against 64.1 years)."}}},
{"id":"n-865ad325","guard":[["hasAny",["expectancy","french","guiana","larger","life","palestine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Palestine or French Guiana":"French Guiana has the larger life expectancy (76.1 years against 71.4 years)."}}},
{"id":"n-8694289e","guard":[["hasAny",["arabia","bahamas","expectancy","larger","life","saudi"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Saudi Arabia or Bahamas":"Bahamas has the larger life expectancy (71.1 years against 67.8 years)."}}},
{"id":"n-87003f86","guard":[["hasAny",["between","expectancy","greater","guadeloupe","has","life","nicaragua"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Nicaragua and Guadeloupe, which has the greater life expectancy":"Guadeloupe has the larger life expectancy (77 years against 68.7 years)."}}},
{"id":"n-893ea20b","guard":[["has","greenland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Vanuatu or Greenland":"Greenland has the larger life expectancy (68.1 years against 60.6 years)."}}},
{"id":"n-895b0c95","guard":[["hasAny",["between","expectancy","greater","has","life","maldives","montserrat"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Maldives and Montserrat, which has the greater life expectancy":"Montserrat has the larger life expectancy (78 years against 62.2 years)."}}},
{"id":"n-8a54d397","guard":[["has","hungary"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Guyana or Hungary":"Hungary has the larger life expectancy (71.4 years against 64 years)."}}},
{"id":"n-8afa73f8","guard":[["hasAny",["expectancy","larger","life","namibia","tajikistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Namibia or Tajikistan":"Tajikistan has the larger life expectancy (64.1 years against 42.5 years)."}}},
{"id":"n-8c0b2be6","guard":[["hasAny",["cyprus","turkey"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Cyprus and Turkey, which has the greater life expectancy":"Cyprus has the larger life expectancy (76.7 years against 71 years)."}}},
{"id":"n-8c6a5b5c","guard":[["hasAny",["bhutan","nicaragua"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Bhutan or Nicaragua":"Nicaragua has the larger life expectancy (68.7 years against 52.4 years)."}}},
{"id":"n-8d83e931","guard":[["hasAny",["ethiopia","expectancy","larger","life","malawi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Ethiopia or Malawi":"Ethiopia has the larger life expectancy (45.2 years against 37.6 years)."}}},
{"id":"n-909cd008","guard":[["has","romania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between United States and Romania, which has the greater life expectancy":"United States has the larger life expectancy (77.1 years against 69.9 years)."}}},
{"id":"n-90fec9f2","guard":[["hasAny",["african","between","brazil","central","expectancy","greater","has","life","republic"]],["has","brazil"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Brazil and Central African Republic, which has the greater life expectancy":"Brazil has the larger life expectancy (62.9 years against 44 years)."}}},
{"id":"n-91337950","guard":[["hasAny",["bhutan","each word","split into words"]],["has","nicaragua"]],"pyramid":["render.lines",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-922e11fa","guard":[["has","laos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Portugal or Laos":"Portugal has the larger life expectancy (75.8 years against 53.1 years)."}}},
{"id":"n-929eeedd","guard":[["hasAny",["bhutan","each word","split into words"]],["has","nicaragua"]],"pyramid":["render.list",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-95bf82dd","guard":[["hasAny",["cape","hungary","verde"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Hungary and Cape Verde, which has the greater life expectancy":"Hungary has the larger life expectancy (71.4 years against 68.9 years)."}}},
{"id":"n-973a8451","guard":[["hasAny",["guadeloupe","nicaragua"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Nicaragua and Guadeloupe, which has the greater life expectancy":"Guadeloupe has the larger life expectancy (77 years against 68.7 years)."}}},
{"id":"n-974cf335","guard":[["hasAny",["kitts","nevis"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Saint Kitts and Nevis or Saint Pierre and Miquelon":"Saint Pierre and Miquelon has the larger life expectancy (77.6 years against 70.7 years)."}}},
{"id":"n-97a0520c","guard":[["has","maldives"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Moldova or Maldives":"Moldova has the larger life expectancy (64.5 years against 62.2 years)."}}},
{"id":"n-97db3aa1","guard":[["hasAny",["expectancy","greenland","has","larger","life","vanuatu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Vanuatu or Greenland":"Greenland has the larger life expectancy (68.1 years against 60.6 years)."}}},
{"id":"n-9891d04a","guard":[["hasAny",["between","expectancy","greater","has","life","namibia","tuvalu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Tuvalu and Namibia, which has the greater life expectancy":"Tuvalu has the larger life expectancy (66.3 years against 42.5 years)."}}},
{"id":"n-98b5f0e7","guard":[["hasAny",["african","australia","central","expectancy","larger","life","republic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Central African Republic or Australia":"Australia has the larger life expectancy (79.8 years against 44 years)."}}},
{"id":"n-99ec7bc9","guard":[["hasAny",["aruba","bolivia"]],["has","aruba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Aruba and Bolivia, which has the greater life expectancy":"Aruba has the larger life expectancy (78.4 years against 63.7 years)."}}},
{"id":"n-9cbff649","guard":[["hasAny",["armenia","chile","expectancy","has","larger","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Armenia or Chile":"Chile has the larger life expectancy (75.7 years against 66.4 years)."}}},
{"id":"n-9d673bed","guard":[["hasAny",["african","australia","central","expectancy","larger","life","republic"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Central African Republic or Australia":"Australia has the larger life expectancy (79.8 years against 44 years)."}}},
{"id":"n-9e2c8b64","guard":[["has","palestine"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Saint Lucia and Palestine, which has the greater life expectancy":"Saint Lucia has the larger life expectancy (72.3 years against 71.4 years)."}}},
{"id":"n-9eded907","guard":[["hasAny",["american","between","expectancy","greater","has","life","new","samoa","zealand"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between New Zealand and American Samoa, which has the greater life expectancy":"New Zealand has the larger life expectancy (77.8 years against 75.1 years)."}}},
{"id":"n-a0140ac1","guard":[["hasAny",["gabon","marshall"]],["has","gabon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Gabon and Marshall Islands, which has the greater life expectancy":"Marshall Islands has the larger life expectancy (65.5 years against 50.1 years)."}}},
{"id":"n-a3501876","guard":[["has","albania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Albania or Bosnia and Herzegovina":"Albania has the larger life expectancy (71.6 years against 71.5 years)."}}},
{"id":"n-a41186d5","guard":[["hasAny",["bhutan","lower case","lowercase","small letters"]],["has","nicaragua"]],"pyramid":["render.str",["transform.lower",["sense.subject"]]],"mem":null},
{"id":"n-a5c22e7f","guard":[["hasAny",["albania","bosnia","expectancy","herzegovina","larger","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Albania or Bosnia and Herzegovina":"Albania has the larger life expectancy (71.6 years against 71.5 years)."}}},
{"id":"n-a6ed089b","guard":[["hasAny",["expectancy","french","guiana","has","larger","life","slovakia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, French Guiana or Slovakia":"French Guiana has the larger life expectancy (76.1 years against 73.7 years)."}}},
{"id":"n-aa2ce6a7","guard":[["hasAny",["expectancy","fiji","has","islands","larger","life","vietnam"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Fiji Islands or Vietnam":"Vietnam has the larger life expectancy (69.3 years against 67.9 years)."}}},
{"id":"n-aaacedcd","guard":[["has","malaysia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Kuwait or Malaysia":"Kuwait has the larger life expectancy (76.1 years against 70.8 years)."}}},
{"id":"n-ac768cbd","guard":[["hasAny",["east","larger","timor"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, East Timor or Northern Mariana Islands":"Northern Mariana Islands has the larger life expectancy (75.5 years against 46 years)."}}},
{"id":"n-adf312e4","guard":[["hasAny",["egypt","iceland"]],["has","egypt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Iceland and Egypt, which has the greater life expectancy":"Iceland has the larger life expectancy (79.4 years against 63.3 years)."}}},
{"id":"n-ae4fb822","guard":[["hasAny",["arabia","between","chile","expectancy","greater","has","life","saudi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Chile and Saudi Arabia, which has the greater life expectancy":"Chile has the larger life expectancy (75.7 years against 67.8 years)."}}},
{"id":"n-afcbf0d7","guard":[["hasAny",["bahamas","expectancy","has","larger","life","tobago","trinidad"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Bahamas or Trinidad and Tobago":"Bahamas has the larger life expectancy (71.1 years against 68 years)."}}},
{"id":"n-b25cf65f","guard":[["hasAny",["bahamas","larger"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Bahamas or Trinidad and Tobago":"Bahamas has the larger life expectancy (71.1 years against 68 years)."}}},
{"id":"n-b2717d94","guard":[["hasAny",["between","expectancy","greater","has","life","lucia","palestine","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Saint Lucia and Palestine, which has the greater life expectancy":"Saint Lucia has the larger life expectancy (72.3 years against 71.4 years)."}}},
{"id":"n-b33e58d1","guard":[["has","niger"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Niger or Fiji Islands":"Fiji Islands has the larger life expectancy (67.9 years against 41.3 years)."}}},
{"id":"n-b521b4c8","guard":[["hasAny",["between","expectancy","greater","has","jordan","life","uruguay"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Jordan and Uruguay, which has the greater life expectancy":"Jordan has the larger life expectancy (77.4 years against 75.2 years)."}}},
{"id":"n-b78b3c8b","guard":[["has","angola"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Northern Mariana Islands and Angola, which has the greater life expectancy":"Northern Mariana Islands has the larger life expectancy (75.5 years against 38.3 years)."}}},
{"id":"n-bb704183","guard":[["hasAny",["burundi","expectancy","larger","life","nauru"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Nauru or Burundi":"Nauru has the larger life expectancy (60.8 years against 46.2 years)."}}},
{"id":"n-bb9c10f1","guard":[["hasAny",["between","coast","expectancy","greater","has","ivory","life","paraguay"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Paraguay and Ivory Coast, which has the greater life expectancy":"Paraguay has the larger life expectancy (73.7 years against 45.2 years)."}}},
{"id":"n-be9d069d","guard":[["hasAny",["bosnia","expectancy","has","herzegovina","larger","life","ukraine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Bosnia and Herzegovina or Ukraine":"Bosnia and Herzegovina has the larger life expectancy (71.5 years against 66 years)."}}},
{"id":"n-bf71731d","guard":[["hasAny",["aruba","between","bolivia","expectancy","greater","has","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Aruba and Bolivia, which has the greater life expectancy":"Aruba has the larger life expectancy (78.4 years against 63.7 years)."}}},
{"id":"n-bff47b8d","guard":[["hasAny",["between","expectancy","gabon","greater","has","islands","life","marshall"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Gabon and Marshall Islands, which has the greater life expectancy":"Marshall Islands has the larger life expectancy (65.5 years against 50.1 years)."}}},
{"id":"n-c225997d","guard":[["has","barbados"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Barbados or Eritrea":"Barbados has the larger life expectancy (73 years against 55.8 years)."}}},
{"id":"n-c29d8532","guard":[["hasAny",["armenia","expectancy","ireland","larger","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Ireland or Armenia":"Ireland has the larger life expectancy (76.8 years against 66.4 years)."}}},
{"id":"n-c2a95e62","guard":[["hasAny",["bangladesh","expectancy","larger","life","uruguay"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Uruguay or Bangladesh":"Uruguay has the larger life expectancy (75.2 years against 60.2 years)."}}},
{"id":"n-c30f0db7","guard":[["hasAny",["between","cape","expectancy","greater","has","hungary","life","verde"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Hungary and Cape Verde, which has the greater life expectancy":"Hungary has the larger life expectancy (71.4 years against 68.9 years)."}}},
{"id":"n-c416379c","guard":[["hasAny",["between","cyprus","expectancy","greater","has","life","turkey"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Cyprus and Turkey, which has the greater life expectancy":"Cyprus has the larger life expectancy (76.7 years against 71 years)."}}},
{"id":"n-c65ae788","guard":[["hasAny",["expectancy","has","larger","life","lithuania","lucia","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Lithuania or Saint Lucia":"Saint Lucia has the larger life expectancy (72.3 years against 69.1 years)."}}},
{"id":"n-c68059d4","guard":[["hasAny",["between","expectancy","greater","has","life","malaysia","myanmar"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Malaysia and Myanmar, which has the greater life expectancy":"Malaysia has the larger life expectancy (70.8 years against 54.9 years)."}}},
{"id":"n-c68a18e9","guard":[["hasAny",["eritrea","expectancy","has","larger","life","reunion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Eritrea or Reunion":"Reunion has the larger life expectancy (72.7 years against 55.8 years)."}}},
{"id":"n-c89b92a9","guard":[["has","ethiopia"],["has","san"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between San Marino and Ethiopia, which has the greater life expectancy":"San Marino has the larger life expectancy (81.1 years against 45.2 years)."}}},
{"id":"n-c8e6ea36","guard":[["hasAny",["expectancy","has","laos","larger","life","portugal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Portugal or Laos":"Portugal has the larger life expectancy (75.8 years against 53.1 years)."}}},
{"id":"n-cb28ee46","guard":[["hasAny",["expectancy","french","has","larger","life","paraguay","polynesia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, French Polynesia or Paraguay":"French Polynesia has the larger life expectancy (74.8 years against 73.7 years)."}}},
{"id":"n-cbc1aead","guard":[["has","brazil"],["has","larger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Mali or Brazil":"Brazil has the larger life expectancy (62.9 years against 46.7 years)."}}},
{"id":"n-cc6eaa14","guard":[["hasAny",["belarus","expectancy","helena","larger","life","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Saint Helena or Belarus":"Saint Helena has the larger life expectancy (76.8 years against 68 years)."}}},
{"id":"n-d1051b94","guard":[["hasAny",["expectancy","guyana","has","hungary","larger","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Guyana or Hungary":"Hungary has the larger life expectancy (71.4 years against 64 years)."}}},
{"id":"n-d18a06c5","guard":[["hasAny",["bangladesh","botswana","expectancy","has","larger","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Bangladesh or Botswana":"Bangladesh has the larger life expectancy (60.2 years against 39.3 years)."}}},
{"id":"n-d42a7db3","guard":[["hasAny",["between","expectancy","greater","has","life","puerto","rico","togo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Togo and Puerto Rico, which has the greater life expectancy":"Puerto Rico has the larger life expectancy (75.6 years against 54.7 years)."}}},
{"id":"n-d4c909b5","guard":[["hasAny",["between","expectancy","greater","has","helena","israel","life","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Israel and Saint Helena, which has the greater life expectancy":"Israel has the larger life expectancy (78.6 years against 76.8 years)."}}},
{"id":"n-d5c9df57","guard":[["hasAny",["expectancy","has","larger","life","marino","philippines","san"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Philippines or San Marino":"San Marino has the larger life expectancy (81.1 years against 67.5 years)."}}},
{"id":"n-d835fd75","guard":[["hasAny",["slovakia","sweden"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Slovakia and Sweden, which has the greater life expectancy":"Sweden has the larger life expectancy (79.6 years against 73.7 years)."}}},
{"id":"n-d9ff2be3","guard":[["hasAny",["australia","togo"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Australia or Togo":"Australia has the larger life expectancy (79.8 years against 54.7 years)."}}},
{"id":"n-dace6c5d","guard":[["has","sweden"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Sweden or Vanuatu":"Sweden has the larger life expectancy (79.6 years against 60.6 years)."}}},
{"id":"n-de387bdb","guard":[["has","turkey"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Turkey or Suriname":"Suriname has the larger life expectancy (71.4 years against 71 years)."}}},
{"id":"n-e09130b9","guard":[["has","slovakia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, French Guiana or Slovakia":"French Guiana has the larger life expectancy (76.1 years against 73.7 years)."}}},
{"id":"n-e26baaa7","guard":[["hasAny",["cook","greenland"]],["has","between"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Greenland and Cook Islands, which has the greater life expectancy":"Cook Islands has the larger life expectancy (71.1 years against 68.1 years)."}}},
{"id":"n-e3bb72c1","guard":[["hasAny",["brazil","expectancy","has","larger","life","mali"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Mali or Brazil":"Brazil has the larger life expectancy (62.9 years against 46.7 years)."}}},
{"id":"n-e5c7dd12","guard":[["hasAny",["ireland","laos"]],["has","ireland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Laos and Ireland, which has the greater life expectancy":"Ireland has the larger life expectancy (76.8 years against 53.1 years)."}}},
{"id":"n-e76aae08","guard":[["hasAny",["namibia","tuvalu"]],["has","namibia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Tuvalu and Namibia, which has the greater life expectancy":"Tuvalu has the larger life expectancy (66.3 years against 42.5 years)."}}},
{"id":"n-e96915eb","guard":[["hasAny",["bolivia","expectancy","kuwait","larger","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Bolivia or Kuwait":"Kuwait has the larger life expectancy (76.1 years against 63.7 years)."}}},
{"id":"n-e9b9cb8a","guard":[["hasAny",["has","ukraine"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Bosnia and Herzegovina or Ukraine":"Bosnia and Herzegovina has the larger life expectancy (71.5 years against 66 years)."}}},
{"id":"n-ec58da2e","guard":[["hasAny",["between","expectancy","greater","has","kitts","life","nevis","saint","zambia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Zambia and Saint Kitts and Nevis, which has the greater life expectancy":"Saint Kitts and Nevis has the larger life expectancy (70.7 years against 37.2 years)."}}},
{"id":"n-edb0718a","guard":[["hasAny",["between","expectancy","finland","gibraltar","greater","has","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Finland and Gibraltar, which has the greater life expectancy":"Gibraltar has the larger life expectancy (79 years against 77.4 years)."}}},
{"id":"n-edf32759","guard":[["hasAny",["belgium","between","expectancy","greater","has","honduras","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Honduras and Belgium, which has the greater life expectancy":"Belgium has the larger life expectancy (77.8 years against 69.9 years)."}}},
{"id":"n-ee4be2bf","guard":[["has","kazakhstan"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Kazakhstan or French Polynesia":"French Polynesia has the larger life expectancy (74.8 years against 63.2 years)."}}},
{"id":"n-f262bdff","guard":[["has","jordan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Kiribati or Jordan":"Jordan has the larger life expectancy (77.4 years against 59.8 years)."}}},
{"id":"n-f2c70f56","guard":[["hasAny",["australia","expectancy","has","larger","life","togo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Australia or Togo":"Australia has the larger life expectancy (79.8 years against 54.7 years)."}}},
{"id":"n-f3f952a8","guard":[["hasAny",["bhutan","reverse the words","reverse word order","words backwards"]],["has","nicaragua"]],"pyramid":["render.str",["transform.reverseWords",["sense.subject"]]],"mem":null},
{"id":"n-f521a3a7","guard":[["hasAny",["andorra","expectancy","larger","life","myanmar"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Myanmar or Andorra":"Andorra has the larger life expectancy (83.5 years against 54.9 years)."}}},
{"id":"n-f65e6fd2","guard":[["hasAny",["expectancy","larger","life","montserrat","syria"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Montserrat or Syria":"Montserrat has the larger life expectancy (78 years against 68.5 years)."}}},
{"id":"n-f77fceb8","guard":[["hasAny",["expectancy","larger","life","suriname","turkey"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Turkey or Suriname":"Suriname has the larger life expectancy (71.4 years against 71 years)."}}},
{"id":"n-fbf33675","guard":[["has","iceland"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger life expectancy, Tanzania or Iceland":"Iceland has the larger life expectancy (79.4 years against 52.3 years)."}}},
{"id":"n-ff8eb053","guard":[["hasAny",["egypt","expectancy","larger","life","philippines"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is larger: Egypt or Philippines":"Philippines has the larger life expectancy (67.5 years against 63.3 years)."}}},
{"id":"n-05fe9e47","guard":[["hasAny",["bhutan","capitalise","capitalize","capitalize each word","each word","split into words","title case"]],["has","nicaragua"]],"pyramid":["render.list",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-0bb0103a","guard":[["hasAny",["bhutan","separate by","split","split by"]],["has","nicaragua"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Bahamas"}]],"mem":null},
{"id":"n-15eb7ab1","guard":[["hasAny",["bhutan","separate by","split","split by"]],["has","nicaragua"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Australia"}]],"mem":null},
{"id":"n-16be0dc9","guard":[["hasAny",["bhutan","capitalise","capitalize","capitalize each word","each word","split into words","title case"]],["has","nicaragua"]],"pyramid":["render.lines",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-1e82936e","guard":[["hasAny",["bhutan","delete","remove","strip out","without"]],["has","nicaragua"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Bahamas"}]],"mem":null},
{"id":"n-256e365b","guard":[["hasAny",["a to z","alphabetical","alphabetize","bhutan","each word","split into words"]],["has","nicaragua"]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-36f4073e","guard":[["hasAny",["bhutan","each word","shortest","shortest one","shortest word","split into words"]],["has","nicaragua"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-38b22fd5","guard":[["hasAny",["all caps","bhutan","capital letters","capitals","each word","split into words","upper case","uppercase"]],["has","nicaragua"]],"pyramid":["render.lines",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-427faa2f","guard":[["hasAny",["bhutan","invert case","reverse the words","reverse word order","swap case","toggle case","words backwards"]],["has","nicaragua"]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-474514ec","guard":[["hasAny",["all caps","bhutan","capital letters","capitals","each word","split into words","upper case","uppercase"]],["has","nicaragua"]],"pyramid":["render.list",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-4b54efcb","guard":[["hasAny",["bahamas","delete","remove","strip out","without"]],["has","trinidad"]],"pyramid":["render.str",["transform.remove",{"lit":"Bahamas"},["sense.lastWord"]]],"mem":null},
{"id":"n-4ddf3231","guard":[["hasAny",["bhutan","each word","lower case","lowercase","small letters","split into words"]],["has","nicaragua"]],"pyramid":["render.lines",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-4df708ce","guard":[["hasAny",["bhutan","capitalise","capitalize","capitalize each word","invert case","swap case","title case","toggle case"]],["has","nicaragua"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-4fc9ad67","guard":[["hasAny",["bhutan","delete","remove","strip out","without"]],["has","nicaragua"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Barbados"}]],"mem":null},
{"id":"n-53278bea","guard":[["hasAny",["bhutan","lower case","lowercase","reverse the words","reverse word order","small letters","words backwards"]],["has","nicaragua"]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["sense.subject"]]]],"mem":null},
{"id":"n-53805c9c","guard":[["hasAny",["bhutan","each word","lower case","lowercase","small letters","split into words"]],["has","nicaragua"]],"pyramid":["render.and",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-5fcf73c7","guard":[["hasAny",["bhutan","separate by","split","split by"]],["has","nicaragua"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Belgium"}]],"mem":null},
{"id":"n-61956c7b","guard":[["hasAny",["bhutan","delete","remove","strip out","without"]],["has","nicaragua"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Cayman Islands"}]],"mem":null},
{"id":"n-63589502","guard":[["hasAny",["all caps","bhutan","capital letters","capitals","reverse the words","reverse word order","upper case","uppercase","words backwards"]],["has","nicaragua"]],"pyramid":["render.str",["transform.reverseWords",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-716dbc1c","guard":[["hasAny",["bhutan","delete","remove","strip out","without"]],["has","nicaragua"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Australia"}]],"mem":null},
{"id":"n-71d357ce","guard":[["hasAny",["bhutan","delete","remove","strip out","without"]],["has","nicaragua"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Cyprus"}]],"mem":null},
{"id":"n-79753af9","guard":[["hasAny",["bhutan","normalise","normalize","simplify the text"]],["has","nicaragua"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":3}]],"mem":null},
{"id":"n-7d7c04e6","guard":[["hasAny",["a to z","alphabetical","alphabetize","bhutan","each word","split into words"]],["has","nicaragua"]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-7d82a49d","guard":[["hasAny",["all caps","bhutan","capital letters","capitals","each word","split into words","upper case","uppercase"]],["has","nicaragua"]],"pyramid":["render.and",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-81ff9e95","guard":[["hasAny",["cyprus","delete","remove","strip out","without"]],["has","between"]],"pyramid":["render.str",["transform.remove",{"lit":"Cyprus"},["sense.lastWord"]]],"mem":null},
{"id":"n-8bac7f99","guard":[["hasAny",["bhutan","delete","remove","strip out","without"]],["has","nicaragua"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Chile"}]],"mem":null},
{"id":"n-920dc506","guard":[["hasAny",["bhutan","delete","remove","strip out","without"]],["has","nicaragua"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Andorra"}]],"mem":null},
{"id":"n-92bcaa85","guard":[["hasAny",["bhutan","separate by","split","split by"]],["has","nicaragua"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Cayman Islands"}]],"mem":null},
{"id":"n-94be535d","guard":[["has","bhutan"],["has","nicaragua"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],{"lit":1}]],"mem":null},
{"id":"n-96904100","guard":[["hasAny",["backwards","bhutan","each word","reverse","reverse order","reversed","split into words"]],["has","nicaragua"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-9819e446","guard":[["hasAny",["bhutan","delete","remove","strip out","without"]],["has","nicaragua"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Brazil"}]],"mem":null},
{"id":"n-9eb06999","guard":[["hasAny",["chile","delete","remove","strip out","without"]],["has","saudi"]],"pyramid":["render.str",["transform.remove",{"lit":"Chile"},["sense.lastWord"]]],"mem":null},
{"id":"n-9fd98f5a","guard":[["hasAny",["bhutan","distinct","each word","remove duplicates","split into words","unique","without repeats"]],["has","nicaragua"]],"pyramid":["render.lines",["transform.uniqueStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-b13e9e22","guard":[["hasAny",["bhutan","capitalise","capitalize","capitalize each word","reverse the words","reverse word order","title case","words backwards"]],["has","nicaragua"]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-b26e575c","guard":[["hasAny",["backwards","bhutan","each word","reverse","reverse order","reversed","split into words"]],["has","nicaragua"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-b3b774cb","guard":[["hasAny",["bhutan","distinct","each word","remove duplicates","split into words","unique","without repeats"]],["has","nicaragua"]],"pyramid":["render.list",["transform.uniqueStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-b73689f5","guard":[["hasAny",["bhutan","delete","remove","strip out","without"]],["has","nicaragua"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Belgium"}]],"mem":null},
{"id":"n-bd5e9490","guard":[["hasAny",["bhutan","each word","lower case","lowercase","small letters","split into words"]],["has","nicaragua"]],"pyramid":["render.list",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-c3cae56c","guard":[["hasAny",["bhutan","distinct","each word","remove duplicates","split into words","unique","without repeats"]],["has","nicaragua"]],"pyramid":["render.and",["transform.uniqueStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-c4cb8bb7","guard":[["hasAny",["bhutan","each word","invert case","split into words","swap case","toggle case"]],["has","nicaragua"]],"pyramid":["render.and",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-c9dad05f","guard":[["hasAny",["a to z","alphabetical","alphabetize","bhutan","each word","split into words"]],["has","nicaragua"]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-ce830f9a","guard":[["hasAny",["australia","delete","remove","strip out","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",{"lit":"Australia"},["sense.lastWord"]]],"mem":null},
{"id":"n-d3b790c3","guard":[["hasAny",["bhutan","normalise","normalize","simplify the text"]],["has","nicaragua"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":2}]],"mem":null},
{"id":"n-d6e2b64f","guard":[["hasAny",["bhutan","delete","remove","strip out","without"]],["has","nicaragua"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Aruba"}]],"mem":null},
{"id":"n-d753de10","guard":[["hasAny",["bhutan","each word","invert case","split into words","swap case","toggle case"]],["has","nicaragua"]],"pyramid":["render.list",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-d9c10fee","guard":[["hasAny",["aruba","delete","remove","strip out","without"]],["has","bolivia"]],"pyramid":["render.str",["transform.remove",{"lit":"Aruba"},["sense.lastWord"]]],"mem":null},
{"id":"n-da9dd824","guard":[["hasAny",["backwards","bhutan","each word","reverse","reverse order","reversed","split into words"]],["has","nicaragua"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-dd4646bd","guard":[["hasAny",["bhutan","capitalise","capitalize","capitalize each word","each word","split into words","title case"]],["has","nicaragua"]],"pyramid":["render.and",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-df524188","guard":[["hasAny",["brazil","delete","remove","strip out","without"]],["has","central"]],"pyramid":["render.str",["transform.remove",{"lit":"Brazil"},["sense.lastWord"]]],"mem":null},
{"id":"n-e815cd3f","guard":[["hasAny",["bhutan","separate by","split","split by"]],["has","nicaragua"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Andorra"}]],"mem":null},
{"id":"n-e842423a","guard":[["hasAny",["bhutan","separate by","split","split by"]],["has","nicaragua"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Barbados"}]],"mem":null},
{"id":"n-e951d9e2","guard":[["hasAny",["bhutan","each word","invert case","split into words","swap case","toggle case"]],["has","nicaragua"]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-fd5d9fdd","guard":[["hasAny",["andorra","delete","remove","strip out","without"]],["has","life"]],"pyramid":["render.str",["transform.remove",{"lit":"Andorra"},["sense.lastWord"]]],"mem":null},
{"id":"n-88ef0c66","guard":[["hasAny",["from position","items from to","kitts","slice"]],["has","life"]],"pyramid":["render.and",["transform.sliceStrs",["sense.list"],{"lit":3},["sense.wordCount"]]],"mem":null},
{"id":"n-c8dc72c4","guard":[["hasAny",["bhutan","change to","replace","substitute","swap"]],["has","nicaragua"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-14d32db1","guard":[["hasAny",["coast","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," expectancy (73.7 years against 45.2 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-221b9587","guard":[["hasAny",["element","helena","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","israel"]],"pyramid":["render.template",{"lit":["Israel ",{"slot":0}," the larger ",{"slot":1}," ",{"slot":2}," (78.6 years against 76.8 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2896629c","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","nicaragua"]],"pyramid":["render.template",{"lit":["Nicaragua ",{"slot":0}," the larger ",{"slot":1}," ",{"slot":2}," (68.7 years against 52.4 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-51e181ea","guard":[["hasAny",["element","helena","item number","longest","longest one","longest word","nth","position"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the larger ",{"slot":1}," ",{"slot":2}," (78.6 years against 76.8 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-55321837","guard":[["hasAny",["arabia","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," expectancy (75.7 years against 67.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-5f677122","guard":[["hasAny",["cape","element","item number","longest","longest one","longest word","nth","position"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the larger ",{"slot":1}," ",{"slot":2}," (71.4 years against 68.9 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6acc45fb","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","uzbekistan"]],["has","suriname"]],"pyramid":["render.template",{"lit":["Suriname ",{"slot":0}," the ",{"slot":1}," life ",{"slot":2}," (71.4 years against 63.7 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6fdb8dc3","guard":[["hasAny",["cape","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," expectancy (71.4 years against 68.9 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-7b7d6185","guard":[["hasAny",["element","helena","item number","nth","position","shortest","shortest one","shortest word"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," expectancy (78.6 years against 76.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-84c69bac","guard":[["hasAny",["coast","element","item number","longest","longest one","longest word","nth","position"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the larger ",{"slot":1}," ",{"slot":2}," (73.7 years against 45.2 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-84f79791","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","nicaragua"]],"pyramid":["render.template",{"lit":["Nicaragua ",{"slot":0}," the ",{"slot":1}," life ",{"slot":2}," (68.7 years against 52.4 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-98dfbeeb","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","uzbekistan"]],["has","suriname"]],"pyramid":["render.template",{"lit":["Suriname ",{"slot":0}," the larger ",{"slot":1}," ",{"slot":2}," (71.4 years against 63.7 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9be045b9","guard":[["hasAny",["coast","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","paraguay"]],"pyramid":["render.template",{"lit":["Paraguay ",{"slot":0}," the larger ",{"slot":1}," ",{"slot":2}," (73.7 years against 45.2 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-aa461482","guard":[["hasAny",["cape","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["Hungary ",{"slot":0}," the larger ",{"slot":1}," ",{"slot":2}," (71.4 years against 68.9 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ddef89a4","guard":[["hasAny",["arabia","element","item number","longest","longest one","longest word","nth","position"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the larger ",{"slot":1}," ",{"slot":2}," (75.7 years against 67.8 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f4fdd134","guard":[["hasAny",["arabia","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","chile"]],"pyramid":["render.template",{"lit":["Chile ",{"slot":0}," the larger ",{"slot":1}," ",{"slot":2}," (75.7 years against 67.8 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-059ee83c","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","uzbekistan"]],["has","suriname"]],"pyramid":["render.template",{"lit":["Suriname ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," expectancy (71.4 years against 63.7 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-16060069","guard":[["hasAny",["coast","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (73.7 years against 45.2 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.subject"]],"mem":null},
{"id":"n-22e3e76a","guard":[["hasAny",["bhutan","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","nicaragua"]],"pyramid":["render.template",{"lit":["Nicaragua ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," expectancy (68.7 years against 52.4 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-26bb4bac","guard":[["hasAny",["element","helena","item number","nth","position","shortest","shortest one","shortest word"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (78.6 years against 76.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-39367f11","guard":[["hasAny",["coast","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (73.7 years against 45.2 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-5f5e9748","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position"]],["has","nicaragua"]],"pyramid":["render.template",{"lit":["Nicaragua has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (68.7 years against 52.4 years)."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-919dbce2","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","uzbekistan"]],["has","suriname"]],"pyramid":["render.template",{"lit":["Suriname has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (71.4 years against 63.7 years)."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c8e5985a","guard":[["hasAny",["arabia","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (75.7 years against 67.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.subject"]],"mem":null},
{"id":"n-cd62f8df","guard":[["hasAny",["cape","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (71.4 years against 68.9 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-d8196e7f","guard":[["hasAny",["element","helena","item number","nth","position","shortest","shortest one","shortest word"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (78.6 years against 76.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.subject"]],"mem":null},
{"id":"n-df01fb55","guard":[["hasAny",["cape","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (71.4 years against 68.9 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.subject"]],"mem":null},
{"id":"n-fd4dc66e","guard":[["hasAny",["arabia","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (75.7 years against 67.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-03133bc4","guard":[["hasAny",["cape","element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (71.4 years against 68.9 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-125bd86d","guard":[["hasAny",["angola","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","tanzania"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (52.3 years against 38.3 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1a6e9fde","guard":[["hasAny",["element","item number","longest","longest one","longest word","montserrat","nth","position","shortest","shortest one","shortest word"]],["has","syria"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (78 years against 68.5 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-241e497d","guard":[["hasAny",["arabia","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (75.7 years against 67.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-24aca794","guard":[["hasAny",["coast","element","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (73.7 years against 45.2 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3dc4c06a","guard":[["hasAny",["arabia","element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (75.7 years against 67.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-444dee0a","guard":[["hasAny",["element","helena","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (78.6 years against 76.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-49a3f1fb","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","suriname"]],["has","turkey"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.4 years against 71 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-54499953","guard":[["hasAny",["element","ethiopia","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (45.2 years against 37.6 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-56412585","guard":[["hasAny",["capitalise","capitalize","capitalize each word","coast","element","item number","nth","position","shortest","shortest one","shortest word","title case"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (73.7 years against 45.2 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-570f87ab","guard":[["hasAny",["barbados","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (73 years against 55.8 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-68105451","guard":[["hasAny",["coast","element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (73.7 years against 45.2 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-69ea747e","guard":[["hasAny",["all caps","cape","capital letters","capitals","element","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (71.4 years against 68.9 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-6f51003a","guard":[["hasAny",["belgium","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (77.8 years against 46.7 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-70faab1c","guard":[["hasAny",["cape","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (71.4 years against 68.9 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-77404f91","guard":[["hasAny",["cape","element","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (71.4 years against 68.9 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8950a0a5","guard":[["hasAny",["burundi","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (60.8 years against 46.2 years)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-90eb7108","guard":[["hasAny",["armenia","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","ireland"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (76.8 years against 66.4 years)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9615ce96","guard":[["hasAny",["armenia","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","ireland"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (76.8 years against 66.4 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9933c42d","guard":[["hasAny",["bangladesh","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","uruguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (75.2 years against 60.2 years)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ab2e463a","guard":[["hasAny",["coast","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (73.7 years against 45.2 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-aeeeaa65","guard":[["hasAny",["arabia","capitalise","capitalize","capitalize each word","element","item number","nth","position","shortest","shortest one","shortest word","title case"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (75.7 years against 67.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-af1c320f","guard":[["hasAny",["element","item number","longest","longest one","longest word","namibia","nth","position","shortest","shortest one","shortest word"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (64.1 years against 42.5 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b50c5382","guard":[["hasAny",["all caps","arabia","capital letters","capitals","element","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (75.7 years against 67.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b5d99ec6","guard":[["hasAny",["element","helena","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (78.6 years against 76.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b9e7fe13","guard":[["hasAny",["arabia","element","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (75.7 years against 67.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-beb6c61e","guard":[["hasAny",["all caps","capital letters","capitals","element","helena","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (78.6 years against 76.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-c01e15dc","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","sweden"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (79.6 years against 60.6 years)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c1e8d61b","guard":[["hasAny",["element","gibraltar","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (79 years against 64 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c4827fb9","guard":[["hasAny",["element","guadeloupe","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (77 years against 63.1 years)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cd8cec05","guard":[["hasAny",["cape","capitalise","capitalize","capitalize each word","element","item number","nth","position","shortest","shortest one","shortest word","title case"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (71.4 years against 68.9 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ddea3196","guard":[["hasAny",["all caps","capital letters","capitals","coast","element","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (73.7 years against 45.2 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-e5e10882","guard":[["hasAny",["element","helena","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (78.6 years against 76.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ec2faf47","guard":[["hasAny",["element","item number","lithuania","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (69.9 years against 69.1 years)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f9333694","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","helena","item number","nth","position","shortest","shortest one","shortest word","title case"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (78.6 years against 76.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-062f2366","guard":[["hasAny",["all caps","capital letters","capitals","coast","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (73.7 years against 45.2 years)."]},["transform.upper",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0b0e7477","guard":[["hasAny",["cape","element","invert case","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (71.4 years against 68.9 years)."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0d533510","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","uzbekistan"]],["has","suriname"]],"pyramid":["render.template",{"lit":["Suriname ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.4 years against 63.7 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0e7c5da4","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","uzbekistan"]],["has","suriname"]],"pyramid":["render.template",{"lit":["Suriname ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.4 years against 63.7 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-129f653e","guard":[["hasAny",["cape","element","item number","longest","longest one","longest word","nth","position"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (71.4 years against 68.9 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-147eff2e","guard":[["hasAny",["coast","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (73.7 years against 45.2 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1af245f2","guard":[["hasAny",["arabia","element","item number","longest","longest one","longest word","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (75.7 years against 67.8 years)."]},["transform.lower",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-23dfd754","guard":[["hasAny",["cape","element","item number","longest","longest one","longest word","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (71.4 years against 68.9 years)."]},["transform.lower",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-258943cc","guard":[["hasAny",["coast","element","invert case","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (73.7 years against 45.2 years)."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2fd7b711","guard":[["hasAny",["coast","element","item number","longest","longest one","longest word","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (73.7 years against 45.2 years)."]},["transform.lower",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-32019c00","guard":[["hasAny",["african","how many vowels","longest","longest one","longest word","number of vowels","shortest","shortest one","shortest word","vowel count"]],["has","brazil"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger life ",{"slot":2}," (62.",{"slot":3}," years against 44 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["render.number",["aggregate.vowels",["sense.after",{"lit":"has"}]]]],"mem":null},
{"id":"n-343afe75","guard":[["hasAny",["arabia","element","item number","longest","longest one","longest word","nth","position"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (75.7 years against 67.8 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-38eda11c","guard":[["hasAny",["element","ethiopia","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (45.2 years against 37.6 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3da935da","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","helena","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","title case"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (78.6 years against 76.8 years)."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4256a8b8","guard":[["hasAny",["element","item number","longest","longest one","longest word","montserrat","nth","position","shortest","shortest one","shortest word"]],["has","syria"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (78 years against 68.5 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-451911c3","guard":[["hasAny",["bangladesh","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","uruguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (75.2 years against 60.2 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-491acf15","guard":[["hasAny",["australia","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (79.8 years against 44 years)."]},["transform.nthStr",["sense.words"],{"lit":10}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4a671410","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","uzbekistan"]],["has","suriname"]],"pyramid":["render.template",{"lit":["Suriname ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.4 years against 63.7 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-55870564","guard":[["hasAny",["element","gibraltar","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (79 years against 64 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-58ec1efc","guard":[["hasAny",["all caps","capital letters","capitals","element","helena","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (78.6 years against 76.8 years)."]},["transform.upper",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5a6bd84d","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","nicaragua"]],"pyramid":["render.template",{"lit":["Nicaragua ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.7 years against 52.4 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-61215c55","guard":[["hasAny",["cape","capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","title case"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (71.4 years against 68.9 years)."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6252f578","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","nicaragua"]],"pyramid":["render.template",{"lit":["Nicaragua ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.7 years against 52.4 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-714591b8","guard":[["hasAny",["arabia","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (75.7 years against 67.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7b57e446","guard":[["hasAny",["capitalise","capitalize","capitalize each word","coast","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","title case"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (73.7 years against 45.2 years)."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7bb2e55c","guard":[["hasAny",["each word","element","helena","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (78.6 years against 76.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7ce09f4a","guard":[["hasAny",["arabia","capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","title case"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (75.7 years against 67.8 years)."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-82a3d9f3","guard":[["hasAny",["armenia","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","ireland"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (76.8 years against 66.4 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-830b9113","guard":[["hasAny",["element","helena","invert case","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (78.6 years against 76.8 years)."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8f372a4e","guard":[["hasAny",["cape","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (71.4 years against 68.9 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9387b47c","guard":[["hasAny",["burundi","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (60.8 years against 46.2 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-950112d4","guard":[["hasAny",["coast","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (73.7 years against 45.2 years)."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9fc2b66c","guard":[["hasAny",["element","helena","item number","longest","longest one","longest word","nth","position"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (78.6 years against 76.8 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a088ac73","guard":[["hasAny",["coast","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (73.7 years against 45.2 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a311231b","guard":[["hasAny",["cape","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (71.4 years against 68.9 years)."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a70bd246","guard":[["hasAny",["belgium","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (77.8 years against 46.7 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a91f1664","guard":[["hasAny",["cape","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (71.4 years against 68.9 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b00e798f","guard":[["hasAny",["arabia","element","invert case","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (75.7 years against 67.8 years)."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b0126352","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","sweden"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (79.6 years against 60.6 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b559c478","guard":[["hasAny",["all caps","cape","capital letters","capitals","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (71.4 years against 68.9 years)."]},["transform.upper",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b9b4f376","guard":[["hasAny",["element","guadeloupe","item number","longest","longest one","longest word","nth","position"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (77 years against 63.1 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-bc1645db","guard":[["hasAny",["arabia","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (75.7 years against 67.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bd122779","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position"]],["has","nicaragua"]],"pyramid":["render.template",{"lit":["Nicaragua ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.7 years against 52.4 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c6e1f4e4","guard":[["hasAny",["eswatini","how many words","longest","longest one","longest word","number of words","shortest","shortest one","shortest word","word count"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger life ",{"slot":2}," (66 years against 40.",{"slot":3}," years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["render.number",["aggregate.words",["sense.after",{"lit":"has"}]]]],"mem":null},
{"id":"n-ca2b66eb","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","uzbekistan"]],["has","suriname"]],"pyramid":["render.template",{"lit":["Suriname ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.4 years against 63.7 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cc053964","guard":[["hasAny",["barbados","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (73 years against 55.8 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cd169983","guard":[["hasAny",["arabia","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (75.7 years against 67.8 years)."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d85c7779","guard":[["hasAny",["each word","element","helena","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (78.6 years against 76.8 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-df6e2b15","guard":[["hasAny",["element","helena","item number","longest","longest one","longest word","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (78.6 years against 76.8 years)."]},["transform.lower",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e5a66392","guard":[["hasAny",["element","item number","lithuania","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (69.9 years against 69.1 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-effdf21a","guard":[["hasAny",["coast","element","item number","longest","longest one","longest word","nth","position"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (73.7 years against 45.2 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f64fdf26","guard":[["hasAny",["element","helena","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (78.6 years against 76.8 years)."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-fb94883b","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","nicaragua"]],"pyramid":["render.template",{"lit":["Nicaragua ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.7 years against 52.4 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-feb24df9","guard":[["hasAny",["all caps","arabia","capital letters","capitals","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (75.7 years against 67.8 years)."]},["transform.upper",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0b43b13e","guard":[["hasAny",["element","ethiopia","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (45.2 years against 37.6 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0bf4920d","guard":[["hasAny",["element","first n","gibraltar","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (79 years against 64 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0e4d05c8","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","longest","longest one","longest word","nth","position","upper case","uppercase","uzbekistan"]],["has","suriname"]],"pyramid":["render.template",{"lit":["Suriname ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.4 years against 63.7 years)."]},["transform.upper",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-10951e8b","guard":[["hasAny",["arabia","each word","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (75.7 years against 67.8 years)."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-109b7d80","guard":[["hasAny",["element","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case","uzbekistan"]],["has","suriname"]],"pyramid":["render.template",{"lit":["Suriname ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.4 years against 63.7 years)."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-11b21667","guard":[["hasAny",["albania","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.6 years against 71.5 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2c8fa809","guard":[["hasAny",["bhutan","element","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","nicaragua"]],"pyramid":["render.template",{"lit":["Nicaragua ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.7 years against 52.4 years)."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2d3bf550","guard":[["hasAny",["element","first n","gibraltar","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (79 years against 64 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-333cb5cc","guard":[["hasAny",["burundi","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (60.8 years against 46.2 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3bc6f96d","guard":[["hasAny",["bangladesh","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","uruguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (75.2 years against 60.2 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3d9d66a6","guard":[["hasAny",["burundi","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (60.8 years against 46.2 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-475a1f87","guard":[["hasAny",["element","first n","guadeloupe","item number","longest","longest one","longest word","nth","position","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (77 years against 63.1 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4763af68","guard":[["hasAny",["element","first n","item number","longest","longest one","longest word","montserrat","nth","position","shortest","shortest one","shortest word","take","top"]],["has","syria"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (78 years against 68.5 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4c6c1469","guard":[["hasAny",["arabia","each word","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words"]],["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (75.7 years against 67.8 years)."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-54b0790e","guard":[["hasAny",["bhutan","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","nicaragua"]],"pyramid":["render.template",{"lit":["Nicaragua ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.7 years against 52.4 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5ce8a68a","guard":[["hasAny",["bhutan","capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","nth","position","title case"]],["has","nicaragua"]],"pyramid":["render.template",{"lit":["Nicaragua ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.7 years against 52.4 years)."]},["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-64be3c43","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position"]],["has","nicaragua"]],"pyramid":["render.template",{"lit":["Nicaragua ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.7 years against 52.4 years)."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-674df051","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","uzbekistan"]],["has","suriname"]],"pyramid":["render.template",{"lit":["Suriname ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.4 years against 63.7 years)."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6c2ddfcd","guard":[["hasAny",["element","first n","item number","longest","longest one","longest word","montserrat","nth","position","shortest","shortest one","shortest word","take","top"]],["has","syria"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (78 years against 68.5 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7adb61d8","guard":[["hasAny",["element","first n","item number","lithuania","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (69.9 years against 69.1 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8005da82","guard":[["hasAny",["all caps","bhutan","capital letters","capitals","element","item number","longest","longest one","longest word","nth","position","upper case","uppercase"]],["has","nicaragua"]],"pyramid":["render.template",{"lit":["Nicaragua ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.7 years against 52.4 years)."]},["transform.upper",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-813fa4d8","guard":[["hasAny",["each word","element","helena","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (78.6 years against 76.8 years)."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-81f77fa5","guard":[["hasAny",["element","ethiopia","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (45.2 years against 37.6 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-83cc3493","guard":[["hasAny",["armenia","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","ireland"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (76.8 years against 66.4 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-89085114","guard":[["hasAny",["element","item number","longest","longest one","longest word","lower case","lowercase","nth","position","small letters","uzbekistan"]],["has","suriname"]],"pyramid":["render.template",{"lit":["Suriname ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.4 years against 63.7 years)."]},["transform.lower",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8aa23a5d","guard":[["hasAny",["coast","each word","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (73.7 years against 45.2 years)."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8abdcecc","guard":[["hasAny",["element","first n","item number","lithuania","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (69.9 years against 69.1 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8afd942a","guard":[["hasAny",["element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","sweden","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (79.6 years against 60.6 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-974eeef5","guard":[["hasAny",["element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","sweden","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (79.6 years against 60.6 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-97cef48d","guard":[["hasAny",["cape","each word","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (71.4 years against 68.9 years)."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-98b90da2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","nth","position","title case","uzbekistan"]],["has","suriname"]],"pyramid":["render.template",{"lit":["Suriname ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.4 years against 63.7 years)."]},["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9c327bc4","guard":[["hasAny",["bangladesh","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","uruguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (75.2 years against 60.2 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a5d25f9d","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","lower case","lowercase","nth","position","small letters"]],["has","nicaragua"]],"pyramid":["render.template",{"lit":["Nicaragua ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.7 years against 52.4 years)."]},["transform.lower",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a964093f","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","uzbekistan"]],["has","suriname"]],"pyramid":["render.template",{"lit":["Suriname ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.4 years against 63.7 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a98e6c41","guard":[["hasAny",["belgium","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (77.8 years against 46.7 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-afe32545","guard":[["hasAny",["coast","each word","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (73.7 years against 45.2 years)."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c4f62989","guard":[["hasAny",["belgium","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (77.8 years against 46.7 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c74ba7f7","guard":[["hasAny",["element","first n","guadeloupe","item number","longest","longest one","longest word","nth","position","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (77 years against 63.1 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cba7b565","guard":[["hasAny",["barbados","element","goes into","how many whole times","integer division","item number","nth","position","whole division"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger life ",{"slot":2}," (73 years against 72.",{"slot":3}," years)."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"],["render.number",["transform.idiv",{"lit":44},["sense.wordCount"]]]],"mem":null},
{"id":"n-d0b2cc13","guard":[["hasAny",["each word","element","helena","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words"]],["has","israel"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (78.6 years against 76.8 years)."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e01227f8","guard":[["hasAny",["barbados","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (73 years against 55.8 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e1b42e5c","guard":[["hasAny",["cape","each word","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," ",{"slot":3}," (71.4 years against 68.9 years)."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e55d8fc0","guard":[["hasAny",["element","gibraltar","how many words","item number","longest","longest one","longest word","nth","number of words","position","shortest","shortest one","shortest word","word count"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger life ",{"slot":2}," (79 years against 77.",{"slot":3}," years)."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["render.number",["aggregate.words",["sense.after",{"lit":"has"}]]]],"mem":null},
{"id":"n-e58ebcb5","guard":[["hasAny",["barbados","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (73 years against 55.8 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ef670b6d","guard":[["hasAny",["armenia","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","ireland"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (76.8 years against 66.4 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1e482c9e","guard":[["hasAny",["bhutan","each word","element","item number","longest","longest one","longest word","nth","position","split into words"]],["has","nicaragua"]],"pyramid":["render.template",{"lit":["Nicaragua ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.7 years against 52.4 years)."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2c180861","guard":[["hasAny",["each word","element","item number","longest","longest one","longest word","nth","position","split into words","uzbekistan"]],["has","suriname"]],"pyramid":["render.template",{"lit":["Suriname ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.4 years against 63.7 years)."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6500f46f","guard":[["hasAny",["bhutan","each word","element","item number","longest","longest one","longest word","nth","position","split into words"]],["has","nicaragua"]],"pyramid":["render.template",{"lit":["Nicaragua ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.7 years against 52.4 years)."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-79870d19","guard":[["hasAny",["each word","element","item number","longest","longest one","longest word","nth","position","split into words","uzbekistan"]],["has","suriname"]],"pyramid":["render.template",{"lit":["Suriname ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.4 years against 63.7 years)."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b1233ea4","guard":[["hasAny",["albania","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.6 years against 71.5 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b52e2c4a","guard":[["hasAny",["albania","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.6 years against 71.5 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"whose life expectancy is larger: Bolivia or Kuwait","expect":{"contains":["Kuwait"],"notContains":["Bolivia"],"notRefusal":true}},{"q":"which has the larger life expectancy, Guyana or Hungary","expect":{"contains":["Hungary"],"notContains":["Guyana"],"notRefusal":true}},{"q":"which has the larger life expectancy, Papua New Guinea or New Zealand","expect":{"contains":["New Zealand"],"notContains":["Papua New Guinea"],"notRefusal":true}},{"q":"which has the larger life expectancy, French Polynesia or Paraguay","expect":{"contains":["French Polynesia"],"notContains":["Paraguay"],"notRefusal":true}},{"q":"between Saint Lucia and Palestine, which has the greater life expectancy","expect":{"contains":["Saint Lucia"],"notContains":["Palestine"],"notRefusal":true}},{"q":"whose life expectancy is larger: Guadeloupe or Papua New Guinea","expect":{"contains":["Guadeloupe"],"notContains":["Papua New Guinea"],"notRefusal":true}},{"q":"between United States and Romania, which has the greater life expectancy","expect":{"contains":["United States"],"notContains":["Romania"],"notRefusal":true}},{"q":"which has the larger life expectancy, Tanzania or Iceland","expect":{"contains":["Iceland"],"notContains":["Tanzania"],"notRefusal":true}},{"q":"whose life expectancy is larger: Marshall Islands or Kiribati","expect":{"contains":["Marshall Islands"],"notContains":["Kiribati"],"notRefusal":true}},{"q":"whose life expectancy is larger: Turkey or Suriname","expect":{"contains":["Suriname"],"notContains":["Turkey"],"notRefusal":true}},{"q":"which has the larger life expectancy, Mali or Brazil","expect":{"contains":["Brazil"],"notContains":["Mali"],"notRefusal":true}},{"q":"whose life expectancy is larger: Puerto Rico or Moldova","expect":{"contains":["Puerto Rico"],"notContains":["Moldova"],"notRefusal":true}},{"q":"which has the larger life expectancy, Chad or Aruba","expect":{"contains":["Aruba"],"notContains":["Chad"],"notRefusal":true}},{"q":"which has the larger life expectancy, Kuwait or Malaysia","expect":{"contains":["Kuwait"],"notContains":["Malaysia"],"notRefusal":true}},{"q":"between Laos and Ireland, which has the greater life expectancy","expect":{"contains":["Ireland"],"notContains":["Laos"],"notRefusal":true}},{"q":"between Slovakia and Sweden, which has the greater life expectancy","expect":{"contains":["Sweden"],"notContains":["Slovakia"],"notRefusal":true}},{"q":"whose life expectancy is larger: Montserrat or Syria","expect":{"contains":["Montserrat"],"notContains":["Syria"],"notRefusal":true}},{"q":"which has the larger life expectancy, Bosnia and Herzegovina or Ukraine","expect":{"contains":["Bosnia and Herzegovina"],"notContains":["Ukraine"],"notRefusal":true}},{"q":"whose life expectancy is larger: Namibia or Tajikistan","expect":{"contains":["Tajikistan"],"notContains":["Namibia"],"notRefusal":true}},{"q":"whose life expectancy is larger: Belgium or Mali","expect":{"contains":["Belgium"],"notContains":["Mali"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
