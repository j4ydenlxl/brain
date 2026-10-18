// airline-country-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"airline-country-neo-g10","class":"airline-country","generation":10,"lane":"neo","grownFrom":["where is the airline Air Lituanica based","name the home country of OCEAN AIR CARGO","which country is the airline Kosmos from","name the home country of Spicejet","name the home country of Tianjin Airlines","which country is the airline Air Explore from","which country is the airline LSM Airlines from","which country is the airline Orbest from","which country is the airline Aero Contractors from","where is the airline Liberty Airways based","which country is the airline Aeronautica Militare from","which country is the airline Skywest Airlines from","where is the airline Yuzhmashavia based","name the home country of Alrosa Mirny Air Enterprise","which country is the airline Pobeda from","which country is the airline Hex'Air from","which country is the airline NEXT Brasil from","name the home country of bmi","where is the airline EuropeSky based","name the home country of Avient Aviation"],"version":1});

// <KERNEL>
const KERNEL_VERSION = 2;
const MAX_DEPTH = 64;
const MAX_LIST = 10000;
const MAX_BITS = 65536;
const MAX_TEXT = 100000;
const SAFE = 9007199254740991n;
const NEAR = 0.5;
const TYPES = Object.freeze(['text', 'num', 'nums', 'str', 'strs', 'bool', 'kv', 'tpl', 'mat']);
const FAMILIES = Object.freeze(['sense', 'transform', 'aggregate', 'compare', 'compute', 'memory', 'know', 'series', 'table', 'matrix', 'route', 'iterate', 'render']);
/** A matrix holds at most MAT_MAX rows and columns; its determinant and inverse are taken up to MAT_SOLVE. */
const MAT_MAX = 12;
const MAT_SOLVE = 10;
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
/** A matrix: 1 to MAT_MAX rows of one length (1 to MAT_MAX) of numbers. */
function isMat(v) { return Array.isArray(v) && v.length >= 1 && v.length <= MAT_MAX && Array.isArray(v[0]) && v[0].length >= 1 && v[0].length <= MAT_MAX && v.every((r) => Array.isArray(r) && r.length === v[0].length && r.every(isNum)); }
const CHECK = Object.freeze({
  text: (v) => typeof v === 'string', str: (v) => typeof v === 'string', num: isNum, bool: (v) => typeof v === 'boolean',
  nums: (v) => Array.isArray(v) && v.every(isNum), strs: (v) => Array.isArray(v) && v.every((s) => typeof s === 'string'),
  kv: isKv, tpl: isTpl, mat: isMat,
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
    KNOW.set(p.id, { id: p.id, cols: p.columns.slice(), col: new Map(p.columns.map((c, j) => [c, j])), rows: clean, keys: new Map(), grams: new Map(), series: new Map(), tables: new Map() });
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

// ---- series and long tables (the series and table families). A SERIES is a pack's value column read in the order of
// its key column: the keys order when every one is a date written YYYY, YYYY-MM or YYYY-MM-DD, or else every one is a
// number; a row whose value is no number is left out, and so is a key with two different values. A LONG TABLE holds one
// row per entity and time: a value is read by the pair (a pair with two different values is no answer), an entity's
// values in the order of its times, a time's values in the order of the entities' match forms. Both are built once per
// pack and columns while the pack is loaded, and neither depends on the order of the pack's rows.
// A date key: a year, a month or a day, and a day may carry a UTC time to the second ("2026-10-02T12:34:56Z").
const DATE_KEY = /^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?Z?)?)?)?$/;
const dateOrder = (m) => [m[2], m[3], m[4], m[5], m[6]].reduce((s, x) => s * 100 + Number(x || 0), Number(m[1])) + (m[7] ? Number('0.' + m[7]) : 0);
/** The place in order of each key (all dates, else all numbers), or null when the keys do not order. */
function orderOf(keys) {
  const ts = keys.map((k) => String(k).trim());
  if (!ts.length) return null;
  if (ts.every((t) => DATE_KEY.test(t))) return ts.map((t) => dateOrder(DATE_KEY.exec(t)));
  const ns = ts.map((t) => parseNum(t));
  return ns.every((x) => x !== null) ? ns.map(F) : null;
}
/** A cell as a number: a finite number, or text that is one (thousands commas allowed), else null. */
/** A float to 12 significant digits (the noise of float arithmetic on pack values goes); any other value as it is. */
function fx(v) { return typeof v === 'number' && Number.isFinite(v) && !Number.isInteger(v) ? Number(v.toPrecision(12)) + 0 : v; }
function cellNum(v) { return typeof v === 'number' ? fin(v) : typeof v === 'string' ? parseNum(v.trim()) : null; }
function seriesOf(id, kc, vc) {
  const p = typeof id === 'string' ? KNOW.get(id) : null;
  if (!p) return null;
  const ki = knowCol(p, kc), vi = knowCol(p, vc);
  if (ki < 0 || vi < 0 || ki === vi) return null;
  const tag = ki + ',' + vi;
  if (p.series.has(tag)) return p.series.get(tag);
  const by = new Map();
  for (const r of p.rows) {
    const k = knowCell(r[ki]), n = k === null ? '' : knowNorm(k), v = cellNum(r[vi]);
    if (!n || v === null) continue;
    const e = by.get(n);
    if (!e) by.set(n, { n, k, v, bad: false });
    else { if (cmp(e.v, v) !== 0) e.bad = true; if (k < e.k) e.k = k; }
  }
  const list = [...by.values()].filter((e) => !e.bad), os = orderOf(list.map((e) => e.k));
  let s = null;
  if (os) {
    // keys written two ways for one place in order (2020-2 and 2020-02) are one item when they agree, none when not
    const all = list.map((e, i) => ({ n: e.n, k: e.k, v: e.v, o: os[i] })).sort((a, b) => a.o - b.o || cmp(a.k, b.k));
    const items = [], at = new Map();
    for (let i = 0; i < all.length;) {
      let j = i;
      while (j < all.length && all[j].o === all[i].o) j++;
      const g = all.slice(i, j);
      if (g.every((x) => cmp(x.v, g[0].v) === 0)) { for (const x of g) at.set(x.n, items.length); items.push(g[0]); }
      i = j;
    }
    s = { items, at };
  }
  p.series.set(tag, s);
  return s;
}
function serIdx(s, key) { if (!s || typeof key !== 'string') return -1; const i = s.at.get(knowNorm(key)); return i === undefined ? -1 : i; }
/** The item a step from the key (0 the key's own), or null. */
function serItem(s, key, step) { const i = serIdx(s, key); return i < 0 ? null : s.items[i + step] ?? null; }
/** The items from one key to the other, both included, in order (either may come first). */
function serSpan(s, k1, k2) { const i = serIdx(s, k1), j = serIdx(s, k2); return i < 0 || j < 0 ? null : s.items.slice(Math.min(i, j), Math.max(i, j) + 1); }
function serPair(s, k1, k2) { const i = serIdx(s, k1), j = serIdx(s, k2); return i < 0 || j < 0 ? null : [s.items[i].v, s.items[j].v]; }
/** The key of the one largest (dir 1) or smallest (dir -1) value of items; null for none or a tie. */
function argExt(items, dir) {
  if (!ne(items)) return null;
  let best = items[0], tie = false;
  for (const x of items.slice(1)) { const c = cmp(x.v, best.v) * dir; if (c > 0) { best = x; tie = false; } else if (c === 0) tie = true; }
  return tie ? null : best;
}
function tableOf(id, ec, tc, vc) {
  const p = typeof id === 'string' ? KNOW.get(id) : null;
  if (!p) return null;
  const ei = knowCol(p, ec), ti = knowCol(p, tc), vi = knowCol(p, vc);
  if (ei < 0 || ti < 0 || vi < 0 || ei === ti || ei === vi || ti === vi) return null;
  const tag = ei + ',' + ti + ',' + vi;
  if (p.tables.has(tag)) return p.tables.get(tag);
  const pairs = new Map(), ents = new Map(), times = new Map();
  for (const r of p.rows) {
    const e = knowCell(r[ei]), t = knowCell(r[ti]), v = knowCell(r[vi]);
    const en = e === null ? '' : knowNorm(e), tn = t === null ? '' : knowNorm(t);
    if (!en || !tn || v === null) continue;
    if (!ents.has(en) || e < ents.get(en)) ents.set(en, e);
    if (!times.has(tn) || t < times.get(tn)) times.set(tn, t);
    const k = en + '\u0000' + tn, x = pairs.get(k), vn = knowNorm(v) || v;
    if (!x) pairs.set(k, { en, tn, v, vn, x: cellNum(r[vi]), bad: false });
    else if (x.vn !== vn) x.bad = true;
    else if (v < x.v) x.v = v;
  }
  const tl = [...times.keys()], os = orderOf(tl.map((tn) => times.get(tn)));
  const ord = os ? new Map(tl.map((tn, i) => [tn, os[i]])) : null;
  const byE = new Map(), byT = new Map();
  for (const x of pairs.values()) {
    if (x.bad) continue;
    const item = { en: x.en, tn: x.tn, e: ents.get(x.en), t: times.get(x.tn), v: x.v, x: x.x };
    (byE.get(x.en) || byE.set(x.en, []).get(x.en)).push(item);
    (byT.get(x.tn) || byT.set(x.tn, []).get(x.tn)).push(item);
  }
  if (ord) for (const l of byE.values()) l.sort((a, b) => ord.get(a.tn) - ord.get(b.tn) || cmp(a.tn, b.tn));
  for (const l of byT.values()) l.sort((a, b) => cmp(a.en, b.en));
  const t = { pairs, byE, byT, ord };
  p.tables.set(tag, t);
  return t;
}
function tabPair(t, e, time) {
  if (!t || typeof e !== 'string' || typeof time !== 'string') return null;
  const x = t.pairs.get(knowNorm(e) + '\u0000' + knowNorm(time));
  return x && !x.bad ? x : null;
}
/** An entity's items with a number, in time order (null when the times do not order). */
function tabNums(t, e) { if (!t || !t.ord || typeof e !== 'string') return null; const l = t.byE.get(knowNorm(e)); return l ? ne(l.filter((x) => x.x !== null)) : null; }
/** A time's items with a number, as { k: entity, v: number } in the order of the entities' match forms. */
function tabAt(t, time) { if (!t || typeof time !== 'string') return null; const l = t.byT.get(knowNorm(time)); return l ? ne(l.filter((x) => x.x !== null).map((x) => ({ k: x.e, v: x.x }))) : null; }

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

// ---- matrices (type mat): parsed from the prompt as [[1, 2], [3, 4]] or as rows split by ";" (1 2; 3 4), the entries
// exact (BigInt for integers) where the arithmetic is; a determinant of integers is exact (Bareiss), an inverse is taken
// in floats with each entry snapped to an integer within 1e-9 and otherwise to 12 significant digits; a singular one is null
const MAT_BRACKET = /\[\s*\[[^[\]]*\](?:\s*(?:,\s*)?\[[^[\]]*\])*\s*\]/g;
const MAT_ROWS = /-?\d+(?:\.\d+)?(?:(?:[ \t]*,[ \t]*|[ \t]+)-?\d+(?:\.\d+)?)*(?:[ \t]*;[ \t]*-?\d+(?:\.\d+)?(?:(?:[ \t]*,[ \t]*|[ \t]+)-?\d+(?:\.\d+)?)*)+/g;
function rowNums(s) { const ts = s.split(/[\s,]+/).filter(Boolean), xs = ts.map(parseNum); return xs.length && !xs.includes(null) ? xs : null; }
function matOfRows(rows) { const m = rows.map(rowNums); return m.every(Boolean) && isMat(m) ? m : null; }
/** The matrices a prompt writes, in prompt order (the first 4000 characters are read). */
function matricesIn(q) {
  if (typeof q !== 'string') return [];
  const src = q.slice(0, 4000), found = [];
  let rest = src;
  for (const m of src.matchAll(MAT_BRACKET)) {
    const mat = matOfRows([...m[0].matchAll(/\[([^[\]]*)\]/g)].map((x) => x[1]));
    if (mat) found.push([m.index, mat]);
    rest = rest.slice(0, m.index) + ' '.repeat(m[0].length) + rest.slice(m.index + m[0].length);
  }
  for (const m of rest.matchAll(MAT_ROWS)) { const mat = matOfRows(m[0].split(';')); if (mat) found.push([m.index, mat]); }
  return found.sort((a, b) => a[0] - b[0]).map((x) => x[1]);
}
function M(v) { if (!isMat(v)) throw new TypeError('not a matrix'); return v; }
function matT(m) { return M(m)[0].map((_, j) => m.map((r) => r[j])); }
function matZip(a, b, op) { M(a); M(b); return a.length === b.length && a[0].length === b[0].length ? a.map((r, i) => r.map((x, j) => op(x, b[i][j]))) : null; }
function matMul(a, b) {
  M(a); M(b);
  if (a[0].length !== b.length) return null;
  return a.map((r) => b[0].map((_, j) => { let s = 0; for (let k = 0; k < b.length; k++) s = add(s, mul(r[k], b[k][j])); return s; }));
}
function isSquare(m) { return isMat(m) && m.length === m[0].length && m.length <= MAT_SOLVE; }
function matId(n) { const k = int(n); return k !== null && k >= 1 && k <= MAT_MAX ? Array.from({ length: k }, (_, i) => Array.from({ length: k }, (x, j) => (i === j ? 1 : 0))) : null; }
/** A float near an integer (1e-9 relative) is that integer; any other to 12 significant digits. */
function snap(x) {
  if (typeof x !== 'number' || !Number.isFinite(x)) return null;
  const r = Math.round(x);
  return Math.abs(x - r) <= 1e-9 * Math.max(1, Math.abs(x)) ? r + 0 : Number(x.toPrecision(12)) + 0;
}
function detOf(m) {
  if (!isSquare(m)) return null;
  const n = m.length;
  if (m.every((r) => r.every(isInt))) { // Bareiss: every division is exact
    const a = m.map((r) => r.map(big));
    let sign = 1n, prev = 1n;
    for (let k = 0; k < n - 1; k++) {
      if (a[k][k] === 0n) {
        let s = k + 1;
        while (s < n && a[s][k] === 0n) s++;
        if (s === n) return 0;
        [a[k], a[s]] = [a[s], a[k]];
        sign = -sign;
      }
      for (let i = k + 1; i < n; i++) for (let j = k + 1; j < n; j++) a[i][j] = (a[i][j] * a[k][k] - a[i][k] * a[k][j]) / prev;
      prev = a[k][k];
    }
    return capB(sign * a[n - 1][n - 1]);
  }
  const a = m.map((r) => r.map(F));
  let d = 1;
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(a[i][k]) > Math.abs(a[p][k])) p = i;
    if (a[p][k] === 0) return 0;
    if (p !== k) { [a[k], a[p]] = [a[p], a[k]]; d = -d; }
    d *= a[k][k];
    for (let i = k + 1; i < n; i++) { const f = a[i][k] / a[k][k]; for (let j = k; j < n; j++) a[i][j] -= f * a[k][j]; }
  }
  return snap(d);
}
function invOf(m) {
  if (!isSquare(m)) return null;
  const d = detOf(m);
  if (d === null || F(d) === 0) return null;
  const n = m.length, a = m.map((r, i) => [...r.map(F), ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(a[i][k]) > Math.abs(a[p][k])) p = i;
    if (Math.abs(a[p][k]) < 1e-12) return null;
    [a[k], a[p]] = [a[p], a[k]];
    const pv = a[k][k];
    for (let j = 0; j < 2 * n; j++) a[k][j] /= pv;
    for (let i = 0; i < n; i++) if (i !== k && a[i][k] !== 0) { const f = a[i][k]; for (let j = 0; j < 2 * n; j++) a[i][j] -= f * a[k][j]; }
  }
  return a.map((r) => r.slice(n).map(snap));
}
function matPow(m, e) {
  const k = int(e);
  if (!isSquare(m) || k === null || k < 0 || k > 64) return null;
  let out = matId(m.length);
  for (let i = 0; i < k && out; i++) out = clean(matMul(out, m));
  return out;
}
/** An entry as text: an integer in full, any other number rounded to 6 decimal places. */
function matNum(v) { return typeof v === 'bigint' || Number.isInteger(v) ? plainNum(v) : plainNum(roundTo(v, 6)); }
function matText(m) { return '[' + M(m).map((r) => '[' + r.map(matNum).join(', ') + ']').join(', ') + ']'; }

