// sp500-ticker-company-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"sp500-ticker-company-neo-g6","class":"sp500-ticker-company","generation":6,"lane":"neo","grownFrom":["name the S&P 500 company with the symbol PYPL","which company has the ticker ICE","what company trades as C","which company has the ticker CMI","which company has the ticker J","name the S&P 500 company with the symbol EVRG","name the S&P 500 company with the symbol TPR","what company trades as DDOG","what company trades as IRM","what company trades as GILD","name the S&P 500 company with the symbol DHR","which company has the ticker KO","which company has the ticker VTR","what company trades as TRMB","name the S&P 500 company with the symbol HWM","what company trades as VTRS","which company has the ticker META","name the S&P 500 company with the symbol LVS","name the S&P 500 company with the symbol SW","what company trades as V"],"version":1});

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
{"id":"n-5a62696a","guard":[["has","company"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker ICE":"The ticker ICE is Intercontinental Exchange.","name the S&P 500 company with the symbol PYPL":"The ticker PYPL is PayPal.","what company trades as C":"The ticker C is Citigroup.","which company has the ticker CMI":"The ticker CMI is Cummins.","which company has the ticker J":"The ticker J is Jacobs Solutions.","name the S&P 500 company with the symbol EVRG":"The ticker EVRG is Evergy.","name the S&P 500 company with the symbol TPR":"The ticker TPR is Tapestry, Inc..","what company trades as DDOG":"The ticker DDOG is Datadog.","what company trades as IRM":"The ticker IRM is Iron Mountain.","what company trades as GILD":"The ticker GILD is Gilead Sciences.","name the S&P 500 company with the symbol DHR":"The ticker DHR is Danaher Corporation.","which company has the ticker KO":"The ticker KO is Coca-Cola Company (The).","which company has the ticker VTR":"The ticker VTR is Ventas.","what company trades as TRMB":"The ticker TRMB is Trimble Inc..","name the S&P 500 company with the symbol HWM":"The ticker HWM is Howmet Aerospace.","what company trades as VTRS":"The ticker VTRS is Viatris.","which company has the ticker META":"The ticker META is Meta Platforms.","name the S&P 500 company with the symbol LVS":"The ticker LVS is Las Vegas Sands.","name the S&P 500 company with the symbol SW":"The ticker SW is Smurfit Westrock.","what company trades as V":"The ticker V is Visa Inc..","which company has the ticker VRSK":"The ticker VRSK is Verisk Analytics.","name the S&P 500 company with the symbol ODFL":"The ticker ODFL is Old Dominion.","name the S&P 500 company with the symbol CSX":"The ticker CSX is CSX Corporation.","what company trades as PPG":"The ticker PPG is PPG Industries.","which company has the ticker BR":"The ticker BR is Broadridge Financial Solutions.","name the S&P 500 company with the symbol INCY":"The ticker INCY is Incyte.","which company has the ticker MSFT":"The ticker MSFT is Microsoft.","name the S&P 500 company with the symbol FDXF":"The ticker FDXF is FedEx Freight.","name the S&P 500 company with the symbol WSM":"The ticker WSM is Williams-Sonoma, Inc..","which company has the ticker FSLR":"The ticker FSLR is First Solar.","what company trades as TFC":"The ticker TFC is Truist Financial.","what company trades as NFLX":"The ticker NFLX is Netflix.","which company has the ticker PNW":"The ticker PNW is Pinnacle West Capital.","what company trades as AWK":"The ticker AWK is American Water Works.","what company trades as BX":"The ticker BX is Blackstone Inc..","which company has the ticker WDC":"The ticker WDC is Western Digital.","which company has the ticker CCL":"The ticker CCL is Carnival Corporation.","what company trades as SPGI":"The ticker SPGI is S&P Global.","what company trades as EW":"The ticker EW is Edwards Lifesciences.","what company trades as AVY":"The ticker AVY is Avery Dennison.","name the S&P 500 company with the symbol NEE":"The ticker NEE is NextEra Energy.","name the S&P 500 company with the symbol PRU":"The ticker PRU is Prudential Financial.","what company trades as DOV":"The ticker DOV is Dover Corporation.","what company trades as AME":"The ticker AME is Ametek.","name the S&P 500 company with the symbol CEG":"The ticker CEG is Constellation Energy.","what company trades as DRI":"The ticker DRI is Darden Restaurants.","name the S&P 500 company with the symbol BRO":"The ticker BRO is Brown & Brown.","which company has the ticker TMUS":"The ticker TMUS is T-Mobile US.","what company trades as SYK":"The ticker SYK is Stryker Corporation.","which company has the ticker TRGP":"The ticker TRGP is Targa Resources.","what company trades as MMM":"The ticker MMM is 3M.","which company has the ticker AMZN":"The ticker AMZN is Amazon.","name the S&P 500 company with the symbol COO":"The ticker COO is Cooper Companies (The).","which company has the ticker CTSH":"The ticker CTSH is Cognizant.","name the S&P 500 company with the symbol WDAY":"The ticker WDAY is Workday, Inc..","which company has the ticker SNA":"The ticker SNA is Snap-on.","which company has the ticker RF":"The ticker RF is Regions Financial Corporation.","name the S&P 500 company with the symbol BEN":"The ticker BEN is Franklin Resources.","which company has the ticker ABT":"The ticker ABT is Abbott Laboratories.","name the S&P 500 company with the symbol PANW":"The ticker PANW is Palo Alto Networks.","what company trades as JNJ":"The ticker JNJ is Johnson & Johnson.","what company trades as OKE":"The ticker OKE is Oneok.","which company has the ticker HPQ":"The ticker HPQ is HP Inc..","which company has the ticker WEC":"The ticker WEC is WEC Energy Group.","name the S&P 500 company with the symbol XYZ":"The ticker XYZ is Block, Inc..","which company has the ticker WMB":"The ticker WMB is Williams Companies.","name the S&P 500 company with the symbol BF.B":"The ticker BF.B is Brown–Forman.","which company has the ticker CVX":"The ticker CVX is Chevron Corporation.","what company trades as IR":"The ticker IR is Ingersoll Rand.","name the S&P 500 company with the symbol MRNA":"The ticker MRNA is Moderna.","which company has the ticker FRT":"The ticker FRT is Federal Realty Investment Trust.","name the S&P 500 company with the symbol RDDT":"The ticker RDDT is Reddit.","what company trades as HAL":"The ticker HAL is Halliburton.","which company has the ticker DVA":"The ticker DVA is DaVita.","which company has the ticker LITE":"The ticker LITE is Lumentum.","what company trades as LOW":"The ticker LOW is Lowe's.","what company trades as GD":"The ticker GD is General Dynamics.","which company has the ticker CVS":"The ticker CVS is CVS Health.","what company trades as HAS":"The ticker HAS is Hasbro.","which company has the ticker PWR":"The ticker PWR is Quanta Services.","which company has the ticker HPE":"The ticker HPE is Hewlett Packard Enterprise.","name the S&P 500 company with the symbol NVDA":"The ticker NVDA is Nvidia.","which company has the ticker AIG":"The ticker AIG is American International Group.","what company trades as CASY":"The ticker CASY is Casey's.","which company has the ticker MPC":"The ticker MPC is Marathon Petroleum.","name the S&P 500 company with the symbol ADSK":"The ticker ADSK is Autodesk.","what company trades as CI":"The ticker CI is Cigna.","what company trades as BAX":"The ticker BAX is Baxter International.","name the S&P 500 company with the symbol CMCSA":"The ticker CMCSA is Comcast.","what company trades as JPM":"The ticker JPM is JPMorgan Chase.","name the S&P 500 company with the symbol NDSN":"The ticker NDSN is Nordson Corporation.","what company trades as CIEN":"The ticker CIEN is Ciena.","name the S&P 500 company with the symbol OXY":"The ticker OXY is Occidental Petroleum.","which company has the ticker BDX":"The ticker BDX is Becton Dickinson.","which company has the ticker GRMN":"The ticker GRMN is Garmin.","what company trades as TMO":"The ticker TMO is Thermo Fisher Scientific.","name the S&P 500 company with the symbol DIS":"The ticker DIS is Walt Disney Company (The).","name the S&P 500 company with the symbol COST":"The ticker COST is Costco.","name the S&P 500 company with the symbol MAR":"The ticker MAR is Marriott International."}}},
{"id":"n-8fb92206","guard":[["has","company"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"company"}]]],"mem":{"table":{"has the ticker ICE":"The ticker ICE is Intercontinental Exchange.","with the symbol PYPL":"The ticker PYPL is PayPal.","trades as C":"The ticker C is Citigroup.","has the ticker CMI":"The ticker CMI is Cummins.","has the ticker J":"The ticker J is Jacobs Solutions.","with the symbol EVRG":"The ticker EVRG is Evergy.","with the symbol TPR":"The ticker TPR is Tapestry, Inc..","trades as DDOG":"The ticker DDOG is Datadog.","trades as IRM":"The ticker IRM is Iron Mountain.","trades as GILD":"The ticker GILD is Gilead Sciences.","with the symbol DHR":"The ticker DHR is Danaher Corporation.","has the ticker KO":"The ticker KO is Coca-Cola Company (The).","has the ticker VTR":"The ticker VTR is Ventas.","trades as TRMB":"The ticker TRMB is Trimble Inc..","with the symbol HWM":"The ticker HWM is Howmet Aerospace.","trades as VTRS":"The ticker VTRS is Viatris.","has the ticker META":"The ticker META is Meta Platforms.","with the symbol LVS":"The ticker LVS is Las Vegas Sands.","with the symbol SW":"The ticker SW is Smurfit Westrock.","trades as V":"The ticker V is Visa Inc..","has the ticker VRSK":"The ticker VRSK is Verisk Analytics.","with the symbol ODFL":"The ticker ODFL is Old Dominion.","with the symbol CSX":"The ticker CSX is CSX Corporation.","trades as PPG":"The ticker PPG is PPG Industries.","has the ticker BR":"The ticker BR is Broadridge Financial Solutions.","with the symbol INCY":"The ticker INCY is Incyte.","has the ticker MSFT":"The ticker MSFT is Microsoft.","with the symbol FDXF":"The ticker FDXF is FedEx Freight.","with the symbol WSM":"The ticker WSM is Williams-Sonoma, Inc..","has the ticker FSLR":"The ticker FSLR is First Solar.","trades as TFC":"The ticker TFC is Truist Financial.","trades as NFLX":"The ticker NFLX is Netflix.","has the ticker PNW":"The ticker PNW is Pinnacle West Capital.","trades as AWK":"The ticker AWK is American Water Works.","trades as BX":"The ticker BX is Blackstone Inc..","has the ticker WDC":"The ticker WDC is Western Digital.","has the ticker CCL":"The ticker CCL is Carnival Corporation.","trades as SPGI":"The ticker SPGI is S&P Global.","trades as EW":"The ticker EW is Edwards Lifesciences.","trades as AVY":"The ticker AVY is Avery Dennison.","with the symbol NEE":"The ticker NEE is NextEra Energy.","with the symbol PRU":"The ticker PRU is Prudential Financial.","trades as DOV":"The ticker DOV is Dover Corporation.","trades as AME":"The ticker AME is Ametek.","with the symbol CEG":"The ticker CEG is Constellation Energy.","trades as DRI":"The ticker DRI is Darden Restaurants.","with the symbol BRO":"The ticker BRO is Brown & Brown.","has the ticker TMUS":"The ticker TMUS is T-Mobile US.","trades as SYK":"The ticker SYK is Stryker Corporation.","has the ticker TRGP":"The ticker TRGP is Targa Resources.","trades as MMM":"The ticker MMM is 3M.","has the ticker AMZN":"The ticker AMZN is Amazon.","with the symbol COO":"The ticker COO is Cooper Companies (The).","has the ticker CTSH":"The ticker CTSH is Cognizant.","with the symbol WDAY":"The ticker WDAY is Workday, Inc..","has the ticker SNA":"The ticker SNA is Snap-on.","has the ticker RF":"The ticker RF is Regions Financial Corporation.","with the symbol BEN":"The ticker BEN is Franklin Resources.","has the ticker ABT":"The ticker ABT is Abbott Laboratories.","with the symbol PANW":"The ticker PANW is Palo Alto Networks.","trades as JNJ":"The ticker JNJ is Johnson & Johnson.","trades as OKE":"The ticker OKE is Oneok.","has the ticker HPQ":"The ticker HPQ is HP Inc..","has the ticker WEC":"The ticker WEC is WEC Energy Group.","with the symbol XYZ":"The ticker XYZ is Block, Inc..","has the ticker WMB":"The ticker WMB is Williams Companies.","with the symbol BF.B":"The ticker BF.B is Brown–Forman.","has the ticker CVX":"The ticker CVX is Chevron Corporation.","trades as IR":"The ticker IR is Ingersoll Rand.","with the symbol MRNA":"The ticker MRNA is Moderna.","has the ticker FRT":"The ticker FRT is Federal Realty Investment Trust.","with the symbol RDDT":"The ticker RDDT is Reddit.","trades as HAL":"The ticker HAL is Halliburton.","has the ticker DVA":"The ticker DVA is DaVita.","has the ticker LITE":"The ticker LITE is Lumentum.","trades as LOW":"The ticker LOW is Lowe's.","trades as GD":"The ticker GD is General Dynamics.","has the ticker CVS":"The ticker CVS is CVS Health.","trades as HAS":"The ticker HAS is Hasbro.","has the ticker PWR":"The ticker PWR is Quanta Services.","has the ticker HPE":"The ticker HPE is Hewlett Packard Enterprise.","with the symbol NVDA":"The ticker NVDA is Nvidia.","has the ticker AIG":"The ticker AIG is American International Group.","trades as CASY":"The ticker CASY is Casey's.","has the ticker MPC":"The ticker MPC is Marathon Petroleum.","with the symbol ADSK":"The ticker ADSK is Autodesk.","trades as CI":"The ticker CI is Cigna.","trades as BAX":"The ticker BAX is Baxter International.","with the symbol CMCSA":"The ticker CMCSA is Comcast.","trades as JPM":"The ticker JPM is JPMorgan Chase.","with the symbol NDSN":"The ticker NDSN is Nordson Corporation.","trades as CIEN":"The ticker CIEN is Ciena.","with the symbol OXY":"The ticker OXY is Occidental Petroleum.","has the ticker BDX":"The ticker BDX is Becton Dickinson.","has the ticker GRMN":"The ticker GRMN is Garmin.","trades as TMO":"The ticker TMO is Thermo Fisher Scientific.","with the symbol DIS":"The ticker DIS is Walt Disney Company (The).","with the symbol COST":"The ticker COST is Costco.","with the symbol MAR":"The ticker MAR is Marriott International."}}},
{"id":"n-68cddbe2","guard":[["has","company"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker ICE":"The ticker ICE is Intercontinental Exchange.","what company trades as C":"The ticker C is Citigroup.","which company has the ticker CMI":"The ticker CMI is Cummins.","which company has the ticker J":"The ticker J is Jacobs Solutions.","what company trades as DDOG":"The ticker DDOG is Datadog.","what company trades as IRM":"The ticker IRM is Iron Mountain.","what company trades as GILD":"The ticker GILD is Gilead Sciences.","which company has the ticker KO":"The ticker KO is Coca-Cola Company (The).","which company has the ticker VTR":"The ticker VTR is Ventas.","what company trades as TRMB":"The ticker TRMB is Trimble Inc..","what company trades as VTRS":"The ticker VTRS is Viatris.","which company has the ticker META":"The ticker META is Meta Platforms.","what company trades as V":"The ticker V is Visa Inc..","which company has the ticker VRSK":"The ticker VRSK is Verisk Analytics.","what company trades as PPG":"The ticker PPG is PPG Industries.","which company has the ticker BR":"The ticker BR is Broadridge Financial Solutions.","which company has the ticker MSFT":"The ticker MSFT is Microsoft.","which company has the ticker FSLR":"The ticker FSLR is First Solar.","what company trades as TFC":"The ticker TFC is Truist Financial.","what company trades as NFLX":"The ticker NFLX is Netflix.","which company has the ticker PNW":"The ticker PNW is Pinnacle West Capital.","what company trades as AWK":"The ticker AWK is American Water Works.","what company trades as BX":"The ticker BX is Blackstone Inc..","which company has the ticker WDC":"The ticker WDC is Western Digital.","which company has the ticker CCL":"The ticker CCL is Carnival Corporation.","what company trades as SPGI":"The ticker SPGI is S&P Global.","what company trades as EW":"The ticker EW is Edwards Lifesciences.","what company trades as AVY":"The ticker AVY is Avery Dennison.","what company trades as DOV":"The ticker DOV is Dover Corporation.","what company trades as AME":"The ticker AME is Ametek.","what company trades as DRI":"The ticker DRI is Darden Restaurants.","which company has the ticker TMUS":"The ticker TMUS is T-Mobile US.","what company trades as SYK":"The ticker SYK is Stryker Corporation.","which company has the ticker TRGP":"The ticker TRGP is Targa Resources.","what company trades as MMM":"The ticker MMM is 3M.","which company has the ticker AMZN":"The ticker AMZN is Amazon.","which company has the ticker CTSH":"The ticker CTSH is Cognizant.","which company has the ticker SNA":"The ticker SNA is Snap-on.","which company has the ticker RF":"The ticker RF is Regions Financial Corporation.","which company has the ticker ABT":"The ticker ABT is Abbott Laboratories.","what company trades as JNJ":"The ticker JNJ is Johnson & Johnson.","what company trades as OKE":"The ticker OKE is Oneok.","which company has the ticker HPQ":"The ticker HPQ is HP Inc..","which company has the ticker WEC":"The ticker WEC is WEC Energy Group.","which company has the ticker WMB":"The ticker WMB is Williams Companies.","which company has the ticker CVX":"The ticker CVX is Chevron Corporation.","what company trades as IR":"The ticker IR is Ingersoll Rand.","which company has the ticker FRT":"The ticker FRT is Federal Realty Investment Trust.","what company trades as HAL":"The ticker HAL is Halliburton.","which company has the ticker DVA":"The ticker DVA is DaVita.","which company has the ticker LITE":"The ticker LITE is Lumentum.","what company trades as LOW":"The ticker LOW is Lowe's.","what company trades as GD":"The ticker GD is General Dynamics.","which company has the ticker CVS":"The ticker CVS is CVS Health.","what company trades as HAS":"The ticker HAS is Hasbro.","which company has the ticker PWR":"The ticker PWR is Quanta Services.","which company has the ticker HPE":"The ticker HPE is Hewlett Packard Enterprise.","which company has the ticker AIG":"The ticker AIG is American International Group.","what company trades as CASY":"The ticker CASY is Casey's.","which company has the ticker MPC":"The ticker MPC is Marathon Petroleum.","what company trades as CI":"The ticker CI is Cigna.","what company trades as BAX":"The ticker BAX is Baxter International.","what company trades as JPM":"The ticker JPM is JPMorgan Chase.","what company trades as CIEN":"The ticker CIEN is Ciena.","which company has the ticker BDX":"The ticker BDX is Becton Dickinson.","which company has the ticker GRMN":"The ticker GRMN is Garmin.","what company trades as TMO":"The ticker TMO is Thermo Fisher Scientific."}}},
{"id":"n-04f6aded","guard":[["has","fslr"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is First Solar."]},["sense.lastWord"]],"mem":null},
{"id":"n-051837c3","guard":[["hasAny",["ame","company","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as AME":"The ticker AME is Ametek."}}},
{"id":"n-0762f734","guard":[["hasAny",["company","cvx","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker CVX":"The ticker CVX is Chevron Corporation."}}},
{"id":"n-09186848","guard":[["has","ice"],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Intercontinental Exchange."]},["sense.lastWord"]],"mem":null},
{"id":"n-095abf60","guard":[["hasAny",["bdx","company","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker BDX":"The ticker BDX is Becton Dickinson."}}},
{"id":"n-0abe1090","guard":[["has","cien"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as CIEN":"The ticker CIEN is Ciena."}}},
{"id":"n-0b17dc6f","guard":[["has","dov"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dover Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-0bb44930","guard":[["has","aig"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is American International Group."]},["sense.lastWord"]],"mem":null},
{"id":"n-0d55ee9f","guard":[["has","tmo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as TMO":"The ticker TMO is Thermo Fisher Scientific."}}},
{"id":"n-0ea87e98","guard":[["hasAny",["company","gild","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as GILD":"The ticker GILD is Gilead Sciences."}}},
{"id":"n-0fd6922c","guard":[["has","ko"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker KO":"The ticker KO is Coca-Cola Company (The)."}}},
{"id":"n-10d0af3c","guard":[["has","pypl"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is PayPal."]},["sense.lastWord"]],"mem":null},
{"id":"n-10d66e2c","guard":[["has","abt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker ABT":"The ticker ABT is Abbott Laboratories."}}},
{"id":"n-118ba5d4","guard":[["hasAny",["company","irm","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as IRM":"The ticker IRM is Iron Mountain."}}},
{"id":"n-122a54b3","guard":[["has","ceg"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Constellation Energy."]},["sense.lastWord"]],"mem":null},
{"id":"n-13a576de","guard":[["has","ppg"],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is PPG Industries."]},["sense.lastWord"]],"mem":null},
{"id":"n-1516cbd4","guard":[["hasAny",["cmi","company","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker CMI":"The ticker CMI is Cummins."}}},
{"id":"n-15a5fd1c","guard":[["has","hal"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Halliburton."]},["sense.lastWord"]],"mem":null},
{"id":"n-17da6faa","guard":[["hasAny",["company","cost","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol COST":"The ticker COST is Costco."}}},
{"id":"n-1819d7e1","guard":[["hasAny",["company","hal","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as HAL":"The ticker HAL is Halliburton."}}},
{"id":"n-18a3111f","guard":[["hasAny",["company","has","ticker","trgp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker TRGP":"The ticker TRGP is Targa Resources."}}},
{"id":"n-1af1e5e0","guard":[["hasAny",["company","has","msft","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker MSFT":"The ticker MSFT is Microsoft."}}},
{"id":"n-1b4f2f61","guard":[["has","awk"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is American Water Works."]},["sense.lastWord"]],"mem":null},
{"id":"n-1b6221ff","guard":[["hasAny",["company","has","pwr","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker PWR":"The ticker PWR is Quanta Services."}}},
{"id":"n-1c69192f","guard":[["has","spgi"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is S&P Global."]},["sense.lastWord"]],"mem":null},
{"id":"n-1d4ae5f5","guard":[["has","wday"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Workday, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-1e74ec27","guard":[["has","lite"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker LITE":"The ticker LITE is Lumentum."}}},
{"id":"n-1e9752dc","guard":[["has","jpm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as JPM":"The ticker JPM is JPMorgan Chase."}}},
{"id":"n-1f41a33c","guard":[["hasAny",["casy","company","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as CASY":"The ticker CASY is Casey's."}}},
{"id":"n-1fa61d8b","guard":[["has","pwr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker PWR":"The ticker PWR is Quanta Services."}}},
{"id":"n-206b1089","guard":[["hasAny",["company","name","nvda","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol NVDA":"The ticker NVDA is Nvidia."}}},
{"id":"n-20d381a6","guard":[["hasAny",["company","dri","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as DRI":"The ticker DRI is Darden Restaurants."}}},
{"id":"n-2169ccd4","guard":[["hasAny",["company","trades","vtrs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as VTRS":"The ticker VTRS is Viatris."}}},
{"id":"n-21a46cec","guard":[["has","j"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker J":"The ticker J is Jacobs Solutions."}}},
{"id":"n-224a0357","guard":[["has","oxy"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Occidental Petroleum."]},["sense.lastWord"]],"mem":null},
{"id":"n-2587f155","guard":[["has","panw"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Palo Alto Networks."]},["sense.lastWord"]],"mem":null},
{"id":"n-2607c191","guard":[["has","ew"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as EW":"The ticker EW is Edwards Lifesciences."}}},
{"id":"n-27e63815","guard":[["hasAny",["company","nflx","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as NFLX":"The ticker NFLX is Netflix."}}},
{"id":"n-27f4b093","guard":[["hasAny",["company","evrg","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol EVRG":"The ticker EVRG is Evergy."}}},
{"id":"n-281b56b5","guard":[["has","msft"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker MSFT":"The ticker MSFT is Microsoft."}}},
{"id":"n-288da5ab","guard":[["hasAny",["company","has","hpq","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker HPQ":"The ticker HPQ is HP Inc.."}}},
{"id":"n-28df0f20","guard":[["has","bfb"]],"pyramid":["render.template",{"lit":["The ticker BF.",{"slot":0}," is Brown–Forman."]},["sense.lastWord"]],"mem":null},
{"id":"n-292d0679","guard":[["hasAny",["company","dhr","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol DHR":"The ticker DHR is Danaher Corporation."}}},
{"id":"n-29ea7f10","guard":[["hasAny",["company","gd","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as GD":"The ticker GD is General Dynamics."}}},
{"id":"n-2a47ff39","guard":[["has","j"],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Jacobs Solutions."]},["sense.lastWord"]],"mem":null},
{"id":"n-2c650469","guard":[["hasAny",["company","tfc","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as TFC":"The ticker TFC is Truist Financial."}}},
{"id":"n-2d240545","guard":[["has","tpr"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Tapestry, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-2e95b94c","guard":[["has","trgp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker TRGP":"The ticker TRGP is Targa Resources."}}},
{"id":"n-2ead94f5","guard":[["hasAny",["abt","company","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker ABT":"The ticker ABT is Abbott Laboratories."}}},
{"id":"n-2f12b3ca","guard":[["hasAny",["company","has","pnw","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker PNW":"The ticker PNW is Pinnacle West Capital."}}},
{"id":"n-31982f17","guard":[["hasAny",["company","has","mpc","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker MPC":"The ticker MPC is Marathon Petroleum."}}},
{"id":"n-31d39c8d","guard":[["hasAny",["company","dva","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker DVA":"The ticker DVA is DaVita."}}},
{"id":"n-31e39a5e","guard":[["has","cvx"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Chevron Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-33255594","guard":[["hasAny",["aig","company","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker AIG":"The ticker AIG is American International Group."}}},
{"id":"n-338edd36","guard":[["has","tfc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as TFC":"The ticker TFC is Truist Financial."}}},
{"id":"n-33dab759","guard":[["has","frt"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Federal Realty Investment Trust."]},["sense.lastWord"]],"mem":null},
{"id":"n-34cef9d6","guard":[["has","ci"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as CI":"The ticker CI is Cigna."}}},
{"id":"n-34ee4cc5","guard":[["has","vrsk"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Verisk Analytics."]},["sense.lastWord"]],"mem":null},
{"id":"n-36deb870","guard":[["hasAny",["ccl","company","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker CCL":"The ticker CCL is Carnival Corporation."}}},
{"id":"n-378895b9","guard":[["has","nvda"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nvidia."]},["sense.lastWord"]],"mem":null},
{"id":"n-3790f479","guard":[["has","ew"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Edwards Lifesciences."]},["sense.lastWord"]],"mem":null},
{"id":"n-382f688d","guard":[["has","tmo"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Thermo Fisher Scientific."]},["sense.lastWord"]],"mem":null},
{"id":"n-384bb0d6","guard":[["has","gild"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilead Sciences."]},["sense.lastWord"]],"mem":null},
{"id":"n-39d1e15e","guard":[["hasAny",["company","name","sp","symbol","wsm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol WSM":"The ticker WSM is Williams-Sonoma, Inc.."}}},
{"id":"n-39eae997","guard":[["has","syk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as SYK":"The ticker SYK is Stryker Corporation."}}},
{"id":"n-3a018a60","guard":[["has","amzn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker AMZN":"The ticker AMZN is Amazon."}}},
{"id":"n-3c3edd90","guard":[["has","fdxf"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is FedEx Freight."]},["sense.lastWord"]],"mem":null},
{"id":"n-3d405105","guard":[["has","mpc"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Marathon Petroleum."]},["sense.lastWord"]],"mem":null},
{"id":"n-3f608b6b","guard":[["has","wmb"],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Williams Companies."]},["sense.lastWord"]],"mem":null},
{"id":"n-3f9e9e48","guard":[["hasAny",["bax","company","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as BAX":"The ticker BAX is Baxter International."}}},
{"id":"n-43d78c15","guard":[["hasAny",["cmcsa","company","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol CMCSA":"The ticker CMCSA is Comcast."}}},
{"id":"n-4401bb4b","guard":[["has","wdc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker WDC":"The ticker WDC is Western Digital."}}},
{"id":"n-4530aa90","guard":[["hasAny",["awk","company","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as AWK":"The ticker AWK is American Water Works."}}},
{"id":"n-46ac07f4","guard":[["has","rf"],["has","which"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Regions Financial Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-47b9f053","guard":[["has","amzn"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Amazon."]},["sense.lastWord"]],"mem":null},
{"id":"n-47bddb65","guard":[["has","abt"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Abbott Laboratories."]},["sense.lastWord"]],"mem":null},
{"id":"n-48545410","guard":[["hasAny",["company","ctsh","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker CTSH":"The ticker CTSH is Cognizant."}}},
{"id":"n-4a26ca11","guard":[["has","ccl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker CCL":"The ticker CCL is Carnival Corporation."}}},
{"id":"n-4b133257","guard":[["has","wdc"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Western Digital."]},["sense.lastWord"]],"mem":null},
{"id":"n-4c7f6ddf","guard":[["has","tmus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker TMUS":"The ticker TMUS is T-Mobile US."}}},
{"id":"n-4cba8d59","guard":[["has","ctsh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker CTSH":"The ticker CTSH is Cognizant."}}},
{"id":"n-4fcc1780","guard":[["hasAny",["company","syk","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as SYK":"The ticker SYK is Stryker Corporation."}}},
{"id":"n-5038fda9","guard":[["has","jpm"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is JPMorgan Chase."]},["sense.lastWord"]],"mem":null},
{"id":"n-50930577","guard":[["has","br"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker BR":"The ticker BR is Broadridge Financial Solutions."}}},
{"id":"n-5176a3b5","guard":[["has","mpc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker MPC":"The ticker MPC is Marathon Petroleum."}}},
{"id":"n-51eef27f","guard":[["has","br"],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Broadridge Financial Solutions."]},["sense.lastWord"]],"mem":null},
{"id":"n-52abde5e","guard":[["has","bax"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as BAX":"The ticker BAX is Baxter International."}}},
{"id":"n-5467c433","guard":[["has","ir"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as IR":"The ticker IR is Ingersoll Rand."}}},
{"id":"n-5537fe4c","guard":[["has","nflx"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Netflix."]},["sense.lastWord"]],"mem":null},
{"id":"n-5652d4e0","guard":[["has","wmb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker WMB":"The ticker WMB is Williams Companies."}}},
{"id":"n-56842b9c","guard":[["hasAny",["company","incy","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol INCY":"The ticker INCY is Incyte."}}},
{"id":"n-57d74bd4","guard":[["has","sna"],["has","which"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Snap-on."]},["sense.lastWord"]],"mem":null},
{"id":"n-58222f36","guard":[["has","nee"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is NextEra Energy."]},["sense.lastWord"]],"mem":null},
{"id":"n-5a89716e","guard":[["has","bdx"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Becton Dickinson."]},["sense.lastWord"]],"mem":null},
{"id":"n-5daa452f","guard":[["hasAny",["company","jnj","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as JNJ":"The ticker JNJ is Johnson & Johnson."}}},
{"id":"n-5e893af0","guard":[["hasAny",["company","dov","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as DOV":"The ticker DOV is Dover Corporation."}}},
{"id":"n-5f08613d","guard":[["has","vtr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker VTR":"The ticker VTR is Ventas."}}},
{"id":"n-60558b7e","guard":[["has","cien"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ciena."]},["sense.lastWord"]],"mem":null},
{"id":"n-60be6356","guard":[["hasAny",["bx","company","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as BX":"The ticker BX is Blackstone Inc.."}}},
{"id":"n-620f1b84","guard":[["has","hpq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker HPQ":"The ticker HPQ is HP Inc.."}}},
{"id":"n-6254593c","guard":[["hasAny",["company","has","ticker","vtr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker VTR":"The ticker VTR is Ventas."}}},
{"id":"n-63153a7f","guard":[["hasAny",["company","has","j","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker J":"The ticker J is Jacobs Solutions."}}},
{"id":"n-63327fb3","guard":[["hasAny",["company","name","ndsn","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol NDSN":"The ticker NDSN is Nordson Corporation."}}},
{"id":"n-64486b08","guard":[["has","tfc"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Truist Financial."]},["sense.lastWord"]],"mem":null},
{"id":"n-645f4b6a","guard":[["has","dis"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Walt Disney Company (The)."]},["sense.lastWord"]],"mem":null},
{"id":"n-65123030","guard":[["has","avy"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Avery Dennison."]},["sense.lastWord"]],"mem":null},
{"id":"n-6591d664","guard":[["has","cmi"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cummins."]},["sense.lastWord"]],"mem":null},
{"id":"n-65d08e4e","guard":[["has","has"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as HAS":"The ticker HAS is Hasbro."}}},
{"id":"n-67dc9d0e","guard":[["has","avy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as AVY":"The ticker AVY is Avery Dennison."}}},
{"id":"n-686b2fc5","guard":[["hasAny",["company","has","lite","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker LITE":"The ticker LITE is Lumentum."}}},
{"id":"n-68b5946f","guard":[["hasAny",["company","has","hpe","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker HPE":"The ticker HPE is Hewlett Packard Enterprise."}}},
{"id":"n-6aa0fb5c","guard":[["has","rddt"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Reddit."]},["sense.lastWord"]],"mem":null},
{"id":"n-6ac00c54","guard":[["hasAny",["company","fslr","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker FSLR":"The ticker FSLR is First Solar."}}},
{"id":"n-6b5142ec","guard":[["hasAny",["company","name","odfl","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol ODFL":"The ticker ODFL is Old Dominion."}}},
{"id":"n-6c9262e4","guard":[["has","casy"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Casey's."]},["sense.lastWord"]],"mem":null},
{"id":"n-6f0b5739","guard":[["has","aig"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker AIG":"The ticker AIG is American International Group."}}},
{"id":"n-6ffa9cbf","guard":[["hasAny",["company","tmo","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as TMO":"The ticker TMO is Thermo Fisher Scientific."}}},
{"id":"n-71235249","guard":[["hasAny",["bfb","company","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol BF.B":"The ticker BF.B is Brown–Forman."}}},
{"id":"n-71abc02f","guard":[["has","vrsk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker VRSK":"The ticker VRSK is Verisk Analytics."}}},
{"id":"n-7247a30c","guard":[["hasAny",["company","has","sna","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker SNA":"The ticker SNA is Snap-on."}}},
{"id":"n-783cba42","guard":[["has","hpe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker HPE":"The ticker HPE is Hewlett Packard Enterprise."}}},
{"id":"n-7a2436d9","guard":[["hasAny",["company","dis","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol DIS":"The ticker DIS is Walt Disney Company (The)."}}},
{"id":"n-7add427a","guard":[["has","ppg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as PPG":"The ticker PPG is PPG Industries."}}},
{"id":"n-7c614216","guard":[["hasAny",["bro","company","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol BRO":"The ticker BRO is Brown & Brown."}}},
{"id":"n-7edd38a6","guard":[["has","dri"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Darden Restaurants."]},["sense.lastWord"]],"mem":null},
{"id":"n-80692774","guard":[["has","bax"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Baxter International."]},["sense.lastWord"]],"mem":null},
{"id":"n-818ec308","guard":[["has","hwm"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Howmet Aerospace."]},["sense.lastWord"]],"mem":null},
{"id":"n-81d07a5d","guard":[["has","low"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as LOW":"The ticker LOW is Lowe's."}}},
{"id":"n-81fb541c","guard":[["has","gild"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as GILD":"The ticker GILD is Gilead Sciences."}}},
{"id":"n-8225798a","guard":[["hasAny",["company","has","ticker","wec"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker WEC":"The ticker WEC is WEC Energy Group."}}},
{"id":"n-82d97afe","guard":[["hasAny",["company","frt","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker FRT":"The ticker FRT is Federal Realty Investment Trust."}}},
{"id":"n-839d56cb","guard":[["hasAny",["company","has","ticker","vrsk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker VRSK":"The ticker VRSK is Verisk Analytics."}}},
{"id":"n-85d4e77d","guard":[["has","c"],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Citigroup."]},["sense.lastWord"]],"mem":null},
{"id":"n-85e81035","guard":[["hasAny",["ben","company","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol BEN":"The ticker BEN is Franklin Resources."}}},
{"id":"n-85fb1f1a","guard":[["hasAny",["company","has","ticker","wdc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker WDC":"The ticker WDC is Western Digital."}}},
{"id":"n-8825b1e1","guard":[["has","irm"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Iron Mountain."]},["sense.lastWord"]],"mem":null},
{"id":"n-8933749f","guard":[["hasAny",["company","jpm","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as JPM":"The ticker JPM is JPMorgan Chase."}}},
{"id":"n-8a0580b6","guard":[["has","grmn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker GRMN":"The ticker GRMN is Garmin."}}},
{"id":"n-8a844a1f","guard":[["hasAny",["company","has","ticker","wmb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker WMB":"The ticker WMB is Williams Companies."}}},
{"id":"n-8d02e811","guard":[["hasAny",["company","name","pru","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol PRU":"The ticker PRU is Prudential Financial."}}},
{"id":"n-8e5b6f44","guard":[["hasAny",["company","name","nee","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol NEE":"The ticker NEE is NextEra Energy."}}},
{"id":"n-8f02da6c","guard":[["has","dri"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as DRI":"The ticker DRI is Darden Restaurants."}}},
{"id":"n-922286c9","guard":[["has","sw"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Smurfit Westrock."]},["sense.lastWord"]],"mem":null},
{"id":"n-92d4a19c","guard":[["has","hpe"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Hewlett Packard Enterprise."]},["sense.lastWord"]],"mem":null},
{"id":"n-93bd3f99","guard":[["has","lvs"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Las Vegas Sands."]},["sense.lastWord"]],"mem":null},
{"id":"n-93e9d6cf","guard":[["has","ir"],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ingersoll Rand."]},["sense.lastWord"]],"mem":null},
{"id":"n-9449931f","guard":[["has","msft"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Microsoft."]},["sense.lastWord"]],"mem":null},
{"id":"n-947875cd","guard":[["has","trgp"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Targa Resources."]},["sense.lastWord"]],"mem":null},
{"id":"n-94bbbae6","guard":[["has","ko"],["has","which"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Coca-Cola Company (The)."]},["sense.lastWord"]],"mem":null},
{"id":"n-95a1b3b0","guard":[["hasAny",["company","ew","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as EW":"The ticker EW is Edwards Lifesciences."}}},
{"id":"n-96d158a7","guard":[["hasAny",["company","ir","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as IR":"The ticker IR is Ingersoll Rand."}}},
{"id":"n-97d4a4d6","guard":[["has","dva"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DaVita."]},["sense.lastWord"]],"mem":null},
{"id":"n-997dc315","guard":[["has","irm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as IRM":"The ticker IRM is Iron Mountain."}}},
{"id":"n-99f7a50a","guard":[["hasAny",["company","low","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as LOW":"The ticker LOW is Lowe's."}}},
{"id":"n-9a196764","guard":[["hasAny",["cien","company","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as CIEN":"The ticker CIEN is Ciena."}}},
{"id":"n-9a472f39","guard":[["has","gd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as GD":"The ticker GD is General Dynamics."}}},
{"id":"n-9ada09fe","guard":[["has","ci"],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cigna."]},["sense.lastWord"]],"mem":null},
{"id":"n-9aea9fb0","guard":[["has","low"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Lowe's."]},["sense.lastWord"]],"mem":null},
{"id":"n-9c8e79a1","guard":[["has","mmm"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is 3M."]},["sense.lastWord"]],"mem":null},
{"id":"n-9ca3c7ba","guard":[["has","hpq"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HP Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-9ccbfd10","guard":[["has","bdx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker BDX":"The ticker BDX is Becton Dickinson."}}},
{"id":"n-9dd4d79e","guard":[["has","jnj"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Johnson & Johnson."]},["sense.lastWord"]],"mem":null},
{"id":"n-9f3f0f6a","guard":[["has","ndsn"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nordson Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-a07a44ae","guard":[["hasAny",["company","grmn","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker GRMN":"The ticker GRMN is Garmin."}}},
{"id":"n-a2c223f1","guard":[["hasAny",["company","name","oxy","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol OXY":"The ticker OXY is Occidental Petroleum."}}},
{"id":"n-a36905b9","guard":[["has","pnw"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Pinnacle West Capital."]},["sense.lastWord"]],"mem":null},
{"id":"n-a3afa390","guard":[["has","wsm"],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Williams-Sonoma, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-a4eeb860","guard":[["has","coo"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cooper Companies (The)."]},["sense.lastWord"]],"mem":null},
{"id":"n-a522fb4c","guard":[["has","pwr"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Quanta Services."]},["sense.lastWord"]],"mem":null},
{"id":"n-a5d69a60","guard":[["has","cost"],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Costco."]},["sense.lastWord"]],"mem":null},
{"id":"n-a5e67bd2","guard":[["hasAny",["company","has","rf","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker RF":"The ticker RF is Regions Financial Corporation."}}},
{"id":"n-a618abe3","guard":[["has","grmn"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Garmin."]},["sense.lastWord"]],"mem":null},
{"id":"n-a6380ef6","guard":[["has","meta"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker META":"The ticker META is Meta Platforms."}}},
{"id":"n-a7f1428c","guard":[["has","bx"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Blackstone Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-a870e276","guard":[["has","bro"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Brown & Brown."]},["sense.lastWord"]],"mem":null},
{"id":"n-a9264a93","guard":[["has","cvs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker CVS":"The ticker CVS is CVS Health."}}},
{"id":"n-ace7ffb8","guard":[["hasAny",["company","hwm","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol HWM":"The ticker HWM is Howmet Aerospace."}}},
{"id":"n-ae9cfe6e","guard":[["hasAny",["company","name","sp","symbol","tpr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol TPR":"The ticker TPR is Tapestry, Inc.."}}},
{"id":"n-af9f243b","guard":[["has","ccl"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Carnival Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-afc89bea","guard":[["hasAny",["company","trades","trmb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as TRMB":"The ticker TRMB is Trimble Inc.."}}},
{"id":"n-b02d8000","guard":[["hasAny",["company","name","sp","symbol","xyz"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol XYZ":"The ticker XYZ is Block, Inc.."}}},
{"id":"n-b063c5d1","guard":[["has","lite"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Lumentum."]},["sense.lastWord"]],"mem":null},
{"id":"n-b15ccbe0","guard":[["has","syk"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Stryker Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-b211b88c","guard":[["has","ame"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as AME":"The ticker AME is Ametek."}}},
{"id":"n-b2bcef73","guard":[["has","oke"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Oneok."]},["sense.lastWord"]],"mem":null},
{"id":"n-b2fe24d2","guard":[["hasAny",["company","name","panw","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol PANW":"The ticker PANW is Palo Alto Networks."}}},
{"id":"n-b38e6f86","guard":[["has","mar"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Marriott International."]},["sense.lastWord"]],"mem":null},
{"id":"n-b47adb4a","guard":[["has","trmb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as TRMB":"The ticker TRMB is Trimble Inc.."}}},
{"id":"n-b4d60622","guard":[["hasAny",["company","cvs","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker CVS":"The ticker CVS is CVS Health."}}},
{"id":"n-b8055b31","guard":[["has","xyz"],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Block, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-b8da822e","guard":[["has","gd"],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is General Dynamics."]},["sense.lastWord"]],"mem":null},
{"id":"n-b9987c37","guard":[["hasAny",["company","coo","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol COO":"The ticker COO is Cooper Companies (The)."}}},
{"id":"n-b9f40c4b","guard":[["hasAny",["company","has","ice","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker ICE":"The ticker ICE is Intercontinental Exchange."}}},
{"id":"n-ba721452","guard":[["has","odfl"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Old Dominion."]},["sense.lastWord"]],"mem":null},
{"id":"n-bb823ab2","guard":[["has","frt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker FRT":"The ticker FRT is Federal Realty Investment Trust."}}},
{"id":"n-bb9cf564","guard":[["hasAny",["c","company","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as C":"The ticker C is Citigroup."}}},
{"id":"n-bd2d1670","guard":[["hasAny",["company","has","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as HAS":"The ticker HAS is Hasbro."}}},
{"id":"n-bd54552e","guard":[["has","dva"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker DVA":"The ticker DVA is DaVita."}}},
{"id":"n-be49befd","guard":[["has","sna"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker SNA":"The ticker SNA is Snap-on."}}},
{"id":"n-c104f4f9","guard":[["hasAny",["amzn","company","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker AMZN":"The ticker AMZN is Amazon."}}},
{"id":"n-c21e21b6","guard":[["has","v"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as V":"The ticker V is Visa Inc.."}}},
{"id":"n-c266ce15","guard":[["has","jnj"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as JNJ":"The ticker JNJ is Johnson & Johnson."}}},
{"id":"n-c2ae40b9","guard":[["hasAny",["ceg","company","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol CEG":"The ticker CEG is Constellation Energy."}}},
{"id":"n-c303a352","guard":[["hasAny",["company","mmm","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as MMM":"The ticker MMM is 3M."}}},
{"id":"n-c30827da","guard":[["hasAny",["company","csx","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol CSX":"The ticker CSX is CSX Corporation."}}},
{"id":"n-c3e8f5b8","guard":[["hasAny",["company","lvs","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol LVS":"The ticker LVS is Las Vegas Sands."}}},
{"id":"n-c6a035f0","guard":[["hasAny",["company","ppg","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as PPG":"The ticker PPG is PPG Industries."}}},
{"id":"n-c6c41d42","guard":[["has","cmi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker CMI":"The ticker CMI is Cummins."}}},
{"id":"n-c822c6cf","guard":[["has","adsk"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Autodesk."]},["sense.lastWord"]],"mem":null},
{"id":"n-ca88734b","guard":[["hasAny",["br","company","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker BR":"The ticker BR is Broadridge Financial Solutions."}}},
{"id":"n-cefca3b4","guard":[["hasAny",["company","name","sp","sw","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol SW":"The ticker SW is Smurfit Westrock."}}},
{"id":"n-d1c479a2","guard":[["hasAny",["adsk","company","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol ADSK":"The ticker ADSK is Autodesk."}}},
{"id":"n-d34c5113","guard":[["has","csx"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CSX Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-d4db3289","guard":[["has","vtr"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ventas."]},["sense.lastWord"]],"mem":null},
{"id":"n-d61d81aa","guard":[["has","cmcsa"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Comcast."]},["sense.lastWord"]],"mem":null},
{"id":"n-d6c7876d","guard":[["has","fslr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker FSLR":"The ticker FSLR is First Solar."}}},
{"id":"n-d6cfd626","guard":[["hasAny",["company","name","rddt","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol RDDT":"The ticker RDDT is Reddit."}}},
{"id":"n-d7c719b1","guard":[["has","evrg"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Evergy."]},["sense.lastWord"]],"mem":null},
{"id":"n-d8fdf0b3","guard":[["hasAny",["company","spgi","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as SPGI":"The ticker SPGI is S&P Global."}}},
{"id":"n-d9ac8a45","guard":[["hasAny",["company","has","ticker","tmus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker TMUS":"The ticker TMUS is T-Mobile US."}}},
{"id":"n-d9d034bc","guard":[["has","oke"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as OKE":"The ticker OKE is Oneok."}}},
{"id":"n-dacebf75","guard":[["has","pru"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Prudential Financial."]},["sense.lastWord"]],"mem":null},
{"id":"n-dd32894f","guard":[["has","c"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as C":"The ticker C is Citigroup."}}},
{"id":"n-df2950e9","guard":[["hasAny",["company","oke","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as OKE":"The ticker OKE is Oneok."}}},
{"id":"n-e12c9e14","guard":[["has","bx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as BX":"The ticker BX is Blackstone Inc.."}}},
{"id":"n-e3d61f58","guard":[["has","nflx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as NFLX":"The ticker NFLX is Netflix."}}},
{"id":"n-e411acb8","guard":[["hasAny",["company","has","meta","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker META":"The ticker META is Meta Platforms."}}},
{"id":"n-e4a57690","guard":[["has","awk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as AWK":"The ticker AWK is American Water Works."}}},
{"id":"n-e5be330e","guard":[["hasAny",["ci","company","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as CI":"The ticker CI is Cigna."}}},
{"id":"n-e6b778d8","guard":[["has","ddog"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Datadog."]},["sense.lastWord"]],"mem":null},
{"id":"n-ea89049c","guard":[["has","dhr"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Danaher Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-ea8e9e0d","guard":[["has","wec"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker WEC":"The ticker WEC is WEC Energy Group."}}},
{"id":"n-eab2b07b","guard":[["hasAny",["company","fdxf","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol FDXF":"The ticker FDXF is FedEx Freight."}}},
{"id":"n-ebafc1fe","guard":[["has","ben"],["has","sp"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Franklin Resources."]},["sense.lastWord"]],"mem":null},
{"id":"n-ebc994e6","guard":[["has","ice"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker ICE":"The ticker ICE is Intercontinental Exchange."}}},
{"id":"n-ec508127","guard":[["has","trmb"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Trimble Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-ec663097","guard":[["has","rf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker RF":"The ticker RF is Regions Financial Corporation."}}},
{"id":"n-ec7d22ec","guard":[["hasAny",["avy","company","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as AVY":"The ticker AVY is Avery Dennison."}}},
{"id":"n-ed1410c9","guard":[["has","cvx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker CVX":"The ticker CVX is Chevron Corporation."}}},
{"id":"n-edea136a","guard":[["has","ctsh"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cognizant."]},["sense.lastWord"]],"mem":null},
{"id":"n-ee478b95","guard":[["has","vtrs"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Viatris."]},["sense.lastWord"]],"mem":null},
{"id":"n-eef47516","guard":[["hasAny",["company","has","ko","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the ticker KO":"The ticker KO is Coca-Cola Company (The)."}}},
{"id":"n-ef4e6a56","guard":[["has","hal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as HAL":"The ticker HAL is Halliburton."}}},
{"id":"n-f0ba18e1","guard":[["has","pnw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the ticker PNW":"The ticker PNW is Pinnacle West Capital."}}},
{"id":"n-f0f21826","guard":[["hasAny",["company","trades","v"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as V":"The ticker V is Visa Inc.."}}},
{"id":"n-f13fbde5","guard":[["has","mrna"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Moderna."]},["sense.lastWord"]],"mem":null},
{"id":"n-f17e46e2","guard":[["hasAny",["company","mar","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol MAR":"The ticker MAR is Marriott International."}}},
{"id":"n-f1e3cc6f","guard":[["has","casy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as CASY":"The ticker CASY is Casey's."}}},
{"id":"n-f2fbab63","guard":[["hasAny",["company","ddog","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company trades as DDOG":"The ticker DDOG is Datadog."}}},
{"id":"n-f49ff1e6","guard":[["hasAny",["company","mrna","name","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol MRNA":"The ticker MRNA is Moderna."}}},
{"id":"n-f6c4736c","guard":[["has","vtrs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as VTRS":"The ticker VTRS is Viatris."}}},
{"id":"n-f85f6b43","guard":[["has","incy"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Incyte."]},["sense.lastWord"]],"mem":null},
{"id":"n-f9504f79","guard":[["has","spgi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as SPGI":"The ticker SPGI is S&P Global."}}},
{"id":"n-facf6ce1","guard":[["has","ame"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ametek."]},["sense.lastWord"]],"mem":null},
{"id":"n-fbf28bc5","guard":[["hasAny",["company","name","pypl","sp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol PYPL":"The ticker PYPL is PayPal."}}},
{"id":"n-fcd35910","guard":[["has","dov"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as DOV":"The ticker DOV is Dover Corporation."}}},
{"id":"n-fd32e8f3","guard":[["has","ddog"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as DDOG":"The ticker DDOG is Datadog."}}},
{"id":"n-fe0f9c53","guard":[["has","v"],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Visa Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-ff300638","guard":[["hasAny",["company","name","sp","symbol","wday"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the S&P 500 company with the symbol WDAY":"The ticker WDAY is Workday, Inc.."}}},
{"id":"n-ff936023","guard":[["has","mmm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company trades as MMM":"The ticker MMM is 3M."}}},
{"id":"n-0140abeb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dhr","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Danaher Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-059b4aa0","guard":[["hasAny",["gd","no vowels","remove vowels","without vowels"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is General Dynamics."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-061899ce","guard":[["hasAny",["ci","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cigna."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0af47caa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pypl","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is PayPal."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0b7f8d7c","guard":[["hasAny",["oke","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Oneok."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0e79f0cf","guard":[["hasAny",["bax","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Baxter International."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-16594941","guard":[["hasAny",["ceg","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Constellation Energy."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-169edffa","guard":[["hasAny",["lower case","lowercase","small letters","v"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Visa Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1778f951","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ci","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cigna."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-191210d7","guard":[["hasAny",["c","no vowels","remove vowels","without vowels"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Citigroup."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-1928fe5f","guard":[["hasAny",["ndsn","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nordson Corporation."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-195ee02e","guard":[["hasAny",["lower case","lowercase","ndsn","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nordson Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1af7b2ac","guard":[["hasAny",["bax","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Baxter International."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1dff1658","guard":[["hasAny",["gild","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilead Sciences."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1e812b90","guard":[["hasAny",["dri","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Darden Restaurants."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1eb9eeb3","guard":[["hasAny",["dov","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dover Corporation."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1f2e3bdb","guard":[["hasAny",["bro","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Brown & Brown."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1f3e82e3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","evrg","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Evergy."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-205d3f28","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cost","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Costco."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-21ee909a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","wsm"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Williams-Sonoma, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-22f07231","guard":[["hasAny",["cien","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ciena."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-23eab677","guard":[["hasAny",["fdxf","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is FedEx Freight."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2435cdc8","guard":[["hasAny",["no vowels","pypl","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is PayPal."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-24bc34ec","guard":[["hasAny",["jnj","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Johnson & Johnson."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2798f89c","guard":[["hasAny",["no vowels","remove vowels","vtrs","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Viatris."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-2829336a","guard":[["hasAny",["no vowels","remove vowels","without vowels","wsm"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Williams-Sonoma, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-2c8975f6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","oke","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Oneok."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2cff2391","guard":[["hasAny",["cmcsa","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Comcast."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2e39ec5c","guard":[["hasAny",["lower case","lowercase","small letters","vtrs"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Viatris."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2f581189","guard":[["hasAny",["c","capitalise","capitalize","capitalize each word","title case"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Citigroup."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-33d0ae9f","guard":[["hasAny",["lower case","lowercase","nee","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is NextEra Energy."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-33d9bde6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","irm","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Iron Mountain."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-344b5953","guard":[["hasAny",["avy","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Avery Dennison."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-371c48d1","guard":[["hasAny",["lower case","lowercase","ppg","small letters"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker PPG is ",{"slot":0}," Industries."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-38117273","guard":[["has","ppg"],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Industries."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-39ee1c51","guard":[["hasAny",["lower case","lowercase","mar","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Marriott International."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3a031e1c","guard":[["hasAny",["lower case","lowercase","oke","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Oneok."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3a035154","guard":[["hasAny",["capitalise","capitalize","capitalize each word","panw","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Palo Alto Networks."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3a39d3b9","guard":[["hasAny",["bax","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Baxter International."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3ad5929b","guard":[["hasAny",["lower case","lowercase","small letters","tfc"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Truist Financial."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3db90f9e","guard":[["hasAny",["no vowels","remove vowels","tpr","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Tapestry, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-3e689551","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dov","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dover Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3f7d5c0f","guard":[["hasAny",["mmm","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is 3M."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-40c1ca0b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","syk","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Stryker Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-437e7757","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mmm","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is 3M."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-44b7b520","guard":[["hasAny",["awk","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is American Water Works."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4581d613","guard":[["hasAny",["shortest","shortest one","shortest word","tmo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Thermo Fisher Scientific."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-485d2eb3","guard":[["hasAny",["ame","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ametek."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-48eab770","guard":[["hasAny",["lower case","lowercase","nvda","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nvidia."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-49aa4228","guard":[["hasAny",["bfb","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker BF.",{"slot":0}," is Brown–Forman."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-4a7a2a86","guard":[["hasAny",["lower case","lowercase","rddt","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Reddit."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4ab1a919","guard":[["hasAny",["lower case","lowercase","small letters","wday"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Workday, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4c6f6590","guard":[["hasAny",["irm","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Iron Mountain."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4ca1fd5b","guard":[["hasAny",["lvs","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Las Vegas Sands."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-511f1cbe","guard":[["hasAny",["dov","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dover Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5398b458","guard":[["hasAny",["capitalise","capitalize","capitalize each word","low","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Lowe's."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-540bbb0c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jnj","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Johnson & Johnson."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-551ab13e","guard":[["hasAny",["bx","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Blackstone Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-55aab40b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fdxf","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is FedEx Freight."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5743f34f","guard":[["has","csx"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Corporation."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-5a577653","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nvda","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nvidia."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5b3535f1","guard":[["hasAny",["ew","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Edwards Lifesciences."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5d7a12b7","guard":[["hasAny",["no vowels","remove vowels","syk","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Stryker Corporation."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-62be8123","guard":[["hasAny",["csx","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker CSX is ",{"slot":0}," Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-62f50525","guard":[["hasAny",["no vowels","remove vowels","tfc","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Truist Financial."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-660ae90d","guard":[["hasAny",["ame","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ametek."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-66c5d5d6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nflx","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Netflix."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-692345a2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","casy","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Casey's."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-69ad2a4a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mrna","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Moderna."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6a33c99c","guard":[["hasAny",["bro","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Brown & Brown."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6ba98e89","guard":[["hasAny",["lower case","lowercase","small letters","syk"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Stryker Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6bd0e5b4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sw","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Smurfit Westrock."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6be07b95","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cien","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ciena."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6c3b7d65","guard":[["hasAny",["lower case","lowercase","mrna","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Moderna."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-70e451c2","guard":[["hasAny",["bfb","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ticker BF.",{"slot":0}," is Brown–Forman."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-71e14621","guard":[["hasAny",["lower case","lowercase","pru","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Prudential Financial."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7360294b","guard":[["hasAny",["awk","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is American Water Works."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-73b52b68","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gild","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilead Sciences."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-73be7fc9","guard":[["hasAny",["ew","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Edwards Lifesciences."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7486a5d3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tfc","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Truist Financial."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-74a2afd6","guard":[["hasAny",["casy","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Casey's."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7515f14a","guard":[["hasAny",["lower case","lowercase","panw","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Palo Alto Networks."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-770224a2","guard":[["hasAny",["lower case","lowercase","small letters","xyz"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Block, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7b235520","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","xyz"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Block, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7bf34078","guard":[["hasAny",["capitalise","capitalize","capitalize each word","odfl","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Old Dominion."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7c0bb83c","guard":[["hasAny",["lower case","lowercase","oxy","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Occidental Petroleum."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7c8028dc","guard":[["hasAny",["low","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Lowe's."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7dc2ee00","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ndsn","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nordson Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7e7a60de","guard":[["hasAny",["bx","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Blackstone Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-80c90e85","guard":[["hasAny",["lower case","lowercase","lvs","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Las Vegas Sands."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-811dfd8c","guard":[["hasAny",["hal","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Halliburton."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8267fd84","guard":[["hasAny",["jnj","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Johnson & Johnson."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-83474d94","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lvs","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Las Vegas Sands."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-83b67257","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ir","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ingersoll Rand."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-84a56afe","guard":[["hasAny",["lower case","lowercase","small letters","tmo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Thermo Fisher Scientific."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-85728811","guard":[["hasAny",["dhr","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Danaher Corporation."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-85dd5e05","guard":[["hasAny",["jpm","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is JPMorgan Chase."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-872e1e58","guard":[["hasAny",["lower case","lowercase","nflx","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Netflix."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-877f601a","guard":[["hasAny",["lower case","lowercase","small letters","tpr"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Tapestry, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8a6060ba","guard":[["hasAny",["bx","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Blackstone Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-94b630be","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","wday"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Workday, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-95bb896c","guard":[["hasAny",["fdxf","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is FedEx Freight."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-96c343b7","guard":[["hasAny",["avy","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Avery Dennison."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9899b3ab","guard":[["hasAny",["no vowels","remove vowels","v","without vowels"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Visa Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-98f94109","guard":[["hasAny",["lower case","lowercase","pypl","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is PayPal."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9907a55b","guard":[["hasAny",["incy","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Incyte."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9a333a2e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dri","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Darden Restaurants."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9ae32516","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hwm","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Howmet Aerospace."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9bea16a7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tmo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Thermo Fisher Scientific."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a0c0a797","guard":[["hasAny",["ben","capitalise","capitalize","capitalize each word","title case"]],["has","sp"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Franklin Resources."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a13f39fc","guard":[["hasAny",["ir","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ingersoll Rand."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a222172e","guard":[["hasAny",["irm","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Iron Mountain."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a2feaffd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cmcsa","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Comcast."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a9234fcc","guard":[["hasAny",["bfb","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker BF.",{"slot":0}," is Brown–Forman."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ab51a2ea","guard":[["hasAny",["lower case","lowercase","small letters","wsm"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Williams-Sonoma, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ab96fb7f","guard":[["hasAny",["no vowels","remove vowels","sw","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Smurfit Westrock."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-b292e2d2","guard":[["hasAny",["gild","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilead Sciences."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b3a5c78d","guard":[["hasAny",["jpm","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is JPMorgan Chase."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b476b003","guard":[["hasAny",["no vowels","remove vowels","trmb","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Trimble Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-b4b1c834","guard":[["hasAny",["lower case","lowercase","odfl","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Old Dominion."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b76aa261","guard":[["hasAny",["lower case","lowercase","small letters","sw"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Smurfit Westrock."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b8f47f72","guard":[["hasAny",["capitalise","capitalize","capitalize each word","rddt","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Reddit."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b9467647","guard":[["hasAny",["ir","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ingersoll Rand."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ba178504","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mar","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Marriott International."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ba42ab20","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hal","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Halliburton."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bac4ad7f","guard":[["hasAny",["nflx","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Netflix."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-bbe05444","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tpr"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Tapestry, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bdeafb4f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gd","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is General Dynamics."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-be553914","guard":[["hasAny",["ddog","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Datadog."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c306da2b","guard":[["hasAny",["lower case","lowercase","small letters","trmb"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Trimble Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c4265d8c","guard":[["hasAny",["awk","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is American Water Works."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c58c1bbd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jpm","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is JPMorgan Chase."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c8e8c9be","guard":[["hasAny",["cien","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ciena."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cf6f3166","guard":[["hasAny",["capitalise","capitalize","capitalize each word","coo","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cooper Companies (The)."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d0efbdbb","guard":[["hasAny",["ben","lower case","lowercase","small letters"]],["has","sp"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Franklin Resources."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d2a98ede","guard":[["hasAny",["dhr","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Danaher Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d5dbac94","guard":[["hasAny",["hal","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Halliburton."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d7301438","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","vtrs"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Viatris."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d7ee23ad","guard":[["hasAny",["low","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Lowe's."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-da4aa757","guard":[["hasAny",["hwm","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Howmet Aerospace."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-dad3bd23","guard":[["hasAny",["adsk","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Autodesk."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-dc6d5152","guard":[["hasAny",["c","lower case","lowercase","small letters"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Citigroup."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-dd7cd80f","guard":[["hasAny",["abbreviate","acronym","spgi"]]],"pyramid":["render.template",{"lit":["The ticker SPGI is ",{"slot":0},"&P Global."]},["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-de956f28","guard":[["hasAny",["lower case","lowercase","mmm","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is 3M."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-df4e7c6c","guard":[["hasAny",["avy","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Avery Dennison."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e196c672","guard":[["hasAny",["ame","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ametek."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e54bd307","guard":[["hasAny",["hwm","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Howmet Aerospace."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e705ff18","guard":[["hasAny",["no vowels","rddt","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Reddit."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-e7370475","guard":[["hasAny",["ci","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cigna."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e9c139fa","guard":[["hasAny",["no vowels","remove vowels","without vowels","xyz"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Block, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-ea96ac6e","guard":[["hasAny",["adsk","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Autodesk."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ee632ed1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ddog","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Datadog."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f1dcb7d3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nee","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is NextEra Energy."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f289c353","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pru","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Prudential Financial."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f5f048ab","guard":[["hasAny",["gd","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is General Dynamics."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f600d82f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","v"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Visa Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f66a3917","guard":[["hasAny",["capitalise","capitalize","capitalize each word","incy","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Incyte."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f7b16de8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ew","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Edwards Lifesciences."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f885d41e","guard":[["hasAny",["casy","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Casey's."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f9d0950f","guard":[["hasAny",["coo","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cooper Companies (The)."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-fac43db1","guard":[["hasAny",["ddog","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Datadog."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-fb2d23b5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ceg","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Constellation Energy."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fbac75ed","guard":[["hasAny",["dri","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Darden Restaurants."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-fd2621e4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","trmb"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Trimble Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fd263a06","guard":[["hasAny",["cost","lower case","lowercase","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Costco."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-fdec0af2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","oxy","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Occidental Petroleum."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ff1e4c5f","guard":[["hasAny",["evrg","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Evergy."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0036218e","guard":[["hasAny",["ew","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Edwards Lifesciences."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-0097b3df","guard":[["hasAny",["each word","split into words","wsm"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Williams-Sonoma, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-00efd37a","guard":[["hasAny",["item number","nth","position","rf"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," RF is Regions Financial Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-021bfb41","guard":[["hasAny",["each word","oke","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Oneok."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-02be1220","guard":[["hasAny",["no vowels","ppg","remove vowels","without vowels"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Industries."]},["sense.lastWord"],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-034e9574","guard":[["hasAny",["bx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Blackstone Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-03c37785","guard":[["hasAny",["item number","mmm","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is 3M."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-050843e1","guard":[["hasAny",["ir","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ingersoll Rand."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0806afa4","guard":[["hasAny",["delete","remove","strip out","wday","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Workday, Inc.."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-091f7db4","guard":[["hasAny",["each word","mmm","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is 3M."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0928bb38","guard":[["hasAny",["item number","nth","position","pru"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Prudential Financial."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-0959578e","guard":[["hasAny",["item number","ndsn","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nordson Corporation."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-09c94754","guard":[["hasAny",["item number","mpc","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MPC is Marathon Petroleum."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-09fcbb99","guard":[["hasAny",["dhr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Danaher Corporation."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-0a67f5d0","guard":[["hasAny",["each word","nflx","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Netflix."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0ae9b7b6","guard":[["hasAny",["each word","ir","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ingersoll Rand."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0b622cb5","guard":[["hasAny",["hal","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Halliburton."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-0b9bc873","guard":[["hasAny",["item number","jnj","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Johnson & Johnson."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-0c537417","guard":[["hasAny",["item number","nth","position","v"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Visa Inc.."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-0da4b8b8","guard":[["hasAny",["ci","each word","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cigna."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0dd77a8e","guard":[["hasAny",["item number","nth","position","tmo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Thermo Fisher Scientific."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-0e8e8fbe","guard":[["hasAny",["ame","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ametek."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1522b7d5","guard":[["hasAny",["each word","lvs","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Las Vegas Sands."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-156b25cb","guard":[["hasAny",["ceg","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Constellation Energy."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-16d9ebbd","guard":[["hasAny",["each word","gild","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilead Sciences."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1733883a","guard":[["hasAny",["avy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Avery Dennison."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-17c63918","guard":[["hasAny",["each word","fdxf","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is FedEx Freight."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1a22bd86","guard":[["hasAny",["item number","mmm","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is 3M."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1a9f1b81","guard":[["hasAny",["each word","nvda","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nvidia."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1c1ba45f","guard":[["hasAny",["cmcsa","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Comcast."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1db51166","guard":[["hasAny",["item number","nth","nvda","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nvidia."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-1f079000","guard":[["hasAny",["item number","ko","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KO is Coca-Cola Company (The)."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1fa27093","guard":[["hasAny",["gd","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is General Dynamics."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-2081e6c0","guard":[["hasAny",["cien","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ciena."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2090ca53","guard":[["hasAny",["ddog","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Datadog."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-23086c08","guard":[["hasAny",["cost","delete","remove","strip out","without"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Costco."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-234611b5","guard":[["hasAny",["bro","delete","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Brown & Brown."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-23604cd0","guard":[["hasAny",["c","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Citigroup."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-23b8fccd","guard":[["hasAny",["ci","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cigna."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-24346c96","guard":[["hasAny",["cmi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CMI is Cummins."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-24e39a2a","guard":[["hasAny",["ddog","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Datadog."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2521e5dd","guard":[["hasAny",["bax","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Baxter International."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-27761e85","guard":[["hasAny",["each word","irm","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Iron Mountain."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2857c1da","guard":[["hasAny",["bro","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Brown & Brown."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-2882dace","guard":[["hasAny",["each word","ndsn","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nordson Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-294be676","guard":[["hasAny",["each word","split into words","tpr"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Tapestry, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2a96013b","guard":[["hasAny",["item number","lite","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," LITE is Lumentum."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2aa6198d","guard":[["hasAny",["item number","nth","panw","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Palo Alto Networks."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-2d529208","guard":[["hasAny",["gild","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilead Sciences."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2dda582a","guard":[["hasAny",["item number","nth","position","trmb"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Trimble Inc.."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-2e654b4a","guard":[["hasAny",["item number","nth","position","syk"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Stryker Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2fc9ac2d","guard":[["hasAny",["dri","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Darden Restaurants."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-306a890f","guard":[["hasAny",["ice","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ICE is Intercontinental Exchange."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3173f312","guard":[["hasAny",["ci","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cigna."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-326b2ad7","guard":[["hasAny",["item number","nth","position","wdc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," WDC is Western Digital."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3380df3d","guard":[["hasAny",["bro","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Brown & Brown."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-33b676fe","guard":[["hasAny",["bx","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Blackstone Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-33e26b37","guard":[["hasAny",["bfb","delete","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker BF.",{"slot":0}," is Brown–Forman."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-3547d042","guard":[["hasAny",["item number","nth","position","tmo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Thermo Fisher Scientific."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-37170edc","guard":[["hasAny",["fslr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," FSLR is First Solar."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-37b4c20e","guard":[["hasAny",["item number","nth","position","trmb"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Trimble Inc.."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3b38f03c","guard":[["hasAny",["item number","j","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," J is Jacobs Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3c269f37","guard":[["hasAny",["item number","nth","position","wmb"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," WMB is Williams Companies."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3c59087c","guard":[["hasAny",["item number","jpm","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is JPMorgan Chase."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3cd59ed8","guard":[["hasAny",["each word","jnj","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Johnson & Johnson."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3d550c88","guard":[["hasAny",["awk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is American Water Works."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3e258b77","guard":[["hasAny",["dov","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dover Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3ea9a96f","guard":[["hasAny",["ew","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Edwards Lifesciences."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3f731b5c","guard":[["hasAny",["delete","panw","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Palo Alto Networks."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-3f8a1df1","guard":[["hasAny",["each word","split into words","v"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Visa Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3fb0ddea","guard":[["hasAny",["ci","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cigna."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-43de7dd2","guard":[["hasAny",["delete","nee","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is NextEra Energy."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-442f1590","guard":[["hasAny",["bdx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BDX is Becton Dickinson."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-453e800f","guard":[["hasAny",["bx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Blackstone Inc.."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-47e7a2dd","guard":[["hasAny",["hal","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Halliburton."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4874f340","guard":[["hasAny",["bfb","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker BF.",{"slot":0}," is Brown–Forman."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4892f575","guard":[["hasAny",["each word","split into words","tmo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Thermo Fisher Scientific."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4aa2a68c","guard":[["hasAny",["casy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Casey's."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4af917e4","guard":[["hasAny",["each word","panw","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Palo Alto Networks."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4b20d1e2","guard":[["hasAny",["ben","item number","nth","position"]],["has","sp"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Franklin Resources."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-4bdc6a1e","guard":[["hasAny",["ceg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Constellation Energy."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-4d941a3c","guard":[["hasAny",["cvx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CVX is Chevron Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4e853061","guard":[["hasAny",["each word","ew","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Edwards Lifesciences."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-50b26e52","guard":[["hasAny",["dri","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Darden Restaurants."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-51f51d34","guard":[["hasAny",["ceg","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Constellation Energy."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-51fa1f74","guard":[["hasAny",["each word","pypl","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is PayPal."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-53106742","guard":[["hasAny",["item number","nth","position","trgp"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TRGP is Targa Resources."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-558c38dd","guard":[["hasAny",["bax","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Baxter International."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-56fb231d","guard":[["hasAny",["ir","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ingersoll Rand."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-5790696f","guard":[["hasAny",["each word","jnj","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Johnson & Johnson."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-58022c11","guard":[["hasAny",["delete","mrna","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Moderna."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-5842d22c","guard":[["hasAny",["cien","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ciena."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-58451456","guard":[["hasAny",["fdxf","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is FedEx Freight."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-58ebd7aa","guard":[["hasAny",["cost","each word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Costco."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5ac5022a","guard":[["hasAny",["hpe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HPE is Hewlett Packard Enterprise."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5c47318e","guard":[["hasAny",["each word","gd","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is General Dynamics."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5ca4922d","guard":[["hasAny",["adsk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Autodesk."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-5d6bec65","guard":[["hasAny",["casy","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Casey's."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5de1f83d","guard":[["hasAny",["each word","split into words","wday"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Workday, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5e86142b","guard":[["hasAny",["dis","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker DIS is Walt Disney ",{"slot":0}," (The)."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5f456d4c","guard":[["hasAny",["each word","oxy","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Occidental Petroleum."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5f8b8ace","guard":[["hasAny",["each word","low","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Lowe's."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5ff72008","guard":[["hasAny",["delete","pru","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Prudential Financial."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-60ef98ed","guard":[["hasAny",["cvs","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Health."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-61958133","guard":[["hasAny",["item number","nth","pnw","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PNW is Pinnacle West Capital."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-619e2657","guard":[["hasAny",["each word","nee","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is NextEra Energy."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-61bfb790","guard":[["hasAny",["lower case","lowercase","small letters","wec"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Energy Group."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-624cb86f","guard":[["hasAny",["c","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Citigroup."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-625f038b","guard":[["hasAny",["dov","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dover Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-62fabf62","guard":[["hasAny",["avy","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Avery Dennison."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-640aab64","guard":[["hasAny",["bax","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Baxter International."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-645ff587","guard":[["hasAny",["delete","mar","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Marriott International."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-64b289e9","guard":[["hasAny",["item number","nth","position","vtrs"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Viatris."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6589438d","guard":[["hasAny",["item number","jpm","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is JPMorgan Chase."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-66b5f4b6","guard":[["hasAny",["amzn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AMZN is Amazon."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-67acd6c8","guard":[["hasAny",["item number","mrna","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Moderna."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-69fb90fb","guard":[["hasAny",["item number","mmm","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is 3M."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6a58a670","guard":[["hasAny",["item number","nflx","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Netflix."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6a8f16f9","guard":[["hasAny",["delete","oxy","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Occidental Petroleum."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-6b7eb46a","guard":[["hasAny",["c","each word","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Citigroup."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6d5af472","guard":[["hasAny",["item number","nth","position","trmb"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Trimble Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6db2681a","guard":[["hasAny",["each word","split into words","xyz"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Block, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6ddc284c","guard":[["hasAny",["casy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Casey's."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-6ded224c","guard":[["hasAny",["item number","nth","oke","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Oneok."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6e1fb64a","guard":[["hasAny",["each word","split into words","trmb"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Trimble Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6e9e7e3b","guard":[["hasAny",["cien","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ciena."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6f34d9c9","guard":[["hasAny",["dov","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dover Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6f78e18a","guard":[["hasAny",["c","each word","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Citigroup."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-70019ca9","guard":[["hasAny",["item number","nth","oke","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Oneok."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7110fbea","guard":[["hasAny",["each word","ew","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Edwards Lifesciences."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7233a175","guard":[["hasAny",["each word","pypl","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is PayPal."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-729fa135","guard":[["hasAny",["each word","split into words","xyz"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Block, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-744539d2","guard":[["hasAny",["coo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cooper Companies (The)."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-745736fa","guard":[["hasAny",["each word","nvda","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nvidia."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-768283eb","guard":[["hasAny",["bx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Blackstone Inc.."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-76a2222e","guard":[["hasAny",["item number","nth","position","vtr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," VTR is Ventas."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7735c7c7","guard":[["hasAny",["each word","odfl","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Old Dominion."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-777db06d","guard":[["hasAny",["each word","mmm","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is 3M."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7796f1fa","guard":[["hasAny",["item number","nth","position","vtrs"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Viatris."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-798af48b","guard":[["hasAny",["each word","incy","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Incyte."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-79eaa332","guard":[["hasAny",["casy","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Casey's."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7a0a2242","guard":[["hasAny",["dhr","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Danaher Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7a52f40a","guard":[["hasAny",["abt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ABT is Abbott Laboratories."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7a7cd976","guard":[["hasAny",["each word","split into words","tpr"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Tapestry, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7a7f686c","guard":[["hasAny",["item number","nth","position","pwr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PWR is Quanta Services."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7a830b9e","guard":[["hasAny",["each word","fdxf","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is FedEx Freight."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7b72746e","guard":[["hasAny",["cien","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ciena."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7c1cebd8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","csx","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Corporation."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7c37add2","guard":[["hasAny",["item number","jpm","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is JPMorgan Chase."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-7c466adf","guard":[["hasAny",["each word","evrg","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Evergy."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7ca57d4f","guard":[["hasAny",["item number","nth","position","tfc"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Truist Financial."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7efa500a","guard":[["hasAny",["item number","nth","position","tfc"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Truist Financial."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-801e3cf9","guard":[["hasAny",["dov","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dover Corporation."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-824f34de","guard":[["hasAny",["item number","nth","position","v"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Visa Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-828a1a21","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ppg","title case"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Industries."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-837573c1","guard":[["hasAny",["irm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Iron Mountain."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-83c90a63","guard":[["hasAny",["ben","each word","split into words"]],["has","sp"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Franklin Resources."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-842b4a93","guard":[["hasAny",["ame","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ametek."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-85c11d0c","guard":[["hasAny",["each word","gild","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilead Sciences."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-877d8bdb","guard":[["hasAny",["each word","mar","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Marriott International."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-89f57363","guard":[["hasAny",["avy","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Avery Dennison."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8b770d2f","guard":[["hasAny",["item number","nth","position","wday"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Workday, Inc.."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-8bb4ea34","guard":[["hasAny",["item number","nflx","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Netflix."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8e731d46","guard":[["hasAny",["item number","nth","position","sna"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SNA is Snap-on."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8ed731dc","guard":[["hasAny",["each word","mrna","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Moderna."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8eed7777","guard":[["hasAny",["each word","jpm","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is JPMorgan Chase."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8f8df4bd","guard":[["hasAny",["each word","split into words","syk"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Stryker Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-91a8dae9","guard":[["hasAny",["br","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BR is Broadridge Financial Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-91c98336","guard":[["hasAny",["cost","each word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Costco."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-93258717","guard":[["hasAny",["each word","split into words","trmb"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Trimble Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-932bd052","guard":[["hasAny",["abbreviate","acronym","spgi"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1},"&P Global."]},["sense.lastWord"],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-94167ec5","guard":[["hasAny",["each word","jpm","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is JPMorgan Chase."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-94b46664","guard":[["hasAny",["ddog","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Datadog."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-95373788","guard":[["hasAny",["item number","nth","position","vrsk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," VRSK is Verisk Analytics."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-95d33b54","guard":[["hasAny",["each word","rddt","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Reddit."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-97709780","guard":[["hasAny",["each word","ir","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ingersoll Rand."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-984b08ac","guard":[["hasAny",["coo","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cooper Companies (The)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9874b8f7","guard":[["hasAny",["each word","panw","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Palo Alto Networks."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-98a7167b","guard":[["hasAny",["adsk","delete","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Autodesk."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-98fbbf5a","guard":[["hasAny",["ew","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Edwards Lifesciences."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9aa535be","guard":[["hasAny",["each word","hwm","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Howmet Aerospace."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9b78a2e4","guard":[["hasAny",["casy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Casey's."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9cea2ff5","guard":[["hasAny",["item number","nth","position","rddt"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Reddit."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-9d7e327b","guard":[["hasAny",["each word","split into words","vtrs"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Viatris."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9dc318cf","guard":[["hasAny",["lower case","lowercase","ppg","small letters"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Industries."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9f3382ba","guard":[["hasAny",["item number","msft","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MSFT is Microsoft."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9f701d93","guard":[["hasAny",["awk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is American Water Works."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9fb0d8a6","guard":[["hasAny",["bax","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Baxter International."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-a024365b","guard":[["hasAny",["bx","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Blackstone Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a2296622","guard":[["hasAny",["item number","nth","position","tpr"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Tapestry, Inc.."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-a4c1ee87","guard":[["hasAny",["ddog","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Datadog."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a5594dac","guard":[["hasAny",["bro","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Brown & Brown."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a587e599","guard":[["hasAny",["gild","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilead Sciences."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a62dbade","guard":[["hasAny",["item number","low","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Lowe's."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a6c9c7f8","guard":[["hasAny",["character count","convert to base","how many characters","in base","in binary","in octal","length","mmm","number of characters","to binary","to hex"]]],"pyramid":["render.str",["compute.toBase",{"lit":100},["aggregate.chars",["sense.text"]]]],"mem":null},
{"id":"n-a6e652ee","guard":[["hasAny",["dva","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," DVA is DaVita."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a8df8a35","guard":[["hasAny",["ame","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ametek."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-abad13e2","guard":[["hasAny",["each word","split into words","syk"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Stryker Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ac095c17","guard":[["hasAny",["each word","oke","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Oneok."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ae08acb5","guard":[["hasAny",["item number","jnj","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Johnson & Johnson."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-ae735d18","guard":[["hasAny",["item number","nth","position","wsm"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Williams-Sonoma, Inc.."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-afe55626","guard":[["hasAny",["delete","odfl","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Old Dominion."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-aff63740","guard":[["hasAny",["each word","oxy","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Occidental Petroleum."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b04362e3","guard":[["hasAny",["item number","low","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Lowe's."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b09b523a","guard":[["hasAny",["each word","nflx","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Netflix."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b1d8ac29","guard":[["hasAny",["csx","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Corporation."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b364ab5a","guard":[["hasAny",["awk","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is American Water Works."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b3fe1cef","guard":[["hasAny",["item number","nth","oke","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Oneok."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-b417fad7","guard":[["hasAny",["ci","each word","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cigna."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b49bf45e","guard":[["hasAny",["item number","nee","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is NextEra Energy."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-b4ca1098","guard":[["hasAny",["cmcsa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Comcast."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-b5bc1678","guard":[["hasAny",["dri","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Darden Restaurants."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b7deb30e","guard":[["hasAny",["bfb","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker BF.",{"slot":0}," is Brown–Forman."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b94cd743","guard":[["hasAny",["dri","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Darden Restaurants."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ba088f72","guard":[["hasAny",["coo","delete","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cooper Companies (The)."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-bb06f509","guard":[["hasAny",["each word","split into words","wday"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Workday, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bd69b144","guard":[["hasAny",["item number","nth","position","syk"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Stryker Corporation."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-be4dfd52","guard":[["hasAny",["each word","split into words","sw"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Smurfit Westrock."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-be7966d0","guard":[["hasAny",["each word","lvs","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Las Vegas Sands."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bec978e8","guard":[["hasAny",["delete","evrg","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Evergy."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-bf4c64d3","guard":[["hasAny",["hal","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Halliburton."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c019aaf2","guard":[["hasAny",["ccl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CCL is Carnival Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c070c200","guard":[["hasAny",["adsk","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Autodesk."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c0cbe30a","guard":[["hasAny",["each word","evrg","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Evergy."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c1079ac0","guard":[["hasAny",["each word","mar","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Marriott International."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c140542c","guard":[["hasAny",["ame","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ametek."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c1af5702","guard":[["hasAny",["cmcsa","delete","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Comcast."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-c1b24322","guard":[["hasAny",["grmn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GRMN is Garmin."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c1bba9bd","guard":[["hasAny",["delete","nvda","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nvidia."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-c5145c0b","guard":[["hasAny",["item number","jnj","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Johnson & Johnson."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c7bbdd58","guard":[["hasAny",["bax","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Baxter International."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c7e1b37f","guard":[["hasAny",["cmcsa","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Comcast."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c80af533","guard":[["hasAny",["ddog","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Datadog."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c8ce0257","guard":[["hasAny",["each word","rddt","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Reddit."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ca1601d0","guard":[["hasAny",["delete","incy","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Incyte."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-cb1aa5f9","guard":[["hasAny",["each word","split into words","v"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Visa Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cb1c3f13","guard":[["hasAny",["dhr","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Danaher Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cb1cc4ec","guard":[["hasAny",["each word","hwm","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Howmet Aerospace."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ceb60bd4","guard":[["hasAny",["each word","pru","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Prudential Financial."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d1217125","guard":[["hasAny",["item number","nth","position","pypl"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is PayPal."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-d1e2243e","guard":[["hasAny",["item number","nth","oxy","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Occidental Petroleum."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-d2715a3b","guard":[["hasAny",["dov","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dover Corporation."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d2c22dde","guard":[["hasAny",["each word","gd","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is General Dynamics."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d39c2482","guard":[["hasAny",["ceg","delete","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Constellation Energy."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-d4d70f7f","guard":[["hasAny",["evrg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Evergy."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-d5231a79","guard":[["hasAny",["each word","split into words","wsm"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Williams-Sonoma, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d5638acf","guard":[["hasAny",["ctsh","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CTSH is Cognizant."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d57dd844","guard":[["hasAny",["coo","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cooper Companies (The)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d5c09809","guard":[["hasAny",["each word","ndsn","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nordson Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d65e4601","guard":[["hasAny",["hwm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Howmet Aerospace."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-d6e2c0d6","guard":[["hasAny",["item number","nth","position","sw"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Smurfit Westrock."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-d770d254","guard":[["hasAny",["each word","split into words","tmo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Thermo Fisher Scientific."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d7cec6f1","guard":[["hasAny",["each word","nee","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is NextEra Energy."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d82e49ef","guard":[["hasAny",["each word","split into words","tfc"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Truist Financial."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-da5138dd","guard":[["hasAny",["cost","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Costco."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-da6e634d","guard":[["hasAny",["dri","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Darden Restaurants."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-db143740","guard":[["hasAny",["each word","hal","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Halliburton."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dc0b4b72","guard":[["hasAny",["gd","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is General Dynamics."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dc4b9b05","guard":[["hasAny",["each word","low","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Lowe's."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dcfce2d3","guard":[["hasAny",["awk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is American Water Works."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-dd232ef8","guard":[["hasAny",["each word","mrna","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Moderna."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dd4bfcc8","guard":[["hasAny",["ben","each word","split into words"]],["has","sp"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Franklin Resources."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-de66dfc6","guard":[["hasAny",["irm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Iron Mountain."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-de9c43a9","guard":[["hasAny",["ir","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ingersoll Rand."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-df2f58e6","guard":[["hasAny",["adsk","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Autodesk."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e08e30d8","guard":[["hasAny",["abbreviate","acronym","tmus"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1},"-Mobile US."]},["sense.lastWord"],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-e1ee67aa","guard":[["hasAny",["ben","delete","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Franklin Resources."]},["transform.remove",["sense.lastWord"],["sense.numeral"]]],"mem":null},
{"id":"n-e31d9a21","guard":[["hasAny",["incy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Incyte."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-e32db6ec","guard":[["hasAny",["c","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Citigroup."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-e3a14f9e","guard":[["hasAny",["each word","split into words","sw"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Smurfit Westrock."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e432fe1f","guard":[["hasAny",["avy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Avery Dennison."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-e5a340ab","guard":[["hasAny",["item number","nth","position","tfc"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Truist Financial."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-e5b84488","guard":[["hasAny",["each word","split into words","vtrs"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Viatris."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e61a3b05","guard":[["hasAny",["each word","irm","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Iron Mountain."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e680ba3c","guard":[["hasAny",["item number","nflx","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Netflix."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-e7807afb","guard":[["hasAny",["each word","hal","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Halliburton."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e87a3fc8","guard":[["hasAny",["frt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," FRT is Federal Realty Investment Trust."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ea033a67","guard":[["hasAny",["csx","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Corporation."]},["sense.lastWord"],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-ea2cb5d3","guard":[["hasAny",["irm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Iron Mountain."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ea770a3a","guard":[["hasAny",["each word","pru","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Prudential Financial."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ec4e5ee8","guard":[["hasAny",["item number","lvs","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Las Vegas Sands."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-ed837167","guard":[["hasAny",["gild","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilead Sciences."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-ee2d5be6","guard":[["hasAny",["item number","low","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Lowe's."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-eec96918","guard":[["hasAny",["each word","incy","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Incyte."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f028ff1c","guard":[["hasAny",["item number","nth","position","syk"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Stryker Corporation."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f26cae09","guard":[["hasAny",["ame","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ametek."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f32cb37f","guard":[["hasAny",["each word","odfl","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Old Dominion."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f4afb435","guard":[["hasAny",["gd","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is General Dynamics."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f6bb0e90","guard":[["hasAny",["item number","nth","odfl","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Old Dominion."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-fa1cf6bb","guard":[["hasAny",["hpq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HPQ is HP Inc.."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-fa869371","guard":[["hasAny",["item number","mar","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Marriott International."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-facdc240","guard":[["hasAny",["cien","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Ciena."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-fb1194ed","guard":[["hasAny",["awk","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is American Water Works."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fb685d17","guard":[["hasAny",["avy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Avery Dennison."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fc29ef81","guard":[["hasAny",["item number","nth","position","xyz"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Block, Inc.."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-fc611cae","guard":[["hasAny",["item number","nth","position","vtrs"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Viatris."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-fc892921","guard":[["hasAny",["each word","split into words","tfc"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Truist Financial."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fcd022fa","guard":[["hasAny",["aig","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AIG is American International Group."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-fd2609ec","guard":[["hasAny",["item number","nth","position","v"]],["has","what"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Visa Inc.."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-fe530a91","guard":[["hasAny",["item number","nth","position","tmo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Thermo Fisher Scientific."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-0290f798","guard":[["hasAny",["item number","nth","position","vrsk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Verisk Analytics."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-02b3cf5b","guard":[["has","nee"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is NextEra Energy."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-04b1200c","guard":[["hasAny",["item number","mpc","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Marathon Petroleum."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-05ec7ba8","guard":[["hasAny",["dis","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Walt Disney ",{"slot":1}," (The)."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-06b5f0fb","guard":[["hasAny",["item number","nth","position","vtr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ventas."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-07fc68f1","guard":[["hasAny",["cmi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cummins."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-0820d552","guard":[["hasAny",["csx","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Corporation."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-08ae2eff","guard":[["hasAny",["lower case","lowercase","no vowels","ppg","remove vowels","small letters","without vowels"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Industries."]},["transform.noVowels",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0a5651d2","guard":[["hasAny",["item number","nth","position","wdc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Western Digital."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-0d6891d9","guard":[["hasAny",["dva","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is DaVita."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-11aeb53a","guard":[["hasAny",["grmn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Garmin."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-13788bee","guard":[["has","nvda"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nvidia."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-1475991c","guard":[["has","wday"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Workday, Inc.."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-14b322fd","guard":[["has","xyz"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Block, Inc.."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-16dc8f53","guard":[["has","tpr"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Tapestry, Inc.."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-184ac994","guard":[["hasAny",["each word","ppg","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Industries."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-18785378","guard":[["has","pypl"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is PayPal."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-18a154b8","guard":[["hasAny",["hpe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hewlett Packard Enterprise."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-196818ac","guard":[["hasAny",["item number","nth","pnw","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pinnacle West Capital."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-21ba7a6d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lower case","lowercase","ppg","small letters","title case"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Industries."]},["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-21f44f29","guard":[["has","panw"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Palo Alto Networks."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-24bba224","guard":[["hasAny",["abbreviate","acronym","shortest","shortest one","shortest word","spgi"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1},"&P Global."]},["aggregate.shortest",["sense.content"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-2502ac17","guard":[["has","pypl"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is PayPal."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-2523084f","guard":[["has","wsm"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Williams-Sonoma, Inc.."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-262aea73","guard":[["hasAny",["item number","msft","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Microsoft."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-267ba0d3","guard":[["has","fdxf"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is FedEx Freight."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-26d97a3c","guard":[["has","fdxf"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is FedEx Freight."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-2788a8e4","guard":[["hasAny",["grmn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Garmin."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-27c7f656","guard":[["hasAny",["cmi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cummins."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-27f9b6a8","guard":[["hasAny",["bdx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Becton Dickinson."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-29527732","guard":[["hasAny",["capitalise","capitalize","capitalize each word","csx","lower case","lowercase","small letters","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Corporation."]},["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2a2ba9fc","guard":[["hasAny",["item number","nth","position","sna"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Snap-on."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-2a31f7d7","guard":[["hasAny",["amzn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Amazon."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-2a6b27c7","guard":[["hasAny",["item number","msft","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Microsoft."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-2d315200","guard":[["has","oxy"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Occidental Petroleum."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-2db1c32b","guard":[["has","cost"],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Costco."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-30189247","guard":[["hasAny",["ctsh","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cognizant."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-320e4746","guard":[["has","odfl"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Old Dominion."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-35a663da","guard":[["hasAny",["ice","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Intercontinental Exchange."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-3706ae94","guard":[["hasAny",["dva","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is DaVita."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-399a28c2","guard":[["hasAny",["dis","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Walt Disney ",{"slot":1}," (The)."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3a34b7fb","guard":[["hasAny",["abt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Abbott Laboratories."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-3ae619a7","guard":[["hasAny",["item number","nth","position","vrsk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Verisk Analytics."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-3cbe6e19","guard":[["hasAny",["aig","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is American International Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-3ccbd2df","guard":[["hasAny",["hpq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is HP Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-3d915504","guard":[["has","sw"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Smurfit Westrock."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-42d0986f","guard":[["has","dhr"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Danaher Corporation."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-43e393d5","guard":[["has","coo"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cooper Companies (The)."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-45e6f028","guard":[["has","hwm"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Howmet Aerospace."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-46dc3fe6","guard":[["has","ceg"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Constellation Energy."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-4f56e737","guard":[["hasAny",["cvx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Chevron Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-502e134d","guard":[["has","lvs"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Las Vegas Sands."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-50530dbe","guard":[["hasAny",["amzn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Amazon."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-53c6f527","guard":[["hasAny",["abbreviate","acronym","lower case","lowercase","small letters","spgi"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1},"&P Global."]},["transform.lower",["sense.lastWord"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-57d6cc46","guard":[["hasAny",["fslr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is First Solar."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-5a187bca","guard":[["hasAny",["item number","nth","position","ppg"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Industries."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5cb537e5","guard":[["has","wday"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Workday, Inc.."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-5e15b0bc","guard":[["has","tpr"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Tapestry, Inc.."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-5fa388f3","guard":[["hasAny",["frt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Federal Realty Investment Trust."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-6373d67d","guard":[["has","ndsn"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nordson Corporation."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-672f61ae","guard":[["has","hwm"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Howmet Aerospace."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-6750c747","guard":[["has","ben"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Franklin Resources."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-682ad1b0","guard":[["has","coo"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cooper Companies (The)."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-68317824","guard":[["hasAny",["item number","nth","position","wmb"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Williams Companies."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-6ff93e6c","guard":[["has","rddt"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Reddit."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-70700edf","guard":[["has","cmcsa"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Comcast."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-7226e652","guard":[["has","mrna"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Moderna."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-741cb8ee","guard":[["has","oxy"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Occidental Petroleum."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-75dd095c","guard":[["hasAny",["ctsh","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cognizant."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-762a5558","guard":[["has","xyz"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Block, Inc.."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-799b45ee","guard":[["has","mrna"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Moderna."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-821aa679","guard":[["hasAny",["item number","nth","position","sna"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Snap-on."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-882a4c70","guard":[["has","ben"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Franklin Resources."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-8931beac","guard":[["has","bro"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Brown & Brown."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-8b19cae5","guard":[["hasAny",["csx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Corporation."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-8d49cb49","guard":[["has","pru"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Prudential Financial."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-8d581dbb","guard":[["has","sw"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Smurfit Westrock."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-926cad97","guard":[["has","ceg"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Constellation Energy."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-9278b44f","guard":[["hasAny",["hpe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hewlett Packard Enterprise."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-97b27204","guard":[["hasAny",["item number","nth","position","tmus"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is T-Mobile US."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-9e101920","guard":[["has","lvs"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Las Vegas Sands."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-a5b2e5c3","guard":[["has","dhr"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Danaher Corporation."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-a6c54512","guard":[["hasAny",["item number","nth","position","trgp"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Targa Resources."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-a76c0c67","guard":[["hasAny",["ccl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Carnival Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-a7b8224d","guard":[["hasAny",["item number","nth","position","wec"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is WEC Energy Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-a97c69ce","guard":[["has","odfl"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Old Dominion."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-ab529bbc","guard":[["has","nvda"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nvidia."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-ad5084ef","guard":[["hasAny",["csx","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Corporation."]},["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-af43e3ba","guard":[["hasAny",["abt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Abbott Laboratories."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-b1ce0e97","guard":[["hasAny",["ice","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Intercontinental Exchange."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-b4bc840c","guard":[["hasAny",["item number","nth","position","wdc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Western Digital."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-b5241482","guard":[["hasAny",["item number","nth","position","vtr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ventas."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-b61f3946","guard":[["hasAny",["item number","nth","pnw","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pinnacle West Capital."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-b6ce68d0","guard":[["hasAny",["ccl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Carnival Corporation."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-b8534e78","guard":[["hasAny",["bdx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Becton Dickinson."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-bad2e9d1","guard":[["hasAny",["cmi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cummins."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.roman"]],"mem":null},
{"id":"n-bb6d82e8","guard":[["hasAny",["aig","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is American International Group."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-bf2ba77e","guard":[["has","rddt"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Reddit."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-c111f124","guard":[["hasAny",["item number","nth","position","trgp"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Targa Resources."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-c374460b","guard":[["hasAny",["hpq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is HP Inc.."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-c456ab8f","guard":[["hasAny",["fslr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is First Solar."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-c4d77e5f","guard":[["hasAny",["item number","nth","position","rf"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Regions Financial Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-c779a2bd","guard":[["hasAny",["item number","nth","position","ppg"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Industries."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-cabcc24a","guard":[["hasAny",["item number","lite","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Lumentum."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-cb340507","guard":[["has","adsk"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Autodesk."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-d1984493","guard":[["hasAny",["csx","lower case","lowercase","no vowels","remove vowels","small letters","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Corporation."]},["transform.noVowels",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d583ce47","guard":[["hasAny",["br","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Broadridge Financial Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-da435c10","guard":[["has","wsm"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Williams-Sonoma, Inc.."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-dabd2d60","guard":[["has","evrg"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Evergy."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-dc924e59","guard":[["hasAny",["item number","j","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Jacobs Solutions."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-dce9a2ab","guard":[["hasAny",["item number","nth","position","pwr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Quanta Services."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-dd028f24","guard":[["has","bfb"]],"pyramid":["render.template",{"lit":["The ticker BF.",{"slot":0}," is Brown–Forman."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-de03f281","guard":[["hasAny",["item number","ko","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Coca-Cola Company (The)."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-df53e1e5","guard":[["has","mar"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Marriott International."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-dfa52fed","guard":[["has","adsk"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Autodesk."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-dfef6918","guard":[["hasAny",["br","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Broadridge Financial Solutions."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-dffe07bd","guard":[["hasAny",["cvx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Chevron Corporation."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-e4a5a1cf","guard":[["hasAny",["each word","ppg","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Industries."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e57bcdba","guard":[["hasAny",["item number","j","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Jacobs Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-e64168bc","guard":[["hasAny",["item number","mpc","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Marathon Petroleum."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-e7c03049","guard":[["hasAny",["frt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Federal Realty Investment Trust."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-e7c67a63","guard":[["has","mar"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Marriott International."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-e8b86602","guard":[["has","incy"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Incyte."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-e8f145a5","guard":[["has","cost"],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Costco."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-e99959e6","guard":[["has","bro"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Brown & Brown."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-ee9d9a75","guard":[["has","incy"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Incyte."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-f0800020","guard":[["hasAny",["cvs","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CVS Health."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-f0a803ed","guard":[["hasAny",["item number","nth","position","pwr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Quanta Services."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-f10a1805","guard":[["has","bfb"]],"pyramid":["render.template",{"lit":["The ticker BF.",{"slot":0}," is Brown–Forman."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-f111fcc8","guard":[["has","pru"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Prudential Financial."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-f13af1a5","guard":[["has","nee"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is NextEra Energy."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-f29d7e34","guard":[["hasAny",["item number","nth","position","ppg"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Industries."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-f2d5d5ae","guard":[["has","evrg"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Evergy."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-f353aee6","guard":[["hasAny",["abbreviate","acronym","capitalise","capitalize","capitalize each word","spgi","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1},"&P Global."]},["transform.title",["sense.lastWord"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-f54506a0","guard":[["hasAny",["csx","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Corporation."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f59178e3","guard":[["hasAny",["item number","nth","position","rf"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Regions Financial Corporation."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-f5e4a81e","guard":[["hasAny",["lower case","lowercase","ppg","small letters"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Industries."]},["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f621727d","guard":[["hasAny",["item number","meta","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Meta Platforms."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-f68e409a","guard":[["has","panw"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Palo Alto Networks."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-f753dd62","guard":[["hasAny",["item number","nth","position","wmb"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Williams Companies."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-f9c0b0b8","guard":[["hasAny",["item number","lite","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Lumentum."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-fa5c4428","guard":[["has","ndsn"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nordson Corporation."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-fb6bb613","guard":[["hasAny",["item number","ko","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Coca-Cola Company (The)."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-fd40982b","guard":[["has","cmcsa"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Comcast."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-05205c43","guard":[["hasAny",["alphabetize the letters","cvx","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Chevron Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-05b7536a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","sna","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Snap-on."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-07f34477","guard":[["hasAny",["csx","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Corporation."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-095806fa","guard":[["hasAny",["br","item number","lower case","lowercase","nth","position","small letters"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Broadridge Financial Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0ab7345d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mpc","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Marathon Petroleum."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0b710434","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cmi","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cummins."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-10b00d4b","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","vrsk","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Verisk Analytics."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-14475c9d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ice","item number","nth","position","title case"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Intercontinental Exchange."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-192e6409","guard":[["hasAny",["item number","lite","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Lumentum."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-19a26821","guard":[["hasAny",["dva","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is DaVita."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1b0b850a","guard":[["hasAny",["dis","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Walt Disney ",{"slot":1}," (The)."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1d1c982e","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","wmb"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Williams Companies."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-20491c6f","guard":[["hasAny",["item number","lower case","lowercase","msft","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Microsoft."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-20527ae7","guard":[["hasAny",["item number","lower case","lowercase","meta","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," META is ",{"slot":1}," Platforms."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-20ed25c6","guard":[["hasAny",["abt","alphabetize the letters","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Abbott Laboratories."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-2487307f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dis","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Walt Disney ",{"slot":1}," (The)."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2a83be72","guard":[["hasAny",["item number","j","nth","position","shortest","shortest one","shortest word"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Jacobs Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2e9b370e","guard":[["hasAny",["cvs","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Health."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-302e60d1","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","vrsk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Verisk Analytics."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-347bcbb9","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","without vowels","wmb"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Williams Companies."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-35b1b8f6","guard":[["hasAny",["fslr","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is First Solar."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-37be0e6e","guard":[["hasAny",["frt","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Federal Realty Investment Trust."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-405bad51","guard":[["hasAny",["item number","meta","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Platforms."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-41d0de13","guard":[["hasAny",["aig","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is American International Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-45d3b720","guard":[["hasAny",["cvx","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Chevron Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-473088df","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hpq","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is HP Inc.."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-48a4f98a","guard":[["hasAny",["frt","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Federal Realty Investment Trust."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4aff3a4e","guard":[["hasAny",["cvx","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Chevron Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-4c478ade","guard":[["hasAny",["abbreviate","acronym","item number","nth","position","spgi"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1},"&P Global."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-4cb12dd3","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","trgp","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Targa Resources."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-4dd8131a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","grmn","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Garmin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4fccfd1a","guard":[["hasAny",["grmn","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Garmin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-507fd8e2","guard":[["hasAny",["abbreviate","acronym","item number","nth","position","spgi"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1},"&P Global."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-5372c968","guard":[["hasAny",["abbreviate","acronym","each word","spgi","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1},"&P Global."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-56155baf","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","wec"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," WEC is ",{"slot":1}," Energy Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-563b2a05","guard":[["hasAny",["bdx","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Becton Dickinson."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-56ec74d6","guard":[["hasAny",["abt","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Abbott Laboratories."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-580164ab","guard":[["hasAny",["br","item number","no vowels","nth","position","remove vowels","without vowels"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Broadridge Financial Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-58db4412","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","trgp"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Targa Resources."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-616b95fa","guard":[["hasAny",["alphabetize the letters","ccl","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Carnival Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-679f4756","guard":[["hasAny",["item number","msft","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Microsoft."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-6d4439f6","guard":[["hasAny",["item number","no vowels","nth","position","pwr","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Quanta Services."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-6d7d2293","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","msft","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Microsoft."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6f68bc57","guard":[["hasAny",["alphabetize the letters","frt","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Federal Realty Investment Trust."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-6fb8a8bb","guard":[["hasAny",["ice","item number","lower case","lowercase","nth","position","small letters"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Intercontinental Exchange."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-744d94f9","guard":[["has","csx"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Corporation."]},["sense.lastWord"],["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-747af528","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","vrsk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Verisk Analytics."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-75712719","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fslr","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is First Solar."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-77b31991","guard":[["hasAny",["hpq","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is HP Inc.."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-793d4ccf","guard":[["hasAny",["abbreviate","acronym","item number","nth","position","tmus"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TMUS is ",{"slot":1},"-Mobile US."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-79821e03","guard":[["hasAny",["amzn","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Amazon."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-812aee5a","guard":[["hasAny",["item number","nth","position","wec"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Energy Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-82c0dff9","guard":[["hasAny",["item number","nth","position","rf","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Regions Financial Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-885ee3c4","guard":[["hasAny",["aig","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is American International Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-89553dae","guard":[["hasAny",["item number","lower case","lowercase","nth","position","ppg","small letters"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Industries."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8b0f65d0","guard":[["hasAny",["cvs","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CVS is ",{"slot":1}," Health."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8fb77528","guard":[["hasAny",["abbreviate","acronym","each word","spgi","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1},"&P Global."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-936d4072","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hpe","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hewlett Packard Enterprise."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-971ba7a7","guard":[["hasAny",["item number","ko","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Coca-Cola Company (The)."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a22b1af3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","wmb"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Williams Companies."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a2b20744","guard":[["hasAny",["cmi","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cummins."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a3e0f622","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","vtr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ventas."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a598c73c","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","wdc","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Western Digital."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-a9d7c4ca","guard":[["hasAny",["csx","each word","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Corporation."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-aa6a1653","guard":[["hasAny",["each word","lower case","lowercase","ppg","small letters","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Industries."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ae82053d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ccl","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Carnival Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-af9deec8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","pnw","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pinnacle West Capital."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-afb6870e","guard":[["hasAny",["alphabetize the letters","item number","ko","letters in order","nth","position","sort the letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Coca-Cola Company (The)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-b0a07e1e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","wdc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Western Digital."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b2a1bb5f","guard":[["hasAny",["item number","j","no vowels","nth","position","remove vowels","without vowels"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Jacobs Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-b3e902a3","guard":[["has","csx"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Corporation."]},["sense.lastWord"],["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]]],"mem":null},
{"id":"n-b7b7fca4","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","vtr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ventas."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b945db97","guard":[["hasAny",["bdx","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Becton Dickinson."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-b997ab71","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","pwr","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Quanta Services."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b9984c78","guard":[["hasAny",["each word","lower case","lowercase","ppg","small letters","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Industries."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ba5106df","guard":[["hasAny",["item number","j","lower case","lowercase","nth","position","small letters"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Jacobs Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-bcff9453","guard":[["hasAny",["item number","lower case","lowercase","nth","position","rf","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Regions Financial Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-beef6f78","guard":[["hasAny",["fslr","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is First Solar."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c1bd8985","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","rf","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Regions Financial Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c21ae6dd","guard":[["hasAny",["ccl","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Carnival Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c4e0a495","guard":[["hasAny",["ctsh","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cognizant."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-c75fd2fa","guard":[["hasAny",["hpe","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hewlett Packard Enterprise."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c7727ba9","guard":[["hasAny",["bdx","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Becton Dickinson."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c94c11fc","guard":[["hasAny",["grmn","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Garmin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ca727b3d","guard":[["hasAny",["hpq","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is HP Inc.."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cb63bac3","guard":[["hasAny",["item number","lower case","lowercase","nth","pnw","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pinnacle West Capital."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cb7f417f","guard":[["hasAny",["item number","lower case","lowercase","nth","position","ppg","small letters"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Industries."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cc99b076","guard":[["hasAny",["capitalise","capitalize","capitalize each word","frt","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Federal Realty Investment Trust."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cd84b353","guard":[["hasAny",["alphabetize the letters","bdx","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Becton Dickinson."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-d0189356","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","vtr","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ventas."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-d1aa43bd","guard":[["hasAny",["csx","each word","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Corporation."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d48c01fe","guard":[["hasAny",["item number","lower case","lowercase","nth","position","ppg","small letters"]],["has","company"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Industries."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d56568c6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","lite","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Lumentum."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d829297f","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","sna"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Snap-on."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d8762267","guard":[["hasAny",["item number","lower case","lowercase","mpc","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Marathon Petroleum."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-daef2329","guard":[["hasAny",["amzn","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Amazon."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-dc44af3b","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","rf","without vowels"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Regions Financial Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-e0a332b9","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","wdc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Western Digital."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e0d13523","guard":[["hasAny",["ctsh","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cognizant."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e14ecdc9","guard":[["hasAny",["abt","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Abbott Laboratories."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e33a3092","guard":[["hasAny",["item number","no vowels","nth","pnw","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pinnacle West Capital."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-e35f3729","guard":[["hasAny",["br","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Broadridge Financial Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e46b65c7","guard":[["hasAny",["item number","lower case","lowercase","nth","position","pwr","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Quanta Services."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e58c9bd8","guard":[["hasAny",["abbreviate","acronym","item number","nth","position","spgi"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1},"&P Global."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-e936a55d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cvx","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Chevron Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-eb130cd9","guard":[["hasAny",["cmi","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cummins."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.roman"]]],"mem":null},
{"id":"n-ec65c911","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","j","nth","position","title case"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Jacobs Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-eed035c0","guard":[["hasAny",["alphabetize the letters","hpq","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is HP Inc.."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-ef08a1e5","guard":[["hasAny",["item number","mpc","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Marathon Petroleum."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-ef23412a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","ko","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Coca-Cola Company (The)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-eff43238","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ctsh","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cognizant."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f575e819","guard":[["hasAny",["ccl","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Carnival Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-f6c1f3ae","guard":[["hasAny",["item number","ko","lower case","lowercase","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Coca-Cola Company (The)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f6f7760e","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","trgp"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Targa Resources."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-fb136509","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dva","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is DaVita."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ffc86471","guard":[["hasAny",["br","item number","nth","position","shortest","shortest one","shortest word"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Broadridge Financial Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0233073f","guard":[["hasAny",["hpq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is HP Inc.."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-02d61e84","guard":[["hasAny",["ccl","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Carnival Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0360255b","guard":[["hasAny",["ctsh","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cognizant."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0384fa90","guard":[["hasAny",["cvx","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Chevron Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-04b3daa0","guard":[["hasAny",["each word","fslr","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is First Solar."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0518c850","guard":[["hasAny",["each word","item number","nth","pnw","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pinnacle West Capital."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-06c58dfd","guard":[["hasAny",["dva","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is DaVita."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-08dbaf57","guard":[["hasAny",["br","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Broadridge Financial Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-09caf102","guard":[["hasAny",["item number","msft","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Microsoft."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-09f7bf7b","guard":[["hasAny",["each word","item number","nth","position","split into words","vtr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ventas."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0b3d3281","guard":[["hasAny",["item number","nth","position","rf"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Regions Financial Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0cb32096","guard":[["hasAny",["bdx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Becton Dickinson."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0e86260b","guard":[["hasAny",["amzn","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Amazon."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-118f18c8","guard":[["hasAny",["each word","item number","nth","position","split into words","vrsk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Verisk Analytics."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-143a359b","guard":[["hasAny",["each word","item number","nth","position","sna","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Snap-on."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-17e1624a","guard":[["hasAny",["fslr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is First Solar."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-195e28ea","guard":[["hasAny",["ccl","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Carnival Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-19a10f4b","guard":[["hasAny",["ctsh","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cognizant."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-19d20dc7","guard":[["hasAny",["dva","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is DaVita."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1b61ab35","guard":[["hasAny",["frt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Federal Realty Investment Trust."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1b8d1c3e","guard":[["hasAny",["item number","nth","position","vtr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ventas."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1ea9edbd","guard":[["hasAny",["dva","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is DaVita."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1fcfd68e","guard":[["hasAny",["each word","item number","ko","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Coca-Cola Company (The)."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-26273aa8","guard":[["hasAny",["item number","nth","position","vrsk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Verisk Analytics."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2647499c","guard":[["hasAny",["each word","item number","msft","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Microsoft."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-29eab6b8","guard":[["hasAny",["item number","nth","position","sna"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Snap-on."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-2b3e7698","guard":[["hasAny",["item number","ko","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Coca-Cola Company (The)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2c3b3a39","guard":[["hasAny",["item number","nth","position","trgp"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Targa Resources."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-2d523c37","guard":[["hasAny",["abt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Abbott Laboratories."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-366c4ec2","guard":[["hasAny",["each word","item number","nth","position","rf","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Regions Financial Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-36717d49","guard":[["hasAny",["csx","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Corporation."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3d24b03f","guard":[["hasAny",["amzn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Amazon."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-3d7ac78a","guard":[["hasAny",["cvx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Chevron Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3e1d04c4","guard":[["hasAny",["each word","hpe","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hewlett Packard Enterprise."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-42b1df75","guard":[["hasAny",["each word","item number","nth","position","split into words","trgp"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Targa Resources."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-47882caa","guard":[["hasAny",["item number","nth","position","sna"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Snap-on."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-479daf93","guard":[["hasAny",["br","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Broadridge Financial Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4847793d","guard":[["hasAny",["each word","hpq","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is HP Inc.."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-496273c5","guard":[["hasAny",["each word","item number","msft","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Microsoft."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-49b91d01","guard":[["hasAny",["each word","item number","nth","position","pwr","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Quanta Services."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4a64f4db","guard":[["hasAny",["item number","mpc","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Marathon Petroleum."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-4db80d29","guard":[["hasAny",["each word","grmn","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Garmin."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4e8f91a3","guard":[["hasAny",["item number","nth","position","pwr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Quanta Services."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4fa2f5ad","guard":[["hasAny",["each word","item number","nth","position","split into words","wdc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Western Digital."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-50824945","guard":[["hasAny",["dis","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Walt Disney ",{"slot":1}," (The)."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-52c6fccd","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","wec"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Energy Group."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-53614f64","guard":[["hasAny",["each word","hpq","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is HP Inc.."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-53e6a7a7","guard":[["hasAny",["item number","nth","position","vtr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ventas."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-574ce32d","guard":[["hasAny",["ctsh","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cognizant."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-599d4181","guard":[["hasAny",["cvs","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Health."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-59e33439","guard":[["hasAny",["grmn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Garmin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-5f4f4dea","guard":[["hasAny",["each word","item number","j","nth","position","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Jacobs Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6323d513","guard":[["hasAny",["hpe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hewlett Packard Enterprise."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-6502278a","guard":[["hasAny",["hpq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is HP Inc.."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-66a3c438","guard":[["hasAny",["each word","item number","lite","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Lumentum."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6802ae58","guard":[["hasAny",["item number","nth","position","wmb"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Williams Companies."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6ae50e33","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","wec"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Energy Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6c48e2e1","guard":[["hasAny",["each word","ice","item number","nth","position","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Intercontinental Exchange."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6cab8057","guard":[["hasAny",["item number","j","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Jacobs Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-6f6199df","guard":[["hasAny",["bdx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Becton Dickinson."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-6fffd559","guard":[["hasAny",["item number","nth","position","wdc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Western Digital."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-72491b1a","guard":[["hasAny",["item number","ko","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Coca-Cola Company (The)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-731cdca7","guard":[["hasAny",["dis","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Walt Disney ",{"slot":1}," (The)."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-736762a7","guard":[["hasAny",["item number","nth","position","trgp"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Targa Resources."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7652f37a","guard":[["hasAny",["each word","item number","nth","position","split into words","vtr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ventas."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-79933b9f","guard":[["hasAny",["each word","grmn","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Garmin."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7a6fe3bd","guard":[["hasAny",["abt","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Abbott Laboratories."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7ae5b6bf","guard":[["hasAny",["frt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Federal Realty Investment Trust."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-7c1334dd","guard":[["hasAny",["item number","lite","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Lumentum."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-834d7a4d","guard":[["hasAny",["cvs","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Health."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-84d74b58","guard":[["hasAny",["each word","item number","mpc","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Marathon Petroleum."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-866024b0","guard":[["hasAny",["item number","nth","position","wdc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Western Digital."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-868f7bda","guard":[["hasAny",["item number","nth","pnw","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pinnacle West Capital."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-86b44994","guard":[["hasAny",["abt","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Abbott Laboratories."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-878c3772","guard":[["hasAny",["each word","item number","j","nth","position","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Jacobs Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-88d5634d","guard":[["hasAny",["ccl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Carnival Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-88f997a3","guard":[["hasAny",["each word","item number","lite","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Lumentum."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8b39fc55","guard":[["hasAny",["each word","item number","nth","position","sna","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Snap-on."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8efb4aa7","guard":[["hasAny",["each word","frt","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Federal Realty Investment Trust."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-95c15b5c","guard":[["hasAny",["grmn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Garmin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-96218dcc","guard":[["hasAny",["item number","lower case","lowercase","meta","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Platforms."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-967c3d1d","guard":[["hasAny",["each word","frt","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Federal Realty Investment Trust."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-96b5dc4b","guard":[["hasAny",["each word","fslr","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is First Solar."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-96ed6681","guard":[["hasAny",["ctsh","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cognizant."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-987c1b9f","guard":[["hasAny",["each word","item number","nth","position","split into words","wmb"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Williams Companies."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9b7cca44","guard":[["hasAny",["item number","nth","position","pwr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Quanta Services."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-9c541651","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cvs","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Health."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9cce1c33","guard":[["hasAny",["aig","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is American International Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-a4cfb9ac","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","wec"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Energy Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a8f8d18a","guard":[["hasAny",["amzn","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Amazon."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a96c00fb","guard":[["hasAny",["aig","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is American International Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a9f11931","guard":[["hasAny",["each word","item number","nth","position","split into words","trgp"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Targa Resources."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-aa2602f5","guard":[["hasAny",["each word","item number","nth","position","split into words","vrsk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Verisk Analytics."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ad54d231","guard":[["hasAny",["cvs","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Health."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ade60f15","guard":[["hasAny",["each word","item number","nth","position","split into words","wdc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Western Digital."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b050ec0b","guard":[["hasAny",["each word","item number","nth","position","split into words","wmb"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Williams Companies."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b051eb63","guard":[["hasAny",["each word","item number","nth","pnw","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pinnacle West Capital."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b1b287cf","guard":[["hasAny",["item number","nth","position","rf"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Regions Financial Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-b263f981","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","meta","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Platforms."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b36fda47","guard":[["hasAny",["aig","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is American International Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b5969e3a","guard":[["hasAny",["each word","item number","nth","position","pwr","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Quanta Services."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b767b2a1","guard":[["hasAny",["each word","item number","mpc","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Marathon Petroleum."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ba1bbb07","guard":[["hasAny",["item number","j","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Jacobs Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bc8f4e0e","guard":[["hasAny",["bdx","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Becton Dickinson."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bd48053e","guard":[["hasAny",["cvx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Chevron Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-be2891ec","guard":[["hasAny",["br","each word","item number","nth","position","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Broadridge Financial Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c09f7d95","guard":[["hasAny",["each word","item number","ko","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Coca-Cola Company (The)."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c11fb9e2","guard":[["hasAny",["hpe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hewlett Packard Enterprise."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c1438446","guard":[["hasAny",["item number","nth","position","wmb"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Williams Companies."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-c17e1f28","guard":[["hasAny",["cmi","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cummins."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c575eee0","guard":[["hasAny",["each word","ice","item number","nth","position","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Intercontinental Exchange."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c5d09433","guard":[["hasAny",["each word","hpe","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hewlett Packard Enterprise."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d33071bf","guard":[["hasAny",["item number","msft","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Microsoft."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d3456ea4","guard":[["hasAny",["br","each word","item number","nth","position","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Broadridge Financial Solutions."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d6e77ff8","guard":[["hasAny",["item number","nth","pnw","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pinnacle West Capital."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d6f0a83c","guard":[["hasAny",["cmi","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cummins."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d7f8b5f7","guard":[["hasAny",["dva","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is DaVita."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-d8aa8d5f","guard":[["hasAny",["aig","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is American International Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-da805396","guard":[["hasAny",["fslr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is First Solar."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ddd5d6a6","guard":[["hasAny",["delete","dis","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Walt Disney ",{"slot":1}," (The)."]},["transform.remove",["sense.lastWord"],["sense.numeral"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-df4debba","guard":[["hasAny",["csx","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Corporation."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-dfd9681b","guard":[["hasAny",["abbreviate","acronym","item number","nth","position","tmus"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"-Mobile US."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-e21476b4","guard":[["hasAny",["amzn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Amazon."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e277ba14","guard":[["hasAny",["cmi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cummins."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e42de776","guard":[["hasAny",["cmi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cummins."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-e5e92189","guard":[["hasAny",["item number","nth","position","vrsk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Verisk Analytics."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-e98aef01","guard":[["hasAny",["item number","lower case","lowercase","meta","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Platforms."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ea145175","guard":[["hasAny",["each word","item number","nth","position","rf","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Regions Financial Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-eb25c69d","guard":[["hasAny",["item number","lite","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Lumentum."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ec086aaf","guard":[["hasAny",["bdx","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Becton Dickinson."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f0ac9829","guard":[["hasAny",["ccl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Carnival Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-f19427dc","guard":[["hasAny",["abbreviate","acronym","item number","nth","position","tmus"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"-Mobile US."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-f5e0f906","guard":[["hasAny",["ice","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Intercontinental Exchange."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f85b1f26","guard":[["hasAny",["ice","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Intercontinental Exchange."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-f8bf04be","guard":[["hasAny",["item number","mpc","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Marathon Petroleum."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f900c073","guard":[["hasAny",["dis","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Walt Disney ",{"slot":1}," (The)."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-facaf2c3","guard":[["hasAny",["abt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Abbott Laboratories."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-fe24941b","guard":[["hasAny",["cvx","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Chevron Corporation."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0ce0c21e","guard":[["hasAny",["item number","lower case","lowercase","meta","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Platforms."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0d3a747e","guard":[["hasAny",["item number","meta","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Platforms."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-2e0a332f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","lower case","lowercase","nth","position","small letters","title case","wec"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Energy Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-30163afb","guard":[["hasAny",["each word","item number","nth","position","split into words","wec"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Energy Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-42e5e11e","guard":[["hasAny",["item number","nth","position","wec"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Energy Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-45a3c569","guard":[["hasAny",["cvs","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Health."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4d9b516b","guard":[["hasAny",["cvs","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Health."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4ef455b0","guard":[["hasAny",["each word","item number","nth","position","split into words","wec"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Energy Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4ef96ed8","guard":[["hasAny",["item number","nth","position","wec"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Energy Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-4fa26aa2","guard":[["hasAny",["cvs","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Health."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5ef90a15","guard":[["hasAny",["abbreviate","acronym","capitalise","capitalize","capitalize each word","item number","nth","position","title case","tmus"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"-Mobile US."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-7e0cddf5","guard":[["hasAny",["dis","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Walt Disney ",{"slot":1}," (The)."]},["render.and",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8dd97a00","guard":[["hasAny",["each word","item number","meta","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Platforms."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-980a7654","guard":[["hasAny",["cvs","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Health."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-983b9f87","guard":[["hasAny",["abbreviate","acronym","item number","lower case","lowercase","nth","position","small letters","tmus"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"-Mobile US."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-9b0e2cf7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cvs","item number","lower case","lowercase","nth","position","small letters","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Health."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9f7ce2bf","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","lower case","lowercase","meta","nth","position","small letters","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Platforms."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a1e7767c","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","wec"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Energy Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b3c7c9ae","guard":[["hasAny",["dis","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Walt Disney ",{"slot":1}," (The)."]},["render.list",["iterate.repeat",["sense.lastWord"],["sense.howMany"]]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b43b9446","guard":[["hasAny",["item number","meta","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Platforms."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d3911af4","guard":[["hasAny",["each word","item number","meta","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Platforms."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e895c1af","guard":[["hasAny",["cvs","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Health."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f1b06cce","guard":[["hasAny",["cvs","item number","lower case","lowercase","no vowels","nth","position","remove vowels","small letters","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Health."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-16fdd6af","guard":[["hasAny",["each word","item number","lower case","lowercase","meta","nth","position","small letters","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Platforms."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2ecf8145","guard":[["hasAny",["abbreviate","acronym","item number","nth","position","tmus"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"-Mobile US."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-348f7281","guard":[["hasAny",["each word","item number","lower case","lowercase","nth","position","small letters","split into words","wec"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Energy Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6e08efe6","guard":[["hasAny",["cvs","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Health."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-740b2d75","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","wec"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Energy Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-783395ca","guard":[["hasAny",["item number","lower case","lowercase","meta","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Platforms."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7c04ece4","guard":[["hasAny",["each word","item number","lower case","lowercase","meta","nth","position","small letters","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Platforms."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8034bf03","guard":[["hasAny",["item number","lower case","lowercase","meta","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Platforms."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9c84dc46","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","wec"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Energy Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-af52cdb3","guard":[["hasAny",["abbreviate","acronym","each word","item number","nth","position","split into words","tmus"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"-Mobile US."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-af6eab6c","guard":[["hasAny",["abbreviate","acronym","item number","nth","position","tmus"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"-Mobile US."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-c319d72f","guard":[["hasAny",["cvs","each word","item number","lower case","lowercase","nth","position","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Health."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d7bdc5c0","guard":[["hasAny",["cvs","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Health."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d8cb3d10","guard":[["hasAny",["each word","item number","lower case","lowercase","nth","position","small letters","split into words","wec"]],["has","company"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Energy Group."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e3903426","guard":[["hasAny",["cvs","each word","item number","lower case","lowercase","nth","position","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Health."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f9d6e7b6","guard":[["hasAny",["abbreviate","acronym","each word","item number","nth","position","split into words","tmus"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"-Mobile US."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]],["transform.acronym",["sense.lastWord"]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the S&P 500 company with the symbol PYPL","expect":{"contains":["PayPal"],"notRefusal":true}},{"q":"which company has the ticker ICE","expect":{"contains":["Intercontinental Exchange"],"notRefusal":true}},{"q":"what company trades as C","expect":{"contains":["Citigroup"],"notRefusal":true}},{"q":"which company has the ticker CMI","expect":{"contains":["Cummins"],"notRefusal":true}},{"q":"which company has the ticker J","expect":{"contains":["Jacobs Solutions"],"notRefusal":true}},{"q":"name the S&P 500 company with the symbol EVRG","expect":{"contains":["Evergy"],"notRefusal":true}},{"q":"name the S&P 500 company with the symbol TPR","expect":{"contains":["Tapestry, Inc."],"notRefusal":true}},{"q":"what company trades as DDOG","expect":{"contains":["Datadog"],"notRefusal":true}},{"q":"what company trades as IRM","expect":{"contains":["Iron Mountain"],"notRefusal":true}},{"q":"what company trades as GILD","expect":{"contains":["Gilead Sciences"],"notRefusal":true}},{"q":"name the S&P 500 company with the symbol DHR","expect":{"contains":["Danaher Corporation"],"notRefusal":true}},{"q":"which company has the ticker KO","expect":{"contains":["Coca-Cola Company (The)"],"notRefusal":true}},{"q":"which company has the ticker VTR","expect":{"contains":["Ventas"],"notRefusal":true}},{"q":"what company trades as TRMB","expect":{"contains":["Trimble Inc."],"notRefusal":true}},{"q":"name the S&P 500 company with the symbol HWM","expect":{"contains":["Howmet Aerospace"],"notRefusal":true}},{"q":"what company trades as VTRS","expect":{"contains":["Viatris"],"notRefusal":true}},{"q":"which company has the ticker META","expect":{"contains":["Meta Platforms"],"notRefusal":true}},{"q":"name the S&P 500 company with the symbol LVS","expect":{"contains":["Las Vegas Sands"],"notRefusal":true}},{"q":"name the S&P 500 company with the symbol SW","expect":{"contains":["Smurfit Westrock"],"notRefusal":true}},{"q":"what company trades as V","expect":{"contains":["Visa Inc."],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
