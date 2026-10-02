// airport-code-name-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"airport-code-name-neo-g6","class":"airport-code-name","generation":6,"lane":"neo","grownFrom":["name the airport coded JDH","which airport has the IATA code POT","which airport has the IATA code MMO","what is the name of the airport QIG","name the airport coded HJR","which airport has the IATA code CYW","what is the name of the airport OUH","name the airport coded ISK","what is the name of the airport BTM","which airport has the IATA code SDU","which airport has the IATA code OKC","name the airport coded ACX","name the airport coded TXL","name the airport coded NDJ","name the airport coded EJH","what is the name of the airport LRD","name the airport coded HVA","which airport has the IATA code JAB","what is the name of the airport MQX","name the airport coded BZN"],"version":1});

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
{"id":"n-2c5468e1","guard":[["has","airport"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded JDH":"JDH is Jodhpur Airport.","which airport has the IATA code POT":"POT is Ken Jones Airport.","which airport has the IATA code MMO":"MMO is Maio Airport.","what is the name of the airport QIG":"QIG is Iguatu Airport.","name the airport coded HJR":"HJR is Khajuraho Airport.","which airport has the IATA code CYW":"CYW is Captain Rogelio Castillo National Airport.","what is the name of the airport OUH":"OUH is Oudtshoorn Airport.","name the airport coded ISK":"ISK is Nashik Airport.","what is the name of the airport BTM":"BTM is Bert Mooney Airport.","which airport has the IATA code SDU":"SDU is Santos Dumont Airport.","which airport has the IATA code OKC":"OKC is Will Rogers World Airport.","name the airport coded ACX":"ACX is Xingyi Airport.","name the airport coded TXL":"TXL is Berlin-Tegel Airport.","name the airport coded NDJ":"NDJ is N'Djamena International Airport.","name the airport coded EJH":"EJH is Al Wajh Domestic Airport.","what is the name of the airport LRD":"LRD is Laredo International Airport.","name the airport coded HVA":"HVA is Analalava Airport.","which airport has the IATA code JAB":"JAB is Jabiru Airport.","what is the name of the airport MQX":"MQX is Mekele Airport.","name the airport coded BZN":"BZN is Gallatin Field.","what is the name of the airport BYN":"BYN is Bayankhongor Airport.","what is the name of the airport OGG":"OGG is Kahului Airport.","which airport has the IATA code OKY":"OKY is Oakey Airport.","what is the name of the airport SIA":"SIA is Xi'an Xiguan Airport.","which airport has the IATA code ZLO":"ZLO is Playa De Oro International Airport.","which airport has the IATA code SIN":"SIN is Singapore Changi Airport.","name the airport coded BUO":"BUO is Burao Airport.","what is the name of the airport PID":"PID is Nassau Paradise Island Airport.","which airport has the IATA code SIK":"SIK is Sikeston Memorial Municipal Airport.","what is the name of the airport VIX":"VIX is Eurico de Aguiar Salles Airport.","what is the name of the airport TKU":"TKU is Turku Airport.","name the airport coded YQV":"YQV is Yorkton Municipal Airport.","what is the name of the airport AUH":"AUH is Abu Dhabi International Airport.","which airport has the IATA code SZA":"SZA is Soyo Airport.","what is the name of the airport AHN":"AHN is Athens Ben Epps Airport.","name the airport coded AVB":"AVB is Aviano Air Base.","name the airport coded KQA":"KQA is Akutan Seaplane Base.","what is the name of the airport OFF":"OFF is Offutt Air Force Base.","what is the name of the airport QJI":"QJI is Ikamiut Heliport.","what is the name of the airport SHT":"SHT is Shepparton Airport.","what is the name of the airport CMA":"CMA is Cunnamulla Airport.","what is the name of the airport GAF":"GAF is Gafsa Ksar International Airport.","which airport has the IATA code MSZ":"MSZ is Namibe Airport.","which airport has the IATA code XPP":"XPP is Poplar River Airport.","name the airport coded ATL":"ATL is Hartsfield Jackson Atlanta International Airport.","which airport has the IATA code LEL":"LEL is Lake Evella Airport.","which airport has the IATA code NGI":"NGI is Ngau Airport.","what is the name of the airport HLD":"HLD is Dongshan Airport.","name the airport coded HWN":"HWN is Hwange National Park Airport.","name the airport coded MOQ":"MOQ is Morondava Airport.","which airport has the IATA code QRR":"QRR is Warren Airport.","what is the name of the airport YBW":"YBW is Bedwell Harbour Seaplane Base.","name the airport coded SPF":"SPF is Black Hills Airport-Clyde Ice Field.","what is the name of the airport XCR":"XCR is Châlons-Vatry Airport.","name the airport coded WMR":"WMR is Mananara Nord Airport.","name the airport coded RCQ":"RCQ is Reconquista Airport.","what is the name of the airport ILD":"ILD is Lleida-Alguaire Airport.","name the airport coded CHM":"CHM is Teniente FAP Jaime A De Montreuil Morales Airport.","what is the name of the airport DCM":"DCM is Castres-Mazamet Airport.","which airport has the IATA code MXS":"MXS is Maota Airport.","name the airport coded YRF":"YRF is Cartwright Airport.","which airport has the IATA code JSM":"JSM is Jose De San Martin Airport.","name the airport coded SOV":"SOV is Seldovia Airport.","what is the name of the airport SWF":"SWF is Stewart International Airport.","name the airport coded MBO":"MBO is Mamburao Airport.","name the airport coded HPH":"HPH is Cat Bi International Airport.","name the airport coded MWF":"MWF is Maewo-Naone Airport.","which airport has the IATA code ABV":"ABV is Nnamdi Azikiwe International Airport.","which airport has the IATA code TOF":"TOF is Bogashevo Airport.","what is the name of the airport CFC":"CFC is Caçador Airport.","name the airport coded SBA":"SBA is Santa Barbara Municipal Airport.","which airport has the IATA code OZH":"OZH is Zaporizhzhia International Airport.","what is the name of the airport RBX":"RBX is Rumbek Airport.","what is the name of the airport TWT":"TWT is Sanga Sanga Airport.","which airport has the IATA code PIR":"PIR is Pierre Regional Airport.","which airport has the IATA code HBA":"HBA is Hobart International Airport.","name the airport coded DSD":"DSD is La Désirade Airport.","name the airport coded ABI":"ABI is Abilene Regional Airport.","which airport has the IATA code CNG":"CNG is Cognac-Châteaubernard (BA 709) Air Base.","what is the name of the airport CCR":"CCR is Buchanan Field.","what is the name of the airport HOD":"HOD is Hodeidah International Airport.","what is the name of the airport MTJ":"MTJ is Montrose Regional Airport.","which airport has the IATA code WKF":"WKF is Waterkloof Air Force Base.","name the airport coded STT":"STT is Cyril E. King Airport.","what is the name of the airport CRI":"CRI is Colonel Hill Airport.","name the airport coded YXT":"YXT is Northwest Regional Airport Terrace-Kitimat.","which airport has the IATA code TKC":"TKC is Tiko Airport.","which airport has the IATA code YBI":"YBI is Black Tickle Airport.","which airport has the IATA code GLH":"GLH is Mid Delta Regional Airport.","which airport has the IATA code JHM":"JHM is Kapalua Airport.","what is the name of the airport CXP":"CXP is Tunggul Wulung Airport.","name the airport coded OUE":"OUE is Ouesso Airport.","which airport has the IATA code ABQ":"ABQ is Albuquerque International Sunport.","name the airport coded YRV":"YRV is Revelstoke Airport.","which airport has the IATA code GYM":"GYM is General José María Yáñez International Airport.","what is the name of the airport KNR":"KNR is Jam Airport.","which airport has the IATA code VLG":"VLG is Villa Gesell Airport.","what is the name of the airport AWA":"AWA is Awassa Airport.","which airport has the IATA code IVL":"IVL is Ivalo Airport.","name the airport coded JDO":"JDO is Orlando Bezerra de Menezes Airport."}}},
{"id":"n-7deab2b1","guard":[["has","airport"]],"pyramid":["render.str",["memory.lookup",["sense.lastWord"]]],"mem":{"table":{"JDH":"JDH is Jodhpur Airport.","POT":"POT is Ken Jones Airport.","MMO":"MMO is Maio Airport.","QIG":"QIG is Iguatu Airport.","HJR":"HJR is Khajuraho Airport.","CYW":"CYW is Captain Rogelio Castillo National Airport.","OUH":"OUH is Oudtshoorn Airport.","ISK":"ISK is Nashik Airport.","BTM":"BTM is Bert Mooney Airport.","SDU":"SDU is Santos Dumont Airport.","OKC":"OKC is Will Rogers World Airport.","ACX":"ACX is Xingyi Airport.","TXL":"TXL is Berlin-Tegel Airport.","NDJ":"NDJ is N'Djamena International Airport.","EJH":"EJH is Al Wajh Domestic Airport.","LRD":"LRD is Laredo International Airport.","HVA":"HVA is Analalava Airport.","JAB":"JAB is Jabiru Airport.","MQX":"MQX is Mekele Airport.","BZN":"BZN is Gallatin Field.","BYN":"BYN is Bayankhongor Airport.","OGG":"OGG is Kahului Airport.","OKY":"OKY is Oakey Airport.","SIA":"SIA is Xi'an Xiguan Airport.","ZLO":"ZLO is Playa De Oro International Airport.","SIN":"SIN is Singapore Changi Airport.","BUO":"BUO is Burao Airport.","PID":"PID is Nassau Paradise Island Airport.","SIK":"SIK is Sikeston Memorial Municipal Airport.","VIX":"VIX is Eurico de Aguiar Salles Airport.","TKU":"TKU is Turku Airport.","YQV":"YQV is Yorkton Municipal Airport.","AUH":"AUH is Abu Dhabi International Airport.","SZA":"SZA is Soyo Airport.","AHN":"AHN is Athens Ben Epps Airport.","AVB":"AVB is Aviano Air Base.","KQA":"KQA is Akutan Seaplane Base.","OFF":"OFF is Offutt Air Force Base.","QJI":"QJI is Ikamiut Heliport.","SHT":"SHT is Shepparton Airport.","CMA":"CMA is Cunnamulla Airport.","GAF":"GAF is Gafsa Ksar International Airport.","MSZ":"MSZ is Namibe Airport.","XPP":"XPP is Poplar River Airport.","ATL":"ATL is Hartsfield Jackson Atlanta International Airport.","LEL":"LEL is Lake Evella Airport.","NGI":"NGI is Ngau Airport.","HLD":"HLD is Dongshan Airport.","HWN":"HWN is Hwange National Park Airport.","MOQ":"MOQ is Morondava Airport.","QRR":"QRR is Warren Airport.","YBW":"YBW is Bedwell Harbour Seaplane Base.","SPF":"SPF is Black Hills Airport-Clyde Ice Field.","XCR":"XCR is Châlons-Vatry Airport.","WMR":"WMR is Mananara Nord Airport.","RCQ":"RCQ is Reconquista Airport.","ILD":"ILD is Lleida-Alguaire Airport.","CHM":"CHM is Teniente FAP Jaime A De Montreuil Morales Airport.","DCM":"DCM is Castres-Mazamet Airport.","MXS":"MXS is Maota Airport.","YRF":"YRF is Cartwright Airport.","JSM":"JSM is Jose De San Martin Airport.","SOV":"SOV is Seldovia Airport.","SWF":"SWF is Stewart International Airport.","MBO":"MBO is Mamburao Airport.","HPH":"HPH is Cat Bi International Airport.","MWF":"MWF is Maewo-Naone Airport.","ABV":"ABV is Nnamdi Azikiwe International Airport.","TOF":"TOF is Bogashevo Airport.","CFC":"CFC is Caçador Airport.","SBA":"SBA is Santa Barbara Municipal Airport.","OZH":"OZH is Zaporizhzhia International Airport.","RBX":"RBX is Rumbek Airport.","TWT":"TWT is Sanga Sanga Airport.","PIR":"PIR is Pierre Regional Airport.","HBA":"HBA is Hobart International Airport.","DSD":"DSD is La Désirade Airport.","ABI":"ABI is Abilene Regional Airport.","CNG":"CNG is Cognac-Châteaubernard (BA 709) Air Base.","CCR":"CCR is Buchanan Field.","HOD":"HOD is Hodeidah International Airport.","MTJ":"MTJ is Montrose Regional Airport.","WKF":"WKF is Waterkloof Air Force Base.","STT":"STT is Cyril E. King Airport.","CRI":"CRI is Colonel Hill Airport.","YXT":"YXT is Northwest Regional Airport Terrace-Kitimat.","TKC":"TKC is Tiko Airport.","YBI":"YBI is Black Tickle Airport.","GLH":"GLH is Mid Delta Regional Airport.","JHM":"JHM is Kapalua Airport.","CXP":"CXP is Tunggul Wulung Airport.","OUE":"OUE is Ouesso Airport.","ABQ":"ABQ is Albuquerque International Sunport.","YRV":"YRV is Revelstoke Airport.","GYM":"GYM is General José María Yáñez International Airport.","KNR":"KNR is Jam Airport.","VLG":"VLG is Villa Gesell Airport.","AWA":"AWA is Awassa Airport.","IVL":"IVL is Ivalo Airport.","JDO":"JDO is Orlando Bezerra de Menezes Airport."}}},
{"id":"n-00810b9f","guard":[["has","airport"],["not",["has","city"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"airport"}]]],"mem":{"table":{"coded JDH":"JDH is Jodhpur Airport.","has the IATA code POT":"POT is Ken Jones Airport.","has the IATA code MMO":"MMO is Maio Airport.","QIG":"QIG is Iguatu Airport.","coded HJR":"HJR is Khajuraho Airport.","has the IATA code CYW":"CYW is Captain Rogelio Castillo National Airport.","OUH":"OUH is Oudtshoorn Airport.","coded ISK":"ISK is Nashik Airport.","BTM":"BTM is Bert Mooney Airport.","has the IATA code SDU":"SDU is Santos Dumont Airport.","has the IATA code OKC":"OKC is Will Rogers World Airport.","coded ACX":"ACX is Xingyi Airport.","coded TXL":"TXL is Berlin-Tegel Airport.","coded NDJ":"NDJ is N'Djamena International Airport.","coded EJH":"EJH is Al Wajh Domestic Airport.","LRD":"LRD is Laredo International Airport.","coded HVA":"HVA is Analalava Airport.","has the IATA code JAB":"JAB is Jabiru Airport.","MQX":"MQX is Mekele Airport.","coded BZN":"BZN is Gallatin Field.","BYN":"BYN is Bayankhongor Airport.","OGG":"OGG is Kahului Airport.","has the IATA code OKY":"OKY is Oakey Airport.","SIA":"SIA is Xi'an Xiguan Airport.","has the IATA code ZLO":"ZLO is Playa De Oro International Airport.","has the IATA code SIN":"SIN is Singapore Changi Airport.","coded BUO":"BUO is Burao Airport.","PID":"PID is Nassau Paradise Island Airport.","has the IATA code SIK":"SIK is Sikeston Memorial Municipal Airport.","VIX":"VIX is Eurico de Aguiar Salles Airport.","TKU":"TKU is Turku Airport.","coded YQV":"YQV is Yorkton Municipal Airport.","AUH":"AUH is Abu Dhabi International Airport.","has the IATA code SZA":"SZA is Soyo Airport.","AHN":"AHN is Athens Ben Epps Airport.","coded AVB":"AVB is Aviano Air Base.","coded KQA":"KQA is Akutan Seaplane Base.","OFF":"OFF is Offutt Air Force Base.","QJI":"QJI is Ikamiut Heliport.","SHT":"SHT is Shepparton Airport.","CMA":"CMA is Cunnamulla Airport.","GAF":"GAF is Gafsa Ksar International Airport.","has the IATA code MSZ":"MSZ is Namibe Airport.","has the IATA code XPP":"XPP is Poplar River Airport.","coded ATL":"ATL is Hartsfield Jackson Atlanta International Airport.","has the IATA code LEL":"LEL is Lake Evella Airport.","has the IATA code NGI":"NGI is Ngau Airport.","HLD":"HLD is Dongshan Airport.","coded HWN":"HWN is Hwange National Park Airport.","coded MOQ":"MOQ is Morondava Airport.","has the IATA code QRR":"QRR is Warren Airport.","YBW":"YBW is Bedwell Harbour Seaplane Base.","coded SPF":"SPF is Black Hills Airport-Clyde Ice Field.","XCR":"XCR is Châlons-Vatry Airport.","coded WMR":"WMR is Mananara Nord Airport.","coded RCQ":"RCQ is Reconquista Airport.","ILD":"ILD is Lleida-Alguaire Airport.","coded CHM":"CHM is Teniente FAP Jaime A De Montreuil Morales Airport.","DCM":"DCM is Castres-Mazamet Airport.","has the IATA code MXS":"MXS is Maota Airport.","coded YRF":"YRF is Cartwright Airport.","has the IATA code JSM":"JSM is Jose De San Martin Airport.","coded SOV":"SOV is Seldovia Airport.","SWF":"SWF is Stewart International Airport.","coded MBO":"MBO is Mamburao Airport.","coded HPH":"HPH is Cat Bi International Airport.","coded MWF":"MWF is Maewo-Naone Airport.","has the IATA code ABV":"ABV is Nnamdi Azikiwe International Airport.","has the IATA code TOF":"TOF is Bogashevo Airport.","CFC":"CFC is Caçador Airport.","coded SBA":"SBA is Santa Barbara Municipal Airport.","has the IATA code OZH":"OZH is Zaporizhzhia International Airport.","RBX":"RBX is Rumbek Airport.","TWT":"TWT is Sanga Sanga Airport.","has the IATA code PIR":"PIR is Pierre Regional Airport.","has the IATA code HBA":"HBA is Hobart International Airport.","coded DSD":"DSD is La Désirade Airport.","coded ABI":"ABI is Abilene Regional Airport.","has the IATA code CNG":"CNG is Cognac-Châteaubernard (BA 709) Air Base.","CCR":"CCR is Buchanan Field.","HOD":"HOD is Hodeidah International Airport.","MTJ":"MTJ is Montrose Regional Airport.","has the IATA code WKF":"WKF is Waterkloof Air Force Base.","coded STT":"STT is Cyril E. King Airport.","CRI":"CRI is Colonel Hill Airport.","coded YXT":"YXT is Northwest Regional Airport Terrace-Kitimat.","has the IATA code TKC":"TKC is Tiko Airport.","has the IATA code YBI":"YBI is Black Tickle Airport.","has the IATA code GLH":"GLH is Mid Delta Regional Airport.","has the IATA code JHM":"JHM is Kapalua Airport.","CXP":"CXP is Tunggul Wulung Airport.","coded OUE":"OUE is Ouesso Airport.","has the IATA code ABQ":"ABQ is Albuquerque International Sunport.","coded YRV":"YRV is Revelstoke Airport.","has the IATA code GYM":"GYM is General José María Yáñez International Airport.","KNR":"KNR is Jam Airport.","has the IATA code VLG":"VLG is Villa Gesell Airport.","AWA":"AWA is Awassa Airport.","has the IATA code IVL":"IVL is Ivalo Airport.","coded JDO":"JDO is Orlando Bezerra de Menezes Airport."}}},
{"id":"n-a882ff06","guard":[["has","airport"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"name"}]]],"mem":{"table":{"the airport coded JDH":"JDH is Jodhpur Airport.","of the airport QIG":"QIG is Iguatu Airport.","the airport coded HJR":"HJR is Khajuraho Airport.","of the airport OUH":"OUH is Oudtshoorn Airport.","the airport coded ISK":"ISK is Nashik Airport.","of the airport BTM":"BTM is Bert Mooney Airport.","the airport coded ACX":"ACX is Xingyi Airport.","the airport coded TXL":"TXL is Berlin-Tegel Airport.","the airport coded NDJ":"NDJ is N'Djamena International Airport.","the airport coded EJH":"EJH is Al Wajh Domestic Airport.","of the airport LRD":"LRD is Laredo International Airport.","the airport coded HVA":"HVA is Analalava Airport.","of the airport MQX":"MQX is Mekele Airport.","the airport coded BZN":"BZN is Gallatin Field.","of the airport BYN":"BYN is Bayankhongor Airport.","of the airport OGG":"OGG is Kahului Airport.","of the airport SIA":"SIA is Xi'an Xiguan Airport.","the airport coded BUO":"BUO is Burao Airport.","of the airport PID":"PID is Nassau Paradise Island Airport.","of the airport VIX":"VIX is Eurico de Aguiar Salles Airport.","of the airport TKU":"TKU is Turku Airport.","the airport coded YQV":"YQV is Yorkton Municipal Airport.","of the airport AUH":"AUH is Abu Dhabi International Airport.","of the airport AHN":"AHN is Athens Ben Epps Airport.","the airport coded AVB":"AVB is Aviano Air Base.","the airport coded KQA":"KQA is Akutan Seaplane Base.","of the airport OFF":"OFF is Offutt Air Force Base.","of the airport QJI":"QJI is Ikamiut Heliport.","of the airport SHT":"SHT is Shepparton Airport.","of the airport CMA":"CMA is Cunnamulla Airport.","of the airport GAF":"GAF is Gafsa Ksar International Airport.","the airport coded ATL":"ATL is Hartsfield Jackson Atlanta International Airport.","of the airport HLD":"HLD is Dongshan Airport.","the airport coded HWN":"HWN is Hwange National Park Airport.","the airport coded MOQ":"MOQ is Morondava Airport.","of the airport YBW":"YBW is Bedwell Harbour Seaplane Base.","the airport coded SPF":"SPF is Black Hills Airport-Clyde Ice Field.","of the airport XCR":"XCR is Châlons-Vatry Airport.","the airport coded WMR":"WMR is Mananara Nord Airport.","the airport coded RCQ":"RCQ is Reconquista Airport.","of the airport ILD":"ILD is Lleida-Alguaire Airport.","the airport coded CHM":"CHM is Teniente FAP Jaime A De Montreuil Morales Airport.","of the airport DCM":"DCM is Castres-Mazamet Airport.","the airport coded YRF":"YRF is Cartwright Airport.","the airport coded SOV":"SOV is Seldovia Airport.","of the airport SWF":"SWF is Stewart International Airport.","the airport coded MBO":"MBO is Mamburao Airport.","the airport coded HPH":"HPH is Cat Bi International Airport.","the airport coded MWF":"MWF is Maewo-Naone Airport.","of the airport CFC":"CFC is Caçador Airport.","the airport coded SBA":"SBA is Santa Barbara Municipal Airport.","of the airport RBX":"RBX is Rumbek Airport.","of the airport TWT":"TWT is Sanga Sanga Airport.","the airport coded DSD":"DSD is La Désirade Airport.","the airport coded ABI":"ABI is Abilene Regional Airport.","of the airport CCR":"CCR is Buchanan Field.","of the airport HOD":"HOD is Hodeidah International Airport.","of the airport MTJ":"MTJ is Montrose Regional Airport.","the airport coded STT":"STT is Cyril E. King Airport.","of the airport CRI":"CRI is Colonel Hill Airport.","the airport coded YXT":"YXT is Northwest Regional Airport Terrace-Kitimat.","of the airport CXP":"CXP is Tunggul Wulung Airport.","the airport coded OUE":"OUE is Ouesso Airport.","the airport coded YRV":"YRV is Revelstoke Airport.","of the airport KNR":"KNR is Jam Airport.","of the airport AWA":"AWA is Awassa Airport.","the airport coded JDO":"JDO is Orlando Bezerra de Menezes Airport."}}},
{"id":"n-399c5288","guard":[["has","airport"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the airport QIG":"QIG is Iguatu Airport.","the airport OUH":"OUH is Oudtshoorn Airport.","the airport BTM":"BTM is Bert Mooney Airport.","the airport LRD":"LRD is Laredo International Airport.","the airport MQX":"MQX is Mekele Airport.","the airport BYN":"BYN is Bayankhongor Airport.","the airport OGG":"OGG is Kahului Airport.","the airport SIA":"SIA is Xi'an Xiguan Airport.","the airport PID":"PID is Nassau Paradise Island Airport.","the airport VIX":"VIX is Eurico de Aguiar Salles Airport.","the airport TKU":"TKU is Turku Airport.","the airport AUH":"AUH is Abu Dhabi International Airport.","the airport AHN":"AHN is Athens Ben Epps Airport.","the airport OFF":"OFF is Offutt Air Force Base.","the airport QJI":"QJI is Ikamiut Heliport.","the airport SHT":"SHT is Shepparton Airport.","the airport CMA":"CMA is Cunnamulla Airport.","the airport GAF":"GAF is Gafsa Ksar International Airport.","the airport HLD":"HLD is Dongshan Airport.","the airport YBW":"YBW is Bedwell Harbour Seaplane Base.","the airport XCR":"XCR is Châlons-Vatry Airport.","the airport ILD":"ILD is Lleida-Alguaire Airport.","the airport DCM":"DCM is Castres-Mazamet Airport.","the airport SWF":"SWF is Stewart International Airport.","the airport CFC":"CFC is Caçador Airport.","the airport RBX":"RBX is Rumbek Airport.","the airport TWT":"TWT is Sanga Sanga Airport.","the airport CCR":"CCR is Buchanan Field.","the airport HOD":"HOD is Hodeidah International Airport.","the airport MTJ":"MTJ is Montrose Regional Airport.","the airport CRI":"CRI is Colonel Hill Airport.","the airport CXP":"CXP is Tunggul Wulung Airport.","the airport KNR":"KNR is Jam Airport.","the airport AWA":"AWA is Awassa Airport."}}},
{"id":"n-605655f9","guard":[["has","airport"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the name of the airport QIG":"QIG is Iguatu Airport.","the name of the airport OUH":"OUH is Oudtshoorn Airport.","the name of the airport BTM":"BTM is Bert Mooney Airport.","the name of the airport LRD":"LRD is Laredo International Airport.","the name of the airport MQX":"MQX is Mekele Airport.","the name of the airport BYN":"BYN is Bayankhongor Airport.","the name of the airport OGG":"OGG is Kahului Airport.","the name of the airport SIA":"SIA is Xi'an Xiguan Airport.","the name of the airport PID":"PID is Nassau Paradise Island Airport.","the name of the airport VIX":"VIX is Eurico de Aguiar Salles Airport.","the name of the airport TKU":"TKU is Turku Airport.","the name of the airport AUH":"AUH is Abu Dhabi International Airport.","the name of the airport AHN":"AHN is Athens Ben Epps Airport.","the name of the airport OFF":"OFF is Offutt Air Force Base.","the name of the airport QJI":"QJI is Ikamiut Heliport.","the name of the airport SHT":"SHT is Shepparton Airport.","the name of the airport CMA":"CMA is Cunnamulla Airport.","the name of the airport GAF":"GAF is Gafsa Ksar International Airport.","the name of the airport HLD":"HLD is Dongshan Airport.","the name of the airport YBW":"YBW is Bedwell Harbour Seaplane Base.","the name of the airport XCR":"XCR is Châlons-Vatry Airport.","the name of the airport ILD":"ILD is Lleida-Alguaire Airport.","the name of the airport DCM":"DCM is Castres-Mazamet Airport.","the name of the airport SWF":"SWF is Stewart International Airport.","the name of the airport CFC":"CFC is Caçador Airport.","the name of the airport RBX":"RBX is Rumbek Airport.","the name of the airport TWT":"TWT is Sanga Sanga Airport.","the name of the airport CCR":"CCR is Buchanan Field.","the name of the airport HOD":"HOD is Hodeidah International Airport.","the name of the airport MTJ":"MTJ is Montrose Regional Airport.","the name of the airport CRI":"CRI is Colonel Hill Airport.","the name of the airport CXP":"CXP is Tunggul Wulung Airport.","the name of the airport KNR":"KNR is Jam Airport.","the name of the airport AWA":"AWA is Awassa Airport."}}},
{"id":"n-00c84e47","guard":[["hasAny",["airport","code","has","iata","tkc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code TKC":"TKC is Tiko Airport."}}},
{"id":"n-02e0e9df","guard":[["has","dsd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded DSD":"DSD is La Désirade Airport."}}},
{"id":"n-03f9bfaf","guard":[["hasAny",["airport","name","xcr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport XCR":"XCR is Châlons-Vatry Airport."}}},
{"id":"n-0470ef48","guard":[["has","kqa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded KQA":"KQA is Akutan Seaplane Base."}}},
{"id":"n-0714188d","guard":[["has","wmr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded WMR":"WMR is Mananara Nord Airport."}}},
{"id":"n-07f97257","guard":[["hasAny",["airport","code","has","iata","sza"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code SZA":"SZA is Soyo Airport."}}},
{"id":"n-084c9829","guard":[["has","sov"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seldovia Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-09f92a91","guard":[["has","cri"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport CRI":"CRI is Colonel Hill Airport."}}},
{"id":"n-0b542f0f","guard":[["hasAny",["airport","name","pid"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport PID":"PID is Nassau Paradise Island Airport."}}},
{"id":"n-0b5f2d4d","guard":[["hasAny",["airport","coded","hva","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded HVA":"HVA is Analalava Airport."}}},
{"id":"n-0bb5e2f7","guard":[["has","zlo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code ZLO":"ZLO is Playa De Oro International Airport."}}},
{"id":"n-0c3f42aa","guard":[["has","auh"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abu Dhabi International Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-0c6616ce","guard":[["hasAny",["airport","name","ouh"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport OUH":"OUH is Oudtshoorn Airport."}}},
{"id":"n-0e016a55","guard":[["has","kqa"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Akutan Seaplane Base."]},["sense.lastWord"]],"mem":null},
{"id":"n-0e76868d","guard":[["has","cri"],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Colonel Hill Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-0f2813cc","guard":[["has","sza"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code SZA":"SZA is Soyo Airport."}}},
{"id":"n-106052cb","guard":[["has","xcr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport XCR":"XCR is Châlons-Vatry Airport."}}},
{"id":"n-1085a23b","guard":[["has","okc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code OKC":"OKC is Will Rogers World Airport."}}},
{"id":"n-1175f913","guard":[["hasAny",["airport","knr","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport KNR":"KNR is Jam Airport."}}},
{"id":"n-14722abe","guard":[["hasAny",["airport","name","twt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport TWT":"TWT is Sanga Sanga Airport."}}},
{"id":"n-159b9bd5","guard":[["hasAny",["airport","name","qji"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport QJI":"QJI is Ikamiut Heliport."}}},
{"id":"n-18369322","guard":[["hasAny",["airport","auh","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport AUH":"AUH is Abu Dhabi International Airport."}}},
{"id":"n-183d02c1","guard":[["has","sov"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded SOV":"SOV is Seldovia Airport."}}},
{"id":"n-186e6640","guard":[["has","gym"]],"pyramid":["render.template",{"lit":[{"slot":0}," is General José María Yáñez International Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-19051db8","guard":[["hasAny",["airport","coded","mbo","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded MBO":"MBO is Mamburao Airport."}}},
{"id":"n-192af47b","guard":[["hasAny",["airport","hld","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport HLD":"HLD is Dongshan Airport."}}},
{"id":"n-1aab87b5","guard":[["hasAny",["airport","mtj","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport MTJ":"MTJ is Montrose Regional Airport."}}},
{"id":"n-1ae5186f","guard":[["hasAny",["airport","btm","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport BTM":"BTM is Bert Mooney Airport."}}},
{"id":"n-1be2bb5a","guard":[["hasAny",["airport","code","has","iata","vlg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code VLG":"VLG is Villa Gesell Airport."}}},
{"id":"n-1c7cd522","guard":[["has","wkf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code WKF":"WKF is Waterkloof Air Force Base."}}},
{"id":"n-1f5feae2","guard":[["has","dsd"]],"pyramid":["render.template",{"lit":[{"slot":0}," is La Désirade Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-2035b64a","guard":[["has","tkc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code TKC":"TKC is Tiko Airport."}}},
{"id":"n-204ed978","guard":[["has","oky"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code OKY":"OKY is Oakey Airport."}}},
{"id":"n-216308c0","guard":[["hasAny",["airport","atl","coded","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded ATL":"ATL is Hartsfield Jackson Atlanta International Airport."}}},
{"id":"n-2169c334","guard":[["has","msz"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Namibe Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-23f782a3","guard":[["has","sik"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sikeston Memorial Municipal Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-252abd2b","guard":[["has","glh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code GLH":"GLH is Mid Delta Regional Airport."}}},
{"id":"n-2539ea52","guard":[["has","ouh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport OUH":"OUH is Oudtshoorn Airport."}}},
{"id":"n-253aaf10","guard":[["has","twt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport TWT":"TWT is Sanga Sanga Airport."}}},
{"id":"n-25c88d73","guard":[["has","wkf"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Waterkloof Air Force Base."]},["sense.lastWord"]],"mem":null},
{"id":"n-264b273a","guard":[["has","sba"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santa Barbara Municipal Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-264bcf23","guard":[["has","ybi"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Tickle Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-274a0640","guard":[["hasAny",["airport","code","has","iata","mxs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code MXS":"MXS is Maota Airport."}}},
{"id":"n-2884daba","guard":[["has","ccr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Buchanan Field."]},["sense.lastWord"]],"mem":null},
{"id":"n-28bd2475","guard":[["has","mqx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport MQX":"MQX is Mekele Airport."}}},
{"id":"n-2aa6f349","guard":[["has","pid"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nassau Paradise Island Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-2c52feb4","guard":[["has","ogg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport OGG":"OGG is Kahului Airport."}}},
{"id":"n-2ef68f19","guard":[["has","sba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded SBA":"SBA is Santa Barbara Municipal Airport."}}},
{"id":"n-301b5a15","guard":[["hasAny",["airport","code","has","iata","ngi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code NGI":"NGI is Ngau Airport."}}},
{"id":"n-3037cb25","guard":[["hasAny",["airport","coded","name","spf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded SPF":"SPF is Black Hills Airport-Clyde Ice Field."}}},
{"id":"n-30aa7573","guard":[["has","jab"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code JAB":"JAB is Jabiru Airport."}}},
{"id":"n-324dcf61","guard":[["has","gym"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code GYM":"GYM is General José María Yáñez International Airport."}}},
{"id":"n-32a58e4c","guard":[["has","yxt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded YXT":"YXT is Northwest Regional Airport Terrace-Kitimat."}}},
{"id":"n-32b8a510","guard":[["hasAny",["airport","coded","isk","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded ISK":"ISK is Nashik Airport."}}},
{"id":"n-32e7ff25","guard":[["hasAny",["airport","coded","name","wmr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded WMR":"WMR is Mananara Nord Airport."}}},
{"id":"n-34707652","guard":[["has","jdo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Orlando Bezerra de Menezes Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-356582f6","guard":[["hasAny",["ahn","airport","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport AHN":"AHN is Athens Ben Epps Airport."}}},
{"id":"n-3590182b","guard":[["has","buo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Burao Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-35b33257","guard":[["has","rbx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rumbek Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-35bf1a06","guard":[["has","wmr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mananara Nord Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-35f65234","guard":[["has","ivl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code IVL":"IVL is Ivalo Airport."}}},
{"id":"n-37cecf50","guard":[["has","sht"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Shepparton Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-37e04703","guard":[["hasAny",["airport","coded","kqa","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded KQA":"KQA is Akutan Seaplane Base."}}},
{"id":"n-38c01a2c","guard":[["hasAny",["airport","coded","hwn","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded HWN":"HWN is Hwange National Park Airport."}}},
{"id":"n-38c56300","guard":[["has","hod"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hodeidah International Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-38f15d8b","guard":[["hasAny",["airport","avb","coded","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded AVB":"AVB is Aviano Air Base."}}},
{"id":"n-399689b4","guard":[["has","cxp"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tunggul Wulung Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-3c6b10f8","guard":[["hasAny",["airport","code","has","iata","jhm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code JHM":"JHM is Kapalua Airport."}}},
{"id":"n-3d7cb176","guard":[["has","vix"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eurico de Aguiar Salles Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-3d85fa4c","guard":[["has","hba"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hobart International Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-3dafda08","guard":[["has","swf"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stewart International Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-3dd7c9d6","guard":[["hasAny",["airport","coded","hjr","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded HJR":"HJR is Khajuraho Airport."}}},
{"id":"n-3e11c493","guard":[["has","pot"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code POT":"POT is Ken Jones Airport."}}},
{"id":"n-3ea13403","guard":[["has","oue"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded OUE":"OUE is Ouesso Airport."}}},
{"id":"n-3f38a415","guard":[["has","hba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code HBA":"HBA is Hobart International Airport."}}},
{"id":"n-3f50d67c","guard":[["has","pot"],["has","airport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ken Jones Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-41520907","guard":[["has","ozh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code OZH":"OZH is Zaporizhzhia International Airport."}}},
{"id":"n-419cc7f5","guard":[["hasAny",["airport","cfc","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport CFC":"CFC is Caçador Airport."}}},
{"id":"n-41f6f15f","guard":[["has","jdh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded JDH":"JDH is Jodhpur Airport."}}},
{"id":"n-43b09822","guard":[["has","ngi"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ngau Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-43ed5c29","guard":[["has","tof"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bogashevo Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-44295ea0","guard":[["has","byn"],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bayankhongor Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-4442859b","guard":[["has","lrd"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Laredo International Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-449e5f5a","guard":[["has","lel"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code LEL":"LEL is Lake Evella Airport."}}},
{"id":"n-462a80ec","guard":[["hasAny",["airport","coded","name","rcq"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded RCQ":"RCQ is Reconquista Airport."}}},
{"id":"n-46b50d4d","guard":[["has","avb"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aviano Air Base."]},["sense.lastWord"]],"mem":null},
{"id":"n-47ddfbc4","guard":[["has","btm"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bert Mooney Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-4824f9e5","guard":[["has","awa"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Awassa Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-4a7175f3","guard":[["has","tof"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code TOF":"TOF is Bogashevo Airport."}}},
{"id":"n-4ad58645","guard":[["has","hjr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded HJR":"HJR is Khajuraho Airport."}}},
{"id":"n-4b9fc694","guard":[["hasAny",["airport","chm","coded","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded CHM":"CHM is Teniente FAP Jaime A De Montreuil Morales Airport."}}},
{"id":"n-4be0612c","guard":[["hasAny",["airport","code","has","iata","sdu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code SDU":"SDU is Santos Dumont Airport."}}},
{"id":"n-4c5709fb","guard":[["has","ejh"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Al Wajh Domestic Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-4d0b330e","guard":[["has","buo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded BUO":"BUO is Burao Airport."}}},
{"id":"n-4d112ad9","guard":[["has","okc"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Will Rogers World Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-4e0cc319","guard":[["has","sza"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soyo Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-4e28cbdb","guard":[["hasAny",["airport","code","has","iata","msz"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code MSZ":"MSZ is Namibe Airport."}}},
{"id":"n-4f73c2f5","guard":[["has","moq"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Morondava Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-4fb149e4","guard":[["has","msz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code MSZ":"MSZ is Namibe Airport."}}},
{"id":"n-50921994","guard":[["has","qig"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport QIG":"QIG is Iguatu Airport."}}},
{"id":"n-510696b0","guard":[["has","abv"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nnamdi Azikiwe International Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-52a18c10","guard":[["has","jhm"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kapalua Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-54e511f3","guard":[["has","abq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code ABQ":"ABQ is Albuquerque International Sunport."}}},
{"id":"n-56300fa5","guard":[["hasAny",["airport","name","rbx"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport RBX":"RBX is Rumbek Airport."}}},
{"id":"n-56b28fc4","guard":[["hasAny",["airport","bzn","coded","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded BZN":"BZN is Gallatin Field."}}},
{"id":"n-583248b2","guard":[["has","mqx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mekele Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-5867994e","guard":[["has","mtj"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Montrose Regional Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-59697073","guard":[["has","dcm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport DCM":"DCM is Castres-Mazamet Airport."}}},
{"id":"n-5a800614","guard":[["has","atl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded ATL":"ATL is Hartsfield Jackson Atlanta International Airport."}}},
{"id":"n-5a8bffa3","guard":[["has","hld"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Dongshan Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-5ab587d9","guard":[["has","abi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded ABI":"ABI is Abilene Regional Airport."}}},
{"id":"n-5ad06764","guard":[["has","tkc"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tiko Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-5aeef507","guard":[["has","byn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport BYN":"BYN is Bayankhongor Airport."}}},
{"id":"n-5bbef550","guard":[["has","jdh"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jodhpur Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-5e27b91c","guard":[["has","spf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded SPF":"SPF is Black Hills Airport-Clyde Ice Field."}}},
{"id":"n-5e7e93ea","guard":[["hasAny",["abi","airport","coded","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded ABI":"ABI is Abilene Regional Airport."}}},
{"id":"n-5f02bff4","guard":[["has","cyw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code CYW":"CYW is Captain Rogelio Castillo National Airport."}}},
{"id":"n-60804c5f","guard":[["hasAny",["airport","coded","jdh","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded JDH":"JDH is Jodhpur Airport."}}},
{"id":"n-60a8fd01","guard":[["has","pir"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Pierre Regional Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-6196ed96","guard":[["hasAny",["airport","code","glh","has","iata"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code GLH":"GLH is Mid Delta Regional Airport."}}},
{"id":"n-61fa1b99","guard":[["hasAny",["airport","name","sia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport SIA":"SIA is Xi'an Xiguan Airport."}}},
{"id":"n-63ec7c15","guard":[["has","mmo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maio Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-6422c4f2","guard":[["has","hjr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Khajuraho Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-64b72c8a","guard":[["has","ccr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport CCR":"CCR is Buchanan Field."}}},
{"id":"n-6512e35a","guard":[["hasAny",["airport","cxp","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport CXP":"CXP is Tunggul Wulung Airport."}}},
{"id":"n-65b24d02","guard":[["has","sia"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xi'an Xiguan Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-6881e23b","guard":[["has","qji"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ikamiut Heliport."]},["sense.lastWord"]],"mem":null},
{"id":"n-6a9db8ba","guard":[["hasAny",["airport","coded","name","ndj"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded NDJ":"NDJ is N'Djamena International Airport."}}},
{"id":"n-6d1da30b","guard":[["has","knr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport KNR":"KNR is Jam Airport."}}},
{"id":"n-6f8f2a3f","guard":[["hasAny",["airport","awa","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport AWA":"AWA is Awassa Airport."}}},
{"id":"n-7001b88f","guard":[["hasAny",["airport","code","cyw","has","iata"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code CYW":"CYW is Captain Rogelio Castillo National Airport."}}},
{"id":"n-7016d9e6","guard":[["has","txl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded TXL":"TXL is Berlin-Tegel Airport."}}},
{"id":"n-70759245","guard":[["hasAny",["airport","coded","name","oue"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded OUE":"OUE is Ouesso Airport."}}},
{"id":"n-71c43b82","guard":[["hasAny",["airport","name","ogg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport OGG":"OGG is Kahului Airport."}}},
{"id":"n-72b087b1","guard":[["has","ndj"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded NDJ":"NDJ is N'Djamena International Airport."}}},
{"id":"n-7380735c","guard":[["hasAny",["airport","name","qig"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport QIG":"QIG is Iguatu Airport."}}},
{"id":"n-75e909d8","guard":[["hasAny",["airport","code","has","iata","sin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code SIN":"SIN is Singapore Changi Airport."}}},
{"id":"n-76947e9d","guard":[["has","ndj"]],"pyramid":["render.template",{"lit":[{"slot":0}," is N'Djamena International Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-77913a8e","guard":[["has","vix"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport VIX":"VIX is Eurico de Aguiar Salles Airport."}}},
{"id":"n-784db50f","guard":[["hasAny",["airport","code","has","iata","qrr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code QRR":"QRR is Warren Airport."}}},
{"id":"n-785392f1","guard":[["hasAny",["airport","coded","name","yqv"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded YQV":"YQV is Yorkton Municipal Airport."}}},
{"id":"n-7b62bdb1","guard":[["hasAny",["airport","coded","jdo","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded JDO":"JDO is Orlando Bezerra de Menezes Airport."}}},
{"id":"n-7ba72cbf","guard":[["hasAny",["airport","code","has","iata","pot"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code POT":"POT is Ken Jones Airport."}}},
{"id":"n-7d68fb43","guard":[["has","yrv"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Revelstoke Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-7d72e6fb","guard":[["has","spf"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Hills Airport-Clyde Ice Field."]},["sense.lastWord"]],"mem":null},
{"id":"n-7d908626","guard":[["hasAny",["airport","ild","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport ILD":"ILD is Lleida-Alguaire Airport."}}},
{"id":"n-7da78f48","guard":[["has","isk"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nashik Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-7eb49ad2","guard":[["hasAny",["airport","code","has","iata","ybi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code YBI":"YBI is Black Tickle Airport."}}},
{"id":"n-7f663ad7","guard":[["hasAny",["airport","code","gym","has","iata"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code GYM":"GYM is General José María Yáñez International Airport."}}},
{"id":"n-80ee171d","guard":[["hasAny",["airport","dcm","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport DCM":"DCM is Castres-Mazamet Airport."}}},
{"id":"n-82523e98","guard":[["has","cma"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport CMA":"CMA is Cunnamulla Airport."}}},
{"id":"n-82dbae2e","guard":[["hasAny",["airport","name","ybw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport YBW":"YBW is Bedwell Harbour Seaplane Base."}}},
{"id":"n-839b88d3","guard":[["has","tku"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport TKU":"TKU is Turku Airport."}}},
{"id":"n-83fc9fb4","guard":[["hasAny",["airport","code","has","iata","jab"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code JAB":"JAB is Jabiru Airport."}}},
{"id":"n-84873cb6","guard":[["hasAny",["airport","name","sht"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport SHT":"SHT is Shepparton Airport."}}},
{"id":"n-850ff488","guard":[["has","sdu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code SDU":"SDU is Santos Dumont Airport."}}},
{"id":"n-8563a9e9","guard":[["hasAny",["airport","coded","ejh","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded EJH":"EJH is Al Wajh Domestic Airport."}}},
{"id":"n-85dca8d9","guard":[["has","ahn"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Athens Ben Epps Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-85fcd1e2","guard":[["hasAny",["airport","code","has","iata","sik"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code SIK":"SIK is Sikeston Memorial Municipal Airport."}}},
{"id":"n-8767009c","guard":[["has","isk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded ISK":"ISK is Nashik Airport."}}},
{"id":"n-8960bbf0","guard":[["has","vlg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code VLG":"VLG is Villa Gesell Airport."}}},
{"id":"n-89c85bf1","guard":[["has","mbo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mamburao Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-8ac25a73","guard":[["has","gaf"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gafsa Ksar International Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-8b1b5703","guard":[["hasAny",["airport","name","swf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport SWF":"SWF is Stewart International Airport."}}},
{"id":"n-8bcf5883","guard":[["has","hva"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Analalava Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-8befa1ed","guard":[["hasAny",["airport","coded","name","stt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded STT":"STT is Cyril E. King Airport."}}},
{"id":"n-8c72900d","guard":[["has","vlg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Villa Gesell Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-8ce2ebc8","guard":[["hasAny",["airport","code","has","hba","iata"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code HBA":"HBA is Hobart International Airport."}}},
{"id":"n-8d6b0c9c","guard":[["has","ozh"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zaporizhzhia International Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-8dadef4f","guard":[["hasAny",["airport","lrd","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport LRD":"LRD is Laredo International Airport."}}},
{"id":"n-8ea2072b","guard":[["hasAny",["airport","coded","dsd","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded DSD":"DSD is La Désirade Airport."}}},
{"id":"n-8eca6f01","guard":[["has","qrr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Warren Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-8eeec688","guard":[["has","hph"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cat Bi International Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-8f089a96","guard":[["hasAny",["airport","coded","moq","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded MOQ":"MOQ is Morondava Airport."}}},
{"id":"n-907ad3aa","guard":[["has","cng"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cognac-Châteaubernard (BA 709) Air Base."]},["sense.lastWord"]],"mem":null},
{"id":"n-90e00c62","guard":[["has","ybi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code YBI":"YBI is Black Tickle Airport."}}},
{"id":"n-92d74437","guard":[["hasAny",["airport","code","has","iata","ozh"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code OZH":"OZH is Zaporizhzhia International Airport."}}},
{"id":"n-92d9239f","guard":[["hasAny",["airport","coded","name","txl"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded TXL":"TXL is Berlin-Tegel Airport."}}},
{"id":"n-931faa92","guard":[["has","qji"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport QJI":"QJI is Ikamiut Heliport."}}},
{"id":"n-93e12cc8","guard":[["has","mxs"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maota Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-93eb09d4","guard":[["hasAny",["airport","code","has","iata","oky"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code OKY":"OKY is Oakey Airport."}}},
{"id":"n-951b6850","guard":[["has","cfc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport CFC":"CFC is Caçador Airport."}}},
{"id":"n-95bf6c14","guard":[["has","cma"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cunnamulla Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-967f45fe","guard":[["has","bzn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded BZN":"BZN is Gallatin Field."}}},
{"id":"n-96ad29ca","guard":[["hasAny",["airport","name","tku"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport TKU":"TKU is Turku Airport."}}},
{"id":"n-9731a6b2","guard":[["has","avb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded AVB":"AVB is Aviano Air Base."}}},
{"id":"n-97734cd0","guard":[["has","zlo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Playa De Oro International Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-97d46522","guard":[["has","txl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berlin-Tegel Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-9858b28e","guard":[["has","yqv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded YQV":"YQV is Yorkton Municipal Airport."}}},
{"id":"n-987ead7b","guard":[["has","gaf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport GAF":"GAF is Gafsa Ksar International Airport."}}},
{"id":"n-9d2b04d0","guard":[["has","stt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded STT":"STT is Cyril E. King Airport."}}},
{"id":"n-9d4acc74","guard":[["hasAny",["airport","code","has","iata","zlo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code ZLO":"ZLO is Playa De Oro International Airport."}}},
{"id":"n-9d669a45","guard":[["has","jhm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code JHM":"JHM is Kapalua Airport."}}},
{"id":"n-9e98d2ad","guard":[["has","sin"],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Singapore Changi Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-a0629e40","guard":[["has","cfc"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Caçador Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-a0846b59","guard":[["hasAny",["abv","airport","code","has","iata"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code ABV":"ABV is Nnamdi Azikiwe International Airport."}}},
{"id":"n-a16fa51c","guard":[["has","cng"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code CNG":"CNG is Cognac-Châteaubernard (BA 709) Air Base."}}},
{"id":"n-a1dc8d74","guard":[["hasAny",["airport","coded","name","sba"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded SBA":"SBA is Santa Barbara Municipal Airport."}}},
{"id":"n-a3010051","guard":[["hasAny",["airport","coded","name","yxt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded YXT":"YXT is Northwest Regional Airport Terrace-Kitimat."}}},
{"id":"n-a72b54c2","guard":[["has","ybw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bedwell Harbour Seaplane Base."]},["sense.lastWord"]],"mem":null},
{"id":"n-a767fefd","guard":[["has","yxt"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Northwest Regional Airport Terrace-Kitimat."]},["sense.lastWord"]],"mem":null},
{"id":"n-a8000e27","guard":[["has","off"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport OFF":"OFF is Offutt Air Force Base."}}},
{"id":"n-a9f69bb3","guard":[["has","ogg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kahului Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-aa8bb47a","guard":[["has","glh"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mid Delta Regional Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-aa92c2f8","guard":[["has","qrr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code QRR":"QRR is Warren Airport."}}},
{"id":"n-ab73a63e","guard":[["has","mwf"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maewo-Naone Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-adee145f","guard":[["has","rbx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport RBX":"RBX is Rumbek Airport."}}},
{"id":"n-ae931ff0","guard":[["has","atl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hartsfield Jackson Atlanta International Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-aecac368","guard":[["has","rcq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded RCQ":"RCQ is Reconquista Airport."}}},
{"id":"n-aed8d156","guard":[["hasAny",["airport","buo","coded","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded BUO":"BUO is Burao Airport."}}},
{"id":"n-b02962d1","guard":[["hasAny",["airport","code","has","iata","jsm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code JSM":"JSM is Jose De San Martin Airport."}}},
{"id":"n-b324b590","guard":[["hasAny",["airport","code","has","iata","lel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code LEL":"LEL is Lake Evella Airport."}}},
{"id":"n-b35178b7","guard":[["hasAny",["airport","name","off"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport OFF":"OFF is Offutt Air Force Base."}}},
{"id":"n-b487e7c4","guard":[["has","abv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code ABV":"ABV is Nnamdi Azikiwe International Airport."}}},
{"id":"n-b4b139b7","guard":[["hasAny",["abq","airport","code","has","iata"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code ABQ":"ABQ is Albuquerque International Sunport."}}},
{"id":"n-b6bf115d","guard":[["has","hva"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded HVA":"HVA is Analalava Airport."}}},
{"id":"n-b935789c","guard":[["hasAny",["airport","ccr","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport CCR":"CCR is Buchanan Field."}}},
{"id":"n-baa0adcf","guard":[["has","cxp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport CXP":"CXP is Tunggul Wulung Airport."}}},
{"id":"n-bacfb280","guard":[["has","jdo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded JDO":"JDO is Orlando Bezerra de Menezes Airport."}}},
{"id":"n-bb362b73","guard":[["hasAny",["airport","gaf","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport GAF":"GAF is Gafsa Ksar International Airport."}}},
{"id":"n-bc408e6a","guard":[["has","abq"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Albuquerque International Sunport."]},["sense.lastWord"]],"mem":null},
{"id":"n-bdcd1716","guard":[["hasAny",["airport","coded","name","sov"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded SOV":"SOV is Seldovia Airport."}}},
{"id":"n-bef9a1ad","guard":[["hasAny",["airport","code","has","iata","pir"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code PIR":"PIR is Pierre Regional Airport."}}},
{"id":"n-c02335f9","guard":[["has","stt"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cyril E. King Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-c214b330","guard":[["has","ouh"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oudtshoorn Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-c22aa84c","guard":[["has","mwf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded MWF":"MWF is Maewo-Naone Airport."}}},
{"id":"n-c2df47ce","guard":[["hasAny",["airport","coded","mwf","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded MWF":"MWF is Maewo-Naone Airport."}}},
{"id":"n-c34c4773","guard":[["has","tku"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Turku Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-c55b7b3a","guard":[["hasAny",["airport","coded","name","yrv"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded YRV":"YRV is Revelstoke Airport."}}},
{"id":"n-c5c1d0c7","guard":[["has","cyw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Captain Rogelio Castillo National Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-c78d1147","guard":[["hasAny",["airport","code","has","iata","ivl"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code IVL":"IVL is Ivalo Airport."}}},
{"id":"n-c7d7f253","guard":[["has","lel"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lake Evella Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-c80be8ff","guard":[["has","ybw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport YBW":"YBW is Bedwell Harbour Seaplane Base."}}},
{"id":"n-c82d943c","guard":[["has","hwn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded HWN":"HWN is Hwange National Park Airport."}}},
{"id":"n-c839f3e7","guard":[["has","xpp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code XPP":"XPP is Poplar River Airport."}}},
{"id":"n-c947a372","guard":[["hasAny",["airport","cng","code","has","iata"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code CNG":"CNG is Cognac-Châteaubernard (BA 709) Air Base."}}},
{"id":"n-ccc7fc8d","guard":[["has","yrv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded YRV":"YRV is Revelstoke Airport."}}},
{"id":"n-ce0df742","guard":[["has","swf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport SWF":"SWF is Stewart International Airport."}}},
{"id":"n-ce78b409","guard":[["has","acx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded ACX":"ACX is Xingyi Airport."}}},
{"id":"n-cea389c2","guard":[["hasAny",["airport","code","has","iata","wkf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code WKF":"WKF is Waterkloof Air Force Base."}}},
{"id":"n-d0a297fa","guard":[["has","hph"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded HPH":"HPH is Cat Bi International Airport."}}},
{"id":"n-d0fe9f7e","guard":[["has","moq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded MOQ":"MOQ is Morondava Airport."}}},
{"id":"n-d101e1fb","guard":[["has","ngi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code NGI":"NGI is Ngau Airport."}}},
{"id":"n-d199afba","guard":[["hasAny",["airport","name","vix"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport VIX":"VIX is Eurico de Aguiar Salles Airport."}}},
{"id":"n-d2debdb0","guard":[["has","hod"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport HOD":"HOD is Hodeidah International Airport."}}},
{"id":"n-d36dadb7","guard":[["has","auh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport AUH":"AUH is Abu Dhabi International Airport."}}},
{"id":"n-d397ac06","guard":[["has","sik"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code SIK":"SIK is Sikeston Memorial Municipal Airport."}}},
{"id":"n-d3da53e7","guard":[["hasAny",["airport","coded","name","yrf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded YRF":"YRF is Cartwright Airport."}}},
{"id":"n-d5cc5913","guard":[["hasAny",["airport","code","has","iata","xpp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code XPP":"XPP is Poplar River Airport."}}},
{"id":"n-d78e32f8","guard":[["hasAny",["airport","code","has","iata","mmo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code MMO":"MMO is Maio Airport."}}},
{"id":"n-d7af0603","guard":[["has","hld"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport HLD":"HLD is Dongshan Airport."}}},
{"id":"n-da57c798","guard":[["has","pid"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport PID":"PID is Nassau Paradise Island Airport."}}},
{"id":"n-dd54a236","guard":[["has","pir"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code PIR":"PIR is Pierre Regional Airport."}}},
{"id":"n-ddf76eae","guard":[["has","bzn"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gallatin Field."]},["sense.lastWord"]],"mem":null},
{"id":"n-de38e7b8","guard":[["has","xpp"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Poplar River Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-de413fee","guard":[["hasAny",["airport","code","has","iata","okc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code OKC":"OKC is Will Rogers World Airport."}}},
{"id":"n-dec75c82","guard":[["has","lrd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport LRD":"LRD is Laredo International Airport."}}},
{"id":"n-ded9daff","guard":[["has","abi"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abilene Regional Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-df36eeb6","guard":[["has","ild"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport ILD":"ILD is Lleida-Alguaire Airport."}}},
{"id":"n-e0367314","guard":[["has","off"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Offutt Air Force Base."]},["sense.lastWord"]],"mem":null},
{"id":"n-e069ad67","guard":[["has","chm"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Teniente FAP Jaime A De Montreuil Morales Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-e179fc7d","guard":[["has","mbo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded MBO":"MBO is Mamburao Airport."}}},
{"id":"n-e3eba8b6","guard":[["has","oue"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ouesso Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-e544ca9c","guard":[["has","ild"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lleida-Alguaire Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-e5786779","guard":[["has","mtj"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport MTJ":"MTJ is Montrose Regional Airport."}}},
{"id":"n-e585572d","guard":[["has","mmo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code MMO":"MMO is Maio Airport."}}},
{"id":"n-e591d0a8","guard":[["has","yrf"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cartwright Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-e5d9035f","guard":[["has","yrf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded YRF":"YRF is Cartwright Airport."}}},
{"id":"n-e5e6b7e8","guard":[["hasAny",["airport","coded","hph","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded HPH":"HPH is Cat Bi International Airport."}}},
{"id":"n-e5f62f92","guard":[["has","yqv"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Yorkton Municipal Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-e726ed02","guard":[["has","btm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport BTM":"BTM is Bert Mooney Airport."}}},
{"id":"n-e773dc82","guard":[["has","sdu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santos Dumont Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-e8a79bb7","guard":[["has","xcr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Châlons-Vatry Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-e93c38a9","guard":[["has","jsm"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jose De San Martin Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-e994a860","guard":[["hasAny",["airport","byn","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport BYN":"BYN is Bayankhongor Airport."}}},
{"id":"n-ea8c7f67","guard":[["has","ivl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ivalo Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-eccab351","guard":[["hasAny",["airport","cma","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport CMA":"CMA is Cunnamulla Airport."}}},
{"id":"n-ed756902","guard":[["has","chm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded CHM":"CHM is Teniente FAP Jaime A De Montreuil Morales Airport."}}},
{"id":"n-eff67090","guard":[["has","qig"],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Iguatu Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-f11e1f15","guard":[["has","knr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jam Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-f18be16e","guard":[["has","sht"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport SHT":"SHT is Shepparton Airport."}}},
{"id":"n-f3a7a9ef","guard":[["hasAny",["airport","mqx","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport MQX":"MQX is Mekele Airport."}}},
{"id":"n-f4297def","guard":[["has","oky"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oakey Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-f474d1a9","guard":[["hasAny",["airport","hod","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport HOD":"HOD is Hodeidah International Airport."}}},
{"id":"n-f50851d2","guard":[["has","dcm"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Castres-Mazamet Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-f560adae","guard":[["hasAny",["airport","code","has","iata","tof"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airport has the IATA code TOF":"TOF is Bogashevo Airport."}}},
{"id":"n-f6900aea","guard":[["has","acx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xingyi Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-f6944e57","guard":[["has","jsm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code JSM":"JSM is Jose De San Martin Airport."}}},
{"id":"n-f6defacb","guard":[["has","jab"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jabiru Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-f7788f18","guard":[["hasAny",["airport","cri","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of the airport CRI":"CRI is Colonel Hill Airport."}}},
{"id":"n-f7d1fa9a","guard":[["has","rcq"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reconquista Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-f9b9e7d0","guard":[["has","sin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code SIN":"SIN is Singapore Changi Airport."}}},
{"id":"n-fb381776","guard":[["has","sia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport SIA":"SIA is Xi'an Xiguan Airport."}}},
{"id":"n-fcb3fc8e","guard":[["has","ahn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport AHN":"AHN is Athens Ben Epps Airport."}}},
{"id":"n-fcb65b1e","guard":[["has","awa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the name of the airport AWA":"AWA is Awassa Airport."}}},
{"id":"n-fcd5d72a","guard":[["has","hwn"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hwange National Park Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-fd46c2c2","guard":[["has","twt"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sanga Sanga Airport."]},["sense.lastWord"]],"mem":null},
{"id":"n-fd784400","guard":[["has","mxs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airport has the IATA code MXS":"MXS is Maota Airport."}}},
{"id":"n-fda7024e","guard":[["has","ejh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airport coded EJH":"EJH is Al Wajh Domestic Airport."}}},
{"id":"n-fe234065","guard":[["hasAny",["acx","airport","coded","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airport coded ACX":"ACX is Xingyi Airport."}}},
{"id":"n-02339b6b","guard":[["has","ccr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Buchanan Field."]},["sense.after",{"lit":"airport"}]],"mem":null},
{"id":"n-0657f9b9","guard":[["has","tkc"]],"pyramid":["render.template",{"lit":["TKC is Tiko ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-083767f9","guard":[["has","ozh"]],"pyramid":["render.template",{"lit":["OZH is Zaporizhzhia International ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-084af3a9","guard":[["has","ngi"]],"pyramid":["render.template",{"lit":["NGI is Ngau ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0d0c4fb4","guard":[["has","pot"],["has","airport"]],"pyramid":["render.template",{"lit":["POT is Ken Jones ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0e861181","guard":[["has","lel"]],"pyramid":["render.template",{"lit":["LEL is Lake Evella ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0f40fdf3","guard":[["has","jsm"]],"pyramid":["render.template",{"lit":["JSM is Jose De San Martin ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-14892a74","guard":[["has","mmo"]],"pyramid":["render.template",{"lit":["MMO is Maio ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-15c7228d","guard":[["hasAny",["abq","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Albuquerque International Sunport."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1d086f42","guard":[["has","qji"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ikamiut Heliport."]},["sense.after",{"lit":"airport"}]],"mem":null},
{"id":"n-20205784","guard":[["hasAny",["bzn","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gallatin Field."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-27beebe5","guard":[["hasAny",["ccr","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Buchanan Field."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-27c85b02","guard":[["has","cyw"]],"pyramid":["render.template",{"lit":["CYW is Captain Rogelio Castillo National ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2dc73c3e","guard":[["has","ybi"]],"pyramid":["render.template",{"lit":["YBI is Black Tickle ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-34afb2dd","guard":[["hasAny",["no vowels","remove vowels","without vowels","wkf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Waterkloof Air Force Base."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-36677b36","guard":[["has","ybw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bedwell Harbour Seaplane Base."]},["sense.after",{"lit":"airport"}]],"mem":null},
{"id":"n-399abd4a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ccr","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Buchanan Field."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3f709f87","guard":[["hasAny",["qji","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ikamiut Heliport."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3f7a2324","guard":[["has","off"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Offutt Air Force Base."]},["sense.after",{"lit":"airport"}]],"mem":null},
{"id":"n-3ff44a3b","guard":[["hasAny",["bzn","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gallatin Field."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4280a032","guard":[["hasAny",["lower case","lowercase","small letters","ybw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bedwell Harbour Seaplane Base."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-442eaee2","guard":[["hasAny",["kqa","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Akutan Seaplane Base."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-470683b5","guard":[["hasAny",["bzn","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gallatin Field."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-4a50fdc7","guard":[["hasAny",["off","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Offutt Air Force Base."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4db23bb8","guard":[["has","sza"]],"pyramid":["render.template",{"lit":["SZA is Soyo ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4f22979c","guard":[["has","sik"]],"pyramid":["render.template",{"lit":["SIK is Sikeston Memorial Municipal ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-51535b1e","guard":[["has","gym"]],"pyramid":["render.template",{"lit":["GYM is General José María Yáñez International ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-569c6153","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","wkf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Waterkloof Air Force Base."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6334eb2b","guard":[["hasAny",["kqa","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Akutan Seaplane Base."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-66a7d5b5","guard":[["has","jab"]],"pyramid":["render.template",{"lit":["JAB is Jabiru ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-6a908218","guard":[["has","tof"]],"pyramid":["render.template",{"lit":["TOF is Bogashevo ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-6d3d8b75","guard":[["hasAny",["abq","alphabetize the letters","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Albuquerque International Sunport."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-7099a879","guard":[["has","qrr"]],"pyramid":["render.template",{"lit":["QRR is Warren ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7b935bbd","guard":[["has","sdu"]],"pyramid":["render.template",{"lit":["SDU is Santos Dumont ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-800c2684","guard":[["hasAny",["ccr","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Buchanan Field."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-82162727","guard":[["hasAny",["bzn","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gallatin Field."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8894a45d","guard":[["has","glh"]],"pyramid":["render.template",{"lit":["GLH is Mid Delta Regional ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-90a6c7bd","guard":[["has","xpp"]],"pyramid":["render.template",{"lit":["XPP is Poplar River ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9298e3a9","guard":[["hasAny",["lower case","lowercase","qji","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ikamiut Heliport."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-945c9cbf","guard":[["has","okc"]],"pyramid":["render.template",{"lit":["OKC is Will Rogers World ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-987a0cb1","guard":[["has","vlg"]],"pyramid":["render.template",{"lit":["VLG is Villa Gesell ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9adc5e02","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","ybw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bedwell Harbour Seaplane Base."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9c82bb3a","guard":[["hasAny",["cng","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cognac-Châteaubernard (BA 709) Air Base."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-a214e73c","guard":[["has","sin"],["has","which"]],"pyramid":["render.template",{"lit":["SIN is Singapore Changi ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a4effd3c","guard":[["has","jhm"]],"pyramid":["render.template",{"lit":["JHM is Kapalua ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a57aad87","guard":[["hasAny",["no vowels","remove vowels","without vowels","ybw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bedwell Harbour Seaplane Base."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-a62bb3fd","guard":[["has","pir"]],"pyramid":["render.template",{"lit":["PIR is Pierre Regional ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a90ea132","guard":[["hasAny",["lower case","lowercase","off","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Offutt Air Force Base."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-af124777","guard":[["hasAny",["avb","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aviano Air Base."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-af357a36","guard":[["has","msz"]],"pyramid":["render.template",{"lit":["MSZ is Namibe ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b3ae5056","guard":[["hasAny",["avb","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aviano Air Base."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b4f07936","guard":[["hasAny",["abq","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Albuquerque International Sunport."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b7ecacaa","guard":[["hasAny",["cng","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cognac-Châteaubernard (BA 709) Air Base."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b97adeb0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cng","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cognac-Châteaubernard (BA 709) Air Base."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ba448c64","guard":[["hasAny",["capitalise","capitalize","capitalize each word","off","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Offutt Air Force Base."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ba9edcfb","guard":[["has","hba"]],"pyramid":["render.template",{"lit":["HBA is Hobart International ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-bf85b308","guard":[["has","mxs"]],"pyramid":["render.template",{"lit":["MXS is Maota ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c03b832a","guard":[["has","ivl"]],"pyramid":["render.template",{"lit":["IVL is Ivalo ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ca83e2f0","guard":[["has","zlo"]],"pyramid":["render.template",{"lit":["ZLO is Playa De Oro International ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d516764c","guard":[["hasAny",["shortest","shortest one","shortest word","ybw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bedwell Harbour Seaplane Base."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d6563d99","guard":[["hasAny",["lower case","lowercase","small letters","wkf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Waterkloof Air Force Base."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-dc84cc2f","guard":[["has","abv"]],"pyramid":["render.template",{"lit":["ABV is Nnamdi Azikiwe International ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-dda07303","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kqa","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Akutan Seaplane Base."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e814fce0","guard":[["hasAny",["ccr","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Buchanan Field."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-ee4cc2c4","guard":[["hasAny",["avb","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aviano Air Base."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f0ac33b4","guard":[["has","oky"]],"pyramid":["render.template",{"lit":["OKY is Oakey ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-fb694dcd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","qji","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ikamiut Heliport."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-00ddcd84","guard":[["hasAny",["item number","nth","position","rbx"]]],"pyramid":["render.template",{"lit":["RBX is Rumbek ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-08080eb2","guard":[["hasAny",["item number","kqa","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Akutan Seaplane Base."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-087d0513","guard":[["hasAny",["bzn","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gallatin Field."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-09266a45","guard":[["hasAny",["hwn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["HWN is Hwange National Park ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-09388a78","guard":[["hasAny",["auh","item number","nth","position"]]],"pyramid":["render.template",{"lit":["AUH is Abu Dhabi International ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0a9f94f1","guard":[["has","abi"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abilene Regional ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-0b052166","guard":[["has","okc"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Will Rogers World ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-10e1725d","guard":[["hasAny",["hjr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["HJR is Khajuraho ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-128472c0","guard":[["hasAny",["item number","mqx","nth","position"]]],"pyramid":["render.template",{"lit":["MQX is Mekele ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-137898ee","guard":[["has","jdo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Orlando Bezerra de Menezes ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-14e29506","guard":[["hasAny",["cma","item number","nth","position"]]],"pyramid":["render.template",{"lit":["CMA is Cunnamulla ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1954ead8","guard":[["hasAny",["item number","nth","position","txl"]]],"pyramid":["render.template",{"lit":["TXL is Berlin-Tegel ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1b26da7d","guard":[["hasAny",["each word","kqa","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Akutan Seaplane Base."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1bac9b81","guard":[["hasAny",["lower case","lowercase","off","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Offutt Air Force Base."]},["transform.lower",["sense.after",{"lit":"airport"}]]],"mem":null},
{"id":"n-1d749344","guard":[["hasAny",["item number","nth","position","twt"]]],"pyramid":["render.template",{"lit":["TWT is Sanga Sanga ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1db3ecbf","guard":[["hasAny",["each word","off","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Offutt Air Force Base."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1e97f9e5","guard":[["hasAny",["abi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["ABI is Abilene Regional ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-230970fc","guard":[["has","isk"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nashik ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-23b7feb9","guard":[["has","ndj"]],"pyramid":["render.template",{"lit":[{"slot":0}," is N'Djamena International ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-29a3b5c4","guard":[["has","wmr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mananara Nord ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-2ab7a295","guard":[["has","tof"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bogashevo ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2adff926","guard":[["hasAny",["avb","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aviano Air Base."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2bde0d2e","guard":[["hasAny",["ahn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["AHN is Athens Ben Epps ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2d002c9d","guard":[["has","mbo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mamburao ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-2e4ab1ca","guard":[["hasAny",["item number","nth","position","xcr"]]],"pyramid":["render.template",{"lit":["XCR is Châlons-Vatry ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2f10c16f","guard":[["hasAny",["item number","moq","nth","position"]]],"pyramid":["render.template",{"lit":["MOQ is Morondava ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3084a575","guard":[["hasAny",["each word","qji","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ikamiut Heliport."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-32aadc36","guard":[["hasAny",["item number","nth","position","yqv"]]],"pyramid":["render.template",{"lit":["YQV is Yorkton Municipal ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-32e395be","guard":[["hasAny",["cng","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cognac-Châteaubernard (BA 709) Air Base."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-33b55dfa","guard":[["hasAny",["isk","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["ISK is Nashik ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-35b9a787","guard":[["hasAny",["item number","nth","position","sht"]]],"pyramid":["render.template",{"lit":["SHT is Shepparton ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-39de5c1b","guard":[["has","xpp"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Poplar River ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-39f04868","guard":[["has","gym"]],"pyramid":["render.template",{"lit":[{"slot":0}," is General José María Yáñez International ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3a637f62","guard":[["hasAny",["abq","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Albuquerque International Sunport."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-408723c4","guard":[["has","sdu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santos Dumont ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-419effa2","guard":[["has","hwn"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hwange National Park ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-47cdec48","guard":[["has","abv"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nnamdi Azikiwe International ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4b56b5d5","guard":[["hasAny",["item number","nth","position","yrf"]]],"pyramid":["render.template",{"lit":["YRF is Cartwright ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4cf42eb5","guard":[["hasAny",["lower case","lowercase","qji","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ikamiut Heliport."]},["transform.lower",["sense.after",{"lit":"airport"}]]],"mem":null},
{"id":"n-4fb0e25e","guard":[["has","rcq"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reconquista ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-4ffd5690","guard":[["hasAny",["cri","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["CRI is Colonel Hill ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-51e6a725","guard":[["has","sin"],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Singapore Changi ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-52731722","guard":[["has","buo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Burao ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-534ab1af","guard":[["has","yqv"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Yorkton Municipal ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-53bfe915","guard":[["has","ivl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ivalo ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-54d6770a","guard":[["hasAny",["avb","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aviano Air Base."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-57da7335","guard":[["has","vlg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Villa Gesell ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-583a8738","guard":[["has","sza"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soyo ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-5c97a92d","guard":[["has","glh"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mid Delta Regional ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-5e083384","guard":[["hasAny",["ccr","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Buchanan Field."]},["transform.lower",["sense.after",{"lit":"airport"}]]],"mem":null},
{"id":"n-5e990c6d","guard":[["has","sik"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sikeston Memorial Municipal ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-60053e4e","guard":[["has","hjr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Khajuraho ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-62490bb2","guard":[["hasAny",["item number","mtj","nth","position"]]],"pyramid":["render.template",{"lit":["MTJ is Montrose Regional ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6300ee70","guard":[["hasAny",["ild","item number","nth","position"]]],"pyramid":["render.template",{"lit":["ILD is Lleida-Alguaire ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-634bbc80","guard":[["hasAny",["item number","nth","ogg","position"]]],"pyramid":["render.template",{"lit":["OGG is Kahului ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-63c55e57","guard":[["has","mxs"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maota ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-64c4118f","guard":[["hasAny",["hva","item number","nth","position"]]],"pyramid":["render.template",{"lit":["HVA is Analalava ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-64f1d488","guard":[["hasAny",["item number","mwf","nth","position"]]],"pyramid":["render.template",{"lit":["MWF is Maewo-Naone ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6528eb9c","guard":[["hasAny",["hph","item number","nth","position"]]],"pyramid":["render.template",{"lit":["HPH is Cat Bi International ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6549d5f4","guard":[["hasAny",["item number","jdh","nth","position"]]],"pyramid":["render.template",{"lit":["JDH is Jodhpur ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-674c1433","guard":[["hasAny",["atl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["ATL is Hartsfield Jackson Atlanta International ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-69d27f33","guard":[["has","jdh"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jodhpur ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-6cdc42bd","guard":[["hasAny",["abq","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Albuquerque International Sunport."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6d403a99","guard":[["has","hba"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hobart International ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-6d4dd015","guard":[["hasAny",["item number","nth","off","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Offutt Air Force Base."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6f2af177","guard":[["has","yrf"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cartwright ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-7249f742","guard":[["has","tkc"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tiko ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-73492dd2","guard":[["hasAny",["item number","lrd","nth","position"]]],"pyramid":["render.template",{"lit":["LRD is Laredo International ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-737dac55","guard":[["hasAny",["abq","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Albuquerque International Sunport."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-73973685","guard":[["hasAny",["item number","kqa","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Akutan Seaplane Base."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-74b0d8fa","guard":[["has","mwf"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maewo-Naone ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-77f5ffa2","guard":[["hasAny",["each word","kqa","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Akutan Seaplane Base."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-78a7ace5","guard":[["has","ozh"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zaporizhzhia International ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7daac801","guard":[["has","ngi"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ngau ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7fd83008","guard":[["hasAny",["item number","nth","position","vix"]]],"pyramid":["render.template",{"lit":["VIX is Eurico de Aguiar Salles ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-80eeadac","guard":[["hasAny",["item number","nth","position","qji"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ikamiut Heliport."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8212fb92","guard":[["hasAny",["avb","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aviano Air Base."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-836df143","guard":[["hasAny",["bzn","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gallatin Field."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-845f0619","guard":[["hasAny",["item number","nth","position","yrv"]]],"pyramid":["render.template",{"lit":["YRV is Revelstoke ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-87fa84c1","guard":[["hasAny",["item number","nth","position","wmr"]]],"pyramid":["render.template",{"lit":["WMR is Mananara Nord ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-897b8c6d","guard":[["has","stt"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cyril E. King ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-8a5b8a90","guard":[["has","sba"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santa Barbara Municipal ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-8b45fc2d","guard":[["hasAny",["bzn","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gallatin Field."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8ff6c75e","guard":[["hasAny",["item number","nth","position","qig"]],["has","what"]],"pyramid":["render.template",{"lit":["QIG is Iguatu ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9113c0fd","guard":[["hasAny",["acx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["ACX is Xingyi ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-912a72ea","guard":[["hasAny",["item number","knr","nth","position"]]],"pyramid":["render.template",{"lit":["KNR is Jam ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-92a95e86","guard":[["hasAny",["item number","nth","ouh","position"]]],"pyramid":["render.template",{"lit":["OUH is Oudtshoorn ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-945f1bcd","guard":[["hasAny",["ccr","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Buchanan Field."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9981270e","guard":[["hasAny",["buo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["BUO is Burao ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9bafa2f4","guard":[["has","jsm"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jose De San Martin ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a008c44f","guard":[["has","sov"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seldovia ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-a35ce184","guard":[["hasAny",["item number","nth","position","tku"]]],"pyramid":["render.template",{"lit":["TKU is Turku ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a38faaad","guard":[["has","mmo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maio ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a641c2c2","guard":[["has","jhm"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kapalua ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a6ca9c58","guard":[["hasAny",["lower case","lowercase","small letters","ybw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bedwell Harbour Seaplane Base."]},["transform.lower",["sense.after",{"lit":"airport"}]]],"mem":null},
{"id":"n-a70a4b42","guard":[["has","oky"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oakey ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a75d8fce","guard":[["has","atl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hartsfield Jackson Atlanta International ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-a8a819fd","guard":[["has","yxt"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Northwest Regional ",{"slot":1}," Terrace-Kitimat."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-adb44813","guard":[["has","dsd"]],"pyramid":["render.template",{"lit":[{"slot":0}," is La Désirade ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-b0b8360f","guard":[["hasAny",["item number","nth","position","spf"]]],"pyramid":["render.template",{"lit":["SPF is Black Hills ",{"slot":0},"-Clyde Ice Field."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b21fe5f5","guard":[["hasAny",["each word","off","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Offutt Air Force Base."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b29d1896","guard":[["hasAny",["hld","item number","nth","position"]]],"pyramid":["render.template",{"lit":["HLD is Dongshan ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b367994e","guard":[["has","acx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xingyi ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-b50ec0d5","guard":[["has","yrv"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Revelstoke ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-b671fb88","guard":[["hasAny",["item number","nth","position","sba"]]],"pyramid":["render.template",{"lit":["SBA is Santa Barbara Municipal ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b8e230ff","guard":[["has","cyw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Captain Rogelio Castillo National ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ba2a2307","guard":[["hasAny",["item number","nth","position","yxt"]]],"pyramid":["render.template",{"lit":["YXT is Northwest Regional ",{"slot":0}," Terrace-Kitimat."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-bb2571ba","guard":[["hasAny",["each word","qji","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ikamiut Heliport."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bb61d0d6","guard":[["hasAny",["item number","jdo","nth","position"]]],"pyramid":["render.template",{"lit":["JDO is Orlando Bezerra de Menezes ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-bbcc96a0","guard":[["has","ybi"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Tickle ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-be773869","guard":[["has","zlo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Playa De Oro International ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c0e87355","guard":[["hasAny",["awa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["AWA is Awassa ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c0f49b16","guard":[["hasAny",["item number","nth","position","rcq"]]],"pyramid":["render.template",{"lit":["RCQ is Reconquista ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c4310bef","guard":[["hasAny",["ejh","item number","nth","position"]]],"pyramid":["render.template",{"lit":["EJH is Al Wajh Domestic ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c5382506","guard":[["hasAny",["item number","nth","position","stt"]]],"pyramid":["render.template",{"lit":["STT is Cyril E. King ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c8946b77","guard":[["hasAny",["bzn","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gallatin Field."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c895ec33","guard":[["hasAny",["item number","nth","position","wkf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Waterkloof Air Force Base."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-c8b108d2","guard":[["has","ejh"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Al Wajh Domestic ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-c9e881ae","guard":[["hasAny",["byn","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["BYN is Bayankhongor ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-cbe5bb6b","guard":[["has","moq"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Morondava ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-cc601380","guard":[["hasAny",["hod","item number","nth","position"]]],"pyramid":["render.template",{"lit":["HOD is Hodeidah International ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-cce4c439","guard":[["has","chm"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Teniente FAP Jaime A De Montreuil Morales ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-cd4a91c2","guard":[["has","pot"],["has","airport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ken Jones ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ce5c4e79","guard":[["hasAny",["gaf","item number","nth","position"]]],"pyramid":["render.template",{"lit":["GAF is Gafsa Ksar International ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ce89502b","guard":[["has","hva"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Analalava ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-cea03853","guard":[["hasAny",["item number","ndj","nth","position"]]],"pyramid":["render.template",{"lit":["NDJ is N'Djamena International ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d0501b90","guard":[["hasAny",["cxp","item number","nth","position"]]],"pyramid":["render.template",{"lit":["CXP is Tunggul Wulung ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d4fbce44","guard":[["has","spf"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Hills ",{"slot":1},"-Clyde Ice Field."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-d5c57f07","guard":[["has","hph"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cat Bi International ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-d86e6321","guard":[["hasAny",["item number","nth","position","swf"]]],"pyramid":["render.template",{"lit":["SWF is Stewart International ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d8a88796","guard":[["hasAny",["item number","nth","oue","position"]]],"pyramid":["render.template",{"lit":["OUE is Ouesso ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d8ae5762","guard":[["has","jab"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jabiru ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d8dfa17c","guard":[["hasAny",["each word","split into words","wkf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Waterkloof Air Force Base."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d9c51118","guard":[["has","pir"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Pierre Regional ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-dc6d0348","guard":[["hasAny",["dsd","item number","nth","position"]]],"pyramid":["render.template",{"lit":["DSD is La Désirade ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-dce20cc7","guard":[["has","lel"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lake Evella ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-def1c2f0","guard":[["hasAny",["each word","split into words","ybw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bedwell Harbour Seaplane Base."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e0788fc7","guard":[["hasAny",["item number","mbo","nth","position"]]],"pyramid":["render.template",{"lit":["MBO is Mamburao ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e34a9ffc","guard":[["hasAny",["each word","split into words","ybw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bedwell Harbour Seaplane Base."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e6709cb0","guard":[["hasAny",["chm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["CHM is Teniente FAP Jaime A De Montreuil Morales ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e877b59b","guard":[["hasAny",["item number","nth","position","sia"]]],"pyramid":["render.template",{"lit":["SIA is Xi'an Xiguan ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-eb6ca38e","guard":[["hasAny",["cng","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cognac-Châteaubernard (BA 709) Air Base."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-ed46bc9d","guard":[["hasAny",["btm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["BTM is Bert Mooney ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f0a68cc3","guard":[["hasAny",["cfc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["CFC is Caçador ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f0ade879","guard":[["has","txl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berlin-Tegel ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-f1044fbf","guard":[["hasAny",["item number","nth","pid","position"]]],"pyramid":["render.template",{"lit":["PID is Nassau Paradise Island ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f2ffecd6","guard":[["hasAny",["dcm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["DCM is Castres-Mazamet ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f69034e8","guard":[["has","oue"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ouesso ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-f6929aae","guard":[["hasAny",["avb","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aviano Air Base."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f7596876","guard":[["hasAny",["item number","nth","position","sov"]]],"pyramid":["render.template",{"lit":["SOV is Seldovia ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f799a4f8","guard":[["hasAny",["each word","split into words","wkf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Waterkloof Air Force Base."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fa859208","guard":[["hasAny",["cng","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cognac-Châteaubernard (BA 709) Air Base."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fb533fb8","guard":[["has","qrr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Warren ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-fe022b98","guard":[["hasAny",["ccr","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Buchanan Field."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ff7f7e57","guard":[["has","msz"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Namibe ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-00d5d524","guard":[["hasAny",["atl","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hartsfield Jackson Atlanta International ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-00ed3e82","guard":[["hasAny",["lower case","lowercase","small letters","sza"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soyo ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-032e24d5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ivl","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ivalo ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-049a1195","guard":[["hasAny",["item number","nth","position","yrf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cartwright ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-05b2c3af","guard":[["hasAny",["cma","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cunnamulla ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-05f58688","guard":[["hasAny",["invert case","jhm","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kapalua ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-06e9a2d1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pot","title case"]],["has","airport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ken Jones ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-09d381e5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","yqv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Yorkton Municipal ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-0aa79f2e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jsm","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jose De San Martin ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0d15a796","guard":[["hasAny",["jhm","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kapalua ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0edf06fe","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sik","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sikeston Memorial Municipal ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0f01af91","guard":[["hasAny",["lower case","lowercase","qrr","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Warren ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0f5327c9","guard":[["hasAny",["invert case","jdo","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Orlando Bezerra de Menezes ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-10a195c4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ngi","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ngau ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-12e8a88d","guard":[["hasAny",["item number","mmo","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maio ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-13792c3a","guard":[["hasAny",["abv","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nnamdi Azikiwe International ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-14f371e3","guard":[["hasAny",["invert case","swap case","toggle case","yrv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Revelstoke ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-17028dd3","guard":[["hasAny",["lower case","lowercase","pot","small letters"]],["has","airport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ken Jones ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-1af6b148","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","yxt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Northwest Regional ",{"slot":1}," Terrace-Kitimat."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-1baf79f4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mwf","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maewo-Naone ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-1e3e0a99","guard":[["hasAny",["item number","ivl","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ivalo ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-202880ca","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jab","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jabiru ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2120216e","guard":[["hasAny",["item number","nth","oky","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oakey ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-21840a6b","guard":[["hasAny",["item number","knr","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jam ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2223ab8e","guard":[["hasAny",["item number","nth","position","swf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stewart International ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-266c13f3","guard":[["hasAny",["hba","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hobart International ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-26d165f2","guard":[["hasAny",["buo","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Burao ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-27050ff1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jhm","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kapalua ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-274b317c","guard":[["hasAny",["item number","nth","pid","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nassau Paradise Island ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2760f400","guard":[["hasAny",["lower case","lowercase","mxs","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maota ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-279ffe60","guard":[["hasAny",["invert case","swap case","toggle case","zlo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Playa De Oro International ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-27fb2c36","guard":[["hasAny",["item number","nth","position","qrr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Warren ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-283b7804","guard":[["hasAny",["btm","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bert Mooney ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-284bff01","guard":[["hasAny",["abi","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abilene Regional ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-288ece40","guard":[["hasAny",["item number","nth","position","wmr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mananara Nord ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-28b10017","guard":[["hasAny",["lower case","lowercase","small letters","tof"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bogashevo ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-299726fb","guard":[["hasAny",["lel","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lake Evella ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2a89db95","guard":[["hasAny",["capitalise","capitalize","capitalize each word","chm","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Teniente FAP Jaime A De Montreuil Morales ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-2b065e45","guard":[["hasAny",["capitalise","capitalize","capitalize each word","stt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cyril E. King ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-2be9956d","guard":[["hasAny",["invert case","oky","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oakey ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-2c9e0469","guard":[["hasAny",["hjr","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Khajuraho ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-2f724244","guard":[["hasAny",["item number","nth","position","vlg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Villa Gesell ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-30c01c84","guard":[["hasAny",["item number","nth","position","sov"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seldovia ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3286a442","guard":[["hasAny",["invert case","swap case","tkc","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tiko ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-331a8b7b","guard":[["hasAny",["alphabetize the letters","letters in order","qrr","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Warren ",{"slot":1},"."]},["transform.sortLetters",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-333c841f","guard":[["hasAny",["item number","nth","position","zlo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Playa De Oro International ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-334d4ae7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tof"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bogashevo ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-342ed3de","guard":[["hasAny",["lower case","lowercase","small letters","tkc"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tiko ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3600b7f3","guard":[["hasAny",["lower case","lowercase","pir","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Pierre Regional ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-36c67d87","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hba","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hobart International ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-36f5febb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sik","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sikeston Memorial Municipal ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-385c65e8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sza","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soyo ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-386e65bc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ozh","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zaporizhzhia International ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3983c022","guard":[["hasAny",["buo","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Burao ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3a31fc82","guard":[["hasAny",["item number","jab","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jabiru ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-3a8b1f97","guard":[["hasAny",["invert case","mmo","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maio ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-3a9c83a5","guard":[["hasAny",["item number","ndj","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is N'Djamena International ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3ac1183d","guard":[["hasAny",["item number","jsm","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jose De San Martin ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-3e5b7a35","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","yrv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Revelstoke ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-407e0aed","guard":[["hasAny",["item number","jdh","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jodhpur ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-414040db","guard":[["hasAny",["gym","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is General José María Yáñez International ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4172809a","guard":[["hasAny",["invert case","qrr","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Warren ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-4231c4d1","guard":[["hasAny",["abv","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nnamdi Azikiwe International ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4408418c","guard":[["hasAny",["backwards","lel","mirror","reverse","reversed","spell backwards"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lake Evella ",{"slot":1},"."]},["transform.reverse",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-467243d2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sov","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seldovia ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-46a72f16","guard":[["hasAny",["invert case","jdh","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jodhpur ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-4720d878","guard":[["hasAny",["lower case","lowercase","okc","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Will Rogers World ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-48dd65d4","guard":[["hasAny",["ivl","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ivalo ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4a621d36","guard":[["hasAny",["glh","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mid Delta Regional ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4acd8d3f","guard":[["hasAny",["item number","nth","position","sik"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sikeston Memorial Municipal ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-4c4dc3be","guard":[["hasAny",["item number","nth","pir","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Pierre Regional ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-4daeac48","guard":[["hasAny",["cfc","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Caçador ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4ed53274","guard":[["hasAny",["gym","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is General José María Yáñez International ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-509fabba","guard":[["hasAny",["hba","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hobart International ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-50a0147e","guard":[["hasAny",["item number","nth","position","xcr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Châlons-Vatry ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-50c1fde2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","yrf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cartwright ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-50db9f9f","guard":[["hasAny",["item number","nth","position","tkc"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tiko ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-524e2452","guard":[["hasAny",["item number","nth","position","tof"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bogashevo ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-53e648c9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sin","title case"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Singapore Changi ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-555c68f4","guard":[["hasAny",["item number","jdo","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Orlando Bezerra de Menezes ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-55fdd59a","guard":[["hasAny",["lower case","lowercase","ozh","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zaporizhzhia International ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-56199fff","guard":[["hasAny",["jhm","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kapalua ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-577a4da1","guard":[["hasAny",["atl","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hartsfield Jackson Atlanta International ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-5870b122","guard":[["hasAny",["jsm","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jose De San Martin ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-599e31e9","guard":[["hasAny",["lower case","lowercase","mmo","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maio ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-5b297391","guard":[["hasAny",["acx","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xingyi ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-5caf9268","guard":[["hasAny",["byn","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bayankhongor ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5cba09a1","guard":[["hasAny",["item number","nth","ogg","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kahului ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5cd6f0bc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ozh","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zaporizhzhia International ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-5db8fceb","guard":[["hasAny",["item number","nth","ouh","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oudtshoorn ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5ea4b810","guard":[["hasAny",["glh","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mid Delta Regional ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-5ed7eea9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sdu","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santos Dumont ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-5eff4860","guard":[["hasAny",["invert case","rcq","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reconquista ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-5f2ca284","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jdo","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Orlando Bezerra de Menezes ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-5f47304f","guard":[["hasAny",["hva","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Analalava ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-617b531d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","ybi"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Tickle ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-619e0b12","guard":[["hasAny",["item number","nth","position","stt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cyril E. King ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-61cf9d4e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mxs","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maota ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-620c8720","guard":[["hasAny",["lower case","lowercase","small letters","ybi"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Tickle ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-62582399","guard":[["hasAny",["item number","nth","position","twt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sanga Sanga ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-62af5c76","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tof"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bogashevo ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-6411710c","guard":[["hasAny",["item number","nth","position","sza"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soyo ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-6437b2e5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","txl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berlin-Tegel ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-6567a0e4","guard":[["hasAny",["item number","nth","position","rcq"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reconquista ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-65f4dd91","guard":[["hasAny",["invert case","sov","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seldovia ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-68814fb2","guard":[["hasAny",["no vowels","remove vowels","without vowels","xpp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Poplar River ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-6a9ee3a3","guard":[["hasAny",["ejh","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Al Wajh Domestic ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-6b842364","guard":[["hasAny",["buo","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Burao ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-6d627734","guard":[["hasAny",["invert case","pir","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Pierre Regional ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-6fd238ac","guard":[["hasAny",["item number","nth","position","pot"]],["has","airport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ken Jones ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-704d5bf7","guard":[["hasAny",["ejh","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Al Wajh Domestic ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-704ffe69","guard":[["hasAny",["msz","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Namibe ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7137779a","guard":[["hasAny",["invert case","sdu","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santos Dumont ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-72e71ccd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jdh","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jodhpur ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-73b7cf19","guard":[["hasAny",["invert case","mxs","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maota ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-73e27819","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dsd","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is La Désirade ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-73ee8918","guard":[["hasAny",["abv","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nnamdi Azikiwe International ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-74762ea6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jsm","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jose De San Martin ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-74947545","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mmo","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maio ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-751ae4a7","guard":[["hasAny",["invert case","lel","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lake Evella ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-75868586","guard":[["hasAny",["capitalise","capitalize","capitalize each word","oky","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oakey ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-76cee721","guard":[["hasAny",["item number","nth","position","rbx"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rumbek ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-775ce6d1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gym","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is General José María Yáñez International ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-776ecd8e","guard":[["hasAny",["invert case","swap case","toggle case","wmr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mananara Nord ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-78da03b0","guard":[["hasAny",["acx","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xingyi ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7ae7266b","guard":[["hasAny",["invert case","swap case","toggle case","yxt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Northwest Regional ",{"slot":1}," Terrace-Kitimat."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-7c2bdccc","guard":[["hasAny",["chm","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Teniente FAP Jaime A De Montreuil Morales ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7c85c8ec","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","vlg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Villa Gesell ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-7d081ccc","guard":[["hasAny",["item number","nth","position","txl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berlin-Tegel ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7d0b1c20","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mxs","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maota ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7d335cd3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hwn","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hwange National Park ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-7d6a2418","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tkc"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tiko ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-7e3d512a","guard":[["hasAny",["cyw","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Captain Rogelio Castillo National ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-7fafde9f","guard":[["hasAny",["abv","alphabetize the letters","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nnamdi Azikiwe International ",{"slot":1},"."]},["transform.sortLetters",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-804cbcc3","guard":[["hasAny",["glh","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mid Delta Regional ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-812e02d0","guard":[["hasAny",["hwn","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hwange National Park ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8196eaf2","guard":[["hasAny",["no vowels","qrr","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Warren ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-81b2781a","guard":[["hasAny",["item number","nth","position","qig"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Iguatu ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-821a896d","guard":[["hasAny",["item number","lrd","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Laredo International ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-82d038d1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","msz","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Namibe ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-833727da","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jhm","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kapalua ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-83746744","guard":[["hasAny",["capitalise","capitalize","capitalize each word","oue","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ouesso ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-85722518","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lel","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lake Evella ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-85e03b9b","guard":[["hasAny",["invert case","okc","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Will Rogers World ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-85f488b5","guard":[["hasAny",["invert case","oue","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ouesso ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-87f46bcc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ngi","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ngau ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-89cbb97e","guard":[["hasAny",["hwn","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hwange National Park ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-8a6f1d23","guard":[["hasAny",["capitalise","capitalize","capitalize each word","glh","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mid Delta Regional ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-8aa74e62","guard":[["hasAny",["invert case","sik","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sikeston Memorial Municipal ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-8ae43686","guard":[["hasAny",["lower case","lowercase","small letters","zlo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Playa De Oro International ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8b099015","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pot","title case"]],["has","airport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ken Jones ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-8cbb2f16","guard":[["hasAny",["capitalise","capitalize","capitalize each word","oky","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oakey ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8d7202e3","guard":[["hasAny",["no vowels","remove vowels","tkc","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tiko ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8dfb7901","guard":[["hasAny",["capitalise","capitalize","capitalize each word","glh","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mid Delta Regional ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8fb1dc19","guard":[["hasAny",["invert case","moq","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Morondava ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-8fb71c54","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pir","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Pierre Regional ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-911f51ea","guard":[["hasAny",["lower case","lowercase","msz","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Namibe ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-912030dc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","wmr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mananara Nord ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-91792a6b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cyw","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Captain Rogelio Castillo National ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-91cf2124","guard":[["hasAny",["cri","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Colonel Hill ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9223fda6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mbo","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mamburao ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-934a4443","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hva","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Analalava ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-93fb98da","guard":[["hasAny",["lower case","lowercase","small letters","vlg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Villa Gesell ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-94da6f23","guard":[["hasAny",["cyw","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Captain Rogelio Castillo National ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-952d6af2","guard":[["hasAny",["invert case","ozh","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zaporizhzhia International ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-960cdf62","guard":[["hasAny",["item number","nth","position","sba"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santa Barbara Municipal ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-98190991","guard":[["hasAny",["atl","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hartsfield Jackson Atlanta International ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-98e7c53e","guard":[["hasAny",["item number","nth","position","sia"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xi'an Xiguan ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-990eb756","guard":[["hasAny",["item number","jhm","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kapalua ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-99af7ee2","guard":[["hasAny",["item number","nth","position","sht"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Shepparton ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9c52eb1e","guard":[["hasAny",["item number","mtj","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Montrose Regional ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9ca099bb","guard":[["hasAny",["auh","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abu Dhabi International ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9cc23c58","guard":[["hasAny",["invert case","jab","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jabiru ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-9d42678b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","vlg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Villa Gesell ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9e5bac36","guard":[["hasAny",["dsd","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is La Désirade ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-a0c7a462","guard":[["hasAny",["lower case","lowercase","oky","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oakey ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a16d9324","guard":[["hasAny",["invert case","swap case","tof","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bogashevo ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a2a70214","guard":[["hasAny",["item number","nth","position","spf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Hills ",{"slot":1},"-Clyde Ice Field."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a4605a6b","guard":[["hasAny",["invert case","mbo","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mamburao ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-a508ec8a","guard":[["hasAny",["item number","nth","position","yqv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Yorkton Municipal ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a54cb073","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","zlo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Playa De Oro International ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a6aa134d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","zlo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Playa De Oro International ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a776c409","guard":[["hasAny",["invert case","msz","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Namibe ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a824b111","guard":[["hasAny",["ild","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lleida-Alguaire ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a89f2830","guard":[["hasAny",["invert case","sin","swap case","toggle case"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Singapore Changi ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a8e7365a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","qrr","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Warren ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a915897b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pir","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Pierre Regional ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-aa64f7dd","guard":[["hasAny",["abv","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nnamdi Azikiwe International ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-ac062c8a","guard":[["hasAny",["chm","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Teniente FAP Jaime A De Montreuil Morales ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-ac41e3f3","guard":[["hasAny",["invert case","ivl","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ivalo ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-aced0911","guard":[["hasAny",["capitalise","capitalize","capitalize each word","okc","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Will Rogers World ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-ad242809","guard":[["hasAny",["dsd","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is La Désirade ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ad7480b0","guard":[["hasAny",["isk","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nashik ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-af66da9c","guard":[["hasAny",["invert case","swap case","sza","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soyo ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-b006f9c7","guard":[["hasAny",["abi","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abilene Regional ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-b11c9994","guard":[["hasAny",["glh","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mid Delta Regional ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-b178bc48","guard":[["hasAny",["item number","nth","position","yxt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Northwest Regional ",{"slot":1}," Terrace-Kitimat."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b2de9237","guard":[["hasAny",["item number","moq","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Morondava ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b35c50f8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ndj","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is N'Djamena International ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-b3784cfe","guard":[["hasAny",["acx","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xingyi ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-b3fbade9","guard":[["hasAny",["invert case","swap case","toggle case","txl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berlin-Tegel ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-b5ce1816","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ivl","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ivalo ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b7cc5520","guard":[["hasAny",["item number","mwf","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maewo-Naone ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b7f849d2","guard":[["hasAny",["cyw","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Captain Rogelio Castillo National ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-b879e26f","guard":[["hasAny",["invert case","jsm","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jose De San Martin ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-b87fb901","guard":[["hasAny",["item number","nth","ozh","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zaporizhzhia International ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-ba43715c","guard":[["hasAny",["item number","mqx","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mekele ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-bdb94e7d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sza","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soyo ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-bdbe902b","guard":[["hasAny",["invert case","swap case","toggle case","yrf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cartwright ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-be2f57d2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mmo","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maio ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-beccaa8c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","moq","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Morondava ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-bed0d231","guard":[["hasAny",["hph","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cat Bi International ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-bf57fead","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gym","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is General José María Yáñez International ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-c17357ee","guard":[["hasAny",["item number","nth","oue","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ouesso ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c25c1654","guard":[["hasAny",["gaf","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gafsa Ksar International ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c3bcf7eb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","xpp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Poplar River ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-c4d9a42f","guard":[["hasAny",["hba","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hobart International ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c5316973","guard":[["hasAny",["item number","msz","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Namibe ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-c633d2f0","guard":[["hasAny",["lower case","lowercase","ngi","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ngau ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c7153d82","guard":[["hasAny",["lower case","lowercase","small letters","xpp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Poplar River ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c7192b03","guard":[["hasAny",["item number","nth","position","yrv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Revelstoke ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c77b1d30","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tkc"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tiko ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c887bd2a","guard":[["hasAny",["invert case","isk","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nashik ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-cbf7ea16","guard":[["hasAny",["item number","nth","position","vix"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eurico de Aguiar Salles ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-cc0728ab","guard":[["hasAny",["dcm","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Castres-Mazamet ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-cc595f3c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","ybi"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Tickle ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-cc98f3b6","guard":[["hasAny",["invert case","swap case","toggle case","ybi"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Tickle ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-cd56a3b6","guard":[["hasAny",["invert case","swap case","toggle case","vlg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Villa Gesell ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-cd770231","guard":[["hasAny",["cyw","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Captain Rogelio Castillo National ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-cea0f8d2","guard":[["hasAny",["item number","mxs","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maota ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-cf4e715e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sdu","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santos Dumont ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d05ada62","guard":[["hasAny",["item number","ngi","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ngau ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-d07ea6a8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","msz","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Namibe ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d0fdc1ac","guard":[["hasAny",["item number","nth","position","xpp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Poplar River ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-d1db8540","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","xpp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Poplar River ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d4e8706b","guard":[["hasAny",["alphabetize the letters","letters in order","mmo","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maio ",{"slot":1},"."]},["transform.sortLetters",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d4fed503","guard":[["hasAny",["gym","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is General José María Yáñez International ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-d567dc7c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ejh","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Al Wajh Domestic ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-d5c5878e","guard":[["hasAny",["awa","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Awassa ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d67ca0a6","guard":[["hasAny",["invert case","ndj","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is N'Djamena International ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-d71837c2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","okc","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Will Rogers World ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d744a0b2","guard":[["hasAny",["cxp","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tunggul Wulung ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d7d36ef0","guard":[["hasAny",["item number","nth","okc","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Will Rogers World ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-d7e04ffd","guard":[["hasAny",["jab","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jabiru ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d8448bd0","guard":[["hasAny",["invert case","swap case","toggle case","yqv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Yorkton Municipal ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-d93e0c8e","guard":[["hasAny",["hva","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Analalava ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-d9f8438d","guard":[["hasAny",["item number","nth","position","sin"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Singapore Changi ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-da18ff48","guard":[["hasAny",["invert case","swap case","toggle case","xpp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Poplar River ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-da3cda36","guard":[["hasAny",["item number","nth","position","sdu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santos Dumont ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-da847a78","guard":[["hasAny",["jsm","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jose De San Martin ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-daf3a1c2","guard":[["hasAny",["abv","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nnamdi Azikiwe International ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-db96c804","guard":[["hasAny",["capitalise","capitalize","capitalize each word","qrr","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Warren ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-dc7f604b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lel","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lake Evella ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-dcd647d2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hba","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hobart International ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-dddb03df","guard":[["hasAny",["capitalise","capitalize","capitalize each word","rcq","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reconquista ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-deb13f0c","guard":[["hasAny",["invert case","mwf","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maewo-Naone ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-df1c514d","guard":[["hasAny",["alphabetize the letters","letters in order","msz","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Namibe ",{"slot":1},"."]},["transform.sortLetters",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-df414d4f","guard":[["hasAny",["abi","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abilene Regional ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-e1b4a436","guard":[["hasAny",["hjr","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Khajuraho ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e34bded3","guard":[["hasAny",["lower case","lowercase","sik","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sikeston Memorial Municipal ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e3ce8713","guard":[["hasAny",["item number","mbo","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mamburao ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e66ffde2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hph","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cat Bi International ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-e7aa1145","guard":[["hasAny",["hph","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cat Bi International ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-e851ee2a","guard":[["hasAny",["lower case","lowercase","sin","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Singapore Changi ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e87657ca","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sin","title case"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Singapore Changi ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ec153962","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hjr","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Khajuraho ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-ec201514","guard":[["hasAny",["capitalise","capitalize","capitalize each word","spf","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Hills ",{"slot":1},"-Clyde Ice Field."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-ecc6e019","guard":[["hasAny",["gym","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is General José María Yáñez International ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-ee657442","guard":[["hasAny",["item number","nth","position","ybi"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Tickle ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-ef61925a","guard":[["hasAny",["hld","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Dongshan ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f08e9fba","guard":[["hasAny",["item number","nth","position","tku"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Turku ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f0e42096","guard":[["hasAny",["no vowels","remove vowels","vlg","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Villa Gesell ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f205f78e","guard":[["hasAny",["mxs","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maota ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f27bfb42","guard":[["hasAny",["ahn","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Athens Ben Epps ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f27c14f9","guard":[["hasAny",["invert case","stt","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cyril E. King ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-f2c26657","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sba","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santa Barbara Municipal ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-f57b2463","guard":[["hasAny",["hod","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hodeidah International ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f6068285","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jab","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jabiru ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-f6652e48","guard":[["hasAny",["item number","lel","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lake Evella ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-f8e114fc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cyw","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Captain Rogelio Castillo National ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-f9195dae","guard":[["hasAny",["invert case","sba","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santa Barbara Municipal ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-faa7e367","guard":[["hasAny",["lower case","lowercase","sdu","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santos Dumont ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-fb0f3c52","guard":[["hasAny",["invert case","pot","swap case","toggle case"]],["has","airport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ken Jones ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-fb59b565","guard":[["hasAny",["invert case","ngi","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ngau ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-fbe0b85c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","isk","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nashik ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-fc4c5e87","guard":[["hasAny",["invert case","spf","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Hills ",{"slot":1},"-Clyde Ice Field."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-00575c54","guard":[["hasAny",["item number","lel","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lake Evella ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-00ad5c3f","guard":[["hasAny",["first n","take","zlo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Playa De Oro International ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-00ce6c5e","guard":[["hasAny",["item number","nth","ozh","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zaporizhzhia International ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-016c6c95","guard":[["hasAny",["each word","ngi","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ngau ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-017395ce","guard":[["hasAny",["first n","mxs","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maota ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-01836e09","guard":[["hasAny",["cma","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cunnamulla ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-01a801ad","guard":[["hasAny",["each word","jab","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jabiru ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-027900e9","guard":[["hasAny",["first n","mmo","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maio ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-032841c2","guard":[["hasAny",["each word","msz","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Namibe ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-0361fda7","guard":[["hasAny",["first n","take","tkc"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tiko ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-03637924","guard":[["hasAny",["cxp","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tunggul Wulung ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-03ea8290","guard":[["hasAny",["item number","jsm","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jose De San Martin ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-03f58a1d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","isk","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nashik ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-041fd9de","guard":[["hasAny",["cyw","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Captain Rogelio Castillo National ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-0423c24c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gaf","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gafsa Ksar International ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-05f786d9","guard":[["hasAny",["abi","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abilene Regional ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-06058f8f","guard":[["hasAny",["first n","pir","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Pierre Regional ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-063c9d90","guard":[["hasAny",["each word","ozh","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zaporizhzhia International ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-06493ee7","guard":[["hasAny",["cyw","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Captain Rogelio Castillo National ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-065df899","guard":[["hasAny",["hph","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cat Bi International ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-06e51675","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","swf","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stewart International ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-071853b0","guard":[["hasAny",["dcm","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Castres-Mazamet ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-072fb8aa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ild","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lleida-Alguaire ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-07d10b04","guard":[["hasAny",["first n","lel","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lake Evella ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-08bd764a","guard":[["hasAny",["element","hod","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hodeidah International ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-08c475b5","guard":[["hasAny",["abv","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nnamdi Azikiwe International ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-08ca6e39","guard":[["hasAny",["atl","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hartsfield Jackson Atlanta International ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0a11088d","guard":[["hasAny",["dsd","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is La Désirade ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0a37a4d6","guard":[["hasAny",["item number","moq","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Morondava ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0a484d68","guard":[["hasAny",["element","item number","nth","position","sht"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Shepparton ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0a737418","guard":[["hasAny",["each word","okc","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Will Rogers World ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0cd7adb5","guard":[["hasAny",["each word","sba","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santa Barbara Municipal ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-0cf6f345","guard":[["hasAny",["abv","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nnamdi Azikiwe International ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-0d17931f","guard":[["hasAny",["each word","lel","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lake Evella ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-0de3e7a3","guard":[["hasAny",["each word","split into words","sza"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soyo ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-0df749e2","guard":[["hasAny",["item number","lower case","lowercase","moq","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Morondava ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0ecab8ad","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","stt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cyril E. King ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0ed31616","guard":[["hasAny",["each word","sik","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sikeston Memorial Municipal ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0f786630","guard":[["hasAny",["each word","oky","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oakey ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-0fd65359","guard":[["hasAny",["abv","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nnamdi Azikiwe International ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0fe99326","guard":[["hasAny",["each word","split into words","xpp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Poplar River ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-104bcae5","guard":[["hasAny",["each word","mxs","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maota ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-104d4725","guard":[["hasAny",["item number","nth","position","rbx","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rumbek ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-105b7891","guard":[["hasAny",["each word","ivl","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ivalo ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-1147cfb6","guard":[["hasAny",["each word","spf","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Hills ",{"slot":1},"-Clyde Ice Field."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-1230ba21","guard":[["hasAny",["item number","nth","position","vlg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Villa Gesell ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-128ab010","guard":[["hasAny",["each word","hba","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hobart International ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-12de3d71","guard":[["hasAny",["element","item number","mqx","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mekele ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-136e238f","guard":[["hasAny",["cfc","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Caçador ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-138a1fbc","guard":[["hasAny",["awa","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Awassa ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-13a5fbd8","guard":[["hasAny",["each word","split into words","zlo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Playa De Oro International ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-1452068b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","ouh","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oudtshoorn ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-14c21045","guard":[["hasAny",["each word","isk","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nashik ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-14d3066b","guard":[["hasAny",["each word","split into words","yqv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Yorkton Municipal ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-152efc8f","guard":[["hasAny",["each word","split into words","tkc"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tiko ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-160ad440","guard":[["hasAny",["each word","split into words","wmr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mananara Nord ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-166bffe8","guard":[["hasAny",["item number","jdh","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jodhpur ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-16cdca95","guard":[["hasAny",["gaf","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gafsa Ksar International ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1779bdbd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","ogg","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kahului ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1804d223","guard":[["hasAny",["item number","knr","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jam ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1843d40c","guard":[["hasAny",["hwn","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hwange National Park ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1878abad","guard":[["hasAny",["first n","jab","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jabiru ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-18c0e610","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","spf","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Hills ",{"slot":1},"-Clyde Ice Field."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-19176bb7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cri","item number","nth","position","title case"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Colonel Hill ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-191cdb9a","guard":[["hasAny",["each word","split into words","yrf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cartwright ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-1aa02aa6","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","swf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stewart International ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1ab108ec","guard":[["hasAny",["element","item number","mtj","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Montrose Regional ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1b801771","guard":[["hasAny",["cma","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cunnamulla ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1c04a0c9","guard":[["hasAny",["first n","ivl","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ivalo ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-1c7e7d03","guard":[["hasAny",["first n","take","ybi"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Tickle ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-1cac999e","guard":[["hasAny",["each word","mbo","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mamburao ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-1cd797a0","guard":[["hasAny",["item number","nth","oue","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ouesso ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1e587028","guard":[["hasAny",["cxp","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tunggul Wulung ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1fa96b91","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","swf","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stewart International ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1ff69b81","guard":[["hasAny",["buo","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Burao ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-207c28cd","guard":[["hasAny",["item number","nth","position","tof"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bogashevo ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-208febfd","guard":[["hasAny",["first n","ozh","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zaporizhzhia International ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-20f5f68c","guard":[["hasAny",["acx","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xingyi ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-212d7f0a","guard":[["hasAny",["dcm","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Castres-Mazamet ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2162e3a6","guard":[["hasAny",["each word","hva","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Analalava ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-21f104b6","guard":[["hasAny",["each word","mbo","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mamburao ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-22102780","guard":[["hasAny",["abi","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abilene Regional ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-221a20cc","guard":[["hasAny",["each word","ozh","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zaporizhzhia International ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-224c2023","guard":[["hasAny",["item number","nth","position","sba","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santa Barbara Municipal ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-229065bc","guard":[["hasAny",["ejh","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Al Wajh Domestic ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-22b2cde9","guard":[["hasAny",["each word","gym","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is General José María Yáñez International ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-22c14081","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","spf","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Hills ",{"slot":1},"-Clyde Ice Field."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-22f515a1","guard":[["hasAny",["first n","take","vlg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Villa Gesell ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-22f87f4a","guard":[["hasAny",["each word","split into words","tof"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bogashevo ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-235c1a81","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hwn","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hwange National Park ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-24964081","guard":[["hasAny",["buo","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Burao ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-25665681","guard":[["hasAny",["each word","msz","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Namibe ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2575a9fb","guard":[["hasAny",["first n","ozh","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zaporizhzhia International ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-257f7664","guard":[["hasAny",["abv","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nnamdi Azikiwe International ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-25b2e4ff","guard":[["hasAny",["each word","ejh","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Al Wajh Domestic ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-2671119e","guard":[["hasAny",["element","item number","knr","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jam ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-26c0483b","guard":[["hasAny",["item number","mxs","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maota ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-26ebaba9","guard":[["hasAny",["item number","mwf","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maewo-Naone ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-27fdcb13","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","wmr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mananara Nord ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2837ed76","guard":[["hasAny",["abi","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abilene Regional ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2939ca6d","guard":[["hasAny",["each word","jhm","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kapalua ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-297f9459","guard":[["hasAny",["item number","nth","position","zlo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Playa De Oro International ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-29f7580f","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","wmr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mananara Nord ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2a72f8b6","guard":[["hasAny",["each word","ngi","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ngau ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2b0c6f5f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","rbx","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rumbek ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2b95ea9a","guard":[["hasAny",["each word","hwn","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hwange National Park ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-2d902c3f","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","spf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Hills ",{"slot":1},"-Clyde Ice Field."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2da1d3a1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","oue","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ouesso ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2dba56f1","guard":[["hasAny",["each word","jab","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jabiru ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2e6e0ec1","guard":[["hasAny",["first n","pot","take"]],["has","airport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ken Jones ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-2e953380","guard":[["hasAny",["each word","ndj","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is N'Djamena International ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-2f52dccd","guard":[["hasAny",["each word","lel","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lake Evella ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-302da3f0","guard":[["hasAny",["each word","jsm","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jose De San Martin ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-30935797","guard":[["hasAny",["first n","gym","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is General José María Yáñez International ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-30ba7fdc","guard":[["hasAny",["each word","pot","split into words"]],["has","airport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ken Jones ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-30c29a80","guard":[["hasAny",["acx","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xingyi ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-314effd2","guard":[["hasAny",["item number","mwf","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maewo-Naone ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-348eb069","guard":[["hasAny",["each word","sdu","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santos Dumont ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-34ca0807","guard":[["hasAny",["each word","okc","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Will Rogers World ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-35159225","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","stt","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cyril E. King ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-352aff23","guard":[["hasAny",["element","item number","nth","position","sia"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xi'an Xiguan ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-37229fbd","guard":[["hasAny",["element","item number","nth","position","qig"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Iguatu ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-37520313","guard":[["hasAny",["gaf","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gafsa Ksar International ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-37cd46b6","guard":[["hasAny",["each word","oky","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oakey ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-37e8fad6","guard":[["hasAny",["item number","nth","position","tkc"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tiko ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-37f85aff","guard":[["hasAny",["hod","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hodeidah International ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3840197e","guard":[["hasAny",["each word","glh","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mid Delta Regional ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-38631eb6","guard":[["hasAny",["each word","ngi","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ngau ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3880ba04","guard":[["hasAny",["element","item number","nth","position","tku"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Turku ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3984f294","guard":[["hasAny",["item number","lower case","lowercase","lrd","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Laredo International ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-39bfc390","guard":[["hasAny",["first n","hba","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hobart International ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-3a2f9a48","guard":[["hasAny",["each word","pir","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Pierre Regional ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3a3bbd74","guard":[["hasAny",["abv","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nnamdi Azikiwe International ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3a3c5ceb","guard":[["hasAny",["first n","pir","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Pierre Regional ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-3c69389f","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","stt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cyril E. King ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3d17694f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","qig","title case"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Iguatu ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3e22efba","guard":[["hasAny",["each word","split into words","zlo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Playa De Oro International ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-3ecdee0e","guard":[["hasAny",["each word","split into words","vlg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Villa Gesell ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-3f114be1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hph","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cat Bi International ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3f3c220d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","twt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sanga Sanga ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3fb1e3f9","guard":[["hasAny",["each word","jdh","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jodhpur ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-400917ab","guard":[["hasAny",["chm","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Teniente FAP Jaime A De Montreuil Morales ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-403461c2","guard":[["hasAny",["item number","lower case","lowercase","nth","ogg","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kahului ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-40ffff38","guard":[["hasAny",["abi","alphabetize the letters","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abilene Regional ",{"slot":1},"."]},["transform.sortLetters",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4121a696","guard":[["hasAny",["each word","jsm","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jose De San Martin ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-41985f44","guard":[["hasAny",["item number","lower case","lowercase","nth","ouh","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oudtshoorn ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-41b69c18","guard":[["hasAny",["btm","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bert Mooney ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-41d935bd","guard":[["hasAny",["dsd","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is La Désirade ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-43029fbe","guard":[["hasAny",["first n","sza","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soyo ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-44177218","guard":[["hasAny",["item number","no vowels","nth","position","rcq","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reconquista ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-44b8754b","guard":[["hasAny",["hld","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Dongshan ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-44d61a1f","guard":[["hasAny",["first n","lel","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lake Evella ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-456801f1","guard":[["hasAny",["hod","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hodeidah International ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-459093a9","guard":[["hasAny",["each word","oky","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oakey ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-45e4bdf6","guard":[["hasAny",["each word","ivl","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ivalo ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-46719902","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yqv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Yorkton Municipal ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4680f8f7","guard":[["hasAny",["each word","split into words","xpp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Poplar River ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-46e4a6c9","guard":[["hasAny",["each word","sin","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Singapore Changi ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-46ff4dec","guard":[["hasAny",["auh","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abu Dhabi International ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-479f4996","guard":[["hasAny",["item number","ngi","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ngau ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-47be4b09","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","txl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berlin-Tegel ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-483ef2a0","guard":[["hasAny",["first n","glh","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mid Delta Regional ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-485c8143","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","spf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Hills ",{"slot":1},"-Clyde Ice Field."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4a47a452","guard":[["hasAny",["cri","item number","lower case","lowercase","nth","position","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Colonel Hill ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4a5e0bdd","guard":[["hasAny",["each word","ndj","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is N'Djamena International ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-4a74d323","guard":[["hasAny",["each word","jdo","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Orlando Bezerra de Menezes ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-4c46119b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cfc","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Caçador ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4c50b619","guard":[["hasAny",["each word","glh","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mid Delta Regional ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4ce8f596","guard":[["hasAny",["first n","msz","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Namibe ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-4d3f80bb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","sht","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Shepparton ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4dfc7a15","guard":[["hasAny",["cfc","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Caçador ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4eae999e","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","sht","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Shepparton ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4f5a4739","guard":[["hasAny",["first n","jsm","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jose De San Martin ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-4f5ccce6","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","without vowels","yrv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Revelstoke ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4fbb5a79","guard":[["hasAny",["first n","mmo","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maio ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-4fca9ae4","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","txl","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berlin-Tegel ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-508a7826","guard":[["hasAny",["each word","sik","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sikeston Memorial Municipal ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-51e63d51","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","without vowels","wmr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mananara Nord ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5220913f","guard":[["hasAny",["element","item number","nth","pid","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nassau Paradise Island ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-528c7185","guard":[["hasAny",["first n","take","xpp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Poplar River ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-52edcb24","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","txl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berlin-Tegel ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-540475b2","guard":[["hasAny",["item number","knr","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jam ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5439fa12","guard":[["hasAny",["item number","nth","position","qrr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Warren ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-54464d99","guard":[["hasAny",["element","gaf","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gafsa Ksar International ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-545d2dbc","guard":[["hasAny",["each word","jhm","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kapalua ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-54757f79","guard":[["hasAny",["each word","ozh","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zaporizhzhia International ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-54992634","guard":[["hasAny",["item number","mtj","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Montrose Regional ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5602199a","guard":[["hasAny",["each word","split into words","tkc"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tiko ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-5619c3c3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","pid","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nassau Paradise Island ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-57d33c69","guard":[["hasAny",["item number","nth","okc","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Will Rogers World ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-587a7879","guard":[["hasAny",["each word","split into words","tof"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bogashevo ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-589ad086","guard":[["hasAny",["each word","sin","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Singapore Changi ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-59064a70","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","ndj","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is N'Djamena International ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5937a906","guard":[["hasAny",["first n","jsm","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jose De San Martin ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-5967e937","guard":[["hasAny",["atl","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hartsfield Jackson Atlanta International ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-5979e7a5","guard":[["hasAny",["btm","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bert Mooney ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5a858a15","guard":[["hasAny",["auh","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abu Dhabi International ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5aebce44","guard":[["hasAny",["item number","nth","ogg","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kahului ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5b10fee6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","jdo","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Orlando Bezerra de Menezes ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5bbd0cec","guard":[["hasAny",["first n","sza","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soyo ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-5bbdadde","guard":[["hasAny",["each word","split into words","txl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berlin-Tegel ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-5bc8df6b","guard":[["hasAny",["ild","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lleida-Alguaire ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5be57b1b","guard":[["hasAny",["each word","split into words","tkc"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tiko ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-5bfb2cbd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","tku"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Turku ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5c2cd2b7","guard":[["hasAny",["element","item number","nth","ouh","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oudtshoorn ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5c61358d","guard":[["hasAny",["each word","gym","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is General José María Yáñez International ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-5c82389f","guard":[["hasAny",["each word","sdu","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santos Dumont ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-5c9fe524","guard":[["hasAny",["each word","jab","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jabiru ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-5ce5ad69","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dcm","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Castres-Mazamet ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5e2a1746","guard":[["hasAny",["item number","no vowels","nth","position","rbx","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rumbek ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5e495e6b","guard":[["hasAny",["dsd","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is La Désirade ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5e7856f0","guard":[["hasAny",["each word","sov","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seldovia ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-5eb06722","guard":[["hasAny",["first n","oky","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oakey ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-5f534779","guard":[["hasAny",["each word","hjr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Khajuraho ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-5f727b1a","guard":[["hasAny",["each word","mxs","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maota ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-60309ef0","guard":[["hasAny",["buo","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Burao ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-604a714a","guard":[["hasAny",["byn","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bayankhongor ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-608af270","guard":[["hasAny",["item number","nth","oky","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oakey ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-608da607","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","rcq","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reconquista ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-609d4e41","guard":[["hasAny",["element","ild","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lleida-Alguaire ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-61d16a8a","guard":[["hasAny",["element","item number","nth","position","vix"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eurico de Aguiar Salles ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-632ff6e9","guard":[["hasAny",["acx","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xingyi ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-6331d4c8","guard":[["hasAny",["hwn","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hwange National Park ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-64b28252","guard":[["hasAny",["ahn","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Athens Ben Epps ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-64c5ee5f","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","tku"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Turku ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-64c9518c","guard":[["hasAny",["cxp","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tunggul Wulung ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-64d1f237","guard":[["hasAny",["each word","split into words","sza"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soyo ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-65dd945c","guard":[["hasAny",["cyw","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Captain Rogelio Castillo National ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-66e742e3","guard":[["hasAny",["hjr","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Khajuraho ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-681634d1","guard":[["hasAny",["each word","moq","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Morondava ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-68b242b2","guard":[["hasAny",["first n","take","zlo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Playa De Oro International ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-68da539c","guard":[["hasAny",["byn","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bayankhongor ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-69779e97","guard":[["hasAny",["buo","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Burao ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-699b8a9e","guard":[["hasAny",["each word","qrr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Warren ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-69a8a4b9","guard":[["hasAny",["ahn","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Athens Ben Epps ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6a50b807","guard":[["hasAny",["each word","sin","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Singapore Changi ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-6a90d69d","guard":[["hasAny",["first n","pot","take"]],["has","airport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ken Jones ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-6ad52c2f","guard":[["hasAny",["item number","lrd","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Laredo International ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6b02aaa0","guard":[["hasAny",["hwn","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hwange National Park ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6b263683","guard":[["hasAny",["each word","sik","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sikeston Memorial Municipal ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-6b426e94","guard":[["hasAny",["abv","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nnamdi Azikiwe International ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-6b4bc0b7","guard":[["hasAny",["first n","ivl","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ivalo ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-6b8b642e","guard":[["hasAny",["each word","mwf","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maewo-Naone ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-6c06cdd6","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","without vowels","xcr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Châlons-Vatry ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6d5c5f6f","guard":[["hasAny",["item number","lower case","lowercase","mtj","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Montrose Regional ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6de09070","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","vix"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eurico de Aguiar Salles ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6e382825","guard":[["hasAny",["hph","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cat Bi International ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6e3a46f8","guard":[["hasAny",["each word","split into words","zlo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Playa De Oro International ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-6e5c6a05","guard":[["hasAny",["each word","rcq","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reconquista ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-6ef2a881","guard":[["hasAny",["first n","ngi","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ngau ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-6f468cf1","guard":[["hasAny",["ejh","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Al Wajh Domestic ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7096f8ad","guard":[["hasAny",["item number","jdh","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jodhpur ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-70d23384","guard":[["hasAny",["item number","lower case","lowercase","mqx","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mekele ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-717c7f17","guard":[["hasAny",["item number","nth","position","pot"]],["has","airport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ken Jones ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-719e2826","guard":[["hasAny",["acx","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xingyi ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7213ed23","guard":[["hasAny",["each word","okc","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Will Rogers World ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-721b1514","guard":[["hasAny",["each word","qrr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Warren ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-72418da4","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","yxt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Northwest Regional ",{"slot":1}," Terrace-Kitimat."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-72c94567","guard":[["hasAny",["dcm","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Castres-Mazamet ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-72dd3b5e","guard":[["hasAny",["item number","ivl","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ivalo ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-72ece28b","guard":[["hasAny",["each word","lel","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lake Evella ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7351211f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","knr","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jam ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-741799aa","guard":[["hasAny",["hjr","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Khajuraho ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-74ec50f5","guard":[["hasAny",["each word","moq","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Morondava ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-7570da4c","guard":[["hasAny",["item number","jdh","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jodhpur ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-75f6d93d","guard":[["hasAny",["item number","lower case","lowercase","nth","oue","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ouesso ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-767c10c7","guard":[["hasAny",["ahn","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Athens Ben Epps ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-77039502","guard":[["hasAny",["each word","pir","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Pierre Regional ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-77a15920","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","twt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sanga Sanga ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-78e26982","guard":[["hasAny",["first n","qrr","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Warren ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-79c2a083","guard":[["hasAny",["isk","item number","nth","position","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nashik ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7a72ce5f","guard":[["hasAny",["each word","oue","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ouesso ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-7ab6cef1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hjr","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Khajuraho ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7aed1f16","guard":[["hasAny",["buo","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Burao ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-7c8e0456","guard":[["hasAny",["each word","jdo","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Orlando Bezerra de Menezes ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-7ce87f46","guard":[["hasAny",["each word","split into words","zlo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Playa De Oro International ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7cf9afe4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hva","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Analalava ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7d29458c","guard":[["hasAny",["each word","mmo","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maio ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7dafc444","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","tku"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Turku ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7dbf59b1","guard":[["hasAny",["item number","lower case","lowercase","mbo","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mamburao ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7dd2b024","guard":[["hasAny",["each word","mmo","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maio ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7f1ca862","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mwf","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maewo-Naone ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-80b85e0c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","chm","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Teniente FAP Jaime A De Montreuil Morales ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-80ff9c28","guard":[["hasAny",["element","item number","nth","ogg","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kahului ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8295964b","guard":[["hasAny",["each word","msz","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Namibe ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-82be2dda","guard":[["hasAny",["chm","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Teniente FAP Jaime A De Montreuil Morales ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-82f2d04f","guard":[["hasAny",["hld","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Dongshan ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-82f4cba4","guard":[["hasAny",["cfc","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Caçador ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-82f8bb72","guard":[["hasAny",["item number","nth","position","xpp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Poplar River ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-831566c7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","sba","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santa Barbara Municipal ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8393952b","guard":[["hasAny",["each word","split into words","vlg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Villa Gesell ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-83e82cb6","guard":[["hasAny",["element","item number","nth","position","xcr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Châlons-Vatry ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-843a9dad","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mbo","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mamburao ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-847cb1ec","guard":[["hasAny",["chm","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Teniente FAP Jaime A De Montreuil Morales ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-847fb2b8","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","yrf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cartwright ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-85640234","guard":[["hasAny",["cyw","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Captain Rogelio Castillo National ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-85cfe04e","guard":[["hasAny",["abi","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abilene Regional ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-85e19c93","guard":[["hasAny",["each word","mxs","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maota ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-85e86a5a","guard":[["hasAny",["chm","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Teniente FAP Jaime A De Montreuil Morales ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8636a8cf","guard":[["hasAny",["first n","jhm","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kapalua ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-888d1684","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","yqv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Yorkton Municipal ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8a0ff4bc","guard":[["hasAny",["each word","split into words","xpp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Poplar River ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8aa4a3d6","guard":[["hasAny",["ahn","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Athens Ben Epps ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8ace8a21","guard":[["hasAny",["btm","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bert Mooney ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8b2192e9","guard":[["hasAny",["item number","lrd","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Laredo International ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8d0e68ab","guard":[["hasAny",["item number","mbo","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mamburao ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8d0f7489","guard":[["hasAny",["first n","ngi","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ngau ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-8e23399d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","yxt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Northwest Regional ",{"slot":1}," Terrace-Kitimat."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8eee43b9","guard":[["hasAny",["byn","item number","no vowels","nth","position","remove vowels","without vowels"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bayankhongor ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-905c181d","guard":[["hasAny",["each word","sdu","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santos Dumont ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9094d20b","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","sia"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xi'an Xiguan ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9174d53a","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","xcr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Châlons-Vatry ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9250e748","guard":[["hasAny",["each word","split into words","vlg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Villa Gesell ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-92d39bb6","guard":[["hasAny",["first n","sdu","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santos Dumont ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-93bc1986","guard":[["hasAny",["item number","lower case","lowercase","nth","position","qig","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Iguatu ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-93d5d080","guard":[["hasAny",["each word","split into words","yqv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Yorkton Municipal ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-94c2a364","guard":[["hasAny",["btm","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bert Mooney ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9501bda0","guard":[["hasAny",["each word","isk","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nashik ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-95337ab8","guard":[["hasAny",["item number","lower case","lowercase","ndj","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is N'Djamena International ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9564ef43","guard":[["hasAny",["first n","take","tof"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bogashevo ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-9593a812","guard":[["hasAny",["each word","split into words","ybi"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Tickle ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-9623ac58","guard":[["hasAny",["item number","nth","position","ybi"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Tickle ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-96dded7c","guard":[["hasAny",["atl","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hartsfield Jackson Atlanta International ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-985614fa","guard":[["hasAny",["each word","ngi","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ngau ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-9895eaaa","guard":[["hasAny",["each word","split into words","sza"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soyo ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-995fbaaf","guard":[["hasAny",["cxp","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tunggul Wulung ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9a2ef4e0","guard":[["hasAny",["element","item number","nth","position","swf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stewart International ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9af8e0d1","guard":[["hasAny",["each word","gym","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is General José María Yáñez International ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-9c8b4e8e","guard":[["hasAny",["item number","mqx","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mekele ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9e3b3078","guard":[["hasAny",["first n","sin","take"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Singapore Changi ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-9ff3c16f","guard":[["hasAny",["isk","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nashik ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a12c9d34","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yrf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cartwright ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a1725051","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","sht"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Shepparton ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a20363cc","guard":[["hasAny",["item number","mtj","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Montrose Regional ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a2d2d0bb","guard":[["hasAny",["each word","oky","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oakey ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a3480fab","guard":[["hasAny",["hph","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cat Bi International ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a3f8cb4a","guard":[["hasAny",["first n","msz","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Namibe ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-a4d55e81","guard":[["hasAny",["first n","mxs","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maota ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-a5050e60","guard":[["hasAny",["hva","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Analalava ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a6688773","guard":[["hasAny",["hva","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Analalava ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a66d2486","guard":[["hasAny",["item number","lower case","lowercase","mwf","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maewo-Naone ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a67da454","guard":[["hasAny",["first n","okc","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Will Rogers World ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-a688f0ac","guard":[["hasAny",["auh","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abu Dhabi International ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a6959fdb","guard":[["hasAny",["each word","spf","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Hills ",{"slot":1},"-Clyde Ice Field."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-a751d2c0","guard":[["hasAny",["first n","hba","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hobart International ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-a7cbbde4","guard":[["hasAny",["item number","nth","position","sin"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Singapore Changi ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a7d99e5f","guard":[["hasAny",["each word","split into words","yrv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Revelstoke ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-a7dc891b","guard":[["hasAny",["each word","split into words","wmr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mananara Nord ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-a85b843a","guard":[["hasAny",["item number","nth","pir","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Pierre Regional ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a8c4d117","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","yrf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cartwright ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a92c960a","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","txl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berlin-Tegel ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a9680cd6","guard":[["hasAny",["each word","split into words","ybi"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Tickle ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a96a30bf","guard":[["hasAny",["each word","split into words","xpp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Poplar River ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-ab19bdff","guard":[["hasAny",["item number","mmo","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maio ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ab540798","guard":[["hasAny",["awa","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Awassa ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ab576c0f","guard":[["hasAny",["each word","hph","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cat Bi International ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-ab922d26","guard":[["hasAny",["first n","sin","take"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Singapore Changi ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-abab7480","guard":[["hasAny",["each word","qrr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Warren ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-abc6eab7","guard":[["hasAny",["first n","sdu","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santos Dumont ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-abd83db7","guard":[["hasAny",["each word","split into words","vlg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Villa Gesell ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ac0b1f63","guard":[["hasAny",["cri","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Colonel Hill ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ac12e58b","guard":[["hasAny",["each word","jdh","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jodhpur ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-acb13eb0","guard":[["hasAny",["btm","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bert Mooney ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-acc2bb73","guard":[["hasAny",["each word","jhm","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kapalua ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ada8c7e9","guard":[["hasAny",["abi","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abilene Regional ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-ae130997","guard":[["hasAny",["byn","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bayankhongor ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ae6e63e9","guard":[["hasAny",["cma","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cunnamulla ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ae86aab7","guard":[["hasAny",["atl","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hartsfield Jackson Atlanta International ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ae8f89e1","guard":[["hasAny",["item number","knr","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jam ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-af9f8424","guard":[["hasAny",["first n","glh","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mid Delta Regional ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-b05cd923","guard":[["hasAny",["acx","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xingyi ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b0e0ffcb","guard":[["hasAny",["element","item number","lrd","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Laredo International ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b0eaec96","guard":[["hasAny",["item number","lower case","lowercase","nth","position","rbx","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rumbek ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b1a9d4bc","guard":[["hasAny",["first n","take","tof"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bogashevo ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-b1c58cbb","guard":[["hasAny",["cyw","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Captain Rogelio Castillo National ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b2394c37","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","xcr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Châlons-Vatry ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b33f17d4","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","twt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sanga Sanga ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b3e1108a","guard":[["hasAny",["each word","hba","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hobart International ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b3f9dccd","guard":[["hasAny",["each word","lel","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lake Evella ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-b5141e48","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","vix"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eurico de Aguiar Salles ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b56f46e7","guard":[["hasAny",["each word","sin","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Singapore Changi ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-b6022f46","guard":[["hasAny",["hjr","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Khajuraho ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b668a927","guard":[["hasAny",["ild","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lleida-Alguaire ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b835b729","guard":[["hasAny",["hld","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Dongshan ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b85cf904","guard":[["hasAny",["each word","mmo","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maio ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-b86a4fa2","guard":[["hasAny",["each word","split into words","yrf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cartwright ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-b8a12322","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","sia","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xi'an Xiguan ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ba49e526","guard":[["hasAny",["cyw","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Captain Rogelio Castillo National ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-bb5b2163","guard":[["hasAny",["element","item number","nth","position","rbx"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rumbek ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-bb684411","guard":[["hasAny",["each word","hph","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cat Bi International ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-bb8978af","guard":[["hasAny",["item number","jab","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jabiru ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-bbb6ec2f","guard":[["hasAny",["cyw","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Captain Rogelio Castillo National ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-bd4cacf1","guard":[["hasAny",["first n","sik","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sikeston Memorial Municipal ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-be4cd28e","guard":[["hasAny",["awa","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Awassa ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-be88311e","guard":[["hasAny",["each word","glh","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mid Delta Regional ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-befffbcd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cxp","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tunggul Wulung ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c030b0fd","guard":[["hasAny",["each word","split into words","yxt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Northwest Regional ",{"slot":1}," Terrace-Kitimat."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-c075d58e","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yxt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Northwest Regional ",{"slot":1}," Terrace-Kitimat."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c1d78e99","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","sov"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seldovia ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c3103435","guard":[["hasAny",["each word","split into words","ybi"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Tickle ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-c477dbac","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","yrv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Revelstoke ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c55fab53","guard":[["hasAny",["each word","jhm","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kapalua ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c6d1fe03","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","twt","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sanga Sanga ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c7058e1d","guard":[["hasAny",["first n","okc","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Will Rogers World ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-c79700d3","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","vix"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eurico de Aguiar Salles ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c7b68194","guard":[["hasAny",["each word","jsm","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jose De San Martin ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c7bdc9a4","guard":[["hasAny",["each word","sov","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seldovia ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-c7c47d8a","guard":[["hasAny",["each word","pir","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Pierre Regional ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-c9891b68","guard":[["hasAny",["byn","item number","lower case","lowercase","nth","position","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bayankhongor ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c9f92c0d","guard":[["hasAny",["item number","lower case","lowercase","nth","position","sia","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xi'an Xiguan ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-cb27a2a8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cma","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cunnamulla ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-cc63db21","guard":[["hasAny",["each word","rcq","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reconquista ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-ccb0b200","guard":[["hasAny",["each word","split into words","yxt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Northwest Regional ",{"slot":1}," Terrace-Kitimat."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-ccfc5bf0","guard":[["hasAny",["each word","hva","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Analalava ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-cd5796ea","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","without vowels","yqv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Yorkton Municipal ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-cd74f119","guard":[["hasAny",["cri","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Colonel Hill ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ce3564ee","guard":[["hasAny",["item number","ndj","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is N'Djamena International ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ce5caa90","guard":[["hasAny",["first n","take","xpp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Poplar River ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-ce910b47","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","moq","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Morondava ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-cf05f468","guard":[["hasAny",["each word","msz","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Namibe ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-cfd7751b","guard":[["hasAny",["each word","sdu","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santos Dumont ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-cfdb0fee","guard":[["hasAny",["item number","lower case","lowercase","nth","position","sba","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santa Barbara Municipal ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-cfeb86b1","guard":[["hasAny",["first n","take","ybi"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Tickle ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-d155f6a3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","lrd","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Laredo International ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d272f3ac","guard":[["hasAny",["first n","sik","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sikeston Memorial Municipal ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-d27efa35","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","without vowels","yrf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cartwright ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d2d1fd4c","guard":[["hasAny",["item number","mqx","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mekele ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d2e0f8ad","guard":[["hasAny",["each word","split into words","tof"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bogashevo ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-d305604c","guard":[["hasAny",["each word","jsm","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jose De San Martin ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d331370f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hod","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hodeidah International ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d3be1081","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","stt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cyril E. King ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d3f98ad9","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","wmr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mananara Nord ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d4094d32","guard":[["hasAny",["item number","lower case","lowercase","nth","position","rcq","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reconquista ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d45e1b9f","guard":[["hasAny",["each word","hwn","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hwange National Park ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-d4777f2b","guard":[["hasAny",["item number","jdo","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Orlando Bezerra de Menezes ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d5594ff4","guard":[["hasAny",["glh","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mid Delta Regional ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d72d8eef","guard":[["hasAny",["item number","msz","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Namibe ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d78ebabb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ejh","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Al Wajh Domestic ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d79a079c","guard":[["hasAny",["item number","nth","ouh","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oudtshoorn ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d818895f","guard":[["hasAny",["item number","nth","position","qig","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Iguatu ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d848266c","guard":[["hasAny",["item number","jdo","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Orlando Bezerra de Menezes ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d86e0362","guard":[["hasAny",["each word","split into words","tkc"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tiko ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-d91f0ec7","guard":[["hasAny",["hba","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hobart International ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-da14f1ba","guard":[["hasAny",["item number","nth","pid","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nassau Paradise Island ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-da37f0f0","guard":[["hasAny",["each word","hba","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hobart International ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-db4c8c92","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","swf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stewart International ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-db6094b6","guard":[["hasAny",["alphabetize the letters","item number","letters in order","moq","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Morondava ",{"slot":1},"."]},["transform.sortLetters",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-dba8f902","guard":[["hasAny",["each word","oue","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ouesso ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-dbe1cdef","guard":[["hasAny",["each word","ejh","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Al Wajh Domestic ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-dcbcb9bf","guard":[["hasAny",["atl","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hartsfield Jackson Atlanta International ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-dd1739bf","guard":[["hasAny",["item number","nth","position","sdu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santos Dumont ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-dd1a6d6d","guard":[["hasAny",["each word","mmo","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maio ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-ddcc1250","guard":[["hasAny",["item number","nth","position","sza"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soyo ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ddfb26ac","guard":[["hasAny",["dsd","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is La Désirade ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-de2464ba","guard":[["hasAny",["each word","qrr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Warren ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-df6083a2","guard":[["hasAny",["each word","split into words","yrv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Revelstoke ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-dfbe3fe5","guard":[["hasAny",["each word","split into words","tof"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bogashevo ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-dfeff5b0","guard":[["hasAny",["each word","mwf","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maewo-Naone ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-e110a4de","guard":[["hasAny",["item number","nth","position","sik"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sikeston Memorial Municipal ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e14112d4","guard":[["hasAny",["element","item number","nth","position","twt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sanga Sanga ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e153923d","guard":[["hasAny",["first n","oky","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oakey ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-e191a276","guard":[["hasAny",["auh","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abu Dhabi International ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e262e61b","guard":[["hasAny",["each word","sba","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santa Barbara Municipal ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-e3eadd6b","guard":[["hasAny",["gym","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is General José María Yáñez International ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e3ef1b2d","guard":[["hasAny",["each word","jab","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jabiru ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e56ebbb2","guard":[["hasAny",["each word","split into words","stt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cyril E. King ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-e6b3c2a5","guard":[["hasAny",["awa","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Awassa ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e726d1dd","guard":[["hasAny",["first n","take","tkc"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tiko ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-e838cdcd","guard":[["hasAny",["first n","gym","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is General José María Yáñez International ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-e8411a86","guard":[["hasAny",["dsd","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is La Désirade ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e8a0f6b6","guard":[["hasAny",["each word","split into words","txl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berlin-Tegel ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-eb1a8e2d","guard":[["hasAny",["each word","pot","split into words"]],["has","airport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ken Jones ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-eb1b4d21","guard":[["hasAny",["each word","ozh","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zaporizhzhia International ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-eb4d0ab0","guard":[["hasAny",["each word","gym","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is General José María Yáñez International ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ebf5c068","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mqx","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mekele ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ed462bd2","guard":[["hasAny",["each word","split into words","sza"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soyo ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-ef0e13f2","guard":[["hasAny",["each word","mxs","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maota ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-efb3cfb4","guard":[["hasAny",["chm","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Teniente FAP Jaime A De Montreuil Morales ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-efdb6ae5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hld","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Dongshan ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f0d38ecb","guard":[["hasAny",["first n","qrr","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Warren ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-f0e2ef94","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","yrv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Revelstoke ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f0fee011","guard":[["hasAny",["each word","pot","split into words"]],["has","airport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ken Jones ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-f1029108","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","xcr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Châlons-Vatry ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f1952752","guard":[["hasAny",["each word","sik","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sikeston Memorial Municipal ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f198b617","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","jdh","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jodhpur ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f20be622","guard":[["hasAny",["item number","nth","position","rcq","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reconquista ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f2f6b088","guard":[["hasAny",["first n","jab","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jabiru ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-f3432bcf","guard":[["hasAny",["first n","take","vlg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Villa Gesell ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-f38d3976","guard":[["hasAny",["each word","pir","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Pierre Regional ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-f46e04e4","guard":[["hasAny",["item number","lower case","lowercase","nth","position","sht","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Shepparton ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f55a06d4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dsd","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is La Désirade ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f5d9f784","guard":[["hasAny",["each word","split into words","stt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cyril E. King ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-f6002a90","guard":[["hasAny",["acx","alphabetize the letters","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xingyi ",{"slot":1},"."]},["transform.sortLetters",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f6fa110b","guard":[["hasAny",["each word","pot","split into words"]],["has","airport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ken Jones ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f72b7548","guard":[["hasAny",["each word","hba","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hobart International ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-f78730b3","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yrv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Revelstoke ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f89ab91c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mtj","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Montrose Regional ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f9040eae","guard":[["hasAny",["cfc","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Caçador ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f90d28db","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","without vowels","yxt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Northwest Regional ",{"slot":1}," Terrace-Kitimat."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fa33c34e","guard":[["hasAny",["each word","okc","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Will Rogers World ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-fa55251b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","sov","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seldovia ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fabd0ba4","guard":[["hasAny",["each word","ivl","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ivalo ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-fae3f006","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","yqv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Yorkton Municipal ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-faf28773","guard":[["hasAny",["dcm","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Castres-Mazamet ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fc17d68a","guard":[["hasAny",["item number","lower case","lowercase","nth","pid","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nassau Paradise Island ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fcb4bde7","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","sov"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seldovia ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fd127afe","guard":[["hasAny",["item number","ndj","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is N'Djamena International ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fd53a59e","guard":[["hasAny",["each word","glh","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mid Delta Regional ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-fd5cf469","guard":[["hasAny",["item number","jhm","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kapalua ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-fe855f1d","guard":[["hasAny",["each word","split into words","ybi"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Tickle ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-fef23e6c","guard":[["hasAny",["each word","ivl","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ivalo ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-ff348bc4","guard":[["hasAny",["element","hld","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Dongshan ",{"slot":1},"."]},["sense.after",{"lit":"airport"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ffaea674","guard":[["hasAny",["abv","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nnamdi Azikiwe International ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ffb5b230","guard":[["hasAny",["first n","jhm","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kapalua ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-fff77d7a","guard":[["hasAny",["each word","hjr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Khajuraho ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-016d780a","guard":[["hasAny",["each word","item number","nth","position","split into words","yrv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Revelstoke ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-01bdfd63","guard":[["hasAny",["dsd","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is La Désirade ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-01f7df67","guard":[["hasAny",["auh","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abu Dhabi International ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-02de9bfa","guard":[["hasAny",["item number","nth","position","rcq"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reconquista ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-02ed0df4","guard":[["hasAny",["cma","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cunnamulla ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0400695b","guard":[["hasAny",["chm","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Teniente FAP Jaime A De Montreuil Morales ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0424faf8","guard":[["hasAny",["dsd","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is La Désirade ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-04f5ac41","guard":[["hasAny",["each word","item number","nth","position","split into words","vix"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eurico de Aguiar Salles ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-056375ce","guard":[["hasAny",["dcm","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Castres-Mazamet ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0748f390","guard":[["hasAny",["each word","item number","nth","position","split into words","twt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sanga Sanga ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-075b6c4a","guard":[["hasAny",["item number","nth","position","stt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cyril E. King ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-07c6457e","guard":[["hasAny",["each word","item number","nth","position","split into words","yrv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Revelstoke ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-07cce2c1","guard":[["hasAny",["each word","hwn","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hwange National Park ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0955e412","guard":[["hasAny",["each word","item number","mbo","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mamburao ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0a0cceca","guard":[["hasAny",["each word","item number","nth","ouh","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oudtshoorn ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0a2df507","guard":[["hasAny",["buo","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Burao ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0a80d598","guard":[["hasAny",["item number","moq","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Morondava ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0b98880e","guard":[["hasAny",["ahn","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Athens Ben Epps ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0d495392","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","sht","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Shepparton ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0df2cfa6","guard":[["hasAny",["each word","item number","nth","pid","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nassau Paradise Island ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0f961cef","guard":[["hasAny",["each word","item number","nth","position","split into words","tku"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Turku ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-10ad9e66","guard":[["hasAny",["item number","jdo","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Orlando Bezerra de Menezes ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1100b16d","guard":[["hasAny",["element","item number","knr","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jam ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-119cb4a0","guard":[["hasAny",["each word","item number","nth","position","sba","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santa Barbara Municipal ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-119f5919","guard":[["hasAny",["cfc","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Caçador ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-11ca16dc","guard":[["hasAny",["item number","nth","position","sba"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santa Barbara Municipal ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1200e4a9","guard":[["hasAny",["each word","item number","nth","oue","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ouesso ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1273f0b7","guard":[["hasAny",["each word","hjr","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Khajuraho ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-13c0c129","guard":[["hasAny",["element","hld","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Dongshan ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-159467af","guard":[["hasAny",["item number","jdh","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jodhpur ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1785e2ce","guard":[["hasAny",["item number","moq","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Morondava ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-18ea5445","guard":[["hasAny",["item number","nth","pid","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nassau Paradise Island ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1abe879a","guard":[["hasAny",["awa","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Awassa ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1d19e610","guard":[["hasAny",["abi","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abilene Regional ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1e266564","guard":[["hasAny",["each word","gaf","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gafsa Ksar International ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1fd531f1","guard":[["hasAny",["item number","jdo","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Orlando Bezerra de Menezes ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-21b12386","guard":[["hasAny",["item number","nth","position","txl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berlin-Tegel ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-21c11f1e","guard":[["hasAny",["each word","item number","mqx","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mekele ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-23c3146e","guard":[["hasAny",["each word","hld","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Dongshan ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2a0b04b4","guard":[["hasAny",["each word","item number","jdh","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jodhpur ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2a3a3a68","guard":[["hasAny",["atl","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hartsfield Jackson Atlanta International ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2a3d7658","guard":[["hasAny",["each word","item number","mtj","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Montrose Regional ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2a46dc32","guard":[["hasAny",["each word","item number","nth","position","split into words","swf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stewart International ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2bd66e16","guard":[["hasAny",["each word","item number","nth","position","split into words","wmr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mananara Nord ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2c049562","guard":[["hasAny",["each word","item number","lrd","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Laredo International ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2c1863ad","guard":[["hasAny",["each word","item number","nth","position","split into words","stt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cyril E. King ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2ca5c155","guard":[["hasAny",["each word","item number","nth","position","split into words","yxt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Northwest Regional ",{"slot":1}," Terrace-Kitimat."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2d2535fb","guard":[["hasAny",["hva","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Analalava ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2d5736b1","guard":[["hasAny",["isk","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nashik ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2edbe168","guard":[["hasAny",["each word","hod","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hodeidah International ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-304f0fda","guard":[["hasAny",["each word","item number","nth","position","qig","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Iguatu ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-31907187","guard":[["hasAny",["each word","hod","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hodeidah International ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-338d8fa7","guard":[["hasAny",["dsd","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is La Désirade ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3907d3b0","guard":[["hasAny",["each word","item number","nth","position","split into words","stt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cyril E. King ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3965a796","guard":[["hasAny",["auh","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abu Dhabi International ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-39a6e243","guard":[["hasAny",["ild","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lleida-Alguaire ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-39adcde5","guard":[["hasAny",["hph","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cat Bi International ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3a2c70df","guard":[["hasAny",["item number","nth","position","yrv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Revelstoke ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3c69bfda","guard":[["hasAny",["item number","mbo","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mamburao ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3ef73cf4","guard":[["hasAny",["hva","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Analalava ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3f611fa1","guard":[["hasAny",["each word","item number","nth","position","rbx","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rumbek ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-400df43a","guard":[["hasAny",["item number","nth","position","yqv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Yorkton Municipal ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-401553a9","guard":[["hasAny",["item number","nth","position","yrf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cartwright ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4102e5d6","guard":[["hasAny",["ahn","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Athens Ben Epps ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-41a0219b","guard":[["hasAny",["item number","nth","position","rcq"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reconquista ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-41cfdfe8","guard":[["hasAny",["each word","item number","nth","position","split into words","yrf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cartwright ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-43d1d442","guard":[["hasAny",["auh","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abu Dhabi International ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-46a381d1","guard":[["hasAny",["each word","item number","nth","position","split into words","yrf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cartwright ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4a1e7938","guard":[["hasAny",["cfc","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Caçador ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4a23bbe4","guard":[["hasAny",["item number","nth","position","yrf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cartwright ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4af1b16d","guard":[["hasAny",["cri","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Colonel Hill ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4bf8a034","guard":[["hasAny",["each word","item number","nth","position","split into words","xcr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Châlons-Vatry ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4e405692","guard":[["hasAny",["item number","mwf","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maewo-Naone ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-50a4ffd2","guard":[["hasAny",["item number","nth","position","spf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Hills ",{"slot":1},"-Clyde Ice Field."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5359e8eb","guard":[["hasAny",["item number","nth","position","vix"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eurico de Aguiar Salles ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-545e6001","guard":[["hasAny",["auh","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abu Dhabi International ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-547a43b7","guard":[["hasAny",["each word","item number","nth","pid","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nassau Paradise Island ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-549f6146","guard":[["hasAny",["atl","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hartsfield Jackson Atlanta International ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-55ddf244","guard":[["hasAny",["hjr","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Khajuraho ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5676d170","guard":[["hasAny",["element","ild","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lleida-Alguaire ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-57168a87","guard":[["hasAny",["each word","item number","nth","position","split into words","yxt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Northwest Regional ",{"slot":1}," Terrace-Kitimat."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-57b6a5b3","guard":[["hasAny",["acx","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xingyi ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-58f4ea6a","guard":[["hasAny",["each word","item number","nth","position","split into words","twt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sanga Sanga ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5b70fb1f","guard":[["hasAny",["dsd","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is La Désirade ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5be8da4d","guard":[["hasAny",["item number","nth","oue","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ouesso ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5c2a7d5b","guard":[["hasAny",["each word","item number","nth","position","split into words","yqv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Yorkton Municipal ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5c6a81d9","guard":[["hasAny",["buo","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Burao ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5d08b522","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","twt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Sanga Sanga ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5d9dba40","guard":[["hasAny",["each word","item number","nth","position","spf","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Hills ",{"slot":1},"-Clyde Ice Field."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6080bc3e","guard":[["hasAny",["each word","hwn","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hwange National Park ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-60cf8781","guard":[["hasAny",["each word","item number","nth","position","split into words","swf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stewart International ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-634ddadb","guard":[["hasAny",["element","gaf","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gafsa Ksar International ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-64811e53","guard":[["hasAny",["each word","item number","nth","position","sov","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seldovia ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-65020aa6","guard":[["hasAny",["each word","item number","nth","position","qig","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Iguatu ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-661f8048","guard":[["hasAny",["item number","jdh","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jodhpur ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6645652b","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","rbx","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rumbek ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-66ea9a73","guard":[["hasAny",["item number","nth","position","yrv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Revelstoke ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6748dec1","guard":[["hasAny",["dcm","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Castres-Mazamet ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-689fdc57","guard":[["hasAny",["each word","item number","ndj","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is N'Djamena International ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-68b7d6e6","guard":[["hasAny",["cma","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cunnamulla ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-68d40a09","guard":[["hasAny",["cxp","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tunggul Wulung ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-690e7a91","guard":[["hasAny",["each word","item number","lrd","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Laredo International ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-69addb02","guard":[["hasAny",["each word","item number","moq","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Morondava ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6a57f4b3","guard":[["hasAny",["isk","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nashik ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6a671752","guard":[["hasAny",["each word","item number","nth","position","rcq","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reconquista ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6d176264","guard":[["hasAny",["abi","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abilene Regional ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6f61036d","guard":[["hasAny",["acx","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xingyi ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6fd6c524","guard":[["hasAny",["cxp","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tunggul Wulung ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-725a72e8","guard":[["hasAny",["each word","item number","nth","position","split into words","txl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berlin-Tegel ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-72608941","guard":[["hasAny",["item number","nth","position","wmr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mananara Nord ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7440efa3","guard":[["hasAny",["item number","nth","position","sov"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seldovia ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-758d9974","guard":[["hasAny",["cri","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Colonel Hill ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-760617b2","guard":[["hasAny",["each word","item number","jdo","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Orlando Bezerra de Menezes ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-78fbe7c5","guard":[["hasAny",["each word","item number","mbo","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mamburao ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-790a3893","guard":[["hasAny",["cma","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cunnamulla ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7935273e","guard":[["hasAny",["each word","item number","nth","position","sov","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seldovia ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-79973668","guard":[["hasAny",["hod","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hodeidah International ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7a47d63e","guard":[["hasAny",["each word","item number","moq","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Morondava ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7ab99f70","guard":[["hasAny",["cri","each word","item number","nth","position","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Colonel Hill ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7bfd80fb","guard":[["hasAny",["each word","ild","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lleida-Alguaire ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7e9a0450","guard":[["hasAny",["element","hod","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hodeidah International ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7ee5c403","guard":[["hasAny",["each word","isk","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nashik ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7f622a6f","guard":[["hasAny",["each word","item number","nth","position","split into words","txl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berlin-Tegel ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-81a0e2a7","guard":[["hasAny",["btm","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bert Mooney ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-822bc67e","guard":[["hasAny",["each word","item number","nth","ouh","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oudtshoorn ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-82372eb6","guard":[["hasAny",["byn","each word","item number","nth","position","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bayankhongor ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-85b30b90","guard":[["hasAny",["each word","hva","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Analalava ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-85f38f68","guard":[["hasAny",["each word","item number","nth","position","split into words","wmr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mananara Nord ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-87f609e1","guard":[["hasAny",["hjr","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Khajuraho ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-898a7d89","guard":[["hasAny",["btm","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bert Mooney ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-89e8f20e","guard":[["hasAny",["item number","nth","position","sov"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seldovia ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8ae3c27c","guard":[["hasAny",["each word","item number","nth","position","sia","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xi'an Xiguan ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8e9df193","guard":[["hasAny",["each word","item number","nth","position","split into words","tku"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Turku ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8f9a6425","guard":[["hasAny",["cfc","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Caçador ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-904e24f3","guard":[["hasAny",["element","item number","lower case","lowercase","mqx","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mekele ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-906f9df0","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","qig","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Iguatu ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-920c3e83","guard":[["hasAny",["each word","hld","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Dongshan ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-933e62a9","guard":[["hasAny",["each word","item number","nth","position","sba","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santa Barbara Municipal ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-93cc5a53","guard":[["hasAny",["abi","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abilene Regional ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-93ead2ef","guard":[["hasAny",["each word","hph","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cat Bi International ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-94e9d383","guard":[["hasAny",["hwn","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hwange National Park ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-94ebd9a5","guard":[["hasAny",["each word","hph","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cat Bi International ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-94f18223","guard":[["hasAny",["each word","item number","mwf","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maewo-Naone ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9682583a","guard":[["hasAny",["each word","item number","ndj","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is N'Djamena International ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9711579d","guard":[["hasAny",["dcm","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Castres-Mazamet ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-974000c1","guard":[["hasAny",["item number","ndj","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is N'Djamena International ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-97898802","guard":[["hasAny",["item number","nth","oue","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ouesso ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-97b1a45d","guard":[["hasAny",["byn","each word","item number","nth","position","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bayankhongor ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-98a7707b","guard":[["hasAny",["ejh","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Al Wajh Domestic ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-990006b6","guard":[["hasAny",["abi","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Abilene Regional ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-99ed972e","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","sia","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xi'an Xiguan ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9d10f80d","guard":[["hasAny",["hph","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cat Bi International ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a0d17b4b","guard":[["hasAny",["item number","mbo","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mamburao ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a2e94f3d","guard":[["hasAny",["each word","item number","nth","position","sht","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Shepparton ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a32837b3","guard":[["hasAny",["item number","nth","position","yxt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Northwest Regional ",{"slot":1}," Terrace-Kitimat."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a7f72c3b","guard":[["hasAny",["element","item number","lower case","lowercase","nth","ouh","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oudtshoorn ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a87be304","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","xcr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Châlons-Vatry ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a95fa54c","guard":[["hasAny",["item number","mwf","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maewo-Naone ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a99e78f6","guard":[["hasAny",["each word","isk","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nashik ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ad7d1d8a","guard":[["hasAny",["ahn","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Athens Ben Epps ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b021063f","guard":[["hasAny",["each word","item number","nth","position","split into words","vix"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eurico de Aguiar Salles ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b0b6c789","guard":[["hasAny",["item number","nth","position","txl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berlin-Tegel ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b1666f00","guard":[["hasAny",["cma","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cunnamulla ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b1d7640c","guard":[["hasAny",["item number","nth","position","spf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Hills ",{"slot":1},"-Clyde Ice Field."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b29dec92","guard":[["hasAny",["element","item number","lower case","lowercase","lrd","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Laredo International ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b336b6e6","guard":[["hasAny",["item number","nth","position","sia"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xi'an Xiguan ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b507f2a9","guard":[["hasAny",["element","item number","lower case","lowercase","mtj","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Montrose Regional ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b564144b","guard":[["hasAny",["chm","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Teniente FAP Jaime A De Montreuil Morales ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b7131cc1","guard":[["hasAny",["item number","ndj","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is N'Djamena International ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-be5137d5","guard":[["hasAny",["each word","gaf","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gafsa Ksar International ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-be66fb00","guard":[["hasAny",["each word","item number","nth","position","split into words","xcr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Châlons-Vatry ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-bf9e5a6c","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","tku"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Turku ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c1f87408","guard":[["hasAny",["ahn","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Athens Ben Epps ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c3bdd971","guard":[["hasAny",["chm","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Teniente FAP Jaime A De Montreuil Morales ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c57414eb","guard":[["hasAny",["acx","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xingyi ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c646b36e","guard":[["hasAny",["item number","nth","position","wmr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mananara Nord ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c8b8048c","guard":[["hasAny",["each word","item number","mwf","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Maewo-Naone ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c9c36b9c","guard":[["hasAny",["atl","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hartsfield Jackson Atlanta International ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ca0adb14","guard":[["hasAny",["element","item number","lower case","lowercase","nth","ogg","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kahului ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ca0b0a8c","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","swf"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stewart International ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-cc3067ee","guard":[["hasAny",["each word","item number","nth","ogg","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kahului ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-cc639265","guard":[["hasAny",["item number","nth","position","qig"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Iguatu ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-cca3b71c","guard":[["hasAny",["item number","nth","position","yxt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Northwest Regional ",{"slot":1}," Terrace-Kitimat."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d02701a3","guard":[["hasAny",["each word","item number","nth","oue","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Ouesso ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d05fddfb","guard":[["hasAny",["item number","nth","position","yqv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Yorkton Municipal ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d3fcae5f","guard":[["hasAny",["hwn","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hwange National Park ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d42efb15","guard":[["hasAny",["each word","item number","nth","position","split into words","yqv"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Yorkton Municipal ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d4f03410","guard":[["hasAny",["btm","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bert Mooney ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d696c024","guard":[["hasAny",["item number","nth","position","stt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Cyril E. King ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d8216dbb","guard":[["hasAny",["awa","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Awassa ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d918adae","guard":[["hasAny",["cxp","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tunggul Wulung ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d9853618","guard":[["hasAny",["each word","ejh","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Al Wajh Domestic ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-db598ec8","guard":[["hasAny",["awa","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Awassa ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-dc68e745","guard":[["hasAny",["buo","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Burao ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ddf893ea","guard":[["hasAny",["each word","ild","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Lleida-Alguaire ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-df953dd9","guard":[["hasAny",["each word","item number","nth","ogg","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kahului ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-dfdb3ad2","guard":[["hasAny",["atl","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Hartsfield Jackson Atlanta International ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-dfec4ea9","guard":[["hasAny",["each word","hjr","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Khajuraho ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e04d12ae","guard":[["hasAny",["buo","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Burao ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e0565bce","guard":[["hasAny",["item number","nth","position","sba"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Santa Barbara Municipal ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e1f81d60","guard":[["hasAny",["each word","ejh","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Al Wajh Domestic ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e3382526","guard":[["hasAny",["item number","nth","ogg","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Kahului ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e384a7f1","guard":[["hasAny",["each word","item number","mtj","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Montrose Regional ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e487fb60","guard":[["hasAny",["each word","item number","jdh","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jodhpur ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e89b3d66","guard":[["hasAny",["ejh","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Al Wajh Domestic ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e8c389af","guard":[["hasAny",["each word","item number","knr","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jam ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-eb187951","guard":[["hasAny",["each word","item number","jdo","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Orlando Bezerra de Menezes ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ec382208","guard":[["hasAny",["each word","item number","knr","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jam ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-efbd6d7e","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","vix"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eurico de Aguiar Salles ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f236ed81","guard":[["hasAny",["byn","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bayankhongor ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f4898207","guard":[["hasAny",["item number","nth","position","tku"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Turku ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f4ec6d0f","guard":[["hasAny",["each word","hva","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Analalava ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f6a88883","guard":[["hasAny",["cri","each word","item number","nth","position","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Colonel Hill ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f89e6a9d","guard":[["hasAny",["each word","item number","mqx","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Mekele ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f9f77a05","guard":[["hasAny",["each word","item number","nth","position","spf","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Black Hills ",{"slot":1},"-Clyde Ice Field."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fb4b8cc6","guard":[["hasAny",["awa","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Awassa ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fbe07c6e","guard":[["hasAny",["each word","item number","nth","position","sht","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Shepparton ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fc9fd67d","guard":[["hasAny",["gaf","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gafsa Ksar International ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fd890e93","guard":[["hasAny",["element","item number","lower case","lowercase","nth","pid","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nassau Paradise Island ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"airport"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fe118e7a","guard":[["hasAny",["each word","item number","nth","position","sia","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xi'an Xiguan ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fe19a5a5","guard":[["hasAny",["each word","item number","nth","position","rcq","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reconquista ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fe360083","guard":[["hasAny",["chm","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Teniente FAP Jaime A De Montreuil Morales ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fe695837","guard":[["hasAny",["item number","nth","ouh","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Oudtshoorn ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-feb41dc3","guard":[["hasAny",["each word","item number","nth","position","rbx","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rumbek ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ff10f8c7","guard":[["hasAny",["acx","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xingyi ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the airport coded JDH","expect":{"contains":["Jodhpur Airport"],"notRefusal":true}},{"q":"which airport has the IATA code POT","expect":{"contains":["Ken Jones Airport"],"notRefusal":true}},{"q":"which airport has the IATA code MMO","expect":{"contains":["Maio Airport"],"notRefusal":true}},{"q":"what is the name of the airport QIG","expect":{"contains":["Iguatu Airport"],"notRefusal":true}},{"q":"name the airport coded HJR","expect":{"contains":["Khajuraho Airport"],"notRefusal":true}},{"q":"which airport has the IATA code CYW","expect":{"contains":["Captain Rogelio Castillo National Airport"],"notRefusal":true}},{"q":"what is the name of the airport OUH","expect":{"contains":["Oudtshoorn Airport"],"notRefusal":true}},{"q":"name the airport coded ISK","expect":{"contains":["Nashik Airport"],"notRefusal":true}},{"q":"what is the name of the airport BTM","expect":{"contains":["Bert Mooney Airport"],"notRefusal":true}},{"q":"which airport has the IATA code SDU","expect":{"contains":["Santos Dumont Airport"],"notRefusal":true}},{"q":"which airport has the IATA code OKC","expect":{"contains":["Will Rogers World Airport"],"notRefusal":true}},{"q":"name the airport coded ACX","expect":{"contains":["Xingyi Airport"],"notRefusal":true}},{"q":"name the airport coded TXL","expect":{"contains":["Berlin-Tegel Airport"],"notRefusal":true}},{"q":"name the airport coded NDJ","expect":{"contains":["N'Djamena International Airport"],"notRefusal":true}},{"q":"name the airport coded EJH","expect":{"contains":["Al Wajh Domestic Airport"],"notRefusal":true}},{"q":"what is the name of the airport LRD","expect":{"contains":["Laredo International Airport"],"notRefusal":true}},{"q":"name the airport coded HVA","expect":{"contains":["Analalava Airport"],"notRefusal":true}},{"q":"which airport has the IATA code JAB","expect":{"contains":["Jabiru Airport"],"notRefusal":true}},{"q":"what is the name of the airport MQX","expect":{"contains":["Mekele Airport"],"notRefusal":true}},{"q":"name the airport coded BZN","expect":{"contains":["Gallatin Field"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
