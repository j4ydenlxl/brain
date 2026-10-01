// nasdaq-symbol-company-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"nasdaq-symbol-company-neo-g6","class":"nasdaq-symbol-company","generation":6,"lane":"neo","grownFrom":["which company has the Nasdaq symbol PDSB","what company is listed as MDRR","name the company trading on Nasdaq as IONR","which company has the Nasdaq symbol GRI","what company is listed as ECPG","which company has the Nasdaq symbol BYFC","which company has the Nasdaq symbol SORNU","which company has the Nasdaq symbol VIVK","what company is listed as CODX","name the company trading on Nasdaq as NODK","what company is listed as CRDO","what company is listed as JAGX","name the company trading on Nasdaq as DLHC","which company has the Nasdaq symbol TNMG","which company has the Nasdaq symbol ECBK","which company has the Nasdaq symbol CME","which company has the Nasdaq symbol INSG","which company has the Nasdaq symbol TECX","which company has the Nasdaq symbol RFAIU","which company has the Nasdaq symbol BWIN"],"version":1});

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
{"id":"n-067797dd","guard":[["has","company"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PDSB":"PDSB is PDS Biotechnology Corporation.","what company is listed as MDRR":"MDRR is Medalist Diversified, Inc..","name the company trading on Nasdaq as IONR":"IONR is ioneer Ltd.","which company has the Nasdaq symbol GRI":"GRI is GRI Bio, Inc..","what company is listed as ECPG":"ECPG is Encore Capital Group Inc.","which company has the Nasdaq symbol BYFC":"BYFC is Broadway Financial Corporation.","which company has the Nasdaq symbol SORNU":"SORNU is Soren Acquisition Corp..","which company has the Nasdaq symbol VIVK":"VIVK is Vivakor, Inc..","what company is listed as CODX":"CODX is Co-Diagnostics, Inc..","name the company trading on Nasdaq as NODK":"NODK is NI Holdings, Inc..","what company is listed as CRDO":"CRDO is Credo Technology Group Holding Ltd.","what company is listed as JAGX":"JAGX is Jaguar Health, Inc..","name the company trading on Nasdaq as DLHC":"DLHC is DLH Holdings Corp..","which company has the Nasdaq symbol TNMG":"TNMG is TNL Mediagene.","which company has the Nasdaq symbol ECBK":"ECBK is ECB Bancorp, Inc..","which company has the Nasdaq symbol CME":"CME is CME Group Inc..","which company has the Nasdaq symbol INSG":"INSG is Inseego Corp..","which company has the Nasdaq symbol TECX":"TECX is Tectonic Therapeutic, Inc..","which company has the Nasdaq symbol RFAIU":"RFAIU is RF Acquisition Corp II.","which company has the Nasdaq symbol BWIN":"BWIN is The Baldwin Insurance Group, Inc..","name the company trading on Nasdaq as SRZN":"SRZN is Surrozen, Inc..","name the company trading on Nasdaq as FIP":"FIP is FTAI Infrastructure Inc..","what company is listed as MRLN":"MRLN is Merlin, Inc..","name the company trading on Nasdaq as THH":"THH is TryHard Holdings Limited.","name the company trading on Nasdaq as BMHL":"BMHL is Bluemount Holdings Limited.","what company is listed as GLSI":"GLSI is Greenwich LifeSciences, Inc..","what company is listed as QQQX":"QQQX is Nuveen NASDAQ 100 Dynamic Overwrite Fund.","what company is listed as BZAI":"BZAI is Blaize Holdings, Inc..","what company is listed as FORM":"FORM is FormFactor, Inc..","which company has the Nasdaq symbol PTACW":"PTACW is Patriot Acquisition Corp..","name the company trading on Nasdaq as XRXDW":"XRXDW is Xerox Holdings Corporation.","which company has the Nasdaq symbol NEXR":"NEXR is Nexera Technologies Ltd.","what company is listed as NOEMW":"NOEMW is CO2 Energy Transition Corp..","name the company trading on Nasdaq as AEHL":"AEHL is Antelope Enterprise Holdings Limited.","which company has the Nasdaq symbol SKYAW":"SKYAW is SkyAI, Inc..","what company is listed as GAINI":"GAINI is Gladstone Investment Corporation.","name the company trading on Nasdaq as THRY":"THRY is Thryv Holdings, Inc..","which company has the Nasdaq symbol WEYS":"WEYS is Weyco Group, Inc..","name the company trading on Nasdaq as NGEN":"NGEN is NervGen Pharma Corp..","name the company trading on Nasdaq as BPAC":"BPAC is Blueport Acquisition Ltd.","what company is listed as ACGLO":"ACGLO is Arch Capital Group Ltd..","name the company trading on Nasdaq as WING":"WING is Wingstop Inc..","name the company trading on Nasdaq as FFBC":"FFBC is First Financial Bancorp..","name the company trading on Nasdaq as JCAP":"JCAP is Jefferson Capital, Inc..","which company has the Nasdaq symbol AMLX":"AMLX is Amylyx Pharmaceuticals, Inc..","what company is listed as RMTI":"RMTI is Rockwell Medical, Inc..","name the company trading on Nasdaq as SRBK":"SRBK is SR Bancorp, Inc..","what company is listed as KDP":"KDP is Keurig Dr Pepper Inc..","which company has the Nasdaq symbol EOSEW":"EOSEW is Eos Energy Enterprises, Inc..","which company has the Nasdaq symbol OBX":"OBX is Obsidian Therapeutics, Inc..","what company is listed as TNONW":"TNONW is Tenon Medical, Inc..","which company has the Nasdaq symbol CSQ":"CSQ is Calamos Strategic Total Return Fund.","what company is listed as LPBB":"LPBB is Launch Two Acquisition Corp..","what company is listed as GCBC":"GCBC is Greene County Bancorp, Inc..","name the company trading on Nasdaq as SWVLW":"SWVLW is Swvl Holdings Corp.","what company is listed as PRE":"PRE is Prenetics Global Limited.","which company has the Nasdaq symbol FTHA":"FTHA is Forefront Tech Holdings Acquisition Corp.","name the company trading on Nasdaq as STOK":"STOK is Stoke Therapeutics, Inc..","what company is listed as PKBK":"PKBK is Parke Bancorp, Inc..","name the company trading on Nasdaq as TANH":"TANH is Tantech Holdings Ltd..","name the company trading on Nasdaq as IACQ":"IACQ is Irenic Acquisition Corp..","what company is listed as IGAC":"IGAC is Invest Green Acquisition Corporation.","name the company trading on Nasdaq as MCFT":"MCFT is MasterCraft Boat Holdings, Inc..","which company has the Nasdaq symbol ARCL":"ARCL is ARC Group Acquisition I Corp.","which company has the Nasdaq symbol REGCP":"REGCP is Regency Centers Corporation.","what company is listed as ARHS":"ARHS is Arhaus, Inc..","what company is listed as NKTR":"NKTR is Nektar Therapeutics.","name the company trading on Nasdaq as PLUS":"PLUS is ePlus inc..","which company has the Nasdaq symbol MKDW":"MKDW is MKDWELL Tech Inc..","name the company trading on Nasdaq as CXIIU":"CXIIU is Churchill Capital Corp XII.","name the company trading on Nasdaq as SENEA":"SENEA is Seneca Foods Corp..","which company has the Nasdaq symbol SOLS":"SOLS is Solstice Advanced Materials Inc..","which company has the Nasdaq symbol TCOM":"TCOM is Trip.com Group Limited.","name the company trading on Nasdaq as STAK":"STAK is STAK Inc..","what company is listed as ALOVW":"ALOVW is Aldabra 4 Liquidity Opportunity Vehicle, Inc..","name the company trading on Nasdaq as ONCHW":"ONCHW is 1RT Acquisition Corp..","name the company trading on Nasdaq as MGYR":"MGYR is Magyar Bancorp, Inc..","what company is listed as VLOSU":"VLOSU is Velos Acquisition I Corp..","which company has the Nasdaq symbol TIL":"TIL is Instil Bio, Inc..","which company has the Nasdaq symbol RBCAA":"RBCAA is Republic Bancorp, Inc..","name the company trading on Nasdaq as BRKRP":"BRKRP is Bruker Corporation.","which company has the Nasdaq symbol EZRA":"EZRA is Reliance Global Group, Inc..","which company has the Nasdaq symbol ZBRA":"ZBRA is Zebra Technologies Corporation.","name the company trading on Nasdaq as ORIQU":"ORIQU is Origin Investment Corp I.","what company is listed as CAPR":"CAPR is Capricor Therapeutics, Inc..","what company is listed as PEPG":"PEPG is PepGen Inc..","name the company trading on Nasdaq as BLZRU":"BLZRU is Trailblazer Acquisition Corp..","which company has the Nasdaq symbol CCTG":"CCTG is CCSC Technology International Holdings Limited.","name the company trading on Nasdaq as ASTH":"ASTH is Astrana Health Inc..","what company is listed as SMCIP":"SMCIP is Super Micro Computer, Inc..","what company is listed as CNXU":"CNXU is Conexeu Sciences Inc..","name the company trading on Nasdaq as CTRN":"CTRN is Citi Trends, Inc..","which company has the Nasdaq symbol SWKHL":"SWKHL is SWK Holdings Corporation.","what company is listed as TACOW":"TACOW is Berto Acquisition Corp..","which company has the Nasdaq symbol PDYN":"PDYN is Palladyne AI Corp..","what company is listed as WSBCO":"WSBCO is WesBanco, Inc..","what company is listed as BPYPN":"BPYPN is Brookfield Property Partners L.P..","name the company trading on Nasdaq as TCRT":"TCRT is Alaunos Therapeutics, Inc..","which company has the Nasdaq symbol PTAC":"PTAC is Patriot Acquisition Corp..","what company is listed as JKHY":"JKHY is Jack Henry & Associates, Inc.."}}},
{"id":"n-19e3eb3f","guard":[["has","company"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PDSB":"PDSB is PDS Biotechnology Corporation.","what company is listed as MDRR":"MDRR is Medalist Diversified, Inc..","name the company trading on Nasdaq as IONR":"IONR is ioneer Ltd.","which company has the Nasdaq symbol GRI":"GRI is GRI Bio, Inc..","what company is listed as ECPG":"ECPG is Encore Capital Group Inc.","which company has the Nasdaq symbol BYFC":"BYFC is Broadway Financial Corporation.","which company has the Nasdaq symbol SORNU":"SORNU is Soren Acquisition Corp..","which company has the Nasdaq symbol VIVK":"VIVK is Vivakor, Inc..","what company is listed as CODX":"CODX is Co-Diagnostics, Inc..","name the company trading on Nasdaq as NODK":"NODK is NI Holdings, Inc..","what company is listed as CRDO":"CRDO is Credo Technology Group Holding Ltd.","what company is listed as JAGX":"JAGX is Jaguar Health, Inc..","name the company trading on Nasdaq as DLHC":"DLHC is DLH Holdings Corp..","which company has the Nasdaq symbol TNMG":"TNMG is TNL Mediagene.","which company has the Nasdaq symbol ECBK":"ECBK is ECB Bancorp, Inc..","which company has the Nasdaq symbol CME":"CME is CME Group Inc..","which company has the Nasdaq symbol INSG":"INSG is Inseego Corp..","which company has the Nasdaq symbol TECX":"TECX is Tectonic Therapeutic, Inc..","which company has the Nasdaq symbol RFAIU":"RFAIU is RF Acquisition Corp II.","which company has the Nasdaq symbol BWIN":"BWIN is The Baldwin Insurance Group, Inc..","name the company trading on Nasdaq as SRZN":"SRZN is Surrozen, Inc..","name the company trading on Nasdaq as FIP":"FIP is FTAI Infrastructure Inc..","what company is listed as MRLN":"MRLN is Merlin, Inc..","name the company trading on Nasdaq as THH":"THH is TryHard Holdings Limited.","name the company trading on Nasdaq as BMHL":"BMHL is Bluemount Holdings Limited.","what company is listed as GLSI":"GLSI is Greenwich LifeSciences, Inc..","what company is listed as QQQX":"QQQX is Nuveen NASDAQ 100 Dynamic Overwrite Fund.","what company is listed as BZAI":"BZAI is Blaize Holdings, Inc..","what company is listed as FORM":"FORM is FormFactor, Inc..","which company has the Nasdaq symbol PTACW":"PTACW is Patriot Acquisition Corp..","name the company trading on Nasdaq as XRXDW":"XRXDW is Xerox Holdings Corporation.","which company has the Nasdaq symbol NEXR":"NEXR is Nexera Technologies Ltd.","what company is listed as NOEMW":"NOEMW is CO2 Energy Transition Corp..","name the company trading on Nasdaq as AEHL":"AEHL is Antelope Enterprise Holdings Limited.","which company has the Nasdaq symbol SKYAW":"SKYAW is SkyAI, Inc..","what company is listed as GAINI":"GAINI is Gladstone Investment Corporation.","name the company trading on Nasdaq as THRY":"THRY is Thryv Holdings, Inc..","which company has the Nasdaq symbol WEYS":"WEYS is Weyco Group, Inc..","name the company trading on Nasdaq as NGEN":"NGEN is NervGen Pharma Corp..","name the company trading on Nasdaq as BPAC":"BPAC is Blueport Acquisition Ltd.","what company is listed as ACGLO":"ACGLO is Arch Capital Group Ltd..","name the company trading on Nasdaq as WING":"WING is Wingstop Inc..","name the company trading on Nasdaq as FFBC":"FFBC is First Financial Bancorp..","name the company trading on Nasdaq as JCAP":"JCAP is Jefferson Capital, Inc..","which company has the Nasdaq symbol AMLX":"AMLX is Amylyx Pharmaceuticals, Inc..","what company is listed as RMTI":"RMTI is Rockwell Medical, Inc..","name the company trading on Nasdaq as SRBK":"SRBK is SR Bancorp, Inc..","what company is listed as KDP":"KDP is Keurig Dr Pepper Inc..","which company has the Nasdaq symbol EOSEW":"EOSEW is Eos Energy Enterprises, Inc..","which company has the Nasdaq symbol OBX":"OBX is Obsidian Therapeutics, Inc..","what company is listed as TNONW":"TNONW is Tenon Medical, Inc..","which company has the Nasdaq symbol CSQ":"CSQ is Calamos Strategic Total Return Fund.","what company is listed as LPBB":"LPBB is Launch Two Acquisition Corp..","what company is listed as GCBC":"GCBC is Greene County Bancorp, Inc..","name the company trading on Nasdaq as SWVLW":"SWVLW is Swvl Holdings Corp.","what company is listed as PRE":"PRE is Prenetics Global Limited.","which company has the Nasdaq symbol FTHA":"FTHA is Forefront Tech Holdings Acquisition Corp.","name the company trading on Nasdaq as STOK":"STOK is Stoke Therapeutics, Inc..","what company is listed as PKBK":"PKBK is Parke Bancorp, Inc..","name the company trading on Nasdaq as TANH":"TANH is Tantech Holdings Ltd..","name the company trading on Nasdaq as IACQ":"IACQ is Irenic Acquisition Corp..","what company is listed as IGAC":"IGAC is Invest Green Acquisition Corporation.","name the company trading on Nasdaq as MCFT":"MCFT is MasterCraft Boat Holdings, Inc..","which company has the Nasdaq symbol ARCL":"ARCL is ARC Group Acquisition I Corp.","which company has the Nasdaq symbol REGCP":"REGCP is Regency Centers Corporation.","what company is listed as ARHS":"ARHS is Arhaus, Inc..","what company is listed as NKTR":"NKTR is Nektar Therapeutics.","name the company trading on Nasdaq as PLUS":"PLUS is ePlus inc..","which company has the Nasdaq symbol MKDW":"MKDW is MKDWELL Tech Inc..","name the company trading on Nasdaq as CXIIU":"CXIIU is Churchill Capital Corp XII.","name the company trading on Nasdaq as SENEA":"SENEA is Seneca Foods Corp..","which company has the Nasdaq symbol SOLS":"SOLS is Solstice Advanced Materials Inc..","which company has the Nasdaq symbol TCOM":"TCOM is Trip.com Group Limited.","name the company trading on Nasdaq as STAK":"STAK is STAK Inc..","what company is listed as ALOVW":"ALOVW is Aldabra 4 Liquidity Opportunity Vehicle, Inc..","name the company trading on Nasdaq as ONCHW":"ONCHW is 1RT Acquisition Corp..","name the company trading on Nasdaq as MGYR":"MGYR is Magyar Bancorp, Inc..","what company is listed as VLOSU":"VLOSU is Velos Acquisition I Corp..","which company has the Nasdaq symbol TIL":"TIL is Instil Bio, Inc..","which company has the Nasdaq symbol RBCAA":"RBCAA is Republic Bancorp, Inc..","name the company trading on Nasdaq as BRKRP":"BRKRP is Bruker Corporation.","which company has the Nasdaq symbol EZRA":"EZRA is Reliance Global Group, Inc..","which company has the Nasdaq symbol ZBRA":"ZBRA is Zebra Technologies Corporation.","name the company trading on Nasdaq as ORIQU":"ORIQU is Origin Investment Corp I.","what company is listed as CAPR":"CAPR is Capricor Therapeutics, Inc..","what company is listed as PEPG":"PEPG is PepGen Inc..","name the company trading on Nasdaq as BLZRU":"BLZRU is Trailblazer Acquisition Corp..","which company has the Nasdaq symbol CCTG":"CCTG is CCSC Technology International Holdings Limited.","name the company trading on Nasdaq as ASTH":"ASTH is Astrana Health Inc..","what company is listed as SMCIP":"SMCIP is Super Micro Computer, Inc..","what company is listed as CNXU":"CNXU is Conexeu Sciences Inc..","name the company trading on Nasdaq as CTRN":"CTRN is Citi Trends, Inc..","which company has the Nasdaq symbol SWKHL":"SWKHL is SWK Holdings Corporation.","what company is listed as TACOW":"TACOW is Berto Acquisition Corp..","which company has the Nasdaq symbol PDYN":"PDYN is Palladyne AI Corp..","what company is listed as WSBCO":"WSBCO is WesBanco, Inc..","what company is listed as BPYPN":"BPYPN is Brookfield Property Partners L.P..","name the company trading on Nasdaq as TCRT":"TCRT is Alaunos Therapeutics, Inc..","which company has the Nasdaq symbol PTAC":"PTAC is Patriot Acquisition Corp..","what company is listed as JKHY":"JKHY is Jack Henry & Associates, Inc.."}}},
{"id":"n-f953ba38","guard":[["has","company"]],"pyramid":["render.str",["memory.lookup",["sense.lastWord"]]],"mem":{"table":{"PDSB":"PDSB is PDS Biotechnology Corporation.","MDRR":"MDRR is Medalist Diversified, Inc..","IONR":"IONR is ioneer Ltd.","GRI":"GRI is GRI Bio, Inc..","ECPG":"ECPG is Encore Capital Group Inc.","BYFC":"BYFC is Broadway Financial Corporation.","SORNU":"SORNU is Soren Acquisition Corp..","VIVK":"VIVK is Vivakor, Inc..","CODX":"CODX is Co-Diagnostics, Inc..","NODK":"NODK is NI Holdings, Inc..","CRDO":"CRDO is Credo Technology Group Holding Ltd.","JAGX":"JAGX is Jaguar Health, Inc..","DLHC":"DLHC is DLH Holdings Corp..","TNMG":"TNMG is TNL Mediagene.","ECBK":"ECBK is ECB Bancorp, Inc..","CME":"CME is CME Group Inc..","INSG":"INSG is Inseego Corp..","TECX":"TECX is Tectonic Therapeutic, Inc..","RFAIU":"RFAIU is RF Acquisition Corp II.","BWIN":"BWIN is The Baldwin Insurance Group, Inc..","SRZN":"SRZN is Surrozen, Inc..","FIP":"FIP is FTAI Infrastructure Inc..","MRLN":"MRLN is Merlin, Inc..","THH":"THH is TryHard Holdings Limited.","BMHL":"BMHL is Bluemount Holdings Limited.","GLSI":"GLSI is Greenwich LifeSciences, Inc..","QQQX":"QQQX is Nuveen NASDAQ 100 Dynamic Overwrite Fund.","BZAI":"BZAI is Blaize Holdings, Inc..","FORM":"FORM is FormFactor, Inc..","PTACW":"PTACW is Patriot Acquisition Corp..","XRXDW":"XRXDW is Xerox Holdings Corporation.","NEXR":"NEXR is Nexera Technologies Ltd.","NOEMW":"NOEMW is CO2 Energy Transition Corp..","AEHL":"AEHL is Antelope Enterprise Holdings Limited.","SKYAW":"SKYAW is SkyAI, Inc..","GAINI":"GAINI is Gladstone Investment Corporation.","THRY":"THRY is Thryv Holdings, Inc..","WEYS":"WEYS is Weyco Group, Inc..","NGEN":"NGEN is NervGen Pharma Corp..","BPAC":"BPAC is Blueport Acquisition Ltd.","ACGLO":"ACGLO is Arch Capital Group Ltd..","WING":"WING is Wingstop Inc..","FFBC":"FFBC is First Financial Bancorp..","JCAP":"JCAP is Jefferson Capital, Inc..","AMLX":"AMLX is Amylyx Pharmaceuticals, Inc..","RMTI":"RMTI is Rockwell Medical, Inc..","SRBK":"SRBK is SR Bancorp, Inc..","KDP":"KDP is Keurig Dr Pepper Inc..","EOSEW":"EOSEW is Eos Energy Enterprises, Inc..","OBX":"OBX is Obsidian Therapeutics, Inc..","TNONW":"TNONW is Tenon Medical, Inc..","CSQ":"CSQ is Calamos Strategic Total Return Fund.","LPBB":"LPBB is Launch Two Acquisition Corp..","GCBC":"GCBC is Greene County Bancorp, Inc..","SWVLW":"SWVLW is Swvl Holdings Corp.","PRE":"PRE is Prenetics Global Limited.","FTHA":"FTHA is Forefront Tech Holdings Acquisition Corp.","STOK":"STOK is Stoke Therapeutics, Inc..","PKBK":"PKBK is Parke Bancorp, Inc..","TANH":"TANH is Tantech Holdings Ltd..","IACQ":"IACQ is Irenic Acquisition Corp..","IGAC":"IGAC is Invest Green Acquisition Corporation.","MCFT":"MCFT is MasterCraft Boat Holdings, Inc..","ARCL":"ARCL is ARC Group Acquisition I Corp.","REGCP":"REGCP is Regency Centers Corporation.","ARHS":"ARHS is Arhaus, Inc..","NKTR":"NKTR is Nektar Therapeutics.","PLUS":"PLUS is ePlus inc..","MKDW":"MKDW is MKDWELL Tech Inc..","CXIIU":"CXIIU is Churchill Capital Corp XII.","SENEA":"SENEA is Seneca Foods Corp..","SOLS":"SOLS is Solstice Advanced Materials Inc..","TCOM":"TCOM is Trip.com Group Limited.","STAK":"STAK is STAK Inc..","ALOVW":"ALOVW is Aldabra 4 Liquidity Opportunity Vehicle, Inc..","ONCHW":"ONCHW is 1RT Acquisition Corp..","MGYR":"MGYR is Magyar Bancorp, Inc..","VLOSU":"VLOSU is Velos Acquisition I Corp..","TIL":"TIL is Instil Bio, Inc..","RBCAA":"RBCAA is Republic Bancorp, Inc..","BRKRP":"BRKRP is Bruker Corporation.","EZRA":"EZRA is Reliance Global Group, Inc..","ZBRA":"ZBRA is Zebra Technologies Corporation.","ORIQU":"ORIQU is Origin Investment Corp I.","CAPR":"CAPR is Capricor Therapeutics, Inc..","PEPG":"PEPG is PepGen Inc..","BLZRU":"BLZRU is Trailblazer Acquisition Corp..","CCTG":"CCTG is CCSC Technology International Holdings Limited.","ASTH":"ASTH is Astrana Health Inc..","SMCIP":"SMCIP is Super Micro Computer, Inc..","CNXU":"CNXU is Conexeu Sciences Inc..","CTRN":"CTRN is Citi Trends, Inc..","SWKHL":"SWKHL is SWK Holdings Corporation.","TACOW":"TACOW is Berto Acquisition Corp..","PDYN":"PDYN is Palladyne AI Corp..","WSBCO":"WSBCO is WesBanco, Inc..","BPYPN":"BPYPN is Brookfield Property Partners L.P..","TCRT":"TCRT is Alaunos Therapeutics, Inc..","PTAC":"PTAC is Patriot Acquisition Corp..","JKHY":"JKHY is Jack Henry & Associates, Inc.."}}},
{"id":"n-6ac99364","guard":[["has","company"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"company"}]]],"mem":{"table":{"has the Nasdaq symbol PDSB":"PDSB is PDS Biotechnology Corporation.","is listed as MDRR":"MDRR is Medalist Diversified, Inc..","trading on Nasdaq as IONR":"IONR is ioneer Ltd.","has the Nasdaq symbol GRI":"GRI is GRI Bio, Inc..","is listed as ECPG":"ECPG is Encore Capital Group Inc.","has the Nasdaq symbol BYFC":"BYFC is Broadway Financial Corporation.","has the Nasdaq symbol SORNU":"SORNU is Soren Acquisition Corp..","has the Nasdaq symbol VIVK":"VIVK is Vivakor, Inc..","is listed as CODX":"CODX is Co-Diagnostics, Inc..","trading on Nasdaq as NODK":"NODK is NI Holdings, Inc..","is listed as CRDO":"CRDO is Credo Technology Group Holding Ltd.","is listed as JAGX":"JAGX is Jaguar Health, Inc..","trading on Nasdaq as DLHC":"DLHC is DLH Holdings Corp..","has the Nasdaq symbol TNMG":"TNMG is TNL Mediagene.","has the Nasdaq symbol ECBK":"ECBK is ECB Bancorp, Inc..","has the Nasdaq symbol CME":"CME is CME Group Inc..","has the Nasdaq symbol INSG":"INSG is Inseego Corp..","has the Nasdaq symbol TECX":"TECX is Tectonic Therapeutic, Inc..","has the Nasdaq symbol RFAIU":"RFAIU is RF Acquisition Corp II.","has the Nasdaq symbol BWIN":"BWIN is The Baldwin Insurance Group, Inc..","trading on Nasdaq as SRZN":"SRZN is Surrozen, Inc..","trading on Nasdaq as FIP":"FIP is FTAI Infrastructure Inc..","is listed as MRLN":"MRLN is Merlin, Inc..","trading on Nasdaq as THH":"THH is TryHard Holdings Limited.","trading on Nasdaq as BMHL":"BMHL is Bluemount Holdings Limited.","is listed as GLSI":"GLSI is Greenwich LifeSciences, Inc..","is listed as QQQX":"QQQX is Nuveen NASDAQ 100 Dynamic Overwrite Fund.","is listed as BZAI":"BZAI is Blaize Holdings, Inc..","is listed as FORM":"FORM is FormFactor, Inc..","has the Nasdaq symbol PTACW":"PTACW is Patriot Acquisition Corp..","trading on Nasdaq as XRXDW":"XRXDW is Xerox Holdings Corporation.","has the Nasdaq symbol NEXR":"NEXR is Nexera Technologies Ltd.","is listed as NOEMW":"NOEMW is CO2 Energy Transition Corp..","trading on Nasdaq as AEHL":"AEHL is Antelope Enterprise Holdings Limited.","has the Nasdaq symbol SKYAW":"SKYAW is SkyAI, Inc..","is listed as GAINI":"GAINI is Gladstone Investment Corporation.","trading on Nasdaq as THRY":"THRY is Thryv Holdings, Inc..","has the Nasdaq symbol WEYS":"WEYS is Weyco Group, Inc..","trading on Nasdaq as NGEN":"NGEN is NervGen Pharma Corp..","trading on Nasdaq as BPAC":"BPAC is Blueport Acquisition Ltd.","is listed as ACGLO":"ACGLO is Arch Capital Group Ltd..","trading on Nasdaq as WING":"WING is Wingstop Inc..","trading on Nasdaq as FFBC":"FFBC is First Financial Bancorp..","trading on Nasdaq as JCAP":"JCAP is Jefferson Capital, Inc..","has the Nasdaq symbol AMLX":"AMLX is Amylyx Pharmaceuticals, Inc..","is listed as RMTI":"RMTI is Rockwell Medical, Inc..","trading on Nasdaq as SRBK":"SRBK is SR Bancorp, Inc..","is listed as KDP":"KDP is Keurig Dr Pepper Inc..","has the Nasdaq symbol EOSEW":"EOSEW is Eos Energy Enterprises, Inc..","has the Nasdaq symbol OBX":"OBX is Obsidian Therapeutics, Inc..","is listed as TNONW":"TNONW is Tenon Medical, Inc..","has the Nasdaq symbol CSQ":"CSQ is Calamos Strategic Total Return Fund.","is listed as LPBB":"LPBB is Launch Two Acquisition Corp..","is listed as GCBC":"GCBC is Greene County Bancorp, Inc..","trading on Nasdaq as SWVLW":"SWVLW is Swvl Holdings Corp.","is listed as PRE":"PRE is Prenetics Global Limited.","has the Nasdaq symbol FTHA":"FTHA is Forefront Tech Holdings Acquisition Corp.","trading on Nasdaq as STOK":"STOK is Stoke Therapeutics, Inc..","is listed as PKBK":"PKBK is Parke Bancorp, Inc..","trading on Nasdaq as TANH":"TANH is Tantech Holdings Ltd..","trading on Nasdaq as IACQ":"IACQ is Irenic Acquisition Corp..","is listed as IGAC":"IGAC is Invest Green Acquisition Corporation.","trading on Nasdaq as MCFT":"MCFT is MasterCraft Boat Holdings, Inc..","has the Nasdaq symbol ARCL":"ARCL is ARC Group Acquisition I Corp.","has the Nasdaq symbol REGCP":"REGCP is Regency Centers Corporation.","is listed as ARHS":"ARHS is Arhaus, Inc..","is listed as NKTR":"NKTR is Nektar Therapeutics.","trading on Nasdaq as PLUS":"PLUS is ePlus inc..","has the Nasdaq symbol MKDW":"MKDW is MKDWELL Tech Inc..","trading on Nasdaq as CXIIU":"CXIIU is Churchill Capital Corp XII.","trading on Nasdaq as SENEA":"SENEA is Seneca Foods Corp..","has the Nasdaq symbol SOLS":"SOLS is Solstice Advanced Materials Inc..","has the Nasdaq symbol TCOM":"TCOM is Trip.com Group Limited.","trading on Nasdaq as STAK":"STAK is STAK Inc..","is listed as ALOVW":"ALOVW is Aldabra 4 Liquidity Opportunity Vehicle, Inc..","trading on Nasdaq as ONCHW":"ONCHW is 1RT Acquisition Corp..","trading on Nasdaq as MGYR":"MGYR is Magyar Bancorp, Inc..","is listed as VLOSU":"VLOSU is Velos Acquisition I Corp..","has the Nasdaq symbol TIL":"TIL is Instil Bio, Inc..","has the Nasdaq symbol RBCAA":"RBCAA is Republic Bancorp, Inc..","trading on Nasdaq as BRKRP":"BRKRP is Bruker Corporation.","has the Nasdaq symbol EZRA":"EZRA is Reliance Global Group, Inc..","has the Nasdaq symbol ZBRA":"ZBRA is Zebra Technologies Corporation.","trading on Nasdaq as ORIQU":"ORIQU is Origin Investment Corp I.","is listed as CAPR":"CAPR is Capricor Therapeutics, Inc..","is listed as PEPG":"PEPG is PepGen Inc..","trading on Nasdaq as BLZRU":"BLZRU is Trailblazer Acquisition Corp..","has the Nasdaq symbol CCTG":"CCTG is CCSC Technology International Holdings Limited.","trading on Nasdaq as ASTH":"ASTH is Astrana Health Inc..","is listed as SMCIP":"SMCIP is Super Micro Computer, Inc..","is listed as CNXU":"CNXU is Conexeu Sciences Inc..","trading on Nasdaq as CTRN":"CTRN is Citi Trends, Inc..","has the Nasdaq symbol SWKHL":"SWKHL is SWK Holdings Corporation.","is listed as TACOW":"TACOW is Berto Acquisition Corp..","has the Nasdaq symbol PDYN":"PDYN is Palladyne AI Corp..","is listed as WSBCO":"WSBCO is WesBanco, Inc..","is listed as BPYPN":"BPYPN is Brookfield Property Partners L.P..","trading on Nasdaq as TCRT":"TCRT is Alaunos Therapeutics, Inc..","has the Nasdaq symbol PTAC":"PTAC is Patriot Acquisition Corp..","is listed as JKHY":"JKHY is Jack Henry & Associates, Inc.."}}},
{"id":"n-685de9f8","guard":[["has","company"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"nasdaq"}]]],"mem":{"table":{"symbol PDSB":"PDSB is PDS Biotechnology Corporation.","as IONR":"IONR is ioneer Ltd.","symbol GRI":"GRI is GRI Bio, Inc..","symbol BYFC":"BYFC is Broadway Financial Corporation.","symbol SORNU":"SORNU is Soren Acquisition Corp..","symbol VIVK":"VIVK is Vivakor, Inc..","as NODK":"NODK is NI Holdings, Inc..","as DLHC":"DLHC is DLH Holdings Corp..","symbol TNMG":"TNMG is TNL Mediagene.","symbol ECBK":"ECBK is ECB Bancorp, Inc..","symbol CME":"CME is CME Group Inc..","symbol INSG":"INSG is Inseego Corp..","symbol TECX":"TECX is Tectonic Therapeutic, Inc..","symbol RFAIU":"RFAIU is RF Acquisition Corp II.","symbol BWIN":"BWIN is The Baldwin Insurance Group, Inc..","as SRZN":"SRZN is Surrozen, Inc..","as FIP":"FIP is FTAI Infrastructure Inc..","as THH":"THH is TryHard Holdings Limited.","as BMHL":"BMHL is Bluemount Holdings Limited.","symbol PTACW":"PTACW is Patriot Acquisition Corp..","as XRXDW":"XRXDW is Xerox Holdings Corporation.","symbol NEXR":"NEXR is Nexera Technologies Ltd.","as AEHL":"AEHL is Antelope Enterprise Holdings Limited.","symbol SKYAW":"SKYAW is SkyAI, Inc..","as THRY":"THRY is Thryv Holdings, Inc..","symbol WEYS":"WEYS is Weyco Group, Inc..","as NGEN":"NGEN is NervGen Pharma Corp..","as BPAC":"BPAC is Blueport Acquisition Ltd.","as WING":"WING is Wingstop Inc..","as FFBC":"FFBC is First Financial Bancorp..","as JCAP":"JCAP is Jefferson Capital, Inc..","symbol AMLX":"AMLX is Amylyx Pharmaceuticals, Inc..","as SRBK":"SRBK is SR Bancorp, Inc..","symbol EOSEW":"EOSEW is Eos Energy Enterprises, Inc..","symbol OBX":"OBX is Obsidian Therapeutics, Inc..","symbol CSQ":"CSQ is Calamos Strategic Total Return Fund.","as SWVLW":"SWVLW is Swvl Holdings Corp.","symbol FTHA":"FTHA is Forefront Tech Holdings Acquisition Corp.","as STOK":"STOK is Stoke Therapeutics, Inc..","as TANH":"TANH is Tantech Holdings Ltd..","as IACQ":"IACQ is Irenic Acquisition Corp..","as MCFT":"MCFT is MasterCraft Boat Holdings, Inc..","symbol ARCL":"ARCL is ARC Group Acquisition I Corp.","symbol REGCP":"REGCP is Regency Centers Corporation.","as PLUS":"PLUS is ePlus inc..","symbol MKDW":"MKDW is MKDWELL Tech Inc..","as CXIIU":"CXIIU is Churchill Capital Corp XII.","as SENEA":"SENEA is Seneca Foods Corp..","symbol SOLS":"SOLS is Solstice Advanced Materials Inc..","symbol TCOM":"TCOM is Trip.com Group Limited.","as STAK":"STAK is STAK Inc..","as ONCHW":"ONCHW is 1RT Acquisition Corp..","as MGYR":"MGYR is Magyar Bancorp, Inc..","symbol TIL":"TIL is Instil Bio, Inc..","symbol RBCAA":"RBCAA is Republic Bancorp, Inc..","as BRKRP":"BRKRP is Bruker Corporation.","symbol EZRA":"EZRA is Reliance Global Group, Inc..","symbol ZBRA":"ZBRA is Zebra Technologies Corporation.","as ORIQU":"ORIQU is Origin Investment Corp I.","as BLZRU":"BLZRU is Trailblazer Acquisition Corp..","symbol CCTG":"CCTG is CCSC Technology International Holdings Limited.","as ASTH":"ASTH is Astrana Health Inc..","as CTRN":"CTRN is Citi Trends, Inc..","symbol SWKHL":"SWKHL is SWK Holdings Corporation.","symbol PDYN":"PDYN is Palladyne AI Corp..","as TCRT":"TCRT is Alaunos Therapeutics, Inc..","symbol PTAC":"PTAC is Patriot Acquisition Corp.."}}},
{"id":"n-48c87629","guard":[["has","company"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"listed as MDRR":"MDRR is Medalist Diversified, Inc..","listed as ECPG":"ECPG is Encore Capital Group Inc.","listed as CODX":"CODX is Co-Diagnostics, Inc..","listed as CRDO":"CRDO is Credo Technology Group Holding Ltd.","listed as JAGX":"JAGX is Jaguar Health, Inc..","listed as MRLN":"MRLN is Merlin, Inc..","listed as GLSI":"GLSI is Greenwich LifeSciences, Inc..","listed as QQQX":"QQQX is Nuveen NASDAQ 100 Dynamic Overwrite Fund.","listed as BZAI":"BZAI is Blaize Holdings, Inc..","listed as FORM":"FORM is FormFactor, Inc..","listed as NOEMW":"NOEMW is CO2 Energy Transition Corp..","listed as GAINI":"GAINI is Gladstone Investment Corporation.","listed as ACGLO":"ACGLO is Arch Capital Group Ltd..","listed as RMTI":"RMTI is Rockwell Medical, Inc..","listed as KDP":"KDP is Keurig Dr Pepper Inc..","listed as TNONW":"TNONW is Tenon Medical, Inc..","listed as LPBB":"LPBB is Launch Two Acquisition Corp..","listed as GCBC":"GCBC is Greene County Bancorp, Inc..","listed as PRE":"PRE is Prenetics Global Limited.","listed as PKBK":"PKBK is Parke Bancorp, Inc..","listed as IGAC":"IGAC is Invest Green Acquisition Corporation.","listed as ARHS":"ARHS is Arhaus, Inc..","listed as NKTR":"NKTR is Nektar Therapeutics.","listed as ALOVW":"ALOVW is Aldabra 4 Liquidity Opportunity Vehicle, Inc..","listed as VLOSU":"VLOSU is Velos Acquisition I Corp..","listed as CAPR":"CAPR is Capricor Therapeutics, Inc..","listed as PEPG":"PEPG is PepGen Inc..","listed as SMCIP":"SMCIP is Super Micro Computer, Inc..","listed as CNXU":"CNXU is Conexeu Sciences Inc..","listed as TACOW":"TACOW is Berto Acquisition Corp..","listed as WSBCO":"WSBCO is WesBanco, Inc..","listed as BPYPN":"BPYPN is Brookfield Property Partners L.P..","listed as JKHY":"JKHY is Jack Henry & Associates, Inc.."}}},
{"id":"n-d850814c","guard":[["has","company"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"on"}]]],"mem":{"table":{"Nasdaq as IONR":"IONR is ioneer Ltd.","Nasdaq as NODK":"NODK is NI Holdings, Inc..","Nasdaq as DLHC":"DLHC is DLH Holdings Corp..","Nasdaq as SRZN":"SRZN is Surrozen, Inc..","Nasdaq as FIP":"FIP is FTAI Infrastructure Inc..","Nasdaq as THH":"THH is TryHard Holdings Limited.","Nasdaq as BMHL":"BMHL is Bluemount Holdings Limited.","Nasdaq as XRXDW":"XRXDW is Xerox Holdings Corporation.","Nasdaq as AEHL":"AEHL is Antelope Enterprise Holdings Limited.","Nasdaq as THRY":"THRY is Thryv Holdings, Inc..","Nasdaq as NGEN":"NGEN is NervGen Pharma Corp..","Nasdaq as BPAC":"BPAC is Blueport Acquisition Ltd.","Nasdaq as WING":"WING is Wingstop Inc..","Nasdaq as FFBC":"FFBC is First Financial Bancorp..","Nasdaq as JCAP":"JCAP is Jefferson Capital, Inc..","Nasdaq as SRBK":"SRBK is SR Bancorp, Inc..","Nasdaq as SWVLW":"SWVLW is Swvl Holdings Corp.","Nasdaq as STOK":"STOK is Stoke Therapeutics, Inc..","Nasdaq as TANH":"TANH is Tantech Holdings Ltd..","Nasdaq as IACQ":"IACQ is Irenic Acquisition Corp..","Nasdaq as MCFT":"MCFT is MasterCraft Boat Holdings, Inc..","Nasdaq as PLUS":"PLUS is ePlus inc..","Nasdaq as CXIIU":"CXIIU is Churchill Capital Corp XII.","Nasdaq as SENEA":"SENEA is Seneca Foods Corp..","Nasdaq as STAK":"STAK is STAK Inc..","Nasdaq as ONCHW":"ONCHW is 1RT Acquisition Corp..","Nasdaq as MGYR":"MGYR is Magyar Bancorp, Inc..","Nasdaq as BRKRP":"BRKRP is Bruker Corporation.","Nasdaq as ORIQU":"ORIQU is Origin Investment Corp I.","Nasdaq as BLZRU":"BLZRU is Trailblazer Acquisition Corp..","Nasdaq as ASTH":"ASTH is Astrana Health Inc..","Nasdaq as CTRN":"CTRN is Citi Trends, Inc..","Nasdaq as TCRT":"TCRT is Alaunos Therapeutics, Inc.."}}},
{"id":"n-706f5c40","guard":[["hasAny",["ptac","ptacw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Patriot Acquisition Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-63222a24","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ptac","ptacw","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Patriot Acquisition Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f0030b04","guard":[["hasAny",["lower case","lowercase","ptac","ptacw","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Patriot Acquisition Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-156d9c2d","guard":[["hasAny",["ptac","ptacw","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",{"lit":"Patriot Acquisition Corp."},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-1e3800e2","guard":[["hasAny",["ptac","ptacw","separate by","split","split by"]]],"pyramid":["render.and",["transform.split",{"lit":"Patriot Acquisition Corp."},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-2be5100b","guard":[["hasAny",["delete","ptac","ptacw","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Patriot Acquisition Corp."},["sense.after",{"lit":"nasdaq"}]]],"mem":null},
{"id":"n-41e3e0cc","guard":[["hasAny",["ptac","ptacw","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",{"lit":"Patriot Acquisition Corp."},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-7224a5ac","guard":[["hasAny",["each word","ptac","ptacw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Patriot Acquisition Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8e5dd924","guard":[["hasAny",["item number","nth","position","ptac","ptacw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Patriot Acquisition Corp.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-aa97d94f","guard":[["hasAny",["delete","ptac","ptacw","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Patriot Acquisition Corp."},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-ff3fa26c","guard":[["hasAny",["each word","ptac","ptacw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Patriot Acquisition Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-007ad9ce","guard":[["has","nktr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as NKTR":"NKTR is Nektar Therapeutics."}}},
{"id":"n-00bb6646","guard":[["has","dlhc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as DLHC":"DLHC is DLH Holdings Corp.."}}},
{"id":"n-00e1c822","guard":[["hasAny",["company","name","nasdaq","stak","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as STAK":"STAK is STAK Inc.."}}},
{"id":"n-0100e98f","guard":[["has","pdyn"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Palladyne AI Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-015f475a","guard":[["has","csq"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Calamos Strategic Total Return Fund."]},["sense.lastWord"]],"mem":null},
{"id":"n-02f313cb","guard":[["has","ptacw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PTACW":"PTACW is Patriot Acquisition Corp.."}}},
{"id":"n-053517ec","guard":[["has","mgyr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as MGYR":"MGYR is Magyar Bancorp, Inc.."}}},
{"id":"n-055690f9","guard":[["has","blzru"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as BLZRU":"BLZRU is Trailblazer Acquisition Corp.."}}},
{"id":"n-0671eabf","guard":[["has","codx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as CODX":"CODX is Co-Diagnostics, Inc.."}}},
{"id":"n-06a31c9a","guard":[["hasAny",["acglo","company","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as ACGLO":"ACGLO is Arch Capital Group Ltd.."}}},
{"id":"n-06eebca0","guard":[["has","thh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as THH":"THH is TryHard Holdings Limited."}}},
{"id":"n-081a8fa1","guard":[["hasAny",["company","eosew","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol EOSEW":"EOSEW is Eos Energy Enterprises, Inc.."}}},
{"id":"n-08e672e0","guard":[["has","senea"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as SENEA":"SENEA is Seneca Foods Corp.."}}},
{"id":"n-099e1ac5","guard":[["has","gaini"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as GAINI":"GAINI is Gladstone Investment Corporation."}}},
{"id":"n-09ca8b1b","guard":[["has","ffbc"]],"pyramid":["render.template",{"lit":[{"slot":0}," is First Financial Bancorp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-0a39dda3","guard":[["has","mcft"]],"pyramid":["render.template",{"lit":[{"slot":0}," is MasterCraft Boat Holdings, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-0a5de349","guard":[["has","pdyn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PDYN":"PDYN is Palladyne AI Corp.."}}},
{"id":"n-0ad514f3","guard":[["has","til"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol TIL":"TIL is Instil Bio, Inc.."}}},
{"id":"n-0b915f28","guard":[["has","jagx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as JAGX":"JAGX is Jaguar Health, Inc.."}}},
{"id":"n-0be5b769","guard":[["hasAny",["company","has","mkdw","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol MKDW":"MKDW is MKDWELL Tech Inc.."}}},
{"id":"n-0bffae77","guard":[["has","regcp"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Regency Centers Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-0d9dad6d","guard":[["has","pdsb"]],"pyramid":["render.template",{"lit":[{"slot":0}," is PDS Biotechnology Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-100c2fb3","guard":[["has","qqqx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as QQQX":"QQQX is Nuveen NASDAQ 100 Dynamic Overwrite Fund."}}},
{"id":"n-11028d09","guard":[["has","tecx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tectonic Therapeutic, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-12a784da","guard":[["hasAny",["company","form","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as FORM":"FORM is FormFactor, Inc.."}}},
{"id":"n-12eb8865","guard":[["hasAny",["codx","company","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as CODX":"CODX is Co-Diagnostics, Inc.."}}},
{"id":"n-1343db1f","guard":[["hasAny",["company","gaini","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as GAINI":"GAINI is Gladstone Investment Corporation."}}},
{"id":"n-13e59e10","guard":[["hasAny",["company","name","nasdaq","srbk","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as SRBK":"SRBK is SR Bancorp, Inc.."}}},
{"id":"n-1498bf56","guard":[["hasAny",["company","ezra","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol EZRA":"EZRA is Reliance Global Group, Inc.."}}},
{"id":"n-152021a3","guard":[["hasAny",["company","ecpg","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as ECPG":"ECPG is Encore Capital Group Inc."}}},
{"id":"n-15d0e1b1","guard":[["hasAny",["company","listed","nktr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as NKTR":"NKTR is Nektar Therapeutics."}}},
{"id":"n-181d824d","guard":[["has","amlx"],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Amylyx Pharmaceuticals, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-18a74422","guard":[["has","aehl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as AEHL":"AEHL is Antelope Enterprise Holdings Limited."}}},
{"id":"n-1941098c","guard":[["has","cctg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol CCTG":"CCTG is CCSC Technology International Holdings Limited."}}},
{"id":"n-1a6a1e76","guard":[["has","nodk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as NODK":"NODK is NI Holdings, Inc.."}}},
{"id":"n-1aa38b7d","guard":[["has","ctrn"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Citi Trends, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-1b9d8d91","guard":[["hasAny",["company","name","nasdaq","tanh","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as TANH":"TANH is Tantech Holdings Ltd.."}}},
{"id":"n-1e51981c","guard":[["has","dlhc"]],"pyramid":["render.template",{"lit":[{"slot":0}," is DLH Holdings Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-1e819a9e","guard":[["hasAny",["company","has","nasdaq","rbcaa","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol RBCAA":"RBCAA is Republic Bancorp, Inc.."}}},
{"id":"n-1e8a3af6","guard":[["has","ngen"]],"pyramid":["render.template",{"lit":[{"slot":0}," is NervGen Pharma Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-1f45db3d","guard":[["hasAny",["company","name","nasdaq","stok","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as STOK":"STOK is Stoke Therapeutics, Inc.."}}},
{"id":"n-1fa6bcb7","guard":[["has","obx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol OBX":"OBX is Obsidian Therapeutics, Inc.."}}},
{"id":"n-1fab2fab","guard":[["hasAny",["company","fip","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as FIP":"FIP is FTAI Infrastructure Inc.."}}},
{"id":"n-21cfdd23","guard":[["hasAny",["alovw","company","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as ALOVW":"ALOVW is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."}}},
{"id":"n-228d4b00","guard":[["has","rbcaa"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Republic Bancorp, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-22a39218","guard":[["hasAny",["company","listed","mdrr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as MDRR":"MDRR is Medalist Diversified, Inc.."}}},
{"id":"n-22ce43cf","guard":[["hasAny",["company","has","nasdaq","swkhl","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol SWKHL":"SWKHL is SWK Holdings Corporation."}}},
{"id":"n-23135f11","guard":[["has","skyaw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol SKYAW":"SKYAW is SkyAI, Inc.."}}},
{"id":"n-234c2596","guard":[["has","thry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Thryv Holdings, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-2405bf1e","guard":[["hasAny",["company","listed","tacow"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as TACOW":"TACOW is Berto Acquisition Corp.."}}},
{"id":"n-24ee459a","guard":[["has","vivk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol VIVK":"VIVK is Vivakor, Inc.."}}},
{"id":"n-271effbd","guard":[["has","acglo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arch Capital Group Ltd.."]},["sense.lastWord"]],"mem":null},
{"id":"n-274900da","guard":[["hasAny",["company","jcap","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as JCAP":"JCAP is Jefferson Capital, Inc.."}}},
{"id":"n-29dbfa20","guard":[["has","tcom"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trip.com Group Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-2b3f0dca","guard":[["hasAny",["blzru","company","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as BLZRU":"BLZRU is Trailblazer Acquisition Corp.."}}},
{"id":"n-2c6c7777","guard":[["has","codx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Co-Diagnostics, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-2cc94997","guard":[["has","oriqu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as ORIQU":"ORIQU is Origin Investment Corp I."}}},
{"id":"n-2d2d29c7","guard":[["has","tnmg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is TNL Mediagene."]},["sense.lastWord"]],"mem":null},
{"id":"n-2d46d70f","guard":[["has","bmhl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as BMHL":"BMHL is Bluemount Holdings Limited."}}},
{"id":"n-2d4aad21","guard":[["hasAny",["bpac","company","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as BPAC":"BPAC is Blueport Acquisition Ltd."}}},
{"id":"n-2dd19833","guard":[["has","stak"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as STAK":"STAK is STAK Inc.."}}},
{"id":"n-2e2f377c","guard":[["has","plus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as PLUS":"PLUS is ePlus inc.."}}},
{"id":"n-2ec087c7","guard":[["has","regcp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol REGCP":"REGCP is Regency Centers Corporation."}}},
{"id":"n-2ed9549e","guard":[["has","mdrr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as MDRR":"MDRR is Medalist Diversified, Inc.."}}},
{"id":"n-2efa0f73","guard":[["has","swkhl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol SWKHL":"SWKHL is SWK Holdings Corporation."}}},
{"id":"n-2ff8d325","guard":[["hasAny",["amlx","company","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol AMLX":"AMLX is Amylyx Pharmaceuticals, Inc.."}}},
{"id":"n-300baa21","guard":[["has","tacow"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berto Acquisition Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-301c0292","guard":[["hasAny",["company","name","nasdaq","oriqu","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as ORIQU":"ORIQU is Origin Investment Corp I."}}},
{"id":"n-305277aa","guard":[["has","crdo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as CRDO":"CRDO is Credo Technology Group Holding Ltd."}}},
{"id":"n-30ef866d","guard":[["has","ctrn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as CTRN":"CTRN is Citi Trends, Inc.."}}},
{"id":"n-3114b1c1","guard":[["hasAny",["company","has","nasdaq","sornu","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol SORNU":"SORNU is Soren Acquisition Corp.."}}},
{"id":"n-316be78b","guard":[["has","nktr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nektar Therapeutics."]},["sense.lastWord"]],"mem":null},
{"id":"n-318445d6","guard":[["has","wsbco"]],"pyramid":["render.template",{"lit":[{"slot":0}," is WesBanco, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-32b32cf0","guard":[["has","brkrp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as BRKRP":"BRKRP is Bruker Corporation."}}},
{"id":"n-33782d75","guard":[["has","tcrt"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Alaunos Therapeutics, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-35a5956f","guard":[["hasAny",["company","mgyr","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as MGYR":"MGYR is Magyar Bancorp, Inc.."}}},
{"id":"n-363316e3","guard":[["has","tanh"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tantech Holdings Ltd.."]},["sense.lastWord"]],"mem":null},
{"id":"n-36499f73","guard":[["hasAny",["company","jkhy","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as JKHY":"JKHY is Jack Henry & Associates, Inc.."}}},
{"id":"n-3d7f925a","guard":[["hasAny",["company","listed","pkbk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as PKBK":"PKBK is Parke Bancorp, Inc.."}}},
{"id":"n-3e0ff14d","guard":[["hasAny",["company","has","nasdaq","nexr","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol NEXR":"NEXR is Nexera Technologies Ltd."}}},
{"id":"n-3e590cae","guard":[["has","cxiiu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Churchill Capital Corp XII."]},["sense.lastWord"]],"mem":null},
{"id":"n-3e72e22f","guard":[["hasAny",["company","has","nasdaq","symbol","weys"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol WEYS":"WEYS is Weyco Group, Inc.."}}},
{"id":"n-3f59368e","guard":[["hasAny",["company","name","nasdaq","tcrt","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as TCRT":"TCRT is Alaunos Therapeutics, Inc.."}}},
{"id":"n-3f5b5ed9","guard":[["has","byfc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol BYFC":"BYFC is Broadway Financial Corporation."}}},
{"id":"n-40ce9956","guard":[["has","pre"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as PRE":"PRE is Prenetics Global Limited."}}},
{"id":"n-40d56c3e","guard":[["has","form"],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FormFactor, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-426fedf1","guard":[["hasAny",["arhs","company","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as ARHS":"ARHS is Arhaus, Inc.."}}},
{"id":"n-437e6de4","guard":[["hasAny",["arcl","company","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol ARCL":"ARCL is ARC Group Acquisition I Corp."}}},
{"id":"n-43a7c908","guard":[["has","ffbc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as FFBC":"FFBC is First Financial Bancorp.."}}},
{"id":"n-44b334a1","guard":[["hasAny",["company","has","nasdaq","pdyn","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PDYN":"PDYN is Palladyne AI Corp.."}}},
{"id":"n-46716b81","guard":[["hasAny",["brkrp","company","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as BRKRP":"BRKRP is Bruker Corporation."}}},
{"id":"n-48e832ff","guard":[["hasAny",["company","has","nasdaq","skyaw","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol SKYAW":"SKYAW is SkyAI, Inc.."}}},
{"id":"n-4a1e766d","guard":[["has","wing"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as WING":"WING is Wingstop Inc.."}}},
{"id":"n-4a3efddf","guard":[["has","wing"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Wingstop Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-4bd2c4c4","guard":[["has","ftha"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Forefront Tech Holdings Acquisition Corp."]},["sense.lastWord"]],"mem":null},
{"id":"n-4bd62ee6","guard":[["has","asth"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as ASTH":"ASTH is Astrana Health Inc.."}}},
{"id":"n-4c042929","guard":[["has","eosew"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol EOSEW":"EOSEW is Eos Energy Enterprises, Inc.."}}},
{"id":"n-4eb8c151","guard":[["has","xrxdw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as XRXDW":"XRXDW is Xerox Holdings Corporation."}}},
{"id":"n-4ebd6905","guard":[["hasAny",["company","crdo","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as CRDO":"CRDO is Credo Technology Group Holding Ltd."}}},
{"id":"n-5079184c","guard":[["has","jkhy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as JKHY":"JKHY is Jack Henry & Associates, Inc.."}}},
{"id":"n-50cb255a","guard":[["has","bpypn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as BPYPN":"BPYPN is Brookfield Property Partners L.P.."}}},
{"id":"n-53ed067e","guard":[["has","smcip"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Super Micro Computer, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-54caa73b","guard":[["has","noemw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is CO2 Energy Transition Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-552cd744","guard":[["has","kdp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as KDP":"KDP is Keurig Dr Pepper Inc.."}}},
{"id":"n-55f4a695","guard":[["has","tcrt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as TCRT":"TCRT is Alaunos Therapeutics, Inc.."}}},
{"id":"n-561c4a74","guard":[["hasAny",["company","has","nasdaq","symbol","til"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol TIL":"TIL is Instil Bio, Inc.."}}},
{"id":"n-5716a3fd","guard":[["hasAny",["company","name","nasdaq","onchw","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as ONCHW":"ONCHW is 1RT Acquisition Corp.."}}},
{"id":"n-57badbe1","guard":[["has","mgyr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Magyar Bancorp, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-58a73277","guard":[["has","senea"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seneca Foods Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-5a1d0839","guard":[["has","gcbc"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greene County Bancorp, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-5ab475d5","guard":[["has","stok"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as STOK":"STOK is Stoke Therapeutics, Inc.."}}},
{"id":"n-5acd6ec0","guard":[["has","tecx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol TECX":"TECX is Tectonic Therapeutic, Inc.."}}},
{"id":"n-5c032303","guard":[["has","cme"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol CME":"CME is CME Group Inc.."}}},
{"id":"n-5c6aa117","guard":[["hasAny",["company","kdp","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as KDP":"KDP is Keurig Dr Pepper Inc.."}}},
{"id":"n-5cf26ca6","guard":[["has","ionr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ioneer Ltd."]},["sense.lastWord"]],"mem":null},
{"id":"n-603823c3","guard":[["has","rmti"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rockwell Medical, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-60f70d17","guard":[["has","alovw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-6105cd5a","guard":[["has","cctg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is CCSC Technology International Holdings Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-613d11a5","guard":[["has","glsi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as GLSI":"GLSI is Greenwich LifeSciences, Inc.."}}},
{"id":"n-631946f7","guard":[["has","obx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Obsidian Therapeutics, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-6343cde2","guard":[["has","bpypn"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Brookfield Property Partners L.P.."]},["sense.lastWord"]],"mem":null},
{"id":"n-63791b4a","guard":[["has","ecbk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol ECBK":"ECBK is ECB Bancorp, Inc.."}}},
{"id":"n-63af73e5","guard":[["has","csq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol CSQ":"CSQ is Calamos Strategic Total Return Fund."}}},
{"id":"n-642cc168","guard":[["has","qqqx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["sense.lastWord"]],"mem":null},
{"id":"n-65afde58","guard":[["has","wsbco"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as WSBCO":"WSBCO is WesBanco, Inc.."}}},
{"id":"n-65be4318","guard":[["has","weys"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Weyco Group, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-662e2ef3","guard":[["has","ecbk"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ECB Bancorp, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-664f3f3a","guard":[["hasAny",["company","has","nasdaq","symbol","zbra"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol ZBRA":"ZBRA is Zebra Technologies Corporation."}}},
{"id":"n-679726cd","guard":[["hasAny",["company","has","nasdaq","symbol","tecx"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol TECX":"TECX is Tectonic Therapeutic, Inc.."}}},
{"id":"n-67982a7c","guard":[["has","kdp"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Keurig Dr Pepper Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-691ead06","guard":[["has","jcap"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jefferson Capital, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-69adcd65","guard":[["hasAny",["company","listed","vlosu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as VLOSU":"VLOSU is Velos Acquisition I Corp.."}}},
{"id":"n-6a02393c","guard":[["hasAny",["company","listed","lpbb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as LPBB":"LPBB is Launch Two Acquisition Corp.."}}},
{"id":"n-6b89cd32","guard":[["has","pepg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as PEPG":"PEPG is PepGen Inc.."}}},
{"id":"n-6cb0f8ef","guard":[["has","bpac"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as BPAC":"BPAC is Blueport Acquisition Ltd."}}},
{"id":"n-6d2c8441","guard":[["has","stak"]],"pyramid":["render.template",{"lit":[{"slot":0}," is STAK Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-6d36927b","guard":[["has","igac"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as IGAC":"IGAC is Invest Green Acquisition Corporation."}}},
{"id":"n-6d6ed5cb","guard":[["hasAny",["company","has","insg","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol INSG":"INSG is Inseego Corp.."}}},
{"id":"n-6e35c64a","guard":[["has","pdsb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PDSB":"PDSB is PDS Biotechnology Corporation."}}},
{"id":"n-6fe4aa3c","guard":[["hasAny",["company","glsi","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as GLSI":"GLSI is Greenwich LifeSciences, Inc.."}}},
{"id":"n-708b8e61","guard":[["hasAny",["company","ftha","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol FTHA":"FTHA is Forefront Tech Holdings Acquisition Corp."}}},
{"id":"n-715e788c","guard":[["hasAny",["company","name","nasdaq","thry","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as THRY":"THRY is Thryv Holdings, Inc.."}}},
{"id":"n-718e389e","guard":[["has","gaini"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gladstone Investment Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-7426f71e","guard":[["has","pkbk"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Parke Bancorp, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-742a046a","guard":[["has","swvlw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as SWVLW":"SWVLW is Swvl Holdings Corp."}}},
{"id":"n-746305fd","guard":[["has","iacq"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Irenic Acquisition Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-7475ddf8","guard":[["has","form"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as FORM":"FORM is FormFactor, Inc.."}}},
{"id":"n-748a2197","guard":[["hasAny",["company","cxiiu","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as CXIIU":"CXIIU is Churchill Capital Corp XII."}}},
{"id":"n-76e69ba5","guard":[["has","byfc"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Broadway Financial Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-773426e3","guard":[["hasAny",["company","has","nasdaq","pdsb","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PDSB":"PDSB is PDS Biotechnology Corporation."}}},
{"id":"n-779e04b0","guard":[["has","xrxdw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xerox Holdings Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-77b1125c","guard":[["has","arhs"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arhaus, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-791b9b6c","guard":[["hasAny",["asth","company","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as ASTH":"ASTH is Astrana Health Inc.."}}},
{"id":"n-79997558","guard":[["has","pre"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Prenetics Global Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-7a60b584","guard":[["has","asth"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Astrana Health Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-7b5d76ba","guard":[["hasAny",["company","jagx","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as JAGX":"JAGX is Jaguar Health, Inc.."}}},
{"id":"n-7bd290b0","guard":[["has","bzai"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blaize Holdings, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-7c31d32b","guard":[["has","cnxu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as CNXU":"CNXU is Conexeu Sciences Inc.."}}},
{"id":"n-7c5a7652","guard":[["has","nodk"]],"pyramid":["render.template",{"lit":[{"slot":0}," is NI Holdings, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-7ce41896","guard":[["has","igac"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Invest Green Acquisition Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-7d2f04f1","guard":[["hasAny",["company","has","nasdaq","obx","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol OBX":"OBX is Obsidian Therapeutics, Inc.."}}},
{"id":"n-7e0477e0","guard":[["has","vlosu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Velos Acquisition I Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-7faebde7","guard":[["hasAny",["company","ctrn","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as CTRN":"CTRN is Citi Trends, Inc.."}}},
{"id":"n-8030ec52","guard":[["has","sornu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol SORNU":"SORNU is Soren Acquisition Corp.."}}},
{"id":"n-8119992b","guard":[["has","bwin"]],"pyramid":["render.template",{"lit":[{"slot":0}," is The Baldwin Insurance Group, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-811bfa49","guard":[["has","ezra"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol EZRA":"EZRA is Reliance Global Group, Inc.."}}},
{"id":"n-8186f868","guard":[["has","plus"],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ePlus inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-82f9b073","guard":[["has","iacq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as IACQ":"IACQ is Irenic Acquisition Corp.."}}},
{"id":"n-835c1185","guard":[["hasAny",["cnxu","company","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as CNXU":"CNXU is Conexeu Sciences Inc.."}}},
{"id":"n-843c89a7","guard":[["hasAny",["company","has","nasdaq","rfaiu","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol RFAIU":"RFAIU is RF Acquisition Corp II."}}},
{"id":"n-86838ada","guard":[["has","eosew"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eos Energy Enterprises, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-890d50d7","guard":[["hasAny",["bpypn","company","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as BPYPN":"BPYPN is Brookfield Property Partners L.P.."}}},
{"id":"n-8a678954","guard":[["hasAny",["company","csq","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol CSQ":"CSQ is Calamos Strategic Total Return Fund."}}},
{"id":"n-8b0adc8d","guard":[["has","bwin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol BWIN":"BWIN is The Baldwin Insurance Group, Inc.."}}},
{"id":"n-8b5876bb","guard":[["has","mkdw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is MKDWELL Tech Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-8b5d0ddb","guard":[["has","gri"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol GRI":"GRI is GRI Bio, Inc.."}}},
{"id":"n-8ccbde3e","guard":[["hasAny",["company","ecbk","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol ECBK":"ECBK is ECB Bancorp, Inc.."}}},
{"id":"n-8f9eaddf","guard":[["has","tcom"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol TCOM":"TCOM is Trip.com Group Limited."}}},
{"id":"n-90c6ce59","guard":[["hasAny",["cctg","company","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol CCTG":"CCTG is CCSC Technology International Holdings Limited."}}},
{"id":"n-910d8135","guard":[["has","rfaiu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol RFAIU":"RFAIU is RF Acquisition Corp II."}}},
{"id":"n-91e0a741","guard":[["hasAny",["company","name","nasdaq","swvlw","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as SWVLW":"SWVLW is Swvl Holdings Corp."}}},
{"id":"n-9256346f","guard":[["hasAny",["bwin","company","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol BWIN":"BWIN is The Baldwin Insurance Group, Inc.."}}},
{"id":"n-92a71fee","guard":[["has","weys"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol WEYS":"WEYS is Weyco Group, Inc.."}}},
{"id":"n-92e8208e","guard":[["has","mkdw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol MKDW":"MKDW is MKDWELL Tech Inc.."}}},
{"id":"n-93028f13","guard":[["hasAny",["company","name","nasdaq","trading","wing"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as WING":"WING is Wingstop Inc.."}}},
{"id":"n-934e82ee","guard":[["has","tnonw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as TNONW":"TNONW is Tenon Medical, Inc.."}}},
{"id":"n-947095a7","guard":[["has","sornu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soren Acquisition Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-94e634ac","guard":[["has","pkbk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as PKBK":"PKBK is Parke Bancorp, Inc.."}}},
{"id":"n-958afc3e","guard":[["has","acglo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as ACGLO":"ACGLO is Arch Capital Group Ltd.."}}},
{"id":"n-963e4f40","guard":[["has","alovw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as ALOVW":"ALOVW is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."}}},
{"id":"n-96400cec","guard":[["has","vlosu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as VLOSU":"VLOSU is Velos Acquisition I Corp.."}}},
{"id":"n-968b5896","guard":[["has","tnonw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tenon Medical, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-970c054b","guard":[["hasAny",["company","listed","smcip"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as SMCIP":"SMCIP is Super Micro Computer, Inc.."}}},
{"id":"n-974c24df","guard":[["hasAny",["company","listed","pre"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as PRE":"PRE is Prenetics Global Limited."}}},
{"id":"n-99180075","guard":[["has","thh"]],"pyramid":["render.template",{"lit":[{"slot":0}," is TryHard Holdings Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-99505398","guard":[["hasAny",["company","dlhc","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as DLHC":"DLHC is DLH Holdings Corp.."}}},
{"id":"n-9950c33f","guard":[["has","insg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol INSG":"INSG is Inseego Corp.."}}},
{"id":"n-997b2714","guard":[["hasAny",["company","name","nasdaq","senea","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as SENEA":"SENEA is Seneca Foods Corp.."}}},
{"id":"n-9bacde7f","guard":[["has","noemw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as NOEMW":"NOEMW is CO2 Energy Transition Corp.."}}},
{"id":"n-9c74d654","guard":[["has","jcap"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as JCAP":"JCAP is Jefferson Capital, Inc.."}}},
{"id":"n-9f08efb2","guard":[["has","rmti"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as RMTI":"RMTI is Rockwell Medical, Inc.."}}},
{"id":"n-9f777c1c","guard":[["has","mrln"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Merlin, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-a16839b8","guard":[["hasAny",["company","listed","noemw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as NOEMW":"NOEMW is CO2 Energy Transition Corp.."}}},
{"id":"n-a1f0d39c","guard":[["has","ecpg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Encore Capital Group Inc."]},["sense.lastWord"]],"mem":null},
{"id":"n-a204ae0c","guard":[["has","aehl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Antelope Enterprise Holdings Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-a340d81b","guard":[["has","capr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as CAPR":"CAPR is Capricor Therapeutics, Inc.."}}},
{"id":"n-a3c1d388","guard":[["has","sols"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Solstice Advanced Materials Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-a44a6828","guard":[["hasAny",["company","name","nasdaq","plus","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as PLUS":"PLUS is ePlus inc.."}}},
{"id":"n-a5026823","guard":[["hasAny",["company","has","nasdaq","ptacw","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PTACW":"PTACW is Patriot Acquisition Corp.."}}},
{"id":"n-a55e3e9f","guard":[["has","srbk"]],"pyramid":["render.template",{"lit":[{"slot":0}," is SR Bancorp, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-a5643579","guard":[["has","nexr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol NEXR":"NEXR is Nexera Technologies Ltd."}}},
{"id":"n-a67dc5f8","guard":[["hasAny",["company","has","nasdaq","symbol","tcom"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol TCOM":"TCOM is Trip.com Group Limited."}}},
{"id":"n-a6e2370f","guard":[["has","rbcaa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol RBCAA":"RBCAA is Republic Bancorp, Inc.."}}},
{"id":"n-a77a5b48","guard":[["has","amlx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol AMLX":"AMLX is Amylyx Pharmaceuticals, Inc.."}}},
{"id":"n-aa18cdb6","guard":[["hasAny",["company","has","nasdaq","ptac","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PTAC":"PTAC is Patriot Acquisition Corp.."}}},
{"id":"n-aab09838","guard":[["hasAny",["company","name","nasdaq","ngen","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as NGEN":"NGEN is NervGen Pharma Corp.."}}},
{"id":"n-ad9d1ac1","guard":[["has","swkhl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is SWK Holdings Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-adfc712f","guard":[["has","tnmg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol TNMG":"TNMG is TNL Mediagene."}}},
{"id":"n-ae9fc13e","guard":[["has","lpbb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as LPBB":"LPBB is Launch Two Acquisition Corp.."}}},
{"id":"n-aee07258","guard":[["has","ftha"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol FTHA":"FTHA is Forefront Tech Holdings Acquisition Corp."}}},
{"id":"n-af2af371","guard":[["hasAny",["aehl","company","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as AEHL":"AEHL is Antelope Enterprise Holdings Limited."}}},
{"id":"n-af37370f","guard":[["has","srzn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as SRZN":"SRZN is Surrozen, Inc.."}}},
{"id":"n-b00c27af","guard":[["has","thry"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as THRY":"THRY is Thryv Holdings, Inc.."}}},
{"id":"n-b1df5ab3","guard":[["has","crdo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Credo Technology Group Holding Ltd."]},["sense.lastWord"]],"mem":null},
{"id":"n-b24b2393","guard":[["has","mdrr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Medalist Diversified, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-b4521b09","guard":[["hasAny",["company","name","nasdaq","thh","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as THH":"THH is TryHard Holdings Limited."}}},
{"id":"n-b65f2931","guard":[["hasAny",["company","mcft","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as MCFT":"MCFT is MasterCraft Boat Holdings, Inc.."}}},
{"id":"n-b82a5f7a","guard":[["hasAny",["company","listed","wsbco"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as WSBCO":"WSBCO is WesBanco, Inc.."}}},
{"id":"n-b8c6788c","guard":[["has","arcl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ARC Group Acquisition I Corp."]},["sense.lastWord"]],"mem":null},
{"id":"n-b910e5bb","guard":[["has","cnxu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Conexeu Sciences Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-b91d736c","guard":[["has","jagx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jaguar Health, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-ba74a25f","guard":[["has","ezra"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reliance Global Group, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-ba7f6d31","guard":[["hasAny",["company","listed","tnonw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as TNONW":"TNONW is Tenon Medical, Inc.."}}},
{"id":"n-ba95b998","guard":[["has","arcl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol ARCL":"ARCL is ARC Group Acquisition I Corp."}}},
{"id":"n-bb94a383","guard":[["hasAny",["company","has","nasdaq","symbol","tnmg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol TNMG":"TNMG is TNL Mediagene."}}},
{"id":"n-bf0e4d6b","guard":[["hasAny",["company","name","nasdaq","trading","xrxdw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as XRXDW":"XRXDW is Xerox Holdings Corporation."}}},
{"id":"n-c049ab25","guard":[["has","bmhl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bluemount Holdings Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-c1e0c386","guard":[["has","arhs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as ARHS":"ARHS is Arhaus, Inc.."}}},
{"id":"n-c2df0d5d","guard":[["has","capr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Capricor Therapeutics, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-c2fd0a9e","guard":[["has","bpac"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blueport Acquisition Ltd."]},["sense.lastWord"]],"mem":null},
{"id":"n-c60ab7fb","guard":[["has","bzai"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as BZAI":"BZAI is Blaize Holdings, Inc.."}}},
{"id":"n-c6536d0d","guard":[["has","cme"]],"pyramid":["render.template",{"lit":[{"slot":0}," is CME Group Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-c6d652cc","guard":[["has","zbra"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zebra Technologies Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-c6e31616","guard":[["has","jkhy"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jack Henry & Associates, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-c6e4e29b","guard":[["hasAny",["company","ionr","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as IONR":"IONR is ioneer Ltd."}}},
{"id":"n-c79dd675","guard":[["hasAny",["company","gri","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol GRI":"GRI is GRI Bio, Inc.."}}},
{"id":"n-ca0e27d4","guard":[["has","insg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Inseego Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-ca1645bd","guard":[["has","nexr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nexera Technologies Ltd."]},["sense.lastWord"]],"mem":null},
{"id":"n-cc4cb952","guard":[["has","fip"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FTAI Infrastructure Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-cd1ce971","guard":[["hasAny",["cme","company","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol CME":"CME is CME Group Inc.."}}},
{"id":"n-cd4af155","guard":[["hasAny",["company","listed","qqqx"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as QQQX":"QQQX is Nuveen NASDAQ 100 Dynamic Overwrite Fund."}}},
{"id":"n-cf0f9435","guard":[["hasAny",["capr","company","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as CAPR":"CAPR is Capricor Therapeutics, Inc.."}}},
{"id":"n-cfb5175e","guard":[["has","ngen"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as NGEN":"NGEN is NervGen Pharma Corp.."}}},
{"id":"n-d1fba728","guard":[["has","onchw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as ONCHW":"ONCHW is 1RT Acquisition Corp.."}}},
{"id":"n-d2268dee","guard":[["has","stok"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stoke Therapeutics, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-d368ed23","guard":[["has","swvlw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Swvl Holdings Corp."]},["sense.lastWord"]],"mem":null},
{"id":"n-d3fe1d0a","guard":[["has","gcbc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as GCBC":"GCBC is Greene County Bancorp, Inc.."}}},
{"id":"n-d50a81d3","guard":[["hasAny",["bzai","company","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as BZAI":"BZAI is Blaize Holdings, Inc.."}}},
{"id":"n-d546e477","guard":[["has","ptac"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PTAC":"PTAC is Patriot Acquisition Corp.."}}},
{"id":"n-d713f194","guard":[["hasAny",["company","igac","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as IGAC":"IGAC is Invest Green Acquisition Corporation."}}},
{"id":"n-d86a2105","guard":[["has","lpbb"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Launch Two Acquisition Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-d9cd6652","guard":[["has","sols"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol SOLS":"SOLS is Solstice Advanced Materials Inc.."}}},
{"id":"n-da351619","guard":[["has","fip"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as FIP":"FIP is FTAI Infrastructure Inc.."}}},
{"id":"n-dab7f5ff","guard":[["hasAny",["company","gcbc","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as GCBC":"GCBC is Greene County Bancorp, Inc.."}}},
{"id":"n-db00415e","guard":[["has","rfaiu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is RF Acquisition Corp II."]},["sense.lastWord"]],"mem":null},
{"id":"n-dbfcda8c","guard":[["hasAny",["company","listed","mrln"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as MRLN":"MRLN is Merlin, Inc.."}}},
{"id":"n-dccc4b88","guard":[["has","gri"]],"pyramid":["render.template",{"lit":[{"slot":0}," is GRI Bio, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-ddcdbe29","guard":[["has","oriqu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Origin Investment Corp I."]},["sense.lastWord"]],"mem":null},
{"id":"n-df81a4f2","guard":[["hasAny",["company","has","nasdaq","sols","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol SOLS":"SOLS is Solstice Advanced Materials Inc.."}}},
{"id":"n-e162539f","guard":[["has","tanh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as TANH":"TANH is Tantech Holdings Ltd.."}}},
{"id":"n-e1fc62f4","guard":[["has","ionr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as IONR":"IONR is ioneer Ltd."}}},
{"id":"n-e1fec6fe","guard":[["has","srzn"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Surrozen, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-e2956958","guard":[["hasAny",["company","ffbc","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as FFBC":"FFBC is First Financial Bancorp.."}}},
{"id":"n-e380f1fa","guard":[["hasAny",["company","name","nasdaq","srzn","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as SRZN":"SRZN is Surrozen, Inc.."}}},
{"id":"n-e534f83a","guard":[["hasAny",["company","listed","rmti"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as RMTI":"RMTI is Rockwell Medical, Inc.."}}},
{"id":"n-e56fba2f","guard":[["has","cxiiu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as CXIIU":"CXIIU is Churchill Capital Corp XII."}}},
{"id":"n-e5f427ee","guard":[["has","ecpg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as ECPG":"ECPG is Encore Capital Group Inc."}}},
{"id":"n-e691676b","guard":[["hasAny",["company","has","nasdaq","regcp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol REGCP":"REGCP is Regency Centers Corporation."}}},
{"id":"n-e7122479","guard":[["hasAny",["byfc","company","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol BYFC":"BYFC is Broadway Financial Corporation."}}},
{"id":"n-e7655e0e","guard":[["hasAny",["company","has","nasdaq","symbol","vivk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol VIVK":"VIVK is Vivakor, Inc.."}}},
{"id":"n-ea96bbcf","guard":[["hasAny",["company","listed","pepg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as PEPG":"PEPG is PepGen Inc.."}}},
{"id":"n-ecb97dbf","guard":[["hasAny",["bmhl","company","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as BMHL":"BMHL is Bluemount Holdings Limited."}}},
{"id":"n-ecc22363","guard":[["has","glsi"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greenwich LifeSciences, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-ed1e61bd","guard":[["hasAny",["company","iacq","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as IACQ":"IACQ is Irenic Acquisition Corp.."}}},
{"id":"n-ed93dd74","guard":[["has","mcft"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as MCFT":"MCFT is MasterCraft Boat Holdings, Inc.."}}},
{"id":"n-ef9846bc","guard":[["has","skyaw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is SkyAI, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-f048c171","guard":[["has","zbra"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol ZBRA":"ZBRA is Zebra Technologies Corporation."}}},
{"id":"n-f4eebd8e","guard":[["has","pepg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is PepGen Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-f4f39c7b","guard":[["hasAny",["company","name","nasdaq","nodk","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as NODK":"NODK is NI Holdings, Inc.."}}},
{"id":"n-f70b71db","guard":[["has","vivk"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Vivakor, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-f80fb27e","guard":[["has","srbk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as SRBK":"SRBK is SR Bancorp, Inc.."}}},
{"id":"n-f8916205","guard":[["has","onchw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is 1RT Acquisition Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-f92cf38c","guard":[["has","til"],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Instil Bio, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-f939c5ca","guard":[["has","mrln"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as MRLN":"MRLN is Merlin, Inc.."}}},
{"id":"n-f98e6dc3","guard":[["has","tacow"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as TACOW":"TACOW is Berto Acquisition Corp.."}}},
{"id":"n-f9c1dc22","guard":[["has","smcip"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as SMCIP":"SMCIP is Super Micro Computer, Inc.."}}},
{"id":"n-f9fdd43c","guard":[["has","brkrp"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bruker Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-ff6be436","guard":[["has","blzru"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trailblazer Acquisition Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-00053fa0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","wsbco"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is WesBanco, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-000735fe","guard":[["hasAny",["lower case","lowercase","small letters","til"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Instil Bio, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0058b31e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tcrt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Alaunos Therapeutics, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-00a3ae6b","guard":[["hasAny",["lower case","lowercase","pdsb","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PDS Biotechnology Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-02585bd3","guard":[["has","gri"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-02e7f52e","guard":[["hasAny",["bmhl","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bluemount Holdings Limited."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-037315a7","guard":[["hasAny",["ecpg","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Encore Capital Group Inc."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-03cecaad","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","zbra"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zebra Technologies Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-043d7cec","guard":[["hasAny",["kdp","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Keurig Dr Pepper Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-047f6b86","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pkbk","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Parke Bancorp, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-04897fa9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mcft","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MasterCraft Boat Holdings, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-056bb023","guard":[["hasAny",["lower case","lowercase","small letters","thry"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Thryv Holdings, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0752921a","guard":[["hasAny",["arcl","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ARC Group Acquisition I Corp."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-09ff2373","guard":[["hasAny",["capr","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Capricor Therapeutics, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0b9ba94a","guard":[["hasAny",["dlhc","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is DLH Holdings Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0c0109a6","guard":[["hasAny",["lower case","lowercase","skyaw","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SkyAI, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0d2f7396","guard":[["hasAny",["pepg","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PepGen Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0e1ab976","guard":[["hasAny",["nktr","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nektar Therapeutics."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-0e2841dc","guard":[["hasAny",["form","shortest","shortest one","shortest word"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FormFactor, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0eabb440","guard":[["hasAny",["noemw","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CO2 Energy Transition Corp.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0f8bc679","guard":[["hasAny",["shortest","shortest one","shortest word","tnonw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tenon Medical, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-100e7c0a","guard":[["hasAny",["capr","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Capricor Therapeutics, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-105760b5","guard":[["hasAny",["lower case","lowercase","obx","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Obsidian Therapeutics, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1150b31e","guard":[["hasAny",["ffbc","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is First Financial Bancorp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1183bb12","guard":[["hasAny",["alovw","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1194fb57","guard":[["hasAny",["acglo","alphabetize the letters","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arch Capital Group Ltd.."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-11be6e46","guard":[["hasAny",["alovw","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1265e201","guard":[["hasAny",["ezra","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reliance Global Group, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-144019c7","guard":[["hasAny",["acglo","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arch Capital Group Ltd.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-15592661","guard":[["hasAny",["ecpg","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Encore Capital Group Inc."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-157df8b0","guard":[["hasAny",["aehl","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Antelope Enterprise Holdings Limited."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1610b2c5","guard":[["has","cme"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-17d6cb42","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ctrn","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Citi Trends, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-19054cd6","guard":[["hasAny",["lower case","lowercase","pepg","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PepGen Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1987bf85","guard":[["hasAny",["lower case","lowercase","mgyr","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Magyar Bancorp, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-19bcd9ae","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tcom","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trip.com Group Limited."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1a8f649b","guard":[["hasAny",["ecbk","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ECB Bancorp, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1ad042eb","guard":[["hasAny",["no vowels","remove vowels","srzn","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Surrozen, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-1b3ebdb1","guard":[["hasAny",["blzru","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trailblazer Acquisition Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1edf8b38","guard":[["hasAny",["pkbk","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Parke Bancorp, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1fff0e0d","guard":[["hasAny",["asth","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Astrana Health Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2041dbe3","guard":[["hasAny",["nktr","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nektar Therapeutics."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-21ab3aa4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","csq","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Calamos Strategic Total Return Fund."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-22e91085","guard":[["hasAny",["rmti","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rockwell Medical, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-23ae88a6","guard":[["hasAny",["byfc","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Broadway Financial Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-24d95be8","guard":[["hasAny",["lower case","lowercase","small letters","tacow"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berto Acquisition Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2786e511","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","wing"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Wingstop Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-280028cd","guard":[["hasAny",["lower case","lowercase","small letters","vivk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Vivakor, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2b705054","guard":[["hasAny",["lower case","lowercase","mrln","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Merlin, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2bd9c40d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pre","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Prenetics Global Limited."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2c668d99","guard":[["hasAny",["bpypn","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Brookfield Property Partners L.P.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2ca3f450","guard":[["hasAny",["pre","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Prenetics Global Limited."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2cee3290","guard":[["hasAny",["bwin","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is The Baldwin Insurance Group, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2e68673e","guard":[["hasAny",["lower case","lowercase","regcp","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Regency Centers Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-301778e9","guard":[["hasAny",["bwin","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is The Baldwin Insurance Group, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-303ba55b","guard":[["hasAny",["alovw","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3146318c","guard":[["hasAny",["lower case","lowercase","pre","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Prenetics Global Limited."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-31c8647b","guard":[["hasAny",["csq","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Calamos Strategic Total Return Fund."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-33511b04","guard":[["hasAny",["jkhy","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jack Henry & Associates, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-33e3db66","guard":[["hasAny",["brkrp","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bruker Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-34b20024","guard":[["hasAny",["capitalise","capitalize","capitalize each word","swvlw","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Swvl Holdings Corp."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-352354b3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ezra","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reliance Global Group, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-356c5cbb","guard":[["hasAny",["lower case","lowercase","small letters","smcip"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Super Micro Computer, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-35c9524f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","rmti","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rockwell Medical, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-36734751","guard":[["hasAny",["alphabetize the letters","letters in order","qqqx","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-36b776c4","guard":[["hasAny",["bpac","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blueport Acquisition Ltd."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-399b86a9","guard":[["hasAny",["aehl","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Antelope Enterprise Holdings Limited."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3ae8a264","guard":[["hasAny",["lower case","lowercase","pkbk","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Parke Bancorp, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3ded66f8","guard":[["hasAny",["asth","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Astrana Health Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3ec9d9f2","guard":[["hasAny",["jkhy","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jack Henry & Associates, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3fca5c6b","guard":[["hasAny",["ctrn","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Citi Trends, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-40bfa3a4","guard":[["hasAny",["mcft","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MasterCraft Boat Holdings, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-4126c6cd","guard":[["hasAny",["jagx","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jaguar Health, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-423155b5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cnxu","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Conexeu Sciences Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4297df50","guard":[["hasAny",["glsi","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greenwich LifeSciences, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-435923da","guard":[["hasAny",["bmhl","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bluemount Holdings Limited."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4481defc","guard":[["hasAny",["lower case","lowercase","nodk","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NI Holdings, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4636ddad","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mkdw","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MKDWELL Tech Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-47732349","guard":[["hasAny",["lower case","lowercase","small letters","zbra"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zebra Technologies Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-47d78429","guard":[["hasAny",["mkdw","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MKDWELL Tech Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-4850e2f1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","thh","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TryHard Holdings Limited."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4ad70731","guard":[["hasAny",["mrln","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Merlin, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4b3724d2","guard":[["hasAny",["no vowels","remove vowels","thh","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TryHard Holdings Limited."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-4b511c33","guard":[["hasAny",["arhs","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arhaus, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4bfe53f0","guard":[["hasAny",["lower case","lowercase","small letters","swkhl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SWK Holdings Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4f147a5c","guard":[["hasAny",["crdo","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Credo Technology Group Holding Ltd."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4fd7cba6","guard":[["hasAny",["lower case","lowercase","rmti","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rockwell Medical, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-50091c91","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jagx","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jaguar Health, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-50ed71fb","guard":[["hasAny",["bpypn","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Brookfield Property Partners L.P.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-535f193b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","capr","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Capricor Therapeutics, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-538b0ba6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","stok","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stoke Therapeutics, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-54200dfc","guard":[["hasAny",["lower case","lowercase","small letters","tecx"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tectonic Therapeutic, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-58145021","guard":[["hasAny",["arhs","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arhaus, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-591ee83f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jkhy","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jack Henry & Associates, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5b959f29","guard":[["hasAny",["csq","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Calamos Strategic Total Return Fund."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-5c37554b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tnmg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TNL Mediagene."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5d7c525f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","eosew","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eos Energy Enterprises, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5dbb6c44","guard":[["hasAny",["gri","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["GRI is ",{"slot":0}," Bio, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5e413262","guard":[["hasAny",["lower case","lowercase","small letters","tnonw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tenon Medical, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5f0407f2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ionr","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ioneer Ltd."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5f1eadb3","guard":[["hasAny",["lower case","lowercase","small letters","weys"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Weyco Group, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5fe21e26","guard":[["hasAny",["capitalise","capitalize","capitalize each word","swkhl","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SWK Holdings Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6033b972","guard":[["hasAny",["capitalise","capitalize","capitalize each word","onchw","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is 1RT Acquisition Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6045f604","guard":[["hasAny",["lower case","lowercase","pdyn","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Palladyne AI Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-60644098","guard":[["hasAny",["lower case","lowercase","nexr","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nexera Technologies Ltd."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6175df6b","guard":[["hasAny",["lower case","lowercase","small letters","tcrt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Alaunos Therapeutics, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-61b9e149","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pepg","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PepGen Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-62375649","guard":[["hasAny",["gaini","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gladstone Investment Corporation."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-637f2d37","guard":[["hasAny",["no vowels","remove vowels","without vowels","xrxdw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xerox Holdings Corporation."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-638165a9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","regcp","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Regency Centers Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-63c9b717","guard":[["hasAny",["insg","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Inseego Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-659c030c","guard":[["hasAny",["amlx","capitalise","capitalize","capitalize each word","title case"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Amylyx Pharmaceuticals, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-65c90adc","guard":[["hasAny",["no vowels","pdyn","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Palladyne AI Corp.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-671097ed","guard":[["hasAny",["blzru","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trailblazer Acquisition Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-67374543","guard":[["hasAny",["lower case","lowercase","ngen","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NervGen Pharma Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-67b59291","guard":[["hasAny",["capitalise","capitalize","capitalize each word","skyaw","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SkyAI, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-688b0cd4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sornu","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soren Acquisition Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-69e8f4c7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","oriqu","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Origin Investment Corp I."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6b613046","guard":[["hasAny",["lower case","lowercase","mcft","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MasterCraft Boat Holdings, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6b7a3e01","guard":[["hasAny",["qqqx","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6e1f4fe4","guard":[["hasAny",["mdrr","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Medalist Diversified, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6e79741e","guard":[["hasAny",["arcl","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ARC Group Acquisition I Corp."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-706f5401","guard":[["hasAny",["lower case","lowercase","small letters","vlosu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Velos Acquisition I Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-71f1118e","guard":[["hasAny",["cnxu","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Conexeu Sciences Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7203e17a","guard":[["hasAny",["cme","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["CME is ",{"slot":0}," Group Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-729f571b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","noemw","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CO2 Energy Transition Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-72f21a9a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","codx","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Co-Diagnostics, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-73169dc9","guard":[["hasAny",["lower case","lowercase","small letters","sornu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soren Acquisition Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-735a7114","guard":[["hasAny",["lower case","lowercase","small letters","tnmg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TNL Mediagene."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-75c71ced","guard":[["hasAny",["capitalise","capitalize","capitalize each word","qqqx","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-78453c45","guard":[["hasAny",["lower case","lowercase","small letters","tanh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tantech Holdings Ltd.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7913bc17","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cctg","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CCSC Technology International Holdings Limited."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7949752c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","crdo","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Credo Technology Group Holding Ltd."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-79e02294","guard":[["hasAny",["capitalise","capitalize","capitalize each word","igac","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Invest Green Acquisition Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7aaca235","guard":[["hasAny",["alphabetize the letters","fip","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is FTAI Infrastructure Inc.."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-7b1d150c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","vlosu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Velos Acquisition I Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7b5850fb","guard":[["hasAny",["cctg","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CCSC Technology International Holdings Limited."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7b8cc11c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jcap","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jefferson Capital, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7cc1d605","guard":[["hasAny",["bpypn","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Brookfield Property Partners L.P.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-7d299fe8","guard":[["hasAny",["iacq","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Irenic Acquisition Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7ed3237e","guard":[["hasAny",["lpbb","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Launch Two Acquisition Corp.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7fe5815c","guard":[["hasAny",["lower case","lowercase","plus","small letters"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ePlus inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7fec57b0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","iacq","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Irenic Acquisition Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-81610cd4","guard":[["hasAny",["no vowels","remove vowels","thry","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Thryv Holdings, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-81bfee3c","guard":[["hasAny",["lower case","lowercase","small letters","swvlw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Swvl Holdings Corp."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-820743a2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dlhc","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is DLH Holdings Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8269721a","guard":[["hasAny",["lower case","lowercase","noemw","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CO2 Energy Transition Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-82e740ee","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sols","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Solstice Advanced Materials Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-838fe5f8","guard":[["hasAny",["codx","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Co-Diagnostics, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-83ea27d1","guard":[["hasAny",["kdp","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Keurig Dr Pepper Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-84d83d4a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mrln","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Merlin, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-85289eec","guard":[["hasAny",["bzai","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blaize Holdings, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-85cdcf67","guard":[["hasAny",["lower case","lowercase","onchw","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is 1RT Acquisition Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-86bf5473","guard":[["hasAny",["capitalise","capitalize","capitalize each word","rbcaa","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Republic Bancorp, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-88420259","guard":[["hasAny",["lower case","lowercase","small letters","stak"]]],"pyramid":["render.template",{"lit":["STAK is ",{"slot":0}," Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8945e93d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","srbk","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SR Bancorp, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8a1951be","guard":[["hasAny",["shortest","shortest one","shortest word","smcip"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Super Micro Computer, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8a25a8a7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","xrxdw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xerox Holdings Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8c50d118","guard":[["hasAny",["jkhy","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jack Henry & Associates, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8c847b94","guard":[["hasAny",["shortest","shortest one","shortest word","thh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TryHard Holdings Limited."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8d8d9311","guard":[["hasAny",["no vowels","remove vowels","swkhl","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SWK Holdings Corporation."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-8dc3f989","guard":[["hasAny",["capitalise","capitalize","capitalize each word","plus","title case"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ePlus inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8e35a3da","guard":[["hasAny",["lower case","lowercase","mkdw","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MKDWELL Tech Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8f1730ac","guard":[["hasAny",["fip","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is FTAI Infrastructure Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8fb83e5a","guard":[["hasAny",["shortest","shortest one","shortest word","wsbco"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is WesBanco, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8fec774d","guard":[["hasAny",["no vowels","remove vowels","tnmg","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TNL Mediagene."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-91056d16","guard":[["hasAny",["brkrp","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bruker Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-938ea2cc","guard":[["hasAny",["lpbb","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Launch Two Acquisition Corp.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-96ad092a","guard":[["hasAny",["lower case","lowercase","small letters","xrxdw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xerox Holdings Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-96d8f658","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ngen","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NervGen Pharma Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-98b06cc9","guard":[["has","stak"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-99c7134b","guard":[["hasAny",["cctg","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CCSC Technology International Holdings Limited."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-9a34ff2c","guard":[["hasAny",["ctrn","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Citi Trends, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-9cfa7adb","guard":[["hasAny",["crdo","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Credo Technology Group Holding Ltd."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9dcc7d3e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","form","title case"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FormFactor, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a0b0ef35","guard":[["hasAny",["capitalise","capitalize","capitalize each word","obx","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Obsidian Therapeutics, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a34e7b56","guard":[["hasAny",["acglo","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arch Capital Group Ltd.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a5ad3a0e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pdsb","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PDS Biotechnology Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a77776a9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pdyn","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Palladyne AI Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a7a2ed17","guard":[["hasAny",["lower case","lowercase","small letters","srbk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SR Bancorp, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a87f6d55","guard":[["hasAny",["fip","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is FTAI Infrastructure Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a8db531c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ffbc","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is First Financial Bancorp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-aad12c6f","guard":[["hasAny",["amlx","lower case","lowercase","small letters"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Amylyx Pharmaceuticals, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-acf26ac4","guard":[["hasAny",["mrln","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Merlin, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-ad006aee","guard":[["hasAny",["igac","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Invest Green Acquisition Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-adeffeaf","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tecx","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tectonic Therapeutic, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ae750005","guard":[["hasAny",["capitalise","capitalize","capitalize each word","srzn","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Surrozen, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-aec399e6","guard":[["hasAny",["aehl","alphabetize the letters","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Antelope Enterprise Holdings Limited."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-b1471487","guard":[["hasAny",["no vowels","remove vowels","swvlw","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Swvl Holdings Corp."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-b3e625ae","guard":[["hasAny",["jagx","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jaguar Health, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b3e9c16f","guard":[["hasAny",["mgyr","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Magyar Bancorp, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-b4c21830","guard":[["hasAny",["no vowels","pkbk","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Parke Bancorp, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-b77884b4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mgyr","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Magyar Bancorp, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b787ccfa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gcbc","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greene County Bancorp, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b84818aa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tnonw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tenon Medical, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b8e6a13b","guard":[["hasAny",["lower case","lowercase","nktr","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nektar Therapeutics."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-bab1e3b3","guard":[["hasAny",["ffbc","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is First Financial Bancorp.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-bcd3afad","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tacow","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berto Acquisition Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bffccf5f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","senea","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seneca Foods Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c2196c4d","guard":[["hasAny",["igac","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Invest Green Acquisition Corporation."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c2b0f9a5","guard":[["hasAny",["lower case","lowercase","small letters","srzn"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Surrozen, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c3cab84a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nktr","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nektar Therapeutics."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c597e406","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","weys"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Weyco Group, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c6aaa1fb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fip","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is FTAI Infrastructure Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c8d9636b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nexr","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nexera Technologies Ltd."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c993719e","guard":[["hasAny",["cnxu","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Conexeu Sciences Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ca731b93","guard":[["hasAny",["brkrp","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bruker Corporation."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-cc8009e2","guard":[["hasAny",["shortest","shortest one","shortest word","vlosu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Velos Acquisition I Corp.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ccc22ccb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ecpg","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Encore Capital Group Inc."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ccdb7257","guard":[["hasAny",["lower case","lowercase","small letters","wing"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Wingstop Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cd880817","guard":[["hasAny",["dlhc","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is DLH Holdings Corp.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-cdd2cca8","guard":[["hasAny",["lower case","lowercase","qqqx","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cec38866","guard":[["hasAny",["lower case","lowercase","small letters","tcom"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trip.com Group Limited."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cec58666","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nodk","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NI Holdings, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cf105bef","guard":[["hasAny",["arhs","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arhaus, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cf9f223b","guard":[["hasAny",["no vowels","remove vowels","tcrt","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Alaunos Therapeutics, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-d050d43e","guard":[["hasAny",["bpypn","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Brookfield Property Partners L.P.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d192e87e","guard":[["hasAny",["ionr","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ioneer Ltd."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d1c35e3a","guard":[["hasAny",["gcbc","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greene County Bancorp, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d28a58ec","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ecbk","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ECB Bancorp, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d2c2cf0f","guard":[["hasAny",["lower case","lowercase","senea","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seneca Foods Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d329b36d","guard":[["hasAny",["lower case","lowercase","small letters","wsbco"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is WesBanco, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d34fc43c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mdrr","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Medalist Diversified, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d3c14a7e","guard":[["hasAny",["no vowels","remove vowels","srbk","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SR Bancorp, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-d4455332","guard":[["hasAny",["glsi","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greenwich LifeSciences, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d53e6266","guard":[["hasAny",["byfc","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Broadway Financial Corporation."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-d5efed21","guard":[["hasAny",["lower case","lowercase","rbcaa","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Republic Bancorp, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d5fe9980","guard":[["hasAny",["bzai","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blaize Holdings, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d77bfe3b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","vivk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Vivakor, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-da9210e9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gaini","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gladstone Investment Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-db4bf171","guard":[["hasAny",["ftha","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Forefront Tech Holdings Acquisition Corp."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-dbe60ea5","guard":[["hasAny",["bzai","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blaize Holdings, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-dc8b620e","guard":[["hasAny",["no vowels","pdsb","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PDS Biotechnology Corporation."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-dca1d2a0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tanh","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tantech Holdings Ltd.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e15dd34f","guard":[["hasAny",["gcbc","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greene County Bancorp, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e1629758","guard":[["hasAny",["kdp","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Keurig Dr Pepper Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e25170d6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cxiiu","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Churchill Capital Corp XII."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e3536756","guard":[["hasAny",["capitalise","capitalize","capitalize each word","glsi","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greenwich LifeSciences, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e3886204","guard":[["hasAny",["cxiiu","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Churchill Capital Corp XII."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e5406697","guard":[["hasAny",["lower case","lowercase","small letters","sols"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Solstice Advanced Materials Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e85d04ce","guard":[["hasAny",["shortest","shortest one","shortest word","tacow"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berto Acquisition Corp.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e937fbbe","guard":[["hasAny",["codx","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Co-Diagnostics, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e9de00e2","guard":[["hasAny",["lower case","lowercase","mdrr","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Medalist Diversified, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ea4dcf93","guard":[["hasAny",["bmhl","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bluemount Holdings Limited."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ebae9a1a","guard":[["hasAny",["lower case","lowercase","lpbb","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Launch Two Acquisition Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ebf4acf6","guard":[["hasAny",["lower case","lowercase","small letters","stok"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stoke Therapeutics, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ede9a522","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lpbb","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Launch Two Acquisition Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f02701cb","guard":[["hasAny",["gaini","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gladstone Investment Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f0fac54b","guard":[["hasAny",["lower case","lowercase","oriqu","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Origin Investment Corp I."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f2b16408","guard":[["hasAny",["mdrr","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Medalist Diversified, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-f56c8b5b","guard":[["hasAny",["jcap","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jefferson Capital, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f5ab6b3e","guard":[["hasAny",["form","lower case","lowercase","small letters"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FormFactor, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f64dd2fa","guard":[["hasAny",["no vowels","remove vowels","rfaiu","without vowels"]]],"pyramid":["render.template",{"lit":["RFAIU is ",{"slot":0}," Acquisition Corp II."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-f6a0a342","guard":[["hasAny",["byfc","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Broadway Financial Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f79638cc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","thry","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Thryv Holdings, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f7f7fd0a","guard":[["hasAny",["alovw","alphabetize the letters","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-f9499f2b","guard":[["hasAny",["eosew","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eos Energy Enterprises, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f95bdd05","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kdp","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Keurig Dr Pepper Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f9a62323","guard":[["hasAny",["bpac","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blueport Acquisition Ltd."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fa2cbfd4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","til","title case"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Instil Bio, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fc6d4019","guard":[["hasAny",["acglo","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arch Capital Group Ltd.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fc830bf5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","insg","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Inseego Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fce99c48","guard":[["hasAny",["gcbc","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greene County Bancorp, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-fd5f490e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ftha","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Forefront Tech Holdings Acquisition Corp."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fe124d08","guard":[["hasAny",["lower case","lowercase","small letters","thh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TryHard Holdings Limited."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-feb1112b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","smcip","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Super Micro Computer, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fffc95f2","guard":[["hasAny",["no vowels","qqqx","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-00772cde","guard":[["hasAny",["bmhl","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bluemount Holdings Limited."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-00c958cf","guard":[["hasAny",["each word","split into words","til"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Instil Bio, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-00f7735e","guard":[["hasAny",["cctg","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CCSC Technology International Holdings Limited."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-012d650d","guard":[["hasAny",["each word","jagx","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jaguar Health, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-01c486aa","guard":[["hasAny",["ctrn","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Citi Trends, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-02aa1d9a","guard":[["hasAny",["asth","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Astrana Health Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-02ff0ce3","guard":[["hasAny",["each word","mgyr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Magyar Bancorp, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-041ae4ea","guard":[["hasAny",["arhs","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arhaus, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-041f172d","guard":[["hasAny",["item number","nth","onchw","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is 1RT Acquisition Corp.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-059a9cc4","guard":[["hasAny",["item number","mdrr","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Medalist Diversified, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-05f3630c","guard":[["hasAny",["item number","mgyr","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Magyar Bancorp, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-063957eb","guard":[["hasAny",["dlhc","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is DLH Holdings Corp.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-06e23c83","guard":[["hasAny",["item number","nth","position","vivk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Vivakor, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-08ff0137","guard":[["hasAny",["each word","split into words","til"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Instil Bio, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0b51c2d6","guard":[["hasAny",["each word","split into words","srzn"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Surrozen, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0b8dfe16","guard":[["hasAny",["each word","plus","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ePlus inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0ce5e1ba","guard":[["hasAny",["each word","onchw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is 1RT Acquisition Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0e473751","guard":[["hasAny",["item number","mrln","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Merlin, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0fa05ea0","guard":[["hasAny",["item number","nth","position","thry"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Thryv Holdings, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-1136b10b","guard":[["hasAny",["capr","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Capricor Therapeutics, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1208faa6","guard":[["hasAny",["glsi","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greenwich LifeSciences, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-124838d9","guard":[["hasAny",["ezra","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reliance Global Group, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-131c93e3","guard":[["hasAny",["item number","nth","position","skyaw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SkyAI, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-138363da","guard":[["hasAny",["each word","jcap","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jefferson Capital, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-147c17f4","guard":[["hasAny",["each word","smcip","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Super Micro Computer, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-157ffffb","guard":[["hasAny",["item number","nth","position","swvlw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Swvl Holdings Corp."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-15e4d183","guard":[["hasAny",["each word","ionr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ioneer Ltd."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-162e707d","guard":[["hasAny",["each word","mrln","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Merlin, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-16c74d1f","guard":[["hasAny",["each word","gaini","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gladstone Investment Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-191e2fa0","guard":[["hasAny",["each word","igac","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Invest Green Acquisition Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-19846cf7","guard":[["hasAny",["each word","split into words","vlosu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Velos Acquisition I Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-19f0de81","guard":[["hasAny",["item number","nth","oriqu","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Origin Investment Corp I."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-1a357508","guard":[["hasAny",["acglo","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arch Capital Group Ltd.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1b08a2ca","guard":[["hasAny",["item number","nth","position","stok"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stoke Therapeutics, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-1b23d269","guard":[["hasAny",["each word","eosew","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eos Energy Enterprises, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1b31ca9e","guard":[["hasAny",["each word","lpbb","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Launch Two Acquisition Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1c0e21d3","guard":[["hasAny",["item number","jkhy","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jack Henry & Associates, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1c9878fd","guard":[["hasAny",["each word","split into words","tecx"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tectonic Therapeutic, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1dffb1ee","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gri","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1e44d5b1","guard":[["hasAny",["item number","ngen","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NervGen Pharma Corp.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-1fbdd626","guard":[["hasAny",["each word","sornu","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soren Acquisition Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-21ed77c6","guard":[["hasAny",["crdo","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Credo Technology Group Holding Ltd."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-23800ee7","guard":[["hasAny",["amlx","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Amylyx Pharmaceuticals, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-23d12ad6","guard":[["hasAny",["each word","iacq","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Irenic Acquisition Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-24391104","guard":[["hasAny",["brkrp","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bruker Corporation."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-247e6191","guard":[["hasAny",["each word","qqqx","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2539aed9","guard":[["hasAny",["item number","nth","plus","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ePlus inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-26d9ca72","guard":[["hasAny",["ionr","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ioneer Ltd."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-27d05cc4","guard":[["hasAny",["brkrp","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bruker Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-27e84baf","guard":[["hasAny",["item number","nth","position","til"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Instil Bio, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-296c5b90","guard":[["hasAny",["each word","kdp","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Keurig Dr Pepper Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2afb0f7a","guard":[["hasAny",["each word","ecpg","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Encore Capital Group Inc."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2afd298c","guard":[["hasAny",["arhs","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arhaus, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2c023b0b","guard":[["hasAny",["asth","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Astrana Health Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2c178540","guard":[["hasAny",["each word","split into words","tacow"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berto Acquisition Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2e242219","guard":[["hasAny",["ecpg","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Encore Capital Group Inc."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2e2a9f83","guard":[["hasAny",["each word","ecbk","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ECB Bancorp, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2ff53d9e","guard":[["hasAny",["item number","nth","position","rbcaa"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Republic Bancorp, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-313c882e","guard":[["hasAny",["each word","rmti","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rockwell Medical, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-33185140","guard":[["hasAny",["each word","kdp","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Keurig Dr Pepper Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-339daf26","guard":[["hasAny",["acglo","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arch Capital Group Ltd.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-33a2d693","guard":[["hasAny",["bpypn","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Brookfield Property Partners L.P.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-392fabd5","guard":[["hasAny",["arcl","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ARC Group Acquisition I Corp."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3a6776ec","guard":[["hasAny",["codx","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Co-Diagnostics, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3a74f61e","guard":[["hasAny",["no vowels","remove vowels","rfaiu","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Acquisition Corp II."]},["sense.lastWord"],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-3cd72e18","guard":[["hasAny",["iacq","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Irenic Acquisition Corp.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-3d6336de","guard":[["hasAny",["item number","kdp","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Keurig Dr Pepper Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3d80a632","guard":[["hasAny",["alovw","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3f275ec0","guard":[["hasAny",["each word","pdsb","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PDS Biotechnology Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3fd8377c","guard":[["hasAny",["item number","mcft","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MasterCraft Boat Holdings, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-3fe2fdd4","guard":[["hasAny",["each word","nexr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nexera Technologies Ltd."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-40506a9e","guard":[["hasAny",["each word","split into words","srbk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SR Bancorp, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4228c430","guard":[["hasAny",["each word","ecpg","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Encore Capital Group Inc."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-454603ac","guard":[["hasAny",["item number","nth","position","zbra"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zebra Technologies Corporation."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-45b557ce","guard":[["hasAny",["each word","glsi","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greenwich LifeSciences, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-46385913","guard":[["hasAny",["each word","split into words","tcrt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Alaunos Therapeutics, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-464d7cca","guard":[["hasAny",["each word","regcp","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Regency Centers Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-46d47a1e","guard":[["hasAny",["each word","pre","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Prenetics Global Limited."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-471ff820","guard":[["hasAny",["each word","split into words","zbra"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zebra Technologies Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-47b97c78","guard":[["hasAny",["each word","split into words","swkhl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SWK Holdings Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-47e6eadc","guard":[["hasAny",["each word","mrln","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Merlin, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4b4c599a","guard":[["hasAny",["each word","noemw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CO2 Energy Transition Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4b81a1cb","guard":[["hasAny",["item number","nth","position","weys"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Weyco Group, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-4c0ccf9d","guard":[["hasAny",["codx","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Co-Diagnostics, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4cd8ea7c","guard":[["hasAny",["ffbc","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is First Financial Bancorp.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-4f49cf11","guard":[["hasAny",["item number","lpbb","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Launch Two Acquisition Corp.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4f74f1c5","guard":[["hasAny",["each word","jkhy","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jack Henry & Associates, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-500dbc5c","guard":[["hasAny",["each word","form","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FormFactor, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-501186fc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cme","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-50460614","guard":[["hasAny",["each word","insg","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Inseego Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5063dd26","guard":[["hasAny",["each word","nexr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nexera Technologies Ltd."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-50a21a37","guard":[["hasAny",["each word","oriqu","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Origin Investment Corp I."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-50c1d5e8","guard":[["hasAny",["capr","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Capricor Therapeutics, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-52140b8a","guard":[["hasAny",["each word","rbcaa","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Republic Bancorp, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-53094476","guard":[["hasAny",["cxiiu","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Churchill Capital Corp XII."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5353a57f","guard":[["hasAny",["each word","obx","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Obsidian Therapeutics, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-53b549ee","guard":[["hasAny",["bpypn","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Brookfield Property Partners L.P.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-53c26d13","guard":[["hasAny",["each word","regcp","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Regency Centers Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-53c4a000","guard":[["hasAny",["byfc","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Broadway Financial Corporation."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-54f12b4c","guard":[["hasAny",["each word","split into words","srzn"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Surrozen, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-551af293","guard":[["hasAny",["bpypn","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Brookfield Property Partners L.P.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-568c4221","guard":[["hasAny",["item number","nth","position","tcrt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Alaunos Therapeutics, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-5739b493","guard":[["hasAny",["cctg","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CCSC Technology International Holdings Limited."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-579605b9","guard":[["hasAny",["item number","nth","position","wing"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Wingstop Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-57ccc4cf","guard":[["hasAny",["each word","split into words","thh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TryHard Holdings Limited."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5ae2790d","guard":[["hasAny",["ctrn","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Citi Trends, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-5b7cec5f","guard":[["hasAny",["each word","split into words","wing"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Wingstop Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5bdd2da5","guard":[["hasAny",["bzai","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blaize Holdings, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5c54224c","guard":[["hasAny",["csq","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Calamos Strategic Total Return Fund."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-5cba5f24","guard":[["hasAny",["each word","split into words","wsbco"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is WesBanco, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5cf3f752","guard":[["hasAny",["item number","jagx","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jaguar Health, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5f0bd4c4","guard":[["hasAny",["item number","nth","position","senea"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seneca Foods Corp.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-5facd552","guard":[["hasAny",["each word","senea","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seneca Foods Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5fb02580","guard":[["hasAny",["item number","nth","position","thh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TryHard Holdings Limited."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-609b22ff","guard":[["hasAny",["each word","nktr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nektar Therapeutics."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-612363ac","guard":[["hasAny",["item number","nth","position","tecx"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tectonic Therapeutic, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-63c3d3f4","guard":[["hasAny",["cxiiu","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Churchill Capital Corp XII."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-65e08cc3","guard":[["hasAny",["each word","skyaw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SkyAI, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-67e6b050","guard":[["hasAny",["bpac","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blueport Acquisition Ltd."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6842aefc","guard":[["hasAny",["byfc","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Broadway Financial Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6922dda0","guard":[["hasAny",["each word","insg","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Inseego Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-693a7069","guard":[["hasAny",["each word","mcft","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MasterCraft Boat Holdings, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6a747ce7","guard":[["hasAny",["each word","split into words","srbk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SR Bancorp, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6c55e9bf","guard":[["hasAny",["item number","nth","pdyn","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Palladyne AI Corp.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-6cd3b64a","guard":[["hasAny",["each word","sols","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Solstice Advanced Materials Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6d04993f","guard":[["hasAny",["each word","pre","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Prenetics Global Limited."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6d1762e7","guard":[["hasAny",["each word","split into words","wsbco"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is WesBanco, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6e68ca2c","guard":[["hasAny",["cctg","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CCSC Technology International Holdings Limited."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-6e912ac9","guard":[["hasAny",["item number","jcap","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jefferson Capital, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-6faf1262","guard":[["hasAny",["item number","nexr","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nexera Technologies Ltd."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-7069b337","guard":[["hasAny",["insg","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Inseego Corp.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-71113857","guard":[["hasAny",["bpac","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blueport Acquisition Ltd."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-733a5c7f","guard":[["hasAny",["item number","nth","position","tanh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tantech Holdings Ltd.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-745dcfa2","guard":[["hasAny",["lower case","lowercase","small letters","stak"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-749eba4c","guard":[["hasAny",["asth","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Astrana Health Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-750b4645","guard":[["hasAny",["item number","nth","position","xrxdw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xerox Holdings Corporation."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-75387d8d","guard":[["hasAny",["each word","gcbc","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greene County Bancorp, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-755fe9d1","guard":[["hasAny",["each word","split into words","tnmg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TNL Mediagene."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-76980f62","guard":[["hasAny",["each word","plus","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ePlus inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-798bb4c7","guard":[["hasAny",["each word","split into words","stok"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stoke Therapeutics, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7a099d5f","guard":[["hasAny",["each word","fip","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is FTAI Infrastructure Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7a5af1fa","guard":[["hasAny",["item number","nth","position","swkhl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SWK Holdings Corporation."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-7a9c1ecd","guard":[["hasAny",["each word","split into words","tnmg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TNL Mediagene."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7b954992","guard":[["hasAny",["item number","nodk","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NI Holdings, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-7d253ec7","guard":[["hasAny",["each word","split into words","swvlw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Swvl Holdings Corp."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-81214ed1","guard":[["hasAny",["cme","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-821e683a","guard":[["hasAny",["blzru","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trailblazer Acquisition Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-830a15cc","guard":[["hasAny",["csq","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Calamos Strategic Total Return Fund."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-835b4b94","guard":[["hasAny",["arcl","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ARC Group Acquisition I Corp."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-83957af9","guard":[["hasAny",["each word","ngen","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NervGen Pharma Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-84a0e566","guard":[["hasAny",["each word","split into words","weys"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Weyco Group, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-84baa268","guard":[["hasAny",["each word","split into words","vlosu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Velos Acquisition I Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-86ab117d","guard":[["hasAny",["item number","nth","position","wsbco"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is WesBanco, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-88eb25e3","guard":[["hasAny",["each word","rbcaa","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Republic Bancorp, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8c64d6fc","guard":[["hasAny",["each word","jcap","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jefferson Capital, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8c8b0064","guard":[["hasAny",["each word","split into words","tcom"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trip.com Group Limited."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8cc3e642","guard":[["hasAny",["each word","gcbc","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greene County Bancorp, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8df5be44","guard":[["hasAny",["item number","nth","obx","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Obsidian Therapeutics, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-8e4c0b29","guard":[["hasAny",["eosew","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eos Energy Enterprises, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-8e762759","guard":[["hasAny",["item number","nth","position","regcp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Regency Centers Corporation."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-8ea79dcd","guard":[["hasAny",["each word","smcip","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Super Micro Computer, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-906ab86f","guard":[["hasAny",["each word","mgyr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Magyar Bancorp, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-917d3d24","guard":[["hasAny",["cxiiu","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Churchill Capital Corp XII."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-92363767","guard":[["hasAny",["each word","senea","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seneca Foods Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-928677d5","guard":[["hasAny",["cnxu","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Conexeu Sciences Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-92ebf1a8","guard":[["hasAny",["bzai","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blaize Holdings, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-95b85bdb","guard":[["hasAny",["ftha","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Forefront Tech Holdings Acquisition Corp."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-96d6f7a8","guard":[["hasAny",["item number","nth","position","tacow"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berto Acquisition Corp.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9723e93c","guard":[["hasAny",["each word","pdyn","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Palladyne AI Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-977fbdfd","guard":[["hasAny",["each word","ezra","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reliance Global Group, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-98e799bf","guard":[["hasAny",["each word","skyaw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SkyAI, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9a1ebdcc","guard":[["hasAny",["gaini","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gladstone Investment Corporation."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9a29f1dd","guard":[["hasAny",["aehl","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Antelope Enterprise Holdings Limited."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9adcb0d5","guard":[["hasAny",["aehl","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Antelope Enterprise Holdings Limited."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9b004899","guard":[["hasAny",["each word","split into words","tcrt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Alaunos Therapeutics, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9bf3764d","guard":[["hasAny",["each word","ffbc","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is First Financial Bancorp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9c2bd32e","guard":[["hasAny",["each word","ecbk","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ECB Bancorp, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9cbc7a7f","guard":[["hasAny",["bmhl","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bluemount Holdings Limited."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9e2d13a2","guard":[["hasAny",["ecbk","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ECB Bancorp, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-9e5dfbbd","guard":[["hasAny",["each word","mkdw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MKDWELL Tech Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9edbda62","guard":[["hasAny",["each word","oriqu","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Origin Investment Corp I."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a03f218c","guard":[["hasAny",["bwin","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is The Baldwin Insurance Group, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a160adc4","guard":[["hasAny",["each word","pepg","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PepGen Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a1a3cf5c","guard":[["hasAny",["cnxu","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Conexeu Sciences Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a3f2452b","guard":[["hasAny",["alovw","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a44230a7","guard":[["hasAny",["each word","mdrr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Medalist Diversified, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a5966b3a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","stak","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a74cd9a3","guard":[["hasAny",["each word","mkdw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MKDWELL Tech Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a7fc11d6","guard":[["hasAny",["each word","split into words","wing"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Wingstop Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a8bc3333","guard":[["hasAny",["each word","split into words","tanh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tantech Holdings Ltd.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a9da4c9a","guard":[["hasAny",["each word","split into words","weys"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Weyco Group, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-aa9082e7","guard":[["hasAny",["item number","nth","pdsb","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PDS Biotechnology Corporation."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-ab899dbb","guard":[["hasAny",["each word","split into words","vivk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Vivakor, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ac3a6e5c","guard":[["hasAny",["each word","gaini","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gladstone Investment Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ac4967bd","guard":[["hasAny",["item number","nth","position","sornu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soren Acquisition Corp.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-ac529711","guard":[["hasAny",["each word","nktr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nektar Therapeutics."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ac69a2f4","guard":[["hasAny",["each word","ftha","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Forefront Tech Holdings Acquisition Corp."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ae6e22dd","guard":[["hasAny",["each word","mdrr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Medalist Diversified, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-aea0ac4e","guard":[["hasAny",["item number","mkdw","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MKDWELL Tech Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-af84e67a","guard":[["hasAny",["amlx","each word","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Amylyx Pharmaceuticals, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-afc4d8a4","guard":[["hasAny",["each word","lpbb","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Launch Two Acquisition Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-afee9a24","guard":[["hasAny",["blzru","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trailblazer Acquisition Corp.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-b13dc594","guard":[["hasAny",["each word","ffbc","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is First Financial Bancorp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b15db911","guard":[["hasAny",["ctrn","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Citi Trends, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b3d04ea4","guard":[["hasAny",["arhs","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arhaus, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b6278722","guard":[["hasAny",["dlhc","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is DLH Holdings Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b64fc400","guard":[["hasAny",["each word","pepg","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PepGen Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-baca20e0","guard":[["hasAny",["each word","ngen","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NervGen Pharma Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bb83a8e5","guard":[["hasAny",["each word","pdyn","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Palladyne AI Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bba39b6b","guard":[["hasAny",["each word","split into words","xrxdw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xerox Holdings Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bde187d5","guard":[["hasAny",["item number","nth","pepg","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PepGen Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-be4fe4e2","guard":[["hasAny",["item number","nth","position","srbk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SR Bancorp, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-bf0e962a","guard":[["hasAny",["each word","split into words","swkhl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SWK Holdings Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bf1ef53b","guard":[["hasAny",["each word","jkhy","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jack Henry & Associates, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bf5b4ce7","guard":[["hasAny",["each word","split into words","stok"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stoke Therapeutics, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c09789ac","guard":[["hasAny",["codx","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Co-Diagnostics, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c11eb8ef","guard":[["hasAny",["gcbc","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greene County Bancorp, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c66323ea","guard":[["hasAny",["aehl","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Antelope Enterprise Holdings Limited."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-c731ca94","guard":[["hasAny",["arcl","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ARC Group Acquisition I Corp."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-c83cbf32","guard":[["hasAny",["each word","qqqx","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c9954906","guard":[["hasAny",["each word","jagx","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jaguar Health, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c9c82040","guard":[["hasAny",["each word","onchw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is 1RT Acquisition Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c9d2a38e","guard":[["hasAny",["each word","nodk","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NI Holdings, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cc808a2b","guard":[["hasAny",["brkrp","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bruker Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cc97bde0","guard":[["hasAny",["each word","split into words","tanh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tantech Holdings Ltd.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cce0be71","guard":[["hasAny",["each word","split into words","tnonw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tenon Medical, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cd121076","guard":[["hasAny",["bzai","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blaize Holdings, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ce575234","guard":[["hasAny",["each word","split into words","tnonw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tenon Medical, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cea13626","guard":[["hasAny",["each word","ftha","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Forefront Tech Holdings Acquisition Corp."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cf99a0ab","guard":[["hasAny",["item number","nth","position","sols"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Solstice Advanced Materials Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-d12588a9","guard":[["hasAny",["csq","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Calamos Strategic Total Return Fund."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d19bab1f","guard":[["hasAny",["cnxu","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Conexeu Sciences Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d1bc5adc","guard":[["hasAny",["item number","nth","position","rmti"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rockwell Medical, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d222050a","guard":[["hasAny",["each word","eosew","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eos Energy Enterprises, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d33107d6","guard":[["hasAny",["each word","iacq","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Irenic Acquisition Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d3499116","guard":[["hasAny",["fip","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is FTAI Infrastructure Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-d5c897e3","guard":[["hasAny",["each word","rmti","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rockwell Medical, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d612a1c1","guard":[["hasAny",["item number","nth","position","smcip"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Super Micro Computer, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d6f732b8","guard":[["hasAny",["bmhl","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bluemount Holdings Limited."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d6fcc04b","guard":[["hasAny",["each word","glsi","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greenwich LifeSciences, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d76008ec","guard":[["hasAny",["item number","nth","pkbk","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Parke Bancorp, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d89641ce","guard":[["hasAny",["item number","nth","position","tcom"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trip.com Group Limited."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-d9861142","guard":[["hasAny",["byfc","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Broadway Financial Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d9eae59b","guard":[["hasAny",["each word","sornu","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soren Acquisition Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-da0a37ad","guard":[["hasAny",["each word","fip","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is FTAI Infrastructure Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-daaa908f","guard":[["hasAny",["form","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FormFactor, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dabaf590","guard":[["hasAny",["each word","pkbk","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Parke Bancorp, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-db0187e9","guard":[["hasAny",["each word","ezra","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reliance Global Group, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-db17787d","guard":[["hasAny",["each word","split into words","zbra"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zebra Technologies Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dc0b002c","guard":[["hasAny",["item number","noemw","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CO2 Energy Transition Corp.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dc728f65","guard":[["hasAny",["crdo","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Credo Technology Group Holding Ltd."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dd9ee778","guard":[["hasAny",["blzru","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trailblazer Acquisition Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ddffdae8","guard":[["hasAny",["each word","noemw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CO2 Energy Transition Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dede29f6","guard":[["hasAny",["each word","obx","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Obsidian Therapeutics, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dff07609","guard":[["hasAny",["each word","form","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FormFactor, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e13a6eaa","guard":[["hasAny",["capr","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Capricor Therapeutics, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e1e88a16","guard":[["hasAny",["item number","nth","position","srzn"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Surrozen, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e2470474","guard":[["hasAny",["alovw","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e35a6ee6","guard":[["hasAny",["acglo","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arch Capital Group Ltd.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e35df993","guard":[["hasAny",["bwin","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is The Baldwin Insurance Group, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e3ceff95","guard":[["hasAny",["each word","pdsb","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PDS Biotechnology Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e4ae3f0c","guard":[["hasAny",["each word","split into words","tcom"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trip.com Group Limited."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e86fee93","guard":[["hasAny",["each word","igac","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Invest Green Acquisition Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e9bd20a4","guard":[["hasAny",["dlhc","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is DLH Holdings Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e9e3f046","guard":[["hasAny",["each word","pkbk","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Parke Bancorp, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-eb459788","guard":[["hasAny",["each word","split into words","thry"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Thryv Holdings, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ed085cd7","guard":[["hasAny",["item number","nth","position","tnmg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TNL Mediagene."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-eec3f5de","guard":[["hasAny",["amlx","each word","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Amylyx Pharmaceuticals, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f0f490c3","guard":[["hasAny",["crdo","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Credo Technology Group Holding Ltd."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f17e5afc","guard":[["hasAny",["bwin","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is The Baldwin Insurance Group, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f1ef6f41","guard":[["hasAny",["each word","ionr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ioneer Ltd."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f23232e8","guard":[["hasAny",["each word","nodk","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NI Holdings, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f2870a8a","guard":[["hasAny",["item number","nktr","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nektar Therapeutics."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f3a0ef6a","guard":[["hasAny",["each word","mcft","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MasterCraft Boat Holdings, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f3e398b1","guard":[["hasAny",["item number","nth","position","vlosu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Velos Acquisition I Corp.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f54b7fd2","guard":[["hasAny",["bpac","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blueport Acquisition Ltd."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f66c20c2","guard":[["hasAny",["each word","split into words","vivk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Vivakor, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f6f08af8","guard":[["hasAny",["item number","nth","position","pre"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Prenetics Global Limited."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f84902de","guard":[["hasAny",["each word","split into words","xrxdw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xerox Holdings Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f91c8b5f","guard":[["hasAny",["item number","nth","position","qqqx"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f9279d7f","guard":[["hasAny",["gri","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f9a0a67c","guard":[["hasAny",["igac","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Invest Green Acquisition Corporation."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fa0ca4b6","guard":[["hasAny",["each word","split into words","thh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TryHard Holdings Limited."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fad306c5","guard":[["hasAny",["each word","sols","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Solstice Advanced Materials Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fb2981bd","guard":[["hasAny",["item number","nth","position","tnonw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tenon Medical, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fc6a5d2d","guard":[["hasAny",["each word","split into words","thry"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Thryv Holdings, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fc82d573","guard":[["hasAny",["each word","split into words","tecx"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tectonic Therapeutic, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fe95532f","guard":[["hasAny",["each word","split into words","swvlw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Swvl Holdings Corp."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ffea896f","guard":[["hasAny",["each word","split into words","tacow"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berto Acquisition Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-007d2822","guard":[["hasAny",["capitalise","capitalize","capitalize each word","no vowels","remove vowels","rfaiu","title case","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Acquisition Corp II."]},["transform.title",["sense.lastWord"]],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-00d91160","guard":[["hasAny",["lower case","lowercase","small letters","stak"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-097e8fb5","guard":[["hasAny",["cme","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1060b459","guard":[["hasAny",["each word","split into words","stak"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1f2103af","guard":[["hasAny",["item number","nth","position","stak"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-29168983","guard":[["hasAny",["each word","gri","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-42156ca8","guard":[["hasAny",["cme","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-52edbf41","guard":[["hasAny",["lower case","lowercase","no vowels","remove vowels","rfaiu","small letters","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Acquisition Corp II."]},["transform.lower",["sense.lastWord"]],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-68cc1a60","guard":[["hasAny",["cme","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-774ff83c","guard":[["hasAny",["cme","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ab84ce90","guard":[["hasAny",["each word","gri","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bbf1b9f5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lower case","lowercase","small letters","stak","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d30b4935","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gri","lower case","lowercase","small letters","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f14ad1a8","guard":[["hasAny",["gri","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f1a312ec","guard":[["hasAny",["each word","split into words","stak"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f2df4df4","guard":[["hasAny",["gri","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-f719877f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cme","lower case","lowercase","small letters","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0fce1afb","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","rfaiu","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Acquisition Corp II."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-1d3243a8","guard":[["hasAny",["each word","lower case","lowercase","small letters","split into words","stak"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2641b72c","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","stak"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5899db30","guard":[["hasAny",["each word","no vowels","remove vowels","rfaiu","split into words","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Acquisition Corp II."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-73d415cf","guard":[["hasAny",["cme","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a255a0cb","guard":[["hasAny",["each word","gri","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ac52ff01","guard":[["hasAny",["each word","lower case","lowercase","small letters","split into words","stak"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d14d94c7","guard":[["hasAny",["cme","each word","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d43900e9","guard":[["hasAny",["gri","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f3ce6344","guard":[["hasAny",["each word","no vowels","remove vowels","rfaiu","split into words","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Acquisition Corp II."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-f3dec27a","guard":[["hasAny",["cme","each word","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-fbde3d3a","guard":[["hasAny",["each word","gri","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which company has the Nasdaq symbol PDSB","expect":{"contains":["PDS Biotechnology Corporation"],"notRefusal":true}},{"q":"what company is listed as MDRR","expect":{"contains":["Medalist Diversified, Inc."],"notRefusal":true}},{"q":"name the company trading on Nasdaq as IONR","expect":{"contains":["ioneer Ltd"],"notRefusal":true}},{"q":"which company has the Nasdaq symbol GRI","expect":{"contains":["GRI Bio, Inc."],"notRefusal":true}},{"q":"what company is listed as ECPG","expect":{"contains":["Encore Capital Group Inc"],"notRefusal":true}},{"q":"which company has the Nasdaq symbol BYFC","expect":{"contains":["Broadway Financial Corporation"],"notRefusal":true}},{"q":"which company has the Nasdaq symbol SORNU","expect":{"contains":["Soren Acquisition Corp."],"notRefusal":true}},{"q":"which company has the Nasdaq symbol VIVK","expect":{"contains":["Vivakor, Inc."],"notRefusal":true}},{"q":"what company is listed as CODX","expect":{"contains":["Co-Diagnostics, Inc."],"notRefusal":true}},{"q":"name the company trading on Nasdaq as NODK","expect":{"contains":["NI Holdings, Inc."],"notRefusal":true}},{"q":"what company is listed as CRDO","expect":{"contains":["Credo Technology Group Holding Ltd"],"notRefusal":true}},{"q":"what company is listed as JAGX","expect":{"contains":["Jaguar Health, Inc."],"notRefusal":true}},{"q":"name the company trading on Nasdaq as DLHC","expect":{"contains":["DLH Holdings Corp."],"notRefusal":true}},{"q":"which company has the Nasdaq symbol TNMG","expect":{"contains":["TNL Mediagene"],"notRefusal":true}},{"q":"which company has the Nasdaq symbol ECBK","expect":{"contains":["ECB Bancorp, Inc."],"notRefusal":true}},{"q":"which company has the Nasdaq symbol CME","expect":{"contains":["CME Group Inc."],"notRefusal":true}},{"q":"which company has the Nasdaq symbol INSG","expect":{"contains":["Inseego Corp."],"notRefusal":true}},{"q":"which company has the Nasdaq symbol TECX","expect":{"contains":["Tectonic Therapeutic, Inc."],"notRefusal":true}},{"q":"which company has the Nasdaq symbol RFAIU","expect":{"contains":["RF Acquisition Corp II"],"notRefusal":true}},{"q":"which company has the Nasdaq symbol BWIN","expect":{"contains":["The Baldwin Insurance Group, Inc."],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
