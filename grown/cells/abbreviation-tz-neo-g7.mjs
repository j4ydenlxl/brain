// abbreviation-tz-neo-g7.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"abbreviation-tz-neo-g7","class":"abbreviation-tz","generation":7,"lane":"neo","grownFrom":["the time zone code GST stands for what","name the time zone abbreviated EDT","which time zone has the abbreviation SEST","which time zone has the abbreviation SAKT","the time zone code HST stands for what","which time zone has the abbreviation ACST","which time zone has the abbreviation YST","which time zone has the abbreviation LST","the time zone code SST stands for what","name the time zone abbreviated DST","the time zone code VLAT stands for what","which time zone has the abbreviation ESAST","name the time zone abbreviated WCAST","which time zone has the abbreviation SAMT","name the time zone abbreviated SPST","name the time zone abbreviated VST","the time zone code CBST stands for what","name the time zone abbreviated KDT","the time zone code PST stands for what","which time zone has the abbreviation AEST"],"version":1});

// <KERNEL>
const KERNEL_VERSION = 1;
const MAX_DEPTH = 64;
const MAX_LIST = 10000;
const MAX_BITS = 65536;
const MAX_TEXT = 100000;
const SAFE = 9007199254740991n;
const NEAR = 0.5;
const TYPES = Object.freeze(['text', 'num', 'nums', 'str', 'strs', 'bool', 'kv', 'tpl']);
const FAMILIES = Object.freeze(['sense', 'transform', 'aggregate', 'compare', 'compute', 'memory', 'know', 'route', 'iterate', 'render']);
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

// ---- knowledge (contract c5): packs of rows the absorber pulled, loaded by knowLoad, read by the know family. A pack
// is DATA: { id, columns: [names], rows: [[cells]] } or the column form { id, columns, cols } (each column a list of
// cells, or { s: cells joined by sep, sep, num? } or { d: distinct cells joined by sep, i: indices in base 36 joined by
// commas, sep, num? } or { d, r: runs "index*count" in base 36 joined by commas, sep, num? } or { f: cells front coded
// and joined by sep, sep, num? }). A cell is a string or a finite number. Keys match after knowNorm; a key with two
// values is no answer.
const KNOW = new Map();
const KNOW_ID = /^[a-z0-9-]+$/;
const KNOW_MAX_ROWS = 200000;
const KNOW_MAX_GRAM = 8;
/** The match form of a key: no accents, lower case, every run of what is not a letter or a digit one space, no leading "the". */
function knowNorm(s) {
  if (typeof s !== 'string' && !(typeof s === 'number' && Number.isFinite(s))) return '';
  const t = knowWords(String(s));
  return t.startsWith('the ') ? t.slice(4) : t === 'the' ? '' : t;
}
function knowWords(s) { return s.slice(0, 2000).normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); }
/** A number as plain digits (no exponent, no separator; a float to 15 significant digits), or null. */
function plainNum(v) {
  if (typeof v === 'bigint') return v.toString();
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  if (Number.isInteger(v)) return Math.abs(v) < 1e21 ? String(v + 0) : BigInt(v).toString();
  const s = String(Number(v.toPrecision(15)) + 0);
  return /e/i.test(s) ? null : s;
}
function knowCell(v) { return typeof v === 'string' ? (v.trim() ? v : null) : typeof v === 'number' && Number.isFinite(v) ? plainNum(v) : null; }
function knowColumn(c, n) {
  if (Array.isArray(c)) return c.length === n ? c : null;
  if (!isKv(c) || typeof c.sep !== 'string' || c.sep.length !== 1) return null;
  const conv = c.num === true ? (x) => (x === '' ? '' : Number(x)) : (x) => x;
  if (typeof c.s === 'string') { const xs = n ? c.s.split(c.sep) : []; return xs.length === n ? xs.map(conv) : null; }
  if (typeof c.d === 'string' && typeof c.i === 'string') {
    const d = c.d.split(c.sep).map(conv), ix = n ? c.i.split(',') : [];
    if (ix.length !== n) return null;
    const out = new Array(n);
    for (let k = 0; k < n; k++) { const j = parseInt(ix[k], 36); if (!(j >= 0 && j < d.length)) return null; out[k] = d[j]; }
    return out;
  }
  if (typeof c.d === 'string' && typeof c.r === 'string') { // runs of the dictionary: "index*count" in base 36, by commas
    const d = c.d.split(c.sep).map(conv), out = [];
    for (const run of n ? c.r.split(',') : []) {
      const m = /^([0-9a-z]+)\*([0-9a-z]+)$/.exec(run), j = m ? parseInt(m[1], 36) : -1, len = m ? parseInt(m[2], 36) : 0;
      if (!(j >= 0 && j < d.length) || !(len >= 1) || out.length + len > n) return null;
      for (let k = 0; k < len; k++) out.push(d[j]);
    }
    return out.length === n ? out : null;
  }
  if (typeof c.f === 'string') { // front coded: each item the count (one base 36 digit) of first code units it shares with the item before, then the rest
    const xs = n ? c.f.split(c.sep) : [];
    if (xs.length !== n) return null;
    const out = new Array(n);
    let prev = '';
    for (let k = 0; k < n; k++) {
      const m = /^[0-9a-z]/.test(xs[k]) ? parseInt(xs[k][0], 36) : -1;
      if (!(m >= 0 && m <= prev.length)) return null;
      prev = prev.slice(0, m) + xs[k].slice(1);
      out[k] = conv(prev);
    }
    return out;
  }
  return null;
}
function knowRows(p) {
  const cols = p.columns;
  if (Array.isArray(p.rows)) return p.rows.slice(0, KNOW_MAX_ROWS).map((r) => (Array.isArray(r) ? cols.map((_, j) => r[j]) : null));
  if (!Array.isArray(p.cols) || p.cols.length !== cols.length || !Number.isInteger(p.n) || p.n < 0 || p.n > KNOW_MAX_ROWS) return null;
  const data = p.cols.map((c) => knowColumn(c, p.n));
  if (data.some((c) => c === null)) return null;
  return Array.from({ length: p.n }, (_, i) => data.map((c) => c[i]));
}
/**
 * Load knowledge packs: the registry becomes exactly the valid packs given (a later pack of one id wins); the count.
 * A row that is not a list, a cell that is neither a string nor a finite number, becomes empty text.
 */
function knowLoad(packs) {
  KNOW.clear();
  for (const p of Array.isArray(packs) ? packs : []) {
    if (!isKv(p) || typeof p.id !== 'string' || !KNOW_ID.test(p.id) || !Array.isArray(p.columns) || !p.columns.length) continue;
    if (!p.columns.every((c) => typeof c === 'string' && c.trim()) || new Set(p.columns).size !== p.columns.length) continue;
    let rows = null;
    try { rows = knowRows(p); } catch { rows = null; }
    if (!rows) continue;
    const clean = rows.filter(Boolean).map((r) => r.map((v) => (typeof v === 'string' || (typeof v === 'number' && Number.isFinite(v)) ? v : '')));
    KNOW.set(p.id, { id: p.id, cols: p.columns.slice(), col: new Map(p.columns.map((c, j) => [c, j])), rows: clean, keys: new Map(), grams: new Map() });
  }
  return KNOW.size;
}
function knowCol(p, name) { return typeof name === 'string' && p.col.has(name) ? p.col.get(name) : -1; }
function knowKeys(p, j) {
  let m = p.keys.get(j);
  if (m) return m;
  m = new Map();
  p.rows.forEach((r, i) => { const k = knowNorm(r[j]); if (!k) return; const a = m.get(k); if (a) a.push(i); else m.set(k, [i]); });
  p.keys.set(j, m);
  return m;
}
/** The one value of column vc for the key in column kc of a pack, or null (no pack, no column, no key, two values). */
function knowGet(id, kc, key, vc) {
  const p = typeof id === 'string' ? KNOW.get(id) : null;
  if (!p || typeof key !== 'string') return null;
  const ki = knowCol(p, kc), vi = knowCol(p, vc);
  if (ki < 0 || vi < 0) return null;
  const at = knowKeys(p, ki).get(knowNorm(key));
  if (!at) return null;
  let out = null, on = null;
  for (const i of at) {
    const v = knowCell(p.rows[i][vi]);
    if (v === null) continue;
    const n = knowNorm(v) || v;
    if (on !== null && n !== on) return null;
    if (on === null) { out = v; on = n; }
  }
  return out;
}
/** The row of a key as { column: cell } (numbers as numbers), or null (no key, or two rows that differ). */
function knowRow(id, kc, key) {
  const p = typeof id === 'string' ? KNOW.get(id) : null;
  if (!p || typeof key !== 'string') return null;
  const ki = knowCol(p, kc);
  const at = ki < 0 ? null : knowKeys(p, ki).get(knowNorm(key));
  if (!at) return null;
  const sig = (r) => r.map((v) => knowNorm(v)).join('\u0000');
  if (at.some((i) => sig(p.rows[i]) !== sig(p.rows[at[0]]))) return null;
  const out = Object.create(null);
  p.cols.forEach((c, j) => { const v = p.rows[at[0]][j]; if (v !== '') out[c] = v; });
  return out;
}
function knowGrams(p, j) {
  let g = p.grams.get(j);
  if (g) return g;
  g = { canon: new Map(), max: 1 };
  for (const r of p.rows) {
    const t = knowCell(r[j]), k = t === null ? '' : knowNorm(t);
    if (!k || g.canon.has(k)) continue;
    g.canon.set(k, t);
    g.max = Math.min(KNOW_MAX_GRAM, Math.max(g.max, k.split(' ').length));
  }
  p.grams.set(j, g);
  return g;
}
/** A key that begins with a mark: neither a letter, a digit nor a space. */
const MARKED = /^[^\p{L}\p{N}\s]/u;
function boundedIn(hay, needle) {
  for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + 1)) {
    const a = i === 0 || !/[\p{L}\p{N}]/u.test(hay[i - 1]), b = i + needle.length >= hay.length || !/[\p{L}\p{N}]/u.test(hay[i + needle.length]);
    if (a && b) return true;
  }
  return false;
}
/**
 * The keys of a pack column the prompt names, in prompt order, each as the pack writes it: the longest match at each
 * place, never overlapping. When one of them is written in the prompt exactly as in the pack, only those exact ones
 * are kept; one made only of stop words goes when another is found. A key written with a leading mark (".no") is
 * named only where the prompt writes it with the mark (any case).
 */