// ---- text and code: identifier cases, substrings, codes, distances, base64, a path into JSON
/** The words of an identifier or a phrase: camelCase and PascalCase humps split, every run of what is not a letter or a digit a break. */
function idWords(s) { return s.slice(0, MAX_TEXT).replace(/(\p{Ll}|\p{N})(\p{Lu})/gu, '$1 $2').replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2').split(/[^\p{L}\p{N}]+/u).filter(Boolean).map((w) => w.toLowerCase()); }
function cap1(w) { return w ? w[0].toUpperCase() + w.slice(1) : w; }
function caseJoin(s, how) {
  const ws = idWords(s);
  if (!ws.length) return null;
  if (how === 'camel') return ws[0] + ws.slice(1).map(cap1).join('');
  if (how === 'pascal') return ws.map(cap1).join('');
  return ws.join(how === 'snake' ? '_' : '-');
}
function caesar(s, k) {
  const n = int(k);
  if (n === null) return null;
  const sh = ((n % 26) + 26) % 26;
  return s.replace(/[A-Za-z]/g, (ch) => { const b = ch <= 'Z' ? 65 : 97; return String.fromCharCode(((ch.charCodeAt(0) - b + sh) % 26) + b); });
}
function editDistance(a, b) {
  const x = [...a], y = [...b];
  if (x.length > 2000 || y.length > 2000) return null;
  let prev = Array.from({ length: y.length + 1 }, (_, j) => j);
  for (let i = 1; i <= x.length; i++) {
    const cur = [i];
    for (let j = 1; j <= y.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[y.length];
}
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function utf8Of(s) {
  const out = [];
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c >= 0xd800 && c <= 0xdfff) return null;
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return out;
}
/** UTF-8 bytes as text, or null when they are not well formed UTF-8. */
function utf8Text(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length;) {
    const b = bytes[i], n = b < 0x80 ? 0 : b >= 0xc2 && b < 0xe0 ? 1 : b >= 0xe0 && b < 0xf0 ? 2 : b >= 0xf0 && b < 0xf5 ? 3 : -1;
    if (n < 0 || i + n > bytes.length - 1) return null;
    let c = n ? b & (0x3f >> n) : b;
    for (let k = 1; k <= n; k++) { const x = bytes[i + k]; if ((x & 0xc0) !== 0x80) return null; c = (c << 6) | (x & 63); }
    if ((n === 2 && (c < 0x800 || (c >= 0xd800 && c <= 0xdfff))) || (n === 3 && (c < 0x10000 || c > 0x10ffff))) return null;
    s += String.fromCodePoint(c);
    i += n + 1;
  }
  return s;
}
function b64Encode(s) {
  const b = s.length <= MAX_TEXT ? utf8Of(s) : null;
  if (!b) return null;
  let out = '';
  for (let i = 0; i < b.length; i += 3) {
    const x = (b[i] << 16) | ((b[i + 1] ?? 0) << 8) | (b[i + 2] ?? 0);
    out += B64[(x >> 18) & 63] + B64[(x >> 12) & 63] + (i + 1 < b.length ? B64[(x >> 6) & 63] : '=') + (i + 2 < b.length ? B64[x & 63] : '=');
  }
  return out;
}
function b64Decode(t) {
  const s = t.trim();
  if (!s || s.length % 4 || s.length > MAX_TEXT || !/^[A-Za-z0-9+/]+={0,2}$/.test(s)) return null;
  const bytes = [];
  for (let i = 0; i < s.length; i += 4) {
    const v = [0, 1, 2, 3].map((k) => (s[i + k] === '=' ? 0 : B64.indexOf(s[i + k])));
    const x = (v[0] << 18) | (v[1] << 12) | (v[2] << 6) | v[3];
    bytes.push((x >> 16) & 255);
    if (s[i + 2] !== '=') bytes.push((x >> 8) & 255);
    if (s[i + 3] !== '=') bytes.push(x & 255);
  }
  return utf8Text(bytes);
}
/** The first JSON object the prompt writes (balanced braces outside strings, then JSON.parse), or null. */
function jsonIn(q) {
  if (typeof q !== 'string') return null;
  const src = q.slice(0, MAX_TEXT);
  for (let i = src.indexOf('{'), tries = 0; i >= 0 && tries < 20; i = src.indexOf('{', i + 1), tries++) {
    let depth = 0, str = false, j = i;
    for (; j < src.length; j++) {
      const ch = src[j];
      if (str) { if (ch === '\\') j++; else if (ch === '"') str = false; continue; }
      if (ch === '"') str = true;
      else if (ch === '{' || ch === '[') depth++;
      else if (ch === '}' || ch === ']') { depth--; if (depth === 0) break; }
    }
    if (depth !== 0) continue;
    try { const v = JSON.parse(src.slice(i, j + 1)); if (isKv(v)) return v; } catch { /* not JSON: the next brace */ }
  }
  return null;
}
/** The value at a dotted path of an object (a list step is a 0-based index) as text: a number in full, an object as JSON. */
function pathGet(obj, p) {
  let v = obj;
  for (const step of p.split('.')) {
    if (Array.isArray(v) && /^\d+$/.test(step)) v = v[Number(step)];
    else if (isKv(v) && Object.hasOwn(v, step)) v = v[step];
    else return null;
  }
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return plainNum(v);
  if (typeof v === 'boolean') return String(v);
  return v !== null && typeof v === 'object' ? jsonText(v) : null;
}
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
  P('sense.matrix', 'text', 'mat', 'matrix|the matrix|grid of numbers|array', (a, c) => matricesIn(c.q)[0] ?? null);
  P('sense.matrixAt', 'text num', 'mat', 'second matrix|the other matrix|nth matrix|matrix b', (a, c) => pick(matricesIn(c.q), N(a[0])));
  P('sense.json', 'text', 'kv', 'json|the object|this json|the record', (a, c) => jsonIn(c.q));

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
  P('transform.camel', 'str', 'str', 'camel case|camelcase|camelCase|lower camel case', (a) => caseJoin(S(a[0]), 'camel'));
  P('transform.pascal', 'str', 'str', 'pascal case|PascalCase|upper camel case|class name', (a) => caseJoin(S(a[0]), 'pascal'));
  P('transform.snake', 'str', 'str', 'snake case|snake_case|underscores|variable name', (a) => caseJoin(S(a[0]), 'snake'));
  P('transform.kebab', 'str', 'str', 'kebab case|kebab-case|hyphens|slug|dashes', (a) => caseJoin(S(a[0]), 'kebab'));
  P('transform.substr', 'str num num', 'str', 'characters from|substring|letters from to|slice of the text', (a) => { const ch = [...S(a[0]).slice(0, MAX_TEXT)], i = int(a[1]), j = int(a[2]); return i !== null && j !== null && i >= 1 && j >= i && i <= ch.length ? ch.slice(i - 1, j).join('') : null; });
  P('transform.charAt', 'str num', 'str', 'letter at|character at|nth letter|which letter', (a) => pick([...S(a[0]).slice(0, MAX_TEXT)], a[1]));
  P('transform.padStart', 'str num str', 'str', 'pad|pad with|leading zeros|zero pad|padded to', (a) => { const k = int(a[1]); return S(a[2]) && k !== null && k >= 0 && k <= MAX_TEXT ? S(a[0]).padStart(k, a[2]) : null; });
  P('transform.caesar', 'str num', 'str', 'caesar cipher|shift each letter|rot13|rotate the letters|shift by', (a) => caesar(S(a[0]), N(a[1])));
  P('transform.charCodes', 'str', 'nums', 'character codes|ascii codes|code points|unicode values|ascii', (a) => { const ch = [...S(a[0])]; return ch.length <= MAX_LIST ? ne(ch.map((x) => x.codePointAt(0))) : null; });
  P('transform.fromCodes', 'nums', 'str', 'from character codes|from ascii|decode the codes|which characters', (a) => { const xs = ne(NS(a[0])); return xs && xs.length <= MAX_LIST && xs.every((x) => isInt(x) && F(x) >= 0 && F(x) <= 0x10ffff && !(F(x) >= 0xd800 && F(x) <= 0xdfff)) ? String.fromCodePoint(...xs.map(Number)) : null; });
  P('transform.base64', 'str', 'str', 'base64|base 64|encode in base64|to base64', (a) => b64Encode(S(a[0])));
  P('transform.unbase64', 'str', 'str', 'decode base64|from base64|base64 decode|decode', (a) => b64Decode(S(a[0])));
  P('transform.get', 'kv str', 'str', 'the field|the value at|the key|get|path', (a) => (S(a[1]).trim() ? pathGet(KV(a[0]), a[1].trim()) : null));

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
  P('aggregate.indexOf', 'str str', 'num', 'position of|where does|index of|at which position', (a) => { const h = [...S(a[0]).slice(0, MAX_TEXT).toLowerCase()], n = [...S(a[1]).toLowerCase()]; if (!n.length) return null; for (let i = 0; i + n.length <= h.length; i++) if (n.every((ch, k) => h[i + k] === ch)) return i + 1; return null; });
  P('aggregate.commonLetter', 'str', 'str', 'most common letter|most frequent letter|which letter appears most', (a) => { const n = new Map(); for (const ch of S(a[0]).slice(0, MAX_TEXT).toLowerCase()) if (/\p{L}/u.test(ch)) n.set(ch, (n.get(ch) || 0) + 1); const top = Math.max(0, ...n.values()), best = [...n].filter(([, k]) => k === top); return top && best.length === 1 ? best[0][0] : null; });
  P('aggregate.lines', 'str', 'num', 'how many lines|number of lines|line count|lines of code', (a) => S(a[0]).replace(/\r\n?/g, '\n').replace(/\n+$/, '').split('\n').length);

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
  P('compute.editDistance', 'str str', 'num', 'edit distance|levenshtein|how many edits|changes to turn', (a) => editDistance(S(a[0]), S(a[1])));
  P('compute.hamming', 'str str', 'num', 'hamming distance|positions that differ|how many positions differ', (a) => { const x = [...S(a[0])], y = [...S(a[1])]; return x.length === y.length && x.length <= MAX_TEXT ? x.filter((ch, i) => ch !== y[i]).length : null; });

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

  // series: a pack's value column in the order of its key column; the keys come first, then the pack id, the key column
  // and the value column (literal arguments, as in know)
  const SER = (a, i) => seriesOf(S(a[i]), S(a[i + 1]), S(a[i + 2]));
  const span = (a) => serSpan(SER(a, 2), S(a[0]), S(a[1]));
  const pair = (a) => serPair(SER(a, 2), S(a[0]), S(a[1]));
  P('series.at', 'str str str str', 'num', 'in|at|value in|the value for', (a) => serItem(SER(a, 1), S(a[0]), 0)?.v ?? null);
  P('series.prev', 'str str str str', 'num', 'the one before|previous|the year before|prior', (a) => serItem(SER(a, 1), S(a[0]), -1)?.v ?? null);
  P('series.next', 'str str str str', 'num', 'the one after|next|the year after|following', (a) => serItem(SER(a, 1), S(a[0]), 1)?.v ?? null);
  P('series.prevKey', 'str str str str', 'str', 'the key before|which came before|the year before', (a) => serItem(SER(a, 1), S(a[0]), -1)?.k ?? null);
  P('series.nextKey', 'str str str str', 'str', 'the key after|which came next|the year after', (a) => serItem(SER(a, 1), S(a[0]), 1)?.k ?? null);
  P('series.step', 'str str str str', 'num', 'change from the one before|rise that year|fall that year|year on year', (a) => { const x = serItem(SER(a, 1), S(a[0]), 0), y = serItem(SER(a, 1), a[0], -1); return x && y ? fx(sub(x.v, y.v)) : null; });
  P('series.delta', 'str str str str str', 'num', 'change from|difference between|how much did it change|rise from', (a) => { const p = pair(a); return p ? fx(sub(p[1], p[0])) : null; });
  P('series.ratio', 'str str str str str', 'num', 'ratio|how many times|times as much', (a) => { const p = pair(a); return p ? fx(div(p[1], p[0])) : null; });
  P('series.change', 'str str str str str', 'num', 'percent change|percentage change|grew by|growth from', (a) => { const p = pair(a); return p ? fx(div(mul(sub(p[1], p[0]), 100), p[0])) : null; });
  P('series.mean', 'str str str str str', 'num', 'average from|mean between|average over|mean from', (a) => fx(meanOf(span(a)?.map((x) => x.v) ?? null)));
  P('series.sum', 'str str str str str', 'num', 'total from|sum over|altogether between', (a) => fx(sumOf(ne(span(a))?.map((x) => x.v) ?? null)));
  P('series.max', 'str str str str str', 'num', 'highest between|peak from|maximum over', (a) => sortNums(ne(span(a))?.map((x) => x.v) ?? null)?.at(-1) ?? null);
  P('series.min', 'str str str str str', 'num', 'lowest between|minimum over', (a) => sortNums(ne(span(a))?.map((x) => x.v) ?? null)?.[0] ?? null);
  P('series.window', 'str str str str str', 'nums', 'values from|from to|between', (a) => ne(span(a))?.map((x) => x.v) ?? null);
  P('series.argmaxIn', 'str str str str str', 'str', 'when was it highest between|peak year between', (a) => argExt(span(a), 1)?.k ?? null);
  P('series.argminIn', 'str str str str str', 'str', 'when was it lowest between|low year between', (a) => argExt(span(a), -1)?.k ?? null);
  P('series.higher', 'str str str str str', 'str', 'which was higher|which is larger|more in', (a) => { const p = pair(a); return p === null || cmp(p[0], p[1]) === 0 ? null : cmp(p[0], p[1]) > 0 ? serItem(SER(a, 2), a[0], 0).k : serItem(SER(a, 2), a[1], 0).k; });
  P('series.lower', 'str str str str str', 'str', 'which was lower|which is smaller|less in', (a) => { const p = pair(a); return p === null || cmp(p[0], p[1]) === 0 ? null : cmp(p[0], p[1]) < 0 ? serItem(SER(a, 2), a[0], 0).k : serItem(SER(a, 2), a[1], 0).k; });
  P('series.greater', 'str str str str str', 'bool', 'higher in|more than in|greater in', (a) => { const p = pair(a); return p ? cmp(p[0], p[1]) > 0 : null; });
  P('series.first', 'str str str', 'num', 'first value|earliest value|at the start', (a) => SER(a, 0)?.items[0]?.v ?? null);
  P('series.last', 'str str str', 'num', 'latest value|most recent|last value', (a) => SER(a, 0)?.items.at(-1)?.v ?? null);
  P('series.firstKey', 'str str str', 'str', 'first year|earliest|since when', (a) => SER(a, 0)?.items[0]?.k ?? null);
  P('series.lastKey', 'str str str', 'str', 'latest year|most recent year|last on record', (a) => SER(a, 0)?.items.at(-1)?.k ?? null);
  P('series.argmax', 'str str str', 'str', 'when was it highest|the year with the highest|peak year|record high', (a) => argExt(SER(a, 0)?.items, 1)?.k ?? null);
  P('series.argmin', 'str str str', 'str', 'when was it lowest|the year with the lowest|record low', (a) => argExt(SER(a, 0)?.items, -1)?.k ?? null);
  P('series.values', 'str str str', 'nums', 'all values|the whole series|every value', (a) => { const s = SER(a, 0); return s && s.items.length <= MAX_LIST ? ne(s.items.map((x) => x.v)) : null; });
  P('series.keys', 'str str str', 'strs', 'every year|all the years|the keys', (a) => { const s = SER(a, 0); return s && s.items.length <= MAX_LIST ? ne(s.items.map((x) => x.k)) : null; });
  P('series.countAbove', 'num str str str', 'num', 'how many years above|how many times over|count above', (a) => { const s = SER(a, 1), x = N(a[0]); return s ? s.items.filter((y) => cmp(y.v, x) > 0).length : null; });
  P('series.countBelow', 'num str str str', 'num', 'how many years below|how many times under|count below', (a) => { const s = SER(a, 1), x = N(a[0]); return s ? s.items.filter((y) => cmp(y.v, x) < 0).length : null; });

  // table: a long table, one row per entity and time; the entity and the time come first, then the pack id, the entity
  // column, the time column and the value column
  const TAB = (a, i) => tableOf(S(a[i]), S(a[i + 1]), S(a[i + 2]), S(a[i + 3]));
  P('table.get', 'str str str str str str', 'str', 'of in|for in|the value of in', (a) => tabPair(TAB(a, 2), S(a[0]), S(a[1]))?.v ?? null);
  P('table.at', 'str str str str str str', 'num', 'how much in|how many in|the number for in', (a) => tabPair(TAB(a, 2), S(a[0]), S(a[1]))?.x ?? null);
  P('table.latest', 'str str str str str', 'num', 'latest|most recent|current|now', (a) => tabNums(TAB(a, 1), S(a[0]))?.at(-1).x ?? null);
  P('table.latestKey', 'str str str str str', 'str', 'when was the latest|most recent year|last year on record for', (a) => tabNums(TAB(a, 1), S(a[0]))?.at(-1).t ?? null);
  P('table.earliest', 'str str str str str', 'num', 'earliest|first recorded|at the start', (a) => tabNums(TAB(a, 1), S(a[0]))?.[0].x ?? null);
  P('table.earliestKey', 'str str str str str', 'str', 'first year|since when|earliest year for', (a) => tabNums(TAB(a, 1), S(a[0]))?.[0].t ?? null);
  P('table.series', 'str str str str str', 'nums', 'over the years|every year of|the history of|all values of', (a) => { const l = tabNums(TAB(a, 1), S(a[0])); return l && l.length <= MAX_LIST ? l.map((x) => x.x) : null; });
  P('table.top', 'str str str str str', 'str', 'which had the most|the highest in|largest in|top in', (a) => argExt(tabAt(TAB(a, 1), S(a[0])), 1)?.k ?? null);
  P('table.bottom', 'str str str str str', 'str', 'which had the least|the lowest in|smallest in|bottom in', (a) => argExt(tabAt(TAB(a, 1), S(a[0])), -1)?.k ?? null);
  P('table.across', 'str str str str str', 'nums', 'all values in|every one in|across in', (a) => { const l = tabAt(TAB(a, 1), S(a[0])); return l && l.length <= MAX_LIST ? l.map((x) => x.v) : null; });
  P('table.rank', 'str str str str str str', 'num', 'rank|ranked|place in|position in', (a) => { const t = TAB(a, 2), x = tabPair(t, S(a[0]), S(a[1]))?.x ?? null, l = tabAt(t, a[1]); return x === null || !l ? null : 1 + l.filter((y) => cmp(y.v, x) > 0).length; });
  P('table.delta', 'str str str str str str str', 'num', 'change from to|difference between and for|how much did it grow', (a) => { const t = TAB(a, 3), x = tabPair(t, S(a[0]), S(a[1]))?.x ?? null, y = tabPair(t, a[0], S(a[2]))?.x ?? null; return x === null || y === null ? null : fx(sub(y, x)); });

  // matrix: shape, parts, arithmetic, determinant and inverse of small square ones
  P('matrix.rows', 'mat', 'num', 'how many rows|number of rows|rows', (a) => M(a[0]).length);
  P('matrix.cols', 'mat', 'num', 'how many columns|number of columns|columns', (a) => M(a[0])[0].length);
  P('matrix.shape', 'mat', 'str', 'shape|dimensions|size of the matrix|order of the matrix', (a) => M(a[0]).length + 'x' + a[0][0].length);
  P('matrix.row', 'mat num', 'nums', 'row|the row|nth row', (a) => pick(M(a[0]), a[1]));
  P('matrix.col', 'mat num', 'nums', 'column|the column|nth column', (a) => pick(matT(a[0]), a[1]));
  P('matrix.at', 'mat num num', 'num', 'entry|element at|row column|entry at', (a) => { const r = pick(M(a[0]), a[1]); return r ? pick(r, a[2]) : null; });
  P('matrix.transpose', 'mat', 'mat', 'transpose|transposed|flip rows and columns', (a) => matT(a[0]));
  P('matrix.add', 'mat mat', 'mat', 'add|add the matrices|sum of the matrices|plus|matrix sum', (a) => matZip(a[0], a[1], add));
  P('matrix.sub', 'mat mat', 'mat', 'subtract|subtract the matrices|difference of the matrices|minus', (a) => matZip(a[0], a[1], sub));
  P('matrix.mul', 'mat mat', 'mat', 'multiply|multiply the matrices|matrix product|product|times', (a) => matMul(a[0], a[1]));
  P('matrix.scale', 'mat num', 'mat', 'scale|multiply the matrix by|scalar multiple|times', (a) => { const k = N(a[1]); return M(a[0]).map((r) => r.map((x) => mul(x, k))); });
  P('matrix.det', 'mat', 'num', 'determinant|det', (a) => detOf(M(a[0])));
  P('matrix.inverse', 'mat', 'mat', 'inverse|invert|inverse matrix', (a) => invOf(M(a[0])));
  P('matrix.trace', 'mat', 'num', 'trace|sum of the diagonal', (a) => (isSquare(a[0]) || (isMat(a[0]) && a[0].length === a[0][0].length) ? sumOf(a[0].map((r, i) => r[i])) : null));
  P('matrix.identity', 'num', 'mat', 'identity matrix|identity|unit matrix', (a) => matId(N(a[0])));
  P('matrix.flatten', 'mat', 'nums', 'flatten|all entries|every entry|entries', (a) => M(a[0]).flat());
  P('matrix.power', 'mat num', 'mat', 'to the power|matrix power|squared|cubed', (a) => matPow(M(a[0]), N(a[1])));
  P('matrix.reshape', 'nums num', 'mat', 'arrange in rows|reshape|in rows|into a grid', (a) => { const xs = NS(a[0]), k = int(a[1]), c = k ? xs.length / k : 0; return k !== null && k >= 1 && k <= MAT_MAX && isInt(c) && c >= 1 && c <= MAT_MAX ? Array.from({ length: k }, (_, i) => xs.slice(i * c, i * c + c)) : null; });

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
  P('render.matrix', 'mat', 'str', 'matrix|as a matrix|in brackets', (a) => matText(a[0]));
  P('render.matrixRows', 'mat', 'str', 'rows|one row per line|as a grid', (a) => M(a[0]).map((r) => r.map(matNum).join(' ')).join('\n'));
  return Object.freeze(out);
}

// ---- evaluation: nodes, types, shape
function isLit(node) { return isKv(node) && Object.hasOwn(node, 'lit'); }
/** The argument types a node of this primitive carries (its in list without the implicit "text"), or null. */
function argTypes(name) {
  if (typeof name !== 'string') return null;
  if (Object.hasOwn(ARGS, name)) return ARGS[name].slice();
  const m = MACROS.get(name);
  return m ? m.in.slice() : null;
}
/**
 * Evaluate a node on a prompt and a mem: a value of the node's type, or null (a miss, never a guess). env holds the
 * argument values of the macro whose body is being evaluated: a { param: j } leaf is the j-th of them.
 */
function evalNode(node, q, mem, depth = 0, env = null) {
  try {
    if (depth > MAX_DEPTH) return null;
    if (isLit(node)) return clean(node.lit);
    if (env !== null && isParam(node)) return node.param < env.length ? env[node.param] : null;
    if (!Array.isArray(node) || typeof node[0] !== 'string') return null;
    if (!Object.hasOwn(PRIMS, node[0])) {
      const m = MACROS.get(node[0]);
      if (!m || node.length - 1 !== m.in.length) return null;
      const vals = [];
      for (let i = 1; i < node.length; i++) { const v = evalNode(node[i], q, mem, depth + 1, env); if (v === null) return null; vals.push(v); }
      return evalNode(m.body, q, mem, depth + 1, vals);
    }
    const p = PRIMS[node[0]], ts = ARGS[node[0]], n = node.length - 1;
    if (n < ts.length || (n > ts.length && !p.rest)) return null;
    const args = [];
    for (let i = 1; i <= n; i++) { const v = evalNode(node[i], q, mem, depth + 1, env); if (v === null && !p.lazy) return null; args.push(v); }
    return p.fn(args, { q: typeof q === 'string' ? q : '', mem: isKv(mem) ? mem : null });
  } catch { return null; }
}
/** Whether a node is well typed and yields the wanted type (any type when want is undefined). */
function wellTyped(node, want, depth = 0) {
  if (depth > MAX_DEPTH) return false;
  if (isLit(node)) return typeof want === 'string' && want !== 'text' && Object.hasOwn(CHECK, want) && CHECK[want](clean(node.lit));
  if (!Array.isArray(node) || typeof node[0] !== 'string') return false;
  if (!Object.hasOwn(PRIMS, node[0])) {
    const m = MACROS.get(node[0]);
    if (!m || (want !== undefined && m.out !== want) || node.length - 1 !== m.in.length) return false;
    for (let i = 1; i < node.length; i++) if (!wellTyped(node[i], m.in[i - 1], depth + 1)) return false;
    return true;
  }
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
  if (node.length === 1) return ['sense', 'memory'].includes(PRIMS[node[0]]?.family) || MACROS.has(node[0]); // a macro's own leaves were checked when it loaded
  return node.slice(1).every((x) => leavesOk(x, depth + 1));
}
/** The family of a primitive, or of a macro's apex primitive; null for any other name. */
function familyOfName(name) { return typeof name !== 'string' ? null : Object.hasOwn(PRIMS, name) ? PRIMS[name].family : MACROS.has(name) ? MACROS.get(name).family : null; }

// ---- macros (contract c6): composites of the primitives that grow/evolve.mjs mined from kept cells and a measured
// trial kept (neo/MACROS.json), loaded by macroLoad. A macro node ["macro.<slug>", a1, .., ak] is the macro's body with
// its { param: j } leaves bound to the VALUES of a1 .. ak: typed by the macro's in and out like a primitive, total like
// every node (a null argument is a null, a throw is a null, the depth bar holds inside the body too). A body names
// primitives only, never a macro, so no macro reaches itself; a compiled module carries the macros its cells name.
const MACROS = new Map();
const MACRO_NAME = /^macro\.[a-z0-9][a-z0-9-]{0,79}$/;
/** The most macros loaded, the largest body (nodes) and the most parameters a macro takes. */
const MACRO_MAX = 512;
const MACRO_MAX_SIZE = 48;
const MACRO_MAX_PARAMS = 8;
function isParam(node) { return isKv(node) && Number.isInteger(node.param) && node.param >= 0 && Object.keys(node).length === 1; }
/**
 * A macro checked: { name, body, in, out, family, params, size } frozen, or null. The body is a node of primitives whose
 * leaves are literals of their place's type, sense or memory primitives or { param: j } (j below params, each used,
 * each place of one type); the place types are its in (a given in must equal them), its apex primitive's out its out
 * (a given out must equal it).
 */
