// language-alpha3-name-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"language-alpha3-name-neo-g6","class":"language-alpha3-name","generation":6,"lane":"neo","grownFrom":["which language has the three-letter code hau","what language is the ISO 639-2 code dzo","which language has the three-letter code dut","what language is the ISO 639-2 code orm","name the language with the bibliographic code uzb","which language has the three-letter code cha","name the language with the bibliographic code nob","which language has the three-letter code ukr","what language is the ISO 639-2 code pli","which language has the three-letter code alb","which language has the three-letter code vie","name the language with the bibliographic code ben","what language is the ISO 639-2 code lit","name the language with the bibliographic code sme","which language has the three-letter code ava","which language has the three-letter code bam","what language is the ISO 639-2 code glg","what language is the ISO 639-2 code snd","what language is the ISO 639-2 code swe","what language is the ISO 639-2 code cre"],"version":1});

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
{"id":"n-78c53230","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code hau":"The code hau stands for Hausa.","what language is the ISO 639-2 code dzo":"The code dzo stands for Dzongkha.","which language has the three-letter code dut":"The code dut stands for Dutch; Flemish.","what language is the ISO 639-2 code orm":"The code orm stands for Oromo.","name the language with the bibliographic code uzb":"The code uzb stands for Uzbek.","which language has the three-letter code cha":"The code cha stands for Chamorro.","name the language with the bibliographic code nob":"The code nob stands for Norwegian Bokmål.","which language has the three-letter code ukr":"The code ukr stands for Ukrainian.","what language is the ISO 639-2 code pli":"The code pli stands for Pali.","which language has the three-letter code alb":"The code alb stands for Albanian.","which language has the three-letter code vie":"The code vie stands for Vietnamese.","name the language with the bibliographic code ben":"The code ben stands for Bengali.","what language is the ISO 639-2 code lit":"The code lit stands for Lithuanian.","name the language with the bibliographic code sme":"The code sme stands for Northern Sami.","which language has the three-letter code ava":"The code ava stands for Avaric.","which language has the three-letter code bam":"The code bam stands for Bambara.","what language is the ISO 639-2 code glg":"The code glg stands for Galician.","what language is the ISO 639-2 code snd":"The code snd stands for Sindhi.","what language is the ISO 639-2 code swe":"The code swe stands for Swedish.","what language is the ISO 639-2 code cre":"The code cre stands for Cree.","name the language with the bibliographic code kau":"The code kau stands for Kanuri.","name the language with the bibliographic code vol":"The code vol stands for Volapük.","name the language with the bibliographic code nno":"The code nno stands for Norwegian Nynorsk.","which language has the three-letter code lat":"The code lat stands for Latin.","what language is the ISO 639-2 code per":"The code per stands for Persian.","what language is the ISO 639-2 code heb":"The code heb stands for Hebrew.","what language is the ISO 639-2 code arm":"The code arm stands for Armenian.","which language has the three-letter code tuk":"The code tuk stands for Turkmen.","name the language with the bibliographic code aka":"The code aka stands for Akan.","what language is the ISO 639-2 code lav":"The code lav stands for Latvian.","name the language with the bibliographic code jpn":"The code jpn stands for Japanese.","which language has the three-letter code xho":"The code xho stands for Xhosa.","which language has the three-letter code her":"The code her stands for Herero.","name the language with the bibliographic code iii":"The code iii stands for Sichuan Yi; Nuosu.","what language is the ISO 639-2 code yor":"The code yor stands for Yoruba.","what language is the ISO 639-2 code sun":"The code sun stands for Sundanese.","which language has the three-letter code cat":"The code cat stands for Catalan; Valencian.","what language is the ISO 639-2 code ger":"The code ger stands for German.","which language has the three-letter code grn":"The code grn stands for Guarani.","which language has the three-letter code kur":"The code kur stands for Kurdish.","name the language with the bibliographic code mac":"The code mac stands for Macedonian.","name the language with the bibliographic code pol":"The code pol stands for Polish.","what language is the ISO 639-2 code que":"The code que stands for Quechua.","which language has the three-letter code nav":"The code nav stands for Navajo; Navaho.","which language has the three-letter code ice":"The code ice stands for Icelandic.","name the language with the bibliographic code pan":"The code pan stands for Panjabi; Punjabi.","what language is the ISO 639-2 code spa":"The code spa stands for Spanish; Castilian.","name the language with the bibliographic code ssw":"The code ssw stands for Swati.","what language is the ISO 639-2 code por":"The code por stands for Portuguese.","name the language with the bibliographic code iku":"The code iku stands for Inuktitut.","which language has the three-letter code tib":"The code tib stands for Tibetan.","what language is the ISO 639-2 code bre":"The code bre stands for Breton.","name the language with the bibliographic code tsn":"The code tsn stands for Tswana.","name the language with the bibliographic code tir":"The code tir stands for Tigrinya.","name the language with the bibliographic code tgl":"The code tgl stands for Tagalog.","which language has the three-letter code epo":"The code epo stands for Esperanto.","name the language with the bibliographic code sot":"The code sot stands for Sotho, Southern.","name the language with the bibliographic code nau":"The code nau stands for Nauru.","what language is the ISO 639-2 code chu":"The code chu stands for Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic.","what language is the ISO 639-2 code som":"The code som stands for Somali.","which language has the three-letter code nep":"The code nep stands for Nepali.","what language is the ISO 639-2 code tah":"The code tah stands for Tahitian.","which language has the three-letter code rus":"The code rus stands for Russian.","which language has the three-letter code geo":"The code geo stands for Georgian.","which language has the three-letter code glv":"The code glv stands for Manx.","name the language with the bibliographic code fij":"The code fij stands for Fijian.","which language has the three-letter code baq":"The code baq stands for Basque.","which language has the three-letter code swa":"The code swa stands for Swahili.","what language is the ISO 639-2 code rum":"The code rum stands for Romanian; Moldavian; Moldovan.","what language is the ISO 639-2 code ori":"The code ori stands for Oriya.","which language has the three-letter code jav":"The code jav stands for Javanese.","what language is the ISO 639-2 code srp":"The code srp stands for Serbian.","name the language with the bibliographic code oji":"The code oji stands for Ojibwa.","what language is the ISO 639-2 code tur":"The code tur stands for Turkish.","which language has the three-letter code guj":"The code guj stands for Gujarati.","name the language with the bibliographic code lin":"The code lin stands for Lingala.","which language has the three-letter code lim":"The code lim stands for Limburgan; Limburger; Limburgish.","name the language with the bibliographic code bul":"The code bul stands for Bulgarian.","which language has the three-letter code mal":"The code mal stands for Malayalam.","which language has the three-letter code mao":"The code mao stands for Maori.","name the language with the bibliographic code uig":"The code uig stands for Uighur; Uyghur.","which language has the three-letter code wln":"The code wln stands for Walloon.","which language has the three-letter code afr":"The code afr stands for Afrikaans.","what language is the ISO 639-2 code aze":"The code aze stands for Azerbaijani.","name the language with the bibliographic code kir":"The code kir stands for Kirghiz; Kyrgyz.","name the language with the bibliographic code sin":"The code sin stands for Sinhala; Sinhalese.","name the language with the bibliographic code tel":"The code tel stands for Telugu.","name the language with the bibliographic code kan":"The code kan stands for Kannada.","which language has the three-letter code asm":"The code asm stands for Assamese.","what language is the ISO 639-2 code roh":"The code roh stands for Romansh.","what language is the ISO 639-2 code est":"The code est stands for Estonian.","name the language with the bibliographic code zha":"The code zha stands for Zhuang; Chuang.","what language is the ISO 639-2 code sna":"The code sna stands for Shona.","name the language with the bibliographic code fin":"The code fin stands for Finnish.","what language is the ISO 639-2 code hun":"The code hun stands for Hungarian.","name the language with the bibliographic code ndo":"The code ndo stands for Ndonga."}}},
{"id":"n-7ff64097","guard":[["has","code"],["has","language"]],"pyramid":["render.str",["memory.lookup",["sense.lastWord"]]],"mem":{"table":{"hau":"The code hau stands for Hausa.","dzo":"The code dzo stands for Dzongkha.","dut":"The code dut stands for Dutch; Flemish.","orm":"The code orm stands for Oromo.","uzb":"The code uzb stands for Uzbek.","cha":"The code cha stands for Chamorro.","nob":"The code nob stands for Norwegian Bokmål.","ukr":"The code ukr stands for Ukrainian.","pli":"The code pli stands for Pali.","alb":"The code alb stands for Albanian.","vie":"The code vie stands for Vietnamese.","ben":"The code ben stands for Bengali.","lit":"The code lit stands for Lithuanian.","sme":"The code sme stands for Northern Sami.","ava":"The code ava stands for Avaric.","bam":"The code bam stands for Bambara.","glg":"The code glg stands for Galician.","snd":"The code snd stands for Sindhi.","swe":"The code swe stands for Swedish.","cre":"The code cre stands for Cree.","kau":"The code kau stands for Kanuri.","vol":"The code vol stands for Volapük.","nno":"The code nno stands for Norwegian Nynorsk.","lat":"The code lat stands for Latin.","per":"The code per stands for Persian.","heb":"The code heb stands for Hebrew.","arm":"The code arm stands for Armenian.","tuk":"The code tuk stands for Turkmen.","aka":"The code aka stands for Akan.","lav":"The code lav stands for Latvian.","jpn":"The code jpn stands for Japanese.","xho":"The code xho stands for Xhosa.","her":"The code her stands for Herero.","iii":"The code iii stands for Sichuan Yi; Nuosu.","yor":"The code yor stands for Yoruba.","sun":"The code sun stands for Sundanese.","cat":"The code cat stands for Catalan; Valencian.","ger":"The code ger stands for German.","grn":"The code grn stands for Guarani.","kur":"The code kur stands for Kurdish.","mac":"The code mac stands for Macedonian.","pol":"The code pol stands for Polish.","que":"The code que stands for Quechua.","nav":"The code nav stands for Navajo; Navaho.","ice":"The code ice stands for Icelandic.","pan":"The code pan stands for Panjabi; Punjabi.","spa":"The code spa stands for Spanish; Castilian.","ssw":"The code ssw stands for Swati.","por":"The code por stands for Portuguese.","iku":"The code iku stands for Inuktitut.","tib":"The code tib stands for Tibetan.","bre":"The code bre stands for Breton.","tsn":"The code tsn stands for Tswana.","tir":"The code tir stands for Tigrinya.","tgl":"The code tgl stands for Tagalog.","epo":"The code epo stands for Esperanto.","sot":"The code sot stands for Sotho, Southern.","nau":"The code nau stands for Nauru.","chu":"The code chu stands for Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic.","som":"The code som stands for Somali.","nep":"The code nep stands for Nepali.","tah":"The code tah stands for Tahitian.","rus":"The code rus stands for Russian.","geo":"The code geo stands for Georgian.","glv":"The code glv stands for Manx.","fij":"The code fij stands for Fijian.","baq":"The code baq stands for Basque.","swa":"The code swa stands for Swahili.","rum":"The code rum stands for Romanian; Moldavian; Moldovan.","ori":"The code ori stands for Oriya.","jav":"The code jav stands for Javanese.","srp":"The code srp stands for Serbian.","oji":"The code oji stands for Ojibwa.","tur":"The code tur stands for Turkish.","guj":"The code guj stands for Gujarati.","lin":"The code lin stands for Lingala.","lim":"The code lim stands for Limburgan; Limburger; Limburgish.","bul":"The code bul stands for Bulgarian.","mal":"The code mal stands for Malayalam.","mao":"The code mao stands for Maori.","uig":"The code uig stands for Uighur; Uyghur.","wln":"The code wln stands for Walloon.","afr":"The code afr stands for Afrikaans.","aze":"The code aze stands for Azerbaijani.","kir":"The code kir stands for Kirghiz; Kyrgyz.","sin":"The code sin stands for Sinhala; Sinhalese.","tel":"The code tel stands for Telugu.","kan":"The code kan stands for Kannada.","asm":"The code asm stands for Assamese.","roh":"The code roh stands for Romansh.","est":"The code est stands for Estonian.","zha":"The code zha stands for Zhuang; Chuang.","sna":"The code sna stands for Shona.","fin":"The code fin stands for Finnish.","hun":"The code hun stands for Hungarian.","ndo":"The code ndo stands for Ndonga."}}},
{"id":"n-b66bea97","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"language"}]]],"mem":{"table":{"has the three-letter code hau":"The code hau stands for Hausa.","is the ISO 639-2 code dzo":"The code dzo stands for Dzongkha.","has the three-letter code dut":"The code dut stands for Dutch; Flemish.","is the ISO 639-2 code orm":"The code orm stands for Oromo.","with the bibliographic code uzb":"The code uzb stands for Uzbek.","has the three-letter code cha":"The code cha stands for Chamorro.","with the bibliographic code nob":"The code nob stands for Norwegian Bokmål.","has the three-letter code ukr":"The code ukr stands for Ukrainian.","is the ISO 639-2 code pli":"The code pli stands for Pali.","has the three-letter code alb":"The code alb stands for Albanian.","has the three-letter code vie":"The code vie stands for Vietnamese.","with the bibliographic code ben":"The code ben stands for Bengali.","is the ISO 639-2 code lit":"The code lit stands for Lithuanian.","with the bibliographic code sme":"The code sme stands for Northern Sami.","has the three-letter code ava":"The code ava stands for Avaric.","has the three-letter code bam":"The code bam stands for Bambara.","is the ISO 639-2 code glg":"The code glg stands for Galician.","is the ISO 639-2 code snd":"The code snd stands for Sindhi.","is the ISO 639-2 code swe":"The code swe stands for Swedish.","is the ISO 639-2 code cre":"The code cre stands for Cree.","with the bibliographic code kau":"The code kau stands for Kanuri.","with the bibliographic code vol":"The code vol stands for Volapük.","with the bibliographic code nno":"The code nno stands for Norwegian Nynorsk.","has the three-letter code lat":"The code lat stands for Latin.","is the ISO 639-2 code per":"The code per stands for Persian.","is the ISO 639-2 code heb":"The code heb stands for Hebrew.","is the ISO 639-2 code arm":"The code arm stands for Armenian.","has the three-letter code tuk":"The code tuk stands for Turkmen.","with the bibliographic code aka":"The code aka stands for Akan.","is the ISO 639-2 code lav":"The code lav stands for Latvian.","with the bibliographic code jpn":"The code jpn stands for Japanese.","has the three-letter code xho":"The code xho stands for Xhosa.","has the three-letter code her":"The code her stands for Herero.","with the bibliographic code iii":"The code iii stands for Sichuan Yi; Nuosu.","is the ISO 639-2 code yor":"The code yor stands for Yoruba.","is the ISO 639-2 code sun":"The code sun stands for Sundanese.","has the three-letter code cat":"The code cat stands for Catalan; Valencian.","is the ISO 639-2 code ger":"The code ger stands for German.","has the three-letter code grn":"The code grn stands for Guarani.","has the three-letter code kur":"The code kur stands for Kurdish.","with the bibliographic code mac":"The code mac stands for Macedonian.","with the bibliographic code pol":"The code pol stands for Polish.","is the ISO 639-2 code que":"The code que stands for Quechua.","has the three-letter code nav":"The code nav stands for Navajo; Navaho.","has the three-letter code ice":"The code ice stands for Icelandic.","with the bibliographic code pan":"The code pan stands for Panjabi; Punjabi.","is the ISO 639-2 code spa":"The code spa stands for Spanish; Castilian.","with the bibliographic code ssw":"The code ssw stands for Swati.","is the ISO 639-2 code por":"The code por stands for Portuguese.","with the bibliographic code iku":"The code iku stands for Inuktitut.","has the three-letter code tib":"The code tib stands for Tibetan.","is the ISO 639-2 code bre":"The code bre stands for Breton.","with the bibliographic code tsn":"The code tsn stands for Tswana.","with the bibliographic code tir":"The code tir stands for Tigrinya.","with the bibliographic code tgl":"The code tgl stands for Tagalog.","has the three-letter code epo":"The code epo stands for Esperanto.","with the bibliographic code sot":"The code sot stands for Sotho, Southern.","with the bibliographic code nau":"The code nau stands for Nauru.","is the ISO 639-2 code chu":"The code chu stands for Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic.","is the ISO 639-2 code som":"The code som stands for Somali.","has the three-letter code nep":"The code nep stands for Nepali.","is the ISO 639-2 code tah":"The code tah stands for Tahitian.","has the three-letter code rus":"The code rus stands for Russian.","has the three-letter code geo":"The code geo stands for Georgian.","has the three-letter code glv":"The code glv stands for Manx.","with the bibliographic code fij":"The code fij stands for Fijian.","has the three-letter code baq":"The code baq stands for Basque.","has the three-letter code swa":"The code swa stands for Swahili.","is the ISO 639-2 code rum":"The code rum stands for Romanian; Moldavian; Moldovan.","is the ISO 639-2 code ori":"The code ori stands for Oriya.","has the three-letter code jav":"The code jav stands for Javanese.","is the ISO 639-2 code srp":"The code srp stands for Serbian.","with the bibliographic code oji":"The code oji stands for Ojibwa.","is the ISO 639-2 code tur":"The code tur stands for Turkish.","has the three-letter code guj":"The code guj stands for Gujarati.","with the bibliographic code lin":"The code lin stands for Lingala.","has the three-letter code lim":"The code lim stands for Limburgan; Limburger; Limburgish.","with the bibliographic code bul":"The code bul stands for Bulgarian.","has the three-letter code mal":"The code mal stands for Malayalam.","has the three-letter code mao":"The code mao stands for Maori.","with the bibliographic code uig":"The code uig stands for Uighur; Uyghur.","has the three-letter code wln":"The code wln stands for Walloon.","has the three-letter code afr":"The code afr stands for Afrikaans.","is the ISO 639-2 code aze":"The code aze stands for Azerbaijani.","with the bibliographic code kir":"The code kir stands for Kirghiz; Kyrgyz.","with the bibliographic code sin":"The code sin stands for Sinhala; Sinhalese.","with the bibliographic code tel":"The code tel stands for Telugu.","with the bibliographic code kan":"The code kan stands for Kannada.","has the three-letter code asm":"The code asm stands for Assamese.","is the ISO 639-2 code roh":"The code roh stands for Romansh.","is the ISO 639-2 code est":"The code est stands for Estonian.","with the bibliographic code zha":"The code zha stands for Zhuang; Chuang.","is the ISO 639-2 code sna":"The code sna stands for Shona.","with the bibliographic code fin":"The code fin stands for Finnish.","is the ISO 639-2 code hun":"The code hun stands for Hungarian.","with the bibliographic code ndo":"The code ndo stands for Ndonga."}}},
{"id":"n-2aac6337","guard":[["has","code"],["words>=",7]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code hau":"The code hau stands for Hausa.","which language has the three-letter code dut":"The code dut stands for Dutch; Flemish.","name the language with the bibliographic code uzb":"The code uzb stands for Uzbek.","which language has the three-letter code cha":"The code cha stands for Chamorro.","name the language with the bibliographic code nob":"The code nob stands for Norwegian Bokmål.","which language has the three-letter code ukr":"The code ukr stands for Ukrainian.","which language has the three-letter code alb":"The code alb stands for Albanian.","which language has the three-letter code vie":"The code vie stands for Vietnamese.","name the language with the bibliographic code ben":"The code ben stands for Bengali.","name the language with the bibliographic code sme":"The code sme stands for Northern Sami.","which language has the three-letter code ava":"The code ava stands for Avaric.","which language has the three-letter code bam":"The code bam stands for Bambara.","name the language with the bibliographic code kau":"The code kau stands for Kanuri.","name the language with the bibliographic code vol":"The code vol stands for Volapük.","name the language with the bibliographic code nno":"The code nno stands for Norwegian Nynorsk.","which language has the three-letter code lat":"The code lat stands for Latin.","which language has the three-letter code tuk":"The code tuk stands for Turkmen.","name the language with the bibliographic code aka":"The code aka stands for Akan.","name the language with the bibliographic code jpn":"The code jpn stands for Japanese.","which language has the three-letter code xho":"The code xho stands for Xhosa.","which language has the three-letter code her":"The code her stands for Herero.","name the language with the bibliographic code iii":"The code iii stands for Sichuan Yi; Nuosu.","which language has the three-letter code cat":"The code cat stands for Catalan; Valencian.","which language has the three-letter code grn":"The code grn stands for Guarani.","which language has the three-letter code kur":"The code kur stands for Kurdish.","name the language with the bibliographic code mac":"The code mac stands for Macedonian.","name the language with the bibliographic code pol":"The code pol stands for Polish.","which language has the three-letter code nav":"The code nav stands for Navajo; Navaho.","which language has the three-letter code ice":"The code ice stands for Icelandic.","name the language with the bibliographic code pan":"The code pan stands for Panjabi; Punjabi.","name the language with the bibliographic code ssw":"The code ssw stands for Swati.","name the language with the bibliographic code iku":"The code iku stands for Inuktitut.","which language has the three-letter code tib":"The code tib stands for Tibetan.","name the language with the bibliographic code tsn":"The code tsn stands for Tswana.","name the language with the bibliographic code tir":"The code tir stands for Tigrinya.","name the language with the bibliographic code tgl":"The code tgl stands for Tagalog.","which language has the three-letter code epo":"The code epo stands for Esperanto.","name the language with the bibliographic code sot":"The code sot stands for Sotho, Southern.","name the language with the bibliographic code nau":"The code nau stands for Nauru.","which language has the three-letter code nep":"The code nep stands for Nepali.","which language has the three-letter code rus":"The code rus stands for Russian.","which language has the three-letter code geo":"The code geo stands for Georgian.","which language has the three-letter code glv":"The code glv stands for Manx.","name the language with the bibliographic code fij":"The code fij stands for Fijian.","which language has the three-letter code baq":"The code baq stands for Basque.","which language has the three-letter code swa":"The code swa stands for Swahili.","which language has the three-letter code jav":"The code jav stands for Javanese.","name the language with the bibliographic code oji":"The code oji stands for Ojibwa.","which language has the three-letter code guj":"The code guj stands for Gujarati.","name the language with the bibliographic code lin":"The code lin stands for Lingala.","which language has the three-letter code lim":"The code lim stands for Limburgan; Limburger; Limburgish.","name the language with the bibliographic code bul":"The code bul stands for Bulgarian.","which language has the three-letter code mal":"The code mal stands for Malayalam.","which language has the three-letter code mao":"The code mao stands for Maori.","name the language with the bibliographic code uig":"The code uig stands for Uighur; Uyghur.","which language has the three-letter code wln":"The code wln stands for Walloon.","which language has the three-letter code afr":"The code afr stands for Afrikaans.","name the language with the bibliographic code kir":"The code kir stands for Kirghiz; Kyrgyz.","name the language with the bibliographic code sin":"The code sin stands for Sinhala; Sinhalese.","name the language with the bibliographic code tel":"The code tel stands for Telugu.","name the language with the bibliographic code kan":"The code kan stands for Kannada.","which language has the three-letter code asm":"The code asm stands for Assamese.","name the language with the bibliographic code zha":"The code zha stands for Zhuang; Chuang.","name the language with the bibliographic code fin":"The code fin stands for Finnish.","name the language with the bibliographic code ndo":"The code ndo stands for Ndonga."}}},
{"id":"n-029493a5","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the ISO 639-2 code dzo":"The code dzo stands for Dzongkha.","the ISO 639-2 code orm":"The code orm stands for Oromo.","the ISO 639-2 code pli":"The code pli stands for Pali.","the ISO 639-2 code lit":"The code lit stands for Lithuanian.","the ISO 639-2 code glg":"The code glg stands for Galician.","the ISO 639-2 code snd":"The code snd stands for Sindhi.","the ISO 639-2 code swe":"The code swe stands for Swedish.","the ISO 639-2 code cre":"The code cre stands for Cree.","the ISO 639-2 code per":"The code per stands for Persian.","the ISO 639-2 code heb":"The code heb stands for Hebrew.","the ISO 639-2 code arm":"The code arm stands for Armenian.","the ISO 639-2 code lav":"The code lav stands for Latvian.","the ISO 639-2 code yor":"The code yor stands for Yoruba.","the ISO 639-2 code sun":"The code sun stands for Sundanese.","the ISO 639-2 code ger":"The code ger stands for German.","the ISO 639-2 code que":"The code que stands for Quechua.","the ISO 639-2 code spa":"The code spa stands for Spanish; Castilian.","the ISO 639-2 code por":"The code por stands for Portuguese.","the ISO 639-2 code bre":"The code bre stands for Breton.","the ISO 639-2 code chu":"The code chu stands for Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic.","the ISO 639-2 code som":"The code som stands for Somali.","the ISO 639-2 code tah":"The code tah stands for Tahitian.","the ISO 639-2 code rum":"The code rum stands for Romanian; Moldavian; Moldovan.","the ISO 639-2 code ori":"The code ori stands for Oriya.","the ISO 639-2 code srp":"The code srp stands for Serbian.","the ISO 639-2 code tur":"The code tur stands for Turkish.","the ISO 639-2 code aze":"The code aze stands for Azerbaijani.","the ISO 639-2 code roh":"The code roh stands for Romansh.","the ISO 639-2 code est":"The code est stands for Estonian.","the ISO 639-2 code sna":"The code sna stands for Shona.","the ISO 639-2 code hun":"The code hun stands for Hungarian."}}},
{"id":"n-012dfe90","guard":[["has","lit"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Lithuanian."]},["sense.lastWord"]],"mem":null},
{"id":"n-03be53a7","guard":[["has","aka"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Akan."]},["sense.lastWord"]],"mem":null},
{"id":"n-04d7a0be","guard":[["has","oji"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code oji":"The code oji stands for Ojibwa."}}},
{"id":"n-06f37045","guard":[["has","mal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code mal":"The code mal stands for Malayalam."}}},
{"id":"n-0799aa2d","guard":[["has","kir"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kirghiz; Kyrgyz."]},["sense.lastWord"]],"mem":null},
{"id":"n-08a8213e","guard":[["hasAny",["code","iso","language","tah"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code tah":"The code tah stands for Tahitian."}}},
{"id":"n-0988e87e","guard":[["has","cat"],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Catalan; Valencian."]},["sense.lastWord"]],"mem":null},
{"id":"n-0b110b78","guard":[["hasAny",["alb","code","has","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code alb":"The code alb stands for Albanian."}}},
{"id":"n-0b810077","guard":[["has","asm"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Assamese."]},["sense.lastWord"]],"mem":null},
{"id":"n-0beff389","guard":[["has","kur"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code kur":"The code kur stands for Kurdish."}}},
{"id":"n-0c2c387e","guard":[["has","mao"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code mao":"The code mao stands for Maori."}}},
{"id":"n-0c92c923","guard":[["has","pan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code pan":"The code pan stands for Panjabi; Punjabi."}}},
{"id":"n-0da8a6d2","guard":[["has","epo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code epo":"The code epo stands for Esperanto."}}},
{"id":"n-0e65fbae","guard":[["has","que"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Quechua."]},["sense.lastWord"]],"mem":null},
{"id":"n-1155933c","guard":[["has","iku"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code iku":"The code iku stands for Inuktitut."}}},
{"id":"n-11abb79a","guard":[["has","srp"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Serbian."]},["sense.lastWord"]],"mem":null},
{"id":"n-11dada28","guard":[["has","sot"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sotho, Southern."]},["sense.lastWord"]],"mem":null},
{"id":"n-126edc87","guard":[["hasAny",["asm","code","has","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code asm":"The code asm stands for Assamese."}}},
{"id":"n-13a4bbda","guard":[["has","sna"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Shona."]},["sense.lastWord"]],"mem":null},
{"id":"n-14559d36","guard":[["hasAny",["bibliographic","code","language","name","pol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code pol":"The code pol stands for Polish."}}},
{"id":"n-1580f4cb","guard":[["has","her"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code her":"The code her stands for Herero."}}},
{"id":"n-167a3b37","guard":[["has","ori"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Oriya."]},["sense.lastWord"]],"mem":null},
{"id":"n-1a0ba343","guard":[["has","kan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code kan":"The code kan stands for Kannada."}}},
{"id":"n-1b74c693","guard":[["has","kau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code kau":"The code kau stands for Kanuri."}}},
{"id":"n-1bef02a6","guard":[["has","mac"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code mac":"The code mac stands for Macedonian."}}},
{"id":"n-1c279dbd","guard":[["has","cha"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Chamorro."]},["sense.lastWord"]],"mem":null},
{"id":"n-1cda1304","guard":[["has","pli"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Pali."]},["sense.lastWord"]],"mem":null},
{"id":"n-1d8efb8d","guard":[["hasAny",["code","has","hau","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code hau":"The code hau stands for Hausa."}}},
{"id":"n-1dc11b1f","guard":[["has","fin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code fin":"The code fin stands for Finnish."}}},
{"id":"n-1f7bdf91","guard":[["has","nav"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Navajo; Navaho."]},["sense.lastWord"]],"mem":null},
{"id":"n-24fa32c9","guard":[["hasAny",["bibliographic","code","language","name","oji"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code oji":"The code oji stands for Ojibwa."}}},
{"id":"n-26a59971","guard":[["has","epo"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Esperanto."]},["sense.lastWord"]],"mem":null},
{"id":"n-2754031d","guard":[["has","iii"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sichuan Yi; Nuosu."]},["sense.lastWord"]],"mem":null},
{"id":"n-27b0d79f","guard":[["hasAny",["bibliographic","code","language","name","ndo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code ndo":"The code ndo stands for Ndonga."}}},
{"id":"n-28934021","guard":[["has","iku"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Inuktitut."]},["sense.lastWord"]],"mem":null},
{"id":"n-29114f4d","guard":[["has","zha"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Zhuang; Chuang."]},["sense.lastWord"]],"mem":null},
{"id":"n-2be828b2","guard":[["has","ndo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code ndo":"The code ndo stands for Ndonga."}}},
{"id":"n-2d423f01","guard":[["hasAny",["cha","code","has","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code cha":"The code cha stands for Chamorro."}}},
{"id":"n-2f7e1d71","guard":[["hasAny",["bibliographic","bul","code","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code bul":"The code bul stands for Bulgarian."}}},
{"id":"n-30f76b8a","guard":[["has","fij"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code fij":"The code fij stands for Fijian."}}},
{"id":"n-31043cb1","guard":[["hasAny",["bibliographic","code","iku","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code iku":"The code iku stands for Inuktitut."}}},
{"id":"n-3250ca41","guard":[["has","swa"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swahili."]},["sense.lastWord"]],"mem":null},
{"id":"n-326e514e","guard":[["has","rum"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Romanian; Moldavian; Moldovan."]},["sense.lastWord"]],"mem":null},
{"id":"n-334f5855","guard":[["has","bul"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bulgarian."]},["sense.lastWord"]],"mem":null},
{"id":"n-3466bc53","guard":[["hasAny",["code","grn","has","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code grn":"The code grn stands for Guarani."}}},
{"id":"n-363387bf","guard":[["has","bam"],["has","language"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bambara."]},["sense.lastWord"]],"mem":null},
{"id":"n-3c727618","guard":[["has","sun"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sundanese."]},["sense.lastWord"]],"mem":null},
{"id":"n-3fd96c90","guard":[["has","bul"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code bul":"The code bul stands for Bulgarian."}}},
{"id":"n-3fe1249a","guard":[["has","baq"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Basque."]},["sense.lastWord"]],"mem":null},
{"id":"n-40340bbc","guard":[["has","tur"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Turkish."]},["sense.lastWord"]],"mem":null},
{"id":"n-404e47ed","guard":[["has","sin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code sin":"The code sin stands for Sinhala; Sinhalese."}}},
{"id":"n-41159115","guard":[["hasAny",["bre","code","iso","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code bre":"The code bre stands for Breton."}}},
{"id":"n-41c0a7db","guard":[["has","zha"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code zha":"The code zha stands for Zhuang; Chuang."}}},
{"id":"n-42616e53","guard":[["has","ben"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code ben":"The code ben stands for Bengali."}}},
{"id":"n-45227bec","guard":[["hasAny",["code","epo","has","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code epo":"The code epo stands for Esperanto."}}},
{"id":"n-47313125","guard":[["has","glv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code glv":"The code glv stands for Manx."}}},
{"id":"n-4792f73b","guard":[["hasAny",["code","guj","has","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code guj":"The code guj stands for Gujarati."}}},
{"id":"n-4932e021","guard":[["has","pol"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Polish."]},["sense.lastWord"]],"mem":null},
{"id":"n-4b767535","guard":[["hasAny",["bibliographic","code","language","name","uzb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code uzb":"The code uzb stands for Uzbek."}}},
{"id":"n-4b92134c","guard":[["hasAny",["code","has","language","rus","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code rus":"The code rus stands for Russian."}}},
{"id":"n-4beffe56","guard":[["hasAny",["code","has","language","nav","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code nav":"The code nav stands for Navajo; Navaho."}}},
{"id":"n-4c1a2367","guard":[["hasAny",["code","iso","language","sna"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code sna":"The code sna stands for Shona."}}},
{"id":"n-4cbf4c06","guard":[["hasAny",["bibliographic","code","language","name","tgl"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code tgl":"The code tgl stands for Tagalog."}}},
{"id":"n-4d2b9ec3","guard":[["hasAny",["code","has","language","threeletter","xho"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code xho":"The code xho stands for Xhosa."}}},
{"id":"n-4dade571","guard":[["has","nno"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code nno":"The code nno stands for Norwegian Nynorsk."}}},
{"id":"n-4f62dcfd","guard":[["has","bre"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Breton."]},["sense.lastWord"]],"mem":null},
{"id":"n-4f781945","guard":[["has","tel"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Telugu."]},["sense.lastWord"]],"mem":null},
{"id":"n-526c4aac","guard":[["has","jpn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code jpn":"The code jpn stands for Japanese."}}},
{"id":"n-52acd59e","guard":[["has","wln"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Walloon."]},["sense.lastWord"]],"mem":null},
{"id":"n-52e90b28","guard":[["hasAny",["bibliographic","code","language","name","pan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code pan":"The code pan stands for Panjabi; Punjabi."}}},
{"id":"n-54d88471","guard":[["hasAny",["code","iso","language","roh"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code roh":"The code roh stands for Romansh."}}},
{"id":"n-54e06183","guard":[["has","afr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code afr":"The code afr stands for Afrikaans."}}},
{"id":"n-55079b9e","guard":[["has","lim"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code lim":"The code lim stands for Limburgan; Limburger; Limburgish."}}},
{"id":"n-565f7a7d","guard":[["hasAny",["code","iso","language","tur"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code tur":"The code tur stands for Turkish."}}},
{"id":"n-56ab139d","guard":[["has","aze"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Azerbaijani."]},["sense.lastWord"]],"mem":null},
{"id":"n-56af8a88","guard":[["has","lim"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Limburgan; Limburger; Limburgish."]},["sense.lastWord"]],"mem":null},
{"id":"n-56c26c6c","guard":[["has","her"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Herero."]},["sense.lastWord"]],"mem":null},
{"id":"n-5898c815","guard":[["has","kur"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kurdish."]},["sense.lastWord"]],"mem":null},
{"id":"n-5a1ebd7e","guard":[["has","geo"],["has","language"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Georgian."]},["sense.lastWord"]],"mem":null},
{"id":"n-5a99f277","guard":[["has","nob"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Norwegian Bokmål."]},["sense.lastWord"]],"mem":null},
{"id":"n-5abdc142","guard":[["has","tuk"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Turkmen."]},["sense.lastWord"]],"mem":null},
{"id":"n-5b038eb0","guard":[["has","nau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code nau":"The code nau stands for Nauru."}}},
{"id":"n-5b52ebc5","guard":[["has","tib"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tibetan."]},["sense.lastWord"]],"mem":null},
{"id":"n-5b92da0c","guard":[["has","sme"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Northern Sami."]},["sense.lastWord"]],"mem":null},
{"id":"n-5ba35f8d","guard":[["hasAny",["bibliographic","code","language","name","vol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code vol":"The code vol stands for Volapük."}}},
{"id":"n-5d952ecd","guard":[["has","arm"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Armenian."]},["sense.lastWord"]],"mem":null},
{"id":"n-5df67aa4","guard":[["has","ukr"],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ukrainian."]},["sense.lastWord"]],"mem":null},
{"id":"n-5e9572a9","guard":[["has","ger"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for German."]},["sense.lastWord"]],"mem":null},
{"id":"n-5f6f3fbe","guard":[["hasAny",["code","geo","has","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code geo":"The code geo stands for Georgian."}}},
{"id":"n-5ffab44b","guard":[["has","snd"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sindhi."]},["sense.lastWord"]],"mem":null},
{"id":"n-6074196d","guard":[["hasAny",["code","has","language","lat","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code lat":"The code lat stands for Latin."}}},
{"id":"n-62069e17","guard":[["has","tir"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tigrinya."]},["sense.lastWord"]],"mem":null},
{"id":"n-63727080","guard":[["hasAny",["bibliographic","code","language","name","tel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code tel":"The code tel stands for Telugu."}}},
{"id":"n-63c5509f","guard":[["hasAny",["bibliographic","code","jpn","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code jpn":"The code jpn stands for Japanese."}}},
{"id":"n-63f2e4af","guard":[["hasAny",["code","has","language","threeletter","wln"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code wln":"The code wln stands for Walloon."}}},
{"id":"n-640d0fae","guard":[["has","dzo"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Dzongkha."]},["sense.lastWord"]],"mem":null},
{"id":"n-64972cc5","guard":[["has","som"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Somali."]},["sense.lastWord"]],"mem":null},
{"id":"n-6799191d","guard":[["has","mac"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Macedonian."]},["sense.lastWord"]],"mem":null},
{"id":"n-697c170f","guard":[["has","vie"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Vietnamese."]},["sense.lastWord"]],"mem":null},
{"id":"n-699b4b77","guard":[["has","lav"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Latvian."]},["sense.lastWord"]],"mem":null},
{"id":"n-6a6096d0","guard":[["hasAny",["bibliographic","code","language","name","sme"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code sme":"The code sme stands for Northern Sami."}}},
{"id":"n-6bbed95f","guard":[["has","swe"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swedish."]},["sense.lastWord"]],"mem":null},
{"id":"n-6c548bcb","guard":[["hasAny",["code","iso","language","spa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code spa":"The code spa stands for Spanish; Castilian."}}},
{"id":"n-6d3d4b64","guard":[["has","nau"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Nauru."]},["sense.lastWord"]],"mem":null},
{"id":"n-6d4f6667","guard":[["has","ukr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code ukr":"The code ukr stands for Ukrainian."}}},
{"id":"n-71a2d0b1","guard":[["hasAny",["bibliographic","code","language","name","tsn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code tsn":"The code tsn stands for Tswana."}}},
{"id":"n-72915b2c","guard":[["has","alb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code alb":"The code alb stands for Albanian."}}},
{"id":"n-72e9180f","guard":[["has","orm"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Oromo."]},["sense.lastWord"]],"mem":null},
{"id":"n-7457402a","guard":[["has","nep"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code nep":"The code nep stands for Nepali."}}},
{"id":"n-7a76119e","guard":[["has","hau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code hau":"The code hau stands for Hausa."}}},
{"id":"n-7abdb245","guard":[["has","xho"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code xho":"The code xho stands for Xhosa."}}},
{"id":"n-7ad8df97","guard":[["hasAny",["code","has","language","threeletter","tib"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code tib":"The code tib stands for Tibetan."}}},
{"id":"n-7b488fc4","guard":[["has","glv"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Manx."]},["sense.lastWord"]],"mem":null},
{"id":"n-7b7cd5e1","guard":[["hasAny",["code","cre","iso","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code cre":"The code cre stands for Cree."}}},
{"id":"n-7c3af707","guard":[["has","alb"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Albanian."]},["sense.lastWord"]],"mem":null},
{"id":"n-7d35af41","guard":[["hasAny",["aka","bibliographic","code","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code aka":"The code aka stands for Akan."}}},
{"id":"n-7d69f574","guard":[["has","kau"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kanuri."]},["sense.lastWord"]],"mem":null},
{"id":"n-7e2ade3c","guard":[["hasAny",["code","glg","iso","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code glg":"The code glg stands for Galician."}}},
{"id":"n-8062182a","guard":[["hasAny",["code","has","kur","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code kur":"The code kur stands for Kurdish."}}},
{"id":"n-8102ee49","guard":[["has","jav"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Javanese."]},["sense.lastWord"]],"mem":null},
{"id":"n-8217b0a8","guard":[["has","hun"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hungarian."]},["sense.lastWord"]],"mem":null},
{"id":"n-8229f19b","guard":[["hasAny",["code","has","language","mal","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code mal":"The code mal stands for Malayalam."}}},
{"id":"n-82ddfbf6","guard":[["has","aka"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code aka":"The code aka stands for Akan."}}},
{"id":"n-83286f2f","guard":[["has","grn"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Guarani."]},["sense.lastWord"]],"mem":null},
{"id":"n-83739495","guard":[["has","lin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code lin":"The code lin stands for Lingala."}}},
{"id":"n-83ca75da","guard":[["has","spa"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Spanish; Castilian."]},["sense.lastWord"]],"mem":null},
{"id":"n-8624ad93","guard":[["has","geo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code geo":"The code geo stands for Georgian."}}},
{"id":"n-867f825c","guard":[["hasAny",["afr","code","has","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code afr":"The code afr stands for Afrikaans."}}},
{"id":"n-8707c14c","guard":[["has","lat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code lat":"The code lat stands for Latin."}}},
{"id":"n-88b19211","guard":[["has","nav"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code nav":"The code nav stands for Navajo; Navaho."}}},
{"id":"n-89995e37","guard":[["has","tuk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code tuk":"The code tuk stands for Turkmen."}}},
{"id":"n-8a0bb72f","guard":[["hasAny",["bibliographic","code","kir","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code kir":"The code kir stands for Kirghiz; Kyrgyz."}}},
{"id":"n-8abb3535","guard":[["has","uzb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code uzb":"The code uzb stands for Uzbek."}}},
{"id":"n-8b0ff3ac","guard":[["has","ssw"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swati."]},["sense.lastWord"]],"mem":null},
{"id":"n-8ba866c5","guard":[["has","vie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code vie":"The code vie stands for Vietnamese."}}},
{"id":"n-8be81ce7","guard":[["has","kir"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code kir":"The code kir stands for Kirghiz; Kyrgyz."}}},
{"id":"n-8d3fc738","guard":[["has","lat"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Latin."]},["sense.lastWord"]],"mem":null},
{"id":"n-8e960c6c","guard":[["has","pol"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code pol":"The code pol stands for Polish."}}},
{"id":"n-90f78a57","guard":[["has","tah"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tahitian."]},["sense.lastWord"]],"mem":null},
{"id":"n-90fef509","guard":[["hasAny",["ben","bibliographic","code","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code ben":"The code ben stands for Bengali."}}},
{"id":"n-912f719a","guard":[["has","cat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code cat":"The code cat stands for Catalan; Valencian."}}},
{"id":"n-91f3daa2","guard":[["has","cre"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Cree."]},["sense.lastWord"]],"mem":null},
{"id":"n-94507bf5","guard":[["has","per"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Persian."]},["sense.lastWord"]],"mem":null},
{"id":"n-9514ad82","guard":[["hasAny",["code","iso","language","que"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code que":"The code que stands for Quechua."}}},
{"id":"n-97148d35","guard":[["hasAny",["code","has","language","lim","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code lim":"The code lim stands for Limburgan; Limburger; Limburgish."}}},
{"id":"n-980cf748","guard":[["hasAny",["code","iso","language","snd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code snd":"The code snd stands for Sindhi."}}},
{"id":"n-98bb1b49","guard":[["has","ndo"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ndonga."]},["sense.lastWord"]],"mem":null},
{"id":"n-9bca209b","guard":[["has","vol"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code vol":"The code vol stands for Volapük."}}},
{"id":"n-9e524c3c","guard":[["hasAny",["code","has","jav","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code jav":"The code jav stands for Javanese."}}},
{"id":"n-9ea04788","guard":[["hasAny",["code","has","language","threeletter","tuk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code tuk":"The code tuk stands for Turkmen."}}},
{"id":"n-9f3bdd7f","guard":[["has","swa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code swa":"The code swa stands for Swahili."}}},
{"id":"n-a034f01d","guard":[["hasAny",["bibliographic","code","language","name","tir"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code tir":"The code tir stands for Tigrinya."}}},
{"id":"n-a049d9d4","guard":[["has","mal"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Malayalam."]},["sense.lastWord"]],"mem":null},
{"id":"n-a07019cd","guard":[["hasAny",["bibliographic","code","kau","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code kau":"The code kau stands for Kanuri."}}},
{"id":"n-a073a938","guard":[["hasAny",["bibliographic","code","language","name","nno"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code nno":"The code nno stands for Norwegian Nynorsk."}}},
{"id":"n-a0b2ab9a","guard":[["has","afr"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Afrikaans."]},["sense.lastWord"]],"mem":null},
{"id":"n-a242512f","guard":[["hasAny",["code","has","her","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code her":"The code her stands for Herero."}}},
{"id":"n-a2c4f8c7","guard":[["has","lin"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Lingala."]},["sense.lastWord"]],"mem":null},
{"id":"n-a3da052f","guard":[["has","rus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code rus":"The code rus stands for Russian."}}},
{"id":"n-a4148da5","guard":[["has","tgl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code tgl":"The code tgl stands for Tagalog."}}},
{"id":"n-a44a1421","guard":[["hasAny",["bibliographic","code","language","name","zha"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code zha":"The code zha stands for Zhuang; Chuang."}}},
{"id":"n-a4af833a","guard":[["hasAny",["code","has","ice","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code ice":"The code ice stands for Icelandic."}}},
{"id":"n-a60c2ac8","guard":[["hasAny",["code","iso","language","orm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code orm":"The code orm stands for Oromo."}}},
{"id":"n-a769ce7d","guard":[["has","tib"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code tib":"The code tib stands for Tibetan."}}},
{"id":"n-a9dc84b2","guard":[["hasAny",["bibliographic","code","language","name","uig"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code uig":"The code uig stands for Uighur; Uyghur."}}},
{"id":"n-aad42436","guard":[["hasAny",["code","iso","language","srp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code srp":"The code srp stands for Serbian."}}},
{"id":"n-aae3ca12","guard":[["has","ben"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bengali."]},["sense.lastWord"]],"mem":null},
{"id":"n-ad1d43b3","guard":[["has","uzb"],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Uzbek."]},["sense.lastWord"]],"mem":null},
{"id":"n-ad5fbd92","guard":[["hasAny",["bibliographic","code","language","mac","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code mac":"The code mac stands for Macedonian."}}},
{"id":"n-ad8b1c3f","guard":[["has","nob"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code nob":"The code nob stands for Norwegian Bokmål."}}},
{"id":"n-adf40b98","guard":[["has","xho"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Xhosa."]},["sense.lastWord"]],"mem":null},
{"id":"n-ae2f7a4e","guard":[["has","jav"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code jav":"The code jav stands for Javanese."}}},
{"id":"n-aea67fda","guard":[["hasAny",["code","iso","language","ori"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code ori":"The code ori stands for Oriya."}}},
{"id":"n-aed049be","guard":[["has","oji"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ojibwa."]},["sense.lastWord"]],"mem":null},
{"id":"n-b195fb3e","guard":[["has","hau"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hausa."]},["sense.lastWord"]],"mem":null},
{"id":"n-b2e2b8d3","guard":[["hasAny",["code","iso","language","rum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code rum":"The code rum stands for Romanian; Moldavian; Moldovan."}}},
{"id":"n-b3aa90ab","guard":[["has","uig"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Uighur; Uyghur."]},["sense.lastWord"]],"mem":null},
{"id":"n-b890e49c","guard":[["has","rus"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Russian."]},["sense.lastWord"]],"mem":null},
{"id":"n-b899c1ea","guard":[["hasAny",["cat","code","has","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code cat":"The code cat stands for Catalan; Valencian."}}},
{"id":"n-b8acd82e","guard":[["has","sot"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code sot":"The code sot stands for Sotho, Southern."}}},
{"id":"n-b94d029a","guard":[["hasAny",["bibliographic","code","language","name","ssw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code ssw":"The code ssw stands for Swati."}}},
{"id":"n-ba0dc71f","guard":[["has","tsn"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tswana."]},["sense.lastWord"]],"mem":null},
{"id":"n-ba968286","guard":[["has","iii"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code iii":"The code iii stands for Sichuan Yi; Nuosu."}}},
{"id":"n-bb29dbc3","guard":[["has","dut"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code dut":"The code dut stands for Dutch; Flemish."}}},
{"id":"n-bba28b63","guard":[["has","yor"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Yoruba."]},["sense.lastWord"]],"mem":null},
{"id":"n-bc36acf4","guard":[["hasAny",["code","dut","has","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code dut":"The code dut stands for Dutch; Flemish."}}},
{"id":"n-bca2ee8f","guard":[["hasAny",["bibliographic","code","iii","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code iii":"The code iii stands for Sichuan Yi; Nuosu."}}},
{"id":"n-bd6ce402","guard":[["has","est"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Estonian."]},["sense.lastWord"]],"mem":null},
{"id":"n-bf253240","guard":[["hasAny",["code","iso","language","pli"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code pli":"The code pli stands for Pali."}}},
{"id":"n-c059aceb","guard":[["hasAny",["ava","code","has","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code ava":"The code ava stands for Avaric."}}},
{"id":"n-c195e552","guard":[["has","roh"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Romansh."]},["sense.lastWord"]],"mem":null},
{"id":"n-c2b77764","guard":[["hasAny",["code","has","language","nep","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code nep":"The code nep stands for Nepali."}}},
{"id":"n-c387f80d","guard":[["hasAny",["code","iso","language","lav"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code lav":"The code lav stands for Latvian."}}},
{"id":"n-c6805a24","guard":[["has","ice"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code ice":"The code ice stands for Icelandic."}}},
{"id":"n-c78848de","guard":[["has","fin"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Finnish."]},["sense.lastWord"]],"mem":null},
{"id":"n-c7bba4f5","guard":[["has","glg"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Galician."]},["sense.lastWord"]],"mem":null},
{"id":"n-c88b35b0","guard":[["has","tel"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code tel":"The code tel stands for Telugu."}}},
{"id":"n-ca4cea86","guard":[["hasAny",["code","ger","iso","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code ger":"The code ger stands for German."}}},
{"id":"n-ca7ab4c3","guard":[["hasAny",["code","has","language","mao","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code mao":"The code mao stands for Maori."}}},
{"id":"n-cb2005bf","guard":[["hasAny",["code","has","language","threeletter","vie"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code vie":"The code vie stands for Vietnamese."}}},
{"id":"n-cdcd722b","guard":[["hasAny",["code","iso","language","swe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code swe":"The code swe stands for Swedish."}}},
{"id":"n-d179d635","guard":[["has","nep"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Nepali."]},["sense.lastWord"]],"mem":null},
{"id":"n-d3967b57","guard":[["has","bam"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code bam":"The code bam stands for Bambara."}}},
{"id":"n-d41d0c18","guard":[["has","uig"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code uig":"The code uig stands for Uighur; Uyghur."}}},
{"id":"n-d56b62bd","guard":[["has","ava"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code ava":"The code ava stands for Avaric."}}},
{"id":"n-d6311efa","guard":[["has","vol"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Volapük."]},["sense.lastWord"]],"mem":null},
{"id":"n-d67f9516","guard":[["has","grn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code grn":"The code grn stands for Guarani."}}},
{"id":"n-d703ea60","guard":[["hasAny",["arm","code","iso","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code arm":"The code arm stands for Armenian."}}},
{"id":"n-d73e3dae","guard":[["has","tsn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code tsn":"The code tsn stands for Tswana."}}},
{"id":"n-d79e00cc","guard":[["has","nno"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Norwegian Nynorsk."]},["sense.lastWord"]],"mem":null},
{"id":"n-d7bcf7b4","guard":[["has","wln"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code wln":"The code wln stands for Walloon."}}},
{"id":"n-d8947772","guard":[["hasAny",["code","hun","iso","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code hun":"The code hun stands for Hungarian."}}},
{"id":"n-d8c23f66","guard":[["has","mao"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Maori."]},["sense.lastWord"]],"mem":null},
{"id":"n-da98c819","guard":[["hasAny",["code","glv","has","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code glv":"The code glv stands for Manx."}}},
{"id":"n-dab2c673","guard":[["hasAny",["code","iso","language","sun"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code sun":"The code sun stands for Sundanese."}}},
{"id":"n-dabfbd1f","guard":[["has","ava"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Avaric."]},["sense.lastWord"]],"mem":null},
{"id":"n-dc0c261a","guard":[["hasAny",["code","iso","language","som"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code som":"The code som stands for Somali."}}},
{"id":"n-dfb93226","guard":[["hasAny",["code","iso","language","lit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code lit":"The code lit stands for Lithuanian."}}},
{"id":"n-e01a041b","guard":[["hasAny",["code","has","language","swa","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code swa":"The code swa stands for Swahili."}}},
{"id":"n-e15a2608","guard":[["has","asm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code asm":"The code asm stands for Assamese."}}},
{"id":"n-e15a3240","guard":[["hasAny",["bibliographic","code","language","name","nob"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code nob":"The code nob stands for Norwegian Bokmål."}}},
{"id":"n-e18ac9e4","guard":[["has","kan"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kannada."]},["sense.lastWord"]],"mem":null},
{"id":"n-e25a5df5","guard":[["has","ice"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Icelandic."]},["sense.lastWord"]],"mem":null},
{"id":"n-e45daab0","guard":[["hasAny",["bibliographic","code","language","name","sin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code sin":"The code sin stands for Sinhala; Sinhalese."}}},
{"id":"n-e6ba0c5c","guard":[["has","heb"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hebrew."]},["sense.lastWord"]],"mem":null},
{"id":"n-e8b9a007","guard":[["has","guj"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code guj":"The code guj stands for Gujarati."}}},
{"id":"n-e8cf4d5e","guard":[["hasAny",["bam","code","has","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code bam":"The code bam stands for Bambara."}}},
{"id":"n-e8eed062","guard":[["hasAny",["code","iso","language","per"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code per":"The code per stands for Persian."}}},
{"id":"n-e9b4a9b2","guard":[["hasAny",["code","dzo","iso","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code dzo":"The code dzo stands for Dzongkha."}}},
{"id":"n-eaa0c5e9","guard":[["has","chu"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic."]},["sense.lastWord"]],"mem":null},
{"id":"n-ebf00267","guard":[["has","sin"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sinhala; Sinhalese."]},["sense.lastWord"]],"mem":null},
{"id":"n-ec82833d","guard":[["has","tir"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code tir":"The code tir stands for Tigrinya."}}},
{"id":"n-ed152476","guard":[["hasAny",["bibliographic","code","kan","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code kan":"The code kan stands for Kannada."}}},
{"id":"n-ed471520","guard":[["hasAny",["code","iso","language","por"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code por":"The code por stands for Portuguese."}}},
{"id":"n-ed7a5937","guard":[["has","pan"],["has","language"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Panjabi; Punjabi."]},["sense.lastWord"]],"mem":null},
{"id":"n-ee15c6e2","guard":[["hasAny",["code","est","iso","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code est":"The code est stands for Estonian."}}},
{"id":"n-ef4143db","guard":[["has","cha"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code cha":"The code cha stands for Chamorro."}}},
{"id":"n-ef4dae79","guard":[["hasAny",["chu","code","iso","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code chu":"The code chu stands for Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic."}}},
{"id":"n-f0ffe5cd","guard":[["hasAny",["aze","code","iso","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code aze":"The code aze stands for Azerbaijani."}}},
{"id":"n-f112c43d","guard":[["has","tgl"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tagalog."]},["sense.lastWord"]],"mem":null},
{"id":"n-f2569d1d","guard":[["has","sme"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code sme":"The code sme stands for Northern Sami."}}},
{"id":"n-f455ea0d","guard":[["hasAny",["bibliographic","code","language","name","sot"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code sot":"The code sot stands for Sotho, Southern."}}},
{"id":"n-f45d9c81","guard":[["hasAny",["bibliographic","code","language","lin","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code lin":"The code lin stands for Lingala."}}},
{"id":"n-f5a0b950","guard":[["hasAny",["bibliographic","code","language","name","nau"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code nau":"The code nau stands for Nauru."}}},
{"id":"n-f62754ff","guard":[["has","dut"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Dutch; Flemish."]},["sense.lastWord"]],"mem":null},
{"id":"n-f6c67a23","guard":[["hasAny",["code","has","language","threeletter","ukr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code ukr":"The code ukr stands for Ukrainian."}}},
{"id":"n-f862e753","guard":[["has","baq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which language has the three-letter code baq":"The code baq stands for Basque."}}},
{"id":"n-fb1f58a0","guard":[["hasAny",["code","iso","language","yor"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code yor":"The code yor stands for Yoruba."}}},
{"id":"n-fbfa3d94","guard":[["has","jpn"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Japanese."]},["sense.lastWord"]],"mem":null},
{"id":"n-fca10c43","guard":[["hasAny",["bibliographic","code","fin","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code fin":"The code fin stands for Finnish."}}},
{"id":"n-fcf89d38","guard":[["has","fij"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Fijian."]},["sense.lastWord"]],"mem":null},
{"id":"n-fd35d612","guard":[["has","guj"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Gujarati."]},["sense.lastWord"]],"mem":null},
{"id":"n-fd4e93ca","guard":[["hasAny",["code","heb","iso","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what language is the ISO 639-2 code heb":"The code heb stands for Hebrew."}}},
{"id":"n-fe3f5878","guard":[["hasAny",["baq","code","has","language","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which language has the three-letter code baq":"The code baq stands for Basque."}}},
{"id":"n-fe58c9c2","guard":[["has","por"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Portuguese."]},["sense.lastWord"]],"mem":null},
{"id":"n-feb5a271","guard":[["hasAny",["bibliographic","code","fij","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code fij":"The code fij stands for Fijian."}}},
{"id":"n-ffd48475","guard":[["has","ssw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language with the bibliographic code ssw":"The code ssw stands for Swati."}}},
{"id":"n-0127d690","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kau","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kanuri."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-012c0fb9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fij","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Fijian."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-017e9434","guard":[["hasAny",["invert case","jav","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Javanese."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0264823c","guard":[["hasAny",["alphabetize the letters","chu","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-063a55d6","guard":[["hasAny",["fij","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Fijian."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-07596d89","guard":[["hasAny",["invert case","orm","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Oromo."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0862b82c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","xho"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Xhosa."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0918f9e2","guard":[["hasAny",["afr","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Afrikaans."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-09abe98d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","heb","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hebrew."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0a2daacb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","yor"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Yoruba."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0a9fcbc5","guard":[["hasAny",["invert case","swap case","toggle case","tsn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tswana."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0aefb7e2","guard":[["hasAny",["invert case","swa","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swahili."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0eeffecd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ssw","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swati."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0f8481db","guard":[["hasAny",["shortest","shortest one","shortest word","tir"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tigrinya."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0fa9a18f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","glg","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Galician."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0fdc704c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jav","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Javanese."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1024496f","guard":[["hasAny",["invert case","kau","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kanuri."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-10d3d385","guard":[["hasAny",["kau","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kanuri."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-112a72d3","guard":[["hasAny",["hau","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hausa."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-11bdb5e6","guard":[["hasAny",["invert case","swap case","tib","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tibetan."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-14de3ad9","guard":[["hasAny",["ben","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bengali."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-15ee24cc","guard":[["hasAny",["shortest","shortest one","shortest word","uzb"]],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Uzbek."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-16bf0810","guard":[["hasAny",["glv","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Manx."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-16d8962b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mal","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Malayalam."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1922198b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","glv","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Manx."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1b508b6d","guard":[["hasAny",["invert case","nno","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Norwegian Nynorsk."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1d2e8922","guard":[["hasAny",["invert case","nob","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Norwegian Bokmål."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1eac4031","guard":[["hasAny",["invert case","spa","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Spanish; Castilian."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1f4d3f55","guard":[["hasAny",["alphabetize the letters","fij","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Fijian."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-2328e6c9","guard":[["hasAny",["invert case","swap case","toggle case","uzb"]],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Uzbek."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-23ec1021","guard":[["hasAny",["invert case","kur","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kurdish."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2422cb26","guard":[["hasAny",["invert case","srp","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Serbian."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-28ec4e4d","guard":[["hasAny",["iii","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sichuan Yi; Nuosu."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-292cde39","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sun","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sundanese."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2a393113","guard":[["hasAny",["backwards","iii","mirror","reverse","reversed","spell backwards"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sichuan Yi; Nuosu."]},["transform.reverse",["sense.lastWord"]]],"mem":null},
{"id":"n-2b26f7a8","guard":[["hasAny",["invert case","sun","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sundanese."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2d1dbbc2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lat","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Latin."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2e81b883","guard":[["hasAny",["no vowels","remove vowels","tsn","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tswana."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-2eadc220","guard":[["hasAny",["alphabetize the letters","est","letters in order","sort the letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Estonian."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-31376bb8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","vol"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Volapük."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3160f890","guard":[["hasAny",["invert case","sot","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sotho, Southern."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-32f50b6a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nno","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Norwegian Nynorsk."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3334efec","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tir","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tigrinya."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-335d4a21","guard":[["hasAny",["shortest","shortest one","shortest word","zha"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Zhuang; Chuang."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3484ec3f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","srp","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Serbian."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-35b05022","guard":[["hasAny",["aka","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Akan."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-36186bdf","guard":[["hasAny",["alb","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Albanian."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-36b6343b","guard":[["hasAny",["pan","shortest","shortest one","shortest word"]],["has","language"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Panjabi; Punjabi."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-39cec00f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sna","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Shona."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-39edd4cb","guard":[["hasAny",["invert case","mac","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Macedonian."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-39f35f61","guard":[["hasAny",["invert case","kir","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kirghiz; Kyrgyz."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3a025808","guard":[["hasAny",["capitalise","capitalize","capitalize each word","chu","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3a26c39a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nep","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Nepali."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3a55f9c4","guard":[["hasAny",["invert case","swap case","toggle case","ukr"]],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ukrainian."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3a6bd6bd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pli","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Pali."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3ab9cc9f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","swa","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swahili."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3b7d534b","guard":[["hasAny",["invert case","nep","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Nepali."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3b994789","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hau","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hausa."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3c67cd4a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","est","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Estonian."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3cda16e5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kir","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kirghiz; Kyrgyz."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3ea141ea","guard":[["hasAny",["capitalise","capitalize","capitalize each word","iku","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Inuktitut."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4320c181","guard":[["hasAny",["guj","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Gujarati."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-43526d55","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ice","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Icelandic."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-43866ffa","guard":[["hasAny",["glg","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Galician."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-451c020f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","som","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Somali."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-45aea28d","guard":[["hasAny",["bul","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bulgarian."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-46dd5e17","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kan","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kannada."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4886d0e2","guard":[["hasAny",["bam","capitalise","capitalize","capitalize each word","title case"]],["has","language"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bambara."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-49e08fd7","guard":[["hasAny",["shortest","shortest one","shortest word","vol"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Volapük."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4cbc205c","guard":[["hasAny",["bul","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bulgarian."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4e59f4d6","guard":[["hasAny",["shortest","shortest one","shortest word","sot"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sotho, Southern."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4f83b8da","guard":[["hasAny",["ndo","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ndonga."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4fb42c41","guard":[["hasAny",["ava","backwards","mirror","reverse","reversed","spell backwards"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Avaric."]},["transform.reverse",["sense.lastWord"]]],"mem":null},
{"id":"n-4fd9e4c3","guard":[["hasAny",["invert case","kan","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kannada."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4fdbe2c7","guard":[["hasAny",["invert case","swap case","toggle case","uig"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Uighur; Uyghur."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5081b4d1","guard":[["hasAny",["invert case","sin","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sinhala; Sinhalese."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-52589d0a","guard":[["hasAny",["grn","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Guarani."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-52dcacbe","guard":[["hasAny",["bre","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Breton."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-52e8b27f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","epo","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Esperanto."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-538e150b","guard":[["hasAny",["glv","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Manx."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-54d164de","guard":[["hasAny",["invert case","lat","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Latin."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-54fb48fa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","per","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Persian."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-57dfefea","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tsn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tswana."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5a19b536","guard":[["hasAny",["invert case","pli","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Pali."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5c0a28fd","guard":[["hasAny",["glg","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Galician."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-5c23bd92","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dut","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Dutch; Flemish."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5c40b558","guard":[["hasAny",["invert case","swap case","toggle case","vie"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Vietnamese."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5cb83116","guard":[["hasAny",["no vowels","remove vowels","ssw","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swati."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-5d232fc3","guard":[["hasAny",["invert case","swap case","toggle case","xho"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Xhosa."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5fcb9d93","guard":[["hasAny",["invert case","por","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Portuguese."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-603d2588","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nav","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Navajo; Navaho."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-61199df2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","oji","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ojibwa."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6125db2c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","zha"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Zhuang; Chuang."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-62009a7f","guard":[["hasAny",["shortest","shortest one","shortest word","uig"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Uighur; Uyghur."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-62901d28","guard":[["hasAny",["cre","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Cree."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-646498c9","guard":[["hasAny",["alphabetize the letters","fin","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Finnish."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-64b27486","guard":[["hasAny",["invert case","nav","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Navajo; Navaho."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-67983041","guard":[["hasAny",["capitalise","capitalize","capitalize each word","iii","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sichuan Yi; Nuosu."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-684668d9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sme","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Northern Sami."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6966062c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","grn","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Guarani."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6a2b7fd1","guard":[["hasAny",["invert case","rus","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Russian."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6a3f34a2","guard":[["hasAny",["heb","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hebrew."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6ab0d6cc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lin","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Lingala."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6be570e4","guard":[["hasAny",["est","invert case","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Estonian."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6c8aa543","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ndo","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ndonga."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6d34541a","guard":[["hasAny",["invert case","sme","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Northern Sami."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6dbec109","guard":[["hasAny",["nau","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Nauru."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6dfff985","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","ukr"]],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ukrainian."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6fd110f2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fin","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Finnish."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7000557f","guard":[["hasAny",["alb","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Albanian."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-70684523","guard":[["hasAny",["afr","alphabetize the letters","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Afrikaans."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-732365e0","guard":[["hasAny",["fin","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Finnish."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-746848ce","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tib","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tibetan."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-74f4efa5","guard":[["hasAny",["invert case","swap case","toggle case","tur"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Turkish."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-75640039","guard":[["hasAny",["shortest","shortest one","shortest word","sme"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Northern Sami."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-75a5e11c","guard":[["hasAny",["alphabetize the letters","iku","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Inuktitut."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-783ea6f3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pol","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Polish."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-791c8567","guard":[["hasAny",["fij","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Fijian."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7a6764c9","guard":[["hasAny",["invert case","swap case","toggle case","vol"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Volapük."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7d929dc1","guard":[["hasAny",["invert case","jpn","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Japanese."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7e0ba995","guard":[["hasAny",["invert case","swap case","toggle case","zha"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Zhuang; Chuang."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7e3e574d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","swe","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swedish."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-806ea43d","guard":[["hasAny",["asm","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Assamese."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-80c01706","guard":[["hasAny",["epo","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Esperanto."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-82544779","guard":[["hasAny",["alphabetize the letters","letters in order","sort the letters","ssw"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swati."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-8276ee72","guard":[["hasAny",["grn","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Guarani."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-82e669c0","guard":[["hasAny",["invert case","lim","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Limburgan; Limburger; Limburgish."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-85e608bf","guard":[["hasAny",["capitalise","capitalize","capitalize each word","snd","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sindhi."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-864a089d","guard":[["hasAny",["bul","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bulgarian."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-875c3454","guard":[["hasAny",["invert case","mal","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Malayalam."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-88ac9e51","guard":[["hasAny",["dzo","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Dzongkha."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-88d7c356","guard":[["hasAny",["shortest","shortest one","shortest word","sin"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sinhala; Sinhalese."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8be908cc","guard":[["hasAny",["invert case","nau","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Nauru."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8c140dd4","guard":[["hasAny",["no vowels","remove vowels","snd","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sindhi."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-8c3a049d","guard":[["hasAny",["invert case","swap case","toggle case","yor"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Yoruba."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8caa2b8a","guard":[["hasAny",["ben","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bengali."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8efa4777","guard":[["hasAny",["no vowels","remove vowels","srp","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Serbian."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-8fd0de40","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ori","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Oriya."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-905c3651","guard":[["hasAny",["capitalise","capitalize","capitalize each word","geo","title case"]],["has","language"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Georgian."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9165b10a","guard":[["hasAny",["invert case","pol","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Polish."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-92fca5a2","guard":[["hasAny",["afr","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Afrikaans."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9317c135","guard":[["hasAny",["invert case","mao","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Maori."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-93309def","guard":[["hasAny",["invert case","ori","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Oriya."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-93b992e8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","rum","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Romanian; Moldavian; Moldovan."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-950d126a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hun","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hungarian."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-964f4ce7","guard":[["hasAny",["invert case","roh","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Romansh."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-97f3c57d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cat","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Catalan; Valencian."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9d78e40d","guard":[["hasAny",["ava","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Avaric."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9d7b714d","guard":[["hasAny",["chu","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9dae42d6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","uzb"]],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Uzbek."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9ef6eb40","guard":[["hasAny",["invert case","pan","swap case","toggle case"]],["has","language"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Panjabi; Punjabi."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a02a5c02","guard":[["hasAny",["invert case","sna","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Shona."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a0cb0469","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nob","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Norwegian Bokmål."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a34b2f46","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sin","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sinhala; Sinhalese."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a3960fae","guard":[["hasAny",["ben","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bengali."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a48b949a","guard":[["hasAny",["aze","invert case","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Azerbaijani."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a5b6abec","guard":[["hasAny",["kan","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kannada."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a6aacdea","guard":[["hasAny",["capitalise","capitalize","capitalize each word","por","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Portuguese."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a6d5e158","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tuk"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Turkmen."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a7248ad1","guard":[["hasAny",["nob","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Norwegian Bokmål."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a7a31b59","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","wln"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Walloon."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ab45c288","guard":[["hasAny",["invert case","swap case","toggle case","wln"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Walloon."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ab6d3e0b","guard":[["hasAny",["arm","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Armenian."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ac00e6b1","guard":[["hasAny",["alphabetize the letters","letters in order","nno","sort the letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Norwegian Nynorsk."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-ad2c45b2","guard":[["hasAny",["aka","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Akan."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-adcbecde","guard":[["hasAny",["no vowels","remove vowels","tgl","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tagalog."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-ae6a9dc3","guard":[["hasAny",["no vowels","remove vowels","without vowels","wln"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Walloon."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-af7a4967","guard":[["hasAny",["aze","capitalise","capitalize","capitalize each word","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Azerbaijani."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-afdd015f","guard":[["hasAny",["invert case","que","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Quechua."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b0ba665c","guard":[["hasAny",["bam","invert case","swap case","toggle case"]],["has","language"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bambara."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b0d99fc4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kur","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kurdish."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b1dabeaf","guard":[["hasAny",["hun","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hungarian."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b2657601","guard":[["hasAny",["capitalise","capitalize","capitalize each word","que","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Quechua."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b26ff039","guard":[["hasAny",["nno","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Norwegian Nynorsk."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b3ca5e6d","guard":[["hasAny",["invert case","swap case","swe","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swedish."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b43cd8ad","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pan","title case"]],["has","language"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Panjabi; Punjabi."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b7003da0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tur"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Turkish."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b7bffe72","guard":[["hasAny",["geo","invert case","swap case","toggle case"]],["has","language"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Georgian."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b834eb29","guard":[["hasAny",["her","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Herero."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bb51b6aa","guard":[["hasAny",["ava","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Avaric."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bb83fe49","guard":[["hasAny",["invert case","som","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Somali."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bc2f2b84","guard":[["hasAny",["invert case","per","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Persian."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bee2e72e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","spa","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Spanish; Castilian."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bf5bd658","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tah","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tahitian."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c0abf663","guard":[["hasAny",["invert case","swap case","tir","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tigrinya."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c0e5ac73","guard":[["hasAny",["iku","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Inuktitut."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c137b0a3","guard":[["hasAny",["mac","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Macedonian."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c204c001","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lim","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Limburgan; Limburger; Limburgish."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c233d22f","guard":[["hasAny",["dut","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Dutch; Flemish."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c24d708f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mao","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Maori."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c3a12717","guard":[["hasAny",["capitalise","capitalize","capitalize each word","guj","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Gujarati."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c3bd34bd","guard":[["hasAny",["kir","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kirghiz; Kyrgyz."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c6bc4010","guard":[["hasAny",["invert case","ssw","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swati."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c7112aab","guard":[["hasAny",["invert case","rum","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Romanian; Moldavian; Moldovan."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c745dc0a","guard":[["hasAny",["iku","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Inuktitut."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c74ff696","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","uig"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Uighur; Uyghur."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cae9b263","guard":[["hasAny",["capitalise","capitalize","capitalize each word","rus","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Russian."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cc36638c","guard":[["hasAny",["alphabetize the letters","iii","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sichuan Yi; Nuosu."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-ccc5f2e6","guard":[["hasAny",["asm","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Assamese."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cf145587","guard":[["hasAny",["cat","invert case","swap case","toggle case"]],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Catalan; Valencian."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-cfc1f7fa","guard":[["hasAny",["baq","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Basque."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d10ff1d8","guard":[["hasAny",["alphabetize the letters","ben","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bengali."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-d188cbdd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ger","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for German."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d60a05c5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","orm","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Oromo."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d613bac5","guard":[["hasAny",["ice","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Icelandic."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d613f608","guard":[["hasAny",["invert case","lit","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Lithuanian."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d61f1bb3","guard":[["hasAny",["jpn","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Japanese."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d7a65aa0","guard":[["hasAny",["ger","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for German."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d83b3181","guard":[["hasAny",["shortest","shortest one","shortest word","tsn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tswana."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-db5a7825","guard":[["hasAny",["cha","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Chamorro."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-dc59dc77","guard":[["hasAny",["jpn","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Japanese."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-de0f3aff","guard":[["hasAny",["invert case","lav","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Latvian."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e0629a94","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dzo","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Dzongkha."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e2303b26","guard":[["hasAny",["shortest","shortest one","shortest word","tel"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Telugu."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e2b4761b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lit","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Lithuanian."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e2bc7fee","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lav","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Latvian."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e3bdb607","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sot","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sotho, Southern."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e4fca5ee","guard":[["hasAny",["invert case","swap case","tgl","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tagalog."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e5f28ce6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cre","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Cree."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e6ef6f07","guard":[["hasAny",["iii","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sichuan Yi; Nuosu."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e99435d3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","her","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Herero."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e9ce1800","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jpn","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Japanese."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ea067fa9","guard":[["hasAny",["oji","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ojibwa."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ea5d378f","guard":[["hasAny",["invert case","lin","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Lingala."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-eae7917f","guard":[["hasAny",["invert case","swap case","toggle case","tuk"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Turkmen."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-edccdc70","guard":[["hasAny",["invert case","swap case","tah","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tahitian."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-edf05aa0","guard":[["hasAny",["fin","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Finnish."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ef5326ce","guard":[["hasAny",["aka","backwards","mirror","reverse","reversed","spell backwards"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Akan."]},["transform.reverse",["sense.lastWord"]]],"mem":null},
{"id":"n-ef5ca81b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nau","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Nauru."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f051a977","guard":[["hasAny",["invert case","ndo","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ndonga."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f10ac223","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mac","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Macedonian."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f161fd3d","guard":[["hasAny",["alphabetize the letters","glv","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Manx."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-f16a0832","guard":[["hasAny",["invert case","oji","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ojibwa."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f2d62e1f","guard":[["hasAny",["lin","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Lingala."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f59eaae1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","vie"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Vietnamese."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f684dd86","guard":[["hasAny",["bre","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Breton."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f7983df5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","roh","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Romansh."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f7d03f3c","guard":[["hasAny",["baq","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Basque."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f824d798","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tgl","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tagalog."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f9f4e95c","guard":[["hasAny",["pol","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Polish."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fa987c24","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tel","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Telugu."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-faff25a7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cha","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Chamorro."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fbfbdbef","guard":[["hasAny",["shortest","shortest one","shortest word","tgl"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tagalog."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fc1ed5ba","guard":[["hasAny",["shortest","shortest one","shortest word","ssw"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swati."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fd150dd6","guard":[["hasAny",["arm","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Armenian."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fd83cda5","guard":[["hasAny",["invert case","swap case","tel","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Telugu."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-fe337ddf","guard":[["hasAny",["invert case","snd","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sindhi."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-fe48797b","guard":[["hasAny",["aka","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Akan."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-02e188d2","guard":[["hasAny",["baq","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Basque."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-02eec66d","guard":[["hasAny",["each word","mal","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Malayalam."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0461cf37","guard":[["hasAny",["each word","split into words","tur"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Turkish."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-065a45c8","guard":[["hasAny",["each word","fij","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Fijian."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-06a9df11","guard":[["hasAny",["each word","split into words","wln"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Walloon."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-06aaf05b","guard":[["hasAny",["each word","oji","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ojibwa."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-06bff7b5","guard":[["hasAny",["each word","rum","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Romanian; Moldavian; Moldovan."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0838047f","guard":[["hasAny",["each word","oji","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ojibwa."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-089f1463","guard":[["hasAny",["each word","nep","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Nepali."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-09df45d7","guard":[["hasAny",["each word","per","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Persian."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0cf598d4","guard":[["hasAny",["ben","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bengali."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0d6f5e3c","guard":[["hasAny",["dzo","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Dzongkha."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0e843643","guard":[["hasAny",["each word","kau","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kanuri."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0f66cf8e","guard":[["hasAny",["each word","pli","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Pali."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0f7f7b53","guard":[["hasAny",["each word","mac","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Macedonian."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-104a2700","guard":[["hasAny",["chu","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-10a53e5f","guard":[["hasAny",["dut","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Dutch; Flemish."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-115981c6","guard":[["hasAny",["each word","split into words","vie"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Vietnamese."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-149d6182","guard":[["hasAny",["each word","por","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Portuguese."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-15cfa833","guard":[["hasAny",["normalise","normalize","pli","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Pali."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-15db75d2","guard":[["hasAny",["each word","split into words","tsn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tswana."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-17c709d2","guard":[["hasAny",["each word","iku","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Inuktitut."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-17d5e7df","guard":[["hasAny",["each word","iii","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sichuan Yi; Nuosu."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-18d2077e","guard":[["hasAny",["each word","split into words","wln"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Walloon."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1b960961","guard":[["hasAny",["cha","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Chamorro."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1c1990d2","guard":[["hasAny",["glg","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Galician."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-21faf529","guard":[["hasAny",["each word","ndo","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ndonga."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-223ece6a","guard":[["hasAny",["each word","nep","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Nepali."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2255f6a8","guard":[["hasAny",["aze","each word","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Azerbaijani."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-228b7ee1","guard":[["hasAny",["afr","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Afrikaans."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2389b212","guard":[["hasAny",["ava","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Avaric."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-240bdf2d","guard":[["hasAny",["each word","split into words","tel"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Telugu."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-26517a53","guard":[["hasAny",["each word","lav","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Latvian."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2848032b","guard":[["hasAny",["each word","ori","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Oriya."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-297229c1","guard":[["hasAny",["afr","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Afrikaans."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-29baa9a8","guard":[["hasAny",["each word","split into words","xho"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Xhosa."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2ae46cf7","guard":[["hasAny",["each word","som","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Somali."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2ae7d82b","guard":[["hasAny",["normalise","normalize","simplify the text","spa"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Spanish; Castilian."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-2b0ffc69","guard":[["hasAny",["aka","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Akan."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2cadaa74","guard":[["hasAny",["dzo","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Dzongkha."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2edeac24","guard":[["hasAny",["each word","split into words","tib"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tibetan."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3015db0b","guard":[["hasAny",["each word","split into words","uzb"]],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Uzbek."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-31c694a0","guard":[["hasAny",["cre","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Cree."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-31d81c09","guard":[["hasAny",["normalise","normalize","simplify the text","tur"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Turkish."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-33be52e0","guard":[["hasAny",["each word","split into words","ukr"]],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ukrainian."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-33f4c35e","guard":[["hasAny",["each word","ndo","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ndonga."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-34523aa2","guard":[["hasAny",["each word","guj","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Gujarati."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-35d452b7","guard":[["hasAny",["each word","split into words","uzb"]],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Uzbek."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-36d55326","guard":[["hasAny",["each word","split into words","uig"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Uighur; Uyghur."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-37564f3a","guard":[["hasAny",["each word","orm","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Oromo."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-37aa39cb","guard":[["hasAny",["each word","pol","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Polish."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3845d3b8","guard":[["hasAny",["each word","ger","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for German."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-385b980a","guard":[["hasAny",["each word","sna","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Shona."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3a5f9b12","guard":[["hasAny",["each word","guj","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Gujarati."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3a6ee6c9","guard":[["hasAny",["each word","glg","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Galician."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3d270b68","guard":[["hasAny",["each word","snd","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sindhi."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3dbb9bed","guard":[["hasAny",["each word","nno","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Norwegian Nynorsk."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3f30540c","guard":[["hasAny",["each word","iku","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Inuktitut."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3f383458","guard":[["hasAny",["each word","split into words","sun"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sundanese."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3fba4254","guard":[["hasAny",["bul","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bulgarian."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-413665bd","guard":[["hasAny",["each word","kau","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kanuri."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4203ad88","guard":[["hasAny",["each word","ori","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Oriya."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-446c866a","guard":[["hasAny",["arm","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Armenian."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-44f4e0e1","guard":[["hasAny",["each word","hun","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hungarian."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-45301d62","guard":[["hasAny",["normalise","normalize","simplify the text","yor"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Yoruba."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-454052f7","guard":[["hasAny",["each word","nno","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Norwegian Nynorsk."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-474cdf0a","guard":[["hasAny",["bul","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bulgarian."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-47ac2ac7","guard":[["hasAny",["aze","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Azerbaijani."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-47b5c55e","guard":[["hasAny",["each word","sna","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Shona."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-48a49d07","guard":[["hasAny",["each word","split into words","ssw"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swati."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-49ec0d85","guard":[["hasAny",["each word","que","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Quechua."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4a2db77f","guard":[["hasAny",["bam","each word","split into words"]],["has","language"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bambara."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4a3d6b9f","guard":[["hasAny",["asm","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Assamese."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4aa4e357","guard":[["hasAny",["each word","nob","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Norwegian Bokmål."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4b32a871","guard":[["hasAny",["each word","kur","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kurdish."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4db75f77","guard":[["hasAny",["each word","split into words","ukr"]],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ukrainian."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-50376d22","guard":[["hasAny",["each word","split into words","tah"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tahitian."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-52cf54a1","guard":[["hasAny",["each word","fin","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Finnish."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-53cf892d","guard":[["hasAny",["normalise","normalize","simplify the text","tah"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tahitian."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-54ada534","guard":[["hasAny",["each word","som","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Somali."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-55030b1e","guard":[["hasAny",["arm","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Armenian."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-56f98d49","guard":[["hasAny",["each word","lin","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Lingala."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-57b9de8a","guard":[["hasAny",["each word","split into words","tgl"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tagalog."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-588d04cd","guard":[["hasAny",["each word","split into words","sun"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sundanese."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-58b23d64","guard":[["hasAny",["bre","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Breton."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-58fa857a","guard":[["hasAny",["each word","split into words","tuk"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Turkmen."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5947238c","guard":[["hasAny",["normalise","normalize","roh","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Romansh."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-5a662f7e","guard":[["hasAny",["each word","sme","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Northern Sami."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5a96e345","guard":[["hasAny",["bre","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Breton."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5c401fcd","guard":[["hasAny",["each word","split into words","vol"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Volapük."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5e4bada7","guard":[["hasAny",["normalise","normalize","simplify the text","som"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Somali."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-5f06a71f","guard":[["hasAny",["each word","jpn","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Japanese."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5f7a52d0","guard":[["hasAny",["each word","lav","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Latvian."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-61357c1c","guard":[["hasAny",["each word","mao","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Maori."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6184f39d","guard":[["hasAny",["each word","spa","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Spanish; Castilian."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-620096dd","guard":[["hasAny",["each word","pan","split into words"]],["has","language"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Panjabi; Punjabi."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-622217bc","guard":[["hasAny",["each word","fij","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Fijian."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6247ff69","guard":[["hasAny",["each word","kir","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kirghiz; Kyrgyz."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6255fa78","guard":[["hasAny",["est","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Estonian."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-6309cb18","guard":[["hasAny",["each word","orm","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Oromo."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-651dd4b1","guard":[["hasAny",["each word","mal","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Malayalam."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-655785c6","guard":[["hasAny",["each word","ice","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Icelandic."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-655f7888","guard":[["hasAny",["alb","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Albanian."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-658621a7","guard":[["hasAny",["each word","split into words","vie"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Vietnamese."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-68c2c06c","guard":[["hasAny",["cat","each word","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Catalan; Valencian."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-68e57974","guard":[["hasAny",["each word","split into words","vol"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Volapük."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6951077a","guard":[["hasAny",["each word","iii","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sichuan Yi; Nuosu."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6aabfec3","guard":[["hasAny",["each word","split into words","swe"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swedish."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6ae15ce1","guard":[["hasAny",["each word","jav","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Javanese."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6ccb99a6","guard":[["hasAny",["each word","lat","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Latin."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6d0f928a","guard":[["hasAny",["each word","rus","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Russian."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6d939095","guard":[["hasAny",["each word","per","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Persian."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6e95c5db","guard":[["hasAny",["normalise","normalize","simplify the text","sna"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Shona."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-6fb0fbf6","guard":[["hasAny",["each word","lit","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Lithuanian."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6fd6772f","guard":[["hasAny",["each word","split into words","tgl"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tagalog."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-703d5f1c","guard":[["hasAny",["each word","glg","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Galician."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-713d21c6","guard":[["hasAny",["each word","grn","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Guarani."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-72850cc5","guard":[["hasAny",["each word","split into words","tel"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Telugu."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-73039f12","guard":[["hasAny",["each word","split into words","zha"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Zhuang; Chuang."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7311dd6b","guard":[["hasAny",["each word","pli","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Pali."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-731dcdc5","guard":[["hasAny",["each word","split into words","uig"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Uighur; Uyghur."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-73a74c7b","guard":[["hasAny",["each word","hau","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hausa."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-740d1dee","guard":[["hasAny",["each word","kur","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kurdish."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-745219c0","guard":[["hasAny",["each word","lim","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Limburgan; Limburger; Limburgish."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-762c55b6","guard":[["hasAny",["each word","heb","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hebrew."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-76803189","guard":[["hasAny",["normalise","normalize","que","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Quechua."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-77fd8189","guard":[["hasAny",["each word","heb","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hebrew."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-79ae42b2","guard":[["hasAny",["dzo","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Dzongkha."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-79fe6ce5","guard":[["hasAny",["each word","sot","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sotho, Southern."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7a2a410f","guard":[["hasAny",["each word","grn","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Guarani."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7bb9bb80","guard":[["hasAny",["cre","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Cree."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-80d27574","guard":[["hasAny",["each word","rum","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Romanian; Moldavian; Moldovan."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8582c5b7","guard":[["hasAny",["each word","sme","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Northern Sami."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-86462142","guard":[["hasAny",["each word","est","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Estonian."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8a569025","guard":[["hasAny",["asm","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Assamese."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8e20121e","guard":[["hasAny",["each word","sin","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sinhala; Sinhalese."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-90d5bad6","guard":[["hasAny",["each word","hun","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hungarian."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-914c2e29","guard":[["hasAny",["each word","split into words","swa"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swahili."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-92245979","guard":[["hasAny",["each word","jav","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Javanese."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-928ca9c3","guard":[["hasAny",["each word","nau","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Nauru."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-938f6bfd","guard":[["hasAny",["each word","rus","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Russian."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-94bb9e73","guard":[["hasAny",["each word","split into words","tur"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Turkish."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-94c362f1","guard":[["hasAny",["each word","split into words","tuk"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Turkmen."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9549cf92","guard":[["hasAny",["each word","geo","split into words"]],["has","language"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Georgian."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-95edb422","guard":[["hasAny",["each word","geo","split into words"]],["has","language"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Georgian."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-98294109","guard":[["hasAny",["each word","kir","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kirghiz; Kyrgyz."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9855b86a","guard":[["hasAny",["each word","split into words","tsn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tswana."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-98e51683","guard":[["hasAny",["each word","roh","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Romansh."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9db43da3","guard":[["hasAny",["normalise","normalize","simplify the text","srp"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Serbian."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-a025f298","guard":[["hasAny",["each word","mao","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Maori."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a07c7b58","guard":[["hasAny",["each word","nob","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Norwegian Bokmål."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a22429d3","guard":[["hasAny",["each word","sot","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sotho, Southern."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a39eb193","guard":[["hasAny",["cre","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Cree."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a3e1b853","guard":[["hasAny",["each word","nav","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Navajo; Navaho."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a4d36091","guard":[["hasAny",["each word","hau","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hausa."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a663fcfa","guard":[["hasAny",["ger","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for German."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-a67e302f","guard":[["hasAny",["each word","pan","split into words"]],["has","language"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Panjabi; Punjabi."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-aa044d85","guard":[["hasAny",["hun","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hungarian."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-aa3a74c8","guard":[["hasAny",["cha","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Chamorro."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-aaeea1fd","guard":[["hasAny",["each word","nau","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Nauru."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-adad723d","guard":[["hasAny",["each word","split into words","yor"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Yoruba."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b307d6fe","guard":[["hasAny",["each word","lin","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Lingala."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b30aa90a","guard":[["hasAny",["chu","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b32001dc","guard":[["hasAny",["each word","glv","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Manx."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b4996bd9","guard":[["hasAny",["arm","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Armenian."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b6a47d7a","guard":[["hasAny",["normalise","normalize","rum","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Romanian; Moldavian; Moldovan."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-b6d9ba0f","guard":[["hasAny",["normalise","normalize","simplify the text","swe"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swedish."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-b6f198dc","guard":[["hasAny",["each word","ice","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Icelandic."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b81c69ee","guard":[["hasAny",["each word","ger","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for German."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b8d6a4a8","guard":[["hasAny",["each word","est","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Estonian."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bd171583","guard":[["hasAny",["baq","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Basque."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bd6963d0","guard":[["hasAny",["normalise","normalize","simplify the text","snd"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sindhi."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-bdb749e9","guard":[["hasAny",["each word","jpn","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Japanese."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-be096718","guard":[["hasAny",["each word","split into words","swa"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swahili."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-be38553a","guard":[["hasAny",["each word","split into words","srp"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Serbian."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-be88d188","guard":[["hasAny",["aze","each word","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Azerbaijani."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c0e19072","guard":[["hasAny",["each word","her","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Herero."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c0fe7089","guard":[["hasAny",["each word","split into words","tib"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tibetan."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c157a4d9","guard":[["hasAny",["cat","each word","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Catalan; Valencian."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c1c3edbd","guard":[["hasAny",["each word","sin","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sinhala; Sinhalese."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c20297e0","guard":[["hasAny",["each word","split into words","tah"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tahitian."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c24ed3e0","guard":[["hasAny",["normalise","normalize","por","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Portuguese."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-c3103c97","guard":[["hasAny",["bam","each word","split into words"]],["has","language"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bambara."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c3ff4325","guard":[["hasAny",["ava","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Avaric."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c7998746","guard":[["hasAny",["normalise","normalize","simplify the text","sun"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sundanese."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-c7c56aeb","guard":[["hasAny",["each word","spa","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Spanish; Castilian."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ca63562a","guard":[["hasAny",["lav","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Latvian."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-cb5ac32d","guard":[["hasAny",["each word","snd","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sindhi."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cd336b1f","guard":[["hasAny",["each word","split into words","srp"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Serbian."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ce4a6b17","guard":[["hasAny",["normalise","normalize","orm","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Oromo."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-ce5ac9b1","guard":[["hasAny",["each word","kan","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kannada."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ced1ee46","guard":[["hasAny",["each word","split into words","yor"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Yoruba."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cf1e04c7","guard":[["hasAny",["each word","epo","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Esperanto."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d3b4376c","guard":[["hasAny",["chu","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-d3c98c0c","guard":[["hasAny",["each word","fin","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Finnish."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d5f60808","guard":[["hasAny",["dut","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Dutch; Flemish."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d6d4e8d8","guard":[["hasAny",["ben","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Bengali."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d7a59104","guard":[["hasAny",["each word","mac","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Macedonian."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d80cee61","guard":[["hasAny",["each word","kan","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Kannada."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d9de22fd","guard":[["hasAny",["each word","split into words","zha"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Zhuang; Chuang."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dcd00522","guard":[["hasAny",["aka","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Akan."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dd39a239","guard":[["hasAny",["normalise","normalize","ori","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Oriya."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-dee5db72","guard":[["hasAny",["heb","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hebrew."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-df898aff","guard":[["hasAny",["each word","por","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Portuguese."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e10f5d5c","guard":[["hasAny",["each word","lat","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Latin."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e1f16282","guard":[["hasAny",["alb","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Albanian."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e432d3e3","guard":[["hasAny",["bre","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Breton."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-e5bf9790","guard":[["hasAny",["each word","roh","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Romansh."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e73bd61e","guard":[["hasAny",["each word","split into words","xho"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Xhosa."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e7e11444","guard":[["hasAny",["each word","split into words","ssw"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swati."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e9fedd85","guard":[["hasAny",["each word","lim","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Limburgan; Limburger; Limburgish."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ea4383ad","guard":[["hasAny",["each word","split into words","tir"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tigrinya."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ec893cc0","guard":[["hasAny",["each word","lit","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Lithuanian."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-efedf9f4","guard":[["hasAny",["lit","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Lithuanian."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-f1036c5f","guard":[["hasAny",["each word","split into words","tir"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tigrinya."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f1c2fdf5","guard":[["hasAny",["each word","epo","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Esperanto."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f2a72127","guard":[["hasAny",["each word","split into words","swe"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swedish."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f37503f2","guard":[["hasAny",["each word","glv","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Manx."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f5198fe7","guard":[["hasAny",["normalise","normalize","per","simplify the text"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Persian."]},["transform.norm",["sense.lastWord"],["sense.second"]]],"mem":null},
{"id":"n-f6447ee9","guard":[["hasAny",["each word","que","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Quechua."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f93cadae","guard":[["hasAny",["each word","nav","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Navajo; Navaho."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fe8a2fbe","guard":[["hasAny",["each word","her","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Herero."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ff8d8dbb","guard":[["hasAny",["each word","pol","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Polish."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-04245fa4","guard":[["hasAny",["dzo","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Dzongkha."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-081ba755","guard":[["hasAny",["aze","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Azerbaijani."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-08e32024","guard":[["hasAny",["separate by","split","split by","srp"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Serbian."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-0bfeeb5b","guard":[["hasAny",["chu","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-0c80fe0f","guard":[["hasAny",["pli","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Pali."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-0db685ad","guard":[["hasAny",["ori","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Oriya."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-0df972f5","guard":[["hasAny",["separate by","split","split by","yor"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Yoruba."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-0e737e54","guard":[["hasAny",["que","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Quechua."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-1a1800c1","guard":[["hasAny",["arm","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Armenian."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-1b0f5c20","guard":[["hasAny",["separate by","split","split by","yor"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Yoruba."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-20ff92a4","guard":[["hasAny",["separate by","sna","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Shona."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-24af8957","guard":[["hasAny",["bre","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Breton."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-27eae9fd","guard":[["hasAny",["per","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Persian."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-2c90d167","guard":[["hasAny",["separate by","split","split by","tah"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tahitian."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-3563c419","guard":[["hasAny",["separate by","som","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Somali."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-3662ca76","guard":[["hasAny",["pli","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Pali."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-37bbfe34","guard":[["hasAny",["chu","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-3ff1e837","guard":[["hasAny",["hun","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hungarian."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-44f76f63","guard":[["hasAny",["heb","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hebrew."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-45c872a2","guard":[["hasAny",["orm","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Oromo."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-4c58a85c","guard":[["hasAny",["separate by","split","split by","swe"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swedish."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-54579c4e","guard":[["hasAny",["orm","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Oromo."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-577573c4","guard":[["hasAny",["lit","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Lithuanian."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-5aa7c668","guard":[["hasAny",["aze","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Azerbaijani."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-5b34dd6e","guard":[["hasAny",["ori","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Oriya."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-5cf017ad","guard":[["hasAny",["bre","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Breton."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-5ec64c3e","guard":[["hasAny",["separate by","som","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Somali."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-60f9ac09","guard":[["hasAny",["cre","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Cree."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-64ee38c0","guard":[["hasAny",["ger","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for German."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-67657de3","guard":[["hasAny",["arm","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Armenian."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-6c491839","guard":[["hasAny",["cre","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Cree."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-70d92a4c","guard":[["hasAny",["lit","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Lithuanian."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-785db709","guard":[["hasAny",["rum","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Romanian; Moldavian; Moldovan."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-79188cc2","guard":[["hasAny",["separate by","snd","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sindhi."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-7afba40d","guard":[["hasAny",["heb","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hebrew."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-7dd89253","guard":[["hasAny",["per","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Persian."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-8636220e","guard":[["hasAny",["separate by","snd","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sindhi."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-8ac13817","guard":[["hasAny",["glg","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Galician."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-938ccdfa","guard":[["hasAny",["roh","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Romansh."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-93940a21","guard":[["hasAny",["rum","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Romanian; Moldavian; Moldovan."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-9689bc3d","guard":[["hasAny",["separate by","sna","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Shona."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-9e4603f3","guard":[["hasAny",["separate by","spa","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Spanish; Castilian."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-a52c564f","guard":[["hasAny",["hun","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Hungarian."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-a80e1d04","guard":[["hasAny",["separate by","spa","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Spanish; Castilian."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-aca5d081","guard":[["hasAny",["separate by","split","split by","tur"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Turkish."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-aeb8f761","guard":[["hasAny",["dzo","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Dzongkha."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-b240e1e5","guard":[["hasAny",["por","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Portuguese."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-b38981fa","guard":[["hasAny",["lav","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Latvian."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-b6f35ee0","guard":[["hasAny",["separate by","split","split by","tur"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Turkish."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-c0fce44b","guard":[["hasAny",["separate by","split","split by","sun"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sundanese."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-c19b22e0","guard":[["hasAny",["ger","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for German."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-c43a1610","guard":[["hasAny",["que","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Quechua."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-d234d7cf","guard":[["hasAny",["separate by","split","split by","tah"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Tahitian."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-d6a4b800","guard":[["hasAny",["separate by","split","split by","srp"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Serbian."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-dd9501ab","guard":[["hasAny",["separate by","split","split by","sun"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sundanese."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-e146eda7","guard":[["hasAny",["roh","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Romansh."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-e444017d","guard":[["hasAny",["separate by","split","split by","swe"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Swedish."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-e58e9e05","guard":[["hasAny",["glg","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Galician."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-e8be23fb","guard":[["hasAny",["por","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Portuguese."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-e9cb989a","guard":[["hasAny",["lav","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Latvian."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-f75f2136","guard":[["hasAny",["est","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Estonian."]},["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null},
{"id":"n-ff76ed2f","guard":[["hasAny",["est","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Estonian."]},["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which language has the three-letter code hau","expect":{"contains":["Hausa"],"notRefusal":true}},{"q":"what language is the ISO 639-2 code dzo","expect":{"contains":["Dzongkha"],"notRefusal":true}},{"q":"which language has the three-letter code dut","expect":{"contains":["Dutch; Flemish"],"notRefusal":true}},{"q":"what language is the ISO 639-2 code orm","expect":{"contains":["Oromo"],"notRefusal":true}},{"q":"name the language with the bibliographic code uzb","expect":{"contains":["Uzbek"],"notRefusal":true}},{"q":"which language has the three-letter code cha","expect":{"contains":["Chamorro"],"notRefusal":true}},{"q":"name the language with the bibliographic code nob","expect":{"contains":["Norwegian Bokmål"],"notRefusal":true}},{"q":"which language has the three-letter code ukr","expect":{"contains":["Ukrainian"],"notRefusal":true}},{"q":"what language is the ISO 639-2 code pli","expect":{"contains":["Pali"],"notRefusal":true}},{"q":"which language has the three-letter code alb","expect":{"contains":["Albanian"],"notRefusal":true}},{"q":"which language has the three-letter code vie","expect":{"contains":["Vietnamese"],"notRefusal":true}},{"q":"name the language with the bibliographic code ben","expect":{"contains":["Bengali"],"notRefusal":true}},{"q":"what language is the ISO 639-2 code lit","expect":{"contains":["Lithuanian"],"notRefusal":true}},{"q":"name the language with the bibliographic code sme","expect":{"contains":["Northern Sami"],"notRefusal":true}},{"q":"which language has the three-letter code ava","expect":{"contains":["Avaric"],"notRefusal":true}},{"q":"which language has the three-letter code bam","expect":{"contains":["Bambara"],"notRefusal":true}},{"q":"what language is the ISO 639-2 code glg","expect":{"contains":["Galician"],"notRefusal":true}},{"q":"what language is the ISO 639-2 code snd","expect":{"contains":["Sindhi"],"notRefusal":true}},{"q":"what language is the ISO 639-2 code swe","expect":{"contains":["Swedish"],"notRefusal":true}},{"q":"what language is the ISO 639-2 code cre","expect":{"contains":["Cree"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
