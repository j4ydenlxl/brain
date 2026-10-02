// airport-code-city-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"airport-code-city-neo-g6","class":"airport-code-city","generation":6,"lane":"neo","grownFrom":["the airport code GHA serves which city","which city is the airport IWJ in","name the city of airport MXP","which city is the airport FMA in","which city is the airport BGE in","name the city of airport YPM","name the city of airport YQU","which city is the airport TOI in","which city is the airport RKV in","which city is the airport QIG in","which city is the airport CTS in","the airport code SCC serves which city","the airport code MCI serves which city","name the city of airport GSO","which city is the airport MTM in","the airport code FGI serves which city","the airport code YHT serves which city","name the city of airport GPA","name the city of airport MTH","which city is the airport MWK in"],"version":1});

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
{"id":"n-a4ed7ddc","guard":[["has","airport"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code GHA serves which city":"The airport GHA is in Ghardaia.","which city is the airport IWJ in":"The airport IWJ is in Iwami.","name the city of airport MXP":"The airport MXP is in Milano.","which city is the airport FMA in":"The airport FMA is in Formosa.","which city is the airport BGE in":"The airport BGE is in Bainbridge.","name the city of airport YPM":"The airport YPM is in Pikangikum.","name the city of airport YQU":"The airport YQU is in Grande Prairie.","which city is the airport TOI in":"The airport TOI is in Troy.","which city is the airport RKV in":"The airport RKV is in Reykjavik.","which city is the airport QIG in":"The airport QIG is in Iguatu.","which city is the airport CTS in":"The airport CTS is in Sapporo.","the airport code SCC serves which city":"The airport SCC is in Deadhorse.","the airport code MCI serves which city":"The airport MCI is in Kansas City.","name the city of airport GSO":"The airport GSO is in Greensboro.","which city is the airport MTM in":"The airport MTM is in Metakatla.","the airport code FGI serves which city":"The airport FGI is in Apia.","the airport code YHT serves which city":"The airport YHT is in Haines Junction.","name the city of airport GPA":"The airport GPA is in Patras.","name the city of airport MTH":"The airport MTH is in Marathon.","which city is the airport MWK in":"The airport MWK is in Anambas Islands.","which city is the airport PAQ in":"The airport PAQ is in Palmer.","the airport code PDK serves which city":"The airport PDK is in Atlanta.","which city is the airport KTR in":"The airport KTR is in Katherine.","name the city of airport GRZ":"The airport GRZ is in Graz.","name the city of airport BAI":"The airport BAI is in Buenos Aires.","name the city of airport GNB":"The airport GNB is in Grenoble.","the airport code CCA serves which city":"The airport CCA is in Chapacura.","the airport code GOA serves which city":"The airport GOA is in Genoa.","which city is the airport INT in":"The airport INT is in Winston-salem.","which city is the airport JIB in":"The airport JIB is in Djibouti.","the airport code WHF serves which city":"The airport WHF is in Wadi Halfa.","the airport code GJL serves which city":"The airport GJL is in Jijel.","the airport code MBI serves which city":"The airport MBI is in Mbeya.","name the city of airport ZAL":"The airport ZAL is in Valdivia.","name the city of airport DBT":"The airport DBT is in Debre Tabor.","the airport code EPL serves which city":"The airport EPL is in Epinal.","the airport code CXR serves which city":"The airport CXR is in Nha Trang.","name the city of airport WUA":"The airport WUA is in Wuhai.","name the city of airport PRH":"The airport PRH is in Phrae.","which city is the airport AJY in":"The airport AJY is in Agadez.","name the city of airport SKU":"The airport SKU is in Skiros.","the airport code DKV serves which city":"The airport DKV is in Docker River.","which city is the airport GDO in":"The airport GDO is in Guasdualito.","name the city of airport YIW":"The airport YIW is in Yiwu.","the airport code ATA serves which city":"The airport ATA is in Anta.","which city is the airport WAE in":"The airport WAE is in Wadi-al-dawasir.","name the city of airport IJK":"The airport IJK is in Izhevsk.","the airport code DZN serves which city":"The airport DZN is in Zhezkazgan.","the airport code WIL serves which city":"The airport WIL is in Nairobi.","the airport code CSV serves which city":"The airport CSV is in Crossville.","the airport code YKO serves which city":"The airport YKO is in Hakkari.","name the city of airport FMO":"The airport FMO is in Munster.","the airport code MOB serves which city":"The airport MOB is in Mobile.","the airport code IGB serves which city":"The airport IGB is in Ingeniero Jacobacci.","name the city of airport FRB":"The airport FRB is in Forbes.","which city is the airport YCE in":"The airport YCE is in Centralia.","which city is the airport ELT in":"The airport ELT is in El-tor.","which city is the airport HDS in":"The airport HDS is in Hoedspruit.","which city is the airport DRG in":"The airport DRG is in Deering.","the airport code ABF serves which city":"The airport ABF is in Abaiang Atoll.","name the city of airport BAH":"The airport BAH is in Bahrain.","name the city of airport LSF":"The airport LSF is in Fort Benning.","which city is the airport KHW in":"The airport KHW is in Khwai River.","name the city of airport TMC":"The airport TMC is in Waikabubak-Sumba Island.","which city is the airport RKH in":"The airport RKH is in Rock Hill.","the airport code WMB serves which city":"The airport WMB is in Warrnambool.","which city is the airport KZG in":"The airport KZG is in Kitzingen.","name the city of airport BUD":"The airport BUD is in Budapest.","which city is the airport GGG in":"The airport GGG is in Longview.","name the city of airport UKT":"The airport UKT is in Quakertown.","name the city of airport HOA":"The airport HOA is in Hola.","the airport code LKP serves which city":"The airport LKP is in Lake Placid.","which city is the airport TCS in":"The airport TCS is in Truth Or Consequences.","the airport code ENV serves which city":"The airport ENV is in Wendover.","name the city of airport DKK":"The airport DKK is in Dunkirk.","name the city of airport KMO":"The airport KMO is in Manokotak.","name the city of airport SSR":"The airport SSR is in Pentecost Island.","which city is the airport YZW in":"The airport YZW is in Teslin.","the airport code ISW serves which city":"The airport ISW is in Wisconsin Rapids.","the airport code NRK serves which city":"The airport NRK is in Norrkoeping.","name the city of airport BIH":"The airport BIH is in Bishop.","the airport code SWX serves which city":"The airport SWX is in Shakawe.","the airport code BNM serves which city":"The airport BNM is in Bodinumu.","which city is the airport VVC in":"The airport VVC is in Villavicencio.","the airport code CYB serves which city":"The airport CYB is in Cayman Brac.","name the city of airport CHY":"The airport CHY is in Choiseul Bay.","name the city of airport MLA":"The airport MLA is in Malta.","which city is the airport KKH in":"The airport KKH is in Kongiganak.","which city is the airport YMW in":"The airport YMW is in Maniwaki.","which city is the airport JAS in":"The airport JAS is in Jasper.","which city is the airport MDU in":"The airport MDU is in Mendi.","which city is the airport URA in":"The airport URA is in Uralsk.","name the city of airport CFO":"The airport CFO is in Confresa.","the airport code FUL serves which city":"The airport FUL is in Fullerton.","name the city of airport AYQ":"The airport AYQ is in Uluru.","the airport code IEV serves which city":"The airport IEV is in Kiev.","which city is the airport HSN in":"The airport HSN is in Zhoushan.","which city is the airport BBA in":"The airport BBA is in Balmaceda.","name the city of airport URT":"The airport URT is in Surat Thani.","the airport code YPX serves which city":"The airport YPX is in Puvirnituq."}}},
{"id":"n-bb173d5d","guard":[["has","airport"],["words<=",7]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code GHA serves which city":"The airport GHA is in Ghardaia.","which city is the airport IWJ in":"The airport IWJ is in Iwami.","name the city of airport MXP":"The airport MXP is in Milano.","which city is the airport FMA in":"The airport FMA is in Formosa.","which city is the airport BGE in":"The airport BGE is in Bainbridge.","name the city of airport YPM":"The airport YPM is in Pikangikum.","name the city of airport YQU":"The airport YQU is in Grande Prairie.","which city is the airport TOI in":"The airport TOI is in Troy.","which city is the airport RKV in":"The airport RKV is in Reykjavik.","which city is the airport QIG in":"The airport QIG is in Iguatu.","which city is the airport CTS in":"The airport CTS is in Sapporo.","the airport code SCC serves which city":"The airport SCC is in Deadhorse.","the airport code MCI serves which city":"The airport MCI is in Kansas City.","name the city of airport GSO":"The airport GSO is in Greensboro.","which city is the airport MTM in":"The airport MTM is in Metakatla.","the airport code FGI serves which city":"The airport FGI is in Apia.","the airport code YHT serves which city":"The airport YHT is in Haines Junction.","name the city of airport GPA":"The airport GPA is in Patras.","name the city of airport MTH":"The airport MTH is in Marathon.","which city is the airport MWK in":"The airport MWK is in Anambas Islands.","which city is the airport PAQ in":"The airport PAQ is in Palmer.","the airport code PDK serves which city":"The airport PDK is in Atlanta.","which city is the airport KTR in":"The airport KTR is in Katherine.","name the city of airport GRZ":"The airport GRZ is in Graz.","name the city of airport BAI":"The airport BAI is in Buenos Aires.","name the city of airport GNB":"The airport GNB is in Grenoble.","the airport code CCA serves which city":"The airport CCA is in Chapacura.","the airport code GOA serves which city":"The airport GOA is in Genoa.","which city is the airport INT in":"The airport INT is in Winston-salem.","which city is the airport JIB in":"The airport JIB is in Djibouti.","the airport code WHF serves which city":"The airport WHF is in Wadi Halfa.","the airport code GJL serves which city":"The airport GJL is in Jijel.","the airport code MBI serves which city":"The airport MBI is in Mbeya.","name the city of airport ZAL":"The airport ZAL is in Valdivia.","name the city of airport DBT":"The airport DBT is in Debre Tabor.","the airport code EPL serves which city":"The airport EPL is in Epinal.","the airport code CXR serves which city":"The airport CXR is in Nha Trang.","name the city of airport WUA":"The airport WUA is in Wuhai.","name the city of airport PRH":"The airport PRH is in Phrae.","which city is the airport AJY in":"The airport AJY is in Agadez.","name the city of airport SKU":"The airport SKU is in Skiros.","the airport code DKV serves which city":"The airport DKV is in Docker River.","which city is the airport GDO in":"The airport GDO is in Guasdualito.","name the city of airport YIW":"The airport YIW is in Yiwu.","the airport code ATA serves which city":"The airport ATA is in Anta.","which city is the airport WAE in":"The airport WAE is in Wadi-al-dawasir.","name the city of airport IJK":"The airport IJK is in Izhevsk.","the airport code DZN serves which city":"The airport DZN is in Zhezkazgan.","the airport code WIL serves which city":"The airport WIL is in Nairobi.","the airport code CSV serves which city":"The airport CSV is in Crossville.","the airport code YKO serves which city":"The airport YKO is in Hakkari.","name the city of airport FMO":"The airport FMO is in Munster.","the airport code MOB serves which city":"The airport MOB is in Mobile.","the airport code IGB serves which city":"The airport IGB is in Ingeniero Jacobacci.","name the city of airport FRB":"The airport FRB is in Forbes.","which city is the airport YCE in":"The airport YCE is in Centralia.","which city is the airport ELT in":"The airport ELT is in El-tor.","which city is the airport HDS in":"The airport HDS is in Hoedspruit.","which city is the airport DRG in":"The airport DRG is in Deering.","the airport code ABF serves which city":"The airport ABF is in Abaiang Atoll.","name the city of airport BAH":"The airport BAH is in Bahrain.","name the city of airport LSF":"The airport LSF is in Fort Benning.","which city is the airport KHW in":"The airport KHW is in Khwai River.","name the city of airport TMC":"The airport TMC is in Waikabubak-Sumba Island.","which city is the airport RKH in":"The airport RKH is in Rock Hill.","the airport code WMB serves which city":"The airport WMB is in Warrnambool.","which city is the airport KZG in":"The airport KZG is in Kitzingen.","name the city of airport BUD":"The airport BUD is in Budapest.","which city is the airport GGG in":"The airport GGG is in Longview.","name the city of airport UKT":"The airport UKT is in Quakertown.","name the city of airport HOA":"The airport HOA is in Hola.","the airport code LKP serves which city":"The airport LKP is in Lake Placid.","which city is the airport TCS in":"The airport TCS is in Truth Or Consequences.","the airport code ENV serves which city":"The airport ENV is in Wendover.","name the city of airport DKK":"The airport DKK is in Dunkirk.","name the city of airport KMO":"The airport KMO is in Manokotak.","name the city of airport SSR":"The airport SSR is in Pentecost Island.","which city is the airport YZW in":"The airport YZW is in Teslin.","the airport code ISW serves which city":"The airport ISW is in Wisconsin Rapids.","the airport code NRK serves which city":"The airport NRK is in Norrkoeping.","name the city of airport BIH":"The airport BIH is in Bishop.","the airport code SWX serves which city":"The airport SWX is in Shakawe.","the airport code BNM serves which city":"The airport BNM is in Bodinumu.","which city is the airport VVC in":"The airport VVC is in Villavicencio.","the airport code CYB serves which city":"The airport CYB is in Cayman Brac.","name the city of airport CHY":"The airport CHY is in Choiseul Bay.","name the city of airport MLA":"The airport MLA is in Malta.","which city is the airport KKH in":"The airport KKH is in Kongiganak.","which city is the airport YMW in":"The airport YMW is in Maniwaki.","which city is the airport JAS in":"The airport JAS is in Jasper.","which city is the airport MDU in":"The airport MDU is in Mendi.","which city is the airport URA in":"The airport URA is in Uralsk.","name the city of airport CFO":"The airport CFO is in Confresa.","the airport code FUL serves which city":"The airport FUL is in Fullerton.","name the city of airport AYQ":"The airport AYQ is in Uluru.","the airport code IEV serves which city":"The airport IEV is in Kiev.","which city is the airport HSN in":"The airport HSN is in Zhoushan.","which city is the airport BBA in":"The airport BBA is in Balmaceda.","name the city of airport URT":"The airport URT is in Surat Thani.","the airport code YPX serves which city":"The airport YPX is in Puvirnituq."}}},
{"id":"n-c27eee73","guard":[["has","airport"],["has","city"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"airport"}]]],"mem":{"table":{"code GHA serves which city":"The airport GHA is in Ghardaia.","IWJ in":"The airport IWJ is in Iwami.","MXP":"The airport MXP is in Milano.","FMA in":"The airport FMA is in Formosa.","BGE in":"The airport BGE is in Bainbridge.","YPM":"The airport YPM is in Pikangikum.","YQU":"The airport YQU is in Grande Prairie.","TOI in":"The airport TOI is in Troy.","RKV in":"The airport RKV is in Reykjavik.","QIG in":"The airport QIG is in Iguatu.","CTS in":"The airport CTS is in Sapporo.","code SCC serves which city":"The airport SCC is in Deadhorse.","code MCI serves which city":"The airport MCI is in Kansas City.","GSO":"The airport GSO is in Greensboro.","MTM in":"The airport MTM is in Metakatla.","code FGI serves which city":"The airport FGI is in Apia.","code YHT serves which city":"The airport YHT is in Haines Junction.","GPA":"The airport GPA is in Patras.","MTH":"The airport MTH is in Marathon.","MWK in":"The airport MWK is in Anambas Islands.","PAQ in":"The airport PAQ is in Palmer.","code PDK serves which city":"The airport PDK is in Atlanta.","KTR in":"The airport KTR is in Katherine.","GRZ":"The airport GRZ is in Graz.","BAI":"The airport BAI is in Buenos Aires.","GNB":"The airport GNB is in Grenoble.","code CCA serves which city":"The airport CCA is in Chapacura.","code GOA serves which city":"The airport GOA is in Genoa.","INT in":"The airport INT is in Winston-salem.","JIB in":"The airport JIB is in Djibouti.","code WHF serves which city":"The airport WHF is in Wadi Halfa.","code GJL serves which city":"The airport GJL is in Jijel.","code MBI serves which city":"The airport MBI is in Mbeya.","ZAL":"The airport ZAL is in Valdivia.","DBT":"The airport DBT is in Debre Tabor.","code EPL serves which city":"The airport EPL is in Epinal.","code CXR serves which city":"The airport CXR is in Nha Trang.","WUA":"The airport WUA is in Wuhai.","PRH":"The airport PRH is in Phrae.","AJY in":"The airport AJY is in Agadez.","SKU":"The airport SKU is in Skiros.","code DKV serves which city":"The airport DKV is in Docker River.","GDO in":"The airport GDO is in Guasdualito.","YIW":"The airport YIW is in Yiwu.","code ATA serves which city":"The airport ATA is in Anta.","WAE in":"The airport WAE is in Wadi-al-dawasir.","IJK":"The airport IJK is in Izhevsk.","code DZN serves which city":"The airport DZN is in Zhezkazgan.","code WIL serves which city":"The airport WIL is in Nairobi.","code CSV serves which city":"The airport CSV is in Crossville.","code YKO serves which city":"The airport YKO is in Hakkari.","FMO":"The airport FMO is in Munster.","code MOB serves which city":"The airport MOB is in Mobile.","code IGB serves which city":"The airport IGB is in Ingeniero Jacobacci.","FRB":"The airport FRB is in Forbes.","YCE in":"The airport YCE is in Centralia.","ELT in":"The airport ELT is in El-tor.","HDS in":"The airport HDS is in Hoedspruit.","DRG in":"The airport DRG is in Deering.","code ABF serves which city":"The airport ABF is in Abaiang Atoll.","BAH":"The airport BAH is in Bahrain.","LSF":"The airport LSF is in Fort Benning.","KHW in":"The airport KHW is in Khwai River.","TMC":"The airport TMC is in Waikabubak-Sumba Island.","RKH in":"The airport RKH is in Rock Hill.","code WMB serves which city":"The airport WMB is in Warrnambool.","KZG in":"The airport KZG is in Kitzingen.","BUD":"The airport BUD is in Budapest.","GGG in":"The airport GGG is in Longview.","UKT":"The airport UKT is in Quakertown.","HOA":"The airport HOA is in Hola.","code LKP serves which city":"The airport LKP is in Lake Placid.","TCS in":"The airport TCS is in Truth Or Consequences.","code ENV serves which city":"The airport ENV is in Wendover.","DKK":"The airport DKK is in Dunkirk.","KMO":"The airport KMO is in Manokotak.","SSR":"The airport SSR is in Pentecost Island.","YZW in":"The airport YZW is in Teslin.","code ISW serves which city":"The airport ISW is in Wisconsin Rapids.","code NRK serves which city":"The airport NRK is in Norrkoeping.","BIH":"The airport BIH is in Bishop.","code SWX serves which city":"The airport SWX is in Shakawe.","code BNM serves which city":"The airport BNM is in Bodinumu.","VVC in":"The airport VVC is in Villavicencio.","code CYB serves which city":"The airport CYB is in Cayman Brac.","CHY":"The airport CHY is in Choiseul Bay.","MLA":"The airport MLA is in Malta.","KKH in":"The airport KKH is in Kongiganak.","YMW in":"The airport YMW is in Maniwaki.","JAS in":"The airport JAS is in Jasper.","MDU in":"The airport MDU is in Mendi.","URA in":"The airport URA is in Uralsk.","CFO":"The airport CFO is in Confresa.","code FUL serves which city":"The airport FUL is in Fullerton.","AYQ":"The airport AYQ is in Uluru.","code IEV serves which city":"The airport IEV is in Kiev.","HSN in":"The airport HSN is in Zhoushan.","BBA in":"The airport BBA is in Balmaceda.","URT":"The airport URT is in Surat Thani.","code YPX serves which city":"The airport YPX is in Puvirnituq."}}},
{"id":"n-ca566930","guard":[["has","airport"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"city"}]]],"mem":{"table":{"is the airport IWJ in":"The airport IWJ is in Iwami.","of airport MXP":"The airport MXP is in Milano.","is the airport FMA in":"The airport FMA is in Formosa.","is the airport BGE in":"The airport BGE is in Bainbridge.","of airport YPM":"The airport YPM is in Pikangikum.","of airport YQU":"The airport YQU is in Grande Prairie.","is the airport TOI in":"The airport TOI is in Troy.","is the airport RKV in":"The airport RKV is in Reykjavik.","is the airport QIG in":"The airport QIG is in Iguatu.","is the airport CTS in":"The airport CTS is in Sapporo.","of airport GSO":"The airport GSO is in Greensboro.","is the airport MTM in":"The airport MTM is in Metakatla.","of airport GPA":"The airport GPA is in Patras.","of airport MTH":"The airport MTH is in Marathon.","is the airport MWK in":"The airport MWK is in Anambas Islands.","is the airport PAQ in":"The airport PAQ is in Palmer.","is the airport KTR in":"The airport KTR is in Katherine.","of airport GRZ":"The airport GRZ is in Graz.","of airport BAI":"The airport BAI is in Buenos Aires.","of airport GNB":"The airport GNB is in Grenoble.","is the airport INT in":"The airport INT is in Winston-salem.","is the airport JIB in":"The airport JIB is in Djibouti.","of airport ZAL":"The airport ZAL is in Valdivia.","of airport DBT":"The airport DBT is in Debre Tabor.","of airport WUA":"The airport WUA is in Wuhai.","of airport PRH":"The airport PRH is in Phrae.","is the airport AJY in":"The airport AJY is in Agadez.","of airport SKU":"The airport SKU is in Skiros.","is the airport GDO in":"The airport GDO is in Guasdualito.","of airport YIW":"The airport YIW is in Yiwu.","is the airport WAE in":"The airport WAE is in Wadi-al-dawasir.","of airport IJK":"The airport IJK is in Izhevsk.","of airport FMO":"The airport FMO is in Munster.","of airport FRB":"The airport FRB is in Forbes.","is the airport YCE in":"The airport YCE is in Centralia.","is the airport ELT in":"The airport ELT is in El-tor.","is the airport HDS in":"The airport HDS is in Hoedspruit.","is the airport DRG in":"The airport DRG is in Deering.","of airport BAH":"The airport BAH is in Bahrain.","of airport LSF":"The airport LSF is in Fort Benning.","is the airport KHW in":"The airport KHW is in Khwai River.","of airport TMC":"The airport TMC is in Waikabubak-Sumba Island.","is the airport RKH in":"The airport RKH is in Rock Hill.","is the airport KZG in":"The airport KZG is in Kitzingen.","of airport BUD":"The airport BUD is in Budapest.","is the airport GGG in":"The airport GGG is in Longview.","of airport UKT":"The airport UKT is in Quakertown.","of airport HOA":"The airport HOA is in Hola.","is the airport TCS in":"The airport TCS is in Truth Or Consequences.","of airport DKK":"The airport DKK is in Dunkirk.","of airport KMO":"The airport KMO is in Manokotak.","of airport SSR":"The airport SSR is in Pentecost Island.","is the airport YZW in":"The airport YZW is in Teslin.","of airport BIH":"The airport BIH is in Bishop.","is the airport VVC in":"The airport VVC is in Villavicencio.","of airport CHY":"The airport CHY is in Choiseul Bay.","of airport MLA":"The airport MLA is in Malta.","is the airport KKH in":"The airport KKH is in Kongiganak.","is the airport YMW in":"The airport YMW is in Maniwaki.","is the airport JAS in":"The airport JAS is in Jasper.","is the airport MDU in":"The airport MDU is in Mendi.","is the airport URA in":"The airport URA is in Uralsk.","of airport CFO":"The airport CFO is in Confresa.","of airport AYQ":"The airport AYQ is in Uluru.","is the airport HSN in":"The airport HSN is in Zhoushan.","is the airport BBA in":"The airport BBA is in Balmaceda.","of airport URT":"The airport URT is in Surat Thani."}}},
{"id":"n-26a879a8","guard":[["has","airport"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"in"}]]],"mem":{"table":{"which city is the airport IWJ":"The airport IWJ is in Iwami.","which city is the airport FMA":"The airport FMA is in Formosa.","which city is the airport BGE":"The airport BGE is in Bainbridge.","which city is the airport TOI":"The airport TOI is in Troy.","which city is the airport RKV":"The airport RKV is in Reykjavik.","which city is the airport QIG":"The airport QIG is in Iguatu.","which city is the airport CTS":"The airport CTS is in Sapporo.","which city is the airport MTM":"The airport MTM is in Metakatla.","which city is the airport MWK":"The airport MWK is in Anambas Islands.","which city is the airport PAQ":"The airport PAQ is in Palmer.","which city is the airport KTR":"The airport KTR is in Katherine.","which city is the airport INT":"The airport INT is in Winston-salem.","which city is the airport JIB":"The airport JIB is in Djibouti.","which city is the airport AJY":"The airport AJY is in Agadez.","which city is the airport GDO":"The airport GDO is in Guasdualito.","which city is the airport WAE":"The airport WAE is in Wadi-al-dawasir.","which city is the airport YCE":"The airport YCE is in Centralia.","which city is the airport ELT":"The airport ELT is in El-tor.","which city is the airport HDS":"The airport HDS is in Hoedspruit.","which city is the airport DRG":"The airport DRG is in Deering.","which city is the airport KHW":"The airport KHW is in Khwai River.","which city is the airport RKH":"The airport RKH is in Rock Hill.","which city is the airport KZG":"The airport KZG is in Kitzingen.","which city is the airport GGG":"The airport GGG is in Longview.","which city is the airport TCS":"The airport TCS is in Truth Or Consequences.","which city is the airport YZW":"The airport YZW is in Teslin.","which city is the airport VVC":"The airport VVC is in Villavicencio.","which city is the airport KKH":"The airport KKH is in Kongiganak.","which city is the airport YMW":"The airport YMW is in Maniwaki.","which city is the airport JAS":"The airport JAS is in Jasper.","which city is the airport MDU":"The airport MDU is in Mendi.","which city is the airport URA":"The airport URA is in Uralsk.","which city is the airport HSN":"The airport HSN is in Zhoushan.","which city is the airport BBA":"The airport BBA is in Balmaceda."}}},
{"id":"n-61e4e9d2","guard":[["has","airport"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the airport IWJ in":"The airport IWJ is in Iwami.","the airport FMA in":"The airport FMA is in Formosa.","the airport BGE in":"The airport BGE is in Bainbridge.","the airport TOI in":"The airport TOI is in Troy.","the airport RKV in":"The airport RKV is in Reykjavik.","the airport QIG in":"The airport QIG is in Iguatu.","the airport CTS in":"The airport CTS is in Sapporo.","the airport MTM in":"The airport MTM is in Metakatla.","the airport MWK in":"The airport MWK is in Anambas Islands.","the airport PAQ in":"The airport PAQ is in Palmer.","the airport KTR in":"The airport KTR is in Katherine.","the airport INT in":"The airport INT is in Winston-salem.","the airport JIB in":"The airport JIB is in Djibouti.","the airport AJY in":"The airport AJY is in Agadez.","the airport GDO in":"The airport GDO is in Guasdualito.","the airport WAE in":"The airport WAE is in Wadi-al-dawasir.","the airport YCE in":"The airport YCE is in Centralia.","the airport ELT in":"The airport ELT is in El-tor.","the airport HDS in":"The airport HDS is in Hoedspruit.","the airport DRG in":"The airport DRG is in Deering.","the airport KHW in":"The airport KHW is in Khwai River.","the airport RKH in":"The airport RKH is in Rock Hill.","the airport KZG in":"The airport KZG is in Kitzingen.","the airport GGG in":"The airport GGG is in Longview.","the airport TCS in":"The airport TCS is in Truth Or Consequences.","the airport YZW in":"The airport YZW is in Teslin.","the airport VVC in":"The airport VVC is in Villavicencio.","the airport KKH in":"The airport KKH is in Kongiganak.","the airport YMW in":"The airport YMW is in Maniwaki.","the airport JAS in":"The airport JAS is in Jasper.","the airport MDU in":"The airport MDU is in Mendi.","the airport URA in":"The airport URA is in Uralsk.","the airport HSN in":"The airport HSN is in Zhoushan.","the airport BBA in":"The airport BBA is in Balmaceda."}}},
{"id":"n-f266e4b4","guard":[["has","airport"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"airport MXP":"The airport MXP is in Milano.","airport YPM":"The airport YPM is in Pikangikum.","airport YQU":"The airport YQU is in Grande Prairie.","airport GSO":"The airport GSO is in Greensboro.","airport GPA":"The airport GPA is in Patras.","airport MTH":"The airport MTH is in Marathon.","airport GRZ":"The airport GRZ is in Graz.","airport BAI":"The airport BAI is in Buenos Aires.","airport GNB":"The airport GNB is in Grenoble.","airport ZAL":"The airport ZAL is in Valdivia.","airport DBT":"The airport DBT is in Debre Tabor.","airport WUA":"The airport WUA is in Wuhai.","airport PRH":"The airport PRH is in Phrae.","airport SKU":"The airport SKU is in Skiros.","airport YIW":"The airport YIW is in Yiwu.","airport IJK":"The airport IJK is in Izhevsk.","airport FMO":"The airport FMO is in Munster.","airport FRB":"The airport FRB is in Forbes.","airport BAH":"The airport BAH is in Bahrain.","airport LSF":"The airport LSF is in Fort Benning.","airport TMC":"The airport TMC is in Waikabubak-Sumba Island.","airport BUD":"The airport BUD is in Budapest.","airport UKT":"The airport UKT is in Quakertown.","airport HOA":"The airport HOA is in Hola.","airport DKK":"The airport DKK is in Dunkirk.","airport KMO":"The airport KMO is in Manokotak.","airport SSR":"The airport SSR is in Pentecost Island.","airport BIH":"The airport BIH is in Bishop.","airport CHY":"The airport CHY is in Choiseul Bay.","airport MLA":"The airport MLA is in Malta.","airport CFO":"The airport CFO is in Confresa.","airport AYQ":"The airport AYQ is in Uluru.","airport URT":"The airport URT is in Surat Thani."}}},
{"id":"n-00b6910e","guard":[["hasAny",["airport","city","jas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport JAS in":"The airport JAS is in Jasper."}}},
{"id":"n-024b13fe","guard":[["hasAny",["airport","city","code","cyb","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code CYB serves which city":"The airport CYB is in Cayman Brac."}}},
{"id":"n-02ac6e3a","guard":[["has","iwj"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport IWJ in":"The airport IWJ is in Iwami."}}},
{"id":"n-03a0dd44","guard":[["has","frb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport FRB":"The airport FRB is in Forbes."}}},
{"id":"n-03ade087","guard":[["has","gjl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code GJL serves which city":"The airport GJL is in Jijel."}}},
{"id":"n-03e0a00a","guard":[["hasAny",["airport","city","code","cxr","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code CXR serves which city":"The airport CXR is in Nha Trang."}}},
{"id":"n-05ca600b","guard":[["hasAny",["airport","city","fmo","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport FMO":"The airport FMO is in Munster."}}},
{"id":"n-072fc227","guard":[["hasAny",["airport","city","yzw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport YZW in":"The airport YZW is in Teslin."}}},
{"id":"n-090b32d7","guard":[["hasAny",["airport","city","rkv"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport RKV in":"The airport RKV is in Reykjavik."}}},
{"id":"n-0aab8059","guard":[["hasAny",["airport","city","name","ukt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport UKT":"The airport UKT is in Quakertown."}}},
{"id":"n-0afb3bfb","guard":[["hasAny",["airport","city","dkk","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport DKK":"The airport DKK is in Dunkirk."}}},
{"id":"n-0cb1c2ef","guard":[["hasAny",["airport","city","code","iev","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code IEV serves which city":"The airport IEV is in Kiev."}}},
{"id":"n-0e98e958","guard":[["hasAny",["airport","city","name","sku"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport SKU":"The airport SKU is in Skiros."}}},
{"id":"n-102868c8","guard":[["has","paq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport PAQ in":"The airport PAQ is in Palmer."}}},
{"id":"n-1199af41","guard":[["has","lkp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code LKP serves which city":"The airport LKP is in Lake Placid."}}},
{"id":"n-137f3820","guard":[["has","ypx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code YPX serves which city":"The airport YPX is in Puvirnituq."}}},
{"id":"n-143854c5","guard":[["hasAny",["airport","city","code","serves","yko"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code YKO serves which city":"The airport YKO is in Hakkari."}}},
{"id":"n-15a6ee11","guard":[["hasAny",["airport","city","kzg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport KZG in":"The airport KZG is in Kitzingen."}}},
{"id":"n-17552fc5","guard":[["has","gha"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code GHA serves which city":"The airport GHA is in Ghardaia."}}},
{"id":"n-18c61881","guard":[["hasAny",["airport","city","code","serves","yht"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code YHT serves which city":"The airport YHT is in Haines Junction."}}},
{"id":"n-1aa3eba3","guard":[["hasAny",["airport","city","mla","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport MLA":"The airport MLA is in Malta."}}},
{"id":"n-1ac0a507","guard":[["hasAny",["airport","city","code","isw","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code ISW serves which city":"The airport ISW is in Wisconsin Rapids."}}},
{"id":"n-1aca5715","guard":[["hasAny",["airport","bge","city"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport BGE in":"The airport BGE is in Bainbridge."}}},
{"id":"n-1b39b89b","guard":[["has","cyb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code CYB serves which city":"The airport CYB is in Cayman Brac."}}},
{"id":"n-1ba53155","guard":[["has","yht"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code YHT serves which city":"The airport YHT is in Haines Junction."}}},
{"id":"n-1de1a097","guard":[["has","int"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport INT in":"The airport INT is in Winston-salem."}}},
{"id":"n-1e31e0b1","guard":[["has","ggg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport GGG in":"The airport GGG is in Longview."}}},
{"id":"n-1f392029","guard":[["hasAny",["airport","city","code","mbi","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code MBI serves which city":"The airport MBI is in Mbeya."}}},
{"id":"n-202cd87b","guard":[["hasAny",["airport","cca","city","code","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code CCA serves which city":"The airport CCA is in Chapacura."}}},
{"id":"n-23affba0","guard":[["hasAny",["airport","city","toi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport TOI in":"The airport TOI is in Troy."}}},
{"id":"n-2438f091","guard":[["hasAny",["airport","city","qig"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport QIG in":"The airport QIG is in Iguatu."}}},
{"id":"n-25c786c7","guard":[["has","kzg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport KZG in":"The airport KZG is in Kitzingen."}}},
{"id":"n-2660cecc","guard":[["hasAny",["airport","city","grz","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport GRZ":"The airport GRZ is in Graz."}}},
{"id":"n-2888ea60","guard":[["hasAny",["airport","city","code","pdk","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code PDK serves which city":"The airport PDK is in Atlanta."}}},
{"id":"n-292da126","guard":[["hasAny",["airport","city","code","epl","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code EPL serves which city":"The airport EPL is in Epinal."}}},
{"id":"n-2a567233","guard":[["has","khw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport KHW in":"The airport KHW is in Khwai River."}}},
{"id":"n-2b9ebf43","guard":[["hasAny",["airport","city","code","mob","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code MOB serves which city":"The airport MOB is in Mobile."}}},
{"id":"n-2ba639e8","guard":[["has","bnm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code BNM serves which city":"The airport BNM is in Bodinumu."}}},
{"id":"n-2c364a79","guard":[["has","vvc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport VVC in":"The airport VVC is in Villavicencio."}}},
{"id":"n-2d8d8912","guard":[["hasAny",["airport","city","rkh"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport RKH in":"The airport RKH is in Rock Hill."}}},
{"id":"n-2f768d43","guard":[["has","kmo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport KMO":"The airport KMO is in Manokotak."}}},
{"id":"n-2ff043a2","guard":[["hasAny",["airport","city","lsf","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport LSF":"The airport LSF is in Fort Benning."}}},
{"id":"n-2ff4d480","guard":[["hasAny",["airport","city","hds"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport HDS in":"The airport HDS is in Hoedspruit."}}},
{"id":"n-332b2203","guard":[["hasAny",["airport","ayq","city","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport AYQ":"The airport AYQ is in Uluru."}}},
{"id":"n-334af4ef","guard":[["has","bud"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport BUD":"The airport BUD is in Budapest."}}},
{"id":"n-33e61d9b","guard":[["hasAny",["airport","city","elt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport ELT in":"The airport ELT is in El-tor."}}},
{"id":"n-34c4872e","guard":[["has","cca"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code CCA serves which city":"The airport CCA is in Chapacura."}}},
{"id":"n-3a8b7bb5","guard":[["hasAny",["airport","city","wae"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport WAE in":"The airport WAE is in Wadi-al-dawasir."}}},
{"id":"n-3ca4a54f","guard":[["hasAny",["airport","city","iwj"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport IWJ in":"The airport IWJ is in Iwami."}}},
{"id":"n-3ca7ca10","guard":[["hasAny",["airport","city","code","ful","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code FUL serves which city":"The airport FUL is in Fullerton."}}},
{"id":"n-3cb293e6","guard":[["hasAny",["airport","city","kmo","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport KMO":"The airport KMO is in Manokotak."}}},
{"id":"n-3cc1c9a8","guard":[["hasAny",["airport","city","code","scc","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code SCC serves which city":"The airport SCC is in Deadhorse."}}},
{"id":"n-3deec19a","guard":[["has","urt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport URT":"The airport URT is in Surat Thani."}}},
{"id":"n-3e0a5231","guard":[["hasAny",["airport","city","code","mci","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code MCI serves which city":"The airport MCI is in Kansas City."}}},
{"id":"n-3f0fc80e","guard":[["hasAny",["airport","city","jib"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport JIB in":"The airport JIB is in Djibouti."}}},
{"id":"n-3fdd91e0","guard":[["has","mdu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport MDU in":"The airport MDU is in Mendi."}}},
{"id":"n-426e9c22","guard":[["has","ssr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport SSR":"The airport SSR is in Pentecost Island."}}},
{"id":"n-455b5878","guard":[["has","whf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code WHF serves which city":"The airport WHF is in Wadi Halfa."}}},
{"id":"n-456fd294","guard":[["hasAny",["abf","airport","city","code","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code ABF serves which city":"The airport ABF is in Abaiang Atoll."}}},
{"id":"n-47b1c426","guard":[["has","prh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport PRH":"The airport PRH is in Phrae."}}},
{"id":"n-4d545b6d","guard":[["has","ata"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code ATA serves which city":"The airport ATA is in Anta."}}},
{"id":"n-4efba887","guard":[["hasAny",["airport","bih","city","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport BIH":"The airport BIH is in Bishop."}}},
{"id":"n-50ea465d","guard":[["hasAny",["airport","ajy","city"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport AJY in":"The airport AJY is in Agadez."}}},
{"id":"n-51e70714","guard":[["hasAny",["airport","chy","city","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport CHY":"The airport CHY is in Choiseul Bay."}}},
{"id":"n-543a5914","guard":[["has","drg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport DRG in":"The airport DRG is in Deering."}}},
{"id":"n-55e38e09","guard":[["has","dkk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport DKK":"The airport DKK is in Dunkirk."}}},
{"id":"n-56c9c1a6","guard":[["has","chy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport CHY":"The airport CHY is in Choiseul Bay."}}},
{"id":"n-56f57caf","guard":[["hasAny",["airport","city","code","goa","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code GOA serves which city":"The airport GOA is in Genoa."}}},
{"id":"n-5c40b9a8","guard":[["hasAny",["airport","city","code","dzn","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code DZN serves which city":"The airport DZN is in Zhezkazgan."}}},
{"id":"n-5de94bac","guard":[["hasAny",["airport","bba","city"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport BBA in":"The airport BBA is in Balmaceda."}}},
{"id":"n-5ff1248e","guard":[["hasAny",["airport","city","gpa","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport GPA":"The airport GPA is in Patras."}}},
{"id":"n-604af1eb","guard":[["hasAny",["airport","bai","city","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport BAI":"The airport BAI is in Buenos Aires."}}},
{"id":"n-671cb7a7","guard":[["has","ypm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport YPM":"The airport YPM is in Pikangikum."}}},
{"id":"n-67b5b174","guard":[["hasAny",["airport","bud","city","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport BUD":"The airport BUD is in Budapest."}}},
{"id":"n-68128a2c","guard":[["hasAny",["airport","city","code","gha","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code GHA serves which city":"The airport GHA is in Ghardaia."}}},
{"id":"n-6aee56fe","guard":[["has","igb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code IGB serves which city":"The airport IGB is in Ingeniero Jacobacci."}}},
{"id":"n-6cbc709d","guard":[["has","jib"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport JIB in":"The airport JIB is in Djibouti."}}},
{"id":"n-6cceb3e7","guard":[["hasAny",["airport","city","name","urt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport URT":"The airport URT is in Surat Thani."}}},
{"id":"n-6dc3da89","guard":[["has","fma"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport FMA in":"The airport FMA is in Formosa."}}},
{"id":"n-6ed33889","guard":[["hasAny",["airport","city","yce"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport YCE in":"The airport YCE is in Centralia."}}},
{"id":"n-72a59636","guard":[["has","yko"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code YKO serves which city":"The airport YKO is in Hakkari."}}},
{"id":"n-73b3c96f","guard":[["has","dbt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport DBT":"The airport DBT is in Debre Tabor."}}},
{"id":"n-74dc31ed","guard":[["has","nrk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code NRK serves which city":"The airport NRK is in Norrkoeping."}}},
{"id":"n-753a2e19","guard":[["has","ajy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport AJY in":"The airport AJY is in Agadez."}}},
{"id":"n-75dccc21","guard":[["has","isw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code ISW serves which city":"The airport ISW is in Wisconsin Rapids."}}},
{"id":"n-78124ca6","guard":[["hasAny",["airport","city","drg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport DRG in":"The airport DRG is in Deering."}}},
{"id":"n-78748802","guard":[["has","mla"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport MLA":"The airport MLA is in Malta."}}},
{"id":"n-7997fab6","guard":[["hasAny",["airport","city","code","env","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code ENV serves which city":"The airport ENV is in Wendover."}}},
{"id":"n-7a940fd4","guard":[["has","fmo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport FMO":"The airport FMO is in Munster."}}},
{"id":"n-7aa4329b","guard":[["hasAny",["airport","city","paq"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport PAQ in":"The airport PAQ is in Palmer."}}},
{"id":"n-7b34532e","guard":[["hasAny",["airport","city","code","gjl","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code GJL serves which city":"The airport GJL is in Jijel."}}},
{"id":"n-7b64d3fd","guard":[["has","rkh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport RKH in":"The airport RKH is in Rock Hill."}}},
{"id":"n-7bb488b1","guard":[["hasAny",["airport","city","ktr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport KTR in":"The airport KTR is in Katherine."}}},
{"id":"n-7c907379","guard":[["has","mth"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport MTH":"The airport MTH is in Marathon."}}},
{"id":"n-7d89ead8","guard":[["hasAny",["airport","city","code","serves","wmb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code WMB serves which city":"The airport WMB is in Warrnambool."}}},
{"id":"n-7d8aede0","guard":[["has","epl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code EPL serves which city":"The airport EPL is in Epinal."}}},
{"id":"n-7f3010d2","guard":[["has","tcs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport TCS in":"The airport TCS is in Truth Or Consequences."}}},
{"id":"n-81058089","guard":[["has","cts"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport CTS in":"The airport CTS is in Sapporo."}}},
{"id":"n-81378364","guard":[["hasAny",["airport","bnm","city","code","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code BNM serves which city":"The airport BNM is in Bodinumu."}}},
{"id":"n-814d5db1","guard":[["hasAny",["airport","city","gdo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport GDO in":"The airport GDO is in Guasdualito."}}},
{"id":"n-833a14f9","guard":[["hasAny",["airport","city","code","lkp","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code LKP serves which city":"The airport LKP is in Lake Placid."}}},
{"id":"n-83552960","guard":[["hasAny",["airport","cfo","city","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport CFO":"The airport CFO is in Confresa."}}},
{"id":"n-86e37057","guard":[["has","mci"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code MCI serves which city":"The airport MCI is in Kansas City."}}},
{"id":"n-872f3016","guard":[["hasAny",["airport","city","code","serves","wil"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code WIL serves which city":"The airport WIL is in Nairobi."}}},
{"id":"n-8911cf7f","guard":[["has","kkh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport KKH in":"The airport KKH is in Kongiganak."}}},
{"id":"n-8d0a6da4","guard":[["hasAny",["airport","city","code","igb","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code IGB serves which city":"The airport IGB is in Ingeniero Jacobacci."}}},
{"id":"n-8d4f83e0","guard":[["has","ijk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport IJK":"The airport IJK is in Izhevsk."}}},
{"id":"n-8e89e43c","guard":[["has","lsf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport LSF":"The airport LSF is in Fort Benning."}}},
{"id":"n-8f8a14e3","guard":[["hasAny",["airport","city","code","dkv","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code DKV serves which city":"The airport DKV is in Docker River."}}},
{"id":"n-91ad57c9","guard":[["has","grz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport GRZ":"The airport GRZ is in Graz."}}},
{"id":"n-9295581b","guard":[["hasAny",["airport","city","name","prh"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport PRH":"The airport PRH is in Phrae."}}},
{"id":"n-94701182","guard":[["hasAny",["airport","city","gnb","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport GNB":"The airport GNB is in Grenoble."}}},
{"id":"n-96a041b9","guard":[["hasAny",["airport","city","kkh"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport KKH in":"The airport KKH is in Kongiganak."}}},
{"id":"n-96d3f7f8","guard":[["hasAny",["airport","city","code","csv","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code CSV serves which city":"The airport CSV is in Crossville."}}},
{"id":"n-96ef128b","guard":[["hasAny",["airport","city","name","yqu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport YQU":"The airport YQU is in Grande Prairie."}}},
{"id":"n-96efaf3d","guard":[["hasAny",["airport","city","gso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport GSO":"The airport GSO is in Greensboro."}}},
{"id":"n-9ba1908b","guard":[["has","toi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport TOI in":"The airport TOI is in Troy."}}},
{"id":"n-9d75eebe","guard":[["has","ura"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport URA in":"The airport URA is in Uralsk."}}},
{"id":"n-9e3418fc","guard":[["has","wmb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code WMB serves which city":"The airport WMB is in Warrnambool."}}},
{"id":"n-a21265db","guard":[["has","mtm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport MTM in":"The airport MTM is in Metakatla."}}},
{"id":"n-a2414a21","guard":[["hasAny",["airport","city","code","serves","swx"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code SWX serves which city":"The airport SWX is in Shakawe."}}},
{"id":"n-a5bfaa21","guard":[["has","dzn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code DZN serves which city":"The airport DZN is in Zhezkazgan."}}},
{"id":"n-a5d10bcf","guard":[["has","hoa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport HOA":"The airport HOA is in Hola."}}},
{"id":"n-a6a1fd0b","guard":[["has","cfo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport CFO":"The airport CFO is in Confresa."}}},
{"id":"n-a7082212","guard":[["hasAny",["airport","city","name","zal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport ZAL":"The airport ZAL is in Valdivia."}}},
{"id":"n-a805912e","guard":[["has","abf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code ABF serves which city":"The airport ABF is in Abaiang Atoll."}}},
{"id":"n-a90e0568","guard":[["has","goa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code GOA serves which city":"The airport GOA is in Genoa."}}},
{"id":"n-ac087eeb","guard":[["has","wae"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport WAE in":"The airport WAE is in Wadi-al-dawasir."}}},
{"id":"n-aec7100b","guard":[["has","cxr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code CXR serves which city":"The airport CXR is in Nha Trang."}}},
{"id":"n-afe7042e","guard":[["has","yzw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport YZW in":"The airport YZW is in Teslin."}}},
{"id":"n-b0b7d4c3","guard":[["has","hsn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport HSN in":"The airport HSN is in Zhoushan."}}},
{"id":"n-b14ed364","guard":[["has","tmc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport TMC":"The airport TMC is in Waikabubak-Sumba Island."}}},
{"id":"n-b351db7b","guard":[["hasAny",["airport","ata","city","code","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code ATA serves which city":"The airport ATA is in Anta."}}},
{"id":"n-b38116d1","guard":[["hasAny",["airport","city","ymw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport YMW in":"The airport YMW is in Maniwaki."}}},
{"id":"n-b4efccc9","guard":[["has","hds"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport HDS in":"The airport HDS is in Hoedspruit."}}},
{"id":"n-b5748108","guard":[["hasAny",["airport","city","mdu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport MDU in":"The airport MDU is in Mendi."}}},
{"id":"n-b5b6257c","guard":[["hasAny",["airport","city","ijk","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport IJK":"The airport IJK is in Izhevsk."}}},
{"id":"n-b7167e32","guard":[["hasAny",["airport","city","tcs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport TCS in":"The airport TCS is in Truth Or Consequences."}}},
{"id":"n-b72a45dc","guard":[["has","iev"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code IEV serves which city":"The airport IEV is in Kiev."}}},
{"id":"n-b7cb72e6","guard":[["hasAny",["airport","city","int"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport INT in":"The airport INT is in Winston-salem."}}},
{"id":"n-b9f20d07","guard":[["has","yiw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport YIW":"The airport YIW is in Yiwu."}}},
{"id":"n-b9f8f406","guard":[["hasAny",["airport","city","name","wua"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport WUA":"The airport WUA is in Wuhai."}}},
{"id":"n-ba49d947","guard":[["has","dkv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code DKV serves which city":"The airport DKV is in Docker River."}}},
{"id":"n-bb2dfa5d","guard":[["has","fgi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code FGI serves which city":"The airport FGI is in Apia."}}},
{"id":"n-bcaf09d2","guard":[["hasAny",["airport","city","cts"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport CTS in":"The airport CTS is in Sapporo."}}},
{"id":"n-be8e78e1","guard":[["hasAny",["airport","city","ura"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport URA in":"The airport URA is in Uralsk."}}},
{"id":"n-c1da38e3","guard":[["has","bba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport BBA in":"The airport BBA is in Balmaceda."}}},
{"id":"n-c2bf5c03","guard":[["hasAny",["airport","city","mtm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport MTM in":"The airport MTM is in Metakatla."}}},
{"id":"n-c5863bf9","guard":[["has","wil"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code WIL serves which city":"The airport WIL is in Nairobi."}}},
{"id":"n-c5f89c89","guard":[["hasAny",["airport","city","ggg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport GGG in":"The airport GGG is in Longview."}}},
{"id":"n-c7e0bc47","guard":[["has","bih"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport BIH":"The airport BIH is in Bishop."}}},
{"id":"n-c83147f1","guard":[["has","mxp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport MXP":"The airport MXP is in Milano."}}},
{"id":"n-c84e7408","guard":[["hasAny",["airport","city","hsn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport HSN in":"The airport HSN is in Zhoushan."}}},
{"id":"n-c9643f3a","guard":[["hasAny",["airport","city","name","yiw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport YIW":"The airport YIW is in Yiwu."}}},
{"id":"n-ca6be5cb","guard":[["hasAny",["airport","city","khw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport KHW in":"The airport KHW is in Khwai River."}}},
{"id":"n-cac2d83e","guard":[["hasAny",["airport","city","code","nrk","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code NRK serves which city":"The airport NRK is in Norrkoeping."}}},
{"id":"n-cb77e804","guard":[["hasAny",["airport","city","dbt","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport DBT":"The airport DBT is in Debre Tabor."}}},
{"id":"n-ccf83f77","guard":[["has","scc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code SCC serves which city":"The airport SCC is in Deadhorse."}}},
{"id":"n-cde9c401","guard":[["has","swx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code SWX serves which city":"The airport SWX is in Shakawe."}}},
{"id":"n-ce0068d7","guard":[["has","mwk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport MWK in":"The airport MWK is in Anambas Islands."}}},
{"id":"n-ce672bf8","guard":[["has","ukt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport UKT":"The airport UKT is in Quakertown."}}},
{"id":"n-cedbaa47","guard":[["hasAny",["airport","city","code","serves","ypx"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code YPX serves which city":"The airport YPX is in Puvirnituq."}}},
{"id":"n-d05cefc4","guard":[["has","zal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport ZAL":"The airport ZAL is in Valdivia."}}},
{"id":"n-d3c68ea8","guard":[["has","bai"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport BAI":"The airport BAI is in Buenos Aires."}}},
{"id":"n-d449f3f6","guard":[["has","gso"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport GSO":"The airport GSO is in Greensboro."}}},
{"id":"n-d58302bb","guard":[["hasAny",["airport","city","fma"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport FMA in":"The airport FMA is in Formosa."}}},
{"id":"n-d93d832b","guard":[["has","gpa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport GPA":"The airport GPA is in Patras."}}},
{"id":"n-da1f5499","guard":[["has","gdo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport GDO in":"The airport GDO is in Guasdualito."}}},
{"id":"n-da2f9539","guard":[["has","ayq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport AYQ":"The airport AYQ is in Uluru."}}},
{"id":"n-db78c6e7","guard":[["hasAny",["airport","bah","city","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport BAH":"The airport BAH is in Bahrain."}}},
{"id":"n-dcd22f1e","guard":[["has","wua"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport WUA":"The airport WUA is in Wuhai."}}},
{"id":"n-dd44a9fa","guard":[["has","sku"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport SKU":"The airport SKU is in Skiros."}}},
{"id":"n-dd66cb56","guard":[["hasAny",["airport","city","mwk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport MWK in":"The airport MWK is in Anambas Islands."}}},
{"id":"n-dd9c991f","guard":[["hasAny",["airport","city","name","ssr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport SSR":"The airport SSR is in Pentecost Island."}}},
{"id":"n-ddfe17d1","guard":[["hasAny",["airport","city","vvc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which city is the airport VVC in":"The airport VVC is in Villavicencio."}}},
{"id":"n-deb9e126","guard":[["has","bah"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport BAH":"The airport BAH is in Bahrain."}}},
{"id":"n-e130de67","guard":[["has","bge"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport BGE in":"The airport BGE is in Bainbridge."}}},
{"id":"n-e282152d","guard":[["hasAny",["airport","city","mth","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport MTH":"The airport MTH is in Marathon."}}},
{"id":"n-e3db804d","guard":[["has","env"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code ENV serves which city":"The airport ENV is in Wendover."}}},
{"id":"n-e4091281","guard":[["has","pdk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code PDK serves which city":"The airport PDK is in Atlanta."}}},
{"id":"n-e410d671","guard":[["hasAny",["airport","city","name","tmc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport TMC":"The airport TMC is in Waikabubak-Sumba Island."}}},
{"id":"n-e496918a","guard":[["hasAny",["airport","city","code","serves","whf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code WHF serves which city":"The airport WHF is in Wadi Halfa."}}},
{"id":"n-e4eb794b","guard":[["has","yqu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport YQU":"The airport YQU is in Grande Prairie."}}},
{"id":"n-e6012a6b","guard":[["has","csv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code CSV serves which city":"The airport CSV is in Crossville."}}},
{"id":"n-e64b470e","guard":[["has","qig"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport QIG in":"The airport QIG is in Iguatu."}}},
{"id":"n-ea4f5cda","guard":[["has","elt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport ELT in":"The airport ELT is in El-tor."}}},
{"id":"n-f02f2c1a","guard":[["has","yce"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport YCE in":"The airport YCE is in Centralia."}}},
{"id":"n-f15f0105","guard":[["has","mob"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code MOB serves which city":"The airport MOB is in Mobile."}}},
{"id":"n-f1b7a633","guard":[["has","ktr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport KTR in":"The airport KTR is in Katherine."}}},
{"id":"n-f476840f","guard":[["hasAny",["airport","city","frb","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport FRB":"The airport FRB is in Forbes."}}},
{"id":"n-f53be071","guard":[["hasAny",["airport","city","code","fgi","serves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the airport code FGI serves which city":"The airport FGI is in Apia."}}},
{"id":"n-f655fd00","guard":[["hasAny",["airport","city","mxp","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport MXP":"The airport MXP is in Milano."}}},
{"id":"n-f6d183ad","guard":[["has","ful"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code FUL serves which city":"The airport FUL is in Fullerton."}}},
{"id":"n-f83c55ee","guard":[["has","gnb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the city of airport GNB":"The airport GNB is in Grenoble."}}},
{"id":"n-f8fff105","guard":[["has","ymw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport YMW in":"The airport YMW is in Maniwaki."}}},
{"id":"n-f976cb20","guard":[["has","mbi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the airport code MBI serves which city":"The airport MBI is in Mbeya."}}},
{"id":"n-f9acdc31","guard":[["has","rkv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport RKV in":"The airport RKV is in Reykjavik."}}},
{"id":"n-fbb4a832","guard":[["has","jas"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which city is the airport JAS in":"The airport JAS is in Jasper."}}},
{"id":"n-fc00ddd1","guard":[["hasAny",["airport","city","hoa","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport HOA":"The airport HOA is in Hola."}}},
{"id":"n-fe65e6b1","guard":[["hasAny",["airport","city","name","ypm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the city of airport YPM":"The airport YPM is in Pikangikum."}}},
{"id":"n-01c5399f","guard":[["has","scc"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SCC is in Deadhorse."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-023c73d4","guard":[["hasAny",["ayq","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Uluru."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-03899648","guard":[["has","isw"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ISW is in Wisconsin Rapids."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-05c84d73","guard":[["has","ful"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," FUL is in Fullerton."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-05f3cea5","guard":[["has","abf"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ABF is in Abaiang Atoll."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-07b7aa37","guard":[["hasAny",["shortest","shortest one","shortest word","wua"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Wuhai."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-080c74ad","guard":[["hasAny",["dkv","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Docker River."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0b18cec3","guard":[["has","ypx"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," YPX is in Puvirnituq."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0d34a70d","guard":[["has","swx"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SWX is in Shakawe."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0d8afa86","guard":[["hasAny",["abf","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Abaiang Atoll."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0f4c54b9","guard":[["hasAny",["elt","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in El-tor."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1128bcac","guard":[["hasAny",["shortest","shortest one","shortest word","wae"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Wadi-al-dawasir."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-12c2683e","guard":[["has","mbi"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MBI is in Mbeya."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-13f6e497","guard":[["hasAny",["cyb","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Cayman Brac."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-14c17b31","guard":[["hasAny",["shortest","shortest one","shortest word","ypm"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Pikangikum."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-160a4f06","guard":[["hasAny",["mxp","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Milano."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1885721e","guard":[["hasAny",["shortest","shortest one","shortest word","urt"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Surat Thani."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1d5dcf3c","guard":[["hasAny",["isw","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Wisconsin Rapids."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1de28e01","guard":[["hasAny",["rkv","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Reykjavik."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1ea39f76","guard":[["hasAny",["bba","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Balmaceda."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1fb5f721","guard":[["hasAny",["dzn","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Zhezkazgan."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-211b2642","guard":[["hasAny",["khw","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Khwai River."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-22d430f8","guard":[["hasAny",["ajy","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Agadez."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-24ec98e8","guard":[["hasAny",["fma","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Formosa."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-26264b9d","guard":[["has","igb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IGB is in Ingeniero Jacobacci."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-26fbca0e","guard":[["hasAny",["shortest","shortest one","shortest word","tcs"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Truth Or Consequences."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2c42fe4b","guard":[["hasAny",["hds","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Hoedspruit."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3025137a","guard":[["hasAny",["ktr","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Katherine."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-31048dff","guard":[["hasAny",["fmo","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Munster."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-326766e5","guard":[["hasAny",["bge","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Bainbridge."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-32e33238","guard":[["hasAny",["shortest","shortest one","shortest word","vvc"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Villavicencio."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-37c9b574","guard":[["has","wil"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," WIL is in Nairobi."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3a972394","guard":[["hasAny",["shortest","shortest one","shortest word","ssr"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Pentecost Island."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3acef7ca","guard":[["hasAny",["mob","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Mobile."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3b658100","guard":[["hasAny",["shortest","shortest one","shortest word","yko"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Hakkari."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3f176581","guard":[["has","wmb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," WMB is in Warrnambool."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3f86da9a","guard":[["hasAny",["iwj","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Iwami."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3fae75ed","guard":[["has","dkv"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," DKV is in Docker River."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3ffe9ee8","guard":[["has","yko"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," YKO is in Hakkari."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-432763ee","guard":[["hasAny",["grz","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Graz."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-447e1652","guard":[["hasAny",["cfo","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Confresa."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4598ae96","guard":[["hasAny",["gnb","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Grenoble."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-45f92083","guard":[["hasAny",["scc","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Deadhorse."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-46f2d27c","guard":[["hasAny",["lkp","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Lake Placid."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-46f5e264","guard":[["hasAny",["ijk","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Izhevsk."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-49f39cc7","guard":[["has","goa"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GOA is in Genoa."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4a13a287","guard":[["hasAny",["csv","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Crossville."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4d80992c","guard":[["hasAny",["shortest","shortest one","shortest word","yiw"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Yiwu."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-54ae5706","guard":[["hasAny",["dkk","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Dunkirk."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-553e5072","guard":[["has","fgi"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," FGI is in Apia."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-578dd306","guard":[["hasAny",["bih","shortest","shortest one","shortest word"]],["has","city"]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Bishop."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-58718bad","guard":[["has","epl"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," EPL is in Epinal."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-60277ffc","guard":[["hasAny",["shortest","shortest one","shortest word","yqu"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Grande Prairie."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-644de053","guard":[["hasAny",["shortest","shortest one","shortest word","yzw"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Teslin."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6457b2ca","guard":[["hasAny",["rkh","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Rock Hill."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-65ef3dd4","guard":[["hasAny",["qig","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Iguatu."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-67a06d09","guard":[["has","csv"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CSV is in Crossville."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-695c9d9b","guard":[["hasAny",["kmo","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Manokotak."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6a0cf546","guard":[["hasAny",["int","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Winston-salem."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6e8696ec","guard":[["hasAny",["env","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Wendover."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-709961f9","guard":[["hasAny",["shortest","shortest one","shortest word","wmb"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Warrnambool."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-709dbe7c","guard":[["hasAny",["mtm","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Metakatla."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-71f4546f","guard":[["has","gjl"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GJL is in Jijel."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-72a525e5","guard":[["hasAny",["shortest","shortest one","shortest word","yht"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Haines Junction."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-743b301b","guard":[["has","cyb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CYB is in Cayman Brac."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-77f779ab","guard":[["hasAny",["kkh","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Kongiganak."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-789fde6e","guard":[["hasAny",["ata","shortest","shortest one","shortest word"]],["has","airport"]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Anta."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7955cc63","guard":[["hasAny",["bai","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Buenos Aires."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-80b83d7d","guard":[["hasAny",["gha","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Ghardaia."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-80f2db59","guard":[["hasAny",["chy","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Choiseul Bay."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-81ef869b","guard":[["hasAny",["nrk","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Norrkoeping."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-82ea4b06","guard":[["hasAny",["lsf","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Fort Benning."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-872398fa","guard":[["hasAny",["shortest","shortest one","shortest word","whf"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Wadi Halfa."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8acb8469","guard":[["has","nrk"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," NRK is in Norrkoeping."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8bde72a5","guard":[["hasAny",["bah","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Bahrain."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8e354336","guard":[["hasAny",["fgi","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Apia."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-94044961","guard":[["hasAny",["bud","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Budapest."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-979dbfa2","guard":[["has","iev"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IEV is in Kiev."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9a6b52f5","guard":[["hasAny",["iev","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Kiev."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9b50774b","guard":[["hasAny",["shortest","shortest one","shortest word","toi"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Troy."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9c70023a","guard":[["has","whf"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," WHF is in Wadi Halfa."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9d1d977f","guard":[["hasAny",["gpa","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Patras."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9d666e00","guard":[["hasAny",["mth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Marathon."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9d6a4796","guard":[["hasAny",["ggg","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Longview."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9dd529ca","guard":[["has","bnm"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BNM is in Bodinumu."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9eef3be9","guard":[["hasAny",["kzg","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Kitzingen."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a1eecb90","guard":[["hasAny",["gjl","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Jijel."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-aa295389","guard":[["hasAny",["paq","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Palmer."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ac402355","guard":[["hasAny",["epl","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Epinal."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-acbcce20","guard":[["hasAny",["cts","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Sapporo."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ae525b58","guard":[["hasAny",["shortest","shortest one","shortest word","ymw"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Maniwaki."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-afe8fa14","guard":[["has","pdk"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PDK is in Atlanta."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-afef6d3e","guard":[["hasAny",["gdo","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Guasdualito."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b7bd3364","guard":[["hasAny",["mwk","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Anambas Islands."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b9534698","guard":[["hasAny",["hsn","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Zhoushan."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b9e248b9","guard":[["hasAny",["shortest","shortest one","shortest word","zal"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Valdivia."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ba09f122","guard":[["hasAny",["bnm","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Bodinumu."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bdb82a7a","guard":[["hasAny",["jas","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Jasper."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-be6b8541","guard":[["hasAny",["hoa","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Hola."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-be7f6429","guard":[["hasAny",["mbi","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Mbeya."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c12ebcb2","guard":[["has","yht"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," YHT is in Haines Junction."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c4c414c4","guard":[["hasAny",["shortest","shortest one","shortest word","sku"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Skiros."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c4da7327","guard":[["hasAny",["jib","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Djibouti."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c5a58589","guard":[["has","dzn"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," DZN is in Zhezkazgan."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c5bf111c","guard":[["has","cxr"],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CXR is in Nha Trang."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c9a194ad","guard":[["hasAny",["shortest","shortest one","shortest word","ura"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Uralsk."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ca1df418","guard":[["hasAny",["mla","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Malta."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d0043555","guard":[["hasAny",["dbt","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Debre Tabor."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d42fceb2","guard":[["hasAny",["ful","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Fullerton."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d4494ff1","guard":[["hasAny",["pdk","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Atlanta."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d4d7911a","guard":[["hasAny",["drg","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Deering."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d7848422","guard":[["hasAny",["gso","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Greensboro."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d9e8b8cb","guard":[["hasAny",["shortest","shortest one","shortest word","yce"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Centralia."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-dcde6a2b","guard":[["hasAny",["goa","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Genoa."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-dff6b34d","guard":[["has","mob"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MOB is in Mobile."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e183c362","guard":[["hasAny",["shortest","shortest one","shortest word","ypx"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Puvirnituq."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e805c68e","guard":[["hasAny",["frb","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Forbes."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ea125b90","guard":[["hasAny",["cxr","shortest","shortest one","shortest word"]],["has","airport"]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Nha Trang."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ebcc2035","guard":[["hasAny",["shortest","shortest one","shortest word","swx"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Shakawe."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ec2c90b7","guard":[["has","lkp"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," LKP is in Lake Placid."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ec3a9a7a","guard":[["hasAny",["shortest","shortest one","shortest word","wil"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Nairobi."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ecf129bd","guard":[["hasAny",["cca","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Chapacura."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-eda08b0a","guard":[["hasAny",["shortest","shortest one","shortest word","tmc"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Waikabubak-Sumba Island."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-eda94390","guard":[["hasAny",["mdu","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Mendi."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ee461980","guard":[["hasAny",["shortest","shortest one","shortest word","ukt"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Quakertown."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f4de3e3a","guard":[["hasAny",["igb","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Ingeniero Jacobacci."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-faa95b71","guard":[["has","gha"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GHA is in Ghardaia."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-fb2c60c4","guard":[["has","env"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ENV is in Wendover."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-fb69df78","guard":[["has","ata"],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ATA is in Anta."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-fdd78c3d","guard":[["has","cca"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CCA is in Chapacura."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-fe741879","guard":[["hasAny",["prh","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Phrae."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-038841bf","guard":[["hasAny",["item number","nth","position","ssr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SSR is in Pentecost Island."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-09204ea1","guard":[["hasAny",["item number","nth","position","zal"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ZAL is in Valdivia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0e6b9896","guard":[["hasAny",["item number","nth","position","toi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TOI is in Troy."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-10eccaec","guard":[["hasAny",["grz","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GRZ is in Graz."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-146f4202","guard":[["hasAny",["bai","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BAI is in Buenos Aires."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-14d12ea6","guard":[["hasAny",["ggg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GGG is in Longview."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1a14cd6a","guard":[["hasAny",["item number","mla","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MLA is in Malta."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1a1b1e19","guard":[["hasAny",["bud","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BUD is in Budapest."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1a97be0a","guard":[["hasAny",["item number","nth","position","yzw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," YZW is in Teslin."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1f4bea27","guard":[["hasAny",["item number","nth","position","vvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," VVC is in Villavicencio."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-22b3260f","guard":[["hasAny",["hds","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HDS is in Hoedspruit."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-237ec20b","guard":[["hasAny",["item number","ktr","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KTR is in Katherine."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-25522e98","guard":[["hasAny",["item number","kmo","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KMO is in Manokotak."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2f6e1707","guard":[["hasAny",["item number","nth","position","ukt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," UKT is in Quakertown."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-322bec7e","guard":[["hasAny",["item number","jib","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," JIB is in Djibouti."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-324d695a","guard":[["hasAny",["item number","mwk","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MWK is in Anambas Islands."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3b9230d4","guard":[["hasAny",["cfo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CFO is in Confresa."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3bf6d0d8","guard":[["hasAny",["ajy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AJY is in Agadez."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3f27ada6","guard":[["hasAny",["cts","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CTS is in Sapporo."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-41d94e32","guard":[["hasAny",["item number","nth","position","rkv"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," RKV is in Reykjavik."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-426e8372","guard":[["hasAny",["frb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," FRB is in Forbes."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-460975de","guard":[["hasAny",["hoa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HOA is in Hola."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-47deb780","guard":[["hasAny",["gnb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GNB is in Grenoble."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-490ba393","guard":[["hasAny",["item number","jas","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," JAS is in Jasper."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4964e9a4","guard":[["hasAny",["item number","nth","position","tcs"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TCS is in Truth Or Consequences."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4bd1dad6","guard":[["hasAny",["mci","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The airport ",{"slot":0}," is in Kansas ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-4c4dadca","guard":[["hasAny",["chy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CHY is in Choiseul Bay."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-50f2eb1e","guard":[["has","mci"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MCI is in Kansas ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["sense.lastWord"]],"mem":null},
{"id":"n-552d7e7a","guard":[["hasAny",["dkk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," DKK is in Dunkirk."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-567b3e86","guard":[["hasAny",["item number","nth","paq","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PAQ is in Palmer."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-569607e5","guard":[["hasAny",["fmo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," FMO is in Munster."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-57cd3086","guard":[["hasAny",["item number","mtm","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MTM is in Metakatla."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5b7fc4a1","guard":[["hasAny",["elt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ELT is in El-tor."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-602cb702","guard":[["hasAny",["item number","iwj","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IWJ is in Iwami."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-66d9b83f","guard":[["hasAny",["item number","nth","position","rkh"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," RKH is in Rock Hill."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6922defd","guard":[["hasAny",["hsn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HSN is in Zhoushan."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6a7ea68c","guard":[["hasAny",["item number","nth","position","wae"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," WAE is in Wadi-al-dawasir."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6d28a306","guard":[["hasAny",["item number","kkh","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KKH is in Kongiganak."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6d612734","guard":[["hasAny",["item number","nth","position","tmc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TMC is in Waikabubak-Sumba Island."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-700eb56e","guard":[["hasAny",["bah","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BAH is in Bahrain."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-729cdaac","guard":[["hasAny",["item number","mdu","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MDU is in Mendi."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-72edf1fb","guard":[["hasAny",["item number","kzg","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KZG is in Kitzingen."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-79c9cb7c","guard":[["hasAny",["drg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," DRG is in Deering."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7a52ed35","guard":[["hasAny",["fma","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," FMA is in Formosa."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7dc915c0","guard":[["hasAny",["item number","mxp","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MXP is in Milano."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-82e3cbc6","guard":[["hasAny",["item number","nth","position","ura"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," URA is in Uralsk."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-837c8fab","guard":[["hasAny",["item number","nth","position","qig"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," QIG is in Iguatu."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-87056335","guard":[["hasAny",["ijk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IJK is in Izhevsk."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8c0450c5","guard":[["hasAny",["item number","nth","position","yce"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," YCE is in Centralia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9871e852","guard":[["hasAny",["item number","nth","position","yqu"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," YQU is in Grande Prairie."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9ad4259c","guard":[["hasAny",["item number","nth","position","ymw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," YMW is in Maniwaki."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a45c95ee","guard":[["hasAny",["item number","lsf","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," LSF is in Fort Benning."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-af98ec4c","guard":[["hasAny",["dbt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," DBT is in Debre Tabor."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b2854a86","guard":[["hasAny",["item number","nth","position","yiw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," YIW is in Yiwu."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b6a35358","guard":[["hasAny",["item number","khw","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KHW is in Khwai River."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b7705548","guard":[["hasAny",["bba","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BBA is in Balmaceda."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b9b4920c","guard":[["hasAny",["item number","nth","position","sku"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SKU is in Skiros."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bb6b750e","guard":[["hasAny",["bge","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BGE is in Bainbridge."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-bf64f7a7","guard":[["hasAny",["item number","mth","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MTH is in Marathon."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bfada033","guard":[["hasAny",["int","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," INT is in Winston-salem."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c1f4caf9","guard":[["hasAny",["item number","nth","position","urt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," URT is in Surat Thani."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c3dee4c8","guard":[["hasAny",["gso","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GSO is in Greensboro."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d0666a2c","guard":[["hasAny",["ayq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AYQ is in Uluru."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d1aadefb","guard":[["hasAny",["item number","nth","position","wua"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," WUA is in Wuhai."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d68182d9","guard":[["hasAny",["gpa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GPA is in Patras."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d7e4ce79","guard":[["hasAny",["item number","nth","position","ypm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," YPM is in Pikangikum."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e4a71ba5","guard":[["hasAny",["item number","nth","position","prh"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PRH is in Phrae."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f1b116d9","guard":[["hasAny",["gdo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GDO is in Guasdualito."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f8cf4074","guard":[["hasAny",["bih","item number","nth","position"]],["has","city"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BIH is in Bishop."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-01c98317","guard":[["hasAny",["gpa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Patras."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-06bfbb46","guard":[["hasAny",["hoa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hola."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-08e02efd","guard":[["hasAny",["mci","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas City."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-09c80e27","guard":[["hasAny",["item number","nth","position","ypm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pikangikum."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-0bfd1ada","guard":[["hasAny",["abf","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Abaiang Atoll."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0ccc570c","guard":[["hasAny",["dzn","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zhezkazgan."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0cd52399","guard":[["hasAny",["item number","kmo","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Manokotak."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-0d357f4a","guard":[["hasAny",["item number","nth","position","ukt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Quakertown."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-107d8079","guard":[["hasAny",["cyb","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cayman Brac."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-121a0ed7","guard":[["hasAny",["cxr","shortest","shortest one","shortest word"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nha Trang."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-229cb2ba","guard":[["hasAny",["shortest","shortest one","shortest word","wil"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nairobi."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-255a39f2","guard":[["hasAny",["ayq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Uluru."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-263f630e","guard":[["hasAny",["dbt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Debre Tabor."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-2ebeaac9","guard":[["hasAny",["shortest","shortest one","shortest word","yht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Haines Junction."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-335c463c","guard":[["hasAny",["item number","nth","position","yiw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Yiwu."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-3441c6a9","guard":[["hasAny",["iev","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kiev."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-356805fb","guard":[["hasAny",["chy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Choiseul Bay."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-35aadfa4","guard":[["hasAny",["isw","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wisconsin Rapids."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-37cf0ab5","guard":[["hasAny",["shortest","shortest one","shortest word","wmb"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Warrnambool."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-39a77158","guard":[["hasAny",["item number","nth","position","urt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Surat Thani."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-453227eb","guard":[["hasAny",["lkp","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Lake Placid."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-466797a7","guard":[["hasAny",["nrk","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Norrkoeping."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5a2dfec8","guard":[["hasAny",["item number","nth","position","wua"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wuhai."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-5acd862c","guard":[["hasAny",["dkk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Dunkirk."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-5b964288","guard":[["hasAny",["pdk","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Atlanta."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5f213a2f","guard":[["hasAny",["gjl","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Jijel."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-606cd55a","guard":[["hasAny",["ijk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Izhevsk."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-6190443d","guard":[["hasAny",["grz","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Graz."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-6850995a","guard":[["hasAny",["gso","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Greensboro."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-70ec4477","guard":[["hasAny",["item number","nth","position","tmc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Waikabubak-Sumba Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-73b6eaa5","guard":[["hasAny",["bih","item number","nth","position"]],["has","city"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bishop."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-74b6eb44","guard":[["hasAny",["scc","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Deadhorse."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-78ccbfec","guard":[["hasAny",["mbi","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mbeya."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-809747f2","guard":[["hasAny",["shortest","shortest one","shortest word","swx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Shakawe."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-828157ac","guard":[["hasAny",["gha","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ghardaia."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-86451b79","guard":[["hasAny",["item number","mxp","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Milano."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-8692e8b0","guard":[["hasAny",["gnb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grenoble."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-8d7483ed","guard":[["hasAny",["fgi","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Apia."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9098b942","guard":[["hasAny",["csv","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Crossville."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-920d3bc4","guard":[["hasAny",["item number","nth","position","sku"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Skiros."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-92f24582","guard":[["hasAny",["fmo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Munster."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-947051fa","guard":[["hasAny",["ata","shortest","shortest one","shortest word"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Anta."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-982b1990","guard":[["hasAny",["ful","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fullerton."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9b4e7820","guard":[["hasAny",["bah","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bahrain."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-a1d7a947","guard":[["hasAny",["bud","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Budapest."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-aa50f6ee","guard":[["hasAny",["item number","mth","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Marathon."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-aad7739d","guard":[["hasAny",["cca","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Chapacura."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b1bda740","guard":[["hasAny",["epl","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Epinal."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-babf1a8e","guard":[["hasAny",["dkv","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Docker River."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c2678d98","guard":[["hasAny",["item number","nth","position","zal"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Valdivia."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-c5579c8c","guard":[["hasAny",["item number","mla","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Malta."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-cb26c171","guard":[["hasAny",["frb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Forbes."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-cd70b249","guard":[["hasAny",["igb","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ingeniero Jacobacci."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ced42912","guard":[["hasAny",["goa","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Genoa."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d0bbe323","guard":[["hasAny",["item number","nth","position","yqu"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grande Prairie."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-d335e6ad","guard":[["hasAny",["shortest","shortest one","shortest word","yko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hakkari."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e0b532c6","guard":[["hasAny",["bai","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Buenos Aires."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-e1cc3617","guard":[["hasAny",["cfo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Confresa."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-ead0adb5","guard":[["hasAny",["shortest","shortest one","shortest word","whf"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wadi Halfa."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f65948d5","guard":[["hasAny",["shortest","shortest one","shortest word","ypx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Puvirnituq."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f676eb56","guard":[["hasAny",["item number","nth","position","prh"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Phrae."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-fae99ecd","guard":[["hasAny",["mob","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mobile."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fb874e38","guard":[["hasAny",["bnm","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bodinumu."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fd32b35f","guard":[["hasAny",["env","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wendover."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fd582e90","guard":[["hasAny",["item number","lsf","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fort Benning."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-ff575f18","guard":[["hasAny",["item number","nth","position","ssr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pentecost Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-0017d464","guard":[["hasAny",["all caps","capital letters","capitals","ijk","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Izhevsk."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-001f276d","guard":[["hasAny",["grz","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Graz."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-00868208","guard":[["hasAny",["dbt","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Debre Tabor."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-011b6a73","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ful","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fullerton."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0197bf3e","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","wua"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wuhai."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-034e80de","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","tcs"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Truth Or Consequences."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-04403c13","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","ssr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pentecost Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-04838a6b","guard":[["hasAny",["cyb","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cayman Brac."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-049f3a98","guard":[["hasAny",["ful","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fullerton."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0519f5f4","guard":[["hasAny",["gpa","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Patras."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-05629fcd","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","ura"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Uralsk."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0599cf44","guard":[["hasAny",["env","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wendover."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-05a352c5","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","ura"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Uralsk."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-06d9e611","guard":[["hasAny",["ggg","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Longview."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-06e6f62a","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","zal"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Valdivia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-07cc56e5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pdk","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Atlanta."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0889e9b0","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","ypm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pikangikum."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0975fd2c","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","ymw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Maniwaki."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0a377837","guard":[["hasAny",["bih","item number","nth","position","shortest","shortest one","shortest word"]],["has","city"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bishop."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0aa0ddd1","guard":[["hasAny",["ayq","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Uluru."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0b8aec49","guard":[["hasAny",["invert case","item number","mth","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Marathon."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0d92f7d1","guard":[["hasAny",["bah","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bahrain."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0e43b270","guard":[["hasAny",["item number","jib","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Djibouti."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0e8feb73","guard":[["hasAny",["item number","lower case","lowercase","lsf","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fort Benning."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1066d518","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","ssr","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pentecost Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-10ee3048","guard":[["hasAny",["epl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Epinal."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-11117be9","guard":[["hasAny",["item number","mxp","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Milano."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-11b0a2ca","guard":[["hasAny",["item number","nth","position","rkv","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Reykjavik."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1286745b","guard":[["hasAny",["item number","kzg","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kitzingen."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-12adc61a","guard":[["hasAny",["item number","nth","position","rkh","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Rock Hill."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-13bd1714","guard":[["hasAny",["bah","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bahrain."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-13ee4bd2","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","zal"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Valdivia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-14e22c06","guard":[["hasAny",["capitalise","capitalize","capitalize each word","shortest","shortest one","shortest word","title case","wil"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nairobi."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1501f9de","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Haines Junction."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1560d5ed","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","wil"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nairobi."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-163bc202","guard":[["hasAny",["elt","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in El-tor."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-164b63ab","guard":[["hasAny",["bah","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bahrain."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1826bf67","guard":[["hasAny",["fmo","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Munster."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-18434348","guard":[["hasAny",["int","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Winston-salem."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1847fdc8","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","vvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Villavicencio."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-18b6487b","guard":[["hasAny",["item number","mob","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mobile."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-196e7d20","guard":[["hasAny",["igb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ingeniero Jacobacci."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-19d943e2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cxr","shortest","shortest one","shortest word","title case"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nha Trang."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1a754305","guard":[["hasAny",["item number","lkp","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Lake Placid."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1b2af693","guard":[["hasAny",["bih","item number","nth","position","shortest","shortest one","shortest word"]],["has","city"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bishop."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1b365a8c","guard":[["hasAny",["ful","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fullerton."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1bc184b0","guard":[["hasAny",["ajy","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Agadez."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1bf2c8cc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dzn","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zhezkazgan."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1c024e7d","guard":[["hasAny",["item number","nth","position","rkh","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Rock Hill."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1c9df47c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","shortest","shortest one","shortest word","title case","yko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hakkari."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1ca37476","guard":[["hasAny",["abf","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Abaiang Atoll."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1e213b17","guard":[["hasAny",["bge","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bainbridge."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1e624519","guard":[["hasAny",["igb","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ingeniero Jacobacci."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1e94387f","guard":[["hasAny",["invert case","item number","nth","position","ssr","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pentecost Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1ef3ca69","guard":[["hasAny",["frb","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Forbes."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1f425bf7","guard":[["hasAny",["epl","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Epinal."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-217cb41b","guard":[["hasAny",["hds","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hoedspruit."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2190b88f","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","yqu"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grande Prairie."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-235c389f","guard":[["hasAny",["bih","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","city"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bishop."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-24a2f864","guard":[["hasAny",["item number","nth","position","wil"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nairobi."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-24ada469","guard":[["hasAny",["item number","nth","pdk","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Atlanta."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-24f8bad3","guard":[["hasAny",["invert case","shortest","shortest one","shortest word","swap case","toggle case","wmb"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Warrnambool."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-27f4ba49","guard":[["hasAny",["item number","mdu","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mendi."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-28080f7f","guard":[["hasAny",["bai","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Buenos Aires."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-28b34dae","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","ypm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pikangikum."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2a5699ad","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","swx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Shakawe."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2a763020","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","zal"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Valdivia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2b01b783","guard":[["hasAny",["cts","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Sapporo."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2b944755","guard":[["hasAny",["item number","mbi","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mbeya."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2cd6ab97","guard":[["hasAny",["all caps","capital letters","capitals","grz","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Graz."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-2da5e0f5","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yzw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Teslin."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2ec7af8a","guard":[["hasAny",["gjl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Jijel."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2efc2128","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","ymw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Maniwaki."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2f1c2241","guard":[["hasAny",["item number","ktr","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Katherine."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2f425e86","guard":[["hasAny",["gdo","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Guasdualito."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2fdfceb7","guard":[["hasAny",["hoa","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hola."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-304b2765","guard":[["hasAny",["all caps","bud","capital letters","capitals","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Budapest."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-31078bdf","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","yiw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Yiwu."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-33938da5","guard":[["hasAny",["cyb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cayman Brac."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-33a9675c","guard":[["hasAny",["bih","invert case","item number","nth","position","swap case","toggle case"]],["has","city"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bishop."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-33ac86ac","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mth","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Marathon."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3554aa25","guard":[["hasAny",["item number","nth","position","yht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Haines Junction."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-362924ff","guard":[["hasAny",["invert case","mob","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mobile."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-362f6a2c","guard":[["hasAny",["ata","capitalise","capitalize","capitalize each word","shortest","shortest one","shortest word","title case"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Anta."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3673b5b7","guard":[["hasAny",["goa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Genoa."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-378189ba","guard":[["hasAny",["csv","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Crossville."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-385b936d","guard":[["hasAny",["all caps","capital letters","capitals","gpa","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Patras."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-39070e9a","guard":[["hasAny",["bnm","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bodinumu."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3929619c","guard":[["hasAny",["int","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Winston-salem."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-393b1b10","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","wmb"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Warrnambool."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-39db9206","guard":[["hasAny",["cxr","item number","nth","position"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nha Trang."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3a9880c9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mob","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mobile."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3b1d0c09","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ijk","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Izhevsk."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3b749121","guard":[["hasAny",["item number","mth","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Marathon."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3ba7cbed","guard":[["hasAny",["cxr","item number","nth","position"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nha Trang."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-3babf513","guard":[["hasAny",["igb","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ingeniero Jacobacci."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3c93aaae","guard":[["hasAny",["cfo","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Confresa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3c9d5178","guard":[["hasAny",["item number","kmo","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Manokotak."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3d3b2f70","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fgi","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Apia."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3daebd88","guard":[["hasAny",["gso","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Greensboro."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3f143bba","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lkp","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Lake Placid."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3f37ef47","guard":[["hasAny",["dzn","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zhezkazgan."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3fa1ffe9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","frb","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Forbes."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-411cb82e","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","ssr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pentecost Island."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-441ee72a","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","sku"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Skiros."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-442e604b","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","wua"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wuhai."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-45081bb2","guard":[["hasAny",["cfo","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Confresa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-454265cb","guard":[["hasAny",["dkk","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Dunkirk."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-45a7d949","guard":[["hasAny",["item number","mob","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mobile."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4606e444","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","yqu"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grande Prairie."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4671c637","guard":[["hasAny",["elt","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in El-tor."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4676940d","guard":[["hasAny",["item number","ktr","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Katherine."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4682cf83","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","lsf","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fort Benning."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-47534a51","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cyb","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cayman Brac."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-47cd9046","guard":[["hasAny",["invert case","isw","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wisconsin Rapids."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-47d57201","guard":[["hasAny",["grz","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Graz."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-48282475","guard":[["hasAny",["ata","item number","nth","position"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Anta."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-4857fdb4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","sku","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Skiros."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-48ad75e7","guard":[["hasAny",["csv","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Crossville."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-492d5d88","guard":[["hasAny",["item number","kkh","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kongiganak."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-497d9992","guard":[["hasAny",["ggg","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Longview."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-49f43634","guard":[["hasAny",["capitalise","capitalize","capitalize each word","goa","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Genoa."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4b16ecbd","guard":[["hasAny",["item number","iwj","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Iwami."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4b9b59b4","guard":[["hasAny",["goa","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Genoa."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4bb2174c","guard":[["hasAny",["gnb","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grenoble."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4c190b45","guard":[["hasAny",["capitalise","capitalize","capitalize each word","shortest","shortest one","shortest word","title case","whf"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wadi Halfa."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4cbeb0bd","guard":[["hasAny",["gha","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ghardaia."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-4d732c8b","guard":[["hasAny",["item number","nth","position","prh","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Phrae."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4d764208","guard":[["hasAny",["item number","mxp","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Milano."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4d91a836","guard":[["hasAny",["hoa","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hola."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4df9eadd","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yiw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Yiwu."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4ee8436c","guard":[["hasAny",["item number","nth","position","wil"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nairobi."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4efeb5ac","guard":[["hasAny",["hds","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hoedspruit."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4f1cdf53","guard":[["hasAny",["invert case","nrk","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Norrkoeping."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4f695fe7","guard":[["hasAny",["item number","nth","position","prh","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Phrae."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4fb00141","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mxp","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Milano."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-50f16fec","guard":[["hasAny",["iev","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kiev."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-52aef1c6","guard":[["hasAny",["gso","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Greensboro."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-531c472e","guard":[["hasAny",["item number","nth","position","whf"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wadi Halfa."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5372f548","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","wua"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wuhai."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-545da7be","guard":[["hasAny",["dzn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zhezkazgan."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5498dc94","guard":[["hasAny",["all caps","capital letters","capitals","dkk","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Dunkirk."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-553af762","guard":[["hasAny",["item number","nth","position","wmb"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Warrnambool."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-5563d0eb","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","wua"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wuhai."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-55d7e516","guard":[["hasAny",["item number","kkh","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kongiganak."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-56271174","guard":[["hasAny",["ayq","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Uluru."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-56c3fbc0","guard":[["hasAny",["bba","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Balmaceda."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5801a14a","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","sku","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Skiros."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-58185bd6","guard":[["hasAny",["all caps","capital letters","capitals","frb","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Forbes."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-58a5d729","guard":[["hasAny",["bud","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Budapest."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-58b35f1c","guard":[["hasAny",["abf","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Abaiang Atoll."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-59ef8eff","guard":[["hasAny",["item number","nth","position","scc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Deadhorse."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5b15617d","guard":[["hasAny",["item number","nrk","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Norrkoeping."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-5b40d322","guard":[["hasAny",["all caps","capital letters","capitals","item number","mxp","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Milano."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-5bb77ca4","guard":[["hasAny",["iev","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kiev."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-5c3efebb","guard":[["hasAny",["fmo","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Munster."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5d13554c","guard":[["hasAny",["ful","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fullerton."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-5dcda9d8","guard":[["hasAny",["bud","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Budapest."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5ddec8dc","guard":[["hasAny",["bnm","capitalise","capitalize","capitalize each word","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bodinumu."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5de93999","guard":[["hasAny",["invert case","shortest","shortest one","shortest word","swap case","toggle case","yko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hakkari."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5e77a02c","guard":[["hasAny",["bai","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Buenos Aires."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5e7e96df","guard":[["hasAny",["item number","nth","paq","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Palmer."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5ea95943","guard":[["hasAny",["item number","mla","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Malta."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5f2f7936","guard":[["hasAny",["bih","item number","lower case","lowercase","nth","position","small letters"]],["has","city"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bishop."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-61d66f51","guard":[["hasAny",["item number","nth","position","rkv","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Reykjavik."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-61f9fdc8","guard":[["hasAny",["chy","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Choiseul Bay."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-626014bb","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","ukt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Quakertown."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-630fe643","guard":[["hasAny",["all caps","capital letters","capitals","item number","kmo","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Manokotak."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-636f5d0d","guard":[["hasAny",["all caps","bah","capital letters","capitals","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bahrain."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-63962eeb","guard":[["hasAny",["bai","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Buenos Aires."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-655a87db","guard":[["hasAny",["goa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Genoa."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-662815d2","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","ssr","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pentecost Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-66c70843","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","upper case","uppercase","wua"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wuhai."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-67412bae","guard":[["hasAny",["bnm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bodinumu."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-688a5cb8","guard":[["hasAny",["item number","mla","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Malta."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-688d0c82","guard":[["hasAny",["item number","nth","position","whf"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wadi Halfa."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-68c0b0e5","guard":[["hasAny",["bba","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Balmaceda."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-69377458","guard":[["hasAny",["item number","kmo","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Manokotak."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-69463ba5","guard":[["hasAny",["item number","iwj","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Iwami."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6976c40c","guard":[["hasAny",["ata","item number","nth","position","shortest","shortest one","shortest word"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Anta."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6a476ee8","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","urt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Surat Thani."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6a6ad177","guard":[["hasAny",["dzn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zhezkazgan."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-6a712276","guard":[["hasAny",["bge","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bainbridge."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6b573c1f","guard":[["hasAny",["env","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wendover."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-6bf728a9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hoa","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hola."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6c72de25","guard":[["hasAny",["invert case","shortest","shortest one","shortest word","swap case","toggle case","ypx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Puvirnituq."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6d7bad75","guard":[["hasAny",["all caps","capital letters","capitals","hoa","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hola."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-6e622b21","guard":[["hasAny",["dkv","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Docker River."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-6f58c531","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","ypm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pikangikum."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-70934a5f","guard":[["hasAny",["item number","jas","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Jasper."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7132ecb3","guard":[["hasAny",["gjl","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Jijel."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-71de3a33","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cfo","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Confresa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7212a60f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","chy","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Choiseul Bay."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-722d91da","guard":[["hasAny",["ful","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fullerton."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-723d9823","guard":[["hasAny",["cyb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cayman Brac."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-72d7f4a4","guard":[["hasAny",["all caps","capital letters","capitals","gso","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Greensboro."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-738cda82","guard":[["hasAny",["invert case","item number","nth","position","prh","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Phrae."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-73b0dbe9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","shortest","shortest one","shortest word","swx","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Shakawe."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-73c18243","guard":[["hasAny",["item number","mwk","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Anambas Islands."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-744cfc6b","guard":[["hasAny",["all caps","capital letters","capitals","chy","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Choiseul Bay."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-753b9a6d","guard":[["hasAny",["item number","lsf","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fort Benning."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-759ad3dd","guard":[["hasAny",["invert case","item number","nth","position","swap case","tmc","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Waikabubak-Sumba Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-75aebcac","guard":[["hasAny",["invert case","lkp","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Lake Placid."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-75fc69a5","guard":[["hasAny",["drg","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Deering."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-76388d44","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gha","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ghardaia."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-78ad5f9e","guard":[["hasAny",["gso","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Greensboro."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-78e39778","guard":[["hasAny",["item number","lsf","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fort Benning."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-79132029","guard":[["hasAny",["invert case","item number","kmo","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Manokotak."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7a1b419e","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","ypm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pikangikum."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7a27425e","guard":[["hasAny",["invert case","shortest","shortest one","shortest word","swap case","toggle case","wil"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nairobi."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7a4732bf","guard":[["hasAny",["ayq","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Uluru."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7ac75fd3","guard":[["hasAny",["item number","nth","position","qig","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Iguatu."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7b6546d2","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","upper case","uppercase","ypm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pikangikum."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-7dc34e8d","guard":[["hasAny",["abf","capitalise","capitalize","capitalize each word","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Abaiang Atoll."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7f3e03df","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","kmo","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Manokotak."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-800aca4d","guard":[["hasAny",["bai","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Buenos Aires."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-82a88ff0","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","upper case","uppercase","yiw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Yiwu."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-82bc86a0","guard":[["hasAny",["hoa","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hola."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-83622d7d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fmo","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Munster."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-83a6e2cf","guard":[["hasAny",["chy","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Choiseul Bay."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-83e1e114","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","ssr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pentecost Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-83e34da5","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","toi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Troy."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8508afcd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gso","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Greensboro."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8739eecc","guard":[["hasAny",["csv","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Crossville."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-87cc031e","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","wae"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wadi-al-dawasir."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-87e07e8f","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","urt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Surat Thani."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-88063004","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yce"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Centralia."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-892f6fbc","guard":[["hasAny",["fma","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Formosa."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-89707e8e","guard":[["hasAny",["fmo","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Munster."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8a1dd814","guard":[["hasAny",["item number","lower case","lowercase","nth","position","sku","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Skiros."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8b1d92c2","guard":[["hasAny",["hoa","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hola."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8be390ba","guard":[["hasAny",["cca","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Chapacura."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8c057513","guard":[["hasAny",["item number","mtm","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Metakatla."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8c1b9b17","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","tmc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Waikabubak-Sumba Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8c22f218","guard":[["hasAny",["gnb","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grenoble."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8e574e77","guard":[["hasAny",["invert case","shortest","shortest one","shortest word","swap case","swx","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Shakawe."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8e5d1c3c","guard":[["hasAny",["bnm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bodinumu."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8ee083e2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gjl","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Jijel."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8f2266cf","guard":[["hasAny",["fgi","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Apia."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8f64eb34","guard":[["hasAny",["capitalise","capitalize","capitalize each word","epl","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Epinal."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8f696362","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nrk","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Norrkoeping."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8f924893","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","whf"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wadi Halfa."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-917061c5","guard":[["hasAny",["item number","nth","position","qig","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Iguatu."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-92e721be","guard":[["hasAny",["fgi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Apia."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-92ef100a","guard":[["hasAny",["gha","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ghardaia."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-934cf8d0","guard":[["hasAny",["drg","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Deering."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-943a36c5","guard":[["hasAny",["invert case","item number","nth","position","sku","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Skiros."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-94ef3d54","guard":[["hasAny",["invert case","item number","mxp","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Milano."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9580d0e7","guard":[["hasAny",["all caps","ayq","capital letters","capitals","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Uluru."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-969be525","guard":[["hasAny",["dkv","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Docker River."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-96ac8fb6","guard":[["hasAny",["cyb","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cayman Brac."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-97622ae7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mbi","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mbeya."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-981f5634","guard":[["hasAny",["ijk","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Izhevsk."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-98af4eeb","guard":[["hasAny",["all caps","capital letters","capitals","item number","mth","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Marathon."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-98d05434","guard":[["hasAny",["capitalise","capitalize","capitalize each word","igb","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ingeniero Jacobacci."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-99aaa614","guard":[["hasAny",["bnm","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bodinumu."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9a2f71d4","guard":[["hasAny",["isw","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wisconsin Rapids."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9a51e081","guard":[["hasAny",["isw","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wisconsin Rapids."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-9a65cb0a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cca","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Chapacura."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9b5102e9","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","ypx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Puvirnituq."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9c62b545","guard":[["hasAny",["capitalise","capitalize","capitalize each word","shortest","shortest one","shortest word","title case","wmb"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Warrnambool."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9cc265ec","guard":[["hasAny",["capitalise","capitalize","capitalize each word","iev","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kiev."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9e5f1137","guard":[["hasAny",["fgi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Apia."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9ec86587","guard":[["hasAny",["item number","nth","position","yht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Haines Junction."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-9f8e2224","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yqu"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grande Prairie."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a0dabc2d","guard":[["hasAny",["item number","nth","pdk","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Atlanta."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a19ae062","guard":[["hasAny",["item number","lkp","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Lake Placid."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-a1cff484","guard":[["hasAny",["all caps","capital letters","capitals","fmo","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Munster."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-a28b4286","guard":[["hasAny",["gha","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ghardaia."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a3ab8c00","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","prh","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Phrae."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a4228f43","guard":[["hasAny",["iev","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kiev."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a47f233a","guard":[["hasAny",["epl","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Epinal."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a4b07a7f","guard":[["hasAny",["invert case","pdk","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Atlanta."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a57d8d11","guard":[["hasAny",["grz","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Graz."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a6312229","guard":[["hasAny",["cxr","item number","nth","position","shortest","shortest one","shortest word"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nha Trang."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a67d48f9","guard":[["hasAny",["cca","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Chapacura."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a6e46098","guard":[["hasAny",["csv","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Crossville."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a74eba14","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","upper case","uppercase","zal"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Valdivia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-a83ca6fa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","env","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wendover."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a95315a0","guard":[["hasAny",["epl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Epinal."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ac3f03f1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mla","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Malta."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ac913e5e","guard":[["hasAny",["fmo","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Munster."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-acda5824","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yiw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Yiwu."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-adab572e","guard":[["hasAny",["item number","mbi","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mbeya."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-adae5510","guard":[["hasAny",["cxr","invert case","shortest","shortest one","shortest word","swap case","toggle case"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nha Trang."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ae0387fc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","isw","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wisconsin Rapids."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ae2600ab","guard":[["hasAny",["item number","mtm","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Metakatla."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ae2e4439","guard":[["hasAny",["all caps","capital letters","capitals","item number","mla","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Malta."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-ae594bc8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gpa","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Patras."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-aeb6c0a1","guard":[["hasAny",["item number","lower case","lowercase","mla","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Malta."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-aed40edb","guard":[["hasAny",["cfo","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Confresa."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-af90e096","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","yiw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Yiwu."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b0afa9d8","guard":[["hasAny",["dbt","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Debre Tabor."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b0fcff70","guard":[["hasAny",["ijk","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Izhevsk."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b10edf60","guard":[["hasAny",["iev","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kiev."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b1505c4b","guard":[["hasAny",["item number","nth","position","swx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Shakawe."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b1508e3e","guard":[["hasAny",["gpa","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Patras."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b163a9d8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","urt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Surat Thani."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b17adb34","guard":[["hasAny",["capitalise","capitalize","capitalize each word","scc","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Deadhorse."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b23844cb","guard":[["hasAny",["gpa","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Patras."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b2e36c61","guard":[["hasAny",["item number","nth","position","scc","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Deadhorse."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b393c4f6","guard":[["hasAny",["all caps","capital letters","capitals","item number","lsf","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fort Benning."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b3da79a8","guard":[["hasAny",["gdo","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Guasdualito."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b48e078a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","csv","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Crossville."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b51c654d","guard":[["hasAny",["gnb","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grenoble."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b56da58e","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","toi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Troy."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b5e7a65e","guard":[["hasAny",["dzn","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zhezkazgan."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b71128e0","guard":[["hasAny",["item number","jib","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Djibouti."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b7141339","guard":[["hasAny",["abf","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Abaiang Atoll."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-b731e7b6","guard":[["hasAny",["cca","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Chapacura."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b76bf10a","guard":[["hasAny",["item number","nrk","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Norrkoeping."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b7e55110","guard":[["hasAny",["invert case","shortest","shortest one","shortest word","swap case","toggle case","whf"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wadi Halfa."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b842dffa","guard":[["hasAny",["env","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wendover."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b8d24f86","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","yqu"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grande Prairie."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b9504b69","guard":[["hasAny",["gjl","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Jijel."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b96e19e4","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","zal"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Valdivia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b98185e8","guard":[["hasAny",["invert case","mbi","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mbeya."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ba8ba69c","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","ukt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Quakertown."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bafb0422","guard":[["hasAny",["frb","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Forbes."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bb96e0e7","guard":[["hasAny",["item number","nth","paq","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Palmer."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bbc64cea","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dkv","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Docker River."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bc22b33f","guard":[["hasAny",["bud","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Budapest."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bca6ae47","guard":[["hasAny",["item number","nth","position","yko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hakkari."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-be490bff","guard":[["hasAny",["ayq","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Uluru."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c00df87d","guard":[["hasAny",["invert case","shortest","shortest one","shortest word","swap case","toggle case","yht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Haines Junction."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c027ca77","guard":[["hasAny",["dkk","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Dunkirk."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c076b659","guard":[["hasAny",["env","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wendover."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c1769c5f","guard":[["hasAny",["all caps","capital letters","capitals","dbt","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Debre Tabor."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-c20f0c6b","guard":[["hasAny",["item number","nth","pdk","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Atlanta."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c21a9c5a","guard":[["hasAny",["ayq","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Uluru."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c22e4b37","guard":[["hasAny",["igb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ingeniero Jacobacci."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c3818bf7","guard":[["hasAny",["isw","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wisconsin Rapids."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c3bcefbd","guard":[["hasAny",["ajy","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Agadez."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c3be034e","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","tmc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Waikabubak-Sumba Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c3da1d5e","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","zal"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Valdivia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c41d1004","guard":[["hasAny",["all caps","capital letters","capitals","cfo","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Confresa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-c47b84fa","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","sku"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Skiros."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c4dc18b4","guard":[["hasAny",["frb","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Forbes."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c5c06ed9","guard":[["hasAny",["fma","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Formosa."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c5e9724b","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","ypm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pikangikum."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c76957f2","guard":[["hasAny",["hsn","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zhoushan."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c79685c5","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","ukt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Quakertown."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c8fad252","guard":[["hasAny",["gnb","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grenoble."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c9df6a8d","guard":[["hasAny",["all caps","bih","capital letters","capitals","item number","nth","position","upper case","uppercase"]],["has","city"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bishop."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-cad7a401","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hakkari."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cb0e2a46","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","ukt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Quakertown."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cbcf5a67","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dbt","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Debre Tabor."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cc20c347","guard":[["hasAny",["item number","nrk","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Norrkoeping."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-cc2c2105","guard":[["hasAny",["invert case","item number","mla","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Malta."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-cce2f701","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","prh","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Phrae."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-cd2aedbd","guard":[["hasAny",["item number","nth","position","swx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Shakawe."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-cd4e92d2","guard":[["hasAny",["hsn","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zhoushan."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cd945388","guard":[["hasAny",["bah","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bahrain."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cdfbd2da","guard":[["hasAny",["chy","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Choiseul Bay."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d0376c1a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dkk","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Dunkirk."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d1eeae6f","guard":[["hasAny",["item number","mwk","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Anambas Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d258fc67","guard":[["hasAny",["dkv","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Docker River."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d3758337","guard":[["hasAny",["ata","item number","nth","position"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Anta."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d3c5b224","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","wua"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wuhai."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d3ce1028","guard":[["hasAny",["dkk","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Dunkirk."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d47b3018","guard":[["hasAny",["gha","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ghardaia."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d48d4397","guard":[["hasAny",["item number","mob","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mobile."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d49fd129","guard":[["hasAny",["gjl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Jijel."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-d51d162f","guard":[["hasAny",["gpa","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Patras."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d541c177","guard":[["hasAny",["item number","kmo","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Manokotak."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d68731d3","guard":[["hasAny",["ijk","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Izhevsk."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d6acd7fc","guard":[["hasAny",["item number","nth","position","wmb"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Warrnambool."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d6aee830","guard":[["hasAny",["item number","lkp","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Lake Placid."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d7b92893","guard":[["hasAny",["invert case","item number","lsf","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fort Benning."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-da2c146a","guard":[["hasAny",["cfo","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Confresa."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-da8a38fb","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","urt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Surat Thani."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-db04d332","guard":[["hasAny",["item number","mdu","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mendi."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-dc113865","guard":[["hasAny",["all caps","bai","capital letters","capitals","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Buenos Aires."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-dc5755c6","guard":[["hasAny",["item number","lower case","lowercase","mxp","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Milano."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-dd991440","guard":[["hasAny",["item number","nth","position","yko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hakkari."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ddca75e0","guard":[["hasAny",["all caps","capital letters","capitals","gnb","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grenoble."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-de3efa47","guard":[["hasAny",["item number","nth","position","scc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Deadhorse."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-debc672f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","shortest","shortest one","shortest word","title case","yht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Haines Junction."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-df7bb575","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","yiw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Yiwu."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e048e79a","guard":[["hasAny",["ijk","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Izhevsk."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e2a2c153","guard":[["hasAny",["item number","lower case","lowercase","nth","position","prh","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Phrae."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e39a5a59","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","urt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Surat Thani."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e525b89e","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yzw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Teslin."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e5edb6ae","guard":[["hasAny",["goa","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Genoa."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e73b118a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","ukt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Quakertown."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e79a3dc8","guard":[["hasAny",["chy","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Choiseul Bay."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e81c9654","guard":[["hasAny",["item number","nth","position","ypx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Puvirnituq."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e8db8aea","guard":[["hasAny",["dbt","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Debre Tabor."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e99ae50e","guard":[["hasAny",["item number","lower case","lowercase","mth","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Marathon."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ea010a77","guard":[["hasAny",["abf","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Abaiang Atoll."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ea150b83","guard":[["hasAny",["bai","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Buenos Aires."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ea721261","guard":[["hasAny",["item number","jas","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Jasper."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-eaeb917d","guard":[["hasAny",["grz","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Graz."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-eb0c244f","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","ukt","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Quakertown."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-eb78f336","guard":[["hasAny",["item number","khw","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Khwai River."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ebb6e968","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","tmc","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Waikabubak-Sumba Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-ebe35d97","guard":[["hasAny",["dkv","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Docker River."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ec1a2d32","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","tmc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Waikabubak-Sumba Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-eff8956e","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","wae"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wadi-al-dawasir."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f21c866b","guard":[["hasAny",["item number","mth","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Marathon."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f24d0f0a","guard":[["hasAny",["bud","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Budapest."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f273cb7c","guard":[["hasAny",["ata","invert case","shortest","shortest one","shortest word","swap case","toggle case"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Anta."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f4197d7f","guard":[["hasAny",["item number","kzg","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kitzingen."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f43fd59e","guard":[["hasAny",["frb","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Forbes."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f4beba7c","guard":[["hasAny",["cca","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Chapacura."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-f4e81d77","guard":[["hasAny",["item number","khw","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Khwai River."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f559797b","guard":[["hasAny",["dkk","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Dunkirk."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f5d147f8","guard":[["hasAny",["bud","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Budapest."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f5e18358","guard":[["hasAny",["capitalise","capitalize","capitalize each word","shortest","shortest one","shortest word","title case","ypx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Puvirnituq."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f60955f8","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","tmc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Waikabubak-Sumba Island."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f62b9eff","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yqu"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grande Prairie."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f62fb5d7","guard":[["hasAny",["invert case","scc","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Deadhorse."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f8cb7151","guard":[["hasAny",["mci","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-f9459501","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yce"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Centralia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f95606c2","guard":[["hasAny",["cts","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Sapporo."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fa75f4f6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gnb","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grenoble."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fa8a67a2","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","upper case","uppercase","yqu"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grande Prairie."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-fb3deff1","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","tcs"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Truth Or Consequences."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fb5139b2","guard":[["hasAny",["gso","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Greensboro."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fb758dab","guard":[["hasAny",["capitalise","capitalize","capitalize each word","grz","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Graz."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fbe6d52a","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","vvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Villavicencio."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fcd51b25","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","upper case","uppercase","urt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Surat Thani."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-fd29e8f4","guard":[["hasAny",["item number","mbi","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mbeya."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-fe5e7521","guard":[["hasAny",["fgi","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Apia."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ffe97cb1","guard":[["hasAny",["dbt","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Debre Tabor."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-fffb40c7","guard":[["hasAny",["item number","nth","position","ypx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Puvirnituq."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-fffc1180","guard":[["hasAny",["bah","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bahrain."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-00cd8fe2","guard":[["hasAny",["item number","nth","position","wae"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wadi-al-dawasir."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-01144abe","guard":[["hasAny",["each word","item number","nth","position","split into words","tmc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Waikabubak-Sumba Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0221aed6","guard":[["hasAny",["bnm","each word","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bodinumu."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-029c22e0","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","yht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Haines Junction."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-03bf407e","guard":[["hasAny",["ata","each word","shortest","shortest one","shortest word","split into words"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Anta."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-03cdb733","guard":[["hasAny",["each word","gha","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ghardaia."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-03f69175","guard":[["hasAny",["each word","gjl","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Jijel."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-045a0db1","guard":[["hasAny",["cca","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Chapacura."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0694c7ed","guard":[["hasAny",["each word","item number","nth","position","split into words","ukt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Quakertown."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-07321422","guard":[["hasAny",["ayq","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Uluru."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0a3a9c08","guard":[["hasAny",["first n","shortest","shortest one","shortest word","take","yko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hakkari."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0b7686da","guard":[["hasAny",["dkk","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Dunkirk."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0b88c565","guard":[["hasAny",["each word","item number","nth","position","prh","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Phrae."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0bb15a2b","guard":[["hasAny",["item number","nth","position","yzw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Teslin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0c905d97","guard":[["hasAny",["each word","item number","nth","position","split into words","ypm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pikangikum."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0c908cd7","guard":[["hasAny",["invert case","mci","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0ea81bb5","guard":[["hasAny",["ijk","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Izhevsk."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-0f4cd4e7","guard":[["hasAny",["each word","ful","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fullerton."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1021d8fe","guard":[["hasAny",["first n","shortest","shortest one","shortest word","take","ypx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Puvirnituq."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-126bae96","guard":[["hasAny",["ata","each word","shortest","shortest one","shortest word","split into words"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Anta."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-13c6ac65","guard":[["hasAny",["item number","mci","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-146c6b94","guard":[["hasAny",["chy","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Choiseul Bay."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-148c317f","guard":[["hasAny",["each word","gso","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Greensboro."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-14c951c8","guard":[["hasAny",["dzn","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zhezkazgan."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1727dc74","guard":[["hasAny",["first n","iev","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kiev."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-17f6946b","guard":[["hasAny",["each word","fgi","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Apia."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-181d55ef","guard":[["hasAny",["dkv","each word","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Docker River."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-18831427","guard":[["hasAny",["first n","shortest","shortest one","shortest word","take","ypx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Puvirnituq."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-194cd6a6","guard":[["hasAny",["each word","item number","nth","position","sku","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Skiros."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1964d626","guard":[["hasAny",["grz","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Graz."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-1a4f0be3","guard":[["hasAny",["each word","scc","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Deadhorse."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1abf061c","guard":[["hasAny",["first n","shortest","shortest one","shortest word","take","wmb"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Warrnambool."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1b67a01b","guard":[["hasAny",["item number","nth","paq","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Palmer."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1d32e4c3","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","yko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hakkari."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1de77324","guard":[["hasAny",["first n","shortest","shortest one","shortest word","take","wmb"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Warrnambool."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1f9d0b53","guard":[["hasAny",["cfo","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Confresa."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1fefc268","guard":[["hasAny",["each word","epl","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Epinal."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2039c129","guard":[["hasAny",["cts","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Sapporo."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-217d74f7","guard":[["hasAny",["each word","gjl","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Jijel."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-24754589","guard":[["hasAny",["first n","mob","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mobile."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-251048f3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mci","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-25b0ceb3","guard":[["hasAny",["each word","isw","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wisconsin Rapids."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-265f6c5c","guard":[["hasAny",["hds","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hoedspruit."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-270f4fb1","guard":[["hasAny",["cxr","each word","shortest","shortest one","shortest word","split into words"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nha Trang."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2858802e","guard":[["hasAny",["each word","gpa","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Patras."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-285eb388","guard":[["hasAny",["each word","frb","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Forbes."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-29440ae8","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","ypx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Puvirnituq."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-295e7b25","guard":[["hasAny",["item number","nth","position","vvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Villavicencio."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-29c561d2","guard":[["hasAny",["gnb","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grenoble."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-29e003ed","guard":[["hasAny",["each word","mbi","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mbeya."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2b4daaf9","guard":[["hasAny",["dzn","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zhezkazgan."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2ccf42e9","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","wil"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nairobi."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2cea9ef4","guard":[["hasAny",["each word","item number","kmo","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Manokotak."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2d52e74e","guard":[["hasAny",["dzn","each word","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zhezkazgan."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2f8cb44d","guard":[["hasAny",["item number","nth","position","toi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Troy."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2fb24b9b","guard":[["hasAny",["all caps","capital letters","capitals","mci","shortest","shortest one","shortest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-311ca47d","guard":[["hasAny",["gso","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Greensboro."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-32767386","guard":[["hasAny",["bih","each word","item number","nth","position","split into words"]],["has","city"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bishop."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-34a144a8","guard":[["hasAny",["cxr","each word","shortest","shortest one","shortest word","split into words"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nha Trang."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-35504167","guard":[["hasAny",["lower case","lowercase","mci","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3698adbb","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","sku"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Skiros."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-370ceabb","guard":[["hasAny",["csv","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Crossville."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-37f2670a","guard":[["hasAny",["item number","nth","position","ura"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Uralsk."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-37faa639","guard":[["hasAny",["bah","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bahrain."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-388e974f","guard":[["hasAny",["first n","lkp","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Lake Placid."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-38f883c4","guard":[["hasAny",["each word","gso","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Greensboro."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-39145695","guard":[["hasAny",["each word","item number","mxp","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Milano."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3969af40","guard":[["hasAny",["each word","item number","mth","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Marathon."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-39da5f53","guard":[["hasAny",["each word","item number","mth","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Marathon."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-39e238db","guard":[["hasAny",["each word","scc","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Deadhorse."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3a7cd759","guard":[["hasAny",["each word","iev","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kiev."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3c1ef793","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","yiw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Yiwu."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-3cc7d50c","guard":[["hasAny",["first n","isw","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wisconsin Rapids."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3d746dcc","guard":[["hasAny",["hsn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zhoushan."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3e9c9458","guard":[["hasAny",["each word","item number","nth","position","split into words","zal"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Valdivia."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-402062da","guard":[["hasAny",["ata","first n","shortest","shortest one","shortest word","take"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Anta."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-40d5f4c9","guard":[["hasAny",["each word","goa","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Genoa."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-429e079c","guard":[["hasAny",["first n","goa","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Genoa."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-433e5add","guard":[["hasAny",["bah","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bahrain."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-4398e02d","guard":[["hasAny",["each word","igb","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ingeniero Jacobacci."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-439d8ab6","guard":[["hasAny",["first n","ful","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fullerton."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-43c4d9b4","guard":[["hasAny",["abf","each word","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Abaiang Atoll."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-459bbb94","guard":[["hasAny",["each word","lkp","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Lake Placid."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-45d10adb","guard":[["hasAny",["item number","mci","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-4ad2ebd4","guard":[["hasAny",["dzn","each word","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Zhezkazgan."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4ad986da","guard":[["hasAny",["dkv","each word","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Docker River."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4afbcecd","guard":[["hasAny",["dbt","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Debre Tabor."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4df06ba4","guard":[["hasAny",["first n","igb","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ingeniero Jacobacci."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4e77cc9f","guard":[["hasAny",["item number","mwk","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Anambas Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4f44134e","guard":[["hasAny",["item number","jib","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Djibouti."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4fab5ba3","guard":[["hasAny",["gpa","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Patras."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-4fb54c29","guard":[["hasAny",["each word","item number","nth","position","sku","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Skiros."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-501d3671","guard":[["hasAny",["first n","gjl","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Jijel."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-535eabb5","guard":[["hasAny",["each word","goa","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Genoa."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-54905ca5","guard":[["hasAny",["bge","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bainbridge."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-566525c1","guard":[["hasAny",["cyb","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cayman Brac."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-56751dc7","guard":[["hasAny",["item number","nth","position","yce"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Centralia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-56ca44ae","guard":[["hasAny",["each word","ijk","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Izhevsk."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-57eaaae9","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","ypx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Puvirnituq."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5990a4bc","guard":[["hasAny",["bnm","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bodinumu."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5aa3d3a5","guard":[["hasAny",["elt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in El-tor."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5b873d50","guard":[["hasAny",["invert case","mci","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-5b92ff1c","guard":[["hasAny",["first n","scc","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Deadhorse."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5c8c6ccf","guard":[["hasAny",["cxr","first n","shortest","shortest one","shortest word","take"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nha Trang."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5d8f2b42","guard":[["hasAny",["cyb","each word","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cayman Brac."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5ff6d7bb","guard":[["hasAny",["epl","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Epinal."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-61e35fde","guard":[["hasAny",["cyb","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cayman Brac."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-639a7b96","guard":[["hasAny",["each word","item number","nth","position","split into words","zal"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Valdivia."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-63cc2d39","guard":[["hasAny",["gdo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Guasdualito."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-657bed1d","guard":[["hasAny",["first n","ful","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fullerton."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-66a99e53","guard":[["hasAny",["first n","shortest","shortest one","shortest word","take","whf"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wadi Halfa."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6834d3a1","guard":[["hasAny",["first n","mob","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mobile."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6b6cf897","guard":[["hasAny",["each word","mbi","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mbeya."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6c5f7f8f","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","yqu"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grande Prairie."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-6c6321c7","guard":[["hasAny",["first n","isw","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wisconsin Rapids."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6cca5657","guard":[["hasAny",["item number","mdu","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mendi."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6d189661","guard":[["hasAny",["dbt","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Debre Tabor."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-6e6cb3b8","guard":[["hasAny",["first n","shortest","shortest one","shortest word","take","yht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Haines Junction."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6fb58b21","guard":[["hasAny",["first n","gha","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ghardaia."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7039056d","guard":[["hasAny",["each word","item number","nth","position","split into words","yiw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Yiwu."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7147ce00","guard":[["hasAny",["first n","igb","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ingeniero Jacobacci."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-75522718","guard":[["hasAny",["each word","env","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wendover."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-76a47161","guard":[["hasAny",["item number","nth","position","rkv"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Reykjavik."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-76fd559c","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","swx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Shakawe."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-786987f8","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","whf"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wadi Halfa."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-789d102d","guard":[["hasAny",["bah","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bahrain."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-78c66a2d","guard":[["hasAny",["csv","each word","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Crossville."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-78d29c08","guard":[["hasAny",["first n","iev","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kiev."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7bff318e","guard":[["hasAny",["first n","mbi","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mbeya."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7c777da8","guard":[["hasAny",["each word","gnb","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grenoble."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7e514973","guard":[["hasAny",["each word","gha","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ghardaia."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7e89bb06","guard":[["hasAny",["first n","scc","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Deadhorse."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-803d0e80","guard":[["hasAny",["item number","mth","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Marathon."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-806e67d9","guard":[["hasAny",["cfo","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Confresa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-810f6597","guard":[["hasAny",["cca","each word","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Chapacura."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-81873d83","guard":[["hasAny",["bih","item number","normalise","normalize","nth","position","simplify the text"]],["has","city"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bishop."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-81a1003b","guard":[["hasAny",["first n","pdk","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Atlanta."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-82b0fae2","guard":[["hasAny",["fmo","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Munster."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-82d97c02","guard":[["hasAny",["each word","grz","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Graz."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-83933ae1","guard":[["hasAny",["cca","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Chapacura."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-83d940dd","guard":[["hasAny",["cca","each word","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Chapacura."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-844ca911","guard":[["hasAny",["bba","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Balmaceda."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-84eb801b","guard":[["hasAny",["each word","pdk","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Atlanta."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-86e54aba","guard":[["hasAny",["item number","kmo","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Manokotak."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-873f32fb","guard":[["hasAny",["bih","each word","item number","nth","position","split into words"]],["has","city"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bishop."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8757fb1b","guard":[["hasAny",["item number","lsf","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fort Benning."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-877b413a","guard":[["hasAny",["each word","nrk","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Norrkoeping."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-87dfbdc9","guard":[["hasAny",["drg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Deering."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-881d6c0d","guard":[["hasAny",["item number","iwj","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Iwami."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-88af423a","guard":[["hasAny",["each word","fgi","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Apia."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8a6edb7c","guard":[["hasAny",["each word","hoa","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hola."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8b4606b3","guard":[["hasAny",["item number","kzg","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kitzingen."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8cebf0a0","guard":[["hasAny",["each word","item number","nth","position","split into words","ukt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Quakertown."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8eaa4031","guard":[["hasAny",["bai","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Buenos Aires."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-8edd00dc","guard":[["hasAny",["each word","item number","lsf","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fort Benning."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8ee9858f","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","ssr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pentecost Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-8ef8175f","guard":[["hasAny",["abf","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Abaiang Atoll."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8f5dfb8f","guard":[["hasAny",["each word","item number","nth","position","split into words","urt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Surat Thani."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-901bdceb","guard":[["hasAny",["first n","shortest","shortest one","shortest word","swx","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Shakawe."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-90b1294d","guard":[["hasAny",["first n","shortest","shortest one","shortest word","take","wil"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nairobi."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9194403b","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","wmb"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Warrnambool."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-91cd5648","guard":[["hasAny",["csv","each word","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Crossville."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-91e239f2","guard":[["hasAny",["each word","item number","mxp","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Milano."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-978c12f2","guard":[["hasAny",["item number","ktr","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Katherine."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-97d3a1cd","guard":[["hasAny",["each word","iev","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kiev."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-98613b04","guard":[["hasAny",["each word","mob","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mobile."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-987c43cc","guard":[["hasAny",["first n","shortest","shortest one","shortest word","take","yht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Haines Junction."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-99774a76","guard":[["hasAny",["item number","khw","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Khwai River."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9a2912ec","guard":[["hasAny",["dkk","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Dunkirk."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9a9775e0","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","swx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Shakawe."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9c97492e","guard":[["hasAny",["each word","isw","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wisconsin Rapids."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9da8bfda","guard":[["hasAny",["item number","kkh","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kongiganak."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9e83e6ce","guard":[["hasAny",["each word","frb","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Forbes."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9fc3d6fe","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","zal"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Valdivia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-a04ff9d8","guard":[["hasAny",["item number","nth","position","rkh"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Rock Hill."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a1fb5e8e","guard":[["hasAny",["first n","nrk","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Norrkoeping."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a2175345","guard":[["hasAny",["each word","gnb","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grenoble."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a2befa4f","guard":[["hasAny",["each word","item number","lsf","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fort Benning."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a3ae8f80","guard":[["hasAny",["first n","gha","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ghardaia."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a63e7191","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","whf"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wadi Halfa."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a8e12341","guard":[["hasAny",["each word","gpa","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Patras."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a9a05c06","guard":[["hasAny",["abf","each word","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Abaiang Atoll."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-aa14c6af","guard":[["hasAny",["each word","item number","nth","position","split into words","yqu"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grande Prairie."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-aaf37984","guard":[["hasAny",["dkk","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Dunkirk."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-acefb42f","guard":[["hasAny",["each word","item number","mla","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Malta."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ad273e43","guard":[["hasAny",["each word","item number","nth","position","split into words","yiw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Yiwu."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ad881330","guard":[["hasAny",["item number","nth","position","tcs"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Truth Or Consequences."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ae3a228f","guard":[["hasAny",["bud","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Budapest."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-b05bf65b","guard":[["hasAny",["bud","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Budapest."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b0bb1585","guard":[["hasAny",["bai","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Buenos Aires."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b0c3f1ce","guard":[["hasAny",["item number","mci","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-b2560c68","guard":[["hasAny",["alphabetize the letters","letters in order","mci","shortest","shortest one","shortest word","sort the letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-b3635c04","guard":[["hasAny",["each word","mob","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mobile."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b3e939bc","guard":[["hasAny",["each word","fmo","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Munster."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b4842837","guard":[["hasAny",["each word","item number","nth","position","split into words","wua"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wuhai."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b53b1f71","guard":[["hasAny",["first n","nrk","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Norrkoeping."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b76b0396","guard":[["hasAny",["cfo","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Confresa."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b9a8d4bd","guard":[["hasAny",["each word","nrk","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Norrkoeping."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bbaa4889","guard":[["hasAny",["first n","pdk","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Atlanta."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-be059041","guard":[["hasAny",["env","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wendover."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-be1deedc","guard":[["hasAny",["first n","lkp","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Lake Placid."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-be32fe7c","guard":[["hasAny",["each word","item number","nth","position","split into words","ssr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pentecost Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-be560482","guard":[["hasAny",["first n","shortest","shortest one","shortest word","swx","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Shakawe."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-becf4ebf","guard":[["hasAny",["frb","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Forbes."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-bf17cfdb","guard":[["hasAny",["ayq","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Uluru."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-c0babd77","guard":[["hasAny",["first n","mbi","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Mbeya."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c0cd82d1","guard":[["hasAny",["each word","item number","nth","position","split into words","ssr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pentecost Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c0e125b4","guard":[["hasAny",["abf","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Abaiang Atoll."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c3609ddf","guard":[["hasAny",["each word","item number","nth","position","prh","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Phrae."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c5b5fbdc","guard":[["hasAny",["bnm","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bodinumu."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c8b78c99","guard":[["hasAny",["each word","igb","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Ingeniero Jacobacci."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c9476c07","guard":[["hasAny",["chy","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Choiseul Bay."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-c96e74f6","guard":[["hasAny",["each word","epl","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Epinal."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c9a41dbd","guard":[["hasAny",["dbt","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Debre Tabor."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cacb365d","guard":[["hasAny",["each word","hoa","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hola."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cafe5191","guard":[["hasAny",["item number","nth","position","qig"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Iguatu."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-cba291c4","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","ypm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pikangikum."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-ccae3fcc","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","ukt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Quakertown."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-cd2ffde3","guard":[["hasAny",["each word","env","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wendover."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cf1b9b5d","guard":[["hasAny",["each word","pdk","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Atlanta."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cff808e4","guard":[["hasAny",["item number","mla","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Malta."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d01b5de0","guard":[["hasAny",["int","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Winston-salem."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d2f9c6c9","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","yko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hakkari."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d423310c","guard":[["hasAny",["each word","item number","nth","position","split into words","yqu"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Grande Prairie."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d44d825e","guard":[["hasAny",["each word","item number","nth","position","split into words","tmc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Waikabubak-Sumba Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d540aa46","guard":[["hasAny",["fma","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Formosa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d5e737ec","guard":[["hasAny",["dkv","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Docker River."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d5ec4616","guard":[["hasAny",["bai","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Buenos Aires."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d6a96cfc","guard":[["hasAny",["dkv","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Docker River."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d7395990","guard":[["hasAny",["ggg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Longview."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d7eed8bf","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","yht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Haines Junction."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d7f473ba","guard":[["hasAny",["item number","nth","position","ymw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Maniwaki."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d87191fd","guard":[["hasAny",["hoa","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hola."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d92ffd07","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","wua"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wuhai."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d9a43784","guard":[["hasAny",["each word","grz","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Graz."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-db194940","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","wil"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nairobi."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-db230e17","guard":[["hasAny",["fgi","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Apia."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-dcb82005","guard":[["hasAny",["item number","jas","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Jasper."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dda3cf52","guard":[["hasAny",["each word","lkp","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Lake Placid."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-dedb7558","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mci","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-e18a8866","guard":[["hasAny",["first n","gjl","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Jijel."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e19d62f5","guard":[["hasAny",["first n","shortest","shortest one","shortest word","take","whf"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wadi Halfa."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e2396271","guard":[["hasAny",["each word","item number","nth","position","split into words","ypm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Pikangikum."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e2793147","guard":[["hasAny",["chy","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Choiseul Bay."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e2d3992c","guard":[["hasAny",["ayq","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Uluru."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e32b675f","guard":[["hasAny",["first n","shortest","shortest one","shortest word","take","wil"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nairobi."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e4169f81","guard":[["hasAny",["item number","mxp","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Milano."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e60b595d","guard":[["hasAny",["each word","item number","kmo","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Manokotak."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e6e6a322","guard":[["hasAny",["item number","mtm","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Metakatla."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ea860876","guard":[["hasAny",["ajy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Agadez."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ebf4f5c0","guard":[["hasAny",["each word","fmo","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Munster."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ec2827fa","guard":[["hasAny",["each word","ful","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Fullerton."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ec4f0c2c","guard":[["hasAny",["ata","first n","shortest","shortest one","shortest word","take"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Anta."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ec51740d","guard":[["hasAny",["each word","item number","mla","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Malta."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ece41491","guard":[["hasAny",["each word","item number","nth","position","split into words","urt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Surat Thani."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ed3e41f9","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","wmb"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Warrnambool."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ee5de586","guard":[["hasAny",["bud","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Budapest."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-eee490bf","guard":[["hasAny",["first n","goa","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Genoa."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ef8c1f10","guard":[["hasAny",["each word","item number","nth","position","split into words","wua"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wuhai."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f03c3466","guard":[["hasAny",["fgi","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Apia."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f0f197c2","guard":[["hasAny",["epl","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Epinal."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f1a76a7a","guard":[["hasAny",["first n","shortest","shortest one","shortest word","take","yko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Hakkari."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f2125ca4","guard":[["hasAny",["cxr","first n","shortest","shortest one","shortest word","take"]],["has","airport"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Nha Trang."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f5274832","guard":[["hasAny",["item number","normalise","normalize","nth","position","prh","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Phrae."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-f7d84db7","guard":[["hasAny",["csv","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Crossville."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fa59f6f4","guard":[["hasAny",["each word","ijk","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Izhevsk."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-faebf62e","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","tmc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Waikabubak-Sumba Island."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-fba6451b","guard":[["hasAny",["cyb","each word","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Cayman Brac."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fc894d9f","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","urt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Surat Thani."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-fca8c50b","guard":[["hasAny",["bnm","each word","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Bodinumu."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fd6c63cd","guard":[["hasAny",["env","first n","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Wendover."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3d5d4b23","guard":[["hasAny",["each word","mci","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-42449a31","guard":[["hasAny",["first n","mci","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-6699a5e9","guard":[["hasAny",["each word","mci","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8efde9a7","guard":[["hasAny",["first n","mci","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-e37edf2d","guard":[["hasAny",["each word","mci","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-efe38cc4","guard":[["hasAny",["each word","mci","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-f52baf67","guard":[["hasAny",["mci","normalise","normalize","shortest","shortest one","shortest word","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is in Kansas ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"the airport code GHA serves which city","expect":{"contains":["Ghardaia"],"notRefusal":true}},{"q":"which city is the airport IWJ in","expect":{"contains":["Iwami"],"notRefusal":true}},{"q":"name the city of airport MXP","expect":{"contains":["Milano"],"notRefusal":true}},{"q":"which city is the airport FMA in","expect":{"contains":["Formosa"],"notRefusal":true}},{"q":"which city is the airport BGE in","expect":{"contains":["Bainbridge"],"notRefusal":true}},{"q":"name the city of airport YPM","expect":{"contains":["Pikangikum"],"notRefusal":true}},{"q":"name the city of airport YQU","expect":{"contains":["Grande Prairie"],"notRefusal":true}},{"q":"which city is the airport TOI in","expect":{"contains":["Troy"],"notRefusal":true}},{"q":"which city is the airport RKV in","expect":{"contains":["Reykjavik"],"notRefusal":true}},{"q":"which city is the airport QIG in","expect":{"contains":["Iguatu"],"notRefusal":true}},{"q":"which city is the airport CTS in","expect":{"contains":["Sapporo"],"notRefusal":true}},{"q":"the airport code SCC serves which city","expect":{"contains":["Deadhorse"],"notRefusal":true}},{"q":"the airport code MCI serves which city","expect":{"contains":["Kansas City"],"notRefusal":true}},{"q":"name the city of airport GSO","expect":{"contains":["Greensboro"],"notRefusal":true}},{"q":"which city is the airport MTM in","expect":{"contains":["Metakatla"],"notRefusal":true}},{"q":"the airport code FGI serves which city","expect":{"contains":["Apia"],"notRefusal":true}},{"q":"the airport code YHT serves which city","expect":{"contains":["Haines Junction"],"notRefusal":true}},{"q":"name the city of airport GPA","expect":{"contains":["Patras"],"notRefusal":true}},{"q":"name the city of airport MTH","expect":{"contains":["Marathon"],"notRefusal":true}},{"q":"which city is the airport MWK in","expect":{"contains":["Anambas Islands"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