function macroOf(m) {
  if (!isKv(m) || typeof m.name !== 'string' || !MACRO_NAME.test(m.name) || Object.hasOwn(PRIMS, m.name)) return null;
  const k = m.params;
  if (!Number.isInteger(k) || k < 0 || k > MACRO_MAX_PARAMS || !Array.isArray(m.body) || !Object.hasOwn(PRIMS, m.body[0])) return null;
  const types = new Array(k).fill(undefined);
  let size = 0;
  const walk = (node, want, depth) => {
    if (++size > MACRO_MAX_SIZE || depth > MAX_DEPTH) return false;
    if (isParam(node)) {
      if (node.param >= k || typeof want !== 'string' || want === 'text') return false;
      if (types[node.param] !== undefined && types[node.param] !== want) return false;
      types[node.param] = want;
      return true;
    }
    if (isLit(node)) return typeof want === 'string' && want !== 'text' && Object.hasOwn(CHECK, want) && CHECK[want](clean(node.lit));
    if (!Array.isArray(node) || typeof node[0] !== 'string' || !Object.hasOwn(PRIMS, node[0])) return false;
    const p = PRIMS[node[0]], ts = ARGS[node[0]], n = node.length - 1;
    if ((want !== undefined && p.out !== want) || n < ts.length || (n > ts.length && !p.rest)) return false;
    if (n === 0 && !['sense', 'memory'].includes(p.family)) return false;
    for (let i = 1; i <= n; i++) if (!walk(node[i], i <= ts.length ? ts[i - 1] : p.rest, depth + 1)) return false;
    return true;
  };
  if (!walk(m.body, undefined, 0) || types.some((t) => t === undefined)) return null;
  if (m.in !== undefined && m.in !== null && !(Array.isArray(m.in) && m.in.length === k && m.in.every((t, j) => t === types[j]))) return null;
  const out = PRIMS[m.body[0]].out;
  if (m.out !== undefined && m.out !== null && m.out !== out) return null;
  const body = JSON.parse(JSON.stringify(m.body));
  return Object.freeze({ name: m.name, body, in: Object.freeze(types), out, family: PRIMS[m.body[0]].family, params: k, size });
}
/** Load macros: the registry becomes exactly the valid macros given (the first of a name wins, MACRO_MAX at most); their names. */
function macroLoad(list) {
  MACROS.clear();
  for (const m of Array.isArray(list) ? list : []) {
    if (MACROS.size >= MACRO_MAX) break;
    let e = null;
    try { e = macroOf(m); } catch { e = null; }
    if (e && !MACROS.has(e.name)) MACROS.set(e.name, e);
  }
  return [...MACROS.keys()];
}
/** The loaded macro of a name ({ name, body, in, out, family, params, size }), or null. */
function macroInfo(name) { return typeof name === 'string' && MACROS.has(name) ? MACROS.get(name) : null; }
/** A node with every loaded macro node replaced by its body, the arguments in place of the parameters (primitives only). */
function expandMacros(node, depth = 0, env = null) {
  if (depth > MAX_DEPTH) return node;
  if (env !== null && isParam(node)) return node.param < env.length ? env[node.param] : node;
  if (!Array.isArray(node) || typeof node[0] !== 'string') return node;
  const args = node.slice(1).map((c) => expandMacros(c, depth + 1, env));
  const m = Object.hasOwn(PRIMS, node[0]) ? null : MACROS.get(node[0]);
  return m && args.length === m.in.length ? expandMacros(m.body, depth + 1, args) : [node[0], ...args];
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
/** The guard features of a prompt, computed once and handed to guardWith for every guard tried on it. */
function promptFeatures(q) { return featuresOf(q); }
/** guardOk on the features of a prompt (promptFeatures): whether every feature of the guard holds. */
function guardWith(guard, f) { try { return isKv(f) && guardHolds(guard, f); } catch { return false; } }
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
  else if (familyOfName(c.pyramid[0]) !== 'render') errors.push('the apex is not a render primitive');
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
knowLoad([{"id":"openflights-airlines","columns":["airline code","airline","country"],"n":1033,"cols":[{"s":"RNX|MLA|AAA|AAF|AAR|AAS|AAW|TUS|ACP|ADE|AEA|AEE|AEL|AES|AEU|AEW|AFG|AFL|BON|SLI|AGV|AGX|PLI|BMM|AHY|AIA|BER|AIC|ABD|AIZ|AJM|AMC|AJX|AMU|AMV|ANG|ABY|ACA|BTI|ANZ|ARD|ARG|ATC|AUA|TUR|BGD|AXL|AXM|AZN|AZW|OCA|VUN|VIM|CCA|DAH|DHI|EIN|FIF|FJI|GAP|GRL|JAB|KKK|KZR|LUR|MLD|NIG|RLN|TWN|TYR|BHS|BKP|BPS|DAT|JOR|NKF|CPN|CPA|CCG|CLW|CAL|CGK|COM|CTN|CYP|DAO|DOA|UGX|ERT|LIL|TGZ|TAT|GFA|HAM|RAC|JAL|JZR|JSA|LAN|LTR|MAK|MGL|SCW|MYD|MEA|RNA|LBT|KNE|OHK|BCN|PUA|PMT|PIC|QTR|RJA|SEH|SUD|SWR|ESK|TCW|TGW|TNM|DTA|LAP|IYE|MAV|ESR|GIE|LOO|SKV|AWM|VVN|VUE|IIA|AMT|VAS|AUH|CYD|ADR|REA|AXZ|AEB|CDP|ARF|RSR|AMX|RPB|WER|DNV|AUL|LNE|AWU|GLG|SZB|TAO|IAM|RTE|PEL|RSU|WTA|DCD|RKA|LFA|RBG|REU|BTM|BOT|BUB|BUR|VBW|ABL|ACI|JZA|FWI|SNC|CEY|CVA|CUD|DLA|AXE|FLZ|UPA|AFR|GIP|GUY|AHO|FXI|AXB|AEY|EUD|KBZ|KZK|AKL|AKA|KOR|LTU|LXR|MDG|DRD|MJP|AML|CWM|MAU|BIE|MKG|TAH|NMB|ANK|ANT|ANE|ADH|PPL|MPD|RAR|RSH|SPM|RNE|ASL|SEY|ASD|WOW|RSI|VTA|THT|TSC|AVN|VTI|AWW|AWI|WAJ|XAX|RRJ|TRS|ABQ|SYL|ARE|FIX|AIR|RLA|ATM|TOK|ANO|LMU|ASA|AER|LAV|LBC|KYA|AZA|SMX|PYB|SSA|ANA|ALO|AAY|UTY|AAH|DRU|AWE|AAL|EGF|AAN|ANU|IWA|NAK|TFL|RNV|APW|ARU|AWA|RIT|ASZ|AYZ|FLI|ASQ|GTI|UJX|AUB|AUR|AUT|ABI|AVA|SMJ|AZU|CFE|EGH|BKF|BZE|BUU|BLL|BSX|BEU|BLS|BHP|BRU|BLV|BMJ|BRG|BVT|BBC|BGY|IBB|BSA|BPA|BWG|BLF|BBG|BOV|BTQ|BRS|BZH|BAW|BIH|LAJ|BMR|LZB|BQB|BCC|ICL|CCB|CIF|XBM|CCC|CEL|FCB|CLI|CAP|CDN|YCP|MPE|CNF|KAP|CGP|BWA|KRP|SMW|CAY|CEB|CLJ|CHW|CHQ|CES|CSN|CUA|CSX|CQN|YCC|CIM|RUS|SDR|GTA|CIX|BCY|CJC|CAW|CEO|EVC|UCA|CWK|CPZ|COE|CFG|CHP|KIS|COA|CMI|VCV|CMP|AAQ|CAI|CRL|CCM|CAN|CRO|CUB|CSA|DTR|KHB|DWT|DEA|DAL|DNM|DSY|DWA|DSV|DJB|UDN|DOB|MDO|DMO|UDC|HDA|DRK|DBK|DNL|DYA|ELK|QQQ|EVA|EGS|EHN|EZE|EAV|ELA|EAA|EFY|ECU|EDW|MSE|MSR|ELY|BRQ|UAE|EEA|ENJ|ENY|ERR|ELL|ETH|ETD|ECA|EEU|MJX|ELO|EUV|EAL|EWG|EIA|XLA|XEL|XSR|LHN|BTA|EZA|FYJ|FOX|EFA|QFZ|FDD|FXX|FIN|WBA|FFM|FAB|FCA|DAK|FLT|FWL|FVM|FZW|FBL|FDB|RWW|FRF|FJM|OTJ|FFV|FEG|FHI|LLC|NDC|FPT|BBO|BEE|FCM|GSM|FYH|FKA|VQI|FOS|FRE|FRL|FFT|FTA|FZA|GBL|CBG|GBK|GDR|GIA|GZP|GNN|GFG|FLB|GER|GXG|GMI|GWI|GHB|GLP|GOW|RLX|GJS|GLO|GAO|GMR|GDC|GCA|GLA|GFY|GBA|GFT|HAG|CHH|HAY|HHI|HNX|HLF|HPY|HAL|HBH|HBR|HFR|JBA|HTH|HEJ|IMP|FHE|OAW|HRM|HER|HWY|HYM|ADO|HCC|OME|CRK|HKE|QXE|HZA|RSY|IIR|IBE|IBS|IWD|IBX|ICE|ITX|IGO|IAC|IBU|AXC|IDX|AWQ|IDS|IAA|ILN|SUW|ITK|INE|ISK|IRA|IRC|IAW|MKU|ISX|ISW|ISV|ISR|IKA|JEX|JAZ|JGN|JAS|JAL|JAA|ZXY|JTA|JRB|JJA|JAI|RSP|EXS|JFU|JBU|JAF|JEF|JST|JJP|JTO|JNA|ENZ|JOY|DKH|JPU|JSR|KNI|KLC|KLM|KSY|KLS|KMF|KND|MVD|KDA|KEN|KQA|KHK|KFR|KIN|IRK|KGL|KBR|KEA|KAL|KGO|KSM|KOQ|KJC|KIL|KUH|KAC|KZU|LPR|LRC|DSM|LXP|LPE|LMM|LOT|YZZ|UWW|LTE|LTO|LAO|LTC|LDA|LIA|LTY|LAA|LBL|LAM|LNI|LIX|LOC|LJJ|LGW|DLH|GEC|CLH|LGL|MKD|MCA|MNB|MCK|IRM|MAS|MWI|MXD|SCW|MAC|MAH|MDL|MDA|MNO|MYP|MPH|MRS|MAA|MAI|MTW|MXL|MDP|ISS|MNA|ASH|MES|BTV|MXA|MXI|MJG|MDW|MEP|MWA|MIC|MDV|MON|ZTF|MGX|MAL|GAI|MSI|MYT|UBA|MMM|MYA|NXB|NAS|NCR|NJS|NTW|RON|NMA|EJA|NEA|NTJ|NLY|NIA|NOK|NGB|NCF|FNA|NTM|HMR|NWA|PLR|IBK|NAX|TFN|NLH|NVR|IXO|ONE|OAL|OMA|OAE|OTG|OHY|OBS|OBT|OAB|OAN|OAI|OAR|ORC|ORB|ORG|OEA|OGN|OLT|OLA|OZJ|PNR|PBA|PCO|PEC|PFL|PSA|NMI|PIA|PQW|PMW|IPV|PTB|PGT|PEN|PAL|PDT|FLG|PBD|POT|PAO|POE|PGA|PDC|PYA|PRF|PTI|QFA|QAX|RXR|RAB|RAY|RUE|RPO|RNY|RWZ|RXA|REP|RPA|RPH|SDM|RJD|RAC|RAM|RAW|RBA|RFJ|DME|RNA|PPW|RSJ|RLU|RSD|KRY|RWD|RYA|RYN|RYR|RAE|SBI|CNO|SAT|RZO|NSE|KOL|QER|SAE|STP|SZZ|SVG|SHD|SLC|SMY|SDI|BBR|SOV|SOZ|SVA|SAS|VSV|SCE|SCO|SAY|SQH|SBS|SGG|STU|SEN|SAI|CDG|CSH|SHA|CSZ|TCF|SIB|CSC|SRH|SLK|RMK|SIA|SQC|SGY|SKU|SWM|HSK|SXR|SKV|SKW|SJU|KCU|SKY|SIH|SNJ|SSV|SYX|SKX|OZW|ELC|SBD|OLS|SRB|SOL|SAA|SRQ|SPI|SEA|SOA|SOU|LTD|SWD|SJS|XAN|ZCS|SWA|JKK|SEJ|SAL|NKS|MNP|CQH|SJO|SRN|ALK|SJY|SFJ|HCW|SNB|SCX|ERO|SXS|KSZ|SLM|SJM|SWV|SWU|SWR|SYR|PSB|TJA|TCV|TAM|TAE|TPA|TAP|TIB|HLX|BLX|TIL|ROT|TAK|TXW|TEZ|TCG|AIQ|THA|TVJ|TCX|TOM|GCR|TGW|TKS|TMA|LOF|TNA|THS|THI|TYS|TNU|RGG|TSO|TTZ|TDK|TVF|TRA|TNS|TLA|NDN|ABS|TBZ|TVS|TGN|TOS|TUI|TAR|URN|THK|HVK|THY|TWD|TUA|TRK|TWB|TJT|TYR|UKM|USA|USH|UBG|GWY|UTA|UAT|AUI|UIA|UAC|UAL|UBD|AIO|UAY|SVR|UZB|VAX|VSP|VIA|MOV|VLM|VOE|VRN|VLU|VLO|VFC|CZV|SRY|VKJ|VJC|HVN|VKH|VRD|VIR|VOZ|VEX|VGN|VNP|VWA|VIS|RBY|VVM|VVC|VLK|VLE|VOI|VDA|VOO|VLG|WEB|WLC|CHB|WJA|WEN|WAL|WFX|WTJ|WIF|JET|WRC|WON|WZZ|WVL|WAU|WOA|WSS|XAU|SEU|XOJ|XPT|CXA|YEP|LLM|YEL|NYT|CYH|UMK|ZTT|ZZZ|TAN|PZY|ZNA|OOM|BMA|BMI|BAG|EZY|PKV","sep":"|"},{"f":"01Time Airline|040-Mile Air|0Ansett Australia|1igle Azur|1siana Airlines|2kari Aviation|1friqiyah Airways|1BSA - Aerolinhas Brasileiras|1stral Aviation|1da Air|1ir Europa|1egean Airlines|1ir Europe|1CES Colombia|1straeus|1erosvit Airlines|1riana Afghan Airlines|1eroflot Russian Airlines|1ir Bosna|1erolitoral|1ir Glaciers|1viogenex|1eroper|1tlas Blue|1zerbaijan Airlines|1vies|1ir Berlin|4India Limited|4Atlanta Icelandic|1rkia Israel Airlines|1ir Jamaica|4Malta|4Japan|4Macau|1MC Airlines|1ir Niugini|4Arabia|4Canada|4Baltic|4New Zealand|1erocondor|4lineas Argentinas|1ir Tanzania|1ustrian Airlines|1TUR|1ir Bangladesh|4Exel|3Asia|1maszonas|1ir Zimbabwe|1serca Airlines|1ir Ivoire|4VIA|4China|4Algerie|1dam Air|1er Lingus|1ir Finland|4Pacific|5hilippines|4Greenland|4Bagan|1tlasjet|1ir Astana|1tlantis European Airways|1ir Moldova|1ero Contractors|5Lanka|1vialeasing Aviation Company|0Tyrolean Airways|0Bahamasair|2ngkok Airways|1udapest Aircraft Services/Manx2|1russels Airlines|1lue Air|1arents AirLink|0Caspian Airlines|2thay Pacific|1entral Connect Airlines|7wings|1hina Airlines|1lick Airways|1omair|1roatia Airlines|1yprus Airways|0Daallo Airlines|1ominicana de Aviaci|0East African|1ritrean Airlines|0FlyLal|0Georgian Airways|1rupo TACA|1ulf Air|0Haiti Ambassador Airlines|0Icar Air|0Japan Airlines|2zeera Airways|1etstar Asia Airways|0LAN Airlines|1ufttransport|0MAT Macedonian Airlines|1IAT Mongolian Airlines|1almo Aviation|2ya Island Air|1iddle East Airlines|0Nepal Airlines|1ouvel Air Tunisie|1as Air|0Oasis Hong Kong Airlines|1cean Air|0PLUNA|1MTair|0Jetstar Pacific|0Qatar Airways|0Royal Jordanian|0Sky Express|1udan Airways|1wiss International Air Lines|1kyEurope|0Thomas Cook Airlines|1iger Airways|2ara Air|1AAG Angola Airlines|2M Mercosur|0Yemenia|0Maldivo Airlines|0Eastar Jet|1lysian Airlines|0LSM Airlines|0Sky Regional|0Asian Wings Airways|088|0AD Aviation|1IR INDOCHINE|1TA Airlines|2RAN Cargo Airlines|1bu Dhabi Amiri Flight|1ccess Air|1dria Airways|1er Arann|3eonautica militare|3o Benin|5Condor Peru|5Flight|4-Service|4México|4Rep|4World|4flot-Don|9Nord|4lane|5ine GmbH|8as Galapagos (Aerogal)|bheredas santa maria|4mar|4nautica Militare|5orte|4pelican Air Services|4sur|1frica West|1ir 26|4Afrique|5lfa|5rabia Egypt|5ustral|4Batumi|5otswana|6urbon|5ucharest|6rkina|6san|4Caledonie International|6nada Jazz|6raïbes|7go Carriers|5entury|5hathams|5udlua|4Dolomiti|4Explore|4Florida|5oyle|5rance|4Guinee Express|6yane|4Hamburg (AHO)|4Iceland|5ndia Express|5taly|9 Egypt|4KBZ|5azakhstan|5iribati|5orea Co. Ltd.|7yo|4Lituanica|5uxor|4Madagascar|7rid|6joro|6lawi|6rshall Islands|6uritius|5editerranee|6kong|5oorea|4Namibia|5ippon|5orth Charter - Canada|6strum|4One|4Pegasus|5lus Comet|4Rarotonga|4Sahara|6int Pierre|6lone|5erbia|6ychelles|5inai|5outhwest|5unshine|4Tahiti|a Nui|5ransat|4Vanuatu|5istara|4Wales|5isconsin|3Asia Japan|8X|3Russia|3Tran Airways|3blue|3company Yakutia|3es|3fix Aviation|3lift International|5nair|6es Of Tasmania|9PNG|3north|1lMasria Universal Airlines|2aska Airlines|7Central Express|2baStar|4nian Airlines|2ghanim|2italia|8 Express|2l America BOPY|cUS|4Nippon Airways|3egheny Commuter Airlines|5iant Air|3iance Airlines|2oha Airlines|2rosa Mirny Air Enterprise|1merica West Airlines|7n Airlines|9Eagle Airlines|2sterdam Airlines|1ndalus Lineas Aereas|1pache Air|1rik Niger|2kefly|2mavia|2row Air|2uba Airlines|1sia Wings|4n Spirit|2trakhan Airlines|1tlant-Soyuz Airlines|6ic Airways|9Southeast Airlines|4s Air|5Global Ukraine|1ugsburg Airways|2rigny Air Services|2stral Lineas Aereas|1viabus|4nca - Aerovias Nacionales de Colombia|3ent Aviation|1zul|0BA CityFlyer|1BN-Airways|1F-Lento OY|1RAZIL AIR|1aikotovitchestrian Airlines|2ltic Airlines|2ssaka airlines|2teleur Air|1earskin Lake Air Service|2lair Airlines|4via Belarusian Airlines|3lview Airlines|2midji Airlines|2ring Air|3jaya Air|1iman Bangladesh Airlines|2ngo Airways|3ter Canarias|1lack Stallion Airways|2ue Panorama Airlines|5Wings|41|4bird Airways (BZ)|1oliviana de Aviacion (OB)|2utique Air (Priv)|1razilian Air Force|2it Air|4ish Airways|8International Helicopters|8Mediterranean Airways|9idland Regional|1ulgaria Air|2quebus Líneas Aéreas|2sinessAir|0CAL Cargo Air Lines|2RICOM AIRWAYS (BARBADOS) INC.|1B Airways UK ( Interliging Flights )|2M America|1CML Airlines|1EIBA Intercontinental|1OBALT|1alima Aviacion|2nXplorer|3adian Airlines|9National Airways|aorth|4ryfly|2pe Air|2rgo Plus Aviation|3ibbean Airlines|3patair|9 Flight Training|2yman Airways|1ebu Pacific|2llo Aviation|1harter Air|3utauqua Airlines|2ina Eastern Airlines|6Southern Airlines|6United Airlines|2oice Airways|3ngqing Airlines|1iel Canadien|2mber Air|2rrus Airlines|2ty Airline|8ways|5Connexion Airlines|4Jet|1olgan Air|2mair|3fort Express Virtual Charters|w Albany|3mutAir|3ores Airlines|3pass Airlines|3tel Air|2ndor Flugdienst|3sorcio Aviaxsa|3tact Air|4inental Airlines|cMicronesia|3viasa|2pa Airlines|3terline|2rendon Airlines|3sairfly|4e-Mediterranee|1rest Aviation|2own Airways|1ubana de Aviación|1zech Airlines|0DAT Danish Air Transport|1alavia|2rwin Airline|1elta Aerotaxi|7ir Lines|2nim Air|3nis Sky|3se Airways|1irect Aero Services|1jibouti Airlines|1niproavia|1obrolet|2menican Airlines|3odedovo Airlines|2nbassAero|1ragonair|2uk Air|1ubrovnik Air|2tch Antilles Express|1ynamic Airways|0ELK Airways|1NTERair|1VA Air|1agles Airlines|2st Horizon|4ern Airways|9tlantic Virtual Airlines|4land Air|4ok Avia|3yFly|1cuavia|1delweiss Air|1gyptAir Express|5air|1l Al Israel Airlines|2-Buraq Air Transport|1mirates|2presa Ecuatoriana De Aviacion|1nerjet|2voy Air|1ra Alaska|1stonian Air|1thiopian Airlines|2ihad Airways|1urocypria Airlines|4fly Service|4line|5ot|4peSky|6an Air Express|4wings|1vergreen International Airlines|1xcel Airways|6Charter|2ecutive AirShare|2press One International|7Jet|1znis Airways|0FLYJET|1OX Linhas Aereas|1ar Eastern Air Transport|3s Air Qeshm|1eeder Airlines|2lix Airways|1innair|4comm Airlines|2refly|3st Air|6Choice Airways|6Flying|1lightline|2orida West International Airways|2ugfelag Vestmannaeyja|2y Africa Zimbabwe|4Brasil|4Dubai|4Europa|4France|4Jamaica Airways|4Romania|3540|3Egypt|3High Airlines Ireland (FH)|3LAL Charters|3Nordic|3Portugal|3baboo|4e|5 Finland Oy|3globespan|3hy Cargo Airlines|3ing kangaroo Airline|3me (VP)|1ormosa Airlines|1reedom Air|blines|2ontier Airlines|9Flying Service|1uzhou Airlines|0GB Airways|1X Airlines|1abon Airlines|2dair European Airlines|2ruda Indonesia|2zpromavia|1eorgian International Airlines|9National Airlines|2rman Air Force - FLB|7International Air Lines|6XL|6ia|6wings|1hana International Airlines|1lobus|1o Air|22Sky|2Jet Airlines|2l Transportes Aéreos|3den Air|7Myanmar Airlines|1rand China Air|7ru Airlines|2eat Lakes Airlines|3enfly|1ulf Air Bahrain|4stream International Airlines|0Hageland Aviation Services|2inan Airlines|2mburg Airways|8International|2nkook Airline|2pagfly|3py Air|2waiian Airlines|1ebei Airlines|3radran Air Services|2li France|4jet|4tt Líneas Aéreas|3las Jet|4enic Imperial Airways|4o|3vetic Airways|2rmes Airlines|2x'Air|1ighland Airways|2malayan Airlines|1okkaido International Airlines|2lidays Czech Airlines|2mer Air|2ng Kong Airlines|aExpress Airways|2rizon Air|blines|0I-Fly|1NAVIA Internacional|1beria Airlines|7Express|4world|3x Airlines|1celandair|1mair Airlines|1ndiGo Airlines|4an Airlines|4go|3ochina Airlines|4nesa Air Aisa X|7ia AirAsia|aSky|9n Airlines|2terair South Africa|6via Airlines|5link Airlines|5national Europe|5sky|1ran Air|6seman Airlines|3qi Airways|1sland Air (WP)|7Spirit|4s Airways|3ena De Inversiones|2rair|1tek Air|0JAL Express|3ways|1agson Airlines|2pan Air System|9lines Domestic|7sia Airways|6Regio|6Transocean Air|1c royal.britannica|1eju Air|2t Airways|4Suite|32.com|34You|3Blue Airways|3airfly|3flite|3star Airways|8Japan|3tor Airlines|1in Air|1ota Aviation|2y Air|1uneyao Airlines|2piter Airlines|2sur airways|0KD Avia|1LM Cityhopper|4Royal Dutch Airlines|1SY|1al Star Aviation|2m Air|2n Air|2vminvodyavia|1endell Airlines|3more Air|3ya Airways|1harkiv Airlines|1ingfisher Airlines|3loss Flying Training Unit|2sh Air|1ogalymavia Air Company|2ralBlue Airlines|3ea Express Air|5n Air|3ongo Airlines|2smos|3tromskie avialinii|1rasnojarsky Airlines|1uban Airlines|2sh Air|2wait Airways|2zu Airlines Cargo|0L|1ACSA|2N Argentina|4Express|4Peru|1CM AIRLINES|1OT Polish Airlines|1SM AIRLINES|4International|1TE International Airways|2U Austria|1ao Airlines|2tCharter|2uda Air|1eeward Islands Air Transport|1iberty Airways|3yan Arab Airlines|2ne Blue|3has A|2on Mentari Airlines|4Xpress|1ocair|1uchsh Airlines|2ftfahrtgesellschaft Walter|4hansa|9 Cargo|bityLine|2xair|0MAT Airways|1CA Airlines|1NG Airlines|1acair Airlines|2han Air|2laysia Airlines|9Wings|3indo Air|3mö Aviation|3ta Air Charter|3év|2ndala Airlines|5rin Airlines|3go|3n Yadanarpon Airlines|2rtinair|3usya Airways|2sAir|2uritania Airlines International|eways|2xair|1edallion Air|2ridiana|3pati Nusantara Airlines|2sa Airlines|4ba Airlines|2tro Batavia|2xicana de Aviaci|8Link|1ichael Airlines|2dway Airlines|4est Airlines|g (Egypt)|2nt Airways|1oldavian Airlines|2narch Airlines|3golian International Air Lines|3tenegro Airlines|2rningstar Air Express|2skovia Airlines|2tor Sich|1yTravel Airways|2anma Airways|6r Airways International|2flug|0NEXT Brasil|1asair|2tional Air Cargo|9Jet Systems|6wide Airlines|2uru Air Corporation|1esma Airlines|2tJets|2w England Airlines|2xtJet|1iki|2le Air|1ok Air|2rdic Global Airlines|3folk County Flight College|3landair|3th American Airlines|fCharters|5west Airlines|9ern Air|3wegian Air International (D8)|eShuttle|bviation College|aLong Haul AS|2vair|0OCEAN AIR CARGO|1ceanair|1lympic Airlines|1man Air|2ni Air International|1ne Two Go Airlines|2ur Air|1rbest|3it Airlines|e Azerbaijan|7tlantic Airways|6International Airlines|6Regional Airlines|2chid Airlines|2enburg Airlines|7zhie|2ient Thai Airlines|3gin Pacific Airways|1stfriesische Lufttransport|1verland Airways|1zjet Airlines|0PAN Air|1B Air|1acific Coastal Airline|8East Asia Cargo Airlines|8Flier|8Island Aviation|8Wings|2kistan International Airlines|2nAm World Airways|2ramount Airways|3miss Airlines (IPV)|2ssaredo Transportes Aereos|1egasus Airlines|2ninsula Airways|1hilippine Airlines|1iedmont Airlines (1948-1989)|2nnacle Airlines|1obeda|2let|3ynesian Airlines|2rter Airlines|4ugalia|2tomac Air|2uya Air|1recision Air|2ivatair|0Qantas|2tXpress|0REXAIR VIRTUEL|1ainbow Air (RAI)|cCanada|cEuro|cPolynesia|cUS|1ed Wings|2gional Express|9Paraguaya|2public Airlines|9Express Airlines|1ossiya-Russian Airlines|2tana Jet|2yal Air Cambodge|aMaroc|9ways|6Brunei Airlines|6Falcon|7light|6Nepal Airlines|6Phnom Penh Airways|1usJet|3line|3sia State Transport|4kie Krylya|1wandair Express|1yan Air Services|5International Airlines|4air|1égional|0S7 Airlines|1AS Braathens|2TA Air Acores|5International|3ENA|1OCHI AIR|9 CHATER|aEXPRESS|1TP Airways|1UR Lineas Aereas|1VG Air|1ahara Airlines|2lsa d\\\\'Haiti|2ma Airlines|2n Dima Air|3ta Barbara Airlines|2ratov Aviation Division|2t Airlines|2udi Arabian Airlines|1candinavian Airlines System|3t Air|2enic Airlines|2oot|3tAirways|1eaPort Airlines|3borne Airlines|2negal Airlines|2rvicios de Transportes A|2venair|1haheen Air International|3ndong Airlines|4ghai Airlines|3rp Airlines|2enzhen Airlines|2uttle America|1ibaviatrans|2chuan Airlines|2em Reap Airways|2lkAir|2mrik Airlines|2ngapore Airlines|i Cargo|1kagway Air Service|2y Airline|5ngkor Airlines (ZA)|4Europe Airlines|5xpress|4Regional Airlines|3West|3jet Airlines|3line Ulasim Ticaret A.S.|3mark Airlines|3net Airlines|8sia Airways|3service Airlines|3walk Airlines|5ys Express|4est Airlines|1mall Planet Airlines|1nowbird Airlines|1ol Lineas Aereas|3ar Air|3omon Airlines|2uth African Airways|6East Asian Airlines|6Pacific Island Airways|5east Air|6rn Air Charter|cways|g Express|9Winds Airlines|5jet|8 cargo|aonnect|5west Airlines|1panair|2icejet|3ke Airlines|3rit Airlines|7of Manila Airlines|2ring Airlines|f Japan|5tair|1riLankan Airlines|3wijaya Air|1tar Flyer|41 Airlines|2erling Airlines|1un Country Airlines|4D'Or|3Express|3rise Airways|2rinam Airways|1vyaz Rossiya|1we Fly|2iss European Air Lines|5air|1yrian Arab Airlines|7Pearl Airlines|0T.J. Air|1ACV|2M Brazilian Airlines|3E|3PA|2P Portugal|1RIP Linhas A|1UIfly|6 Nordic|1ajikistan International Airlines|2rom|2tarstan Airlines|1exas Wings|2z Jet Airlines|1hai Air Cargo|8Asia|8ways International|5Vietjet Air|2omas Cook Airlines|4sonfly|1ianjin Airlines|2ger Airways Australia|1omsk-Avia|1rans Mediterranean Airlines|6States Airlines|5Asia Airways|5Brasil Airlines|5Holding|c System|5Nusa Air|5RussiaAirlines|5aero Airlines|6ir|6via Denmark|aFrance|aHolland|5ilvania|5lift Airways|5portes Aereos Cielos Andinos|5west Air|3sBrasil|3vel Service|2igana Air Service|2opic Air|1uninter|4sair|2ran Air|3k Hava Kurumu Hava Taksi Isletmesi|4ish Air Force|blines|8Wings Domestic|4menistan Airlines|4uaz Airlines|1way Airlines|2in Jet|1yrolean Airways|0UM Airlines|1S Airways|3Helicopter|2-Bangla Airlines|2A3000 Airlines|1Tair Aviation|1kraine Atlantic|8International Airlines|1ni Air|3ted Air Charters|alines|aways|7States Air Force|3versity of Birmingham Air Squadron (RAF)|1ral Airlines|1zbekistan Airways|0V Air|1ASP|1IA Líneas Aéreas|2M Airlines|1LM Airlines|1OLOTEA Airways|1RG Linhas Aereas|1aluair|2rig Log|2sco Air|1ia Conectia Airlines|3Air|2ckJet|2etJet Air|4nam Airlines|2king Hellas|2rgin America|8tlantic Airways|8ustralia|7Express|7Nigeria Airways|7Pacific|6wings|2sion Air International|alines (V2)|2va Macau|4Colombia|1ladivostok Air|1olare Airlines|5is|3ga-Dnepr Airlines|3otea|1ueling Airlines|0WebJet Linhas A|2lcome Air|2st Air China|4Jet|7 Encore|4ern Airlines|4falia Express VA|1hitejets|1iderøe|2nd Jet|5Rose Aviation|3gs Air|2zz Air|8 Hungary|9Ukraine|1orld Airways|6Scale Airlines|0XAIR USA|1L Airways France|1OJET|1PTO|1iamen Airlines|0YES Airways|1amal Airlines|1ellowtail|2ti Airlines|1unnan Airlines|2zhmashavia|0ZABAIKAL AIRLINES|1abaykalskii Airlines|2nair|2polyarie Airlines|1enith International Airline|1oom Airlines|0bmi|3baby|0dba|0easyJet|0Псковавиа","sep":"|"},{"d":"South Africa|United States|Australia|France|Republic of Korea|Pakistan|Libya|Brazil|Kenya|Albania|Spain|Greece|Italy|Colombia|United Kingdom|Ukraine|Afghanistan|Russia|Bosnia and Herzegovina|Mexico|Switzerland|Serbia|Peru|Morocco|Azerbaijan|Estonia|Germany|India|Iceland|Israel|Jamaica|Malta|Japan|Macao|Egypt|Papua New Guinea|United Arab Emirates|Canada|Latvia|New Zealand|Portugal|Argentina|Tanzania|Austria|Ecuador|Bangladesh|Netherlands|Malaysia|Bolivia|Zimbabwe|Venezuela|Ivory Coast|Bulgaria|China|Algeria|Indonesia|Ireland|Finland|Fiji|Philippines|Denmark|Myanmar|Turkey|Kazakhstan|Armenia|Moldova|Nigeria|Sri Lanka|Uzbekistan|Bahamas|Thailand|Hungary|Belgium|Romania|Sweden|Iran|Hong Kong SAR of China|Czech Republic|Poland|Taiwan|Kyrgyzstan|Croatia|Cyprus|Djibouti|Dominican Republic|Uganda|Eritrea|Lithuania|Georgia|Costa Rica|Oman|Haiti|Kuwait|Singapore|Chile|Norway|Macedonia|Mongolia|Belize|Lebanon|Nepal|Tunisia|Saudi Arabia|Hong Kong|Mauritania|Uruguay|Cambodia|Vietnam|Qatar|Jordan|Sudan|Slovakia|Aruba|Angola|Paraguay|Yemen|Maldives|South Korea|Cameroon|Burma|Russian Federation|Slovenia|Benin|Republic of the Congo|Togo|Botswana|Reunion|Burkina Faso|Guinea|French Guiana|Kiribati|Democratic People's Republic of Korea|Madagascar|Malawi|Marshall Islands|Mauritius|Namibia|Cook Islands|Sierra Leone|Seychelles|French Polynesia|Vanuatu|S.A.|ALASKA|Niger|Faroe Islands|AVIANCA|American Samoa|Belarus|Barbados|Equatorial Guinea|Trinidad and Tobago|Cayman Islands|Burundi|Comoros|Panama|Cuba|DRAGON|Bhutan|Netherlands Antilles|Ethiopia|Gabon|Ghana|Bahrain|Iraq|Honduras|Congo (Kinshasa)|South Sudan|Lao Peoples Democratic Republic|Antigua and Barbuda|Mozambique|Luxembourg|Puerto Rico|Montenegro|Nauru|Palau|Samoa|Brunei|Rwanda|Sao Tome and Principe|Saint Vincent and the Grenadines|Senegal|Solomon Islands|Suriname|Syrian Arab Republic|Syria|Tajikistan|Turkmenistan|","i":"0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,10,11,12,13,14,15,16,17,18,19,1a,1b,1c,1d,1e,1f,1g,1h,1i,1j,1k,1l,1m,1n,1o,1p,1q,1r,1s,1t,1u,1v,1w,17,1x,1y,1z,20,21,22,23,24,25,26,27,28,1,29,2a,2b,2c,2d,2e,2f,2g,2h,2i,2j,i,w,2k,2l,2m,2n,2o,2p,22,2q,2r,2s,2t,2u,2v,2w,2x,2y,2z,30,31,b,32,k,33,20,2l,34,35,36,37,38,39,3a,h,11,3b,2a,e,2z,1,3c,10,1,3d,1k,c,3e,m,q,3f,j,d,h,h,h,18,q,18,2c,j,c,14,2,1c,3g,35,1f,1q,y,3,2g,3h,3i,21,3j,4,3,11,3,1,2c,13,e,c,33,1,e,3,3k,3l,q,s,r,c,y,3b,1r,3m,4,3n,2f,14,3o,a,m,3p,3q,3r,3,2z,3,3s,w,11,a,c,r,a,3t,r,3,3u,l,3v,y,e,1,3w,3,11,3x,r,e,1,w,1b,h,1,5,h,3y,1l,1,3,2,z,2,y,3z,1,a,9,1,c,c,36,1,w,1,1,2,1,h,1,1,1,1a,a,1,40,1a,1s,1,34,1r,1n,h,h,41,1,1,f,q,e,15,h,42,1d,7,e,e,1l,7,43,h,2y,0,11,k,44,1u,1,1,1b,19,26,a,1,c,q,1l,b,1c,1,7,3,e,e,e,e,1g,2x,1y,t,45,e,1,d,46,2a,a,11,11,11,11,a,1,10,47,21,21,48,1n,e,17,1,1h,1h,1h,1,1h,11,1o,q,22,1y,49,1k,1,0,1,1,1,4a,1,17,q,j,q,1,1,1e,4b,1l,1q,3,3,e,1,4c,25,1o,h,k,c,1,1a,t,1,21,2b,f,h,2c,h,f,4d,4e,29,4f,1,p,26,27,c,g,e,1,2,28,d,18,k,y,y,t,6,10,18,11,1,1,p,4g,10,2a,c,2g,26,q,q,q,1,e,e,1,1,1,2p,26,7,27,23,32,37,1l,1l,1b,11,e,w,e,1,s,1d,7,10,a,3,u,21,8,y,1k,2f,22,14,k,e,1l,e,1y,2,38,27,1,1,1,1,1h,e,1h,4h,a,1j,h,2g,2g,q,q,q,q,q,4i,h,r,33,1,7,22,3b,1h,2f,1,a,4j,1,1,1h,q,q,39,q,1y,1,1h,e,3,11,a,b,b,k,k,b,3,e,2s,w,25,q,24,24,1,2,h,15,a,a,a,w,s,o,r,r,1,2z,1j,1j,1j,1j,0,h,0,a,17,23,23,4k,1,s,a,4l,t,28,w,w,r,w,w,w,w,w,e,4,r,1,e,n,1,20,1l,2,w,2v,39,e,1h,1h,10,y,h,1a,1a,b,1j,g,1y,h,2,1,8,f,r,e,23,h,y,39,4,4m,h,h,h,h,4n,2k,1q,15,2h,15,2m,m,h,26,h,h,a,17,4o,12,17,4p,1,6,q,4q,1j,3a,1,h,q,q,q,q,4r,2o,22,1q,2,23,1b,1b,1b,22,v,1z,1j,27,0,3b,1a,h,j,2w,2w,22,21,c,1j,1,1,1j,j,j,4s,1,1,y,a,1t,e,2p,4t,11,h,f,e,1p,1p,s,7,2e,1,2,0,4u,y,1,1,22,17,y,1y,1l,e,s,11,11,1,11,2n,2n,2n,2n,22,r,7,b,2i,1,1y,1q,14,1,o,1,1,1,2,h,h,1y,13,q,1u,2,a,1y,11,1n,4v,1,1,5,1,r,23,7,1q,1,1n,1,1,h,h,4w,11,14,1,23,16,k,2,30,3,1,11,e,1,1,h,2,36,1,1j,h,10,2y,n,1,4x,31,h,2s,2y,h,h,h,h,4y,1,1,1k,3,h,2n,14,14,d,h,h,h,4z,15,50,1i,2j,2u,1,1e,h,1r,2u,22,1r,1,2l,e,1,1,51,15,2t,5,1h,1h,2,1h,1,h,1h,2y,2l,2s,2l,2l,1,2m,2y,33,h,11,1,2d,1q,w,1k,w,11,1,22,2,2f,1l,15,1y,52,0,1n,1,1,1x,1,1,15,1,1,1,1,a,r,1,1,1n,1h,w,26,1v,1j,w,2f,1o,1,t,1q,2j,53,h,22,k,k,54,55,1,14,7,18,d,14,7,q,22,56,21,h,1,28,1y,1y,1y,1y,e,e,1h,2,h,2r,1,27,7,7,7,1j,h,h,11,1o,3,1a,21,1k,m,11,7,25,1j,2q,2t,2t,o,1q,1q,1q,1q,57,1q,39,3,58,f,1,1,19,1,h,f,f,27,1d,1,19,1,e,h,1w,27,7,15,h,20,a,7,2l,7,2z,2x,1,3,2z,2z,b,1,e,2,20,1u,1m,q,5,1,x,d,h,c,j,h,a,a,7,17,1h,11,11,1,q,7,2n,c,f,1j,1z,1g,f,1,1,1,3,1,14,1h,26,h,1,2s,1h,f,h,h,16,h,1y,11,e,e,q,e,h","sep":"|"}]}]);
const COLONY = [
{"id":"n-87edf31f","guard":[["hasAny",["airline","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Air Lituanica based":"Air Lituanica is an airline of Lithuania.","name the home country of OCEAN AIR CARGO":"OCEAN AIR CARGO is an airline of India.","which country is the airline Kosmos from":"Kosmos is an airline of Russia.","name the home country of Spicejet":"Spicejet is an airline of India.","name the home country of Tianjin Airlines":"Tianjin Airlines is an airline of China.","which country is the airline Air Explore from":"Air Explore is an airline of Slovakia.","which country is the airline LSM Airlines from":"LSM Airlines is an airline of Russia.","which country is the airline Orbest from":"Orbest is an airline of Portugal.","which country is the airline Aero Contractors from":"Aero Contractors is an airline of Nigeria.","where is the airline Liberty Airways based":"Liberty Airways is an airline of United States.","which country is the airline Aeronautica Militare from":"Aeronautica Militare is an airline of Italy.","which country is the airline Skywest Airlines from":"Skywest Airlines is an airline of Australia.","where is the airline Yuzhmashavia based":"Yuzhmashavia is an airline of Ukraine.","name the home country of Alrosa Mirny Air Enterprise":"Alrosa Mirny Air Enterprise is an airline of Russia.","which country is the airline Pobeda from":"Pobeda is an airline of Russia.","which country is the airline Hex'Air from":"Hex'Air is an airline of France.","which country is the airline NEXT Brasil from":"NEXT Brasil is an airline of Brazil.","name the home country of bmi":"bmi is an airline of United Kingdom.","where is the airline EuropeSky based":"EuropeSky is an airline of Germany.","name the home country of Avient Aviation":"Avient Aviation is an airline of Zimbabwe.","where is the airline SOCHI AIR CHATER based":"SOCHI AIR CHATER is an airline of Russia.","name the home country of Bingo Airways":"Bingo Airways is an airline of Poland.","name the home country of Blue Wings":"Blue Wings is an airline of Germany.","name the home country of AirAsia X":"AirAsia X is an airline of Malaysia.","name the home country of Air VIA":"Air VIA is an airline of Bulgaria.","which country is the airline Vladivostok Air from":"Vladivostok Air is an airline of Russia.","where is the airline El-Buraq Air Transport based":"El-Buraq Air Transport is an airline of Libya.","which country is the airline AeroMéxico from":"AeroMéxico is an airline of Mexico.","where is the airline Nationwide Airlines based":"Nationwide Airlines is an airline of South Africa.","where is the airline Baltic Airlines based":"Baltic Airlines is an airline of Russia.","which country is the airline Blue1 from":"Blue1 is an airline of Finland.","name the home country of Shaheen Air International":"Shaheen Air International is an airline of Pakistan.","which country is the airline TransBrasil Airlines from":"TransBrasil Airlines is an airline of Brazil.","name the home country of Whitejets":"Whitejets is an airline of Brazil.","name the home country of Pacific Wings":"Pacific Wings is an airline of United States.","where is the airline Cayman Airways based":"Cayman Airways is an airline of Cayman Islands.","which country is the airline Airlines PNG from":"Airlines PNG is an airline of Papua New Guinea.","where is the airline Ocean Air based":"Ocean Air is an airline of Mauritania.","name the home country of Air Transat":"Air Transat is an airline of Canada.","which country is the airline CCML Airlines from":"CCML Airlines is an airline of Colombia.","which country is the airline Uni Air from":"Uni Air is an airline of Taiwan.","name the home country of Zabaykalskii Airlines":"Zabaykalskii Airlines is an airline of Russia.","where is the airline Air Korea Co. Ltd. based":"Air Korea Co. Ltd. is an airline of Republic of Korea.","name the home country of Aerolane":"Aerolane is an airline of Ecuador.","where is the airline Atlas Air based":"Atlas Air is an airline of United States.","name the home country of Air Macau":"Air Macau is an airline of Macao.","where is the airline Lao Airlines based":"Lao Airlines is an airline of Lao Peoples Democratic Republic.","which country is the airline Kuban Airlines from":"Kuban Airlines is an airline of Russia.","which country is the airline United Airlines from":"United Airlines is an airline of United States.","which country is the airline Happy Air from":"Happy Air is an airline of Thailand.","where is the airline Transwest Air based":"Transwest Air is an airline of Canada.","name the home country of Porter Airlines":"Porter Airlines is an airline of Canada.","which country is the airline Flyhy Cargo Airlines from":"Flyhy Cargo Airlines is an airline of Thailand.","name the home country of Southjet cargo":"Southjet cargo is an airline of United States.","where is the airline Shandong Airlines based":"Shandong Airlines is an airline of China.","where is the airline Orient Thai Airlines based":"Orient Thai Airlines is an airline of Thailand.","name the home country of All America US":"All America US is an airline of United States.","name the home country of Lufttransport":"Lufttransport is an airline of Norway.","which country is the airline Finncomm Airlines from":"Finncomm Airlines is an airline of Finland.","where is the airline Royal Air Cambodge based":"Royal Air Cambodge is an airline of Cambodia.","name the home country of Hageland Aviation Services":"Hageland Aviation Services is an airline of United States.","where is the airline Flybaboo based":"Flybaboo is an airline of Switzerland.","where is the airline JALways based":"JALways is an airline of Japan.","where is the airline Delta Aerotaxi based":"Delta Aerotaxi is an airline of Italy.","where is the airline Flugfelag Vestmannaeyja based":"Flugfelag Vestmannaeyja is an airline of Iceland.","name the home country of Hong Kong Airlines":"Hong Kong Airlines is an airline of Hong Kong SAR of China.","where is the airline TUIfly based":"TUIfly is an airline of Germany.","which country is the airline Sriwijaya Air from":"Sriwijaya Air is an airline of Indonesia.","which country is the airline Turkish Air Force from":"Turkish Air Force is an airline of Turkey.","where is the airline Air Ivoire based":"Air Ivoire is an airline of Ivory Coast.","where is the airline Saratov Aviation Division based":"Saratov Aviation Division is an airline of Russia.","name the home country of Niki":"Niki is an airline of Austria.","which country is the airline Aerolineas heredas santa maria from":"Aerolineas heredas santa maria is an airline of Dominican Republic.","where is the airline Sharp Airlines based":"Sharp Airlines is an airline of Australia.","name the home country of bmibaby":"bmibaby is an airline of United Kingdom.","which country is the airline Conviasa from":"Conviasa is an airline of Venezuela.","where is the airline Olympic Airlines based":"Olympic Airlines is an airline of Greece.","name the home country of Island Air (WP)":"Island Air (WP) is an airline of United States.","where is the airline Midwest Airlines based":"Midwest Airlines is an airline of United States."}}},
{"id":"n-8f3d66d3","guard":[["hasAny",["aero","aerolane","aerolineas","aeroméxico","aeronautica","aerotaxi","alrosa","avient","baltic","bingo","blue","blue1","brasil","cambodge","cayman","ccml","chater","conviasa","division","elburaq","europesky","explore","finncomm","flugfelag","flybaboo","flyhy","force","happy","hexair","item number","jalways","kosmos","kuban","lsm","lufttransport","macau","niki","normalise","normalize","nth","ocean","olympic","orbest","orient","pobeda","porter","position","shandong","sharp","simplify the text","skywest","spicejet","sriwijaya","tianjin","transat","transbrasil","transwest","tuifly","uni","via","vladivostok","whitejets","yuzhmashavia","zabaykalskii"]],["not",["has","code"]],["not",["has","me"]],["not",["has","british"]],["not",["has","conectia"]],["not",["has","driver"]],["not",["has","firstlevel"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}],{"lit":3}]],"mem":null},
{"id":"n-f269d827","guard":[["hasAny",["aero","aerolane","aerolineas","aeroméxico","aeronautica","aerotaxi","all","alrosa","atlas","baltic","blue1","bmibaby","brasil","cambodge","ccml","chater","conviasa","elburaq","europesky","explore","finncomm","flugfelag","flybaboo","force","happy","hexair","item number","ivoire","jalways","kosmos","kuban","lao","lsm","lufttransport","macau","nationwide","normalise","normalize","nth","ocean","olympic","orbest","orient","png","pobeda","porter","position","shandong","sharp","simplify the text","skywest","spicejet","sriwijaya","tianjin","transat","transbrasil","transwest","tuifly","uni","united","vladivostok","whitejets","yuzhmashavia","zabaykalskii"]],["not",["has","arab"]],["not",["has","code"]],["not",["has","asia"]],["not",["has","afriqiyah"]],["not",["has","brazilian"]],["not",["has","british"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}],{"lit":2}]],"mem":null},
{"id":"n-537bfb61","guard":[["hasAny",["aero","aerolane","aeroméxico","aeronautica","aerotaxi","alrosa","avient","baltic","bingo","blue","blue1","brasil","cambodge","ccml","chater","class name","conviasa","division","elburaq","europesky","explore","finncomm","flugfelag","flybaboo","flyhy","force","happy","hexair","item number","jalways","kosmos","kuban","lsm","lufttransport","macau","niki","nth","ocean","olympic","orbest","orient","pascal case","pascalcase","pobeda","porter","position","shandong","sharp","skywest","spicejet","sriwijaya","tianjin","transat","transbrasil","transwest","tuifly","uni","upper camel case","via","vladivostok","whitejets","yuzhmashavia","zabaykalskii"]],["not",["has","code"]],["not",["has","me"]],["not",["has","british"]],["not",["has","conectia"]],["not",["has","driver"]],["not",["has","firstlevel"]]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-5dd821c8","guard":[["hasAny",["aero","aerolane","aeroméxico","aeronautica","aerotaxi","alrosa","avient","baltic","bingo","blue","blue1","brasil","cambodge","ccml","chater","conviasa","division","each word","elburaq","europesky","explore","finncomm","flugfelag","flybaboo","flyhy","force","happy","hexair","item number","jalways","kosmos","kuban","lsm","lufttransport","macau","niki","nth","ocean","olympic","orbest","orient","pobeda","porter","position","shandong","sharp","skywest","spicejet","split into words","sriwijaya","tianjin","transat","transbrasil","transwest","tuifly","uni","via","vladivostok","whitejets","words","yuzhmashavia","zabaykalskii"]],["not",["has","code"]],["not",["has","me"]],["not",["has","british"]],["not",["has","conectia"]],["not",["has","driver"]],["not",["has","firstlevel"]]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-6191aedd","guard":[["hasAny",["aero","aerolane","aeroméxico","aeronautica","aerotaxi","alrosa","avient","baltic","bingo","blue","blue1","brasil","cambodge","ccml","chater","conviasa","dashes","division","elburaq","europesky","explore","finncomm","flugfelag","flybaboo","flyhy","force","happy","hexair","hyphens","item number","jalways","kebab case","kebabcase","kosmos","kuban","lsm","lufttransport","macau","niki","nth","ocean","olympic","orbest","orient","pobeda","porter","position","shandong","sharp","skywest","slug","spicejet","sriwijaya","tianjin","transat","transbrasil","transwest","tuifly","uni","via","vladivostok","whitejets","yuzhmashavia","zabaykalskii"]],["not",["has","code"]],["not",["has","me"]],["not",["has","british"]],["not",["has","conectia"]],["not",["has","driver"]],["not",["has","firstlevel"]]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-63bbabf6","guard":[["hasAny",["aero","aerolane","aeroméxico","aeronautica","aerotaxi","alrosa","avient","baltic","bingo","blue","blue1","brasil","cambodge","ccml","chater","conviasa","division","elburaq","europesky","explore","finncomm","flugfelag","flybaboo","flyhy","force","happy","hexair","item number","jalways","kosmos","kuban","lsm","lufttransport","macau","niki","nth","ocean","olympic","orbest","orient","pobeda","porter","position","shandong","sharp","skywest","snake case","snakecase","spicejet","sriwijaya","tianjin","transat","transbrasil","transwest","tuifly","underscores","uni","variable name","via","vladivostok","whitejets","yuzhmashavia","zabaykalskii"]],["not",["has","code"]],["not",["has","me"]],["not",["has","british"]],["not",["has","conectia"]],["not",["has","driver"]],["not",["has","firstlevel"]]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-759384e5","guard":[["hasAny",["aero","aerolane","aeroméxico","aeronautica","aerotaxi","alrosa","avient","baltic","bingo","blue","blue1","brasil","cambodge","ccml","chater","conviasa","division","each word","elburaq","europesky","explore","finncomm","flugfelag","flybaboo","flyhy","force","happy","hexair","item number","jalways","kosmos","kuban","lsm","lufttransport","macau","niki","nth","ocean","olympic","orbest","orient","pobeda","porter","position","shandong","sharp","skywest","spicejet","split into words","sriwijaya","tianjin","transat","transbrasil","transwest","tuifly","uni","via","vladivostok","whitejets","words","yuzhmashavia","zabaykalskii"]],["not",["has","code"]],["not",["has","me"]],["not",["has","british"]],["not",["has","conectia"]],["not",["has","driver"]],["not",["has","firstlevel"]]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-7810504c","guard":[["hasAny",["aero","aerolane","aeroméxico","aeronautica","aerotaxi","alrosa","avient","baltic","bingo","blue","blue1","brasil","cambodge","ccml","chater","conviasa","division","elburaq","europesky","explore","finncomm","flugfelag","flybaboo","flyhy","force","happy","hexair","item number","jalways","kosmos","kuban","lsm","lufttransport","macau","niki","nth","ocean","olympic","orbest","orient","pobeda","porter","position","reverse the words","reverse word order","shandong","sharp","skywest","spicejet","sriwijaya","tianjin","transat","transbrasil","transwest","tuifly","uni","via","vladivostok","whitejets","words backwards","yuzhmashavia","zabaykalskii"]],["not",["has","code"]],["not",["has","me"]],["not",["has","british"]],["not",["has","conectia"]],["not",["has","driver"]],["not",["has","firstlevel"]]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-bb252fc6","guard":[["hasAny",["aero","aerolane","aeroméxico","aeronautica","aerotaxi","alrosa","avient","baltic","bingo","blue","blue1","brasil","cambodge","camel case","camelcase","ccml","chater","conviasa","division","elburaq","europesky","explore","finncomm","flugfelag","flybaboo","flyhy","force","happy","hexair","item number","jalways","kosmos","kuban","lower camel case","lsm","lufttransport","macau","niki","nth","ocean","olympic","orbest","orient","pobeda","porter","position","shandong","sharp","skywest","spicejet","sriwijaya","tianjin","transat","transbrasil","transwest","tuifly","uni","via","vladivostok","whitejets","yuzhmashavia","zabaykalskii"]],["not",["has","code"]],["not",["has","me"]],["not",["has","british"]],["not",["has","conectia"]],["not",["has","driver"]],["not",["has","firstlevel"]]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-bb5e4dc4","guard":[["hasAny",["aero","aerolane","aeroméxico","aeronautica","aerotaxi","alrosa","avient","baltic","bingo","blue","blue1","brasil","cambodge","ccml","chater","conviasa","division","each word","elburaq","europesky","explore","finncomm","flugfelag","flybaboo","flyhy","force","happy","hexair","item number","jalways","kosmos","kuban","lsm","lufttransport","macau","niki","nth","ocean","olympic","orbest","orient","pobeda","porter","position","shandong","sharp","skywest","spicejet","split into words","sriwijaya","tianjin","transat","transbrasil","transwest","tuifly","uni","via","vladivostok","whitejets","words","yuzhmashavia","zabaykalskii"]],["not",["has","code"]],["not",["has","me"]],["not",["has","british"]],["not",["has","conectia"]],["not",["has","driver"]],["not",["has","firstlevel"]]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-90507e57","guard":[["hasAny",["aero","aerolane","aeroméxico","aeronautica","aerotaxi","alrosa","avient","baltic","bingo","blue","blue1","brasil","cambodge","ccml","chater","conviasa","division","each word","elburaq","europesky","explore","finncomm","flugfelag","flybaboo","flyhy","force","happy","hexair","item number","jalways","kosmos","kuban","longest","longest one","longest word","lsm","lufttransport","macau","niki","nth","ocean","olympic","orbest","orient","pobeda","porter","position","shandong","sharp","skywest","spicejet","split into words","sriwijaya","tianjin","transat","transbrasil","transwest","tuifly","uni","via","vladivostok","whitejets","words","yuzhmashavia","zabaykalskii"]],["not",["has","code"]],["not",["has","me"]],["not",["has","british"]],["not",["has","conectia"]],["not",["has","driver"]],["not",["has","firstlevel"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]]],"mem":null},
{"id":"n-d1df6004","guard":[["hasAny",["aero","aerolane","aeroméxico","aeronautica","aerotaxi","alrosa","avient","baltic","bingo","blue","blue1","brasil","cambodge","ccml","chater","conviasa","division","each word","elburaq","europesky","explore","finncomm","flugfelag","flybaboo","flyhy","force","happy","hexair","item number","jalways","kosmos","kuban","lsm","lufttransport","macau","niki","nth","ocean","olympic","orbest","orient","pobeda","porter","position","shandong","sharp","shortest","shortest one","shortest word","skywest","spicejet","split into words","sriwijaya","tianjin","transat","transbrasil","transwest","tuifly","uni","via","vladivostok","whitejets","words","yuzhmashavia","zabaykalskii"]],["not",["has","code"]],["not",["has","me"]],["not",["has","british"]],["not",["has","conectia"]],["not",["has","driver"]],["not",["has","firstlevel"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]]],"mem":null},
{"id":"n-148656db","guard":[["hasAny",["aero","aerolane","aeroméxico","aeronautica","aerotaxi","alrosa","avient","baltic","bingo","blue","blue1","brasil","cambodge","ccml","chater","class name","conviasa","division","elburaq","europesky","explore","finncomm","flugfelag","flybaboo","flyhy","force","happy","hexair","item number","jalways","kosmos","kuban","lsm","lufttransport","macau","niki","nth","ocean","olympic","orbest","orient","pascal case","pascalcase","pobeda","porter","position","shandong","sharp","skywest","spicejet","sriwijaya","tianjin","transat","transbrasil","transwest","tuifly","uni","upper camel case","via","vladivostok","whitejets","yuzhmashavia","zabaykalskii"]],["not",["has","code"]],["not",["has","me"]],["not",["has","british"]],["not",["has","conectia"]],["not",["has","driver"]],["not",["has","firstlevel"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of ",{"slot":1},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-15118e64","guard":[["hasAny",["aero","aerolane","aeroméxico","aeronautica","aerotaxi","alrosa","avient","baltic","bingo","blue","blue1","brasil","cambodge","ccml","chater","conviasa","division","elburaq","europesky","explore","finncomm","flugfelag","flybaboo","flyhy","force","happy","hexair","item number","jalways","kosmos","kuban","lsm","lufttransport","macau","niki","nth","ocean","olympic","orbest","orient","pobeda","porter","position","reverse the words","reverse word order","shandong","sharp","skywest","spicejet","sriwijaya","tianjin","transat","transbrasil","transwest","tuifly","uni","via","vladivostok","whitejets","words backwards","yuzhmashavia","zabaykalskii"]],["not",["has","code"]],["not",["has","me"]],["not",["has","british"]],["not",["has","conectia"]],["not",["has","driver"]],["not",["has","firstlevel"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of ",{"slot":1},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-4218faa2","guard":[["hasAny",["aero","aerolane","aeroméxico","aeronautica","aerotaxi","alrosa","avient","baltic","bingo","blue","blue1","brasil","cambodge","ccml","chater","conviasa","dashes","division","elburaq","europesky","explore","finncomm","flugfelag","flybaboo","flyhy","force","happy","hexair","hyphens","item number","jalways","kebab case","kebabcase","kosmos","kuban","lsm","lufttransport","macau","niki","nth","ocean","olympic","orbest","orient","pobeda","porter","position","shandong","sharp","skywest","slug","spicejet","sriwijaya","tianjin","transat","transbrasil","transwest","tuifly","uni","via","vladivostok","whitejets","yuzhmashavia","zabaykalskii"]],["not",["has","code"]],["not",["has","me"]],["not",["has","british"]],["not",["has","conectia"]],["not",["has","driver"]],["not",["has","firstlevel"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of ",{"slot":1},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-5f98c0eb","guard":[["hasAny",["aero","aerolane","aeroméxico","aeronautica","aerotaxi","alrosa","avient","baltic","bingo","blue","blue1","brasil","cambodge","camel case","camelcase","ccml","chater","conviasa","division","elburaq","europesky","explore","finncomm","flugfelag","flybaboo","flyhy","force","happy","hexair","item number","jalways","kosmos","kuban","lower camel case","lsm","lufttransport","macau","niki","nth","ocean","olympic","orbest","orient","pobeda","porter","position","shandong","sharp","skywest","spicejet","sriwijaya","tianjin","transat","transbrasil","transwest","tuifly","uni","via","vladivostok","whitejets","yuzhmashavia","zabaykalskii"]],["not",["has","code"]],["not",["has","me"]],["not",["has","british"]],["not",["has","conectia"]],["not",["has","driver"]],["not",["has","firstlevel"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of ",{"slot":1},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-f4f361f6","guard":[["has","airline"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the airline Air Lituanica based":"Air Lituanica is an airline of Lithuania.","the airline Kosmos from":"Kosmos is an airline of Russia.","the airline Air Explore from":"Air Explore is an airline of Slovakia.","the airline LSM Airlines from":"LSM Airlines is an airline of Russia.","the airline Orbest from":"Orbest is an airline of Portugal.","the airline Aero Contractors from":"Aero Contractors is an airline of Nigeria.","the airline Liberty Airways based":"Liberty Airways is an airline of United States.","the airline Aeronautica Militare from":"Aeronautica Militare is an airline of Italy.","the airline Skywest Airlines from":"Skywest Airlines is an airline of Australia.","the airline Yuzhmashavia based":"Yuzhmashavia is an airline of Ukraine.","the airline Pobeda from":"Pobeda is an airline of Russia.","the airline Hex'Air from":"Hex'Air is an airline of France.","the airline NEXT Brasil from":"NEXT Brasil is an airline of Brazil.","the airline EuropeSky based":"EuropeSky is an airline of Germany.","the airline SOCHI AIR CHATER based":"SOCHI AIR CHATER is an airline of Russia.","the airline Vladivostok Air from":"Vladivostok Air is an airline of Russia.","the airline El-Buraq Air Transport based":"El-Buraq Air Transport is an airline of Libya.","the airline AeroMéxico from":"AeroMéxico is an airline of Mexico.","the airline Nationwide Airlines based":"Nationwide Airlines is an airline of South Africa.","the airline Baltic Airlines based":"Baltic Airlines is an airline of Russia.","the airline Blue1 from":"Blue1 is an airline of Finland.","the airline TransBrasil Airlines from":"TransBrasil Airlines is an airline of Brazil.","the airline Cayman Airways based":"Cayman Airways is an airline of Cayman Islands.","the airline Airlines PNG from":"Airlines PNG is an airline of Papua New Guinea.","the airline Ocean Air based":"Ocean Air is an airline of Mauritania.","the airline CCML Airlines from":"CCML Airlines is an airline of Colombia.","the airline Uni Air from":"Uni Air is an airline of Taiwan.","the airline Air Korea Co. Ltd. based":"Air Korea Co. Ltd. is an airline of Republic of Korea.","the airline Atlas Air based":"Atlas Air is an airline of United States.","the airline Lao Airlines based":"Lao Airlines is an airline of Lao Peoples Democratic Republic.","the airline Kuban Airlines from":"Kuban Airlines is an airline of Russia.","the airline United Airlines from":"United Airlines is an airline of United States.","the airline Happy Air from":"Happy Air is an airline of Thailand.","the airline Transwest Air based":"Transwest Air is an airline of Canada.","the airline Flyhy Cargo Airlines from":"Flyhy Cargo Airlines is an airline of Thailand.","the airline Shandong Airlines based":"Shandong Airlines is an airline of China.","the airline Orient Thai Airlines based":"Orient Thai Airlines is an airline of Thailand.","the airline Finncomm Airlines from":"Finncomm Airlines is an airline of Finland.","the airline Royal Air Cambodge based":"Royal Air Cambodge is an airline of Cambodia.","the airline Flybaboo based":"Flybaboo is an airline of Switzerland.","the airline JALways based":"JALways is an airline of Japan.","the airline Delta Aerotaxi based":"Delta Aerotaxi is an airline of Italy.","the airline Flugfelag Vestmannaeyja based":"Flugfelag Vestmannaeyja is an airline of Iceland.","the airline TUIfly based":"TUIfly is an airline of Germany.","the airline Sriwijaya Air from":"Sriwijaya Air is an airline of Indonesia.","the airline Turkish Air Force from":"Turkish Air Force is an airline of Turkey.","the airline Air Ivoire based":"Air Ivoire is an airline of Ivory Coast.","the airline Saratov Aviation Division based":"Saratov Aviation Division is an airline of Russia.","the airline Aerolineas heredas santa maria from":"Aerolineas heredas santa maria is an airline of Dominican Republic.","the airline Sharp Airlines based":"Sharp Airlines is an airline of Australia.","the airline Conviasa from":"Conviasa is an airline of Venezuela.","the airline Olympic Airlines based":"Olympic Airlines is an airline of Greece.","the airline Midwest Airlines based":"Midwest Airlines is an airline of United States."}}},
{"id":"n-ae79b9dc","guard":[["has","country"],["not",["has","me"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"country"}]]],"mem":{"table":{"of OCEAN AIR CARGO":"OCEAN AIR CARGO is an airline of India.","is the airline Kosmos from":"Kosmos is an airline of Russia.","of Spicejet":"Spicejet is an airline of India.","of Tianjin Airlines":"Tianjin Airlines is an airline of China.","is the airline Air Explore from":"Air Explore is an airline of Slovakia.","is the airline LSM Airlines from":"LSM Airlines is an airline of Russia.","is the airline Orbest from":"Orbest is an airline of Portugal.","is the airline Aero Contractors from":"Aero Contractors is an airline of Nigeria.","is the airline Aeronautica Militare from":"Aeronautica Militare is an airline of Italy.","is the airline Skywest Airlines from":"Skywest Airlines is an airline of Australia.","of Alrosa Mirny Air Enterprise":"Alrosa Mirny Air Enterprise is an airline of Russia.","is the airline Pobeda from":"Pobeda is an airline of Russia.","is the airline Hex'Air from":"Hex'Air is an airline of France.","is the airline NEXT Brasil from":"NEXT Brasil is an airline of Brazil.","of bmi":"bmi is an airline of United Kingdom.","of Avient Aviation":"Avient Aviation is an airline of Zimbabwe.","of Bingo Airways":"Bingo Airways is an airline of Poland.","of Blue Wings":"Blue Wings is an airline of Germany.","of AirAsia X":"AirAsia X is an airline of Malaysia.","of Air VIA":"Air VIA is an airline of Bulgaria.","is the airline Vladivostok Air from":"Vladivostok Air is an airline of Russia.","is the airline AeroMéxico from":"AeroMéxico is an airline of Mexico.","is the airline Blue1 from":"Blue1 is an airline of Finland.","of Shaheen Air International":"Shaheen Air International is an airline of Pakistan.","is the airline TransBrasil Airlines from":"TransBrasil Airlines is an airline of Brazil.","of Whitejets":"Whitejets is an airline of Brazil.","of Pacific Wings":"Pacific Wings is an airline of United States.","is the airline Airlines PNG from":"Airlines PNG is an airline of Papua New Guinea.","of Air Transat":"Air Transat is an airline of Canada.","is the airline CCML Airlines from":"CCML Airlines is an airline of Colombia.","is the airline Uni Air from":"Uni Air is an airline of Taiwan.","of Zabaykalskii Airlines":"Zabaykalskii Airlines is an airline of Russia.","of Aerolane":"Aerolane is an airline of Ecuador.","of Air Macau":"Air Macau is an airline of Macao.","is the airline Kuban Airlines from":"Kuban Airlines is an airline of Russia.","is the airline United Airlines from":"United Airlines is an airline of United States.","is the airline Happy Air from":"Happy Air is an airline of Thailand.","of Porter Airlines":"Porter Airlines is an airline of Canada.","is the airline Flyhy Cargo Airlines from":"Flyhy Cargo Airlines is an airline of Thailand.","of Southjet cargo":"Southjet cargo is an airline of United States.","of All America US":"All America US is an airline of United States.","of Lufttransport":"Lufttransport is an airline of Norway.","is the airline Finncomm Airlines from":"Finncomm Airlines is an airline of Finland.","of Hageland Aviation Services":"Hageland Aviation Services is an airline of United States.","of Hong Kong Airlines":"Hong Kong Airlines is an airline of Hong Kong SAR of China.","is the airline Sriwijaya Air from":"Sriwijaya Air is an airline of Indonesia.","is the airline Turkish Air Force from":"Turkish Air Force is an airline of Turkey.","of Niki":"Niki is an airline of Austria.","is the airline Aerolineas heredas santa maria from":"Aerolineas heredas santa maria is an airline of Dominican Republic.","of bmibaby":"bmibaby is an airline of United Kingdom.","is the airline Conviasa from":"Conviasa is an airline of Venezuela.","of Island Air (WP)":"Island Air (WP) is an airline of United States."}}},
{"id":"n-2de5d8d4","guard":[["hasAny",["based","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.and",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-461df553","guard":[["hasAny",["based","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-468fa091","guard":[["hasAny",["based","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.content"],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-0d0b1846","guard":[["hasAny",["based","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-24f699ab","guard":[["hasAny",["based","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-2654fe4c","guard":[["hasAny",["all caps","based","capital letters","capitals","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-392c469f","guard":[["hasAny",["based","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-791c07b7","guard":[["hasAny",["based","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-98d76241","guard":[["hasAny",["based","first n","item number","nth","position","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-a8a1866c","guard":[["hasAny",["based","first n","item number","nth","position","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-33da7b8c","guard":[["hasAny",["based","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.lower",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-4a5c76da","guard":[["hasAny",["all caps","based","capital letters","capitals","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.upper",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-a4de3201","guard":[["hasAny",["based","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-d5126417","guard":[["hasAny",["based","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-c865f779","guard":[["hasAny",["based","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-d4c5a996","guard":[["hasAny",["based","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-a31a4eba","guard":[["hasAny",["based","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-a860b57a","guard":[["hasAny",["based","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-aff2d19d","guard":[["hasAny",["country","item number","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of ",{"slot":1},"."]},["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-7a1dbb42","guard":[["hasAny",["country","item number","lower case","lowercase","nth","position","small letters"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of ",{"slot":1},"."]},["transform.lower",["sense.after",{"lit":"of"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-4746048e","guard":[["hasAny",["aero","aerolineas","aeroméxico","aeronautica","blue1","brasil","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","item number","kosmos","kuban","lsm","nth","orbest","png","pobeda","position","skywest","sriwijaya","transbrasil","uni","united","vladivostok"]],["has","from"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-e046035b","guard":[["hasAny",["aero","aerolineas","aeroméxico","aeronautica","blue1","brasil","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","item number","kosmos","kuban","lsm","nth","orbest","png","pobeda","position","skywest","sriwijaya","transbrasil","uni","united","vladivostok"]],["has","from"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-ee1c9d74","guard":[["hasAny",["aero","aerolineas","aeroméxico","aeronautica","blue1","brasil","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","item number","kosmos","kuban","lsm","nth","orbest","png","pobeda","position","skywest","sriwijaya","transbrasil","uni","united","vladivostok"]],["has","from"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.and",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-07e67e88","guard":[["hasAny",["aero","aerolineas","aeroméxico","aeronautica","blue1","brasil","capitalise","capitalize","capitalize each word","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","item number","kosmos","kuban","lsm","nth","orbest","png","pobeda","position","skywest","sriwijaya","title case","transbrasil","uni","united","vladivostok"]],["has","from"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-6783b2dd","guard":[["hasAny",["aero","aerolineas","aeroméxico","aeronautica","all caps","blue1","brasil","capital letters","capitals","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","item number","kosmos","kuban","lsm","nth","orbest","png","pobeda","position","skywest","sriwijaya","transbrasil","uni","united","upper case","uppercase","vladivostok"]],["has","from"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-8792e2f7","guard":[["hasAny",["aero","aerolineas","aeroméxico","aeronautica","blue1","brasil","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","invert case","item number","kosmos","kuban","lsm","nth","orbest","png","pobeda","position","skywest","sriwijaya","swap case","toggle case","transbrasil","uni","united","vladivostok"]],["has","from"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-cb32be54","guard":[["hasAny",["aero","aerolineas","aeroméxico","aeronautica","blue1","brasil","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","item number","kosmos","kuban","lower case","lowercase","lsm","nth","orbest","png","pobeda","position","skywest","small letters","sriwijaya","transbrasil","uni","united","vladivostok"]],["has","from"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-eda87472","guard":[["hasAny",["aero","aerolineas","aeroméxico","aeronautica","blue1","brasil","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","item number","kosmos","kuban","lsm","nth","orbest","png","pobeda","position","skywest","sriwijaya","transbrasil","uni","united","vladivostok"]],["has","from"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-0143aba6","guard":[["hasAny",["aero","aerolineas","aeroméxico","aeronautica","blue1","brasil","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","invert case","item number","kosmos","kuban","lsm","nth","orbest","png","pobeda","position","skywest","sriwijaya","swap case","toggle case","transbrasil","uni","united","vladivostok"]],["has","from"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-44b22dfb","guard":[["hasAny",["aero","aerolineas","aeroméxico","aeronautica","all caps","blue1","brasil","capital letters","capitals","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","item number","kosmos","kuban","lsm","nth","orbest","png","pobeda","position","skywest","sriwijaya","transbrasil","uni","united","upper case","uppercase","vladivostok"]],["has","from"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.upper",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-88200e05","guard":[["hasAny",["aero","aerolineas","aeroméxico","aeronautica","blue1","brasil","capitalise","capitalize","capitalize each word","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","item number","kosmos","kuban","lsm","nth","orbest","png","pobeda","position","skywest","sriwijaya","title case","transbrasil","uni","united","vladivostok"]],["has","from"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-ee578a1c","guard":[["hasAny",["aero","aerolineas","aeroméxico","aeronautica","blue1","brasil","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","item number","kosmos","kuban","lower case","lowercase","lsm","nth","orbest","png","pobeda","position","skywest","small letters","sriwijaya","transbrasil","uni","united","vladivostok"]],["has","from"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.lower",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-3d1fe37d","guard":[["hasAny",["aero","aerolineas","aeroméxico","aeronautica","blue1","brasil","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","item number","kosmos","kuban","lsm","normalise","normalize","nth","orbest","png","pobeda","position","simplify the text","skywest","sriwijaya","transbrasil","uni","united","vladivostok"]],["has","from"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-cce6da44","guard":[["hasAny",["aero","aerolineas","aeroméxico","aeronautica","blue1","brasil","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","item number","kosmos","kuban","lsm","normalise","normalize","nth","orbest","png","pobeda","position","simplify the text","skywest","sriwijaya","transbrasil","uni","united","vladivostok"]],["has","from"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-24fef6eb","guard":[["hasAny",["aero","aerolineas","aeroméxico","aeronautica","blue1","brasil","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","item number","kosmos","kuban","lsm","nth","orbest","png","pobeda","position","separate by","skywest","split","split by","sriwijaya","transbrasil","uni","united","vladivostok"]],["has","from"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-ff52ba36","guard":[["hasAny",["aero","aerolineas","aeroméxico","aeronautica","blue1","brasil","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","item number","kosmos","kuban","lsm","nth","orbest","png","pobeda","position","separate by","skywest","split","split by","sriwijaya","transbrasil","uni","united","vladivostok"]],["has","from"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-17292818","guard":[["has","country"],["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"OCEAN AIR CARGO":"OCEAN AIR CARGO is an airline of India.","Spicejet":"Spicejet is an airline of India.","Tianjin Airlines":"Tianjin Airlines is an airline of China.","Alrosa Mirny Air Enterprise":"Alrosa Mirny Air Enterprise is an airline of Russia.","bmi":"bmi is an airline of United Kingdom.","Avient Aviation":"Avient Aviation is an airline of Zimbabwe.","Bingo Airways":"Bingo Airways is an airline of Poland.","Blue Wings":"Blue Wings is an airline of Germany.","AirAsia X":"AirAsia X is an airline of Malaysia.","Air VIA":"Air VIA is an airline of Bulgaria.","Shaheen Air International":"Shaheen Air International is an airline of Pakistan.","Whitejets":"Whitejets is an airline of Brazil.","Pacific Wings":"Pacific Wings is an airline of United States.","Air Transat":"Air Transat is an airline of Canada.","Zabaykalskii Airlines":"Zabaykalskii Airlines is an airline of Russia.","Aerolane":"Aerolane is an airline of Ecuador.","Air Macau":"Air Macau is an airline of Macao.","Porter Airlines":"Porter Airlines is an airline of Canada.","Southjet cargo":"Southjet cargo is an airline of United States.","All America US":"All America US is an airline of United States.","Lufttransport":"Lufttransport is an airline of Norway.","Hageland Aviation Services":"Hageland Aviation Services is an airline of United States.","Hong Kong Airlines":"Hong Kong Airlines is an airline of Hong Kong SAR of China.","Niki":"Niki is an airline of Austria.","bmibaby":"bmibaby is an airline of United Kingdom.","Island Air (WP)":"Island Air (WP) is an airline of United States."}}},
{"id":"n-4d13a1ca","guard":[["has","airline"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"from"}]]],"mem":{"table":{"which country is the airline Kosmos":"Kosmos is an airline of Russia.","which country is the airline Air Explore":"Air Explore is an airline of Slovakia.","which country is the airline LSM Airlines":"LSM Airlines is an airline of Russia.","which country is the airline Orbest":"Orbest is an airline of Portugal.","which country is the airline Aero Contractors":"Aero Contractors is an airline of Nigeria.","which country is the airline Aeronautica Militare":"Aeronautica Militare is an airline of Italy.","which country is the airline Skywest Airlines":"Skywest Airlines is an airline of Australia.","which country is the airline Pobeda":"Pobeda is an airline of Russia.","which country is the airline Hex'Air":"Hex'Air is an airline of France.","which country is the airline NEXT Brasil":"NEXT Brasil is an airline of Brazil.","which country is the airline Vladivostok Air":"Vladivostok Air is an airline of Russia.","which country is the airline AeroMéxico":"AeroMéxico is an airline of Mexico.","which country is the airline Blue1":"Blue1 is an airline of Finland.","which country is the airline TransBrasil Airlines":"TransBrasil Airlines is an airline of Brazil.","which country is the airline Airlines PNG":"Airlines PNG is an airline of Papua New Guinea.","which country is the airline CCML Airlines":"CCML Airlines is an airline of Colombia.","which country is the airline Uni Air":"Uni Air is an airline of Taiwan.","which country is the airline Kuban Airlines":"Kuban Airlines is an airline of Russia.","which country is the airline United Airlines":"United Airlines is an airline of United States.","which country is the airline Happy Air":"Happy Air is an airline of Thailand.","which country is the airline Flyhy Cargo Airlines":"Flyhy Cargo Airlines is an airline of Thailand.","which country is the airline Finncomm Airlines":"Finncomm Airlines is an airline of Finland.","which country is the airline Sriwijaya Air":"Sriwijaya Air is an airline of Indonesia.","which country is the airline Turkish Air Force":"Turkish Air Force is an airline of Turkey.","which country is the airline Aerolineas heredas santa maria":"Aerolineas heredas santa maria is an airline of Dominican Republic.","which country is the airline Conviasa":"Conviasa is an airline of Venezuela."}}},
{"id":"n-01aa9462","guard":[["hasAny",["aero","aeroméxico","aeronautica","blue1","brasil","ccml","conviasa","dashes","explore","finncomm","flyhy","force","happy","hexair","hyphens","item number","kebab case","kebabcase","kosmos","kuban","lsm","nth","orbest","pobeda","position","skywest","slug","sriwijaya","transbrasil","uni","vladivostok"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-1004df40","guard":[["hasAny",["aero","aeroméxico","aeronautica","blue1","brasil","ccml","class name","conviasa","explore","finncomm","flyhy","force","happy","hexair","item number","kosmos","kuban","lsm","nth","orbest","pascal case","pascalcase","pobeda","position","skywest","sriwijaya","transbrasil","uni","upper camel case","vladivostok"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-8328ac97","guard":[["hasAny",["aero","aeroméxico","aeronautica","blue1","brasil","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","item number","kosmos","kuban","lsm","nth","orbest","pobeda","position","reverse the words","reverse word order","skywest","sriwijaya","transbrasil","uni","vladivostok","words backwards"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-feefbdf7","guard":[["hasAny",["aero","aeroméxico","aeronautica","blue1","brasil","camel case","camelcase","ccml","conviasa","explore","finncomm","flyhy","force","happy","hexair","item number","kosmos","kuban","lower camel case","lsm","nth","orbest","pobeda","position","skywest","sriwijaya","transbrasil","uni","vladivostok"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-7f777b65","guard":[["hasAny",["aerotaxi","baltic","cambodge","chater","class name","division","elburaq","europesky","flugfelag","flybaboo","item number","jalways","lituanica","nth","olympic","orient","pascal case","pascalcase","position","shandong","sharp","transwest","tuifly","upper camel case","yuzhmashavia"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-bb34b2c3","guard":[["hasAny",["aerotaxi","baltic","cambodge","chater","division","elburaq","europesky","flugfelag","flybaboo","item number","jalways","lituanica","nth","olympic","orient","position","reverse the words","reverse word order","shandong","sharp","transwest","tuifly","words backwards","yuzhmashavia"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-c73141b3","guard":[["hasAny",["aerotaxi","baltic","cambodge","chater","dashes","division","elburaq","europesky","flugfelag","flybaboo","hyphens","item number","jalways","kebab case","kebabcase","lituanica","nth","olympic","orient","position","shandong","sharp","slug","transwest","tuifly","yuzhmashavia"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-d15b5758","guard":[["hasAny",["aerotaxi","baltic","cambodge","camel case","camelcase","chater","division","elburaq","europesky","flugfelag","flybaboo","item number","jalways","lituanica","lower camel case","nth","olympic","orient","position","shandong","sharp","transwest","tuifly","yuzhmashavia"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-2a3d7f0d","guard":[["hasAny",["airline","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","code"]],["not",["has","ada"]],["not",["has","aereas"]],["not",["has","allegiant"]],["not",["has","austria"]],["not",["has","braathens"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}],["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]]],"mem":null},
{"id":"n-4dba96c1","guard":[["hasAny",["alrosa","baltic","chater","division","kosmos","kuban","lsm","pobeda","vladivostok","zabaykalskii"]],["not",["has","firstlevel"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Russia."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-23ba846d","guard":[["hasAny",["all","atlas","hageland","liberty","midwest","pacific","southjet","united"]],["not",["has","arab"]],["not",["has","code"]],["not",["has","egypt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of United States."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-d25f5e38","guard":[["hasAny",["atlas","cayman","chater","co","item number","ivoire","jalways","liberty","longest","longest one","longest word","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.and",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-f1ca5515","guard":[["hasAny",["atlas","cayman","chater","co","item number","ivoire","jalways","liberty","longest","longest one","longest word","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-379f9447","guard":[["hasAny",["atlas","cayman","chater","co","item number","ivoire","jalways","liberty","longest","longest one","longest word","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-c8a4da7d","guard":[["hasAny",["atlas","capitalise","capitalize","capitalize each word","cayman","chater","co","item number","ivoire","jalways","liberty","longest","longest one","longest word","nth","position","title case","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-e5fd26aa","guard":[["hasAny",["atlas","cayman","chater","co","item number","ivoire","jalways","liberty","longest","longest one","longest word","lower case","lowercase","nth","position","small letters","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-eda20263","guard":[["hasAny",["atlas","cayman","chater","co","invert case","item number","ivoire","jalways","liberty","longest","longest one","longest word","nth","position","swap case","toggle case","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-f5ba9869","guard":[["hasAny",["all caps","atlas","capital letters","capitals","cayman","chater","co","item number","ivoire","jalways","liberty","longest","longest one","longest word","nth","position","tuifly","upper case","uppercase"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-18423e21","guard":[["hasAny",["atlas","cayman","chater","co","item number","ivoire","jalways","liberty","longest","longest one","longest word","lower case","lowercase","nth","position","small letters","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.lower",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}]],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-4ca50822","guard":[["hasAny",["atlas","capitalise","capitalize","capitalize each word","cayman","chater","co","item number","ivoire","jalways","liberty","longest","longest one","longest word","nth","position","title case","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}]],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-8f5ef84b","guard":[["hasAny",["all caps","atlas","capital letters","capitals","cayman","chater","co","item number","ivoire","jalways","liberty","longest","longest one","longest word","nth","position","tuifly","upper case","uppercase"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.upper",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}]],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-c24e959a","guard":[["hasAny",["atlas","cayman","chater","co","invert case","item number","ivoire","jalways","liberty","longest","longest one","longest word","nth","position","swap case","toggle case","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}]],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-0cac5050","guard":[["hasAny",["atlas","cayman","chater","co","item number","ivoire","jalways","liberty","longest","longest one","longest word","normalise","normalize","nth","position","simplify the text","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":2}],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-7000e8ec","guard":[["hasAny",["atlas","cayman","chater","co","item number","ivoire","jalways","liberty","longest","longest one","longest word","normalise","normalize","nth","position","simplify the text","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":1}],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-0cc35e12","guard":[["hasAny",["atlas","cayman","chater","co","item number","ivoire","jalways","liberty","longest","longest one","longest word","nth","position","separate by","split","split by","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],["sense.lastWord"]]],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-23110896","guard":[["hasAny",["atlas","cayman","chater","co","item number","ivoire","jalways","liberty","longest","longest one","longest word","nth","position","separate by","split","split by","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],["sense.lastWord"]]],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-b162c651","guard":[["hasAny",["alrosa","delete","kosmos","kuban","lsm","pobeda","remove","strip out","vladivostok","without","zabaykalskii"]]],"pyramid":["render.str",["transform.remove",{"lit":"russia"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-bf122905","guard":[["hasAny",["alrosa","delete","kosmos","kuban","lsm","pobeda","remove","strip out","vladivostok","without","zabaykalskii"]]],"pyramid":["render.str",["transform.remove",{"lit":"Russia"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-024462cd","guard":[["hasAny",["item number","kosmos","kuban","lsm","nth","pobeda","position","vladivostok"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Russia."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-10a0fd7c","guard":[["hasAny",["aerolane","bmibaby","item number","lufttransport","normalise","normalize","nth","position","simplify the text","spicejet","whitejets"]],["has","the"],["not",["has","ada"]],["not",["has","america"]],["not",["has","asia"]],["not",["has","charter"]],["words<=",10]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of ",{"slot":1},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-5adde6d1","guard":[["hasAny",["all","delete","hageland","island","pacific","remove","southjet","strip out","without"]],["has","home"]],"pyramid":["render.str",["transform.remove",{"lit":"United States"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-c4780d5f","guard":[["hasAny",["airlines","atlas","bmi","island","item number","nth","position"]],["not",["has","code"]],["not",["has","by"]],["not",["has","conectia"]],["not",["has","lan"]],["not",["has","state"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]],"mem":null},
{"id":"n-11540d6f","guard":[["hasAny",["airlines","atlas","bmi","island","item number","lower case","lowercase","nth","position","small letters"]],["not",["has","code"]],["not",["has","by"]],["not",["has","conectia"]],["not",["has","lan"]],["not",["has","state"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]]],"mem":null},
{"id":"n-c77fbdc6","guard":[["hasAny",["airlines","all caps","atlas","bmi","capital letters","capitals","island","item number","nth","position","upper case","uppercase"]],["not",["has","code"]],["not",["has","by"]],["not",["has","conectia"]],["not",["has","lan"]],["not",["has","state"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]]],"mem":null},
{"id":"n-e1c635a4","guard":[["hasAny",["airlines","atlas","bmi","invert case","island","item number","nth","position","swap case","toggle case"]],["not",["has","code"]],["not",["has","by"]],["not",["has","conectia"]],["not",["has","lan"]],["not",["has","state"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]]],"mem":null},
{"id":"n-6ba57632","guard":[["hasAny",["airlines","atlas","bmi","element","island","item number","nth","position"]],["not",["has","code"]],["not",["has","conectia"]],["not",["has","lan"]],["not",["has","state"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of ",{"slot":1},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]],"mem":null},
{"id":"n-5f74fbd2","guard":[["hasAny",["airlines","atlas","bmi","element","invert case","island","item number","nth","position","swap case","toggle case"]],["not",["has","code"]],["not",["has","conectia"]],["not",["has","lan"]],["not",["has","state"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of ",{"slot":1},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]]],"mem":null},
{"id":"n-860e064b","guard":[["hasAny",["airlines","atlas","bmi","element","island","item number","lower case","lowercase","nth","position","small letters"]],["not",["has","code"]],["not",["has","conectia"]],["not",["has","lan"]],["not",["has","state"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of ",{"slot":1},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]]],"mem":null},
{"id":"n-c0151a68","guard":[["hasAny",["airlines","all caps","atlas","bmi","capital letters","capitals","element","island","item number","nth","position","upper case","uppercase"]],["not",["has","code"]],["not",["has","conectia"]],["not",["has","lan"]],["not",["has","state"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of ",{"slot":1},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]]],"mem":null},
{"id":"n-e5b00152","guard":[["hasAny",["atlas","delete","liberty","midwest","remove","strip out","united","without"]],["has","airline"]],"pyramid":["render.str",["transform.remove",{"lit":"United States"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-0494c17f","guard":[["hasAny",["blue","europesky","tuifly"]],["not",["has","code"]],["not",["has","me"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Germany."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-7a31714c","guard":[["hasAny",["brasil","transbrasil","whitejets"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Brazil."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-e1888f06","guard":[["hasAny",["porter","transat","transwest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Canada."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-b69a7c15","guard":[["hasAny",["alrosa","chater","delete","item number","nth","position","strip out","vladivostok"]]],"pyramid":["render.str",["transform.remove",{"lit":"Russia"},["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]]],"mem":null},
{"id":"n-da5baab8","guard":[["hasAny",["alrosa","chater","delete","item number","nth","position","strip out","vladivostok"]]],"pyramid":["render.str",["transform.remove",{"lit":"russia"},["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]]],"mem":null},
{"id":"n-30f97f9b","guard":[["hasAny",["atlas","item number","liberty","midwest","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of United States."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-cc141849","guard":[["hasAny",["baltic","chater","division","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Russia."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-2bb0666c","guard":[["hasAny",["chater","class name","item number","jalways","longest","longest one","longest word","nth","pascal case","pascalcase","position","tuifly","upper camel case"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-4c0901f5","guard":[["hasAny",["chater","item number","jalways","longest","longest one","longest word","nth","position","reverse the words","reverse word order","tuifly","words backwards"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-d0b136fb","guard":[["hasAny",["camel case","camelcase","chater","item number","jalways","longest","longest one","longest word","lower camel case","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-f0cbc55e","guard":[["hasAny",["chater","dashes","hyphens","item number","jalways","kebab case","kebabcase","longest","longest one","longest word","nth","position","slug","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]]],"mem":null},
{"id":"n-a82713e0","guard":[["hasAny",["brasil","delete","remove","strip out","transbrasil","whitejets","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Brazil"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-b4c03608","guard":[["hasAny",["cargo","delete","happy","orient","remove","strip out","without"]],["has","airline"]],"pyramid":["render.str",["transform.remove",{"lit":"Thailand"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-edab186a","guard":[["hasAny",["brasil","item number","nth","position","transbrasil","whitejets"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Brazil."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3ae9528f","guard":[["hasAny",["item number","kosmos","nth","pobeda","position","shortest","shortest one","shortest word","vladivostok"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Russia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9b4024e5","guard":[["hasAny",["atlas","item number","liberty","midwest","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9b4604e7","guard":[["hasAny",["all","hageland","island","item number","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-d0d90e0e","guard":[["hasAny",["all","hageland","island","item number","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-943a9c66","guard":[["hasAny",["all","hageland","island","item number","lower case","lowercase","nth","position","small letters"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a93259c0","guard":[["hasAny",["all","capitalise","capitalize","capitalize each word","hageland","island","item number","nth","position","title case"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d736c125","guard":[["hasAny",["all","hageland","invert case","island","item number","nth","position","swap case","toggle case"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e5f27824","guard":[["hasAny",["all","all caps","capital letters","capitals","hageland","island","item number","nth","position","upper case","uppercase"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-21713257","guard":[["hasAny",["atlas","item number","liberty","midwest","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-8be99209","guard":[["hasAny",["all","each word","hageland","island","item number","nth","position","split into words"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-aa64a21e","guard":[["hasAny",["item number","kuban","lsm","nth","position","vladivostok"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Russia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-bfa0c57b","guard":[["hasAny",["atlas","item number","liberty","midwest","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-c76ccd92","guard":[["hasAny",["all","each word","hageland","island","item number","nth","position","split into words"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0e41d9fd","guard":[["hasAny",["atlas","first n","item number","liberty","midwest","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-ca4e8ae5","guard":[["hasAny",["atlas","first n","item number","liberty","midwest","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-b3e79757","guard":[["hasAny",["shandong","tianjin"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of China."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-f2e6915b","guard":[["hasAny",["bmi","bmibaby"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of United Kingdom."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-4324db5a","guard":[["hasAny",["delete","item number","nth","position","strip out","transat","transwest"]]],"pyramid":["render.str",["transform.remove",{"lit":"Canada"},["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]]],"mem":null},
{"id":"n-439ee190","guard":[["hasAny",["atlas","delete","island","item number","nth","position","strip out"]],["words<=",8]],"pyramid":["render.str",["transform.remove",{"lit":"United States"},["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]]],"mem":null},
{"id":"n-701dfc24","guard":[["hasAny",["atlas","liberty","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of United States."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-11813703","guard":[["hasAny",["europesky","item number","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-40d38d75","guard":[["hasAny",["blue1","finncomm","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Finland."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-44167d2a","guard":[["hasAny",["flyhy","happy","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Thailand."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6cf0a78c","guard":[["hasAny",["brasil","item number","nth","position","transbrasil"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Brazil."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-fbf299b6","guard":[["hasAny",["airlines","atlas","element","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]],"mem":null},
{"id":"n-1b2ac2e3","guard":[["hasAny",["airlines","atlas","element","item number","lower case","lowercase","nth","position","small letters"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]]],"mem":null},
{"id":"n-3d870977","guard":[["hasAny",["airlines","atlas","element","invert case","item number","nth","position","swap case","toggle case"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]]],"mem":null},
{"id":"n-451e50d9","guard":[["hasAny",["airlines","all caps","atlas","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]]],"mem":null},
{"id":"n-9b5eb72b","guard":[["hasAny",["europesky","item number","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Germany."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b17ea398","guard":[["hasAny",["brasil","delete","remove","strip out","transbrasil","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",{"lit":"Brazil"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ba80e9b8","guard":[["hasAny",["blue1","delete","finncomm","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Finland"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-df0a3616","guard":[["hasAny",["blue1","delete","finncomm","remove","strip out","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",{"lit":"Finland"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-e70ca3fa","guard":[["hasAny",["delete","porter","remove","strip out","transat","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Canada"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-759d5ff9","guard":[["hasAny",["europesky","item number","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-8a427dc6","guard":[["hasAny",["europesky","item number","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-a6ac8b6f","guard":[["hasAny",["europesky","item number","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-0158c38e","guard":[["hasAny",["europesky","first n","item number","nth","position","take","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-046235a3","guard":[["hasAny",["europesky","first n","item number","nth","position","take","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-b97d7a50","guard":[["hasAny",["atlas","item number","liberty","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ee62a60c","guard":[["hasAny",["atlas","item number","liberty","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-25bcd1cf","guard":[["hasAny",["hageland","island","item number","normalise","normalize","nth","position","simplify the text"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-b1288fc9","guard":[["hasAny",["chater","division","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bb86d886","guard":[["hasAny",["chater","division","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-ee3cd638","guard":[["hasAny",["chater","division","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-33d3034e","guard":[["hasAny",["chater","division","first n","item number","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-5cf8b83a","guard":[["hasAny",["chater","division","first n","item number","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-010c532a","guard":[["has","hong"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Hong Kong SAR of China."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-0f536c18","guard":[["has","macau"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Macao."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-24b92f2f","guard":[["has","aerolane"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Ecuador."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-3e201b9c","guard":[["has","international"],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Pakistan."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-65d79bbd","guard":[["has","avient"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Zimbabwe."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-6c88ce33","guard":[["has","spicejet"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of India."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-84dadb28","guard":[["has","lufttransport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Norway."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-afeed456","guard":[["has","niki"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Austria."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-e1a930c2","guard":[["has","bingo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Poland."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-e1c0b096","guard":[["has","via"],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Bulgaria."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-fbc8971b","guard":[["has","airasia"],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Malaysia."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]]],"mem":null},
{"id":"n-125a8734","guard":[["hasAny",["jalways","longest","longest one","longest word"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Japan."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-31b068cc","guard":[["hasAny",["delete","happy","item number","nth","position","strip out"]],["has","which"]],"pyramid":["render.str",["transform.remove",{"lit":"Thailand"},["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]]],"mem":null},
{"id":"n-34a0fe5e","guard":[["hasAny",["ivoire","longest","longest one","longest word"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Ivory Coast."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-45bd91d9","guard":[["hasAny",["longest","longest one","longest word","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4c91efa6","guard":[["hasAny",["cayman","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Cayman Islands."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-513884d9","guard":[["hasAny",["cargo","delete","item number","nth","position","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"India"},["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]]],"mem":null},
{"id":"n-6b733f4c","guard":[["hasAny",["co","longest","longest one","longest word"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Republic of Korea."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8e574ddb","guard":[["hasAny",["chater","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Russia."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-009a8066","guard":[["hasAny",["item number","nth","orient","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Thailand."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-018aaf49","guard":[["hasAny",["cambodge","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Cambodia."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-070c0bc0","guard":[["hasAny",["item number","nth","position","uni"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Taiwan."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-085337b3","guard":[["hasAny",["flybaboo","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Switzerland."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-09aa83db","guard":[["hasAny",["flugfelag","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Iceland."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-0f7c1c55","guard":[["hasAny",["hexair","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of France."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-27b04d0c","guard":[["hasAny",["item number","nth","position","sriwijaya"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Indonesia."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2afb8b6c","guard":[["hasAny",["item number","nth","orbest","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Portugal."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-30ddf9a5","guard":[["hasAny",["force","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Turkey."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-30e9ee2e","guard":[["hasAny",["item number","nth","position","skywest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Australia."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-35ba7b11","guard":[["hasAny",["item number","lituanica","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Lithuania."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-37a488c4","guard":[["hasAny",["aerotaxi","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Italy."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-3ee50c38","guard":[["hasAny",["item number","nth","position","yuzhmashavia"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Ukraine."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-44c2f553","guard":[["hasAny",["aerolineas","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Dominican Republic."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5964a519","guard":[["hasAny",["item number","nth","png","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Papua New Guinea."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5ce93b9f","guard":[["hasAny",["item number","nth","position","united"]],["has","airline"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of United States."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7ce5fdee","guard":[["hasAny",["aeronautica","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Italy."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7df25ae1","guard":[["hasAny",["aeroméxico","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Mexico."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-83866766","guard":[["hasAny",["explore","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Slovakia."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8fccf6ca","guard":[["hasAny",["ccml","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Colombia."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a39a908c","guard":[["hasAny",["aero","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Nigeria."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-aa499a6c","guard":[["hasAny",["elburaq","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Libya."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-aaf4c7e9","guard":[["hasAny",["item number","nationwide","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of South Africa."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ac242e12","guard":[["hasAny",["item number","nth","position","shandong"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of China."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ae83d01e","guard":[["hasAny",["conviasa","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Venezuela."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-afe67021","guard":[["hasAny",["item number","nth","position","sharp"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Australia."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-b1bca136","guard":[["hasAny",["item number","nth","position","transwest"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Canada."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-c3fe3ad3","guard":[["hasAny",["item number","nth","olympic","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Greece."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-f6ea2920","guard":[["hasAny",["item number","lao","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Lao Peoples Democratic Republic."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-01d1c589","guard":[["hasAny",["item number","lufttransport","nth","position"]]],"pyramid":["render.template",{"lit":["Lufttransport is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-1407f534","guard":[["hasAny",["bmi","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["bmi is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-2555658e","guard":[["hasAny",["island","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Island Air (WP) is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-275b0180","guard":[["hasAny",["bmibaby","item number","nth","position"]]],"pyramid":["render.template",{"lit":["bmibaby is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-29cd52ba","guard":[["hasAny",["item number","nth","position","tianjin"]]],"pyramid":["render.template",{"lit":["Tianjin Airlines is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-322fa63a","guard":[["hasAny",["item number","nth","position","transat"]]],"pyramid":["render.template",{"lit":["Air Transat is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-369518f4","guard":[["hasAny",["international","item number","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":["Shaheen Air International is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-415f9971","guard":[["hasAny",["item number","nth","pacific","position"]],["has","home"]],"pyramid":["render.template",{"lit":["Pacific Wings is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-5b3e6d6f","guard":[["hasAny",["hong","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Hong Kong Airlines is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-5c4c11fe","guard":[["hasAny",["item number","niki","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Niki is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-6c074f8e","guard":[["hasAny",["item number","nth","position","spicejet"]]],"pyramid":["render.template",{"lit":["Spicejet is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-7b011187","guard":[["hasAny",["alrosa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Alrosa Mirny Air Enterprise is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-919d56f0","guard":[["hasAny",["item number","nth","position","via"]],["has","home"]],"pyramid":["render.template",{"lit":["Air VIA is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-9be1dd59","guard":[["hasAny",["bingo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Bingo Airways is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-a0203ad9","guard":[["hasAny",["hageland","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Hageland Aviation Services is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-a244b14f","guard":[["hasAny",["item number","macau","nth","position"]]],"pyramid":["render.template",{"lit":["Air Macau is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-a89ef0df","guard":[["hasAny",["all","item number","nth","position"]]],"pyramid":["render.template",{"lit":["All America US is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-c0717bce","guard":[["hasAny",["avient","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Avient Aviation is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-c2225d65","guard":[["hasAny",["item number","nth","porter","position"]]],"pyramid":["render.template",{"lit":["Porter Airlines is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-c2db9bec","guard":[["hasAny",["item number","nth","position","zabaykalskii"]]],"pyramid":["render.template",{"lit":["Zabaykalskii Airlines is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-c88b4be9","guard":[["hasAny",["aerolane","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Aerolane is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-cabf7004","guard":[["hasAny",["airasia","item number","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":["AirAsia X is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-dae4df4e","guard":[["hasAny",["item number","nth","position","whitejets"]]],"pyramid":["render.template",{"lit":["Whitejets is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-e8805475","guard":[["hasAny",["blue","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Blue Wings is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-fc54d7d3","guard":[["hasAny",["item number","nth","position","southjet"]]],"pyramid":["render.template",{"lit":["Southjet cargo is an airline of ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-8a5600a9","guard":[["hasAny",["airasia","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}],["sense.roman"]]],"mem":null},
{"id":"n-b419d96a","guard":[["hasAny",["airline","delete","item number","nth","position","remove","strip out","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}],["sense.numeral"]]],"mem":null},
{"id":"n-1368095d","guard":[["hasAny",["item number","liberty","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["Liberty Airways is an ",{"slot":0}," of ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-256d9ff4","guard":[["hasAny",["atlas","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["Atlas Air is an ",{"slot":0}," of ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-257bfd2e","guard":[["hasAny",["chater","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["SOCHI AIR CHATER is an ",{"slot":0}," of ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-26377382","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Air Korea Co. Ltd. is an ",{"slot":0}," of ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-46e4c749","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":["TUIfly is an ",{"slot":0}," of ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-83bca034","guard":[["hasAny",["item number","ivoire","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Air Ivoire is an ",{"slot":0}," of ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-b1e0a571","guard":[["hasAny",["item number","jalways","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["JALways is an ",{"slot":0}," of ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-d9a5ca37","guard":[["hasAny",["cayman","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["Cayman Airways is an ",{"slot":0}," of ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-056e88b9","guard":[["hasAny",["item number","nth","orbest","position"]]],"pyramid":["render.template",{"lit":["Orbest is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-064c8eba","guard":[["hasAny",["item number","nth","orient","position"]]],"pyramid":["render.template",{"lit":["Orient Thai Airlines is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-0da7b53e","guard":[["hasAny",["item number","nationwide","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Nationwide Airlines is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-14b11d04","guard":[["hasAny",["finncomm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Finncomm Airlines is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-1f70d29d","guard":[["hasAny",["baltic","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Baltic Airlines is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-269fa63f","guard":[["hasAny",["europesky","item number","nth","position"]]],"pyramid":["render.template",{"lit":["EuropeSky is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-27d9ac7c","guard":[["hasAny",["item number","nth","position","yuzhmashavia"]]],"pyramid":["render.template",{"lit":["Yuzhmashavia is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-395e988f","guard":[["hasAny",["explore","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Air Explore is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-3a4b0e4b","guard":[["hasAny",["aeroméxico","item number","nth","position"]]],"pyramid":["render.template",{"lit":["AeroMéxico is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-4089cab4","guard":[["hasAny",["item number","nth","position","sriwijaya"]]],"pyramid":["render.template",{"lit":["Sriwijaya Air is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-4e333dac","guard":[["hasAny",["happy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Happy Air is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-4f816308","guard":[["hasAny",["aeronautica","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Aeronautica Militare is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-5192fca3","guard":[["hasAny",["item number","lituanica","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Air Lituanica is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-55b7920a","guard":[["hasAny",["elburaq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["El-Buraq Air Transport is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-55cc489f","guard":[["hasAny",["item number","lsm","nth","position"]]],"pyramid":["render.template",{"lit":["LSM Airlines is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-570ed32b","guard":[["hasAny",["item number","nth","png","position"]]],"pyramid":["render.template",{"lit":["Airlines PNG is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-5af9b520","guard":[["hasAny",["item number","nth","pobeda","position"]]],"pyramid":["render.template",{"lit":["Pobeda is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-67947b59","guard":[["hasAny",["blue1","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Blue1 is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-70f8c606","guard":[["hasAny",["item number","nth","position","transbrasil"]],["has","which"]],"pyramid":["render.template",{"lit":["TransBrasil Airlines is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-7f9a755f","guard":[["hasAny",["item number","kuban","nth","position"]]],"pyramid":["render.template",{"lit":["Kuban Airlines is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-81f8d7e9","guard":[["hasAny",["aerotaxi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Delta Aerotaxi is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-865fe840","guard":[["hasAny",["item number","nth","position","uni"]]],"pyramid":["render.template",{"lit":["Uni Air is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-87e1af53","guard":[["hasAny",["flybaboo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Flybaboo is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-8a31c708","guard":[["hasAny",["flyhy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Flyhy Cargo Airlines is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-8c378907","guard":[["hasAny",["hexair","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Hex'Air is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-8cbe3bf9","guard":[["hasAny",["flugfelag","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Flugfelag Vestmannaeyja is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-9261367a","guard":[["hasAny",["ccml","item number","nth","position"]]],"pyramid":["render.template",{"lit":["CCML Airlines is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-93276699","guard":[["hasAny",["item number","nth","position","sharp"]]],"pyramid":["render.template",{"lit":["Sharp Airlines is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-956a6f29","guard":[["hasAny",["item number","lao","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Lao Airlines is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-960653e2","guard":[["hasAny",["aerolineas","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Aerolineas heredas santa maria is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-9676056e","guard":[["hasAny",["item number","midwest","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Midwest Airlines is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-a1a7b542","guard":[["hasAny",["item number","nth","position","vladivostok"]]],"pyramid":["render.template",{"lit":["Vladivostok Air is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-b0aefba9","guard":[["hasAny",["item number","nth","position","united"]],["has","airline"]],"pyramid":["render.template",{"lit":["United Airlines is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-b9731270","guard":[["hasAny",["conviasa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Conviasa is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-b9970432","guard":[["hasAny",["force","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Turkish Air Force is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-bd0a6287","guard":[["hasAny",["aero","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Aero Contractors is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-c4fba30b","guard":[["hasAny",["item number","nth","olympic","position"]]],"pyramid":["render.template",{"lit":["Olympic Airlines is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-cafa72c7","guard":[["hasAny",["item number","nth","position","shandong"]]],"pyramid":["render.template",{"lit":["Shandong Airlines is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-dae302fa","guard":[["hasAny",["brasil","item number","nth","position"]]],"pyramid":["render.template",{"lit":["NEXT Brasil is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-dddfcceb","guard":[["hasAny",["item number","nth","position","transwest"]]],"pyramid":["render.template",{"lit":["Transwest Air is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-ebce47dd","guard":[["hasAny",["cambodge","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Royal Air Cambodge is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-f23039b3","guard":[["hasAny",["division","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Saratov Aviation Division is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-fc1e9b62","guard":[["hasAny",["item number","nth","position","skywest"]]],"pyramid":["render.template",{"lit":["Skywest Airlines is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-fcab4e64","guard":[["hasAny",["item number","kosmos","nth","position"]]],"pyramid":["render.template",{"lit":["Kosmos is an ",{"slot":0}," of ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}]],"mem":null},
{"id":"n-62a54879","guard":[["hasAny",["air","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline"},{"lit":"country"}],["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":2}]]],"mem":null},
{"id":"n-064245fc","guard":[["hasAny",["atlas","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]],"mem":null},
{"id":"n-7b1075da","guard":[["hasAny",["atlas","element","item number","longest","longest one","longest word","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]]],"mem":null},
{"id":"n-7bdfb1e3","guard":[["hasAny",["all caps","atlas","capital letters","capitals","element","item number","longest","longest one","longest word","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]]],"mem":null},
{"id":"n-f67851d2","guard":[["hasAny",["atlas","element","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of ",{"slot":2},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline"}]],["aggregate.longest",["sense.words"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]]],"mem":null},
{"id":"n-779f7ee3","guard":[["hasAny",["blue1","count","how many","how many items","normalise","normalize","number of items","simplify the text"]],["has","which"]],"pyramid":["render.str",["transform.norm",{"lit":"Finland"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-03f55113","guard":[["hasAny",["airline","airlines","country","transbrasil"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline TransBrasil Airlines from":"TransBrasil Airlines is an airline of Brazil."}}},
{"id":"n-04388b6b","guard":[["hasAny",["airline","country","hexair"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Hex'Air from":"Hex'Air is an airline of France."}}},
{"id":"n-0576ab4e","guard":[["hasAny",["country","home","name","pacific","wings"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Pacific Wings":"Pacific Wings is an airline of United States."}}},
{"id":"n-0819e0c6","guard":[["hasAny",["airline","airlines","country","finncomm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Finncomm Airlines from":"Finncomm Airlines is an airline of Finland."}}},
{"id":"n-103c85e1","guard":[["hasAny",["airline","airlines","baltic","based"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Baltic Airlines based":"Baltic Airlines is an airline of Russia."}}},
{"id":"n-132d7425","guard":[["hasAny",["all","america","country","home","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of All America US":"All America US is an airline of United States."}}},
{"id":"n-16df80d4","guard":[["hasAny",["bmibaby","country","home","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of bmibaby":"bmibaby is an airline of United Kingdom."}}},
{"id":"n-16f6d532","guard":[["hasAny",["air","airline","based","transwest"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Transwest Air based":"Transwest Air is an airline of Canada."}}},
{"id":"n-1c2f4b4a","guard":[["hasAny",["aeronautica","airline","country","militare"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Aeronautica Militare from":"Aeronautica Militare is an airline of Italy."}}},
{"id":"n-1f6e8cd8","guard":[["hasAny",["bmi","country","home","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of bmi":"bmi is an airline of United Kingdom."}}},
{"id":"n-2387c23f","guard":[["hasAny",["airlines","country","home","hong","kong","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Hong Kong Airlines":"Hong Kong Airlines is an airline of Hong Kong SAR of China."}}},
{"id":"n-2487ea85","guard":[["hasAny",["airlines","country","home","name","zabaykalskii"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Zabaykalskii Airlines":"Zabaykalskii Airlines is an airline of Russia."}}},
{"id":"n-2529cd21","guard":[["hasAny",["airline","airlines","cargo","country","flyhy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Flyhy Cargo Airlines from":"Flyhy Cargo Airlines is an airline of Thailand."}}},
{"id":"n-2a41ea33","guard":[["hasAny",["aerolane","country","home","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Aerolane":"Aerolane is an airline of Ecuador."}}},
{"id":"n-2d3cde70","guard":[["hasAny",["airline","airlines","country","png"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Airlines PNG from":"Airlines PNG is an airline of Papua New Guinea."}}},
{"id":"n-300ae73c","guard":[["has","whitejets"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Brazil."]},["sense.lastWord"]],"mem":null},
{"id":"n-341997b1","guard":[["hasAny",["air","airline","atlas","based"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Atlas Air based":"Atlas Air is an airline of United States."}}},
{"id":"n-34fbd4c2","guard":[["hasAny",["air","airline","country","force","turkish"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Turkish Air Force from":"Turkish Air Force is an airline of Turkey."}}},
{"id":"n-358dec53","guard":[["hasAny",["airline","airlines","based","lao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Lao Airlines based":"Lao Airlines is an airline of Lao Peoples Democratic Republic."}}},
{"id":"n-366283c5","guard":[["has","zabaykalskii"]],"pyramid":["render.template",{"lit":["Zabaykalskii ",{"slot":0}," is an airline of Russia."]},["sense.lastWord"]],"mem":null},
{"id":"n-3673612b","guard":[["hasAny",["aerolineas","airline","country","heredas","maria","santa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Aerolineas heredas santa maria from":"Aerolineas heredas santa maria is an airline of Dominican Republic."}}},
{"id":"n-4456d2fb","guard":[["hasAny",["country","home","lufttransport","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Lufttransport":"Lufttransport is an airline of Norway."}}},
{"id":"n-450c4e41","guard":[["hasAny",["air","country","home","name","transat"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Air Transat":"Air Transat is an airline of Canada."}}},
{"id":"n-47474e89","guard":[["has","spicejet"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of India."]},["sense.lastWord"]],"mem":null},
{"id":"n-50d29525","guard":[["hasAny",["airline","airlines","country","kuban"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Kuban Airlines from":"Kuban Airlines is an airline of Russia."}}},
{"id":"n-50d65380","guard":[["hasAny",["air","airline","country","happy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Happy Air from":"Happy Air is an airline of Thailand."}}},
{"id":"n-5456022b","guard":[["hasAny",["airways","bingo","country","home","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Bingo Airways":"Bingo Airways is an airline of Poland."}}},
{"id":"n-548a3d74","guard":[["hasAny",["airline","aviation","based","division","saratov"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Saratov Aviation Division based":"Saratov Aviation Division is an airline of Russia."}}},
{"id":"n-552a9a69","guard":[["hasAny",["airline","country","pobeda"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Pobeda from":"Pobeda is an airline of Russia."}}},
{"id":"n-5543f3fa","guard":[["hasAny",["airline","country","orbest"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Orbest from":"Orbest is an airline of Portugal."}}},
{"id":"n-573a2efc","guard":[["hasAny",["airline","country","kosmos"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Kosmos from":"Kosmos is an airline of Russia."}}},
{"id":"n-6608032f","guard":[["hasAny",["country","home","name","whitejets"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Whitejets":"Whitejets is an airline of Brazil."}}},
{"id":"n-663ab6b6","guard":[["has","transat"]],"pyramid":["render.template",{"lit":["Air ",{"slot":0}," is an airline of Canada."]},["sense.lastWord"]],"mem":null},
{"id":"n-66877a9b","guard":[["hasAny",["airline","based","flugfelag","vestmannaeyja"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Flugfelag Vestmannaeyja based":"Flugfelag Vestmannaeyja is an airline of Iceland."}}},
{"id":"n-678024e4","guard":[["hasAny",["air","airline","based","lituanica"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Air Lituanica based":"Air Lituanica is an airline of Lithuania."}}},
{"id":"n-67f6ac20","guard":[["hasAny",["airline","based","flybaboo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Flybaboo based":"Flybaboo is an airline of Switzerland."}}},
{"id":"n-6c052615","guard":[["has","aerolane"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Ecuador."]},["sense.lastWord"]],"mem":null},
{"id":"n-6f378d99","guard":[["has","southjet"]],"pyramid":["render.template",{"lit":["Southjet ",{"slot":0}," is an airline of United States."]},["sense.lastWord"]],"mem":null},
{"id":"n-7056645b","guard":[["hasAny",["airline","airways","based","liberty"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Liberty Airways based":"Liberty Airways is an airline of United States."}}},
{"id":"n-706cd494","guard":[["hasAny",["aero","airline","contractors","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Aero Contractors from":"Aero Contractors is an airline of Nigeria."}}},
{"id":"n-71f6da42","guard":[["hasAny",["airline","airlines","country","skywest"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Skywest Airlines from":"Skywest Airlines is an airline of Australia."}}},
{"id":"n-73f4ef27","guard":[["hasAny",["air","airline","based","ocean"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Ocean Air based":"Ocean Air is an airline of Mauritania."}}},
{"id":"n-74ffd525","guard":[["hasAny",["blue","country","home","name","wings"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Blue Wings":"Blue Wings is an airline of Germany."}}},
{"id":"n-7698a676","guard":[["hasAny",["airlines","country","home","name","porter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Porter Airlines":"Porter Airlines is an airline of Canada."}}},
{"id":"n-7b37397b","guard":[["hasAny",["airline","airlines","country","lsm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline LSM Airlines from":"LSM Airlines is an airline of Russia."}}},
{"id":"n-7cea9a3b","guard":[["hasAny",["airline","airlines","ccml","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline CCML Airlines from":"CCML Airlines is an airline of Colombia."}}},
{"id":"n-7dceb2d2","guard":[["hasAny",["air","airline","based","ivoire"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Air Ivoire based":"Air Ivoire is an airline of Ivory Coast."}}},
{"id":"n-7ecc7cc6","guard":[["hasAny",["air","airline","country","uni"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Uni Air from":"Uni Air is an airline of Taiwan."}}},
{"id":"n-8340b6d5","guard":[["hasAny",["air","country","home","name","via"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Air VIA":"Air VIA is an airline of Bulgaria."}}},
{"id":"n-83b93ad5","guard":[["hasAny",["airline","airlines","based","midwest"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Midwest Airlines based":"Midwest Airlines is an airline of United States."}}},
{"id":"n-858312ad","guard":[["hasAny",["country","home","name","spicejet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Spicejet":"Spicejet is an airline of India."}}},
{"id":"n-89d43a39","guard":[["hasAny",["airline","brasil","country","next"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline NEXT Brasil from":"NEXT Brasil is an airline of Brazil."}}},
{"id":"n-8ba20a34","guard":[["hasAny",["airline","conviasa","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Conviasa from":"Conviasa is an airline of Venezuela."}}},
{"id":"n-93137054","guard":[["hasAny",["airline","airlines","based","orient","thai"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Orient Thai Airlines based":"Orient Thai Airlines is an airline of Thailand."}}},
{"id":"n-97ef1ef1","guard":[["hasAny",["air","country","home","macau","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Air Macau":"Air Macau is an airline of Macao."}}},
{"id":"n-98928cbe","guard":[["hasAny",["aeroméxico","airline","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline AeroMéxico from":"AeroMéxico is an airline of Mexico."}}},
{"id":"n-997cb000","guard":[["hasAny",["aviation","country","hageland","home","name","services"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Hageland Aviation Services":"Hageland Aviation Services is an airline of United States."}}},
{"id":"n-9dcc1508","guard":[["hasAny",["airline","blue1","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Blue1 from":"Blue1 is an airline of Finland."}}},
{"id":"n-a0150a73","guard":[["hasAny",["aviation","avient","country","home","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Avient Aviation":"Avient Aviation is an airline of Zimbabwe."}}},
{"id":"n-a11b7ac3","guard":[["hasAny",["airline","airlines","based","olympic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Olympic Airlines based":"Olympic Airlines is an airline of Greece."}}},
{"id":"n-a28b9a65","guard":[["hasAny",["air","airline","based","co","korea","ltd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Air Korea Co. Ltd. based":"Air Korea Co. Ltd. is an airline of Republic of Korea."}}},
{"id":"n-abe42eaf","guard":[["hasAny",["airline","based","jalways"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline JALways based":"JALways is an airline of Japan."}}},
{"id":"n-afba5fe5","guard":[["hasAny",["airline","airlines","based","shandong"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Shandong Airlines based":"Shandong Airlines is an airline of China."}}},
{"id":"n-b259fb28","guard":[["hasAny",["air","airline","based","chater","sochi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline SOCHI AIR CHATER based":"SOCHI AIR CHATER is an airline of Russia."}}},
{"id":"n-b643d43b","guard":[["hasAny",["airline","airlines","country","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline United Airlines from":"United Airlines is an airline of United States."}}},
{"id":"n-b66a425c","guard":[["has","lufttransport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Norway."]},["sense.lastWord"]],"mem":null},
{"id":"n-b972f970","guard":[["hasAny",["air","airline","based","elburaq","transport"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline El-Buraq Air Transport based":"El-Buraq Air Transport is an airline of Libya."}}},
{"id":"n-bad7b56c","guard":[["hasAny",["airline","based","europesky"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline EuropeSky based":"EuropeSky is an airline of Germany."}}},
{"id":"n-bb598104","guard":[["hasAny",["airlines","country","home","name","tianjin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Tianjin Airlines":"Tianjin Airlines is an airline of China."}}},
{"id":"n-be081a8c","guard":[["hasAny",["air","airline","country","sriwijaya"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Sriwijaya Air from":"Sriwijaya Air is an airline of Indonesia."}}},
{"id":"n-be0bbb09","guard":[["hasAny",["airasia","country","home","name","x"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of AirAsia X":"AirAsia X is an airline of Malaysia."}}},
{"id":"n-cf737bd8","guard":[["hasAny",["air","country","home","island","name","wp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Island Air (WP)":"Island Air (WP) is an airline of United States."}}},
{"id":"n-d6282dc4","guard":[["hasAny",["air","airline","based","cambodge","royal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Royal Air Cambodge based":"Royal Air Cambodge is an airline of Cambodia."}}},
{"id":"n-d77d1f79","guard":[["hasAny",["cargo","country","home","name","southjet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Southjet cargo":"Southjet cargo is an airline of United States."}}},
{"id":"n-dbc5d986","guard":[["hasAny",["airline","based","tuifly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline TUIfly based":"TUIfly is an airline of Germany."}}},
{"id":"n-e243936e","guard":[["has","bingo"]],"pyramid":["render.template",{"lit":["Bingo ",{"slot":0}," is an airline of Poland."]},["sense.lastWord"]],"mem":null},
{"id":"n-e550d1bb","guard":[["hasAny",["air","country","home","international","name","shaheen"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Shaheen Air International":"Shaheen Air International is an airline of Pakistan."}}},
{"id":"n-e55314ca","guard":[["hasAny",["air","airline","country","explore"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Air Explore from":"Air Explore is an airline of Slovakia."}}},
{"id":"n-e64bb806","guard":[["hasAny",["air","airline","country","vladivostok"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country is the airline Vladivostok Air from":"Vladivostok Air is an airline of Russia."}}},
{"id":"n-e7da9991","guard":[["hasAny",["airline","airlines","based","sharp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Sharp Airlines based":"Sharp Airlines is an airline of Australia."}}},
{"id":"n-f1eadd46","guard":[["hasAny",["aerotaxi","airline","based","delta"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Delta Aerotaxi based":"Delta Aerotaxi is an airline of Italy."}}},
{"id":"n-f61450d9","guard":[["hasAny",["airline","airways","based","cayman"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Cayman Airways based":"Cayman Airways is an airline of Cayman Islands."}}},
{"id":"n-f79a8832","guard":[["hasAny",["airline","based","yuzhmashavia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Yuzhmashavia based":"Yuzhmashavia is an airline of Ukraine."}}},
{"id":"n-f7b0fa9b","guard":[["hasAny",["air","alrosa","country","enterprise","home","mirny","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Alrosa Mirny Air Enterprise":"Alrosa Mirny Air Enterprise is an airline of Russia."}}},
{"id":"n-f86221ee","guard":[["hasAny",["airline","airlines","based","nationwide"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"where is the airline Nationwide Airlines based":"Nationwide Airlines is an airline of South Africa."}}},
{"id":"n-fc6ebdb7","guard":[["hasAny",["country","home","name","niki"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of Niki":"Niki is an airline of Austria."}}},
{"id":"n-fd73e8fe","guard":[["hasAny",["air","cargo","country","home","name","ocean"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the home country of OCEAN AIR CARGO":"OCEAN AIR CARGO is an airline of India."}}},
{"id":"n-25b2bb32","guard":[["hasAny",["lower case","lowercase","small letters","whitejets"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Brazil."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3fa75a75","guard":[["has","lufttransport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Norway."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-48b727b0","guard":[["hasAny",["aerolane","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Ecuador."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6df6c647","guard":[["hasAny",["lower case","lowercase","small letters","spicejet"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of India."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8b8ea959","guard":[["hasAny",["longest","longest one","longest word","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":["TUIfly is an ",{"slot":0}," of Germany."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d3ce919a","guard":[["hasAny",["lower case","lowercase","lufttransport","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Norway."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e6ccb1f1","guard":[["has","whitejets"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Brazil."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-f37e2af3","guard":[["has","aerolane"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Ecuador."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-fba182a8","guard":[["hasAny",["jalways","longest","longest one","longest word"]],["has","where"]],"pyramid":["render.template",{"lit":["JALways is an ",{"slot":0}," of Japan."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-06531c48","guard":[["hasAny",["blue1","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Finland."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0dba03bd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lufttransport","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Norway."]},["transform.title",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-1806f12f","guard":[["hasAny",["blue1","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Blue1 is an ",{"slot":0}," of Finland."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2b641e69","guard":[["hasAny",["lower case","lowercase","lufttransport","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Norway."]},["transform.lower",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-33b5f674","guard":[["hasAny",["all","item number","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":["All ",{"slot":0}," US is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-394b881e","guard":[["hasAny",["aerolane","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Ecuador."]},["transform.swapCase",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-4593fca9","guard":[["hasAny",["aerolane","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Ecuador."]},["transform.title",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-4798ddcd","guard":[["hasAny",["invert case","lufttransport","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Norway."]},["transform.swapCase",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-71bd6150","guard":[["hasAny",["lower case","lowercase","small letters","whitejets"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Brazil."]},["transform.lower",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-88359ba2","guard":[["hasAny",["delete","remove","skywest","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Australia"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-a4bff0aa","guard":[["hasAny",["delete","remove","strip out","tianjin","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"China"},["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-a90aa6ea","guard":[["hasAny",["item number","jalways","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Japan."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b83c74b4","guard":[["hasAny",["all","item number","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," America US is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cd0a9378","guard":[["hasAny",["invert case","swap case","toggle case","whitejets"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Brazil."]},["transform.swapCase",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-dc206b1c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","whitejets"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Brazil."]},["transform.title",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-e046a9de","guard":[["hasAny",["shortest","shortest one","shortest word","transat"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Canada."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-f7459104","guard":[["hasAny",["aerolane","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is an airline of Ecuador."]},["transform.lower",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-1052c834","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","transbrasil"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Brazil."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-14d9c020","guard":[["hasAny",["item number","jalways","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Japan."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-163d6ab3","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sharp"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Australia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-199c3363","guard":[["hasAny",["blue1","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Finland."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1bb09043","guard":[["hasAny",["island","item number","nth","position","shortest","shortest one","shortest word"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," Air (",{"slot":1},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1fd9b985","guard":[["hasAny",["item number","ivoire","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," Ivoire is an ",{"slot":1}," of Ivory Coast."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-28ca73dc","guard":[["hasAny",["item number","longest","longest one","longest word","nationwide","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of South Africa."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-2b2a38e5","guard":[["hasAny",["hong","item number","longest","longest one","longest word","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," Kong ",{"slot":1}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2b5c8b9b","guard":[["hasAny",["item number","ivoire","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Air ",{"slot":0}," is an ",{"slot":1}," of Ivory Coast."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4524607d","guard":[["hasAny",["hong","item number","longest","longest one","longest word","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":["Hong ",{"slot":0}," ",{"slot":1}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-53a10f22","guard":[["hasAny",["item number","lituanica","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Lithuania."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5b98ee08","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","vladivostok"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," Air is an ",{"slot":1}," of Russia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7b65faed","guard":[["hasAny",["item number","lituanica","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Air ",{"slot":0}," is an ",{"slot":1}," of Lithuania."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-80dc8f83","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8f5f4cb8","guard":[["hasAny",["atlas","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," Air is an ",{"slot":1}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-93990232","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","transbrasil"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of Brazil."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-953e0a83","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","tuifly"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Germany."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9f48eaa6","guard":[["hasAny",["item number","longest","longest one","longest word","midwest","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ad39b051","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sharp"]],["has","where"]],"pyramid":["render.template",{"lit":["Sharp ",{"slot":0}," is an ",{"slot":1}," of Australia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-bee72336","guard":[["hasAny",["island","item number","nth","position","shortest","shortest one","shortest word"]],["has","home"]],"pyramid":["render.template",{"lit":["Island ",{"slot":0}," (",{"slot":1},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bfe8ca51","guard":[["hasAny",["item number","longest","longest one","longest word","nationwide","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of South Africa."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d3a5524f","guard":[["hasAny",["item number","jalways","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Japan."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d625043f","guard":[["hasAny",["atlas","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Atlas ",{"slot":0}," is an ",{"slot":1}," of United States."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d6a980b1","guard":[["hasAny",["all","item number","nth","position","shortest","shortest one","shortest word"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," US is an airline of United States."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-dcf7fac9","guard":[["hasAny",["item number","longest","longest one","longest word","midwest","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Midwest ",{"slot":0}," is an ",{"slot":1}," of United States."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-2497ae42","guard":[["hasAny",["explore","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Air ",{"slot":0}," is an ",{"slot":1}," of Slovakia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-28d3490b","guard":[["hasAny",["all","item number","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," US is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-4b91b49e","guard":[["hasAny",["blue1","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Finland."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4e1efa8f","guard":[["hasAny",["item number","nth","position","vladivostok"]],["has","country"]],"pyramid":["render.template",{"lit":["Vladivostok ",{"slot":0}," is an ",{"slot":1}," of Russia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4e7f7a66","guard":[["hasAny",["explore","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Slovakia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-55f0c7a2","guard":[["hasAny",["item number","jalways","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Japan."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-5f5a34b3","guard":[["hasAny",["item number","nth","position","sharp"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of Australia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-69f5ee23","guard":[["hasAny",["blue1","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Finland."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-75d37359","guard":[["hasAny",["explore","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," Explore is an ",{"slot":1}," of Slovakia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7fdc8982","guard":[["hasAny",["hong","item number","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Airlines is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-96d60ab5","guard":[["hasAny",["item number","nationwide","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Nationwide ",{"slot":0}," is an ",{"slot":1}," of South Africa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-9b6135f9","guard":[["hasAny",["item number","ivoire","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of Ivory Coast."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a9566746","guard":[["hasAny",["item number","midwest","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-cd709ba0","guard":[["hasAny",["item number","nth","position","transbrasil"]],["has","which"]],"pyramid":["render.template",{"lit":["TransBrasil ",{"slot":0}," is an ",{"slot":1}," of Brazil."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-cdc64c70","guard":[["hasAny",["item number","lituanica","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," Lituanica is an ",{"slot":1}," of Lithuania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-db51f3f8","guard":[["hasAny",["island","item number","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (WP) is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e42fa265","guard":[["hasAny",["item number","jalways","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Japan."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-0453d4df","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","united"]],["has","airline"]],"pyramid":["render.template",{"lit":["United ",{"slot":0}," is an ",{"slot":1}," of ",{"slot":2}," States."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-360cade6","guard":[["hasAny",["item number","ivoire","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Ivory Coast."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6451bb69","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","vladivostok"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Russia."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7689a997","guard":[["hasAny",["aerolineas","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," maria is an airline of Dominican Republic."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8cfe5f03","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sharp","shortest","shortest one","shortest word"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Australia."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-8db93d77","guard":[["hasAny",["item number","lituanica","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Lithuania."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ac1d727b","guard":[["hasAny",["aerolineas","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," heredas ",{"slot":1}," maria is an ",{"slot":2}," of Dominican Republic."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ae102c00","guard":[["hasAny",["first n","item number","jalways","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Japan."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-d2fc6a7a","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","united"]],["has","airline"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of ",{"slot":2}," States."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e4e1a12e","guard":[["hasAny",["first n","item number","jalways","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," is an ",{"slot":1}," of Japan."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-ed07e26a","guard":[["hasAny",["atlas","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ffc4fb15","guard":[["hasAny",["hong","item number","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-05497045","guard":[["hasAny",["hong","invert case","item number","nth","position","swap case","toggle case"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-122781b0","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Air ",{"slot":0}," ",{"slot":1},". Ltd. is an ",{"slot":2}," of Republic of Korea."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-178bbc41","guard":[["hasAny",["item number","lituanica","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Lithuania."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-1d6c7a4a","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","united"]],["has","airline"]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of ",{"slot":2}," States."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2210b5d1","guard":[["hasAny",["cayman","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," Airways is an ",{"slot":1}," of ",{"slot":2}," Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-25dff857","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sharp"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Australia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-2e5863de","guard":[["hasAny",["item number","ivoire","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Ivory Coast."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3523481b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hong","item number","nth","position","title case"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3a34db51","guard":[["hasAny",["item number","longest","longest one","longest word","midwest","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-3dfcdfa4","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of ",{"slot":2}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-41e65c1d","guard":[["hasAny",["item number","lituanica","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Lithuania."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-51679070","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," Korea ",{"slot":1},". Ltd. is an ",{"slot":2}," of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-53065ec9","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","transbrasil"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Brazil."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-53720b97","guard":[["hasAny",["aerolineas","item number","longest","longest one","longest word","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," santa maria is an ",{"slot":2}," of Dominican Republic."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6175efb7","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sharp"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Australia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-6a26e706","guard":[["hasAny",["item number","longest","longest one","longest word","nationwide","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of South Africa."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-728ccc07","guard":[["hasAny",["hong","item number","lower case","lowercase","nth","position","small letters"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-76835e27","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Co. Ltd. is an ",{"slot":2}," of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-78faeaf0","guard":[["hasAny",["division","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-80da3e57","guard":[["hasAny",["item number","lituanica","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Lithuania."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-88219f45","guard":[["hasAny",["division","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Division is an ",{"slot":2}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-8986446c","guard":[["hasAny",["cayman","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Cayman Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8fcd210d","guard":[["hasAny",["aerolineas","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Aerolineas ",{"slot":0}," ",{"slot":1}," maria is an ",{"slot":2}," of Dominican Republic."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-90694735","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","united"]],["has","airline"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-95ae2895","guard":[["hasAny",["item number","longest","longest one","longest word","nationwide","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of South Africa."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-a7a453af","guard":[["hasAny",["explore","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Slovakia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ac2cc33b","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Lao ",{"slot":0}," is an ",{"slot":1}," of ",{"slot":2}," Peoples Democratic Republic."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ac9b37c0","guard":[["hasAny",["cayman","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Cayman ",{"slot":0}," is an ",{"slot":1}," of ",{"slot":2}," Islands."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ae671b58","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","transbrasil"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Brazil."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b455adf6","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","vladivostok"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Russia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b750e35b","guard":[["hasAny",["all caps","capital letters","capitals","hong","item number","nth","position","upper case","uppercase"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-c5019373","guard":[["hasAny",["item number","ivoire","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Ivory Coast."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c53adfa3","guard":[["hasAny",["item number","longest","longest one","longest word","midwest","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-d024093d","guard":[["hasAny",["hong","item number","longest","longest one","longest word","nth","position"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d162da57","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Lao Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-df04a440","guard":[["hasAny",["island","item number","nth","position","shortest","shortest one","shortest word"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2},") is an airline of United States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-dfec83f8","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","vladivostok"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Russia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e62709e4","guard":[["hasAny",["item number","longest","longest one","longest word","midwest","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ec8776fa","guard":[["hasAny",["division","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Saratov ",{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Russia."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-f8957b53","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sharp"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Australia."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-03332ee1","guard":[["hasAny",["item number","nationwide","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of South Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-0b6d0250","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nth","position","sharp","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Australia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-12f8fe19","guard":[["hasAny",["force","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," Air ",{"slot":1}," is an ",{"slot":2}," of Turkey."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-21b4e972","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nationwide","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of South Africa."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-241f7c3c","guard":[["hasAny",["explore","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Slovakia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2ba5908b","guard":[["hasAny",["co","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2},". Ltd. is an airline of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3b34e8d6","guard":[["hasAny",["force","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["Turkish ",{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Turkey."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4168438c","guard":[["hasAny",["division","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," Aviation ",{"slot":1}," is an ",{"slot":2}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-46612fca","guard":[["hasAny",["item number","lao","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," Airlines is an ",{"slot":1}," of ",{"slot":2}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-49832645","guard":[["hasAny",["force","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Turkey."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-4de827b9","guard":[["hasAny",["first n","item number","longest","longest one","longest word","midwest","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-5ed65cc2","guard":[["hasAny",["item number","nth","position","sharp"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Australia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-668199d3","guard":[["hasAny",["first n","item number","lituanica","longest","longest one","longest word","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Lithuania."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-70314a85","guard":[["hasAny",["item number","ivoire","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Ivory Coast."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-752d66a6","guard":[["hasAny",["item number","nationwide","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of South Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-792566f2","guard":[["hasAny",["first n","item number","lituanica","longest","longest one","longest word","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Lithuania."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-880d7cc6","guard":[["hasAny",["each word","hong","item number","nth","position","split into words"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a061e5e7","guard":[["hasAny",["cayman","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an airline of ",{"slot":2}," Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b07b6329","guard":[["hasAny",["first n","item number","longest","longest one","longest word","midwest","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of United States."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-b7794a6e","guard":[["hasAny",["item number","lituanica","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Lithuania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-bde79acf","guard":[["hasAny",["each word","hong","item number","nth","position","split into words"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c3383a26","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nth","position","sharp","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Australia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-eb449d0c","guard":[["hasAny",["item number","ivoire","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Ivory Coast."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-ee5795d4","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nationwide","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of South Africa."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-f29ff859","guard":[["hasAny",["hong","item number","normalise","normalize","nth","position","simplify the text"]],["has","home"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an airline of Hong Kong SAR of China."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-f37330a2","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","united"]],["has","airline"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," States."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-faea1fb5","guard":[["hasAny",["explore","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Slovakia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-178d51aa","guard":[["hasAny",["first n","item number","ivoire","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Ivory Coast."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-4ec8f6f0","guard":[["hasAny",["aerolineas","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," maria is an ",{"slot":3}," of Dominican Republic."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5a02566c","guard":[["hasAny",["aerolineas","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," maria is an ",{"slot":3}," of Dominican Republic."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6aaa4728","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","united"]],["has","airline"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," States."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a1d72cd9","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ac5d2a62","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d11cf204","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","united"]],["has","airline"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," States."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d9c4f065","guard":[["hasAny",["first n","item number","ivoire","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of Ivory Coast."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-f859982c","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2},". Ltd. is an ",{"slot":3}," of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0dad1e5f","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2},". Ltd. is an ",{"slot":3}," of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-343f2683","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2},". Ltd. is an ",{"slot":3}," of Republic of Korea."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-49e27b54","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-49fc1763","guard":[["hasAny",["division","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-4b80334b","guard":[["hasAny",["division","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-4c49bfc7","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5cd5a025","guard":[["hasAny",["cayman","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5e7f6e7f","guard":[["hasAny",["cayman","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-60fcc475","guard":[["hasAny",["cayman","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Islands."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-74b1ba0e","guard":[["hasAny",["division","item number","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-aeaf04fb","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c801c4ec","guard":[["hasAny",["aerolineas","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," maria is an ",{"slot":3}," of Dominican Republic."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-cfc3a14f","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","united"]],["has","airline"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," States."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-cfc74d7e","guard":[["hasAny",["item number","lao","longest","longest one","longest word","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-dceb476a","guard":[["hasAny",["force","item number","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Turkey."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-eca7a7f3","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","united"]],["has","airline"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," States."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0513cbd5","guard":[["hasAny",["co","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2},". Ltd. is an ",{"slot":3}," of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-2ba2b1d0","guard":[["hasAny",["first n","item number","lao","longest","longest one","longest word","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2baa8f5f","guard":[["hasAny",["cayman","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2c66d7d1","guard":[["hasAny",["item number","lao","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-46c7dd6c","guard":[["hasAny",["division","first n","item number","longest","longest one","longest word","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-649d6e00","guard":[["hasAny",["force","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Turkey."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-72fe1a95","guard":[["hasAny",["division","first n","item number","longest","longest one","longest word","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Russia."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-8915e611","guard":[["hasAny",["first n","item number","lao","longest","longest one","longest word","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Peoples Democratic Republic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e04efb0e","guard":[["hasAny",["cayman","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-eac604bf","guard":[["hasAny",["co","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2},". Ltd. is an ",{"slot":3}," of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-fa6f30f0","guard":[["hasAny",["force","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is an ",{"slot":3}," of Turkey."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-20b44940","guard":[["hasAny",["cayman","first n","item number","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-28c15292","guard":[["hasAny",["cayman","first n","item number","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is an ",{"slot":2}," of ",{"slot":3}," Islands."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2d9e5c1a","guard":[["hasAny",["co","first n","item number","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2},". Ltd. is an ",{"slot":3}," of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-7ff9b5b6","guard":[["hasAny",["co","first n","item number","nth","position","take"]],["has","where"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2},". Ltd. is an ",{"slot":3}," of Republic of Korea."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-83e9adab","guard":[["hasAny",["aero","aerolineas","aeroméxico","aeronautica","based","brasil","conviasa","hexair","home","kosmos","orbest","pobeda"]],["not",["has","code"]],["not",["has","me"]],["not",["has","bulgaria"]],["not",["has","estonian"]],["not",["has","europe"]],["not",["has","hebei"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Air Lituanica based":"Air Lituanica is an airline of Lithuania.","name the home country of OCEAN AIR CARGO":"OCEAN AIR CARGO is an airline of India.","which country is the airline Kosmos from":"Kosmos is an airline of Russia.","name the home country of Spicejet":"Spicejet is an airline of India.","name the home country of Tianjin Airlines":"Tianjin Airlines is an airline of China.","which country is the airline Air Explore from":"Air Explore is an airline of Slovakia.","which country is the airline LSM Airlines from":"LSM Airlines is an airline of Russia.","which country is the airline Orbest from":"Orbest is an airline of Portugal.","which country is the airline Aero Contractors from":"Aero Contractors is an airline of Nigeria.","where is the airline Liberty Airways based":"Liberty Airways is an airline of United States.","which country is the airline Aeronautica Militare from":"Aeronautica Militare is an airline of Italy.","which country is the airline Skywest Airlines from":"Skywest Airlines is an airline of Australia.","where is the airline Yuzhmashavia based":"Yuzhmashavia is an airline of Ukraine.","name the home country of Alrosa Mirny Air Enterprise":"Alrosa Mirny Air Enterprise is an airline of Russia.","which country is the airline Pobeda from":"Pobeda is an airline of Russia.","which country is the airline Hex'Air from":"Hex'Air is an airline of France.","which country is the airline NEXT Brasil from":"NEXT Brasil is an airline of Brazil.","name the home country of bmi":"bmi is an airline of United Kingdom.","where is the airline EuropeSky based":"EuropeSky is an airline of Germany.","name the home country of Avient Aviation":"Avient Aviation is an airline of Zimbabwe.","where is the airline SOCHI AIR CHATER based":"SOCHI AIR CHATER is an airline of Russia.","name the home country of Bingo Airways":"Bingo Airways is an airline of Poland.","name the home country of Blue Wings":"Blue Wings is an airline of Germany.","name the home country of AirAsia X":"AirAsia X is an airline of Malaysia.","name the home country of Air VIA":"Air VIA is an airline of Bulgaria.","which country is the airline Vladivostok Air from":"Vladivostok Air is an airline of Russia.","where is the airline El-Buraq Air Transport based":"El-Buraq Air Transport is an airline of Libya.","which country is the airline AeroMéxico from":"AeroMéxico is an airline of Mexico.","where is the airline Nationwide Airlines based":"Nationwide Airlines is an airline of South Africa.","where is the airline Baltic Airlines based":"Baltic Airlines is an airline of Russia.","name the home country of Shaheen Air International":"Shaheen Air International is an airline of Pakistan.","which country is the airline TransBrasil Airlines from":"TransBrasil Airlines is an airline of Brazil.","name the home country of Whitejets":"Whitejets is an airline of Brazil.","name the home country of Pacific Wings":"Pacific Wings is an airline of United States.","where is the airline Cayman Airways based":"Cayman Airways is an airline of Cayman Islands.","which country is the airline Airlines PNG from":"Airlines PNG is an airline of Papua New Guinea.","where is the airline Ocean Air based":"Ocean Air is an airline of Mauritania.","name the home country of Air Transat":"Air Transat is an airline of Canada.","which country is the airline CCML Airlines from":"CCML Airlines is an airline of Colombia.","which country is the airline Uni Air from":"Uni Air is an airline of Taiwan.","name the home country of Zabaykalskii Airlines":"Zabaykalskii Airlines is an airline of Russia.","where is the airline Air Korea Co. Ltd. based":"Air Korea Co. Ltd. is an airline of Republic of Korea.","name the home country of Aerolane":"Aerolane is an airline of Ecuador.","where is the airline Atlas Air based":"Atlas Air is an airline of United States.","name the home country of Air Macau":"Air Macau is an airline of Macao.","where is the airline Lao Airlines based":"Lao Airlines is an airline of Lao Peoples Democratic Republic.","which country is the airline Kuban Airlines from":"Kuban Airlines is an airline of Russia.","which country is the airline United Airlines from":"United Airlines is an airline of United States.","which country is the airline Happy Air from":"Happy Air is an airline of Thailand.","where is the airline Transwest Air based":"Transwest Air is an airline of Canada.","name the home country of Porter Airlines":"Porter Airlines is an airline of Canada.","which country is the airline Flyhy Cargo Airlines from":"Flyhy Cargo Airlines is an airline of Thailand.","name the home country of Southjet cargo":"Southjet cargo is an airline of United States.","where is the airline Shandong Airlines based":"Shandong Airlines is an airline of China.","where is the airline Orient Thai Airlines based":"Orient Thai Airlines is an airline of Thailand.","name the home country of All America US":"All America US is an airline of United States.","name the home country of Lufttransport":"Lufttransport is an airline of Norway.","which country is the airline Finncomm Airlines from":"Finncomm Airlines is an airline of Finland.","where is the airline Royal Air Cambodge based":"Royal Air Cambodge is an airline of Cambodia.","name the home country of Hageland Aviation Services":"Hageland Aviation Services is an airline of United States.","where is the airline Flybaboo based":"Flybaboo is an airline of Switzerland.","where is the airline JALways based":"JALways is an airline of Japan.","where is the airline Delta Aerotaxi based":"Delta Aerotaxi is an airline of Italy.","where is the airline Flugfelag Vestmannaeyja based":"Flugfelag Vestmannaeyja is an airline of Iceland.","name the home country of Hong Kong Airlines":"Hong Kong Airlines is an airline of Hong Kong SAR of China.","where is the airline TUIfly based":"TUIfly is an airline of Germany.","which country is the airline Sriwijaya Air from":"Sriwijaya Air is an airline of Indonesia.","which country is the airline Turkish Air Force from":"Turkish Air Force is an airline of Turkey.","where is the airline Air Ivoire based":"Air Ivoire is an airline of Ivory Coast.","where is the airline Saratov Aviation Division based":"Saratov Aviation Division is an airline of Russia.","name the home country of Niki":"Niki is an airline of Austria.","which country is the airline Aerolineas heredas santa maria from":"Aerolineas heredas santa maria is an airline of Dominican Republic.","where is the airline Sharp Airlines based":"Sharp Airlines is an airline of Australia.","name the home country of bmibaby":"bmibaby is an airline of United Kingdom.","which country is the airline Conviasa from":"Conviasa is an airline of Venezuela.","where is the airline Olympic Airlines based":"Olympic Airlines is an airline of Greece.","name the home country of Island Air (WP)":"Island Air (WP) is an airline of United States.","where is the airline Midwest Airlines based":"Midwest Airlines is an airline of United States."}}},
{"id":"n-024d2948","guard":[["hasAny",["international","shaheen"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Shaheen Air International":"Shaheen Air International is an airline of Pakistan."}}},
{"id":"n-08220d11","guard":[["has","pacific"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Pacific Wings":"Pacific Wings is an airline of United States."}}},
{"id":"n-0ac441a7","guard":[["has","lufttransport"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Lufttransport":"Lufttransport is an airline of Norway."}}},
{"id":"n-0b4542e8","guard":[["has","sriwijaya"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Sriwijaya Air from":"Sriwijaya Air is an airline of Indonesia."}}},
{"id":"n-0c69f378","guard":[["has","kosmos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Kosmos from":"Kosmos is an airline of Russia."}}},
{"id":"n-0f3fd494","guard":[["has","aerolane"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Aerolane":"Aerolane is an airline of Ecuador."}}},
{"id":"n-109fbe51","guard":[["has","niki"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Niki":"Niki is an airline of Austria."}}},
{"id":"n-123d2172","guard":[["hasAny",["airasia","x"]],["has","home"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of AirAsia X":"AirAsia X is an airline of Malaysia."}}},
{"id":"n-13d5b679","guard":[["has","explore"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Air Explore from":"Air Explore is an airline of Slovakia."}}},
{"id":"n-1891709f","guard":[["has","ocean"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Ocean Air based":"Ocean Air is an airline of Mauritania."}}},
{"id":"n-201f0da0","guard":[["has","via"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Air VIA":"Air VIA is an airline of Bulgaria."}}},
{"id":"n-2c77802a","guard":[["hasAny",["airline","brasil","country","next"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline NEXT Brasil from":"NEXT Brasil is an airline of Brazil."}}},
{"id":"n-2d0a4cf7","guard":[["has","liberty"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Liberty Airways based":"Liberty Airways is an airline of United States."}}},
{"id":"n-2f1f06d0","guard":[["has","ccml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline CCML Airlines from":"CCML Airlines is an airline of Colombia."}}},
{"id":"n-31d38752","guard":[["hasAny",["aerolineas","airline","country","heredas","maria","santa"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Aerolineas heredas santa maria from":"Aerolineas heredas santa maria is an airline of Dominican Republic."}}},
{"id":"n-354da7e1","guard":[["has","lao"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Lao Airlines based":"Lao Airlines is an airline of Lao Peoples Democratic Republic."}}},
{"id":"n-362b9b1e","guard":[["has","transwest"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Transwest Air based":"Transwest Air is an airline of Canada."}}},
{"id":"n-3aee5d26","guard":[["hasAny",["orient","thai"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Orient Thai Airlines based":"Orient Thai Airlines is an airline of Thailand."}}},
{"id":"n-3c654506","guard":[["hasAny",["aero","airline","contractors","country"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Aero Contractors from":"Aero Contractors is an airline of Nigeria."}}},
{"id":"n-3ee5e6f7","guard":[["hasAny",["all","america"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of All America US":"All America US is an airline of United States."}}},
{"id":"n-42405ffc","guard":[["hasAny",["aerotaxi","airline","based","delta"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Delta Aerotaxi based":"Delta Aerotaxi is an airline of Italy."}}},
{"id":"n-42590178","guard":[["has","transbrasil"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline TransBrasil Airlines from":"TransBrasil Airlines is an airline of Brazil."}}},
{"id":"n-4c7211f3","guard":[["has","skywest"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Skywest Airlines from":"Skywest Airlines is an airline of Australia."}}},
{"id":"n-4dab3a36","guard":[["has","lsm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline LSM Airlines from":"LSM Airlines is an airline of Russia."}}},
{"id":"n-4eb393db","guard":[["hasAny",["cargo","flyhy"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Flyhy Cargo Airlines from":"Flyhy Cargo Airlines is an airline of Thailand."}}},
{"id":"n-4f89624c","guard":[["has","avient"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Avient Aviation":"Avient Aviation is an airline of Zimbabwe."}}},
{"id":"n-55cf6603","guard":[["has","finncomm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Finncomm Airlines from":"Finncomm Airlines is an airline of Finland."}}},
{"id":"n-6106cea2","guard":[["has","atlas"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Atlas Air based":"Atlas Air is an airline of United States."}}},
{"id":"n-662b8447","guard":[["has","ivoire"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Air Ivoire based":"Air Ivoire is an airline of Ivory Coast."}}},
{"id":"n-6665c3de","guard":[["has","transat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Air Transat":"Air Transat is an airline of Canada."}}},
{"id":"n-693676a6","guard":[["hasAny",["alrosa","enterprise","mirny"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Alrosa Mirny Air Enterprise":"Alrosa Mirny Air Enterprise is an airline of Russia."}}},
{"id":"n-69894572","guard":[["has","olympic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Olympic Airlines based":"Olympic Airlines is an airline of Greece."}}},
{"id":"n-6a261809","guard":[["has","baltic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Baltic Airlines based":"Baltic Airlines is an airline of Russia."}}},
{"id":"n-73a0c299","guard":[["has","sharp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Sharp Airlines based":"Sharp Airlines is an airline of Australia."}}},
{"id":"n-7520e097","guard":[["hasAny",["force","turkish"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Turkish Air Force from":"Turkish Air Force is an airline of Turkey."}}},
{"id":"n-7767bdb3","guard":[["has","happy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Happy Air from":"Happy Air is an airline of Thailand."}}},
{"id":"n-7a79eff3","guard":[["has","bmi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of bmi":"bmi is an airline of United Kingdom."}}},
{"id":"n-7b5520a0","guard":[["has","nationwide"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Nationwide Airlines based":"Nationwide Airlines is an airline of South Africa."}}},
{"id":"n-7e70d9ab","guard":[["has","shandong"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Shandong Airlines based":"Shandong Airlines is an airline of China."}}},
{"id":"n-88d550fd","guard":[["has","orbest"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Orbest from":"Orbest is an airline of Portugal."}}},
{"id":"n-8bebed5b","guard":[["hasAny",["air","airline","based","co","korea","ltd"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Air Korea Co. Ltd. based":"Air Korea Co. Ltd. is an airline of Republic of Korea."}}},
{"id":"n-8e77b28d","guard":[["hasAny",["aeronautica","airline","country","militare"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Aeronautica Militare from":"Aeronautica Militare is an airline of Italy."}}},
{"id":"n-90eb420c","guard":[["has","macau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Air Macau":"Air Macau is an airline of Macao."}}},
{"id":"n-92500a4e","guard":[["has","aeroméxico"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline AeroMéxico from":"AeroMéxico is an airline of Mexico."}}},
{"id":"n-98413a53","guard":[["has","whitejets"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Whitejets":"Whitejets is an airline of Brazil."}}},
{"id":"n-9e78f436","guard":[["has","hexair"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Hex'Air from":"Hex'Air is an airline of France."}}},
{"id":"n-a0f2c9f5","guard":[["has","tuifly"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline TUIfly based":"TUIfly is an airline of Germany."}}},
{"id":"n-a38b7e48","guard":[["has","jalways"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline JALways based":"JALways is an airline of Japan."}}},
{"id":"n-ab50379d","guard":[["has","spicejet"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Spicejet":"Spicejet is an airline of India."}}},
{"id":"n-afbc766e","guard":[["hasAny",["airline","based","flugfelag","vestmannaeyja"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Flugfelag Vestmannaeyja based":"Flugfelag Vestmannaeyja is an airline of Iceland."}}},
{"id":"n-b5f1b41b","guard":[["has","cayman"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Cayman Airways based":"Cayman Airways is an airline of Cayman Islands."}}},
{"id":"n-ba1f36d0","guard":[["has","png"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Airlines PNG from":"Airlines PNG is an airline of Papua New Guinea."}}},
{"id":"n-bb670745","guard":[["has","pobeda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Pobeda from":"Pobeda is an airline of Russia."}}},
{"id":"n-bca984b6","guard":[["has","porter"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Porter Airlines":"Porter Airlines is an airline of Canada."}}},
{"id":"n-c0130b5c","guard":[["has","lituanica"],["has","where"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Air Lituanica based":"Air Lituanica is an airline of Lithuania."}}},
{"id":"n-c19ffafd","guard":[["has","flybaboo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Flybaboo based":"Flybaboo is an airline of Switzerland."}}},
{"id":"n-c5584b74","guard":[["hasAny",["chater","sochi"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline SOCHI AIR CHATER based":"SOCHI AIR CHATER is an airline of Russia."}}},
{"id":"n-c5fe983c","guard":[["hasAny",["island","wp"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Island Air (WP)":"Island Air (WP) is an airline of United States."}}},
{"id":"n-c6ea63ed","guard":[["has","blue"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Blue Wings":"Blue Wings is an airline of Germany."}}},
{"id":"n-c93699fe","guard":[["hasAny",["hong","kong"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Hong Kong Airlines":"Hong Kong Airlines is an airline of Hong Kong SAR of China."}}},
{"id":"n-cb7b8282","guard":[["hasAny",["elburaq","transport"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline El-Buraq Air Transport based":"El-Buraq Air Transport is an airline of Libya."}}},
{"id":"n-cc989fdb","guard":[["has","ocean"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of OCEAN AIR CARGO":"OCEAN AIR CARGO is an airline of India."}}},
{"id":"n-cf1bf41b","guard":[["hasAny",["cambodge","royal"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Royal Air Cambodge based":"Royal Air Cambodge is an airline of Cambodia."}}},
{"id":"n-d64b2065","guard":[["has","yuzhmashavia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Yuzhmashavia based":"Yuzhmashavia is an airline of Ukraine."}}},
{"id":"n-d84a50d7","guard":[["hasAny",["airways","bingo"]],["has","home"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Bingo Airways":"Bingo Airways is an airline of Poland."}}},
{"id":"n-d8e50c22","guard":[["has","europesky"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline EuropeSky based":"EuropeSky is an airline of Germany."}}},
{"id":"n-d9d557c2","guard":[["has","united"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline United Airlines from":"United Airlines is an airline of United States."}}},
{"id":"n-dac76f5a","guard":[["has","bmibaby"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of bmibaby":"bmibaby is an airline of United Kingdom."}}},
{"id":"n-dacc5c85","guard":[["has","southjet"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Southjet cargo":"Southjet cargo is an airline of United States."}}},
{"id":"n-db947181","guard":[["has","vladivostok"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Vladivostok Air from":"Vladivostok Air is an airline of Russia."}}},
{"id":"n-dbba9d7f","guard":[["has","tianjin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Tianjin Airlines":"Tianjin Airlines is an airline of China."}}},
{"id":"n-dd6e335b","guard":[["has","midwest"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Midwest Airlines based":"Midwest Airlines is an airline of United States."}}},
{"id":"n-e05d1970","guard":[["has","kuban"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Kuban Airlines from":"Kuban Airlines is an airline of Russia."}}},
{"id":"n-e1775d07","guard":[["hasAny",["hageland","services"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Hageland Aviation Services":"Hageland Aviation Services is an airline of United States."}}},
{"id":"n-ef5feeba","guard":[["has","conviasa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Conviasa from":"Conviasa is an airline of Venezuela."}}},
{"id":"n-fa145762","guard":[["hasAny",["airline","aviation","based","division","saratov"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"where is the airline Saratov Aviation Division based":"Saratov Aviation Division is an airline of Russia."}}},
{"id":"n-fb9a530e","guard":[["has","uni"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country is the airline Uni Air from":"Uni Air is an airline of Taiwan."}}},
{"id":"n-fe3c034d","guard":[["has","zabaykalskii"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the home country of Zabaykalskii Airlines":"Zabaykalskii Airlines is an airline of Russia."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"where is the airline Air Lituanica based","expect":{"contains":["Lithuania"],"notRefusal":true}},{"q":"name the home country of OCEAN AIR CARGO","expect":{"contains":["India"],"notRefusal":true}},{"q":"which country is the airline Kosmos from","expect":{"contains":["Russia"],"notRefusal":true}},{"q":"name the home country of Spicejet","expect":{"contains":["India"],"notRefusal":true}},{"q":"name the home country of Tianjin Airlines","expect":{"contains":["China"],"notRefusal":true}},{"q":"which country is the airline Air Explore from","expect":{"contains":["Slovakia"],"notRefusal":true}},{"q":"which country is the airline LSM Airlines from","expect":{"contains":["Russia"],"notRefusal":true}},{"q":"which country is the airline Orbest from","expect":{"contains":["Portugal"],"notRefusal":true}},{"q":"which country is the airline Aero Contractors from","expect":{"contains":["Nigeria"],"notRefusal":true}},{"q":"where is the airline Liberty Airways based","expect":{"contains":["United States"],"notRefusal":true}},{"q":"which country is the airline Aeronautica Militare from","expect":{"contains":["Italy"],"notRefusal":true}},{"q":"which country is the airline Skywest Airlines from","expect":{"contains":["Australia"],"notRefusal":true}},{"q":"where is the airline Yuzhmashavia based","expect":{"contains":["Ukraine"],"notRefusal":true}},{"q":"name the home country of Alrosa Mirny Air Enterprise","expect":{"contains":["Russia"],"notRefusal":true}},{"q":"which country is the airline Pobeda from","expect":{"contains":["Russia"],"notRefusal":true}},{"q":"which country is the airline Hex'Air from","expect":{"contains":["France"],"notRefusal":true}},{"q":"which country is the airline NEXT Brasil from","expect":{"contains":["Brazil"],"notRefusal":true}},{"q":"name the home country of bmi","expect":{"contains":["United Kingdom"],"notRefusal":true}},{"q":"where is the airline EuropeSky based","expect":{"contains":["Germany"],"notRefusal":true}},{"q":"name the home country of Avient Aviation","expect":{"contains":["Zimbabwe"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
