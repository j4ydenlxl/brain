// country-area-smaller-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"country-area-smaller-neo-g6","class":"country-area-smaller","generation":6,"lane":"neo","grownFrom":["whose surface area is smaller: Palestine or Malawi","which has the smaller surface area, Sao Tome and Principe or Niger","whose surface area is smaller: Pakistan or Bermuda","between French Guiana and Lesotho, which has the lesser surface area","between Jordan and Ecuador, which has the lesser surface area","which has the smaller surface area, French Southern territories or French Guiana","whose surface area is smaller: Ghana or Rwanda","whose surface area is smaller: Marshall Islands or South Georgia and the South Sandwich Islands","between Central African Republic and Mexico, which has the lesser surface area","between France and Marshall Islands, which has the lesser surface area","whose surface area is smaller: Gambia or Estonia","whose surface area is smaller: Cayman Islands or Antarctica","whose surface area is smaller: Peru or Greece","between Jamaica and Mali, which has the lesser surface area","whose surface area is smaller: Mexico or Haiti","which has the smaller surface area, Comoros or Belgium","between Malta and Solomon Islands, which has the lesser surface area","which has the smaller surface area, Bermuda or Suriname","which has the smaller surface area, Haiti or Oman","between Suriname and Cameroon, which has the lesser surface area"],"version":1});

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
{"id":"n-a30bd82c","guard":[["has","area"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Palestine or Malawi":"Palestine has the smaller surface area (6257 against 118484).","which has the smaller surface area, Sao Tome and Principe or Niger":"Sao Tome and Principe has the smaller surface area (964 against 1267000).","whose surface area is smaller: Pakistan or Bermuda":"Bermuda has the smaller surface area (53 against 796095).","between French Guiana and Lesotho, which has the lesser surface area":"Lesotho has the smaller surface area (30355 against 90000).","between Jordan and Ecuador, which has the lesser surface area":"Jordan has the smaller surface area (88946 against 283561).","which has the smaller surface area, French Southern territories or French Guiana":"French Southern territories has the smaller surface area (7780 against 90000).","whose surface area is smaller: Ghana or Rwanda":"Rwanda has the smaller surface area (26338 against 238533).","whose surface area is smaller: Marshall Islands or South Georgia and the South Sandwich Islands":"Marshall Islands has the smaller surface area (181 against 3903).","between Central African Republic and Mexico, which has the lesser surface area":"Central African Republic has the smaller surface area (622984 against 1958201).","between France and Marshall Islands, which has the lesser surface area":"Marshall Islands has the smaller surface area (181 against 551500).","whose surface area is smaller: Gambia or Estonia":"Gambia has the smaller surface area (11295 against 45227).","whose surface area is smaller: Cayman Islands or Antarctica":"Cayman Islands has the smaller surface area (264 against 13120000).","whose surface area is smaller: Peru or Greece":"Greece has the smaller surface area (131626 against 1285216).","between Jamaica and Mali, which has the lesser surface area":"Jamaica has the smaller surface area (10990 against 1240192).","whose surface area is smaller: Mexico or Haiti":"Haiti has the smaller surface area (27750 against 1958201).","which has the smaller surface area, Comoros or Belgium":"Comoros has the smaller surface area (1862 against 30518).","between Malta and Solomon Islands, which has the lesser surface area":"Malta has the smaller surface area (316 against 28896).","which has the smaller surface area, Bermuda or Suriname":"Bermuda has the smaller surface area (53 against 163265).","which has the smaller surface area, Haiti or Oman":"Haiti has the smaller surface area (27750 against 309500).","between Suriname and Cameroon, which has the lesser surface area":"Suriname has the smaller surface area (163265 against 475442).","between Qatar and Peru, which has the lesser surface area":"Qatar has the smaller surface area (11000 against 1285216).","between Belgium and Saint Helena, which has the lesser surface area":"Saint Helena has the smaller surface area (314 against 30518).","which has the smaller surface area, Brunei or Equatorial Guinea":"Brunei has the smaller surface area (5765 against 28051).","whose surface area is smaller: Svalbard and Jan Mayen or Maldives":"Maldives has the smaller surface area (298 against 62422).","between Uganda and Ghana, which has the lesser surface area":"Ghana has the smaller surface area (238533 against 241038).","between Angola and Cayman Islands, which has the lesser surface area":"Cayman Islands has the smaller surface area (264 against 1246700).","which has the smaller surface area, South Georgia and the South Sandwich Islands or Malta":"Malta has the smaller surface area (316 against 3903).","which has the smaller surface area, New Caledonia or Singapore":"Singapore has the smaller surface area (618 against 18575).","between Equatorial Guinea and Svalbard and Jan Mayen, which has the lesser surface area":"Equatorial Guinea has the smaller surface area (28051 against 62422).","between British Indian Ocean Territory and Afghanistan, which has the lesser surface area":"British Indian Ocean Territory has the smaller surface area (78 against 652090).","which has the smaller surface area, Hong Kong or France":"Hong Kong has the smaller surface area (1075 against 551500).","which has the smaller surface area, Maldives or Laos":"Maldives has the smaller surface area (298 against 236800).","between Laos and South Africa, which has the lesser surface area":"Laos has the smaller surface area (236800 against 1221037).","which has the smaller surface area, Greece or U.S. Virgin Islands":"U.S. Virgin Islands has the smaller surface area (347 against 131626).","which has the smaller surface area, Costa Rica or Sudan":"Costa Rica has the smaller surface area (51100 against 1886068).","which has the smaller surface area, Cocos (Keeling) Islands or Qatar":"Cocos (Keeling) Islands has the smaller surface area (14 against 11000).","between Chile and Saint Kitts and Nevis, which has the lesser surface area":"Saint Kitts and Nevis has the smaller surface area (261 against 756626).","between Oman and Wallis and Futuna, which has the lesser surface area":"Wallis and Futuna has the smaller surface area (200 against 309500).","between Sudan and Tokelau, which has the lesser surface area":"Tokelau has the smaller surface area (12 against 1886068).","which has the smaller surface area, Iceland or Portugal":"Portugal has the smaller surface area (91982 against 103000).","between Russia and Macao, which has the lesser surface area":"Macao has the smaller surface area (18 against 17075400).","which has the smaller surface area, Guyana or Andorra":"Andorra has the smaller surface area (468 against 214969).","which has the smaller surface area, Egypt or Jordan":"Jordan has the smaller surface area (88946 against 1001449).","between Niger and Gambia, which has the lesser surface area":"Gambia has the smaller surface area (11295 against 1267000).","between Guatemala and Argentina, which has the lesser surface area":"Guatemala has the smaller surface area (108889 against 2780400).","whose surface area is smaller: Wallis and Futuna or Cuba":"Wallis and Futuna has the smaller surface area (200 against 110861).","between Sierra Leone and Kenya, which has the lesser surface area":"Sierra Leone has the smaller surface area (71740 against 580367).","whose surface area is smaller: Lesotho or Chad":"Lesotho has the smaller surface area (30355 against 1284000).","which has the smaller surface area, Antarctica or Philippines":"Philippines has the smaller surface area (300000 against 13120000).","between British Virgin Islands and Djibouti, which has the lesser surface area":"British Virgin Islands has the smaller surface area (151 against 23200).","whose surface area is smaller: Belarus or Hong Kong":"Hong Kong has the smaller surface area (1075 against 207600).","whose surface area is smaller: Ecuador or Norfolk Island":"Norfolk Island has the smaller surface area (36 against 283561).","whose surface area is smaller: Lithuania or Comoros":"Comoros has the smaller surface area (1862 against 65301).","whose surface area is smaller: South Africa or Cocos (Keeling) Islands":"Cocos (Keeling) Islands has the smaller surface area (14 against 1221037).","which has the smaller surface area, North Korea or Jamaica":"Jamaica has the smaller surface area (10990 against 120538).","between Andorra and United States, which has the lesser surface area":"Andorra has the smaller surface area (468 against 9363520).","between U.S. Virgin Islands and Vanuatu, which has the lesser surface area":"U.S. Virgin Islands has the smaller surface area (347 against 12189).","which has the smaller surface area, Rwanda or Central African Republic":"Rwanda has the smaller surface area (26338 against 622984).","whose surface area is smaller: Vanuatu or Guyana":"Vanuatu has the smaller surface area (12189 against 214969).","whose surface area is smaller: United States or French Southern territories":"French Southern territories has the smaller surface area (7780 against 9363520).","whose surface area is smaller: Djibouti or Germany":"Djibouti has the smaller surface area (23200 against 357022).","between Nigeria and South Korea, which has the lesser surface area":"South Korea has the smaller surface area (99434 against 923768).","whose surface area is smaller: Macao or North Korea":"Macao has the smaller surface area (18 against 120538).","which has the smaller surface area, Norfolk Island or Sierra Leone":"Norfolk Island has the smaller surface area (36 against 71740).","between Nauru and Belarus, which has the lesser surface area":"Nauru has the smaller surface area (21 against 207600).","between Portugal and Venezuela, which has the lesser surface area":"Portugal has the smaller surface area (91982 against 912050).","between Uruguay and Sweden, which has the lesser surface area":"Uruguay has the smaller surface area (175016 against 449964).","between Western Sahara and Pakistan, which has the lesser surface area":"Western Sahara has the smaller surface area (266000 against 796095).","which has the smaller surface area, Bolivia or Guatemala":"Guatemala has the smaller surface area (108889 against 1098581).","which has the smaller surface area, North Macedonia or Netherlands":"North Macedonia has the smaller surface area (25713 against 41526).","which has the smaller surface area, Antigua and Barbuda or Russia":"Antigua and Barbuda has the smaller surface area (442 against 17075400).","which has the smaller surface area, Ethiopia or Uruguay":"Uruguay has the smaller surface area (175016 against 1104300).","between Dominica and Lithuania, which has the lesser surface area":"Dominica has the smaller surface area (751 against 65301).","whose surface area is smaller: Saint Helena or Ethiopia":"Saint Helena has the smaller surface area (314 against 1104300).","which has the smaller surface area, Nicaragua or British Indian Ocean Territory":"British Indian Ocean Territory has the smaller surface area (78 against 130000).","whose surface area is smaller: South Korea or Brunei":"Brunei has the smaller surface area (5765 against 99434).","whose surface area is smaller: Afghanistan or Switzerland":"Switzerland has the smaller surface area (41284 against 652090).","whose surface area is smaller: Sweden or North Macedonia":"North Macedonia has the smaller surface area (25713 against 449964).","which has the smaller surface area, Czech Republic or Angola":"Czech Republic has the smaller surface area (78866 against 1246700).","whose surface area is smaller: Mali or Mongolia":"Mali has the smaller surface area (1240192 against 1566500).","between Netherlands and Palestine, which has the lesser surface area":"Palestine has the smaller surface area (6257 against 41526).","whose surface area is smaller: Venezuela or Bolivia":"Venezuela has the smaller surface area (912050 against 1098581).","whose surface area is smaller: Dominican Republic or Iceland":"Dominican Republic has the smaller surface area (48511 against 103000).","between Poland and Dominican Republic, which has the lesser surface area":"Dominican Republic has the smaller surface area (48511 against 323250).","whose surface area is smaller: Brazil or Nicaragua":"Nicaragua has the smaller surface area (130000 against 8547403).","whose surface area is smaller: Tokelau or Antigua and Barbuda":"Tokelau has the smaller surface area (12 against 442).","whose surface area is smaller: Kenya or Costa Rica":"Costa Rica has the smaller surface area (51100 against 580367).","which has the smaller surface area, Cuba or Western Sahara":"Cuba has the smaller surface area (110861 against 266000).","whose surface area is smaller: Saint Kitts and Nevis or New Caledonia":"Saint Kitts and Nevis has the smaller surface area (261 against 18575).","which has the smaller surface area, Switzerland or Poland":"Switzerland has the smaller surface area (41284 against 323250).","between Singapore and Brazil, which has the lesser surface area":"Singapore has the smaller surface area (618 against 8547403).","whose surface area is smaller: Cameroon or Sao Tome and Principe":"Sao Tome and Principe has the smaller surface area (964 against 475442).","which has the smaller surface area, Estonia or Nauru":"Nauru has the smaller surface area (21 against 45227).","whose surface area is smaller: Solomon Islands or Czech Republic":"Solomon Islands has the smaller surface area (28896 against 78866).","which has the smaller surface area, Malawi or Uganda":"Malawi has the smaller surface area (118484 against 241038).","which has the smaller surface area, Mongolia or Chile":"Chile has the smaller surface area (756626 against 1566500).","whose surface area is smaller: Argentina or Namibia":"Namibia has the smaller surface area (824292 against 2780400).","which has the smaller surface area, Namibia or British Virgin Islands":"British Virgin Islands has the smaller surface area (151 against 824292).","which has the smaller surface area, Germany or Nigeria":"Germany has the smaller surface area (357022 against 923768).","which has the smaller surface area, Chad or Dominica":"Dominica has the smaller surface area (751 against 1284000)."}}},
{"id":"n-a7e88599","guard":[["has","area"],["not",["has","of"]],["not",["has","greater"]],["not",["has","larger"]],["not",["has","australia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Palestine or Malawi":"Palestine has the smaller surface area (6257 against 118484).","which has the smaller surface area, Sao Tome and Principe or Niger":"Sao Tome and Principe has the smaller surface area (964 against 1267000).","whose surface area is smaller: Pakistan or Bermuda":"Bermuda has the smaller surface area (53 against 796095).","between French Guiana and Lesotho, which has the lesser surface area":"Lesotho has the smaller surface area (30355 against 90000).","between Jordan and Ecuador, which has the lesser surface area":"Jordan has the smaller surface area (88946 against 283561).","which has the smaller surface area, French Southern territories or French Guiana":"French Southern territories has the smaller surface area (7780 against 90000).","whose surface area is smaller: Ghana or Rwanda":"Rwanda has the smaller surface area (26338 against 238533).","whose surface area is smaller: Marshall Islands or South Georgia and the South Sandwich Islands":"Marshall Islands has the smaller surface area (181 against 3903).","between Central African Republic and Mexico, which has the lesser surface area":"Central African Republic has the smaller surface area (622984 against 1958201).","between France and Marshall Islands, which has the lesser surface area":"Marshall Islands has the smaller surface area (181 against 551500).","whose surface area is smaller: Gambia or Estonia":"Gambia has the smaller surface area (11295 against 45227).","whose surface area is smaller: Cayman Islands or Antarctica":"Cayman Islands has the smaller surface area (264 against 13120000).","whose surface area is smaller: Peru or Greece":"Greece has the smaller surface area (131626 against 1285216).","between Jamaica and Mali, which has the lesser surface area":"Jamaica has the smaller surface area (10990 against 1240192).","whose surface area is smaller: Mexico or Haiti":"Haiti has the smaller surface area (27750 against 1958201).","which has the smaller surface area, Comoros or Belgium":"Comoros has the smaller surface area (1862 against 30518).","between Malta and Solomon Islands, which has the lesser surface area":"Malta has the smaller surface area (316 against 28896).","which has the smaller surface area, Bermuda or Suriname":"Bermuda has the smaller surface area (53 against 163265).","which has the smaller surface area, Haiti or Oman":"Haiti has the smaller surface area (27750 against 309500).","between Suriname and Cameroon, which has the lesser surface area":"Suriname has the smaller surface area (163265 against 475442).","between Qatar and Peru, which has the lesser surface area":"Qatar has the smaller surface area (11000 against 1285216).","between Belgium and Saint Helena, which has the lesser surface area":"Saint Helena has the smaller surface area (314 against 30518).","which has the smaller surface area, Brunei or Equatorial Guinea":"Brunei has the smaller surface area (5765 against 28051).","whose surface area is smaller: Svalbard and Jan Mayen or Maldives":"Maldives has the smaller surface area (298 against 62422).","between Uganda and Ghana, which has the lesser surface area":"Ghana has the smaller surface area (238533 against 241038).","between Angola and Cayman Islands, which has the lesser surface area":"Cayman Islands has the smaller surface area (264 against 1246700).","which has the smaller surface area, South Georgia and the South Sandwich Islands or Malta":"Malta has the smaller surface area (316 against 3903).","which has the smaller surface area, New Caledonia or Singapore":"Singapore has the smaller surface area (618 against 18575).","between Equatorial Guinea and Svalbard and Jan Mayen, which has the lesser surface area":"Equatorial Guinea has the smaller surface area (28051 against 62422).","between British Indian Ocean Territory and Afghanistan, which has the lesser surface area":"British Indian Ocean Territory has the smaller surface area (78 against 652090).","which has the smaller surface area, Hong Kong or France":"Hong Kong has the smaller surface area (1075 against 551500).","which has the smaller surface area, Maldives or Laos":"Maldives has the smaller surface area (298 against 236800).","between Laos and South Africa, which has the lesser surface area":"Laos has the smaller surface area (236800 against 1221037).","which has the smaller surface area, Greece or U.S. Virgin Islands":"U.S. Virgin Islands has the smaller surface area (347 against 131626).","which has the smaller surface area, Costa Rica or Sudan":"Costa Rica has the smaller surface area (51100 against 1886068).","which has the smaller surface area, Cocos (Keeling) Islands or Qatar":"Cocos (Keeling) Islands has the smaller surface area (14 against 11000).","between Chile and Saint Kitts and Nevis, which has the lesser surface area":"Saint Kitts and Nevis has the smaller surface area (261 against 756626).","between Oman and Wallis and Futuna, which has the lesser surface area":"Wallis and Futuna has the smaller surface area (200 against 309500).","between Sudan and Tokelau, which has the lesser surface area":"Tokelau has the smaller surface area (12 against 1886068).","which has the smaller surface area, Iceland or Portugal":"Portugal has the smaller surface area (91982 against 103000).","between Russia and Macao, which has the lesser surface area":"Macao has the smaller surface area (18 against 17075400).","which has the smaller surface area, Guyana or Andorra":"Andorra has the smaller surface area (468 against 214969).","which has the smaller surface area, Egypt or Jordan":"Jordan has the smaller surface area (88946 against 1001449).","between Niger and Gambia, which has the lesser surface area":"Gambia has the smaller surface area (11295 against 1267000).","between Guatemala and Argentina, which has the lesser surface area":"Guatemala has the smaller surface area (108889 against 2780400).","whose surface area is smaller: Wallis and Futuna or Cuba":"Wallis and Futuna has the smaller surface area (200 against 110861).","between Sierra Leone and Kenya, which has the lesser surface area":"Sierra Leone has the smaller surface area (71740 against 580367).","whose surface area is smaller: Lesotho or Chad":"Lesotho has the smaller surface area (30355 against 1284000).","which has the smaller surface area, Antarctica or Philippines":"Philippines has the smaller surface area (300000 against 13120000).","between British Virgin Islands and Djibouti, which has the lesser surface area":"British Virgin Islands has the smaller surface area (151 against 23200).","whose surface area is smaller: Belarus or Hong Kong":"Hong Kong has the smaller surface area (1075 against 207600).","whose surface area is smaller: Ecuador or Norfolk Island":"Norfolk Island has the smaller surface area (36 against 283561).","whose surface area is smaller: Lithuania or Comoros":"Comoros has the smaller surface area (1862 against 65301).","whose surface area is smaller: South Africa or Cocos (Keeling) Islands":"Cocos (Keeling) Islands has the smaller surface area (14 against 1221037).","which has the smaller surface area, North Korea or Jamaica":"Jamaica has the smaller surface area (10990 against 120538).","between Andorra and United States, which has the lesser surface area":"Andorra has the smaller surface area (468 against 9363520).","between U.S. Virgin Islands and Vanuatu, which has the lesser surface area":"U.S. Virgin Islands has the smaller surface area (347 against 12189).","which has the smaller surface area, Rwanda or Central African Republic":"Rwanda has the smaller surface area (26338 against 622984).","whose surface area is smaller: Vanuatu or Guyana":"Vanuatu has the smaller surface area (12189 against 214969).","whose surface area is smaller: United States or French Southern territories":"French Southern territories has the smaller surface area (7780 against 9363520).","whose surface area is smaller: Djibouti or Germany":"Djibouti has the smaller surface area (23200 against 357022).","between Nigeria and South Korea, which has the lesser surface area":"South Korea has the smaller surface area (99434 against 923768).","whose surface area is smaller: Macao or North Korea":"Macao has the smaller surface area (18 against 120538).","which has the smaller surface area, Norfolk Island or Sierra Leone":"Norfolk Island has the smaller surface area (36 against 71740).","between Nauru and Belarus, which has the lesser surface area":"Nauru has the smaller surface area (21 against 207600).","between Portugal and Venezuela, which has the lesser surface area":"Portugal has the smaller surface area (91982 against 912050).","between Uruguay and Sweden, which has the lesser surface area":"Uruguay has the smaller surface area (175016 against 449964).","between Western Sahara and Pakistan, which has the lesser surface area":"Western Sahara has the smaller surface area (266000 against 796095).","which has the smaller surface area, Bolivia or Guatemala":"Guatemala has the smaller surface area (108889 against 1098581).","which has the smaller surface area, North Macedonia or Netherlands":"North Macedonia has the smaller surface area (25713 against 41526).","which has the smaller surface area, Antigua and Barbuda or Russia":"Antigua and Barbuda has the smaller surface area (442 against 17075400).","which has the smaller surface area, Ethiopia or Uruguay":"Uruguay has the smaller surface area (175016 against 1104300).","between Dominica and Lithuania, which has the lesser surface area":"Dominica has the smaller surface area (751 against 65301).","whose surface area is smaller: Saint Helena or Ethiopia":"Saint Helena has the smaller surface area (314 against 1104300).","which has the smaller surface area, Nicaragua or British Indian Ocean Territory":"British Indian Ocean Territory has the smaller surface area (78 against 130000).","whose surface area is smaller: South Korea or Brunei":"Brunei has the smaller surface area (5765 against 99434).","whose surface area is smaller: Afghanistan or Switzerland":"Switzerland has the smaller surface area (41284 against 652090).","whose surface area is smaller: Sweden or North Macedonia":"North Macedonia has the smaller surface area (25713 against 449964).","which has the smaller surface area, Czech Republic or Angola":"Czech Republic has the smaller surface area (78866 against 1246700).","whose surface area is smaller: Mali or Mongolia":"Mali has the smaller surface area (1240192 against 1566500).","between Netherlands and Palestine, which has the lesser surface area":"Palestine has the smaller surface area (6257 against 41526).","whose surface area is smaller: Venezuela or Bolivia":"Venezuela has the smaller surface area (912050 against 1098581).","whose surface area is smaller: Dominican Republic or Iceland":"Dominican Republic has the smaller surface area (48511 against 103000).","between Poland and Dominican Republic, which has the lesser surface area":"Dominican Republic has the smaller surface area (48511 against 323250).","whose surface area is smaller: Brazil or Nicaragua":"Nicaragua has the smaller surface area (130000 against 8547403).","whose surface area is smaller: Tokelau or Antigua and Barbuda":"Tokelau has the smaller surface area (12 against 442).","whose surface area is smaller: Kenya or Costa Rica":"Costa Rica has the smaller surface area (51100 against 580367).","which has the smaller surface area, Cuba or Western Sahara":"Cuba has the smaller surface area (110861 against 266000).","whose surface area is smaller: Saint Kitts and Nevis or New Caledonia":"Saint Kitts and Nevis has the smaller surface area (261 against 18575).","which has the smaller surface area, Switzerland or Poland":"Switzerland has the smaller surface area (41284 against 323250).","between Singapore and Brazil, which has the lesser surface area":"Singapore has the smaller surface area (618 against 8547403).","whose surface area is smaller: Cameroon or Sao Tome and Principe":"Sao Tome and Principe has the smaller surface area (964 against 475442).","which has the smaller surface area, Estonia or Nauru":"Nauru has the smaller surface area (21 against 45227).","whose surface area is smaller: Solomon Islands or Czech Republic":"Solomon Islands has the smaller surface area (28896 against 78866).","which has the smaller surface area, Malawi or Uganda":"Malawi has the smaller surface area (118484 against 241038).","which has the smaller surface area, Mongolia or Chile":"Chile has the smaller surface area (756626 against 1566500).","whose surface area is smaller: Argentina or Namibia":"Namibia has the smaller surface area (824292 against 2780400).","which has the smaller surface area, Namibia or British Virgin Islands":"British Virgin Islands has the smaller surface area (151 against 824292).","which has the smaller surface area, Germany or Nigeria":"Germany has the smaller surface area (357022 against 923768).","which has the smaller surface area, Chad or Dominica":"Dominica has the smaller surface area (751 against 1284000)."}}},
{"id":"n-b38b8d92","guard":[["has","area"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"smaller: Palestine or Malawi":"Palestine has the smaller surface area (6257 against 118484).","smaller: Pakistan or Bermuda":"Bermuda has the smaller surface area (53 against 796095).","smaller: Ghana or Rwanda":"Rwanda has the smaller surface area (26338 against 238533).","smaller: Marshall Islands or South Georgia and the South Sandwich Islands":"Marshall Islands has the smaller surface area (181 against 3903).","smaller: Gambia or Estonia":"Gambia has the smaller surface area (11295 against 45227).","smaller: Cayman Islands or Antarctica":"Cayman Islands has the smaller surface area (264 against 13120000).","smaller: Peru or Greece":"Greece has the smaller surface area (131626 against 1285216).","smaller: Mexico or Haiti":"Haiti has the smaller surface area (27750 against 1958201).","smaller: Svalbard and Jan Mayen or Maldives":"Maldives has the smaller surface area (298 against 62422).","smaller: Wallis and Futuna or Cuba":"Wallis and Futuna has the smaller surface area (200 against 110861).","smaller: Lesotho or Chad":"Lesotho has the smaller surface area (30355 against 1284000).","smaller: Belarus or Hong Kong":"Hong Kong has the smaller surface area (1075 against 207600).","smaller: Ecuador or Norfolk Island":"Norfolk Island has the smaller surface area (36 against 283561).","smaller: Lithuania or Comoros":"Comoros has the smaller surface area (1862 against 65301).","smaller: South Africa or Cocos (Keeling) Islands":"Cocos (Keeling) Islands has the smaller surface area (14 against 1221037).","smaller: Vanuatu or Guyana":"Vanuatu has the smaller surface area (12189 against 214969).","smaller: United States or French Southern territories":"French Southern territories has the smaller surface area (7780 against 9363520).","smaller: Djibouti or Germany":"Djibouti has the smaller surface area (23200 against 357022).","smaller: Macao or North Korea":"Macao has the smaller surface area (18 against 120538).","smaller: Saint Helena or Ethiopia":"Saint Helena has the smaller surface area (314 against 1104300).","smaller: South Korea or Brunei":"Brunei has the smaller surface area (5765 against 99434).","smaller: Afghanistan or Switzerland":"Switzerland has the smaller surface area (41284 against 652090).","smaller: Sweden or North Macedonia":"North Macedonia has the smaller surface area (25713 against 449964).","smaller: Mali or Mongolia":"Mali has the smaller surface area (1240192 against 1566500).","smaller: Venezuela or Bolivia":"Venezuela has the smaller surface area (912050 against 1098581).","smaller: Dominican Republic or Iceland":"Dominican Republic has the smaller surface area (48511 against 103000).","smaller: Brazil or Nicaragua":"Nicaragua has the smaller surface area (130000 against 8547403).","smaller: Tokelau or Antigua and Barbuda":"Tokelau has the smaller surface area (12 against 442).","smaller: Kenya or Costa Rica":"Costa Rica has the smaller surface area (51100 against 580367).","smaller: Saint Kitts and Nevis or New Caledonia":"Saint Kitts and Nevis has the smaller surface area (261 against 18575).","smaller: Cameroon or Sao Tome and Principe":"Sao Tome and Principe has the smaller surface area (964 against 475442).","smaller: Solomon Islands or Czech Republic":"Solomon Islands has the smaller surface area (28896 against 78866).","smaller: Argentina or Namibia":"Namibia has the smaller surface area (824292 against 2780400)."}}},
{"id":"n-a2017528","guard":[["hasAny",["afghanistan","andorra","argentina","brazil","chile","delete","dominica","egypt","ghana","guatemala","jamaica","jan","lithuania","malta","mexico","nauru","pakistan","peru","philippines","portugal","remove","singapore","strip out","uruguay","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"area"}]]],"mem":null},
{"id":"n-f07a8a8e","guard":[["hasAny",["africa","antarctica","antigua","belarus","bolivia","brazil","chad","costa","djibouti","ecuador","ethiopia","french","ghana","greece","guyana","longest","longest one","longest word","macedonia","malawi","republic"]],["has","smaller"],["has","surface"]],"pyramid":["render.str",["aggregate.longest",["sense.list"]]],"mem":null},
{"id":"n-07f81b8f","guard":[["hasAny",["africa","all caps","antarctica","antigua","belarus","bolivia","brazil","capital letters","capitals","chad","costa","djibouti","ecuador","ethiopia","french","ghana","greece","guyana","longest","longest one","longest word","macedonia","malawi","republic","upper case","uppercase"]],["has","smaller"],["has","surface"]],"pyramid":["render.str",["transform.upper",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-4b604e24","guard":[["hasAny",["afghanistan","africa","antarctica","backwards","belarus","bolivia","brazil","chad","costa","djibouti","ecuador","ethiopia","french","ghana","greece","guyana","longest","longest one","longest word","macedonia","malawi","republic","reverse","reverse order","reversed"]],["has","smaller"],["has","surface"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["sense.list"]]]],"mem":null},
{"id":"n-d31e74f8","guard":[["hasAny",["africa","antarctica","antigua","belarus","bolivia","brazil","capitalise","capitalize","capitalize each word","chad","costa","djibouti","ecuador","ethiopia","french","ghana","greece","guyana","longest","longest one","longest word","macedonia","malawi","republic","title case"]],["has","smaller"],["has","surface"]],"pyramid":["render.str",["transform.title",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-db7b110e","guard":[["hasAny",["africa","antarctica","antigua","belarus","bolivia","brazil","chad","costa","djibouti","ecuador","ethiopia","french","ghana","greece","guyana","longest","longest one","longest word","lower case","lowercase","macedonia","malawi","republic","small letters"]],["has","smaller"],["has","surface"]],"pyramid":["render.str",["transform.lower",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-fd42873a","guard":[["hasAny",["africa","antarctica","antigua","belarus","bolivia","brazil","chad","costa","djibouti","ecuador","ethiopia","french","ghana","greece","guyana","invert case","longest","longest one","longest word","macedonia","malawi","republic","swap case","toggle case"]],["has","smaller"],["has","surface"]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-2e7c87c5","guard":[["hasAny",["a to z","africa","alphabetical","alphabetize","antarctica","belarus","bolivia","brazil","chad","costa","djibouti","ecuador","ethiopia","french","ghana","greece","guyana","longest","longest one","longest word","macedonia","malawi","republic"]],["has","smaller"],["has","surface"]],"pyramid":["render.str",["aggregate.longest",["transform.sortStrs",["sense.list"]]]],"mem":null},
{"id":"n-3df688dd","guard":[["hasAny",["afghanistan","africa","argentina","belarus","bermuda","brazil","brunei","cameroon","comoros","costa","ecuador","french","from position","ghana","greece","haiti","items from to","macedonia","slice"]],["has","smaller"],["has","surface"]],"pyramid":["render.and",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-6e88ebd2","guard":[["hasAny",["afghanistan","africa","argentina","belarus","bermuda","brazil","brunei","comoros","costa","ecuador","element","french","ghana","greece","haiti","item number","macedonia","nth","position"]],["has","smaller"],["has","surface"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":2}]],"mem":null},
{"id":"n-5f973dbf","guard":[["hasAny",["afghanistan","africa","argentina","belarus","bermuda","brazil","brunei","comoros","costa","ecuador","french","from position","ghana","greece","haiti","items from to","macedonia","slice"]],["has","smaller"],["has","surface"]],"pyramid":["render.list",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-6cd28ec6","guard":[["hasAny",["afghanistan","africa","argentina","belarus","bermuda","brazil","brunei","comoros","costa","ecuador","french","from position","ghana","greece","haiti","items from to","macedonia","slice"]],["has","smaller"],["has","surface"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-55e11301","guard":[["hasAny",["backwards","bolivia","brazil","chad","guyana","longest","longest one","longest word","maldives","philippines","reverse","reverse order","reversed","singapore","switzerland"]],["has","surface"],["words<=",11],["not",["has","larger"]],["words>=",8],["not",["has","greater"]],["not",["has","compare"]]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-d6843276","guard":[["hasAny",["antarctica","antigua","bolivia","chad","djibouti","element","estonia","ethiopia","georgia","guyana","item number","macao","malawi","mali","nth","position","republic"]],["has","smaller"],["has","surface"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":1}]],"mem":null},
{"id":"n-6c13d28a","guard":[["hasAny",["a to z","alphabetical","alphabetize","andorra","bolivia","brazil","chad","germany","longest","longest one","longest word","maldives","philippines"]],["has","surface"],["words<=",11],["not",["has","larger"]],["words>=",8],["not",["has","greater"]],["not",["has","belize"]]],"pyramid":["render.str",["aggregate.longest",["transform.sortStrs",["sense.words"]]]],"mem":null},
{"id":"n-28a79842","guard":[["hasAny",["afghanistan","andorra","caledonia","chile","egypt","from position","greece","items from to","mexico","namibia","nicaragua","pakistan","philippines","rwanda","slice","south"]],["has","smaller"],["has","surface"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],["sense.wordCount"],{"lit":10}]],"mem":null},
{"id":"n-ba9b2651","guard":[["hasAny",["andorra","antarctica","bolivia","caledonia","chad","chile","delete","egypt","estonia","ethiopia","georgia","iceland","jamaica","remove","strip out","without"]],["has","surface"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.after",{"lit":"smaller"}]]],"mem":null},
{"id":"n-f5295a28","guard":[["hasAny",["andorra","chile","delete","dominica","egypt","guatemala","jamaica","malta","nauru","philippines","portugal","remove","singapore","strip out","uruguay","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.after",{"lit":"area"}]]],"mem":null},
{"id":"n-3e13760e","guard":[["hasAny",["antarctica","bolivia","caledonia","chad","delete","egypt","estonia","ethiopia","georgia","guyana","iceland","mongolia","remove","strip out","without"]],["has","smaller"],["has","surface"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"has"}]]],"mem":null},
{"id":"n-91711f56","guard":[["hasAny",["bermuda","comoros","element","haiti","item number","nth","position","rwanda","switzerland"]],["has","smaller"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-cf098360","guard":[["hasAny",["afghanistan","argentina","backwards","bermuda","comoros","estonia","haiti","jan","korea","mali","reverse","reverse order","reversed","shortest","shortest one","shortest word"]],["has","smaller"],["has","surface"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.list"]]]],"mem":null},
{"id":"n-f2cead2e","guard":[["hasAny",["afghanistan","argentina","bermuda","brazil","brunei","comoros","delete","ghana","greece","haiti","jan","remove","strip out","without"]],["has","smaller"],["has","surface"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-53d837b3","guard":[["hasAny",["antigua","argentina","bermuda","comoros","estonia","haiti","korea","mali","shortest","shortest one","shortest word"]],["has","surface"],["has","smaller"]],"pyramid":["render.str",["aggregate.shortest",["sense.list"]]],"mem":null},
{"id":"n-18403a66","guard":[["hasAny",["antigua","bolivia","brazil","chad","djibouti","each word","ghana","greece","guyana","longest","longest one","longest word","malawi","split into words"]],["has","smaller"],["has","surface"]],"pyramid":["render.lines",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-26b64e20","guard":[["hasAny",["antigua","argentina","bermuda","comoros","each word","estonia","haiti","korea","mali","shortest","shortest one","shortest word","split into words"]],["has","surface"],["has","smaller"]],"pyramid":["render.list",["transform.words",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-2cfe3b43","guard":[["hasAny",["antigua","argentina","bermuda","comoros","estonia","haiti","korea","mali","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]],["has","surface"],["has","smaller"]],"pyramid":["render.str",["transform.reverseWords",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-3ac4235e","guard":[["hasAny",["all caps","antigua","argentina","bermuda","capital letters","capitals","comoros","estonia","haiti","korea","mali","shortest","shortest one","shortest word","upper case","uppercase"]],["has","surface"],["has","smaller"]],"pyramid":["render.str",["transform.upper",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-50eee297","guard":[["hasAny",["antigua","argentina","bermuda","comoros","each word","estonia","haiti","korea","mali","shortest","shortest one","shortest word","split into words"]],["has","surface"],["has","smaller"]],"pyramid":["render.lines",["transform.words",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-58f67c32","guard":[["hasAny",["a to z","alphabetical","alphabetize","argentina","bermuda","comoros","estonia","haiti","jan","korea","mali","shortest","shortest one","shortest word"]],["has","surface"],["has","smaller"]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["sense.list"]]]],"mem":null},
{"id":"n-aa694a4a","guard":[["hasAny",["antigua","argentina","bermuda","comoros","estonia","haiti","invert case","korea","mali","shortest","shortest one","shortest word","swap case","toggle case"]],["has","surface"],["has","smaller"]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-b739ad99","guard":[["hasAny",["antigua","bolivia","brazil","chad","djibouti","each word","ghana","greece","guyana","longest","longest one","longest word","malawi","split into words"]],["has","smaller"],["has","surface"]],"pyramid":["render.list",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-ebfe012a","guard":[["hasAny",["antigua","argentina","bermuda","comoros","estonia","haiti","korea","lower case","lowercase","mali","shortest","shortest one","shortest word","small letters"]],["has","surface"],["has","smaller"]],"pyramid":["render.str",["transform.lower",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-ec4efbf1","guard":[["hasAny",["antigua","bolivia","brazil","chad","djibouti","each word","ghana","greece","guyana","longest","longest one","longest word","malawi","split into words"]],["has","smaller"],["has","surface"]],"pyramid":["render.and",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-f732136d","guard":[["hasAny",["antigua","argentina","bermuda","comoros","each word","estonia","haiti","korea","mali","shortest","shortest one","shortest word","split into words"]],["has","surface"],["has","smaller"]],"pyramid":["render.and",["transform.words",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-fc61ffbd","guard":[["hasAny",["antigua","bolivia","brazil","chad","djibouti","ghana","greece","guyana","longest","longest one","longest word","malawi","reverse the words","reverse word order","words backwards"]],["has","smaller"],["has","surface"]],"pyramid":["render.str",["transform.reverseWords",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-3496c7af","guard":[["hasAny",["bolivia","chad","each word","egypt","guyana","longest","longest one","longest word","philippines","split into words"]],["has","smaller"],["has","surface"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-189be785","guard":[["hasAny",["bolivia","brazil","guatemala","longest","longest one","longest word","philippines"]],["has","surface"],["not",["has","larger"]],["not",["has","of"]],["not",["has","greater"]],["not",["has","compare"]]],"pyramid":["render.str",["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-03319332","guard":[["hasAny",["bolivia","brazil","each word","guatemala","longest","longest one","longest word","philippines","split into words"]],["has","surface"],["not",["has","larger"]],["not",["has","of"]],["not",["has","greater"]],["not",["has","compare"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.text"]]]],"mem":null},
{"id":"n-a3f440be","guard":[["hasAny",["bolivia","brazil","capitalise","capitalize","capitalize each word","guatemala","longest","longest one","longest word","philippines","title case"]],["has","surface"],["not",["has","larger"]],["not",["has","of"]],["not",["has","greater"]],["not",["has","compare"]]],"pyramid":["render.str",["transform.title",["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-f452c4bf","guard":[["hasAny",["bolivia","brazil","guatemala","invert case","longest","longest one","longest word","philippines","swap case","toggle case"]],["has","surface"],["not",["has","larger"]],["not",["has","of"]],["not",["has","greater"]],["not",["has","compare"]]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-6a55e903","guard":[["hasAny",["afghanistan","chile","egypt","from position","items from to","jan","philippines","slice"]],["has","smaller"],["has","surface"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],["sense.wordCount"],{"lit":12}]],"mem":null},
{"id":"n-0cbfbf54","guard":[["hasAny",["egypt","invert case","philippines","swap case","toggle case"]],["has","smaller"]],"pyramid":["render.str",["transform.swapCase",["sense.subject"]]],"mem":null},
{"id":"n-11db58db","guard":[["hasAny",["egypt","philippines","reverse the words","reverse word order","words backwards"]],["has","smaller"]],"pyramid":["render.str",["transform.reverseWords",["sense.subject"]]],"mem":null},
{"id":"n-21551eff","guard":[["hasAny",["all caps","capital letters","capitals","egypt","philippines","upper case","uppercase"]],["has","smaller"]],"pyramid":["render.str",["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-30129484","guard":[["hasAny",["capitalise","capitalize","capitalize each word","egypt","philippines","title case"]],["has","smaller"]],"pyramid":["render.str",["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-33d3bdce","guard":[["hasAny",["capitalise","capitalize","capitalize each word","egypt","philippines","title case"]],["has","smaller"]],"pyramid":["render.str",["transform.title",["sense.subject"]]],"mem":null},
{"id":"n-5e14ae21","guard":[["hasAny",["egypt","lower case","lowercase","philippines","small letters"]],["has","smaller"]],"pyramid":["render.str",["transform.lower",["sense.subject"]]],"mem":null},
{"id":"n-b8488158","guard":[["hasAny",["each word","egypt","philippines","split into words"]],["has","smaller"]],"pyramid":["render.list",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-cbf70044","guard":[["hasAny",["each word","egypt","philippines","split into words"]],["has","smaller"]],"pyramid":["render.lines",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-d373ba99","guard":[["hasAny",["each word","egypt","philippines","split into words"]],["has","smaller"]],"pyramid":["render.list",["transform.words",["sense.lastWord"]]],"mem":null},
{"id":"n-da561bb1","guard":[["hasAny",["each word","egypt","philippines","split into words"]],["has","smaller"]],"pyramid":["render.and",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-e22dfda7","guard":[["hasAny",["egypt","invert case","philippines","swap case","toggle case"]],["has","smaller"]],"pyramid":["render.str",["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ecefd1e6","guard":[["hasAny",["all caps","capital letters","capitals","egypt","philippines","upper case","uppercase"]],["has","smaller"]],"pyramid":["render.str",["transform.upper",["sense.subject"]]],"mem":null},
{"id":"n-ffa6e257","guard":[["hasAny",["egypt","lower case","lowercase","philippines","small letters"]],["has","smaller"]],"pyramid":["render.str",["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-00e7bf6f","guard":[["hasAny",["distinct","each word","egypt","philippines","remove duplicates","split into words","unique","without repeats"]],["has","smaller"]],"pyramid":["render.lines",["transform.uniqueStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-05f6dc2f","guard":[["hasAny",["cayman","delete","remove","strip out","without"]],["has","surface"],["not",["has","compare"]]],"pyramid":["render.str",["transform.remove",{"lit":"Cayman Islands"},["sense.subject"]]],"mem":null},
{"id":"n-06ba8d72","guard":[["hasAny",["all caps","capital letters","capitals","egypt","philippines","reverse the words","reverse word order","upper case","uppercase","words backwards"]],["has","smaller"]],"pyramid":["render.str",["transform.reverseWords",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-08a4871c","guard":[["hasAny",["cayman","separate by","split","split by"]],["has","surface"],["not",["has","compare"]]],"pyramid":["render.and",["transform.split",{"lit":"Cayman Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-0d4b48f8","guard":[["hasAny",["delete","egypt","philippines","remove","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Cayman Islands"}]],"mem":null},
{"id":"n-1253caef","guard":[["hasAny",["backwards","each word","egypt","philippines","reverse","reverse order","reversed","split into words"]],["has","smaller"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-1fe592de","guard":[["hasAny",["distinct","each word","egypt","philippines","remove duplicates","split into words","unique","without repeats"]],["has","smaller"]],"pyramid":["render.and",["transform.uniqueStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-1ffe68bf","guard":[["hasAny",["delete","egypt","philippines","remove","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Brunei"}]],"mem":null},
{"id":"n-2037e304","guard":[["hasAny",["egypt","philippines","separate by","split","split by"]],["has","smaller"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Costa Rica"}]],"mem":null},
{"id":"n-207fc09a","guard":[["hasAny",["delete","egypt","philippines","remove","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Comoros"}]],"mem":null},
{"id":"n-2421ef2d","guard":[["hasAny",["each word","egypt","philippines","shortest","shortest one","shortest word","split into words"]],["has","smaller"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-256ed087","guard":[["hasAny",["egypt","philippines"]],["has","smaller"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],{"lit":1}]],"mem":null},
{"id":"n-2634e27a","guard":[["hasAny",["delete","egypt","philippines","remove","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Brunei"}]],"mem":null},
{"id":"n-264e3cb2","guard":[["hasAny",["cayman","separate by","split","split by"]],["has","surface"],["not",["has","compare"]]],"pyramid":["render.list",["transform.split",{"lit":"Cayman Islands"},["sense.subject"]]],"mem":null},
{"id":"n-32050666","guard":[["hasAny",["each word","egypt","invert case","philippines","split into words","swap case","toggle case"]],["has","smaller"]],"pyramid":["render.and",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-325c5788","guard":[["hasAny",["egypt","philippines","separate by","split","split by"]],["has","smaller"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Cocos (Keeling) Islands"}]],"mem":null},
{"id":"n-3d8fc038","guard":[["hasAny",["delete","egypt","philippines","remove","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Comoros"}]],"mem":null},
{"id":"n-5641bf70","guard":[["hasAny",["capitalise","capitalize","capitalize each word","each word","egypt","philippines","split into words","title case"]],["has","smaller"]],"pyramid":["render.list",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-579d012f","guard":[["hasAny",["egypt","normalise","normalize","philippines","simplify the text"]],["has","smaller"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":1}]],"mem":null},
{"id":"n-5e99a7bc","guard":[["hasAny",["delete","egypt","philippines","remove","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Bermuda"}]],"mem":null},
{"id":"n-623709ac","guard":[["hasAny",["all caps","capital letters","capitals","each word","egypt","philippines","split into words","upper case","uppercase"]],["has","smaller"]],"pyramid":["render.list",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-626fce14","guard":[["hasAny",["cayman","separate by","split","split by"]],["has","surface"],["not",["has","compare"]]],"pyramid":["render.list",["transform.split",{"lit":"Cayman Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-647b61a5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","egypt","invert case","philippines","swap case","title case","toggle case"]],["has","smaller"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-6a827ced","guard":[["hasAny",["distinct","each word","egypt","philippines","remove duplicates","split into words","unique","without repeats"]],["has","smaller"]],"pyramid":["render.list",["transform.uniqueStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-6c92352f","guard":[["hasAny",["delete","egypt","philippines","remove","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Cocos (Keeling) Islands"}]],"mem":null},
{"id":"n-6dc81132","guard":[["hasAny",["caledonia","cuba","first n","take","top"]],["has","surface"]],"pyramid":["render.and",["transform.takeStrs",["sense.list"],{"lit":2}]],"mem":null},
{"id":"n-74b2eaea","guard":[["hasAny",["all caps","capital letters","capitals","each word","egypt","philippines","split into words","upper case","uppercase"]],["has","smaller"]],"pyramid":["render.lines",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-76b751df","guard":[["hasAny",["cayman","separate by","split","split by"]],["has","surface"],["not",["has","compare"]]],"pyramid":["render.lines",["transform.split",{"lit":"Cayman Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-7726de32","guard":[["hasAny",["each word","egypt","invert case","philippines","split into words","swap case","toggle case"]],["has","smaller"]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-7cd4e859","guard":[["hasAny",["egypt","philippines","separate by","split","split by"]],["has","smaller"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Comoros"}]],"mem":null},
{"id":"n-809d7a9c","guard":[["hasAny",["all caps","capital letters","capitals","each word","egypt","philippines","split into words","upper case","uppercase"]],["has","smaller"]],"pyramid":["render.and",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-887be5bd","guard":[["hasAny",["a to z","alphabetical","alphabetize","each word","egypt","philippines","split into words"]],["has","smaller"]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-8b21cbd9","guard":[["hasAny",["delete","egypt","philippines","remove","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Andorra"}]],"mem":null},
{"id":"n-8d207a70","guard":[["hasAny",["capitalise","capitalize","capitalize each word","each word","egypt","philippines","split into words","title case"]],["has","smaller"]],"pyramid":["render.lines",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-90947d95","guard":[["hasAny",["each word","egypt","invert case","philippines","split into words","swap case","toggle case"]],["has","smaller"]],"pyramid":["render.list",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-9788dff1","guard":[["hasAny",["delete","egypt","philippines","remove","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Andorra"}]],"mem":null},
{"id":"n-9980e3af","guard":[["hasAny",["egypt","philippines","separate by","split","split by"]],["has","smaller"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Bermuda"}]],"mem":null},
{"id":"n-9b94122c","guard":[["hasAny",["egypt","normalise","normalize","philippines","simplify the text"]],["has","smaller"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":2}]],"mem":null},
{"id":"n-9c68fbc4","guard":[["hasAny",["each word","egypt","lower case","lowercase","philippines","small letters","split into words"]],["has","smaller"]],"pyramid":["render.and",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-9e195514","guard":[["hasAny",["egypt","normalise","normalize","philippines","simplify the text"]],["has","smaller"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":3}]],"mem":null},
{"id":"n-9ec795a8","guard":[["hasAny",["element","item number","lesotho","nth","position"]],["words<=",11],["has","surface"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a1d926f2","guard":[["hasAny",["each word","egypt","lower case","lowercase","philippines","small letters","split into words"]],["has","smaller"]],"pyramid":["render.lines",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-b2ca08ba","guard":[["hasAny",["egypt","invert case","philippines","reverse the words","reverse word order","swap case","toggle case","words backwards"]],["has","smaller"]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-b2d4bd85","guard":[["hasAny",["delete","egypt","philippines","remove","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Dominica"}]],"mem":null},
{"id":"n-b8ae475f","guard":[["hasAny",["delete","egypt","philippines","remove","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Dominica"}]],"mem":null},
{"id":"n-b97a60bd","guard":[["hasAny",["backwards","each word","egypt","philippines","reverse","reverse order","reversed","split into words"]],["has","smaller"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-baeb83b0","guard":[["hasAny",["delete","egypt","philippines","remove","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Costa Rica"}]],"mem":null},
{"id":"n-bd9d1772","guard":[["hasAny",["cayman","delete","remove","strip out","without"]],["has","surface"],["not",["has","compare"]]],"pyramid":["render.str",["transform.remove",{"lit":"Cayman Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-c38d62a9","guard":[["hasAny",["egypt","philippines","separate by","split","split by"]],["has","smaller"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Brunei"}]],"mem":null},
{"id":"n-c7b32505","guard":[["hasAny",["a to z","alphabetical","alphabetize","each word","egypt","philippines","split into words"]],["has","smaller"]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-c877d3ba","guard":[["hasAny",["backwards","each word","egypt","philippines","reverse","reverse order","reversed","split into words"]],["has","smaller"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-c9f8312d","guard":[["hasAny",["egypt","lower case","lowercase","philippines","reverse the words","reverse word order","small letters","words backwards"]],["has","smaller"]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["sense.subject"]]]],"mem":null},
{"id":"n-ca601cc0","guard":[["hasAny",["a to z","alphabetical","alphabetize","each word","egypt","philippines","split into words"]],["has","smaller"]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-ccb26b20","guard":[["hasAny",["capitalise","capitalize","capitalize each word","each word","egypt","philippines","split into words","title case"]],["has","smaller"]],"pyramid":["render.and",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-d7edc59c","guard":[["hasAny",["cocos","separate by","split","split by"]],["has","smaller"],["has","surface"]],"pyramid":["render.list",["transform.split",{"lit":"Cocos (Keeling) Islands"},["sense.subject"]]],"mem":null},
{"id":"n-d8ee6bc8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","egypt","philippines","reverse the words","reverse word order","title case","words backwards"]],["has","smaller"]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-d98237c8","guard":[["hasAny",["cocos","delete","remove","strip out","without"]],["has","smaller"],["has","surface"]],"pyramid":["render.str",["transform.remove",{"lit":"Cocos (Keeling) Islands"},["sense.subject"]]],"mem":null},
{"id":"n-de5500ff","guard":[["hasAny",["capitalise","capitalize","capitalize each word","egypt","invert case","philippines","swap case","title case","toggle case"]],["has","smaller"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-de8ad086","guard":[["hasAny",["delete","egypt","philippines","remove","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Bermuda"}]],"mem":null},
{"id":"n-e07530bc","guard":[["hasAny",["egypt","philippines","separate by","split","split by"]],["has","smaller"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Cayman Islands"}]],"mem":null},
{"id":"n-f5032bf5","guard":[["hasAny",["each word","egypt","lower case","lowercase","philippines","small letters","split into words"]],["has","smaller"]],"pyramid":["render.list",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-0e5c1169","guard":[["hasAny",["egypt","philippines","separate by","split","split by"]],["has","smaller"]],"pyramid":["render.list",["transform.split",["sense.subject"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-1afd5ea7","guard":[["hasAny",["egypt","philippines","separate by","split","split by"]],["has","smaller"]],"pyramid":["render.lines",["transform.split",["sense.subject"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-1f1f5bcf","guard":[["hasAny",["egypt","philippines","separate by","split","split by"]],["has","smaller"]],"pyramid":["render.and",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-22e618ec","guard":[["hasAny",["egypt","philippines","separate by","split","split by"]],["has","smaller"]],"pyramid":["render.lines",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-25647d0b","guard":[["hasAny",["delete","egypt","philippines","remove","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-5a2d3585","guard":[["hasAny",["delete","egypt","philippines","remove","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-640a4c50","guard":[["hasAny",["change to","egypt","philippines","replace","substitute","swap"]],["has","smaller"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-9b4ec192","guard":[["hasAny",["egypt","philippines","separate by","split","split by"]],["has","smaller"]],"pyramid":["render.list",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-9f2ebf68","guard":[["hasAny",["egypt","from position","items from to","philippines","slice"]],["has","smaller"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],["sense.wordCount"],{"lit":14}]],"mem":null},
{"id":"n-d791accd","guard":[["hasAny",["egypt","philippines","separate by","split","split by"]],["has","smaller"]],"pyramid":["render.and",["transform.split",["sense.subject"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-0040ed36","guard":[["hasAny",["area","between","has","korea","lesser","nigeria","south","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Nigeria and South Korea, which has the lesser surface area":"South Korea has the smaller surface area (99434 against 923768)."}}},
{"id":"n-015db0b8","guard":[["has","djibouti"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between British Virgin Islands and Djibouti, which has the lesser surface area":"British Virgin Islands has the smaller surface area (151 against 23200)."}}},
{"id":"n-024ddc39","guard":[["hasAny",["antigua","area","barbuda","has","russia","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Antigua and Barbuda or Russia":"Antigua and Barbuda has the smaller surface area (442 against 17075400)."}}},
{"id":"n-04608a4f","guard":[["hasAny",["area","between","has","jamaica","lesser","mali","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Jamaica and Mali, which has the lesser surface area":"Jamaica has the smaller surface area (10990 against 1240192)."}}},
{"id":"n-04706a8e","guard":[["hasAny",["area","ethiopia","has","smaller","surface","uruguay"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Ethiopia or Uruguay":"Uruguay has the smaller surface area (175016 against 1104300)."}}},
{"id":"n-0500bd9b","guard":[["hasAny",["has","singapore"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, New Caledonia or Singapore":"Singapore has the smaller surface area (618 against 18575)."}}},
{"id":"n-063507d1","guard":[["has","marshall"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Marshall Islands or South Georgia and the South Sandwich Islands":"Marshall Islands has the smaller surface area (181 against 3903)."}}},
{"id":"n-07508239","guard":[["has","dominica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Chad or Dominica":"Dominica has the smaller surface area (751 against 1284000)."}}},
{"id":"n-098d95b8","guard":[["has","philippines"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Antarctica or Philippines":"Philippines has the smaller surface area (300000 against 13120000)."}}},
{"id":"n-0b0eb59e","guard":[["has","vanuatu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between U.S. Virgin Islands and Vanuatu, which has the lesser surface area":"U.S. Virgin Islands has the smaller surface area (347 against 12189)."}}},
{"id":"n-0c67e008","guard":[["hasAny",["area","djibouti","germany","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Djibouti or Germany":"Djibouti has the smaller surface area (23200 against 357022)."}}},
{"id":"n-0dc3aa3d","guard":[["hasAny",["area","between","equatorial","guinea","has","jan","lesser","mayen","surface","svalbard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Equatorial Guinea and Svalbard and Jan Mayen, which has the lesser surface area":"Equatorial Guinea has the smaller surface area (28051 against 62422)."}}},
{"id":"n-0e436468","guard":[["hasAny",["gambia","niger"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Niger and Gambia, which has the lesser surface area":"Gambia has the smaller surface area (11295 against 1267000)."}}},
{"id":"n-11331134","guard":[["hasAny",["has","sudan"]],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Costa Rica or Sudan":"Costa Rica has the smaller surface area (51100 against 1886068)."}}},
{"id":"n-1300cb17","guard":[["hasAny",["jamaica","mali"]],["has","jamaica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Jamaica and Mali, which has the lesser surface area":"Jamaica has the smaller surface area (10990 against 1240192)."}}},
{"id":"n-141f664a","guard":[["hasAny",["sudan","tokelau"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Sudan and Tokelau, which has the lesser surface area":"Tokelau has the smaller surface area (12 against 1886068)."}}},
{"id":"n-1594a24c","guard":[["hasAny",["area","argentina","namibia","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Argentina or Namibia":"Namibia has the smaller surface area (824292 against 2780400)."}}},
{"id":"n-1868e4bd","guard":[["hasAny",["egypt","jordan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Egypt or Jordan":"Jordan has the smaller surface area (88946 against 1001449)."}}},
{"id":"n-19fb9e41","guard":[["hasAny",["dominican","poland"]],["has","poland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Poland and Dominican Republic, which has the lesser surface area":"Dominican Republic has the smaller surface area (48511 against 323250)."}}},
{"id":"n-1a514c00","guard":[["has","poland"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Switzerland or Poland":"Switzerland has the smaller surface area (41284 against 323250)."}}},
{"id":"n-1aa48c1f","guard":[["hasAny",["area","belarus","hong","kong","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Belarus or Hong Kong":"Hong Kong has the smaller surface area (1075 against 207600)."}}},
{"id":"n-1be1dd63","guard":[["hasAny",["area","has","island","leone","norfolk","sierra","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Norfolk Island or Sierra Leone":"Norfolk Island has the smaller surface area (36 against 71740)."}}},
{"id":"n-1e88a4f2","guard":[["hasAny",["has","leone","sierra"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Norfolk Island or Sierra Leone":"Norfolk Island has the smaller surface area (36 against 71740)."}}},
{"id":"n-1f1bf691","guard":[["hasAny",["area","has","niger","principe","sao","smaller","surface","tome"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Sao Tome and Principe or Niger":"Sao Tome and Principe has the smaller surface area (964 against 1267000)."}}},
{"id":"n-210a1165","guard":[["hasAny",["area","macedonia","north","smaller","surface","sweden"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Sweden or North Macedonia":"North Macedonia has the smaller surface area (25713 against 449964)."}}},
{"id":"n-21a20682","guard":[["hasAny",["area","bolivia","smaller","surface","venezuela"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Venezuela or Bolivia":"Venezuela has the smaller surface area (912050 against 1098581)."}}},
{"id":"n-21f226ea","guard":[["hasAny",["area","between","futuna","has","lesser","oman","surface","wallis"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Oman and Wallis and Futuna, which has the lesser surface area":"Wallis and Futuna has the smaller surface area (200 against 309500)."}}},
{"id":"n-22067c86","guard":[["hasAny",["afghanistan","between","lesser"]],["has","lesser"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between British Indian Ocean Territory and Afghanistan, which has the lesser surface area":"British Indian Ocean Territory has the smaller surface area (78 against 652090)."}}},
{"id":"n-25c56eb6","guard":[["hasAny",["has","niger"]],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Sao Tome and Principe or Niger":"Sao Tome and Principe has the smaller surface area (964 against 1267000)."}}},
{"id":"n-282df172","guard":[["hasAny",["area","dominican","iceland","republic","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Dominican Republic or Iceland":"Dominican Republic has the smaller surface area (48511 against 103000)."}}},
{"id":"n-28ce665e","guard":[["hasAny",["area","between","has","lesser","pakistan","sahara","surface","western"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Western Sahara and Pakistan, which has the lesser surface area":"Western Sahara has the smaller surface area (266000 against 796095)."}}},
{"id":"n-295c437c","guard":[["hasAny",["france","marshall"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between France and Marshall Islands, which has the lesser surface area":"Marshall Islands has the smaller surface area (181 against 551500)."}}},
{"id":"n-299bbf9c","guard":[["has","gambia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Gambia or Estonia":"Gambia has the smaller surface area (11295 against 45227)."}}},
{"id":"n-2a10a97c","guard":[["has","uganda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Malawi or Uganda":"Malawi has the smaller surface area (118484 against 241038)."}}},
{"id":"n-2dd4060b","guard":[["hasAny",["area","bermuda","pakistan","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Pakistan or Bermuda":"Bermuda has the smaller surface area (53 against 796095)."}}},
{"id":"n-2ddb925a","guard":[["hasAny",["area","between","has","lesser","sudan","surface","tokelau"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Sudan and Tokelau, which has the lesser surface area":"Tokelau has the smaller surface area (12 against 1886068)."}}},
{"id":"n-2fbe9985","guard":[["has","peru"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Peru or Greece":"Greece has the smaller surface area (131626 against 1285216)."}}},
{"id":"n-3033c869","guard":[["has","guatemala"],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Bolivia or Guatemala":"Guatemala has the smaller surface area (108889 against 1098581)."}}},
{"id":"n-3257164b","guard":[["hasAny",["area","argentina","namibia","smaller","surface"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Argentina or Namibia":"Namibia has the smaller surface area (824292 against 2780400)."}}},
{"id":"n-32f576ff","guard":[["hasAny",["angola","area","czech","has","republic","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Czech Republic or Angola":"Czech Republic has the smaller surface area (78866 against 1246700)."}}},
{"id":"n-336b45f7","guard":[["hasAny",["area","ecuador","island","norfolk","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Ecuador or Norfolk Island":"Norfolk Island has the smaller surface area (36 against 283561)."}}},
{"id":"n-359dd4c7","guard":[["hasAny",["antarctica","area","has","philippines","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Antarctica or Philippines":"Philippines has the smaller surface area (300000 against 13120000)."}}},
{"id":"n-36807a74","guard":[["hasAny",["laos","maldives"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Maldives or Laos":"Maldives has the smaller surface area (298 against 236800)."}}},
{"id":"n-377e4af4","guard":[["hasAny",["area","egypt","has","jordan","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Egypt or Jordan":"Jordan has the smaller surface area (88946 against 1001449)."}}},
{"id":"n-3792a71a","guard":[["hasAny",["belgium","helena"]],["has","belgium"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Belgium and Saint Helena, which has the lesser surface area":"Saint Helena has the smaller surface area (314 against 30518)."}}},
{"id":"n-38e9488a","guard":[["hasAny",["area","chad","dominica","has","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Chad or Dominica":"Dominica has the smaller surface area (751 against 1284000)."}}},
{"id":"n-3948ee1c","guard":[["hasAny",["islands","solomon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Solomon Islands or Czech Republic":"Solomon Islands has the smaller surface area (28896 against 78866)."}}},
{"id":"n-39563c7e","guard":[["hasAny",["area","argentina","between","guatemala","has","lesser","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Guatemala and Argentina, which has the lesser surface area":"Guatemala has the smaller surface area (108889 against 2780400)."}}},
{"id":"n-39e0d282","guard":[["hasAny",["africa","area","cocos","islands","keeling","smaller","south","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: South Africa or Cocos (Keeling) Islands":"Cocos (Keeling) Islands has the smaller surface area (14 against 1221037)."}}},
{"id":"n-3aa43ef1","guard":[["hasAny",["area","brunei","equatorial","guinea","has","smaller","surface"]],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Brunei or Equatorial Guinea":"Brunei has the smaller surface area (5765 against 28051)."}}},
{"id":"n-3c69222c","guard":[["hasAny",["dominica","lithuania"]],["has","dominica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Dominica and Lithuania, which has the lesser surface area":"Dominica has the smaller surface area (751 against 65301)."}}},
{"id":"n-3dddebbe","guard":[["hasAny",["area","british","has","islands","namibia","smaller","surface","virgin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Namibia or British Virgin Islands":"British Virgin Islands has the smaller surface area (151 against 824292)."}}},
{"id":"n-3e6ac08a","guard":[["hasAny",["area","between","dominican","has","lesser","poland","republic","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Poland and Dominican Republic, which has the lesser surface area":"Dominican Republic has the smaller surface area (48511 against 323250)."}}},
{"id":"n-3e9f823b","guard":[["hasAny",["area","chad","lesotho","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Lesotho or Chad":"Lesotho has the smaller surface area (30355 against 1284000)."}}},
{"id":"n-42ae9b6f","guard":[["has","portugal"],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Iceland or Portugal":"Portugal has the smaller surface area (91982 against 103000)."}}},
{"id":"n-43f4330e","guard":[["hasAny",["africa","laos"]],["has","laos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Laos and South Africa, which has the lesser surface area":"Laos has the smaller surface area (236800 against 1221037)."}}},
{"id":"n-447a074b","guard":[["hasAny",["area","has","malawi","smaller","surface","uganda"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Malawi or Uganda":"Malawi has the smaller surface area (118484 against 241038)."}}},
{"id":"n-456207d6","guard":[["has","belgium"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Comoros or Belgium":"Comoros has the smaller surface area (1862 against 30518)."}}},
{"id":"n-45a95e43","guard":[["hasAny",["sweden","uruguay"]],["has","sweden"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Uruguay and Sweden, which has the lesser surface area":"Uruguay has the smaller surface area (175016 against 449964)."}}},
{"id":"n-468ce725","guard":[["hasAny",["afghanistan","area","between","british","has","indian","lesser","ocean","surface","territory"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between British Indian Ocean Territory and Afghanistan, which has the lesser surface area":"British Indian Ocean Territory has the smaller surface area (78 against 652090)."}}},
{"id":"n-46df3b00","guard":[["hasAny",["area","costa","kenya","rica","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Kenya or Costa Rica":"Costa Rica has the smaller surface area (51100 against 580367)."}}},
{"id":"n-47c0546a","guard":[["hasAny",["area","comoros","lithuania","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Lithuania or Comoros":"Comoros has the smaller surface area (1862 against 65301)."}}},
{"id":"n-47c49a97","guard":[["hasAny",["helena","saint"]],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Saint Helena or Ethiopia":"Saint Helena has the smaller surface area (314 against 1104300)."}}},
{"id":"n-48b17349","guard":[["hasAny",["area","estonia","gambia","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Gambia or Estonia":"Gambia has the smaller surface area (11295 against 45227)."}}},
{"id":"n-4adf189d","guard":[["hasAny",["area","brazil","nicaragua","smaller","surface"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Brazil or Nicaragua":"Nicaragua has the smaller surface area (130000 against 8547403)."}}},
{"id":"n-4c4a7501","guard":[["hasAny",["area","between","british","djibouti","has","islands","lesser","surface","virgin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between British Virgin Islands and Djibouti, which has the lesser surface area":"British Virgin Islands has the smaller surface area (151 against 23200)."}}},
{"id":"n-4c7f0cc1","guard":[["hasAny",["area","between","has","lesser","portugal","surface","venezuela"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Portugal and Venezuela, which has the lesser surface area":"Portugal has the smaller surface area (91982 against 912050)."}}},
{"id":"n-4ce6eba6","guard":[["hasAny",["area","between","has","islands","lesser","surface","vanuatu","virgin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between U.S. Virgin Islands and Vanuatu, which has the lesser surface area":"U.S. Virgin Islands has the smaller surface area (347 against 12189)."}}},
{"id":"n-4dff7f2f","guard":[["hasAny",["area","between","has","lesser","macao","russia","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Russia and Macao, which has the lesser surface area":"Macao has the smaller surface area (18 against 17075400)."}}},
{"id":"n-4e80bebd","guard":[["hasAny",["african","area","between","central","has","lesser","mexico","republic","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Central African Republic and Mexico, which has the lesser surface area":"Central African Republic has the smaller surface area (622984 against 1958201)."}}},
{"id":"n-4f549326","guard":[["has","netherlands"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, North Macedonia or Netherlands":"North Macedonia has the smaller surface area (25713 against 41526)."}}},
{"id":"n-4fa9643d","guard":[["hasAny",["area","haiti","mexico","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Mexico or Haiti":"Haiti has the smaller surface area (27750 against 1958201)."}}},
{"id":"n-52108bd5","guard":[["hasAny",["area","between","has","lesser","peru","qatar","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Qatar and Peru, which has the lesser surface area":"Qatar has the smaller surface area (11000 against 1285216)."}}},
{"id":"n-53d04a19","guard":[["hasAny",["belarus","nauru"]],["has","lesser"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Nauru and Belarus, which has the lesser surface area":"Nauru has the smaller surface area (21 against 207600)."}}},
{"id":"n-58fa2b7f","guard":[["has","angola"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Czech Republic or Angola":"Czech Republic has the smaller surface area (78866 against 1246700)."}}},
{"id":"n-591edf45","guard":[["hasAny",["area","greece","peru","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Peru or Greece":"Greece has the smaller surface area (131626 against 1285216)."}}},
{"id":"n-5950c47e","guard":[["has","pakistan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Pakistan or Bermuda":"Bermuda has the smaller surface area (53 against 796095)."}}},
{"id":"n-5de843e7","guard":[["has","nigeria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Germany or Nigeria":"Germany has the smaller surface area (357022 against 923768)."}}},
{"id":"n-600f4016","guard":[["hasAny",["area","french","guiana","has","smaller","southern","surface","territories"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, French Southern territories or French Guiana":"French Southern territories has the smaller surface area (7780 against 90000)."}}},
{"id":"n-601157b8","guard":[["hasAny",["area","guyana","smaller","surface","vanuatu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Vanuatu or Guyana":"Vanuatu has the smaller surface area (12189 against 214969)."}}},
{"id":"n-61b3832f","guard":[["hasAny",["macao","russia"]],["has","macao"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Russia and Macao, which has the lesser surface area":"Macao has the smaller surface area (18 against 17075400)."}}},
{"id":"n-6617cfe5","guard":[["has","cameroon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Cameroon or Sao Tome and Principe":"Sao Tome and Principe has the smaller surface area (964 against 475442)."}}},
{"id":"n-664d8120","guard":[["hasAny",["area","costa","has","rica","smaller","sudan","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Costa Rica or Sudan":"Costa Rica has the smaller surface area (51100 against 1886068)."}}},
{"id":"n-688552bf","guard":[["hasAny",["area","ghana","rwanda","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Ghana or Rwanda":"Rwanda has the smaller surface area (26338 against 238533)."}}},
{"id":"n-692429ef","guard":[["hasAny",["area","between","has","lesser","surface","sweden","uruguay"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Uruguay and Sweden, which has the lesser surface area":"Uruguay has the smaller surface area (175016 against 449964)."}}},
{"id":"n-69d27d53","guard":[["hasAny",["area","jan","maldives","mayen","smaller","surface","svalbard"]],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Svalbard and Jan Mayen or Maldives":"Maldives has the smaller surface area (298 against 62422)."}}},
{"id":"n-6b36186f","guard":[["hasAny",["argentina","guatemala"]],["has","lesser"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Guatemala and Argentina, which has the lesser surface area":"Guatemala has the smaller surface area (108889 against 2780400)."}}},
{"id":"n-6cff7c95","guard":[["hasAny",["area","between","has","kenya","leone","lesser","sierra","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Sierra Leone and Kenya, which has the lesser surface area":"Sierra Leone has the smaller surface area (71740 against 580367)."}}},
{"id":"n-6db639c3","guard":[["hasAny",["korea","nigeria"]],["words>=",11]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Nigeria and South Korea, which has the lesser surface area":"South Korea has the smaller surface area (99434 against 923768)."}}},
{"id":"n-6e073f58","guard":[["hasAny",["area","belgium","between","has","helena","lesser","saint","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Belgium and Saint Helena, which has the lesser surface area":"Saint Helena has the smaller surface area (314 against 30518)."}}},
{"id":"n-6e0ec6de","guard":[["hasAny",["brunei","south"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: South Korea or Brunei":"Brunei has the smaller surface area (5765 against 99434)."}}},
{"id":"n-6fdbb262","guard":[["has","oman"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Haiti or Oman":"Haiti has the smaller surface area (27750 against 309500)."}}},
{"id":"n-700a1e71","guard":[["hasAny",["states","united"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: United States or French Southern territories":"French Southern territories has the smaller surface area (7780 against 9363520)."}}},
{"id":"n-7046a875","guard":[["hasAny",["area","caledonia","kitts","nevis","new","saint","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Saint Kitts and Nevis or New Caledonia":"Saint Kitts and Nevis has the smaller surface area (261 against 18575)."}}},
{"id":"n-705bdc07","guard":[["hasAny",["ecuador","jordan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Jordan and Ecuador, which has the lesser surface area":"Jordan has the smaller surface area (88946 against 283561)."}}},
{"id":"n-7258c8b8","guard":[["hasAny",["futuna","oman","wallis"]],["has","oman"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Oman and Wallis and Futuna, which has the lesser surface area":"Wallis and Futuna has the smaller surface area (200 against 309500)."}}},
{"id":"n-749b2985","guard":[["hasAny",["brazil","singapore"]],["has","lesser"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Singapore and Brazil, which has the lesser surface area":"Singapore has the smaller surface area (618 against 8547403)."}}},
{"id":"n-76bcda9c","guard":[["hasAny",["area","estonia","has","nauru","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Estonia or Nauru":"Nauru has the smaller surface area (21 against 45227)."}}},
{"id":"n-77b1eb04","guard":[["hasAny",["french","guiana","lesotho"]],["has","between"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between French Guiana and Lesotho, which has the lesser surface area":"Lesotho has the smaller surface area (30355 against 90000)."}}},
{"id":"n-799f1112","guard":[["hasAny",["africa","south"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: South Africa or Cocos (Keeling) Islands":"Cocos (Keeling) Islands has the smaller surface area (14 against 1221037)."}}},
{"id":"n-79e59d85","guard":[["has","venezuela"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Venezuela or Bolivia":"Venezuela has the smaller surface area (912050 against 1098581)."}}},
{"id":"n-7a1cf25f","guard":[["hasAny",["area","korea","macao","north","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Macao or North Korea":"Macao has the smaller surface area (18 against 120538)."}}},
{"id":"n-7ad7b4c4","guard":[["has","kenya"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Kenya or Costa Rica":"Costa Rica has the smaller surface area (51100 against 580367)."}}},
{"id":"n-7bc3c4e7","guard":[["has","palestine"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Palestine or Malawi":"Palestine has the smaller surface area (6257 against 118484)."}}},
{"id":"n-7e1b0e8e","guard":[["hasAny",["area","brunei","korea","smaller","south","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: South Korea or Brunei":"Brunei has the smaller surface area (5765 against 99434)."}}},
{"id":"n-7ec94b02","guard":[["has","sweden"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Sweden or North Macedonia":"North Macedonia has the smaller surface area (25713 against 449964)."}}},
{"id":"n-805a8a4a","guard":[["hasAny",["area","between","brazil","has","lesser","singapore","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Singapore and Brazil, which has the lesser surface area":"Singapore has the smaller surface area (618 against 8547403)."}}},
{"id":"n-8198381d","guard":[["hasAny",["area","greece","has","islands","smaller","surface","virgin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Greece or U.S. Virgin Islands":"U.S. Virgin Islands has the smaller surface area (347 against 131626)."}}},
{"id":"n-828b60d3","guard":[["hasAny",["area","bolivia","guatemala","has","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Bolivia or Guatemala":"Guatemala has the smaller surface area (108889 against 1098581)."}}},
{"id":"n-82c9feb4","guard":[["has","rwanda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Rwanda or Central African Republic":"Rwanda has the smaller surface area (26338 against 622984)."}}},
{"id":"n-83d42439","guard":[["has","qatar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Cocos (Keeling) Islands or Qatar":"Cocos (Keeling) Islands has the smaller surface area (14 against 11000)."}}},
{"id":"n-87fd43e8","guard":[["hasAny",["kitts","nevis","saint"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Saint Kitts and Nevis or New Caledonia":"Saint Kitts and Nevis has the smaller surface area (261 against 18575)."}}},
{"id":"n-88fe6a3a","guard":[["hasAny",["area","jan","maldives","mayen","smaller","surface","svalbard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Svalbard and Jan Mayen or Maldives":"Maldives has the smaller surface area (298 against 62422)."}}},
{"id":"n-894c906c","guard":[["hasAny",["area","ghana","rwanda","smaller","surface"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Ghana or Rwanda":"Rwanda has the smaller surface area (26338 against 238533)."}}},
{"id":"n-8a419451","guard":[["hasAny",["area","cocos","has","islands","keeling","qatar","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Cocos (Keeling) Islands or Qatar":"Cocos (Keeling) Islands has the smaller surface area (14 against 11000)."}}},
{"id":"n-8bce1665","guard":[["hasAny",["france","has"]],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Hong Kong or France":"Hong Kong has the smaller surface area (1075 against 551500)."}}},
{"id":"n-8be3b3ac","guard":[["hasAny",["ghana","uganda"]],["has","uganda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Uganda and Ghana, which has the lesser surface area":"Ghana has the smaller surface area (238533 against 241038)."}}},
{"id":"n-8e43bc45","guard":[["hasAny",["area","mali","mongolia","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Mali or Mongolia":"Mali has the smaller surface area (1240192 against 1566500)."}}},
{"id":"n-90387592","guard":[["hasAny",["area","france","has","hong","kong","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Hong Kong or France":"Hong Kong has the smaller surface area (1075 against 551500)."}}},
{"id":"n-93df5c90","guard":[["has","jamaica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, North Korea or Jamaica":"Jamaica has the smaller surface area (10990 against 120538)."}}},
{"id":"n-944af76d","guard":[["hasAny",["portugal","venezuela"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Portugal and Venezuela, which has the lesser surface area":"Portugal has the smaller surface area (91982 against 912050)."}}},
{"id":"n-94746ce2","guard":[["hasAny",["area","between","has","lesser","netherlands","palestine","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Netherlands and Palestine, which has the lesser surface area":"Palestine has the smaller surface area (6257 against 41526)."}}},
{"id":"n-94ad463c","guard":[["hasAny",["area","caledonia","has","new","singapore","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, New Caledonia or Singapore":"Singapore has the smaller surface area (618 against 18575)."}}},
{"id":"n-972a75c0","guard":[["hasAny",["andorra","states","united"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Andorra and United States, which has the lesser surface area":"Andorra has the smaller surface area (468 against 9363520)."}}},
{"id":"n-995a6471","guard":[["hasAny",["nicaragua","smaller"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Nicaragua or British Indian Ocean Territory":"British Indian Ocean Territory has the smaller surface area (78 against 130000)."}}},
{"id":"n-9da3126f","guard":[["hasAny",["peru","qatar"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Qatar and Peru, which has the lesser surface area":"Qatar has the smaller surface area (11000 against 1285216)."}}},
{"id":"n-9e7ab0e1","guard":[["hasAny",["cuba","smaller"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Cuba or Western Sahara":"Cuba has the smaller surface area (110861 against 266000)."}}},
{"id":"n-a01e9ac9","guard":[["hasAny",["area","ethiopia","helena","saint","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Saint Helena or Ethiopia":"Saint Helena has the smaller surface area (314 against 1104300)."}}},
{"id":"n-a05f58f6","guard":[["hasAny",["african","area","central","has","republic","rwanda","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Rwanda or Central African Republic":"Rwanda has the smaller surface area (26338 against 622984)."}}},
{"id":"n-a1250cb0","guard":[["hasAny",["andorra","area","between","has","lesser","states","surface","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Andorra and United States, which has the lesser surface area":"Andorra has the smaller surface area (468 against 9363520)."}}},
{"id":"n-a2fa8477","guard":[["hasAny",["area","has","iceland","portugal","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Iceland or Portugal":"Portugal has the smaller surface area (91982 against 103000)."}}},
{"id":"n-a42189da","guard":[["hasAny",["area","belgium","comoros","has","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Comoros or Belgium":"Comoros has the smaller surface area (1862 against 30518)."}}},
{"id":"n-a67adc27","guard":[["hasAny",["area","belarus","between","has","lesser","nauru","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Nauru and Belarus, which has the lesser surface area":"Nauru has the smaller surface area (21 against 207600)."}}},
{"id":"n-a7f9d5bc","guard":[["has","chile"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Mongolia or Chile":"Chile has the smaller surface area (756626 against 1566500)."}}},
{"id":"n-a829d784","guard":[["has","macao"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Macao or North Korea":"Macao has the smaller surface area (18 against 120538)."}}},
{"id":"n-aa543637","guard":[["hasAny",["area","between","equatorial","guinea","has","jan","lesser","mayen","surface","svalbard"]],["has","lesser"],["has","surface"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Equatorial Guinea and Svalbard and Jan Mayen, which has the lesser surface area":"Equatorial Guinea has the smaller surface area (28051 against 62422)."}}},
{"id":"n-aab20535","guard":[["hasAny",["area","has","poland","smaller","surface","switzerland"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Switzerland or Poland":"Switzerland has the smaller surface area (41284 against 323250)."}}},
{"id":"n-ab11917f","guard":[["has","lithuania"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Lithuania or Comoros":"Comoros has the smaller surface area (1862 against 65301)."}}},
{"id":"n-ac85d11e","guard":[["has","nauru"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Estonia or Nauru":"Nauru has the smaller surface area (21 against 45227)."}}},
{"id":"n-ae39c076","guard":[["hasAny",["guiana","has"]],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, French Southern territories or French Guiana":"French Southern territories has the smaller surface area (7780 against 90000)."}}},
{"id":"n-b05c16c3","guard":[["hasAny",["area","georgia","has","islands","malta","sandwich","smaller","south","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, South Georgia and the South Sandwich Islands or Malta":"Malta has the smaller surface area (316 against 3903)."}}},
{"id":"n-b2aa1f5b","guard":[["hasAny",["afghanistan","area","smaller","surface","switzerland"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Afghanistan or Switzerland":"Switzerland has the smaller surface area (41284 against 652090)."}}},
{"id":"n-b2cc4255","guard":[["hasAny",["area","chile","has","mongolia","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Mongolia or Chile":"Chile has the smaller surface area (756626 against 1566500)."}}},
{"id":"n-b5448f42","guard":[["hasAny",["area","british","has","indian","nicaragua","ocean","smaller","surface","territory"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Nicaragua or British Indian Ocean Territory":"British Indian Ocean Territory has the smaller surface area (78 against 130000)."}}},
{"id":"n-b54b8d74","guard":[["hasAny",["malta","solomon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Malta and Solomon Islands, which has the lesser surface area":"Malta has the smaller surface area (316 against 28896)."}}},
{"id":"n-b687c20b","guard":[["hasAny",["kenya","leone","sierra"]],["has","between"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Sierra Leone and Kenya, which has the lesser surface area":"Sierra Leone has the smaller surface area (71740 against 580367)."}}},
{"id":"n-b68f33ed","guard":[["hasAny",["area","georgia","islands","marshall","sandwich","smaller","south","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Marshall Islands or South Georgia and the South Sandwich Islands":"Marshall Islands has the smaller surface area (181 against 3903)."}}},
{"id":"n-b6ee6eda","guard":[["hasAny",["area","between","ghana","has","lesser","surface","uganda"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Uganda and Ghana, which has the lesser surface area":"Ghana has the smaller surface area (238533 against 241038)."}}},
{"id":"n-b7b8e254","guard":[["hasAny",["area","germany","has","nigeria","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Germany or Nigeria":"Germany has the smaller surface area (357022 against 923768)."}}},
{"id":"n-b8628295","guard":[["hasAny",["area","haiti","has","oman","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Haiti or Oman":"Haiti has the smaller surface area (27750 against 309500)."}}},
{"id":"n-ba9fd01f","guard":[["hasAny",["netherlands","palestine"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Netherlands and Palestine, which has the lesser surface area":"Palestine has the smaller surface area (6257 against 41526)."}}},
{"id":"n-bbae5371","guard":[["hasAny",["area","brunei","equatorial","guinea","has","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Brunei or Equatorial Guinea":"Brunei has the smaller surface area (5765 against 28051)."}}},
{"id":"n-bbd685cf","guard":[["hasAny",["area","between","chile","has","kitts","lesser","nevis","saint","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Chile and Saint Kitts and Nevis, which has the lesser surface area":"Saint Kitts and Nevis has the smaller surface area (261 against 756626)."}}},
{"id":"n-bcb5779d","guard":[["has","mexico"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Mexico or Haiti":"Haiti has the smaller surface area (27750 against 1958201)."}}},
{"id":"n-bf788467","guard":[["hasAny",["area","between","cameroon","has","lesser","surface","suriname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Suriname and Cameroon, which has the lesser surface area":"Suriname has the smaller surface area (163265 against 475442)."}}},
{"id":"n-c1bb9fe4","guard":[["hasAny",["cameroon","suriname"]],["has","lesser"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Suriname and Cameroon, which has the lesser surface area":"Suriname has the smaller surface area (163265 against 475442)."}}},
{"id":"n-c2356e2c","guard":[["hasAny",["area","cameroon","principe","sao","smaller","surface","tome"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Cameroon or Sao Tome and Principe":"Sao Tome and Principe has the smaller surface area (964 against 475442)."}}},
{"id":"n-c23932e9","guard":[["hasAny",["area","between","gambia","has","lesser","niger","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Niger and Gambia, which has the lesser surface area":"Gambia has the smaller surface area (11295 against 1267000)."}}},
{"id":"n-c27c0f61","guard":[["has","lesotho"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Lesotho or Chad":"Lesotho has the smaller surface area (30355 against 1284000)."}}},
{"id":"n-c5ff1d0b","guard":[["hasAny",["has","malta"]],["has","surface"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, South Georgia and the South Sandwich Islands or Malta":"Malta has the smaller surface area (316 against 3903)."}}},
{"id":"n-c6593226","guard":[["has","suriname"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Bermuda or Suriname":"Bermuda has the smaller surface area (53 against 163265)."}}},
{"id":"n-c700cfd4","guard":[["hasAny",["area","czech","islands","republic","smaller","solomon","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Solomon Islands or Czech Republic":"Solomon Islands has the smaller surface area (28896 against 78866)."}}},
{"id":"n-c767ee01","guard":[["hasAny",["area","between","france","has","islands","lesser","marshall","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between France and Marshall Islands, which has the lesser surface area":"Marshall Islands has the smaller surface area (181 against 551500)."}}},
{"id":"n-c80ca319","guard":[["hasAny",["area","between","has","islands","lesser","malta","solomon","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Malta and Solomon Islands, which has the lesser surface area":"Malta has the smaller surface area (316 against 28896)."}}},
{"id":"n-c9d2b837","guard":[["hasAny",["antigua","area","barbuda","smaller","surface","tokelau"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Tokelau or Antigua and Barbuda":"Tokelau has the smaller surface area (12 against 442)."}}},
{"id":"n-cadcd4a1","guard":[["hasAny",["area","between","dominica","has","lesser","lithuania","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Dominica and Lithuania, which has the lesser surface area":"Dominica has the smaller surface area (751 against 65301)."}}},
{"id":"n-cd0c0e08","guard":[["hasAny",["dominican","republic"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Dominican Republic or Iceland":"Dominican Republic has the smaller surface area (48511 against 103000)."}}},
{"id":"n-ce08b619","guard":[["hasAny",["area","has","macedonia","netherlands","north","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, North Macedonia or Netherlands":"North Macedonia has the smaller surface area (25713 against 41526)."}}},
{"id":"n-d124a6a5","guard":[["hasAny",["andorra","area","guyana","has","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Guyana or Andorra":"Andorra has the smaller surface area (468 against 214969)."}}},
{"id":"n-d1cb7e53","guard":[["hasAny",["chile","kitts","nevis"]],["has","chile"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Chile and Saint Kitts and Nevis, which has the lesser surface area":"Saint Kitts and Nevis has the smaller surface area (261 against 756626)."}}},
{"id":"n-d2064927","guard":[["has","vanuatu"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Vanuatu or Guyana":"Vanuatu has the smaller surface area (12189 against 214969)."}}},
{"id":"n-d22437bc","guard":[["hasAny",["has","russia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Antigua and Barbuda or Russia":"Antigua and Barbuda has the smaller surface area (442 against 17075400)."}}},
{"id":"n-d34f7e30","guard":[["hasAny",["area","bermuda","has","smaller","surface","suriname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Bermuda or Suriname":"Bermuda has the smaller surface area (53 against 163265)."}}},
{"id":"n-d5005c3f","guard":[["has","pakistan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Western Sahara and Pakistan, which has the lesser surface area":"Western Sahara has the smaller surface area (266000 against 796095)."}}},
{"id":"n-d5ae5249","guard":[["has","belarus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Belarus or Hong Kong":"Hong Kong has the smaller surface area (1075 against 207600)."}}},
{"id":"n-d71dfbf9","guard":[["has","mexico"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Central African Republic and Mexico, which has the lesser surface area":"Central African Republic has the smaller surface area (622984 against 1958201)."}}},
{"id":"n-d9cb4367","guard":[["hasAny",["area","has","jamaica","korea","north","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, North Korea or Jamaica":"Jamaica has the smaller surface area (10990 against 120538)."}}},
{"id":"n-de74ced1","guard":[["hasAny",["area","malawi","palestine","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Palestine or Malawi":"Palestine has the smaller surface area (6257 against 118484)."}}},
{"id":"n-dfbb23bc","guard":[["has","andorra"],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Guyana or Andorra":"Andorra has the smaller surface area (468 against 214969)."}}},
{"id":"n-dfeea90e","guard":[["has","mali"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Mali or Mongolia":"Mali has the smaller surface area (1240192 against 1566500)."}}},
{"id":"n-e0dcb64d","guard":[["hasAny",["africa","area","between","has","laos","lesser","south","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Laos and South Africa, which has the lesser surface area":"Laos has the smaller surface area (236800 against 1221037)."}}},
{"id":"n-e215d7f7","guard":[["has","namibia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Namibia or British Virgin Islands":"British Virgin Islands has the smaller surface area (151 against 824292)."}}},
{"id":"n-e47b9e2d","guard":[["hasAny",["area","french","smaller","southern","states","surface","territories","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: United States or French Southern territories":"French Southern territories has the smaller surface area (7780 against 9363520)."}}},
{"id":"n-e4e5d070","guard":[["hasAny",["area","cuba","futuna","smaller","surface","wallis"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Wallis and Futuna or Cuba":"Wallis and Futuna has the smaller surface area (200 against 110861)."}}},
{"id":"n-e7383431","guard":[["has","ecuador"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Ecuador or Norfolk Island":"Norfolk Island has the smaller surface area (36 against 283561)."}}},
{"id":"n-e762b0de","guard":[["hasAny",["area","brazil","nicaragua","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Brazil or Nicaragua":"Nicaragua has the smaller surface area (130000 against 8547403)."}}},
{"id":"n-e91d7e5d","guard":[["hasAny",["area","has","laos","maldives","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Maldives or Laos":"Maldives has the smaller surface area (298 against 236800)."}}},
{"id":"n-e946752c","guard":[["hasAny",["cayman","islands"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Cayman Islands or Antarctica":"Cayman Islands has the smaller surface area (264 against 13120000)."}}},
{"id":"n-ec1f3ae6","guard":[["hasAny",["area","between","ecuador","has","jordan","lesser","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Jordan and Ecuador, which has the lesser surface area":"Jordan has the smaller surface area (88946 against 283561)."}}},
{"id":"n-ec29ebe3","guard":[["has","tokelau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Tokelau or Antigua and Barbuda":"Tokelau has the smaller surface area (12 against 442)."}}},
{"id":"n-ec3c5068","guard":[["hasAny",["area","cuba","futuna","smaller","surface","wallis"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Wallis and Futuna or Cuba":"Wallis and Futuna has the smaller surface area (200 against 110861)."}}},
{"id":"n-ef93ac14","guard":[["hasAny",["area","cuba","has","sahara","smaller","surface","western"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Cuba or Western Sahara":"Cuba has the smaller surface area (110861 against 266000)."}}},
{"id":"n-efcb2706","guard":[["has","djibouti"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Djibouti or Germany":"Djibouti has the smaller surface area (23200 against 357022)."}}},
{"id":"n-f17947e8","guard":[["hasAny",["angola","area","between","cayman","has","islands","lesser","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Angola and Cayman Islands, which has the lesser surface area":"Cayman Islands has the smaller surface area (264 against 1246700)."}}},
{"id":"n-f513cd5b","guard":[["has","uruguay"],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller surface area, Ethiopia or Uruguay":"Uruguay has the smaller surface area (175016 against 1104300)."}}},
{"id":"n-fa8cda59","guard":[["hasAny",["angola","cayman"]],["has","angola"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Angola and Cayman Islands, which has the lesser surface area":"Cayman Islands has the smaller surface area (264 against 1246700)."}}},
{"id":"n-fc65c59d","guard":[["has","afghanistan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Afghanistan or Switzerland":"Switzerland has the smaller surface area (41284 against 652090)."}}},
{"id":"n-fdf68569","guard":[["hasAny",["area","between","french","guiana","has","lesotho","lesser","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between French Guiana and Lesotho, which has the lesser surface area":"Lesotho has the smaller surface area (30355 against 90000)."}}},
{"id":"n-ffe90bb8","guard":[["hasAny",["antarctica","area","cayman","islands","smaller","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose surface area is smaller: Cayman Islands or Antarctica":"Cayman Islands has the smaller surface area (264 against 13120000)."}}},
{"id":"n-4d48b7a5","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","smaller"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":3}]],"mem":null},
{"id":"n-4f58da42","guard":[["hasAny",["comoros","delete","remove","strip out","without"]],["has","belgium"]],"pyramid":["render.str",["transform.remove",{"lit":"Comoros"},["sense.lastWord"]]],"mem":null},
{"id":"n-5f1584ff","guard":[["hasAny",["brunei","delete","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",{"lit":"Brunei"},["sense.lastWord"]]],"mem":null},
{"id":"n-9d8a8d65","guard":[["hasAny",["element","item number","malta","nth","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":10}]],"mem":null},
{"id":"n-c9b00a27","guard":[["hasAny",["delete","dominica","remove","strip out","without"]],["has","between"]],"pyramid":["render.str",["transform.remove",{"lit":"Dominica"},["sense.lastWord"]]],"mem":null},
{"id":"n-d8a2cb59","guard":[["hasAny",["bermuda","delete","remove","strip out","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",{"lit":"Bermuda"},["sense.lastWord"]]],"mem":null},
{"id":"n-f568474c","guard":[["hasAny",["andorra","delete","remove","strip out","without"]],["has","united"]],"pyramid":["render.str",["transform.remove",{"lit":"Andorra"},["sense.lastWord"]]],"mem":null},
{"id":"n-43f4f960","guard":[["hasAny",["element","item number","laos","nth","position"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the smaller ",{"slot":1}," ",{"slot":2}," (236800 against 1221037)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-5abe8c80","guard":[["hasAny",["element","item number","lesotho","nth","position","shortest","shortest one","shortest word"]],["has","french"]],"pyramid":["render.template",{"lit":["Lesotho ",{"slot":0}," the smaller ",{"slot":1}," ",{"slot":2}," (30355 against 90000)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-a9ea7fb3","guard":[["hasAny",["andorra","element","item number","nth","position"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the smaller ",{"slot":1}," ",{"slot":2}," (468 against 9363520)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-b5e2af31","guard":[["hasAny",["element","item number","laos","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["Laos ",{"slot":0}," the smaller ",{"slot":1}," ",{"slot":2}," (236800 against 1221037)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-f6820705","guard":[["hasAny",["andorra","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["Andorra ",{"slot":0}," the smaller ",{"slot":1}," ",{"slot":2}," (468 against 9363520)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-1f9060a3","guard":[["hasAny",["element","item number","lesotho","nth","position"]],["has","french"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the smaller ",{"slot":1}," ",{"slot":2}," (30355 against 90000)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-9640f457","guard":[["hasAny",["andorra","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," area (468 against 9363520)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-d6b06ffb","guard":[["hasAny",["element","item number","laos","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," area (236800 against 1221037)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-1f3b9eff","guard":[["hasAny",["element","item number","nth","philippines","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":["Philippines ",{"slot":0}," the ",{"slot":1}," surface ",{"slot":2}," (300000 against 13120000)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-23fa52bd","guard":[["hasAny",["element","item number","laos","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.subject"]],"mem":null},
{"id":"n-23ff5b21","guard":[["hasAny",["egypt","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Jordan ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," area (88946 against 1001449)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-59dc0855","guard":[["hasAny",["andorra","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-5f222c7a","guard":[["hasAny",["egypt","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Jordan ",{"slot":0}," the ",{"slot":1}," surface ",{"slot":2}," (88946 against 1001449)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7c45a563","guard":[["hasAny",["egypt","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Jordan ",{"slot":0}," the smaller ",{"slot":1}," ",{"slot":2}," (88946 against 1001449)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8cf39585","guard":[["hasAny",["element","item number","nth","philippines","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":["Philippines ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," area (300000 against 13120000)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ae9b46b3","guard":[["hasAny",["element","item number","nth","philippines","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":["Philippines ",{"slot":0}," the smaller ",{"slot":1}," ",{"slot":2}," (300000 against 13120000)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ca78f771","guard":[["hasAny",["element","item number","laos","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-d874ce51","guard":[["hasAny",["element","item number","lesotho","nth","position","shortest","shortest one","shortest word"]],["has","french"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," area (30355 against 90000)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-e6778c37","guard":[["hasAny",["andorra","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.subject"]],"mem":null},
{"id":"n-052b7bb2","guard":[["hasAny",["bolivia","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (912050 against 1098581)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0f1eeb8d","guard":[["hasAny",["antigua","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (12 against 442)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-14f8feaf","guard":[["hasAny",["element","item number","lesotho","nth","position","shortest","shortest one","shortest word"]],["has","french"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (30355 against 90000)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-152562d4","guard":[["hasAny",["all caps","andorra","capital letters","capitals","element","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-16d5bdf3","guard":[["hasAny",["andorra","element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.subject"]]],"mem":null},
{"id":"n-2091901b","guard":[["hasAny",["andorra","element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["transform.lower",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-357fe0f1","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","laos","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["transform.upper",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-3ba7b5b6","guard":[["hasAny",["element","estonia","item number","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (11295 against 45227)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3ebce2bc","guard":[["hasAny",["element","item number","lesotho","nth","position","shortest","shortest one","shortest word"]],["has","french"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (30355 against 90000)."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-4c4dcabf","guard":[["hasAny",["element","item number","nth","philippines","position"]],["has","smaller"]],"pyramid":["render.template",{"lit":["Philippines has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (300000 against 13120000)."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-517b3ab9","guard":[["hasAny",["element","item number","laos","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-57fd95cc","guard":[["hasAny",["element","item number","laos","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.subject"]]],"mem":null},
{"id":"n-58878e4a","guard":[["hasAny",["cuba","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," and Futuna has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (200 against 110861)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-60884bd7","guard":[["hasAny",["antigua","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (12 against 442)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6bf40a20","guard":[["hasAny",["andorra","capitalise","capitalize","capitalize each word","element","item number","nth","position","shortest","shortest one","shortest word","title case"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-7249536f","guard":[["hasAny",["andorra","element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-772d5466","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","laos","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-7e737c71","guard":[["hasAny",["element","item number","mali","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (1240192 against 1566500)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-92a48202","guard":[["hasAny",["andorra","element","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-936c1a0d","guard":[["hasAny",["andorra","element","item number","nth","position"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-97c396e3","guard":[["hasAny",["element","guyana","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (12189 against 214969)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a0b196f0","guard":[["hasAny",["element","invert case","item number","laos","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a0e95224","guard":[["hasAny",["element","ghana","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (26338 against 238533)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a261f905","guard":[["hasAny",["chad","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (30355 against 1284000)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a7af8001","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","laos","nth","position","shortest","shortest one","shortest word","title case"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-aad6e209","guard":[["hasAny",["all caps","andorra","capital letters","capitals","element","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["transform.upper",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-af2d11d0","guard":[["hasAny",["andorra","capitalise","capitalize","capitalize each word","element","item number","nth","position","shortest","shortest one","shortest word","title case"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b5993add","guard":[["hasAny",["egypt","element","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Jordan has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (88946 against 1001449)."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bdf446fd","guard":[["hasAny",["element","item number","laos","nth","position"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-c78a3cb3","guard":[["hasAny",["element","invert case","item number","laos","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-ca421665","guard":[["hasAny",["andorra","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["transform.nthStr",["sense.words"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-cabdb89b","guard":[["hasAny",["element","greece","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (131626 against 1285216)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cd658c77","guard":[["hasAny",["element","item number","laos","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["transform.nthStr",["sense.words"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-d9d0646b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","laos","nth","position","shortest","shortest one","shortest word","title case"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-da3734be","guard":[["hasAny",["djibouti","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (23200 against 357022)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-dc71c660","guard":[["hasAny",["element","item number","longest","longest one","longest word","malawi","nth","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (6257 against 118484)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e48aa9e4","guard":[["hasAny",["element","item number","lesotho","nth","position","shortest","shortest one","shortest word"]],["has","french"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (30355 against 90000)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.subject"]],"mem":null},
{"id":"n-ee4323f7","guard":[["hasAny",["andorra","element","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-eea2131e","guard":[["hasAny",["andorra","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-ef29eb10","guard":[["hasAny",["element","item number","laos","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-f0d326a7","guard":[["hasAny",["element","item number","macao","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (18 against 120538)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f72e30ba","guard":[["hasAny",["element","item number","laos","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["transform.lower",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-089743c8","guard":[["hasAny",["element","item number","macao","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (18 against 120538)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0e3da6c3","guard":[["hasAny",["each word","element","item number","laos","nth","position","shortest","shortest one","shortest word","split into words"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0eca8b99","guard":[["hasAny",["antigua","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (12 against 442)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-10264195","guard":[["hasAny",["element","item number","mali","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (1240192 against 1566500)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-12986794","guard":[["hasAny",["andorra","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-12b9aae2","guard":[["hasAny",["djibouti","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (23200 against 357022)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1f079f07","guard":[["hasAny",["element","invert case","item number","lesotho","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","french"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (30355 against 90000)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1f148714","guard":[["hasAny",["each word","element","item number","laos","nth","position","shortest","shortest one","shortest word","split into words"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-22c85fe8","guard":[["hasAny",["afghanistan","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (41284 against 652090)."]},["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2bc050da","guard":[["hasAny",["andorra","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-4891e588","guard":[["hasAny",["element","haiti","item number","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (27750 against 1958201)."]},["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-48c44225","guard":[["hasAny",["element","item number","lesotho","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","french"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (30355 against 90000)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.subject"]]],"mem":null},
{"id":"n-49075f81","guard":[["hasAny",["bolivia","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (912050 against 1098581)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4de436ef","guard":[["hasAny",["element","guyana","item number","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (12189 against 214969)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-55cf3335","guard":[["hasAny",["each word","element","item number","laos","nth","position","shortest","shortest one","shortest word","split into words"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-60384cf7","guard":[["hasAny",["each word","element","item number","laos","nth","position","shortest","shortest one","shortest word","split into words"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (236800 against 1221037)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-765957f0","guard":[["hasAny",["brunei","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (5765 against 99434)."]},["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-767ecc26","guard":[["hasAny",["bermuda","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (53 against 796095)."]},["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-86391114","guard":[["hasAny",["egypt","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Jordan ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (88946 against 1001449)."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-905c5ab8","guard":[["hasAny",["chad","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (30355 against 1284000)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9b63f85d","guard":[["hasAny",["element","item number","malawi","nth","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (6257 against 118484)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9c2797bd","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","lesotho","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","french"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (30355 against 90000)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-9e890a23","guard":[["hasAny",["andorra","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-c3b444bc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","lesotho","nth","position","shortest","shortest one","shortest word","title case"]],["has","french"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (30355 against 90000)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cc51a3b8","guard":[["hasAny",["element","estonia","item number","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (11295 against 45227)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ce62b301","guard":[["hasAny",["element","item number","lesotho","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","french"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (30355 against 90000)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-db71279f","guard":[["hasAny",["andorra","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (468 against 9363520)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fae6b0c2","guard":[["hasAny",["cuba","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," and Futuna has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (200 against 110861)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fbea1a80","guard":[["hasAny",["comoros","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (1862 against 65301)."]},["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fcfd7905","guard":[["hasAny",["argentina","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (824292 against 2780400)."]},["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fe4e0c8a","guard":[["hasAny",["element","item number","lesotho","nth","position"]],["has","french"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (30355 against 90000)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-1f08e1d3","guard":[["hasAny",["element","estonia","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (11295 against 45227)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-25f794b6","guard":[["hasAny",["element","first n","guyana","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (12189 against 214969)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-26c89427","guard":[["hasAny",["element","first n","item number","macao","nth","position","shortest","shortest one","shortest word","take","top"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (18 against 120538)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2a17fbc0","guard":[["hasAny",["cuba","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," and Futuna has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (200 against 110861)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2b0fad6d","guard":[["hasAny",["element","first n","guyana","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (12189 against 214969)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2c26be10","guard":[["hasAny",["element","first n","item number","malawi","nth","position","shortest","shortest one","shortest word","take","top"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (6257 against 118484)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-316b2fb4","guard":[["hasAny",["element","item number","nth","philippines","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":["Philippines ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (300000 against 13120000)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3337fa2e","guard":[["hasAny",["egypt","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Jordan ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (88946 against 1001449)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-36839084","guard":[["hasAny",["element","item number","nth","philippines","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":["Philippines ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (300000 against 13120000)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-44c1750c","guard":[["hasAny",["element","first n","item number","macao","nth","position","shortest","shortest one","shortest word","take","top"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (18 against 120538)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4a46079a","guard":[["hasAny",["bolivia","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (912050 against 1098581)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5001970b","guard":[["hasAny",["egypt","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Jordan ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (88946 against 1001449)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5267fd9d","guard":[["hasAny",["djibouti","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (23200 against 357022)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-58d20e53","guard":[["hasAny",["each word","element","item number","lesotho","nth","position","shortest","shortest one","shortest word","split into words"]],["has","french"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (30355 against 90000)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6c185144","guard":[["hasAny",["antigua","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (12 against 442)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6dc10f2c","guard":[["hasAny",["element","first n","item number","mali","nth","position","shortest","shortest one","shortest word","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (1240192 against 1566500)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7a35494a","guard":[["hasAny",["chad","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (30355 against 1284000)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7e28de37","guard":[["hasAny",["chad","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (30355 against 1284000)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-89a2cc20","guard":[["hasAny",["element","item number","nth","philippines","position"]],["has","smaller"]],"pyramid":["render.template",{"lit":["Philippines ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (300000 against 13120000)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8ce22698","guard":[["hasAny",["each word","element","item number","lesotho","nth","position","shortest","shortest one","shortest word","split into words"]],["has","french"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (30355 against 90000)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-af40c041","guard":[["hasAny",["cuba","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," and Futuna has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (200 against 110861)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-af7f82bd","guard":[["hasAny",["element","estonia","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (11295 against 45227)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bbce1f28","guard":[["hasAny",["bolivia","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (912050 against 1098581)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c03476f4","guard":[["hasAny",["element","first n","item number","mali","nth","position","shortest","shortest one","shortest word","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (1240192 against 1566500)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cffb2154","guard":[["hasAny",["element","item number","nth","philippines","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":["Philippines ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (300000 against 13120000)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-df73ff83","guard":[["hasAny",["element","first n","item number","malawi","nth","position","shortest","shortest one","shortest word","take","top"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (6257 against 118484)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e5c8a3f3","guard":[["hasAny",["antigua","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (12 against 442)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f212e854","guard":[["hasAny",["egypt","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Jordan ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (88946 against 1001449)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fc31f299","guard":[["hasAny",["egypt","element","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Jordan ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (88946 against 1001449)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fd10d140","guard":[["hasAny",["djibouti","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","surface"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (23200 against 357022)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-04b7d31b","guard":[["hasAny",["all caps","capital letters","capitals","egypt","element","item number","nth","position","upper case","uppercase"]],["has","which"]],"pyramid":["render.template",{"lit":["Jordan ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (88946 against 1001449)."]},["transform.upper",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-15657e9a","guard":[["hasAny",["element","item number","lower case","lowercase","nth","philippines","position","small letters"]],["has","smaller"]],"pyramid":["render.template",{"lit":["Philippines ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (300000 against 13120000)."]},["transform.lower",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1aa38bb3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","egypt","element","item number","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["Jordan ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (88946 against 1001449)."]},["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4a18fa72","guard":[["hasAny",["element","item number","nth","philippines","position"]],["has","smaller"]],"pyramid":["render.template",{"lit":["Philippines ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (300000 against 13120000)."]},["transform.nthStr",["sense.words"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7d523257","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","philippines","position","title case"]],["has","smaller"]],"pyramid":["render.template",{"lit":["Philippines ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (300000 against 13120000)."]},["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c9b13b4a","guard":[["hasAny",["egypt","element","item number","lower case","lowercase","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["Jordan ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (88946 against 1001449)."]},["transform.lower",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e4fccc8e","guard":[["hasAny",["element","invert case","item number","nth","philippines","position","swap case","toggle case"]],["has","smaller"]],"pyramid":["render.template",{"lit":["Philippines ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (300000 against 13120000)."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ec86237f","guard":[["hasAny",["egypt","element","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Jordan ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (88946 against 1001449)."]},["transform.nthStr",["sense.words"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-edcf6f39","guard":[["hasAny",["egypt","element","invert case","item number","nth","position","swap case","toggle case"]],["has","which"]],"pyramid":["render.template",{"lit":["Jordan ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (88946 against 1001449)."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fef40e58","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","philippines","position","upper case","uppercase"]],["has","smaller"]],"pyramid":["render.template",{"lit":["Philippines ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (300000 against 13120000)."]},["transform.upper",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2352307c","guard":[["hasAny",["each word","egypt","element","item number","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["Jordan ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (88946 against 1001449)."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-29d9aa68","guard":[["hasAny",["each word","element","item number","nth","philippines","position","split into words"]],["has","smaller"]],"pyramid":["render.template",{"lit":["Philippines ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (300000 against 13120000)."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-98588cb7","guard":[["hasAny",["each word","element","item number","nth","philippines","position","split into words"]],["has","smaller"]],"pyramid":["render.template",{"lit":["Philippines ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (300000 against 13120000)."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e2c7eec2","guard":[["hasAny",["each word","egypt","element","item number","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["Jordan ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (88946 against 1001449)."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"whose surface area is smaller: Palestine or Malawi","expect":{"contains":["Palestine"],"notContains":["Malawi"],"notRefusal":true}},{"q":"which has the smaller surface area, Sao Tome and Principe or Niger","expect":{"contains":["Sao Tome and Principe"],"notContains":["Niger"],"notRefusal":true}},{"q":"whose surface area is smaller: Pakistan or Bermuda","expect":{"contains":["Bermuda"],"notContains":["Pakistan"],"notRefusal":true}},{"q":"between French Guiana and Lesotho, which has the lesser surface area","expect":{"contains":["Lesotho"],"notContains":["French Guiana"],"notRefusal":true}},{"q":"between Jordan and Ecuador, which has the lesser surface area","expect":{"contains":["Jordan"],"notContains":["Ecuador"],"notRefusal":true}},{"q":"which has the smaller surface area, French Southern territories or French Guiana","expect":{"contains":["French Southern territories"],"notContains":["French Guiana"],"notRefusal":true}},{"q":"whose surface area is smaller: Ghana or Rwanda","expect":{"contains":["Rwanda"],"notContains":["Ghana"],"notRefusal":true}},{"q":"whose surface area is smaller: Marshall Islands or South Georgia and the South Sandwich Islands","expect":{"contains":["Marshall Islands"],"notContains":["South Georgia and the South Sandwich Islands"],"notRefusal":true}},{"q":"between Central African Republic and Mexico, which has the lesser surface area","expect":{"contains":["Central African Republic"],"notContains":["Mexico"],"notRefusal":true}},{"q":"between France and Marshall Islands, which has the lesser surface area","expect":{"contains":["Marshall Islands"],"notContains":["France"],"notRefusal":true}},{"q":"whose surface area is smaller: Gambia or Estonia","expect":{"contains":["Gambia"],"notContains":["Estonia"],"notRefusal":true}},{"q":"whose surface area is smaller: Cayman Islands or Antarctica","expect":{"contains":["Cayman Islands"],"notContains":["Antarctica"],"notRefusal":true}},{"q":"whose surface area is smaller: Peru or Greece","expect":{"contains":["Greece"],"notContains":["Peru"],"notRefusal":true}},{"q":"between Jamaica and Mali, which has the lesser surface area","expect":{"contains":["Jamaica"],"notContains":["Mali"],"notRefusal":true}},{"q":"whose surface area is smaller: Mexico or Haiti","expect":{"contains":["Haiti"],"notContains":["Mexico"],"notRefusal":true}},{"q":"which has the smaller surface area, Comoros or Belgium","expect":{"contains":["Comoros"],"notContains":["Belgium"],"notRefusal":true}},{"q":"between Malta and Solomon Islands, which has the lesser surface area","expect":{"contains":["Malta"],"notContains":["Solomon Islands"],"notRefusal":true}},{"q":"which has the smaller surface area, Bermuda or Suriname","expect":{"contains":["Bermuda"],"notContains":["Suriname"],"notRefusal":true}},{"q":"which has the smaller surface area, Haiti or Oman","expect":{"contains":["Haiti"],"notContains":["Oman"],"notRefusal":true}},{"q":"between Suriname and Cameroon, which has the lesser surface area","expect":{"contains":["Suriname"],"notContains":["Cameroon"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
