// airline-icao-name-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"airline-icao-name-neo-g10","class":"airline-icao-name","generation":10,"lane":"neo","grownFrom":["name the airline with the code AIA","name the airline with the code HBR","name the airline with the code AXL","name the airline with the code ONE","name the airline with the code RLA","what airline is SSV","which airline has the ICAO code HCW","what airline is ANT","what airline is NDC","name the airline with the code SLC","what airline is AMU","what airline is FAB","what airline is IKA","name the airline with the code KND","which airline has the ICAO code GFY","what airline is TIL","which airline has the ICAO code SOL","which airline has the ICAO code RYA","which airline has the ICAO code UAL","which airline has the ICAO code AES"],"version":1});

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
{"id":"n-18a83fd4","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-75e636f1","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.code",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-00aee8d1","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-1f011ab7","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.code",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-2e9c9331","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.code",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-2fcd2cb1","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-5bf217ab","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-9cb1b81a","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-b620191b","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.code",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-c1ddfe5b","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.code",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-957a0a0b","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.code",["transform.swapCase",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-f4bd9f18","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.str",["transform.swapCase",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-4c67f320","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["render.and",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-797ccd15","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-1372cdae","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-553267f4","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-692b74e8","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-7d90c954","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-88b9bb3f","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-5224c302","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["transform.pascal",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-532f4053","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["transform.camel",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-b76b683f","guard":[["has","airline"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code AIA":"The code AIA is Avies.","name the airline with the code HBR":"The code HBR is Hebradran Air Services.","name the airline with the code AXL":"The code AXL is Air Exel.","name the airline with the code ONE":"The code ONE is Oceanair.","name the airline with the code RLA":"The code RLA is Airlinair.","what airline is SSV":"The code SSV is Skyservice Airlines.","which airline has the ICAO code HCW":"The code HCW is Star1 Airlines.","what airline is ANT":"The code ANT is Air North Charter - Canada.","what airline is NDC":"The code NDC is FlyNordic.","name the airline with the code SLC":"The code SLC is Salsa d\\\\'Haiti.","what airline is AMU":"The code AMU is Air Macau.","what airline is FAB":"The code FAB is First Air.","what airline is IKA":"The code IKA is Itek Air.","name the airline with the code KND":"The code KND is Kan Air.","which airline has the ICAO code GFY":"The code GFY is Greenfly.","what airline is TIL":"The code TIL is Tajikistan International Airlines.","which airline has the ICAO code SOL":"The code SOL is Solomon Airlines.","which airline has the ICAO code RYA":"The code RYA is Ryan Air Services.","which airline has the ICAO code UAL":"The code UAL is United Airlines.","which airline has the ICAO code AES":"The code AES is ACES Colombia.","what airline is BWA":"The code BWA is Caribbean Airlines.","which airline has the ICAO code BZE":"The code BZE is BRAZIL AIR.","what airline is FTA":"The code FTA is Frontier Flying Service.","what airline is JEF":"The code JEF is Jetflite.","which airline has the ICAO code HCC":"The code HCC is Holidays Czech Airlines.","which airline has the ICAO code BRG":"The code BRG is Bering Air.","which airline has the ICAO code PQW":"The code PQW is PanAm World Airways.","which airline has the ICAO code KKK":"The code KKK is Atlasjet.","name the airline with the code MAH":"The code MAH is Malév.","name the airline with the code JOR":"The code JOR is Blue Air.","name the airline with the code THT":"The code THT is Air Tahiti Nui.","what airline is VRN":"The code VRN is VRG Linhas Aereas.","what airline is HAM":"The code HAM is Haiti Ambassador Airlines.","which airline has the ICAO code UDN":"The code UDN is Dniproavia.","which airline has the ICAO code MNA":"The code MNA is Merpati Nusantara Airlines.","what airline is NJS":"The code NJS is National Jet Systems.","name the airline with the code GFT":"The code GFT is Gulfstream International Airlines.","which airline has the ICAO code HMR":"The code HMR is North American Charters.","name the airline with the code CEB":"The code CEB is Cebu Pacific.","name the airline with the code OOM":"The code OOM is Zoom Airlines.","which airline has the ICAO code DOA":"The code DOA is Dominicana de Aviaci.","which airline has the ICAO code ZXY":"The code ZXY is Japan Regio.","which airline has the ICAO code SHA":"The code SHA is Sharp Airlines.","name the airline with the code RAM":"The code RAM is Royal Air Maroc.","name the airline with the code AXB":"The code AXB is Air India Express.","what airline is SAY":"The code SAY is ScotAirways.","name the airline with the code PIA":"The code PIA is Pakistan International Airlines.","name the airline with the code MLD":"The code MLD is Air Moldova.","name the airline with the code ARG":"The code ARG is Aerolineas Argentinas.","name the airline with the code GER":"The code GER is German International Air Lines.","which airline has the ICAO code MDO":"The code MDO is Domenican Airlines.","what airline is SXR":"The code SXR is Sky Express.","what airline is KSM":"The code KSM is Kosmos.","which airline has the ICAO code ZNA":"The code ZNA is Zenith International Airline.","which airline has the ICAO code MXI":"The code MXI is MexicanaLink.","what airline is AUI":"The code AUI is Ukraine International Airlines.","which airline has the ICAO code XSR":"The code XSR is Executive AirShare.","what airline is LNI":"The code LNI is Lion Mentari Airlines.","which airline has the ICAO code BLF":"The code BLF is Blue1.","which airline has the ICAO code THK":"The code THK is Turk Hava Kurumu Hava Taksi Isletmesi.","what airline is ABQ":"The code ABQ is Airblue.","name the airline with the code BER":"The code BER is Air Berlin.","name the airline with the code TRA":"The code TRA is Transavia Holland.","what airline is LMM":"The code LMM is LCM AIRLINES.","which airline has the ICAO code SQC":"The code SQC is Singapore Airlines Cargo.","what airline is PEL":"The code PEL is Aeropelican Air Services.","which airline has the ICAO code WON":"The code WON is Wings Air.","name the airline with the code VGN":"The code VGN is Virgin Nigeria Airways.","name the airline with the code ELA":"The code ELA is Eastland Air.","name the airline with the code LXP":"The code LXP is LAN Express.","name the airline with the code PFL":"The code PFL is Pacific Flier.","what airline is IAW":"The code IAW is Iraqi Airways.","name the airline with the code VVC":"The code VVC is VivaColombia.","which airline has the ICAO code SXS":"The code SXS is SunExpress.","which airline has the ICAO code KRY":"The code KRY is Russkie Krylya.","what airline is BVT":"The code BVT is Berjaya Air.","what airline is SGG":"The code SGG is Senegal Airlines.","name the airline with the code OTG":"The code OTG is One Two Go Airlines.","what airline is FLG":"The code FLG is Pinnacle Airlines.","what airline is AWE":"The code AWE is America West Airlines.","what airline is CUB":"The code CUB is Cubana de Aviación.","name the airline with the code PTI":"The code PTI is Privatair.","what airline is MPH":"The code MPH is Martinair.","which airline has the ICAO code EAL":"The code EAL is European Air Express.","what airline is FZA":"The code FZA is Fuzhou Airlines.","name the airline with the code MIC":"The code MIC is Mint Airways.","name the airline with the code ESK":"The code ESK is SkyEurope.","which airline has the ICAO code JBA":"The code JBA is Helijet.","which airline has the ICAO code BTQ":"The code BTQ is Boutique Air (Priv).","which airline has the ICAO code JKK":"The code JKK is Spanair.","which airline has the ICAO code AKL":"The code AKL is Air Kiribati.","name the airline with the code LBC":"The code LBC is Albanian Airlines.","what airline is XAU":"The code XAU is XAIR USA.","what airline is MWA":"The code MWA is Midwest Airlines (Egypt).","name the airline with the code THI":"The code THI is TransHolding.","what airline is BCC":"The code BCC is BusinessAir.","which airline has the ICAO code TNS":"The code TNS is Transilvania.","name the airline with the code OBS":"The code OBS is Orbest.","which airline has the ICAO code OAE":"The code OAE is Omni Air International.","what airline is BTA":"The code BTA is ExpressJet."}}},
{"id":"n-6845f51b","guard":[["has","airline"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"airline"}]]],"mem":{"table":{"with the code AIA":"The code AIA is Avies.","with the code HBR":"The code HBR is Hebradran Air Services.","with the code AXL":"The code AXL is Air Exel.","with the code ONE":"The code ONE is Oceanair.","with the code RLA":"The code RLA is Airlinair.","is SSV":"The code SSV is Skyservice Airlines.","has the ICAO code HCW":"The code HCW is Star1 Airlines.","is ANT":"The code ANT is Air North Charter - Canada.","is NDC":"The code NDC is FlyNordic.","with the code SLC":"The code SLC is Salsa d\\\\'Haiti.","is AMU":"The code AMU is Air Macau.","is FAB":"The code FAB is First Air.","is IKA":"The code IKA is Itek Air.","with the code KND":"The code KND is Kan Air.","has the ICAO code GFY":"The code GFY is Greenfly.","is TIL":"The code TIL is Tajikistan International Airlines.","has the ICAO code SOL":"The code SOL is Solomon Airlines.","has the ICAO code RYA":"The code RYA is Ryan Air Services.","has the ICAO code UAL":"The code UAL is United Airlines.","has the ICAO code AES":"The code AES is ACES Colombia.","is BWA":"The code BWA is Caribbean Airlines.","has the ICAO code BZE":"The code BZE is BRAZIL AIR.","is FTA":"The code FTA is Frontier Flying Service.","is JEF":"The code JEF is Jetflite.","has the ICAO code HCC":"The code HCC is Holidays Czech Airlines.","has the ICAO code BRG":"The code BRG is Bering Air.","has the ICAO code PQW":"The code PQW is PanAm World Airways.","has the ICAO code KKK":"The code KKK is Atlasjet.","with the code MAH":"The code MAH is Malév.","with the code JOR":"The code JOR is Blue Air.","with the code THT":"The code THT is Air Tahiti Nui.","is VRN":"The code VRN is VRG Linhas Aereas.","is HAM":"The code HAM is Haiti Ambassador Airlines.","has the ICAO code UDN":"The code UDN is Dniproavia.","has the ICAO code MNA":"The code MNA is Merpati Nusantara Airlines.","is NJS":"The code NJS is National Jet Systems.","with the code GFT":"The code GFT is Gulfstream International Airlines.","has the ICAO code HMR":"The code HMR is North American Charters.","with the code CEB":"The code CEB is Cebu Pacific.","with the code OOM":"The code OOM is Zoom Airlines.","has the ICAO code DOA":"The code DOA is Dominicana de Aviaci.","has the ICAO code ZXY":"The code ZXY is Japan Regio.","has the ICAO code SHA":"The code SHA is Sharp Airlines.","with the code RAM":"The code RAM is Royal Air Maroc.","with the code AXB":"The code AXB is Air India Express.","is SAY":"The code SAY is ScotAirways.","with the code PIA":"The code PIA is Pakistan International Airlines.","with the code MLD":"The code MLD is Air Moldova.","with the code ARG":"The code ARG is Aerolineas Argentinas.","with the code GER":"The code GER is German International Air Lines.","has the ICAO code MDO":"The code MDO is Domenican Airlines.","is SXR":"The code SXR is Sky Express.","is KSM":"The code KSM is Kosmos.","has the ICAO code ZNA":"The code ZNA is Zenith International Airline.","has the ICAO code MXI":"The code MXI is MexicanaLink.","is AUI":"The code AUI is Ukraine International Airlines.","has the ICAO code XSR":"The code XSR is Executive AirShare.","is LNI":"The code LNI is Lion Mentari Airlines.","has the ICAO code BLF":"The code BLF is Blue1.","has the ICAO code THK":"The code THK is Turk Hava Kurumu Hava Taksi Isletmesi.","is ABQ":"The code ABQ is Airblue.","with the code BER":"The code BER is Air Berlin.","with the code TRA":"The code TRA is Transavia Holland.","is LMM":"The code LMM is LCM AIRLINES.","has the ICAO code SQC":"The code SQC is Singapore Airlines Cargo.","is PEL":"The code PEL is Aeropelican Air Services.","has the ICAO code WON":"The code WON is Wings Air.","with the code VGN":"The code VGN is Virgin Nigeria Airways.","with the code ELA":"The code ELA is Eastland Air.","with the code LXP":"The code LXP is LAN Express.","with the code PFL":"The code PFL is Pacific Flier.","is IAW":"The code IAW is Iraqi Airways.","with the code VVC":"The code VVC is VivaColombia.","has the ICAO code SXS":"The code SXS is SunExpress.","has the ICAO code KRY":"The code KRY is Russkie Krylya.","is BVT":"The code BVT is Berjaya Air.","is SGG":"The code SGG is Senegal Airlines.","with the code OTG":"The code OTG is One Two Go Airlines.","is FLG":"The code FLG is Pinnacle Airlines.","is AWE":"The code AWE is America West Airlines.","is CUB":"The code CUB is Cubana de Aviación.","with the code PTI":"The code PTI is Privatair.","is MPH":"The code MPH is Martinair.","has the ICAO code EAL":"The code EAL is European Air Express.","is FZA":"The code FZA is Fuzhou Airlines.","with the code MIC":"The code MIC is Mint Airways.","with the code ESK":"The code ESK is SkyEurope.","has the ICAO code JBA":"The code JBA is Helijet.","has the ICAO code BTQ":"The code BTQ is Boutique Air (Priv).","has the ICAO code JKK":"The code JKK is Spanair.","has the ICAO code AKL":"The code AKL is Air Kiribati.","with the code LBC":"The code LBC is Albanian Airlines.","is XAU":"The code XAU is XAIR USA.","is MWA":"The code MWA is Midwest Airlines (Egypt).","with the code THI":"The code THI is TransHolding.","is BCC":"The code BCC is BusinessAir.","has the ICAO code TNS":"The code TNS is Transilvania.","with the code OBS":"The code OBS is Orbest.","has the ICAO code OAE":"The code OAE is Omni Air International.","is BTA":"The code BTA is ExpressJet."}}},
{"id":"n-02f79e23","guard":[["hasAny",["abq","amu","ant","aui","awe","bcc","bta","bvt","bwa","code","cub","delete","fab","flg","fta","fza","ham","iaw","ika","item number","jef","ksm","lmm","lni","mph","mwa","ndc","njs","nth","pel","position","say","sgg","ssv","strip out","sxr","vrn","xau"]],["has","airline"],["words<=",7],["not",["has","air"]],["nums==",0]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-08142822","guard":[["hasAny",["abq","amu","ant","aui","awe","bcc","bta","bvt","bwa","code","cub","delete","fab","flg","fta","fza","ham","iaw","ika","item number","jef","ksm","lmm","lni","mph","mwa","ndc","njs","nth","pel","position","say","sgg","ssv","strip out","sxr","vrn","xau"]],["has","airline"],["words<=",7],["not",["has","air"]],["nums==",0]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-11d42cbf","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","til","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-2ff2bd51","guard":[["hasAny",["abq","amu","ant","aui","awe","bcc","bta","bvt","bwa","code","cub","fab","flg","fta","fza","ham","iaw","ika","item number","jef","ksm","lmm","lni","mph","mwa","ndc","njs","nth","pel","position","say","separate by","sgg","split","split by","ssv","sxr","vrn","xau"]],["has","airline"],["words<=",7],["not",["has","air"]],["nums==",0]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-32cfce52","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","til","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-8ad149e0","guard":[["hasAny",["abq","amu","ant","aui","awe","bcc","bta","bvt","bwa","code","cub","fab","flg","fta","fza","ham","iaw","ika","item number","jef","ksm","lmm","lni","mph","mwa","ndc","njs","nth","pel","position","say","separate by","sgg","split","split by","ssv","sxr","vrn","xau"]],["has","airline"],["words<=",7],["not",["has","air"]],["nums==",0]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-d9ff4b35","guard":[["hasAny",["abq","amu","ant","aui","awe","bcc","bta","bvt","bwa","code","cub","fab","flg","fta","fza","ham","iaw","ika","item number","jef","ksm","lmm","lni","mph","mwa","ndc","njs","nth","pel","position","say","separate by","sgg","split","split by","ssv","sxr","vrn","xau"]],["has","airline"],["words<=",7],["not",["has","air"]],["nums==",0]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-f504952d","guard":[["not",["hasAny",["2","aar","aby","accountingauditing","act","add","adult","ai","air","airlines","airport","album","alexandremas","alias","alive","alpha","alpha2","alpha3","among","anu","artist","asd","aub","author","base","based","bbg","bfcom","breed","bạch","cal","captions","category","cave","cfe","cgac","character","cheese","city","clean","climbing","co2growthabs","co2includinglucgrowthabs","combined","company","compare","coonhounds","count","country","court","co₂","cryptocurrency","cs","currency","cva","date","deity","dem","description","director","dish","doing","domain","economy","emoji","encouraging","english","essay","etd","etf","exchange","expectancy","extension","featuring","fft","french","fwl","gafar","gca","gender","george","gla","goats","goong","gow","gray","harbor","hex","home","iata","id","iso","iso2","jai","judge1","kcu","khánh","kip","kis","lai","lam","lan","lang","language","level","lmu","loc","location","long","län","make","mal","manufacturer","mauna","mnp","model","monkhmer","mount","myp","n","n3","namsor","nationality","nickname","nlh","nma","number","of","onefourth","opendate","ozj","peoples","per","perform","pisin","pmtb","program","province","publication","published","rahr","rank","rating","rea","region","rjd","rsh","rtojavascripttranspilation","scene","sco","sector","security","sen","series","session","short","shortcode","shortname","sku","sky","slug","song","sort","speaker","sponsoring","state","strcity","streetaddr","subcategory","subregion","subtype","sucountry","sum","suname","sutype","syl","symbol","table","tags","text2datacom","threeletter","ticker","til","time","title","titles","tnu","track","trades","tribes","tui","type","under","url","version","week","writers","wvl","y","year","you","zcs"]]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-4671f01b","guard":[["hasAny",["abq","aes","aia","akl","amu","arg","aui","awe","axb","axl","bcc","ber","blf","brg","bta","bvt","bwa","bze","ceb","cub","doa","ela","esk","fab","flg","fta","fza","ger","gft","gfy","ham","hbr","hcc","hcw","iaw","ika","item number","jef","jkk","jor","kkk","knd","kry","ksm","lbc","lmm","lni","lxp","mah","mdo","mic","mld","mna","mph","mxi","ndc","njs","normalise","normalize","nth","oae","obs","one","oom","otg","pel","pfl","pia","position","pqw","pti","ram","rla","rya","say","sgg","sha","simplify the text","sol","sqc","ssv","sxr","sxs","thi","thk","tht","til","tns","tra","ual","udn","vgn","vrn","vvc","won","xau","xsr","zna","zxy"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":1}]],"mem":null},
{"id":"n-6c0724ea","guard":[["hasAny",["abq","aes","aia","akl","amu","arg","aui","awe","axb","axl","bcc","ber","blf","brg","bta","bvt","bwa","bze","ceb","cub","doa","ela","esk","fab","flg","fta","fza","ger","gft","gfy","ham","hbr","hcc","hcw","iaw","ika","item number","jef","jkk","jor","kkk","knd","kry","ksm","lbc","lmm","lni","lxp","mah","mdo","mic","mld","mna","mph","mxi","ndc","njs","normalise","normalize","nth","oae","obs","one","oom","otg","pel","pfl","pia","position","pqw","pti","ram","rla","rya","say","sgg","sha","simplify the text","sol","sqc","ssv","sxr","sxs","thi","thk","tht","til","tns","tra","ual","udn","vgn","vrn","vvc","won","xau","xsr","zna","zxy"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":1}]],"mem":null},
{"id":"n-999d1e27","guard":[["hasAny",["abq","aes","akl","amu","ant","arg","aui","awe","axb","axl","bcc","ber","brg","bta","btq","bvt","bwa","bze","ceb","cub","doa","ela","esk","fab","flg","fta","fza","ger","gft","gfy","ham","hbr","hcc","hcw","iaw","ika","item number","jef","jkk","jor","kkk","knd","kry","ksm","lbc","leading zeros","lmm","lni","lxp","mdo","mic","mld","mna","mph","mwa","mxi","ndc","njs","nth","oae","one","oom","otg","pad with","padded to","pel","pfl","pia","position","pqw","pti","ram","rla","rya","say","sgg","sha","slc","sol","sqc","ssv","sxr","sxs","thi","thk","tht","til","tns","tra","ual","udn","vgn","vrn","vvc","won","xau","xsr","zero pad","zna","zxy"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-b1fbd06b","guard":[["hasAny",["abq","aes","akl","amu","ant","arg","aui","awe","axb","axl","bcc","ber","brg","bta","btq","bvt","bwa","bze","ceb","cub","doa","ela","esk","fab","flg","fta","fza","ger","gft","gfy","ham","hbr","hcc","hcw","iaw","ika","item number","jef","jkk","jor","kkk","knd","kry","ksm","lbc","leading zeros","lmm","lni","lxp","mdo","mic","mld","mna","mph","mwa","mxi","ndc","njs","nth","oae","one","oom","otg","pad with","padded to","pel","pfl","pia","position","pqw","pti","ram","rla","rya","say","sgg","sha","slc","sol","sqc","ssv","sxr","sxs","thi","thk","tht","til","tns","tra","ual","udn","vgn","vrn","vvc","won","xau","xsr","zero pad","zna","zxy"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-4d674efa","guard":[["hasAny",["abq","aes","akl","amu","ant","arg","aui","awe","axb","axl","bcc","ber","brg","bta","btq","bvt","bwa","bze","ceb","cub","doa","ela","esk","fab","flg","fta","fza","ger","gft","gfy","ham","hbr","hcc","hcw","iaw","ika","item number","jef","jkk","jor","kkk","knd","kry","ksm","lbc","leading zeros","lmm","lni","lxp","mdo","mic","mld","mna","mph","mwa","mxi","ndc","njs","nth","oae","one","oom","otg","pad with","padded to","pel","pfl","pia","position","pqw","pti","ram","rla","rya","say","sgg","sha","slc","sol","sqc","ssv","sxr","sxs","thi","thk","tht","til","tns","tra","ual","udn","vgn","vrn","vvc","won","xau","xsr","zero pad","zna","zxy"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]]],"mem":null},
{"id":"n-b3941da8","guard":[["hasAny",["abq","aes","akl","amu","ant","arg","aui","awe","axb","axl","bcc","ber","brg","bta","btq","bvt","bwa","bze","ceb","cub","doa","ela","esk","fab","flg","fta","fza","ger","gft","gfy","ham","hbr","hcc","hcw","iaw","ika","item number","jef","jkk","jor","kkk","knd","kry","ksm","lbc","leading zeros","lmm","lni","lxp","mdo","mic","mld","mna","mph","mwa","mxi","ndc","njs","nth","oae","one","oom","otg","pad with","padded to","pel","pfl","pia","position","pqw","pti","ram","rla","rya","say","sgg","sha","slc","sol","sqc","ssv","sxr","sxs","thi","thk","tht","til","tns","tra","ual","udn","vgn","vrn","vvc","won","xau","xsr","zero pad","zna","zxy"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]]],"mem":null},
{"id":"n-88fbe258","guard":[["hasAny",["abq","aes","aia","akl","amu","ant","arg","aui","awe","axb","axl","bcc","ber","blf","brg","bta","btq","bvt","bwa","bze","ceb","cub","delete","doa","ela","esk","fab","flg","fta","fza","ger","gft","gfy","ham","hbr","hcc","hcw","iaw","ika","item number","jef","jor","kkk","knd","kry","ksm","lbc","lmm","lni","lxp","mah","mdo","mic","mld","mna","mwa","mxi","ndc","njs","nth","oae","obs","oom","otg","pel","pfl","pia","position","pqw","ram","rya","say","sgg","sha","slc","sol","sqc","ssv","strip out","sxr","sxs","thi","thk","tht","til","tns","tra","ual","udn","vgn","vrn","vvc","won","xau","xsr","zna","zxy"]],["has","airline"],["nums==",0]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":"air"}]],"mem":null},
{"id":"n-d40dc401","guard":[["hasAny",["abq","aes","aia","akl","amu","ant","arg","aui","awe","axb","axl","bcc","ber","blf","brg","bta","btq","bvt","bwa","bze","ceb","cub","delete","doa","ela","esk","fab","flg","fta","fza","ger","gft","gfy","ham","hbr","hcc","hcw","iaw","ika","item number","jef","jor","kkk","knd","kry","ksm","lbc","lmm","lni","lxp","mah","mdo","mic","mld","mna","mwa","mxi","ndc","njs","nth","oae","obs","oom","otg","pel","pfl","pia","position","pqw","ram","rya","say","sgg","sha","slc","sol","sqc","ssv","strip out","sxr","sxs","thi","thk","tht","til","tns","tra","ual","udn","vgn","vrn","vvc","won","xau","xsr","zna","zxy"]],["has","airline"],["nums==",0]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":"air"}]],"mem":null},
{"id":"n-35c9ea52","guard":[["hasAny",["abq","aia","amu","awe","axl","bcc","ber","blf","brg","bta","btq","bvt","bwa","bze","ceb","delete","doa","ela","esk","fab","flg","fta","fza","ger","gft","gfy","hbr","hcc","hcw","ika","item number","jef","jkk","jor","kkk","knd","kry","ksm","lmm","lni","lxp","mah","mdo","mic","mna","mph","mxi","ndc","njs","nth","oae","obs","one","oom","otg","pel","pfl","position","pqw","pti","ram","rla","rya","say","sha","sol","ssv","strip out","sxr","sxs","thi","thk","tht","tns","tra","ual","udn","vrn","won","xau","xsr","zna"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]]],"mem":null},
{"id":"n-49ed5082","guard":[["hasAny",["abq","aia","amu","awe","axl","bcc","ber","blf","brg","bta","btq","bvt","bwa","bze","ceb","doa","ela","esk","fab","flg","fta","fza","ger","gft","gfy","hbr","hcc","hcw","ika","item number","jef","jkk","jor","kkk","knd","kry","ksm","lmm","lni","lxp","mah","mdo","mic","mna","mph","mxi","ndc","njs","nth","oae","obs","one","oom","otg","pel","pfl","position","pqw","pti","ram","rla","rya","say","separate by","sha","sol","split","split by","ssv","sxr","sxs","thi","thk","tht","tns","tra","ual","udn","vrn","won","xau","xsr","zna"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]]],"mem":null},
{"id":"n-6e72b6c5","guard":[["hasAny",["abq","aia","amu","awe","axl","bcc","ber","blf","brg","bta","btq","bvt","bwa","bze","ceb","doa","ela","esk","fab","flg","fta","fza","ger","gft","gfy","hbr","hcc","hcw","ika","item number","jef","jkk","jor","kkk","knd","kry","ksm","lmm","lni","lxp","mah","mdo","mic","mna","mph","mxi","ndc","njs","nth","oae","obs","one","oom","otg","pel","pfl","position","pqw","pti","ram","rla","rya","say","separate by","sha","sol","split","split by","ssv","sxr","sxs","thi","thk","tht","tns","tra","ual","udn","vrn","won","xau","xsr","zna"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]]],"mem":null},
{"id":"n-93bc552e","guard":[["hasAny",["abq","aia","amu","awe","axl","bcc","ber","blf","brg","bta","btq","bvt","bwa","bze","ceb","delete","doa","ela","esk","fab","flg","fta","fza","ger","gft","gfy","hbr","hcc","hcw","ika","item number","jef","jkk","jor","kkk","knd","kry","ksm","lmm","lni","lxp","mah","mdo","mic","mna","mph","mxi","ndc","njs","nth","oae","obs","one","oom","otg","pel","pfl","position","pqw","pti","ram","rla","rya","say","sha","sol","ssv","strip out","sxr","sxs","thi","thk","tht","tns","tra","ual","udn","vrn","won","xau","xsr","zna"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]]],"mem":null},
{"id":"n-e3a5633c","guard":[["hasAny",["abq","aia","amu","awe","axl","bcc","ber","blf","brg","bta","btq","bvt","bwa","bze","ceb","doa","ela","esk","fab","flg","fta","fza","ger","gft","gfy","hbr","hcc","hcw","ika","item number","jef","jkk","jor","kkk","knd","kry","ksm","lmm","lni","lxp","mah","mdo","mic","mna","mph","mxi","ndc","njs","nth","oae","obs","one","oom","otg","pel","pfl","position","pqw","pti","ram","rla","rya","say","separate by","sha","sol","split","split by","ssv","sxr","sxs","thi","thk","tht","tns","tra","ual","udn","vrn","won","xau","xsr","zna"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"country"}]]],"mem":null},
{"id":"n-5f00ce51","guard":[["hasAny",["aes","akl","ant","arg","aui","awe","axb","bcc","ber","brg","bta","btq","bvt","bwa","bze","ceb","cub","doa","ela","flg","fta","fza","ger","gft","ham","hbr","hcc","hcw","iaw","item number","kry","lbc","leading zeros","lmm","lni","lxp","mdo","mic","mld","mna","mwa","mxi","njs","nth","oae","oom","otg","pad with","padded to","pel","pfl","pia","position","pqw","ram","rya","say","sgg","sha","slc","sol","sqc","ssv","sxr","sxs","thi","thk","tht","til","tns","tra","ual","udn","vgn","vrn","vvc","xsr","zero pad","zna","zxy"]],["has","airline"],["nums==",0]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-8364b907","guard":[["hasAny",["aes","akl","ant","arg","aui","awe","axb","bcc","ber","brg","bta","btq","bvt","bwa","bze","ceb","cub","doa","ela","flg","fta","fza","ger","gft","ham","hbr","hcc","hcw","iaw","item number","kry","lbc","leading zeros","lmm","lni","lxp","mdo","mic","mld","mna","mwa","mxi","njs","nth","oae","oom","otg","pad with","padded to","pel","pfl","pia","position","pqw","ram","rya","say","sgg","sha","slc","sol","sqc","ssv","sxr","sxs","thi","thk","tht","til","tns","tra","ual","udn","vgn","vrn","vvc","xsr","zero pad","zna","zxy"]],["has","airline"],["nums==",0]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-4712cf78","guard":[["hasAny",["aes","akl","ant","arg","aui","awe","axb","bcc","ber","brg","bta","btq","bvt","bwa","bze","ceb","cub","doa","ela","flg","fta","fza","ger","gft","ham","hbr","hcc","hcw","iaw","item number","kry","lbc","leading zeros","lmm","lni","lxp","mdo","mic","mld","mna","mwa","mxi","njs","nth","oae","oom","otg","pad with","padded to","pel","pfl","pia","position","pqw","ram","rya","say","sgg","sha","slc","sol","sqc","ssv","sxr","sxs","thi","thk","tht","til","tns","tra","ual","udn","vgn","vrn","vvc","xsr","zero pad","zna","zxy"]],["has","airline"],["nums==",0]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]]],"mem":null},
{"id":"n-5b78863e","guard":[["hasAny",["aes","akl","ant","arg","aui","awe","axb","bcc","ber","brg","bta","btq","bvt","bwa","bze","ceb","cub","doa","ela","flg","fta","fza","ger","gft","ham","hbr","hcc","hcw","iaw","item number","kry","lbc","leading zeros","lmm","lni","lxp","mdo","mic","mld","mna","mwa","mxi","njs","nth","oae","oom","otg","pad with","padded to","pel","pfl","pia","position","pqw","ram","rya","say","sgg","sha","slc","sol","sqc","ssv","sxr","sxs","thi","thk","tht","til","tns","tra","ual","udn","vgn","vrn","vvc","xsr","zero pad","zna","zxy"]],["has","airline"],["nums==",0]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]]],"mem":null},
{"id":"n-b20a32f5","guard":[["hasAny",["airline","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","of"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-d454e5c5","guard":[["hasAny",["airline","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","of"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-572a359f","guard":[["hasAny",["aes","akl","ant","arg","aui","awe","axb","btq","bwa","ceb","cub","doa","ela","flg","fta","fza","ger","gft","ham","hbr","hcc","hcw","iaw","item number","kry","lbc","leading zeros","lmm","lni","mdo","mic","mna","mwa","mxi","njs","nth","oae","oom","otg","pad with","padded to","pel","pfl","pia","position","pqw","ram","rya","sgg","sha","slc","sol","sqc","ssv","thi","thk","tht","til","tns","tra","ual","vgn","vrn","vvc","xsr","zero pad","zna"]],["has","airline"],["nums==",0]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-74acc521","guard":[["hasAny",["aes","akl","ant","arg","aui","awe","axb","btq","bwa","ceb","cub","doa","ela","flg","fta","fza","ger","gft","ham","hbr","hcc","hcw","iaw","item number","kry","lbc","leading zeros","lmm","lni","mdo","mic","mna","mwa","mxi","njs","nth","oae","oom","otg","pad with","padded to","pel","pfl","pia","position","pqw","ram","rya","sgg","sha","slc","sol","sqc","ssv","thi","thk","tht","til","tns","tra","ual","vgn","vrn","vvc","xsr","zero pad","zna"]],["has","airline"],["nums==",0]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-1a9fe69f","guard":[["hasAny",["aes","akl","ant","arg","aui","awe","axb","btq","bwa","ceb","cub","doa","ela","flg","fta","fza","ger","gft","ham","hbr","hcc","hcw","iaw","item number","kry","lbc","leading zeros","lmm","lni","mdo","mic","mna","mwa","mxi","njs","nth","oae","oom","otg","pad with","padded to","pel","pfl","pia","position","pqw","ram","rya","sgg","sha","slc","sol","sqc","ssv","thi","thk","tht","til","tns","tra","ual","vgn","vrn","vvc","xsr","zero pad","zna"]],["has","airline"],["nums==",0]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]]],"mem":null},
{"id":"n-eec10be4","guard":[["hasAny",["aes","akl","ant","arg","aui","awe","axb","btq","bwa","ceb","cub","doa","ela","flg","fta","fza","ger","gft","ham","hbr","hcc","hcw","iaw","item number","kry","lbc","leading zeros","lmm","lni","mdo","mic","mna","mwa","mxi","njs","nth","oae","oom","otg","pad with","padded to","pel","pfl","pia","position","pqw","ram","rya","sgg","sha","slc","sol","sqc","ssv","thi","thk","tht","til","tns","tra","ual","vgn","vrn","vvc","xsr","zero pad","zna"]],["has","airline"],["nums==",0]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]]],"mem":null},
{"id":"n-2d595c8b","guard":[["hasAny",["abq","aia","akl","amu","axl","bcc","ber","blf","brg","bta","bvt","bze","ceb","characters from","ela","esk","fab","gfy","ika","item number","jef","jkk","jor","kkk","knd","ksm","letters from to","lmm","lxp","mah","mic","mld","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","slice of the text","substring","sxr","sxs","thi","tns","udn","vvc","won","xau","zxy"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-de9ea7da","guard":[["hasAny",["abq","aia","akl","amu","axl","bcc","ber","blf","brg","bta","bvt","bze","ceb","characters from","ela","esk","fab","gfy","ika","item number","jef","jkk","jor","kkk","knd","ksm","letters from to","lmm","lxp","mah","mic","mld","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","slice of the text","substring","sxr","sxs","thi","tns","udn","vvc","won","xau","zxy"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-0c4336f2","guard":[["hasAny",["bcc","blf","brg","btq","bvt","flg","gft","gfy","hbr","hcc","hcw","hmr","item number","jkk","kkk","knd","kry","ksm","lbc","lmm","lxp","mld","mph","ndc","njs","no vowels","nth","pfl","position","pqw","remove vowels","sgg","slc","sqc","ssv","sxr","sxs","thk","tht","tns","vgn","vrn","vvc","without vowels","xsr","zxy"]],["not",["has","of"]],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["transform.noVowels",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-726ddec9","guard":[["hasAny",["abq","aes","aia","akl","amu","arg","axl","bcc","ber","blf","bta","ceb","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mld","mph","mxi","ndc","normalise","normalize","nth","obs","one","pel","position","pti","rla","say","simplify the text","sxs","thi","tns","udn","vvc","zxy"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":3}]],"mem":null},
{"id":"n-85342a77","guard":[["hasAny",["abq","aes","aia","akl","amu","arg","axl","bcc","ber","blf","bta","ceb","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mld","mph","mxi","ndc","normalise","normalize","nth","obs","one","pel","position","pti","rla","say","simplify the text","sxs","thi","tns","udn","vvc","zxy"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":3}]],"mem":null},
{"id":"n-b4bba17f","guard":[["hasAny",["element","has","item number","nth","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-047acb0b","guard":[["hasAny",["class name","element","has","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.pascal",["sense.after",{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-734e0f47","guard":[["hasAny",["camel case","camelcase","element","has","item number","lower camel case","nth","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.camel",["sense.after",{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-6b59a600","guard":[["hasAny",["has","item number","nth","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-8f05a43a","guard":[["hasAny",["each word","element","has","item number","nth","position","split into words","words"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-9095fa47","guard":[["hasAny",["has","item number","nth","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-1972877f","guard":[["hasAny",["has","item number","lower case","lowercase","nth","position","small letters"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-6c267e59","guard":[["hasAny",["has","invert case","item number","nth","position","swap case","toggle case"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-742f5f33","guard":[["hasAny",["capitalise","capitalize","capitalize each word","has","item number","nth","position","title case"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-ae3b8d8b","guard":[["hasAny",["all caps","capital letters","capitals","has","item number","nth","position","upper case","uppercase"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-b66ca4ad","guard":[["hasAny",["has","item number","nth","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-010eb4b3","guard":[["hasAny",["class name","has","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-4d270817","guard":[["hasAny",["camel case","camelcase","has","item number","lower camel case","nth","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.camel",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-126491e6","guard":[["hasAny",["abq","amu","ant","aui","awe","bcc","bta","bvt","bwa","cub","fab","flg","fta","fza","ham","iaw","ika","item number","jef","ksm","lmm","lni","mph","mwa","ndc","njs","nth","pel","position","say","sgg","shortest","shortest one","shortest word","ssv","sxr","til","vrn","xau"]],["has","airline"],["nums==",0],["not",["has","air"]],["words<=",7]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-22ad4646","guard":[["hasAny",["airline","delete","element","item number","nth","position","strip out","without"]],["words<=",4]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-5a1da737","guard":[["hasAny",["airline","delete","element","item number","nth","position","strip out","without"]],["words<=",4]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-7abe5458","guard":[["hasAny",["airline","element","item number","nth","position"]],["words<=",4]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"is"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-1830235c","guard":[["hasAny",["abq","amu","ant","aui","awe","bcc","bta","bvt","bwa","cub","fab","flg","fta","fza","ham","iaw","ika","item number","jef","ksm","lmm","lni","mph","mwa","ndc","njs","nth","pel","position","say","sgg","ssv","sxr","til","vrn","xau"]],["words<=",4]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-ca11eb65","guard":[["hasAny",["airline","camel case","camelcase","element","item number","lower camel case","nth","position"]],["words<=",4]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["transform.camel",["sense.after",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-2b19591d","guard":[["hasAny",["element","item number","name","nth","position"]],["has","airline"],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-239c53c9","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","name","nth","position"]],["has","airline"],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.camel",["sense.after",{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-a0b0d2cb","guard":[["hasAny",["item number","name","nth","position"]],["has","with"],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-fac61eeb","guard":[["hasAny",["class name","element","item number","name","nth","pascal case","pascalcase","position","upper camel case"]],["has","airline"],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.pascal",["sense.after",{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-24a9057d","guard":[["hasAny",["item number","name","nth","position"]],["has","with"],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-e9a8698f","guard":[["hasAny",["item number","name","nth","position"]],["has","with"],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-0e8bf14d","guard":[["hasAny",["invert case","item number","name","nth","position","swap case","toggle case"]],["has","with"],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-17265fe1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","name","nth","position","title case"]],["has","with"],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-9a60cd7b","guard":[["hasAny",["item number","lower case","lowercase","name","nth","position","small letters"]],["has","with"],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-c453a657","guard":[["hasAny",["item number","name","nth","position"]],["has","with"],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-de5d9cdf","guard":[["hasAny",["all caps","capital letters","capitals","item number","name","nth","position","upper case","uppercase"]],["has","with"],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-4154d321","guard":[["hasAny",["camel case","camelcase","item number","lower camel case","name","nth","position"]],["has","with"],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.camel",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-dde0262e","guard":[["hasAny",["class name","item number","name","nth","pascal case","pascalcase","position","upper camel case"]],["has","with"],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-e963ce4c","guard":[["has","airline"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"SSV":"The code SSV is Skyservice Airlines.","ANT":"The code ANT is Air North Charter - Canada.","NDC":"The code NDC is FlyNordic.","AMU":"The code AMU is Air Macau.","FAB":"The code FAB is First Air.","IKA":"The code IKA is Itek Air.","TIL":"The code TIL is Tajikistan International Airlines.","BWA":"The code BWA is Caribbean Airlines.","FTA":"The code FTA is Frontier Flying Service.","JEF":"The code JEF is Jetflite.","VRN":"The code VRN is VRG Linhas Aereas.","HAM":"The code HAM is Haiti Ambassador Airlines.","NJS":"The code NJS is National Jet Systems.","SAY":"The code SAY is ScotAirways.","SXR":"The code SXR is Sky Express.","KSM":"The code KSM is Kosmos.","AUI":"The code AUI is Ukraine International Airlines.","LNI":"The code LNI is Lion Mentari Airlines.","ABQ":"The code ABQ is Airblue.","LMM":"The code LMM is LCM AIRLINES.","PEL":"The code PEL is Aeropelican Air Services.","IAW":"The code IAW is Iraqi Airways.","BVT":"The code BVT is Berjaya Air.","SGG":"The code SGG is Senegal Airlines.","FLG":"The code FLG is Pinnacle Airlines.","AWE":"The code AWE is America West Airlines.","CUB":"The code CUB is Cubana de Aviación.","MPH":"The code MPH is Martinair.","FZA":"The code FZA is Fuzhou Airlines.","XAU":"The code XAU is XAIR USA.","MWA":"The code MWA is Midwest Airlines (Egypt).","BCC":"The code BCC is BusinessAir.","BTA":"The code BTA is ExpressJet."}}},
{"id":"n-075e5529","guard":[["hasAny",["abq","aia","amu","axl","ber","blf","brg","bta","bze","characters from","esk","fab","gfy","ika","item number","jef","jkk","jor","kkk","knd","ksm","letters from to","mah","mph","ndc","nth","obs","one","position","pti","rla","slice of the text","substring","sxs","udn","won","xau"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-570f1eae","guard":[["hasAny",["abq","aia","amu","axl","ber","blf","brg","bta","bze","characters from","esk","fab","gfy","ika","item number","jef","jkk","jor","kkk","knd","ksm","letters from to","mah","mph","ndc","nth","obs","one","position","pti","rla","slice of the text","substring","sxs","udn","won","xau"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-029f87bf","guard":[["hasAny",["abq","aia","bcc","blf","bta","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse the words","reverse word order","rla","say","sxs","thi","tns","udn","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-2443e859","guard":[["hasAny",["abq","aia","bcc","blf","bta","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse the words","reverse word order","rla","say","sxs","thi","tns","udn","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-4b8e5ecc","guard":[["hasAny",["abq","aia","bcc","blf","bta","class name","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","pascal case","pascalcase","position","pti","rla","say","sxs","thi","tns","udn","upper camel case","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-63520f1f","guard":[["hasAny",["abq","aia","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-a227f3c8","guard":[["hasAny",["abq","aia","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-a8f62cfa","guard":[["hasAny",["abq","aia","bcc","blf","bta","class name","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","pascal case","pascalcase","position","pti","rla","say","sxs","thi","tns","udn","upper camel case","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-c0008645","guard":[["hasAny",["abq","aia","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-c9e3374a","guard":[["hasAny",["abq","aia","bcc","blf","bta","camel case","camelcase","esk","gfy","item number","jef","jkk","kkk","ksm","lower camel case","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-cc89924f","guard":[["hasAny",["abq","aia","bcc","blf","bta","camel case","camelcase","esk","gfy","item number","jef","jkk","kkk","ksm","lower camel case","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-003b8599","guard":[["hasAny",["abq","aia","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse the words","reverse word order","rla","say","split into words","sxs","thi","tns","udn","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.list",["transform.words",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-00e335f3","guard":[["hasAny",["abq","aia","bcc","blf","bta","capitalise","capitalize","capitalize each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse the words","reverse word order","rla","say","sxs","thi","title case","tns","udn","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-04b37421","guard":[["hasAny",["abq","aia","backwards","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse","reverse order","reversed","rla","say","split into words","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-058c2ba4","guard":[["hasAny",["abq","aia","bcc","blf","bta","esk","gfy","item number","jef","jkk","kkk","ksm","lower case","lowercase","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse the words","reverse word order","rla","say","small letters","sxs","thi","tns","udn","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-10e1174b","guard":[["hasAny",["abq","aia","bcc","blf","bta","capitalise","capitalize","capitalize each word","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","sxs","thi","title case","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.lines",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-125e48a5","guard":[["hasAny",["abq","aia","bcc","blf","bta","esk","gfy","invert case","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse the words","reverse word order","rla","say","swap case","sxs","thi","tns","toggle case","udn","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-15c8d149","guard":[["hasAny",["abq","aia","bcc","blf","bta","class name","esk","gfy","invert case","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","pascal case","pascalcase","position","pti","rla","say","swap case","sxs","thi","tns","toggle case","udn","upper camel case","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.pascal",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-177cba3c","guard":[["hasAny",["a to z","abq","aia","alphabetical","alphabetize","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-1a6bd77b","guard":[["hasAny",["abq","aia","all caps","bcc","blf","bta","capital letters","capitals","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse the words","reverse word order","rla","say","sxs","thi","tns","udn","upper case","uppercase","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.reverseWords",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-1a8e16a6","guard":[["hasAny",["abq","aia","all caps","bcc","blf","bta","capital letters","capitals","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","sxs","thi","tns","udn","upper case","uppercase","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.and",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-1c960bb2","guard":[["hasAny",["abq","aia","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse the words","reverse word order","rla","say","split into words","sxs","thi","tns","udn","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.lines",["transform.words",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-1d23192f","guard":[["hasAny",["abq","aia","bcc","blf","bta","distinct","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","remove duplicates","rla","say","split into words","sxs","thi","tns","udn","vvc","without repeats"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.list",["transform.uniqueStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-1fa0a61b","guard":[["hasAny",["abq","aia","bcc","blf","bta","esk","gfy","invert case","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse the words","reverse word order","rla","say","swap case","sxs","thi","tns","toggle case","udn","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.reverseWords",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-22e059e6","guard":[["hasAny",["abq","aia","bcc","blf","bta","camel case","camelcase","capitalise","capitalize","capitalize each word","esk","gfy","item number","jef","jkk","kkk","ksm","lower camel case","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","sxs","thi","title case","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.title",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-23c366e6","guard":[["hasAny",["abq","aia","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","lower case","lowercase","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","small letters","split into words","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.and",["transform.words",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-25218e64","guard":[["hasAny",["abq","aia","all caps","bcc","blf","bta","capital letters","capitals","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse the words","reverse word order","rla","say","sxs","thi","tns","udn","upper case","uppercase","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.reverseWords",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-2618a924","guard":[["hasAny",["abq","aia","all caps","bcc","blf","bta","capital letters","capitals","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","sxs","thi","tns","udn","upper case","uppercase","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.lines",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-27c79c75","guard":[["hasAny",["abq","aia","bcc","blf","bta","capitalise","capitalize","capitalize each word","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","sxs","thi","title case","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.list",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-29fad1bc","guard":[["hasAny",["abq","aia","bcc","blf","bta","camel case","camelcase","esk","gfy","item number","jef","jkk","kkk","ksm","lower camel case","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse the words","reverse word order","rla","say","sxs","thi","tns","udn","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.camel",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-2b7edc18","guard":[["hasAny",["abq","aia","bcc","blf","bta","esk","gfy","item number","jef","jkk","kkk","ksm","lower case","lowercase","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse the words","reverse word order","rla","say","small letters","sxs","thi","tns","udn","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.lower",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-324bd489","guard":[["hasAny",["abq","aia","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","shortest","shortest one","shortest word","split into words","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-3f137ab2","guard":[["hasAny",["abq","aia","bcc","blf","bta","capitalise","capitalize","capitalize each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse the words","reverse word order","rla","say","sxs","thi","title case","tns","udn","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.reverseWords",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-4041cd77","guard":[["hasAny",["abq","aia","bcc","blf","bta","camel case","camelcase","esk","gfy","item number","jef","jkk","kkk","ksm","lower camel case","lower case","lowercase","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","small letters","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.lower",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-4d054ad2","guard":[["hasAny",["abq","aia","bcc","blf","bta","class name","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","pascal case","pascalcase","position","pti","reverse the words","reverse word order","rla","say","sxs","thi","tns","udn","upper camel case","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.pascal",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-4f6219b5","guard":[["hasAny",["abq","aia","bcc","blf","bta","esk","gfy","item number","jef","jkk","kkk","ksm","lower case","lowercase","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","small letters","snake case","snakecase","sxs","thi","tns","udn","underscores","variable name","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.snake",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-57f6f095","guard":[["hasAny",["abq","aia","bcc","blf","bta","distinct","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","remove duplicates","rla","say","split into words","sxs","thi","tns","udn","vvc","without repeats"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.and",["transform.uniqueStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-580049cc","guard":[["hasAny",["abq","aia","bcc","blf","bta","distinct","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","remove duplicates","rla","say","split into words","sxs","thi","tns","udn","vvc","without repeats"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.lines",["transform.uniqueStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-5eb47df2","guard":[["hasAny",["abq","aia","backwards","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse","reverse order","reversed","rla","say","split into words","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-60a84260","guard":[["hasAny",["abq","aia","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","lower case","lowercase","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","small letters","split into words","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.list",["transform.words",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-62ba790c","guard":[["hasAny",["abq","aia","all caps","bcc","blf","bta","camel case","camelcase","capital letters","capitals","esk","gfy","item number","jef","jkk","kkk","ksm","lower camel case","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","sxs","thi","tns","udn","upper case","uppercase","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.upper",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-6d11bb58","guard":[["hasAny",["abq","aia","bcc","blf","bta","class name","esk","gfy","invert case","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","pascal case","pascalcase","position","pti","rla","say","swap case","sxs","thi","tns","toggle case","udn","upper camel case","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.swapCase",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-6f5198c4","guard":[["hasAny",["abq","aia","bcc","blf","bta","esk","gfy","item number","jef","jkk","kkk","ksm","lower case","lowercase","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","small letters","snake case","snakecase","sxs","thi","tns","udn","underscores","variable name","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.snake",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-70a45217","guard":[["hasAny",["abq","aia","bcc","blf","bta","class name","esk","gfy","invert case","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","pascal case","pascalcase","position","pti","rla","say","swap case","sxs","thi","tns","toggle case","udn","upper camel case","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.swapCase",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-754e6484","guard":[["hasAny",["abq","aia","bcc","blf","bta","dashes","esk","gfy","hyphens","item number","jef","jkk","kebab case","kebabcase","kkk","ksm","lower case","lowercase","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","small letters","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.kebab",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-7a59858f","guard":[["hasAny",["abq","aia","bcc","blf","bta","camel case","camelcase","esk","gfy","item number","jef","jkk","kkk","ksm","lower camel case","lower case","lowercase","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","small letters","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.camel",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-7db8b711","guard":[["hasAny",["abq","aia","bcc","blf","bta","each word","esk","gfy","invert case","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","swap case","sxs","thi","tns","toggle case","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.and",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-86ef67c0","guard":[["hasAny",["abq","aia","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","lower case","lowercase","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","small letters","split into words","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.lines",["transform.words",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-8dcbfb08","guard":[["hasAny",["abq","aia","bcc","blf","bta","camel case","camelcase","esk","gfy","invert case","item number","jef","jkk","kkk","ksm","lower camel case","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","swap case","sxs","thi","tns","toggle case","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.swapCase",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-8ffe005a","guard":[["hasAny",["abq","aia","bcc","blf","bta","each word","esk","gfy","invert case","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","swap case","sxs","thi","tns","toggle case","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-94d08192","guard":[["hasAny",["abq","aia","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","longest","longest one","longest word","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-9b5854af","guard":[["hasAny",["abq","aia","bcc","blf","bta","camel case","camelcase","esk","gfy","item number","jef","jkk","kkk","ksm","lower camel case","lower case","lowercase","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","small letters","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.lower",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-9b7ac1aa","guard":[["hasAny",["abq","aia","bcc","blf","bta","dashes","esk","gfy","hyphens","item number","jef","jkk","kebab case","kebabcase","kkk","ksm","lower case","lowercase","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","small letters","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.kebab",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-9bb244e0","guard":[["hasAny",["abq","aia","all caps","bcc","blf","bta","camel case","camelcase","capital letters","capitals","esk","gfy","item number","jef","jkk","kkk","ksm","lower camel case","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","sxs","thi","tns","udn","upper case","uppercase","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.upper",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-9edd9b7d","guard":[["hasAny",["abq","aia","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","longest","longest one","longest word","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-9f75bd0f","guard":[["hasAny",["abq","aia","bcc","blf","bta","camel case","camelcase","esk","gfy","item number","jef","jkk","kkk","ksm","lower camel case","lower case","lowercase","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","small letters","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.camel",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-a1ae33f7","guard":[["hasAny",["abq","aia","bcc","blf","bta","capitalise","capitalize","capitalize each word","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","sxs","thi","title case","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.and",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-af3a3338","guard":[["hasAny",["abq","aia","bcc","blf","bta","camel case","camelcase","esk","gfy","invert case","item number","jef","jkk","kkk","ksm","lower camel case","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","swap case","sxs","thi","tns","toggle case","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-b7daba24","guard":[["hasAny",["abq","aia","all caps","bcc","blf","bta","capital letters","capitals","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","sxs","thi","tns","udn","upper case","uppercase","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.list",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-bbe900e4","guard":[["hasAny",["abq","aia","bcc","blf","bta","camel case","camelcase","esk","gfy","item number","jef","jkk","kkk","ksm","lower camel case","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse the words","reverse word order","rla","say","sxs","thi","tns","udn","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.camel",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-bfaec7a2","guard":[["hasAny",["a to z","abq","aia","alphabetical","alphabetize","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-cb78bf7d","guard":[["hasAny",["abq","aia","bcc","blf","bta","camel case","camelcase","esk","gfy","invert case","item number","jef","jkk","kkk","ksm","lower camel case","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","swap case","sxs","thi","tns","toggle case","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.swapCase",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-ccee0bd6","guard":[["hasAny",["abq","aia","bcc","blf","bta","camel case","camelcase","capitalise","capitalize","capitalize each word","esk","gfy","item number","jef","jkk","kkk","ksm","lower camel case","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","sxs","thi","title case","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.title",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-ce36f018","guard":[["hasAny",["abq","aia","bcc","blf","bta","each word","esk","gfy","invert case","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","swap case","sxs","thi","tns","toggle case","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.list",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-d5f1a932","guard":[["hasAny",["abq","aia","backwards","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse","reverse order","reversed","rla","say","split into words","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-e38640d1","guard":[["hasAny",["abq","aia","bcc","blf","bta","camel case","camelcase","esk","gfy","invert case","item number","jef","jkk","kkk","ksm","lower camel case","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","swap case","sxs","thi","tns","toggle case","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-e652bcea","guard":[["hasAny",["abq","aia","bcc","blf","bta","class name","esk","gfy","item number","jef","jkk","kkk","ksm","lower case","lowercase","mah","mph","mxi","ndc","nth","obs","one","pascal case","pascalcase","position","pti","rla","say","small letters","sxs","thi","tns","udn","upper camel case","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.pascal",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-e7022e1f","guard":[["hasAny",["abq","aia","bcc","blf","bta","class name","esk","gfy","item number","jef","jkk","kkk","ksm","lower case","lowercase","mah","mph","mxi","ndc","nth","obs","one","pascal case","pascalcase","position","pti","rla","say","small letters","sxs","thi","tns","udn","upper camel case","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.pascal",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-ec7f5bb7","guard":[["hasAny",["abq","aia","bcc","blf","bta","class name","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","pascal case","pascalcase","position","pti","reverse the words","reverse word order","rla","say","sxs","thi","tns","udn","upper camel case","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.pascal",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-ed168866","guard":[["hasAny",["abq","aia","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse the words","reverse word order","rla","say","split into words","sxs","thi","tns","udn","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.and",["transform.words",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-f0105d51","guard":[["hasAny",["abq","aia","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","shortest","shortest one","shortest word","split into words","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-f67ad0ed","guard":[["hasAny",["a to z","abq","aia","alphabetical","alphabetize","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-f8e9b7cf","guard":[["hasAny",["abq","aia","bcc","blf","bta","class name","esk","gfy","invert case","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","pascal case","pascalcase","position","pti","rla","say","swap case","sxs","thi","tns","toggle case","udn","upper camel case","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.pascal",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-01abda90","guard":[["hasAny",["abq","aia","bcc","blf","bta","camel case","camelcase","esk","gfy","item number","jef","jkk","kkk","ksm","lower camel case","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-76a18585","guard":[["hasAny",["abq","aia","bcc","blf","bta","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","reverse the words","reverse word order","rla","say","sxs","thi","tns","udn","vvc","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-7e6eacd0","guard":[["hasAny",["abq","aia","bcc","blf","bta","class name","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","pascal case","pascalcase","position","pti","rla","say","sxs","thi","tns","udn","upper camel case","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-e67812c5","guard":[["hasAny",["abq","aia","bcc","blf","bta","each word","esk","gfy","item number","jef","jkk","kkk","ksm","mah","mph","mxi","ndc","nth","obs","one","position","pti","rla","say","split into words","sxs","thi","tns","udn","vvc"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-674ddcd4","guard":[["hasAny",["abq","aia","blf","dashes","gfy","hyphens","item number","jef","jkk","kebab case","kebabcase","kkk","ksm","mah","mph","nth","obs","one","position","pti","rla","tns","udn"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-cfa97ea1","guard":[["hasAny",["abq","aia","blf","dashes","gfy","hyphens","item number","jef","jkk","kebab case","kebabcase","kkk","ksm","mah","mph","nth","obs","one","position","pti","rla","tns","udn"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-f3d6f5fa","guard":[["hasAny",["abq","aia","blf","gfy","item number","jef","jkk","kkk","ksm","mah","mph","nth","obs","one","position","pti","rla","snake case","snakecase","tns","udn","underscores","variable name"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-feb965fd","guard":[["hasAny",["abq","aia","blf","gfy","item number","jef","jkk","kkk","ksm","mah","mph","nth","obs","one","position","pti","rla","snake case","snakecase","tns","udn","underscores","variable name"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-2f2576ef","guard":[["hasAny",["abq","aia","blf","capitalise","capitalize","capitalize each word","dashes","gfy","hyphens","item number","jef","jkk","kebab case","kebabcase","kkk","ksm","mah","mph","nth","obs","one","position","pti","rla","title case","tns","udn"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.title",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-371f6459","guard":[["hasAny",["abq","aia","blf","dashes","each word","gfy","hyphens","item number","jef","jkk","kebab case","kebabcase","kkk","ksm","mah","mph","nth","obs","one","position","pti","rla","split into words","tns","udn"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.list",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-3a0a6918","guard":[["hasAny",["abq","aia","blf","gfy","item number","jef","jkk","kkk","ksm","mah","mph","nth","obs","one","position","pti","reverse the words","reverse word order","rla","snake case","snakecase","tns","udn","underscores","variable name","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.snake",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-3f8e9c5e","guard":[["hasAny",["abq","aia","blf","gfy","item number","jef","jkk","kkk","ksm","mah","mph","nth","obs","one","position","pti","reverse the words","reverse word order","rla","snake case","snakecase","tns","udn","underscores","variable name","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.snake",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-5f9f8345","guard":[["hasAny",["abq","aia","blf","dashes","each word","gfy","hyphens","item number","jef","jkk","kebab case","kebabcase","kkk","ksm","mah","mph","nth","obs","one","position","pti","rla","split into words","tns","udn"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.lines",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-65345c93","guard":[["hasAny",["abq","aia","blf","capitalise","capitalize","capitalize each word","dashes","gfy","hyphens","item number","jef","jkk","kebab case","kebabcase","kkk","ksm","mah","mph","nth","obs","one","position","pti","rla","title case","tns","udn"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.title",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-66d90b7c","guard":[["hasAny",["abq","aia","blf","dashes","each word","gfy","hyphens","item number","jef","jkk","kebab case","kebabcase","kkk","ksm","mah","mph","nth","obs","one","position","pti","rla","split into words","tns","udn"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.and",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-6ed55ab1","guard":[["hasAny",["abq","aia","blf","dashes","gfy","hyphens","item number","jef","jkk","kebab case","kebabcase","kkk","ksm","mah","mph","nth","obs","one","position","pti","reverse the words","reverse word order","rla","tns","udn","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.kebab",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-7b9e3ca9","guard":[["hasAny",["abq","aia","blf","dashes","gfy","hyphens","invert case","item number","jef","jkk","kebab case","kebabcase","kkk","ksm","mah","mph","nth","obs","one","position","pti","rla","swap case","tns","toggle case","udn"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.swapCase",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-a309e702","guard":[["hasAny",["abq","aia","blf","gfy","invert case","item number","jef","jkk","kkk","ksm","mah","mph","nth","obs","one","position","pti","rla","snake case","snakecase","swap case","tns","toggle case","udn","underscores","variable name"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.swapCase",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-a6663d98","guard":[["hasAny",["abq","aia","blf","dashes","gfy","hyphens","invert case","item number","jef","jkk","kebab case","kebabcase","kkk","ksm","mah","mph","nth","obs","one","position","pti","rla","swap case","tns","toggle case","udn"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.swapCase",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-b40757a4","guard":[["hasAny",["abq","aia","blf","dashes","gfy","hyphens","item number","jef","jkk","kebab case","kebabcase","kkk","ksm","mah","mph","nth","obs","one","position","pti","reverse the words","reverse word order","rla","tns","udn","words backwards"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.kebab",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-c7919432","guard":[["hasAny",["abq","aia","blf","capitalise","capitalize","capitalize each word","gfy","item number","jef","jkk","kkk","ksm","mah","mph","nth","obs","one","position","pti","rla","snake case","snakecase","title case","tns","udn","underscores","variable name"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.code",["transform.title",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-eebc0216","guard":[["hasAny",["abq","aia","blf","capitalise","capitalize","capitalize each word","gfy","item number","jef","jkk","kkk","ksm","mah","mph","nth","obs","one","position","pti","rla","snake case","snakecase","title case","tns","udn","underscores","variable name"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.title",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-eff7b46d","guard":[["hasAny",["abq","aia","blf","gfy","invert case","item number","jef","jkk","kkk","ksm","mah","mph","nth","obs","one","position","pti","rla","snake case","snakecase","swap case","tns","toggle case","udn","underscores","variable name"]],["has","airline"],["nums==",0],["words<=",7]],"pyramid":["render.str",["transform.swapCase",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-1336b213","guard":[["hasAny",["blf","class name","gfy","item number","jba","jkk","kkk","mxi","nth","pascal case","pascalcase","position","sxs","tns","udn","upper camel case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-84e85458","guard":[["hasAny",["blf","gfy","item number","jba","jkk","kkk","mxi","nth","position","reverse the words","reverse word order","sxs","tns","udn","words backwards"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-b30d552d","guard":[["hasAny",["blf","camel case","camelcase","gfy","item number","jba","jkk","kkk","lower camel case","mxi","nth","position","sxs","tns","udn"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-dbd7f638","guard":[["hasAny",["aia","class name","esk","item number","mah","nth","obs","one","pascal case","pascalcase","position","pti","rla","thi","upper camel case","vvc"]],["has","airline"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-e1c6f6c6","guard":[["hasAny",["aia","camel case","camelcase","esk","item number","lower camel case","mah","nth","obs","one","position","pti","rla","thi","vvc"]],["has","airline"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-eecd7e8d","guard":[["hasAny",["aia","esk","item number","mah","nth","obs","one","position","pti","reverse the words","reverse word order","rla","thi","vvc","words backwards"]],["has","airline"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]],"mem":null},
{"id":"n-8ca345d3","guard":[["hasAny",["blf","each word","gfy","item number","jba","jkk","kkk","mxi","nth","position","split into words","sxs","tns","udn"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-dd68e032","guard":[["hasAny",["aia","each word","esk","item number","mah","nth","obs","one","position","pti","rla","split into words","thi","vvc"]],["has","airline"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]]]],"mem":null},
{"id":"n-2af612cc","guard":[["hasAny",["aia","blf","characters from","item number","jba","jkk","knd","letters from to","mah","nth","obs","position","slice of the text","substring"]],["has","airline"],["has","code"]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-b9c97ffd","guard":[["hasAny",["aia","blf","characters from","item number","jba","jkk","knd","letters from to","mah","nth","obs","position","slice of the text","substring"]],["has","airline"],["has","code"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-1cbe664f","guard":[["hasAny",["aia","blf","characters from","item number","letters from to","mah","nth","position","slice of the text","substring"]],["has","airline"]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":1},{"lit":5}]],"mem":null},
{"id":"n-35c6c9ae","guard":[["hasAny",["aia","blf","characters from","item number","letters from to","mah","nth","position","slice of the text","substring"]],["has","airline"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],{"lit":1},{"lit":5}]],"mem":null},
{"id":"n-089c099b","guard":[["has","ham"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Haiti Ambassador Airlines."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-0c49e059","guard":[["has","lmm"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LCM AIRLINES."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-0fd4bbf7","guard":[["has","bwa"],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Caribbean Airlines."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-1060590c","guard":[["has","aui"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Ukraine International Airlines."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-13f78a96","guard":[["has","ksm"],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-1c3738f8","guard":[["has","sgg"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-214b2416","guard":[["has","fza"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Fuzhou Airlines."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-23be6302","guard":[["has","lni"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Lion Mentari Airlines."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-284b918c","guard":[["has","cub"],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Cubana de Aviación."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-286a91d1","guard":[["has","vrn"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VRG Linhas Aereas."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-347d44ab","guard":[["has","bvt"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Berjaya Air."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-3638d3e9","guard":[["has","til"],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Tajikistan International Airlines."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-3840020a","guard":[["has","njs"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-3a47a3e2","guard":[["has","ant"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air North Charter - Canada."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-4147c7eb","guard":[["has","fta"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Frontier Flying Service."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-49133376","guard":[["has","amu"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Macau."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-71b805b9","guard":[["has","mwa"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Midwest Airlines (Egypt)."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-7629a8a7","guard":[["has","iaw"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Iraqi Airways."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-765726ef","guard":[["has","flg"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-837da096","guard":[["has","xau"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-8624e9f9","guard":[["has","mph"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-9caa59ca","guard":[["has","awe"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is America West Airlines."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-9cb0bf9b","guard":[["has","ndc"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is FlyNordic."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-9f4956af","guard":[["has","fab"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is First Air."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-a8dac384","guard":[["has","bta"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-b58d31ba","guard":[["has","sxr"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-c6530d7a","guard":[["has","ssv"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Skyservice Airlines."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-d5823559","guard":[["has","bcc"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is BusinessAir."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-df9f7497","guard":[["has","abq"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airblue."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-eaa0bfa0","guard":[["has","jef"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Jetflite."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-f4b40b71","guard":[["has","ika"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Itek Air."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-f67f90c3","guard":[["has","say"],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ScotAirways."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-f6a11d39","guard":[["has","pel"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aeropelican Air Services."]},["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-00a1c9c5","guard":[["hasAny",["hcw","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Star1 Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-04e57407","guard":[["hasAny",["item number","kkk","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Atlasjet."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-135ffdfc","guard":[["hasAny",["item number","nth","oae","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Omni Air International."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-169db6e2","guard":[["hasAny",["item number","mna","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Merpati Nusantara Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-16f3def8","guard":[["hasAny",["item number","nth","position","vvc"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-180920fb","guard":[["hasAny",["doa","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dominicana de Aviaci."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-1d4d44e2","guard":[["hasAny",["brg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Bering Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-21b6971e","guard":[["hasAny",["item number","nth","position","xsr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Executive AirShare."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-26bb92ab","guard":[["hasAny",["item number","nth","oom","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zoom Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-32c92285","guard":[["hasAny",["hbr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hebradran Air Services."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-3596f0cd","guard":[["hasAny",["item number","mah","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Malév."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-37bd0360","guard":[["hasAny",["item number","nth","position","sha"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Sharp Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-37e2e03d","guard":[["hasAny",["ceb","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cebu Pacific."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-37e86b33","guard":[["hasAny",["item number","lxp","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is LAN Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-39f83bf6","guard":[["hasAny",["aes","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-3bea11c3","guard":[["hasAny",["gft","item number","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Gulfstream International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-416dde74","guard":[["hasAny",["gfy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Greenfly."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-533edbb2","guard":[["hasAny",["item number","jba","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Helijet."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-5b6666ed","guard":[["hasAny",["axl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Exel."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-5b98c05b","guard":[["hasAny",["btq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Boutique Air (Priv)."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-5c0890fa","guard":[["hasAny",["item number","lbc","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Albanian Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-5c531688","guard":[["hasAny",["item number","nth","pia","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pakistan International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-5c6c07fc","guard":[["hasAny",["item number","nth","position","vgn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Virgin Nigeria Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-60fe4cf3","guard":[["hasAny",["eal","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is European Air Express."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-63f32163","guard":[["hasAny",["aia","item number","nth","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Avies."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-6b85c828","guard":[["hasAny",["item number","nth","position","tns"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transilvania."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-6da4303e","guard":[["hasAny",["item number","mld","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Moldova."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-734b662f","guard":[["hasAny",["item number","nth","pfl","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pacific Flier."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-79f770c9","guard":[["hasAny",["item number","nth","position","sol"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-7bac7103","guard":[["hasAny",["item number","jkk","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Spanair."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-7d31acd5","guard":[["hasAny",["ber","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Berlin."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-7f72e892","guard":[["hasAny",["axb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air India Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-8458f9ba","guard":[["hasAny",["ger","item number","nth","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is German International Air Lines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-8793261b","guard":[["hasAny",["item number","nth","position","thi"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TransHolding."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-89f94a12","guard":[["hasAny",["akl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Kiribati."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-8a30d8f5","guard":[["hasAny",["item number","nth","position","ual"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is United Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-8b06ba51","guard":[["hasAny",["item number","knd","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kan Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-8d232012","guard":[["hasAny",["esk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SkyEurope."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-96b175a9","guard":[["hasAny",["item number","nth","position","rya"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ryan Air Services."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-99bfc27b","guard":[["hasAny",["item number","nth","position","thk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Turk Hava Kurumu Hava Taksi Isletmesi."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-9c060855","guard":[["hasAny",["item number","nth","position","zna"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zenith International Airline."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-9fc75c0d","guard":[["hasAny",["item number","mxi","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MexicanaLink."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-a14a7d08","guard":[["hasAny",["item number","nth","position","rla"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Airlinair."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-a1ecfcee","guard":[["hasAny",["item number","mdo","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Domenican Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-a2eee98b","guard":[["hasAny",["ela","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Eastland Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-a4599d1d","guard":[["hasAny",["item number","nth","position","tht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Tahiti Nui."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-a831a247","guard":[["hasAny",["item number","nth","position","udn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dniproavia."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-aca1d451","guard":[["hasAny",["item number","nth","otg","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is One Two Go Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-add5cf05","guard":[["hasAny",["item number","nth","position","tra"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transavia Holland."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-b66261da","guard":[["hasAny",["item number","jor","nth","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-b7d3ebd1","guard":[["hasAny",["item number","nth","one","position"]],["has","airline"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Oceanair."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-b9ed14cc","guard":[["hasAny",["item number","mic","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Mint Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-c5a49b12","guard":[["hasAny",["arg","item number","nth","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Aerolineas Argentinas."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-c832fb5b","guard":[["hasAny",["hmr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is North American Charters."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-c9dfc70a","guard":[["hasAny",["bze","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BRAZIL AIR."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-ca74a255","guard":[["hasAny",["item number","nth","position","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-ce6893cf","guard":[["hasAny",["blf","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue1."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-d34ed3f5","guard":[["hasAny",["item number","nth","position","sqc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Singapore Airlines Cargo."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-d77c4969","guard":[["hasAny",["item number","nth","position","zxy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Japan Regio."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-d81391eb","guard":[["hasAny",["item number","nth","position","sxs"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SunExpress."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-dfbea3ce","guard":[["hasAny",["hcc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Holidays Czech Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-ebe53436","guard":[["hasAny",["item number","nth","position","pqw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PanAm World Airways."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-f11861d1","guard":[["hasAny",["item number","nth","position","ram"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Royal Air Maroc."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-f74b778a","guard":[["hasAny",["item number","nth","position","slc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Salsa d\\\\'Haiti."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-fb45cbfb","guard":[["hasAny",["item number","nth","obs","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Orbest."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-fc27050d","guard":[["hasAny",["item number","nth","position","pti"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Privatair."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-fdcb5144","guard":[["hasAny",["item number","kry","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Russkie Krylya."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}]]],"mem":null},
{"id":"n-0936f703","guard":[["hasAny",["bvt","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code BVT is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-0fa19fa0","guard":[["hasAny",["cub","item number","nth","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The code CUB is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-11f1d37e","guard":[["hasAny",["item number","nth","position","xau"]]],"pyramid":["render.template",{"lit":["The code XAU is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-1b9e1320","guard":[["hasAny",["bwa","item number","nth","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The code BWA is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-1f4fe712","guard":[["hasAny",["item number","nth","position","sgg"]]],"pyramid":["render.template",{"lit":["The code SGG is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-23b79814","guard":[["hasAny",["bta","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code BTA is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-291aa286","guard":[["hasAny",["item number","nth","position","til"]],["has","airline"]],"pyramid":["render.template",{"lit":["The code TIL is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-3bea7143","guard":[["hasAny",["item number","nth","position","sxr"]]],"pyramid":["render.template",{"lit":["The code SXR is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-3cb6ccfa","guard":[["hasAny",["fab","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code FAB is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-584749db","guard":[["hasAny",["aui","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code AUI is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-59b366fc","guard":[["hasAny",["ham","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code HAM is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-5fd76987","guard":[["hasAny",["item number","jef","nth","position"]]],"pyramid":["render.template",{"lit":["The code JEF is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-60b7b0e7","guard":[["hasAny",["awe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code AWE is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-66408499","guard":[["hasAny",["item number","nth","position","ssv"]]],"pyramid":["render.template",{"lit":["The code SSV is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-6a44fd67","guard":[["hasAny",["fta","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code FTA is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-8796ff2b","guard":[["hasAny",["abq","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ABQ is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-8cb69cce","guard":[["hasAny",["item number","ndc","nth","position"]]],"pyramid":["render.template",{"lit":["The code NDC is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-95078db8","guard":[["hasAny",["ika","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code IKA is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-985a81ef","guard":[["hasAny",["fza","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code FZA is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-98715f09","guard":[["hasAny",["bcc","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code BCC is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-a11dfd9e","guard":[["hasAny",["ant","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ANT is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-acec0fb6","guard":[["hasAny",["item number","ksm","nth","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The code KSM is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-ade6f676","guard":[["hasAny",["flg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code FLG is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-af5c54e8","guard":[["hasAny",["item number","lmm","nth","position"]]],"pyramid":["render.template",{"lit":["The code LMM is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-b69798f4","guard":[["hasAny",["item number","mwa","nth","position"]]],"pyramid":["render.template",{"lit":["The code MWA is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-bc95a02e","guard":[["hasAny",["iaw","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code IAW is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-c044621c","guard":[["hasAny",["item number","nth","position","say"]],["has","airline"]],"pyramid":["render.template",{"lit":["The code SAY is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-c87c6738","guard":[["hasAny",["amu","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code AMU is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-d381b191","guard":[["hasAny",["item number","lni","nth","position"]]],"pyramid":["render.template",{"lit":["The code LNI is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-d76bf84f","guard":[["hasAny",["item number","nth","pel","position"]]],"pyramid":["render.template",{"lit":["The code PEL is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-d7e82feb","guard":[["hasAny",["item number","njs","nth","position"]]],"pyramid":["render.template",{"lit":["The code NJS is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-dee393af","guard":[["hasAny",["item number","mph","nth","position"]]],"pyramid":["render.template",{"lit":["The code MPH is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-f33a052d","guard":[["hasAny",["item number","nth","position","vrn"]]],"pyramid":["render.template",{"lit":["The code VRN is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-4ce3f944","guard":[["hasAny",["airline","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.roman"]]],"mem":null},
{"id":"n-ed901fa1","guard":[["hasAny",["airline","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}],["sense.roman"]]],"mem":null},
{"id":"n-0337423d","guard":[["hasAny",["item number","nth","pfl","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PFL is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-053eee02","guard":[["hasAny",["ber","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BER is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-0745e28b","guard":[["hasAny",["item number","mah","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MAH is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-116f004c","guard":[["hasAny",["item number","nth","position","zxy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ZXY is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-12507e6c","guard":[["hasAny",["item number","nth","position","tht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," THT is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-18593c3a","guard":[["hasAny",["item number","nth","position","rya"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," RYA is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-1ceb7fb2","guard":[["hasAny",["hbr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HBR is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-1d17bd59","guard":[["hasAny",["item number","nth","position","thi"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," THI is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-1e03a326","guard":[["hasAny",["aes","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AES is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-227c736e","guard":[["hasAny",["item number","nth","position","pqw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PQW is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-22c454fa","guard":[["hasAny",["brg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BRG is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-267aea74","guard":[["hasAny",["ger","item number","nth","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GER is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-27c2ddd3","guard":[["hasAny",["hcc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HCC is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-2e26dbe8","guard":[["hasAny",["blf","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BLF is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-2ffe85f2","guard":[["hasAny",["item number","jor","nth","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," JOR is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-30fcfb94","guard":[["hasAny",["item number","nth","position","pti"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PTI is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-31a206cb","guard":[["hasAny",["item number","nth","position","rla"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," RLA is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-335b179c","guard":[["hasAny",["item number","nth","position","xsr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," XSR is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-34b0ded8","guard":[["hasAny",["item number","nth","position","sqc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SQC is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-39b6b6b0","guard":[["hasAny",["item number","nth","position","vgn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," VGN is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-404af457","guard":[["hasAny",["gfy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GFY is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-4056ac20","guard":[["hasAny",["item number","lbc","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," LBC is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-41e5c041","guard":[["hasAny",["item number","jba","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," JBA is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-491f27e9","guard":[["hasAny",["arg","item number","nth","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ARG is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-4a69523c","guard":[["hasAny",["item number","nth","oae","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," OAE is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-4c35c14a","guard":[["hasAny",["item number","nth","position","sha"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SHA is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-50e0388b","guard":[["hasAny",["item number","mic","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MIC is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-5c1d9e9f","guard":[["hasAny",["item number","nth","position","tns"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TNS is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-5d1a29aa","guard":[["hasAny",["eal","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," EAL is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-5e59efdb","guard":[["hasAny",["item number","nth","position","sxs"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SXS is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-62403b70","guard":[["hasAny",["item number","kry","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KRY is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-660f3e7d","guard":[["hasAny",["axb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AXB is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-6706eab7","guard":[["hasAny",["item number","mna","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MNA is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-6f60d1c2","guard":[["hasAny",["item number","kkk","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KKK is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-6fc1fc65","guard":[["hasAny",["doa","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," DOA is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-7246e7d1","guard":[["hasAny",["item number","nth","position","sol"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SOL is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-7aafb6bc","guard":[["hasAny",["item number","lxp","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," LXP is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-7ec2de6d","guard":[["hasAny",["item number","nth","oom","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," OOM is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-81f5e53f","guard":[["hasAny",["item number","nth","position","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," WON is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-8697ad9b","guard":[["hasAny",["item number","nth","position","ram"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," RAM is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-8e58a713","guard":[["hasAny",["item number","nth","pia","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PIA is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-8f1d3d9e","guard":[["hasAny",["hcw","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HCW is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-92f61646","guard":[["hasAny",["ceb","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CEB is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-9498a4f3","guard":[["hasAny",["item number","nth","position","slc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SLC is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-97b31a25","guard":[["hasAny",["item number","nth","position","zna"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ZNA is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-a4ac53f8","guard":[["hasAny",["item number","knd","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KND is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-a8e2c938","guard":[["hasAny",["item number","nth","otg","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," OTG is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-aa8ca5bb","guard":[["hasAny",["akl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AKL is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-bc239cd2","guard":[["hasAny",["item number","nth","one","position"]],["has","airline"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ONE is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-bc5118fa","guard":[["hasAny",["item number","mdo","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MDO is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-bd65d9dc","guard":[["hasAny",["btq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BTQ is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-be5fc981","guard":[["hasAny",["hmr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HMR is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-c3ad23d6","guard":[["hasAny",["ela","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ELA is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-c82446ab","guard":[["hasAny",["item number","nth","obs","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," OBS is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-ccdfce08","guard":[["hasAny",["aia","item number","nth","position"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AIA is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-cfebeee0","guard":[["hasAny",["bze","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BZE is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-d338ddb8","guard":[["hasAny",["item number","mxi","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MXI is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-de0fcbf5","guard":[["hasAny",["item number","jkk","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," JKK is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-e1cf18cd","guard":[["hasAny",["item number","mld","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MLD is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-e4c31bfe","guard":[["hasAny",["axl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AXL is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-e7b26858","guard":[["hasAny",["item number","nth","position","udn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," UDN is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-e8ce739b","guard":[["hasAny",["item number","nth","position","tra"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TRA is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-f1b73bbb","guard":[["hasAny",["esk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ESK is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-f2407a7f","guard":[["hasAny",["item number","nth","position","ual"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," UAL is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-f315b142","guard":[["hasAny",["gft","item number","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GFT is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-f386af59","guard":[["hasAny",["item number","nth","position","vvc"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," VVC is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-f91222c8","guard":[["hasAny",["item number","nth","position","thk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," THK is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"openflights-airlines"},{"lit":"airline code"}],{"lit":1}],{"lit":"openflights-airlines"},{"lit":"airline code"},{"lit":"airline"}]],"mem":null},
{"id":"n-01ac0a28","guard":[["hasAny",["airline","amu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is AMU":"The code AMU is Air Macau."}}},
{"id":"n-02c77a4c","guard":[["has","esk"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is SkyEurope."]},["sense.lastWord"]],"mem":null},
{"id":"n-03d6cba8","guard":[["hasAny",["airline","ham"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is HAM":"The code HAM is Haiti Ambassador Airlines."}}},
{"id":"n-042b5ba0","guard":[["hasAny",["airline","code","mic","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code MIC":"The code MIC is Mint Airways."}}},
{"id":"n-0836e9a0","guard":[["has","otg"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is One Two Go Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-0c00047d","guard":[["hasAny",["airline","lmm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is LMM":"The code LMM is LCM AIRLINES."}}},
{"id":"n-0c3ae534","guard":[["has","ela"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Eastland Air."]},["sense.lastWord"]],"mem":null},
{"id":"n-0c7376f0","guard":[["hasAny",["airline","bcc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is BCC":"The code BCC is BusinessAir."}}},
{"id":"n-0d072e53","guard":[["hasAny",["airline","code","has","icao","sol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code SOL":"The code SOL is Solomon Airlines."}}},
{"id":"n-0d3a5a2d","guard":[["has","ksm"],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["sense.lastWord"]],"mem":null},
{"id":"n-1136f6ac","guard":[["has","zxy"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Japan Regio."]},["sense.lastWord"]],"mem":null},
{"id":"n-13f6e616","guard":[["hasAny",["airline","code","has","icao","oae"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code OAE":"The code OAE is Omni Air International."}}},
{"id":"n-143a8d99","guard":[["hasAny",["airline","code","ger","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code GER":"The code GER is German International Air Lines."}}},
{"id":"n-15ca625a","guard":[["hasAny",["airline","fza"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is FZA":"The code FZA is Fuzhou Airlines."}}},
{"id":"n-1665b373","guard":[["hasAny",["airline","code","knd","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code KND":"The code KND is Kan Air."}}},
{"id":"n-1a26f2dc","guard":[["hasAny",["airline","code","has","icao","kkk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code KKK":"The code KKK is Atlasjet."}}},
{"id":"n-1f3b44b3","guard":[["has","ika"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Itek Air."]},["sense.lastWord"]],"mem":null},
{"id":"n-2267a8fd","guard":[["hasAny",["airline","pel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is PEL":"The code PEL is Aeropelican Air Services."}}},
{"id":"n-241b57d3","guard":[["hasAny",["airline","ksm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is KSM":"The code KSM is Kosmos."}}},
{"id":"n-24ec36cd","guard":[["has","vrn"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VRG Linhas Aereas."]},["sense.lastWord"]],"mem":null},
{"id":"n-25dee6cb","guard":[["has","rla"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airlinair."]},["sense.lastWord"]],"mem":null},
{"id":"n-269b7670","guard":[["hasAny",["airline","code","has","icao","jba"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code JBA":"The code JBA is Helijet."}}},
{"id":"n-271fc878","guard":[["has","sxs"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is SunExpress."]},["sense.lastWord"]],"mem":null},
{"id":"n-28b85067","guard":[["has","obs"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Orbest."]},["sense.lastWord"]],"mem":null},
{"id":"n-2a36a6a4","guard":[["has","mdo"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Domenican Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-2c459c5f","guard":[["has","fza"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Fuzhou Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-2cb618db","guard":[["hasAny",["airline","code","mld","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code MLD":"The code MLD is Air Moldova."}}},
{"id":"n-2eff74b2","guard":[["has","axb"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air India Express."]},["sense.lastWord"]],"mem":null},
{"id":"n-2f10aa44","guard":[["hasAny",["airline","mwa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is MWA":"The code MWA is Midwest Airlines (Egypt)."}}},
{"id":"n-303d284e","guard":[["has","gfy"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Greenfly."]},["sense.lastWord"]],"mem":null},
{"id":"n-30c6c24a","guard":[["hasAny",["airline","code","has","hcw","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code HCW":"The code HCW is Star1 Airlines."}}},
{"id":"n-30e898f1","guard":[["has","sol"],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Solomon Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-314debed","guard":[["hasAny",["airline","ika"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is IKA":"The code IKA is Itek Air."}}},
{"id":"n-31bc7584","guard":[["has","fta"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Frontier Flying Service."]},["sense.lastWord"]],"mem":null},
{"id":"n-351b9070","guard":[["hasAny",["airline","code","has","icao","thk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code THK":"The code THK is Turk Hava Kurumu Hava Taksi Isletmesi."}}},
{"id":"n-36497f95","guard":[["hasAny",["airline","bvt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is BVT":"The code BVT is Berjaya Air."}}},
{"id":"n-36d6b9de","guard":[["hasAny",["airline","bwa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is BWA":"The code BWA is Caribbean Airlines."}}},
{"id":"n-387ffa06","guard":[["hasAny",["airline","bze","code","has","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code BZE":"The code BZE is BRAZIL AIR."}}},
{"id":"n-396bc9fd","guard":[["hasAny",["aia","airline","code","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code AIA":"The code AIA is Avies."}}},
{"id":"n-398872ec","guard":[["hasAny",["airline","njs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is NJS":"The code NJS is National Jet Systems."}}},
{"id":"n-3a30ab2c","guard":[["has","pel"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aeropelican Air Services."]},["sense.lastWord"]],"mem":null},
{"id":"n-3c555aaa","guard":[["hasAny",["airline","ber","code","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code BER":"The code BER is Air Berlin."}}},
{"id":"n-43483b47","guard":[["has","mld"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Moldova."]},["sense.lastWord"]],"mem":null},
{"id":"n-436311bf","guard":[["hasAny",["airline","code","lxp","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code LXP":"The code LXP is LAN Express."}}},
{"id":"n-456b50b0","guard":[["has","flg"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-458a99f0","guard":[["hasAny",["airline","code","name","pti"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code PTI":"The code PTI is Privatair."}}},
{"id":"n-46606506","guard":[["has","jkk"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Spanair."]},["sense.lastWord"]],"mem":null},
{"id":"n-46df8c4f","guard":[["hasAny",["airline","code","has","hcc","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code HCC":"The code HCC is Holidays Czech Airlines."}}},
{"id":"n-4a803811","guard":[["hasAny",["airline","xau"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is XAU":"The code XAU is XAIR USA."}}},
{"id":"n-4e683e75","guard":[["has","slc"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Salsa d\\\\'Haiti."]},["sense.lastWord"]],"mem":null},
{"id":"n-529250ad","guard":[["hasAny",["airline","code","has","icao","sqc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code SQC":"The code SQC is Singapore Airlines Cargo."}}},
{"id":"n-5450e93e","guard":[["has","tra"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Transavia Holland."]},["sense.lastWord"]],"mem":null},
{"id":"n-54725a59","guard":[["has","knd"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kan Air."]},["sense.lastWord"]],"mem":null},
{"id":"n-54f86d3a","guard":[["has","axl"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Exel."]},["sense.lastWord"]],"mem":null},
{"id":"n-56413a3a","guard":[["hasAny",["airline","code","name","tht"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code THT":"The code THT is Air Tahiti Nui."}}},
{"id":"n-566d5751","guard":[["has","btq"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Boutique Air (Priv)."]},["sense.lastWord"]],"mem":null},
{"id":"n-56d883af","guard":[["hasAny",["airline","aui"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is AUI":"The code AUI is Ukraine International Airlines."}}},
{"id":"n-57b37719","guard":[["hasAny",["airline","code","name","ram"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code RAM":"The code RAM is Royal Air Maroc."}}},
{"id":"n-5915119b","guard":[["has","mph"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["sense.lastWord"]],"mem":null},
{"id":"n-5989c4ca","guard":[["has","mna"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Merpati Nusantara Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-5c1b1c5e","guard":[["hasAny",["airline","code","name","rla"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code RLA":"The code RLA is Airlinair."}}},
{"id":"n-5df26a71","guard":[["has","lbc"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Albanian Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-5f9ec669","guard":[["has","ual"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is United Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-6199467a","guard":[["hasAny",["airline","say"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is SAY":"The code SAY is ScotAirways."}}},
{"id":"n-61f3f93a","guard":[["hasAny",["abq","airline"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is ABQ":"The code ABQ is Airblue."}}},
{"id":"n-63a6b3f4","guard":[["hasAny",["airline","code","name","tra"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code TRA":"The code TRA is Transavia Holland."}}},
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
{"id":"n-7899089c","guard":[["hasAny",["airline","mph"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is MPH":"The code MPH is Martinair."}}},
{"id":"n-79c74770","guard":[["hasAny",["airline","code","gft","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code GFT":"The code GFT is Gulfstream International Airlines."}}},
{"id":"n-7c88c46b","guard":[["has","pti"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Privatair."]},["sense.lastWord"]],"mem":null},
{"id":"n-7cd2acdc","guard":[["has","sqc"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Singapore Airlines Cargo."]},["sense.lastWord"]],"mem":null},
{"id":"n-7dbc479c","guard":[["has","njs"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["sense.lastWord"]],"mem":null},
{"id":"n-8121cefb","guard":[["has","jef"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Jetflite."]},["sense.lastWord"]],"mem":null},
{"id":"n-834e7f3b","guard":[["hasAny",["airline","code","name","otg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code OTG":"The code OTG is One Two Go Airlines."}}},
{"id":"n-83ee9620","guard":[["has","hbr"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Hebradran Air Services."]},["sense.lastWord"]],"mem":null},
{"id":"n-84d9d3f8","guard":[["hasAny",["airline","code","name","slc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code SLC":"The code SLC is Salsa d\\\\'Haiti."}}},
{"id":"n-858d9cb0","guard":[["hasAny",["airline","sxr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is SXR":"The code SXR is Sky Express."}}},
{"id":"n-8a615add","guard":[["hasAny",["airline","blf","code","has","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code BLF":"The code BLF is Blue1."}}},
{"id":"n-8dcde17b","guard":[["hasAny",["airline","code","name","obs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code OBS":"The code OBS is Orbest."}}},
{"id":"n-909228c6","guard":[["hasAny",["airline","awe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is AWE":"The code AWE is America West Airlines."}}},
{"id":"n-9306ec62","guard":[["hasAny",["airline","code","has","icao","tns"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code TNS":"The code TNS is Transilvania."}}},
{"id":"n-943246d5","guard":[["has","ndc"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is FlyNordic."]},["sense.lastWord"]],"mem":null},
{"id":"n-949b5ec6","guard":[["hasAny",["airline","code","mah","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code MAH":"The code MAH is Malév."}}},
{"id":"n-94ad6b36","guard":[["hasAny",["airline","code","ela","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code ELA":"The code ELA is Eastland Air."}}},
{"id":"n-95295fd6","guard":[["hasAny",["airline","code","doa","has","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code DOA":"The code DOA is Dominicana de Aviaci."}}},
{"id":"n-960298ae","guard":[["hasAny",["airline","ant"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is ANT":"The code ANT is Air North Charter - Canada."}}},
{"id":"n-972f6daa","guard":[["has","won"],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Wings Air."]},["sense.lastWord"]],"mem":null},
{"id":"n-977a4e41","guard":[["hasAny",["airline","code","hbr","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code HBR":"The code HBR is Hebradran Air Services."}}},
{"id":"n-9b0009a6","guard":[["has","mwa"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Midwest Airlines (Egypt)."]},["sense.lastWord"]],"mem":null},
{"id":"n-9b63aefa","guard":[["has","vgn"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Virgin Nigeria Airways."]},["sense.lastWord"]],"mem":null},
{"id":"n-9eaaa612","guard":[["has","bta"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["sense.lastWord"]],"mem":null},
{"id":"n-a3f14067","guard":[["hasAny",["airline","code","has","icao","won"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code WON":"The code WON is Wings Air."}}},
{"id":"n-a8dfb9d0","guard":[["hasAny",["airline","code","has","icao","xsr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code XSR":"The code XSR is Executive AirShare."}}},
{"id":"n-ac1b8d21","guard":[["hasAny",["airline","code","has","icao","pqw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code PQW":"The code PQW is PanAm World Airways."}}},
{"id":"n-ad4b8c6d","guard":[["has","lni"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Lion Mentari Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-adabe353","guard":[["hasAny",["airline","fta"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is FTA":"The code FTA is Frontier Flying Service."}}},
{"id":"n-add24705","guard":[["hasAny",["airline","code","name","pfl"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code PFL":"The code PFL is Pacific Flier."}}},
{"id":"n-b075a5c2","guard":[["hasAny",["airline","code","has","icao","mna"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code MNA":"The code MNA is Merpati Nusantara Airlines."}}},
{"id":"n-b0ffa37c","guard":[["hasAny",["airline","code","has","hmr","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code HMR":"The code HMR is North American Charters."}}},
{"id":"n-b2533b25","guard":[["hasAny",["airline","axb","code","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code AXB":"The code AXB is Air India Express."}}},
{"id":"n-b3002d20","guard":[["hasAny",["airline","vrn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is VRN":"The code VRN is VRG Linhas Aereas."}}},
{"id":"n-b484b47c","guard":[["hasAny",["airline","bta"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is BTA":"The code BTA is ExpressJet."}}},
{"id":"n-b5258563","guard":[["has","iaw"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Iraqi Airways."]},["sense.lastWord"]],"mem":null},
{"id":"n-b7ca9292","guard":[["hasAny",["airline","ssv"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is SSV":"The code SSV is Skyservice Airlines."}}},
{"id":"n-b8361009","guard":[["hasAny",["airline","code","name","vgn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code VGN":"The code VGN is Virgin Nigeria Airways."}}},
{"id":"n-b8c44acf","guard":[["has","kry"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Russkie Krylya."]},["sense.lastWord"]],"mem":null},
{"id":"n-b98c0dc0","guard":[["hasAny",["airline","code","has","icao","rya"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code RYA":"The code RYA is Ryan Air Services."}}},
{"id":"n-bcccea76","guard":[["hasAny",["airline","code","lbc","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code LBC":"The code LBC is Albanian Airlines."}}},
{"id":"n-c076214a","guard":[["hasAny",["airline","code","has","icao","sha"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code SHA":"The code SHA is Sharp Airlines."}}},
{"id":"n-c12c39ca","guard":[["hasAny",["airline","code","has","icao","sxs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code SXS":"The code SXS is SunExpress."}}},
{"id":"n-c43c7b98","guard":[["hasAny",["airline","brg","code","has","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code BRG":"The code BRG is Bering Air."}}},
{"id":"n-c4b62cb2","guard":[["hasAny",["airline","ceb","code","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code CEB":"The code CEB is Cebu Pacific."}}},
{"id":"n-c61439af","guard":[["has","xsr"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Executive AirShare."]},["sense.lastWord"]],"mem":null},
{"id":"n-c667a509","guard":[["hasAny",["airline","lni"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is LNI":"The code LNI is Lion Mentari Airlines."}}},
{"id":"n-c6ba61ec","guard":[["has","aes"],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ACES Colombia."]},["sense.lastWord"]],"mem":null},
{"id":"n-c85c8c9c","guard":[["hasAny",["airline","code","has","icao","ual"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code UAL":"The code UAL is United Airlines."}}},
{"id":"n-c8e5c680","guard":[["has","ssv"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Skyservice Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-c9ca0fbb","guard":[["has","hcw"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Star1 Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-cb5bae7e","guard":[["hasAny",["airline","akl","code","has","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code AKL":"The code AKL is Air Kiribati."}}},
{"id":"n-cbc2fdbf","guard":[["hasAny",["airline","cub"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is CUB":"The code CUB is Cubana de Aviación."}}},
{"id":"n-cbdb5b19","guard":[["has","zna"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Zenith International Airline."]},["sense.lastWord"]],"mem":null},
{"id":"n-d071759c","guard":[["has","xau"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["sense.lastWord"]],"mem":null},
{"id":"n-d40b3090","guard":[["has","pqw"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is PanAm World Airways."]},["sense.lastWord"]],"mem":null},
{"id":"n-d4e5ff37","guard":[["hasAny",["airline","code","jor","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code JOR":"The code JOR is Blue Air."}}},
{"id":"n-d58758ec","guard":[["hasAny",["airline","code","name","thi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code THI":"The code THI is TransHolding."}}},
{"id":"n-d826bfeb","guard":[["hasAny",["airline","code","has","icao","udn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code UDN":"The code UDN is Dniproavia."}}},
{"id":"n-d82ab5a9","guard":[["has","bze"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is BRAZIL AIR."]},["sense.lastWord"]],"mem":null},
{"id":"n-d8b941ae","guard":[["has","lmm"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LCM AIRLINES."]},["sense.lastWord"]],"mem":null},
{"id":"n-da50760a","guard":[["hasAny",["airline","iaw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is IAW":"The code IAW is Iraqi Airways."}}},
{"id":"n-da8f926e","guard":[["has","blf"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Blue1."]},["sense.lastWord"]],"mem":null},
{"id":"n-dd7a913f","guard":[["hasAny",["airline","code","has","icao","zxy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code ZXY":"The code ZXY is Japan Regio."}}},
{"id":"n-e04cf2fe","guard":[["has","akl"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Kiribati."]},["sense.lastWord"]],"mem":null},
{"id":"n-e0b467ef","guard":[["has","sxr"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["sense.lastWord"]],"mem":null},
{"id":"n-e28ab7b3","guard":[["has","hcc"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Holidays Czech Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-e39e0b77","guard":[["hasAny",["airline","code","has","icao","zna"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code ZNA":"The code ZNA is Zenith International Airline."}}},
{"id":"n-e5af1f09","guard":[["hasAny",["airline","code","has","icao","mxi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code MXI":"The code MXI is MexicanaLink."}}},
{"id":"n-e616ec40","guard":[["hasAny",["airline","til"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is TIL":"The code TIL is Tajikistan International Airlines."}}},
{"id":"n-e947efc3","guard":[["has","oae"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Omni Air International."]},["sense.lastWord"]],"mem":null},
{"id":"n-ecbc02aa","guard":[["has","sgg"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["sense.lastWord"]],"mem":null},
{"id":"n-ed3db5d4","guard":[["hasAny",["airline","arg","code","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code ARG":"The code ARG is Aerolineas Argentinas."}}},
{"id":"n-ed81c674","guard":[["has","abq"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airblue."]},["sense.lastWord"]],"mem":null},
{"id":"n-ee6c9ed5","guard":[["has","thk"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Turk Hava Kurumu Hava Taksi Isletmesi."]},["sense.lastWord"]],"mem":null},
{"id":"n-eea68697","guard":[["hasAny",["airline","code","has","icao","jkk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code JKK":"The code JKK is Spanair."}}},
{"id":"n-efac28a7","guard":[["has","amu"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Macau."]},["sense.lastWord"]],"mem":null},
{"id":"n-effeda3f","guard":[["hasAny",["airline","axl","code","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code AXL":"The code AXL is Air Exel."}}},
{"id":"n-f42722d7","guard":[["hasAny",["airline","code","name","vvc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code VVC":"The code VVC is VivaColombia."}}},
{"id":"n-f4b98712","guard":[["hasAny",["airline","code","has","icao","mdo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code MDO":"The code MDO is Domenican Airlines."}}},
{"id":"n-f5f3d6d2","guard":[["hasAny",["airline","ndc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is NDC":"The code NDC is FlyNordic."}}},
{"id":"n-f8d18022","guard":[["has","mxi"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is MexicanaLink."]},["sense.lastWord"]],"mem":null},
{"id":"n-fc639c5b","guard":[["hasAny",["aes","airline","code","has","icao"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code AES":"The code AES is ACES Colombia."}}},
{"id":"n-fdcabe33","guard":[["hasAny",["airline","code","has","icao","kry"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which airline has the ICAO code KRY":"The code KRY is Russkie Krylya."}}},
{"id":"n-fe857740","guard":[["hasAny",["airline","fab"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what airline is FAB":"The code FAB is First Air."}}},
{"id":"n-feacdc2c","guard":[["hasAny",["airline","code","name","one"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the airline with the code ONE":"The code ONE is Oceanair."}}},
{"id":"n-02681fe7","guard":[["hasAny",["lower case","lowercase","njs","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-02fa1340","guard":[["has","fab"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is First Air."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-03ac48eb","guard":[["hasAny",["ika","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Itek Air."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-08368883","guard":[["hasAny",["fza","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Fuzhou Airlines."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-08a042f9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sxr","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0bcd8bd1","guard":[["hasAny",["ndc","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is FlyNordic."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0d9e7e61","guard":[["hasAny",["lni","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Lion Mentari Airlines."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-109025a9","guard":[["hasAny",["lmm","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LCM AIRLINES."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-13a982a9","guard":[["hasAny",["lower case","lowercase","mwa","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Midwest Airlines (Egypt)."]},["transform.lower",["sense.lastWord"]]],"mem":null},
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
{"id":"n-2c755da7","guard":[["has","vrn"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VRG Linhas Aereas."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-2e3a933b","guard":[["hasAny",["njs","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-304642d6","guard":[["hasAny",["amu","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Macau."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-319fd25c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mph","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-39d7fdea","guard":[["hasAny",["abq","capitalise","capitalize","capitalize each word","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airblue."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3a678960","guard":[["has","mph"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-3be51835","guard":[["has","flg"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-3c02c19f","guard":[["hasAny",["no vowels","remove vowels","sgg","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-3c8b8c9a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fta","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Frontier Flying Service."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-41796072","guard":[["hasAny",["lower case","lowercase","small letters","vrn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VRG Linhas Aereas."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-48ece9a2","guard":[["has","iaw"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Iraqi Airways."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-4b050d31","guard":[["has","ant"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air North Charter - Canada."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-4c3b4698","guard":[["hasAny",["awe","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is America West Airlines."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5bd6d669","guard":[["has","sxr"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-5e7451f3","guard":[["hasAny",["mph","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-60c8aa6f","guard":[["hasAny",["bta","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-62c2dad2","guard":[["has","njs"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-65187dbc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","xau"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-673648ec","guard":[["hasAny",["fta","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Frontier Flying Service."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6b3e230a","guard":[["hasAny",["njs","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-6d6cd533","guard":[["hasAny",["pel","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aeropelican Air Services."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6da52b5c","guard":[["hasAny",["shortest","shortest one","shortest word","ssv"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Skyservice Airlines."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-701dfb9b","guard":[["hasAny",["jef","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Jetflite."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-78422bf4","guard":[["hasAny",["lower case","lowercase","pel","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aeropelican Air Services."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-78671609","guard":[["hasAny",["flg","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7cd3af91","guard":[["has","pel"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aeropelican Air Services."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-7f567495","guard":[["has","abq"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airblue."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-7f7f19ed","guard":[["has","xau"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-81ea4ae3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mwa","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Midwest Airlines (Egypt)."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-86882165","guard":[["hasAny",["lower case","lowercase","small letters","ssv"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Skyservice Airlines."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-870c4645","guard":[["hasAny",["amu","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Macau."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-91a16775","guard":[["hasAny",["ksm","lower case","lowercase","small letters"]],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-91fdfa57","guard":[["has","fta"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Frontier Flying Service."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-927ea63b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sgg","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-97de3b08","guard":[["hasAny",["ksm","shortest","shortest one","shortest word"]],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9959789e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fza","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Fuzhou Airlines."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9b01af4b","guard":[["hasAny",["lmm","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LCM AIRLINES."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9cdca06f","guard":[["hasAny",["amu","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Macau."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9f7c887e","guard":[["hasAny",["ndc","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is FlyNordic."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-9f9fda4a","guard":[["hasAny",["shortest","shortest one","shortest word","xau"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9fb9bf88","guard":[["hasAny",["flg","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-a2a2eaa7","guard":[["has","ksm"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-a4468132","guard":[["hasAny",["mph","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-a44f15e9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lni","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Lion Mentari Airlines."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a68948ff","guard":[["hasAny",["lower case","lowercase","ndc","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is FlyNordic."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a6960eda","guard":[["hasAny",["no vowels","remove vowels","sxr","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-a7822390","guard":[["has","lni"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Lion Mentari Airlines."]},["sense.after",{"lit":"is"}]],"mem":null},
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
{"id":"n-cc1f2f92","guard":[["hasAny",["bta","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cf44119c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ika","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Itek Air."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d0ac2939","guard":[["hasAny",["ksm","no vowels","remove vowels","without vowels"]],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-d10c10c8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","flg","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d28f0c4d","guard":[["hasAny",["bta","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d3eddf56","guard":[["hasAny",["lower case","lowercase","small letters","sxr"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d6dd2bf4","guard":[["hasAny",["lower case","lowercase","sgg","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-da9a74b8","guard":[["hasAny",["lmm","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LCM AIRLINES."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-daaac255","guard":[["hasAny",["abq","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airblue."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-db6e11cb","guard":[["hasAny",["lower case","lowercase","small letters","xau"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-dc916ca9","guard":[["hasAny",["iaw","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Iraqi Airways."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-dee5ce5d","guard":[["has","fza"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Fuzhou Airlines."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-e48edf25","guard":[["has","aui"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Ukraine International Airlines."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-e651ede4","guard":[["hasAny",["sgg","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-eb8599c2","guard":[["hasAny",["awe","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is America West Airlines."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ee0dbd37","guard":[["has","bta"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-ee1018ab","guard":[["hasAny",["no vowels","remove vowels","vrn","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VRG Linhas Aereas."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-f2a0d02a","guard":[["hasAny",["awe","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is America West Airlines."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f8726bd1","guard":[["hasAny",["mwa","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Midwest Airlines (Egypt)."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fb6def7d","guard":[["hasAny",["shortest","shortest one","shortest word","sxr"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fc76b386","guard":[["hasAny",["capitalise","capitalize","capitalize each word","njs","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fcd98d66","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ssv","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Skyservice Airlines."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fe8df490","guard":[["hasAny",["flg","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0328b991","guard":[["hasAny",["awe","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is America West Airlines."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0a830c9c","guard":[["hasAny",["each word","flg","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0bdd020c","guard":[["hasAny",["each word","njs","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0e245656","guard":[["hasAny",["lower case","lowercase","small letters","ssv"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Skyservice Airlines."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-141f12bf","guard":[["hasAny",["each word","split into words","xau"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-186336d9","guard":[["hasAny",["amu","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Macau."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1e706f19","guard":[["hasAny",["fta","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Frontier Flying Service."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-201e5b44","guard":[["hasAny",["each word","iaw","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Iraqi Airways."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-256ad3b0","guard":[["hasAny",["each word","ika","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Itek Air."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2cd62efa","guard":[["hasAny",["each word","fta","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Frontier Flying Service."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2e1354aa","guard":[["hasAny",["bcc","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is BusinessAir."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-35646f5b","guard":[["hasAny",["each word","lni","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Lion Mentari Airlines."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-380a25aa","guard":[["hasAny",["jef","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Jetflite."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-3ba8a997","guard":[["hasAny",["item number","nth","position","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," WON is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3ce37e98","guard":[["hasAny",["each word","jef","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Jetflite."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3f0f74ce","guard":[["hasAny",["flg","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-40723422","guard":[["hasAny",["ksm","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-42c6ebdf","guard":[["hasAny",["each word","split into words","sxr"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-457c2d2e","guard":[["hasAny",["lower case","lowercase","small letters","vrn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VRG Linhas Aereas."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-4626c415","guard":[["hasAny",["each word","sgg","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-47eb13f4","guard":[["hasAny",["lower case","lowercase","small letters","sxr"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-4953eda1","guard":[["hasAny",["each word","split into words","sxr"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Sky Express."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-57e6d35f","guard":[["hasAny",["each word","fza","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Fuzhou Airlines."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5922722e","guard":[["hasAny",["each word","split into words","ssv"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Skyservice Airlines."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5c4362ac","guard":[["hasAny",["lower case","lowercase","njs","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-5fa49947","guard":[["hasAny",["iaw","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Iraqi Airways."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-6016503e","guard":[["hasAny",["abq","each word","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airblue."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-619f5635","guard":[["hasAny",["each word","mph","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-61c7624a","guard":[["hasAny",["each word","iaw","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Iraqi Airways."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-66867e3f","guard":[["hasAny",["abq","each word","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airblue."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-70179bf4","guard":[["hasAny",["each word","pel","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aeropelican Air Services."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-75c285e9","guard":[["hasAny",["fza","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Fuzhou Airlines."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-7e9eeb3c","guard":[["hasAny",["bta","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7f8d34ff","guard":[["hasAny",["each word","flg","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Pinnacle Airlines."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8270c35c","guard":[["hasAny",["each word","mwa","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Midwest Airlines (Egypt)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-829f35e4","guard":[["hasAny",["item number","nth","position","vvc"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," VVC is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-84b83c6d","guard":[["hasAny",["each word","lmm","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LCM AIRLINES."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-85c4b4c8","guard":[["hasAny",["lower case","lowercase","small letters","xau"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-87f32321","guard":[["hasAny",["each word","pel","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aeropelican Air Services."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8bacb2c4","guard":[["hasAny",["each word","fta","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Frontier Flying Service."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8fdd89c6","guard":[["hasAny",["amu","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Macau."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-91a00ba9","guard":[["hasAny",["abq","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Airblue."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-94346972","guard":[["hasAny",["ant","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air North Charter - Canada."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-973f05ae","guard":[["hasAny",["bta","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-989ddb2d","guard":[["hasAny",["lmm","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LCM AIRLINES."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-98e16f07","guard":[["hasAny",["each word","ika","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Itek Air."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9aef6cdc","guard":[["hasAny",["fab","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is First Air."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-9bb0af49","guard":[["hasAny",["each word","mwa","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Midwest Airlines (Egypt)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a0d1e08e","guard":[["hasAny",["item number","nth","position","sol"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SOL is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a3293fd0","guard":[["hasAny",["each word","split into words","xau"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is XAIR USA."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a6265fd2","guard":[["hasAny",["amu","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Air Macau."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-aa2354de","guard":[["hasAny",["lower case","lowercase","mwa","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Midwest Airlines (Egypt)."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-acda2962","guard":[["hasAny",["awe","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is America West Airlines."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b273bef6","guard":[["hasAny",["each word","sgg","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b4f429fc","guard":[["hasAny",["each word","lmm","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is LCM AIRLINES."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ba357ae5","guard":[["hasAny",["each word","ksm","split into words"]],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bf1bf077","guard":[["hasAny",["aui","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Ukraine International Airlines."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-bfc5c484","guard":[["hasAny",["each word","split into words","vrn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VRG Linhas Aereas."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c3adbcc1","guard":[["hasAny",["each word","lni","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Lion Mentari Airlines."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c58468ff","guard":[["hasAny",["each word","ksm","split into words"]],["has","airline"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Kosmos."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cd87f590","guard":[["hasAny",["each word","mph","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cf6d04df","guard":[["hasAny",["each word","njs","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is National Jet Systems."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d34fdd6f","guard":[["hasAny",["bta","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is ExpressJet."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d771f73b","guard":[["hasAny",["lower case","lowercase","ndc","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is FlyNordic."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-db0f39f0","guard":[["hasAny",["each word","ndc","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is FlyNordic."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-deb8d4f7","guard":[["hasAny",["lower case","lowercase","sgg","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Senegal Airlines."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ec382aff","guard":[["hasAny",["each word","fza","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Fuzhou Airlines."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ec625b75","guard":[["hasAny",["lni","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Lion Mentari Airlines."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ecdc176c","guard":[["hasAny",["each word","split into words","ssv"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Skyservice Airlines."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-eea56e66","guard":[["hasAny",["awe","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is America West Airlines."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ef1be611","guard":[["hasAny",["each word","split into words","vrn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is VRG Linhas Aereas."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-efef1397","guard":[["hasAny",["lower case","lowercase","pel","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Aeropelican Air Services."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-f8cc4d82","guard":[["hasAny",["each word","jef","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Jetflite."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f9a49a72","guard":[["hasAny",["lower case","lowercase","mph","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Martinair."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-fb5972e0","guard":[["hasAny",["each word","ndc","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is FlyNordic."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fbabdcf4","guard":[["hasAny",["ika","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," is Itek Air."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-fc8eab31","guard":[["hasAny",["aes","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AES is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3022d99e","guard":[["hasAny",["aes","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-3bcfc82e","guard":[["hasAny",["item number","nth","position","vvc"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-57e54101","guard":[["hasAny",["item number","nth","position","sol"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-912acaf9","guard":[["hasAny",["item number","nth","position","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-02b3d56e","guard":[["hasAny",["element","item number","jba","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Helijet."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-07579fe7","guard":[["hasAny",["axl","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Exel."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-099dc215","guard":[["hasAny",["element","item number","lxp","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is LAN Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-169ffecb","guard":[["hasAny",["element","esk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SkyEurope."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-20a77c30","guard":[["hasAny",["element","item number","nth","position","tht"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Tahiti Nui."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-21611257","guard":[["hasAny",["element","item number","mld","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Moldova."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-2a9eca3d","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2cb78229","guard":[["hasAny",["element","item number","nth","one","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Oceanair."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-2e33bb48","guard":[["hasAny",["element","gft","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Gulfstream International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-30872945","guard":[["hasAny",["btq","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Boutique Air (Priv)."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-319cb4d9","guard":[["hasAny",["element","item number","nth","position","ual"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is United Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-335ff0e3","guard":[["hasAny",["element","item number","nth","position","pti"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Privatair."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-368a6eed","guard":[["hasAny",["bze","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BRAZIL AIR."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-3833720e","guard":[["hasAny",["element","item number","mic","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Mint Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-3a9b4b34","guard":[["hasAny",["ceb","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cebu Pacific."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-3deb3c4e","guard":[["hasAny",["element","item number","nth","position","tns"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transilvania."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-40c74bf7","guard":[["hasAny",["ela","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Eastland Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-43cf273d","guard":[["hasAny",["element","ger","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is German International Air Lines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-4908445a","guard":[["hasAny",["element","item number","mxi","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MexicanaLink."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-575e10b4","guard":[["hasAny",["element","item number","kry","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Russkie Krylya."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-5b68f73c","guard":[["hasAny",["brg","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Bering Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-5ee753cf","guard":[["hasAny",["eal","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is European Air Express."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-5f6d672f","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","vvc"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6553540a","guard":[["hasAny",["element","item number","nth","position","thi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TransHolding."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-66c28a6e","guard":[["hasAny",["element","item number","nth","obs","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Orbest."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-66e5b285","guard":[["hasAny",["element","item number","nth","position","sqc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Singapore Airlines Cargo."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-73ae297a","guard":[["hasAny",["element","item number","nth","oae","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Omni Air International."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-74900571","guard":[["hasAny",["element","item number","nth","position","pqw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PanAm World Airways."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-77f91b88","guard":[["hasAny",["element","item number","nth","position","thk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Turk Hava Kurumu Hava Taksi Isletmesi."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-791433f7","guard":[["hasAny",["element","item number","nth","position","zxy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Japan Regio."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-7aff92c4","guard":[["hasAny",["element","item number","nth","pia","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pakistan International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-7e1c3c3c","guard":[["hasAny",["aes","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-916f84fc","guard":[["hasAny",["element","item number","nth","pfl","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pacific Flier."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-953b1d30","guard":[["hasAny",["element","item number","jkk","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Spanair."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-95d9b6cf","guard":[["hasAny",["aes","item number","lower case","lowercase","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9790c79d","guard":[["hasAny",["element","hcc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Holidays Czech Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-97976f79","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","vvc"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a33348f6","guard":[["hasAny",["element","item number","nth","position","vvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-a457c311","guard":[["hasAny",["element","item number","nth","oom","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zoom Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-a68216b4","guard":[["hasAny",["element","item number","nth","otg","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is One Two Go Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-ab728b58","guard":[["hasAny",["element","item number","nth","position","sxs"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SunExpress."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-b5a43d24","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c0f4186c","guard":[["hasAny",["blf","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue1."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-c1a93598","guard":[["hasAny",["element","item number","mah","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Malév."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-c458e500","guard":[["hasAny",["element","item number","nth","position","zna"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zenith International Airline."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-c52a014f","guard":[["hasAny",["element","item number","nth","position","rla"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Airlinair."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-c7bdc3c0","guard":[["hasAny",["element","item number","nth","position","vgn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Virgin Nigeria Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-c8ed5b07","guard":[["hasAny",["ber","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Berlin."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-ca0f2177","guard":[["hasAny",["element","item number","lbc","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Albanian Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-cb30d695","guard":[["hasAny",["element","item number","mdo","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Domenican Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-cc0f0705","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","sol"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cdbb304f","guard":[["hasAny",["element","item number","nth","position","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-d7104a76","guard":[["hasAny",["element","item number","knd","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kan Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-d9aa7191","guard":[["hasAny",["doa","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dominicana de Aviaci."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-dced53ed","guard":[["hasAny",["element","item number","nth","position","xsr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Executive AirShare."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-dffaac97","guard":[["hasAny",["element","gfy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Greenfly."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-e1934c55","guard":[["hasAny",["axb","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air India Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-e480bb0e","guard":[["hasAny",["element","item number","nth","position","ram"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Royal Air Maroc."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-e54b56d2","guard":[["hasAny",["element","item number","mna","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Merpati Nusantara Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-e939f725","guard":[["hasAny",["element","hbr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hebradran Air Services."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-e94a59e7","guard":[["hasAny",["element","item number","nth","position","udn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dniproavia."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-eba187b1","guard":[["hasAny",["element","item number","jor","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-ed64638e","guard":[["hasAny",["element","hcw","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Star1 Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-f33823c9","guard":[["hasAny",["akl","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Kiribati."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-f412cf2b","guard":[["hasAny",["element","item number","kkk","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Atlasjet."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-f82bc50d","guard":[["hasAny",["element","hmr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is North American Charters."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-f86294a0","guard":[["hasAny",["element","item number","nth","position","rya"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ryan Air Services."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-f924bb1c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","sol","title case"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f9909d4b","guard":[["hasAny",["aes","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fc8b2ba3","guard":[["hasAny",["element","item number","nth","position","slc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Salsa d\\\\'Haiti."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-ff6e478e","guard":[["hasAny",["element","item number","nth","position","sol"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-ff8060f0","guard":[["hasAny",["element","item number","nth","position","tra"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transavia Holland."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-025cd59e","guard":[["hasAny",["axb","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air India Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-0793a4de","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","mah","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Malév."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-0872ec2b","guard":[["hasAny",["akl","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Kiribati."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-0a229747","guard":[["hasAny",["element","item number","lower case","lowercase","mxi","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MexicanaLink."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-0b2ebfb4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","pti","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Privatair."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-0bac4875","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","thk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Turk Hava Kurumu Hava Taksi Isletmesi."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-0dc1088a","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","zxy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Japan Regio."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-102a41e8","guard":[["hasAny",["element","item number","lower case","lowercase","mld","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Moldova."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-11a1f23b","guard":[["hasAny",["element","hmr","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is North American Charters."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-13878fda","guard":[["hasAny",["each word","item number","nth","position","split into words","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-17ff1225","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","gfy","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Greenfly."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-1a101582","guard":[["hasAny",["element","item number","lower case","lowercase","mic","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Mint Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-1b6fe421","guard":[["hasAny",["akl","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Kiribati."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-1d7b9610","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","xsr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Executive AirShare."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-1da8858a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","xsr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Executive AirShare."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-1f3810f5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","pqw","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PanAm World Airways."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-22897ff4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","mna","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Merpati Nusantara Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-24f9a443","guard":[["hasAny",["ber","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Berlin."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-2c352e77","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","gft","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Gulfstream International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-2e3a8283","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","udn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dniproavia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-2e6e7be7","guard":[["hasAny",["blf","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue1."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-3192582e","guard":[["hasAny",["element","item number","kkk","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Atlasjet."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-322024c9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","hcc","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Holidays Czech Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-3346a91d","guard":[["hasAny",["ger","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is German International Air Lines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-34855651","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","thk","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Turk Hava Kurumu Hava Taksi Isletmesi."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-35c794a8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","mld","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Moldova."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-35dc3179","guard":[["hasAny",["aes","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-3719301a","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","sqc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Singapore Airlines Cargo."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-3949185a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","otg","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is One Two Go Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-39a7d516","guard":[["hasAny",["each word","item number","nth","position","split into words","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-39f67041","guard":[["hasAny",["each word","item number","nth","position","split into words","vvc"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3ac50f80","guard":[["hasAny",["axl","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Exel."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-3c5503db","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","tra"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transavia Holland."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-3c9deb5e","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","pqw","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PanAm World Airways."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-3de83e2c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ceb","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Cebu Pacific."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-40ba0beb","guard":[["hasAny",["ela","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Eastland Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-41ab6471","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","oom","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zoom Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-4535684e","guard":[["hasAny",["element","item number","lbc","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Albanian Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-4adfe25b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","eal","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is European Air Express."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-4b9b06e6","guard":[["hasAny",["element","esk","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SkyEurope."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-4c017d72","guard":[["hasAny",["brg","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Bering Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-4d1b836a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","hbr","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hebradran Air Services."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-54ddee18","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","ual"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is United Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-56bc08e4","guard":[["hasAny",["aes","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ACES Colombia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-5994b7ad","guard":[["hasAny",["each word","item number","nth","position","sol","split into words"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5b251247","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","sol"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-5dba50f2","guard":[["hasAny",["element","item number","lower case","lowercase","nth","obs","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Orbest."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-5ea142e2","guard":[["hasAny",["element","item number","jkk","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Spanair."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-5f9768e2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","mic","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Mint Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-60611ab3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","mdo","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Domenican Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-63e43ec6","guard":[["hasAny",["eal","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is European Air Express."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-6ebd7bc2","guard":[["hasAny",["element","hbr","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Hebradran Air Services."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-6f241da9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","doa","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dominicana de Aviaci."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-700365d6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","thi","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TransHolding."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-7134c75c","guard":[["hasAny",["bze","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BRAZIL AIR."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-718755ca","guard":[["hasAny",["element","item number","lower case","lowercase","nth","oom","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zoom Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-72185045","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","jkk","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Spanair."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-7316c4dd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","vvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-7404f35b","guard":[["hasAny",["element","item number","knd","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kan Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-74fa796e","guard":[["hasAny",["element","item number","jba","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Helijet."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-77b435da","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","rya","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ryan Air Services."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-7848df68","guard":[["hasAny",["element","ger","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is German International Air Lines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-784fa258","guard":[["hasAny",["btq","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Boutique Air (Priv)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-7946bd1b","guard":[["hasAny",["each word","item number","nth","position","sol","split into words"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Solomon Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-79a1bebe","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","pia","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pakistan International Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-7eb0a04f","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","ual"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is United Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-81fc6f8a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","pfl","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pacific Flier."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-82c46c58","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","esk","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SkyEurope."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-839eb4ed","guard":[["hasAny",["element","item number","lower case","lowercase","lxp","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is LAN Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-85b9ed5a","guard":[["hasAny",["axl","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Exel."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-86df7e2d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","lxp","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is LAN Express."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-8942c32b","guard":[["hasAny",["ber","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Berlin."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-8a90ed61","guard":[["hasAny",["each word","item number","nth","position","split into words","vvc"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8abdb3c9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","knd","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kan Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-8b0018b8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","hcw","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Star1 Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-8d4be05f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","tht","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Air Tahiti Nui."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-91371f5e","guard":[["hasAny",["doa","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dominicana de Aviaci."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-913b8220","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","won"]],["has","airline"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Wings Air."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-91de7ddd","guard":[["hasAny",["element","hcw","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Star1 Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-976f76c9","guard":[["hasAny",["element","item number","lower case","lowercase","mdo","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Domenican Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-9b9f16ee","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","mxi","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MexicanaLink."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-9c4e8e6b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","kry","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Russkie Krylya."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-9cf74bf9","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","rla","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Airlinair."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-9deb77cd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","rya","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ryan Air Services."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-9ff01e96","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","vgn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Virgin Nigeria Airways."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-a3b69e1f","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","vvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VivaColombia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-a4d49516","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","tns"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Transilvania."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-a69239a7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","zna"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zenith International Airline."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-a6e854fa","guard":[["hasAny",["element","item number","lower case","lowercase","nth","pfl","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Pacific Flier."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-a76b0f4a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","udn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dniproavia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-a9076790","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","kkk","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Atlasjet."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-aa2978e5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","slc","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Salsa d\\\\'Haiti."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-aa83c574","guard":[["hasAny",["element","item number","lower case","lowercase","nth","otg","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is One Two Go Airlines."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-aba1589d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","jor","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-b3f6a24d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ela","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Eastland Air."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-b4d9fd17","guard":[["hasAny",["blf","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blue1."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-b52e54ab","guard":[["hasAny",["element","hcc","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Holidays Czech Airlines."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the airline with the code AIA","expect":{"contains":["Avies"],"notRefusal":true}},{"q":"name the airline with the code HBR","expect":{"contains":["Hebradran Air Services"],"notRefusal":true}},{"q":"name the airline with the code AXL","expect":{"contains":["Air Exel"],"notRefusal":true}},{"q":"name the airline with the code ONE","expect":{"contains":["Oceanair"],"notRefusal":true}},{"q":"name the airline with the code RLA","expect":{"contains":["Airlinair"],"notRefusal":true}},{"q":"what airline is SSV","expect":{"contains":["Skyservice Airlines"],"notRefusal":true}},{"q":"which airline has the ICAO code HCW","expect":{"contains":["Star1 Airlines"],"notRefusal":true}},{"q":"what airline is ANT","expect":{"contains":["Air North Charter - Canada"],"notRefusal":true}},{"q":"what airline is NDC","expect":{"contains":["FlyNordic"],"notRefusal":true}},{"q":"name the airline with the code SLC","expect":{"contains":["Salsa d\\\\'Haiti"],"notRefusal":true}},{"q":"what airline is AMU","expect":{"contains":["Air Macau"],"notRefusal":true}},{"q":"what airline is FAB","expect":{"contains":["First Air"],"notRefusal":true}},{"q":"what airline is IKA","expect":{"contains":["Itek Air"],"notRefusal":true}},{"q":"name the airline with the code KND","expect":{"contains":["Kan Air"],"notRefusal":true}},{"q":"which airline has the ICAO code GFY","expect":{"contains":["Greenfly"],"notRefusal":true}},{"q":"what airline is TIL","expect":{"contains":["Tajikistan International Airlines"],"notRefusal":true}},{"q":"which airline has the ICAO code SOL","expect":{"contains":["Solomon Airlines"],"notRefusal":true}},{"q":"which airline has the ICAO code RYA","expect":{"contains":["Ryan Air Services"],"notRefusal":true}},{"q":"which airline has the ICAO code UAL","expect":{"contains":["United Airlines"],"notRefusal":true}},{"q":"which airline has the ICAO code AES","expect":{"contains":["ACES Colombia"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
