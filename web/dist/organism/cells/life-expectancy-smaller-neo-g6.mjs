// life-expectancy-smaller-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"life-expectancy-smaller-neo-g6","class":"life-expectancy-smaller","generation":6,"lane":"neo","grownFrom":["whose life expectancy is smaller: Syria or Uganda","between Trinidad and Tobago and South Korea, which has the lesser life expectancy","which has the smaller life expectancy, Nauru or Jamaica","between Sudan and Saint Vincent and the Grenadines, which has the lesser life expectancy","which has the smaller life expectancy, Ecuador or Czech Republic","which has the smaller life expectancy, Tajikistan or Israel","whose life expectancy is smaller: Barbados or Malawi","between Somalia and Lesotho, which has the lesser life expectancy","between Morocco and Iceland, which has the lesser life expectancy","whose life expectancy is smaller: Luxembourg or Kyrgyzstan","which has the smaller life expectancy, Mauritania or Lebanon","between Denmark and Panama, which has the lesser life expectancy","whose life expectancy is smaller: Bhutan or Tonga","between Mali and Bolivia, which has the lesser life expectancy","between Saint Helena and Luxembourg, which has the lesser life expectancy","which has the smaller life expectancy, Grenada or Kuwait","whose life expectancy is smaller: Afghanistan or Tajikistan","which has the smaller life expectancy, Kenya or Libya","whose life expectancy is smaller: Lesotho or Turkey","which has the smaller life expectancy, Uganda or Morocco"],"version":1});

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
{"id":"n-52486d9b","guard":[["has","expectancy"],["not",["has","of"]],["not",["has","larger"]],["not",["has","greater"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Trinidad and Tobago and South Korea, which has the lesser life expectancy":"Trinidad and Tobago has the smaller life expectancy (68 years against 74.4 years).","whose life expectancy is smaller: Syria or Uganda":"Uganda has the smaller life expectancy (42.9 years against 68.5 years).","which has the smaller life expectancy, Nauru or Jamaica":"Nauru has the smaller life expectancy (60.8 years against 75.2 years).","between Sudan and Saint Vincent and the Grenadines, which has the lesser life expectancy":"Sudan has the smaller life expectancy (56.6 years against 72.3 years).","which has the smaller life expectancy, Ecuador or Czech Republic":"Ecuador has the smaller life expectancy (71.1 years against 74.5 years).","which has the smaller life expectancy, Tajikistan or Israel":"Tajikistan has the smaller life expectancy (64.1 years against 78.6 years).","whose life expectancy is smaller: Barbados or Malawi":"Malawi has the smaller life expectancy (37.6 years against 73 years).","between Somalia and Lesotho, which has the lesser life expectancy":"Somalia has the smaller life expectancy (46.2 years against 50.8 years).","between Morocco and Iceland, which has the lesser life expectancy":"Morocco has the smaller life expectancy (69.1 years against 79.4 years).","whose life expectancy is smaller: Luxembourg or Kyrgyzstan":"Kyrgyzstan has the smaller life expectancy (63.4 years against 77.1 years).","which has the smaller life expectancy, Mauritania or Lebanon":"Mauritania has the smaller life expectancy (50.8 years against 71.3 years).","between Denmark and Panama, which has the lesser life expectancy":"Panama has the smaller life expectancy (75.5 years against 76.5 years).","whose life expectancy is smaller: Bhutan or Tonga":"Bhutan has the smaller life expectancy (52.4 years against 67.9 years).","between Mali and Bolivia, which has the lesser life expectancy":"Mali has the smaller life expectancy (46.7 years against 63.7 years).","between Saint Helena and Luxembourg, which has the lesser life expectancy":"Saint Helena has the smaller life expectancy (76.8 years against 77.1 years).","which has the smaller life expectancy, Grenada or Kuwait":"Grenada has the smaller life expectancy (64.5 years against 76.1 years).","whose life expectancy is smaller: Afghanistan or Tajikistan":"Afghanistan has the smaller life expectancy (45.9 years against 64.1 years).","which has the smaller life expectancy, Kenya or Libya":"Kenya has the smaller life expectancy (48 years against 75.5 years).","whose life expectancy is smaller: Lesotho or Turkey":"Lesotho has the smaller life expectancy (50.8 years against 71 years).","which has the smaller life expectancy, Uganda or Morocco":"Uganda has the smaller life expectancy (42.9 years against 69.1 years).","which has the smaller life expectancy, Cook Islands or Uruguay":"Cook Islands has the smaller life expectancy (71.1 years against 75.2 years).","which has the smaller life expectancy, Vanuatu or Indonesia":"Vanuatu has the smaller life expectancy (60.6 years against 70.1 years).","between Libya and Thailand, which has the lesser life expectancy":"Thailand has the smaller life expectancy (68.6 years against 75.5 years).","whose life expectancy is smaller: Thailand or Reunion":"Thailand has the smaller life expectancy (68.6 years against 72.7 years).","between Russia and Equatorial Guinea, which has the lesser life expectancy":"Equatorial Guinea has the smaller life expectancy (53.6 years against 67.2 years).","between Lebanon and Hong Kong, which has the lesser life expectancy":"Lebanon has the smaller life expectancy (71.3 years against 79.5 years).","between Ethiopia and Cameroon, which has the lesser life expectancy":"Ethiopia has the smaller life expectancy (45.2 years against 54.8 years).","which has the smaller life expectancy, Myanmar or El Salvador":"Myanmar has the smaller life expectancy (54.9 years against 69.7 years).","whose life expectancy is smaller: Guatemala or Suriname":"Guatemala has the smaller life expectancy (66.2 years against 71.4 years).","which has the smaller life expectancy, Bermuda or Bulgaria":"Bulgaria has the smaller life expectancy (70.9 years against 76.9 years).","whose life expectancy is smaller: Panama or Argentina":"Argentina has the smaller life expectancy (75.1 years against 75.5 years).","between Czech Republic and Greenland, which has the lesser life expectancy":"Greenland has the smaller life expectancy (68.1 years against 74.5 years).","whose life expectancy is smaller: Greenland or Montserrat":"Greenland has the smaller life expectancy (68.1 years against 78 years).","which has the smaller life expectancy, Costa Rica or Belarus":"Belarus has the smaller life expectancy (68 years against 75.8 years).","between Jamaica and Madagascar, which has the lesser life expectancy":"Madagascar has the smaller life expectancy (55 years against 75.2 years).","between Guinea-Bissau and Bhutan, which has the lesser life expectancy":"Guinea-Bissau has the smaller life expectancy (49 years against 52.4 years).","whose life expectancy is smaller: Angola or Bermuda":"Angola has the smaller life expectancy (38.3 years against 76.9 years).","which has the smaller life expectancy, Portugal or Mali":"Mali has the smaller life expectancy (46.7 years against 75.8 years).","whose life expectancy is smaller: Greece or French Polynesia":"French Polynesia has the smaller life expectancy (74.8 years against 78.4 years).","which has the smaller life expectancy, Ghana or Liberia":"Liberia has the smaller life expectancy (51 years against 57.4 years).","which has the smaller life expectancy, Slovenia or Trinidad and Tobago":"Trinidad and Tobago has the smaller life expectancy (68 years against 74.9 years).","between Bulgaria and Mauritius, which has the lesser life expectancy":"Bulgaria has the smaller life expectancy (70.9 years against 71 years).","whose life expectancy is smaller: Mauritius or Belgium":"Mauritius has the smaller life expectancy (71 years against 77.8 years).","which has the smaller life expectancy, Bangladesh or Russia":"Bangladesh has the smaller life expectancy (60.2 years against 67.2 years).","which has the smaller life expectancy, East Timor or Yemen":"East Timor has the smaller life expectancy (46 years against 59.8 years).","whose life expectancy is smaller: Honduras or Aruba":"Honduras has the smaller life expectancy (69.9 years against 78.4 years).","which has the smaller life expectancy, Qatar or Denmark":"Qatar has the smaller life expectancy (72.4 years against 76.5 years).","which has the smaller life expectancy, Reunion or Nepal":"Nepal has the smaller life expectancy (57.8 years against 72.7 years).","between Vietnam and Guatemala, which has the lesser life expectancy":"Guatemala has the smaller life expectancy (66.2 years against 69.3 years).","which has the smaller life expectancy, Montserrat or Ethiopia":"Ethiopia has the smaller life expectancy (45.2 years against 78 years).","which has the smaller life expectancy, Belgium or Saint Helena":"Saint Helena has the smaller life expectancy (76.8 years against 77.8 years).","between Nepal and Puerto Rico, which has the lesser life expectancy":"Nepal has the smaller life expectancy (57.8 years against 75.6 years).","between Albania and Burkina Faso, which has the lesser life expectancy":"Burkina Faso has the smaller life expectancy (46.7 years against 71.6 years).","between Iran and Barbados, which has the lesser life expectancy":"Iran has the smaller life expectancy (69.7 years against 73 years).","which has the smaller life expectancy, Romania or Malta":"Romania has the smaller life expectancy (69.9 years against 77.9 years).","between El Salvador and Samoa, which has the lesser life expectancy":"Samoa has the smaller life expectancy (69.2 years against 69.7 years).","which has the smaller life expectancy, Kyrgyzstan or Sudan":"Sudan has the smaller life expectancy (56.6 years against 63.4 years).","whose life expectancy is smaller: Tuvalu or East Timor":"East Timor has the smaller life expectancy (46 years against 66.3 years).","between Belarus and Djibouti, which has the lesser life expectancy":"Djibouti has the smaller life expectancy (50.8 years against 68 years).","whose life expectancy is smaller: Puerto Rico or Qatar":"Qatar has the smaller life expectancy (72.4 years against 75.6 years).","between Guyana and Laos, which has the lesser life expectancy":"Laos has the smaller life expectancy (53.1 years against 64 years).","which has the smaller life expectancy, Suriname or Ukraine":"Ukraine has the smaller life expectancy (66 years against 71.4 years).","between Israel and Syria, which has the lesser life expectancy":"Syria has the smaller life expectancy (68.5 years against 78.6 years).","whose life expectancy is smaller: United States or Zambia":"Zambia has the smaller life expectancy (37.2 years against 77.1 years).","whose life expectancy is smaller: Cameroon or Kenya":"Kenya has the smaller life expectancy (48 years against 54.8 years).","whose life expectancy is smaller: Madagascar or Venezuela":"Madagascar has the smaller life expectancy (55 years against 73.1 years).","between Yemen and Angola, which has the lesser life expectancy":"Angola has the smaller life expectancy (38.3 years against 59.8 years).","whose life expectancy is smaller: Poland or Ecuador":"Ecuador has the smaller life expectancy (71.1 years against 73.2 years).","whose life expectancy is smaller: Djibouti or Palau":"Djibouti has the smaller life expectancy (50.8 years against 68.6 years).","which has the smaller life expectancy, Palau or Finland":"Palau has the smaller life expectancy (68.6 years against 77.4 years).","whose life expectancy is smaller: Equatorial Guinea or Vanuatu":"Equatorial Guinea has the smaller life expectancy (53.6 years against 60.6 years).","between Papua New Guinea and Poland, which has the lesser life expectancy":"Papua New Guinea has the smaller life expectancy (63.1 years against 73.2 years).","whose life expectancy is smaller: Marshall Islands or Myanmar":"Myanmar has the smaller life expectancy (54.9 years against 65.5 years).","which has the smaller life expectancy, Venezuela or Brazil":"Brazil has the smaller life expectancy (62.9 years against 73.1 years).","which has the smaller life expectancy, French Polynesia or Central African Republic":"Central African Republic has the smaller life expectancy (44 years against 74.8 years).","whose life expectancy is smaller: Iceland or Costa Rica":"Costa Rica has the smaller life expectancy (75.8 years against 79.4 years).","whose life expectancy is smaller: Hong Kong or Grenada":"Grenada has the smaller life expectancy (64.5 years against 79.5 years).","between Indonesia and Greece, which has the lesser life expectancy":"Indonesia has the smaller life expectancy (70.1 years against 78.4 years).","which has the smaller life expectancy, Turkey or Guyana":"Guyana has the smaller life expectancy (64 years against 71 years).","between Central African Republic and Afghanistan, which has the lesser life expectancy":"Central African Republic has the smaller life expectancy (44 years against 45.9 years).","whose life expectancy is smaller: Saint Vincent and the Grenadines or Slovenia":"Saint Vincent and the Grenadines has the smaller life expectancy (72.3 years against 74.9 years).","which has the smaller life expectancy, Tonga or Albania":"Tonga has the smaller life expectancy (67.9 years against 71.6 years).","between Brazil and Honduras, which has the lesser life expectancy":"Brazil has the smaller life expectancy (62.9 years against 69.9 years).","whose life expectancy is smaller: Laos or Romania":"Laos has the smaller life expectancy (53.1 years against 69.9 years).","which has the smaller life expectancy, Malawi or Somalia":"Malawi has the smaller life expectancy (37.6 years against 46.2 years).","whose life expectancy is smaller: Samoa or Mauritania":"Mauritania has the smaller life expectancy (50.8 years against 69.2 years).","whose life expectancy is smaller: Comoros or Ghana":"Ghana has the smaller life expectancy (57.4 years against 60 years).","whose life expectancy is smaller: Togo or Portugal":"Togo has the smaller life expectancy (54.7 years against 75.8 years).","between Kuwait and Tuvalu, which has the lesser life expectancy":"Tuvalu has the smaller life expectancy (66.3 years against 76.1 years).","which has the smaller life expectancy, Aruba or Papua New Guinea":"Papua New Guinea has the smaller life expectancy (63.1 years against 78.4 years).","between Ukraine and United States, which has the lesser life expectancy":"Ukraine has the smaller life expectancy (66 years against 77.1 years).","whose life expectancy is smaller: Bolivia or Bangladesh":"Bangladesh has the smaller life expectancy (60.2 years against 63.7 years).","which has the smaller life expectancy, Argentina or Guinea-Bissau":"Guinea-Bissau has the smaller life expectancy (49 years against 75.1 years).","whose life expectancy is smaller: Burkina Faso or France":"Burkina Faso has the smaller life expectancy (46.7 years against 78.8 years).","between Finland and Comoros, which has the lesser life expectancy":"Comoros has the smaller life expectancy (60 years against 77.4 years).","between Malta and Togo, which has the lesser life expectancy":"Togo has the smaller life expectancy (54.7 years against 77.9 years).","which has the smaller life expectancy, France or Vietnam":"Vietnam has the smaller life expectancy (69.3 years against 78.8 years).","which has the smaller life expectancy, Zambia or Iran":"Zambia has the smaller life expectancy (37.2 years against 69.7 years).","whose life expectancy is smaller: South Korea or Nauru":"Nauru has the smaller life expectancy (60.8 years against 74.4 years).","between Uruguay and Marshall Islands, which has the lesser life expectancy":"Marshall Islands has the smaller life expectancy (65.5 years against 75.2 years)."}}},
{"id":"n-5f8418bf","guard":[["has","expectancy"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Trinidad and Tobago and South Korea, which has the lesser life expectancy":"Trinidad and Tobago has the smaller life expectancy (68 years against 74.4 years).","whose life expectancy is smaller: Syria or Uganda":"Uganda has the smaller life expectancy (42.9 years against 68.5 years).","which has the smaller life expectancy, Nauru or Jamaica":"Nauru has the smaller life expectancy (60.8 years against 75.2 years).","between Sudan and Saint Vincent and the Grenadines, which has the lesser life expectancy":"Sudan has the smaller life expectancy (56.6 years against 72.3 years).","which has the smaller life expectancy, Ecuador or Czech Republic":"Ecuador has the smaller life expectancy (71.1 years against 74.5 years).","which has the smaller life expectancy, Tajikistan or Israel":"Tajikistan has the smaller life expectancy (64.1 years against 78.6 years).","whose life expectancy is smaller: Barbados or Malawi":"Malawi has the smaller life expectancy (37.6 years against 73 years).","between Somalia and Lesotho, which has the lesser life expectancy":"Somalia has the smaller life expectancy (46.2 years against 50.8 years).","between Morocco and Iceland, which has the lesser life expectancy":"Morocco has the smaller life expectancy (69.1 years against 79.4 years).","whose life expectancy is smaller: Luxembourg or Kyrgyzstan":"Kyrgyzstan has the smaller life expectancy (63.4 years against 77.1 years).","which has the smaller life expectancy, Mauritania or Lebanon":"Mauritania has the smaller life expectancy (50.8 years against 71.3 years).","between Denmark and Panama, which has the lesser life expectancy":"Panama has the smaller life expectancy (75.5 years against 76.5 years).","whose life expectancy is smaller: Bhutan or Tonga":"Bhutan has the smaller life expectancy (52.4 years against 67.9 years).","between Mali and Bolivia, which has the lesser life expectancy":"Mali has the smaller life expectancy (46.7 years against 63.7 years).","between Saint Helena and Luxembourg, which has the lesser life expectancy":"Saint Helena has the smaller life expectancy (76.8 years against 77.1 years).","which has the smaller life expectancy, Grenada or Kuwait":"Grenada has the smaller life expectancy (64.5 years against 76.1 years).","whose life expectancy is smaller: Afghanistan or Tajikistan":"Afghanistan has the smaller life expectancy (45.9 years against 64.1 years).","which has the smaller life expectancy, Kenya or Libya":"Kenya has the smaller life expectancy (48 years against 75.5 years).","whose life expectancy is smaller: Lesotho or Turkey":"Lesotho has the smaller life expectancy (50.8 years against 71 years).","which has the smaller life expectancy, Uganda or Morocco":"Uganda has the smaller life expectancy (42.9 years against 69.1 years).","which has the smaller life expectancy, Cook Islands or Uruguay":"Cook Islands has the smaller life expectancy (71.1 years against 75.2 years).","which has the smaller life expectancy, Vanuatu or Indonesia":"Vanuatu has the smaller life expectancy (60.6 years against 70.1 years).","between Libya and Thailand, which has the lesser life expectancy":"Thailand has the smaller life expectancy (68.6 years against 75.5 years).","whose life expectancy is smaller: Thailand or Reunion":"Thailand has the smaller life expectancy (68.6 years against 72.7 years).","between Russia and Equatorial Guinea, which has the lesser life expectancy":"Equatorial Guinea has the smaller life expectancy (53.6 years against 67.2 years).","between Lebanon and Hong Kong, which has the lesser life expectancy":"Lebanon has the smaller life expectancy (71.3 years against 79.5 years).","between Ethiopia and Cameroon, which has the lesser life expectancy":"Ethiopia has the smaller life expectancy (45.2 years against 54.8 years).","which has the smaller life expectancy, Myanmar or El Salvador":"Myanmar has the smaller life expectancy (54.9 years against 69.7 years).","whose life expectancy is smaller: Guatemala or Suriname":"Guatemala has the smaller life expectancy (66.2 years against 71.4 years).","which has the smaller life expectancy, Bermuda or Bulgaria":"Bulgaria has the smaller life expectancy (70.9 years against 76.9 years).","whose life expectancy is smaller: Panama or Argentina":"Argentina has the smaller life expectancy (75.1 years against 75.5 years).","between Czech Republic and Greenland, which has the lesser life expectancy":"Greenland has the smaller life expectancy (68.1 years against 74.5 years).","whose life expectancy is smaller: Greenland or Montserrat":"Greenland has the smaller life expectancy (68.1 years against 78 years).","which has the smaller life expectancy, Costa Rica or Belarus":"Belarus has the smaller life expectancy (68 years against 75.8 years).","between Jamaica and Madagascar, which has the lesser life expectancy":"Madagascar has the smaller life expectancy (55 years against 75.2 years).","between Guinea-Bissau and Bhutan, which has the lesser life expectancy":"Guinea-Bissau has the smaller life expectancy (49 years against 52.4 years).","whose life expectancy is smaller: Angola or Bermuda":"Angola has the smaller life expectancy (38.3 years against 76.9 years).","which has the smaller life expectancy, Portugal or Mali":"Mali has the smaller life expectancy (46.7 years against 75.8 years).","whose life expectancy is smaller: Greece or French Polynesia":"French Polynesia has the smaller life expectancy (74.8 years against 78.4 years).","which has the smaller life expectancy, Ghana or Liberia":"Liberia has the smaller life expectancy (51 years against 57.4 years).","which has the smaller life expectancy, Slovenia or Trinidad and Tobago":"Trinidad and Tobago has the smaller life expectancy (68 years against 74.9 years).","between Bulgaria and Mauritius, which has the lesser life expectancy":"Bulgaria has the smaller life expectancy (70.9 years against 71 years).","whose life expectancy is smaller: Mauritius or Belgium":"Mauritius has the smaller life expectancy (71 years against 77.8 years).","which has the smaller life expectancy, Bangladesh or Russia":"Bangladesh has the smaller life expectancy (60.2 years against 67.2 years).","which has the smaller life expectancy, East Timor or Yemen":"East Timor has the smaller life expectancy (46 years against 59.8 years).","whose life expectancy is smaller: Honduras or Aruba":"Honduras has the smaller life expectancy (69.9 years against 78.4 years).","which has the smaller life expectancy, Qatar or Denmark":"Qatar has the smaller life expectancy (72.4 years against 76.5 years).","which has the smaller life expectancy, Reunion or Nepal":"Nepal has the smaller life expectancy (57.8 years against 72.7 years).","between Vietnam and Guatemala, which has the lesser life expectancy":"Guatemala has the smaller life expectancy (66.2 years against 69.3 years).","which has the smaller life expectancy, Montserrat or Ethiopia":"Ethiopia has the smaller life expectancy (45.2 years against 78 years).","which has the smaller life expectancy, Belgium or Saint Helena":"Saint Helena has the smaller life expectancy (76.8 years against 77.8 years).","between Nepal and Puerto Rico, which has the lesser life expectancy":"Nepal has the smaller life expectancy (57.8 years against 75.6 years).","between Albania and Burkina Faso, which has the lesser life expectancy":"Burkina Faso has the smaller life expectancy (46.7 years against 71.6 years).","between Iran and Barbados, which has the lesser life expectancy":"Iran has the smaller life expectancy (69.7 years against 73 years).","which has the smaller life expectancy, Romania or Malta":"Romania has the smaller life expectancy (69.9 years against 77.9 years).","between El Salvador and Samoa, which has the lesser life expectancy":"Samoa has the smaller life expectancy (69.2 years against 69.7 years).","which has the smaller life expectancy, Kyrgyzstan or Sudan":"Sudan has the smaller life expectancy (56.6 years against 63.4 years).","whose life expectancy is smaller: Tuvalu or East Timor":"East Timor has the smaller life expectancy (46 years against 66.3 years).","between Belarus and Djibouti, which has the lesser life expectancy":"Djibouti has the smaller life expectancy (50.8 years against 68 years).","whose life expectancy is smaller: Puerto Rico or Qatar":"Qatar has the smaller life expectancy (72.4 years against 75.6 years).","between Guyana and Laos, which has the lesser life expectancy":"Laos has the smaller life expectancy (53.1 years against 64 years).","which has the smaller life expectancy, Suriname or Ukraine":"Ukraine has the smaller life expectancy (66 years against 71.4 years).","between Israel and Syria, which has the lesser life expectancy":"Syria has the smaller life expectancy (68.5 years against 78.6 years).","whose life expectancy is smaller: United States or Zambia":"Zambia has the smaller life expectancy (37.2 years against 77.1 years).","whose life expectancy is smaller: Cameroon or Kenya":"Kenya has the smaller life expectancy (48 years against 54.8 years).","whose life expectancy is smaller: Madagascar or Venezuela":"Madagascar has the smaller life expectancy (55 years against 73.1 years).","between Yemen and Angola, which has the lesser life expectancy":"Angola has the smaller life expectancy (38.3 years against 59.8 years).","whose life expectancy is smaller: Poland or Ecuador":"Ecuador has the smaller life expectancy (71.1 years against 73.2 years).","whose life expectancy is smaller: Djibouti or Palau":"Djibouti has the smaller life expectancy (50.8 years against 68.6 years).","which has the smaller life expectancy, Palau or Finland":"Palau has the smaller life expectancy (68.6 years against 77.4 years).","whose life expectancy is smaller: Equatorial Guinea or Vanuatu":"Equatorial Guinea has the smaller life expectancy (53.6 years against 60.6 years).","between Papua New Guinea and Poland, which has the lesser life expectancy":"Papua New Guinea has the smaller life expectancy (63.1 years against 73.2 years).","whose life expectancy is smaller: Marshall Islands or Myanmar":"Myanmar has the smaller life expectancy (54.9 years against 65.5 years).","which has the smaller life expectancy, Venezuela or Brazil":"Brazil has the smaller life expectancy (62.9 years against 73.1 years).","which has the smaller life expectancy, French Polynesia or Central African Republic":"Central African Republic has the smaller life expectancy (44 years against 74.8 years).","whose life expectancy is smaller: Iceland or Costa Rica":"Costa Rica has the smaller life expectancy (75.8 years against 79.4 years).","whose life expectancy is smaller: Hong Kong or Grenada":"Grenada has the smaller life expectancy (64.5 years against 79.5 years).","between Indonesia and Greece, which has the lesser life expectancy":"Indonesia has the smaller life expectancy (70.1 years against 78.4 years).","which has the smaller life expectancy, Turkey or Guyana":"Guyana has the smaller life expectancy (64 years against 71 years).","between Central African Republic and Afghanistan, which has the lesser life expectancy":"Central African Republic has the smaller life expectancy (44 years against 45.9 years).","whose life expectancy is smaller: Saint Vincent and the Grenadines or Slovenia":"Saint Vincent and the Grenadines has the smaller life expectancy (72.3 years against 74.9 years).","which has the smaller life expectancy, Tonga or Albania":"Tonga has the smaller life expectancy (67.9 years against 71.6 years).","between Brazil and Honduras, which has the lesser life expectancy":"Brazil has the smaller life expectancy (62.9 years against 69.9 years).","whose life expectancy is smaller: Laos or Romania":"Laos has the smaller life expectancy (53.1 years against 69.9 years).","which has the smaller life expectancy, Malawi or Somalia":"Malawi has the smaller life expectancy (37.6 years against 46.2 years).","whose life expectancy is smaller: Samoa or Mauritania":"Mauritania has the smaller life expectancy (50.8 years against 69.2 years).","whose life expectancy is smaller: Comoros or Ghana":"Ghana has the smaller life expectancy (57.4 years against 60 years).","whose life expectancy is smaller: Togo or Portugal":"Togo has the smaller life expectancy (54.7 years against 75.8 years).","between Kuwait and Tuvalu, which has the lesser life expectancy":"Tuvalu has the smaller life expectancy (66.3 years against 76.1 years).","which has the smaller life expectancy, Aruba or Papua New Guinea":"Papua New Guinea has the smaller life expectancy (63.1 years against 78.4 years).","between Ukraine and United States, which has the lesser life expectancy":"Ukraine has the smaller life expectancy (66 years against 77.1 years).","whose life expectancy is smaller: Bolivia or Bangladesh":"Bangladesh has the smaller life expectancy (60.2 years against 63.7 years).","which has the smaller life expectancy, Argentina or Guinea-Bissau":"Guinea-Bissau has the smaller life expectancy (49 years against 75.1 years).","whose life expectancy is smaller: Burkina Faso or France":"Burkina Faso has the smaller life expectancy (46.7 years against 78.8 years).","between Finland and Comoros, which has the lesser life expectancy":"Comoros has the smaller life expectancy (60 years against 77.4 years).","between Malta and Togo, which has the lesser life expectancy":"Togo has the smaller life expectancy (54.7 years against 77.9 years).","which has the smaller life expectancy, France or Vietnam":"Vietnam has the smaller life expectancy (69.3 years against 78.8 years).","which has the smaller life expectancy, Zambia or Iran":"Zambia has the smaller life expectancy (37.2 years against 69.7 years).","whose life expectancy is smaller: South Korea or Nauru":"Nauru has the smaller life expectancy (60.8 years against 74.4 years).","between Uruguay and Marshall Islands, which has the lesser life expectancy":"Marshall Islands has the smaller life expectancy (65.5 years against 75.2 years)."}}},
{"id":"n-3ddf3a70","guard":[["has","expectancy"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"smaller: Syria or Uganda":"Uganda has the smaller life expectancy (42.9 years against 68.5 years).","smaller: Barbados or Malawi":"Malawi has the smaller life expectancy (37.6 years against 73 years).","smaller: Luxembourg or Kyrgyzstan":"Kyrgyzstan has the smaller life expectancy (63.4 years against 77.1 years).","smaller: Bhutan or Tonga":"Bhutan has the smaller life expectancy (52.4 years against 67.9 years).","smaller: Afghanistan or Tajikistan":"Afghanistan has the smaller life expectancy (45.9 years against 64.1 years).","smaller: Lesotho or Turkey":"Lesotho has the smaller life expectancy (50.8 years against 71 years).","smaller: Thailand or Reunion":"Thailand has the smaller life expectancy (68.6 years against 72.7 years).","smaller: Guatemala or Suriname":"Guatemala has the smaller life expectancy (66.2 years against 71.4 years).","smaller: Panama or Argentina":"Argentina has the smaller life expectancy (75.1 years against 75.5 years).","smaller: Greenland or Montserrat":"Greenland has the smaller life expectancy (68.1 years against 78 years).","smaller: Angola or Bermuda":"Angola has the smaller life expectancy (38.3 years against 76.9 years).","smaller: Greece or French Polynesia":"French Polynesia has the smaller life expectancy (74.8 years against 78.4 years).","smaller: Mauritius or Belgium":"Mauritius has the smaller life expectancy (71 years against 77.8 years).","smaller: Honduras or Aruba":"Honduras has the smaller life expectancy (69.9 years against 78.4 years).","smaller: Tuvalu or East Timor":"East Timor has the smaller life expectancy (46 years against 66.3 years).","smaller: Puerto Rico or Qatar":"Qatar has the smaller life expectancy (72.4 years against 75.6 years).","smaller: United States or Zambia":"Zambia has the smaller life expectancy (37.2 years against 77.1 years).","smaller: Cameroon or Kenya":"Kenya has the smaller life expectancy (48 years against 54.8 years).","smaller: Madagascar or Venezuela":"Madagascar has the smaller life expectancy (55 years against 73.1 years).","smaller: Poland or Ecuador":"Ecuador has the smaller life expectancy (71.1 years against 73.2 years).","smaller: Djibouti or Palau":"Djibouti has the smaller life expectancy (50.8 years against 68.6 years).","smaller: Equatorial Guinea or Vanuatu":"Equatorial Guinea has the smaller life expectancy (53.6 years against 60.6 years).","smaller: Marshall Islands or Myanmar":"Myanmar has the smaller life expectancy (54.9 years against 65.5 years).","smaller: Iceland or Costa Rica":"Costa Rica has the smaller life expectancy (75.8 years against 79.4 years).","smaller: Hong Kong or Grenada":"Grenada has the smaller life expectancy (64.5 years against 79.5 years).","smaller: Saint Vincent and the Grenadines or Slovenia":"Saint Vincent and the Grenadines has the smaller life expectancy (72.3 years against 74.9 years).","smaller: Laos or Romania":"Laos has the smaller life expectancy (53.1 years against 69.9 years).","smaller: Samoa or Mauritania":"Mauritania has the smaller life expectancy (50.8 years against 69.2 years).","smaller: Comoros or Ghana":"Ghana has the smaller life expectancy (57.4 years against 60 years).","smaller: Togo or Portugal":"Togo has the smaller life expectancy (54.7 years against 75.8 years).","smaller: Bolivia or Bangladesh":"Bangladesh has the smaller life expectancy (60.2 years against 63.7 years).","smaller: Burkina Faso or France":"Burkina Faso has the smaller life expectancy (46.7 years against 78.8 years).","smaller: South Korea or Nauru":"Nauru has the smaller life expectancy (60.8 years against 74.4 years)."}}},
{"id":"n-affab94d","guard":[["hasAny",["barbados","belarus","bolivia","brazil","bulgaria","cameroon","delete","ethiopia","ghana","guyana","hong","korea","kyrgyzstan","mali","marshall","nepal","panama","poland","puerto","remove","samoa","states","strip out","syria","ukraine","vietnam","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"expectancy"}]]],"mem":null},
{"id":"n-e6120e43","guard":[["hasAny",["afghanistan","argentina","aruba","backwards","bangladesh","belgium","bhutan","burkina","costa","djibouti","east","ecuador","equatorial","french","guatemala","kyrgyzstan","lesotho","longest","longest one","longest word","madagascar","mauritania","reunion","reverse","reverse order","reversed","syria"]],["has","life"],["has","smaller"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["sense.list"]]]],"mem":null},
{"id":"n-e7969887","guard":[["hasAny",["afghanistan","argentina","aruba","bangladesh","belgium","bhutan","burkina","costa","djibouti","east","ecuador","equatorial","french","guatemala","lesotho","longest","longest one","longest word","madagascar","mauritania","reunion","syria"]],["has","life"],["has","smaller"]],"pyramid":["render.str",["aggregate.longest",["sense.list"]]],"mem":null},
{"id":"n-26db9555","guard":[["hasAny",["afghanistan","argentina","aruba","bangladesh","belgium","bhutan","burkina","costa","djibouti","east","ecuador","equatorial","french","guatemala","invert case","lesotho","longest","longest one","longest word","madagascar","mauritania","reunion","swap case","syria","toggle case"]],["has","life"],["has","smaller"]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-3f76931e","guard":[["hasAny",["afghanistan","all caps","argentina","aruba","bangladesh","belgium","bhutan","burkina","capital letters","capitals","costa","djibouti","east","ecuador","equatorial","french","guatemala","lesotho","longest","longest one","longest word","madagascar","mauritania","reunion","syria","upper case","uppercase"]],["has","life"],["has","smaller"]],"pyramid":["render.str",["transform.upper",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-58d5e97a","guard":[["hasAny",["afghanistan","argentina","aruba","bangladesh","belgium","bhutan","burkina","costa","djibouti","east","ecuador","equatorial","french","guatemala","lesotho","longest","longest one","longest word","lower case","lowercase","madagascar","mauritania","reunion","small letters","syria"]],["has","life"],["has","smaller"]],"pyramid":["render.str",["transform.lower",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-9988032d","guard":[["hasAny",["afghanistan","argentina","aruba","bangladesh","belgium","bhutan","burkina","capitalise","capitalize","capitalize each word","costa","djibouti","east","ecuador","equatorial","french","guatemala","lesotho","longest","longest one","longest word","madagascar","mauritania","reunion","syria","title case"]],["has","life"],["has","smaller"]],"pyramid":["render.str",["transform.title",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-db2d45a6","guard":[["hasAny",["argentina","bangladesh","barbados","cameroon","comoros","costa","east","ecuador","element","french","grenada","islands","item number","korea","kyrgyzstan","mauritania","nth","position","puerto","states","syria"]],["has","life"],["has","smaller"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":2}]],"mem":null},
{"id":"n-0cc2438e","guard":[["hasAny",["argentina","bangladesh","barbados","cameroon","comoros","costa","east","ecuador","french","from position","grenada","islands","items from to","korea","kyrgyzstan","mauritania","puerto","slice","states","syria"]],["has","life"],["has","smaller"]],"pyramid":["render.and",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-3e33bdbf","guard":[["hasAny",["argentina","bangladesh","barbados","cameroon","comoros","costa","east","ecuador","french","from position","grenada","islands","items from to","korea","kyrgyzstan","mauritania","puerto","slice","states","syria"]],["has","life"],["has","smaller"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-e091049b","guard":[["hasAny",["argentina","bangladesh","barbados","cameroon","comoros","costa","east","ecuador","french","from position","grenada","islands","items from to","korea","kyrgyzstan","mauritania","puerto","slice","states","syria"]],["has","life"],["has","smaller"]],"pyramid":["render.list",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-a44da5ff","guard":[["hasAny",["afghanistan","angola","aruba","belgium","bhutan","burkina","djibouti","element","equatorial","greenland","guatemala","item number","laos","lesotho","madagascar","nth","portugal","position","reunion"]],["has","smaller"],["has","life"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":1}]],"mem":null},
{"id":"n-1df96d68","guard":[["hasAny",["afghanistan","argentina","aruba","bangladesh","belgium","bhutan","djibouti","each word","ecuador","guatemala","lesotho","longest","longest one","longest word","madagascar","mauritania","reunion","split into words","syria"]],["has","life"],["has","smaller"]],"pyramid":["render.and",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-2b1c4904","guard":[["hasAny",["afghanistan","argentina","aruba","bangladesh","belgium","bhutan","djibouti","each word","ecuador","guatemala","lesotho","longest","longest one","longest word","madagascar","mauritania","reunion","split into words","syria"]],["has","life"],["has","smaller"]],"pyramid":["render.lines",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-499d48e6","guard":[["hasAny",["afghanistan","argentina","aruba","bangladesh","belgium","bhutan","djibouti","each word","ecuador","guatemala","lesotho","longest","longest one","longest word","madagascar","mauritania","reunion","split into words","syria"]],["has","life"],["has","smaller"]],"pyramid":["render.list",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-a7db5e2f","guard":[["hasAny",["argentina","bangladesh","barbados","cameroon","comoros","delete","ecuador","grenada","islands","korea","kyrgyzstan","mauritania","puerto","remove","states","strip out","syria","without"]],["has","life"],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-c7e4ac7e","guard":[["hasAny",["afghanistan","argentina","aruba","bangladesh","belgium","bhutan","djibouti","ecuador","guatemala","lesotho","longest","longest one","longest word","madagascar","mauritania","reunion","reverse the words","reverse word order","syria","words backwards"]],["has","life"],["has","smaller"]],"pyramid":["render.str",["transform.reverseWords",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-62fa8db5","guard":[["hasAny",["angola","backwards","barbados","cameroon","comoros","greenland","grenada","islands","korea","kyrgyzstan","laos","portugal","puerto","reverse","reverse order","reversed","shortest","shortest one","shortest word","states"]],["has","life"],["has","smaller"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.list"]]]],"mem":null},
{"id":"n-bb46166e","guard":[["hasAny",["from position","ghana","hong","items from to","korea","kyrgyzstan","marshall","nepal","poland","puerto","samoa","slice","states","ukraine"]],["has","smaller"],["has","life"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],["sense.wordCount"],{"lit":10}]],"mem":null},
{"id":"n-61fb8d5d","guard":[["hasAny",["angola","barbados","cameroon","comoros","greenland","grenada","islands","korea","laos","portugal","puerto","shortest","shortest one","shortest word","states"]],["has","life"],["has","smaller"]],"pyramid":["render.str",["aggregate.shortest",["sense.list"]]],"mem":null},
{"id":"n-604b006a","guard":[["hasAny",["angola","barbados","cameroon","comoros","greenland","grenada","islands","korea","laos","lower case","lowercase","portugal","puerto","shortest","shortest one","shortest word","small letters","states"]],["has","life"],["has","smaller"]],"pyramid":["render.str",["transform.lower",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-659e7b0b","guard":[["hasAny",["all caps","angola","barbados","cameroon","capital letters","capitals","comoros","greenland","grenada","islands","korea","laos","portugal","puerto","shortest","shortest one","shortest word","states","upper case","uppercase"]],["has","life"],["has","smaller"]],"pyramid":["render.str",["transform.upper",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-808e7251","guard":[["hasAny",["bangladesh","ecuador","element","item number","kenya","malawi","mauritania","nth","position","uganda"]],["has","smaller"],["has","life"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-ad4798ec","guard":[["hasAny",["angola","barbados","cameroon","comoros","greenland","grenada","invert case","islands","korea","laos","portugal","puerto","shortest","shortest one","shortest word","states","swap case","toggle case"]],["has","life"],["has","smaller"]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-01dadbe5","guard":[["hasAny",["belarus","brazil","bulgaria","delete","ethiopia","guyana","liberia","mali","nepal","remove","strip out","sudan","ukraine","vietnam","without"]],["has","smaller"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.after",{"lit":"expectancy"}]]],"mem":null},
{"id":"n-15399049","guard":[["hasAny",["belarus","bermuda","brazil","delete","ethiopia","france","ghana","guyana","kyrgyzstan","mali","nepal","remove","strip out","suriname","without"]],["has","life"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.after",{"lit":"smaller"}]]],"mem":null},
{"id":"n-8cf6099a","guard":[["hasAny",["bermuda","costa","delete","france","ghana","kyrgyzstan","montserrat","portugal","remove","reunion","strip out","suriname","turkey","venezuela","without"]],["has","smaller"],["has","life"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"has"}]]],"mem":null},
{"id":"n-e153ea9b","guard":[["hasAny",["each word","liberia","longest","longest one","longest word","reunion","split into words","suriname","turkey","venezuela"]],["has","smaller"],["has","life"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-6e273303","guard":[["hasAny",["backwards","bangladesh","longest","longest one","longest word","mauritania","reverse","reverse order","reversed","tajikistan"]],["has","smaller"],["has","life"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-39be5fce","guard":[["hasAny",["from position","ghana","items from to","korea","kyrgyzstan","slice"]],["has","smaller"],["has","life"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],["sense.wordCount"],{"lit":12}]],"mem":null},
{"id":"n-16c4ab12","guard":[["hasAny",["all caps","capital letters","capitals","ghana","kyrgyzstan","upper case","uppercase"]],["has","smaller"],["has","life"]],"pyramid":["render.str",["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-574b49cb","guard":[["hasAny",["each word","ghana","kyrgyzstan","split into words"]],["has","smaller"],["has","life"]],"pyramid":["render.list",["transform.words",["sense.lastWord"]]],"mem":null},
{"id":"n-db672d36","guard":[["hasAny",["ghana","kyrgyzstan","lower case","lowercase","small letters"]],["has","smaller"],["has","life"]],"pyramid":["render.str",["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-dcd277cb","guard":[["hasAny",["ghana","invert case","kyrgyzstan","swap case","toggle case"]],["has","smaller"],["has","life"]],"pyramid":["render.str",["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f5f48ce5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ghana","kyrgyzstan","title case"]],["has","smaller"],["has","life"]],"pyramid":["render.str",["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4305bd4c","guard":[["hasAny",["delete","ghana","kyrgyzstan","remove","strip out","without"]],["has","smaller"],["has","life"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Brazil"}]],"mem":null},
{"id":"n-446ed837","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ghana","invert case","kyrgyzstan","swap case","title case","toggle case"]],["has","smaller"],["has","life"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-64d2d796","guard":[["hasAny",["delete","ghana","kyrgyzstan","remove","strip out","without"]],["has","smaller"],["has","life"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Bangladesh"}]],"mem":null},
{"id":"n-871c61f4","guard":[["hasAny",["element","ghana","item number","kyrgyzstan","nth","position"]],["has","smaller"],["has","life"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-f3fe92c2","guard":[["hasAny",["delete","ghana","kyrgyzstan","remove","strip out","without"]],["has","smaller"],["has","life"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Bulgaria"}]],"mem":null},
{"id":"n-fdb6147a","guard":[["hasAny",["delete","ghana","kyrgyzstan","remove","strip out","without"]],["has","smaller"],["has","life"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Ecuador"}]],"mem":null},
{"id":"n-084d1fb0","guard":[["hasAny",["equatorial","separate by","split","split by"]],["has","life"],["not",["has","give"]]],"pyramid":["render.list",["transform.split",{"lit":"Equatorial Guinea"},["sense.lastWord"]]],"mem":null},
{"id":"n-65e02a29","guard":[["hasAny",["a to z","alphabetical","alphabetize","bangladesh","longest","longest one","longest word"]],["has","smaller"],["has","life"]],"pyramid":["render.str",["aggregate.longest",["transform.sortStrs",["sense.words"]]]],"mem":null},
{"id":"n-dadce4de","guard":[["hasAny",["delete","equatorial","remove","strip out","without"]],["has","life"],["not",["has","give"]]],"pyramid":["render.str",["transform.remove",{"lit":"Equatorial Guinea"},["sense.lastWord"]]],"mem":null},
{"id":"n-db5c2edf","guard":[["hasAny",["element","greenland","item number","nth","position"]],["has","life"],["not",["has","compare"]],["not",["has","cook"]],["not",["has","larger"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0453044d","guard":[["has","finland"],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Palau or Finland":"Palau has the smaller life expectancy (68.6 years against 77.4 years)."}}},
{"id":"n-04fd48de","guard":[["has","jamaica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Nauru or Jamaica":"Nauru has the smaller life expectancy (60.8 years against 75.2 years)."}}},
{"id":"n-09291383","guard":[["hasAny",["between","expectancy","has","korea","lesser","life","south","tobago","trinidad"]],["has","lesser"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Trinidad and Tobago and South Korea, which has the lesser life expectancy":"Trinidad and Tobago has the smaller life expectancy (68 years against 74.4 years)."}}},
{"id":"n-0a26b4c8","guard":[["has","luxembourg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Saint Helena and Luxembourg, which has the lesser life expectancy":"Saint Helena has the smaller life expectancy (76.8 years against 77.1 years)."}}},
{"id":"n-0cc18977","guard":[["has","thailand"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Thailand or Reunion":"Thailand has the smaller life expectancy (68.6 years against 72.7 years)."}}},
{"id":"n-0e0eb809","guard":[["hasAny",["comoros","expectancy","ghana","life","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Comoros or Ghana":"Ghana has the smaller life expectancy (57.4 years against 60 years)."}}},
{"id":"n-0ec24da2","guard":[["hasAny",["equatorial","russia"]],["has","between"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Russia and Equatorial Guinea, which has the lesser life expectancy":"Equatorial Guinea has the smaller life expectancy (53.6 years against 67.2 years)."}}},
{"id":"n-127fd7a6","guard":[["has","liberia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Ghana or Liberia":"Liberia has the smaller life expectancy (51 years against 57.4 years)."}}},
{"id":"n-138a6cb7","guard":[["hasAny",["between","czech","expectancy","greenland","has","lesser","life","republic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Czech Republic and Greenland, which has the lesser life expectancy":"Greenland has the smaller life expectancy (68.1 years against 74.5 years)."}}},
{"id":"n-13e4f4a1","guard":[["hasAny",["guyana","laos"]],["has","guyana"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Guyana and Laos, which has the lesser life expectancy":"Laos has the smaller life expectancy (53.1 years against 64 years)."}}},
{"id":"n-14400dd5","guard":[["has","afghanistan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Central African Republic and Afghanistan, which has the lesser life expectancy":"Central African Republic has the smaller life expectancy (44 years against 45.9 years)."}}},
{"id":"n-15cf80b2","guard":[["hasAny",["el","expectancy","has","life","myanmar","salvador","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Myanmar or El Salvador":"Myanmar has the smaller life expectancy (54.9 years against 69.7 years)."}}},
{"id":"n-166b57d8","guard":[["hasAny",["has","yemen"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, East Timor or Yemen":"East Timor has the smaller life expectancy (46 years against 59.8 years)."}}},
{"id":"n-17c52498","guard":[["has","ethiopia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Montserrat or Ethiopia":"Ethiopia has the smaller life expectancy (45.2 years against 78 years)."}}},
{"id":"n-18f007dd","guard":[["hasAny",["expectancy","finland","has","life","palau","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Palau or Finland":"Palau has the smaller life expectancy (68.6 years against 77.4 years)."}}},
{"id":"n-1b1bc431","guard":[["has","madagascar"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Madagascar or Venezuela":"Madagascar has the smaller life expectancy (55 years against 73.1 years)."}}},
{"id":"n-1c67cb3f","guard":[["hasAny",["expectancy","has","life","smaller","suriname","ukraine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Suriname or Ukraine":"Ukraine has the smaller life expectancy (66 years against 71.4 years)."}}},
{"id":"n-1e737ad6","guard":[["has","kuwait"],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Grenada or Kuwait":"Grenada has the smaller life expectancy (64.5 years against 76.1 years)."}}},
{"id":"n-1e92dac3","guard":[["hasAny",["expectancy","grenadines","life","saint","slovenia","smaller","vincent"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Saint Vincent and the Grenadines or Slovenia":"Saint Vincent and the Grenadines has the smaller life expectancy (72.3 years against 74.9 years)."}}},
{"id":"n-1eeae5f9","guard":[["hasAny",["expectancy","grenada","has","kuwait","life","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Grenada or Kuwait":"Grenada has the smaller life expectancy (64.5 years against 76.1 years)."}}},
{"id":"n-20e95c76","guard":[["has","lebanon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Mauritania or Lebanon":"Mauritania has the smaller life expectancy (50.8 years against 71.3 years)."}}},
{"id":"n-213895a2","guard":[["hasAny",["greece","indonesia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Indonesia and Greece, which has the lesser life expectancy":"Indonesia has the smaller life expectancy (70.1 years against 78.4 years)."}}},
{"id":"n-22d90371","guard":[["hasAny",["each word","liberia","split into words"]],["has","has"]],"pyramid":["render.lines",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-23248a4e","guard":[["has","albania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Tonga or Albania":"Tonga has the smaller life expectancy (67.9 years against 71.6 years)."}}},
{"id":"n-23833e1e","guard":[["hasAny",["argentina","expectancy","guineabissau","has","life","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Argentina or Guinea-Bissau":"Guinea-Bissau has the smaller life expectancy (49 years against 75.1 years)."}}},
{"id":"n-239d3069","guard":[["hasAny",["between","denmark","expectancy","has","lesser","life","panama"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Denmark and Panama, which has the lesser life expectancy":"Panama has the smaller life expectancy (75.5 years against 76.5 years)."}}},
{"id":"n-24b27911","guard":[["hasAny",["expectancy","has","life","slovenia","smaller","tobago","trinidad"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Slovenia or Trinidad and Tobago":"Trinidad and Tobago has the smaller life expectancy (68 years against 74.9 years)."}}},
{"id":"n-26da289b","guard":[["hasAny",["expectancy","has","life","morocco","smaller","uganda"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Uganda or Morocco":"Uganda has the smaller life expectancy (42.9 years against 69.1 years)."}}},
{"id":"n-27736a3e","guard":[["hasAny",["invert case","liberia","swap case","toggle case"]],["has","has"]],"pyramid":["render.str",["transform.swapCase",["sense.subject"]]],"mem":null},
{"id":"n-27f168dd","guard":[["hasAny",["expectancy","life","puerto","qatar","rico","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Puerto Rico or Qatar":"Qatar has the smaller life expectancy (72.4 years against 75.6 years)."}}},
{"id":"n-290f753e","guard":[["hasAny",["expectancy","islands","life","marshall","myanmar","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Marshall Islands or Myanmar":"Myanmar has the smaller life expectancy (54.9 years against 65.5 years)."}}},
{"id":"n-29df5ab9","guard":[["hasAny",["between","expectancy","guinea","has","lesser","life","new","papua","poland"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Papua New Guinea and Poland, which has the lesser life expectancy":"Papua New Guinea has the smaller life expectancy (63.1 years against 73.2 years)."}}},
{"id":"n-29fd4e40","guard":[["hasAny",["between","expectancy","has","jamaica","lesser","life","madagascar"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Jamaica and Madagascar, which has the lesser life expectancy":"Madagascar has the smaller life expectancy (55 years against 75.2 years)."}}},
{"id":"n-2ccf2852","guard":[["hasAny",["bulgaria","mauritius"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Bulgaria and Mauritius, which has the lesser life expectancy":"Bulgaria has the smaller life expectancy (70.9 years against 71 years)."}}},
{"id":"n-2db803f1","guard":[["hasAny",["costa","expectancy","iceland","life","rica","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Iceland or Costa Rica":"Costa Rica has the smaller life expectancy (75.8 years against 79.4 years)."}}},
{"id":"n-307fd163","guard":[["hasAny",["east","expectancy","life","smaller","timor","tuvalu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Tuvalu or East Timor":"East Timor has the smaller life expectancy (46 years against 66.3 years)."}}},
{"id":"n-30b20cc0","guard":[["hasAny",["east","expectancy","has","life","smaller","timor","yemen"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, East Timor or Yemen":"East Timor has the smaller life expectancy (46 years against 59.8 years)."}}},
{"id":"n-313b83b6","guard":[["hasAny",["aruba","smaller"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Aruba or Papua New Guinea":"Papua New Guinea has the smaller life expectancy (63.1 years against 78.4 years)."}}},
{"id":"n-320d7841","guard":[["has","tuvalu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Tuvalu or East Timor":"East Timor has the smaller life expectancy (46 years against 66.3 years)."}}},
{"id":"n-32b35214","guard":[["has","guatemala"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Guatemala or Suriname":"Guatemala has the smaller life expectancy (66.2 years against 71.4 years)."}}},
{"id":"n-336a766a","guard":[["hasAny",["between","comoros","expectancy","finland","has","lesser","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Finland and Comoros, which has the lesser life expectancy":"Comoros has the smaller life expectancy (60 years against 77.4 years)."}}},
{"id":"n-35957d6d","guard":[["hasAny",["denmark","panama"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Denmark and Panama, which has the lesser life expectancy":"Panama has the smaller life expectancy (75.5 years against 76.5 years)."}}},
{"id":"n-369a64d1","guard":[["hasAny",["between","expectancy","has","iceland","lesser","life","morocco"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Morocco and Iceland, which has the lesser life expectancy":"Morocco has the smaller life expectancy (69.1 years against 79.4 years)."}}},
{"id":"n-386ca8f4","guard":[["hasAny",["expectancy","has","life","slovenia","smaller","tobago","trinidad"]],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Slovenia or Trinidad and Tobago":"Trinidad and Tobago has the smaller life expectancy (68 years against 74.9 years)."}}},
{"id":"n-38af1e54","guard":[["hasAny",["between","expectancy","has","lesser","life","nepal","puerto","rico"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Nepal and Puerto Rico, which has the lesser life expectancy":"Nepal has the smaller life expectancy (57.8 years against 75.6 years)."}}},
{"id":"n-38cde754","guard":[["has","samoa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between El Salvador and Samoa, which has the lesser life expectancy":"Samoa has the smaller life expectancy (69.2 years against 69.7 years)."}}},
{"id":"n-38cfa118","guard":[["hasAny",["between","expectancy","has","kuwait","lesser","life","tuvalu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Kuwait and Tuvalu, which has the lesser life expectancy":"Tuvalu has the smaller life expectancy (66.3 years against 76.1 years)."}}},
{"id":"n-38ea9c81","guard":[["hasAny",["between","expectancy","has","israel","lesser","life","syria"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Israel and Syria, which has the lesser life expectancy":"Syria has the smaller life expectancy (68.5 years against 78.6 years)."}}},
{"id":"n-3c060556","guard":[["hasAny",["bermuda","bulgaria","expectancy","has","life","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Bermuda or Bulgaria":"Bulgaria has the smaller life expectancy (70.9 years against 76.9 years)."}}},
{"id":"n-3c0b7801","guard":[["hasAny",["equatorial","guinea"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Equatorial Guinea or Vanuatu":"Equatorial Guinea has the smaller life expectancy (53.6 years against 60.6 years)."}}},
{"id":"n-3df32740","guard":[["hasAny",["expectancy","life","portugal","smaller","togo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Togo or Portugal":"Togo has the smaller life expectancy (54.7 years against 75.8 years)."}}},
{"id":"n-416ea039","guard":[["hasAny",["expectancy","kyrgyzstan","life","luxembourg","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Luxembourg or Kyrgyzstan":"Kyrgyzstan has the smaller life expectancy (63.4 years against 77.1 years)."}}},
{"id":"n-41b89a0e","guard":[["has","brazil"],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Venezuela or Brazil":"Brazil has the smaller life expectancy (62.9 years against 73.1 years)."}}},
{"id":"n-43338f1c","guard":[["hasAny",["expectancy","greenland","life","montserrat","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Greenland or Montserrat":"Greenland has the smaller life expectancy (68.1 years against 78 years)."}}},
{"id":"n-45b59398","guard":[["hasAny",["burkina","faso"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Burkina Faso or France":"Burkina Faso has the smaller life expectancy (46.7 years against 78.8 years)."}}},
{"id":"n-4689a524","guard":[["has","guineabissau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Argentina or Guinea-Bissau":"Guinea-Bissau has the smaller life expectancy (49 years against 75.1 years)."}}},
{"id":"n-46b23554","guard":[["has","morocco"],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Uganda or Morocco":"Uganda has the smaller life expectancy (42.9 years against 69.1 years)."}}},
{"id":"n-47393484","guard":[["hasAny",["bhutan","expectancy","life","smaller","tonga"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Bhutan or Tonga":"Bhutan has the smaller life expectancy (52.4 years against 67.9 years)."}}},
{"id":"n-494abebf","guard":[["hasAny",["expectancy","has","iran","life","smaller","zambia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Zambia or Iran":"Zambia has the smaller life expectancy (37.2 years against 69.7 years)."}}},
{"id":"n-4b57a1cb","guard":[["has","mauritius"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Mauritius or Belgium":"Mauritius has the smaller life expectancy (71 years against 77.8 years)."}}},
{"id":"n-4cf55d86","guard":[["hasAny",["iceland","morocco"]],["has","morocco"],["has","life"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Morocco and Iceland, which has the lesser life expectancy":"Morocco has the smaller life expectancy (69.1 years against 79.4 years)."}}},
{"id":"n-514f5e38","guard":[["has","panama"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Panama or Argentina":"Argentina has the smaller life expectancy (75.1 years against 75.5 years)."}}},
{"id":"n-53981457","guard":[["has","russia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Bangladesh or Russia":"Bangladesh has the smaller life expectancy (60.2 years against 67.2 years)."}}},
{"id":"n-57a4d3df","guard":[["hasAny",["liberia","lower case","lowercase","small letters"]],["has","has"]],"pyramid":["render.str",["transform.lower",["sense.subject"]]],"mem":null},
{"id":"n-57e24a6e","guard":[["has","vietnam"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, France or Vietnam":"Vietnam has the smaller life expectancy (69.3 years against 78.8 years)."}}},
{"id":"n-5913edf7","guard":[["hasAny",["expectancy","ghana","has","liberia","life","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Ghana or Liberia":"Liberia has the smaller life expectancy (51 years against 57.4 years)."}}},
{"id":"n-5973b6c5","guard":[["hasAny",["states","united"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: United States or Zambia":"Zambia has the smaller life expectancy (37.2 years against 77.1 years)."}}},
{"id":"n-59ef9608","guard":[["has","luxembourg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Luxembourg or Kyrgyzstan":"Kyrgyzstan has the smaller life expectancy (63.4 years against 77.1 years)."}}},
{"id":"n-5b476f46","guard":[["hasAny",["grenadines","sudan","vincent"]],["has","sudan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Sudan and Saint Vincent and the Grenadines, which has the lesser life expectancy":"Sudan has the smaller life expectancy (56.6 years against 72.3 years)."}}},
{"id":"n-5bb90ff8","guard":[["has","bolivia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Bolivia or Bangladesh":"Bangladesh has the smaller life expectancy (60.2 years against 63.7 years)."}}},
{"id":"n-5c2be460","guard":[["hasAny",["between","expectancy","has","lesser","libya","life","thailand"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Libya and Thailand, which has the lesser life expectancy":"Thailand has the smaller life expectancy (68.6 years against 75.5 years)."}}},
{"id":"n-5f1939f6","guard":[["has","malta"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Romania or Malta":"Romania has the smaller life expectancy (69.9 years against 77.9 years)."}}},
{"id":"n-5f5a59f8","guard":[["hasAny",["barbados","iran"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Iran and Barbados, which has the lesser life expectancy":"Iran has the smaller life expectancy (69.7 years against 73 years)."}}},
{"id":"n-601c119e","guard":[["has","lesotho"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Lesotho or Turkey":"Lesotho has the smaller life expectancy (50.8 years against 71 years)."}}},
{"id":"n-60674623","guard":[["has","iceland"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Iceland or Costa Rica":"Costa Rica has the smaller life expectancy (75.8 years against 79.4 years)."}}},
{"id":"n-61135bd6","guard":[["hasAny",["liberia","reverse the words","reverse word order","words backwards"]],["has","has"]],"pyramid":["render.str",["transform.reverseWords",["sense.subject"]]],"mem":null},
{"id":"n-612086ce","guard":[["has","angola"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Angola or Bermuda":"Angola has the smaller life expectancy (38.3 years against 76.9 years)."}}},
{"id":"n-62bee40f","guard":[["hasAny",["belarus","costa","expectancy","has","life","rica","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Costa Rica or Belarus":"Belarus has the smaller life expectancy (68 years against 75.8 years)."}}},
{"id":"n-636fea65","guard":[["hasAny",["comoros","finland"]],["has","comoros"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Finland and Comoros, which has the lesser life expectancy":"Comoros has the smaller life expectancy (60 years against 77.4 years)."}}},
{"id":"n-6815ce33","guard":[["hasAny",["expectancy","lesotho","life","smaller","turkey"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Lesotho or Turkey":"Lesotho has the smaller life expectancy (50.8 years against 71 years)."}}},
{"id":"n-685908a0","guard":[["hasAny",["kuwait","tuvalu"]],["has","kuwait"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Kuwait and Tuvalu, which has the lesser life expectancy":"Tuvalu has the smaller life expectancy (66.3 years against 76.1 years)."}}},
{"id":"n-6abccea8","guard":[["has","mali"],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Portugal or Mali":"Mali has the smaller life expectancy (46.7 years against 75.8 years)."}}},
{"id":"n-6b2928fc","guard":[["hasAny",["burkina","expectancy","faso","france","life","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Burkina Faso or France":"Burkina Faso has the smaller life expectancy (46.7 years against 78.8 years)."}}},
{"id":"n-6b57da6c","guard":[["hasAny",["expectancy","islands","life","marshall","myanmar","smaller"]],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Marshall Islands or Myanmar":"Myanmar has the smaller life expectancy (54.9 years against 65.5 years)."}}},
{"id":"n-6c06959f","guard":[["hasAny",["between","expectancy","has","lesotho","lesser","life","somalia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Somalia and Lesotho, which has the lesser life expectancy":"Somalia has the smaller life expectancy (46.2 years against 50.8 years)."}}},
{"id":"n-6c5b1fc6","guard":[["hasAny",["barbados","between","expectancy","has","iran","lesser","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Iran and Barbados, which has the lesser life expectancy":"Iran has the smaller life expectancy (69.7 years against 73 years)."}}},
{"id":"n-6daaaf94","guard":[["hasAny",["belarus","djibouti"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Belarus and Djibouti, which has the lesser life expectancy":"Djibouti has the smaller life expectancy (50.8 years against 68 years)."}}},
{"id":"n-6dccbea8","guard":[["hasAny",["bhutan","guineabissau"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Guinea-Bissau and Bhutan, which has the lesser life expectancy":"Guinea-Bissau has the smaller life expectancy (49 years against 52.4 years)."}}},
{"id":"n-6e1f0e59","guard":[["hasAny",["afghanistan","expectancy","life","smaller","tajikistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Afghanistan or Tajikistan":"Afghanistan has the smaller life expectancy (45.9 years against 64.1 years)."}}},
{"id":"n-6e49d995","guard":[["hasAny",["bolivia","mali"]],["has","mali"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Mali and Bolivia, which has the lesser life expectancy":"Mali has the smaller life expectancy (46.7 years against 63.7 years)."}}},
{"id":"n-7072f6ac","guard":[["hasAny",["belarus","between","djibouti","expectancy","has","lesser","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Belarus and Djibouti, which has the lesser life expectancy":"Djibouti has the smaller life expectancy (50.8 years against 68 years)."}}},
{"id":"n-708c6e09","guard":[["has","greenland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Czech Republic and Greenland, which has the lesser life expectancy":"Greenland has the smaller life expectancy (68.1 years against 74.5 years)."}}},
{"id":"n-72db3746","guard":[["hasAny",["djibouti","expectancy","life","palau","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Djibouti or Palau":"Djibouti has the smaller life expectancy (50.8 years against 68.6 years)."}}},
{"id":"n-7524db16","guard":[["hasAny",["between","expectancy","guyana","has","laos","lesser","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Guyana and Laos, which has the lesser life expectancy":"Laos has the smaller life expectancy (53.1 years against 64 years)."}}},
{"id":"n-7541b036","guard":[["has","somalia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Malawi or Somalia":"Malawi has the smaller life expectancy (37.6 years against 46.2 years)."}}},
{"id":"n-75ed376f","guard":[["hasAny",["between","expectancy","greece","has","indonesia","lesser","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Indonesia and Greece, which has the lesser life expectancy":"Indonesia has the smaller life expectancy (70.1 years against 78.4 years)."}}},
{"id":"n-7c2ec9ab","guard":[["hasAny",["denmark","expectancy","has","life","qatar","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Qatar or Denmark":"Qatar has the smaller life expectancy (72.4 years against 76.5 years)."}}},
{"id":"n-7d107701","guard":[["hasAny",["bangladesh","expectancy","has","life","russia","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Bangladesh or Russia":"Bangladesh has the smaller life expectancy (60.2 years against 67.2 years)."}}},
{"id":"n-7df0827b","guard":[["hasAny",["expectancy","has","life","mali","portugal","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Portugal or Mali":"Mali has the smaller life expectancy (46.7 years against 75.8 years)."}}},
{"id":"n-7ff960db","guard":[["hasAny",["expectancy","has","israel","life","smaller","tajikistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Tajikistan or Israel":"Tajikistan has the smaller life expectancy (64.1 years against 78.6 years)."}}},
{"id":"n-808315e4","guard":[["hasAny",["expectancy","has","lebanon","life","mauritania","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Mauritania or Lebanon":"Mauritania has the smaller life expectancy (50.8 years against 71.3 years)."}}},
{"id":"n-812fe542","guard":[["hasAny",["expectancy","has","life","malawi","smaller","somalia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Malawi or Somalia":"Malawi has the smaller life expectancy (37.6 years against 46.2 years)."}}},
{"id":"n-81a43ea9","guard":[["hasAny",["malta","togo"]],["has","malta"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Malta and Togo, which has the lesser life expectancy":"Togo has the smaller life expectancy (54.7 years against 77.9 years)."}}},
{"id":"n-82eb122a","guard":[["hasAny",["ecuador","expectancy","life","poland","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Poland or Ecuador":"Ecuador has the smaller life expectancy (71.1 years against 73.2 years)."}}},
{"id":"n-835c7e8d","guard":[["hasAny",["israel","syria"]],["has","syria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Israel and Syria, which has the lesser life expectancy":"Syria has the smaller life expectancy (68.5 years against 78.6 years)."}}},
{"id":"n-852c9c8c","guard":[["hasAny",["angola","between","expectancy","has","lesser","life","yemen"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Yemen and Angola, which has the lesser life expectancy":"Angola has the smaller life expectancy (38.3 years against 59.8 years)."}}},
{"id":"n-88be299b","guard":[["has","greece"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Greece or French Polynesia":"French Polynesia has the smaller life expectancy (74.8 years against 78.4 years)."}}},
{"id":"n-88f95a9b","guard":[["hasAny",["afghanistan","african","between","central","expectancy","has","lesser","life","republic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Central African Republic and Afghanistan, which has the lesser life expectancy":"Central African Republic has the smaller life expectancy (44 years against 45.9 years)."}}},
{"id":"n-8b322faf","guard":[["hasAny",["expectancy","laos","life","romania","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Laos or Romania":"Laos has the smaller life expectancy (53.1 years against 69.9 years)."}}},
{"id":"n-8ec2ff60","guard":[["hasAny",["nepal","puerto","rico"]],["has","nepal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Nepal and Puerto Rico, which has the lesser life expectancy":"Nepal has the smaller life expectancy (57.8 years against 75.6 years)."}}},
{"id":"n-9013bfc5","guard":[["has","syria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Syria or Uganda":"Uganda has the smaller life expectancy (42.9 years against 68.5 years)."}}},
{"id":"n-90c8744b","guard":[["hasAny",["expectancy","has","kenya","libya","life","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Kenya or Libya":"Kenya has the smaller life expectancy (48 years against 75.5 years)."}}},
{"id":"n-92761bf0","guard":[["hasAny",["puerto","rico"]],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Puerto Rico or Qatar":"Qatar has the smaller life expectancy (72.4 years against 75.6 years)."}}},
{"id":"n-92d946fa","guard":[["hasAny",["between","expectancy","has","islands","lesser","life","marshall","uruguay"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Uruguay and Marshall Islands, which has the lesser life expectancy":"Marshall Islands has the smaller life expectancy (65.5 years against 75.2 years)."}}},
{"id":"n-93212d4a","guard":[["hasAny",["expectancy","korea","life","nauru","smaller","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: South Korea or Nauru":"Nauru has the smaller life expectancy (60.8 years against 74.4 years)."}}},
{"id":"n-94d5db6c","guard":[["hasAny",["equatorial","expectancy","guinea","life","smaller","vanuatu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Equatorial Guinea or Vanuatu":"Equatorial Guinea has the smaller life expectancy (53.6 years against 60.6 years)."}}},
{"id":"n-96cd3d71","guard":[["hasAny",["bangladesh","bolivia","expectancy","life","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Bolivia or Bangladesh":"Bangladesh has the smaller life expectancy (60.2 years against 63.7 years)."}}},
{"id":"n-97004e45","guard":[["hasAny",["albania","expectancy","has","life","smaller","tonga"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Tonga or Albania":"Tonga has the smaller life expectancy (67.9 years against 71.6 years)."}}},
{"id":"n-970c84c7","guard":[["has","samoa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Samoa or Mauritania":"Mauritania has the smaller life expectancy (50.8 years against 69.2 years)."}}},
{"id":"n-9a455f95","guard":[["has","sudan"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Kyrgyzstan or Sudan":"Sudan has the smaller life expectancy (56.6 years against 63.4 years)."}}},
{"id":"n-9a9fe987","guard":[["has","indonesia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Vanuatu or Indonesia":"Vanuatu has the smaller life expectancy (60.6 years against 70.1 years)."}}},
{"id":"n-9b0cf630","guard":[["hasAny",["belarus","has"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Costa Rica or Belarus":"Belarus has the smaller life expectancy (68 years against 75.8 years)."}}},
{"id":"n-9b3a372c","guard":[["hasAny",["cameroon","ethiopia"]],["has","cameroon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Ethiopia and Cameroon, which has the lesser life expectancy":"Ethiopia has the smaller life expectancy (45.2 years against 54.8 years)."}}},
{"id":"n-9b87bb1d","guard":[["hasAny",["expectancy","has","indonesia","life","smaller","vanuatu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Vanuatu or Indonesia":"Vanuatu has the smaller life expectancy (60.6 years against 70.1 years)."}}},
{"id":"n-9b8b8d41","guard":[["has","israel"],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Tajikistan or Israel":"Tajikistan has the smaller life expectancy (64.1 years against 78.6 years)."}}},
{"id":"n-9ca02501","guard":[["hasAny",["expectancy","life","smaller","states","united","zambia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: United States or Zambia":"Zambia has the smaller life expectancy (37.2 years against 77.1 years)."}}},
{"id":"n-9ce068f7","guard":[["has","barbados"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Barbados or Malawi":"Malawi has the smaller life expectancy (37.6 years against 73 years)."}}},
{"id":"n-9e0ed824","guard":[["hasAny",["expectancy","has","life","malta","romania","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Romania or Malta":"Romania has the smaller life expectancy (69.9 years against 77.9 years)."}}},
{"id":"n-9e760500","guard":[["hasAny",["czech","ecuador","expectancy","has","life","republic","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Ecuador or Czech Republic":"Ecuador has the smaller life expectancy (71.1 years against 74.5 years)."}}},
{"id":"n-9f456364","guard":[["hasAny",["hong","kong","lebanon"]],["has","lebanon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Lebanon and Hong Kong, which has the lesser life expectancy":"Lebanon has the smaller life expectancy (71.3 years against 79.5 years)."}}},
{"id":"n-a0a093b9","guard":[["has","bulgaria"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Bermuda or Bulgaria":"Bulgaria has the smaller life expectancy (70.9 years against 76.9 years)."}}},
{"id":"n-a0d9ac14","guard":[["hasAny",["between","expectancy","has","hong","kong","lebanon","lesser","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Lebanon and Hong Kong, which has the lesser life expectancy":"Lebanon has the smaller life expectancy (71.3 years against 79.5 years)."}}},
{"id":"n-a3abd9c5","guard":[["hasAny",["angola","bermuda","expectancy","life","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Angola or Bermuda":"Angola has the smaller life expectancy (38.3 years against 76.9 years)."}}},
{"id":"n-a3d8c685","guard":[["has","nepal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Reunion or Nepal":"Nepal has the smaller life expectancy (57.8 years against 72.7 years)."}}},
{"id":"n-a86630d7","guard":[["hasAny",["jamaica","madagascar"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Jamaica and Madagascar, which has the lesser life expectancy":"Madagascar has the smaller life expectancy (55 years against 75.2 years)."}}},
{"id":"n-a89c972f","guard":[["hasAny",["between","expectancy","grenadines","has","lesser","life","saint","sudan","vincent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Sudan and Saint Vincent and the Grenadines, which has the lesser life expectancy":"Sudan has the smaller life expectancy (56.6 years against 72.3 years)."}}},
{"id":"n-a989997f","guard":[["hasAny",["between","brazil","expectancy","has","honduras","lesser","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Brazil and Honduras, which has the lesser life expectancy":"Brazil has the smaller life expectancy (62.9 years against 69.9 years)."}}},
{"id":"n-aab228dd","guard":[["has","greenland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Greenland or Montserrat":"Greenland has the smaller life expectancy (68.1 years against 78 years)."}}},
{"id":"n-ab079e6c","guard":[["hasAny",["states","ukraine","united"]],["has","lesser"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Ukraine and United States, which has the lesser life expectancy":"Ukraine has the smaller life expectancy (66 years against 77.1 years)."}}},
{"id":"n-ae8698d2","guard":[["hasAny",["brazil","honduras"]],["has","brazil"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Brazil and Honduras, which has the lesser life expectancy":"Brazil has the smaller life expectancy (62.9 years against 69.9 years)."}}},
{"id":"n-b31a05aa","guard":[["hasAny",["expectancy","has","jamaica","life","nauru","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Nauru or Jamaica":"Nauru has the smaller life expectancy (60.8 years against 75.2 years)."}}},
{"id":"n-b6b43a1c","guard":[["hasAny",["brazil","expectancy","has","life","smaller","venezuela"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Venezuela or Brazil":"Brazil has the smaller life expectancy (62.9 years against 73.1 years)."}}},
{"id":"n-b758f152","guard":[["hasAny",["belgium","expectancy","has","helena","life","saint","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Belgium or Saint Helena":"Saint Helena has the smaller life expectancy (76.8 years against 77.8 years)."}}},
{"id":"n-b7a6a764","guard":[["hasAny",["between","bolivia","expectancy","has","lesser","life","mali"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Mali and Bolivia, which has the lesser life expectancy":"Mali has the smaller life expectancy (46.7 years against 63.7 years)."}}},
{"id":"n-bb23044d","guard":[["hasAny",["between","bhutan","expectancy","guineabissau","has","lesser","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Guinea-Bissau and Bhutan, which has the lesser life expectancy":"Guinea-Bissau has the smaller life expectancy (49 years against 52.4 years)."}}},
{"id":"n-bc47be69","guard":[["hasAny",["expectancy","life","madagascar","smaller","venezuela"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Madagascar or Venezuela":"Madagascar has the smaller life expectancy (55 years against 73.1 years)."}}},
{"id":"n-bcc2a785","guard":[["hasAny",["expectancy","life","mauritania","samoa","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Samoa or Mauritania":"Mauritania has the smaller life expectancy (50.8 years against 69.2 years)."}}},
{"id":"n-bcca8d5d","guard":[["hasAny",["expectancy","life","smaller","syria","uganda"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Syria or Uganda":"Uganda has the smaller life expectancy (42.9 years against 68.5 years)."}}},
{"id":"n-bd32423e","guard":[["hasAny",["belgium","expectancy","life","mauritius","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Mauritius or Belgium":"Mauritius has the smaller life expectancy (71 years against 77.8 years)."}}},
{"id":"n-bd39fff2","guard":[["hasAny",["aruba","expectancy","guinea","has","life","new","papua","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Aruba or Papua New Guinea":"Papua New Guinea has the smaller life expectancy (63.1 years against 78.4 years)."}}},
{"id":"n-c17b19f5","guard":[["has","laos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Laos or Romania":"Laos has the smaller life expectancy (53.1 years against 69.9 years)."}}},
{"id":"n-c1bf4f40","guard":[["hasAny",["expectancy","grenada","hong","kong","life","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Hong Kong or Grenada":"Grenada has the smaller life expectancy (64.5 years against 79.5 years)."}}},
{"id":"n-c255c7c6","guard":[["hasAny",["between","cameroon","ethiopia","expectancy","has","lesser","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Ethiopia and Cameroon, which has the lesser life expectancy":"Ethiopia has the smaller life expectancy (45.2 years against 54.8 years)."}}},
{"id":"n-c2e811b2","guard":[["hasAny",["cook","smaller"]],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Cook Islands or Uruguay":"Cook Islands has the smaller life expectancy (71.1 years against 75.2 years)."}}},
{"id":"n-c30d2c19","guard":[["hasAny",["expectancy","has","life","nepal","reunion","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Reunion or Nepal":"Nepal has the smaller life expectancy (57.8 years against 72.7 years)."}}},
{"id":"n-c40af493","guard":[["hasAny",["expectancy","french","greece","life","polynesia","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Greece or French Polynesia":"French Polynesia has the smaller life expectancy (74.8 years against 78.4 years)."}}},
{"id":"n-c4a6c277","guard":[["hasAny",["cameroon","expectancy","kenya","life","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Cameroon or Kenya":"Kenya has the smaller life expectancy (48 years against 54.8 years)."}}},
{"id":"n-c636e0b2","guard":[["hasAny",["between","expectancy","guatemala","has","lesser","life","vietnam"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Vietnam and Guatemala, which has the lesser life expectancy":"Guatemala has the smaller life expectancy (66.2 years against 69.3 years)."}}},
{"id":"n-c7fd71a7","guard":[["hasAny",["expectancy","has","kyrgyzstan","life","smaller","sudan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Kyrgyzstan or Sudan":"Sudan has the smaller life expectancy (56.6 years against 63.4 years)."}}},
{"id":"n-c80ac839","guard":[["has","ukraine"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Suriname or Ukraine":"Ukraine has the smaller life expectancy (66 years against 71.4 years)."}}},
{"id":"n-c8209573","guard":[["hasAny",["between","expectancy","has","helena","lesser","life","luxembourg","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Saint Helena and Luxembourg, which has the lesser life expectancy":"Saint Helena has the smaller life expectancy (76.8 years against 77.1 years)."}}},
{"id":"n-c85723f1","guard":[["hasAny",["between","el","expectancy","has","lesser","life","salvador","samoa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between El Salvador and Samoa, which has the lesser life expectancy":"Samoa has the smaller life expectancy (69.2 years against 69.7 years)."}}},
{"id":"n-ca7c6281","guard":[["hasAny",["angola","yemen"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Yemen and Angola, which has the lesser life expectancy":"Angola has the smaller life expectancy (38.3 years against 59.8 years)."}}},
{"id":"n-cc133d4e","guard":[["has","poland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Papua New Guinea and Poland, which has the lesser life expectancy":"Papua New Guinea has the smaller life expectancy (63.1 years against 73.2 years)."}}},
{"id":"n-cc353b5a","guard":[["hasAny",["libya","thailand"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Libya and Thailand, which has the lesser life expectancy":"Thailand has the smaller life expectancy (68.6 years against 75.5 years)."}}},
{"id":"n-d36d23ed","guard":[["hasAny",["lesotho","somalia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Somalia and Lesotho, which has the lesser life expectancy":"Somalia has the smaller life expectancy (46.2 years against 50.8 years)."}}},
{"id":"n-d402572c","guard":[["hasAny",["all caps","capital letters","capitals","liberia","upper case","uppercase"]],["has","has"]],"pyramid":["render.str",["transform.upper",["sense.subject"]]],"mem":null},
{"id":"n-d74e9438","guard":[["hasAny",["between","expectancy","has","lesser","life","states","ukraine","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Ukraine and United States, which has the lesser life expectancy":"Ukraine has the smaller life expectancy (66 years against 77.1 years)."}}},
{"id":"n-d886063c","guard":[["hasAny",["each word","liberia","split into words"]],["has","has"]],"pyramid":["render.list",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-da503661","guard":[["hasAny",["korea","south"]],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: South Korea or Nauru":"Nauru has the smaller life expectancy (60.8 years against 74.4 years)."}}},
{"id":"n-dabd2ff5","guard":[["hasAny",["between","bulgaria","expectancy","has","lesser","life","mauritius"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Bulgaria and Mauritius, which has the lesser life expectancy":"Bulgaria has the smaller life expectancy (70.9 years against 71 years)."}}},
{"id":"n-dba34fd5","guard":[["hasAny",["argentina","expectancy","life","panama","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Panama or Argentina":"Argentina has the smaller life expectancy (75.1 years against 75.5 years)."}}},
{"id":"n-dc248bcd","guard":[["hasAny",["between","equatorial","expectancy","guinea","has","lesser","life","russia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Russia and Equatorial Guinea, which has the lesser life expectancy":"Equatorial Guinea has the smaller life expectancy (53.6 years against 67.2 years)."}}},
{"id":"n-dc812f70","guard":[["hasAny",["guatemala","vietnam"]],["has","guatemala"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Vietnam and Guatemala, which has the lesser life expectancy":"Guatemala has the smaller life expectancy (66.2 years against 69.3 years)."}}},
{"id":"n-ddc4e99e","guard":[["hasAny",["expectancy","france","has","life","smaller","vietnam"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, France or Vietnam":"Vietnam has the smaller life expectancy (69.3 years against 78.8 years)."}}},
{"id":"n-ddf954ff","guard":[["has","denmark"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Qatar or Denmark":"Qatar has the smaller life expectancy (72.4 years against 76.5 years)."}}},
{"id":"n-dfebd166","guard":[["hasAny",["expectancy","life","reunion","smaller","thailand"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Thailand or Reunion":"Thailand has the smaller life expectancy (68.6 years against 72.7 years)."}}},
{"id":"n-e11f4a0c","guard":[["hasAny",["expectancy","guatemala","life","smaller","suriname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Guatemala or Suriname":"Guatemala has the smaller life expectancy (66.2 years against 71.4 years)."}}},
{"id":"n-e1b463ae","guard":[["has","iran"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Zambia or Iran":"Zambia has the smaller life expectancy (37.2 years against 69.7 years)."}}},
{"id":"n-e29ce349","guard":[["hasAny",["african","central","expectancy","french","has","life","polynesia","republic","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, French Polynesia or Central African Republic":"Central African Republic has the smaller life expectancy (44 years against 74.8 years)."}}},
{"id":"n-e3026c91","guard":[["hasAny",["albania","between","burkina","expectancy","faso","has","lesser","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Albania and Burkina Faso, which has the lesser life expectancy":"Burkina Faso has the smaller life expectancy (46.7 years against 71.6 years)."}}},
{"id":"n-e303db20","guard":[["has","guyana"],["has","smaller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Turkey or Guyana":"Guyana has the smaller life expectancy (64 years against 71 years)."}}},
{"id":"n-e597e39f","guard":[["has","cameroon"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Cameroon or Kenya":"Kenya has the smaller life expectancy (48 years against 54.8 years)."}}},
{"id":"n-e880f135","guard":[["has","poland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Poland or Ecuador":"Ecuador has the smaller life expectancy (71.1 years against 73.2 years)."}}},
{"id":"n-e8b11f21","guard":[["hasAny",["albania","burkina","faso"]],["has","lesser"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Albania and Burkina Faso, which has the lesser life expectancy":"Burkina Faso has the smaller life expectancy (46.7 years against 71.6 years)."}}},
{"id":"n-ea76da1f","guard":[["hasAny",["expectancy","grenadines","life","saint","slovenia","smaller","vincent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Saint Vincent and the Grenadines or Slovenia":"Saint Vincent and the Grenadines has the smaller life expectancy (72.3 years against 74.9 years)."}}},
{"id":"n-eaeecdd1","guard":[["hasAny",["aruba","expectancy","honduras","life","smaller"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Honduras or Aruba":"Honduras has the smaller life expectancy (69.9 years against 78.4 years)."}}},
{"id":"n-eafbd42a","guard":[["hasAny",["each word","liberia","split into words"]],["has","has"]],"pyramid":["render.and",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-eb692e67","guard":[["has","bhutan"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Bhutan or Tonga":"Bhutan has the smaller life expectancy (52.4 years against 67.9 years)."}}},
{"id":"n-ebcef656","guard":[["hasAny",["hong","kong"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Hong Kong or Grenada":"Grenada has the smaller life expectancy (64.5 years against 79.5 years)."}}},
{"id":"n-ed618a2d","guard":[["hasAny",["between","expectancy","has","lesser","life","malta","togo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Malta and Togo, which has the lesser life expectancy":"Togo has the smaller life expectancy (54.7 years against 77.9 years)."}}},
{"id":"n-ef62429d","guard":[["hasAny",["between","expectancy","has","korea","lesser","life","south","tobago","trinidad"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Trinidad and Tobago and South Korea, which has the lesser life expectancy":"Trinidad and Tobago has the smaller life expectancy (68 years against 74.4 years)."}}},
{"id":"n-f0049236","guard":[["has","djibouti"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Djibouti or Palau":"Djibouti has the smaller life expectancy (50.8 years against 68.6 years)."}}},
{"id":"n-f57e6178","guard":[["hasAny",["capitalise","capitalize","capitalize each word","liberia","title case"]],["has","has"]],"pyramid":["render.str",["transform.title",["sense.subject"]]],"mem":null},
{"id":"n-f7c82c81","guard":[["hasAny",["ethiopia","expectancy","has","life","montserrat","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Montserrat or Ethiopia":"Ethiopia has the smaller life expectancy (45.2 years against 78 years)."}}},
{"id":"n-f7ea3d93","guard":[["has","marshall"],["has","uruguay"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Uruguay and Marshall Islands, which has the lesser life expectancy":"Marshall Islands has the smaller life expectancy (65.5 years against 75.2 years)."}}},
{"id":"n-f91d10a8","guard":[["hasAny",["aruba","expectancy","honduras","life","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Honduras or Aruba":"Honduras has the smaller life expectancy (69.9 years against 78.4 years)."}}},
{"id":"n-fa8e6c22","guard":[["has","afghanistan"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Afghanistan or Tajikistan":"Afghanistan has the smaller life expectancy (45.9 years against 64.1 years)."}}},
{"id":"n-fb3aec3a","guard":[["hasAny",["expectancy","guyana","has","life","smaller","turkey"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Turkey or Guyana":"Guyana has the smaller life expectancy (64 years against 71 years)."}}},
{"id":"n-fbc7599a","guard":[["hasAny",["cook","expectancy","has","islands","life","smaller","uruguay"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Cook Islands or Uruguay":"Cook Islands has the smaller life expectancy (71.1 years against 75.2 years)."}}},
{"id":"n-fc9a460f","guard":[["has","togo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Togo or Portugal":"Togo has the smaller life expectancy (54.7 years against 75.8 years)."}}},
{"id":"n-fcd7fad8","guard":[["has","libya"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Kenya or Libya":"Kenya has the smaller life expectancy (48 years against 75.5 years)."}}},
{"id":"n-fdeb689c","guard":[["has","comoros"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Comoros or Ghana":"Ghana has the smaller life expectancy (57.4 years against 60 years)."}}},
{"id":"n-fdf4545d","guard":[["hasAny",["barbados","expectancy","life","malawi","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose life expectancy is smaller: Barbados or Malawi":"Malawi has the smaller life expectancy (37.6 years against 73 years)."}}},
{"id":"n-ffa756d9","guard":[["hasAny",["myanmar","smaller"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the smaller life expectancy, Myanmar or El Salvador":"Myanmar has the smaller life expectancy (54.9 years against 69.7 years)."}}},
{"id":"n-04a97536","guard":[["hasAny",["liberia","normalise","normalize","simplify the text"]],["has","which"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":3}]],"mem":null},
{"id":"n-066d36e0","guard":[["hasAny",["each word","invert case","liberia","split into words","swap case","toggle case"]],["has","has"]],"pyramid":["render.and",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-0673d483","guard":[["hasAny",["liberia","separate by","split","split by"]],["has","has"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Djibouti"}]],"mem":null},
{"id":"n-093932f6","guard":[["hasAny",["liberia","normalise","normalize","simplify the text"]],["has","which"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":2}]],"mem":null},
{"id":"n-0e659f38","guard":[["hasAny",["a to z","alphabetical","alphabetize","each word","liberia","split into words"]],["has","has"]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-0fb582c6","guard":[["has","liberia"],["has","has"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],{"lit":1}]],"mem":null},
{"id":"n-13d33c60","guard":[["hasAny",["delete","liberia","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Angola"}]],"mem":null},
{"id":"n-1a8dc065","guard":[["hasAny",["liberia","separate by","split","split by"]],["has","has"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Burkina Faso"}]],"mem":null},
{"id":"n-200a0fc2","guard":[["hasAny",["a to z","alphabetical","alphabetize","each word","liberia","split into words"]],["has","has"]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-23695475","guard":[["hasAny",["capitalise","capitalize","capitalize each word","liberia","reverse the words","reverse word order","title case","words backwards"]],["has","has"]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-25d80fc4","guard":[["hasAny",["bangladesh","delete","remove","strip out","without"]],["has","russia"]],"pyramid":["render.str",["transform.remove",{"lit":"Bangladesh"},["sense.lastWord"]]],"mem":null},
{"id":"n-2e9d2986","guard":[["hasAny",["delete","liberia","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"East Timor"}]],"mem":null},
{"id":"n-3787b819","guard":[["hasAny",["delete","liberia","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Bangladesh"}]],"mem":null},
{"id":"n-38db3dda","guard":[["hasAny",["each word","liberia","lower case","lowercase","small letters","split into words"]],["has","has"]],"pyramid":["render.and",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-3cc46e67","guard":[["hasAny",["liberia","separate by","split","split by"]],["has","has"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Bangladesh"}]],"mem":null},
{"id":"n-4ea7b492","guard":[["hasAny",["each word","liberia","lower case","lowercase","small letters","split into words"]],["has","has"]],"pyramid":["render.list",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-585fdc03","guard":[["hasAny",["bulgaria","delete","remove","strip out","without"]],["has","mauritius"]],"pyramid":["render.str",["transform.remove",{"lit":"Bulgaria"},["sense.lastWord"]]],"mem":null},
{"id":"n-598d39f2","guard":[["hasAny",["delete","liberia","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Bulgaria"}]],"mem":null},
{"id":"n-5b170d52","guard":[["hasAny",["liberia","separate by","split","split by"]],["has","has"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Equatorial Guinea"}]],"mem":null},
{"id":"n-5bf9df8a","guard":[["hasAny",["all caps","capital letters","capitals","each word","liberia","split into words","upper case","uppercase"]],["has","has"]],"pyramid":["render.lines",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-71f8259e","guard":[["hasAny",["first n","grenadines","take","top"]],["has","smaller"]],"pyramid":["render.and",["transform.takeStrs",["sense.list"],{"lit":2}]],"mem":null},
{"id":"n-72f1870a","guard":[["hasAny",["liberia","separate by","split","split by"]],["has","has"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Ecuador"}]],"mem":null},
{"id":"n-74409003","guard":[["hasAny",["delete","liberia","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Equatorial Guinea"}]],"mem":null},
{"id":"n-77a73809","guard":[["hasAny",["backwards","each word","liberia","reverse","reverse order","reversed","split into words"]],["has","has"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-7fb0e759","guard":[["hasAny",["capitalise","capitalize","capitalize each word","each word","liberia","split into words","title case"]],["has","has"]],"pyramid":["render.lines",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-8b8c4a09","guard":[["hasAny",["delete","ecuador","remove","strip out","without"]],["has","life"]],"pyramid":["render.str",["transform.remove",{"lit":"Ecuador"},["sense.lastWord"]]],"mem":null},
{"id":"n-8de59495","guard":[["hasAny",["costa","element","item number","nth","position"]],["has","life"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-91b7853e","guard":[["hasAny",["all caps","capital letters","capitals","each word","liberia","split into words","upper case","uppercase"]],["has","has"]],"pyramid":["render.list",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-91e61c0e","guard":[["hasAny",["liberia","separate by","split","split by"]],["has","has"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"Angola"}]],"mem":null},
{"id":"n-9490a5db","guard":[["hasAny",["invert case","liberia","reverse the words","reverse word order","swap case","toggle case","words backwards"]],["has","has"]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-9a1e3e25","guard":[["hasAny",["brazil","delete","remove","strip out","without"]],["has","honduras"]],"pyramid":["render.str",["transform.remove",{"lit":"Brazil"},["sense.lastWord"]]],"mem":null},
{"id":"n-9af37601","guard":[["hasAny",["liberia","lower case","lowercase","reverse the words","reverse word order","small letters","words backwards"]],["has","has"]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["sense.subject"]]]],"mem":null},
{"id":"n-9dd5ba4e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","each word","liberia","split into words","title case"]],["has","has"]],"pyramid":["render.list",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-a38e49dd","guard":[["hasAny",["backwards","each word","liberia","reverse","reverse order","reversed","split into words"]],["has","has"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-a99877ca","guard":[["hasAny",["each word","invert case","liberia","split into words","swap case","toggle case"]],["has","has"]],"pyramid":["render.list",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-b3a0eca0","guard":[["hasAny",["backwards","each word","liberia","reverse","reverse order","reversed","split into words"]],["has","has"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-b6bfb162","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","liberia","swap case","title case","toggle case"]],["has","has"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-beaf99cf","guard":[["hasAny",["each word","liberia","lower case","lowercase","small letters","split into words"]],["has","has"]],"pyramid":["render.lines",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-c124752b","guard":[["hasAny",["delete","liberia","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Djibouti"}]],"mem":null},
{"id":"n-c7433b33","guard":[["hasAny",["each word","invert case","liberia","split into words","swap case","toggle case"]],["has","has"]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-cb186cf4","guard":[["hasAny",["liberia","separate by","split","split by"]],["has","has"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"East Timor"}]],"mem":null},
{"id":"n-cec48d08","guard":[["hasAny",["all caps","capital letters","capitals","each word","liberia","split into words","upper case","uppercase"]],["has","has"]],"pyramid":["render.and",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-d1164e34","guard":[["hasAny",["delete","liberia","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Ecuador"}]],"mem":null},
{"id":"n-db3c0374","guard":[["hasAny",["each word","liberia","shortest","shortest one","shortest word","split into words"]],["has","has"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-dd732f6c","guard":[["hasAny",["alphabetize the letters","laos","letters in order","shortest","shortest one","shortest word","sort the letters"]],["has","life"]],"pyramid":["render.str",["transform.sortLetters",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-de2da309","guard":[["hasAny",["delete","liberia","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Burkina Faso"}]],"mem":null},
{"id":"n-e06c9e04","guard":[["hasAny",["all caps","capital letters","capitals","liberia","reverse the words","reverse word order","upper case","uppercase","words backwards"]],["has","has"]],"pyramid":["render.str",["transform.reverseWords",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-e66c3412","guard":[["hasAny",["a to z","alphabetical","alphabetize","each word","liberia","split into words"]],["has","has"]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-e9051cfe","guard":[["hasAny",["capitalise","capitalize","capitalize each word","each word","liberia","split into words","title case"]],["has","has"]],"pyramid":["render.and",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-ec636fd8","guard":[["hasAny",["delete","liberia","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"Brazil"}]],"mem":null},
{"id":"n-01b3c9b7","guard":[["hasAny",["costa","from position","items from to","slice"]],["has","life"]],"pyramid":["render.and",["transform.sliceStrs",["sense.words"],{"lit":10},["sense.wordCount"]]],"mem":null},
{"id":"n-0d49591c","guard":[["hasAny",["change to","liberia","replace","substitute","swap"]],["has","has"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-169ac178","guard":[["hasAny",["costa","from position","items from to","slice"]],["has","life"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],{"lit":10},{"lit":12}]],"mem":null},
{"id":"n-30b7a8bc","guard":[["hasAny",["costa","from position","items from to","slice"]],["has","life"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],{"lit":10},["sense.wordCount"]]],"mem":null},
{"id":"n-50a847b2","guard":[["hasAny",["costa","from position","items from to","slice"]],["has","life"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.words"],{"lit":10},{"lit":12}]],"mem":null},
{"id":"n-974dbee0","guard":[["hasAny",["costa","from position","items from to","slice"]],["has","life"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.words"],{"lit":10},["sense.wordCount"]]],"mem":null},
{"id":"n-97ee4460","guard":[["hasAny",["costa","from position","items from to","slice"]],["has","life"]],"pyramid":["render.and",["transform.sliceStrs",["sense.words"],{"lit":10},{"lit":12}]],"mem":null},
{"id":"n-20670fb3","guard":[["hasAny",["element","item number","liberia","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":["Liberia ",{"slot":0}," the ",{"slot":1}," life ",{"slot":2}," (51 years against 57.4 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3d932c86","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","states"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," expectancy (66 years against 77.1 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-448ae527","guard":[["hasAny",["cook","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","uruguay"]],"pyramid":["render.template",{"lit":["Cook Islands ",{"slot":0}," the smaller ",{"slot":1}," ",{"slot":2}," (71.1 years against 75.2 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4c777cff","guard":[["hasAny",["element","greenland","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","czech"]],"pyramid":["render.template",{"lit":["Greenland ",{"slot":0}," the smaller ",{"slot":1}," ",{"slot":2}," (68.1 years against 74.5 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-756e2c1f","guard":[["hasAny",["element","item number","longest","longest one","longest word","nepal","nth","position"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the smaller ",{"slot":1}," ",{"slot":2}," (57.8 years against 75.6 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7998cd6e","guard":[["hasAny",["cook","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","uruguay"]],"pyramid":["render.template",{"lit":["Cook Islands ",{"slot":0}," the ",{"slot":1}," life ",{"slot":2}," (71.1 years against 75.2 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7b94c445","guard":[["hasAny",["element","item number","longest","longest one","longest word","nepal","nth","position","shortest","shortest one","shortest word"]],["has","puerto"]],"pyramid":["render.template",{"lit":["Nepal ",{"slot":0}," the smaller ",{"slot":1}," ",{"slot":2}," (57.8 years against 75.6 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8b2d75e2","guard":[["hasAny",["element","hong","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","lebanon"]],"pyramid":["render.template",{"lit":["Lebanon ",{"slot":0}," the smaller ",{"slot":1}," ",{"slot":2}," (71.3 years against 79.5 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a2c58096","guard":[["hasAny",["element","item number","liberia","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Liberia ",{"slot":0}," the smaller ",{"slot":1}," ",{"slot":2}," (51 years against 57.4 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b64d4979","guard":[["hasAny",["element","item number","nepal","nth","position","shortest","shortest one","shortest word"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," expectancy (57.8 years against 75.6 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-d6d02394","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","states"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the smaller ",{"slot":1}," ",{"slot":2}," (66 years against 77.1 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ea662178","guard":[["hasAny",["element","hong","item number","nth","position","shortest","shortest one","shortest word"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," expectancy (71.3 years against 79.5 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-ff563906","guard":[["hasAny",["element","hong","item number","longest","longest one","longest word","nth","position"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the smaller ",{"slot":1}," ",{"slot":2}," (71.3 years against 79.5 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ff845271","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","states"]],["has","ukraine"]],"pyramid":["render.template",{"lit":["Ukraine ",{"slot":0}," the smaller ",{"slot":1}," ",{"slot":2}," (66 years against 77.1 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-087dd0e0","guard":[["hasAny",["element","greenland","item number","nth","position","shortest","shortest one","shortest word"]],["has","czech"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," expectancy (68.1 years against 74.5 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-5bf82ea4","guard":[["hasAny",["cook","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","uruguay"]],"pyramid":["render.template",{"lit":["Cook Islands ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," expectancy (71.1 years against 75.2 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-64d9230f","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","samoa"]],["has","el"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the smaller ",{"slot":1}," ",{"slot":2}," (69.2 years against 69.7 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9eef48e0","guard":[["hasAny",["cook","element","item number","longest","longest one","longest word","nth","position"]],["has","uruguay"]],"pyramid":["render.template",{"lit":["Cook Islands has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (71.1 years against 75.2 years)."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b25aed09","guard":[["hasAny",["element","item number","liberia","longest","longest one","longest word","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Liberia has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (51 years against 57.4 years)."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b9381622","guard":[["hasAny",["element","greenland","item number","longest","longest one","longest word","nth","position"]],["has","czech"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the smaller ",{"slot":1}," ",{"slot":2}," (68.1 years against 74.5 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c40881cf","guard":[["hasAny",["element","hong","item number","nth","position","shortest","shortest one","shortest word"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-d84a5b6d","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","samoa"]],["has","el"]],"pyramid":["render.template",{"lit":["Samoa ",{"slot":0}," the smaller ",{"slot":1}," ",{"slot":2}," (69.2 years against 69.7 years)."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e96c64cb","guard":[["hasAny",["element","item number","liberia","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Liberia ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," expectancy (51 years against 57.4 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-edfad61e","guard":[["hasAny",["element","item number","nepal","nth","position","shortest","shortest one","shortest word"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-f0b987af","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","states"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-0b70d31f","guard":[["hasAny",["element","guatemala","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (66.2 years against 71.4 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0da25da0","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","position","shortest","shortest one","shortest word","states","upper case","uppercase"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-1e6ad1e7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","hong","item number","nth","position","shortest","shortest one","shortest word","title case"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1f4f26ce","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","reunion","shortest","shortest one","shortest word"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.6 years against 72.7 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-21e6f464","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","states"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2c9eafcc","guard":[["hasAny",["element","hong","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-31945887","guard":[["hasAny",["angola","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (38.3 years against 76.9 years)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-368b7844","guard":[["hasAny",["element","item number","lower case","lowercase","nepal","nth","position","shortest","shortest one","shortest word","small letters"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3a4220bc","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nepal","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-591d0c3c","guard":[["hasAny",["element","item number","lesotho","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","turkey"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (50.8 years against 71 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-69dc2453","guard":[["hasAny",["element","greenland","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.1 years against 78 years)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6e1afca3","guard":[["hasAny",["element","greenland","item number","nth","position","shortest","shortest one","shortest word"]],["has","czech"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (68.1 years against 74.5 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-731794a8","guard":[["hasAny",["all caps","capital letters","capitals","element","hong","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-74b6ded3","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","states"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7aa03749","guard":[["hasAny",["element","hong","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8bd9f35c","guard":[["hasAny",["element","hong","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8f738a8a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","shortest","shortest one","shortest word","states","title case"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-91637d49","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (52.4 years against 67.9 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-95d542d0","guard":[["hasAny",["element","invert case","item number","nth","position","shortest","shortest one","shortest word","states","swap case","toggle case"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a5e1fafa","guard":[["hasAny",["element","item number","nth","position","samoa"]],["has","el"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," expectancy (69.2 years against 69.7 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-c39c845e","guard":[["hasAny",["element","item number","longest","longest one","longest word","madagascar","nth","position","shortest","shortest one","shortest word"]],["has","venezuela"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (55 years against 73.1 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c5399352","guard":[["hasAny",["djibouti","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (50.8 years against 68.6 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c58ef8ac","guard":[["hasAny",["element","item number","laos","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (53.1 years against 69.9 years)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ccc21753","guard":[["hasAny",["element","invert case","item number","nepal","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-cea53337","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","portugal","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (54.7 years against 75.8 years)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d4ca3010","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nepal","nth","position","shortest","shortest one","shortest word","title case"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e5939403","guard":[["hasAny",["aruba","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (69.9 years against 78.4 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e9e5c80c","guard":[["hasAny",["element","item number","longest","longest one","longest word","nepal","nth","position","shortest","shortest one","shortest word"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ffe07ec2","guard":[["hasAny",["belgium","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71 years against 77.8 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-001fe672","guard":[["hasAny",["element","item number","longest","longest one","longest word","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","states"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["transform.lower",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-024ebe8d","guard":[["hasAny",["element","greenland","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","czech"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (68.1 years against 74.5 years)."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-03e330f3","guard":[["hasAny",["afghanistan","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (45.9 years against 64.1 years)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-08526349","guard":[["hasAny",["cook","element","item number","longest","longest one","longest word","nth","position"]],["has","uruguay"]],"pyramid":["render.template",{"lit":["Cook Islands ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.1 years against 75.2 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-139bcf17","guard":[["hasAny",["element","hong","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["transform.nthStr",["sense.words"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-14b7f642","guard":[["hasAny",["element","item number","liberia","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Liberia ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (51 years against 57.4 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-17d0e8fc","guard":[["hasAny",["aruba","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (69.9 years against 78.4 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-243f290e","guard":[["hasAny",["each word","element","hong","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-28578762","guard":[["hasAny",["element","greenland","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","czech"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (68.1 years against 74.5 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2b79c821","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","greenland","item number","nth","position","shortest","shortest one","shortest word","title case"]],["has","czech"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (68.1 years against 74.5 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-32cb1879","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","reunion","shortest","shortest one","shortest word"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.6 years against 72.7 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3b663382","guard":[["hasAny",["element","greenland","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","czech"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (68.1 years against 74.5 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-423b8eb6","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","states"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-44ca0f97","guard":[["hasAny",["element","hong","item number","longest","longest one","longest word","nth","position"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-45107d53","guard":[["hasAny",["element","hong","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-46bb6db0","guard":[["hasAny",["angola","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (38.3 years against 76.9 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-51b673ba","guard":[["hasAny",["element","invert case","item number","longest","longest one","longest word","nepal","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-56b118d2","guard":[["hasAny",["element","item number","nepal","nth","position","shortest","shortest one","shortest word"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-57817fe3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","nepal","nth","position","shortest","shortest one","shortest word","title case"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-639b9ae2","guard":[["hasAny",["element","item number","laos","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (53.1 years against 69.9 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-67816656","guard":[["hasAny",["element","item number","liberia","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Liberia ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (51 years against 57.4 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6992aa2c","guard":[["hasAny",["each word","element","item number","nepal","nth","position","shortest","shortest one","shortest word","split into words"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6a141761","guard":[["hasAny",["element","islands","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","myanmar"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (54.9 years against 65.5 years)."]},["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6e3b9a1a","guard":[["hasAny",["element","greenland","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","czech"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (68.1 years against 74.5 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-747bd60a","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","states"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["transform.nthStr",["sense.words"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-750e1ee5","guard":[["hasAny",["djibouti","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (50.8 years against 68.6 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-75f196bb","guard":[["hasAny",["element","invert case","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","states","swap case","toggle case"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-77388e33","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","states"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-77508640","guard":[["hasAny",["element","hong","invert case","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7bdce340","guard":[["hasAny",["all caps","capital letters","capitals","element","hong","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["transform.upper",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7e95c4d3","guard":[["hasAny",["element","item number","longest","longest one","longest word","madagascar","nth","position","shortest","shortest one","shortest word"]],["has","venezuela"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (55 years against 73.1 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7f70ab3c","guard":[["hasAny",["element","item number","liberia","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":["Liberia ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (51 years against 57.4 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-80f7d20e","guard":[["hasAny",["element","item number","longest","longest one","longest word","lower case","lowercase","nepal","nth","position","shortest","shortest one","shortest word","small letters"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["transform.lower",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8372e389","guard":[["hasAny",["element","guatemala","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (66.2 years against 71.4 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8a66e10b","guard":[["hasAny",["cook","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","uruguay"]],"pyramid":["render.template",{"lit":["Cook Islands ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.1 years against 75.2 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a7d161ed","guard":[["hasAny",["element","item number","liberia","longest","longest one","longest word","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Liberia ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (51 years against 57.4 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a83d8e0e","guard":[["hasAny",["each word","element","hong","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a87faa4d","guard":[["hasAny",["element","item number","longest","longest one","longest word","nepal","nth","position","shortest","shortest one","shortest word"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["transform.nthStr",["sense.words"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-aada58b1","guard":[["hasAny",["cook","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","uruguay"]],"pyramid":["render.template",{"lit":["Cook Islands ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.1 years against 75.2 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-bf25a6b7","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","puerto","shortest","shortest one","shortest word"]],["has","qatar"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (72.4 years against 75.6 years)."]},["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c4149785","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","states"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (37.2 years against 77.1 years)."]},["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c44e2dfc","guard":[["hasAny",["element","hong","item number","longest","longest one","longest word","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["transform.lower",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c518f968","guard":[["hasAny",["each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words","states"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c5e803cb","guard":[["hasAny",["element","grenada","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (64.5 years against 79.5 years)."]},["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ca4a91e5","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","states","upper case","uppercase"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["transform.upper",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cc8149cb","guard":[["hasAny",["element","item number","longest","longest one","longest word","nepal","nth","position"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ccde1dce","guard":[["hasAny",["element","item number","lesotho","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","turkey"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (50.8 years against 71 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cf439064","guard":[["hasAny",["each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words","states"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cfa956b9","guard":[["hasAny",["element","hong","item number","nth","position","shortest","shortest one","shortest word"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-d47fbd79","guard":[["hasAny",["all caps","capital letters","capitals","element","greenland","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","czech"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (68.1 years against 74.5 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-ddded7f7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","states","title case"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e0ae3c06","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (52.4 years against 67.9 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e0e42e43","guard":[["hasAny",["element","item number","longest","longest one","longest word","nepal","nth","position","shortest","shortest one","shortest word"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e3b1cbf4","guard":[["hasAny",["cook","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","uruguay"]],"pyramid":["render.template",{"lit":["Cook Islands ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.1 years against 75.2 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e88af9f5","guard":[["hasAny",["element","goes into","how many whole times","integer division","item number","nth","position","sudan","whole division"]],["has","vincent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller life ",{"slot":2}," (56.6 years against 72.",{"slot":3}," years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"],["render.number",["transform.idiv",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-e9eb57be","guard":[["hasAny",["belgium","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71 years against 77.8 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ebc837ad","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","states"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ebd8bf6e","guard":[["hasAny",["each word","element","item number","nepal","nth","position","shortest","shortest one","shortest word","split into words"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ee711956","guard":[["hasAny",["element","item number","nth","position","samoa"]],["has","el"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (69.2 years against 69.7 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-f1a65670","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","longest","longest one","longest word","nepal","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["transform.upper",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f94acd7e","guard":[["hasAny",["element","greenland","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.1 years against 78 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-fc175c62","guard":[["hasAny",["element","item number","korea","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","nauru"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (60.8 years against 74.4 years)."]},["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ff0cce51","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","portugal","position","shortest","shortest one","shortest word"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (54.7 years against 75.8 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ff1eb696","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","hong","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","title case"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["transform.title",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-06dedcd2","guard":[["hasAny",["element","how many words","item number","longest","longest one","longest word","nth","number of words","panama","position","shortest","shortest one","shortest word","word count"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller life ",{"slot":2}," (75.",{"slot":3}," years against 76.5 years)."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["render.number",["aggregate.words",["sense.before",{"lit":"has"}]]]],"mem":null},
{"id":"n-08f33b3e","guard":[["hasAny",["element","first n","item number","longest","longest one","longest word","nth","position","reunion","shortest","shortest one","shortest word","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.6 years against 72.7 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0924eddc","guard":[["hasAny",["cook","element","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","uruguay"]],"pyramid":["render.template",{"lit":["Cook Islands ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.1 years against 75.2 years)."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-13743881","guard":[["hasAny",["element","first n","item number","longest","longest one","longest word","nth","position","reunion","shortest","shortest one","shortest word","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.6 years against 72.7 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-13beeab0","guard":[["hasAny",["cook","element","item number","longest","longest one","longest word","lower case","lowercase","nth","position","small letters"]],["has","uruguay"]],"pyramid":["render.template",{"lit":["Cook Islands ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.1 years against 75.2 years)."]},["transform.lower",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-14cd72dd","guard":[["hasAny",["belgium","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71 years against 77.8 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1e21cf54","guard":[["hasAny",["cook","element","item number","longest","longest one","longest word","nth","position"]],["has","uruguay"]],"pyramid":["render.template",{"lit":["Cook Islands ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.1 years against 75.2 years)."]},["transform.nthStr",["sense.words"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-21170ea8","guard":[["hasAny",["all caps","capital letters","capitals","cook","element","item number","longest","longest one","longest word","nth","position","upper case","uppercase"]],["has","uruguay"]],"pyramid":["render.template",{"lit":["Cook Islands ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.1 years against 75.2 years)."]},["transform.upper",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-21d4bad6","guard":[["hasAny",["each word","element","greenland","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","czech"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (68.1 years against 74.5 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2aebfe79","guard":[["hasAny",["element","first n","guatemala","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (66.2 years against 71.4 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2f8ae3e5","guard":[["hasAny",["angola","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (38.3 years against 76.9 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-33c286aa","guard":[["hasAny",["afghanistan","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (45.9 years against 64.1 years)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-33dab7db","guard":[["hasAny",["element","first n","item number","lesotho","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","turkey"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (50.8 years against 71 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3aa9caca","guard":[["hasAny",["djibouti","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (50.8 years against 68.6 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3daecf8d","guard":[["hasAny",["element","how many words","item number","longest","longest one","longest word","nth","number of words","position","shortest","shortest one","shortest word","thailand","word count"]],["has","libya"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller life ",{"slot":2}," (68.6 years against 75.",{"slot":3}," years)."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["render.number",["aggregate.words",["sense.before",{"lit":"has"}]]]],"mem":null},
{"id":"n-3eaae93a","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","samoa","small letters"]],["has","el"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (69.2 years against 69.7 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-42c72091","guard":[["hasAny",["aruba","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (69.9 years against 78.4 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-42d428de","guard":[["hasAny",["djibouti","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (50.8 years against 68.6 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-493da5a6","guard":[["hasAny",["element","first n","greenland","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.1 years against 78 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-50d41799","guard":[["hasAny",["element","how many words","item number","longest","longest one","longest word","nth","number of words","position","shortest","shortest one","shortest word","syria","word count"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller life ",{"slot":2}," (68.",{"slot":3}," years against 78.6 years)."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["render.number",["aggregate.words",["sense.before",{"lit":"has"}]]]],"mem":null},
{"id":"n-5503c5aa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","samoa","title case"]],["has","el"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (69.2 years against 69.7 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-55706af2","guard":[["hasAny",["element","item number","liberia","longest","longest one","longest word","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Liberia ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (51 years against 57.4 years)."]},["transform.nthStr",["sense.words"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-57dea9d2","guard":[["hasAny",["element","first n","item number","longest","longest one","longest word","madagascar","nth","position","shortest","shortest one","shortest word","take","top"]],["has","venezuela"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (55 years against 73.1 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5abf640c","guard":[["hasAny",["element","first n","greenland","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (68.1 years against 78 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5f53ed2c","guard":[["hasAny",["angola","element","how many vowels","item number","longest","longest one","longest word","nth","number of vowels","position","shortest","shortest one","shortest word","vowel count"]],["has","yemen"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller life ",{"slot":2}," (38.3 years against 59.",{"slot":3}," years)."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["render.number",["aggregate.vowels",["sense.after",{"lit":"has"}]]]],"mem":null},
{"id":"n-628c1c2b","guard":[["hasAny",["element","greenland","item number","longest","longest one","longest word","nth","position"]],["has","czech"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (68.1 years against 74.5 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6ce6b213","guard":[["hasAny",["each word","element","item number","longest","longest one","longest word","nepal","nth","position","shortest","shortest one","shortest word","split into words"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-70385dd9","guard":[["hasAny",["each word","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words","states"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-70d2e87d","guard":[["hasAny",["cook","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","uruguay"]],"pyramid":["render.template",{"lit":["Cook Islands ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.1 years against 75.2 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-76862c07","guard":[["hasAny",["element","first n","guatemala","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (66.2 years against 71.4 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-79d87e8b","guard":[["hasAny",["element","invert case","item number","nth","position","samoa","swap case","toggle case"]],["has","el"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (69.2 years against 69.7 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8f5aa1aa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cook","element","item number","longest","longest one","longest word","nth","position","title case"]],["has","uruguay"]],"pyramid":["render.template",{"lit":["Cook Islands ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.1 years against 75.2 years)."]},["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-944e0ae2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","liberia","longest","longest one","longest word","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["Liberia ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (51 years against 57.4 years)."]},["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-98f27190","guard":[["hasAny",["bhutan","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (52.4 years against 67.9 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9d307d69","guard":[["hasAny",["each word","element","hong","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9ffa391a","guard":[["hasAny",["element","first n","item number","longest","longest one","longest word","madagascar","nth","position","shortest","shortest one","shortest word","take","top"]],["has","venezuela"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (55 years against 73.1 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ab7b0e64","guard":[["hasAny",["djibouti","element","how many vowels","item number","longest","longest one","longest word","nth","number of vowels","position","shortest","shortest one","shortest word","vowel count"]],["has","belarus"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller life ",{"slot":2}," (50.",{"slot":3}," years against 68 years)."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["render.number",["aggregate.vowels",["sense.after",{"lit":"has"}]]]],"mem":null},
{"id":"n-ae47cd27","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","liberia","longest","longest one","longest word","nth","position","upper case","uppercase"]],["has","which"]],"pyramid":["render.template",{"lit":["Liberia ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (51 years against 57.4 years)."]},["transform.upper",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b07b4037","guard":[["hasAny",["element","item number","liberia","longest","longest one","longest word","lower case","lowercase","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["Liberia ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (51 years against 57.4 years)."]},["transform.lower",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b1656af2","guard":[["hasAny",["element","invert case","item number","liberia","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","which"]],"pyramid":["render.template",{"lit":["Liberia ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (51 years against 57.4 years)."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b53a76a9","guard":[["hasAny",["element","first n","item number","lesotho","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","turkey"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (50.8 years against 71 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-bfe76dc7","guard":[["hasAny",["each word","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words","states"]],["has","ukraine"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (66 years against 77.1 years)."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c5991994","guard":[["hasAny",["element","item number","liberia","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Liberia ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (51 years against 57.4 years)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cbcc8316","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","position","samoa","upper case","uppercase"]],["has","el"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (69.2 years against 69.7 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-ccc9f238","guard":[["hasAny",["element","first n","item number","laos","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (53.1 years against 69.9 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cd070bdc","guard":[["hasAny",["element","how many vowels","item number","longest","longest one","longest word","nth","number of vowels","position","shortest","shortest one","shortest word","togo","vowel count"]],["has","malta"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller life ",{"slot":2}," (54.7 years against 77.",{"slot":3}," years)."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["render.number",["aggregate.vowels",["sense.before",{"lit":"has"}]]]],"mem":null},
{"id":"n-d470f498","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","samoa"]],["has","el"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (69.2 years against 69.7 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d54293ae","guard":[["hasAny",["belgium","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71 years against 77.8 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d90ef732","guard":[["hasAny",["each word","element","greenland","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","czech"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (68.1 years against 74.5 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-df6a3e49","guard":[["hasAny",["each word","element","hong","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words"]],["has","lebanon"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (71.3 years against 79.5 years)."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e6f6b498","guard":[["hasAny",["aruba","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (69.9 years against 78.4 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e9e9954b","guard":[["hasAny",["angola","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (38.3 years against 76.9 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ecfa151d","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","samoa"]],["has","el"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (69.2 years against 69.7 years)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f0e20a5d","guard":[["hasAny",["comoros","element","how many words","item number","longest","longest one","longest word","nth","number of words","position","shortest","shortest one","shortest word","word count"]],["has","finland"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller life ",{"slot":2}," (60 years against 77.",{"slot":3}," years)."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["render.number",["aggregate.words",["sense.after",{"lit":"has"}]]]],"mem":null},
{"id":"n-f1d63d2d","guard":[["hasAny",["element","first n","item number","longest","longest one","longest word","nth","portugal","position","shortest","shortest one","shortest word","take","top"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (54.7 years against 75.8 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f2304a90","guard":[["hasAny",["bhutan","element","first n","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (52.4 years against 67.9 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f2c006ac","guard":[["hasAny",["element","first n","item number","longest","longest one","longest word","nth","portugal","position","shortest","shortest one","shortest word","take","top"]],["has","smaller"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (54.7 years against 75.8 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f2c93493","guard":[["hasAny",["element","first n","item number","laos","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (53.1 years against 69.9 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f4fd6751","guard":[["hasAny",["each word","element","item number","longest","longest one","longest word","nepal","nth","position","shortest","shortest one","shortest word","split into words"]],["has","puerto"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (57.8 years against 75.6 years)."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f7b2f153","guard":[["hasAny",["element","greenland","item number","nth","position","shortest","shortest one","shortest word"]],["has","czech"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (68.1 years against 74.5 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-25524bb0","guard":[["hasAny",["element","item number","nth","position","samoa"]],["has","el"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (69.2 years against 69.7 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-3930bca5","guard":[["hasAny",["cook","each word","element","item number","longest","longest one","longest word","nth","position","split into words"]],["has","uruguay"]],"pyramid":["render.template",{"lit":["Cook Islands ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.1 years against 75.2 years)."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4f792653","guard":[["hasAny",["afghanistan","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (45.9 years against 64.1 years)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-502442b5","guard":[["hasAny",["each word","element","item number","nth","position","samoa","split into words"]],["has","el"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (69.2 years against 69.7 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a617ab58","guard":[["hasAny",["afghanistan","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","life"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (45.9 years against 64.1 years)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-af9fe17d","guard":[["hasAny",["cook","each word","element","item number","longest","longest one","longest word","nth","position","split into words"]],["has","uruguay"]],"pyramid":["render.template",{"lit":["Cook Islands ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (71.1 years against 75.2 years)."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c685abad","guard":[["hasAny",["each word","element","item number","liberia","longest","longest one","longest word","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["Liberia ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (51 years against 57.4 years)."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c7b8ec5b","guard":[["hasAny",["each word","element","item number","nth","position","samoa","split into words"]],["has","el"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the smaller ",{"slot":2}," ",{"slot":3}," (69.2 years against 69.7 years)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e08898b3","guard":[["hasAny",["each word","element","item number","liberia","longest","longest one","longest word","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["Liberia ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (51 years against 57.4 years)."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"whose life expectancy is smaller: Syria or Uganda","expect":{"contains":["Uganda"],"notContains":["Syria"],"notRefusal":true}},{"q":"between Trinidad and Tobago and South Korea, which has the lesser life expectancy","expect":{"contains":["Trinidad and Tobago"],"notContains":["South Korea"],"notRefusal":true}},{"q":"which has the smaller life expectancy, Nauru or Jamaica","expect":{"contains":["Nauru"],"notContains":["Jamaica"],"notRefusal":true}},{"q":"between Sudan and Saint Vincent and the Grenadines, which has the lesser life expectancy","expect":{"contains":["Sudan"],"notContains":["Saint Vincent and the Grenadines"],"notRefusal":true}},{"q":"which has the smaller life expectancy, Ecuador or Czech Republic","expect":{"contains":["Ecuador"],"notContains":["Czech Republic"],"notRefusal":true}},{"q":"which has the smaller life expectancy, Tajikistan or Israel","expect":{"contains":["Tajikistan"],"notContains":["Israel"],"notRefusal":true}},{"q":"whose life expectancy is smaller: Barbados or Malawi","expect":{"contains":["Malawi"],"notContains":["Barbados"],"notRefusal":true}},{"q":"between Somalia and Lesotho, which has the lesser life expectancy","expect":{"contains":["Somalia"],"notContains":["Lesotho"],"notRefusal":true}},{"q":"between Morocco and Iceland, which has the lesser life expectancy","expect":{"contains":["Morocco"],"notContains":["Iceland"],"notRefusal":true}},{"q":"whose life expectancy is smaller: Luxembourg or Kyrgyzstan","expect":{"contains":["Kyrgyzstan"],"notContains":["Luxembourg"],"notRefusal":true}},{"q":"which has the smaller life expectancy, Mauritania or Lebanon","expect":{"contains":["Mauritania"],"notContains":["Lebanon"],"notRefusal":true}},{"q":"between Denmark and Panama, which has the lesser life expectancy","expect":{"contains":["Panama"],"notContains":["Denmark"],"notRefusal":true}},{"q":"whose life expectancy is smaller: Bhutan or Tonga","expect":{"contains":["Bhutan"],"notContains":["Tonga"],"notRefusal":true}},{"q":"between Mali and Bolivia, which has the lesser life expectancy","expect":{"contains":["Mali"],"notContains":["Bolivia"],"notRefusal":true}},{"q":"between Saint Helena and Luxembourg, which has the lesser life expectancy","expect":{"contains":["Saint Helena"],"notContains":["Luxembourg"],"notRefusal":true}},{"q":"which has the smaller life expectancy, Grenada or Kuwait","expect":{"contains":["Grenada"],"notContains":["Kuwait"],"notRefusal":true}},{"q":"whose life expectancy is smaller: Afghanistan or Tajikistan","expect":{"contains":["Afghanistan"],"notContains":["Tajikistan"],"notRefusal":true}},{"q":"which has the smaller life expectancy, Kenya or Libya","expect":{"contains":["Kenya"],"notContains":["Libya"],"notRefusal":true}},{"q":"whose life expectancy is smaller: Lesotho or Turkey","expect":{"contains":["Lesotho"],"notContains":["Turkey"],"notRefusal":true}},{"q":"which has the smaller life expectancy, Uganda or Morocco","expect":{"contains":["Uganda"],"notContains":["Morocco"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
