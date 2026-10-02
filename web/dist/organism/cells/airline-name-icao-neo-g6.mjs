// airline-name-icao-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"airline-name-icao-neo-g6","class":"airline-name-icao","generation":6,"lane":"neo","grownFrom":["which ICAO code does One Two Go Airlines fly under","give the three-letter airline code of Ibex Airlines","which ICAO code does Bering Air fly under","what is the ICAO code of MIAT Mongolian Airlines","which ICAO code does Apache Air fly under","give the three-letter airline code of Malmo Aviation","what is the ICAO code of Blue1","what is the ICAO code of Lao Airlines","which ICAO code does ZABAIKAL AIRLINES fly under","what is the ICAO code of Buquebus Líneas Aéreas","which ICAO code does Air Wisconsin fly under","what is the ICAO code of Portugalia","which ICAO code does Holidays Czech Airlines fly under","which ICAO code does Korongo Airlines fly under","which ICAO code does ATUR fly under","give the three-letter airline code of GX Airlines","what is the ICAO code of LAN Argentina","what is the ICAO code of TransBrasil Airlines","which ICAO code does Andalus Lineas Aereas fly under","give the three-letter airline code of Red Wings"],"version":1});

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
{"id":"n-9c895c16","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does One Two Go Airlines fly under":"OTG","give the three-letter airline code of Ibex Airlines":"IBX","which ICAO code does Bering Air fly under":"BRG","what is the ICAO code of MIAT Mongolian Airlines":"MGL","which ICAO code does Apache Air fly under":"IWA","give the three-letter airline code of Malmo Aviation":"SCW","what is the ICAO code of Blue1":"BLF","what is the ICAO code of Lao Airlines":"LAO","which ICAO code does ZABAIKAL AIRLINES fly under":"ZTT","what is the ICAO code of Buquebus Líneas Aéreas":"BQB","which ICAO code does Air Wisconsin fly under":"AWI","what is the ICAO code of Portugalia":"PGA","which ICAO code does Holidays Czech Airlines fly under":"HCC","which ICAO code does Korongo Airlines fly under":"KGO","which ICAO code does ATUR fly under":"TUR","give the three-letter airline code of GX Airlines":"CBG","what is the ICAO code of LAN Argentina":"DSM","what is the ICAO code of TransBrasil Airlines":"THS","which ICAO code does Andalus Lineas Aereas fly under":"ANU","give the three-letter airline code of Red Wings":"RWZ","which ICAO code does Eritrean Airlines fly under":"ERT","what is the ICAO code of Grand Cru Airlines":"GCA","what is the ICAO code of Mandala Airlines":"MDL","give the three-letter airline code of Sky Regional":"SKV","what is the ICAO code of Line Blue":"LBL","which ICAO code does Golden Air fly under":"GAO","give the three-letter airline code of Express One International":"LHN","give the three-letter airline code of Air Florida":"FLZ","give the three-letter airline code of Shuttle America":"TCF","what is the ICAO code of MNG Airlines":"MNB","which ICAO code does Hainan Airlines fly under":"CHH","which ICAO code does SeaPort Airlines fly under":"SQH","give the three-letter airline code of Southern Airways Express":"LTD","what is the ICAO code of Air Madagascar":"MDG","what is the ICAO code of Kam Air":"KMF","what is the ICAO code of German International Air Lines":"GER","give the three-letter airline code of Air Southwest":"WOW","which ICAO code does Nationwide Airlines fly under":"NTW","what is the ICAO code of Air Japan":"AJX","which ICAO code does Hankook Airline fly under":"HNX","which ICAO code does Hamburg International fly under":"HHI","give the three-letter airline code of JALways":"JAZ","which ICAO code does Air China fly under":"CCA","which ICAO code does Privatair fly under":"PTI","which ICAO code does Air Chathams fly under":"CVA","give the three-letter airline code of Belavia Belarusian Airlines":"BRU","what is the ICAO code of Macair Airlines":"MCK","which ICAO code does Hamburg Airways fly under":"HAY","which ICAO code does TUIfly fly under":"HLX","what is the ICAO code of Jettor Airlines":"JTO","give the three-letter airline code of Welcome Air":"WLC","what is the ICAO code of Fars Air Qeshm":"QFZ","what is the ICAO code of Svyaz Rossiya":"SJM","give the three-letter airline code of Calima Aviacion":"CLI","what is the ICAO code of SunExpress":"SXS","give the three-letter airline code of Pacific Wings":"NMI","give the three-letter airline code of Turkish Airlines":"THY","give the three-letter airline code of Mesa Airlines":"ASH","give the three-letter airline code of City Airline":"SDR","what is the ICAO code of ATA Airlines":"AMT","what is the ICAO code of Compass Airlines":"CPZ","give the three-letter airline code of Potomac Air":"PDC","what is the ICAO code of Kuzu Airlines Cargo":"KZU","what is the ICAO code of Brussels Airlines":"DAT","give the three-letter airline code of Aereonautica militare":"AXZ","give the three-letter airline code of Malta Air Charter":"MAC","give the three-letter airline code of El Al Israel Airlines":"ELY","which ICAO code does Xiamen Airlines fly under":"CXA","what is the ICAO code of Aerolineas Argentinas":"ARG","what is the ICAO code of Kush Air":"KUH","give the three-letter airline code of Jet Suite":"RSP","give the three-letter airline code of Sky Airline":"SKU","what is the ICAO code of Himalayan Airlines":"HYM","which ICAO code does Air India Express fly under":"AXB","give the three-letter airline code of Spanair":"JKK","which ICAO code does Flybe Finland Oy fly under":"FCM","which ICAO code does Fly540 fly under":"FFV","what is the ICAO code of Ryan International Airlines":"RYN","what is the ICAO code of Meridiana":"ISS","which ICAO code does Wizz Air Hungary fly under":"WVL","which ICAO code does Shenzhen Airlines fly under":"CSZ","which ICAO code does Dynamic Airways fly under":"DYA","give the three-letter airline code of PLUNA":"PUA","what is the ICAO code of Air KBZ":"KBZ","what is the ICAO code of Air Explore":"AXE","give the three-letter airline code of WebJet Linhas A":"WEB","what is the ICAO code of Mauritania Airways":"MTW","give the three-letter airline code of Air Lituanica":"LTU","which ICAO code does SATENA fly under":"NSE","give the three-letter airline code of Denim Air":"DNM","which ICAO code does Domodedovo Airlines fly under":"DMO","which ICAO code does LTU Austria fly under":"LTO","give the three-letter airline code of Air Cudlua":"CUD","which ICAO code does Southwest Airlines fly under":"SWA","which ICAO code does Air Ivoire fly under":"VUN","give the three-letter airline code of CBM America":"XBM","give the three-letter airline code of Orbit Airlines":"OBT","give the three-letter airline code of Air Moorea":"TAH","what is the ICAO code of Trigana Air Service":"TGN","what is the ICAO code of EgyptAir Express":"MSE"}}},
{"id":"n-ba193192","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"code"}]]],"mem":{"table":{"does One Two Go Airlines fly under":"OTG","of Ibex Airlines":"IBX","does Bering Air fly under":"BRG","of MIAT Mongolian Airlines":"MGL","does Apache Air fly under":"IWA","of Malmo Aviation":"SCW","of Blue1":"BLF","of Lao Airlines":"LAO","does ZABAIKAL AIRLINES fly under":"ZTT","of Buquebus Líneas Aéreas":"BQB","does Air Wisconsin fly under":"AWI","of Portugalia":"PGA","does Holidays Czech Airlines fly under":"HCC","does Korongo Airlines fly under":"KGO","does ATUR fly under":"TUR","of GX Airlines":"CBG","of LAN Argentina":"DSM","of TransBrasil Airlines":"THS","does Andalus Lineas Aereas fly under":"ANU","of Red Wings":"RWZ","does Eritrean Airlines fly under":"ERT","of Grand Cru Airlines":"GCA","of Mandala Airlines":"MDL","of Sky Regional":"SKV","of Line Blue":"LBL","does Golden Air fly under":"GAO","of Express One International":"LHN","of Air Florida":"FLZ","of Shuttle America":"TCF","of MNG Airlines":"MNB","does Hainan Airlines fly under":"CHH","does SeaPort Airlines fly under":"SQH","of Southern Airways Express":"LTD","of Air Madagascar":"MDG","of Kam Air":"KMF","of German International Air Lines":"GER","of Air Southwest":"WOW","does Nationwide Airlines fly under":"NTW","of Air Japan":"AJX","does Hankook Airline fly under":"HNX","does Hamburg International fly under":"HHI","of JALways":"JAZ","does Air China fly under":"CCA","does Privatair fly under":"PTI","does Air Chathams fly under":"CVA","of Belavia Belarusian Airlines":"BRU","of Macair Airlines":"MCK","does Hamburg Airways fly under":"HAY","does TUIfly fly under":"HLX","of Jettor Airlines":"JTO","of Welcome Air":"WLC","of Fars Air Qeshm":"QFZ","of Svyaz Rossiya":"SJM","of Calima Aviacion":"CLI","of SunExpress":"SXS","of Pacific Wings":"NMI","of Turkish Airlines":"THY","of Mesa Airlines":"ASH","of City Airline":"SDR","of ATA Airlines":"AMT","of Compass Airlines":"CPZ","of Potomac Air":"PDC","of Kuzu Airlines Cargo":"KZU","of Brussels Airlines":"DAT","of Aereonautica militare":"AXZ","of Malta Air Charter":"MAC","of El Al Israel Airlines":"ELY","does Xiamen Airlines fly under":"CXA","of Aerolineas Argentinas":"ARG","of Kush Air":"KUH","of Jet Suite":"RSP","of Sky Airline":"SKU","of Himalayan Airlines":"HYM","does Air India Express fly under":"AXB","of Spanair":"JKK","does Flybe Finland Oy fly under":"FCM","does Fly540 fly under":"FFV","of Ryan International Airlines":"RYN","of Meridiana":"ISS","does Wizz Air Hungary fly under":"WVL","does Shenzhen Airlines fly under":"CSZ","does Dynamic Airways fly under":"DYA","of PLUNA":"PUA","of Air KBZ":"KBZ","of Air Explore":"AXE","of WebJet Linhas A":"WEB","of Mauritania Airways":"MTW","of Air Lituanica":"LTU","does SATENA fly under":"NSE","of Denim Air":"DNM","does Domodedovo Airlines fly under":"DMO","does LTU Austria fly under":"LTO","of Air Cudlua":"CUD","does Southwest Airlines fly under":"SWA","does Air Ivoire fly under":"VUN","of CBM America":"XBM","of Orbit Airlines":"OBT","of Air Moorea":"TAH","of Trigana Air Service":"TGN","of EgyptAir Express":"MSE"}}},
{"id":"n-e01e6508","guard":[["hasAny",["aereas","aerolineas","air","airline","airlines","airways","argentina","atur","austria","aéreas","blue","express","finland","international","meridiana","portugalia","privatair","rossiya","satena","sunexpress","tuifly"]],["has","code"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does One Two Go Airlines fly under":"OTG","give the three-letter airline code of Ibex Airlines":"IBX","which ICAO code does Bering Air fly under":"BRG","what is the ICAO code of MIAT Mongolian Airlines":"MGL","which ICAO code does Apache Air fly under":"IWA","give the three-letter airline code of Malmo Aviation":"SCW","what is the ICAO code of Lao Airlines":"LAO","which ICAO code does ZABAIKAL AIRLINES fly under":"ZTT","what is the ICAO code of Buquebus Líneas Aéreas":"BQB","which ICAO code does Air Wisconsin fly under":"AWI","what is the ICAO code of Portugalia":"PGA","which ICAO code does Holidays Czech Airlines fly under":"HCC","which ICAO code does Korongo Airlines fly under":"KGO","which ICAO code does ATUR fly under":"TUR","give the three-letter airline code of GX Airlines":"CBG","what is the ICAO code of LAN Argentina":"DSM","what is the ICAO code of TransBrasil Airlines":"THS","which ICAO code does Andalus Lineas Aereas fly under":"ANU","give the three-letter airline code of Red Wings":"RWZ","which ICAO code does Eritrean Airlines fly under":"ERT","what is the ICAO code of Grand Cru Airlines":"GCA","what is the ICAO code of Mandala Airlines":"MDL","give the three-letter airline code of Sky Regional":"SKV","what is the ICAO code of Line Blue":"LBL","which ICAO code does Golden Air fly under":"GAO","give the three-letter airline code of Express One International":"LHN","give the three-letter airline code of Air Florida":"FLZ","give the three-letter airline code of Shuttle America":"TCF","what is the ICAO code of MNG Airlines":"MNB","which ICAO code does Hainan Airlines fly under":"CHH","which ICAO code does SeaPort Airlines fly under":"SQH","give the three-letter airline code of Southern Airways Express":"LTD","what is the ICAO code of Air Madagascar":"MDG","what is the ICAO code of Kam Air":"KMF","what is the ICAO code of German International Air Lines":"GER","give the three-letter airline code of Air Southwest":"WOW","which ICAO code does Nationwide Airlines fly under":"NTW","what is the ICAO code of Air Japan":"AJX","which ICAO code does Hankook Airline fly under":"HNX","which ICAO code does Hamburg International fly under":"HHI","give the three-letter airline code of JALways":"JAZ","which ICAO code does Air China fly under":"CCA","which ICAO code does Privatair fly under":"PTI","which ICAO code does Air Chathams fly under":"CVA","give the three-letter airline code of Belavia Belarusian Airlines":"BRU","what is the ICAO code of Macair Airlines":"MCK","which ICAO code does Hamburg Airways fly under":"HAY","which ICAO code does TUIfly fly under":"HLX","what is the ICAO code of Jettor Airlines":"JTO","give the three-letter airline code of Welcome Air":"WLC","what is the ICAO code of Fars Air Qeshm":"QFZ","what is the ICAO code of Svyaz Rossiya":"SJM","give the three-letter airline code of Calima Aviacion":"CLI","what is the ICAO code of SunExpress":"SXS","give the three-letter airline code of Pacific Wings":"NMI","give the three-letter airline code of Turkish Airlines":"THY","give the three-letter airline code of Mesa Airlines":"ASH","give the three-letter airline code of City Airline":"SDR","what is the ICAO code of ATA Airlines":"AMT","what is the ICAO code of Compass Airlines":"CPZ","give the three-letter airline code of Potomac Air":"PDC","what is the ICAO code of Kuzu Airlines Cargo":"KZU","what is the ICAO code of Brussels Airlines":"DAT","give the three-letter airline code of Aereonautica militare":"AXZ","give the three-letter airline code of Malta Air Charter":"MAC","give the three-letter airline code of El Al Israel Airlines":"ELY","which ICAO code does Xiamen Airlines fly under":"CXA","what is the ICAO code of Aerolineas Argentinas":"ARG","what is the ICAO code of Kush Air":"KUH","give the three-letter airline code of Jet Suite":"RSP","give the three-letter airline code of Sky Airline":"SKU","what is the ICAO code of Himalayan Airlines":"HYM","which ICAO code does Air India Express fly under":"AXB","give the three-letter airline code of Spanair":"JKK","which ICAO code does Flybe Finland Oy fly under":"FCM","what is the ICAO code of Ryan International Airlines":"RYN","what is the ICAO code of Meridiana":"ISS","which ICAO code does Wizz Air Hungary fly under":"WVL","which ICAO code does Shenzhen Airlines fly under":"CSZ","which ICAO code does Dynamic Airways fly under":"DYA","give the three-letter airline code of PLUNA":"PUA","what is the ICAO code of Air KBZ":"KBZ","what is the ICAO code of Air Explore":"AXE","give the three-letter airline code of WebJet Linhas A":"WEB","what is the ICAO code of Mauritania Airways":"MTW","give the three-letter airline code of Air Lituanica":"LTU","which ICAO code does SATENA fly under":"NSE","give the three-letter airline code of Denim Air":"DNM","which ICAO code does Domodedovo Airlines fly under":"DMO","which ICAO code does LTU Austria fly under":"LTO","give the three-letter airline code of Air Cudlua":"CUD","which ICAO code does Southwest Airlines fly under":"SWA","which ICAO code does Air Ivoire fly under":"VUN","give the three-letter airline code of CBM America":"XBM","give the three-letter airline code of Orbit Airlines":"OBT","give the three-letter airline code of Air Moorea":"TAH","what is the ICAO code of Trigana Air Service":"TGN","what is the ICAO code of EgyptAir Express":"MSE"}}},
{"id":"n-00e70b31","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"icao"}]]],"mem":{"table":{"code does One Two Go Airlines fly under":"OTG","code does Bering Air fly under":"BRG","code of MIAT Mongolian Airlines":"MGL","code does Apache Air fly under":"IWA","code of Blue1":"BLF","code of Lao Airlines":"LAO","code does ZABAIKAL AIRLINES fly under":"ZTT","code of Buquebus Líneas Aéreas":"BQB","code does Air Wisconsin fly under":"AWI","code of Portugalia":"PGA","code does Holidays Czech Airlines fly under":"HCC","code does Korongo Airlines fly under":"KGO","code does ATUR fly under":"TUR","code of LAN Argentina":"DSM","code of TransBrasil Airlines":"THS","code does Andalus Lineas Aereas fly under":"ANU","code does Eritrean Airlines fly under":"ERT","code of Grand Cru Airlines":"GCA","code of Mandala Airlines":"MDL","code of Line Blue":"LBL","code does Golden Air fly under":"GAO","code of MNG Airlines":"MNB","code does Hainan Airlines fly under":"CHH","code does SeaPort Airlines fly under":"SQH","code of Air Madagascar":"MDG","code of Kam Air":"KMF","code of German International Air Lines":"GER","code does Nationwide Airlines fly under":"NTW","code of Air Japan":"AJX","code does Hankook Airline fly under":"HNX","code does Hamburg International fly under":"HHI","code does Air China fly under":"CCA","code does Privatair fly under":"PTI","code does Air Chathams fly under":"CVA","code of Macair Airlines":"MCK","code does Hamburg Airways fly under":"HAY","code does TUIfly fly under":"HLX","code of Jettor Airlines":"JTO","code of Fars Air Qeshm":"QFZ","code of Svyaz Rossiya":"SJM","code of SunExpress":"SXS","code of ATA Airlines":"AMT","code of Compass Airlines":"CPZ","code of Kuzu Airlines Cargo":"KZU","code of Brussels Airlines":"DAT","code does Xiamen Airlines fly under":"CXA","code of Aerolineas Argentinas":"ARG","code of Kush Air":"KUH","code of Himalayan Airlines":"HYM","code does Air India Express fly under":"AXB","code does Flybe Finland Oy fly under":"FCM","code does Fly540 fly under":"FFV","code of Ryan International Airlines":"RYN","code of Meridiana":"ISS","code does Wizz Air Hungary fly under":"WVL","code does Shenzhen Airlines fly under":"CSZ","code does Dynamic Airways fly under":"DYA","code of Air KBZ":"KBZ","code of Air Explore":"AXE","code of Mauritania Airways":"MTW","code does SATENA fly under":"NSE","code does Domodedovo Airlines fly under":"DMO","code does LTU Austria fly under":"LTO","code does Southwest Airlines fly under":"SWA","code does Air Ivoire fly under":"VUN","code of Trigana Air Service":"TGN","code of EgyptAir Express":"MSE"}}},
{"id":"n-c2f10c47","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"Ibex Airlines":"IBX","MIAT Mongolian Airlines":"MGL","Malmo Aviation":"SCW","Blue1":"BLF","Lao Airlines":"LAO","Buquebus Líneas Aéreas":"BQB","Portugalia":"PGA","GX Airlines":"CBG","LAN Argentina":"DSM","TransBrasil Airlines":"THS","Red Wings":"RWZ","Grand Cru Airlines":"GCA","Mandala Airlines":"MDL","Sky Regional":"SKV","Line Blue":"LBL","Express One International":"LHN","Air Florida":"FLZ","Shuttle America":"TCF","MNG Airlines":"MNB","Southern Airways Express":"LTD","Air Madagascar":"MDG","Kam Air":"KMF","German International Air Lines":"GER","Air Southwest":"WOW","Air Japan":"AJX","JALways":"JAZ","Belavia Belarusian Airlines":"BRU","Macair Airlines":"MCK","Jettor Airlines":"JTO","Welcome Air":"WLC","Fars Air Qeshm":"QFZ","Svyaz Rossiya":"SJM","Calima Aviacion":"CLI","SunExpress":"SXS","Pacific Wings":"NMI","Turkish Airlines":"THY","Mesa Airlines":"ASH","City Airline":"SDR","ATA Airlines":"AMT","Compass Airlines":"CPZ","Potomac Air":"PDC","Kuzu Airlines Cargo":"KZU","Brussels Airlines":"DAT","Aereonautica militare":"AXZ","Malta Air Charter":"MAC","El Al Israel Airlines":"ELY","Aerolineas Argentinas":"ARG","Kush Air":"KUH","Jet Suite":"RSP","Sky Airline":"SKU","Himalayan Airlines":"HYM","Spanair":"JKK","Ryan International Airlines":"RYN","Meridiana":"ISS","PLUNA":"PUA","Air KBZ":"KBZ","Air Explore":"AXE","WebJet Linhas A":"WEB","Mauritania Airways":"MTW","Air Lituanica":"LTU","Denim Air":"DNM","Air Cudlua":"CUD","CBM America":"XBM","Orbit Airlines":"OBT","Air Moorea":"TAH","Trigana Air Service":"TGN","EgyptAir Express":"MSE"}}},
{"id":"n-3fc5f323","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the ICAO code of MIAT Mongolian Airlines":"MGL","the ICAO code of Blue1":"BLF","the ICAO code of Lao Airlines":"LAO","the ICAO code of Buquebus Líneas Aéreas":"BQB","the ICAO code of Portugalia":"PGA","the ICAO code of LAN Argentina":"DSM","the ICAO code of TransBrasil Airlines":"THS","the ICAO code of Grand Cru Airlines":"GCA","the ICAO code of Mandala Airlines":"MDL","the ICAO code of Line Blue":"LBL","the ICAO code of MNG Airlines":"MNB","the ICAO code of Air Madagascar":"MDG","the ICAO code of Kam Air":"KMF","the ICAO code of German International Air Lines":"GER","the ICAO code of Air Japan":"AJX","the ICAO code of Macair Airlines":"MCK","the ICAO code of Jettor Airlines":"JTO","the ICAO code of Fars Air Qeshm":"QFZ","the ICAO code of Svyaz Rossiya":"SJM","the ICAO code of SunExpress":"SXS","the ICAO code of ATA Airlines":"AMT","the ICAO code of Compass Airlines":"CPZ","the ICAO code of Kuzu Airlines Cargo":"KZU","the ICAO code of Brussels Airlines":"DAT","the ICAO code of Aerolineas Argentinas":"ARG","the ICAO code of Kush Air":"KUH","the ICAO code of Himalayan Airlines":"HYM","the ICAO code of Ryan International Airlines":"RYN","the ICAO code of Meridiana":"ISS","the ICAO code of Air KBZ":"KBZ","the ICAO code of Air Explore":"AXE","the ICAO code of Mauritania Airways":"MTW","the ICAO code of Trigana Air Service":"TGN","the ICAO code of EgyptAir Express":"MSE"}}},
{"id":"n-db1da98c","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.numeral"]]],"mem":{"table":{"Blue1":"BLF","Fly540":"FFV"}}},
{"id":"n-2597d30e","guard":[["hasAny",["backwards","kbz","lao","reverse order","reversed","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-7e852dd5","guard":[["hasAny",["abbreviate","abbreviation","acronym","charter","cru","short form"]]],"pyramid":["render.str",["transform.acronym",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-dc4760d3","guard":[["hasAny",["abbreviate","acronym","charter","cru"]]],"pyramid":["render.str",["transform.acronym",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-1b7bea2f","guard":[["hasAny",["a to z","alphabetical","alphabetize","item number","kbz","lao","nth","position"]],["has","what"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":5}]],"mem":null},
{"id":"n-1f0968d8","guard":[["hasAny",["abbreviate","abbreviation","acronym","charter","cru","short form"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.acronym",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-2ebd9c75","guard":[["hasAny",["abbreviate","acronym","charter","cru"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.acronym",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-66a7e0a7","guard":[["hasAny",["a to z","alphabetical","alphabetize","item number","kbz","lao","nth","position"]],["has","what"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":4}]],"mem":null},
{"id":"n-74efd609","guard":[["hasAny",["abbreviate","abbreviation","acronym","charter","cru","lower case","lowercase","short form","small letters"]]],"pyramid":["render.str",["transform.lower",["transform.acronym",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-77cf88df","guard":[["hasAny",["denim","item number","kbz","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-8e7fb230","guard":[["hasAny",["abbreviate","acronym","charter","cru","lower case","lowercase","small letters"]]],"pyramid":["render.str",["transform.lower",["transform.acronym",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-8f3f75ac","guard":[["hasAny",["a to z","alphabetical","alphabetize","backwards","kbz","lao","reverse order","reversed","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["transform.sortStrs",["sense.content"]]]]],"mem":null},
{"id":"n-cae6fef6","guard":[["hasAny",["abbreviate","abbreviation","acronym","capitalise","capitalize","capitalize each word","charter","cru","short form","title case"]]],"pyramid":["render.str",["transform.title",["transform.acronym",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-def06bd4","guard":[["hasAny",["abbreviate","acronym","capitalise","capitalize","capitalize each word","charter","cru","title case"]]],"pyramid":["render.str",["transform.title",["transform.acronym",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-0263bc8a","guard":[["hasAny",["code","fly","icao","privatair","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Privatair fly under":"PTI"}}},
{"id":"n-02bd6e8a","guard":[["hasAny",["austria","code","fly","icao","ltu","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does LTU Austria fly under":"LTO"}}},
{"id":"n-02f76a52","guard":[["has","international"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Hamburg International fly under":"HHI"}}},
{"id":"n-032f5b0a","guard":[["hasAny",["airline","city","code","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of City Airline":"SDR"}}},
{"id":"n-0357bdfc","guard":[["hasAny",["aerolineas","argentinas","code","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Aerolineas Argentinas":"ARG"}}},
{"id":"n-04e69ac4","guard":[["hasAny",["airlines","brussels","code","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Brussels Airlines":"DAT"}}},
{"id":"n-07b07655","guard":[["hasAny",["airline","code","pluna","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of PLUNA":"PUA"}}},
{"id":"n-0812d91e","guard":[["has","compass"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Compass Airlines":"CPZ"}}},
{"id":"n-0bd1b13e","guard":[["has","jettor"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Jettor Airlines":"JTO"}}},
{"id":"n-0caebef5","guard":[["hasAny",["air","airline","charter","code","malta","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Malta Air Charter":"MAC"}}},
{"id":"n-0d0faffc","guard":[["hasAny",["all caps","capital letters","capitals","kbz","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-0fab7571","guard":[["hasAny",["code","fly","fly540","icao","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Fly540 fly under":"FFV"}}},
{"id":"n-10d7646b","guard":[["hasAny",["airlines","code","icao","jettor"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Jettor Airlines":"JTO"}}},
{"id":"n-12d78fb9","guard":[["has","portugalia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Portugalia":"PGA"}}},
{"id":"n-145c8d6f","guard":[["hasAny",["air","code","icao","service","trigana"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Trigana Air Service":"TGN"}}},
{"id":"n-1539e878","guard":[["hasAny",["aéreas","buquebus","code","icao","líneas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Buquebus Líneas Aéreas":"BQB"}}},
{"id":"n-156b724a","guard":[["hasAny",["airlines","code","fly","icao","southwest","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Southwest Airlines fly under":"SWA"}}},
{"id":"n-175c5159","guard":[["hasAny",["blue","code","icao","line"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Line Blue":"LBL"}}},
{"id":"n-1771c9c2","guard":[["has","hainan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Hainan Airlines fly under":"CHH"}}},
{"id":"n-19c84e70","guard":[["hasAny",["charter","malta"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Malta Air Charter":"MAC"}}},
{"id":"n-1af4e791","guard":[["hasAny",["airline","code","pacific","threeletter","wings"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Pacific Wings":"NMI"}}},
{"id":"n-1e591630","guard":[["hasAny",["airways","southern"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Southern Airways Express":"LTD"}}},
{"id":"n-210455c2","guard":[["hasAny",["airlines","code","icao","lao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Lao Airlines":"LAO"}}},
{"id":"n-2181e4c0","guard":[["hasAny",["airways","code","icao","mauritania"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Mauritania Airways":"MTW"}}},
{"id":"n-21deba46","guard":[["hasAny",["miat","mongolian"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of MIAT Mongolian Airlines":"MGL"}}},
{"id":"n-236481dc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kbz","title case"]]],"pyramid":["render.str",["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-26269469","guard":[["hasAny",["airline","airlines","code","orbit","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Orbit Airlines":"OBT"}}},
{"id":"n-2641594a","guard":[["hasAny",["airline","airlines","al","code","el","israel","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of El Al Israel Airlines":"ELY"}}},
{"id":"n-279b8860","guard":[["has","brussels"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Brussels Airlines":"DAT"}}},
{"id":"n-27e1201b","guard":[["hasAny",["airline","airlines","code","threeletter","turkish"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Turkish Airlines":"THY"}}},
{"id":"n-27f3cc54","guard":[["hasAny",["austria","ltu"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does LTU Austria fly under":"LTO"}}},
{"id":"n-29849c98","guard":[["has","kam"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Kam Air":"KMF"}}},
{"id":"n-2a1d1d0c","guard":[["hasAny",["air","china","code","fly","icao","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Air China fly under":"CCA"}}},
{"id":"n-2b03ecf9","guard":[["hasAny",["airline","hankook"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Hankook Airline fly under":"HNX"}}},
{"id":"n-2b2f1bbe","guard":[["has","nationwide"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Nationwide Airlines fly under":"NTW"}}},
{"id":"n-2d3212e9","guard":[["hasAny",["airlines","code","compass","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Compass Airlines":"CPZ"}}},
{"id":"n-2f0050c2","guard":[["has","welcome"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Welcome Air":"WLC"}}},
{"id":"n-30105bf3","guard":[["has","orbit"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Orbit Airlines":"OBT"}}},
{"id":"n-31823b5c","guard":[["has","red"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Red Wings":"RWZ"}}},
{"id":"n-3259db46","guard":[["hasAny",["air","code","icao","japan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Air Japan":"AJX"}}},
{"id":"n-32c06436","guard":[["has","transbrasil"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of TransBrasil Airlines":"THS"}}},
{"id":"n-330e89be","guard":[["has","explore"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Air Explore":"AXE"}}},
{"id":"n-3337d42b","guard":[["hasAny",["air","airline","code","southwest","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Air Southwest":"WOW"}}},
{"id":"n-3595bc7f","guard":[["hasAny",["airline","aviation","code","malmo","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Malmo Aviation":"SCW"}}},
{"id":"n-3c1f5a1c","guard":[["hasAny",["air","apache","code","fly","icao","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Apache Air fly under":"IWA"}}},
{"id":"n-3c47d8e3","guard":[["hasAny",["air","bering","code","fly","icao","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Bering Air fly under":"BRG"}}},
{"id":"n-3e9880de","guard":[["hasAny",["kbz","lower case","lowercase","small letters"]]],"pyramid":["render.str",["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3f02a4fa","guard":[["has","denim"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Denim Air":"DNM"}}},
{"id":"n-418ac00c","guard":[["has","dynamic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Dynamic Airways fly under":"DYA"}}},
{"id":"n-439464bb","guard":[["has","madagascar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Air Madagascar":"MDG"}}},
{"id":"n-44b7362b","guard":[["hasAny",["airline","america","cbm","code","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of CBM America":"XBM"}}},
{"id":"n-452849e3","guard":[["hasAny",["airlines","code","icao","transbrasil"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of TransBrasil Airlines":"THS"}}},
{"id":"n-4560b25e","guard":[["has","china"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Air China fly under":"CCA"}}},
{"id":"n-464f3c67","guard":[["has","florida"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Air Florida":"FLZ"}}},
{"id":"n-4670c201","guard":[["hasAny",["airlines","cargo","code","icao","kuzu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Kuzu Airlines Cargo":"KZU"}}},
{"id":"n-473722a3","guard":[["hasAny",["aerolineas","argentinas","code","icao"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Aerolineas Argentinas":"ARG"}}},
{"id":"n-4cbb42b6","guard":[["has","chathams"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Air Chathams fly under":"CVA"}}},
{"id":"n-4cee4dec","guard":[["hasAny",["airlines","ata","code","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of ATA Airlines":"AMT"}}},
{"id":"n-4ef128f4","guard":[["has","macair"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Macair Airlines":"MCK"}}},
{"id":"n-4fa37809","guard":[["hasAny",["air","code","fly","icao","ivoire","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Air Ivoire fly under":"VUN"}}},
{"id":"n-4fa6195b","guard":[["hasAny",["airlines","code","czech","fly","holidays","icao","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Holidays Czech Airlines fly under":"HCC"}}},
{"id":"n-50410c19","guard":[["hasAny",["airlines","code","icao","macair"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Macair Airlines":"MCK"}}},
{"id":"n-508c9814","guard":[["has","wisconsin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Air Wisconsin fly under":"AWI"}}},
{"id":"n-516fd459","guard":[["hasAny",["international","one"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Express One International":"LHN"}}},
{"id":"n-52ce7519","guard":[["has","shenzhen"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Shenzhen Airlines fly under":"CSZ"}}},
{"id":"n-548f403c","guard":[["hasAny",["airlines","code","himalayan","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Himalayan Airlines":"HYM"}}},
{"id":"n-574201b7","guard":[["hasAny",["blue","code","icao","line"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Line Blue":"LBL"}}},
{"id":"n-57f6b6da","guard":[["hasAny",["cru","grand"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Grand Cru Airlines":"GCA"}}},
{"id":"n-58bfb580","guard":[["hasAny",["air","code","german","icao","international","lines"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of German International Air Lines":"GER"}}},
{"id":"n-596b7a53","guard":[["hasAny",["code","icao","rossiya","svyaz"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Svyaz Rossiya":"SJM"}}},
{"id":"n-5a80b1c3","guard":[["hasAny",["code","icao","sunexpress"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of SunExpress":"SXS"}}},
{"id":"n-5aab55fb","guard":[["hasAny",["invert case","kbz","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5c48929c","guard":[["has","pluna"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of PLUNA":"PUA"}}},
{"id":"n-5d289634","guard":[["hasAny",["code","icao","meridiana"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Meridiana":"ISS"}}},
{"id":"n-5d59d0cd","guard":[["hasAny",["air","code","fars","icao","qeshm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Fars Air Qeshm":"QFZ"}}},
{"id":"n-5d78a8dd","guard":[["has","shuttle"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Shuttle America":"TCF"}}},
{"id":"n-5f4d2b19","guard":[["hasAny",["express","india"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Air India Express fly under":"AXB"}}},
{"id":"n-5f82ab55","guard":[["hasAny",["air","airline","code","cudlua","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Air Cudlua":"CUD"}}},
{"id":"n-60182fc8","guard":[["hasAny",["aereas","andalus","code","fly","icao","lineas","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Andalus Lineas Aereas fly under":"ANU"}}},
{"id":"n-630e8296","guard":[["hasAny",["aereonautica","airline","code","militare","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Aereonautica militare":"AXZ"}}},
{"id":"n-64d24d55","guard":[["has","sunexpress"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of SunExpress":"SXS"}}},
{"id":"n-66c73bdd","guard":[["hasAny",["service","trigana"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Trigana Air Service":"TGN"}}},
{"id":"n-68e353c5","guard":[["hasAny",["airlines","code","domodedovo","fly","icao","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Domodedovo Airlines fly under":"DMO"}}},
{"id":"n-6a014bd0","guard":[["hasAny",["cargo","kuzu"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Kuzu Airlines Cargo":"KZU"}}},
{"id":"n-6a64cf07","guard":[["hasAny",["airlines","code","cru","grand","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Grand Cru Airlines":"GCA"}}},
{"id":"n-6ac85bee","guard":[["hasAny",["blue1","code","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Blue1":"BLF"}}},
{"id":"n-6bb2b6aa","guard":[["hasAny",["jet","suite"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Jet Suite":"RSP"}}},
{"id":"n-6d518f90","guard":[["hasAny",["airline","code","fly","hankook","icao","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Hankook Airline fly under":"HNX"}}},
{"id":"n-6def47c2","guard":[["hasAny",["air","code","icao","kam"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Kam Air":"KMF"}}},
{"id":"n-6e4017ce","guard":[["hasAny",["airlines","code","eritrean","fly","icao","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Eritrean Airlines fly under":"ERT"}}},
{"id":"n-6f30476d","guard":[["hasAny",["airline","code","spanair","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Spanair":"JKK"}}},
{"id":"n-722a487e","guard":[["hasAny",["airline","airlines","code","ibex","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Ibex Airlines":"IBX"}}},
{"id":"n-746e2282","guard":[["hasAny",["atur","code","fly","icao","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does ATUR fly under":"TUR"}}},
{"id":"n-7624bc49","guard":[["has","turkish"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Turkish Airlines":"THY"}}},
{"id":"n-76fbf4ce","guard":[["has","southwest"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Southwest Airlines fly under":"SWA"}}},
{"id":"n-76fd1705","guard":[["hasAny",["international","ryan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Ryan International Airlines":"RYN"}}},
{"id":"n-78144a95","guard":[["hasAny",["kbz","no vowels","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-78458581","guard":[["has","bering"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Bering Air fly under":"BRG"}}},
{"id":"n-7929304c","guard":[["hasAny",["airline","code","jet","suite","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Jet Suite":"RSP"}}},
{"id":"n-7bfdc9ac","guard":[["hasAny",["air","airline","code","florida","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Air Florida":"FLZ"}}},
{"id":"n-7c2581e6","guard":[["hasAny",["airline","airlines","code","gx","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of GX Airlines":"CBG"}}},
{"id":"n-7cf72863","guard":[["hasAny",["al","el","israel"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of El Al Israel Airlines":"ELY"}}},
{"id":"n-7d8566e9","guard":[["hasAny",["code","fly","hamburg","icao","international","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Hamburg International fly under":"HHI"}}},
{"id":"n-7e0be21e","guard":[["has","southwest"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Air Southwest":"WOW"}}},
{"id":"n-7ec77cac","guard":[["hasAny",["airlines","code","fly","icao","korongo","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Korongo Airlines fly under":"KGO"}}},
{"id":"n-7edb0816","guard":[["hasAny",["airline","america","code","shuttle","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Shuttle America":"TCF"}}},
{"id":"n-7f173541","guard":[["hasAny",["air","code","express","fly","icao","india","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Air India Express fly under":"AXB"}}},
{"id":"n-81483f1e","guard":[["has","spanair"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Spanair":"JKK"}}},
{"id":"n-81edfbe2","guard":[["has","himalayan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Himalayan Airlines":"HYM"}}},
{"id":"n-822c9de6","guard":[["has","domodedovo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Domodedovo Airlines fly under":"DMO"}}},
{"id":"n-82465f77","guard":[["has","jalways"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of JALways":"JAZ"}}},
{"id":"n-82a17e1f","guard":[["hasAny",["air","chathams","code","fly","icao","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Air Chathams fly under":"CVA"}}},
{"id":"n-85130210","guard":[["hasAny",["air","code","icao","kush"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Kush Air":"KUH"}}},
{"id":"n-852b7ef4","guard":[["hasAny",["airlines","code","fly","icao","seaport","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does SeaPort Airlines fly under":"SQH"}}},
{"id":"n-85e63038","guard":[["hasAny",["code","egyptair","express","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of EgyptAir Express":"MSE"}}},
{"id":"n-8a7dbeab","guard":[["hasAny",["airlines","code","icao","international","ryan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Ryan International Airlines":"RYN"}}},
{"id":"n-8d342c08","guard":[["hasAny",["airline","code","regional","sky","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Sky Regional":"SKV"}}},
{"id":"n-8db65535","guard":[["has","kush"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Kush Air":"KUH"}}},
{"id":"n-921aa93a","guard":[["hasAny",["airlines","code","fly","icao","under","xiamen"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Xiamen Airlines fly under":"CXA"}}},
{"id":"n-93649daf","guard":[["hasAny",["airlines","code","fly","icao","nationwide","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Nationwide Airlines fly under":"NTW"}}},
{"id":"n-959dc93a","guard":[["has","privatair"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Privatair fly under":"PTI"}}},
{"id":"n-96b7b1c0","guard":[["has","lao"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Lao Airlines":"LAO"}}},
{"id":"n-9716c6d0","guard":[["has","korongo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Korongo Airlines fly under":"KGO"}}},
{"id":"n-97f5dfb0","guard":[["hasAny",["belarusian","belavia"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Belavia Belarusian Airlines":"BRU"}}},
{"id":"n-9a15e5c8","guard":[["has","xiamen"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Xiamen Airlines fly under":"CXA"}}},
{"id":"n-9a690fe7","guard":[["hasAny",["airlines","code","fly","icao","under","zabaikal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does ZABAIKAL AIRLINES fly under":"ZTT"}}},
{"id":"n-9b03cc18","guard":[["hasAny",["air","code","icao","kbz"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Air KBZ":"KBZ"}}},
{"id":"n-9d6a6cd6","guard":[["has","atur"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does ATUR fly under":"TUR"}}},
{"id":"n-9da36cc7","guard":[["hasAny",["airline","airways","code","express","southern","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Southern Airways Express":"LTD"}}},
{"id":"n-9fcac752","guard":[["hasAny",["air","airline","code","lituanica","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Air Lituanica":"LTU"}}},
{"id":"n-a014746e","guard":[["hasAny",["aéreas","buquebus","code","icao","líneas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Buquebus Líneas Aéreas":"BQB"}}},
{"id":"n-a193c33b","guard":[["hasAny",["aereas","andalus","lineas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Andalus Lineas Aereas fly under":"ANU"}}},
{"id":"n-a35f66a2","guard":[["has","lituanica"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Air Lituanica":"LTU"}}},
{"id":"n-a4199c5a","guard":[["has","zabaikal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does ZABAIKAL AIRLINES fly under":"ZTT"}}},
{"id":"n-a488f553","guard":[["has","mandala"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Mandala Airlines":"MDL"}}},
{"id":"n-a7f3c43f","guard":[["has","moorea"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Air Moorea":"TAH"}}},
{"id":"n-a9b1137c","guard":[["hasAny",["airline","code","sky","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Sky Airline":"SKU"}}},
{"id":"n-a9ec2072","guard":[["hasAny",["airline","code","linhas","threeletter","webjet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of WebJet Linhas A":"WEB"}}},
{"id":"n-aa74f0b2","guard":[["has","ata"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of ATA Airlines":"AMT"}}},
{"id":"n-aa96f709","guard":[["hasAny",["code","egyptair","express","icao"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of EgyptAir Express":"MSE"}}},
{"id":"n-b0e03f8f","guard":[["has","seaport"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does SeaPort Airlines fly under":"SQH"}}},
{"id":"n-b0f1b9c9","guard":[["hasAny",["airways","code","icao","mauritania"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Mauritania Airways":"MTW"}}},
{"id":"n-b201475a","guard":[["hasAny",["linhas","webjet"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of WebJet Linhas A":"WEB"}}},
{"id":"n-b62c6908","guard":[["has","mng"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of MNG Airlines":"MNB"}}},
{"id":"n-b72963ca","guard":[["has","city"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of City Airline":"SDR"}}},
{"id":"n-b8831694","guard":[["has","regional"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Sky Regional":"SKV"}}},
{"id":"n-b891cdcc","guard":[["has","kbz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Air KBZ":"KBZ"}}},
{"id":"n-bec1b476","guard":[["hasAny",["airline","airlines","belarusian","belavia","code","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Belavia Belarusian Airlines":"BRU"}}},
{"id":"n-bf65a23d","guard":[["has","gx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of GX Airlines":"CBG"}}},
{"id":"n-c0202082","guard":[["has","mesa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Mesa Airlines":"ASH"}}},
{"id":"n-c1c70462","guard":[["hasAny",["code","finland","fly","flybe","icao","oy","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Flybe Finland Oy fly under":"FCM"}}},
{"id":"n-c2122cd4","guard":[["hasAny",["fars","qeshm"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Fars Air Qeshm":"QFZ"}}},
{"id":"n-c231a25e","guard":[["hasAny",["go","one","two"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does One Two Go Airlines fly under":"OTG"}}},
{"id":"n-c2cd765c","guard":[["has","cudlua"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Air Cudlua":"CUD"}}},
{"id":"n-c40aad97","guard":[["hasAny",["aereonautica","militare"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Aereonautica militare":"AXZ"}}},
{"id":"n-c45fdf71","guard":[["hasAny",["airlines","code","fly","hainan","icao","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Hainan Airlines fly under":"CHH"}}},
{"id":"n-c4b9f240","guard":[["hasAny",["hungary","wizz"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Wizz Air Hungary fly under":"WVL"}}},
{"id":"n-c6b4e826","guard":[["hasAny",["each word","kbz","split into words"]]],"pyramid":["render.list",["transform.words",["sense.lastWord"]]],"mem":null},
{"id":"n-c7033a2c","guard":[["has","ivoire"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Air Ivoire fly under":"VUN"}}},
{"id":"n-c75c6948","guard":[["hasAny",["airline","airlines","code","mesa","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Mesa Airlines":"ASH"}}},
{"id":"n-c94d2375","guard":[["hasAny",["air","code","explore","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Air Explore":"AXE"}}},
{"id":"n-caa277bf","guard":[["has","apache"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Apache Air fly under":"IWA"}}},
{"id":"n-cf71b805","guard":[["hasAny",["airline","aviacion","calima","code","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Calima Aviacion":"CLI"}}},
{"id":"n-d1259ae8","guard":[["hasAny",["finland","flybe","oy"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Flybe Finland Oy fly under":"FCM"}}},
{"id":"n-d320c9c9","guard":[["hasAny",["aviation","malmo"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Malmo Aviation":"SCW"}}},
{"id":"n-d4189eee","guard":[["has","cbm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of CBM America":"XBM"}}},
{"id":"n-d6554bfa","guard":[["has","meridiana"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Meridiana":"ISS"}}},
{"id":"n-d656e0ea","guard":[["hasAny",["air","airline","code","denim","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Denim Air":"DNM"}}},
{"id":"n-d6e1391c","guard":[["hasAny",["airlines","code","icao","mng"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of MNG Airlines":"MNB"}}},
{"id":"n-d7788705","guard":[["hasAny",["airline","code","red","threeletter","wings"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Red Wings":"RWZ"}}},
{"id":"n-d7b3482a","guard":[["hasAny",["airlines","code","icao","miat","mongolian"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of MIAT Mongolian Airlines":"MGL"}}},
{"id":"n-d87a1d18","guard":[["has","japan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Air Japan":"AJX"}}},
{"id":"n-daf4570f","guard":[["hasAny",["code","icao","portugalia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Portugalia":"PGA"}}},
{"id":"n-dc71fa0f","guard":[["has","tuifly"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does TUIfly fly under":"HLX"}}},
{"id":"n-dcbc3057","guard":[["hasAny",["code","icao","rossiya","svyaz"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Svyaz Rossiya":"SJM"}}},
{"id":"n-dd1ef8f5","guard":[["has","satena"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does SATENA fly under":"NSE"}}},
{"id":"n-df5c065a","guard":[["hasAny",["czech","holidays"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Holidays Czech Airlines fly under":"HCC"}}},
{"id":"n-e26c4130","guard":[["has","golden"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Golden Air fly under":"GAO"}}},
{"id":"n-e95fc24a","guard":[["hasAny",["air","code","icao","madagascar"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Air Madagascar":"MDG"}}},
{"id":"n-e98235ec","guard":[["hasAny",["aviacion","calima"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Calima Aviacion":"CLI"}}},
{"id":"n-ea31c04f","guard":[["hasAny",["airways","code","fly","hamburg","icao","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Hamburg Airways fly under":"HAY"}}},
{"id":"n-eb14221d","guard":[["hasAny",["airline","code","express","international","one","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Express One International":"LHN"}}},
{"id":"n-ec7d8551","guard":[["hasAny",["air","airline","code","moorea","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Air Moorea":"TAH"}}},
{"id":"n-ec7df867","guard":[["has","potomac"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Potomac Air":"PDC"}}},
{"id":"n-eceb040e","guard":[["hasAny",["air","code","fly","hungary","icao","under","wizz"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Wizz Air Hungary fly under":"WVL"}}},
{"id":"n-ecf978f4","guard":[["has","ibex"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Ibex Airlines":"IBX"}}},
{"id":"n-ed30fdfd","guard":[["has","eritrean"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ICAO code does Eritrean Airlines fly under":"ERT"}}},
{"id":"n-ed36b00b","guard":[["hasAny",["airline","code","jalways","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of JALways":"JAZ"}}},
{"id":"n-ed3ffc99","guard":[["hasAny",["airlines","code","fly","icao","shenzhen","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Shenzhen Airlines fly under":"CSZ"}}},
{"id":"n-ee510a02","guard":[["has","pacific"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Pacific Wings":"NMI"}}},
{"id":"n-ef2217e3","guard":[["hasAny",["air","code","fly","golden","icao","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Golden Air fly under":"GAO"}}},
{"id":"n-ef27ee16","guard":[["hasAny",["air","code","german","icao","international","lines"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of German International Air Lines":"GER"}}},
{"id":"n-f0a6bb10","guard":[["hasAny",["air","code","fly","icao","under","wisconsin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Air Wisconsin fly under":"AWI"}}},
{"id":"n-f499c9c1","guard":[["hasAny",["argentina","code","icao","lan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ICAO code of LAN Argentina":"DSM"}}},
{"id":"n-f9025903","guard":[["hasAny",["code","fly","icao","tuifly","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does TUIfly fly under":"HLX"}}},
{"id":"n-f92a887a","guard":[["hasAny",["argentina","code","icao","lan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of LAN Argentina":"DSM"}}},
{"id":"n-fa0af1d9","guard":[["hasAny",["lao","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.str",["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fb4ee4e7","guard":[["hasAny",["air","airline","code","threeletter","welcome"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Welcome Air":"WLC"}}},
{"id":"n-fc25bcd1","guard":[["hasAny",["airways","code","dynamic","fly","icao","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does Dynamic Airways fly under":"DYA"}}},
{"id":"n-fc4001d9","guard":[["hasAny",["airlines","code","fly","go","icao","one","two","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does One Two Go Airlines fly under":"OTG"}}},
{"id":"n-fc4d21d7","guard":[["hasAny",["code","fly","icao","satena","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ICAO code does SATENA fly under":"NSE"}}},
{"id":"n-fca63758","guard":[["hasAny",["airlines","code","icao","mandala"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ICAO code of Mandala Airlines":"MDL"}}},
{"id":"n-fd7e1d41","guard":[["hasAny",["air","airline","code","potomac","threeletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the three-letter airline code of Potomac Air":"PDC"}}},
{"id":"n-0618d365","guard":[["hasAny",["a to z","alphabetical","alphabetize","lao","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["sense.content"]]]],"mem":null},
{"id":"n-0e230d82","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kbz","no vowels","remove vowels","title case","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-6cc6f7ad","guard":[["hasAny",["item number","lao","nth","position"]],["has","what"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7e67132e","guard":[["hasAny",["invert case","lao","shortest","shortest one","shortest word","swap case","toggle case"]],["has","what"]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-8ca6d926","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kbz","no vowels","remove vowels","title case","without vowels"]]],"pyramid":["render.str",["transform.title",["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-95a07bdb","guard":[["hasAny",["kbz","lower case","lowercase","no vowels","remove vowels","small letters","without vowels"]]],"pyramid":["render.str",["transform.lower",["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-9b70ff61","guard":[["hasAny",["all caps","capital letters","capitals","kbz","no vowels","remove vowels","upper case","uppercase","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.upper",["sense.lastWord"]]]],"mem":null},
{"id":"n-bafcb07a","guard":[["hasAny",["invert case","kbz","no vowels","remove vowels","swap case","toggle case","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.swapCase",["sense.lastWord"]]]],"mem":null},
{"id":"n-c5fddd8e","guard":[["hasAny",["item number","kbz","nth","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d5974b9f","guard":[["hasAny",["kbz","normalise","normalize","simplify the text"]]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-eb3814ab","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lao","shortest","shortest one","shortest word","title case"]],["has","what"]],"pyramid":["render.str",["transform.title",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-f463c81d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","kbz","swap case","title case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-fdf898dc","guard":[["hasAny",["alphabetize the letters","capitalise","capitalize","capitalize each word","kbz","letters in order","sort the letters","title case"]]],"pyramid":["render.str",["transform.sortLetters",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-03a382b9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","delete","kbz","remove","strip out","title case","without"]]],"pyramid":["render.str",["transform.remove",["transform.title",["sense.lastWord"]],["sense.lastWord"]]],"mem":null},
{"id":"n-0865886d","guard":[["hasAny",["digit count","how many digits","kbz","number of digits"]]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-09817d87","guard":[["hasAny",["digit count","how many digits","kbz","number of digits"]]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-143fa805","guard":[["hasAny",["delete","kbz","lower case","lowercase","remove","small letters","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["transform.lower",["sense.lastWord"]]]],"mem":null},
{"id":"n-148a1752","guard":[["hasAny",["from position","items from to","kbz","slice"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]],"mem":null},
{"id":"n-1b3edb04","guard":[["hasAny",["half","half of","halve","item number","kbz","nth","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["transform.half",["sense.wordCount"]]]],"mem":null},
{"id":"n-1c947cbd","guard":[["hasAny",["distinct","item number","kbz","nth","position","remove duplicates","unique","without repeats"]]],"pyramid":["render.str",["transform.nthStr",["transform.uniqueStrs",["sense.words"]],["sense.wordCount"]]],"mem":null},
{"id":"n-1ccf0979","guard":[["hasAny",["alphabetize the letters","delete","kbz","letters in order","remove","sort the letters","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["transform.sortLetters",["sense.lastWord"]]]],"mem":null},
{"id":"n-20e80f9a","guard":[["hasAny",["add the digits","digit sum","item number","kbz","nth","position","sum of the digits"]]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-29aeb1b4","guard":[["hasAny",["backwards","delete","kbz","mirror","remove","reversed","spell backwards","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["transform.reverse",["sense.lastWord"]]]],"mem":null},
{"id":"n-30938f2f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kbz","normalise","normalize","simplify the text","title case"]]],"pyramid":["render.str",["transform.title",["transform.norm",["sense.lastWord"],{"lit":2}]]],"mem":null},
{"id":"n-3d2aff86","guard":[["hasAny",["delete","kbz","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-41617b21","guard":[["hasAny",["delete","lao","remove","strip out","without"]],["has","what"]],"pyramid":["render.str",["transform.remove",["sense.after",{"lit":"of"}],["sense.lastWord"]]],"mem":null},
{"id":"n-4322f861","guard":[["hasAny",["lao","separate by","split","split by"]],["has","what"]],"pyramid":["render.list",["transform.split",["sense.after",{"lit":"of"}],["sense.lastWord"]]],"mem":null},
{"id":"n-46397842","guard":[["hasAny",["divisor count","how many factors","item number","kbz","nth","number of divisors","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-49cf4e5d","guard":[["hasAny",["backwards","item number","lao","nth","position","reverse order","reversed"]],["has","what"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":2}]],"mem":null},
{"id":"n-536f0b12","guard":[["hasAny",["from position","items from to","kbz","slice"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]],"mem":null},
{"id":"n-559cc739","guard":[["hasAny",["first n","lao","shortest","shortest one","shortest word","take"]],["has","what"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-5e581a2f","guard":[["hasAny",["delete","kbz","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.before",{"lit":"of"}]]],"mem":null},
{"id":"n-63f6e4f2","guard":[["hasAny",["delete","kbz","lower case","lowercase","remove","small letters","strip out","without"]]],"pyramid":["render.str",["transform.remove",["transform.lower",["sense.lastWord"]],["sense.lastWord"]]],"mem":null},
{"id":"n-6df11b16","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","lao","nth","position","title case"]],["has","what"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-7597957d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","delete","kbz","remove","strip out","title case","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-7816f7f4","guard":[["hasAny",["first n","lao","shortest","shortest one","shortest word","take"]],["has","what"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-7c41fea0","guard":[["hasAny",["from position","items from to","kbz","slice"]]],"pyramid":["render.and",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]],"mem":null},
{"id":"n-7f5a91ce","guard":[["hasAny",["how many items","item number","kbz","nth","number of items","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-7fc9770a","guard":[["hasAny",["first n","lao","shortest","shortest one","shortest word","take"]],["has","what"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":5}]]],"mem":null},
{"id":"n-843feb26","guard":[["hasAny",["before","item number","lao","nth","one less","position","predecessor","previous"]],["has","what"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["transform.prev",["sense.wordCount"]]]],"mem":null},
{"id":"n-9e5a0896","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","kbz","nth","position","title case"]]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-9f312cf2","guard":[["hasAny",["from position","items from to","kbz","slice"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]],"mem":null},
{"id":"n-9fa5fc10","guard":[["hasAny",["consonant count","how many consonants","kbz","normalise","normalize","number of consonants","simplify the text"]]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-aad873f8","guard":[["hasAny",["delete","kbz","longest","longest one","longest word","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["aggregate.longest",["sense.content"]]]],"mem":null},
{"id":"n-ae6e1a19","guard":[["hasAny",["invert case","item number","kbz","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-bfa633a1","guard":[["hasAny",["copies","digit count","how many digits","kbz","number of digits","say it times"]]],"pyramid":["render.str",["transform.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-c2f30499","guard":[["hasAny",["digit count","how many digits","kbz","number of digits"]]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-c6b9e36d","guard":[["hasAny",["invert case","item number","lao","nth","position","swap case","toggle case"]],["has","what"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-c7641fed","guard":[["hasAny",["from position","items from to","kbz","slice"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]],"mem":null},
{"id":"n-c90e4aa2","guard":[["hasAny",["how many vowels","kbz","normalise","normalize","number of vowels","simplify the text","vowel count"]]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-cc204fbf","guard":[["hasAny",["each word","lao","shortest","shortest one","shortest word","split into words","words"]],["has","what"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-d9d4330d","guard":[["hasAny",["invert case","kbz","normalise","normalize","simplify the text","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["transform.norm",["sense.lastWord"],{"lit":2}]]],"mem":null},
{"id":"n-dc98b589","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","ryan","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-ddaf994e","guard":[["hasAny",["delete","kbz","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"icao"}]]],"mem":null},
{"id":"n-e403df56","guard":[["hasAny",["how many words","item number","kbz","nth","number of words","position","word count"]]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.words",["sense.text"]]]],"mem":null},
{"id":"n-e78c6931","guard":[["hasAny",["character count","how many characters","kbz","length","normalise","normalize","number of characters","simplify the text"]]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-ef0889bb","guard":[["hasAny",["delete","kbz","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-f67fcbbc","guard":[["hasAny",["from position","items from to","kbz","slice"]]],"pyramid":["render.and",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]],"mem":null},
{"id":"n-f8224db2","guard":[["hasAny",["each word","item number","kbz","nth","position","split into words"]]],"pyramid":["render.str",["transform.nthStr",["transform.words",["sense.text"]],["sense.wordCount"]]],"mem":null},
{"id":"n-2fa1cedb","guard":[["hasAny",["from position","items from to","lao","shortest","shortest one","shortest word","slice"]],["has","what"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-5bf29560","guard":[["hasAny",["from position","items from to","kbz","longest","longest one","longest word","slice"]]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]]],"mem":null},
{"id":"n-7b96062e","guard":[["hasAny",["from position","items from to","lao","shortest","shortest one","shortest word","slice"]],["has","what"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":2},["sense.wordCount"]]]],"mem":null},
{"id":"n-ab85f41f","guard":[["hasAny",["from position","items from to","kbz","longest","longest one","longest word","slice"]]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]]],"mem":null},
{"id":"n-bc01241b","guard":[["hasAny",["from position","items from to","kbz","shortest","shortest one","shortest word","slice"]]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]]],"mem":null},
{"id":"n-bc30e280","guard":[["hasAny",["from position","items from to","lao","shortest","shortest one","shortest word","slice"]],["has","what"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]]],"mem":null},
{"id":"n-be40bfcc","guard":[["hasAny",["from position","items from to","lao","shortest","shortest one","shortest word","slice"]],["has","what"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":2},{"lit":3}]]],"mem":null},
{"id":"n-c5fe1341","guard":[["hasAny",["from position","items from to","lao","shortest","shortest one","shortest word","slice"]],["has","what"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":2},{"lit":5}]]],"mem":null},
{"id":"n-c935052e","guard":[["hasAny",["from position","items from to","lao","shortest","shortest one","shortest word","slice"]],["has","what"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":2},{"lit":4}]]],"mem":null},
{"id":"n-dccbb8ea","guard":[["hasAny",["change to","kbz","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.after",{"lit":"of"}],["sense.text"]]],"mem":null},
{"id":"n-eb6c2812","guard":[["hasAny",["from position","items from to","lao","shortest","shortest one","shortest word","slice"]],["has","what"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]]],"mem":null},
{"id":"n-ee56882f","guard":[["hasAny",["from position","items from to","kbz","shortest","shortest one","shortest word","slice"]]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which ICAO code does One Two Go Airlines fly under","expect":{"equals":"OTG","notRefusal":true}},{"q":"give the three-letter airline code of Ibex Airlines","expect":{"equals":"IBX","notRefusal":true}},{"q":"which ICAO code does Bering Air fly under","expect":{"equals":"BRG","notRefusal":true}},{"q":"what is the ICAO code of MIAT Mongolian Airlines","expect":{"equals":"MGL","notRefusal":true}},{"q":"which ICAO code does Apache Air fly under","expect":{"equals":"IWA","notRefusal":true}},{"q":"give the three-letter airline code of Malmo Aviation","expect":{"equals":"SCW","notRefusal":true}},{"q":"what is the ICAO code of Blue1","expect":{"equals":"BLF","notRefusal":true}},{"q":"what is the ICAO code of Lao Airlines","expect":{"equals":"LAO","notRefusal":true}},{"q":"which ICAO code does ZABAIKAL AIRLINES fly under","expect":{"equals":"ZTT","notRefusal":true}},{"q":"what is the ICAO code of Buquebus Líneas Aéreas","expect":{"equals":"BQB","notRefusal":true}},{"q":"which ICAO code does Air Wisconsin fly under","expect":{"equals":"AWI","notRefusal":true}},{"q":"what is the ICAO code of Portugalia","expect":{"equals":"PGA","notRefusal":true}},{"q":"which ICAO code does Holidays Czech Airlines fly under","expect":{"equals":"HCC","notRefusal":true}},{"q":"which ICAO code does Korongo Airlines fly under","expect":{"equals":"KGO","notRefusal":true}},{"q":"which ICAO code does ATUR fly under","expect":{"equals":"TUR","notRefusal":true}},{"q":"give the three-letter airline code of GX Airlines","expect":{"equals":"CBG","notRefusal":true}},{"q":"what is the ICAO code of LAN Argentina","expect":{"equals":"DSM","notRefusal":true}},{"q":"what is the ICAO code of TransBrasil Airlines","expect":{"equals":"THS","notRefusal":true}},{"q":"which ICAO code does Andalus Lineas Aereas fly under","expect":{"equals":"ANU","notRefusal":true}},{"q":"give the three-letter airline code of Red Wings","expect":{"equals":"RWZ","notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
