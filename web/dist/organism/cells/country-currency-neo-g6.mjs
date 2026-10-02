// country-currency-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"country-currency-neo-g6","class":"country-currency","generation":6,"lane":"neo","grownFrom":["name the currency of Uzbekistan","what currency does Peru use","name the currency of Niue","what currency does Maldives use","name the currency of Lesotho","name the currency of South Georgia and the South Sandwich Islands","what currency does Central African Republic use","which currency is used in Mauritania","what currency does Liechtenstein use","what currency does United Kingdom use","name the currency of Hungary","which currency is used in East Timor","what currency does Turkey use","which currency is used in Greenland","name the currency of North Korea","what currency does Marshall Islands use","which currency is used in Angola","which currency is used in Kiribati","which currency is used in Luxembourg","which currency is used in Bosnia and Herzegovina"],"version":1});

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
{"id":"n-b7ce4b9f","guard":[["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Peru use":"Peru uses the Peruvian Nuevo Sol.","name the currency of Niue":"Niue uses the New Zealand Dollar.","what currency does Maldives use":"Maldives uses the Maldive Rufiyaa.","name the currency of Uzbekistan":"Uzbekistan uses the Uzbekistan Sum.","name the currency of Lesotho":"Lesotho uses the Lesotho Loti.","name the currency of South Georgia and the South Sandwich Islands":"South Georgia and the South Sandwich Islands uses the Pound Sterling.","what currency does Central African Republic use":"Central African Republic uses the CFA Franc BEAC.","which currency is used in Mauritania":"Mauritania uses the Mauritanian Ouguiya.","what currency does Liechtenstein use":"Liechtenstein uses the Swiss Franc.","what currency does United Kingdom use":"United Kingdom uses the Pound Sterling.","name the currency of Hungary":"Hungary uses the Hungarian Forint.","which currency is used in East Timor":"East Timor uses the US Dollar.","what currency does Turkey use":"Turkey uses the Turkish Lira.","which currency is used in Greenland":"Greenland uses the Danish Krone.","name the currency of North Korea":"North Korea uses the North Korean Won.","what currency does Marshall Islands use":"Marshall Islands uses the US Dollar.","which currency is used in Angola":"Angola uses the Angolan Kwanza.","which currency is used in Kiribati":"Kiribati uses the Australian Dollar.","which currency is used in Luxembourg":"Luxembourg uses the Euro.","which currency is used in Bosnia and Herzegovina":"Bosnia and Herzegovina uses the Convertible Mark.","name the currency of Anguilla":"Anguilla uses the East Caribbean Dollar.","name the currency of Libya":"Libya uses the Libyan Dinar.","which currency is used in Chile":"Chile uses the Chilean Peso.","name the currency of Guadeloupe":"Guadeloupe uses the Euro.","which currency is used in Turkmenistan":"Turkmenistan uses the Manat.","name the currency of Palau":"Palau uses the US Dollar.","name the currency of Uganda":"Uganda uses the Uganda Shilling.","which currency is used in Saint Lucia":"Saint Lucia uses the East Caribbean Dollar.","what currency does Nigeria use":"Nigeria uses the Nigerian Naira.","which currency is used in Iceland":"Iceland uses the Iceland Krona.","what currency does Guinea use":"Guinea uses the Guinea Franc.","what currency does Jordan use":"Jordan uses the Jordanian Dinar.","which currency is used in Barbados":"Barbados uses the Barbados Dollar.","name the currency of United Arab Emirates":"United Arab Emirates uses the Arab Emirates Dirham.","which currency is used in Nicaragua":"Nicaragua uses the Nicaraguan Cordoba Oro.","what currency does South Africa use":"South Africa uses the South African Rand.","what currency does Virgin Islands, British use":"Virgin Islands, British uses the Pound Sterling.","which currency is used in Western Sahara":"Western Sahara uses the Moroccan Dirham.","which currency is used in Wallis and Futuna":"Wallis and Futuna uses the CFP Franc.","which currency is used in Martinique":"Martinique uses the Euro.","name the currency of Latvia":"Latvia uses the Latvian Lats.","what currency does India use":"India uses the Indian Rupee.","what currency does Eritrea use":"Eritrea uses the Eritrean Nakfa.","what currency does Finland use":"Finland uses the Euro.","what currency does Tanzania use":"Tanzania uses the Tanzanian Shilling.","name the currency of Cocos (Keeling) Islands":"Cocos (Keeling) Islands uses the Australian Dollar.","which currency is used in Pitcairn Islands":"Pitcairn Islands uses the New Zealand Dollar.","name the currency of Kazakhstan":"Kazakhstan uses the Tenge.","what currency does Namibia use":"Namibia uses the Namibian Dollar.","which currency is used in Malaysia":"Malaysia uses the Malaysian Ringgit.","name the currency of Zambia":"Zambia uses the Zambian Kwacha.","which currency is used in Lithuania":"Lithuania uses the Lithuanian Litas.","what currency does Azerbaijan use":"Azerbaijan uses the Azerbaijan New Manat.","what currency does Samoa use":"Samoa uses the Samoan Tala.","name the currency of Puerto Rico":"Puerto Rico uses the US Dollar.","name the currency of Monaco":"Monaco uses the Euro.","which currency is used in Moldova":"Moldova uses the Moldovan Leu.","which currency is used in Ecuador":"Ecuador uses the Ecuador Sucre.","name the currency of Malta":"Malta uses the Euro.","name the currency of Switzerland":"Switzerland uses the Swiss Franc.","what currency does Ivory Coast use":"Ivory Coast uses the CFA Franc BCEAO.","which currency is used in Cook Islands":"Cook Islands uses the New Zealand Dollar.","what currency does Sri Lanka use":"Sri Lanka uses the Sri Lankan Rupee.","name the currency of Greece":"Greece uses the Euro.","what currency does Belgium use":"Belgium uses the Euro.","what currency does Vanuatu use":"Vanuatu uses the Vanuatu Vatu.","what currency does Iran use":"Iran uses the Iranian Rial.","which currency is used in Holy See (Vatican City State)":"Holy See (Vatican City State) uses the Euro.","name the currency of South Korea":"South Korea uses the Korean Won.","name the currency of Ukraine":"Ukraine uses the Ukraine Hryvnia.","which currency is used in The Democratic Republic of Congo":"The Democratic Republic of Congo uses the Franc Congolais.","what currency does Belize use":"Belize uses the Belize Dollar.","name the currency of Bolivia":"Bolivia uses the Boliviano.","which currency is used in Argentina":"Argentina uses the Argentine Peso.","what currency does England use":"England uses the Pound Sterlin.","which currency is used in Faroe Islands":"Faroe Islands uses the Danish Krone.","which currency is used in China":"China uses the Yuan Renminbi.","which currency is used in Bermuda":"Bermuda uses the Bermudian Dollar.","name the currency of Israel":"Israel uses the Israeli New Shekel.","which currency is used in Saint Helena":"Saint Helena uses the St. Helena Pound.","what currency does Togo use":"Togo uses the CFA Franc BCEAO.","name the currency of Svalbard and Jan Mayen":"Svalbard and Jan Mayen uses the Norwegian Krone.","name the currency of Bahrain":"Bahrain uses the Bahraini Dinar.","which currency is used in Dominica":"Dominica uses the East Caribbean Dollar.","what currency does Wales use":"Wales uses the Pound Sterlin.","name the currency of Croatia":"Croatia uses the Croatian Kuna.","which currency is used in Estonia":"Estonia uses the Euro.","name the currency of Saudi Arabia":"Saudi Arabia uses the Saudi Riyal.","what currency does Lebanon use":"Lebanon uses the Lebanese Pound.","name the currency of Philippines":"Philippines uses the Philippine Peso.","which currency is used in France":"France uses the Euro.","name the currency of Somalia":"Somalia uses the Somali Shilling.","name the currency of Russia":"Russia uses the Russian Ruble.","what currency does Sudan use":"Sudan uses the Sudanese Pound.","what currency does Australia use":"Australia uses the Australian Dollar.","name the currency of Bhutan":"Bhutan uses the Bhutan Ngultrum.","which currency is used in Guam":"Guam uses the US Dollar.","what currency does Heard Island and McDonald Islands use":"Heard Island and McDonald Islands uses the Australian Dollar.","what currency does Costa Rica use":"Costa Rica uses the Costa Rican Colon.","what currency does United States Minor Outlying Islands use":"United States Minor Outlying Islands uses the US Dollar."}}},
{"id":"n-cf114c96","guard":[["has","currency"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Peru use":"Peru uses the Peruvian Nuevo Sol.","name the currency of Niue":"Niue uses the New Zealand Dollar.","what currency does Maldives use":"Maldives uses the Maldive Rufiyaa.","name the currency of Uzbekistan":"Uzbekistan uses the Uzbekistan Sum.","name the currency of Lesotho":"Lesotho uses the Lesotho Loti.","name the currency of South Georgia and the South Sandwich Islands":"South Georgia and the South Sandwich Islands uses the Pound Sterling.","what currency does Central African Republic use":"Central African Republic uses the CFA Franc BEAC.","which currency is used in Mauritania":"Mauritania uses the Mauritanian Ouguiya.","what currency does Liechtenstein use":"Liechtenstein uses the Swiss Franc.","what currency does United Kingdom use":"United Kingdom uses the Pound Sterling.","name the currency of Hungary":"Hungary uses the Hungarian Forint.","which currency is used in East Timor":"East Timor uses the US Dollar.","what currency does Turkey use":"Turkey uses the Turkish Lira.","which currency is used in Greenland":"Greenland uses the Danish Krone.","name the currency of North Korea":"North Korea uses the North Korean Won.","what currency does Marshall Islands use":"Marshall Islands uses the US Dollar.","which currency is used in Angola":"Angola uses the Angolan Kwanza.","which currency is used in Kiribati":"Kiribati uses the Australian Dollar.","which currency is used in Luxembourg":"Luxembourg uses the Euro.","which currency is used in Bosnia and Herzegovina":"Bosnia and Herzegovina uses the Convertible Mark.","name the currency of Anguilla":"Anguilla uses the East Caribbean Dollar.","name the currency of Libya":"Libya uses the Libyan Dinar.","which currency is used in Chile":"Chile uses the Chilean Peso.","name the currency of Guadeloupe":"Guadeloupe uses the Euro.","which currency is used in Turkmenistan":"Turkmenistan uses the Manat.","name the currency of Palau":"Palau uses the US Dollar.","name the currency of Uganda":"Uganda uses the Uganda Shilling.","which currency is used in Saint Lucia":"Saint Lucia uses the East Caribbean Dollar.","what currency does Nigeria use":"Nigeria uses the Nigerian Naira.","which currency is used in Iceland":"Iceland uses the Iceland Krona.","what currency does Guinea use":"Guinea uses the Guinea Franc.","what currency does Jordan use":"Jordan uses the Jordanian Dinar.","which currency is used in Barbados":"Barbados uses the Barbados Dollar.","name the currency of United Arab Emirates":"United Arab Emirates uses the Arab Emirates Dirham.","which currency is used in Nicaragua":"Nicaragua uses the Nicaraguan Cordoba Oro.","what currency does South Africa use":"South Africa uses the South African Rand.","what currency does Virgin Islands, British use":"Virgin Islands, British uses the Pound Sterling.","which currency is used in Western Sahara":"Western Sahara uses the Moroccan Dirham.","which currency is used in Wallis and Futuna":"Wallis and Futuna uses the CFP Franc.","which currency is used in Martinique":"Martinique uses the Euro.","name the currency of Latvia":"Latvia uses the Latvian Lats.","what currency does India use":"India uses the Indian Rupee.","what currency does Eritrea use":"Eritrea uses the Eritrean Nakfa.","what currency does Finland use":"Finland uses the Euro.","what currency does Tanzania use":"Tanzania uses the Tanzanian Shilling.","name the currency of Cocos (Keeling) Islands":"Cocos (Keeling) Islands uses the Australian Dollar.","which currency is used in Pitcairn Islands":"Pitcairn Islands uses the New Zealand Dollar.","name the currency of Kazakhstan":"Kazakhstan uses the Tenge.","what currency does Namibia use":"Namibia uses the Namibian Dollar.","which currency is used in Malaysia":"Malaysia uses the Malaysian Ringgit.","name the currency of Zambia":"Zambia uses the Zambian Kwacha.","which currency is used in Lithuania":"Lithuania uses the Lithuanian Litas.","what currency does Azerbaijan use":"Azerbaijan uses the Azerbaijan New Manat.","what currency does Samoa use":"Samoa uses the Samoan Tala.","name the currency of Puerto Rico":"Puerto Rico uses the US Dollar.","name the currency of Monaco":"Monaco uses the Euro.","which currency is used in Moldova":"Moldova uses the Moldovan Leu.","which currency is used in Ecuador":"Ecuador uses the Ecuador Sucre.","name the currency of Malta":"Malta uses the Euro.","name the currency of Switzerland":"Switzerland uses the Swiss Franc.","what currency does Ivory Coast use":"Ivory Coast uses the CFA Franc BCEAO.","which currency is used in Cook Islands":"Cook Islands uses the New Zealand Dollar.","what currency does Sri Lanka use":"Sri Lanka uses the Sri Lankan Rupee.","name the currency of Greece":"Greece uses the Euro.","what currency does Belgium use":"Belgium uses the Euro.","what currency does Vanuatu use":"Vanuatu uses the Vanuatu Vatu.","what currency does Iran use":"Iran uses the Iranian Rial.","which currency is used in Holy See (Vatican City State)":"Holy See (Vatican City State) uses the Euro.","name the currency of South Korea":"South Korea uses the Korean Won.","name the currency of Ukraine":"Ukraine uses the Ukraine Hryvnia.","which currency is used in The Democratic Republic of Congo":"The Democratic Republic of Congo uses the Franc Congolais.","what currency does Belize use":"Belize uses the Belize Dollar.","name the currency of Bolivia":"Bolivia uses the Boliviano.","which currency is used in Argentina":"Argentina uses the Argentine Peso.","what currency does England use":"England uses the Pound Sterlin.","which currency is used in Faroe Islands":"Faroe Islands uses the Danish Krone.","which currency is used in China":"China uses the Yuan Renminbi.","which currency is used in Bermuda":"Bermuda uses the Bermudian Dollar.","name the currency of Israel":"Israel uses the Israeli New Shekel.","which currency is used in Saint Helena":"Saint Helena uses the St. Helena Pound.","what currency does Togo use":"Togo uses the CFA Franc BCEAO.","name the currency of Svalbard and Jan Mayen":"Svalbard and Jan Mayen uses the Norwegian Krone.","name the currency of Bahrain":"Bahrain uses the Bahraini Dinar.","which currency is used in Dominica":"Dominica uses the East Caribbean Dollar.","what currency does Wales use":"Wales uses the Pound Sterlin.","name the currency of Croatia":"Croatia uses the Croatian Kuna.","which currency is used in Estonia":"Estonia uses the Euro.","name the currency of Saudi Arabia":"Saudi Arabia uses the Saudi Riyal.","what currency does Lebanon use":"Lebanon uses the Lebanese Pound.","name the currency of Philippines":"Philippines uses the Philippine Peso.","which currency is used in France":"France uses the Euro.","name the currency of Somalia":"Somalia uses the Somali Shilling.","name the currency of Russia":"Russia uses the Russian Ruble.","what currency does Sudan use":"Sudan uses the Sudanese Pound.","what currency does Australia use":"Australia uses the Australian Dollar.","name the currency of Bhutan":"Bhutan uses the Bhutan Ngultrum.","which currency is used in Guam":"Guam uses the US Dollar.","what currency does Heard Island and McDonald Islands use":"Heard Island and McDonald Islands uses the Australian Dollar.","what currency does Costa Rica use":"Costa Rica uses the Costa Rican Colon.","what currency does United States Minor Outlying Islands use":"United States Minor Outlying Islands uses the US Dollar."}}},
{"id":"n-b1354a0c","guard":[["has","currency"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"currency"}]]],"mem":{"table":{"does Peru use":"Peru uses the Peruvian Nuevo Sol.","of Niue":"Niue uses the New Zealand Dollar.","does Maldives use":"Maldives uses the Maldive Rufiyaa.","of Uzbekistan":"Uzbekistan uses the Uzbekistan Sum.","of Lesotho":"Lesotho uses the Lesotho Loti.","of South Georgia and the South Sandwich Islands":"South Georgia and the South Sandwich Islands uses the Pound Sterling.","does Central African Republic use":"Central African Republic uses the CFA Franc BEAC.","is used in Mauritania":"Mauritania uses the Mauritanian Ouguiya.","does Liechtenstein use":"Liechtenstein uses the Swiss Franc.","does United Kingdom use":"United Kingdom uses the Pound Sterling.","of Hungary":"Hungary uses the Hungarian Forint.","is used in East Timor":"East Timor uses the US Dollar.","does Turkey use":"Turkey uses the Turkish Lira.","is used in Greenland":"Greenland uses the Danish Krone.","of North Korea":"North Korea uses the North Korean Won.","does Marshall Islands use":"Marshall Islands uses the US Dollar.","is used in Angola":"Angola uses the Angolan Kwanza.","is used in Kiribati":"Kiribati uses the Australian Dollar.","is used in Luxembourg":"Luxembourg uses the Euro.","is used in Bosnia and Herzegovina":"Bosnia and Herzegovina uses the Convertible Mark.","of Anguilla":"Anguilla uses the East Caribbean Dollar.","of Libya":"Libya uses the Libyan Dinar.","is used in Chile":"Chile uses the Chilean Peso.","of Guadeloupe":"Guadeloupe uses the Euro.","is used in Turkmenistan":"Turkmenistan uses the Manat.","of Palau":"Palau uses the US Dollar.","of Uganda":"Uganda uses the Uganda Shilling.","is used in Saint Lucia":"Saint Lucia uses the East Caribbean Dollar.","does Nigeria use":"Nigeria uses the Nigerian Naira.","is used in Iceland":"Iceland uses the Iceland Krona.","does Guinea use":"Guinea uses the Guinea Franc.","does Jordan use":"Jordan uses the Jordanian Dinar.","is used in Barbados":"Barbados uses the Barbados Dollar.","of United Arab Emirates":"United Arab Emirates uses the Arab Emirates Dirham.","is used in Nicaragua":"Nicaragua uses the Nicaraguan Cordoba Oro.","does South Africa use":"South Africa uses the South African Rand.","does Virgin Islands, British use":"Virgin Islands, British uses the Pound Sterling.","is used in Western Sahara":"Western Sahara uses the Moroccan Dirham.","is used in Wallis and Futuna":"Wallis and Futuna uses the CFP Franc.","is used in Martinique":"Martinique uses the Euro.","of Latvia":"Latvia uses the Latvian Lats.","does India use":"India uses the Indian Rupee.","does Eritrea use":"Eritrea uses the Eritrean Nakfa.","does Finland use":"Finland uses the Euro.","does Tanzania use":"Tanzania uses the Tanzanian Shilling.","of Cocos (Keeling) Islands":"Cocos (Keeling) Islands uses the Australian Dollar.","is used in Pitcairn Islands":"Pitcairn Islands uses the New Zealand Dollar.","of Kazakhstan":"Kazakhstan uses the Tenge.","does Namibia use":"Namibia uses the Namibian Dollar.","is used in Malaysia":"Malaysia uses the Malaysian Ringgit.","of Zambia":"Zambia uses the Zambian Kwacha.","is used in Lithuania":"Lithuania uses the Lithuanian Litas.","does Azerbaijan use":"Azerbaijan uses the Azerbaijan New Manat.","does Samoa use":"Samoa uses the Samoan Tala.","of Puerto Rico":"Puerto Rico uses the US Dollar.","of Monaco":"Monaco uses the Euro.","is used in Moldova":"Moldova uses the Moldovan Leu.","is used in Ecuador":"Ecuador uses the Ecuador Sucre.","of Malta":"Malta uses the Euro.","of Switzerland":"Switzerland uses the Swiss Franc.","does Ivory Coast use":"Ivory Coast uses the CFA Franc BCEAO.","is used in Cook Islands":"Cook Islands uses the New Zealand Dollar.","does Sri Lanka use":"Sri Lanka uses the Sri Lankan Rupee.","of Greece":"Greece uses the Euro.","does Belgium use":"Belgium uses the Euro.","does Vanuatu use":"Vanuatu uses the Vanuatu Vatu.","does Iran use":"Iran uses the Iranian Rial.","is used in Holy See (Vatican City State)":"Holy See (Vatican City State) uses the Euro.","of South Korea":"South Korea uses the Korean Won.","of Ukraine":"Ukraine uses the Ukraine Hryvnia.","is used in The Democratic Republic of Congo":"The Democratic Republic of Congo uses the Franc Congolais.","does Belize use":"Belize uses the Belize Dollar.","of Bolivia":"Bolivia uses the Boliviano.","is used in Argentina":"Argentina uses the Argentine Peso.","does England use":"England uses the Pound Sterlin.","is used in Faroe Islands":"Faroe Islands uses the Danish Krone.","is used in China":"China uses the Yuan Renminbi.","is used in Bermuda":"Bermuda uses the Bermudian Dollar.","of Israel":"Israel uses the Israeli New Shekel.","is used in Saint Helena":"Saint Helena uses the St. Helena Pound.","does Togo use":"Togo uses the CFA Franc BCEAO.","of Svalbard and Jan Mayen":"Svalbard and Jan Mayen uses the Norwegian Krone.","of Bahrain":"Bahrain uses the Bahraini Dinar.","is used in Dominica":"Dominica uses the East Caribbean Dollar.","does Wales use":"Wales uses the Pound Sterlin.","of Croatia":"Croatia uses the Croatian Kuna.","is used in Estonia":"Estonia uses the Euro.","of Saudi Arabia":"Saudi Arabia uses the Saudi Riyal.","does Lebanon use":"Lebanon uses the Lebanese Pound.","of Philippines":"Philippines uses the Philippine Peso.","is used in France":"France uses the Euro.","of Somalia":"Somalia uses the Somali Shilling.","of Russia":"Russia uses the Russian Ruble.","does Sudan use":"Sudan uses the Sudanese Pound.","does Australia use":"Australia uses the Australian Dollar.","of Bhutan":"Bhutan uses the Bhutan Ngultrum.","is used in Guam":"Guam uses the US Dollar.","does Heard Island and McDonald Islands use":"Heard Island and McDonald Islands uses the Australian Dollar.","does Costa Rica use":"Costa Rica uses the Costa Rican Colon.","does United States Minor Outlying Islands use":"United States Minor Outlying Islands uses the US Dollar."}}},
{"id":"n-0486e359","guard":[["has","currency"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"used in Mauritania":"Mauritania uses the Mauritanian Ouguiya.","used in East Timor":"East Timor uses the US Dollar.","used in Greenland":"Greenland uses the Danish Krone.","used in Angola":"Angola uses the Angolan Kwanza.","used in Kiribati":"Kiribati uses the Australian Dollar.","used in Luxembourg":"Luxembourg uses the Euro.","used in Bosnia and Herzegovina":"Bosnia and Herzegovina uses the Convertible Mark.","used in Chile":"Chile uses the Chilean Peso.","used in Turkmenistan":"Turkmenistan uses the Manat.","used in Saint Lucia":"Saint Lucia uses the East Caribbean Dollar.","used in Iceland":"Iceland uses the Iceland Krona.","used in Barbados":"Barbados uses the Barbados Dollar.","used in Nicaragua":"Nicaragua uses the Nicaraguan Cordoba Oro.","used in Western Sahara":"Western Sahara uses the Moroccan Dirham.","used in Wallis and Futuna":"Wallis and Futuna uses the CFP Franc.","used in Martinique":"Martinique uses the Euro.","used in Pitcairn Islands":"Pitcairn Islands uses the New Zealand Dollar.","used in Malaysia":"Malaysia uses the Malaysian Ringgit.","used in Lithuania":"Lithuania uses the Lithuanian Litas.","used in Moldova":"Moldova uses the Moldovan Leu.","used in Ecuador":"Ecuador uses the Ecuador Sucre.","used in Cook Islands":"Cook Islands uses the New Zealand Dollar.","used in Holy See (Vatican City State)":"Holy See (Vatican City State) uses the Euro.","used in The Democratic Republic of Congo":"The Democratic Republic of Congo uses the Franc Congolais.","used in Argentina":"Argentina uses the Argentine Peso.","used in Faroe Islands":"Faroe Islands uses the Danish Krone.","used in China":"China uses the Yuan Renminbi.","used in Bermuda":"Bermuda uses the Bermudian Dollar.","used in Saint Helena":"Saint Helena uses the St. Helena Pound.","used in Dominica":"Dominica uses the East Caribbean Dollar.","used in Estonia":"Estonia uses the Euro.","used in France":"France uses the Euro.","used in Guam":"Guam uses the US Dollar."}}},
{"id":"n-0c7f6d17","guard":[["has","currency"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"in"}]]],"mem":{"table":{"Mauritania":"Mauritania uses the Mauritanian Ouguiya.","East Timor":"East Timor uses the US Dollar.","Greenland":"Greenland uses the Danish Krone.","Angola":"Angola uses the Angolan Kwanza.","Kiribati":"Kiribati uses the Australian Dollar.","Luxembourg":"Luxembourg uses the Euro.","Bosnia and Herzegovina":"Bosnia and Herzegovina uses the Convertible Mark.","Chile":"Chile uses the Chilean Peso.","Turkmenistan":"Turkmenistan uses the Manat.","Saint Lucia":"Saint Lucia uses the East Caribbean Dollar.","Iceland":"Iceland uses the Iceland Krona.","Barbados":"Barbados uses the Barbados Dollar.","Nicaragua":"Nicaragua uses the Nicaraguan Cordoba Oro.","Western Sahara":"Western Sahara uses the Moroccan Dirham.","Wallis and Futuna":"Wallis and Futuna uses the CFP Franc.","Martinique":"Martinique uses the Euro.","Pitcairn Islands":"Pitcairn Islands uses the New Zealand Dollar.","Malaysia":"Malaysia uses the Malaysian Ringgit.","Lithuania":"Lithuania uses the Lithuanian Litas.","Moldova":"Moldova uses the Moldovan Leu.","Ecuador":"Ecuador uses the Ecuador Sucre.","Cook Islands":"Cook Islands uses the New Zealand Dollar.","Holy See (Vatican City State)":"Holy See (Vatican City State) uses the Euro.","The Democratic Republic of Congo":"The Democratic Republic of Congo uses the Franc Congolais.","Argentina":"Argentina uses the Argentine Peso.","Faroe Islands":"Faroe Islands uses the Danish Krone.","China":"China uses the Yuan Renminbi.","Bermuda":"Bermuda uses the Bermudian Dollar.","Saint Helena":"Saint Helena uses the St. Helena Pound.","Dominica":"Dominica uses the East Caribbean Dollar.","Estonia":"Estonia uses the Euro.","France":"France uses the Euro.","Guam":"Guam uses the US Dollar."}}},
{"id":"n-4dafb535","guard":[["hasAny",["city","estonia","france","greece","guadeloupe","luxembourg","malta","martinique","monaco"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Euro."]},["sense.lastWord"]],"mem":null},
{"id":"n-52a5cbfe","guard":[["hasAny",["all caps","capital letters","capitals","city","estonia","france","greece","guadeloupe","luxembourg","malta","martinique","monaco","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Euro."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-7c114d28","guard":[["hasAny",["city","estonia","france","greece","guadeloupe","invert case","luxembourg","malta","martinique","monaco","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Euro."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-95caab55","guard":[["hasAny",["city","estonia","france","greece","guadeloupe","lower case","lowercase","luxembourg","malta","martinique","monaco","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Euro."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a5a6c19f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","city","estonia","france","greece","guadeloupe","luxembourg","malta","martinique","monaco","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Euro."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c81a1a8a","guard":[["hasAny",["city","each word","estonia","france","greece","guadeloupe","luxembourg","malta","martinique","monaco","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Euro."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-de3ee855","guard":[["hasAny",["city","each word","estonia","france","greece","guadeloupe","luxembourg","malta","martinique","monaco","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Euro."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-600b3e5b","guard":[["hasAny",["element","estonia","france","greece","guadeloupe","item number","luxembourg","malta","martinique","monaco","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Euro."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b44ad076","guard":[["hasAny",["city","estonia","france","luxembourg","martinique"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Euro."]},["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-5ddd9c6f","guard":[["hasAny",["city","delete","estonia","france","luxembourg","martinique","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Euro"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-d508e926","guard":[["hasAny",["city","delete","estonia","france","luxembourg","martinique","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"euro"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-12ae6bca","guard":[["hasAny",["east","guam","palau","puerto"]],["has","currency"],["not",["has","carribean"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the US Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-070942ad","guard":[["hasAny",["east","guam","invert case","palau","puerto","swap case","toggle case"]],["has","currency"],["not",["has","carribean"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the US Dollar."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1b492834","guard":[["hasAny",["all caps","capital letters","capitals","east","guam","palau","puerto","upper case","uppercase"]],["has","currency"],["not",["has","carribean"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the US Dollar."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-23d97465","guard":[["hasAny",["east","guam","lower case","lowercase","palau","puerto","small letters"]],["has","currency"],["not",["has","carribean"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the US Dollar."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9941227b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","east","guam","palau","puerto","title case"]],["has","currency"],["not",["has","carribean"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the US Dollar."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-26573ca8","guard":[["hasAny",["each word","east","guam","palau","puerto","split into words"]],["has","currency"],["not",["has","carribean"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the US Dollar."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2b5885a5","guard":[["hasAny",["delete","greece","guadeloupe","malta","monaco","remove","strip out","without"]],["has","currency"]],"pyramid":["render.str",["transform.remove",{"lit":"Euro"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-40a47d69","guard":[["hasAny",["delete","greece","guadeloupe","malta","monaco","remove","strip out","without"]],["has","currency"]],"pyramid":["render.str",["transform.remove",{"lit":"euro"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-ca64e8f0","guard":[["hasAny",["each word","east","guam","palau","puerto","split into words"]],["has","currency"],["not",["has","carribean"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the US Dollar."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ed114376","guard":[["hasAny",["element","greece","guadeloupe","item number","malta","monaco","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Euro."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9c7937ff","guard":[["hasAny",["cook","niue","pitcairn"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the New Zealand Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-df1b0e9d","guard":[["hasAny",["anguilla","dominica","lucia"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the East Caribbean Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-11be8a49","guard":[["hasAny",["anguilla","dominica","lower case","lowercase","lucia","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the East Caribbean Dollar."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-200c6e9a","guard":[["hasAny",["cook","invert case","niue","pitcairn","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the New Zealand Dollar."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-36aceea1","guard":[["hasAny",["all caps","capital letters","capitals","cook","niue","pitcairn","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the New Zealand Dollar."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-555ad731","guard":[["hasAny",["cook","lower case","lowercase","niue","pitcairn","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the New Zealand Dollar."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6d59bd5e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cook","niue","pitcairn","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the New Zealand Dollar."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8782a2d9","guard":[["hasAny",["all caps","anguilla","capital letters","capitals","dominica","lucia","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the East Caribbean Dollar."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-8f910172","guard":[["hasAny",["anguilla","capitalise","capitalize","capitalize each word","dominica","lucia","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the East Caribbean Dollar."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e861e7e5","guard":[["hasAny",["anguilla","dominica","invert case","lucia","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the East Caribbean Dollar."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1e089a42","guard":[["hasAny",["anguilla","dominica","each word","lucia","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the East Caribbean Dollar."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-237d0af0","guard":[["hasAny",["cook","each word","niue","pitcairn","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the New Zealand Dollar."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9a85caa8","guard":[["hasAny",["element","guam","item number","marshall","nth","palau","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the US Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a08ac8c2","guard":[["hasAny",["cook","each word","niue","pitcairn","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the New Zealand Dollar."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c1d6c90e","guard":[["hasAny",["anguilla","dominica","each word","lucia","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the East Caribbean Dollar."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3891bfe2","guard":[["hasAny",["faroe","greenland"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Danish Krone."]},["sense.lastWord"]],"mem":null},
{"id":"n-8021e349","guard":[["hasAny",["cocos","kiribati"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Australian Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-084edfc3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","faroe","greenland","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Danish Krone."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0ac04659","guard":[["hasAny",["cocos","kiribati","lower case","lowercase","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Australian Dollar."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2ad3e228","guard":[["hasAny",["faroe","greenland","invert case","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Danish Krone."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-344c728e","guard":[["hasAny",["cocos","invert case","kiribati","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Australian Dollar."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-639e39d1","guard":[["hasAny",["dominica","lucia"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the East Caribbean Dollar."]},["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-705b0057","guard":[["hasAny",["all caps","capital letters","capitals","cocos","kiribati","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Australian Dollar."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-7bc9b0bf","guard":[["hasAny",["east","guam"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the US Dollar."]},["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-8d7d2c9e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cocos","kiribati","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Australian Dollar."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-aeb168b6","guard":[["hasAny",["all caps","capital letters","capitals","faroe","greenland","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Danish Krone."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b14e58f5","guard":[["hasAny",["faroe","greenland","lower case","lowercase","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Danish Krone."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b747f0be","guard":[["hasAny",["liechtenstein","longest","longest one","longest word","switzerland"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Swiss Franc."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f75955c6","guard":[["hasAny",["faroe","greenland"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Danish Krone."]},["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-053d89ce","guard":[["hasAny",["delete","palau","puerto","remove","strip out","without"]],["has","currency"]],"pyramid":["render.str",["transform.remove",{"lit":"US Dollar"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-07b54d6d","guard":[["hasAny",["liechtenstein","separate by","split","split by","switzerland"]],["has","currency"]],"pyramid":["render.and",["transform.split",{"lit":"Swiss Franc"},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-1b0264dd","guard":[["hasAny",["liechtenstein","separate by","split","split by","switzerland"]],["has","currency"]],"pyramid":["render.lines",["transform.split",{"lit":"Swiss Franc"},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-375ca360","guard":[["hasAny",["element","england","item number","nth","position","wales"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Pound Sterlin."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3885b535","guard":[["hasAny",["cocos","each word","kiribati","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Australian Dollar."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3e4d3de7","guard":[["hasAny",["cocos","each word","kiribati","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Australian Dollar."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-45a222d4","guard":[["hasAny",["element","england","item number","nth","position","wales"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Pound Sterlin."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-4f2b773c","guard":[["hasAny",["each word","faroe","greenland","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Danish Krone."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5965e4a3","guard":[["hasAny",["belgium","element","finland","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Euro."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5cc29129","guard":[["hasAny",["cook","delete","pitcairn","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"New Zealand Dollar"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-7180ffdd","guard":[["hasAny",["anguilla","dominica","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the East Caribbean Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9815c513","guard":[["hasAny",["delete","faroe","greenland","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Danish Krone"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-9aaa63fd","guard":[["hasAny",["each word","faroe","greenland","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Danish Krone."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a39ed729","guard":[["hasAny",["delete","east","guam","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"US Dollar"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-a676fd6b","guard":[["hasAny",["belgium","element","finland","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Euro."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-bc63c2bc","guard":[["hasAny",["cook","element","item number","nth","pitcairn","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," Islands uses the New Zealand Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d8e0152e","guard":[["hasAny",["delete","dominica","lucia","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"East Caribbean Dollar"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-e4d3bf64","guard":[["hasAny",["delete","liechtenstein","remove","strip out","switzerland","without"]],["has","currency"]],"pyramid":["render.str",["transform.remove",{"lit":"Swiss Franc"},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-e58b11b0","guard":[["hasAny",["element","item number","marshall","nth","palau","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the US Dollar."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ea1e62d5","guard":[["hasAny",["liechtenstein","separate by","split","split by","switzerland"]],["has","currency"]],"pyramid":["render.list",["transform.split",{"lit":"Swiss Franc"},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-5af3e70b","guard":[["hasAny",["cook","element","item number","nth","pitcairn","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the New Zealand Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-91fade02","guard":[["hasAny",["east","element","item number","nth","position","puerto"]],["has","currency"],["not",["has","carribean"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the US Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-3c787c62","guard":[["hasAny",["cook","element","item number","lower case","lowercase","nth","pitcairn","position","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the New Zealand Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5a70cc8c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","east","element","item number","nth","position","puerto","title case"]],["has","currency"],["not",["has","carribean"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the US Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-921a3e05","guard":[["hasAny",["east","element","item number","lower case","lowercase","nth","position","puerto","small letters"]],["has","currency"],["not",["has","carribean"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the US Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9aa70cda","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cook","element","item number","nth","pitcairn","position","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the New Zealand Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c4e0e702","guard":[["hasAny",["cook","element","invert case","item number","nth","pitcairn","position","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the New Zealand Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c749e1ee","guard":[["hasAny",["all caps","capital letters","capitals","east","element","item number","nth","position","puerto","upper case","uppercase"]],["has","currency"],["not",["has","carribean"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the US Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-c8974504","guard":[["hasAny",["all caps","capital letters","capitals","cook","element","item number","nth","pitcairn","position","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the New Zealand Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f8305132","guard":[["hasAny",["east","element","invert case","item number","nth","position","puerto","swap case","toggle case"]],["has","currency"],["not",["has","carribean"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the US Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-09aab77c","guard":[["hasAny",["cook","each word","element","item number","nth","pitcairn","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the New Zealand Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-33643d53","guard":[["hasAny",["east","element","item number","nth","position","puerto"]],["has","currency"],["not",["has","carribean"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the US Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-386e23e6","guard":[["hasAny",["each word","east","element","item number","nth","position","puerto","split into words"]],["has","currency"],["not",["has","carribean"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the US Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7974d033","guard":[["hasAny",["cook","each word","element","item number","nth","pitcairn","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the New Zealand Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8594c667","guard":[["hasAny",["cook","element","item number","nth","pitcairn","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the New Zealand Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b1092d6e","guard":[["hasAny",["each word","east","element","item number","nth","position","puerto","split into words"]],["has","currency"],["not",["has","carribean"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the US Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-008a8e53","guard":[["hasAny",["currency","name","ukraine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Ukraine":"Ukraine uses the Ukraine Hryvnia."}}},
{"id":"n-04924e9b","guard":[["has","argentina"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Argentina":"Argentina uses the Argentine Peso."}}},
{"id":"n-04ad2989","guard":[["hasAny",["arabia","currency","name","saudi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Saudi Arabia":"Saudi Arabia uses the Saudi Riyal."}}},
{"id":"n-05b31e15","guard":[["hasAny",["currency","use","vanuatu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Vanuatu use":"Vanuatu uses the Vanuatu Vatu."}}},
{"id":"n-05c5aacf","guard":[["has","libya"],["has","currency"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Libya":"Libya uses the Libyan Dinar."}}},
{"id":"n-063e92cf","guard":[["hasAny",["currency","tanzania","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Tanzania use":"Tanzania uses the Tanzanian Shilling."}}},
{"id":"n-06a07d86","guard":[["has","sudan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Sudan use":"Sudan uses the Sudanese Pound."}}},
{"id":"n-06e7d2d4","guard":[["hasAny",["currency","faroe","islands","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Faroe Islands":"Faroe Islands uses the Danish Krone."}}},
{"id":"n-0769fefb","guard":[["has","kazakhstan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Kazakhstan":"Kazakhstan uses the Tenge."}}},
{"id":"n-079734d6","guard":[["has","malaysia"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Malaysian Ringgit."]},["sense.lastWord"]],"mem":null},
{"id":"n-08c6ce28","guard":[["has","niue"],["has","currency"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Niue":"Niue uses the New Zealand Dollar."}}},
{"id":"n-08d84b53","guard":[["hasAny",["currency","kingdom","united","use"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does United Kingdom use":"United Kingdom uses the Pound Sterling."}}},
{"id":"n-0961b6b0","guard":[["has","wales"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Wales use":"Wales uses the Pound Sterlin."}}},
{"id":"n-0bcfc190","guard":[["has","futuna"],["has","currency"]],"pyramid":["render.template",{"lit":["Wallis and ",{"slot":0}," uses the CFP Franc."]},["sense.lastWord"]],"mem":null},
{"id":"n-0d8b7313","guard":[["hasAny",["belize","currency","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Belize use":"Belize uses the Belize Dollar."}}},
{"id":"n-0eb44ddf","guard":[["hasAny",["currency","moldova","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Moldova":"Moldova uses the Moldovan Leu."}}},
{"id":"n-0f8ea98b","guard":[["has","south"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of South Korea":"South Korea uses the Korean Won."}}},
{"id":"n-1043d2f7","guard":[["has","finland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Finland use":"Finland uses the Euro."}}},
{"id":"n-10f0a8ba","guard":[["has","bhutan"],["has","currency"]],"pyramid":["render.template",{"lit":["Bhutan uses the ",{"slot":0}," Ngultrum."]},["sense.lastWord"]],"mem":null},
{"id":"n-13c3740d","guard":[["hasAny",["currency","lebanon","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Lebanon use":"Lebanon uses the Lebanese Pound."}}},
{"id":"n-13c58a6e","guard":[["hasAny",["africa","currency","south","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does South Africa use":"South Africa uses the South African Rand."}}},
{"id":"n-13c7bfb8","guard":[["hasAny",["congo","currency","democratic","republic","used"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in The Democratic Republic of Congo":"The Democratic Republic of Congo uses the Franc Congolais."}}},
{"id":"n-146e3d14","guard":[["has","helena"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Saint Helena":"Saint Helena uses the St. Helena Pound."}}},
{"id":"n-15dec4a9","guard":[["has","lebanon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Lebanon use":"Lebanon uses the Lebanese Pound."}}},
{"id":"n-176e30df","guard":[["hasAny",["currency","use","wales"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Wales use":"Wales uses the Pound Sterlin."}}},
{"id":"n-17fd8152","guard":[["hasAny",["currency","name","palau"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Palau":"Palau uses the US Dollar."}}},
{"id":"n-197f6827","guard":[["hasAny",["currency","lithuania","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Lithuania":"Lithuania uses the Lithuanian Litas."}}},
{"id":"n-19aa0de4","guard":[["hasAny",["currency","east","timor","used"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in East Timor":"East Timor uses the US Dollar."}}},
{"id":"n-1a35c9d2","guard":[["hasAny",["currency","kiribati","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Kiribati":"Kiribati uses the Australian Dollar."}}},
{"id":"n-1bb49fbd","guard":[["hasAny",["currency","kazakhstan","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Kazakhstan":"Kazakhstan uses the Tenge."}}},
{"id":"n-1bd06acf","guard":[["has","turkmenistan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Turkmenistan":"Turkmenistan uses the Manat."}}},
{"id":"n-1cae5213","guard":[["has","libya"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Libyan Dinar."]},["sense.lastWord"]],"mem":null},
{"id":"n-1cd9dd52","guard":[["hasAny",["city","currency","holy","see","state","used","vatican"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Holy See (Vatican City State)":"Holy See (Vatican City State) uses the Euro."}}},
{"id":"n-1f9b5367","guard":[["hasAny",["croatia","currency","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Croatia":"Croatia uses the Croatian Kuna."}}},
{"id":"n-229c04bc","guard":[["has","cook"],["has","currency"]],"pyramid":["render.template",{"lit":["Cook ",{"slot":0}," uses the New Zealand Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-22c843ff","guard":[["has","zambia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Zambia":"Zambia uses the Zambian Kwacha."}}},
{"id":"n-22ea59d7","guard":[["has","liechtenstein"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Liechtenstein use":"Liechtenstein uses the Swiss Franc."}}},
{"id":"n-25144ea2","guard":[["has","tanzania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Tanzania use":"Tanzania uses the Tanzanian Shilling."}}},
{"id":"n-287929f6","guard":[["has","azerbaijan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Azerbaijan use":"Azerbaijan uses the Azerbaijan New Manat."}}},
{"id":"n-295bf832","guard":[["hasAny",["currency","guinea","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Guinea use":"Guinea uses the Guinea Franc."}}},
{"id":"n-2ab24cad","guard":[["hasAny",["currency","monaco","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Monaco":"Monaco uses the Euro."}}},
{"id":"n-2af28915","guard":[["hasAny",["china","currency","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in China":"China uses the Yuan Renminbi."}}},
{"id":"n-2cbc7077","guard":[["hasAny",["currency","east","timor","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in East Timor":"East Timor uses the US Dollar."}}},
{"id":"n-2dbc0ae7","guard":[["has","philippines"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Philippines":"Philippines uses the Philippine Peso."}}},
{"id":"n-2e4c498c","guard":[["has","kiribati"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Kiribati":"Kiribati uses the Australian Dollar."}}},
{"id":"n-2f073704","guard":[["has","east"],["has","used"]],"pyramid":["render.template",{"lit":["East ",{"slot":0}," uses the US Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-313377f9","guard":[["has","pitcairn"],["has","currency"]],"pyramid":["render.template",{"lit":["Pitcairn ",{"slot":0}," uses the New Zealand Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-314a6e3e","guard":[["hasAny",["currency","korea","name","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of South Korea":"South Korea uses the Korean Won."}}},
{"id":"n-31fab66b","guard":[["has","palau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Palau":"Palau uses the US Dollar."}}},
{"id":"n-33956a2a","guard":[["has","guam"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Guam":"Guam uses the US Dollar."}}},
{"id":"n-34ea2b02","guard":[["hasAny",["currency","lucia","saint","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Saint Lucia":"Saint Lucia uses the East Caribbean Dollar."}}},
{"id":"n-3518baf9","guard":[["has","greece"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Greece":"Greece uses the Euro."}}},
{"id":"n-358cea96","guard":[["hasAny",["currency","greenland","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Greenland":"Greenland uses the Danish Krone."}}},
{"id":"n-36e1f507","guard":[["hasAny",["arab","currency","emirates","name","united"]],["has","name"],["has","of"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of United Arab Emirates":"United Arab Emirates uses the Arab Emirates Dirham."}}},
{"id":"n-3705bbb7","guard":[["has","guinea"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Guinea use":"Guinea uses the Guinea Franc."}}},
{"id":"n-375b3f94","guard":[["hasAny",["currency","islands","minor","outlying","states","united","use"]],["has","currency"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does United States Minor Outlying Islands use":"United States Minor Outlying Islands uses the US Dollar."}}},
{"id":"n-3776c243","guard":[["hasAny",["currency","sahara","used","western"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Western Sahara":"Western Sahara uses the Moroccan Dirham."}}},
{"id":"n-38e03f2e","guard":[["has","ukraine"],["has","name"]],"pyramid":["render.template",{"lit":["Ukraine uses the ",{"slot":0}," Hryvnia."]},["sense.lastWord"]],"mem":null},
{"id":"n-3bdef85a","guard":[["hasAny",["currency","guam","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Guam":"Guam uses the US Dollar."}}},
{"id":"n-3d43f844","guard":[["hasAny",["currency","name","philippines"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Philippines":"Philippines uses the Philippine Peso."}}},
{"id":"n-3e260f48","guard":[["hasAny",["currency","togo","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Togo use":"Togo uses the CFA Franc BCEAO."}}},
{"id":"n-4047970a","guard":[["hasAny",["bosnia","currency","herzegovina","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Bosnia and Herzegovina":"Bosnia and Herzegovina uses the Convertible Mark."}}},
{"id":"n-40712ea7","guard":[["has","puerto"],["has","currency"]],"pyramid":["render.template",{"lit":["Puerto ",{"slot":0}," uses the US Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-42bcb382","guard":[["hasAny",["currency","turkey","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Turkey use":"Turkey uses the Turkish Lira."}}},
{"id":"n-44f3ff81","guard":[["hasAny",["currency","estonia","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Estonia":"Estonia uses the Euro."}}},
{"id":"n-4554ea15","guard":[["has","israel"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Israeli New Shekel."]},["sense.lastWord"]],"mem":null},
{"id":"n-4573a6ae","guard":[["hasAny",["currency","malta","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Malta":"Malta uses the Euro."}}},
{"id":"n-45776842","guard":[["hasAny",["currency","futuna","used","wallis"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Wallis and Futuna":"Wallis and Futuna uses the CFP Franc."}}},
{"id":"n-46466978","guard":[["hasAny",["currency","helena","saint","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Saint Helena":"Saint Helena uses the St. Helena Pound."}}},
{"id":"n-47530ab2","guard":[["has","switzerland"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Swiss Franc."]},["sense.lastWord"]],"mem":null},
{"id":"n-482c1b9a","guard":[["hasAny",["currency","iran","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Iran use":"Iran uses the Iranian Rial."}}},
{"id":"n-48340013","guard":[["has","kazakhstan"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Tenge."]},["sense.lastWord"]],"mem":null},
{"id":"n-48c55b6a","guard":[["has","lithuania"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Lithuanian Litas."]},["sense.lastWord"]],"mem":null},
{"id":"n-4b4ff49b","guard":[["hasAny",["currency","eritrea","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Eritrea use":"Eritrea uses the Eritrean Nakfa."}}},
{"id":"n-4b63b10e","guard":[["has","pitcairn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Pitcairn Islands":"Pitcairn Islands uses the New Zealand Dollar."}}},
{"id":"n-50fa3a89","guard":[["has","zambia"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Zambian Kwacha."]},["sense.lastWord"]],"mem":null},
{"id":"n-52a061ab","guard":[["has","lucia"],["has","currency"]],"pyramid":["render.template",{"lit":["Saint ",{"slot":0}," uses the East Caribbean Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-52b2d83d","guard":[["has","turkmenistan"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Manat."]},["sense.lastWord"]],"mem":null},
{"id":"n-53f7533a","guard":[["hasAny",["currency","samoa","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Samoa use":"Samoa uses the Samoan Tala."}}},
{"id":"n-5469ddde","guard":[["hasAny",["anguilla","currency","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Anguilla":"Anguilla uses the East Caribbean Dollar."}}},
{"id":"n-54d6d668","guard":[["hasAny",["bhutan","currency","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Bhutan":"Bhutan uses the Bhutan Ngultrum."}}},
{"id":"n-56ab1f58","guard":[["has","latvia"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Latvian Lats."]},["sense.lastWord"]],"mem":null},
{"id":"n-5768b293","guard":[["hasAny",["bahrain","currency","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Bahrain":"Bahrain uses the Bahraini Dinar."}}},
{"id":"n-59fdde46","guard":[["hasAny",["currency","futuna","used","wallis"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Wallis and Futuna":"Wallis and Futuna uses the CFP Franc."}}},
{"id":"n-5babe54f","guard":[["hasAny",["arab","currency","emirates","name","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of United Arab Emirates":"United Arab Emirates uses the Arab Emirates Dirham."}}},
{"id":"n-5bf287a7","guard":[["has","ecuador"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Ecuador":"Ecuador uses the Ecuador Sucre."}}},
{"id":"n-5c81dbda","guard":[["hasAny",["currency","ecuador","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Ecuador":"Ecuador uses the Ecuador Sucre."}}},
{"id":"n-5d0cf8c0","guard":[["has","russia"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Russian Ruble."]},["sense.lastWord"]],"mem":null},
{"id":"n-5d29a2d2","guard":[["has","lucia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Saint Lucia":"Saint Lucia uses the East Caribbean Dollar."}}},
{"id":"n-5d79fc64","guard":[["hasAny",["currency","name","russia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Russia":"Russia uses the Russian Ruble."}}},
{"id":"n-5f927f15","guard":[["has","bolivia"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Boliviano."]},["sense.lastWord"]],"mem":null},
{"id":"n-60159bf8","guard":[["hasAny",["currency","martinique","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Martinique":"Martinique uses the Euro."}}},
{"id":"n-62331ca6","guard":[["hasAny",["currency","israel","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Israel":"Israel uses the Israeli New Shekel."}}},
{"id":"n-62895432","guard":[["has","anguilla"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Anguilla":"Anguilla uses the East Caribbean Dollar."}}},
{"id":"n-63870ec4","guard":[["hasAny",["currency","greece","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Greece":"Greece uses the Euro."}}},
{"id":"n-638d8e0c","guard":[["hasAny",["currency","lesotho","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Lesotho":"Lesotho uses the Lesotho Loti."}}},
{"id":"n-64028a55","guard":[["hasAny",["currency","kingdom","united","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does United Kingdom use":"United Kingdom uses the Pound Sterling."}}},
{"id":"n-65cf8714","guard":[["has","angola"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Angolan Kwanza."]},["sense.lastWord"]],"mem":null},
{"id":"n-65fcea3b","guard":[["has","switzerland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Switzerland":"Switzerland uses the Swiss Franc."}}},
{"id":"n-66c32dc3","guard":[["hasAny",["british","currency","islands","use","virgin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Virgin Islands, British use":"Virgin Islands, British uses the Pound Sterling."}}},
{"id":"n-6723ff22","guard":[["has","moldova"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Moldovan Leu."]},["sense.lastWord"]],"mem":null},
{"id":"n-675d2f21","guard":[["hasAny",["cocos","currency","islands","keeling","name"]],["has","currency"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Cocos (Keeling) Islands":"Cocos (Keeling) Islands uses the Australian Dollar."}}},
{"id":"n-680acfa1","guard":[["has","iceland"],["has","currency"]],"pyramid":["render.template",{"lit":["Iceland uses the ",{"slot":0}," Krona."]},["sense.lastWord"]],"mem":null},
{"id":"n-6ac726b6","guard":[["hasAny",["currency","turkmenistan","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Turkmenistan":"Turkmenistan uses the Manat."}}},
{"id":"n-6d2f4daf","guard":[["has","guadeloupe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Guadeloupe":"Guadeloupe uses the Euro."}}},
{"id":"n-711c7131","guard":[["hasAny",["bermuda","currency","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Bermuda":"Bermuda uses the Bermudian Dollar."}}},
{"id":"n-756e0f08","guard":[["has","nicaragua"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Nicaraguan Cordoba Oro."]},["sense.lastWord"]],"mem":null},
{"id":"n-7641da48","guard":[["hasAny",["currency","namibia","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Namibia use":"Namibia uses the Namibian Dollar."}}},
{"id":"n-76dd4525","guard":[["hasAny",["currency","libya","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Libya":"Libya uses the Libyan Dinar."}}},
{"id":"n-7796e688","guard":[["has","uzbekistan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Uzbekistan":"Uzbekistan uses the Uzbekistan Sum."}}},
{"id":"n-77c761e7","guard":[["hasAny",["angola","currency","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Angola":"Angola uses the Angolan Kwanza."}}},
{"id":"n-7816ae95","guard":[["has","togo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Togo use":"Togo uses the CFA Franc BCEAO."}}},
{"id":"n-7838d5ef","guard":[["hasAny",["currency","name","uzbekistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Uzbekistan":"Uzbekistan uses the Uzbekistan Sum."}}},
{"id":"n-7b4b5ed4","guard":[["hasAny",["currency","name","puerto","rico"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Puerto Rico":"Puerto Rico uses the US Dollar."}}},
{"id":"n-7b627d91","guard":[["hasAny",["currency","name","puerto","rico"]],["has","currency"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Puerto Rico":"Puerto Rico uses the US Dollar."}}},
{"id":"n-7d80c9ed","guard":[["has","ecuador"],["has","currency"]],"pyramid":["render.template",{"lit":["Ecuador uses the ",{"slot":0}," Sucre."]},["sense.lastWord"]],"mem":null},
{"id":"n-806a09bd","guard":[["has","luxembourg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Luxembourg":"Luxembourg uses the Euro."}}},
{"id":"n-807a6378","guard":[["has","turkey"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Turkey use":"Turkey uses the Turkish Lira."}}},
{"id":"n-826d7009","guard":[["hasAny",["australia","currency","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Australia use":"Australia uses the Australian Dollar."}}},
{"id":"n-82984250","guard":[["hasAny",["currency","jan","mayen","name","svalbard"]],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Svalbard and Jan Mayen":"Svalbard and Jan Mayen uses the Norwegian Krone."}}},
{"id":"n-83b1121d","guard":[["hasAny",["currency","england","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does England use":"England uses the Pound Sterlin."}}},
{"id":"n-83b408cf","guard":[["has","nicaragua"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Nicaragua":"Nicaragua uses the Nicaraguan Cordoba Oro."}}},
{"id":"n-849ca552","guard":[["has","bhutan"],["has","currency"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Bhutan":"Bhutan uses the Bhutan Ngultrum."}}},
{"id":"n-859031bf","guard":[["has","lesotho"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Lesotho":"Lesotho uses the Lesotho Loti."}}},
{"id":"n-867f2063","guard":[["has","mauritania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Mauritania":"Mauritania uses the Mauritanian Ouguiya."}}},
{"id":"n-87c40ea5","guard":[["hasAny",["currency","heard","island","islands","mcdonald","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Heard Island and McDonald Islands use":"Heard Island and McDonald Islands uses the Australian Dollar."}}},
{"id":"n-87e99a06","guard":[["hasAny",["currency","jan","mayen","name","svalbard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Svalbard and Jan Mayen":"Svalbard and Jan Mayen uses the Norwegian Krone."}}},
{"id":"n-880f83fb","guard":[["has","malaysia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Malaysia":"Malaysia uses the Malaysian Ringgit."}}},
{"id":"n-8a3f8a67","guard":[["has","england"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does England use":"England uses the Pound Sterlin."}}},
{"id":"n-8ad7fca4","guard":[["hasAny",["costa","currency","rica","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Costa Rica use":"Costa Rica uses the Costa Rican Colon."}}},
{"id":"n-8bf5ae8c","guard":[["has","argentina"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Argentine Peso."]},["sense.lastWord"]],"mem":null},
{"id":"n-8c246ded","guard":[["hasAny",["currency","sahara","used","western"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Western Sahara":"Western Sahara uses the Moroccan Dirham."}}},
{"id":"n-8dd89bd0","guard":[["hasAny",["currency","guadeloupe","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Guadeloupe":"Guadeloupe uses the Euro."}}},
{"id":"n-8ddc765b","guard":[["hasAny",["currency","name","niue"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Niue":"Niue uses the New Zealand Dollar."}}},
{"id":"n-8fc8b4cc","guard":[["hasAny",["currency","france","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in France":"France uses the Euro."}}},
{"id":"n-90b672da","guard":[["hasAny",["argentina","currency","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Argentina":"Argentina uses the Argentine Peso."}}},
{"id":"n-919a3571","guard":[["has","australia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Australia use":"Australia uses the Australian Dollar."}}},
{"id":"n-9238f64e","guard":[["hasAny",["african","central","currency","republic","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Central African Republic use":"Central African Republic uses the CFA Franc BEAC."}}},
{"id":"n-92561101","guard":[["hasAny",["currency","peru","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Peru use":"Peru uses the Peruvian Nuevo Sol."}}},
{"id":"n-94dd973a","guard":[["hasAny",["azerbaijan","currency","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Azerbaijan use":"Azerbaijan uses the Azerbaijan New Manat."}}},
{"id":"n-94e08673","guard":[["has","sahara"],["has","currency"]],"pyramid":["render.template",{"lit":["Western ",{"slot":0}," uses the Moroccan Dirham."]},["sense.lastWord"]],"mem":null},
{"id":"n-9500c0c7","guard":[["hasAny",["cook","currency","islands","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Cook Islands":"Cook Islands uses the New Zealand Dollar."}}},
{"id":"n-953b09c1","guard":[["hasAny",["currency","liechtenstein","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Liechtenstein use":"Liechtenstein uses the Swiss Franc."}}},
{"id":"n-95a41743","guard":[["hasAny",["chile","currency","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Chile":"Chile uses the Chilean Peso."}}},
{"id":"n-992a7f3c","guard":[["has","croatia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Croatia":"Croatia uses the Croatian Kuna."}}},
{"id":"n-9a9bca0b","guard":[["hasAny",["coast","currency","ivory","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Ivory Coast use":"Ivory Coast uses the CFA Franc BCEAO."}}},
{"id":"n-9ba4408c","guard":[["has","marshall"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Marshall Islands use":"Marshall Islands uses the US Dollar."}}},
{"id":"n-9c29849a","guard":[["hasAny",["currency","lanka","sri","use"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Sri Lanka use":"Sri Lanka uses the Sri Lankan Rupee."}}},
{"id":"n-9f9421bd","guard":[["has","cook"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Cook Islands":"Cook Islands uses the New Zealand Dollar."}}},
{"id":"n-a33860d2","guard":[["has","hungary"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Hungary":"Hungary uses the Hungarian Forint."}}},
{"id":"n-a46ab78a","guard":[["hasAny",["currency","islands","minor","outlying","states","united","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does United States Minor Outlying Islands use":"United States Minor Outlying Islands uses the US Dollar."}}},
{"id":"n-a4f0960c","guard":[["has","somalia"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Somali Shilling."]},["sense.lastWord"]],"mem":null},
{"id":"n-a58bf230","guard":[["hasAny",["currency","sudan","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Sudan use":"Sudan uses the Sudanese Pound."}}},
{"id":"n-a7bed57e","guard":[["has","faroe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Faroe Islands":"Faroe Islands uses the Danish Krone."}}},
{"id":"n-a7d85b84","guard":[["has","china"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in China":"China uses the Yuan Renminbi."}}},
{"id":"n-a8406914","guard":[["has","chile"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Chilean Peso."]},["sense.lastWord"]],"mem":null},
{"id":"n-a861fdd2","guard":[["has","china"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Yuan Renminbi."]},["sense.lastWord"]],"mem":null},
{"id":"n-aa46ac1c","guard":[["has","iceland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Iceland":"Iceland uses the Iceland Krona."}}},
{"id":"n-aaf362b4","guard":[["has","hungary"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Hungarian Forint."]},["sense.lastWord"]],"mem":null},
{"id":"n-ac86bb41","guard":[["has","bahrain"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bahraini Dinar."]},["sense.lastWord"]],"mem":null},
{"id":"n-acc35643","guard":[["hasAny",["currency","name","somalia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Somalia":"Somalia uses the Somali Shilling."}}},
{"id":"n-ad1f9d38","guard":[["hasAny",["currency","name","switzerland"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Switzerland":"Switzerland uses the Swiss Franc."}}},
{"id":"n-ad36f557","guard":[["has","latvia"],["has","currency"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Latvia":"Latvia uses the Latvian Lats."}}},
{"id":"n-b0446816","guard":[["has","ukraine"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Ukraine":"Ukraine uses the Ukraine Hryvnia."}}},
{"id":"n-b2047c2b","guard":[["has","bosnia"],["has","currency"]],"pyramid":["render.template",{"lit":["Bosnia and ",{"slot":0}," uses the Convertible Mark."]},["sense.lastWord"]],"mem":null},
{"id":"n-b25c3727","guard":[["has","martinique"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Martinique":"Martinique uses the Euro."}}},
{"id":"n-b33c82fe","guard":[["has","lesotho"],["has","currency"]],"pyramid":["render.template",{"lit":["Lesotho uses the ",{"slot":0}," Loti."]},["sense.lastWord"]],"mem":null},
{"id":"n-b6c649fe","guard":[["has","barbados"],["has","currency"]],"pyramid":["render.template",{"lit":["Barbados uses the ",{"slot":0}," Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-b7e37cf8","guard":[["hasAny",["belgium","currency","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Belgium use":"Belgium uses the Euro."}}},
{"id":"n-ba800e63","guard":[["hasAny",["currency","islands","pitcairn","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Pitcairn Islands":"Pitcairn Islands uses the New Zealand Dollar."}}},
{"id":"n-badafa3b","guard":[["hasAny",["barbados","currency","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Barbados":"Barbados uses the Barbados Dollar."}}},
{"id":"n-bb6abb06","guard":[["hasAny",["currency","dominica","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Dominica":"Dominica uses the East Caribbean Dollar."}}},
{"id":"n-bc8e101b","guard":[["hasAny",["currency","georgia","islands","name","sandwich","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of South Georgia and the South Sandwich Islands":"South Georgia and the South Sandwich Islands uses the Pound Sterling."}}},
{"id":"n-bd71dc26","guard":[["hasAny",["currency","maldives","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Maldives use":"Maldives uses the Maldive Rufiyaa."}}},
{"id":"n-be62e998","guard":[["has","iran"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Iran use":"Iran uses the Iranian Rial."}}},
{"id":"n-bf9a53c7","guard":[["hasAny",["currency","india","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does India use":"India uses the Indian Rupee."}}},
{"id":"n-c0604916","guard":[["has","moldova"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Moldova":"Moldova uses the Moldovan Leu."}}},
{"id":"n-c0ac0251","guard":[["has","estonia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Estonia":"Estonia uses the Euro."}}},
{"id":"n-c368b47d","guard":[["hasAny",["currency","latvia","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Latvia":"Latvia uses the Latvian Lats."}}},
{"id":"n-c46bcffb","guard":[["hasAny",["currency","georgia","islands","name","sandwich","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of South Georgia and the South Sandwich Islands":"South Georgia and the South Sandwich Islands uses the Pound Sterling."}}},
{"id":"n-c5a0e0fb","guard":[["hasAny",["currency","luxembourg","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Luxembourg":"Luxembourg uses the Euro."}}},
{"id":"n-c742a05d","guard":[["has","peru"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Peru use":"Peru uses the Peruvian Nuevo Sol."}}},
{"id":"n-c875136f","guard":[["has","uganda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Uganda":"Uganda uses the Uganda Shilling."}}},
{"id":"n-ca390f92","guard":[["hasAny",["currency","hungary","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Hungary":"Hungary uses the Hungarian Forint."}}},
{"id":"n-cb869e62","guard":[["hasAny",["british","virgin"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Virgin Islands, British use":"Virgin Islands, British uses the Pound Sterling."}}},
{"id":"n-ccbbe2c9","guard":[["has","nigeria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Nigeria use":"Nigeria uses the Nigerian Naira."}}},
{"id":"n-cea382db","guard":[["hasAny",["africa","currency","south","use"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does South Africa use":"South Africa uses the South African Rand."}}},
{"id":"n-cecd9209","guard":[["hasAny",["currency","lanka","sri","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Sri Lanka use":"Sri Lanka uses the Sri Lankan Rupee."}}},
{"id":"n-cf6dfbf5","guard":[["hasAny",["currency","finland","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Finland use":"Finland uses the Euro."}}},
{"id":"n-d264f361","guard":[["hasAny",["bosnia","currency","herzegovina","used"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Bosnia and Herzegovina":"Bosnia and Herzegovina uses the Convertible Mark."}}},
{"id":"n-d2680530","guard":[["has","india"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does India use":"India uses the Indian Rupee."}}},
{"id":"n-d3241331","guard":[["hasAny",["currency","islands","marshall","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Marshall Islands use":"Marshall Islands uses the US Dollar."}}},
{"id":"n-d5ecfcf3","guard":[["has","lithuania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Lithuania":"Lithuania uses the Lithuanian Litas."}}},
{"id":"n-d6e6d17b","guard":[["has","malta"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Malta":"Malta uses the Euro."}}},
{"id":"n-d766635b","guard":[["has","uzbekistan"],["has","currency"]],"pyramid":["render.template",{"lit":["Uzbekistan uses the ",{"slot":0}," Sum."]},["sense.lastWord"]],"mem":null},
{"id":"n-d9119265","guard":[["has","jordan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Jordan use":"Jordan uses the Jordanian Dinar."}}},
{"id":"n-db2cdd7f","guard":[["hasAny",["city","currency","holy","see","state","used","vatican"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Holy See (Vatican City State)":"Holy See (Vatican City State) uses the Euro."}}},
{"id":"n-dbe6d87f","guard":[["has","france"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in France":"France uses the Euro."}}},
{"id":"n-dc604a2b","guard":[["has","somalia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Somalia":"Somalia uses the Somali Shilling."}}},
{"id":"n-dcff9941","guard":[["has","monaco"],["has","currency"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Monaco":"Monaco uses the Euro."}}},
{"id":"n-dd1cca13","guard":[["has","bermuda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Bermuda":"Bermuda uses the Bermudian Dollar."}}},
{"id":"n-e00e67d7","guard":[["hasAny",["african","central","currency","republic","use"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Central African Republic use":"Central African Republic uses the CFA Franc BEAC."}}},
{"id":"n-e0369927","guard":[["has","chile"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Chile":"Chile uses the Chilean Peso."}}},
{"id":"n-e0726bc7","guard":[["has","uganda"],["has","name"]],"pyramid":["render.template",{"lit":["Uganda uses the ",{"slot":0}," Shilling."]},["sense.lastWord"]],"mem":null},
{"id":"n-e0eb1f3e","guard":[["hasAny",["arabia","currency","name","saudi"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Saudi Arabia":"Saudi Arabia uses the Saudi Riyal."}}},
{"id":"n-e24b8d1d","guard":[["hasAny",["currency","name","zambia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Zambia":"Zambia uses the Zambian Kwacha."}}},
{"id":"n-e263cc1d","guard":[["has","dominica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Dominica":"Dominica uses the East Caribbean Dollar."}}},
{"id":"n-e362ca33","guard":[["has","eritrea"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Eritrea use":"Eritrea uses the Eritrean Nakfa."}}},
{"id":"n-e466b72a","guard":[["has","bolivia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Bolivia":"Bolivia uses the Boliviano."}}},
{"id":"n-e4b452fa","guard":[["has","north"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of North Korea":"North Korea uses the North Korean Won."}}},
{"id":"n-e5e84ed9","guard":[["hasAny",["currency","iceland","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Iceland":"Iceland uses the Iceland Krona."}}},
{"id":"n-e62e1adf","guard":[["has","angola"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Angola":"Angola uses the Angolan Kwanza."}}},
{"id":"n-e796dfdb","guard":[["hasAny",["bolivia","currency","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Bolivia":"Bolivia uses the Boliviano."}}},
{"id":"n-e8dc2bd9","guard":[["has","philippines"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Philippine Peso."]},["sense.lastWord"]],"mem":null},
{"id":"n-e931935b","guard":[["has","greenland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Greenland":"Greenland uses the Danish Krone."}}},
{"id":"n-e9ed61ae","guard":[["hasAny",["currency","mauritania","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Mauritania":"Mauritania uses the Mauritanian Ouguiya."}}},
{"id":"n-ea56e706","guard":[["hasAny",["currency","malaysia","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Malaysia":"Malaysia uses the Malaysian Ringgit."}}},
{"id":"n-eae6cc43","guard":[["hasAny",["coast","currency","ivory","use"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Ivory Coast use":"Ivory Coast uses the CFA Franc BCEAO."}}},
{"id":"n-eb1dc9d5","guard":[["has","barbados"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which currency is used in Barbados":"Barbados uses the Barbados Dollar."}}},
{"id":"n-ebf9c5c0","guard":[["hasAny",["currency","jordan","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Jordan use":"Jordan uses the Jordanian Dinar."}}},
{"id":"n-ec8a5c63","guard":[["has","bahrain"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Bahrain":"Bahrain uses the Bahraini Dinar."}}},
{"id":"n-ed344c1f","guard":[["has","belgium"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Belgium use":"Belgium uses the Euro."}}},
{"id":"n-eda334fd","guard":[["has","croatia"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Croatian Kuna."]},["sense.lastWord"]],"mem":null},
{"id":"n-ef811f39","guard":[["hasAny",["currency","korea","name","north"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of North Korea":"North Korea uses the North Korean Won."}}},
{"id":"n-effd49ff","guard":[["has","bermuda"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bermudian Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-f0035097","guard":[["has","belize"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Belize use":"Belize uses the Belize Dollar."}}},
{"id":"n-f321f84e","guard":[["has","israel"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Israel":"Israel uses the Israeli New Shekel."}}},
{"id":"n-f3c02fc0","guard":[["hasAny",["costa","currency","rica","use"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Costa Rica use":"Costa Rica uses the Costa Rican Colon."}}},
{"id":"n-f3d62120","guard":[["has","maldives"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Maldives use":"Maldives uses the Maldive Rufiyaa."}}},
{"id":"n-f44afe10","guard":[["hasAny",["cocos","currency","islands","keeling","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Cocos (Keeling) Islands":"Cocos (Keeling) Islands uses the Australian Dollar."}}},
{"id":"n-f6f2c4ed","guard":[["hasAny",["currency","heard","island","islands","mcdonald","use"]],["has","currency"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Heard Island and McDonald Islands use":"Heard Island and McDonald Islands uses the Australian Dollar."}}},
{"id":"n-f73c77cf","guard":[["hasAny",["currency","nicaragua","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in Nicaragua":"Nicaragua uses the Nicaraguan Cordoba Oro."}}},
{"id":"n-f87cbc33","guard":[["has","mauritania"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Mauritanian Ouguiya."]},["sense.lastWord"]],"mem":null},
{"id":"n-fa5c8ff4","guard":[["has","namibia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Namibia use":"Namibia uses the Namibian Dollar."}}},
{"id":"n-fb7d02bc","guard":[["has","faroe"],["has","currency"]],"pyramid":["render.template",{"lit":["Faroe ",{"slot":0}," uses the Danish Krone."]},["sense.lastWord"]],"mem":null},
{"id":"n-fc884e80","guard":[["has","samoa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Samoa use":"Samoa uses the Samoan Tala."}}},
{"id":"n-fcdf0637","guard":[["hasAny",["currency","nigeria","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency does Nigeria use":"Nigeria uses the Nigerian Naira."}}},
{"id":"n-fddecde0","guard":[["hasAny",["currency","name","uganda"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency of Uganda":"Uganda uses the Uganda Shilling."}}},
{"id":"n-fe4fe570","guard":[["has","vanuatu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what currency does Vanuatu use":"Vanuatu uses the Vanuatu Vatu."}}},
{"id":"n-ffb542fc","guard":[["hasAny",["congo","currency","democratic","republic","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency is used in The Democratic Republic of Congo":"The Democratic Republic of Congo uses the Franc Congolais."}}},
{"id":"n-ffc0e8fb","guard":[["has","russia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the currency of Russia":"Russia uses the Russian Ruble."}}},
{"id":"n-00143fb0","guard":[["hasAny",["kazakhstan","lower case","lowercase","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Tenge."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-01028d97","guard":[["hasAny",["all caps","capital letters","capitals","russia","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Russian Ruble."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-012e3ef9","guard":[["has","lesotho"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Loti."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-04bf8907","guard":[["has","turkmenistan"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Manat."]},["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-0810330d","guard":[["hasAny",["all caps","capital letters","capitals","latvia","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Latvian Lats."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-0b2ee16e","guard":[["hasAny",["all caps","capital letters","capitals","somalia","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Somali Shilling."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-0b639c14","guard":[["hasAny",["capitalise","capitalize","capitalize each word","moldova","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Moldovan Leu."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0d4c8c25","guard":[["hasAny",["lithuania","lower case","lowercase","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Lithuanian Litas."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0eb6eb2a","guard":[["hasAny",["all caps","capital letters","capitals","china","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Yuan Renminbi."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-13d6a86b","guard":[["hasAny",["invert case","somalia","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Somali Shilling."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-149dc45a","guard":[["has","uganda"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Shilling."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-17885048","guard":[["hasAny",["libya","lower case","lowercase","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Libyan Dinar."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-17e0a798","guard":[["hasAny",["all caps","capital letters","capitals","hungary","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Hungarian Forint."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-19fbb5d5","guard":[["has","china"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Yuan Renminbi."]},["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-1ec81f64","guard":[["has","ecuador"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sucre."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-1f491c86","guard":[["has","malaysia"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Malaysian Ringgit."]},["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-209ddfe1","guard":[["hasAny",["angola","capitalise","capitalize","capitalize each word","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Angolan Kwanza."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2ad4339c","guard":[["hasAny",["invert case","nicaragua","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Nicaraguan Cordoba Oro."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2b7ed07e","guard":[["hasAny",["lower case","lowercase","philippines","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Philippine Peso."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2c69952b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","latvia","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Latvian Lats."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-315c2a5b","guard":[["hasAny",["all caps","bahrain","capital letters","capitals","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bahraini Dinar."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-341616c5","guard":[["hasAny",["all caps","capital letters","capitals","kazakhstan","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Tenge."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-3699136f","guard":[["hasAny",["all caps","capital letters","capitals","turkmenistan","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Manat."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-3b06c962","guard":[["hasAny",["invert case","kazakhstan","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Tenge."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3b7779b4","guard":[["hasAny",["all caps","capital letters","capitals","chile","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Chilean Peso."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-3c25836a","guard":[["hasAny",["all caps","capital letters","capitals","lithuania","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Lithuanian Litas."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-3c4a7bea","guard":[["hasAny",["all caps","capital letters","capitals","philippines","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Philippine Peso."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-3c7c436f","guard":[["hasAny",["invert case","latvia","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Latvian Lats."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3d0be644","guard":[["hasAny",["lower case","lowercase","small letters","switzerland"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Swiss Franc."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3d9ea3a8","guard":[["has","barbados"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-3e93422f","guard":[["hasAny",["all caps","capital letters","capitals","mauritania","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Mauritanian Ouguiya."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-41049bc8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","switzerland","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Swiss Franc."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-41ab0b89","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","turkmenistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Manat."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-43c74ab6","guard":[["has","chile"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Chilean Peso."]},["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-48ddd40a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","china","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Yuan Renminbi."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4a017f1c","guard":[["hasAny",["bermuda","capitalise","capitalize","capitalize each word","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bermudian Dollar."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4af716d9","guard":[["hasAny",["angola","lower case","lowercase","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Angolan Kwanza."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4c561eda","guard":[["hasAny",["hungary","invert case","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Hungarian Forint."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4fdaa82e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hungary","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Hungarian Forint."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5311e950","guard":[["hasAny",["capitalise","capitalize","capitalize each word","croatia","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Croatian Kuna."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-54ea3a36","guard":[["hasAny",["capitalise","capitalize","capitalize each word","libya","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Libyan Dinar."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5a518a8a","guard":[["has","moldova"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Moldovan Leu."]},["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-5b28e7b3","guard":[["hasAny",["lower case","lowercase","russia","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Russian Ruble."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5bc74d4f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mauritania","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Mauritanian Ouguiya."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5c9dff27","guard":[["hasAny",["all caps","capital letters","capitals","libya","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Libyan Dinar."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-5cd27543","guard":[["hasAny",["bahrain","invert case","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bahraini Dinar."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5d4f621b","guard":[["hasAny",["all caps","capital letters","capitals","nicaragua","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Nicaraguan Cordoba Oro."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-60ce3b48","guard":[["hasAny",["lower case","lowercase","mauritania","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Mauritanian Ouguiya."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-631ba537","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","zambia"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Zambian Kwacha."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-63297f89","guard":[["has","uzbekistan"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sum."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-64e6f178","guard":[["hasAny",["lower case","lowercase","small letters","turkmenistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Manat."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-65d11902","guard":[["hasAny",["lower case","lowercase","moldova","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Moldovan Leu."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6a21ac01","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lithuania","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Lithuanian Litas."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6b6df086","guard":[["hasAny",["chile","lower case","lowercase","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Chilean Peso."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6d53ccc2","guard":[["hasAny",["bahrain","lower case","lowercase","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bahraini Dinar."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6e4c02b8","guard":[["hasAny",["all caps","capital letters","capitals","croatia","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Croatian Kuna."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-6e81dd21","guard":[["hasAny",["invert case","malaysia","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Malaysian Ringgit."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-71ccd8ad","guard":[["has","bermuda"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bermudian Dollar."]},["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-72c380ec","guard":[["hasAny",["bolivia","invert case","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Boliviano."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-75a67bca","guard":[["hasAny",["all caps","capital letters","capitals","israel","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Israeli New Shekel."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-76bca1b6","guard":[["has","bhutan"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Ngultrum."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-7c437386","guard":[["has","iceland"],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Krona."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-7c81b798","guard":[["hasAny",["lower case","lowercase","nicaragua","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Nicaraguan Cordoba Oro."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7e02c16f","guard":[["hasAny",["argentina","lower case","lowercase","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Argentine Peso."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7e3b7358","guard":[["has","nicaragua"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Nicaraguan Cordoba Oro."]},["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-7ea8c1f4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","russia","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Russian Ruble."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8095d3a5","guard":[["hasAny",["all caps","argentina","capital letters","capitals","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Argentine Peso."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-82e0b5b0","guard":[["hasAny",["all caps","bolivia","capital letters","capitals","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Boliviano."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-864ebe05","guard":[["hasAny",["croatia","invert case","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Croatian Kuna."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8d533cbe","guard":[["has","kiribati"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Australian Dollar."]},["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-8ed97dcf","guard":[["hasAny",["all caps","capital letters","capitals","moldova","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Moldovan Leu."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-8f7a5344","guard":[["hasAny",["lower case","lowercase","small letters","zambia"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Zambian Kwacha."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-95324eba","guard":[["hasAny",["capitalise","capitalize","capitalize each word","chile","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Chilean Peso."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-982fb20e","guard":[["hasAny",["chile","invert case","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Chilean Peso."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-98575905","guard":[["hasAny",["bermuda","invert case","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bermudian Dollar."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9e2428ec","guard":[["hasAny",["all caps","capital letters","capitals","switzerland","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Swiss Franc."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-9e8b841a","guard":[["hasAny",["invert case","swap case","toggle case","zambia"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Zambian Kwacha."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a1e5f730","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kazakhstan","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Tenge."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a52096bd","guard":[["has","mauritania"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Mauritanian Ouguiya."]},["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-a60fc30a","guard":[["hasAny",["bolivia","lower case","lowercase","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Boliviano."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a8ba20e5","guard":[["hasAny",["angola","invert case","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Angolan Kwanza."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-aa5d05c4","guard":[["hasAny",["invert case","philippines","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Philippine Peso."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-addbf173","guard":[["hasAny",["all caps","capital letters","capitals","malaysia","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Malaysian Ringgit."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b1e867f9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","somalia","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Somali Shilling."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b253de28","guard":[["hasAny",["lower case","lowercase","small letters","somalia"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Somali Shilling."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b7ea9dca","guard":[["hasAny",["capitalise","capitalize","capitalize each word","philippines","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Philippine Peso."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bdd8cc3f","guard":[["hasAny",["bermuda","lower case","lowercase","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bermudian Dollar."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c18641a8","guard":[["hasAny",["invert case","israel","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Israeli New Shekel."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c19cb6ad","guard":[["hasAny",["bolivia","capitalise","capitalize","capitalize each word","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Boliviano."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c1afed46","guard":[["hasAny",["invert case","russia","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Russian Ruble."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c3bfec8c","guard":[["hasAny",["invert case","swap case","switzerland","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Swiss Franc."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c6f50342","guard":[["has","lithuania"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Lithuanian Litas."]},["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-c9295951","guard":[["hasAny",["china","lower case","lowercase","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Yuan Renminbi."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ca78870d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","malaysia","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Malaysian Ringgit."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cd828f49","guard":[["hasAny",["all caps","bermuda","capital letters","capitals","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bermudian Dollar."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-d050ffc1","guard":[["hasAny",["bahrain","capitalise","capitalize","capitalize each word","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bahraini Dinar."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d40e92e4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nicaragua","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Nicaraguan Cordoba Oro."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d8a72eb1","guard":[["hasAny",["australia","longest","longest one","longest word"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Australian Dollar."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d92704cc","guard":[["hasAny",["argentina","invert case","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Argentine Peso."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e2c12a14","guard":[["hasAny",["latvia","lower case","lowercase","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Latvian Lats."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e3d3726f","guard":[["has","argentina"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Argentine Peso."]},["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-e4255c7f","guard":[["hasAny",["invert case","lithuania","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Lithuanian Litas."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e67e5c18","guard":[["hasAny",["all caps","capital letters","capitals","upper case","uppercase","zambia"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Zambian Kwacha."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-e7d5da9d","guard":[["hasAny",["israel","lower case","lowercase","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Israeli New Shekel."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e9a732f4","guard":[["hasAny",["lower case","lowercase","malaysia","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Malaysian Ringgit."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-eb1af903","guard":[["hasAny",["invert case","moldova","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Moldovan Leu."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ee49bfb0","guard":[["has","ukraine"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Hryvnia."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-f0cdc19a","guard":[["hasAny",["invert case","mauritania","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Mauritanian Ouguiya."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f1bbc2e5","guard":[["hasAny",["hungary","lower case","lowercase","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Hungarian Forint."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f25fad10","guard":[["hasAny",["capitalise","capitalize","capitalize each word","israel","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Israeli New Shekel."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f27620f9","guard":[["hasAny",["croatia","lower case","lowercase","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Croatian Kuna."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f3cdb516","guard":[["has","angola"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Angolan Kwanza."]},["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-f448a8ec","guard":[["hasAny",["argentina","capitalise","capitalize","capitalize each word","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Argentine Peso."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f4f24e29","guard":[["hasAny",["all caps","angola","capital letters","capitals","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Angolan Kwanza."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f620ae9b","guard":[["hasAny",["invert case","swap case","toggle case","turkmenistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Manat."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f8b53a13","guard":[["hasAny",["invert case","libya","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Libyan Dinar."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-fc460b9c","guard":[["hasAny",["china","invert case","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Yuan Renminbi."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-00b89634","guard":[["hasAny",["iceland","invert case","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Krona."]},["transform.swapCase",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-0157c1d5","guard":[["hasAny",["element","greenland","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Danish Krone."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-028b5f4d","guard":[["has","iceland"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Krona."]},["sense.after",{"lit":"in"}],["sense.lastWord"]],"mem":null},
{"id":"n-03cdc573","guard":[["hasAny",["element","item number","liechtenstein","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Swiss Franc."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-054695ff","guard":[["hasAny",["element","faroe","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," Islands uses the Danish Krone."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-056ea7b9","guard":[["hasAny",["each word","philippines","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Philippine Peso."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-069a1470","guard":[["hasAny",["element","item number","kingdom","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["United ",{"slot":0}," uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-080e5d2e","guard":[["hasAny",["invert case","lesotho","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Loti."]},["transform.swapCase",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-095e2d84","guard":[["hasAny",["barbados","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Barbados Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0aa98ae6","guard":[["hasAny",["each word","moldova","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Moldovan Leu."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0ae1ee63","guard":[["hasAny",["azerbaijan","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Azerbaijan New Manat."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-0b8b3fca","guard":[["hasAny",["each word","mauritania","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Mauritanian Ouguiya."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0d00a10f","guard":[["hasAny",["element","item number","nth","position","somalia"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Somali Shilling."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-0d77ad5d","guard":[["hasAny",["all caps","barbados","capital letters","capitals","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["transform.upper",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-103cd95a","guard":[["hasAny",["element","item number","nth","position","sudan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Sudanese Pound."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-103fdf7a","guard":[["hasAny",["element","item number","nth","position","switzerland"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Swiss Franc."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-12a933a9","guard":[["hasAny",["element","israel","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Israeli New Shekel."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-14655b69","guard":[["hasAny",["each word","hungary","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Hungarian Forint."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-18e6110a","guard":[["hasAny",["bermuda","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bermudian Dollar."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1942c10b","guard":[["hasAny",["bhutan","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bhutan Ngultrum."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1d1c9fc7","guard":[["hasAny",["all caps","capital letters","capitals","upper case","uppercase","uzbekistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sum."]},["transform.upper",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-1f594b64","guard":[["hasAny",["each word","split into words","zambia"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Zambian Kwacha."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1faea9cc","guard":[["hasAny",["element","item number","liechtenstein","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Swiss Franc."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-1fd34fda","guard":[["hasAny",["coast","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["Ivory ",{"slot":0}," uses the CFA Franc BCEAO."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-21a425fd","guard":[["hasAny",["element","item number","lithuania","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Lithuanian Litas."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-22adc80c","guard":[["hasAny",["element","item number","nth","philippines","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Philippine Peso."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-249839b4","guard":[["hasAny",["all caps","capital letters","capitals","lesotho","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Loti."]},["transform.upper",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-24e60ffa","guard":[["hasAny",["ecuador","lower case","lowercase","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sucre."]},["transform.lower",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-27319d4a","guard":[["hasAny",["element","item number","kingdom","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," Kingdom uses the Pound Sterling."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-27c7bd1b","guard":[["hasAny",["angola","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Angolan Kwanza."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2a08c56e","guard":[["hasAny",["china","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Yuan Renminbi."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2b0f0eef","guard":[["hasAny",["barbados","invert case","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["transform.swapCase",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-2b8dbb78","guard":[["hasAny",["element","item number","nth","peru","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Peruvian Nuevo Sol."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2dadf328","guard":[["hasAny",["helena","lower case","lowercase","small letters"]],["has","used"]],"pyramid":["render.template",{"lit":["Saint ",{"slot":0}," uses the St. ",{"slot":1}," Pound."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2e95a5ff","guard":[["hasAny",["all caps","bhutan","capital letters","capitals","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Ngultrum."]},["transform.upper",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-2f2a20f3","guard":[["hasAny",["belize","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["Belize uses the ",{"slot":0}," Dollar."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2f9efb6b","guard":[["hasAny",["element","guinea","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["Guinea uses the ",{"slot":0}," Franc."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-321f8066","guard":[["hasAny",["china","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Yuan Renminbi."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-32d76ea1","guard":[["hasAny",["element","india","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Indian Rupee."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-33de9367","guard":[["hasAny",["all caps","capital letters","capitals","uganda","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Shilling."]},["transform.upper",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-34a7c5c5","guard":[["hasAny",["element","item number","namibia","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Namibian Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-36701117","guard":[["hasAny",["element","item number","lucia","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," Lucia uses the East Caribbean Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-38eafa09","guard":[["hasAny",["bermuda","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bermudian Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3a5e2ad4","guard":[["hasAny",["element","item number","lebanon","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Lebanese Pound."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3aee4385","guard":[["hasAny",["element","item number","kazakhstan","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Tenge."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3f9d33f3","guard":[["hasAny",["element","item number","namibia","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Namibian Dollar."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4326e383","guard":[["hasAny",["element","item number","nth","position","vanuatu"]],["has","currency"]],"pyramid":["render.template",{"lit":["Vanuatu uses the ",{"slot":0}," Vatu."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-44556f59","guard":[["hasAny",["each word","israel","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Israeli New Shekel."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-450bc5fa","guard":[["hasAny",["each word","libya","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Libyan Dinar."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4a354143","guard":[["hasAny",["bosnia","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and Herzegovina uses the Convertible Mark."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4aa6f4a9","guard":[["hasAny",["each word","somalia","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Somali Shilling."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4d2cfde2","guard":[["hasAny",["element","item number","jordan","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Jordanian Dinar."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-4defd46a","guard":[["hasAny",["belize","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Belize Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-4e6e3611","guard":[["hasAny",["each word","somalia","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Somali Shilling."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4ea4b93d","guard":[["hasAny",["each word","philippines","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Philippine Peso."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4f141cdd","guard":[["hasAny",["australia","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Australian Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-4fb657cd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ecuador","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sucre."]},["transform.title",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-50ca789c","guard":[["hasAny",["lesotho","lower case","lowercase","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Loti."]},["transform.lower",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-52cc6e3e","guard":[["hasAny",["element","item number","nth","position","zambia"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Zambian Kwacha."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-55c4e68f","guard":[["hasAny",["barbados","lower case","lowercase","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["transform.lower",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-577c3f28","guard":[["hasAny",["australia","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Australian Dollar."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-584ea881","guard":[["hasAny",["element","item number","nth","position","tanzania"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Tanzanian Shilling."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-5ac5ecf1","guard":[["hasAny",["coast","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," Coast uses the CFA Franc BCEAO."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-5af97578","guard":[["hasAny",["element","guinea","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Guinea Franc."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-5b1b6f21","guard":[["hasAny",["bermuda","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bermudian Dollar."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5beb1c86","guard":[["hasAny",["element","item number","nth","position","samoa"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Samoan Tala."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-5d80fcb5","guard":[["hasAny",["element","item number","libya","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Libyan Dinar."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5e56c01a","guard":[["hasAny",["element","item number","nth","position","turkmenistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Manat."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6100e360","guard":[["hasAny",["each word","kazakhstan","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Tenge."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-632c11df","guard":[["hasAny",["element","item number","nth","position","turkey"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Turkish Lira."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-64ef5461","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","ukraine"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Hryvnia."]},["transform.title",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-66245e33","guard":[["hasAny",["all caps","capital letters","capitals","iceland","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Krona."]},["transform.upper",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-685ee72c","guard":[["hasAny",["bhutan","invert case","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Ngultrum."]},["transform.swapCase",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-69e49791","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","uzbekistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sum."]},["transform.title",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-6ccad340","guard":[["hasAny",["element","item number","maldives","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Maldive Rufiyaa."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-6cfaa8c7","guard":[["hasAny",["each word","libya","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Libyan Dinar."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-72f7c6a9","guard":[["hasAny",["each word","russia","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Russian Ruble."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-77dc21a1","guard":[["hasAny",["element","hungary","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Hungarian Forint."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-798a240b","guard":[["hasAny",["element","item number","nth","position","uganda"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Uganda Shilling."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7a64c3d1","guard":[["hasAny",["croatia","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Croatian Kuna."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7a7bb96a","guard":[["hasAny",["each word","moldova","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Moldovan Leu."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7b17cbd4","guard":[["hasAny",["anguilla","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the East Caribbean Dollar."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7c573a85","guard":[["hasAny",["bhutan","capitalise","capitalize","capitalize each word","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Ngultrum."]},["transform.title",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-7d964507","guard":[["hasAny",["element","item number","marshall","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," Islands uses the US Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-7e49d7ee","guard":[["hasAny",["invert case","swap case","toggle case","uganda"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Shilling."]},["transform.swapCase",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-7f36e2ab","guard":[["hasAny",["element","item number","nth","position","russia"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Russian Ruble."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-818ab33a","guard":[["hasAny",["lower case","lowercase","small letters","uganda"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Shilling."]},["transform.lower",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-82f2d5c0","guard":[["hasAny",["bolivia","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Boliviano."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8321ed2e","guard":[["hasAny",["argentina","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Argentine Peso."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-843c665e","guard":[["hasAny",["each word","split into words","turkmenistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Manat."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-84a083c5","guard":[["has","barbados"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["sense.after",{"lit":"in"}],["sense.lastWord"]],"mem":null},
{"id":"n-85031abf","guard":[["hasAny",["chile","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Chilean Peso."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8513d35c","guard":[["hasAny",["lower case","lowercase","small letters","ukraine"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Hryvnia."]},["transform.lower",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-858ce589","guard":[["hasAny",["bahrain","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bahraini Dinar."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-85f55da0","guard":[["hasAny",["each word","israel","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Israeli New Shekel."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-87e2209d","guard":[["hasAny",["ecuador","invert case","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sucre."]},["transform.swapCase",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-87e57362","guard":[["hasAny",["element","futuna","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and Futuna uses the CFP Franc."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-89a3ad9f","guard":[["hasAny",["element","item number","latvia","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Latvian Lats."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8ea9ba2b","guard":[["hasAny",["angola","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Angolan Kwanza."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8f1021a0","guard":[["hasAny",["each word","russia","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Russian Ruble."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8f33a94c","guard":[["hasAny",["element","item number","nth","peru","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Peruvian Nuevo Sol."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-8f74b90f","guard":[["hasAny",["delete","niue","remove","strip out","without"]],["has","currency"]],"pyramid":["render.str",["transform.remove",{"lit":"New Zealand Dollar"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-8fe3410b","guard":[["hasAny",["invert case","swap case","toggle case","ukraine"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Hryvnia."]},["transform.swapCase",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-9020733b","guard":[["hasAny",["element","india","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Indian Rupee."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-92cabc93","guard":[["hasAny",["china","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Yuan Renminbi."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-964d6fda","guard":[["hasAny",["bolivia","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Boliviano."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-96ab545a","guard":[["hasAny",["cocos","delete","remove","strip out","without"]],["has","currency"]],"pyramid":["render.str",["transform.remove",{"lit":"Australian Dollar"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-9773468e","guard":[["hasAny",["element","item number","nigeria","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Nigerian Naira."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-98868099","guard":[["hasAny",["element","item number","nth","position","uzbekistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Uzbekistan Sum."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9a341495","guard":[["hasAny",["each word","malaysia","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Malaysian Ringgit."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9b0e342e","guard":[["hasAny",["barbados","capitalise","capitalize","capitalize each word","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["transform.title",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-9c4306af","guard":[["hasAny",["element","item number","maldives","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Maldive Rufiyaa."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9ed104e0","guard":[["hasAny",["each word","nicaragua","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Nicaraguan Cordoba Oro."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9efc4bb0","guard":[["hasAny",["argentina","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Argentine Peso."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a297bf34","guard":[["hasAny",["element","israel","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Israeli New Shekel."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a2f7bd38","guard":[["hasAny",["element","item number","nth","position","switzerland"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Swiss Franc."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a39b4c53","guard":[["hasAny",["croatia","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Croatian Kuna."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a4bb605c","guard":[["hasAny",["croatia","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Croatian Kuna."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a4c79dbf","guard":[["hasAny",["iceland","lower case","lowercase","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Krona."]},["transform.lower",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-a6c9701a","guard":[["hasAny",["bolivia","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Boliviano."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a81b1d5d","guard":[["hasAny",["element","item number","marshall","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["Marshall ",{"slot":0}," uses the US Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a91c6b62","guard":[["hasAny",["bahrain","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bahraini Dinar."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ab34bc56","guard":[["hasAny",["all caps","capital letters","capitals","ecuador","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sucre."]},["transform.upper",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-b16c9c9e","guard":[["hasAny",["east","element","item number","nth","position"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," Timor uses the US Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b2184a31","guard":[["hasAny",["element","item number","mauritania","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Mauritanian Ouguiya."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b234b520","guard":[["hasAny",["azerbaijan","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["Azerbaijan uses the ",{"slot":0}," New Manat."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b2f4b465","guard":[["hasAny",["element","item number","nth","position","samoa"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Samoan Tala."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b301a59f","guard":[["hasAny",["each word","split into words","switzerland"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Swiss Franc."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b45194de","guard":[["hasAny",["each word","lithuania","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Lithuanian Litas."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b4537c76","guard":[["hasAny",["element","eritrea","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Eritrean Nakfa."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-b5898842","guard":[["hasAny",["capitalise","capitalize","capitalize each word","iceland","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Krona."]},["transform.title",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-b7c5bb6a","guard":[["hasAny",["element","item number","niue","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the New Zealand Dollar."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b7e76891","guard":[["hasAny",["element","item number","jordan","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Jordanian Dinar."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b8ae2ae8","guard":[["hasAny",["element","item number","moldova","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Moldovan Leu."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b93f08ad","guard":[["hasAny",["each word","hungary","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Hungarian Forint."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b956e5ac","guard":[["hasAny",["element","item number","malaysia","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Malaysian Ringgit."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b961d7b1","guard":[["hasAny",["each word","split into words","zambia"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Zambian Kwacha."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bd346735","guard":[["hasAny",["element","item number","nicaragua","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Nicaraguan Cordoba Oro."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c032dc9b","guard":[["hasAny",["element","item number","nth","position","zambia"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Zambian Kwacha."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c19c1433","guard":[["hasAny",["invert case","swap case","toggle case","uzbekistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sum."]},["transform.swapCase",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-c3ccec28","guard":[["hasAny",["element","item number","nigeria","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Nigerian Naira."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c4b0a80f","guard":[["hasAny",["element","item number","nth","position","tanzania"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Tanzanian Shilling."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c4fdbcf3","guard":[["hasAny",["each word","mauritania","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Mauritanian Ouguiya."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c578808a","guard":[["hasAny",["each word","latvia","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Latvian Lats."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c5b85d7e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","uganda"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Shilling."]},["transform.title",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-c5cec2f4","guard":[["hasAny",["each word","split into words","turkmenistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Manat."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c65baee9","guard":[["hasAny",["ecuador","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Ecuador Sucre."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c797d6dc","guard":[["hasAny",["croatia","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Croatian Kuna."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c7f0409e","guard":[["hasAny",["each word","latvia","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Latvian Lats."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c8523d0d","guard":[["hasAny",["element","iran","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Iranian Rial."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-c89b79e8","guard":[["hasAny",["element","item number","nth","position","turkey"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Turkish Lira."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c94e029a","guard":[["hasAny",["element","iceland","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Iceland Krona."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-cb047586","guard":[["hasAny",["each word","kazakhstan","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Tenge."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cbdc1e8d","guard":[["hasAny",["element","iran","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Iranian Rial."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-cd7e0274","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lesotho","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Loti."]},["transform.title",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-cef5ea39","guard":[["hasAny",["each word","nicaragua","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Nicaraguan Cordoba Oro."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cf3d87a0","guard":[["hasAny",["element","item number","nth","position","russia"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Russian Ruble."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d01581ff","guard":[["hasAny",["delete","remove","strip out","switzerland","without"]],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"Swiss Franc"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-d28fb097","guard":[["hasAny",["element","item number","nth","position","ukraine"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Ukraine Hryvnia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d3df06f2","guard":[["hasAny",["all caps","capital letters","capitals","ukraine","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Hryvnia."]},["transform.upper",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-d608da9d","guard":[["hasAny",["each word","malaysia","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Malaysian Ringgit."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d6e73086","guard":[["hasAny",["delete","kiribati","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Australian Dollar"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-d73f65c7","guard":[["hasAny",["anguilla","delete","remove","strip out","without"]],["has","currency"]],"pyramid":["render.str",["transform.remove",{"lit":"East Caribbean Dollar"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-d882c315","guard":[["hasAny",["argentina","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Argentine Peso."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d935a8cd","guard":[["hasAny",["lower case","lowercase","small letters","uzbekistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sum."]},["transform.lower",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-d98c653c","guard":[["hasAny",["element","item number","latvia","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Latvian Lats."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d9ff859c","guard":[["hasAny",["element","item number","lesotho","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Lesotho Loti."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dafd3236","guard":[["hasAny",["element","item number","kazakhstan","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Tenge."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ddfc698a","guard":[["hasAny",["element","item number","libya","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Libyan Dinar."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-de0f7fb9","guard":[["hasAny",["element","item number","nth","position","somalia"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Somali Shilling."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-de516c6e","guard":[["hasAny",["each word","lithuania","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Lithuanian Litas."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-de648bc6","guard":[["hasAny",["element","item number","lebanon","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Lebanese Pound."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-e0e8243a","guard":[["hasAny",["element","item number","nth","philippines","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Philippine Peso."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e64b0323","guard":[["hasAny",["element","item number","nth","position","vanuatu"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Vanuatu Vatu."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-e7c26187","guard":[["hasAny",["element","item number","nth","position","puerto"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," Rico uses the US Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e848a3ab","guard":[["hasAny",["element","hungary","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Hungarian Forint."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-eaded75b","guard":[["hasAny",["bolivia","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Boliviano."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ebe10914","guard":[["hasAny",["element","item number","nth","position","sudan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Sudanese Pound."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ec1782f8","guard":[["has","ecuador"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sucre."]},["sense.after",{"lit":"in"}],["sense.lastWord"]],"mem":null},
{"id":"n-f03d5620","guard":[["hasAny",["bhutan","lower case","lowercase","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Ngultrum."]},["transform.lower",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-f1747c9f","guard":[["hasAny",["bahrain","each word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bahraini Dinar."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f29a3830","guard":[["hasAny",["chile","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Chilean Peso."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f3378fb6","guard":[["hasAny",["bahrain","each word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Bahraini Dinar."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f59c7d3a","guard":[["hasAny",["element","item number","kiribati","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Australian Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f5e0c5b7","guard":[["hasAny",["each word","split into words","switzerland"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Swiss Franc."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f9affcae","guard":[["hasAny",["element","eritrea","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Eritrean Nakfa."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fa5814da","guard":[["hasAny",["delete","georgia","remove","strip out","without"]],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"Pound Sterling"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-fad7e85d","guard":[["hasAny",["chile","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Chilean Peso."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fd23fb65","guard":[["hasAny",["element","item number","niue","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the New Zealand Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fe76cd5f","guard":[["hasAny",["element","item number","nth","position","sahara"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," Sahara uses the Moroccan Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fe80ac84","guard":[["hasAny",["element","item number","nth","position","togo"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the CFA Franc BCEAO."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ff209000","guard":[["hasAny",["element","item number","nth","position","togo"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the CFA Franc BCEAO."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ffed016e","guard":[["hasAny",["angola","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the Angolan Kwanza."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0162507d","guard":[["hasAny",["bhutan","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Ngultrum."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-01eec720","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Svalbard and ",{"slot":0}," ",{"slot":1}," uses the Norwegian Krone."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-0dc4a471","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," and Jan ",{"slot":1}," uses the Norwegian Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-111731f1","guard":[["hasAny",["element","item number","nth","position","uganda"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Shilling."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-151d706a","guard":[["hasAny",["each word","split into words","uzbekistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sum."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-25df60a5","guard":[["hasAny",["each word","ecuador","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sucre."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-2dadf1dc","guard":[["hasAny",["element","item number","nth","position","sahara"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Moroccan Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-30be1776","guard":[["hasAny",["bosnia","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," uses the Convertible Mark."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-350cc633","guard":[["hasAny",["barbados","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-3b5154cb","guard":[["hasAny",["congo","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," Republic of ",{"slot":1}," uses the Franc Congolais."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-3f2af04a","guard":[["hasAny",["element","item number","nth","position","uganda"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Shilling."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-3f836105","guard":[["hasAny",["each word","split into words","uganda"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Shilling."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-496b1ec5","guard":[["hasAny",["congo","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["The Democratic ",{"slot":0}," of ",{"slot":1}," uses the Franc Congolais."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-4fd7d6fe","guard":[["hasAny",["element","item number","lucia","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the East Caribbean Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-5083485d","guard":[["hasAny",["each word","iceland","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Krona."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-529cac02","guard":[["hasAny",["cocos","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," (Keeling) ",{"slot":1}," uses the Australian Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-5575d76a","guard":[["hasAny",["element","helena","item number","nth","position"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the St. Helena Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-5f298502","guard":[["hasAny",["element","item number","nth","position","uzbekistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sum."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-638e8c5c","guard":[["hasAny",["element","iceland","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Krona."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-67f1ccb2","guard":[["hasAny",["cocos","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["Cocos (",{"slot":0},") ",{"slot":1}," uses the Australian Dollar."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-6cde9f46","guard":[["hasAny",["each word","lesotho","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Loti."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-6d01eeb7","guard":[["hasAny",["element","item number","nth","position","puerto"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the US Dollar."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-70df966f","guard":[["hasAny",["element","item number","north","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the North Korean Won."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-78ee1853","guard":[["hasAny",["each word","ecuador","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sucre."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-7a5cbedb","guard":[["hasAny",["each word","iceland","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Krona."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-83124a02","guard":[["hasAny",["each word","split into words","ukraine"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Hryvnia."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-85b1cee2","guard":[["hasAny",["element","item number","lesotho","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Loti."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-86ecba8f","guard":[["hasAny",["element","item number","nth","position","uzbekistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sum."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-88221896","guard":[["hasAny",["element","item number","nth","position","ukraine"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Hryvnia."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-8862acad","guard":[["hasAny",["bhutan","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Ngultrum."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-8ed4ed5f","guard":[["hasAny",["element","futuna","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," uses the CFP Franc."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-a33ee6a6","guard":[["hasAny",["each word","split into words","ukraine"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Hryvnia."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-a7e4290f","guard":[["hasAny",["element","item number","lesotho","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Loti."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-a979a042","guard":[["hasAny",["each word","split into words","uganda"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Shilling."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-b30efd2e","guard":[["hasAny",["barbados","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-b4a93c46","guard":[["hasAny",["element","item number","north","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["North ",{"slot":0}," uses the ",{"slot":1}," Korean Won."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b609e4d1","guard":[["hasAny",["bhutan","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Ngultrum."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-bb9a8715","guard":[["hasAny",["each word","lesotho","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Loti."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-c5d76806","guard":[["hasAny",["barbados","each word","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-c8ca23cf","guard":[["hasAny",["element","item number","nth","position","ukraine"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Hryvnia."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-cc1bfb9b","guard":[["hasAny",["arabia","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Saudi ",{"slot":0}," uses the ",{"slot":1}," Riyal."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d3929a86","guard":[["hasAny",["arabia","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Saudi Riyal."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-ef344eda","guard":[["hasAny",["element","faroe","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Danish Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-f2a22960","guard":[["hasAny",["each word","split into words","uzbekistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sum."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-fc0c0d19","guard":[["hasAny",["bhutan","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Ngultrum."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-fde8f094","guard":[["hasAny",["ecuador","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sucre."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-00fb5598","guard":[["hasAny",["ecuador","element","invert case","item number","nth","position","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sucre."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-06e8c8f2","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","position","ukraine","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Hryvnia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-107ffc2e","guard":[["hasAny",["element","invert case","item number","nth","position","sahara","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Moroccan Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-142cd978","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","uganda"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Shilling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-14660385","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","uganda"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Shilling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-18ed9b25","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","lesotho","nth","position","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Loti."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-1effb104","guard":[["hasAny",["all caps","capital letters","capitals","ecuador","element","item number","nth","position","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sucre."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-244cd587","guard":[["hasAny",["element","item number","lower case","lowercase","lucia","nth","position","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the East Caribbean Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2451de8d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ecuador","element","item number","nth","position","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sucre."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2ba511d7","guard":[["hasAny",["bhutan","element","invert case","item number","nth","position","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Ngultrum."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2ff3c402","guard":[["hasAny",["element","helena","item number","nth","position"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the St. ",{"slot":2}," Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-3412e1f4","guard":[["hasAny",["azerbaijan","element","item number","longest","longest one","longest word","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," New Manat."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3e2d70cd","guard":[["hasAny",["element","faroe","invert case","item number","nth","position","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Danish Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-41da7bc5","guard":[["hasAny",["ecuador","element","item number","lower case","lowercase","nth","position","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sucre."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-45e82e66","guard":[["hasAny",["element","iceland","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Krona."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-4743daab","guard":[["hasAny",["all caps","barbados","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-47b7bc50","guard":[["hasAny",["element","invert case","item number","nth","position","swap case","toggle case","ukraine"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Hryvnia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-487b16fc","guard":[["hasAny",["all caps","capital letters","capitals","element","iceland","item number","nth","position","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Krona."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-499071ec","guard":[["hasAny",["all caps","capital letters","capitals","element","futuna","item number","nth","position","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," uses the CFP Franc."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-4b1b4b6c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","futuna","item number","nth","position","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," uses the CFP Franc."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-600ec787","guard":[["hasAny",["element","futuna","invert case","item number","nth","position","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," uses the CFP Franc."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6bbad0bc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","uzbekistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sum."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6e68d988","guard":[["hasAny",["barbados","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6f8f038d","guard":[["hasAny",["bosnia","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," uses the Convertible Mark."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-71e2de11","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","sahara","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Moroccan Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-722e7b8b","guard":[["hasAny",["all caps","bosnia","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," uses the Convertible Mark."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-73b484bd","guard":[["hasAny",["azerbaijan","element","item number","longest","longest one","longest word","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," New Manat."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7bc7eb8e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","lesotho","nth","position","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Loti."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7c81aed9","guard":[["hasAny",["element","futuna","item number","lower case","lowercase","nth","position","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," uses the CFP Franc."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7ca76a57","guard":[["hasAny",["barbados","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-8151f35e","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","position","uganda","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Shilling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-8354be0e","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","position","sahara","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Moroccan Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-8a2ee186","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","ukraine"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Hryvnia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-95943fa2","guard":[["hasAny",["all caps","bhutan","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Ngultrum."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-95b48da5","guard":[["hasAny",["element","helena","item number","lower case","lowercase","nth","position","small letters"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," Helena uses the St. ",{"slot":1}," Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9d5c4d18","guard":[["hasAny",["barbados","element","invert case","item number","nth","position","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9f3f038e","guard":[["hasAny",["ecuador","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sucre."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"in"}]],"mem":null},
{"id":"n-9f5257ef","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","uzbekistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sum."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a28be432","guard":[["hasAny",["bosnia","element","item number","lower case","lowercase","nth","position","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," uses the Convertible Mark."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a5287bab","guard":[["hasAny",["bosnia","element","item number","longest","longest one","longest word","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," uses the Convertible Mark."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a606b148","guard":[["hasAny",["all caps","capital letters","capitals","element","faroe","item number","nth","position","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Danish Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b200bb01","guard":[["hasAny",["element","item number","lesotho","lower case","lowercase","nth","position","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Loti."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b54752b5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","ukraine"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Hryvnia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c2e531f6","guard":[["hasAny",["element","iceland","invert case","item number","nth","position","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Krona."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c7fb9479","guard":[["hasAny",["element","invert case","item number","nth","position","swap case","toggle case","uganda"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Shilling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ccc1bbd7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","lucia","nth","position","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the East Caribbean Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cccab535","guard":[["hasAny",["bosnia","element","invert case","item number","nth","position","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," uses the Convertible Mark."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d5a41463","guard":[["hasAny",["bhutan","element","item number","lower case","lowercase","nth","position","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Ngultrum."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d8153f50","guard":[["hasAny",["element","invert case","item number","nth","position","swap case","toggle case","uzbekistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sum."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d94ecae0","guard":[["hasAny",["element","invert case","item number","lesotho","nth","position","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Loti."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-de30f8e1","guard":[["hasAny",["element","iceland","item number","lower case","lowercase","nth","position","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Krona."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-df56d00b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","faroe","item number","nth","position","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Danish Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e27c1f27","guard":[["hasAny",["barbados","element","item number","lower case","lowercase","nth","position","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e545c373","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","sahara","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Moroccan Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e75c2ec1","guard":[["hasAny",["bhutan","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Ngultrum."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ea2cbe79","guard":[["hasAny",["element","faroe","item number","lower case","lowercase","nth","position","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Danish Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f15ab699","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","iceland","item number","nth","position","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Krona."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f59b7456","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","position","upper case","uppercase","uzbekistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sum."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f645a34e","guard":[["hasAny",["element","invert case","item number","lucia","nth","position","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the East Caribbean Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f9279441","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","lucia","nth","position","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the East Caribbean Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-012e85af","guard":[["hasAny",["costa","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," Rica uses the ",{"slot":1}," Rican Colon."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-03468c02","guard":[["hasAny",["african","element","item number","nth","position"]],["has","does"]],"pyramid":["render.template",{"lit":[{"slot":0}," African ",{"slot":1}," uses the CFA Franc BEAC."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-03c29b74","guard":[["hasAny",["arabia","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Arabia uses the ",{"slot":1}," Riyal."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-09633c39","guard":[["hasAny",["barbados","each word","element","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0993fb20","guard":[["hasAny",["all caps","capital letters","capitals","element","helena","item number","nth","position","upper case","uppercase"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the St. ",{"slot":2}," Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-0a375c69","guard":[["hasAny",["element","item number","nth","position","uzbekistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sum."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0b346816","guard":[["hasAny",["element","item number","north","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," Korea uses the ",{"slot":1}," Korean Won."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-0b7913e4","guard":[["hasAny",["each word","element","item number","nth","position","split into words","ukraine"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Hryvnia."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0f52224b","guard":[["hasAny",["british","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," Islands, ",{"slot":1}," uses the Pound Sterling."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-12c57408","guard":[["hasAny",["africa","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the South African Rand."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1aed8ad6","guard":[["hasAny",["african","element","item number","nth","position"]],["has","does"]],"pyramid":["render.template",{"lit":["Central ",{"slot":0}," ",{"slot":1}," uses the CFA Franc BEAC."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1b5b18a3","guard":[["hasAny",["coast","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the CFA Franc BCEAO."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1cf1494d","guard":[["hasAny",["element","item number","lesotho","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Loti."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1e256dc5","guard":[["hasAny",["element","helena","invert case","item number","nth","position","swap case","toggle case"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the St. ",{"slot":2}," Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-20a8cfa2","guard":[["hasAny",["each word","element","item number","lesotho","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Loti."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-21526d55","guard":[["hasAny",["azerbaijan","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," New Manat."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-22d159e2","guard":[["hasAny",["each word","element","faroe","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Danish Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2966b8ff","guard":[["hasAny",["each word","element","item number","nth","position","split into words","uzbekistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sum."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2986fb17","guard":[["hasAny",["element","item number","lesotho","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Loti."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2b61d4cd","guard":[["hasAny",["arab","element","item number","lower case","lowercase","nth","position","small letters"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":["United ",{"slot":0}," ",{"slot":1}," uses the Arab ",{"slot":2}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2c70eefe","guard":[["hasAny",["each word","ecuador","element","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sucre."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2d8103a7","guard":[["hasAny",["bhutan","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Ngultrum."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2dd6c70e","guard":[["hasAny",["bhutan","each word","element","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Ngultrum."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2e308c94","guard":[["hasAny",["africa","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["South ",{"slot":0}," uses the ",{"slot":1}," African Rand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2f336668","guard":[["hasAny",["cocos","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," (",{"slot":1},") Islands uses the Australian Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3c766d0f","guard":[["hasAny",["element","item number","lanka","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["Sri ",{"slot":0}," uses the ",{"slot":1}," Lankan Rupee."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3d5c3eae","guard":[["hasAny",["bosnia","each word","element","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," uses the Convertible Mark."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3d9dcdb7","guard":[["hasAny",["african","element","item number","nth","position"]],["has","does"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Republic uses the CFA Franc BEAC."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3e706f48","guard":[["hasAny",["belize","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3e862813","guard":[["hasAny",["element","item number","nth","position","uzbekistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sum."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-405d7f59","guard":[["hasAny",["each word","element","item number","nth","position","split into words","uganda"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Shilling."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4064f727","guard":[["hasAny",["each word","element","item number","nth","position","split into words","uzbekistan"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sum."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-454a119e","guard":[["hasAny",["element","item number","kingdom","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-534037f0","guard":[["hasAny",["element","iceland","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Krona."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-58b36edb","guard":[["hasAny",["belize","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-5e508ba3","guard":[["hasAny",["coast","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the CFA Franc BCEAO."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5e935744","guard":[["hasAny",["each word","element","item number","nth","position","sahara","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Moroccan Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-62c75e48","guard":[["hasAny",["element","item number","kingdom","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Pound Sterling."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-63f1f68f","guard":[["hasAny",["element","item number","nth","position","uganda"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Shilling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-73e6111d","guard":[["hasAny",["element","item number","lanka","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," Lanka uses the ",{"slot":1}," Lankan Rupee."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-745a71ec","guard":[["hasAny",["element","item number","nth","position","ukraine"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Hryvnia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7481ddc9","guard":[["hasAny",["element","futuna","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," uses the CFP Franc."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7826f74f","guard":[["hasAny",["bosnia","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," uses the Convertible Mark."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7f8e3b3c","guard":[["hasAny",["bosnia","each word","element","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," uses the Convertible Mark."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-83d9d3a8","guard":[["hasAny",["bhutan","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Ngultrum."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-84206188","guard":[["hasAny",["azerbaijan","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," New Manat."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-89006686","guard":[["hasAny",["element","guinea","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Franc."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-8af46f2a","guard":[["hasAny",["element","faroe","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Danish Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8b941c5a","guard":[["hasAny",["element","item number","marshall","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the US Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8dcc4081","guard":[["hasAny",["each word","element","iceland","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Krona."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8ed4ae17","guard":[["hasAny",["each word","element","iceland","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Krona."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-983b3add","guard":[["hasAny",["each word","element","item number","lucia","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the East Caribbean Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9b6495b2","guard":[["hasAny",["costa","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["Costa ",{"slot":0}," uses the ",{"slot":1}," Rican Colon."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9d45f4f7","guard":[["hasAny",["each word","element","futuna","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," uses the CFP Franc."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a289cc00","guard":[["hasAny",["arab","element","item number","lower case","lowercase","nth","position","small letters"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," Arab ",{"slot":1}," uses the Arab ",{"slot":2}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a3ef77eb","guard":[["hasAny",["each word","element","item number","nth","position","split into words","ukraine"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Hryvnia."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a59b9c1d","guard":[["hasAny",["element","item number","nth","position","ukraine"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Hryvnia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-aa4d92ee","guard":[["hasAny",["element","guinea","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Franc."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ac604d1d","guard":[["hasAny",["barbados","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ac818b90","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," Mayen uses the Norwegian Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ada0f189","guard":[["hasAny",["element","item number","nth","position","vanuatu"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Vatu."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ae8d003c","guard":[["hasAny",["element","item number","nth","position","uganda"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Shilling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ba2b765e","guard":[["hasAny",["costa","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Costa Rican Colon."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ba3ae569","guard":[["hasAny",["british","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["Virgin ",{"slot":0},", ",{"slot":1}," uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bb594be1","guard":[["hasAny",["each word","element","item number","nth","position","sahara","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Moroccan Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-be50dad0","guard":[["hasAny",["africa","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," Africa uses the ",{"slot":1}," African Rand."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-bff956fb","guard":[["hasAny",["bhutan","each word","element","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Ngultrum."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c079ec2f","guard":[["hasAny",["each word","element","futuna","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," uses the CFP Franc."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c0ec095c","guard":[["hasAny",["british","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1},", British uses the Pound Sterling."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c225bd05","guard":[["hasAny",["element","item number","jan","nth","position","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," uses the Norwegian Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-c35c026a","guard":[["hasAny",["element","item number","marshall","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the US Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c4c9226a","guard":[["hasAny",["element","item number","marshall","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the US Dollar."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c71afae3","guard":[["hasAny",["barbados","each word","element","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c814bf57","guard":[["hasAny",["element","item number","kingdom","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Pound Sterling."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c9817812","guard":[["hasAny",["ecuador","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sucre."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d071364e","guard":[["hasAny",["element","item number","nth","position","sahara"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Moroccan Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d3b4aa0e","guard":[["hasAny",["element","guinea","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Franc."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d5d1120e","guard":[["hasAny",["each word","element","item number","lesotho","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Loti."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-daa36b26","guard":[["hasAny",["each word","element","item number","nth","position","split into words","uganda"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Shilling."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dbfbdda9","guard":[["hasAny",["azerbaijan","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," New Manat."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-dc628630","guard":[["hasAny",["each word","ecuador","element","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Sucre."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dd66cf73","guard":[["hasAny",["element","item number","lanka","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Sri Lankan Rupee."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dd869f0a","guard":[["hasAny",["coast","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the CFA Franc BCEAO."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-dea73c8c","guard":[["hasAny",["element","item number","lucia","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the East Caribbean Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e14a4ed2","guard":[["hasAny",["congo","element","item number","longest","longest one","longest word","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," uses the Franc Congolais."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-e2724689","guard":[["hasAny",["congo","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Congo uses the Franc Congolais."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e5158e1d","guard":[["hasAny",["element","helena","item number","lower case","lowercase","nth","position","small letters"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the St. ",{"slot":2}," Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e8b63c56","guard":[["hasAny",["element","item number","nth","position","vanuatu"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Vatu."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ec701d75","guard":[["hasAny",["each word","element","faroe","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the Danish Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ecc4f549","guard":[["hasAny",["each word","element","item number","lucia","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the East Caribbean Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f034c980","guard":[["hasAny",["element","item number","nth","position","vanuatu"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Vatu."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-f16daa03","guard":[["hasAny",["belize","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses the ",{"slot":1}," Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f1829d6a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","helena","item number","nth","position","title case"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the St. ",{"slot":2}," Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0ebaf04f","guard":[["hasAny",["arab","element","item number","nth","position"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the Arab Emirates Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-1979617e","guard":[["hasAny",["element","helena","invert case","item number","lower case","lowercase","nth","position","small letters","swap case","toggle case"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the St. ",{"slot":2}," Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1d42b50e","guard":[["hasAny",["city","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["Holy ",{"slot":0}," (",{"slot":1}," City ",{"slot":2},") uses the Euro."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-21118401","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," uses the Norwegian Krone."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-24319fec","guard":[["hasAny",["element","helena","item number","lower case","lowercase","nth","position","small letters"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the St. ",{"slot":2}," Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-28871867","guard":[["hasAny",["congo","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," uses the Franc Congolais."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-3c41f63d","guard":[["hasAny",["city","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (Vatican City ",{"slot":2},") uses the Euro."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-52962b19","guard":[["hasAny",["element","georgia","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and the South Sandwich ",{"slot":2}," uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-5772d210","guard":[["hasAny",["cocos","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," (",{"slot":1},") ",{"slot":2}," uses the Australian Dollar."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-638fca9c","guard":[["hasAny",["arabia","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Riyal."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7350cd25","guard":[["hasAny",["city","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," See (",{"slot":1}," City ",{"slot":2},") uses the Euro."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-82807cd6","guard":[["hasAny",["element","item number","north","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Korean Won."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a2ce9ba9","guard":[["hasAny",["element","georgia","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Georgia and the ",{"slot":1}," Sandwich ",{"slot":2}," uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-a3c798ec","guard":[["hasAny",["each word","element","helena","item number","nth","position","split into words"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the St. ",{"slot":2}," Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a4c2ddcd","guard":[["hasAny",["element","item number","north","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Korean Won."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b9ddfd0b","guard":[["hasAny",["element","item number","north","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Korean Won."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-bd606e49","guard":[["hasAny",["arabia","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Riyal."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d3dbf16c","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," uses the Norwegian Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-d5ffee1e","guard":[["hasAny",["element","helena","item number","nth","position"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the St. ",{"slot":2}," Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dc88efcb","guard":[["hasAny",["arabia","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Riyal."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e029aefb","guard":[["hasAny",["cocos","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," (",{"slot":1},") ",{"slot":2}," uses the Australian Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-e0571eff","guard":[["hasAny",["element","georgia","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["South ",{"slot":0}," and the ",{"slot":1}," Sandwich ",{"slot":2}," uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-e18d82fd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","helena","item number","lower case","lowercase","nth","position","small letters","title case"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the St. ",{"slot":2}," Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f86cc9c9","guard":[["hasAny",["each word","element","helena","item number","nth","position","split into words"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the St. ",{"slot":2}," Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fd827d41","guard":[["hasAny",["all caps","capital letters","capitals","element","helena","item number","lower case","lowercase","nth","position","small letters","upper case","uppercase"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the St. ",{"slot":2}," Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-02b90481","guard":[["hasAny",["element","invert case","item number","north","nth","position","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Korean Won."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-0989452a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cocos","element","item number","nth","position","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," (",{"slot":1},") ",{"slot":2}," uses the Australian Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0c0b813f","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","north","nth","position","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Korean Won."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1ffd25df","guard":[["hasAny",["element","item number","jan","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," uses the Norwegian Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-203d0370","guard":[["hasAny",["element","item number","lower case","lowercase","north","nth","position","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Korean Won."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-22a73f57","guard":[["hasAny",["all caps","capital letters","capitals","congo","element","item number","nth","position","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," uses the Franc Congolais."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-3003c344","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","jan","nth","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," uses the Norwegian Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-4195c42a","guard":[["hasAny",["arab","element","item number","nth","position"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the Arab ",{"slot":3}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-4447ef6c","guard":[["hasAny",["element","invert case","item number","jan","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," uses the Norwegian Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-587dd207","guard":[["hasAny",["cocos","element","invert case","item number","nth","position","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," (",{"slot":1},") ",{"slot":2}," uses the Australian Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-61213ae8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","north","nth","position","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Korean Won."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-634b3e72","guard":[["hasAny",["element","helena","item number","lower case","lowercase","nth","position","small letters"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the St. ",{"slot":2}," Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-72766b4e","guard":[["hasAny",["arabia","element","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Riyal."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-735062a6","guard":[["hasAny",["each word","element","helena","item number","lower case","lowercase","nth","position","small letters","split into words"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the St. ",{"slot":2}," Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-78dc912e","guard":[["hasAny",["cocos","element","item number","lower case","lowercase","nth","position","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," (",{"slot":1},") ",{"slot":2}," uses the Australian Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7c3c1378","guard":[["hasAny",["element","item number","lanka","nth","position","shortest","shortest one","shortest word"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Lankan Rupee."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-80b1b4c2","guard":[["hasAny",["congo","element","item number","lower case","lowercase","nth","position","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," uses the Franc Congolais."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8c881929","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","jan","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," uses the Norwegian Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8efc963c","guard":[["hasAny",["congo","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," uses the Franc Congolais."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-a23b82fb","guard":[["hasAny",["all caps","capital letters","capitals","cocos","element","item number","nth","position","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," (",{"slot":1},") ",{"slot":2}," uses the Australian Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-a7979203","guard":[["hasAny",["all caps","arabia","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Riyal."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ac370c1b","guard":[["hasAny",["arab","element","item number","lower case","lowercase","nth","position","small letters"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Emirates uses the Arab ",{"slot":2}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cc03c79d","guard":[["hasAny",["congo","element","invert case","item number","nth","position","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," uses the Franc Congolais."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-db757bee","guard":[["hasAny",["arabia","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Riyal."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e5184cba","guard":[["hasAny",["each word","element","helena","item number","lower case","lowercase","nth","position","small letters","split into words"]],["has","used"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the St. ",{"slot":2}," Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ea521472","guard":[["hasAny",["capitalise","capitalize","capitalize each word","congo","element","item number","nth","position","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," uses the Franc Congolais."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f38db775","guard":[["hasAny",["element","item number","lanka","nth","position","shortest","shortest one","shortest word"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Lankan Rupee."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f596b663","guard":[["hasAny",["arabia","element","invert case","item number","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Riyal."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-072732bf","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," uses the Norwegian Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-0d1d1812","guard":[["hasAny",["africa","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," African Rand."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0f34b7c6","guard":[["hasAny",["cocos","each word","element","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," (",{"slot":1},") ",{"slot":2}," uses the Australian Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0f39812c","guard":[["hasAny",["african","element","item number","nth","position"]],["has","does"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the CFA Franc BEAC."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-179e27f3","guard":[["hasAny",["element","heard","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," Island and ",{"slot":1}," ",{"slot":2}," uses the Australian Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-22426039","guard":[["hasAny",["africa","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," African Rand."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-23c63b77","guard":[["hasAny",["costa","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Rican Colon."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2863305a","guard":[["hasAny",["arab","element","item number","lower case","lowercase","nth","position","small letters"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the Arab ",{"slot":3}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2e55ae96","guard":[["hasAny",["british","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1},", ",{"slot":2}," uses the Pound Sterling."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3718865e","guard":[["hasAny",["element","heard","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," Islands uses the Australian Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-38d56765","guard":[["hasAny",["element","item number","minor","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Minor ",{"slot":2}," Islands uses the US Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-39ced2e7","guard":[["hasAny",["element","item number","minor","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["United ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Islands uses the US Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-3b910f8b","guard":[["hasAny",["africa","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," African Rand."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3c20117c","guard":[["hasAny",["element","item number","lanka","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Lankan Rupee."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-532d8f41","guard":[["hasAny",["british","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1},", ",{"slot":2}," uses the Pound Sterling."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-53832afb","guard":[["hasAny",["element","item number","north","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Korean Won."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-616e7884","guard":[["hasAny",["arab","element","item number","lower case","lowercase","nth","position","small letters"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the Arab ",{"slot":3}," Dirham."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6afc61e6","guard":[["hasAny",["each word","element","item number","jan","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," uses the Norwegian Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6d3ed985","guard":[["hasAny",["congo","element","item number","lower case","lowercase","nth","position","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," uses the Franc Congolais."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-789aa8d0","guard":[["hasAny",["congo","each word","element","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," uses the Franc Congolais."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-87ac0eb9","guard":[["hasAny",["element","heard","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["Heard ",{"slot":0}," and ",{"slot":1}," ",{"slot":2}," uses the Australian Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-88d2d223","guard":[["hasAny",["cocos","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," (",{"slot":1},") ",{"slot":2}," uses the Australian Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-8eaa7c76","guard":[["hasAny",["element","item number","lanka","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Lankan Rupee."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-920c9cee","guard":[["hasAny",["arabia","each word","element","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Riyal."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-94d8dc39","guard":[["hasAny",["city","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") uses the Euro."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-95ea299b","guard":[["hasAny",["african","element","item number","nth","position"]],["has","does"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the CFA Franc BEAC."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-968d9e28","guard":[["hasAny",["element","georgia","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and the ",{"slot":2}," Sandwich Islands uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a1e3d815","guard":[["hasAny",["all caps","arab","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the Arab ",{"slot":3}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-a66fb322","guard":[["hasAny",["cocos","each word","element","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," (",{"slot":1},") ",{"slot":2}," uses the Australian Dollar."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b3e0bb0e","guard":[["hasAny",["costa","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Rican Colon."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-b60a8754","guard":[["hasAny",["each word","element","item number","north","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Korean Won."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b963a6c4","guard":[["hasAny",["congo","each word","element","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," uses the Franc Congolais."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cb604977","guard":[["hasAny",["arabia","each word","element","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Riyal."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-cf435ab2","guard":[["hasAny",["element","item number","lanka","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Lankan Rupee."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d0af697f","guard":[["hasAny",["arab","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the Arab ",{"slot":3}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d41ac132","guard":[["hasAny",["element","heard","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and McDonald ",{"slot":2}," uses the Australian Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-d621ab67","guard":[["hasAny",["element","item number","minor","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," States ",{"slot":1}," ",{"slot":2}," Islands uses the US Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-d9e97e3e","guard":[["hasAny",["arabia","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Riyal."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-de13c309","guard":[["hasAny",["costa","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Rican Colon."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e600019e","guard":[["hasAny",["element","item number","minor","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Outlying Islands uses the US Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f28f8cc8","guard":[["hasAny",["arab","element","invert case","item number","nth","position","swap case","toggle case"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the Arab ",{"slot":3}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f9dc2cce","guard":[["hasAny",["african","element","item number","nth","position"]],["has","does"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the CFA Franc BEAC."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fa4a80a6","guard":[["hasAny",["africa","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," African Rand."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fa63a2ec","guard":[["hasAny",["each word","element","item number","north","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Korean Won."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-faeed9fe","guard":[["hasAny",["each word","element","item number","jan","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," uses the Norwegian Krone."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fb0a5191","guard":[["hasAny",["british","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1},", ",{"slot":2}," uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fb136e64","guard":[["hasAny",["costa","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Rican Colon."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fdde5bb0","guard":[["hasAny",["element","item number","lanka","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses the ",{"slot":2}," Lankan Rupee."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ff97f72e","guard":[["hasAny",["city","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City State) uses the Euro."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-0fde3024","guard":[["hasAny",["arab","element","item number","lower case","lowercase","nth","position","small letters"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the Arab ",{"slot":3}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-27656003","guard":[["hasAny",["arab","each word","element","item number","nth","position","split into words"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the Arab ",{"slot":3}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-327c2852","guard":[["hasAny",["arab","element","item number","nth","position"]],["words<=",7]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the Arab ",{"slot":3}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-59e00cf4","guard":[["hasAny",["element","georgia","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and the ",{"slot":2}," Sandwich ",{"slot":3}," uses the Pound Sterling."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-7d5c79ed","guard":[["hasAny",["arab","element","invert case","item number","lower case","lowercase","nth","position","small letters","swap case","toggle case"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the Arab ",{"slot":3}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8836fa74","guard":[["hasAny",["arab","capitalise","capitalize","capitalize each word","element","item number","lower case","lowercase","nth","position","small letters","title case"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the Arab ",{"slot":3}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9688f6d6","guard":[["hasAny",["element","georgia","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and the ",{"slot":2}," Sandwich ",{"slot":3}," uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-baa69e56","guard":[["hasAny",["element","georgia","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and the ",{"slot":2}," Sandwich ",{"slot":3}," uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-cfee2b67","guard":[["hasAny",["all caps","arab","capital letters","capitals","element","item number","lower case","lowercase","nth","position","small letters","upper case","uppercase"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the Arab ",{"slot":3}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-da28b1e3","guard":[["hasAny",["element","georgia","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and the ",{"slot":2}," Sandwich ",{"slot":3}," uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-e1c92f24","guard":[["hasAny",["element","georgia","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and the ",{"slot":2}," Sandwich ",{"slot":3}," uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-efba06b6","guard":[["hasAny",["city","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") uses the Euro."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-fae4ff42","guard":[["hasAny",["arab","each word","element","item number","nth","position","split into words"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the Arab ",{"slot":3}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-09999e86","guard":[["hasAny",["city","element","invert case","item number","nth","position","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") uses the Euro."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-205f0d4c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","georgia","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and the ",{"slot":2}," Sandwich ",{"slot":3}," uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-26766a1e","guard":[["hasAny",["element","georgia","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and the ",{"slot":2}," Sandwich ",{"slot":3}," uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-426ca481","guard":[["hasAny",["arab","each word","element","item number","lower case","lowercase","nth","position","small letters","split into words"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the Arab ",{"slot":3}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6b22019a","guard":[["hasAny",["city","element","item number","lower case","lowercase","nth","position","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") uses the Euro."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-86a19b38","guard":[["hasAny",["capitalise","capitalize","capitalize each word","city","element","item number","nth","position","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") uses the Euro."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a3374d91","guard":[["hasAny",["all caps","capital letters","capitals","element","georgia","item number","nth","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and the ",{"slot":2}," Sandwich ",{"slot":3}," uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-aed88fc8","guard":[["hasAny",["element","georgia","invert case","item number","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and the ",{"slot":2}," Sandwich ",{"slot":3}," uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b67d6868","guard":[["hasAny",["all caps","capital letters","capitals","city","element","item number","nth","position","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") uses the Euro."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-bc3bbe72","guard":[["hasAny",["arab","each word","element","item number","lower case","lowercase","nth","position","small letters","split into words"]],["has","name"],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the Arab ",{"slot":3}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-bd44598f","guard":[["hasAny",["arab","element","item number","lower case","lowercase","nth","position","small letters"]],["words<=",7]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses the Arab ",{"slot":3}," Dirham."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3d9ca955","guard":[["hasAny",["each word","element","georgia","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and the ",{"slot":2}," Sandwich ",{"slot":3}," uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-42d19d2a","guard":[["hasAny",["city","each word","element","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") uses the Euro."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-48ffde4b","guard":[["hasAny",["city","element","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") uses the Euro."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-6d829095","guard":[["hasAny",["element","item number","minor","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," Islands uses the US Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-7b198983","guard":[["hasAny",["element","heard","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," ",{"slot":3}," uses the Australian Dollar."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-860d84e7","guard":[["hasAny",["city","each word","element","item number","nth","position","split into words"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") uses the Euro."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-957b9144","guard":[["hasAny",["element","item number","minor","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," Islands uses the US Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-9b4d09f0","guard":[["hasAny",["element","item number","minor","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," Islands uses the US Dollar."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-9d77d336","guard":[["hasAny",["element","heard","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," ",{"slot":3}," uses the Australian Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-ba74295b","guard":[["hasAny",["each word","element","georgia","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and the ",{"slot":2}," Sandwich ",{"slot":3}," uses the Pound Sterling."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cf009d6a","guard":[["hasAny",["element","heard","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," ",{"slot":3}," uses the Australian Dollar."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the currency of Uzbekistan","expect":{"contains":["Uzbekistan Sum"],"notRefusal":true}},{"q":"what currency does Peru use","expect":{"contains":["Peruvian Nuevo Sol"],"notRefusal":true}},{"q":"name the currency of Niue","expect":{"contains":["New Zealand Dollar"],"notRefusal":true}},{"q":"what currency does Maldives use","expect":{"contains":["Maldive Rufiyaa"],"notRefusal":true}},{"q":"name the currency of Lesotho","expect":{"contains":["Lesotho Loti"],"notRefusal":true}},{"q":"name the currency of South Georgia and the South Sandwich Islands","expect":{"contains":["Pound Sterling"],"notRefusal":true}},{"q":"what currency does Central African Republic use","expect":{"contains":["CFA Franc BEAC"],"notRefusal":true}},{"q":"which currency is used in Mauritania","expect":{"contains":["Mauritanian Ouguiya"],"notRefusal":true}},{"q":"what currency does Liechtenstein use","expect":{"contains":["Swiss Franc"],"notRefusal":true}},{"q":"what currency does United Kingdom use","expect":{"contains":["Pound Sterling"],"notRefusal":true}},{"q":"name the currency of Hungary","expect":{"contains":["Hungarian Forint"],"notRefusal":true}},{"q":"which currency is used in East Timor","expect":{"contains":["US Dollar"],"notRefusal":true}},{"q":"what currency does Turkey use","expect":{"contains":["Turkish Lira"],"notRefusal":true}},{"q":"which currency is used in Greenland","expect":{"contains":["Danish Krone"],"notRefusal":true}},{"q":"name the currency of North Korea","expect":{"contains":["North Korean Won"],"notRefusal":true}},{"q":"what currency does Marshall Islands use","expect":{"contains":["US Dollar"],"notRefusal":true}},{"q":"which currency is used in Angola","expect":{"contains":["Angolan Kwanza"],"notRefusal":true}},{"q":"which currency is used in Kiribati","expect":{"contains":["Australian Dollar"],"notRefusal":true}},{"q":"which currency is used in Luxembourg","expect":{"contains":["Euro"],"notRefusal":true}},{"q":"which currency is used in Bosnia and Herzegovina","expect":{"contains":["Convertible Mark"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
