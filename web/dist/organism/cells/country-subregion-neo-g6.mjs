// country-subregion-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"country-subregion-neo-g6","class":"country-subregion","generation":6,"lane":"neo","grownFrom":["name the world subregion of Egypt","which subregion of the world is Sweden in","which subregion of the world is Philippines in","in what subregion does Montserrat lie","which subregion of the world is Congo in","which subregion of the world is United States Virgin Islands in","in what subregion does Nepal lie","which subregion of the world is Tonga in","which subregion of the world is Senegal in","in what subregion does Luxembourg lie","in what subregion does United States Minor Outlying Islands lie","in what subregion does São Tomé and Príncipe lie","in what subregion does Hong Kong lie","in what subregion does Kyrgyzstan lie","which subregion of the world is American Samoa in","in what subregion does Russia lie","which subregion of the world is Netherlands in","name the world subregion of Cayman Islands","name the world subregion of Albania","in what subregion does Gambia lie"],"version":1});

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
{"id":"n-6077cbef","guard":[["has","subregion"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Sweden in":"Sweden is in Northern Europe.","name the world subregion of Egypt":"Egypt is in Northern Africa.","which subregion of the world is Philippines in":"Philippines is in South-Eastern Asia.","in what subregion does Montserrat lie":"Montserrat is in Caribbean.","which subregion of the world is Congo in":"Congo is in Middle Africa.","which subregion of the world is United States Virgin Islands in":"United States Virgin Islands is in Caribbean.","in what subregion does Nepal lie":"Nepal is in Southern Asia.","which subregion of the world is Tonga in":"Tonga is in Polynesia.","which subregion of the world is Senegal in":"Senegal is in Western Africa.","in what subregion does Luxembourg lie":"Luxembourg is in Western Europe.","in what subregion does United States Minor Outlying Islands lie":"United States Minor Outlying Islands is in North America.","in what subregion does São Tomé and Príncipe lie":"São Tomé and Príncipe is in Middle Africa.","in what subregion does Hong Kong lie":"Hong Kong is in Eastern Asia.","in what subregion does Kyrgyzstan lie":"Kyrgyzstan is in Central Asia.","which subregion of the world is American Samoa in":"American Samoa is in Polynesia.","in what subregion does Russia lie":"Russia is in Eastern Europe.","which subregion of the world is Netherlands in":"Netherlands is in Western Europe.","name the world subregion of Cayman Islands":"Cayman Islands is in Caribbean.","name the world subregion of Albania":"Albania is in Southeast Europe.","in what subregion does Gambia lie":"Gambia is in Western Africa.","which subregion of the world is Timor-Leste in":"Timor-Leste is in South-Eastern Asia.","name the world subregion of Oman":"Oman is in Western Asia.","which subregion of the world is Curaçao in":"Curaçao is in Caribbean.","in what subregion does Tuvalu lie":"Tuvalu is in Polynesia.","name the world subregion of Jamaica":"Jamaica is in Caribbean.","name the world subregion of Estonia":"Estonia is in Northern Europe.","name the world subregion of Guadeloupe":"Guadeloupe is in Caribbean.","in what subregion does Spain lie":"Spain is in Southern Europe.","in what subregion does Brazil lie":"Brazil is in South America.","in what subregion does Cook Islands lie":"Cook Islands is in Polynesia.","in what subregion does Guyana lie":"Guyana is in South America.","in what subregion does Dominica lie":"Dominica is in Caribbean.","name the world subregion of Rwanda":"Rwanda is in Eastern Africa.","name the world subregion of Seychelles":"Seychelles is in Eastern Africa.","in what subregion does Monaco lie":"Monaco is in Western Europe.","which subregion of the world is Lebanon in":"Lebanon is in Western Asia.","name the world subregion of Maldives":"Maldives is in Southern Asia.","name the world subregion of Indonesia":"Indonesia is in South-Eastern Asia.","in what subregion does Bahrain lie":"Bahrain is in Western Asia.","in what subregion does New Zealand lie":"New Zealand is in Australia and New Zealand.","which subregion of the world is Svalbard and Jan Mayen in":"Svalbard and Jan Mayen is in Northern Europe.","which subregion of the world is Canada in":"Canada is in North America.","in what subregion does Ivory Coast lie":"Ivory Coast is in Western Africa.","in what subregion does Western Sahara lie":"Western Sahara is in Northern Africa.","which subregion of the world is Sint Maarten in":"Sint Maarten is in Caribbean.","in what subregion does Kiribati lie":"Kiribati is in Micronesia.","which subregion of the world is Malta in":"Malta is in Southern Europe.","which subregion of the world is Chad in":"Chad is in Middle Africa.","which subregion of the world is Armenia in":"Armenia is in Western Asia.","which subregion of the world is Trinidad and Tobago in":"Trinidad and Tobago is in Caribbean.","in what subregion does Croatia lie":"Croatia is in Southeast Europe.","name the world subregion of North Macedonia":"North Macedonia is in Southeast Europe.","which subregion of the world is Guatemala in":"Guatemala is in Central America.","which subregion of the world is Madagascar in":"Madagascar is in Eastern Africa.","name the world subregion of South Sudan":"South Sudan is in Middle Africa.","which subregion of the world is Cameroon in":"Cameroon is in Middle Africa.","name the world subregion of Switzerland":"Switzerland is in Western Europe.","which subregion of the world is Uganda in":"Uganda is in Eastern Africa.","which subregion of the world is Barbados in":"Barbados is in Caribbean.","name the world subregion of Venezuela":"Venezuela is in South America.","which subregion of the world is Saint Kitts and Nevis in":"Saint Kitts and Nevis is in Caribbean.","which subregion of the world is Martinique in":"Martinique is in Caribbean.","name the world subregion of Jordan":"Jordan is in Western Asia.","which subregion of the world is Kazakhstan in":"Kazakhstan is in Central Asia.","in what subregion does Saint Vincent and the Grenadines lie":"Saint Vincent and the Grenadines is in Caribbean.","name the world subregion of Togo":"Togo is in Western Africa.","name the world subregion of Chile":"Chile is in South America.","which subregion of the world is Northern Mariana Islands in":"Northern Mariana Islands is in Micronesia.","which subregion of the world is Zimbabwe in":"Zimbabwe is in Eastern Africa.","in what subregion does Ireland lie":"Ireland is in Northern Europe.","name the world subregion of Azerbaijan":"Azerbaijan is in Western Asia.","name the world subregion of Guinea":"Guinea is in Western Africa.","which subregion of the world is Belize in":"Belize is in Central America.","name the world subregion of Syria":"Syria is in Western Asia.","name the world subregion of South Africa":"South Africa is in Southern Africa.","name the world subregion of Norway":"Norway is in Northern Europe.","name the world subregion of Pitcairn Islands":"Pitcairn Islands is in Polynesia.","name the world subregion of Bermuda":"Bermuda is in North America.","name the world subregion of Cape Verde":"Cape Verde is in Western Africa.","name the world subregion of Thailand":"Thailand is in South-Eastern Asia.","in what subregion does Bulgaria lie":"Bulgaria is in Southeast Europe.","in what subregion does Antigua and Barbuda lie":"Antigua and Barbuda is in Caribbean.","in what subregion does Comoros lie":"Comoros is in Eastern Africa.","in what subregion does Isle of Man lie":"Isle of Man is in Northern Europe.","which subregion of the world is Saudi Arabia in":"Saudi Arabia is in Western Asia.","name the world subregion of United States":"United States is in North America.","which subregion of the world is Cuba in":"Cuba is in Caribbean.","name the world subregion of Nicaragua":"Nicaragua is in Central America.","name the world subregion of Portugal":"Portugal is in Southern Europe.","name the world subregion of Namibia":"Namibia is in Southern Africa.","in what subregion does Saint Barthélemy lie":"Saint Barthélemy is in Caribbean.","in what subregion does Türkiye lie":"Türkiye is in Western Asia.","in what subregion does Guernsey lie":"Guernsey is in Northern Europe.","which subregion of the world is Saint Pierre and Miquelon in":"Saint Pierre and Miquelon is in North America.","which subregion of the world is Belarus in":"Belarus is in Eastern Europe.","in what subregion does Marshall Islands lie":"Marshall Islands is in Micronesia.","in what subregion does Greenland lie":"Greenland is in North America.","name the world subregion of Kenya":"Kenya is in Eastern Africa.","name the world subregion of Ukraine":"Ukraine is in Eastern Europe.","which subregion of the world is Afghanistan in":"Afghanistan is in Southern Asia."}}},
{"id":"n-74fcf10a","guard":[["has","subregion"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Sweden in":"Sweden is in Northern Europe.","name the world subregion of Egypt":"Egypt is in Northern Africa.","which subregion of the world is Philippines in":"Philippines is in South-Eastern Asia.","in what subregion does Montserrat lie":"Montserrat is in Caribbean.","which subregion of the world is Congo in":"Congo is in Middle Africa.","which subregion of the world is United States Virgin Islands in":"United States Virgin Islands is in Caribbean.","in what subregion does Nepal lie":"Nepal is in Southern Asia.","which subregion of the world is Tonga in":"Tonga is in Polynesia.","which subregion of the world is Senegal in":"Senegal is in Western Africa.","in what subregion does Luxembourg lie":"Luxembourg is in Western Europe.","in what subregion does United States Minor Outlying Islands lie":"United States Minor Outlying Islands is in North America.","in what subregion does São Tomé and Príncipe lie":"São Tomé and Príncipe is in Middle Africa.","in what subregion does Hong Kong lie":"Hong Kong is in Eastern Asia.","in what subregion does Kyrgyzstan lie":"Kyrgyzstan is in Central Asia.","which subregion of the world is American Samoa in":"American Samoa is in Polynesia.","in what subregion does Russia lie":"Russia is in Eastern Europe.","which subregion of the world is Netherlands in":"Netherlands is in Western Europe.","name the world subregion of Cayman Islands":"Cayman Islands is in Caribbean.","name the world subregion of Albania":"Albania is in Southeast Europe.","in what subregion does Gambia lie":"Gambia is in Western Africa.","which subregion of the world is Timor-Leste in":"Timor-Leste is in South-Eastern Asia.","name the world subregion of Oman":"Oman is in Western Asia.","which subregion of the world is Curaçao in":"Curaçao is in Caribbean.","in what subregion does Tuvalu lie":"Tuvalu is in Polynesia.","name the world subregion of Jamaica":"Jamaica is in Caribbean.","name the world subregion of Estonia":"Estonia is in Northern Europe.","name the world subregion of Guadeloupe":"Guadeloupe is in Caribbean.","in what subregion does Spain lie":"Spain is in Southern Europe.","in what subregion does Brazil lie":"Brazil is in South America.","in what subregion does Cook Islands lie":"Cook Islands is in Polynesia.","in what subregion does Guyana lie":"Guyana is in South America.","in what subregion does Dominica lie":"Dominica is in Caribbean.","name the world subregion of Rwanda":"Rwanda is in Eastern Africa.","name the world subregion of Seychelles":"Seychelles is in Eastern Africa.","in what subregion does Monaco lie":"Monaco is in Western Europe.","which subregion of the world is Lebanon in":"Lebanon is in Western Asia.","name the world subregion of Maldives":"Maldives is in Southern Asia.","name the world subregion of Indonesia":"Indonesia is in South-Eastern Asia.","in what subregion does Bahrain lie":"Bahrain is in Western Asia.","in what subregion does New Zealand lie":"New Zealand is in Australia and New Zealand.","which subregion of the world is Svalbard and Jan Mayen in":"Svalbard and Jan Mayen is in Northern Europe.","which subregion of the world is Canada in":"Canada is in North America.","in what subregion does Ivory Coast lie":"Ivory Coast is in Western Africa.","in what subregion does Western Sahara lie":"Western Sahara is in Northern Africa.","which subregion of the world is Sint Maarten in":"Sint Maarten is in Caribbean.","in what subregion does Kiribati lie":"Kiribati is in Micronesia.","which subregion of the world is Malta in":"Malta is in Southern Europe.","which subregion of the world is Chad in":"Chad is in Middle Africa.","which subregion of the world is Armenia in":"Armenia is in Western Asia.","which subregion of the world is Trinidad and Tobago in":"Trinidad and Tobago is in Caribbean.","in what subregion does Croatia lie":"Croatia is in Southeast Europe.","name the world subregion of North Macedonia":"North Macedonia is in Southeast Europe.","which subregion of the world is Guatemala in":"Guatemala is in Central America.","which subregion of the world is Madagascar in":"Madagascar is in Eastern Africa.","name the world subregion of South Sudan":"South Sudan is in Middle Africa.","which subregion of the world is Cameroon in":"Cameroon is in Middle Africa.","name the world subregion of Switzerland":"Switzerland is in Western Europe.","which subregion of the world is Uganda in":"Uganda is in Eastern Africa.","which subregion of the world is Barbados in":"Barbados is in Caribbean.","name the world subregion of Venezuela":"Venezuela is in South America.","which subregion of the world is Saint Kitts and Nevis in":"Saint Kitts and Nevis is in Caribbean.","which subregion of the world is Martinique in":"Martinique is in Caribbean.","name the world subregion of Jordan":"Jordan is in Western Asia.","which subregion of the world is Kazakhstan in":"Kazakhstan is in Central Asia.","in what subregion does Saint Vincent and the Grenadines lie":"Saint Vincent and the Grenadines is in Caribbean.","name the world subregion of Togo":"Togo is in Western Africa.","name the world subregion of Chile":"Chile is in South America.","which subregion of the world is Northern Mariana Islands in":"Northern Mariana Islands is in Micronesia.","which subregion of the world is Zimbabwe in":"Zimbabwe is in Eastern Africa.","in what subregion does Ireland lie":"Ireland is in Northern Europe.","name the world subregion of Azerbaijan":"Azerbaijan is in Western Asia.","name the world subregion of Guinea":"Guinea is in Western Africa.","which subregion of the world is Belize in":"Belize is in Central America.","name the world subregion of Syria":"Syria is in Western Asia.","name the world subregion of South Africa":"South Africa is in Southern Africa.","name the world subregion of Norway":"Norway is in Northern Europe.","name the world subregion of Pitcairn Islands":"Pitcairn Islands is in Polynesia.","name the world subregion of Bermuda":"Bermuda is in North America.","name the world subregion of Cape Verde":"Cape Verde is in Western Africa.","name the world subregion of Thailand":"Thailand is in South-Eastern Asia.","in what subregion does Bulgaria lie":"Bulgaria is in Southeast Europe.","in what subregion does Antigua and Barbuda lie":"Antigua and Barbuda is in Caribbean.","in what subregion does Comoros lie":"Comoros is in Eastern Africa.","in what subregion does Isle of Man lie":"Isle of Man is in Northern Europe.","which subregion of the world is Saudi Arabia in":"Saudi Arabia is in Western Asia.","name the world subregion of United States":"United States is in North America.","which subregion of the world is Cuba in":"Cuba is in Caribbean.","name the world subregion of Nicaragua":"Nicaragua is in Central America.","name the world subregion of Portugal":"Portugal is in Southern Europe.","name the world subregion of Namibia":"Namibia is in Southern Africa.","in what subregion does Saint Barthélemy lie":"Saint Barthélemy is in Caribbean.","in what subregion does Türkiye lie":"Türkiye is in Western Asia.","in what subregion does Guernsey lie":"Guernsey is in Northern Europe.","which subregion of the world is Saint Pierre and Miquelon in":"Saint Pierre and Miquelon is in North America.","which subregion of the world is Belarus in":"Belarus is in Eastern Europe.","in what subregion does Marshall Islands lie":"Marshall Islands is in Micronesia.","in what subregion does Greenland lie":"Greenland is in North America.","name the world subregion of Kenya":"Kenya is in Eastern Africa.","name the world subregion of Ukraine":"Ukraine is in Eastern Europe.","which subregion of the world is Afghanistan in":"Afghanistan is in Southern Asia."}}},
{"id":"n-d58b2c9d","guard":[["has","subregion"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"subregion"}]]],"mem":{"table":{"of the world is Sweden in":"Sweden is in Northern Europe.","of Egypt":"Egypt is in Northern Africa.","of the world is Philippines in":"Philippines is in South-Eastern Asia.","does Montserrat lie":"Montserrat is in Caribbean.","of the world is Congo in":"Congo is in Middle Africa.","of the world is United States Virgin Islands in":"United States Virgin Islands is in Caribbean.","does Nepal lie":"Nepal is in Southern Asia.","of the world is Tonga in":"Tonga is in Polynesia.","of the world is Senegal in":"Senegal is in Western Africa.","does Luxembourg lie":"Luxembourg is in Western Europe.","does United States Minor Outlying Islands lie":"United States Minor Outlying Islands is in North America.","does São Tomé and Príncipe lie":"São Tomé and Príncipe is in Middle Africa.","does Hong Kong lie":"Hong Kong is in Eastern Asia.","does Kyrgyzstan lie":"Kyrgyzstan is in Central Asia.","of the world is American Samoa in":"American Samoa is in Polynesia.","does Russia lie":"Russia is in Eastern Europe.","of the world is Netherlands in":"Netherlands is in Western Europe.","of Cayman Islands":"Cayman Islands is in Caribbean.","of Albania":"Albania is in Southeast Europe.","does Gambia lie":"Gambia is in Western Africa.","of the world is Timor-Leste in":"Timor-Leste is in South-Eastern Asia.","of Oman":"Oman is in Western Asia.","of the world is Curaçao in":"Curaçao is in Caribbean.","does Tuvalu lie":"Tuvalu is in Polynesia.","of Jamaica":"Jamaica is in Caribbean.","of Estonia":"Estonia is in Northern Europe.","of Guadeloupe":"Guadeloupe is in Caribbean.","does Spain lie":"Spain is in Southern Europe.","does Brazil lie":"Brazil is in South America.","does Cook Islands lie":"Cook Islands is in Polynesia.","does Guyana lie":"Guyana is in South America.","does Dominica lie":"Dominica is in Caribbean.","of Rwanda":"Rwanda is in Eastern Africa.","of Seychelles":"Seychelles is in Eastern Africa.","does Monaco lie":"Monaco is in Western Europe.","of the world is Lebanon in":"Lebanon is in Western Asia.","of Maldives":"Maldives is in Southern Asia.","of Indonesia":"Indonesia is in South-Eastern Asia.","does Bahrain lie":"Bahrain is in Western Asia.","does New Zealand lie":"New Zealand is in Australia and New Zealand.","of the world is Svalbard and Jan Mayen in":"Svalbard and Jan Mayen is in Northern Europe.","of the world is Canada in":"Canada is in North America.","does Ivory Coast lie":"Ivory Coast is in Western Africa.","does Western Sahara lie":"Western Sahara is in Northern Africa.","of the world is Sint Maarten in":"Sint Maarten is in Caribbean.","does Kiribati lie":"Kiribati is in Micronesia.","of the world is Malta in":"Malta is in Southern Europe.","of the world is Chad in":"Chad is in Middle Africa.","of the world is Armenia in":"Armenia is in Western Asia.","of the world is Trinidad and Tobago in":"Trinidad and Tobago is in Caribbean.","does Croatia lie":"Croatia is in Southeast Europe.","of North Macedonia":"North Macedonia is in Southeast Europe.","of the world is Guatemala in":"Guatemala is in Central America.","of the world is Madagascar in":"Madagascar is in Eastern Africa.","of South Sudan":"South Sudan is in Middle Africa.","of the world is Cameroon in":"Cameroon is in Middle Africa.","of Switzerland":"Switzerland is in Western Europe.","of the world is Uganda in":"Uganda is in Eastern Africa.","of the world is Barbados in":"Barbados is in Caribbean.","of Venezuela":"Venezuela is in South America.","of the world is Saint Kitts and Nevis in":"Saint Kitts and Nevis is in Caribbean.","of the world is Martinique in":"Martinique is in Caribbean.","of Jordan":"Jordan is in Western Asia.","of the world is Kazakhstan in":"Kazakhstan is in Central Asia.","does Saint Vincent and the Grenadines lie":"Saint Vincent and the Grenadines is in Caribbean.","of Togo":"Togo is in Western Africa.","of Chile":"Chile is in South America.","of the world is Northern Mariana Islands in":"Northern Mariana Islands is in Micronesia.","of the world is Zimbabwe in":"Zimbabwe is in Eastern Africa.","does Ireland lie":"Ireland is in Northern Europe.","of Azerbaijan":"Azerbaijan is in Western Asia.","of Guinea":"Guinea is in Western Africa.","of the world is Belize in":"Belize is in Central America.","of Syria":"Syria is in Western Asia.","of South Africa":"South Africa is in Southern Africa.","of Norway":"Norway is in Northern Europe.","of Pitcairn Islands":"Pitcairn Islands is in Polynesia.","of Bermuda":"Bermuda is in North America.","of Cape Verde":"Cape Verde is in Western Africa.","of Thailand":"Thailand is in South-Eastern Asia.","does Bulgaria lie":"Bulgaria is in Southeast Europe.","does Antigua and Barbuda lie":"Antigua and Barbuda is in Caribbean.","does Comoros lie":"Comoros is in Eastern Africa.","does Isle of Man lie":"Isle of Man is in Northern Europe.","of the world is Saudi Arabia in":"Saudi Arabia is in Western Asia.","of United States":"United States is in North America.","of the world is Cuba in":"Cuba is in Caribbean.","of Nicaragua":"Nicaragua is in Central America.","of Portugal":"Portugal is in Southern Europe.","of Namibia":"Namibia is in Southern Africa.","does Saint Barthélemy lie":"Saint Barthélemy is in Caribbean.","does Türkiye lie":"Türkiye is in Western Asia.","does Guernsey lie":"Guernsey is in Northern Europe.","of the world is Saint Pierre and Miquelon in":"Saint Pierre and Miquelon is in North America.","of the world is Belarus in":"Belarus is in Eastern Europe.","does Marshall Islands lie":"Marshall Islands is in Micronesia.","does Greenland lie":"Greenland is in North America.","of Kenya":"Kenya is in Eastern Africa.","of Ukraine":"Ukraine is in Eastern Europe.","of the world is Afghanistan in":"Afghanistan is in Southern Asia."}}},
{"id":"n-b9f8e9c1","guard":[["has","subregion"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"world"}]]],"mem":{"table":{"is Sweden in":"Sweden is in Northern Europe.","subregion of Egypt":"Egypt is in Northern Africa.","is Philippines in":"Philippines is in South-Eastern Asia.","is Congo in":"Congo is in Middle Africa.","is United States Virgin Islands in":"United States Virgin Islands is in Caribbean.","is Tonga in":"Tonga is in Polynesia.","is Senegal in":"Senegal is in Western Africa.","is American Samoa in":"American Samoa is in Polynesia.","is Netherlands in":"Netherlands is in Western Europe.","subregion of Cayman Islands":"Cayman Islands is in Caribbean.","subregion of Albania":"Albania is in Southeast Europe.","is Timor-Leste in":"Timor-Leste is in South-Eastern Asia.","subregion of Oman":"Oman is in Western Asia.","is Curaçao in":"Curaçao is in Caribbean.","subregion of Jamaica":"Jamaica is in Caribbean.","subregion of Estonia":"Estonia is in Northern Europe.","subregion of Guadeloupe":"Guadeloupe is in Caribbean.","subregion of Rwanda":"Rwanda is in Eastern Africa.","subregion of Seychelles":"Seychelles is in Eastern Africa.","is Lebanon in":"Lebanon is in Western Asia.","subregion of Maldives":"Maldives is in Southern Asia.","subregion of Indonesia":"Indonesia is in South-Eastern Asia.","is Svalbard and Jan Mayen in":"Svalbard and Jan Mayen is in Northern Europe.","is Canada in":"Canada is in North America.","is Sint Maarten in":"Sint Maarten is in Caribbean.","is Malta in":"Malta is in Southern Europe.","is Chad in":"Chad is in Middle Africa.","is Armenia in":"Armenia is in Western Asia.","is Trinidad and Tobago in":"Trinidad and Tobago is in Caribbean.","subregion of North Macedonia":"North Macedonia is in Southeast Europe.","is Guatemala in":"Guatemala is in Central America.","is Madagascar in":"Madagascar is in Eastern Africa.","subregion of South Sudan":"South Sudan is in Middle Africa.","is Cameroon in":"Cameroon is in Middle Africa.","subregion of Switzerland":"Switzerland is in Western Europe.","is Uganda in":"Uganda is in Eastern Africa.","is Barbados in":"Barbados is in Caribbean.","subregion of Venezuela":"Venezuela is in South America.","is Saint Kitts and Nevis in":"Saint Kitts and Nevis is in Caribbean.","is Martinique in":"Martinique is in Caribbean.","subregion of Jordan":"Jordan is in Western Asia.","is Kazakhstan in":"Kazakhstan is in Central Asia.","subregion of Togo":"Togo is in Western Africa.","subregion of Chile":"Chile is in South America.","is Northern Mariana Islands in":"Northern Mariana Islands is in Micronesia.","is Zimbabwe in":"Zimbabwe is in Eastern Africa.","subregion of Azerbaijan":"Azerbaijan is in Western Asia.","subregion of Guinea":"Guinea is in Western Africa.","is Belize in":"Belize is in Central America.","subregion of Syria":"Syria is in Western Asia.","subregion of South Africa":"South Africa is in Southern Africa.","subregion of Norway":"Norway is in Northern Europe.","subregion of Pitcairn Islands":"Pitcairn Islands is in Polynesia.","subregion of Bermuda":"Bermuda is in North America.","subregion of Cape Verde":"Cape Verde is in Western Africa.","subregion of Thailand":"Thailand is in South-Eastern Asia.","is Saudi Arabia in":"Saudi Arabia is in Western Asia.","subregion of United States":"United States is in North America.","is Cuba in":"Cuba is in Caribbean.","subregion of Nicaragua":"Nicaragua is in Central America.","subregion of Portugal":"Portugal is in Southern Europe.","subregion of Namibia":"Namibia is in Southern Africa.","is Saint Pierre and Miquelon in":"Saint Pierre and Miquelon is in North America.","is Belarus in":"Belarus is in Eastern Europe.","subregion of Kenya":"Kenya is in Eastern Africa.","subregion of Ukraine":"Ukraine is in Eastern Europe.","is Afghanistan in":"Afghanistan is in Southern Asia."}}},
{"id":"n-4f6f4c85","guard":[["has","subregion"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"in"}]]],"mem":{"table":{"which subregion of the world is Sweden":"Sweden is in Northern Europe.","which subregion of the world is Philippines":"Philippines is in South-Eastern Asia.","which subregion of the world is Congo":"Congo is in Middle Africa.","which subregion of the world is United States Virgin Islands":"United States Virgin Islands is in Caribbean.","which subregion of the world is Tonga":"Tonga is in Polynesia.","which subregion of the world is Senegal":"Senegal is in Western Africa.","which subregion of the world is American Samoa":"American Samoa is in Polynesia.","which subregion of the world is Netherlands":"Netherlands is in Western Europe.","which subregion of the world is Timor-Leste":"Timor-Leste is in South-Eastern Asia.","which subregion of the world is Curaçao":"Curaçao is in Caribbean.","which subregion of the world is Lebanon":"Lebanon is in Western Asia.","which subregion of the world is Svalbard and Jan Mayen":"Svalbard and Jan Mayen is in Northern Europe.","which subregion of the world is Canada":"Canada is in North America.","which subregion of the world is Sint Maarten":"Sint Maarten is in Caribbean.","which subregion of the world is Malta":"Malta is in Southern Europe.","which subregion of the world is Chad":"Chad is in Middle Africa.","which subregion of the world is Armenia":"Armenia is in Western Asia.","which subregion of the world is Trinidad and Tobago":"Trinidad and Tobago is in Caribbean.","which subregion of the world is Guatemala":"Guatemala is in Central America.","which subregion of the world is Madagascar":"Madagascar is in Eastern Africa.","which subregion of the world is Cameroon":"Cameroon is in Middle Africa.","which subregion of the world is Uganda":"Uganda is in Eastern Africa.","which subregion of the world is Barbados":"Barbados is in Caribbean.","which subregion of the world is Saint Kitts and Nevis":"Saint Kitts and Nevis is in Caribbean.","which subregion of the world is Martinique":"Martinique is in Caribbean.","which subregion of the world is Kazakhstan":"Kazakhstan is in Central Asia.","which subregion of the world is Northern Mariana Islands":"Northern Mariana Islands is in Micronesia.","which subregion of the world is Zimbabwe":"Zimbabwe is in Eastern Africa.","which subregion of the world is Belize":"Belize is in Central America.","which subregion of the world is Saudi Arabia":"Saudi Arabia is in Western Asia.","which subregion of the world is Cuba":"Cuba is in Caribbean.","which subregion of the world is Saint Pierre and Miquelon":"Saint Pierre and Miquelon is in North America.","which subregion of the world is Belarus":"Belarus is in Eastern Europe.","which subregion of the world is Afghanistan":"Afghanistan is in Southern Asia."}}},
{"id":"n-93d1b063","guard":[["has","subregion"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"Sweden in":"Sweden is in Northern Europe.","Philippines in":"Philippines is in South-Eastern Asia.","Congo in":"Congo is in Middle Africa.","United States Virgin Islands in":"United States Virgin Islands is in Caribbean.","Tonga in":"Tonga is in Polynesia.","Senegal in":"Senegal is in Western Africa.","American Samoa in":"American Samoa is in Polynesia.","Netherlands in":"Netherlands is in Western Europe.","Timor-Leste in":"Timor-Leste is in South-Eastern Asia.","Curaçao in":"Curaçao is in Caribbean.","Lebanon in":"Lebanon is in Western Asia.","Svalbard and Jan Mayen in":"Svalbard and Jan Mayen is in Northern Europe.","Canada in":"Canada is in North America.","Sint Maarten in":"Sint Maarten is in Caribbean.","Malta in":"Malta is in Southern Europe.","Chad in":"Chad is in Middle Africa.","Armenia in":"Armenia is in Western Asia.","Trinidad and Tobago in":"Trinidad and Tobago is in Caribbean.","Guatemala in":"Guatemala is in Central America.","Madagascar in":"Madagascar is in Eastern Africa.","Cameroon in":"Cameroon is in Middle Africa.","Uganda in":"Uganda is in Eastern Africa.","Barbados in":"Barbados is in Caribbean.","Saint Kitts and Nevis in":"Saint Kitts and Nevis is in Caribbean.","Martinique in":"Martinique is in Caribbean.","Kazakhstan in":"Kazakhstan is in Central Asia.","Northern Mariana Islands in":"Northern Mariana Islands is in Micronesia.","Zimbabwe in":"Zimbabwe is in Eastern Africa.","Belize in":"Belize is in Central America.","Saudi Arabia in":"Saudi Arabia is in Western Asia.","Cuba in":"Cuba is in Caribbean.","Saint Pierre and Miquelon in":"Saint Pierre and Miquelon is in North America.","Belarus in":"Belarus is in Eastern Europe.","Afghanistan in":"Afghanistan is in Southern Asia."}}},
{"id":"n-d6eee263","guard":[["has","lie"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"in"}]]],"mem":{"table":{"what subregion does Montserrat lie":"Montserrat is in Caribbean.","what subregion does Nepal lie":"Nepal is in Southern Asia.","what subregion does Luxembourg lie":"Luxembourg is in Western Europe.","what subregion does United States Minor Outlying Islands lie":"United States Minor Outlying Islands is in North America.","what subregion does São Tomé and Príncipe lie":"São Tomé and Príncipe is in Middle Africa.","what subregion does Hong Kong lie":"Hong Kong is in Eastern Asia.","what subregion does Kyrgyzstan lie":"Kyrgyzstan is in Central Asia.","what subregion does Russia lie":"Russia is in Eastern Europe.","what subregion does Gambia lie":"Gambia is in Western Africa.","what subregion does Tuvalu lie":"Tuvalu is in Polynesia.","what subregion does Spain lie":"Spain is in Southern Europe.","what subregion does Brazil lie":"Brazil is in South America.","what subregion does Cook Islands lie":"Cook Islands is in Polynesia.","what subregion does Guyana lie":"Guyana is in South America.","what subregion does Dominica lie":"Dominica is in Caribbean.","what subregion does Monaco lie":"Monaco is in Western Europe.","what subregion does Bahrain lie":"Bahrain is in Western Asia.","what subregion does New Zealand lie":"New Zealand is in Australia and New Zealand.","what subregion does Ivory Coast lie":"Ivory Coast is in Western Africa.","what subregion does Western Sahara lie":"Western Sahara is in Northern Africa.","what subregion does Kiribati lie":"Kiribati is in Micronesia.","what subregion does Croatia lie":"Croatia is in Southeast Europe.","what subregion does Saint Vincent and the Grenadines lie":"Saint Vincent and the Grenadines is in Caribbean.","what subregion does Ireland lie":"Ireland is in Northern Europe.","what subregion does Bulgaria lie":"Bulgaria is in Southeast Europe.","what subregion does Antigua and Barbuda lie":"Antigua and Barbuda is in Caribbean.","what subregion does Comoros lie":"Comoros is in Eastern Africa.","what subregion does Isle of Man lie":"Isle of Man is in Northern Europe.","what subregion does Saint Barthélemy lie":"Saint Barthélemy is in Caribbean.","what subregion does Türkiye lie":"Türkiye is in Western Asia.","what subregion does Guernsey lie":"Guernsey is in Northern Europe.","what subregion does Marshall Islands lie":"Marshall Islands is in Micronesia.","what subregion does Greenland lie":"Greenland is in North America."}}},
{"id":"n-0aa8e5fa","guard":[["hasAny",["barbados","cayman","cuba","curaçao","delete","guadeloupe","jamaica","kitts","maarten","martinique","remove","strip out","tobago","virgin","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"caribbean"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-6bd2e39b","guard":[["hasAny",["barbados","cayman","cuba","curaçao","delete","guadeloupe","jamaica","kitts","maarten","martinique","remove","strip out","tobago","virgin","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Caribbean"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-6bda6582","guard":[["hasAny",["barbados","cayman","cuba","curaçao","delete","guadeloupe","jamaica","kitts","maarten","martinique","remove","strip out","tobago","virgin","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"caribbean"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-b916e19d","guard":[["hasAny",["barbados","cayman","cuba","curaçao","delete","guadeloupe","jamaica","kitts","maarten","martinique","remove","strip out","tobago","virgin","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Caribbean"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-2b318081","guard":[["hasAny",["barbados","cuba","curaçao","delete","kitts","maarten","martinique","remove","states","strip out","tobago","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Caribbean"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ba084d42","guard":[["hasAny",["barbados","cuba","curaçao","delete","kitts","maarten","martinique","remove","states","strip out","tobago","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"caribbean"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-2f24233f","guard":[["hasAny",["comoros","kenya","madagascar","rwanda","separate by","seychelles","split","split by","uganda","zimbabwe"]],["has","subregion"]],"pyramid":["render.list",["transform.split",{"lit":"Eastern Africa"},["sense.lastWord"]]],"mem":null},
{"id":"n-b08c1f50","guard":[["hasAny",["comoros","delete","kenya","madagascar","remove","rwanda","seychelles","strip out","uganda","without","zimbabwe"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Africa"},["sense.lastWord"]]],"mem":null},
{"id":"n-02fd93ce","guard":[["hasAny",["arabia","armenia","azerbaijan","delete","jordan","lebanon","oman","remove","strip out","syria","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Western Asia"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-9bbd8f3e","guard":[["hasAny",["change to","comoros","kenya","madagascar","replace","rwanda","seychelles","substitute","swap","uganda","zimbabwe"]],["has","subregion"]],"pyramid":["render.str",["transform.replace",{"lit":"Eastern Africa"},["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-ba53127d","guard":[["hasAny",["arabia","armenia","azerbaijan","delete","jordan","lebanon","oman","remove","strip out","syria","without"]],["has","world"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Asia"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-45b7e55d","guard":[["hasAny",["cape","coast","gambia","guinea","senegal","separate by","split","split by","togo"]],["has","subregion"]],"pyramid":["render.list",["transform.split",{"lit":"Western Africa"},["sense.lastWord"]]],"mem":null},
{"id":"n-8086a0aa","guard":[["hasAny",["cape","coast","delete","gambia","guinea","remove","senegal","strip out","togo","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["sense.lastWord"]]],"mem":null},
{"id":"n-4889dd11","guard":[["hasAny",["delete","kenya","madagascar","remove","rwanda","seychelles","strip out","uganda","without","zimbabwe"]]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Africa"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-a9782da1","guard":[["hasAny",["delete","kenya","madagascar","remove","rwanda","seychelles","strip out","uganda","without","zimbabwe"]],["has","world"]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Africa"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-af74519b","guard":[["hasAny",["cape","change to","coast","gambia","guinea","replace","senegal","substitute","swap","togo"]],["has","subregion"]],"pyramid":["render.str",["transform.replace",{"lit":"Western Africa"},["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-eaf269d8","guard":[["hasAny",["antigua","barbados","barthélemy","cuba","curaçao","element","item number","martinique","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-59a471f8","guard":[["hasAny",["barthélemy","grenadines","guadeloupe","longest","longest one","longest word","martinique","montserrat"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1a91a1f1","guard":[["hasAny",["arabia","azerbaijan","element","item number","jordan","nth","oman","position","syria"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-21702b53","guard":[["hasAny",["guernsey","ireland","isle","jan","separate by","split","split by","sweden"]],["has","subregion"]],"pyramid":["render.lines",["transform.split",{"lit":"Northern Europe"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-614d5479","guard":[["hasAny",["antigua","delete","dominica","montserrat","remove","saint","strip out","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"caribbean"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-75a9b15f","guard":[["hasAny",["delete","guernsey","ireland","isle","jan","remove","strip out","sweden","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Northern Europe"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-7c824cb9","guard":[["hasAny",["guernsey","ireland","isle","jan","separate by","split","split by","sweden"]],["has","subregion"]],"pyramid":["render.and",["transform.split",{"lit":"Northern Europe"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-8a1985c2","guard":[["hasAny",["delete","estonia","isle","jan","norway","remove","strip out","sweden","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Northern Europe"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-956a2bc7","guard":[["hasAny",["element","grenadines","guadeloupe","item number","jamaica","maarten","nth","position","tobago"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-95e83eb8","guard":[["hasAny",["antigua","delete","dominica","montserrat","remove","saint","strip out","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Caribbean"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-dc0410d4","guard":[["hasAny",["guernsey","ireland","isle","jan","separate by","split","split by","sweden"]],["has","subregion"]],"pyramid":["render.list",["transform.split",{"lit":"Northern Europe"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a5e38d64","guard":[["hasAny",["azerbaijan","jordan","oman","syria"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["sense.lastWord"]],"mem":null},
{"id":"n-2d970e7d","guard":[["hasAny",["azerbaijan","jordan","lower case","lowercase","oman","small letters","syria"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-368b2d72","guard":[["hasAny",["all caps","azerbaijan","capital letters","capitals","jordan","oman","syria","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-8d886fdd","guard":[["hasAny",["azerbaijan","capitalise","capitalize","capitalize each word","jordan","oman","syria","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a8c9deea","guard":[["hasAny",["azerbaijan","invert case","jordan","oman","swap case","syria","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f84c104c","guard":[["hasAny",["azerbaijan","jordan","oman","syria"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-24c1f8a0","guard":[["hasAny",["cape","delete","guinea","remove","senegal","strip out","togo","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-2b29098a","guard":[["hasAny",["azerbaijan","each word","jordan","oman","split into words","syria"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2bc14a72","guard":[["hasAny",["cape","delete","guinea","remove","senegal","strip out","togo","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-42b98539","guard":[["hasAny",["cameroon","chad","congo","delete","remove","strip out","sudan","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Middle Africa"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-5c8f90f0","guard":[["hasAny",["cameroon","chad","congo","delete","remove","strip out","sudan","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Middle Africa"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-8fbcf195","guard":[["hasAny",["delete","estonia","jan","norway","remove","strip out","sweden","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Northern Europe"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-9fcf0076","guard":[["hasAny",["azerbaijan","each word","jordan","oman","split into words","syria"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c7040c02","guard":[["hasAny",["delete","indonesia","philippines","remove","strip out","thailand","timorleste","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"South-Eastern Asia"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-d95fbd1b","guard":[["hasAny",["delete","indonesia","philippines","remove","strip out","thailand","timorleste","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"South-Eastern Asia"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-24c23719","guard":[["hasAny",["kenya","rwanda","seychelles"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["sense.lastWord"]],"mem":null},
{"id":"n-2c977eb6","guard":[["hasAny",["cayman","guadeloupe","jamaica"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["sense.lastWord"]],"mem":null},
{"id":"n-ac834888","guard":[["hasAny",["cape","guinea","togo"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["sense.lastWord"]],"mem":null},
{"id":"n-335cda44","guard":[["hasAny",["cape","guinea","togo"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-3cea8bf7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kenya","rwanda","seychelles","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4b79931e","guard":[["hasAny",["cayman","guadeloupe","invert case","jamaica","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4ee39422","guard":[["hasAny",["kenya","rwanda","seychelles"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-4fde339d","guard":[["hasAny",["cape","guinea","invert case","swap case","toggle case","togo"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5eddaaf7","guard":[["hasAny",["all caps","capital letters","capitals","kenya","rwanda","seychelles","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-6811166d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cayman","guadeloupe","jamaica","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-686b6ac6","guard":[["hasAny",["cape","guinea","lower case","lowercase","small letters","togo"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8be37ad4","guard":[["hasAny",["longest","longest one","longest word","luxembourg","netherlands","switzerland"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-90bf5612","guard":[["hasAny",["cape","capitalise","capitalize","capitalize each word","guinea","title case","togo"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9e422fbc","guard":[["hasAny",["all caps","cape","capital letters","capitals","guinea","togo","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-a44320b3","guard":[["hasAny",["kenya","lower case","lowercase","rwanda","seychelles","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a9467ed7","guard":[["hasAny",["cayman","guadeloupe","jamaica"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-d5eb64aa","guard":[["hasAny",["invert case","kenya","rwanda","seychelles","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-eda17631","guard":[["hasAny",["all caps","capital letters","capitals","cayman","guadeloupe","jamaica","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f591c1bd","guard":[["hasAny",["cayman","guadeloupe","jamaica","lower case","lowercase","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-16aeffe1","guard":[["hasAny",["cameroon","chad","congo","delete","remove","strip out","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Middle Africa"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-203124fa","guard":[["hasAny",["bermuda","canada","delete","miquelon","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"North America"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-23abffa8","guard":[["hasAny",["cameroon","chad","congo","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2d37504f","guard":[["hasAny",["each word","kenya","rwanda","seychelles","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-43970911","guard":[["hasAny",["cayman","each word","guadeloupe","jamaica","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-767891a8","guard":[["hasAny",["bermuda","canada","delete","miquelon","remove","strip out","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"North America"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-9088c545","guard":[["hasAny",["delete","madagascar","remove","strip out","uganda","without","zimbabwe"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Africa"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-b49beb1e","guard":[["hasAny",["cape","each word","guinea","split into words","togo"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b77d478b","guard":[["hasAny",["each word","kenya","rwanda","seychelles","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bd3ffabe","guard":[["hasAny",["american","delete","pitcairn","remove","strip out","tonga","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Polynesia"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-c531eec9","guard":[["hasAny",["element","item number","kenya","nth","position","rwanda","seychelles"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d2803a38","guard":[["hasAny",["arabia","armenia","delete","lebanon","remove","strip out","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Asia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-d905e161","guard":[["hasAny",["element","item number","madagascar","nth","position","uganda","zimbabwe"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-db8b3f1d","guard":[["hasAny",["cayman","each word","guadeloupe","jamaica","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f94c1b66","guard":[["hasAny",["cape","each word","guinea","split into words","togo"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f9e1cbb2","guard":[["hasAny",["american","delete","pitcairn","remove","strip out","tonga","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Polynesia"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-fa884182","guard":[["hasAny",["delete","guernsey","ireland","isle","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Northern Europe"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-d5cd1554","guard":[["hasAny",["cayman","element","item number","maarten","normalise","normalize","nth","position","simplify the text","tobago"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-32785e72","guard":[["hasAny",["estonia","norway"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["sense.lastWord"]],"mem":null},
{"id":"n-c25f5100","guard":[["hasAny",["indonesia","thailand"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["sense.lastWord"]],"mem":null},
{"id":"n-d9ca59ea","guard":[["hasAny",["africa","namibia"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["sense.lastWord"]],"mem":null},
{"id":"n-dbd54cee","guard":[["hasAny",["albania","macedonia"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["sense.lastWord"]],"mem":null},
{"id":"n-de1aeed7","guard":[["hasAny",["chile","venezuela"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["sense.lastWord"]],"mem":null},
{"id":"n-00a7fe07","guard":[["hasAny",["kazakhstan","kyrgyzstan","longest","longest one","longest word"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central Asia."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-017393ac","guard":[["hasAny",["estonia","invert case","norway","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0deec845","guard":[["hasAny",["longest","longest one","longest word","philippines","timorleste"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1ddeeeb4","guard":[["hasAny",["longest","longest one","longest word","madagascar","seychelles"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-27d45c28","guard":[["hasAny",["indonesia","lower case","lowercase","small letters","thailand"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2edcfedd","guard":[["hasAny",["africa","capitalise","capitalize","capitalize each word","namibia","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-429abcc6","guard":[["hasAny",["estonia","lower case","lowercase","norway","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-43983a55","guard":[["hasAny",["albania","lower case","lowercase","macedonia","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-49d940d9","guard":[["hasAny",["albania","all caps","capital letters","capitals","macedonia","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-640a6662","guard":[["hasAny",["chile","lower case","lowercase","small letters","venezuela"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-642e702f","guard":[["hasAny",["estonia","norway"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-65cbb49c","guard":[["hasAny",["albania","invert case","macedonia","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6902e0e1","guard":[["hasAny",["africa","lower case","lowercase","namibia","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7bbfefab","guard":[["hasAny",["chile","venezuela"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-8608d07f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","estonia","norway","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8bd5caec","guard":[["hasAny",["chile","invert case","swap case","toggle case","venezuela"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9974d89c","guard":[["hasAny",["all caps","capital letters","capitals","indonesia","thailand","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-a5ea4f26","guard":[["hasAny",["albania","macedonia"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-b1e2d6aa","guard":[["hasAny",["albania","capitalise","capitalize","capitalize each word","macedonia","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b3f341b6","guard":[["hasAny",["all caps","capital letters","capitals","chile","upper case","uppercase","venezuela"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b43332bf","guard":[["hasAny",["indonesia","thailand"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-b891d2b6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","indonesia","thailand","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-be4e16d0","guard":[["hasAny",["all caps","capital letters","capitals","estonia","norway","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-c6530a2d","guard":[["hasAny",["africa","invert case","namibia","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ceea4424","guard":[["hasAny",["capitalise","capitalize","capitalize each word","chile","title case","venezuela"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f5d1918c","guard":[["hasAny",["africa","all caps","capital letters","capitals","namibia","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f8f4a773","guard":[["hasAny",["africa","namibia"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-fa6cca51","guard":[["hasAny",["indonesia","invert case","swap case","thailand","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-003c17a3","guard":[["hasAny",["delete","jan","remove","strip out","sweden","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Northern Europe"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-0f79afc0","guard":[["hasAny",["bulgaria","croatia","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1e14b7fa","guard":[["hasAny",["armenia","element","item number","lebanon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2127d928","guard":[["hasAny",["brazil","element","guyana","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-24a129d2","guard":[["hasAny",["element","indonesia","item number","nth","position","thailand"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2f3f13f9","guard":[["hasAny",["cook","delete","remove","strip out","tuvalu","without"]],["has","what"]],"pyramid":["render.str",["transform.remove",{"lit":"Polynesia"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-311b1e1f","guard":[["hasAny",["chile","each word","split into words","venezuela"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3c4293af","guard":[["hasAny",["element","guernsey","ireland","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3c670fdf","guard":[["hasAny",["element","guinea","item number","nth","position","togo"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4ae5a1c8","guard":[["hasAny",["each word","indonesia","split into words","thailand"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4e227936","guard":[["hasAny",["each word","indonesia","split into words","thailand"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4fc72b64","guard":[["hasAny",["element","estonia","item number","norway","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-529a419c","guard":[["hasAny",["africa","each word","namibia","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-57373b10","guard":[["hasAny",["element","guernsey","ireland","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5bd7776b","guard":[["hasAny",["dominica","element","item number","montserrat","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6eb9ab18","guard":[["hasAny",["chile","each word","split into words","venezuela"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-716a3e20","guard":[["hasAny",["each word","estonia","norway","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8380e1d7","guard":[["hasAny",["element","item number","luxembourg","monaco","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-860a454f","guard":[["hasAny",["bulgaria","croatia","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-879c6c1b","guard":[["hasAny",["each word","estonia","norway","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-898e0096","guard":[["hasAny",["chile","delete","remove","strip out","venezuela","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"South America"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-8a9afc38","guard":[["hasAny",["coast","element","item number","nth","position","senegal"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9715b697","guard":[["hasAny",["belize","element","guatemala","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9e6b9258","guard":[["hasAny",["coast","delete","gambia","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-a0d44cdf","guard":[["hasAny",["chile","element","item number","nth","position","venezuela"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a4d6c875","guard":[["hasAny",["africa","each word","namibia","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a689759c","guard":[["hasAny",["dominica","element","item number","montserrat","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b04732eb","guard":[["hasAny",["albania","each word","macedonia","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b23a87c5","guard":[["hasAny",["delete","philippines","remove","strip out","timorleste","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",{"lit":"South-Eastern Asia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-b24fc3c2","guard":[["hasAny",["bahrain","element","item number","nth","position","türkiye"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b43ceb8e","guard":[["hasAny",["element","isle","item number","nth","position","sweden"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b69d5c62","guard":[["hasAny",["bahrain","element","item number","nth","position","türkiye"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-bae036df","guard":[["hasAny",["element","item number","luxembourg","monaco","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c5005a07","guard":[["hasAny",["cook","element","item number","nth","position","tonga"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c9555568","guard":[["hasAny",["delete","greenland","minor","remove","strip out","without"]],["has","what"]],"pyramid":["render.str",["transform.remove",{"lit":"North America"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-cbc28aff","guard":[["hasAny",["american","delete","remove","strip out","tonga","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",{"lit":"Polynesia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-d6d00b93","guard":[["hasAny",["bahrain","delete","remove","strip out","türkiye","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Western Asia"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-e67caea1","guard":[["hasAny",["brazil","delete","guyana","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"South America"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-e67d8f54","guard":[["hasAny",["element","item number","nth","philippines","position","timorleste"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ef211e79","guard":[["hasAny",["albania","each word","macedonia","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-efdd6441","guard":[["hasAny",["canada","delete","miquelon","remove","strip out","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",{"lit":"North America"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-f991cee4","guard":[["hasAny",["chile","delete","remove","strip out","venezuela","without"]],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"South America"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-fe0c369e","guard":[["hasAny",["brazil","element","guyana","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6e54a27b","guard":[["hasAny",["american","element","item number","normalise","normalize","nth","pitcairn","position","simplify the text"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-0084af33","guard":[["hasAny",["afghanistan","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Afghanistan in":"Afghanistan is in Southern Asia."}}},
{"id":"n-034f49a5","guard":[["hasAny",["brazil","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Brazil lie":"Brazil is in South America."}}},
{"id":"n-0526f222","guard":[["hasAny",["philippines","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Philippines in":"Philippines is in South-Eastern Asia."}}},
{"id":"n-0563efda","guard":[["hasAny",["name","namibia","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Namibia":"Namibia is in Southern Africa."}}},
{"id":"n-0587b5b4","guard":[["has","portugal"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Europe."]},["sense.lastWord"]],"mem":null},
{"id":"n-06a1b0eb","guard":[["hasAny",["lie","new","subregion","zealand"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does New Zealand lie":"New Zealand is in Australia and New Zealand."}}},
{"id":"n-071b496d","guard":[["has","madagascar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Madagascar in":"Madagascar is in Eastern Africa."}}},
{"id":"n-07cd5069","guard":[["has","sweden"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Sweden in":"Sweden is in Northern Europe."}}},
{"id":"n-0b7cc67f","guard":[["has","barbados"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Barbados in":"Barbados is in Caribbean."}}},
{"id":"n-0c0a97ec","guard":[["has","kiribati"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Kiribati lie":"Kiribati is in Micronesia."}}},
{"id":"n-0d6eca5c","guard":[["has","russia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Russia lie":"Russia is in Eastern Europe."}}},
{"id":"n-0d887eb2","guard":[["hasAny",["cameroon","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Cameroon in":"Cameroon is in Middle Africa."}}},
{"id":"n-0f9686ea","guard":[["has","senegal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Senegal in":"Senegal is in Western Africa."}}},
{"id":"n-10328458","guard":[["has","tonga"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Tonga in":"Tonga is in Polynesia."}}},
{"id":"n-1188f73b","guard":[["has","guernsey"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Guernsey lie":"Guernsey is in Northern Europe."}}},
{"id":"n-125c1e19","guard":[["has","portugal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Portugal":"Portugal is in Southern Europe."}}},
{"id":"n-139d6912","guard":[["hasAny",["macedonia","name","north","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of North Macedonia":"North Macedonia is in Southeast Europe."}}},
{"id":"n-149cf4a3","guard":[["has","bulgaria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Bulgaria lie":"Bulgaria is in Southeast Europe."}}},
{"id":"n-1bb307a8","guard":[["hasAny",["arabia","saudi","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Saudi Arabia in":"Saudi Arabia is in Western Asia."}}},
{"id":"n-1be7f396","guard":[["has","africa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of South Africa":"South Africa is in Southern Africa."}}},
{"id":"n-20a1c3c2","guard":[["hasAny",["miquelon","pierre","saint","subregion","world"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Saint Pierre and Miquelon in":"Saint Pierre and Miquelon is in North America."}}},
{"id":"n-212a08be","guard":[["has","jordan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Jordan":"Jordan is in Western Asia."}}},
{"id":"n-21b3af82","guard":[["has","cape"],["has","world"]],"pyramid":["render.template",{"lit":["Cape ",{"slot":0}," is in Western Africa."]},["sense.lastWord"]],"mem":null},
{"id":"n-22464c45","guard":[["hasAny",["islands","lie","minor","outlying","states","subregion","united"]],["has","in"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does United States Minor Outlying Islands lie":"United States Minor Outlying Islands is in North America."}}},
{"id":"n-2293bdc3","guard":[["hasAny",["guatemala","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Guatemala in":"Guatemala is in Central America."}}},
{"id":"n-231c42ee","guard":[["hasAny",["curaçao","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Curaçao in":"Curaçao is in Caribbean."}}},
{"id":"n-28342ed1","guard":[["hasAny",["name","subregion","togo","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Togo":"Togo is in Western Africa."}}},
{"id":"n-2a8a0e99","guard":[["has","albania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Albania":"Albania is in Southeast Europe."}}},
{"id":"n-2ada2138","guard":[["has","armenia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Armenia in":"Armenia is in Western Asia."}}},
{"id":"n-2af14481","guard":[["has","marshall"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Marshall Islands lie":"Marshall Islands is in Micronesia."}}},
{"id":"n-2b012fce","guard":[["hasAny",["lie","sahara","subregion","western"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Western Sahara lie":"Western Sahara is in Northern Africa."}}},
{"id":"n-2beb5a80","guard":[["has","comoros"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Comoros lie":"Comoros is in Eastern Africa."}}},
{"id":"n-2c703585","guard":[["has","cayman"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Cayman Islands":"Cayman Islands is in Caribbean."}}},
{"id":"n-2c8c7d04","guard":[["hasAny",["jan","mayen","subregion","svalbard","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Svalbard and Jan Mayen in":"Svalbard and Jan Mayen is in Northern Europe."}}},
{"id":"n-2e244b9e","guard":[["has","canada"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Canada in":"Canada is in North America."}}},
{"id":"n-2fa6825e","guard":[["hasAny",["name","south","subregion","sudan","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of South Sudan":"South Sudan is in Middle Africa."}}},
{"id":"n-2fade616","guard":[["hasAny",["gambia","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Gambia lie":"Gambia is in Western Africa."}}},
{"id":"n-302cdcef","guard":[["has","philippines"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Philippines in":"Philippines is in South-Eastern Asia."}}},
{"id":"n-3183b572","guard":[["hasAny",["lie","sahara","subregion","western"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Western Sahara lie":"Western Sahara is in Northern Africa."}}},
{"id":"n-318460ed","guard":[["hasAny",["lebanon","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Lebanon in":"Lebanon is in Western Asia."}}},
{"id":"n-31bd5fad","guard":[["hasAny",["lie","monaco","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Monaco lie":"Monaco is in Western Europe."}}},
{"id":"n-31db5f2f","guard":[["hasAny",["name","nicaragua","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Nicaragua":"Nicaragua is in Central America."}}},
{"id":"n-33c5de52","guard":[["has","barthélemy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Saint Barthélemy lie":"Saint Barthélemy is in Caribbean."}}},
{"id":"n-34d49636","guard":[["hasAny",["martinique","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Martinique in":"Martinique is in Caribbean."}}},
{"id":"n-35b24caa","guard":[["hasAny",["estonia","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Estonia":"Estonia is in Northern Europe."}}},
{"id":"n-35c73b93","guard":[["has","togo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Togo":"Togo is in Western Africa."}}},
{"id":"n-39407c61","guard":[["hasAny",["subregion","world","zimbabwe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Zimbabwe in":"Zimbabwe is in Eastern Africa."}}},
{"id":"n-3a11cbc5","guard":[["hasAny",["islands","mariana","northern","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Northern Mariana Islands in":"Northern Mariana Islands is in Micronesia."}}},
{"id":"n-3b038bc6","guard":[["hasAny",["lie","new","subregion","zealand"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does New Zealand lie":"New Zealand is in Australia and New Zealand."}}},
{"id":"n-3b696563","guard":[["has","macedonia"],["has","name"]],"pyramid":["render.template",{"lit":["North ",{"slot":0}," is in Southeast Europe."]},["sense.lastWord"]],"mem":null},
{"id":"n-3c13042e","guard":[["hasAny",["belize","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Belize in":"Belize is in Central America."}}},
{"id":"n-3ca98b0f","guard":[["has","gambia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Gambia lie":"Gambia is in Western Africa."}}},
{"id":"n-3d018d3e","guard":[["hasAny",["lie","nepal","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Nepal lie":"Nepal is in Southern Asia."}}},
{"id":"n-3d8d45d9","guard":[["hasAny",["cayman","islands","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Cayman Islands":"Cayman Islands is in Caribbean."}}},
{"id":"n-400027b4","guard":[["has","luxembourg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Luxembourg lie":"Luxembourg is in Western Europe."}}},
{"id":"n-40941711","guard":[["has","tuvalu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Tuvalu lie":"Tuvalu is in Polynesia."}}},
{"id":"n-41a4544a","guard":[["hasAny",["belarus","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Belarus in":"Belarus is in Eastern Europe."}}},
{"id":"n-41f715d5","guard":[["has","guinea"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Guinea":"Guinea is in Western Africa."}}},
{"id":"n-43548ab2","guard":[["hasAny",["lie","russia","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Russia lie":"Russia is in Eastern Europe."}}},
{"id":"n-43c8a69c","guard":[["hasAny",["subregion","timorleste","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Timor-Leste in":"Timor-Leste is in South-Eastern Asia."}}},
{"id":"n-43ff7606","guard":[["hasAny",["albania","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Albania":"Albania is in Southeast Europe."}}},
{"id":"n-46510ee1","guard":[["has","ukraine"],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["sense.lastWord"]],"mem":null},
{"id":"n-47895e34","guard":[["hasAny",["subregion","tonga","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Tonga in":"Tonga is in Polynesia."}}},
{"id":"n-4894144d","guard":[["hasAny",["indonesia","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Indonesia":"Indonesia is in South-Eastern Asia."}}},
{"id":"n-48f1e61c","guard":[["hasAny",["lie","príncipe","subregion","são","tomé"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does São Tomé and Príncipe lie":"São Tomé and Príncipe is in Middle Africa."}}},
{"id":"n-4af473be","guard":[["hasAny",["islands","name","pitcairn","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Pitcairn Islands":"Pitcairn Islands is in Polynesia."}}},
{"id":"n-4d9bb309","guard":[["has","oman"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Oman":"Oman is in Western Asia."}}},
{"id":"n-4e552532","guard":[["hasAny",["africa","name","south","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of South Africa":"South Africa is in Southern Africa."}}},
{"id":"n-4e871f80","guard":[["has","zimbabwe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Zimbabwe in":"Zimbabwe is in Eastern Africa."}}},
{"id":"n-4ef7b24e","guard":[["hasAny",["name","subregion","syria","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Syria":"Syria is in Western Asia."}}},
{"id":"n-5741871e","guard":[["hasAny",["isle","lie","man","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Isle of Man lie":"Isle of Man is in Northern Europe."}}},
{"id":"n-57ffadd4","guard":[["has","azerbaijan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Azerbaijan":"Azerbaijan is in Western Asia."}}},
{"id":"n-584e265b","guard":[["has","afghanistan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Afghanistan in":"Afghanistan is in Southern Asia."}}},
{"id":"n-591c0ccc","guard":[["hasAny",["name","states","subregion","united","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of United States":"United States is in North America."}}},
{"id":"n-5987321a","guard":[["has","cuba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Cuba in":"Cuba is in Caribbean."}}},
{"id":"n-5c593f3f","guard":[["has","nicaragua"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["sense.lastWord"]],"mem":null},
{"id":"n-5c8ad039","guard":[["has","cayman"],["has","name"]],"pyramid":["render.template",{"lit":["Cayman ",{"slot":0}," is in Caribbean."]},["sense.lastWord"]],"mem":null},
{"id":"n-5d70a5d5","guard":[["hasAny",["american","samoa","subregion","world"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is American Samoa in":"American Samoa is in Polynesia."}}},
{"id":"n-5ffdcee4","guard":[["hasAny",["hong","kong","lie","subregion"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Hong Kong lie":"Hong Kong is in Eastern Asia."}}},
{"id":"n-60566894","guard":[["hasAny",["name","portugal","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Portugal":"Portugal is in Southern Europe."}}},
{"id":"n-63306b26","guard":[["has","congo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Congo in":"Congo is in Middle Africa."}}},
{"id":"n-6358fd47","guard":[["has","switzerland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Switzerland":"Switzerland is in Western Europe."}}},
{"id":"n-675fb439","guard":[["hasAny",["lie","spain","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Spain lie":"Spain is in Southern Europe."}}},
{"id":"n-67e5a3f2","guard":[["hasAny",["islands","mariana","northern","subregion","world"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Northern Mariana Islands in":"Northern Mariana Islands is in Micronesia."}}},
{"id":"n-68a8f175","guard":[["has","pitcairn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Pitcairn Islands":"Pitcairn Islands is in Polynesia."}}},
{"id":"n-69c104b1","guard":[["has","belarus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Belarus in":"Belarus is in Eastern Europe."}}},
{"id":"n-6be841ec","guard":[["has","kazakhstan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Kazakhstan in":"Kazakhstan is in Central Asia."}}},
{"id":"n-6c5685d4","guard":[["hasAny",["cook","islands","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Cook Islands lie":"Cook Islands is in Polynesia."}}},
{"id":"n-6cca66f8","guard":[["has","pitcairn"],["has","world"]],"pyramid":["render.template",{"lit":["Pitcairn ",{"slot":0}," is in Polynesia."]},["sense.lastWord"]],"mem":null},
{"id":"n-6e0a9236","guard":[["hasAny",["lie","montserrat","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Montserrat lie":"Montserrat is in Caribbean."}}},
{"id":"n-6e592fa1","guard":[["hasAny",["azerbaijan","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Azerbaijan":"Azerbaijan is in Western Asia."}}},
{"id":"n-6f0c6382","guard":[["has","guatemala"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Guatemala in":"Guatemala is in Central America."}}},
{"id":"n-7052afb7","guard":[["hasAny",["canada","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Canada in":"Canada is in North America."}}},
{"id":"n-707c9c3b","guard":[["hasAny",["chile","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Chile":"Chile is in South America."}}},
{"id":"n-70f2e11a","guard":[["has","malta"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Malta in":"Malta is in Southern Europe."}}},
{"id":"n-71fe5b74","guard":[["hasAny",["kenya","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Kenya":"Kenya is in Eastern Africa."}}},
{"id":"n-751fef00","guard":[["hasAny",["kitts","nevis","saint","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Saint Kitts and Nevis in":"Saint Kitts and Nevis is in Caribbean."}}},
{"id":"n-7572f2ba","guard":[["has","egypt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Egypt":"Egypt is in Northern Africa."}}},
{"id":"n-7802e360","guard":[["has","maldives"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Maldives":"Maldives is in Southern Asia."}}},
{"id":"n-7875a486","guard":[["hasAny",["kazakhstan","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Kazakhstan in":"Kazakhstan is in Central Asia."}}},
{"id":"n-793bf509","guard":[["hasAny",["barbados","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Barbados in":"Barbados is in Caribbean."}}},
{"id":"n-7a6312d0","guard":[["hasAny",["miquelon","pierre","saint","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Saint Pierre and Miquelon in":"Saint Pierre and Miquelon is in North America."}}},
{"id":"n-7cca1dbd","guard":[["has","belize"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Belize in":"Belize is in Central America."}}},
{"id":"n-7cf10df2","guard":[["hasAny",["greenland","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Greenland lie":"Greenland is in North America."}}},
{"id":"n-83fec247","guard":[["has","dominica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Dominica lie":"Dominica is in Caribbean."}}},
{"id":"n-84d0d765","guard":[["has","egypt"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["sense.lastWord"]],"mem":null},
{"id":"n-8541aef2","guard":[["hasAny",["name","subregion","thailand","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Thailand":"Thailand is in South-Eastern Asia."}}},
{"id":"n-85a6ee12","guard":[["hasAny",["maarten","sint","subregion","world"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Sint Maarten in":"Sint Maarten is in Caribbean."}}},
{"id":"n-872a24fc","guard":[["has","maldives"],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["sense.lastWord"]],"mem":null},
{"id":"n-87936f81","guard":[["has","martinique"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Martinique in":"Martinique is in Caribbean."}}},
{"id":"n-87ea3706","guard":[["hasAny",["chad","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Chad in":"Chad is in Middle Africa."}}},
{"id":"n-880aaf8d","guard":[["hasAny",["name","subregion","ukraine","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Ukraine":"Ukraine is in Eastern Europe."}}},
{"id":"n-8a639360","guard":[["hasAny",["jan","mayen","subregion","svalbard","world"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Svalbard and Jan Mayen in":"Svalbard and Jan Mayen is in Northern Europe."}}},
{"id":"n-8aef9662","guard":[["hasAny",["netherlands","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Netherlands in":"Netherlands is in Western Europe."}}},
{"id":"n-8b0af9b6","guard":[["hasAny",["bermuda","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Bermuda":"Bermuda is in North America."}}},
{"id":"n-8bc2c0e5","guard":[["hasAny",["senegal","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Senegal in":"Senegal is in Western Africa."}}},
{"id":"n-8c4396bd","guard":[["hasAny",["subregion","uganda","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Uganda in":"Uganda is in Eastern Africa."}}},
{"id":"n-8cfa9b10","guard":[["hasAny",["name","norway","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Norway":"Norway is in Northern Europe."}}},
{"id":"n-8d1bd9f4","guard":[["hasAny",["arabia","saudi","subregion","world"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Saudi Arabia in":"Saudi Arabia is in Western Asia."}}},
{"id":"n-8f3cf330","guard":[["has","sudan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of South Sudan":"South Sudan is in Middle Africa."}}},
{"id":"n-9381c40d","guard":[["has","venezuela"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Venezuela":"Venezuela is in South America."}}},
{"id":"n-95189117","guard":[["hasAny",["antigua","barbuda","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Antigua and Barbuda lie":"Antigua and Barbuda is in Caribbean."}}},
{"id":"n-953c3a16","guard":[["hasAny",["islands","virgin"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is United States Virgin Islands in":"United States Virgin Islands is in Caribbean."}}},
{"id":"n-97d55190","guard":[["has","netherlands"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Netherlands in":"Netherlands is in Western Europe."}}},
{"id":"n-983f804f","guard":[["hasAny",["subregion","tobago","trinidad","world"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Trinidad and Tobago in":"Trinidad and Tobago is in Caribbean."}}},
{"id":"n-98e67cab","guard":[["has","greenland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Greenland lie":"Greenland is in North America."}}},
{"id":"n-9d5f6db1","guard":[["has","cook"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Cook Islands lie":"Cook Islands is in Polynesia."}}},
{"id":"n-9e013d25","guard":[["hasAny",["isle","lie","man","subregion"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Isle of Man lie":"Isle of Man is in Northern Europe."}}},
{"id":"n-9e3968a7","guard":[["hasAny",["kitts","nevis","saint","subregion","world"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Saint Kitts and Nevis in":"Saint Kitts and Nevis is in Caribbean."}}},
{"id":"n-a00ddf3e","guard":[["has","bahrain"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Bahrain lie":"Bahrain is in Western Asia."}}},
{"id":"n-a0a7b9c6","guard":[["has","chad"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Chad in":"Chad is in Middle Africa."}}},
{"id":"n-a10253f3","guard":[["has","syria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Syria":"Syria is in Western Asia."}}},
{"id":"n-a11c1bfa","guard":[["hasAny",["malta","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Malta in":"Malta is in Southern Europe."}}},
{"id":"n-a1a53cf8","guard":[["hasAny",["lie","subregion","türkiye"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Türkiye lie":"Türkiye is in Western Asia."}}},
{"id":"n-a242bed5","guard":[["hasAny",["grenadines","lie","saint","subregion","vincent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Saint Vincent and the Grenadines lie":"Saint Vincent and the Grenadines is in Caribbean."}}},
{"id":"n-a74a292e","guard":[["hasAny",["name","seychelles","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Seychelles":"Seychelles is in Eastern Africa."}}},
{"id":"n-a7b378bf","guard":[["hasAny",["hong","kong","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Hong Kong lie":"Hong Kong is in Eastern Asia."}}},
{"id":"n-a8102d4a","guard":[["has","bermuda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Bermuda":"Bermuda is in North America."}}},
{"id":"n-a9571eae","guard":[["has","chile"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Chile":"Chile is in South America."}}},
{"id":"n-a9759cc6","guard":[["has","timorleste"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Timor-Leste in":"Timor-Leste is in South-Eastern Asia."}}},
{"id":"n-a9f80db8","guard":[["hasAny",["coast","ivory","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Ivory Coast lie":"Ivory Coast is in Western Africa."}}},
{"id":"n-ab48afe4","guard":[["has","nicaragua"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Nicaragua":"Nicaragua is in Central America."}}},
{"id":"n-abcdf59b","guard":[["has","estonia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Estonia":"Estonia is in Northern Europe."}}},
{"id":"n-abd59d53","guard":[["hasAny",["name","rwanda","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Rwanda":"Rwanda is in Eastern Africa."}}},
{"id":"n-ad14b6f2","guard":[["hasAny",["armenia","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Armenia in":"Armenia is in Western Asia."}}},
{"id":"n-ad90e021","guard":[["hasAny",["maldives","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Maldives":"Maldives is in Southern Asia."}}},
{"id":"n-ae648440","guard":[["has","ukraine"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Ukraine":"Ukraine is in Eastern Europe."}}},
{"id":"n-af6c5150","guard":[["has","bermuda"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["sense.lastWord"]],"mem":null},
{"id":"n-afd4fe18","guard":[["hasAny",["islands","states","subregion","united","virgin","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is United States Virgin Islands in":"United States Virgin Islands is in Caribbean."}}},
{"id":"n-b07d1280","guard":[["hasAny",["grenadines","vincent"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Saint Vincent and the Grenadines lie":"Saint Vincent and the Grenadines is in Caribbean."}}},
{"id":"n-b199109e","guard":[["hasAny",["islands","lie","marshall","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Marshall Islands lie":"Marshall Islands is in Micronesia."}}},
{"id":"n-b1d9831a","guard":[["has","montserrat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Montserrat lie":"Montserrat is in Caribbean."}}},
{"id":"n-b327fe93","guard":[["has","spain"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Spain lie":"Spain is in Southern Europe."}}},
{"id":"n-b574f026","guard":[["hasAny",["jamaica","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Jamaica":"Jamaica is in Caribbean."}}},
{"id":"n-b84e3131","guard":[["has","uganda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Uganda in":"Uganda is in Eastern Africa."}}},
{"id":"n-b9106ace","guard":[["hasAny",["dominica","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Dominica lie":"Dominica is in Caribbean."}}},
{"id":"n-ba61fa3c","guard":[["hasAny",["name","oman","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Oman":"Oman is in Western Asia."}}},
{"id":"n-bccb388f","guard":[["has","monaco"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Monaco lie":"Monaco is in Western Europe."}}},
{"id":"n-bf2edecc","guard":[["hasAny",["cuba","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Cuba in":"Cuba is in Caribbean."}}},
{"id":"n-bf2f5787","guard":[["has","guadeloupe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Guadeloupe":"Guadeloupe is in Caribbean."}}},
{"id":"n-bf6427a0","guard":[["hasAny",["comoros","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Comoros lie":"Comoros is in Eastern Africa."}}},
{"id":"n-c0064801","guard":[["hasAny",["subregion","tobago","trinidad","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Trinidad and Tobago in":"Trinidad and Tobago is in Caribbean."}}},
{"id":"n-c241eeb1","guard":[["hasAny",["kyrgyzstan","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Kyrgyzstan lie":"Kyrgyzstan is in Central Asia."}}},
{"id":"n-c3d4bfe6","guard":[["hasAny",["lie","príncipe","subregion","são","tomé"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does São Tomé and Príncipe lie":"São Tomé and Príncipe is in Middle Africa."}}},
{"id":"n-c3d567c6","guard":[["hasAny",["bahrain","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Bahrain lie":"Bahrain is in Western Asia."}}},
{"id":"n-c5a01fdf","guard":[["hasAny",["ireland","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Ireland lie":"Ireland is in Northern Europe."}}},
{"id":"n-c64c5b43","guard":[["has","cameroon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Cameroon in":"Cameroon is in Middle Africa."}}},
{"id":"n-c699eadd","guard":[["hasAny",["islands","lie","minor","outlying","states","subregion","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does United States Minor Outlying Islands lie":"United States Minor Outlying Islands is in North America."}}},
{"id":"n-c7533dfb","guard":[["has","thailand"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Thailand":"Thailand is in South-Eastern Asia."}}},
{"id":"n-c79fff6e","guard":[["hasAny",["coast","ivory","lie","subregion"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Ivory Coast lie":"Ivory Coast is in Western Africa."}}},
{"id":"n-c976f665","guard":[["hasAny",["lie","luxembourg","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Luxembourg lie":"Luxembourg is in Western Europe."}}},
{"id":"n-c98fdcfd","guard":[["has","ireland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Ireland lie":"Ireland is in Northern Europe."}}},
{"id":"n-c99206ce","guard":[["hasAny",["guinea","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Guinea":"Guinea is in Western Africa."}}},
{"id":"n-cabc5370","guard":[["has","brazil"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Brazil lie":"Brazil is in South America."}}},
{"id":"n-cbca9380","guard":[["has","jamaica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Jamaica":"Jamaica is in Caribbean."}}},
{"id":"n-cde1b89b","guard":[["hasAny",["maarten","sint","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Sint Maarten in":"Sint Maarten is in Caribbean."}}},
{"id":"n-ce11727a","guard":[["has","namibia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Namibia":"Namibia is in Southern Africa."}}},
{"id":"n-d0f3fdd3","guard":[["has","rwanda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Rwanda":"Rwanda is in Eastern Africa."}}},
{"id":"n-d14ecea9","guard":[["hasAny",["egypt","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Egypt":"Egypt is in Northern Africa."}}},
{"id":"n-d2bec68e","guard":[["has","guyana"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Guyana lie":"Guyana is in South America."}}},
{"id":"n-d2d01138","guard":[["has","kenya"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Kenya":"Kenya is in Eastern Africa."}}},
{"id":"n-d5533b42","guard":[["has","indonesia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Indonesia":"Indonesia is in South-Eastern Asia."}}},
{"id":"n-da0b43d0","guard":[["hasAny",["guadeloupe","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Guadeloupe":"Guadeloupe is in Caribbean."}}},
{"id":"n-dd4d3579","guard":[["hasAny",["guernsey","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Guernsey lie":"Guernsey is in Northern Europe."}}},
{"id":"n-dd7d4b11","guard":[["hasAny",["subregion","sweden","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Sweden in":"Sweden is in Northern Europe."}}},
{"id":"n-de15e291","guard":[["has","nepal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Nepal lie":"Nepal is in Southern Asia."}}},
{"id":"n-df9c3f6a","guard":[["has","croatia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Croatia lie":"Croatia is in Southeast Europe."}}},
{"id":"n-e33a6479","guard":[["hasAny",["name","subregion","venezuela","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Venezuela":"Venezuela is in South America."}}},
{"id":"n-e3dcb226","guard":[["has","switzerland"],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["sense.lastWord"]],"mem":null},
{"id":"n-e5259721","guard":[["hasAny",["croatia","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Croatia lie":"Croatia is in Southeast Europe."}}},
{"id":"n-e61b87cf","guard":[["has","curaçao"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Curaçao in":"Curaçao is in Caribbean."}}},
{"id":"n-e7750034","guard":[["hasAny",["lie","subregion","tuvalu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Tuvalu lie":"Tuvalu is in Polynesia."}}},
{"id":"n-e9f0f078","guard":[["hasAny",["cape","name","subregion","verde","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Cape Verde":"Cape Verde is in Western Africa."}}},
{"id":"n-ea868a8b","guard":[["hasAny",["bulgaria","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Bulgaria lie":"Bulgaria is in Southeast Europe."}}},
{"id":"n-ec0bd8be","guard":[["has","seychelles"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Seychelles":"Seychelles is in Eastern Africa."}}},
{"id":"n-ec823803","guard":[["hasAny",["congo","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Congo in":"Congo is in Middle Africa."}}},
{"id":"n-ec9daaa8","guard":[["hasAny",["macedonia","north"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of North Macedonia":"North Macedonia is in Southeast Europe."}}},
{"id":"n-ef42bb1c","guard":[["hasAny",["antigua","barbuda","lie","subregion"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Antigua and Barbuda lie":"Antigua and Barbuda is in Caribbean."}}},
{"id":"n-ef4a054e","guard":[["hasAny",["kiribati","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Kiribati lie":"Kiribati is in Micronesia."}}},
{"id":"n-f082bf5d","guard":[["has","kyrgyzstan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Kyrgyzstan lie":"Kyrgyzstan is in Central Asia."}}},
{"id":"n-f1007ad5","guard":[["hasAny",["jordan","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Jordan":"Jordan is in Western Asia."}}},
{"id":"n-f127aba1","guard":[["hasAny",["cape","verde"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Cape Verde":"Cape Verde is in Western Africa."}}},
{"id":"n-f23a0b81","guard":[["has","sudan"],["has","world"]],"pyramid":["render.template",{"lit":["South ",{"slot":0}," is in Middle Africa."]},["sense.lastWord"]],"mem":null},
{"id":"n-f27df445","guard":[["has","türkiye"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Türkiye lie":"Türkiye is in Western Asia."}}},
{"id":"n-f27f69c2","guard":[["hasAny",["name","subregion","switzerland","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Switzerland":"Switzerland is in Western Europe."}}},
{"id":"n-f4c370a3","guard":[["has","norway"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Norway":"Norway is in Northern Europe."}}},
{"id":"n-f60ace5a","guard":[["hasAny",["american","samoa","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is American Samoa in":"American Samoa is in Polynesia."}}},
{"id":"n-f7f1ba18","guard":[["has","lebanon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Lebanon in":"Lebanon is in Western Asia."}}},
{"id":"n-fa2b3982","guard":[["hasAny",["madagascar","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Madagascar in":"Madagascar is in Eastern Africa."}}},
{"id":"n-fb979543","guard":[["hasAny",["barthélemy","lie","saint","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Saint Barthélemy lie":"Saint Barthélemy is in Caribbean."}}},
{"id":"n-fdde4b59","guard":[["hasAny",["guyana","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Guyana lie":"Guyana is in South America."}}},
{"id":"n-115a3599","guard":[["has","maldives"],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-15f72568","guard":[["hasAny",["invert case","portugal","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Europe."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-171c9092","guard":[["hasAny",["bermuda","invert case","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1f1cb0a4","guard":[["hasAny",["egypt","invert case","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-21378767","guard":[["hasAny",["invert case","maldives","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-25c8d23a","guard":[["has","bermuda"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-2da4ec59","guard":[["hasAny",["chad","shortest","shortest one","shortest word"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Middle Africa."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3c4aef62","guard":[["hasAny",["all caps","capital letters","capitals","switzerland","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-4a67e583","guard":[["hasAny",["lower case","lowercase","small letters","switzerland"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-55f28bf8","guard":[["hasAny",["invert case","swap case","switzerland","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-58c9b102","guard":[["hasAny",["all caps","capital letters","capitals","portugal","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Europe."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-625e8411","guard":[["hasAny",["capitalise","capitalize","capitalize each word","egypt","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6e77c6a4","guard":[["hasAny",["all caps","capital letters","capitals","nicaragua","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-75f7ac4d","guard":[["has","egypt"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-86ceb53d","guard":[["hasAny",["all caps","bermuda","capital letters","capitals","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-8c894266","guard":[["hasAny",["egypt","lower case","lowercase","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-931d56a4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","switzerland","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9f9184a1","guard":[["hasAny",["all caps","capital letters","capitals","maldives","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-9fa26101","guard":[["hasAny",["invert case","nicaragua","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a69c5e82","guard":[["hasAny",["all caps","capital letters","capitals","ukraine","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-addfc0a7","guard":[["hasAny",["bermuda","lower case","lowercase","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ae9cf720","guard":[["has","ukraine"],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-b11d2705","guard":[["hasAny",["lower case","lowercase","nicaragua","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b27207b1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nicaragua","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b2ecb6f1","guard":[["hasAny",["lower case","lowercase","maldives","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b67f565c","guard":[["has","nicaragua"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-b7e09f14","guard":[["hasAny",["all caps","capital letters","capitals","egypt","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-c53f5363","guard":[["hasAny",["bermuda","capitalise","capitalize","capitalize each word","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-caf44459","guard":[["has","switzerland"],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-ceaec49a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","maldives","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ee7376bb","guard":[["hasAny",["lower case","lowercase","small letters","ukraine"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-eea92b8d","guard":[["hasAny",["lower case","lowercase","portugal","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Europe."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f1078106","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","ukraine"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f28eed21","guard":[["hasAny",["invert case","swap case","toggle case","ukraine"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f7c91ac4","guard":[["hasAny",["afghanistan","longest","longest one","longest word"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f8136881","guard":[["has","portugal"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Europe."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-f8aa4faf","guard":[["hasAny",["cuba","shortest","shortest one","shortest word"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ffeb704c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","portugal","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Europe."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-00c80401","guard":[["hasAny",["element","item number","nepal","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-043ab9d4","guard":[["hasAny",["each word","nicaragua","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0698d514","guard":[["hasAny",["element","item number","nth","position","tuvalu"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0ed04103","guard":[["hasAny",["element","item number","kazakhstan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central Asia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-11f87729","guard":[["hasAny",["element","item number","kyrgyzstan","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central Asia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-122f2b63","guard":[["hasAny",["afghanistan","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1239a779","guard":[["hasAny",["element","item number","nepal","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1989afbe","guard":[["hasAny",["delete","príncipe","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Middle Africa"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-1b71fb47","guard":[["hasAny",["antigua","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Antigua and ",{"slot":0}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1c7f2fb8","guard":[["hasAny",["element","item number","nth","position","sudan"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Sudan is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1de1164b","guard":[["hasAny",["element","item number","marshall","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," Islands is in Micronesia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1eff9368","guard":[["hasAny",["each word","split into words","switzerland"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-29ff749e","guard":[["hasAny",["antigua","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," and Barbuda is in Caribbean."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2a0c91f0","guard":[["hasAny",["element","item number","nth","position","spain"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Europe."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2c8baf7d","guard":[["hasAny",["each word","maldives","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2dd77d1b","guard":[["hasAny",["egypt","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2ddedc84","guard":[["hasAny",["element","item number","nth","position","russia"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2eb2d8a4","guard":[["hasAny",["each word","nicaragua","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-34f42b93","guard":[["hasAny",["barthélemy","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," Barthélemy is in Caribbean."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3a21a3b7","guard":[["hasAny",["element","hong","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Hong ",{"slot":0}," is in Eastern Asia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3a88f5b5","guard":[["hasAny",["albania","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-404e947a","guard":[["hasAny",["element","item number","kyrgyzstan","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central Asia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-41700246","guard":[["hasAny",["cook","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Islands is in Polynesia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-46db59a1","guard":[["hasAny",["cook","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Cook ",{"slot":0}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-46e9ed5f","guard":[["hasAny",["each word","split into words","switzerland"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4797cb23","guard":[["hasAny",["element","item number","nth","position","tuvalu"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Polynesia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-48d3ec59","guard":[["hasAny",["element","item number","namibia","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4b473096","guard":[["hasAny",["element","item number","maarten","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Maarten is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4c21cacd","guard":[["hasAny",["cayman","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Islands is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4ff5df7f","guard":[["hasAny",["element","item number","kiribati","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Micronesia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-53a66892","guard":[["hasAny",["american","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["American ",{"slot":0}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5595e61b","guard":[["hasAny",["element","item number","nth","position","tobago"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and Tobago is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5c7f4195","guard":[["hasAny",["each word","split into words","ukraine"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5dd8c807","guard":[["hasAny",["each word","split into words","ukraine"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6019538b","guard":[["hasAny",["element","item number","nth","portugal","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Europe."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-67dd78a6","guard":[["hasAny",["each word","maldives","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6aea53a6","guard":[["hasAny",["element","item number","kiribati","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Micronesia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-758e54eb","guard":[["hasAny",["element","item number","nth","position","switzerland"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7a3a37b2","guard":[["hasAny",["element","item number","maarten","nth","position"]]],"pyramid":["render.template",{"lit":["Sint ",{"slot":0}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7a9a6285","guard":[["hasAny",["element","item number","netherlands","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7bc445f6","guard":[["hasAny",["arabia","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Arabia is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7ce55389","guard":[["hasAny",["belarus","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7dab46f4","guard":[["hasAny",["bermuda","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7f808115","guard":[["hasAny",["element","gambia","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7f92c73a","guard":[["hasAny",["each word","egypt","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-832c0bb5","guard":[["hasAny",["element","isle","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," of Man is in Northern Europe."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-85dfd9ca","guard":[["hasAny",["element","item number","nicaragua","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-894ee7aa","guard":[["hasAny",["element","greenland","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-91b1872d","guard":[["hasAny",["element","gambia","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-93bfd350","guard":[["hasAny",["each word","egypt","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-94d51351","guard":[["hasAny",["cape","element","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," Verde is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a0cb113e","guard":[["hasAny",["element","item number","malta","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a3f58813","guard":[["hasAny",["element","greenland","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a7bedbb6","guard":[["hasAny",["coast","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Ivory ",{"slot":0}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a7d3581d","guard":[["hasAny",["bermuda","each word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ac493f2f","guard":[["hasAny",["africa","lower case","lowercase","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["South ",{"slot":0}," is in Southern ",{"slot":1},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b0f79106","guard":[["hasAny",["element","item number","nth","position","russia"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b1944898","guard":[["hasAny",["element","item number","nth","position","sahara"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Western ",{"slot":0}," is in Northern Africa."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b27a300d","guard":[["hasAny",["delete","remove","senegal","strip out","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-b466586f","guard":[["hasAny",["element","item number","macedonia","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Macedonia is in Southeast Europe."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b916afc4","guard":[["hasAny",["bermuda","each word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bba2ff5a","guard":[["hasAny",["element","item number","maldives","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bc0e65c8","guard":[["hasAny",["element","item number","marshall","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Marshall ",{"slot":0}," is in Micronesia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bd5a977f","guard":[["hasAny",["each word","portugal","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Europe."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bf4eca48","guard":[["hasAny",["element","item number","nth","pitcairn","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Islands is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c06491f7","guard":[["hasAny",["comoros","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c235b8a9","guard":[["hasAny",["arabia","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Saudi ",{"slot":0}," is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cfd6255e","guard":[["hasAny",["element","item number","nth","position","spain"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Europe."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d2ef41c9","guard":[["hasAny",["element","item number","nth","position","ukraine"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d47c21ca","guard":[["hasAny",["barthélemy","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Saint ",{"slot":0}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dc9c72aa","guard":[["hasAny",["element","item number","nth","position","tobago"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Trinidad and ",{"slot":0}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-de92ec6c","guard":[["hasAny",["comoros","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-deefe436","guard":[["hasAny",["comoros","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Africa"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-e10d0d22","guard":[["hasAny",["american","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Samoa is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ecc31699","guard":[["hasAny",["element","isle","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Isle of ",{"slot":0}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f00d73bb","guard":[["hasAny",["element","hong","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," Kong is in Eastern Asia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f0f50d9d","guard":[["hasAny",["coast","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," Coast is in Western Africa."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f6dea4cf","guard":[["hasAny",["element","item number","nth","position","sahara"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Sahara is in Northern Africa."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-fbd08f36","guard":[["hasAny",["each word","portugal","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Europe."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fd47298d","guard":[["hasAny",["canada","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-24eb557a","guard":[["hasAny",["africa","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-3f37c111","guard":[["hasAny",["element","item number","nth","position","sudan"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-5ea6361c","guard":[["hasAny",["element","item number","nth","pitcairn","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-86589acc","guard":[["hasAny",["cape","element","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-e28d4096","guard":[["hasAny",["element","item number","macedonia","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southeast Europe."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-e2b9bf5d","guard":[["hasAny",["cayman","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-087a4849","guard":[["hasAny",["africa","element","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Africa is in Southern ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-16312f61","guard":[["hasAny",["element","item number","lower case","lowercase","nth","pitcairn","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-171cf775","guard":[["hasAny",["all caps","capital letters","capitals","cayman","element","item number","nth","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-1f39120b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","macedonia","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southeast Europe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-20e133da","guard":[["hasAny",["cape","element","invert case","item number","nth","position","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-47d3a4d8","guard":[["hasAny",["element","item number","maarten","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5250aca4","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","sudan"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5643905e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","pitcairn","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5e40307a","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","macedonia","nth","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southeast Europe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-7499fe8c","guard":[["hasAny",["all caps","cape","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-75e064aa","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","position","sudan","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-7c73d052","guard":[["hasAny",["element","item number","lower case","lowercase","macedonia","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southeast Europe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-839ff2b0","guard":[["hasAny",["cayman","element","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9522b7e2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","sudan","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9563c851","guard":[["hasAny",["cape","element","item number","lower case","lowercase","nth","position","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-997fa4b1","guard":[["hasAny",["barthélemy","element","item number","longest","longest one","longest word","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a723a4a8","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","pitcairn","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-aac0ff24","guard":[["hasAny",["cape","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ab1c1dc1","guard":[["hasAny",["element","invert case","item number","nth","position","sudan","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b0fddb8e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cayman","element","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d2a81ee3","guard":[["hasAny",["africa","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-d7a658bf","guard":[["hasAny",["element","isle","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," of ",{"slot":1}," is in Northern Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e89d20fa","guard":[["hasAny",["cayman","element","invert case","item number","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-eb3aabba","guard":[["hasAny",["element","invert case","item number","macedonia","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southeast Europe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-fe0ec256","guard":[["hasAny",["element","invert case","item number","nth","pitcairn","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-015bc8f1","guard":[["hasAny",["coast","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-019b8936","guard":[["hasAny",["cape","each word","element","item number","nth","position","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-043b9f8a","guard":[["hasAny",["cape","each word","element","item number","nth","position","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-062bd6b9","guard":[["hasAny",["barthélemy","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-07427ffb","guard":[["hasAny",["element","item number","macedonia","normalise","normalize","nth","position","simplify the text"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southeast Europe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-08101118","guard":[["hasAny",["each word","element","item number","nth","position","split into words","sudan"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0c8e08c2","guard":[["hasAny",["element","isle","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," of ",{"slot":1}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0f588d65","guard":[["hasAny",["element","item number","marshall","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Micronesia."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-12fdfb5b","guard":[["hasAny",["element","item number","nth","position","tobago"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1423ff56","guard":[["hasAny",["coast","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-143c41af","guard":[["hasAny",["cayman","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-149a5768","guard":[["hasAny",["element","item number","nth","position","sahara"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Northern Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1c166076","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," Mayen is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1f8e0587","guard":[["hasAny",["element","grenadines","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Saint ",{"slot":0}," and the ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2415db82","guard":[["hasAny",["antigua","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-25ff7f20","guard":[["hasAny",["element","item number","nth","position","príncipe"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and Príncipe is in Middle Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2c22a472","guard":[["hasAny",["element","item number","new","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Australia and New Zealand."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2d94eddb","guard":[["hasAny",["element","item number","nth","position","sudan"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-30a97988","guard":[["hasAny",["element","grenadines","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," Vincent and the ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-315ec1b4","guard":[["hasAny",["element","item number","mariana","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Mariana ",{"slot":1}," is in Micronesia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-3a3bf432","guard":[["hasAny",["element","isle","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," of ",{"slot":1}," is in Northern Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3ba9bea0","guard":[["hasAny",["africa","element","invert case","item number","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3be7e1c4","guard":[["hasAny",["element","item number","normalise","normalize","nth","position","simplify the text","sudan"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-414334dc","guard":[["hasAny",["each word","element","item number","macedonia","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southeast Europe."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-421cbdd7","guard":[["hasAny",["element","item number","miquelon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Pierre and ",{"slot":1}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-504393f5","guard":[["hasAny",["arabia","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5615fa3d","guard":[["hasAny",["element","grenadines","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and the Grenadines is in Caribbean."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-56efe8e3","guard":[["hasAny",["cayman","each word","element","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5706ab87","guard":[["hasAny",["element","item number","miquelon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Saint ",{"slot":0}," and ",{"slot":1}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-5942fd1a","guard":[["hasAny",["antigua","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-69e52bef","guard":[["hasAny",["element","item number","marshall","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Micronesia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6decc5f3","guard":[["hasAny",["each word","element","item number","nth","pitcairn","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-74cbe79a","guard":[["hasAny",["element","item number","new","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," Zealand is in Australia and ",{"slot":1}," Zealand."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7b1ab577","guard":[["hasAny",["cook","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7c46a4b7","guard":[["hasAny",["africa","all caps","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-82ae9cf8","guard":[["hasAny",["element","item number","new","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["New ",{"slot":0}," is in Australia and ",{"slot":1}," Zealand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-87dba637","guard":[["hasAny",["element","hong","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Eastern Asia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-89f940cb","guard":[["hasAny",["each word","element","item number","macedonia","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southeast Europe."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8a9e4f87","guard":[["hasAny",["element","item number","kitts","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and Nevis is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8d2e0bec","guard":[["hasAny",["cook","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-90295b3c","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Svalbard and ",{"slot":0}," ",{"slot":1}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-926233bb","guard":[["hasAny",["africa","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-93119b15","guard":[["hasAny",["american","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9a6eec64","guard":[["hasAny",["cayman","each word","element","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ab67c873","guard":[["hasAny",["element","item number","miquelon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and Miquelon is in North America."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ab841177","guard":[["hasAny",["element","item number","nth","position","príncipe"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Tomé and ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-af6058ce","guard":[["hasAny",["cape","element","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-bc169459","guard":[["hasAny",["element","item number","kitts","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Saint ",{"slot":0}," and ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-c5b6dd81","guard":[["hasAny",["element","item number","nth","position","príncipe"]]],"pyramid":["render.template",{"lit":["São ",{"slot":0}," and ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cd6118c1","guard":[["hasAny",["element","item number","mariana","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Islands is in Micronesia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cf38d78d","guard":[["hasAny",["each word","element","item number","nth","pitcairn","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d34069a3","guard":[["hasAny",["each word","element","item number","nth","position","split into words","sudan"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d41b5b37","guard":[["hasAny",["barthélemy","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d6b31713","guard":[["hasAny",["africa","element","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e4dfb7a6","guard":[["hasAny",["element","hong","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Eastern Asia."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e914acad","guard":[["hasAny",["element","item number","kitts","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Kitts and ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e9b03402","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and Jan ",{"slot":1}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-ed56ae72","guard":[["hasAny",["element","item number","mariana","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Northern ",{"slot":0}," ",{"slot":1}," is in Micronesia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-edc0bed5","guard":[["hasAny",["cape","element","item number","normalise","normalize","nth","position","simplify the text"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-f11e574c","guard":[["hasAny",["element","item number","maarten","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fbae65fb","guard":[["hasAny",["element","item number","nth","position","sahara"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Northern Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fbe29eb2","guard":[["hasAny",["element","item number","macedonia","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southeast Europe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-fc283cad","guard":[["hasAny",["element","item number","nth","pitcairn","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-17cc5305","guard":[["hasAny",["africa","element","invert case","item number","lower case","lowercase","nth","position","small letters","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1d8cf047","guard":[["hasAny",["africa","element","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-33ddbdbb","guard":[["hasAny",["africa","element","item number","normalise","normalize","nth","position","simplify the text"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-3a2bf06c","guard":[["hasAny",["africa","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-5b9a6131","guard":[["hasAny",["africa","each word","element","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8af2b8f3","guard":[["hasAny",["africa","capitalise","capitalize","capitalize each word","element","item number","lower case","lowercase","nth","position","small letters","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b56d8963","guard":[["hasAny",["africa","all caps","capital letters","capitals","element","item number","lower case","lowercase","nth","position","small letters","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f4249bb9","guard":[["hasAny",["africa","each word","element","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-02efc70a","guard":[["hasAny",["element","item number","new","nth","position","shortest","shortest one","shortest word"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Australia and ",{"slot":2}," Zealand."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-05ceb4c1","guard":[["hasAny",["africa","each word","element","item number","lower case","lowercase","nth","position","small letters","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-478df55c","guard":[["hasAny",["element","grenadines","item number","longest","longest one","longest word","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and the ",{"slot":2}," is in Caribbean."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-703b9522","guard":[["hasAny",["element","item number","jan","nth","position","shortest","shortest one","shortest word"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-a49d6539","guard":[["hasAny",["element","item number","new","nth","position","shortest","shortest one","shortest word"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Australia and ",{"slot":2}," Zealand."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e4e7a173","guard":[["hasAny",["africa","element","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e5cd1a4c","guard":[["hasAny",["africa","each word","element","item number","lower case","lowercase","nth","position","small letters","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ef526450","guard":[["hasAny",["element","item number","nth","position","príncipe","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," is in Middle Africa."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fea3a631","guard":[["hasAny",["africa","element","item number","lower case","lowercase","normalise","normalize","nth","position","simplify the text","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Southern ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-04dfe56a","guard":[["hasAny",["element","item number","nth","position","príncipe"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," is in Middle Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-172fc529","guard":[["hasAny",["element","item number","nth","position","virgin"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," States ",{"slot":1}," ",{"slot":2}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-26a58e28","guard":[["hasAny",["element","item number","kitts","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-3605b36e","guard":[["hasAny",["element","item number","miquelon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-36112537","guard":[["hasAny",["element","item number","new","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Australia and ",{"slot":2}," Zealand."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-48b33dd0","guard":[["hasAny",["element","grenadines","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and the ",{"slot":2}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6311f97d","guard":[["hasAny",["element","item number","nth","position","virgin"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Islands is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-82122b28","guard":[["hasAny",["element","item number","nth","position","virgin"]],["has","subregion"]],"pyramid":["render.template",{"lit":["United ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-83fefb79","guard":[["hasAny",["element","item number","nth","position","príncipe"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8525defb","guard":[["hasAny",["element","item number","new","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Australia and ",{"slot":2}," Zealand."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-856c0818","guard":[["hasAny",["element","grenadines","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and the ",{"slot":2}," is in Caribbean."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-89afa315","guard":[["hasAny",["element","item number","minor","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["United ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Islands is in North America."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-904b5660","guard":[["hasAny",["element","item number","miquelon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-94b9b90d","guard":[["hasAny",["element","item number","minor","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Minor ",{"slot":2}," Islands is in North America."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-979a65cb","guard":[["hasAny",["element","item number","nth","position","virgin"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Virgin ",{"slot":2}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-a47dca41","guard":[["hasAny",["element","item number","mariana","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Micronesia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-a54d6805","guard":[["hasAny",["element","item number","minor","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," States ",{"slot":1}," ",{"slot":2}," Islands is in North America."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-c87bbb11","guard":[["hasAny",["element","item number","kitts","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-db61330f","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e9761179","guard":[["hasAny",["element","item number","new","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Australia and ",{"slot":2}," Zealand."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fd259b00","guard":[["hasAny",["element","item number","minor","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Outlying Islands is in North America."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ff3115a3","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-41015e7a","guard":[["hasAny",["element","item number","nth","position","virgin"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-ddd7468a","guard":[["hasAny",["element","item number","minor","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," Islands is in North America."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e49eaab0","guard":[["hasAny",["element","item number","minor","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," Islands is in North America."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the world subregion of Egypt","expect":{"contains":["Northern Africa"],"notRefusal":true}},{"q":"which subregion of the world is Sweden in","expect":{"contains":["Northern Europe"],"notRefusal":true}},{"q":"which subregion of the world is Philippines in","expect":{"contains":["South-Eastern Asia"],"notRefusal":true}},{"q":"in what subregion does Montserrat lie","expect":{"contains":["Caribbean"],"notRefusal":true}},{"q":"which subregion of the world is Congo in","expect":{"contains":["Middle Africa"],"notRefusal":true}},{"q":"which subregion of the world is United States Virgin Islands in","expect":{"contains":["Caribbean"],"notRefusal":true}},{"q":"in what subregion does Nepal lie","expect":{"contains":["Southern Asia"],"notRefusal":true}},{"q":"which subregion of the world is Tonga in","expect":{"contains":["Polynesia"],"notRefusal":true}},{"q":"which subregion of the world is Senegal in","expect":{"contains":["Western Africa"],"notRefusal":true}},{"q":"in what subregion does Luxembourg lie","expect":{"contains":["Western Europe"],"notRefusal":true}},{"q":"in what subregion does United States Minor Outlying Islands lie","expect":{"contains":["North America"],"notRefusal":true}},{"q":"in what subregion does São Tomé and Príncipe lie","expect":{"contains":["Middle Africa"],"notRefusal":true}},{"q":"in what subregion does Hong Kong lie","expect":{"contains":["Eastern Asia"],"notRefusal":true}},{"q":"in what subregion does Kyrgyzstan lie","expect":{"contains":["Central Asia"],"notRefusal":true}},{"q":"which subregion of the world is American Samoa in","expect":{"contains":["Polynesia"],"notRefusal":true}},{"q":"in what subregion does Russia lie","expect":{"contains":["Eastern Europe"],"notRefusal":true}},{"q":"which subregion of the world is Netherlands in","expect":{"contains":["Western Europe"],"notRefusal":true}},{"q":"name the world subregion of Cayman Islands","expect":{"contains":["Caribbean"],"notRefusal":true}},{"q":"name the world subregion of Albania","expect":{"contains":["Southeast Europe"],"notRefusal":true}},{"q":"in what subregion does Gambia lie","expect":{"contains":["Western Africa"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
