// sp500-company-ticker-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"sp500-company-ticker-neo-g6","class":"sp500-company-ticker","generation":6,"lane":"neo","grownFrom":["which symbol does Ralph Lauren Corporation trade under","give the stock symbol of Alphabet Inc. (Class A)","which symbol does WEC Energy Group trade under","which symbol does Host Hotels & Resorts trade under","give the stock symbol of Progressive Corporation","give the stock symbol of Newmont","give the stock symbol of Cardinal Health","what is the ticker of Roper Technologies","what is the ticker of Wells Fargo","what is the ticker of Aon plc","what is the ticker of American Express","which symbol does Packaging Corporation of America trade under","give the stock symbol of Cisco","give the stock symbol of BNY Mellon","give the stock symbol of Synchrony Financial","what is the ticker of Kroger","what is the ticker of Huntington Ingalls Industries","give the stock symbol of Avery Dennison","give the stock symbol of LyondellBasell","give the stock symbol of Tyler Technologies"],"version":1});

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
{"id":"n-3f5b7ebc","guard":[["hasAny",["symbol","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Ralph Lauren Corporation trade under":"RL","give the stock symbol of Alphabet Inc. (Class A)":"GOOGL","which symbol does WEC Energy Group trade under":"WEC","which symbol does Host Hotels & Resorts trade under":"HST","give the stock symbol of Progressive Corporation":"PGR","give the stock symbol of Newmont":"NEM","give the stock symbol of Cardinal Health":"CAH","what is the ticker of Roper Technologies":"ROP","what is the ticker of Wells Fargo":"WFC","what is the ticker of Aon plc":"AON","what is the ticker of American Express":"AXP","which symbol does Packaging Corporation of America trade under":"PKG","give the stock symbol of Cisco":"CSCO","give the stock symbol of BNY Mellon":"BNY","give the stock symbol of Synchrony Financial":"SYF","what is the ticker of Kroger":"KR","what is the ticker of Huntington Ingalls Industries":"HII","give the stock symbol of Avery Dennison":"AVY","give the stock symbol of LyondellBasell":"LYB","give the stock symbol of Tyler Technologies":"TYL","give the stock symbol of Corpay":"CPAY","what is the ticker of Becton Dickinson":"BDX","which symbol does PepsiCo trade under":"PEP","which symbol does Prologis trade under":"PLD","give the stock symbol of Ameren":"AEE","which symbol does Edison International trade under":"EIX","give the stock symbol of S&P Global":"SPGI","give the stock symbol of AES Corporation":"AES","what is the ticker of Steris":"STE","what is the ticker of Seagate Technology":"STX","what is the ticker of Moderna":"MRNA","give the stock symbol of Medtronic":"MDT","give the stock symbol of Weyerhaeuser":"WY","what is the ticker of Blackstone Inc.":"BX","give the stock symbol of Wabtec":"WAB","which symbol does Teradyne trade under":"TER","what is the ticker of Dover Corporation":"DOV","what is the ticker of Rollins, Inc.":"ROL","give the stock symbol of Baxter International":"BAX","what is the ticker of Fiserv":"FISV","what is the ticker of UnitedHealth Group":"UNH","what is the ticker of Akamai Technologies":"AKAM","give the stock symbol of Fox Corporation (Class A)":"FOXA","which symbol does Texas Pacific Land Corporation trade under":"TPL","which symbol does Willis Towers Watson trade under":"WTW","which symbol does Casey's trade under":"CASY","what is the ticker of Berkshire Hathaway":"BRK.B","which symbol does Johnson & Johnson trade under":"JNJ","what is the ticker of Amcor":"AMCR","what is the ticker of IDEX Corporation":"IEX","what is the ticker of Morgan Stanley":"MS","give the stock symbol of Corning Inc.":"GLW","which symbol does Fair Isaac trade under":"FICO","what is the ticker of Ecolab":"ECL","what is the ticker of Realty Income":"O","what is the ticker of A. O. Smith":"AOS","which symbol does Apple Inc. trade under":"AAPL","what is the ticker of Old Dominion":"ODFL","what is the ticker of Ares Management":"ARES","give the stock symbol of L3Harris":"LHX","what is the ticker of Target Corporation":"TGT","give the stock symbol of U.S. Bancorp":"USB","what is the ticker of Franklin Resources":"BEN","give the stock symbol of Principal Financial Group":"PFG","give the stock symbol of Philip Morris International":"PM","give the stock symbol of Dow Inc.":"DOW","which symbol does Las Vegas Sands trade under":"LVS","what is the ticker of Invitation Homes":"INVH","give the stock symbol of Essex Property Trust":"ESS","give the stock symbol of Tyson Foods":"TSN","give the stock symbol of Tesla, Inc.":"TSLA","give the stock symbol of IQVIA":"IQV","which symbol does Royal Caribbean Group trade under":"RCL","what is the ticker of Ventas":"VTR","give the stock symbol of Revvity":"RVTY","which symbol does Motorola Solutions trade under":"MSI","which symbol does Williams Companies trade under":"WMB","which symbol does Lowe's trade under":"LOW","which symbol does Edwards Lifesciences trade under":"EW","what is the ticker of Regions Financial Corporation":"RF","which symbol does Lockheed Martin trade under":"LMT","what is the ticker of CenterPoint Energy":"CNP","what is the ticker of Hilton Worldwide":"HLT","which symbol does American Tower trade under":"AMT","give the stock symbol of Estée Lauder Companies (The)":"EL","give the stock symbol of Boston Scientific":"BSX","which symbol does Nvidia trade under":"NVDA","what is the ticker of Marvell Technology":"MRVL","which symbol does Advanced Micro Devices trade under":"AMD","which symbol does Southwest Airlines trade under":"LUV","what is the ticker of KKR & Co.":"KKR","which symbol does Chevron Corporation trade under":"CVX","which symbol does BlackRock trade under":"BLK","which symbol does ON Semiconductor trade under":"ON","give the stock symbol of Sandisk":"SNDK","which symbol does State Street Corporation trade under":"STT","which symbol does Carnival Corporation trade under":"CCL","which symbol does Monolithic Power Systems trade under":"MPWR","which symbol does Regency Centers trade under":"REG","which symbol does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-9433bb00","guard":[["hasAny",["symbol","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"Alphabet Inc. (Class A)":"GOOGL","Progressive Corporation":"PGR","Newmont":"NEM","Cardinal Health":"CAH","Roper Technologies":"ROP","Wells Fargo":"WFC","Aon plc":"AON","American Express":"AXP","America trade under":"PKG","Cisco":"CSCO","BNY Mellon":"BNY","Synchrony Financial":"SYF","Kroger":"KR","Huntington Ingalls Industries":"HII","Avery Dennison":"AVY","LyondellBasell":"LYB","Tyler Technologies":"TYL","Corpay":"CPAY","Becton Dickinson":"BDX","Ameren":"AEE","S&P Global":"SPGI","AES Corporation":"AES","Steris":"STE","Seagate Technology":"STX","Moderna":"MRNA","Medtronic":"MDT","Weyerhaeuser":"WY","Blackstone Inc":"BX","Wabtec":"WAB","Dover Corporation":"DOV","Rollins, Inc":"ROL","Baxter International":"BAX","Fiserv":"FISV","UnitedHealth Group":"UNH","Akamai Technologies":"AKAM","Fox Corporation (Class A)":"FOXA","Berkshire Hathaway":"BRK.B","Amcor":"AMCR","IDEX Corporation":"IEX","Morgan Stanley":"MS","Corning Inc":"GLW","Ecolab":"ECL","Realty Income":"O","A. O. Smith":"AOS","Old Dominion":"ODFL","Ares Management":"ARES","L3Harris":"LHX","Target Corporation":"TGT","U.S. Bancorp":"USB","Franklin Resources":"BEN","Principal Financial Group":"PFG","Philip Morris International":"PM","Dow Inc":"DOW","Invitation Homes":"INVH","Essex Property Trust":"ESS","Tyson Foods":"TSN","Tesla, Inc":"TSLA","IQVIA":"IQV","Ventas":"VTR","Revvity":"RVTY","Regions Financial Corporation":"RF","CenterPoint Energy":"CNP","Hilton Worldwide":"HLT","Estée Lauder Companies (The)":"EL","Boston Scientific":"BSX","Marvell Technology":"MRVL","KKR & Co":"KKR","Sandisk":"SNDK"}}},
{"id":"n-ff624dcf","guard":[["has","symbol"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"does Ralph Lauren Corporation trade under":"RL","of Alphabet Inc. (Class A)":"GOOGL","does WEC Energy Group trade under":"WEC","does Host Hotels & Resorts trade under":"HST","of Progressive Corporation":"PGR","of Newmont":"NEM","of Cardinal Health":"CAH","does Packaging Corporation of America trade under":"PKG","of Cisco":"CSCO","of BNY Mellon":"BNY","of Synchrony Financial":"SYF","of Avery Dennison":"AVY","of LyondellBasell":"LYB","of Tyler Technologies":"TYL","of Corpay":"CPAY","does PepsiCo trade under":"PEP","does Prologis trade under":"PLD","of Ameren":"AEE","does Edison International trade under":"EIX","of S&P Global":"SPGI","of AES Corporation":"AES","of Medtronic":"MDT","of Weyerhaeuser":"WY","of Wabtec":"WAB","does Teradyne trade under":"TER","of Baxter International":"BAX","of Fox Corporation (Class A)":"FOXA","does Texas Pacific Land Corporation trade under":"TPL","does Willis Towers Watson trade under":"WTW","does Casey's trade under":"CASY","does Johnson & Johnson trade under":"JNJ","of Corning Inc":"GLW","does Fair Isaac trade under":"FICO","does Apple Inc. trade under":"AAPL","of L3Harris":"LHX","of U.S. Bancorp":"USB","of Principal Financial Group":"PFG","of Philip Morris International":"PM","of Dow Inc":"DOW","does Las Vegas Sands trade under":"LVS","of Essex Property Trust":"ESS","of Tyson Foods":"TSN","of Tesla, Inc":"TSLA","of IQVIA":"IQV","does Royal Caribbean Group trade under":"RCL","of Revvity":"RVTY","does Motorola Solutions trade under":"MSI","does Williams Companies trade under":"WMB","does Lowe's trade under":"LOW","does Edwards Lifesciences trade under":"EW","does Lockheed Martin trade under":"LMT","does American Tower trade under":"AMT","of Estée Lauder Companies (The)":"EL","of Boston Scientific":"BSX","does Nvidia trade under":"NVDA","does Advanced Micro Devices trade under":"AMD","does Southwest Airlines trade under":"LUV","does Chevron Corporation trade under":"CVX","does BlackRock trade under":"BLK","does ON Semiconductor trade under":"ON","of Sandisk":"SNDK","does State Street Corporation trade under":"STT","does Carnival Corporation trade under":"CCL","does Monolithic Power Systems trade under":"MPWR","does Regency Centers trade under":"REG","does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-36e09722","guard":[["has","ticker"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the ticker of Roper Technologies":"ROP","the ticker of Wells Fargo":"WFC","the ticker of Aon plc":"AON","the ticker of American Express":"AXP","the ticker of Kroger":"KR","the ticker of Huntington Ingalls Industries":"HII","the ticker of Becton Dickinson":"BDX","the ticker of Steris":"STE","the ticker of Seagate Technology":"STX","the ticker of Moderna":"MRNA","the ticker of Blackstone Inc":"BX","the ticker of Dover Corporation":"DOV","the ticker of Rollins, Inc":"ROL","the ticker of Fiserv":"FISV","the ticker of UnitedHealth Group":"UNH","the ticker of Akamai Technologies":"AKAM","the ticker of Berkshire Hathaway":"BRK.B","the ticker of Amcor":"AMCR","the ticker of IDEX Corporation":"IEX","the ticker of Morgan Stanley":"MS","the ticker of Ecolab":"ECL","the ticker of Realty Income":"O","the ticker of A. O. Smith":"AOS","the ticker of Old Dominion":"ODFL","the ticker of Ares Management":"ARES","the ticker of Target Corporation":"TGT","the ticker of Franklin Resources":"BEN","the ticker of Invitation Homes":"INVH","the ticker of Ventas":"VTR","the ticker of Regions Financial Corporation":"RF","the ticker of CenterPoint Energy":"CNP","the ticker of Hilton Worldwide":"HLT","the ticker of Marvell Technology":"MRVL","the ticker of KKR & Co":"KKR"}}},
{"id":"n-34e058fe","guard":[["hasAny",["aes","aon","ares","bny","dow","shortest","shortest one","shortest word","wec"]],["not",["has","has"]],["not",["has","industry"]]],"pyramid":["render.str",["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3a5f25b7","guard":[["hasAny",["a to z","aes","alphabetical","alphabetize","aon","ares","bny","dow","shortest","shortest one","shortest word","wec"]],["not",["has","has"]],["not",["has","industry"]]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["sense.content"]]]],"mem":null},
{"id":"n-4a23bd16","guard":[["hasAny",["aes","aon","ares","bny","dow","shortest","shortest one","shortest word","wec"]],["not",["has","has"]],["not",["has","industry"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5426cf13","guard":[["hasAny",["aes","aon","ares","bny","dow","invert case","shortest","shortest one","shortest word","swap case","toggle case","wec"]],["not",["has","has"]],["not",["has","industry"]]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-824c9a96","guard":[["hasAny",["aes","aon","ares","bny","capitalise","capitalize","capitalize each word","dow","shortest","shortest one","shortest word","title case","wec"]],["not",["has","has"]],["not",["has","industry"]]],"pyramid":["render.str",["transform.title",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-16fe9a57","guard":[["hasAny",["aes","aon","ares","bny","dow","first n","shortest","shortest one","shortest word","take","wec"]],["not",["has","has"]],["not",["has","industry"]]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-6c5ecda8","guard":[["hasAny",["aes","aon","ares","bny","dow","first n","shortest","shortest one","shortest word","take","wec"]],["not",["has","has"]],["not",["has","industry"]]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-bf9ae99e","guard":[["hasAny",["aes","aon","ares","before","bny","co","dow","item number","nth","one less","position","predecessor","previous"]],["has","of"],["words<=",7],["not",["has","industry"]]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["transform.prev",["sense.wordCount"]]]],"mem":null},
{"id":"n-cce5c3f4","guard":[["hasAny",["aes","aon","ares","backwards","bny","co","dow","item number","nth","position","reverse order","reversed"]],["has","of"],["words<=",7],["not",["has","industry"]]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":2}]],"mem":null},
{"id":"n-0c83634a","guard":[["hasAny",["aes","aon","ares","bny","dow","each word","shortest","shortest one","shortest word","split into words","words"]],["not",["has","industry"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-0ef10c41","guard":[["hasAny",["aes","aon","ares","bny","delete","dow","remove","strip out","without"]],["not",["has","industry"]]],"pyramid":["render.str",["transform.remove",["sense.after",{"lit":"of"}],["sense.lastWord"]]],"mem":null},
{"id":"n-58772d28","guard":[["hasAny",["aes","aon","ares","bny","dow","separate by","split","split by"]],["not",["has","industry"]]],"pyramid":["render.lines",["transform.split",["sense.after",{"lit":"of"}],["sense.lastWord"]]],"mem":null},
{"id":"n-5da7400a","guard":[["hasAny",["a to z","aes","alphabetical","alphabetize","aon","ares","bny","dow","item number","nth","position"]],["has","of"],["not",["has","industry"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":1}]],"mem":null},
{"id":"n-67a4da50","guard":[["hasAny",["aes","aon","ares","bny","dow","separate by","split","split by"]],["not",["has","industry"]]],"pyramid":["render.list",["transform.split",["sense.after",{"lit":"of"}],["sense.lastWord"]]],"mem":null},
{"id":"n-a5604e50","guard":[["hasAny",["a to z","aes","alphabetical","alphabetize","aon","ares","bny","dow","item number","nth","position"]],["has","of"],["not",["has","industry"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":1}]],"mem":null},
{"id":"n-beac7968","guard":[["hasAny",["aes","aon","ares","bny","dow","separate by","split","split by"]],["not",["has","industry"]]],"pyramid":["render.and",["transform.split",["sense.after",{"lit":"of"}],["sense.lastWord"]]],"mem":null},
{"id":"n-20a24311","guard":[["hasAny",["aes","ares","backwards","bny","reverse order","reversed","shortest","shortest one","shortest word","wec"]],["not",["has","has"]],["not",["has","industry"]]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-4a17a379","guard":[["hasAny",["aon","ares","co","item number","nth","position","wec"]],["words<=",8],["words>=",7],["not",["has","domain"]],["not",["has","industry"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-837f39d1","guard":[["hasAny",["abbreviate","acronym","bancorp","huntington","morgan","principal"]],["not",["has","d"]]],"pyramid":["render.str",["transform.acronym",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-0184de24","guard":[["hasAny",["aon","ares","capitalise","capitalize","capitalize each word","co","item number","nth","position","title case","wec"]],["words<=",8],["words>=",7],["not",["has","domain"]],["not",["has","industry"]]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-24c4b6a0","guard":[["hasAny",["aon","ares","co","invert case","item number","nth","position","swap case","toggle case","wec"]],["words<=",8],["words>=",7],["not",["has","domain"]],["not",["has","industry"]]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-5564efa6","guard":[["hasAny",["aon","ares","co","first n","shortest","shortest one","shortest word","take","wec"]],["words<=",8],["words>=",7],["not",["has","domain"]],["not",["has","industry"]]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-879cf85c","guard":[["hasAny",["abbreviate","acronym","bancorp","capitalise","capitalize","capitalize each word","huntington","morgan","principal","title case"]],["not",["has","d"]]],"pyramid":["render.str",["transform.title",["transform.acronym",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-883dc30a","guard":[["hasAny",["abbreviate","acronym","bancorp","huntington","morgan","principal"]],["not",["has","d"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.acronym",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-db5f9fca","guard":[["hasAny",["abbreviate","acronym","bancorp","first letters of the name","huntington","initials","morgan","principal"]],["not",["has","d"]]],"pyramid":["render.str",["transform.acronym",["transform.initials",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-eea7b08e","guard":[["hasAny",["abbreviate","acronym","bancorp","huntington","lower case","lowercase","morgan","principal","small letters"]],["not",["has","d"]]],"pyramid":["render.str",["transform.lower",["transform.acronym",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-f7e4d809","guard":[["hasAny",["aon","ares","co","item number","nth","position","wec"]],["words<=",8],["words>=",7],["not",["has","domain"]],["not",["has","industry"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1c294aa4","guard":[["hasAny",["bny","host","no vowels","remove vowels","shortest","shortest one","shortest word","state","without vowels"]],["has","symbol"]],"pyramid":["render.str",["transform.noVowels",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-d9e36e8b","guard":[["hasAny",["aes","alphabetize the letters","bny","dow","letters in order","shortest","shortest one","shortest word","sort the letters"]],["has","give"]],"pyramid":["render.str",["transform.sortLetters",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-f1f50750","guard":[["hasAny",["aes","bny","dow","item number","nth","position"]],["has","give"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-346f2ac4","guard":[["hasAny",["aes","bny","dow","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5a1a824d","guard":[["hasAny",["aes","alphabetize the letters","bny","dow","item number","letters in order","nth","position","sort the letters"]],["has","give"]],"pyramid":["render.str",["transform.sortLetters",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-6ebcc430","guard":[["hasAny",["aon","co","dow","each word","longest","longest one","longest word","split into words","words"]],["words<=",7]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-9ca20b75","guard":[["hasAny",["aes","bny","distinct","dow","item number","nth","position","remove duplicates","unique","without repeats"]],["has","give"]],"pyramid":["render.str",["transform.nthStr",["transform.uniqueStrs",["sense.content"]],{"lit":3}]],"mem":null},
{"id":"n-a89a0ace","guard":[["hasAny",["aon","ares","co","divisor count","how many factors","item number","nth","number of divisors","position"]],["has","what"],["has","ticker"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-d9cf537f","guard":[["hasAny",["aes","bny","dow","invert case","item number","nth","position","swap case","toggle case"]],["has","give"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-dd436197","guard":[["hasAny",["abbreviate","acronym","morgan","morris","no vowels","principal","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.acronym",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-f3159968","guard":[["hasAny",["aes","bny","capitalise","capitalize","capitalize each word","dow","item number","nth","position","title case"]],["has","give"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-e4df124b","guard":[["hasAny",["semiconductor","shortest","shortest one","shortest word","wec"]],["has","symbol"]],"pyramid":["render.str",["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-1a3a067e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","semiconductor","shortest","shortest one","shortest word","title case","wec"]],["has","symbol"]],"pyramid":["render.str",["transform.title",["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-3fde4b6b","guard":[["hasAny",["each word","semiconductor","shortest","shortest one","shortest word","split into words","wec"]],["has","symbol"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.text"]]]],"mem":null},
{"id":"n-5aec9200","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","principal","short form"]],["has","give"]],"pyramid":["render.str",["transform.acronym",["sense.after",{"lit":"symbol"}]]],"mem":null},
{"id":"n-7e809fc0","guard":[["hasAny",["backwards","reverse order","reversed","semiconductor","shortest","shortest one","shortest word","wec"]],["has","symbol"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-ae84da58","guard":[["hasAny",["invert case","semiconductor","shortest","shortest one","shortest word","swap case","toggle case","wec"]],["has","symbol"]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-d5779c91","guard":[["hasAny",["item number","nth","position","semiconductor","wec"]],["has","symbol"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ee366170","guard":[["hasAny",["a to z","alphabetical","alphabetize","semiconductor","shortest","shortest one","shortest word","wec"]],["has","symbol"]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["sense.words"]]]],"mem":null},
{"id":"n-122c2b9f","guard":[["hasAny",["each word","energy","semiconductor","shortest","shortest one","shortest word","split into words","words"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-177928c0","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","lower case","lowercase","principal","short form","small letters"]],["has","give"]],"pyramid":["render.str",["transform.lower",["transform.acronym",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-2b875666","guard":[["hasAny",["first n","semiconductor","shortest","shortest one","shortest word","take","wec"]],["has","symbol"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.words"],{"lit":4}]]],"mem":null},
{"id":"n-3de2fed3","guard":[["hasAny",["abbreviate","acronym","morgan","no vowels","principal","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.acronym",["transform.noVowels",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-40fea97d","guard":[["hasAny",["each word","item number","nth","position","semiconductor","split into words","wec"]],["has","symbol"]],"pyramid":["render.str",["transform.nthStr",["transform.words",["sense.text"]],{"lit":4}]],"mem":null},
{"id":"n-51103736","guard":[["hasAny",["first n","semiconductor","shortest","shortest one","shortest word","take","wec"]],["has","symbol"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.words"],{"lit":5}]]],"mem":null},
{"id":"n-525faa8d","guard":[["hasAny",["character count","co","dow","how many characters","item number","length","nth","number of characters","position"]],["words<=",7],["has","of"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-7e110e1b","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","principal","short form"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.acronym",["sense.after",{"lit":"symbol"}]]],"mem":null},
{"id":"n-82db7ef4","guard":[["hasAny",["invert case","item number","nth","position","semiconductor","swap case","toggle case","wec"]],["has","symbol"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.words"],{"lit":4}]]],"mem":null},
{"id":"n-9158100b","guard":[["hasAny",["abbreviate","abbreviation","acronym","morris","no vowels","principal","remove vowels","short form","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.acronym",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-a57ebf89","guard":[["hasAny",["co","host","item number","no vowels","nth","position","remove vowels","without vowels"]],["words<=",8],["not",["has","domain"]],["words>=",7],["not",["has","acerra"]],["not",["has","andenne"]],["not",["has","baimajing"]]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-b405d880","guard":[["hasAny",["aes","ares","consonant count","how many consonants","item number","nth","number of consonants","position"]],["has","of"],["not",["has","industry"]]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-dbbcce4e","guard":[["hasAny",["host","item number","no vowels","nth","position","remove vowels","state","without vowels"]],["has","symbol"]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["sense.words"],{"lit":4}]]],"mem":null},
{"id":"n-dc440e7c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","semiconductor","title case","wec"]],["has","symbol"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.words"],{"lit":4}]]],"mem":null},
{"id":"n-f5f36fe0","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","capitalise","capitalize","capitalize each word","principal","short form","title case"]],["has","give"]],"pyramid":["render.str",["transform.title",["transform.acronym",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-f7af8703","guard":[["hasAny",["abbreviate","acronym","alphabetize the letters","huntington","letters in order","morgan","sort the letters"]]],"pyramid":["render.str",["transform.sortLetters",["transform.acronym",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-026e35ce","guard":[["hasAny",["income","realty","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Realty Income":"O"}}},
{"id":"n-02a688f5","guard":[["hasAny",["bancorp","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of U.S. Bancorp":"USB"}}},
{"id":"n-036553e8","guard":[["hasAny",["corning","inc","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Corning Inc.":"GLW"}}},
{"id":"n-051cabec","guard":[["hasAny",["blackrock","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does BlackRock trade under":"BLK"}}},
{"id":"n-0675c744","guard":[["has","dow"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Dow Inc.":"DOW"}}},
{"id":"n-08ab6585","guard":[["hasAny",["corporation","dover","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Dover Corporation":"DOV"}}},
{"id":"n-0a8872ec","guard":[["hasAny",["motorola","solutions","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Motorola Solutions trade under":"MSI"}}},
{"id":"n-0ab42648","guard":[["hasAny",["lyondellbasell","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of LyondellBasell":"LYB"}}},
{"id":"n-0ab47666","guard":[["hasAny",["international","morris","philip","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Philip Morris International":"PM"}}},
{"id":"n-0b1195e7","guard":[["hasAny",["lowes","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Lowe's trade under":"LOW"}}},
{"id":"n-0c571671","guard":[["hasAny",["corpay","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Corpay":"CPAY"}}},
{"id":"n-0e670f52","guard":[["hasAny",["stock","symbol","wabtec"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Wabtec":"WAB"}}},
{"id":"n-0e83c81a","guard":[["hasAny",["energy","group","symbol","trade","under","wec"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does WEC Energy Group trade under":"WEC"}}},
{"id":"n-11a81b55","guard":[["hasAny",["lockheed","martin","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Lockheed Martin trade under":"LMT"}}},
{"id":"n-11fd9db4","guard":[["hasAny",["aon","plc","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Aon plc":"AON"}}},
{"id":"n-131b7806","guard":[["hasAny",["enterprises","ferguson"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-143c56d5","guard":[["hasAny",["morgan","stanley","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Morgan Stanley":"MS"}}},
{"id":"n-1548bd6c","guard":[["hasAny",["symbol","teradyne","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Teradyne trade under":"TER"}}},
{"id":"n-17501068","guard":[["hasAny",["financial","stock","symbol","synchrony"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Synchrony Financial":"SYF"}}},
{"id":"n-187379ed","guard":[["hasAny",["global","sp","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of S&P Global":"SPGI"}}},
{"id":"n-1886517c","guard":[["has","sandisk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Sandisk":"SNDK"}}},
{"id":"n-18a5f84e","guard":[["hasAny",["companies","williams"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Williams Companies trade under":"WMB"}}},
{"id":"n-1906605f","guard":[["hasAny",["medtronic","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Medtronic":"MDT"}}},
{"id":"n-19a4a08b","guard":[["has","dover"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Dover Corporation":"DOV"}}},
{"id":"n-1ae81808","guard":[["hasAny",["stock","symbol","technologies","tyler"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Tyler Technologies":"TYL"}}},
{"id":"n-1dbcc910","guard":[["has","semiconductor"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does ON Semiconductor trade under":"ON"}}},
{"id":"n-1e252b9b","guard":[["hasAny",["fargo","ticker","wells"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Wells Fargo":"WFC"}}},
{"id":"n-1edfc4aa","guard":[["hasAny",["centers","regency","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Regency Centers trade under":"REG"}}},
{"id":"n-23effa57","guard":[["hasAny",["dominion","old","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Old Dominion":"ODFL"}}},
{"id":"n-24037289","guard":[["has","roper"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Roper Technologies":"ROP"}}},
{"id":"n-25094e19","guard":[["hasAny",["cardinal","health","stock","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Cardinal Health":"CAH"}}},
{"id":"n-257be561","guard":[["hasAny",["edwards","lifesciences","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Edwards Lifesciences trade under":"EW"}}},
{"id":"n-27b0bb1b","guard":[["hasAny",["o","smith","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of A. O. Smith":"AOS"}}},
{"id":"n-285c03e2","guard":[["hasAny",["co","kkr","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of KKR & Co.":"KKR"}}},
{"id":"n-295baa13","guard":[["hasAny",["class","fox"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Fox Corporation (Class A)":"FOXA"}}},
{"id":"n-2976b8a5","guard":[["hasAny",["becton","dickinson","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Becton Dickinson":"BDX"}}},
{"id":"n-298ac258","guard":[["has","synchrony"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Synchrony Financial":"SYF"}}},
{"id":"n-2ac3187a","guard":[["has","wabtec"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Wabtec":"WAB"}}},
{"id":"n-2e4e0fa2","guard":[["has","idex"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of IDEX Corporation":"IEX"}}},
{"id":"n-31a0d170","guard":[["hasAny",["apple","inc","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Apple Inc. trade under":"AAPL"}}},
{"id":"n-327f2e47","guard":[["hasAny",["monolithic","power","symbol","systems","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Monolithic Power Systems trade under":"MPWR"}}},
{"id":"n-354e3aac","guard":[["has","bancorp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of U.S. Bancorp":"USB"}}},
{"id":"n-36b39672","guard":[["hasAny",["foods","stock","symbol","tyson"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Tyson Foods":"TSN"}}},
{"id":"n-37f7f3b8","guard":[["hasAny",["revvity","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Revvity":"RVTY"}}},
{"id":"n-38de344a","guard":[["hasAny",["bny","mellon","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of BNY Mellon":"BNY"}}},
{"id":"n-3950a8db","guard":[["hasAny",["fiserv","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Fiserv":"FISV"}}},
{"id":"n-3b479128","guard":[["hasAny",["advanced","devices","micro","symbol","trade","under"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Advanced Micro Devices trade under":"AMD"}}},
{"id":"n-3cb104a3","guard":[["hasAny",["blackstone","inc","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Blackstone Inc.":"BX"}}},
{"id":"n-3e33b036","guard":[["hasAny",["carnival","corporation","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Carnival Corporation trade under":"CCL"}}},
{"id":"n-3f67f1ee","guard":[["hasAny",["roper","technologies","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Roper Technologies":"ROP"}}},
{"id":"n-42bca894","guard":[["hasAny",["homes","invitation","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Invitation Homes":"INVH"}}},
{"id":"n-4463689f","guard":[["hasAny",["dow","inc","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Dow Inc.":"DOW"}}},
{"id":"n-44d286af","guard":[["hasAny",["steris","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Steris":"STE"}}},
{"id":"n-46705f4a","guard":[["hasAny",["aes","corporation","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of AES Corporation":"AES"}}},
{"id":"n-46d3c14f","guard":[["hasAny",["land","pacific","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Texas Pacific Land Corporation trade under":"TPL"}}},
{"id":"n-47a819fd","guard":[["hasAny",["iqvia","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of IQVIA":"IQV"}}},
{"id":"n-47c2fc8a","guard":[["hasAny",["stock","symbol","technologies","tyler"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Tyler Technologies":"TYL"}}},
{"id":"n-499e7d9d","guard":[["has","weyerhaeuser"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Weyerhaeuser":"WY"}}},
{"id":"n-4ce770f4","guard":[["hasAny",["seagate","technology","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Seagate Technology":"STX"}}},
{"id":"n-4e48e57a","guard":[["hasAny",["companies","estée","lauder","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Estée Lauder Companies (The)":"EL"}}},
{"id":"n-4e5e29ae","guard":[["hasAny",["lockheed","martin"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Lockheed Martin trade under":"LMT"}}},
{"id":"n-4ff112eb","guard":[["hasAny",["group","ticker","unitedhealth"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of UnitedHealth Group":"UNH"}}},
{"id":"n-502e573d","guard":[["has","baxter"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Baxter International":"BAX"}}},
{"id":"n-50ef14dd","guard":[["hasAny",["caribbean","royal"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Royal Caribbean Group trade under":"RCL"}}},
{"id":"n-512e7aeb","guard":[["hasAny",["franklin","resources","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Franklin Resources":"BEN"}}},
{"id":"n-51c30596","guard":[["has","carnival"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Carnival Corporation trade under":"CCL"}}},
{"id":"n-52f5f792","guard":[["has","progressive"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Progressive Corporation":"PGR"}}},
{"id":"n-559f8ccb","guard":[["has","akamai"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Akamai Technologies":"AKAM"}}},
{"id":"n-55a5bf67","guard":[["hasAny",["akamai","technologies","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Akamai Technologies":"AKAM"}}},
{"id":"n-56bc653a","guard":[["hasAny",["corporation","target","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Target Corporation":"TGT"}}},
{"id":"n-5b6df562","guard":[["hasAny",["corporation","state","street","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does State Street Corporation trade under":"STT"}}},
{"id":"n-5e6292c0","guard":[["hasAny",["l3harris","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of L3Harris":"LHX"}}},
{"id":"n-611e4219","guard":[["hasAny",["aon","plc","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Aon plc":"AON"}}},
{"id":"n-6389701f","guard":[["hasAny",["american","symbol","tower","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does American Tower trade under":"AMT"}}},
{"id":"n-640350b9","guard":[["hasAny",["energy","wec"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does WEC Energy Group trade under":"WEC"}}},
{"id":"n-64fb82de","guard":[["hasAny",["host","hotels","resorts","symbol","trade","under"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Host Hotels & Resorts trade under":"HST"}}},
{"id":"n-6632fc78","guard":[["hasAny",["american","express","ticker"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of American Express":"AXP"}}},
{"id":"n-6751f19f","guard":[["hasAny",["symbol","towers","trade","under","watson","willis"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Willis Towers Watson trade under":"WTW"}}},
{"id":"n-689e1bf5","guard":[["hasAny",["essex","property","stock","symbol","trust"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Essex Property Trust":"ESS"}}},
{"id":"n-695b494a","guard":[["hasAny",["corporation","progressive","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Progressive Corporation":"PGR"}}},
{"id":"n-69d2ec88","guard":[["has","target"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Target Corporation":"TGT"}}},
{"id":"n-6ac85351","guard":[["has","lowes"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Lowe's trade under":"LOW"}}},
{"id":"n-6b946e32","guard":[["hasAny",["boston","scientific","stock","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Boston Scientific":"BSX"}}},
{"id":"n-6bbacb7d","guard":[["hasAny",["newmont","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Newmont":"NEM"}}},
{"id":"n-6c1dc18f","guard":[["hasAny",["inc","rollins","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Rollins, Inc.":"ROL"}}},
{"id":"n-6cf6ca42","guard":[["hasAny",["berkshire","hathaway","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Berkshire Hathaway":"BRK.B"}}},
{"id":"n-6f197ccf","guard":[["has","caseys"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Casey's trade under":"CASY"}}},
{"id":"n-6f80b993","guard":[["hasAny",["enterprises","ferguson","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-71ac0131","guard":[["hasAny",["las","sands","symbol","trade","under","vegas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Las Vegas Sands trade under":"LVS"}}},
{"id":"n-75963481","guard":[["hasAny",["apple","inc"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Apple Inc. trade under":"AAPL"}}},
{"id":"n-76edd35a","guard":[["hasAny",["hilton","ticker","worldwide"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Hilton Worldwide":"HLT"}}},
{"id":"n-7c7c7a76","guard":[["hasAny",["baxter","international","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Baxter International":"BAX"}}},
{"id":"n-7f037176","guard":[["has","johnson"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Johnson & Johnson trade under":"JNJ"}}},
{"id":"n-7fcf17f4","guard":[["hasAny",["huntington","industries","ingalls","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Huntington Ingalls Industries":"HII"}}},
{"id":"n-81074c93","guard":[["hasAny",["fiserv","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Fiserv":"FISV"}}},
{"id":"n-81d3af68","guard":[["has","seagate"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Seagate Technology":"STX"}}},
{"id":"n-8449b848","guard":[["hasAny",["nvidia","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Nvidia trade under":"NVDA"}}},
{"id":"n-85ffaf4e","guard":[["hasAny",["corporation","financial","regions","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Regions Financial Corporation":"RF"}}},
{"id":"n-877d1352","guard":[["hasAny",["caribbean","group","royal","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Royal Caribbean Group trade under":"RCL"}}},
{"id":"n-897ac1c4","guard":[["hasAny",["america","corporation","packaging","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Packaging Corporation of America trade under":"PKG"}}},
{"id":"n-8b25404a","guard":[["hasAny",["johnson","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Johnson & Johnson trade under":"JNJ"}}},
{"id":"n-8dc1b9dd","guard":[["has","medtronic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Medtronic":"MDT"}}},
{"id":"n-8df38b00","guard":[["hasAny",["essex","property","stock","symbol","trust"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Essex Property Trust":"ESS"}}},
{"id":"n-8e8a7db0","guard":[["hasAny",["amcor","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Amcor":"AMCR"}}},
{"id":"n-8ed0ce26","guard":[["has","revvity"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Revvity":"RVTY"}}},
{"id":"n-9242a6b6","guard":[["hasAny",["caseys","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Casey's trade under":"CASY"}}},
{"id":"n-998521d2","guard":[["hasAny",["semiconductor","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does ON Semiconductor trade under":"ON"}}},
{"id":"n-99c490c1","guard":[["hasAny",["lauren","ralph"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Ralph Lauren Corporation trade under":"RL"}}},
{"id":"n-9a72ac1c","guard":[["hasAny",["stock","symbol","weyerhaeuser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Weyerhaeuser":"WY"}}},
{"id":"n-9d54ed53","guard":[["has","tesla"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Tesla, Inc.":"TSLA"}}},
{"id":"n-a03b86f6","guard":[["has","rollins"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Rollins, Inc.":"ROL"}}},
{"id":"n-a05f22f8","guard":[["hasAny",["ameren","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Ameren":"AEE"}}},
{"id":"n-a0c998b5","guard":[["has","newmont"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Newmont":"NEM"}}},
{"id":"n-a0de8f41","guard":[["hasAny",["financial","group","principal","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Principal Financial Group":"PFG"}}},
{"id":"n-a1bae1a2","guard":[["hasAny",["american","tower"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does American Tower trade under":"AMT"}}},
{"id":"n-a20544c4","guard":[["has","blackrock"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does BlackRock trade under":"BLK"}}},
{"id":"n-a2509518","guard":[["hasAny",["fargo","ticker","wells"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Wells Fargo":"WFC"}}},
{"id":"n-a45db3cd","guard":[["hasAny",["dominion","old","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Old Dominion":"ODFL"}}},
{"id":"n-a5536ef7","guard":[["hasAny",["foods","stock","symbol","tyson"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Tyson Foods":"TSN"}}},
{"id":"n-a6acaf4f","guard":[["hasAny",["corporation","financial","regions","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Regions Financial Corporation":"RF"}}},
{"id":"n-a8c4202c","guard":[["hasAny",["kroger","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Kroger":"KR"}}},
{"id":"n-a8cf09fa","guard":[["hasAny",["ecolab","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Ecolab":"ECL"}}},
{"id":"n-aa76e711","guard":[["hasAny",["cardinal","health","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Cardinal Health":"CAH"}}},
{"id":"n-aae6e0e5","guard":[["hasAny",["huntington","industries","ingalls","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Huntington Ingalls Industries":"HII"}}},
{"id":"n-ab830ef7","guard":[["hasAny",["moderna","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Moderna":"MRNA"}}},
{"id":"n-ab99d14e","guard":[["hasAny",["ticker","ventas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Ventas":"VTR"}}},
{"id":"n-aba039df","guard":[["hasAny",["avery","dennison","stock","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Avery Dennison":"AVY"}}},
{"id":"n-ad774a05","guard":[["hasAny",["inc","stock","symbol","tesla"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Tesla, Inc.":"TSLA"}}},
{"id":"n-ad9f9cac","guard":[["hasAny",["moderna","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Moderna":"MRNA"}}},
{"id":"n-ae638cce","guard":[["hasAny",["state","street"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does State Street Corporation trade under":"STT"}}},
{"id":"n-aec96909","guard":[["hasAny",["group","principal"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Principal Financial Group":"PFG"}}},
{"id":"n-af0e9e0c","guard":[["hasAny",["alphabet","class","inc","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Alphabet Inc. (Class A)":"GOOGL"}}},
{"id":"n-b0c4871e","guard":[["hasAny",["corporation","idex","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of IDEX Corporation":"IEX"}}},
{"id":"n-b341a7ba","guard":[["hasAny",["advanced","devices","micro","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Advanced Micro Devices trade under":"AMD"}}},
{"id":"n-b48b2f75","guard":[["hasAny",["edwards","lifesciences"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Edwards Lifesciences trade under":"EW"}}},
{"id":"n-b5564bff","guard":[["hasAny",["centers","regency"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Regency Centers trade under":"REG"}}},
{"id":"n-b5cd26ad","guard":[["hasAny",["airlines","southwest"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Southwest Airlines trade under":"LUV"}}},
{"id":"n-b71ec683","guard":[["hasAny",["companies","estée","lauder","stock","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Estée Lauder Companies (The)":"EL"}}},
{"id":"n-b9492211","guard":[["hasAny",["kroger","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Kroger":"KR"}}},
{"id":"n-bb6758b8","guard":[["hasAny",["becton","dickinson","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Becton Dickinson":"BDX"}}},
{"id":"n-bca56b9f","guard":[["hasAny",["chevron","corporation","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Chevron Corporation trade under":"CVX"}}},
{"id":"n-bdce1a93","guard":[["hasAny",["alphabet","class"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Alphabet Inc. (Class A)":"GOOGL"}}},
{"id":"n-c0affc77","guard":[["hasAny",["income","realty","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Realty Income":"O"}}},
{"id":"n-c1bb8fe2","guard":[["hasAny",["ares","management","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Ares Management":"ARES"}}},
{"id":"n-c1ffbb56","guard":[["hasAny",["companies","symbol","trade","under","williams"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Williams Companies trade under":"WMB"}}},
{"id":"n-c258aafd","guard":[["has","corpay"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Corpay":"CPAY"}}},
{"id":"n-c4071210","guard":[["has","corning"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Corning Inc.":"GLW"}}},
{"id":"n-c4118354","guard":[["has","nvidia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Nvidia trade under":"NVDA"}}},
{"id":"n-c4227719","guard":[["hasAny",["america","packaging"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Packaging Corporation of America trade under":"PKG"}}},
{"id":"n-c53a9485","guard":[["hasAny",["centerpoint","energy","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of CenterPoint Energy":"CNP"}}},
{"id":"n-c7261126","guard":[["hasAny",["corporation","lauren","ralph","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Ralph Lauren Corporation trade under":"RL"}}},
{"id":"n-c7e725e8","guard":[["hasAny",["o","smith","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of A. O. Smith":"AOS"}}},
{"id":"n-c8191b40","guard":[["hasAny",["co","kkr","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of KKR & Co.":"KKR"}}},
{"id":"n-c8deccdb","guard":[["has","blackstone"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Blackstone Inc.":"BX"}}},
{"id":"n-cb010a5a","guard":[["has","prologis"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Prologis trade under":"PLD"}}},
{"id":"n-cb336e02","guard":[["hasAny",["boston","scientific","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Boston Scientific":"BSX"}}},
{"id":"n-cbe2c794","guard":[["hasAny",["sandisk","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Sandisk":"SNDK"}}},
{"id":"n-cd1e8c76","guard":[["has","cisco"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Cisco":"CSCO"}}},
{"id":"n-cd66d886","guard":[["has","ameren"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Ameren":"AEE"}}},
{"id":"n-ce87cc5a","guard":[["hasAny",["group","ticker","unitedhealth"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of UnitedHealth Group":"UNH"}}},
{"id":"n-d1bbeaf9","guard":[["has","marvell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Marvell Technology":"MRVL"}}},
{"id":"n-d55ddfe6","guard":[["hasAny",["berkshire","hathaway","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Berkshire Hathaway":"BRK.B"}}},
{"id":"n-d606b68a","guard":[["hasAny",["morgan","stanley","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Morgan Stanley":"MS"}}},
{"id":"n-d64109dc","guard":[["has","aes"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of AES Corporation":"AES"}}},
{"id":"n-d6be19de","guard":[["has","teradyne"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Teradyne trade under":"TER"}}},
{"id":"n-d79c5930","guard":[["hasAny",["prologis","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Prologis trade under":"PLD"}}},
{"id":"n-db767369","guard":[["hasAny",["ecolab","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Ecolab":"ECL"}}},
{"id":"n-dc2afd47","guard":[["hasAny",["monolithic","power","symbol","systems","trade","under"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Monolithic Power Systems trade under":"MPWR"}}},
{"id":"n-df01a6ac","guard":[["hasAny",["class","corporation","fox","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Fox Corporation (Class A)":"FOXA"}}},
{"id":"n-e04814db","guard":[["hasAny",["franklin","resources","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Franklin Resources":"BEN"}}},
{"id":"n-e6fd23f7","guard":[["hasAny",["corporation","land","pacific","symbol","texas","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Texas Pacific Land Corporation trade under":"TPL"}}},
{"id":"n-e7553ba9","guard":[["hasAny",["motorola","solutions"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Motorola Solutions trade under":"MSI"}}},
{"id":"n-e892873e","guard":[["hasAny",["las","sands","symbol","trade","under","vegas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Las Vegas Sands trade under":"LVS"}}},
{"id":"n-eae3cbc9","guard":[["has","pepsico"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does PepsiCo trade under":"PEP"}}},
{"id":"n-eb4c3c92","guard":[["hasAny",["steris","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Steris":"STE"}}},
{"id":"n-ed4b6ee5","guard":[["has","lyondellbasell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of LyondellBasell":"LYB"}}},
{"id":"n-ee4043eb","guard":[["hasAny",["marvell","technology","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Marvell Technology":"MRVL"}}},
{"id":"n-eefa63ca","guard":[["hasAny",["global","sp","stock","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of S&P Global":"SPGI"}}},
{"id":"n-ef61c0e7","guard":[["hasAny",["avery","dennison","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Avery Dennison":"AVY"}}},
{"id":"n-f1724506","guard":[["hasAny",["amcor","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Amcor":"AMCR"}}},
{"id":"n-f21927cf","guard":[["has","chevron"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Chevron Corporation trade under":"CVX"}}},
{"id":"n-f2d895fe","guard":[["hasAny",["hilton","ticker","worldwide"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Hilton Worldwide":"HLT"}}},
{"id":"n-f3a88592","guard":[["hasAny",["fair","isaac","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Fair Isaac trade under":"FICO"}}},
{"id":"n-f44a084d","guard":[["hasAny",["edison","international","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Edison International trade under":"EIX"}}},
{"id":"n-f469119e","guard":[["hasAny",["cisco","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Cisco":"CSCO"}}},
{"id":"n-f46e958b","guard":[["hasAny",["bny","mellon","stock","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of BNY Mellon":"BNY"}}},
{"id":"n-f54f195f","guard":[["hasAny",["pepsico","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does PepsiCo trade under":"PEP"}}},
{"id":"n-f7dc0714","guard":[["hasAny",["host","hotels","resorts","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Host Hotels & Resorts trade under":"HST"}}},
{"id":"n-f95d729e","guard":[["hasAny",["fair","isaac"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Fair Isaac trade under":"FICO"}}},
{"id":"n-f977a4ef","guard":[["hasAny",["homes","invitation","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Invitation Homes":"INVH"}}},
{"id":"n-f9bad5fd","guard":[["hasAny",["airlines","southwest","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Southwest Airlines trade under":"LUV"}}},
{"id":"n-fa73f898","guard":[["hasAny",["american","express","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of American Express":"AXP"}}},
{"id":"n-fce377bd","guard":[["has","iqvia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of IQVIA":"IQV"}}},
{"id":"n-fdec38cd","guard":[["hasAny",["edison","international"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Edison International trade under":"EIX"}}},
{"id":"n-fe26dc28","guard":[["hasAny",["ticker","ventas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Ventas":"VTR"}}},
{"id":"n-fe8e2982","guard":[["hasAny",["symbol","towers","trade","under","watson","willis"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Willis Towers Watson trade under":"WTW"}}},
{"id":"n-ff131ee8","guard":[["hasAny",["morris","philip"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Philip Morris International":"PM"}}},
{"id":"n-0a31aec4","guard":[["hasAny",["a to z","alphabetical","alphabetize","item number","nth","position","semiconductor"]],["has","which"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":2}]],"mem":null},
{"id":"n-2fc18875","guard":[["hasAny",["energy","normalise","normalize","shortest","shortest one","shortest word","simplify the text"]]],"pyramid":["render.str",["transform.norm",["aggregate.shortest",["sense.words"]],{"lit":2}]],"mem":null},
{"id":"n-3b8c1287","guard":[["hasAny",["backwards","item number","nth","position","reverse order","reversed","wec"]],["has","symbol"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":5}]],"mem":null},
{"id":"n-3be134cb","guard":[["hasAny",["characters","each letter","income","item number","letters","nth","position","spell","spell out"]]],"pyramid":["render.str",["transform.nthStr",["transform.letters",["sense.lastWord"]],{"lit":4}]],"mem":null},
{"id":"n-4fb0332a","guard":[["hasAny",["energy","half","half of","halve","item number","nth","position"]],["has","symbol"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["transform.half",["sense.wordCount"]]]],"mem":null},
{"id":"n-52401935","guard":[["hasAny",["how many vowels","item number","nth","number of vowels","position","vowel count","wec"]],["has","symbol"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-64eb52fb","guard":[["hasAny",["bny","character count","how many characters","item number","length","nth","number of characters","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-694f03fc","guard":[["hasAny",["divisor count","how many factors","item number","nth","number of divisors","position","wec"]],["has","symbol"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-7a4362fa","guard":[["hasAny",["backwards","energy","item number","nth","position","reverse order","reversed"]],["has","which"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":5}]],"mem":null},
{"id":"n-8c6e6715","guard":[["hasAny",["backwards","item number","nth","position","reverse order","reversed","semiconductor"]],["has","which"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":4}]],"mem":null},
{"id":"n-901e94d9","guard":[["hasAny",["alphabetize the letters","co","item number","letters in order","nth","position","sort the letters"]],["has","kkr"]],"pyramid":["render.str",["transform.sortLetters",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-9c15bb79","guard":[["hasAny",["how many items","item number","nth","number of items","position","semiconductor"]],["has","which"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-9d611e4f","guard":[["hasAny",["dow","each word","longest","longest one","longest word","split into words","words"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-b4effa1b","guard":[["hasAny",["abbreviate","acronym","income","item number","nth","position"]]],"pyramid":["render.str",["transform.acronym",["transform.nthStr",["sense.words"],{"lit":5}]]],"mem":null},
{"id":"n-dd753bfe","guard":[["hasAny",["append","combine","concatenate","fox","put together","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.str",["transform.concat",["aggregate.shortest",["sense.content"]],["sense.lastWord"]]],"mem":null},
{"id":"n-df937081","guard":[["hasAny",["a to z","alphabetical","alphabetize","co","item number","nth","position"]],["has","kkr"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":3}]],"mem":null},
{"id":"n-e89ec54b","guard":[["hasAny",["a to z","alphabetical","alphabetize","co","item number","nth","position"]],["has","kkr"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":2}]],"mem":null},
{"id":"n-ef730936","guard":[["hasAny",["bny","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-fadf984e","guard":[["hasAny",["as a roman numeral","carnival","growth rate","in roman numerals","percent change","percent decrease","percent increase","percentage change","roman numeral","to roman"]]],"pyramid":["render.str",["compute.toRoman",["compute.percentChange",{"lit":2},["sense.wordCount"]]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which symbol does Ralph Lauren Corporation trade under","expect":{"equals":"RL","notRefusal":true}},{"q":"give the stock symbol of Alphabet Inc. (Class A)","expect":{"equals":"GOOGL","notRefusal":true}},{"q":"which symbol does WEC Energy Group trade under","expect":{"equals":"WEC","notRefusal":true}},{"q":"which symbol does Host Hotels & Resorts trade under","expect":{"equals":"HST","notRefusal":true}},{"q":"give the stock symbol of Progressive Corporation","expect":{"equals":"PGR","notRefusal":true}},{"q":"give the stock symbol of Newmont","expect":{"equals":"NEM","notRefusal":true}},{"q":"give the stock symbol of Cardinal Health","expect":{"equals":"CAH","notRefusal":true}},{"q":"what is the ticker of Roper Technologies","expect":{"equals":"ROP","notRefusal":true}},{"q":"what is the ticker of Wells Fargo","expect":{"equals":"WFC","notRefusal":true}},{"q":"what is the ticker of Aon plc","expect":{"equals":"AON","notRefusal":true}},{"q":"what is the ticker of American Express","expect":{"equals":"AXP","notRefusal":true}},{"q":"which symbol does Packaging Corporation of America trade under","expect":{"equals":"PKG","notRefusal":true}},{"q":"give the stock symbol of Cisco","expect":{"equals":"CSCO","notRefusal":true}},{"q":"give the stock symbol of BNY Mellon","expect":{"equals":"BNY","notRefusal":true}},{"q":"give the stock symbol of Synchrony Financial","expect":{"equals":"SYF","notRefusal":true}},{"q":"what is the ticker of Kroger","expect":{"equals":"KR","notRefusal":true}},{"q":"what is the ticker of Huntington Ingalls Industries","expect":{"equals":"HII","notRefusal":true}},{"q":"give the stock symbol of Avery Dennison","expect":{"equals":"AVY","notRefusal":true}},{"q":"give the stock symbol of LyondellBasell","expect":{"equals":"LYB","notRefusal":true}},{"q":"give the stock symbol of Tyler Technologies","expect":{"equals":"TYL","notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