function knowFind(q, id, kc) {
  const p = typeof id === 'string' ? KNOW.get(id) : null;
  if (!p || typeof q !== 'string') return null;
  const j = knowCol(p, kc);
  if (j < 0) return null;
  const g = knowGrams(p, j), ws = splitW(knowWords(q)), found = [], src = q.slice(0, 2000), low = src.toLowerCase();
  for (let i = 0; i < ws.length && found.length < 50;) {
    let hit = 0;
    for (let n = Math.min(g.max + 1, ws.length - i); n >= 1 && !hit; n--) {
      let k = ws.slice(i, i + n).join(' ');
      if (k.startsWith('the ')) k = k.slice(4);
      if (!k || !g.canon.has(k)) continue;
      const t = g.canon.get(k);
      // a key the pack writes with a leading mark (".no", "#tag") is named only where the prompt writes the mark too
      if (MARKED.test(t) && !boundedIn(low, t.toLowerCase())) continue;
      if (!found.includes(t)) found.push(t);
      hit = n;
    }
    i += hit || 1;
  }
  const exact = found.filter((t) => boundedIn(src, t));
  const kept = exact.length ? exact : found;
  const content = kept.filter((t) => splitW(norm(t, 1)).some((w) => !STOP.has(w)));
  return content.length ? content : kept;
}
/** The keys among keys whose column vc holds value (knowNorm equal), in the given order. */
function knowWhere(keys, id, kc, vc, value) {
  const want = knowNorm(value);
  if (!want || !Array.isArray(keys)) return null;
  return keys.filter((k) => { const v = knowGet(id, kc, k, vc); return v !== null && knowNorm(v) === want; });
}

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

  // know: retrieval from the knowledge packs (knowLoad); a pack id and its column names are literal arguments
  P('know.find', 'text str str', 'strs', 'which|named|mentioned|the one called', (a, c) => ne(knowFind(c.q, S(a[0]), S(a[1]))));
  P('know.lookup', 'str str str str', 'str', 'what is the|look up|the value of|find the', (a) => knowGet(S(a[1]), S(a[2]), S(a[0]), S(a[3])));
  P('know.reverse', 'str str str str', 'str', 'which has|whose|which one has|the one with', (a) => knowGet(S(a[1]), S(a[3]), S(a[0]), S(a[2])));
  P('know.row', 'str str str', 'kv', 'everything about|the record of|all about', (a) => knowRow(S(a[1]), S(a[2]), S(a[0])));
  P('know.has', 'str str str', 'bool', 'is it known|is there a|is it listed', (a) => { const p = KNOW.get(S(a[1])); const j = p ? knowCol(p, S(a[2])) : -1; return j < 0 ? null : knowKeys(p, j).has(knowNorm(S(a[0]))); });
  P('know.where', 'strs str str str str', 'strs', 'which of these|the ones that are|among these', (a) => knowWhere(SS(a[0]), S(a[1]), S(a[2]), S(a[3]), S(a[4])));
  P('know.num', 'str', 'num', 'as a number|numeric value|how much', (a) => parseNum(S(a[0]).trim()));

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
  P('render.plain', 'num', 'str', 'exact number|all its digits|in full', (a) => plainNum(N(a[0])));
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
// the facts the cells read (grow/know.mjs packs, only the columns the cells name)
knowLoad([{"id":"timezones-windows","columns":["time zone","abbreviation"],"n":108,"cols":[{"f":"0UTC-11|0Pacific Standard Time (Mexico)|0Mountain Standard Time (Mexico)|0Central America Standard Time|8Standard Time|0Eastern Standard Time|0Atlantic Standard Time|1rgentina Standard Time|0Greenland Standard Time|0Montevideo Standard Time|0Bahia Standard Time|0GMT Standard Time|0Central Europe Standard Time|0Namibia Standard Time|0South Africa Standard Time|0Jordan Standard Time|0Kaliningrad Standard Time|0E. Africa Standard Time|0Caucasus Standard Time|0West Asia Standard Time|0Taipei Standard Time|0AUS Central Standard Time|4Eastern Standard Time|1fghanistan Standard Time|1laskan Standard Time|1rab Standard Time|4ian Standard Time|5c Standard Time|1zerbaijan Standard Time|2ores Standard Time|0Bangladesh Standard Time|1ritish Summer Time|0Canada Central Standard Time|2pe Verde Standard Time|1en. Australia Standard Time|3tral Asia Standard Time|8Brazilian Standard Time|8European Standard Time|8Pacific Standard Time|8Standard Time (Mexico)|1hina Standard Time|0Dateline Standard Time|0E. Australia Standard Time|3Europe Standard Time|3South America Standard Time|1astern Daylight Time|1gypt Standard Time|0FLE Standard Time|1iji Standard Time|0GMT Standard Time|1TB Standard Time|1eorgian Standard Time|1reenwich Standard Time|0Hawaiian Standard Time|0India Standard Time|1ran Standard Time|1srael Standard Time|0Japan Standard Time|0Kamchatka Standard Time|1orea Standard Time|0Libya Standard Time|0Magadan Standard Time|2uritius Standard Time|1id-Atlantic Standard Time|3dle East Standard Time|1orocco Standard Time|2scow Standard Time|2untain Standard Time|1yanmar Standard Time|0N. Central Asia Standard Time|1epal Standard Time|2w Zealand Standard Time|3foundland Standard Time|1orth Asia East Standard Time|bStandard Time|0Pacific Daylight Time|8SA Standard Time|9tandard Time|2kistan Standard Time|2raguay Standard Time|0Romance Standard Time|0SA Eastern Standard Time|3Pacific Standard Time|3Western Standard Time|1E Asia Standard Time|1akhalin Standard Time|2mara Time|3oa Standard Time|1ingapore Standard Time|1ri Lanka Standard Time|1yria Standard Time|0Tasmania Standard Time|1onga Standard Time|1urkey Standard Time|0US Eastern Standard Time|3Mountain Standard Time|1TC|3+12|3-02|1laanbaatar Standard Time|0Venezuela Standard Time|1ladivostok Standard Time|0W. Australia Standard Time|3Central Africa Standard Time|3Europe Standard Time|1est Pacific Standard Time|0Yakutsk Standard Time|1ekaterinburg Time","sep":"|"},{"s":"U|PDT|MDT|CAST|CDT|EST|ADT|AST|GDT|MST|BST|GMT|CEDT|NST|SAST|JST|KST|EAST|CST|WAST|TST|ACST|AEST|AST|AKDT|AST|AST|AST|ADT|ADT|BST|BST|CCST|CVST|CAST|CAST|CBST|CEDT|CPST|CDT|CST|DST|EAST|EEDT|ESAST|EDT|EST|FDT|FST|GDT|GDT|GET|GST|HST|IST|IDT|JDT|JST|KDT|KST|LST|MST|MST|MDT|MEDT|MDT|MSK|MDT|MST|NCAST|NST|NZST|NDT|NAEST|NAST|PDT|PSST|PST|PKT|PYT|RDT|SEST|SPST|SWST|SAST|SAKT|SAMT|SST|MPST|SLST|SDT|TST|TST|TDT|UEDT|UMST|UTC|U|U|UST|VST|VLAT|WAST|WCAST|WEDT|WPST|YST|YEKT","sep":"|"}]}]);
const COLONY = [
{"id":"n-0539c7d3","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["sense.lastWord"]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-f879da7b","guard":[["hasAny",["appears in","contains","element","has","includes","item number","nth","position","time"]],["has","zone"]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["sense.lastWord"]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-06d21235","guard":[["hasAny",["element","item number","nth","position","time"]],["has","zone"]],"pyramid":["render.code",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-83ecc86f","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-a42501fa","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.code",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-a58bb53f","guard":[["hasAny",["element","item number","nth","position","time"]],["has","zone"]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-36bfe180","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-4f8ac6fc","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","time"]],["has","zone"]],"pyramid":["render.code",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-5be2270e","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.code",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-5e558030","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","position","time","upper case","uppercase"]],["has","zone"]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-60fe5525","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","time","title case"]],["has","zone"]],"pyramid":["render.code",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-86a0fe4e","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-87d6d025","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-896a1bd8","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.code",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-8de88b26","guard":[["hasAny",["element","invert case","item number","nth","position","swap case","time","toggle case"]],["has","zone"]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-af550bcf","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-af88ed8d","guard":[["hasAny",["element","invert case","item number","nth","position","swap case","time","toggle case"]],["has","zone"]],"pyramid":["render.code",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-b906dc09","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.code",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-b95b7c73","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.code",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-d59baf9b","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","time"]],["has","zone"]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-d99df547","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","time","title case"]],["has","zone"]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-f2348074","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","position","time","upper case","uppercase"]],["has","zone"]],"pyramid":["render.code",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-2d6bc402","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","invert case","item number","nth","position","swap case","time","title case","toggle case"]],["has","zone"]],"pyramid":["render.code",["transform.swapCase",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]]],"mem":null},
{"id":"n-3d436404","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.str",["transform.swapCase",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]]],"mem":null},
{"id":"n-5d5e8e61","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.code",["transform.swapCase",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]]],"mem":null},
{"id":"n-8fb21fd4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","invert case","item number","nth","position","swap case","time","title case","toggle case"]],["has","zone"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]]],"mem":null},
{"id":"n-21a349dd","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.and",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-54a53187","guard":[["hasAny",["element","item number","nth","position","time"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.and",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-dbf92274","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-f2cdb005","guard":[["hasAny",["element","item number","nth","position","time"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-02403096","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-4528765d","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","position","time","upper case","uppercase"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-92b94969","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","time","title case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-a6c39169","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-b18f2b9c","guard":[["hasAny",["element","invert case","item number","nth","position","swap case","time","toggle case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-b1d168a6","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-c01f6a1d","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-d9f4a3a7","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-e2b2b481","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","time"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-fb924c84","guard":[["hasAny",["element","item number","nth","position","time"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-1e9c4c11","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-5143538b","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["transform.lower",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-6a57274c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","time","title case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-b1b8ae16","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","time"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["transform.lower",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-685b273a","guard":[["hasAny",["delete","element","item number","nth","position","remove","strip out","time","without"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["transform.remove",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-f424b5c1","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["transform.remove",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-9ab3a1a1","guard":[["not",["hasAny",["hours","offset","use","utc11","utc12"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-c6448086","guard":[["hasAny",["element","item number","nth","position","separate by","split","split by","time"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-257cf69e","guard":[["has","time"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the time zone code GST stands for what":"GST abbreviates Greenwich Standard Time.","name the time zone abbreviated EDT":"EDT abbreviates Eastern Daylight Time.","which time zone has the abbreviation SEST":"SEST abbreviates SA Eastern Standard Time.","which time zone has the abbreviation SAKT":"SAKT abbreviates Sakhalin Standard Time.","the time zone code HST stands for what":"HST abbreviates Hawaiian Standard Time.","which time zone has the abbreviation ACST":"ACST abbreviates AUS Central Standard Time.","which time zone has the abbreviation YST":"YST abbreviates Yakutsk Standard Time.","which time zone has the abbreviation LST":"LST abbreviates Libya Standard Time.","the time zone code SST stands for what":"SST abbreviates Samoa Standard Time.","name the time zone abbreviated DST":"DST abbreviates Dateline Standard Time.","the time zone code VLAT stands for what":"VLAT abbreviates Vladivostok Standard Time.","which time zone has the abbreviation ESAST":"ESAST abbreviates E. South America Standard Time.","name the time zone abbreviated WCAST":"WCAST abbreviates W. Central Africa Standard Time.","which time zone has the abbreviation SAMT":"SAMT abbreviates Samara Time.","name the time zone abbreviated SPST":"SPST abbreviates SA Pacific Standard Time.","name the time zone abbreviated VST":"VST abbreviates Venezuela Standard Time.","the time zone code CBST stands for what":"CBST abbreviates Central Brazilian Standard Time.","name the time zone abbreviated KDT":"KDT abbreviates Kamchatka Standard Time.","the time zone code PST stands for what":"PST abbreviates Pacific Standard Time.","which time zone has the abbreviation AEST":"AEST abbreviates AUS Eastern Standard Time.","name the time zone abbreviated GET":"GET abbreviates Georgian Standard Time.","name the time zone abbreviated UEDT":"UEDT abbreviates US Eastern Standard Time.","name the time zone abbreviated SWST":"SWST abbreviates SA Western Standard Time.","which time zone has the abbreviation FDT":"FDT abbreviates FLE Standard Time.","name the time zone abbreviated PYT":"PYT abbreviates Paraguay Standard Time.","name the time zone abbreviated NZST":"NZST abbreviates New Zealand Standard Time.","which time zone has the abbreviation CVST":"CVST abbreviates Cape Verde Standard Time.","which time zone has the abbreviation AKDT":"AKDT abbreviates Alaskan Standard Time.","which time zone has the abbreviation CCST":"CCST abbreviates Canada Central Standard Time.","the time zone code UMST stands for what":"UMST abbreviates US Mountain Standard Time.","the time zone code SLST stands for what":"SLST abbreviates Sri Lanka Standard Time.","which time zone has the abbreviation SDT":"SDT abbreviates Syria Standard Time.","which time zone has the abbreviation RDT":"RDT abbreviates Romance Standard Time.","the time zone code YEKT stands for what":"YEKT abbreviates Yekaterinburg Time.","name the time zone abbreviated TDT":"TDT abbreviates Turkey Standard Time.","which time zone has the abbreviation UST":"UST abbreviates Ulaanbaatar Standard Time.","the time zone code EEDT stands for what":"EEDT abbreviates E. Europe Standard Time.","the time zone code CPST stands for what":"CPST abbreviates Central Pacific Standard Time.","name the time zone abbreviated NDT":"NDT abbreviates Newfoundland Standard Time.","the time zone code JDT stands for what":"JDT abbreviates Israel Standard Time.","the time zone code FST stands for what":"FST abbreviates Fiji Standard Time.","the time zone code GMT stands for what":"GMT abbreviates GMT Standard Time.","name the time zone abbreviated NCAST":"NCAST abbreviates N. Central Asia Standard Time."}}},
{"id":"n-cba9fef6","guard":[["has","time"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"zone"}]]],"mem":{"table":{"code GST stands for what":"GST abbreviates Greenwich Standard Time.","abbreviated EDT":"EDT abbreviates Eastern Daylight Time.","has the abbreviation SEST":"SEST abbreviates SA Eastern Standard Time.","has the abbreviation SAKT":"SAKT abbreviates Sakhalin Standard Time.","code HST stands for what":"HST abbreviates Hawaiian Standard Time.","has the abbreviation ACST":"ACST abbreviates AUS Central Standard Time.","has the abbreviation YST":"YST abbreviates Yakutsk Standard Time.","has the abbreviation LST":"LST abbreviates Libya Standard Time.","code SST stands for what":"SST abbreviates Samoa Standard Time.","abbreviated DST":"DST abbreviates Dateline Standard Time.","code VLAT stands for what":"VLAT abbreviates Vladivostok Standard Time.","has the abbreviation ESAST":"ESAST abbreviates E. South America Standard Time.","abbreviated WCAST":"WCAST abbreviates W. Central Africa Standard Time.","has the abbreviation SAMT":"SAMT abbreviates Samara Time.","abbreviated SPST":"SPST abbreviates SA Pacific Standard Time.","abbreviated VST":"VST abbreviates Venezuela Standard Time.","code CBST stands for what":"CBST abbreviates Central Brazilian Standard Time.","abbreviated KDT":"KDT abbreviates Kamchatka Standard Time.","code PST stands for what":"PST abbreviates Pacific Standard Time.","has the abbreviation AEST":"AEST abbreviates AUS Eastern Standard Time.","abbreviated GET":"GET abbreviates Georgian Standard Time.","abbreviated UEDT":"UEDT abbreviates US Eastern Standard Time.","abbreviated SWST":"SWST abbreviates SA Western Standard Time.","has the abbreviation FDT":"FDT abbreviates FLE Standard Time.","abbreviated PYT":"PYT abbreviates Paraguay Standard Time.","abbreviated NZST":"NZST abbreviates New Zealand Standard Time.","has the abbreviation CVST":"CVST abbreviates Cape Verde Standard Time.","has the abbreviation AKDT":"AKDT abbreviates Alaskan Standard Time.","has the abbreviation CCST":"CCST abbreviates Canada Central Standard Time.","code UMST stands for what":"UMST abbreviates US Mountain Standard Time.","code SLST stands for what":"SLST abbreviates Sri Lanka Standard Time.","has the abbreviation SDT":"SDT abbreviates Syria Standard Time.","has the abbreviation RDT":"RDT abbreviates Romance Standard Time.","code YEKT stands for what":"YEKT abbreviates Yekaterinburg Time.","abbreviated TDT":"TDT abbreviates Turkey Standard Time.","has the abbreviation UST":"UST abbreviates Ulaanbaatar Standard Time.","code EEDT stands for what":"EEDT abbreviates E. Europe Standard Time.","code CPST stands for what":"CPST abbreviates Central Pacific Standard Time.","abbreviated NDT":"NDT abbreviates Newfoundland Standard Time.","code JDT stands for what":"JDT abbreviates Israel Standard Time.","code FST stands for what":"FST abbreviates Fiji Standard Time.","code GMT stands for what":"GMT abbreviates GMT Standard Time.","abbreviated NCAST":"NCAST abbreviates N. Central Asia Standard Time."}}},
{"id":"n-cc06f1ad","guard":[["has","time"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"time"}]]],"mem":{"table":{"zone code GST stands for what":"GST abbreviates Greenwich Standard Time.","zone abbreviated EDT":"EDT abbreviates Eastern Daylight Time.","zone has the abbreviation SEST":"SEST abbreviates SA Eastern Standard Time.","zone has the abbreviation SAKT":"SAKT abbreviates Sakhalin Standard Time.","zone code HST stands for what":"HST abbreviates Hawaiian Standard Time.","zone has the abbreviation ACST":"ACST abbreviates AUS Central Standard Time.","zone has the abbreviation YST":"YST abbreviates Yakutsk Standard Time.","zone has the abbreviation LST":"LST abbreviates Libya Standard Time.","zone code SST stands for what":"SST abbreviates Samoa Standard Time.","zone abbreviated DST":"DST abbreviates Dateline Standard Time.","zone code VLAT stands for what":"VLAT abbreviates Vladivostok Standard Time.","zone has the abbreviation ESAST":"ESAST abbreviates E. South America Standard Time.","zone abbreviated WCAST":"WCAST abbreviates W. Central Africa Standard Time.","zone has the abbreviation SAMT":"SAMT abbreviates Samara Time.","zone abbreviated SPST":"SPST abbreviates SA Pacific Standard Time.","zone abbreviated VST":"VST abbreviates Venezuela Standard Time.","zone code CBST stands for what":"CBST abbreviates Central Brazilian Standard Time.","zone abbreviated KDT":"KDT abbreviates Kamchatka Standard Time.","zone code PST stands for what":"PST abbreviates Pacific Standard Time.","zone has the abbreviation AEST":"AEST abbreviates AUS Eastern Standard Time.","zone abbreviated GET":"GET abbreviates Georgian Standard Time.","zone abbreviated UEDT":"UEDT abbreviates US Eastern Standard Time.","zone abbreviated SWST":"SWST abbreviates SA Western Standard Time.","zone has the abbreviation FDT":"FDT abbreviates FLE Standard Time.","zone abbreviated PYT":"PYT abbreviates Paraguay Standard Time.","zone abbreviated NZST":"NZST abbreviates New Zealand Standard Time.","zone has the abbreviation CVST":"CVST abbreviates Cape Verde Standard Time.","zone has the abbreviation AKDT":"AKDT abbreviates Alaskan Standard Time.","zone has the abbreviation CCST":"CCST abbreviates Canada Central Standard Time.","zone code UMST stands for what":"UMST abbreviates US Mountain Standard Time.","zone code SLST stands for what":"SLST abbreviates Sri Lanka Standard Time.","zone has the abbreviation SDT":"SDT abbreviates Syria Standard Time.","zone has the abbreviation RDT":"RDT abbreviates Romance Standard Time.","zone code YEKT stands for what":"YEKT abbreviates Yekaterinburg Time.","zone abbreviated TDT":"TDT abbreviates Turkey Standard Time.","zone has the abbreviation UST":"UST abbreviates Ulaanbaatar Standard Time.","zone code EEDT stands for what":"EEDT abbreviates E. Europe Standard Time.","zone code CPST stands for what":"CPST abbreviates Central Pacific Standard Time.","zone abbreviated NDT":"NDT abbreviates Newfoundland Standard Time.","zone code JDT stands for what":"JDT abbreviates Israel Standard Time.","zone code FST stands for what":"FST abbreviates Fiji Standard Time.","zone code GMT stands for what":"GMT abbreviates GMT Standard Time.","zone abbreviated NCAST":"NCAST abbreviates N. Central Asia Standard Time."}}},
{"id":"n-457305ed","guard":[["hasAny",["abbreviated","abbreviation","cbst","cpst","delete","eedt","element","fst","gst","hst","item number","jdt","nth","position","pst","remove","slst","sst","strip out","umst","vlat","without","yekt"]],["has","time"]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}]]],"mem":null},
{"id":"n-a3188b3e","guard":[["hasAny",["abbreviated","abbreviation","cbst","cpst","eedt","element","fst","gst","hst","item number","jdt","nth","position","pst","separate by","slst","split","split by","sst","umst","vlat","yekt"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}]]],"mem":null},
{"id":"n-d9e4b5ab","guard":[["hasAny",["abbreviated","abbreviation","cbst","cpst","delete","eedt","element","fst","gst","hst","item number","jdt","nth","position","pst","remove","slst","sst","strip out","umst","vlat","without","yekt"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}]]],"mem":null},
{"id":"n-0679abf9","guard":[["hasAny",["abbreviated","abbreviation","cbst","change to","cpst","eedt","element","fst","gst","hst","item number","jdt","nth","position","pst","replace","slst","sst","substitute","swap","umst","vlat","yekt"]],["has","time"]],"pyramid":["render.code",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["sense.text"]]],"mem":null},
{"id":"n-1dfa810d","guard":[["hasAny",["abbreviated","abbreviation","cbst","change to","cpst","eedt","element","fst","gst","hst","item number","jdt","nth","position","pst","replace","slst","sst","substitute","swap","umst","vlat","yekt"]],["has","time"]],"pyramid":["render.code",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["sense.lastWord"]]],"mem":null},
{"id":"n-553b1332","guard":[["hasAny",["abbreviated","abbreviation","cbst","change to","cpst","eedt","element","fst","gst","hst","item number","jdt","nth","position","pst","replace","slst","sst","substitute","swap","umst","vlat","yekt"]],["has","time"]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["sense.text"]]],"mem":null},
{"id":"n-b54830fd","guard":[["hasAny",["abbreviated","abbreviation","cbst","cpst","eedt","element","fst","gst","hst","item number","jdt","longest","longest one","longest word","nth","position","pst","separate by","slst","split","split by","sst","umst","vlat","yekt"]]],"pyramid":["render.code",["aggregate.longest",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}]]]],"mem":null},
{"id":"n-e9c0bdee","guard":[["hasAny",["abbreviated","abbreviation","cbst","change to","cpst","eedt","element","fst","gst","hst","item number","jdt","nth","position","pst","replace","slst","sst","substitute","swap","umst","vlat","yekt"]],["has","time"]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["sense.lastWord"]]],"mem":null},
{"id":"n-31edc960","guard":[["hasAny",["abbreviate","abbreviation","acronym","appears in","contains","element","has","includes","item number","no vowels","nth","position","remove vowels","short form","time","without vowels"]]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["transform.noVowels",["transform.acronym",["sense.after",{"lit":"zone"}]]]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-63a4377e","guard":[["hasAny",["abbreviate","acronym","appears in","contains","element","has","includes","item number","normalise","normalize","nth","position","short form","simplify the text","time"]],["has","zone"]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["transform.norm",["transform.acronym",["sense.lastWord"]],{"lit":2}]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-2cac0003","guard":[["hasAny",["acst","aest","akdt","cbst","ccst","cpst","cvst","dst","edt","element","fdt","fst","get","gmt","gst","hst","item number","jdt","kdt","lst","ndt","normalise","normalize","nth","nzst","position","pst","pyt","rdt","sakt","samt","sdt","sest","simplify the text","slst","spst","sst","swst","tdt","uedt","umst","ust","vlat","vst","yekt","yst"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],{"lit":1}]],"mem":null},
{"id":"n-51fddf87","guard":[["hasAny",["acst","aest","akdt","cbst","ccst","cpst","cvst","dst","edt","element","fdt","fst","get","gmt","gst","hst","item number","jdt","kdt","lst","ndt","normalise","normalize","nth","nzst","position","pst","pyt","rdt","sakt","samt","sdt","sest","simplify the text","slst","spst","sst","swst","tdt","uedt","umst","ust","vlat","vst","yekt","yst"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],{"lit":1}]],"mem":null},
{"id":"n-8176fba1","guard":[["hasAny",["acst","aest","akdt","cbst","ccst","cpst","cvst","dst","edt","element","fdt","fst","get","gmt","gst","hst","item number","jdt","kdt","lst","ndt","normalise","normalize","nth","nzst","position","pst","pyt","rdt","sakt","samt","sdt","sest","simplify the text","slst","spst","sst","swst","tdt","ust","vlat","vst","yekt","yst"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],{"lit":2}]],"mem":null},
{"id":"n-83ecca36","guard":[["hasAny",["acst","aest","akdt","cbst","ccst","cpst","cvst","dst","edt","element","fdt","fst","get","gmt","gst","hst","item number","jdt","kdt","lst","ndt","normalise","normalize","nth","nzst","position","pst","pyt","rdt","sakt","samt","sdt","sest","simplify the text","slst","spst","sst","swst","tdt","ust","vlat","vst","yekt","yst"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],{"lit":2}]],"mem":null},
{"id":"n-2d19aae5","guard":[["hasAny",["abbreviate","acronym","appears in","contains","element","has","includes","item number","no vowels","nth","position","remove vowels","short form","time","without vowels"]],["has","zone"]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["transform.noVowels",["transform.acronym",["sense.lastWord"]]]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-235a2297","guard":[["hasAny",["abbreviate","abbreviation","acronym","appears in","contains","element","has","includes","item number","no vowels","nth","position","remove vowels","short form","time","without vowels"]]],"pyramid":["render.yesNo",["compare.contains",["sense.lastWord"],["transform.noVowels",["transform.acronym",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}]]]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-12977848","guard":[["hasAny",["abbreviated","abbreviation","element","item number","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-3ec762e4","guard":[["hasAny",["abbreviated","abbreviation","element","invert case","item number","nth","position","swap case","toggle case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-a1ee16b2","guard":[["hasAny",["abbreviated","abbreviation","element","item number","lower case","lowercase","nth","position","small letters"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-d8e1c074","guard":[["hasAny",["abbreviated","abbreviation","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-1a9176c6","guard":[["hasAny",["abbreviated","abbreviation","change to","element","item number","nth","position","replace","substitute","swap"]],["has","time"]],"pyramid":["render.code",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-60cd5763","guard":[["hasAny",["abbreviated","abbreviation","change to","element","item number","nth","position","replace","substitute","swap"]],["has","time"]],"pyramid":["render.code",["transform.replace",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-67db6af9","guard":[["hasAny",["abbreviated","abbreviation","change to","element","item number","nth","position","replace","substitute","swap"]],["has","time"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-eac291e1","guard":[["hasAny",["abbreviated","abbreviation","change to","element","item number","nth","position","replace","substitute","swap"]],["has","time"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-7b19a29a","guard":[["hasAny",["a leap year","element","exponent","is a leap year","item number","leap year","nth","position","power","raised to","time","to the power of"]]],"pyramid":["render.yesNo",["compare.isLeap",["compute.power",["sense.wordCount"],{"lit":10}]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-f3955ef7","guard":[["hasAny",["a leap year","element","is a leap year","item number","leap year","left over","mod","modulo","nth","position","remainder","time"]],["has","zone"]],"pyramid":["render.yesNo",["compare.isLeap",["transform.mod",{"lit":12},["sense.wordCount"]]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-f767d9b7","guard":[["hasAny",["an even number","element","even","half","half of","halve","is even","item number","nth","position","time"]],["has","zone"]],"pyramid":["render.yesNo",["compare.isEven",["transform.half",["sense.wordCount"]]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-87179808","guard":[["hasAny",["divides","divisible by","element","evenly divisible","how many vowels","item number","multiple of","nth","number of vowels","position","time","vowel count"]],["has","zone"]],"pyramid":["render.yesNo",["compare.divisible",["sense.wordCount"],["aggregate.vowels",["sense.lastWord"]]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-4a6feb56","guard":[["hasAny",["abbreviate","acronym","acst","aest","cbst","ccst","cpst","cvst","dst","edt","element","esast","fst","gst","hst","item number","lst","ncast","nth","nzst","position","pst","sest","short form","slst","spst","sst","swst","umst","ust","vst","wcast","yst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["transform.acronym",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-2addf2b9","guard":[["hasAny",["cbst","ccst","cpst","cvst","dst","element","fdt","fst","gmt","gst","hst","item number","jdt","kdt","lst","ndt","no vowels","nth","nzst","position","pst","pyt","rdt","remove vowels","sdt","slst","spst","sst","swst","tdt","vst","without vowels","yst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["transform.noVowels",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-63305d4b","guard":[["hasAny",["acst","aest","akdt","ccst","cpst","dst","element","fdt","fst","get","gmt","gst","hst","item number","jdt","kdt","lst","ndt","normalise","normalize","nth","position","pst","pyt","rdt","sakt","samt","simplify the text","sst"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],{"lit":3}]],"mem":null},
{"id":"n-df1796f1","guard":[["hasAny",["acst","aest","akdt","ccst","cpst","dst","element","fdt","fst","get","gmt","gst","hst","item number","jdt","kdt","lst","ndt","normalise","normalize","nth","position","pst","pyt","rdt","sakt","samt","simplify the text","sst"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],{"lit":3}]],"mem":null},
{"id":"n-f7057ca7","guard":[["hasAny",["divides","divisible by","element","evenly divisible","how many vowels","item number","multiple of","nth","number of vowels","position","time","vowel count"]],["has","zone"]],"pyramid":["render.yesNo",["compare.divisible",["sense.wordCount"],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}]]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-7e72c032","guard":[["hasAny",["dst","edt","element","fst","get","gmt","gst","hst","item number","jdt","kdt","ndt","nth","position","pst","pyt","shortest","shortest one","shortest word","sst","tdt","vst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-448fce8f","guard":[["hasAny",["abbreviate","abbreviation","acronym","appears in","code","contains","element","has","includes","item number","nth","position","short form"]]],"pyramid":["render.yesNo",["compare.contains",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.acronym",["sense.after",{"lit":"for"}]]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-05f41d85","guard":[["hasAny",["abbreviate","acronym","code","delete","element","item number","nth","position","remove","short form","strip out","without"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.acronym",["sense.lastWord"]]]],"mem":null},
{"id":"n-16562b24","guard":[["hasAny",["abbreviate","acronym","code","element","item number","nth","position","separate by","short form","split","split by"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.acronym",["sense.lastWord"]]]],"mem":null},
{"id":"n-32ab4c32","guard":[["hasAny",["abbreviate","acronym","code","element","item number","nth","position","separate by","short form","split","split by"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.acronym",["sense.lastWord"]]]],"mem":null},
{"id":"n-7a11610f","guard":[["hasAny",["abbreviate","acronym","code","delete","element","item number","nth","position","remove","short form","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.acronym",["sense.lastWord"]]]],"mem":null},
{"id":"n-d2804f5e","guard":[["hasAny",["abbreviate","acronym","code","element","item number","nth","position","separate by","short form","split","split by"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.acronym",["sense.lastWord"]]]],"mem":null},
{"id":"n-54093904","guard":[["hasAny",["code","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-f570ab31","guard":[["hasAny",["code","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-394221a5","guard":[["hasAny",["code","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-c0be1ad9","guard":[["hasAny",["code","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-1be035bb","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"for"}]]],"mem":{"table":{"the time zone code GST stands":"GST abbreviates Greenwich Standard Time.","the time zone code HST stands":"HST abbreviates Hawaiian Standard Time.","the time zone code SST stands":"SST abbreviates Samoa Standard Time.","the time zone code VLAT stands":"VLAT abbreviates Vladivostok Standard Time.","the time zone code CBST stands":"CBST abbreviates Central Brazilian Standard Time.","the time zone code PST stands":"PST abbreviates Pacific Standard Time.","the time zone code UMST stands":"UMST abbreviates US Mountain Standard Time.","the time zone code SLST stands":"SLST abbreviates Sri Lanka Standard Time.","the time zone code YEKT stands":"YEKT abbreviates Yekaterinburg Time.","the time zone code EEDT stands":"EEDT abbreviates E. Europe Standard Time.","the time zone code CPST stands":"CPST abbreviates Central Pacific Standard Time.","the time zone code JDT stands":"JDT abbreviates Israel Standard Time.","the time zone code FST stands":"FST abbreviates Fiji Standard Time.","the time zone code GMT stands":"GMT abbreviates GMT Standard Time."}}},
{"id":"n-82b95414","guard":[["hasAny",["abbreviate","abbreviation","acronym","an even number","element","even","from roman","in arabic numerals","is even","item number","nth","position","roman numeral value","short form","time","what number is"]]],"pyramid":["render.yesNo",["compare.isEven",["compute.fromRoman",["transform.acronym",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}]]]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-2a639744","guard":[["hasAny",["a square number","abbreviate","abbreviation","acronym","element","from roman","in arabic numerals","item number","nth","perfect square","position","roman numeral value","short form","square number","time","what number is"]],["has","zone"]],"pyramid":["render.yesNo",["compare.isSquare",["compute.fromRoman",["transform.acronym",["sense.lastWord"]]]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1},"."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]]],"mem":null},
{"id":"n-1bc3d0fe","guard":[["hasAny",["abbreviate","acronym","element","item number","jdt","nth","position","separate by","short form","split","split by"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.acronym",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}]]]],"mem":null},
{"id":"n-4ea72676","guard":[["hasAny",["abbreviate","acronym","element","item number","jdt","nth","position","separate by","short form","split","split by"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.acronym",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}]]]],"mem":null},
{"id":"n-546d9a09","guard":[["hasAny",["abbreviate","acronym","delete","element","item number","jdt","nth","position","remove","short form","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.acronym",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}]]]],"mem":null},
{"id":"n-bb69b2ab","guard":[["hasAny",["abbreviate","acronym","delete","element","item number","jdt","nth","position","remove","short form","strip out","without"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.acronym",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}]]]],"mem":null},
{"id":"n-dca476ca","guard":[["hasAny",["abbreviate","acronym","element","item number","jdt","nth","position","separate by","short form","split","split by"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}],["transform.acronym",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}]]]],"mem":null},
{"id":"n-0e5ea297","guard":[["has","yst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-1049b19a","guard":[["has","dst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Dateline Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-1382d60f","guard":[["has","esast"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates E. South America Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-15a0d04a","guard":[["has","pyt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Paraguay Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-1bbcc8ca","guard":[["has","sst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samoa Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-2a77721f","guard":[["has","cpst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Pacific Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-2c575d72","guard":[["has","aest"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-2eab92c8","guard":[["has","jdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Israel Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-2ec4555c","guard":[["has","gmt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates GMT Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-2fa1ba88","guard":[["has","rdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-36e526a9","guard":[["has","cvst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-39ed54d7","guard":[["has","ncast"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates N. Central Asia Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-3ac11f1d","guard":[["has","lst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-4233f887","guard":[["has","uedt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Eastern Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-42f24b57","guard":[["has","akdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-47f72ed7","guard":[["has","sest"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-4dea9145","guard":[["has","sakt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-50d41073","guard":[["has","hst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Hawaiian Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-51f25839","guard":[["has","umst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Mountain Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-567aacbd","guard":[["has","wcast"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates W. Central Africa Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-57536620","guard":[["has","ccst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-5e43c79d","guard":[["has","slst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sri Lanka Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-604b86c6","guard":[["has","acst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-61343931","guard":[["has","yekt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yekaterinburg Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-665f35e4","guard":[["has","fdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-763ded17","guard":[["has","eedt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates E. Europe Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-7bb05d6e","guard":[["has","nzst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates New Zealand Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-7c8eb021","guard":[["has","get"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Georgian Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-85ff00d3","guard":[["has","fst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Fiji Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-92403177","guard":[["has","tdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Turkey Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-9bf35fea","guard":[["has","ndt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Newfoundland Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-a5d34ed3","guard":[["has","swst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Western Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-b14f54e1","guard":[["has","vlat"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Vladivostok Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-b7a3322a","guard":[["has","cbst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Brazilian Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-c0e6494d","guard":[["has","gst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Greenwich Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-c124ddcd","guard":[["has","kdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Kamchatka Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-c6468e1f","guard":[["has","vst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Venezuela Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-ca6935e6","guard":[["has","spst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Pacific Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-cf0035df","guard":[["has","ust"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-cf468c73","guard":[["has","pst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Pacific Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-d852ef1b","guard":[["has","samt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-e2cfe683","guard":[["has","sdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-ecc360ef","guard":[["has","edt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Eastern Daylight Time."]},["render.list",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}]]],"mem":null},
{"id":"n-001dd1d5","guard":[["hasAny",["element","esast","item number","nth","position"]]],"pyramid":["render.template",{"lit":["ESAST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-0202c6c6","guard":[["hasAny",["element","hst","item number","nth","position"]]],"pyramid":["render.template",{"lit":["HST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-020835db","guard":[["hasAny",["element","item number","nth","position","slst"]]],"pyramid":["render.template",{"lit":["SLST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-1408cd78","guard":[["hasAny",["element","gst","item number","nth","position"]]],"pyramid":["render.template",{"lit":["GST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-1c5ffd05","guard":[["hasAny",["element","item number","nth","position","vst"]]],"pyramid":["render.template",{"lit":["VST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-1ce9961f","guard":[["hasAny",["element","item number","nth","position","umst"]]],"pyramid":["render.template",{"lit":["UMST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-2d641644","guard":[["hasAny",["element","item number","nth","position","spst"]]],"pyramid":["render.template",{"lit":["SPST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-32332099","guard":[["hasAny",["element","item number","nth","position","samt"]]],"pyramid":["render.template",{"lit":["SAMT abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-3649f8c3","guard":[["hasAny",["element","item number","nth","position","tdt"]]],"pyramid":["render.template",{"lit":["TDT abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-396614e5","guard":[["hasAny",["edt","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["EDT abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-3f7ea3fb","guard":[["hasAny",["akdt","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["AKDT abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-456538c4","guard":[["hasAny",["element","item number","nth","position","sest"]]],"pyramid":["render.template",{"lit":["SEST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-48845b46","guard":[["hasAny",["element","item number","nth","position","sakt"]]],"pyramid":["render.template",{"lit":["SAKT abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-4d619a29","guard":[["hasAny",["element","item number","nth","position","rdt"]]],"pyramid":["render.template",{"lit":["RDT abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-56206505","guard":[["hasAny",["element","item number","jdt","nth","position"]]],"pyramid":["render.template",{"lit":["JDT abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-60d6afc1","guard":[["hasAny",["element","item number","nth","position","yekt"]]],"pyramid":["render.template",{"lit":["YEKT abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-61542aac","guard":[["hasAny",["element","fdt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["FDT abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-61d80c10","guard":[["hasAny",["eedt","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["EEDT abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-712419fd","guard":[["hasAny",["element","fst","item number","nth","position"]]],"pyramid":["render.template",{"lit":["FST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-73938c41","guard":[["hasAny",["element","item number","nth","position","sst"]]],"pyramid":["render.template",{"lit":["SST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-75647dba","guard":[["hasAny",["element","item number","nth","position","pst"]]],"pyramid":["render.template",{"lit":["PST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-7f6519c7","guard":[["hasAny",["element","item number","nth","position","wcast"]]],"pyramid":["render.template",{"lit":["WCAST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-84d9f5ad","guard":[["hasAny",["element","item number","nth","position","ust"]]],"pyramid":["render.template",{"lit":["UST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-86a60f91","guard":[["hasAny",["element","item number","nth","position","sdt"]]],"pyramid":["render.template",{"lit":["SDT abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-88efcfd4","guard":[["hasAny",["dst","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["DST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-95793e18","guard":[["hasAny",["element","get","item number","nth","position"]]],"pyramid":["render.template",{"lit":["GET abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-97723877","guard":[["hasAny",["element","item number","ncast","nth","position"]]],"pyramid":["render.template",{"lit":["NCAST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-9a9e9a85","guard":[["hasAny",["aest","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["AEST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-9c5885f6","guard":[["hasAny",["element","item number","lst","nth","position"]]],"pyramid":["render.template",{"lit":["LST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-9edfd83c","guard":[["hasAny",["cbst","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["CBST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-a1abbd16","guard":[["hasAny",["element","item number","nth","position","uedt"]]],"pyramid":["render.template",{"lit":["UEDT abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-abe94ec0","guard":[["hasAny",["cpst","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["CPST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-b71d9084","guard":[["hasAny",["cvst","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["CVST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-b77c86c5","guard":[["hasAny",["element","item number","kdt","nth","position"]]],"pyramid":["render.template",{"lit":["KDT abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-bac20ffa","guard":[["hasAny",["element","item number","nth","position","vlat"]]],"pyramid":["render.template",{"lit":["VLAT abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-bdf86499","guard":[["hasAny",["element","gmt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["GMT abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-c707c5a9","guard":[["hasAny",["element","item number","nth","nzst","position"]]],"pyramid":["render.template",{"lit":["NZST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-caa74e30","guard":[["hasAny",["element","item number","nth","position","pyt"]]],"pyramid":["render.template",{"lit":["PYT abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-cba52368","guard":[["hasAny",["element","item number","nth","position","yst"]]],"pyramid":["render.template",{"lit":["YST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-d06f9877","guard":[["hasAny",["element","item number","nth","position","swst"]]],"pyramid":["render.template",{"lit":["SWST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-e1eca9cb","guard":[["hasAny",["acst","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["ACST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-e27f1f36","guard":[["hasAny",["ccst","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["CCST abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-fab592b1","guard":[["hasAny",["element","item number","ndt","nth","position"]]],"pyramid":["render.template",{"lit":["NDT abbreviates ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"timezones-windows"},{"lit":"abbreviation"}],{"lit":1}],{"lit":"timezones-windows"},{"lit":"abbreviation"},{"lit":"time zone"}]],"mem":null},
{"id":"n-02af79e7","guard":[["has","sdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-047c7469","guard":[["has","edt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Eastern Daylight Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-053f523e","guard":[["hasAny",["abbreviation","cvst","has","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation CVST":"CVST abbreviates Cape Verde Standard Time."}}},
{"id":"n-08d501e2","guard":[["hasAny",["code","fst","stands","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the time zone code FST stands for what":"FST abbreviates Fiji Standard Time."}}},
{"id":"n-0c382edd","guard":[["hasAny",["abbreviated","edt","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated EDT":"EDT abbreviates Eastern Daylight Time."}}},
{"id":"n-0da0de30","guard":[["hasAny",["abbreviation","fdt","has","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation FDT":"FDT abbreviates FLE Standard Time."}}},
{"id":"n-18e7ba5c","guard":[["hasAny",["code","jdt","stands","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the time zone code JDT stands for what":"JDT abbreviates Israel Standard Time."}}},
{"id":"n-1b5cdec4","guard":[["hasAny",["abbreviation","has","time","ust","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation UST":"UST abbreviates Ulaanbaatar Standard Time."}}},
{"id":"n-28e91a70","guard":[["has","nzst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates New Zealand Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-29749726","guard":[["hasAny",["abbreviation","has","time","yst","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation YST":"YST abbreviates Yakutsk Standard Time."}}},
{"id":"n-2ca78df5","guard":[["hasAny",["code","eedt","stands","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the time zone code EEDT stands for what":"EEDT abbreviates E. Europe Standard Time."}}},
{"id":"n-2d96c292","guard":[["has","dst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Dateline Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-2e0cdb6a","guard":[["hasAny",["abbreviated","name","time","uedt","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated UEDT":"UEDT abbreviates US Eastern Standard Time."}}},
{"id":"n-3368a927","guard":[["hasAny",["abbreviated","name","ncast","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated NCAST":"NCAST abbreviates N. Central Asia Standard Time."}}},
{"id":"n-38ddf49c","guard":[["has","swst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Western Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-3d1f835b","guard":[["hasAny",["code","gst","stands","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the time zone code GST stands for what":"GST abbreviates Greenwich Standard Time."}}},
{"id":"n-3dc830b9","guard":[["hasAny",["abbreviated","dst","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated DST":"DST abbreviates Dateline Standard Time."}}},
{"id":"n-471d2d8d","guard":[["has","fdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-4a2f5d13","guard":[["has","kdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Kamchatka Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-4bac0e41","guard":[["has","get"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Georgian Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-4d416f6b","guard":[["hasAny",["abbreviated","name","tdt","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated TDT":"TDT abbreviates Turkey Standard Time."}}},
{"id":"n-4e2ce107","guard":[["hasAny",["abbreviation","akdt","has","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation AKDT":"AKDT abbreviates Alaskan Standard Time."}}},
{"id":"n-5287c5ea","guard":[["hasAny",["cbst","code","stands","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the time zone code CBST stands for what":"CBST abbreviates Central Brazilian Standard Time."}}},
{"id":"n-528d67c1","guard":[["hasAny",["abbreviation","has","sest","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation SEST":"SEST abbreviates SA Eastern Standard Time."}}},
{"id":"n-54028d90","guard":[["hasAny",["code","gmt","stands","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the time zone code GMT stands for what":"GMT abbreviates GMT Standard Time."}}},
{"id":"n-57bae368","guard":[["hasAny",["code","stands","time","umst","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the time zone code UMST stands for what":"UMST abbreviates US Mountain Standard Time."}}},
{"id":"n-653b1316","guard":[["hasAny",["code","slst","stands","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the time zone code SLST stands for what":"SLST abbreviates Sri Lanka Standard Time."}}},
{"id":"n-6765c7a1","guard":[["has","samt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-6c4f2bdd","guard":[["hasAny",["abbreviation","has","samt","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation SAMT":"SAMT abbreviates Samara Time."}}},
{"id":"n-6d1748e3","guard":[["has","vst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Venezuela Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-6e40f36b","guard":[["hasAny",["abbreviation","aest","has","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation AEST":"AEST abbreviates AUS Eastern Standard Time."}}},
{"id":"n-6f1c3dc0","guard":[["hasAny",["abbreviated","name","time","vst","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated VST":"VST abbreviates Venezuela Standard Time."}}},
{"id":"n-7f78b556","guard":[["hasAny",["code","hst","stands","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the time zone code HST stands for what":"HST abbreviates Hawaiian Standard Time."}}},
{"id":"n-85eb43a8","guard":[["has","pyt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Paraguay Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-8c6e6b11","guard":[["hasAny",["abbreviated","name","pyt","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated PYT":"PYT abbreviates Paraguay Standard Time."}}},
{"id":"n-923c0848","guard":[["hasAny",["abbreviated","name","nzst","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated NZST":"NZST abbreviates New Zealand Standard Time."}}},
{"id":"n-941b62e7","guard":[["hasAny",["abbreviation","has","sakt","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation SAKT":"SAKT abbreviates Sakhalin Standard Time."}}},
{"id":"n-a033ad36","guard":[["has","lst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-a3ae2851","guard":[["has","yst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-aa48672a","guard":[["hasAny",["abbreviation","has","lst","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation LST":"LST abbreviates Libya Standard Time."}}},
{"id":"n-ae897602","guard":[["hasAny",["abbreviated","kdt","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated KDT":"KDT abbreviates Kamchatka Standard Time."}}},
{"id":"n-af645101","guard":[["hasAny",["abbreviated","name","spst","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated SPST":"SPST abbreviates SA Pacific Standard Time."}}},
{"id":"n-afddf73a","guard":[["has","uedt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Eastern Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-b3d3070c","guard":[["has","tdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Turkey Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-b723a213","guard":[["hasAny",["code","cpst","stands","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the time zone code CPST stands for what":"CPST abbreviates Central Pacific Standard Time."}}},
{"id":"n-b75b4967","guard":[["hasAny",["abbreviated","name","swst","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated SWST":"SWST abbreviates SA Western Standard Time."}}},
{"id":"n-beb7c88f","guard":[["has","akdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-c2453284","guard":[["has","ndt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Newfoundland Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-c2be68a5","guard":[["hasAny",["abbreviation","esast","has","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation ESAST":"ESAST abbreviates E. South America Standard Time."}}},
{"id":"n-c5ee88f3","guard":[["has","rdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-c5f66f0e","guard":[["has","spst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Pacific Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-c6ce4eec","guard":[["hasAny",["abbreviated","name","ndt","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated NDT":"NDT abbreviates Newfoundland Standard Time."}}},
{"id":"n-c9e91751","guard":[["hasAny",["abbreviation","ccst","has","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation CCST":"CCST abbreviates Canada Central Standard Time."}}},
{"id":"n-d1f68eff","guard":[["hasAny",["code","stands","time","yekt","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the time zone code YEKT stands for what":"YEKT abbreviates Yekaterinburg Time."}}},
{"id":"n-d368c435","guard":[["hasAny",["code","sst","stands","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the time zone code SST stands for what":"SST abbreviates Samoa Standard Time."}}},
{"id":"n-d9e171c4","guard":[["hasAny",["code","stands","time","vlat","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the time zone code VLAT stands for what":"VLAT abbreviates Vladivostok Standard Time."}}},
{"id":"n-dcf517aa","guard":[["hasAny",["abbreviation","has","rdt","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation RDT":"RDT abbreviates Romance Standard Time."}}},
{"id":"n-dd70bb14","guard":[["hasAny",["code","pst","stands","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the time zone code PST stands for what":"PST abbreviates Pacific Standard Time."}}},
{"id":"n-e2861d98","guard":[["hasAny",["abbreviation","has","sdt","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation SDT":"SDT abbreviates Syria Standard Time."}}},
{"id":"n-e454acc3","guard":[["has","sakt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-e5ea34fa","guard":[["hasAny",["abbreviated","name","time","wcast","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated WCAST":"WCAST abbreviates W. Central Africa Standard Time."}}},
{"id":"n-e616dc8d","guard":[["has","acst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-e7b6e0e4","guard":[["has","cvst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-eb16d6f4","guard":[["hasAny",["abbreviated","get","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated GET":"GET abbreviates Georgian Standard Time."}}},
{"id":"n-ec608820","guard":[["has","ust"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-f7fd68f7","guard":[["has","sest"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-fa7bd697","guard":[["hasAny",["abbreviation","acst","has","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation ACST":"ACST abbreviates AUS Central Standard Time."}}},
{"id":"n-ff513ac3","guard":[["has","ccst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-ff95fbc0","guard":[["has","aest"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard Time."]},["sense.lastWord"]],"mem":null},
{"id":"n-14d7410f","guard":[["has","sest"]],"pyramid":["render.template",{"lit":["SEST abbreviates SA Eastern Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-1c51c33a","guard":[["has","fdt"]],"pyramid":["render.template",{"lit":["FDT abbreviates FLE Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-20140a68","guard":[["has","vst"]],"pyramid":["render.template",{"lit":["VST abbreviates Venezuela Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-21e4c88e","guard":[["has","pst"]],"pyramid":["render.template",{"lit":["PST abbreviates Pacific Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-21e971f3","guard":[["has","samt"]],"pyramid":["render.template",{"lit":["SAMT abbreviates Samara ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2908ca5d","guard":[["has","kdt"]],"pyramid":["render.template",{"lit":["KDT abbreviates Kamchatka Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-2a8e8a9d","guard":[["hasAny",["hst","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Hawaiian Standard Time."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2ad70823","guard":[["has","nzst"]],"pyramid":["render.template",{"lit":["NZST abbreviates New Zealand Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-2c595b02","guard":[["has","eedt"]],"pyramid":["render.template",{"lit":["EEDT abbreviates E. Europe Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-31a288e1","guard":[["has","cpst"]],"pyramid":["render.template",{"lit":["CPST abbreviates Central Pacific Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-325e4a4d","guard":[["has","yst"]],"pyramid":["render.template",{"lit":["YST abbreviates Yakutsk Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3dfe360a","guard":[["has","jdt"]],"pyramid":["render.template",{"lit":["JDT abbreviates Israel Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4c9fcf22","guard":[["has","ccst"]],"pyramid":["render.template",{"lit":["CCST abbreviates Canada Central Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4cbb7f1a","guard":[["has","cvst"]],"pyramid":["render.template",{"lit":["CVST abbreviates Cape Verde Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-58724296","guard":[["has","akdt"]],"pyramid":["render.template",{"lit":["AKDT abbreviates Alaskan Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-644ba327","guard":[["has","aest"]],"pyramid":["render.template",{"lit":["AEST abbreviates AUS Eastern Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-651e5a78","guard":[["hasAny",["jdt","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Israel Standard Time."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6a3beec3","guard":[["hasAny",["pst","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Pacific Standard Time."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6c294504","guard":[["has","cbst"]],"pyramid":["render.template",{"lit":["CBST abbreviates Central Brazilian Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-6f817718","guard":[["has","yekt"]],"pyramid":["render.template",{"lit":["YEKT abbreviates Yekaterinburg ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-75443d98","guard":[["has","fst"]],"pyramid":["render.template",{"lit":["FST abbreviates Fiji Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-764e95e6","guard":[["has","hst"]],"pyramid":["render.template",{"lit":["HST abbreviates Hawaiian Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-785b0b56","guard":[["hasAny",["shortest","shortest one","shortest word","sst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samoa Standard Time."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-822bd97c","guard":[["has","spst"]],"pyramid":["render.template",{"lit":["SPST abbreviates SA Pacific Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-847baa73","guard":[["has","dst"]],"pyramid":["render.template",{"lit":["DST abbreviates Dateline Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-87534442","guard":[["has","swst"]],"pyramid":["render.template",{"lit":["SWST abbreviates SA Western Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-8f2e5a19","guard":[["has","tdt"]],"pyramid":["render.template",{"lit":["TDT abbreviates Turkey Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-91df1e6d","guard":[["has","get"]],"pyramid":["render.template",{"lit":["GET abbreviates Georgian Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-a0f42b9a","guard":[["hasAny",["fst","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Fiji Standard Time."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a4e8953e","guard":[["has","acst"]],"pyramid":["render.template",{"lit":["ACST abbreviates AUS Central Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a8103592","guard":[["has","edt"]],"pyramid":["render.template",{"lit":["EDT abbreviates Eastern Daylight ",{"slot":0},"."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-a9bfadf3","guard":[["hasAny",["gst","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Greenwich Standard Time."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ae7f9eb9","guard":[["has","umst"]],"pyramid":["render.template",{"lit":["UMST abbreviates US Mountain Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b356cb80","guard":[["has","rdt"]],"pyramid":["render.template",{"lit":["RDT abbreviates Romance Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b37e9d94","guard":[["has","vlat"]],"pyramid":["render.template",{"lit":["VLAT abbreviates Vladivostok Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b875c6f0","guard":[["has","ndt"]],"pyramid":["render.template",{"lit":["NDT abbreviates Newfoundland Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-b87cd932","guard":[["has","sakt"]],"pyramid":["render.template",{"lit":["SAKT abbreviates Sakhalin Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-beb10e55","guard":[["has","gst"]],"pyramid":["render.template",{"lit":["GST abbreviates Greenwich Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c7531e2a","guard":[["has","sdt"]],"pyramid":["render.template",{"lit":["SDT abbreviates Syria Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c8908b2f","guard":[["has","pyt"]],"pyramid":["render.template",{"lit":["PYT abbreviates Paraguay Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-c8fb927c","guard":[["has","uedt"]],"pyramid":["render.template",{"lit":["UEDT abbreviates US Eastern Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-cf3052f0","guard":[["has","lst"]],"pyramid":["render.template",{"lit":["LST abbreviates Libya Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ef2e268a","guard":[["has","ust"]],"pyramid":["render.template",{"lit":["UST abbreviates Ulaanbaatar Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f6f4b608","guard":[["has","sst"]],"pyramid":["render.template",{"lit":["SST abbreviates Samoa Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ffe2bc05","guard":[["has","slst"]],"pyramid":["render.template",{"lit":["SLST abbreviates Sri Lanka Standard ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-05e9af8a","guard":[["hasAny",["eedt","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates E. Europe Standard Time."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-07257077","guard":[["hasAny",["cbst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Brazilian Standard Time."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1434e5f7","guard":[["has","esast"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates E. South America Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2842ed4e","guard":[["has","fdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2958877d","guard":[["has","ndt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Newfoundland Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-353a3cd8","guard":[["has","ncast"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates N. Central Asia Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-369efb29","guard":[["has","pyt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Paraguay Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-3ae3ac5c","guard":[["hasAny",["first letters of the name","initials","wcast"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Africa Standard Time."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]]],"mem":null},
{"id":"n-41bee325","guard":[["has","wcast"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates W. Central Africa Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-452b5333","guard":[["has","akdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4903f199","guard":[["has","ccst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4afee841","guard":[["has","vst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Venezuela Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-5356ec55","guard":[["hasAny",["item number","nth","position","umst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Mountain Standard Time."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-54615362","guard":[["hasAny",["first letters of the name","initials","ncast"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Asia Standard Time."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]]],"mem":null},
{"id":"n-58144fd1","guard":[["has","nzst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates New Zealand Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-608e9f70","guard":[["has","aest"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-64bd6733","guard":[["has","sest"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7512482b","guard":[["has","get"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Georgian Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-751467ac","guard":[["has","sdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-81d324d1","guard":[["hasAny",["item number","nth","position","yekt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yekaterinburg Time."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-81f0bc79","guard":[["has","cvst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-896cf97b","guard":[["has","kdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Kamchatka Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-9248c47b","guard":[["has","sakt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a11d73f8","guard":[["has","yst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a93ae629","guard":[["has","uedt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-aaecc04c","guard":[["has","acst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-afb31ee7","guard":[["hasAny",["item number","nth","position","slst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sri Lanka Standard Time."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-bc478004","guard":[["has","ust"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-bd739003","guard":[["has","rdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d039d726","guard":[["has","tdt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Turkey Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-d36e1adc","guard":[["hasAny",["cpst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Pacific Standard Time."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e01e8e7e","guard":[["has","spst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Pacific Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-e8a88384","guard":[["hasAny",["item number","nth","position","vlat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Vladivostok Standard Time."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ee163fef","guard":[["has","samt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f06b3cda","guard":[["has","edt"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Eastern Daylight ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-f76a007c","guard":[["has","lst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-fa7c8bfe","guard":[["has","swst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Western Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-fc008e82","guard":[["hasAny",["esast","first letters of the name","initials"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," South America Standard Time."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]]],"mem":null},
{"id":"n-fca2185f","guard":[["has","dst"]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Dateline Standard ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-03e1bf1a","guard":[["hasAny",["all caps","capital letters","capitals","swst","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Western Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-05a810a4","guard":[["hasAny",["invert case","samt","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-082aa367","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","vst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Venezuela Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-099e07ef","guard":[["hasAny",["invert case","rdt","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-0c6d1086","guard":[["hasAny",["all caps","capital letters","capitals","get","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Georgian Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-0eb40f82","guard":[["hasAny",["acst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-0f72c181","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sakt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0fa6fb02","guard":[["hasAny",["first letters of the name","initials","ncast"]]],"pyramid":["render.template",{"lit":["NCAST abbreviates ",{"slot":0}," Central Asia Standard ",{"slot":1},"."]},["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-110a9107","guard":[["hasAny",["capitalise","capitalize","capitalize each word","swst","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Western Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-12858cbb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","ust"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-1378f13b","guard":[["hasAny",["jdt","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Israel Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-14818146","guard":[["hasAny",["invert case","ndt","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Newfoundland Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-1744faf9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","samt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-19df2ecc","guard":[["hasAny",["all caps","capital letters","capitals","spst","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Pacific Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-1b6d8a76","guard":[["hasAny",["acst","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-1cbc8aad","guard":[["hasAny",["all caps","capital letters","capitals","rdt","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-1e7bc41f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pyt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Paraguay Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-26461e6c","guard":[["hasAny",["all caps","capital letters","capitals","tdt","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Turkey Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-27c271da","guard":[["hasAny",["shortest","shortest one","shortest word","sst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samoa Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2961c6a0","guard":[["hasAny",["acst","all caps","capital letters","capitals","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-29770122","guard":[["hasAny",["item number","nth","position","sest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-2cba0609","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lst","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2d08f5c7","guard":[["hasAny",["cvst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-2dd40cb4","guard":[["hasAny",["dst","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Dateline Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-301ccf19","guard":[["hasAny",["all caps","capital letters","capitals","upper case","uppercase","yst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-305f9431","guard":[["hasAny",["all caps","capital letters","capitals","fdt","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-33f757f8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kdt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Kamchatka Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-3424f5da","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ccst","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-34bedebc","guard":[["hasAny",["akdt","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-380c9a40","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cvst","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3a081459","guard":[["hasAny",["all caps","capital letters","capitals","sdt","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3a41c50b","guard":[["hasAny",["aest","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3cecbeeb","guard":[["hasAny",["invert case","sakt","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3e443f48","guard":[["hasAny",["akdt","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3f50bcbc","guard":[["hasAny",["invert case","nzst","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates New Zealand Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-42bf2087","guard":[["hasAny",["all caps","capital letters","capitals","ccst","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4352624b","guard":[["hasAny",["lower case","lowercase","small letters","spst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Pacific Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-4580fb14","guard":[["hasAny",["fdt","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-45a32f2e","guard":[["hasAny",["get","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Georgian Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-45e8a9a7","guard":[["hasAny",["lower case","lowercase","pyt","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Paraguay Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-462b0333","guard":[["hasAny",["capitalise","capitalize","capitalize each word","spst","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Pacific Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-489ad5e6","guard":[["hasAny",["invert case","swap case","swst","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Western Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-4a4fba71","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ndt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Newfoundland Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-4ae7ec3f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","get","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Georgian Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-4ce9bfbf","guard":[["hasAny",["item number","nth","position","sakt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-4d5d7cc2","guard":[["hasAny",["all caps","capital letters","capitals","cvst","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-52589e33","guard":[["hasAny",["aest","all caps","capital letters","capitals","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-560e0f10","guard":[["hasAny",["dst","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Dateline Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-58b2ec16","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sest","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-5afd7620","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nzst","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates New Zealand Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-5df6c590","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dst","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Dateline Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-5ed330b1","guard":[["hasAny",["lower case","lowercase","small letters","uedt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Eastern Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-5f41225e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dst","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Dateline Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-5ff7e22c","guard":[["hasAny",["kdt","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Kamchatka Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-63ab75a6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","spst","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Pacific Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-66285d9a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","uedt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Eastern Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-667ef8f9","guard":[["hasAny",["lower case","lowercase","sdt","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-66deb296","guard":[["hasAny",["lower case","lowercase","small letters","tdt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Turkey Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-67c49530","guard":[["hasAny",["all caps","capital letters","capitals","pyt","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Paraguay Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-67e8ade9","guard":[["hasAny",["aest","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-681e27c5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","get","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Georgian Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-68316ed6","guard":[["hasAny",["item number","nth","position","sdt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-68d2e700","guard":[["hasAny",["invert case","sdt","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-6c320874","guard":[["hasAny",["cvst","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-6d2c1944","guard":[["hasAny",["invert case","pyt","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Paraguay Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-6d30bf94","guard":[["hasAny",["invert case","swap case","toggle case","yst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-6d55e58b","guard":[["hasAny",["invert case","sest","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-6d580553","guard":[["hasAny",["invert case","swap case","toggle case","uedt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-6f0cd7bd","guard":[["hasAny",["fst","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Fiji Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-6f90d220","guard":[["hasAny",["invert case","swap case","tdt","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Turkey Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-70cd65be","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tdt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Turkey Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-7190a106","guard":[["hasAny",["lower case","lowercase","ndt","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Newfoundland Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-721ef886","guard":[["hasAny",["item number","lst","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-72423357","guard":[["hasAny",["cvst","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-73238187","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","uedt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-779e8565","guard":[["hasAny",["invert case","kdt","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Kamchatka Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-77c2bd3c","guard":[["hasAny",["akdt","all caps","capital letters","capitals","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7ac69df8","guard":[["hasAny",["pst","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Pacific Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7ad0f4b1","guard":[["hasAny",["item number","nth","position","rdt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-7add8a5f","guard":[["hasAny",["all caps","capital letters","capitals","edt","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Eastern Daylight ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-7c45aa1e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","rdt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7d05eb59","guard":[["hasAny",["all caps","capital letters","capitals","samt","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7d6ca13d","guard":[["hasAny",["cvst","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-7f41f41f","guard":[["hasAny",["lower case","lowercase","small letters","yst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8053a75e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kdt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Kamchatka Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-8173635f","guard":[["hasAny",["all caps","capital letters","capitals","upper case","uppercase","ust"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-84d60498","guard":[["hasAny",["aest","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-84e7b3ae","guard":[["hasAny",["all caps","capital letters","capitals","ndt","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Newfoundland Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-8520e06d","guard":[["hasAny",["all caps","capital letters","capitals","kdt","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Kamchatka Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-853be620","guard":[["hasAny",["lower case","lowercase","samt","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-861858f5","guard":[["hasAny",["acst","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-872a77d1","guard":[["hasAny",["lower case","lowercase","rdt","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-882f3ac3","guard":[["hasAny",["ccst","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-8c1ea0c2","guard":[["hasAny",["acst","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8da0346b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ndt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Newfoundland Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-8ece1a82","guard":[["hasAny",["capitalise","capitalize","capitalize each word","rdt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-8fa27c0e","guard":[["hasAny",["invert case","swap case","toggle case","uedt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Eastern Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-905f652f","guard":[["hasAny",["aest","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-911cab76","guard":[["hasAny",["all caps","capital letters","capitals","lst","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-914b33e3","guard":[["hasAny",["get","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Georgian Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-935c4f9e","guard":[["hasAny",["akdt","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-954033d1","guard":[["hasAny",["invert case","swap case","toggle case","ust"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-9564a42a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sdt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-95b3ae16","guard":[["hasAny",["gmt","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates GMT Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-960a91e2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","vst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Venezuela Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-98b44c2c","guard":[["hasAny",["invert case","rdt","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-99de2b12","guard":[["hasAny",["fdt","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9b872685","guard":[["hasAny",["lower case","lowercase","nzst","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates New Zealand Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-9c5c6e23","guard":[["hasAny",["invert case","sest","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9d38ff8d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sest","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9dde1e82","guard":[["hasAny",["akdt","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a0498b5b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pyt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Paraguay Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-a080e30e","guard":[["hasAny",["invert case","spst","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Pacific Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-a0f64551","guard":[["hasAny",["get","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Georgian Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-a2470d85","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","yst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a2ca95ce","guard":[["hasAny",["akdt","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-a5c62978","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sakt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a6d802d3","guard":[["hasAny",["invert case","swap case","tdt","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Turkey Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-a701d242","guard":[["hasAny",["invert case","swap case","toggle case","vst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Venezuela Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-a7c0ce0d","guard":[["hasAny",["dst","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Dateline Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-a9dec244","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nzst","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates New Zealand Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-abfb9fda","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sdt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ac0bab58","guard":[["hasAny",["item number","nth","position","yst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-ad0d230e","guard":[["hasAny",["ccst","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ad0f49fb","guard":[["hasAny",["invert case","swap case","toggle case","ust"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ad82c776","guard":[["hasAny",["invert case","sdt","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b08754f0","guard":[["hasAny",["aest","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-b0c8b533","guard":[["hasAny",["invert case","pyt","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Paraguay Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-b22aeffb","guard":[["hasAny",["invert case","kdt","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Kamchatka Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-b43d4fa0","guard":[["hasAny",["all caps","capital letters","capitals","dst","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Dateline Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-b45497bd","guard":[["hasAny",["ccst","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b86d0bd8","guard":[["hasAny",["invert case","ndt","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Newfoundland Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-b8edeff9","guard":[["hasAny",["all caps","capital letters","capitals","nzst","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates New Zealand Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-bcd9f714","guard":[["hasAny",["item number","nth","position","samt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-bda341e7","guard":[["hasAny",["lower case","lowercase","lst","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-bda7327a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","ust"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-be196b3d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","yst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-c123b174","guard":[["hasAny",["invert case","lst","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c2a8ac35","guard":[["hasAny",["item number","nth","position","ust"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-c35e84df","guard":[["hasAny",["all caps","capital letters","capitals","upper case","uppercase","vst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Venezuela Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-c3e493bc","guard":[["hasAny",["lower case","lowercase","sakt","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c4782a39","guard":[["hasAny",["esast","first letters of the name","initials"]]],"pyramid":["render.template",{"lit":["ESAST abbreviates ",{"slot":0}," South America Standard ",{"slot":1},"."]},["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c4f1206c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","samt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c50423f3","guard":[["hasAny",["invert case","nzst","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates New Zealand Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-c505cfe5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","swst","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Western Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-c5a9527f","guard":[["hasAny",["ccst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-c5adb6dd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","edt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Eastern Daylight ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-c6b79235","guard":[["hasAny",["hst","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Hawaiian Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c722755d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cvst","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-c76d4961","guard":[["hasAny",["acst","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c8155cb0","guard":[["hasAny",["lower case","lowercase","small letters","vst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Venezuela Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-cd80fb7b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fdt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-cf356a63","guard":[["hasAny",["edt","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Eastern Daylight ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-d094f079","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ccst","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d4df55e3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","edt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Eastern Daylight ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-d9347322","guard":[["hasAny",["acst","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-d9d4f9fe","guard":[["hasAny",["lower case","lowercase","small letters","swst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Western Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-db3330c3","guard":[["hasAny",["all caps","capital letters","capitals","sest","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-dd325e5a","guard":[["hasAny",["invert case","lst","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-de2f5aa6","guard":[["hasAny",["invert case","samt","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-e011643f","guard":[["hasAny",["invert case","swap case","toggle case","vst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Venezuela Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-e10fe41c","guard":[["hasAny",["edt","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Eastern Daylight ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-e18a21f3","guard":[["hasAny",["fdt","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-e24b7b7e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lst","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-e3040fbb","guard":[["hasAny",["lower case","lowercase","small letters","ust"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e3fa55fe","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fdt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e64a8301","guard":[["hasAny",["invert case","swap case","toggle case","yst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e74818ea","guard":[["hasAny",["fdt","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-e834b9ff","guard":[["hasAny",["akdt","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-eaa3322f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tdt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Turkey Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-ee614359","guard":[["hasAny",["all caps","capital letters","capitals","sakt","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f023af88","guard":[["hasAny",["invert case","swap case","swst","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Western Standard ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-f0a22256","guard":[["hasAny",["aest","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-f1bdc9ae","guard":[["hasAny",["invert case","sakt","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-f4aa2201","guard":[["hasAny",["first letters of the name","initials","wcast"]]],"pyramid":["render.template",{"lit":["WCAST abbreviates ",{"slot":0}," Central Africa Standard ",{"slot":1},"."]},["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-f6304d3b","guard":[["hasAny",["invert case","spst","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Pacific Standard ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-f7752d1e","guard":[["hasAny",["edt","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Eastern Daylight ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-f7bf04f1","guard":[["hasAny",["lower case","lowercase","sest","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-fcf21208","guard":[["hasAny",["gst","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Greenwich Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ff4f725e","guard":[["hasAny",["all caps","capital letters","capitals","uedt","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Eastern Standard ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-04de7ef4","guard":[["hasAny",["cvst","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-07725945","guard":[["hasAny",["each word","kdt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Kamchatka Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-0773489c","guard":[["hasAny",["each word","split into words","yst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-077b3f55","guard":[["hasAny",["each word","ndt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Newfoundland Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-08a6462d","guard":[["hasAny",["each word","sdt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-0a1f376b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gst","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Greenwich Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-0a46f02f","guard":[["hasAny",["dst","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Dateline Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-0b51c95e","guard":[["hasAny",["each word","split into words","ust"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0b9f318d","guard":[["hasAny",["fdt","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-0e65bf32","guard":[["hasAny",["cvst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0f8074f5","guard":[["hasAny",["each word","fdt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-11b3b087","guard":[["hasAny",["eedt","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates E. Europe Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1308ede9","guard":[["hasAny",["first n","take","yst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-13ab1880","guard":[["hasAny",["each word","split into words","tdt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Turkey Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-14c0bf72","guard":[["hasAny",["aest","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-151ec97e","guard":[["hasAny",["each word","samt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-1647fb1b","guard":[["hasAny",["each word","sakt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-16790417","guard":[["hasAny",["item number","lst","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-16efe5da","guard":[["hasAny",["each word","kdt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Kamchatka Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-173866f6","guard":[["hasAny",["item number","nth","position","yekt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yekaterinburg ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-17a30fca","guard":[["hasAny",["dst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Dateline Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-193e1b8a","guard":[["hasAny",["edt","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Eastern Daylight ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-1975b839","guard":[["hasAny",["each word","ndt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Newfoundland Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-1d7bf3fd","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yekt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yekaterinburg ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1fab8802","guard":[["hasAny",["dst","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Dateline Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-20085b06","guard":[["hasAny",["acst","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2370c8b8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jdt","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Israel Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-240b2aa4","guard":[["hasAny",["normalise","normalize","sest","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-241bf352","guard":[["hasAny",["each word","nzst","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates New Zealand Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-273f35c5","guard":[["hasAny",["akdt","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-29d569f7","guard":[["hasAny",["item number","nth","nzst","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates New Zealand Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-2e897c48","guard":[["hasAny",["each word","split into words","tdt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Turkey Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-2ec8f2b9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","shortest","shortest one","shortest word","sst","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samoa Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-308c12dc","guard":[["hasAny",["each word","get","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Georgian Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-348becc6","guard":[["hasAny",["each word","get","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Georgian Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-34f0fd96","guard":[["hasAny",["aest","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-35c423be","guard":[["hasAny",["each word","split into words","vst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Venezuela Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-3632d0a5","guard":[["hasAny",["item number","nth","position","swst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Western Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-36b1df18","guard":[["hasAny",["each word","ndt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Newfoundland Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-374d87fc","guard":[["hasAny",["gst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Greenwich Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-393ea1bf","guard":[["hasAny",["each word","split into words","spst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Pacific Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-3ac3089a","guard":[["hasAny",["first n","rdt","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-3b79d96d","guard":[["hasAny",["invert case","shortest","shortest one","shortest word","sst","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samoa Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-3cf26d09","guard":[["hasAny",["each word","split into words","ust"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-3db2e666","guard":[["hasAny",["first n","take","yst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-3db8f0a3","guard":[["hasAny",["each word","samt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-3dd4c32d","guard":[["hasAny",["eedt","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates E. Europe Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3e51354a","guard":[["hasAny",["first n","sest","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-3f10140f","guard":[["hasAny",["each word","edt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Eastern Daylight ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-3f28d133","guard":[["hasAny",["normalise","normalize","simplify the text","uedt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Eastern Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-3fc20cea","guard":[["hasAny",["each word","sdt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3fd54764","guard":[["hasAny",["hst","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Hawaiian Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-40fafb3c","guard":[["hasAny",["item number","nth","position","pst","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Pacific Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-41715577","guard":[["hasAny",["each word","rdt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-41928bbd","guard":[["hasAny",["item number","nth","position","vlat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Vladivostok Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-45107f42","guard":[["hasAny",["first n","samt","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-46f4aab3","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","slst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sri Lanka Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-47a92267","guard":[["hasAny",["ccst","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-47ac2fdf","guard":[["hasAny",["normalise","normalize","pyt","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Paraguay Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-47ed3cbe","guard":[["hasAny",["item number","nth","position","vlat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Vladivostok Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-495df6fb","guard":[["hasAny",["invert case","jdt","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Israel Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-4a082146","guard":[["hasAny",["normalise","normalize","simplify the text","tdt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Turkey Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-4ad72336","guard":[["hasAny",["item number","nth","position","umst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Mountain Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4b2cad31","guard":[["hasAny",["acst","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-4ead640c","guard":[["hasAny",["lst","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4ed57cc6","guard":[["hasAny",["cvst","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-4f9ab34c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fst","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Fiji Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-4fb06c41","guard":[["hasAny",["each word","split into words","spst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Pacific Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-4fe9a27e","guard":[["hasAny",["aest","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-53fa5db4","guard":[["hasAny",["fst","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Fiji Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-54a80c8a","guard":[["hasAny",["ccst","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-55019163","guard":[["hasAny",["cvst","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-573d70ae","guard":[["hasAny",["item number","nth","position","yekt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yekaterinburg ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-57e8788d","guard":[["hasAny",["each word","split into words","spst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Pacific Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-586bdb41","guard":[["hasAny",["aest","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-5c97bb74","guard":[["hasAny",["eedt","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates E. Europe Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-5d14751e","guard":[["hasAny",["each word","rdt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-5ddaf90f","guard":[["hasAny",["item number","nth","position","pst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Pacific Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-5ea88ca1","guard":[["hasAny",["first n","take","ust"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-5f2c7645","guard":[["hasAny",["gst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Greenwich Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-610a9baa","guard":[["hasAny",["get","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Georgian Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-6253c27b","guard":[["hasAny",["each word","rdt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-64e3aa93","guard":[["hasAny",["akdt","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-65002f34","guard":[["hasAny",["cvst","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-6552b8d4","guard":[["hasAny",["each word","sest","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-65c5b616","guard":[["hasAny",["each word","edt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Eastern Daylight ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-673065f5","guard":[["hasAny",["each word","kdt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Kamchatka Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-674ba470","guard":[["hasAny",["each word","split into words","yst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-6892a44d","guard":[["hasAny",["cpst","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Pacific Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-68be978d","guard":[["hasAny",["item number","jdt","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Israel Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-68d268fb","guard":[["hasAny",["item number","nth","position","samt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-6a046e80","guard":[["hasAny",["akdt","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-6ae50c15","guard":[["hasAny",["normalise","normalize","simplify the text","yst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-6b654609","guard":[["hasAny",["each word","split into words","tdt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Turkey Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-6b75895e","guard":[["hasAny",["ccst","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-6c9b5c29","guard":[["hasAny",["ccst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-6db8d402","guard":[["hasAny",["each word","split into words","tdt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Turkey Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-704e9322","guard":[["hasAny",["ccst","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-70a21340","guard":[["hasAny",["acst","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-718f3bde","guard":[["hasAny",["item number","nth","position","slst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sri Lanka Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-73dd1abe","guard":[["hasAny",["each word","split into words","uedt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-7648d3cc","guard":[["hasAny",["each word","split into words","vst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Venezuela Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-777c8188","guard":[["hasAny",["item number","nth","position","sst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samoa Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-78b99195","guard":[["hasAny",["first letters of the name","initials","wcast"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Africa Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-78ec2e41","guard":[["hasAny",["normalise","normalize","simplify the text","vst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Venezuela Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-79b5b687","guard":[["hasAny",["each word","nzst","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates New Zealand Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-79bdb688","guard":[["hasAny",["get","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Georgian Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-7a4366d9","guard":[["hasAny",["normalise","normalize","simplify the text","ust"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7c53e450","guard":[["hasAny",["aest","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7ca9491c","guard":[["hasAny",["first n","sdt","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-7dafedb3","guard":[["hasAny",["first n","sakt","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-7e1e42cb","guard":[["hasAny",["each word","split into words","uedt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Eastern Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-7f9d50a3","guard":[["hasAny",["fst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Fiji Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-804eb015","guard":[["hasAny",["aest","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-81216fb1","guard":[["hasAny",["each word","pyt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Paraguay Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-81eceaa8","guard":[["hasAny",["each word","lst","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-821f1e45","guard":[["hasAny",["item number","nth","position","slst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sri Lanka Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-82f28327","guard":[["hasAny",["first n","lst","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-84dd3806","guard":[["hasAny",["each word","nzst","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates New Zealand Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-85afd162","guard":[["hasAny",["each word","rdt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8666ec11","guard":[["hasAny",["ccst","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-87425359","guard":[["hasAny",["each word","kdt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Kamchatka Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-8869f1be","guard":[["hasAny",["dst","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Dateline Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-8a17dd88","guard":[["hasAny",["gst","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Greenwich Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-8d5c32b5","guard":[["hasAny",["each word","pyt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Paraguay Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-8d91d846","guard":[["hasAny",["each word","split into words","vst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Venezuela Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-8f08c08d","guard":[["hasAny",["each word","split into words","uedt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Eastern Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-91001886","guard":[["hasAny",["item number","nth","position","spst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Pacific Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-91e51f7a","guard":[["hasAny",["each word","split into words","spst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Pacific Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-93c26c31","guard":[["hasAny",["akdt","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-94e6db89","guard":[["hasAny",["invert case","pst","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Pacific Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-95a08058","guard":[["hasAny",["each word","fdt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-967dfb30","guard":[["hasAny",["acst","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-96c08bf7","guard":[["hasAny",["each word","split into words","ust"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-96ea930d","guard":[["hasAny",["first n","sdt","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-98de332e","guard":[["hasAny",["esast","first letters of the name","initials"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," South America Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-994efdb3","guard":[["hasAny",["each word","sest","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9994c662","guard":[["hasAny",["each word","lst","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9ba14d58","guard":[["hasAny",["acst","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9ba98c64","guard":[["hasAny",["each word","ndt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Newfoundland Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-9d80d213","guard":[["hasAny",["each word","split into words","vst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Venezuela Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-9d86d550","guard":[["hasAny",["each word","fdt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-9fa971a6","guard":[["hasAny",["item number","nth","position","umst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Mountain Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a008735a","guard":[["hasAny",["dst","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Dateline Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-a112c29f","guard":[["hasAny",["item number","nth","position","sdt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a1a32c25","guard":[["hasAny",["item number","nth","position","tdt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Turkey Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-a2727b8c","guard":[["hasAny",["cbst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Brazilian Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a4171d9d","guard":[["hasAny",["each word","split into words","ust"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a4362ea7","guard":[["hasAny",["each word","fdt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-a56d934e","guard":[["hasAny",["each word","split into words","uedt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-aa2beec1","guard":[["hasAny",["item number","nth","position","sst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samoa Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ab467ac8","guard":[["hasAny",["item number","nth","position","ust"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ab68a0bb","guard":[["hasAny",["each word","get","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Georgian Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-adb4f2dc","guard":[["hasAny",["normalise","normalize","simplify the text","spst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Pacific Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-ae6ec892","guard":[["hasAny",["each word","pyt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Paraguay Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-afd3f49e","guard":[["hasAny",["gmt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["GMT abbreviates ",{"slot":0}," Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b02f4d00","guard":[["hasAny",["acst","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-b14878e8","guard":[["hasAny",["each word","split into words","swst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Western Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-b24938ad","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","sst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samoa Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-b6051d78","guard":[["hasAny",["each word","sest","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b6d54a62","guard":[["hasAny",["each word","split into words","yst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b71c9065","guard":[["hasAny",["gmt","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Standard Time."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b78e1269","guard":[["hasAny",["normalise","normalize","simplify the text","swst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Western Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-b875b6ec","guard":[["hasAny",["cpst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Pacific Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b89ea282","guard":[["hasAny",["item number","kdt","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Kamchatka Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-b918cb71","guard":[["hasAny",["dst","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Dateline Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-b964a263","guard":[["hasAny",["item number","nth","position","pst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Pacific Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ba06c5fb","guard":[["hasAny",["edt","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Eastern Daylight ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-ba5d6911","guard":[["hasAny",["ccst","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-ba78060d","guard":[["hasAny",["hst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Hawaiian Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ba9b8f60","guard":[["hasAny",["fst","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Fiji Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-bb0315a4","guard":[["hasAny",["first n","lst","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-c029e281","guard":[["hasAny",["item number","nth","position","vst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Venezuela Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-c0ad1a62","guard":[["hasAny",["acst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c0b68cf9","guard":[["hasAny",["ndt","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Newfoundland Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-c145667b","guard":[["hasAny",["each word","split into words","swst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Western Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-c199d6d9","guard":[["hasAny",["akdt","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-c3f9fe29","guard":[["hasAny",["item number","nth","position","sest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c91e4887","guard":[["hasAny",["hst","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Hawaiian Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-c96ddb88","guard":[["hasAny",["each word","get","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Georgian Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-c999aa44","guard":[["hasAny",["first n","sest","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-cb762079","guard":[["hasAny",["cvst","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-cb858d19","guard":[["hasAny",["akdt","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-cc3b1d89","guard":[["hasAny",["first letters of the name","initials","ncast"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Asia Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-ce138092","guard":[["hasAny",["acst","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Central Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ce7eba33","guard":[["hasAny",["each word","lst","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-cebc5456","guard":[["hasAny",["first n","sakt","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-cf977eb5","guard":[["hasAny",["each word","sakt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d0675367","guard":[["hasAny",["aest","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d2070974","guard":[["hasAny",["fst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Fiji Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d26a7932","guard":[["hasAny",["cbst","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Brazilian Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d34886d9","guard":[["hasAny",["akdt","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d384368b","guard":[["hasAny",["each word","sdt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d61f6397","guard":[["hasAny",["cbst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Brazilian Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d724ddf4","guard":[["hasAny",["item number","ndt","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Newfoundland Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-db0eef28","guard":[["hasAny",["normalise","normalize","rdt","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-dccebbc0","guard":[["hasAny",["each word","pyt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Paraguay Standard ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-df7e08c0","guard":[["hasAny",["item number","nth","position","rdt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e1be5601","guard":[["hasAny",["item number","nth","position","uedt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Eastern Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-e2cc23af","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","umst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Mountain Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e304b6e6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hst","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Hawaiian Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-e405f5b5","guard":[["hasAny",["each word","split into words","swst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Western Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-e49f3fd0","guard":[["hasAny",["each word","sakt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-e4b9028c","guard":[["hasAny",["normalise","normalize","nzst","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates New Zealand Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-e4c38cf3","guard":[["hasAny",["first n","samt","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-e55ba3ae","guard":[["hasAny",["item number","nth","position","pyt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Paraguay Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-e5918039","guard":[["hasAny",["item number","jdt","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Israel Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e65300b5","guard":[["hasAny",["fdt","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e65eb2ad","guard":[["hasAny",["aest","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates AUS Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-e681608c","guard":[["hasAny",["first n","rdt","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Romance Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-e6b4c1ed","guard":[["hasAny",["normalise","normalize","sdt","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e7c78189","guard":[["hasAny",["gst","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Greenwich Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-eaa71aad","guard":[["hasAny",["each word","split into words","yst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-eb494a77","guard":[["hasAny",["each word","edt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Eastern Daylight ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-eb6856e9","guard":[["hasAny",["each word","nzst","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates New Zealand Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-eb7e6cbe","guard":[["hasAny",["each word","lst","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Libya Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ebb3aa89","guard":[["hasAny",["each word","edt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Eastern Daylight ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-ebf8e4ed","guard":[["hasAny",["fdt","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ee3ce8a0","guard":[["hasAny",["each word","split into words","swst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Western Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-efa1965d","guard":[["hasAny",["item number","nth","position","sakt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-eff38156","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pst","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Pacific Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-f086de29","guard":[["hasAny",["normalise","normalize","sakt","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f1396e0c","guard":[["hasAny",["item number","jdt","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Israel Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-f30352eb","guard":[["hasAny",["normalise","normalize","samt","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f5422aba","guard":[["hasAny",["ccst","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Canada Central Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f5b52852","guard":[["hasAny",["first n","take","ust"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Ulaanbaatar Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-f5c2ce98","guard":[["hasAny",["item number","nth","position","yst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yakutsk Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f6a8e968","guard":[["hasAny",["cpst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Pacific Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f8837535","guard":[["hasAny",["cvst","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f91a459f","guard":[["hasAny",["each word","sakt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sakhalin Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-f9dbcf29","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","vlat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Vladivostok Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fa7ec236","guard":[["hasAny",["each word","sest","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates SA Eastern Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-fb3c6336","guard":[["hasAny",["fdt","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates FLE Standard ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-fbb71565","guard":[["hasAny",["akdt","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Alaskan Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-fbf720d9","guard":[["hasAny",["each word","samt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-fd241514","guard":[["hasAny",["kdt","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Kamchatka Standard ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-fdedaa61","guard":[["hasAny",["cvst","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Cape Verde Standard ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-fe3f3329","guard":[["hasAny",["hst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Hawaiian Standard ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-fe4163a9","guard":[["hasAny",["each word","samt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samara ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-ff8bdf3c","guard":[["hasAny",["each word","sdt","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Syria Standard ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-02042cf2","guard":[["hasAny",["each word","hst","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Hawaiian Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-05d8d4d0","guard":[["hasAny",["each word","pst","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Pacific Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-08256133","guard":[["hasAny",["first letters of the name","initials","invert case","swap case","toggle case","wcast"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Africa Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-0aba5645","guard":[["hasAny",["each word","fst","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Fiji Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-0bc4fbfb","guard":[["hasAny",["invert case","item number","nth","position","slst","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sri Lanka Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-0f578fa4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","first letters of the name","initials","ncast","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Asia Standard ",{"slot":2},"."]},["transform.title",["sense.lastWord"]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-12344441","guard":[["hasAny",["first letters of the name","initials","invert case","ncast","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Asia Standard ",{"slot":2},"."]},["transform.swapCase",["sense.lastWord"]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-18839c80","guard":[["hasAny",["first letters of the name","initials","lower case","lowercase","small letters","wcast"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Africa Standard ",{"slot":2},"."]},["transform.lower",["sense.lastWord"]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-1a92a3f1","guard":[["hasAny",["first n","jdt","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Israel Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-21158006","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","slst","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sri Lanka Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-245d5d11","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","yekt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yekaterinburg ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-24760327","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","vlat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Vladivostok Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-27365641","guard":[["hasAny",["each word","hst","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Hawaiian Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-29445ef6","guard":[["hasAny",["eedt","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates E. Europe Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-2ca02144","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cbst","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Brazilian Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-2f4cc869","guard":[["hasAny",["cpst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Pacific Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-2fdad45b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","first letters of the name","initials","title case","wcast"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Africa Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-30dac0ce","guard":[["hasAny",["capitalise","capitalize","capitalize each word","eedt","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates E. Europe Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-3531b08a","guard":[["hasAny",["all caps","capital letters","capitals","esast","first letters of the name","initials","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," South America Standard ",{"slot":2},"."]},["transform.upper",["sense.lastWord"]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-391bceea","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","umst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Mountain Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-3abc5fd9","guard":[["hasAny",["first n","pst","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Pacific Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-3f8b8132","guard":[["hasAny",["capitalise","capitalize","capitalize each word","esast","first letters of the name","initials","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," South America Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-46c85b8d","guard":[["hasAny",["each word","jdt","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Israel Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-48db2f53","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cpst","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Pacific Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-5253f468","guard":[["hasAny",["first n","gst","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Greenwich Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-5384af5d","guard":[["hasAny",["esast","first letters of the name","initials","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," South America Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-538719a9","guard":[["hasAny",["first n","fst","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Fiji Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-626b9740","guard":[["hasAny",["each word","gst","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Greenwich Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-62b47b80","guard":[["hasAny",["each word","gst","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Greenwich Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-65f86302","guard":[["hasAny",["item number","nth","position","yekt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yekaterinburg ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-7083fe66","guard":[["hasAny",["first n","gst","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Greenwich Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-760eba74","guard":[["hasAny",["each word","fst","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Fiji Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-78bbd857","guard":[["hasAny",["capitalise","capitalize","capitalize each word","esast","first letters of the name","initials","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," South America Standard ",{"slot":2},"."]},["transform.title",["sense.lastWord"]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-78d40359","guard":[["hasAny",["first n","jdt","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Israel Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-79cb1b86","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","sst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samoa Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-7b73f545","guard":[["hasAny",["all caps","capital letters","capitals","first letters of the name","initials","upper case","uppercase","wcast"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Africa Standard ",{"slot":2},"."]},["transform.upper",["sense.lastWord"]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-7d7b232f","guard":[["hasAny",["esast","first letters of the name","initials","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," South America Standard ",{"slot":2},"."]},["transform.lower",["sense.lastWord"]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8173c5db","guard":[["hasAny",["cbst","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Brazilian Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-868fea3a","guard":[["hasAny",["cbst","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Brazilian Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-8907a127","guard":[["hasAny",["first n","pst","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Pacific Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-9c029c34","guard":[["hasAny",["item number","nth","position","vlat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Vladivostok Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-9d3f21f2","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","sst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samoa Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-aa36ca95","guard":[["hasAny",["esast","first letters of the name","initials","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," South America Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-aa45d69a","guard":[["hasAny",["first letters of the name","initials","invert case","ncast","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Asia Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-ae318c07","guard":[["hasAny",["first n","shortest","shortest one","shortest word","sst","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samoa Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-b27f4baf","guard":[["hasAny",["cpst","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Pacific Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-bb92932d","guard":[["hasAny",["esast","first letters of the name","initials","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," South America Standard ",{"slot":2},"."]},["transform.swapCase",["sense.lastWord"]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c0dec0fc","guard":[["hasAny",["item number","nth","position","umst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Mountain Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-c1b2838b","guard":[["hasAny",["first n","hst","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Hawaiian Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-c2d33483","guard":[["hasAny",["capitalise","capitalize","capitalize each word","first letters of the name","initials","title case","wcast"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Africa Standard ",{"slot":2},"."]},["transform.title",["sense.lastWord"]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-c319af15","guard":[["hasAny",["gmt","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Standard ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c46abb03","guard":[["hasAny",["each word","pst","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Pacific Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-ced14621","guard":[["hasAny",["item number","nth","position","slst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sri Lanka Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-cffd8197","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","yekt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yekaterinburg ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-d0b3a237","guard":[["hasAny",["first n","hst","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Hawaiian Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-d0c5eb7f","guard":[["hasAny",["first n","shortest","shortest one","shortest word","sst","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Samoa Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-d28628e0","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","umst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Mountain Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-d6706fb1","guard":[["hasAny",["each word","jdt","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Israel Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-de6fe7fc","guard":[["hasAny",["eedt","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates E. Europe Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-df4a6f85","guard":[["hasAny",["first letters of the name","initials","invert case","swap case","toggle case","wcast"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Africa Standard ",{"slot":2},"."]},["transform.swapCase",["sense.lastWord"]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-e54e4849","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","vlat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Vladivostok Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-ed8c5a49","guard":[["hasAny",["all caps","capital letters","capitals","first letters of the name","initials","ncast","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Asia Standard ",{"slot":2},"."]},["transform.upper",["sense.lastWord"]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-edfd116d","guard":[["hasAny",["first letters of the name","initials","lower case","lowercase","ncast","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Asia Standard ",{"slot":2},"."]},["transform.lower",["sense.lastWord"]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-ef2390ab","guard":[["hasAny",["first n","fst","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Fiji Standard ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-f377bd92","guard":[["hasAny",["capitalise","capitalize","capitalize each word","first letters of the name","initials","ncast","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Asia Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-005dbee3","guard":[["hasAny",["first n","item number","nth","position","slst","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sri Lanka Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-036de865","guard":[["hasAny",["each word","esast","first letters of the name","initials","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," South America Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-0bc43e13","guard":[["hasAny",["esast","first letters of the name","first n","initials","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," South America Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-0caff507","guard":[["hasAny",["esast","first letters of the name","initials","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," South America Standard ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-122191ff","guard":[["hasAny",["first letters of the name","initials","ncast","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Asia Standard ",{"slot":2},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-21c3e189","guard":[["hasAny",["each word","esast","first letters of the name","initials","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," South America Standard ",{"slot":2},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2375479f","guard":[["hasAny",["cbst","first n","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Brazilian Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-27579d28","guard":[["hasAny",["eedt","first n","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates E. Europe Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-2fdb09f8","guard":[["hasAny",["cbst","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Brazilian Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-31266fd6","guard":[["hasAny",["cpst","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Pacific Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-39aab6de","guard":[["hasAny",["gmt","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Standard ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-43ffaa73","guard":[["hasAny",["first n","item number","nth","position","take","umst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Mountain Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-445077ae","guard":[["hasAny",["first n","item number","nth","position","take","umst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Mountain Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-5e4e3c3a","guard":[["hasAny",["each word","first letters of the name","initials","ncast","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Asia Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-652d500e","guard":[["hasAny",["each word","item number","nth","position","split into words","yekt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yekaterinburg ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-6a77b567","guard":[["hasAny",["each word","first letters of the name","initials","ncast","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Asia Standard ",{"slot":2},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-715cf819","guard":[["hasAny",["cpst","first n","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Pacific Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-73c1a9c8","guard":[["hasAny",["esast","first letters of the name","initials","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," South America Standard ",{"slot":2},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-763f6601","guard":[["hasAny",["cpst","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Pacific Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-7b1e6fce","guard":[["hasAny",["each word","first letters of the name","initials","ncast","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Asia Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-80737eaf","guard":[["hasAny",["first n","item number","nth","position","slst","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sri Lanka Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-8447a2cd","guard":[["hasAny",["each word","eedt","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates E. Europe Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-8a4d59ec","guard":[["hasAny",["each word","esast","first letters of the name","initials","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," South America Standard ",{"slot":2},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8ada09b7","guard":[["hasAny",["first n","item number","nth","position","take","vlat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Vladivostok Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-9390f013","guard":[["hasAny",["cpst","first n","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Pacific Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-93afb479","guard":[["hasAny",["eedt","first n","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates E. Europe Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-96e94826","guard":[["hasAny",["first n","item number","nth","position","take","vlat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Vladivostok Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-9f730ef5","guard":[["hasAny",["each word","first letters of the name","initials","split into words","wcast"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Africa Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-a72be3b5","guard":[["hasAny",["each word","esast","first letters of the name","initials","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," South America Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-a778909e","guard":[["hasAny",["each word","item number","nth","position","split into words","umst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Mountain Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-a7cca932","guard":[["hasAny",["each word","item number","nth","position","split into words","vlat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Vladivostok Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-ab6d0bfb","guard":[["hasAny",["each word","item number","nth","position","split into words","umst"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates US Mountain Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-ba733132","guard":[["hasAny",["each word","item number","nth","position","split into words","vlat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Vladivostok Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-c167075e","guard":[["hasAny",["first letters of the name","initials","normalise","normalize","simplify the text","wcast"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Africa Standard ",{"slot":2},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-c2917a89","guard":[["hasAny",["first n","item number","nth","position","take","yekt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yekaterinburg ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-c5617033","guard":[["hasAny",["gmt","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Standard ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c6365432","guard":[["hasAny",["each word","first letters of the name","initials","split into words","wcast"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Africa Standard ",{"slot":2},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-c7a5ac11","guard":[["hasAny",["cbst","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Brazilian Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-d2d178d6","guard":[["hasAny",["each word","first letters of the name","initials","split into words","wcast"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Africa Standard ",{"slot":2},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-d3176110","guard":[["hasAny",["first n","item number","nth","position","take","yekt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yekaterinburg ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-d3c005cf","guard":[["hasAny",["each word","first letters of the name","initials","ncast","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Asia Standard ",{"slot":2},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-d921969e","guard":[["hasAny",["each word","eedt","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates E. Europe Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-dd207dba","guard":[["hasAny",["first letters of the name","initials","item number","ncast","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Asia Standard ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-e0f239e2","guard":[["hasAny",["each word","item number","nth","position","slst","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sri Lanka Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-e9339632","guard":[["hasAny",["esast","first letters of the name","first n","initials","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," South America Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-ec35f1c3","guard":[["hasAny",["each word","item number","nth","position","slst","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Sri Lanka Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-edd382bd","guard":[["hasAny",["each word","item number","nth","position","split into words","yekt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Yekaterinburg ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-fcb8e9f6","guard":[["hasAny",["cbst","first n","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates Central Brazilian Standard ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-fe6a5d42","guard":[["hasAny",["first letters of the name","initials","item number","nth","position","wcast"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Africa Standard ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.initials",["sense.lastWord"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-ff2fe03b","guard":[["hasAny",["each word","first letters of the name","initials","split into words","wcast"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Central Africa Standard ",{"slot":2},"."]},["sense.lastWord"],["transform.initials",["sense.lastWord"]],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-02ce712c","guard":[["hasAny",["gmt","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Standard ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-79dce3d7","guard":[["hasAny",["gmt","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Standard ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-97c9af42","guard":[["hasAny",["gmt","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Standard ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a70f7153","guard":[["hasAny",["gmt","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Standard ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a92b4ce2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gmt","item number","nth","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Standard ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-83ca27be","guard":[["hasAny",["first n","gmt","item number","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Standard ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-dfc598ce","guard":[["hasAny",["each word","gmt","item number","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Standard ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-e81b20ba","guard":[["hasAny",["first n","gmt","item number","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Standard ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-ea8412bd","guard":[["hasAny",["each word","gmt","item number","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," abbreviates ",{"slot":1}," Standard ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-97b27c39","guard":[["has","time"],["not",["has","of"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the time zone code GST stands for what":"GST abbreviates Greenwich Standard Time.","name the time zone abbreviated EDT":"EDT abbreviates Eastern Daylight Time.","which time zone has the abbreviation SEST":"SEST abbreviates SA Eastern Standard Time.","which time zone has the abbreviation SAKT":"SAKT abbreviates Sakhalin Standard Time.","the time zone code HST stands for what":"HST abbreviates Hawaiian Standard Time.","which time zone has the abbreviation ACST":"ACST abbreviates AUS Central Standard Time.","which time zone has the abbreviation YST":"YST abbreviates Yakutsk Standard Time.","which time zone has the abbreviation LST":"LST abbreviates Libya Standard Time.","the time zone code SST stands for what":"SST abbreviates Samoa Standard Time.","name the time zone abbreviated DST":"DST abbreviates Dateline Standard Time.","the time zone code VLAT stands for what":"VLAT abbreviates Vladivostok Standard Time.","which time zone has the abbreviation ESAST":"ESAST abbreviates E. South America Standard Time.","name the time zone abbreviated WCAST":"WCAST abbreviates W. Central Africa Standard Time.","which time zone has the abbreviation SAMT":"SAMT abbreviates Samara Time.","name the time zone abbreviated SPST":"SPST abbreviates SA Pacific Standard Time.","name the time zone abbreviated VST":"VST abbreviates Venezuela Standard Time.","the time zone code CBST stands for what":"CBST abbreviates Central Brazilian Standard Time.","name the time zone abbreviated KDT":"KDT abbreviates Kamchatka Standard Time.","the time zone code PST stands for what":"PST abbreviates Pacific Standard Time.","which time zone has the abbreviation AEST":"AEST abbreviates AUS Eastern Standard Time.","name the time zone abbreviated GET":"GET abbreviates Georgian Standard Time.","name the time zone abbreviated UEDT":"UEDT abbreviates US Eastern Standard Time.","name the time zone abbreviated SWST":"SWST abbreviates SA Western Standard Time.","which time zone has the abbreviation FDT":"FDT abbreviates FLE Standard Time.","name the time zone abbreviated PYT":"PYT abbreviates Paraguay Standard Time.","name the time zone abbreviated NZST":"NZST abbreviates New Zealand Standard Time.","which time zone has the abbreviation CVST":"CVST abbreviates Cape Verde Standard Time.","which time zone has the abbreviation AKDT":"AKDT abbreviates Alaskan Standard Time.","which time zone has the abbreviation CCST":"CCST abbreviates Canada Central Standard Time.","the time zone code UMST stands for what":"UMST abbreviates US Mountain Standard Time.","the time zone code SLST stands for what":"SLST abbreviates Sri Lanka Standard Time.","which time zone has the abbreviation SDT":"SDT abbreviates Syria Standard Time.","which time zone has the abbreviation RDT":"RDT abbreviates Romance Standard Time.","the time zone code YEKT stands for what":"YEKT abbreviates Yekaterinburg Time.","name the time zone abbreviated TDT":"TDT abbreviates Turkey Standard Time.","which time zone has the abbreviation UST":"UST abbreviates Ulaanbaatar Standard Time.","the time zone code EEDT stands for what":"EEDT abbreviates E. Europe Standard Time.","the time zone code CPST stands for what":"CPST abbreviates Central Pacific Standard Time.","name the time zone abbreviated NDT":"NDT abbreviates Newfoundland Standard Time.","the time zone code JDT stands for what":"JDT abbreviates Israel Standard Time.","the time zone code FST stands for what":"FST abbreviates Fiji Standard Time.","the time zone code GMT stands for what":"GMT abbreviates GMT Standard Time.","name the time zone abbreviated NCAST":"NCAST abbreviates N. Central Asia Standard Time."}}},
{"id":"n-039bc4af","guard":[["has","ndt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated NDT":"NDT abbreviates Newfoundland Standard Time."}}},
{"id":"n-05407574","guard":[["has","slst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the time zone code SLST stands for what":"SLST abbreviates Sri Lanka Standard Time."}}},
{"id":"n-06a5d312","guard":[["has","get"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated GET":"GET abbreviates Georgian Standard Time."}}},
{"id":"n-2581954f","guard":[["has","acst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation ACST":"ACST abbreviates AUS Central Standard Time."}}},
{"id":"n-284122d3","guard":[["has","swst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated SWST":"SWST abbreviates SA Western Standard Time."}}},
{"id":"n-2936a270","guard":[["has","ccst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation CCST":"CCST abbreviates Canada Central Standard Time."}}},
{"id":"n-2d8ce4bf","guard":[["has","fst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the time zone code FST stands for what":"FST abbreviates Fiji Standard Time."}}},
{"id":"n-32b47f92","guard":[["has","cpst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the time zone code CPST stands for what":"CPST abbreviates Central Pacific Standard Time."}}},
{"id":"n-360ca558","guard":[["has","sst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the time zone code SST stands for what":"SST abbreviates Samoa Standard Time."}}},
{"id":"n-375bdff3","guard":[["has","ust"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation UST":"UST abbreviates Ulaanbaatar Standard Time."}}},
{"id":"n-3e2fc596","guard":[["has","rdt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation RDT":"RDT abbreviates Romance Standard Time."}}},
{"id":"n-4b7cf97c","guard":[["has","esast"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation ESAST":"ESAST abbreviates E. South America Standard Time."}}},
{"id":"n-4f3176fd","guard":[["has","eedt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the time zone code EEDT stands for what":"EEDT abbreviates E. Europe Standard Time."}}},
{"id":"n-556c488a","guard":[["has","sdt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation SDT":"SDT abbreviates Syria Standard Time."}}},
{"id":"n-5624e409","guard":[["has","pst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the time zone code PST stands for what":"PST abbreviates Pacific Standard Time."}}},
{"id":"n-5a02b441","guard":[["has","dst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated DST":"DST abbreviates Dateline Standard Time."}}},
{"id":"n-5a408f29","guard":[["has","gst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the time zone code GST stands for what":"GST abbreviates Greenwich Standard Time."}}},
{"id":"n-69585ef2","guard":[["has","sakt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation SAKT":"SAKT abbreviates Sakhalin Standard Time."}}},
{"id":"n-7108f4f1","guard":[["has","edt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated EDT":"EDT abbreviates Eastern Daylight Time."}}},
{"id":"n-854c486f","guard":[["has","cbst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the time zone code CBST stands for what":"CBST abbreviates Central Brazilian Standard Time."}}},
{"id":"n-8b3bfea4","guard":[["has","lst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation LST":"LST abbreviates Libya Standard Time."}}},
{"id":"n-8d4753ad","guard":[["has","yekt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the time zone code YEKT stands for what":"YEKT abbreviates Yekaterinburg Time."}}},
{"id":"n-91995da6","guard":[["has","fdt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation FDT":"FDT abbreviates FLE Standard Time."}}},
{"id":"n-9391ca3d","guard":[["has","nzst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated NZST":"NZST abbreviates New Zealand Standard Time."}}},
{"id":"n-9a35ce06","guard":[["has","umst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the time zone code UMST stands for what":"UMST abbreviates US Mountain Standard Time."}}},
{"id":"n-9b401ad7","guard":[["has","yst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation YST":"YST abbreviates Yakutsk Standard Time."}}},
{"id":"n-9fbaafbe","guard":[["has","kdt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated KDT":"KDT abbreviates Kamchatka Standard Time."}}},
{"id":"n-a3100af7","guard":[["has","gmt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the time zone code GMT stands for what":"GMT abbreviates GMT Standard Time."}}},
{"id":"n-a77a8c0f","guard":[["has","hst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the time zone code HST stands for what":"HST abbreviates Hawaiian Standard Time."}}},
{"id":"n-a807c028","guard":[["has","wcast"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated WCAST":"WCAST abbreviates W. Central Africa Standard Time."}}},
{"id":"n-b0872ce6","guard":[["has","vst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated VST":"VST abbreviates Venezuela Standard Time."}}},
{"id":"n-b2f6033a","guard":[["has","cvst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation CVST":"CVST abbreviates Cape Verde Standard Time."}}},
{"id":"n-c2aa2239","guard":[["has","akdt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation AKDT":"AKDT abbreviates Alaskan Standard Time."}}},
{"id":"n-cf782199","guard":[["has","spst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated SPST":"SPST abbreviates SA Pacific Standard Time."}}},
{"id":"n-d8a450d8","guard":[["has","uedt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated UEDT":"UEDT abbreviates US Eastern Standard Time."}}},
{"id":"n-d96d58d3","guard":[["has","tdt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated TDT":"TDT abbreviates Turkey Standard Time."}}},
{"id":"n-e0959138","guard":[["has","aest"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation AEST":"AEST abbreviates AUS Eastern Standard Time."}}},
{"id":"n-e98941d9","guard":[["has","sest"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation SEST":"SEST abbreviates SA Eastern Standard Time."}}},
{"id":"n-ef3d681b","guard":[["has","ncast"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated NCAST":"NCAST abbreviates N. Central Asia Standard Time."}}},
{"id":"n-efae65b1","guard":[["has","samt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which time zone has the abbreviation SAMT":"SAMT abbreviates Samara Time."}}},
{"id":"n-f8e3d545","guard":[["has","vlat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the time zone code VLAT stands for what":"VLAT abbreviates Vladivostok Standard Time."}}},
{"id":"n-fcaca4b9","guard":[["has","jdt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the time zone code JDT stands for what":"JDT abbreviates Israel Standard Time."}}},
{"id":"n-ff6a827e","guard":[["has","pyt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone abbreviated PYT":"PYT abbreviates Paraguay Standard Time."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"the time zone code GST stands for what","expect":{"contains":["Greenwich Standard Time"],"notRefusal":true}},{"q":"name the time zone abbreviated EDT","expect":{"contains":["Eastern Daylight Time"],"notRefusal":true}},{"q":"which time zone has the abbreviation SEST","expect":{"contains":["SA Eastern Standard Time"],"notRefusal":true}},{"q":"which time zone has the abbreviation SAKT","expect":{"contains":["Sakhalin Standard Time"],"notRefusal":true}},{"q":"the time zone code HST stands for what","expect":{"contains":["Hawaiian Standard Time"],"notRefusal":true}},{"q":"which time zone has the abbreviation ACST","expect":{"contains":["AUS Central Standard Time"],"notRefusal":true}},{"q":"which time zone has the abbreviation YST","expect":{"contains":["Yakutsk Standard Time"],"notRefusal":true}},{"q":"which time zone has the abbreviation LST","expect":{"contains":["Libya Standard Time"],"notRefusal":true}},{"q":"the time zone code SST stands for what","expect":{"contains":["Samoa Standard Time"],"notRefusal":true}},{"q":"name the time zone abbreviated DST","expect":{"contains":["Dateline Standard Time"],"notRefusal":true}},{"q":"the time zone code VLAT stands for what","expect":{"contains":["Vladivostok Standard Time"],"notRefusal":true}},{"q":"which time zone has the abbreviation ESAST","expect":{"contains":["E. South America Standard Time"],"notRefusal":true}},{"q":"name the time zone abbreviated WCAST","expect":{"contains":["W. Central Africa Standard Time"],"notRefusal":true}},{"q":"which time zone has the abbreviation SAMT","expect":{"contains":["Samara Time"],"notRefusal":true}},{"q":"name the time zone abbreviated SPST","expect":{"contains":["SA Pacific Standard Time"],"notRefusal":true}},{"q":"name the time zone abbreviated VST","expect":{"contains":["Venezuela Standard Time"],"notRefusal":true}},{"q":"the time zone code CBST stands for what","expect":{"contains":["Central Brazilian Standard Time"],"notRefusal":true}},{"q":"name the time zone abbreviated KDT","expect":{"contains":["Kamchatka Standard Time"],"notRefusal":true}},{"q":"the time zone code PST stands for what","expect":{"contains":["Pacific Standard Time"],"notRefusal":true}},{"q":"which time zone has the abbreviation AEST","expect":{"contains":["AUS Eastern Standard Time"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
