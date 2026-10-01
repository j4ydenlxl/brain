// airline-country-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"airline-country-neo-g6","class":"airline-country","generation":6,"lane":"neo","grownFrom":["where is the airline Air Lituanica based","name the home country of OCEAN AIR CARGO","which country is the airline Kosmos from","name the home country of Spicejet","name the home country of Tianjin Airlines","which country is the airline Air Explore from","which country is the airline LSM Airlines from","which country is the airline Orbest from","which country is the airline Aero Contractors from","where is the airline Liberty Airways based","which country is the airline Aeronautica Militare from","which country is the airline Skywest Airlines from","where is the airline Yuzhmashavia based","name the home country of Alrosa Mirny Air Enterprise","which country is the airline Pobeda from","which country is the airline Hex'Air from","which country is the airline NEXT Brasil from","name the home country of bmi","where is the airline EuropeSky based","name the home country of Avient Aviation"],"version":1});

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
{"id":"n-87edf31f","guard":[["hasAny",["airline","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Air Lituanica based":"Air Lituanica is an airline of Lithuania.","name the home country of OCEAN AIR CARGO":"OCEAN AIR CARGO is an airline of India.","which country is the airline Kosmos from":"Kosmos is an airline of Russia.","name the home country of Spicejet":"Spicejet is an airline of India.","name the home country of Tianjin Airlines":"Tianjin Airlines is an airline of China.","which country is the airline Air Explore from":"Air Explore is an airline of Slovakia.","which country is the airline LSM Airlines from":"LSM Airlines is an airline of Russia.","which country is the airline Orbest from":"Orbest is an airline of Portugal.","which country is the airline Aero Contractors from":"Aero Contractors is an airline of Nigeria.","where is the airline Liberty Airways based":"Liberty Airways is an airline of United States.","which country is the airline Aeronautica Militare from":"Aeronautica Militare is an airline of Italy.","which country is the airline Skywest Airlines from":"Skywest Airlines is an airline of Australia.","where is the airline Yuzhmashavia based":"Yuzhmashavia is an airline of Ukraine.","name the home country of Alrosa Mirny Air Enterprise":"Alrosa Mirny Air Enterprise is an airline of Russia.","which country is the airline Pobeda from":"Pobeda is an airline of Russia.","which country is the airline Hex'Air from":"Hex'Air is an airline of France.","which country is the airline NEXT Brasil from":"NEXT Brasil is an airline of Brazil.","name the home country of bmi":"bmi is an airline of United Kingdom.","where is the airline EuropeSky based":"EuropeSky is an airline of Germany.","name the home country of Avient Aviation":"Avient Aviation is an airline of Zimbabwe.","where is the airline SOCHI AIR CHATER based":"SOCHI AIR CHATER is an airline of Russia.","name the home country of Bingo Airways":"Bingo Airways is an airline of Poland.","name the home country of Blue Wings":"Blue Wings is an airline of Germany.","name the home country of AirAsia X":"AirAsia X is an airline of Malaysia.","name the home country of Air VIA":"Air VIA is an airline of Bulgaria.","which country is the airline Vladivostok Air from":"Vladivostok Air is an airline of Russia.","where is the airline El-Buraq Air Transport based":"El-Buraq Air Transport is an airline of Libya.","which country is the airline AeroMéxico from":"AeroMéxico is an airline of Mexico.","where is the airline Nationwide Airlines based":"Nationwide Airlines is an airline of South Africa.","where is the airline Baltic Airlines based":"Baltic Airlines is an airline of Russia.","which country is the airline Blue1 from":"Blue1 is an airline of Finland.","name the home country of Shaheen Air International":"Shaheen Air International is an airline of Pakistan.","which country is the airline TransBrasil Airlines from":"TransBrasil Airlines is an airline of Brazil.","name the home country of Whitejets":"Whitejets is an airline of Brazil.","name the home country of Pacific Wings":"Pacific Wings is an airline of United States.","where is the airline Cayman Airways based":"Cayman Airways is an airline of Cayman Islands.","which country is the airline Airlines PNG from":"Airlines PNG is an airline of Papua New Guinea.","where is the airline Ocean Air based":"Ocean Air is an airline of Mauritania.","name the home country of Air Transat":"Air Transat is an airline of Canada.","which country is the airline CCML Airlines from":"CCML Airlines is an airline of Colombia.","which country is the airline Uni Air from":"Uni Air is an airline of Taiwan.","name the home country of Zabaykalskii Airlines":"Zabaykalskii Airlines is an airline of Russia.","where is the airline Air Korea Co. Ltd. based":"Air Korea Co. Ltd. is an airline of Republic of Korea.","name the home country of Aerolane":"Aerolane is an airline of Ecuador.","where is the airline Atlas Air based":"Atlas Air is an airline of United States.","name the home country of Air Macau":"Air Macau is an airline of Macao.","where is the airline Lao Airlines based":"Lao Airlines is an airline of Lao Peoples Democratic Republic.","which country is the airline Kuban Airlines from":"Kuban Airlines is an airline of Russia.","which country is the airline United Airlines from":"United Airlines is an airline of United States.","which country is the airline Happy Air from":"Happy Air is an airline of Thailand.","where is the airline Transwest Air based":"Transwest Air is an airline of Canada.","name the home country of Porter Airlines":"Porter Airlines is an airline of Canada.","which country is the airline Flyhy Cargo Airlines from":"Flyhy Cargo Airlines is an airline of Thailand.","name the home country of Southjet cargo":"Southjet cargo is an airline of United States.","where is the airline Shandong Airlines based":"Shandong Airlines is an airline of China.","where is the airline Orient Thai Airlines based":"Orient Thai Airlines is an airline of Thailand.","name the home country of All America US":"All America US is an airline of United States.","name the home country of Lufttransport":"Lufttransport is an airline of Norway.","which country is the airline Finncomm Airlines from":"Finncomm Airlines is an airline of Finland.","where is the airline Royal Air Cambodge based":"Royal Air Cambodge is an airline of Cambodia.","name the home country of Hageland Aviation Services":"Hageland Aviation Services is an airline of United States.","where is the airline Flybaboo based":"Flybaboo is an airline of Switzerland.","where is the airline JALways based":"JALways is an airline of Japan.","where is the airline Delta Aerotaxi based":"Delta Aerotaxi is an airline of Italy.","where is the airline Flugfelag Vestmannaeyja based":"Flugfelag Vestmannaeyja is an airline of Iceland.","name the home country of Hong Kong Airlines":"Hong Kong Airlines is an airline of Hong Kong SAR of China.","where is the airline TUIfly based":"TUIfly is an airline of Germany.","which country is the airline Sriwijaya Air from":"Sriwijaya Air is an airline of Indonesia.","which country is the airline Turkish Air Force from":"Turkish Air Force is an airline of Turkey.","where is the airline Air Ivoire based":"Air Ivoire is an airline of Ivory Coast.","where is the airline Saratov Aviation Division based":"Saratov Aviation Division is an airline of Russia.","name the home country of Niki":"Niki is an airline of Austria.","which country is the airline Aerolineas heredas santa maria from":"Aerolineas heredas santa maria is an airline of Dominican Republic.","where is the airline Sharp Airlines based":"Sharp Airlines is an airline of Australia.","name the home country of bmibaby":"bmibaby is an airline of United Kingdom.","which country is the airline Conviasa from":"Conviasa is an airline of Venezuela.","where is the airline Olympic Airlines based":"Olympic Airlines is an airline of Greece.","name the home country of Island Air (WP)":"Island Air (WP) is an airline of United States.","where is the airline Midwest Airlines based":"Midwest Airlines is an airline of United States."}}},
{"id":"n-f4f361f6","guard":[["has","airline"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the airline Air Lituanica based":"Air Lituanica is an airline of Lithuania.","the airline Kosmos from":"Kosmos is an airline of Russia.","the airline Air Explore from":"Air Explore is an airline of Slovakia.","the airline LSM Airlines from":"LSM Airlines is an airline of Russia.","the airline Orbest from":"Orbest is an airline of Portugal.","the airline Aero Contractors from":"Aero Contractors is an airline of Nigeria.","the airline Liberty Airways based":"Liberty Airways is an airline of United States.","the airline Aeronautica Militare from":"Aeronautica Militare is an airline of Italy.","the airline Skywest Airlines from":"Skywest Airlines is an airline of Australia.","the airline Yuzhmashavia based":"Yuzhmashavia is an airline of Ukraine.","the airline Pobeda from":"Pobeda is an airline of Russia.","the airline Hex'Air from":"Hex'Air is an airline of France.","the airline NEXT Brasil from":"NEXT Brasil is an airline of Brazil.","the airline EuropeSky based":"EuropeSky is an airline of Germany.","the airline SOCHI AIR CHATER based":"SOCHI AIR CHATER is an airline of Russia.","the airline Vladivostok Air from":"Vladivostok Air is an airline of Russia.","the airline El-Buraq Air Transport based":"El-Buraq Air Transport is an airline of Libya.","the airline AeroMéxico from":"AeroMéxico is an airline of Mexico.","the airline Nationwide Airlines based":"Nationwide Airlines is an airline of South Africa.","the airline Baltic Airlines based":"Baltic Airlines is an airline of Russia.","the airline Blue1 from":"Blue1 is an airline of Finland.","the airline TransBrasil Airlines from":"TransBrasil Airlines is an airline of Brazil.","the airline Cayman Airways based":"Cayman Airways is an airline of Cayman Islands.","the airline Airlines PNG from":"Airlines PNG is an airline of Papua New Guinea.","the airline Ocean Air based":"Ocean Air is an airline of Mauritania.","the airline CCML Airlines from":"CCML Airlines is an airline of Colombia.","the airline Uni Air from":"Uni Air is an airline of Taiwan.","the airline Air Korea Co. Ltd. based":"Air Korea Co. Ltd. is an airline of Republic of Korea.","the airline Atlas Air based":"Atlas Air is an airline of United States.","the airline Lao Airlines based":"Lao Airlines is an airline of Lao Peoples Democratic Republic.","the airline Kuban Airlines from":"Kuban Airlines is an airline of Russia.","the airline United Airlines from":"United Airlines is an airline of United States.","the airline Happy Air from":"Happy Air is an airline of Thailand.","the airline Transwest Air based":"Transwest Air is an airline of Canada.","the airline Flyhy Cargo Airlines from":"Flyhy Cargo Airlines is an airline of Thailand.","the airline Shandong Airlines based":"Shandong Airlines is an airline of China.","the airline Orient Thai Airlines based":"Orient Thai Airlines is an airline of Thailand.","the airline Finncomm Airlines from":"Finncomm Airlines is an airline of Finland.","the airline Royal Air Cambodge based":"Royal Air Cambodge is an airline of Cambodia.","the airline Flybaboo based":"Flybaboo is an airline of Switzerland.","the airline JALways based":"JALways is an airline of Japan.","the airline Delta Aerotaxi based":"Delta Aerotaxi is an airline of Italy.","the airline Flugfelag Vestmannaeyja based":"Flugfelag Vestmannaeyja is an airline of Iceland.","the airline TUIfly based":"TUIfly is an airline of Germany.","the airline Sriwijaya Air from":"Sriwijaya Air is an airline of Indonesia.","the airline Turkish Air Force from":"Turkish Air Force is an airline of Turkey.","the airline Air Ivoire based":"Air Ivoire is an airline of Ivory Coast.","the airline Saratov Aviation Division based":"Saratov Aviation Division is an airline of Russia.","the airline Aerolineas heredas santa maria from":"Aerolineas heredas santa maria is an airline of Dominican Republic.","the airline Sharp Airlines based":"Sharp Airlines is an airline of Australia.","the airline Conviasa from":"Conviasa is an airline of Venezuela.","the airline Olympic Airlines based":"Olympic Airlines is an airline of Greece.","the airline Midwest Airlines based":"Midwest Airlines is an airline of United States."}}},
{"id":"n-8236aef8","guard":[["has","country"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"country"}]]],"mem":{"table":{"of OCEAN AIR CARGO":"OCEAN AIR CARGO is an airline of India.","is the airline Kosmos from":"Kosmos is an airline of Russia.","of Spicejet":"Spicejet is an airline of India.","of Tianjin Airlines":"Tianjin Airlines is an airline of China.","is the airline Air Explore from":"Air Explore is an airline of Slovakia.","is the airline LSM Airlines from":"LSM Airlines is an airline of Russia.","is the airline Orbest from":"Orbest is an airline of Portugal.","is the airline Aero Contractors from":"Aero Contractors is an airline of Nigeria.","is the airline Aeronautica Militare from":"Aeronautica Militare is an airline of Italy.","is the airline Skywest Airlines from":"Skywest Airlines is an airline of Australia.","of Alrosa Mirny Air Enterprise":"Alrosa Mirny Air Enterprise is an airline of Russia.","is the airline Pobeda from":"Pobeda is an airline of Russia.","is the airline Hex'Air from":"Hex'Air is an airline of France.","is the airline NEXT Brasil from":"NEXT Brasil is an airline of Brazil.","of bmi":"bmi is an airline of United Kingdom.","of Avient Aviation":"Avient Aviation is an airline of Zimbabwe.","of Bingo Airways":"Bingo Airways is an airline of Poland.","of Blue Wings":"Blue Wings is an airline of Germany.","of AirAsia X":"AirAsia X is an airline of Malaysia.","of Air VIA":"Air VIA is an airline of Bulgaria.","is the airline Vladivostok Air from":"Vladivostok Air is an airline of Russia.","is the airline AeroMéxico from":"AeroMéxico is an airline of Mexico.","is the airline Blue1 from":"Blue1 is an airline of Finland.","of Shaheen Air International":"Shaheen Air International is an airline of Pakistan.","is the airline TransBrasil Airlines from":"TransBrasil Airlines is an airline of Brazil.","of Whitejets":"Whitejets is an airline of Brazil.","of Pacific Wings":"Pacific Wings is an airline of United States.","is the airline Airlines PNG from":"Airlines PNG is an airline of Papua New Guinea.","of Air Transat":"Air Transat is an airline of Canada.","is the airline CCML Airlines from":"CCML Airlines is an airline of Colombia.","is the airline Uni Air from":"Uni Air is an airline of Taiwan.","of Zabaykalskii Airlines":"Zabaykalskii Airlines is an airline of Russia.","of Aerolane":"Aerolane is an airline of Ecuador.","of Air Macau":"Air Macau is an airline of Macao.","is the airline Kuban Airlines from":"Kuban Airlines is an airline of Russia.","is the airline United Airlines from":"United Airlines is an airline of United States.","is the airline Happy Air from":"Happy Air is an airline of Thailand.","of Porter Airlines":"Porter Airlines is an airline of Canada.","is the airline Flyhy Cargo Airlines from":"Flyhy Cargo Airlines is an airline of Thailand.","of Southjet cargo":"Southjet cargo is an airline of United States.","of All America US":"All America US is an airline of United States.","of Lufttransport":"Lufttransport is an airline of Norway.","is the airline Finncomm Airlines from":"Finncomm Airlines is an airline of Finland.","of Hageland Aviation Services":"Hageland Aviation Services is an airline of United States.","of Hong Kong Airlines":"Hong Kong Airlines is an airline of Hong Kong SAR of China.","is the airline Sriwijaya Air from":"Sriwijaya Air is an airline of Indonesia.","is the airline Turkish Air Force from":"Turkish Air Force is an airline of Turkey.","of Niki":"Niki is an airline of Austria.","is the airline Aerolineas heredas santa maria from":"Aerolineas heredas santa maria is an airline of Dominican Republic.","of bmibaby":"bmibaby is an airline of United Kingdom.","is the airline Conviasa from":"Conviasa is an airline of Venezuela.","of Island Air (WP)":"Island Air (WP) is an airline of United States."}}},
{"id":"n-4d13a1ca","guard":[["has","airline"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"from"}]]],"mem":{"table":{"which country is the airline Kosmos":"Kosmos is an airline of Russia.","which country is the airline Air Explore":"Air Explore is an airline of Slovakia.","which country is the airline LSM Airlines":"LSM Airlines is an airline of Russia.","which country is the airline Orbest":"Orbest is an airline of Portugal.","which country is the airline Aero Contractors":"Aero Contractors is an airline of Nigeria.","which country is the airline Aeronautica Militare":"Aeronautica Militare is an airline of Italy.","which country is the airline Skywest Airlines":"Skywest Airlines is an airline of Australia.","which country is the airline Pobeda":"Pobeda is an airline of Russia.","which country is the airline Hex'Air":"Hex'Air is an airline of France.","which country is the airline NEXT Brasil":"NEXT Brasil is an airline of Brazil.","which country is the airline Vladivostok Air":"Vladivostok Air is an airline of Russia.","which country is the airline AeroMéxico":"AeroMéxico is an airline of Mexico.","which country is the airline Blue1":"Blue1 is an airline of Finland.","which country is the airline TransBrasil Airlines":"TransBrasil Airlines is an airline of Brazil.","which country is the airline Airlines PNG":"Airlines PNG is an airline of Papua New Guinea.","which country is the airline CCML Airlines":"CCML Airlines is an airline of Colombia.","which country is the airline Uni Air":"Uni Air is an airline of Taiwan.","which country is the airline Kuban Airlines":"Kuban Airlines is an airline of Russia.","which country is the airline United Airlines":"United Airlines is an airline of United States.","which country is the airline Happy Air":"Happy Air is an airline of Thailand.","which country is the airline Flyhy Cargo Airlines":"Flyhy Cargo Airlines is an airline of Thailand.","which country is the airline Finncomm Airlines":"Finncomm Airlines is an airline of Finland.","which country is the airline Sriwijaya Air":"Sriwijaya Air is an airline of Indonesia.","which country is the airline Turkish Air Force":"Turkish Air Force is an airline of Turkey.","which country is the airline Aerolineas heredas santa maria":"Aerolineas heredas santa maria is an airline of Dominican Republic.","which country is the airline Conviasa":"Conviasa is an airline of Venezuela."}}},
{"id":"n-c64f1071","guard":[["has","country"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"OCEAN AIR CARGO":"OCEAN AIR CARGO is an airline of India.","Spicejet":"Spicejet is an airline of India.","Tianjin Airlines":"Tianjin Airlines is an airline of China.","Alrosa Mirny Air Enterprise":"Alrosa Mirny Air Enterprise is an airline of Russia.","bmi":"bmi is an airline of United Kingdom.","Avient Aviation":"Avient Aviation is an airline of Zimbabwe.","Bingo Airways":"Bingo Airways is an airline of Poland.","Blue Wings":"Blue Wings is an airline of Germany.","AirAsia X":"AirAsia X is an airline of Malaysia.","Air VIA":"Air VIA is an airline of Bulgaria.","Shaheen Air International":"Shaheen Air International is an airline of Pakistan.","Whitejets":"Whitejets is an airline of Brazil.","Pacific Wings":"Pacific Wings is an airline of United States.","Air Transat":"Air Transat is an airline of Canada.","Zabaykalskii Airlines":"Zabaykalskii Airlines is an airline of Russia.","Aerolane":"Aerolane is an airline of Ecuador.","Air Macau":"Air Macau is an airline of Macao.","Porter Airlines":"Porter Airlines is an airline of Canada.","Southjet cargo":"Southjet cargo is an airline of United States.","All America US":"All America US is an airline of United States.","Lufttransport":"Lufttransport is an airline of Norway.","Hageland Aviation Services":"Hageland Aviation Services is an airline of United States.","Hong Kong Airlines":"Hong Kong Airlines is an airline of Hong Kong SAR of China.","Niki":"Niki is an airline of Austria.","bmibaby":"bmibaby is an airline of United Kingdom.","Island Air (WP)":"Island Air (WP) is an airline of United States."}}},
{"id":"n-646936c3","guard":[["hasAny",["aviation","baltic","chater","delete","kosmos","kuban","lsm","pobeda","remove","strip out","vladivostok","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Russia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-8e1a49e9","guard":[["hasAny",["aviation","baltic","chater","delete","kosmos","kuban","lsm","pobeda","remove","strip out","vladivostok","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"russia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-b162c651","guard":[["hasAny",["alrosa","delete","kosmos","kuban","lsm","pobeda","remove","strip out","vladivostok","without","zabaykalskii"]]],"pyramid":["render.str",["transform.remove",{"lit":"russia"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-bf122905","guard":[["hasAny",["alrosa","delete","kosmos","kuban","lsm","pobeda","remove","strip out","vladivostok","without","zabaykalskii"]]],"pyramid":["render.str",["transform.remove",{"lit":"Russia"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-b2f98a05","guard":[["hasAny",["all","delete","hageland","island","pacific","remove","southjet","strip out","united","without"]],["not",["has","code"]],["not",["has","city"]],["not",["has","capital"]]],"pyramid":["render.str",["transform.remove",{"lit":"United States"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-5adde6d1","guard":[["hasAny",["all","delete","hageland","island","pacific","remove","southjet","strip out","without"]],["has","home"]],"pyramid":["render.str",["transform.remove",{"lit":"United States"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-67ac2f6a","guard":[["hasAny",["delete","kosmos","kuban","lsm","pobeda","remove","strip out","vladivostok","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Russia"},["sense.before",{"lit":"from"}]]],"mem":null},
{"id":"n-b475326d","guard":[["hasAny",["delete","kosmos","kuban","lsm","pobeda","remove","strip out","vladivostok","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"russia"},["sense.before",{"lit":"from"}]]],"mem":null},
{"id":"n-e5b00152","guard":[["hasAny",["atlas","delete","liberty","midwest","remove","strip out","united","without"]],["has","airline"]],"pyramid":["render.str",["transform.remove",{"lit":"United States"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-a82713e0","guard":[["hasAny",["brasil","delete","remove","strip out","transbrasil","whitejets","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Brazil"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-b4c03608","guard":[["hasAny",["cargo","delete","happy","orient","remove","strip out","without"]],["has","airline"]],"pyramid":["render.str",["transform.remove",{"lit":"Thailand"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-edab186a","guard":[["hasAny",["brasil","item number","nth","position","transbrasil","whitejets"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Brazil."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3ae9528f","guard":[["hasAny",["item number","kosmos","nth","pobeda","position","shortest","shortest one","shortest word","vladivostok"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Russia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ddb37add","guard":[["hasAny",["kuban","longest","longest one","longest word","lsm","normalise","normalize","simplify the text","zabaykalskii"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Russia."]},["aggregate.longest",["sense.words"]],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-037849f1","guard":[["hasAny",["item number","normalise","normalize","nth","pacific","position","simplify the text","southjet","united"]],["has","country"],["has","the"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-effb3fd1","guard":[["hasAny",["atlas","item number","liberty","midwest","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9b4604e7","guard":[["hasAny",["all","hageland","island","item number","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-d0d90e0e","guard":[["hasAny",["all","hageland","island","item number","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-943a9c66","guard":[["hasAny",["all","hageland","island","item number","lower case","lowercase","nth","position","small letters"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a93259c0","guard":[["hasAny",["all","capitalise","capitalize","capitalize each word","hageland","island","item number","nth","position","title case"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d736c125","guard":[["hasAny",["all","hageland","invert case","island","item number","nth","position","swap case","toggle case"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e5f27824","guard":[["hasAny",["all","all caps","capital letters","capitals","hageland","island","item number","nth","position","upper case","uppercase"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-807c4894","guard":[["hasAny",["atlas","item number","liberty","midwest","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-84f220a0","guard":[["hasAny",["atlas","item number","liberty","midwest","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-8be99209","guard":[["hasAny",["all","each word","hageland","island","item number","nth","position","split into words"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-aa64a21e","guard":[["hasAny",["item number","kuban","lsm","nth","position","vladivostok"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Russia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c76ccd92","guard":[["hasAny",["all","each word","hageland","island","item number","nth","position","split into words"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-795c5119","guard":[["hasAny",["atlas","first n","item number","liberty","midwest","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-e969a8b0","guard":[["hasAny",["atlas","first n","item number","liberty","midwest","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-55c1f5a5","guard":[["hasAny",["count","europesky","how many","how many items","normalise","normalize","number of items","simplify the text","tuifly"]]],"pyramid":["render.str",["transform.norm",{"lit":"Germany"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-84677977","guard":[["hasAny",["count","how many","how many items","kosmos","normalise","normalize","number of items","pobeda","simplify the text"]]],"pyramid":["render.str",["transform.norm",{"lit":"Russia"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-ce7f510d","guard":[["hasAny",["bmi","bmibaby"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of United Kingdom."]},["sense.lastWord"]],"mem":null},
{"id":"n-1185d795","guard":[["hasAny",["bmi","bmibaby","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of United Kingdom."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-56208909","guard":[["hasAny",["ocean","spicejet"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of India."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-7f85a773","guard":[["hasAny",["bmi","bmibaby"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of United Kingdom."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-c96e6536","guard":[["hasAny",["bmi","bmibaby","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of United Kingdom."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-08a5ca45","guard":[["hasAny",["invert case","ocean","spicejet","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of India."]},["transform.swapCase",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-0c3a620b","guard":[["hasAny",["delete","flyhy","happy","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Thailand"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-0ce02a74","guard":[["hasAny",["bmi","bmibaby","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of United Kingdom."]},["transform.swapCase",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-0dd66feb","guard":[["hasAny",["delete","ocean","remove","spicejet","strip out","without"]],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"India"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-0e5e78b2","guard":[["hasAny",["bmi","bmibaby","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of United Kingdom."]},["transform.title",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-151a5558","guard":[["hasAny",["all caps","capital letters","capitals","ocean","spicejet","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of India."]},["transform.upper",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-271ed68b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ocean","spicejet","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of India."]},["transform.title",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-2d1dd75e","guard":[["hasAny",["blue1","delete","finncomm","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Finland"},["sense.before",{"lit":"from"}]]],"mem":null},
{"id":"n-34122aab","guard":[["hasAny",["delete","remove","sharp","skywest","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Australia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-6202663e","guard":[["hasAny",["all caps","bmi","bmibaby","capital letters","capitals","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of United Kingdom."]},["transform.upper",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-6c1c0cd2","guard":[["hasAny",["bmi","bmibaby","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of United Kingdom."]},["transform.lower",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-720482fa","guard":[["hasAny",["alrosa","delete","remove","strip out","without","zabaykalskii"]]],"pyramid":["render.str",["transform.remove",{"lit":"Russia"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-95ca9597","guard":[["hasAny",["delete","porter","remove","strip out","transat","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Canada"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-9b3d2fb5","guard":[["hasAny",["cargo","delete","happy","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Thailand"},["sense.before",{"lit":"from"}]]],"mem":null},
{"id":"n-9b5eb72b","guard":[["hasAny",["europesky","item number","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Germany."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a2e50f12","guard":[["hasAny",["brasil","delete","remove","strip out","transbrasil","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Brazil"},["sense.before",{"lit":"from"}]]],"mem":null},
{"id":"n-b17ea398","guard":[["hasAny",["brasil","delete","remove","strip out","transbrasil","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",{"lit":"Brazil"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-b3f9430f","guard":[["hasAny",["alrosa","delete","remove","strip out","without","zabaykalskii"]]],"pyramid":["render.str",["transform.remove",{"lit":"russia"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-b58fd49d","guard":[["hasAny",["delete","ocean","remove","spicejet","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"India"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-ba80e9b8","guard":[["hasAny",["blue1","delete","finncomm","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Finland"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-c66c3f6f","guard":[["hasAny",["lower case","lowercase","ocean","small letters","spicejet"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of India."]},["transform.lower",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-c7caafa3","guard":[["hasAny",["delete","europesky","remove","strip out","tuifly","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Germany"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-d758fadb","guard":[["hasAny",["bmi","bmibaby","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of United Kingdom."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-df0a3616","guard":[["hasAny",["blue1","delete","finncomm","remove","strip out","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",{"lit":"Finland"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-e70ca3fa","guard":[["hasAny",["delete","porter","remove","strip out","transat","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Canada"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-5585da57","guard":[["hasAny",["item number","nth","porter","position","transat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Canada."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-da3a0e86","guard":[["hasAny",["item number","nth","pacific","position","southjet"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-064d2da5","guard":[["hasAny",["item number","lower case","lowercase","nth","pacific","position","small letters","southjet"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0e8e1153","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","porter","position","title case","transat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Canada."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3d7e3306","guard":[["hasAny",["item number","kuban","longest","longest one","longest word","lsm","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Russia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-44844ba4","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","pacific","position","southjet","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-7ffa7c57","guard":[["hasAny",["invert case","item number","nth","pacific","position","southjet","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-81bbd022","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","pacific","position","southjet","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-aa8eca3b","guard":[["hasAny",["invert case","item number","nth","porter","position","swap case","toggle case","transat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Canada."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c5d803be","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","porter","position","transat","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Canada."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-ca3c7c21","guard":[["hasAny",["division","item number","longest","longest one","longest word","nth","position","vladivostok"]],["has","is"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Russia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e2319507","guard":[["hasAny",["longest","longest one","longest word","normalise","normalize","simplify the text","southjet","united"]],["has","country"],["has","the"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-f2f33663","guard":[["hasAny",["item number","lower case","lowercase","nth","porter","position","small letters","transat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Canada."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-17603f88","guard":[["hasAny",["item number","normalise","normalize","nth","porter","position","simplify the text","transat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Canada."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-28b42e8e","guard":[["hasAny",["item number","kuban","lsm","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of Russia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3b9b8131","guard":[["hasAny",["item number","kosmos","nth","pobeda","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Russia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5f7f58a6","guard":[["hasAny",["brasil","item number","nth","position","transbrasil"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-67fdacbe","guard":[["hasAny",["each word","item number","nth","pacific","position","southjet","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7087dd78","guard":[["hasAny",["item number","kosmos","nth","pobeda","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Russia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-759d5ff9","guard":[["hasAny",["europesky","item number","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-8a427dc6","guard":[["hasAny",["europesky","item number","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-8ef670ea","guard":[["hasAny",["each word","item number","nth","pacific","position","southjet","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-904efc09","guard":[["hasAny",["happy","item number","nth","orient","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Thailand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9ec5fe5a","guard":[["hasAny",["each word","item number","nth","porter","position","split into words","transat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Canada."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a6ac8b6f","guard":[["hasAny",["europesky","item number","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ca312f3d","guard":[["hasAny",["item number","nth","pacific","position","southjet"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e3fe230f","guard":[["hasAny",["each word","item number","nth","porter","position","split into words","transat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Canada."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fb4314f9","guard":[["hasAny",["item number","nth","porter","position","transat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Canada."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-0158c38e","guard":[["hasAny",["europesky","first n","item number","nth","position","take","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-046235a3","guard":[["hasAny",["europesky","first n","item number","nth","position","take","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-d2bf9e7b","guard":[["hasAny",["item number","kuban","longest","longest one","longest word","lsm","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Russia."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-0bd5ae3d","guard":[["hasAny",["atlas","item number","liberty","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6dde8eac","guard":[["hasAny",["atlas","item number","liberty","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8326e1b8","guard":[["hasAny",["item number","kuban","longest","longest one","longest word","lsm","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Russia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-83fa231a","guard":[["hasAny",["item number","kuban","longest","longest one","longest word","lsm","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Russia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-25bcd1cf","guard":[["hasAny",["hageland","island","item number","normalise","normalize","nth","position","simplify the text"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-b1288fc9","guard":[["hasAny",["chater","division","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d1f678e7","guard":[["hasAny",["brasil","item number","nth","position","transbrasil"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-fbdffdec","guard":[["hasAny",["brasil","item number","nth","position","transbrasil"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-bb86d886","guard":[["hasAny",["chater","division","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-ee3cd638","guard":[["hasAny",["chater","division","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-33d3034e","guard":[["hasAny",["chater","division","first n","item number","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-5cf8b83a","guard":[["hasAny",["chater","division","first n","item number","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-779f7ee3","guard":[["hasAny",["blue1","count","how many","how many items","normalise","normalize","number of items","simplify the text"]],["has","which"]],"pyramid":["render.str",["transform.norm",{"lit":"Finland"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-024d2948","guard":[["hasAny",["international","shaheen"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Shaheen Air International":"Shaheen Air International is an airline of Pakistan."}}},
{"id":"n-03f55113","guard":[["hasAny",["airline","airlines","country","transbrasil"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline TransBrasil Airlines from":"TransBrasil Airlines is an airline of Brazil."}}},
{"id":"n-04388b6b","guard":[["hasAny",["airline","country","hexair"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Hex'Air from":"Hex'Air is an airline of France."}}},
{"id":"n-0576ab4e","guard":[["hasAny",["country","home","name","pacific","wings"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Pacific Wings":"Pacific Wings is an airline of United States."}}},
{"id":"n-0819e0c6","guard":[["hasAny",["airline","airlines","country","finncomm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Finncomm Airlines from":"Finncomm Airlines is an airline of Finland."}}},
{"id":"n-08220d11","guard":[["has","pacific"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Pacific Wings":"Pacific Wings is an airline of United States."}}},
{"id":"n-0ab780d2","guard":[["hasAny",["airways","bingo"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Bingo Airways":"Bingo Airways is an airline of Poland."}}},
{"id":"n-0ac441a7","guard":[["has","lufttransport"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Lufttransport":"Lufttransport is an airline of Norway."}}},
{"id":"n-0b4542e8","guard":[["has","sriwijaya"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Sriwijaya Air from":"Sriwijaya Air is an airline of Indonesia."}}},
{"id":"n-0c69f378","guard":[["has","kosmos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Kosmos from":"Kosmos is an airline of Russia."}}},
{"id":"n-0f3fd494","guard":[["has","aerolane"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Aerolane":"Aerolane is an airline of Ecuador."}}},
{"id":"n-103c85e1","guard":[["hasAny",["airline","airlines","baltic","based"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Baltic Airlines based":"Baltic Airlines is an airline of Russia."}}},
{"id":"n-109fbe51","guard":[["has","niki"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Niki":"Niki is an airline of Austria."}}},
{"id":"n-132d7425","guard":[["hasAny",["all","america","country","home","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of All America US":"All America US is an airline of United States."}}},
{"id":"n-13d5b679","guard":[["has","explore"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Air Explore from":"Air Explore is an airline of Slovakia."}}},
{"id":"n-16df80d4","guard":[["hasAny",["bmibaby","country","home","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of bmibaby":"bmibaby is an airline of United Kingdom."}}},
{"id":"n-16f6d532","guard":[["hasAny",["air","airline","based","transwest"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Transwest Air based":"Transwest Air is an airline of Canada."}}},
{"id":"n-1891709f","guard":[["has","ocean"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Ocean Air based":"Ocean Air is an airline of Mauritania."}}},
{"id":"n-1c2f4b4a","guard":[["hasAny",["aeronautica","airline","country","militare"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Aeronautica Militare from":"Aeronautica Militare is an airline of Italy."}}},
{"id":"n-1f6e8cd8","guard":[["hasAny",["bmi","country","home","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of bmi":"bmi is an airline of United Kingdom."}}},
{"id":"n-201f0da0","guard":[["has","via"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Air VIA":"Air VIA is an airline of Bulgaria."}}},
{"id":"n-2387c23f","guard":[["hasAny",["airlines","country","home","hong","kong","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Hong Kong Airlines":"Hong Kong Airlines is an airline of Hong Kong SAR of China."}}},
{"id":"n-2487ea85","guard":[["hasAny",["airlines","country","home","name","zabaykalskii"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Zabaykalskii Airlines":"Zabaykalskii Airlines is an airline of Russia."}}},
{"id":"n-2529cd21","guard":[["hasAny",["airline","airlines","cargo","country","flyhy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Flyhy Cargo Airlines from":"Flyhy Cargo Airlines is an airline of Thailand."}}},
{"id":"n-2a41ea33","guard":[["hasAny",["aerolane","country","home","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Aerolane":"Aerolane is an airline of Ecuador."}}},
{"id":"n-2c77802a","guard":[["hasAny",["airline","brasil","country","next"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline NEXT Brasil from":"NEXT Brasil is an airline of Brazil."}}},
{"id":"n-2d0a4cf7","guard":[["has","liberty"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Liberty Airways based":"Liberty Airways is an airline of United States."}}},
{"id":"n-2d3cde70","guard":[["hasAny",["airline","airlines","country","png"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Airlines PNG from":"Airlines PNG is an airline of Papua New Guinea."}}},
{"id":"n-2f1f06d0","guard":[["has","ccml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline CCML Airlines from":"CCML Airlines is an airline of Colombia."}}},
{"id":"n-300ae73c","guard":[["has","whitejets"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Brazil."]},["sense.lastWord"]],"mem":null},
{"id":"n-31d38752","guard":[["hasAny",["aerolineas","airline","country","heredas","maria","santa"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Aerolineas heredas santa maria from":"Aerolineas heredas santa maria is an airline of Dominican Republic."}}},
{"id":"n-341997b1","guard":[["hasAny",["air","airline","atlas","based"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Atlas Air based":"Atlas Air is an airline of United States."}}},
{"id":"n-34fbd4c2","guard":[["hasAny",["air","airline","country","force","turkish"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Turkish Air Force from":"Turkish Air Force is an airline of Turkey."}}},
{"id":"n-354da7e1","guard":[["has","lao"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Lao Airlines based":"Lao Airlines is an airline of Lao Peoples Democratic Republic."}}},
{"id":"n-358dec53","guard":[["hasAny",["airline","airlines","based","lao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Lao Airlines based":"Lao Airlines is an airline of Lao Peoples Democratic Republic."}}},
{"id":"n-362b9b1e","guard":[["has","transwest"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Transwest Air based":"Transwest Air is an airline of Canada."}}},
{"id":"n-366283c5","guard":[["has","zabaykalskii"]],"pyramid":["render.template",{"lit":["Zabaykalskii ",{"slot":0}," is an airline of Russia."]},["sense.lastWord"]],"mem":null},
{"id":"n-3673612b","guard":[["hasAny",["aerolineas","airline","country","heredas","maria","santa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Aerolineas heredas santa maria from":"Aerolineas heredas santa maria is an airline of Dominican Republic."}}},
{"id":"n-36b1e4ab","guard":[["has","blue"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Blue Wings":"Blue Wings is an airline of Germany."}}},
{"id":"n-3aee5d26","guard":[["hasAny",["orient","thai"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Orient Thai Airlines based":"Orient Thai Airlines is an airline of Thailand."}}},
{"id":"n-3c654506","guard":[["hasAny",["aero","airline","contractors","country"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Aero Contractors from":"Aero Contractors is an airline of Nigeria."}}},
{"id":"n-3ee5e6f7","guard":[["hasAny",["all","america"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of All America US":"All America US is an airline of United States."}}},
{"id":"n-42405ffc","guard":[["hasAny",["aerotaxi","airline","based","delta"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Delta Aerotaxi based":"Delta Aerotaxi is an airline of Italy."}}},
{"id":"n-42590178","guard":[["has","transbrasil"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline TransBrasil Airlines from":"TransBrasil Airlines is an airline of Brazil."}}},
{"id":"n-4456d2fb","guard":[["hasAny",["country","home","lufttransport","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Lufttransport":"Lufttransport is an airline of Norway."}}},
{"id":"n-450c4e41","guard":[["hasAny",["air","country","home","name","transat"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Air Transat":"Air Transat is an airline of Canada."}}},
{"id":"n-47474e89","guard":[["has","spicejet"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of India."]},["sense.lastWord"]],"mem":null},
{"id":"n-4c7211f3","guard":[["has","skywest"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Skywest Airlines from":"Skywest Airlines is an airline of Australia."}}},
{"id":"n-4dab3a36","guard":[["has","lsm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline LSM Airlines from":"LSM Airlines is an airline of Russia."}}},
{"id":"n-4f89624c","guard":[["has","avient"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Avient Aviation":"Avient Aviation is an airline of Zimbabwe."}}},
{"id":"n-50d29525","guard":[["hasAny",["airline","airlines","country","kuban"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Kuban Airlines from":"Kuban Airlines is an airline of Russia."}}},
{"id":"n-50d65380","guard":[["hasAny",["air","airline","country","happy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Happy Air from":"Happy Air is an airline of Thailand."}}},
{"id":"n-5456022b","guard":[["hasAny",["airways","bingo","country","home","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Bingo Airways":"Bingo Airways is an airline of Poland."}}},
{"id":"n-548a3d74","guard":[["hasAny",["airline","aviation","based","division","saratov"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Saratov Aviation Division based":"Saratov Aviation Division is an airline of Russia."}}},
{"id":"n-552a9a69","guard":[["hasAny",["airline","country","pobeda"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Pobeda from":"Pobeda is an airline of Russia."}}},
{"id":"n-5543f3fa","guard":[["hasAny",["airline","country","orbest"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Orbest from":"Orbest is an airline of Portugal."}}},
{"id":"n-55cf6603","guard":[["has","finncomm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Finncomm Airlines from":"Finncomm Airlines is an airline of Finland."}}},
{"id":"n-573a2efc","guard":[["hasAny",["airline","country","kosmos"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Kosmos from":"Kosmos is an airline of Russia."}}},
{"id":"n-6106cea2","guard":[["has","atlas"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Atlas Air based":"Atlas Air is an airline of United States."}}},
{"id":"n-6608032f","guard":[["hasAny",["country","home","name","whitejets"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Whitejets":"Whitejets is an airline of Brazil."}}},
{"id":"n-662b8447","guard":[["has","ivoire"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Air Ivoire based":"Air Ivoire is an airline of Ivory Coast."}}},
{"id":"n-663ab6b6","guard":[["has","transat"]],"pyramid":["render.template",{"lit":["Air ",{"slot":0}," is an airline of Canada."]},["sense.lastWord"]],"mem":null},
{"id":"n-6665c3de","guard":[["has","transat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Air Transat":"Air Transat is an airline of Canada."}}},
{"id":"n-66877a9b","guard":[["hasAny",["airline","based","flugfelag","vestmannaeyja"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Flugfelag Vestmannaeyja based":"Flugfelag Vestmannaeyja is an airline of Iceland."}}},
{"id":"n-678024e4","guard":[["hasAny",["air","airline","based","lituanica"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Air Lituanica based":"Air Lituanica is an airline of Lithuania."}}},
{"id":"n-67f6ac20","guard":[["hasAny",["airline","based","flybaboo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Flybaboo based":"Flybaboo is an airline of Switzerland."}}},
{"id":"n-693676a6","guard":[["hasAny",["alrosa","enterprise","mirny"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Alrosa Mirny Air Enterprise":"Alrosa Mirny Air Enterprise is an airline of Russia."}}},
{"id":"n-69894572","guard":[["has","olympic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Olympic Airlines based":"Olympic Airlines is an airline of Greece."}}},
{"id":"n-6a261809","guard":[["has","baltic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Baltic Airlines based":"Baltic Airlines is an airline of Russia."}}},
{"id":"n-6ab35c89","guard":[["hasAny",["cargo","flyhy"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Flyhy Cargo Airlines from":"Flyhy Cargo Airlines is an airline of Thailand."}}},
{"id":"n-6c052615","guard":[["has","aerolane"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Ecuador."]},["sense.lastWord"]],"mem":null},
{"id":"n-6f378d99","guard":[["has","southjet"]],"pyramid":["render.template",{"lit":["Southjet ",{"slot":0}," is an airline of United States."]},["sense.lastWord"]],"mem":null},
{"id":"n-7056645b","guard":[["hasAny",["airline","airways","based","liberty"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Liberty Airways based":"Liberty Airways is an airline of United States."}}},
{"id":"n-706cd494","guard":[["hasAny",["aero","airline","contractors","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Aero Contractors from":"Aero Contractors is an airline of Nigeria."}}},
{"id":"n-71f6da42","guard":[["hasAny",["airline","airlines","country","skywest"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Skywest Airlines from":"Skywest Airlines is an airline of Australia."}}},
{"id":"n-73a0c299","guard":[["has","sharp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Sharp Airlines based":"Sharp Airlines is an airline of Australia."}}},
{"id":"n-73f4ef27","guard":[["hasAny",["air","airline","based","ocean"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Ocean Air based":"Ocean Air is an airline of Mauritania."}}},
{"id":"n-74ffd525","guard":[["hasAny",["blue","country","home","name","wings"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Blue Wings":"Blue Wings is an airline of Germany."}}},
{"id":"n-7698a676","guard":[["hasAny",["airlines","country","home","name","porter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Porter Airlines":"Porter Airlines is an airline of Canada."}}},
{"id":"n-7767bdb3","guard":[["has","happy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Happy Air from":"Happy Air is an airline of Thailand."}}},
{"id":"n-7a79eff3","guard":[["has","bmi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of bmi":"bmi is an airline of United Kingdom."}}},
{"id":"n-7b37397b","guard":[["hasAny",["airline","airlines","country","lsm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline LSM Airlines from":"LSM Airlines is an airline of Russia."}}},
{"id":"n-7b5520a0","guard":[["has","nationwide"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Nationwide Airlines based":"Nationwide Airlines is an airline of South Africa."}}},
{"id":"n-7cea9a3b","guard":[["hasAny",["airline","airlines","ccml","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline CCML Airlines from":"CCML Airlines is an airline of Colombia."}}},
{"id":"n-7dceb2d2","guard":[["hasAny",["air","airline","based","ivoire"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Air Ivoire based":"Air Ivoire is an airline of Ivory Coast."}}},
{"id":"n-7e70d9ab","guard":[["has","shandong"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Shandong Airlines based":"Shandong Airlines is an airline of China."}}},
{"id":"n-7ecc7cc6","guard":[["hasAny",["air","airline","country","uni"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Uni Air from":"Uni Air is an airline of Taiwan."}}},
{"id":"n-8340b6d5","guard":[["hasAny",["air","country","home","name","via"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Air VIA":"Air VIA is an airline of Bulgaria."}}},
{"id":"n-83b93ad5","guard":[["hasAny",["airline","airlines","based","midwest"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Midwest Airlines based":"Midwest Airlines is an airline of United States."}}},
{"id":"n-858312ad","guard":[["hasAny",["country","home","name","spicejet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Spicejet":"Spicejet is an airline of India."}}},
{"id":"n-88d550fd","guard":[["has","orbest"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Orbest from":"Orbest is an airline of Portugal."}}},
{"id":"n-89d43a39","guard":[["hasAny",["airline","brasil","country","next"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline NEXT Brasil from":"NEXT Brasil is an airline of Brazil."}}},
{"id":"n-8ba20a34","guard":[["hasAny",["airline","conviasa","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Conviasa from":"Conviasa is an airline of Venezuela."}}},
{"id":"n-8bebed5b","guard":[["hasAny",["air","airline","based","co","korea","ltd"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Air Korea Co. Ltd. based":"Air Korea Co. Ltd. is an airline of Republic of Korea."}}},
{"id":"n-90eb420c","guard":[["has","macau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Air Macau":"Air Macau is an airline of Macao."}}},
{"id":"n-92500a4e","guard":[["has","aeroméxico"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline AeroMéxico from":"AeroMéxico is an airline of Mexico."}}},
{"id":"n-93137054","guard":[["hasAny",["airline","airlines","based","orient","thai"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Orient Thai Airlines based":"Orient Thai Airlines is an airline of Thailand."}}},
{"id":"n-9419636c","guard":[["has","blue"],["has","name"]],"pyramid":["render.template",{"lit":["Blue ",{"slot":0}," is an airline of Germany."]},["sense.lastWord"]],"mem":null},
{"id":"n-96096794","guard":[["has","via"]],"pyramid":["render.template",{"lit":["Air ",{"slot":0}," is an airline of Bulgaria."]},["sense.lastWord"]],"mem":null},
{"id":"n-97ef1ef1","guard":[["hasAny",["air","country","home","macau","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Air Macau":"Air Macau is an airline of Macao."}}},
{"id":"n-98413a53","guard":[["has","whitejets"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Whitejets":"Whitejets is an airline of Brazil."}}},
{"id":"n-98928cbe","guard":[["hasAny",["aeroméxico","airline","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline AeroMéxico from":"AeroMéxico is an airline of Mexico."}}},
{"id":"n-997cb000","guard":[["hasAny",["aviation","country","hageland","home","name","services"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Hageland Aviation Services":"Hageland Aviation Services is an airline of United States."}}},
{"id":"n-9dcc1508","guard":[["hasAny",["airline","blue1","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Blue1 from":"Blue1 is an airline of Finland."}}},
{"id":"n-9e78f436","guard":[["has","hexair"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Hex'Air from":"Hex'Air is an airline of France."}}},
{"id":"n-a0150a73","guard":[["hasAny",["aviation","avient","country","home","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Avient Aviation":"Avient Aviation is an airline of Zimbabwe."}}},
{"id":"n-a0f2c9f5","guard":[["has","tuifly"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline TUIfly based":"TUIfly is an airline of Germany."}}},
{"id":"n-a1087ad0","guard":[["has","pacific"],["has","name"]],"pyramid":["render.template",{"lit":["Pacific ",{"slot":0}," is an airline of United States."]},["sense.lastWord"]],"mem":null},
{"id":"n-a11b7ac3","guard":[["hasAny",["airline","airlines","based","olympic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Olympic Airlines based":"Olympic Airlines is an airline of Greece."}}},
{"id":"n-a28b9a65","guard":[["hasAny",["air","airline","based","co","korea","ltd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Air Korea Co. Ltd. based":"Air Korea Co. Ltd. is an airline of Republic of Korea."}}},
{"id":"n-a38b7e48","guard":[["has","jalways"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline JALways based":"JALways is an airline of Japan."}}},
{"id":"n-aaa6f836","guard":[["hasAny",["force","turkish"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Turkish Air Force from":"Turkish Air Force is an airline of Turkey."}}},
{"id":"n-ab50379d","guard":[["has","spicejet"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Spicejet":"Spicejet is an airline of India."}}},
{"id":"n-abe42eaf","guard":[["hasAny",["airline","based","jalways"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline JALways based":"JALways is an airline of Japan."}}},
{"id":"n-af2d1a5c","guard":[["has","niki"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Austria."]},["sense.lastWord"]],"mem":null},
{"id":"n-afba5fe5","guard":[["hasAny",["airline","airlines","based","shandong"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Shandong Airlines based":"Shandong Airlines is an airline of China."}}},
{"id":"n-afbc766e","guard":[["hasAny",["airline","based","flugfelag","vestmannaeyja"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Flugfelag Vestmannaeyja based":"Flugfelag Vestmannaeyja is an airline of Iceland."}}},
{"id":"n-b1190530","guard":[["has","macau"]],"pyramid":["render.template",{"lit":["Air ",{"slot":0}," is an airline of Macao."]},["sense.lastWord"]],"mem":null},
{"id":"n-b259fb28","guard":[["hasAny",["air","airline","based","chater","sochi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline SOCHI AIR CHATER based":"SOCHI AIR CHATER is an airline of Russia."}}},
{"id":"n-b5f1b41b","guard":[["has","cayman"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Cayman Airways based":"Cayman Airways is an airline of Cayman Islands."}}},
{"id":"n-b643d43b","guard":[["hasAny",["airline","airlines","country","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline United Airlines from":"United Airlines is an airline of United States."}}},
{"id":"n-b66a425c","guard":[["has","lufttransport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Norway."]},["sense.lastWord"]],"mem":null},
{"id":"n-b972f970","guard":[["hasAny",["air","airline","based","elburaq","transport"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline El-Buraq Air Transport based":"El-Buraq Air Transport is an airline of Libya."}}},
{"id":"n-ba1f36d0","guard":[["has","png"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Airlines PNG from":"Airlines PNG is an airline of Papua New Guinea."}}},
{"id":"n-bad7b56c","guard":[["hasAny",["airline","based","europesky"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline EuropeSky based":"EuropeSky is an airline of Germany."}}},
{"id":"n-bb598104","guard":[["hasAny",["airlines","country","home","name","tianjin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Tianjin Airlines":"Tianjin Airlines is an airline of China."}}},
{"id":"n-bb670745","guard":[["has","pobeda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Pobeda from":"Pobeda is an airline of Russia."}}},
{"id":"n-bca984b6","guard":[["has","porter"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Porter Airlines":"Porter Airlines is an airline of Canada."}}},
{"id":"n-be081a8c","guard":[["hasAny",["air","airline","country","sriwijaya"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Sriwijaya Air from":"Sriwijaya Air is an airline of Indonesia."}}},
{"id":"n-be0bbb09","guard":[["hasAny",["airasia","country","home","name","x"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of AirAsia X":"AirAsia X is an airline of Malaysia."}}},
{"id":"n-c0130b5c","guard":[["has","lituanica"],["has","where"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Air Lituanica based":"Air Lituanica is an airline of Lithuania."}}},
{"id":"n-c19ffafd","guard":[["has","flybaboo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Flybaboo based":"Flybaboo is an airline of Switzerland."}}},
{"id":"n-c5584b74","guard":[["hasAny",["chater","sochi"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline SOCHI AIR CHATER based":"SOCHI AIR CHATER is an airline of Russia."}}},
{"id":"n-c5fe983c","guard":[["hasAny",["island","wp"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Island Air (WP)":"Island Air (WP) is an airline of United States."}}},
{"id":"n-c93699fe","guard":[["hasAny",["hong","kong"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Hong Kong Airlines":"Hong Kong Airlines is an airline of Hong Kong SAR of China."}}},
{"id":"n-cb7b8282","guard":[["hasAny",["elburaq","transport"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline El-Buraq Air Transport based":"El-Buraq Air Transport is an airline of Libya."}}},
{"id":"n-cc989fdb","guard":[["has","ocean"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of OCEAN AIR CARGO":"OCEAN AIR CARGO is an airline of India."}}},
{"id":"n-cf1bf41b","guard":[["hasAny",["cambodge","royal"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Royal Air Cambodge based":"Royal Air Cambodge is an airline of Cambodia."}}},
{"id":"n-cf737bd8","guard":[["hasAny",["air","country","home","island","name","wp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Island Air (WP)":"Island Air (WP) is an airline of United States."}}},
{"id":"n-d36c50f0","guard":[["hasAny",["airasia","x"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of AirAsia X":"AirAsia X is an airline of Malaysia."}}},
{"id":"n-d6282dc4","guard":[["hasAny",["air","airline","based","cambodge","royal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Royal Air Cambodge based":"Royal Air Cambodge is an airline of Cambodia."}}},
{"id":"n-d64b2065","guard":[["has","yuzhmashavia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Yuzhmashavia based":"Yuzhmashavia is an airline of Ukraine."}}},
{"id":"n-d77d1f79","guard":[["hasAny",["cargo","country","home","name","southjet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Southjet cargo":"Southjet cargo is an airline of United States."}}},
{"id":"n-d8e50c22","guard":[["has","europesky"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline EuropeSky based":"EuropeSky is an airline of Germany."}}},
{"id":"n-d9d557c2","guard":[["has","united"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline United Airlines from":"United Airlines is an airline of United States."}}},
{"id":"n-dac76f5a","guard":[["has","bmibaby"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of bmibaby":"bmibaby is an airline of United Kingdom."}}},
{"id":"n-dacc5c85","guard":[["has","southjet"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Southjet cargo":"Southjet cargo is an airline of United States."}}},
{"id":"n-db947181","guard":[["has","vladivostok"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Vladivostok Air from":"Vladivostok Air is an airline of Russia."}}},
{"id":"n-dbba9d7f","guard":[["has","tianjin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Tianjin Airlines":"Tianjin Airlines is an airline of China."}}},
{"id":"n-dbc5d986","guard":[["hasAny",["airline","based","tuifly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline TUIfly based":"TUIfly is an airline of Germany."}}},
{"id":"n-dd6e335b","guard":[["has","midwest"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Midwest Airlines based":"Midwest Airlines is an airline of United States."}}},
{"id":"n-e05d1970","guard":[["has","kuban"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Kuban Airlines from":"Kuban Airlines is an airline of Russia."}}},
{"id":"n-e1775d07","guard":[["hasAny",["hageland","services"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Hageland Aviation Services":"Hageland Aviation Services is an airline of United States."}}},
{"id":"n-e243936e","guard":[["has","bingo"]],"pyramid":["render.template",{"lit":["Bingo ",{"slot":0}," is an airline of Poland."]},["sense.lastWord"]],"mem":null},
{"id":"n-e550d1bb","guard":[["hasAny",["air","country","home","international","name","shaheen"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Shaheen Air International":"Shaheen Air International is an airline of Pakistan."}}},
{"id":"n-e55314ca","guard":[["hasAny",["air","airline","country","explore"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Air Explore from":"Air Explore is an airline of Slovakia."}}},
{"id":"n-e64bb806","guard":[["hasAny",["air","airline","country","vladivostok"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Vladivostok Air from":"Vladivostok Air is an airline of Russia."}}},
{"id":"n-e7da9991","guard":[["hasAny",["airline","airlines","based","sharp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Sharp Airlines based":"Sharp Airlines is an airline of Australia."}}},
{"id":"n-ef5feeba","guard":[["has","conviasa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Conviasa from":"Conviasa is an airline of Venezuela."}}},
{"id":"n-f1eadd46","guard":[["hasAny",["aerotaxi","airline","based","delta"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Delta Aerotaxi based":"Delta Aerotaxi is an airline of Italy."}}},
{"id":"n-f61450d9","guard":[["hasAny",["airline","airways","based","cayman"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Cayman Airways based":"Cayman Airways is an airline of Cayman Islands."}}},
{"id":"n-f79a8832","guard":[["hasAny",["airline","based","yuzhmashavia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Yuzhmashavia based":"Yuzhmashavia is an airline of Ukraine."}}},
{"id":"n-f7b0fa9b","guard":[["hasAny",["air","alrosa","country","enterprise","home","mirny","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Alrosa Mirny Air Enterprise":"Alrosa Mirny Air Enterprise is an airline of Russia."}}},
{"id":"n-f86221ee","guard":[["hasAny",["airline","airlines","based","nationwide"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Nationwide Airlines based":"Nationwide Airlines is an airline of South Africa."}}},
{"id":"n-fa145762","guard":[["hasAny",["airline","aviation","based","division","saratov"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Saratov Aviation Division based":"Saratov Aviation Division is an airline of Russia."}}},
{"id":"n-fb9a530e","guard":[["has","uni"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Uni Air from":"Uni Air is an airline of Taiwan."}}},
{"id":"n-fc6ebdb7","guard":[["hasAny",["country","home","name","niki"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Niki":"Niki is an airline of Austria."}}},
{"id":"n-fd73e8fe","guard":[["hasAny",["air","cargo","country","home","name","ocean"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of OCEAN AIR CARGO":"OCEAN AIR CARGO is an airline of India."}}},
{"id":"n-fe3c034d","guard":[["has","zabaykalskii"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Zabaykalskii Airlines":"Zabaykalskii Airlines is an airline of Russia."}}},
{"id":"n-fedfe218","guard":[["hasAny",["aeronautica","airline","country","militare"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Aeronautica Militare from":"Aeronautica Militare is an airline of Italy."}}},
{"id":"n-001b8b9d","guard":[["hasAny",["longest","longest one","longest word","porter"]]],"pyramid":["render.template",{"lit":["Porter ",{"slot":0}," is an airline of Canada."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0b92133d","guard":[["hasAny",["flybaboo","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Switzerland."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0fc3758e","guard":[["hasAny",["invert case","niki","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Austria."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-107a8ca3","guard":[["hasAny",["longest","longest one","longest word","southjet"]]],"pyramid":["render.template",{"lit":[{"slot":0}," cargo is an airline of United States."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-24ee01e6","guard":[["hasAny",["longest","longest one","longest word","tianjin"]]],"pyramid":["render.template",{"lit":["Tianjin ",{"slot":0}," is an airline of China."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-25b2bb32","guard":[["hasAny",["lower case","lowercase","small letters","whitejets"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Brazil."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3431691a","guard":[["hasAny",["longest","longest one","longest word","lufttransport"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Norway."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3fa75a75","guard":[["has","lufttransport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Norway."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-48b727b0","guard":[["hasAny",["aerolane","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Ecuador."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4c7ae365","guard":[["hasAny",["longest","longest one","longest word","spicejet"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of India."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-50f7dc1a","guard":[["hasAny",["longest","longest one","longest word","whitejets"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Brazil."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-56c3054a","guard":[["hasAny",["lower case","lowercase","niki","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Austria."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6df6c647","guard":[["hasAny",["lower case","lowercase","small letters","spicejet"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of India."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8b8ea959","guard":[["hasAny",["longest","longest one","longest word","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":["TUIfly is an ",{"slot":0}," of Germany."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a68db44f","guard":[["hasAny",["europesky","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Germany."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b8c16216","guard":[["has","niki"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Austria."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-c3be7ed4","guard":[["hasAny",["longest","longest one","longest word","yuzhmashavia"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Ukraine."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c71f6545","guard":[["hasAny",["bmi","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of United Kingdom."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c82f2c0e","guard":[["hasAny",["aeroméxico","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Mexico."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d3ce919a","guard":[["hasAny",["lower case","lowercase","lufttransport","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Norway."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d4bb15d5","guard":[["hasAny",["longest","longest one","longest word","zabaykalskii"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an airline of Russia."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-dd4be62d","guard":[["hasAny",["conviasa","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Venezuela."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e6ccb1f1","guard":[["has","whitejets"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Brazil."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-ebd4b49f","guard":[["hasAny",["airasia","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["AirAsia ",{"slot":0}," is an airline of Malaysia."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f37e2af3","guard":[["has","aerolane"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Ecuador."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-f3edca2a","guard":[["hasAny",["aerolane","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Ecuador."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f884bf46","guard":[["hasAny",["avient","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["Avient ",{"slot":0}," is an airline of Zimbabwe."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-fba182a8","guard":[["hasAny",["jalways","longest","longest one","longest word"]],["has","where"]],"pyramid":["render.template",{"lit":["JALways is an ",{"slot":0}," of Japan."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-06531c48","guard":[["hasAny",["blue1","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Finland."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0a41657f","guard":[["hasAny",["hageland","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Aviation ",{"slot":1}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-0b30de85","guard":[["hasAny",["delete","remove","shandong","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"China"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-0dba03bd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lufttransport","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Norway."]},["transform.title",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-12aa6fba","guard":[["hasAny",["delete","remove","strip out","united","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"United States"},["sense.before",{"lit":"from"}]]],"mem":null},
{"id":"n-12bdc649","guard":[["hasAny",["hexair","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Hex'Air is an ",{"slot":0}," of France."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-172dc628","guard":[["hasAny",["blue","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Germany"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-1806f12f","guard":[["hasAny",["blue1","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Blue1 is an ",{"slot":0}," of Finland."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-18c698c8","guard":[["hasAny",["longest","longest one","longest word","zabaykalskii"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Russia."]},["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-1aa7c1b4","guard":[["hasAny",["item number","nth","orbest","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Portugal."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1de54c3f","guard":[["hasAny",["item number","nth","position","transat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Transat is an airline of Canada."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-23c4a22b","guard":[["hasAny",["item number","kosmos","nth","position"]]],"pyramid":["render.template",{"lit":["Kosmos is an ",{"slot":0}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2b641e69","guard":[["hasAny",["lower case","lowercase","lufttransport","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Norway."]},["transform.lower",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-2e268fb9","guard":[["hasAny",["item number","niki","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Austria."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-33b5f674","guard":[["hasAny",["all","item number","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":["All ",{"slot":0}," US is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-39305aa3","guard":[["hasAny",["all caps","capital letters","capitals","lufttransport","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Norway."]},["transform.upper",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-394b881e","guard":[["hasAny",["aerolane","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Ecuador."]},["transform.swapCase",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-3cbf4ad5","guard":[["hasAny",["delete","remove","strip out","tianjin","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"China"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-41918e1b","guard":[["hasAny",["item number","nth","position","via"]]],"pyramid":["render.template",{"lit":[{"slot":0}," VIA is an airline of Bulgaria."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4593fca9","guard":[["hasAny",["aerolane","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Ecuador."]},["transform.title",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-4785a894","guard":[["hasAny",["macau","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Macao."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-4798ddcd","guard":[["hasAny",["invert case","lufttransport","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Norway."]},["transform.swapCase",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-4dc9dedf","guard":[["hasAny",["item number","nth","position","spicejet"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of India."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4dd6fe67","guard":[["hasAny",["bingo","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Airways is an airline of Poland."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-57517241","guard":[["hasAny",["item number","nth","porter","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an airline of Canada."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-599d53f4","guard":[["hasAny",["aerolane","all caps","capital letters","capitals","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Ecuador."]},["transform.upper",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-5fb70d09","guard":[["hasAny",["blue","delete","remove","strip out","without"]],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"Germany"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-646392a3","guard":[["hasAny",["item number","nth","orbest","position"]]],"pyramid":["render.template",{"lit":["Orbest is an ",{"slot":0}," of Portugal."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6b9a1189","guard":[["hasAny",["all caps","capital letters","capitals","upper case","uppercase","whitejets"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Brazil."]},["transform.upper",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-6d4621c0","guard":[["hasAny",["delete","remove","skywest","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Australia"},["sense.before",{"lit":"from"}]]],"mem":null},
{"id":"n-701eef44","guard":[["hasAny",["capitalise","capitalize","capitalize each word","niki","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Austria."]},["transform.title",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-71bd6150","guard":[["hasAny",["lower case","lowercase","small letters","whitejets"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Brazil."]},["transform.lower",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-7231314a","guard":[["hasAny",["item number","nth","pacific","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Wings is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-801b48fc","guard":[["hasAny",["item number","nth","pobeda","position"]]],"pyramid":["render.template",{"lit":["Pobeda is an ",{"slot":0}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8134ed28","guard":[["hasAny",["delete","remove","strip out","whitejets","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Brazil"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-86c1cdd6","guard":[["hasAny",["item number","nth","position","yuzhmashavia"]]],"pyramid":["render.template",{"lit":["Yuzhmashavia is an ",{"slot":0}," of Ukraine."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-88359ba2","guard":[["hasAny",["delete","remove","skywest","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Australia"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-8bbb7c6a","guard":[["hasAny",["delete","remove","strip out","transwest","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Canada"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-955f5a08","guard":[["hasAny",["aeroméxico","item number","nth","position"]]],"pyramid":["render.template",{"lit":["AeroMéxico is an ",{"slot":0}," of Mexico."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9c3cd204","guard":[["hasAny",["lower case","lowercase","niki","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Austria."]},["transform.lower",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-a349cace","guard":[["hasAny",["blue","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Wings is an airline of Germany."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a41cd004","guard":[["hasAny",["europesky","item number","nth","position"]]],"pyramid":["render.template",{"lit":["EuropeSky is an ",{"slot":0}," of Germany."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-a4bff0aa","guard":[["hasAny",["delete","remove","strip out","tianjin","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"China"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-a6721db7","guard":[["hasAny",["longest","longest one","longest word","southjet"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-a90aa6ea","guard":[["hasAny",["item number","jalways","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Japan."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ae5d7f18","guard":[["hasAny",["airasia","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," X is an airline of Malaysia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b83c74b4","guard":[["hasAny",["all","item number","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," America US is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cb7e1bcf","guard":[["hasAny",["all caps","capital letters","capitals","niki","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Austria."]},["transform.upper",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-cd0a9378","guard":[["hasAny",["invert case","swap case","toggle case","whitejets"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Brazil."]},["transform.swapCase",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-d0b80c51","guard":[["hasAny",["flybaboo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Flybaboo is an ",{"slot":0}," of Switzerland."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-d8f685f7","guard":[["hasAny",["item number","macau","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Macau is an airline of Macao."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dc206b1c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","whitejets"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Brazil."]},["transform.title",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-de507986","guard":[["hasAny",["conviasa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Conviasa is an ",{"slot":0}," of Venezuela."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-dfc37982","guard":[["hasAny",["avient","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Aviation is an airline of Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e046a9de","guard":[["hasAny",["shortest","shortest one","shortest word","transat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Canada."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-e599ab08","guard":[["hasAny",["hexair","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Hex'Air is an ",{"slot":0}," of France."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e667cf7c","guard":[["hasAny",["aerolane","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Ecuador."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e80da85f","guard":[["hasAny",["shortest","shortest one","shortest word","via"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Bulgaria."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-e87e7bb0","guard":[["hasAny",["invert case","niki","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Austria."]},["transform.swapCase",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-f7199ef5","guard":[["hasAny",["item number","nth","position","tianjin"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an airline of China."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f7459104","guard":[["hasAny",["aerolane","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Ecuador."]},["transform.lower",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-f8861101","guard":[["hasAny",["item number","lufttransport","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Norway."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0dc2c438","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","southjet","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-0f1413e2","guard":[["hasAny",["blue","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Germany."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-199b15fa","guard":[["hasAny",["invert case","longest","longest one","longest word","swap case","toggle case","zabaykalskii"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Russia."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1abeecf3","guard":[["hasAny",["airasia","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Malaysia."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-2ed71102","guard":[["hasAny",["hageland","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Hageland ",{"slot":0}," ",{"slot":1}," is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-3e35fd5b","guard":[["hasAny",["item number","nth","position","via"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Bulgaria."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-3ec5b1df","guard":[["hasAny",["international","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":["Shaheen ",{"slot":0}," ",{"slot":1}," is an airline of Pakistan."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-586dd64d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case","zabaykalskii"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Russia."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6afd5b16","guard":[["hasAny",["avient","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-6f4fc70f","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","small letters","southjet"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-76e0a096","guard":[["hasAny",["item number","nth","position","tianjin"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-7b19ae04","guard":[["hasAny",["invert case","longest","longest one","longest word","southjet","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7e196b7b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","southjet","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-94204d17","guard":[["hasAny",["bingo","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Poland."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-9b2c4d73","guard":[["hasAny",["item number","macau","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Macao."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-bb7193eb","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","small letters","zabaykalskii"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Russia."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-bf9aab97","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","upper case","uppercase","zabaykalskii"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Russia."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-d5b27ae9","guard":[["hasAny",["item number","nth","position","zabaykalskii"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Russia."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-04639f78","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","via"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Bulgaria."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-053a4f1d","guard":[["hasAny",["aeronautica","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Militare is an ",{"slot":1}," of Italy."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-08270ee5","guard":[["hasAny",["flybaboo","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Switzerland."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-0c993c2d","guard":[["hasAny",["all caps","avient","capital letters","capitals","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-0eedc37b","guard":[["hasAny",["item number","kuban","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["Kuban ",{"slot":0}," is an ",{"slot":1}," of Russia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1013c07e","guard":[["hasAny",["aerotaxi","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["Delta ",{"slot":0}," is an ",{"slot":1}," of Italy."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-1052c834","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","transbrasil"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Brazil."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-14246d8e","guard":[["hasAny",["flugfelag","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Iceland."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-14d9c020","guard":[["hasAny",["item number","jalways","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Japan."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-16dea012","guard":[["hasAny",["airasia","all caps","capital letters","capitals","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Malaysia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-199c3363","guard":[["hasAny",["blue1","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Finland."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1bb09043","guard":[["hasAny",["island","item number","nth","position","shortest","shortest one","shortest word"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," Air (",{"slot":1},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1fd9b985","guard":[["hasAny",["item number","ivoire","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," Ivoire is an ",{"slot":1}," of Ivory Coast."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-20608eca","guard":[["hasAny",["aerotaxi","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Italy."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2184005c","guard":[["hasAny",["aero","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["Aero ",{"slot":0}," is an ",{"slot":1}," of Nigeria."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2664e08e","guard":[["hasAny",["airasia","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Malaysia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-267feec8","guard":[["hasAny",["international","item number","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Air ",{"slot":1}," is an airline of Pakistan."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-28ca73dc","guard":[["hasAny",["item number","longest","longest one","longest word","nationwide","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of South Africa."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-2b4970b7","guard":[["hasAny",["airasia","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Malaysia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2b5c8b9b","guard":[["hasAny",["item number","ivoire","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Air ",{"slot":0}," is an ",{"slot":1}," of Ivory Coast."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2cb18e84","guard":[["hasAny",["blue","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Germany."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2fbfde1c","guard":[["hasAny",["item number","longest","longest one","longest word","nth","olympic","position"]]],"pyramid":["render.template",{"lit":["Olympic ",{"slot":0}," is an ",{"slot":1}," of Greece."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-2fd29dd3","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sharp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Australia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3417d10d","guard":[["hasAny",["conviasa","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Venezuela."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-34a43755","guard":[["hasAny",["flybaboo","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Switzerland."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-3a28d9d8","guard":[["hasAny",["airasia","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Malaysia."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3dfa4b8b","guard":[["hasAny",["item number","longest","longest one","longest word","midwest","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3f61a420","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","skywest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Australia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-40425e2d","guard":[["hasAny",["item number","nth","orbest","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Portugal."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-45350522","guard":[["hasAny",["hageland","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Services is an airline of United States."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-479eea6c","guard":[["hasAny",["finncomm","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of Finland."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-48a53435","guard":[["hasAny",["international","item number","nth","position","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," International is an airline of Pakistan."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4f89db25","guard":[["hasAny",["item number","liberty","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["Liberty ",{"slot":0}," is an ",{"slot":1}," of United States."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-50570a3a","guard":[["hasAny",["ccml","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Colombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-50d42ccb","guard":[["hasAny",["item number","liberty","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Airways is an ",{"slot":1}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-53a10f22","guard":[["hasAny",["item number","lituanica","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Lithuania."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5b668a01","guard":[["hasAny",["item number","longest","longest one","longest word","lsm","nth","position"]]],"pyramid":["render.template",{"lit":["LSM ",{"slot":0}," is an ",{"slot":1}," of Russia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5b98ee08","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","vladivostok"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," Air is an ",{"slot":1}," of Russia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5e8da4bf","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","tianjin"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-62dc5285","guard":[["hasAny",["each word","longest","longest one","longest word","southjet","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-631972ec","guard":[["hasAny",["ccml","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["CCML ",{"slot":0}," is an ",{"slot":1}," of Colombia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-637b6a11","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","transwest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Canada."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-64243d95","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","via"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Bulgaria."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6677a6a4","guard":[["hasAny",["avient","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6837ed36","guard":[["hasAny",["bingo","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Poland."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-685f0f4a","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shandong"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of China."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-6ede650b","guard":[["hasAny",["blue","invert case","item number","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Germany."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-702efa95","guard":[["hasAny",["aeronautica","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Italy."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-79549890","guard":[["hasAny",["europesky","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-7a089985","guard":[["hasAny",["finncomm","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Finland."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7b65faed","guard":[["hasAny",["item number","lituanica","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Air ",{"slot":0}," is an ",{"slot":1}," of Lithuania."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-80dc8f83","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8552b448","guard":[["hasAny",["item number","longest","longest one","longest word","nth","png","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Papua New Guinea."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8603caa3","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sriwijaya"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Air is an ",{"slot":1}," of Indonesia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-88034c8f","guard":[["hasAny",["item number","lower case","lowercase","macau","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Macao."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8e1d6c3a","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","tianjin"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-920481e6","guard":[["hasAny",["all caps","blue","capital letters","capitals","item number","nth","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Germany."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-934fd69b","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","upper case","uppercase","via"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Bulgaria."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-93990232","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","transbrasil"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of Brazil."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9509b859","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","yuzhmashavia"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Ukraine."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-953e0a83","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9de28db2","guard":[["hasAny",["invert case","item number","nth","position","swap case","tianjin","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9f523187","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","tianjin","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-9f964ae2","guard":[["hasAny",["avient","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a1141a79","guard":[["hasAny",["conviasa","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Venezuela."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a2481480","guard":[["hasAny",["hong","item number","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Kong ",{"slot":1}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a62ed4a2","guard":[["hasAny",["invert case","item number","macau","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Macao."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a6927bf8","guard":[["hasAny",["elburaq","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["El-Buraq ",{"slot":0}," ",{"slot":1}," is an airline of Libya."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a8955b05","guard":[["hasAny",["europesky","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-adc6fb3a","guard":[["hasAny",["each word","longest","longest one","longest word","southjet","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b31f73ac","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sriwijaya"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Indonesia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b47df34b","guard":[["hasAny",["each word","longest","longest one","longest word","split into words","zabaykalskii"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Russia."]},["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b5057884","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sharp"]]],"pyramid":["render.template",{"lit":["Sharp ",{"slot":0}," is an ",{"slot":1}," of Australia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-b5f7e1e5","guard":[["hasAny",["item number","longest","longest one","longest word","nth","olympic","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Greece."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b9718262","guard":[["hasAny",["hong","item number","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Hong ",{"slot":0}," ",{"slot":1}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-bc42fe01","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","skywest"]]],"pyramid":["render.template",{"lit":["Skywest ",{"slot":0}," is an ",{"slot":1}," of Australia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-bdfedfcd","guard":[["hasAny",["flugfelag","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["Flugfelag ",{"slot":0}," is an ",{"slot":1}," of Iceland."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-bee72336","guard":[["hasAny",["island","item number","nth","position","shortest","shortest one","shortest word"]],["has","home"]],"pyramid":["render.template",{"lit":["Island ",{"slot":0}," (",{"slot":1},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bfe8ca51","guard":[["hasAny",["item number","longest","longest one","longest word","nationwide","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of South Africa."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c1185256","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shandong"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of China."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c3478919","guard":[["hasAny",["bingo","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Poland."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c5385434","guard":[["hasAny",["all caps","capital letters","capitals","item number","macau","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Macao."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-c8f16419","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","tianjin","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c905a69d","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","yuzhmashavia"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Ukraine."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-ca12462f","guard":[["hasAny",["atlas","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["Atlas ",{"slot":0}," is an ",{"slot":1}," of United States."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d16eeca6","guard":[["hasAny",["item number","longest","longest one","longest word","nth","png","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," PNG is an ",{"slot":1}," of Papua New Guinea."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d3a5524f","guard":[["hasAny",["item number","jalways","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Japan."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d59173e9","guard":[["hasAny",["airasia","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Malaysia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d5a18e5b","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","zabaykalskii"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Russia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-d6a980b1","guard":[["hasAny",["all","item number","nth","position","shortest","shortest one","shortest word"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," US is an airline of United States."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-d750b65c","guard":[["hasAny",["item number","longest","longest one","longest word","midwest","nth","position"]]],"pyramid":["render.template",{"lit":["Midwest ",{"slot":0}," is an ",{"slot":1}," of United States."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-d9da0ebf","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","macau","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Macao."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-da54f19a","guard":[["hasAny",["atlas","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Air is an ",{"slot":1}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-dba31b82","guard":[["hasAny",["each word","longest","longest one","longest word","split into words","zabaykalskii"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Russia."]},["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dbae479d","guard":[["hasAny",["item number","longest","longest one","longest word","nth","porter","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Canada."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-def01040","guard":[["hasAny",["elburaq","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["El-Buraq Air ",{"slot":0}," is an ",{"slot":1}," of Libya."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-f11e5a46","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","transwest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Air is an ",{"slot":1}," of Canada."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-f290981b","guard":[["hasAny",["all caps","bingo","capital letters","capitals","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Poland."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f74e35d7","guard":[["hasAny",["aeroméxico","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Mexico."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f7e944cf","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","via"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Bulgaria."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f857fa95","guard":[["hasAny",["aero","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Nigeria."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f8cf562e","guard":[["hasAny",["aeroméxico","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Mexico."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-faec47b9","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","southjet"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-fb735a8c","guard":[["hasAny",["avient","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-fc0f102f","guard":[["hasAny",["avient","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fe0ec687","guard":[["hasAny",["blue","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Germany."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fe3caed0","guard":[["hasAny",["bingo","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Poland."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0330a390","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","via"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Bulgaria."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-062f226f","guard":[["hasAny",["item number","nth","orbest","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Portugal."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0c16e1bd","guard":[["hasAny",["europesky","first n","longest","longest one","longest word","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-0dd718d0","guard":[["hasAny",["hong","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Airlines is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-0df34e2e","guard":[["hasAny",["ccml","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of Colombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-15a5381d","guard":[["hasAny",["each word","item number","nth","position","split into words","tianjin"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1918305a","guard":[["hasAny",["europesky","first n","longest","longest one","longest word","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-19728ae3","guard":[["hasAny",["item number","nth","position","transwest"]]],"pyramid":["render.template",{"lit":["Transwest ",{"slot":0}," is an ",{"slot":1}," of Canada."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-1d18a243","guard":[["hasAny",["airasia","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Malaysia."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1df5f001","guard":[["hasAny",["first n","flybaboo","longest","longest one","longest word","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Switzerland."]},["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-22923452","guard":[["hasAny",["airasia","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Malaysia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-2497ae42","guard":[["hasAny",["explore","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Air ",{"slot":0}," is an ",{"slot":1}," of Slovakia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-25da10c5","guard":[["hasAny",["happy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Happy ",{"slot":0}," is an ",{"slot":1}," of Thailand."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-28068dc3","guard":[["hasAny",["item number","nth","position","shandong"]]],"pyramid":["render.template",{"lit":["Shandong ",{"slot":0}," is an ",{"slot":1}," of China."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-28d3490b","guard":[["hasAny",["all","item number","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," US is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-29bfc4ea","guard":[["hasAny",["first n","longest","longest one","longest word","take","yuzhmashavia"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Ukraine."]},["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-2a8d4298","guard":[["hasAny",["each word","item number","nth","position","split into words","via"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Bulgaria."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2cad74f4","guard":[["hasAny",["item number","nth","position","skywest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of Australia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2cd79d9c","guard":[["hasAny",["item number","nth","png","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Airlines ",{"slot":0}," is an ",{"slot":1}," of Papua New Guinea."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-373cb41a","guard":[["hasAny",["item number","nth","position","yuzhmashavia"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Ukraine."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-37aadda0","guard":[["hasAny",["each word","item number","macau","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Macao."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3b3b12ec","guard":[["hasAny",["bingo","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Poland."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3f4696b8","guard":[["hasAny",["item number","nth","position","uni"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Air is an ",{"slot":1}," of Taiwan."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-430982e9","guard":[["hasAny",["brasil","item number","nth","position"]]],"pyramid":["render.template",{"lit":["NEXT ",{"slot":0}," is an ",{"slot":1}," of Brazil."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4b91b49e","guard":[["hasAny",["blue1","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Finland."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4e1efa8f","guard":[["hasAny",["item number","nth","position","vladivostok"]],["has","country"]],"pyramid":["render.template",{"lit":["Vladivostok ",{"slot":0}," is an ",{"slot":1}," of Russia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4e7f7a66","guard":[["hasAny",["explore","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Slovakia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4f4f95a8","guard":[["hasAny",["brasil","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Brasil is an ",{"slot":1}," of Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-53cfe8c1","guard":[["hasAny",["flugfelag","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Vestmannaeyja is an ",{"slot":1}," of Iceland."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-55f0c7a2","guard":[["hasAny",["item number","jalways","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Japan."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-56fa4585","guard":[["hasAny",["aeroméxico","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Mexico."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5b412d5e","guard":[["hasAny",["airways","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Poland."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-5f0fee6c","guard":[["hasAny",["avient","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5f463c8e","guard":[["hasAny",["each word","item number","nth","position","split into words","via"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Bulgaria."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-618c5ba2","guard":[["hasAny",["item number","nth","position","uni"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Taiwan."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-69f5ee23","guard":[["hasAny",["blue1","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Finland."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6c5429d8","guard":[["hasAny",["blue","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Germany."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-6edcdd13","guard":[["hasAny",["aerotaxi","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Aerotaxi is an ",{"slot":1}," of Italy."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-72152962","guard":[["hasAny",["item number","macau","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Macao."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-75d37359","guard":[["hasAny",["explore","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," Explore is an ",{"slot":1}," of Slovakia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7a7dcb35","guard":[["hasAny",["blue","item number","normalise","normalize","nth","position","simplify the text"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Germany."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-8087aee3","guard":[["hasAny",["item number","nth","position","sriwijaya"]]],"pyramid":["render.template",{"lit":["Sriwijaya ",{"slot":0}," is an ",{"slot":1}," of Indonesia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-857aa9b3","guard":[["hasAny",["happy","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Air is an ",{"slot":1}," of Thailand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8aed6c02","guard":[["hasAny",["airasia","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Malaysia."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8de38bff","guard":[["hasAny",["first n","flybaboo","longest","longest one","longest word","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Switzerland."]},["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-96d60ab5","guard":[["hasAny",["item number","nationwide","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Nationwide ",{"slot":0}," is an ",{"slot":1}," of South Africa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-9b6135f9","guard":[["hasAny",["item number","ivoire","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Ivory Coast."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9cf02ac1","guard":[["hasAny",["each word","item number","macau","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Macao."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9f1c6e11","guard":[["hasAny",["blue","each word","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Germany."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a3107c4a","guard":[["hasAny",["item number","nth","position","uni"]]],"pyramid":["render.template",{"lit":["Uni ",{"slot":0}," is an ",{"slot":1}," of Taiwan."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a354a0c3","guard":[["hasAny",["flybaboo","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Switzerland."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-a51a9750","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","tianjin"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-ab66efa2","guard":[["hasAny",["item number","nth","position","yuzhmashavia"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Ukraine."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-b7c29246","guard":[["hasAny",["item number","macau","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Macao."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-b9a2fb80","guard":[["hasAny",["bingo","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Poland."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-c1f4178d","guard":[["hasAny",["flybaboo","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Switzerland."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-c5cca4e5","guard":[["hasAny",["first n","longest","longest one","longest word","take","yuzhmashavia"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Ukraine."]},["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-c6a3782b","guard":[["hasAny",["avient","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c7da7d8f","guard":[["hasAny",["item number","nth","position","sharp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of Australia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-cab19fe9","guard":[["hasAny",["blue","each word","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Germany."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cd16671e","guard":[["hasAny",["item number","nth","position","via"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Bulgaria."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-cd709ba0","guard":[["hasAny",["item number","nth","position","transbrasil"]],["has","which"]],"pyramid":["render.template",{"lit":["TransBrasil ",{"slot":0}," is an ",{"slot":1}," of Brazil."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-cdc64c70","guard":[["hasAny",["item number","lituanica","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," Lituanica is an ",{"slot":1}," of Lithuania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ceb59465","guard":[["hasAny",["bingo","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Poland."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cfd134f1","guard":[["hasAny",["item number","nth","olympic","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of Greece."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-d2ed266a","guard":[["hasAny",["avient","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-db51f3f8","guard":[["hasAny",["island","item number","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (WP) is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-dfd895fc","guard":[["hasAny",["hageland","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-e42fa265","guard":[["hasAny",["item number","jalways","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Japan."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-e83a0cc6","guard":[["hasAny",["item number","nth","orbest","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Portugal."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e9f191f5","guard":[["hasAny",["international","item number","nth","position","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Pakistan."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-ed5b48a8","guard":[["hasAny",["aero","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Contractors is an ",{"slot":1}," of Nigeria."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-eeafa4dd","guard":[["hasAny",["each word","item number","nth","position","split into words","tianjin"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f4bfaca1","guard":[["hasAny",["conviasa","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Venezuela."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f5b6ee06","guard":[["hasAny",["elburaq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["El-Buraq ",{"slot":0}," Transport is an ",{"slot":1}," of Libya."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-f852eefb","guard":[["hasAny",["finncomm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Finncomm ",{"slot":0}," is an ",{"slot":1}," of Finland."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-fb5f731f","guard":[["hasAny",["aeronautica","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Aeronautica ",{"slot":0}," is an ",{"slot":1}," of Italy."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-fe7edf6b","guard":[["hasAny",["item number","midwest","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-0453d4df","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","united"]],["has","airline"]],"pyramid":["render.template",{"lit":["United ",{"slot":0}," is an ",{"slot":1}," of ",{"slot":2}," States."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0bda6639","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","sriwijaya"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Indonesia."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-11cbb8ee","guard":[["hasAny",["ccml","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Colombia."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-22dbd5c8","guard":[["hasAny",["atlas","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-360cade6","guard":[["hasAny",["item number","ivoire","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Ivory Coast."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-56d5a1b4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","international","item number","nth","position","shortest","shortest one","shortest word","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Pakistan."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-631f2d02","guard":[["hasAny",["all caps","capital letters","capitals","international","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Pakistan."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-6451bb69","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","vladivostok"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Russia."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6f648967","guard":[["hasAny",["aero","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Nigeria."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6fa826cf","guard":[["hasAny",["elburaq","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["El-Buraq ",{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Libya."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-7689a997","guard":[["hasAny",["aerolineas","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," maria is an airline of Dominican Republic."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7a118290","guard":[["hasAny",["alrosa","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Alrosa ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Russia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7e38a2c9","guard":[["hasAny",["item number","nth","ocean","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of India."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-85b365f5","guard":[["hasAny",["international","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Pakistan."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-89f5dd68","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","transwest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Canada."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-8cdcff9c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hageland","item number","longest","longest one","longest word","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8db93d77","guard":[["hasAny",["item number","lituanica","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Lithuania."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-93c738d0","guard":[["hasAny",["all caps","capital letters","capitals","hageland","item number","longest","longest one","longest word","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-990dfa6f","guard":[["hasAny",["item number","longest","longest one","longest word","nth","png","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Papua New Guinea."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a254dfaf","guard":[["hasAny",["alrosa","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Mirny ",{"slot":1}," ",{"slot":2}," is an airline of Russia."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ac1d727b","guard":[["hasAny",["aerolineas","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," heredas ",{"slot":1}," maria is an ",{"slot":2}," of Dominican Republic."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ad6999f8","guard":[["hasAny",["aerotaxi","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Italy."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ae102c00","guard":[["hasAny",["first n","item number","jalways","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Japan."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-bdd68ace","guard":[["hasAny",["hong","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-c3b487d7","guard":[["hasAny",["international","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Pakistan."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d1366fab","guard":[["hasAny",["hageland","item number","longest","longest one","longest word","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d2fc6a7a","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","united"]],["has","airline"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of ",{"slot":2}," States."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d92e6f89","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sharp","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Australia."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-e4e1a12e","guard":[["hasAny",["first n","item number","jalways","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Japan."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-f4de24bf","guard":[["hasAny",["hageland","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f79da6ef","guard":[["hasAny",["international","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Pakistan."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-00c73654","guard":[["hasAny",["international","item number","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Pakistan."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0492cce0","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shandong"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of China."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-0aa9935a","guard":[["hasAny",["item number","longest","longest one","longest word","nth","orient","position"]]],"pyramid":["render.template",{"lit":["Orient ",{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Thailand."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-0b80c99d","guard":[["hasAny",["flugfelag","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Iceland."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-122781b0","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Air ",{"slot":0}," ",{"slot":1},". Ltd. is an ",{"slot":2}," of Republic of Korea."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-178bbc41","guard":[["hasAny",["item number","lituanica","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Lithuania."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-1d6c7a4a","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","united"]],["has","airline"]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of ",{"slot":2}," States."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-21d25371","guard":[["hasAny",["aerotaxi","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Italy."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-2210b5d1","guard":[["hasAny",["cayman","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," Airways is an ",{"slot":1}," of ",{"slot":2}," Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-22c77b89","guard":[["hasAny",["item number","longest","longest one","longest word","nth","olympic","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Greece."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-23d03025","guard":[["hasAny",["hong","item number","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-29602fa8","guard":[["hasAny",["chater","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," AIR ",{"slot":1}," is an ",{"slot":2}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-29dfc0f5","guard":[["hasAny",["each word","hageland","item number","longest","longest one","longest word","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2ac2ec47","guard":[["hasAny",["hageland","item number","longest","longest one","longest word","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-2c001cfb","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","skywest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Australia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2e5863de","guard":[["hasAny",["item number","ivoire","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Ivory Coast."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3a15d4b9","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","transwest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Canada."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-3dcec79f","guard":[["hasAny",["finncomm","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Finland."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3dfcdfa4","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of ",{"slot":2}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3eb317f9","guard":[["hasAny",["each word","international","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Pakistan."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4060bd18","guard":[["hasAny",["ccml","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Colombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-41e65c1d","guard":[["hasAny",["item number","lituanica","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Lithuania."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-4bd3e1dc","guard":[["hasAny",["cambodge","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Cambodia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4e1ea6e2","guard":[["hasAny",["item number","longest","longest one","longest word","nth","olympic","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Greece."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-4eb01b36","guard":[["hasAny",["brasil","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Brazil."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-502a882b","guard":[["hasAny",["aerotaxi","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Italy."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-51679070","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," Korea ",{"slot":1},". Ltd. is an ",{"slot":2}," of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-51c46dd2","guard":[["hasAny",["item number","longest","longest one","longest word","nth","orient","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Thai ",{"slot":1}," is an ",{"slot":2}," of Thailand."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-53065ec9","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","transbrasil"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Brazil."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-53720b97","guard":[["hasAny",["aerolineas","item number","longest","longest one","longest word","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," santa maria is an ",{"slot":2}," of Dominican Republic."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-599bc26a","guard":[["hasAny",["item number","longest","longest one","longest word","nth","png","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Papua New Guinea."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5d403202","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shandong"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of China."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-5fa31151","guard":[["hasAny",["alrosa","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Enterprise is an airline of Russia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-62160a1b","guard":[["hasAny",["each word","hageland","item number","longest","longest one","longest word","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of United States."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-64d1088d","guard":[["hasAny",["aero","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Nigeria."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-65ac95f5","guard":[["hasAny",["item number","longest","longest one","longest word","midwest","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-669b9d9c","guard":[["hasAny",["international","item number","normalise","normalize","nth","position","shortest","shortest one","shortest word","simplify the text"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Pakistan."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-69a7b8fc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hong","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6a26e706","guard":[["hasAny",["item number","longest","longest one","longest word","nationwide","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of South Africa."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-6c77a35a","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sharp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Australia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-73101f7f","guard":[["hasAny",["flyhy","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Cargo ",{"slot":1}," is an ",{"slot":2}," of Thailand."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7534bf1c","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sharp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Australia."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-76835e27","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Co. Ltd. is an ",{"slot":2}," of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-78faeaf0","guard":[["hasAny",["division","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7a0ae007","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","skywest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Australia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-809d215a","guard":[["hasAny",["flyhy","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["Flyhy ",{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Thailand."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-80da3e57","guard":[["hasAny",["item number","lituanica","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Lithuania."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-8257b1f5","guard":[["hasAny",["item number","longest","longest one","longest word","nth","orient","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Thailand."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-862671cd","guard":[["hasAny",["item number","longest","longest one","longest word","midwest","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-88219f45","guard":[["hasAny",["division","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Division is an ",{"slot":2}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-8986446c","guard":[["hasAny",["cayman","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Cayman Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8c37808b","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sriwijaya"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Indonesia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8f2c5027","guard":[["hasAny",["happy","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Thailand."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8fcd210d","guard":[["hasAny",["aerolineas","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Aerolineas ",{"slot":0}," ",{"slot":1}," maria is an ",{"slot":2}," of Dominican Republic."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-90694735","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","united"]],["has","airline"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-95ae2895","guard":[["hasAny",["item number","longest","longest one","longest word","nationwide","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of South Africa."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-99eefc21","guard":[["hasAny",["ccml","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Colombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9df78120","guard":[["hasAny",["aeronautica","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Italy."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a048f198","guard":[["hasAny",["flugfelag","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Iceland."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-a140434b","guard":[["hasAny",["aeronautica","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Italy."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a401264b","guard":[["hasAny",["chater","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," CHATER is an ",{"slot":2}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a4b96821","guard":[["hasAny",["flugfelag","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Iceland."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-a7a453af","guard":[["hasAny",["explore","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Slovakia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a95f86de","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sriwijaya"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Indonesia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ac2cc33b","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Lao ",{"slot":0}," is an ",{"slot":1}," of ",{"slot":2}," Peoples Democratic Republic."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ac9b37c0","guard":[["hasAny",["cayman","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Cayman ",{"slot":0}," is an ",{"slot":1}," of ",{"slot":2}," Islands."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ae671b58","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","transbrasil"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Brazil."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b455adf6","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","vladivostok"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Russia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-bdb5d03c","guard":[["hasAny",["each word","international","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Pakistan."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c4c78ef5","guard":[["hasAny",["elburaq","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["El-Buraq ",{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Libya."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-c5019373","guard":[["hasAny",["item number","ivoire","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Ivory Coast."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c52c2d39","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","uni"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Taiwan."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-cdb7bf58","guard":[["hasAny",["elburaq","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["El-Buraq ",{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Libya."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ceef9c37","guard":[["hasAny",["flyhy","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Thailand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d12b485e","guard":[["hasAny",["finncomm","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Finland."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d162da57","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Lao Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-d1f21aa7","guard":[["hasAny",["item number","longest","longest one","longest word","nth","olympic","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Greece."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-d466fea5","guard":[["hasAny",["alrosa","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Air ",{"slot":2}," is an airline of Russia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d5753c61","guard":[["hasAny",["aero","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Nigeria."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-da5bc82b","guard":[["hasAny",["aerotaxi","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Italy."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-df04a440","guard":[["hasAny",["island","item number","nth","position","shortest","shortest one","shortest word"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-dfec83f8","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","vladivostok"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Russia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e73b8b81","guard":[["hasAny",["cambodge","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["Royal ",{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Cambodia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-e9606999","guard":[["hasAny",["item number","longest","longest one","longest word","midwest","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ec8776fa","guard":[["hasAny",["division","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Saratov ",{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Russia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-eda9bbae","guard":[["hasAny",["item number","longest","longest one","longest word","nth","png","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Papua New Guinea."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-eed3ffad","guard":[["hasAny",["chater","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["SOCHI ",{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Russia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f3ee9c92","guard":[["hasAny",["all caps","capital letters","capitals","hong","item number","nth","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f42da419","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","transwest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Canada."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-f49b28e5","guard":[["hasAny",["hong","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f6ed7b3c","guard":[["hasAny",["hong","invert case","item number","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f7312a7e","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sharp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Australia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-f752c336","guard":[["hasAny",["cambodge","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Air ",{"slot":1}," is an ",{"slot":2}," of Cambodia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-03332ee1","guard":[["hasAny",["item number","nationwide","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of South Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-0b706c83","guard":[["hasAny",["flyhy","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Airlines is an ",{"slot":2}," of Thailand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-12f8fe19","guard":[["hasAny",["force","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," Air ",{"slot":1}," is an ",{"slot":2}," of Turkey."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-162c89b5","guard":[["hasAny",["elburaq","first n","item number","longest","longest one","longest word","nth","position","take"]]],"pyramid":["render.template",{"lit":["El-Buraq ",{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Libya."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-17f716e7","guard":[["hasAny",["ccml","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Colombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1aa18b92","guard":[["hasAny",["elburaq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["El-Buraq ",{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Libya."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-1ae88048","guard":[["hasAny",["aeronautica","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Italy."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1c1a1509","guard":[["hasAny",["force","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Force is an ",{"slot":2}," of Turkey."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1f92b270","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nth","position","take","transwest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Canada."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-2065111d","guard":[["hasAny",["each word","hong","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-21b4e972","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nationwide","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of South Africa."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-239d56ff","guard":[["hasAny",["elburaq","first n","item number","longest","longest one","longest word","nth","position","take"]]],"pyramid":["render.template",{"lit":["El-Buraq ",{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Libya."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-241f7c3c","guard":[["hasAny",["explore","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Slovakia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2834df9f","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nth","position","take","transwest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Canada."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-2ba5908b","guard":[["hasAny",["co","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2},". Ltd. is an airline of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2bd27e4d","guard":[["hasAny",["item number","nth","position","shandong"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of China."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-2c786ba5","guard":[["hasAny",["first n","flugfelag","item number","longest","longest one","longest word","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Iceland."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-2f8eb1ae","guard":[["hasAny",["cambodge","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Cambodge is an ",{"slot":2}," of Cambodia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-3685b11e","guard":[["hasAny",["happy","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Thailand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-39c73f74","guard":[["hasAny",["first n","item number","longest","longest one","longest word","midwest","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-39ff4c2e","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nth","position","sharp","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Australia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-3b34e8d6","guard":[["hasAny",["force","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["Turkish ",{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Turkey."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3be20a6b","guard":[["hasAny",["item number","nth","position","transwest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Canada."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-3d4e3295","guard":[["hasAny",["item number","nth","olympic","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Greece."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-3f2302f4","guard":[["hasAny",["each word","hong","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-40af6388","guard":[["hasAny",["hong","item number","normalise","normalize","nth","position","simplify the text"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-40fa57ae","guard":[["hasAny",["aero","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Nigeria."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4168438c","guard":[["hasAny",["division","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," Aviation ",{"slot":1}," is an ",{"slot":2}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-46612fca","guard":[["hasAny",["item number","lao","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of ",{"slot":2}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-47f6f16b","guard":[["hasAny",["item number","nth","position","uni"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Taiwan."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-484eaa8f","guard":[["hasAny",["flugfelag","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Iceland."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-49832645","guard":[["hasAny",["force","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Turkey."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-55eacbd7","guard":[["hasAny",["item number","nth","position","skywest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Australia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5730e96b","guard":[["hasAny",["item number","nth","orient","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Airlines is an ",{"slot":2}," of Thailand."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-668199d3","guard":[["hasAny",["first n","item number","lituanica","longest","longest one","longest word","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Lithuania."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-6a6caabf","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nth","position","shandong","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of China."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-6d617bf2","guard":[["hasAny",["item number","nth","position","sriwijaya"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Indonesia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6e4a5cff","guard":[["hasAny",["alrosa","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is an airline of Russia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-6f6822a6","guard":[["hasAny",["item number","nth","position","sharp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Australia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-6faedef3","guard":[["hasAny",["item number","nth","png","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Papua New Guinea."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-70314a85","guard":[["hasAny",["item number","ivoire","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Ivory Coast."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-752d66a6","guard":[["hasAny",["item number","nationwide","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of South Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-792566f2","guard":[["hasAny",["first n","item number","lituanica","longest","longest one","longest word","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Lithuania."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-7baf50f4","guard":[["hasAny",["finncomm","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Finland."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7f6f557d","guard":[["hasAny",["happy","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Thailand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8c9aeac9","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nth","position","sharp","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Australia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-93fc2212","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nth","olympic","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Greece."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-96f5ae0f","guard":[["hasAny",["item number","nth","position","transwest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Canada."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-971c64c4","guard":[["hasAny",["item number","nth","position","uni"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Taiwan."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a061e5e7","guard":[["hasAny",["cayman","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of ",{"slot":2}," Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a797d6f3","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nth","olympic","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Greece."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-b42d19dd","guard":[["hasAny",["aerotaxi","first n","item number","longest","longest one","longest word","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Italy."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-b7794a6e","guard":[["hasAny",["item number","lituanica","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Lithuania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-c81196ff","guard":[["hasAny",["aerotaxi","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Italy."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-cace2d28","guard":[["hasAny",["first n","flugfelag","item number","longest","longest one","longest word","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Iceland."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-cb2e4535","guard":[["hasAny",["aerotaxi","first n","item number","longest","longest one","longest word","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Italy."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-e065001e","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nth","position","shandong","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of China."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-eb449d0c","guard":[["hasAny",["item number","ivoire","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Ivory Coast."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-ebc1c78c","guard":[["hasAny",["first n","item number","longest","longest one","longest word","midwest","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-ee5795d4","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nationwide","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of South Africa."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-f27b289e","guard":[["hasAny",["item number","nth","position","shandong"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of China."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-f37330a2","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","united"]],["has","airline"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," States."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-faea1fb5","guard":[["hasAny",["explore","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Slovakia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-0772978e","guard":[["hasAny",["alrosa","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is an airline of Russia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-178d51aa","guard":[["hasAny",["first n","item number","ivoire","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Ivory Coast."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-40af85fa","guard":[["hasAny",["alrosa","capitalise","capitalize","capitalize each word","item number","nth","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is an airline of Russia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4ec8f6f0","guard":[["hasAny",["aerolineas","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," maria is an ",{"slot":3}," of Dominican Republic."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4f006e16","guard":[["hasAny",["item number","longest","longest one","longest word","nth","orient","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Thailand."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-5a02566c","guard":[["hasAny",["aerolineas","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," maria is an ",{"slot":3}," of Dominican Republic."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6aaa4728","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","united"]],["has","airline"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," States."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-84b01287","guard":[["hasAny",["chater","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-92787053","guard":[["hasAny",["alrosa","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is an airline of Russia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-93a870b5","guard":[["hasAny",["all caps","alrosa","capital letters","capitals","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is an airline of Russia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-94ba6299","guard":[["hasAny",["flyhy","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Thailand."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a1d72cd9","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ac5d2a62","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d11cf204","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","united"]],["has","airline"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," States."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d9c4f065","guard":[["hasAny",["first n","item number","ivoire","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Ivory Coast."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-e87c57d4","guard":[["hasAny",["cambodge","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Cambodia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-f859982c","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2},". Ltd. is an ",{"slot":3}," of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-fb8c0222","guard":[["hasAny",["alrosa","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is an airline of Russia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0dad1e5f","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2},". Ltd. is an ",{"slot":3}," of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1d63dc58","guard":[["hasAny",["cambodge","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Cambodia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-23c69386","guard":[["hasAny",["aerolineas","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," maria is an ",{"slot":3}," of Dominican Republic."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-343f2683","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2},". Ltd. is an ",{"slot":3}," of Republic of Korea."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-379c8ba9","guard":[["hasAny",["flyhy","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Thailand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-37b1ff16","guard":[["hasAny",["flyhy","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Thailand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-49e27b54","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-49fc1763","guard":[["hasAny",["division","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-4b80334b","guard":[["hasAny",["division","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-4c49bfc7","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-59b9694a","guard":[["hasAny",["item number","longest","longest one","longest word","nth","orient","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Thailand."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-5cd5a025","guard":[["hasAny",["cayman","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5e7f6e7f","guard":[["hasAny",["cayman","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-60fcc475","guard":[["hasAny",["cayman","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Islands."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-665c0322","guard":[["hasAny",["item number","longest","longest one","longest word","nth","orient","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Thailand."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-6ade36e3","guard":[["hasAny",["cambodge","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Cambodia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-6f365603","guard":[["hasAny",["alrosa","each word","item number","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is an airline of Russia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7228788d","guard":[["hasAny",["item number","longest","longest one","longest word","nth","orient","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Thailand."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-74b1ba0e","guard":[["hasAny",["division","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-9a4e1d7c","guard":[["hasAny",["cambodge","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Cambodia."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-aeaf04fb","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-bb8573b9","guard":[["hasAny",["chater","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c801c4ec","guard":[["hasAny",["aerolineas","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," maria is an ",{"slot":3}," of Dominican Republic."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ced4de56","guard":[["hasAny",["alrosa","each word","item number","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is an airline of Russia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cfc3a14f","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","united"]],["has","airline"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," States."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-cfc74d7e","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d195ab3b","guard":[["hasAny",["chater","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-dceb476a","guard":[["hasAny",["force","item number","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Turkey."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ebde7b4b","guard":[["hasAny",["alrosa","item number","normalise","normalize","nth","position","shortest","shortest one","shortest word","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is an airline of Russia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-eca7a7f3","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","united"]],["has","airline"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," States."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0513cbd5","guard":[["hasAny",["co","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2},". Ltd. is an ",{"slot":3}," of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-1f631cb8","guard":[["hasAny",["cambodge","first n","item number","longest","longest one","longest word","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Cambodia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-2ba2b1d0","guard":[["hasAny",["first n","item number","lao","longest","longest one","longest word","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2baa8f5f","guard":[["hasAny",["cayman","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2c66d7d1","guard":[["hasAny",["item number","lao","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-32e63a0a","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nth","orient","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Thailand."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-3c8bf297","guard":[["hasAny",["item number","nth","orient","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Thailand."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-426af848","guard":[["hasAny",["cambodge","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Cambodia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-46c7dd6c","guard":[["hasAny",["division","first n","item number","longest","longest one","longest word","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-4da3a927","guard":[["hasAny",["flyhy","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Thailand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-649d6e00","guard":[["hasAny",["force","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Turkey."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-72fe1a95","guard":[["hasAny",["division","first n","item number","longest","longest one","longest word","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-8915e611","guard":[["hasAny",["first n","item number","lao","longest","longest one","longest word","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8d46709b","guard":[["hasAny",["cambodge","first n","item number","longest","longest one","longest word","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Cambodia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-d1c4bf9a","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nth","orient","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Thailand."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-e04efb0e","guard":[["hasAny",["cayman","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-eac604bf","guard":[["hasAny",["co","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2},". Ltd. is an ",{"slot":3}," of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-fa6f30f0","guard":[["hasAny",["force","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Turkey."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-20b44940","guard":[["hasAny",["cayman","first n","item number","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-28c15292","guard":[["hasAny",["cayman","first n","item number","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2d9e5c1a","guard":[["hasAny",["co","first n","item number","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2},". Ltd. is an ",{"slot":3}," of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-7ff9b5b6","guard":[["hasAny",["co","first n","item number","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2},". Ltd. is an ",{"slot":3}," of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"where is the airline Air Lituanica based","expect":{"contains":["Lithuania"],"notRefusal":true}},{"q":"name the home country of OCEAN AIR CARGO","expect":{"contains":["India"],"notRefusal":true}},{"q":"which country is the airline Kosmos from","expect":{"contains":["Russia"],"notRefusal":true}},{"q":"name the home country of Spicejet","expect":{"contains":["India"],"notRefusal":true}},{"q":"name the home country of Tianjin Airlines","expect":{"contains":["China"],"notRefusal":true}},{"q":"which country is the airline Air Explore from","expect":{"contains":["Slovakia"],"notRefusal":true}},{"q":"which country is the airline LSM Airlines from","expect":{"contains":["Russia"],"notRefusal":true}},{"q":"which country is the airline Orbest from","expect":{"contains":["Portugal"],"notRefusal":true}},{"q":"which country is the airline Aero Contractors from","expect":{"contains":["Nigeria"],"notRefusal":true}},{"q":"where is the airline Liberty Airways based","expect":{"contains":["United States"],"notRefusal":true}},{"q":"which country is the airline Aeronautica Militare from","expect":{"contains":["Italy"],"notRefusal":true}},{"q":"which country is the airline Skywest Airlines from","expect":{"contains":["Australia"],"notRefusal":true}},{"q":"where is the airline Yuzhmashavia based","expect":{"contains":["Ukraine"],"notRefusal":true}},{"q":"name the home country of Alrosa Mirny Air Enterprise","expect":{"contains":["Russia"],"notRefusal":true}},{"q":"which country is the airline Pobeda from","expect":{"contains":["Russia"],"notRefusal":true}},{"q":"which country is the airline Hex'Air from","expect":{"contains":["France"],"notRefusal":true}},{"q":"which country is the airline NEXT Brasil from","expect":{"contains":["Brazil"],"notRefusal":true}},{"q":"name the home country of bmi","expect":{"contains":["United Kingdom"],"notRefusal":true}},{"q":"where is the airline EuropeSky based","expect":{"contains":["Germany"],"notRefusal":true}},{"q":"name the home country of Avient Aviation","expect":{"contains":["Zimbabwe"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
