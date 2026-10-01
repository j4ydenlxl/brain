// country-population-smaller-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"country-population-smaller-neo-g6","class":"country-population-smaller","generation":6,"lane":"neo","grownFrom":["whose population is smaller: Comoros or Niger","between North Macedonia and Saint Kitts and Nevis, which has the lesser population","between Vanuatu and Uganda, which has the lesser population","whose population is smaller: Madagascar or Puerto Rico","between Qatar and Bosnia and Herzegovina, which has the lesser population","whose population is smaller: Guyana or Estonia","whose population is smaller: Niue or South Georgia and the South Sandwich Islands","between Tajikistan and Haiti, which has the lesser population","between El Salvador and Niue, which has the lesser population","which has the smaller population, Gabon or Djibouti","whose population is smaller: Tonga or Marshall Islands","whose population is smaller: Haiti or Benin","between Monaco and Malta, which has the lesser population","which has the smaller population, Niger or Qatar","whose population is smaller: Bosnia and Herzegovina or Myanmar","which has the smaller population, Uruguay or North Macedonia","which has the smaller population, The Democratic Republic of Congo or Morocco","whose population is smaller: Saint Kitts and Nevis or Sudan","whose population is smaller: Cayman Islands or South Sudan","between Burundi and Cook Islands, which has the lesser population"],"version":1});

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
{"id":"n-1b28ce1a","guard":[["has","population"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Comoros or Niger":"Comoros has the smaller population (832322 against 22442948).","between North Macedonia and Saint Kitts and Nevis, which has the lesser population":"Saint Kitts and Nevis has the smaller population (52441 against 2084367).","between Vanuatu and Uganda, which has the lesser population":"Vanuatu has the smaller population (292680 against 42723139).","whose population is smaller: Madagascar or Puerto Rico":"Puerto Rico has the smaller population (3195153 against 26262368).","between Qatar and Bosnia and Herzegovina, which has the lesser population":"Qatar has the smaller population (2781677 against 3323929).","whose population is smaller: Guyana or Estonia":"Guyana has the smaller population (779004 against 1321977).","whose population is smaller: Niue or South Georgia and the South Sandwich Islands":"South Georgia and the South Sandwich Islands has the smaller population (30 against 1624).","between Tajikistan and Haiti, which has the lesser population":"Tajikistan has the smaller population (9100837 against 11123176).","between El Salvador and Niue, which has the lesser population":"Niue has the smaller population (1624 against 6420744).","which has the smaller population, Gabon or Djibouti":"Djibouti has the smaller population (958920 against 2119275).","whose population is smaller: Tonga or Marshall Islands":"Marshall Islands has the smaller population (58413 against 103197).","whose population is smaller: Haiti or Benin":"Haiti has the smaller population (11123176 against 11485048).","between Monaco and Malta, which has the lesser population":"Monaco has the smaller population (38682 against 484630).","which has the smaller population, Niger or Qatar":"Qatar has the smaller population (2781677 against 22442948).","whose population is smaller: Bosnia and Herzegovina or Myanmar":"Bosnia and Herzegovina has the smaller population (3323929 against 53708395).","which has the smaller population, Uruguay or North Macedonia":"North Macedonia has the smaller population (2084367 against 3449299).","which has the smaller population, The Democratic Republic of Congo or Morocco":"Morocco has the smaller population (36029138 against 84068091).","whose population is smaller: Saint Kitts and Nevis or Sudan":"Saint Kitts and Nevis has the smaller population (52441 against 41801533).","whose population is smaller: Cayman Islands or South Sudan":"Cayman Islands has the smaller population (64174 against 10975920).","between Burundi and Cook Islands, which has the lesser population":"Cook Islands has the smaller population (17379 against 11175378).","which has the smaller population, Algeria or Oman":"Oman has the smaller population (4829483 against 42228429).","whose population is smaller: Uganda or Bolivia":"Bolivia has the smaller population (11353142 against 42723139).","which has the smaller population, Kiribati or Vanuatu":"Kiribati has the smaller population (115847 against 292680).","between Guadeloupe and Iran, which has the lesser population":"Guadeloupe has the smaller population (395700 against 81800269).","between East Timor and Cambodia, which has the lesser population":"East Timor has the smaller population (1267972 against 16249798).","whose population is smaller: Cook Islands or Latvia":"Cook Islands has the smaller population (17379 against 1927174).","whose population is smaller: Somalia or Algeria":"Somalia has the smaller population (15008154 against 42228429).","which has the smaller population, Cameroon or Luxembourg":"Luxembourg has the smaller population (607950 against 25216237).","between Romania and Cayman Islands, which has the lesser population":"Cayman Islands has the smaller population (64174 against 19466145).","whose population is smaller: Mayotte or Lithuania":"Mayotte has the smaller population (270372 against 2801543).","which has the smaller population, Germany or Mali":"Mali has the smaller population (19077690 against 82905782).","between Poland and Laos, which has the lesser population":"Laos has the smaller population (7061507 against 37974750).","which has the smaller population, South Georgia and the South Sandwich Islands or South Korea":"South Georgia and the South Sandwich Islands has the smaller population (30 against 51606633).","whose population is smaller: Mauritania or Seychelles":"Seychelles has the smaller population (96762 against 4403319).","between Iraq and Armenia, which has the lesser population":"Armenia has the smaller population (2951776 against 38433600).","between Mali and Cocos (Keeling) Islands, which has the lesser population":"Cocos (Keeling) Islands has the smaller population (596 against 19077690).","between Luxembourg and Georgia, which has the lesser population":"Luxembourg has the smaller population (607950 against 3726549).","which has the smaller population, Cuba or Botswana":"Botswana has the smaller population (2254126 against 11338138).","between Bouvet Island and Madagascar, which has the lesser population":"Bouvet Island has the smaller population (0 against 26262368).","between Mauritius and Montenegro, which has the lesser population":"Montenegro has the smaller population (631219 against 1265303).","between Botswana and Somalia, which has the lesser population":"Botswana has the smaller population (2254126 against 15008154).","which has the smaller population, Northern Ireland or El Salvador":"Northern Ireland has the smaller population (1885400 against 6420744).","which has the smaller population, Holy See (Vatican City State) or Romania":"Holy See (Vatican City State) has the smaller population (825 against 19466145).","between Bahamas and Comoros, which has the lesser population":"Bahamas has the smaller population (385640 against 832322).","whose population is smaller: Malta or Uruguay":"Malta has the smaller population (484630 against 3449299).","whose population is smaller: Paraguay or Sri Lanka":"Paraguay has the smaller population (6956071 against 21670000).","which has the smaller population, Bangladesh or Samoa":"Samoa has the smaller population (196130 against 161356039).","which has the smaller population, Sri Lanka or Bouvet Island":"Bouvet Island has the smaller population (0 against 21670000).","between South Korea and Japan, which has the lesser population":"South Korea has the smaller population (51606633 against 126529100).","between Ivory Coast and Guyana, which has the lesser population":"Guyana has the smaller population (779004 against 25069229).","which has the smaller population, Sudan or Bulgaria":"Bulgaria has the smaller population (7025037 against 41801533).","whose population is smaller: San Marino or Bahrain":"San Marino has the smaller population (33785 against 1569439).","between Bulgaria and Tonga, which has the lesser population":"Tonga has the smaller population (103197 against 7025037).","whose population is smaller: Iran or Bangladesh":"Iran has the smaller population (81800269 against 161356039).","which has the smaller population, Seychelles or Poland":"Seychelles has the smaller population (96762 against 37974750).","which has the smaller population, Martinique or East Timor":"Martinique has the smaller population (376480 against 1267972).","between Oman and Christmas Island, which has the lesser population":"Christmas Island has the smaller population (1402 against 4829483).","whose population is smaller: Japan or French Southern territories":"French Southern territories has the smaller population (0 against 126529100).","which has the smaller population, Saint Pierre and Miquelon or Tajikistan":"Saint Pierre and Miquelon has the smaller population (5888 against 9100837).","between North Korea and Nepal, which has the lesser population":"North Korea has the smaller population (25549819 against 28087871).","which has the smaller population, Tanzania or Micronesia, Federated States of":"Micronesia, Federated States of has the smaller population (112640 against 56318348).","whose population is smaller: Montenegro or South Africa":"Montenegro has the smaller population (631219 against 57779622).","between Djibouti and Saint Lucia, which has the lesser population":"Saint Lucia has the smaller population (181889 against 958920).","between Grenada and Mayotte, which has the lesser population":"Grenada has the smaller population (111454 against 270372).","which has the smaller population, South Sudan or Ivory Coast":"South Sudan has the smaller population (10975920 against 25069229).","whose population is smaller: Laos or Cameroon":"Laos has the smaller population (7061507 against 25216237).","whose population is smaller: Armenia or Germany":"Armenia has the smaller population (2951776 against 82905782).","whose population is smaller: Equatorial Guinea or Tanzania":"Equatorial Guinea has the smaller population (1308974 against 56318348).","whose population is smaller: Iceland or Northern Ireland":"Iceland has the smaller population (352721 against 1885400).","whose population is smaller: Virgin Islands, British or Cuba":"Virgin Islands, British has the smaller population (29802 against 11338138).","which has the smaller population, Puerto Rico or Iraq":"Puerto Rico has the smaller population (3195153 against 38433600).","which has the smaller population, South Africa or Bahamas":"Bahamas has the smaller population (385640 against 57779622).","between Peru and Sao Tome and Principe, which has the lesser population":"Sao Tome and Principe has the smaller population (211028 against 31989256).","whose population is smaller: Nepal or Western Sahara":"Western Sahara has the smaller population (652271 against 28087871).","between Samoa and Hong Kong, which has the lesser population":"Samoa has the smaller population (196130 against 7451000).","between Finland and Virgin Islands, British, which has the lesser population":"Virgin Islands, British has the smaller population (29802 against 5515525).","which has the smaller population, Western Sahara or Svalbard and Jan Mayen":"Svalbard and Jan Mayen has the smaller population (2572 against 652271).","which has the smaller population, French Southern territories or New Zealand":"French Southern territories has the smaller population (0 against 4841000).","which has the smaller population, Ireland or Burundi":"Ireland has the smaller population (4867309 against 11175378).","whose population is smaller: Hong Kong or Ireland":"Ireland has the smaller population (4867309 against 7451000).","which has the smaller population, Marshall Islands or Guadeloupe":"Marshall Islands has the smaller population (58413 against 395700).","whose population is smaller: Georgia or Martinique":"Martinique has the smaller population (376480 against 3726549).","which has the smaller population, Myanmar or Monaco":"Monaco has the smaller population (38682 against 53708395).","whose population is smaller: Sao Tome and Principe or Saint Pierre and Miquelon":"Saint Pierre and Miquelon has the smaller population (5888 against 211028).","which has the smaller population, Lithuania or Mauritius":"Mauritius has the smaller population (1265303 against 2801543).","which has the smaller population, Benin or North Korea":"Benin has the smaller population (11485048 against 25549819).","between Austria and Paraguay, which has the lesser population":"Paraguay has the smaller population (6956071 against 8840521).","whose population is smaller: Cocos (Keeling) Islands or Kiribati":"Cocos (Keeling) Islands has the smaller population (596 against 115847).","between Svalbard and Jan Mayen and Equatorial Guinea, which has the lesser population":"Svalbard and Jan Mayen has the smaller population (2572 against 1308974).","whose population is smaller: Christmas Island or Holy See (Vatican City State)":"Holy See (Vatican City State) has the smaller population (825 against 1402).","between Aruba and Mauritania, which has the lesser population":"Aruba has the smaller population (105845 against 4403319).","which has the smaller population, Mozambique or Grenada":"Grenada has the smaller population (111454 against 29495962).","which has the smaller population, Latvia or Austria":"Latvia has the smaller population (1927174 against 8840521).","which has the smaller population, Estonia or Peru":"Estonia has the smaller population (1321977 against 31989256).","whose population is smaller: Cambodia or Gabon":"Gabon has the smaller population (2119275 against 16249798).","which has the smaller population, Bolivia or Finland":"Finland has the smaller population (5515525 against 11353142).","between Morocco and Iceland, which has the lesser population":"Iceland has the smaller population (352721 against 36029138).","between Micronesia, Federated States of and San Marino, which has the lesser population":"San Marino has the smaller population (33785 against 112640).","whose population is smaller: Saint Lucia or The Democratic Republic of Congo":"Saint Lucia has the smaller population (181889 against 84068091).","which has the smaller population, Bahrain or Aruba":"Aruba has the smaller population (105845 against 1569439)."}}},
{"id":"n-e407014d","guard":[["has","population"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"smaller: Comoros or Niger":"Comoros has the smaller population (832322 against 22442948).","smaller: Madagascar or Puerto Rico":"Puerto Rico has the smaller population (3195153 against 26262368).","smaller: Guyana or Estonia":"Guyana has the smaller population (779004 against 1321977).","smaller: Niue or South Georgia and the South Sandwich Islands":"South Georgia and the South Sandwich Islands has the smaller population (30 against 1624).","smaller: Tonga or Marshall Islands":"Marshall Islands has the smaller population (58413 against 103197).","smaller: Haiti or Benin":"Haiti has the smaller population (11123176 against 11485048).","smaller: Bosnia and Herzegovina or Myanmar":"Bosnia and Herzegovina has the smaller population (3323929 against 53708395).","smaller: Saint Kitts and Nevis or Sudan":"Saint Kitts and Nevis has the smaller population (52441 against 41801533).","smaller: Cayman Islands or South Sudan":"Cayman Islands has the smaller population (64174 against 10975920).","smaller: Uganda or Bolivia":"Bolivia has the smaller population (11353142 against 42723139).","smaller: Cook Islands or Latvia":"Cook Islands has the smaller population (17379 against 1927174).","smaller: Somalia or Algeria":"Somalia has the smaller population (15008154 against 42228429).","smaller: Mayotte or Lithuania":"Mayotte has the smaller population (270372 against 2801543).","smaller: Mauritania or Seychelles":"Seychelles has the smaller population (96762 against 4403319).","smaller: Malta or Uruguay":"Malta has the smaller population (484630 against 3449299).","smaller: Paraguay or Sri Lanka":"Paraguay has the smaller population (6956071 against 21670000).","smaller: San Marino or Bahrain":"San Marino has the smaller population (33785 against 1569439).","smaller: Iran or Bangladesh":"Iran has the smaller population (81800269 against 161356039).","smaller: Japan or French Southern territories":"French Southern territories has the smaller population (0 against 126529100).","smaller: Montenegro or South Africa":"Montenegro has the smaller population (631219 against 57779622).","smaller: Laos or Cameroon":"Laos has the smaller population (7061507 against 25216237).","smaller: Armenia or Germany":"Armenia has the smaller population (2951776 against 82905782).","smaller: Equatorial Guinea or Tanzania":"Equatorial Guinea has the smaller population (1308974 against 56318348).","smaller: Iceland or Northern Ireland":"Iceland has the smaller population (352721 against 1885400).","smaller: Virgin Islands, British or Cuba":"Virgin Islands, British has the smaller population (29802 against 11338138).","smaller: Nepal or Western Sahara":"Western Sahara has the smaller population (652271 against 28087871).","smaller: Hong Kong or Ireland":"Ireland has the smaller population (4867309 against 7451000).","smaller: Georgia or Martinique":"Martinique has the smaller population (376480 against 3726549).","smaller: Sao Tome and Principe or Saint Pierre and Miquelon":"Saint Pierre and Miquelon has the smaller population (5888 against 211028).","smaller: Cocos (Keeling) Islands or Kiribati":"Cocos (Keeling) Islands has the smaller population (596 against 115847).","smaller: Christmas Island or Holy See (Vatican City State)":"Holy See (Vatican City State) has the smaller population (825 against 1402).","smaller: Cambodia or Gabon":"Gabon has the smaller population (2119275 against 16249798).","smaller: Saint Lucia or The Democratic Republic of Congo":"Saint Lucia has the smaller population (181889 against 84068091)."}}},
{"id":"n-12c981f9","guard":[["hasAny",["aruba","bahamas","bolivia","botswana","bulgaria","delete","gabon","grenada","hong","luxembourg","mali","mauritania","mauritius","monaco","morocco","oman","qatar","remove","samoa","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-8dbaa3af","guard":[["hasAny",["africa","algeria","armenia","bahrain","bangladesh","benin","cameroon","cayman","cocos","comoros","congo","cook","element","equatorial","estonia","iceland","item number","lanka","lithuania","malta","nth","position"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":1}]],"mem":null},
{"id":"n-fd05904f","guard":[["hasAny",["algeria","armenia","bahrain","benin","bolivia","cayman","christmas","cocos","comoros","cook","equatorial","french","longest","longest one","longest word","madagascar","marshall","martinique","nepal"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["aggregate.longest",["sense.list"]]],"mem":null},
{"id":"n-165fa07d","guard":[["hasAny",["algeria","armenia","bahrain","benin","bolivia","cayman","christmas","cocos","comoros","cook","equatorial","french","longest","longest one","longest word","lower case","lowercase","madagascar","marshall","martinique","nepal","small letters"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.lower",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-6c2002df","guard":[["hasAny",["algeria","armenia","bahrain","benin","bolivia","capitalise","capitalize","capitalize each word","cayman","christmas","cocos","comoros","cook","equatorial","french","longest","longest one","longest word","madagascar","marshall","martinique","nepal","title case"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.title",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-76b5d454","guard":[["hasAny",["algeria","all caps","armenia","bahrain","benin","bolivia","capital letters","capitals","cayman","christmas","cocos","comoros","cook","equatorial","french","longest","longest one","longest word","madagascar","marshall","martinique","nepal","upper case","uppercase"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.upper",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-f475e170","guard":[["hasAny",["algeria","armenia","bahrain","benin","bolivia","cayman","christmas","cocos","comoros","cook","equatorial","french","invert case","longest","longest one","longest word","madagascar","marshall","martinique","nepal","swap case","toggle case"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-815c253d","guard":[["hasAny",["africa","algeria","aruba","bangladesh","bolivia","botswana","bulgaria","cameroon","congo","delete","djibouti","germany","grenada","lithuania","monaco","niger","remove","strip out","without"]],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.after",{"lit":"smaller"}]]],"mem":null},
{"id":"n-dd3b6be6","guard":[["hasAny",["aruba","bahamas","botswana","bulgaria","delete","djibouti","finland","grenada","luxembourg","mali","mauritius","monaco","morocco","oman","qatar","remove","samoa","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-ecabd6ea","guard":[["hasAny",["africa","algeria","armenia","bangladesh","benin","cambodia","cameroon","congo","estonia","ireland","lanka","lithuania","malta","shortest","shortest one","shortest word"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["aggregate.shortest",["sense.list"]]],"mem":null},
{"id":"n-00804c96","guard":[["hasAny",["a to z","alphabetical","alphabetize","armenia","bahrain","bolivia","cayman","christmas","cocos","comoros","cook","equatorial","french","longest","longest one","longest word","madagascar","marshall","martinique","nepal"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["aggregate.longest",["transform.sortStrs",["sense.list"]]]],"mem":null},
{"id":"n-27396592","guard":[["hasAny",["africa","algeria","armenia","bangladesh","benin","cambodia","cameroon","congo","estonia","ireland","lanka","lithuania","lower case","lowercase","malta","shortest","shortest one","shortest word","small letters"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.lower",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-592dc69c","guard":[["hasAny",["africa","algeria","armenia","bangladesh","benin","cambodia","cameroon","congo","estonia","invert case","ireland","lanka","lithuania","malta","shortest","shortest one","shortest word","swap case","toggle case"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-685c8f04","guard":[["hasAny",["backwards","bahrain","bolivia","cayman","christmas","cocos","comoros","cook","equatorial","french","longest","longest one","longest word","madagascar","marshall","martinique","mauritania","nepal","reverse","reverse order","reversed"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["sense.list"]]]],"mem":null},
{"id":"n-a833ae09","guard":[["hasAny",["africa","algeria","all caps","armenia","bangladesh","benin","cambodia","cameroon","capital letters","capitals","congo","estonia","ireland","lanka","lithuania","malta","shortest","shortest one","shortest word","upper case","uppercase"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.upper",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-a2ba3262","guard":[["hasAny",["africa","algeria","bahrain","bangladesh","bolivia","cameroon","congo","cuba","delete","gabon","germany","lithuania","mozambique","myanmar","niger","remove","strip out","without"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"has"}]]],"mem":null},
{"id":"n-0657a78f","guard":[["hasAny",["africa","algeria","armenia","bangladesh","benin","cambodia","cameroon","each word","estonia","ireland","lanka","lithuania","malta","shortest","shortest one","shortest word","split into words"]],["has","smaller"],["has","population"]],"pyramid":["render.lines",["transform.words",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-7390ada2","guard":[["hasAny",["africa","algeria","armenia","bangladesh","benin","cambodia","cameroon","each word","estonia","ireland","lanka","lithuania","malta","shortest","shortest one","shortest word","split into words"]],["has","smaller"],["has","population"]],"pyramid":["render.list",["transform.words",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-a30c2fb7","guard":[["hasAny",["africa","algeria","armenia","bangladesh","benin","cambodia","cameroon","estonia","ireland","lanka","lithuania","malta","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.reverseWords",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-bb37e397","guard":[["hasAny",["africa","algeria","armenia","bangladesh","benin","cambodia","cameroon","each word","estonia","ireland","lanka","lithuania","malta","shortest","shortest one","shortest word","split into words"]],["has","smaller"],["has","population"]],"pyramid":["render.and",["transform.words",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-6342ab3e","guard":[["hasAny",["a to z","africa","alphabetical","alphabetize","armenia","bangladesh","cambodia","cameroon","congo","estonia","ireland","lanka","lithuania","malta","shortest","shortest one","shortest word"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["sense.list"]]]],"mem":null},
{"id":"n-b6be83ea","guard":[["hasAny",["africa","backwards","bangladesh","cambodia","cameroon","congo","estonia","ireland","lanka","lithuania","malta","mauritania","reverse","reverse order","reversed","shortest","shortest one","shortest word"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.list"]]]],"mem":null},
{"id":"n-54455e01","guard":[["hasAny",["africa","algeria","bolivia","each word","germany","longest","longest one","longest word","mozambique","niger","split into words"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-86240818","guard":[["hasAny",["bolivia","cambodia","christmas","french","from position","georgia","hong","items from to","madagascar","marshall","mauritania","nepal","slice"]],["has","population"],["has","smaller"]],"pyramid":["render.and",["transform.sliceStrs",["sense.list"],{"lit":2},{"lit":3}]],"mem":null},
{"id":"n-9d38120c","guard":[["hasAny",["bolivia","cambodia","christmas","french","from position","georgia","hong","items from to","madagascar","marshall","mauritania","nepal","slice"]],["has","population"],["has","smaller"]],"pyramid":["render.and",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-cade6d0a","guard":[["hasAny",["bolivia","cambodia","christmas","element","french","hong","item number","madagascar","marshall","martinique","mauritania","nepal","nth","position"]],["has","population"],["has","smaller"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":2}]],"mem":null},
{"id":"n-5f99f6b4","guard":[["hasAny",["bolivia","cambodia","christmas","french","from position","hong","items from to","madagascar","marshall","martinique","mauritania","nepal","slice"]],["has","population"],["has","smaller"]],"pyramid":["render.list",["transform.sliceStrs",["sense.list"],{"lit":2},{"lit":3}]],"mem":null},
{"id":"n-6456d85f","guard":[["hasAny",["bolivia","cambodia","christmas","french","from position","hong","items from to","madagascar","marshall","martinique","mauritania","nepal","slice"]],["has","population"],["has","smaller"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-760fd731","guard":[["hasAny",["bolivia","cambodia","christmas","french","from position","hong","items from to","madagascar","marshall","martinique","mauritania","nepal","slice"]],["has","population"],["has","smaller"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.list"],{"lit":2},{"lit":3}]],"mem":null},
{"id":"n-b3dd60eb","guard":[["hasAny",["bolivia","cambodia","christmas","french","from position","hong","items from to","madagascar","marshall","martinique","mauritania","nepal","slice"]],["has","population"],["has","smaller"]],"pyramid":["render.list",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-cf49bcc7","guard":[["hasAny",["algeria","bangladesh","bolivia","cameroon","element","gabon","germany","item number","lithuania","mozambique","niger","nth","position"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-1e0a617d","guard":[["hasAny",["algeria","bangladesh","bolivia","cameroon","from position","gabon","germany","items from to","lithuania","mozambique","niger","slice"]],["has","smaller"],["has","population"]],"pyramid":["render.and",["transform.sliceStrs",["sense.content"],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-9c2ff323","guard":[["hasAny",["algeria","bangladesh","bolivia","cameroon","from position","gabon","germany","items from to","lithuania","mozambique","niger","slice"]],["has","smaller"],["has","population"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-f8b00cee","guard":[["hasAny",["algeria","bangladesh","bolivia","cameroon","from position","gabon","germany","items from to","lithuania","mozambique","niger","slice"]],["has","smaller"],["has","population"]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-23757a69","guard":[["hasAny",["bolivia","from position","gabon","items from to","mali","mozambique","qatar","slice"]],["has","smaller"],["has","population"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],["sense.wordCount"],{"lit":10}]],"mem":null},
{"id":"n-1f6f465b","guard":[["hasAny",["algeria","armenia","benin","bolivia","comoros","each word","longest","longest one","longest word","martinique","split into words"]],["has","smaller"],["has","population"]],"pyramid":["render.list",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-3b0cd711","guard":[["hasAny",["a to z","alphabetical","alphabetize","longest","longest one","longest word","luxembourg","martinique","montenegro"]],["not",["has","of"]],["has","population"],["not",["has","american"]],["not",["has","greater"]],["not",["has","larger"]]],"pyramid":["render.str",["aggregate.longest",["transform.sortStrs",["sense.words"]]]],"mem":null},
{"id":"n-860f5c2e","guard":[["hasAny",["algeria","armenia","benin","bolivia","comoros","each word","longest","longest one","longest word","martinique","split into words"]],["has","smaller"],["has","population"]],"pyramid":["render.lines",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-a21aaaf0","guard":[["hasAny",["algeria","armenia","benin","bolivia","comoros","longest","longest one","longest word","martinique","reverse the words","reverse word order","words backwards"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.reverseWords",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-c6a7dfb8","guard":[["hasAny",["algeria","armenia","benin","bolivia","comoros","each word","longest","longest one","longest word","martinique","split into words"]],["has","smaller"],["has","population"]],"pyramid":["render.and",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-4c750e44","guard":[["hasAny",["all caps","bolivia","capital letters","capitals","gabon","mozambique","upper case","uppercase"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-bfc565f1","guard":[["hasAny",["bolivia","gabon","invert case","mozambique","swap case","toggle case"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c515e8b5","guard":[["hasAny",["bolivia","each word","gabon","mozambique","split into words"]],["has","smaller"],["has","population"]],"pyramid":["render.list",["transform.words",["sense.lastWord"]]],"mem":null},
{"id":"n-c5ed3cb8","guard":[["hasAny",["bolivia","capitalise","capitalize","capitalize each word","gabon","mozambique","title case"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d021f6f6","guard":[["hasAny",["bolivia","gabon","lower case","lowercase","mozambique","small letters"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-017de82e","guard":[["hasAny",["bolivia","delete","gabon","mozambique","remove","strip out","without"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Aruba"}]],"mem":null},
{"id":"n-31cb326d","guard":[["hasAny",["bolivia","cambodia","delete","hong","martinique","mauritania","remove","strip out","without"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-3694e6e5","guard":[["hasAny",["bolivia","delete","gabon","mozambique","remove","strip out","without"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Bahamas"}]],"mem":null},
{"id":"n-60d58703","guard":[["hasAny",["bolivia","gabon","mozambique","normalise","normalize","simplify the text"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d7aceb70","guard":[["hasAny",["bolivia","delete","gabon","mozambique","remove","strip out","without"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Botswana"}]],"mem":null},
{"id":"n-ea982840","guard":[["hasAny",["bolivia","capitalise","capitalize","capitalize each word","gabon","invert case","mozambique","swap case","title case","toggle case"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-07e80d97","guard":[["hasAny",["bolivia","from position","gabon","items from to","mozambique","slice"]],["has","smaller"],["has","population"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],["sense.wordCount"],{"lit":12}]],"mem":null},
{"id":"n-3285119d","guard":[["hasAny",["element","item number","martinique","nth","position","seychelles"]],["has","smaller"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a1bb8ca9","guard":[["hasAny",["backwards","longest","longest one","longest word","martinique","reverse","reverse order","reversed","seychelles"]],["has","smaller"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-cb232dfa","guard":[["hasAny",["bolivia","delete","gabon","remove","strip out","without"]],["has","smaller"],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Grenada"}]],"mem":null},
{"id":"n-0e8d9005","guard":[["hasAny",["cocos","separate by","split","split by"]],["has","population"],["not",["has","larger"]]],"pyramid":["render.list",["transform.split",{"lit":"Cocos (Keeling) Islands"},["sense.subject"]]],"mem":null},
{"id":"n-0f805089","guard":[["hasAny",["cocos","delete","remove","strip out","without"]],["has","population"],["not",["has","larger"]]],"pyramid":["render.str",["transform.remove",{"lit":"Cocos (Keeling) Islands"},["sense.subject"]]],"mem":null},
{"id":"n-1c90d8b1","guard":[["hasAny",["cocos","separate by","split","split by"]],["has","population"],["not",["has","larger"]]],"pyramid":["render.lines",["transform.split",{"lit":"Cocos (Keeling) Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-2373e284","guard":[["hasAny",["cocos","separate by","split","split by"]],["has","population"],["not",["has","larger"]]],"pyramid":["render.and",["transform.split",{"lit":"Cocos (Keeling) Islands"},["sense.subject"]]],"mem":null},
{"id":"n-345b2afc","guard":[["hasAny",["cook","delete","remove","strip out","without"]],["has","population"],["not",["has","of"]],["not",["has","compare"]]],"pyramid":["render.str",["transform.remove",{"lit":"Cook Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-354ab03f","guard":[["hasAny",["cocos","separate by","split","split by"]],["has","population"],["not",["has","larger"]]],"pyramid":["render.lines",["transform.split",{"lit":"Cocos (Keeling) Islands"},["sense.subject"]]],"mem":null},
{"id":"n-362e177e","guard":[["hasAny",["cayman","delete","remove","strip out","without"]],["has","population"],["not",["has","compare"]],["not",["has","give"]]],"pyramid":["render.str",["transform.remove",{"lit":"Cayman Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-41a7bc40","guard":[["hasAny",["bosnia","first n","kitts","take","top"]],["has","smaller"],["has","population"]],"pyramid":["render.and",["transform.takeStrs",["sense.list"],{"lit":2}]],"mem":null},
{"id":"n-4f147e7e","guard":[["hasAny",["cayman","delete","remove","strip out","without"]],["has","population"],["not",["has","compare"]],["not",["has","give"]]],"pyramid":["render.str",["transform.remove",{"lit":"Cayman Islands"},["sense.subject"]]],"mem":null},
{"id":"n-62570619","guard":[["hasAny",["cayman","separate by","split","split by"]],["has","population"],["not",["has","compare"]],["not",["has","give"]]],"pyramid":["render.lines",["transform.split",{"lit":"Cayman Islands"},["sense.subject"]]],"mem":null},
{"id":"n-68735cbf","guard":[["hasAny",["cook","separate by","split","split by"]],["has","population"],["not",["has","of"]],["not",["has","compare"]]],"pyramid":["render.lines",["transform.split",{"lit":"Cook Islands"},["sense.subject"]]],"mem":null},
{"id":"n-86be95f4","guard":[["hasAny",["cayman","separate by","split","split by"]],["has","population"],["not",["has","compare"]],["not",["has","give"]]],"pyramid":["render.and",["transform.split",{"lit":"Cayman Islands"},["sense.subject"]]],"mem":null},
{"id":"n-891dade1","guard":[["hasAny",["cook","separate by","split","split by"]],["has","population"],["not",["has","of"]],["not",["has","compare"]]],"pyramid":["render.lines",["transform.split",{"lit":"Cook Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-97aeddb0","guard":[["hasAny",["cayman","separate by","split","split by"]],["has","population"],["not",["has","compare"]],["not",["has","give"]]],"pyramid":["render.and",["transform.split",{"lit":"Cayman Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-99e1a2ea","guard":[["hasAny",["cocos","delete","remove","strip out","without"]],["has","population"],["not",["has","larger"]]],"pyramid":["render.str",["transform.remove",{"lit":"Cocos (Keeling) Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-a61d12d0","guard":[["hasAny",["cayman","separate by","split","split by"]],["has","population"],["not",["has","compare"]],["not",["has","give"]]],"pyramid":["render.list",["transform.split",{"lit":"Cayman Islands"},["sense.subject"]]],"mem":null},
{"id":"n-b524d04d","guard":[["hasAny",["cook","separate by","split","split by"]],["has","population"],["not",["has","of"]],["not",["has","compare"]]],"pyramid":["render.list",["transform.split",{"lit":"Cook Islands"},["sense.subject"]]],"mem":null},
{"id":"n-b5959444","guard":[["hasAny",["cook","separate by","split","split by"]],["has","population"],["not",["has","of"]],["not",["has","compare"]]],"pyramid":["render.list",["transform.split",{"lit":"Cook Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-bb31207d","guard":[["hasAny",["cocos","separate by","split","split by"]],["has","population"],["not",["has","larger"]]],"pyramid":["render.list",["transform.split",{"lit":"Cocos (Keeling) Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-c445a30e","guard":[["hasAny",["cook","separate by","split","split by"]],["has","population"],["not",["has","of"]],["not",["has","compare"]]],"pyramid":["render.and",["transform.split",{"lit":"Cook Islands"},["sense.subject"]]],"mem":null},
{"id":"n-d32b5cde","guard":[["hasAny",["cayman","separate by","split","split by"]],["has","population"],["not",["has","compare"]],["not",["has","give"]]],"pyramid":["render.lines",["transform.split",{"lit":"Cayman Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-d70e3490","guard":[["hasAny",["cocos","separate by","split","split by"]],["has","population"],["not",["has","larger"]]],"pyramid":["render.and",["transform.split",{"lit":"Cocos (Keeling) Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-e25e1008","guard":[["hasAny",["cook","delete","remove","strip out","without"]],["has","population"],["not",["has","of"]],["not",["has","compare"]]],"pyramid":["render.str",["transform.remove",{"lit":"Cook Islands"},["sense.subject"]]],"mem":null},
{"id":"n-e3b21506","guard":[["hasAny",["cayman","separate by","split","split by"]],["has","population"],["not",["has","compare"]],["not",["has","give"]]],"pyramid":["render.list",["transform.split",{"lit":"Cayman Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-e8078d0b","guard":[["hasAny",["element","guyana","item number","nth","position"]],["not",["has","of"]],["has","population"],["not",["has","compare"]],["not",["has","greater"]],["not",["has","lanka"]]],"pyramid":["render.str",["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ff6b6afb","guard":[["hasAny",["cook","separate by","split","split by"]],["has","population"],["not",["has","of"]],["not",["has","compare"]]],"pyramid":["render.and",["transform.split",{"lit":"Cook Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-01458e78","guard":[["hasAny",["has","oman"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Algeria or Oman":"Oman has the smaller population (4829483 against 42228429)."}}},
{"id":"n-01b247e2","guard":[["hasAny",["africa","montenegro","population","smaller","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Montenegro or South Africa":"Montenegro has the smaller population (631219 against 57779622)."}}},
{"id":"n-03ab077a","guard":[["hasAny",["lanka","paraguay","population","smaller","sri"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Paraguay or Sri Lanka":"Paraguay has the smaller population (6956071 against 21670000)."}}},
{"id":"n-04df7d72","guard":[["hasAny",["estonia","guyana","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Guyana or Estonia":"Guyana has the smaller population (779004 against 1321977)."}}},
{"id":"n-05c4fb6c","guard":[["hasAny",["djibouti","has"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Gabon or Djibouti":"Djibouti has the smaller population (958920 against 2119275)."}}},
{"id":"n-0731afd0","guard":[["hasAny",["bahrain","marino","population","san","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: San Marino or Bahrain":"San Marino has the smaller population (33785 against 1569439)."}}},
{"id":"n-0876116c","guard":[["hasAny",["between","grenada","has","lesser","mayotte","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Grenada and Mayotte, which has the lesser population":"Grenada has the smaller population (111454 against 270372)."}}},
{"id":"n-097210ca","guard":[["hasAny",["burundi","has","ireland","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Ireland or Burundi":"Ireland has the smaller population (4867309 against 11175378)."}}},
{"id":"n-09cef93d","guard":[["hasAny",["grenada","has","mozambique","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Mozambique or Grenada":"Grenada has the smaller population (111454 against 29495962)."}}},
{"id":"n-0a555e70","guard":[["hasAny",["between","has","kitts","lesser","macedonia","nevis","north","population","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between North Macedonia and Saint Kitts and Nevis, which has the lesser population":"Saint Kitts and Nevis has the smaller population (52441 against 2084367)."}}},
{"id":"n-0a9a2b04","guard":[["hasAny",["djibouti","gabon","has","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Gabon or Djibouti":"Djibouti has the smaller population (958920 against 2119275)."}}},
{"id":"n-0bbde257","guard":[["hasAny",["congo","democratic","lucia","population","republic","saint","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Saint Lucia or The Democratic Republic of Congo":"Saint Lucia has the smaller population (181889 against 84068091)."}}},
{"id":"n-0c704166","guard":[["hasAny",["bolivia","finland","has","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Bolivia or Finland":"Finland has the smaller population (5515525 against 11353142)."}}},
{"id":"n-0da27402","guard":[["hasAny",["nepal","population","sahara","smaller","western"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Nepal or Western Sahara":"Western Sahara has the smaller population (652271 against 28087871)."}}},
{"id":"n-0ea0ce5b","guard":[["hasAny",["has","lithuania","mauritius","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Lithuania or Mauritius":"Mauritius has the smaller population (1265303 against 2801543)."}}},
{"id":"n-10200a93","guard":[["hasAny",["french","japan","population","smaller","southern","territories"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Japan or French Southern territories":"French Southern territories has the smaller population (0 against 126529100)."}}},
{"id":"n-104f46a4","guard":[["has","paraguay"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Paraguay or Sri Lanka":"Paraguay has the smaller population (6956071 against 21670000)."}}},
{"id":"n-1433c654","guard":[["hasAny",["between","cocos","has","islands","keeling","lesser","mali","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Mali and Cocos (Keeling) Islands, which has the lesser population":"Cocos (Keeling) Islands has the smaller population (596 against 19077690)."}}},
{"id":"n-156d3f0e","guard":[["hasAny",["has","miquelon","pierre","population","saint","smaller","tajikistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Saint Pierre and Miquelon or Tajikistan":"Saint Pierre and Miquelon has the smaller population (5888 against 9100837)."}}},
{"id":"n-15b663f4","guard":[["hasAny",["austria","has","latvia","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Latvia or Austria":"Latvia has the smaller population (1927174 against 8840521)."}}},
{"id":"n-16805c78","guard":[["hasAny",["georgia","luxembourg"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Luxembourg and Georgia, which has the lesser population":"Luxembourg has the smaller population (607950 against 3726549)."}}},
{"id":"n-17a3d2ca","guard":[["hasAny",["between","haiti","has","lesser","population","tajikistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Tajikistan and Haiti, which has the lesser population":"Tajikistan has the smaller population (9100837 against 11123176)."}}},
{"id":"n-1aa3af9c","guard":[["hasAny",["between","has","lesser","malta","monaco","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Monaco and Malta, which has the lesser population":"Monaco has the smaller population (38682 against 484630)."}}},
{"id":"n-1b2e9fa4","guard":[["hasAny",["comoros","niger","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Comoros or Niger":"Comoros has the smaller population (832322 against 22442948)."}}},
{"id":"n-1ba36adb","guard":[["hasAny",["british","cuba","islands","population","smaller","virgin"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Virgin Islands, British or Cuba":"Virgin Islands, British has the smaller population (29802 against 11338138)."}}},
{"id":"n-1baa4a9d","guard":[["hasAny",["hong","ireland","kong","population","smaller"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Hong Kong or Ireland":"Ireland has the smaller population (4867309 against 7451000)."}}},
{"id":"n-200bd40b","guard":[["hasAny",["between","has","lesser","mauritius","montenegro","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Mauritius and Montenegro, which has the lesser population":"Montenegro has the smaller population (631219 against 1265303)."}}},
{"id":"n-21431bee","guard":[["hasAny",["has","monaco","myanmar","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Myanmar or Monaco":"Monaco has the smaller population (38682 against 53708395)."}}},
{"id":"n-232ede67","guard":[["hasAny",["between","equatorial","guinea","has","jan","lesser","mayen","population","svalbard"]],["has","equatorial"],["has","population"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Svalbard and Jan Mayen and Equatorial Guinea, which has the lesser population":"Svalbard and Jan Mayen has the smaller population (2572 against 1308974)."}}},
{"id":"n-25dd76f4","guard":[["hasAny",["botswana","somalia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Botswana and Somalia, which has the lesser population":"Botswana has the smaller population (2254126 against 15008154)."}}},
{"id":"n-275f8276","guard":[["hasAny",["british","finland","virgin"]],["has","finland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Finland and Virgin Islands, British, which has the lesser population":"Virgin Islands, British has the smaller population (29802 against 5515525)."}}},
{"id":"n-2a34332b","guard":[["hasAny",["macedonia","uruguay"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Uruguay or North Macedonia":"North Macedonia has the smaller population (2084367 against 3449299)."}}},
{"id":"n-2ada39a5","guard":[["hasAny",["bulgaria","tonga"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Bulgaria and Tonga, which has the lesser population":"Tonga has the smaller population (103197 against 7025037)."}}},
{"id":"n-33854516","guard":[["hasAny",["grenada","mayotte"]],["has","mayotte"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Grenada and Mayotte, which has the lesser population":"Grenada has the smaller population (111454 against 270372)."}}},
{"id":"n-341bc480","guard":[["hasAny",["has","qatar"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Niger or Qatar":"Qatar has the smaller population (2781677 against 22442948)."}}},
{"id":"n-34d9fdf1","guard":[["hasAny",["has","kiribati","population","smaller","vanuatu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Kiribati or Vanuatu":"Kiribati has the smaller population (115847 against 292680)."}}},
{"id":"n-36c9e603","guard":[["hasAny",["finland","has"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Bolivia or Finland":"Finland has the smaller population (5515525 against 11353142)."}}},
{"id":"n-39d46506","guard":[["hasAny",["between","has","laos","lesser","poland","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Poland and Laos, which has the lesser population":"Laos has the smaller population (7061507 against 37974750)."}}},
{"id":"n-3c4bed7c","guard":[["has","comoros"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Comoros or Niger":"Comoros has the smaller population (832322 against 22442948)."}}},
{"id":"n-3cf30771","guard":[["hasAny",["benin","haiti","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Haiti or Benin":"Haiti has the smaller population (11123176 against 11485048)."}}},
{"id":"n-3d38d52f","guard":[["has","armenia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Armenia or Germany":"Armenia has the smaller population (2951776 against 82905782)."}}},
{"id":"n-3dbe32b9","guard":[["hasAny",["madagascar","population","puerto","rico","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Madagascar or Puerto Rico":"Puerto Rico has the smaller population (3195153 against 26262368)."}}},
{"id":"n-3ef1fd7a","guard":[["hasAny",["armenia","between","has","iraq","lesser","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Iraq and Armenia, which has the lesser population":"Armenia has the smaller population (2951776 against 38433600)."}}},
{"id":"n-3f99c1ed","guard":[["hasAny",["cameroon","laos","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Laos or Cameroon":"Laos has the smaller population (7061507 against 25216237)."}}},
{"id":"n-3fb95fbb","guard":[["hasAny",["has","niger","population","qatar","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Niger or Qatar":"Qatar has the smaller population (2781677 against 22442948)."}}},
{"id":"n-3fef0962","guard":[["hasAny",["benin","korea"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Benin or North Korea":"Benin has the smaller population (11485048 against 25549819)."}}},
{"id":"n-414742f4","guard":[["hasAny",["has","romania"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Holy See (Vatican City State) or Romania":"Holy See (Vatican City State) has the smaller population (825 against 19466145)."}}},
{"id":"n-419fcde8","guard":[["hasAny",["between","guadeloupe","has","iran","lesser","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Guadeloupe and Iran, which has the lesser population":"Guadeloupe has the smaller population (395700 against 81800269)."}}},
{"id":"n-45bef3dd","guard":[["has","montenegro"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Montenegro or South Africa":"Montenegro has the smaller population (631219 against 57779622)."}}},
{"id":"n-4723217e","guard":[["hasAny",["coast","has","ivory","population","smaller","south","sudan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, South Sudan or Ivory Coast":"South Sudan has the smaller population (10975920 against 25069229)."}}},
{"id":"n-4941ad43","guard":[["hasAny",["bosnia","herzegovina","myanmar","population","smaller"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Bosnia and Herzegovina or Myanmar":"Bosnia and Herzegovina has the smaller population (3323929 against 53708395)."}}},
{"id":"n-4962c499","guard":[["hasAny",["has","luxembourg"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Cameroon or Luxembourg":"Luxembourg has the smaller population (607950 against 25216237)."}}},
{"id":"n-49d65507","guard":[["hasAny",["japan","south"]],["has","japan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between South Korea and Japan, which has the lesser population":"South Korea has the smaller population (51606633 against 126529100)."}}},
{"id":"n-4a02c26f","guard":[["hasAny",["nepal","north"]],["has","nepal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between North Korea and Nepal, which has the lesser population":"North Korea has the smaller population (25549819 against 28087871)."}}},
{"id":"n-4af48567","guard":[["hasAny",["french","has","new","population","smaller","southern","territories","zealand"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, French Southern territories or New Zealand":"French Southern territories has the smaller population (0 against 4841000)."}}},
{"id":"n-4b21eb0c","guard":[["hasAny",["has","macedonia","north","population","smaller","uruguay"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Uruguay or North Macedonia":"North Macedonia has the smaller population (2084367 against 3449299)."}}},
{"id":"n-4b7e65f2","guard":[["hasAny",["aruba","between","has","lesser","mauritania","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Aruba and Mauritania, which has the lesser population":"Aruba has the smaller population (105845 against 4403319)."}}},
{"id":"n-4bfca533","guard":[["hasAny",["iceland","morocco"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Morocco and Iceland, which has the lesser population":"Iceland has the smaller population (352721 against 36029138)."}}},
{"id":"n-4c7a0086","guard":[["hasAny",["el","has","ireland","northern","population","salvador","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Northern Ireland or El Salvador":"Northern Ireland has the smaller population (1885400 against 6420744)."}}},
{"id":"n-4d1be9bc","guard":[["hasAny",["equatorial","guinea","population","smaller","tanzania"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Equatorial Guinea or Tanzania":"Equatorial Guinea has the smaller population (1308974 against 56318348)."}}},
{"id":"n-4d29ed2a","guard":[["hasAny",["austria","has","latvia","population","smaller"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Latvia or Austria":"Latvia has the smaller population (1927174 against 8840521)."}}},
{"id":"n-4e41e816","guard":[["hasAny",["has","poland","population","seychelles","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Seychelles or Poland":"Seychelles has the smaller population (96762 against 37974750)."}}},
{"id":"n-4f0acea6","guard":[["hasAny",["between","has","hong","kong","lesser","population","samoa"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Samoa and Hong Kong, which has the lesser population":"Samoa has the smaller population (196130 against 7451000)."}}},
{"id":"n-4f2cf485","guard":[["has","iceland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Iceland or Northern Ireland":"Iceland has the smaller population (352721 against 1885400)."}}},
{"id":"n-4f7e88b0","guard":[["hasAny",["bouvet","has","island"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Sri Lanka or Bouvet Island":"Bouvet Island has the smaller population (0 against 21670000)."}}},
{"id":"n-539dcbfd","guard":[["hasAny",["georgia","islands","niue","population","sandwich","smaller","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Niue or South Georgia and the South Sandwich Islands":"South Georgia and the South Sandwich Islands has the smaller population (30 against 1624)."}}},
{"id":"n-54a92dc9","guard":[["hasAny",["cayman","islands","population","smaller","south","sudan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Cayman Islands or South Sudan":"Cayman Islands has the smaller population (64174 against 10975920)."}}},
{"id":"n-55552cf9","guard":[["hasAny",["city","has","holy","population","romania","see","smaller","state","vatican"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Holy See (Vatican City State) or Romania":"Holy See (Vatican City State) has the smaller population (825 against 19466145)."}}},
{"id":"n-5816c90b","guard":[["hasAny",["laos","poland"]],["has","laos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Poland and Laos, which has the lesser population":"Laos has the smaller population (7061507 against 37974750)."}}},
{"id":"n-5a2cb97d","guard":[["hasAny",["christmas","island"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Christmas Island or Holy See (Vatican City State)":"Holy See (Vatican City State) has the smaller population (825 against 1402)."}}},
{"id":"n-5aa581c2","guard":[["hasAny",["cook","islands","latvia","population","smaller"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Cook Islands or Latvia":"Cook Islands has the smaller population (17379 against 1927174)."}}},
{"id":"n-5acbca9e","guard":[["hasAny",["burundi","cook"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Burundi and Cook Islands, which has the lesser population":"Cook Islands has the smaller population (17379 against 11175378)."}}},
{"id":"n-5d5b14ce","guard":[["has","madagascar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Madagascar or Puerto Rico":"Puerto Rico has the smaller population (3195153 against 26262368)."}}},
{"id":"n-5db35f6f","guard":[["hasAny",["bahamas","has"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, South Africa or Bahamas":"Bahamas has the smaller population (385640 against 57779622)."}}},
{"id":"n-5ed557ac","guard":[["hasAny",["has","samoa"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Bangladesh or Samoa":"Samoa has the smaller population (196130 against 161356039)."}}},
{"id":"n-604baa28","guard":[["hasAny",["malta","population","smaller","uruguay"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Malta or Uruguay":"Malta has the smaller population (484630 against 3449299)."}}},
{"id":"n-6078b265","guard":[["hasAny",["between","equatorial","guinea","has","jan","lesser","mayen","population","svalbard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Svalbard and Jan Mayen and Equatorial Guinea, which has the lesser population":"Svalbard and Jan Mayen has the smaller population (2572 against 1308974)."}}},
{"id":"n-6159b451","guard":[["hasAny",["british","cuba","islands","population","smaller","virgin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Virgin Islands, British or Cuba":"Virgin Islands, British has the smaller population (29802 against 11338138)."}}},
{"id":"n-619e8a36","guard":[["hasAny",["aruba","bahrain","has","population","smaller"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Bahrain or Aruba":"Aruba has the smaller population (105845 against 1569439)."}}},
{"id":"n-66e23d46","guard":[["hasAny",["mauritania","population","seychelles","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Mauritania or Seychelles":"Seychelles has the smaller population (96762 against 4403319)."}}},
{"id":"n-66ec52c2","guard":[["hasAny",["bahamas","comoros"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Bahamas and Comoros, which has the lesser population":"Bahamas has the smaller population (385640 against 832322)."}}},
{"id":"n-68102637","guard":[["hasAny",["bangladesh","has","population","samoa","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Bangladesh or Samoa":"Samoa has the smaller population (196130 against 161356039)."}}},
{"id":"n-6b71dfc4","guard":[["hasAny",["cook","islands","latvia","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Cook Islands or Latvia":"Cook Islands has the smaller population (17379 against 1927174)."}}},
{"id":"n-6bf3d370","guard":[["hasAny",["cayman","romania"]],["has","romania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Romania and Cayman Islands, which has the lesser population":"Cayman Islands has the smaller population (64174 against 19466145)."}}},
{"id":"n-6bf8a5a4","guard":[["hasAny",["has","iraq"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Puerto Rico or Iraq":"Puerto Rico has the smaller population (3195153 against 38433600)."}}},
{"id":"n-6d8180fc","guard":[["hasAny",["armenia","germany","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Armenia or Germany":"Armenia has the smaller population (2951776 against 82905782)."}}},
{"id":"n-6db38a42","guard":[["hasAny",["between","el","has","lesser","niue","population","salvador"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between El Salvador and Niue, which has the lesser population":"Niue has the smaller population (1624 against 6420744)."}}},
{"id":"n-6fc29dba","guard":[["hasAny",["bulgaria","has","population","smaller","sudan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Sudan or Bulgaria":"Bulgaria has the smaller population (7025037 against 41801533)."}}},
{"id":"n-700adb6a","guard":[["hasAny",["between","has","lesser","population","uganda","vanuatu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Vanuatu and Uganda, which has the lesser population":"Vanuatu has the smaller population (292680 against 42723139)."}}},
{"id":"n-71423b2c","guard":[["hasAny",["between","burundi","cook","has","islands","lesser","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Burundi and Cook Islands, which has the lesser population":"Cook Islands has the smaller population (17379 against 11175378)."}}},
{"id":"n-73d577fc","guard":[["hasAny",["between","cambodia","east","has","lesser","population","timor"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between East Timor and Cambodia, which has the lesser population":"East Timor has the smaller population (1267972 against 16249798)."}}},
{"id":"n-750ee23b","guard":[["hasAny",["guadeloupe","iran"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Guadeloupe and Iran, which has the lesser population":"Guadeloupe has the smaller population (395700 against 81800269)."}}},
{"id":"n-77295b1a","guard":[["hasAny",["malta","population","smaller","uruguay"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Malta or Uruguay":"Malta has the smaller population (484630 against 3449299)."}}},
{"id":"n-79717dbf","guard":[["hasAny",["aruba","bahrain","has","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Bahrain or Aruba":"Aruba has the smaller population (105845 against 1569439)."}}},
{"id":"n-7a298e22","guard":[["hasAny",["miquelon","pierre","population","principe","saint","sao","smaller","tome"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Sao Tome and Principe or Saint Pierre and Miquelon":"Saint Pierre and Miquelon has the smaller population (5888 against 211028)."}}},
{"id":"n-7ab284d6","guard":[["hasAny",["between","cayman","has","islands","lesser","population","romania"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Romania and Cayman Islands, which has the lesser population":"Cayman Islands has the smaller population (64174 against 19466145)."}}},
{"id":"n-7ad9bff5","guard":[["hasAny",["iceland","ireland","northern","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Iceland or Northern Ireland":"Iceland has the smaller population (352721 against 1885400)."}}},
{"id":"n-7c6d7750","guard":[["has","tonga"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Tonga or Marshall Islands":"Marshall Islands has the smaller population (58413 against 103197)."}}},
{"id":"n-7ecaf0d8","guard":[["hasAny",["has","new","zealand"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, French Southern territories or New Zealand":"French Southern territories has the smaller population (0 against 4841000)."}}},
{"id":"n-7fda4ec8","guard":[["hasAny",["nepal","population","sahara","smaller","western"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Nepal or Western Sahara":"Western Sahara has the smaller population (652271 against 28087871)."}}},
{"id":"n-80427e2e","guard":[["has","somalia"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Somalia or Algeria":"Somalia has the smaller population (15008154 against 42228429)."}}},
{"id":"n-80dd2c55","guard":[["hasAny",["georgia","has","islands","korea","population","sandwich","smaller","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, South Georgia and the South Sandwich Islands or South Korea":"South Georgia and the South Sandwich Islands has the smaller population (30 against 51606633)."}}},
{"id":"n-82040bce","guard":[["hasAny",["austria","between","has","lesser","paraguay","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Austria and Paraguay, which has the lesser population":"Paraguay has the smaller population (6956071 against 8840521)."}}},
{"id":"n-83c7f5d9","guard":[["hasAny",["between","british","finland","has","islands","lesser","population","virgin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Finland and Virgin Islands, British, which has the lesser population":"Virgin Islands, British has the smaller population (29802 against 5515525)."}}},
{"id":"n-851ce0db","guard":[["hasAny",["between","federated","has","lesser","marino","micronesia","population","san","states"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Micronesia, Federated States of and San Marino, which has the lesser population":"San Marino has the smaller population (33785 against 112640)."}}},
{"id":"n-87722845","guard":[["hasAny",["christmas","city","holy","island","population","see","smaller","state","vatican"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Christmas Island or Holy See (Vatican City State)":"Holy See (Vatican City State) has the smaller population (825 against 1402)."}}},
{"id":"n-87a8c515","guard":[["hasAny",["between","cambodia","east","has","lesser","population","timor"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between East Timor and Cambodia, which has the lesser population":"East Timor has the smaller population (1267972 against 16249798)."}}},
{"id":"n-88da22dd","guard":[["hasAny",["has","jan","mayen","population","sahara","smaller","svalbard","western"]],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Western Sahara or Svalbard and Jan Mayen":"Svalbard and Jan Mayen has the smaller population (2572 against 652271)."}}},
{"id":"n-8966f709","guard":[["hasAny",["bangladesh","iran","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Iran or Bangladesh":"Iran has the smaller population (81800269 against 161356039)."}}},
{"id":"n-8a0a2d69","guard":[["hasAny",["kitts","nevis","population","saint","smaller","sudan"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Saint Kitts and Nevis or Sudan":"Saint Kitts and Nevis has the smaller population (52441 against 41801533)."}}},
{"id":"n-8bbdb327","guard":[["hasAny",["east","has","martinique","population","smaller","timor"]],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Martinique or East Timor":"Martinique has the smaller population (376480 against 1267972)."}}},
{"id":"n-8c0bbf3f","guard":[["hasAny",["algeria","population","smaller","somalia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Somalia or Algeria":"Somalia has the smaller population (15008154 against 42228429)."}}},
{"id":"n-8cb64978","guard":[["hasAny",["aruba","mauritania"]],["has","lesser"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Aruba and Mauritania, which has the lesser population":"Aruba has the smaller population (105845 against 4403319)."}}},
{"id":"n-8d9d2f16","guard":[["hasAny",["has","monaco","myanmar","population","smaller"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Myanmar or Monaco":"Monaco has the smaller population (38682 against 53708395)."}}},
{"id":"n-8e46e9ee","guard":[["hasAny",["between","djibouti","has","lesser","lucia","population","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Djibouti and Saint Lucia, which has the lesser population":"Saint Lucia has the smaller population (181889 against 958920)."}}},
{"id":"n-8efb5274","guard":[["hasAny",["has","korea"]],["has","population"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, South Georgia and the South Sandwich Islands or South Korea":"South Georgia and the South Sandwich Islands has the smaller population (30 against 51606633)."}}},
{"id":"n-90773888","guard":[["hasAny",["cameroon","has","luxembourg","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Cameroon or Luxembourg":"Luxembourg has the smaller population (607950 against 25216237)."}}},
{"id":"n-912f29a7","guard":[["hasAny",["between","el","has","lesser","niue","population","salvador"]],["has","niue"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between El Salvador and Niue, which has the lesser population":"Niue has the smaller population (1624 against 6420744)."}}},
{"id":"n-92a62ace","guard":[["hasAny",["between","bosnia","has","herzegovina","lesser","population","qatar"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Qatar and Bosnia and Herzegovina, which has the lesser population":"Qatar has the smaller population (2781677 against 3323929)."}}},
{"id":"n-93e3e628","guard":[["has","uganda"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Uganda or Bolivia":"Bolivia has the smaller population (11353142 against 42723139)."}}},
{"id":"n-941b7b9e","guard":[["hasAny",["between","federated","has","lesser","marino","micronesia","population","san","states"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Micronesia, Federated States of and San Marino, which has the lesser population":"San Marino has the smaller population (33785 against 112640)."}}},
{"id":"n-9572ac58","guard":[["hasAny",["bahamas","between","comoros","has","lesser","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Bahamas and Comoros, which has the lesser population":"Bahamas has the smaller population (385640 against 832322)."}}},
{"id":"n-95af27ba","guard":[["hasAny",["estonia","has","peru","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Estonia or Peru":"Estonia has the smaller population (1321977 against 31989256)."}}},
{"id":"n-96e6b7b2","guard":[["hasAny",["coast","ivory","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, South Sudan or Ivory Coast":"South Sudan has the smaller population (10975920 against 25069229)."}}},
{"id":"n-984dc4a8","guard":[["hasAny",["between","bosnia","has","herzegovina","lesser","population","qatar"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Qatar and Bosnia and Herzegovina, which has the lesser population":"Qatar has the smaller population (2781677 against 3323929)."}}},
{"id":"n-98d2efe0","guard":[["hasAny",["between","bouvet","has","island","lesser","madagascar","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Bouvet Island and Madagascar, which has the lesser population":"Bouvet Island has the smaller population (0 against 26262368)."}}},
{"id":"n-9b3d1b4a","guard":[["hasAny",["christmas","oman"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Oman and Christmas Island, which has the lesser population":"Christmas Island has the smaller population (1402 against 4829483)."}}},
{"id":"n-9b7cc08a","guard":[["hasAny",["bosnia","herzegovina","myanmar","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Bosnia and Herzegovina or Myanmar":"Bosnia and Herzegovina has the smaller population (3323929 against 53708395)."}}},
{"id":"n-9c07395b","guard":[["hasAny",["between","has","lesser","peru","population","principe","sao","tome"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Peru and Sao Tome and Principe, which has the lesser population":"Sao Tome and Principe has the smaller population (211028 against 31989256)."}}},
{"id":"n-9c2b429b","guard":[["hasAny",["between","has","lesser","peru","population","principe","sao","tome"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Peru and Sao Tome and Principe, which has the lesser population":"Sao Tome and Principe has the smaller population (211028 against 31989256)."}}},
{"id":"n-9cf074a0","guard":[["hasAny",["austria","paraguay"]],["has","austria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Austria and Paraguay, which has the lesser population":"Paraguay has the smaller population (6956071 against 8840521)."}}},
{"id":"n-9dc4eb8d","guard":[["hasAny",["georgia","martinique","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Georgia or Martinique":"Martinique has the smaller population (376480 against 3726549)."}}},
{"id":"n-9f4b0b2e","guard":[["hasAny",["mauritius","montenegro"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Mauritius and Montenegro, which has the lesser population":"Montenegro has the smaller population (631219 against 1265303)."}}},
{"id":"n-9f7a3d3d","guard":[["hasAny",["has","tajikistan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Saint Pierre and Miquelon or Tajikistan":"Saint Pierre and Miquelon has the smaller population (5888 against 9100837)."}}},
{"id":"n-a053a41f","guard":[["hasAny",["cayman","islands","population","smaller","south","sudan"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Cayman Islands or South Sudan":"Cayman Islands has the smaller population (64174 against 10975920)."}}},
{"id":"n-a06aae1d","guard":[["hasAny",["between","djibouti","has","lesser","lucia","population","saint"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Djibouti and Saint Lucia, which has the lesser population":"Saint Lucia has the smaller population (181889 against 958920)."}}},
{"id":"n-a0ead4d2","guard":[["hasAny",["federated","has","micronesia","population","smaller","states","tanzania"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Tanzania or Micronesia, Federated States of":"Micronesia, Federated States of has the smaller population (112640 against 56318348)."}}},
{"id":"n-a0efe8da","guard":[["hasAny",["benin","has","korea","north","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Benin or North Korea":"Benin has the smaller population (11485048 against 25549819)."}}},
{"id":"n-a2e0d0f7","guard":[["hasAny",["cocos","keeling","mali"]],["has","between"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Mali and Cocos (Keeling) Islands, which has the lesser population":"Cocos (Keeling) Islands has the smaller population (596 against 19077690)."}}},
{"id":"n-a3088399","guard":[["has","mayotte"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Mayotte or Lithuania":"Mayotte has the smaller population (270372 against 2801543)."}}},
{"id":"n-a53d0e4f","guard":[["hasAny",["between","has","iceland","lesser","morocco","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Morocco and Iceland, which has the lesser population":"Iceland has the smaller population (352721 against 36029138)."}}},
{"id":"n-a8ace657","guard":[["hasAny",["botswana","cuba","has","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Cuba or Botswana":"Botswana has the smaller population (2254126 against 11338138)."}}},
{"id":"n-a93d6b35","guard":[["hasAny",["between","bulgaria","has","lesser","population","tonga"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Bulgaria and Tonga, which has the lesser population":"Tonga has the smaller population (103197 against 7025037)."}}},
{"id":"n-aa27559b","guard":[["has","guyana"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Guyana or Estonia":"Guyana has the smaller population (779004 against 1321977)."}}},
{"id":"n-aaa0a23b","guard":[["hasAny",["armenia","iraq"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Iraq and Armenia, which has the lesser population":"Armenia has the smaller population (2951776 against 38433600)."}}},
{"id":"n-abe5cf15","guard":[["hasAny",["between","georgia","has","lesser","luxembourg","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Luxembourg and Georgia, which has the lesser population":"Luxembourg has the smaller population (607950 against 3726549)."}}},
{"id":"n-af533499","guard":[["hasAny",["has","iraq","population","puerto","rico","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Puerto Rico or Iraq":"Puerto Rico has the smaller population (3195153 against 38433600)."}}},
{"id":"n-b0071a3b","guard":[["hasAny",["cocos","islands","keeling","kiribati","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Cocos (Keeling) Islands or Kiribati":"Cocos (Keeling) Islands has the smaller population (596 against 115847)."}}},
{"id":"n-b113c5e8","guard":[["hasAny",["federated","has","micronesia","population","smaller","states","tanzania"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Tanzania or Micronesia, Federated States of":"Micronesia, Federated States of has the smaller population (112640 against 56318348)."}}},
{"id":"n-b381644c","guard":[["hasAny",["georgia","martinique","population","smaller"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Georgia or Martinique":"Martinique has the smaller population (376480 against 3726549)."}}},
{"id":"n-b447e7e2","guard":[["hasAny",["between","coast","guyana","has","ivory","lesser","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Ivory Coast and Guyana, which has the lesser population":"Guyana has the smaller population (779004 against 25069229)."}}},
{"id":"n-b62c68cd","guard":[["hasAny",["between","botswana","has","lesser","population","somalia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Botswana and Somalia, which has the lesser population":"Botswana has the smaller population (2254126 against 15008154)."}}},
{"id":"n-b657d93c","guard":[["hasAny",["has","mauritius"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Lithuania or Mauritius":"Mauritius has the smaller population (1265303 against 2801543)."}}},
{"id":"n-b6b40440","guard":[["hasAny",["bolivia","population","smaller","uganda"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Uganda or Bolivia":"Bolivia has the smaller population (11353142 against 42723139)."}}},
{"id":"n-b72d0fa6","guard":[["hasAny",["bouvet","has","island","lanka","population","smaller","sri"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Sri Lanka or Bouvet Island":"Bouvet Island has the smaller population (0 against 21670000)."}}},
{"id":"n-b7520dae","guard":[["hasAny",["between","christmas","has","island","lesser","oman","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Oman and Christmas Island, which has the lesser population":"Christmas Island has the smaller population (1402 against 4829483)."}}},
{"id":"n-b7a6a999","guard":[["hasAny",["malta","monaco"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Monaco and Malta, which has the lesser population":"Monaco has the smaller population (38682 against 484630)."}}},
{"id":"n-b8d15115","guard":[["has","bulgaria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Sudan or Bulgaria":"Bulgaria has the smaller population (7025037 against 41801533)."}}},
{"id":"n-bb03f55d","guard":[["hasAny",["has","peru"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Estonia or Peru":"Estonia has the smaller population (1321977 against 31989256)."}}},
{"id":"n-bb4de0c5","guard":[["hasAny",["between","coast","guyana","has","ivory","lesser","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Ivory Coast and Guyana, which has the lesser population":"Guyana has the smaller population (779004 against 25069229)."}}},
{"id":"n-bc9bf61b","guard":[["has","burundi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Ireland or Burundi":"Ireland has the smaller population (4867309 against 11175378)."}}},
{"id":"n-bdfeeb4c","guard":[["has","iran"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Iran or Bangladesh":"Iran has the smaller population (81800269 against 161356039)."}}},
{"id":"n-be079bf4","guard":[["has","japan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Japan or French Southern territories":"French Southern territories has the smaller population (0 against 126529100)."}}},
{"id":"n-beb5f7dd","guard":[["hasAny",["has","jan","mayen","population","sahara","smaller","svalbard","western"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Western Sahara or Svalbard and Jan Mayen":"Svalbard and Jan Mayen has the smaller population (2572 against 652271)."}}},
{"id":"n-c3c34c2e","guard":[["hasAny",["kitts","nevis","population","saint","smaller","sudan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Saint Kitts and Nevis or Sudan":"Saint Kitts and Nevis has the smaller population (52441 against 41801533)."}}},
{"id":"n-c44454de","guard":[["hasAny",["benin","haiti","population","smaller"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Haiti or Benin":"Haiti has the smaller population (11123176 against 11485048)."}}},
{"id":"n-c7e849f6","guard":[["hasAny",["algeria","has","oman","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Algeria or Oman":"Oman has the smaller population (4829483 against 42228429)."}}},
{"id":"n-c89a7adc","guard":[["hasAny",["grenada","has","mozambique","population","smaller"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Mozambique or Grenada":"Grenada has the smaller population (111454 against 29495962)."}}},
{"id":"n-ca040cd0","guard":[["hasAny",["el","salvador"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Northern Ireland or El Salvador":"Northern Ireland has the smaller population (1885400 against 6420744)."}}},
{"id":"n-cd42bf36","guard":[["hasAny",["hong","ireland","kong","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Hong Kong or Ireland":"Ireland has the smaller population (4867309 against 7451000)."}}},
{"id":"n-cd8d92c3","guard":[["hasAny",["bahrain","marino","population","san","smaller"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: San Marino or Bahrain":"San Marino has the smaller population (33785 against 1569439)."}}},
{"id":"n-cdd492d6","guard":[["hasAny",["has","mali"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Germany or Mali":"Mali has the smaller population (19077690 against 82905782)."}}},
{"id":"n-cedf079b","guard":[["hasAny",["between","has","korea","lesser","nepal","north","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between North Korea and Nepal, which has the lesser population":"North Korea has the smaller population (25549819 against 28087871)."}}},
{"id":"n-d051bbaf","guard":[["hasAny",["has","morocco"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, The Democratic Republic of Congo or Morocco":"Morocco has the smaller population (36029138 against 84068091)."}}},
{"id":"n-d0f5eac7","guard":[["hasAny",["germany","has","mali","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Germany or Mali":"Mali has the smaller population (19077690 against 82905782)."}}},
{"id":"n-d2477150","guard":[["hasAny",["has","poland"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Seychelles or Poland":"Seychelles has the smaller population (96762 against 37974750)."}}},
{"id":"n-d2669da8","guard":[["hasAny",["has","kiribati","population","smaller","vanuatu"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Kiribati or Vanuatu":"Kiribati has the smaller population (115847 against 292680)."}}},
{"id":"n-d33d3f94","guard":[["has","mauritania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Mauritania or Seychelles":"Seychelles has the smaller population (96762 against 4403319)."}}},
{"id":"n-d345ffaf","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mozambique","title case"]],["has","has"]],"pyramid":["render.str",["transform.title",["sense.subject"]]],"mem":null},
{"id":"n-d40f9531","guard":[["hasAny",["congo","democratic","has","morocco","population","republic","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, The Democratic Republic of Congo or Morocco":"Morocco has the smaller population (36029138 against 84068091)."}}},
{"id":"n-d44617ac","guard":[["hasAny",["equatorial","guinea","population","smaller","tanzania"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Equatorial Guinea or Tanzania":"Equatorial Guinea has the smaller population (1308974 against 56318348)."}}},
{"id":"n-d45970bb","guard":[["has","laos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Laos or Cameroon":"Laos has the smaller population (7061507 against 25216237)."}}},
{"id":"n-d9fce8cf","guard":[["hasAny",["invert case","mozambique","swap case","toggle case"]],["has","has"]],"pyramid":["render.str",["transform.swapCase",["sense.subject"]]],"mem":null},
{"id":"n-dc183d7f","guard":[["hasAny",["between","has","hong","kong","lesser","population","samoa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Samoa and Hong Kong, which has the lesser population":"Samoa has the smaller population (196130 against 7451000)."}}},
{"id":"n-dca381df","guard":[["hasAny",["lithuania","mayotte","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Mayotte or Lithuania":"Mayotte has the smaller population (270372 against 2801543)."}}},
{"id":"n-de17108e","guard":[["hasAny",["bouvet","madagascar"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Bouvet Island and Madagascar, which has the lesser population":"Bouvet Island has the smaller population (0 against 26262368)."}}},
{"id":"n-de2bedb9","guard":[["hasAny",["east","has","martinique","population","smaller","timor"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Martinique or East Timor":"Martinique has the smaller population (376480 against 1267972)."}}},
{"id":"n-deff26b6","guard":[["hasAny",["botswana","cuba","has","population","smaller"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Cuba or Botswana":"Botswana has the smaller population (2254126 against 11338138)."}}},
{"id":"n-e4a34d06","guard":[["hasAny",["between","has","japan","korea","lesser","population","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between South Korea and Japan, which has the lesser population":"South Korea has the smaller population (51606633 against 126529100)."}}},
{"id":"n-e6f9b076","guard":[["hasAny",["principe","sao","tome"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Sao Tome and Principe or Saint Pierre and Miquelon":"Saint Pierre and Miquelon has the smaller population (5888 against 211028)."}}},
{"id":"n-e735b68a","guard":[["hasAny",["africa","bahamas","has","population","smaller","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, South Africa or Bahamas":"Bahamas has the smaller population (385640 against 57779622)."}}},
{"id":"n-e9bb529a","guard":[["hasAny",["mozambique","reverse the words","reverse word order","words backwards"]],["has","has"]],"pyramid":["render.str",["transform.reverseWords",["sense.subject"]]],"mem":null},
{"id":"n-ea579ea6","guard":[["hasAny",["cambodia","gabon","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Cambodia or Gabon":"Gabon has the smaller population (2119275 against 16249798)."}}},
{"id":"n-ea7efbd7","guard":[["hasAny",["haiti","tajikistan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Tajikistan and Haiti, which has the lesser population":"Tajikistan has the smaller population (9100837 against 11123176)."}}},
{"id":"n-ee901e91","guard":[["hasAny",["guadeloupe","has"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller population, Marshall Islands or Guadeloupe":"Marshall Islands has the smaller population (58413 against 395700)."}}},
{"id":"n-ef7e39c7","guard":[["hasAny",["lucia","saint"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Saint Lucia or The Democratic Republic of Congo":"Saint Lucia has the smaller population (181889 against 84068091)."}}},
{"id":"n-f0d5fda1","guard":[["hasAny",["between","has","kitts","lesser","macedonia","nevis","north","population","saint"]],["has","north"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between North Macedonia and Saint Kitts and Nevis, which has the lesser population":"Saint Kitts and Nevis has the smaller population (52441 against 2084367)."}}},
{"id":"n-f4e3a170","guard":[["hasAny",["islands","marshall","population","smaller","tonga"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is smaller: Tonga or Marshall Islands":"Marshall Islands has the smaller population (58413 against 103197)."}}},
{"id":"n-f53b5713","guard":[["has","cambodia"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Cambodia or Gabon":"Gabon has the smaller population (2119275 against 16249798)."}}},
{"id":"n-f7d3d6ec","guard":[["has","niue"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Niue or South Georgia and the South Sandwich Islands":"South Georgia and the South Sandwich Islands has the smaller population (30 against 1624)."}}},
{"id":"n-fa46e3e7","guard":[["hasAny",["cocos","islands","keeling","kiribati","population","smaller"]],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is smaller: Cocos (Keeling) Islands or Kiribati":"Cocos (Keeling) Islands has the smaller population (596 against 115847)."}}},
{"id":"n-fddf1ac6","guard":[["hasAny",["uganda","vanuatu"]],["has","vanuatu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Vanuatu and Uganda, which has the lesser population":"Vanuatu has the smaller population (292680 against 42723139)."}}},
{"id":"n-ff7d303a","guard":[["hasAny",["guadeloupe","has","islands","marshall","population","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller population, Marshall Islands or Guadeloupe":"Marshall Islands has the smaller population (58413 against 395700)."}}},
{"id":"n-08503582","guard":[["hasAny",["invert case","mozambique","reverse the words","reverse word order","swap case","toggle case","words backwards"]],["has","has"]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-0cfd7609","guard":[["hasAny",["delete","mozambique","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"French Southern territories"}]],"mem":null},
{"id":"n-1a6beac1","guard":[["hasAny",["mozambique","separate by","split","split by"]],["has","has"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Armenia"}]],"mem":null},
{"id":"n-1a9dd976","guard":[["hasAny",["mozambique","separate by","split","split by"]],["has","has"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Cocos (Keeling) Islands"}]],"mem":null},
{"id":"n-1ceac997","guard":[["hasAny",["lower case","lowercase","mozambique","reverse the words","reverse word order","small letters","words backwards"]],["has","has"]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["sense.subject"]]]],"mem":null},
{"id":"n-2154247a","guard":[["hasAny",["delete","mozambique","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Cook Islands"}]],"mem":null},
{"id":"n-2336331a","guard":[["hasAny",["each word","invert case","mozambique","split into words","swap case","toggle case"]],["has","has"]],"pyramid":["render.list",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-307fbd02","guard":[["hasAny",["delete","grenada","remove","strip out","without"]],["has","mayotte"]],"pyramid":["render.str",["transform.remove",{"lit":"Grenada"},["sense.lastWord"]]],"mem":null},
{"id":"n-354753cd","guard":[["hasAny",["a to z","alphabetical","alphabetize","each word","mozambique","split into words"]],["has","has"]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-3c6fe467","guard":[["hasAny",["distinct","each word","mozambique","remove duplicates","split into words","unique","without repeats"]],["has","has"]],"pyramid":["render.list",["transform.uniqueStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-41c33053","guard":[["hasAny",["each word","lower case","lowercase","mozambique","small letters","split into words"]],["has","has"]],"pyramid":["render.list",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-42e93847","guard":[["hasAny",["each word","invert case","mozambique","split into words","swap case","toggle case"]],["has","has"]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-470c95ea","guard":[["hasAny",["delete","mozambique","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Aruba"}]],"mem":null},
{"id":"n-477c244c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","each word","mozambique","split into words","title case"]],["has","has"]],"pyramid":["render.list",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-48178e1b","guard":[["hasAny",["mozambique","normalise","normalize","simplify the text"]],["has","has"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":1}]],"mem":null},
{"id":"n-4c0328e1","guard":[["hasAny",["each word","lower case","lowercase","mozambique","small letters","split into words"]],["has","has"]],"pyramid":["render.and",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-4f25e1d1","guard":[["hasAny",["alphabetize the letters","cameroon","letters in order","shortest","shortest one","shortest word","sort the letters"]],["has","laos"]],"pyramid":["render.str",["transform.sortLetters",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-51dd8c81","guard":[["hasAny",["distinct","each word","mozambique","remove duplicates","split into words","unique","without repeats"]],["has","has"]],"pyramid":["render.and",["transform.uniqueStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-5500942e","guard":[["hasAny",["british","first n","take","top"]],["has","smaller"]],"pyramid":["render.list",["transform.takeStrs",["sense.list"],{"lit":2}]],"mem":null},
{"id":"n-57d6cd45","guard":[["hasAny",["mozambique","separate by","split","split by"]],["has","has"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"French Southern territories"}]],"mem":null},
{"id":"n-5ab5caba","guard":[["hasAny",["distinct","each word","mozambique","remove duplicates","split into words","unique","without repeats"]],["has","has"]],"pyramid":["render.lines",["transform.uniqueStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-63be1eee","guard":[["hasAny",["all caps","capital letters","capitals","mozambique","reverse the words","reverse word order","upper case","uppercase","words backwards"]],["has","has"]],"pyramid":["render.str",["transform.reverseWords",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-6adf2103","guard":[["hasAny",["element","item number","morocco","nth","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-74c9244c","guard":[["hasAny",["all caps","capital letters","capitals","each word","mozambique","split into words","upper case","uppercase"]],["has","has"]],"pyramid":["render.lines",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-80b448ae","guard":[["has","mozambique"],["has","has"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],{"lit":1}]],"mem":null},
{"id":"n-82236b2b","guard":[["hasAny",["mozambique","separate by","split","split by"]],["has","has"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Cayman Islands"}]],"mem":null},
{"id":"n-86a35d70","guard":[["hasAny",["delete","new","remove","strip out","without"]],["has","french"]],"pyramid":["render.str",["transform.remove",{"lit":"French Southern territories"},["sense.lastWord"]]],"mem":null},
{"id":"n-8a240e8f","guard":[["hasAny",["delete","mozambique","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Bahamas"}]],"mem":null},
{"id":"n-8b4edc26","guard":[["hasAny",["a to z","alphabetical","alphabetize","each word","mozambique","split into words"]],["has","has"]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-936890e6","guard":[["hasAny",["delete","mozambique","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Cayman Islands"}]],"mem":null},
{"id":"n-972dd9cc","guard":[["hasAny",["backwards","each word","mozambique","reverse","reverse order","reversed","split into words"]],["has","has"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-98e9805e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","each word","mozambique","split into words","title case"]],["has","has"]],"pyramid":["render.lines",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-99693eee","guard":[["hasAny",["backwards","each word","mozambique","reverse","reverse order","reversed","split into words"]],["has","has"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-9e91a19f","guard":[["hasAny",["mozambique","normalise","normalize","simplify the text"]],["has","which"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":2}]],"mem":null},
{"id":"n-a0c8373e","guard":[["hasAny",["aruba","delete","remove","strip out","without"]],["has","mauritania"]],"pyramid":["render.str",["transform.remove",{"lit":"Aruba"},["sense.lastWord"]]],"mem":null},
{"id":"n-a30efb0b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mozambique","reverse the words","reverse word order","title case","words backwards"]],["has","has"]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-a3247595","guard":[["hasAny",["each word","lower case","lowercase","mozambique","small letters","split into words"]],["has","has"]],"pyramid":["render.lines",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-a3498f1e","guard":[["hasAny",["mozambique","separate by","split","split by"]],["has","has"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Cook Islands"}]],"mem":null},
{"id":"n-a7429aef","guard":[["hasAny",["all caps","capital letters","capitals","each word","mozambique","split into words","upper case","uppercase"]],["has","has"]],"pyramid":["render.list",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-ab071a8d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","each word","mozambique","split into words","title case"]],["has","has"]],"pyramid":["render.and",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-ab3bf32e","guard":[["hasAny",["delete","mozambique","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Botswana"}]],"mem":null},
{"id":"n-b4d646e8","guard":[["hasAny",["a to z","alphabetical","alphabetize","each word","mozambique","split into words"]],["has","has"]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-b59ac5f7","guard":[["hasAny",["new","separate by","split","split by"]],["has","french"]],"pyramid":["render.list",["transform.split",{"lit":"French Southern territories"},["sense.lastWord"]]],"mem":null},
{"id":"n-b8dd9e37","guard":[["hasAny",["botswana","delete","remove","strip out","without"]],["has","between"]],"pyramid":["render.str",["transform.remove",{"lit":"Botswana"},["sense.lastWord"]]],"mem":null},
{"id":"n-c7884b41","guard":[["hasAny",["each word","mozambique","shortest","shortest one","shortest word","split into words"]],["has","has"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-ccc61f7f","guard":[["hasAny",["mozambique","normalise","normalize","simplify the text"]],["has","which"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":3}]],"mem":null},
{"id":"n-cdf2b7ba","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","mozambique","swap case","title case","toggle case"]],["has","has"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-d5fcce99","guard":[["hasAny",["delete","mozambique","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Cocos (Keeling) Islands"}]],"mem":null},
{"id":"n-d819fb48","guard":[["hasAny",["bahamas","delete","remove","strip out","without"]],["has","between"]],"pyramid":["render.str",["transform.remove",{"lit":"Bahamas"},["sense.lastWord"]]],"mem":null},
{"id":"n-e2fe19e8","guard":[["hasAny",["all caps","capital letters","capitals","each word","mozambique","split into words","upper case","uppercase"]],["has","has"]],"pyramid":["render.and",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-eeaa2924","guard":[["hasAny",["each word","invert case","mozambique","split into words","swap case","toggle case"]],["has","has"]],"pyramid":["render.and",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-f6bf5d09","guard":[["hasAny",["backwards","each word","mozambique","reverse","reverse order","reversed","split into words"]],["has","has"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-f82cf37d","guard":[["hasAny",["delete","mozambique","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Armenia"}]],"mem":null},
{"id":"n-0803b39d","guard":[["hasAny",["delete","morocco","remove","strip out","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.before",{"lit":"of"}]]],"mem":null},
{"id":"n-3613aca1","guard":[["hasAny",["from position","items from to","morocco","slice"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],{"lit":12},["sense.wordCount"]]],"mem":null},
{"id":"n-3ce95541","guard":[["hasAny",["mozambique","separate by","split","split by"]],["has","has"]],"pyramid":["render.list",["transform.split",["sense.subject"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-404645ab","guard":[["hasAny",["mozambique","separate by","split","split by"]],["has","has"]],"pyramid":["render.and",["transform.split",["sense.subject"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-7164a28a","guard":[["hasAny",["from position","items from to","miquelon","slice"]]],"pyramid":["render.and",["transform.sliceStrs",["sense.list"],{"lit":3},["sense.wordCount"]]],"mem":null},
{"id":"n-7558d3c4","guard":[["hasAny",["mozambique","separate by","split","split by"]],["has","has"]],"pyramid":["render.lines",["transform.split",["sense.subject"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-809d0018","guard":[["hasAny",["from position","items from to","morocco","slice"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.words"],{"lit":12},["sense.wordCount"]]],"mem":null},
{"id":"n-9f982496","guard":[["hasAny",["change to","mozambique","replace","substitute","swap"]],["has","has"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-ac06070a","guard":[["hasAny",["delete","morocco","remove","strip out","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.before",{"lit":"of"}]]],"mem":null},
{"id":"n-ba695b6f","guard":[["hasAny",["congo","delete","remove","strip out","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-eaeb8ed3","guard":[["hasAny",["delete","morocco","remove","strip out","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-f99e04ea","guard":[["hasAny",["delete","mozambique","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-fbc336ec","guard":[["hasAny",["from position","items from to","morocco","slice"]]],"pyramid":["render.and",["transform.sliceStrs",["sense.words"],{"lit":12},["sense.wordCount"]]],"mem":null},
{"id":"n-fc45cb72","guard":[["hasAny",["morocco","separate by","split","split by"]],["has","which"]],"pyramid":["render.list",["transform.split",["sense.subject"],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-c78a4fee","guard":[["hasAny",["element","item number","marino","nth","position"]],["has","micronesia"]],"pyramid":["render.template",{"lit":["San Marino ",{"slot":0}," the smaller ",{"slot":1}," (33785 against 112640)."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-4911f206","guard":[["hasAny",["longest","longest one","longest word","mozambique","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," (111454 against 29495962)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9a0309e3","guard":[["hasAny",["longest","longest one","longest word","miquelon"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the smaller ",{"slot":2}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["sense.lastWord"],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a047537c","guard":[["hasAny",["element","item number","marino","nth","position","shortest","shortest one","shortest word"]],["has","micronesia"]],"pyramid":["render.template",{"lit":[{"slot":0}," Marino ",{"slot":1}," the smaller population (33785 against 112640)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-2479995d","guard":[["hasAny",["element","item number","mozambique","nth","position","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," population (111454 against 29495962)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3eb36bed","guard":[["hasAny",["element","item number","marino","nth","position","shortest","shortest one","shortest word"]],["has","micronesia"]],"pyramid":["render.template",{"lit":[{"slot":0}," Marino ",{"slot":1}," the smaller ",{"slot":2}," (33785 against 112640)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.subject"]],"mem":null},
{"id":"n-48d5634b","guard":[["hasAny",["armenia","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (2951776 against 82905782)."]},["aggregate.longest",["sense.list"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-54f7a207","guard":[["hasAny",["algeria","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (15008154 against 42228429)."]},["aggregate.shortest",["sense.list"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6e96e30a","guard":[["hasAny",["element","item number","longest","longest one","longest word","miquelon","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," population (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8ac732f1","guard":[["hasAny",["iceland","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","ireland"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (352721 against 1885400)."]},["aggregate.shortest",["sense.list"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-96da1cd7","guard":[["hasAny",["element","item number","longest","longest one","longest word","mozambique","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (111454 against 29495962)."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b1f6d373","guard":[["hasAny",["algeria","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (15008154 against 42228429)."]},["aggregate.longest",["sense.list"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c6acc56b","guard":[["hasAny",["armenia","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (2951776 against 82905782)."]},["aggregate.shortest",["sense.list"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f911298b","guard":[["hasAny",["element","item number","marino","nth","position","shortest","shortest one","shortest word"]],["has","micronesia"]],"pyramid":["render.template",{"lit":[{"slot":0}," Marino ",{"slot":1}," the smaller ",{"slot":2}," (33785 against 112640)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-1b887367","guard":[["hasAny",["benin","element","item number","longest","longest one","longest word","nth","position"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (11123176 against 11485048)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1fb48137","guard":[["hasAny",["algeria","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (15008154 against 42228429)."]},["transform.nthStr",["sense.list"],{"lit":1}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-20c406ea","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","marino","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","micronesia"]],"pyramid":["render.template",{"lit":[{"slot":0}," Marino ",{"slot":1}," the smaller ",{"slot":2}," (33785 against 112640)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-42461b90","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","marino","nth","position","shortest","shortest one","shortest word","title case"]],["has","micronesia"]],"pyramid":["render.template",{"lit":[{"slot":0}," Marino ",{"slot":1}," the smaller ",{"slot":2}," (33785 against 112640)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-58afac70","guard":[["hasAny",["benin","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (11123176 against 11485048)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-603994ad","guard":[["hasAny",["element","iceland","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","ireland"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (352721 against 1885400)."]},["transform.nthStr",["sense.list"],{"lit":1}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6adfb5a9","guard":[["hasAny",["element","item number","lanka","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (6956071 against 21670000)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6bcceb9d","guard":[["hasAny",["armenia","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (2951776 against 82905782)."]},["transform.nthStr",["sense.list"],{"lit":1}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-74607c4c","guard":[["hasAny",["africa","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (631219 against 57779622)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7851c09f","guard":[["hasAny",["cameroon","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","laos"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (7061507 against 25216237)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7c15dd9f","guard":[["hasAny",["element","item number","longest","longest one","longest word","new","nth","position","shortest","shortest one","shortest word"]],["has","french"]],"pyramid":["render.template",{"lit":["French Southern ",{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," (0 against 4841000)."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-83b9b5f4","guard":[["hasAny",["element","item number","longest","longest one","longest word","miquelon","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and Miquelon has the ",{"slot":1}," ",{"slot":2}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-95580a70","guard":[["hasAny",["element","estonia","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (779004 against 1321977)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-99bfea73","guard":[["hasAny",["element","item number","longest","longest one","longest word","mozambique","nth","position","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":["Grenada ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," (111454 against 29495962)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a1b57ab1","guard":[["hasAny",["element","item number","marino","nth","position"]],["has","micronesia"]],"pyramid":["render.template",{"lit":[{"slot":0}," Marino ",{"slot":1}," the smaller ",{"slot":2}," (33785 against 112640)."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-d0dadb24","guard":[["hasAny",["element","item number","longest","longest one","longest word","malta","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (484630 against 3449299)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d5837eb3","guard":[["hasAny",["element","item number","longest","longest one","longest word","new","nth","position","shortest","shortest one","shortest word"]],["has","french"]],"pyramid":["render.template",{"lit":["French Southern ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," population (0 against 4841000)."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d9c288d9","guard":[["hasAny",["element","item number","lower case","lowercase","marino","nth","position","shortest","shortest one","shortest word","small letters"]],["has","micronesia"]],"pyramid":["render.template",{"lit":[{"slot":0}," Marino ",{"slot":1}," the smaller ",{"slot":2}," (33785 against 112640)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-efd2a1cf","guard":[["hasAny",["bangladesh","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (81800269 against 161356039)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-fe9d3ddb","guard":[["hasAny",["element","invert case","item number","marino","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","micronesia"]],"pyramid":["render.template",{"lit":[{"slot":0}," Marino ",{"slot":1}," the smaller ",{"slot":2}," (33785 against 112640)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-37154991","guard":[["hasAny",["element","item number","longest","longest one","longest word","mozambique","nth","position","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-407e07e3","guard":[["hasAny",["bangladesh","element","item number","longest","longest one","longest word","nth","position"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (81800269 against 161356039)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4b8e2fe9","guard":[["hasAny",["element","item number","longest","longest one","longest word","mozambique","nth","position","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5b43d9de","guard":[["hasAny",["element","item number","new","nth","position","shortest","shortest one","shortest word"]],["has","french"]],"pyramid":["render.template",{"lit":["French Southern territories ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," (0 against 4841000)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5f4d8813","guard":[["hasAny",["element","estonia","item number","longest","longest one","longest word","nth","position"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (779004 against 1321977)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-63d81efc","guard":[["hasAny",["element","item number","longest","longest one","longest word","malta","nth","position"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (484630 against 3449299)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6c3ed656","guard":[["hasAny",["element","item number","longest","longest one","longest word","mozambique","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["sense.lastWord"],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6e0a5532","guard":[["hasAny",["armenia","first n","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (2951776 against 82905782)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7df15cdd","guard":[["hasAny",["first n","iceland","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]],["has","ireland"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (352721 against 1885400)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-96b94f35","guard":[["hasAny",["africa","element","item number","longest","longest one","longest word","nth","position"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (631219 against 57779622)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-98eb6664","guard":[["hasAny",["algeria","first n","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (15008154 against 42228429)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9d8d5dc6","guard":[["hasAny",["element","guyana","item number","longest","longest one","longest word","nth","position"]],["has","ivory"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," (779004 against 25069229)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9f206a6b","guard":[["hasAny",["element","item number","lanka","longest","longest one","longest word","nth","position"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (6956071 against 21670000)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-aa3988e3","guard":[["hasAny",["element","item number","longest","longest one","longest word","mozambique","nth","position","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["sense.subject"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-aab3c8f1","guard":[["hasAny",["benin","element","item number","longest","longest one","longest word","nth","position"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (11123176 against 11485048)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-aab838c1","guard":[["hasAny",["element","item number","marino","normalise","normalize","nth","position","shortest","shortest one","shortest word","simplify the text"]],["has","micronesia"]],"pyramid":["render.template",{"lit":[{"slot":0}," Marino ",{"slot":1}," the smaller ",{"slot":2}," (33785 against 112640)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-b8a057b7","guard":[["hasAny",["algeria","first n","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (15008154 against 42228429)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-bf61a5d9","guard":[["hasAny",["armenia","first n","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (2951776 against 82905782)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c5260cd3","guard":[["hasAny",["each word","element","item number","marino","nth","position","shortest","shortest one","shortest word","split into words"]],["has","micronesia"]],"pyramid":["render.template",{"lit":[{"slot":0}," Marino ",{"slot":1}," the smaller ",{"slot":2}," (33785 against 112640)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d0760bbd","guard":[["hasAny",["each word","element","item number","marino","nth","position","shortest","shortest one","shortest word","split into words"]],["has","micronesia"]],"pyramid":["render.template",{"lit":[{"slot":0}," Marino ",{"slot":1}," the smaller ",{"slot":2}," (33785 against 112640)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d421b4e9","guard":[["hasAny",["element","item number","longest","longest one","longest word","miquelon","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d6cfc3e2","guard":[["hasAny",["first n","iceland","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]],["has","ireland"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (352721 against 1885400)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d7ef2232","guard":[["hasAny",["cameroon","element","item number","longest","longest one","longest word","nth","position"]],["has","laos"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (7061507 against 25216237)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ea7288cf","guard":[["hasAny",["element","item number","longest","longest one","longest word","miquelon","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-fb194ab2","guard":[["hasAny",["element","item number","longest","longest one","longest word","new","nth","position"]],["has","french"]],"pyramid":["render.template",{"lit":["French Southern ",{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (0 against 4841000)."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fd2fccda","guard":[["hasAny",["element","item number","longest","longest one","longest word","miquelon","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-01706dba","guard":[["hasAny",["element","item number","mozambique","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1035a6ad","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","longest","longest one","longest word","miquelon","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.upper",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-25624779","guard":[["hasAny",["element","first n","item number","lanka","longest","longest one","longest word","nth","position","take","top"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (6956071 against 21670000)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-29b51081","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","mozambique","nth","position","shortest","shortest one","shortest word","title case"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["transform.title",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-36fd5812","guard":[["hasAny",["element","first n","item number","lanka","longest","longest one","longest word","nth","position","take","top"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (6956071 against 21670000)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-43138243","guard":[["hasAny",["element","item number","longest","longest one","longest word","miquelon","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-546b42c3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","miquelon","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-58e97c32","guard":[["hasAny",["bosnia","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (3323929 against 53708395)."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-63747ecf","guard":[["hasAny",["element","item number","longest","longest one","longest word","mozambique","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-65f69dd7","guard":[["hasAny",["benin","element","first n","item number","longest","longest one","longest word","nth","position","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (11123176 against 11485048)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6907a2b0","guard":[["hasAny",["element","invert case","item number","longest","longest one","longest word","mozambique","nth","position","swap case","toggle case"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6eb17675","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","miquelon","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-76f50cd5","guard":[["hasAny",["element","item number","longest","longest one","longest word","lower case","lowercase","miquelon","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.lower",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-775478e7","guard":[["hasAny",["element","invert case","item number","longest","longest one","longest word","miquelon","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8077c28b","guard":[["hasAny",["africa","element","first n","item number","longest","longest one","longest word","nth","position","take","top"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (631219 against 57779622)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-80e2e180","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","longest","longest one","longest word","mozambique","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["transform.upper",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-822c19ea","guard":[["hasAny",["bangladesh","element","first n","item number","longest","longest one","longest word","nth","position","take","top"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (81800269 against 161356039)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-868a48f8","guard":[["hasAny",["element","estonia","first n","item number","longest","longest one","longest word","nth","position","take","top"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (779004 against 1321977)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8c7d1c4f","guard":[["hasAny",["cameroon","element","first n","item number","longest","longest one","longest word","nth","position","take","top"]],["has","laos"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (7061507 against 25216237)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-907fdc0d","guard":[["hasAny",["element","first n","item number","longest","longest one","longest word","malta","nth","position","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (484630 against 3449299)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-94bbb4ce","guard":[["hasAny",["africa","element","first n","item number","longest","longest one","longest word","nth","position","take","top"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (631219 against 57779622)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9f94b94c","guard":[["hasAny",["element","item number","longest","longest one","longest word","lower case","lowercase","mozambique","nth","position","shortest","shortest one","shortest word","small letters"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a5e61cfb","guard":[["hasAny",["element","invert case","item number","longest","longest one","longest word","miquelon","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a63f8c19","guard":[["hasAny",["bangladesh","element","first n","item number","longest","longest one","longest word","nth","position","take","top"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (81800269 against 161356039)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-aa2dd4a1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","mozambique","nth","position","title case"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-add12c4d","guard":[["hasAny",["element","item number","longest","longest one","longest word","miquelon","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-ae8c23ed","guard":[["hasAny",["element","first n","item number","longest","longest one","longest word","malta","nth","position","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (484630 against 3449299)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-bc9b5462","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","longest","longest one","longest word","mozambique","nth","position","upper case","uppercase"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["sense.lastWord"],["transform.upper",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-bed60a1e","guard":[["hasAny",["element","invert case","item number","longest","longest one","longest word","mozambique","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["transform.swapCase",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c06547d7","guard":[["hasAny",["element","item number","mozambique","nth","position","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c78b99c4","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","longest","longest one","longest word","miquelon","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["transform.upper",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c80bba22","guard":[["hasAny",["cameroon","element","first n","item number","longest","longest one","longest word","nth","position","take","top"]],["has","laos"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (7061507 against 25216237)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c9cbf7d2","guard":[["hasAny",["benin","element","first n","item number","longest","longest one","longest word","nth","position","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (11123176 against 11485048)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d1e29cf7","guard":[["hasAny",["element","item number","longest","longest one","longest word","lower case","lowercase","mozambique","nth","position","small letters"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["sense.lastWord"],["transform.lower",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e54a1c26","guard":[["hasAny",["element","estonia","first n","item number","longest","longest one","longest word","nth","position","take","top"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (779004 against 1321977)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f6f708ce","guard":[["hasAny",["bosnia","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (3323929 against 53708395)."]},["aggregate.shortest",["sense.list"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-fca5f046","guard":[["hasAny",["element","item number","longest","longest one","longest word","lower case","lowercase","miquelon","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-096490a8","guard":[["hasAny",["each word","element","item number","longest","longest one","longest word","miquelon","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-0980b798","guard":[["hasAny",["element","item number","longest","longest one","longest word","new","nth","position","shortest","shortest one","shortest word"]],["has","french"]],"pyramid":["render.template",{"lit":["French Southern ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (0 against 4841000)."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-224b1f8b","guard":[["hasAny",["element","item number","longest","longest one","longest word","new","nth","position"]],["has","french"]],"pyramid":["render.template",{"lit":["French Southern ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (0 against 4841000)."]},["aggregate.longest",["sense.words"]],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-38c3153e","guard":[["hasAny",["element","item number","longest","longest one","longest word","new","nth","position","shortest","shortest one","shortest word"]],["has","french"]],"pyramid":["render.template",{"lit":["French Southern ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (0 against 4841000)."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3ea4df56","guard":[["hasAny",["each word","element","item number","longest","longest one","longest word","miquelon","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-4254ae0b","guard":[["hasAny",["each word","element","item number","longest","longest one","longest word","mozambique","nth","position","split into words"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-568c7089","guard":[["hasAny",["element","item number","longest","longest one","longest word","mozambique","normalise","normalize","nth","position","shortest","shortest one","shortest word","simplify the text"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["transform.norm",["sense.lastWord"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-59e471e1","guard":[["hasAny",["each word","element","item number","longest","longest one","longest word","mozambique","nth","position","shortest","shortest one","shortest word","split into words"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["render.and",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-60090d40","guard":[["hasAny",["delete","element","item number","longest","longest one","longest word","miquelon","nth","position","remove","strip out","without"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["transform.remove",["sense.lastWord"],["sense.subject"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-66863934","guard":[["hasAny",["each word","element","item number","longest","longest one","longest word","mozambique","nth","position","shortest","shortest one","shortest word","split into words"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["render.list",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8be0b1b9","guard":[["hasAny",["each word","element","item number","longest","longest one","longest word","mozambique","nth","position","split into words"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (111454 against 29495962)."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-954a0218","guard":[["hasAny",["each word","element","item number","longest","longest one","longest word","miquelon","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a4f32434","guard":[["hasAny",["element","item number","longest","longest one","longest word","new","nth","position","shortest","shortest one","shortest word"]],["has","french"]],"pyramid":["render.template",{"lit":["French Southern ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (0 against 4841000)."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b5033d03","guard":[["hasAny",["cambodia","element","item number","longest","longest one","longest word","nth","position"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," the smaller ",{"slot":3}," (1267972 against 16249798)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cd8ab758","guard":[["hasAny",["element","item number","longest","longest one","longest word","miquelon","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["transform.norm",["sense.lastWord"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e4ff4089","guard":[["hasAny",["bosnia","element","item number","longest","longest one","longest word","nth","position"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (3323929 against 53708395)."]},["transform.nthStr",["sense.list"],{"lit":1}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ec5abc19","guard":[["hasAny",["bosnia","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (3323929 against 53708395)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-efe70ba0","guard":[["hasAny",["each word","element","item number","longest","longest one","longest word","miquelon","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (5888 against 211028)."]},["aggregate.longest",["sense.list"]],["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1f3097f7","guard":[["hasAny",["bosnia","element","first n","item number","longest","longest one","longest word","nth","position","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (3323929 against 53708395)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3b2967d5","guard":[["hasAny",["bosnia","element","first n","item number","longest","longest one","longest word","nth","position","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (3323929 against 53708395)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4be3c079","guard":[["hasAny",["element","item number","longest","longest one","longest word","lower case","lowercase","new","nth","position","small letters"]],["has","french"]],"pyramid":["render.template",{"lit":["French Southern ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (0 against 4841000)."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-88b1604f","guard":[["hasAny",["element","item number","longest","longest one","longest word","macedonia","nth","position"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and Nevis ",{"slot":2}," the smaller ",{"slot":3}," (52441 against 2084367)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a018c6fd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","new","nth","position","title case"]],["has","french"]],"pyramid":["render.template",{"lit":["French Southern ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (0 against 4841000)."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-aca067aa","guard":[["hasAny",["element","item number","longest","longest one","longest word","new","nth","position"]],["has","french"]],"pyramid":["render.template",{"lit":["French Southern ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (0 against 4841000)."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b09daba1","guard":[["hasAny",["element","invert case","item number","longest","longest one","longest word","new","nth","position","swap case","toggle case"]],["has","french"]],"pyramid":["render.template",{"lit":["French Southern ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (0 against 4841000)."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-eb972d6b","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","longest","longest one","longest word","new","nth","position","upper case","uppercase"]],["has","french"]],"pyramid":["render.template",{"lit":["French Southern ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (0 against 4841000)."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7cf925e6","guard":[["hasAny",["each word","element","item number","longest","longest one","longest word","new","nth","position","split into words"]],["has","french"]],"pyramid":["render.template",{"lit":["French Southern ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (0 against 4841000)."]},["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bd340d91","guard":[["hasAny",["each word","element","item number","longest","longest one","longest word","new","nth","position","split into words"]],["has","french"]],"pyramid":["render.template",{"lit":["French Southern ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (0 against 4841000)."]},["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"whose population is smaller: Comoros or Niger","expect":{"contains":["Comoros"],"notContains":["Niger"],"notRefusal":true}},{"q":"between North Macedonia and Saint Kitts and Nevis, which has the lesser population","expect":{"contains":["Saint Kitts and Nevis"],"notContains":["North Macedonia"],"notRefusal":true}},{"q":"between Vanuatu and Uganda, which has the lesser population","expect":{"contains":["Vanuatu"],"notContains":["Uganda"],"notRefusal":true}},{"q":"whose population is smaller: Madagascar or Puerto Rico","expect":{"contains":["Puerto Rico"],"notContains":["Madagascar"],"notRefusal":true}},{"q":"between Qatar and Bosnia and Herzegovina, which has the lesser population","expect":{"contains":["Qatar"],"notContains":["Bosnia and Herzegovina"],"notRefusal":true}},{"q":"whose population is smaller: Guyana or Estonia","expect":{"contains":["Guyana"],"notContains":["Estonia"],"notRefusal":true}},{"q":"whose population is smaller: Niue or South Georgia and the South Sandwich Islands","expect":{"contains":["South Georgia and the South Sandwich Islands"],"notContains":["Niue"],"notRefusal":true}},{"q":"between Tajikistan and Haiti, which has the lesser population","expect":{"contains":["Tajikistan"],"notContains":["Haiti"],"notRefusal":true}},{"q":"between El Salvador and Niue, which has the lesser population","expect":{"contains":["Niue"],"notContains":["El Salvador"],"notRefusal":true}},{"q":"which has the smaller population, Gabon or Djibouti","expect":{"contains":["Djibouti"],"notContains":["Gabon"],"notRefusal":true}},{"q":"whose population is smaller: Tonga or Marshall Islands","expect":{"contains":["Marshall Islands"],"notContains":["Tonga"],"notRefusal":true}},{"q":"whose population is smaller: Haiti or Benin","expect":{"contains":["Haiti"],"notContains":["Benin"],"notRefusal":true}},{"q":"between Monaco and Malta, which has the lesser population","expect":{"contains":["Monaco"],"notContains":["Malta"],"notRefusal":true}},{"q":"which has the smaller population, Niger or Qatar","expect":{"contains":["Qatar"],"notContains":["Niger"],"notRefusal":true}},{"q":"whose population is smaller: Bosnia and Herzegovina or Myanmar","expect":{"contains":["Bosnia and Herzegovina"],"notContains":["Myanmar"],"notRefusal":true}},{"q":"which has the smaller population, Uruguay or North Macedonia","expect":{"contains":["North Macedonia"],"notContains":["Uruguay"],"notRefusal":true}},{"q":"which has the smaller population, The Democratic Republic of Congo or Morocco","expect":{"contains":["Morocco"],"notContains":["The Democratic Republic of Congo"],"notRefusal":true}},{"q":"whose population is smaller: Saint Kitts and Nevis or Sudan","expect":{"contains":["Saint Kitts and Nevis"],"notContains":["Sudan"],"notRefusal":true}},{"q":"whose population is smaller: Cayman Islands or South Sudan","expect":{"contains":["Cayman Islands"],"notContains":["South Sudan"],"notRefusal":true}},{"q":"between Burundi and Cook Islands, which has the lesser population","expect":{"contains":["Cook Islands"],"notContains":["Burundi"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
