// country-of-code-e7a9-rev-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"country-of-code-e7a9-rev-neo-g10","class":"country-of-code-e7a9-rev","generation":10,"lane":"neo","grownFrom":["name the code whose country is Algeria","which code has the country Costa Rica","name the code whose country is North Macedonia","Liberia is the country of which code","name the code whose country is Ireland","Benin is the country of which code","which code has the country Tanzania","Marshall Islands is the country of which code","which code has the country El Salvador","name the code whose country is Nigeria","which code has the country Bulgaria","name the code whose country is Chad","which code has the country Bosnia and Herzegovina","which code has the country Libya","North Korea is the country of which code","which code has the country Samoa","Chile is the country of which code","which code has the country Iraq","name the code whose country is St. Kitts and Nevis","name the code whose country is Honduras"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-country-lists-4a59d2","columns":["code","country"],"n":199,"cols":[{"s":"AF|AL|DZ|AD|AO|AG|AR|AM|AU|AT|AZ|BS|BH|BD|BB|BY|BE|BZ|BJ|BT|BO|BA|BW|BR|BN|BG|BF|BI|KH|CM|CA|CV|CF|TD|CL|CN|CO|KM|CD|CG|CR|CI|HR|CU|CY|CZ|DK|DJ|DM|DO|EC|EG|SV|GQ|ER|EE|ET|FJ|FI|FR|GA|GE|DE|GH|GR|GD|GT|GN|GW|GY|HT|HN|HK|HU|IS|IN|ID|IR|IQ|IE|IL|IT|JM|JP|JO|KZ|KE|KI|XK|KW|KG|LA|LV|LB|LS|LR|LY|LI|LT|LU|MO|MG|MW|MY|MV|ML|MT|MH|MR|MU|MX|FM|MD|MC|MN|ME|MA|MZ|MM|NA|NR|NP|NL|NZ|NI|NE|NG|KP|MK|NO|OM|PK|PW|PS|PA|PG|PY|PE|PH|PL|PT|QA|RO|RU|RW|WS|SM|ST|SA|SN|RS|SC|SL|SG|SK|SI|SB|SO|ZA|KR|SS|ES|LK|KN|LC|VC|SD|SR|SE|CH|SY|TW|TJ|TZ|TH|GM|TL|TG|TO|TT|TN|TM|TV|TR|UG|UA|AE|GB|US|UY|UZ|VU|VA|VE|VN|YE|ZM|ZW|SZ","sep":"|"},{"f":"0Afghanistan|1lbania|2geria|1ndorra|2gola|2tigua and Barbuda|1rgentina|2menia|1ustralia|5ia|1zerbaijan|0Bahamas|3rain|2ngladesh|2rbados|1elarus|3gium|3ize|2nin|1hutan|1olivia|2snia and Herzegovina|2tswana|1razil|2unei|1ulgaria|2rkina Faso|3undi|0Cambodia|3eroon|2nada|2pe Verde Islands|1entral African Republic|1had|2ile|3na|1olombia|2moro Islands|2ngo (Dem. Rep.)|7Rep.)|2sta Rica|2te d'Ivoire|1roatia|1uba|1yprus|1zechia|0Denmark|1jibouti|1ominica|8n Republic|0Ecuador|1gypt|1l Salvador|1quatorial Guinea|1ritrea|1stonia|1thiopia|0Fiji|2nland|1rance|0Gabon|1eorgia|2rmany|1hana|1reece|3nada|1uatemala|2inea|6-Bissau|2yana|0Haiti|1onduras|3g Kong (SAR China)|1ungary|0Iceland|1ndia|3onesia|1ran|3q|2eland|1srael|1taly|0Jamaica|2pan|1ordan|0Kazakhstan|1enya|1iribati|1osovo|1uwait|1yrgyzstan|0Laos|2tvia|1ebanon|2sotho|1iberia|3ya|2echtenstein|2thuania|1uxembourg|0Macao (SAR China)|2dagascar|2lawi|4ysia|3dives|3i|3ta|2rshall Islands|2uritania|6ius|1exico|1icronesia|1oldova|2naco|3golia|3tenegro|2rocco|2zambique|1yanmar|0Namibia|2uru|1epal|2therlands|2w Zealand|1icaragua|2ger|5ia|1orth Korea|6Macedonia|3way|0Oman|0Pakistan|2lau Islands|3estinian Territory|2nama|2pua New Guinea|2raguay|1eru|1hilippines|1oland|2rtugal|0Qatar|0Romania|1ussian Federation|1wanda|0Samoa|2n Marino|2o Tome and Principe|2udi Arabia|1enegal|2rbia|2ychelles|1ierra Leone|2ngapore|1lovakia|4enia|1olomon Islands|2malia|2uth Africa|6Korea|6Sudan|1pain|1ri Lanka|1t. Kitts and Nevis|4Lucia|4Vincent and the Grenadines|1udan|2riname|1weden|2itzerland|1yria|0Taiwan (Chinese Taipei)|2jikistan|2nzania|1hailand|2e Gambia|1imor-Leste|1ogo|2nga|1rinidad and Tobago|1unisia|2rkmenistan|2valu|1ürkiye|0Uganda|1kraine|1nited Arab Emirates|7Kingdom|7States|1ruguay|1zbekistan|0Vanuatu|2tican City|1enezuela|1ietnam|0Yemen|0Zambia|1imbabwe|0eSwatini","sep":"|"}]}]);
const COLONY = [
{"id":"n-865c744e","guard":[["has","code"],["not",["has","me"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"code"}]]],"mem":{"table":{"whose country is Algeria":"The code whose country is Algeria is DZ.","has the country Costa Rica":"The code whose country is Costa Rica is CR.","whose country is North Macedonia":"The code whose country is North Macedonia is MK.","whose country is Ireland":"The code whose country is Ireland is IE.","has the country Tanzania":"The code whose country is Tanzania is TZ.","has the country El Salvador":"The code whose country is El Salvador is SV.","whose country is Nigeria":"The code whose country is Nigeria is NG.","has the country Bulgaria":"The code whose country is Bulgaria is BG.","whose country is Chad":"The code whose country is Chad is TD.","has the country Bosnia and Herzegovina":"The code whose country is Bosnia and Herzegovina is BA.","has the country Libya":"The code whose country is Libya is LY.","has the country Samoa":"The code whose country is Samoa is WS.","has the country Iraq":"The code whose country is Iraq is IQ.","whose country is St. Kitts and Nevis":"The code whose country is St. Kitts and Nevis is KN.","whose country is Honduras":"The code whose country is Honduras is HN.","has the country Spain":"The code whose country is Spain is ES.","whose country is Ukraine":"The code whose country is Ukraine is UA.","has the country Togo":"The code whose country is Togo is TG.","whose country is Cameroon":"The code whose country is Cameroon is CM.","has the country Kuwait":"The code whose country is Kuwait is KW.","whose country is Moldova":"The code whose country is Moldova is MD.","has the country Netherlands":"The code whose country is Netherlands is NL.","has the country Poland":"The code whose country is Poland is PL.","whose country is eSwatini":"The code whose country is eSwatini is SZ.","whose country is Bahrain":"The code whose country is Bahrain is BH.","has the country Mauritania":"The code whose country is Mauritania is MR.","whose country is United Arab Emirates":"The code whose country is United Arab Emirates is AE.","has the country Madagascar":"The code whose country is Madagascar is MG.","has the country Burundi":"The code whose country is Burundi is BI.","has the country St. Vincent and the Grenadines":"The code whose country is St. Vincent and the Grenadines is VC.","whose country is Suriname":"The code whose country is Suriname is SR.","whose country is Sao Tome and Principe":"The code whose country is Sao Tome and Principe is ST.","has the country New Zealand":"The code whose country is New Zealand is NZ.","whose country is Myanmar":"The code whose country is Myanmar is MM.","whose country is Lesotho":"The code whose country is Lesotho is LS.","has the country Haiti":"The code whose country is Haiti is HT.","has the country Nauru":"The code whose country is Nauru is NR.","whose country is San Marino":"The code whose country is San Marino is SM.","whose country is Portugal":"The code whose country is Portugal is PT.","whose country is Guyana":"The code whose country is Guyana is GY.","has the country Montenegro":"The code whose country is Montenegro is ME.","has the country Papua New Guinea":"The code whose country is Papua New Guinea is PG.","has the country Guinea-Bissau":"The code whose country is Guinea-Bissau is GW.","has the country Zimbabwe":"The code whose country is Zimbabwe is ZW."}}},
{"id":"n-32acc0a7","guard":[["hasAny",["element","has","item number","nth","position"]],["has","code"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"country"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-eaa08022","guard":[["hasAny",["element","has","item number","lower case","lowercase","nth","position","small letters"]],["has","code"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.after",{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-c16068e8","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"of"}]]],"mem":{"table":{"Liberia is the country":"The code whose country is Liberia is LR.","Benin is the country":"The code whose country is Benin is BJ.","Marshall Islands is the country":"The code whose country is Marshall Islands is MH.","North Korea is the country":"The code whose country is North Korea is KP.","Chile is the country":"The code whose country is Chile is CL.","Sudan is the country":"The code whose country is Sudan is SD.","Seychelles is the country":"The code whose country is Seychelles is SC.","Andorra is the country":"The code whose country is Andorra is AD.","Pakistan is the country":"The code whose country is Pakistan is PK.","Slovakia is the country":"The code whose country is Slovakia is SK.","Bangladesh is the country":"The code whose country is Bangladesh is BD.","Sierra Leone is the country":"The code whose country is Sierra Leone is SL.","Congo (Dem. Rep.) is the country":"The code whose country is Congo (Dem. Rep.) is CD.","Senegal is the country":"The code whose country is Senegal is SN.","Monaco is the country":"The code whose country is Monaco is MC.","Tunisia is the country":"The code whose country is Tunisia is TN.","Turkmenistan is the country":"The code whose country is Turkmenistan is TM.","China is the country":"The code whose country is China is CN.","Cambodia is the country":"The code whose country is Cambodia is KH.","Fiji is the country":"The code whose country is Fiji is FJ.","Malta is the country":"The code whose country is Malta is MT.","Timor-Leste is the country":"The code whose country is Timor-Leste is TL."}}},
{"id":"n-c614fe1d","guard":[["hasAny",["bangladesh","bulgaria","congo","element","eswatini","fiji","guineabissau","item number","leone","liberia","marino","moldova","netherlands","no vowels","nth","portugal","position","principe","remove vowels","samoa","senegal","slovakia","st","tanzania","togo","tunisia","without vowels"]],["has","country"],["has","code"],["has","the"],["words<=",10],["not",["has","american"]],["nums==",0]],"pyramid":["render.code",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-4c1efe9c","guard":[["hasAny",["bangladesh","bulgaria","class name","congo","element","eswatini","fiji","guineabissau","item number","leone","liberia","marino","moldova","netherlands","no vowels","nth","pascal case","pascalcase","portugal","position","principe","remove vowels","samoa","senegal","slovakia","st","tanzania","togo","tunisia","upper camel case","without vowels"]],["has","country"],["has","code"],["has","the"],["words<=",10],["not",["has","american"]],["nums==",0]],"pyramid":["render.code",["transform.noVowels",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-a1d74402","guard":[["hasAny",["bangladesh","bulgaria","congo","element","eswatini","fiji","guineabissau","item number","leone","liberia","lower case","lowercase","marino","moldova","netherlands","no vowels","nth","portugal","position","principe","remove vowels","samoa","senegal","slovakia","small letters","st","tanzania","togo","tunisia","without vowels"]],["has","country"],["has","code"],["has","the"],["words<=",10],["not",["has","american"]],["nums==",0]],"pyramid":["render.code",["transform.lower",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-c6bb3a08","guard":[["hasAny",["bangladesh","benin","cambodia","chile","china","congo","element","fiji","islands","item number","korea","leone","liberia","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","sudan","timorleste","tunisia","turkmenistan"]],["has","country"],["has","is"],["has","which"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose country is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-8af9d593","guard":[["hasAny",["bulgaria","burundi","costa","el","element","guineabissau","haiti","item number","kuwait","libya","madagascar","mauritania","montenegro","netherlands","new","normalise","normalize","nth","poland","position","samoa","simplify the text","spain","tanzania","togo"]],["has","country"],["has","has"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-053320dd","guard":[["hasAny",["code","count","element","how many","how many items","item number","normalise","normalize","nth","number of items","position","simplify the text"]],["has","which"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-9335911d","guard":[["hasAny",["code","count","element","how many","how many items","item number","normalise","normalize","nth","number of items","position","simplify the text"]],["has","which"]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-0298e89c","guard":[["hasAny",["bangladesh","bosnia","bulgaria","burundi","congo","element","fiji","guineabissau","item number","leone","liberia","netherlands","normalise","normalize","nth","position","senegal","simplify the text","slovakia","spain","st","tanzania","togo","tunisia"]],["has","country"],["has","code"],["words<=",10],["has","the"],["not",["has","burkina"]],["not",["has","african"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}],{"lit":2}]],"mem":null},
{"id":"n-ce0f4d5d","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","element","fiji","item number","liberia","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","sudan","timorleste","tunisia","turkmenistan"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The code whose ",{"slot":0}," is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-0ce4cef9","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","element","fiji","item number","liberia","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","sudan","timorleste","tunisia","turkmenistan"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.and",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-3a4146b5","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","element","fiji","item number","liberia","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","sudan","timorleste","tunisia","turkmenistan"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-8c3df1fd","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","element","fiji","item number","liberia","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","sudan","timorleste","tunisia","turkmenistan"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-06bce554","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","class name","element","fiji","item number","liberia","malta","monaco","nth","pakistan","pascal case","pascalcase","position","senegal","seychelles","slovakia","sudan","timorleste","tunisia","turkmenistan","upper camel case"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-29742f6f","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","element","fiji","item number","liberia","lower case","lowercase","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","small letters","sudan","timorleste","tunisia","turkmenistan"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-492869e2","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","camel case","camelcase","chile","china","element","fiji","item number","liberia","lower camel case","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","sudan","timorleste","tunisia","turkmenistan"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.camel",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-6854d005","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","camel case","camelcase","chile","china","element","fiji","item number","liberia","lower camel case","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","sudan","timorleste","tunisia","turkmenistan"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-77df9fef","guard":[["hasAny",["all caps","andorra","bangladesh","benin","cambodia","capital letters","capitals","chile","china","element","fiji","item number","liberia","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","sudan","timorleste","tunisia","turkmenistan","upper case","uppercase"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.upper",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-960b8dff","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","class name","element","fiji","item number","liberia","malta","monaco","nth","pakistan","pascal case","pascalcase","position","senegal","seychelles","slovakia","sudan","timorleste","tunisia","turkmenistan","upper camel case"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-a25bf3f3","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","element","fiji","item number","liberia","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","sudan","timorleste","tunisia","turkmenistan"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-ec8a8ed5","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","element","fiji","invert case","item number","liberia","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","sudan","swap case","timorleste","toggle case","tunisia","turkmenistan"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-fd0b9f60","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","capitalise","capitalize","capitalize each word","chile","china","element","fiji","item number","liberia","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","sudan","timorleste","title case","tunisia","turkmenistan"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-133d1a6e","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","each word","element","fiji","item number","liberia","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","split into words","sudan","timorleste","tunisia","turkmenistan","words"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-3a44be04","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","element","fiji","item number","liberia","malta","monaco","nth","pakistan","position","reverse the words","reverse word order","senegal","seychelles","slovakia","sudan","timorleste","tunisia","turkmenistan","words backwards"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-3cd0e8dd","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","each word","element","fiji","item number","liberia","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","split into words","sudan","timorleste","tunisia","turkmenistan","words"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-420468e3","guard":[["hasAny",["all caps","andorra","bangladesh","benin","cambodia","capital letters","capitals","chile","china","element","fiji","item number","liberia","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","sudan","timorleste","tunisia","turkmenistan","upper case","uppercase"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-71422571","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","each word","element","fiji","item number","liberia","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","split into words","sudan","timorleste","tunisia","turkmenistan","words"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-7e498f43","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","each word","element","fiji","item number","liberia","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","split into words","sudan","timorleste","tunisia","turkmenistan","words"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-907f47b0","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","dashes","element","fiji","hyphens","item number","kebab case","kebabcase","liberia","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","slug","sudan","timorleste","tunisia","turkmenistan"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.kebab",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-928b3713","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","capitalise","capitalize","capitalize each word","chile","china","element","fiji","item number","liberia","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","sudan","timorleste","title case","tunisia","turkmenistan"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-978230a7","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","element","fiji","item number","liberia","lower case","lowercase","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","small letters","sudan","timorleste","tunisia","turkmenistan"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-ecd7ac02","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","element","fiji","invert case","item number","liberia","malta","monaco","nth","pakistan","position","senegal","seychelles","slovakia","sudan","swap case","timorleste","toggle case","tunisia","turkmenistan"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-005f63bd","guard":[["hasAny",["andorra","bangladesh","benin","cambodia","chile","china","element","fiji","item number","liberia","malta","monaco","normalise","normalize","nth","pakistan","position","senegal","seychelles","simplify the text","slovakia","sudan","timorleste","tunisia","turkmenistan"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-8613308f","guard":[["hasAny",["bulgaria","burundi","dashes","element","guineabissau","haiti","hyphens","iraq","item number","kebab case","kebabcase","kuwait","libya","madagascar","mauritania","montenegro","nauru","netherlands","nth","poland","position","samoa","slug","spain","tanzania","togo","zimbabwe"]],["has","country"],["words<=",6],["has","which"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.kebab",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-8a6b77c1","guard":[["hasAny",["bulgaria","burundi","element","guineabissau","haiti","iraq","item number","kuwait","libya","madagascar","mauritania","montenegro","nauru","netherlands","nth","poland","position","reverse the words","reverse word order","samoa","spain","tanzania","togo","words backwards","zimbabwe"]],["has","country"],["words<=",6],["has","which"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-557d14e4","guard":[["hasAny",["bulgaria","burundi","element","haiti","iraq","item number","kuwait","libya","madagascar","mauritania","montenegro","nauru","netherlands","nth","poland","position","samoa","spain","tanzania","togo","zimbabwe"]],["has","country"],["words<=",6],["has","which"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-33d35ec3","guard":[["hasAny",["bulgaria","burundi","element","haiti","iraq","item number","kuwait","libya","lower case","lowercase","madagascar","mauritania","montenegro","nauru","netherlands","nth","poland","position","samoa","small letters","spain","tanzania","togo","zimbabwe"]],["has","country"],["words<=",6],["has","which"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-66517292","guard":[["hasAny",["bulgaria","burundi","class name","element","haiti","iraq","item number","kuwait","libya","madagascar","mauritania","montenegro","nauru","netherlands","nth","pascal case","pascalcase","poland","position","samoa","spain","tanzania","togo","upper camel case","zimbabwe"]],["has","country"],["words<=",6],["has","which"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.pascal",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-8360cc18","guard":[["hasAny",["bulgaria","burundi","camel case","camelcase","element","haiti","iraq","item number","kuwait","libya","lower camel case","madagascar","mauritania","montenegro","nauru","netherlands","nth","poland","position","samoa","spain","tanzania","togo","zimbabwe"]],["has","country"],["words<=",6],["has","which"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-3d8ed1ce","guard":[["hasAny",["bangladesh","benin","cambodia","chile","china","element","fiji","item number","liberia","malta","monaco","no vowels","nth","pakistan","position","remove vowels","senegal","seychelles","slovakia","sudan","timorleste","tunisia","turkmenistan","without vowels"]],["has","country"],["has","is"],["has","which"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-ff5e0cd1","guard":[["hasAny",["bulgaria","costa","el","element","grenadines","guineabissau","haiti","item number","kuwait","libya","madagascar","mauritania","netherlands","new","no vowels","nth","poland","position","remove vowels","samoa","tanzania","togo","without vowels"]],["has","country"],["has","has"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-ec5433bd","guard":[["hasAny",["algeria","arab","bahrain","chad","element","eswatini","guyana","ireland","item number","lesotho","macedonia","marino","moldova","myanmar","nigeria","normalise","normalize","nth","portugal","position","simplify the text","suriname","ukraine"]],["has","country"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-a0fcf0f5","guard":[["hasAny",["bangladesh","bulgaria","congo","element","fiji","guineabissau","item number","leone","liberia","netherlands","no vowels","nth","position","remove vowels","senegal","slovakia","st","tanzania","togo","tunisia","without vowels"]],["has","country"],["has","code"],["words<=",10],["has","the"],["not",["has","burkina"]],["not",["has","african"]]],"pyramid":["render.str",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-2c3dba9c","guard":[["hasAny",["bangladesh","bulgaria","class name","congo","element","fiji","guineabissau","item number","leone","liberia","netherlands","no vowels","nth","pascal case","pascalcase","position","remove vowels","senegal","slovakia","st","tanzania","togo","tunisia","upper camel case","without vowels"]],["has","country"],["has","code"],["words<=",10],["has","the"],["not",["has","burkina"]],["not",["has","african"]]],"pyramid":["render.code",["transform.pascal",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-60b92d3e","guard":[["hasAny",["bangladesh","bulgaria","class name","congo","element","fiji","guineabissau","item number","leone","liberia","netherlands","no vowels","nth","pascal case","pascalcase","position","remove vowels","senegal","slovakia","st","tanzania","togo","tunisia","upper camel case","without vowels"]],["has","country"],["has","code"],["words<=",10],["has","the"],["not",["has","burkina"]],["not",["has","african"]]],"pyramid":["render.str",["transform.pascal",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-a47a3484","guard":[["hasAny",["bangladesh","bulgaria","class name","congo","element","fiji","guineabissau","item number","leone","liberia","netherlands","no vowels","nth","pascal case","pascalcase","position","remove vowels","senegal","slovakia","st","tanzania","togo","tunisia","upper camel case","without vowels"]],["has","country"],["has","code"],["words<=",10],["has","the"],["not",["has","burkina"]],["not",["has","african"]]],"pyramid":["render.str",["transform.noVowels",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-b43edb99","guard":[["hasAny",["bangladesh","bulgaria","camel case","camelcase","congo","element","fiji","guineabissau","item number","leone","liberia","lower camel case","netherlands","no vowels","nth","position","remove vowels","senegal","slovakia","st","tanzania","togo","tunisia","without vowels"]],["has","country"],["has","code"],["words<=",10],["has","the"],["not",["has","burkina"]],["not",["has","african"]]],"pyramid":["render.str",["transform.camel",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-bc382217","guard":[["hasAny",["bangladesh","bulgaria","camel case","camelcase","congo","element","fiji","guineabissau","item number","leone","liberia","lower camel case","netherlands","no vowels","nth","position","remove vowels","senegal","slovakia","st","tanzania","togo","tunisia","without vowels"]],["has","country"],["has","code"],["words<=",10],["has","the"],["not",["has","burkina"]],["not",["has","african"]]],"pyramid":["render.code",["transform.camel",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-42c3665e","guard":[["hasAny",["algeria","bahrain","cameroon","chad","element","eswatini","guyana","honduras","ireland","item number","lesotho","moldova","myanmar","nigeria","nth","portugal","position","suriname","ukraine"]],["has","country"],["has","whose"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-0ac235e9","guard":[["hasAny",["algeria","bahrain","camel case","camelcase","cameroon","chad","element","eswatini","guyana","honduras","ireland","item number","lesotho","lower camel case","moldova","myanmar","nigeria","nth","portugal","position","suriname","ukraine"]],["has","country"],["has","whose"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-db54572b","guard":[["hasAny",["algeria","bahrain","cameroon","chad","element","eswatini","guyana","honduras","ireland","item number","lesotho","lower case","lowercase","moldova","myanmar","nigeria","nth","portugal","position","small letters","suriname","ukraine"]],["has","country"],["has","whose"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-f8252a72","guard":[["hasAny",["algeria","bahrain","cameroon","chad","class name","element","eswatini","guyana","honduras","ireland","item number","lesotho","moldova","myanmar","nigeria","nth","pascal case","pascalcase","portugal","position","suriname","ukraine","upper camel case"]],["has","country"],["has","whose"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.pascal",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-1af701de","guard":[["hasAny",["algeria","bahrain","chad","element","eswatini","guyana","item number","kitts","lesotho","macedonia","marino","moldova","myanmar","nigeria","no vowels","nth","portugal","position","principe","remove vowels","suriname","without vowels"]],["has","country"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-17dbc8be","guard":[["hasAny",["alphabetize the letters","arab","bangladesh","bulgaria","burundi","congo","element","eswatini","fiji","guineabissau","item number","kitts","letters in order","liberia","nth","portugal","position","principe","sort the letters","spain","tanzania"]],["has","country"],["has","code"],["nums==",0],["has","the"],["words<=",10]],"pyramid":["render.str",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-eb2132a8","guard":[["hasAny",["alphabetize the letters","arab","bangladesh","bulgaria","burundi","congo","element","eswatini","fiji","guineabissau","item number","kitts","letters in order","liberia","nth","portugal","position","principe","sort the letters","spain","tanzania"]],["has","country"],["has","code"],["nums==",0],["has","the"],["words<=",10]],"pyramid":["render.code",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-13ce51fc","guard":[["hasAny",["alphabetize the letters","arab","bangladesh","bulgaria","burundi","class name","congo","element","eswatini","fiji","guineabissau","item number","kitts","letters in order","liberia","nth","pascal case","pascalcase","portugal","position","principe","sort the letters","spain","tanzania","upper camel case"]],["has","country"],["has","code"],["nums==",0],["has","the"],["words<=",10]],"pyramid":["render.str",["transform.pascal",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-6d7a9500","guard":[["hasAny",["alphabetize the letters","arab","bangladesh","bulgaria","burundi","camel case","camelcase","congo","element","eswatini","fiji","guineabissau","item number","kitts","letters in order","liberia","lower camel case","nth","portugal","position","principe","sort the letters","spain","tanzania"]],["has","country"],["has","code"],["nums==",0],["has","the"],["words<=",10]],"pyramid":["render.code",["transform.camel",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-8a05f1f3","guard":[["hasAny",["alphabetize the letters","arab","bangladesh","bulgaria","burundi","class name","congo","element","eswatini","fiji","guineabissau","item number","kitts","letters in order","liberia","nth","pascal case","pascalcase","portugal","position","principe","sort the letters","spain","tanzania","upper camel case"]],["has","country"],["has","code"],["nums==",0],["has","the"],["words<=",10]],"pyramid":["render.code",["transform.pascal",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-9cd3ed91","guard":[["hasAny",["alphabetize the letters","arab","bangladesh","bulgaria","burundi","camel case","camelcase","congo","element","eswatini","fiji","guineabissau","item number","kitts","letters in order","liberia","lower camel case","nth","portugal","position","principe","sort the letters","spain","tanzania"]],["has","country"],["has","code"],["nums==",0],["has","the"],["words<=",10]],"pyramid":["render.str",["transform.camel",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-0db30093","guard":[["hasAny",["alphabetize the letters","bulgaria","burundi","costa","el","element","guineabissau","haiti","iraq","item number","kuwait","letters in order","libya","mauritania","nauru","nth","position","sort the letters","spain","tanzania","zealand"]],["has","country"],["has","has"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-a570066b","guard":[["hasAny",["algeria","bahrain","chad","element","guyana","ireland","item number","kitts","lesotho","longest","longest one","longest word","marino","moldova","myanmar","nigeria","nth","position","ukraine"]],["has","country"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-bc08fe7e","guard":[["hasAny",["alphabetize the letters","bangladesh","bulgaria","congo","element","eswatini","fiji","guineabissau","item number","kitts","letters in order","liberia","no vowels","nth","portugal","position","principe","remove vowels","sort the letters","tanzania","without vowels"]],["has","country"],["has","code"],["nums==",0],["has","the"],["words<=",10]],"pyramid":["render.code",["transform.noVowels",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-ec87b113","guard":[["hasAny",["alphabetize the letters","bangladesh","bulgaria","congo","element","eswatini","fiji","guineabissau","item number","kitts","letters in order","liberia","no vowels","nth","portugal","position","principe","remove vowels","sort the letters","tanzania","without vowels"]],["has","country"],["has","code"],["nums==",0],["has","the"],["words<=",10]],"pyramid":["render.str",["transform.noVowels",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-1b7938b7","guard":[["hasAny",["burundi","congo","element","fiji","item number","kitts","leone","longest","longest one","longest word","marino","moldova","nth","position","samoa","spain","togo","ukraine"]],["has","country"],["has","code"],["nums==",0],["has","the"],["not",["has","american"]],["words<=",10]],"pyramid":["render.template",{"lit":["The code whose ",{"slot":0}," is ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-3c1da843","guard":[["hasAny",["andorra","bangladesh","cambodia","element","item number","liberia","longest","longest one","longest word","nth","pakistan","position","senegal","seychelles","slovakia","timorleste","tunisia","turkmenistan"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-9cee467c","guard":[["hasAny",["burundi","costa","element","haiti","item number","kuwait","libya","longest","longest one","longest word","new","nth","poland","position","samoa","spain","togo"]],["has","country"],["has","has"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-13a2ff14","guard":[["hasAny",["benin","chile","china","congo","element","fiji","item number","korea","leone","longest","longest one","longest word","malta","monaco","nth","position","sudan"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.and",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-9b052260","guard":[["hasAny",["benin","chile","china","congo","element","fiji","item number","korea","leone","longest","longest one","longest word","malta","monaco","nth","position","sudan"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-08bb2240","guard":[["hasAny",["benin","chile","china","class name","congo","element","fiji","item number","korea","leone","longest","longest one","longest word","malta","monaco","nth","pascal case","pascalcase","position","sudan","upper camel case"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-12feded5","guard":[["hasAny",["benin","chile","china","congo","element","fiji","item number","korea","leone","longest","longest one","longest word","malta","monaco","no vowels","nth","position","remove vowels","sudan","without vowels"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-26020002","guard":[["hasAny",["benin","camel case","camelcase","chile","china","congo","element","fiji","item number","korea","leone","longest","longest one","longest word","lower camel case","malta","monaco","nth","position","sudan"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-40b1d96d","guard":[["hasAny",["all caps","benin","capital letters","capitals","chile","china","congo","element","fiji","item number","korea","leone","longest","longest one","longest word","malta","monaco","nth","position","sudan","upper case","uppercase"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.upper",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-6931208d","guard":[["hasAny",["benin","chile","china","congo","element","fiji","item number","korea","leone","longest","longest one","longest word","malta","monaco","nth","position","sudan"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-6fdca132","guard":[["hasAny",["benin","camel case","camelcase","chile","china","congo","element","fiji","item number","korea","leone","longest","longest one","longest word","lower camel case","malta","monaco","nth","position","sudan"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.camel",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-93244e70","guard":[["hasAny",["benin","chile","china","congo","element","fiji","item number","korea","leone","longest","longest one","longest word","lower case","lowercase","malta","monaco","nth","position","small letters","sudan"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.lower",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-9b078ac7","guard":[["hasAny",["benin","chile","china","class name","congo","element","fiji","item number","korea","leone","longest","longest one","longest word","malta","monaco","nth","pascal case","pascalcase","position","sudan","upper camel case"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-e168435c","guard":[["hasAny",["benin","chile","china","congo","element","fiji","invert case","item number","korea","leone","longest","longest one","longest word","malta","monaco","nth","position","sudan","swap case","toggle case"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-fe444c67","guard":[["hasAny",["benin","capitalise","capitalize","capitalize each word","chile","china","congo","element","fiji","item number","korea","leone","longest","longest one","longest word","malta","monaco","nth","position","sudan","title case"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.title",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-1852daaf","guard":[["hasAny",["benin","chile","china","congo","each word","element","fiji","item number","korea","leone","longest","longest one","longest word","malta","monaco","nth","position","split into words","sudan","words"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-2053a723","guard":[["hasAny",["benin","chile","china","congo","each word","element","fiji","item number","korea","leone","longest","longest one","longest word","malta","monaco","nth","position","split into words","sudan","words"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.lastWord"]]],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-489e6910","guard":[["hasAny",["benin","chile","china","congo","element","fiji","invert case","item number","korea","leone","longest","longest one","longest word","malta","monaco","nth","position","sudan","swap case","toggle case"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-503e19c6","guard":[["hasAny",["all caps","benin","capital letters","capitals","chile","china","congo","element","fiji","item number","korea","leone","longest","longest one","longest word","malta","monaco","nth","position","sudan","upper case","uppercase"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-56af1115","guard":[["hasAny",["benin","capitalise","capitalize","capitalize each word","chile","china","congo","element","fiji","item number","korea","leone","longest","longest one","longest word","malta","monaco","nth","position","sudan","title case"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-b4d3a1a0","guard":[["hasAny",["benin","chile","china","congo","each word","element","fiji","item number","korea","leone","longest","longest one","longest word","malta","monaco","nth","position","split into words","sudan","words"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-b7439f50","guard":[["hasAny",["benin","chile","china","congo","each word","element","fiji","item number","korea","leone","longest","longest one","longest word","malta","monaco","nth","position","split into words","sudan","words"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.lastWord"]]],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-d97e2099","guard":[["hasAny",["benin","chile","china","congo","element","fiji","item number","korea","leone","longest","longest one","longest word","lower case","lowercase","malta","monaco","nth","position","small letters","sudan"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-3c38080f","guard":[["hasAny",["benin","chile","china","congo","element","fiji","item number","korea","leone","longest","longest one","longest word","malta","monaco","normalise","normalize","nth","position","simplify the text","sudan"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-cda0028d","guard":[["hasAny",["benin","chile","china","congo","element","fiji","item number","korea","leone","longest","longest one","longest word","malta","monaco","normalise","normalize","nth","position","simplify the text","sudan"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-f556a6f6","guard":[["hasAny",["algeria","alphabetize the letters","arab","bahrain","element","eswatini","guyana","item number","kitts","lesotho","letters in order","myanmar","nth","portugal","position","principe","sort the letters"]],["has","country"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-5a89e1e2","guard":[["hasAny",["benin","chile","china","congo","element","fiji","item number","join","joined with","korea","leone","longest","longest one","longest word","malta","monaco","nth","position","separated by","sudan"]],["has","which"],["has","country"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.join",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-bcfb4f79","guard":[["hasAny",["benin","chile","china","congo","element","fiji","item number","korea","leone","longest","longest one","longest word","malta","monaco","nth","position","separate by","split","split by","sudan"]],["has","which"],["has","country"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-d0a1b53f","guard":[["hasAny",["alphabetize the letters","andorra","bangladesh","benin","chile","china","element","fiji","item number","letters in order","liberia","malta","nth","position","sort the letters"]],["has","country"],["has","which"],["has","is"],["has","code"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-6f162ea5","guard":[["hasAny",["alphabetize the letters","benin","chile","china","congo","element","fiji","item number","korea","letters in order","longest","longest one","longest word","malta","nth","position","sort the letters"]],["has","country"],["has","which"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-5891fb36","guard":[["hasAny",["element","fiji","haiti","item number","nauru","no vowels","nth","position","remove vowels","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-649cad7b","guard":[["hasAny",["element","fiji","haiti","item number","nauru","no vowels","nth","position","remove vowels","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-01de9916","guard":[["hasAny",["element","fiji","haiti","item number","nauru","no vowels","nth","position","remove vowels","snake case","snakecase","togo","underscores","variable name","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.snake",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-03b9cabf","guard":[["hasAny",["camel case","camelcase","element","fiji","haiti","item number","lower camel case","nauru","no vowels","nth","position","remove vowels","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.noVowels",["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-06a4c5ea","guard":[["hasAny",["element","fiji","haiti","item number","lower case","lowercase","nauru","no vowels","nth","position","remove vowels","small letters","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.lower",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-0b2c7ab9","guard":[["hasAny",["all caps","capital letters","capitals","element","fiji","haiti","item number","nauru","no vowels","nth","position","remove vowels","togo","upper case","uppercase","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.noVowels",["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-177829ce","guard":[["hasAny",["element","fiji","haiti","item number","nauru","no vowels","nth","position","remove vowels","snake case","snakecase","togo","underscores","variable name","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.noVowels",["transform.snake",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-19be62f3","guard":[["hasAny",["dashes","element","fiji","haiti","hyphens","item number","kebab case","kebabcase","nauru","no vowels","nth","position","remove vowels","slug","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.noVowels",["transform.kebab",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-20863a70","guard":[["hasAny",["class name","element","fiji","haiti","item number","nauru","no vowels","nth","pascal case","pascalcase","position","remove vowels","togo","upper camel case","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.pascal",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-27e0ec5c","guard":[["hasAny",["element","fiji","haiti","item number","nauru","no vowels","nth","position","remove vowels","reverse the words","reverse word order","togo","without vowels","words backwards"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.noVowels",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-3f21419d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","fiji","haiti","item number","nauru","no vowels","nth","position","remove vowels","title case","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.noVowels",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-4e8391c2","guard":[["hasAny",["element","fiji","haiti","item number","nauru","no vowels","nth","position","remove vowels","snake case","snakecase","togo","underscores","variable name","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.snake",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-56c38edd","guard":[["hasAny",["each word","element","fiji","haiti","item number","nauru","no vowels","nth","position","remove vowels","split into words","togo","without vowels","words"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.and",["transform.words",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-59602abb","guard":[["hasAny",["camel case","camelcase","element","fiji","haiti","item number","lower camel case","nauru","no vowels","nth","position","remove vowels","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.camel",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-62161ea3","guard":[["hasAny",["alphabetize the letters","element","fiji","haiti","item number","letters in order","nauru","no vowels","nth","position","remove vowels","sort the letters","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.noVowels",["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-66742620","guard":[["hasAny",["class name","element","fiji","haiti","item number","nauru","no vowels","nth","pascal case","pascalcase","position","remove vowels","togo","upper camel case","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.noVowels",["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-7dfda8de","guard":[["hasAny",["class name","element","fiji","haiti","item number","nauru","no vowels","nth","pascal case","pascalcase","position","remove vowels","togo","upper camel case","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.noVowels",["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-84c8fb39","guard":[["hasAny",["dashes","element","fiji","haiti","hyphens","item number","kebab case","kebabcase","nauru","no vowels","nth","position","remove vowels","slug","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.kebab",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-897a34c6","guard":[["hasAny",["each word","element","fiji","haiti","item number","nauru","no vowels","nth","position","remove vowels","split into words","togo","without vowels","words"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.list",["transform.words",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-98f6be60","guard":[["hasAny",["element","fiji","haiti","item number","nauru","no vowels","nth","position","remove vowels","reverse the words","reverse word order","togo","without vowels","words backwards"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.noVowels",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-9ddd8e00","guard":[["hasAny",["element","fiji","haiti","item number","lower case","lowercase","nauru","no vowels","nth","position","remove vowels","small letters","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.lower",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-a1d5e46c","guard":[["hasAny",["alphabetize the letters","element","fiji","haiti","item number","letters in order","nauru","no vowels","nth","position","remove vowels","sort the letters","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.noVowels",["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-a5401041","guard":[["hasAny",["dashes","element","fiji","haiti","hyphens","item number","kebab case","kebabcase","nauru","no vowels","nth","position","remove vowels","slug","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.kebab",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-a601351c","guard":[["hasAny",["element","fiji","haiti","invert case","item number","nauru","no vowels","nth","position","remove vowels","swap case","toggle case","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.noVowels",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-a87a41c5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","fiji","haiti","item number","nauru","no vowels","nth","position","remove vowels","title case","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.title",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-ace4a0e1","guard":[["hasAny",["element","fiji","haiti","invert case","item number","nauru","no vowels","nth","position","remove vowels","swap case","toggle case","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.noVowels",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-c9dd7240","guard":[["hasAny",["all caps","capital letters","capitals","element","fiji","haiti","item number","nauru","no vowels","nth","position","remove vowels","togo","upper case","uppercase","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.noVowels",["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-cde3eddc","guard":[["hasAny",["each word","element","fiji","haiti","item number","nauru","no vowels","nth","position","remove vowels","split into words","togo","without vowels","words"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.lines",["transform.words",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-d4823229","guard":[["hasAny",["camel case","camelcase","element","fiji","haiti","item number","lower camel case","nauru","no vowels","nth","position","remove vowels","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.noVowels",["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-d6c4974f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","fiji","haiti","item number","nauru","no vowels","nth","position","remove vowels","title case","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.noVowels",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-dfb4a91e","guard":[["hasAny",["element","fiji","haiti","item number","nauru","no vowels","nth","position","remove vowels","snake case","snakecase","togo","underscores","variable name","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.noVowels",["transform.snake",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-ec291a89","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","fiji","haiti","item number","nauru","no vowels","nth","position","remove vowels","title case","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.title",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-f2a57163","guard":[["hasAny",["class name","element","fiji","haiti","item number","nauru","no vowels","nth","pascal case","pascalcase","position","remove vowels","togo","upper camel case","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.pascal",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-f994734f","guard":[["hasAny",["camel case","camelcase","element","fiji","haiti","item number","lower camel case","nauru","no vowels","nth","position","remove vowels","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.camel",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-fd5ebe8b","guard":[["hasAny",["dashes","element","fiji","haiti","hyphens","item number","kebab case","kebabcase","nauru","no vowels","nth","position","remove vowels","slug","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.noVowels",["transform.kebab",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-366a2c67","guard":[["hasAny",["element","fiji","haiti","item number","nauru","no vowels","normalise","normalize","nth","position","remove vowels","simplify the text","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.noVowels",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":2}]]],"mem":null},
{"id":"n-47004466","guard":[["hasAny",["element","fiji","haiti","item number","nauru","no vowels","normalise","normalize","nth","position","remove vowels","simplify the text","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.noVowels",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":2}]]],"mem":null},
{"id":"n-492d7eb7","guard":[["hasAny",["element","fiji","haiti","item number","nauru","no vowels","normalise","normalize","nth","position","remove vowels","simplify the text","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.noVowels",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":3}]]],"mem":null},
{"id":"n-5598ace7","guard":[["hasAny",["element","fiji","haiti","item number","nauru","no vowels","normalise","normalize","nth","position","remove vowels","simplify the text","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.norm",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],{"lit":3}]],"mem":null},
{"id":"n-77fc24d8","guard":[["hasAny",["element","fiji","haiti","item number","nauru","no vowels","normalise","normalize","nth","position","remove vowels","simplify the text","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.noVowels",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":3}]]],"mem":null},
{"id":"n-99261aac","guard":[["hasAny",["element","fiji","haiti","item number","nauru","no vowels","normalise","normalize","nth","position","remove vowels","simplify the text","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.norm",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],{"lit":3}]],"mem":null},
{"id":"n-9cecff04","guard":[["hasAny",["element","fiji","haiti","item number","nauru","no vowels","normalise","normalize","nth","position","remove vowels","simplify the text","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.code",["transform.noVowels",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":1}]]],"mem":null},
{"id":"n-a3296993","guard":[["hasAny",["element","fiji","haiti","item number","nauru","no vowels","normalise","normalize","nth","position","remove vowels","simplify the text","togo","without vowels"]],["has","country"],["has","code"],["has","which"],["words<=",7]],"pyramid":["render.str",["transform.noVowels",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":1}]]],"mem":null},
{"id":"n-0c1c267a","guard":[["hasAny",["abbreviate","acronym","costa","element","item number","leone","marino","nth","position"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.str",["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-56f6d9ee","guard":[["hasAny",["abbreviate","acronym","costa","element","item number","leone","marino","nth","position"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.code",["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-08061d87","guard":[["hasAny",["abbreviate","acronym","costa","element","item number","leone","marino","no vowels","nth","position","remove vowels","without vowels"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.code",["transform.noVowels",["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-0b1a8f10","guard":[["hasAny",["abbreviate","acronym","camel case","camelcase","costa","element","item number","leone","lower camel case","marino","nth","position"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.str",["transform.camel",["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-0bb6f0d2","guard":[["hasAny",["abbreviate","acronym","costa","element","first letters of the name","initials","item number","leone","marino","nth","position"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.code",["transform.acronym",["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-15742793","guard":[["hasAny",["abbreviate","acronym","camel case","camelcase","costa","element","item number","leone","lower camel case","marino","nth","position"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.code",["transform.camel",["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-1c485291","guard":[["hasAny",["abbreviate","acronym","class name","costa","element","item number","leone","marino","nth","pascal case","pascalcase","position","upper camel case"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.code",["transform.pascal",["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-6a6a9266","guard":[["hasAny",["abbreviate","acronym","costa","element","item number","leone","marino","no vowels","nth","position","remove vowels","without vowels"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.str",["transform.acronym",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-9089e79b","guard":[["hasAny",["class name","costa","element","first letters of the name","initials","item number","leone","marino","nth","pascal case","pascalcase","position","upper camel case"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.str",["transform.pascal",["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-93affbfc","guard":[["hasAny",["abbreviate","acronym","costa","dashes","element","hyphens","item number","kebab case","kebabcase","leone","marino","nth","position","slug"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.code",["transform.acronym",["transform.kebab",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-970e32cc","guard":[["hasAny",["camel case","camelcase","costa","element","first letters of the name","initials","item number","leone","lower camel case","marino","nth","position"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.str",["transform.camel",["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-9cbdb833","guard":[["hasAny",["abbreviate","acronym","costa","element","first letters of the name","initials","item number","leone","marino","nth","position"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.str",["transform.acronym",["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-a6355e11","guard":[["hasAny",["abbreviate","acronym","costa","element","item number","leone","marino","no vowels","nth","position","remove vowels","without vowels"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.code",["transform.acronym",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-ae866547","guard":[["hasAny",["abbreviate","acronym","costa","element","item number","leone","marino","no vowels","nth","position","remove vowels","without vowels"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.str",["transform.noVowels",["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-bbeaba85","guard":[["hasAny",["abbreviate","acronym","costa","dashes","element","hyphens","item number","kebab case","kebabcase","leone","marino","nth","position","slug"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.str",["transform.acronym",["transform.kebab",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-cf550984","guard":[["hasAny",["class name","costa","element","first letters of the name","initials","item number","leone","marino","nth","pascal case","pascalcase","position","upper camel case"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.code",["transform.pascal",["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-d3561717","guard":[["hasAny",["abbreviate","acronym","class name","costa","element","item number","leone","marino","nth","pascal case","pascalcase","position","upper camel case"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.str",["transform.pascal",["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-fe42e959","guard":[["hasAny",["camel case","camelcase","costa","element","first letters of the name","initials","item number","leone","lower camel case","marino","nth","position"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.code",["transform.camel",["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-10021e5a","guard":[["hasAny",["costa","element","first letters of the name","initials","item number","leone","marino","normalise","normalize","nth","position","simplify the text"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.str",["transform.norm",["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],{"lit":1}]],"mem":null},
{"id":"n-2b933910","guard":[["hasAny",["abbreviate","acronym","delete","element","item number","leone","nth","position","principe","remove","strip out","timorleste","without"]],["has","country"],["has","is"],["has","code"]],"pyramid":["render.str",["transform.acronym",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-2e844119","guard":[["hasAny",["costa","element","first letters of the name","initials","item number","leone","marino","normalise","normalize","nth","position","simplify the text"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.code",["transform.norm",["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],{"lit":2}]],"mem":null},
{"id":"n-35335167","guard":[["hasAny",["costa","element","first letters of the name","initials","item number","leone","marino","normalise","normalize","nth","position","simplify the text"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.code",["transform.norm",["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],{"lit":1}]],"mem":null},
{"id":"n-44fa61f1","guard":[["hasAny",["abbreviate","acronym","delete","element","item number","leone","nth","position","principe","remove","strip out","timorleste","without"]],["has","country"],["has","is"],["has","code"]],"pyramid":["render.code",["transform.acronym",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-566d68fd","guard":[["hasAny",["abbreviate","acronym","costa","element","item number","leone","marino","normalise","normalize","nth","position","simplify the text"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.str",["transform.acronym",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":1}]]],"mem":null},
{"id":"n-56ef876d","guard":[["hasAny",["abbreviate","acronym","costa","element","item number","leone","marino","normalise","normalize","nth","position","simplify the text"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.str",["transform.norm",["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],{"lit":2}]],"mem":null},
{"id":"n-8689143c","guard":[["hasAny",["abbreviate","acronym","append","combine","concatenate","costa","element","item number","leone","marino","nth","position","put together"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.str",["transform.acronym",["transform.concat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-89366fa8","guard":[["hasAny",["costa","element","first letters of the name","initials","item number","leone","marino","normalise","normalize","nth","position","simplify the text"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.str",["transform.norm",["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],{"lit":2}]],"mem":null},
{"id":"n-a55bdb69","guard":[["hasAny",["abbreviate","acronym","append","combine","concatenate","costa","element","item number","leone","marino","nth","position","put together"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.code",["transform.acronym",["transform.concat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-a8a6f008","guard":[["hasAny",["abbreviate","acronym","costa","element","item number","leone","marino","normalise","normalize","nth","position","simplify the text"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.code",["transform.acronym",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":1}]]],"mem":null},
{"id":"n-fe6b1e67","guard":[["hasAny",["abbreviate","acronym","costa","element","item number","leone","marino","normalise","normalize","nth","position","simplify the text"]],["has","country"],["words<=",8],["has","code"],["has","the"]],"pyramid":["render.code",["transform.norm",["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],{"lit":2}]],"mem":null},
{"id":"n-19e4cd2e","guard":[["hasAny",["abbreviate","acronym","element","item number","join","joined with","leone","marino","nth","position","separated by","short form","timorleste"]],["has","country"],["has","is"],["has","code"]],"pyramid":["render.code",["transform.acronym",["transform.join",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]]]],"mem":null},
{"id":"n-8b0c8f01","guard":[["hasAny",["abbreviate","acronym","element","item number","join","joined with","leone","marino","nth","position","separated by","short form","timorleste"]],["has","country"],["has","is"],["has","code"]],"pyramid":["render.str",["transform.acronym",["transform.join",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]]]],"mem":null},
{"id":"n-6dad64de","guard":[["hasAny",["abbreviate","acronym","append","combine","concatenate","element","item number","leone","marino","nth","position","put together","short form","timorleste"]],["has","country"],["has","is"],["has","code"]],"pyramid":["render.code",["transform.acronym",["transform.concat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]]]],"mem":null},
{"id":"n-b295d7df","guard":[["hasAny",["abbreviate","acronym","append","combine","concatenate","element","item number","leone","marino","nth","position","put together","short form","timorleste"]],["has","country"],["has","is"],["has","code"]],"pyramid":["render.str",["transform.acronym",["transform.concat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]]]],"mem":null},
{"id":"n-136d47ec","guard":[["hasAny",["element","haiti","item number","nauru","no vowels","nth","position","remove vowels","togo","without vowels"]],["has","country"],["has","has"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-899a18f9","guard":[["hasAny",["element","haiti","item number","nauru","no vowels","nth","position","remove vowels","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.noVowels",["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-12eb8d84","guard":[["hasAny",["element","haiti","item number","nauru","no vowels","nth","position","remove vowels","togo","without vowels"]],["has","country"],["has","has"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-980db868","guard":[["hasAny",["element","islands","item number","korea","leone","nth","position"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-cc5b3aee","guard":[["hasAny",["element","islands","item number","korea","leone","nth","position"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-e007873a","guard":[["hasAny",["element","islands","item number","korea","leone","nth","position"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-179b0dc1","guard":[["hasAny",["camel case","camelcase","element","islands","item number","korea","leone","lower camel case","nth","position"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-1841da2c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","islands","item number","korea","leone","nth","position","title case"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-1aefa720","guard":[["hasAny",["element","invert case","islands","item number","korea","leone","nth","position","swap case","toggle case"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-41ef7c11","guard":[["hasAny",["class name","element","islands","item number","korea","leone","nth","pascal case","pascalcase","position","upper camel case"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-4dc511e6","guard":[["hasAny",["element","islands","item number","korea","leone","no vowels","nth","position","remove vowels","without vowels"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-585a424a","guard":[["hasAny",["all caps","capital letters","capitals","element","islands","item number","korea","leone","nth","position","upper case","uppercase"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.upper",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-7ed6be44","guard":[["hasAny",["class name","element","islands","item number","korea","leone","nth","pascal case","pascalcase","position","upper camel case"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-897e62d0","guard":[["hasAny",["element","islands","item number","korea","leone","nth","position"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-baa259f6","guard":[["hasAny",["element","islands","item number","korea","leone","lower case","lowercase","nth","position","small letters"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-de07310f","guard":[["hasAny",["camel case","camelcase","element","islands","item number","korea","leone","lower camel case","nth","position"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.camel",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-6409127e","guard":[["hasAny",["each word","element","islands","item number","korea","leone","nth","position","split into words","words"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-71099ac9","guard":[["hasAny",["each word","element","islands","item number","korea","leone","nth","position","split into words","words"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-8005e037","guard":[["hasAny",["element","islands","item number","korea","leone","lower case","lowercase","nth","position","small letters"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-cd21d69c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","islands","item number","korea","leone","nth","position","title case"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-e05c052f","guard":[["hasAny",["all caps","capital letters","capitals","element","islands","item number","korea","leone","nth","position","upper case","uppercase"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-e283218e","guard":[["hasAny",["each word","element","islands","item number","korea","leone","nth","position","split into words","words"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-ec4dabe4","guard":[["hasAny",["each word","element","islands","item number","korea","leone","nth","position","split into words","words"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-f4d54952","guard":[["hasAny",["element","invert case","islands","item number","korea","leone","nth","position","swap case","toggle case"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-53fc4c95","guard":[["hasAny",["element","islands","item number","korea","leone","normalise","normalize","nth","position","simplify the text"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-d1f7b54d","guard":[["hasAny",["element","islands","item number","korea","leone","normalise","normalize","nth","position","simplify the text"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-495d8b6e","guard":[["hasAny",["congo","haiti","no vowels","remove vowels","togo","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.code",["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-c8c1b093","guard":[["hasAny",["congo","haiti","no vowels","remove vowels","togo","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.str",["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-110f79df","guard":[["hasAny",["haiti","nauru","no vowels","remove vowels","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.str",["transform.noVowels",["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-17f8a65f","guard":[["hasAny",["alphabetize the letters","congo","haiti","letters in order","no vowels","remove vowels","sort the letters","togo","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.str",["transform.noVowels",["transform.sortLetters",["sense.lastWord"]]]],"mem":null},
{"id":"n-199a0739","guard":[["hasAny",["capitalise","capitalize","capitalize each word","congo","haiti","no vowels","remove vowels","title case","togo","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.code",["transform.noVowels",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-1cfe6f99","guard":[["hasAny",["camel case","camelcase","congo","haiti","lower camel case","no vowels","remove vowels","togo","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.code",["transform.noVowels",["transform.camel",["sense.lastWord"]]]],"mem":null},
{"id":"n-25c7af81","guard":[["hasAny",["capital letters","capitals","congo","haiti","no vowels","remove vowels","togo","upper case","uppercase","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.code",["transform.noVowels",["transform.upper",["sense.lastWord"]]]],"mem":null},
{"id":"n-2d8da400","guard":[["hasAny",["class name","congo","haiti","no vowels","pascal case","pascalcase","remove vowels","togo","upper camel case","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.code",["transform.pascal",["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-317de01e","guard":[["hasAny",["congo","haiti","no vowels","remove vowels","snake case","snakecase","togo","underscores","variable name","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.str",["transform.noVowels",["transform.snake",["sense.lastWord"]]]],"mem":null},
{"id":"n-32111691","guard":[["hasAny",["congo","haiti","invert case","no vowels","remove vowels","swap case","toggle case","togo","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.code",["transform.noVowels",["transform.swapCase",["sense.lastWord"]]]],"mem":null},
{"id":"n-42108ba4","guard":[["hasAny",["congo","haiti","invert case","no vowels","remove vowels","swap case","toggle case","togo","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.str",["transform.noVowels",["transform.swapCase",["sense.lastWord"]]]],"mem":null},
{"id":"n-42e876f6","guard":[["hasAny",["camel case","camelcase","congo","haiti","lower camel case","no vowels","remove vowels","togo","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.str",["transform.noVowels",["transform.camel",["sense.lastWord"]]]],"mem":null},
{"id":"n-520befc1","guard":[["hasAny",["camel case","camelcase","congo","haiti","lower camel case","no vowels","remove vowels","togo","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.str",["transform.camel",["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-61b0560d","guard":[["hasAny",["haiti","nauru","no vowels","remove vowels","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.code",["transform.noVowels",["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-80d67046","guard":[["hasAny",["congo","dashes","haiti","hyphens","kebab case","kebabcase","no vowels","remove vowels","togo","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.str",["transform.noVowels",["transform.kebab",["sense.lastWord"]]]],"mem":null},
{"id":"n-95898246","guard":[["hasAny",["class name","congo","haiti","no vowels","pascal case","pascalcase","remove vowels","togo","upper camel case","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.str",["transform.noVowels",["transform.pascal",["sense.lastWord"]]]],"mem":null},
{"id":"n-9bf2a623","guard":[["hasAny",["class name","congo","haiti","no vowels","pascal case","pascalcase","remove vowels","togo","upper camel case","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.str",["transform.pascal",["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-bab7b259","guard":[["hasAny",["capital letters","capitals","congo","haiti","no vowels","remove vowels","togo","upper case","uppercase","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.str",["transform.noVowels",["transform.upper",["sense.lastWord"]]]],"mem":null},
{"id":"n-bb45837f","guard":[["hasAny",["alphabetize the letters","congo","haiti","letters in order","no vowels","remove vowels","sort the letters","togo","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.code",["transform.noVowels",["transform.sortLetters",["sense.lastWord"]]]],"mem":null},
{"id":"n-cc0eb8c3","guard":[["hasAny",["congo","haiti","no vowels","remove vowels","snake case","snakecase","togo","underscores","variable name","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.code",["transform.noVowels",["transform.snake",["sense.lastWord"]]]],"mem":null},
{"id":"n-d5d35390","guard":[["hasAny",["capitalise","capitalize","capitalize each word","congo","haiti","no vowels","remove vowels","title case","togo","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.str",["transform.noVowels",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-d5ea3c03","guard":[["hasAny",["camel case","camelcase","congo","haiti","lower camel case","no vowels","remove vowels","togo","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.code",["transform.camel",["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-e0f4e38b","guard":[["hasAny",["class name","congo","haiti","no vowels","pascal case","pascalcase","remove vowels","togo","upper camel case","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.code",["transform.noVowels",["transform.pascal",["sense.lastWord"]]]],"mem":null},
{"id":"n-e20f47d2","guard":[["hasAny",["congo","dashes","haiti","hyphens","kebab case","kebabcase","no vowels","remove vowels","togo","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.code",["transform.noVowels",["transform.kebab",["sense.lastWord"]]]],"mem":null},
{"id":"n-063382bc","guard":[["hasAny",["dashes","haiti","hyphens","kebab case","kebabcase","nauru","no vowels","remove vowels","slug","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.code",["transform.kebab",["transform.noVowels",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-2ae9756b","guard":[["hasAny",["haiti","nauru","no vowels","remove vowels","snake case","snakecase","togo","underscores","variable name","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.str",["transform.noVowels",["transform.snake",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-2d7b3e60","guard":[["hasAny",["alphabetize the letters","haiti","letters in order","nauru","no vowels","remove vowels","sort the letters","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.code",["transform.noVowels",["transform.sortLetters",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-4b2b949e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","haiti","nauru","no vowels","remove vowels","title case","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.str",["transform.noVowels",["transform.title",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-55585891","guard":[["hasAny",["camel case","camelcase","haiti","lower camel case","nauru","no vowels","remove vowels","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.str",["transform.camel",["transform.noVowels",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-59988c5d","guard":[["hasAny",["dashes","haiti","hyphens","kebab case","kebabcase","nauru","no vowels","remove vowels","slug","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.str",["transform.kebab",["transform.noVowels",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-613d5466","guard":[["hasAny",["all caps","capital letters","capitals","haiti","nauru","no vowels","remove vowels","togo","upper case","uppercase","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.str",["transform.noVowels",["transform.upper",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-66dfd66f","guard":[["hasAny",["class name","haiti","nauru","no vowels","pascal case","pascalcase","remove vowels","togo","upper camel case","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.str",["transform.noVowels",["transform.pascal",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-71f817d8","guard":[["hasAny",["all caps","capital letters","capitals","haiti","nauru","no vowels","remove vowels","togo","upper case","uppercase","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.code",["transform.noVowels",["transform.upper",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-73bc7402","guard":[["hasAny",["dashes","haiti","hyphens","kebab case","kebabcase","nauru","no vowels","remove vowels","slug","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.str",["transform.noVowels",["transform.kebab",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-79544ad5","guard":[["hasAny",["haiti","nauru","no vowels","remove vowels","snake case","snakecase","togo","underscores","variable name","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.code",["transform.noVowels",["transform.snake",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-797d518b","guard":[["hasAny",["class name","haiti","nauru","no vowels","pascal case","pascalcase","remove vowels","togo","upper camel case","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.str",["transform.pascal",["transform.noVowels",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-8448356e","guard":[["hasAny",["class name","haiti","nauru","no vowels","pascal case","pascalcase","remove vowels","togo","upper camel case","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.code",["transform.noVowels",["transform.pascal",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-8cb6ae6f","guard":[["hasAny",["camel case","camelcase","haiti","lower camel case","nauru","no vowels","remove vowels","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.str",["transform.noVowels",["transform.camel",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-aeb41d45","guard":[["hasAny",["camel case","camelcase","haiti","lower camel case","nauru","no vowels","remove vowels","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.code",["transform.camel",["transform.noVowels",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-b92c3dbc","guard":[["hasAny",["dashes","haiti","hyphens","kebab case","kebabcase","nauru","no vowels","remove vowels","slug","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.code",["transform.noVowels",["transform.kebab",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-bcdb6ca5","guard":[["hasAny",["haiti","lower case","lowercase","nauru","no vowels","remove vowels","small letters","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.code",["transform.lower",["transform.noVowels",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-bddc1f4e","guard":[["hasAny",["class name","haiti","nauru","no vowels","pascal case","pascalcase","remove vowels","togo","upper camel case","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.code",["transform.pascal",["transform.noVowels",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-c27b4a54","guard":[["hasAny",["haiti","lower case","lowercase","nauru","no vowels","remove vowels","small letters","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.str",["transform.lower",["transform.noVowels",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-c480e3e2","guard":[["hasAny",["haiti","invert case","nauru","no vowels","remove vowels","swap case","toggle case","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.str",["transform.noVowels",["transform.swapCase",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-cd392a67","guard":[["hasAny",["camel case","camelcase","haiti","lower camel case","nauru","no vowels","remove vowels","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.code",["transform.noVowels",["transform.camel",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-d07aa68f","guard":[["hasAny",["haiti","nauru","no vowels","remove vowels","reverse the words","reverse word order","togo","without vowels","words backwards"]],["has","has"],["not",["has","name"]]],"pyramid":["render.code",["transform.noVowels",["transform.reverseWords",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-d1baa322","guard":[["hasAny",["congo","haiti","item number","no vowels","nth","remove vowels","togo","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.code",["transform.noVowels",["transform.nthStr",["sense.words"],["sense.wordCount"]]]],"mem":null},
{"id":"n-d4c23ba5","guard":[["hasAny",["haiti","nauru","no vowels","remove vowels","reverse the words","reverse word order","togo","without vowels","words backwards"]],["has","has"],["not",["has","name"]]],"pyramid":["render.str",["transform.noVowels",["transform.reverseWords",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-db8b1de4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","haiti","nauru","no vowels","remove vowels","title case","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.code",["transform.noVowels",["transform.title",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-e415eb15","guard":[["hasAny",["abbreviate","acronym","costa","marino","no vowels","remove vowels","short form","without vowels","zealand"]],["not",["has","of"]],["has","the"]],"pyramid":["render.str",["transform.noVowels",["transform.acronym",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-e92ba240","guard":[["hasAny",["congo","haiti","item number","no vowels","nth","remove vowels","togo","without vowels"]],["has","country"],["has","which"],["has","code"]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["sense.words"],["sense.wordCount"]]]],"mem":null},
{"id":"n-f0aad88c","guard":[["hasAny",["haiti","invert case","nauru","no vowels","remove vowels","swap case","toggle case","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.code",["transform.noVowels",["transform.swapCase",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-f6765728","guard":[["hasAny",["haiti","item number","nauru","no vowels","nth","remove vowels","togo","without vowels"]],["has","country"],["has","which"],["words<=",6]],"pyramid":["render.code",["transform.noVowels",["transform.nthStr",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-f7d092db","guard":[["hasAny",["abbreviate","acronym","costa","marino","no vowels","remove vowels","short form","without vowels","zealand"]],["not",["has","of"]],["has","the"]],"pyramid":["render.code",["transform.noVowels",["transform.acronym",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-fa86ad3f","guard":[["hasAny",["haiti","item number","nauru","no vowels","nth","remove vowels","togo","without vowels"]],["has","country"],["has","which"],["words<=",6]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-fb485d31","guard":[["hasAny",["alphabetize the letters","haiti","letters in order","nauru","no vowels","remove vowels","sort the letters","togo","without vowels"]],["has","has"],["not",["has","name"]]],"pyramid":["render.str",["transform.noVowels",["transform.sortLetters",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-217a0390","guard":[["hasAny",["abbreviate","acronym","alphabetize the letters","costa","element","item number","letters in order","nth","position","sort the letters","zealand"]],["has","country"],["has","has"]],"pyramid":["render.str",["transform.sortLetters",["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-5af6930c","guard":[["hasAny",["alphabetize the letters","costa","element","first letters of the name","initials","item number","letters in order","nth","position","sort the letters","zealand"]],["has","country"],["has","has"]],"pyramid":["render.code",["transform.sortLetters",["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-888fbd91","guard":[["hasAny",["alphabetize the letters","costa","element","first letters of the name","initials","item number","letters in order","nth","position","sort the letters","zealand"]],["has","country"],["has","has"]],"pyramid":["render.str",["transform.sortLetters",["transform.initials",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-cfc6f602","guard":[["hasAny",["abbreviate","acronym","alphabetize the letters","costa","element","item number","letters in order","nth","position","sort the letters","zealand"]],["has","country"],["has","has"]],"pyramid":["render.code",["transform.sortLetters",["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-19d88bb3","guard":[["hasAny",["abbreviate","acronym","costa","element","item number","normalise","normalize","nth","position","simplify the text","zealand"]],["has","country"],["has","has"]],"pyramid":["render.code",["transform.acronym",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":3}]]],"mem":null},
{"id":"n-e686d47a","guard":[["hasAny",["abbreviate","acronym","costa","element","item number","normalise","normalize","nth","position","simplify the text","zealand"]],["has","country"],["has","has"]],"pyramid":["render.str",["transform.acronym",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":3}]]],"mem":null},
{"id":"n-1b8b4aaa","guard":[["hasAny",["abbreviate","abbreviation","acronym","costa","element","item number","nth","position","short form","zealand"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.acronym",["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-ed7e4a7d","guard":[["hasAny",["abbreviate","acronym","costa","element","item number","nth","position","zealand"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-35977917","guard":[["hasAny",["abbreviate","acronym","costa","short form","zealand"]],["has","has"]],"pyramid":["render.str",["transform.acronym",["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-6966020a","guard":[["hasAny",["abbreviate","acronym","costa","short form","zealand"]],["has","has"]],"pyramid":["render.code",["transform.acronym",["sense.after",{"lit":"country"}]]],"mem":null},
{"id":"n-847a3517","guard":[["hasAny",["abbreviate","acronym","leone","short form","timorleste"]],["has","country"],["has","of"]],"pyramid":["render.code",["transform.acronym",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-d44efaca","guard":[["hasAny",["abbreviate","acronym","leone","short form","timorleste"]],["has","country"],["has","of"]],"pyramid":["render.str",["transform.acronym",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-0ab2a4b5","guard":[["hasAny",["abbreviate","acronym","monaco","no vowels","remove vowels","seychelles","without vowels"]],["has","which"],["has","code"]],"pyramid":["render.code",["transform.noVowels",["transform.acronym",["sense.before",{"lit":"of"}]]]],"mem":null},
{"id":"n-0ccda99f","guard":[["hasAny",["abbreviate","acronym","leone","no vowels","remove vowels","short form","timorleste","without vowels"]],["has","country"],["has","of"]],"pyramid":["render.str",["transform.acronym",["transform.noVowels",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-2c1c1d77","guard":[["hasAny",["abbreviate","acronym","costa","dashes","hyphens","kebab case","kebabcase","short form","slug","zealand"]],["has","has"]],"pyramid":["render.code",["transform.acronym",["transform.kebab",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-30145860","guard":[["hasAny",["abbreviate","acronym","class name","costa","pascal case","pascalcase","short form","upper camel case","zealand"]],["has","has"]],"pyramid":["render.str",["transform.pascal",["transform.acronym",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-3cf3c7c7","guard":[["hasAny",["abbreviate","acronym","leone","no vowels","remove vowels","short form","timorleste","without vowels"]],["has","country"],["has","of"]],"pyramid":["render.code",["transform.noVowels",["transform.acronym",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-488f5ae8","guard":[["hasAny",["abbreviate","acronym","leone","no vowels","remove vowels","short form","timorleste","without vowels"]],["has","is"],["has","of"]],"pyramid":["render.code",["transform.noVowels",["transform.acronym",["sense.before",{"lit":"country"}]]]],"mem":null},
{"id":"n-491273b5","guard":[["hasAny",["abbreviate","acronym","monaco","no vowels","remove vowels","seychelles","without vowels"]],["has","which"],["has","code"]],"pyramid":["render.str",["transform.noVowels",["transform.acronym",["sense.before",{"lit":"of"}]]]],"mem":null},
{"id":"n-572cbbd0","guard":[["hasAny",["class name","costa","first letters of the name","initials","pascal case","pascalcase","upper camel case","zealand"]],["has","has"]],"pyramid":["render.code",["transform.pascal",["transform.initials",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-5c58ef94","guard":[["hasAny",["camel case","camelcase","first letters of the name","initials","leone","lower camel case","timorleste"]],["has","country"],["has","of"]],"pyramid":["render.str",["transform.camel",["transform.initials",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-5d5ff09b","guard":[["hasAny",["abbreviate","acronym","camel case","camelcase","leone","lower camel case","short form","timorleste"]],["has","country"],["has","of"]],"pyramid":["render.str",["transform.camel",["transform.acronym",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-5f9fe936","guard":[["hasAny",["abbreviate","acronym","costa","no vowels","remove vowels","short form","without vowels","zealand"]],["has","has"]],"pyramid":["render.code",["transform.acronym",["transform.noVowels",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-6590aa1e","guard":[["hasAny",["abbreviate","acronym","leone","no vowels","remove vowels","short form","timorleste","without vowels"]],["has","country"],["has","of"]],"pyramid":["render.str",["transform.noVowels",["transform.acronym",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-66d2b441","guard":[["hasAny",["abbreviate","acronym","first letters of the name","initials","leone","short form","timorleste"]],["has","country"],["has","of"]],"pyramid":["render.str",["transform.acronym",["transform.initials",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-7b2aba68","guard":[["hasAny",["abbreviate","acronym","class name","leone","pascal case","pascalcase","short form","timorleste","upper camel case"]],["has","country"],["has","of"]],"pyramid":["render.str",["transform.pascal",["transform.acronym",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-7b2b94db","guard":[["hasAny",["abbreviate","acronym","costa","first letters of the name","initials","short form","zealand"]],["has","has"]],"pyramid":["render.code",["transform.acronym",["transform.initials",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-830b3a05","guard":[["hasAny",["abbreviate","acronym","costa","dashes","hyphens","kebab case","kebabcase","short form","slug","zealand"]],["has","has"]],"pyramid":["render.str",["transform.acronym",["transform.kebab",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-84d337fe","guard":[["hasAny",["camel case","camelcase","costa","first letters of the name","initials","lower camel case","zealand"]],["has","has"]],"pyramid":["render.code",["transform.camel",["transform.initials",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-878595d9","guard":[["hasAny",["abbreviate","acronym","class name","leone","pascal case","pascalcase","short form","timorleste","upper camel case"]],["has","country"],["has","of"]],"pyramid":["render.code",["transform.pascal",["transform.acronym",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-8a00e463","guard":[["hasAny",["abbreviate","acronym","first letters of the name","initials","leone","short form","timorleste"]],["has","country"],["has","of"]],"pyramid":["render.code",["transform.acronym",["transform.initials",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-9217ccdb","guard":[["hasAny",["abbreviate","acronym","class name","costa","pascal case","pascalcase","short form","upper camel case","zealand"]],["has","has"]],"pyramid":["render.code",["transform.pascal",["transform.acronym",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-a3d0a6ab","guard":[["hasAny",["camel case","camelcase","first letters of the name","initials","leone","lower camel case","timorleste"]],["has","country"],["has","of"]],"pyramid":["render.code",["transform.camel",["transform.initials",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-a59d35eb","guard":[["hasAny",["abbreviate","acronym","camel case","camelcase","costa","lower camel case","short form","zealand"]],["has","has"]],"pyramid":["render.str",["transform.camel",["transform.acronym",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-abc176ea","guard":[["hasAny",["camel case","camelcase","costa","first letters of the name","initials","lower camel case","zealand"]],["has","has"]],"pyramid":["render.str",["transform.camel",["transform.initials",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-aefd9b0a","guard":[["hasAny",["class name","costa","first letters of the name","initials","pascal case","pascalcase","upper camel case","zealand"]],["has","has"]],"pyramid":["render.str",["transform.pascal",["transform.initials",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-b00276e4","guard":[["hasAny",["abbreviate","acronym","camel case","camelcase","costa","lower camel case","short form","zealand"]],["has","has"]],"pyramid":["render.code",["transform.camel",["transform.acronym",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-c6200d1c","guard":[["hasAny",["abbreviate","acronym","camel case","camelcase","leone","lower camel case","short form","timorleste"]],["has","country"],["has","of"]],"pyramid":["render.code",["transform.camel",["transform.acronym",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-d12e3257","guard":[["hasAny",["abbreviate","acronym","costa","first letters of the name","initials","short form","zealand"]],["has","has"]],"pyramid":["render.str",["transform.acronym",["transform.initials",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-d4dd743f","guard":[["hasAny",["abbreviate","acronym","leone","no vowels","remove vowels","short form","timorleste","without vowels"]],["has","country"],["has","of"]],"pyramid":["render.code",["transform.acronym",["transform.noVowels",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-d54ee305","guard":[["hasAny",["abbreviate","acronym","leone","no vowels","remove vowels","short form","timorleste","without vowels"]],["has","is"],["has","of"]],"pyramid":["render.str",["transform.noVowels",["transform.acronym",["sense.before",{"lit":"country"}]]]],"mem":null},
{"id":"n-f90cfc1c","guard":[["hasAny",["abbreviate","acronym","costa","no vowels","remove vowels","short form","without vowels","zealand"]],["has","has"]],"pyramid":["render.str",["transform.acronym",["transform.noVowels",["sense.after",{"lit":"country"}]]]],"mem":null},
{"id":"n-ff156215","guard":[["hasAny",["appears in","contains","element","has","includes","item number","nth","position"]],["words<=",10],["not",["has","croatia"]],["not",["has","african"]],["not",["has","angola"]],["not",["has","antigua"]],["not",["has","argentina"]]],"pyramid":["render.yesNo",["compare.contains",["sense.after",{"lit":"country"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]],["render.template",{"lit":["The code whose ",{"slot":0}," is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],["render.template",{"lit":["The ",{"slot":0}," whose country is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-49014d55","guard":[["hasAny",["caesar cipher","item number","nth","rotate the letters","seychelles","shift by","shift each letter"]],["has","which"],["has","code"]],"pyramid":["render.str",["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":10}]],"mem":null},
{"id":"n-574ae910","guard":[["hasAny",["abbreviate","acronym","element","item number","nth","position","reverse the words","reverse word order","timorleste","words backwards"]],["has","country"],["has","is"]],"pyramid":["render.code",["transform.acronym",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-ac62a5ed","guard":[["hasAny",["caesar cipher","item number","nth","rotate the letters","seychelles","shift by","shift each letter"]],["has","which"],["has","code"]],"pyramid":["render.code",["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":10}]],"mem":null},
{"id":"n-dc06c663","guard":[["hasAny",["abbreviate","acronym","element","item number","nth","position","reverse the words","reverse word order","timorleste","words backwards"]],["has","country"],["has","is"]],"pyramid":["render.str",["transform.acronym",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-0603d636","guard":[["hasAny",["caesar cipher","chad","how many vowels","item number","nth","number of vowels","rotate the letters","shift by","shift each letter","vowel count"]],["has","name"],["has","code"]],"pyramid":["render.code",["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],["aggregate.vowels",["sense.text"]]]],"mem":null},
{"id":"n-11208510","guard":[["hasAny",["delete","element","fiji","item number","no vowels","nth","position","remove","remove vowels","strip out","without","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-19e0e2ec","guard":[["hasAny",["longest","longest one","longest word","monaco"]],["has","country"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is MC."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-2b204b56","guard":[["hasAny",["longest","longest one","longest word","malta"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is MT."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-2c96854d","guard":[["hasAny",["caesar cipher","camel case","camelcase","item number","lower camel case","nth","rotate the letters","seychelles","shift by","shift each letter"]],["has","which"],["has","code"]],"pyramid":["render.code",["transform.caesar",["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]],{"lit":10}]],"mem":null},
{"id":"n-2d312034","guard":[["hasAny",["congo","delete","item number","no vowels","nth","remove vowels","strip out","without vowels"]],["has","country"],["has","dem"]],"pyramid":["render.str",["transform.noVowels",["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]]]],"mem":null},
{"id":"n-3aa2fb9d","guard":[["hasAny",["fiji","longest","longest one","longest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is FJ."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-5a81c063","guard":[["hasAny",["chile","longest","longest one","longest word"]],["has","country"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is CL."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-5f420ba0","guard":[["hasAny",["caesar cipher","chad","item number","next prime","nth","rotate the letters","shift by","shift each letter","smallest prime greater than","the prime after"]],["has","name"],["has","code"]],"pyramid":["render.str",["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],["compute.nextPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-601ea341","guard":[["hasAny",["congo","delete","item number","no vowels","nth","remove vowels","strip out","without vowels"]],["has","country"],["has","dem"]],"pyramid":["render.code",["transform.noVowels",["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]]]],"mem":null},
{"id":"n-68aeed26","guard":[["hasAny",["caesar cipher","class name","item number","nth","pascal case","pascalcase","rotate the letters","seychelles","shift by","shift each letter","upper camel case"]],["has","which"],["has","code"]],"pyramid":["render.code",["transform.caesar",["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]],{"lit":10}]],"mem":null},
{"id":"n-79dd6d28","guard":[["hasAny",["delete","element","fiji","item number","no vowels","nth","position","remove","remove vowels","strip out","without","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-7c68cd8b","guard":[["hasAny",["caesar cipher","chad","item number","next prime","nth","rotate the letters","shift by","shift each letter","smallest prime greater than","the prime after"]],["has","name"],["has","code"]],"pyramid":["render.code",["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],["compute.nextPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-9420a586","guard":[["hasAny",["congo","longest","longest one","longest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is CD."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-96123133","guard":[["hasAny",["longest","longest one","longest word","sudan"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is SD."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-a0939892","guard":[["hasAny",["caesar cipher","chad","how many vowels","item number","nth","number of vowels","rotate the letters","shift by","shift each letter","vowel count"]],["has","name"],["has","code"]],"pyramid":["render.str",["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],["aggregate.vowels",["sense.text"]]]],"mem":null},
{"id":"n-a7e87f66","guard":[["hasAny",["congo","delete","element","item number","no vowels","nth","position","remove","remove vowels","strip out","without","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-ad6f7161","guard":[["hasAny",["caesar cipher","class name","item number","nth","pascal case","pascalcase","rotate the letters","seychelles","shift by","shift each letter","upper camel case"]],["has","which"],["has","code"]],"pyramid":["render.str",["transform.caesar",["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]],{"lit":10}]],"mem":null},
{"id":"n-cab7c9e9","guard":[["hasAny",["china","longest","longest one","longest word"]],["has","country"],["has","which"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is CN."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-cd083079","guard":[["hasAny",["benin","longest","longest one","longest word"]],["has","country"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is BJ."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-ceaacbab","guard":[["hasAny",["element","item number","montenegro","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The code whose ",{"slot":0}," is ",{"slot":1}," is ME."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-d4cffd70","guard":[["hasAny",["caesar cipher","camel case","camelcase","item number","lower camel case","nth","rotate the letters","seychelles","shift by","shift each letter"]],["has","which"],["has","code"]],"pyramid":["render.str",["transform.caesar",["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]],{"lit":10}]],"mem":null},
{"id":"n-f2d9a183","guard":[["hasAny",["congo","delete","element","item number","no vowels","nth","position","remove","remove vowels","strip out","without","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-f70376a4","guard":[["hasAny",["element","item number","montenegro","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose country is ",{"slot":1}," is ME."]},["transform.nthStr",["sense.content"],{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-077562d6","guard":[["hasAny",["element","item number","nth","position","turkmenistan"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is TM."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-0d718a11","guard":[["hasAny",["element","item number","nth","position","tunisia"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is TN."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-1df56ff8","guard":[["hasAny",["element","item number","nth","pakistan","position"]],["has","country"],["has","is"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is PK."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-3eab63ac","guard":[["hasAny",["cambodia","element","item number","nth","position"]],["has","country"],["has","is"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is KH."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-5db873d8","guard":[["hasAny",["element","item number","nth","position","slovakia"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is SK."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-771b421d","guard":[["hasAny",["element","item number","leone","nth","position"]],["has","country"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is SL."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-9216c9b6","guard":[["hasAny",["bangladesh","element","item number","nth","position"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is BD."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-99a53a0f","guard":[["hasAny",["element","item number","korea","nth","position"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is KP."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-9c5216ca","guard":[["hasAny",["element","islands","item number","nth","position"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is MH."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-9c5f7ea1","guard":[["hasAny",["element","item number","nth","position","seychelles"]],["has","code"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is SC."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-a2419941","guard":[["hasAny",["element","item number","liberia","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is LR."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-b6865145","guard":[["hasAny",["element","item number","nth","position","timorleste"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is TL."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-d2b730d5","guard":[["hasAny",["andorra","element","item number","nth","position"]],["has","country"],["has","which"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is AD."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-febb4e6e","guard":[["hasAny",["element","item number","nth","position","senegal"]],["has","country"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is SN."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-0bd7c463","guard":[["hasAny",["element","fiji","item number","join","joined with","no vowels","nth","position","remove vowels","separated by","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["transform.join",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]]]],"mem":null},
{"id":"n-3190c870","guard":[["hasAny",["backwards","element","item number","mirror","myanmar","nth","position","reverse","reversed","spell backwards"]],["has","country"],["has","name"]],"pyramid":["render.str",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-97251b8d","guard":[["hasAny",["element","fiji","item number","join","joined with","no vowels","nth","position","remove vowels","separated by","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["transform.join",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]]]],"mem":null},
{"id":"n-b2412da0","guard":[["hasAny",["backwards","element","item number","mirror","myanmar","nth","position","reverse","reversed","spell backwards"]],["has","country"],["has","name"]],"pyramid":["render.code",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-ccf317c2","guard":[["hasAny",["element","item number","montenegro","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-e5718cbb","guard":[["hasAny",["congo","longest","longest one","longest word","no vowels","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-02f14e8e","guard":[["hasAny",["burundi","element","item number","nth","position"]],["has","code"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is BI."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-09453bd5","guard":[["hasAny",["element","item number","montenegro","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-094a1759","guard":[["hasAny",["element","item number","mauritania","nth","position"]],["has","country"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is MR."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-14f9b2bc","guard":[["hasAny",["element","guinea","item number","nth","position"]],["has","country"],["has","has"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is PG."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-19b46bca","guard":[["hasAny",["element","item number","nth","position","spain"]],["has","country"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ES."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-1c838bbe","guard":[["hasAny",["element","guineabissau","item number","nth","position"]],["has","code"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is GW."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-253fa571","guard":[["hasAny",["element","invert case","item number","montenegro","nth","position","swap case","toggle case"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-2eb28bdf","guard":[["hasAny",["element","item number","nth","portugal","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is PT."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-336b3ff2","guard":[["hasAny",["element","item number","kitts","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is KN."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-39b4a03c","guard":[["hasAny",["element","haiti","item number","nth","position"]],["has","country"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is HT."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-3af13087","guard":[["hasAny",["algeria","element","item number","nth","position"]],["has","country"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is DZ."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-43af6c63","guard":[["hasAny",["element","item number","nth","position","principe"]],["has","name"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ST."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-47a90762","guard":[["hasAny",["element","item number","moldova","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is MD."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-5420e1e7","guard":[["hasAny",["element","item number","nth","position","zimbabwe"]],["has","country"],["has","has"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ZW."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-5613c9c4","guard":[["hasAny",["cameroon","element","item number","nth","position"]],["has","country"],["has","name"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is CM."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-5be181b2","guard":[["hasAny",["backwards","element","item number","mirror","myanmar","no vowels","nth","position","remove vowels","reverse","reversed","spell backwards","without vowels"]],["has","country"],["has","name"]],"pyramid":["render.code",["transform.noVowels",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-5be2f41a","guard":[["hasAny",["element","iraq","item number","nth","position"]],["has","country"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is IQ."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-5bea7140","guard":[["hasAny",["element","item number","nth","position","tanzania"]],["has","country"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is TZ."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-5caba2eb","guard":[["hasAny",["chad","element","item number","nth","position"]],["has","name"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is TD."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-5ef0d34a","guard":[["hasAny",["costa","element","item number","nth","position"]],["has","country"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is CR."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-6b6197ce","guard":[["hasAny",["element","item number","nth","position","samoa"]],["has","country"],["has","code"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is WS."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-7165208b","guard":[["hasAny",["element","item number","myanmar","nth","position"]],["has","country"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is MM."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-726d3964","guard":[["hasAny",["element","honduras","item number","nth","position"]],["has","country"],["has","name"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is HN."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-72d9f24a","guard":[["hasAny",["backwards","class name","element","item number","mirror","myanmar","nth","pascal case","pascalcase","position","reverse","reversed","spell backwards","upper camel case"]],["has","country"],["has","name"]],"pyramid":["render.str",["transform.pascal",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-75d65b8b","guard":[["hasAny",["class name","element","item number","montenegro","nth","pascal case","pascalcase","position","upper camel case"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["transform.pascal",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-7b19e0b7","guard":[["hasAny",["element","item number","nth","position","ukraine"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is UA."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-7c5aa32b","guard":[["hasAny",["element","grenadines","item number","nth","position"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is VC."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-7e323b52","guard":[["hasAny",["backwards","camel case","camelcase","element","item number","lower camel case","mirror","myanmar","nth","position","reverse","reversed","spell backwards"]],["has","country"],["has","name"]],"pyramid":["render.code",["transform.camel",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-816db8a9","guard":[["hasAny",["element","item number","madagascar","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is MG."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-873e9c53","guard":[["hasAny",["element","item number","nth","position","togo"]],["has","country"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is TG."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-8aad7349","guard":[["hasAny",["bulgaria","element","item number","nth","position"]],["has","code"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is BG."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-8b9dd60a","guard":[["hasAny",["element","ireland","item number","nth","position"]],["has","country"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is IE."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-9228cf56","guard":[["hasAny",["el","element","item number","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is SV."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-9a9a682a","guard":[["hasAny",["element","eswatini","item number","nth","position"]],["has","code"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is SZ."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-9d4a4de8","guard":[["hasAny",["element","item number","lesotho","nth","position"]],["has","country"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is LS."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-9faf343b","guard":[["hasAny",["backwards","element","item number","mirror","myanmar","no vowels","nth","position","remove vowels","reverse","reversed","spell backwards","without vowels"]],["has","country"],["has","name"]],"pyramid":["render.str",["transform.noVowels",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-a9914974","guard":[["hasAny",["backwards","camel case","camelcase","element","item number","lower camel case","mirror","myanmar","nth","position","reverse","reversed","spell backwards"]],["has","country"],["has","name"]],"pyramid":["render.str",["transform.camel",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-aaa954a0","guard":[["hasAny",["backwards","class name","element","item number","mirror","myanmar","nth","pascal case","pascalcase","position","reverse","reversed","spell backwards","upper camel case"]],["has","country"],["has","name"]],"pyramid":["render.code",["transform.pascal",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]]],"mem":null},
{"id":"n-b475a781","guard":[["hasAny",["element","item number","macedonia","nth","position"]],["has","country"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is MK."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-c0b80f44","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","montenegro","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["transform.camel",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-c5f0ac9e","guard":[["hasAny",["element","item number","libya","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is LY."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-c8b9bdaf","guard":[["hasAny",["element","item number","netherlands","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is NL."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-c920d06b","guard":[["hasAny",["element","item number","nauru","nth","position"]],["has","country"],["has","has"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is NR."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-d031b171","guard":[["hasAny",["element","item number","nigeria","nth","position"]],["has","country"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is NG."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-d05cb617","guard":[["hasAny",["element","item number","marino","nth","position"]],["has","country"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is SM."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-d1ce245e","guard":[["hasAny",["element","item number","kuwait","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is KW."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-d45ebae3","guard":[["hasAny",["element","item number","montenegro","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-d588d702","guard":[["hasAny",["element","item number","nth","position","suriname"]],["has","country"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is SR."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-d6925550","guard":[["hasAny",["element","item number","montenegro","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-d7b61bbd","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","montenegro","nth","position","upper case","uppercase"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["transform.upper",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-da7872a2","guard":[["hasAny",["arab","element","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is AE."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-e7e619a0","guard":[["hasAny",["bahrain","element","item number","nth","position"]],["has","country"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is BH."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-eb19c83e","guard":[["hasAny",["bosnia","element","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is BA."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-eb38130e","guard":[["hasAny",["element","item number","nth","position","zealand"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is NZ."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-fa78e3ec","guard":[["hasAny",["element","item number","nth","poland","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is PL."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-fac8aa50","guard":[["hasAny",["element","guyana","item number","nth","position"]],["has","country"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is GY."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-4ae65262","guard":[["hasAny",["element","fiji","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","country"]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-5ac33011","guard":[["hasAny",["element","item number","leading zeros","monaco","nth","pad","pad with","padded to","position","zero pad"]],["has","country"],["has","which"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-76de5956","guard":[["hasAny",["element","item number","leading zeros","monaco","nth","pad","pad with","padded to","position","zero pad"]],["has","country"],["has","which"]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-7bed63bb","guard":[["hasAny",["element","fiji","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","country"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-7e447242","guard":[["hasAny",["caesar cipher","character count","element","how many characters","item number","length","nth","number of characters","position","rotate the letters","seychelles","shift by","shift each letter"]],["has","which"],["has","code"]],"pyramid":["render.code",["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-7fa79981","guard":[["hasAny",["abbreviate","acronym","element","item number","leone","nth","position","short form"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.acronym",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-87610cee","guard":[["hasAny",["each word","element","item number","montenegro","nth","position","split into words","words"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-89de69c9","guard":[["hasAny",["caesar cipher","character count","element","how many characters","item number","length","nth","number of characters","position","rotate the letters","seychelles","shift by","shift each letter"]],["has","which"],["has","code"]],"pyramid":["render.str",["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-8d974c0f","guard":[["hasAny",["caesar cipher","element","how many letters","item number","letter count","nth","number of letters","position","rotate the letters","seychelles","shift by","shift each letter"]],["has","which"],["has","code"]],"pyramid":["render.str",["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],["aggregate.letters",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-957e6fb3","guard":[["hasAny",["element","first n","item number","montenegro","nth","position","take"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-9e805fbd","guard":[["hasAny",["abbreviate","acronym","element","item number","nth","position","short form","timorleste"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.acronym",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-a4248b77","guard":[["hasAny",["caesar cipher","element","how many letters","item number","letter count","nth","number of letters","position","rotate the letters","seychelles","shift by","shift each letter"]],["has","which"],["has","code"]],"pyramid":["render.code",["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],["aggregate.letters",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]]],"mem":null},
{"id":"n-ebacc01f","guard":[["hasAny",["element","item number","montenegro","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]],"mem":null},
{"id":"n-fb2bbfd7","guard":[["hasAny",["element","first n","item number","montenegro","nth","position","take"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]]],"mem":null},
{"id":"n-07915763","guard":[["hasAny",["china","element","item number","longest","longest one","longest word","nth","position"]],["has","country"],["has","which"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is China is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-0e8b27fb","guard":[["hasAny",["element","item number","longest","longest one","longest word","malta","nth","position"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Malta is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-22ce97a9","guard":[["hasAny",["chile","element","item number","longest","longest one","longest word","nth","position"]],["has","country"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Chile is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-3e988b12","guard":[["hasAny",["element","item number","lower case","lowercase","montenegro","nth","position","small letters"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-4333458d","guard":[["hasAny",["element","item number","longest","longest one","longest word","monaco","nth","position"]],["has","country"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Monaco is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-6a09c02f","guard":[["hasAny",["benin","element","item number","longest","longest one","longest word","nth","position"]],["has","country"],["has","is"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Benin is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-a29a41e0","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","sudan"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Sudan is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-b7950947","guard":[["hasAny",["element","invert case","item number","montenegro","nth","position","swap case","toggle case"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-cf63fc8f","guard":[["hasAny",["element","fiji","item number","longest","longest one","longest word","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Fiji is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-f4173258","guard":[["hasAny",["congo","element","item number","longest","longest one","longest word","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Congo (Dem. Rep.) is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-16da5ae0","guard":[["hasAny",["element","item number","nth","position","slovakia"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Slovakia is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-4ee16844","guard":[["hasAny",["bangladesh","element","item number","nth","position"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Bangladesh is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-4f0a71db","guard":[["hasAny",["cambodia","element","item number","nth","position"]],["has","country"],["has","is"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Cambodia is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-5f7de47b","guard":[["hasAny",["element","item number","nth","position","turkmenistan"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Turkmenistan is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-60b32921","guard":[["hasAny",["element","item number","nth","position","timorleste"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Timor-Leste is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-72c56be6","guard":[["hasAny",["andorra","element","item number","nth","position"]],["has","country"],["has","which"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Andorra is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-740d6868","guard":[["hasAny",["element","item number","nth","position","seychelles"]],["has","code"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Seychelles is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-7faa53e5","guard":[["hasAny",["element","item number","leone","nth","position"]],["has","country"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Sierra Leone is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-82aa2a18","guard":[["hasAny",["element","item number","korea","nth","position"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is North Korea is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-8569c46b","guard":[["hasAny",["element","item number","liberia","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Liberia is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-8ef7ff35","guard":[["hasAny",["element","fiji","item number","longest","longest one","longest word","no vowels","nth","position","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-a48612a1","guard":[["hasAny",["element","islands","item number","nth","position"]],["has","country"],["has","is"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Marshall Islands is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-b9aae364","guard":[["hasAny",["element","item number","nth","pakistan","position"]],["has","country"],["has","is"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Pakistan is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-ca9da24a","guard":[["hasAny",["element","item number","nth","position","senegal"]],["has","country"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Senegal is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-f73edfc5","guard":[["hasAny",["element","item number","nth","position","tunisia"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Tunisia is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-22a23d91","guard":[["hasAny",["abbreviate","acronym","element","item number","nth","position","timorleste"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-bd17f317","guard":[["hasAny",["abbreviate","acronym","element","item number","leone","nth","position"]],["has","country"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-081a6699","guard":[["hasAny",["element","item number","kuwait","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Kuwait is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-103988b0","guard":[["hasAny",["element","item number","nth","poland","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Poland is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-19bc2e22","guard":[["hasAny",["element","item number","nth","position","samoa"]],["has","country"],["has","code"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Samoa is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-1ddb7608","guard":[["hasAny",["element","eswatini","item number","nth","position"]],["has","code"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is eSwatini is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-4230697f","guard":[["hasAny",["element","item number","nth","position","spain"]],["has","country"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Spain is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-469af9d4","guard":[["hasAny",["element","item number","mauritania","nth","position"]],["has","country"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Mauritania is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-47678f00","guard":[["hasAny",["element","item number","nth","position","zealand"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is New Zealand is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-492aaee7","guard":[["hasAny",["costa","element","item number","nth","position"]],["has","country"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Costa Rica is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-4a879150","guard":[["hasAny",["element","guinea","item number","nth","position"]],["has","country"],["has","has"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Papua New Guinea is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-52401285","guard":[["hasAny",["arab","element","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is United Arab Emirates is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-5bf619d5","guard":[["hasAny",["element","guyana","item number","nth","position"]],["has","country"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Guyana is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-5dfe4716","guard":[["hasAny",["element","grenadines","item number","nth","position"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is St. Vincent and the Grenadines is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-5fada80e","guard":[["hasAny",["burundi","element","item number","nth","position"]],["has","code"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Burundi is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-6566b0e6","guard":[["hasAny",["element","item number","madagascar","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Madagascar is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-6619ecaa","guard":[["hasAny",["element","item number","nigeria","nth","position"]],["has","country"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Nigeria is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-6c3f1f02","guard":[["hasAny",["element","item number","nth","position","togo"]],["has","country"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Togo is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-6ce8c21b","guard":[["hasAny",["element","item number","nauru","nth","position"]],["has","country"],["has","has"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Nauru is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-7a1d2ff4","guard":[["hasAny",["element","item number","kitts","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is St. Kitts and Nevis is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-7d24f6cc","guard":[["hasAny",["element","item number","nth","position","suriname"]],["has","country"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Suriname is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-8b25b1a0","guard":[["hasAny",["bulgaria","element","item number","nth","position"]],["has","code"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Bulgaria is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-8c0768e3","guard":[["hasAny",["cameroon","element","item number","nth","position"]],["has","country"],["has","name"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Cameroon is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-8d1144f9","guard":[["hasAny",["element","item number","libya","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Libya is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-95dba04b","guard":[["hasAny",["element","item number","netherlands","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Netherlands is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-97bc0c21","guard":[["hasAny",["element","haiti","item number","nth","position"]],["has","country"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Haiti is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-9a099730","guard":[["hasAny",["element","item number","nth","portugal","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Portugal is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-9f382fe9","guard":[["hasAny",["element","item number","moldova","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Moldova is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-b11b632d","guard":[["hasAny",["element","item number","marino","nth","position"]],["has","country"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is San Marino is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-b3353559","guard":[["hasAny",["element","item number","nth","position","zimbabwe"]],["has","country"],["has","has"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Zimbabwe is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-b56a796e","guard":[["hasAny",["bosnia","element","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Bosnia and Herzegovina is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-b86b8ad5","guard":[["hasAny",["element","item number","lesotho","nth","position"]],["has","country"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Lesotho is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-ba7805c9","guard":[["hasAny",["el","element","item number","nth","position"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is El Salvador is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-bbb4c175","guard":[["hasAny",["element","guineabissau","item number","nth","position"]],["has","code"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Guinea-Bissau is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-c4557540","guard":[["hasAny",["algeria","element","item number","nth","position"]],["has","country"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Algeria is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-c6b904a4","guard":[["hasAny",["element","item number","nth","position","ukraine"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Ukraine is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-ca05dc40","guard":[["hasAny",["element","item number","nth","position","principe"]],["has","name"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Sao Tome and Principe is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-ccf133fe","guard":[["hasAny",["element","honduras","item number","nth","position"]],["has","country"],["has","name"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Honduras is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-d3d4471e","guard":[["hasAny",["element","item number","myanmar","nth","position"]],["has","country"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Myanmar is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-d8e7b750","guard":[["hasAny",["chad","element","item number","nth","position"]],["has","name"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Chad is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-df8d1438","guard":[["hasAny",["element","item number","macedonia","nth","position"]],["has","country"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is North Macedonia is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-e2044fa7","guard":[["hasAny",["element","item number","nth","position","tanzania"]],["has","country"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Tanzania is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-e3fbd04b","guard":[["hasAny",["element","iraq","item number","nth","position"]],["has","country"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Iraq is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-e937ed3f","guard":[["hasAny",["element","ireland","item number","nth","position"]],["has","country"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Ireland is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-f54055cd","guard":[["hasAny",["bahrain","element","item number","nth","position"]],["has","country"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Bahrain is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-1b703d18","guard":[["hasAny",["abbreviate","acronym","element","item number","marino","nth","position"]],["has","country"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.acronym",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-84786790","guard":[["hasAny",["element","item number","leone","nth","position"]],["has","code"],["has","country"],["words<=",10],["has","the"],["not",["has","burkina"]],["not",["has","african"]]],"pyramid":["render.template",{"lit":["The code whose ",{"slot":0}," is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-c5e9fb40","guard":[["hasAny",["congo","element","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]],"mem":null},
{"id":"n-98dd067c","guard":[["hasAny",["alphabetize the letters","element","item number","korea","letters in order","nth","position","sort the letters"]],["has","country"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}]],["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"country"},{"lit":"code"}]]],"mem":null},
{"id":"n-03e0067c","guard":[["hasAny",["code","country","has","poland"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Poland":"The code whose country is Poland is PL."}}},
{"id":"n-03f4010f","guard":[["hasAny",["code","country","has","montenegro"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Montenegro":"The code whose country is Montenegro is ME."}}},
{"id":"n-0a375a20","guard":[["hasAny",["code","country","tunisia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Tunisia is the country of which code":"The code whose country is Tunisia is TN."}}},
{"id":"n-0c7bf4d3","guard":[["hasAny",["code","country","ireland","name"]],["has","whose"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is Ireland":"The code whose country is Ireland is IE."}}},
{"id":"n-0da76118","guard":[["hasAny",["code","country","name","portugal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is Portugal":"The code whose country is Portugal is PT."}}},
{"id":"n-183df4f6","guard":[["hasAny",["andorra","code","country"]],["has","which"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Andorra is the country of which code":"The code whose country is Andorra is AD."}}},
{"id":"n-1e1b021a","guard":[["hasAny",["bulgaria","code","country","has"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Bulgaria":"The code whose country is Bulgaria is BG."}}},
{"id":"n-1ea997aa","guard":[["hasAny",["code","country","has","netherlands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Netherlands":"The code whose country is Netherlands is NL."}}},
{"id":"n-28e8f33d","guard":[["hasAny",["code","country","korea","north"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"North Korea is the country of which code":"The code whose country is North Korea is KP."}}},
{"id":"n-2c88ca39","guard":[["hasAny",["code","country","name","principe","sao","tome"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is Sao Tome and Principe":"The code whose country is Sao Tome and Principe is ST."}}},
{"id":"n-3aa92659","guard":[["hasAny",["code","country","macedonia","name","north"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is North Macedonia":"The code whose country is North Macedonia is MK."}}},
{"id":"n-41924c5c","guard":[["hasAny",["code","country","myanmar","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is Myanmar":"The code whose country is Myanmar is MM."}}},
{"id":"n-51879316","guard":[["hasAny",["code","country","eswatini","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is eSwatini":"The code whose country is eSwatini is SZ."}}},
{"id":"n-51d1f03a","guard":[["hasAny",["cambodia","code","country"]],["has","which"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Cambodia is the country of which code":"The code whose country is Cambodia is KH."}}},
{"id":"n-53a00ffb","guard":[["hasAny",["code","country","pakistan"]],["has","is"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Pakistan is the country of which code":"The code whose country is Pakistan is PK."}}},
{"id":"n-55ab5383","guard":[["hasAny",["code","country","has","togo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Togo":"The code whose country is Togo is TG."}}},
{"id":"n-56331832","guard":[["hasAny",["code","country","el","has","salvador"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country El Salvador":"The code whose country is El Salvador is SV."}}},
{"id":"n-569629eb","guard":[["hasAny",["arab","code","country","emirates","name","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is United Arab Emirates":"The code whose country is United Arab Emirates is AE."}}},
{"id":"n-5c4843fb","guard":[["hasAny",["code","country","malta"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Malta is the country of which code":"The code whose country is Malta is MT."}}},
{"id":"n-5c60b275","guard":[["hasAny",["cameroon","code","country","name"]],["words<=",7]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is Cameroon":"The code whose country is Cameroon is CM."}}},
{"id":"n-5d5e3186","guard":[["hasAny",["benin","code","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Benin is the country of which code":"The code whose country is Benin is BJ."}}},
{"id":"n-619e3704","guard":[["hasAny",["code","country","guineabissau","has"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Guinea-Bissau":"The code whose country is Guinea-Bissau is GW."}}},
{"id":"n-62eff598","guard":[["hasAny",["code","country","guinea","has","new","papua"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Papua New Guinea":"The code whose country is Papua New Guinea is PG."}}},
{"id":"n-638dc7ac","guard":[["hasAny",["code","country","turkmenistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Turkmenistan is the country of which code":"The code whose country is Turkmenistan is TM."}}},
{"id":"n-648d50c5","guard":[["hasAny",["code","country","marino","name","san"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is San Marino":"The code whose country is San Marino is SM."}}},
{"id":"n-699e893a","guard":[["hasAny",["code","country","has","samoa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Samoa":"The code whose country is Samoa is WS."}}},
{"id":"n-6b9909d5","guard":[["hasAny",["code","country","guyana","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is Guyana":"The code whose country is Guyana is GY."}}},
{"id":"n-71258be3","guard":[["hasAny",["code","country","timorleste"]],["has","is"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Timor-Leste is the country of which code":"The code whose country is Timor-Leste is TL."}}},
{"id":"n-75e28d67","guard":[["hasAny",["code","country","islands","marshall"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Marshall Islands is the country of which code":"The code whose country is Marshall Islands is MH."}}},
{"id":"n-7678cd16","guard":[["hasAny",["code","congo","country","dem","rep"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Congo (Dem. Rep.) is the country of which code":"The code whose country is Congo (Dem. Rep.) is CD."}}},
{"id":"n-7db227a3","guard":[["hasAny",["code","country","name","ukraine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is Ukraine":"The code whose country is Ukraine is UA."}}},
{"id":"n-84de61c6","guard":[["hasAny",["algeria","code","country","name"]],["has","whose"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is Algeria":"The code whose country is Algeria is DZ."}}},
{"id":"n-85665054","guard":[["hasAny",["code","country","kitts","name","nevis","st"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is St. Kitts and Nevis":"The code whose country is St. Kitts and Nevis is KN."}}},
{"id":"n-884cda4b","guard":[["hasAny",["code","country","has","spain"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Spain":"The code whose country is Spain is ES."}}},
{"id":"n-8a16b43c","guard":[["hasAny",["code","costa","country","has","rica"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Costa Rica":"The code whose country is Costa Rica is CR."}}},
{"id":"n-8c328252","guard":[["hasAny",["code","country","has","tanzania"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Tanzania":"The code whose country is Tanzania is TZ."}}},
{"id":"n-8d2ebbf3","guard":[["hasAny",["code","country","has","mauritania"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Mauritania":"The code whose country is Mauritania is MR."}}},
{"id":"n-8d4da813","guard":[["hasAny",["code","country","grenadines","has","st","vincent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country St. Vincent and the Grenadines":"The code whose country is St. Vincent and the Grenadines is VC."}}},
{"id":"n-8dd752b9","guard":[["hasAny",["code","country","lesotho","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is Lesotho":"The code whose country is Lesotho is LS."}}},
{"id":"n-90af3aa8","guard":[["hasAny",["code","country","name","suriname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is Suriname":"The code whose country is Suriname is SR."}}},
{"id":"n-90c7e395","guard":[["hasAny",["code","country","monaco"]],["has","is"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Monaco is the country of which code":"The code whose country is Monaco is MC."}}},
{"id":"n-96fc81a3","guard":[["hasAny",["code","country","has","kuwait"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Kuwait":"The code whose country is Kuwait is KW."}}},
{"id":"n-9e8856eb","guard":[["hasAny",["burundi","code","country","has"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Burundi":"The code whose country is Burundi is BI."}}},
{"id":"n-ac77bd90","guard":[["hasAny",["bangladesh","code","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Bangladesh is the country of which code":"The code whose country is Bangladesh is BD."}}},
{"id":"n-c4fdc209","guard":[["hasAny",["code","country","has","iraq"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Iraq":"The code whose country is Iraq is IQ."}}},
{"id":"n-c78da078","guard":[["hasAny",["code","country","haiti","has"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Haiti":"The code whose country is Haiti is HT."}}},
{"id":"n-c79b7b9a","guard":[["hasAny",["chad","code","country","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is Chad":"The code whose country is Chad is TD."}}},
{"id":"n-c79e30f0","guard":[["hasAny",["code","country","honduras","name"]],["words<=",7]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is Honduras":"The code whose country is Honduras is HN."}}},
{"id":"n-cbd7b1de","guard":[["hasAny",["code","country","moldova","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is Moldova":"The code whose country is Moldova is MD."}}},
{"id":"n-ceda4def","guard":[["hasAny",["code","country","slovakia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Slovakia is the country of which code":"The code whose country is Slovakia is SK."}}},
{"id":"n-cffbd40c","guard":[["hasAny",["code","country","has","nauru"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Nauru":"The code whose country is Nauru is NR."}}},
{"id":"n-d58e9bcc","guard":[["hasAny",["code","country","has","madagascar"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Madagascar":"The code whose country is Madagascar is MG."}}},
{"id":"n-d836186e","guard":[["hasAny",["bahrain","code","country","name"]],["has","whose"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is Bahrain":"The code whose country is Bahrain is BH."}}},
{"id":"n-d86d2e3a","guard":[["hasAny",["code","country","fiji"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Fiji is the country of which code":"The code whose country is Fiji is FJ."}}},
{"id":"n-df3f9429","guard":[["hasAny",["code","country","has","new","zealand"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country New Zealand":"The code whose country is New Zealand is NZ."}}},
{"id":"n-df770397","guard":[["hasAny",["code","country","senegal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Senegal is the country of which code":"The code whose country is Senegal is SN."}}},
{"id":"n-e02fa5d8","guard":[["hasAny",["china","code","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"China is the country of which code":"The code whose country is China is CN."}}},
{"id":"n-e192c48e","guard":[["hasAny",["chile","code","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Chile is the country of which code":"The code whose country is Chile is CL."}}},
{"id":"n-e47cf9b2","guard":[["hasAny",["code","country","leone","sierra"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Sierra Leone is the country of which code":"The code whose country is Sierra Leone is SL."}}},
{"id":"n-e57ccf2f","guard":[["hasAny",["bosnia","code","country","has","herzegovina"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Bosnia and Herzegovina":"The code whose country is Bosnia and Herzegovina is BA."}}},
{"id":"n-e952b3d1","guard":[["hasAny",["code","country","has","libya"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Libya":"The code whose country is Libya is LY."}}},
{"id":"n-eea5cf0d","guard":[["hasAny",["code","country","sudan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Sudan is the country of which code":"The code whose country is Sudan is SD."}}},
{"id":"n-f38d783f","guard":[["hasAny",["code","country","liberia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Liberia is the country of which code":"The code whose country is Liberia is LR."}}},
{"id":"n-faf55fc1","guard":[["hasAny",["code","country","name","nigeria"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the code whose country is Nigeria":"The code whose country is Nigeria is NG."}}},
{"id":"n-fb5784ed","guard":[["hasAny",["code","country","has","zimbabwe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which code has the country Zimbabwe":"The code whose country is Zimbabwe is ZW."}}},
{"id":"n-ffa75434","guard":[["hasAny",["code","country","seychelles"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Seychelles is the country of which code":"The code whose country is Seychelles is SC."}}},
{"id":"n-1aecd970","guard":[["hasAny",["fiji","no vowels","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-63076aca","guard":[["hasAny",["fiji","no vowels","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-76f1cc7f","guard":[["hasAny",["fiji","no vowels","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-801f0b58","guard":[["hasAny",["abbreviate","acronym","marino","short form"]],["has","name"]],"pyramid":["render.code",["transform.acronym",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-8547a0c6","guard":[["hasAny",["fiji","no vowels","remove vowels","shortest","shortest one","shortest word","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-85edb2c7","guard":[["hasAny",["costa","no vowels","remove vowels","reversed","spell backwards","without vowels"]],["has","country"],["has","which"]],"pyramid":["render.str",["transform.noVowels",["transform.reverse",["sense.lastWord"]]]],"mem":null},
{"id":"n-8922bcec","guard":[["hasAny",["fiji","no vowels","remove vowels","shortest","shortest one","shortest word","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-8e9ce0c0","guard":[["hasAny",["fiji","no vowels","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-b97751df","guard":[["hasAny",["abbreviate","acronym","marino","short form"]],["has","name"]],"pyramid":["render.str",["transform.acronym",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-be1669ac","guard":[["hasAny",["costa","no vowels","remove vowels","reversed","spell backwards","without vowels"]],["has","country"],["has","which"]],"pyramid":["render.code",["transform.noVowels",["transform.reverse",["sense.lastWord"]]]],"mem":null},
{"id":"n-006154ed","guard":[["hasAny",["camel case","camelcase","fiji","lower camel case","no vowels","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.camel",["transform.noVowels",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-05e35344","guard":[["hasAny",["alphabetize the letters","fiji","letters in order","no vowels","remove vowels","sort the letters","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["transform.sortLetters",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-0695b45e","guard":[["hasAny",["class name","fiji","no vowels","pascal case","pascalcase","remove vowels","upper camel case","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["transform.pascal",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-14684831","guard":[["hasAny",["abbreviate","acronym","dashes","hyphens","kebab case","kebabcase","marino","short form"]],["has","name"]],"pyramid":["render.str",["transform.acronym",["transform.kebab",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-240d378e","guard":[["hasAny",["caesar cipher","rotate the letters","seychelles","shift by","shift each letter","shortest","shortest one","shortest word"]],["has","code"],["has","which"]],"pyramid":["render.str",["transform.caesar",["aggregate.shortest",["sense.words"]],{"lit":10}]],"mem":null},
{"id":"n-2df4f89f","guard":[["hasAny",["camel case","camelcase","fiji","lower camel case","no vowels","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["transform.camel",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-2fedf354","guard":[["hasAny",["abbreviate","acronym","marino","no vowels","remove vowels","short form","without vowels"]],["has","name"]],"pyramid":["render.str",["transform.noVowels",["transform.acronym",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-391d8dda","guard":[["hasAny",["camel case","camelcase","fiji","lower camel case","no vowels","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.camel",["transform.noVowels",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-3aff67a8","guard":[["hasAny",["caesar cipher","rotate the letters","seychelles","shift by","shift each letter","shortest","shortest one","shortest word"]],["has","code"],["has","which"]],"pyramid":["render.code",["transform.caesar",["aggregate.shortest",["sense.words"]],{"lit":10}]],"mem":null},
{"id":"n-3c5fa7a4","guard":[["hasAny",["class name","fiji","no vowels","pascal case","pascalcase","remove vowels","upper camel case","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["transform.pascal",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-3dd0529d","guard":[["hasAny",["alphabetize the letters","fiji","letters in order","no vowels","remove vowels","sort the letters","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["transform.sortLetters",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-42d5093e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fiji","no vowels","remove vowels","title case","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["transform.title",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-4337b74d","guard":[["hasAny",["caesar cipher","rotate the letters","seychelles","shift by","shift each letter"]],["has","code"],["has","which"]],"pyramid":["render.code",["transform.caesar",["sense.wordAt",{"lit":2}],{"lit":10}]],"mem":null},
{"id":"n-44ad4b3c","guard":[["hasAny",["abbreviate","acronym","class name","marino","pascal case","pascalcase","short form","upper camel case"]],["has","name"]],"pyramid":["render.str",["transform.pascal",["transform.acronym",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-468cd233","guard":[["hasAny",["abbreviate","acronym","dashes","hyphens","kebab case","kebabcase","marino","short form"]],["has","name"]],"pyramid":["render.code",["transform.acronym",["transform.kebab",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-4eb6eec3","guard":[["hasAny",["fiji","item number","no vowels","nth","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-54bba2d1","guard":[["hasAny",["abbreviate","acronym","marino","no vowels","remove vowels","short form","without vowels"]],["has","name"]],"pyramid":["render.str",["transform.acronym",["transform.noVowels",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-55f69560","guard":[["hasAny",["fiji","no vowels","remove vowels","snake case","snakecase","underscores","variable name","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["transform.snake",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-582d7380","guard":[["hasAny",["fiji","item number","no vowels","nth","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["transform.nthStr",["sense.words"],{"lit":1}]]],"mem":null},
{"id":"n-61a3fc53","guard":[["hasAny",["abbreviate","acronym","marino","no vowels","remove vowels","short form","without vowels"]],["has","name"]],"pyramid":["render.code",["transform.acronym",["transform.noVowels",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-63919d2e","guard":[["hasAny",["camel case","camelcase","fiji","lower camel case","no vowels","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.camel",["transform.noVowels",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-653b88ef","guard":[["hasAny",["alphabetize the letters","fiji","letters in order","no vowels","remove vowels","sort the letters","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["transform.sortLetters",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-65588f7a","guard":[["hasAny",["fiji","lower case","lowercase","no vowels","remove vowels","small letters","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.lower",["transform.noVowels",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-67e25a7c","guard":[["hasAny",["abbreviate","acronym","camel case","camelcase","lower camel case","marino","short form"]],["has","name"]],"pyramid":["render.str",["transform.camel",["transform.acronym",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-6965db99","guard":[["hasAny",["class name","fiji","no vowels","pascal case","pascalcase","remove vowels","upper camel case","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.pascal",["transform.noVowels",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-6d597999","guard":[["hasAny",["all caps","capital letters","capitals","fiji","no vowels","remove vowels","upper case","uppercase","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["transform.upper",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-6fe355f1","guard":[["hasAny",["fiji","invert case","no vowels","remove vowels","swap case","toggle case","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["transform.swapCase",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-78a98690","guard":[["hasAny",["alphabetize the letters","fiji","letters in order","no vowels","remove vowels","sort the letters","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["transform.sortLetters",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-79bcd0f5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fiji","no vowels","remove vowels","title case","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["transform.title",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-80cd3ecf","guard":[["hasAny",["class name","fiji","no vowels","pascal case","pascalcase","remove vowels","upper camel case","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["transform.pascal",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-88d66812","guard":[["hasAny",["fiji","invert case","no vowels","remove vowels","swap case","toggle case","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["transform.swapCase",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-8a875490","guard":[["hasAny",["fiji","no vowels","remove vowels","reverse the words","reverse word order","without vowels","words backwards"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["transform.reverseWords",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-8e6c9df2","guard":[["hasAny",["lowest terms","madagascar","reduce the fraction","simplest form","simplify the fraction"]],["has","country"],["has","has"]],"pyramid":["render.str",["transform.base64",["compute.fraction",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-8ec1a521","guard":[["hasAny",["capital letters","capitals","fiji","no vowels","remove vowels","upper case","uppercase","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["transform.upper",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-96540d75","guard":[["hasAny",["dashes","fiji","hyphens","kebab case","kebabcase","no vowels","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.kebab",["transform.noVowels",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-9678cb1c","guard":[["hasAny",["camel case","camelcase","fiji","lower camel case","no vowels","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["transform.camel",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-976ea591","guard":[["hasAny",["abbreviate","acronym","marino","no vowels","remove vowels","short form","without vowels"]],["has","name"]],"pyramid":["render.code",["transform.noVowels",["transform.acronym",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-a2f4075f","guard":[["hasAny",["abbreviate","acronym","first letters of the name","initials","marino","short form"]],["has","name"]],"pyramid":["render.code",["transform.acronym",["transform.initials",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-a7bb574f","guard":[["hasAny",["class name","first letters of the name","initials","marino","pascal case","pascalcase","upper camel case"]],["has","name"]],"pyramid":["render.str",["transform.pascal",["transform.initials",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-a7c07574","guard":[["hasAny",["fiji","lower case","lowercase","no vowels","remove vowels","small letters","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.lower",["transform.noVowels",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-ac60ef44","guard":[["hasAny",["lowest terms","madagascar","reduce the fraction","simplest form","simplify the fraction"]],["has","country"],["has","has"]],"pyramid":["render.code",["transform.base64",["compute.fraction",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-ac6965a9","guard":[["hasAny",["fiji","no vowels","remove vowels","reverse the words","reverse word order","without vowels","words backwards"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["transform.reverseWords",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-accbb357","guard":[["hasAny",["fiji","item number","no vowels","nth","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["sense.words"],{"lit":1}]]],"mem":null},
{"id":"n-aeb83857","guard":[["hasAny",["fiji","invert case","no vowels","remove vowels","swap case","toggle case","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["transform.swapCase",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-b40a8c84","guard":[["hasAny",["caesar cipher","rotate the letters","seychelles","shift by","shift each letter"]],["has","code"],["has","which"]],"pyramid":["render.str",["transform.caesar",["sense.wordAt",{"lit":2}],{"lit":10}]],"mem":null},
{"id":"n-b89ee93b","guard":[["hasAny",["congo","item number","no vowels","nth","remove vowels","without vowels"]],["has","country"],["has","dem"]],"pyramid":["render.code",["transform.noVowels",["transform.nthStr",["sense.content"],{"lit":5}]]],"mem":null},
{"id":"n-bc98f68c","guard":[["hasAny",["abbreviate","acronym","camel case","camelcase","lower camel case","marino","short form"]],["has","name"]],"pyramid":["render.code",["transform.camel",["transform.acronym",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-c12a1da2","guard":[["hasAny",["abbreviate","acronym","reverse the words","reverse word order","short form","timorleste","words backwards"]],["has","country"]],"pyramid":["render.str",["transform.acronym",["transform.reverseWords",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-c328d854","guard":[["hasAny",["camel case","camelcase","first letters of the name","initials","lower camel case","marino"]],["has","name"]],"pyramid":["render.code",["transform.camel",["transform.initials",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-c3a448ff","guard":[["hasAny",["fiji","no vowels","remove vowels","snake case","snakecase","underscores","variable name","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["transform.snake",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-c4c6c5e1","guard":[["hasAny",["dashes","fiji","hyphens","kebab case","kebabcase","no vowels","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.kebab",["transform.noVowels",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-c5372cf3","guard":[["hasAny",["fiji","invert case","no vowels","remove vowels","swap case","toggle case","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["transform.swapCase",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-c8a65aa8","guard":[["hasAny",["camel case","camelcase","first letters of the name","initials","lower camel case","marino"]],["has","name"]],"pyramid":["render.str",["transform.camel",["transform.initials",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-c9a9f7b3","guard":[["hasAny",["class name","fiji","no vowels","pascal case","pascalcase","remove vowels","upper camel case","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.pascal",["transform.noVowels",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-d8e81fe0","guard":[["hasAny",["abbreviate","acronym","first letters of the name","initials","marino","short form"]],["has","name"]],"pyramid":["render.str",["transform.acronym",["transform.initials",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-daf040c1","guard":[["hasAny",["class name","fiji","no vowels","pascal case","pascalcase","remove vowels","upper camel case","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.pascal",["transform.noVowels",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-dc0b450a","guard":[["hasAny",["abbreviate","acronym","class name","marino","pascal case","pascalcase","short form","upper camel case"]],["has","name"]],"pyramid":["render.code",["transform.pascal",["transform.acronym",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-deb03d62","guard":[["hasAny",["class name","first letters of the name","initials","marino","pascal case","pascalcase","upper camel case"]],["has","name"]],"pyramid":["render.code",["transform.pascal",["transform.initials",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-e170afd8","guard":[["hasAny",["abbreviate","acronym","reverse the words","reverse word order","short form","timorleste","words backwards"]],["has","country"]],"pyramid":["render.code",["transform.acronym",["transform.reverseWords",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-e2492d47","guard":[["hasAny",["class name","fiji","no vowels","pascal case","pascalcase","remove vowels","upper camel case","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.pascal",["transform.noVowels",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-e6ebd9bc","guard":[["hasAny",["congo","item number","no vowels","nth","remove vowels","without vowels"]],["has","country"],["has","dem"]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["sense.content"],{"lit":5}]]],"mem":null},
{"id":"n-e7800d70","guard":[["hasAny",["lowest terms","madagascar","reduce the fraction","simplest form","simplify the fraction"]],["has","country"],["has","has"]],"pyramid":["render.code",["transform.base64",["compute.fraction",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-e8d140e1","guard":[["hasAny",["lowest terms","madagascar","reduce the fraction","simplest form","simplify the fraction"]],["has","country"],["has","has"]],"pyramid":["render.str",["transform.base64",["compute.fraction",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-f0526225","guard":[["hasAny",["camel case","camelcase","fiji","lower camel case","no vowels","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.camel",["transform.noVowels",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-f2cb59c1","guard":[["hasAny",["all caps","capital letters","capitals","fiji","no vowels","remove vowels","upper case","uppercase","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["transform.upper",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-f7078692","guard":[["hasAny",["fiji","item number","no vowels","nth","remove vowels","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["transform.nthStr",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-f7d5a030","guard":[["hasAny",["capital letters","capitals","fiji","no vowels","remove vowels","upper case","uppercase","without vowels"]],["has","country"]],"pyramid":["render.code",["transform.noVowels",["transform.upper",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-f981e402","guard":[["hasAny",["class name","fiji","no vowels","pascal case","pascalcase","remove vowels","upper camel case","without vowels"]],["has","country"]],"pyramid":["render.str",["transform.noVowels",["transform.pascal",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-4c2bbc22","guard":[["hasAny",["item number","montenegro","nth"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is Montenegro is ME."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9cc9627f","guard":[["hasAny",["item number","montenegro","nth"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-29b2b7de","guard":[["hasAny",["class name","item number","montenegro","nth","pascal case","pascalcase","upper camel case"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.pascal",["sense.lastWord"]]],"mem":null},
{"id":"n-52e582f9","guard":[["hasAny",["camel case","camelcase","item number","lower camel case","montenegro","nth"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-7669931d","guard":[["hasAny",["item number","lower case","lowercase","montenegro","nth","small letters"]],["has","country"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ME."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0158c23d","guard":[["has","guyana"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is Guyana":"The code whose country is Guyana is GY."}}},
{"id":"n-0bb1bd0b","guard":[["has","cameroon"],["has","name"],["words<=",7]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is Cameroon":"The code whose country is Cameroon is CM."}}},
{"id":"n-0dcd384b","guard":[["has","ukraine"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is Ukraine":"The code whose country is Ukraine is UA."}}},
{"id":"n-11310a70","guard":[["has","benin"],["has","which"],["has","code"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Benin is the country of which code":"The code whose country is Benin is BJ."}}},
{"id":"n-119afabc","guard":[["has","spain"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Spain":"The code whose country is Spain is ES."}}},
{"id":"n-1741bca4","guard":[["has","togo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Togo":"The code whose country is Togo is TG."}}},
{"id":"n-18cd8cd5","guard":[["has","slovakia"],["has","country"],["has","is"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Slovakia is the country of which code":"The code whose country is Slovakia is SK."}}},
{"id":"n-1d33a43c","guard":[["has","liberia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Liberia is the country of which code":"The code whose country is Liberia is LR."}}},
{"id":"n-1e23f2af","guard":[["has","cambodia"],["has","is"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Cambodia is the country of which code":"The code whose country is Cambodia is KH."}}},
{"id":"n-20d216b7","guard":[["has","chad"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is Chad":"The code whose country is Chad is TD."}}},
{"id":"n-21bd3d7d","guard":[["has","netherlands"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Netherlands":"The code whose country is Netherlands is NL."}}},
{"id":"n-23c576a3","guard":[["has","senegal"],["has","country"],["has","code"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Senegal is the country of which code":"The code whose country is Senegal is SN."}}},
{"id":"n-287af3d7","guard":[["has","bangladesh"],["has","country"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Bangladesh is the country of which code":"The code whose country is Bangladesh is BD."}}},
{"id":"n-2c063819","guard":[["has","andorra"],["has","which"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Andorra is the country of which code":"The code whose country is Andorra is AD."}}},
{"id":"n-2ce397c3","guard":[["has","zealand"],["has","has"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country New Zealand":"The code whose country is New Zealand is NZ."}}},
{"id":"n-313dc511","guard":[["has","moldova"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is Moldova":"The code whose country is Moldova is MD."}}},
{"id":"n-318e579d","guard":[["has","korea"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"North Korea is the country of which code":"The code whose country is North Korea is KP."}}},
{"id":"n-338417f0","guard":[["has","poland"],["has","has"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Poland":"The code whose country is Poland is PL."}}},
{"id":"n-34a5de93","guard":[["has","algeria"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is Algeria":"The code whose country is Algeria is DZ."}}},
{"id":"n-39ac1f22","guard":[["has","seychelles"],["has","which"],["has","code"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Seychelles is the country of which code":"The code whose country is Seychelles is SC."}}},
{"id":"n-3d3a0589","guard":[["hasAny",["costa","rica"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Costa Rica":"The code whose country is Costa Rica is CR."}}},
{"id":"n-41bf02e0","guard":[["hasAny",["code","country","islands","marshall"]],["has","which"],["has","is"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Marshall Islands is the country of which code":"The code whose country is Marshall Islands is MH."}}},
{"id":"n-48c27e06","guard":[["has","mauritania"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Mauritania":"The code whose country is Mauritania is MR."}}},
{"id":"n-4bbac2d9","guard":[["has","nigeria"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is Nigeria":"The code whose country is Nigeria is NG."}}},
{"id":"n-50d1c665","guard":[["has","pakistan"],["has","is"],["has","country"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Pakistan is the country of which code":"The code whose country is Pakistan is PK."}}},
{"id":"n-51195bf0","guard":[["has","sudan"],["has","is"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Sudan is the country of which code":"The code whose country is Sudan is SD."}}},
{"id":"n-572361dc","guard":[["has","ireland"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is Ireland":"The code whose country is Ireland is IE."}}},
{"id":"n-5bfb1c69","guard":[["has","turkmenistan"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Turkmenistan is the country of which code":"The code whose country is Turkmenistan is TM."}}},
{"id":"n-5cf45fae","guard":[["hasAny",["code","congo","country","dem","rep"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Congo (Dem. Rep.) is the country of which code":"The code whose country is Congo (Dem. Rep.) is CD."}}},
{"id":"n-5d52fc35","guard":[["has","tunisia"],["has","is"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Tunisia is the country of which code":"The code whose country is Tunisia is TN."}}},
{"id":"n-61f6c06d","guard":[["has","kuwait"],["has","has"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Kuwait":"The code whose country is Kuwait is KW."}}},
{"id":"n-68b10995","guard":[["has","china"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"China is the country of which code":"The code whose country is China is CN."}}},
{"id":"n-6a3a9dae","guard":[["hasAny",["marino","san"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is San Marino":"The code whose country is San Marino is SM."}}},
{"id":"n-6c12dfbe","guard":[["has","chile"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Chile is the country of which code":"The code whose country is Chile is CL."}}},
{"id":"n-6fbbb60d","guard":[["has","monaco"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Monaco is the country of which code":"The code whose country is Monaco is MC."}}},
{"id":"n-73a6cc5d","guard":[["hasAny",["guinea","papua"]],["has","has"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Papua New Guinea":"The code whose country is Papua New Guinea is PG."}}},
{"id":"n-7971c0cd","guard":[["has","madagascar"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Madagascar":"The code whose country is Madagascar is MG."}}},
{"id":"n-7a943a22","guard":[["has","haiti"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Haiti":"The code whose country is Haiti is HT."}}},
{"id":"n-83567c1d","guard":[["has","timorleste"],["has","is"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Timor-Leste is the country of which code":"The code whose country is Timor-Leste is TL."}}},
{"id":"n-8bafaa76","guard":[["has","lesotho"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is Lesotho":"The code whose country is Lesotho is LS."}}},
{"id":"n-8de8f7a9","guard":[["has","samoa"],["has","code"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Samoa":"The code whose country is Samoa is WS."}}},
{"id":"n-8e5d3273","guard":[["has","honduras"],["has","name"],["words<=",7]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is Honduras":"The code whose country is Honduras is HN."}}},
{"id":"n-96c093fe","guard":[["has","malta"],["has","is"],["has","country"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Malta is the country of which code":"The code whose country is Malta is MT."}}},
{"id":"n-96e75bd1","guard":[["has","burundi"],["has","has"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Burundi":"The code whose country is Burundi is BI."}}},
{"id":"n-98abda32","guard":[["has","fiji"],["has","is"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Fiji is the country of which code":"The code whose country is Fiji is FJ."}}},
{"id":"n-9b5f4150","guard":[["has","bulgaria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Bulgaria":"The code whose country is Bulgaria is BG."}}},
{"id":"n-9f6942bd","guard":[["hasAny",["code","country","kitts","name","nevis","st"]],["has","st"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is St. Kitts and Nevis":"The code whose country is St. Kitts and Nevis is KN."}}},
{"id":"n-a019d044","guard":[["has","montenegro"],["has","has"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Montenegro":"The code whose country is Montenegro is ME."}}},
{"id":"n-a13dd3a9","guard":[["has","guineabissau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Guinea-Bissau":"The code whose country is Guinea-Bissau is GW."}}},
{"id":"n-a39a98e7","guard":[["has","iraq"],["has","which"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Iraq":"The code whose country is Iraq is IQ."}}},
{"id":"n-ab0edcf4","guard":[["has","nauru"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Nauru":"The code whose country is Nauru is NR."}}},
{"id":"n-ba372339","guard":[["hasAny",["bosnia","herzegovina"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Bosnia and Herzegovina":"The code whose country is Bosnia and Herzegovina is BA."}}},
{"id":"n-bc4390a2","guard":[["has","eswatini"],["has","code"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is eSwatini":"The code whose country is eSwatini is SZ."}}},
{"id":"n-c1967a70","guard":[["has","tanzania"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Tanzania":"The code whose country is Tanzania is TZ."}}},
{"id":"n-c41fea95","guard":[["hasAny",["el","salvador"]],["has","has"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country El Salvador":"The code whose country is El Salvador is SV."}}},
{"id":"n-c7e61739","guard":[["has","myanmar"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is Myanmar":"The code whose country is Myanmar is MM."}}},
{"id":"n-d1746c00","guard":[["hasAny",["code","country","name","principe","sao","tome"]],["has","whose"],["has","sao"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is Sao Tome and Principe":"The code whose country is Sao Tome and Principe is ST."}}},
{"id":"n-d22170e0","guard":[["has","bahrain"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is Bahrain":"The code whose country is Bahrain is BH."}}},
{"id":"n-e3285363","guard":[["hasAny",["arab","code","country","emirates","name","united"]],["has","whose"],["has","united"],["has","arab"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is United Arab Emirates":"The code whose country is United Arab Emirates is AE."}}},
{"id":"n-e43824cb","guard":[["has","zimbabwe"],["words<=",6]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Zimbabwe":"The code whose country is Zimbabwe is ZW."}}},
{"id":"n-e5788a50","guard":[["has","macedonia"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is North Macedonia":"The code whose country is North Macedonia is MK."}}},
{"id":"n-ead5bc9e","guard":[["hasAny",["code","country","grenadines","has","st","vincent"]],["has","code"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country St. Vincent and the Grenadines":"The code whose country is St. Vincent and the Grenadines is VC."}}},
{"id":"n-f2897e39","guard":[["hasAny",["code","country","leone","sierra"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Sierra Leone is the country of which code":"The code whose country is Sierra Leone is SL."}}},
{"id":"n-f4141669","guard":[["has","portugal"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is Portugal":"The code whose country is Portugal is PT."}}},
{"id":"n-fda863ec","guard":[["has","suriname"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the code whose country is Suriname":"The code whose country is Suriname is SR."}}},
{"id":"n-ff332c40","guard":[["has","libya"],["has","has"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which code has the country Libya":"The code whose country is Libya is LY."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the code whose country is Algeria","expect":{"contains":["DZ"],"notRefusal":true}},{"q":"which code has the country Costa Rica","expect":{"contains":["CR"],"notRefusal":true}},{"q":"name the code whose country is North Macedonia","expect":{"contains":["MK"],"notRefusal":true}},{"q":"Liberia is the country of which code","expect":{"contains":["LR"],"notRefusal":true}},{"q":"name the code whose country is Ireland","expect":{"contains":["IE"],"notRefusal":true}},{"q":"Benin is the country of which code","expect":{"contains":["BJ"],"notRefusal":true}},{"q":"which code has the country Tanzania","expect":{"contains":["TZ"],"notRefusal":true}},{"q":"Marshall Islands is the country of which code","expect":{"contains":["MH"],"notRefusal":true}},{"q":"which code has the country El Salvador","expect":{"contains":["SV"],"notRefusal":true}},{"q":"name the code whose country is Nigeria","expect":{"contains":["NG"],"notRefusal":true}},{"q":"which code has the country Bulgaria","expect":{"contains":["BG"],"notRefusal":true}},{"q":"name the code whose country is Chad","expect":{"contains":["TD"],"notRefusal":true}},{"q":"which code has the country Bosnia and Herzegovina","expect":{"contains":["BA"],"notRefusal":true}},{"q":"which code has the country Libya","expect":{"contains":["LY"],"notRefusal":true}},{"q":"North Korea is the country of which code","expect":{"contains":["KP"],"notRefusal":true}},{"q":"which code has the country Samoa","expect":{"contains":["WS"],"notRefusal":true}},{"q":"Chile is the country of which code","expect":{"contains":["CL"],"notRefusal":true}},{"q":"which code has the country Iraq","expect":{"contains":["IQ"],"notRefusal":true}},{"q":"name the code whose country is St. Kitts and Nevis","expect":{"contains":["KN"],"notRefusal":true}},{"q":"name the code whose country is Honduras","expect":{"contains":["HN"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
