// airline-icao-name-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"airline-icao-name-neo-g6","class":"airline-icao-name","generation":6,"lane":"neo","grownFrom":["name the airline with the code HBR","name the airline with the code AIA","name the airline with the code AXL","name the airline with the code ONE","name the airline with the code RLA","what airline is SSV","which airline has the ICAO code HCW","what airline is ANT","what airline is NDC","name the airline with the code SLC","what airline is AMU","what airline is FAB","what airline is IKA","name the airline with the code KND","which airline has the ICAO code GFY","what airline is TIL","which airline has the ICAO code SOL","which airline has the ICAO code RYA","which airline has the ICAO code UAL","which airline has the ICAO code AES"],"version":1});

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
{"id":"n-10a0289c","guard":[["has","airline"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code AIA":"The code AIA is Avies.","name the airline with the code HBR":"The code HBR is Hebradran Air Services.","name the airline with the code AXL":"The code AXL is Air Exel.","name the airline with the code ONE":"The code ONE is Oceanair.","name the airline with the code RLA":"The code RLA is Airlinair.","what airline is SSV":"The code SSV is Skyservice Airlines.","which airline has the ICAO code HCW":"The code HCW is Star1 Airlines.","what airline is ANT":"The code ANT is Air North Charter - Canada.","what airline is NDC":"The code NDC is FlyNordic.","name the airline with the code SLC":"The code SLC is Salsa d\\\\'Haiti.","what airline is AMU":"The code AMU is Air Macau.","what airline is FAB":"The code FAB is First Air.","what airline is IKA":"The code IKA is Itek Air.","name the airline with the code KND":"The code KND is Kan Air.","which airline has the ICAO code GFY":"The code GFY is Greenfly.","what airline is TIL":"The code TIL is Tajikistan International Airlines.","which airline has the ICAO code SOL":"The code SOL is Solomon Airlines.","which airline has the ICAO code RYA":"The code RYA is Ryan Air Services.","which airline has the ICAO code UAL":"The code UAL is United Airlines.","which airline has the ICAO code AES":"The code AES is ACES Colombia.","what airline is BWA":"The code BWA is Caribbean Airlines.","which airline has the ICAO code BZE":"The code BZE is BRAZIL AIR.","what airline is FTA":"The code FTA is Frontier Flying Service.","what airline is JEF":"The code JEF is Jetflite.","which airline has the ICAO code HCC":"The code HCC is Holidays Czech Airlines.","which airline has the ICAO code BRG":"The code BRG is Bering Air.","which airline has the ICAO code PQW":"The code PQW is PanAm World Airways.","which airline has the ICAO code KKK":"The code KKK is Atlasjet.","name the airline with the code MAH":"The code MAH is Malév.","name the airline with the code JOR":"The code JOR is Blue Air.","name the airline with the code THT":"The code THT is Air Tahiti Nui.","what airline is VRN":"The code VRN is VRG Linhas Aereas.","what airline is HAM":"The code HAM is Haiti Ambassador Airlines.","which airline has the ICAO code UDN":"The code UDN is Dniproavia.","which airline has the ICAO code MNA":"The code MNA is Merpati Nusantara Airlines.","what airline is NJS":"The code NJS is National Jet Systems.","name the airline with the code GFT":"The code GFT is Gulfstream International Airlines.","which airline has the ICAO code HMR":"The code HMR is North American Charters.","name the airline with the code CEB":"The code CEB is Cebu Pacific.","name the airline with the code OOM":"The code OOM is Zoom Airlines.","which airline has the ICAO code DOA":"The code DOA is Dominicana de Aviaci.","which airline has the ICAO code ZXY":"The code ZXY is Japan Regio.","which airline has the ICAO code SHA":"The code SHA is Sharp Airlines.","name the airline with the code RAM":"The code RAM is Royal Air Maroc.","name the airline with the code AXB":"The code AXB is Air India Express.","what airline is SAY":"The code SAY is ScotAirways.","name the airline with the code PIA":"The code PIA is Pakistan International Airlines.","name the airline with the code MLD":"The code MLD is Air Moldova.","name the airline with the code ARG":"The code ARG is Aerolineas Argentinas.","name the airline with the code GER":"The code GER is German International Air Lines.","which airline has the ICAO code MDO":"The code MDO is Domenican Airlines.","what airline is SXR":"The code SXR is Sky Express.","what airline is KSM":"The code KSM is Kosmos.","which airline has the ICAO code ZNA":"The code ZNA is Zenith International Airline.","which airline has the ICAO code MXI":"The code MXI is MexicanaLink.","what airline is AUI":"The code AUI is Ukraine International Airlines.","which airline has the ICAO code XSR":"The code XSR is Executive AirShare.","what airline is LNI":"The code LNI is Lion Mentari Airlines.","which airline has the ICAO code BLF":"The code BLF is Blue1.","which airline has the ICAO code THK":"The code THK is Turk Hava Kurumu Hava Taksi Isletmesi.","what airline is ABQ":"The code ABQ is Airblue.","name the airline with the code BER":"The code BER is Air Berlin.","name the airline with the code TRA":"The code TRA is Transavia Holland.","what airline is LMM":"The code LMM is LCM AIRLINES.","which airline has the ICAO code SQC":"The code SQC is Singapore Airlines Cargo.","what airline is PEL":"The code PEL is Aeropelican Air Services.","which airline has the ICAO code WON":"The code WON is Wings Air.","name the airline with the code VGN":"The code VGN is Virgin Nigeria Airways.","name the airline with the code ELA":"The code ELA is Eastland Air.","name the airline with the code LXP":"The code LXP is LAN Express.","name the airline with the code PFL":"The code PFL is Pacific Flier.","what airline is IAW":"The code IAW is Iraqi Airways.","name the airline with the code VVC":"The code VVC is VivaColombia.","which airline has the ICAO code SXS":"The code SXS is SunExpress.","which airline has the ICAO code KRY":"The code KRY is Russkie Krylya.","what airline is BVT":"The code BVT is Berjaya Air.","what airline is SGG":"The code SGG is Senegal Airlines.","name the airline with the code OTG":"The code OTG is One Two Go Airlines.","what airline is FLG":"The code FLG is Pinnacle Airlines.","what airline is AWE":"The code AWE is America West Airlines.","what airline is CUB":"The code CUB is Cubana de Aviación.","name the airline with the code PTI":"The code PTI is Privatair.","what airline is MPH":"The code MPH is Martinair.","which airline has the ICAO code EAL":"The code EAL is European Air Express.","what airline is FZA":"The code FZA is Fuzhou Airlines.","name the airline with the code MIC":"The code MIC is Mint Airways.","name the airline with the code ESK":"The code ESK is SkyEurope.","which airline has the ICAO code JBA":"The code JBA is Helijet.","which airline has the ICAO code BTQ":"The code BTQ is Boutique Air (Priv).","which airline has the ICAO code JKK":"The code JKK is Spanair.","which airline has the ICAO code AKL":"The code AKL is Air Kiribati.","name the airline with the code LBC":"The code LBC is Albanian Airlines.","what airline is XAU":"The code XAU is XAIR USA.","what airline is MWA":"The code MWA is Midwest Airlines (Egypt).","name the airline with the code THI":"The code THI is TransHolding.","what airline is BCC":"The code BCC is BusinessAir.","which airline has the ICAO code TNS":"The code TNS is Transilvania.","name the airline with the code OBS":"The code OBS is Orbest.","which airline has the ICAO code OAE":"The code OAE is Omni Air International.","what airline is BTA":"The code BTA is ExpressJet."}}},
{"id":"n-b76b683f","guard":[["has","airline"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code AIA":"The code AIA is Avies.","name the airline with the code HBR":"The code HBR is Hebradran Air Services.","name the airline with the code AXL":"The code AXL is Air Exel.","name the airline with the code ONE":"The code ONE is Oceanair.","name the airline with the code RLA":"The code RLA is Airlinair.","what airline is SSV":"The code SSV is Skyservice Airlines.","which airline has the ICAO code HCW":"The code HCW is Star1 Airlines.","what airline is ANT":"The code ANT is Air North Charter - Canada.","what airline is NDC":"The code NDC is FlyNordic.","name the airline with the code SLC":"The code SLC is Salsa d\\\\'Haiti.","what airline is AMU":"The code AMU is Air Macau.","what airline is FAB":"The code FAB is First Air.","what airline is IKA":"The code IKA is Itek Air.","name the airline with the code KND":"The code KND is Kan Air.","which airline has the ICAO code GFY":"The code GFY is Greenfly.","what airline is TIL":"The code TIL is Tajikistan International Airlines.","which airline has the ICAO code SOL":"The code SOL is Solomon Airlines.","which airline has the ICAO code RYA":"The code RYA is Ryan Air Services.","which airline has the ICAO code UAL":"The code UAL is United Airlines.","which airline has the ICAO code AES":"The code AES is ACES Colombia.","what airline is BWA":"The code BWA is Caribbean Airlines.","which airline has the ICAO code BZE":"The code BZE is BRAZIL AIR.","what airline is FTA":"The code FTA is Frontier Flying Service.","what airline is JEF":"The code JEF is Jetflite.","which airline has the ICAO code HCC":"The code HCC is Holidays Czech Airlines.","which airline has the ICAO code BRG":"The code BRG is Bering Air.","which airline has the ICAO code PQW":"The code PQW is PanAm World Airways.","which airline has the ICAO code KKK":"The code KKK is Atlasjet.","name the airline with the code MAH":"The code MAH is Malév.","name the airline with the code JOR":"The code JOR is Blue Air.","name the airline with the code THT":"The code THT is Air Tahiti Nui.","what airline is VRN":"The code VRN is VRG Linhas Aereas.","what airline is HAM":"The code HAM is Haiti Ambassador Airlines.","which airline has the ICAO code UDN":"The code UDN is Dniproavia.","which airline has the ICAO code MNA":"The code MNA is Merpati Nusantara Airlines.","what airline is NJS":"The code NJS is National Jet Systems.","name the airline with the code GFT":"The code GFT is Gulfstream International Airlines.","which airline has the ICAO code HMR":"The code HMR is North American Charters.","name the airline with the code CEB":"The code CEB is Cebu Pacific.","name the airline with the code OOM":"The code OOM is Zoom Airlines.","which airline has the ICAO code DOA":"The code DOA is Dominicana de Aviaci.","which airline has the ICAO code ZXY":"The code ZXY is Japan Regio.","which airline has the ICAO code SHA":"The code SHA is Sharp Airlines.","name the airline with the code RAM":"The code RAM is Royal Air Maroc.","name the airline with the code AXB":"The code AXB is Air India Express.","what airline is SAY":"The code SAY is ScotAirways.","name the airline with the code PIA":"The code PIA is Pakistan International Airlines.","name the airline with the code MLD":"The code MLD is Air Moldova.","name the airline with the code ARG":"The code ARG is Aerolineas Argentinas.","name the airline with the code GER":"The code GER is German International Air Lines.","which airline has the ICAO code MDO":"The code MDO is Domenican Airlines.","what airline is SXR":"The code SXR is Sky Express.","what airline is KSM":"The code KSM is Kosmos.","which airline has the ICAO code ZNA":"The code ZNA is Zenith International Airline.","which airline has the ICAO code MXI":"The code MXI is MexicanaLink.","what airline is AUI":"The code AUI is Ukraine International Airlines.","which airline has the ICAO code XSR":"The code XSR is Executive AirShare.","what airline is LNI":"The code LNI is Lion Mentari Airlines.","which airline has the ICAO code BLF":"The code BLF is Blue1.","which airline has the ICAO code THK":"The code THK is Turk Hava Kurumu Hava Taksi Isletmesi.","what airline is ABQ":"The code ABQ is Airblue.","name the airline with the code BER":"The code BER is Air Berlin.","name the airline with the code TRA":"The code TRA is Transavia Holland.","what airline is LMM":"The code LMM is LCM AIRLINES.","which airline has the ICAO code SQC":"The code SQC is Singapore Airlines Cargo.","what airline is PEL":"The code PEL is Aeropelican Air Services.","which airline has the ICAO code WON":"The code WON is Wings Air.","name the airline with the code VGN":"The code VGN is Virgin Nigeria Airways.","name the airline with the code ELA":"The code ELA is Eastland Air.","name the airline with the code LXP":"The code LXP is LAN Express.","name the airline with the code PFL":"The code PFL is Pacific Flier.","what airline is IAW":"The code IAW is Iraqi Airways.","name the airline with the code VVC":"The code VVC is VivaColombia.","which airline has the ICAO code SXS":"The code SXS is SunExpress.","which airline has the ICAO code KRY":"The code KRY is Russkie Krylya.","what airline is BVT":"The code BVT is Berjaya Air.","what airline is SGG":"The code SGG is Senegal Airlines.","name the airline with the code OTG":"The code OTG is One Two Go Airlines.","what airline is FLG":"The code FLG is Pinnacle Airlines.","what airline is AWE":"The code AWE is America West Airlines.","what airline is CUB":"The code CUB is Cubana de Aviación.","name the airline with the code PTI":"The code PTI is Privatair.","what airline is MPH":"The code MPH is Martinair.","which airline has the ICAO code EAL":"The code EAL is European Air Express.","what airline is FZA":"The code FZA is Fuzhou Airlines.","name the airline with the code MIC":"The code MIC is Mint Airways.","name the airline with the code ESK":"The code ESK is SkyEurope.","which airline has the ICAO code JBA":"The code JBA is Helijet.","which airline has the ICAO code BTQ":"The code BTQ is Boutique Air (Priv).","which airline has the ICAO code JKK":"The code JKK is Spanair.","which airline has the ICAO code AKL":"The code AKL is Air Kiribati.","name the airline with the code LBC":"The code LBC is Albanian Airlines.","what airline is XAU":"The code XAU is XAIR USA.","what airline is MWA":"The code MWA is Midwest Airlines (Egypt).","name the airline with the code THI":"The code THI is TransHolding.","what airline is BCC":"The code BCC is BusinessAir.","which airline has the ICAO code TNS":"The code TNS is Transilvania.","name the airline with the code OBS":"The code OBS is Orbest.","which airline has the ICAO code OAE":"The code OAE is Omni Air International.","what airline is BTA":"The code BTA is ExpressJet."}}},
{"id":"n-6845f51b","guard":[["has","airline"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"airline"}]]],"mem":{"table":{"with the code AIA":"The code AIA is Avies.","with the code HBR":"The code HBR is Hebradran Air Services.","with the code AXL":"The code AXL is Air Exel.","with the code ONE":"The code ONE is Oceanair.","with the code RLA":"The code RLA is Airlinair.","is SSV":"The code SSV is Skyservice Airlines.","has the ICAO code HCW":"The code HCW is Star1 Airlines.","is ANT":"The code ANT is Air North Charter - Canada.","is NDC":"The code NDC is FlyNordic.","with the code SLC":"The code SLC is Salsa d\\\\'Haiti.","is AMU":"The code AMU is Air Macau.","is FAB":"The code FAB is First Air.","is IKA":"The code IKA is Itek Air.","with the code KND":"The code KND is Kan Air.","has the ICAO code GFY":"The code GFY is Greenfly.","is TIL":"The code TIL is Tajikistan International Airlines.","has the ICAO code SOL":"The code SOL is Solomon Airlines.","has the ICAO code RYA":"The code RYA is Ryan Air Services.","has the ICAO code UAL":"The code UAL is United Airlines.","has the ICAO code AES":"The code AES is ACES Colombia.","is BWA":"The code BWA is Caribbean Airlines.","has the ICAO code BZE":"The code BZE is BRAZIL AIR.","is FTA":"The code FTA is Frontier Flying Service.","is JEF":"The code JEF is Jetflite.","has the ICAO code HCC":"The code HCC is Holidays Czech Airlines.","has the ICAO code BRG":"The code BRG is Bering Air.","has the ICAO code PQW":"The code PQW is PanAm World Airways.","has the ICAO code KKK":"The code KKK is Atlasjet.","with the code MAH":"The code MAH is Malév.","with the code JOR":"The code JOR is Blue Air.","with the code THT":"The code THT is Air Tahiti Nui.","is VRN":"The code VRN is VRG Linhas Aereas.","is HAM":"The code HAM is Haiti Ambassador Airlines.","has the ICAO code UDN":"The code UDN is Dniproavia.","has the ICAO code MNA":"The code MNA is Merpati Nusantara Airlines.","is NJS":"The code NJS is National Jet Systems.","with the code GFT":"The code GFT is Gulfstream International Airlines.","has the ICAO code HMR":"The code HMR is North American Charters.","with the code CEB":"The code CEB is Cebu Pacific.","with the code OOM":"The code OOM is Zoom Airlines.","has the ICAO code DOA":"The code DOA is Dominicana de Aviaci.","has the ICAO code ZXY":"The code ZXY is Japan Regio.","has the ICAO code SHA":"The code SHA is Sharp Airlines.","with the code RAM":"The code RAM is Royal Air Maroc.","with the code AXB":"The code AXB is Air India Express.","is SAY":"The code SAY is ScotAirways.","with the code PIA":"The code PIA is Pakistan International Airlines.","with the code MLD":"The code MLD is Air Moldova.","with the code ARG":"The code ARG is Aerolineas Argentinas.","with the code GER":"The code GER is German International Air Lines.","has the ICAO code MDO":"The code MDO is Domenican Airlines.","is SXR":"The code SXR is Sky Express.","is KSM":"The code KSM is Kosmos.","has the ICAO code ZNA":"The code ZNA is Zenith International Airline.","has the ICAO code MXI":"The code MXI is MexicanaLink.","is AUI":"The code AUI is Ukraine International Airlines.","has the ICAO code XSR":"The code XSR is Executive AirShare.","is LNI":"The code LNI is Lion Mentari Airlines.","has the ICAO code BLF":"The code BLF is Blue1.","has the ICAO code THK":"The code THK is Turk Hava Kurumu Hava Taksi Isletmesi.","is ABQ":"The code ABQ is Airblue.","with the code BER":"The code BER is Air Berlin.","with the code TRA":"The code TRA is Transavia Holland.","is LMM":"The code LMM is LCM AIRLINES.","has the ICAO code SQC":"The code SQC is Singapore Airlines Cargo.","is PEL":"The code PEL is Aeropelican Air Services.","has the ICAO code WON":"The code WON is Wings Air.","with the code VGN":"The code VGN is Virgin Nigeria Airways.","with the code ELA":"The code ELA is Eastland Air.","with the code LXP":"The code LXP is LAN Express.","with the code PFL":"The code PFL is Pacific Flier.","is IAW":"The code IAW is Iraqi Airways.","with the code VVC":"The code VVC is VivaColombia.","has the ICAO code SXS":"The code SXS is SunExpress.","has the ICAO code KRY":"The code KRY is Russkie Krylya.","is BVT":"The code BVT is Berjaya Air.","is SGG":"The code SGG is Senegal Airlines.","with the code OTG":"The code OTG is One Two Go Airlines.","is FLG":"The code FLG is Pinnacle Airlines.","is AWE":"The code AWE is America West Airlines.","is CUB":"The code CUB is Cubana de Aviación.","with the code PTI":"The code PTI is Privatair.","is MPH":"The code MPH is Martinair.","has the ICAO code EAL":"The code EAL is European Air Express.","is FZA":"The code FZA is Fuzhou Airlines.","with the code MIC":"The code MIC is Mint Airways.","with the code ESK":"The code ESK is SkyEurope.","has the ICAO code JBA":"The code JBA is Helijet.","has the ICAO code BTQ":"The code BTQ is Boutique Air (Priv).","has the ICAO code JKK":"The code JKK is Spanair.","has the ICAO code AKL":"The code AKL is Air Kiribati.","with the code LBC":"The code LBC is Albanian Airlines.","is XAU":"The code XAU is XAIR USA.","is MWA":"The code MWA is Midwest Airlines (Egypt).","with the code THI":"The code THI is TransHolding.","is BCC":"The code BCC is BusinessAir.","has the ICAO code TNS":"The code TNS is Transilvania.","with the code OBS":"The code OBS is Orbest.","has the ICAO code OAE":"The code OAE is Omni Air International.","is BTA":"The code BTA is ExpressJet."}}},
{"id":"n-e963ce4c","guard":[["has","airline"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"SSV":"The code SSV is Skyservice Airlines.","ANT":"The code ANT is Air North Charter - Canada.","NDC":"The code NDC is FlyNordic.","AMU":"The code AMU is Air Macau.","FAB":"The code FAB is First Air.","IKA":"The code IKA is Itek Air.","TIL":"The code TIL is Tajikistan International Airlines.","BWA":"The code BWA is Caribbean Airlines.","FTA":"The code FTA is Frontier Flying Service.","JEF":"The code JEF is Jetflite.","VRN":"The code VRN is VRG Linhas Aereas.","HAM":"The code HAM is Haiti Ambassador Airlines.","NJS":"The code NJS is National Jet Systems.","SAY":"The code SAY is ScotAirways.","SXR":"The code SXR is Sky Express.","KSM":"The code KSM is Kosmos.","AUI":"The code AUI is Ukraine International Airlines.","LNI":"The code LNI is Lion Mentari Airlines.","ABQ":"The code ABQ is Airblue.","LMM":"The code LMM is LCM AIRLINES.","PEL":"The code PEL is Aeropelican Air Services.","IAW":"The code IAW is Iraqi Airways.","BVT":"The code BVT is Berjaya Air.","SGG":"The code SGG is Senegal Airlines.","FLG":"The code FLG is Pinnacle Airlines.","AWE":"The code AWE is America West Airlines.","CUB":"The code CUB is Cubana de Aviación.","MPH":"The code MPH is Martinair.","FZA":"The code FZA is Fuzhou Airlines.","XAU":"The code XAU is XAIR USA.","MWA":"The code MWA is Midwest Airlines (Egypt).","BCC":"The code BCC is BusinessAir.","BTA":"The code BTA is ExpressJet."}}},
{"id":"n-0032bac9","guard":[["hasAny",["airline","say"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is SAY":"The code SAY is ScotAirways."}}},
{"id":"n-0126e7c3","guard":[["has","arg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code ARG":"The code ARG is Aerolineas Argentinas."}}},
{"id":"n-01327173","guard":[["has","doa"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Dominicana de Aviaci."]},["sense.lastWord"]],"mem":null},
{"id":"n-01ac0a28","guard":[["hasAny",["airline","amu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is AMU":"The code AMU is Air Macau."}}},
{"id":"n-01f31685","guard":[["has","pti"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code PTI":"The code PTI is Privatair."}}},
{"id":"n-02c77a4c","guard":[["has","esk"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is SkyEurope."]},["sense.lastWord"]],"mem":null},
{"id":"n-03d6cba8","guard":[["hasAny",["airline","ham"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is HAM":"The code HAM is Haiti Ambassador Airlines."}}},
{"id":"n-042b5ba0","guard":[["hasAny",["airline","code","mic","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code MIC":"The code MIC is Mint Airways."}}},
{"id":"n-05029b27","guard":[["has","ceb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code CEB":"The code CEB is Cebu Pacific."}}},
{"id":"n-0836e9a0","guard":[["has","otg"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is One Two Go Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-089ace92","guard":[["has","ceb"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Cebu Pacific."]},["sense.lastWord"]],"mem":null},
{"id":"n-0be741a8","guard":[["has","mxi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code MXI":"The code MXI is MexicanaLink."}}},
{"id":"n-0c00047d","guard":[["hasAny",["airline","lmm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is LMM":"The code LMM is LCM AIRLINES."}}},
{"id":"n-0c3ae534","guard":[["has","ela"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Eastland Air."]},["sense.lastWord"]],"mem":null},
{"id":"n-0c7376f0","guard":[["hasAny",["airline","bcc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is BCC":"The code BCC is BusinessAir."}}},
{"id":"n-0cd2187f","guard":[["has","ram"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Royal Air Maroc."]},["sense.lastWord"]],"mem":null},
{"id":"n-0d072e53","guard":[["hasAny",["airline","code","has","icao","sol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code SOL":"The code SOL is Solomon Airlines."}}},
{"id":"n-0d25878c","guard":[["has","mld"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code MLD":"The code MLD is Air Moldova."}}},
{"id":"n-0d3a5a2d","guard":[["has","ksm"],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["sense.lastWord"]],"mem":null},
{"id":"n-0e1105a9","guard":[["hasAny",["abq","airline"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is ABQ":"The code ABQ is Airblue."}}},
{"id":"n-0f58f147","guard":[["has","til"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Tajikistan International Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-0f742e6e","guard":[["has","pqw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code PQW":"The code PQW is PanAm World Airways."}}},
{"id":"n-0ff891e1","guard":[["has","eal"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is European Air Express."]},["sense.lastWord"]],"mem":null},
{"id":"n-1136f6ac","guard":[["has","zxy"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Japan Regio."]},["sense.lastWord"]],"mem":null},
{"id":"n-13c537ae","guard":[["hasAny",["airline","awe"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is AWE":"The code AWE is America West Airlines."}}},
{"id":"n-13f6e616","guard":[["hasAny",["airline","code","has","icao","oae"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code OAE":"The code OAE is Omni Air International."}}},
{"id":"n-143a8d99","guard":[["hasAny",["airline","code","ger","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code GER":"The code GER is German International Air Lines."}}},
{"id":"n-14672c78","guard":[["hasAny",["airline","fab"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is FAB":"The code FAB is First Air."}}},
{"id":"n-14a9c9f4","guard":[["hasAny",["airline","sxr"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is SXR":"The code SXR is Sky Express."}}},
{"id":"n-1534b760","guard":[["hasAny",["airline","iaw"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is IAW":"The code IAW is Iraqi Airways."}}},
{"id":"n-15ca625a","guard":[["hasAny",["airline","fza"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is FZA":"The code FZA is Fuzhou Airlines."}}},
{"id":"n-1665b373","guard":[["hasAny",["airline","code","knd","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code KND":"The code KND is Kan Air."}}},
{"id":"n-1a26f2dc","guard":[["hasAny",["airline","code","has","icao","kkk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code KKK":"The code KKK is Atlasjet."}}},
{"id":"n-1b4853d5","guard":[["has","mic"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Mint Airways."]},["sense.lastWord"]],"mem":null},
{"id":"n-1cc04dfa","guard":[["has","bvt"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Berjaya Air."]},["sense.lastWord"]],"mem":null},
{"id":"n-1f3b44b3","guard":[["has","ika"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Itek Air."]},["sense.lastWord"]],"mem":null},
{"id":"n-1fd36bd2","guard":[["has","mic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code MIC":"The code MIC is Mint Airways."}}},
{"id":"n-2267a8fd","guard":[["hasAny",["airline","pel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is PEL":"The code PEL is Aeropelican Air Services."}}},
{"id":"n-22cc87cb","guard":[["has","kry"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code KRY":"The code KRY is Russkie Krylya."}}},
{"id":"n-22fdd7dd","guard":[["has","tns"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code TNS":"The code TNS is Transilvania."}}},
{"id":"n-239a1c59","guard":[["hasAny",["airline","vrn"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is VRN":"The code VRN is VRG Linhas Aereas."}}},
{"id":"n-23b547ff","guard":[["has","oom"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Zoom Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-241b57d3","guard":[["hasAny",["airline","ksm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is KSM":"The code KSM is Kosmos."}}},
{"id":"n-24ec36cd","guard":[["has","vrn"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VRG Linhas Aereas."]},["sense.lastWord"]],"mem":null},
{"id":"n-250c76ed","guard":[["has","doa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code DOA":"The code DOA is Dominicana de Aviaci."}}},
{"id":"n-25dee6cb","guard":[["has","rla"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airlinair."]},["sense.lastWord"]],"mem":null},
{"id":"n-26954445","guard":[["hasAny",["airline","xau"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is XAU":"The code XAU is XAIR USA."}}},
{"id":"n-269b7670","guard":[["hasAny",["airline","code","has","icao","jba"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code JBA":"The code JBA is Helijet."}}},
{"id":"n-271fc878","guard":[["has","sxs"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is SunExpress."]},["sense.lastWord"]],"mem":null},
{"id":"n-28b85067","guard":[["has","obs"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Orbest."]},["sense.lastWord"]],"mem":null},
{"id":"n-2a36a6a4","guard":[["has","mdo"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Domenican Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-2a6f09c5","guard":[["hasAny",["airline","lni"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is LNI":"The code LNI is Lion Mentari Airlines."}}},
{"id":"n-2bc3dc66","guard":[["has","tra"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code TRA":"The code TRA is Transavia Holland."}}},
{"id":"n-2c459c5f","guard":[["has","fza"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Fuzhou Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-2cb618db","guard":[["hasAny",["airline","code","mld","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code MLD":"The code MLD is Air Moldova."}}},
{"id":"n-2eff74b2","guard":[["has","axb"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air India Express."]},["sense.lastWord"]],"mem":null},
{"id":"n-2f10aa44","guard":[["hasAny",["airline","mwa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is MWA":"The code MWA is Midwest Airlines (Egypt)."}}},
{"id":"n-2f5ff462","guard":[["has","sqc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code SQC":"The code SQC is Singapore Airlines Cargo."}}},
{"id":"n-303d284e","guard":[["has","gfy"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Greenfly."]},["sense.lastWord"]],"mem":null},
{"id":"n-30c6c24a","guard":[["hasAny",["airline","code","has","hcw","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code HCW":"The code HCW is Star1 Airlines."}}},
{"id":"n-30e898f1","guard":[["has","sol"],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Solomon Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-314debed","guard":[["hasAny",["airline","ika"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is IKA":"The code IKA is Itek Air."}}},
{"id":"n-31bc7584","guard":[["has","fta"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Frontier Flying Service."]},["sense.lastWord"]],"mem":null},
{"id":"n-31f68a37","guard":[["has","won"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code WON":"The code WON is Wings Air."}}},
{"id":"n-347eaa26","guard":[["has","mah"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code MAH":"The code MAH is Malév."}}},
{"id":"n-351b9070","guard":[["hasAny",["airline","code","has","icao","thk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code THK":"The code THK is Turk Hava Kurumu Hava Taksi Isletmesi."}}},
{"id":"n-352a52b7","guard":[["has","gfy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code GFY":"The code GFY is Greenfly."}}},
{"id":"n-36497f95","guard":[["hasAny",["airline","bvt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is BVT":"The code BVT is Berjaya Air."}}},
{"id":"n-36d6b9de","guard":[["hasAny",["airline","bwa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is BWA":"The code BWA is Caribbean Airlines."}}},
{"id":"n-387ffa06","guard":[["hasAny",["airline","bze","code","has","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code BZE":"The code BZE is BRAZIL AIR."}}},
{"id":"n-396bc9fd","guard":[["hasAny",["aia","airline","code","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code AIA":"The code AIA is Avies."}}},
{"id":"n-398872ec","guard":[["hasAny",["airline","njs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is NJS":"The code NJS is National Jet Systems."}}},
{"id":"n-39c84cb1","guard":[["hasAny",["airline","bcc"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is BCC":"The code BCC is BusinessAir."}}},
{"id":"n-3a30ab2c","guard":[["has","pel"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aeropelican Air Services."]},["sense.lastWord"]],"mem":null},
{"id":"n-3a5e25b3","guard":[["has","sha"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sharp Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-3af5832f","guard":[["has","thi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code THI":"The code THI is TransHolding."}}},
{"id":"n-3afea32c","guard":[["has","tht"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code THT":"The code THT is Air Tahiti Nui."}}},
{"id":"n-3c555aaa","guard":[["hasAny",["airline","ber","code","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code BER":"The code BER is Air Berlin."}}},
{"id":"n-43483b47","guard":[["has","mld"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Moldova."]},["sense.lastWord"]],"mem":null},
{"id":"n-436311bf","guard":[["hasAny",["airline","code","lxp","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code LXP":"The code LXP is LAN Express."}}},
{"id":"n-43c1ef1b","guard":[["has","ela"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code ELA":"The code ELA is Eastland Air."}}},
{"id":"n-456b50b0","guard":[["has","flg"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-458a99f0","guard":[["hasAny",["airline","code","name","pti"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code PTI":"The code PTI is Privatair."}}},
{"id":"n-46606506","guard":[["has","jkk"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Spanair."]},["sense.lastWord"]],"mem":null},
{"id":"n-46df8c4f","guard":[["hasAny",["airline","code","has","hcc","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code HCC":"The code HCC is Holidays Czech Airlines."}}},
{"id":"n-474a0813","guard":[["hasAny",["airline","ham"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is HAM":"The code HAM is Haiti Ambassador Airlines."}}},
{"id":"n-48d2bc67","guard":[["has","thi"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is TransHolding."]},["sense.lastWord"]],"mem":null},
{"id":"n-499e1509","guard":[["has","ram"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code RAM":"The code RAM is Royal Air Maroc."}}},
{"id":"n-4a803811","guard":[["hasAny",["airline","xau"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is XAU":"The code XAU is XAIR USA."}}},
{"id":"n-4ab68d37","guard":[["has","eal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code EAL":"The code EAL is European Air Express."}}},
{"id":"n-4ce3f2a1","guard":[["hasAny",["airline","cub"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is CUB":"The code CUB is Cubana de Aviación."}}},
{"id":"n-4e683e75","guard":[["has","slc"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Salsa d\\\\'Haiti."]},["sense.lastWord"]],"mem":null},
{"id":"n-4f578d7c","guard":[["has","ant"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air North Charter - Canada."]},["sense.lastWord"]],"mem":null},
{"id":"n-5115e4ad","guard":[["has","zna"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code ZNA":"The code ZNA is Zenith International Airline."}}},
{"id":"n-529250ad","guard":[["hasAny",["airline","code","has","icao","sqc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code SQC":"The code SQC is Singapore Airlines Cargo."}}},
{"id":"n-5450e93e","guard":[["has","tra"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Transavia Holland."]},["sense.lastWord"]],"mem":null},
{"id":"n-54725a59","guard":[["has","knd"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kan Air."]},["sense.lastWord"]],"mem":null},
{"id":"n-54f86d3a","guard":[["has","axl"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Exel."]},["sense.lastWord"]],"mem":null},
{"id":"n-56413a3a","guard":[["hasAny",["airline","code","name","tht"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code THT":"The code THT is Air Tahiti Nui."}}},
{"id":"n-566d5751","guard":[["has","btq"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Boutique Air (Priv)."]},["sense.lastWord"]],"mem":null},
{"id":"n-56d883af","guard":[["hasAny",["airline","aui"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is AUI":"The code AUI is Ukraine International Airlines."}}},
{"id":"n-57b37719","guard":[["hasAny",["airline","code","name","ram"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code RAM":"The code RAM is Royal Air Maroc."}}},
{"id":"n-58e793a4","guard":[["has","pia"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pakistan International Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-5915119b","guard":[["has","mph"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["sense.lastWord"]],"mem":null},
{"id":"n-5989c4ca","guard":[["has","mna"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Merpati Nusantara Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-5c1b1c5e","guard":[["hasAny",["airline","code","name","rla"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code RLA":"The code RLA is Airlinair."}}},
{"id":"n-5c6c47d0","guard":[["has","xsr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code XSR":"The code XSR is Executive AirShare."}}},
{"id":"n-5d9677bf","guard":[["hasAny",["airline","mph"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is MPH":"The code MPH is Martinair."}}},
{"id":"n-5df26a71","guard":[["has","lbc"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Albanian Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-5f9ec669","guard":[["has","ual"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is United Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-600eb380","guard":[["has","obs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code OBS":"The code OBS is Orbest."}}},
{"id":"n-6199467a","guard":[["hasAny",["airline","say"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is SAY":"The code SAY is ScotAirways."}}},
{"id":"n-61f3f93a","guard":[["hasAny",["abq","airline"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is ABQ":"The code ABQ is Airblue."}}},
{"id":"n-6310be90","guard":[["has","jba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code JBA":"The code JBA is Helijet."}}},
{"id":"n-63a6b3f4","guard":[["hasAny",["airline","code","name","tra"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code TRA":"The code TRA is Transavia Holland."}}},
{"id":"n-63b65e66","guard":[["has","hcc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code HCC":"The code HCC is Holidays Czech Airlines."}}},
{"id":"n-64f96648","guard":[["has","rla"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code RLA":"The code RLA is Airlinair."}}},
{"id":"n-65966191","guard":[["has","hmr"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is North American Charters."]},["sense.lastWord"]],"mem":null},
{"id":"n-66889a5c","guard":[["has","sol"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code SOL":"The code SOL is Solomon Airlines."}}},
{"id":"n-6b5fd141","guard":[["hasAny",["airline","fza"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is FZA":"The code FZA is Fuzhou Airlines."}}},
{"id":"n-6d45497e","guard":[["hasAny",["airline","flg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is FLG":"The code FLG is Pinnacle Airlines."}}},
{"id":"n-6ec95593","guard":[["hasAny",["airline","code","eal","has","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code EAL":"The code EAL is European Air Express."}}},
{"id":"n-6f7ae3c7","guard":[["hasAny",["airline","code","name","oom"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code OOM":"The code OOM is Zoom Airlines."}}},
{"id":"n-6fd74917","guard":[["hasAny",["airline","btq","code","has","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code BTQ":"The code BTQ is Boutique Air (Priv)."}}},
{"id":"n-706c35ed","guard":[["hasAny",["airline","code","name","pia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code PIA":"The code PIA is Pakistan International Airlines."}}},
{"id":"n-717f8f69","guard":[["has","vvc"],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VivaColombia."]},["sense.lastWord"]],"mem":null},
{"id":"n-740922cd","guard":[["hasAny",["airline","code","esk","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code ESK":"The code ESK is SkyEurope."}}},
{"id":"n-74471721","guard":[["has","awe"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is America West Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-74ee156d","guard":[["hasAny",["airline","jef"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is JEF":"The code JEF is Jetflite."}}},
{"id":"n-76c86ea6","guard":[["hasAny",["airline","sgg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is SGG":"The code SGG is Senegal Airlines."}}},
{"id":"n-76e5429d","guard":[["hasAny",["airline","code","gfy","has","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code GFY":"The code GFY is Greenfly."}}},
{"id":"n-77967c5b","guard":[["has","lxp"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LAN Express."]},["sense.lastWord"]],"mem":null},
{"id":"n-77b7390a","guard":[["hasAny",["airline","aui"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is AUI":"The code AUI is Ukraine International Airlines."}}},
{"id":"n-7899089c","guard":[["hasAny",["airline","mph"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is MPH":"The code MPH is Martinair."}}},
{"id":"n-79c74770","guard":[["hasAny",["airline","code","gft","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code GFT":"The code GFT is Gulfstream International Airlines."}}},
{"id":"n-7a3c7ad1","guard":[["has","ham"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Haiti Ambassador Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-7aa04c52","guard":[["has","tht"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Tahiti Nui."]},["sense.lastWord"]],"mem":null},
{"id":"n-7c88c46b","guard":[["has","pti"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Privatair."]},["sense.lastWord"]],"mem":null},
{"id":"n-7cd2acdc","guard":[["has","sqc"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Singapore Airlines Cargo."]},["sense.lastWord"]],"mem":null},
{"id":"n-7dbc479c","guard":[["has","njs"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["sense.lastWord"]],"mem":null},
{"id":"n-7e03e304","guard":[["hasAny",["airline","pel"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is PEL":"The code PEL is Aeropelican Air Services."}}},
{"id":"n-7f0d7c6d","guard":[["has","jor"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code JOR":"The code JOR is Blue Air."}}},
{"id":"n-808b167e","guard":[["hasAny",["airline","bta"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is BTA":"The code BTA is ExpressJet."}}},
{"id":"n-8121cefb","guard":[["has","jef"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Jetflite."]},["sense.lastWord"]],"mem":null},
{"id":"n-834e7f3b","guard":[["hasAny",["airline","code","name","otg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code OTG":"The code OTG is One Two Go Airlines."}}},
{"id":"n-83ee9620","guard":[["has","hbr"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Hebradran Air Services."]},["sense.lastWord"]],"mem":null},
{"id":"n-84d9d3f8","guard":[["hasAny",["airline","code","name","slc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code SLC":"The code SLC is Salsa d\\\\'Haiti."}}},
{"id":"n-84e06e0e","guard":[["has","brg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code BRG":"The code BRG is Bering Air."}}},
{"id":"n-84e2a487","guard":[["hasAny",["airline","bwa"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is BWA":"The code BWA is Caribbean Airlines."}}},
{"id":"n-85322a4f","guard":[["has","rya"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Ryan Air Services."]},["sense.lastWord"]],"mem":null},
{"id":"n-858d9cb0","guard":[["hasAny",["airline","sxr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is SXR":"The code SXR is Sky Express."}}},
{"id":"n-861da024","guard":[["has","bze"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code BZE":"The code BZE is BRAZIL AIR."}}},
{"id":"n-868141e2","guard":[["has","zxy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code ZXY":"The code ZXY is Japan Regio."}}},
{"id":"n-875838db","guard":[["has","tns"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Transilvania."]},["sense.lastWord"]],"mem":null},
{"id":"n-8769b35c","guard":[["hasAny",["airline","mwa"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is MWA":"The code MWA is Midwest Airlines (Egypt)."}}},
{"id":"n-8a615add","guard":[["hasAny",["airline","blf","code","has","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code BLF":"The code BLF is Blue1."}}},
{"id":"n-8a61888a","guard":[["hasAny",["airline","ssv"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is SSV":"The code SSV is Skyservice Airlines."}}},
{"id":"n-8ab59f81","guard":[["has","jba"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Helijet."]},["sense.lastWord"]],"mem":null},
{"id":"n-8c3828bf","guard":[["hasAny",["airline","bvt"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is BVT":"The code BVT is Berjaya Air."}}},
{"id":"n-8d7f11c7","guard":[["has","otg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code OTG":"The code OTG is One Two Go Airlines."}}},
{"id":"n-8dcde17b","guard":[["hasAny",["airline","code","name","obs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code OBS":"The code OBS is Orbest."}}},
{"id":"n-909228c6","guard":[["hasAny",["airline","awe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is AWE":"The code AWE is America West Airlines."}}},
{"id":"n-91a3d901","guard":[["has","brg"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Bering Air."]},["sense.lastWord"]],"mem":null},
{"id":"n-9267011a","guard":[["has","bwa"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Caribbean Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-92e8bdb7","guard":[["hasAny",["airline","flg"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is FLG":"The code FLG is Pinnacle Airlines."}}},
{"id":"n-9306ec62","guard":[["hasAny",["airline","code","has","icao","tns"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code TNS":"The code TNS is Transilvania."}}},
{"id":"n-935b393a","guard":[["has","pia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code PIA":"The code PIA is Pakistan International Airlines."}}},
{"id":"n-943246d5","guard":[["has","ndc"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is FlyNordic."]},["sense.lastWord"]],"mem":null},
{"id":"n-949b5ec6","guard":[["hasAny",["airline","code","mah","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code MAH":"The code MAH is Malév."}}},
{"id":"n-949b9b47","guard":[["has","aia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code AIA":"The code AIA is Avies."}}},
{"id":"n-94ad6b36","guard":[["hasAny",["airline","code","ela","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code ELA":"The code ELA is Eastland Air."}}},
{"id":"n-95295fd6","guard":[["hasAny",["airline","code","doa","has","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code DOA":"The code DOA is Dominicana de Aviaci."}}},
{"id":"n-95b27076","guard":[["has","aia"],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Avies."]},["sense.lastWord"]],"mem":null},
{"id":"n-960298ae","guard":[["hasAny",["airline","ant"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is ANT":"The code ANT is Air North Charter - Canada."}}},
{"id":"n-972f6daa","guard":[["has","won"],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Wings Air."]},["sense.lastWord"]],"mem":null},
{"id":"n-977a4e41","guard":[["hasAny",["airline","code","hbr","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code HBR":"The code HBR is Hebradran Air Services."}}},
{"id":"n-9836a97f","guard":[["has","axb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code AXB":"The code AXB is Air India Express."}}},
{"id":"n-9ad26cee","guard":[["has","slc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code SLC":"The code SLC is Salsa d\\\\'Haiti."}}},
{"id":"n-9af7c07c","guard":[["has","mah"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Malév."]},["sense.lastWord"]],"mem":null},
{"id":"n-9b0009a6","guard":[["has","mwa"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Midwest Airlines (Egypt)."]},["sense.lastWord"]],"mem":null},
{"id":"n-9b63aefa","guard":[["has","vgn"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Virgin Nigeria Airways."]},["sense.lastWord"]],"mem":null},
{"id":"n-9c159dbb","guard":[["has","gft"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code GFT":"The code GFT is Gulfstream International Airlines."}}},
{"id":"n-9c8b8efd","guard":[["hasAny",["airline","njs"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is NJS":"The code NJS is National Jet Systems."}}},
{"id":"n-9eaaa612","guard":[["has","bta"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["sense.lastWord"]],"mem":null},
{"id":"n-9eb5992d","guard":[["has","say"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ScotAirways."]},["sense.lastWord"]],"mem":null},
{"id":"n-9f5cca92","guard":[["has","rya"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code RYA":"The code RYA is Ryan Air Services."}}},
{"id":"n-a077cdc1","guard":[["has","arg"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aerolineas Argentinas."]},["sense.lastWord"]],"mem":null},
{"id":"n-a2340cdc","guard":[["has","jor"],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Blue Air."]},["sense.lastWord"]],"mem":null},
{"id":"n-a25cc026","guard":[["has","sha"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code SHA":"The code SHA is Sharp Airlines."}}},
{"id":"n-a2833dc2","guard":[["has","lbc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code LBC":"The code LBC is Albanian Airlines."}}},
{"id":"n-a3f14067","guard":[["hasAny",["airline","code","has","icao","won"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code WON":"The code WON is Wings Air."}}},
{"id":"n-a4c5b410","guard":[["has","hmr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code HMR":"The code HMR is North American Charters."}}},
{"id":"n-a8dfb9d0","guard":[["hasAny",["airline","code","has","icao","xsr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code XSR":"The code XSR is Executive AirShare."}}},
{"id":"n-a92aac5d","guard":[["hasAny",["airline","fta"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is FTA":"The code FTA is Frontier Flying Service."}}},
{"id":"n-aa06fd62","guard":[["has","vvc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code VVC":"The code VVC is VivaColombia."}}},
{"id":"n-ac1b8d21","guard":[["hasAny",["airline","code","has","icao","pqw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code PQW":"The code PQW is PanAm World Airways."}}},
{"id":"n-accafae0","guard":[["has","ber"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code BER":"The code BER is Air Berlin."}}},
{"id":"n-acf67032","guard":[["has","sxs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code SXS":"The code SXS is SunExpress."}}},
{"id":"n-ad4b8c6d","guard":[["has","lni"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Lion Mentari Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-adabe353","guard":[["hasAny",["airline","fta"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is FTA":"The code FTA is Frontier Flying Service."}}},
{"id":"n-add24705","guard":[["hasAny",["airline","code","name","pfl"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code PFL":"The code PFL is Pacific Flier."}}},
{"id":"n-afa056ef","guard":[["has","blf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code BLF":"The code BLF is Blue1."}}},
{"id":"n-b0179856","guard":[["has","ual"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code UAL":"The code UAL is United Airlines."}}},
{"id":"n-b075a5c2","guard":[["hasAny",["airline","code","has","icao","mna"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code MNA":"The code MNA is Merpati Nusantara Airlines."}}},
{"id":"n-b0ffa37c","guard":[["hasAny",["airline","code","has","hmr","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code HMR":"The code HMR is North American Charters."}}},
{"id":"n-b165eb64","guard":[["has","oae"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code OAE":"The code OAE is Omni Air International."}}},
{"id":"n-b2533b25","guard":[["hasAny",["airline","axb","code","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code AXB":"The code AXB is Air India Express."}}},
{"id":"n-b3002d20","guard":[["hasAny",["airline","vrn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is VRN":"The code VRN is VRG Linhas Aereas."}}},
{"id":"n-b484b47c","guard":[["hasAny",["airline","bta"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is BTA":"The code BTA is ExpressJet."}}},
{"id":"n-b5258563","guard":[["has","iaw"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Iraqi Airways."]},["sense.lastWord"]],"mem":null},
{"id":"n-b7bc82cd","guard":[["hasAny",["airline","jef"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is JEF":"The code JEF is Jetflite."}}},
{"id":"n-b7ca9292","guard":[["hasAny",["airline","ssv"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is SSV":"The code SSV is Skyservice Airlines."}}},
{"id":"n-b8361009","guard":[["hasAny",["airline","code","name","vgn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code VGN":"The code VGN is Virgin Nigeria Airways."}}},
{"id":"n-b84d95f2","guard":[["has","udn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code UDN":"The code UDN is Dniproavia."}}},
{"id":"n-b8c44acf","guard":[["has","kry"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Russkie Krylya."]},["sense.lastWord"]],"mem":null},
{"id":"n-b93573ff","guard":[["has","fab"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is First Air."]},["sense.lastWord"]],"mem":null},
{"id":"n-b97a4988","guard":[["hasAny",["airline","amu"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is AMU":"The code AMU is Air Macau."}}},
{"id":"n-b98c0dc0","guard":[["hasAny",["airline","code","has","icao","rya"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code RYA":"The code RYA is Ryan Air Services."}}},
{"id":"n-bafc26d1","guard":[["has","oom"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code OOM":"The code OOM is Zoom Airlines."}}},
{"id":"n-bbe9c691","guard":[["has","axl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code AXL":"The code AXL is Air Exel."}}},
{"id":"n-bc24d367","guard":[["has","gft"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Gulfstream International Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-bcccea76","guard":[["hasAny",["airline","code","lbc","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code LBC":"The code LBC is Albanian Airlines."}}},
{"id":"n-bcd702f2","guard":[["has","mna"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code MNA":"The code MNA is Merpati Nusantara Airlines."}}},
{"id":"n-bde83c67","guard":[["has","udn"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Dniproavia."]},["sense.lastWord"]],"mem":null},
{"id":"n-c0524795","guard":[["hasAny",["airline","ika"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is IKA":"The code IKA is Itek Air."}}},
{"id":"n-c076214a","guard":[["hasAny",["airline","code","has","icao","sha"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code SHA":"The code SHA is Sharp Airlines."}}},
{"id":"n-c12c39ca","guard":[["hasAny",["airline","code","has","icao","sxs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code SXS":"The code SXS is SunExpress."}}},
{"id":"n-c1688474","guard":[["hasAny",["airline","lmm"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is LMM":"The code LMM is LCM AIRLINES."}}},
{"id":"n-c3f1fc79","guard":[["has","one"],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Oceanair."]},["sense.lastWord"]],"mem":null},
{"id":"n-c43c7b98","guard":[["hasAny",["airline","brg","code","has","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code BRG":"The code BRG is Bering Air."}}},
{"id":"n-c4b62cb2","guard":[["hasAny",["airline","ceb","code","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code CEB":"The code CEB is Cebu Pacific."}}},
{"id":"n-c5855511","guard":[["hasAny",["airline","til"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is TIL":"The code TIL is Tajikistan International Airlines."}}},
{"id":"n-c5e970c6","guard":[["has","one"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code ONE":"The code ONE is Oceanair."}}},
{"id":"n-c61439af","guard":[["has","xsr"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Executive AirShare."]},["sense.lastWord"]],"mem":null},
{"id":"n-c65b3b31","guard":[["has","vgn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code VGN":"The code VGN is Virgin Nigeria Airways."}}},
{"id":"n-c667a509","guard":[["hasAny",["airline","lni"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is LNI":"The code LNI is Lion Mentari Airlines."}}},
{"id":"n-c6ba61ec","guard":[["has","aes"],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ACES Colombia."]},["sense.lastWord"]],"mem":null},
{"id":"n-c742c231","guard":[["hasAny",["airline","ksm"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is KSM":"The code KSM is Kosmos."}}},
{"id":"n-c85c8c9c","guard":[["hasAny",["airline","code","has","icao","ual"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code UAL":"The code UAL is United Airlines."}}},
{"id":"n-c8e5c680","guard":[["has","ssv"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Skyservice Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-c9ca0fbb","guard":[["has","hcw"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Star1 Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-cad83a29","guard":[["has","thk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code THK":"The code THK is Turk Hava Kurumu Hava Taksi Isletmesi."}}},
{"id":"n-cb5bae7e","guard":[["hasAny",["airline","akl","code","has","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code AKL":"The code AKL is Air Kiribati."}}},
{"id":"n-cbc2fdbf","guard":[["hasAny",["airline","cub"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is CUB":"The code CUB is Cubana de Aviación."}}},
{"id":"n-cbdb5b19","guard":[["has","zna"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Zenith International Airline."]},["sense.lastWord"]],"mem":null},
{"id":"n-d071759c","guard":[["has","xau"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["sense.lastWord"]],"mem":null},
{"id":"n-d1192085","guard":[["hasAny",["airline","sgg"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is SGG":"The code SGG is Senegal Airlines."}}},
{"id":"n-d40b3090","guard":[["has","pqw"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is PanAm World Airways."]},["sense.lastWord"]],"mem":null},
{"id":"n-d4e5ff37","guard":[["hasAny",["airline","code","jor","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code JOR":"The code JOR is Blue Air."}}},
{"id":"n-d58758ec","guard":[["hasAny",["airline","code","name","thi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code THI":"The code THI is TransHolding."}}},
{"id":"n-d826bfeb","guard":[["hasAny",["airline","code","has","icao","udn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code UDN":"The code UDN is Dniproavia."}}},
{"id":"n-d82ab5a9","guard":[["has","bze"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is BRAZIL AIR."]},["sense.lastWord"]],"mem":null},
{"id":"n-d8b941ae","guard":[["has","lmm"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LCM AIRLINES."]},["sense.lastWord"]],"mem":null},
{"id":"n-d9646097","guard":[["has","mdo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code MDO":"The code MDO is Domenican Airlines."}}},
{"id":"n-da50760a","guard":[["hasAny",["airline","iaw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is IAW":"The code IAW is Iraqi Airways."}}},
{"id":"n-da8f926e","guard":[["has","blf"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Blue1."]},["sense.lastWord"]],"mem":null},
{"id":"n-dd7a913f","guard":[["hasAny",["airline","code","has","icao","zxy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code ZXY":"The code ZXY is Japan Regio."}}},
{"id":"n-deaafbb3","guard":[["has","kkk"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Atlasjet."]},["sense.lastWord"]],"mem":null},
{"id":"n-e02f54f5","guard":[["has","aui"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Ukraine International Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-e04cf2fe","guard":[["has","akl"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Kiribati."]},["sense.lastWord"]],"mem":null},
{"id":"n-e0b467ef","guard":[["has","sxr"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["sense.lastWord"]],"mem":null},
{"id":"n-e195c44c","guard":[["has","esk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code ESK":"The code ESK is SkyEurope."}}},
{"id":"n-e28ab7b3","guard":[["has","hcc"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Holidays Czech Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-e2aedb5a","guard":[["has","akl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code AKL":"The code AKL is Air Kiribati."}}},
{"id":"n-e39e0b77","guard":[["hasAny",["airline","code","has","icao","zna"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code ZNA":"The code ZNA is Zenith International Airline."}}},
{"id":"n-e5af1f09","guard":[["hasAny",["airline","code","has","icao","mxi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code MXI":"The code MXI is MexicanaLink."}}},
{"id":"n-e616ec40","guard":[["hasAny",["airline","til"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is TIL":"The code TIL is Tajikistan International Airlines."}}},
{"id":"n-e70af63e","guard":[["has","ger"],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is German International Air Lines."]},["sense.lastWord"]],"mem":null},
{"id":"n-e7d6fe43","guard":[["has","knd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code KND":"The code KND is Kan Air."}}},
{"id":"n-e8c25027","guard":[["has","hcw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code HCW":"The code HCW is Star1 Airlines."}}},
{"id":"n-e947efc3","guard":[["has","oae"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Omni Air International."]},["sense.lastWord"]],"mem":null},
{"id":"n-e9bfc820","guard":[["has","pfl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code PFL":"The code PFL is Pacific Flier."}}},
{"id":"n-ebdd2f34","guard":[["has","aes"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code AES":"The code AES is ACES Colombia."}}},
{"id":"n-ecbc02aa","guard":[["has","sgg"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-ed3db5d4","guard":[["hasAny",["airline","arg","code","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code ARG":"The code ARG is Aerolineas Argentinas."}}},
{"id":"n-ed81c674","guard":[["has","abq"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airblue."]},["sense.lastWord"]],"mem":null},
{"id":"n-ee5aeb77","guard":[["has","hbr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code HBR":"The code HBR is Hebradran Air Services."}}},
{"id":"n-ee6c9ed5","guard":[["has","thk"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Turk Hava Kurumu Hava Taksi Isletmesi."]},["sense.lastWord"]],"mem":null},
{"id":"n-eea68697","guard":[["hasAny",["airline","code","has","icao","jkk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code JKK":"The code JKK is Spanair."}}},
{"id":"n-eec81c30","guard":[["has","cub"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Cubana de Aviación."]},["sense.lastWord"]],"mem":null},
{"id":"n-ef16c287","guard":[["has","btq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code BTQ":"The code BTQ is Boutique Air (Priv)."}}},
{"id":"n-efac28a7","guard":[["has","amu"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Macau."]},["sense.lastWord"]],"mem":null},
{"id":"n-effeda3f","guard":[["hasAny",["airline","axl","code","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code AXL":"The code AXL is Air Exel."}}},
{"id":"n-f0374279","guard":[["has","lxp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code LXP":"The code LXP is LAN Express."}}},
{"id":"n-f0bd46be","guard":[["has","kkk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code KKK":"The code KKK is Atlasjet."}}},
{"id":"n-f249177c","guard":[["hasAny",["airline","ndc"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is NDC":"The code NDC is FlyNordic."}}},
{"id":"n-f42722d7","guard":[["hasAny",["airline","code","name","vvc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code VVC":"The code VVC is VivaColombia."}}},
{"id":"n-f48cdae9","guard":[["hasAny",["airline","ant"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what airline is ANT":"The code ANT is Air North Charter - Canada."}}},
{"id":"n-f4b98712","guard":[["hasAny",["airline","code","has","icao","mdo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code MDO":"The code MDO is Domenican Airlines."}}},
{"id":"n-f547b16d","guard":[["has","ger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the airline with the code GER":"The code GER is German International Air Lines."}}},
{"id":"n-f5f3d6d2","guard":[["hasAny",["airline","ndc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is NDC":"The code NDC is FlyNordic."}}},
{"id":"n-f755b395","guard":[["has","bcc"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is BusinessAir."]},["sense.lastWord"]],"mem":null},
{"id":"n-f8d18022","guard":[["has","mxi"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is MexicanaLink."]},["sense.lastWord"]],"mem":null},
{"id":"n-fa0ff449","guard":[["has","pfl"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pacific Flier."]},["sense.lastWord"]],"mem":null},
{"id":"n-fb58a9c4","guard":[["has","jkk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code JKK":"The code JKK is Spanair."}}},
{"id":"n-fc639c5b","guard":[["hasAny",["aes","airline","code","has","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code AES":"The code AES is ACES Colombia."}}},
{"id":"n-fdcabe33","guard":[["hasAny",["airline","code","has","icao","kry"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code KRY":"The code KRY is Russkie Krylya."}}},
{"id":"n-fe857740","guard":[["hasAny",["airline","fab"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is FAB":"The code FAB is First Air."}}},
{"id":"n-feacdc2c","guard":[["hasAny",["airline","code","name","one"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code ONE":"The code ONE is Oceanair."}}},
{"id":"n-fee991cf","guard":[["has","ber"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Berlin."]},["sense.lastWord"]],"mem":null},
{"id":"n-02681fe7","guard":[["hasAny",["lower case","lowercase","njs","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-02fa1340","guard":[["has","fab"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is First Air."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-03502125","guard":[["has","bwa"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Caribbean Airlines."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-03ac48eb","guard":[["hasAny",["ika","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Itek Air."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-083210c7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","say","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ScotAirways."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-08368883","guard":[["hasAny",["fza","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Fuzhou Airlines."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-08a042f9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sxr","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0bcd8bd1","guard":[["hasAny",["ndc","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is FlyNordic."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0d9e7e61","guard":[["hasAny",["lni","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Lion Mentari Airlines."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-109025a9","guard":[["hasAny",["lmm","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LCM AIRLINES."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-13a982a9","guard":[["hasAny",["lower case","lowercase","mwa","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Midwest Airlines (Egypt)."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-13f0e1cd","guard":[["hasAny",["aui","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Ukraine International Airlines."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-17e771db","guard":[["has","amu"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Macau."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-19b47286","guard":[["has","ssv"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Skyservice Airlines."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-1bf93c11","guard":[["has","jef"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Jetflite."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-1cf46fda","guard":[["hasAny",["fza","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Fuzhou Airlines."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1db3e4fb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lmm","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LCM AIRLINES."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2081ac33","guard":[["has","awe"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is America West Airlines."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-224686b0","guard":[["hasAny",["shortest","shortest one","shortest word","vrn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VRG Linhas Aereas."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-24cedc02","guard":[["hasAny",["iaw","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Iraqi Airways."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-25a8b919","guard":[["hasAny",["lower case","lowercase","mph","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2741bb1b","guard":[["hasAny",["no vowels","remove vowels","ssv","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Skyservice Airlines."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-283c2ec7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pel","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aeropelican Air Services."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-288791d6","guard":[["has","mwa"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Midwest Airlines (Egypt)."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-28ac1230","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ndc","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is FlyNordic."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-29aa485c","guard":[["hasAny",["ham","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Haiti Ambassador Airlines."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2c755da7","guard":[["has","vrn"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VRG Linhas Aereas."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-2d6d5da5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fab","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is First Air."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2e3a933b","guard":[["hasAny",["njs","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-304642d6","guard":[["hasAny",["amu","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Macau."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-319fd25c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mph","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-39d7fdea","guard":[["hasAny",["abq","capitalise","capitalize","capitalize each word","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airblue."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3a678960","guard":[["has","mph"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-3be51835","guard":[["has","flg"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-3c02c19f","guard":[["hasAny",["no vowels","remove vowels","sgg","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-3c8b8c9a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fta","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Frontier Flying Service."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3e80b02d","guard":[["hasAny",["ant","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air North Charter - Canada."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3efddd1e","guard":[["hasAny",["bwa","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Caribbean Airlines."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-411beaa2","guard":[["hasAny",["bwa","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Caribbean Airlines."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-41796072","guard":[["hasAny",["lower case","lowercase","small letters","vrn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VRG Linhas Aereas."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-43000439","guard":[["hasAny",["shortest","shortest one","shortest word","til"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Tajikistan International Airlines."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-48ece9a2","guard":[["has","iaw"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Iraqi Airways."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-4a842a7b","guard":[["hasAny",["bvt","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Berjaya Air."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4b050d31","guard":[["has","ant"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air North Charter - Canada."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-4c3b4698","guard":[["hasAny",["awe","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is America West Airlines."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-50575a56","guard":[["hasAny",["ant","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air North Charter - Canada."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5bd6d669","guard":[["has","sxr"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-5e7451f3","guard":[["hasAny",["mph","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-60c8aa6f","guard":[["hasAny",["bta","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-619d0aef","guard":[["has","ham"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Haiti Ambassador Airlines."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-62c2dad2","guard":[["has","njs"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-65187dbc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","xau"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-66478f11","guard":[["has","til"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Tajikistan International Airlines."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-673648ec","guard":[["hasAny",["fta","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Frontier Flying Service."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6b3e230a","guard":[["hasAny",["njs","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-6d6cd533","guard":[["hasAny",["pel","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aeropelican Air Services."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6da52b5c","guard":[["hasAny",["shortest","shortest one","shortest word","ssv"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Skyservice Airlines."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6dbb63e2","guard":[["hasAny",["bvt","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Berjaya Air."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-701dfb9b","guard":[["hasAny",["jef","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Jetflite."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-740f6c95","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cub","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Cubana de Aviación."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-74376c29","guard":[["has","bvt"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Berjaya Air."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-754c5ae4","guard":[["hasAny",["bcc","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is BusinessAir."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-78422bf4","guard":[["hasAny",["lower case","lowercase","pel","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aeropelican Air Services."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-78671609","guard":[["hasAny",["flg","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7cd3af91","guard":[["has","pel"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aeropelican Air Services."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-7f567495","guard":[["has","abq"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airblue."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-7f7f19ed","guard":[["has","xau"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-81ea4ae3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mwa","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Midwest Airlines (Egypt)."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-86882165","guard":[["hasAny",["lower case","lowercase","small letters","ssv"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Skyservice Airlines."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-870c4645","guard":[["hasAny",["amu","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Macau."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-89b401d8","guard":[["hasAny",["ant","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air North Charter - Canada."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-91a16775","guard":[["hasAny",["ksm","lower case","lowercase","small letters"]],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-91fdfa57","guard":[["has","fta"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Frontier Flying Service."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-927ea63b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sgg","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-95f12bb7","guard":[["hasAny",["bwa","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Caribbean Airlines."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-97de3b08","guard":[["hasAny",["ksm","shortest","shortest one","shortest word"]],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9959789e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fza","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Fuzhou Airlines."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9b01af4b","guard":[["hasAny",["lmm","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LCM AIRLINES."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9cdca06f","guard":[["hasAny",["amu","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Macau."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9f7c887e","guard":[["hasAny",["ndc","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is FlyNordic."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-9f9fda4a","guard":[["hasAny",["shortest","shortest one","shortest word","xau"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9fb9bf88","guard":[["hasAny",["flg","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-9fbc91a2","guard":[["has","cub"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Cubana de Aviación."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-a2a2eaa7","guard":[["has","ksm"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-a4464610","guard":[["hasAny",["aui","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Ukraine International Airlines."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a4468132","guard":[["hasAny",["mph","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-a44f15e9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lni","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Lion Mentari Airlines."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a60c4987","guard":[["hasAny",["bcc","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is BusinessAir."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-a68948ff","guard":[["hasAny",["lower case","lowercase","ndc","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is FlyNordic."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a6960eda","guard":[["hasAny",["no vowels","remove vowels","sxr","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-a7822390","guard":[["has","lni"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Lion Mentari Airlines."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-a80ba225","guard":[["hasAny",["bcc","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is BusinessAir."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-aaae9141","guard":[["hasAny",["capitalise","capitalize","capitalize each word","iaw","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Iraqi Airways."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ab2f915b","guard":[["has","lmm"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LCM AIRLINES."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-b11e6052","guard":[["has","ika"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Itek Air."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-b1ced28a","guard":[["hasAny",["ika","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Itek Air."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b6ee4cd9","guard":[["has","bcc"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is BusinessAir."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-b795a35d","guard":[["has","ndc"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is FlyNordic."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-b91374b4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ksm","title case"]],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bbdd055f","guard":[["has","sgg"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-bfafaf17","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jef","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Jetflite."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c15c88d5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","vrn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VRG Linhas Aereas."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c532364a","guard":[["hasAny",["lni","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Lion Mentari Airlines."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c622e488","guard":[["hasAny",["abq","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airblue."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c82a9628","guard":[["hasAny",["jef","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Jetflite."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c8ee1bbc","guard":[["hasAny",["fta","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Frontier Flying Service."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ca5b84e7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ham","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Haiti Ambassador Airlines."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cc1f2f92","guard":[["hasAny",["bta","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cdae15e4","guard":[["hasAny",["fab","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is First Air."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cf44119c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ika","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Itek Air."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d0ac2939","guard":[["hasAny",["ksm","no vowels","remove vowels","without vowels"]],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-d10c10c8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","flg","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d28f0c4d","guard":[["hasAny",["bta","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d38e1e25","guard":[["hasAny",["bvt","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Berjaya Air."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d392558d","guard":[["has","say"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ScotAirways."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-d3eddf56","guard":[["hasAny",["lower case","lowercase","small letters","sxr"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d697d4ec","guard":[["hasAny",["cub","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Cubana de Aviación."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d6dd2bf4","guard":[["hasAny",["lower case","lowercase","sgg","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-da9a74b8","guard":[["hasAny",["lmm","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LCM AIRLINES."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-daaac255","guard":[["hasAny",["abq","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airblue."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-db6e11cb","guard":[["hasAny",["lower case","lowercase","small letters","xau"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-dc916ca9","guard":[["hasAny",["iaw","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Iraqi Airways."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-dea9772d","guard":[["hasAny",["fab","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is First Air."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-dee5ce5d","guard":[["has","fza"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Fuzhou Airlines."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-e31e6df1","guard":[["hasAny",["cub","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Cubana de Aviación."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e48edf25","guard":[["has","aui"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Ukraine International Airlines."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-e50b1888","guard":[["hasAny",["ham","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Haiti Ambassador Airlines."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e62639d6","guard":[["hasAny",["say","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ScotAirways."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e651ede4","guard":[["hasAny",["sgg","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-eb8599c2","guard":[["hasAny",["awe","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is America West Airlines."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ee0dbd37","guard":[["has","bta"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-ee1018ab","guard":[["hasAny",["no vowels","remove vowels","vrn","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VRG Linhas Aereas."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-ef08ca42","guard":[["hasAny",["bvt","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Berjaya Air."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-efd3645e","guard":[["hasAny",["lower case","lowercase","say","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ScotAirways."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f1e7306e","guard":[["hasAny",["lower case","lowercase","small letters","til"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Tajikistan International Airlines."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f2a0d02a","guard":[["hasAny",["awe","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is America West Airlines."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f6e6d77e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","til","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Tajikistan International Airlines."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f8726bd1","guard":[["hasAny",["mwa","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Midwest Airlines (Egypt)."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f98ecef1","guard":[["hasAny",["bcc","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is BusinessAir."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fb6def7d","guard":[["hasAny",["shortest","shortest one","shortest word","sxr"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fc76b386","guard":[["hasAny",["capitalise","capitalize","capitalize each word","njs","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fcd98d66","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ssv","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Skyservice Airlines."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fddf1dd0","guard":[["hasAny",["aui","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Ukraine International Airlines."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-fe8df490","guard":[["hasAny",["flg","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-001aabb6","guard":[["hasAny",["item number","nth","position","ram"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," RAM is Royal Air Maroc."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0328b991","guard":[["hasAny",["awe","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is America West Airlines."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-03d3e320","guard":[["hasAny",["bvt","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Berjaya Air."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-05c8cbb8","guard":[["hasAny",["abq","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airblue."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-0a0c48c9","guard":[["hasAny",["ika","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Itek Air."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-0a830c9c","guard":[["hasAny",["each word","flg","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0b2e8cbc","guard":[["hasAny",["item number","mwa","nth","position"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Midwest Airlines (Egypt)."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-0bdd020c","guard":[["hasAny",["each word","njs","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0e245656","guard":[["hasAny",["lower case","lowercase","small letters","ssv"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Skyservice Airlines."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-10aea7ea","guard":[["hasAny",["item number","jor","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," JOR is Blue Air."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-11c9f5a0","guard":[["hasAny",["arg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ARG is Aerolineas Argentinas."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-12bc5e28","guard":[["hasAny",["bvt","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Berjaya Air."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-141f12bf","guard":[["hasAny",["each word","split into words","xau"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-174895c1","guard":[["hasAny",["item number","knd","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KND is Kan Air."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-17b5dd88","guard":[["hasAny",["item number","jba","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," JBA is Helijet."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-183f6ad1","guard":[["hasAny",["iaw","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Iraqi Airways."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-186336d9","guard":[["hasAny",["amu","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Macau."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-191beaba","guard":[["hasAny",["item number","nth","position","zxy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ZXY is Japan Regio."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1a984a61","guard":[["hasAny",["item number","mld","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MLD is Air Moldova."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1be412c2","guard":[["hasAny",["item number","nth","position","vgn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," VGN is Virgin Nigeria Airways."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1e706f19","guard":[["hasAny",["fta","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Frontier Flying Service."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-201e5b44","guard":[["hasAny",["each word","iaw","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Iraqi Airways."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-216a875e","guard":[["hasAny",["lower case","lowercase","small letters","til"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Tajikistan International Airlines."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-21ed90a2","guard":[["hasAny",["item number","nth","otg","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," OTG is One Two Go Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-22eb37fb","guard":[["hasAny",["amu","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Macau."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-256ad3b0","guard":[["hasAny",["each word","ika","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Itek Air."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2cd62efa","guard":[["hasAny",["each word","fta","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Frontier Flying Service."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2e1354aa","guard":[["hasAny",["bcc","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is BusinessAir."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-3362ee41","guard":[["hasAny",["item number","nth","position","udn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," UDN is Dniproavia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-348ec516","guard":[["hasAny",["each word","fab","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is First Air."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-35646f5b","guard":[["hasAny",["each word","lni","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Lion Mentari Airlines."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-363c8f38","guard":[["hasAny",["item number","nth","oae","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," OAE is Omni Air International."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-36eb3759","guard":[["hasAny",["bwa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Caribbean Airlines."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-380a25aa","guard":[["hasAny",["jef","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Jetflite."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-38627f97","guard":[["hasAny",["esk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ESK is SkyEurope."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3ba47119","guard":[["hasAny",["awe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is America West Airlines."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-3ba8a997","guard":[["hasAny",["item number","nth","position","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," WON is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3ce37e98","guard":[["hasAny",["each word","jef","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Jetflite."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3d848b9a","guard":[["hasAny",["cub","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Cubana de Aviación."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-3f0f74ce","guard":[["hasAny",["flg","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-40723422","guard":[["hasAny",["ksm","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-42c6ebdf","guard":[["hasAny",["each word","split into words","sxr"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-43ea4a6a","guard":[["hasAny",["ceb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CEB is Cebu Pacific."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-457c2d2e","guard":[["hasAny",["lower case","lowercase","small letters","vrn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VRG Linhas Aereas."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-4626c415","guard":[["hasAny",["each word","sgg","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-47eb13f4","guard":[["hasAny",["lower case","lowercase","small letters","sxr"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-48196f92","guard":[["hasAny",["item number","nth","position","xau"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-4953eda1","guard":[["hasAny",["each word","split into words","sxr"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4a4bd3bc","guard":[["hasAny",["item number","lxp","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," LXP is LAN Express."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4b6baed4","guard":[["hasAny",["item number","mic","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MIC is Mint Airways."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4e9e08b1","guard":[["hasAny",["fta","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Frontier Flying Service."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-501328e3","guard":[["hasAny",["item number","nth","position","thi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," THI is TransHolding."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-552316e0","guard":[["hasAny",["item number","nth","position","ual"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," UAL is United Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-57e6d35f","guard":[["hasAny",["each word","fza","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Fuzhou Airlines."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5922722e","guard":[["hasAny",["each word","split into words","ssv"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Skyservice Airlines."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5b2b172e","guard":[["hasAny",["item number","nth","position","xsr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," XSR is Executive AirShare."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5b69c168","guard":[["hasAny",["item number","kkk","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KKK is Atlasjet."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5c23f902","guard":[["hasAny",["btq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BTQ is Boutique Air (Priv)."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5c4362ac","guard":[["hasAny",["lower case","lowercase","njs","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-5da1a04a","guard":[["hasAny",["item number","mdo","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MDO is Domenican Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5fa49947","guard":[["hasAny",["iaw","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Iraqi Airways."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-6016503e","guard":[["hasAny",["abq","each word","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airblue."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6193e6b1","guard":[["hasAny",["item number","nth","position","sqc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SQC is Singapore Airlines Cargo."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-619f5635","guard":[["hasAny",["each word","mph","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-61c7624a","guard":[["hasAny",["each word","iaw","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Iraqi Airways."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-63c3ba04","guard":[["hasAny",["item number","nth","oom","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," OOM is Zoom Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-63f37ee4","guard":[["hasAny",["hcc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HCC is Holidays Czech Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-66867e3f","guard":[["hasAny",["abq","each word","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airblue."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6f207efd","guard":[["hasAny",["item number","nth","position","tns"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TNS is Transilvania."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-70179bf4","guard":[["hasAny",["each word","pel","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aeropelican Air Services."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7165e71f","guard":[["hasAny",["ham","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Haiti Ambassador Airlines."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-74e9aaab","guard":[["hasAny",["ham","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Haiti Ambassador Airlines."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-75c285e9","guard":[["hasAny",["fza","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Fuzhou Airlines."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-782dd8cd","guard":[["hasAny",["item number","nth","position","tht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," THT is Air Tahiti Nui."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7a3a4812","guard":[["hasAny",["lower case","lowercase","say","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ScotAirways."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-7d224c24","guard":[["hasAny",["hcw","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HCW is Star1 Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7e9eeb3c","guard":[["hasAny",["bta","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7f8d34ff","guard":[["hasAny",["each word","flg","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8270c35c","guard":[["hasAny",["each word","mwa","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Midwest Airlines (Egypt)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-829f35e4","guard":[["hasAny",["item number","nth","position","vvc"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," VVC is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-82de2d1a","guard":[["hasAny",["gfy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GFY is Greenfly."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-83deb1f2","guard":[["hasAny",["axl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AXL is Air Exel."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-84b83c6d","guard":[["hasAny",["each word","lmm","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LCM AIRLINES."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-85c4b4c8","guard":[["hasAny",["lower case","lowercase","small letters","xau"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-87f32321","guard":[["hasAny",["each word","pel","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aeropelican Air Services."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8802c19c","guard":[["hasAny",["item number","nth","position","zna"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ZNA is Zenith International Airline."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8879bd5e","guard":[["hasAny",["item number","lni","nth","position"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Lion Mentari Airlines."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-898a15de","guard":[["hasAny",["each word","ham","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Haiti Ambassador Airlines."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8bacb2c4","guard":[["hasAny",["each word","fta","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Frontier Flying Service."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8bf64ee4","guard":[["hasAny",["eal","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," EAL is European Air Express."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8ec30d97","guard":[["hasAny",["bze","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BZE is BRAZIL AIR."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8fdd89c6","guard":[["hasAny",["amu","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Macau."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-90bba3ff","guard":[["hasAny",["aia","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AIA is Avies."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-91a00ba9","guard":[["hasAny",["abq","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airblue."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-94346972","guard":[["hasAny",["ant","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air North Charter - Canada."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-96d8fbc7","guard":[["hasAny",["item number","lbc","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," LBC is Albanian Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-973f05ae","guard":[["hasAny",["bta","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-987e9021","guard":[["hasAny",["blf","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BLF is Blue1."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-989ddb2d","guard":[["hasAny",["lmm","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LCM AIRLINES."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-98e16f07","guard":[["hasAny",["each word","ika","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Itek Air."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9a8f1923","guard":[["hasAny",["item number","nth","position","pqw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PQW is PanAm World Airways."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9aef6cdc","guard":[["hasAny",["fab","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is First Air."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-9b9664a5","guard":[["hasAny",["ant","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air North Charter - Canada."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9bb0af49","guard":[["hasAny",["each word","mwa","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Midwest Airlines (Egypt)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9e5d8427","guard":[["hasAny",["each word","ham","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Haiti Ambassador Airlines."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a0d1e08e","guard":[["hasAny",["item number","nth","position","sol"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SOL is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a165dc53","guard":[["hasAny",["item number","mxi","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MXI is MexicanaLink."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a3293fd0","guard":[["hasAny",["each word","split into words","xau"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a4050bcd","guard":[["hasAny",["item number","jkk","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," JKK is Spanair."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a6265fd2","guard":[["hasAny",["amu","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Macau."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-a76746b4","guard":[["hasAny",["bcc","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is BusinessAir."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-aa2354de","guard":[["hasAny",["lower case","lowercase","mwa","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Midwest Airlines (Egypt)."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ab6dd53c","guard":[["hasAny",["bwa","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Caribbean Airlines."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-acda2962","guard":[["hasAny",["awe","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is America West Airlines."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-aeed2911","guard":[["hasAny",["fab","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is First Air."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-aefbf66a","guard":[["hasAny",["item number","nth","pel","position"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aeropelican Air Services."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-b095daa8","guard":[["hasAny",["aui","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Ukraine International Airlines."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b273bef6","guard":[["hasAny",["each word","sgg","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b2f26925","guard":[["hasAny",["item number","nth","pfl","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PFL is Pacific Flier."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b4f429fc","guard":[["hasAny",["each word","lmm","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LCM AIRLINES."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b5e742b8","guard":[["hasAny",["ant","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air North Charter - Canada."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-b71e6914","guard":[["hasAny",["fza","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Fuzhou Airlines."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-b7bfb823","guard":[["hasAny",["item number","nth","position","sha"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SHA is Sharp Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b845e72d","guard":[["hasAny",["item number","nth","position","say"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ScotAirways."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ba357ae5","guard":[["hasAny",["each word","ksm","split into words"]],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ba988e85","guard":[["hasAny",["item number","nth","position","sxs"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SXS is SunExpress."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bb150a63","guard":[["hasAny",["bwa","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Caribbean Airlines."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-bebfcc98","guard":[["hasAny",["cub","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Cubana de Aviación."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-bf1bf077","guard":[["hasAny",["aui","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Ukraine International Airlines."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-bfc5c484","guard":[["hasAny",["each word","split into words","vrn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VRG Linhas Aereas."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c1d7a073","guard":[["hasAny",["item number","kry","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KRY is Russkie Krylya."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c37153d9","guard":[["hasAny",["item number","nth","position","thk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," THK is Turk Hava Kurumu Hava Taksi Isletmesi."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c3adbcc1","guard":[["hasAny",["each word","lni","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Lion Mentari Airlines."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c49ce33e","guard":[["hasAny",["bta","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-c4a8cb10","guard":[["hasAny",["item number","nth","position","tra"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TRA is Transavia Holland."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c58468ff","guard":[["hasAny",["each word","ksm","split into words"]],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c61bb164","guard":[["hasAny",["gft","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GFT is Gulfstream International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c745029d","guard":[["hasAny",["bvt","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Berjaya Air."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c8558ebd","guard":[["hasAny",["each word","say","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ScotAirways."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ca6b4ff6","guard":[["hasAny",["aui","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Ukraine International Airlines."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cabdeb3c","guard":[["hasAny",["item number","jef","nth","position"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Jetflite."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-cc3a5a06","guard":[["hasAny",["cub","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Cubana de Aviación."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cd87f590","guard":[["hasAny",["each word","mph","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ce3c9bb6","guard":[["hasAny",["aui","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Ukraine International Airlines."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ceb1867c","guard":[["hasAny",["akl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AKL is Air Kiribati."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cf6d04df","guard":[["hasAny",["each word","njs","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d1205da6","guard":[["hasAny",["item number","nth","position","slc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SLC is Salsa d\\\\'Haiti."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d150e148","guard":[["hasAny",["item number","nth","one","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ONE is Oceanair."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d1f7e218","guard":[["hasAny",["ber","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BER is Air Berlin."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d34fdd6f","guard":[["hasAny",["bta","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d69e2128","guard":[["hasAny",["item number","nth","position","pti"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PTI is Privatair."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d6f0d626","guard":[["hasAny",["hmr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HMR is North American Charters."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d771f73b","guard":[["hasAny",["lower case","lowercase","ndc","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is FlyNordic."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-d8bfd46e","guard":[["hasAny",["each word","fab","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is First Air."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d97e10b0","guard":[["hasAny",["item number","nth","obs","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," OBS is Orbest."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-db0f39f0","guard":[["hasAny",["each word","ndc","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is FlyNordic."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dca2e70e","guard":[["hasAny",["item number","nth","position","rya"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," RYA is Ryan Air Services."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-deb8d4f7","guard":[["hasAny",["lower case","lowercase","sgg","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-df64eb45","guard":[["hasAny",["brg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BRG is Bering Air."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e1644c04","guard":[["hasAny",["item number","mah","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MAH is Malév."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e2650e59","guard":[["hasAny",["ger","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GER is German International Air Lines."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e447c524","guard":[["hasAny",["ant","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air North Charter - Canada."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e733df31","guard":[["hasAny",["each word","say","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ScotAirways."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e98936b2","guard":[["hasAny",["each word","split into words","til"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Tajikistan International Airlines."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-eaee306f","guard":[["hasAny",["hbr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HBR is Hebradran Air Services."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ec382aff","guard":[["hasAny",["each word","fza","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Fuzhou Airlines."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ec625b75","guard":[["hasAny",["lni","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Lion Mentari Airlines."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ecdc176c","guard":[["hasAny",["each word","split into words","ssv"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Skyservice Airlines."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ede65aac","guard":[["hasAny",["item number","mna","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MNA is Merpati Nusantara Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ee57f19c","guard":[["hasAny",["item number","nth","position","rla"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," RLA is Airlinair."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-eea56e66","guard":[["hasAny",["awe","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is America West Airlines."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ef1be611","guard":[["hasAny",["each word","split into words","vrn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VRG Linhas Aereas."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ef64cc85","guard":[["hasAny",["ela","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ELA is Eastland Air."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-efef1397","guard":[["hasAny",["lower case","lowercase","pel","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aeropelican Air Services."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-f1360bcd","guard":[["hasAny",["bwa","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Caribbean Airlines."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f3726b6e","guard":[["hasAny",["axb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AXB is Air India Express."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f6dbc7b1","guard":[["hasAny",["item number","nth","pia","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PIA is Pakistan International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f87ae6a2","guard":[["hasAny",["cub","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Cubana de Aviación."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f8cc4d82","guard":[["hasAny",["each word","jef","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Jetflite."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f9828ab4","guard":[["hasAny",["each word","split into words","til"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Tajikistan International Airlines."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f9a49a72","guard":[["hasAny",["lower case","lowercase","mph","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-fb5972e0","guard":[["hasAny",["each word","ndc","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is FlyNordic."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fbabdcf4","guard":[["hasAny",["ika","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Itek Air."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-fc8eab31","guard":[["hasAny",["aes","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AES is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fda78668","guard":[["hasAny",["item number","nth","position","til"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Tajikistan International Airlines."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-fde9ff82","guard":[["hasAny",["bcc","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is BusinessAir."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ffd0f34a","guard":[["hasAny",["doa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," DOA is Dominicana de Aviaci."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-05eb4124","guard":[["hasAny",["item number","nth","position","rya"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ryan Air Services."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-071aacd8","guard":[["hasAny",["aia","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Avies."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-077f9d76","guard":[["hasAny",["item number","nth","position","tra"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transavia Holland."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-0cd11969","guard":[["hasAny",["item number","nth","pfl","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pacific Flier."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-1250b065","guard":[["hasAny",["item number","nth","otg","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is One Two Go Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-177acbcc","guard":[["hasAny",["item number","nth","one","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Oceanair."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-17f5fbf5","guard":[["hasAny",["item number","nth","position","ram"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Royal Air Maroc."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-1b3c6378","guard":[["hasAny",["item number","nth","position","ual"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is United Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-1fa7c9e5","guard":[["hasAny",["arg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Aerolineas Argentinas."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-2854ea70","guard":[["hasAny",["item number","jor","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-2bf456ad","guard":[["hasAny",["item number","nth","oae","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Omni Air International."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-2e65adf3","guard":[["hasAny",["ger","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is German International Air Lines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-3022d99e","guard":[["hasAny",["aes","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-302caf6b","guard":[["hasAny",["doa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dominicana de Aviaci."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-304f12db","guard":[["hasAny",["hcc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Holidays Czech Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-38b243db","guard":[["hasAny",["item number","nth","position","thk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Turk Hava Kurumu Hava Taksi Isletmesi."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-3a849292","guard":[["hasAny",["item number","kry","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Russkie Krylya."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-3bcfc82e","guard":[["hasAny",["item number","nth","position","vvc"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-3dcb64f0","guard":[["hasAny",["item number","mna","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Merpati Nusantara Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-3de1fcbd","guard":[["hasAny",["item number","nth","position","zna"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zenith International Airline."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-44462f40","guard":[["hasAny",["blf","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue1."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-4684e075","guard":[["hasAny",["item number","nth","position","sha"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Sharp Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-4c21e6a9","guard":[["hasAny",["item number","nth","position","vgn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Virgin Nigeria Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-4ed2131d","guard":[["hasAny",["item number","nth","position","xsr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Executive AirShare."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-50f7631c","guard":[["hasAny",["gfy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Greenfly."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-57e54101","guard":[["hasAny",["item number","nth","position","sol"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-58666a58","guard":[["hasAny",["item number","jba","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Helijet."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-5bd9aaf7","guard":[["hasAny",["item number","mxi","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MexicanaLink."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-5fe45e07","guard":[["hasAny",["item number","nth","position","tht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Tahiti Nui."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-638fd66b","guard":[["hasAny",["item number","mld","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Moldova."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-65302b9c","guard":[["hasAny",["eal","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is European Air Express."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-669b16d6","guard":[["hasAny",["item number","mah","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Malév."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-6e7e2b2f","guard":[["hasAny",["hcw","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Star1 Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-7192e7ef","guard":[["hasAny",["hbr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hebradran Air Services."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-79c49ba1","guard":[["hasAny",["esk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SkyEurope."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-7ba4c751","guard":[["hasAny",["item number","nth","position","sxs"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SunExpress."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-80052f86","guard":[["hasAny",["ela","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Eastland Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-81c1c089","guard":[["hasAny",["item number","nth","position","sqc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Singapore Airlines Cargo."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-8424f3f8","guard":[["hasAny",["hmr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is North American Charters."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-87a5dcae","guard":[["hasAny",["ber","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Berlin."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-8c385e22","guard":[["hasAny",["item number","lbc","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Albanian Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-912acaf9","guard":[["hasAny",["item number","nth","position","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-9334a2fe","guard":[["hasAny",["item number","nth","position","slc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Salsa d\\\\'Haiti."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-950ebdd5","guard":[["hasAny",["item number","nth","position","tns"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transilvania."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-950f881b","guard":[["hasAny",["bze","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BRAZIL AIR."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-969f8735","guard":[["hasAny",["item number","nth","position","pqw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PanAm World Airways."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-b256b7b0","guard":[["hasAny",["item number","nth","position","pti"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Privatair."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-b6468166","guard":[["hasAny",["gft","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Gulfstream International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-bab218d6","guard":[["hasAny",["item number","nth","pia","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pakistan International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-bb1b5bff","guard":[["hasAny",["item number","nth","position","zxy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Japan Regio."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-bee7f8ae","guard":[["hasAny",["akl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Kiribati."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-c2d24730","guard":[["hasAny",["ceb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cebu Pacific."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-c737fd1b","guard":[["hasAny",["item number","mdo","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Domenican Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-cae31fca","guard":[["hasAny",["axb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air India Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-cd4188fa","guard":[["hasAny",["item number","nth","position","rla"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Airlinair."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-cfecd2ec","guard":[["hasAny",["item number","nth","position","udn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dniproavia."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-d57478e4","guard":[["hasAny",["item number","kkk","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Atlasjet."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-db8ee35c","guard":[["hasAny",["item number","lxp","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is LAN Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-dc38ea6f","guard":[["hasAny",["axl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Exel."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-dcac78cc","guard":[["hasAny",["brg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Bering Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-e4408a25","guard":[["hasAny",["item number","mic","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Mint Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-e7f53f89","guard":[["hasAny",["btq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Boutique Air (Priv)."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-e8bdc7ed","guard":[["hasAny",["item number","nth","position","thi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TransHolding."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-e9c157fb","guard":[["hasAny",["item number","knd","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kan Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-ec9af077","guard":[["hasAny",["item number","nth","oom","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zoom Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-f142ac95","guard":[["hasAny",["item number","jkk","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Spanair."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-f45eac12","guard":[["hasAny",["item number","nth","obs","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Orbest."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-00790b4e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","eal","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is European Air Express."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-02b3d56e","guard":[["hasAny",["element","item number","jba","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Helijet."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-035daa08","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","oom","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zoom Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-036f2a5d","guard":[["hasAny",["item number","lower case","lowercase","nth","oom","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zoom Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-04169b6c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","tht","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Tahiti Nui."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-044ff623","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","zna"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zenith International Airline."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-073edd97","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","thk","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Turk Hava Kurumu Hava Taksi Isletmesi."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-07579fe7","guard":[["hasAny",["axl","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Exel."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-08b470b1","guard":[["hasAny",["item number","lower case","lowercase","nth","position","ram","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Royal Air Maroc."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0943cddd","guard":[["hasAny",["arg","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Aerolineas Argentinas."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-099dc215","guard":[["hasAny",["element","item number","lxp","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is LAN Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-0b8bdf39","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hcw","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Star1 Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0fd2f322","guard":[["hasAny",["axl","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Exel."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0fe9b9ef","guard":[["hasAny",["gfy","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Greenfly."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-11b85f46","guard":[["hasAny",["item number","lbc","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Albanian Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-128951a1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mic","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Mint Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-13e0b227","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","pqw","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PanAm World Airways."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-160b5667","guard":[["hasAny",["item number","knd","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kan Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-169ffecb","guard":[["hasAny",["element","esk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SkyEurope."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-1aa7e6d7","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","sxs"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SunExpress."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1c1c7e99","guard":[["hasAny",["capitalise","capitalize","capitalize each word","doa","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dominicana de Aviaci."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1d41844c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ela","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Eastland Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1d4a3025","guard":[["hasAny",["item number","lower case","lowercase","mxi","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MexicanaLink."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1e0b1a6e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hcc","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Holidays Czech Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-20a77c30","guard":[["hasAny",["element","item number","nth","position","tht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Tahiti Nui."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-21611257","guard":[["hasAny",["element","item number","mld","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Moldova."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-217082d3","guard":[["hasAny",["aia","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Avies."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-219e498d","guard":[["hasAny",["brg","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Bering Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-21bb685d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mxi","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MexicanaLink."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-23f9946a","guard":[["hasAny",["item number","lower case","lowercase","nth","position","slc","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Salsa d\\\\'Haiti."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-24533fc8","guard":[["hasAny",["ber","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Berlin."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-28d09e8a","guard":[["hasAny",["item number","kkk","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Atlasjet."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2a9eca3d","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2cb78229","guard":[["hasAny",["element","item number","nth","one","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Oceanair."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-2e33bb48","guard":[["hasAny",["element","gft","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Gulfstream International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-30872945","guard":[["hasAny",["btq","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Boutique Air (Priv)."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-30b3212d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","otg","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is One Two Go Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-319cb4d9","guard":[["hasAny",["element","item number","nth","position","ual"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is United Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-335ff0e3","guard":[["hasAny",["element","item number","nth","position","pti"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Privatair."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-35c43401","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hmr","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is North American Charters."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-368a6eed","guard":[["hasAny",["bze","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BRAZIL AIR."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-3833720e","guard":[["hasAny",["element","item number","mic","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Mint Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-3a0e2a51","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","thi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TransHolding."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3a5fa55d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gft","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Gulfstream International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3a9b4b34","guard":[["hasAny",["ceb","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cebu Pacific."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-3b7b6dd6","guard":[["hasAny",["item number","lower case","lowercase","nth","oae","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Omni Air International."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3bf8e76c","guard":[["hasAny",["item number","jor","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3dd68530","guard":[["hasAny",["element","item number","nth","position","sha"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Sharp Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-3deb3c4e","guard":[["hasAny",["element","item number","nth","position","tns"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transilvania."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-3ef9509c","guard":[["hasAny",["item number","lower case","lowercase","mah","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Malév."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3fad5e8a","guard":[["hasAny",["item number","lower case","lowercase","nth","obs","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Orbest."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3fcc94c7","guard":[["hasAny",["axb","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air India Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-40c74bf7","guard":[["hasAny",["ela","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Eastland Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-43cf273d","guard":[["hasAny",["element","ger","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is German International Air Lines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-4451b1a9","guard":[["hasAny",["item number","lower case","lowercase","nth","position","rla","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Airlinair."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4617e5fd","guard":[["hasAny",["item number","lower case","lowercase","mdo","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Domenican Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4679a632","guard":[["hasAny",["item number","lower case","lowercase","nth","position","pti","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Privatair."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4908445a","guard":[["hasAny",["element","item number","mxi","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MexicanaLink."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-4b7425dc","guard":[["hasAny",["item number","lower case","lowercase","mna","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Merpati Nusantara Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4d39099c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","xsr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Executive AirShare."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4d9a9fb0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","udn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dniproavia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4f9c5110","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mah","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Malév."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5288c47f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","tra"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transavia Holland."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5501d1ad","guard":[["hasAny",["arg","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Aerolineas Argentinas."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-575e10b4","guard":[["hasAny",["element","item number","kry","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Russkie Krylya."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-5761ad45","guard":[["hasAny",["item number","lower case","lowercase","nth","position","pqw","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PanAm World Airways."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5876d8f7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","kkk","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Atlasjet."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5a3f20cc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","rla","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Airlinair."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5a761b07","guard":[["hasAny",["axb","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air India Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5b68f73c","guard":[["hasAny",["brg","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Bering Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-5b898f86","guard":[["hasAny",["btq","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Boutique Air (Priv)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5ee753cf","guard":[["hasAny",["eal","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is European Air Express."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-5f6d672f","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","vvc"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5f809f25","guard":[["hasAny",["item number","lower case","lowercase","nth","pfl","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pacific Flier."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-61c6b15b","guard":[["hasAny",["doa","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dominicana de Aviaci."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-63d9790a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ger","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is German International Air Lines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-65275cfb","guard":[["hasAny",["hcc","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Holidays Czech Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6553540a","guard":[["hasAny",["element","item number","nth","position","thi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TransHolding."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-66c28a6e","guard":[["hasAny",["element","item number","nth","obs","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Orbest."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-66e5b285","guard":[["hasAny",["element","item number","nth","position","sqc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Singapore Airlines Cargo."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-66e7a1ba","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","sqc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Singapore Airlines Cargo."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-690addc8","guard":[["hasAny",["akl","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Kiribati."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6c084615","guard":[["hasAny",["aia","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Avies."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6c3caeb5","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","xsr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Executive AirShare."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6eabf343","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","jba","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Helijet."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-70627b5e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","lbc","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Albanian Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-71b39609","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","tht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Tahiti Nui."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-73ae297a","guard":[["hasAny",["element","item number","nth","oae","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Omni Air International."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-743feefc","guard":[["hasAny",["hcw","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Star1 Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-74900571","guard":[["hasAny",["element","item number","nth","position","pqw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PanAm World Airways."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-74925030","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","zxy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Japan Regio."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-75e1d2d8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","jkk","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Spanair."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-76639b29","guard":[["hasAny",["ceb","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cebu Pacific."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-77f91b88","guard":[["hasAny",["element","item number","nth","position","thk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Turk Hava Kurumu Hava Taksi Isletmesi."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-7819c96a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","one","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Oceanair."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-791433f7","guard":[["hasAny",["element","item number","nth","position","zxy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Japan Regio."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-796feef7","guard":[["hasAny",["gft","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Gulfstream International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7a396f0d","guard":[["hasAny",["ger","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is German International Air Lines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7aff92c4","guard":[["hasAny",["element","item number","nth","pia","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pakistan International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-7b2d21b9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","kry","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Russkie Krylya."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7e1c3c3c","guard":[["hasAny",["aes","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-81a1d7c8","guard":[["hasAny",["blf","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue1."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-830f3b91","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","ual"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is United Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-83b4e2a7","guard":[["hasAny",["arg","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Aerolineas Argentinas."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-86613509","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","obs","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Orbest."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-876899a7","guard":[["hasAny",["btq","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Boutique Air (Priv)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-88608ec4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","thi","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TransHolding."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8ba0e63d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","jor","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8f30463d","guard":[["hasAny",["item number","lower case","lowercase","nth","position","sha","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Sharp Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-916f84fc","guard":[["hasAny",["element","item number","nth","pfl","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pacific Flier."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-94d03fc3","guard":[["hasAny",["eal","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is European Air Express."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-953b1d30","guard":[["hasAny",["element","item number","jkk","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Spanair."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-95d9b6cf","guard":[["hasAny",["aes","item number","lower case","lowercase","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-968c0145","guard":[["hasAny",["item number","lower case","lowercase","nth","one","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Oceanair."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9790c79d","guard":[["hasAny",["element","hcc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Holidays Czech Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-97976f79","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","vvc"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-99f429f7","guard":[["hasAny",["akl","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Kiribati."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9bec1782","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","slc","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Salsa d\\\\'Haiti."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9c366c0c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","sxs","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SunExpress."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9ef93248","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","sha","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Sharp Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9fbf69bb","guard":[["hasAny",["item number","lower case","lowercase","nth","otg","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is One Two Go Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a138069b","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","thk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Turk Hava Kurumu Hava Taksi Isletmesi."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a33348f6","guard":[["hasAny",["element","item number","nth","position","vvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-a457c311","guard":[["hasAny",["element","item number","nth","oom","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zoom Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-a5d987d5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","esk","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SkyEurope."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a60f5d28","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","vgn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Virgin Nigeria Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a68216b4","guard":[["hasAny",["element","item number","nth","otg","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is One Two Go Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-a852091a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","pti","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Privatair."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a96b9d53","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","vgn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Virgin Nigeria Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-aab50a13","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","udn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dniproavia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ab6dced3","guard":[["hasAny",["item number","jkk","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Spanair."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ab6fd21f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mna","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Merpati Nusantara Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ab728b58","guard":[["hasAny",["element","item number","nth","position","sxs"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SunExpress."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-ac2cc38b","guard":[["hasAny",["axl","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Exel."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-adfe7755","guard":[["hasAny",["ela","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Eastland Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-aedba944","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","tns"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transilvania."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-aeeb08f1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","oae","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Omni Air International."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-af4096e0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","lxp","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is LAN Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b16093f6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mld","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Moldova."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b45b8189","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","sqc","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Singapore Airlines Cargo."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b5a43d24","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b6a17da6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ceb","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cebu Pacific."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b8021df4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","zxy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Japan Regio."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b8392a1f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","rya","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ryan Air Services."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bebdecdf","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","knd","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kan Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-beeea852","guard":[["hasAny",["item number","lower case","lowercase","nth","position","rya","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ryan Air Services."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c0520387","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","tns"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transilvania."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c0f4186c","guard":[["hasAny",["blf","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue1."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-c1a93598","guard":[["hasAny",["element","item number","mah","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Malév."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-c3b4648c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","ram","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Royal Air Maroc."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c458e500","guard":[["hasAny",["element","item number","nth","position","zna"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zenith International Airline."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-c52a014f","guard":[["hasAny",["element","item number","nth","position","rla"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Airlinair."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-c7bdc3c0","guard":[["hasAny",["element","item number","nth","position","vgn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Virgin Nigeria Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-c855114d","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","zna"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zenith International Airline."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c8ed5b07","guard":[["hasAny",["ber","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Berlin."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-ca0f2177","guard":[["hasAny",["element","item number","lbc","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Albanian Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-ca47ef03","guard":[["hasAny",["aia","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Avies."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-cb30d695","guard":[["hasAny",["element","item number","mdo","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Domenican Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-cc0f0705","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","sol"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cd67d830","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","pia","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pakistan International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cdbb304f","guard":[["hasAny",["element","item number","nth","position","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-ce4b8a50","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","ual"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is United Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cf84fab3","guard":[["hasAny",["hbr","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hebradran Air Services."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cf93a9c1","guard":[["hasAny",["hmr","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is North American Charters."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d3b8d932","guard":[["hasAny",["item number","lower case","lowercase","nth","pia","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pakistan International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d44189b6","guard":[["hasAny",["brg","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Bering Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d5218d12","guard":[["hasAny",["item number","lower case","lowercase","lxp","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is LAN Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d5f41b68","guard":[["hasAny",["item number","jba","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Helijet."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d7104a76","guard":[["hasAny",["element","item number","knd","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kan Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-d7fe2054","guard":[["hasAny",["bze","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BRAZIL AIR."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d8b14df1","guard":[["hasAny",["bze","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BRAZIL AIR."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d9aa7191","guard":[["hasAny",["doa","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dominicana de Aviaci."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-dced53ed","guard":[["hasAny",["element","item number","nth","position","xsr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Executive AirShare."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-dd008939","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gfy","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Greenfly."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-dffaac97","guard":[["hasAny",["element","gfy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Greenfly."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-e1934c55","guard":[["hasAny",["axb","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air India Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-e352a553","guard":[["hasAny",["item number","lower case","lowercase","mld","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Moldova."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e480bb0e","guard":[["hasAny",["element","item number","nth","position","ram"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Royal Air Maroc."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-e54b56d2","guard":[["hasAny",["element","item number","mna","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Merpati Nusantara Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-e8845e2a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","pfl","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pacific Flier."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e939f725","guard":[["hasAny",["element","hbr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hebradran Air Services."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-e94a59e7","guard":[["hasAny",["element","item number","nth","position","udn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dniproavia."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-eae1574a","guard":[["hasAny",["item number","lower case","lowercase","mic","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Mint Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-eba187b1","guard":[["hasAny",["element","item number","jor","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-ec2659ce","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","tra"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transavia Holland."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ed03d6e7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mdo","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Domenican Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ed64638e","guard":[["hasAny",["element","hcw","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Star1 Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-ed8ea958","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hbr","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hebradran Air Services."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f33823c9","guard":[["hasAny",["akl","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Kiribati."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-f412cf2b","guard":[["hasAny",["element","item number","kkk","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Atlasjet."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-f4e82ee3","guard":[["hasAny",["ber","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Berlin."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f82bc50d","guard":[["hasAny",["element","hmr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is North American Charters."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-f86294a0","guard":[["hasAny",["element","item number","nth","position","rya"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ryan Air Services."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-f924bb1c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","sol","title case"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f9909d4b","guard":[["hasAny",["aes","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f99dd8b2","guard":[["hasAny",["esk","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SkyEurope."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-fa7f07cf","guard":[["hasAny",["item number","kry","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Russkie Krylya."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-fc8b2ba3","guard":[["hasAny",["element","item number","nth","position","slc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Salsa d\\\\'Haiti."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-ff6e478e","guard":[["hasAny",["element","item number","nth","position","sol"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-ff8060f0","guard":[["hasAny",["element","item number","nth","position","tra"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transavia Holland."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-ffc72568","guard":[["hasAny",["blf","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue1."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-025cd59e","guard":[["hasAny",["axb","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air India Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-02cb5c84","guard":[["hasAny",["each word","item number","mdo","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Domenican Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-052d07af","guard":[["hasAny",["each word","item number","nth","position","split into words","vgn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Virgin Nigeria Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-06d03cc7","guard":[["hasAny",["item number","lxp","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is LAN Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-06e74041","guard":[["hasAny",["each word","item number","jkk","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Spanair."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0793a4de","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","mah","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Malév."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-0872ec2b","guard":[["hasAny",["akl","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Kiribati."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-0a229747","guard":[["hasAny",["element","item number","lower case","lowercase","mxi","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MexicanaLink."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-0b2ebfb4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","pti","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Privatair."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-0bac4875","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","thk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Turk Hava Kurumu Hava Taksi Isletmesi."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-0d3c279f","guard":[["hasAny",["doa","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dominicana de Aviaci."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0dc1088a","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","zxy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Japan Regio."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-0e950b4e","guard":[["hasAny",["axl","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Exel."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-102a41e8","guard":[["hasAny",["element","item number","lower case","lowercase","mld","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Moldova."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-11a1f23b","guard":[["hasAny",["element","hmr","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is North American Charters."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-12a26756","guard":[["hasAny",["arg","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Aerolineas Argentinas."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-13878fda","guard":[["hasAny",["each word","item number","nth","position","split into words","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-14b4a4b0","guard":[["hasAny",["each word","item number","nth","position","rla","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Airlinair."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-15376443","guard":[["hasAny",["each word","gfy","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Greenfly."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-16bf4aff","guard":[["hasAny",["each word","item number","nth","position","rya","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ryan Air Services."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-17cae514","guard":[["hasAny",["each word","hcc","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Holidays Czech Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-17d6930b","guard":[["hasAny",["ber","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Berlin."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-17ff1225","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","gfy","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Greenfly."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-1865d6ad","guard":[["hasAny",["each word","item number","nth","position","ram","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Royal Air Maroc."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-189f3b28","guard":[["hasAny",["each word","item number","nth","position","split into words","zxy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Japan Regio."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-197573c9","guard":[["hasAny",["each word","item number","nth","one","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Oceanair."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-198fd090","guard":[["hasAny",["item number","mic","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Mint Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1a101582","guard":[["hasAny",["element","item number","lower case","lowercase","mic","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Mint Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-1b6fe421","guard":[["hasAny",["akl","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Kiribati."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-1d0eee00","guard":[["hasAny",["ela","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Eastland Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1d7b9610","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","xsr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Executive AirShare."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-1da8858a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","xsr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Executive AirShare."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-1f18341e","guard":[["hasAny",["item number","nth","position","tra"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transavia Holland."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1f3810f5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","pqw","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PanAm World Airways."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-1f789367","guard":[["hasAny",["each word","item number","nth","oom","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zoom Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1fc52161","guard":[["hasAny",["axl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Exel."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-203d677c","guard":[["hasAny",["each word","item number","mna","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Merpati Nusantara Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-215628f7","guard":[["hasAny",["each word","item number","nth","obs","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Orbest."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-21dc810d","guard":[["hasAny",["hbr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hebradran Air Services."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-22897ff4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","mna","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Merpati Nusantara Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-23f2a9e4","guard":[["hasAny",["item number","nth","position","ram"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Royal Air Maroc."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-24f9a443","guard":[["hasAny",["ber","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Berlin."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-25501420","guard":[["hasAny",["each word","item number","lbc","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Albanian Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-268d25ca","guard":[["hasAny",["each word","hbr","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hebradran Air Services."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-27dd2844","guard":[["hasAny",["each word","item number","nth","position","sha","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Sharp Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-28b95e20","guard":[["hasAny",["aia","each word","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Avies."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2c352e77","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","gft","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Gulfstream International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-2c82eb26","guard":[["hasAny",["each word","ela","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Eastland Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2d7a22fc","guard":[["hasAny",["each word","ger","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is German International Air Lines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2e3a8283","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","udn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dniproavia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-2e6e7be7","guard":[["hasAny",["blf","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue1."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-2ee073c7","guard":[["hasAny",["each word","item number","nth","pia","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pakistan International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2fb411be","guard":[["hasAny",["each word","item number","nth","position","sha","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Sharp Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3192582e","guard":[["hasAny",["element","item number","kkk","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Atlasjet."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-319b1ac9","guard":[["hasAny",["bze","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BRAZIL AIR."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-322024c9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","hcc","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Holidays Czech Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-3346a91d","guard":[["hasAny",["ger","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is German International Air Lines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3376a8ea","guard":[["hasAny",["each word","item number","mah","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Malév."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-34855651","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","thk","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Turk Hava Kurumu Hava Taksi Isletmesi."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-35a9cabe","guard":[["hasAny",["item number","nth","position","rla"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Airlinair."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-35c794a8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","mld","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Moldova."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-35dc3179","guard":[["hasAny",["aes","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-368b676d","guard":[["hasAny",["each word","item number","nth","position","split into words","thk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Turk Hava Kurumu Hava Taksi Isletmesi."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-36e53ace","guard":[["hasAny",["each word","item number","jba","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Helijet."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3719301a","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","sqc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Singapore Airlines Cargo."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-388bbd7e","guard":[["hasAny",["each word","ger","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is German International Air Lines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-38d304a3","guard":[["hasAny",["ceb","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cebu Pacific."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3949185a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","otg","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is One Two Go Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-39a0e37d","guard":[["hasAny",["each word","item number","nth","position","split into words","tra"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transavia Holland."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-39a7d516","guard":[["hasAny",["each word","item number","nth","position","split into words","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-39f67041","guard":[["hasAny",["each word","item number","nth","position","split into words","vvc"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3ac50f80","guard":[["hasAny",["axl","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Exel."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-3bdbae73","guard":[["hasAny",["item number","nth","one","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Oceanair."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3c2aaf5a","guard":[["hasAny",["arg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Aerolineas Argentinas."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3c5503db","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","tra"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transavia Holland."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-3c9deb5e","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","pqw","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PanAm World Airways."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-3cefbde4","guard":[["hasAny",["item number","lbc","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Albanian Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3cf8baca","guard":[["hasAny",["akl","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Kiribati."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3d59f41d","guard":[["hasAny",["each word","item number","nth","position","split into words","udn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dniproavia."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3de83e2c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ceb","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cebu Pacific."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-3e98a0a0","guard":[["hasAny",["blf","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue1."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-40ba0beb","guard":[["hasAny",["ela","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Eastland Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-41ab6471","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","oom","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zoom Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-437db0e9","guard":[["hasAny",["each word","item number","nth","position","split into words","xsr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Executive AirShare."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-43f7a7c3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","sha","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Sharp Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-44e824cf","guard":[["hasAny",["item number","mld","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Moldova."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4535684e","guard":[["hasAny",["element","item number","lbc","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Albanian Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-45672f33","guard":[["hasAny",["each word","item number","lbc","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Albanian Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-45c8ffaf","guard":[["hasAny",["aia","element","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Avies."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-461d2d6b","guard":[["hasAny",["each word","item number","mah","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Malév."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4adfe25b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","eal","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is European Air Express."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-4b9b06e6","guard":[["hasAny",["element","esk","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SkyEurope."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-4c017d72","guard":[["hasAny",["brg","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Bering Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-4c062842","guard":[["hasAny",["each word","item number","nth","pfl","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pacific Flier."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4c70c887","guard":[["hasAny",["each word","gft","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Gulfstream International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4d1b836a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","hbr","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hebradran Air Services."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-4d424967","guard":[["hasAny",["item number","mah","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Malév."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4dbfed24","guard":[["hasAny",["each word","item number","knd","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kan Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4f46d00d","guard":[["hasAny",["aia","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Avies."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4f9e4405","guard":[["hasAny",["esk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SkyEurope."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-50b16238","guard":[["hasAny",["brg","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Bering Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-529e2522","guard":[["hasAny",["axl","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Exel."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-53841bbb","guard":[["hasAny",["each word","hmr","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is North American Charters."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-54ddee18","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","ual"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is United Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-56bc08e4","guard":[["hasAny",["aes","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-57d967b9","guard":[["hasAny",["each word","item number","knd","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kan Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-588b9a33","guard":[["hasAny",["each word","item number","nth","oom","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zoom Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5994b7ad","guard":[["hasAny",["each word","item number","nth","position","sol","split into words"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5a5001e5","guard":[["hasAny",["each word","item number","mic","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Mint Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5b203b48","guard":[["hasAny",["bze","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BRAZIL AIR."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5b251247","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","sol"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-5c298d87","guard":[["hasAny",["akl","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Kiribati."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5d86e9fe","guard":[["hasAny",["axb","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air India Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5dba50f2","guard":[["hasAny",["element","item number","lower case","lowercase","nth","obs","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Orbest."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-5ea142e2","guard":[["hasAny",["element","item number","jkk","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Spanair."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-5f0bbe0a","guard":[["hasAny",["each word","item number","kkk","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Atlasjet."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5f71a9a6","guard":[["hasAny",["each word","hbr","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hebradran Air Services."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5f9768e2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","mic","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Mint Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-5fa8c526","guard":[["hasAny",["each word","item number","nth","position","split into words","sqc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Singapore Airlines Cargo."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-60611ab3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","mdo","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Domenican Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-63e43ec6","guard":[["hasAny",["eal","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is European Air Express."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-65b41061","guard":[["hasAny",["each word","item number","nth","position","pti","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Privatair."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-65f46a37","guard":[["hasAny",["each word","item number","nth","position","slc","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Salsa d\\\\'Haiti."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-66862525","guard":[["hasAny",["each word","item number","kry","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Russkie Krylya."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-66c10354","guard":[["hasAny",["each word","item number","nth","position","split into words","zna"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zenith International Airline."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6c890899","guard":[["hasAny",["ber","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Berlin."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6e3861f9","guard":[["hasAny",["item number","nth","position","vvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6ebd7bc2","guard":[["hasAny",["element","hbr","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hebradran Air Services."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-6f241da9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","doa","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dominicana de Aviaci."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-6fa17926","guard":[["hasAny",["item number","nth","position","vgn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Virgin Nigeria Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-700365d6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","thi","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TransHolding."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-70049f7f","guard":[["hasAny",["each word","eal","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is European Air Express."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-70c7c055","guard":[["hasAny",["brg","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Bering Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7134c75c","guard":[["hasAny",["bze","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BRAZIL AIR."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-718755ca","guard":[["hasAny",["element","item number","lower case","lowercase","nth","oom","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zoom Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-71efe2e1","guard":[["hasAny",["each word","item number","nth","position","split into words","tns"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transilvania."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7208fa01","guard":[["hasAny",["each word","item number","nth","position","split into words","thi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TransHolding."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-72185045","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","jkk","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Spanair."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-724afb85","guard":[["hasAny",["each word","esk","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SkyEurope."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7316c4dd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","vvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-7404f35b","guard":[["hasAny",["element","item number","knd","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kan Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-74fa796e","guard":[["hasAny",["element","item number","jba","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Helijet."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-77b435da","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","rya","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ryan Air Services."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-7848df68","guard":[["hasAny",["element","ger","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is German International Air Lines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-784fa258","guard":[["hasAny",["btq","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Boutique Air (Priv)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-78a56924","guard":[["hasAny",["each word","item number","nth","position","split into words","zna"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zenith International Airline."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7946bd1b","guard":[["hasAny",["each word","item number","nth","position","sol","split into words"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-79a1bebe","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","pia","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pakistan International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-7eb0a04f","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","ual"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is United Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-803083ae","guard":[["hasAny",["doa","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dominicana de Aviaci."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-81318951","guard":[["hasAny",["each word","item number","nth","position","split into words","sxs"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SunExpress."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-81aa47ed","guard":[["hasAny",["each word","item number","jba","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Helijet."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-81fc6f8a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","pfl","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pacific Flier."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-82c46c58","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","esk","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SkyEurope."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-82e8c997","guard":[["hasAny",["each word","esk","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SkyEurope."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-839eb4ed","guard":[["hasAny",["element","item number","lower case","lowercase","lxp","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is LAN Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-845f1c9a","guard":[["hasAny",["each word","item number","jor","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-84dd279a","guard":[["hasAny",["item number","nth","pia","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pakistan International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-85b9ed5a","guard":[["hasAny",["axl","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Exel."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-86df7e2d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","lxp","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is LAN Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-8942c32b","guard":[["hasAny",["ber","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Berlin."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-8995b80f","guard":[["hasAny",["each word","item number","nth","oae","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Omni Air International."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8a417c02","guard":[["hasAny",["each word","item number","mld","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Moldova."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8a4c1336","guard":[["hasAny",["each word","item number","nth","position","split into words","vgn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Virgin Nigeria Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8a90ed61","guard":[["hasAny",["each word","item number","nth","position","split into words","vvc"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8abdb3c9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","knd","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kan Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-8b0018b8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","hcw","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Star1 Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-8c3676dd","guard":[["hasAny",["each word","item number","lxp","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is LAN Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8d4be05f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","tht","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Tahiti Nui."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-8e1872d3","guard":[["hasAny",["item number","nth","pfl","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pacific Flier."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8f518312","guard":[["hasAny",["each word","item number","nth","position","pqw","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PanAm World Airways."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-90493ec8","guard":[["hasAny",["each word","item number","nth","position","split into words","sxs"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SunExpress."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-91371f5e","guard":[["hasAny",["doa","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dominicana de Aviaci."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-913b8220","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-918315ea","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","sha","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Sharp Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-91a0b1f6","guard":[["hasAny",["each word","item number","nth","position","split into words","xsr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Executive AirShare."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-91a1e94b","guard":[["hasAny",["item number","nth","oom","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zoom Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-91de7ddd","guard":[["hasAny",["element","hcw","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Star1 Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-94c9bdf5","guard":[["hasAny",["arg","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Aerolineas Argentinas."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-970fa5b7","guard":[["hasAny",["each word","item number","kry","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Russkie Krylya."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-976f76c9","guard":[["hasAny",["element","item number","lower case","lowercase","mdo","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Domenican Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-97be3406","guard":[["hasAny",["each word","eal","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is European Air Express."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-995681d2","guard":[["hasAny",["aia","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Avies."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-99df9be4","guard":[["hasAny",["each word","hcw","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Star1 Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-99f51764","guard":[["hasAny",["item number","nth","position","thi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TransHolding."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9b9f16ee","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","mxi","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MexicanaLink."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-9c4e8e6b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","kry","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Russkie Krylya."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-9cf74bf9","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","rla","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Airlinair."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-9deb77cd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","rya","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ryan Air Services."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-9f143a28","guard":[["hasAny",["each word","item number","nth","position","split into words","udn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dniproavia."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9fbbc1cd","guard":[["hasAny",["each word","hcw","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Star1 Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9fc828fa","guard":[["hasAny",["blf","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue1."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9ff01e96","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","vgn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Virgin Nigeria Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-a0d2bc29","guard":[["hasAny",["each word","item number","nth","position","split into words","thi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TransHolding."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a10144e6","guard":[["hasAny",["each word","item number","nth","position","split into words","zxy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Japan Regio."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a16b6cc8","guard":[["hasAny",["each word","item number","nth","one","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Oceanair."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a3b69e1f","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","vvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-a441bf77","guard":[["hasAny",["axb","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air India Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a4d49516","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","tns"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transilvania."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-a5d014b9","guard":[["hasAny",["each word","item number","nth","position","split into words","thk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Turk Hava Kurumu Hava Taksi Isletmesi."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a69239a7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","zna"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zenith International Airline."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-a6d68c38","guard":[["hasAny",["each word","item number","nth","position","split into words","tns"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transilvania."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a6e854fa","guard":[["hasAny",["element","item number","lower case","lowercase","nth","pfl","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pacific Flier."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-a710ad97","guard":[["hasAny",["each word","item number","nth","otg","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is One Two Go Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a76b0f4a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","udn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dniproavia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-a8411230","guard":[["hasAny",["each word","item number","nth","pia","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pakistan International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a851d2a1","guard":[["hasAny",["each word","item number","nth","otg","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is One Two Go Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a9076790","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","kkk","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Atlasjet."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-aa2978e5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","slc","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Salsa d\\\\'Haiti."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-aa79d143","guard":[["hasAny",["each word","item number","mic","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Mint Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-aa83c574","guard":[["hasAny",["element","item number","lower case","lowercase","nth","otg","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is One Two Go Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-aba1589d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","jor","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-acc20ded","guard":[["hasAny",["btq","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Boutique Air (Priv)."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ae1a8242","guard":[["hasAny",["each word","item number","nth","position","split into words","ual"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is United Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b00654a3","guard":[["hasAny",["each word","gft","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Gulfstream International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b067100b","guard":[["hasAny",["ceb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cebu Pacific."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b3f6a24d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ela","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Eastland Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-b4d9fd17","guard":[["hasAny",["blf","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue1."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-b52e54ab","guard":[["hasAny",["element","hcc","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Holidays Czech Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-b549d1e4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","ram","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Royal Air Maroc."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-b5c1ea8b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","jba","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Helijet."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-b645d05c","guard":[["hasAny",["item number","nth","obs","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Orbest."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b8ba2b5c","guard":[["hasAny",["element","item number","lower case","lowercase","nth","oae","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Omni Air International."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-b8f7b9b3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-b9f5fca2","guard":[["hasAny",["each word","item number","kkk","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Atlasjet."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bb239f2e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","hmr","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is North American Charters."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-bb6fdbbd","guard":[["hasAny",["each word","item number","nth","pfl","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pacific Flier."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bcd5b9f9","guard":[["hasAny",["btq","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Boutique Air (Priv)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-befb6d51","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","ger","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is German International Air Lines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-bf1ab515","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","zxy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Japan Regio."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-bf721b81","guard":[["hasAny",["each word","item number","mxi","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MexicanaLink."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c34f4463","guard":[["hasAny",["bze","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BRAZIL AIR."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-c3632d14","guard":[["hasAny",["ceb","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cebu Pacific."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-c522df16","guard":[["hasAny",["aes","each word","item number","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c7358eaf","guard":[["hasAny",["each word","item number","nth","obs","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Orbest."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c7487c99","guard":[["hasAny",["axb","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air India Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-c9d2e32c","guard":[["hasAny",["arg","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Aerolineas Argentinas."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-ca5a5d4b","guard":[["hasAny",["aia","each word","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Avies."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ca957b61","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","sqc","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Singapore Airlines Cargo."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-cb4927c2","guard":[["hasAny",["element","gfy","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Greenfly."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-cbe5f5da","guard":[["hasAny",["each word","item number","nth","oae","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Omni Air International."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cd37d35e","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","tht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Tahiti Nui."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-cd61f47e","guard":[["hasAny",["each word","item number","nth","position","split into words","tra"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transavia Holland."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cf433e8b","guard":[["hasAny",["element","item number","lower case","lowercase","nth","pia","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pakistan International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-d0877c1b","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","ram","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Royal Air Maroc."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-d114ba1b","guard":[["hasAny",["each word","item number","nth","position","ram","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Royal Air Maroc."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d1c85d5a","guard":[["hasAny",["element","item number","lower case","lowercase","nth","one","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Oceanair."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-d20a391d","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","sxs"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SunExpress."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-d42045de","guard":[["hasAny",["each word","item number","jkk","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Spanair."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d584d3fb","guard":[["hasAny",["item number","nth","position","pti"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Privatair."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d5faa709","guard":[["hasAny",["each word","item number","nth","position","split into words","ual"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is United Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d68b6545","guard":[["hasAny",["each word","item number","nth","position","slc","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Salsa d\\\\'Haiti."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d77725dd","guard":[["hasAny",["ceb","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cebu Pacific."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d862fdba","guard":[["hasAny",["each word","item number","mld","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Moldova."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d91cb759","guard":[["hasAny",["aes","each word","item number","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d9ef3fce","guard":[["hasAny",["each word","item number","nth","position","rya","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ryan Air Services."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-db5419ca","guard":[["hasAny",["element","item number","lower case","lowercase","mah","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Malév."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-dbab05be","guard":[["hasAny",["element","item number","lower case","lowercase","mna","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Merpati Nusantara Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-dbdd3096","guard":[["hasAny",["item number","nth","position","tht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Tahiti Nui."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dbf25bbb","guard":[["hasAny",["each word","item number","mxi","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MexicanaLink."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dd80a573","guard":[["hasAny",["each word","ela","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Eastland Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e18571c9","guard":[["hasAny",["each word","hcc","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Holidays Czech Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e250f7a6","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","slc","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Salsa d\\\\'Haiti."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-e334ce1e","guard":[["hasAny",["each word","hmr","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is North American Charters."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e44bf6b4","guard":[["hasAny",["element","gft","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Gulfstream International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-e65fc323","guard":[["hasAny",["each word","item number","nth","position","pti","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Privatair."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e78624cc","guard":[["hasAny",["axb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air India Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e78d1eb6","guard":[["hasAny",["each word","gfy","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Greenfly."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e89f1fef","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","sol","title case"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-eaa470f2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","obs","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Orbest."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-eaea9482","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","lbc","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Albanian Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-eb275474","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","pti","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Privatair."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-ecc38723","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","sxs","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SunExpress."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-ed19daeb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","oae","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Omni Air International."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-eda5de8e","guard":[["hasAny",["each word","item number","mna","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Merpati Nusantara Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-edd2b4d7","guard":[["hasAny",["btq","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Boutique Air (Priv)."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f03a06fd","guard":[["hasAny",["item number","nth","otg","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is One Two Go Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f0697212","guard":[["hasAny",["arg","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Aerolineas Argentinas."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f08cc0a6","guard":[["hasAny",["element","item number","jor","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-f0c41372","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","one","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Oceanair."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-f0ffa07c","guard":[["hasAny",["brg","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Bering Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-f192e26a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","rla","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Airlinair."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-f2b0972e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","tns"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transilvania."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-f3aff6a5","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","thi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TransHolding."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-f3b60e87","guard":[["hasAny",["each word","item number","nth","position","pqw","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PanAm World Airways."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f4812958","guard":[["hasAny",["gft","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Gulfstream International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f4fc0d0d","guard":[["hasAny",["item number","nth","position","slc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Salsa d\\\\'Haiti."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f5b81ddb","guard":[["hasAny",["each word","item number","lxp","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is LAN Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f740ab44","guard":[["hasAny",["item number","knd","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kan Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f7afe4de","guard":[["hasAny",["item number","jor","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fa84d8bb","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","zna"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zenith International Airline."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-fac6849d","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","tra"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transavia Holland."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-fb23cb9e","guard":[["hasAny",["ber","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Berlin."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fc9a4fda","guard":[["hasAny",["each word","item number","mdo","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Domenican Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fd4de2a3","guard":[["hasAny",["element","item number","kry","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Russkie Krylya."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-fdcaacb4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","vgn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Virgin Nigeria Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-fe1408f1","guard":[["hasAny",["each word","item number","jor","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fe7886f7","guard":[["hasAny",["each word","item number","nth","position","split into words","tht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Tahiti Nui."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-feb45d17","guard":[["hasAny",["each word","item number","nth","position","split into words","tht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Tahiti Nui."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-feb83ebf","guard":[["hasAny",["each word","item number","nth","position","rla","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Airlinair."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ffaa1386","guard":[["hasAny",["each word","item number","nth","position","split into words","sqc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Singapore Airlines Cargo."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-127c8b12","guard":[["hasAny",["each word","element","hcw","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Star1 Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-12a72fd5","guard":[["hasAny",["each word","element","item number","kry","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Russkie Krylya."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-1730e8b4","guard":[["hasAny",["each word","element","hcc","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Holidays Czech Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-1d27551e","guard":[["hasAny",["each word","eal","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is European Air Express."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-255af8f7","guard":[["hasAny",["each word","element","item number","nth","position","split into words","words","xsr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Executive AirShare."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-2748c8c2","guard":[["hasAny",["bze","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BRAZIL AIR."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-2cf06410","guard":[["hasAny",["each word","element","item number","nth","position","sol","split into words","words"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-30283d43","guard":[["hasAny",["akl","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Kiribati."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-3fc37118","guard":[["hasAny",["aes","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-450bdf29","guard":[["hasAny",["each word","element","hmr","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is North American Charters."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-45f94523","guard":[["hasAny",["each word","element","item number","jkk","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Spanair."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-4f900473","guard":[["hasAny",["each word","element","item number","mdo","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Domenican Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-54baa3c5","guard":[["hasAny",["each word","element","gfy","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Greenfly."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-590f95c7","guard":[["hasAny",["each word","element","item number","nth","position","split into words","sxs","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SunExpress."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-5bd1a702","guard":[["hasAny",["brg","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Bering Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-733c9cb4","guard":[["hasAny",["each word","element","item number","nth","position","split into words","tns","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transilvania."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-7fd07ed0","guard":[["hasAny",["each word","element","item number","nth","position","rya","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ryan Air Services."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-8628cbf3","guard":[["hasAny",["each word","element","item number","nth","position","split into words","udn","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dniproavia."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-869fb691","guard":[["hasAny",["each word","element","item number","nth","position","split into words","sqc","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Singapore Airlines Cargo."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-8786b1b8","guard":[["hasAny",["each word","element","item number","nth","oae","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Omni Air International."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-8dc2a260","guard":[["hasAny",["each word","element","item number","nth","position","split into words","ual","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is United Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-985e6581","guard":[["hasAny",["each word","element","item number","mxi","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MexicanaLink."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-9d25caea","guard":[["hasAny",["btq","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Boutique Air (Priv)."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-a1c71079","guard":[["hasAny",["each word","element","item number","nth","position","split into words","won","words"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-a9e3fd5c","guard":[["hasAny",["each word","element","item number","nth","position","split into words","thk","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Turk Hava Kurumu Hava Taksi Isletmesi."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-b5212aeb","guard":[["hasAny",["each word","element","item number","nth","position","pqw","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PanAm World Airways."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-b97b4aca","guard":[["hasAny",["doa","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dominicana de Aviaci."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-cc217ad3","guard":[["hasAny",["each word","element","item number","nth","position","split into words","words","zna"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zenith International Airline."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-d9460903","guard":[["hasAny",["each word","element","item number","nth","position","split into words","words","zxy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Japan Regio."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-dd781cf8","guard":[["hasAny",["each word","element","item number","jba","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Helijet."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-e8601d79","guard":[["hasAny",["blf","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue1."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-f00a7d04","guard":[["hasAny",["each word","element","item number","mna","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Merpati Nusantara Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-f0e09d44","guard":[["hasAny",["each word","element","item number","kkk","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Atlasjet."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-fc7444ed","guard":[["hasAny",["each word","element","item number","nth","position","sha","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Sharp Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the airline with the code HBR","expect":{"contains":["Hebradran Air Services"],"notRefusal":true}},{"q":"name the airline with the code AIA","expect":{"contains":["Avies"],"notRefusal":true}},{"q":"name the airline with the code AXL","expect":{"contains":["Air Exel"],"notRefusal":true}},{"q":"name the airline with the code ONE","expect":{"contains":["Oceanair"],"notRefusal":true}},{"q":"name the airline with the code RLA","expect":{"contains":["Airlinair"],"notRefusal":true}},{"q":"what airline is SSV","expect":{"contains":["Skyservice Airlines"],"notRefusal":true}},{"q":"which airline has the ICAO code HCW","expect":{"contains":["Star1 Airlines"],"notRefusal":true}},{"q":"what airline is ANT","expect":{"contains":["Air North Charter - Canada"],"notRefusal":true}},{"q":"what airline is NDC","expect":{"contains":["FlyNordic"],"notRefusal":true}},{"q":"name the airline with the code SLC","expect":{"contains":["Salsa d\\\\'Haiti"],"notRefusal":true}},{"q":"what airline is AMU","expect":{"contains":["Air Macau"],"notRefusal":true}},{"q":"what airline is FAB","expect":{"contains":["First Air"],"notRefusal":true}},{"q":"what airline is IKA","expect":{"contains":["Itek Air"],"notRefusal":true}},{"q":"name the airline with the code KND","expect":{"contains":["Kan Air"],"notRefusal":true}},{"q":"which airline has the ICAO code GFY","expect":{"contains":["Greenfly"],"notRefusal":true}},{"q":"what airline is TIL","expect":{"contains":["Tajikistan International Airlines"],"notRefusal":true}},{"q":"which airline has the ICAO code SOL","expect":{"contains":["Solomon Airlines"],"notRefusal":true}},{"q":"which airline has the ICAO code RYA","expect":{"contains":["Ryan Air Services"],"notRefusal":true}},{"q":"which airline has the ICAO code UAL","expect":{"contains":["United Airlines"],"notRefusal":true}},{"q":"which airline has the ICAO code AES","expect":{"contains":["ACES Colombia"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
