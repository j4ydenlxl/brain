// city-country-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"city-country-neo-g6","class":"city-country","generation":6,"lane":"neo","grownFrom":["which country is the city Garuva in","name the country where Yecapixtla lies","name the country where Zapala lies","name the country where Kirchlengern lies","name the country where Cha-am lies","name the country where Kenol lies","name the country where Markala lies","which country is the city Yemanzhelinsk in","in what country is Qiryat Motsqin","name the country where Irati lies","in what country is Zhmerynka","which country is the city Tikrīt in","name the country where Governador Edison Lobão lies","in what country is Changling","name the country where Dashtobod lies","in what country is Pāthri","name the country where Randburg lies","which country is the city Khromtau in","name the country where Massamá lies","name the country where Fūman lies"],"version":1});

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
{"id":"n-7a0fa5c6","guard":[["has","country"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Garuva in":"Garuva is in Brazil.","name the country where Yecapixtla lies":"Yecapixtla is in Mexico.","name the country where Zapala lies":"Zapala is in Argentina.","name the country where Kirchlengern lies":"Kirchlengern is in Germany.","name the country where Cha-am lies":"Cha-am is in Thailand.","name the country where Kenol lies":"Kenol is in Kenya.","name the country where Markala lies":"Markala is in Mali.","which country is the city Yemanzhelinsk in":"Yemanzhelinsk is in Russian Federation.","in what country is Qiryat Motsqin":"Qiryat Motsqin is in Israel.","name the country where Irati lies":"Irati is in Brazil.","in what country is Zhmerynka":"Zhmerynka is in Ukraine.","which country is the city Tikrīt in":"Tikrīt is in Iraq.","name the country where Governador Edison Lobão lies":"Governador Edison Lobão is in Brazil.","in what country is Changling":"Changling is in China.","name the country where Dashtobod lies":"Dashtobod is in Uzbekistan.","in what country is Pāthri":"Pāthri is in India.","name the country where Randburg lies":"Randburg is in South Africa.","which country is the city Khromtau in":"Khromtau is in Kazakhstan.","name the country where Massamá lies":"Massamá is in Portugal.","name the country where Fūman lies":"Fūman is in Iran, Islamic Republic of.","name the country where Włocławek lies":"Włocławek is in Poland.","which country is the city Saraktash in":"Saraktash is in Russian Federation.","in what country is Dosso":"Dosso is in Niger.","in what country is Tashtagol":"Tashtagol is in Russian Federation.","which country is the city Ayutuxtepeque in":"Ayutuxtepeque is in El Salvador.","which country is the city La Porte in":"La Porte is in United States.","which country is the city Sirohi in":"Sirohi is in India.","name the country where Zamānia lies":"Zamānia is in India.","which country is the city Bongao in":"Bongao is in Philippines.","which country is the city Bau in":"Bau is in Malaysia.","which country is the city Chetouane in":"Chetouane is in Algeria.","which country is the city Sonsonate in":"Sonsonate is in El Salvador.","in what country is Petrovsk-Zabaykal’skiy":"Petrovsk-Zabaykal’skiy is in Russian Federation.","name the country where Bradenton lies":"Bradenton is in United States.","which country is the city Easthampton in":"Easthampton is in United States.","name the country where Erdaojiang lies":"Erdaojiang is in China.","name the country where Oak Park lies":"Oak Park is in United States.","which country is the city Nong Bua Lamphu in":"Nong Bua Lamphu is in Thailand.","in what country is Thị Trấn Trùng Khánh":"Thị Trấn Trùng Khánh is in Viet Nam.","in what country is Chitaguppa":"Chitaguppa is in India.","which country is the city Tiwi in":"Tiwi is in Philippines.","name the country where Huayuan lies":"Huayuan is in China.","which country is the city Altona-Nord in":"Altona-Nord is in Germany.","in what country is Arandas":"Arandas is in Mexico.","in what country is Gunjur":"Gunjur is in Gambia.","in what country is Iringal":"Iringal is in India.","name the country where Alindao lies":"Alindao is in Central African Republic.","which country is the city Nattappettai in":"Nattappettai is in India.","which country is the city Tlaltenango de Sánchez Román in":"Tlaltenango de Sánchez Román is in Mexico.","name the country where Alfena lies":"Alfena is in Portugal.","in what country is Champigny-sur-Marne":"Champigny-sur-Marne is in France.","in what country is Dargeçit":"Dargeçit is in Türkiye.","in what country is Menomonee Falls":"Menomonee Falls is in United States.","in what country is Maheshtala":"Maheshtala is in India.","name the country where les Roquetes lies":"les Roquetes is in Spain.","which country is the city Plunge in":"Plunge is in Lithuania.","which country is the city Elmont in":"Elmont is in United States.","in what country is Llucmajor":"Llucmajor is in Spain.","name the country where Kérou lies":"Kérou is in Benin.","in what country is Duba":"Duba is in Saudi Arabia.","which country is the city Ramona in":"Ramona is in United States.","in what country is Sestri Levante":"Sestri Levante is in Italy.","name the country where Kempston Hardwick lies":"Kempston Hardwick is in United Kingdom.","name the country where Sant Carles de la Ràpita lies":"Sant Carles de la Ràpita is in Spain.","which country is the city Igurusi in":"Igurusi is in Tanzania, United Republic of.","which country is the city Bekwai in":"Bekwai is in Ghana.","in what country is Chenôve":"Chenôve is in France.","name the country where Dubnica nad Váhom lies":"Dubnica nad Váhom is in Slovakia.","which country is the city Sector 5 in":"Sector 5 is in Romania.","which country is the city Kanowit in":"Kanowit is in Malaysia.","in what country is Leland":"Leland is in United States.","name the country where Shakhtarske lies":"Shakhtarske is in Ukraine.","in what country is Lohr am Main":"Lohr am Main is in Germany.","in what country is Gihombo":"Gihombo is in Rwanda.","in what country is Saint Clair Shores":"Saint Clair Shores is in United States.","which country is the city Tsentralnyi in":"Tsentralnyi is in Ukraine.","in what country is Achaguas":"Achaguas is in Venezuela, Bolivarian Republic of.","in what country is Tonami":"Tonami is in Japan.","in what country is Deerfield":"Deerfield is in United States.","in what country is Mondragone":"Mondragone is in Italy.","in what country is Mponela":"Mponela is in Malawi.","which country is the city Bacuri in":"Bacuri is in Brazil.","which country is the city Ortaca in":"Ortaca is in Türkiye.","which country is the city Cernusco sul Naviglio in":"Cernusco sul Naviglio is in Italy.","name the country where Sobradinho II lies":"Sobradinho II is in Brazil.","name the country where Tingo María lies":"Tingo María is in Peru.","in what country is Picassent":"Picassent is in Spain.","which country is the city Rockcliffe-Smythe in":"Rockcliffe-Smythe is in Canada.","name the country where Santa Terezinha de Itaipu lies":"Santa Terezinha de Itaipu is in Brazil.","in what country is Montrose":"Montrose is in United States.","name the country where Iyesi lies":"Iyesi is in Nigeria.","in what country is Revelganj":"Revelganj is in India.","name the country where Kawasan Penempatan Ulu Benut Tiga lies":"Kawasan Penempatan Ulu Benut Tiga is in Malaysia.","in what country is Lai Châu":"Lai Châu is in Viet Nam.","which country is the city Qabqa in":"Qabqa is in China.","which country is the city Taitou in":"Taitou is in China.","which country is the city Maldegem in":"Maldegem is in Belgium.","name the country where South Dublin lies":"South Dublin is in Ireland.","name the country where Firmat lies":"Firmat is in Argentina."}}},
{"id":"n-dc924445","guard":[["has","country"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"country"}]]],"mem":{"table":{"is the city Garuva in":"Garuva is in Brazil.","where Yecapixtla lies":"Yecapixtla is in Mexico.","where Zapala lies":"Zapala is in Argentina.","where Kirchlengern lies":"Kirchlengern is in Germany.","where Cha-am lies":"Cha-am is in Thailand.","where Kenol lies":"Kenol is in Kenya.","where Markala lies":"Markala is in Mali.","is the city Yemanzhelinsk in":"Yemanzhelinsk is in Russian Federation.","is Qiryat Motsqin":"Qiryat Motsqin is in Israel.","where Irati lies":"Irati is in Brazil.","is Zhmerynka":"Zhmerynka is in Ukraine.","is the city Tikrīt in":"Tikrīt is in Iraq.","where Governador Edison Lobão lies":"Governador Edison Lobão is in Brazil.","is Changling":"Changling is in China.","where Dashtobod lies":"Dashtobod is in Uzbekistan.","is Pāthri":"Pāthri is in India.","where Randburg lies":"Randburg is in South Africa.","is the city Khromtau in":"Khromtau is in Kazakhstan.","where Massamá lies":"Massamá is in Portugal.","where Fūman lies":"Fūman is in Iran, Islamic Republic of.","where Włocławek lies":"Włocławek is in Poland.","is the city Saraktash in":"Saraktash is in Russian Federation.","is Dosso":"Dosso is in Niger.","is Tashtagol":"Tashtagol is in Russian Federation.","is the city Ayutuxtepeque in":"Ayutuxtepeque is in El Salvador.","is the city La Porte in":"La Porte is in United States.","is the city Sirohi in":"Sirohi is in India.","where Zamānia lies":"Zamānia is in India.","is the city Bongao in":"Bongao is in Philippines.","is the city Bau in":"Bau is in Malaysia.","is the city Chetouane in":"Chetouane is in Algeria.","is the city Sonsonate in":"Sonsonate is in El Salvador.","is Petrovsk-Zabaykal’skiy":"Petrovsk-Zabaykal’skiy is in Russian Federation.","where Bradenton lies":"Bradenton is in United States.","is the city Easthampton in":"Easthampton is in United States.","where Erdaojiang lies":"Erdaojiang is in China.","where Oak Park lies":"Oak Park is in United States.","is the city Nong Bua Lamphu in":"Nong Bua Lamphu is in Thailand.","is Thị Trấn Trùng Khánh":"Thị Trấn Trùng Khánh is in Viet Nam.","is Chitaguppa":"Chitaguppa is in India.","is the city Tiwi in":"Tiwi is in Philippines.","where Huayuan lies":"Huayuan is in China.","is the city Altona-Nord in":"Altona-Nord is in Germany.","is Arandas":"Arandas is in Mexico.","is Gunjur":"Gunjur is in Gambia.","is Iringal":"Iringal is in India.","where Alindao lies":"Alindao is in Central African Republic.","is the city Nattappettai in":"Nattappettai is in India.","is the city Tlaltenango de Sánchez Román in":"Tlaltenango de Sánchez Román is in Mexico.","where Alfena lies":"Alfena is in Portugal.","is Champigny-sur-Marne":"Champigny-sur-Marne is in France.","is Dargeçit":"Dargeçit is in Türkiye.","is Menomonee Falls":"Menomonee Falls is in United States.","is Maheshtala":"Maheshtala is in India.","where les Roquetes lies":"les Roquetes is in Spain.","is the city Plunge in":"Plunge is in Lithuania.","is the city Elmont in":"Elmont is in United States.","is Llucmajor":"Llucmajor is in Spain.","where Kérou lies":"Kérou is in Benin.","is Duba":"Duba is in Saudi Arabia.","is the city Ramona in":"Ramona is in United States.","is Sestri Levante":"Sestri Levante is in Italy.","where Kempston Hardwick lies":"Kempston Hardwick is in United Kingdom.","where Sant Carles de la Ràpita lies":"Sant Carles de la Ràpita is in Spain.","is the city Igurusi in":"Igurusi is in Tanzania, United Republic of.","is the city Bekwai in":"Bekwai is in Ghana.","is Chenôve":"Chenôve is in France.","where Dubnica nad Váhom lies":"Dubnica nad Váhom is in Slovakia.","is the city Sector 5 in":"Sector 5 is in Romania.","is the city Kanowit in":"Kanowit is in Malaysia.","is Leland":"Leland is in United States.","where Shakhtarske lies":"Shakhtarske is in Ukraine.","is Lohr am Main":"Lohr am Main is in Germany.","is Gihombo":"Gihombo is in Rwanda.","is Saint Clair Shores":"Saint Clair Shores is in United States.","is the city Tsentralnyi in":"Tsentralnyi is in Ukraine.","is Achaguas":"Achaguas is in Venezuela, Bolivarian Republic of.","is Tonami":"Tonami is in Japan.","is Deerfield":"Deerfield is in United States.","is Mondragone":"Mondragone is in Italy.","is Mponela":"Mponela is in Malawi.","is the city Bacuri in":"Bacuri is in Brazil.","is the city Ortaca in":"Ortaca is in Türkiye.","is the city Cernusco sul Naviglio in":"Cernusco sul Naviglio is in Italy.","where Sobradinho II lies":"Sobradinho II is in Brazil.","where Tingo María lies":"Tingo María is in Peru.","is Picassent":"Picassent is in Spain.","is the city Rockcliffe-Smythe in":"Rockcliffe-Smythe is in Canada.","where Santa Terezinha de Itaipu lies":"Santa Terezinha de Itaipu is in Brazil.","is Montrose":"Montrose is in United States.","where Iyesi lies":"Iyesi is in Nigeria.","is Revelganj":"Revelganj is in India.","where Kawasan Penempatan Ulu Benut Tiga lies":"Kawasan Penempatan Ulu Benut Tiga is in Malaysia.","is Lai Châu":"Lai Châu is in Viet Nam.","is the city Qabqa in":"Qabqa is in China.","is the city Taitou in":"Taitou is in China.","is the city Maldegem in":"Maldegem is in Belgium.","where South Dublin lies":"South Dublin is in Ireland.","where Firmat lies":"Firmat is in Argentina."}}},
{"id":"n-edb3a468","guard":[["has","country"],["not",["has","of"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Garuva in":"Garuva is in Brazil.","name the country where Yecapixtla lies":"Yecapixtla is in Mexico.","name the country where Zapala lies":"Zapala is in Argentina.","name the country where Kirchlengern lies":"Kirchlengern is in Germany.","name the country where Cha-am lies":"Cha-am is in Thailand.","name the country where Kenol lies":"Kenol is in Kenya.","name the country where Markala lies":"Markala is in Mali.","which country is the city Yemanzhelinsk in":"Yemanzhelinsk is in Russian Federation.","in what country is Qiryat Motsqin":"Qiryat Motsqin is in Israel.","name the country where Irati lies":"Irati is in Brazil.","in what country is Zhmerynka":"Zhmerynka is in Ukraine.","which country is the city Tikrīt in":"Tikrīt is in Iraq.","name the country where Governador Edison Lobão lies":"Governador Edison Lobão is in Brazil.","in what country is Changling":"Changling is in China.","name the country where Dashtobod lies":"Dashtobod is in Uzbekistan.","in what country is Pāthri":"Pāthri is in India.","name the country where Randburg lies":"Randburg is in South Africa.","which country is the city Khromtau in":"Khromtau is in Kazakhstan.","name the country where Massamá lies":"Massamá is in Portugal.","name the country where Fūman lies":"Fūman is in Iran, Islamic Republic of.","name the country where Włocławek lies":"Włocławek is in Poland.","which country is the city Saraktash in":"Saraktash is in Russian Federation.","in what country is Dosso":"Dosso is in Niger.","in what country is Tashtagol":"Tashtagol is in Russian Federation.","which country is the city Ayutuxtepeque in":"Ayutuxtepeque is in El Salvador.","which country is the city La Porte in":"La Porte is in United States.","which country is the city Sirohi in":"Sirohi is in India.","name the country where Zamānia lies":"Zamānia is in India.","which country is the city Bongao in":"Bongao is in Philippines.","which country is the city Bau in":"Bau is in Malaysia.","which country is the city Chetouane in":"Chetouane is in Algeria.","which country is the city Sonsonate in":"Sonsonate is in El Salvador.","in what country is Petrovsk-Zabaykal’skiy":"Petrovsk-Zabaykal’skiy is in Russian Federation.","name the country where Bradenton lies":"Bradenton is in United States.","which country is the city Easthampton in":"Easthampton is in United States.","name the country where Erdaojiang lies":"Erdaojiang is in China.","name the country where Oak Park lies":"Oak Park is in United States.","which country is the city Nong Bua Lamphu in":"Nong Bua Lamphu is in Thailand.","in what country is Thị Trấn Trùng Khánh":"Thị Trấn Trùng Khánh is in Viet Nam.","in what country is Chitaguppa":"Chitaguppa is in India.","which country is the city Tiwi in":"Tiwi is in Philippines.","name the country where Huayuan lies":"Huayuan is in China.","which country is the city Altona-Nord in":"Altona-Nord is in Germany.","in what country is Arandas":"Arandas is in Mexico.","in what country is Gunjur":"Gunjur is in Gambia.","in what country is Iringal":"Iringal is in India.","name the country where Alindao lies":"Alindao is in Central African Republic.","which country is the city Nattappettai in":"Nattappettai is in India.","which country is the city Tlaltenango de Sánchez Román in":"Tlaltenango de Sánchez Román is in Mexico.","name the country where Alfena lies":"Alfena is in Portugal.","in what country is Champigny-sur-Marne":"Champigny-sur-Marne is in France.","in what country is Dargeçit":"Dargeçit is in Türkiye.","in what country is Menomonee Falls":"Menomonee Falls is in United States.","in what country is Maheshtala":"Maheshtala is in India.","name the country where les Roquetes lies":"les Roquetes is in Spain.","which country is the city Plunge in":"Plunge is in Lithuania.","which country is the city Elmont in":"Elmont is in United States.","in what country is Llucmajor":"Llucmajor is in Spain.","name the country where Kérou lies":"Kérou is in Benin.","in what country is Duba":"Duba is in Saudi Arabia.","which country is the city Ramona in":"Ramona is in United States.","in what country is Sestri Levante":"Sestri Levante is in Italy.","name the country where Kempston Hardwick lies":"Kempston Hardwick is in United Kingdom.","name the country where Sant Carles de la Ràpita lies":"Sant Carles de la Ràpita is in Spain.","which country is the city Igurusi in":"Igurusi is in Tanzania, United Republic of.","which country is the city Bekwai in":"Bekwai is in Ghana.","in what country is Chenôve":"Chenôve is in France.","name the country where Dubnica nad Váhom lies":"Dubnica nad Váhom is in Slovakia.","which country is the city Kanowit in":"Kanowit is in Malaysia.","in what country is Leland":"Leland is in United States.","name the country where Shakhtarske lies":"Shakhtarske is in Ukraine.","in what country is Lohr am Main":"Lohr am Main is in Germany.","in what country is Gihombo":"Gihombo is in Rwanda.","in what country is Saint Clair Shores":"Saint Clair Shores is in United States.","which country is the city Tsentralnyi in":"Tsentralnyi is in Ukraine.","in what country is Achaguas":"Achaguas is in Venezuela, Bolivarian Republic of.","in what country is Tonami":"Tonami is in Japan.","in what country is Deerfield":"Deerfield is in United States.","in what country is Mondragone":"Mondragone is in Italy.","in what country is Mponela":"Mponela is in Malawi.","which country is the city Bacuri in":"Bacuri is in Brazil.","which country is the city Ortaca in":"Ortaca is in Türkiye.","which country is the city Cernusco sul Naviglio in":"Cernusco sul Naviglio is in Italy.","name the country where Sobradinho II lies":"Sobradinho II is in Brazil.","name the country where Tingo María lies":"Tingo María is in Peru.","in what country is Picassent":"Picassent is in Spain.","which country is the city Rockcliffe-Smythe in":"Rockcliffe-Smythe is in Canada.","name the country where Santa Terezinha de Itaipu lies":"Santa Terezinha de Itaipu is in Brazil.","in what country is Montrose":"Montrose is in United States.","name the country where Iyesi lies":"Iyesi is in Nigeria.","in what country is Revelganj":"Revelganj is in India.","name the country where Kawasan Penempatan Ulu Benut Tiga lies":"Kawasan Penempatan Ulu Benut Tiga is in Malaysia.","in what country is Lai Châu":"Lai Châu is in Viet Nam.","which country is the city Qabqa in":"Qabqa is in China.","which country is the city Taitou in":"Taitou is in China.","which country is the city Maldegem in":"Maldegem is in Belgium.","name the country where South Dublin lies":"South Dublin is in Ireland.","name the country where Firmat lies":"Firmat is in Argentina."}}},
{"id":"n-92557b8e","guard":[["has","country"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the city Garuva in":"Garuva is in Brazil.","the city Yemanzhelinsk in":"Yemanzhelinsk is in Russian Federation.","Qiryat Motsqin":"Qiryat Motsqin is in Israel.","Zhmerynka":"Zhmerynka is in Ukraine.","the city Tikrīt in":"Tikrīt is in Iraq.","Changling":"Changling is in China.","Pāthri":"Pāthri is in India.","the city Khromtau in":"Khromtau is in Kazakhstan.","the city Saraktash in":"Saraktash is in Russian Federation.","Dosso":"Dosso is in Niger.","Tashtagol":"Tashtagol is in Russian Federation.","the city Ayutuxtepeque in":"Ayutuxtepeque is in El Salvador.","the city La Porte in":"La Porte is in United States.","the city Sirohi in":"Sirohi is in India.","the city Bongao in":"Bongao is in Philippines.","the city Bau in":"Bau is in Malaysia.","the city Chetouane in":"Chetouane is in Algeria.","the city Sonsonate in":"Sonsonate is in El Salvador.","Petrovsk-Zabaykal’skiy":"Petrovsk-Zabaykal’skiy is in Russian Federation.","the city Easthampton in":"Easthampton is in United States.","the city Nong Bua Lamphu in":"Nong Bua Lamphu is in Thailand.","Thị Trấn Trùng Khánh":"Thị Trấn Trùng Khánh is in Viet Nam.","Chitaguppa":"Chitaguppa is in India.","the city Tiwi in":"Tiwi is in Philippines.","the city Altona-Nord in":"Altona-Nord is in Germany.","Arandas":"Arandas is in Mexico.","Gunjur":"Gunjur is in Gambia.","Iringal":"Iringal is in India.","the city Nattappettai in":"Nattappettai is in India.","the city Tlaltenango de Sánchez Román in":"Tlaltenango de Sánchez Román is in Mexico.","Champigny-sur-Marne":"Champigny-sur-Marne is in France.","Dargeçit":"Dargeçit is in Türkiye.","Menomonee Falls":"Menomonee Falls is in United States.","Maheshtala":"Maheshtala is in India.","the city Plunge in":"Plunge is in Lithuania.","the city Elmont in":"Elmont is in United States.","Llucmajor":"Llucmajor is in Spain.","Duba":"Duba is in Saudi Arabia.","the city Ramona in":"Ramona is in United States.","Sestri Levante":"Sestri Levante is in Italy.","the city Igurusi in":"Igurusi is in Tanzania, United Republic of.","the city Bekwai in":"Bekwai is in Ghana.","Chenôve":"Chenôve is in France.","the city Sector 5 in":"Sector 5 is in Romania.","the city Kanowit in":"Kanowit is in Malaysia.","Leland":"Leland is in United States.","Lohr am Main":"Lohr am Main is in Germany.","Gihombo":"Gihombo is in Rwanda.","Saint Clair Shores":"Saint Clair Shores is in United States.","the city Tsentralnyi in":"Tsentralnyi is in Ukraine.","Achaguas":"Achaguas is in Venezuela, Bolivarian Republic of.","Tonami":"Tonami is in Japan.","Deerfield":"Deerfield is in United States.","Mondragone":"Mondragone is in Italy.","Mponela":"Mponela is in Malawi.","the city Bacuri in":"Bacuri is in Brazil.","the city Ortaca in":"Ortaca is in Türkiye.","the city Cernusco sul Naviglio in":"Cernusco sul Naviglio is in Italy.","Picassent":"Picassent is in Spain.","the city Rockcliffe-Smythe in":"Rockcliffe-Smythe is in Canada.","Montrose":"Montrose is in United States.","Revelganj":"Revelganj is in India.","Lai Châu":"Lai Châu is in Viet Nam.","the city Qabqa in":"Qabqa is in China.","the city Taitou in":"Taitou is in China.","the city Maldegem in":"Maldegem is in Belgium."}}},
{"id":"n-84ba5231","guard":[["has","country"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"in"}]]],"mem":{"table":{"what country is Qiryat Motsqin":"Qiryat Motsqin is in Israel.","what country is Zhmerynka":"Zhmerynka is in Ukraine.","what country is Changling":"Changling is in China.","what country is Pāthri":"Pāthri is in India.","what country is Dosso":"Dosso is in Niger.","what country is Tashtagol":"Tashtagol is in Russian Federation.","what country is Petrovsk-Zabaykal’skiy":"Petrovsk-Zabaykal’skiy is in Russian Federation.","what country is Thị Trấn Trùng Khánh":"Thị Trấn Trùng Khánh is in Viet Nam.","what country is Chitaguppa":"Chitaguppa is in India.","what country is Arandas":"Arandas is in Mexico.","what country is Gunjur":"Gunjur is in Gambia.","what country is Iringal":"Iringal is in India.","what country is Champigny-sur-Marne":"Champigny-sur-Marne is in France.","what country is Dargeçit":"Dargeçit is in Türkiye.","what country is Menomonee Falls":"Menomonee Falls is in United States.","what country is Maheshtala":"Maheshtala is in India.","what country is Llucmajor":"Llucmajor is in Spain.","what country is Duba":"Duba is in Saudi Arabia.","what country is Sestri Levante":"Sestri Levante is in Italy.","what country is Chenôve":"Chenôve is in France.","what country is Leland":"Leland is in United States.","what country is Lohr am Main":"Lohr am Main is in Germany.","what country is Gihombo":"Gihombo is in Rwanda.","what country is Saint Clair Shores":"Saint Clair Shores is in United States.","what country is Achaguas":"Achaguas is in Venezuela, Bolivarian Republic of.","what country is Tonami":"Tonami is in Japan.","what country is Deerfield":"Deerfield is in United States.","what country is Mondragone":"Mondragone is in Italy.","what country is Mponela":"Mponela is in Malawi.","what country is Picassent":"Picassent is in Spain.","what country is Montrose":"Montrose is in United States.","what country is Revelganj":"Revelganj is in India.","what country is Lai Châu":"Lai Châu is in Viet Nam."}}},
{"id":"n-d2671795","guard":[["has","city"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"in"}]]],"mem":{"table":{"which country is the city Garuva":"Garuva is in Brazil.","which country is the city Yemanzhelinsk":"Yemanzhelinsk is in Russian Federation.","which country is the city Tikrīt":"Tikrīt is in Iraq.","which country is the city Khromtau":"Khromtau is in Kazakhstan.","which country is the city Saraktash":"Saraktash is in Russian Federation.","which country is the city Ayutuxtepeque":"Ayutuxtepeque is in El Salvador.","which country is the city La Porte":"La Porte is in United States.","which country is the city Sirohi":"Sirohi is in India.","which country is the city Bongao":"Bongao is in Philippines.","which country is the city Bau":"Bau is in Malaysia.","which country is the city Chetouane":"Chetouane is in Algeria.","which country is the city Sonsonate":"Sonsonate is in El Salvador.","which country is the city Easthampton":"Easthampton is in United States.","which country is the city Nong Bua Lamphu":"Nong Bua Lamphu is in Thailand.","which country is the city Tiwi":"Tiwi is in Philippines.","which country is the city Altona-Nord":"Altona-Nord is in Germany.","which country is the city Nattappettai":"Nattappettai is in India.","which country is the city Tlaltenango de Sánchez Román":"Tlaltenango de Sánchez Román is in Mexico.","which country is the city Plunge":"Plunge is in Lithuania.","which country is the city Elmont":"Elmont is in United States.","which country is the city Ramona":"Ramona is in United States.","which country is the city Igurusi":"Igurusi is in Tanzania, United Republic of.","which country is the city Bekwai":"Bekwai is in Ghana.","which country is the city Sector 5":"Sector 5 is in Romania.","which country is the city Kanowit":"Kanowit is in Malaysia.","which country is the city Tsentralnyi":"Tsentralnyi is in Ukraine.","which country is the city Bacuri":"Bacuri is in Brazil.","which country is the city Ortaca":"Ortaca is in Türkiye.","which country is the city Cernusco sul Naviglio":"Cernusco sul Naviglio is in Italy.","which country is the city Rockcliffe-Smythe":"Rockcliffe-Smythe is in Canada.","which country is the city Qabqa":"Qabqa is in China.","which country is the city Taitou":"Taitou is in China.","which country is the city Maldegem":"Maldegem is in Belgium."}}},
{"id":"n-5053ab48","guard":[["hasAny",["chitaguppa","delete","iringal","maheshtala","pāthri","remove","revelganj","strip out","without","zamānia"]]],"pyramid":["render.str",["transform.remove",{"lit":"india"},["sense.lastWord"]]],"mem":null},
{"id":"n-ad6dde46","guard":[["hasAny",["chitaguppa","iringal","item number","maheshtala","nth","position","pāthri","revelganj","zamānia"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in India."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-bffa5b0f","guard":[["hasAny",["chitaguppa","iringal","maheshtala","pāthri","revelganj"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in India."]},["sense.lastWord"]],"mem":null},
{"id":"n-fa7eb812","guard":[["hasAny",["clair","deerfield","falls","leland","montrose"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in United States."]},["sense.lastWord"]],"mem":null},
{"id":"n-24484c17","guard":[["hasAny",["clair","deerfield","falls","invert case","leland","montrose","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in United States."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-36050e14","guard":[["hasAny",["capitalise","capitalize","capitalize each word","clair","deerfield","falls","leland","montrose","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in United States."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-52b44931","guard":[["hasAny",["chitaguppa","invert case","iringal","maheshtala","pāthri","revelganj","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in India."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-659cc8ec","guard":[["hasAny",["clair","deerfield","falls","leland","lower case","lowercase","montrose","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in United States."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6d7e58e8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","chitaguppa","iringal","maheshtala","pāthri","revelganj","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in India."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b6251336","guard":[["hasAny",["all caps","capital letters","capitals","clair","deerfield","falls","leland","montrose","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in United States."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b967e917","guard":[["hasAny",["all caps","capital letters","capitals","chitaguppa","iringal","maheshtala","pāthri","revelganj","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in India."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-bd8324d0","guard":[["hasAny",["chitaguppa","iringal","maheshtala","pāthri","revelganj"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in India."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-f198e5d9","guard":[["hasAny",["clair","deerfield","falls","leland","montrose"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in United States."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-ff53a711","guard":[["hasAny",["chitaguppa","iringal","lower case","lowercase","maheshtala","pāthri","revelganj","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in India."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-326a979c","guard":[["hasAny",["bradenton","easthampton","elmont","falls","item number","nth","position","ramona"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in United States."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-540152b8","guard":[["hasAny",["clair","deerfield","each word","falls","leland","montrose","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in United States."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-72a3176b","guard":[["hasAny",["clair","deerfield","each word","falls","leland","montrose","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in United States."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-76b111cc","guard":[["hasAny",["chitaguppa","each word","iringal","maheshtala","pāthri","revelganj","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in India."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a1b2f4be","guard":[["hasAny",["chitaguppa","each word","iringal","maheshtala","pāthri","revelganj","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in India."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-481150c9","guard":[["hasAny",["carles","delete","les","llucmajor","picassent","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Spain"},["sense.lastWord"]]],"mem":null},
{"id":"n-6b2dc5a4","guard":[["hasAny",["longest","longest one","longest word","petrovskzabaykalskiy","saraktash","tashtagol","yemanzhelinsk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Russian Federation."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7c4571d0","guard":[["hasAny",["chitaguppa","longest","longest one","longest word","maheshtala","nattappettai","revelganj"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in India."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ecdb0b19","guard":[["hasAny",["bradenton","deerfield","easthampton","longest","longest one","longest word","montrose"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in United States."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d4dc8b95","guard":[["hasAny",["erdaojiang","huayuan","item number","nth","position","qabqa","taitou"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in China."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f216fe2c","guard":[["hasAny",["bradenton","deerfield","item number","leland","montrose","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1245fb23","guard":[["hasAny",["changling","erdaojiang","huayuan","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",{"lit":"china"},["sense.lastWord"]]],"mem":null},
{"id":"n-16e560c3","guard":[["hasAny",["changling","delete","erdaojiang","huayuan","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"China"},["sense.lastWord"]]],"mem":null},
{"id":"n-26f7c6d9","guard":[["hasAny",["changling","erdaojiang","huayuan","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",{"lit":"china"},["sense.lastWord"]]],"mem":null},
{"id":"n-2abd1439","guard":[["hasAny",["changling","erdaojiang","huayuan","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",{"lit":"China"},["sense.lastWord"]]],"mem":null},
{"id":"n-5e795048","guard":[["hasAny",["changling","delete","erdaojiang","huayuan","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"china"},["sense.lastWord"]]],"mem":null},
{"id":"n-61d312b5","guard":[["hasAny",["changling","erdaojiang","huayuan","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",{"lit":"China"},["sense.lastWord"]]],"mem":null},
{"id":"n-71a2a5ff","guard":[["hasAny",["longest","longest one","longest word","shakhtarske","tsentralnyi","zhmerynka"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ukraine."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8084b0f2","guard":[["hasAny",["les","llucmajor","longest","longest one","longest word","picassent"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Spain."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d6f6814c","guard":[["hasAny",["changling","erdaojiang","huayuan","separate by","split","split by"]]],"pyramid":["render.and",["transform.split",{"lit":"china"},["sense.lastWord"]]],"mem":null},
{"id":"n-fec168a1","guard":[["hasAny",["changling","erdaojiang","huayuan","separate by","split","split by"]]],"pyramid":["render.and",["transform.split",{"lit":"China"},["sense.lastWord"]]],"mem":null},
{"id":"n-327c3042","guard":[["hasAny",["changling","erdaojiang","huayuan","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in China."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-67d025ec","guard":[["hasAny",["altonanord","item number","kirchlengern","lohr","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Germany."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-be483d23","guard":[["hasAny",["item number","nattappettai","nth","position","sirohi","zamānia"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in India."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-cd66e531","guard":[["hasAny",["bacuri","garuva","irati","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-412d7155","guard":[["hasAny",["clair","item number","nth","oak","porte","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8bf8bad9","guard":[["hasAny",["llucmajor","picassent"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Spain."]},["sense.lastWord"]],"mem":null},
{"id":"n-9ef27510","guard":[["hasAny",["levante","mondragone"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Italy."]},["sense.lastWord"]],"mem":null},
{"id":"n-05c60988","guard":[["hasAny",["invert case","levante","mondragone","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Italy."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0861166b","guard":[["hasAny",["invert case","llucmajor","picassent","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Spain."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-21ec9a10","guard":[["hasAny",["capitalise","capitalize","capitalize each word","llucmajor","picassent","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Spain."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-33ca3d80","guard":[["hasAny",["all caps","capital letters","capitals","llucmajor","picassent","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Spain."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-36493dc9","guard":[["hasAny",["levante","lower case","lowercase","mondragone","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Italy."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-44ecc7c2","guard":[["hasAny",["llucmajor","lower case","lowercase","picassent","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Spain."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-61aa8562","guard":[["hasAny",["levante","mondragone"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Italy."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-7cb8726b","guard":[["hasAny",["changling","erdaojiang","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in China."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-88228791","guard":[["hasAny",["all caps","capital letters","capitals","levante","mondragone","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Italy."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-abcdc8b3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","levante","mondragone","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Italy."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ca93b93d","guard":[["hasAny",["llucmajor","picassent"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Spain."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-ccf9f977","guard":[["hasAny",["petrovskzabaykalskiy","tashtagol"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Russian Federation."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-d043ec7f","guard":[["hasAny",["ayutuxtepeque","longest","longest one","longest word","sonsonate"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in El Salvador."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d2b233e4","guard":[["hasAny",["champignysurmarne","chenôve"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in France."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-d2e0b04e","guard":[["hasAny",["altonanord","kirchlengern","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Germany."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1d0bc569","guard":[["hasAny",["all caps","capital letters","capitals","petrovskzabaykalskiy","tashtagol","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Russian Federation."]},["transform.upper",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-2367ca16","guard":[["hasAny",["alfena","item number","massamá","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Portugal."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-258db05c","guard":[["hasAny",["bau","item number","kanowit","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Malaysia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2864f465","guard":[["hasAny",["champignysurmarne","chenôve","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in France."]},["transform.reverseWords",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-2a2ec48c","guard":[["hasAny",["all caps","capital letters","capitals","champignysurmarne","chenôve","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in France."]},["transform.upper",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-462ffbaf","guard":[["hasAny",["item number","nth","petrovskzabaykalskiy","position","tashtagol"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Russian Federation."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-587814ec","guard":[["hasAny",["item number","nth","position","shakhtarske","tsentralnyi"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ukraine."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-63600e74","guard":[["hasAny",["champignysurmarne","chenôve","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in France."]},["transform.swapCase",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-6f151292","guard":[["hasAny",["ayutuxtepeque","item number","nth","position","sonsonate"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in El Salvador."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7542e4e6","guard":[["hasAny",["item number","nth","position","saraktash","yemanzhelinsk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Russian Federation."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7a362778","guard":[["hasAny",["arandas","item number","nth","position","yecapixtla"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Mexico."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9a1de2d5","guard":[["hasAny",["each word","llucmajor","picassent","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Spain."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9fa1088a","guard":[["hasAny",["item number","nth","position","shakhtarske","zhmerynka"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ukraine."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a3a927c7","guard":[["hasAny",["firmat","item number","nth","position","zapala"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Argentina."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a64301cc","guard":[["hasAny",["item number","llucmajor","nth","picassent","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Spain."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-af2b2c38","guard":[["hasAny",["alfena","item number","massamá","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Portugal."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b0d9735b","guard":[["hasAny",["each word","levante","mondragone","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Italy."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b33ae9a6","guard":[["hasAny",["champignysurmarne","chenôve","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in France."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-b8ae3598","guard":[["hasAny",["petrovskzabaykalskiy","reverse the words","reverse word order","tashtagol","words backwards"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Russian Federation."]},["transform.reverseWords",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-b9862243","guard":[["hasAny",["capitalise","capitalize","capitalize each word","champignysurmarne","chenôve","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in France."]},["transform.title",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-c252a370","guard":[["hasAny",["capitalise","capitalize","capitalize each word","petrovskzabaykalskiy","tashtagol","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Russian Federation."]},["transform.title",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-cb15fb14","guard":[["hasAny",["invert case","petrovskzabaykalskiy","swap case","tashtagol","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Russian Federation."]},["transform.swapCase",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-cc3644da","guard":[["hasAny",["firmat","item number","nth","position","zapala"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Argentina."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d1dad5a6","guard":[["hasAny",["bongao","item number","nth","position","tiwi"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Philippines."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d7bf0525","guard":[["hasAny",["champignysurmarne","chenôve","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in France."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ed8da4ef","guard":[["hasAny",["lower case","lowercase","petrovskzabaykalskiy","small letters","tashtagol"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Russian Federation."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-7c9364b9","guard":[["hasAny",["item number","nth","oak","porte","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in United States."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-00fc6111","guard":[["hasAny",["oak","park"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Oak Park lies":"Oak Park is in United States."}}},
{"id":"n-0183e5ff","guard":[["hasAny",["country","montrose"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Montrose":"Montrose is in United States."}}},
{"id":"n-0408d4d3","guard":[["hasAny",["city","country","saraktash"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Saraktash in":"Saraktash is in Russian Federation."}}},
{"id":"n-04f195ab","guard":[["has","bacuri"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Bacuri in":"Bacuri is in Brazil."}}},
{"id":"n-066d151e","guard":[["has","huayuan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Huayuan lies":"Huayuan is in China."}}},
{"id":"n-0710a8d7","guard":[["has","bau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Bau in":"Bau is in Malaysia."}}},
{"id":"n-092e7925","guard":[["hasAny",["chenôve","country"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Chenôve":"Chenôve is in France."}}},
{"id":"n-0d5a7c1a","guard":[["hasAny",["city","country","de","román","sánchez","tlaltenango"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Tlaltenango de Sánchez Román in":"Tlaltenango de Sánchez Román is in Mexico."}}},
{"id":"n-0da77715","guard":[["hasAny",["country","mondragone"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Mondragone":"Mondragone is in Italy."}}},
{"id":"n-0e2478f7","guard":[["hasAny",["arandas","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Arandas":"Arandas is in Mexico."}}},
{"id":"n-0e64a632","guard":[["has","markala"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Markala lies":"Markala is in Mali."}}},
{"id":"n-0ff5174b","guard":[["hasAny",["city","country","la","porte"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city La Porte in":"La Porte is in United States."}}},
{"id":"n-103b9aa2","guard":[["hasAny",["country","khánh","thị","trùng","trấn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Thị Trấn Trùng Khánh":"Thị Trấn Trùng Khánh is in Viet Nam."}}},
{"id":"n-11a8feea","guard":[["hasAny",["country","revelganj"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Revelganj":"Revelganj is in India."}}},
{"id":"n-122a8a2b","guard":[["hasAny",["country","duba"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Duba":"Duba is in Saudi Arabia."}}},
{"id":"n-125eac8a","guard":[["hasAny",["city","country","ortaca"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Ortaca in":"Ortaca is in Türkiye."}}},
{"id":"n-1319d89c","guard":[["hasAny",["country","lies","name","zamānia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Zamānia lies":"Zamānia is in India."}}},
{"id":"n-13c50c11","guard":[["hasAny",["country","hardwick","kempston","lies","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Kempston Hardwick lies":"Kempston Hardwick is in United Kingdom."}}},
{"id":"n-1464f665","guard":[["hasAny",["city","country","qabqa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Qabqa in":"Qabqa is in China."}}},
{"id":"n-15c36ce4","guard":[["hasAny",["country","mondragone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Mondragone":"Mondragone is in Italy."}}},
{"id":"n-15ef76d8","guard":[["has","changling"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in China."]},["sense.lastWord"]],"mem":null},
{"id":"n-162076c6","guard":[["has","tonami"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Japan."]},["sense.lastWord"]],"mem":null},
{"id":"n-1732dbf3","guard":[["has","zamānia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Zamānia lies":"Zamānia is in India."}}},
{"id":"n-1a2dd796","guard":[["hasAny",["alfena","country","lies","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Alfena lies":"Alfena is in Portugal."}}},
{"id":"n-1a3216ad","guard":[["hasAny",["country","motsqin","qiryat"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Qiryat Motsqin":"Qiryat Motsqin is in Israel."}}},
{"id":"n-1a637b96","guard":[["has","khromtau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Khromtau in":"Khromtau is in Kazakhstan."}}},
{"id":"n-1c2837fa","guard":[["hasAny",["country","lies","name","yecapixtla"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Yecapixtla lies":"Yecapixtla is in Mexico."}}},
{"id":"n-1f08550d","guard":[["hasAny",["champignysurmarne","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Champigny-sur-Marne":"Champigny-sur-Marne is in France."}}},
{"id":"n-1fa7359b","guard":[["hasAny",["country","dosso"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Dosso":"Dosso is in Niger."}}},
{"id":"n-2045f437","guard":[["hasAny",["country","motsqin","qiryat"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Qiryat Motsqin":"Qiryat Motsqin is in Israel."}}},
{"id":"n-20de2c13","guard":[["hasAny",["altonanord","city","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Altona-Nord in":"Altona-Nord is in Germany."}}},
{"id":"n-20f03dc9","guard":[["hasAny",["country","zhmerynka"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Zhmerynka":"Zhmerynka is in Ukraine."}}},
{"id":"n-222d8b45","guard":[["hasAny",["country","lies","name","włocławek"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Włocławek lies":"Włocławek is in Poland."}}},
{"id":"n-22dcbafb","guard":[["hasAny",["country","pāthri"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Pāthri":"Pāthri is in India."}}},
{"id":"n-27016640","guard":[["has","elmont"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Elmont in":"Elmont is in United States."}}},
{"id":"n-28482a99","guard":[["hasAny",["bacuri","city","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Bacuri in":"Bacuri is in Brazil."}}},
{"id":"n-28a2dab4","guard":[["hasAny",["city","country","elmont"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Elmont in":"Elmont is in United States."}}},
{"id":"n-2b7a0112","guard":[["hasAny",["country","maheshtala"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Maheshtala":"Maheshtala is in India."}}},
{"id":"n-2b7f052f","guard":[["hasAny",["city","country","la","porte"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city La Porte in":"La Porte is in United States."}}},
{"id":"n-2be0bed8","guard":[["hasAny",["clair","country","saint","shores"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Saint Clair Shores":"Saint Clair Shores is in United States."}}},
{"id":"n-2c8a9d70","guard":[["has","włocławek"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Włocławek lies":"Włocławek is in Poland."}}},
{"id":"n-2de8720a","guard":[["has","zapala"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Zapala lies":"Zapala is in Argentina."}}},
{"id":"n-2ea6e429","guard":[["has","yecapixtla"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Yecapixtla lies":"Yecapixtla is in Mexico."}}},
{"id":"n-2fc723a5","guard":[["hasAny",["benut","country","kawasan","lies","name","penempatan","tiga","ulu"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Kawasan Penempatan Ulu Benut Tiga lies":"Kawasan Penempatan Ulu Benut Tiga is in Malaysia."}}},
{"id":"n-3062a655","guard":[["hasAny",["country","dashtobod","lies","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Dashtobod lies":"Dashtobod is in Uzbekistan."}}},
{"id":"n-31075ace","guard":[["hasAny",["les","roquetes"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where les Roquetes lies":"les Roquetes is in Spain."}}},
{"id":"n-320b9adc","guard":[["hasAny",["country","kirchlengern","lies","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Kirchlengern lies":"Kirchlengern is in Germany."}}},
{"id":"n-32589d10","guard":[["has","sonsonate"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Sonsonate in":"Sonsonate is in El Salvador."}}},
{"id":"n-354dd62a","guard":[["has","tashtagol"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Russian Federation."]},["sense.lastWord"]],"mem":null},
{"id":"n-3742864c","guard":[["hasAny",["country","dosso"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Dosso":"Dosso is in Niger."}}},
{"id":"n-38f548bc","guard":[["hasAny",["country","lies","markala","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Markala lies":"Markala is in Mali."}}},
{"id":"n-38f590e3","guard":[["has","altonanord"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Altona-Nord in":"Altona-Nord is in Germany."}}},
{"id":"n-3928a4df","guard":[["hasAny",["chenôve","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Chenôve":"Chenôve is in France."}}},
{"id":"n-39302723","guard":[["hasAny",["country","edison","governador","lies","lobão","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Governador Edison Lobão lies":"Governador Edison Lobão is in Brazil."}}},
{"id":"n-39360b8d","guard":[["hasAny",["country","duba"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Duba":"Duba is in Saudi Arabia."}}},
{"id":"n-3a81a249","guard":[["hasAny",["country","les","lies","name","roquetes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where les Roquetes lies":"les Roquetes is in Spain."}}},
{"id":"n-3b4e6522","guard":[["hasAny",["country","de","itaipu","lies","name","santa","terezinha"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Santa Terezinha de Itaipu lies":"Santa Terezinha de Itaipu is in Brazil."}}},
{"id":"n-3cac9f6a","guard":[["hasAny",["country","firmat","lies","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Firmat lies":"Firmat is in Argentina."}}},
{"id":"n-3de4bd2d","guard":[["hasAny",["bongao","city","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Bongao in":"Bongao is in Philippines."}}},
{"id":"n-3e1cf590","guard":[["has","iyesi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Iyesi lies":"Iyesi is in Nigeria."}}},
{"id":"n-3e8e3027","guard":[["has","taitou"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Taitou in":"Taitou is in China."}}},
{"id":"n-3e94a244","guard":[["hasAny",["dublin","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where South Dublin lies":"South Dublin is in Ireland."}}},
{"id":"n-3e9d912d","guard":[["hasAny",["country","lohr","main"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Lohr am Main":"Lohr am Main is in Germany."}}},
{"id":"n-40069006","guard":[["has","dashtobod"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Dashtobod lies":"Dashtobod is in Uzbekistan."}}},
{"id":"n-40d01cef","guard":[["hasAny",["bua","city","country","lamphu","nong"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Nong Bua Lamphu in":"Nong Bua Lamphu is in Thailand."}}},
{"id":"n-41747567","guard":[["hasAny",["bau","city","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Bau in":"Bau is in Malaysia."}}},
{"id":"n-4454e479","guard":[["has","plunge"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Plunge in":"Plunge is in Lithuania."}}},
{"id":"n-44944702","guard":[["hasAny",["country","petrovskzabaykalskiy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Petrovsk-Zabaykal’skiy":"Petrovsk-Zabaykal’skiy is in Russian Federation."}}},
{"id":"n-46d5e35f","guard":[["hasAny",["country","lohr","main"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Lohr am Main":"Lohr am Main is in Germany."}}},
{"id":"n-48e85c6c","guard":[["has","mponela"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Malawi."]},["sense.lastWord"]],"mem":null},
{"id":"n-4ca55bfb","guard":[["has","ortaca"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Ortaca in":"Ortaca is in Türkiye."}}},
{"id":"n-4cb609d6","guard":[["has","irati"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Irati lies":"Irati is in Brazil."}}},
{"id":"n-4dbd6eeb","guard":[["hasAny",["country","lies","name","randburg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Randburg lies":"Randburg is in South Africa."}}},
{"id":"n-4dcbc739","guard":[["has","yemanzhelinsk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Yemanzhelinsk in":"Yemanzhelinsk is in Russian Federation."}}},
{"id":"n-4f7a439b","guard":[["hasAny",["bua","city","country","lamphu","nong"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Nong Bua Lamphu in":"Nong Bua Lamphu is in Thailand."}}},
{"id":"n-512d87ed","guard":[["hasAny",["hardwick","kempston"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Kempston Hardwick lies":"Kempston Hardwick is in United Kingdom."}}},
{"id":"n-51514122","guard":[["has","sirohi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Sirohi in":"Sirohi is in India."}}},
{"id":"n-536fcbb7","guard":[["hasAny",["bekwai","city","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Bekwai in":"Bekwai is in Ghana."}}},
{"id":"n-558bac32","guard":[["has","rockcliffesmythe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Rockcliffe-Smythe in":"Rockcliffe-Smythe is in Canada."}}},
{"id":"n-595fa99f","guard":[["has","tikrīt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Tikrīt in":"Tikrīt is in Iraq."}}},
{"id":"n-5baea22f","guard":[["has","nattappettai"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Nattappettai in":"Nattappettai is in India."}}},
{"id":"n-5c6478c4","guard":[["hasAny",["country","tonami"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Tonami":"Tonami is in Japan."}}},
{"id":"n-5fccc78e","guard":[["hasAny",["city","country","sirohi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Sirohi in":"Sirohi is in India."}}},
{"id":"n-60623269","guard":[["hasAny",["country","falls","menomonee"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Menomonee Falls":"Menomonee Falls is in United States."}}},
{"id":"n-6092613e","guard":[["has","fūman"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Fūman lies":"Fūman is in Iran, Islamic Republic of."}}},
{"id":"n-6248058d","guard":[["has","achaguas"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Venezuela, Bolivarian Republic of."]},["sense.lastWord"]],"mem":null},
{"id":"n-62f50ba5","guard":[["has","bongao"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Bongao in":"Bongao is in Philippines."}}},
{"id":"n-63763327","guard":[["hasAny",["country","erdaojiang","lies","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Erdaojiang lies":"Erdaojiang is in China."}}},
{"id":"n-63e60316","guard":[["hasAny",["ii","sobradinho"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Sobradinho II lies":"Sobradinho II is in Brazil."}}},
{"id":"n-63f10584","guard":[["hasAny",["country","tashtagol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Tashtagol":"Tashtagol is in Russian Federation."}}},
{"id":"n-66d71bd0","guard":[["hasAny",["city","country","de","román","sánchez","tlaltenango"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Tlaltenango de Sánchez Román in":"Tlaltenango de Sánchez Román is in Mexico."}}},
{"id":"n-67270e63","guard":[["has","randburg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Randburg lies":"Randburg is in South Africa."}}},
{"id":"n-6892526b","guard":[["hasAny",["country","levante","sestri"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Sestri Levante":"Sestri Levante is in Italy."}}},
{"id":"n-68b3e32a","guard":[["has","bekwai"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Bekwai in":"Bekwai is in Ghana."}}},
{"id":"n-68ee916f","guard":[["has","qabqa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Qabqa in":"Qabqa is in China."}}},
{"id":"n-697fa5d3","guard":[["hasAny",["country","dubnica","lies","nad","name","váhom"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Dubnica nad Váhom lies":"Dubnica nad Váhom is in Slovakia."}}},
{"id":"n-69b9a817","guard":[["hasAny",["city","country","nattappettai"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Nattappettai in":"Nattappettai is in India."}}},
{"id":"n-6a03c12a","guard":[["hasAny",["achaguas","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Achaguas":"Achaguas is in Venezuela, Bolivarian Republic of."}}},
{"id":"n-6b58e1e5","guard":[["hasAny",["châu","country","lai"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Lai Châu":"Lai Châu is in Viet Nam."}}},
{"id":"n-6b829881","guard":[["hasAny",["city","country","kanowit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Kanowit in":"Kanowit is in Malaysia."}}},
{"id":"n-6cc8aa24","guard":[["has","tsentralnyi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Tsentralnyi in":"Tsentralnyi is in Ukraine."}}},
{"id":"n-6f4aa22b","guard":[["has","kenol"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Kenol lies":"Kenol is in Kenya."}}},
{"id":"n-6f4f39b7","guard":[["hasAny",["country","petrovskzabaykalskiy"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Petrovsk-Zabaykal’skiy":"Petrovsk-Zabaykal’skiy is in Russian Federation."}}},
{"id":"n-70d8c252","guard":[["hasAny",["country","dargeçit"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Dargeçit":"Dargeçit is in Türkiye."}}},
{"id":"n-73197db0","guard":[["hasAny",["country","falls","menomonee"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Menomonee Falls":"Menomonee Falls is in United States."}}},
{"id":"n-732288b2","guard":[["hasAny",["city","country","rockcliffesmythe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Rockcliffe-Smythe in":"Rockcliffe-Smythe is in Canada."}}},
{"id":"n-7564fc5b","guard":[["has","chaam"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Cha-am lies":"Cha-am is in Thailand."}}},
{"id":"n-7573f1fb","guard":[["has","chetouane"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Chetouane in":"Chetouane is in Algeria."}}},
{"id":"n-77792c75","guard":[["hasAny",["city","country","taitou"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Taitou in":"Taitou is in China."}}},
{"id":"n-77f0c9ec","guard":[["hasAny",["country","deerfield"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Deerfield":"Deerfield is in United States."}}},
{"id":"n-7847c44c","guard":[["hasAny",["champignysurmarne","country"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Champigny-sur-Marne":"Champigny-sur-Marne is in France."}}},
{"id":"n-78675aec","guard":[["hasAny",["country","de","itaipu","lies","name","santa","terezinha"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Santa Terezinha de Itaipu lies":"Santa Terezinha de Itaipu is in Brazil."}}},
{"id":"n-798bb152","guard":[["hasAny",["country","leland"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Leland":"Leland is in United States."}}},
{"id":"n-79e818eb","guard":[["hasAny",["country","picassent"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Picassent":"Picassent is in Spain."}}},
{"id":"n-79f5b289","guard":[["hasAny",["country","gihombo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Gihombo":"Gihombo is in Rwanda."}}},
{"id":"n-7a2eae26","guard":[["hasAny",["city","country","tsentralnyi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Tsentralnyi in":"Tsentralnyi is in Ukraine."}}},
{"id":"n-7b86837c","guard":[["hasAny",["country","deerfield"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Deerfield":"Deerfield is in United States."}}},
{"id":"n-7e1161b3","guard":[["has","kanowit"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Kanowit in":"Kanowit is in Malaysia."}}},
{"id":"n-7eec3278","guard":[["hasAny",["country","montrose"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Montrose":"Montrose is in United States."}}},
{"id":"n-80a96ad4","guard":[["hasAny",["city","country","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Sector 5 in":"Sector 5 is in Romania."}}},
{"id":"n-8261f954","guard":[["hasAny",["city","country","ramona"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Ramona in":"Ramona is in United States."}}},
{"id":"n-82fbd367","guard":[["has","tiwi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Tiwi in":"Tiwi is in Philippines."}}},
{"id":"n-83a8d167","guard":[["has","kérou"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Kérou lies":"Kérou is in Benin."}}},
{"id":"n-83d9485c","guard":[["hasAny",["city","country","tikrīt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Tikrīt in":"Tikrīt is in Iraq."}}},
{"id":"n-852db59a","guard":[["hasAny",["châu","country","lai"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Lai Châu":"Lai Châu is in Viet Nam."}}},
{"id":"n-8582abbc","guard":[["hasAny",["country","kenol","lies","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Kenol lies":"Kenol is in Kenya."}}},
{"id":"n-8732814a","guard":[["hasAny",["achaguas","country"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Achaguas":"Achaguas is in Venezuela, Bolivarian Republic of."}}},
{"id":"n-8fd03cd6","guard":[["hasAny",["city","country","khromtau"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Khromtau in":"Khromtau is in Kazakhstan."}}},
{"id":"n-911a94a7","guard":[["hasAny",["country","dublin","lies","name","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where South Dublin lies":"South Dublin is in Ireland."}}},
{"id":"n-91cb9b0b","guard":[["hasAny",["city","country","garuva"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Garuva in":"Garuva is in Brazil."}}},
{"id":"n-94fefd8a","guard":[["hasAny",["country","lies","massamá","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Massamá lies":"Massamá is in Portugal."}}},
{"id":"n-96974da5","guard":[["hasAny",["cernusco","city","country","naviglio","sul"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Cernusco sul Naviglio in":"Cernusco sul Naviglio is in Italy."}}},
{"id":"n-97bef8b2","guard":[["hasAny",["country","gihombo"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Gihombo":"Gihombo is in Rwanda."}}},
{"id":"n-9863c357","guard":[["hasAny",["changling","country"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Changling":"Changling is in China."}}},
{"id":"n-9875100c","guard":[["hasAny",["country","ii","lies","name","sobradinho"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Sobradinho II lies":"Sobradinho II is in Brazil."}}},
{"id":"n-98e8fe0a","guard":[["has","arandas"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Mexico."]},["sense.lastWord"]],"mem":null},
{"id":"n-9bf9fb3d","guard":[["hasAny",["country","maheshtala"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Maheshtala":"Maheshtala is in India."}}},
{"id":"n-9d584c70","guard":[["hasAny",["country","leland"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Leland":"Leland is in United States."}}},
{"id":"n-a1c8eb27","guard":[["hasAny",["country","irati","lies","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Irati lies":"Irati is in Brazil."}}},
{"id":"n-a3ec18b0","guard":[["hasAny",["arandas","country"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Arandas":"Arandas is in Mexico."}}},
{"id":"n-a3f57328","guard":[["has","firmat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Firmat lies":"Firmat is in Argentina."}}},
{"id":"n-a61697f7","guard":[["hasAny",["country","huayuan","lies","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Huayuan lies":"Huayuan is in China."}}},
{"id":"n-a7959f96","guard":[["hasAny",["country","pāthri"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Pāthri":"Pāthri is in India."}}},
{"id":"n-a83440c9","guard":[["hasAny",["chetouane","city","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Chetouane in":"Chetouane is in Algeria."}}},
{"id":"n-ac272c90","guard":[["hasAny",["ayutuxtepeque","city","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Ayutuxtepeque in":"Ayutuxtepeque is in El Salvador."}}},
{"id":"n-aca9bd0e","guard":[["hasAny",["clair","country","saint","shores"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Saint Clair Shores":"Saint Clair Shores is in United States."}}},
{"id":"n-adf5a85f","guard":[["has","dargeçit"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Türkiye."]},["sense.lastWord"]],"mem":null},
{"id":"n-ae07630d","guard":[["has","massamá"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Massamá lies":"Massamá is in Portugal."}}},
{"id":"n-ae4f67c3","guard":[["hasAny",["country","dubnica","lies","nad","name","váhom"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Dubnica nad Váhom lies":"Dubnica nad Váhom is in Slovakia."}}},
{"id":"n-af4112fa","guard":[["hasAny",["city","country","easthampton"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Easthampton in":"Easthampton is in United States."}}},
{"id":"n-af57fcc8","guard":[["hasAny",["country","lies","name","oak","park"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Oak Park lies":"Oak Park is in United States."}}},
{"id":"n-b249be11","guard":[["hasAny",["benut","country","kawasan","lies","name","penempatan","tiga","ulu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Kawasan Penempatan Ulu Benut Tiga lies":"Kawasan Penempatan Ulu Benut Tiga is in Malaysia."}}},
{"id":"n-b30091a4","guard":[["hasAny",["chaam","country","lies","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Cha-am lies":"Cha-am is in Thailand."}}},
{"id":"n-b6edce65","guard":[["hasAny",["country","zhmerynka"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Zhmerynka":"Zhmerynka is in Ukraine."}}},
{"id":"n-b7ec4eeb","guard":[["has","gihombo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Rwanda."]},["sense.lastWord"]],"mem":null},
{"id":"n-b7f9907e","guard":[["hasAny",["city","country","yemanzhelinsk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Yemanzhelinsk in":"Yemanzhelinsk is in Russian Federation."}}},
{"id":"n-b9e2ff7c","guard":[["hasAny",["country","tashtagol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Tashtagol":"Tashtagol is in Russian Federation."}}},
{"id":"n-be29c901","guard":[["hasAny",["alindao","country","lies","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Alindao lies":"Alindao is in Central African Republic."}}},
{"id":"n-bf03a52e","guard":[["hasAny",["changling","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Changling":"Changling is in China."}}},
{"id":"n-c0d500b5","guard":[["hasAny",["country","lies","name","shakhtarske"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Shakhtarske lies":"Shakhtarske is in Ukraine."}}},
{"id":"n-c236e2f8","guard":[["hasAny",["cernusco","city","country","naviglio","sul"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Cernusco sul Naviglio in":"Cernusco sul Naviglio is in Italy."}}},
{"id":"n-c2d98e43","guard":[["has","duba"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Saudi Arabia."]},["sense.lastWord"]],"mem":null},
{"id":"n-c2f412da","guard":[["hasAny",["country","lies","name","zapala"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Zapala lies":"Zapala is in Argentina."}}},
{"id":"n-c4da51f8","guard":[["has","bradenton"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Bradenton lies":"Bradenton is in United States."}}},
{"id":"n-c75ecd1f","guard":[["hasAny",["country","fūman","lies","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Fūman lies":"Fūman is in Iran, Islamic Republic of."}}},
{"id":"n-c94f4c98","guard":[["has","dosso"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Niger."]},["sense.lastWord"]],"mem":null},
{"id":"n-c9732372","guard":[["hasAny",["country","revelganj"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Revelganj":"Revelganj is in India."}}},
{"id":"n-ca54c8ef","guard":[["has","saraktash"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Saraktash in":"Saraktash is in Russian Federation."}}},
{"id":"n-cbd1ad42","guard":[["hasAny",["city","country","plunge"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Plunge in":"Plunge is in Lithuania."}}},
{"id":"n-cdaf9ae3","guard":[["hasAny",["country","mponela"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Mponela":"Mponela is in Malawi."}}},
{"id":"n-d45b6a68","guard":[["hasAny",["country","gunjur"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Gunjur":"Gunjur is in Gambia."}}},
{"id":"n-d4724c51","guard":[["hasAny",["maría","tingo"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Tingo María lies":"Tingo María is in Peru."}}},
{"id":"n-d472ea48","guard":[["has","gunjur"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Gambia."]},["sense.lastWord"]],"mem":null},
{"id":"n-d6790318","guard":[["hasAny",["city","country","tiwi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Tiwi in":"Tiwi is in Philippines."}}},
{"id":"n-d8106752","guard":[["has","erdaojiang"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Erdaojiang lies":"Erdaojiang is in China."}}},
{"id":"n-d8cd10b5","guard":[["hasAny",["country","iringal"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Iringal":"Iringal is in India."}}},
{"id":"n-dbdc69a9","guard":[["hasAny",["country","mponela"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Mponela":"Mponela is in Malawi."}}},
{"id":"n-dc6d6fbd","guard":[["has","garuva"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Garuva in":"Garuva is in Brazil."}}},
{"id":"n-dcee4c6a","guard":[["hasAny",["city","country","sonsonate"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Sonsonate in":"Sonsonate is in El Salvador."}}},
{"id":"n-dd81b8da","guard":[["has","ramona"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Ramona in":"Ramona is in United States."}}},
{"id":"n-df28ab3a","guard":[["has","alfena"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Alfena lies":"Alfena is in Portugal."}}},
{"id":"n-e0940f75","guard":[["hasAny",["country","picassent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Picassent":"Picassent is in Spain."}}},
{"id":"n-e162f735","guard":[["hasAny",["chitaguppa","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Chitaguppa":"Chitaguppa is in India."}}},
{"id":"n-e18931eb","guard":[["hasAny",["carles","country","de","la","lies","name","ràpita","sant"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Sant Carles de la Ràpita lies":"Sant Carles de la Ràpita is in Spain."}}},
{"id":"n-e23f57d7","guard":[["hasAny",["country","llucmajor"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Llucmajor":"Llucmajor is in Spain."}}},
{"id":"n-e2da5843","guard":[["hasAny",["country","khánh","thị","trùng","trấn"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Thị Trấn Trùng Khánh":"Thị Trấn Trùng Khánh is in Viet Nam."}}},
{"id":"n-e520ed5b","guard":[["hasAny",["country","llucmajor"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Llucmajor":"Llucmajor is in Spain."}}},
{"id":"n-e53d444c","guard":[["has","zhmerynka"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ukraine."]},["sense.lastWord"]],"mem":null},
{"id":"n-e61f2fbb","guard":[["hasAny",["country","levante","sestri"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Sestri Levante":"Sestri Levante is in Italy."}}},
{"id":"n-e7607729","guard":[["hasAny",["country","tonami"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Tonami":"Tonami is in Japan."}}},
{"id":"n-e8a20a6f","guard":[["hasAny",["chitaguppa","country"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what country is Chitaguppa":"Chitaguppa is in India."}}},
{"id":"n-e9446187","guard":[["has","kirchlengern"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Kirchlengern lies":"Kirchlengern is in Germany."}}},
{"id":"n-ea5a2664","guard":[["has","chenôve"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in France."]},["sense.lastWord"]],"mem":null},
{"id":"n-eaf62db9","guard":[["has","shakhtarske"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Shakhtarske lies":"Shakhtarske is in Ukraine."}}},
{"id":"n-ec2a03a7","guard":[["hasAny",["bradenton","country","lies","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Bradenton lies":"Bradenton is in United States."}}},
{"id":"n-ec8ba0a5","guard":[["hasAny",["city","country","igurusi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Igurusi in":"Igurusi is in Tanzania, United Republic of."}}},
{"id":"n-ed7a9773","guard":[["hasAny",["country","iringal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Iringal":"Iringal is in India."}}},
{"id":"n-f096a3f6","guard":[["hasAny",["country","dargeçit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Dargeçit":"Dargeçit is in Türkiye."}}},
{"id":"n-f1a57827","guard":[["hasAny",["country","gunjur"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what country is Gunjur":"Gunjur is in Gambia."}}},
{"id":"n-f2454243","guard":[["hasAny",["country","lies","maría","name","tingo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Tingo María lies":"Tingo María is in Peru."}}},
{"id":"n-f30ccd00","guard":[["has","easthampton"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Easthampton in":"Easthampton is in United States."}}},
{"id":"n-f333b973","guard":[["has","alindao"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Alindao lies":"Alindao is in Central African Republic."}}},
{"id":"n-f492ebb0","guard":[["has","maldegem"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Maldegem in":"Maldegem is in Belgium."}}},
{"id":"n-f5051e69","guard":[["hasAny",["country","edison","governador","lies","lobão","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country where Governador Edison Lobão lies":"Governador Edison Lobão is in Brazil."}}},
{"id":"n-f63d33dd","guard":[["hasAny",["carles","country","de","la","lies","name","ràpita","sant"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Sant Carles de la Ràpita lies":"Sant Carles de la Ràpita is in Spain."}}},
{"id":"n-f73b819e","guard":[["hasAny",["country","iyesi","lies","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Iyesi lies":"Iyesi is in Nigeria."}}},
{"id":"n-f7a51b56","guard":[["hasAny",["city","country","maldegem"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the city Maldegem in":"Maldegem is in Belgium."}}},
{"id":"n-f98c2187","guard":[["has","ayutuxtepeque"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Ayutuxtepeque in":"Ayutuxtepeque is in El Salvador."}}},
{"id":"n-fa2efceb","guard":[["hasAny",["country","kérou","lies","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country where Kérou lies":"Kérou is in Benin."}}},
{"id":"n-fc78b3dc","guard":[["has","igurusi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the city Igurusi in":"Igurusi is in Tanzania, United Republic of."}}},
{"id":"n-026d43ce","guard":[["hasAny",["achaguas","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Venezuela, Bolivarian Republic of."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-07234b0c","guard":[["hasAny",["all caps","capital letters","capitals","duba","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Saudi Arabia."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-0a2f296c","guard":[["hasAny",["all caps","capital letters","capitals","chenôve","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in France."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-0a705273","guard":[["hasAny",["gunjur","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Gambia."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0ae4640a","guard":[["hasAny",["all caps","capital letters","capitals","mponela","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Malawi."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-0d6a0641","guard":[["hasAny",["ii","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":["Sobradinho ",{"slot":0}," is in Brazil."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0f115a44","guard":[["hasAny",["lower case","lowercase","small letters","tonami"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Japan."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-10800b77","guard":[["has","tonami"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Japan."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-1e3dccb4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","duba","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Saudi Arabia."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-20665336","guard":[["has","duba"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Saudi Arabia."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-210c3ccb","guard":[["hasAny",["all caps","capital letters","capitals","gihombo","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Rwanda."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-2227ed2d","guard":[["has","changling"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in China."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-24769e0d","guard":[["hasAny",["all caps","capital letters","capitals","dosso","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Niger."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-265a927b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tonami"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Japan."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-29839925","guard":[["hasAny",["country","delete","remove","strip out","without"]],["has","where"]],"pyramid":["render.str",["transform.remove",{"lit":"brazil"},["sense.roman"]]],"mem":null},
{"id":"n-2c10bb5a","guard":[["hasAny",["sector","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["Sector ",{"slot":0}," is in Romania."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-31300f9b","guard":[["has","achaguas"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Venezuela, Bolivarian Republic of."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-3a3a5abb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","changling","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in China."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3a76fc0b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","chenôve","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in France."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3f90338e","guard":[["hasAny",["gihombo","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Rwanda."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-41cf315b","guard":[["hasAny",["achaguas","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Venezuela, Bolivarian Republic of."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-439a858c","guard":[["hasAny",["invert case","swap case","toggle case","tonami"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Japan."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4eb745ae","guard":[["hasAny",["chetouane","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Algeria."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5456ae57","guard":[["hasAny",["arandas","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Mexico."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-572c64e6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mponela","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Malawi."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-59881ea7","guard":[["hasAny",["lower case","lowercase","small letters","zhmerynka"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ukraine."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5c4e7c78","guard":[["hasAny",["dargeçit","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Türkiye."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-64af888c","guard":[["hasAny",["achaguas","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Venezuela, Bolivarian Republic of."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-662da4c7","guard":[["hasAny",["country","delete","remove","strip out","without"]],["has","where"]],"pyramid":["render.str",["transform.remove",{"lit":"Brazil"},["sense.roman"]]],"mem":null},
{"id":"n-6990b580","guard":[["hasAny",["dosso","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Niger."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6f1ad957","guard":[["has","gihombo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Rwanda."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-6f8b1320","guard":[["hasAny",["changling","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in China."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-744b61b9","guard":[["hasAny",["duba","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Saudi Arabia."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-77f223b6","guard":[["hasAny",["duba","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Saudi Arabia."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8351e119","guard":[["hasAny",["lower case","lowercase","mponela","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Malawi."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-85bbf364","guard":[["hasAny",["changling","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in China."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-85d111f0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dosso","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Niger."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-87607cc7","guard":[["hasAny",["chenôve","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in France."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-87cb07d9","guard":[["hasAny",["invert case","swap case","tashtagol","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Russian Federation."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8f683cc5","guard":[["hasAny",["bau","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Malaysia."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-90b14570","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dargeçit","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Türkiye."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-959757f3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tashtagol","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Russian Federation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-96202bf1","guard":[["hasAny",["all caps","capital letters","capitals","gunjur","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Gambia."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-973cb762","guard":[["hasAny",["dargeçit","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Türkiye."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-982b34e5","guard":[["hasAny",["invert case","swap case","toggle case","zhmerynka"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ukraine."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a2a769d4","guard":[["hasAny",["all caps","capital letters","capitals","changling","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in China."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-a4b28806","guard":[["hasAny",["arandas","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Mexico."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a8afc3be","guard":[["hasAny",["lower case","lowercase","small letters","tashtagol"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Russian Federation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-aacb4cf8","guard":[["hasAny",["khromtau","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Kazakhstan."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ab32e539","guard":[["hasAny",["chenôve","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in France."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ade06268","guard":[["hasAny",["invert case","mponela","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Malawi."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ae28e44e","guard":[["hasAny",["gunjur","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Gambia."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b3a6ff15","guard":[["hasAny",["all caps","capital letters","capitals","upper case","uppercase","zhmerynka"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ukraine."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b586b1c5","guard":[["hasAny",["achaguas","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Venezuela, Bolivarian Republic of."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b8649842","guard":[["hasAny",["longest","longest one","longest word","mondragone"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Italy."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b9991445","guard":[["hasAny",["arandas","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Mexico."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c08235a5","guard":[["hasAny",["dosso","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Niger."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c5d88f68","guard":[["has","dosso"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Niger."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-cb372d7b","guard":[["hasAny",["dashtobod","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Uzbekistan."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cb60ff33","guard":[["has","arandas"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Mexico."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-ce37326d","guard":[["hasAny",["all caps","capital letters","capitals","tonami","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Japan."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-cf93bddc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gihombo","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Rwanda."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d0b64519","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","zhmerynka"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ukraine."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d1e0dc54","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gunjur","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Gambia."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d47f62f9","guard":[["has","mponela"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Malawi."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-d75504bd","guard":[["hasAny",["dargeçit","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Türkiye."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-dbc0a682","guard":[["hasAny",["longest","longest one","longest word","maldegem"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Belgium."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-dd83e84c","guard":[["hasAny",["longest","longest one","longest word","randburg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South Africa."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e0ed54e1","guard":[["has","zhmerynka"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ukraine."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-e1a7746d","guard":[["hasAny",["all caps","capital letters","capitals","dargeçit","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Türkiye."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-e270337f","guard":[["hasAny",["achaguas","all caps","capital letters","capitals","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Venezuela, Bolivarian Republic of."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-e770c469","guard":[["hasAny",["les","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["les ",{"slot":0}," is in Spain."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-edf43856","guard":[["hasAny",["gihombo","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Rwanda."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ee0f3cd0","guard":[["has","dargeçit"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Türkiye."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-f26f285b","guard":[["has","gunjur"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Gambia."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-f78ead87","guard":[["hasAny",["all caps","arandas","capital letters","capitals","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Mexico."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f84e785e","guard":[["hasAny",["all caps","capital letters","capitals","tashtagol","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Russian Federation."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f870730d","guard":[["hasAny",["longest","longest one","longest word","włocławek"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Poland."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-fe73dea2","guard":[["hasAny",["longest","longest one","longest word","yecapixtla"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Mexico."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-00fed219","guard":[["hasAny",["falls","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Menomonee ",{"slot":0}," is in United States."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0252dd99","guard":[["hasAny",["dargeçit","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Türkiye."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-02d95656","guard":[["hasAny",["dosso","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Niger."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-09d43e03","guard":[["hasAny",["item number","kérou","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Benin."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0ea9a315","guard":[["hasAny",["item number","nth","position","tonami"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Japan."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-105c1f6a","guard":[["hasAny",["item number","lohr","nth","position"]]],"pyramid":["render.template",{"lit":["Lohr am ",{"slot":0}," is in Germany."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-11c6085f","guard":[["hasAny",["chetouane","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Algeria."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1ad82553","guard":[["hasAny",["igurusi","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Tanzania, United Republic of."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-20d28c61","guard":[["hasAny",["item number","nth","position","włocławek"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Poland."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-23c0fb67","guard":[["hasAny",["item number","kérou","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Benin."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-261b6653","guard":[["hasAny",["chenôve","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in France."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-26b63970","guard":[["hasAny",["item number","motsqin","nth","position"]]],"pyramid":["render.template",{"lit":["Qiryat ",{"slot":0}," is in Israel."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2d178b56","guard":[["hasAny",["gihombo","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Rwanda."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-35a71550","guard":[["hasAny",["item number","mondragone","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Italy."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-36b3b473","guard":[["hasAny",["item number","iyesi","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Nigeria."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3b58e675","guard":[["hasAny",["ii","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," II is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3c040649","guard":[["hasAny",["item number","maría","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," María is in Peru."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3fd060ef","guard":[["hasAny",["bekwai","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ghana."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4458618e","guard":[["hasAny",["item number","iyesi","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Nigeria."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4565cc27","guard":[["hasAny",["arandas","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Mexico."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4f57adc7","guard":[["hasAny",["each word","gunjur","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Gambia."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5188ab84","guard":[["hasAny",["item number","mponela","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Malawi."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-52b3af84","guard":[["hasAny",["item number","nth","porte","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Porte is in United States."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-55dced8c","guard":[["hasAny",["each word","gunjur","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Gambia."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5d53b72a","guard":[["hasAny",["dublin","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Dublin is in Ireland."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-60b996fc","guard":[["hasAny",["item number","kirchlengern","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Germany."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-60d52a4d","guard":[["hasAny",["item number","maría","nth","position"]]],"pyramid":["render.template",{"lit":["Tingo ",{"slot":0}," is in Peru."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-65966ecc","guard":[["hasAny",["item number","nth","position","randburg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South Africa."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6902b5b1","guard":[["hasAny",["duba","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Saudi Arabia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6a1a4e5c","guard":[["hasAny",["item number","nth","position","yecapixtla"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Mexico."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6fcd0fca","guard":[["hasAny",["item number","khromtau","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Kazakhstan."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-72e801f9","guard":[["hasAny",["item number","nth","plunge","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Lithuania."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7a377f6f","guard":[["hasAny",["each word","mponela","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Malawi."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7cb0a58c","guard":[["hasAny",["item number","nth","porte","position"]]],"pyramid":["render.template",{"lit":["La ",{"slot":0}," is in United States."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7d8f6200","guard":[["hasAny",["achaguas","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Venezuela, Bolivarian Republic of."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7e25171f","guard":[["hasAny",["item number","levante","nth","position"]]],"pyramid":["render.template",{"lit":["Sestri ",{"slot":0}," is in Italy."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7eb7f2d8","guard":[["hasAny",["each word","split into words","tashtagol"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Russian Federation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-85d97865","guard":[["hasAny",["item number","nth","oak","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Park is in United States."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8ccd3e11","guard":[["hasAny",["alindao","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central African Republic."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8e58c6b2","guard":[["hasAny",["item number","nth","ortaca","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Türkiye."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8e8ae44f","guard":[["hasAny",["item number","nth","oak","position"]]],"pyramid":["render.template",{"lit":["Oak ",{"slot":0}," is in United States."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-90af5da5","guard":[["hasAny",["dargeçit","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Türkiye."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-90ce38f3","guard":[["hasAny",["item number","nth","position","tikrīt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Iraq."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-93723601","guard":[["hasAny",["dashtobod","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Uzbekistan."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-940a1768","guard":[["hasAny",["châu","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Lai ",{"slot":0}," is in Viet Nam."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-99923e33","guard":[["hasAny",["item number","kenol","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Kenya."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9f384846","guard":[["hasAny",["arandas","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Mexico."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a06c95e4","guard":[["hasAny",["item number","nth","position","sector"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," 5 is in Romania."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a2e7ba2a","guard":[["hasAny",["chenôve","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in France."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a585c29d","guard":[["hasAny",["each word","gihombo","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Rwanda."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a74c3a0c","guard":[["hasAny",["duba","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Saudi Arabia."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a77c7174","guard":[["hasAny",["item number","nth","position","włocławek"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Poland."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a8704029","guard":[["hasAny",["item number","motsqin","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Motsqin is in Israel."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ab17fd6e","guard":[["hasAny",["item number","nth","position","randburg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South Africa."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b172f20e","guard":[["hasAny",["duba","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Saudi Arabia."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b207bd3b","guard":[["hasAny",["item number","markala","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Mali."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b336b1d3","guard":[["hasAny",["falls","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Falls is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b3e3de0f","guard":[["hasAny",["dublin","item number","nth","position"]]],"pyramid":["render.template",{"lit":["South ",{"slot":0}," is in Ireland."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bb4fb35d","guard":[["hasAny",["item number","kenol","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Kenya."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-bbef6ae8","guard":[["hasAny",["each word","split into words","tonami"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Japan."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bd396b27","guard":[["hasAny",["fūman","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Iran, Islamic Republic of."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bfe94290","guard":[["hasAny",["each word","split into words","tonami"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Japan."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c184c9bb","guard":[["hasAny",["dosso","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Niger."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c62f8060","guard":[["hasAny",["hardwick","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Kempston ",{"slot":0}," is in United Kingdom."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cc8b6672","guard":[["hasAny",["dosso","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Niger."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cd58959b","guard":[["hasAny",["item number","maldegem","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Belgium."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-cd76128c","guard":[["hasAny",["achaguas","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Venezuela, Bolivarian Republic of."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d1d9a3f3","guard":[["hasAny",["alindao","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central African Republic."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d27bac21","guard":[["hasAny",["each word","gihombo","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Rwanda."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d395ade0","guard":[["hasAny",["item number","levante","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Levante is in Italy."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d7a739fa","guard":[["hasAny",["each word","split into words","zhmerynka"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ukraine."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d7bd4922","guard":[["hasAny",["changling","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in China."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dc524997","guard":[["hasAny",["each word","mponela","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Malawi."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dc5d39e4","guard":[["hasAny",["irati","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Brazil."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-dc6a6026","guard":[["hasAny",["item number","markala","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Mali."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-de196bf4","guard":[["hasAny",["châu","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Châu is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e6c6c624","guard":[["hasAny",["hardwick","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Hardwick is in United Kingdom."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f0e2145d","guard":[["hasAny",["item number","les","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Roquetes is in Spain."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f3199aed","guard":[["hasAny",["gunjur","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Gambia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f69e260d","guard":[["hasAny",["item number","lohr","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," am Main is in Germany."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-fada0457","guard":[["hasAny",["fūman","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Iran, Islamic Republic of."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-fd12c235","guard":[["hasAny",["dashtobod","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Uzbekistan."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0add1cd0","guard":[["hasAny",["falls","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-2be4b858","guard":[["hasAny",["les","longest","longest one","longest word","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Spain."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3c04671d","guard":[["hasAny",["châu","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-5c284407","guard":[["hasAny",["clair","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Clair ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-634d048e","guard":[["hasAny",["item number","motsqin","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Israel."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-82fc6283","guard":[["hasAny",["benut","longest","longest one","longest word","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Kawasan ",{"slot":0}," ",{"slot":1}," Benut Tiga is in Malaysia."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8f0eb51b","guard":[["hasAny",["clair","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Saint ",{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-9b9e4933","guard":[["hasAny",["item number","lohr","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," am ",{"slot":1}," is in Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-9cdf53c2","guard":[["hasAny",["item number","levante","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Italy."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-a70f5fd2","guard":[["hasAny",["ii","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Brazil."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fea60d86","guard":[["hasAny",["itaipu","longest","longest one","longest word","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Santa ",{"slot":0}," ",{"slot":1}," Itaipu is in Brazil."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-05cd71a9","guard":[["hasAny",["ii","item number","nth","position","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-065b50a3","guard":[["hasAny",["invert case","item number","levante","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Italy."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0fc9a13f","guard":[["hasAny",["falls","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-109a864c","guard":[["hasAny",["itaipu","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Terezinha ",{"slot":1}," Itaipu is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-113f042f","guard":[["hasAny",["falls","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in United States."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-15038071","guard":[["hasAny",["all caps","capital letters","capitals","item number","lohr","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," am ",{"slot":1}," is in Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-1c7dfacd","guard":[["hasAny",["châu","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2328f60c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","falls","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-23829547","guard":[["hasAny",["all caps","capital letters","capitals","châu","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-25d235b3","guard":[["hasAny",["item number","nth","position","sector","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Romania."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-269929e2","guard":[["hasAny",["item number","levante","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Italy."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-28d0df58","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","motsqin","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Israel."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-29f838b0","guard":[["hasAny",["benut","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Ulu Benut Tiga is in Malaysia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2bb5e75e","guard":[["hasAny",["cernusco","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Naviglio is in Italy."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2cf31c9b","guard":[["hasAny",["hardwick","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in United Kingdom."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2d5dbb6c","guard":[["hasAny",["item number","nth","position","román","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Tlaltenango ",{"slot":0}," ",{"slot":1}," Román is in Mexico."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-2fb8beb0","guard":[["hasAny",["invert case","item number","motsqin","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Israel."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-306e63e7","guard":[["hasAny",["cernusco","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Cernusco ",{"slot":0}," ",{"slot":1}," is in Italy."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-3442e17a","guard":[["hasAny",["carles","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Carles ",{"slot":1}," la Ràpita is in Spain."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-47d53591","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","levante","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Italy."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-48c4eaf6","guard":[["hasAny",["bua","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Nong ",{"slot":0}," ",{"slot":1}," is in Thailand."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-4b826a64","guard":[["hasAny",["all caps","capital letters","capitals","item number","levante","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Italy."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-4bb812e6","guard":[["hasAny",["dubnica","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Váhom is in Slovakia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-506bc514","guard":[["hasAny",["item number","lohr","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," am ",{"slot":1}," is in Germany."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5cce3fa5","guard":[["hasAny",["all caps","capital letters","capitals","item number","motsqin","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Israel."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-5e52f255","guard":[["hasAny",["item number","les","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Spain."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-63267e03","guard":[["hasAny",["item number","motsqin","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Israel."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-683c18e2","guard":[["hasAny",["dubnica","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Dubnica ",{"slot":0}," ",{"slot":1}," is in Slovakia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-684ee431","guard":[["hasAny",["item number","les","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Spain."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6c4a7c49","guard":[["hasAny",["carles","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Sant ",{"slot":0}," ",{"slot":1}," la Ràpita is in Spain."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6cf4d92c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","châu","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7546bae4","guard":[["hasAny",["ii","item number","nth","position","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-94e6c9b3","guard":[["hasAny",["benut","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Penempatan ",{"slot":1}," Benut Tiga is in Malaysia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9c546f23","guard":[["hasAny",["item number","nth","position","sector","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Romania."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-9d47a277","guard":[["hasAny",["falls","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a929ee55","guard":[["hasAny",["châu","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Viet Nam."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b2695582","guard":[["hasAny",["all caps","capital letters","capitals","falls","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b51d033f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","lohr","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," am ",{"slot":1}," is in Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b8f225f6","guard":[["hasAny",["item number","lower case","lowercase","motsqin","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Israel."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-be9e6a1a","guard":[["hasAny",["item number","nth","position","román","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Sánchez Román is in Mexico."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c2b71c75","guard":[["hasAny",["ii","item number","nth","position","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Brazil."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d3a0d6f3","guard":[["hasAny",["châu","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-dac29980","guard":[["hasAny",["item number","lohr","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," am ",{"slot":1}," is in Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e144c451","guard":[["hasAny",["invert case","item number","lohr","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," am ",{"slot":1}," is in Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e329f7da","guard":[["hasAny",["itaipu","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," de Itaipu is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-fb808cf8","guard":[["hasAny",["item number","levante","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Italy."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fd05393a","guard":[["hasAny",["bua","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Lamphu is in Thailand."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-03133b2b","guard":[["hasAny",["châu","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-033b57c4","guard":[["hasAny",["clair","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Shores is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-077ec5be","guard":[["hasAny",["item number","lohr","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," am ",{"slot":1}," is in Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-09abd9b2","guard":[["hasAny",["falls","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-10b5f3e3","guard":[["hasAny",["item number","motsqin","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Israel."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-12f6b435","guard":[["hasAny",["dubnica","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," nad ",{"slot":1}," is in Slovakia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-1959212e","guard":[["hasAny",["item number","motsqin","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Israel."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-241a6bd7","guard":[["hasAny",["châu","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-29fc696f","guard":[["hasAny",["each word","falls","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3a1f01ff","guard":[["hasAny",["falls","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-3ea9b748","guard":[["hasAny",["each word","item number","lohr","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," am ",{"slot":1}," is in Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-405061e4","guard":[["hasAny",["edison","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Lobão is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-463be3a4","guard":[["hasAny",["ii","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4839248e","guard":[["hasAny",["clair","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in United States."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-5595e042","guard":[["hasAny",["falls","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5830005d","guard":[["hasAny",["each word","item number","motsqin","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Israel."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-681d3e29","guard":[["hasAny",["item number","nth","oak","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7732bd31","guard":[["hasAny",["item number","motsqin","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Israel."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7b637c7b","guard":[["hasAny",["châu","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7f7db55d","guard":[["hasAny",["each word","falls","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-81dff54f","guard":[["hasAny",["item number","lohr","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," am ",{"slot":1}," is in Germany."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-88f27f90","guard":[["hasAny",["item number","levante","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Italy."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9853c362","guard":[["hasAny",["item number","nth","position","sector"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Romania."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9d69a46e","guard":[["hasAny",["item number","les","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Spain."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a28d4dca","guard":[["hasAny",["dublin","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Ireland."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a45533dc","guard":[["hasAny",["dublin","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Ireland."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a6c7be59","guard":[["hasAny",["each word","item number","lohr","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," am ",{"slot":1}," is in Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-aba4c00e","guard":[["hasAny",["item number","maría","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Peru."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b5f79a80","guard":[["hasAny",["châu","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Viet Nam."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b708abc9","guard":[["hasAny",["carles","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," de la Ràpita is in Spain."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bb599525","guard":[["hasAny",["châu","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-c4a806a9","guard":[["hasAny",["item number","maría","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Peru."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ca03c0da","guard":[["hasAny",["edison","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Governador ",{"slot":0}," ",{"slot":1}," is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-cbcee61d","guard":[["hasAny",["item number","nth","position","román"]]],"pyramid":["render.template",{"lit":[{"slot":0}," de ",{"slot":1}," Román is in Mexico."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-cccd96ae","guard":[["hasAny",["item number","lohr","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," am ",{"slot":1}," is in Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d82cca85","guard":[["hasAny",["each word","item number","motsqin","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Israel."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dfd91684","guard":[["hasAny",["edison","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Edison ",{"slot":1}," is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e40510e5","guard":[["hasAny",["item number","levante","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Italy."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-e4bad875","guard":[["hasAny",["cernusco","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," sul ",{"slot":1}," is in Italy."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e7d937cc","guard":[["hasAny",["hardwick","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in United Kingdom."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e94be479","guard":[["hasAny",["hardwick","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in United Kingdom."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-eabdb6f6","guard":[["hasAny",["item number","levante","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Italy."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f1fb31ac","guard":[["hasAny",["each word","item number","levante","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Italy."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f6513e6b","guard":[["hasAny",["each word","item number","levante","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Italy."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fe165447","guard":[["hasAny",["bua","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Bua ",{"slot":1}," is in Thailand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-06d3ab67","guard":[["hasAny",["item number","khánh","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Trùng ",{"slot":2}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-2cae6104","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","román","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Román is in Mexico."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-5460da21","guard":[["hasAny",["benut","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Benut Tiga is in Malaysia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5b22b602","guard":[["hasAny",["itaipu","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Itaipu is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5b60ed98","guard":[["hasAny",["clair","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-a6bfb7a1","guard":[["hasAny",["clair","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in United States."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-a823907f","guard":[["hasAny",["item number","khánh","nth","position"]]],"pyramid":["render.template",{"lit":["Thị ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Viet Nam."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-c02366af","guard":[["hasAny",["itaipu","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Itaipu is in Brazil."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c8f5042a","guard":[["hasAny",["item number","khánh","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Trấn ",{"slot":1}," ",{"slot":2}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-d67fede0","guard":[["hasAny",["itaipu","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Itaipu is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-db94fcf6","guard":[["hasAny",["benut","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Benut Tiga is in Malaysia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ef20ef09","guard":[["hasAny",["cernusco","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Italy."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-041707e8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","clair","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-10c8ee2e","guard":[["hasAny",["clair","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-13efc643","guard":[["hasAny",["all caps","capital letters","capitals","clair","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-196b25c4","guard":[["hasAny",["itaipu","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Itaipu is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1ac75c6f","guard":[["hasAny",["item number","nth","position","román","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Román is in Mexico."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-3c8101a5","guard":[["hasAny",["benut","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Benut Tiga is in Malaysia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-473508d2","guard":[["hasAny",["benut","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Benut Tiga is in Malaysia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-72b30e24","guard":[["hasAny",["itaipu","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Itaipu is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-77c39e38","guard":[["hasAny",["cernusco","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Italy."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-81d4d2a5","guard":[["hasAny",["edison","item number","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Brazil."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-8abae806","guard":[["hasAny",["clair","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-95876a75","guard":[["hasAny",["bua","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Thailand."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-9c9b07e0","guard":[["hasAny",["dubnica","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Slovakia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-d2c4179e","guard":[["hasAny",["carles","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," la Ràpita is in Spain."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-dce9f3e3","guard":[["hasAny",["carles","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," la Ràpita is in Spain."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-e998e485","guard":[["hasAny",["carles","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," la Ràpita is in Spain."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fe6a96c4","guard":[["hasAny",["dubnica","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Slovakia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-12b827a3","guard":[["hasAny",["item number","khánh","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is in Viet Nam."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-29571e6b","guard":[["hasAny",["edison","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-36baf18a","guard":[["hasAny",["carles","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," la Ràpita is in Spain."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-4e966c10","guard":[["hasAny",["item number","khánh","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Khánh is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-661cfda2","guard":[["hasAny",["edison","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Brazil."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-7cd4f11b","guard":[["hasAny",["cernusco","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Italy."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-a9b0161b","guard":[["hasAny",["clair","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-be7e7823","guard":[["hasAny",["clair","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-be9da395","guard":[["hasAny",["item number","nth","position","román"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Román is in Mexico."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-c4436c29","guard":[["hasAny",["bua","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Thailand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-d1cc157e","guard":[["hasAny",["clair","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-db721b47","guard":[["hasAny",["clair","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ed5f0ed4","guard":[["hasAny",["dubnica","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Slovakia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-064e1136","guard":[["hasAny",["item number","khánh","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-a8ab71f6","guard":[["hasAny",["item number","khánh","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is in Viet Nam."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-1bc7c165","guard":[["hasAny",["item number","khánh","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2cb3e407","guard":[["hasAny",["invert case","item number","khánh","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2daa20c3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","khánh","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-82eb1a52","guard":[["hasAny",["all caps","capital letters","capitals","item number","khánh","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-0747c8d8","guard":[["hasAny",["each word","item number","khánh","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0d491519","guard":[["hasAny",["each word","item number","khánh","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6ce0d302","guard":[["hasAny",["item number","khánh","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-9e528eb1","guard":[["hasAny",["item number","khánh","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is in Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which country is the city Garuva in","expect":{"contains":["Brazil"],"notRefusal":true}},{"q":"name the country where Yecapixtla lies","expect":{"contains":["Mexico"],"notRefusal":true}},{"q":"name the country where Zapala lies","expect":{"contains":["Argentina"],"notRefusal":true}},{"q":"name the country where Kirchlengern lies","expect":{"contains":["Germany"],"notRefusal":true}},{"q":"name the country where Cha-am lies","expect":{"contains":["Thailand"],"notRefusal":true}},{"q":"name the country where Kenol lies","expect":{"contains":["Kenya"],"notRefusal":true}},{"q":"name the country where Markala lies","expect":{"contains":["Mali"],"notRefusal":true}},{"q":"which country is the city Yemanzhelinsk in","expect":{"contains":["Russian Federation"],"notRefusal":true}},{"q":"in what country is Qiryat Motsqin","expect":{"contains":["Israel"],"notRefusal":true}},{"q":"name the country where Irati lies","expect":{"contains":["Brazil"],"notRefusal":true}},{"q":"in what country is Zhmerynka","expect":{"contains":["Ukraine"],"notRefusal":true}},{"q":"which country is the city Tikrīt in","expect":{"contains":["Iraq"],"notRefusal":true}},{"q":"name the country where Governador Edison Lobão lies","expect":{"contains":["Brazil"],"notRefusal":true}},{"q":"in what country is Changling","expect":{"contains":["China"],"notRefusal":true}},{"q":"name the country where Dashtobod lies","expect":{"contains":["Uzbekistan"],"notRefusal":true}},{"q":"in what country is Pāthri","expect":{"contains":["India"],"notRefusal":true}},{"q":"name the country where Randburg lies","expect":{"contains":["South Africa"],"notRefusal":true}},{"q":"which country is the city Khromtau in","expect":{"contains":["Kazakhstan"],"notRefusal":true}},{"q":"name the country where Massamá lies","expect":{"contains":["Portugal"],"notRefusal":true}},{"q":"name the country where Fūman lies","expect":{"contains":["Iran, Islamic Republic of"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
