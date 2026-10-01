// tzdb-zone-country-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"tzdb-zone-country-neo-g6","class":"tzdb-zone-country","generation":6,"lane":"neo","grownFrom":["which country is the time zone Indian/Antananarivo in","which country is the time zone Europe/Kyiv in","name the country of the time zone Africa/Harare","the IANA zone Europe/Chisinau belongs to which country","the IANA zone Asia/Kamchatka belongs to which country","name the country of the time zone Asia/Beirut","the IANA zone America/Managua belongs to which country","name the country of the time zone Asia/Seoul","the IANA zone Asia/Riyadh belongs to which country","name the country of the time zone Pacific/Chatham","which country is the time zone Asia/Dhaka in","which country is the time zone Indian/Mahe in","which country is the time zone Europe/Brussels in","which country is the time zone Africa/Tripoli in","which country is the time zone Asia/Amman in","the IANA zone Africa/Lubumbashi belongs to which country","name the country of the time zone Pacific/Honolulu","the IANA zone Africa/Luanda belongs to which country","the IANA zone America/Lower_Princes belongs to which country","the IANA zone Asia/Bangkok belongs to which country"],"version":1});

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
{"id":"n-67b17870","guard":[["has","country"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Indian/Antananarivo in":"The time zone Indian/Antananarivo is in Madagascar.","which country is the time zone Europe/Kyiv in":"The time zone Europe/Kyiv is in Ukraine.","name the country of the time zone Africa/Harare":"The time zone Africa/Harare is in Zimbabwe.","the IANA zone Europe/Chisinau belongs to which country":"The time zone Europe/Chisinau is in Moldova.","the IANA zone Asia/Kamchatka belongs to which country":"The time zone Asia/Kamchatka is in Russia.","name the country of the time zone Asia/Beirut":"The time zone Asia/Beirut is in Lebanon.","the IANA zone America/Managua belongs to which country":"The time zone America/Managua is in Nicaragua.","name the country of the time zone Asia/Seoul":"The time zone Asia/Seoul is in South Korea.","the IANA zone Asia/Riyadh belongs to which country":"The time zone Asia/Riyadh is in Saudi Arabia.","name the country of the time zone Pacific/Chatham":"The time zone Pacific/Chatham is in New Zealand.","which country is the time zone Asia/Dhaka in":"The time zone Asia/Dhaka is in Bangladesh.","which country is the time zone Indian/Mahe in":"The time zone Indian/Mahe is in Seychelles.","which country is the time zone Europe/Brussels in":"The time zone Europe/Brussels is in Belgium.","which country is the time zone Africa/Tripoli in":"The time zone Africa/Tripoli is in Libya.","which country is the time zone Asia/Amman in":"The time zone Asia/Amman is in Jordan.","the IANA zone Africa/Lubumbashi belongs to which country":"The time zone Africa/Lubumbashi is in Democratic Republic of the Congo.","name the country of the time zone Pacific/Honolulu":"The time zone Pacific/Honolulu is in United States.","the IANA zone Africa/Luanda belongs to which country":"The time zone Africa/Luanda is in Angola.","the IANA zone America/Lower_Princes belongs to which country":"The time zone America/Lower_Princes is in Sint Maarten.","the IANA zone Asia/Bangkok belongs to which country":"The time zone Asia/Bangkok is in Thailand.","name the country of the time zone Europe/Belgrade":"The time zone Europe/Belgrade is in Serbia.","name the country of the time zone America/Atikokan":"The time zone America/Atikokan is in Canada.","the IANA zone Asia/Hebron belongs to which country":"The time zone Asia/Hebron is in Palestinian Territory.","the IANA zone America/Adak belongs to which country":"The time zone America/Adak is in United States.","name the country of the time zone America/Nassau":"The time zone America/Nassau is in Bahamas.","name the country of the time zone America/St_Barthelemy":"The time zone America/St_Barthelemy is in Saint Barthelemy.","name the country of the time zone Africa/Bamako":"The time zone Africa/Bamako is in Mali.","which country is the time zone America/Toronto in":"The time zone America/Toronto is in Canada.","which country is the time zone Asia/Urumqi in":"The time zone Asia/Urumqi is in China.","the IANA zone Asia/Manila belongs to which country":"The time zone Asia/Manila is in Philippines.","name the country of the time zone Atlantic/Stanley":"The time zone Atlantic/Stanley is in Falkland Islands.","name the country of the time zone Africa/Nairobi":"The time zone Africa/Nairobi is in Kenya.","which country is the time zone Europe/Prague in":"The time zone Europe/Prague is in Czechia.","which country is the time zone Europe/Riga in":"The time zone Europe/Riga is in Latvia.","name the country of the time zone Pacific/Fakaofo":"The time zone Pacific/Fakaofo is in Tokelau.","the IANA zone Asia/Ho_Chi_Minh belongs to which country":"The time zone Asia/Ho_Chi_Minh is in Vietnam.","name the country of the time zone Pacific/Midway":"The time zone Pacific/Midway is in United States Minor Outlying Islands.","which country is the time zone Europe/Stockholm in":"The time zone Europe/Stockholm is in Sweden.","name the country of the time zone America/Winnipeg":"The time zone America/Winnipeg is in Canada.","name the country of the time zone Asia/Irkutsk":"The time zone Asia/Irkutsk is in Russia.","the IANA zone America/Halifax belongs to which country":"The time zone America/Halifax is in Canada.","which country is the time zone Asia/Chita in":"The time zone Asia/Chita is in Russia.","name the country of the time zone Asia/Hong_Kong":"The time zone Asia/Hong_Kong is in Hong Kong.","the IANA zone Asia/Makassar belongs to which country":"The time zone Asia/Makassar is in Indonesia.","name the country of the time zone Pacific/Rarotonga":"The time zone Pacific/Rarotonga is in Cook Islands.","which country is the time zone Pacific/Saipan in":"The time zone Pacific/Saipan is in Northern Mariana Islands.","which country is the time zone Indian/Cocos in":"The time zone Indian/Cocos is in Cocos Islands.","the IANA zone Africa/Asmara belongs to which country":"The time zone Africa/Asmara is in Eritrea.","the IANA zone Indian/Kerguelen belongs to which country":"The time zone Indian/Kerguelen is in French Southern Territories.","the IANA zone Africa/Kampala belongs to which country":"The time zone Africa/Kampala is in Uganda.","name the country of the time zone Europe/Oslo":"The time zone Europe/Oslo is in Norway.","the IANA zone Asia/Vladivostok belongs to which country":"The time zone Asia/Vladivostok is in Russia.","the IANA zone Europe/Vaduz belongs to which country":"The time zone Europe/Vaduz is in Liechtenstein.","name the country of the time zone Asia/Jerusalem":"The time zone Asia/Jerusalem is in Israel.","which country is the time zone America/Danmarkshavn in":"The time zone America/Danmarkshavn is in Greenland.","name the country of the time zone America/Manaus":"The time zone America/Manaus is in Brazil.","name the country of the time zone Asia/Aden":"The time zone Asia/Aden is in Yemen.","which country is the time zone America/Punta_Arenas in":"The time zone America/Punta_Arenas is in Chile.","which country is the time zone Pacific/Efate in":"The time zone Pacific/Efate is in Vanuatu.","which country is the time zone Europe/Ljubljana in":"The time zone Europe/Ljubljana is in Slovenia.","the IANA zone America/Marigot belongs to which country":"The time zone America/Marigot is in Saint Martin.","name the country of the time zone Africa/Kigali":"The time zone Africa/Kigali is in Rwanda.","which country is the time zone Pacific/Galapagos in":"The time zone Pacific/Galapagos is in Ecuador.","name the country of the time zone America/Bogota":"The time zone America/Bogota is in Colombia.","which country is the time zone Africa/Abidjan in":"The time zone Africa/Abidjan is in Ivory Coast.","the IANA zone Africa/Lome belongs to which country":"The time zone Africa/Lome is in Togo.","which country is the time zone Europe/Sofia in":"The time zone Europe/Sofia is in Bulgaria.","the IANA zone Africa/Windhoek belongs to which country":"The time zone Africa/Windhoek is in Namibia.","which country is the time zone America/Guayaquil in":"The time zone America/Guayaquil is in Ecuador.","which country is the time zone America/St_Thomas in":"The time zone America/St_Thomas is in U.S. Virgin Islands.","which country is the time zone Asia/Vientiane in":"The time zone Asia/Vientiane is in Laos.","which country is the time zone Asia/Sakhalin in":"The time zone Asia/Sakhalin is in Russia.","name the country of the time zone Africa/Lagos":"The time zone Africa/Lagos is in Nigeria.","the IANA zone Europe/San_Marino belongs to which country":"The time zone Europe/San_Marino is in San Marino.","the IANA zone Africa/Bissau belongs to which country":"The time zone Africa/Bissau is in Guinea-Bissau.","the IANA zone America/Vancouver belongs to which country":"The time zone America/Vancouver is in Canada.","name the country of the time zone America/Port_of_Spain":"The time zone America/Port_of_Spain is in Trinidad and Tobago.","name the country of the time zone Asia/Nicosia":"The time zone Asia/Nicosia is in Cyprus.","the IANA zone America/Los_Angeles belongs to which country":"The time zone America/Los_Angeles is in United States.","name the country of the time zone Asia/Phnom_Penh":"The time zone Asia/Phnom_Penh is in Cambodia.","the IANA zone Asia/Shanghai belongs to which country":"The time zone Asia/Shanghai is in China.","the IANA zone Asia/Karachi belongs to which country":"The time zone Asia/Karachi is in Pakistan.","name the country of the time zone America/Costa_Rica":"The time zone America/Costa_Rica is in Costa Rica."}}},
{"id":"n-cbd84002","guard":[["has","country"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Indian/Antananarivo in":"The time zone Indian/Antananarivo is in Madagascar.","which country is the time zone Europe/Kyiv in":"The time zone Europe/Kyiv is in Ukraine.","name the country of the time zone Africa/Harare":"The time zone Africa/Harare is in Zimbabwe.","the IANA zone Europe/Chisinau belongs to which country":"The time zone Europe/Chisinau is in Moldova.","the IANA zone Asia/Kamchatka belongs to which country":"The time zone Asia/Kamchatka is in Russia.","name the country of the time zone Asia/Beirut":"The time zone Asia/Beirut is in Lebanon.","the IANA zone America/Managua belongs to which country":"The time zone America/Managua is in Nicaragua.","name the country of the time zone Asia/Seoul":"The time zone Asia/Seoul is in South Korea.","the IANA zone Asia/Riyadh belongs to which country":"The time zone Asia/Riyadh is in Saudi Arabia.","name the country of the time zone Pacific/Chatham":"The time zone Pacific/Chatham is in New Zealand.","which country is the time zone Asia/Dhaka in":"The time zone Asia/Dhaka is in Bangladesh.","which country is the time zone Indian/Mahe in":"The time zone Indian/Mahe is in Seychelles.","which country is the time zone Europe/Brussels in":"The time zone Europe/Brussels is in Belgium.","which country is the time zone Africa/Tripoli in":"The time zone Africa/Tripoli is in Libya.","which country is the time zone Asia/Amman in":"The time zone Asia/Amman is in Jordan.","the IANA zone Africa/Lubumbashi belongs to which country":"The time zone Africa/Lubumbashi is in Democratic Republic of the Congo.","name the country of the time zone Pacific/Honolulu":"The time zone Pacific/Honolulu is in United States.","the IANA zone Africa/Luanda belongs to which country":"The time zone Africa/Luanda is in Angola.","the IANA zone America/Lower_Princes belongs to which country":"The time zone America/Lower_Princes is in Sint Maarten.","the IANA zone Asia/Bangkok belongs to which country":"The time zone Asia/Bangkok is in Thailand.","name the country of the time zone Europe/Belgrade":"The time zone Europe/Belgrade is in Serbia.","name the country of the time zone America/Atikokan":"The time zone America/Atikokan is in Canada.","the IANA zone Asia/Hebron belongs to which country":"The time zone Asia/Hebron is in Palestinian Territory.","the IANA zone America/Adak belongs to which country":"The time zone America/Adak is in United States.","name the country of the time zone America/Nassau":"The time zone America/Nassau is in Bahamas.","name the country of the time zone America/St_Barthelemy":"The time zone America/St_Barthelemy is in Saint Barthelemy.","name the country of the time zone Africa/Bamako":"The time zone Africa/Bamako is in Mali.","which country is the time zone America/Toronto in":"The time zone America/Toronto is in Canada.","which country is the time zone Asia/Urumqi in":"The time zone Asia/Urumqi is in China.","the IANA zone Asia/Manila belongs to which country":"The time zone Asia/Manila is in Philippines.","name the country of the time zone Atlantic/Stanley":"The time zone Atlantic/Stanley is in Falkland Islands.","name the country of the time zone Africa/Nairobi":"The time zone Africa/Nairobi is in Kenya.","which country is the time zone Europe/Prague in":"The time zone Europe/Prague is in Czechia.","which country is the time zone Europe/Riga in":"The time zone Europe/Riga is in Latvia.","name the country of the time zone Pacific/Fakaofo":"The time zone Pacific/Fakaofo is in Tokelau.","the IANA zone Asia/Ho_Chi_Minh belongs to which country":"The time zone Asia/Ho_Chi_Minh is in Vietnam.","name the country of the time zone Pacific/Midway":"The time zone Pacific/Midway is in United States Minor Outlying Islands.","which country is the time zone Europe/Stockholm in":"The time zone Europe/Stockholm is in Sweden.","name the country of the time zone America/Winnipeg":"The time zone America/Winnipeg is in Canada.","name the country of the time zone Asia/Irkutsk":"The time zone Asia/Irkutsk is in Russia.","the IANA zone America/Halifax belongs to which country":"The time zone America/Halifax is in Canada.","which country is the time zone Asia/Chita in":"The time zone Asia/Chita is in Russia.","name the country of the time zone Asia/Hong_Kong":"The time zone Asia/Hong_Kong is in Hong Kong.","the IANA zone Asia/Makassar belongs to which country":"The time zone Asia/Makassar is in Indonesia.","name the country of the time zone Pacific/Rarotonga":"The time zone Pacific/Rarotonga is in Cook Islands.","which country is the time zone Pacific/Saipan in":"The time zone Pacific/Saipan is in Northern Mariana Islands.","which country is the time zone Indian/Cocos in":"The time zone Indian/Cocos is in Cocos Islands.","the IANA zone Africa/Asmara belongs to which country":"The time zone Africa/Asmara is in Eritrea.","the IANA zone Indian/Kerguelen belongs to which country":"The time zone Indian/Kerguelen is in French Southern Territories.","the IANA zone Africa/Kampala belongs to which country":"The time zone Africa/Kampala is in Uganda.","name the country of the time zone Europe/Oslo":"The time zone Europe/Oslo is in Norway.","the IANA zone Asia/Vladivostok belongs to which country":"The time zone Asia/Vladivostok is in Russia.","the IANA zone Europe/Vaduz belongs to which country":"The time zone Europe/Vaduz is in Liechtenstein.","name the country of the time zone Asia/Jerusalem":"The time zone Asia/Jerusalem is in Israel.","which country is the time zone America/Danmarkshavn in":"The time zone America/Danmarkshavn is in Greenland.","name the country of the time zone America/Manaus":"The time zone America/Manaus is in Brazil.","name the country of the time zone Asia/Aden":"The time zone Asia/Aden is in Yemen.","which country is the time zone America/Punta_Arenas in":"The time zone America/Punta_Arenas is in Chile.","which country is the time zone Pacific/Efate in":"The time zone Pacific/Efate is in Vanuatu.","which country is the time zone Europe/Ljubljana in":"The time zone Europe/Ljubljana is in Slovenia.","the IANA zone America/Marigot belongs to which country":"The time zone America/Marigot is in Saint Martin.","name the country of the time zone Africa/Kigali":"The time zone Africa/Kigali is in Rwanda.","which country is the time zone Pacific/Galapagos in":"The time zone Pacific/Galapagos is in Ecuador.","name the country of the time zone America/Bogota":"The time zone America/Bogota is in Colombia.","which country is the time zone Africa/Abidjan in":"The time zone Africa/Abidjan is in Ivory Coast.","the IANA zone Africa/Lome belongs to which country":"The time zone Africa/Lome is in Togo.","which country is the time zone Europe/Sofia in":"The time zone Europe/Sofia is in Bulgaria.","the IANA zone Africa/Windhoek belongs to which country":"The time zone Africa/Windhoek is in Namibia.","which country is the time zone America/Guayaquil in":"The time zone America/Guayaquil is in Ecuador.","which country is the time zone America/St_Thomas in":"The time zone America/St_Thomas is in U.S. Virgin Islands.","which country is the time zone Asia/Vientiane in":"The time zone Asia/Vientiane is in Laos.","which country is the time zone Asia/Sakhalin in":"The time zone Asia/Sakhalin is in Russia.","name the country of the time zone Africa/Lagos":"The time zone Africa/Lagos is in Nigeria.","the IANA zone Europe/San_Marino belongs to which country":"The time zone Europe/San_Marino is in San Marino.","the IANA zone Africa/Bissau belongs to which country":"The time zone Africa/Bissau is in Guinea-Bissau.","the IANA zone America/Vancouver belongs to which country":"The time zone America/Vancouver is in Canada.","name the country of the time zone America/Port_of_Spain":"The time zone America/Port_of_Spain is in Trinidad and Tobago.","name the country of the time zone Asia/Nicosia":"The time zone Asia/Nicosia is in Cyprus.","the IANA zone America/Los_Angeles belongs to which country":"The time zone America/Los_Angeles is in United States.","name the country of the time zone Asia/Phnom_Penh":"The time zone Asia/Phnom_Penh is in Cambodia.","the IANA zone Asia/Shanghai belongs to which country":"The time zone Asia/Shanghai is in China.","the IANA zone Asia/Karachi belongs to which country":"The time zone Asia/Karachi is in Pakistan.","name the country of the time zone America/Costa_Rica":"The time zone America/Costa_Rica is in Costa Rica."}}},
{"id":"n-81285a06","guard":[["has","country"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"country"}]]],"mem":{"table":{"is the time zone Indian/Antananarivo in":"The time zone Indian/Antananarivo is in Madagascar.","is the time zone Europe/Kyiv in":"The time zone Europe/Kyiv is in Ukraine.","of the time zone Africa/Harare":"The time zone Africa/Harare is in Zimbabwe.","of the time zone Asia/Beirut":"The time zone Asia/Beirut is in Lebanon.","of the time zone Asia/Seoul":"The time zone Asia/Seoul is in South Korea.","of the time zone Pacific/Chatham":"The time zone Pacific/Chatham is in New Zealand.","is the time zone Asia/Dhaka in":"The time zone Asia/Dhaka is in Bangladesh.","is the time zone Indian/Mahe in":"The time zone Indian/Mahe is in Seychelles.","is the time zone Europe/Brussels in":"The time zone Europe/Brussels is in Belgium.","is the time zone Africa/Tripoli in":"The time zone Africa/Tripoli is in Libya.","is the time zone Asia/Amman in":"The time zone Asia/Amman is in Jordan.","of the time zone Pacific/Honolulu":"The time zone Pacific/Honolulu is in United States.","of the time zone Europe/Belgrade":"The time zone Europe/Belgrade is in Serbia.","of the time zone America/Atikokan":"The time zone America/Atikokan is in Canada.","of the time zone America/Nassau":"The time zone America/Nassau is in Bahamas.","of the time zone America/St_Barthelemy":"The time zone America/St_Barthelemy is in Saint Barthelemy.","of the time zone Africa/Bamako":"The time zone Africa/Bamako is in Mali.","is the time zone America/Toronto in":"The time zone America/Toronto is in Canada.","is the time zone Asia/Urumqi in":"The time zone Asia/Urumqi is in China.","of the time zone Atlantic/Stanley":"The time zone Atlantic/Stanley is in Falkland Islands.","of the time zone Africa/Nairobi":"The time zone Africa/Nairobi is in Kenya.","is the time zone Europe/Prague in":"The time zone Europe/Prague is in Czechia.","is the time zone Europe/Riga in":"The time zone Europe/Riga is in Latvia.","of the time zone Pacific/Fakaofo":"The time zone Pacific/Fakaofo is in Tokelau.","of the time zone Pacific/Midway":"The time zone Pacific/Midway is in United States Minor Outlying Islands.","is the time zone Europe/Stockholm in":"The time zone Europe/Stockholm is in Sweden.","of the time zone America/Winnipeg":"The time zone America/Winnipeg is in Canada.","of the time zone Asia/Irkutsk":"The time zone Asia/Irkutsk is in Russia.","is the time zone Asia/Chita in":"The time zone Asia/Chita is in Russia.","of the time zone Asia/Hong_Kong":"The time zone Asia/Hong_Kong is in Hong Kong.","of the time zone Pacific/Rarotonga":"The time zone Pacific/Rarotonga is in Cook Islands.","is the time zone Pacific/Saipan in":"The time zone Pacific/Saipan is in Northern Mariana Islands.","is the time zone Indian/Cocos in":"The time zone Indian/Cocos is in Cocos Islands.","of the time zone Europe/Oslo":"The time zone Europe/Oslo is in Norway.","of the time zone Asia/Jerusalem":"The time zone Asia/Jerusalem is in Israel.","is the time zone America/Danmarkshavn in":"The time zone America/Danmarkshavn is in Greenland.","of the time zone America/Manaus":"The time zone America/Manaus is in Brazil.","of the time zone Asia/Aden":"The time zone Asia/Aden is in Yemen.","is the time zone America/Punta_Arenas in":"The time zone America/Punta_Arenas is in Chile.","is the time zone Pacific/Efate in":"The time zone Pacific/Efate is in Vanuatu.","is the time zone Europe/Ljubljana in":"The time zone Europe/Ljubljana is in Slovenia.","of the time zone Africa/Kigali":"The time zone Africa/Kigali is in Rwanda.","is the time zone Pacific/Galapagos in":"The time zone Pacific/Galapagos is in Ecuador.","of the time zone America/Bogota":"The time zone America/Bogota is in Colombia.","is the time zone Africa/Abidjan in":"The time zone Africa/Abidjan is in Ivory Coast.","is the time zone Europe/Sofia in":"The time zone Europe/Sofia is in Bulgaria.","is the time zone America/Guayaquil in":"The time zone America/Guayaquil is in Ecuador.","is the time zone America/St_Thomas in":"The time zone America/St_Thomas is in U.S. Virgin Islands.","is the time zone Asia/Vientiane in":"The time zone Asia/Vientiane is in Laos.","is the time zone Asia/Sakhalin in":"The time zone Asia/Sakhalin is in Russia.","of the time zone Africa/Lagos":"The time zone Africa/Lagos is in Nigeria.","of the time zone America/Port_of_Spain":"The time zone America/Port_of_Spain is in Trinidad and Tobago.","of the time zone Asia/Nicosia":"The time zone Asia/Nicosia is in Cyprus.","of the time zone Asia/Phnom_Penh":"The time zone Asia/Phnom_Penh is in Cambodia.","of the time zone America/Costa_Rica":"The time zone America/Costa_Rica is in Costa Rica."}}},
{"id":"n-c8bcbf3c","guard":[["has","country"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the time zone Africa/Harare":"The time zone Africa/Harare is in Zimbabwe.","the time zone Asia/Beirut":"The time zone Asia/Beirut is in Lebanon.","the time zone Asia/Seoul":"The time zone Asia/Seoul is in South Korea.","the time zone Pacific/Chatham":"The time zone Pacific/Chatham is in New Zealand.","the time zone Pacific/Honolulu":"The time zone Pacific/Honolulu is in United States.","the time zone Europe/Belgrade":"The time zone Europe/Belgrade is in Serbia.","the time zone America/Atikokan":"The time zone America/Atikokan is in Canada.","the time zone America/Nassau":"The time zone America/Nassau is in Bahamas.","the time zone America/St_Barthelemy":"The time zone America/St_Barthelemy is in Saint Barthelemy.","the time zone Africa/Bamako":"The time zone Africa/Bamako is in Mali.","the time zone Atlantic/Stanley":"The time zone Atlantic/Stanley is in Falkland Islands.","the time zone Africa/Nairobi":"The time zone Africa/Nairobi is in Kenya.","the time zone Pacific/Fakaofo":"The time zone Pacific/Fakaofo is in Tokelau.","the time zone Pacific/Midway":"The time zone Pacific/Midway is in United States Minor Outlying Islands.","the time zone America/Winnipeg":"The time zone America/Winnipeg is in Canada.","the time zone Asia/Irkutsk":"The time zone Asia/Irkutsk is in Russia.","the time zone Asia/Hong_Kong":"The time zone Asia/Hong_Kong is in Hong Kong.","the time zone Pacific/Rarotonga":"The time zone Pacific/Rarotonga is in Cook Islands.","the time zone Europe/Oslo":"The time zone Europe/Oslo is in Norway.","the time zone Asia/Jerusalem":"The time zone Asia/Jerusalem is in Israel.","the time zone America/Manaus":"The time zone America/Manaus is in Brazil.","the time zone Asia/Aden":"The time zone Asia/Aden is in Yemen.","the time zone Africa/Kigali":"The time zone Africa/Kigali is in Rwanda.","the time zone America/Bogota":"The time zone America/Bogota is in Colombia.","the time zone Africa/Lagos":"The time zone Africa/Lagos is in Nigeria.","the time zone America/Port_of_Spain":"The time zone America/Port_of_Spain is in Trinidad and Tobago.","the time zone Asia/Nicosia":"The time zone Asia/Nicosia is in Cyprus.","the time zone Asia/Phnom_Penh":"The time zone Asia/Phnom_Penh is in Cambodia.","the time zone America/Costa_Rica":"The time zone America/Costa_Rica is in Costa Rica."}}},
{"id":"n-7b09e340","guard":[["has","belongs"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"to"}]]],"mem":{"table":{"the IANA zone Europe/Chisinau belongs":"The time zone Europe/Chisinau is in Moldova.","the IANA zone Asia/Kamchatka belongs":"The time zone Asia/Kamchatka is in Russia.","the IANA zone America/Managua belongs":"The time zone America/Managua is in Nicaragua.","the IANA zone Asia/Riyadh belongs":"The time zone Asia/Riyadh is in Saudi Arabia.","the IANA zone Africa/Lubumbashi belongs":"The time zone Africa/Lubumbashi is in Democratic Republic of the Congo.","the IANA zone Africa/Luanda belongs":"The time zone Africa/Luanda is in Angola.","the IANA zone America/Lower_Princes belongs":"The time zone America/Lower_Princes is in Sint Maarten.","the IANA zone Asia/Bangkok belongs":"The time zone Asia/Bangkok is in Thailand.","the IANA zone Asia/Hebron belongs":"The time zone Asia/Hebron is in Palestinian Territory.","the IANA zone America/Adak belongs":"The time zone America/Adak is in United States.","the IANA zone Asia/Manila belongs":"The time zone Asia/Manila is in Philippines.","the IANA zone Asia/Ho_Chi_Minh belongs":"The time zone Asia/Ho_Chi_Minh is in Vietnam.","the IANA zone America/Halifax belongs":"The time zone America/Halifax is in Canada.","the IANA zone Asia/Makassar belongs":"The time zone Asia/Makassar is in Indonesia.","the IANA zone Africa/Asmara belongs":"The time zone Africa/Asmara is in Eritrea.","the IANA zone Indian/Kerguelen belongs":"The time zone Indian/Kerguelen is in French Southern Territories.","the IANA zone Africa/Kampala belongs":"The time zone Africa/Kampala is in Uganda.","the IANA zone Asia/Vladivostok belongs":"The time zone Asia/Vladivostok is in Russia.","the IANA zone Europe/Vaduz belongs":"The time zone Europe/Vaduz is in Liechtenstein.","the IANA zone America/Marigot belongs":"The time zone America/Marigot is in Saint Martin.","the IANA zone Africa/Lome belongs":"The time zone Africa/Lome is in Togo.","the IANA zone Africa/Windhoek belongs":"The time zone Africa/Windhoek is in Namibia.","the IANA zone Europe/San_Marino belongs":"The time zone Europe/San_Marino is in San Marino.","the IANA zone Africa/Bissau belongs":"The time zone Africa/Bissau is in Guinea-Bissau.","the IANA zone America/Vancouver belongs":"The time zone America/Vancouver is in Canada.","the IANA zone America/Los_Angeles belongs":"The time zone America/Los_Angeles is in United States.","the IANA zone Asia/Shanghai belongs":"The time zone Asia/Shanghai is in China.","the IANA zone Asia/Karachi belongs":"The time zone Asia/Karachi is in Pakistan."}}},
{"id":"n-43d7f70f","guard":[["has","country"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the time zone Indian/Antananarivo in":"The time zone Indian/Antananarivo is in Madagascar.","the time zone Europe/Kyiv in":"The time zone Europe/Kyiv is in Ukraine.","the time zone Asia/Dhaka in":"The time zone Asia/Dhaka is in Bangladesh.","the time zone Indian/Mahe in":"The time zone Indian/Mahe is in Seychelles.","the time zone Europe/Brussels in":"The time zone Europe/Brussels is in Belgium.","the time zone Africa/Tripoli in":"The time zone Africa/Tripoli is in Libya.","the time zone Asia/Amman in":"The time zone Asia/Amman is in Jordan.","the time zone America/Toronto in":"The time zone America/Toronto is in Canada.","the time zone Asia/Urumqi in":"The time zone Asia/Urumqi is in China.","the time zone Europe/Prague in":"The time zone Europe/Prague is in Czechia.","the time zone Europe/Riga in":"The time zone Europe/Riga is in Latvia.","the time zone Europe/Stockholm in":"The time zone Europe/Stockholm is in Sweden.","the time zone Asia/Chita in":"The time zone Asia/Chita is in Russia.","the time zone Pacific/Saipan in":"The time zone Pacific/Saipan is in Northern Mariana Islands.","the time zone Indian/Cocos in":"The time zone Indian/Cocos is in Cocos Islands.","the time zone America/Danmarkshavn in":"The time zone America/Danmarkshavn is in Greenland.","the time zone America/Punta_Arenas in":"The time zone America/Punta_Arenas is in Chile.","the time zone Pacific/Efate in":"The time zone Pacific/Efate is in Vanuatu.","the time zone Europe/Ljubljana in":"The time zone Europe/Ljubljana is in Slovenia.","the time zone Pacific/Galapagos in":"The time zone Pacific/Galapagos is in Ecuador.","the time zone Africa/Abidjan in":"The time zone Africa/Abidjan is in Ivory Coast.","the time zone Europe/Sofia in":"The time zone Europe/Sofia is in Bulgaria.","the time zone America/Guayaquil in":"The time zone America/Guayaquil is in Ecuador.","the time zone America/St_Thomas in":"The time zone America/St_Thomas is in U.S. Virgin Islands.","the time zone Asia/Vientiane in":"The time zone Asia/Vientiane is in Laos.","the time zone Asia/Sakhalin in":"The time zone Asia/Sakhalin is in Russia."}}},
{"id":"n-7391681e","guard":[["has","country"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"in"}]]],"mem":{"table":{"which country is the time zone Indian/Antananarivo":"The time zone Indian/Antananarivo is in Madagascar.","which country is the time zone Europe/Kyiv":"The time zone Europe/Kyiv is in Ukraine.","which country is the time zone Asia/Dhaka":"The time zone Asia/Dhaka is in Bangladesh.","which country is the time zone Indian/Mahe":"The time zone Indian/Mahe is in Seychelles.","which country is the time zone Europe/Brussels":"The time zone Europe/Brussels is in Belgium.","which country is the time zone Africa/Tripoli":"The time zone Africa/Tripoli is in Libya.","which country is the time zone Asia/Amman":"The time zone Asia/Amman is in Jordan.","which country is the time zone America/Toronto":"The time zone America/Toronto is in Canada.","which country is the time zone Asia/Urumqi":"The time zone Asia/Urumqi is in China.","which country is the time zone Europe/Prague":"The time zone Europe/Prague is in Czechia.","which country is the time zone Europe/Riga":"The time zone Europe/Riga is in Latvia.","which country is the time zone Europe/Stockholm":"The time zone Europe/Stockholm is in Sweden.","which country is the time zone Asia/Chita":"The time zone Asia/Chita is in Russia.","which country is the time zone Pacific/Saipan":"The time zone Pacific/Saipan is in Northern Mariana Islands.","which country is the time zone Indian/Cocos":"The time zone Indian/Cocos is in Cocos Islands.","which country is the time zone America/Danmarkshavn":"The time zone America/Danmarkshavn is in Greenland.","which country is the time zone America/Punta_Arenas":"The time zone America/Punta_Arenas is in Chile.","which country is the time zone Pacific/Efate":"The time zone Pacific/Efate is in Vanuatu.","which country is the time zone Europe/Ljubljana":"The time zone Europe/Ljubljana is in Slovenia.","which country is the time zone Pacific/Galapagos":"The time zone Pacific/Galapagos is in Ecuador.","which country is the time zone Africa/Abidjan":"The time zone Africa/Abidjan is in Ivory Coast.","which country is the time zone Europe/Sofia":"The time zone Europe/Sofia is in Bulgaria.","which country is the time zone America/Guayaquil":"The time zone America/Guayaquil is in Ecuador.","which country is the time zone America/St_Thomas":"The time zone America/St_Thomas is in U.S. Virgin Islands.","which country is the time zone Asia/Vientiane":"The time zone Asia/Vientiane is in Laos.","which country is the time zone Asia/Sakhalin":"The time zone Asia/Sakhalin is in Russia."}}},
{"id":"n-3d348a65","guard":[["hasAny",["asiachita","asiairkutsk","asiasakhalin","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"russia"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-4d99dd3d","guard":[["hasAny",["asiachita","asiairkutsk","asiasakhalin","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Russia"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-7f92ed40","guard":[["hasAny",["americaatikokan","americatoronto","americawinnipeg","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"canada"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-c8d21f9d","guard":[["hasAny",["americaatikokan","americatoronto","americawinnipeg","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Canada"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-c1a64ed2","guard":[["hasAny",["americaatikokan","americawinnipeg"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Canada."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-06be3874","guard":[["hasAny",["asiachita","asiasakhalin","delete","remove","strip out","without"]],["has","country"]],"pyramid":["render.str",["transform.remove",{"lit":"Russia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-0bae209b","guard":[["hasAny",["americahalifax","americavancouver","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Canada"},["sense.after",{"lit":"to"}]]],"mem":null},
{"id":"n-0fe9ffa9","guard":[["hasAny",["americaguayaquil","delete","pacificgalapagos","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Ecuador"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-1ae664d1","guard":[["hasAny",["americaatikokan","americawinnipeg","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"canada"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-6c60a8f1","guard":[["hasAny",["asiachita","asiasakhalin","delete","remove","strip out","without"]],["has","country"]],"pyramid":["render.str",["transform.remove",{"lit":"russia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-76249eb1","guard":[["hasAny",["asiakamchatka","asiavladivostok","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"russia"},["sense.after",{"lit":"to"}]]],"mem":null},
{"id":"n-84089361","guard":[["hasAny",["americaguayaquil","delete","pacificgalapagos","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Ecuador"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-9ab3cb8f","guard":[["hasAny",["americahalifax","americavancouver","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"canada"},["sense.after",{"lit":"to"}]]],"mem":null},
{"id":"n-bd772a7b","guard":[["hasAny",["americaadak","americalosangeles","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"United States"},["sense.after",{"lit":"to"}]]],"mem":null},
{"id":"n-db54a7a6","guard":[["hasAny",["asiakamchatka","asiavladivostok","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Russia"},["sense.after",{"lit":"to"}]]],"mem":null},
{"id":"n-f0672153","guard":[["hasAny",["americaatikokan","americawinnipeg","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Canada"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-7f72803e","guard":[["hasAny",["americaatikokan","americawinnipeg","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Canada."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-0f0f5280","guard":[["hasAny",["americaatikokan","americawinnipeg","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Canada."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-5a74ed53","guard":[["hasAny",["americaatikokan","americawinnipeg","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Canada."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-aa7b1482","guard":[["hasAny",["americaatikokan","americawinnipeg","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Canada."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-b1594301","guard":[["hasAny",["all caps","americaatikokan","americawinnipeg","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Canada."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-01018059","guard":[["has","pacificefate"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Pacific/Efate in":"The time zone Pacific/Efate is in Vanuatu."}}},
{"id":"n-04c5e06f","guard":[["has","pacificfakaofo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Pacific/Fakaofo":"The time zone Pacific/Fakaofo is in Tokelau."}}},
{"id":"n-05dc56c2","guard":[["has","africalome"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Africa/Lome belongs to which country":"The time zone Africa/Lome is in Togo."}}},
{"id":"n-07b7ab9c","guard":[["has","asiariyadh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Riyadh belongs to which country":"The time zone Asia/Riyadh is in Saudi Arabia."}}},
{"id":"n-08d31ff7","guard":[["hasAny",["asiahebron","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Hebron belongs to which country":"The time zone Asia/Hebron is in Palestinian Territory."}}},
{"id":"n-0947e840","guard":[["hasAny",["asiaaden","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Asia/Aden":"The time zone Asia/Aden is in Yemen."}}},
{"id":"n-0c006fdf","guard":[["has","americacostarica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone America/Costa_Rica":"The time zone America/Costa_Rica is in Costa Rica."}}},
{"id":"n-0c300b7d","guard":[["has","asiabeirut"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Asia/Beirut":"The time zone Asia/Beirut is in Lebanon."}}},
{"id":"n-0cb21476","guard":[["hasAny",["americadanmarkshavn","country","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone America/Danmarkshavn in":"The time zone America/Danmarkshavn is in Greenland."}}},
{"id":"n-0ce52e3f","guard":[["hasAny",["country","name","pacificrarotonga","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Pacific/Rarotonga":"The time zone Pacific/Rarotonga is in Cook Islands."}}},
{"id":"n-0d64311e","guard":[["hasAny",["americahalifax","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone America/Halifax belongs to which country":"The time zone America/Halifax is in Canada."}}},
{"id":"n-0f204c29","guard":[["hasAny",["africalubumbashi","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Africa/Lubumbashi belongs to which country":"The time zone Africa/Lubumbashi is in Democratic Republic of the Congo."}}},
{"id":"n-0f901312","guard":[["has","indiankerguelen"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Indian/Kerguelen belongs to which country":"The time zone Indian/Kerguelen is in French Southern Territories."}}},
{"id":"n-1178c5bb","guard":[["has","europeoslo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Europe/Oslo":"The time zone Europe/Oslo is in Norway."}}},
{"id":"n-15a26a3a","guard":[["has","europesofia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Europe/Sofia in":"The time zone Europe/Sofia is in Bulgaria."}}},
{"id":"n-1a240090","guard":[["has","africakigali"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Africa/Kigali":"The time zone Africa/Kigali is in Rwanda."}}},
{"id":"n-1c2b9dee","guard":[["hasAny",["americavancouver","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone America/Vancouver belongs to which country":"The time zone America/Vancouver is in Canada."}}},
{"id":"n-1d329cd8","guard":[["hasAny",["africakampala","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Africa/Kampala belongs to which country":"The time zone Africa/Kampala is in Uganda."}}},
{"id":"n-1fda517c","guard":[["hasAny",["asiaphnompenh","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Asia/Phnom_Penh":"The time zone Asia/Phnom_Penh is in Cambodia."}}},
{"id":"n-21171d81","guard":[["hasAny",["asiabangkok","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Bangkok belongs to which country":"The time zone Asia/Bangkok is in Thailand."}}},
{"id":"n-2279f563","guard":[["has","europesanmarino"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Europe/San_Marino belongs to which country":"The time zone Europe/San_Marino is in San Marino."}}},
{"id":"n-2481bd8d","guard":[["hasAny",["americalowerprinces","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone America/Lower_Princes belongs to which country":"The time zone America/Lower_Princes is in Sint Maarten."}}},
{"id":"n-28f317cd","guard":[["has","asiamanila"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Manila belongs to which country":"The time zone Asia/Manila is in Philippines."}}},
{"id":"n-29b808f0","guard":[["hasAny",["asiavladivostok","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Vladivostok belongs to which country":"The time zone Asia/Vladivostok is in Russia."}}},
{"id":"n-2b34bfe0","guard":[["hasAny",["belongs","country","iana","indiankerguelen","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Indian/Kerguelen belongs to which country":"The time zone Indian/Kerguelen is in French Southern Territories."}}},
{"id":"n-2d618aa5","guard":[["hasAny",["country","europeljubljana","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Europe/Ljubljana in":"The time zone Europe/Ljubljana is in Slovenia."}}},
{"id":"n-2ed49489","guard":[["has","americamanaus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone America/Manaus":"The time zone America/Manaus is in Brazil."}}},
{"id":"n-2f232251","guard":[["hasAny",["country","indiancocos","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Indian/Cocos in":"The time zone Indian/Cocos is in Cocos Islands."}}},
{"id":"n-2fc87584","guard":[["hasAny",["africabissau","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Africa/Bissau belongs to which country":"The time zone Africa/Bissau is in Guinea-Bissau."}}},
{"id":"n-3242f67d","guard":[["has","asiairkutsk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Asia/Irkutsk":"The time zone Asia/Irkutsk is in Russia."}}},
{"id":"n-35db0b9a","guard":[["has","americaportofspain"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone America/Port_of_Spain":"The time zone America/Port_of_Spain is in Trinidad and Tobago."}}},
{"id":"n-369f72e8","guard":[["hasAny",["country","name","pacificmidway","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Pacific/Midway":"The time zone Pacific/Midway is in United States Minor Outlying Islands."}}},
{"id":"n-3710c144","guard":[["has","europevaduz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Europe/Vaduz belongs to which country":"The time zone Europe/Vaduz is in Liechtenstein."}}},
{"id":"n-38871172","guard":[["has","europechisinau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Europe/Chisinau belongs to which country":"The time zone Europe/Chisinau is in Moldova."}}},
{"id":"n-3a25d788","guard":[["hasAny",["americamanaus","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone America/Manaus":"The time zone America/Manaus is in Brazil."}}},
{"id":"n-3a2c2bd5","guard":[["has","americalosangeles"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone America/Los_Angeles belongs to which country":"The time zone America/Los_Angeles is in United States."}}},
{"id":"n-3ba4c0a7","guard":[["hasAny",["americaguayaquil","country","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone America/Guayaquil in":"The time zone America/Guayaquil is in Ecuador."}}},
{"id":"n-3ba80a1d","guard":[["hasAny",["americaadak","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone America/Adak belongs to which country":"The time zone America/Adak is in United States."}}},
{"id":"n-3d9912bc","guard":[["hasAny",["country","pacificefate","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Pacific/Efate in":"The time zone Pacific/Efate is in Vanuatu."}}},
{"id":"n-407e1edc","guard":[["hasAny",["asiakarachi","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Karachi belongs to which country":"The time zone Asia/Karachi is in Pakistan."}}},
{"id":"n-40eaa5a6","guard":[["has","pacificchatham"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Pacific/Chatham":"The time zone Pacific/Chatham is in New Zealand."}}},
{"id":"n-4138cf7e","guard":[["hasAny",["americawinnipeg","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone America/Winnipeg":"The time zone America/Winnipeg is in Canada."}}},
{"id":"n-4205dbfa","guard":[["hasAny",["africaluanda","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Africa/Luanda belongs to which country":"The time zone Africa/Luanda is in Angola."}}},
{"id":"n-4345e369","guard":[["has","africabamako"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Africa/Bamako":"The time zone Africa/Bamako is in Mali."}}},
{"id":"n-438fb780","guard":[["has","americaadak"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone America/Adak belongs to which country":"The time zone America/Adak is in United States."}}},
{"id":"n-4449fd3a","guard":[["has","americamanagua"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone America/Managua belongs to which country":"The time zone America/Managua is in Nicaragua."}}},
{"id":"n-45203581","guard":[["has","asiamakassar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Makassar belongs to which country":"The time zone Asia/Makassar is in Indonesia."}}},
{"id":"n-46006e54","guard":[["has","africawindhoek"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Africa/Windhoek belongs to which country":"The time zone Africa/Windhoek is in Namibia."}}},
{"id":"n-46feafdf","guard":[["has","asiahochiminh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Ho_Chi_Minh belongs to which country":"The time zone Asia/Ho_Chi_Minh is in Vietnam."}}},
{"id":"n-47517104","guard":[["hasAny",["africatripoli","country","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Africa/Tripoli in":"The time zone Africa/Tripoli is in Libya."}}},
{"id":"n-4aac5ca8","guard":[["has","africalagos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Africa/Lagos":"The time zone Africa/Lagos is in Nigeria."}}},
{"id":"n-4f6e5c13","guard":[["hasAny",["country","name","pacificfakaofo","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Pacific/Fakaofo":"The time zone Pacific/Fakaofo is in Tokelau."}}},
{"id":"n-519e6440","guard":[["hasAny",["americastbarthelemy","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone America/St_Barthelemy":"The time zone America/St_Barthelemy is in Saint Barthelemy."}}},
{"id":"n-54cfce32","guard":[["hasAny",["country","europekyiv","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Europe/Kyiv in":"The time zone Europe/Kyiv is in Ukraine."}}},
{"id":"n-562848b8","guard":[["hasAny",["africaabidjan","country","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Africa/Abidjan in":"The time zone Africa/Abidjan is in Ivory Coast."}}},
{"id":"n-57224472","guard":[["has","asiaseoul"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Asia/Seoul":"The time zone Asia/Seoul is in South Korea."}}},
{"id":"n-575149ca","guard":[["has","americamarigot"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone America/Marigot belongs to which country":"The time zone America/Marigot is in Saint Martin."}}},
{"id":"n-5a1766e2","guard":[["hasAny",["country","europebrussels","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Europe/Brussels in":"The time zone Europe/Brussels is in Belgium."}}},
{"id":"n-6098b956","guard":[["hasAny",["africakigali","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Africa/Kigali":"The time zone Africa/Kigali is in Rwanda."}}},
{"id":"n-6476f37f","guard":[["has","asiajerusalem"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Asia/Jerusalem":"The time zone Asia/Jerusalem is in Israel."}}},
{"id":"n-65fda4c4","guard":[["hasAny",["asiahochiminh","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Ho_Chi_Minh belongs to which country":"The time zone Asia/Ho_Chi_Minh is in Vietnam."}}},
{"id":"n-6b708bb0","guard":[["has","indianmahe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Indian/Mahe in":"The time zone Indian/Mahe is in Seychelles."}}},
{"id":"n-6e11261e","guard":[["hasAny",["asiahongkong","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Asia/Hong_Kong":"The time zone Asia/Hong_Kong is in Hong Kong."}}},
{"id":"n-6ec2fa38","guard":[["hasAny",["country","europeprague","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Europe/Prague in":"The time zone Europe/Prague is in Czechia."}}},
{"id":"n-7037b8e7","guard":[["has","asiaaden"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Asia/Aden":"The time zone Asia/Aden is in Yemen."}}},
{"id":"n-74e725e0","guard":[["hasAny",["country","pacificsaipan","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Pacific/Saipan in":"The time zone Pacific/Saipan is in Northern Mariana Islands."}}},
{"id":"n-77ed132a","guard":[["hasAny",["americabogota","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone America/Bogota":"The time zone America/Bogota is in Colombia."}}},
{"id":"n-7804aa07","guard":[["hasAny",["africanairobi","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Africa/Nairobi":"The time zone Africa/Nairobi is in Kenya."}}},
{"id":"n-7973dd6c","guard":[["hasAny",["asiajerusalem","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Asia/Jerusalem":"The time zone Asia/Jerusalem is in Israel."}}},
{"id":"n-79b98ccc","guard":[["hasAny",["country","pacificgalapagos","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Pacific/Galapagos in":"The time zone Pacific/Galapagos is in Ecuador."}}},
{"id":"n-7b475cee","guard":[["hasAny",["asiairkutsk","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Asia/Irkutsk":"The time zone Asia/Irkutsk is in Russia."}}},
{"id":"n-7b871c80","guard":[["has","pacifichonolulu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Pacific/Honolulu":"The time zone Pacific/Honolulu is in United States."}}},
{"id":"n-80683062","guard":[["has","europestockholm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Europe/Stockholm in":"The time zone Europe/Stockholm is in Sweden."}}},
{"id":"n-8544cb47","guard":[["hasAny",["asiadhaka","country","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Asia/Dhaka in":"The time zone Asia/Dhaka is in Bangladesh."}}},
{"id":"n-86979d9c","guard":[["has","africaharare"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Africa/Harare":"The time zone Africa/Harare is in Zimbabwe."}}},
{"id":"n-872bfce0","guard":[["hasAny",["country","name","pacifichonolulu","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Pacific/Honolulu":"The time zone Pacific/Honolulu is in United States."}}},
{"id":"n-8839ebf8","guard":[["hasAny",["africalagos","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Africa/Lagos":"The time zone Africa/Lagos is in Nigeria."}}},
{"id":"n-8917b4c6","guard":[["hasAny",["country","europeriga","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Europe/Riga in":"The time zone Europe/Riga is in Latvia."}}},
{"id":"n-89baca2d","guard":[["hasAny",["asiamanila","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Manila belongs to which country":"The time zone Asia/Manila is in Philippines."}}},
{"id":"n-8aaecd66","guard":[["has","asiaurumqi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Asia/Urumqi in":"The time zone Asia/Urumqi is in China."}}},
{"id":"n-8b8fb3bc","guard":[["hasAny",["country","indianantananarivo","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Indian/Antananarivo in":"The time zone Indian/Antananarivo is in Madagascar."}}},
{"id":"n-8cc75a24","guard":[["has","pacificrarotonga"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Pacific/Rarotonga":"The time zone Pacific/Rarotonga is in Cook Islands."}}},
{"id":"n-8f1882dc","guard":[["has","asiaphnompenh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Asia/Phnom_Penh":"The time zone Asia/Phnom_Penh is in Cambodia."}}},
{"id":"n-8f2b2dec","guard":[["hasAny",["americapuntaarenas","country","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone America/Punta_Arenas in":"The time zone America/Punta_Arenas is in Chile."}}},
{"id":"n-944045be","guard":[["has","indianantananarivo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Indian/Antananarivo in":"The time zone Indian/Antananarivo is in Madagascar."}}},
{"id":"n-95415872","guard":[["has","europebrussels"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Europe/Brussels in":"The time zone Europe/Brussels is in Belgium."}}},
{"id":"n-976b7110","guard":[["hasAny",["asiaamman","country","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Asia/Amman in":"The time zone Asia/Amman is in Jordan."}}},
{"id":"n-9922a298","guard":[["has","asiakarachi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Karachi belongs to which country":"The time zone Asia/Karachi is in Pakistan."}}},
{"id":"n-9cb99ed0","guard":[["has","asiahongkong"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Asia/Hong_Kong":"The time zone Asia/Hong_Kong is in Hong Kong."}}},
{"id":"n-9d756ef9","guard":[["has","asiavientiane"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Asia/Vientiane in":"The time zone Asia/Vientiane is in Laos."}}},
{"id":"n-a236df6d","guard":[["hasAny",["belongs","country","europechisinau","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Europe/Chisinau belongs to which country":"The time zone Europe/Chisinau is in Moldova."}}},
{"id":"n-a8fa2376","guard":[["has","americastbarthelemy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone America/St_Barthelemy":"The time zone America/St_Barthelemy is in Saint Barthelemy."}}},
{"id":"n-a9f769ef","guard":[["hasAny",["asiaseoul","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Asia/Seoul":"The time zone Asia/Seoul is in South Korea."}}},
{"id":"n-ab6b7645","guard":[["hasAny",["belongs","country","europesanmarino","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Europe/San_Marino belongs to which country":"The time zone Europe/San_Marino is in San Marino."}}},
{"id":"n-aefde552","guard":[["hasAny",["africaasmara","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Africa/Asmara belongs to which country":"The time zone Africa/Asmara is in Eritrea."}}},
{"id":"n-af97c9eb","guard":[["hasAny",["americanassau","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone America/Nassau":"The time zone America/Nassau is in Bahamas."}}},
{"id":"n-b206c98d","guard":[["has","africaasmara"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Africa/Asmara belongs to which country":"The time zone Africa/Asmara is in Eritrea."}}},
{"id":"n-b5f6187f","guard":[["has","americatoronto"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone America/Toronto in":"The time zone America/Toronto is in Canada."}}},
{"id":"n-b7814ab2","guard":[["hasAny",["asianicosia","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Asia/Nicosia":"The time zone Asia/Nicosia is in Cyprus."}}},
{"id":"n-b9a22eb1","guard":[["has","asiachita"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Asia/Chita in":"The time zone Asia/Chita is in Russia."}}},
{"id":"n-bb5b83f3","guard":[["hasAny",["asiavientiane","country","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Asia/Vientiane in":"The time zone Asia/Vientiane is in Laos."}}},
{"id":"n-bbd2daf9","guard":[["hasAny",["africalome","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Africa/Lome belongs to which country":"The time zone Africa/Lome is in Togo."}}},
{"id":"n-bcc15145","guard":[["has","pacificmidway"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Pacific/Midway":"The time zone Pacific/Midway is in United States Minor Outlying Islands."}}},
{"id":"n-bee72401","guard":[["has","americavancouver"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone America/Vancouver belongs to which country":"The time zone America/Vancouver is in Canada."}}},
{"id":"n-bf86b79c","guard":[["hasAny",["country","name","pacificchatham","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Pacific/Chatham":"The time zone Pacific/Chatham is in New Zealand."}}},
{"id":"n-c1a4ff52","guard":[["hasAny",["country","europesofia","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Europe/Sofia in":"The time zone Europe/Sofia is in Bulgaria."}}},
{"id":"n-c270d7eb","guard":[["has","africanairobi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Africa/Nairobi":"The time zone Africa/Nairobi is in Kenya."}}},
{"id":"n-c2eda47a","guard":[["hasAny",["africawindhoek","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Africa/Windhoek belongs to which country":"The time zone Africa/Windhoek is in Namibia."}}},
{"id":"n-c3b6b41f","guard":[["has","americawinnipeg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone America/Winnipeg":"The time zone America/Winnipeg is in Canada."}}},
{"id":"n-c4e25aad","guard":[["has","europekyiv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Europe/Kyiv in":"The time zone Europe/Kyiv is in Ukraine."}}},
{"id":"n-c4e91f47","guard":[["has","africakampala"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Africa/Kampala belongs to which country":"The time zone Africa/Kampala is in Uganda."}}},
{"id":"n-c5f5c6f4","guard":[["hasAny",["asiaurumqi","country","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Asia/Urumqi in":"The time zone Asia/Urumqi is in China."}}},
{"id":"n-c612d28f","guard":[["hasAny",["atlanticstanley","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Atlantic/Stanley":"The time zone Atlantic/Stanley is in Falkland Islands."}}},
{"id":"n-c6cc7eda","guard":[["has","pacificsaipan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Pacific/Saipan in":"The time zone Pacific/Saipan is in Northern Mariana Islands."}}},
{"id":"n-cb036e74","guard":[["has","americapuntaarenas"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone America/Punta_Arenas in":"The time zone America/Punta_Arenas is in Chile."}}},
{"id":"n-cc6f09e9","guard":[["hasAny",["africabamako","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Africa/Bamako":"The time zone Africa/Bamako is in Mali."}}},
{"id":"n-ccaa01f8","guard":[["has","asiahebron"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Hebron belongs to which country":"The time zone Asia/Hebron is in Palestinian Territory."}}},
{"id":"n-ce1a555e","guard":[["hasAny",["country","indianmahe","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Indian/Mahe in":"The time zone Indian/Mahe is in Seychelles."}}},
{"id":"n-ced2d58c","guard":[["hasAny",["asiashanghai","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Shanghai belongs to which country":"The time zone Asia/Shanghai is in China."}}},
{"id":"n-cf2bc136","guard":[["has","africalubumbashi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Africa/Lubumbashi belongs to which country":"The time zone Africa/Lubumbashi is in Democratic Republic of the Congo."}}},
{"id":"n-d1f156b4","guard":[["hasAny",["americaatikokan","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone America/Atikokan":"The time zone America/Atikokan is in Canada."}}},
{"id":"n-d24ae0f2","guard":[["has","asianicosia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Asia/Nicosia":"The time zone Asia/Nicosia is in Cyprus."}}},
{"id":"n-d2e2ad88","guard":[["has","europebelgrade"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Europe/Belgrade":"The time zone Europe/Belgrade is in Serbia."}}},
{"id":"n-d4fd2d05","guard":[["hasAny",["asiachita","country","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Asia/Chita in":"The time zone Asia/Chita is in Russia."}}},
{"id":"n-d70e7399","guard":[["hasAny",["americamanagua","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone America/Managua belongs to which country":"The time zone America/Managua is in Nicaragua."}}},
{"id":"n-d7ef0b51","guard":[["has","americastthomas"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone America/St_Thomas in":"The time zone America/St_Thomas is in U.S. Virgin Islands."}}},
{"id":"n-d823793d","guard":[["hasAny",["americastthomas","country","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone America/St_Thomas in":"The time zone America/St_Thomas is in U.S. Virgin Islands."}}},
{"id":"n-d82c134a","guard":[["hasAny",["americaportofspain","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone America/Port_of_Spain":"The time zone America/Port_of_Spain is in Trinidad and Tobago."}}},
{"id":"n-dbb434e8","guard":[["has","africabissau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Africa/Bissau belongs to which country":"The time zone Africa/Bissau is in Guinea-Bissau."}}},
{"id":"n-dc36c0e7","guard":[["has","asiadhaka"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Asia/Dhaka in":"The time zone Asia/Dhaka is in Bangladesh."}}},
{"id":"n-dc5280c5","guard":[["hasAny",["asiasakhalin","country","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Asia/Sakhalin in":"The time zone Asia/Sakhalin is in Russia."}}},
{"id":"n-dcd424d0","guard":[["hasAny",["americatoronto","country","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone America/Toronto in":"The time zone America/Toronto is in Canada."}}},
{"id":"n-dd587568","guard":[["hasAny",["americacostarica","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone America/Costa_Rica":"The time zone America/Costa_Rica is in Costa Rica."}}},
{"id":"n-dec9e014","guard":[["has","asiavladivostok"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Vladivostok belongs to which country":"The time zone Asia/Vladivostok is in Russia."}}},
{"id":"n-deda28ee","guard":[["hasAny",["asiakamchatka","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Kamchatka belongs to which country":"The time zone Asia/Kamchatka is in Russia."}}},
{"id":"n-df47cc73","guard":[["hasAny",["asiamakassar","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Makassar belongs to which country":"The time zone Asia/Makassar is in Indonesia."}}},
{"id":"n-e05c391f","guard":[["has","americaatikokan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone America/Atikokan":"The time zone America/Atikokan is in Canada."}}},
{"id":"n-e070becd","guard":[["has","asiashanghai"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Shanghai belongs to which country":"The time zone Asia/Shanghai is in China."}}},
{"id":"n-e2012b25","guard":[["has","americanassau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone America/Nassau":"The time zone America/Nassau is in Bahamas."}}},
{"id":"n-e23d8cf6","guard":[["hasAny",["country","europebelgrade","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Europe/Belgrade":"The time zone Europe/Belgrade is in Serbia."}}},
{"id":"n-e25332fd","guard":[["has","americahalifax"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone America/Halifax belongs to which country":"The time zone America/Halifax is in Canada."}}},
{"id":"n-e4dfefec","guard":[["has","africaabidjan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Africa/Abidjan in":"The time zone Africa/Abidjan is in Ivory Coast."}}},
{"id":"n-e4e0aefe","guard":[["hasAny",["asiariyadh","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Riyadh belongs to which country":"The time zone Asia/Riyadh is in Saudi Arabia."}}},
{"id":"n-e777b3d2","guard":[["has","europeriga"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Europe/Riga in":"The time zone Europe/Riga is in Latvia."}}},
{"id":"n-e9ae07f2","guard":[["has","africatripoli"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Africa/Tripoli in":"The time zone Africa/Tripoli is in Libya."}}},
{"id":"n-ea0741d3","guard":[["has","africaluanda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Africa/Luanda belongs to which country":"The time zone Africa/Luanda is in Angola."}}},
{"id":"n-ebc0a605","guard":[["has","americadanmarkshavn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone America/Danmarkshavn in":"The time zone America/Danmarkshavn is in Greenland."}}},
{"id":"n-ed311c57","guard":[["has","americaguayaquil"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone America/Guayaquil in":"The time zone America/Guayaquil is in Ecuador."}}},
{"id":"n-ed58a955","guard":[["hasAny",["country","europeoslo","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Europe/Oslo":"The time zone Europe/Oslo is in Norway."}}},
{"id":"n-ed89930e","guard":[["has","asiabangkok"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Bangkok belongs to which country":"The time zone Asia/Bangkok is in Thailand."}}},
{"id":"n-f01b3ceb","guard":[["has","asiakamchatka"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone Asia/Kamchatka belongs to which country":"The time zone Asia/Kamchatka is in Russia."}}},
{"id":"n-f1c2b377","guard":[["has","europeljubljana"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Europe/Ljubljana in":"The time zone Europe/Ljubljana is in Slovenia."}}},
{"id":"n-f29ae974","guard":[["has","pacificgalapagos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Pacific/Galapagos in":"The time zone Pacific/Galapagos is in Ecuador."}}},
{"id":"n-f2addd0c","guard":[["has","asiaamman"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Asia/Amman in":"The time zone Asia/Amman is in Jordan."}}},
{"id":"n-f2f4e13e","guard":[["has","atlanticstanley"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone Atlantic/Stanley":"The time zone Atlantic/Stanley is in Falkland Islands."}}},
{"id":"n-f629ae3b","guard":[["has","americabogota"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the country of the time zone America/Bogota":"The time zone America/Bogota is in Colombia."}}},
{"id":"n-f667e10a","guard":[["has","indiancocos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Indian/Cocos in":"The time zone Indian/Cocos is in Cocos Islands."}}},
{"id":"n-f6853bd9","guard":[["has","asiasakhalin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Asia/Sakhalin in":"The time zone Asia/Sakhalin is in Russia."}}},
{"id":"n-f72e8ad5","guard":[["has","europeprague"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the time zone Europe/Prague in":"The time zone Europe/Prague is in Czechia."}}},
{"id":"n-f7b2d054","guard":[["has","americalowerprinces"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the IANA zone America/Lower_Princes belongs to which country":"The time zone America/Lower_Princes is in Sint Maarten."}}},
{"id":"n-fa05c718","guard":[["hasAny",["africaharare","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Africa/Harare":"The time zone Africa/Harare is in Zimbabwe."}}},
{"id":"n-fca7e3a7","guard":[["hasAny",["americamarigot","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone America/Marigot belongs to which country":"The time zone America/Marigot is in Saint Martin."}}},
{"id":"n-fccbc921","guard":[["hasAny",["belongs","country","europevaduz","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone Europe/Vaduz belongs to which country":"The time zone Europe/Vaduz is in Liechtenstein."}}},
{"id":"n-fd7e2a6c","guard":[["hasAny",["asiabeirut","country","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country of the time zone Asia/Beirut":"The time zone Asia/Beirut is in Lebanon."}}},
{"id":"n-fde5d9bc","guard":[["hasAny",["country","europestockholm","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the time zone Europe/Stockholm in":"The time zone Europe/Stockholm is in Sweden."}}},
{"id":"n-ff2e9a85","guard":[["hasAny",["americalosangeles","belongs","country","iana","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the IANA zone America/Los_Angeles belongs to which country":"The time zone America/Los_Angeles is in United States."}}},
{"id":"n-0a339347","guard":[["has","asiariyadh"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Riyadh is in Saudi Arabia."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-107a03f1","guard":[["has","americabogota"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Colombia."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-1be1c014","guard":[["has","atlanticstanley"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Falkland Islands."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-20211789","guard":[["has","africakampala"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Kampala is in Uganda."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-287099de","guard":[["has","africaluanda"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Luanda is in Angola."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-294cac57","guard":[["has","asiamanila"],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Manila is in Philippines."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-29f3cef2","guard":[["has","asiavladivostok"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Vladivostok is in Russia."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-2bda1fa2","guard":[["has","pacificrarotonga"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Cook Islands."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-2e34f27e","guard":[["has","americamanagua"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Managua is in Nicaragua."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-2f259ff5","guard":[["has","europechisinau"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Chisinau is in Moldova."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-2f3c348c","guard":[["has","pacificchatham"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in New Zealand."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-36832b7f","guard":[["has","africaasmara"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Asmara is in Eritrea."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-430e02e3","guard":[["has","africalagos"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Nigeria."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-45129a69","guard":[["hasAny",["asiashanghai","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"China"},["sense.lastWord"]]],"mem":null},
{"id":"n-4749b36c","guard":[["has","asiaseoul"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in South Korea."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-4f25c04e","guard":[["has","americavancouver"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Vancouver is in Canada."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-4f6fcad9","guard":[["has","africabamako"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Mali."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-51f4b905","guard":[["has","americaadak"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Adak is in United States."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-5221d8f1","guard":[["has","europebelgrade"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Serbia."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-546b9c18","guard":[["has","europesanmarino"],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/San_Marino is in San Marino."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-5a5e9327","guard":[["has","africawindhoek"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Windhoek is in Namibia."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-5b7cd090","guard":[["has","americamarigot"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Marigot is in Saint Martin."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-657542de","guard":[["has","americalosangeles"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Los_Angeles is in United States."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-695d60dc","guard":[["has","pacifichonolulu"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in United States."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-6b79eb4e","guard":[["has","africabissau"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Bissau is in Guinea-Bissau."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-6e1ec91c","guard":[["has","asiaphnompenh"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Cambodia."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-73d148de","guard":[["hasAny",["asiashanghai","separate by","split","split by"]]],"pyramid":["render.and",["transform.split",{"lit":"China"},["sense.lastWord"]]],"mem":null},
{"id":"n-77b50dfd","guard":[["has","africakigali"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Rwanda."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-7b4157cc","guard":[["has","pacificfakaofo"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Tokelau."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-80623a33","guard":[["has","americanassau"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Bahamas."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-82480111","guard":[["has","americaportofspain"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Trinidad and Tobago."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-8acdd20e","guard":[["has","africalubumbashi"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Lubumbashi is in Democratic Republic of the Congo."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-8d78a533","guard":[["has","asiabeirut"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Lebanon."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-99da02a9","guard":[["has","asiakarachi"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Karachi is in Pakistan."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-99f2de3c","guard":[["has","americamanaus"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Brazil."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-9b1598a8","guard":[["has","asiamakassar"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Makassar is in Indonesia."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-9bfaa751","guard":[["has","asiabangkok"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Bangkok is in Thailand."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-a106825e","guard":[["has","africaharare"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Zimbabwe."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-a134d5cd","guard":[["has","asiajerusalem"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Israel."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-ac3be23d","guard":[["has","asiahebron"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Hebron is in Palestinian Territory."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-b4d7069b","guard":[["has","africalome"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Lome is in Togo."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-b6183fe1","guard":[["has","indiankerguelen"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Indian/Kerguelen is in French Southern Territories."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-b86c84b1","guard":[["has","europeoslo"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Norway."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-bc078ede","guard":[["has","europevaduz"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Vaduz is in Liechtenstein."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-be75bb80","guard":[["has","asiakamchatka"],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Kamchatka is in Russia."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-c477406a","guard":[["has","asiaaden"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Yemen."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-c9e82f6e","guard":[["hasAny",["asiashanghai","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",{"lit":"China"},["sense.lastWord"]]],"mem":null},
{"id":"n-d0ad30fc","guard":[["has","asiahochiminh"],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Ho_Chi_Minh is in Vietnam."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-d0dcb189","guard":[["has","americahalifax"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Halifax is in Canada."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-de9fa1fa","guard":[["has","americalowerprinces"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Lower_Princes is in Sint Maarten."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-e18b355a","guard":[["has","pacificmidway"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in United States Minor Outlying Islands."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-e1d3985c","guard":[["has","asianicosia"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Cyprus."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-e26c7ab2","guard":[["has","asiashanghai"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Shanghai is in China."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-ee8da238","guard":[["has","africanairobi"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Kenya."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-f213ac4d","guard":[["hasAny",["asiashanghai","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",{"lit":"China"},["sense.lastWord"]]],"mem":null},
{"id":"n-f6c73ef1","guard":[["has","asiairkutsk"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Russia."]},["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-055d56a5","guard":[["hasAny",["americatoronto","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Canada"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-05b5fa35","guard":[["hasAny",["americaadak","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Adak is in United States."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0619c52f","guard":[["hasAny",["asiariyadh","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Riyadh is in Saudi Arabia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-074765bb","guard":[["hasAny",["americaadak","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Adak is in United States."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-07fef3fa","guard":[["hasAny",["europebelgrade","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Europe/Belgrade is in Serbia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-090a03ca","guard":[["hasAny",["americaguayaquil","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Guayaquil is in Ecuador."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0a64f53f","guard":[["hasAny",["item number","nth","pacificefate","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Pacific/Efate is in Vanuatu."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0cf7e408","guard":[["hasAny",["asiabeirut","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Asia/Beirut is in Lebanon."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0d84efa1","guard":[["hasAny",["asiamanila","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Manila is in Philippines."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0ffb4062","guard":[["hasAny",["europevaduz","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Vaduz is in Liechtenstein."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-11db5f5e","guard":[["has","asiahongkong"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Hong ",{"slot":1},"."]},["sense.after",{"lit":"time"}],["sense.lastWord"]],"mem":null},
{"id":"n-127557c1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","indiankerguelen","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Indian/Kerguelen is in French Southern Territories."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-12faffe0","guard":[["hasAny",["item number","nth","pacificsaipan","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Pacific/Saipan is in Northern Mariana Islands."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-15d9f5f7","guard":[["hasAny",["americalowerprinces","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Lower_Princes is in Sint Maarten."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-194cf783","guard":[["hasAny",["indiancocos","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Indian/Cocos is in Cocos Islands."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1a573c0f","guard":[["hasAny",["asiashanghai","separate by","shortest","shortest one","shortest word","split","split by"]]],"pyramid":["render.str",["aggregate.shortest",["transform.split",{"lit":"China"},["sense.lastWord"]]]],"mem":null},
{"id":"n-1b8ae567","guard":[["hasAny",["americaatikokan","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone America/Atikokan is in Canada."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1bcfb0de","guard":[["hasAny",["europeoslo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Europe/Oslo is in Norway."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1bf52437","guard":[["hasAny",["africalome","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Lome is in Togo."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-2124a7d0","guard":[["hasAny",["africawindhoek","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Windhoek is in Namibia."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-2276e69d","guard":[["hasAny",["asiakarachi","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Karachi is in Pakistan."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-22b349c8","guard":[["hasAny",["americatoronto","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Toronto is in Canada."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-23330d94","guard":[["hasAny",["africabissau","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Bissau is in Guinea-Bissau."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-23a16806","guard":[["hasAny",["americastthomas","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/St_Thomas is in U.S. Virgin Islands."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2452ae23","guard":[["hasAny",["americamarigot","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Marigot is in Saint Martin."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-25bf21d8","guard":[["hasAny",["asiamakassar","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Makassar is in Indonesia."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-28779f9d","guard":[["has","americastbarthelemy"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Saint ",{"slot":1},"."]},["sense.after",{"lit":"time"}],["sense.lastWord"]],"mem":null},
{"id":"n-287ebcc2","guard":[["hasAny",["asiabangkok","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Bangkok is in Thailand."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-290ab1e6","guard":[["hasAny",["americaportofspain","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone America/Port_of_Spain is in Trinidad and Tobago."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2b2720ec","guard":[["hasAny",["asiakarachi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Karachi is in Pakistan."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2beabf96","guard":[["hasAny",["africawindhoek","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Windhoek is in Namibia."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-2f63a5ef","guard":[["hasAny",["asiairkutsk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Asia/Irkutsk is in Russia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-30239833","guard":[["hasAny",["africaluanda","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Luanda is in Angola."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-311692aa","guard":[["hasAny",["americadanmarkshavn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone America/Danmarkshavn is in Greenland."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3181fdfa","guard":[["hasAny",["americastthomas","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone America/St_Thomas is in U.S. Virgin Islands."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-31f97a4a","guard":[["hasAny",["asiaurumqi","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"China"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-33b4fb93","guard":[["hasAny",["americalowerprinces","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Lower_Princes is in Sint Maarten."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-34488f6b","guard":[["hasAny",["asiahebron","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Hebron is in Palestinian Territory."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-356fa93d","guard":[["hasAny",["europesanmarino","invert case","swap case","toggle case"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/San_Marino is in San Marino."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-3cd99d99","guard":[["hasAny",["americabogota","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone America/Bogota is in Colombia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3df23b93","guard":[["hasAny",["item number","nth","pacificrarotonga","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Pacific/Rarotonga is in Cook Islands."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3eb6a96e","guard":[["hasAny",["americaguayaquil","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone America/Guayaquil is in Ecuador."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3ed7510a","guard":[["hasAny",["asiaphnompenh","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Asia/Phnom_Penh is in Cambodia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3f433459","guard":[["hasAny",["europeljubljana","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Ljubljana is in Slovenia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3fd2d6f2","guard":[["hasAny",["asiairkutsk","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Russia"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-42848d32","guard":[["hasAny",["indianantananarivo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Indian/Antananarivo is in Madagascar."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4583f89e","guard":[["hasAny",["asiashanghai","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"China"},["sense.after",{"lit":"to"}]]],"mem":null},
{"id":"n-46ab9c91","guard":[["hasAny",["europeprague","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Prague is in Czechia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-477aedc7","guard":[["hasAny",["europekyiv","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Kyiv is in Ukraine."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4a02ab5c","guard":[["hasAny",["americamanaus","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone America/Manaus is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4a5ccec5","guard":[["hasAny",["europesofia","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Sofia is in Bulgaria."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4c393ee7","guard":[["hasAny",["asiakarachi","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Karachi is in Pakistan."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-4c4439b2","guard":[["hasAny",["americahalifax","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Halifax is in Canada."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4cf5f135","guard":[["hasAny",["africaasmara","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Asmara is in Eritrea."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-4d052d85","guard":[["hasAny",["item number","nth","pacificmidway","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Pacific/Midway is in United States Minor Outlying Islands."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4d98cd17","guard":[["hasAny",["asiavladivostok","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Vladivostok is in Russia."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-4e1e1886","guard":[["hasAny",["americalosangeles","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Los_Angeles is in United States."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-4f58dfe2","guard":[["hasAny",["americamanagua","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Managua is in Nicaragua."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-4f9d67f3","guard":[["hasAny",["africalome","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Lome is in Togo."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-504b5190","guard":[["hasAny",["indiankerguelen","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Indian/Kerguelen is in French Southern Territories."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-57416f88","guard":[["hasAny",["asiashanghai","longest","longest one","longest word","separate by","split","split by"]]],"pyramid":["render.str",["aggregate.longest",["transform.split",{"lit":"China"},["sense.lastWord"]]]],"mem":null},
{"id":"n-5a7ca988","guard":[["hasAny",["europechisinau","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Chisinau is in Moldova."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5b380e23","guard":[["hasAny",["delete","pacifichonolulu","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"United States"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-5b94d73c","guard":[["hasAny",["americalowerprinces","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Lower_Princes is in Sint Maarten."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-5c688691","guard":[["hasAny",["africatripoli","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Tripoli is in Libya."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5eca5bd0","guard":[["hasAny",["asiaamman","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Amman is in Jordan."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5f62f8bd","guard":[["hasAny",["asiaaden","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Asia/Aden is in Yemen."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-62a2e6c8","guard":[["hasAny",["asiamanila","capitalise","capitalize","capitalize each word","title case"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Manila is in Philippines."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-641ce6f0","guard":[["hasAny",["europestockholm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Europe/Stockholm is in Sweden."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6483846a","guard":[["hasAny",["americamarigot","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Marigot is in Saint Martin."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-64cb6eb7","guard":[["hasAny",["africabamako","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Africa/Bamako is in Mali."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-663ff832","guard":[["hasAny",["asiavientiane","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Vientiane is in Laos."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-684973ae","guard":[["hasAny",["africakigali","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Africa/Kigali is in Rwanda."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-68e9f9e9","guard":[["hasAny",["indiancocos","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Indian/Cocos is in Cocos Islands."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6d03d939","guard":[["hasAny",["item number","nth","pacifichonolulu","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Pacific/Honolulu is in United States."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6dc9a2a1","guard":[["hasAny",["asiaseoul","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Asia/Seoul is in South Korea."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6e19cf60","guard":[["hasAny",["asiachita","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Asia/Chita is in Russia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6f12aab9","guard":[["hasAny",["africawindhoek","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Windhoek is in Namibia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7053f629","guard":[["hasAny",["asiachita","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Chita is in Russia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-716e4d9e","guard":[["hasAny",["europeprague","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Europe/Prague is in Czechia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-73edd59a","guard":[["hasAny",["asiavientiane","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Asia/Vientiane is in Laos."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7400f52c","guard":[["hasAny",["africaabidjan","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Abidjan is in Ivory Coast."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-743da777","guard":[["hasAny",["asiasakhalin","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Sakhalin is in Russia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7596ba72","guard":[["hasAny",["africanairobi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Africa/Nairobi is in Kenya."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7a0c91c4","guard":[["hasAny",["africabissau","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Bissau is in Guinea-Bissau."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-7b5e058e","guard":[["hasAny",["europeriga","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Riga is in Latvia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7f7fb0cb","guard":[["hasAny",["americamarigot","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Marigot is in Saint Martin."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-815e49a5","guard":[["hasAny",["europeriga","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Europe/Riga is in Latvia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-81e894d2","guard":[["hasAny",["europekyiv","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Europe/Kyiv is in Ukraine."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8286d478","guard":[["hasAny",["americahalifax","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Halifax is in Canada."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-844f4215","guard":[["hasAny",["capitalise","capitalize","capitalize each word","europesanmarino","title case"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/San_Marino is in San Marino."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-86a485e8","guard":[["hasAny",["americavancouver","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Vancouver is in Canada."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8762a16e","guard":[["hasAny",["item number","nth","pacificfakaofo","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Pacific/Fakaofo is in Tokelau."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-87b74233","guard":[["hasAny",["americamanagua","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Managua is in Nicaragua."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-884c9457","guard":[["hasAny",["africaasmara","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Asmara is in Eritrea."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-8a074751","guard":[["hasAny",["asiariyadh","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Riyadh is in Saudi Arabia."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-8a59a0e6","guard":[["hasAny",["item number","nth","pacificgalapagos","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Pacific/Galapagos is in Ecuador."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-91c70e1d","guard":[["hasAny",["americapuntaarenas","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Punta_Arenas is in Chile."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-928befbb","guard":[["hasAny",["asiahebron","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Hebron is in Palestinian Territory."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-92c8013e","guard":[["hasAny",["asiashanghai","change to","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",{"lit":"China"},["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-93e700dc","guard":[["hasAny",["asiavladivostok","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Vladivostok is in Russia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-969c3432","guard":[["hasAny",["americanassau","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone America/Nassau is in Bahamas."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-96b23756","guard":[["hasAny",["africatripoli","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Africa/Tripoli is in Libya."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-97e477fd","guard":[["hasAny",["europebrussels","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Europe/Brussels is in Belgium."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9a2e7dfc","guard":[["hasAny",["asiakamchatka","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Kamchatka is in Russia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9a94e952","guard":[["hasAny",["americatoronto","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone America/Toronto is in Canada."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9f4171c6","guard":[["hasAny",["asiasakhalin","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Asia/Sakhalin is in Russia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9f4bfa57","guard":[["hasAny",["item number","nth","pacificefate","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Pacific/Efate is in Vanuatu."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a2b1ae98","guard":[["hasAny",["africakampala","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Kampala is in Uganda."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-a3151368","guard":[["hasAny",["indianantananarivo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Indian/Antananarivo is in Madagascar."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a46c83d2","guard":[["hasAny",["asiavladivostok","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Vladivostok is in Russia."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-a5fe65fc","guard":[["hasAny",["africalubumbashi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Lubumbashi is in Democratic Republic of the Congo."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a7a2445a","guard":[["hasAny",["americalosangeles","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Los_Angeles is in United States."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-a95b7475","guard":[["hasAny",["asiamanila","invert case","swap case","toggle case"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Manila is in Philippines."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-a9b20b0a","guard":[["hasAny",["delete","pacifichonolulu","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"United States"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-aad1eb18","guard":[["hasAny",["americawinnipeg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone America/Winnipeg is in Canada."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-acb63480","guard":[["hasAny",["capitalise","capitalize","capitalize each word","europechisinau","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Chisinau is in Moldova."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-ad96ced7","guard":[["hasAny",["europeljubljana","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Europe/Ljubljana is in Slovenia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-adc0601d","guard":[["hasAny",["asiajerusalem","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Asia/Jerusalem is in Israel."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-afcf567f","guard":[["hasAny",["atlanticstanley","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Atlantic/Stanley is in Falkland Islands."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b095680e","guard":[["hasAny",["asiamakassar","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Makassar is in Indonesia."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-b1b1e65b","guard":[["hasAny",["asiadhaka","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Dhaka is in Bangladesh."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b26de395","guard":[["hasAny",["asiabangkok","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Bangkok is in Thailand."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-b2bd669d","guard":[["hasAny",["americamanagua","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Managua is in Nicaragua."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-b565c95e","guard":[["hasAny",["asianicosia","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Asia/Nicosia is in Cyprus."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b5e7d4dc","guard":[["hasAny",["americapuntaarenas","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone America/Punta_Arenas is in Chile."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b6eab7d7","guard":[["hasAny",["africaasmara","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Asmara is in Eritrea."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b720f7ee","guard":[["hasAny",["indianmahe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Indian/Mahe is in Seychelles."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b9805720","guard":[["hasAny",["europesanmarino","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/San_Marino is in San Marino."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b9dce3a6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","europevaduz","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Vaduz is in Liechtenstein."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-ba022fc5","guard":[["hasAny",["europevaduz","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Vaduz is in Liechtenstein."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-bb2d8db2","guard":[["hasAny",["indiankerguelen","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Indian/Kerguelen is in French Southern Territories."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-bbc936a5","guard":[["hasAny",["asiashanghai","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Shanghai is in China."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-bcd41ba9","guard":[["hasAny",["europechisinau","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Chisinau is in Moldova."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-bee32ea1","guard":[["hasAny",["africaluanda","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Luanda is in Angola."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-bf0526d4","guard":[["hasAny",["americalosangeles","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Los_Angeles is in United States."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c02fe1c4","guard":[["hasAny",["asiashanghai","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Shanghai is in China."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-c0879e0c","guard":[["hasAny",["africaluanda","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Luanda is in Angola."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-c21d1a82","guard":[["hasAny",["item number","nth","pacificsaipan","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Pacific/Saipan is in Northern Mariana Islands."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c420dae8","guard":[["hasAny",["asiairkutsk","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"russia"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-c57acc79","guard":[["hasAny",["africalubumbashi","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Lubumbashi is in Democratic Republic of the Congo."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-c58649cc","guard":[["hasAny",["americaadak","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Adak is in United States."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-d03a6706","guard":[["hasAny",["asiaurumqi","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"China"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-d162f949","guard":[["hasAny",["europestockholm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Stockholm is in Sweden."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d1ea6d7a","guard":[["hasAny",["asiahebron","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Hebron is in Palestinian Territory."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d1ece969","guard":[["hasAny",["africaharare","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Africa/Harare is in Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d26ec3f6","guard":[["hasAny",["americavancouver","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Vancouver is in Canada."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-d2bb151b","guard":[["hasAny",["item number","nth","pacificgalapagos","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Pacific/Galapagos is in Ecuador."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d55a0643","guard":[["hasAny",["africaabidjan","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Africa/Abidjan is in Ivory Coast."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d5c747e0","guard":[["hasAny",["africakampala","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Kampala is in Uganda."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d63b92cf","guard":[["hasAny",["asiahochiminh","invert case","swap case","toggle case"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Ho_Chi_Minh is in Vietnam."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-d6b6f258","guard":[["hasAny",["asiaamman","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Asia/Amman is in Jordan."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d7dd9579","guard":[["hasAny",["asiaurumqi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Urumqi is in China."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d8362c68","guard":[["hasAny",["asiamakassar","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Makassar is in Indonesia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d9f5d549","guard":[["hasAny",["asiabangkok","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Bangkok is in Thailand."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-da5761c5","guard":[["hasAny",["americavancouver","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Vancouver is in Canada."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-db4de598","guard":[["hasAny",["africakampala","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Kampala is in Uganda."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-dc082bc8","guard":[["hasAny",["asiakamchatka","capitalise","capitalize","capitalize each word","title case"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Kamchatka is in Russia."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-dea2396c","guard":[["hasAny",["indianmahe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Indian/Mahe is in Seychelles."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dec72014","guard":[["hasAny",["europesofia","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Europe/Sofia is in Bulgaria."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e2b8d34d","guard":[["hasAny",["americahalifax","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Halifax is in Canada."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-e410fd8f","guard":[["has","americacostarica"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," is in Costa ",{"slot":1},"."]},["sense.after",{"lit":"time"}],["sense.lastWord"]],"mem":null},
{"id":"n-ec29113a","guard":[["hasAny",["africalubumbashi","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Lubumbashi is in Democratic Republic of the Congo."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-ecc2da02","guard":[["hasAny",["asiahochiminh","capitalise","capitalize","capitalize each word","title case"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Ho_Chi_Minh is in Vietnam."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-ee0b5f25","guard":[["hasAny",["asiadhaka","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Asia/Dhaka is in Bangladesh."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f0385b21","guard":[["hasAny",["africabissau","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Bissau is in Guinea-Bissau."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-f05b540f","guard":[["hasAny",["asiahochiminh","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Ho_Chi_Minh is in Vietnam."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f171b39c","guard":[["hasAny",["americatoronto","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"canada"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-f250016b","guard":[["hasAny",["americadanmarkshavn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Danmarkshavn is in Greenland."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f2b3acf8","guard":[["hasAny",["asiaurumqi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Asia/Urumqi is in China."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f312ca3d","guard":[["hasAny",["asiariyadh","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Riyadh is in Saudi Arabia."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-f5a2f900","guard":[["hasAny",["africalome","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Lome is in Togo."]},["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-f9f66643","guard":[["hasAny",["asiashanghai","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Shanghai is in China."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-fc122719","guard":[["hasAny",["africalagos","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Africa/Lagos is in Nigeria."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fc573b3e","guard":[["hasAny",["item number","nth","pacificchatham","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Pacific/Chatham is in New Zealand."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fc5b1243","guard":[["hasAny",["europebrussels","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Brussels is in Belgium."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fceba435","guard":[["hasAny",["asiakamchatka","invert case","swap case","toggle case"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Kamchatka is in Russia."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-04a0ec5a","guard":[["hasAny",["each word","europevaduz","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Vaduz is in Liechtenstein."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-11a845ad","guard":[["hasAny",["asiamanila","each word","split into words"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Manila is in Philippines."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-1256eeca","guard":[["hasAny",["africaluanda","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Luanda is in Angola."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-15e035f6","guard":[["hasAny",["africakampala","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Kampala is in Uganda."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-2094beac","guard":[["hasAny",["asiakamchatka","each word","split into words"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Kamchatka is in Russia."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-20cb39f4","guard":[["hasAny",["americalosangeles","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Los_Angeles is in United States."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-22ab1a9a","guard":[["hasAny",["americalosangeles","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Los_Angeles is in United States."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-253ecb80","guard":[["hasAny",["asiahebron","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Hebron is in Palestinian Territory."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-2a8c1fe7","guard":[["hasAny",["africawindhoek","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Windhoek is in Namibia."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-2c73e7bb","guard":[["hasAny",["each word","europesanmarino","split into words"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/San_Marino is in San Marino."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-31aa30c6","guard":[["hasAny",["africalubumbashi","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Lubumbashi is in Democratic Republic of the Congo."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-3c7aacf3","guard":[["hasAny",["americastbarthelemy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone America/St_Barthelemy is in Saint ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-42d368b7","guard":[["hasAny",["americamanagua","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Managua is in Nicaragua."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-43c1e4e5","guard":[["hasAny",["africabissau","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Bissau is in Guinea-Bissau."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-47f6c617","guard":[["hasAny",["asiamakassar","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Makassar is in Indonesia."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-4cd6e00b","guard":[["hasAny",["africalome","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Lome is in Togo."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-4fc877e0","guard":[["hasAny",["americamarigot","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Marigot is in Saint Martin."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-50eaeb50","guard":[["hasAny",["each word","indiankerguelen","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Indian/Kerguelen is in French Southern Territories."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-572186f5","guard":[["hasAny",["americamarigot","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Marigot is in Saint Martin."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-58d9795c","guard":[["hasAny",["asiavladivostok","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Vladivostok is in Russia."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-5bfa6540","guard":[["hasAny",["asiabangkok","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Bangkok is in Thailand."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-61494015","guard":[["hasAny",["africaasmara","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Asmara is in Eritrea."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-691bb820","guard":[["hasAny",["americacostarica","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone America/Costa_Rica is in Costa ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-6db67cc3","guard":[["hasAny",["americaadak","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Adak is in United States."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-6e828536","guard":[["hasAny",["asiakarachi","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Karachi is in Pakistan."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-7b47320b","guard":[["hasAny",["each word","indiankerguelen","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Indian/Kerguelen is in French Southern Territories."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-7d8018e2","guard":[["hasAny",["africaasmara","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Asmara is in Eritrea."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-812992ba","guard":[["hasAny",["africabissau","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Bissau is in Guinea-Bissau."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-8a98aa40","guard":[["hasAny",["asiakarachi","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Karachi is in Pakistan."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-8be96010","guard":[["hasAny",["africalome","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Lome is in Togo."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-935b9cdc","guard":[["hasAny",["americahalifax","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Halifax is in Canada."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-97afaccc","guard":[["hasAny",["americavancouver","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Vancouver is in Canada."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-99718fb7","guard":[["hasAny",["africakampala","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Kampala is in Uganda."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-9b756651","guard":[["hasAny",["asiamanila","each word","split into words"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Manila is in Philippines."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-9b8768a1","guard":[["hasAny",["asiariyadh","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Riyadh is in Saudi Arabia."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-9c54d35c","guard":[["hasAny",["each word","europechisinau","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Chisinau is in Moldova."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-9cab645b","guard":[["hasAny",["asiahongkong","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," zone Asia/Hong_Kong is in Hong ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-9eb10204","guard":[["hasAny",["africawindhoek","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Windhoek is in Namibia."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-a186be27","guard":[["hasAny",["americalowerprinces","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Lower_Princes is in Sint Maarten."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-a33ddecb","guard":[["hasAny",["asiamakassar","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Makassar is in Indonesia."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-a3c34591","guard":[["hasAny",["asiahochiminh","each word","split into words"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Ho_Chi_Minh is in Vietnam."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-b033e42a","guard":[["hasAny",["americamanagua","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Managua is in Nicaragua."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-b38bc57b","guard":[["hasAny",["asiavladivostok","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Vladivostok is in Russia."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-bb97820f","guard":[["hasAny",["asiariyadh","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Riyadh is in Saudi Arabia."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-c73bc0cb","guard":[["hasAny",["asiahebron","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Hebron is in Palestinian Territory."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-c8059328","guard":[["hasAny",["africalubumbashi","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Lubumbashi is in Democratic Republic of the Congo."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-ce030958","guard":[["hasAny",["each word","europesanmarino","split into words"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/San_Marino is in San Marino."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-d080f420","guard":[["hasAny",["asiahochiminh","each word","split into words"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Ho_Chi_Minh is in Vietnam."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-da2c7fd0","guard":[["hasAny",["africaluanda","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Africa/Luanda is in Angola."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-decd2e5b","guard":[["hasAny",["asiabangkok","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Bangkok is in Thailand."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-e0b9b8ab","guard":[["hasAny",["americahalifax","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Halifax is in Canada."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-e0e07759","guard":[["hasAny",["each word","europechisinau","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Chisinau is in Moldova."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-e152741b","guard":[["hasAny",["each word","europevaduz","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Europe/Vaduz is in Liechtenstein."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-e8a984a3","guard":[["hasAny",["asiashanghai","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Shanghai is in China."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-ebcfdefb","guard":[["hasAny",["americalowerprinces","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Lower_Princes is in Sint Maarten."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-f01a34a0","guard":[["hasAny",["asiakamchatka","each word","split into words"]],["has","iana"]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Kamchatka is in Russia."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-f211f480","guard":[["hasAny",["americavancouver","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Vancouver is in Canada."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-f3282361","guard":[["hasAny",["americaadak","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," America/Adak is in United States."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-ff961d4b","guard":[["hasAny",["asiashanghai","each word","split into words"]]],"pyramid":["render.template",{"lit":["The time ",{"slot":0}," Asia/Shanghai is in China."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-07b98d3d","guard":[["hasAny",["africaharare","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-0ed50bbf","guard":[["hasAny",["americatoronto","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," America/Toronto is in Canada."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1eae9b9a","guard":[["hasAny",["element","item number","nth","pacificchatham","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in New Zealand."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-1fdcf0f6","guard":[["hasAny",["asiahongkong","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hong Kong."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-208976a8","guard":[["hasAny",["africanairobi","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kenya."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-21b57b27","guard":[["hasAny",["americacostarica","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Costa Rica."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-27d3896c","guard":[["hasAny",["asiavientiane","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Vientiane is in Laos."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-302c35a8","guard":[["hasAny",["asiaaden","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Yemen."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-3161a2da","guard":[["hasAny",["africaabidjan","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Africa/Abidjan is in Ivory Coast."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-347e186d","guard":[["hasAny",["asianicosia","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cyprus."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-36b78089","guard":[["hasAny",["asiaseoul","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in South Korea."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-37e01793","guard":[["hasAny",["asiairkutsk","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Russia."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-3eee9865","guard":[["hasAny",["africabamako","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mali."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-403f915c","guard":[["hasAny",["asiaurumqi","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Urumqi is in China."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4721c7f1","guard":[["hasAny",["item number","nth","pacificgalapagos","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Pacific/Galapagos is in Ecuador."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4a3e5c84","guard":[["hasAny",["americanassau","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bahamas."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-4c18985d","guard":[["hasAny",["americamanaus","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-55a0a7d1","guard":[["hasAny",["asiachita","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Chita is in Russia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5adbfe28","guard":[["hasAny",["americadanmarkshavn","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," America/Danmarkshavn is in Greenland."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5c4526bd","guard":[["hasAny",["indianmahe","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Indian/Mahe is in Seychelles."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-62bbfc41","guard":[["hasAny",["europekyiv","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Kyiv is in Ukraine."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-651742c1","guard":[["hasAny",["asiasakhalin","item number","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Sakhalin is in Russia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-66dc78ac","guard":[["hasAny",["europeriga","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Riga is in Latvia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6b5d7a48","guard":[["hasAny",["asiaphnompenh","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cambodia."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-6e7e14df","guard":[["hasAny",["element","item number","nth","pacificmidway","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in United States Minor Outlying Islands."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-71181eee","guard":[["hasAny",["americaportofspain","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Trinidad and Tobago."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-72cd4c60","guard":[["hasAny",["element","item number","nth","pacifichonolulu","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-73bf2950","guard":[["hasAny",["europeljubljana","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Ljubljana is in Slovenia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-74c9446a","guard":[["hasAny",["element","item number","nth","pacificrarotonga","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cook Islands."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-8874d60e","guard":[["hasAny",["americaguayaquil","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," America/Guayaquil is in Ecuador."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8defdb91","guard":[["hasAny",["asiaamman","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Amman is in Jordan."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8ecffc85","guard":[["hasAny",["europestockholm","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Stockholm is in Sweden."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-91c3f985","guard":[["hasAny",["europebrussels","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Brussels is in Belgium."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-91f03c92","guard":[["hasAny",["americastthomas","item number","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," America/St_Thomas is in U.S. Virgin Islands."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-93136617","guard":[["hasAny",["item number","nth","pacificsaipan","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Pacific/Saipan is in Northern Mariana Islands."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-988ad87d","guard":[["hasAny",["atlanticstanley","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Falkland Islands."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-989c9b54","guard":[["hasAny",["item number","nth","pacificefate","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Pacific/Efate is in Vanuatu."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-99f6542c","guard":[["hasAny",["element","europebelgrade","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Serbia."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-9a4bc04c","guard":[["hasAny",["element","europeoslo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Norway."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-9a85845b","guard":[["hasAny",["africakigali","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Rwanda."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-9b7807fb","guard":[["hasAny",["europesofia","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Sofia is in Bulgaria."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a1e3e273","guard":[["hasAny",["asiadhaka","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Dhaka is in Bangladesh."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b1f6aab9","guard":[["hasAny",["americabogota","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Colombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-b4d08564","guard":[["hasAny",["africatripoli","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Africa/Tripoli is in Libya."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c07e55a4","guard":[["hasAny",["indiancocos","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Indian/Cocos is in Cocos Islands."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c9175ac0","guard":[["hasAny",["africalagos","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nigeria."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-cef083a4","guard":[["hasAny",["element","item number","nth","pacificfakaofo","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Tokelau."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-d1620e76","guard":[["hasAny",["asiabeirut","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Lebanon."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-db560f69","guard":[["hasAny",["indianantananarivo","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Indian/Antananarivo is in Madagascar."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dc61c823","guard":[["hasAny",["americastbarthelemy","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Saint Barthelemy."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-dec7b5c6","guard":[["hasAny",["asiajerusalem","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Israel."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}]],"mem":null},
{"id":"n-f3faccb8","guard":[["hasAny",["americapuntaarenas","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," America/Punta_Arenas is in Chile."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f969d7c5","guard":[["hasAny",["europeprague","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Prague is in Czechia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0257450d","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","pacifichonolulu","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-06efde90","guard":[["hasAny",["africaabidjan","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Africa/Abidjan is in Ivory Coast."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-099c395f","guard":[["hasAny",["asiachita","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Chita is in Russia."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0a251ded","guard":[["hasAny",["europestockholm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Stockholm is in Sweden."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0c4eddfe","guard":[["hasAny",["asiaphnompenh","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cambodia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-0e13a689","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","pacificfakaofo","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Tokelau."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-0fe33927","guard":[["hasAny",["item number","nth","pacificsaipan","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Pacific/Saipan is in Northern Mariana Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-123941c7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","europeoslo","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Norway."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-129a06ce","guard":[["hasAny",["asiairkutsk","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Russia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-12ca6b0c","guard":[["hasAny",["asiajerusalem","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Israel."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-14eb365f","guard":[["hasAny",["asiachita","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Chita is in Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1e1c37bc","guard":[["hasAny",["europeljubljana","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Ljubljana is in Slovenia."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2041e26f","guard":[["hasAny",["element","europebelgrade","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Serbia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-233e9966","guard":[["hasAny",["americapuntaarenas","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," America/Punta_Arenas is in Chile."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-234acae1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","pacifichonolulu","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-23e52f3e","guard":[["hasAny",["americacostarica","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Costa ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["sense.lastWord"]],"mem":null},
{"id":"n-26fa7aec","guard":[["hasAny",["atlanticstanley","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Falkland Islands."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-2b2cfa3d","guard":[["hasAny",["asiaamman","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Amman is in Jordan."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2b507310","guard":[["hasAny",["asianicosia","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cyprus."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-2bb81399","guard":[["hasAny",["all caps","asiairkutsk","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Russia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-2d0e6265","guard":[["hasAny",["africabamako","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mali."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-2d44480a","guard":[["hasAny",["americastbarthelemy","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Saint ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["sense.lastWord"]],"mem":null},
{"id":"n-2d8a066e","guard":[["hasAny",["americaportofspain","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Trinidad and Tobago."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-305165b6","guard":[["hasAny",["asiabeirut","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Lebanon."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-314336fb","guard":[["hasAny",["europeriga","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Riga is in Latvia."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-31807b22","guard":[["hasAny",["element","invert case","item number","nth","pacificfakaofo","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Tokelau."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-357e73c5","guard":[["hasAny",["all caps","atlanticstanley","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Falkland Islands."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-38518b36","guard":[["hasAny",["all caps","asiaseoul","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in South Korea."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-387cc116","guard":[["hasAny",["africakigali","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Rwanda."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-3a3eb271","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","pacificmidway","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in United States Minor Outlying Islands."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-3a56de79","guard":[["hasAny",["americastthomas","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," America/St_Thomas is in U.S. Virgin Islands."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3c8e064c","guard":[["hasAny",["asiasakhalin","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Sakhalin is in Russia."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3d7fccde","guard":[["hasAny",["all caps","americaportofspain","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Trinidad and Tobago."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-403eaca5","guard":[["hasAny",["europekyiv","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Kyiv is in Ukraine."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-416d5c75","guard":[["hasAny",["atlanticstanley","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Falkland Islands."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-4629eb08","guard":[["hasAny",["asiaurumqi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Urumqi is in China."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4b969157","guard":[["hasAny",["asiabeirut","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Lebanon."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-4f9222f3","guard":[["hasAny",["americabogota","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Colombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-50323b02","guard":[["hasAny",["asiaphnompenh","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cambodia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-5675c3e9","guard":[["hasAny",["asianicosia","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cyprus."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-576a1501","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","pacificchatham","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in New Zealand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-5986c6ed","guard":[["hasAny",["asiavientiane","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Vientiane is in Laos."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5b8e2bec","guard":[["hasAny",["africanairobi","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kenya."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-5c0baef4","guard":[["hasAny",["item number","nth","pacificefate","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Pacific/Efate is in Vanuatu."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5d134603","guard":[["hasAny",["europeljubljana","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Ljubljana is in Slovenia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5fc592f5","guard":[["hasAny",["americanassau","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bahamas."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-62c0d493","guard":[["hasAny",["asiasakhalin","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Sakhalin is in Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-631b128a","guard":[["hasAny",["indiancocos","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Indian/Cocos is in Cocos Islands."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-649bff29","guard":[["hasAny",["asiaamman","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Amman is in Jordan."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-651fa489","guard":[["hasAny",["all caps","asiaphnompenh","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cambodia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-662a17a1","guard":[["hasAny",["atlanticstanley","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Falkland Islands."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-6663e8ef","guard":[["hasAny",["asiajerusalem","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Israel."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-6682004d","guard":[["hasAny",["americadanmarkshavn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," America/Danmarkshavn is in Greenland."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-675d75af","guard":[["hasAny",["africaharare","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-69986195","guard":[["hasAny",["africaharare","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-6a44ca57","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","pacificrarotonga","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cook Islands."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-6aabecb3","guard":[["hasAny",["americatoronto","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," America/Toronto is in Canada."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6ec3a8d4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","europebelgrade","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Serbia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-6f197193","guard":[["hasAny",["americadanmarkshavn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," America/Danmarkshavn is in Greenland."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6fd1336d","guard":[["hasAny",["americanassau","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bahamas."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-71e7f3a3","guard":[["hasAny",["europeprague","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Prague is in Czechia."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7249c6ad","guard":[["hasAny",["americastthomas","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," America/St_Thomas is in U.S. Virgin Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-754bf7d5","guard":[["hasAny",["americamanaus","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-7564aa26","guard":[["hasAny",["all caps","asiajerusalem","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Israel."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-75fc9dcd","guard":[["hasAny",["americapuntaarenas","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," America/Punta_Arenas is in Chile."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-77f45a21","guard":[["hasAny",["asiaaden","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Yemen."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-790d5931","guard":[["hasAny",["africakigali","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Rwanda."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-7a221911","guard":[["hasAny",["asiaseoul","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in South Korea."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-816a54f1","guard":[["hasAny",["africanairobi","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kenya."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-8221476d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","pacificchatham","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in New Zealand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-844eb086","guard":[["hasAny",["africabamako","all caps","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mali."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-8706ca59","guard":[["hasAny",["all caps","americamanaus","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-88645bb7","guard":[["hasAny",["europeprague","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Prague is in Czechia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-88a24d6b","guard":[["hasAny",["indiancocos","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Indian/Cocos is in Cocos Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-88b68d68","guard":[["hasAny",["americabogota","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Colombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-8a67d28d","guard":[["hasAny",["element","item number","lower case","lowercase","nth","pacificrarotonga","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cook Islands."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-8b1951b5","guard":[["hasAny",["americabogota","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Colombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-8b236291","guard":[["hasAny",["americaportofspain","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Trinidad and Tobago."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-8d8a6b84","guard":[["hasAny",["asiaseoul","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in South Korea."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-91dccd65","guard":[["hasAny",["item number","nth","pacificgalapagos","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Pacific/Galapagos is in Ecuador."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-938f4bed","guard":[["hasAny",["americamanaus","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-974299d0","guard":[["hasAny",["asiadhaka","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Dhaka is in Bangladesh."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9a98a998","guard":[["hasAny",["asiadhaka","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Dhaka is in Bangladesh."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9aa303d6","guard":[["hasAny",["asiaaden","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Yemen."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-9b5adba1","guard":[["hasAny",["africatripoli","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Africa/Tripoli is in Libya."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9bb2951e","guard":[["hasAny",["asiahongkong","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hong ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["sense.lastWord"]],"mem":null},
{"id":"n-9c885adc","guard":[["hasAny",["asianicosia","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cyprus."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-a197291c","guard":[["hasAny",["asiabeirut","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Lebanon."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-a68b07a0","guard":[["hasAny",["europestockholm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Stockholm is in Sweden."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a6d74dd4","guard":[["hasAny",["element","europeoslo","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Norway."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-a71f6b94","guard":[["hasAny",["asiairkutsk","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Russia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-a7622a0c","guard":[["hasAny",["africalagos","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nigeria."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-a79726e6","guard":[["hasAny",["element","europeoslo","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Norway."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-a802c55f","guard":[["hasAny",["asiaseoul","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in South Korea."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-aaafa527","guard":[["hasAny",["indianantananarivo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Indian/Antananarivo is in Madagascar."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ab35ab87","guard":[["hasAny",["americatoronto","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," America/Toronto is in Canada."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ac51bb53","guard":[["hasAny",["africakigali","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Rwanda."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-acb78f55","guard":[["hasAny",["asiaphnompenh","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cambodia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-ae492c91","guard":[["hasAny",["europebrussels","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Brussels is in Belgium."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-af401f50","guard":[["hasAny",["element","item number","lower case","lowercase","nth","pacifichonolulu","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-b14e7846","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","pacificfakaofo","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Tokelau."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-b208df95","guard":[["hasAny",["item number","nth","pacificgalapagos","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Pacific/Galapagos is in Ecuador."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b43f0de1","guard":[["hasAny",["africaabidjan","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Africa/Abidjan is in Ivory Coast."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b8498008","guard":[["hasAny",["all caps","americabogota","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Colombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-b8655126","guard":[["hasAny",["europeriga","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Riga is in Latvia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b9b733eb","guard":[["hasAny",["europekyiv","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Kyiv is in Ukraine."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b9e34698","guard":[["hasAny",["all caps","americanassau","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bahamas."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-bcec99b4","guard":[["hasAny",["asiaurumqi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Urumqi is in China."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bed7b450","guard":[["hasAny",["all caps","capital letters","capitals","element","europeoslo","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Norway."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-c0756dd7","guard":[["hasAny",["americaportofspain","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Trinidad and Tobago."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-c0c329a8","guard":[["hasAny",["africaharare","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-c3640181","guard":[["hasAny",["africalagos","all caps","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nigeria."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-c438ebc7","guard":[["hasAny",["indianmahe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Indian/Mahe is in Seychelles."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c50b84fb","guard":[["hasAny",["item number","nth","pacificsaipan","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Pacific/Saipan is in Northern Mariana Islands."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c55ef596","guard":[["hasAny",["all caps","asiaaden","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Yemen."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-c75ad0d6","guard":[["hasAny",["africanairobi","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kenya."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-c8e5d3f4","guard":[["hasAny",["element","invert case","item number","nth","pacifichonolulu","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in United States."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-c925108f","guard":[["hasAny",["africatripoli","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Africa/Tripoli is in Libya."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-cca57168","guard":[["hasAny",["americamanaus","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Brazil."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-ce2a145b","guard":[["hasAny",["europebrussels","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Brussels is in Belgium."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-cffec01a","guard":[["hasAny",["all caps","capital letters","capitals","element","europebelgrade","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Serbia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-d24dab31","guard":[["hasAny",["indianmahe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Indian/Mahe is in Seychelles."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d2be1685","guard":[["hasAny",["element","invert case","item number","nth","pacificrarotonga","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cook Islands."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-d2c1a180","guard":[["hasAny",["asiairkutsk","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Russia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-d53b1928","guard":[["hasAny",["africalagos","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nigeria."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-d8219285","guard":[["hasAny",["europesofia","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Sofia is in Bulgaria."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-db0894b7","guard":[["hasAny",["item number","nth","pacificefate","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Pacific/Efate is in Vanuatu."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dcd6c12a","guard":[["hasAny",["americanassau","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bahamas."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-dd549ab3","guard":[["hasAny",["africakigali","all caps","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Rwanda."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-dde7ca84","guard":[["hasAny",["africabamako","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mali."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-ddf67267","guard":[["hasAny",["element","invert case","item number","nth","pacificchatham","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in New Zealand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-df99d50f","guard":[["hasAny",["asiaaden","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Yemen."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-dfc3e875","guard":[["hasAny",["americaguayaquil","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," America/Guayaquil is in Ecuador."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e308e73c","guard":[["hasAny",["europesofia","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Europe/Sofia is in Bulgaria."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e7045018","guard":[["hasAny",["asiavientiane","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Asia/Vientiane is in Laos."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e7b0fe1b","guard":[["hasAny",["africalagos","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nigeria."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-e93ec4ef","guard":[["hasAny",["all caps","asiabeirut","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Lebanon."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-e9586ddd","guard":[["hasAny",["asiajerusalem","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Israel."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-ea23610d","guard":[["hasAny",["element","item number","lower case","lowercase","nth","pacificmidway","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in United States Minor Outlying Islands."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-ed56974c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","pacificmidway","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in United States Minor Outlying Islands."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-f0f28282","guard":[["hasAny",["element","invert case","item number","nth","pacificmidway","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in United States Minor Outlying Islands."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-f2d6babe","guard":[["hasAny",["indianantananarivo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," Indian/Antananarivo is in Madagascar."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f48f9fa0","guard":[["hasAny",["element","item number","lower case","lowercase","nth","pacificfakaofo","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Tokelau."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-f4dc015d","guard":[["hasAny",["element","europebelgrade","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Serbia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-f576a350","guard":[["hasAny",["all caps","asianicosia","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cyprus."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-f76af3b8","guard":[["hasAny",["americaguayaquil","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," America/Guayaquil is in Ecuador."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f79a67f2","guard":[["hasAny",["africaharare","all caps","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-facdbda2","guard":[["hasAny",["element","item number","lower case","lowercase","nth","pacificchatham","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in New Zealand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-fc7d61cd","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","pacificrarotonga","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cook Islands."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-ff5206c6","guard":[["hasAny",["africanairobi","all caps","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kenya."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-ffb9fea7","guard":[["hasAny",["africabamako","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mali."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]]],"mem":null},
{"id":"n-14b92895","guard":[["hasAny",["all caps","americacostarica","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Costa ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]],["sense.lastWord"]],"mem":null},
{"id":"n-28fb399a","guard":[["hasAny",["americastbarthelemy","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Saint ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3f464eec","guard":[["hasAny",["asiahongkong","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hong ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3fe97a98","guard":[["hasAny",["all caps","asiahongkong","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hong ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]],["sense.lastWord"]],"mem":null},
{"id":"n-4193f479","guard":[["hasAny",["americacostarica","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Costa ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-45928b4d","guard":[["hasAny",["asiahongkong","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hong ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4854acef","guard":[["hasAny",["all caps","americacostarica","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Costa ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-4c79c5c9","guard":[["hasAny",["americacostarica","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Costa ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5249fbae","guard":[["hasAny",["asiahongkong","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hong ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]],["sense.lastWord"]],"mem":null},
{"id":"n-5b2195c4","guard":[["hasAny",["americacostarica","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Costa ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]],["sense.lastWord"]],"mem":null},
{"id":"n-5befc126","guard":[["hasAny",["americastbarthelemy","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Saint ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]],["sense.lastWord"]],"mem":null},
{"id":"n-604688fa","guard":[["hasAny",["all caps","americastbarthelemy","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Saint ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.after",{"lit":"time"}]],["sense.lastWord"]],"mem":null},
{"id":"n-613173b6","guard":[["hasAny",["asiahongkong","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hong ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]],["sense.lastWord"]],"mem":null},
{"id":"n-6f8a0f0b","guard":[["hasAny",["asiahongkong","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hong ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-73b2ec1e","guard":[["hasAny",["all caps","americastbarthelemy","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Saint ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-74d30ad6","guard":[["hasAny",["americacostarica","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Costa ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-82d8cd06","guard":[["hasAny",["americastbarthelemy","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Saint ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-83d936a3","guard":[["hasAny",["americastbarthelemy","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Saint ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]],["sense.lastWord"]],"mem":null},
{"id":"n-99ebaa1d","guard":[["hasAny",["americastbarthelemy","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Saint ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]],["sense.lastWord"]],"mem":null},
{"id":"n-bfaa60bb","guard":[["hasAny",["all caps","asiahongkong","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hong ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-c6e57c51","guard":[["hasAny",["americacostarica","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Costa ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"time"}]],["sense.lastWord"]],"mem":null},
{"id":"n-db363024","guard":[["hasAny",["asiahongkong","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hong ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"time"}]],["sense.lastWord"]],"mem":null},
{"id":"n-ddfa1d4d","guard":[["hasAny",["americacostarica","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Costa ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"time"}]],["sense.lastWord"]],"mem":null},
{"id":"n-fac770db","guard":[["hasAny",["americastbarthelemy","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Saint ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2009eca6","guard":[["hasAny",["asiahongkong","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hong ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2ceb287f","guard":[["hasAny",["asiahongkong","element","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hong ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-2f32e300","guard":[["hasAny",["americastbarthelemy","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Saint ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-52bdeeca","guard":[["hasAny",["asiahongkong","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hong ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-54c968ad","guard":[["hasAny",["americacostarica","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Costa ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8289e8db","guard":[["hasAny",["americacostarica","element","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Costa ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-a1879e64","guard":[["hasAny",["americastbarthelemy","element","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Saint ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d9d7fc9a","guard":[["hasAny",["americastbarthelemy","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Saint ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e803e229","guard":[["hasAny",["americacostarica","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Costa ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"time"}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which country is the time zone Indian/Antananarivo in","expect":{"contains":["Madagascar"],"notRefusal":true}},{"q":"which country is the time zone Europe/Kyiv in","expect":{"contains":["Ukraine"],"notRefusal":true}},{"q":"name the country of the time zone Africa/Harare","expect":{"contains":["Zimbabwe"],"notRefusal":true}},{"q":"the IANA zone Europe/Chisinau belongs to which country","expect":{"contains":["Moldova"],"notRefusal":true}},{"q":"the IANA zone Asia/Kamchatka belongs to which country","expect":{"contains":["Russia"],"notRefusal":true}},{"q":"name the country of the time zone Asia/Beirut","expect":{"contains":["Lebanon"],"notRefusal":true}},{"q":"the IANA zone America/Managua belongs to which country","expect":{"contains":["Nicaragua"],"notRefusal":true}},{"q":"name the country of the time zone Asia/Seoul","expect":{"contains":["South Korea"],"notRefusal":true}},{"q":"the IANA zone Asia/Riyadh belongs to which country","expect":{"contains":["Saudi Arabia"],"notRefusal":true}},{"q":"name the country of the time zone Pacific/Chatham","expect":{"contains":["New Zealand"],"notRefusal":true}},{"q":"which country is the time zone Asia/Dhaka in","expect":{"contains":["Bangladesh"],"notRefusal":true}},{"q":"which country is the time zone Indian/Mahe in","expect":{"contains":["Seychelles"],"notRefusal":true}},{"q":"which country is the time zone Europe/Brussels in","expect":{"contains":["Belgium"],"notRefusal":true}},{"q":"which country is the time zone Africa/Tripoli in","expect":{"contains":["Libya"],"notRefusal":true}},{"q":"which country is the time zone Asia/Amman in","expect":{"contains":["Jordan"],"notRefusal":true}},{"q":"the IANA zone Africa/Lubumbashi belongs to which country","expect":{"contains":["Democratic Republic of the Congo"],"notRefusal":true}},{"q":"name the country of the time zone Pacific/Honolulu","expect":{"contains":["United States"],"notRefusal":true}},{"q":"the IANA zone Africa/Luanda belongs to which country","expect":{"contains":["Angola"],"notRefusal":true}},{"q":"the IANA zone America/Lower_Princes belongs to which country","expect":{"contains":["Sint Maarten"],"notRefusal":true}},{"q":"the IANA zone Asia/Bangkok belongs to which country","expect":{"contains":["Thailand"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
