// tld-sponsor-neo-g10-2.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"tld-sponsor-neo-g10-2","class":"tld-sponsor","generation":10,"lane":"neo","grownFrom":["name the sponsoring body of .भारत","who sponsors the top-level domain .ee","who sponsors the top-level domain .tiaa","who sponsors the top-level domain ‏.امارات‎","who sponsors the top-level domain .seat","which organization runs the domain .pamperedchef","who sponsors the top-level domain .asda","name the sponsoring body of .marriott","name the sponsoring body of .express","who sponsors the top-level domain .xyz","name the sponsoring body of .bar","which organization runs the domain .surf","who sponsors the top-level domain .ye","who sponsors the top-level domain .sas","which organization runs the domain .ls","name the sponsoring body of .plumbing","which organization runs the domain .study","which organization runs the domain .sv","which organization runs the domain .hospital","which organization runs the domain .мон"],"version":1});

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
knowLoad([{"id":"tld-types","columns":["top-level domain","sponsoring organization"],"n":1594,"cols":[{"f":"0.abarth|3ogado|3udhabi|2c|3ademy|3tor|2ds|2e|2gakhan|2libaba|2m|3azon|3ericanexpress|9family|2nquan|2rab|4mco|3chi|2thleta|2udio|2zure|1banamex|4k|3r|4celona|5laycard|4efoot|3seball|2d|2f|2h|2lockbuster|2mw|2om|3nd|3oking|3sch|3x|2russels|2v|2y|1capetown|3se|3tholic|2ba|2h|3arity|4se|2ircle|3tic|2lick|4nique|2n|2ologne|3m|4sec|3op|2ruise|2uisinella|2ymru|1datsun|2esi|2vag|3r|2z|1earth|2u|1fans|2eedback|2ido|2ord|4um|2r|3ontier|2un|1george|2f|2gee|2oldpoint|2r|1hk|2omedepot|5goods|1il|2n|3tuit|2q|2st|1jaguar|3va|2io|2ll|2o|2p|1kerryhotels|2fh|2z|1la|2exus|2idl|2pl|2tda|1ma|2erckmsd|2k|2n|2o|3scow|2r|2y|1nab|3goya|2ext|2go|1okinawa|2layan|2mega|2nline|1pccw|2hilips|2ru|1qa|1redumbrella|2s|2u|3hr|1sa|3msung|3ndvik|2bi|2d|2g|2hangrila|2ina|2tc|2y|1temasek|2h|2n|2w|1unicom|1vote|1weather|1कॉम|1佛山|1在线|1公益|1онлайн|1商标|1ලංකා|1भारत|1健康|1հայ|1au|1gmx|1leclerc|1aarp|2bb|2co|2lstom|2ol|1cloud|1as|2udi|2ws|2xa|2bbvie|4ott|3le|0‏.ابوظبي‎|0.kyoto|1si|1accenture|2etna|0‏.المغرب‎|0.ga|1cm|0‏.تونس‎|0.ml|1bo|1cv|1airbus|2eg|2lipay|1taobao|2mall|1allfinanz|4state|4y|2mfam|1buy|1audible|3thor|1book|3t|1call|2oupon|1deal|1fast|2ire|2ree|1hot|1imdb|1joy|1kindle|1like|1moi|1now|1pay|2in|2rime|1read|2oom|1safe|3ve|2ecure|2ilk|2mile|2ong|2pot|1talk|2unes|3shu|1wanggou|2ow|1yamaxun|2ou|1zappos|2ero|1アマゾン|1クラウド|1ストア|1セール|1ファッション|1ポイント|1亚马逊|1家電|1書籍|1通販|1食品|1aaa|1bible|1lifeinsurance|1amex|1open|1cpa|1aig|2mica|2d|2q|2pple|2quarelle|0‏.ارامكو‎|0.asda|1spa|1kg|1gal|1pm|1re|1tf|1wf|1yt|1arte|1қаз|1bzh|1pt|1anz|2fl|2uspost|1bn|1lamborghini|1tl|1gw|1bj|1tg|1ci|1bbva|3t|2estbuy|2npparibas|1ryukyu|1baidu|2radesco|2ofa|1pictet|1barclays|1mini|1bayern|2eats|1shouji|1xihuan|1yun|1手机|1中文网|1信息|1бел|1best|1airtel|1bharti|1eco|1tr|1accountants|2gency|2partments|2ssociates|1bargains|2ike|3ngo|2outique|2uilders|3siness|1cab|3fe|3mera|4p|3pital|3rds|4e|5ers|3sh|4ino|3tering|2enter|2hat|3eap|3urch|2ity|2laims|3eaning|3inic|3othing|2oach|3des|3ffee|3mmunity|4pany|5uter|3ndos|4struction|4tractors|3ol|3upons|2redit|7card|3uises|1dating|2eals|3livery|3ntal|2iamonds|3gital|3rect|7ory|3scount|2octor|3g|3mains|1education|2mail|2nergy|3gineering|3terprises|2quipment|2state|2vents|2xchange|3pert|4osed|4ress|1fail|3rm|2inance|7ial|3sh|3tness|2lights|3orist|2ootball|2und|3rniture|2yi|1gallery|2ifts|2lass|2mbh|2old|4f|2raphics|4tis|3ipe|3oup|2uide|3ru|1healthcare|2ockey|3ldings|4iday|3spital|3use|1immo|2ndustries|3stitute|4ure|3ternational|3vestments|2rish|1jetzt|3welry|1kitchen|1land|2ease|3gal|2ife|3ghting|3mited|4o|2oans|2td|1maison|3nagement|3rketing|2ba|2edia|2oney|3vie|1network|1partners|5s|2hotography|6s|2ictures|3zza|2lace|3umbing|4s|2roductions|4perties|1recipes|3ise|6n|3ntals|3pair|4ort|3staurant|2un|1salon|3rl|2chool|4ule|2ervices|2hoes|4pping|4w|2ingles|2occer|3lar|4utions|2tyle|2upplies|6y|5ort|3rgery|2ystems|1tax|4i|2eam|3chnology|3nnis|2heater|2ienda|3ps|3res|2oday|3ols|3urs|3wn|3ys|2raining|1university|1vacations|2entures|2iajes|3llas|3n|3sion|2oyage|1watch|2ine|2orks|4ld|2tf|1zone|1企业|1商店|1娱乐|1游戏|1bloomberg|1party|1boehringer|1hotels|1bostik|2w|2ridgestone|1firestone|1bms|2bc|2rother|1cam|1mq|1hr|1cbre|2u|1nr|0‏.الجزائر‎|0.cfa|2hintai|1中信|1commbank|1netbank|1сайт|0‏.بازار‎|0.cz|1analytics|1ca|3non|3pitalone|3ravan|1ge|1broadway|2i|1gn|1mz|1chanel|1android|2pp|1boo|1cal|2hannel|3rome|1dad|3y|2clk|2ev|2ocs|2rive|1eat|2sq|1fly|2oo|1gbiz|2le|2mail|2oog|5le|2uge|1hangout|2ere|2ow|1ing|1map|2eet|3me|2ov|1new|3xus|1page|2hd|2lay|2rod|4f|1rsvp|1search|2oy|1youtube|1zip|1みんな|1グーグル|1谷歌|1中国|2國|1公司|1网络|1政务|1联通|1cx|2isco|3tadel|4i|1helsinki|1paris|1clubmed|2orsica|1ve|1br|0‏.قطر‎|0.kw|0‏.عراق‎|2السعودية‎|0.km|1olayangroup|0‏.العليان‎|0.madrid|1ht|1рф|1lk|1hu|1crown|1gov|1vana|1de|1sling|1be|1vlaanderen|1kiwi|1qpon|1buzz|1nico|1dnp|2k|1lr|1мон|1dell|4oitte|4ta|2hl|1pohl|1vermögensberater|fung|1mv|1property|1radio|1mc|1discover|2ata|2ish|2ot|2tv|1latino|1mobile|1ollo|2tt|1phone|1abc|1dj|1mil|1airforce|2rmy|2ttorney|2uction|1band|2roker|1consulting|4tact|1dance|2egree|3mocrat|3ntist|1engineer|1family|3n|2orex|4sale|2utbol|1games|1haus|1immobilien|1juegos|1kaufen|1lawyer|2ive|1market|7s|2emorial|2oda|3rtgage|1navy|2ews|2inja|1pub|1rehab|3publican|3views|2ip|2ocks|1sale|2ocial|3ftware|2tudio|1trading|4vel|1vet|2ideo|1hiphop|1london|1menu|1scot|1vegas|1asia|1creditunion|1dm|1kids|1music|1dupont|3bai|1ec|2deka|3u|2rni|1ευ|1ею|1集团|1gent|1ee|2g|1al|1xin|1lilly|1trade|1nowruz|1pars|1shia|1tci|1wed|0‏.همراه‎|0.jobs|1rio|1er|2t|2urovision|1cern|1慈善|1men|1extraspace|1jeep|1flir|2o|3x|2rl|2m|2age|3irwinds|2k|2armers|2edex|1crs|1observer|1ferrero|5ari|2idelity|3|3rmdale|1win|1flickr|1akdn|1imamat|2smaili|1lincoln|1москва|1fresenius|2tr|2ujitsu|1cat|1lacaixa|1basketball|1gea|2q|2m|3o|1shop|1tokyo|1yokohama|1gallo|5up|1pr|1amsterdam|1norton|1ly|1网站|1globo|2odaddy|1pf|1ai|1me|1ws|1gs|1sh|1to|1grainger|1广东|1新闻|1gucci|1lundbeck|1hbo|2dfcbank|2m|2dfc|2sbc|2amburg|0‏.موقع‎|0.hermes|2isamitsu|3tachi|1va|1thd|1honda|1香港|1top|1ua|1cipriani|1hughes|2yatt|3undai|1adult|1xxx|1porn|1sex|1ελ|1ieee|2t|1ooo|1md|1lds|1mormon|1is|2tv|1bet|2io|2lack|3ue|1global|2reen|1info|1kim|1lgbt|2lc|2otto|1mobi|1organic|1pet|2ink|2oker|2ro|4mo|1red|1shiksha|2ki|1watches|1移动|1ikano|1бг|1zara|1icbc|1გე|1tj|1help|1ir|0‏.ایران‎|0.srl|1dealer|1inc|1llp|1ice|1moe|1ibm|0‏.شبكة‎|0.arpa|1int|2o|1mu|1餐厅|1country|1diy|1food|1hiv|1lifestyle|3ving|1realty|1sexy|1trust|1lb|1nz|1cg|1az|1mint|1ipiranga|1je|1gg|1im|2stanbul|2tau|1jcb|2pmorgan|2uniper|1landrover|1nhk|1jprs|1招聘|1jnj|1gdn|2ot|1jot|1onl|1lasalle|1kddi|2ia|1한국|1网址|1kpmg|2rd|1zuerich|1lt|1ke|3rryproperties|2uokgroup|1嘉里|3大酒店|1blog|1komatsu|2pn|1飞利浦|1kr|2osher|2red|0‏.بيتك‎|0.lanxess|2ego|1இலங்கை|1lplfinancial|2atrobe|1ລາວ|1tube|1lefrak|0‏.عرب‎|0.ls|1tatar|1locus|3tte|2uxury|1man|2lb|2ma|2s|3d|2tn|3r|0‏.مليسيا‎|0.澳門|1мкд|1mw|2arriott|2it|1jmp|1mattel|2ckinsey|2ed|1tc|1np|1emerck|1merck|1pw|1bing|1hotmail|1microsoft|1office|1skype|1windows|1xbox|1nrw|1af|0‏.الاردن‎|0.kn|1bt|1co|1ki|1bb|1so|0‏.فلسطين‎|0.ps|1ao|1vc|1mm|1tv|1mitsubishi|2onash|1voto|1film|1moto|1bcn|1museum|2aif|1nba|2ec|2fl|1mt|1cl|1mg|2x|1py|1nike|4on|2tt|1infiniti|1nissan|2a|1cr|1pharmacy|1reit|1ubank|0‏.سورية‎|0.ss|1ro|1ভারত|1ਭਾਰਤ|1ભારત|1இந்தியா|1భారత్|0‏.بھارت‎|0.भारतम्|4ोत|1ভাৰত|1ଭାରତ|1ಭಾರತ|1ഭാരതം|0‏.بارت‎|2ڀارت‎|0.nra|0‏.پاکستان‎|2مصر‎|0.购物|1政府|1netflix|1gh|2p|1neustar|3xtdirect|2g|2issay|2okia|1uk|1wales|1nf|2o|1sj|1active|2dac|2familycompany|2igo|2lfaromeo|2n|2vianca|1bananarepublic|2entley|2l|3anco|2nl|2oots|2q|2udapest|3gatti|1cancerresearch|3rtier|3seih|2bs|2eb|2hloe|3rysler|2ityeats|2omcast|3okingchannel|2sc|1dabur|2odge|3ha|3osan|2uck|3nlop|4s|1eh|2merson|2post|2surance|2tisalat|2verbank|1fiat|2lsmidth|2oodnetwork|2rontdoor|2ujixerox|1glade|2oo|4dhands|2uardian|1hgtv|2oneywell|3teles|2tc|1iinet|2ntel|2select|2veco|2wc|1jcp|2lc|1kerrylogistics|2inder|1ladbrokes|3ncaster|5ia|5ome|2iaison|3nde|3psy|3xil|2oft|2upin|1macys|3serati|2cd|4onalds|2eo|3tlife|2f|2obily|3ntblanc|3par|3vistar|2tpc|2utual|5elle|1nadex|3tionwide|4ura|2ewholland|2orthwesternmutual|1off|2ldnavy|2nyourside|2rientexpress|1pamperedchef|3nerai|3ssagens|2iaget|2ramerica|1qvc|1raid|2edstone|2ightathome|2mit|2ocher|1sapo|2ca|3johnson|3or|2es|2haw|3owtime|3riram|2piegel|3readbetting|2rt|2tarhub|4toil|2wiftcover|2ymantec|1telecity|5fonica|2iffany|2p|2ravelchannel|1uconnect|2m|1vista|6print|2olkswagen|2uelos|1warman|2olterskluwer|1xfinity|2peria|1zippo|1δοκιμή|1испытание|1परीक्षा|1பரிட்சை|1テスト|1一号店|1大众汽车|1工行|1手表|1测试|1測試|1珠宝|1诺基亚|1테스트|0‏.טעסט‎|2آزمایشی‎|2إختبار‎|2اتصالات‎|2موبايلي‎|0.link|1final|1obi|1frogans|1ovh|1cd|1nc|1mh|1one|2racle|4nge|1locker|1osaka|2tsuka|1電訊盈科|1hkt|1ph|2k|2nc|2g|1mango|1calvinklein|1richardli|1panasonic|1id|1pfizer|2hysio|2ing|3oneer|2n|1build|1quebec|1politie|1do|1католик|1天主教|0‏.كاثوليك‎|0.zw|1বাংলা|1praxi|1racing|1ar|1pwc|2rogressive|3udential|1ong|1орг|1संगठन|1机构|1组织机构|1foundation|1gives|4ing|1org|1rest|1eus|1alsace|1lu|1时尚|1rwe|1host|1press|1space|2tore|1tech|1uno|1website|1site|1realtor|1pe|1hn|1es|1bg|2m|2eer|2iz|2lackfriday|2oston|1casa|2lub|2ompare|3oking|3urses|1dds|2esign|1fashion|2ishing|3t|1garden|3y|1health|2orse|1ink|1law|2uxe|1miami|1photo|1rodeo|1select|2tudy|2urf|1tattoo|1us|1vip|2odka|1wedding|2iki|2ork|1yoga|1reliance|2il|1gop|1sas|1pl|1gb|2enting|1ricoh|2exroth|2ogers|1рус|1su|1rw|1sakura|1삼성|1sap|2chmidt|2eat|1aw|1sew|1nl|1sk|1ne|1stada|4tebank|2uzuki|2v|1li|1sx|2afety|1weber|1mp|1sandvikcoromant|1walter|1sanofi|1gi|1stcgroup|1viva|1saxo|2chaeffler|4olarships|4warz|1uy|1seek|1epson|1sener|1срб|1seven|1香格里拉|1sharp|3ell|1cfd|2you|1icu|1sbs|2l|1weibo|1微博|1சிங்கப்பூர்|1新加坡|1uz|1sky|2mart|1cf|1sfr|1aero|1sncf|2oftbank|3hu|2b|1playstation|1sony|2port|1世界|1staples|4r|1kp|1nowtv|1statefarm|2ydney|2tockholm|0‏.سودان‎|0.swiss|1tvs|2dk|1gl|1tm|2oshiba|3yota|2ui|2ab|3ipei|1台湾|2灣|1tz|2arget|3tamotors|2iaa|1st|1ye|1ck|1sm|1kh|1tk|1vu|1om|0‏.البحرين‎|2عمان‎|0.vg|0‏.امارات‎|0.ericsson|1vivo|1sr|1tel|1淡马锡|1teva|1ไทย|1bcg|1mls|1cbn|1nyc|1melbourne|1lamer|1origins|1дети|1gap|2oodyear|1nu|1se|0‏.ישראל‎|0.gd|1scb|2watch|1homesense|1marshalls|1tjmaxx|3x|2kmaxx|1winners|1fj|1vanguard|1weatherchannel|1pid|1toray|3tal|2ravelers|ainsurance|3v|1我爱你|1uol|2bs|1ag|2rt|1ups|2g|1укр|1gift|1post|1ni|1pa|1gt|1sn|1ie|1ba|2z|1cw|2y|1gu|2y|1lv|2c|1sz|1bs|1jm|1tt|0‏.موريتانيا‎|0.ky|1sc|1vig|2oting|1net|2ame|1ком|1नेट|1คอม|1コム|1大拿|1点看|1닷넷|2컴|0‏.קום‎|2كوم‎|0.verisign|2n|2iking|3rgin|3|3sa|2olvo|1sucks|1grocery|1samsclub|1walmart|1love|1weir|1bauhaus|1whoswho|2illiamhill|2me|2oodside|1rugby|1wtc|1auto|5s|1baby|2eauty|2oats|1car|4s|2eo|2hristmas|2ollege|1diet|1flowers|1game|2uitars|1hair|2omes|3sting|1lat|2ol|1makeup|2om|3nster|3torcycles|1pics|2rotection|1quest|1rent|1security|2kin|2torage|1theatre|2ickets|1xyz|1yachts|1xerox|1yandex|2odobashi|2ahoo|1africa|1durban|1joburg|1za|1ren|1zm|1商城|1八卦|1网店|1wang|1accountant|1bid|1cricket|1date|1faith|1loan|1review|1science|2tream|1download|1webcam|1berlin|1career|1koeln|1realestate|1saarland|1cc|1insurance|1rich|1ifm|1td|1at|1tirol|1wien|1versicherung|1ax","sep":"|"},{"f":"0Not assigned|0Registry Services, LLC|0Abu Dhabi Systems and Information Centre|0Internet Computer Bureau Limited|0Binky Moon, LLC|0Dog Beach, LLC|0Charleston Road Registry Inc.|0Telecommunications and Digital Government Regulatory Authority (TDRA)|0Fondation Aga Khan (Aga Khan Foundation)|0Alibaba Group Holding Limited|0\"Internet Society\" Non-governmental Organization|0Amazon Registry Services, Inc.|2erican Express Travel Related Services Company, Inc.|2Fam, Inc.|0Beijing Qihu Keji Co., Ltd.|0League of Arab States|0Aramco Services Company|0Identity Digital Limited|0The Gap, Inc.|0XYZ.COM LLC|0Microsoft Corporation|0Citigroup Inc.|0fTLD Registry Services, LLC|0Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable|0Municipi de Barcelona|0Barclays Bank PLC|0Gallo Vineyards, Inc.|0MLB Advanced Media DH, LLC|0Posts and Telecommunications Division|0Autorité de Régulation des Communications Electroniques et des Postes (ARCEP)|0Telecommunications Regulatory Authority (TRA)|0Dish DBS Corporation|0Bayerische Motoren Werke Aktiengesellschaft|0Núcleo de Informação e Coordenação do Ponto BR - NIC.br|0Shortdot SA|0Booking.com B.V.|0Robert Bosch GMBH|0Intercap Registry Inc.|0DNS.be vzw|0Norid A/S|0Belarusian Cloud Technologies LLC|0ZA Central Registry NPC trading as ZA Central Registry|0Digity, LLC|0Pontificium Consilium de Comunicationibus Socialibus (PCCS) (Pontifical Council for Social Communication)|0COMMONWEALTH BANK OF AUSTRALIA|0SWITCH The Swiss Education & Research Network|0Public Interest Registry (PIR)|0JPMorgan Chase Bank, National Association|1olly Host, LLC|0CITIC Group Corporation|0Internet Naming Co.|0The Estée Lauder Companies Inc.|0China Internet Network Information Center (CNNIC)|0dotKoeln GmbH|0VeriSign Global Registry Services|8, Inc.|0DotCooperation LLC|0Viking River Cruises (Bermuda) Ltd.|0SCHMIDT GROUPE S.A.S.|0Nominet UK|1ISSAN MOTOR CO., LTD.|0Emergency Back-End Registry Operator Program - ICANN|0Deutsche Vermögensberatung Aktiengesellschaft DVAG|1ISH Technologies L.L.C.|0CERIST|0Interlink Systems Innovation Institute K.K.|0EURid vzw|0ZDNS International Limited|0Top Level Spectrum, Inc.|0Rogers Communications Canada Inc.|0Ford Motor Company|1egistry, LLC|0Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)|0Frontier Communications Corporation|0Radix Technologies Inc.|0Wal-Mart Stores, Inc.|0CANAL+ TELECOM|0GMO Internet, Inc.|0YODOBASHI CAMERA CO.,LTD.|0ICS-FORTH GR|0Hong Kong Internet Registration Corporation Ltd.|2me Depot Product Authority, LLC|0The TJX Companies, Inc.|4Israel Internet Association (RA)|0National Internet Exchange of India|0Intuit Administrative Services, Inc.|0Communications and Media Commission (CMC)|0Istanbul Metropolitan Municipality|0Jaguar Land Rover Ltd|0Oracle Corporation|0Reliance Industries Limited|0Jones Lang LaSalle Incorporated|0Ministry of Digital Economy and Entrepreneurship (MoDEE)|0Japan Registry Services Co., Ltd.|0Kerry Trading Co. Limited|1uwait Finance House|0Association of IT Companies of Kazakhstan|0Lao National Internet Center (LANIC), Ministry of Technology and Communications|0TOYOTA MOTOR CORPORATION|0Schwarz Domains und Services GmbH & Co. KG|0LPL Holdings, Inc.|0InterNetX Corp.|0Agence Nationale de Réglementation des Télécommunications (ANRT)|0MSD Registry Holdings, Inc.|1acedonian Academic Research Network Skopje|0Datacom Co., Ltd.|0Macao Post and Telecommunications Bureau (CTT)|0Foundation for Assistance for Internet Technologies and Infrastructure Development (FAITID)|0Université de Nouakchott Al Aasriya|0MYNIC Berhad|0National Australia Bank Limited|0GMO Registry, Inc.|0Next plc|0Public Interest Registry|0BRregistry, Inc.|0Competrol (Luxembourg) Sarl|0The Swatch Group Ltd|0Radix Technologies Inc. SEZC|0PCCW Enterprises Limited|0Koninklijke Philips N.V.|0Prudential Financial, Inc.|0Communications Regulatory Authority|0Travelers TLD, LLC|0Serbian National Internet Domain Registry (RNIDS)|0Coordination Center for TLD RU|0dotSaarland GmbH|0Communications, Space and Technology Commission|0SAMSUNG SDS CO., LTD|1andvik AB|1TATE BANK OF INDIA|1udan Internet Society|1ingapore Network Information Centre (SGNIC) Pte Ltd|1hangri-La International Hotel Management Limited|1ina Corporation|1audi Telecom Company|0National Authority for Information Technology Services (NAITS)|0Temasek Holdings (Private) Limited|1hai Network Information Center Foundation|0Agence Tunisienne d'Internet|0Taiwan Network Information Center (TWNIC)|0China United Network Communications Corporation Limited|0Monolith Registry LLC|0The Weather Company, LLC|0VeriSign Sarl|0Guangzhou YU Wei Information Technology Co., Ltd.|0Beijing TLD Registry Technology Limited|0China Organizational Name Administration Center|1ORE Association|0Internet DotTrademark Organisation Limited|0LK Domain Registry|0National Internet Exchange of India|0Stable Tone Limited|0\"Internet Society\" Non-governmental Organization|0.au Domain Administration (auDA)|01&1 Mail & Media GmbH|0A.C.D. LEC Association des Centres Distributeurs Edouard Leclerc|1ARP|1BB Ltd|1CO Severin Ahlmann GmbH & Co. KG|1LSTOM|1OL Media LLC|1RUBA PEC S.p.A.|1S Domain Registry|1UDI Aktiengesellschaft|1WS Registry LLC|1XA Group Operations SAS|1bbVie Inc.|3ott Laboratories, Inc.|2le Inc.|2u Dhabi Systems and Information Centre|1cademic Institution: Kyoto Jyoho Gakuen|9and Research Network of Slovenia (ARNES)|2centure plc|1etna Life Insurance Company|1gence Nationale de Réglementation des Télécommunications (ANRT)|js Infrastructures Numériques et des Fréquences (ANINF)|lTechnologies de l'Information et de la Communication (ANTIC)|7Tunisienne d'Internet|7des Technologies de l’Information et de la Communication|5ia para el Desarrollo de la Información de la Sociedad en Bolivia|2ência Reguladora Multissectorial da Economia (ARME)|1irbus S.A.S.|1ktiebolaget Electrolux|1libaba Group Holding Limited|t|t|2lfinanz Deutsche Vermögensberatung Aktiengesellschaft|3state Fire and Casualty Insurance Company|3y Financial Inc.|1mFam, Inc.|2azon Registry Services, INC|rnc.|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|u|2erican Automobile Association, Inc.|9Bible Society|9Council of Life Insurers|9Express Travel Related Services Company, Inc.|zvices Company, Inc.|9Institute of Certified Public Accountants|bternational Group, Inc.|2ica Mutual Insurance Company|1ndorra Telecom|2tarctica Network Information Centre Limited|1pple Inc.|1quarelle.com|1ramco Services Company|1sda Stores Limited|2ia Spa and Wellness Promotion Council Limited|4Info Telecommunication Enterprise|2ociación puntoGAL|2sociation Française pour le Nommage Internet en Coopération (A.F.N.I.C.)|zge Internet en Coopération (A.F.N.I.C.)|zge Internet en Coopération (A.F.N.I.C.)|zge Internet en Coopération (A.F.N.I.C.)|zge Internet en Coopération (A.F.N.I.C.)|cRelative à la Télévision Européenne G.E.I.E.|cof IT Companies of Kazakhstan|cwww.bzh|7ção DNS.PT|1ustralia and New Zealand Banking Group Limited|9n Football League|bPostal Corporation|2thority for Info-communications Technology Industry of Brunei Darussalam (AITI)|3omobili Lamborghini S.p.A.|4ridade Nacional de Comunicações|bReguladora Nacional - Tecnologias de Informação e Comunicação da Guiné-Bissau|6té de Régulation des Communications Electroniques et de la Poste du Bénin (ARCEP BENIN)|zations Electroniques et des Postes (ARCEP)|rTélécommunications/TIC de Côte d’lvoire (ARTCI)|0BANCO BILBAO VIZCAYA ARGENTARIA, S.A.|1B&T Corporation|2Y Solutions, Inc.|1NP Paribas|1Rregistry, Inc.|1aidu, Inc.|2nco Bradesco S.A.|3k of America Corporation|3que Pictet & Cie SA|2rclays Bank PLC|2yerische Motoren Werke Aktiengesellschaft|5n Connect GmbH|1eats Electronics, LLC|2ijing Qihu Keji Co., Ltd.|r|r|8RITT-Net Technology Development Co., Ltd|8TLD Registry Technology Limited|9ele-info Technology Co., Ltd.|2larusian Cloud Technologies LLC|2stTLD Pty Ltd|1harti Airtel Limited|7Enterprises (Holding) Private Limited|1ig Room Inc.|2lgi Teknolojileri ve İletişim Kurumu (BTK)|2nky Moon, LLC|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|f|1loomberg IP Holdings LLC|2ue Sky Registry Limited|1oehringer Ingelheim International GmbH|2oking.com B.V.|2stik SA|2tswana Communications Regulatory Authority (BOCRA)|1ridgestone Corporation|cLicensing Services, Inc.|3stol-Myers Squibb Company|3tish Broadcasting Corporation|2other Industries, Ltd.|0CAM Connecting SarL|2NAL+ TELECOM|2RNet - Croatian Academic and Research Network|1BRE, Inc.|1ENIAInternet|3PAC NET|2RIST|1FA Institute|1HINTAI Corporation|1ITIC Group Corporation|1OMMONWEALTH BANK OF AUSTRALIA|u|2RE Association|g|1Z.NIC, z.s.p.o|1ampus IP LLC|2nadian Internet Registration Authority (CIRA) Autorité Canadienne pour les enregistrements Internet (ACEI)|3on Inc.|2pital One Financial Corporation|2ravan International, Inc.|2ucasus Online LLC|1elebrate Broadway, Inc.|2ntre National de l'Informatique|is Sciences Halieutiques de Boussoura|5o de Informatica de Universidade Eduardo Mondlane|1hanel International B.V.|3rleston Road Registry Inc.|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|t|2ina Internet Network Information Center (CNNIC)|zCenter (CNNIC)|zCenter (CNNIC)|zCenter (CNNIC)|6Organizational Name Administration Center|6United Network Communications Corporation Limited|2ristmas Island Domain Administration Limited|1isco Technology, Inc.|2tadel Domain LLC|3igroup Inc.|3y of Helsinki|8Paris|1lub Méditerranée S.A.|1ollectivité de Corse|2misión Nacional de Telecomunicaciones (CONATEL)|4te Gestor da Internet no Brasil|3munications Regulatory Authority|fand Information Technology Regulatory Authority|jMedia Commission (CMC)|e, Space and Technology Commission|3ores Telecom|3petrol (Luxembourg) Sarl|r|3unidad de Madrid|2nsortium FDS/RDDH|2ordination Center for TLD RU|2uncil for Information Technology LK Domain Registrar|8of Hungarian Internet Providers (CHIP)|1rown Equipment Corporation|1ybersecurity and Infrastructure Security Agency|0D3 Registry LLC|1ENIC eG|1ISH Technologies L.L.C.|1NS Belgium vzw/asbl|3.be vzw|1OT KIWI LIMITED|3QPON LLC.|3STRATEGY CO.|1WANGO Co., Ltd.|1ai Nippon Printing Co., Ltd.|2nsk Internet Forum|2ta Technology Solutions, Inc.|4com Co.,Ltd|1ell Inc.|3oitte Touche Tohmatsu|3ta Air Lines, Inc.|2utsche Post AG|9Vermögensberatung Aktiengesellschaft DVAG|zsellschaft DVAG|zsellschaft DVAG|1hivehi Raajjeyge Gulhun PLC|1igital Property Infrastructure Limited|5y, LLC|2rection des Plateformes et des Ressources Numériques|2scover Financial Services|3h DBS Corporation|k|k|k|k|k|k|k|k|3ney Enterprises, Inc.|1jibouti Telecom S.A|1oD Network Information Center|2g Beach, LLC|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|e|2t Hip Hop, LLC|4London Domains Limited|4Menu Registry LLC|4Scot Registry Limited|4Vegas, Inc.|3Asia Organisation Ltd.|3Cooperation, LLC|3DM Corporation|3Kids Foundation Limited|3Music Limited|1uPont Specialty Products USA, LLC|2bai Smart Government Department|0ECUADORDOMAIN S.A.|1DEKA Verband kaufmännischer Genossenschaften e.V.|2UCAUSE|1RNI Group Holding AG|1URid vzw|9|1agle Horizon Limited|2syhost bv|1esti Interneti Sihtasutus (EIS)|1gyptian Universities Network (EUN), Supreme Council of Universities|1lectronic and Postal Communications Authority - AKEP|3gant Leader Limited|2i Lilly and Company|3te Registry Limited|1mergency Back-End Registry Operator Program - ICANN|zr Program - ICANN|zr Program - ICANN|zr Program - ICANN|zr Program - ICANN|zr Program - ICANN|2ploy Media LLC|3resa Municipal de Informática SA - IPLANRIO|1ritrea Telecommunication Services Corporation (EriTel)|1thio telecom|1uropean Broadcasting Union (EBU)|9Organization for Nuclear Research (\"CERN\")|1xcellent First Limited|3lusive Registry Limited|2tra Space Storage LLC|0FCA US LLC.|1LIR Systems, Inc.|1O Council|2X Registry, LLC|1RLregistry B.V.|1SM Telecommunications Corporation|1age International S.A.|2irWinds Partners, LLC|2lkland Islands Government|2rmers Insurance Exchange|1ederal Express Corporation|6ted Co-operatives Limited|2gistry, LLC|2rrero Trading Lux S.A.|1iat Chrysler Automobiles N.V.|2delity Brokerage Services LLC|2nnish Transport and Communications Agency Traficom|2rmdale Holdings Limited|3st Registry Limited|1lickr, Inc.|1ondation Aga Khan (Aga Khan Foundation)|ztion)|ztion)|2rd Motor Company|2undation for Assistance for Internet Technologies and Infrastructure Development (FAITID)|1resenius Immobilien-Verwaltungs-GmbH|2ontier Communications Corporation|1ujitsu Limited|2ndacio puntCAT|7ón Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"|1édération Internationale de Basketball (FIBA)|0GEA Group Aktiengesellschaft|2TESA|1M-NIC|2O Internet, Inc.|4Registry, Inc.|i|i|1allo Vineyards, Inc.|4up, Inc.|2uss Research Laboratory Inc.|1emeente Amsterdam|2n Digital Inc.|3eral Authority of Communications and Informatics (GACI)|1lobal Website TLD Asia Limited|4o Comunicação e Participações S.A|1o Daddy East, LLC|2uvernement de la Polynésie française|2vernment of Anguilla|eMontenegro|eSamoa Ministry of Foreign Affairs & Trade|fouth Georgia and South Sandwich Islands (GSGSSI)|ft. Helena|ethe Kingdom of Tonga, H.R.H. Crown Prince Tupouto'a, c/o Consulate of Tonga|1rainger Registry Services, LLC|1uangzhou YU Wei Information Technology Co., Ltd.|tand Technology Co.,Ltd|2ccio Gucci S.p.a.|0H. Lundbeck A/S|1BO Registry Services, Inc.|1DFC Bank Limited|1M Domain Registry|1OUSING DEVELOPMENT FINANCE CORPORATION LIMITED|1SBC Global Services (UK) Limited|1amburg Top-Level-Domain GmbH|1elium TLDs Ltd|2rmes International|1isamitsu Pharmaceutical Co.,Inc.|2tachi, Ltd.|1oly See - Vatican City State|2me Depot Product Authority, LLC|2nda Motor Co., Ltd.|3g Kong Internet Registration Corporation Ltd.|aZhongze International Limited|2stmaster Ltd.|2tel Cipriani Srl|1ughes Satellite Systems Corporation|1yatt GTLD, L.L.C.|2undai Motor Company|0ICM Registry AD LLC|dLLC|dPN LLC|dSX LLC|2S-FORTH GR|1EEE Global LLC|1IT - CNR|1NFIBEAM AVENUES LIMITED|1P Serviciul Tehnologia Informatiei si Securitate Cibernetica|1RI Domain Management, LLC|q (\"Applicant\")|1SNIC - Internet á Íslandi hf.|1TV Services Limited|1dentity Digital Limited|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|1kano S.A.|1mena.BG AD|1ndustria de Diseño Textil, S.A. (INDITEX, S.A.)|9l and Commercial Bank of China Limited|2formation Technologies Development Center (ITDC)|ly Center|2novation Service Ltd|2stitute for Research in Fundamental Sciences|zal Sciences (IPM)|2terNetX Corp.|5cap Registry Inc.|m|m|6ontinentalExchange, Inc.|5link Systems Innovation Institute K.K.|5national Business Machines Corporation|eDomain Registry Pty. Ltd.|6et Architecture Board (IAB)|assigned Numbers Authority|9Computer Bureau Limited|9Direct Ltd|aotTrademark Organisation Limited|9Naming Co.|j|j|j|j|j|j|j|j|9Society Lebanon|8NZ|5point Switzerland|3raNS|3uit Administrative Services, Inc.|1piranga Produtos de Petroleo S.A.|1sland Networks (Jersey) Ltd.|gLtd.|3e of Man Government|2tanbul Metropolitan Municipality|1tau Unibanco Holding S.A.|0JCB Co., Ltd.|1PMorgan Chase Bank, National Association|1UNIPER NETWORKS, INC.|1aguar Land Rover Ltd|2pan Broadcasting Corporation (NHK)|6Registry Services Co., Ltd.|1iang Yu Liang Cai Technology Company Limited|1ohnson & Johnson Services, Inc.|2int Stock Company \"Navigation-information systems\"|2lly Host, LLC|f|f|2nes Lang LaSalle Incorporated|0KDDI CORPORATION|1IA MOTORS CORPORATION|2SA (Korea Internet & Security Agency)|1NET Co., Ltd|1PMG International Cooperative (KPMG International Genossenschaft)|1RG Department of Information Technology|1anton Zürich (Canton of Zurich)|2unas University of Technology|1enya Network Information Center (KeNIC)|2rry Trading Co. Limited|p|p|p|1nock Knock WHOIS There, LLC|1omatsu Ltd.|2ninklijke KPN N.V.|cPhilips N.V.|2rea Internet & Security Agency (KISA)|2sher Marketing Assets LLC|1redTLD Pty Ltd|1uwait Finance House|0LANXESS Corporation|1EGO Juris A/S|1K Domain Registry|1PL Holdings, Inc.|1a Trobe University|2o National Internet Center (LANIC), Ministry of Technology and Communications|2tin American Telecom LLC|1eFrak Organization, Inc.|2ague of Arab States|2sotho Network Information Centre Proprietary (LSNIC)|1imited Liability Company \"Coordination Center of Regional Domain of Tatarstan Republic\"|1ocus Analytics LLC|2tte Holdings Co., Ltd.|1uxury Partners LLC|0MAN Truck & Bus SE|1LB Advanced Media DH, LLC|1MA IARD|1NI Networks Ltd.|1SD Registry Holdings, Inc.|1TN Dubai Limited|2R Corporation Limited|1YNIC Berhad|1acao Post and Telecommunications Bureau (CTT)|3edonian Academic Research Network Skopje|2lawi Sustainable Development Network Programme (Malawi SDNP)|2rriott Worldwide Corporation|2ssachusetts Institute of Technology|2trix IP LLC|3tel IT Services, Inc.|1cKinsey Holdings, Inc.|1edistry LLC|2lrex TC|2rcantile Communications Pvt. Ltd.|4k KGaA|6Registry Holdings, Inc.|1icronesia Investment and Development Corporation|5soft Corporation|l|l|l|l|l|l|2nds + Machines GmbH|3istry of Communications and IT|cDigital Economy and Entrepreneurship (MoDEE)|cFinance, Sustainable Development Information & Technology|cInformation and Communications|zcations Technologies (MinTIC)|n, Communications and Transport (MICT)|enovation, Science and Smart Technology|cPost and Telecommunications|cTelecom & Information Technology (MTIT)|jmunications & Information Technology, Government Computer Center|vand Information Technologies (MTTI)|u, Science, Technology and Industry|dransport and Communications|l, Energy, Communications and Innovations|2tsubishi Corporation|1onash University|3olith Registry LLC|2tion Picture Domain Registry Pty Ltd|3orola Trademark Holdings, LLC|1unicipi de Barcelona|2seum Domain Management Association|2tuelle Assurance Instituteur France (MAIF)|0NBA REGISTRY, LLC|1EC Corporation|1FL Reg Ops LLC|1IC (Malta)|4Chile (University of Chile)|3-MG (Network Information Center Madagascar)|5exico ITESM - Campus Monterrey|4PY|2KE, Inc.|3ON CORPORATION|2PPON TELEGRAPH AND TELEPHONE CORPORATION|2SSAN MOTOR CO., LTD.|m|1amibian Network Information Center|2tional Academy of Sciences (Academia Nacional de Ciencias)|association of Boards of Pharmacy|oReal Estate Investment Trusts, Inc.|australia Bank Limited|bthority for Information Technology Services (NAITS)|9Communication Authority (NCA)|9Institute for R&D in Informatics|bternet Exchange of India|z|z|z|z|z|ieXchange of India|z|z|z|z|z|z|z|9Rifle Association of America|9Telecommunication Corporation|rRegulatory Authority - NTRA|2wang Heli(Xiamen) Network Service Co., LTD.|1et-Chinese Co., Ltd.|3flix, Inc.|3work Computer Systems Limited|7ing Technologies Group|2uStar, Inc.|2xt plc|1igeria Internet Registration Association|2ppon Life Insurance Company|1okia Corporation|2minet UK|a|2rfolk Island Data Services|3id A/S|9|2t assigned|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|c|2va Registry Ltd.|1úcleo de Informação e Coordenação do Ponto BR - NIC.br|0OBI Group Holding SE & Co. KGaA|1P3FT|1VH SAS|1ffice Congolais des Postes et Télécommunications - OCPT|7des Postes et Telecommunications|7of the Cabinet|1ne.com A/S|1racle Corporation|3nge Brand Services Limited|7Domains LLC|1saka Registry Co., Ltd.|1tsuka Holdings Co., Ltd.|0PCCW Enterprises Limited|4-HKT DataCom Services Limited|1H Domain Foundation|1KNIC|1NC Domain Co., LLC|2G DNS Administration, Vice Chancellors Office, The Papua New Guinea University of Technology|1UNTO FA S.L.|1VH gTLD Holdings LLC|1acific Century Asset Management (HK) Limited|2nasonic Corporation|1erkumpulan Pengelola Nama Domain Internet Indonesia (PANDI)|1fizer Inc.|1hysBiz Pty Ltd|1ing Registry Provider, Inc.|2oneer Corporation|2tcairn Island Administration|1lan Bee LLC|1ointQuébec Inc|2litie Nederland|2ntificia Universidad Catolica Madre y Maestra, Recinto Santo Tomas de Aquino|9um Consilium de Comunicationibus Socialibus (PCCS) (Pontifical Council for Social Communication)|zonibus Socialibus (PCCS) (Pontifical Council for Social Communication)|zonibus Socialibus (PCCS) (Pontifical Council for Social Communication)|2stal and Telecommunications Regulatory Authority of Zimbabwe (POTRAZ)|4s and Telecommunications Division|1raxi S.p.A.|2emier Registry Limited|3sidencia de la Nación , Secretaría Legal y Técnica|2icewaterhouseCoopers LLP|2ogressive Casualty Insurance Company|2udential Financial, Inc.|1ublic Interest Registry|o|o|o|o|o (PIR)|u|u|u|2nto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable|4ueus Fundazioa|0REGION GRAND EST|2STENA|1ISE VICTORY LIMITED|1WE AG|1adix Technologies Inc.|n|n|n|n|n|n|n SEZC|1eal Estate Domains LLC|2d Cientifica Peruana|4de Desarrollo Sostenible Honduras|3.es|2gister.BG|6ry General Department, Ministry of Home Affairs|9Services, LLC|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|m|2liance Industries Limited|r|2publican State Leadership Committee, Inc.|2search IP LLC|9and Academic Computer Network|4rved Domain - IANA|3orts World Inc. Pte. Ltd.|1icoh Company, Ltd.|1obert Bosch GMBH|2gers Communications Canada Inc.|1usnames Limited|3sian Institute for Development of Public Networks (ROSNIIROS)|1wanda Internet Community and Technology Alliance (RICTA) Ltd|0SAKURA internet Inc.|2MSUNG SDS CO., LTD|2P AG|1CHMIDT GROUPE S.A.S.|1EAT, S.A. (Sociedad Unipersonal)|2TAR|2W-EURODRIVE GmbH & Co KG|1IDN (Stichting Internet Domeinregistratie Nederland)|1K-NIC, a.s.|1ONITEL|1TADA Arzneimittel AG|3TE BANK OF INDIA|1UZUKI MOTOR CORPORATION|1VNet|1WITCH The Swiss Education & Research Network|1X Registry SA B.V.|1afety Registry Services, LLC.|2int-Gobain Weber SA|3pan Datacom, Inc.|2ndvik AB|a|3ofi|2pphire Networks|2udi Telecom Company|l|2xo Bank A/S|1chaeffler Technologies AG & Co. KG|3olarships.com, LLC|3warz Domains und Services GmbH & Co. KG|1eCIU - Universidad de la Republica|2ek Limited|2iko Epson Corporation|2ner Ingeniería y Sistemas, S.A.|2rbian National Internet Domain Registry (RNIDS)|2ven West Media Ltd|1hangri-La International Hotel Management Limited|3rp Corporation|2ell Information Technology International Inc|2ortdot SA|b|b|b|1ierratel|2na Corporation|g|3gapore Network Information Centre (SGNIC) Pte Ltd|ze (SGNIC) Pte Ltd|4le Integrator for Creation and Support of State Information Systems UZINFOCOM|1ky UK Limited|1mart Communications, Inc. (SMART)|1ociete Centrafricaine de Telecommunications (SOCATEL)|8Francaise du Radiotelephone - SFR|8Internationale de Telecommunications Aeronautique (SITA INC USA)|4été Nationale SNCF|2ftBank Group Corp.|2hu.com Limited|2lomon Telekom Company Limited|2ny Computer Entertainment Inc.|7rporation|1portAccord|1table Tone Limited|3ples, Inc.|3r India Private Limited|5Joint Venture Company|4bucks (HK) Limited|3te Farm Mutual Automobile Insurance Company|6of New South Wales, Department of Premier and Cabinet|2ockholms kommun|1udan Internet Society|1wiss Confederation|0T V SUNDRAM IYENGAR & SONS PRIVATE LIMITED|1DK Corporation|1ELE Greenland A/S|1M Domain Registry Ltd|1OSHIBA Corporation|2YOTA MOTOR CORPORATION|1UI AG|1abcorp Holdings Limited|2ipei City Government|3wan Network Information Center (TWNIC)|zTWNIC)|2nzania Communications Regulatory Authority|2rget Domain Holdings, LLC|2ta Motors Ltd|1eachers Insurance and Annuity Association of America|2cnisys|2leYemen|4com Cook Islands Ltd.|8Italia San Marino S.p.A.|7munication Regulator of Cambodia (TRC)|iTokelau Corporation (Teletok)|hs Radiocommunications and Broadcasting Regulator (TRBR)|kegulatory Authority (TRA)|zrity (TRA)|zrity (TRA)|uCommission of the Virgin Islands|jand Digital Government Regulatory Authority (TDRA)|4fonaktiebolaget L M Ericsson|7ica Brasil S.A.|4sur|3names Ltd.|2masek Holdings (Private) Limited|2va Pharmaceutical Industries Limited|1hai Network Information Center Foundation|2e Boston Consulting Group, Inc.|4Canadian Real Estate Association|5hristian Broadcasting Network, Inc.|5ity of New York by and through the New York City Department of Information Technology & Telecommunications|5rown in right of the State of Victoria, represented by its Department of State Development, Business and Innovation|4Estée Lauder Companies Inc.|v|4Foundation for Network Initiatives “The Smart Internet”|4Gap, Inc.|5oodyear Tire & Rubber Company|4IUSN Foundation|5nternet Infrastructure Foundation|5srael Internet Association (RA)|4National Telecommunications Regulatory Commission (NTRC)|4Siam Commercial Bank Public Company Limited (\"SCB\")|5watch Group Ltd|4TJX Companies, Inc.|n|n|n|n|n|4University of the South Pacific IT Services|4Vanguard Group, Inc.|4Weather Company, LLC|1op Level Spectrum, Inc.|2ray Industries, Inc.|2talEnergies SE|1ravelers TLD, LLC|i|i|1ycoon Treasure Limited|0UBN INTERNET LTDA.|2S AG|1HSA School of Medicine|1K Creative Ideas Limited|1PS Market Driver, Inc.|1ganda Online Ltd.|1krainian Network Information Centre (UANIC), Inc.|1niregistry, Corp.|3versal Postal Union|7idad Nacional del Ingernieria. Division de Tecnologias de la Informacion.|cTecnologica de Panama|cdel Valle de Guatemala|8te Cheikh Anta Diop|9y College Dublin, Computing Services, Computer Centre|bTele-Informatic Center (UTIC)|bof Belize|eCuracao|fyprus|eGuam|gyana|eLatvia, Institute of Mathematics and Computer Science, Department of Network Solutions (DNS)|ePuerto Rico|eSwaziland Department of Computer Science|eThe Bahamas|eWest Indies|ethe West Indies, Faculty of Engineering|9é de Nouakchott Al Aasriya|1tility Regulation and Competition Office (OfReg)|0VCS Pty Ltd|1IENNA INSURANCE GROUP AG Wiener Versicherung Gruppe|1aluetainment Corp.|1eriSign Global Registry Services|9Information Services, Inc.|9Sarl|d|d|d|d|d|d|d|d|d|8, Inc.|1iet Nam Internet Network Information Center (VNNIC)|2king River Cruises (Bermuda) Ltd.|2rgin Enterprises Limited|7Islands Public Telecommunications System, Inc.|2sa Worldwide Pte. Limited|1olvo Holding Sverige Aktiebolag|2x Populi Registry Ltd.|0Wal-Mart Stores, Inc.|l|l|2terford Limited|1eir Group IP Limited|2rkhaus GmbH|1ho's Who Registry|1illiam Hill Organization Limited|8Morris Endeavor Entertainment, LLC|1oodside Petroleum Limited|2rld Rugby Strategic Developments Limited|6Trade Centers Association, Inc.|0XYZ.COM LLC|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|b|1erox DNHC LLC|0YANDEX LLC|1ODOBASHI CAMERA CO.,LTD.|1ahoo Inc.|0ZA Central Registry NPC trading as Registry.Africa|zZA Central Registry|zZA Central Registry|3Domain Name Authority|1DNS International Limited|1ambia Information and Communications Technology Authority (ZICTA)|1odiac Aquarius Limited|7Gemini Ltd|7Taurus Ltd.|7Wang Limited|0dot Accountant Limited|4Bid Limited|4Cricket Limited|4Date Limited|4Faith Limited|4Loan Limited|4Review Limited|4Science Limited|5tream Limited|5upport Limited|4Webcam Limited|3BERLIN GmbH & Co. KG|3Career LLC|3Koeln GmbH|3RealEstate LLC|3Saarland GmbH|0eNIC Cocos (Keeling) Islands Pty. Ltd. d/b/a Island Internet Services|0fTLD Registry Services LLC|0iRegistry GmbH|1fm electronic gmbh|0l'Agence de Développement des Technologies de l'Information et de la Communication (ADETIC)|0nic.at GmbH|0punkt Tirol GmbH|5.wien GmbH|0tldbox GmbH|0Ålands landskapsregering","sep":"|"}]}]);
const COLONY = [
{"id":"n-2219ce8b","guard":[["hasAny",["body","domain"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .भारत":".भारत is sponsored by National Internet Exchange of India.","who sponsors the top-level domain .ee":".ee is sponsored by Eesti Interneti Sihtasutus (EIS).","who sponsors the top-level domain .tiaa":".tiaa is sponsored by Teachers Insurance and Annuity Association of America.","who sponsors the top-level domain ‏.امارات‎":"‏.امارات‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA).","who sponsors the top-level domain .seat":".seat is sponsored by SEAT, S.A. (Sociedad Unipersonal).","which organization runs the domain .pamperedchef":".pamperedchef is sponsored by Not assigned.","who sponsors the top-level domain .asda":".asda is sponsored by Asda Stores Limited.","name the sponsoring body of .marriott":".marriott is sponsored by Marriott Worldwide Corporation.","name the sponsoring body of .express":".express is sponsored by Binky Moon, LLC.","who sponsors the top-level domain .xyz":".xyz is sponsored by XYZ.COM LLC.","name the sponsoring body of .bar":".bar is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable.","which organization runs the domain .surf":".surf is sponsored by Registry Services, LLC.","who sponsors the top-level domain .ye":".ye is sponsored by TeleYemen.","who sponsors the top-level domain .sas":".sas is sponsored by Research IP LLC.","which organization runs the domain .ls":".ls is sponsored by Lesotho Network Information Centre Proprietary (LSNIC).","name the sponsoring body of .plumbing":".plumbing is sponsored by Binky Moon, LLC.","which organization runs the domain .study":".study is sponsored by Registry Services, LLC.","which organization runs the domain .sv":".sv is sponsored by SVNet.","which organization runs the domain .hospital":".hospital is sponsored by Binky Moon, LLC.","which organization runs the domain .мон":".мон is sponsored by Datacom Co.,Ltd.","who sponsors the top-level domain .works":".works is sponsored by Binky Moon, LLC.","who sponsors the top-level domain .vivo":".vivo is sponsored by Telefonica Brasil S.A..","which organization runs the domain .im":".im is sponsored by Isle of Man Government.","which organization runs the domain .juegos":".juegos is sponsored by Dog Beach, LLC.","which organization runs the domain .computer":".computer is sponsored by Binky Moon, LLC.","who sponsors the top-level domain .theater":".theater is sponsored by Binky Moon, LLC.","name the sponsoring body of .lifeinsurance":".lifeinsurance is sponsored by American Council of Life Insurers.","name the sponsoring body of .ci":".ci is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI).","which organization runs the domain .spa":".spa is sponsored by Asia Spa and Wellness Promotion Council Limited.","who sponsors the top-level domain .pt":".pt is sponsored by Associação DNS.PT.","name the sponsoring body of .forsale":".forsale is sponsored by Dog Beach, LLC.","which organization runs the domain .art":".art is sponsored by UK Creative Ideas Limited.","name the sponsoring body of .estate":".estate is sponsored by Binky Moon, LLC.","who sponsors the top-level domain .рус":".рус is sponsored by Rusnames Limited.","which organization runs the domain .deloitte":".deloitte is sponsored by Deloitte Touche Tohmatsu.","which organization runs the domain .rs":".rs is sponsored by Serbian National Internet Domain Registry (RNIDS).","who sponsors the top-level domain .sharp":".sharp is sponsored by Sharp Corporation.","who sponsors the top-level domain .la":".la is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications.","who sponsors the top-level domain .nikon":".nikon is sponsored by NIKON CORPORATION.","which organization runs the domain .book":".book is sponsored by Amazon Registry Services, Inc..","who sponsors the top-level domain .commbank":".commbank is sponsored by COMMONWEALTH BANK OF AUSTRALIA.","name the sponsoring body of .tv":".tv is sponsored by Ministry of Transport, Energy, Communications and Innovations.","who sponsors the top-level domain .avianca":".avianca is sponsored by Not assigned.","name the sponsoring body of .kred":".kred is sponsored by KredTLD Pty Ltd.","name the sponsoring body of .za":".za is sponsored by ZA Domain Name Authority.","which organization runs the domain .discover":".discover is sponsored by Discover Financial Services.","who sponsors the top-level domain .mk":".mk is sponsored by Macedonian Academic Research Network Skopje.","which organization runs the domain .mv":".mv is sponsored by Dhivehi Raajjeyge Gulhun PLC.","who sponsors the top-level domain .hyatt":".hyatt is sponsored by Hyatt GTLD, L.L.C..","name the sponsoring body of .hockey":".hockey is sponsored by Binky Moon, LLC.","which organization runs the domain .map":".map is sponsored by Charleston Road Registry Inc..","name the sponsoring body of .itau":".itau is sponsored by Itau Unibanco Holding S.A..","who sponsors the top-level domain .star":".star is sponsored by Star India Private Limited.","who sponsors the top-level domain .honeywell":".honeywell is sponsored by Not assigned.","name the sponsoring body of ‏.إختبار‎":"‏.إختبار‎ is sponsored by Not assigned.","name the sponsoring body of .fire":".fire is sponsored by Amazon Registry Services, Inc..","name the sponsoring body of .furniture":".furniture is sponsored by Binky Moon, LLC.","which organization runs the domain .clubmed":".clubmed is sponsored by Club Méditerranée S.A..","which organization runs the domain .iwc":".iwc is sponsored by Not assigned.","which organization runs the domain .coop":".coop is sponsored by DotCooperation LLC.","which organization runs the domain .tab":".tab is sponsored by Tabcorp Holdings Limited.","who sponsors the top-level domain .education":".education is sponsored by Binky Moon, LLC.","name the sponsoring body of .lacaixa":".lacaixa is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\".","which organization runs the domain .ryukyu":".ryukyu is sponsored by BRregistry, Inc..","which organization runs the domain .bauhaus":".bauhaus is sponsored by Werkhaus GmbH.","name the sponsoring body of .plus":".plus is sponsored by Binky Moon, LLC.","name the sponsoring body of .forum":".forum is sponsored by Fegistry, LLC.","who sponsors the top-level domain .kg":".kg is sponsored by AsiaInfo Telecommunication Enterprise.","which organization runs the domain .studio":".studio is sponsored by Dog Beach, LLC.","who sponsors the top-level domain .family":".family is sponsored by Dog Beach, LLC.","name the sponsoring body of .wanggou":".wanggou is sponsored by Amazon Registry Services, Inc..","who sponsors the top-level domain .repair":".repair is sponsored by Binky Moon, LLC.","name the sponsoring body of .mx":".mx is sponsored by NIC-Mexico ITESM - Campus Monterrey.","who sponsors the top-level domain .tw":".tw is sponsored by Taiwan Network Information Center (TWNIC).","which organization runs the domain .us":".us is sponsored by Registry Services, LLC.","name the sponsoring body of .voyage":".voyage is sponsored by Binky Moon, LLC.","name the sponsoring body of .diet":".diet is sponsored by XYZ.COM LLC.","who sponsors the top-level domain .goog":".goog is sponsored by Charleston Road Registry Inc..","name the sponsoring body of .परीक्षा":".परीक्षा is sponsored by Not assigned.","who sponsors the top-level domain .bugatti":".bugatti is sponsored by Not assigned.","who sponsors the top-level domain .su":".su is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS).","which organization runs the domain .boots":".boots is sponsored by Not assigned.","name the sponsoring body of .kiwi":".kiwi is sponsored by DOT KIWI LIMITED.","name the sponsoring body of .sale":".sale is sponsored by Dog Beach, LLC.","who sponsors the top-level domain .mtr":".mtr is sponsored by MTR Corporation Limited.","who sponsors the top-level domain .rip":".rip is sponsored by Dog Beach, LLC.","which organization runs the domain .toyota":".toyota is sponsored by TOYOTA MOTOR CORPORATION.","which organization runs the domain .cal":".cal is sponsored by Charleston Road Registry Inc..","name the sponsoring body of .yt":".yt is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.).","name the sponsoring body of ‏.الاردن‎":"‏.الاردن‎ is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE).","who sponsors the top-level domain .sport":".sport is sponsored by SportAccord.","name the sponsoring body of .arab":".arab is sponsored by League of Arab States.","name the sponsoring body of .guru":".guru is sponsored by Binky Moon, LLC.","which organization runs the domain .rwe":".rwe is sponsored by RWE AG.","name the sponsoring body of .hgtv":".hgtv is sponsored by Not assigned.","who sponsors the top-level domain .supply":".supply is sponsored by Binky Moon, LLC.","name the sponsoring body of .poker":".poker is sponsored by Identity Digital Limited.","which organization runs the domain .fujixerox":".fujixerox is sponsored by Not assigned.","which organization runs the domain .yodobashi":".yodobashi is sponsored by YODOBASHI CAMERA CO.,LTD..","which organization runs the domain .photography":".photography is sponsored by Binky Moon, LLC."}}},
{"id":"n-04a8c90c","guard":[["hasAny",["art","bauhaus","body","book","boots","cal","computer","coop","deloitte","discover","element","fujixerox","hospital","im","item number","iwc","juegos","leading zeros","ls","map","mv","nth","pad","pad with","padded to","pamperedchef","photography","position","rs","rwe","ryukyu","spa","sponsors","studio","study","surf","tab","toyota","us","yodobashi","zero pad","мон"]],["not",["has","is"]],["not",["has","country"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-92902385","guard":[["hasAny",["art","bauhaus","body","book","boots","cal","computer","coop","deloitte","discover","element","fujixerox","hospital","im","item number","iwc","juegos","leading zeros","ls","map","mv","nth","pad","pad with","padded to","pamperedchef","photography","position","rs","rwe","ryukyu","spa","sponsors","studio","study","surf","tab","toyota","us","yodobashi","zero pad","мон"]],["not",["has","is"]],["not",["has","country"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-d455f332","guard":[["hasAny",["art","bauhaus","body","book","boots","cal","computer","coop","deloitte","discover","element","fujixerox","hospital","im","item number","iwc","juegos","leading zeros","ls","map","mv","nth","pad","pad with","padded to","pamperedchef","photography","position","rs","ryukyu","spa","sponsors","studio","study","surf","tab","toyota","us","yodobashi","zero pad","мон"]],["not",["has","is"]],["not",["has","country"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]],"mem":null},
{"id":"n-237795e8","guard":[["hasAny",["art","asda","avianca","bauhaus","body","book","boots","bugatti","cal","commbank","computer","coop","deloitte","discover","education","ee","element","family","fujixerox","goog","honeywell","hospital","hyatt","im","item number","iwc","juegos","kg","la","leading zeros","ls","map","mk","mtr","mv","nikon","nth","pad","pad with","padded to","pamperedchef","photography","position","pt","repair","rip","rs","ryukyu","sas","seat","sharp","spa","sport","star","studio","study","su","supply","surf","tab","theater","tiaa","toyota","tw","us","vivo","works","xyz","yodobashi","zero pad","мон","рус","امارات"]],["words<=",6],["not",["has","country"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":10},["sense.lastWord"]]],"mem":null},
{"id":"n-57eadc4a","guard":[["hasAny",["art","asda","avianca","bauhaus","body","book","boots","bugatti","cal","commbank","computer","coop","deloitte","discover","education","ee","element","family","fujixerox","goog","honeywell","hospital","hyatt","im","item number","iwc","juegos","kg","la","leading zeros","ls","map","mk","mtr","mv","nikon","nth","pad","pad with","padded to","pamperedchef","photography","position","pt","repair","rip","rs","ryukyu","sas","seat","sharp","spa","sport","star","studio","study","su","supply","surf","tab","theater","tiaa","toyota","tw","us","vivo","works","xyz","yodobashi","zero pad","мон","рус","امارات"]],["words<=",6],["not",["has","country"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-c521a082","guard":[["hasAny",["art","asda","avianca","bauhaus","body","book","boots","bugatti","cal","commbank","computer","coop","deloitte","discover","education","ee","element","family","fujixerox","goog","honeywell","hospital","hyatt","im","item number","iwc","juegos","kg","la","leading zeros","ls","map","mk","mtr","mv","nikon","nth","pad","pad with","padded to","pamperedchef","photography","position","pt","repair","rip","rs","ryukyu","sas","seat","sharp","spa","sport","star","studio","study","su","supply","surf","tab","theater","tiaa","toyota","tw","us","vivo","works","xyz","yodobashi","zero pad","мон","рус","امارات"]],["words<=",6],["not",["has","country"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]],"mem":null},
{"id":"n-5655e0cd","guard":[["hasAny",["arab","art","asda","avianca","bar","bauhaus","book","boots","bugatti","cal","ci","commbank","computer","coop","deloitte","discover","education","ee","element","estate","express","family","fire","forsale","forum","fujixerox","furniture","goog","guru","hgtv","hockey","honeywell","hospital","hyatt","im","itau","item number","iwc","juegos","kg","kiwi","kred","la","lacaixa","leading zeros","lifeinsurance","ls","map","marriott","mk","mtr","mv","mx","nikon","nth","pad","pad with","padded to","pamperedchef","photography","plumbing","plus","poker","position","pt","repair","rip","rs","ryukyu","sale","sas","seat","sharp","spa","star","studio","study","su","supply","surf","tab","theater","tiaa","toyota","tv","tw","us","vivo","voyage","wanggou","works","yodobashi","yt","za","zero pad","мон","рус","إختبار","الاردن","امارات","परकष","भरत"]],["words<=",6],["not",["has","country"]],["not",["has","type"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-cdac0921","guard":[["hasAny",["arab","art","asda","avianca","bar","bauhaus","book","boots","bugatti","cal","ci","commbank","computer","coop","deloitte","discover","education","ee","element","estate","express","family","fire","forsale","forum","fujixerox","furniture","goog","guru","hgtv","hockey","honeywell","hospital","hyatt","im","itau","item number","iwc","juegos","kg","kiwi","kred","la","lacaixa","leading zeros","lifeinsurance","ls","map","marriott","mk","mtr","mv","mx","nikon","nth","pad","pad with","padded to","pamperedchef","photography","plumbing","plus","poker","position","pt","repair","rip","rs","ryukyu","sale","sas","seat","sharp","spa","star","studio","study","su","supply","surf","tab","theater","tiaa","toyota","tv","tw","us","vivo","voyage","wanggou","works","yodobashi","yt","za","zero pad","мон","рус","إختبار","الاردن","امارات","परकष","भरत"]],["words<=",6],["not",["has","country"]],["not",["has","type"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":12},["sense.lastWord"]]],"mem":null},
{"id":"n-29f6b621","guard":[["hasAny",["arab","art","asda","bar","bauhaus","book","cal","ci","commbank","computer","coop","delete","deloitte","diet","discover","education","ee","element","estate","express","family","fire","forsale","forum","furniture","goog","guru","hockey","hospital","hyatt","im","itau","item number","juegos","kg","kiwi","kred","la","lacaixa","lifeinsurance","ls","map","marriott","mk","mtr","mv","mx","nikon","nth","photography","plumbing","plus","poker","position","pt","remove","repair","rip","rs","rwe","ryukyu","sale","sas","seat","sharp","spa","sport","star","strip out","studio","study","su","supply","surf","sv","tab","theater","tiaa","toyota","tv","tw","us","vivo","voyage","wanggou","without","works","xyz","ye","yodobashi","yt","za","мон","рус","الاردن","امارات","भरत"]],["words<=",6],["not",["has","country"]],["not",["has","type"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":"assigned"}]],"mem":null},
{"id":"n-2b22fd4e","guard":[["hasAny",["arab","art","asda","bar","bauhaus","book","cal","ci","commbank","computer","coop","deloitte","diet","discover","education","ee","element","estate","express","family","fire","forsale","forum","furniture","goog","guru","hockey","hospital","hyatt","im","itau","item number","juegos","kg","kiwi","kred","la","lacaixa","lifeinsurance","ls","map","marriott","mk","mtr","mv","mx","nikon","nth","photography","plumbing","plus","poker","position","pt","repair","rip","rs","rwe","ryukyu","sale","sas","seat","separate by","sharp","spa","split","split by","sport","star","studio","study","su","supply","surf","sv","tab","theater","tiaa","toyota","tv","tw","us","vivo","voyage","wanggou","works","xyz","ye","yodobashi","yt","za","мон","рус","الاردن","امارات","भरत"]],["words<=",6],["not",["has","country"]],["not",["has","type"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":"assigned"}]],"mem":null},
{"id":"n-0b5cfa79","guard":[["hasAny",["asda","avianca","body","bugatti","commbank","education","ee","element","family","goog","honeywell","hyatt","item number","kg","la","mk","mtr","nikon","nth","position","pt","repair","rip","sas","seat","separate by","sharp","split","split by","sport","star","su","supply","theater","tiaa","vivo","works","xyz","ye","рус","امارات"]],["words<=",6],["not",["has","accenture"]],["not",["has","bo"]],["not",["has","country"]],["not",["has","goo"]],["not",["has","goodhands"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["sense.lastWord"]]],"mem":null},
{"id":"n-3ff0d65e","guard":[["hasAny",["asda","avianca","body","bugatti","commbank","delete","education","ee","element","family","goog","honeywell","hyatt","item number","kg","la","mk","mtr","nikon","nth","position","pt","remove","repair","rip","sas","seat","sharp","sport","star","strip out","su","supply","theater","tiaa","vivo","without","works","xyz","ye","рус","امارات"]],["words<=",6],["not",["has","accenture"]],["not",["has","bo"]],["not",["has","country"]],["not",["has","goo"]],["not",["has","goodhands"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["sense.lastWord"]]],"mem":null},
{"id":"n-777d8ef6","guard":[["hasAny",["asda","avianca","body","bugatti","commbank","education","ee","element","family","goog","honeywell","hyatt","item number","kg","la","mk","mtr","nikon","nth","position","pt","repair","rip","sas","seat","separate by","sharp","split","split by","sport","star","su","supply","theater","tiaa","vivo","works","xyz","ye","рус","امارات"]],["words<=",6],["not",["has","accenture"]],["not",["has","bo"]],["not",["has","country"]],["not",["has","goo"]],["not",["has","goodhands"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["sense.lastWord"]]],"mem":null},
{"id":"n-bfe7c27d","guard":[["hasAny",["asda","avianca","body","bugatti","commbank","education","ee","element","family","goog","honeywell","hyatt","item number","kg","la","mk","mtr","nikon","nth","position","pt","repair","rip","sas","seat","separate by","sharp","split","split by","sport","star","su","supply","theater","tiaa","vivo","works","xyz","ye","рус","امارات"]],["words<=",6],["not",["has","accenture"]],["not",["has","bo"]],["not",["has","country"]],["not",["has","goo"]],["not",["has","goodhands"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["sense.lastWord"]]],"mem":null},
{"id":"n-07d304a3","guard":[["hasAny",["asda","avianca","body","bugatti","change to","commbank","education","ee","element","family","goog","honeywell","hyatt","item number","kg","la","mk","mtr","nikon","nth","position","pt","repair","replace","rip","sas","seat","sharp","sport","star","su","substitute","supply","swap","theater","tiaa","vivo","works","xyz","ye","рус","امارات"]],["words<=",6],["not",["has","accenture"]],["not",["has","bo"]],["not",["has","country"]],["not",["has","goo"]],["not",["has","goodhands"]]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-356aa7c5","guard":[["hasAny",["asda","avianca","body","bugatti","commbank","education","ee","element","family","goog","honeywell","hyatt","item number","kg","la","longest","longest one","longest word","mk","mtr","nikon","nth","position","pt","repair","rip","sas","seat","separate by","sharp","split","split by","sport","star","su","supply","theater","tiaa","vivo","works","xyz","ye","рус","امارات"]],["words<=",6],["not",["has","accenture"]],["not",["has","bo"]],["not",["has","country"]],["not",["has","goo"]],["not",["has","goodhands"]]],"pyramid":["render.str",["aggregate.longest",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["sense.lastWord"]]]],"mem":null},
{"id":"n-9c21453b","guard":[["hasAny",["asda","avianca","body","bugatti","commbank","education","ee","element","family","goog","honeywell","hyatt","item number","kg","la","mk","mtr","nikon","nth","position","pt","repair","rip","sas","seat","separate by","sharp","shortest","shortest one","shortest word","split","split by","sport","star","su","supply","theater","tiaa","vivo","works","xyz","ye","рус","امارات"]],["words<=",6],["not",["has","accenture"]],["not",["has","bo"]],["not",["has","country"]],["not",["has","goo"]],["not",["has","goodhands"]]],"pyramid":["render.str",["aggregate.shortest",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["sense.lastWord"]]]],"mem":null},
{"id":"n-0d694fdf","guard":[["hasAny",["asda","avianca","body","bugatti","change to","commbank","education","ee","element","family","goog","honeywell","hyatt","item number","kg","la","mk","mtr","nikon","nth","position","pt","repair","replace","rip","sas","seat","sharp","sport","star","su","substitute","supply","swap","theater","tiaa","vivo","works","xyz","ye","рус","امارات"]],["words<=",6],["not",["has","accenture"]],["not",["has","bo"]],["not",["has","country"]],["not",["has","goo"]],["not",["has","goodhands"]]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]],"mem":null},
{"id":"n-22226434","guard":[["hasAny",["arab","art","asda","avianca","bar","bauhaus","boots","bugatti","commbank","coop","deloitte","discover","element","fujixerox","hgtv","honeywell","im","item number","iwc","kg","kiwi","kred","lifeinsurance","marriott","mk","mtr","mv","nikon","normalise","normalize","nth","pamperedchef","poker","position","rwe","sas","sharp","simplify the text","spa","sport","star","sv","tab","tiaa","toyota","ye","za","рус","إختبار","परकष","भरत"]],["words<=",6],["not",["has","country"]],["not",["has","type"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":1}]],"mem":null},
{"id":"n-a7ef852b","guard":[["hasAny",["art","asda","avianca","bar","bauhaus","boots","bugatti","coop","deloitte","discover","element","fujixerox","hgtv","honeywell","item number","iwc","kg","kiwi","kred","marriott","mk","mtr","mv","nikon","normalise","normalize","nth","pamperedchef","poker","position","rwe","sas","sharp","simplify the text","sport","star","sv","tab","toyota","ye","za","рус","إختبار","परकष"]],["words<=",6],["not",["has","country"]],["not",["has","type"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":2}]],"mem":null},
{"id":"n-3814d3a4","guard":[["hasAny",["body","element","item number","nth","position"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-383b946c","guard":[["hasAny",["body","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-7e0d2760","guard":[["hasAny",["body","element","invert case","item number","nth","position","swap case","toggle case"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-b67b35d0","guard":[["hasAny",["all caps","body","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-fcfebec1","guard":[["hasAny",["body","element","item number","lower case","lowercase","nth","position","small letters"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-4a54a9d0","guard":[["hasAny",["body","capitalise","capitalize","capitalize each word","element","invert case","item number","nth","position","swap case","title case","toggle case"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.str",["transform.swapCase",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-aa3e3baf","guard":[["hasAny",["body","delete","element","item number","nth","position","remove","strip out","without"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":"Registry Services, LLC"}]],"mem":null},
{"id":"n-e1aef2a9","guard":[["hasAny",["body","delete","element","item number","nth","position","remove","strip out","without"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":"Charleston Road Registry Inc."}]],"mem":null},
{"id":"n-455d5648","guard":[["hasAny",["body","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.list",["iterate.repeat",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],{"lit":1}]],"mem":null},
{"id":"n-52ecbdc6","guard":[["hasAny",["body","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-5cfd2e93","guard":[["hasAny",["body","element","invert case","item number","nth","position","swap case","toggle case"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.list",["iterate.repeat",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],{"lit":1}]],"mem":null},
{"id":"n-8d41c0af","guard":[["hasAny",["all caps","body","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.list",["iterate.repeat",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],{"lit":1}]],"mem":null},
{"id":"n-8e116e05","guard":[["hasAny",["body","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-e30d8238","guard":[["hasAny",["body","element","item number","lower case","lowercase","nth","position","small letters"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.list",["iterate.repeat",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],{"lit":1}]],"mem":null},
{"id":"n-fe5e07a1","guard":[["hasAny",["body","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["transform.swapCase",["sense.after",{"lit":"of"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-2f1478ad","guard":[["hasAny",["body","element","item number","nth","position"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["render.and",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-9e58a64f","guard":[["hasAny",["body","element","item number","nth","position"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-1aa362de","guard":[["hasAny",["body","element","invert case","item number","nth","position","swap case","toggle case"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-8b05da12","guard":[["hasAny",["body","element","item number","lower case","lowercase","nth","position","small letters"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-a0dfd402","guard":[["hasAny",["all caps","body","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-d2bb2630","guard":[["hasAny",["body","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-eab29878","guard":[["hasAny",["body","element","item number","nth","position"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-2476b66b","guard":[["hasAny",["body","element","invert case","item number","nth","position","swap case","toggle case"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-f86e1862","guard":[["hasAny",["body","element","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]],"mem":null},
{"id":"n-602a0d9b","guard":[["hasAny",["body","delete","element","item number","nth","position","remove","strip out","without"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":"XYZ.COM LLC"}]],"mem":null},
{"id":"n-5a06483d","guard":[["hasAny",["body","delete","element","item number","nth","position","remove","strip out","without"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":"Amazon Registry Services, Inc."}]],"mem":null},
{"id":"n-742ef43b","guard":[["hasAny",["body","delete","element","item number","nth","position","remove","strip out","without"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":"Dog Beach, LLC"}]],"mem":null},
{"id":"n-b844c512","guard":[["hasAny",["body","delete","element","item number","nth","position","remove","strip out","without"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":"Not assigned"}]],"mem":null},
{"id":"n-2bbff7ad","guard":[["hasAny",["arab","bar","ci","diet","element","estate","express","fire","forsale","forum","furniture","guru","hgtv","hockey","how many words","itau","item number","kred","lacaixa","lifeinsurance","marriott","mx","nth","number of words","plumbing","plus","poker","position","sale","tv","voyage","wanggou","word count","yt","za","إختبار"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.lines",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-450b00ea","guard":[["hasAny",["arab","bar","ci","diet","element","estate","express","fire","forsale","forum","furniture","guru","hgtv","hockey","how many words","itau","item number","kred","lacaixa","lifeinsurance","marriott","mx","nth","number of words","plumbing","plus","poker","position","sale","tv","voyage","wanggou","word count","yt","za","إختبار"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-b89ddb75","guard":[["hasAny",["arab","bar","change to","ci","diet","element","estate","express","fire","forsale","forum","furniture","guru","hgtv","hockey","itau","item number","kred","lacaixa","lifeinsurance","marriott","mx","nth","plumbing","plus","poker","position","replace","sale","substitute","swap","tv","voyage","wanggou","yt","za","إختبار"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-e1c5e106","guard":[["hasAny",["arab","bar","ci","diet","element","estate","express","fire","forsale","forum","furniture","guru","hgtv","hockey","how many words","itau","item number","kred","lacaixa","lifeinsurance","marriott","mx","nth","number of words","plumbing","plus","poker","position","sale","tv","voyage","wanggou","word count","yt","za","إختبار"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.and",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-4d05282a","guard":[["hasAny",["art","bar","cal","ci","element","how many vowels","hyatt","im","item number","iwc","kred","la","map","nth","number of vowels","plus","position","rip","rwe","sas","sharp","spa","sport","star","study","su","supply","surf","tab","us","vowel count","works","ye","za"]],["words<=",6],["not",["has","country"]]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-77f5819b","guard":[["hasAny",["art","bar","cal","ci","element","how many vowels","hyatt","im","item number","iwc","kred","la","map","nth","number of vowels","plus","position","rip","rwe","sas","sharp","spa","sport","star","study","su","supply","surf","tab","us","vowel count","works","ye","za"]],["words<=",6],["not",["has","country"]]],"pyramid":["render.lines",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-91ed1fe7","guard":[["hasAny",["art","bar","cal","ci","element","how many vowels","hyatt","im","item number","iwc","kred","la","map","nth","number of vowels","plus","position","rip","rwe","sas","sharp","spa","sport","star","study","su","supply","surf","tab","us","vowel count","works","ye","za"]],["words<=",6],["not",["has","country"]]],"pyramid":["render.and",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-04715ced","guard":[["hasAny",["body","delete","element","item number","nth","position","remove","strip out","without"]],["words<=",6],["not",["has","country"]],["not",["has","americanfamily"]],["not",["has","best"]],["not",["has","blog"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":"Binky Moon, LLC"}]],"mem":null},
{"id":"n-7fe7c6e1","guard":[["hasAny",["ee","element","hgtv","item number","kg","ls","mk","mtr","mv","mx","no vowels","nth","position","pt","remove vowels","rs","sv","tv","tw","without vowels","xyz","yt","мон","рус","إختبار","الاردن","امارات","परकष","भरत"]],["not",["has","country"]],["not",["has","is"]],["not",["has","type"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["transform.noVowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-107e7244","guard":[["hasAny",["caesar cipher","element","hgtv","how many vowels","item number","kg","ls","mk","mtr","mv","mx","nth","number of vowels","position","pt","rotate the letters","rs","shift by","shift each letter","sv","tv","tw","vowel count","xyz","yt","мон","рус","إختبار","الاردن","امارات","परकष","भरत"]],["not",["has","country"]],["not",["has","is"]],["not",["has","type"]]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-f3a0106d","guard":[["hasAny",["computer","education","estate","express","furniture","guru","hockey","hospital","photography","plumbing","plus","repair","supply","theater","voyage","works"]],["not",["has","is"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Binky Moon, LLC."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-14e2bd1d","guard":[["hasAny",["computer","education","element","estate","express","furniture","guru","hockey","hospital","how many words","item number","nth","number of words","photography","plumbing","plus","position","repair","supply","theater","voyage","word count","works"]],["not",["has","is"]]],"pyramid":["render.lines",["iterate.repeat",{"lit":"Binky Moon, LLC"},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-6f8c6f43","guard":[["hasAny",["change to","computer","education","element","estate","express","furniture","guru","hockey","hospital","item number","nth","photography","plumbing","plus","position","repair","replace","substitute","supply","swap","theater","voyage","works"]],["not",["has","is"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],["sense.lastWord"],{"lit":"Binky Moon, LLC"}]],"mem":null},
{"id":"n-c8de6e1d","guard":[["hasAny",["computer","education","element","estate","express","furniture","guru","hockey","hospital","how many words","item number","nth","number of words","photography","plumbing","plus","position","repair","supply","theater","voyage","word count","works"]],["not",["has","is"]]],"pyramid":["render.list",["iterate.repeat",{"lit":"Binky Moon, LLC"},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-f8f0bb7f","guard":[["hasAny",["computer","education","element","estate","express","furniture","guru","hockey","hospital","how many words","item number","nth","number of words","photography","plumbing","plus","position","repair","supply","theater","voyage","word count","works"]],["not",["has","is"]]],"pyramid":["render.and",["iterate.repeat",{"lit":"Binky Moon, LLC"},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-3cf62c5d","guard":[["hasAny",["avianca","boots","bugatti","characters from","diet","element","fujixerox","hgtv","honeywell","item number","iwc","letters from to","nth","pamperedchef","position","rwe","slice of the text","sport","substring","sv","xyz","ye","إختبار","परकष"]],["words<=",6],["not",["has","country"]]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-0d50d4e7","guard":[["hasAny",["alphabetize the letters","art","ci","coop","ee","element","im","item number","letters in order","ls","mv","mx","nth","position","pt","rs","sort the letters","su","sv","tv","tw","xyz"]],["not",["has","country"]],["not",["has","is"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-145cf25c","guard":[["hasAny",["ee","element","item number","kg","ls","mk","mtr","mv","no vowels","nth","position","pt","remove vowels","rs","sv","tw","without vowels","xyz","мон","рус","امارات"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["transform.noVowels",["sense.after",{"lit":"domain"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-bbc051bf","guard":[["hasAny",["alphabetize the letters","art","coop","ee","element","im","item number","letters in order","ls","mv","nth","position","pt","rs","sort the letters","su","sv","tw","xyz"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["transform.sortLetters",["sense.after",{"lit":"domain"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-f1e15da4","guard":[["hasAny",["avianca","boots","bugatti","fujixerox","hgtv","honeywell","iwc","pamperedchef","إختبار","परकष"]],["not",["has","is"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Not assigned."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-33c14fb8","guard":[["hasAny",["avianca","boots","bugatti","element","fujixerox","hgtv","honeywell","how many words","item number","iwc","nth","number of words","pamperedchef","position","word count","إختبار"]],["not",["has","is"]]],"pyramid":["render.lines",["iterate.repeat",{"lit":"Not assigned"},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-46eee5b7","guard":[["hasAny",["avianca","boots","bugatti","change to","element","fujixerox","hgtv","honeywell","item number","iwc","nth","pamperedchef","position","replace","substitute","swap","إختبار"]],["not",["has","is"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],["sense.lastWord"],{"lit":"Not assigned"}]],"mem":null},
{"id":"n-5055400e","guard":[["hasAny",["avianca","boots","bugatti","element","fujixerox","hgtv","honeywell","how many words","item number","iwc","nth","number of words","pamperedchef","position","word count","إختبار"]],["not",["has","is"]]],"pyramid":["render.list",["iterate.repeat",{"lit":"Not assigned"},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-8e1b7874","guard":[["hasAny",["avianca","boots","bugatti","element","fujixerox","hgtv","honeywell","how many words","item number","iwc","nth","number of words","pamperedchef","position","word count","إختبار"]],["not",["has","is"]]],"pyramid":["render.and",["iterate.repeat",{"lit":"Not assigned"},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-d5c443cb","guard":[["hasAny",["ci","consonant count","element","how many consonants","im","itau","item number","la","nth","number of consonants","position","su","tiaa","us","ye","za"]],["not",["has","country"]],["has","the"]],"pyramid":["render.lines",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-def010d0","guard":[["hasAny",["ci","consonant count","element","how many consonants","im","itau","item number","la","nth","number of consonants","position","su","tiaa","us","ye","za"]],["not",["has","country"]],["has","the"]],"pyramid":["render.and",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-ec6b7389","guard":[["hasAny",["ci","consonant count","element","how many consonants","im","itau","item number","la","nth","number of consonants","position","su","tiaa","us","ye","za"]],["not",["has","country"]],["has","the"]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-5ce41c5b","guard":[["hasAny",["element","hgtv","item number","mx","no vowels","nth","position","remove vowels","tv","without vowels","yt","إختبار","الاردن","परकष","भरत"]],["has","body"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["transform.noVowels",["sense.after",{"lit":"of"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-79a4a3c6","guard":[["hasAny",["caesar cipher","consonant count","ee","element","how many consonants","item number","nth","number of consonants","position","rotate the letters","shift by","shift each letter","мон","рус","إختبار","الاردن","امارات","परकष","भरत"]],["words<=",6],["not",["has","type"]]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-06a5b4a0","guard":[["hasAny",["delete","estate","express","furniture","guru","hockey","plumbing","plus","strip out","voyage"]],["has","sponsoring"]],"pyramid":["render.str",["transform.remove",{"lit":"Binky Moon, LLC"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-44ee9854","guard":[["hasAny",["delete","estate","express","furniture","guru","hockey","plumbing","plus","remove","strip out","voyage","without"]],["has","sponsoring"]],"pyramid":["render.str",["transform.remove",{"lit":"Binky Moon, LLC"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-640ae4fb","guard":[["hasAny",["computer","delete","education","hospital","photography","remove","repair","strip out","supply","theater","without","works"]],["words<=",6]],"pyramid":["render.str",["transform.remove",{"lit":"Binky Moon, LLC"},["sense.after",{"lit":"domain"}]]],"mem":null},
{"id":"n-1496a1f1","guard":[["hasAny",["each word","estate","express","furniture","guru","hockey","plumbing","plus","split into words","voyage","words"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Binky Moon, LLC."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-b8cfe3cf","guard":[["hasAny",["computer","each word","education","hospital","photography","repair","split into words","supply","theater","words","works"]],["words<=",6]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Binky Moon, LLC."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-3ec70e94","guard":[["hasAny",["caesar cipher","element","item number","nth","position","rotate the letters","shift by","shift each letter","мон","рус","إختبار","الاردن","امارات","परकष","भरत"]],["not",["has","is"]],["not",["has","type"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["transform.caesar",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],["sense.wordCount"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-5db6a5f7","guard":[["hasAny",["avianca","boots","bugatti","delete","fujixerox","honeywell","iwc","pamperedchef","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Not assigned"},["sense.after",{"lit":"domain"}]]],"mem":null},
{"id":"n-694a2a0f","guard":[["hasAny",["avianca","boots","bugatti","each word","fujixerox","honeywell","iwc","pamperedchef","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Not assigned."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-62d395ab","guard":[["hasAny",["family","forsale","juegos","rip","sale","studio"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Dog Beach, LLC."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-12f9eefe","guard":[["hasAny",["element","family","forsale","how many words","item number","juegos","nth","number of words","position","rip","sale","studio","word count"]]],"pyramid":["render.lines",["iterate.repeat",{"lit":"Dog Beach, LLC"},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-455b9c62","guard":[["hasAny",["element","family","forsale","how many words","item number","juegos","nth","number of words","position","rip","sale","studio","word count"]]],"pyramid":["render.list",["iterate.repeat",{"lit":"Dog Beach, LLC"},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-6a24811d","guard":[["hasAny",["element","family","forsale","how many words","item number","juegos","nth","number of words","position","rip","sale","studio","word count"]]],"pyramid":["render.and",["iterate.repeat",{"lit":"Dog Beach, LLC"},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-6a315aba","guard":[["hasAny",["change to","element","family","forsale","item number","juegos","nth","position","replace","rip","sale","studio","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],["sense.lastWord"],{"lit":"Dog Beach, LLC"}]],"mem":null},
{"id":"n-fc354876","guard":[["hasAny",["coop","discover","element","item number","kiwi","normalise","normalize","nth","position","simplify the text","sport","sv","ye"]],["not",["has","country"]],["not",["has","type"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":3}]],"mem":null},
{"id":"n-5c31e169","guard":[["hasAny",["each word","element","forum","item number","nth","position","ryukyu","split into words","sport","sv","words","ye"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-ec21099b","guard":[["hasAny",["each word","element","forum","item number","nth","position","split into words","sport","sv","words","ye"]],["not",["has","country"]]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-23da4f76","guard":[["hasAny",["all caps","capital letters","capitals","each word","element","forum","item number","nth","position","split into words","sport","sv","upper case","uppercase","words","ye"]],["not",["has","country"]]],"pyramid":["render.list",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-4de30017","guard":[["hasAny",["a to z","alphabetical","alphabetize","each word","element","forum","item number","nth","position","sort","split into words","sport","sv","words","ye"]],["not",["has","country"]]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-58361217","guard":[["hasAny",["each word","element","forum","invert case","item number","nth","position","split into words","sport","sv","swap case","toggle case","words","ye"]],["not",["has","country"]]],"pyramid":["render.list",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-932caa77","guard":[["hasAny",["distinct","each word","element","forum","item number","nth","position","remove duplicates","split into words","sport","sv","unique","without repeats","words","ye"]],["not",["has","country"]]],"pyramid":["render.list",["transform.uniqueStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-cd399eaf","guard":[["hasAny",["each word","element","forum","item number","lower case","lowercase","nth","position","small letters","split into words","sport","sv","words","ye"]],["not",["has","country"]]],"pyramid":["render.list",["transform.words",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-ce31a768","guard":[["hasAny",["capitalise","capitalize","capitalize each word","each word","element","forum","item number","nth","position","split into words","sport","sv","title case","words","ye"]],["not",["has","country"]]],"pyramid":["render.list",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-381f5b32","guard":[["hasAny",["delete","family","juegos","remove","rip","strip out","studio","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Dog Beach, LLC"},["sense.after",{"lit":"domain"}]]],"mem":null},
{"id":"n-a4c073cb","guard":[["hasAny",["each word","family","juegos","rip","split into words","studio","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dog Beach, LLC."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-4dc7d971","guard":[["hasAny",["study","surf","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Registry Services, LLC."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-8962136a","guard":[["hasAny",["book","fire","wanggou"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Amazon Registry Services, Inc.."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-9891f32e","guard":[["hasAny",["cal","goog","map"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Charleston Road Registry Inc.."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-02fd2bc7","guard":[["hasAny",["cal","element","goog","how many words","item number","map","nth","number of words","position","word count"]]],"pyramid":["render.list",["iterate.repeat",{"lit":"Charleston Road Registry Inc."},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-1018c2e2","guard":[["hasAny",["element","how many words","item number","nth","number of words","position","study","surf","us","word count"]],["has","organization"]],"pyramid":["render.lines",["iterate.repeat",{"lit":"Registry Services, LLC"},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-14350d5d","guard":[["hasAny",["element","how many vowels","item number","nth","number of vowels","position","study","surf","us","vowel count"]],["has","organization"]],"pyramid":["render.and",["iterate.repeat",{"lit":"Registry Services, LLC"},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-5c1b963f","guard":[["hasAny",["book","change to","element","fire","item number","nth","position","replace","substitute","swap","wanggou"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],["sense.lastWord"],{"lit":"Amazon Registry Services, Inc."}]],"mem":null},
{"id":"n-5f34b5fe","guard":[["hasAny",["element","how many words","item number","nth","number of words","position","study","surf","us","word count"]],["has","organization"]],"pyramid":["render.and",["iterate.repeat",{"lit":"Registry Services, LLC"},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-629bb598","guard":[["hasAny",["element","how many vowels","item number","nth","number of vowels","plus","position","supply","vowel count","works"]]],"pyramid":["render.list",["iterate.repeat",{"lit":"Binky Moon, LLC"},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-73c70539","guard":[["hasAny",["element","how many vowels","item number","nth","number of vowels","position","study","surf","us","vowel count"]],["has","organization"]],"pyramid":["render.lines",["iterate.repeat",{"lit":"Registry Services, LLC"},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-79ea4ab3","guard":[["hasAny",["element","how many vowels","item number","nth","number of vowels","position","study","surf","us","vowel count"]],["has","organization"]],"pyramid":["render.list",["iterate.repeat",{"lit":"Registry Services, LLC"},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-9f121492","guard":[["hasAny",["cal","element","goog","how many words","item number","map","nth","number of words","position","word count"]]],"pyramid":["render.lines",["iterate.repeat",{"lit":"Charleston Road Registry Inc."},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-a507b979","guard":[["hasAny",["book","element","fire","how many words","item number","nth","number of words","position","wanggou","word count"]]],"pyramid":["render.lines",["iterate.repeat",{"lit":"Amazon Registry Services, Inc."},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-adce2460","guard":[["hasAny",["element","how many vowels","item number","nth","number of vowels","plus","position","supply","vowel count","works"]]],"pyramid":["render.and",["iterate.repeat",{"lit":"Binky Moon, LLC"},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-ba46c31e","guard":[["hasAny",["caesar cipher","element","hgtv","how many vowels","item number","nth","number of vowels","position","rotate the letters","shift by","shift each letter","vowel count","إختبار","परकष"]],["has","name"]],"pyramid":["render.str",["transform.caesar",{"lit":"Not assigned"},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-cd8dee66","guard":[["hasAny",["element","how many words","item number","nth","number of words","position","study","surf","us","word count"]],["has","organization"]],"pyramid":["render.list",["iterate.repeat",{"lit":"Registry Services, LLC"},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-d11984f6","guard":[["hasAny",["book","element","fire","how many words","item number","nth","number of words","position","wanggou","word count"]]],"pyramid":["render.and",["iterate.repeat",{"lit":"Amazon Registry Services, Inc."},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-e0d5a928","guard":[["hasAny",["cal","element","goog","how many words","item number","map","nth","number of words","position","word count"]]],"pyramid":["render.and",["iterate.repeat",{"lit":"Charleston Road Registry Inc."},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-e2954167","guard":[["hasAny",["cal","change to","element","goog","item number","map","nth","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],["sense.lastWord"],{"lit":"Charleston Road Registry Inc."}]],"mem":null},
{"id":"n-ec84da17","guard":[["hasAny",["book","element","fire","how many words","item number","nth","number of words","position","wanggou","word count"]]],"pyramid":["render.list",["iterate.repeat",{"lit":"Amazon Registry Services, Inc."},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-f4adc864","guard":[["hasAny",["element","how many vowels","item number","nth","number of vowels","plus","position","supply","vowel count","works"]]],"pyramid":["render.lines",["iterate.repeat",{"lit":"Binky Moon, LLC"},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-fa215805","guard":[["hasAny",["change to","element","item number","nth","position","replace","study","substitute","surf","swap","us"]],["has","organization"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],["sense.lastWord"],{"lit":"Registry Services, LLC"}]],"mem":null},
{"id":"n-2743c435","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","nth","position","sport","sv","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-434a9347","guard":[["hasAny",["class name","element","item number","nth","pascal case","pascalcase","position","sport","sv","upper camel case","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-799801de","guard":[["hasAny",["each word","element","item number","nth","position","split into words","sport","sv","words","ye"]],["not",["has","country"]]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-d41159f3","guard":[["hasAny",["each word","element","item number","nth","position","split into words","sport","sv","words","ye"]],["not",["has","country"]]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-f0ccf04b","guard":[["hasAny",["element","item number","nth","position","reverse the words","reverse word order","sport","sv","words backwards","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-0122c0e3","guard":[["hasAny",["camel case","camelcase","element","invert case","item number","lower camel case","nth","position","sport","sv","swap case","toggle case","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-0f11e100","guard":[["hasAny",["class name","element","invert case","item number","nth","pascal case","pascalcase","position","sport","sv","swap case","toggle case","upper camel case","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.pascal",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-124a11e3","guard":[["hasAny",["each word","element","item number","nth","position","reverse the words","reverse word order","split into words","sport","sv","words","words backwards","ye"]],["not",["has","country"]]],"pyramid":["render.and",["transform.words",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-18402274","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","nth","position","sport","sv","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.camel",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-1fc3088d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","each word","element","item number","nth","position","split into words","sport","sv","title case","words","ye"]],["not",["has","country"]]],"pyramid":["render.lines",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-22c7fe52","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","reverse the words","reverse word order","small letters","sport","sv","words backwards","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-250f155e","guard":[["hasAny",["a to z","alphabetical","alphabetize","each word","element","item number","nth","position","sort","split into words","sport","sv","words","ye"]],["not",["has","country"]]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-2b292903","guard":[["hasAny",["all caps","capital letters","capitals","each word","element","item number","nth","position","split into words","sport","sv","upper case","uppercase","words","ye"]],["not",["has","country"]]],"pyramid":["render.and",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-3063e61e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","reverse the words","reverse word order","sport","sv","title case","words backwards","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-3c21da67","guard":[["hasAny",["class name","element","invert case","item number","nth","pascal case","pascalcase","position","sport","sv","swap case","toggle case","upper camel case","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.swapCase",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-3f70c2f3","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","nth","position","reverse the words","reverse word order","sport","sv","words backwards","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.camel",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-40d47c6e","guard":[["hasAny",["all caps","capital letters","capitals","each word","element","item number","nth","position","split into words","sport","sv","upper case","uppercase","words","ye"]],["not",["has","country"]]],"pyramid":["render.lines",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-41e2dfa3","guard":[["hasAny",["backwards","each word","element","item number","nth","position","reverse","reverse order","reversed","split into words","sport","sv","words","ye"]],["not",["has","country"]]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-45d7201b","guard":[["hasAny",["camel case","camelcase","class name","element","item number","lower camel case","nth","pascal case","pascalcase","position","sport","sv","upper camel case","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.pascal",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-499d32d7","guard":[["hasAny",["element","invert case","item number","nth","position","reverse the words","reverse word order","sport","sv","swap case","toggle case","words backwards","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-4f320645","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","lower case","lowercase","nth","position","small letters","sport","sv","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.lower",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-539f201c","guard":[["hasAny",["all caps","camel case","camelcase","capital letters","capitals","element","item number","lower camel case","nth","position","sport","sv","upper case","uppercase","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.upper",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-55781a6d","guard":[["hasAny",["body","delete","domain","element","item number","nth","position","remove","strip out","without"]],["words<=",6]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["sense.roman"]]],"mem":null},
{"id":"n-55f481a5","guard":[["hasAny",["each word","element","item number","nth","position","reverse the words","reverse word order","split into words","sport","sv","words","words backwards","ye"]],["not",["has","country"]]],"pyramid":["render.lines",["transform.words",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-59487adc","guard":[["hasAny",["a to z","alphabetical","alphabetize","each word","element","item number","nth","position","sort","split into words","sport","sv","words","ye"]],["not",["has","country"]]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-636b5cfc","guard":[["hasAny",["distinct","each word","element","item number","nth","position","remove duplicates","split into words","sport","sv","unique","without repeats","words","ye"]],["not",["has","country"]]],"pyramid":["render.and",["transform.uniqueStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-6bb65da5","guard":[["hasAny",["each word","element","invert case","item number","nth","position","split into words","sport","sv","swap case","toggle case","words","ye"]],["not",["has","country"]]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-6ea60a23","guard":[["hasAny",["distinct","each word","element","item number","nth","position","remove duplicates","split into words","sport","sv","unique","without repeats","words","ye"]],["not",["has","country"]]],"pyramid":["render.lines",["transform.uniqueStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-75963e37","guard":[["hasAny",["each word","element","item number","nth","position","reverse the words","reverse word order","split into words","sport","sv","words","words backwards","ye"]],["not",["has","country"]]],"pyramid":["render.list",["transform.words",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-78a41c7a","guard":[["hasAny",["class name","element","item number","nth","pascal case","pascalcase","position","reverse the words","reverse word order","sport","sv","upper camel case","words backwards","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.pascal",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-7af3ecbd","guard":[["hasAny",["backwards","each word","element","item number","nth","position","reverse","reverse order","reversed","split into words","sport","sv","words","ye"]],["not",["has","country"]]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-86ff969e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","each word","element","item number","nth","position","split into words","sport","sv","title case","words","ye"]],["not",["has","country"]]],"pyramid":["render.and",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-8b618a38","guard":[["hasAny",["each word","element","item number","lower case","lowercase","nth","position","small letters","split into words","sport","sv","words","ye"]],["not",["has","country"]]],"pyramid":["render.lines",["transform.words",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-8e3c333d","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","lower case","lowercase","nth","position","small letters","sport","sv","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.camel",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-8f6a9fc8","guard":[["hasAny",["class name","element","item number","lower case","lowercase","nth","pascal case","pascalcase","position","small letters","sport","sv","upper camel case","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.pascal",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-9495718b","guard":[["hasAny",["each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words","sport","sv","words","ye"]],["not",["has","country"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-988a7173","guard":[["hasAny",["each word","element","item number","longest","longest one","longest word","nth","position","split into words","sport","sv","words","ye"]],["not",["has","country"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-99d289f6","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","position","reverse the words","reverse word order","sport","sv","upper case","uppercase","words backwards","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.reverseWords",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-a5c2f201","guard":[["hasAny",["each word","element","item number","lower case","lowercase","nth","position","small letters","split into words","sport","sv","words","ye"]],["not",["has","country"]]],"pyramid":["render.and",["transform.words",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-c96dfc73","guard":[["hasAny",["dashes","element","hyphens","item number","kebab case","kebabcase","lower case","lowercase","nth","position","slug","small letters","sport","sv","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.kebab",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-cdd4a32b","guard":[["hasAny",["camel case","camelcase","capitalise","capitalize","capitalize each word","element","item number","lower camel case","nth","position","sport","sv","title case","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.title",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-e61019f9","guard":[["hasAny",["each word","element","invert case","item number","nth","position","split into words","sport","sv","swap case","toggle case","words","ye"]],["not",["has","country"]]],"pyramid":["render.and",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-ee5f1dd3","guard":[["hasAny",["backwards","each word","element","item number","nth","position","reverse","reverse order","reversed","split into words","sport","sv","words","ye"]],["not",["has","country"]]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-f6c75ba9","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","snake case","snakecase","sport","sv","underscores","variable name","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.snake",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-f7b0dd78","guard":[["hasAny",["camel case","camelcase","element","invert case","item number","lower camel case","nth","position","sport","sv","swap case","toggle case","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.swapCase",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-1b650c2b","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","normalise","normalize","nth","position","simplify the text","sport","sv","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.camel",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":1}]]],"mem":null},
{"id":"n-5db14456","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","normalise","normalize","nth","position","simplify the text","sport","sv","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.camel",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":2}]]],"mem":null},
{"id":"n-5e6b2cd9","guard":[["hasAny",["camel case","camelcase","delete","element","item number","lower camel case","nth","position","remove","sport","strip out","sv","without","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.camel",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["sense.lastWord"]]]],"mem":null},
{"id":"n-62376660","guard":[["hasAny",["element","item number","nth","position","reverse the words","reverse word order","sport","sv","words backwards","ye"]],["not",["has","country"]]],"pyramid":["render.list",["iterate.repeat",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],{"lit":1}]],"mem":null},
{"id":"n-62a16dc9","guard":[["hasAny",["characters from","element","item number","letters from to","nth","position","rwe","slice of the text","substring","sv","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-f1145eb4","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","normalise","normalize","nth","position","simplify the text","sport","sv","ye"]],["not",["has","country"]]],"pyramid":["render.str",["transform.camel",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":3}]]],"mem":null},
{"id":"n-f28d4889","guard":[["hasAny",["alphabetize the letters","ci","element","item number","letters in order","mx","nth","position","sort the letters","tv"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["transform.sortLetters",["sense.after",{"lit":"of"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-0d9920ac","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","nth","position","sport","sv","ye"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-4e469da1","guard":[["hasAny",["body","domain","element","item number","join","joined with","nth","position","separated by"]],["words<=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["transform.join",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],["sense.roman"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-4ed74a02","guard":[["hasAny",["class name","element","item number","nth","pascal case","pascalcase","position","sport","sv","upper camel case","ye"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-653ab618","guard":[["hasAny",["element","item number","nth","position","reverse the words","reverse word order","sport","sv","words backwards","ye"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ",{"slot":1},"."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-839f92de","guard":[["hasAny",["body","change to","domain","element","item number","nth","position","replace","substitute","swap"]],["words<=",6]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],["sense.roman"],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-02fe0e26","guard":[["hasAny",["study","surf","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Registry Services, LLC."]},["sense.lastWord"]],"mem":null},
{"id":"n-93960593","guard":[["hasAny",["body","domain"]]],"pyramid":["render.str",["memory.lookup",["sense.roman"]]],"mem":{"table":{"ci":".ci is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI).","mv":".mv is sponsored by Dhivehi Raajjeyge Gulhun PLC.","mx":".mx is sponsored by NIC-Mexico ITESM - Campus Monterrey."}}},
{"id":"n-837d5f22","guard":[["hasAny",["capitalise","capitalize","capitalize each word","study","surf","title case","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Registry Services, LLC."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9d6efda3","guard":[["hasAny",["invert case","study","surf","swap case","toggle case","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Registry Services, LLC."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-25f6cda0","guard":[["hasAny",["normalise","normalize","simplify the text","study","surf","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Registry Services, LLC."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-56f1f620","guard":[["hasAny",["delete","hgtv","strip out","إختبار","परकष"]],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"Not assigned"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-9f026548","guard":[["hasAny",["each word","split into words","study","surf","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Registry Services, LLC."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bdabd918","guard":[["hasAny",["cal","delete","goog","map","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Charleston Road Registry Inc."},["sense.after",{"lit":"domain"}]]],"mem":null},
{"id":"n-e6364a92","guard":[["hasAny",["each word","split into words","study","surf","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Registry Services, LLC."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f0a57eb1","guard":[["hasAny",["delete","remove","strip out","study","surf","us","without"]],["has","organization"]],"pyramid":["render.str",["transform.remove",{"lit":"Registry Services, LLC"},["sense.after",{"lit":"domain"}]]],"mem":null},
{"id":"n-f9222333","guard":[["hasAny",["item number","nth","position","study","surf","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Registry Services, LLC."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-df7e45ab","guard":[["hasAny",["each word","split into words","study","surf","us","words"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Registry Services, LLC."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-e4c611a2","guard":[["hasAny",["cal","each word","goog","map","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Charleston Road Registry Inc.."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-73b6b3f5","guard":[["hasAny",["diet","xyz"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by XYZ.COM LLC."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-00833b8f","guard":[["hasAny",["diet","element","how many words","item number","nth","number of words","position","word count","xyz"]]],"pyramid":["render.lines",["iterate.repeat",{"lit":"XYZ.COM LLC"},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-13553df8","guard":[["hasAny",["diet","element","item number","leading zeros","nth","pad","pad with","padded to","position","xyz","zero pad"]]],"pyramid":["render.str",["transform.padStart",{"lit":"XYZ.COM LLC"},{"lit":12},["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]],"mem":null},
{"id":"n-2c43a7e6","guard":[["hasAny",["change to","diet","element","item number","nth","position","replace","substitute","swap","xyz"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],["sense.lastWord"],{"lit":"XYZ.COM LLC"}]],"mem":null},
{"id":"n-408ceb19","guard":[["hasAny",["cal","element","how many vowels","item number","map","nth","number of vowels","position","vowel count"]]],"pyramid":["render.lines",["iterate.repeat",{"lit":"Charleston Road Registry Inc."},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-50c3d04c","guard":[["hasAny",["cal","element","how many vowels","item number","map","nth","number of vowels","position","vowel count"]]],"pyramid":["render.list",["iterate.repeat",{"lit":"Charleston Road Registry Inc."},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-64e9a534","guard":[["hasAny",["caesar cipher","consonant count","element","how many consonants","item number","nth","number of consonants","position","rotate the letters","shift by","shift each letter","إختبار","परकष"]],["has","name"]],"pyramid":["render.str",["transform.caesar",{"lit":"Not assigned"},["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-b518f9cb","guard":[["hasAny",["diet","element","how many words","item number","nth","number of words","position","word count","xyz"]]],"pyramid":["render.and",["iterate.repeat",{"lit":"XYZ.COM LLC"},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-c5bf861a","guard":[["hasAny",["cal","element","how many vowels","item number","map","nth","number of vowels","position","vowel count"]]],"pyramid":["render.and",["iterate.repeat",{"lit":"Charleston Road Registry Inc."},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-fa80403a","guard":[["hasAny",["diet","element","how many words","item number","nth","number of words","position","word count","xyz"]]],"pyramid":["render.list",["iterate.repeat",{"lit":"XYZ.COM LLC"},["aggregate.words",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-644b93fe","guard":[["hasAny",["characters from","element","item number","letters from to","nth","position","rwe","slice of the text","substring","sv"]],["has","which"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-9fdf9477","guard":[["hasAny",["caesar cipher","domain","element","how many vowels","item number","mx","nth","number of vowels","position","rotate the letters","shift by","shift each letter","vowel count"]],["words<=",6]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.vowels",["sense.roman"]]]],"mem":null},
{"id":"n-a8c0c126","guard":[["hasAny",["caesar cipher","consonant count","element","how many consonants","item number","nth","number of consonants","pamperedchef","photography","position","rotate the letters","shift by","shift each letter"]],["has","which"]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.consonants",["sense.text"]]]],"mem":null},
{"id":"n-da405401","guard":[["hasAny",["bar","caesar cipher","element","how many letters","item number","letter count","nth","number of letters","position","rotate the letters","shift by","shift each letter","भरत"]],["has","name"]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.letters",["sense.text"]]]],"mem":null},
{"id":"n-6c215f9e","guard":[["hasAny",["nikon","sharp"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-7ad2eec9","guard":[["hasAny",["nikon","sharp"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-15b0af6c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nikon","sharp","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-41998e8c","guard":[["hasAny",["delete","forsale","sale","strip out"]],["has","sponsoring"]],"pyramid":["render.str",["transform.remove",{"lit":"Dog Beach, LLC"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-5c6be88c","guard":[["hasAny",["invert case","nikon","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-703c7d7e","guard":[["hasAny",["delete","fire","strip out","wanggou"]],["has","sponsoring"]],"pyramid":["render.str",["transform.remove",{"lit":"Amazon Registry Services, Inc."},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-744ebb3a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nikon","sharp","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bcb796a1","guard":[["hasAny",["invert case","nikon","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-05252836","guard":[["hasAny",["item number","nikon","nth","position","sharp"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-060b2a24","guard":[["hasAny",["each word","nikon","sharp","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0edeb0d4","guard":[["hasAny",["item number","nikon","nth","position","sharp"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-561ef18d","guard":[["hasAny",["nikon","normalise","normalize","sharp","simplify the text"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-8dbe7f18","guard":[["hasAny",["each word","nikon","sharp","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-93b30a5f","guard":[["hasAny",["nikon","normalise","normalize","sharp","simplify the text"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-bd605fa0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","nikon","sharp","swap case","title case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c673b612","guard":[["hasAny",["item number","nikon","nth","position","sharp"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d253191f","guard":[["hasAny",["invert case","nikon","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-da716ee6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","nikon","sharp","swap case","title case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e525b512","guard":[["hasAny",["each word","nikon","sharp","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-eedbe251","guard":[["hasAny",["invert case","nikon","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f05dbbe4","guard":[["hasAny",["each word","nikon","sharp","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f92c3868","guard":[["hasAny",["item number","nikon","nth","position","sharp"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-05808a86","guard":[["hasAny",["each word","invert case","nikon","sharp","split into words","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0e7b9ef9","guard":[["hasAny",["each word","invert case","nikon","sharp","split into words","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1318b91a","guard":[["hasAny",["each word","invert case","nikon","sharp","split into words","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1567a0aa","guard":[["hasAny",["invert case","nikon","normalise","normalize","sharp","simplify the text","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-27dcca4f","guard":[["hasAny",["invert case","nikon","normalise","normalize","sharp","simplify the text","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3cc485ec","guard":[["hasAny",["each word","nikon","sharp","split into words","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-3e33a6ef","guard":[["hasAny",["each word","invert case","nikon","sharp","split into words","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6e83b218","guard":[["hasAny",["invert case","item number","nikon","nth","position","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9cd9d372","guard":[["hasAny",["invert case","item number","nikon","nth","position","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ba42e4c5","guard":[["hasAny",["invert case","item number","nikon","nth","position","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c30b65d2","guard":[["hasAny",["each word","nikon","sharp","split into words","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-fc3b1865","guard":[["hasAny",["invert case","item number","nikon","nth","position","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3b9c5221","guard":[["hasAny",["each word","invert case","nikon","sharp","split into words","swap case","toggle case","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6eb3f142","guard":[["hasAny",["each word","invert case","nikon","sharp","split into words","swap case","toggle case","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-050177d8","guard":[["has","za"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by ZA Domain Name Authority."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-06635f2c","guard":[["has","рус"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Rusnames Limited."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-161312c7","guard":[["has","yodobashi"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by YODOBASHI CAMERA CO.,LTD.."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-1a31e926","guard":[["has","sharp"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Sharp Corporation."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-2b692b22","guard":[["has","nikon"],["has","who"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by NIKON CORPORATION."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-2e03ee5e","guard":[["has","lacaixa"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-3184c1ca","guard":[["has","mtr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by MTR Corporation Limited."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-340303d2","guard":[["has","kiwi"],["has","sponsoring"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by DOT KIWI LIMITED."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-38a148e3","guard":[["has","kred"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by KredTLD Pty Ltd."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-3dbe83a0","guard":[["has","marriott"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Marriott Worldwide Corporation."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-3f2ff2e2","guard":[["has","toyota"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by TOYOTA MOTOR CORPORATION."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-4016959b","guard":[["has","itau"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Itau Unibanco Holding S.A.."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-48164cd0","guard":[["has","arab"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by League of Arab States."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-5541e77c","guard":[["has","ci"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI)."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-580bdb0d","guard":[["has","mk"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-5eb1bea6","guard":[["has","امارات"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-65785bbd","guard":[["has","poker"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Identity Digital Limited."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-6b5be949","guard":[["has","мон"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Datacom Co.,Ltd."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-6e196b0d","guard":[["has","sas"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Research IP LLC."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-71aab0e1","guard":[["has","seat"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by SEAT, S.A. (Sociedad Unipersonal)."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-7af26ee6","guard":[["has","deloitte"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Deloitte Touche Tohmatsu."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-7b98c44d","guard":[["has","tab"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Tabcorp Holdings Limited."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-7dbade88","guard":[["has","forum"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Fegistry, LLC."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-807eb284","guard":[["has","tv"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-80cd4698","guard":[["has","sport"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by SportAccord."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-83afc020","guard":[["has","sv"],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by SVNet."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-84b161fb","guard":[["has","bauhaus"],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Werkhaus GmbH."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-8587f728","guard":[["has","rwe"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by RWE AG."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-8e11a5db","guard":[["has","भरत"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by National Internet Exchange of India."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-91edea3e","guard":[["has","ls"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Lesotho Network Information Centre Proprietary (LSNIC)."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-91eee7f5","guard":[["has","coop"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by DotCooperation LLC."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-96298b43","guard":[["has","mx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by NIC-Mexico ITESM - Campus Monterrey."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-9c775861","guard":[["has","art"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by UK Creative Ideas Limited."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-9ef61101","guard":[["has","discover"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Discover Financial Services."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-a4d46146","guard":[["has","star"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Star India Private Limited."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-a5051438","guard":[["has","rs"],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Serbian National Internet Domain Registry (RNIDS)."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-acf2d58c","guard":[["has","mv"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-af4b5cd0","guard":[["has","tiaa"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Teachers Insurance and Annuity Association of America."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-b5838afe","guard":[["has","la"],["has","who"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-badb09df","guard":[["has","tw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-be49ee70","guard":[["has","spa"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Asia Spa and Wellness Promotion Council Limited."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-c038e9d0","guard":[["has","ye"],["has","who"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by TeleYemen."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-c121158a","guard":[["has","ee"],["has","who"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-c13881b8","guard":[["has","الاردن"],["has","sponsoring"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE)."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-c60e71a0","guard":[["has","pt"],["has","who"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Associação DNS.PT."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-c75ea25f","guard":[["has","yt"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-cab536d8","guard":[["has","bar"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-cc135249","guard":[["has","kg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by AsiaInfo Telecommunication Enterprise."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-cd200518","guard":[["has","ryukyu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by BRregistry, Inc.."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-d2770d39","guard":[["has","lifeinsurance"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by American Council of Life Insurers."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-e3c2537e","guard":[["has","su"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS)."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-ead78d77","guard":[["has","vivo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Telefonica Brasil S.A.."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-ec4667d6","guard":[["has","asda"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Asda Stores Limited."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-ed1a1c40","guard":[["has","hyatt"],["has","who"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Hyatt GTLD, L.L.C.."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-fb58cbd0","guard":[["has","clubmed"],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by Club Méditerranée S.A.."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-fdb5b7b5","guard":[["has","commbank"]],"pyramid":["render.template",{"lit":[{"slot":0}," is sponsored by COMMONWEALTH BANK OF AUSTRALIA."]},["render.list",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}]]],"mem":null},
{"id":"n-2ad3e700","guard":[["hasAny",["element","how many vowels","item number","nth","number of vowels","position","rip","vowel count"]]],"pyramid":["render.list",["iterate.repeat",{"lit":"Dog Beach, LLC"},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-3f4367dc","guard":[["hasAny",["caesar cipher","element","how many vowels","item number","nth","number of vowels","position","rotate the letters","shift by","shift each letter","vowel count","xyz"]]],"pyramid":["render.str",["transform.caesar",{"lit":"XYZ.COM LLC"},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-47346f2e","guard":[["hasAny",["consonant count","element","how many consonants","item number","nth","number of consonants","position","us"]],["has","organization"]],"pyramid":["render.list",["iterate.repeat",{"lit":"Registry Services, LLC"},["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-8cf16410","guard":[["hasAny",["element","how many vowels","item number","nth","number of vowels","position","rip","vowel count"]]],"pyramid":["render.lines",["iterate.repeat",{"lit":"Dog Beach, LLC"},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-b5fa3c58","guard":[["hasAny",["consonant count","element","how many consonants","item number","nth","number of consonants","position","us"]],["has","organization"]],"pyramid":["render.lines",["iterate.repeat",{"lit":"Registry Services, LLC"},["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-bfd714f2","guard":[["hasAny",["element","how many vowels","item number","nth","number of vowels","position","rip","vowel count"]]],"pyramid":["render.and",["iterate.repeat",{"lit":"Dog Beach, LLC"},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-c93d91d6","guard":[["hasAny",["element","how many vowels","item number","iwc","nth","number of vowels","position","vowel count"]]],"pyramid":["render.lines",["iterate.repeat",{"lit":"Not assigned"},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-cb643f72","guard":[["hasAny",["element","how many vowels","item number","iwc","nth","number of vowels","position","vowel count"]]],"pyramid":["render.list",["iterate.repeat",{"lit":"Not assigned"},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-cbc09923","guard":[["hasAny",["element","how many vowels","item number","iwc","nth","number of vowels","position","vowel count"]]],"pyramid":["render.and",["iterate.repeat",{"lit":"Not assigned"},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-cc19fcdc","guard":[["hasAny",["consonant count","element","how many consonants","item number","nth","number of consonants","position","us"]],["has","organization"]],"pyramid":["render.and",["iterate.repeat",{"lit":"Registry Services, LLC"},["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-010a6fa1","guard":[["hasAny",["element","item number","nth","position","toyota"]]],"pyramid":["render.template",{"lit":[".toyota is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-012e5105","guard":[["hasAny",["element","itau","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[".itau is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-03423fa6","guard":[["hasAny",["element","item number","kred","nth","position"]]],"pyramid":["render.template",{"lit":[".kred is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-04baff19","guard":[["hasAny",["element","item number","iwc","nth","position"]]],"pyramid":["render.template",{"lit":[".iwc is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-0b24ccfa","guard":[["hasAny",["element","im","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".im is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-0ba673bf","guard":[["hasAny",["element","item number","nth","position","study"]]],"pyramid":["render.template",{"lit":[".study is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-0c325fc4","guard":[["hasAny",["element","item number","nth","position","xyz"]]],"pyramid":["render.template",{"lit":[".xyz is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-0e69217c","guard":[["hasAny",["element","item number","map","nth","position"]]],"pyramid":["render.template",{"lit":[".map is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-1270b482","guard":[["hasAny",["element","item number","nth","position","star"]]],"pyramid":["render.template",{"lit":[".star is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-159a0432","guard":[["hasAny",["cal","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".cal is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-18f386ee","guard":[["hasAny",["element","estate","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".estate is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-1e0960be","guard":[["hasAny",["element","item number","nth","position","мон"]]],"pyramid":["render.template",{"lit":[".мон is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-2113e2c3","guard":[["hasAny",["element","item number","nth","position","voyage"]]],"pyramid":["render.template",{"lit":[".voyage is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-24b8e3e7","guard":[["hasAny",["element","item number","ls","nth","position"]]],"pyramid":["render.template",{"lit":[".ls is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-296c3b63","guard":[["hasAny",["element","item number","nth","position","tv"]],["has","name"]],"pyramid":["render.template",{"lit":[".tv is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-2c7c4390","guard":[["hasAny",["element","item number","nth","position","परकष"]],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्षा is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-353a3a95","guard":[["hasAny",["element","item number","nth","position","yt"]],["has","name"]],"pyramid":["render.template",{"lit":[".yt is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-3b9af0b4","guard":[["hasAny",["element","item number","nth","position","sport"]]],"pyramid":["render.template",{"lit":[".sport is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-3df013e4","guard":[["hasAny",["element","item number","nth","position","sharp"]]],"pyramid":["render.template",{"lit":[".sharp is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-43067470","guard":[["hasAny",["element","item number","nth","position","theater"]]],"pyramid":["render.template",{"lit":[".theater is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-47d5c584","guard":[["hasAny",["arab","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".arab is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-4b909c0e","guard":[["hasAny",["element","hgtv","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".hgtv is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-50ed5f60","guard":[["hasAny",["element","item number","nth","position","tiaa"]]],"pyramid":["render.template",{"lit":[".tiaa is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-51ea8699","guard":[["hasAny",["asda","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".asda is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-54cc1a59","guard":[["hasAny",["element","item number","nth","plumbing","position"]]],"pyramid":["render.template",{"lit":[".plumbing is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-552db5a0","guard":[["hasAny",["element","family","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".family is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-56efb41f","guard":[["hasAny",["element","item number","la","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".la is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-5ae84c97","guard":[["hasAny",["bugatti","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".bugatti is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-5c495a3a","guard":[["hasAny",["element","item number","nth","position","pt"]],["has","who"]],"pyramid":["render.template",{"lit":[".pt is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-6040868b","guard":[["hasAny",["element","item number","nth","position","supply"]]],"pyramid":["render.template",{"lit":[".supply is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-63125383","guard":[["hasAny",["boots","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".boots is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-681aa3f8","guard":[["hasAny",["element","item number","mx","nth","position"]]],"pyramid":["render.template",{"lit":[".mx is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-68ebd05b","guard":[["hasAny",["element","guru","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".guru is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-69888a96","guard":[["hasAny",["element","item number","mv","nth","position"]]],"pyramid":["render.template",{"lit":[".mv is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-6a4ee262","guard":[["hasAny",["element","express","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".express is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-6b941a17","guard":[["hasAny",["element","item number","nth","position","rip"]]],"pyramid":["render.template",{"lit":[".rip is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-6db21940","guard":[["hasAny",["bar","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[".bar is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-706e97f0","guard":[["hasAny",["element","item number","nth","position","भरत"]]],"pyramid":["render.template",{"lit":[".भारत is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-709c41ea","guard":[["hasAny",["bauhaus","element","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[".bauhaus is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-71a5c3b0","guard":[["hasAny",["deloitte","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".deloitte is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-77e2e6f8","guard":[["hasAny",["element","item number","nth","position","рус"]]],"pyramid":["render.template",{"lit":[".рус is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-7c11f485","guard":[["hasAny",["element","item number","kiwi","nth","position"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".kiwi is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-7d15a851","guard":[["hasAny",["element","item number","nth","position","surf"]]],"pyramid":["render.template",{"lit":[".surf is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-8051a1a2","guard":[["hasAny",["element","item number","nth","position","su"]]],"pyramid":["render.template",{"lit":[".su is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-8791d89c","guard":[["hasAny",["element","item number","lifeinsurance","nth","position"]]],"pyramid":["render.template",{"lit":[".lifeinsurance is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-879df6a8","guard":[["hasAny",["art","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".art is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-87dfaea3","guard":[["hasAny",["element","item number","nth","position","wanggou"]]],"pyramid":["render.template",{"lit":[".wanggou is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-881a5c38","guard":[["hasAny",["element","fire","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".fire is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-88dd4def","guard":[["hasAny",["element","item number","nth","position","tw"]]],"pyramid":["render.template",{"lit":[".tw is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-90fb457e","guard":[["hasAny",["element","item number","nth","position","studio"]]],"pyramid":["render.template",{"lit":[".studio is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-92f7d20e","guard":[["hasAny",["element","item number","nth","position","sale"]]],"pyramid":["render.template",{"lit":[".sale is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-93c9020c","guard":[["hasAny",["element","item number","nth","position","rwe"]]],"pyramid":["render.template",{"lit":[".rwe is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-971f6de7","guard":[["hasAny",["element","hospital","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".hospital is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-9d82cfae","guard":[["hasAny",["element","furniture","item number","nth","position"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".furniture is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-a0144796","guard":[["hasAny",["element","item number","nth","photography","position"]],["has","which"]],"pyramid":["render.template",{"lit":[".photography is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-a3ac380c","guard":[["hasAny",["avianca","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".avianca is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-a558629c","guard":[["hasAny",["element","item number","nth","position","seat"]]],"pyramid":["render.template",{"lit":[".seat is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-ab1145d8","guard":[["hasAny",["element","fujixerox","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".fujixerox is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-abf7a6ac","guard":[["hasAny",["element","item number","nth","position","ye"]],["has","who"]],"pyramid":["render.template",{"lit":[".ye is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-ac177467","guard":[["hasAny",["element","item number","nth","position","rs"]],["has","which"]],"pyramid":["render.template",{"lit":[".rs is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-ad6fd8cc","guard":[["hasAny",["element","item number","nth","position","sas"]]],"pyramid":["render.template",{"lit":[".sas is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-af86e1f4","guard":[["hasAny",["element","item number","nth","pamperedchef","position"]]],"pyramid":["render.template",{"lit":[".pamperedchef is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-b234f456","guard":[["hasAny",["clubmed","element","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[".clubmed is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-b96ab1a0","guard":[["hasAny",["element","item number","nth","position","sv"]],["has","which"]],"pyramid":["render.template",{"lit":[".sv is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-b9767033","guard":[["hasAny",["element","item number","nikon","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".nikon is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-bedb0b01","guard":[["hasAny",["element","forsale","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".forsale is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-bf39a476","guard":[["hasAny",["ee","element","item number","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".ee is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-c19474d9","guard":[["hasAny",["diet","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".diet is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-c1c1227c","guard":[["hasAny",["computer","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".computer is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-c1de1349","guard":[["hasAny",["element","item number","nth","position","امارات"]]],"pyramid":["render.template",{"lit":["‏.امارات‎ is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-c455178e","guard":[["hasAny",["element","item number","marriott","nth","position"]]],"pyramid":["render.template",{"lit":[".marriott is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-c479624d","guard":[["hasAny",["element","item number","mtr","nth","position"]]],"pyramid":["render.template",{"lit":[".mtr is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-c4a80fa9","guard":[["hasAny",["element","item number","lacaixa","nth","position"]]],"pyramid":["render.template",{"lit":[".lacaixa is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-c58037b8","guard":[["hasAny",["element","hockey","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".hockey is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-c6fb8679","guard":[["hasAny",["element","item number","nth","position","إختبار"]],["has","name"]],"pyramid":["render.template",{"lit":["‏.إختبار‎ is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-c9b138c4","guard":[["hasAny",["element","item number","nth","plus","position"]]],"pyramid":["render.template",{"lit":[".plus is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-ca74b32f","guard":[["hasAny",["ci","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".ci is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-d0ca1657","guard":[["hasAny",["element","forum","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".forum is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-d143d3ab","guard":[["hasAny",["element","item number","nth","position","tab"]]],"pyramid":["render.template",{"lit":[".tab is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-d1778420","guard":[["hasAny",["discover","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".discover is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-d2b49269","guard":[["hasAny",["element","item number","nth","position","works"]]],"pyramid":["render.template",{"lit":[".works is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-d435a57f","guard":[["hasAny",["element","item number","juegos","nth","position"]]],"pyramid":["render.template",{"lit":[".juegos is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-d71a1a57","guard":[["hasAny",["commbank","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".commbank is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-d973dfd1","guard":[["hasAny",["element","item number","nth","position","spa"]]],"pyramid":["render.template",{"lit":[".spa is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-df27e3e4","guard":[["hasAny",["book","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".book is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-e328d872","guard":[["hasAny",["element","item number","nth","position","vivo"]]],"pyramid":["render.template",{"lit":[".vivo is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-e3ab4fd7","guard":[["hasAny",["element","item number","mk","nth","position"]]],"pyramid":["render.template",{"lit":[".mk is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-e4bdfe3d","guard":[["hasAny",["element","item number","kg","nth","position"]]],"pyramid":["render.template",{"lit":[".kg is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-e5748212","guard":[["hasAny",["element","goog","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".goog is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-e75d85e4","guard":[["hasAny",["element","item number","nth","position","ryukyu"]]],"pyramid":["render.template",{"lit":[".ryukyu is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-e8a32294","guard":[["hasAny",["education","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".education is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-eea5c3ba","guard":[["hasAny",["element","item number","nth","position","yodobashi"]]],"pyramid":["render.template",{"lit":[".yodobashi is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-f3690759","guard":[["hasAny",["element","honeywell","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".honeywell is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-f473d81d","guard":[["hasAny",["element","item number","nth","poker","position"]]],"pyramid":["render.template",{"lit":[".poker is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-f58e760b","guard":[["hasAny",["coop","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".coop is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-f652d19e","guard":[["hasAny",["element","item number","nth","position","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".us is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-f6c5a149","guard":[["hasAny",["element","item number","nth","position","الاردن"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":["‏.الاردن‎ is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-f88e40bf","guard":[["hasAny",["element","hyatt","item number","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".hyatt is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-fe4a7937","guard":[["hasAny",["element","item number","nth","position","za"]]],"pyramid":["render.template",{"lit":[".za is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-ff6e4bd9","guard":[["hasAny",["element","item number","nth","position","repair"]]],"pyramid":["render.template",{"lit":[".repair is sponsored by ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]],"mem":null},
{"id":"n-14159789","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".us is sponsored by ",{"slot":0},"."]},["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-21f6e62b","guard":[["hasAny",["element","invert case","item number","nth","position","swap case","toggle case","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".us is sponsored by ",{"slot":0},"."]},["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-3dccb388","guard":[["hasAny",["element","im","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[".im is sponsored by ",{"slot":0},"."]},["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-44921870","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".us is sponsored by ",{"slot":0},"."]},["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-5a87282c","guard":[["hasAny",["element","im","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".im is sponsored by ",{"slot":0},"."]},["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-761e4de0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","im","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[".im is sponsored by ",{"slot":0},"."]},["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-96e26e19","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","position","upper case","uppercase","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".us is sponsored by ",{"slot":0},"."]},["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-a18654f2","guard":[["hasAny",["dashes","each word","element","forum","hyphens","item number","kebab case","kebabcase","nth","position","slug","split into words","words"]]],"pyramid":["render.list",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]]],"mem":null},
{"id":"n-de6264df","guard":[["hasAny",["delete","domain","element","item number","nth","position","remove","strip out","without"]],["has","who"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["sense.unit"]]],"mem":null},
{"id":"n-df9e8029","guard":[["hasAny",["all caps","capital letters","capitals","element","im","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[".im is sponsored by ",{"slot":0},"."]},["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-05a98ca3","guard":[["hasAny",["character count","element","how many characters","item number","length","nth","number of characters","position","परकष"]],["has","name"]],"pyramid":["render.and",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-0c1f3787","guard":[["hasAny",["append","combine","concatenate","ee","element","item number","no vowels","nth","position","put together","remove vowels","without vowels"]],["has","who"]],"pyramid":["render.str",["transform.concat",["transform.noVowels",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-10651ff6","guard":[["hasAny",["character count","element","how many characters","item number","length","nth","number of characters","position","परकष"]],["has","name"]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-1907f086","guard":[["hasAny",["ci","consonant count","element","how many consonants","item number","nth","number of consonants","position"]]],"pyramid":["render.and",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.consonants",["sense.roman"]]]],"mem":null},
{"id":"n-24605359","guard":[["hasAny",["characters from","element","item number","letters from to","nth","position","slice of the text","substring","sv"]],["has","which"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],{"lit":1},{"lit":5}]],"mem":null},
{"id":"n-69340a2f","guard":[["hasAny",["append","combine","concatenate","ee","element","item number","no vowels","nth","position","put together","remove vowels","without vowels"]],["has","who"]],"pyramid":["render.str",["transform.concat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-700c5193","guard":[["hasAny",["character count","element","how many characters","item number","length","nth","number of characters","position","परकष"]],["has","name"]],"pyramid":["render.lines",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-78244a4c","guard":[["hasAny",["body","element","how many vowels","item number","nth","number of vowels","position","vowel count"]]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.vowels",["sense.roman"]]]],"mem":null},
{"id":"n-b8566750","guard":[["hasAny",["ci","consonant count","element","how many consonants","item number","nth","number of consonants","position"]]],"pyramid":["render.lines",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.consonants",["sense.roman"]]]],"mem":null},
{"id":"n-fbececa9","guard":[["hasAny",["ci","consonant count","element","how many consonants","item number","nth","number of consonants","position"]]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["aggregate.consonants",["sense.roman"]]]],"mem":null},
{"id":"n-6aae3974","guard":[["hasAny",["append","combine","concatenate","ee","element","item number","no vowels","nth","position","put together","remove vowels","without vowels"]],["has","who"]],"pyramid":["render.str",["transform.concat",["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]]]],"mem":null},
{"id":"n-8a9356c1","guard":[["hasAny",["change to","domain","element","item number","nth","position","replace","substitute","swap"]],["has","who"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],["sense.unit"],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-e6dc8d02","guard":[["hasAny",["append","combine","concatenate","ee","element","item number","no vowels","nth","position","put together","remove vowels","without vowels"]],["has","who"]],"pyramid":["render.str",["transform.concat",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"tld-types"},{"lit":"top-level domain"}],{"lit":1}],{"lit":"tld-types"},{"lit":"top-level domain"},{"lit":"sponsoring organization"}]]],"mem":null},
{"id":"n-02b2c8a7","guard":[["hasAny",["computer","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .computer":".computer is sponsored by Binky Moon, LLC."}}},
{"id":"n-0565e664","guard":[["hasAny",["domain","nikon","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .nikon":".nikon is sponsored by NIKON CORPORATION."}}},
{"id":"n-05ca27dc","guard":[["hasAny",["body","name","sponsoring","إختبار"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of ‏.إختبار‎":"‏.إختبار‎ is sponsored by Not assigned."}}},
{"id":"n-071186c7","guard":[["has","परकष"],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["sense.lastWord"]],"mem":null},
{"id":"n-089316e3","guard":[["hasAny",["domain","sponsors","sport","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .sport":".sport is sponsored by SportAccord."}}},
{"id":"n-098a13b4","guard":[["hasAny",["domain","ls","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .ls":".ls is sponsored by Lesotho Network Information Centre Proprietary (LSNIC)."}}},
{"id":"n-0c2a548f","guard":[["hasAny",["domain","goog","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .goog":".goog is sponsored by Charleston Road Registry Inc.."}}},
{"id":"n-0d2660f0","guard":[["hasAny",["domain","organization","runs","мон"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .мон":".мон is sponsored by Datacom Co.,Ltd."}}},
{"id":"n-0d3e36a1","guard":[["hasAny",["domain","organization","pamperedchef","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .pamperedchef":".pamperedchef is sponsored by Not assigned."}}},
{"id":"n-0f231bec","guard":[["hasAny",["domain","hospital","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .hospital":".hospital is sponsored by Binky Moon, LLC."}}},
{"id":"n-1140c632","guard":[["hasAny",["body","estate","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .estate":".estate is sponsored by Binky Moon, LLC."}}},
{"id":"n-115d8a71","guard":[["has","yt"],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["sense.lastWord"]],"mem":null},
{"id":"n-1397f3b7","guard":[["hasAny",["body","lifeinsurance","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .lifeinsurance":".lifeinsurance is sponsored by American Council of Life Insurers."}}},
{"id":"n-13bac96e","guard":[["hasAny",["domain","sharp","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .sharp":".sharp is sponsored by Sharp Corporation."}}},
{"id":"n-15b83f8b","guard":[["hasAny",["body","name","sponsoring","tv"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .tv":".tv is sponsored by Ministry of Transport, Energy, Communications and Innovations."}}},
{"id":"n-171de3e9","guard":[["hasAny",["body","kiwi","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .kiwi":".kiwi is sponsored by DOT KIWI LIMITED."}}},
{"id":"n-1930f6fa","guard":[["hasAny",["domain","hyatt","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .hyatt":".hyatt is sponsored by Hyatt GTLD, L.L.C.."}}},
{"id":"n-1b391edd","guard":[["hasAny",["bauhaus","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .bauhaus":".bauhaus is sponsored by Werkhaus GmbH."}}},
{"id":"n-1b8ef012","guard":[["has","asda"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asda Stores Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-1c93b52d","guard":[["hasAny",["arab","body","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .arab":".arab is sponsored by League of Arab States."}}},
{"id":"n-1cc8103f","guard":[["hasAny",["avianca","domain","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .avianca":".avianca is sponsored by Not assigned."}}},
{"id":"n-2035c998","guard":[["hasAny",["body","name","poker","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .poker":".poker is sponsored by Identity Digital Limited."}}},
{"id":"n-21c637c3","guard":[["has","tv"],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["sense.lastWord"]],"mem":null},
{"id":"n-2231b095","guard":[["has","ee"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["sense.lastWord"]],"mem":null},
{"id":"n-284b2e9c","guard":[["hasAny",["body","kred","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .kred":".kred is sponsored by KredTLD Pty Ltd."}}},
{"id":"n-2ab19597","guard":[["has","rwe"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by RWE AG."]},["sense.lastWord"]],"mem":null},
{"id":"n-2cbe390d","guard":[["has","pt"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.PT."]},["sense.lastWord"]],"mem":null},
{"id":"n-2f7818a7","guard":[["hasAny",["body","name","sponsoring","wanggou"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .wanggou":".wanggou is sponsored by Amazon Registry Services, Inc.."}}},
{"id":"n-307526c3","guard":[["hasAny",["body","name","plumbing","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .plumbing":".plumbing is sponsored by Binky Moon, LLC."}}},
{"id":"n-332c54be","guard":[["hasAny",["discover","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .discover":".discover is sponsored by Discover Financial Services."}}},
{"id":"n-35cc6828","guard":[["hasAny",["body","express","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .express":".express is sponsored by Binky Moon, LLC."}}},
{"id":"n-36b2dc3e","guard":[["has","sas"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Research IP LLC."]},["sense.lastWord"]],"mem":null},
{"id":"n-3a81415c","guard":[["has","tiaa"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Teachers Insurance and Annuity Association of America."]},["sense.lastWord"]],"mem":null},
{"id":"n-3babf534","guard":[["hasAny",["domain","sponsors","star","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .star":".star is sponsored by Star India Private Limited."}}},
{"id":"n-3d46a2e0","guard":[["hasAny",["body","forsale","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .forsale":".forsale is sponsored by Dog Beach, LLC."}}},
{"id":"n-4526c3b5","guard":[["hasAny",["domain","ee","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .ee":".ee is sponsored by Eesti Interneti Sihtasutus (EIS)."}}},
{"id":"n-470e6a69","guard":[["hasAny",["asda","domain","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .asda":".asda is sponsored by Asda Stores Limited."}}},
{"id":"n-47afdd8c","guard":[["has","bauhaus"],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Werkhaus GmbH."]},["sense.lastWord"]],"mem":null},
{"id":"n-48d6352f","guard":[["hasAny",["book","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .book":".book is sponsored by Amazon Registry Services, Inc.."}}},
{"id":"n-4997aa13","guard":[["has","za"],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ZA Domain Name Authority."]},["sense.lastWord"]],"mem":null},
{"id":"n-4a773b31","guard":[["has","mk"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["sense.lastWord"]],"mem":null},
{"id":"n-4aa7b315","guard":[["has","sharp"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Sharp Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-4ac04cb0","guard":[["has","tw"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["sense.lastWord"]],"mem":null},
{"id":"n-4be65c19","guard":[["hasAny",["body","name","sponsoring","za"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .za":".za is sponsored by ZA Domain Name Authority."}}},
{"id":"n-4befc7f5","guard":[["has","commbank"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by COMMONWEALTH BANK OF AUSTRALIA."]},["sense.lastWord"]],"mem":null},
{"id":"n-4d354f80","guard":[["has","kred"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by KredTLD Pty Ltd."]},["sense.lastWord"]],"mem":null},
{"id":"n-50d11d42","guard":[["hasAny",["domain","organization","runs","toyota"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .toyota":".toyota is sponsored by TOYOTA MOTOR CORPORATION."}}},
{"id":"n-544a091b","guard":[["hasAny",["domain","family","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .family":".family is sponsored by Dog Beach, LLC."}}},
{"id":"n-54d7aded","guard":[["hasAny",["domain","sponsors","su","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .su":".su is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS)."}}},
{"id":"n-55fc6087","guard":[["hasAny",["body","diet","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .diet":".diet is sponsored by XYZ.COM LLC."}}},
{"id":"n-5799d3c7","guard":[["has","la"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["sense.lastWord"]],"mem":null},
{"id":"n-5a984bc9","guard":[["hasAny",["domain","sponsors","toplevel","xyz"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .xyz":".xyz is sponsored by XYZ.COM LLC."}}},
{"id":"n-5b01315f","guard":[["hasAny",["domain","sponsors","toplevel","ye"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .ye":".ye is sponsored by TeleYemen."}}},
{"id":"n-5bede046","guard":[["has","spa"],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia Spa and Wellness Promotion Council Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-5c21fda0","guard":[["hasAny",["domain","pt","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .pt":".pt is sponsored by Associação DNS.PT."}}},
{"id":"n-5ec56fe2","guard":[["has","ye"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["sense.lastWord"]],"mem":null},
{"id":"n-6091847b","guard":[["hasAny",["domain","sponsors","toplevel","tw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .tw":".tw is sponsored by Taiwan Network Information Center (TWNIC)."}}},
{"id":"n-610aa11c","guard":[["hasAny",["body","marriott","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .marriott":".marriott is sponsored by Marriott Worldwide Corporation."}}},
{"id":"n-616d893d","guard":[["hasAny",["body","hockey","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .hockey":".hockey is sponsored by Binky Moon, LLC."}}},
{"id":"n-61d73f93","guard":[["hasAny",["domain","seat","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .seat":".seat is sponsored by SEAT, S.A. (Sociedad Unipersonal)."}}},
{"id":"n-64985dca","guard":[["hasAny",["domain","organization","runs","yodobashi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .yodobashi":".yodobashi is sponsored by YODOBASHI CAMERA CO.,LTD.."}}},
{"id":"n-660f32d1","guard":[["hasAny",["body","lacaixa","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .lacaixa":".lacaixa is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."}}},
{"id":"n-66171966","guard":[["has","lacaixa"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."]},["sense.lastWord"]],"mem":null},
{"id":"n-68bce8a5","guard":[["hasAny",["domain","sponsors","toplevel","vivo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .vivo":".vivo is sponsored by Telefonica Brasil S.A.."}}},
{"id":"n-69f6a315","guard":[["has","hyatt"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Hyatt GTLD, L.L.C.."]},["sense.lastWord"]],"mem":null},
{"id":"n-6f2d0524","guard":[["hasAny",["domain","fujixerox","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .fujixerox":".fujixerox is sponsored by Not assigned."}}},
{"id":"n-6f386627","guard":[["hasAny",["deloitte","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .deloitte":".deloitte is sponsored by Deloitte Touche Tohmatsu."}}},
{"id":"n-6f84a66e","guard":[["hasAny",["domain","la","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .la":".la is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."}}},
{"id":"n-700ad76c","guard":[["hasAny",["body","name","sale","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .sale":".sale is sponsored by Dog Beach, LLC."}}},
{"id":"n-702ae9df","guard":[["hasAny",["domain","mtr","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .mtr":".mtr is sponsored by MTR Corporation Limited."}}},
{"id":"n-70cc973e","guard":[["hasAny",["body","name","sponsoring","voyage"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .voyage":".voyage is sponsored by Binky Moon, LLC."}}},
{"id":"n-714cc7bf","guard":[["hasAny",["body","furniture","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .furniture":".furniture is sponsored by Binky Moon, LLC."}}},
{"id":"n-7203071b","guard":[["has","lifeinsurance"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by American Council of Life Insurers."]},["sense.lastWord"]],"mem":null},
{"id":"n-72e5337d","guard":[["has","ryukyu"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by BRregistry, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-7324762f","guard":[["hasAny",["art","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .art":".art is sponsored by UK Creative Ideas Limited."}}},
{"id":"n-76b6b6fc","guard":[["has","itau"],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Itau Unibanco Holding S.A.."]},["sense.lastWord"]],"mem":null},
{"id":"n-78d15c71","guard":[["has","мон"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Datacom Co.,Ltd."]},["sense.lastWord"]],"mem":null},
{"id":"n-7b8e47cb","guard":[["hasAny",["body","mx","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .mx":".mx is sponsored by NIC-Mexico ITESM - Campus Monterrey."}}},
{"id":"n-7f4cfd2c","guard":[["hasAny",["domain","organization","runs","tab"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .tab":".tab is sponsored by Tabcorp Holdings Limited."}}},
{"id":"n-80ef7896","guard":[["hasAny",["domain","organization","runs","rwe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .rwe":".rwe is sponsored by RWE AG."}}},
{"id":"n-8304a844","guard":[["hasAny",["domain","organization","runs","study"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .study":".study is sponsored by Registry Services, LLC."}}},
{"id":"n-8465bc26","guard":[["hasAny",["domain","organization","photography","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .photography":".photography is sponsored by Binky Moon, LLC."}}},
{"id":"n-8540b4c5","guard":[["has","star"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Star India Private Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-878895e5","guard":[["hasAny",["body","name","sponsoring","الاردن"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of ‏.الاردن‎":"‏.الاردن‎ is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE)."}}},
{"id":"n-8a385cfc","guard":[["hasAny",["domain","repair","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .repair":".repair is sponsored by Binky Moon, LLC."}}},
{"id":"n-9141cea5","guard":[["has","mv"],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["sense.lastWord"]],"mem":null},
{"id":"n-971f8cd9","guard":[["has","marriott"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Marriott Worldwide Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-9ba7b420","guard":[["hasAny",["bar","body","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .bar":".bar is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable."}}},
{"id":"n-9cb59448","guard":[["hasAny",["domain","organization","runs","surf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .surf":".surf is sponsored by Registry Services, LLC."}}},
{"id":"n-9e3a84eb","guard":[["hasAny",["domain","honeywell","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .honeywell":".honeywell is sponsored by Not assigned."}}},
{"id":"n-9e47e18c","guard":[["hasAny",["cal","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .cal":".cal is sponsored by Charleston Road Registry Inc.."}}},
{"id":"n-9f03a908","guard":[["hasAny",["domain","mk","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .mk":".mk is sponsored by Macedonian Academic Research Network Skopje."}}},
{"id":"n-a002738d","guard":[["has","امارات"]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."]},["sense.lastWord"]],"mem":null},
{"id":"n-a3b9817d","guard":[["hasAny",["domain","rip","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .rip":".rip is sponsored by Dog Beach, LLC."}}},
{"id":"n-a3e1b3e9","guard":[["hasAny",["domain","sponsors","supply","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .supply":".supply is sponsored by Binky Moon, LLC."}}},
{"id":"n-a647b559","guard":[["has","nikon"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by NIKON CORPORATION."]},["sense.lastWord"]],"mem":null},
{"id":"n-a80915ab","guard":[["hasAny",["domain","organization","runs","spa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .spa":".spa is sponsored by Asia Spa and Wellness Promotion Council Limited."}}},
{"id":"n-af4dd05c","guard":[["hasAny",["domain","sponsors","toplevel","works"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .works":".works is sponsored by Binky Moon, LLC."}}},
{"id":"n-b069be52","guard":[["hasAny",["domain","organization","runs","ryukyu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .ryukyu":".ryukyu is sponsored by BRregistry, Inc.."}}},
{"id":"n-b3fde3f9","guard":[["has","discover"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Discover Financial Services."]},["sense.lastWord"]],"mem":null},
{"id":"n-b47c1b30","guard":[["hasAny",["domain","organization","runs","sv"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .sv":".sv is sponsored by SVNet."}}},
{"id":"n-b881db14","guard":[["hasAny",["body","hgtv","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .hgtv":".hgtv is sponsored by Not assigned."}}},
{"id":"n-b8c35203","guard":[["has","arab"],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of Arab States."]},["sense.lastWord"]],"mem":null},
{"id":"n-bb33d4b9","guard":[["hasAny",["body","name","plus","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .plus":".plus is sponsored by Binky Moon, LLC."}}},
{"id":"n-be69c17f","guard":[["hasAny",["domain","mv","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .mv":".mv is sponsored by Dhivehi Raajjeyge Gulhun PLC."}}},
{"id":"n-c1abfd5f","guard":[["has","deloitte"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Deloitte Touche Tohmatsu."]},["sense.lastWord"]],"mem":null},
{"id":"n-c50c88c1","guard":[["hasAny",["domain","sas","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .sas":".sas is sponsored by Research IP LLC."}}},
{"id":"n-c62484a5","guard":[["hasAny",["domain","juegos","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .juegos":".juegos is sponsored by Dog Beach, LLC."}}},
{"id":"n-c7b1df7a","guard":[["hasAny",["body","ci","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .ci":".ci is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI)."}}},
{"id":"n-c7ffba45","guard":[["hasAny",["domain","organization","runs","studio"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .studio":".studio is sponsored by Dog Beach, LLC."}}},
{"id":"n-ccaf6e31","guard":[["hasAny",["body","name","sponsoring","भरत"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .भारत":".भारत is sponsored by National Internet Exchange of India."}}},
{"id":"n-cd5ba671","guard":[["has","рус"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Rusnames Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-ce290896","guard":[["hasAny",["domain","kg","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .kg":".kg is sponsored by AsiaInfo Telecommunication Enterprise."}}},
{"id":"n-d0b9a48c","guard":[["hasAny",["commbank","domain","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .commbank":".commbank is sponsored by COMMONWEALTH BANK OF AUSTRALIA."}}},
{"id":"n-d255425a","guard":[["hasAny",["domain","sponsors","theater","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .theater":".theater is sponsored by Binky Moon, LLC."}}},
{"id":"n-d414a90c","guard":[["hasAny",["coop","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .coop":".coop is sponsored by DotCooperation LLC."}}},
{"id":"n-d492ff47","guard":[["hasAny",["body","fire","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .fire":".fire is sponsored by Amazon Registry Services, Inc.."}}},
{"id":"n-d49a5fe9","guard":[["hasAny",["body","itau","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .itau":".itau is sponsored by Itau Unibanco Holding S.A.."}}},
{"id":"n-d6ee1ab5","guard":[["hasAny",["boots","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .boots":".boots is sponsored by Not assigned."}}},
{"id":"n-daf97fcb","guard":[["hasAny",["bugatti","domain","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .bugatti":".bugatti is sponsored by Not assigned."}}},
{"id":"n-db1122e8","guard":[["hasAny",["domain","sponsors","toplevel","امارات"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain ‏.امارات‎":"‏.امارات‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."}}},
{"id":"n-dda4062b","guard":[["hasAny",["domain","map","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .map":".map is sponsored by Charleston Road Registry Inc.."}}},
{"id":"n-e14adc6f","guard":[["hasAny",["domain","sponsors","toplevel","рус"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .рус":".рус is sponsored by Rusnames Limited."}}},
{"id":"n-e431bab1","guard":[["hasAny",["body","forum","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .forum":".forum is sponsored by Fegistry, LLC."}}},
{"id":"n-e5130792","guard":[["hasAny",["domain","education","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .education":".education is sponsored by Binky Moon, LLC."}}},
{"id":"n-ed695786","guard":[["hasAny",["domain","sponsors","tiaa","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .tiaa":".tiaa is sponsored by Teachers Insurance and Annuity Association of America."}}},
{"id":"n-f12ca27b","guard":[["hasAny",["body","name","sponsoring","परकष"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .परीक्षा":".परीक्षा is sponsored by Not assigned."}}},
{"id":"n-f5a69a0b","guard":[["hasAny",["body","name","sponsoring","yt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .yt":".yt is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."}}},
{"id":"n-f5bae580","guard":[["hasAny",["domain","iwc","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .iwc":".iwc is sponsored by Not assigned."}}},
{"id":"n-f7486410","guard":[["has","vivo"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Telefonica Brasil S.A.."]},["sense.lastWord"]],"mem":null},
{"id":"n-f8c33b32","guard":[["hasAny",["domain","organization","rs","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .rs":".rs is sponsored by Serbian National Internet Domain Registry (RNIDS)."}}},
{"id":"n-f9c424bc","guard":[["hasAny",["body","guru","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .guru":".guru is sponsored by Binky Moon, LLC."}}},
{"id":"n-fb12499a","guard":[["has","yodobashi"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by YODOBASHI CAMERA CO.,LTD.."]},["sense.lastWord"]],"mem":null},
{"id":"n-fe462e50","guard":[["hasAny",["clubmed","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .clubmed":".clubmed is sponsored by Club Méditerranée S.A.."}}},
{"id":"n-ffff9c3a","guard":[["has","भरत"]],"pyramid":["render.template",{"lit":[".भा",{"slot":0}," is sponsored by National Internet Exchange of India."]},["sense.lastWord"]],"mem":null},
{"id":"n-04ace8c5","guard":[["hasAny",["arab","invert case","swap case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".arab is sponsored by League of ",{"slot":0}," States."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-09f23b1f","guard":[["hasAny",["invert case","rwe","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".rwe is sponsored by ",{"slot":0}," AG."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0d905c82","guard":[["hasAny",["bauhaus","capitalise","capitalize","capitalize each word","title case"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Werkhaus GmbH."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0d99536f","guard":[["hasAny",["invert case","swap case","toggle case","tw"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1120417c","guard":[["hasAny",["invert case","swap case","tiaa","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Teachers Insurance and Annuity Association of America."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-11db6d14","guard":[["hasAny",["invert case","lacaixa","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-13a57e9c","guard":[["hasAny",["invert case","nikon","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".nikon is sponsored by ",{"slot":0}," CORPORATION."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1a6f9e22","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mv","title case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-22c85f04","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mk","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2412e3b6","guard":[["has","asda"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-25f10d83","guard":[["has","itau"],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-25f918e5","guard":[["hasAny",["invert case","sas","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Research IP LLC."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-29140636","guard":[["hasAny",["shortest","shortest one","shortest word","tv"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2fe8cdd5","guard":[["hasAny",["ee","invert case","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-31af7d44","guard":[["has","hyatt"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-324422cd","guard":[["hasAny",["invert case","swap case","toggle case","परकष"]],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-36807664","guard":[["hasAny",["invert case","swap case","toggle case","рус"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Rusnames Limited."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3933c0d2","guard":[["hasAny",["invert case","mv","swap case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3bbffa9e","guard":[["hasAny",["invert case","swap case","toggle case","tv"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-41d67f29","guard":[["hasAny",["commbank","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by COMMONWEALTH BANK OF AUSTRALIA."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-41da43e3","guard":[["hasAny",["invert case","swap case","toggle case","za"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".za is sponsored by ",{"slot":0}," Domain Name Authority."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4290e56e","guard":[["hasAny",["discover","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".discover is sponsored by ",{"slot":0}," Financial Services."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4357a212","guard":[["has","star"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-43a708b6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sas","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Research IP LLC."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-458900b3","guard":[["has","pt"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-45ce93bf","guard":[["has","spa"],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-49bc9d5a","guard":[["hasAny",["no vowels","remove vowels","without vowels","परकष"]],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-4aabe940","guard":[["hasAny",["invert case","swap case","toggle case","امارات"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4d0ddd62","guard":[["hasAny",["invert case","lifeinsurance","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by American Council of Life Insurers."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5013ae19","guard":[["has","arab"],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-502cb516","guard":[["has","za"],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-5382090b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","ye"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5578601d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","la","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-56b7e976","guard":[["hasAny",["invert case","star","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".star is sponsored by ",{"slot":0}," India Private Limited."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5ac2f437","guard":[["hasAny",["bauhaus","invert case","swap case","toggle case"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Werkhaus GmbH."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5ea8b7f7","guard":[["hasAny",["invert case","itau","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".itau is sponsored by ",{"slot":0}," Unibanco Holding S.A.."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-62daa294","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tv"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-68ec088f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","परकष"]],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-68f740e2","guard":[["hasAny",["invert case","la","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6bef3783","guard":[["hasAny",["alphabetize the letters","letters in order","sort the letters","परकष"]],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-6d7d8504","guard":[["hasAny",["invert case","pt","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".pt is sponsored by Associação DNS.",{"slot":0},"."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-757dd240","guard":[["hasAny",["invert case","kred","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by KredTLD Pty Ltd."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7fda4340","guard":[["has","rwe"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-818c7192","guard":[["hasAny",["invert case","swap case","toggle case","мон"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Datacom Co.,Ltd."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-879402a5","guard":[["hasAny",["invert case","swap case","toggle case","yodobashi"]]],"pyramid":["render.template",{"lit":[".yodobashi is sponsored by ",{"slot":0}," CAMERA CO.,LTD.."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8c120693","guard":[["has","deloitte"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-8e86d27b","guard":[["has","marriott"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-8ecd6dc3","guard":[["hasAny",["shortest","shortest one","shortest word","yt"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8f87183b","guard":[["hasAny",["invert case","spa","swap case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".spa is sponsored by Asia ",{"slot":0}," and Wellness Promotion Council Limited."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-93f4858a","guard":[["hasAny",["invert case","swap case","toggle case","yt"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9f65590c","guard":[["hasAny",["invert case","marriott","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".marriott is sponsored by ",{"slot":0}," Worldwide Corporation."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a4dd2681","guard":[["hasAny",["hyatt","invert case","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".hyatt is sponsored by ",{"slot":0}," GTLD, L.L.C.."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a69e0bbc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tw"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b137d918","guard":[["has","xyz"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-b34d6c33","guard":[["hasAny",["invert case","swap case","toggle case","भरत"]]],"pyramid":["render.template",{"lit":[".भा",{"slot":0}," is sponsored by National Internet Exchange of India."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b4c824c3","guard":[["hasAny",["backwards","reversed","spell backwards","परकष"]],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["transform.reverse",["sense.lastWord"]]],"mem":null},
{"id":"n-b54b88eb","guard":[["hasAny",["invert case","swap case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".xyz is sponsored by ",{"slot":0},".COM LLC."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bdbc7278","guard":[["hasAny",["invert case","swap case","toggle case","ye"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c19b0781","guard":[["hasAny",["deloitte","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".deloitte is sponsored by ",{"slot":0}," Touche Tohmatsu."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c213a6af","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","yt"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d1d31ffd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ee","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-daa50e12","guard":[["hasAny",["invert case","ryukyu","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by BRregistry, Inc.."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-de186760","guard":[["hasAny",["invert case","mk","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-df5d8d78","guard":[["has","discover"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-e6f2ae2d","guard":[["has","yodobashi"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-f403a90a","guard":[["hasAny",["no vowels","remove vowels","without vowels","भरत"]]],"pyramid":["render.template",{"lit":[".भा",{"slot":0}," is sponsored by National Internet Exchange of India."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-f84f1065","guard":[["hasAny",["invert case","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".sharp is sponsored by ",{"slot":0}," Corporation."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-fda9d670","guard":[["hasAny",["asda","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".asda is sponsored by ",{"slot":0}," Stores Limited."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-032c6304","guard":[["hasAny",["normalise","normalize","simplify the text","yt"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-0697f421","guard":[["hasAny",["shortest","shortest one","shortest word","za"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0748fecf","guard":[["hasAny",["item number","mv","nth","position"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0bb0e3c3","guard":[["hasAny",["each word","split into words","рус"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Rusnames Limited."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0bf33444","guard":[["hasAny",["item number","nth","position","tv"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-127df36d","guard":[["hasAny",["normalise","normalize","sas","simplify the text"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Research IP LLC."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-146e7394","guard":[["hasAny",["each word","la","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-16866867","guard":[["hasAny",["each word","split into words","भरत"]]],"pyramid":["render.template",{"lit":[".भा",{"slot":0}," is sponsored by National Internet Exchange of India."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-17b48648","guard":[["hasAny",["item number","mk","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-18eef723","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1c5a4fff","guard":[["hasAny",["each word","split into words","امارات"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-208dafcb","guard":[["hasAny",["each word","split into words","tv"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2115602e","guard":[["hasAny",["delete","remove","strip out","without","xyz"]]],"pyramid":["render.str",["transform.remove",{"lit":"XYZ.COM LLC"},["sense.after",{"lit":"domain"}]]],"mem":null},
{"id":"n-23b40162","guard":[["hasAny",["book","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Amazon Registry Services, Inc."},["sense.after",{"lit":"domain"}]]],"mem":null},
{"id":"n-26501f55","guard":[["hasAny",["commbank","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by COMMONWEALTH BANK OF AUSTRALIA."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-269268bd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","itau","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-27d4477f","guard":[["hasAny",["each word","kred","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by KredTLD Pty Ltd."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-27d7c8b8","guard":[["hasAny",["discover","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2a1f5e1f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pt","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2c9bc5f5","guard":[["hasAny",["each word","split into words","परकष"]],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2fe873b3","guard":[["hasAny",["ee","normalise","normalize","simplify the text"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-31571aae","guard":[["hasAny",["item number","la","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-32d5adb6","guard":[["hasAny",["item number","nth","position","tv"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3ae2183b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","star","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3c18e622","guard":[["hasAny",["caesar cipher","consonant count","how many consonants","number of consonants","photography","rotate the letters","shift by","shift each letter"]],["has","which"]],"pyramid":["render.str",["transform.caesar",{"lit":"Binky Moon, LLC"},["aggregate.consonants",["sense.text"]]]],"mem":null},
{"id":"n-3d34edb9","guard":[["hasAny",["lacaixa","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-3e4b239f","guard":[["hasAny",["commbank","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by COMMONWEALTH BANK OF AUSTRALIA."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3ed156fa","guard":[["hasAny",["each word","split into words","امارات"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3f7039dd","guard":[["hasAny",["normalise","normalize","simplify the text","परकष"]],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-497001d1","guard":[["hasAny",["invert case","spa","swap case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-49ac0ff5","guard":[["hasAny",["item number","nth","position","yt"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-4a6cd8f8","guard":[["hasAny",["each word","split into words","yt"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4b73e6a4","guard":[["hasAny",["each word","ee","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4f4f8775","guard":[["hasAny",["normalise","normalize","ryukyu","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by BRregistry, Inc.."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-52d08989","guard":[["hasAny",["invert case","swap case","toggle case","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-57519372","guard":[["hasAny",["each word","kred","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by KredTLD Pty Ltd."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-59647340","guard":[["hasAny",["each word","sas","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Research IP LLC."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5a7bebcd","guard":[["hasAny",["kred","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by KredTLD Pty Ltd."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-5edef768","guard":[["hasAny",["ee","item number","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-5f4e59fb","guard":[["hasAny",["each word","mk","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-60d1e2e2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hyatt","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-627f199a","guard":[["hasAny",["invert case","swap case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-62815dfe","guard":[["hasAny",["each word","split into words","мон"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Datacom Co.,Ltd."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-69a0afd7","guard":[["hasAny",["bauhaus","normalise","normalize","simplify the text"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Werkhaus GmbH."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-69a82b76","guard":[["hasAny",["each word","lifeinsurance","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by American Council of Life Insurers."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6bb025cc","guard":[["hasAny",["arab","invert case","swap case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6e459005","guard":[["hasAny",["character count","how many characters","number of characters","परकष"]],["has","name"]],"pyramid":["render.and",["iterate.repeat",{"lit":"Not assigned"},["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-70afce3f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","spa","title case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-736860f9","guard":[["hasAny",["each word","split into words","tw"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7bc6c14f","guard":[["hasAny",["each word","ee","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7c408ce5","guard":[["hasAny",["each word","split into words","ye"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7cce411d","guard":[["hasAny",["mv","normalise","normalize","simplify the text"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-7d20a457","guard":[["hasAny",["bauhaus","each word","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Werkhaus GmbH."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7e9065d8","guard":[["hasAny",["each word","ryukyu","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by BRregistry, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7ecc5601","guard":[["hasAny",["asda","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-803a139b","guard":[["hasAny",["item number","mv","nth","position"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-82a20277","guard":[["hasAny",["each word","lifeinsurance","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by American Council of Life Insurers."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-881ffba0","guard":[["hasAny",["invert case","itau","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8e2a6708","guard":[["hasAny",["character count","how many characters","number of characters","परकष"]],["has","name"]],"pyramid":["render.lines",["iterate.repeat",{"lit":"Not assigned"},["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-95b2bc8f","guard":[["hasAny",["ee","item number","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-96aa1b06","guard":[["hasAny",["each word","mv","split into words"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-98d284e0","guard":[["hasAny",["delete","diet","strip out"]],["has","sponsoring"]],"pyramid":["render.str",["transform.remove",{"lit":"XYZ.COM LLC"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-990736c7","guard":[["hasAny",["each word","split into words","рус"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Rusnames Limited."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-99da4360","guard":[["hasAny",["normalise","normalize","simplify the text","tw"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-a6e89bd3","guard":[["hasAny",["each word","mv","split into words"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a7ad8805","guard":[["hasAny",["each word","split into words","ye"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a7b49b9c","guard":[["hasAny",["each word","split into words","भरत"]]],"pyramid":["render.template",{"lit":[".भा",{"slot":0}," is sponsored by National Internet Exchange of India."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a87497d1","guard":[["hasAny",["character count","how many characters","number of characters","परकष"]],["has","name"]],"pyramid":["render.list",["iterate.repeat",{"lit":"Not assigned"},["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-aa10bf62","guard":[["hasAny",["each word","split into words","yt"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-aa1b7d90","guard":[["hasAny",["each word","split into words","tv"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ab6d69b4","guard":[["hasAny",["each word","sas","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Research IP LLC."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b17558af","guard":[["hasAny",["item number","nth","position","sas"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Research IP LLC."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-b22617da","guard":[["hasAny",["each word","la","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b73d2519","guard":[["hasAny",["deloitte","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bbc8a795","guard":[["hasAny",["invert case","pt","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bc52f74a","guard":[["hasAny",["arab","capitalise","capitalize","capitalize each word","title case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bee7ebb8","guard":[["hasAny",["item number","nth","position","ye"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-c0bffe9b","guard":[["hasAny",["caesar cipher","consonant count","how many consonants","number of consonants","pamperedchef","rotate the letters","shift by","shift each letter"]]],"pyramid":["render.str",["transform.caesar",{"lit":"Not assigned"},["aggregate.consonants",["sense.text"]]]],"mem":null},
{"id":"n-c3eaa356","guard":[["hasAny",["invert case","marriott","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c4052d02","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","za"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c8e3c09b","guard":[["hasAny",["commbank","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by COMMONWEALTH BANK OF AUSTRALIA."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c9412773","guard":[["hasAny",["normalise","normalize","simplify the text","ye"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-ca8bf046","guard":[["hasAny",["item number","nth","position","ye"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cd322212","guard":[["hasAny",["each word","ryukyu","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by BRregistry, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ce790598","guard":[["hasAny",["normalise","normalize","simplify the text","tiaa"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Teachers Insurance and Annuity Association of America."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d0ba9a20","guard":[["hasAny",["normalise","normalize","simplify the text","рус"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Rusnames Limited."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d1e78011","guard":[["hasAny",["invert case","rwe","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d3a28e14","guard":[["hasAny",["each word","split into words","परकष"]],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d41980ba","guard":[["hasAny",["each word","split into words","tw"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d522e3b8","guard":[["hasAny",["item number","nth","position","yt"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d5f0cee4","guard":[["hasAny",["item number","nth","position","sas"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Research IP LLC."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d983036f","guard":[["hasAny",["item number","nth","position","tw"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-dcf3041a","guard":[["hasAny",["item number","la","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-e179f3e3","guard":[["hasAny",["lifeinsurance","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by American Council of Life Insurers."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e3117a5d","guard":[["hasAny",["normalise","normalize","simplify the text","мон"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Datacom Co.,Ltd."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e3a36ef7","guard":[["hasAny",["la","normalise","normalize","simplify the text"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e3fd8632","guard":[["hasAny",["item number","mk","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e64f2ab6","guard":[["hasAny",["each word","split into words","мон"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Datacom Co.,Ltd."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e650e644","guard":[["hasAny",["invert case","swap case","toggle case","za"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e68c62e0","guard":[["hasAny",["each word","lacaixa","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e6a7b73e","guard":[["hasAny",["hyatt","invert case","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e70d54f6","guard":[["hasAny",["normalise","normalize","simplify the text","tv"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e83adc39","guard":[["hasAny",["normalise","normalize","simplify the text","امارات"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-ea8fb098","guard":[["hasAny",["each word","mk","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f2665eb0","guard":[["hasAny",["invert case","star","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f5f13542","guard":[["hasAny",["each word","split into words","tiaa"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Teachers Insurance and Annuity Association of America."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f75d1462","guard":[["hasAny",["each word","lacaixa","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f7b32e09","guard":[["hasAny",["normalise","normalize","simplify the text","भरत"]]],"pyramid":["render.template",{"lit":[".भा",{"slot":0}," is sponsored by National Internet Exchange of India."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-f9b0812f","guard":[["hasAny",["mk","normalise","normalize","simplify the text"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-fb8b7f74","guard":[["hasAny",["bauhaus","each word","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Werkhaus GmbH."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fc88a77d","guard":[["hasAny",["each word","split into words","tiaa"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Teachers Insurance and Annuity Association of America."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-03b5deb9","guard":[["hasAny",["item number","nth","position","za"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-044fca43","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","swap case","title case","toggle case","za"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-047f2ff7","guard":[["hasAny",["each word","split into words","tiaa","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Teachers Insurance and Annuity Association of America."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-04a2e80d","guard":[["hasAny",["hyatt","item number","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-0608df1f","guard":[["hasAny",["each word","ryukyu","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by BRregistry, Inc.."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-1339187e","guard":[["hasAny",["each word","split into words","star"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1360e161","guard":[["hasAny",["each word","pt","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-16e4773a","guard":[["hasAny",["hyatt","invert case","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1adb665b","guard":[["hasAny",["deloitte","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1c14598c","guard":[["hasAny",["each word","hyatt","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1ce0d4a1","guard":[["hasAny",["each word","split into words","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1d71c37e","guard":[["hasAny",["asda","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1e5ddd88","guard":[["hasAny",["normalise","normalize","rwe","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-1e7efc09","guard":[["hasAny",["deloitte","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-20517e03","guard":[["hasAny",["clubmed","each word","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Club Méditerranée S.A.."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-2434f7b2","guard":[["hasAny",["each word","split into words","za"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-25c1f4ed","guard":[["hasAny",["each word","split into words","tab","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Tabcorp Holdings Limited."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-27ad35e6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","pt","swap case","title case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3a920d14","guard":[["hasAny",["item number","nth","position","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3e686b43","guard":[["hasAny",["discover","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-40d95b4d","guard":[["hasAny",["each word","rwe","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-41b00558","guard":[["hasAny",["each word","split into words","star"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-42e09961","guard":[["hasAny",["each word","pt","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-43158e5a","guard":[["hasAny",["itau","normalise","normalize","simplify the text"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-43710010","guard":[["hasAny",["coop","each word","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DotCooperation LLC."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-482b6a72","guard":[["hasAny",["invert case","spa","swap case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-49a02ae1","guard":[["hasAny",["invert case","marriott","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4a76d4a5","guard":[["hasAny",["invert case","swap case","toggle case","za"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4a89a31d","guard":[["hasAny",["deloitte","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4d98fc4c","guard":[["hasAny",["invert case","star","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-500dc565","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","swap case","title case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-50beb0d1","guard":[["hasAny",["each word","spa","split into words"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-535f4efb","guard":[["hasAny",["normalise","normalize","simplify the text","star"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-5543375f","guard":[["hasAny",["each word","rs","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Serbian National Internet Domain Registry (RNIDS)."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-5582196a","guard":[["hasAny",["each word","split into words","words","امارات"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-596cee16","guard":[["hasAny",["item number","nth","position","spa"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-5c39e654","guard":[["hasAny",["invert case","shortest","shortest one","shortest word","swap case","toggle case","za"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-63bac18d","guard":[["hasAny",["arab","invert case","swap case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6bfffd05","guard":[["hasAny",["item number","nth","position","spa"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6ec02513","guard":[["hasAny",["each word","itau","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6fe36e97","guard":[["hasAny",["invert case","pt","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-70bfac50","guard":[["hasAny",["each word","split into words","words","мон"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Datacom Co.,Ltd."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-722da1e6","guard":[["hasAny",["each word","itau","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7454d969","guard":[["hasAny",["book","each word","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Amazon Registry Services, Inc.."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-77ce32d2","guard":[["hasAny",["each word","rwe","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-780eaa35","guard":[["hasAny",["arab","item number","nth","position"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-7898267d","guard":[["hasAny",["invert case","rwe","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7c723b89","guard":[["hasAny",["normalise","normalize","simplify the text","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-7f910e67","guard":[["hasAny",["each word","split into words","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-804105f8","guard":[["hasAny",["discover","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-832ee7a1","guard":[["hasAny",["each word","split into words","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-892bb5c5","guard":[["hasAny",["each word","split into words","za"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8a311d2b","guard":[["hasAny",["normalise","normalize","simplify the text","za"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-91200934","guard":[["hasAny",["each word","mk","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-91bcc08a","guard":[["hasAny",["arab","normalise","normalize","simplify the text"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-949be647","guard":[["hasAny",["each word","split into words","words","ye"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-97242b93","guard":[["hasAny",["hyatt","normalise","normalize","simplify the text"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-99dd7238","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","spa","swap case","title case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9d7816e1","guard":[["hasAny",["bauhaus","each word","split into words","words"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Werkhaus GmbH."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-9e5b53f1","guard":[["hasAny",["item number","nth","position","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-a2593298","guard":[["hasAny",["normalise","normalize","pt","simplify the text"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-a67d47ae","guard":[["hasAny",["each word","split into words","su","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS)."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-aaeb32b1","guard":[["hasAny",["each word","split into words","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ac110a68","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hyatt","invert case","swap case","title case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b2964ba3","guard":[["hasAny",["discover","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b45e4f7c","guard":[["hasAny",["each word","ls","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lesotho Network Information Centre Proprietary (LSNIC)."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-b55acedd","guard":[["hasAny",["each word","mv","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-bad0a5ff","guard":[["hasAny",["invert case","swap case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bcb30118","guard":[["hasAny",["marriott","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-bf9419aa","guard":[["hasAny",["each word","marriott","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c9021422","guard":[["hasAny",["each word","hyatt","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cd273694","guard":[["hasAny",["each word","split into words","tw","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-ce3a780e","guard":[["hasAny",["art","each word","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by UK Creative Ideas Limited."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-cfba8a2e","guard":[["hasAny",["deloitte","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d0432716","guard":[["hasAny",["asda","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d1f0e254","guard":[["hasAny",["arab","item number","nth","position"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d49ca372","guard":[["hasAny",["item number","nth","position","star"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-dc4b7bc5","guard":[["hasAny",["each word","split into words","sport","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SportAccord."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-debfcc9f","guard":[["hasAny",["normalise","normalize","simplify the text","spa"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e0aa7de6","guard":[["hasAny",["discover","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e1a90dd7","guard":[["hasAny",["each word","la","split into words","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-e1d1d53a","guard":[["hasAny",["each word","spa","split into words"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e1d567cc","guard":[["hasAny",["item number","nth","position","pt"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e2478f3e","guard":[["hasAny",["asda","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e261ed07","guard":[["hasAny",["hyatt","item number","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e26458f8","guard":[["hasAny",["each word","split into words","sv","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SVNet."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-e8db3e6e","guard":[["hasAny",["invert case","swap case","toggle case","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-eb2d5007","guard":[["hasAny",["each word","marriott","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-eb32c6cb","guard":[["hasAny",["item number","nth","position","star"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-eb6b06ee","guard":[["hasAny",["arab","each word","split into words"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ed95e3bf","guard":[["hasAny",["arab","capitalise","capitalize","capitalize each word","invert case","swap case","title case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ef01ae6c","guard":[["hasAny",["item number","nth","position","pt"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-f0336f94","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","star","swap case","title case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f40c6d2b","guard":[["hasAny",["each word","split into words","words","рус"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Rusnames Limited."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-f466b069","guard":[["hasAny",["arab","each word","split into words"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f4b71f36","guard":[["hasAny",["commbank","each word","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by COMMONWEALTH BANK OF AUSTRALIA."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-f5f98cd6","guard":[["hasAny",["each word","ee","split into words","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-f600195f","guard":[["hasAny",["normalise","normalize","simplify the text","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-f6819f53","guard":[["hasAny",["asda","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f713f5ef","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","itau","swap case","title case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f746d700","guard":[["hasAny",["invert case","itau","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-fde3a3b8","guard":[["hasAny",["item number","nth","position","za"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-054c8379","guard":[["hasAny",["each word","invert case","itau","split into words","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-05a0c738","guard":[["hasAny",["hyatt","invert case","item number","nth","position","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0c7ef58a","guard":[["hasAny",["invert case","item number","nth","position","spa","swap case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1a243b66","guard":[["hasAny",["each word","invert case","split into words","star","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-24413465","guard":[["hasAny",["invert case","normalise","normalize","simplify the text","spa","swap case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2d539a17","guard":[["hasAny",["each word","hyatt","split into words","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-2d7c96f1","guard":[["hasAny",["invert case","item number","nth","position","spa","swap case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2e827d63","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","za"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3304f3eb","guard":[["hasAny",["each word","invert case","marriott","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3452c347","guard":[["hasAny",["invert case","itau","normalise","normalize","simplify the text","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-35ac6421","guard":[["hasAny",["deloitte","invert case","normalise","normalize","simplify the text","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-36b80a10","guard":[["hasAny",["discover","each word","invert case","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-37aa0d09","guard":[["hasAny",["each word","split into words","words","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-3b18b46d","guard":[["hasAny",["invert case","marriott","normalise","normalize","simplify the text","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3c935c35","guard":[["hasAny",["asda","each word","invert case","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3f9b08a3","guard":[["hasAny",["deloitte","each word","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-40193a47","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-42e85907","guard":[["hasAny",["arab","each word","split into words","words"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-459f413a","guard":[["hasAny",["arab","invert case","normalise","normalize","simplify the text","swap case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4afa8205","guard":[["hasAny",["invert case","normalise","normalize","pt","simplify the text","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-54633983","guard":[["hasAny",["deloitte","each word","invert case","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-58038c7d","guard":[["hasAny",["each word","pt","split into words","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-5a76b12b","guard":[["hasAny",["invert case","normalise","normalize","rwe","simplify the text","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5bbca005","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","za"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-615659a0","guard":[["hasAny",["hyatt","invert case","normalise","normalize","simplify the text","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-63633e2d","guard":[["hasAny",["hyatt","invert case","item number","nth","position","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6b63e859","guard":[["hasAny",["each word","invert case","itau","split into words","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-728439e0","guard":[["hasAny",["each word","invert case","marriott","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7489b0f6","guard":[["hasAny",["arab","invert case","item number","nth","position","swap case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-75e6ec4e","guard":[["hasAny",["invert case","item number","nth","position","star","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-778d9de2","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-796323f9","guard":[["hasAny",["each word","spa","split into words","words"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-7b9217f3","guard":[["hasAny",["each word","invert case","rwe","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8411c1d7","guard":[["hasAny",["deloitte","each word","invert case","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-893c14e2","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8d717933","guard":[["hasAny",["each word","split into words","star","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-902b0082","guard":[["hasAny",["invert case","normalise","normalize","simplify the text","swap case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-93f1d812","guard":[["hasAny",["asda","invert case","normalise","normalize","simplify the text","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-96f7bcfc","guard":[["hasAny",["arab","each word","invert case","split into words","swap case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9ef30b68","guard":[["hasAny",["arab","invert case","item number","nth","position","swap case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a58a8fbe","guard":[["hasAny",["arab","each word","invert case","split into words","swap case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a5c4fb62","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a7e0015a","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","za"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b4f1f50a","guard":[["hasAny",["each word","invert case","rwe","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b5332a0c","guard":[["hasAny",["invert case","normalise","normalize","simplify the text","swap case","toggle case","za"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b8a2f1f7","guard":[["hasAny",["each word","split into words","words","xyz"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-b9a7729a","guard":[["hasAny",["invert case","item number","nth","position","pt","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bf88de77","guard":[["hasAny",["each word","rwe","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-c5600e6f","guard":[["hasAny",["each word","invert case","pt","split into words","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c9b8c67e","guard":[["hasAny",["each word","invert case","split into words","star","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-cd0bdfeb","guard":[["hasAny",["discover","each word","invert case","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d5666dc3","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","za"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d633cd61","guard":[["hasAny",["invert case","item number","nth","position","star","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d6828f90","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-da6c2361","guard":[["hasAny",["discover","each word","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-db552405","guard":[["hasAny",["each word","hyatt","invert case","split into words","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-dc4f4e5e","guard":[["hasAny",["each word","hyatt","invert case","split into words","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-dd324688","guard":[["hasAny",["each word","invert case","spa","split into words","swap case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e4cd6ae1","guard":[["hasAny",["invert case","normalise","normalize","simplify the text","swap case","toggle case","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e5f45515","guard":[["hasAny",["each word","split into words","toyota","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-e6a1f13f","guard":[["hasAny",["invert case","item number","nth","position","pt","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e800d306","guard":[["hasAny",["each word","invert case","spa","split into words","swap case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e97dcf34","guard":[["hasAny",["asda","each word","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-ed8102b7","guard":[["hasAny",["asda","each word","invert case","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f20c595d","guard":[["hasAny",["each word","invert case","pt","split into words","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f6761011","guard":[["hasAny",["invert case","normalise","normalize","simplify the text","star","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f89c6930","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ff5ed9fa","guard":[["hasAny",["discover","invert case","normalise","normalize","simplify the text","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-01973233","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","words","xyz"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-15d730fb","guard":[["hasAny",["asda","each word","invert case","split into words","swap case","toggle case","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-495f36ad","guard":[["hasAny",["discover","each word","invert case","split into words","swap case","toggle case","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7ff8e083","guard":[["hasAny",["each word","invert case","rwe","split into words","swap case","toggle case","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9a5acf6f","guard":[["hasAny",["arab","each word","invert case","split into words","swap case","toggle case","words"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b381c3f1","guard":[["hasAny",["each word","hyatt","invert case","split into words","swap case","toggle case","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d099eefd","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","toyota","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d20c70ba","guard":[["hasAny",["deloitte","each word","invert case","split into words","swap case","toggle case","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d9a6f830","guard":[["hasAny",["each word","invert case","pt","split into words","swap case","toggle case","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d9ed02be","guard":[["hasAny",["each word","invert case","split into words","star","swap case","toggle case","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e4cf97e4","guard":[["hasAny",["each word","invert case","spa","split into words","swap case","toggle case","words"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-eea3613b","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","words","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-710505f2","guard":[["hasAny",["abbreviate","abbreviation","acronym","each word","seat","short form","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-ce498181","guard":[["hasAny",["abbreviate","abbreviation","acronym","each word","short form","split into words","vivo","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Telefonica Brasil ",{"slot":1},".A.."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.acronym",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-3a0ee0b1","guard":[["hasAny",["abbreviate","abbreviation","acronym","each word","invert case","seat","short form","split into words","swap case","toggle case","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-b9db76c5","guard":[["hasAny",["art","bauhaus","body","book","boots","cal","clubmed","computer","coop","deloitte","discover","fujixerox","hospital","im","iwc","juegos","ls","map","mv","pamperedchef","photography","rs","rwe","ryukyu","spa","sponsors","studio","study","surf","sv","tab","toyota","yodobashi","мон"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .भारत":".भारत is sponsored by National Internet Exchange of India.","who sponsors the top-level domain .ee":".ee is sponsored by Eesti Interneti Sihtasutus (EIS).","who sponsors the top-level domain .tiaa":".tiaa is sponsored by Teachers Insurance and Annuity Association of America.","who sponsors the top-level domain ‏.امارات‎":"‏.امارات‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA).","who sponsors the top-level domain .seat":".seat is sponsored by SEAT, S.A. (Sociedad Unipersonal).","which organization runs the domain .pamperedchef":".pamperedchef is sponsored by Not assigned.","who sponsors the top-level domain .asda":".asda is sponsored by Asda Stores Limited.","name the sponsoring body of .marriott":".marriott is sponsored by Marriott Worldwide Corporation.","name the sponsoring body of .express":".express is sponsored by Binky Moon, LLC.","who sponsors the top-level domain .xyz":".xyz is sponsored by XYZ.COM LLC.","name the sponsoring body of .bar":".bar is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable.","which organization runs the domain .surf":".surf is sponsored by Registry Services, LLC.","who sponsors the top-level domain .ye":".ye is sponsored by TeleYemen.","who sponsors the top-level domain .sas":".sas is sponsored by Research IP LLC.","which organization runs the domain .ls":".ls is sponsored by Lesotho Network Information Centre Proprietary (LSNIC).","name the sponsoring body of .plumbing":".plumbing is sponsored by Binky Moon, LLC.","which organization runs the domain .study":".study is sponsored by Registry Services, LLC.","which organization runs the domain .sv":".sv is sponsored by SVNet.","which organization runs the domain .hospital":".hospital is sponsored by Binky Moon, LLC.","which organization runs the domain .мон":".мон is sponsored by Datacom Co.,Ltd.","who sponsors the top-level domain .works":".works is sponsored by Binky Moon, LLC.","who sponsors the top-level domain .vivo":".vivo is sponsored by Telefonica Brasil S.A..","which organization runs the domain .im":".im is sponsored by Isle of Man Government.","which organization runs the domain .juegos":".juegos is sponsored by Dog Beach, LLC.","which organization runs the domain .computer":".computer is sponsored by Binky Moon, LLC.","who sponsors the top-level domain .theater":".theater is sponsored by Binky Moon, LLC.","name the sponsoring body of .lifeinsurance":".lifeinsurance is sponsored by American Council of Life Insurers.","name the sponsoring body of .ci":".ci is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI).","which organization runs the domain .spa":".spa is sponsored by Asia Spa and Wellness Promotion Council Limited.","who sponsors the top-level domain .pt":".pt is sponsored by Associação DNS.PT.","name the sponsoring body of .forsale":".forsale is sponsored by Dog Beach, LLC.","which organization runs the domain .art":".art is sponsored by UK Creative Ideas Limited.","name the sponsoring body of .estate":".estate is sponsored by Binky Moon, LLC.","who sponsors the top-level domain .рус":".рус is sponsored by Rusnames Limited.","which organization runs the domain .deloitte":".deloitte is sponsored by Deloitte Touche Tohmatsu.","which organization runs the domain .rs":".rs is sponsored by Serbian National Internet Domain Registry (RNIDS).","who sponsors the top-level domain .sharp":".sharp is sponsored by Sharp Corporation.","who sponsors the top-level domain .la":".la is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications.","who sponsors the top-level domain .nikon":".nikon is sponsored by NIKON CORPORATION.","which organization runs the domain .book":".book is sponsored by Amazon Registry Services, Inc..","who sponsors the top-level domain .commbank":".commbank is sponsored by COMMONWEALTH BANK OF AUSTRALIA.","name the sponsoring body of .tv":".tv is sponsored by Ministry of Transport, Energy, Communications and Innovations.","who sponsors the top-level domain .avianca":".avianca is sponsored by Not assigned.","name the sponsoring body of .kred":".kred is sponsored by KredTLD Pty Ltd.","name the sponsoring body of .za":".za is sponsored by ZA Domain Name Authority.","which organization runs the domain .discover":".discover is sponsored by Discover Financial Services.","who sponsors the top-level domain .mk":".mk is sponsored by Macedonian Academic Research Network Skopje.","which organization runs the domain .mv":".mv is sponsored by Dhivehi Raajjeyge Gulhun PLC.","who sponsors the top-level domain .hyatt":".hyatt is sponsored by Hyatt GTLD, L.L.C..","name the sponsoring body of .hockey":".hockey is sponsored by Binky Moon, LLC.","which organization runs the domain .map":".map is sponsored by Charleston Road Registry Inc..","name the sponsoring body of .itau":".itau is sponsored by Itau Unibanco Holding S.A..","who sponsors the top-level domain .star":".star is sponsored by Star India Private Limited.","who sponsors the top-level domain .honeywell":".honeywell is sponsored by Not assigned.","name the sponsoring body of ‏.إختبار‎":"‏.إختبار‎ is sponsored by Not assigned.","name the sponsoring body of .fire":".fire is sponsored by Amazon Registry Services, Inc..","name the sponsoring body of .furniture":".furniture is sponsored by Binky Moon, LLC.","which organization runs the domain .clubmed":".clubmed is sponsored by Club Méditerranée S.A..","which organization runs the domain .iwc":".iwc is sponsored by Not assigned.","which organization runs the domain .coop":".coop is sponsored by DotCooperation LLC.","which organization runs the domain .tab":".tab is sponsored by Tabcorp Holdings Limited.","who sponsors the top-level domain .education":".education is sponsored by Binky Moon, LLC.","name the sponsoring body of .lacaixa":".lacaixa is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\".","which organization runs the domain .ryukyu":".ryukyu is sponsored by BRregistry, Inc..","which organization runs the domain .bauhaus":".bauhaus is sponsored by Werkhaus GmbH.","name the sponsoring body of .plus":".plus is sponsored by Binky Moon, LLC.","name the sponsoring body of .forum":".forum is sponsored by Fegistry, LLC.","who sponsors the top-level domain .kg":".kg is sponsored by AsiaInfo Telecommunication Enterprise.","which organization runs the domain .studio":".studio is sponsored by Dog Beach, LLC.","who sponsors the top-level domain .family":".family is sponsored by Dog Beach, LLC.","name the sponsoring body of .wanggou":".wanggou is sponsored by Amazon Registry Services, Inc..","who sponsors the top-level domain .repair":".repair is sponsored by Binky Moon, LLC.","name the sponsoring body of .mx":".mx is sponsored by NIC-Mexico ITESM - Campus Monterrey.","who sponsors the top-level domain .tw":".tw is sponsored by Taiwan Network Information Center (TWNIC).","which organization runs the domain .us":".us is sponsored by Registry Services, LLC.","name the sponsoring body of .voyage":".voyage is sponsored by Binky Moon, LLC.","name the sponsoring body of .diet":".diet is sponsored by XYZ.COM LLC.","who sponsors the top-level domain .goog":".goog is sponsored by Charleston Road Registry Inc..","name the sponsoring body of .परीक्षा":".परीक्षा is sponsored by Not assigned.","who sponsors the top-level domain .bugatti":".bugatti is sponsored by Not assigned.","who sponsors the top-level domain .su":".su is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS).","which organization runs the domain .boots":".boots is sponsored by Not assigned.","name the sponsoring body of .kiwi":".kiwi is sponsored by DOT KIWI LIMITED.","name the sponsoring body of .sale":".sale is sponsored by Dog Beach, LLC.","who sponsors the top-level domain .mtr":".mtr is sponsored by MTR Corporation Limited.","who sponsors the top-level domain .rip":".rip is sponsored by Dog Beach, LLC.","which organization runs the domain .toyota":".toyota is sponsored by TOYOTA MOTOR CORPORATION.","which organization runs the domain .cal":".cal is sponsored by Charleston Road Registry Inc..","name the sponsoring body of .yt":".yt is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.).","name the sponsoring body of ‏.الاردن‎":"‏.الاردن‎ is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE).","who sponsors the top-level domain .sport":".sport is sponsored by SportAccord.","name the sponsoring body of .arab":".arab is sponsored by League of Arab States.","name the sponsoring body of .guru":".guru is sponsored by Binky Moon, LLC.","which organization runs the domain .rwe":".rwe is sponsored by RWE AG.","name the sponsoring body of .hgtv":".hgtv is sponsored by Not assigned.","who sponsors the top-level domain .supply":".supply is sponsored by Binky Moon, LLC.","name the sponsoring body of .poker":".poker is sponsored by Identity Digital Limited.","which organization runs the domain .fujixerox":".fujixerox is sponsored by Not assigned.","which organization runs the domain .yodobashi":".yodobashi is sponsored by YODOBASHI CAMERA CO.,LTD..","which organization runs the domain .photography":".photography is sponsored by Binky Moon, LLC."}}},
{"id":"n-00677578","guard":[["has","xyz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .xyz":".xyz is sponsored by XYZ.COM LLC."}}},
{"id":"n-08bedc26","guard":[["has","sv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .sv":".sv is sponsored by SVNet."}}},
{"id":"n-0b8fa0d9","guard":[["has","ci"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .ci":".ci is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI)."}}},
{"id":"n-0bc4ea2a","guard":[["has","coop"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .coop":".coop is sponsored by DotCooperation LLC."}}},
{"id":"n-0f675698","guard":[["has","art"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .art":".art is sponsored by UK Creative Ideas Limited."}}},
{"id":"n-0fe1dd13","guard":[["has","map"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .map":".map is sponsored by Charleston Road Registry Inc.."}}},
{"id":"n-134888b5","guard":[["has","discover"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .discover":".discover is sponsored by Discover Financial Services."}}},
{"id":"n-1555aa72","guard":[["has","рус"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .рус":".рус is sponsored by Rusnames Limited."}}},
{"id":"n-164c636e","guard":[["has","امارات"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain ‏.امارات‎":"‏.امارات‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."}}},
{"id":"n-176ef2d9","guard":[["has","express"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .express":".express is sponsored by Binky Moon, LLC."}}},
{"id":"n-187a18c4","guard":[["has","hockey"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .hockey":".hockey is sponsored by Binky Moon, LLC."}}},
{"id":"n-1f68bc43","guard":[["has","repair"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .repair":".repair is sponsored by Binky Moon, LLC."}}},
{"id":"n-20af41e7","guard":[["has","wanggou"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .wanggou":".wanggou is sponsored by Amazon Registry Services, Inc.."}}},
{"id":"n-21b39c38","guard":[["has","marriott"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .marriott":".marriott is sponsored by Marriott Worldwide Corporation."}}},
{"id":"n-22e097cc","guard":[["has","estate"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .estate":".estate is sponsored by Binky Moon, LLC."}}},
{"id":"n-283c97ee","guard":[["has","hospital"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .hospital":".hospital is sponsored by Binky Moon, LLC."}}},
{"id":"n-2ae69ce4","guard":[["has","itau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .itau":".itau is sponsored by Itau Unibanco Holding S.A.."}}},
{"id":"n-2b52e260","guard":[["has","ye"],["has","who"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .ye":".ye is sponsored by TeleYemen."}}},
{"id":"n-2bf653e6","guard":[["has","tab"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .tab":".tab is sponsored by Tabcorp Holdings Limited."}}},
{"id":"n-2db16a6c","guard":[["has","photography"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .photography":".photography is sponsored by Binky Moon, LLC."}}},
{"id":"n-2f7387f1","guard":[["has","hyatt"],["has","who"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .hyatt":".hyatt is sponsored by Hyatt GTLD, L.L.C.."}}},
{"id":"n-30687fe7","guard":[["has","theater"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .theater":".theater is sponsored by Binky Moon, LLC."}}},
{"id":"n-314ee40e","guard":[["has","diet"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .diet":".diet is sponsored by XYZ.COM LLC."}}},
{"id":"n-32bdae8b","guard":[["has","yodobashi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .yodobashi":".yodobashi is sponsored by YODOBASHI CAMERA CO.,LTD.."}}},
{"id":"n-3ac1d55f","guard":[["has","computer"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .computer":".computer is sponsored by Binky Moon, LLC."}}},
{"id":"n-3d383791","guard":[["has","surf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .surf":".surf is sponsored by Registry Services, LLC."}}},
{"id":"n-3e5af22b","guard":[["has","voyage"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .voyage":".voyage is sponsored by Binky Moon, LLC."}}},
{"id":"n-4156cf3b","guard":[["has","star"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .star":".star is sponsored by Star India Private Limited."}}},
{"id":"n-42355289","guard":[["has","toyota"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .toyota":".toyota is sponsored by TOYOTA MOTOR CORPORATION."}}},
{"id":"n-4815e2b5","guard":[["has","fire"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .fire":".fire is sponsored by Amazon Registry Services, Inc.."}}},
{"id":"n-48d7fe0d","guard":[["has","ryukyu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .ryukyu":".ryukyu is sponsored by BRregistry, Inc.."}}},
{"id":"n-4a995f62","guard":[["has","juegos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .juegos":".juegos is sponsored by Dog Beach, LLC."}}},
{"id":"n-4ae31ce6","guard":[["has","परकष"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .परीक्षा":".परीक्षा is sponsored by Not assigned."}}},
{"id":"n-4f3baf14","guard":[["has","poker"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .poker":".poker is sponsored by Identity Digital Limited."}}},
{"id":"n-54d3641f","guard":[["has","goog"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .goog":".goog is sponsored by Charleston Road Registry Inc.."}}},
{"id":"n-55d2cc69","guard":[["has","भरत"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .भारत":".भारत is sponsored by National Internet Exchange of India."}}},
{"id":"n-57ad6ed8","guard":[["has","nikon"],["has","who"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .nikon":".nikon is sponsored by NIKON CORPORATION."}}},
{"id":"n-585b5b5f","guard":[["has","plumbing"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .plumbing":".plumbing is sponsored by Binky Moon, LLC."}}},
{"id":"n-5c551848","guard":[["has","iwc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .iwc":".iwc is sponsored by Not assigned."}}},
{"id":"n-5e29a38e","guard":[["has","arab"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .arab":".arab is sponsored by League of Arab States."}}},
{"id":"n-5f88990e","guard":[["has","boots"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .boots":".boots is sponsored by Not assigned."}}},
{"id":"n-6843dd65","guard":[["has","fujixerox"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .fujixerox":".fujixerox is sponsored by Not assigned."}}},
{"id":"n-6e156bf9","guard":[["has","rip"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .rip":".rip is sponsored by Dog Beach, LLC."}}},
{"id":"n-6fe14745","guard":[["has","lacaixa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .lacaixa":".lacaixa is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."}}},
{"id":"n-745c2b38","guard":[["has","forum"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .forum":".forum is sponsored by Fegistry, LLC."}}},
{"id":"n-7605349d","guard":[["has","rs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .rs":".rs is sponsored by Serbian National Internet Domain Registry (RNIDS)."}}},
{"id":"n-76ec3a1f","guard":[["has","bar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .bar":".bar is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable."}}},
{"id":"n-790ee98f","guard":[["has","guru"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .guru":".guru is sponsored by Binky Moon, LLC."}}},
{"id":"n-797998dc","guard":[["has","forsale"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .forsale":".forsale is sponsored by Dog Beach, LLC."}}},
{"id":"n-7c8c87b0","guard":[["has","furniture"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .furniture":".furniture is sponsored by Binky Moon, LLC."}}},
{"id":"n-7cccb7bb","guard":[["has","avianca"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .avianca":".avianca is sponsored by Not assigned."}}},
{"id":"n-81319bb1","guard":[["has","kred"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .kred":".kred is sponsored by KredTLD Pty Ltd."}}},
{"id":"n-83eef493","guard":[["has","rwe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .rwe":".rwe is sponsored by RWE AG."}}},
{"id":"n-8647c231","guard":[["has","pamperedchef"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .pamperedchef":".pamperedchef is sponsored by Not assigned."}}},
{"id":"n-89293bc6","guard":[["has","mv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .mv":".mv is sponsored by Dhivehi Raajjeyge Gulhun PLC."}}},
{"id":"n-8aefad5d","guard":[["has","lifeinsurance"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .lifeinsurance":".lifeinsurance is sponsored by American Council of Life Insurers."}}},
{"id":"n-8f3d35ca","guard":[["has","commbank"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .commbank":".commbank is sponsored by COMMONWEALTH BANK OF AUSTRALIA."}}},
{"id":"n-90c0e61b","guard":[["has","sale"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .sale":".sale is sponsored by Dog Beach, LLC."}}},
{"id":"n-93888476","guard":[["has","bugatti"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .bugatti":".bugatti is sponsored by Not assigned."}}},
{"id":"n-973034b7","guard":[["has","ls"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .ls":".ls is sponsored by Lesotho Network Information Centre Proprietary (LSNIC)."}}},
{"id":"n-a0493cc7","guard":[["has","mtr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .mtr":".mtr is sponsored by MTR Corporation Limited."}}},
{"id":"n-a28513dd","guard":[["has","family"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .family":".family is sponsored by Dog Beach, LLC."}}},
{"id":"n-a29b00bb","guard":[["has","cal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .cal":".cal is sponsored by Charleston Road Registry Inc.."}}},
{"id":"n-a8dcc56a","guard":[["has","deloitte"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .deloitte":".deloitte is sponsored by Deloitte Touche Tohmatsu."}}},
{"id":"n-a9e1bd34","guard":[["has","bauhaus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .bauhaus":".bauhaus is sponsored by Werkhaus GmbH."}}},
{"id":"n-b0dc5e8d","guard":[["has","мон"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .мон":".мон is sponsored by Datacom Co.,Ltd."}}},
{"id":"n-b1d4e58d","guard":[["has","honeywell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .honeywell":".honeywell is sponsored by Not assigned."}}},
{"id":"n-b4bfb2df","guard":[["has","ee"],["has","who"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .ee":".ee is sponsored by Eesti Interneti Sihtasutus (EIS)."}}},
{"id":"n-b52a7e9f","guard":[["has","الاردن"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of ‏.الاردن‎":"‏.الاردن‎ is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE)."}}},
{"id":"n-b5a5b7bf","guard":[["has","asda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .asda":".asda is sponsored by Asda Stores Limited."}}},
{"id":"n-b6026b7d","guard":[["has","kiwi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .kiwi":".kiwi is sponsored by DOT KIWI LIMITED."}}},
{"id":"n-b8bf3997","guard":[["has","education"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .education":".education is sponsored by Binky Moon, LLC."}}},
{"id":"n-ba42cfeb","guard":[["has","tw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .tw":".tw is sponsored by Taiwan Network Information Center (TWNIC)."}}},
{"id":"n-bc84d1e9","guard":[["has","kg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .kg":".kg is sponsored by AsiaInfo Telecommunication Enterprise."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the sponsoring body of .भारत","expect":{"contains":["National Internet Exchange of India"],"notRefusal":true}},{"q":"who sponsors the top-level domain .ee","expect":{"contains":["Eesti Interneti Sihtasutus (EIS)"],"notRefusal":true}},{"q":"who sponsors the top-level domain .tiaa","expect":{"contains":["Teachers Insurance and Annuity Association of America"],"notRefusal":true}},{"q":"who sponsors the top-level domain ‏.امارات‎","expect":{"contains":["Telecommunications and Digital Government Regulatory Authority (TDRA)"],"notRefusal":true}},{"q":"who sponsors the top-level domain .seat","expect":{"contains":["SEAT, S.A. (Sociedad Unipersonal)"],"notRefusal":true}},{"q":"which organization runs the domain .pamperedchef","expect":{"contains":["Not assigned"],"notRefusal":true}},{"q":"who sponsors the top-level domain .asda","expect":{"contains":["Asda Stores Limited"],"notRefusal":true}},{"q":"name the sponsoring body of .marriott","expect":{"contains":["Marriott Worldwide Corporation"],"notRefusal":true}},{"q":"name the sponsoring body of .express","expect":{"contains":["Binky Moon, LLC"],"notRefusal":true}},{"q":"who sponsors the top-level domain .xyz","expect":{"contains":["XYZ.COM LLC"],"notRefusal":true}},{"q":"name the sponsoring body of .bar","expect":{"contains":["Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable"],"notRefusal":true}},{"q":"which organization runs the domain .surf","expect":{"contains":["Registry Services, LLC"],"notRefusal":true}},{"q":"who sponsors the top-level domain .ye","expect":{"contains":["TeleYemen"],"notRefusal":true}},{"q":"who sponsors the top-level domain .sas","expect":{"contains":["Research IP LLC"],"notRefusal":true}},{"q":"which organization runs the domain .ls","expect":{"contains":["Lesotho Network Information Centre Proprietary (LSNIC)"],"notRefusal":true}},{"q":"name the sponsoring body of .plumbing","expect":{"contains":["Binky Moon, LLC"],"notRefusal":true}},{"q":"which organization runs the domain .study","expect":{"contains":["Registry Services, LLC"],"notRefusal":true}},{"q":"which organization runs the domain .sv","expect":{"contains":["SVNet"],"notRefusal":true}},{"q":"which organization runs the domain .hospital","expect":{"contains":["Binky Moon, LLC"],"notRefusal":true}},{"q":"which organization runs the domain .мон","expect":{"contains":["Datacom Co.,Ltd"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
