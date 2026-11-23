// fr-tidytuesday-country-subdivision-339646-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"fr-tidytuesday-country-subdivision-339646-neo-g10","class":"fr-tidytuesday-country-subdivision-339646","generation":10,"lane":"neo","grownFrom":["what is the type of Arunāchal Pradesh","tell me the type of Šumadijski okrug","name the type of Druskininkai","what is the type of Tálknafjarðarhreppur","tell me the type of South Dakota","name the type of Al Qaşīm","what is the type of Gopalganj","tell me the type of Limpopo","name the type of Gazipur","what is the type of Mokronog-Trebelno","tell me the type of Tillabéri","name the type of Cabo Delgado","what is the type of Díli","tell me the type of Ra’s al Khaymah","name the type of Suphan Buri","what is the type of Aragua","tell me the type of Mauren","name the type of Tougué","what is the type of Pordenone","tell me the type of Iloilo"],"version":1});

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
knowLoad([{"id":"crypto-tickers","columns":["crypto ticker"],"n":11071,"cols":[{"f":"0A2A|14|2M|151|2T|1A|2A|2B|3L|2C|2G|2PX|2RT|2ST|2T|2VE|2Z|1BA|2BC|2C|3C|3D|2EL|3Y|2IC|2J|2L|2O|3ND|2R|2T|2X|2Y|3SS|1C|23|2A|3T|4O|2CEL|3N|2D|3C|2E|3N|3S|3T|4H|2H|3C|2ID|2K|2M|2N|2OIN|2P|3T|2Q|2RE|3IA|2S|2T|3A|3IN|3N|2U|2X|3T|2YC|1D|2A|3B|3I|3O|3PAD|3T|3X|2B|2C|3O|2D|3AMS|3Y|2EL|2F|2H|2I|2K|2L|2M|2N|3T|2O|3GE|3N|2P|2R|3X|2S|2T|2UX|2VT|2X|3X|2Z|1E|2C|2G|3GS|3IS|2LIN|2N|3S|3T|2ON|2R|3GO|3M|3O|2S|2T|3H|4C|2UR|2VO|3UM|1FB|2C|3T|2EN|2FC|2G|2IN|3T|2K|2NTY|2O|2P|2RO|4X|2TT|2X|2YON|1G|28|2A|3TA|2B|2ET|3UR|2F|2I|3V1|3X|2LA|3D|2M|2N|2O|3N|3V|2PC|2RO|3S|2S|2T|2V|3C|3E|2X|1HOO|2T|1I|2AI|3T|2B|3B|3K|2C|3O|4DE|4RE|2D|3I|3OC|4G|5E|3T|3US|2E|3N|2G|2I|2LINK|2M|3BOT|3EE|3S|3X|2N|3N|3U|2ON|4E|3T|3Z|2PAD|3E|4PE|3G|3IN|2R|3E|3I|3T|3X|2S|3HIB|2T|3ECH|4K|3K|3N|3RA|3T|2US|2X|1JNA|1K12|2A|2I|3TA|5X|2N|3C|2RO|2T|3IO|1LA|2BEDO|3T|2C|3E|3H|4E|3X|2D|3IN|2EPH|3X|2F|2G|3B|3O|2H|2I|3AS|3C|4E|3EN|3F|3NK|3S|3T|4A|3X|2KI|2LBI|3EY|3IN|2M|3E|2N|2OHA|3T|2P|3A|4CA|3H|4A|5C|4R|3INE|3S|2T|3A|3B|3COM|3D|3MAN|2U|3SD|3X|2V|3A|2WAYS|2X|2Y|1M|2A|3L|3PT|3TEN|2B|3ER|3T|2DC|3G|2E|2F|2G|2IO|3S|2KT|2LT|2M|3O|2N|2O|3GUS|3N|3S|2P|3L|2S|2T|2U|2V|2X|2Y|2ZE|1NA|3L|4OS|2B|2C|3P|3T|2D|3C|3X|3Y|2GEL|3L|4E|3O|2I|3M|4A|2J|3I|2K|3R|2ML|2N|2ON|2RX|2S|3R|2T|3C|3E|4X|3I|4S|3S|2US|2V|2W|2Y|1OG|2K|2P|2S|1P|2AD|2C|3G|2E|3D|3X|2FC|2H|2I|33|3NG|3S|3X|2L|2M|2N|2OD|3LLO|2P|3C|3LE|2RIL|3S|2S|2T|3OGE|2U|2W|2X|3P|3T|2Y|3S|2Z|1QT|3IS|2U|3A|4C|4P|4RI|1R|2A|3TA|3W|2B|3I|4T|3S|3T|3UZ|2C|3A|4DE|4NE|4S|3H|4A|4L|3O|4NA|3T|3X|2DR|3X|2E|3A|3N|4A|3PA|3S|2G|3O|4N|3US|2I|310|3A|420|3X|2K|3EN|4R|3I|3M|3N|2M|3A|3OR|3R|3S|2NA|3M|3O|3X|4M|2O|3N|3R|2PA|4C|2Q|2R|3O|3R|2SL|2T|3C|3E|4M|4ON|4Q|4X|3F|3G|3H|3I|4I|3L|3M|3P|3R|3T|3Y|2V|2W|2X|2Y|1S|2A|3FE2|3N|3P|2C|2D|3EX|2EED|2G|3C|2H|2IA|3MI|2K|3O|2M|2N|3T|2P|3C|3O|2QT|2R|2S|3A|4RA|3T|2T|3A|3O|4N|3R|4A|5L|4O|5C|3X|2UNA|2VA|2W|2Y|1T|2A|2B|2C|3C|2D|2ECH|3M|2F|3I|3S|2H|3E|2ID|2K|3N|2L|3AS|3X|2M|3A|3C|3I|3OS|2N|3T|2OLO|3M|3N|3R|3Z|2P|3AY|2R|3I|3NO|2S|2T|3R|2X|1U|2A|2C|3O|2DC|3F|3IO|3T|3X|2K|2N|3IT|2PC|2R|3A|3O|4RA|4S|3S|3UM|3Y|2SCM|3D|4C|2T|3O|4N|3UMN|1V|2A|3I|3L|4ON|3O|3T|4AR|4LY|3V|3X|2DO|2E|2G|2H|2I|3NOC|3VE|2L|2ME|2N|2O|2R|2S|2T|3M|2XL|3T|1WAX|2C|2M|2NEX|2O|3RK|2R|2S|2T|2X|1X|2C|2E|3L|2GT|2IAL|4V3|3OM|3S|4T|2L|3INU|2N|3T|2PR|2R|2S|3V1|2T|2YS|1YA|1Z|2A|3RT|2BI|2ERO|2IT|2R|2U|3KI|3M|2Y|0B1P|120|21|26|2G|2M|2X|13|191|1A|2AS|2BI|3L|3Y|4FB|4TK|4X|2C|3K|3OIN|4N|2D|3GER|2FC|2G|3S|2I|2JU|2K|3AC|3E|4D|3T|2L|3A|3D|3IN|3LZ|3PHA|3TO|2M|3A|3BOO|2N|3ANA|3C|4A|3D|4EX|3G|3K|3NER|3US|2O|3E|3S|2R|3A|3C|3K|3T|2S|3E|4AI|4D|3H|4C|4OS|3IC|4D|4S|3K|3T|2T|3H|3S|2X|3S|2Y|2ZED|1B|21|2ANK|2B|2C|3C|3G|3T|2DC|3T|2F|3T|2G|3C|2I|2K|2L|2N|2O|3S|2P|2R|2S|2T|3C|3F|1C|2A|3C|3P|3T|3U|2B|2COIN|2D|3N|3T|2EO|2F|2G|2H|3A|3C|3T|2I|3O|3TY|2L|2MC|41|2N|3A|3T|3X|2O|3IN|3Q|2P|3T|2R|3O|2S|2T|2UBE|3G|2V|3B|2X|2Y|2ZERO|1D|2AY|2B|2C|3C|2G|2ID|2L|2OG|3T|2P|3I|2R|2X|2Y|1EA|3CH|3I|3M|4MW|3N|4S|3ST|3T|2BE|2C|3H|3O|2D|2E|3P|3R|3T|4LE|4S|2FE|3I|3TM|3X|3Y|2G|2L|3A|3R|3T|2M|3D|2N|3D|4OG|3G|3JI|3T|3V1|3X|3ZI|2P|3E|3R|4O|2RN|3RY|2S|3A|3T|4C|2TA|3BOX|3F|3H|4ER|3R|3S|3T|3U|2X|2Y|3OND|2Z|3OGE|1F|2C|3H|2DT|2EX|2G|2HT|2I|3C|2LOKI|3Y|2T|3C|2X|1GB|3P|2C|2G|2LD|2ONE|2PT|2S|2VT|1HAO|3T|3X|2BD|2C|2IG|3RE|3VE|2O|2P|3C|1IAO|2B|3I|3L|3O|2C|3O|3S|2D|3AO|3COM|3EN|3I|3P|3R|3Z|2FI|4F|2G|3HAN|3SB|3UP|2H|3U|2IS|2KI|2LL|2M|2ND|3EM|3GO|3O|3S|3TEX|3U|2O|3B|3C|3FI|3P|3S|3T|2P|3C|3X|2R|3B|3D|2S|3KIT|3T|2T|316|3AIR|3B|3C|4AR|5T|4CA|4I|4M|4NY|3F|3G|3HER|3L|3M|3N|4EW|3O|4K|4RB|3RA|4UE|3S|4D|4Z|3T|4O|3USD|3X|3Z|2UT|2VE|2X|3B|3I|2ZA|3Z|1J|2K|1KBT|2C|2ING|2K|2N|2PT|2R|3W|2S|2T|2X|1LA|3CK|3DE|3NK|3S|4T|3ZE|5X|4R|2C|3T|2D|2ENDR|3RF|3S|2F|2HC|2I|3D|3N|4K|4U|3TZ|5P|2K|3C|3D|3S|2N|3M|2OB|3C|4K|5N|5S|4M|4X|3K|3ODY|4MT|3X|2P|2RY|2S|3T|2T|3C|3G|3V|2U|3E|4M|4S|3I|3R|4T|3T|2V|33|2WA|2X|3M|2Y|2Z|3D|3E|1M|2AGA|3RS|2BO|2C|2DA|2E|3X|2F|2G|2H|2I|3C|2K|2ON|2P|2T|2W|2X|3T|3X|1NA|3NA|2B|3CAT|4H|3DOG|3H|3P|3TC|3X|2C|2D|2F|2IX|2K|2N|2P|3L|2R|3TX|2S|3D|3OLD|3X|2T|3E|3N|3Y|2U|2X|1OA|3I|3RD|3T|2BA|4I|3C|3O|3S|3T|2C|2DA|4V2|3EN|3HI|3O|3YP|2E|2G|3EY|2JAK|3I|2K|3I|3U|2LD|3I|3T|4T|2MB|4C|4M|3E|42|4OW|4S|3K|2N|3A|3D|4LY|3E|4S|3IX|3K|4H|3O|3TE|3US|2O|3B|3FI|3K|3M|3NS|3P|3ST|5O|3T|2R|3A|3ED|3G|3ING|3K|3UTO|2S|3E|3ON|5C|3S|3T|3U|2T|3C|3S|3TO|3X|2U|3NCE|3TS|2W|3E|2X|3ETH|3T|3X|3Y|2YS|2ZO|1P|2AD|3Y|2D|2EPEF|3T|2INKY|2L|3C|2N|2RIVA|3O|2S|2T|3C|2X|1Q|2C|2QQ|2T|3X|1R|234P|2ACE|3IN|3NA|4D|3T|4T|3Z|2C|3P|3T|2D|3D|3G|2EE|4D|3PE|3TT|5A|3W|2G|3E|3X|2I|3A|3C|4K|5S|3DGE|3GHT|3K|3SE|3T|4TO|3UM|3X|2K|3L|2MV|2N|3K|3X|2O|3CK|3GG|3NZ|2RR|2T|3R|3X|2UNE|3SH|3V|2WL|2X|2Y|3LL|2Z|3E|3N|1S|2AFE|4U|2B|2C|3H|3M|3PAD|5Y|3S|3V|2E|3ND|2FM|2G|3G|3S|2HARE|3IB|2I|2KT|2L|2OL|3V|2P|3M|3T|2R|2SB|2T|3AR|3C|3K|3N|3S|3Y|2V|2W|3AP|2X|2Y|3S|1T|21|22|2A|3D|3F|3MA|2B|3L|3S|2C|32|3A|4S|4T|3B|4R|3C|3D|3E|4X|3F|3GO|3H|4D|3INU|4X|3K|3L|3M|4T|3N|3P|4AY|4X|3R|4ED|4Y|3S|4T|3T|3US|3V|4B|3Z|2D|3X|2E|3X|2F|3A|2G|2H|2K|2L|3C|2M|3G|3I|3K|2NT|4V2|3YX|2O|3P|2P|3L|2Q|2R|3FLY|3L|3M|3N|3S|4T|2S|3C|3E|3G|2T|3F|3OLD|3R|3Y|2U|2V|2W|2X|3C|2Y|3C|2Z|3C|3N|1U|2B|3O|3U|2C|3K|4S|2D|3DHA|3G|2FF|4ET|2GG|3S|2ILD|2K|2LL|4C|4S|5H|2MN|3P|2N|3DL|3I|3NY|2RGER|3N|4NY|4S|4Z|3P|3RRD|2SD|4C|3Y|2T|2X|2Y|3I|2ZZ|1V3A|2C|2M|2ND|2O|2T|1WB|2F|2J|2K|2N|2O|2S|2T|32|2X|1X|2A|2BT|2C|2F|2H|2K|2MI|2R|2T|3B|2X|2Y|1YC|2G|2TE|4S|3HER|3S|3Z|1Z|2ENIQ|2KY|2L|2NT|2R|3X|2X|2Z|3ONE|0C2|20|25|2H6|2X|13|198|1A|2AVE|2B|3O|3S|2CH|4E|3TUS|2DC|3INU|3N|3X|2F|2G|3A|2H|2I|3D|3R|3Z|2KE|4W|2L|3C|3I|3L|3O|2M|3C|3EL|3LY|3P|2N|3CER|3D|4Y|3N|3TI|4O|3YA|2PD|3O|3P|3S|3T|3V|3Y|2R|3AT|3BO|5N|3D|4S|3E|4S|3O|3PE|3R|4OT|3T|2S|3H|4T|3INU|4O|3PER|3T|4LE|2T|3AI|3BOY|3C|4EO|4H|3E|3HAT|3MAN|3O|3PAY|3S|3T|3WIF|3X|3Z|2U|2VA|4DA|3E|3O|2W|3CEO|1B|2ABY|3NK|3T|2C|2D|3C|3G|2E|3T|4H|2FT|2G|2IXP|2K|2M|2NT|2OT|2P|2RL|3T|2S|3L|3N|2T|2U|3CKS|3K|2X|2Y|1C|210|2A|3KE|3R|3SH|2C|3X|2D|2E|2GDS|2H|3G|2I|3N|2L|2N|2O|3IN|3MM|4P|3S|2P|2RB|2T|3N|2V2|2X|3C|3X|1DAI|2EX|2L|2N|2OGE|2PT|2RX|2T|2X|2Y|1EDEX|2EK|2FS|2JI|2L|3EB|3L|3O|3R|3T|2M|2N|3NZ|3T|4RA|3X|2RE|4S|2SC|2T|3H|3I|3US|2UR|2X|1F|2C|2D|2F|2G|2I|2L365|3ASH|3O|2T|3Y|2X|3Q|3T|1GA|2G|2L|3D|2O|2PT|2S|2T|2U|1HA|3D|4S|3IN|3L|3MP|5Z|3N|4CE|4GE|3O|3PZ|3RM|4S|4T|3SH|3T|2B|3R|2C|2D|2ECK|5R|3DDA|3EL|4MS|4SE|3Q|3R|4RY|3SS|3X|2FN|3T|3U|3X|2H|2I|3CA|4KS|3EF|3HUA|3I|3LD|4I|4L|3NU|3P|4S|3RP|2K|3N|2LT|2MB|3PZ|2N|3G|2O|3KE|3NK|5Y|3OF|3PPY|3W|3Y|2P|2R|3P|2S|3B|2T|2UB|3CHU|4K|2VF|2W|2X|2Y|2Z|1IC|2F|2M|2N|3D|3NI|3U|3X|2OTX|2PHC|2R|3C|4LE|4US|3US|2TI|3Y|2V|3IT|2X|3100|1J|2C|2R|2T|1KB|3TC|2C|2EK|3TH|2P|2T|2USD|1L|2A|3M|3SS|3Y|2B|3R|2CT|2D|3X|2EAR|3G|3O|3V|2FI|2H|2ICK|3FF|3MB|3N|4K|4T|3PS|3Q|3ST|2M|3RS|2N|3Y|2O|3AK|3RE|3UD|4T|2PX|2R|3TY|2S|2T|2U|3B|3D|2V|3A|3X|2X|2Y|1MA|2C|3C|3T|3X|2DX|2ERGE|2FI|2IT|2K|3R|2L|2M|2N|2OS|2P|3CO|2Q|2S|3N|2T|3C|2Z|1NAB|3ME|2B|3C|2C|3L|3T|2D|3L|2ETA|2F|3I|2G|2HT|2L|2MT|2N|3S|2O|2RG|2S|2T|3M|3R|2US|2X|2YD|3T|3X|1O|22|2AL|2B|3E|2C|3K|3O|2DAI|3EG|4O|4X|3I|3Y|2E|2FI|4X|2G|3E|4N|3I|3S|2I|3NBT|4G|4SL|4YE|2KE|2L|3A|3L|4AR|4E|4G|3R|3T|3X|2M|3B|4O|3E|3FI|3M|3P|4D|3T|2NE|3G|3I|3J|3K|3S|3V|3X|2OHA|3K|3L|3P|2PE|3I|4UM|3S|2Q|2R|3AL|3E|4G|4UM|3GI|5B|3N|3X|2S|3HI|3M|4IC|3P|3S|3T|3X|2T|3I|2U|3NOS|3P|2V|3A|4L|3ER|4X|3IR|3N|2W|3RIE|2X|2Y|2ZP|1P|2AD|3N|3Y|2C|3OIN|2D|2ET|3X|2H|2I|3GGY|2L|3O|2N|2O|3O|4L|3S|2R|3OP|3X|2S|2T|2U|2X|2Y|1QST|2T|1R|28|2A|3B|3CER|4K|3DLE|3FT|3IG|3MER|3VE|2B|3N|2C|2D|3C|3N|4C|3S|3T|4S|2E|38|3A|4L|4M|3D|4I|5T|4O|3ED|3MAT|3O|3P|4E|3S|3V|4A|2F|3I|2GO|2H|3T|2I3X|3ME|2L|2M|3S|2NCHY|3K|2O|3AT|3B|3CO|3GE|3ID|3N|4A|4K|3WD|4N|3X|2P|3S|3T|2S|3P|2T|3B|3M|3S|2U|3X|2V|3USD|3Y|2W|3D|3NY|2X|2YN|3P|4T|3STL|1S|2AC|3I|2C|2EN|2H|2IX|2M|3IC|2NO|3P|2OV|2P|3N|3R|2Q|2R|2S|2TC|3L|3R|2USHI|2WAP|2X|1T|2AG|3SK|2C|3N|2E|2F|2G|2I|3C|2K|3N|2L|3S|3X|2N|2O|2P|3L|3T|2R|3T|2S|3I|2T|2W|2X|3C|2Y|1UAN|2BE|4B|2CK|2DOS|2E|3X|2LO|3T|2MINU|2NI|2RA|3E|3I|4O|3RY|2SD|4C|4T|3T|2T|3E|2Z|1V|2A|3G|3ULT|2C|3C|3OIN|2G|2IP|2NC|3G|3T|2P|3T|2R|2S|3HOT|2T|3C|3X|2X|3CRV|3FXS|1W|2AR|2BTC|2D|2EB|3X|2IF|3S|2N|2R|2S|2T|2V|2X|3T|1X|2A|2C|3ELL|2G|2O|2P|3AD|2T|1YBA|3ER|5C|5D|3ONK|3R|2C|3E|3LE|4UB|3ON|2DER|2FI|2G|2L|2MT|2OP|2P|2RS|3US|2S|2T|1ZC|2F|2GOAT|2OL|2R|3X|2USD|2Z|0D11|12O|2T|13D|14RK|1AB|2C|3ASH|4T|3C|42|3H|3KIE|3S|3XI|2D|3A|3I|2F|3I|3T|2G|3O|3T|2I|3LY|5S|3MO|3N|3Q|3SY|2L|3I|2M|3EX|3O|2N|3A|3K|2O|31|3ACT|3B|3P|3SOL|3VC|3X|2PP|4SY|4T|4X|3S|2R|3A|3B|3C|3E|3ICO|4K|3K|4EN|3T|3X|2S|3C|3H|4D|4G|2T|3A|3P|3X|2V|3E|3IS|3P|2W|3G|4S|3N|2X|3X|2Y|3TA|1B|2A|2C|2D|2EAR|3T|2I|3C|3X|2L|2OE|3X|2R|2TC|3N|2UND|3Y|2X|2Y|2Z|1C|2A|3R|4D|3SH|3U|2B|2C|3T|2HF|2IP|2K|2LOUD|2N|3T|4R|2OIN|2R|3E|3N|2S|2T|3O|2X|2Y|1D|2AM|3O|2D|3D|2F|2IM|2K|2L|2N|2OS|2R|3ST|3T|2S|2X|1EA|3I|3L|2B|3ASE|3T|2C|3HAT|3I|3L|3ODE|2DE|2ED|3M|3P|4G|3R|3X|3Z|2FC|3I|45|4DO|4L|4T|3LA|4CT|4Y|3T|3X|3Y|2G|3A|3EN|5R|3O|4V|51|2HUB|2I|2K|2L|3FI|3OT|3TA|5C|2M|3IR|3OS|2NT|2OD|3R|2P|3O|3TH|2Q|2RC|3I|3O|3P|2S|3I|3O|3U|2TF|3H|2UR|3S|2V|3O|3T|3VE|3X|2X|3A|3E|3G|3IO|3M|3NET|3O|3T|4F|4V1|1F|2A|2B|3T|2C|2D|2G|3L|2H|2I|3AT|3O|3S|2L|2ND|4R|2P|2SG|2T|2X|2Y|3N|1G|2B|2C|3L|2D|3C|2H|2I|2LD|3N|2M|3E|3S|3T|3V|2N|3X|2OLD|3RE|2P|3T|2TX|2VC|2X|1HLT|2N|2P|2R|2S|2T|2V|2X|1IA|3BLO|3M|4ND|2BBLE|2C|3E|4M|2D|2E|3M|3SEL|2FI|3X|2G|3EX|3G|3I|4C|4F|3S|2KO|2LI|2M|3E|3O|2N|3ERO|3GER|4O|3O|3U|3W|2O|3NE|2P|3A|2S|3K|2T|2VA|3ER|3I|3O|3X|2W|2YAR|1JED|1K|2A|2C|2D|2EY|2KT|2S|2UMA|1LA|3NCE|2C|2ISK|2LR|2O|2PD|3T|2R|2T|3A|2X|3V|2Y|3COP|1MA|3IL|2C|3C|3H|2D|2G|2IND|2L|3G|2OD|3ON|2S|2T|3C|3R|2X|1N8|2A|2ET|2F|3LX|3T|2N|2O|3DE|3TES|2S|2T|3X|2VDA|2X|3C|2Y|1OBBY|3O|2C|3C|3K|3T|2D|3100|3I|3O|2E|2FI|2G|3A|4I|4LD|3B|3C|3E|420|4C|5O|4D|4GF|4P|4RA|4S|4TH|4X|4Y|3GY|3IRA|3MI|3O|3PAD|3RMY|3S|3Y|3Z|2JO|2KI|2LA|3LUR|3Z|2M|3E|3I|2N|3A|4LD|3G|3K|3S|3U|4T|2OH|3R|2PE|2R|3A|3K|4L|2S|3E|3HIB|2T|3C|3R|2UGH|2V|3I|2WS|1P|2AD|3Y|2DBC|2ET|3X|2I|3E|2LTR|2N|2P|2R|2S|2T|2X|2Y|1QQQ|1RA|3C|4E|4O|5O|3FTC|3GON|4Y|3M|3W|2B|2C|3T|2E|3AM|5S|3P|2F|2G|3N|2IFT|3NK|3P|3V|2KC|3T|2M|38|2OGGY|3NE|3P|4S|2P|3U|2S|2T|2XNE|2Z|1S|2B|2C|3P|3VR|2D|2FR|2G|2H|3ARE|3IB|2K|2LA|2R|3UN|2T|3R|2UN|2YNC|1T|21|2A|2B|2C|3T|2EM|3P|2G|2H|2N|2O|3P|3RO|2R|3C|2SLA|2X|1UA|3L|2B|3BZ|3I|2C|3ATO|3K|4D|4ER|2DE|2EL|3T|2G|3E|2KE|3O|2MMY|2N|3G|2O|3T|2SD|3K|3T|2X|2ZCE|1V|2C|2DX|2F|2G|2I|2P|3N|2RS|2S|2T|3C|2X|1WARS|2C|2EB|2T|2Z|1X|2A|2B|2C|3T|2D|2F|2G|3M|2H|2L|2N|2O|2R|2S|2T|1YC|2DX|2M|2N|3A|3EX|3MT|3O|2P|2ST|2T|1ZAR|2CC|2DD|2G|2I|2OO|0E21|2C|18|1A|2C|2G|3LE|3S|2I|2RN|3TH|2SYF|2T|2URIC|1B3|2A|3SE|2C|2EN|3T|2IT|2K|2OX|2S|3C|3T|2T|3C|2YT|2Z|1C|2A|3SH|2C|2D|2ELL|2G|2H|3O|3T|2LD|3IP|2O|3B|3C|4H|3FI|3IN|3M|3X|2P|2R|2S|2T|3E|2U|1DAT|2C|2DA|3IE|2E|3L|3N|3XA|2FI|2G|3E|4W|3T|2I|2LC|2N|3S|2OGE|2R|3C|2T|2U|3C|3M|3X|2X|1ER|2TH|1FBAI|2C|2FT|2I|3L|2K|2L|2X|1G|2AME|3S|3Z|2C|3C|2DC|2EM|2G|3C|3MAN|3P|3Y|2I|2LD|2O|3LD|2R|3N|2S|2T|2X|1HASH|2IVE|2RT|1IFI|2M|1JAC|2S|1KG|2N|2O|2S|2T|3A|1L|2A|3C|3D|3MA|3ND|2C|3ASH|2D|3A|2E|3C|3N|3S|3T|2F|3I|2G|2I|3C|3TE|3X|4IR|2K|2LA|3I|2M|3O|4N|3T|2ON|4GD|5T|2P|2S|2T|3C2|2U|2V|3N|2X|2Y|1M|2AID|3R|3X|2B|3ER|3R|2C|32|2D|2IGR|2L|2OJI|3N|3T|4I|2P|3C|3H|3IRE|3R|2RX|2T|2U|2V|2X|1NA|2C|3D|3N|3S|3X|2DCEX|2E|3DEX|2G|3T|2IGMA|2J|2K|2NO|2O|2Q|3AI|2RG|3X|2S|2T|3C|3ER|3R|4C|4P|4Y|3T|2U|2V|3ION|2X|1OC|2N|3C|2S|3C|3DAC|4T|3T|2TH|2X|1PAN|4US|2ETS|2IC|3K|4O|3X|2K|2S|2TT|2X|2Y|1Q|2C|2L|2M|2O|2PAY|2T|2U|3AD|4L|3I|4L|2X|2Z|1RA|37|2B|2C|320|2D|2E|3AL|2G|2IS|2K|2O|3N|2R|3OR|2SDL|2T|3H|4A|2W|2Y|2Z|1S|2AI|2BC|2CE|3ROW|2D|2G|3C|2H|3IB|2N|3C|2P|3R|2S|2T|3ATE|2W|2Z|1T|24|2ALON|2BS|3T|2C|2E|2FETH|2G|3M|3P|2H|32|3A|4X|3B|4N|3D|3ER|3F|4AI|4I|3I|4X|3M|3O|4S|3P|4AD|4LO|4OS|5W|4R|4Y|3S|3V|3W|3X|3Y|2I|2K|3N|2L|2M|2N|3A|2P|3OS|2R|3L|3NT|2S|3C|2T|2X|2Y|2Z|1UC|3OIN|3X|2L|2M|2NO|2RC|3E|3N|3OE|3S|3T|3U|3X|2SD|1V|2A|3N|3ULT|2C|3C|3OIN|2DC|2E|3AI|3D|3NC|4T|3R|4Y|2IL|2MOS|2N|2O|3AI|3L|3S|2R|3ICE|3T|3Y|2T|2U|2X|2Y|2Z|1WC|2IF|2ON|2T|3T|1XA|2B|2C|3C|3L|2D|2E|3N|2FI|2GO|2IP|3T|2LT|2M|3R|2N|3T|2O|3S|2P|3O|2RD|3N|2TN|3P|3RA|2Y|2ZO|1YE|3S|1Z|2C|2ETH|2I|2M|2T|2Y|0F16|2C|12C|2K|13|17|19|1AB|3A|3RIC|2CE|3T|4OM|4R|2DO|2G|2I|3R|4C|4G|2KE|4AI|3T|2ME|4C|3ILY|2N|3360|3C|3D|3G|3V|3X|3Z|2R|3A|3CA|3M|4A|4C|4S|2ST|2T|3HER|4OM|2V|3R|2YD|3RE|2ZZ|1B|2A|2B|2G|2N|3B|2URN|2X|1C|22|2C|2D|2F|2H|2K|2L|2N|2OIN|3N|2P|2Q|2S|2T|3C|1DC|2LS|2M|2O|2R|2T|2USD|2X|2Z|1EAR|2ED|2G|3V1|2I|2LIX|52|2N|3OMY|2R|3C|3MA|3T|3ZAN|2SS|2T|3CH|2VR|2X|2Y|1F|21|2A|2C|3T|2M|2N|2UEL|2YI|1GC|2D|2T|2Z|1HM|1I|2BO|3RE|2C|2D|3A|3LE|3O|2ELD|2F|3TY|2G|2H|2II|2L|3DA|3ES|3L|3M|3ST|2N|3A|4LE|3C|3D|3E|3GER|3K|3N|3OM|3S|3U|2O|2RA|3E|3O|3U|2S|3H|3T|2T|3C|3FI|3T|2U|2WA|2X00|1JB|2C|2T|1K|2GARY|2PEPE|2X|1L|2AG|3ME|3P|3S|4H|5C|2C|2D|3C|3T|2EPE|3TA|3X|2G|2IC|3GHT|3K|3NU|3P|3X|4X|2L|3W|2M|3C|2N|2O|3AT|3KI|5M|5X|3OF|4R|3RK|5Y|3T|3VM|3W|4P|3YX|2P|2R|3BRG|3S|2S|2T|2UID|3RRY|3T|3X|4B|4T|3Z|2VR|2X|2Y|2Z|1M|2B|2C|2E|3X|2G|2L|2T|1N|2B|2C|3T|3Y|2D|3Z|2F|2K|2L|2O|2P|2SA|2TB|2X|2Z|1O|2A|3M|2C|3V|2DL|2F|3O|2GE|2IN|2L|3D|3O|2MO|2N|3E|3S|3T|3Z|2OD|4C|3M|3X|2PA|2R|3A|3CE|5C|3E|4X|3K|3M|3S|3T|4H|5B|2TA|3O|2UR|2X|3AI|3D|3E|3F|3T|3V2|3Y|1P|2AD|2C|2FT|2IS|1R|2A|3C|3X|3Z|2C|2D|3X|2E|3C|4NX|3D|3E|4D|4LA|3L|3N|4S|2F|2GST|3X|2IC|3N|2K|3T|2LONG|2M|2N|3T|2OG|4E|5X|4GY|3NK|4T|3YO|3ZE|2P|2R|2SP|3T|2TC|3N|3S|2V|2WC|2XETH|2Z|3SS|1S|2BT|2C|3C|2HN|2M|2N|2T|3C|2W|1T|2B|2C|2G|2I|2K|2M|3O|2N|2O|2P|2R|3B|3C|2S|2T|2UM|2VT|2W|2X|3T|1UBAO|2CK|2D|2EL|2FU|2JIN|2KU|2L|2MO|2N|3C|4H|3D|4C|4P|4X|4Z|3K|2R|3U|3Y|4X|2S|3DC|3E|3ION|3O|2TC|3URE|2ZE|3N|3Z|1VT|1WATCH|2B|2C|2T|2W|1X|2B|2C|2DX|2F|2I|2P|2S|2T|2Y|1YD|2N|2P|2Z|3NFT|0G1X|13|150|1999|1AC|2D|2FA|3I|2GA|2I|3A|3N|4S|2J|2KH|2L|3A|4TA|4V1|4X|5Y|3EON|3I|3O|3T|2M|3B|4IT|4L|3E|4C|4FI|4IN|4R|4X|3I|3MA|2N|3A|2P|3C|2RD|3I|3K|3T|4S|3U|4DA|3WIF|3Y|2S|3DAO|3G|3P|3TRO|2T|3E|3SBY|2U|2ZE|1B|2A|2C|3R|2D|2E|3X|2G|2IT|2K|2L|2O|3T|3Y|2PT|3U|2RC|2T|3C|2URN|2X|3T|2YTE|1C|2AKE|2C|2ME|2N|2OIN|3TI|2R|2W|1DAO|2C|3C|2DY|2E|2L|2O|3GE|2R|3T|2S|3C|2T|2X|1E|2A|3R|2C|3KO|2EQ|2GE|2IST|2KKO|2LATO|3O|2M|3A|3G|3INI|3S|3Z|2N|3E|3I|4E|4X|3S|4LR|3X|2O|3D|4B|3J|3L|3N|2P|2R|3A|3O|2S|3E|2T|3A|3H|3X|2X|2ZY|1F|2AL|3RM2|2CE|3S|2I|2LY|2N|2T|2UN|2X|2Y|1G|2AVAX|2C|3M|2G|2H|2M|2OLD|2P|3T|2R|2S|2T|3K|4N|1HA|2C|3OLD|2D|2NY|2O|3ST|5M|3UL|2ST|3Y|2T|2UB|2X|1IAC|2B|2C|3T|2F|3T|2G|3A|3X|2M|3MER|2N|3GER|3OA|3UX|3ZA|2O|3T|2V|3E|2Z|1JC|1KF|2I|1LA|3X|2C|3H|2D|3R|3S|3X|3Y|2E|3EC|2F|3T|2I|3DE|3NK|4T|2M|3R|2N|2OBAL|4E|3S|2Q|2R|2S|2T|2X|2YPH|1M|2A|3C|3T|2B|3L|2C|3N|3OIN|2EE|3X|2FAM|2I|2L|2M|3T|2NG|3T|2PD|2R|3X|2S|2T|3O|3T|2USD|2X|1N|2BT|2C|2D|2FT|2G|2J|2NX|2O|3ME|2R|2S|2T|3O|2US|2X|2Y|1O|2A|3L|4S|3T|2B|2C|2D|3E|3L|3S|3Z|2ETH|2F|3F|3X|2G|3O|3U|2IN|2KU|2L|3C|3D|4EN|4X|4Y|3F|3OS|2M|32|3A|3D|3T|2NE|2O|3CH|3D|3GLY|3N|2PX|2RA|3EC|2S|3S|3T|2T|3EM|3G|3X|2V|3I|3T|2W39|2YOO|2Z|1P|2AWS|2BP|2CX|2KR|2L|3X|2N|2O|2PT|2S|2TG|2U|3INU|2X|1Q|1R|2ACY|3IL|4N|3PE|3V|3YLL|2BE|3T|2C|2E|3ARN|3EN|5T|3G|3LF|3XIT|3Y|2FT|2G|2ID|4Z|3MEX|3N|2L|3C|2M|3D|2N|3D|2O|3K|4KY|4X|3N|3W|4TH|2P|3L|2S|2T|2UM|4PY|2V|3E|2W|3I|2X|1S|21|2C|2E|2HIBA|2I|2KY|2M|2PI|2R|2TBSC|3C|3ETH|3S|4OL|3T|2WAP|3IFT|2X|2Y|3S|1T|2A6|3I|3VI|2BOT|2C|3OIN|2E|2F|3O|2H|2IB|2K|2N|2ON|2R|2SE|2X|1UAC|3P|3R|4D|2C|3CI|2E|3SS|2I|3LD|3SE|2LF|2M|2N|3S|2P|2SD|4T|2T|1VC|2E|2R|2T|1W|2D|2GW|2T|1X|2A|2C|2E|2T|1YEN|2M|3NET|3REW|2RO|2SR|1ZB|2E|2IL|2LR|2ONE|2T|2X|0H2O|3N|13O|1ABIBI|2C|3HI|2HA|2I|3R|2KA|3KA|3U|2L|3F|3LO|3O|2M|3I|3S|4TR|2N|3A|3D|4Y|3U|2O|2PI|2RAM|3D|3E|3RYP|3T|2SH|4AI|4T|3UI|2T|3AY|3CHY|3I|2US|2VOC|3Y|2WK|2Y|3YA|2Z|3E|1B|2AR|4X|2B|2C|2D|3C|2E|2IT|2N|2O|3T|2RS|2T|3C|2X|1C|2C|2T|2XP|1D|2AC|3O|2G|2N|2RN|2V|2X|1E|2AL|3RT|5R|3T|3VEN|2C|3T|4A|2DG|4E|2EL|2FI|2GG|3IC|2LIOS|3L|4O|3MET|3PS|2MAN|3ULE|2P|2R|3A|3B|3MES|3O|4ES|2T|3A|3H|2X|3C|2Z|1F|2I|3L|2T|1GET|2HG|2O|3LD|2PT|2S|2T|1H|2EM|2GTTG|1I|2BAKC|4YC|3IKI|3S|2D|3U|2ENS3|54|2FI|3LUF|2GH|2H|2KARI|2LL|2MAYC|3E|2NA|3T|3U|2OD|4BS|2PP|2RE|2T|3BTC|3OP|2VE|2X|1K|2B|2C|2DOGE|3X|2G|2N|1LC|2D|3Y|2M|2N|2P|3R|3T|2S|2T|2X|1MC|2D|2KR|2N|3D|3G|2P|2Q|2R|3N|2ST|2T|3T|2X|1NB|2C|3N|2S|3T|2T|3R|2X|2Y|2ZO|1O|2A|2BA|3BES|3O|2CAI|2D|3L|2GE|2ICHI|2KA|3K|2L|3A|3D|4EX|3Y|2ME|3I|2N|3EY|3K|3OR|2OF|3K|3P|2P|3PY|3R|2RD|3SE|3US|2S|3HI|3KY|3TAI|2T|3N|3T|2USE|2W|3L|1P|2AD|3Y|2B|2C|2L|2N|2O|2T|2X|2Y|1QR|2T|2X|1RB|3E|2CC|2D|3G|2M|2O|2TS|1SC|2F|2N|2P|2S|2T|2UI|4TE|1T|2A|2B|2C|2D|3F|2E|3R|2M|3L|3OON|2N|2O|2R|2T|2X|2Z|1UAHUA|2B|3II|2C|2DI|2GE|3O|2H|2M|3AI|3P|2ND|3NY|3T|2R|2S|3D|3H|3KY|3L|2T|1VC|3O|2E|32|2H|2I|2N|3T|2T|1WC|2L|2T|1XA|2C|2D|2RO|2T|2X|3H|1YBN|3RID|2C|2DRA|4O|5P|2GH|2N|2P|3E|4R|5D|5S|4S|3R|2S|2T|2VE|1Z|2D|2M|2N|2T|0I0C|17|19C|1AG|2I|2M|1B|2ANK|3T|2ETH|3UR|2FK|3N|3R|2G|2IT|2NB|2P|2S|2TC|1C|2A|3P|3SH|2B|2C|2E|2G|2H|3I|3N|3X|2LICK|2N|2OB|3M|3N|4S|3O|3S|2P|2SA|3T|2T|2X|1D|2AC|3P|2C|2EA|3FI|3X|2H|3UB|2IA|3CE|2K|2LE|2M|2NA|2O|3L|3RU|2RT|3X|2T|3T|2V|2X|3M|3S|2YP|1EC|2TH|1F|2C|2IT|2LT|2T|2UM|3ND|2X|1G1|2CH|2G|2I|2NIS|2TT|2U|3P|1HC|2F|2T|1IC|1JC|2Z|1LA|2C|3T|2K|2T|2V|1MBTC|2C|2E|2G|3NAI|3Z|2I|2L|2MO|2O|2P|3ACT|3CH|4N|3ER|3S|3T|2S|3T|2T|2U|2VR|2X|1N|2ARI|2B|2C|3AKE|3NT|3P|2D|3EX|3I|4A|3U|3Y|2E|3RY|3S|3T|3X|2F|3C|3I|4NI|3LR|3O|3RA|3T|4T|3X|2G|2J|2K|2N|3BC|3OU|2O|2P|2RT|2S|3ANE|3C|3N|3P|3R|3T|4AR|3UR|5C|2T|3D|3ER|5N|3L|3O|3R|3X|2U|3INU|3KO|3S|2V|3C|3I|4C|3OX|3X|2X|3M|3T|1O|2C|2EN|3X|2I|2N|3C|3X|3Z|2P|2SHIB|3T|2T|3W|3X|2U|3X|2V|3T|2WN|1P3|2AD|2C|2DN|2L|2MB|2OR|2SX|2T|2UX|2V|3OLD|2X|1Q|250|2C|2N|2Q|2T|1RA|2C|2ENA|2IS|2L|2ON|2T|2YDE|1SA|2DT|2G|2H|3I|3ND|2IKC|2KR|3Y|2L|3AMI|3M|2P|2R|2SP|2T|3EP|1TA|3M|2C|2EM|2F|2G|3R|2HEUM|2L|3R|2M|2OC|2R|2SB|2U|2X|2Z|1UNGO|2S|3D|2X|1VAR|2C|2I|3P|2N|2Y|2Z|1W|2T|1X|2C|2P|2S|2T|1YKYK|1ZA|2E|3R|2I|2X|2ZY|0J8T|19BC|1ACK|3S|3Y|2DE|4C|2IHO|2KE|2M|2N|3E|2R|3ED|3Y|2SMY|2WS|2Y|1BOT|2S|2X|1C|2B|2C|2G|2O|2R|2T|1DC|1ED|3ALS|2ET|2FE|3F|2LLY|2M|2N|2RRY|2SUS|2T|3TON|2UR|2W|3EL|2X|1FI|3N|3VE|1GLP|2N|1IAOZI|2B|2F|2M|2ND|2O|2ZZ|1K|2C|2L|1LP|1M|2C|2PT|2T|2Z|1NB|2GL|2S|2T|2X|2Y|1OB|3S|2E|3Y|2HM|2INT|2JO|2K|3ER|2LT|2NES|2OPS|2Y|3S|3T|1P|2AW|2D|2EG|2GC|2YC|3X|1RIT|2T|1SE|2M|2OL|2T|1T|2C|2O|2S|2T|2X|1UDGE|2GNI|2I|3CE|2L|3B|3D|2MBO|3P|2N|3O|2P|3I|2R|2SDC|4T|2V|1VL|2Y|1W|2L|0K21|2G|1AAS|2BOSU|3Y|2C|3Y|2G|2I|3KEN|3NET|2KA|3I|2L|3A|4M|3DI|3I|3LY|3M|2M|3PAY|2N|3G3N|4AL|2P|3U|2R|3ATE|3EN|3MA|5D|3T|2S|3TA|2T|3A|4NA|3Z|2U|2VA|2WA|2YI|1B3|2C|2D|2OND|3T|3X|2R|2T|3C|2X|1C|2AKE|3L|3SH|3T|2CM|3PAD|2H|2S|2T|1DA|3G|2C|2G|2IA|2OE|3GE|2X|1EANU|2C|2D|2EP|3S|2I|2K|3E|4C|2L|3PIE|2MA|2N|3NEL|3SHI|2P|2RMIT|2TAN|2X|2Y|3C|4AT|3FI|3T|1FC|2I|2R|2T|2X|1GC|2O|2T|1HM|1I|2AN|2BA|3SHI|2CK|4S|2F|2KO|2LLER|3T|2M|3BO|3CHI|2N|3D|3E|3G|493|4B|4F|4U|4Y|3T|3U|2RA|3BY|3O|2SC|3HU|2TA|3SU|3TI|4Y|2WI|2ZUNA|1KO|2T|1LAP|3Y|2C|2D|2EE|3VA|2IMA|3ST|2K|3S|2O|3N|2P|2T|2UB|2V|1MA|2C|2D|2L|2ON|2X|1NC|3L|2DC|3M|3X|2FT|2G|3N|2IGHT|3NE|2J|2OB|3T|3W|3X|2S|2T|3O|2W|1OBE|3O|2DA|2GE|2I|3N|4B|3P|2JI|2K|3O|2L|3ION|2M|3O|3P|2N|3G|3O|2RE|4C|3RA|2TO|2Y|2Z|1P3R|24R|2AD|3PA|2C|2HI|2L|2OP|1RAK|3TOS|2B|2C|2D|2EDS|3ST|2IDA|3PTO|2L|2M|2N|2O|3M|4E|3NE|2P|2RX|2T|2U|2X|1S2|2C|2H|3IB|2M|2N|2P|2S|2T|2WAP|2YS|1T|2C|2K|2N|2O|3N|2S|2T|2X|1UB|3E|3O|4S|2E|2JI|2KU|2MA|3U|2NCI|2R|3O|3T|2S|3A|3D|3H|2V|1VERSE|2I|2NT|2T|1WAI|3TT|2D|2ENTA|2H|2IK|2S|2T|1XA|2C|2USD|1YCC|2L|2OKO|2TE|2UB|2VE|1ZC|2EN|0L2|2DAO|13P|2USD|17|1A|2B|3RA|3S|3X|2CE|2DA|3YF|4S|2EEB|2I|3KA|2KE|2LA|2MB|4O|2NA|3C|3D|4B|4S|3E|2O|2R|3IX|3O|3RY|2S|2T|3TE|3X|2UNCH|2VA|4X|3E|3ITA|2W|2X|2YER|2Z|3IO|1BA|2C|2K|2L|3OCK|2R|2T|3C|2XC|1C|24|2ASH|2C|2D|2G|2K|2MG|3S|2P|2R|3O|2S|3N|2T|2WP|2X|1DC|2FI|2M|2N|2O|3GE|2X|3G|2Z|1EA|3D|3F|3G|3N|3SH|2D|3U|2E|3T|2G|3O|2IA|2LE|2MC|3D|3N|3O|4N|2N|3D|4A|4S|3FI|3IN|2O|3S|3X|2PA|3EN|2SS|4F|2T|2U|2V|3E|4LG|4R|5J|3L|2X|3I|2Z|3GI|1F|2C|2G|2I|2NTY|2T|2W|1GBT|4Q|2C|3Y|2D|2O|3LD|3T|2R|2X|1HB|2C|2D|2INU|2T|1IB|3ERA|5O|3FX|3RA|4E|2C|3K|3O|2D|3ER|2EN|2F|33|3E|3T|2GER|3HT|3MA|3O|2KE|4C|2LA|2ME|4X|3O|3X|2NA|3DA|3EA|3G|3K|4A|4C|4FI|3Q|3U|3X|2ON|2PC|3S|2Q|3D|3R|3UI|2R|2S|3A|2T|3E|3H|4O|3ION|3T|2V|3E|2XX|2Z|3A|4RD|3D|1K|27|2C|2D|2N|2SM|2T|2U|2Y|1LAND|2G|2ION|1M|2AO|2C|3H|2EOW|2R|2T|2WR|2XC|2Y|1N|2C|2D|3RY|3X|2K|3C|2L|2R|2T|2X|1OA|3N|2BS|2C|3C|3G|3I|3K|3O|3US|2DE|2F|3I|2G|2IS|2KA|3R|2L|3A|3C|2N|3G|4FU|2OK|4S|3M|3N|4G|3P|4Y|3T|4EX|2PES|2RD|4S|4Z|3Y|2ST|2T|3ES|4U|3TO|4Y|3US|2UD|2V|3E|4LY|2WB|2X|2YAL|1P|2C|2I|2K|2L|2NT|2OOL|2T|2V|2Y|1Q|28|2BTC|2D|3N|3R|3X|2R|2TY|1RC|2G|2N|1SC|2D|3OGE|2ETH|2HARE|2K|2P|2S|2T|3AR|2V|2WAP|1T|2A|2B|3C|3TC|3X|2C|3C|3D|3H|3P|3R|3U|3X|2D|2E|3X|2G|2H|3N|2K|2NM|2O|3V1|42|2PC|2R|3BT|2S|2T|2X|2Z|1UA|2C|3A|3HOW|3K|4Y|5B|3Y|2DO|2FC|3FY|5G|2IGI|3S|2LU|2M|3A|3I|2N|3A|4R|4T|3C|4H|3E|4S|3G|3R|2PIN|2S|3D|3H|2T|2X|3O|3Y|1VG|2IP|2L|2M|2N|2X|1WC|2F|1X|2C|2F|2T|3O|1YB|2C|2F|3E|2K|2L|2M|2N|3K|3X|2O|2QD|2RA|2TX|2UM|2VE|2X|3E|1Z|0M1|12O|187|1AC|2DANA|3C|3OG|2EP|2F|2G|3A|3E|3IC|5F|5K|5V|4K|3NET|2HA|2I|3A|3D|3L|2KE|3I|2LL|4Y|2MAI|2N|3A|3C|3DOX|3E|3GA|3NA|3TA|4LE|2P|3C|3E|3R|3S|2R3|3CO|3E|3I|4O|3K|3LEY|3MAJ|3O|3S|44|4C|4H|3T|4K|3U|3V|4IN|3X|3YJ|2S|3A|3K|3P|3Q|3S|3TER|3YA|2T|3A|3CH|3E|3H|3IC|5X|3PAD|2U|2V|3IA|2W|2X|3I|3R|3X|2Y|3P|2ZC|3I|3ZE|1B|28|2ASE|2CASH|3C|2E|3T|2F|2I|3T|2L|3C|3K|2M|2N|2ONK|3T|3X|2P|2RS|2S|2T|3C|3X|2X|1C|2ADE|3P|3R|3SH|3T20|3U|2B|2C|2D|2ELO|3UR|2F|2G|2H|3C|2I|3V|2LB|2N|2O|32|2P|3C|2RC|3N|3T|2S|2T|2U|3SD|2V|1DA|3I|3O|2B|2C|3L|2DN|2F|2H|2I|3CE|2M|2N|2R|2S|2T|3K|2U|3S|2X|3H|1E|2AN|2B|2C|3H|4A|3I|2D|3I|4A|4C|5O|4T|2E|3D|3R|3T|2F|3A|2GA|2L|3B|3D|3I|3LO|3O|4S|3T|2M|3E|4AI|4ME|4S|4T|2NGO|3LO|2OW|4G|4IF|2PAD|2R|3CE|4U|3I|3KLE|2SA|3G|3H|3SI|2T|3A|4C|5R|4F|4G|4L|4N|5O|4PK|4Q|4S|4T|4V|4X|3EOR|4R|3FI|3H|3I|4S|3M|3O|4LD|3RO|2U|2V|3R|2W|3TWO|2X|3C|3P|2ZZ|1F|21|2AM|2C|2ER|3T|2G|2I|2O|2PS|2S|2T|3U|2UND|2X|1G|2AMES|3R|2D|2G|3T|2KL|2LC|3D|2N|2O|3D|2P|3T|2T|2UL|2X|1HAM|2C|2LX|2P|2T|2UNT|1I|2A|2B|3O|3R|2C|3E|3KEY|3RO|2DAI|4S|3N|2E|2F|2G|3MIG|2KS|2L|3E|4I|3K|42|3LI|3O|2M|3I|4R|3O|2N|3A|3C|3D|4EX|4S|3E|4X|3I|4ON|3O|3S|3T|4ME|4YS|3U|4TE|3X|2O|3DIO|3TA|2R|3C|2S|3A|3HKA|3S|3T|2T|3C|3H|3X|2V|3A|3RS|2X|2Y|1JT|1KC|2EY|2ONG|2R|2T|2USD|1L|2A|2D|2GC|2ITE|2K|2N|3K|2OKY|2S|2T|3C|3PX|2XC|1M|2A|3I|3ON|3PS|2C|2ETA|2F|2G|2IT|2NXT|2O|2PRO|2S|3C|3S|2T|3M|2UI|2VG|2X|3IV|3VI|2Y|1N|2B|2C|2D|3CC|3E|2E|3T|2FT|4S|2G|3O|2I|2M|2R|3B|3CH|2S|3T|2TC|3G|3L|3O|3P|2V|3M|2W|2X|2Y|2Z|1O|2AC|3R|3T|2B|3I|4C|4E|4LE|3U|3X|3Y|2C|3HI|3O|2D|3A|4I|3C|3EL|4X|3UM|3X|2E|3TA|2F|3I|3OLD|2G|3U|3X|2H|2I|3N|2JO|2K|2L|3A|3K|2M|3A|2N|3A|4V|3ETA|4Y|3F|3G|420|3I|4E|3K|4E|5Y|4U|3O|3S|4T|5A|3T|4E|2O|3I|3LYA|3N|4C|4D|4ED|5R|5Y|4R|3O|3V|3X|2PS|2RA|3E|3OS|3PH|3RA|3SE|2S|2T|3A|3G|3I|3O|2UTAI|2V|3D|3E|4R|4Y|4Z|3ON|3R|2W|3A|2Z|1P|23|2AY|2C|2D|2G|2H|2I|2L|3US|3X|2M|2RO|2S|2T|2WR|2X|3T|1QL|2ST|1R|2BOB|2CH|3R|2F|3OX|2HB|2I|2K|2N|3A|2P|3EPE|2S|3A|2T|2UN|2V|2X|3B|2Y|1SA|2B|2C|3P|3T|2D|2G|3O|2HD|3IB|4P|2N|2OL|3T|2P|2Q|2R|2T|3O|2U|2WAP|1T|2A|2B|3C|2C|3MN|3N|2D|2EL|2G|2H|3D|3N|2IX|2K|2L|3M3|3X|2N|2O|2P|2R|3A|3C|3G|3M|3X|2S|3H|2T|2V|3T|2W|2X|3LT|2Y|2Z|1U|2BI|2DOL2|3RA|2E|2LTI|5V|2MU|2N|3CH|3ITY|2RA|2SD|3E|3IC|3K|3T|2T|3E|2U|2ZZ|1V|2C|2D|3G|2EDA|2G|2I|2L|2P|2RS|2U|2X|1W|2AR|3T|2C|3C|1X|2C|2M|2NT|2RP|2T|3C|2W|2X|2Z|1YB|2C|3E|2DFS|2ID|2L|3O|2NE|2O|3BU|2RA|3IA|3O|4O|2ST|2T|3H|3V|1ZC|2G|2K|2M|2R|2X|0N0031|11|13DR|17|18V|1ABOX|2C|2DA|2FT|2H|2KA|2LS|2M|3E|4C|3I|3O|2N|3A|4S|3J|3O|2O|3S|2P|2RCO|2S|32|3H|3SR|3TR|2T|3ION|2UT|2V|3C|3I|4A|4B|3X|3Y|2WA|2X|2ZAR|1BABSC|3I|3R|2C|2IT|2L|3U|2NG|2OT|3X|2P|2R|2S|2T|1C|2ASH|2C|2DT|2O|3P|3R|4AI|3V|2P|2R|2T|1D|2AU|2C|2LC|2N|2OGE|2R|2X|1EAL|3R|3T|2BL|3U|2C|2ER|3T|2F|2I|2KI|3O|4IN|4S|2MO|3S|2O|3G|3K|3M|3N|3S|3X|2PT|2RD|3F|3O|3VE|2SS|3T|2T|3C|3KO|3Z|41|2U|3ROS|3TR|5O|2VA|3ER|2W|3B|3G|3M|3O|4S|3S|3TON|2X|3A|3BOX|4T|3M|3O|3T|4EX|3XO|2ZHA|1FAI|2CR|2D|2E|2N|2P|2T|311|3ART|3B|4S|3D|3E|3I|3L|3N|3P|3S|3T|3X|4HI|3Y|4P|2UP|2XC|2Y|1GA|2C|2IN|2L|2M|3I|1HCT1|2T|1IBI|2C|3E|4C|2F|3T|4SY|2HAO|2I|3FI|2K|2M|3FA|2N|3JA|5Z|3KY|3O|3U|2OB|3X|2T|3O|3RO|5E|5G|2X|2ZA|1KA|2C|3LC|2N|2T|1LC|32|2G|2INK|2S|2X|1MB|3TC|2C|2D|2H|2K|3R|2R|2S|3P|2T|2X|1NB|2C|2I|2N|2T|1OA|3H|2BL|2DE|3IS|3L|2IA|3S|3Z|2KA|3U|2LA|2M|2NE|2O|3T|2R|3A|3D|3MIE|2S|3N|3O|2TE|2V|3A|2W|2X|3B|1PAS|2C|2ER|2ICK|2LC|2M|2T|2X|3S|1RB|2C|3H|2FB|2G|3Y|2K|2M|2N|2O|2P|2S|2V|3E|2X|1S2DRP|2BT|2D|3X|2FW|2H|2I|2K|2P|2R|2S|2TE|2UR|4E|1T|2B|3C|2C|3C|2D|2G|2K|2M|2O|2R|3N|2S|2VRK|2WK|2X|2Y|1U|2A|2B|3IS|2DE|4S|2KE|2LS|2M|3I|2R|2SA|3D|2T|3GV2|3S|2X|1VA|2C|2DX|2G|2IR|2L|2OY|2S|3T|2T|2X|2ZN|1WC|3N|2P|2S|1XC|2D|3T|2E|2M|3C|2N|2RA|2S|2T|3I|3T|4Y|1YAN|4TE|2BBLE|2C|3REC|2E|3X|2M|2N|2X|2ZO|1ZC|2DX|2E|2L|2O|0O3|14DX|1AK|2S|3C|3IS|2TH|2X|1BEMA|2I|3TS|2OT|2ROK|2S|3R|2T|3C|2X|1C|2AI|3VU|2B|2C|2D|2E|3AN|5T|2ICAT|2L|2N|2P|2T|3A|4X|3I|3O|4C|4IN|2W|2X|1DC|2DZ|2E|2GN|2IN|2MC|2N|3T|2S|2X|2YS|1F|2BC|2C|3R|2E|2N|1G|2CINU|2D|2GY|2N|2O|3D|2SM|3P|2T|2V|2Y|2Z|1H|2ANDY|2M|2O|1ICOIN|2L|3D|2N|2O|1JA|2X|1K|2B|2G|2LP|2OIN|2S|3E|2T|1LAND|3S|2DSF|2E|3A|2IVE|2OID|2T|2V|2XA|2Y|3MP|1M|2A|3X|2C|2D|2EGA|2G|3C|2I|3C|2MI|2NI|4A|4X|3OM|2T|2V1|2X|1N|2AM|2C|2DO|2E|3S|3X|2G|3AS|2I|3ON|3T|2L|3INE|3Y|2NO|2OT|2S|3TON|2T|2US|2X|1OE|2GI|2KI|3S|2RC|3T|2T|2W|1P|2A|3IG|2C|3T|2EN|4GO|4RI|4X|3PE|3S|3T|3X|2HX|2INU|3UM|2MND|2N|3N|2P|2S|3C|3EC|2T|3C|4M|3I|4G|4ON|2U|3L|2V|1RACLE|3I|4X|3O|3RE|2B|3IS|3K|3R|3S|3T|2C|3A|2D|3I|42|4FI|3S|2E|3O|3T|2GA|3T|2I|3GIN|3ON|2LY|2M|3E|2N|3J|2O|3C|3P|3X|2S|2T|2V|2YX|1S|276|2A|3K|2C|2EA|4N|3TH|2F|2HI|2K|2L|2MO|2QTH|2S|2T|2WAP|1T|2B|2HR|2K|2N|2O|2SEA|2X|1UCHI|2D|2R|2SD|4C|3E|2T|1VC|2N|2O|2R|1WC|2D|2L|2N|1X|2AI|2B|3T|2D|2EN|2M|2S|2T|2Y|32|3C|1YS|1ZG|2K|2MPC|2O|3NE|2P|0P202|2PS|13D|1404|1AAL|2BLO|2C|3E|3M|4AN|3OCA|3T|2D|2F|2GE|2I|3D|3NT|2K|2L|3AI|3ET|3G|3LA|3M|4Y|2M|3P|2N|3D|4A|5I|4O|5P|3GE|3IC|3O|2PA|3ER|3I|3PAY|2R|3A|4B|4L|5L|4S|4W|3ETO|3I|3LAY|3MA|3Q|3T|2S|3C|3G|3L|3S|2T|3EX|3H|2VIA|3O|2W|3S|3TH|2XEX|3G|3U|3W|2Y|3B|3CON|3N|3P|3S|3T|3U|3X|2ZZI|1BAR|3SE|2C|2ET|2IRB|2L|3K|2Q|2R|3V1|2T|2X|3V1|1C|2C|3M|2E|2H|3S|2I|2L|2M|2N|3T|2O|3IN|2R|2S|3P|2X|1D|2A|3TA|2C|2D|2EX|2F|2OG|4E|2T|2X|1EA|3CHY|3K|3R|4L|3S|2C|3L|2EL|3PA|4O|4S|2FI|2G|3S|2IPEI|2KC|3O|2L|2M|2NC|3DLE|3G|4YX|3IS|3TA|2OPLE|3S|2PC|3E|42|4AI|4D|4E|4F|4GA|4MO|4PI|4RA|4W|4X|3I|3PA|4ER|3S|2R|3A|3C|3I|3L|3P|3RY|3U|3X|2SA|2T|3F|3G|3H|3L|3N|3O|3S|3T|2USD|2X|1FI|3D|2L|2R|2T|2Y|1G|2ALA|2C|2EN|2F7T|2L|2N|2OLD|2ROK|2T|3S|2U|2X|1HA|3E|3LA|2B|3D|2C|3R|2I|3BA|2L|2M|2N|3X|2O|3NON|3ON|3RE|2R|2S|2T|3C|3R|2V|2X|1I|2AS|2B|2CA|3KLE|3O|2E|2F|2G|3E|4ON|3GY|3S|2KA|3O|2LOT|2N|3CHI|3E|3G|3K|4X|3MO|3O|3U|2O|2P|3A|3I|3L|3T|2RATE|3I|3L|2S|3T|2T|3CH|2VN|3X|2X|3EL|5V|2ZA|3ZA|1JM|1KB|2C|2D|2F|2G|2N|2OIN|2T|1LA|3AS|3C|4E|3I|3N|4ET|3T|4C|4O|3Y|4C|2B|3T|2C|3U|4C|2D|2E|3B|3O|3RF|3X|2F|2G|3R|2I|2M|3T|2NC|3X|2OT|2Q|2R|2S|3ARB|3B|3D|3PAD|3X|2T|3C|3X|4YZ|2U|3G|4CN|3RA|3S1|3TUS|2X|3Y|2Y|1MA|2E|3ER|2G|3T|2M|2NT|2ON|2PY|2TN|1NC|2D|3C|3R|2FT|2G|3N|2K|2L|2ODE|2T|2X|2Y|1OA|3I|2C|3C|3KET|3O|2D|3IUM|3O|2E|2G|3AI|2INTS|2K|3EM|4R|3O|3T|2L|3A|4R|3C|3I|4S|3K|4ER|3L|3NX|3S|3VEN|3X|3Y|4X|2M|2N|3D|3KE|3YO|3ZU|2O|3DL|3H|3L|4X|5T|4Z|3P|2P|3C|4AT|3E|3K|3O|2R|3A|3K|4E|3T|43|4AL|4O|4U|4X|2S|3EX|3I|3Q|3S|3T|4C|2T|3S|3TER|2U|2WELL|4R|3R|1P|2AD|3Y|2BLZ|2C|2I|3ZZA|2L|2M|2N|2OVR|2P|2R|2S|2T|2Y|1QT|1RA|3RE|2B|2C|3H|3L|3M|3Y|2DS|3X|2E|3D|3M|4E|4IA|3S|2FT|2G|2I|3A|3DE|3MAL|4E|3NT|5S|3SM|5A|3X|2L|2M|3X|2NT|2O|3B|3C|3D|3GE|3M|3OF|3P|4C|4S|3S|3T|4EO|4O|5N|3UD|3XI|2P|3S|3T|2Q|2S|2T|3C|3G|2V|3C|3S|2X|3Y|2Y|1S1|2B|2C|2D|2EUD|2F|2G|2I|3LOC|2K|2L|3IP|2M|2OL|2P|3S|2T|3AKE|3N|2UB|2WAP|2Y|3OP|1T|2A|3S|2C|2D|2ERIA|2F|2H|2I|2N|2O|3N|3Y|2P|2R|2T|2U|2X|1UFETH|3F|4IN|2GAI|3L|2LI|3SE|2MA|3BAA|3LX|3P|2N|3CH|3DIX|4U|3K|2PA|3S|2RA|3E|3R|3SE|2SD|3H|4I|3SY|2T|2X|1VFYBO|2P|2T|2U|1WAR|2H|2INGS|2ON|2R|2T|1X|2B|2C|2G|2I|2L|2P|2T|1YC|2E|2I|2LNT|3ON|2M|3E|2N|2P|2Q|2R|3AM|3K|3O|2T|3H|2USD|1ZM|2P|2T|0Q1S|12C|1A|2C|2NX|2RK|2SH|2U|1BAO|2C|2IT|2K|2T|2U|2X|2Z|1C|2H|2N|2O|2X|1DC|2ROP|2T|2X|1FI|1I|2E|2SWAP|1KC|2NTL|1LC|2INDO|1MALL|1NT|3R|3U|2X|1OBI|2M|2OB|2RA|3PO|1QBC|2Q|3F|1R|2DO|2K|2L|2P|2T|2X|1SLV|2P|2R|1TC|3ON|2F|2L|2O|2UM|2Z|1UA|3CK|3M|3NT|3RTZ|3SA|2B|3E|2ICK|3DD|3N|4T|3Z|2O|2ROZ|2SD|1VT|1WAN|3RK|2C|2LA|1XC|0R1|12R|134P|2FI|2T|14RE|1AB|3BIT|3I|2C|3A|3EFI|3ING|2D|3AR|3I|4O|3R|2FT|2GE|2I|3D|4ER|3F|3L|3N|4C|4I|3SE|3T|3ZER|2K|3E|3U|2M|3A|3EN|3P|2NKER|2P|3TOR|2RE|3I|2STA|2TING|4O|3S|2VE|4N|2WG|2Y|3S|2ZE|3OR|1B|2C|2D|3T|2IES|3F|3S|3T|2LS|3Z|2N|3B|2P|2R|2T|3C|2UNNY|2W|2X|3S|2Y|1C|220|2C|3C|2G|2H|2KT|2M|2N|2OIN|2T|2X|1D|2C|2D|2EX|2F|2GX|2N|3T|2O|2PX|2R|2S|2T|2X|1EA|3CH|3L|4M|5S|4Y|3P|4ER|3U|2BL|3US|2C|3OM|2D|3C|4O|3DIT|3FEG|3I|3LC|3N|3O|2E|3F|3LT|2F|3I|3UND|2GENT|2HAB|2I|3GN|2KT|42|2L|3AY|3I|3VT|2M|3CO|3E|3IT|2N|3A|3BTC|3C|3E|4C|3Q|3S|3T|4BE|2P|3O|3UX|2Q|2S|3T|2T|3A|4IL|3H|42|3IRE|2U|3NI|2V|33L|3A|3E|3O|4AI|4N|3U|3V|2W|2X|1F|2CTR|2D|3B|2G|2I|2KJ|2L|2OX|2R|2T|2UEL|2X|1GC|2EN|2OLD|2P|2T|1HEA|2INO|2OC|2P|1IA|2B|3BIT|2C|3E|3H|3K|2DE|4MY|2F|33|3I|2GEL|2K|2L|2M|3BIT|2N|3G|4X|3IA|3U|2O|2P|3AX|3O|3T|4O|2SE|4P|3ITA|2TE|3O|3Z|2YA|2ZE|1JV|1KC|2I|2N|2R|2T|1LB|2C|2M|2OOP|2T|2X|2Y|1MATIC|2C|2ESH|2OB|2PL|2RK|2S|2T|2V|1NB|3W|2C|2D|3R|3X|2S|2T|3B|2X|1OAD|3R|2B|3ET|3IN|2C|3K|42|4ET|4I|4Y|3O|2DAI|2E|2G|2I|2K|3O|2LS|2ME|2ND|3IN|2O|3BEE|3K|3M|3ST|3T|4S|2S|3E|3N|3X|2T|3TY|2UND|3P|3SH|3TE|2VI|2W|3AN|2X|2Y|3A|4L|1PB|2C|2D|2G|2ILL|2K|2L|2M|2S|2T|3R|2UT|2ZX|1RB|2C|2T|1SC|2ETH|2F|2IN|2PN|2R|3V|2S3|2T|3K|2UN|2V|2WETH|1T2|2B|2C|2E|2H|2M|2T|1UBIT|3X|3Y|4EX|2C|2FF|2G|3Z|2LER|2NE|3Y|2P|3X|2SD|3H|3T|2UF|2X|1VC|2F|2LNG|3T|2M|2N|2O|2P|2R|2ST|2T|2X|1WA|3S|2D|2E|2N|2S|1XCG|2D|2O|2T|1YC|3N|2IU|2O|3MA|3SHI|2Z|1ZR|0S2K|14F|18C|1ABAI|3LE|3R|2C1|2F|3E|4S|4T|4X|3LE|3TP|3UU|2I|3L|3TA|4O|2K|3AI|4TA|3E|2L|3D|3E|3LY|3MON|3T|2M|3A|3O|2N|3A|3D|4G|4Y|3I|3JI|3SHU|3TA|4OS|2O|2P|3E|3P|4C|2R|3CO|3OS|2S|2T|32|3A|3OX|4Z|3S|3T|3X|2UBER|3CE|3NA|2V3|3G|3M|1B|2A|3BE|2C|3C|2E|2F|2GO|2IO|2OX|2R|3T|2SC|2T|3C|1C|2A|3LE|3M|3NS|3P|4E|3R|4AB|3SH|3T|2C|3P|2DS|2FX|2H|3O|2IA|3X|2K|2L|3P|2M|2N|3R|3SOL|2O|3IN|3NE|3OBY|3R|4E|3T|4TY|2P|3T|2RAP|3EAM|3IBE|4V|3L|3M|3PT|3T|2S|3X|2T|3K|2Y|1D|2A|3I|3O|2C|3RV|2EX|2L|2N|2O|3G|4E|3PE|2P|2RN|2S|2T|2USD|2X|1EA|3L|4N|3M|3N|3T|2BA|2C|3O|4ND|3RT|3T|2ED|4S|4V|4X|3LE|3N|3R|2FA|2G|2I|3LOR|2KAI|2L|3F|3LC|2M|2N|3ATE|3C|3D|3NO|3SE|4I|4O|5R|3T|2ON|3R|3S|2PA|2Q|2R|3G|3O|3P|3SH|3V|4E|2SSIA|2TH|42|4ER|3S|2X|3Y|1FARM|2C|3P|2D|2F|2G|2I|3N|3T|2L|3OKI|2M|2P|2R|3C|2T|3MX|3Y|2U|3EL|3ND|2X|1G|2B|2DX|2E|2LY|2N|2O|3LD|2P|3T|2R|3OK|2T|1HA|3CK|3DE|3K|4E|3MAN|3N|4G|3RBI|4D|5S|4E|5S|4K|4PE|3UN|2B4|2D|3W|2E|3B|3ESH|3I|3LL|3N|3PE|3RA|3ZMU|2FL|3T|2G|2I|3A|3B|405|42|4AC|5I|5Y|4GF|4IC|4K|4L|4O|4TC|4U|3CO|3DO|3ELD|3FT|3H|3K|3L|4L|5D|3NA|4JA|4O|4T|3P|3T|3V|2K|2L|3D|2ND|2O|3E|3N|3P|4X|3RTY|3W|2PING|2R|3AP|3ED|4K|3OOM|2S|2UB|2VR|2X|1I|2B|3A|2C|2DE|3US|2ERRA|2FT|3U|2G|3N|4A|5T|3T|3U|2L|3K|4R|4T|3LY|3O|3V2|4A|4ER|2MP|4LE|2N|3E|3G|4LE|3S|4O|3X|2P|3HER|4ON|2R|2S|3A|3C|3HI|2U|3UU|2V|2X|2Z|3E|1JCX|1KB|2C|3S|2EB|3T|3Y|2I|3D|3LL|3N|4S|2L|3AY|2M|2PEPE|2R|3B|3IMP|3P|3T|3Y|2T|2U|3LL|2Y|3FT|3M|3RIM|3X|1LA|3M|2B|2C|3L|2EEP|3RF|52|3X|2G|2ICE|5C|3M|4E|3NG|4K|2M|2N|3D|3V2|2OKI|3RK|3TH|2P|3V1|2R|3R|3S|2S|3T|2T|2VX|2X|1MA|3C|3RS|4T|5B|5O|3T|2BR|2C|3W|2D|2ETA|2F|2G|2H|2I|3LE|5K|5Y|2L|3Y|2M|2OG|3KE|3L|4E|3N|3ON|2PF|3L|2R|3AT|3T|4R|2SR|2T|3F|3Y|2U|3DGE|1N|2ACK|3KES|3P|2B|2C|3T|2D|2E|3K|4E|3T|2FTS|2GLS|2IP|3TCH|2K|2L|2M|2N|2OB|3OP|5Y|3V|3W|2PC|3S|2RG|3K|2S|3T|3Y|2T|3R|3VT|2X|2Y|1O|2AI|3K|3R|2BA|3B|3ER|2C|3A|3C|4ER|3KS|3OLA|2DA|3O|2FI|2HOT|2IL|2J|2KU|2L|310|3A|4MA|5B|4PE|4R|5E|4V|3C|4EX|3E|4X|3ID|3KIT|3O|3PAD|3R|3S|4CC|3VE|3X|2M|3A|3M|2N|3AR|3G|3IC|5O|3NE|2ON|2P|2R|3A|2T|3A|2UL|4O|4S|3ND|3RCE|2V|3E|3I|2Y|1P|28DE|2A|3CE|3I|4N|3NK|3RKO|4TA|3T|3Y|2C|3IE|3T|2D|3R|3X|2E|3C|3EDY|3LL|3ND|5C|3PE|3X|2F|3C|2G|3BB|2H|3ERE|3R|4I|3TX|3YNX|2I|3CE|3DER|5Y|3KE|3N|3RIT|3Z|2K|3L|3TR|2LA|2M|2N|3D|2O|3K|3L|3NGE|3ODY|4L|3RE|4T|3TS|3X|2RING|3KL|3T|4S|4Z|2S|2T|2UME|3RDO|4S|2WN|2X|3C|2Y|3RO|1QAT|2G|2L|2R|2T|3S|2UA|4D|4WK|3ID|52|1RBP|2C|3OIN|3X|2EUR|2G|2K|2LTY|2M|2N|3T|2P|2T|2WD|2X|1S|2B|2C|2D|2E|2G|3T|2H|3IB|4P|2LX|2S|2T|3C|2U|2V|2WP|2X|1T|2A|3BLZ|3C|4K|5S|4S|3K|4E|3LIN|3MP|3PT|3R|4C|4K|4L|5Y|4P|4S|5H|4T|5A|3SH|3T|4E|5R|4S|3X|2BU|2C|3N|2D|3YDX|2EAK|3EM|5D|4P|3LLA|3MX|3N|3P|4G|4H|4R|4S|3TH|3WIE|3X|2F|3X|2G|2HR|2I|3C|3K|3MA|4E|3NG|4J|2JUNO|2K|3BNB|3K|2LE|2MAN|3X|2ND|3EAR|2O|3GE|3N|4E|4K|5S|3P|3R|4E|4J|4M|4Y|3S|4MO|3X|2P|3L|3T|2Q|2R|3AKS|4X|4Y|3D|4Y|3EAM|3I|4P|3K|3M|3NGR|3ONG|3P|3S|3X|2S|3OL|3R|3W|2T|2U|3ART|3D|3SDT|2V|2X|2YL|4E|2Z|3EN|3U|1U|2BAWU|3S|2CR|2DO|2GAR|2I|3A|3P|2KU|2M|3MER|3O|2N|3C|3DAE|3EX|3I|3NY|3OLD|3V1|2P|3E|4R|5C|2R|3E|3F|3V|2SD|4E|3HI|2TEKU|4R|2ZUME|1VD|2N|2PN|2S|2T|2X|2Y|1WA|3CH|3G|3MP|3P|4P|4Z|3RM|5M|3SH|3Y|2C|3H|2D|3AO|2EAT|3EP|4T|3TH|2FL|3TC|2G|2H|2IFT|3M|3N|4G|3RL|5X|3SE|3TCH|2M|2OLE|3P|3T|2P|3R|4S|2RV|2T|3H|3S|2U|2YFTT|1X|2C|2DT|2M|2P|2S|2UT|1YA|2BC|3L|3TC|2C|2L|3O|2M|2N|3C|4C|4O|3LEV|3R|3TH|3X|2POOL|2S|1ZCB|0T23|199|1AAS|2B|3OO|2C|2D|2F|2GR|2I|3L|3YO|2J|2K|3I|2LAO|3IS|3K|2MA|2N|3G|4O|3K|2O|3NU|2P|3C|3T|2RA|4L|3I|3OT|3P|2S|3H|3TE|2T|3A|3E|3SU|2U|3C|3M|3R|2VA|2X|1BAC|3NK|3R|2B|2C|3C|3X|2E|2IS|2L|2T|3C|2X|1CANDY|3P|3T|2C|2G2|3C|2H|3AIN|3B|3TRX|2NH|3X|2O|2P|2R|2S|2T|2X|2Y|1D|2E|2FB|3Y|2P|2ROP|2S|2X|1EA|3M|2C|3AR|3H|3RA|2D|3DY|2E|3R|2K|2L|3E|3L|4ER|3O|4S|2M|3CO|3P|2N|3D|4IE|3ET|3FI|3NET|3SHI|3T|2P|2R|3A|4R|3N|3RA|3Z|2S|3LA|5I|3T|4A|2T|3HER|4YS|3RA|3U|1FBX|2C|2I|2L|3OW|2S|2T|2UEL|1GAME|2C|3C|2PT|2T|1H|2ALES|2C|2E|39|3CA|3DAO|3MIS|3N|3O|4S|3TA|3X|2G|2ING|2L|2N|3X|2O|3L|3R|2P|2R|3T|3Y|2S|2T|2UG|2X|1I|2A|3NHE|2C|2DAL|3E|2E|2FI|2G|3ER|5C|3RES|2IM|2K|3I|2M|3E|3I|2N|3C|3KU|3U|3Y|2OX|2P|3INU|3S|4Y|2T|3A|4N|5O|5X|3C|3I|3TY|2USD|2X|1KA|2B|2C|2G|2ING|4U|2MN|2N|2O|2P|2R|2S|3T|2T|2X|2Y|1LC|2M|2N|2OS|2P|2W|1ME|3D|2N|3T|2ON|2RW|2T|3G|1N|2B|2C|2DC|2GBL|2S|3R|2T|1OA|3D|2B|2C|2DAY|2K|3A|4U|3C|3E|4N|3KI|3O|3U|2L|2M|3B|3I|3OE|3S|2N|3E|3I|4C|3NEL|3S|3UP|2OB|3LS|3N|4F|2PC|3G|3IA|3N|2R|3E|3G|3I|4I|3N|2S|3A|3C|3DIS|3HE|4I|2T|3EM|3M|3O|2WER|3N|2X|2YBOX|2Z|1P|2AD|3Y|2C|3ASH|2G|2T|2V|2Y|1QRT|1R3|2A|3C|4E|4N|3DE|5X|3ID|3K|3NQ|4S|3T|3VA|3XIA|4X|2B|3T|3V1|2C|3B|3L|3T|2DC|3L|3S|3T|2EAT|3E|4B|3MP|3T|2G|3I|2I|3A|4S|3BE|4L|3CK|3G|3NI|3O|3PAD|3VIA|3X|2K|2L|2MX|2NDZ|2OLL|3P|3SS|3VE|3Y|2P|2R|2SCT|3T|2TL|3T|2U|3CE|3E|3F|3MP|3ST|3TH|2V|3C|3L|2WP|2X|3C|3WIN|2YB|3C|3X|1SA|2C|3T|2D|2E|2F|2G|2HARE|3P|2L|2N|2R|2UGT|3KA|2X|1T|2C|2K|2M|2N|2T|2U|2V|1UBE|2CKER|2DA|2F|2LIP|2NA|3E|2P|2R|3BO|5S|3T|2S|3D|2T|2ZLA|1VK|2NT|2RS|1W|2C|2D|2EE|4TY|3LVE|3P|2IN|3ST|2LV|2OGE|2T|1X|220|2A|3G|3U|2BIT|2G|2L|2T|1YBG|4S|2C|3OON|2PE|2RANT|3ION|2T|1ZC|2KI|0U8D|1AEC|2T|1BA|2C|2DN|2EX|2I|3Q|2Q|2T|3C|2X|3N|3S|3T|1C|2A|3P|3SH|2G|2H|2JL|2N|2O|3IN|3N|3RE|2T|2X|1DO|3O|2T|1EC|2DC|2NC|2T|3L|1FARM|2C|2FYI|2I|2O|3C|2R|2T|1GAS|2C|2OLD|2T|1HP|1IM|2N|2P|2S|1JENNY|1KG|1LT|3C|3GG|3IMA|3RA|2X|1M|2A|3D|3MI|2B|3R|2C|2I|2K|2MA|2O|2T|2X|2Y|1NAT|2B|3NK|2C|3L|3X|2D|3B|3EAD|3G|3X|2F|3I|2I|3BOT|3C|4E|3DX|3FY|3M|3Q|4UE|3T|4ED|4S|4Y|3VRS|3X|2M|3D|2N|2O|3B|2P|2Q|3T|2R|3C|2S|2W|1OP|2S|1P|2C|3G|3O2|4IN|2DOG|2EUR|2I|2LOAD|2O|2P|2R|3O|2S|2TOS|2UNK|3SD|2X|1QC|1R|2AC|3LS|2FA|2O|2QA|2S|2US|2X|1SAT|2C|3C|3OIN|2DA|4P|3B|4C|3C|3D|3E|4BT|4X|3FL|3G|4LO|3H|3I|3J|3K|3M|3N|3O|3P|3Q|3R|3S|4B|3T|4V|4Z|3U|3V|3X|3Y|3Z|2E|2G|2HARK|3I|4BA|2K|2N|3BT|3OTA|2P|3LUS|2T|3C|3X|2V|2X|1T|2BAI|2C|2G|2H|2I|3L|2K|2NP|2T|2U|2X|1USD|2U|1VT|1W3S|2U|1X|2OS|2P|1ZX|0VAAVE|2B|2DA|3ER|2I|3OT|2L|3AS|3I|4D|3OR|3UE|2N|3A|3CAT|3RY|3T|3Y|2PE|3OR|2RA|3IUS|3K|2ULT|1BCH|2ETH|2G|2IT|2K|2NB|3T|2SC|3WAP|2T|3C|1C|2AKE|2F|2G|2HF|2K|2NT|2ORE|2X|1DG|2L|2O|3GE|3T|2R|2V|2X|2Z|1EC|32|2E|3D|3N|2G|3A|4S|3E|2IL|2KTOR|2LA|3O|4D|4X|2MP|2N|3A|3OM|3T|4I|3US|2O|2R|3A|3I|4C|3SA|4E|3TEX|3VE|2ST|2T|3H|3ME|3TER|2UR|2X|3T|1FIL|2OX|2T|1GO|2X|1HC|1I|2A|2B|3E|3LO|2C|3A|3EX|2D|3A|3T|3Y|4A|4X|3Z|2EW|2G|2K|3KY|2M|2N|3CI|3U|2OR|2P|3ER|3S|2RAL|3ES|2S|3IO|5N|3R|2T|3A|4E|4L|3E|3RA|3Y|2U|2VID|3O|2X|2Z|1KNF|1LC|2S|2T|3C|3X|3Y|2UNA|2X|3PAD|1MATIC|2C|2E|2INT|2PX|2S|2T|1NDC|3T|2ES|2LNK|2M|2N|2O|2T|3W|2X|3AU|3LU|2Y|1OCARE|3O|2DKA|2ISE|2L|3LAR|3R|3T|4A|4V1|52|4Z|2NE|2OT|2T|2W|2X|3EL|2Y|3A|1P|2AD|2K|2ND|2P|2R|3C|1R|2A|2C|2GW|2H|2L|2M|2N|2O|3OM|2P|2S|3C|3E|3W|2T|3X|3Y|2X|1SC|2D|2G|2HARE|2L|2O|2P|2TA|2UI|2X|2YS|1T|2C|2G|2HO|2L|2M|2N|2OS|2RO|3X|2S|2U|3SD|2X|2Y|1UC|2LC|2NI|2ZZ|1V|2I|2S|1X|2L|2RP|2T|2V|1YBE|2FI|2NC|1ZT|0W1|22|12E|13C|2M|2S|2W|18BIT|1AB|3I|2CO|2D|3A|2G|3E|3G|3MI|5T|3ON|2I|3F|4U|3T|2L|3K|3LET|4Y|3V|2M|3PL|2N|3A|3D|3NA|2R|3P|4ED|3S|2S|3ABI|3H|3SIE|3TR|2TER|2VES|2XE|3L|3P|2Y|1BB|3C|2CH|2ESC|3T|4H|2IND|2N|3B|2OND|4ES|2S|2T|3C|2X|1CA|3NTO|2C|3X|2ELL|4O|2FG|2G|2OIN|3RE|2S|3OV|2T|2USD|1DC|2OG|4E|3T|2R|2X|1E|2ALTH|3PON|3R|2B|33|34|35|3AI|3C|3D|2C|3O|2D|2ETH|2FI|2GEN|3LD|2LA|3D|3L|3T|3UPS|2MIX|2N|2OS|2ST|2T|3H|4V1|4W|2VE|2WE|2X|3O|1FAI|2IL|2LOW|2O|2T|2USE|2X|1GC|2HOST|2L|2O|2P|2R|3T|2T|1HALE|5S|2BAR|2EAT|3E|4L|3N|3X|2IRL|3TE|2L|2O|3REN|2T|2X|1IB|2C|3C|2F|3I|3S|4A|2GO|2KEN|3I|2LC|3D|4C|2N|3E|3G|4S|3K|3N|3R|4Y|3T|4ER|2OTX|2S|3C|3E|3H|3TA|2T|3CH|2X|1JEWEL|2XN|1KAVA|2C|2D|1LD|2F|2ITI|2K|3N|2O|2UNA|4C|2XT|1MATIC|2B|2C|2EMO|2F|2NT|2OXY|2T|2W|2X|3WOM|1NCG|2D|3R|2EAR|3ON|3T|2K|2RZ|2T|2XM|2YC|2Z|1OA|2D|2FM|2ID|2J|3AK|52|2KT|2L|3F|4OF|4Y|2M|3B|4AT|3E|4N|3I|2N|3DER|3E|2O|3D|3F|4Y|3L|3NK|3O|4OO|3P|2P|2R|3K|3LD|3M|3X|2W|3S|2ZX|1PC|2E|2I|2LS|2OKT|2P|2R|1QT|1RC|2K|2LD|2ONG|3SE|2T|2X|2Z|1SB|3ABY|3S|2CRT|2DOGE|2G|2HIB|2I|2M|2PP|2TETH|3OR|3R|2X|1T|2AO|2C|2F|3T|3UEL|2G|2K|2L|2N|2ON|2T|2WOOL|1UST|1WB|2D|3OGE|2EMIX|2F|2Y|1X|2DAI|2T|3Z|1YNN|2S|1ZEC|3NIQ|2M|2RD|0X2|2Y2|142|17C|2DAO|2R|18X|1ACT|2H|2I|2MP|2NK|2P|2R|2S|2T|2UC|3R|3T|2VA|2YA|1BASE|2B|2C|2E|2G|2I|2L|2N|2OND|3T|2P|2S|2T|3C|3S|2X|2Y|1C|2AD|3L|3SH|4TR|2E|3L|3PT|2F|3X|2G|2H|3F|2I|2LR|2M|2N|2O|3M|2P|3O|2R|3E|3X|2T|2UR|2V|2XT|1D|2AG|3I|3O|3TA|2B|2C|3E|2EF2|4I|3N|2G|2N|3A|2OGE|3T|2P|2Q|1EC|2D|2L|3S|2M|2N|3D|3IX|3O|2P|2RS|2S|2T|3A|3H|1FC|2I|3T|2LOKI|2T|3C|2UND|2YI|1G|2B|2C|2EM|2LI|2OLD|2PT|2R|2T|1HI|2T|2V|1I|2ASI|2D|3O|3R|2L|2N|3U|2O|3S|3T|2V|1JEWEL|2O|1KI|1LA|3B|2B|2C|2D|2M|2N|2Q|2R|2T|1MARK|3S|2C|3C|2ETA|2G|2N|2O|3N|2P|2R|3G|2S|2T|2V|2X|2Y|1NA|2B|2C|2FT|2G|2K|2L|2N|2O|2S|2T|2V|2X|1ODEX|2LO|2R|2T|2V|2X|1P|2A|3T|3Y|2B|2C|2D|2E|3T|2H|3X|2L|3A|3L|2M|2N|3D|3ET|2O|3KE|2R|3ESS|3O|4T|3T|2S|3T|2T|3P|3X|2X|2Y|1QC|2N|2R|2UOK|1RA|3I|3Y|2C|2D|2E|2ISE|2L|3M|2P|32|40|3C|3H|2T|2UN|4E|1SAUCE|2C|2D|2EED|2GD|2H|3IB|2I|2LR|2N|2P|3C|3EC|3T|2R|2T|3AR|3C|2USHI|1T|23|2AG|3L|2C|2K|2M|2O|2P|2R|3A|3EME|2TB20|2USD|2X|2Z|1UC|2I|2N|2P|3S|1VC|2E|2G|2P|2R|2S|1WC|2G|2IN|2P|2T|1X|2A|2X|1Y|2M|2O|2Z|0Y2K|1AC|3HT|2E|2G|2K|3S|3U|2M|3A|3V1|42|2OYAO|2P|2RL|2W|2XIS|2Y|1BC|2O|1CC|2E|2O|2T|1DF|2OGE|2R|1EC|2E|3D|2FI|2L|2ON|2S|3P|2TI|3U|1FARM|2BETA|3T|2DAI|2F|3C|3I|4I|2I|3E|3I|4I|3VE|2L|2O|2PRO|2TE|2V|2X|1GG|1IELD|5X|2KES|2N|3BI|1LC|2D|3Y|1MC|2S|1O|2BASE|2C|3O|2D|2LO|2OSHI|2P|2SHI|2TD|3O|2U|3C|3RAI|2VI|2YOW|1PIE|1SAFE|2EC|2R|1TA|2N|1U|2ANG|2CJ|3T|2DI|2GE|2KI|3KY|2M|3MI|4Y|2P|2RI|2SE|2ZU|1VS|1YAVAX|2E|2FI|0Z3|1ABAKU|2FI|2I|3F|2M|3ZAM|2NO|2P|2RP|3X|2SH|2T|1B|2C|2IT|2U|1CC|31|2G|2HN|2L|2N|2O|3N|3R|2R|2ULT|2X|1DEX|2R|1EC|3D|2D|3X|2E|2FI|3U|2IT|2L|3IX|2N|3C|3F|3I|4Q|4TH|2ON|2P|3H|2R|3O|4B|4EX|2S|3T|2T|32|3A|3RIX|2UM|3S|2XI|1F|2L|2M|1GD|2EM|1IG|2K|2L|2NC|3U|2P|3T|2RVE|2X|2ZY|1JLT|1K|2BOB|2DOGE|2F|2HIVE|2ID|2LAB|2ML|2P|3AD|3EPE|2S|3HIB|3P|2T|2Z|1LA|2DA|2K|2OT|2Q|2W|1MBE|2N|2T|1ND|2E|2N|2T|2X|2Y|2Z|1OA|2C|2DI|2E|2I|2NE|3O|3X|2O|3M|4ER|3N|3T|2RA|3O|3T|1P|2AE|3Y|2C|2R|3O|2T|3C|1RC|2O|2X|1SC|2E|1T|2C|2G|2X|1UC|2KI|2M|2NA|2R|3R|2SD|2T|2ZALU|3UAI|1VC|1WAP|1XC|2T|1YD|2N|2R|3O|2TARA|1Z|2C|2Z","sep":"|"}]},{"id":"fr-tidytuesday-country-subdivisions-eaf4dc","columns":["name","type"],"n":5046,"cols":[{"f":"0Canillo|0‘Ajmān|0Balkh|0Saint George|6John|6Mary|6Paul|7eter|7hilip|0Barbuda|1erat|0Aragac̣otn|0Erevan|0Huíla|0La Rioja|0San Juan|0Misiones|0Río Negro|0Córdoba|0Santa Cruz|0Burgenland|0Australian Capital Territory|1bşeron|0Bakı|0Lənkəran|0Naxçıvan|8|0Şəki|0Yevlax|0Federacija Bosne i Hercegovine|0Saint Andrew|6James|7oseph|6Thomas|0Bandarban|2rishal|0Chattogram|0Dhaka|0Khulna|0Mymensingh|0Rajshahi|2ngpur|0Sylhet|0Barishal|0Limburg|1uxembourg|0Centre|0Nord|0Comoé|0Montana|0Ruse|0Al ‘Āşimah|1tacora|0Littoral|0Plateau|0La Paz|0Bonaire|0Saba|1int Eustatius|0Amazonas|0Pará|0Santa Catarina|0New Providence|0San Salvador|0Central|0Jwaneng|0North East|6West|0South East|5ern|0Bresckaja voblasć|0Toledo|0Ouham|0Bangui|0Gribingui|0Sangha|0Plateaux|0Aargau|0Jura|0Abidjan|0Savanes|0Los Ríos|0South-West|0Guangxi Zhuangzu Zizhiqu|0Hong Kong SAR|0Bolívar|0Distrito Capital de Bogotá|0Sucre|1an José|0Ilhas de Barlavento|0Praha, Hlavní město|0Tábor|0Brandenburg|0Saint David|6Mark|6Patrick|0Adrar|1lutaguse|0Haapsalu|1iiumaa|0Rakvere|0Saaremaa|0Tartu|0Viljandi|1õru|0Ash Sharqīyah|1l Janūbī|3Awsaţ|1ndalucía|0Cantabria|1euta|0Granada|0Illes Balears [Islas Baleares]|0León|0Addis Ababa|1far|0Eastern|0Northern|0Western|0Ain|0Corse|0Guadeloupe|0Martinique|0Auvergne-Rhône-Alpes|0Saint-Barthélemy|0Aberdeenshire|0Isle of Anglesey [Sir Ynys Môn GB-YNM]|0Barking and Dagenham|1irmingham|0Cambridgeshire|0England|0Manchester|0Boké|0Kindia|0Faranah|0Kankan|0Labé|0Mamou|0Nzérékoré|0Colón|0Békéscsaba|0Veszprém|0Jawa|0Maluku|0Papua|0Andaman and Nicobar Islands|0Punjab|0Agrigento|0Bari|1olzano|0Gorizia|0Busia|0Gilbert Islands|0Raseon|0Gangwon-teukbyeoljachido|0Viangchan|0Choiseul|0Maryland|0Akmenė|1lytaus miestas|0Daugavpils|0Banghāzī|0Safi|0La Colle|0Călărași|0Ralik chain|0Attard|0South Ari Atoll|0Mwanza|0Wilayah Persekutuan Kuala Lumpur|0Gaza|0Maputo|0Abuja Federal Capital Territory|0Svalbard (Arctic Region)|0Emberá|0La Libertad|3Union|0Gilgit-Baltistan|0Dolnośląskie|0Beja|0Adygeja, Respublika|1ltajskij kraj|0Moskva|0Al Jawf|0Saint Louis|0Ascension|0North Western|0Arima|0Niutao|0Chiayi|0Hsinchu|0Johnston Atoll|0American Samoa|0Florida|0Toshkent|0Alo|0Dire Dawa|0Faadhippolhu|1elidhu Atoll|1uvammulah|0Hahdhunmathi|0Kolhumadulu|0Male Atoll|1ulaku Atoll|0North Ari Atoll|6Huvadhu Atoll|6Maalhosmadulu|7iladhunmadulu|6Nilandhe Atoll|6Thiladhunmathi|0South Huvadhu Atoll|6Maalhosmadulu|7iladhunmadulu|6Nilandhe Atoll|6Thiladhunmathi|1igave|0Uvea|0Amurskaja oblast'|1natolikí Makedonía kai Thráki|1rhangel'skaja oblast'|1strahanskaja oblast'|1ttikí|0Belgorodskaja oblast'|1rjanskaja oblast'|0Chelyabinskaya oblast'|0Dytikí Elláda|7Makedonía|0Ionía Nísia|1rkutskaja oblast'|1vanovskaja oblast'|0Jaroslavskaja oblast'|0Kaliningradskaja oblast'|3uzhskaya oblast'|1emerovskaja oblast'|2ntrikí Makedonía|1irovskaja oblast'|1ostromskaja oblast'|1ríti|1urganskaja oblast'|3skaja oblast'|0Leningradskaja oblast'|1ipeckaja oblast'|0Magadanskaja oblast'|1oskovskaja oblast'|1urmanskaja oblast'|0Nizhegorodskaya oblast'|1ovgorodskaja oblast'|3osibirskaja oblast'|1ótio Aigaío|0Omskaja oblast'|1renburgskaja oblast'|2lovskaja oblast'|0Pelopónnisos|2nzenskaja oblast'|1skovskaja oblast'|0Rjazanskaja oblast'|1ostovskaja oblast'|0Sahalinskaja oblast'|2marskaja oblast'|2ratovskaja oblast'|1molenskaja oblast'|1tereá Elláda|1verdlovskaja oblast'|0Tambovskaja oblast'|1hessalía|1jumenskaja oblast'|1omskaja oblast'|1ul'skaja oblast'|1verskaja oblast'|0Ul'janovskaja oblast'|0Vladimirskaja oblast'|1olgogradskaja oblast'|3ogodskaja oblast'|2ronezhskaya oblast'|1óreio Aigaío|0Ípeiros|0Habarovskij kraj|0Kamchatskiy kray|1rasnodarskij kraj|6jarskij kraj|0Permskij kraj|1rimorskij kraj|0Stavropol'skij kraj|0Zabajkal'skij kraj|0Jan Mayen (Arctic Region)|0Western Area (Freetown)|0Sankt-Peterburg|0Melilla|0Aragón|1sturias, Principado de|0Canarias|2stilla y León|8-La Mancha|2talunya [Cataluña]|0Euskal Herria|1xtremadura|0Galicia [Galicia]|0La Rioja|0Madrid, Comunidad de|1urcia, Región de|0Nafarroako Foru Komunitatea*|0Valenciana, Comunidad|0Chukotskiy avtonomnyy okrug|0Hanty-Mansijskij avtonomnyj okrug|0Jamalo-Neneckij avtonomnyj okrug|0Neneckij avtonomnyj okrug|0Yamoussoukro|0Phnom Penh|0Kosovo-Metohija|0Trento|0Vojvodina|0Bougainville|0Costa Caribe Norte|dSur|0Evrejskaja avtonomnaja oblast'|0Friuli Venezia Giulia|0Kŭhistoni Badakhshon|0Nei Mongol Zizhiqu|1ingxia Huizu Zizhiqu|0Príncipe|0Região Autónoma da Madeira|hos Açores|0Sardegna|1icilia|0Trentino-Alto Adige|0Val d'Aoste|0Xinjiang Uygur Zizhiqu|2zang Zizhiqu|0Abkhazia|1jaria|0Bissau|0Găgăuzia, Unitatea teritorială autonomă (UTAG)|0Chaguanas|0Point Fortin|0Appenzell Ausserrhoden|aInnerrhoden|0Basel-Landschaft|6Stadt|1erne|0Capellen|1lervaux|0Diekirch|0Echternach|1sch-sur-Alzette|0Fribourg|0Genève|1larus|1raubünden|2evenmacher|0Luxembourg|2zern|0Mersch|0Neuchâtel|1idwalden|0Obwalden|0Redange|2mich|0Sankt Gallen|1chaffhausen|3wyz|1olothurn|0Thurgau|1icino|0Uri|0Valais|2ud|1ianden|0Wiltz|0Zug|1ürich|0Asunción|0Budapest|0P'yǒngyang|0Ulaanbaatar|0Distrito Capital|0Jakarta Raya|0Capital Territory (Honiara)|0Dushanbe|0Ratak chain|0Addu City|1lmaty|1stana|1şgabat|0Banjul|1ender [Tighina]|2ograd|1ishkek Shaary|1ălți|0Chișinău|1ity of Kigali|2udad Autónoma de Buenos Aires|0Djibouti|0Francistown|0Gaborone|1orod Minsk|6Osh|1rad Zagreb|0Hsinchu|0Kampala|1eelung|1inshasa|1yiv|0Male|2puto|0Port of Spain|0San Fernando|1evastopol|1hymkent|0Tbilisi|0London, City of|0Kauno miestas|1laipėdos miestas|0Palangos miestas|2nevėžio miestas|0Vilniaus miestas|0Šiaulių miestas|0Debrecen|1unaújváros|0Eger|0Győr|0Hódmezővásárhely|0Kaposvár|1ecskemét|0Miskolc|0Nagykanizsa|1yíregyháza|0Pécs|0Salgótarján|1opron|1zeged|3kszárd|2olnok|3mbathely|2ékesfehérvár|0Tatabánya|0Veszprém|0Zalaegerszeg|0Érd|0Balzers|0Eschen|0Gamprin|0Mauren|0Planken|0Ruggell|0Schaan|3ellenberg|0Triesen|7berg|0Vaduz|0Aberdeen City|1ngus|1rgyll and Bute|0Clackmannanshire|0Dumfries and Galloway|2ndee City|0East Ayrshire|5Dunbartonshire|5Lothian|5Renfrewshire|1dinburgh, City of|1ilean Siar|0Falkirk|1ife|0Glasgow City|0Highland|0Inverclyde|0Midlothian|1oray|0North Ayrshire|6Lanarkshire|0Orkney Islands|0Perth and Kinross|0Renfrewshire|0Scottish Borders|1hetland Islands|1outh Ayrshire|6Lanarkshire|1tirling|0West Dunbartonshire|5Lothian|0Aruba|0Curaçao|0Scotland|1int Maarten|0Wales [Cymru GB-CYM]|0Agder|1lytaus apskritis|0Baranya|3ingo|1jelovarsko-bilogorska županija|1lekinge län [SE-10]|1omet|3i|2ng|2rsod-Abaúj-Zemplén|1rodsko-posavska županija|1ungoma|1ács-Kiskun|1ékés|0Carlow|2van|1hanghua|2iayi|1lare|1ork|1songrád-Csanád|0Dalarnas län [SE-20]|1ibër|1onegal|1ublin|3rovačko-neretvanska županija|2rrës|0Elbasan|2geyo/Marakwet|1mbu|0Fejér|1ier|0Galway|2rissa|1barpolu|1jirokastër|1otlands län [SE-09]|1rand Bassa|6Cape Mount|6Gedeh|6Kru|1yőr-Moson-Sopron|1ävleborgs län [SE-21]|0Hajdú-Bihar|2llands län [SE-13]|2rjumaa|1eves|1iiumaa|1oma Bay|1ualien|0Ida-Virumaa|1nnlandet|1siolo|2tarska županija|0Jász-Nagykun-Szolnok|1ämtlands län [SE-23]|2rvamaa|1õgevamaa|1önköpings län [SE-06]|0Kajiado|2kamega|2lmar län [SE-08]|2rlovačka županija|2uno apskritis|1ericho|3ry|1iambu|2ldare|3ifi|3kenny|2nmen|2rinyaga|2sii|3umu|2tui|1laipėdos apskritis|1omárom-Esztergom|2privničko-križevačka županija|2rçë|1rapinsko-zagorska županija|2onobergs län [SE-07]|1ukës|1wale|0Laikipia|2mu|2ois|1eitrim|2zhë|1ienchiang|2merick|2čko-senjska županija|1ofa|2ngford|2uth|1ääne-Virumaa|5maa|0Machakos|2kueni|2ndera|2rgibi|3ijampolės apskritis|3sabit|2yo|1eath|2ru|2đimurska županija|1iaoli|2gori|1ombasa|2naghan|3tserrado|1urang'a|1øre og Romsdal|0Nairobi City|2kuru|2ndi|3tou|2rok|1imba|1ordland|3rbottens län [SE-25]|1yamira|3ndarua|2eri|1ógrád|0Offaly|1sječko-baranjska županija|2lo|0Panevėžio apskritis|1enghu|2st|1ingtung|1ožeško-slavonska županija|1rimorsko-goranska županija|1ärnumaa|1õlvamaa|0Raplamaa|1iver Cess|6Gee|1ogaland|2mssa ja Finnmárkku|2scommon|0Saaremaa|2mburu|1hkodër|1iaya|2noe|2sačko-moslavačka županija|1kåne län [SE-12]|1ligo|1omogy|1plitsko-dalmatinska županija|1tockholms län [SE-01]|1zabolcs-Szatmár-Bereg|1ödermanlands län [SE-04]|0Taita/Taveta|4ung|2na River|2rtumaa|2uragės apskritis|1elšių apskritis|1haraka-Nithi|1ipperary|2ranë|1olna|1rans Nzoia|2ööndelage|1urkana|0Uasin Gishu|1ppsala län [SE-03]|1tenos apskritis|0Valgamaa|2raždinska županija|2s|1estfold og Telemark|4land|1ihiga|2ken|2ljandimaa|3niaus apskritis|2rovitičko-podravska županija|1lorë|1ukovarsko-srijemska županija|1ärmlands län [SE-17]|2sterbottens län [SE-24]|6norrlands län [SE-22]|4manlands län [SE-19]|4ra Götalands län [SE-14]|1õrumaa|0Wajir|2terford|1est Pokot|4meath|2xford|1icklow|0Yilan|1unlin|0Zadarska županija|2grebačka županija|2la|0Örebro län [SE-18]|1stergötlands län [SE-05]|0Šiaulių apskritis|2bensko-kninska županija|0Pordenone|0Trieste|0Udine|0Ahuachapán|1lba|2ibori|2ta Verapaz|3o Paraguay|9ná|1mambay|3zonas|1ntioquia|1rad|3uca|2geș|2tibonite|4gas|1tlantique|3ántico|7da|0Bacău|2ja Verapaz|1ihor|2strița-Năsăud|1oaco|2querón|2rgou|2toșani|2uenza|2yacá|1razzaville|3șov|2ăila|1uzău|0Caaguazú|3zapá|2bañas|2ldas|2nelones|3indeyú|2quetá|2razo|4ș-Severin|2sanare|2uca|1entral|5e|2rro Largo|2sar|1halatenango|2imaltenango|3nandega|3quimula|2ocó|3luteca|3ntales|2uquisaca|1luj|1ochabamba|2llines|3onia|2mayagua|2ncepción|3stanța|2pán|2rdillera|3tés|2uffo|2vasna|1undinamarca|2scatlán|2vette|7-Ouest|1órdoba|1ălărași|0Dolj|2nga|1urazno|1âmbovița|0El Beni|3Paraíso|4rogreso|1scuintla|2telí|0Flores|4ida|1rancisco Morazán|0Galați|1iurgiu|1orj|1racias a Dios|3nada|4de’Anse|1uainía|4rá|3temala|3viare|0Harghita|1uehuetenango|2ila|2nedoara|0Ialomița|2și|1lfov|1ntibucá|1slas de la Bahía|1tapúa|1zabal|0Jalapa|1inotega|1utiapa|0Kouilou|0La Guajira|3Libertad|3Paz|6|3Unión|2valleja|1empira|2ón|1ikouala|1ékoumou|0Madriz|2gdalena|2ldonado|2nagua|2ramureș|2saya|2tagalpa|1ehedinți|2ta|1isiones|1ono|3tevideo|2razán|1ureș|0Nariño|1eamț|1iari|2ppes|1ord|4-Est|5Ouest|3te de Santander|1ueva Segovia|0Ocotepeque|1lancho|2t|1ruro|1uest|2émé|0Pando|2raguarí|2ysandú|1etén|1ointe-Noire|2ol|2tosí|1rahova|2esidente Hayes|1utumayo|0Quetzaltenango|2iché|3ndío|0Retalhuleu|1isaralda|2vas|3era|1ocha|1ío Negro|4San Juan|0Sacatepéquez|2lto|2n Andrés, Providencia y Santa Catalina|4José|4Marcos|5iguel|4Pedro|4Salvador|4Vicente|3gha|3ta Ana|6Bárbara|6Cruz|6Rosa|5nder|2tu Mare|1ibiu|1ololá|2nsonate|2riano|1uceava|3hitepéquez|2d|3-Est|1ălaj|0Tacuarembó|2rija|1eleorman|1imiș|1olima|2tonicapán|1reinta y Tres|1ulcea|0Usulután|0Valle|5 del Cauca|2slui|2upés|1ichada|1rancea|1âlcea|0Yoro|0Zacapa|1ou|0Ñeembucú|0Agalega Islands|0Cargados Carajos Shoals|1lipperton|0Redonda|1odrigues Island|2tuma|0Southern Grenadine Islands|0A'ana|1bim|1cklins|1djumani|1gago|1iga-i-le-Tai|2wo|1l Awsaţ|3Janūbī|3Quds|2ebtong|1mmochostos|2olatar|2para|2udat|3ria|4u|1nabar|2enii Noi|3tan|2ibare|2se Boileau|5Etoile|5Royale|5aux Pins|5la Raye|2trim and Newtownabbey|2uradhapura|1pac|1rds and North Down|2magh City, Banbridge and Craigavon|2ua|1sh Shamālī|1tua|1u Cap|1veiro|0Badulla|2f|2gerhat|2ie Lazare|5Sainte Anne|3tsi|2laka|2mako|2rguna|2s-Sassandra|3arabeasca|2tticaloa|1eau Vallon|2l Air|4Ombre|3ait|3fast City|3ize|2nešov|2rea|3oun|3ry Islands|1hola|1imini|1lack Point|6River|3goevgrad|3nsko|4tyre|1oe|2gura|2rski okrug|2tha-Bothe|1raga|5nça|3hmanbaria|3ničevski okrug|2iceni|2no-město|5venkov|2okopondo|2unei-Muara|4tál|1uada|2daka|3uda|2giri|3weri|2hweju|2ikwe|2kedea|3omansibi|3wo|2lambuli|3iisa|2mthang|2ndibugyo|3yangabu|2rgas|2shenyi|3ia|2taleja|4mbala|3ebo|2vuma|2yende|1řeclav|0Cahul|2naries|3tagalo|4emir|2scade|3telo Branco|4ries|2t Island|2useway Coast and Glens|3é|2yo|1entral Abaco|9ndros|8Eleuthera|8Singapore|1handpur|3pai Nawabganj|2eb|2hukha|2ikwawa|3radzulu|3tipa|2obe|3mutov|2rudim|2uadanga|1imișlia|2ty of Freeport|1oimbra|2lombo|2mmewijne|3oé|2ronie|4zal|2x's Bazar|1riuleni|2ooked Island and Long Cay|1umilla|1ăușeni|0Dagana|1edza|2nguélé|3igomodu|3nery|2rry and Strabane|1inajpur|2strict of Columbia|6to Nacional (Santo Domingo)|1obrich|2kolo|2mažlice|2ndușeni|2wa|1rochia|1ubăsari|1ěčín|0East Grand Bahama|1dineț|1nglish River|1wa|1xuma|0Fa'asaleleaga|2ridpur|3o|1eni|2rmanagh and Omagh|1lacq|2orești|1rýdek-Místek|1ălești|0Gabrovo|2ga'emauga|4ifomauga|2ibandha|2lle|2mpaha|2sa|2zipur|1hanzi|1irne|1lacis|2odeni|1omba|2palganj|1rand Anse Mahe|bPraslin|6Cay|6Port|2os Islet|1uarda|2lu|1ôh-Djiboua|0Haa|2biganj|2mbantota|2rbour Island|2skovo|2vlíčkův Brod|1odonín|2ima|2pe Town|1radec Králové|1încești|1̱efa|0Ialoveni|1banda|1ganga|1juw|1le Perseverance I|iI|1nagua|1singiro|0Jablanički okrug|4onec nad Nisou|2ffna|2malpur|2shore|1eseník|1halakathi|2enaidah|1ihlava|2ndřichův Hradec|3ja|2čín|1oypurhat|1užnobanatski okrug|7čki okrug|0Kaabong|2bale|4role|3eramaido|2gadi|2kumiro|2laki|4ngala|3iro|3ungu|4tara|2muli|3wenge|2ndy|3ungu|2pchorwa|3elebyong|2rdzhali|3enga|3lovy Vary|3onga|3viná|2sanda|3ese|3ungu|2takwi|2yunga|2zo|1egalla|1galagadi|3tleng|1hagrachhari|1ibaale|3oga|3uku|2kuube|2linochchi|2ruhura|3yandongo|2shoreganj|3oro|2tagwenda|3gum|1ladno|3tovy|1oboko|2le|3ubarski okrug|3ín|2sovski okrug|7o-Mitrovački okrug|9Pomoravski okrug|2tido|1roměříž|1umi|2rigram|3unegala|2shtia|2tná Hora|1wania|2een|3neng|1yankwanzi|2egegwa|3njojo|2otera|2ustendil|0La Digue|2borie|2cs|2gunes|2kshmipur|2lmonirhat|2mwo|2rnaka|1efkosia|2iria|2mbá|3esos|2ova|2ribe|2s Mamelles|1huentse|1iberec|2koma|2longwe|2ra|2sboa|4urn and Castlereagh|2toměřice|1obata|2ng Island|2uny|2vech|1uuka|2wero|1wengo|1yantonde|0Machinga|2daripur|3i-Okollo|2feteng|2gura|2nafwa|3gochi|4rove Cay|3ikganj|3nar|2racha|3owijne|2saka|3eru|3indi|2tale|4ra|2yaguana|3uge|2čvanski okrug|1bale|3rara|1chinji|1eherpur|2neng|1icoud|2d and East Antrim|3-Ulster|2tooma|3yana|1ladá Boleslav|1ohale's Hoek|2ka|3hotlong|2naragala|3ggar|3t Buxton|5Fleuri|4agnes|2ore's Island|2ravički okrug|3oto|2st|2ulvibazar|2yo|1pigi|1ubende|2kono|2lanje|3laittivu|2nshiganj|1zimba|1é-Zóchi|1ělník|0Nabilatuk|2kapiripirit|4seke|5ongola|2mayingo|3isindwa|3utumba|2ogaon|2pak|2rail|4yanganj|3singdi|2tional Capital District (Port Moresby)|3ore|1ebbi|2no|2trakona|2wry, Mourne and Down|1gora|1ibok|2ckerie|2lphamari|2sporeni|2šavski okrug|1khata Bay|3otakota|1oakhali|2rth Abaco|7ndros|6East|7leuthera|6West|2vý Jičín|1sanje|1tcheu|4isi|2oroko|2ungamo|1uwara Eliya|1woya|1ymburk|1áchod|0Obongi|1cnița|1lomouc|1moro|1pava|1range Walk|2hei|1strava-město|1tuke|1yam|0Pabna|2der|2kwach|2lauli|3lisa|2mplemousses|2nchagarh|2ra|4maribo|3dubice|3o|2tuakhali|2zardzhik|1elhřimov|2ma Gatshel|2rnik|2ćki okrug|1halombe|1irojpur|4tski okrug|1laines Wilhems|4sance|2even|2ovdiv|2zeň-jih|6město|6sever|1odunavski okrug|2inte Larue|2lonnaruwa|2moravski okrug|2rt Glaud|5Louis|4alegre|4o|1rachatice|3ha-východ|6západ|2izrenski okrug|2ostějov|1unakha|2ttalam|1ísek|1činjski okrug|1řerov|2íbram|0Qacha's Nek|1uthing|0Ragged Island|2jbari|2kai|3ovník|2ngamati|2sinski okrug|2tnapura|2zgrad|2ški okrug|1ezina|1ivière du Rempart|1oche Caiman|2kycany|1ubanda|3irizi|2kiga|3ungiri|2m Cay|3phi|1wampara|1ychnov nad Kněžnou|1îșcani|0Salima|2mdrup Jongkhar|3tse|2ntarém|2ramacca|3pang|2ssandra-Marahoué|2tkhira|3upa'itea|2vanne|1embabule|3ily|2rere|2túbal|2vernobanatski okrug|9čki okrug|1hariatpur|2eema|3rpur|2umen|1ilistra|2paliwini|2rajganj|3onko|1liven|1molyan|1ofia|5 (stolitsa)|2kolov|2roca|4ti|2ufrière|3th Abaco|7ndros|6East|7leuthera|6West|1panish Wells|1rednjebanatski okrug|3mski okrug|1tann Creek|3ra Zagora|2rakonice|3ășeni|1unamganj|1vitavy|1îngerei|0Tachov|2kamaka|2ll Abīb|2ngail|2raclia|3govishte|1elenești|2mburong|2plice|1haba-Tseka|3kurgaon|2imphu|2yolo|1oplički okrug|2roro|1rashi Yangtse|6gang|2incomalee|2ongsa|2utnov|1sirang|1uamasaga|2tong|1řebíč|0Uaboe|1herské Hradiště|1ngheni|0Va'a-o-Fonoti|2isigano|2llée du Bandama|2rna|2vuniya|1eliko Tarnovo|1iana do Castelo|2din|2eux Fort|2la Real|2seu|1ratsa|1setín|1yškov|0Wakiso|2ngdue Phodrang|3ica|1est Grand Bahama|1oroba|0Yambol|2ren|1umbe|0Zaječarski okrug|2nzan|2padnobački okrug|1hemgang|1latiborski okrug|2ín|1nojmo|1omba|4o|0Água Grande|0Évora|0Ústí nad Labem|9Orlicí|0Česká Lípa|4é Budějovice|4ý Krumlov|0Šumadijski okrug|3perk|0Žďár nad Sázavou|0Șoldănești|1tefan Vodă|0Alytus|1nykščiai|0Biržai|0Ignalina|0Jonava|3iškis|1urbarkas|0Kaišiadorys|2unas|1elmė|1laipėda|1retinga|1upiškis|1ėdainiai|0Lazdijai|0Marijampolė|2žeikiai|1olėtai|0Pakruojis|2nevėžys|2svalys|1lungė|1rienai|0Radviliškis|2seiniai|1okiškis|0Skuodas|0Tauragė|1elšiai|1rakai|0Ukmergė|1tena|0Varėna|1ilkaviškis|3nius|0Zarasai|0Šakiai|2lčininkai|1iauliai|2lalė|3utė|2rvintos|1venčionys|0Brčko distrikt|0nohiyahoi tobei jumhurí|0'Eua|0Central|7 River|1hattogram|0Dhaka|0Ha'apai|0Khulna|0Lower River|0Mymensingh|0Niuas|1orth Bank|0Rajshahi|2ngpur|0Sylhet|0Tongatapu|0Upper River|0Vava'u|0Western|0Abū Z̧aby|1l Fujayrah|1sh Shāriqah|0Dubayy|0Ra’s al Khaymah|0Umm al Qaywayn|0Republika Srpska|0Alsace|0Islamabad|0Dependencias Federales|1istrito Federal|0Ciudad de México|0Wilayah Persekutuan Labuan|kPutrajaya|0Caltanissetta|0Enna|0Ragusa|0Siracusa|0Trapani|0Saint Helena|0Tristan da Cunha|0Central|0Eastern|0Ilhas de Sotavento|0Northern|0Western|0Kalimantan|0Maluku|0Nusa Tenggara|0Papua|0Sulawesi|2matera|0Aakkâr|1byan|1d Daqahlīyah|4ākhilīyah|1l Anbār|4ḩmadī|3Balqā’|5yḑā’|5şrah|5ḩr al Aḩmar|4iqā‘|4uraymī|5ḩayrah|3Farwānīyah|5yyūm|3Gharbīyah|3Iskandarīyah|5mā'īlīyah|3Jahrā’|5nūb|8īyah|5wf|4īzah|3Karak|3Mafraq|5hrah|5ḩwīt|4inyā|6ūfīyah|4uthanná|5ḩarraq|3Qalyūbīyah|4ādisīyah|5hirah|3Uqşur|3Wusţá|4ādī al Jadīd|3Ḩudaydah|3‘Aqabah|5̅şimah|4Āşimah|1n Nabaţīyah|5jaf|1rbīl|2khabīl Suquţrá|1s Sulaymānīyah|5ways|2h Shamālīyah|6imāl|2wān|2yūţ|1z Zarqā’|2̧ Z̧āhirah|1ţ Ţafīlah|1ḑ Ḑāli‘|0Baalbek-Hermel|2ghdād|2nī Suwayf|2yrūt|1en Arous|2thlehem|1izerte|1éja|1ābil|1ūr Sa‘īd|0Conakry|0Dahūk|1eir El Balah|1hamār|2ī Qār|1iyālá|1umyāţ|0Gabès|2fsa|2za|0Hebron|0Ibb|1rbid|0Jabal Lubnān|2nūb Sīnā'|6al Bāţinah|7sh Sharqīyah|2rash|1endouba|3in|2richo and Al Aghwar|3usalem|0Kafr ash Shaykh|2irouan|2rbalā’|2sserine|1han Yunis|1irkūk|1ébili|0L'Ariana|1a Manouba|2ḩij|1e Kef|0Mahdia|2sqaţ|2ysān|2ţrūḩ|2‘ān|2’rib|1onastir|1ubārak al Kabīr|2sandam|1édenine|1ādabā|0Nabeul|3lus|1orth Gaza|1īnawá|0Qalqilya|1inā|0Rafah|2mallah|2ymah|0Salfit|1fax|1habwah|3māl Sīnā'|7al Bāţinah|8sh Sharqīyah|1idi Bouzid|2liana|1ousse|1ūhāj|0Tataouine|1ozeur|1ubas|2lkarm|2nis|1āʻizz|0Wāsiţ|0Zaghouan|1̧ufār|0Şalāḩ ad Dīn|2nʻā’|1āʻdah|0Ḩajjah|2wallī|2ḑramawt|0‘Adan|2jlūn|2mrān|0Line Islands|0Phoenix Islands|0Guna Yala|0Naso Tjër Di|1gäbe-Buglé|0Anjouan|0Grande Comore|0Mohéli|0Nanumaga|5ea|1ui|2kufetau|4laelae|0Vaitupu|0Baker Island|0Howland Island|0Jarvis Island|0Kingman Reef|0Midway Islands|0Navassa Island|0Palmyra Atoll|0Wake Island|0Baden-Württemberg|2yern|1erlin|1remen|0Hamburg|1essen|0Mecklenburg-Vorpommern|0Niedersachsen|1ordrhein-Westfalen|0Rheinland-Pfalz|0Saarland|2chsen|7-Anhalt|1chleswig-Holstein|0Thüringen|0Balzan|1irgu|3kirkara|3żebbuġa|1ormla|0Dingli|0Fgura|1loriana|1ontana|0Gudja|1ħajnsielem|3rb|4għur|3sri|3xaq|1żira|0Iklin|1sla|0Kalkara|1erċem|1irkop|0Lija|1uqa|0Marsa|5skala|5xlokk|1dina|1ellieħa|1osta|1qabba|1sida|1tarfa|1unxar|1ġarr|0Nadur|2xxar|0Paola|1embroke|1ietà|0Qala|1ormi|1rendi|0Rabat Gozo|6Malta|0Safi|2int John|7ulian's|6Lawrence|7ucia's|6Paul's Bay|2nnat|3ta Venera|1iġġiewi|1liema|1wieqi|0Ta' Xbiex|2rxien|0Valletta|0Xagħra|1ewkija|1għajra|0Ħamrun|0Żabbar|1ebbuġ Gozo|7Malta|2jtun|1urrieq|0Barnet|1exley|1rent|2omley|0Camden|1roydon|0Ealing|1nfield|0Greenwich|0Hackney|2mmersmith and Fulham|2ringey|3row|2vering|1illingdon|1ounslow|0Islington|0Kensington and Chelsea|1ingston upon Thames|0Lambeth|1ewisham|0Merton|0Newham|0Redbridge|1ichmond upon Thames|0Southwark|1utton|0Tower Hamlets|0Waltham Forest|2ndsworth|1estminster|0Krung Thep Maha Nakhon|0Bologna|1usan-gwangyeoksi|0Cagliari|2tania|0Daegu-gwangyeoksi|3jeon-gwangyeoksi|0Firenze|0Genova|1wangju-gwangyeoksi|0Incheon-gwangyeoksi|0Kaeseong|0Messina|1ilano|0Nampho|2poli|0Palermo|0Reggio Calabria|1oma|0Torino|0Ulsan-gwangyeoksi|0Venezia|0Métropole de Lyon|0Paris|0Aisne|1llier|2pes-Maritimes|6de-Haute-Provence|1rdennes|3èche|2iège|1ube|2de|1veyron|0Bas-Rhin|1ouches-du-Rhône|0Calvados|2ntal|1harente|8-Maritime|2er|1orrèze|3se-du-Sud|1reuse|1ôte-d'Or|4s-d'Armor|0Deux-Sèvres|1ordogne|2ubs|1rôme|0Essonne|1ure|4-et-Loir|0Finistère|0Gard|1ers|1ironde|0Haut-Rhin|4e-Corse|6Garonne|6Loire|6Marne|6Savoie|8ône|6Vienne|5s-Alpes|7Pyrénées|4s-de-Seine|1érault|0Ille-et-Vilaine|1ndre|5-et-Loire|1sère|0Jura|0Landes|1oir-et-Cher|4e|5-Atlantique|5t|2t|3-et-Garonne|2zère|0Maine-et-Loire|2nche|2rne|2yenne|1eurthe-et-Moselle|3se|1orbihan|2selle|0Nièvre|1ord|0Oise|1rne|0Pas-de-Calais|1uy-de-Dôme|1yrénées-Atlantiques|9Orientales|0Rhône|0Sarthe|2voie|2ône-et-Loire|1eine-Maritime|6Saint-Denis|6et-Marne|1omme|0Tarn|4-et-Garonne|1erritoire de Belfort|0Val-d'Oise|5e-Marne|2r|2ucluse|1endée|1ienne|1osges|0Yonne|1velines|0Barnsley|1olton|1radford|1ury|0Calderdale|1oventry|0Doncaster|1udley|0Gateshead|0Kirklees|1nowsley|0Leeds|1iverpool|0Newcastle upon Tyne|1orth Tyneside|0Oldham|0Rochdale|2therham|0Salford|2ndwell|1efton|1heffield|1olihull|2uth Tyneside|1t. Helens|2ockport|1underland|0Tameside|1rafford|0Wakefield|2lsall|1igan|2rral|1olverhampton|0Bourgogne-Franche-Comté|1retagne|0Centre-Val de Loire|0Grand-Est|0Hauts-de-France|0Normandie|2uvelle-Aquitaine|0Occitanie|0Pays-de-la-Loire|1rovence-Alpes-Côte-d’Azur|0Île-de-France|0Acquaviva|1d Dawḩah|1erodrom †|1ileu|3inglaplap|3uk|2naro|2zkraukles novads|1jdovščina|1kraneskaupstaður|2ureyrarbær|1l Khawr wa adh Dhakhīrah|3Wakrah|2ūksnes novads|1mānat al ‘Āşimah [city]|1ndrijevica|2karan|1pače|1r Rayyān|2ačinovo|2no|1sh Shamāl|6īḩānīyah|1ugšdaugavas novads|2r|1vannaata Kommunia|1z̧ Z̧a‘āyin|0Balvu novads|2r|2ucau|3skas novads|1eijing Shi|2ltinci|2nedikt|2rane|3ovo|1ijelo Polje|2kini & Kili|2rštonas|2strica ob Sotli|2tola|1led|2oke|2áskógabyggð|1oa Vista|2bonaro|2gdanci|3ovinje|2hinj|2lungarvíkurkaupstaður|2rgarbyggð|4o Maggiore|3ovnica|2silovo|2vec|1raslovče|3va|2da|2ezovica|3žice|2venica|1ucurești|2dva|2tel †|0Cankova|1entar Župa|7†|2rklje na Gorenjskem|4nica|5o|4venjak|2tinje|1hiesanuova|2ongqing Shi|1irkulane|2ttà di San Marino|1ova Lima|1ēsu novads|1ần Thơ|0Dalabyggð|3víkurbyggð|2nilovgrad|1ebar|3rca|2lčevo|2mir Hisar|6Kapija|2strnik|1ienvidkurzemes Novads|2vača|1obeles novads|3je|3repolje|4na|4ova-Polhov Gradec|6nik|2jran|2l pri Ljubljani|3enjske Toplice|3neni|2magnano|3žale|2rnava|1ravograd|2uskininkai|1uplek|1íli|0Ebon|1lektrėnai|1newetak & Ujelang|1rmera|1yja- og Miklaholtshreppur|4fjarðarsveit|0Faetano|1iorentino|1jallabyggð|3rðabyggð|1ljótsdalshreppur|2óahreppur|0Garðabær|2zi Baba †|1evgelija|1jorče Petrov †|1orenja vas-Poljane|3išnica|3je|3nja Radgona|5i Grad|7Petrovci|2stivar|1rad|4sko|2indavíkurbær|2osuplje|2undarfjarðarbær|2ímsnes- og Grafningshreppur|2ýtubakkahreppur|1ulbenes novads|2sinje|1əncə|0Hafnarfjarðarkaupstaður|2jdina|1erceg-Novi|1odoš|2rjul|2če-Slivnica|1rastnik|2pelje-Kozina|2unamannahreppur|1valfjarðarsveit|2eragerðisbær|1à Nội|1örgársveit|1únabyggð|4þing vestra|1ải Phòng|1ồ Chí Minh|0Idrija|1g|1linden|3rska Bistrica|1vančna Gorica|1zola|0Jabat|2luit|1egunovce|2lgavas novads|2senice|2zersko|1uršinci|1ēkabpils novads|0Kaldrananeshreppur|3varija|2mnik|2nal ob Soči|2rbinci|3poš †|2vadarci|2zlų Rūdos|1idričevo|2sela Voda †|2čevo|1jósarhreppur|1obarid|3ilje|2lašin|2men|5da|3mune Kujalleq|8Qeqertalik|7qarfik Sermersooq|2nče|2stanjevica na Krki|4el|2tor|2zje|2čani|3evje|1ranjska Gora|3tovo|2iva Palanka|4ogaštani|3ževci|2uševo|2āslavas novads|1uldīgas novads|2manovo|2ngota|2zma|1wajalein|1ópavogsbær|0Lae|2nganesbyggð|2utein|2ško|1enart|3dava|1ib|2kiep|4sá|2ma hatun llaqta|3bažu novads|2pkovo|2tija|1jubno|3tomer|1og-Dragomer|3atec|2vrenc na Pohorju|2zovo|2ška dolina|4i Potok|1udzas novads|2kovica|2če|1īvānu novads|0Madonas novads|2io|2juro|3šperk|2kedonska Kamenica|9i Brod|3ole|2loelap|2natuto|3ufahi|2rkovci|2vrovo i Rostuše|1edvode|2jit|2ngeš|2tlika|2žica|1iklavž na Dravskem polju|2li|2ngəçevir|2ren-Kostanjevica|3na|5 Peč|2slinja|1ogila|2jkovac|2kronog-Trebelno|2ntegiardino|2ravske Toplice|5če|2sfellsbær|3teiros|2zirje|1uta|1úlaþing|1ýrdalshreppur|1ārupes novads|0Naftalan|2klo|2mdrik|3u|2zarje|1egotino|2ringa|1ikšić|1orðurþing|2vaci|3o Selo|0Odranci|1gres novads|1hrid|1laines novads|1plotnica|1rmož|1silnica|0Pagėgiai|2ul|1ehčevo|2snica|2tnjica|3rovec|1iran|2vka|1lasnica|3v|2jevlja|2užine|1odgorica|3lehnik|3velka|3četrtek|2ljčane|3zela|2rto Novo|2stojna|1raia|2ebold|3ddvor|3iļu novads|3valje|2ilep|2obištip|1uconci|0Qeqqata Kommunia|0Radenci|4če|3lje ob Dravi|3oviš|5ljica|2ngárþing eystra|bytra|3kovce|2vne na Koroškem|2zkrižje|2če-Fram|1enče-Vogrsko|2sen|2ykhólahreppur|4janesbær|6víkurborg|2čica ob Savinji|1ibeira Brava|8Grande|e de Santiago|3nica|7 na Pohorju|2etavas|1ogatec|4ška Slatina|5ovci|2ngelap|2pažu novads|2soman|2žaje|1uše|1ēzeknes novads|0Sal|3aspils novads|3dus novads|2nta Catarina|e do Fogo|7ruz|2raj †|2ulkrastu novads|1elnica ob Dravi|3tjarnarnesbær|2mič|2rravalle|2vnica|2žana|1hanghai Shi|1iguldas novads|1kaftárhreppur|3gabyggð|5fjörður|2eiða- og Gnúpverjahreppur|2orradalshreppur|1lovenska Bistrica|8e Konjice|1miltenes novads|1næfellsbær|1odražica|2lčava|2pište|1redišče ob Dravi|1taro Nagoričane|4še|2randabyggð|4ža|3uga|4mica|2udeničani|2ykkishólmsbær|1umqayıt|2ðurnesjabær|1valbarðsstrandarhreppur|2eitarfélagið Hornafjörður|fSkagaströnd|fVogar|fÁrborg|fÖlfus|3ta Ana|6Trojica v Slovenskih goricah|4i Andraž v Slovenskih goricah|6Jurij ob Ščavnici|cv Slovenskih goricah|6Nikole|6Tomaž|1ão Domingos|4Filipe|4Lourenço dos Órgãos|4Miguel|4Salvador do Mundo|4Vicente|1úðavíkurhreppur|0Tabor|2lsu novads|2rrafal|8 de São Nicolau|1earce|2tovo|1ianjin Shi|2vat|2šina|1jörneshreppur|1olmin|1rbovlje|2ebnje|2novska Vas|2zin|2žič|1ukuma novads|2rnišče|2zi|1álknafjarðarhreppur|0Ujae|1lcinj|1mm Şalāl|1trik|0Valandovo|3kas novads|3mieras Novads|2rakļānu novads|2silevo|1eles|3ika Polana|5e Lašče|2ntspils novads|2ržej|2stmannaeyjabær|4urbyggð|2včani|1idem|2keke|2nica|2pava|2saginas|2tanje|1odice|2jnik|2pnafjarðarhreppur|1ransko|3pčište|2hnika|1uzenica|0Wotho|3je|0Xankəndi|0Zagorje ob Savi|2vrč|1elenikovo|2ta|1reče|2novci|0Árneshreppur|1sahreppur|0Ísafjarðarbær|0Þingeyjarsveit|0Ādažu novads|0Čair †|2ška|1ešinovo-Obleševo|1renšovci|2na na Koroškem|3omelj|1učer-Sandevo|0Đà Nẵng|0Ķekavas novads|0Şirvan|0Šalovci|2vnik|1empeter-Vrtojba|2ntilj|4jernej|5ur|4rupert|3čur|1kocjan|3fja Loka|4ljica|1marje pri Jelšah|6ške Toplice|4tno ob Paki|8pri Litiji|1oštanj|1tip|2ore|1uto Orizari †|0Žabljak|2lec|1elezniki|3ino|2tale|1iri|3ovnica|1užemberk|0Gomel'skaja oblast'|1rodnenskaja oblast'|0Mahilioŭskaja voblasć|1inskaja oblast'|0Viciebskaja voblasć|0Guam|0Northern Mariana Islands|0Puerto Rico|0United States Minor Outlying Islands|0Virgin Islands, U.S.|0Polynésie française|0Saint-Martin|6Pierre-et-Miquelon|0Wallis-et-Futuna|0Nouvelle-Calédonie|0La Réunion|0Mayotte|0Terres australes françaises|0Guyane (française)|0Azad Jammu and Kashmir|1ndorra la Vella|0Charlotte|2rist Church|d Nichola Town|1larendon|0Encamp|1scaldes-Engordany|0Grenadines|0Hanover|0Kingston|0La Massana|0Manchester|0Ordino|0Portland|0Saint Andrew|c|c|c|8n|9e Sandy Point|6Catherine|6David|b|6Elizabeth|6George|c|c|c|c Basseterre|dGingerland|6James|b Windward|7ohn|a|a|a Capisterre|bFigtree|8seph|6Lucy|8ke|6Mark|9y|a Cayon|7ichael|6Patrick|d|8ul|a Capisterre|charlestown|7eter|b|b Basseterre|7hilip|6Thomas|c Lowland|dMiddle Island|2nt Julià de Lòria|0Trelawny|2inity Palmetto Point|0Westmoreland|0Al Buţnān|3Jabal al Akhḑar|cGharbī|5fārah|4ufrah|3Kufrah|3Marj|6qab|3Wāḩāt|1n Nuqāţ al Khams|1z Zāwiyah|0Darnah|0Ghāt|0Mişrātah|1urzuq|0Nālūt|0Sabhā|1urt|0Wādī al Ḩayāt|6sh Shāţi’|0Ţarābulus|0Agadir-Ida-Ou-Tanane|1ichi|1kita|1omori|0Bamingui-Bangoran|2sse-Kotto|1eyla|1offa|2ké|0Casablanca|1hiba|1oyah|0Dabola|2laba|1inguiraye|1ubréka|0Ehime|0Faranah|1orécariah|1ria|1ukui|4oka|4shima|1ès|0Gaoual|1ifu|1unma|2ékédou|0Haut-Mbomou|4e-Kotto|6Sangha / Mambéré-Kadéï|1iroshima|1okkaido|1yogo|0Ibaraki|1nezgane-Ait Melloul|1shikawa|1wate|0Kagawa|3oshima|2nagawa|3kan|1india|2ssidougou|1ochi|2ubia|3ndara|3roussa|1umamoto|1yoto|1émo-Gribingui|2rouané|0Labé|1obaye|2la|1élouma|0Macenta|2li|2mou|2ndiana|2rrakech|1bomou|1eknès|1ie|2yagi|4zaki|1ohammadia|1’diq-Fnideq|0Nagano|4saki|2na-Mambéré|2ra|1iigata|1zérékoré|0Oita|1kayama|2inawa|1mbella-Mpoko|1saka|1uaka|2ham-Pendé|2jda-Angad|0Pita|0Rabat|0Saga|2itama|2lé|1higa|3mane|3zuoka|1iguiri|1khirate-Témara|0Tanger-Assilah|1ochigi|2kushima|3yo|2ttori|2ugué|2yama|1élimélé|0Vakaga|1iangchan|0Wakayama|0Yamagata|5uchi|4nashi|1omou|0A Coruña [La Coruña]|1bra|1ceh|1dana|2ıyaman|1fyonkarahisar|1gusan del Norte|bSur|1klan|2saray|1l Haouz|4oceïma|3Lādhiqīyah|3Qunayţirah|3Ḩasakah|2acant*|3juela|2bacete|4y|3erta|3orz|2essandria|2ger|2mería|1masya|2nat Charoen|1n Giang|2cona|2g Thong|2hui Sheng|2kara|2naba|3obon|2talya|4nanarivo|3ique|3siranana|3werpen|1ousserd (EH)|1payao|1r Raqqah|2aba*|2dabīl|4han|2ezzo|2hangay|2temisa|3vin|1s Suwaydā'|2coli Piceno|2sa-Zag (EH-partial)|2ti|3urias|1ttapu|1urora|1vellino|1ydın|1zilal|2ua|4y|1ïn Defla|4Témouchent|1ğrı|0Ba|2at Dambang|2dajoz|4khshān|2ghlān|3mati|2hr el Ghazal|2li|3ochistan|3é|3ıkesir|2m|2nteay Mean Choăy|5n|3wa|2oruco|2rahona|3celona [Barcelona]|3letta-Andria-Trani|3tın|2s-Uélé|3ilan|2taan|4nes|5gas|3ha|3man|3na|2yan-Ölgiy|5hongor|3burt|2zèga|1elluno|2nevento|3gkulu|4o|4uela|6t|3slimane|2rgamo|3kane|3rechid|1iella|2lecik|3iran|2ngöl|2oko Nord|6Sud|2skra|2tlis|2zkaia|2é|1lida|1ocas del Toro|2hol|2kèo|2likhamxai|3u|3ívar|2rdj Badji Mokhtar|7ou Arréridj|3kou|2ugouriba|3ira|3jdour (EH)|3lemane|4gou|4kiemdé|3merdès|1rabant wallon|2escia|2indisi|3tish Columbia|1ua|2banza|2eng Kan|4os Aires|2jumbura Mairie|aRural|2kidnon|2lacan|4wayo|3gan|2rdur|3gos|3i Ram|3sa|3uri|1à Rịa - Vũng Tàu|1échar|2jaïa|2ni Abbès|5Mellal|1ình Dương|5Phước|5Thuận|5Định|1ādghīs|2myān|1ūshehr|1ạc Liêu|1ắc Giang|4Kạn|4Ninh|1ến Tre|0Cabinda|3o Delgado|2gayan|2kaudrove|2magüey|4rines Norte|aSur|3iguin|3pobasso|2nkuzo|3tabria|2o Bằng|2piz|2rchi|3tago|2serta|3telló*|2tamarca|4nduanes|5zaro|2vite|2ñar|1ebu|2ntral|7|7|7 Province|5o Sud|1hachoengsao|4o|3gang-do|3hār Maḩāl va Bakhtīārī|3i Nat|4yaphum|3mpasak|3nthaburi|3ri-Baguirmi|2efchaouen|2iang Mai|7Rai|3chaoua|3eti|3mborazo|5u|3riquí|2lef|2oiseul|3n Buri|2touka-Ait Baha|2ubut|3mphon|3ngcheongbuk-do|bnam-do|1ibitoke|2ego de Ávila|3nfuegos|2udad Real|1oclé|2lón|2mo|2nnaught|3stantine|2pperbelt|2rrientes|2senza|2tabato|3opaxi|1remona|2otone|1uando Cubango|4za-Norte|7Sul|2enca|2nene|4o|1à Mau|1áceres|2diz|1órdoba|0Dajabón|2r'ā|3han uul|3ién|2vao Occidental|7riental|6de Oro|8l Norte|aSur|2yr az Zawr|1enizli|1imashq|2nagat Islands|2yarbakır|1janet|2elfa|2ibloho|1ornod|5govĭ|1renthe|2iouch|1uarte|2ndgovĭ|1zavhan|1üzce|1āykundī|0East New Britain|5Sepik|4ern|7|7|7 Cape|8Highlands|8Province|8Samar|1dirne|1l Bayadh|3Hajeb|3Jadida|3Kelâa des Sraghna|3Meghaier|5niaa|3Oro|4ued|3Seibo|3Tarf|2azığ|2ías Piña|1nga|2nedi-Est|7Ouest|2tre Ríos|1rrachidia|2zincan|3urum|1s-Semara (EH-partial)|2kişehir|2meraldas|2paillat|2saouira|2tuaire|1şfahān|0Fahs-Anjra|2rāh|1ermo|3rara|1ianarantsoa|2guig|1levoland|1oggia|2rlì-Cesena|3mosa|1quih Ben Salah|1ree State|2osinone|2yslân|1ujian Sheng|1ārs|3yāb|0Galápagos|2ndaki|3su Sheng|3zourgou|2uteng|2ziantep|1elderland|1hardaïa|3znī|2ōr|1ia Lai|2puzkoa|2resun|3ona [Gerona]|2tega|1nagna|1olestān|2rontalo|2urma|2vĭ-Altay|5Sümber|1ranma|2oningen|3sseto|1uadalajara|6canal|3nacaste|4gdong Sheng|4tánamo|3yas|2elma|5im|3rcif|2imaras|3zhou Sheng|2lf|2éra|1yeonggi-do|6sangbuk-do|anam-do|1ümüşhane|1īlān|0Hadjer Lamis|2inan Sheng|5ut|2kkâri|2madān|3gyǒng-bukto|9namdo|2rare|2tay|3o Mayor|2ut-Katanga|5Lomami|5Ogooué|5Uélé|1ebei Sheng|2ilongjiang Sheng|2la|3mand|2nan Sheng|3tiy|2redia|3manas Mirabal|3rera|3āt|1olguín|2rmozgān|2uaphan|3et|2vd|1uambo|2bei Sheng|2elva|3sca|2nan Sheng|1wanghae-bukto|9namdo|1à Giang|3Nam|3Tĩnh|1òa Bình|1övsgöl|1ưng Yên|1ải Dương|1ậu Giang|0Idlib|1frane|2ugao|1lles Balears [Islas Baleares]|3izi|2ocos Norte|7Sur|3ilo|1mbabura|2peria|1n Guezzam|3Salah|2dependencia|2hambane|1oba|1sabel|6a|2ernia|2parta|1turi|1ğdır|0Jambi|2wa Barat|5Tengah|6imur|2én|1eollabuk-do|6nam-do|2rada|1iangsu Sheng|5xi Sheng|2jel|2lin Sheng|2waka|1owzjān|1ujuy|0Kadavu|3iogo|2eb|2hramanmaraş|2lasin|3imantan Barat|bSelatan|bTengah|cimur|bUtara|4nga|2mphaeng Phet|4ong Chaam|ahnang|8Spueu|8Thum|5t|2nchanaburi|3daal|5hār|3em|3gweonto|2oh Kong|2rabük|4man|3nali|3s|3uzi|2saï|5 Central|6Oriental|3tamonu|2yanza|3seri|1epulauan Bangka Belitung|aRiau|2rmān|6shāh|1hammouan|2enchela|2on Kaen|3rāsān-e Jonūbī|bRaẕavī|bShomālī|3uribga|2yber Pakhtunkhwa|2ánh Hòa|2émisset|3nifra|2ōst|2ūzestān|1ilis|2rundo|2é-Ntem|2ến Giang|1ocaeli|2hgīlūyeh va Bowyer Aḩmad|2mondjari|3pienga|2n Tum|3go Central|3ya|2rdestān|2shi|3si|2ulpélogo|3ritenga|4wéogo|1rabi|3cheh|1unaṟ|3duz|1wango|3zulu-Natal|2ilu|1énitra|3édougou|1ütahya|1ābul|2pīsā|1ırklareli|3ıkkale|3şehir|0L'Aquila|1a Altagracia|3Habana|3Pampa|3Rioja|4omana|3Spezia|3Vega|2c|2ghmān|4ouat|3una|2i Châu|2mpang|4hun|4ung|2nao del Norte|aSur|2rache|2s Palmas|4Tunas|2tina|2u|2âyoune (EH)|1ecce|4o|2inster|2ste|2yte|1iaoning Sheng|2mburg|3popo|3ón|2ttoral|2vorno|2ège|1leida [Lérida]|1odi|2ei|2gone-Occidental|8riental|2ja|2maiviti|4mi|2ng An|2p Buri|2restān|3oum|2s Ríos|4Santos|2uang Namtha|6phabang|1ualaba|3nda|3pula|2cca|2go [Lugo]|2mbini|2nda-Norte|6Sul|2saka|1ào Cai|1âm Đồng|1éraba|1ōgar|1ạng Sơn|0M'sila|1acerata|3uata|2dang|3hesh|3rid|2e Hong Son|2guindanao del Norte|gSur|2ha Sarakham|4janga|2i-Ndombe|2kamba|3ira-Ulawa|2laita|4mpa|4nge|4tya|3uku Utara|2nabí|3doul|3ica|6land|4ema|4sa|4toba|3tova|3us|2rdin|3induque|3kazī|3ía Trinidad Sánchez|2sbate|3cara|3honaland Central|cEast|cWest|3sa-Carrara|3vingo|2tabeleland North|dSouth|4nzas|3era|2yabeque|3o-Kebbi-Est|bOuest|1endoza|2rsin|1idelt|3lands|2la|3ne Bay|2ndoro Occidental|9riental|2samis Occidental|9riental|1odena|2ndol Kiri|3gala|3señor Nouel|3te Cristi|6Plata|3za e Brianza|2robe|4na Santiago|2staganem|2uhoun|3lay Yacoub|3ntain Province|2xico|2yen-Chari|6Ogooué|1pumalanga|1uchinga|2kdahan|2nster|2ramvya|3cia|2yinga|2ğla|2ş|1waro|1álaga|1édiouna|3éa|1āzandarān|0Naama|2dor|3roga and Navosa|2farroa*|2houri|2itasiri|2khon Nayok|7Pathom|8hanom|7Ratchasima|7Sawan|8i Thammarat|2m Định|3entenga|3ibe|3osi|3pula|3ur|2n|3garhār|2po|2rathiwat|2yala|1egros Occidental|8riental|2uquén|2vşehir|2w Brunswick|4Ireland|3foundland and Labrador|1ghệ An|2ounié|3zi|1iassa|2nh Bình|5Thuận|2ğde|1ong Bua Lam Phu|5Khai|3thaburi|2ord-Brabant|6Holland|2rd-Kivu|5Ubangi|3te|4h Central Province|6Western Province|5-West|aern|5ern|8|8|8|8 Cape|9Ireland|9Province|9Samar|2uaceur|3mbiel|2va Scotia|4ra|1ueva Ecija|6Vizcaya|2oro|2sa Tenggara Barat|eTimur|1yanga|1īmrōz|1ūristān|0Ogooué-Ivindo|7Lolo|7Maritime|1ntario|1ost-Vlaanderen|1ran|2du|2ellana|2hon|2istano|1smaniye|1tdar Mean Chey|1uaddaï|3rgla|4zazate|2britenga|2dalan|3ômxai|2ed Ed-Dahab (EH)|3zzane|2led Djellal|2m el Bouaghi|2rense [Orense]|1verijssel|0P'yǒngan-bukto|9namdo|1adova|2ilin|2ktiyā|4īkā|2lawan|3encia|2mpanga|2namá|6 Oeste|3gasinan|3jshayr|2pua Barat|b Daya|6Pengunungan|6Selatan|6Tengah|2rma|3wān|2ssoré|3taza|2thum Thani|3tani|2via|1edernales|2ravia|3ugia|2saro e Urbino|3cara|1hangnga|3tthalung|3yao|2etchabun|9ri|2ichit|3tsanulok|2ra Nakhon Si Ayutthaya|4e|2uket|2ôngsali|2ú Thọ|4Yên|1iacenza|2chincha|2nar del Río|2sa|3toia|1oni|3tevedra [Pontevedra]|2tenza|2usaat|1rachin Buri|5uap Khiri Khan|3to|2eah Sihanouk|6Vihear|3y Veaeng|2ince Edward Island|1uerto Plata|2njab|3tarenas|1énama|0Qazvīn|1inghai Sheng|1om|1uebec|3zon|2irino|2ảng Bình|6Nam|7gãi|7inh|6Trị|0Ra|2nong|2tchaburi|2venna|2yong|1eggio Emilia|2hamna|2lizane|2nnell and Bellona|2wa|1iau|2eti|2mini|2zal|3e|1oi Et|2mblon|2tanak Kiri|2vigo|1umonge|2tana|2yigi|1yanggang-do|1īf Dimashq|0Sa Kaeo|2baragamuwa Province|2karya|3on Nakhon|2lamanca|6t|4van|3erno|3ta|2mangān|5á|4r|3sun|3ut Prakan|6Sakhon|7ongkhram|2n Cristóbal|4José de Ocoa|5uan|4Luis|4Pedro de Macorís|3cti Spíritus|3guié|3kuru|3ma|5tenga|3ta Cruz de Tenerife|6Elena|6Fe|4iago|8 Rodríguez|9de Cuba|bl Estero|4o Domingo|d de los Tsáchilas|2r-e Pul|3aburi|4ngani|2skatchewan|3sari|2tun|2vannakhét|3ona|2ïda|1efrou|2govia|2lenge|2mnān|2rua|2ttat|2villa|1haanxi Sheng|3ndong Sheng|4xi Sheng|2éfa|1i Sa Ket|2chuan Sheng|2di Bel Abbès|7nnour|5Ifni|5Kacem|5Slimane|2em Reab|3na|2irt|2la|2ndh|3g Buri|3op|2quijor|2ssili|2vas|1kikda|1ofala|2ndrio|3gkhla|2ria|3sogon|2uk Ahras|3m|3rou|3th Cotabato|5ern|8|8|8 Highlands|9Leyte|9Province|1toĕng Trêng|1ucumbíos|2d Sardegna|3-Kivu|4Ubangi|3urpashchim|2khothai|2l|3awesi Barat|9Selatan|9Tengah|dgara|9Utara|3tan Kudarat|3u|2matera Barat|9Selatan|9Utara|2phan Buri|2rat Thani|3igao del Norte|cSur|4n|1vaay Rieng|1ánchez Ramírez|1éno|2tif|1óc Trăng|1ühbaatar|1īstān va Balūchestān|1ơn La|0Taakaev|2féa|2ilevu|3wan Sheng|2k|3hār|2manrasset|2n-Tan (EH-partial)|3djilé|3ganyika|2ounate|4rirt|2poa|2ranto|3faya (EH-partial)|3lac|3oudannt|3ragona [Tarragona]|2ta|2wi-Tawi|2za|1bong Khmum|1ehrān|2kirdağ|2motu|2ramo|3ni|3uel|2te|1hanh Hóa|2ái Bình|5Nguyên|2ừa Thiên-Huế|1iaret|2besti|2erra del Fuego|2mimoun|2ndouf|3ghir|2paza|2ssemsilt|2zi Ouzou|3nit|2ền Giang|1lemcen|1oamasina|2kat|2ledo|3iara|2rba|2uggourt|1rabzon|3ng|3t|2eviso|2à Vinh|1shopo|3uapa|1ucumán|2nceli|3gurahua|2y|3ên Quang|1ây Ninh|1ébessa|2touan|1öv|0Ubon Ratchathani|1don Thani|1lster|1ruzgān|1thai Thani|2recht|2taradit|1va Province|2s|1íge|1şak|0Valencia|3ladolid|3verde|2n|2rese|1eraguas|3bano-Cusio-Ossola|3celli|3ona|1ibo Valentia|2cenza|2lla Clara|4e de Ndjamena|2terbo|1laams-Brabant|1ĩnh Long|5Phúc|0Wadi Fira|2rdak|1ele-Nzas|2st New Britain|5Sepik|4-Vlaanderen|4ern|7|7|7|7 Cape|8Highlands|8Province|1oleu-Ntem|0Xaignabouli|3sômboun|1iangkhouang|1ékong|0Yagha|2la|3ova|2sothon|2tenga|2zd|1oussoufia|2zgat|1unnan Sheng|1ên Bái|0Zagora|2ire|2mbales|4oanga Sibugay|adel Norte|eSur|4ézia|3ora|6 Chinchipe|2njān|2ragoza|1eeland|1hejiang Sheng|1iro|1ondoma|3guldak|2undwéogo|1uid-Holland|1ābul|0Ávila|0Çanakkale|3kırı|1orum|0Équateur|0Ömnögovĭ|1vörhangay|0Āz̄ārbāyjān-e Ghārbī|eShārqī|0Điện Biên|1ắk Lắk|4Nông|1ồng Nai|5Tháp|0Īlām|0İstanbul|1zmir|0Şanlıurfa|1ırnak|0Ţarţūs|0Ḩalab|2māh|1imş|0Fontvieille|0Jardin Exotique|0La Condamine|3Gare|3Source|2rvotto|0Malbousquet|1onaco-Ville|3eghetti|3te-Carlo|2ulins|0Port-Hercule|0Saint-Roman|5e-Dévote|1pélugues|0Vallon de la Rousse|0Astara|1ğcabədi|2dam|4ş|2stafa|3u|0Babək|2lakən|1eyləqan|1iləsuvar|1ərdə|0Culfa|1əbrayıl|2lilabad|0Daşkəsən|0Füzuli|0Goranboy|1öygöl|3çay|1ədəbəy|0Hacıqabul|0Kürdəmir|1ǝngǝrli|1əlbəcər|0Laçın|1erik|1ənkəran|0Masallı|0Neftçala|0Ordubad|1ğuz|0Qax|2zax|1obustan|1uba|4dlı|2sar|1əbələ|0Saatlı|2birabad|2lyan|2mux|1iyəzən|1ədərək|0Tovuz|1ərtər|0Ucar|0Xaçmaz|1ocalı|4vənd|1ızı|0Yardımlı|1evlax|0Zaqatala|1əngilan|2rdab|0İmişli|1smayıllı|0Şabran|2hbuz|2maxı|1uşa|1əki|2mkir|2rur|0'Asīr|0//Karas|0Abajskaja oblast’|2ruzzo|1damaoua|2rar|1gadez|1hafo|3l|1isén del General Carlos Ibañez del Campo|1kmolinskaja oblast'|2tjubinskaja oblast'|1l Bāḩah|3Madīnah al Munawwarah|3Qaşīm|3Ḩudūd ash Shamālīyah|2i Sabieh|2matinskaja oblast'|1marumayu|1ncash|2dijon|2sabā|2tofagasta|1purimaq|1r Riyāḑ|2arat|2equipa|2ica y Parinacota|2mavir|2ta|2usha|1sh Sharqīyah|3anti|2saba|1tacama|2yrauskaja oblast'|1uckland|2sturland|2tonomous Region in Muslim Mindanao (ARMM)|1wdal|1yacucho|2eyarwady|0Bafatá|2go|2kool|2lkan|2naadir|3skobystrický kraj|2ri|4ma-Waini|2silicata|2tken|3ys Qazaqstan oblysy|2y|3 of Plenty|1icol (Region V)|2obío|3mbo|1olama / Bijagós|2no|4 East|2ucle du Mouhoun|1rakna|3tislavský kraj|2uxelles-Capitale, Région de|1uxoro|1éni Mellal-Khénifra|0Cacheu|2gayan Valley (Region II)|2jamarca|2labarzon (Region IV-A)|5ria|2mpania|2nterbury|2raga (Region XIII)|2sablanca-Settat|3cades|1entral|7 Luzon (Region III)|8Region|8Visayas (Region VII)|7e|5e|6-Est|7Nord|7Ouest|7Sud|1herkaska oblast|4nihivska oblast|6vetska oblast|2uyskaya oblast'|1ibao Nordeste|9oeste|9te|6Sur|1oast|2quimbo|2rdillera Administrative Region (CAR)|2uva-Tabaquite-Talparo|1usco|2yuni-Mazaruni|0Dakar|3hla-Oued Ed-Dahab (EH)|5et Nouâdhibou|2r es Salaam|2vao (Region XI)|2şoguz|1ebubawi K’eyyĭḥ Baḥri|2merara-Mahaica|1iego Martin|2ffa|2khil|2ourbel|1nipropetrovska oblast|1odoma|2netska oblast|2sso|1râa-Tafilalet|1zhalal-Abadskaya oblast'|0East|4 Berbice-Corentyne|4ern|7 Visayas (Region VIII)|1l Callao|3Valle|1milia-Romagna|1nriquillo|1rongo|1ssequibo Islands-West Demerara|2t|1telä-Karjala|6Pohjanmaa|6Savo|0Far North|3g‘ona|2tick|1ès-Meknès|0Gabú|2lguduud|2o|2sh-Barka|1edo|2ita|2ġark'unik'|1isborne|1orgol|1reater Accra|8Wellington|1uelmim-Oued Noun (EH-partial)|2idimaka|2ria|0Hardap|2uts-Bassins|2wke's Bay|1erêm-î Kurdistan|1hohho|1iguamo|2iraan|1odh ech Chargui|6l Gharbi|2vedstaden|1uancavelica|2nin|2ánuco|1öfuðborgarsvæði|0Ica|1locos (Region I)|1mereti|1nchiri|1ringa|1ssyk-Kul'skaja oblast'|1vano-Frankivska oblast|0Jihomoravský kraj|4český kraj|2zzax|1ubbada Dhexe|8Hoose|1āzān|0K'akheti|1affrine|2gera|2inuu|2nta-Häme|2olack|2ra|4gandinskaja oblast'|3lovarský kraj|2tavi|2vango East|8West|2yes|1eski-Pohjanmaa|6Suomi|1harkivska oblast|3tlon|2ersonska oblast|2melnytska oblast|2omas|1idal|2goma|2limanjaro|2rovohradska oblast|1olda|2stanajskaja oblast'|2tayk'|2ulikoro|2šický kraj|1raj Vysočina|2álovéhradecký kraj|1unene|1vemo Kartli|1yivska oblast|2menlaakso|2zylordinskaja oblast'|1édougou|0L'Oriental|1a Araucanía|2mbayeque|2ndskapet Åland|2ppi|2zio|2âyoune-Sakia El Hamra (EH-partial)|1ebap|1iberecký kraj|5tador General Bernardo O'Higgins|2guria|2ma|2ndi|2ttoral|1ombardia|2reto|2s Lagos|2uga|2ṙi|1ubombo|2hanska oblast|1vivska oblast|0Madre de Dios|2gallanes|3way|2haica-Berbice|2kkah al Mukarramah|2nawatū-Whanganui|3dalay|3gghystaū oblysy|3yara|3zini|2ra|4di|3che|3itime (Région)|3lborough|3rakech-Safi|3y|2tam|2ule|2yaro-Rio Claro|1beya|1idtjylland|2maropa (Region IV-B)|1olise|2pti|2quegua|2ravskoslezský kraj|3ogoro|1tskheta-Mtianeti|2wara|1udug|1wanza|1ykolaivska oblast|1énaka|0Najrān|2mangan|2ryn|2tional Capital Region|2voiy|1elson|1itriansky kraj|1jombe|1ordjylland|3th|5 East|5-West|5ern|8 Mindanao (Region X)|9Region|5land|3ðurland eystra|bvestra|2uakchott Nord|bOuest|bSud|1ugaal|0Obock|1deska oblast|1hangwena|1io|1lomoucký kraj|1maheke|2usati|1sh|3ana|3ikoto|1tago|2i|2jozondjupa|1zama|0Pardubický kraj|2sco|2vlodar oblysy|1emba North|6South|2nal-Debe|1iemonte|2rkanmaa|2ura|1lateau-Central|7x|2zeňský kraj|1ohjanmaa|4ois-Karjala|8Pohjanmaa|8Savo|2ltavska oblast|2meroon-Supenaam|2taro-Siparuni|1rešovský kraj|2inces Town|1uglia|2no|1äijät-Häme|0Qashqadaryo|1uinara|0Rabat-Salé-Kénitra|2ch'a-Lechkhumi-Kvemo Svaneti|1egión Metropolitana de Santiago|1ivnenska oblast|1ukwa|2vuma|1égion Continentale|7Insulaire|0Sagaing|2hel|2int-Louis|2marqand|3egrelo-Zemo Svaneti|3tskhe-Javakheti|2n Juan-Laventille|4Martin|3aag|3gre Grande|2takunta|2vanes|5nah|1emienawi K’eyyĭḥ Baḥri|2vero-Kazahstanskaja oblast'|1habeellaha Dhexe|cHoose|2ida Kartli|3nyanga|3selweni|2yghys Qazaqstan oblysy|1ikasso|2miyu|2ngida|2paria|2rdaryo|1jælland|1occsksargen (Region XII)|2ngwe|2ol|2uss-Massa|3th|5ern Region|5land|1tředočeský kraj|1ud-Ouest|2ghd|2mska oblast|2rxondaryo|2ðurland|5nes|1yddanmark|2unik'|1édhiou|2gou|0Tabora|3ūk|2cna|2djourah|2gant|2houa|2las|2mbacounda|2nga|4er-Tétouan-Al Hoceïma|3intharyi|2oudénit|2ranaki|4pacá|2sman|2vuš|1ernopilska oblast|1hiès|1illabéri|2ris Zemmour|1ogdheer|2mbali|4ouctou|2scana|3hkent|1rarza|2enčiansky kraj|2navský kraj|1umbes|2napuna-Piarco|2rkestankaya oblast'|0Ucayali|1lytauskaja oblast’|1mbria|1pper Demerara-Berbice|6East|6Takutu-Upper Essequibo|6West|1usimaa|0Valdesia|3paraíso|2rsinais-Suomi|2yoć Jor|1eneto|2stfirðir|4urland|1innytska oblast|1laams Gewest|1olta|3ynska oblast|0Waikato|1est|4 Coast|4ern|7 North|8Visayas (Region VI)|1oqooyi Galbeed|0Xorazm|0Yangon|1uma|0Zakarpatska oblast|2mbezi|4oanga Peninsula (Region IX)|2nzibar North|9South|9West|2porizka oblast|1hambyl oblysy|2etisū oblysy|2ytomyrska oblast|1iguinchor|2nder|1línský kraj|0wallonne, Région|0Ñuble|0Ústecký kraj|0Širak|0Žilinský kraj|0Ḩā'il|0Amara|0Benshangul-Gumaz|0Gambela Peoples|0Harari People|0Oromia|0Sidama|1omali|2uthern Nations, Nationalities and Peoples|5west Ethiopia Peoples|0Tigrai|0Altaj, Respublika|1vtonomna Respublika Krym|0Bashkortostan, Respublika|1urjatija, Respublika|0Chechenskaya Respublika|2uvashskaya Respublika|0Dagestan, Respublika|0Hakasija, Respublika|0Ingushetiya, Respublika|0Kabardino-Balkarskaja Respublika|2lmykija, Respublika|2rachayevo-Cherkesskaya Respublika|3elija, Respublika|1omi, Respublika|0Marij Èl, Respublika|1ordovija, Respublika|0Qoraqalpog‘iston Respublikasi|0Saha, Respublika|1evernaja Osetija, Respublika|0Tatarstan, Respublika|1yva, Respublika|0Udmurtskaja Respublika|0Anija|2tsla|0Elva|0Haljala|2rku|1äädemeeste|0Järva|1õelähtme|2geva|2hvi|0Kadrina|2mbja|2nepi|2stre|1ehtna|1ihnu|2ili|1ohila|2se|1uusalu|0Luunja|1ääne-Harju|6Nigula|5ranna|1üganuse|0Muhu|2lgi|2stvee|1ärjamaa|0Nõo|0Otepää|0Peipsiääre|1õhja-Pärnumaa|6Sakala|2ltsamaa|3va|0Raasiku|2e|2pla|1uhnu|1äpina|1õuge|0Saarde|2ku|2ue|1etomaa|0Tapa|2rtu|1oila|2ri|1õrva|1üri|0Valga|1iimsi|2ljandi|2nni|2ru-Nigula|1ormsi|1äike-Maarja|0Ágion Óros|0Phatthaya|0Macao SAR|0Oekusi-Ambenu|0Seoul-teukbyeolsi|0Chatham Islands Territory|0Bonaire|0Isla de la Juventud|0Kaohsiung|0New Taipei|0Saba|1int Eustatius|0Taichung|3nan|3pei|2oyuan|0Yogyakarta|0Sejong|0Jeju-teukbyeoljachido|0Abia|1cre|1damawa|1guascalientes|1imeliik|2rai|1kwa Ibom|1labama|3goas|3ska|1mapá|3zonas|1nambra|2dhra Pradesh|2gaur|2zoátegui|1pure|1ragua|2izona|2kansas|2unāchal Pradesh|1ssam|0Bahia|2ja California|f Sur|2rinas|2uchi|2yelsa|1enue|1ihār|1lue Nile|1olívar|2rno|0California|2mpeche|2rabobo|1eará|2ntral Darfur|8Equatoria|1hhattīsgarh|2iapas|3huahua|3n|2uuk|1oahuila de Zaragoza|2jedes|2lima|3orado|2nnecticut|1ross River|0Delaware|3ta|5 Amacuro|1urango|0East Darfur|4ern Equatoria|1bonyi|1do|1kiti|1nugu|1spírito Santo|0Falcón|0Gedaref|2orgia|2zira|1oa|2iás|2mbe|1uanajuato|2errero|2jarāt|2árico|0Haryāna|2tohobei|2waii|1idalgo|2māchal Pradesh|0Idaho|1llinois|1mo|1ndiana|1owa|0Jalisco|1hārkhand|1igawa|1ohor|2nglei|0Kachin|2duna|2no|3sas|2rnātaka|2ssala|2tsina|2yah|4ngel|3in|1ebbi|2dah|2lantan|2ntucky|2rala|1hartoum|1ogi|2ror|2srae|1wara|1ärnten|0La Guaira|2gos|2kes|2ra|1ouisiana|0Madhya Pradesh|2hārāshtra|2ine|2nipur|2ranhão|3yland|2ssachusetts|2to Grosso|b do Sul|1eghālaya|2laka|3ekeok|1ichigan|4oacán de Ocampo|2nas Gerais|3nesota|2randa|2ssissippi|4ouri|2zoram|1on|3agas|3tana|2relos|1érida|2xico|0Nasarawa|2yarit|1ebraska|2geri Sembilan|2vada|3is|2w Hampshire|4Jersey|4Mexico|4South Wales|4York|1garaard|4chelong|4dmau|3tpang|2chesar|2eremlengui|2iwal|1iederösterreich|2ger|1orth Carolina|6Dakota|8rfur|6Kordofan|5ern|8 Bahr el Ghazal|1ueva Esparta|4o León|1āgāland|0Oaxaca|1berösterreich|1disha|1gun|1hio|1klahoma|1ndo|1regon|1sun|1yo|0Pahang|2raná|4íba|1eleliu|2nnsylvania|2rak|3lis|3nambuco|1iauí|1lateau|1ohnpei|2rtuguesa|1uebla|2lau Pinang|0Queensland|3rétaro|2intana Roo|0Rakhine|1ed Sea|1hode Island|1io Grande do Norte|eSul|4de Janeiro|2ver Nile|5s|1ondônia|2raima|1ājasthān|0Sabah|2int Kitts|2lzburg|2n Luis Potosí|2rawak|1elangor|2nnar|2rgipe|1han|1ikkim|2naloa|1okoto|2nora|3sorol|2uth Australia|6Carolina|6Dakota|8rfur|6Kordofan|1teiermark|1ucre|1ão Paulo|0Tabasco|2maulipas|3il Nādu|2raba|2smania|1elangāna|2nnessee|2rengganu|2xas|1irol|1laxcala|1ocantins|1ripura|2ujillo|1áchira|0Unity|1pper Nile|1tah|2tar Pradesh|5ākhand|0Veracruz de Ignacio de la Llave|3mont|1ictoria|2rginia|1orarlberg|0Warrap|2shington|1est Bengal|5Darfur|5Kordofan|5Virginia|4ern Australia|8Bahr el Ghazal|8Equatoria|1hite Nile|1ien|2sconsin|1yoming|0Yap|2racuy|1obe|1ucatán|0Zacatecas|2mfara|1ulia|0Jelgava|1ūrmala|0Liepāja|0Rēzekne|1īga|0Ventspils|0Stînga Nistrului, unitatea teritorială din|0Northern Territory|5west Territories|1unavut|0Yukon|0Lobatse|0Selibe Phikwe|1owa Town|0Funafuti|0Cumbria|0Derbyshire|2von|1orset|0East Sussex|1ssex|0Gloucestershire|0Hampshire|1ertfordshire|0Kent|0Lancashire|1eicestershire|1incolnshire|0Norfolk|3th Yorkshire|2ttinghamshire|0Oxfordshire|0Somerset|1taffordshire|1uffolk|2rrey|0Warwickshire|1est Sussex|1orcestershire|0Chandīgarh|0Delhi|1ādra and Nagar Haveli and Damān and Diu|0Jammu and Kashmīr|0Ladākh|2kshadweep|0Nay Pyi Taw|0Puducherry|0Bath and North East Somerset|1edford|1lackburn with Darwen|5pool|3enau Gwent|1ournemouth, Christchurch and Poole|1racknell Forest|2idgend [Pen-y-bont ar Ogwr GB-POG]|3ghton and Hove|3stol, City of|1uckinghamshire|0Caerphilly [Caerffili GB-CAF]|2rdiff [Caerdydd GB-CRD]|3marthenshire [Sir Gaerfyrddin GB-GFY]|1entral Bedfordshire|2redigion [Sir Ceredigion]|1heshire East|9West and Chester|1onwy|2rnwall|0Darlington|1enbighshire [Sir Ddinbych GB-DDB]|2rby|1urham, County|0East Riding of Yorkshire|0Flintshire [Sir y Fflint GB-FFL]|0Gwynedd|0Halton|2rtlepool|1erefordshire|0Isle of Wight|4s of Scilly|0Kingston upon Hull|0Leicester|1uton|0Medway|2rthyr Tydfil [Merthyr Tudful GB-MTU]|1iddlesbrough|2lton Keynes|1onmouthshire [Sir Fynwy GB-FYN]|0Neath Port Talbot [Castell-nedd Port Talbot GB-CTL]|2wport [Casnewydd GB-CNW]|1orth East Lincolnshire|6Lincolnshire|6Northamptonshire|6Somerset|5umberland|2ttingham|0Pembrokeshire [Sir Benfro GB-BNF]|2terborough|1lymouth|1ortsmouth|2wys|0Reading|2dcar and Cleveland|1hondda Cynon Taff [Rhondda CynonTaf]|1utland|0Shropshire|1lough|1outh Gloucestershire|5ampton|5end-on-Sea|1tockton-on-Tees|3ke-on-Trent|1wansea [Abertawe GB-ATA]|2indon|0Telford and Wrekin|1hurrock|1orbay|3faen [Tor-faen]|0Vale of Glamorgan, The [Bro Morgannwg GB-BMG]|0Warrington|1est Berkshire|5Northamptonshire|1iltshire|2ndsor and Maidenhead|1okingham|1rexham [Wrecsam GB-WRC]|0York|0Niamey|0Celje|0Keila|1ohtla-Järve|2per|1ranj|2ško|0Ljubljana|1oksa|0Maardu|2ribor|1urska Sobota|0Narva|5-Jõesuu|1ova Gorica|3o Mesto|0Paide|1tuj|1ärnu|0Rakvere|0Sillamäe|1lovenj Gradec|0Tallinn|0Velenje|1õru|0Kujawsko-Pomorskie|0Lubelskie|3uskie|0Mazowieckie|2łopolskie|0Opolskie|0Podkarpackie|3laskie|2morskie|0Warmińsko-Mazurskie|1ielkopolskie|0Zachodniopomorskie|0Łódzkie|0Śląskie|1więtokrzyskie|0Tobago","sep":"|"},{"d":"Parish|Emirate|Province|Dependency|County|Region|City|State|Territory|Rayon|Municipality|Autonomous republic|Entity|District|Division|Governorate|Department|Special municipality|Island|Town|Oblast|Prefecture|Commune|Economic prefecture|Canton|Autonomous district|Autonomous region|Special administrative region|Capital district|Geographical region|Capital city|Land|Rural municipality|Urban municipality|Autonomous community|Autonomous city in north africa|Administration|Regional state|Metropolitan department|Metropolitan collectivity with special status|Overseas departmental collectivity|Overseas unique territorial collectivity|Metropolitan region|Overseas collectivity|Council area|Unitary authority|London borough|Metropolitan district|Two-tier county|Country|Administrative region|City with county rights|Geographical unit|Union territory|Free municipal consortium|Metropolitan city|Autonomous province|Decentralized regional entity|Group of islands (20 inhabited islands)|Special city|Special self-governing province|District municipality|City municipality|State city|Popularate|Quarter|Chain (of islands)|Local council|Administrative atoll|Federal territory|Capital territory|Arctic region|Indigenous region|Pakistan administered area|Voivodship|Republic|Administrative territory|Autonomous city|Geographical entity|Borough|Island council|Islands, groups of islands|Outlying area|Administrative precinct|Area|Autonomous municipality|Autonomous sector|Autonomous territorial unit|Capital|City corporation|District with special status|Districts under republic administration|European collectivity|Federal capital territory|Federal dependency|Federal district|Federal entity|Metropolitan administration|Overseas collectivity with special status|Overseas territory|Self-governed part|Special administrative city|Special island authority|Special region|Special self-governing city|Territorial unit|Town council|Urban community|Ward","r":"0*1,1*1,2*1,0*6,3*1,4*1,5*1,6*1,2*7,7*1,8*1,9*1,a*3,b*1,a*2,c*1,0*4,d*9,e*1,2*2,5*2,2*1,d*2,f*1,g*4,h*3,7*3,i*1,d*2,j*1,d*4,k*1,d*1,l*1,m*1,n*2,g*1,o*2,p*1,d*1,5*2,q*1,r*1,g*1,s*1,g*1,2*1,t*1,u*1,d*1,v*1,0*3,2*1,w*1,x*1,w*3,x*2,w*1,f*1,5*2,y*2,z*1,2*1,y*1,2*1,10*1,11*1,e*3,12*1,13*1,14*1,15*1,16*1,17*1,18*1,19*1,1a*1,1b*1,1c*1,1d*1,1b*1,1e*7,g*1,1f*1,4*1,1g*1,2*2,1h*1,7*1,1i*1,1j*1,1k*1,1l*1,4*1,1m*1,1n*1,1o*1,2*1,d*1,4*1,1p*1,1q*1,1r*1,1s*1,2*1,1t*1,d*1,1u*1,1v*1,1w*1,d*1,1x*1,2*2,1y*1,1z*1,20*1,5*1,2*1,21*1,22*1,d*1,23*1,24*1,25*1,5*1,d*1,26*1,2*1,27*1,28*1,6*1,4*1,29*1,2a*1,7*1,6*1,2b*1,10*1,1w*i,2b*2,1e*1n,24*8,1z*1,2c*1,25*1,z*1,y*e,p*5,2d*1,1k*3,q*h,b*2,2e*1,2f*1,27*2,o*10,2g*1,u*3,s*2,1y*2,1u*1,6*u,2h*1,1q*6,1f*m,m*b,18*v,1d*5,4*5o,1l*3,g*5x,3*7,d*h9,1p*17,2i*1,2j*1,e*i,1*6,c*1,2k*1,2l*1,2m*1,2n*1,2o*1,1x*2,1i*5,26*2,t*5,1g*6,f*42,1m*2,20*3,i*3,28*6,29*8,v*f,1v*1v,1a*v,2p*1,1j*l,13*2,12*2m,1b*y,16*b,a*e8,k*5,2a*5,17*4,2q*1,14*2,2r*1,15*1,21*1,0*1o,1s*l,l*2z,2*w6,1t*g,9*1t,5*cx,11*a,23*m,w*1n,2s*1,2t*1,r*2,1n*1,2u*1,h*a,2v*1,2w*1,1o*1,7*7l,1r*6,2x*1,8*4,j*3,2y*1,1c*o,1h*8,19*27,2z*1,x*o,22*f,30*1","sep":"|"}]},{"id":"world-cities","columns":["country","region"],"n":34163,"cols":[{"d":"Andorra|United Arab Emirates|Afghanistan|Albania|Armenia|Angola|Argentina|American Samoa|Austria|Australia|Aruba|Azerbaijan|Bosnia and Herzegovina|Bangladesh|Belgium|Burkina Faso|Bulgaria|Bahrain|Burundi|Benin|Brunei Darussalam|Bolivia, Plurinational State of|Brazil|Bahamas|Bhutan|Botswana|Belarus|Belize|Canada|Congo, The Democratic Republic of the|Central African Republic|Congo|Switzerland|Côte d'Ivoire|Chile|Cameroon|China|Colombia|Costa Rica|Cuba|Cabo Verde|Curaçao|Cyprus|Czechia|Germany|Djibouti|Denmark|Dominica|Dominican Republic|Algeria|Ecuador|Estonia|Egypt|Western Sahara|Eritrea|Spain|Ethiopia|Finland|Fiji|France|Gabon|United Kingdom|Georgia|French Guiana|Ghana|Gambia|Guinea|Guadeloupe|Equatorial Guinea|Greece|Guatemala|Guam|Guinea-Bissau|Guyana|Hong Kong|Honduras|Croatia|Haiti|Hungary|Indonesia|Ireland|Israel|India|Iraq|Iran, Islamic Republic of|Iceland|Italy|Jamaica|Jordan|Japan|Kenya|Kyrgyzstan|Cambodia|Comoros|Korea, Democratic People's Republic of|Korea, Republic of|Kuwait|Cayman Islands|Kazakhstan|Lao People's Democratic Republic|Lebanon|Saint Lucia|Sri Lanka|Liberia|Lesotho|Lithuania|Luxembourg|Latvia|Libya|Morocco|Monaco|Moldova, Republic of|Montenegro|Madagascar|Marshall Islands|North Macedonia|Mali|Myanmar|Mongolia|Macao|Martinique|Mauritania|Montserrat|Malta|Mauritius|Malawi|Mexico|Malaysia|Mozambique|Namibia|New Caledonia|Niger|Nigeria|Nicaragua|Netherlands|Norway|Nepal|New Zealand|Oman|Panama|Peru|French Polynesia|Papua New Guinea|Philippines|Pakistan|Poland|Puerto Rico|Palestine, State of|Portugal|Paraguay|Qatar|Réunion|Romania|Serbia|Russian Federation|Rwanda|Saudi Arabia|Solomon Islands|Sudan|Sweden|Singapore|Slovenia|Slovakia|Sierra Leone|Senegal|Somalia|Suriname|South Sudan|El Salvador|Syrian Arab Republic|Eswatini|Turks and Caicos Islands|Chad|Togo|Thailand|Tajikistan|Timor-Leste|Turkmenistan|Tunisia|Türkiye|Trinidad and Tobago|Taiwan, Province of China|Tanzania, United Republic of|Ukraine|Uganda|United States|Uruguay|Uzbekistan|Saint Vincent and the Grenadines|Venezuela, Bolivarian Republic of|Virgin Islands, U.S.|Viet Nam|Kosovo|Yemen|Mayotte|South Africa|Zambia|Zimbabwe|Anguilla|Antigua and Barbuda|Barbados|Bermuda|Bonaire, Sint Eustatius and Saba|Christmas Island|Cocos (Keeling) Islands|Cook Islands|Falkland Islands (Malvinas)|Faroe Islands|French Southern Territories|Gibraltar|Greenland|Grenada|Guernsey|Holy See (Vatican City State)|Isle of Man|Jersey|Kiribati|Liechtenstein|Maldives|Micronesia, Federated States of|Nauru|Niue|Norfolk Island|Northern Mariana Islands|Palau|Pitcairn|Saint Barthélemy|Saint Helena, Ascension and Tristan da Cunha|Saint Kitts and Nevis|Saint Martin (French part)|Saint Pierre and Miquelon|Samoa|San Marino|Sao Tome and Principe|Seychelles|Sint Maarten (Dutch part)|South Georgia and the South Sandwich Islands|Svalbard and Jan Mayen|Tonga|Tuvalu|Vanuatu|Virgin Islands, British|Wallis and Futuna|Åland Islands","r":"0*1,1*5,2*g,3*7,4*8,5*h,6*o,7*1,8*8,9*8,a*4,b*5,c*2,d*8,e*3,f*d,g*g,h*3,i*3,j*c,k*3,l*7,m*r,n*2,o*1,p*5,q*6,r*2,s*9,t*o,u*8,v*8,w*h,x*c,y*f,z*7,10*v,11*r,12*7,13*f,14*1,15*2,16*4,17*e,18*g,19*2,1a*5,1b*1,1c*b,1d*19,1e*f,1f*3,1g*r,1h*4,1i*3,1j*g,1k*a,1l*g,1m*2,1n*d,1o*5,1p*4,1q*6,1r*1,1s*b,1t*3,1u*8,1v*1,1w*2,1x*c,1y*m,1z*1,20*2,21*1,22*h,23*e,24*5,25*4,26*k,27*11,28*3,29*5,2a*x,2b*i,2c*v,2d*2,2e*j,2f*3,2g*8,2h*1b,2i*z,2j*5,2k*e,2l*1,2m*b,2n*e,2o*4,2p*1,2q*g,2r*4,2s*7,2t*1,2u*8,2v*5,2w*2,2x*6,2y*2,2z*2,30*i,31*b,32*1,33*4,34*1,35*m,36*1,37*3,38*7,39*d,3a*5,3b*2,3c*1,3d*7,3e*1,3f*1,3g*3,3h*3,3i*w,3j*e,3k*a,3l*6,3m*1,3n*7,3o*11,3p*b,3q*c,3r*e,3s*7,3t*8,3u*7,3v*4,3w*m,3x*1,3y*2,3z*h,40*7,41*g,42*2,43*2,44*e,45*5,46*3,47*1,48*z,49*2,4a*26,4b*2,4c*c,4d*2,4e*g,4f*j,4g*1t,4h*1,4i*8,4j*1,4k*d,4l*c,4m*2,4n*5,4o*8,4p*c,4q*1,4r*2,4s*d,4t*4,4u*1l,4v*5,4w*3,4x*5,4y*k,4z*23,50*2,51*4,52*s,53*q,54*3,55*1e,56*6,57*e,58*1,59*k,5a*1,5b*x,5c*7,5d*6,5e*2,5f*8,5g*5,5h*9,2*13,3*i,1d*6y,0*1,5*38,5i*1,5j*1,6*8h,4*l,9*8h,8*1m,b*1o,n*2,h*5,d*3n,5k*1,q*1e,e*64,r*3,j*1i,5l*1,o*3,l*w,5m*1,c*l,p*k,m*1ta,k*4,g*14,f*1p,i*b,14*3,2k*w,z*28,s*dz,2p*1,u*p,4s*x,y*3o,10*1m3,5n*1,5o*1,11*84,2l*2,v*f,t*2i,5p*1,12*y,24*l,13*3h,16*b,17*31,x*4r,1a*1q,19*5,1c*13,1e*1k,1g*5y,4o*r,1w*4,1i*5,1f*c,4q*2,1k*67,5q*1,5r*1,1m*5,1l*2e,1n*iv,1r*4,3x*2,5s*1,1o*a,1t*u,1q*b,18*v8,1s*2j,5t*1,1x*2y,5u*1,5v*1,1v*9,1z*5,1y*28,5w*1,1u*13,20*d,21*2,25*s,5x*1,23*1f,22*3g,26*3d,2d*4,2a*2w3,27*bf,2c*b2,2b*2f,28*14,5y*1,29*2t,2e*hu,2f*a,2h*yt,5z*1,2g*q,2q*1w,2i*2g,60*1,2m*2e,2n*3q,5c*e,2o*e,2j*r,2r*e,2z*d,2s*b,2w*9,2v*b,30*15,61*1,2x*u,2y*1,3b*4,35*2c,3h*k,3j*9h,62*1,38*1h,3f*6,36*1,3c*7,3d*j,3g*b,5e*4,3i*gz,63*1,33*i,32*1,3a*j,34*7,3e*1,31*4p,3k*1k,39*4l,3l*d,64*1,3s*13,3q*6p,3m*2,3t*1e,3p*q,3n*z,3o*6h,65*1,66*1,37*z,67*1,3r*s,3u*l,40*a5,68*1,43*17,3v*n,3y*b,45*p,3w*3a,3z*e9,69*1,41*9n,44*4l,42*j,46*n,48*2r,4a*sm,4b*17,47*d,6a*1,6b*1,6c*1,2t*1,6d*1,6e*1,58*1,6f*1,6g*1,6h*1,4c*2e,4k*1m,49*1d,6i*1,4j*d,6j*1,4i*1h,4h*8,4d*5,4l*u,5f*8b,6k*1,4n*b,1j*k0,2u*1g,4e*1o,4m*a,6l*1,4f*2k,w*26,4p*25,51*1r,4v*q,52*5k,4u*7l,4w*7,4t*g,6m*1,50*c,4y*32,4x*v,6n*1,4z*9x,54*3u,53*af,1*1m,1p*ny,55*2la,56*p,57*2q,6o*1,59*5g,5b*7s,6p*1,5a*1,6q*1,5d*j,5g*20,5h*m,6r*1","sep":"|"},{"d":"Escaldes-Engordany|Dubai|Fujairah|Abu Dhabi|Sharjah|Ajman|Nimroz|Bamyan|Takhar|Herat|Jowzjan|Sar-e Pol Province|Kunduz|Baghlan|Kabul|Faryab|Balkh|Helmand|Badakhshan|Nangarhar|Parwan|Kunar|Vlore County|Korce County|Elbasan County|Tirana|Durres County|Fier County|Berat County|Syunik|Ararat|Yerevan|Armavir|Gegharkunik|Tavush|Kotayk|Shirak|Lunda Sul|Luanda Norte|Moxico|Cuanza Norte|Luanda|Uige|Bengo|Zaire|Kwanza Sul|Malanje|Cabinda|Cunene|Huambo|Namibe|Huila|Bie|Benguela|Buenos Aires|Misiones|Buenos Aires F.D.|Santa Fe|Entre Rios|Corrientes|Chaco|Formosa|Neuquen|Tucuman|Rio Negro|San Juan|Cordoba|Tierra del Fuego|Mendoza|Chubut|La Pampa|Santiago del Estero|Salta|Catamarca|Jujuy|San Luis|Santa Cruz|La Rioja|Eastern District|Vienna|Carinthia|Tyrol|Lower Austria|Styria|Upper Austria|Salzburg|Vorarlberg|South Australia|Western Australia|Queensland|Northern Territory|Victoria|New South Wales|Australian Capital Territory|Tasmania||Saatli|Nakhchivan|Baki|Sumqayit|Abseron|Federation of B&H|Srpska|Rangpur Division|Chittagong|Dhaka Division|Sylhet Division|Mymensingh Division|Rajshahi Division|Khulna Division|Barisal Division|Flanders|Brussels Capital|Wallonia|Plateau-Central|Centre|Centre-Est|Centre-Nord|Nord|Boucle du Mouhoun|Centre-Ouest|Centre-Sud|Hauts-Bassins|Cascades Region|Est|Sud-Ouest|Sahel|Yambol|Pazardzhik|Veliko Tarnovo|Varna|Targovishte|Lovech|Haskovo|Stara Zagora|Kyustendil|Sliven|Gabrovo|Blagoevgrad|Sofia|Plovdiv|Montana|Burgas|Manama|Southern Governorate|Northern|Bururi|Gitega|Bubanza|Atlantique|Kouffo|Atakora|Borgou|Oueme|Alibori|Mono|Collines|Plateau|Zou|Donga|Littoral|Tutong|Belait|Brunei-Muara District|Tarija Department|Santa Cruz Department|Cochabamba|Potosi Department|La Paz Department|Beni Department|Oruro|Maranhao|Pernambuco|Para|Paraiba|Ceara|Alagoas|Piaui|Amazonas|Bahia|Rio Grande do Norte|Tocantins|Amapa|Sergipe|Santa Catarina|Sao Paulo|Rio de Janeiro|Espirito Santo|Minas Gerais|Rio Grande do Sul|Parana|Mato Grosso|Goias|Mato Grosso do Sul|Federal District|Acre|Rondonia|Roraima|New Providence|Freeport|Thimphu District|Central|South-East|Kweneng|Ngwaketsi|North-West|Minsk|Homyel' Voblasc'|Vitebsk|Grodnenskaya|Brest|Mogilev|Belize District|Cayo District|British Columbia|Ontario|Quebec|Alberta|Nova Scotia|Manitoba|Newfoundland and Labrador|New Brunswick|Saskatchewan|Tshopo|Haut-Uele|South Kivu|Kasai|North Kivu|Haut-Katanga|Tanganyika|Lomami|Haut-Lomami|Ituri|East Kasai|Sankuru|Mongala|Maniema|Kasai-Central|Nord-Ubangi|Bas-Uele|Lualaba|Sud-Ubangi|Bas-Congo|Mai-Ndombe|Equateur|Kwilu|Kinshasa|Haut-Mbomou|Ouaka|Ombella-M'Poko|Kemo|Lobaye|Ouham-Fafa|Ouham-Pende|Nana-Mambere|Lekoumou|Pointe-Noire|Cuvette|Sangha|Niari|Bouenza|Likouala|Plateaux|Zurich|Zug|Vaud|Saint Gallen|Aargau|Geneva|Bern|Solothurn|Valais|Schwyz|Neuchatel|Basel-Landschaft|Lucerne|Ticino|Thurgau|Fribourg|Basel-City|Sassandra-Marahoue|Montagnes|Lacs District|Bas-Sassandra District|Woroba|Vallee du Bandama District|Savanes District|Lagunes District|Zanzan District|Goh-Djiboua|Comoe District|Abidjan Autonomous District|Valparaiso|Araucania|Coquimbo Region|Atacama|Los Rios Region|Biobio|Antofagasta|Maule Region|Santiago Metropolitan|O'Higgins Region|Nuble|Los Lagos Region|Region of Magallanes|Aysen|Tarapaca|East|Far North|North|West|South-West|Adamaoua|South|Yunnan|Xinjiang|Tibet|Gansu|Qinghai|Sichuan|Jiangsu|Hainan|Guizhou|Shandong|Shaanxi|Chongqing|Hunan|Henan|Shanghai|Zhejiang|Liaoning|Ningxia|Hubei|Hebei|Shanxi|Guangdong|Fujian|Guangxi|Jiangxi|Anhui|Tianjin|Inner Mongolia|Beijing|Jilin|Heilongjiang|Cundinamarca|Valle del Cauca Department|Antioquia|Casanare Department|Meta Department|Norte de Santander Department|La Guajira Department|Caldas Department|Santander Department|Cesar Department|Bolivar|Narino|Boyaca|Sucre Department|Cauca Department|Huila Department|Arauca Department|Choco|Atlantico|Magdalena Department|Risaralda Department|Tolima Department|Quindio Department|Caqueta|Putumayo Department|Vichada Department|Bogota D.C.|Cartago Province|San Jose|Limon Province|Heredia Province|Alajuela Province|Puntarenas Province|Guanacaste Province|Granma Province|Sancti Spiritus Province|Pinar del Rio|Havana|Camaguey|Ciego de Avila Province|Matanzas Province|Holguin Province|Villa Clara Province|Santiago de Cuba Province|Mayabeque|Artemisa|Cienfuegos Province|Guantanamo Province|Las Tunas Province|Praia|Ammochostos|Limassol|Nicosia|Larnaka|Hradec Kralove Region|South Moravian|Zlin|Prague|Vysocina|Usti nad Labem Region|Moravian-Silesian Region|South Bohemian Region|Pardubice Region|Olomouc Region|Carlsbad Region|Central Bohemia|Plzen Region|Liberec Region|Saxony|Rheinland-Pfalz|North Rhine-Westphalia|Brandenburg|Bavaria|Saxony-Anhalt|State of Berlin|Lower Saxony|Hesse|Mecklenburg-Vorpommern|Hamburg|Baden-Wurttemberg|Thuringia|Schleswig-Holstein|Saarland|Bremen|Tadjourah|Djibouti|Zealand|Capital Region|Central Jutland|South Denmark|North Denmark|Saint George Parish|Nacional|Santiago Province|San Cristobal|San Pedro de Macoris|San Juan Province|Puerto Plata|La Altagracia Province|Monte Plata Province|Valverde Province|La Vega|Santo Domingo Province|Boumerdes|Constantine|Biskra|Algiers|Relizane|Touggourt|Tlemcen|Tizi Ouzou|Tissemsilt|Tipaza|Bejaia|Mascara|Tiaret|Chlef|Mila|Tebessa|Batna|Skikda|Bouira|Blida|Souk Ahras|Ouled Djellal|Oran|Sidi Bel Abbes|El Mghair|M'Sila|Setif|Ouargla|El Oued|Adrar|Bordj Bou Arreridj|Oum el Bouaghi|Guelma|Ain Defla|Ghardaia|Djelfa|Medea|Naama|Laghouat|Khenchela|Jijel|Ain Temouchent|El Tarf|Annaba|El Bayadh|Zamora Chinchipe|Guayas|Los Rios|Manabi|El Oro|Santa Elena|Esmeraldas|Pichincha|Cotopaxi|Orellana Province|Tungurahua Province|Imbabura|Loja|Canar|Azuay|Viljandimaa|Harjumaa|Ida-Virumaa|Gharbia|Red Sea|Qalyubia|Dakahlia|Sohag|Luxor|Faiyum|Monufia|Beni Suweif|Matruh|Kafr el-Sheikh|Asyut|Beheira|South Sinai|Sharqia|Minya|North Sinai|Qena|New Valley|Damietta|Giza|Cairo|Aswan|Ismailia|Port Said|Alexandria|Suez|Northern Red Sea|Gash-Barka|Debub|Andalusia|Extremadura|Murcia|Canary Islands|Valencia|Castille-La Mancha|Balearic Islands|Basque Country|Aragon|Castille and Leon|Galicia|Madrid|Catalonia|Navarre|Cantabria|Asturias|Somali|Oromiya|South Ethiopia Regional State|Sidama Region|Tigray|Amhara|Central Ethiopia Regional State|South West Ethiopia Peoples' Region|Afar|Binshangul Gumuz|Pirkanmaa|North Ostrobothnia|Uusimaa|North Savo|Ostrobothnia|Southwest Finland|Lapland|South Ostrobothnia|South Savo|Kanta-Haeme|Satakunta|Paijat-Hame|Central Finland|South Karelia|Kymenlaakso|North Karelia|Western|Ile-de-France|Grand Est|Hauts-de-France|Auvergne-Rhone-Alpes|Provence-Alpes-Cote d'Azur|Brittany|New Aquitaine|Centre-Val de Loire|Bourgogne-Franche-Comte|Pays de la Loire|Normandy|Occitanie|Corsica|Nyanga|Woleu-Ntem|Moyen-Ogooue|Estuaire|Haut-Ogooue|England|Wales|Scotland|Northern Ireland|Samegrelo and Zemo Svaneti|Imereti|Shida Kartli|Abkhazia|Kvemo Kartli|Adjara|Guyane|Bono East|Bono|Upper West|Greater Accra|Ashanti|Eastern|Savannah|Upper East|Ahafo|Volta|Banjul|North Bank|Faranah|Boke Region|Labe Region|Kindia|Kankan Region|Mamou Region|Nzerekore Region|Conakry|Guadeloupe|Kie-Ntem|Wele-Nzas|Attica|Thessaly|Peloponnese|Central Greece|Crete|Epirus|West Greece|North Aegean|South Aegean|Central Macedonia|East Macedonia and Thrace|West Macedonia|Chimaltenango|Zacapa|Guatemala|Totonicapan|Sacatepequez|Huehuetenango|Solola|Escuintla|Quiche|Suchitepeque|Retalhuleu|San Marcos|Alta Verapaz|Jalapa|Peten|El Progreso|Quetzaltenango|Baja Verapaz|Izabal Department|Jutiapa|Santa Rosa Department|Chiquimula|Tamuning|Bafata|Bissau|East Berbice-Corentyne|Tsuen Wan|Yuen Long|Kwun Tong District|Yau Tsim Mong District|Wong Tai Sin District|Sha Tin|Kowloon City|Wan Chai|Southern District|Tuen Mun|Kwai Tsing District|Sai Kung District|Tai Po|North District|Sham Shui Po District|Islands|Central and Western|Cortes Department|Yoro Department|Intibuca Department|Comayagua Department|Colon Department|El Paraiso Department|Atlantida Department|Francisco Morazan Department|Copan Department|Santa Barbara Department|Valle Department|Choluteca Department|Lempira Department|Olancho Department|Zagreb County|Zagreb|Vukovar-Srijem|Split-Dalmatia|County of Osijek-Baranja|Artibonite|Ouest|Nord-Ouest|Sud-Est|Jasz-Nagykun-Szolnok|Borsod-Abauj-Zemplen|Csongrad|Bekes County|Hajdu-Bihar|Szabolcs-Szatmar-Bereg|Heves County|Pest County|Budapest|Zala County|Veszprem|Komarom-Esztergom|Vas County|Tolna County|Fejer|Gyor-Moson-Sopron|Somogy County|Baranya|Bacs-Kiskun|North Sumatra|Aceh|Yogyakarta|Central Java|East Java|West Java|South Sulawesi|Highland Papua|Southwest Papua|East Nusa Tenggara|Jakarta|Bali|Maluku|North Sulawesi|Central Sulawesi|North Maluku|Central Papua|Lampung|North Kalimantan|Riau Islands|Bangka-Belitung Islands|South Sumatra|South Kalimantan|Banten|West Nusa Tenggara|West Kalimantan|Jambi|West Sumatra|Central Kalimantan|East Kalimantan|West Papua|Southeast Sulawesi|West Sulawesi|Riau|Papua|Bengkulu|South Papua|Leinster|Munster|Connacht|Jerusalem|Central District|Haifa|Northern District|Tel Aviv|Jammu and Kashmir|Tamil Nadu|Nagaland|Uttar Pradesh|Telangana|Maharashtra|Karnataka|Andhra Pradesh|Haryana|Rajasthan|Bihar|Madhya Pradesh|Gujarat|Kerala|Puducherry|Goa|Uttarakhand|Punjab|Himachal Pradesh|Chhattisgarh|West Bengal|Manipur|Assam|Tripura|Meghalaya|Odisha|Arunachal Pradesh|Jharkhand|Dadra and Nagar Haveli and Daman and Diu|Mizoram|Delhi|Andaman and Nicobar|Ladakh|Duhok|Basra|Salah ad Din|Kirkuk|Nineveh|Erbil|Babil|Sulaymaniyah|Anbar|Diyala|Dhi Qar|Maysan|Karbala|Baghdad|Wasit|Muthanna|Al-Qadisiyah|Najaf|Tehran|Qazvin Province|Mazandaran|East Azerbaijan|Lorestan Province|Kermanshah Province|Semnan|Golestan|Zanjan|Gilan Province|Alborz Province|Khuzestan|Bushehr|Fars|Kohgiluyeh and Boyer-Ahmad|Yazd Province|Kerman|Hamadan Province|Razavi Khorasan|West Azerbaijan|Markazi|North Khorasan|Chaharmahal and Bakhtiari|Isfahan|Kurdistan Province|Qom Province|Hormozgan|South Khorasan Province|Ardabil Province|Ilam Province|Sistan and Baluchestan|Northeast|Southern Peninsula|Sicily|Calabria|Sardinia|Apulia|Emilia-Romagna|Campania|Lombardy|Veneto|Lazio|Tuscany|Piedmont|Liguria|Abruzzo|Friuli Venezia Giulia|Trentino-Alto Adige|The Marches|Umbria|Molise|Basilicate|Saint Catherine Parish|Saint Andrew Parish|Saint James Parish|Amman|Balqa|Ma'an|Irbid|Karak|Zarqa|Ajloun|Mafraq|Wakayama|Kanagawa|Hyogo|Kagawa|Gifu|Fukuoka|Ibaraki|Kyoto|Saitama|Gunma|Niigata|Tottori|Okinawa|Tokyo|Mie|Oita|Shiga|Kumamoto|Toyama|Shimane|Osaka|Yamaguchi|Nara|Kochi|Shizuoka|Tochigi|Hiroshima|Tokushima|Ishikawa|Ehime|Saga|Chiba|Kagoshima|Yamanashi|Nagano|Okayama|Aichi|Yamagata|Fukui|Miyazaki|Nagasaki|Akita|Fukushima|Miyagi|Iwate|Hokkaido|Aomori|Makueni County|Bungoma County|Kilifi County|Kirinyaga County|Wajir County|Taita Taveta|Kwale County|Nairobi County|Nyeri County|Kiambu County|Migori County|Nakuru County|Mandera County|Homa Bay County|Kisii County|Laikipia|Kajiado County|Kitui County|Machakos County|Murang'A|Kakamega County|Kisumu County|Marsabit County|Mombasa County|Meru County|Tana River County|Busia County|West Pokot County|Turkana County|Trans Nzoia|Baringo|Isiolo County|Uasin Gishu County|Nyandarua County|Siaya County|Batken|Issyk-Kul|Chuy Region|Jalal-Abad Region|Osh Region|Phnom Penh|Takeo|Svay Rieng|Tboung Khmum|Kratie|Banteay Meanchey|Siem Reap|Kampong Speu Province|Kampong Thom|Otar Meanchey|Battambang|Kampong Cham|Ratanakiri|Koh Kong|Anjouan|South Hwanghae|Kangwon-do|South Pyongan|Pyongyang|North Hwanghae|South Hamgyong|P'yongan-bukto|North Hamgyong|Chagang|Rason|Yanggang-do|Gyeongsangbuk-do|Gangwon-do|Jeollanam-do|North Chungcheong|Gyeonggi-do|Chungcheongnam-do|Gyeongsangnam-do|Jeju-do|Jeollabuk-do|Daegu|Seoul|Busan|Gwangju|Incheon|Al Farwaniyah|Hawalli|Al Ahmadi|Al Asimah|West Bay|Mangystau|Aktobe|Atyrau Oblisi|West Kazakhstan|Karaganda|East Kazakhstan|Kyzylorda|Ulytau Region|Kostanay|Zhambyl|Turkistan|Zhetysu Region|Almaty Region|Aqmola|Abai Region|Pavlodar Region|Vientiane Prefecture|Savannakhet Province|Bolikhamsai|Bokeo|Bekaa|North Lebanon|South Governorate|Baalbek-Hermel Governorate|Beirut|Mount Lebanon|Nabatieh|Gros-Islet|Western Province|Southern Province|Northern Province|Eastern Province|Sabaragamuwa Province|North Western Province|Central Province|Uva Province|Grand Gedeh County|Nimba|Lofa County|Maryland County|Margibi County|Berea|Leribe|Utena|Vilnius|Telsiai|Siauliai|Klaipeda County|Kaunas|Luxembourg|Esch-sur-Alzette|Valmiera|Riga|Al Butnan|Banghazi|Darnah|Al Wahat|Al Kufrah|Al Marj|Al Jabal al Akhdar|An Nuqat al Khams|Misratah|Jabal al Gharbi|Al Marqab|Tripoli|Surt|Az Zawiyah|Sabha District|Murzuq District|Al Jafarah|Wadi al Hayat|Laayoune-Sakia El Hamra|Marrakesh-Safi|Beni Mellal-Khenifra|Oriental|Draa-Tafilalet|Souss-Massa|Casablanca-Settat|Tanger-Tetouan-Al Hoceima|Rabat-Sale-Kenitra|Fes-Meknes|Guelmim-Oued Noun|Municipality of Monaco|Raionul Edinet|Transnistria|Chisinau Municipality|Gagauzia|Podgorica|Atsinanana|Atsimo-Atsinanana|Fitovinany Region|Analanjirofo|Bongolava|Androy|Betsiboka|Atsimo-Andrefana|Anosy|Itasy|Vakinankaratra|Boeny|Sava|Vatovavy Region|Analamanga|Menabe|Alaotra Mangoro|Melaky|Ihorombe|Upper Matsiatra|Amoron'i Mania|Diana|Majuro Atoll|Zhelino|Grad Skopje|Bogovinje|Sikasso|Koulikoro|Tombouctou|Segou|Kayes|Mopti|Gao|Bago Region|Ayeyarwady|Yangon|Sagaing Region|Magway|Mon|Shan State|Mandalay Region|Tanintharyi Region|Rakhine|Kachin State|Nay Pyi Taw|Kayin State|Dzabkhan|Ulaanbaatar|Selenge Province|OEvoerhangay|Central Aimak|Our Lady of Carmo|Saint Francis Xavier|Martinique|Tiris Zemmour|Hodh Ech Chargi|Trarza|Assaba|Brakna|Hodh El Gharbi|Nouakchott West|Saint Anthony|Haz-Zabbar|Plaines Wilhems|Pamplemousses|Flacq|Northern Region|Southern Region|Central Region|Tamaulipas|San Luis Potosi|Mexico|Guerrero|Puebla|Hidalgo|Morelos|Chiapas|Mexico City|Veracruz|Tabasco|Yucatan|Quintana Roo|Queretaro|Oaxaca|Tlaxcala|Nuevo Leon|Campeche|Sonora|Sinaloa|Jalisco|Baja California|Michoacan|Zacatecas|Guanajuato|Coahuila|Colima|Nayarit|Durango|Baja California Sur|Aguascalientes|Chihuahua|Kedah|Pahang|Perak|Selangor|Johor|Terengganu|Penang|Sabah|Kelantan|Sarawak|Negeri Sembilan|Melaka|Kuala Lumpur|Perlis|Gaza Province|Sofala|Inhambane Province|Tete|Zambezia Province|Cabo Delgado Province|Maputo Province|Nampula|Manica|Niassa Province|Kavango East|Khomas Region|Erongo Region|Otjozondjupa Region|Oshana Region|Karas Region|South Province|Dosso Region|Tahoua Region|Zinder Region|Tillaberi Region|Maradi Region|Diffa|Agadez|Kebbi|Niger State|Kaduna State|Adamawa|Bayelsa State|Taraba State|Kano State|Delta|Nasarawa State|Akwa Ibom State|Edo State|Abia State|Cross River State|Anambra|Sokoto|Zamfara State|Benue State|Lagos|Oyo State|Ogun State|Yobe State|Rivers State|Gombe State|Kwara State|Plateau State|Osun State|Ondo State|Imo State|Kogi State|Ekiti State|Enugu State|Borno State|Katsina State|FCT|Jigawa State|Bauchi|Ebonyi State|Managua Department|Chinandega Department|North Caribbean Coast|Carazo Department|Matagalpa Department|South Caribbean Coast|Nueva Segovia Department|Granada Department|Leon Department|Masaya Department|Boaco Department|Overijssel|South Holland|North Holland|Gelderland|Utrecht|Flevoland|Groningen|Limburg|North Brabant|Zeeland|Friesland|Drenthe|Finnmark|Trondelag|Troms|Vestfold|Rogaland|Telemark|Ostfold|Vestland|More og Romsdal|Nordland|Akershus|Innlandet|Agder|Buskerud|Gandaki Pradesh|Lumbini Province|Sudurpashchim Pradesh|Madhesh|Bagmati Province|Koshi|Karnali Pradesh|Wellington Region|Manawatu-Wanganui|Canterbury|Waikato Region|Nelson Region|Auckland|Hawke's Bay Region|Bay of Plenty|Southeastern Governorate|Al Batinah North|Ad Dakhiliyah|Muscat|Ad Dhahirah|Northeastern Governorate|Al Batinah South|Panama Oeste Province|Panama|Colon|Chiriqui Province|Loreto|La Libertad|San Martin Department|Tumbes|Huanuco Department|Piura|Lambayeque|Ucayali|Cajamarca Department|Ancash|Cuzco Department|Junin|Madre de Dios|Lima region|Ica|Puno|Moquegua Department|Arequipa|Ayacucho|Pasco|Callao|Apurimac Department|Iles du Vent|East Sepik Province|Morobe Province|Eastern Visayas|Central Luzon|Zamboanga Peninsula|Autonomous Region in Muslim Mindanao|Bicol Region|Ilocos|Western Visayas|Calabarzon|Mimaropa|Caraga|National Capital Region|Northern Mindanao|Soccsksargen|Cagayan Valley|Central Visayas|Davao Region|Cordillera|Sindh|Azad Kashmir|Balochistan|Khyber Pakhtunkhwa|Gilgit-Baltistan|Islamabad|Mazovia|Lublin|Podlasie|Lesser Poland|Lodz Voivodeship|Subcarpathia|Warmia-Masuria|Swietokrzyskie|Silesia|Greater Poland|Lower Silesia|Lubusz|Pomerania|Kujawsko-Pomorskie|West Pomerania|Opole Voivodeship|Aguadilla|Toa Baja|Gaza Strip|West Bank|Lisbon|Santarem|Faro|Setubal|Madeira|Leiria|Castelo Branco|Vila Real|Porto|Aveiro|Viana do Castelo|Guarda|Coimbra|Braga|Concepcion|Central Department|Alto Parana Department|Boqueron Department|Caaguazu Department|Baladiyat ad Dawhah|Baladiyat ar Rayyan|Al Daayen|Reunion|Teleorman County|Brasov County|Salaj County|Hunedoara County|Ilfov|Maramures|Suceava|Vaslui County|Ialomita County|Cluj County|Mures County|Covasna County|Neamt County|Gorj County|Dambovita County|Timis County|Galati County|Olt|Sibiu County|Alba County|Satu Mare County|Bihor County|Valcea County|Buzau County|Caras-Severin County|Prahova|Arges|Harghita County|Constanta County|Bacau County|Iasi County|Vrancea|Dolj|Botosani County|Bucharest|Vojvodina|Central Serbia|Tver Oblast|St.-Petersburg|Ryazan Oblast|Moscow|Rostov|Moscow Oblast|Chelyabinsk|Bryansk Oblast|Volgograd Oblast|Samara Oblast|Tambov Oblast|Stavropol Kray|Kursk Oblast|Kaliningrad Oblast|Tatarstan Republic|Karachayevo-Cherkesiya Republic|Nizhny Novgorod Oblast|Penza Oblast|Murmansk|Vladimir Oblast|Mariy-El Republic|Krasnodar Krai|Saratov Oblast|Komi|Lipetsk Oblast|Tula Oblast|Orenburg Oblast|Smolensk Oblast|Yaroslavl Oblast|Kirov Oblast|Bashkortostan Republic|Arkhangelskaya|Adygeya Republic|Leningradskaya Oblast'|Udmurtiya Republic|Voronezh Oblast|Vologda Oblast|Kostroma Oblast|North Ossetia-Alania|Ivanovo Oblast|Perm Krai|Pskov Oblast|Belgorod Oblast|Novgorod Oblast|Chechnya|Ulyanovsk|Kabardino-Balkariya Republic|Ingushetiya Republic|Kaluga Oblast|Karelia|Chuvash Republic|Sverdlovsk Oblast|Mordoviya Republic|Oryol oblast|Nenets|Dagestan|Astrakhan Oblast|Tyumen Oblast|Altai Krai|Kuzbass|Krasnoyarsk Krai|Khanty-Mansia|Tomsk Oblast|Novosibirsk Oblast|Irkutsk Oblast|Yamalo-Nenets|Omsk Oblast|Kurgan Oblast|Khakasiya Republic|Altai|Amur Oblast|Sakha|Khabarovsk|Primorye|Buryatiya Republic|Zabaykalskiy (Transbaikal) Kray|Kamchatka|Sakhalin Oblast|Kigali|Medina Region|Tabuk Region|Northern Borders Region|Mecca Region|Al Jawf Region|Al-Qassim Region|Riyadh Region|Jazan Region|'Asir Region|Najran Region|Ha'il Region|Al Bahah Region|Honiara|Guadalcanal Province|Northern State|Al Jazirah|Sennar|North Kordofan|Khartoum|Southern Darfur|White Nile|River Nile|Northern Darfur|Al Qadarif|Kassala|Southern Kordofan|West Kordofan|Blue Nile|Western Darfur|Eastern Darfur|Vaesterbotten|Norrbotten|Skane|Kronoberg|Vaestra Goetaland|Kalmar|Vaestmanland|Stockholm|Joenkoeping|Halland|Uppsala|Vaesternorrland|Gaevleborg|OErebro|Soedermanland|OEstergoetland|Dalarna|Vaermland|Blekinge|Municipality of Trbovlje|Presov Region|Kosice Region|Banska Bystrica Region|Zilina Region|Bratislava Region|Trnava Region|Trencin Region|Nitra Region|Western Area|Ziguinchor|Dakar|Kolda|Diourbel Region|Thies|Matam|Tambacounda|Sedhiou|Saint-Louis|Fatick|Kaolack|Louga|Kaffrine|Lower Shabeelle|Woqooyi Galbeed|Awdal|Bari|Gedo|Lower Juba|Middle Juba|Nugaal|Mudug|Bay|Galguduud|Hiiraan|Paramaribo District|Wanica District|Central Equatoria|Northern Bahr al Ghazal|Western Bahr al Ghazal|Eastern Equatoria|Warrap|Usulutan|San Salvador Department|Sonsonate Department|Santa Ana Department|San Miguel Department|Cuscatlan|La Libertad Department|Rif-dimashq|Hama|Tartus|Aleppo|Homs|Daraa|Deir ez-Zor|Idlib|Damascus Governorate|Latakia|Al-Hasakah|Raqqa|Hhohho Region|Wadi Fira|Ouadai|Moyen-Chari|Mayo-Kebbi Ouest|Batha|Logone Occidental|Guera|Mandoul|Hadjer-Lamis|Chari-Baguirmi|Tandjile|Mayo-Kebbi Est|Logone Oriental|Maritime|Centrale|Kara|Savanes|Phuket|Prachuap Khiri Khan|Phetchaburi|Trang|Nakhon Si Thammarat|Lampang|Uthai Thani|Kanchanaburi|Tak|Surat Thani|Sukhothai|Chiang Mai|Ratchaburi|Phayao|Lamphun|Chiang Rai|Nakhon Sawan|Chumphon|Kamphaeng Phet|Kalasin|Udon Thani|Songkhla|Bangkok|Nakhon Ratchasima|Samut Prakan|Nong Bua Lamphu|Pattani|Yala|Phetchabun|Ubon Ratchathani|Sakon Nakhon|Loei|Phra Nakhon Si Ayutthaya|Sa Kaeo|Trat|Phichit|Chanthaburi|Nong Khai|Narathiwat|Si Sa Ket|Chon Buri|Sing Buri|Prachin Buri|Saraburi|Samut Sakhon|Nakhon Pathom|Roi Et|Rayong|Buriram|Chaiyaphum|Phrae|Phitsanulok|Chachoengsao|Pathum Thani|Nonthaburi|Lopburi|Khon Kaen|Khatlon Province|Sughd|Republican Subordination|Gorno-Badakhshan|Dushanbe|Cova Lima|Liquica|Baucau|Balkan|Ahal|Dasoguz|Mary|Lebap|Sousse Governorate|Zaghouan Governorate|Manouba|Gafsa|Tunis Governorate|Bizerte Governorate|Tozeur Governorate|Kasserine Governorate|Nabeul Governorate|Kef Governorate|Beja Governorate|Gabes Governorate|Monastir Governorate|Jendouba Governorate|Ariana Governorate|Sfax Governorate|Ben Arous Governorate|Mahdia Governorate|Kebili Governorate|Medenine Governorate|Adana|Hakkari|Yozgat|Mardin|Hatay|Aydin|Mugla|Isparta|Kayseri|Sanliurfa|Mus|Van|Erzincan|Usak|Izmir Province|Nevsehir Province|Manisa|Tunceli|Kuetahya|Bitlis|Mersin|Balikesir|Bingoel|Sivas|Sirnak|Diyarbakir Province|Siirt|Konya|Antalya|Ankara|Denizli|Afyonkarahisar Province|Kahramanmaras|Agri|Erzurum|Osmaniye|Aksaray|Gaziantep|Nigde Province|Kirsehir|Malatya|Batman|Elazig|Kirikkale|Karaman|Adiyaman Province|Igdir|Canakkale|Burdur|Bilecik|Zonguldak Province|Tokat Province|Istanbul|Trabzon|Bursa Province|Kocaeli|Samsun|Edirne|Ordu|Kastamonu|Giresun|Tekirdag|Amasya|Corum|Sinop|Kars Province|Sakarya|Karabuek Province|Rize Province|Kirklareli|Guemueshane Province|Duzce|Artvin|Bolu|Cankiri|Tunapuna/Piarco|San Fernando|Taiwan|Taipei|Takao|Fukien|Zanzibar Urban/West|Songwe|Pwani|Geita|Kigoma|Mbeya|Katavi|Kilimanjaro|Mwanza|Arusha|Tabora|Shinyanga|Mara|Tanga|Rukwa|Simiyu|Singida|Kagera|Njombe|Morogoro|Manyara|Dodoma|Pemba South|Ruvuma|Dar es Salaam Region|Iringa|Lindi|Mtwara|Sumy|Donetsk|Cherkasy|Lviv|Kirovohrad|Zhytomyr Oblast|Vinnytsia|Dnipropetrovsk|Rivne Oblast|Zaporizhzhia|Odesa|Luhansk|Crimea|Kyiv Oblast|Zakarpattia|Kyiv City|Mykolaiv|Khmelnytskyi|Kharkiv|Volyn|Kherson|Ternopil|Sevastopol City|Chernihiv Oblast|Poltava|Ivano-Frankivsk|Eastern Region|Western Region|Virginia|Alabama|Kentucky|Tennessee|Arkansas|District of Columbia|Delaware|Florida|Georgia|Illinois|Indiana|Kansas|Louisiana|Maryland|Missouri|Mississippi|North Carolina|New Jersey|Ohio|Oklahoma|Pennsylvania|South Carolina|Texas|West Virginia|Massachusetts|Connecticut|Michigan|Iowa|Maine|Minnesota|North Dakota|Nebraska|New Hampshire|New York|Rhode Island|South Dakota|Vermont|Wisconsin|California|Arizona|Colorado|New Mexico|Nevada|Utah|Alaska|Idaho|Oregon|Washington|Wyoming|Hawaii|Rio Negro Department|Canelones|San Jose Department|Maldonado|Soriano|Colonia|Karakalpakstan|Jizzakh Region|Samarqand Region|Surxondaryo Region|Qashqadaryo|Bukhara|Tashkent Region|Tashkent|Fergana|Sirdaryo Region|Navoiy Region|Namangan|Xorazm Region|Andijan Region|Nueva Esparta|Anzoategui|Barinas|Guarico|Yaracuy|Aragua|Portuguesa|Trujillo|Carabobo|Tachira|Merida|Falcon|Cojedes|Zulia|Monagas|Miranda|Lara|Vargas|Sucre|Apure|Saint Thomas Island|Nghe An Province|Hanoi|Lao Cai|Dong Nai|Ho Chi Minh City (HCMC)|An Giang|Ca Mau|Can Tho City|Phu Tho|Vinh Long|Bac Ninh|Quang Ninh|Dak Lak|Tuyen Quang|Khanh Hoa|Ha Tinh Province|Cao Bang Province|Tay Ninh|Dong Thap|Lang Son Province|Thanh Hoa Province|Thai Nguyen|Hung Yen Province|Da Nang City|Son La Province|Gia Lai|Quang Tri|Quang Ngai|Ninh Binh|Thua Thien Hue Province|Lam Dong|GJien Bien Province|Hai Phong|Mitrovica|Gjilan|Ferizaj|Prizren|Pristina|Pec|Gjakova|Abyan Governorate|Al Hudaydah|Ibb Governorate|Ta'izz|Sanaa Governorate|Muhafazat Hadramaout|Mamoudzou|Dzaoudzi|Gauteng|Free State|Mpumalanga|Eastern Cape|KwaZulu-Natal|Northern Cape|Limpopo|Western Cape|Luapula Province|Muchinga|North-Western|Copperbelt|Lusaka Province|Masvingo Province|Matabeleland North|Midlands Province|Mashonaland East Province|Manicaland|Mashonaland West|Mashonaland Central|Harare|Matabeleland South Province|Badghis|Daykundi|Farah|Ghazni|Ghowr|Kandahar|Khowst|Laghman|Logar|Paktia|Panjshir|Samangan|Diber County|Gjirokaster County|Kukes County|Lezhe County|Shkoder County|Bechar|El Menia|In Salah|Mostaganem|Saida|Tamanrasset|Timimoun|Tindouf|Andorra la Vella|Cubango|The Valley|Saint John Parish|Aragatsotn|Lori|Burgenland|Agdam|Agdas|Aghjabadi Rayon|Agsu District|Astara|Barda|Beylaqan|Bilasuvar District|Fuzuli District|Ganja City|Goeycay|Goygol Rayon|Haciqabul|Imisli|Ismayilli District|Jalilabad|Kurdamir District|Lankaran|Lerik District|Mingacevir City|Neftcala|Qazax|Quba|Qusar District|Sabirabad District|Salyan District|Samaxi|Shabran|Shaki City|Shamkir Rayon|Shirvan|Shusha|Siazan Rayon|Tartar District|Tovuz District|Ucar|Xacmaz|Yevlax City|Zaqatala District|Muharraq|Saint Michael|Minsk City|Orange Walk District|Hamilton city|Chukha|Punakha|Tsirang District|Chuquisaca Department|Pando|Bonaire|Brcko|City of Francistown|Gaborone|Ghanzi|Jwaneng|Kgatleng|Lobatse|Selibe Phikwe|Dobrich|Kardzhali|Pernik|Pleven|Razgrad|Ruse|Shumen|Silistra|Smolyan|Sofia-Capital|Vidin|Vratsa|Bujumbura Mairie|Bujumbura Rural|Cankuzo|Cibitoke|Kayanza|Kirundo|Ngozi|Rumonge|Sal|Sao Vicente|Kampong Chhnang|Kampot|Kandal|Kep|Pailin|Preah Sihanouk|Preah Vihear|Prey Veng|Pursat|Stung Treng|Northwest Territories|Prince Edward Island|Yukon|George Town|Bamingui-Bangoran|Bangui|Basse-Kotto|Haute-Kotto|Lim-Pende|Mambere|Mambere-Kadei|Mbomou|Nana-Grebizi|Ouham|Sangha-Mbaere|Barh el Gazel|Borkou|Ennedi-Est|Ennedi-Ouest|Kanem|Lac|N'Djamena|Salamat|Sila|Arica y Parinacota Region|Amazonas Department|Guaviare Department|San Andres y Providencia|Vaupes|Grande Comore|Moheli|Brazzaville|Kwango|Tshuapa|Rarotonga|Bjelovar-Bilogora|Brod-Posavina|Dubrovnik-Neretva|Istria|Karlovac|Koprivnica-Krizevci|Megimurje|Pozega-Slavonia|Primorje-Gorski Kotar|Sibenik-Knin|Sisak-Moslavina|Varazdin|Zadar|Isla de la Juventud|Keryneia|Pafos|Denguele District|Ali Sabieh|Arta|Dikhil|Obock|Azua Province|Baoruco Province|Barahona Province|Dajabon|Duarte Province|El Seibo|Espaillat Province|Hato Mayor Province|Hermanas Mirabal|La Romana|Maria Trinidad Sanchez|Monsenor Nouel|Monte Cristi Province|Peravia|San Jose de Ocoa|Sanchez Ramirez|Santiago Rodriguez|Carchi|Chimborazo Province|Morona-Santiago Province|Napo|Pastaza Province|Santo Domingo de los Tsachilas|Sucumbios|Ahuachapan|Cabanas|Chalatenango Department|La Union|Morazan|San Vicente Department|Bioko Norte|Djibloho|Litoral|Anseba|Maekel|Southern Red Sea|Paernumaa|Tartu|Manzini Region|Addis Ababa|Dire Dawa|Gambela|Harari|Streymoy|Central Ostrobothnia|Kainuu|Kerguelen|Ngouni|Ogooue-Ivindo|Ogooue-Lolo|Ogooue-Maritime|Lower River|Upper River|Kakheti|Samtskhe-Javakheti|Tbilisi|North East|Oti|Western North|Ionian Islands|Sermersooq|Dededo|Hagatna|Mangilao|Yigo|St Peter Port|Gabu|Demerara-Mahaica|Upper Demerara-Berbice|Grand'Anse|Nippes|Nord-Est|Sud|Ocotepeque Department|Nograd|Chandigarh|Sikkim|Gorontalo|Halabja|Ulster|Douglas|Judea and Samaria Area|Aosta Valley|Clarendon|Kingston|Manchester|Saint Ann Parish|Westmoreland|St Helier|Aqaba|Jerash|Madaba|Tafielah|Almaty|Astana|Baikonur|North Kazakhstan|Shymkent|Embu County|Garissa County|Kericho County|Lamu|Marakwet District|Nandi|Narok County|Nyamira county|Samburu County|Tharaka - Nithi|Vihiga County|Gilbert Islands|Kaesong|Nampo|Daejeon|Sejong-si|Ulsan|Al Jahra Governorate|Mubarak al Kabir|Bishkek|Naryn Region|Talas Region|Champasak Province|Houaphan|Khammouane Province|Loungnamtha|Luang Prabang Province|Oudomxai|Salavan Province|Vientiane|Xekong|Xiangkhoang|Cesis Municipality|Daugavpils|Jekabpils Municipality|Jelgava|Jurmala|Liepaja|Marupe|Ogre|Rezekne|Salaspils Municipality|Tukums Municipality|Ventspils|Butha-Buthe|Mafeteng District|Maseru District|Mohale's Hoek District|Qacha's Nek District|Quthing|Thaba-Tseka|Bomi County|Bong County|Grand Bassa County|Montserrado County|Sinoe County|Al Jufrah|Nalut|Wadi ash Shati'|Vaduz|Alytus|Marijampole County|Panevezys|Taurage County|Labuan|Putrajaya|Kaafu Atoll|Bamako|Kidal|Menaka|Birkirkara|Il-Mosta|Qormi|Saint Paul's Bay|Tas-Sliema|Valletta|Dakhlet Nouadhibou|Gorgol|Guidimaka|Inchiri|Nouakchott North|Black River|Grand Port|Moka|Port Louis|Riviere du Rempart|Koungou|Pohnpei State|Balti|Bender Municipality|Cahul|Causeni|Drochia|Floresti|Hincesti|Orhei|Singerei|Soroca District|Straseni|Ungheni|Arkhangai Province|Bayan-OElgii Province|Bayankhongor|Bulgan|Darhan Uul|East Aimak|East Gobi Aymag|Govi-Altai Province|Hentiy|Hovd|Khoevsgoel Province|OEmnoegovi|Orhon|Suhbaatar|Uvs Province|Bar|Bijelo Polje|Budva|Cetinje|Herceg Novi|Opstina Niksic|Pljevlja|Saint Peter|Maputo City|Chin State|Kayah State|Hardap Region|Ohangwena Region|Omaheke Region|Oshikoto Region|Zambezi Region|Yaren District|Gisborne|Marlborough|Northland|Otago|Southland|Taranaki Region|Tasman District|Chontales Department|Esteli Department|Jinotega Department|Madriz Department|Rivas Department|Niamey|Bitola|Brvenica|Centar Zhupa|Debar|Delchevo|Gevgelija|Gostivar|Ilinden|Kavadarci|Kichevo|Kochani|Kriva Palanka|Kumanovo|Lipkovo|Negotino|Ohrid|Prilep|Radovish|Resen|Shtip|Struga|Strumica|Studenichani|Tearce|Tetovo|Veles|Vinica|Vrapchishte|Saipan|Oslo|Al Buraimi|Dhofar|Musandam Governorate|Melekeok|Bocas del Toro Province|Cocle|Veraguas Province|Bougainville|East New Britain Province|Eastern Highlands Province|Madang Province|National Capital|Oro Province|Southern Highlands Province|West New Britain Province|Western Highlands Province|Amambay Department|Asuncion|Caazapa|Cordillera Department|Guaira|Itapua|Misiones Department|Neembucu Department|Presidente Hayes|Huancavelica|Lima Province|Tacna|Azores|Beja|Braganca|Evora|Portalegre|Viseu|Arecibo|Barceloneta|Bayamon|Caguas|Carolina|Catano|Cayey|Fajardo|Guayama|Guaynabo|Humacao|Manati|Mayagueez|Ponce|Trujillo Alto|Vega Baja|Yauco|Al Khor|Al Wakrah|Al-Shahaniya|Umm Salal|Arad County|Bistrita-Nasaud County|Braila County|Calarasi County|Giurgiu County|Mehedinti County|Tulcea County|Chukotka|Jewish Autonomous Oblast|Kalmykiya Republic|Magadan Oblast|Republic of Tyva|Saint Helena|Saint George Basseterre|Castries|Saint-Pierre|Tuamasaga|San Marino|Sao Tome Island|Kedougou|La Riviere Anglaise|North West|Ljubljana|Urban Municipality of Celje|Urban Municipality of Koper|Urban Municipality of Kranj|Urban Municipality of Maribor|Urban Municipality of Novo Mesto|Urban Municipality of Ptuj|Urban Municipality of Velenje|Banaadir|Middle Shabele|Sanaag|Sool|Togdheer|Jonglei|Lakes|Unity|Upper Nile|Western Equatoria|Ceuta|Melilla|North Central Province|Central Darfur|Svalbard|Gotland|Jaemtland|Appenzell Ausserrhoden|Grisons|Schaffhausen|Quneitra|Suwayda|Pemba North|Zanzibar Central/South|Zanzibar North|Amnat Charoen|Ang Thong|Bueng Kan|Chai Nat|Krabi|Maha Sarakham|Mukdahan|Nakhon Nayok|Nakhon Phanom|Nan|Phang Nga|Phatthalung|Ranong province|Samut Songkhram|Satun|Suphan Buri|Surin|Uttaradit|Yasothon|Aileu|Bobonaro|Dili Municipality|Ermera|Lautem|Tongatapu|Borough of Arima|Chaguanas|Diego Martin Regional Corporation|Mayaro|Point Fortin|Port of Spain|San Juan/Laventille|Sangre Grande Regional Corporation|Tobago|Kairouan|Sidi Bouzid Governorate|Siliana Governorate|Tataouine|Ashgabat|Funafuti|Ardahan|Bartin|Bayburt Province|Eskisehir|Kilis|Yalova|Chernivtsi|Ras Al Khaimah|Umm Al Quwain|Artigas|Cerro Largo|Durazno Department|Flores Department|Lavalleja|Montevideo Department|Paysandu Department|Rivera Department|Rocha Department|Salto Department|Tacuarembo Department|Treinta y Tres Department|Shefa|Delta Amacuro|Distrito Federal|Lai Chau Province|Saint Croix Island|Uvea|Aden|Al Bayda|Al Jawf|Amanat Alasimah|Dhamar|Hajjah|Lahij|Ma'rib|Omran|Sa'dah|Shabwah|Bulawayo|Mariehamn","r":"0*1,1*1,2*1,3*1,4*1,5*1,6*1,7*1,8*1,9*1,a*1,b*1,c*1,d*1,e*1,f*1,g*1,h*1,i*1,j*1,k*1,l*1,m*1,n*1,o*1,p*1,q*1,r*1,s*1,t*1,u*1,v*1,w*1,x*1,y*1,z*1,10*1,11*1,12*1,13*1,14*1,15*1,16*1,17*1,18*1,19*1,1a*1,1b*1,1c*1,1d*1,1e*1,1f*1,1g*1,1h*1,1i*1,1j*1,1k*1,1l*1,1m*1,1n*1,1o*1,1p*1,1q*1,1r*1,1s*1,1t*1,1u*1,1v*1,1w*1,1x*1,1y*1,1z*1,20*1,21*1,22*1,23*1,24*1,25*1,26*1,27*1,28*1,29*1,2a*1,2b*1,2c*1,2d*1,2e*1,2f*1,2g*1,2h*1,2i*1,2j*1,2k*1,2l*1,2m*1,2n*4,2o*1,2p*1,2q*1,2r*1,2s*1,2t*1,2u*1,2v*1,2w*1,2x*1,2y*1,2z*1,30*1,31*1,32*1,33*1,34*1,35*1,36*1,37*1,38*1,39*1,3a*1,3b*1,3c*1,3d*1,3e*1,3f*1,3g*1,3h*1,3i*1,3j*1,3k*1,3l*1,3m*1,3n*1,3o*1,3p*1,3q*1,3r*1,3s*1,3t*1,3u*1,3v*1,3w*1,3x*1,3y*1,3z*1,40*1,41*1,42*1,43*1,44*1,45*1,46*1,47*1,48*1,49*1,4a*1,4b*1,4c*1,4d*1,4e*1,4f*1,4g*1,4h*1,4i*1,4j*1,4k*1,4l*1,4m*1,4n*1,4o*1,4p*1,4q*1,4r*1,4s*1,4t*1,4u*1,4v*1,4w*1,4x*1,4y*1,4z*1,50*1,51*1,52*1,53*1,54*1,55*1,56*1,57*1,58*1,59*1,5a*1,5b*1,5c*1,5d*1,5e*1,5f*1,5g*1,5h*1,5i*1,5j*1,5k*1,5l*1,5m*1,5n*1,5o*1,5p*1,5q*1,5r*1,5s*1,5t*1,5u*1,5v*1,5w*1,5x*1,5y*1,5z*1,60*1,61*1,62*1,63*1,64*1,65*1,66*1,67*1,68*1,69*1,6a*1,6b*1,6c*1,6d*1,6e*1,6f*1,6g*1,6h*1,6i*1,6j*1,6k*1,6l*1,6m*1,6n*1,6o*1,6p*1,6q*1,6r*1,6s*1,6t*1,6u*1,6v*1,6w*1,6x*1,6y*1,6z*1,70*1,71*1,72*1,73*1,74*1,75*1,76*1,77*1,78*1,79*1,7a*1,7b*1,7c*1,7d*1,7e*1,7f*1,7g*1,7h*1,7i*1,7j*1,7k*1,7l*1,7m*1,7n*1,7o*1,7p*1,7q*1,7r*1,7s*1,7t*1,7u*1,7v*1,7w*1,7x*1,7y*1,7z*1,80*1,81*1,82*1,83*1,84*1,85*1,86*1,87*1,88*1,89*1,8a*1,8b*1,8c*1,8d*1,8e*1,8f*1,8g*1,8h*1,8i*1,8j*1,8k*1,8l*1,8m*1,8n*1,8o*1,8p*1,8q*1,8r*1,8s*1,8t*1,8u*1,8v*1,8w*1,8x*1,8y*1,8z*1,90*1,91*1,92*1,93*1,94*1,95*1,96*1,97*1,98*1,99*1,9a*1,9b*1,9c*1,9d*1,9e*1,9f*1,9g*1,9h*1,9i*1,9j*1,9k*1,9l*1,9m*1,9n*1,9o*1,9p*1,9q*1,9r*1,9s*1,9t*1,9u*1,9v*1,9w*1,9x*1,9y*1,9z*1,a0*1,a1*1,a2*1,a3*1,a4*1,a5*1,a6*1,a7*1,a8*1,a9*1,aa*1,ab*1,ac*1,ad*1,ae*1,af*1,ag*1,ah*1,ai*1,aj*1,ak*1,al*1,am*1,an*1,ao*1,ap*1,aq*1,ar*1,as*1,at*1,au*1,av*1,aw*1,ax*1,ay*1,2n*2,az*1,b0*1,b1*1,b2*1,b3*1,b4*1,b5*1,b6*1,b7*1,b8*1,b9*1,ba*1,bb*1,bc*1,bd*1,be*1,bf*1,bg*1,bh*1,bi*1,bj*1,bk*1,bl*1,bm*1,bn*1,bo*1,bp*1,bq*1,br*1,bs*1,bt*1,bu*1,bv*1,bw*1,bx*1,by*1,bz*1,c0*1,c1*1,c2*1,c3*1,c4*1,c5*1,c6*1,c7*1,c8*1,c9*1,ca*1,cb*1,cc*1,cd*1,ce*1,cf*1,cg*1,ch*1,ci*1,cj*1,ck*1,cl*1,cm*1,cn*1,co*1,cp*1,cq*1,cr*1,cs*1,ct*1,cu*1,cv*1,cw*1,cx*1,cy*1,cz*1,d0*1,d1*1,d2*1,d3*1,d4*1,d5*1,d6*1,d7*1,d8*1,d9*1,da*1,db*1,dc*1,dd*1,de*1,df*1,dg*1,dh*1,di*1,dj*1,dk*1,dl*1,dm*1,dn*1,do*1,dp*1,dq*1,dr*1,ds*1,dt*1,du*1,dv*1,dw*1,dx*1,dy*1,dz*1,e0*1,e1*1,e2*1,e3*1,e4*1,e5*1,e6*1,e7*1,e8*1,e9*1,ea*1,eb*1,ec*1,ed*1,ee*1,ef*1,eg*1,eh*1,ei*1,ej*1,ek*1,el*1,em*1,en*1,eo*1,ep*1,eq*1,er*1,es*1,et*1,eu*1,ev*1,ew*1,ex*1,2n*4,ey*1,ez*1,f0*1,f1*1,f2*1,f3*1,f4*1,f5*1,f6*1,f7*1,f8*1,f9*1,fa*1,fb*1,fc*1,fd*1,fe*1,ff*1,fg*1,fh*1,fi*1,fj*1,fk*1,fl*1,fm*1,fn*1,fo*1,fp*1,fq*1,fr*1,fs*1,ft*1,fu*1,fv*1,fw*1,fx*1,fy*1,fz*1,g0*1,g1*1,g2*1,g3*1,g4*1,g5*1,g6*1,5l*1,g7*1,g8*1,g9*1,ga*1,gb*1,gc*1,gd*1,ge*1,gf*1,gg*1,gh*1,gi*1,gj*1,gk*1,gl*1,gm*1,gn*1,go*1,gp*1,gq*1,gr*1,gs*1,gt*1,gu*1,gv*1,gw*1,gx*1,gy*1,gz*1,h0*1,41*1,h1*1,h2*1,h3*1,h4*1,h5*1,h6*1,h7*1,h8*1,h9*1,ha*1,g7*1,hb*1,hc*1,hd*1,he*1,hf*1,hg*1,hh*1,hi*1,hj*1,hk*1,hl*1,hm*1,hn*1,ho*1,hp*1,hq*1,hr*1,hs*1,ht*1,hu*1,hv*1,hw*1,hx*1,hy*1,hz*1,i0*1,i1*1,i2*1,i3*1,i4*1,i5*1,i6*1,i7*1,i8*1,i9*1,ia*1,ib*1,ic*1,id*1,ie*1,if*1,ig*1,ih*1,ii*1,ij*1,ik*1,il*1,im*1,in*1,io*1,ip*1,iq*1,ir*1,is*1,it*1,iu*1,iv*1,iw*1,ix*1,iy*1,iz*1,j0*1,j1*1,j2*1,j3*1,j4*1,j5*1,j6*1,j7*1,j8*1,j9*1,ja*1,jb*1,jc*1,jd*1,je*1,jf*1,jg*1,jh*1,ji*1,jj*1,jk*1,jl*1,jm*1,jn*1,jo*1,jp*1,jq*1,jr*1,js*1,jt*1,2n*1,ju*1,jv*1,jw*1,jx*1,jy*1,jz*1,k0*1,k1*1,k2*1,k3*1,k4*1,k5*1,k6*1,k7*1,k8*1,k9*1,ka*1,kb*1,kc*1,kd*1,ke*1,kf*1,kg*1,kh*1,ki*1,kj*1,kk*1,kl*1,km*1,kn*1,ko*1,kp*1,kq*1,kr*1,ks*1,kt*1,ku*1,kv*1,kw*1,kx*1,ky*1,kz*1,l0*1,l1*1,l2*1,l3*1,l4*1,l5*1,l6*1,l7*1,l8*1,l9*1,la*1,lb*1,lc*1,ld*1,le*1,lf*1,lg*1,lh*1,li*1,lj*1,lk*1,ll*1,lm*1,ln*1,lo*1,lp*1,lq*1,lr*1,ls*1,lt*1,lu*1,lv*1,lw*1,lx*1,ly*1,lz*1,m0*1,m1*1,m2*1,m3*1,m4*1,m5*1,m6*1,m7*1,m8*1,m9*1,ma*1,mb*1,mc*1,md*1,me*1,mf*1,mg*1,mh*1,mi*1,mj*1,mk*1,ml*1,mm*1,mn*1,mo*1,mp*1,mq*1,mr*1,ms*1,mt*1,mu*1,mv*1,mw*1,mx*1,my*1,mz*1,n0*1,n1*1,n2*1,n3*1,n4*1,n5*1,n6*1,n7*1,n8*1,n9*1,na*1,nb*1,nc*1,nd*1,ne*1,nf*1,ng*1,nh*1,ni*1,nj*1,nk*1,nl*1,nm*1,nn*1,no*1,np*1,nq*1,nr*1,ns*1,nt*1,nu*1,nv*1,nw*1,nx*1,ny*1,nz*1,o0*1,o1*1,o2*1,o3*1,o4*1,o5*1,o6*1,o7*1,o8*1,o9*1,oa*1,ob*1,oc*1,od*1,oe*1,of*1,og*1,oh*1,oi*1,oj*1,ok*1,ol*1,om*1,on*1,oo*1,op*1,oq*1,or*1,os*1,ot*1,ou*1,ov*1,ow*1,ox*1,oy*1,oz*1,p0*1,p1*1,p2*1,p3*1,p4*1,p5*1,p6*1,p7*1,p8*1,p9*1,pa*1,pb*1,pc*1,pd*1,pe*1,pf*1,pg*1,ph*1,pi*1,pj*1,pk*1,pl*1,pm*1,pn*1,po*1,pp*1,pq*1,pr*1,ps*1,pt*1,pu*1,pv*1,pw*1,px*1,py*1,pz*1,q0*1,q1*1,q2*1,q3*1,q4*1,q5*1,q6*1,q7*1,q8*1,q9*1,qa*1,qb*1,qc*1,qd*1,qe*1,qf*1,qg*1,qh*1,qi*1,qj*1,qk*1,ql*1,qm*1,qn*1,qo*1,qp*1,qq*1,qr*1,qs*1,qt*1,qu*1,qv*1,qw*1,qx*1,qy*1,qz*1,r0*1,r1*1,r2*1,r3*1,r4*1,r5*1,r6*1,r7*1,r8*1,r9*1,ra*1,rb*1,rc*1,rd*1,re*1,rf*1,rg*1,rh*1,ri*1,rj*1,rk*1,rl*1,rm*1,rn*1,ro*1,rp*1,rq*1,rr*1,rs*1,rt*1,ru*1,rv*1,rw*1,rx*1,ry*1,rz*1,s0*1,s1*1,s2*1,s3*1,s4*1,s5*1,s6*1,s7*1,s8*1,s9*1,sa*1,sb*1,sc*1,sd*1,se*1,sf*1,sg*1,sh*1,si*1,sj*1,sk*1,sl*1,sm*1,sn*1,so*1,sp*1,sq*1,sr*1,ss*1,st*1,su*1,sv*1,sw*1,sx*1,sy*1,sz*1,t0*1,t1*1,t2*1,t3*1,t4*1,t5*1,t6*1,t7*1,t8*1,t9*1,ta*1,tb*1,tc*1,td*1,te*1,tf*1,tg*1,th*1,ti*1,tj*1,tk*1,tl*1,tm*1,tn*1,to*1,tp*1,tq*1,tr*1,ts*1,tt*1,tu*1,tv*1,tw*1,tx*1,ty*1,tz*1,u0*1,u1*1,u2*1,u3*1,u4*1,u5*1,u6*1,u7*1,u8*1,u9*1,ua*1,ub*1,uc*1,ud*1,ue*1,uf*1,ug*1,uh*1,ui*1,uj*1,uk*1,ul*1,um*1,un*1,uo*1,up*1,uq*1,ur*1,us*1,ut*1,uu*1,uv*1,uw*1,ux*1,uy*1,uz*1,v0*1,v1*1,v2*1,v3*1,v4*1,v5*1,v6*1,v7*1,v8*1,v9*1,va*1,vb*1,vc*1,vd*1,ve*1,vf*1,vg*1,vh*1,vi*1,vj*1,vk*1,vl*1,vm*1,vn*1,vo*1,vp*1,vq*1,vr*1,vs*1,vt*1,vu*1,vv*1,vw*1,vx*1,vy*1,vz*1,w0*1,w1*1,w2*1,w3*1,w4*1,w5*1,w6*1,w7*1,w8*1,w9*1,wa*1,wb*1,wc*1,wd*1,we*1,wf*1,wg*1,wh*1,wi*1,wj*1,wk*1,wl*1,wm*1,wn*1,wo*1,wp*1,wq*1,wr*1,ws*1,wt*1,wu*1,wv*1,ww*1,wx*1,wy*1,wz*1,x0*1,x1*1,x2*1,x3*1,x4*1,x5*1,x6*1,x7*1,x8*1,x9*1,xa*1,xb*1,xc*1,xd*1,xe*1,xf*1,xg*1,xh*1,xi*1,xj*1,xk*1,xl*1,xm*1,xn*1,xo*1,xp*1,xq*1,xr*1,xs*1,xt*1,xu*1,xv*1,xw*1,xx*1,xy*1,xz*1,y0*1,y1*1,y2*1,y3*1,y4*1,y5*1,y6*1,y7*1,y8*1,y9*1,ya*1,yb*1,yc*1,yd*1,ye*1,yf*1,yg*1,yh*1,yi*1,yj*1,yk*1,yl*1,ym*1,yn*1,yo*1,yp*1,yq*1,yr*1,ys*1,yt*1,yu*1,yv*1,yw*1,yx*1,yy*1,yz*1,z0*1,z1*1,z2*1,z3*1,z4*1,z5*1,z6*1,z7*1,z8*1,z9*1,za*1,zb*1,zc*1,zd*1,ze*1,zf*1,zg*1,zh*1,zi*1,zj*1,zk*1,zl*1,zm*1,zn*1,zo*1,zp*1,zq*1,zr*1,zs*1,zt*1,zu*1,zv*1,zw*1,zx*1,zy*1,zz*1,100*1,101*1,102*1,103*1,104*1,105*1,106*1,107*1,108*1,109*1,10a*1,10b*1,10c*1,10d*1,10e*1,10f*1,10g*1,10h*1,10i*1,10j*1,10k*1,10l*1,10m*1,10n*1,10o*1,10p*1,10q*1,10r*1,10s*1,10t*1,10u*1,10v*1,10w*1,10x*1,10y*1,10z*1,110*1,111*1,112*1,113*1,114*1,115*1,116*1,117*1,118*1,119*1,11a*1,11b*1,11c*1,11d*1,11e*1,11f*1,11g*1,11h*1,11i*1,11j*1,11k*1,11l*1,11m*1,11n*1,11o*1,11p*1,11q*1,11r*1,11s*1,11t*1,11u*1,11v*1,11w*1,11x*1,11y*1,11z*1,120*1,121*1,122*1,123*1,124*1,125*1,126*1,127*1,128*1,129*1,12a*1,12b*1,12c*1,12d*1,12e*1,12f*1,12g*1,12h*1,12i*1,12j*1,12k*1,12l*1,12m*1,12n*1,12o*1,m3*1,12p*1,12q*1,12r*1,12s*1,12t*1,12u*1,12v*1,12w*1,12x*1,12y*1,12z*1,130*1,131*1,132*1,133*1,134*1,135*1,136*1,137*1,138*1,139*1,13a*1,13b*1,13c*1,13d*1,13e*1,13f*1,13g*1,13h*1,13i*1,13j*1,13k*1,13l*1,13m*1,13n*1,13o*1,13p*1,13q*1,13r*1,13s*1,13t*1,13u*1,13v*1,13w*1,13x*1,13y*1,13z*1,140*1,141*1,142*1,143*1,144*1,145*1,146*1,147*1,148*1,149*1,14a*1,14b*1,14c*1,14d*1,14e*1,14f*1,14g*1,14h*1,14i*1,14j*1,14k*1,14l*1,14m*1,14n*1,14o*1,14p*1,14q*1,14r*1,14s*1,14t*1,14u*1,14v*1,14w*1,14x*1,14y*1,14z*1,150*1,151*1,152*1,153*1,154*1,155*1,156*1,157*1,158*1,159*1,15a*1,15b*1,15c*1,15d*1,15e*1,15f*1,15g*1,15h*1,15i*1,15j*1,15k*1,15l*1,15m*1,15n*1,15o*1,15p*1,15q*1,15r*1,15s*1,15t*1,15u*1,15v*1,15w*1,15x*1,15y*1,15z*1,160*1,161*1,162*1,163*1,164*1,165*1,166*1,167*1,168*1,169*1,16a*1,16b*1,16c*1,16d*1,16e*1,16f*1,16g*1,16h*1,16i*1,16j*1,16k*1,16l*1,16m*1,16n*1,16o*1,16p*1,16q*1,16r*1,16s*1,16t*1,16u*1,16v*1,16w*1,16x*1,16y*1,16z*1,170*1,171*1,172*1,173*1,174*1,175*1,176*1,177*1,178*1,tb*1,179*1,17a*1,17b*1,17c*1,17d*1,17e*1,17f*1,17g*1,17h*1,17i*1,17j*1,17k*1,17l*1,17m*1,17n*1,17o*1,17p*1,17q*1,17r*1,17s*1,17t*1,17u*1,17v*1,17w*1,17x*1,17y*1,17z*1,180*1,181*1,182*1,183*1,184*1,185*1,186*1,187*1,188*1,189*1,18a*1,18b*1,18c*1,18d*1,18e*1,18f*1,18g*1,18h*1,18i*1,18j*1,18k*1,18l*1,18m*1,2n*1t,18n*1,18o*1,18p*1,18q*1,18r*1,18s*1,18t*1,18u*1,18v*1,18w*1,18x*1,18y*1,18z*1,190*1,191*1,192*1,193*1,194*1,195*1,196*1,197*1,198*1,199*1,19a*1,19b*1,19c*1,19d*1,19e*1,19f*1,19g*1,19h*1,19i*1,19j*1,19k*1,19l*1,19m*1,19n*1,19o*1,19p*1,19q*1,19r*1,19s*1,4o*1,19t*1,19u*1,19v*1,19w*1,19x*1,19y*1,19z*1,1a0*1,1a1*1,1a2*1,1a3*1,1a4*1,1a5*1,1a6*1,1a7*1,1a8*1,1a9*1,1aa*1,1ab*1,1ac*1,2n*2,1ad*1,1ae*1,1af*1,1ag*1,1ah*1,1ai*1,1aj*1,1ak*1,1al*1,1am*1,1an*1,1ao*1,1ap*1,1aq*1,1ar*1,1as*1,1at*1,1au*1,1av*1,1aw*1,1ax*1,1ay*1,1az*1,1b0*1,1b1*1,1b2*1,1b3*1,1b4*1,1b5*1,1b6*1,1b7*1,1b8*1,1b9*1,1ba*1,1bb*1,1bc*1,1bd*1,1be*1,1bf*1,1bg*1,1bh*1,1bi*1,1bj*1,1bk*1,1bl*1,1bm*1,1bn*1,1bo*1,1bp*1,1bq*1,1br*1,1bs*1,1bt*1,1bu*1,1bv*1,1bw*1,1bx*1,1by*1,1bz*1,1c0*1,1c1*1,1c2*1,1c3*1,1c4*1,1c5*1,1c6*1,1c7*1,1c8*1,1c9*1,1ca*1,1cb*1,1cc*1,1cd*1,1ce*1,1cf*1,1cg*1,1ch*1,1ci*1,1cj*1,1ck*1,1cl*1,1cm*1,1cn*1,1co*1,1cp*1,1cq*1,1cr*1,1cs*1,1ct*1,1cu*1,1cv*1,1cw*1,1cx*1,1cy*1,1cz*1,1d0*1,1d1*1,1d2*1,1d3*1,1d4*1,1d5*1,1d6*1,1d7*1,1d8*1,1d9*1,1da*1,1db*1,1dc*1,1dd*1,1de*1,1df*1,1dg*1,1dh*1,1di*1,1dj*1,1dk*1,1dl*1,1dm*1,1dn*1,1do*1,1dp*1,1dq*1,1dr*1,1ds*1,1dt*1,1du*1,1dv*1,1dw*1,1dx*1,1dy*1,1dz*1,1e0*1,1e1*1,1e2*1,1e3*1,1e4*1,1e5*1,1e6*1,1e7*1,1e8*1,1e9*1,1ea*1,1eb*1,1ec*1,1ed*1,1ee*1,1ef*1,1eg*1,1eh*1,1ei*1,1ej*1,1ek*1,1el*1,1em*1,1en*1,1eo*1,1ep*1,1eq*1,1er*1,1es*1,1et*1,1eu*1,1ev*1,1ew*1,1ex*1,1ey*1,1ez*1,1f0*1,1f1*1,1f2*1,1f3*1,1f4*1,1f5*1,1f6*1,1f7*1,1f8*1,1f9*1,1fa*1,1fb*1,1fc*1,1fd*1,1fe*1,1ff*1,1fg*1,1fh*1,1fi*1,1fj*1,1fk*1,1fl*1,1fm*1,1fn*1,1fo*1,1fp*1,1fq*1,1fr*1,1fs*1,1ft*1,1fu*1,1fv*1,1fw*1,1fx*1,1fy*1,1fz*1,1g0*1,1g1*1,1g2*1,1g3*1,1g4*1,1g5*1,1g6*1,1g7*1,1g8*1,1g9*1,1ga*1,1gb*1,1gc*1,1gd*1,1ge*1,1gf*1,1gg*1,1gh*1,1gi*1,1gj*1,1gk*1,1gl*1,1gm*1,1gn*1,1go*1,1gp*1,1gq*1,1gr*1,1gs*1,1gt*1,1gu*1,1gv*1,1gw*1,1gx*1,1gy*1,1gz*1,1h0*1,1h1*1,1h2*1,wq*1,1h3*1,1h4*1,1h5*1,1h6*1,1h7*1,1h8*1,1h9*1,1ha*1,1hb*1,1hc*1,1hd*1,1he*1,1hf*1,1hg*1,1hh*1,1hi*1,1hj*1,1hk*1,1hl*1,1hm*1,1hn*1,1ho*1,1hp*1,1hq*1,1hr*1,1hs*1,1ht*1,1hu*1,1hv*1,1hw*1,1hx*1,1hy*1,1hz*1,1i0*1,1i1*1,1i2*1,1i3*1,1i4*1,1i5*1,1i6*1,1i7*1,1i8*1,1i9*1,1ia*1,1ib*1,1ic*1,1id*1,1ie*1,1if*1,1ig*1,1ih*1,1ii*1,1ij*1,1ik*1,1il*1,1im*1,1in*1,1io*1,1ip*1,1iq*1,1ir*1,1is*1,1it*1,1iu*1,1iv*1,1iw*1,1ix*1,1iy*1,1iz*1,1j0*1,1j1*1,1j2*1,c4*1,1j3*1,1j4*1,1j5*1,1j6*1,1j7*1,1j8*1,1j9*1,1ja*1,1jb*1,1jc*1,1jd*1,1je*1,1jf*1,1jg*1,1jh*1,1ji*1,1jj*1,1jk*1,1jl*1,1jm*1,1jn*1,1jo*1,1jp*1,1jq*1,1jr*1,1js*1,1jt*1,1ju*1,1jv*1,1jw*1,1jx*1,1jy*1,1jz*1,1k0*1,1k1*1,1k2*1,1k3*1,1k4*1,1k5*1,1k6*1,1k7*1,1k8*1,1k9*1,1ka*1,1kb*1,1kc*1,1kd*1,1ke*1,1kf*1,1kg*1,1kh*1,1ki*1,1kj*1,1kk*1,1kl*1,1km*1,1kn*1,1ko*1,1kp*1,1kq*1,1kr*1,1ks*1,1kt*1,1ku*1,1kv*1,1kw*1,1kx*1,1ky*1,1kz*1,1l0*1,1l1*1,1l2*1,1l3*1,1l4*1,1l5*1,1l6*1,1l7*1,1l8*1,1l9*1,1la*1,1lb*1,1lc*1,1ld*1,1le*1,1lf*1,1lg*1,1lh*1,1li*1,1lj*1,1lk*1,1ll*1,i*2,1lm*1,d*2,g*2,7*1,1ln*1,1lo*1,f*1,1lp*1,1lq*1,h*2,9*4,a*1,e*2,1lr*1,1ls*1,l*1,c*2,1lt*1,1lu*1,j*1,6*1,1lv*1,1lw*1,k*2,1lx*1,b*1,8*2,s*1,1ly*1,q*3,o*2,r*4,1lz*1,n*1,1m0*1,1m1*1,1m2*1,p*1,m*1,d9*2,dd*4,dl*4,cj*g,dn*4,cw*7,1m3*1,cq*9,ci*3,cz*f,da*5,cy*4,cg*b,ct*8,ch*7,df*9,do*2,1m4*1,d4*2,d8*4,dm*4,de*3,dc*3,1m5*1,dk*2,dj*1,di*1,d5*5,cr*5,dg*3,cu*7,1m6*1,dh*1,d2*b,d7*3,d1*1,db*5,ck*5,1m7*1,d6*7,d3*2,cx*5,d0*2,1m8*1,cv*5,cs*5,1m9*1,1ma*1,cp*4,co*2,cn*j,cm*c,cl*3,1mb*1,17*d,1h*b,1g*7,1b*2,14*7,1mc*1,1c*3,1d*8,1f*3,19*b,15*l,12*7,1a*8,13*3,1e*3,16*4,18*4,1md*1,1me*1,1i*2z,1k*a,21*3,1o*c,1x*4,1u*s,1n*c,1m*e,1p*1,22*3,1y*3,25*2,1w*a,1j*f,1q*5,1s*a,20*f,1t*8,23*1,24*5,1l*r,1z*2,1v*1,1r*7,1mf*1,u*2,w*1,x*1,z*2,1mg*1,10*1,t*1,y*1,v*a,2l*1,2k*2e,2i*2,2h*1c,2f*9,2m*3,2j*3o,2g*o,1mh*1,28*4,2a*7,2d*1,2b*a,29*4,2c*4,27*m,2e*5,2s*4,1mi*1,1mj*1,1mk*1,1ml*1,1mm*1,2q*d,1mn*1,1mo*1,1mp*1,1mq*1,1mr*1,1ms*1,1mt*1,1mu*1,1mv*1,1mw*1,1mx*1,1my*1,1mz*1,1n0*1,1n1*1,2p*1,1n2*1,1n3*1,1n4*1,1n5*1,2o*1,1n6*1,1n7*1,1n8*1,1n9*1,1na*1,1nb*1,1nc*1,1nd*1,1ne*1,2r*2,1nf*1,1ng*1,1nh*1,1ni*1,1nj*1,1nk*1,5j*1,5i*1,3z*2,1nl*1,40*2,32*e,2w*s,2x*10,31*g,2z*6,30*e,2v*b,2y*6,1nm*1,5u*8,5t*8,5r*8,5q*e,1nn*1,5v*5,5s*6,34*h,33*40,35*1n,5w*1,5x*1,1no*1,4a*3,47*8,45*7,48*7,4c*6,4f*3,46*4,4b*2,49*5,4d*4,4e*5,1np*1,1nq*1,1nr*1,1ns*1,4p*3,1nt*1,4m*8,4o*4,4q*1,1nu*1,4n*3,4l*8,4k*3,1nv*1,1nw*1,2t*g,2u*4,5l*6,1nx*1,1ny*1,1nz*1,1o0*1,1o1*1,5n*4,1o2*1,5o*1,1o3*1,5m*2,5f*c,4w*1h,52*7,4y*1e,4z*6p,4v*3l,57*15,5e*s,5c*1v,4r*3f,5b*1d,5d*z,58*6m,4t*3e,4u*1i,5a*3e,4s*3i,4x*11,50*w,59*3h,56*2h,5g*n,5h*6,54*2r,55*b1,53*y,51*b,4i*1,4j*3,3u*3,3y*2,1o4*1,3t*1,3p*3,1o5*1,3r*1,3o*1,3x*2,3k*3,1o6*1,1o7*1,3w*4,1o8*1,1o9*1,1oa*1,1ob*1,3s*1,1oc*1,3v*1,1od*1,3q*2,3n*1,3m*1,3l*2,1oe*1,1of*1,3b*8,3f*1,37*4,38*7,39*7,3c*9,3d*3,3g*7,3e*3,3a*3,36*4,3i*2,3h*3,44*1,1og*1,1oh*1,1oi*1,1oj*1,43*2,1ok*1,1ol*1,1om*1,1on*1,1oo*1,54*1,1op*1,rc*2,rh*1,ri*1,1oq*1,re*1,rf*1,1or*1,1os*1,1ot*1,rk*1,rb*2,rg*1,1ou*1,r7*3,1ov*1,1ow*1,1ox*1,1oy*1,rj*1,rd*1,1oz*1,r9*1,r8*4,ra*2,8o*4,37*b,8j*5,8k*9,4g*b,8l*7,5p*9,8p*4,8n*a,8m*a,61*w,5y*30,63*4,65*a,64*4,1p0*1,62*d,5z*5c,1p1*1,60*3e,66*f,1p2*1,1p3*1,1p4*1,1p5*1,1p6*1,1p7*1,6y*1,1p8*1,6z*1,1p9*1,1pa*1,1pb*1,1pc*1,72*3,6x*4,6w*2,1pd*1,70*2,71*1,1pe*1,1pf*1,1ah*1,1pg*1,1am*2,1ph*1,1pi*1,1aj*2,1al*2,1pj*1,1pk*1,1ai*1,1ap*2,1ak*3,1ao*3,1ag*2,1af*1,1pl*1,1ae*1,1pm*1,1pn*1,1an*3,1ad*1,8a*2,85*h,1po*1,87*2,8h*1,89*k,86*5,8f*a,88*5,8b*b,8e*5,8d*7,8g*1,8c*l,8i*2,84*m,2n*2,9f*y,9i*7,91*ci,9c*o,8t*3i,9b*2x,9d*18,8y*z,8x*t,99*13,9k*23,93*14,98*1j,92*16,9h*14,8w*4a,9e*s,9j*1f,96*1e,97*o,8u*g,90*u,8z*4w,94*11,9a*i,8v*1s,9g*6,8s*h,8r*37,8q*38,95*16,2n*2,1pp*1,9n*19,a1*1,a3*i,ab*1,9v*g,9x*5,9s*9,a8*2,9o*4,9z*c,9u*e,a2*2,1u*e,9l*k,1pq*1,a0*9,9r*7,a4*c,9p*5,9w*9,9q*6,a9*3,a7*5,a5*7,1pr*1,9t*d,9y*a,a6*i,9m*k,1ps*1,aa*1,1pt*1,1pu*1,78*5,1pv*1,75*3,79*2,77*1,7a*1,74*1,76*1,6q*8,6n*2,6h*2,6s*2,6c*5,6f*5,68*3,6g*3,6a*3,6l*1,6u*1,1pw*1,6t*6,6e*4,6o*4,6r*5,6k*2,6j*2,6m*1,6b*c,6i*2,69*2,6p*2,6d*8,67*3,1px*1,1py*1,ag*2,ac*3,ai*2,af*3,ae*2,ah*2,ad*k,1pz*1,1q0*1,jp*2,1q1*1,1q2*1,1q3*1,1q4*1,1q5*1,1q6*1,1q7*1,1q8*1,1q9*1,jo*1,1qa*1,jn*1,1qb*1,jm*2,jl*2,au*8,an*9,ao*7,av*7,aj*b,aw*3,am*o,aq*8,1qc*1,ax*5,ap*a,at*6,al*5,ak*7,as*3,ar*b,az*2,1qd*1,b2*1,b0*2,b1*4,1qe*1,bd*3,be*f,b3*4,bg*2,b9*c,bc*4,bb*2,bf*1,b6*u,ba*4,b4*b,b8*a,b7*4,b5*7,83*5,7v*y,82*f,1qf*1,81*f,7u*5,7z*e,7t*s,7s*p,7y*c,7x*8,7w*4,80*5,c0*r,c1*a,c3*3,c2*b,bz*b,1qg*1,1qh*1,1qi*1,by*1,1qj*1,1qk*1,1ql*1,1qm*1,1qn*1,1qo*1,1qp*1,1qq*1,1qr*1,1qs*1,cb*1,1qt*1,ce*2,1qu*1,1qv*1,1qw*1,cc*2,c5*5,1qx*1,ca*2,c7*2,1qy*1,c9*1,c8*2,1qz*1,c6*2,1r0*1,cf*2,cd*1,e3*1,9v*1,e2*1,1r1*1,1r2*1,dx*2,dt*6,dv*2,dq*e,e0*2,e1*2,dr*5,ds*7,1r3*1,1r4*1,dy*1,1r5*1,dw*3,du*1,1r6*1,1r7*1,dz*1,2n*1,ew*3,et*5,ei*a,ej*h,ef*8,es*7,ea*i,eq*8,ed*6,e7*7,er*c,eu*2,eh*b,ec*3,eg*6,em*a,ee*9,ep*3,en*3,ev*4,e9*9,eo*b,e8*7,el*l,eb*a,ek*1,ex*2,1r8*1,1r9*1,1ra*1,19y*1,19z*3,1rb*1,1rc*1,19x*1,19u*9,1rd*1,19w*2,19v*3,19t*2,1re*1,1rf*1,1rg*1,hn*1,1rh*1,f0*1,ez*1,1ri*1,1rj*1,e5*9,e6*1,1rk*1,1rl*1,1ac*1,1rm*1,2n*2,1rn*1,fp*8,fm*1i,fq*3,fn*c,1ro*1,1rp*1,1rq*1,fi*23,fk*4,fh*j,fj*j,fo*6,fl*h,2n*1,1rr*1,5l*2,41*1,g7*2,g3*3,1rs*1,1rt*1,g0*3,g5*4,fx*2,g6*1,fs*3,fu*3,fv*2,g2*3,fr*a,g1*1,g4*1,fy*2,fz*2,fw*7,ft*11,gb*1w,gg*j,gd*h,gf*m,gk*1,g9*13,ga*1n,g8*6z,ge*16,gi*q,gj*w,gh*o,gc*27,h0*4,125*2,1ru*1,go*3,gp*1,gn*1,1rv*1,1rw*1,1rx*1,1ry*1,gm*1,hb*c,1rz*1,hc*1,1s0*1,g7*f,gx*1,gz*1,gv*2,1s1*1,gy*1,gu*1,1s2*1,gw*2,1s3*1,bs*3r,bl*37,bk*11,bw*3,br*19,bp*2l,bo*3a,bq*b,bj*8d,bi*z,bv*o,bh*1h,bm*t,bu*v,bn*1w,bt*q,h9*3,h5*c,h2*6,h1*4,5l*d,h6*a,h4*i,1s4*1,41*3,1s5*1,h7*1,h8*2,h3*1,ha*7,g7*8,1s6*1,2n*1,ho*1j,hr*3,hx*m,hs*2,hy*5,ht*2,1s7*1,hv*1,hq*4,hw*1,hp*4,hu*4,hz*2,1s8*1,c4*1,hl*9,1s9*1,1sa*1,1sb*1,im*1,1sc*1,ic*4,ih*1,i0*8,il*1,if*1,i7*6,i2*c,i5*2,ii*3,id*1,ij*2,ie*2,ig*8,i8*2,ia*4,i4*7,ib*3,ik*2,i6*2,i9*5,i3*3,i1*1,1sd*1,he*8,hk*2,hd*9,hh*6,hg*6,hf*2,hi*1,hj*5,in*1,io*b,1se*1,1sf*1,1sg*1,jq*5,37*1,1sh*1,1si*1,3a*3,1sj*1,js*1,jr*d,1sk*1,jt*1,2n*1,jd*3,ji*1,jb*3,ja*4,jf*3,j7*a,jc*3,je*2,j9*1,4o*1,jj*2,1sl*1,jk*3,jg*6,jh*1,j8*7,2n*4,j6*4,26*a,j5*3,iw*i,j0*3,is*5,j3*1,j1*3,iv*g,j4*b,iy*a,j2*3,iq*4,iz*3,ix*1,iu*b,it*4,ir*a,kc*5,kb*2,jx*5,jv*6,k2*1a,jw*4,k8*1,k9*2,jy*5,k0*2,ju*4,k5*4,1sm*1,k1*m,ka*1,jz*2,k7*2,k6*1,k4*4,k3*2,c0*3,nx*1,mh*3,lt*4y,mc*6,m8*1l,lw*49,1sn*1,m5*1w,me*7,mg*24,m1*f,ly*61,lu*2l,m4*c,lm*y,md*28,ls*65,lz*a7,mi*2,lx*6s,lr*8z,m7*c,ma*b,mf*6,lo*9,mb*2o,m0*8,m3*39,lv*5s,1so*1,ln*dw,lq*32,m9*e,lp*99,m2*r,m6*3u,ke*a,ko*g,kx*4,l0*7,lc*1,kg*27,l5*4,kt*2,kr*4,kh*20,l6*4,km*b,1sp*1,kk*1,kn*1,l3*5,ku*3,kp*6,kv*3,ks*5,kq*6,kd*v,lb*4,la*3,kw*1,kz*5,ld*1,kj*9,ky*7,l8*3,kl*2,ki*1t,l2*7,l1*6,l7*2,l9*1,l4*6,kf*d,nb*a,nt*4,nd*d,nn*5,n4*i,ne*v,na*g,n8*d,ni*6,nr*a,nu*4,no*z,nh*g,n6*a,nc*u,nf*5,np*7,n5*9,nl*a,n3*i,nm*4,n2*a,nq*1,nj*h,n7*5,nv*a,ns*4,n1*1e,nk*g,ng*8,n9*3,mz*4,mr*7,mp*6,mw*3,mk*8,mt*3,ms*6,mj*7,mo*a,1sq*1,mv*1,mm*1,mu*2,my*1,n0*2,mn*6,ml*7,mq*8,mx*4,lg*1,le*u,lf*8,1sr*1,1ss*1,li*p,lj*i,lh*6,1st*1,lk*n,iy*g,ll*c,oa*d,1su*1,o1*1q,og*1,nz*f,o3*2s,o2*y,ob*6,o6*1h,o9*a,o4*2n,of*2,o8*1z,o0*f,ny*1p,od*f,oc*6,o7*12,oe*6,o5*12,1sv*1,1sw*1,1sx*1,oi*1,1sy*1,oh*3,oj*1,1sz*1,ps*1j,px*h,q2*f,pn*1c,pl*h,pu*c,ox*1g,py*m,ow*v,p1*l,pi*n,q1*1c,ou*18,oy*1i,pk*g,q0*k,ov*c,po*s,ot*z,pf*b,p9*o,oz*l,p6*l,pz*q,pv*f,pq*s,pw*g,pe*m,p2*v,p7*g,pr*f,p4*n,pc*11,pm*e,p0*1s,p8*g,pb*8,pg*y,ph*q,pj*c,p5*39,p3*7,pa*h,os*e,pt*f,pd*f,pp*i,1t0*1,oq*1,ok*8,1t1*1,ol*3,on*4,1t2*1,oo*2,om*1,1t3*1,or*1,1t4*1,op*2,su*3,sh*4,1t5*1,ss*5,st*5,1t6*1,si*3,1t7*1,sl*4,sk*5,so*4,sm*6,sg*2,1t8*1,sv*2,1t9*1,sq*9,sn*1,sj*1,sp*5,sr*4,qx*1,q4*2,qt*2,1ta*1,1tb*1,qg*2,qy*1,qj*4,qn*2,1tc*1,qc*6,q5*4,q6*1,qh*2,qo*1,qk*1,q9*2,qi*1,1td*1,ql*5,q3*3,qf*4,1te*1,qp*1,qr*1,qd*4,qq*1,qm*2,qa*4,qe*8,1tf*1,1tg*1,1th*1,r0*2,qb*2,1ti*1,r1*1,q8*1,qs*1,1tj*1,qw*1,qv*1,qz*1,1tk*1,q7*1,qu*1,1tl*1,ru*7,1tm*1,rn*4,1tn*1,rt*h,rq*5,rs*5,rp*5,rv*2,rr*9,rm*h,ro*a,rw*3,s8*1,s2*d,s6*1,1to*1,ry*d,s9*1,s1*s,rx*h,s3*d,sa*1,s4*7,s5*c,rz*h,s0*6,1tp*1,s7*1,1tq*1,1kn*1,1kr*2,1km*1,1kl*3,1kq*1,1kp*3,1ko*3,sd*5,se*2,sb*1,1tr*1,sc*4,1ts*1,r2*4,1tt*1,r4*6,r3*2,r5*8,1tu*1,r6*4,1tv*1,sz*1,sy*1,1tw*1,1tx*1,1ty*1,1tz*1,1u0*1,1u1*1,1u2*1,sx*2,1u3*1,1u4*1,1u5*1,1u6*1,1u7*1,1u8*1,1u9*1,1ua*1,1ub*1,1uc*1,1ud*1,1ue*1,tw*1,1uf*1,1ug*1,1uh*1,t3*3,t4*1,t5*2,t6*1,t1*1,t2*3,tl*1,1ui*1,tm*1,1uj*1,1uk*1,1ul*1,1um*1,1un*1,1uo*1,1up*1,1uq*1,1ur*1,ti*1,tk*1,tj*1,1us*1,th*3,1ut*1,u3*1,ud*4,1uu*1,u1*1,u2*1,u7*3,u0*2,u4*3,ua*5,ty*1,tz*1,u6*6,u5*2,uc*1,1uv*1,ub*1,u9*1,u8*4,ue*1,1uw*1,1ux*1,1uy*1,ts*6,tr*3,1uz*1,1v0*1,tq*1,1v1*1,tp*2,tn*1,to*d,tu*1,2n*2,wb*1,wc*1,vc*5,vg*2,va*9,uz*6,v1*4,v4*2,v3*7,ux*3,uw*5,v2*1,v7*4,v0*1,vh*5,uy*3,ve*1,v5*2,vd*1,vb*2,v8*4,3v*6,vf*2,v6*6,v9*3,ws*7,wq*5,wr*8,xt*1j,xp*r,xx*a,y1*o,1v2*1,y0*h,xz*e,xq*c,xv*r,xr*v,y2*1,1v3*1,xw*i,xy*w,xs*1t,xu*6,1v4*1,1v5*1,vs*3,vq*6,1v6*1,vn*f,1v7*1,vr*5,vp*a,vm*9,vo*2,1v8*1,1v9*1,1va*1,1vb*1,1vc*1,1vd*1,vi*1,wd*7,2n*1,d9*1,wh*3,wi*2,1ve*1,1vf*1,1vg*1,wf*3,wj*1,1vh*1,1vi*1,wk*1,wg*2,1vj*1,wp*1,1vk*1,1vl*1,wo*2,wn*3,1vm*1,1vn*1,1kz*1,1vo*1,1ky*2,xn*5,xe*f,xm*4,xa*3,x0*p,xo*c,xi*j,xj*4,xl*7,xh*w,ww*h,wy*h,xd*1f,wv*2f,x1*q,xf*u,wz*f,xk*9,x9*m,x7*h,wx*10,x6*6,x5*5,wu*a,xc*c,xb*e,x3*d,wt*c,x8*b,x2*1g,x4*d,xg*a,1vp*1,1vq*1,1vr*1,1vs*1,1vt*1,ut*2,1vu*1,1vv*1,uu*1,1vw*1,1vx*1,1vy*1,1vz*1,1w0*1,us*3,1w1*1,uq*1,1w2*1,1w3*1,1w4*1,1w5*1,wa*1,1w6*1,1w7*1,1w8*1,1w9*1,1wa*1,1wb*1,1wc*1,1wd*1,w9*1,1we*1,w8*1,1wf*1,w7*1,1wg*1,1wh*1,1wi*1,1wj*1,1wk*1,1wl*1,1wm*1,1wn*1,1wo*1,uh*h,ul*o,uj*a,uo*n,up*3,ug*h,ui*h,un*p,uk*i,um*f,y8*6,y3*4,y5*3,yb*5,1wp*1,y9*3,ya*e,yc*2,y4*6,y6*3,y7*9,vu*f,vt*d,1wq*1,w3*8,1wr*1,w5*3,vx*8,w0*c,vy*a,w4*2,w2*a,vw*a,vz*n,w1*2,vv*1b,yf*1,1ws*1,yi*1,yd*1,ye*1,1wt*1,1wu*1,yh*2,1wv*1,yg*2,1ww*1,1wx*1,10x*b,10t*2,10z*1,10y*8,10u*5,10w*7,10v*5,10e*3,108*5,10d*4,106*y,109*7,10a*d,10b*y,105*1a,103*j,104*1h,107*j,10c*4,yj*2,115*n,117*2,112*4,1wy*1,116*1,111*2,1wz*1,114*1,1x0*1,1x1*1,1x2*1,1x3*1,1x4*1,113*3,110*7,102*1,zv*2,zt*4,1x5*1,1x6*1,zz*1,1x7*1,100*2,1x8*1,zs*5,101*1,zw*1,zu*1,zy*1,1x9*1,zx*2,yq*2,yp*2,yk*3,yo*8,1xa*1,yl*5,yn*9,ym*5,z2*4,yu*5,z0*4,z4*a,zq*3,yv*1,z7*5,zm*a,z3*4,yy*7,zr*4,z1*4,zk*a,zl*5,zo*1,zd*7,zi*3,zp*6,yt*9,yx*4,zn*3,yr*4,zj*7,ze*7,z8*i,yz*5,ys*b,za*b,zh*5,zg*i,z9*d,zf*2,zc*6,z5*3,yw*4,zb*6,z6*4,2n*2,1xb*1,vl*1,1xc*1,1xd*1,1xe*1,1xf*1,1xg*1,1xh*1,vk*6,1xi*1,1xj*1,1xk*1,1xl*1,1xm*1,1xn*1,1xo*1,1xp*1,1xq*1,1xr*1,1xs*1,1xt*1,1xu*1,1xv*1,1xw*1,1xx*1,1xy*1,1xz*1,1y0*1,1y1*1,1y2*1,1y3*1,10r*2,10p*1,10s*1,10q*2,10n*2,10o*1,1y4*1,10l*3,10j*4,10k*1,10h*2,10g*2,10i*3,10m*3,11a*6,11c*1,119*5,11e*1,1y5*1,1y6*1,1y7*1,11b*3,11d*1,118*1,12q*c,12r*t,12t*3,12u*1,12s*18,m3*5b,12p*2d,1y8*1,13d*c,13e*v,1y9*1,11i*2,1ya*1,11h*2,11g*e,11f*2,1yb*1,1yc*1,1yd*1,1ye*1,1yf*1,127*1,1yg*1,1yh*1,1yi*1,1yj*1,1yk*1,t8*1,13v*1,1yl*1,1ym*1,13w*1,13x*2,1yn*1,13u*b,13t*1,1yo*1,1yp*1,1yq*1,1yr*1,1ys*1,1yt*1,4y*3,11s*4,124*1,120*7,121*1,11r*1,123*1,11t*6,1yu*1,11n*2,11x*5,11u*8,11k*b,11p*8,1yv*1,11w*k,11j*5,11v*1,11z*2,122*2,11o*c,11y*5,11l*6,1yw*1,11m*1,11q*3,12b*i,12c*t,12l*i,12f*2h,12h*h,129*2u,12m*z,12o*7,12n*i,128*g,12d*n,12g*f,12i*12,12j*m,12k*m,12e*z,12a*9,2n*1,134*q,138*c,12y*k,12z*k,135*1c,12w*g,136*a,12v*1j,13a*9,12x*a,137*r,133*16,130*d,132*8,131*f,139*g,13o*7,1yx*1,1yy*1,13s*6,1yz*1,13l*1,13r*7,1z0*1,13h*a,13q*2,13k*5,13f*1j,13j*4,1z1*1,13n*11,13g*4,13i*h,13p*3,13m*1,1z2*1,1z3*1,1z4*1,1z5*1,1z6*1,1z7*1,1z8*1,1z9*1,1za*1,1zb*1,1zc*1,1zd*1,1ze*1,1zf*1,1zg*1,1t*1,13c*1,1zh*1,1zi*1,1zj*1,140*1,1zk*1,1zl*1,1zm*1,13y*g,13z*2,1zn*1,14l*5,1zo*1,14s*2,14v*3,14n*1,1zp*1,14z*1,1zq*1,143*5,150*6,14p*1,1zr*1,14q*2,14b*4,14u*4,14d*1,14g*2,14y*3,14i*1,1zs*1,14f*1,14t*2,145*7,14a*3,14w*1,146*3,147*4,1zt*1,14c*4,14e*2,14j*3,14r*4,144*1,14m*1,14k*2,148*5,142*3,14h*1,1zu*1,14o*1,149*2,14x*1,15z*3,170*1,16p*d,171*7,15y*a,16n*4,15x*n,169*a,15a*a,175*3,16b*8,159*p,1zv*1,16h*4,16m*a,16e*9,16v*j,166*8,1zw*1,16d*7,15g*6,1zx*1,16f*7,177*2,15i*4,16g*5,173*7,16z*3,16s*k,15w*7,15q*9,164*6,15o*1i,16r*m,16y*4,15f*5,16q*m,160*w,15r*5,1zy*1,15n*3,16j*2,156*2k,158*2l,15l*b,16l*1,15j*g,165*4,16a*5,16u*g,16x*3,15t*d,16k*2,15k*7,167*i,174*f,168*3,1zz*1,157*r,155*7,172*6,178*5,15c*c,15p*e,15u*6,154*v,15e*u,16i*16,15d*7,15h*j,16t*4,15s*g,153*b,16o*5,161*7,16c*4,15m*g,15b*h,163*5,162*h,16w*7,15v*7,176*5,tb*6,179*1,ta*5,t9*9,t8*m,141*d,2n*1,200*1,201*1,202*1,2n*1,203*1,c4*1,204*1,205*1,206*1,17i*7,17l*3,17e*3,17f*8,tb*o,17k*2,17h*5,17d*a,17a*5,17j*1,17c*2,17g*c,17b*4,18y*e,190*5,196*2,199*2,197*4,207*1,18z*3,198*4,192*3,195*3,194*1,193*1,191*e,18x*1,152*v,151*i,208*1,tb*3,209*1,ta*4,t9*3,18w*2,2n*1,18q*5,18s*b,18p*4,18v*6,18o*7,18u*8,18t*7,18r*5,20a*1,20b*1,20c*1,20d*1,20e*1,20f*1,20g*1,20h*1,17n*2,17m*3,19c*3,20i*1,19d*2,19j*2,19k*3,19e*3,19l*1,19f*2,19a*3,19g*1,20j*1,19i*1,19h*1,20k*1,20l*1,20m*1,19b*3,1l3*10,1l1*14,1l0*10,1l4*12,1l6*q,1l2*1c,209*u,1l5*5,1l7*14,2n*1,19o*1,19r*1,20n*1,20o*1,19p*1,20p*1,20q*1,19s*2,19q*1,20r*1,f1*32,f9*c,fg*7,f7*f,f8*v,f4*14,ff*4,fa*i,f6*m,fd*3z,20s*1,f2*9,fb*v,25*2,fc*4l,20t*1,f3*p,fe*7,f5*25,te*5,tb*6,20u*1,td*2,ta*5,tc*1,t9*8,tf*1,t8*n,17p*4,17x*5,181*1,20v*1,183*1,17y*1,17s*2,17r*3,17w*3,17o*2,e8*5,17v*4,17q*7,17t*5,17z*3,180*5,182*2,17u*6,19m*9,19n*1,20w*1,18m*1,18k*2,18g*2,20x*1,18d*3,20y*1,18c*3,189*2,187*1,185*3,18h*2,18j*2,186*b,18i*2,18b*v,18e*2,18l*1,184*1,18f*2,18a*1,188*i,7f*2,20z*1,7r*1,7m*2,7h*5,7q*1,7g*5,210*1,7n*3,7l*1,7e*4,211*1,7k*1,7i*2,7p*1,7o*2,7j*3,7d*7,7c*2,7b*x,1aa*4,1a3*d,1a8*1,1a5*8,1a6*4,1a1*7,1a4*7,1a7*9,1a9*2,212*1,1ab*1,1a0*h,213*1,1a2*2,1fk*1,1fi*7,1fh*1i,1fj*1,1cj*1,1ci*1,1cf*b,1ch*2,1cg*b,1fu*7,1g9*1,1g6*4,1fo*9,1ga*4,1g2*c,1fr*1,1fp*6,1fs*6,1gb*5,1g5*9,1fx*b,1fq*c,1g4*f,1gc*a,1ft*7,1g3*4,214*1,1g7*1,1fn*d,1fz*5,1g8*7,1fw*8,1g0*9,1g1*c,1fm*2,1fv*7,1fy*a,215*1,216*1,217*1,218*1,1bg*2g,219*1,1c6*2,1ca*2,21a*1,1c7*3,1bu*2,1b5*3,1b9*2,1by*a,1bb*1,1bd*4,1bc*1,1b1*4,1ce*2,21b*1,1az*1,1b8*1,1bp*3,1cd*1,21c*1,21d*1,21e*1,1c3*2,21f*1,1bh*8,1ba*1,1ay*3,21g*1,1bw*3,1bj*1,1bv*2,1cc*4,1cb*3,1bk*1,21h*1,21i*1,1b7*1,1bm*4,1aw*3,1bt*3,1c9*3,1bq*6,1c8*1,1au*8,1c0*9,1av*5,21j*1,1b6*6,1c5*3,1c4*2,1br*2,1bo*2,1bi*3,1c2*2,21k*1,1c1*4,21l*1,1bx*1,1bz*1,1bf*4,1b4*3,21m*1,1b3*3,21n*1,1b2*3,1ax*1,1bs*3,1bn*3,1be*5,1b0*1,21o*1,1bl*1,21p*1,21q*1,1cm*1,21r*1,21s*1,21t*1,21u*1,1cl*1,1ar*2,1as*3,1aq*4,7a*5,1at*2,21v*1,21w*1,21x*1,21y*1,21z*1,220*1,221*1,1fg*2,222*1,223*1,224*1,1ff*1,1d6*5,1d2*2,1d8*8,1cx*8,1d3*6,1cv*4,1d5*2,225*1,1cz*3,1da*1,1d1*2,1d9*4,1cu*6,1db*6,1d4*c,1d0*c,1d7*8,226*1,227*1,1cs*7,228*1,1cy*1,1cw*8,1ct*1,1co*8,229*1,1cn*6,1cp*6,1cr*5,1cq*5,22a*1,1dc*6,1el*4,1e7*5,1e9*3,1ec*1,1f2*3,1e5*e,1e4*f,22b*1,1fc*2,1dh*6,1dx*9,22c*1,1eh*1,22d*1,1ep*2,1dy*2,1dv*5,1fd*1,1eo*1,1eu*d,1en*4,1fe*1,1f3*4,1e6*3,1e1*6,1fb*2,1ex*2,1ei*3,1do*1,1ea*7,22e*1,1ed*1,1f0*5,1fa*1,1dd*2,1dg*c,1em*1,1dj*4,1es*y,1dq*p,1e8*5,1f7*1,1ek*1,1f5*2,1ez*2,1dk*4,22f*1,1ej*1,1f9*2,1ef*2,1ev*6,1e3*a,1du*4,1eg*2,1ds*8,1df*5,1dw*7,1di*9,1dm*3,1dr*1,1ee*1,1ey*5,1eb*1,1f8*2,1f6*8,1ew*6,1dl*8,1e2*1,1f4*1,1e0*3,1dz*3,1f1*4,1er*4,1et*8,1dt*1,1dp*1,1dn*1,22g*1,1de*3,1eq*4,ws*15,1h3*u,wq*h,1h4*1e,1gf*8,1h0*7,22h*1,1gp*d,1gk*l,1ge*1n,1h2*5,1gv*u,1gx*5,1gu*c,1gh*7,1gs*1m,1gq*l,1go*s,1gg*h,1gt*3,1gn*b,1h1*d,1gl*5,1gz*2,1gd*b,1gy*3,1gj*9,1gw*3,1gr*6,1gm*8,1gi*9,3*8,5*3,1*z,2*4,22i*1,4*6,22j*1,gq*kq,gt*h,gs*1n,gr*14,1h6*16,1id*4,1i8*1j,1h9*p,1i7*cj,1i9*19,1hu*1s,1hb*4,1ha*l,1hc*6v,1hd*23,1ii*1a,1ie*g,1he*5v,1hf*1o,1hw*t,1hg*o,1h7*10,1hh*u,1hx*d,1hi*2x,1ht*3m,1hv*25,1hy*20,1hk*s,1hj*1j,3x*7,1i0*b,1ib*j,1i1*d,1hm*3h,1ia*e,1i2*6t,1hl*1r,1hz*8,1hn*3i,1ho*w,1if*19,1hp*2h,1i3*m,1hq*x,1i4*5,1h8*18,1hr*5f,1ic*1e,1i5*3,1h5*2b,1ig*2k,1hs*a,1i6*1i,1ih*5,22k*1,1ik*7,22l*1,1io*1,22m*1,22n*1,1hc*1,22o*1,1im*1,22p*1,22q*1,1ij*1,22r*1,22s*1,22t*1,1il*1,1in*1,22u*1,22v*1,1j2*d,1iu*6,1ix*a,1iq*6,1ip*6,1j0*a,1iz*2,1it*7,1ir*7,1iy*2,1is*3,1iw*4,1iv*g,1j1*6,22w*1,4y*1,1j4*b,1jm*4,1j8*8,1j5*8,9v*a,1jb*a,1jf*4,22x*1,22y*1,1je*a,1j6*8,1jj*7,1jd*b,1ji*m,1jh*5,1j3*7,1j9*8,1jl*6,1jc*d,1ja*8,1jk*3,1j7*a,1jg*k,2n*1,1jt*h,1jy*6,1ju*c,1jv*g,1k4*2,1kb*d,1k0*8,1jr*7,1k6*7,1kj*1,1kd*4,1k3*3,1kk*5,1jp*1m,1js*u,1ka*4,1k2*5,22z*1,1ki*a,1k7*2,1jq*3,1jo*7,1kg*2,1jw*5,1kf*5,1jz*9,1ke*6,1kc*3,1k5*7,1k9*4,1k8*7,1kh*3,1k1*3,1jx*4,2n*1,230*1,231*1,232*1,233*1,1kt*3,234*1,235*1,236*1,237*1,1ku*2,238*1,239*1,1kx*1,23a*1,23b*1,1kw*1,23c*1,1kv*1,te*6,1lb*9,tb*6,1l8*5,1lc*a,1l9*3,1la*a,ta*6,t9*b,t8*6,23d*1,1lk*2,1lh*2,1lj*1,1lg*2,1li*6,1ld*2,1le*1,1ll*1,1lf*4,23e*1","sep":"|"}]}]);
const COLONY = [
{"id":"n-871ec03d","guard":[["not",["hasAny",["coat","code","college","domain","government","ike","institute","session","title","university","universitybakersfield","up","volcano"]]]],"pyramid":["render.template",{"lit":["The type ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-347ca4ea","guard":[["has","type"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the type of Arunāchal Pradesh":"The type of Arunāchal Pradesh is State.","tell me the type of Šumadijski okrug":"The type of Šumadijski okrug is District.","name the type of Druskininkai":"The type of Druskininkai is Municipality.","what is the type of Tálknafjarðarhreppur":"The type of Tálknafjarðarhreppur is Municipality.","tell me the type of South Dakota":"The type of South Dakota is State.","name the type of Al Qaşīm":"The type of Al Qaşīm is Region.","what is the type of Gopalganj":"The type of Gopalganj is District.","tell me the type of Limpopo":"The type of Limpopo is Province.","name the type of Gazipur":"The type of Gazipur is District.","what is the type of Mokronog-Trebelno":"The type of Mokronog-Trebelno is Municipality.","tell me the type of Tillabéri":"The type of Tillabéri is Region.","name the type of Cabo Delgado":"The type of Cabo Delgado is Province.","what is the type of Díli":"The type of Díli is Municipality.","tell me the type of Ra’s al Khaymah":"The type of Ra’s al Khaymah is Emirate.","name the type of Suphan Buri":"The type of Suphan Buri is Province.","what is the type of Aragua":"The type of Aragua is State.","tell me the type of Mauren":"The type of Mauren is Commune.","name the type of Tougué":"The type of Tougué is Prefecture.","what is the type of Pordenone":"The type of Pordenone is Decentralized regional entity.","tell me the type of Iloilo":"The type of Iloilo is Province.","name the type of Beyla":"The type of Beyla is Prefecture.","what is the type of Usulután":"The type of Usulután is Department.","tell me the type of Cantal":"The type of Cantal is Metropolitan department.","name the type of Slovenj Gradec":"The type of Slovenj Gradec is Urban municipality.","what is the type of Chuuk":"The type of Chuuk is State.","tell me the type of Khomas":"The type of Khomas is Region.","name the type of Hîncești":"The type of Hîncești is District.","what is the type of Incheon-gwangyeoksi":"The type of Incheon-gwangyeoksi is Metropolitan city.","tell me the type of Boucle du Mouhoun":"The type of Boucle du Mouhoun is Region.","name the type of Abra":"The type of Abra is Province.","what is the type of Mbarara":"The type of Mbarara is District.","tell me the type of Ísafjarðarbær":"The type of Ísafjarðarbær is Municipality.","name the type of Lääne-Harju":"The type of Lääne-Harju is Rural municipality.","what is the type of Lyantonde":"The type of Lyantonde is District.","tell me the type of Quebec":"The type of Quebec is Province.","name the type of Lääneranna":"The type of Lääneranna is Rural municipality.","what is the type of Hwanghae-bukto":"The type of Hwanghae-bukto is Province.","tell me the type of Oudômxai":"The type of Oudômxai is Province.","name the type of México":"The type of México is State.","what is the type of Moskva":"The type of Moskva is Autonomous city."}}},
{"id":"n-654e281b","guard":[["has","type"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"type"}]]],"mem":{"table":{"of Arunāchal Pradesh":"The type of Arunāchal Pradesh is State.","of Šumadijski okrug":"The type of Šumadijski okrug is District.","of Druskininkai":"The type of Druskininkai is Municipality.","of Tálknafjarðarhreppur":"The type of Tálknafjarðarhreppur is Municipality.","of South Dakota":"The type of South Dakota is State.","of Al Qaşīm":"The type of Al Qaşīm is Region.","of Gopalganj":"The type of Gopalganj is District.","of Limpopo":"The type of Limpopo is Province.","of Gazipur":"The type of Gazipur is District.","of Mokronog-Trebelno":"The type of Mokronog-Trebelno is Municipality.","of Tillabéri":"The type of Tillabéri is Region.","of Cabo Delgado":"The type of Cabo Delgado is Province.","of Díli":"The type of Díli is Municipality.","of Ra’s al Khaymah":"The type of Ra’s al Khaymah is Emirate.","of Suphan Buri":"The type of Suphan Buri is Province.","of Aragua":"The type of Aragua is State.","of Mauren":"The type of Mauren is Commune.","of Tougué":"The type of Tougué is Prefecture.","of Pordenone":"The type of Pordenone is Decentralized regional entity.","of Iloilo":"The type of Iloilo is Province.","of Beyla":"The type of Beyla is Prefecture.","of Usulután":"The type of Usulután is Department.","of Cantal":"The type of Cantal is Metropolitan department.","of Slovenj Gradec":"The type of Slovenj Gradec is Urban municipality.","of Chuuk":"The type of Chuuk is State.","of Khomas":"The type of Khomas is Region.","of Hîncești":"The type of Hîncești is District.","of Incheon-gwangyeoksi":"The type of Incheon-gwangyeoksi is Metropolitan city.","of Boucle du Mouhoun":"The type of Boucle du Mouhoun is Region.","of Abra":"The type of Abra is Province.","of Mbarara":"The type of Mbarara is District.","of Ísafjarðarbær":"The type of Ísafjarðarbær is Municipality.","of Lääne-Harju":"The type of Lääne-Harju is Rural municipality.","of Lyantonde":"The type of Lyantonde is District.","of Quebec":"The type of Quebec is Province.","of Lääneranna":"The type of Lääneranna is Rural municipality.","of Hwanghae-bukto":"The type of Hwanghae-bukto is Province.","of Oudômxai":"The type of Oudômxai is Province.","of México":"The type of México is State.","of Moskva":"The type of Moskva is Autonomous city."}}},
{"id":"n-18740bcf","guard":[["not",["hasAny",["afbam","antigua","caldera","coat","colima","college","delgado","domain","díli","esteli","government","ike","institute","ivory","kaikohebay","macedonia","sandwich","session","timor","title","university","universitybakersfield","up"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-62314dd9","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cantal","chuuk","dakota","druskininkai","element","gazipur","gopalganj","gradec","hwanghaebukto","hîncești","iloilo","incheongwangyeoksi","item number","khomas","limpopo","lyantonde","lääneharju","lääneranna","mauren","mbarara","mokronogtrebelno","moskva","méxico","nth","okrug","oudômxai","pordenone","position","quebec","tillabéri","tougué","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-079fa289","guard":[["not",["hasAny",["afbam","antigua","caldera","coat","colima","college","delgado","domain","díli","esteli","government","ike","institute","ivory","kaikohebay","macedonia","sandwich","session","timor","title","university","universitybakersfield","up"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-07fb7423","guard":[["not",["hasAny",["afbam","antigua","caldera","coat","colima","college","delgado","domain","díli","esteli","government","ike","institute","ivory","kaikohebay","macedonia","sandwich","session","timor","title","university","universitybakersfield","up"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["transform.upper",["sense.after",{"lit":"type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-1bf0a63b","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cantal","capitalise","capitalize","capitalize each word","chuuk","dakota","druskininkai","element","gazipur","gopalganj","gradec","hwanghaebukto","hîncești","iloilo","incheongwangyeoksi","item number","khomas","limpopo","lyantonde","lääneharju","lääneranna","mauren","mbarara","mokronogtrebelno","moskva","méxico","nth","okrug","oudômxai","pordenone","position","quebec","tillabéri","title case","tougué","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["transform.title",["sense.after",{"lit":"type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-25d3e5dd","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cantal","chuuk","dakota","druskininkai","element","gazipur","gopalganj","gradec","hwanghaebukto","hîncești","iloilo","incheongwangyeoksi","invert case","item number","khomas","limpopo","lyantonde","lääneharju","lääneranna","mauren","mbarara","mokronogtrebelno","moskva","méxico","nth","okrug","oudômxai","pordenone","position","quebec","swap case","tillabéri","toggle case","tougué","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-3d22cccc","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cantal","chuuk","dakota","druskininkai","element","gazipur","gopalganj","gradec","hwanghaebukto","hîncești","iloilo","incheongwangyeoksi","invert case","item number","khomas","limpopo","lyantonde","lääneharju","lääneranna","mauren","mbarara","mokronogtrebelno","moskva","méxico","nth","okrug","oudômxai","pordenone","position","quebec","swap case","tillabéri","toggle case","tougué","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["transform.swapCase",["sense.after",{"lit":"type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-5b316e78","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cantal","capitalise","capitalize","capitalize each word","chuuk","dakota","druskininkai","element","gazipur","gopalganj","gradec","hwanghaebukto","hîncești","iloilo","incheongwangyeoksi","item number","khomas","limpopo","lyantonde","lääneharju","lääneranna","mauren","mbarara","mokronogtrebelno","moskva","méxico","nth","okrug","oudômxai","pordenone","position","quebec","tillabéri","title case","tougué","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-5e404347","guard":[["not",["hasAny",["afbam","antigua","caldera","coat","colima","college","delgado","domain","díli","esteli","government","ike","institute","ivory","kaikohebay","macedonia","sandwich","session","timor","title","university","universitybakersfield","up"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["transform.lower",["sense.after",{"lit":"type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-755eb226","guard":[["not",["hasAny",["afbam","antigua","caldera","coat","colima","college","delgado","domain","díli","esteli","government","ike","institute","ivory","kaikohebay","macedonia","sandwich","session","timor","title","university","universitybakersfield","up"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-7a403cc6","guard":[["not",["hasAny",["afbam","antigua","caldera","coat","colima","college","delgado","domain","díli","esteli","government","ike","institute","ivory","kaikohebay","macedonia","sandwich","session","timor","title","university","universitybakersfield","up"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-7d0eab62","guard":[["not",["hasAny",["afbam","antigua","caldera","coat","colima","college","delgado","domain","díli","esteli","government","ike","institute","ivory","kaikohebay","macedonia","sandwich","session","timor","title","university","universitybakersfield","up"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.camel",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-839af9e3","guard":[["not",["hasAny",["afbam","antigua","caldera","coat","colima","college","delgado","domain","díli","esteli","government","ike","institute","ivory","kaikohebay","macedonia","sandwich","session","timor","title","university","universitybakersfield","up"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-935f661a","guard":[["hasAny",["abra","al","all caps","aragua","arunāchal","beyla","boucle","buri","cantal","capital letters","capitals","chuuk","dakota","druskininkai","element","gazipur","gopalganj","gradec","hwanghaebukto","hîncești","iloilo","incheongwangyeoksi","item number","khomas","limpopo","lyantonde","lääneharju","lääneranna","mauren","mbarara","mokronogtrebelno","moskva","méxico","nth","okrug","oudômxai","pordenone","position","quebec","tillabéri","tougué","tálknafjarðarhreppur","upper case","uppercase","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["transform.upper",["sense.after",{"lit":"type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-990af955","guard":[["not",["hasAny",["afbam","antigua","caldera","coat","colima","college","delgado","domain","díli","esteli","government","ike","institute","ivory","kaikohebay","macedonia","sandwich","session","timor","title","university","universitybakersfield","up"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-9a408bc5","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","camel case","camelcase","cantal","chuuk","dakota","druskininkai","element","gazipur","gopalganj","gradec","hwanghaebukto","hîncești","iloilo","incheongwangyeoksi","item number","khomas","limpopo","lower camel case","lyantonde","lääneharju","lääneranna","mauren","mbarara","mokronogtrebelno","moskva","méxico","nth","okrug","oudômxai","pordenone","position","quebec","tillabéri","tougué","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.camel",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-9d081d1b","guard":[["not",["hasAny",["afbam","antigua","caldera","coat","colima","college","delgado","domain","díli","esteli","government","ike","institute","ivory","kaikohebay","macedonia","sandwich","session","timor","title","university","universitybakersfield","up"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["transform.title",["sense.after",{"lit":"type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-a8d46a50","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cantal","chuuk","class name","dakota","druskininkai","element","gazipur","gopalganj","gradec","hwanghaebukto","hîncești","iloilo","incheongwangyeoksi","item number","khomas","limpopo","lyantonde","lääneharju","lääneranna","mauren","mbarara","mokronogtrebelno","moskva","méxico","nth","okrug","oudômxai","pascal case","pascalcase","pordenone","position","quebec","tillabéri","tougué","tálknafjarðarhreppur","upper camel case","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-b9b7661f","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cantal","chuuk","dakota","druskininkai","element","gazipur","gopalganj","gradec","hwanghaebukto","hîncești","iloilo","incheongwangyeoksi","item number","khomas","limpopo","lower case","lowercase","lyantonde","lääneharju","lääneranna","mauren","mbarara","mokronogtrebelno","moskva","méxico","nth","okrug","oudômxai","pordenone","position","quebec","small letters","tillabéri","tougué","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["transform.lower",["sense.after",{"lit":"type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-e888cb4f","guard":[["hasAny",["abra","al","all caps","aragua","arunāchal","beyla","boucle","buri","cantal","capital letters","capitals","chuuk","dakota","druskininkai","element","gazipur","gopalganj","gradec","hwanghaebukto","hîncești","iloilo","incheongwangyeoksi","item number","khomas","limpopo","lyantonde","lääneharju","lääneranna","mauren","mbarara","mokronogtrebelno","moskva","méxico","nth","okrug","oudômxai","pordenone","position","quebec","tillabéri","tougué","tálknafjarðarhreppur","upper case","uppercase","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-e8ed23c6","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cantal","chuuk","dakota","druskininkai","element","gazipur","gopalganj","gradec","hwanghaebukto","hîncești","iloilo","incheongwangyeoksi","item number","khomas","limpopo","lower case","lowercase","lyantonde","lääneharju","lääneranna","mauren","mbarara","mokronogtrebelno","moskva","méxico","nth","okrug","oudômxai","pordenone","position","quebec","small letters","tillabéri","tougué","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-eae9409a","guard":[["not",["hasAny",["afbam","antigua","caldera","coat","colima","college","delgado","domain","díli","esteli","government","ike","institute","ivory","kaikohebay","macedonia","sandwich","session","timor","title","university","universitybakersfield","up"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["transform.swapCase",["sense.after",{"lit":"type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-228aa502","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cantal","chuuk","dakota","druskininkai","each word","element","gazipur","gopalganj","gradec","hwanghaebukto","hîncești","iloilo","incheongwangyeoksi","item number","khomas","limpopo","lyantonde","lääneharju","lääneranna","mauren","mbarara","mokronogtrebelno","moskva","méxico","nth","okrug","oudômxai","pordenone","position","quebec","split into words","tillabéri","tougué","tálknafjarðarhreppur","usulután","words","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}]]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-2c5cebbf","guard":[["not",["hasAny",["afbam","antigua","caldera","coat","colima","college","delgado","domain","díli","esteli","government","ike","institute","ivory","kaikohebay","macedonia","sandwich","session","timor","title","university","universitybakersfield","up"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}]]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-7039562a","guard":[["not",["hasAny",["afbam","antigua","caldera","coat","colima","college","delgado","domain","díli","esteli","government","ike","institute","ivory","kaikohebay","macedonia","sandwich","session","timor","title","university","universitybakersfield","up"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}]]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-ffe9c99e","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cantal","chuuk","dakota","druskininkai","each word","element","gazipur","gopalganj","gradec","hwanghaebukto","hîncești","iloilo","incheongwangyeoksi","item number","khomas","limpopo","lyantonde","lääneharju","lääneranna","mauren","mbarara","mokronogtrebelno","moskva","méxico","nth","okrug","oudômxai","pordenone","position","quebec","split into words","tillabéri","tougué","tálknafjarðarhreppur","usulután","words","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}]]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-382b1243","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cabo","chuuk","dakota","druskininkai","díli","gazipur","gopalganj","hwanghaebukto","hîncești","iloilo","item number","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","moskva","méxico","normalise","normalize","nth","okrug","oudômxai","position","quebec","simplify the text","tillabéri","tougué","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["has","type"],["not",["has","community"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}],{"lit":3}]],"mem":null},
{"id":"n-4283b729","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cabo","chuuk","dakota","druskininkai","díli","each word","gazipur","gopalganj","hwanghaebukto","hîncești","iloilo","item number","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","méxico","nth","okrug","oudômxai","position","quebec","split into words","tillabéri","tougué","tálknafjarðarhreppur","usulután","words","ísafjarðarbær"]],["has","type"],["not",["has","community"]]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-488b2b75","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cabo","chuuk","dakota","druskininkai","díli","gazipur","gopalganj","hwanghaebukto","hîncești","iloilo","item number","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","méxico","nth","okrug","oudômxai","position","quebec","snake case","snakecase","tillabéri","tougué","tálknafjarðarhreppur","underscores","usulután","variable name","ísafjarðarbær"]],["has","type"],["not",["has","community"]]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-70badf10","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cabo","chuuk","dakota","druskininkai","díli","gazipur","gopalganj","hwanghaebukto","hîncești","iloilo","item number","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","méxico","nth","okrug","oudômxai","position","quebec","reverse the words","reverse word order","tillabéri","tougué","tálknafjarðarhreppur","usulután","words backwards","ísafjarðarbær"]],["has","type"],["not",["has","community"]]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-7f20c868","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cabo","chuuk","dakota","dashes","druskininkai","díli","gazipur","gopalganj","hwanghaebukto","hyphens","hîncești","iloilo","item number","kebab case","kebabcase","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","méxico","nth","okrug","oudômxai","position","quebec","tillabéri","tougué","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["has","type"],["not",["has","community"]]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-9c35c4ce","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cabo","camel case","camelcase","chuuk","dakota","druskininkai","díli","gazipur","gopalganj","hwanghaebukto","hîncești","iloilo","item number","khomas","limpopo","lower camel case","lyantonde","mauren","mbarara","mokronogtrebelno","méxico","nth","okrug","oudômxai","position","quebec","tillabéri","tougué","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["has","type"],["not",["has","community"]]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-9c5a5c64","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cabo","chuuk","class name","dakota","druskininkai","díli","gazipur","gopalganj","hwanghaebukto","hîncești","iloilo","item number","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","méxico","nth","okrug","oudômxai","pascal case","pascalcase","position","quebec","tillabéri","tougué","tálknafjarðarhreppur","upper camel case","usulután","ísafjarðarbær"]],["has","type"],["not",["has","community"]]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-b1c5614e","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cabo","chuuk","dakota","druskininkai","díli","each word","gazipur","gopalganj","hwanghaebukto","hîncești","iloilo","item number","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","méxico","nth","okrug","oudômxai","position","quebec","split into words","tillabéri","tougué","tálknafjarðarhreppur","usulután","words","ísafjarðarbær"]],["has","type"],["not",["has","community"]]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-b2bb5a09","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cabo","chuuk","dakota","druskininkai","díli","each word","gazipur","gopalganj","hwanghaebukto","hîncești","iloilo","item number","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","méxico","nth","okrug","oudômxai","position","quebec","split into words","tillabéri","tougué","tálknafjarðarhreppur","usulután","words","ísafjarðarbær"]],["has","type"],["not",["has","community"]]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-36646487","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cabo","chuuk","dakota","druskininkai","díli","each word","gazipur","gopalganj","hwanghaebukto","hîncești","iloilo","item number","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","méxico","nth","okrug","oudômxai","position","quebec","shortest","shortest one","shortest word","split into words","tillabéri","tougué","tálknafjarðarhreppur","usulután","words","ísafjarðarbær"]],["has","type"],["not",["has","community"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]]],"mem":null},
{"id":"n-40eed81a","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","cabo","chuuk","dakota","druskininkai","díli","each word","gazipur","gopalganj","hwanghaebukto","hîncești","iloilo","item number","khomas","limpopo","longest","longest one","longest word","lyantonde","mauren","mbarara","mokronogtrebelno","méxico","nth","okrug","oudômxai","position","quebec","split into words","tillabéri","tougué","tálknafjarðarhreppur","usulután","words","ísafjarðarbær"]],["has","type"],["not",["has","community"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]]],"mem":null},
{"id":"n-1817903c","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","chuuk","dakota","druskininkai","element","gazipur","gopalganj","hwanghaebukto","hîncești","iloilo","item number","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","méxico","nth","okrug","oudômxai","position","quebec","reverse the words","reverse word order","tillabéri","tougué","tálknafjarðarhreppur","usulután","words backwards","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-398f4ea7","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","chuuk","dakota","dashes","druskininkai","element","gazipur","gopalganj","hwanghaebukto","hyphens","hîncești","iloilo","item number","kebab case","kebabcase","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","méxico","nth","okrug","oudômxai","position","quebec","slug","tillabéri","tougué","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-83be780e","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","chuuk","class name","dakota","druskininkai","element","gazipur","gopalganj","hwanghaebukto","hîncești","iloilo","item number","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","méxico","nth","okrug","oudômxai","pascal case","pascalcase","position","quebec","tillabéri","tougué","tálknafjarðarhreppur","upper camel case","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-ea2f6760","guard":[["hasAny",["abra","al","aragua","arunāchal","beyla","boucle","buri","camel case","camelcase","chuuk","dakota","druskininkai","element","gazipur","gopalganj","hwanghaebukto","hîncești","iloilo","item number","khomas","limpopo","lower camel case","lyantonde","mauren","mbarara","mokronogtrebelno","méxico","nth","okrug","oudômxai","position","quebec","tillabéri","tougué","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-ce6ab754","guard":[["hasAny",["aragua","arunāchal","boucle","cantal","chuuk","dakota","díli","element","gopalganj","hwanghaebukto","iloilo","incheongwangyeoksi","item number","khaymah","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","moskva","nth","okrug","oudômxai","pordenone","position","quebec","tillabéri","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-aadcff75","guard":[["hasAny",["aragua","arunāchal","boucle","cantal","chuuk","dakota","díli","element","first n","gopalganj","hwanghaebukto","iloilo","incheongwangyeoksi","item number","khaymah","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","moskva","nth","okrug","oudômxai","pordenone","position","quebec","take","tillabéri","top","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-09c6f4dd","guard":[["hasAny",["aragua","arunāchal","boucle","cantal","chuuk","dakota","díli","element","gopalganj","hwanghaebukto","iloilo","incheongwangyeoksi","item number","khaymah","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","moskva","nth","okrug","oudômxai","pordenone","position","quebec","tillabéri","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-2253ec3e","guard":[["hasAny",["aragua","arunāchal","boucle","camel case","camelcase","cantal","chuuk","dakota","díli","element","gopalganj","hwanghaebukto","iloilo","incheongwangyeoksi","item number","khaymah","khomas","limpopo","lower camel case","lyantonde","mauren","mbarara","mokronogtrebelno","moskva","nth","okrug","oudômxai","pordenone","position","quebec","tillabéri","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.camel",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-bd205f0b","guard":[["hasAny",["aragua","arunāchal","boucle","cantal","chuuk","class name","dakota","díli","element","gopalganj","hwanghaebukto","iloilo","incheongwangyeoksi","item number","khaymah","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","moskva","nth","okrug","oudômxai","pascal case","pascalcase","pordenone","position","quebec","tillabéri","tálknafjarðarhreppur","upper camel case","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-05c42f15","guard":[["hasAny",["aragua","arunāchal","boucle","cantal","chuuk","dakota","díli","each word","element","gopalganj","hwanghaebukto","iloilo","incheongwangyeoksi","item number","khaymah","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","moskva","nth","okrug","oudômxai","pordenone","position","quebec","split into words","tillabéri","tálknafjarðarhreppur","usulután","words","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}]]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-6091723e","guard":[["hasAny",["aragua","arunāchal","boucle","cantal","chuuk","dakota","díli","each word","element","gopalganj","hwanghaebukto","iloilo","incheongwangyeoksi","item number","khaymah","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","moskva","nth","okrug","oudômxai","pordenone","position","quebec","split into words","tillabéri","tálknafjarðarhreppur","usulután","words","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}]]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-d292f6e5","guard":[["hasAny",["aragua","arunāchal","cantal","chuuk","dakota","díli","element","gopalganj","hwanghaebukto","iloilo","incheongwangyeoksi","item number","khomas","limpopo","lyantonde","mauren","mbarara","mokronogtrebelno","moskva","nth","okrug","oudômxai","pordenone","position","quebec","shortest","shortest one","shortest word","tillabéri","tálknafjarðarhreppur","usulután","ísafjarðarbær"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-391c5f76","guard":[["hasAny",["delete","element","item number","nth","position","remove","strip out","type","without"]],["words<=",6]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}],["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-0a334a1d","guard":[["has","type"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the type of Arunāchal Pradesh":"The type of Arunāchal Pradesh is State.","the type of Tálknafjarðarhreppur":"The type of Tálknafjarðarhreppur is Municipality.","the type of Gopalganj":"The type of Gopalganj is District.","the type of Mokronog-Trebelno":"The type of Mokronog-Trebelno is Municipality.","the type of Díli":"The type of Díli is Municipality.","the type of Aragua":"The type of Aragua is State.","the type of Pordenone":"The type of Pordenone is Decentralized regional entity.","the type of Usulután":"The type of Usulután is Department.","the type of Chuuk":"The type of Chuuk is State.","the type of Incheon-gwangyeoksi":"The type of Incheon-gwangyeoksi is Metropolitan city.","the type of Mbarara":"The type of Mbarara is District.","the type of Lyantonde":"The type of Lyantonde is District.","the type of Hwanghae-bukto":"The type of Hwanghae-bukto is Province.","the type of Moskva":"The type of Moskva is Autonomous city."}}},
{"id":"n-a97eb9b8","guard":[["hasAny",["element","item number","name","nth","position"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-3903d23a","guard":[["hasAny",["element","item number","name","nth","position"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-86768cf9","guard":[["hasAny",["class name","element","item number","name","nth","pascal case","pascalcase","position","upper camel case"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-92d4315f","guard":[["hasAny",["element","invert case","item number","name","nth","position","swap case","toggle case"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-3b06af73","guard":[["hasAny",["element","invert case","item number","name","nth","position","swap case","toggle case"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"type"}],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-50b7cb0d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","name","nth","position","title case"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"type"}],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-52b95508","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","name","nth","position","upper case","uppercase"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.upper",["sense.after",{"lit":"type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-6a16ddf5","guard":[["hasAny",["element","item number","lower case","lowercase","name","nth","position","small letters"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.lower",["sense.after",{"lit":"type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-810cc635","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","name","nth","position","title case"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.title",["sense.after",{"lit":"type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-859a003c","guard":[["hasAny",["element","invert case","item number","name","nth","position","swap case","toggle case"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.swapCase",["sense.after",{"lit":"type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-a685bb95","guard":[["hasAny",["element","item number","lower case","lowercase","name","nth","position","small letters"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"type"}],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-dfb786fa","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","name","nth","position","upper case","uppercase"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"type"}],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-6c685e22","guard":[["hasAny",["element","item number","name","nth","position"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-45779996","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","name","nth","position"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.camel",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-b0078409","guard":[["hasAny",["class name","element","item number","name","nth","pascal case","pascalcase","position","upper camel case"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-1f23e58d","guard":[["hasAny",["each word","element","item number","name","nth","position","split into words","words"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-4420048b","guard":[["hasAny",["each word","element","item number","name","nth","position","split into words","words"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]],"mem":null},
{"id":"n-223f4f17","guard":[["hasAny",["abra","beyla","buri","cabo","camel case","camelcase","druskininkai","element","gazipur","hîncești","item number","lower camel case","méxico","nth","position","qaşīm","tougué"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"type"}],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-86ddb7f6","guard":[["hasAny",["abra","beyla","buri","cabo","dashes","druskininkai","element","gazipur","hyphens","hîncești","item number","kebab case","kebabcase","méxico","nth","position","qaşīm","slug","tougué"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"type"}],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-a41febf2","guard":[["hasAny",["abra","beyla","buri","cabo","druskininkai","element","gazipur","hîncești","item number","méxico","nth","position","qaşīm","reverse the words","reverse word order","tougué","words backwards"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"type"}],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-e3864e48","guard":[["hasAny",["abra","beyla","buri","cabo","class name","druskininkai","element","gazipur","hîncești","item number","méxico","nth","pascal case","pascalcase","position","qaşīm","tougué","upper camel case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"type"}],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"},{"lit":"type"}]]],"mem":null},
{"id":"n-347b1f93","guard":[["hasAny",["abra","buri","element","hwanghaebukto","iloilo","item number","limpopo","nth","oudômxai","position","quebec"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Province."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}]],"mem":null},
{"id":"n-aaee5576","guard":[["hasAny",["element","gazipur","gopalganj","hîncești","item number","lyantonde","mbarara","nth","okrug","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is District."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}]],"mem":null},
{"id":"n-76f3ecac","guard":[["hasAny",["aragua","arunāchal","chuuk","dakota","element","item number","méxico","nth","position"]],["not",["has","community"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is State."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}]],"mem":null},
{"id":"n-68867bfb","guard":[["hasAny",["aragua","arunāchal","dakota","delete","element","item number","méxico","nth","position","remove","strip out","without"]],["has","type"],["not",["has","community"]]],"pyramid":["render.str",["transform.remove",{"lit":"State"},["transform.nthStr",["know.find",{"lit":"world-cities"},{"lit":"region"}],{"lit":1}]]],"mem":null},
{"id":"n-6a3a0347","guard":[["hasAny",["buri","delete","element","item number","limpopo","nth","oudômxai","position","quebec","remove","strip out","without"]],["has","type"]],"pyramid":["render.str",["transform.remove",{"lit":"province"},["transform.nthStr",["know.find",{"lit":"world-cities"},{"lit":"region"}],{"lit":1}]]],"mem":null},
{"id":"n-9309cd65","guard":[["hasAny",["buri","delete","element","item number","limpopo","nth","oudômxai","position","quebec","remove","strip out","without"]],["has","type"]],"pyramid":["render.str",["transform.remove",{"lit":"Province"},["transform.nthStr",["know.find",{"lit":"world-cities"},{"lit":"region"}],{"lit":1}]]],"mem":null},
{"id":"n-b348a13e","guard":[["hasAny",["aragua","arunāchal","dakota","delete","element","item number","méxico","nth","position","remove","strip out","without"]],["has","type"],["not",["has","community"]]],"pyramid":["render.str",["transform.remove",{"lit":"state"},["transform.nthStr",["know.find",{"lit":"world-cities"},{"lit":"region"}],{"lit":1}]]],"mem":null},
{"id":"n-882b1adf","guard":[["hasAny",["boucle","element","item number","khomas","nth","position","qaşīm","tillabéri"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Region."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}]],"mem":null},
{"id":"n-cf84c4f5","guard":[["hasAny",["druskininkai","element","item number","mokronogtrebelno","nth","position","tálknafjarðarhreppur","ísafjarðarbær"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Municipality."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}]],"mem":null},
{"id":"n-6b71bcb3","guard":[["hasAny",["abra","buri","cabo","delete","item number","nth","strip out"]],["has","type"]],"pyramid":["render.str",["transform.remove",{"lit":"province"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-dee85a60","guard":[["hasAny",["abra","buri","cabo","delete","item number","nth","strip out"]],["has","type"]],"pyramid":["render.str",["transform.remove",{"lit":"Province"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-fc504961","guard":[["hasAny",["abra","buri","cabo","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Province."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"type"}]],"mem":null},
{"id":"n-028f3cea","guard":[["hasAny",["beyla","delete","item number","nth","strip out","tougué"]]],"pyramid":["render.str",["transform.remove",{"lit":"Prefecture"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-12408b1a","guard":[["hasAny",["delete","gazipur","hîncești","item number","nth","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"district"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-2e02b60a","guard":[["hasAny",["delete","druskininkai","díli","item number","nth","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Municipality"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-503af22c","guard":[["hasAny",["delete","druskininkai","díli","item number","nth","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"municipality"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-60ba0c55","guard":[["hasAny",["delete","gazipur","hîncești","item number","nth","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"District"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-efc0bf6f","guard":[["hasAny",["delete","item number","lääneharju","lääneranna","nth","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Rural municipality"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-1914ddbf","guard":[["hasAny",["beyla","element","item number","nth","position","tougué"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Prefecture."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}]],"mem":null},
{"id":"n-20d29c81","guard":[["hasAny",["element","item number","lääneharju","lääneranna","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Rural municipality."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}]],"mem":null},
{"id":"n-045a1d58","guard":[["hasAny",["delete","element","hîncești","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"district"},["transform.nthStr",["know.find",{"lit":"world-cities"},{"lit":"region"}],{"lit":1}]]],"mem":null},
{"id":"n-0d70a9fe","guard":[["hasAny",["al","delete","item number","nth","strip out"]],["has","type"]],"pyramid":["render.str",["transform.remove",{"lit":"Region"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-24f38e7f","guard":[["hasAny",["delete","item number","méxico","nth","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"State"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-2d01e507","guard":[["hasAny",["delete","element","hîncești","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"District"},["transform.nthStr",["know.find",{"lit":"world-cities"},{"lit":"region"}],{"lit":1}]]],"mem":null},
{"id":"n-32672241","guard":[["hasAny",["boucle","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"region"},["transform.nthStr",["know.find",{"lit":"world-cities"},{"lit":"region"}],{"lit":1}]]],"mem":null},
{"id":"n-4b5201d4","guard":[["hasAny",["al","delete","item number","nth","strip out"]],["has","type"]],"pyramid":["render.str",["transform.remove",{"lit":"region"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-82e9a2c4","guard":[["hasAny",["delete","element","item number","méxico","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"state"},["transform.nthStr",["know.find",{"lit":"world-cities"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-8e26d5f5","guard":[["hasAny",["delete","item number","méxico","nth","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"state"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-ed955f8e","guard":[["hasAny",["boucle","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Region"},["transform.nthStr",["know.find",{"lit":"world-cities"},{"lit":"region"}],{"lit":1}]]],"mem":null},
{"id":"n-0a649575","guard":[["hasAny",["element","item number","mauren","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Commune."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}]],"mem":null},
{"id":"n-15b66895","guard":[["hasAny",["element","item number","nth","position","usulután"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Department."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}]],"mem":null},
{"id":"n-2e11abe6","guard":[["hasAny",["element","item number","moskva","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Autonomous city."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}]],"mem":null},
{"id":"n-756836f4","guard":[["hasAny",["cantal","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Metropolitan department."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}]],"mem":null},
{"id":"n-9cca53fe","guard":[["hasAny",["element","incheongwangyeoksi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Metropolitan city."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}]],"mem":null},
{"id":"n-c6be5173","guard":[["hasAny",["element","gradec","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Urban municipality."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}]],"mem":null},
{"id":"n-ec3f6563","guard":[["hasAny",["element","item number","nth","pordenone","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Decentralized regional entity."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}]],"mem":null},
{"id":"n-ed50f634","guard":[["hasAny",["element","item number","khaymah","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Emirate."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"type"}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the type of Arunāchal Pradesh","expect":{"contains":["State"],"notRefusal":true}},{"q":"tell me the type of Šumadijski okrug","expect":{"contains":["District"],"notRefusal":true}},{"q":"name the type of Druskininkai","expect":{"contains":["Municipality"],"notRefusal":true}},{"q":"what is the type of Tálknafjarðarhreppur","expect":{"contains":["Municipality"],"notRefusal":true}},{"q":"tell me the type of South Dakota","expect":{"contains":["State"],"notRefusal":true}},{"q":"name the type of Al Qaşīm","expect":{"contains":["Region"],"notRefusal":true}},{"q":"what is the type of Gopalganj","expect":{"contains":["District"],"notRefusal":true}},{"q":"tell me the type of Limpopo","expect":{"contains":["Province"],"notRefusal":true}},{"q":"name the type of Gazipur","expect":{"contains":["District"],"notRefusal":true}},{"q":"what is the type of Mokronog-Trebelno","expect":{"contains":["Municipality"],"notRefusal":true}},{"q":"tell me the type of Tillabéri","expect":{"contains":["Region"],"notRefusal":true}},{"q":"name the type of Cabo Delgado","expect":{"contains":["Province"],"notRefusal":true}},{"q":"what is the type of Díli","expect":{"contains":["Municipality"],"notRefusal":true}},{"q":"tell me the type of Ra’s al Khaymah","expect":{"contains":["Emirate"],"notRefusal":true}},{"q":"name the type of Suphan Buri","expect":{"contains":["Province"],"notRefusal":true}},{"q":"what is the type of Aragua","expect":{"contains":["State"],"notRefusal":true}},{"q":"tell me the type of Mauren","expect":{"contains":["Commune"],"notRefusal":true}},{"q":"name the type of Tougué","expect":{"contains":["Prefecture"],"notRefusal":true}},{"q":"what is the type of Pordenone","expect":{"contains":["Decentralized regional entity"],"notRefusal":true}},{"q":"tell me the type of Iloilo","expect":{"contains":["Province"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
