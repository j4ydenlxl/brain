// extension-media-type-neo-g10-2.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"extension-media-type-neo-g10-2","class":"extension-media-type","generation":10,"lane":"neo","grownFrom":["name the content type for .osfpvg files","which MIME type goes with the extension xhtml","what is the media type of a .gnumeric file","which MIME type goes with the extension me","what is the media type of a .xlt file","what is the media type of a .ez file","which MIME type goes with the extension gxf","name the content type for .qam files","what is the media type of a .oth file","what is the media type of a .texi file","name the content type for .frame files","name the content type for .ttc files","name the content type for .dataless files","name the content type for .wpd files","name the content type for .qxb files","what is the media type of a .webmanifest file","which MIME type goes with the extension es3","which MIME type goes with the extension glb","name the content type for .ustar files","name the content type for .jad files"],"version":1});

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
knowLoad([{"id":"mime-types","columns":["file extension","media type"],"n":2878,"cols":[{"s":"|||||||||||||||||||||||||||||||||||||ez|appinstaller||aw|appx|appxbundle||||||atom|atomcat|atomdeleted||atomsvc|dwd||held||rsat|||aml|amlx|||bdoc|||||xcs||||||||ccxml||cdfx|cdmia|cdmic|cdmid|cdmio|cdmiq||||||||||||||||||||||||||||||cpl|||||cu|cwl||||||mpd|mpp||davmount|||||dcm|||||||||dbk||||dssc|xdssc||||||||ecma||||||||||||||||||emma|emotionml||||epub||exi|||exp|||fdf|fdt|||||||pfr|||geojson||||||||gml|||||gpx||gxf|gz|||hjson|||stk|||||||||||ink|inkml||ipfix|||its|jar|war|ear|ser|class|js|||||||json|map||||json5|jsonml|||||||kbl|||jsonld|lgr||||||lostxml||||hqx|cpt||mads|webmanifest|mrc|mrcx|ma|nb|mb|mathml||||||||||||||mbox|||mpf||mscml||metalink|meta4|mets|||||maei|musd|mods|||||m21|mp21|mp4|mpg4|mp4s|m4p||||||||msix|msixbundle|doc|dot|||mxf|nq|nt||||||cjs||||||bin|dms|lrf|mar|so|dist|distz|pkg|bpk|dump|elc|deploy|exe|dll|deb|dmg|iso|img|msi|msp|msm|buffer|oda|||opf|ogx||omdoc|onetoc|onetoc2|onetmp|onepkg|one|onea|||oxps|||relo|||xer|pdf|||pgp|asc|sig|asc|prf|||p10||p7m|p7c|p7s|p8||ac|cer|crl|pkipath|pki|pls||ai|eps|ps|||||||||provx|||cww|||||||||||||||xsf|pskcxml|||raml|||rdf|owl|rif|rnc||||rl|rld||||rs|rapd|sls|rusd||gbr|mft||roa||||rsd|rss|rtf||||||||sbml|||||scq|scs|spq|spp||||sdp||||senmlx||||||sensmlx||||||setpay||setreg|||shf|siv|sieve|||||||smi|smil||||rq|srx|||sql|gram|grxml|sru|ssdl||ssml|||||||swidtag|||||||||||||||tei|teicorpus|||tfi|||tsd|||||||toml||trig|||||ttml||||ubj|||||rsheet|td||||||||vec|||||1km||||||||||||||||||||||||||||||||||||||||||||||||||||||plb|psb|pvb|||||||||||||||||||||||||||tcap||pwn|aso|imp|||acu|atc|acutc|air||fcdt|fxp|fxpl||xdp|xfdf|||||||||||||||age||ahead||azf|azs||azw||acc|ami|||apk||cii|fti|atx|||parquet||||||||mpkg|key|m3u8|numbers|pages|pkpass||swi|||||||iota|aep|fbx||||bmml||||||||||||mpm|||bmi|||rep|||||||||||cdxml||mmd||cdy||csl|cla|rp9|c4g|c4d|c4f|c4p|c4u|c11amc|c11amz|||||||||||||||||csp|cdbcmsg||cmc|clkx|clkk|clkp|clkt|clkw|wbs|||||pml||||ppd||||car|pcurl||||||||dart|rdz||||dbf|dcmp||uvf|uvvf|uvd|uvvd|uvt|uvvt|uvx|uvvx|uvz|uvvz|fe_launch||||dna||mlp||||dpg|dfac||kpxx||||ait|||||||||||||||||||svc||geo||||||mag||||||||||nml|||esf|msf|qam|slt|ssf||||es3|et3||||||||||||||||||||||||||||||ez2|ez3|||||fdf|mseed|seed|dataless||||||||gph|ftc||fm|frame|maker|book||fnc|ltf|fsc|||||oas|oa2|oa3|fg5|bh2|||ddd|xdw|xbd||||||fzs|||txd||||||||||||ggb||ggs|ggt|gex|gre|gxt|g2w|g3w||||gmx||||gdoc|gdraw||||gform||gjam||gmap||gslides|gscript||gsite|gsheet|||kml|kmz|||xdcf||gqf|gqs||gac|ghf|gim|grv|gtm|tpl|vcg||hal|zmm|hbci|||||les|hpgl|hpid|hps|jlt|pcl|pclxl|||sfd-hdstx|||||||mpy|afp|listafp|list3820|irm|sc|icc|icm||igl|||ivp|ivu|||||||||||||||igm|xpw|xpx|i2g|||qbo|qfx|||||||||||||rcprofile|irp|xpr|fcs||jam|||||||||rms|jisp|joda||ktz|ktr|karbon|chrt|kfo|flw|kon|kpr|kpt|ksp|kwd|kwt||htke|||kia|kne|knp|skp|skd|skt|skm|sse|||lasxml|||||lbd|lbe|||123|apr|pre|nsf|org|scm|lwp|portpkg||mvt||||||||mcd|||mc1|cdkey||||mwf|mfm||flo|igx||||mif|||daf|dis|mbk|mqy|msl|plc|txf||mpn|mpc|||||||||xul||cil||cab||xls|xlm|xla|xlc|xlt|xlw|xlam|xlsb|xlsm|xltm|eot|chm|ims|lrm||thmx||msg||cat|stl||ppt|pps|pot|ppam|pptm|sldm|ppsm|potm||||mpp|mpt||vdx|||||||||docm|dotm|wps|wks|wcm|wdb|wpl|xps||mseq||||||mus|msty|taglet||||bdo||||||||nlu||||ntf|nitf|nnd|nns|nnw|||||||||ac|ngdat|n-gage||||rpst|rpss|edm|edx|ext|||||||||||odc|otc|odb|odf|odft|odg|otg|odi|oti|odp|otp|ods|ots|odt|odm||ott|oth||||||||||||||||xo||||||||||||||||||||||||dd2|||||||||||||||||||||||||||obgx|||oxt||osm||||||||||||||||||pptx|||sldx||||ppsx|||||potx||||||||||||||||xlsx||||||xltx|||||||||docx||||||||||dotx|||||||||mgp||dp|esa||||pdb|pqa|oprc|||||paw||str|ei6||efif|wg|||plf|pbd||||||systemverify||box|brush|brushset|drm||mgz|||qps|ptid||xhtm||||qxd|qxt|qwd|qwt|qxl|qxb||||||||||||||||||||rar|bed|mxl|musicxml|||||cryptonote|cod|rm|rmvb|link66||||st||||||||||||||||see||sema|semd|semf||ifm|itp|iif|ipk||||||twd|twds||||mmf||teacher|||fo||sdkm|sdkd|dxp|sfs|sqlite|sqlite3||||sdc|sda|sdd|smf|sdw|vor|sgl|smzip|sm||wadl|sxc|stc|sxd|std|sxi|sti|sxm|sxw|sxg|stw||sus|susp|svd|||||sis|sisx|xsm|bdm|xdm|||ddf|||||tao|pcap|cap|dmp||||tmo||tpt|mxs|tra|||ufd|ufdl|||||utz|umj|unityweb|uoml|uo||||||||||||||||vcx||||||||||||vsd|vst|vss|vsw|vsdx|vtx|vis|||vsf|||||wbxml|wmlc|wmlsc||wtb||||||||||nbp||wpd|wqd||stf|||||xar||||xfdl||||||||hvd|hvs|hvp|osf|osfpvg||saf|spf||||cmp||zir|zirz|zaz|vxml||||||||wasm|wif||||wgt|hlp|||wsdl|wspolicy|7z|abw|ace||dmg|arj|aab|x32|u32|vox|aam|aas|bcpio|bdoc|torrent|blend|blb|blorb|bz|bz2|boz|cbr|cba|cbt|cbz|cb7|vcd|cfs|chat|pgn|crx|cco||rar|nsc|cpio|csh||deb|udeb|dgc|dir|dcr|dxr|cst|cct|cxt|w3d|fgd|swa|wad|ncx|dtb|res|dvi|evy|eva|bdf|||gsf||psf|pcf|snf|||pfa|pfb|pfm|afm||arc|spl|gca|ulx|gnumeric|gramps|gtar||hdf|php|install|ipynb|iso|key|numbers|pages|jardiff|jnlp||kdbx|latex|luac|lzh|lha|run|mie|prc|mobi||application|lnk|wmd|wmz|xbap|mdb|obd|crd|clp|exe|exe|dll|com|bat|msi|mvb|m13|m14|wmf|wmz|emf|emz|mny|pub|scd|trm|wri|nc|cdf|pac|nzb|pl|pm|prc|pdb|p12|pfx|p7b|spc|p7r||rar|rpm|ris|sea|sh|shar|swf|xap|sql|sit|sitx|srt|sv4cpio|sv4crc|t3|gam|tar|tcl|tk|tex|tfm|texinfo|texi|obj|ustar|hdd|ova|ovf|vbox|vbox-extpack|vdi|vhd|vmdk|src|webapp||der|crt|pem|||fig|xlf|xpi|xz|zip|z1|z2|z3|z4|z5|z6|z7|z8|||xaml|xav|xca|xdf|xel||xns|||xenc|xfdf|xhtml|xht||xlf|xml|xsl|xsd|rng|dtd||||xop|xpl|xsl|xslt|xspf|mxml|xhvml|xvml|xvm||yang|||||||yin|zip|lottie|||||3gpp||adts|aac||adp|amr||||||||au|snd|||||||||||||||||||||||||||||||||||||||||||||||||||||||||mka||||||mid|midi|kar|rmi||mxmf|mp3|m4a|mp4a|m4b||||mpga|mp2|mp2a|mp3|m2a|m3a|||oga|ogg|spx|opus|||||||||||||||s3m||sil|||||||||||||||||||||||||||||uva|uvva|eol||||||||||dra|dts|dtshd|||||lvp|pya|||ecelp4800|ecelp7470|ecelp9600|||||rip|||||||wav|wav|weba|aac|aif|aiff|aifc|caf|flac|m4a|mka|m3u|wax|wma|ram|ra|rmp|ra||wav|xm|cdx|cif|cmdf|cml|csml||xyz|ttc|otf||ttf|woff|woff2|exr|apng|avci|avcs|avif|bmp|dib|cgm|drle|dpx|emf|fits|g3|gif|heic|heics|heif|heifs|hej2|ief||jaii|jais|jls|jp2|jpg2|jpg|jpeg|jpe|jph|jhc|jpm|jpgm|jpx|jpf|jxl|jxr|jxra|jxrs|jxs|jxsc|jxsi|jxss|ktx|ktx2||jfif|png|btif|btf|pti||sgi|svg|svgz|t38|tif|tiff|tfx|psd|azv|facti|||uvi|uvvi|uvg|uvvg|djvu|djv|sub|dwg|dxf|fbs|fpx|fst|mmr|rlc||ico|||dds|mdi|wdp|npx|b16||||||tap|vtf|wbmp|xif|pcx|webp|wmf|3ds|dng|ras|cmx||fh|fhc|fh4|fh5|fh7|ico|jng|sid|bmp|pcx|pic|pct|pnm|pbm|pgm|ppm|rgb|tga||xbm||xpm|xwd||||disposition-notification|||u8msg|u8dsn|u8mdn|u8hdr||||||||eml|mime|mht|mhtml||||||wsc|3mf||gltf|glb|igs|iges|jt|msh|mesh|silo|mtl|obj|prc|step|stp|stpnc|p21|210|stpx|stpz|stpxz|stl|u3d|bary|cld|dae|dwf||gdl|||gtw||mts|ogex|x_b|x_t|pyo|pyox||vds|usda|usdz|bsp|vtu|wrl|vrml|x3db|x3dbz|x3db|x3dv|x3dvz|x3d|x3dz|x3dv||||||||||||||||||appcache|manifest|ics|ifb||coffee|litcoffee||||css|csv|||||||||||||html|htm|shtml|jade|js|mjs||jsx|less|md|markdown|mml|mdx||n3||||txt|text|conf|def|list|log|in|ini|||dsc||||||rtx|rtf||||sgml|sgm||shex|slim|slm|spdx||stylus|styl||tsv|t|tr|roff|man|me|ms|ttl||uri|uris|urls|vcard||||curl|dcurl|mcurl|scurl|||sub|||ged||fly|flx||gv|||3dml|spot|||||||||||jad||||||wml|wmls||vtt|wgsl|s|asm|c|cc|cxx|cpp|h|hh|dic|htc|f|for|f77|f90||hbs|java||lua|mkd|nfo|opml|org|p|pas|php|pde|sass|scss|etx|sfv|ymp|uu|vcs|vcf|xml||yaml|yml||3gp|3gpp||3g2||||||||||h261|h263|||h264|||||m4s|jpgv|||jpm|jpgm|||mkv|mk3d|mj2|mjp2|||ts|m2t|m2ts|mts|mp4|mp4v|mpg4||mpeg|mpg|mpe|m1v|m2v||||ogv|||qt|mov||||||||||||||uvh|uvvh|uvm|uvvm||uvp|uvvp|uvs|uvvs|uvv|uvvv||||dvb|fvt||||||||||mxu|m4u|pyv||||||||||||uvu|uvvu|viv||||webm|f4v|fli|flv|m4v|mkv|mk3d|mks|mng|asf|asx|vob|wm|wmv|wmx|wvx|avi|movie|smv|ice||","sep":"|"},{"f":"0application/1d-interleaved-parityfec|c3gpdash-qoe-report+xml|fp-ims+xml|hmbs-object-manifest+json|luser-service-descriptions+json|iedia-delivery-metrics-report+json|ghal+json|jforms+json|ca2l|das+zip|dce+cbor|gjson|f-groupcomm+cbor|gtrl+cbor|etivemessage|hity+json|dif+cbor|gjson|dlto-cdni+json|lfilter+json|iostmap+json|ofilter+json|hdirectory+json|hendpointcost+json|tparams+json|pprop+json|tparams+json|irror+json|hnetworkmap+json|rfilter+json|hpropmap+json|oparams+json|htips+json|lparams+json|hupdatestreamcontrol+json|tparams+json|dml|dndrew-inset|dppinstaller|flefile|gixware|fx|gbundle|dsyncapi+json|lyaml|dt+jwt|ef|fx|eom+xml|gcat+xml|gdeleted+xml|gicmail|gsvc+xml|esc-dwd+xml|iynamic-event-message|hheld+xml|hrdt+json|isat+xml|exml|duth-policy+xml|fomationml-aml+xml|sx+zip|cbacnet-xdd+zip|etch-smtp|ddoc|deep+xml|dufr|cc2pa|dalendar+json|lxml|fl-completion|fs-1840|eptive+json|dbor|g-seq|dccex|emp+xml|exml+xml|dda+xml|efx+xml|emi-capability|iontainer|hdomain|hobject|hqueue|eni|de+cbor|ea|f-2018+xml|ellml+xml|dfw|did|f-edhoc+cbor-seq|ety+json|l-seq|dlr|eue+xml|g_info+xml|dms|ew+cbor|hose|gjson|hws|dnrp+xml|doap-eap|hgroup+json|hpayload|emmonground|encise-problem-details+cbor|fference-info+xml|ese|g-key|k-set|hx509|dpl+xml|dsrattrs|eta+xml|gdata+xml|evm+json|du-seeme|dwl|f+json|gyaml|et|dybercash|cdart|esh+xml|g-patch+xml|gdelta|evmount+xml|dca-rft|ed|dec-dx|dialog-info+xml|ecom|h+json|ixml|ed|ei|et|dns|f+json|f-message|docbook+xml|ets+cbor|dpop+jwt|dskpp+xml|esc+der|hxml|dvcs|ceat+cwt|gjwt|f-bun+cbor|kjson|gucs+cbor|kjson|dcmascript|ddhoc+cbor-seq|ei-consent|gx12|ffact|dfi|dlm+json|gxml|dmergencycalldata.cap+xml|vomment+xml|wntrol+xml|udeviceinfo+xml|uecall.msd|ulegacyesn+json|uproviderinfo+xml|userviceinfo+xml|vubscriberinfo+xml|uveds+xml|ema+xml|eotionml+xml|dncaprtp|etity-statement+jwt|dpp+xml|eub+zip|dshop|dxi|epect-ct-report+json|flicit-registration-response+jwt|fress|cfastinfoset|gsoap|ddf|et+xml|dhir+json|hxml|dido.trusted-apps+json|ets|dlexfec|dont-sfnt|htdpfr|hwoff|dramework-attributes+xml|cgeo+json|k-seq|ffeed+csv|fpackage+sqlite3|gose+json|fxacml+json|lxml|dltf-buffer|dml+xml|dnap-binding-jws|sd|protation-jws|zwsd|dpx+xml|drib|dxf|dzip|ch224|deld+xml|djson|dl7v2+xml|dttp|dyperstudio|cibe-key-request+xml|gpkg-reply+xml|hp-data|dges|dm-iscomposing+xml|dndex|h.cmd|iobj|iresponse|ivnd|ekml+xml|l|dotp|dpfix|ep|dsup|dts+xml|cjava-archive|o|o|hserialized-object|hvm|gscript|df2feed+json|dose|g+json|drd+json|dscalendar+json|fontact+json|eon|g|g-patch+json|m-query+json|hseq|g5|gml+json|gpath|dwk+json|f-set+json|lwt|et|ckb+jwt|el+xml|dpml-request+xml|jsponse+xml|cld+json|dgr+xml|dink-format|gset|j+json|doad-control+xml|egout+jwt|est+xml|gsync+xml|dpf+zip|dxf|cmac-binhex40|gcompactpro|fwriteii|eds+xml|enifest+json|erc|gxml+xml|ethematica|n|n|gml+xml|i-content+xml|jpresentation+xml|dbms-associated-procedure-description+xml|hderegister+xml|henvelope+xml|hmsk+xml|k-response+xml|hprotection-description+xml|hreception-report+xml|jgister+xml|p-response+xml|hschedule+xml|huser-service-description+xml|eox|deasured-component+cbor|vjson|edia-policy-dataset+xml|h_control+xml|hservercontrol+xml|erge-patch+json|etalink+xml|k4+xml|fs+xml|df4|dikey|epc|essing-blocks+cbor-seq|dmt-aei+xml|gusd+xml|dods+xml|ess-keys|hsignature|gkey-data|krequest|dp21|g|e4|f|f|f|eeg4-generic|iiod|l-xmt|drb-consumer+xml|gpublish+xml|dsc-ivr+xml|gmixer+xml|eix|gbundle|eword|i|dud+json|eltipart-core|dxf|cn-quads|etriples|dasdata|dews-checkgroups|hgroupinfo|htransmission|dlsml+xml|dode|dss|coauth-authz-req+jwt|dblivious-dns-message|dcsp-request|jsponse|etet-stream|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|dda|em+xml|ex|debps-package+xml|dgg|dhttp-keys|dmdoc+xml|dnenote|j|j|j|j|j|dpc-nodeset+xml|dscore|dxps|cp21|f+zip|ep-overlay+xml|darityfec|essport|etch-ops-error+xml|ddf|ex|dem-certificate-chain|dgp-encrypted|gkeys|gsignature|p|dics-rules|edf+xml|g-diff+xml|dkcs10|h2|g7-mime|m|isignature|g8|h-encrypted|eix-attr-cert|hcert|irl|hpkipath|gcmp|dls+xml|doc-settings+xml|estscript|m|m|dpsp-tracker+json|drivate-token-issuer-directory|qrequest|ssponse|eoblem+json|kxml|ftobuf|k+json|fvenance+xml|gided-claims+jwt|es.alvestrand.titrax-sheet|gcww|hyn|ghpub+zip|gimplied-document+xml|oexecutable|oobject+json|z-seq|vyaml|ostructure|gmayfile|gnprend|gplucker|grdf-xml-crypt|gsclt|gvcfbzip2|gxsf+xml|dskc+xml|dvd+json|cqsig|craml+yaml|eptorfec|ddap+json|ef+xml|j|deginfo+xml|elax-ng-compact-syntax|emote-printing|eputon+json|esolve-response+jwt|gurce-lists+xml|q-diff+xml|dfc+xml|discos|dlmi+xml|es-services+xml|doute-apd+xml|is-tsid+xml|iusd+xml|dpki-checklist|hghostbusters|hmanifest|hpublication|hroa|hsigned-tal|hupdown|ds-metadata+xml|ed+xml|es+xml|dtf|eploopback|ex|csamlassertion+xml|gmetadata+xml|erif+json|h-external-properties+json|dbe|eml+xml|dcaip+xml|eim+json|ftt-receipt+cose|istatement+cose|evp-cv-request|msponse|hvp-request|msponse|dd-jwt|i+json|ef+json|ep|decevent+jwt|enml+cbor|ijson|ixml|h-etch+cbor|njson|jxi|fsml+cbor|jjson|jxml|i-exi|ep+xml|f-exi|ession-info|et-payment|n-initiation|gregistration|s-initiation|dgml|g-open-catalog|dhf+xml|dieve|h|emple-filter+xml|jmessage-summary|isymbolcontainer|epc|dlate|dmil|g+xml|k|epte336m|doap+fastinfoset|hxml|dparql-query|jresults+xml|edx+json|eirits-event+xml|dql|drgs|g+xml|eu+xml|dsdl+xml|elkeylogfile|eml+xml|dt2110-41|eix+json|eratum|duit-envelope+cose|hreport+cose|dwid+cbor|hxml|ctamp-apex-update|s-confirm|hcommunity-update|x-confirm|herror|hsequence-adjust|w-confirm|itatus-query|oresponse|hupdate|n-confirm|er|exii+json|dd+json|dei+xml|j|etra_isi|exinfo|dhraud+xml|dimestamp-query|mreply|led-data|dlsrpt+gzip|jjson|dm+json|dnauthlist|doc+cbor|eken-introspection+jwt|eml|drickle-ice-sdpfrag|fg|eust-chain+json|imark+jwt|m-delegation+jwt|nstatus-response+jwt|dtml+xml|dve-trigger|dzif|g-leap|cubjson|dccs+cbor|djcs+json|dlpfec|drc-grpsheet+xml|gressheet+xml|gtargetdesc+xml|guisocketdesc+xml|cvc|e+cose|fjwt|fsd-jwt|eard+json|ixml|dec+xml|f-package+gzip|ozip|emmi|dividence.scriptfile|dnd.1000minds.decision-model+xml|hob|g3gpp-prose+xml|q-pc3a+xml|vch+xml|uch+xml|t8+xml|lv2x-local-service-information|k.5gnas|nsa2x|r-local-service-information|ov2x|r-local-service-information|laccess-transfer-events+xml|lbsf+xml|lcrs+xml|murrent-location-discovery+xml|lgmop+xml|mtpc|linterworking-data|llpp|lmc-signalling-ear|ndata-affiliation-command+xml|sinfo+xml|smsgstore-ctrl-request+xml|spayload|sregroup+xml|sservice-config+xml|tignalling|sue-config+xml|tser-profile+xml|nptt-affiliation-command+xml|rfloor-request+xml|rinfo+xml|rlocation-info+xml|rmbms-usage-info+xml|rregroup+xml|rservice-config+xml|signed+xml|rue-config+xml|uinit-config+xml|sser-profile+xml|nvideo-affiliation-command+xml|tinfo+xml|tlocation-info+xml|tmbms-usage-info+xml|tregroup+xml|tservice-config+xml|ttransmission-request+xml|tue-config+xml|user-profile+xml|mid-call+xml|lngap|lpfcp|mic-bw-large|ssmall|svar|nnapp-info+xml|ls1ap|meal-app-comm-requirements-info+xml|qdata-delivery-info+cbor|zvery-info+xml|qgroup-doc+xml|qinfo+xml|qlocation-info+cbor|zinfo+xml|qmbms-usage-info+xml|ss-usage-info+xml|qnetwork-qos-management-info+xml|yresource-info+cbor|que-config-info+xml|rnicast-info+xml|rser-profile-info+xml|mms|o+xml|mrvcc-ext+xml|rinfo+xml|mtate-and-event-info+xml|lussd+xml|lv2x|mae-info+xml|k2.bcmcsinfo+xml|msms|mtcap|hlightssoftware.imagescal|hm.post-it-notes|gaccpac.simply.aso|uimp|im.addressxfer+json|kchatbot+json|iucobol|lrp|n|hdobe.air-application-installer-package+zip|mflash.movie|normscentral.fcdt|nxp|p|mpartial-upload|mxdp+xml|nfdf|hether.imp|hfpc.afplinedata|w-pagedef|lcmoca-cmresource|lfoca-charset|rodedfont|upage|lmodca|q-cmtable|rformdef|rmediummap|robjectcontainer|sverlay|rpagesegment|hge|hh-barcode|iead.space|hia|irzip.filesecure.azf|zzs|hmadeus+json|jzon.ebook|nmobi8-ebook|iericandynamics.acc|iiga.ami|iundsen.maze+xml|hndroid.ota|opackage-archive|iki|iser-web-certificate-issue-initiation|qfunds-transfer-initiation|itix.game-component|hpache.arrow.file|tstream|nparquet|nthrift.binary|ucompact|ujson|iexlang|ii+json|ilextor.warrp+json|iothekende.reservation+json|iple.installer+xml|mkeynote|mmpegurl|mnumbers|mpages|nkpass|hrastra.swi|iistanetworks.swi|itisan+json|jsquare|hs207960.vas.config+jer|z+uper|ttap+jer|xuper|itraea-software.iota|hudiograph|itodesk.fbx|kpackage|hvalon+json|iistar+xml|gbalsamiq.bmml+xml|rpr|inana-accounting|hbf.usp.error|omsg|r+json|hekitzur-stech+json|ilightsoft.lhzd+zip|vl+zip|hint.med-content|iopax.rdf+xml|hlink-idb-value-wrapper|iueice.multipass|ktooth.ep.oob|qle.oob|hmi|hpf|j3|husinessobjects|hyu.uapi+json|hzip3|gc3voc.schedule+xml|hab-jscript|inon-cpdl|mlips|ipasystems-pg+json|hel|indio.thinlinc.clientconf|jtury-systems.tcp_stream|hhemdraw+xml|jss-pgn|iipnuts.karaoke-mmd|hiedi|inderella|irpack.isdn-ext|itationstyles.style+xml|hlaymore|ioanto.rp9|jnk.c4group|t|t|t|t|iuetrust.cartomobile-config|zle-config-pkg|hncf.helm.chart.content.v1.tar+gzip|wprovenance.v1.prov|ronfig.v1+json|hoffeescript|illabio.xodocuments.document|zs.document-template|zs.presentation|zs.presentation-template|zs.spreadsheet|zs.spreadsheet-template|kection+json|q.doc+json|rnext+json|imicbook+zip|p-rar|jmerce-battelle|konspace|intact.cmsg|ireos.ignition+json|ismocaller|hrick.clicker|t.keyboard|upalette|utemplate|uwordbank|jticaltools.wbs+xml|iyptii.pipe+json|lo-shade-file|mmator.encrypted|svault|htc-posml|jt.ws+xml|hups-pdf|mostscript|mpd|lraster|nw|irl|k.car|lpcurl|hyan.dean.root+xml|ibank|iclonedx+json|qxml|gd2l.coursepackage1p0+zip|h3m-dataset|kproblem|hart|ita-vision.rdz|klog|kpackage+json|kresource+json|hbf|hcmp+xml|hebian.binary-package|ice.data|p|p|p|lttml+xml|t|lunspecified|w|lzip|o|inovo.fcselayout-link|ismume.movie|hir-bi.plate-dl-nosuffix|hm.delegation+xml|hna|hocument+json|ilby.mlp|nobile.1|t2|iremir.scorecloud-binary-document|hpgraph|hreamfactory|iive+json|hs-keypoint|htg.local|p.flash|qhtml|hvb.ait|kdvbisl+xml|nj|kesgcontainer|kipdcdftnotifaccess|oesgaccess|x2|rpdd|oroaming|mtv.alfec-base|venhancement|knotif-aggregate-root+xml|qcontainer+xml|qgeneric+xml|qia-msglist+xml|tregistration-request+xml|zration-response+xml|rnit+xml|kpfr|kservice|hxr|hynageo|hzr|geasykaraoke.cdgdownload|hcdis-update|iip.rlp|ilipse.ditto+json|iowin.chart|nfilerequest|rupdate|nseries|trequest|tupdate|hfi.img|lso|hln+zip|hmclient.accessrequest+xml|hnliven|iphase.envoy|hprints.data+xml|ison.esf|mmsf|mquickanime|msalt|nsf|hricsson.quickcall|iofs|hspass-espass+zip|izigno3+xml|s|htsi.aoc+xml|msic-e+zip|qs+zip|lcug+xml|liptvcommand+xml|pdiscovery+xml|pprofile+xml|psad-bc+xml|tcod+xml|tnpvr+xml|qervice+xml|qync+xml|pueprofile+xml|lmcid+xml|mheg5|loverload-control-policy-dataset+xml|lpstn+xml|lsci+xml|mimservs+xml|ltimestamp-token|msl+xml|o.der|hu.kasparian.car+json|idora.data|hvolv.ecig.profile|rsettings|rtheme|hxstream-empower+zip|ppackage|hzpix-album|mpackage|gf-secure.mobile|haf+yaml|imilysearch.gedcom+zip|istcopy-disk-image|hdf|isn.mseed|lseed|p|mtationxml+xml|hfsns|hgb|hiclab.flb+zip|ilmit.zfc|ints|iremonkeys.cloudcell|hlographit|iuxtime.clip|hont-fontforge-sfd|hramemaker|q|q|q|ieelog.comic|iogans.fnc|oltf|hsc.weblaunch|hujifilm.fb.docuworks|zks.binder|zks.container|sjfi+xml|ktsu.oasys|t2|t3|tgp|tprs|kxerox.art-ex|t4|qddd|rocuworks|z.binder|z.container|qhbpl|it-misnet|join+cbor|njson|izzysheet|gg3pix.g3fc|ha4gh.passport+jwt|henomatix.tuxedo|kzip|jtics.grd+json|koo.catmetadata+xml|nebuild|oclass|ngpkg|nmanifest|npkgmetadata+xml|nxpak|io+json|jcube+xml|jgebra.file|ppinboard|pslides|ptool|jmetry-explorer|x|jnext|jplan|jspace|irber|hlobalplatform.card-content-mgt|z-content-mgt-response|hmx|hnu.taler.exchange+json|qmerchant+json|hoogle-apps.audio|sdocument|trawing|uive-sdk|sfile|tolder|urm|tusiontable|sjam|smail-layout|up|sphoto|tresentation|sscript|thortcut|tite|tpreadsheet|sunknown|svideo|nearth.kml+xml|vz|iv.sk.e-form+xml|uzip|nxmldatacontainer+xml|hpxsee.map+xml|hrafeq|m|iidmp|ioove-account|nhelp|nidentity-message|onjector|ntool-message|stemplate|nvcard|ghal+json|kxml|indheld-entertainment+xml|hbci|hc+json|il-bireports|hdt|heroku+json|hhe.lesson-player|hp-hpgl|lid|ls|jjlyt|jpcl|mxl|hsl|httphone|hydrostatix.sof-data|iper+json|l-item+json|ldrive+json|hzn-3d-crossword|gibm.afplinedata|kelectronic-media|kminipay|lodcap|q|q|krights-management|ksecure-container|hccprofile|q|heee.1905|hgloader|hmagemeter.folder+zip|rimage+zip|imervision-ivp|uu|is.imsccv1p1|s2|s3|klis.v2.result+json|lti.v2.toolconsumerprofile+json|vproxy+json|zy.id+json|vsettings+json|zings.simple+json|hnformedcontrol.rms+xml|mix-visionary|ktech.project|w+xml|inopath.wamp.notification|isors.igm|itercon.formnet|w|lgeo|ltrust.digibox|rnncp|ju.qbo|mfx|hpfs.ipns-record|ild.car|ldag-cbor|pjson|lraw|itc.g2.catalogitem+xml|ponceptitem+xml|oknowledgeitem+xml|onewsitem+xml|smessage+xml|opackageitem+xml|planningitem+xml|iunplugged.rcprofile|hrepository.package+xml|hs-xpr|iac.fcs|io11783-10+zip|gjam|ipannet-directory-service|pjpnstore-wakeup|ppayment-wakeup|pregistration|zon-wakeup|psetstore-wakeup|pverification|zon-wakeup|hcp.javame.midlet-rms|hisp|hoost.joda-archive|hsk.isdn-ngn|gkahootz|n|hde.karbon|lchart|lformula|livio|lontour|lpresenter|u|lspread|lword|p|il|henameaapp|iyman.kmp+zip|px|hidspiration|inar|l|hoan|k|k|k|idak-descriptor|glas|j.las+json|oxml|jzip|hdev.productlicensing|heap+json|hiberty-request+xml|hlamagraphics.life-balance.desktop|zbalance.exchange+xml|hogipipe.circuit+zip|iom|itus-1-2-3|mapproach|mfreelance|mnotes|morganizer|mscreencam|mwordpro|gmacports.portpkg|iml|ipbox-vector-tile|irlin.drm.actiontoken+xml|rconftoken+xml|rlicense+xml|rmdcf|ison+json|ixar.archive.3tz+zip|jmind.maxmind-db|hcd|hdl|j-mbsdf|hedcalcdata|jiastation.cdkey|kcalholodeck.recordxr|iridian-slingshot|jmaid|hfer|imp|hicro+json|lgrafx.flo|rigx|lsoft.portable-executable|qwindows.thumbnail-cache|iele+json|if|inisoft-hp3000-save|itsubishi.misty-guard.trustweb|hobius.daf|ois|nmbk|oqy|osl|nplc|ntxf|idl|iphun.application|ncertificate|itorola.flexsuite|y.adsi|zfis|zgotap|zkmr|zttc|zwem|piprm|izilla.xul+xml|hs-3mfdocument|jartgalry|ksf|jcab-compressed|kolor.iccprofile|jexcel|o|o|o|o|o|o.addin.macroenabled.12|psheet.binary.macroenabled.12|vmacroenabled.12|ptemplate.macroenabled.12|jfontobject|jhtmlhelp|jims|jlrm|joffice.activex+xml|ptheme|kpentype|kutlook|jpackage.obfuscated-opentype|kki.seccat|otl|klayready.initiator+xml|kowerpoint|t|t|t.addin.macroenabled.12|upresentation.macroenabled.12|uslide.macroenabled.12|zshow.macroenabled.12|utemplate.macroenabled.12|krintdevicecapabilities+xml|oing.printticket+xml|oschematicket+xml|loject|q|jtnef|jvisio.viewer|jwindows.devicepairing|rnwprinting.oob|rprinterpairing|rwsd.oob|kmdrm.lic-chlg-req|tresp|pmeter-chlg-req|vresp|kord.document.macroenabled.12|otemplate.macroenabled.12|mks|o|o|o|kpl|jxpsdocument|ia-disk-image|ieq|igpack|iign|hultiad.creator|v.cif|isic-niff|lian|ivee.style|hynfc|gnacamar.ybrid+json|ito.bindingdataobject+cbor|zect+json|zect+xml|lopenxmlformats-package.iepd+zip|hcd.control|kreference|hearst.inv+json|ibumind.line|irvana|itfpx|iurolanguage.nlu|himn|intendo.nitro.rom|psnes.rom|itf|k|hoblenet-directory|psealer|pweb|ikia.catalogs|nonml+wbxml|sxml|miptv.config+xml|nsds-radio-presets|mlandmark+wbxml|vxml|ucollection+xml|mn-gage.ac+xml|tdata|tsymbian.install|ncd|mpcd+wbxml|qxml|mradio-preset|ys|ivadigm.edm|rx|qxt|htt-local.content-share|qfile-transfer|qogw_remote-access|qsip-ta_remote|xtcp_stream|hubaltec.nudoku-game|goai.workflows|t+json|uyaml|isis.opendocument.base|zchart|zchart-template|zdatabase|zformula|zformula-template|zgraphics|zgraphics-template|zimage|zimage-template|zpresentation|zpresentation-template|zspreadsheet|zspreadsheet-template|ztext|ztext-master|ztext-master-template|ztext-template|ztext-web|hbn|hcf+cbor|ii.image.manifest.v1+json|hftn.l10n+json|hipf.contentaccessdownload+xml|ystreaming+xml|mspg-hexbinary|ldae.svg+xml|pxhtml+xml|lmippvcontrolmessage+xml|lpae.gem|lspdiscovery+xml|olist+xml|lueprofile+xml|mserprofile+xml|hlpc-sugar|hma-scws-config|phttp-request|wsponse|j.bcast.associated-procedure-parameter+xml|qdrm-trigger+xml|qimd+xml|qltkm|qnotification+xml|qprovisioningtrigger|qsgboot|sdd+xml|tu|rimple-symbol-container|rmartcard-trigger+xml|rprov+xml|rtkm|kcab-address-book+xml|ofeature-handler+xml|opcc+xml|osubs-invite+xml|ouser-prefs+xml|kdcd|nc|ld2+xml|lrm.risd+xml|kgroup-usage-list+xml|klwm2m+cbor|qjson|qtlv|kpal+xml|loc.detailed-progress-report+xml|ofinal-report+xml|ogroups+xml|oinvocation-descriptor+xml|ooptimized-progress-report+xml|lush|kscidm.messages+xml|kxcap-directory+xml|jds-email+xml|mfile+xml|nolder+xml|jloc-supl-init|is.cellular-cose-content+cbor|hnepager|otamp|rx|qt|rp|rx|ivif.metadata|hpenblox.game+xml|t-binary|keye.oeb|kofficeorg.extension|kprinttag|kstreetmap.data+xml|ktimestamps.ots|kvpi.dspx+json|kxmlformats-officedocument.custom-properties+xml|zcedocument.customxmlproperties+xml|zcedocument.drawing+xml|zcedocument.drawingml.chart+xml|zcedocument.drawingml.chartshapes+xml|zcedocument.drawingml.diagramcolors+xml|zcedocument.drawingml.diagramdata+xml|zcedocument.drawingml.diagramlayout+xml|zcedocument.drawingml.diagramstyle+xml|zcedocument.extended-properties+xml|zcedocument.presentationml.commentauthors+xml|zcedocument.presentationml.comments+xml|zcedocument.presentationml.handoutmaster+xml|zcedocument.presentationml.notesmaster+xml|zcedocument.presentationml.notesslide+xml|zcedocument.presentationml.presentation|zcedocument.presentationml.presentation.main+xml|zcedocument.presentationml.presprops+xml|zcedocument.presentationml.slide|zcedocument.presentationml.slide+xml|zcedocument.presentationml.slidelayout+xml|zcedocument.presentationml.slidemaster+xml|zcedocument.presentationml.slideshow|zcedocument.presentationml.slideshow.main+xml|zcedocument.presentationml.slideupdateinfo+xml|zcedocument.presentationml.tablestyles+xml|zcedocument.presentationml.tags+xml|zcedocument.presentationml.template|zcedocument.presentationml.template.main+xml|zcedocument.presentationml.viewprops+xml|zcedocument.spreadsheetml.calcchain+xml|zcedocument.spreadsheetml.chartsheet+xml|zcedocument.spreadsheetml.comments+xml|zcedocument.spreadsheetml.connections+xml|zcedocument.spreadsheetml.dialogsheet+xml|zcedocument.spreadsheetml.externallink+xml|zcedocument.spreadsheetml.pivotcachedefinition+xml|zcedocument.spreadsheetml.pivotcacherecords+xml|zcedocument.spreadsheetml.pivottable+xml|zcedocument.spreadsheetml.querytable+xml|zcedocument.spreadsheetml.revisionheaders+xml|zcedocument.spreadsheetml.revisionlog+xml|zcedocument.spreadsheetml.sharedstrings+xml|zcedocument.spreadsheetml.sheet|zcedocument.spreadsheetml.sheet.main+xml|zcedocument.spreadsheetml.sheetmetadata+xml|zcedocument.spreadsheetml.styles+xml|zcedocument.spreadsheetml.table+xml|zcedocument.spreadsheetml.tablesinglecells+xml|zcedocument.spreadsheetml.template|zcedocument.spreadsheetml.template.main+xml|zcedocument.spreadsheetml.usernames+xml|zcedocument.spreadsheetml.volatiledependencies+xml|zcedocument.spreadsheetml.worksheet+xml|zcedocument.theme+xml|zcedocument.themeoverride+xml|zcedocument.vmldrawing|zcedocument.wordprocessingml.comments+xml|zcedocument.wordprocessingml.document|zcedocument.wordprocessingml.document.glossary+xml|zcedocument.wordprocessingml.document.main+xml|zcedocument.wordprocessingml.endnotes+xml|zcedocument.wordprocessingml.fonttable+xml|zcedocument.wordprocessingml.footer+xml|zcedocument.wordprocessingml.footnotes+xml|zcedocument.wordprocessingml.numbering+xml|zcedocument.wordprocessingml.settings+xml|zcedocument.wordprocessingml.styles+xml|zcedocument.wordprocessingml.template|zcedocument.wordprocessingml.template.main+xml|zcedocument.wordprocessingml.websettings+xml|vpackage.core-properties+xml|zage.digital-signature-xmlsignature+xml|zage.relationships+xml|hracle.resource+json|jnge.indata|hsa.netdeploy|igeo.mapguide.package|ji.bundle|ldp|lsubsystem|htps.ct-kip+xml|hxli.countgraph|gpagerduty+json|ilm|k|k|inoply|ios.xml|itentdive|jientecommsdoc|iwaafile|hcos|hg.format|josasli|hiaccess.application-licence|icsel|hmi.widget|itiles|hoc.group-advertisement+xml|jketlearn|iwerbuilder6|t-s|s7|t-s|t5|u-s|hp.systemverify+xml|hreminet|jviewsystems.box|iocreate.brush|vset|qdream|jject-graph|jteus.magazine|hsfs|ht.mundusmundi|hublishare-delta-tree|hvi.ptid1|hwg-multiplexed|kxhtml-print+xml|hyon+json|gqualcomm.brew-app-res|jrantainenet|kk.quarkxpress|x|x|x|x|x|iobject-quoxdocument|gr74n.sandboxels+json|hadisys.moml+xml|psml+xml|s-audit+xml|y-conf+xml|zconn+xml|zdialog+xml|zstream+xml|tconf+xml|tdialog+xml|z-base+xml|z-fax-detect+xml|z-fax-sendrecv+xml|z-group+xml|z-speech+xml|z-transform+xml|iinstor.data|ipid|ir|healvnc.bed|icordare.musicxml|y+xml|ilpipe|inlearn.rlprint|isilient.logic|jtful+json|hig.cryptonote|im.cod|hn-realmedia|s-vbr|houte66.link66+xml|hs-274x|huckus.download|gs3sms|hailingtracker.track|ir|hbm.cid|kmid2|hcribus|healed.3df|ncsf|ndoc|neml|nmht|nnet|nppt|ntiff|nxls|mmedia.softseal.html|zl.pdf|iemail|iis+json|ima|jd|jf|hhade-save-file|jna.informed.formdata|ztemplate|vinterchange|vpackage|iootproof+json|jpkick+json|ip|ix|higrok.session|imtech-mindmapper|y|iren+json|jtx.vmv0|hketchometry|hmaf|jrt.notebook|mteacher|iintio.portals.archive|hnesdev-page-table|hoftware602.filler.form+xml|zform-xml-zip|ilent.sdkm+xml|v|hpotfire.dxp|psfs|hqlite3|n|hss-cod|kdtf|kntf|htardivision.calc|tdraw|timpress|tmath|twriter|z|z-global|iepmania.package|qstepchart|ireet-stream|hun.wadl+xml|kxml.calc|s.template|odraw|s.template|oimpress|v.template|omath|owriter|u.global|vtemplate|iperfile.super|is-calendar|s|hvd|hwiftview-ics|hybyl.mol2|icle+xml|ift+json|imbian.install|v|incml+xml|m.dm+wbxml|qxml|p.notification|pddf+wbxml|txml|ptnds+wbxml|uxml|os.notification|gtableschema+json|io.intent-module-archive|hcpdump.pcap|s|s|hhink-cell.ppttc+json|hmd.mediaflex.api+xml|il|iobile-livetv|hri.onesource|jd.tpt|jscape.mxs|iueapp|kdoc|gubisoft.webplayer|hfdl|k|hic.dosipas.v1|t2|kosdm+json|ktlb-fcb|iq.theme|hmajin|hnity|homl+xml|o|hplanet.alert|t-wbxml|obearer-choice|zce-wbxml|ocacheop|v-wbxml|phannel|v-wbxml|olist|s-wbxml|scmd|v-wbxml|osignal|hri-map|gvalve.source.material|hcx|hd-study|hectorworks|il+json|iraison.tsm-report+cbor|z+json|jifier-attestation+jwt|kmatrix.vcas|ktone.aion+json|jyant.thin|is.encrypted|hidsoft.vidconference|isio|l|l|l|l|l|lnary|ividence.scriptfile|hocalshaper.vsp4|hsf|huq|gwantverse|ip.sic|llc|kwbxml|lmlc|nscriptc|ismflow.wafl|hebturbo|hfa.dpp|kp2p|kwsc|hindows.devicepairing|hmap|ic|if.bootstrap|holfram.mathematica|z.package|oplayer|irdlift|kperfect|hqd|hrq-hp3000-labelled|ht.stf|hv.csp+wbxml|nxml|jssp+xml|gxacml+json|ira|jin.cpj|hcdn|hecrets-encrypted|hfdl|k.webform|hmi+xml|ipie.cpkg|mdpkg|mplan|npkg|mxlim|gyamaha.hv-dic|qscript|qvoice|nopenscoreformat|zmat.osfpvg+xml|nremote-setup|nsmaf-audio|sphrase|nthrough-ngn|ounnel-udpencap|ioweme|hellowriver-custom-menu|gzoho-presentation.show|hul|j|hzazz.deck+xml|doicexml+xml|eucher-cms+json|kjws+json|dp|e+cose|fjwt|fsd-jwt|dq-rtcpxr|cwasm|etcherinfo+xml|debpush-options+json|dhoispp-query|kresponse|didget|enhlp|eta|dordperfect5.1|dsdl+xml|epolicy+xml|cx-7z-compressed|eabiword|fce-compressed|fmf|fpple-diskimage|frj|futhorware-bin|s|s|s|pmap|pseg|ebcpio|fdoc|fittorrent|flender|gorb|j|fzip|i2|j|ecbr|h|h|h|h|fdlink|ffs-compressed|fhat|gess-pgn|grome-extension|focoa|gmpress|med|gnference|fpio|fsh|edeb|hian-package|s|fgc-compressed|firector|m|m|m|m|m|m|m|m|foom|ftbncx+xml|hook+xml|hresource+xml|fvi|eenvoy|fva|efont-bdf|jdos|jframemaker|jghostscript|jlibgrx|lnux-psf|jpcf|jsnf|kpeedo|kunos-news|jtype1|o|o|o|jvfont|freearc|futuresplash|egca-compressed|flulx|fnumeric|framps-xml|ftar|fzip|ehdf|fttpd-php|einstall-instructions|fpynb+json|fso9660-image|fwork-keynote-sffkey|knumbers-sffnumbers|kpages-sffpages|ejava-archive-diff|jjnlp-file|iscript|ekeepass2|elatex|fua-bytecode|fzh-compressed|s|emakeself|fie|fobipocket-ebook|u|fpegurl|fs-application|hshortcut|hwmd|jz|hxbap|gaccess|gbinder|gcardfile|hlip|gdos-program|iwnload|o|o|o|o|gmediaview|p|p|itafile|o|o|o|honey|gpublisher|gschedule|gterminal|gwrite|enetcdf|k|fs-proxy-autoconfig|fzb|eperl|i|filot|j|fkcs12|k|i7-certificates|w|oreqresp|gi-message|erar-compressed|fedhat-package-manager|gsearch-info-systems|esea|fh|gar|gockwave-flash|filverlight-app|fql|ftuffit|lx|fubrip|fv4cpio|irc|et3vm-image|fads|gr|fcl|h|fex|h-tfm|hinfo|l|fgif|eustar|evirtualbox-hdd|pova|rf|pvbox|t-extpack|qdi|qhd|qmdk|ewais-source|feb-app-manifest+json|fww-form-urlencoded|ex509-ca-cert|q|q|mra-cert|jnext-ca-cert|ffig|fliff+xml|fpinstall|fz|ezip-compressed|fmachine|m|m|m|m|m|m|m|d400-bp|dacml+xml|eml+xml|dcap-att+xml|hcaps+xml|hdiff+xml|hel+xml|irror+xml|hns+xml|eon-conference-info+xml|w-diff+xml|denc+xml|dfdf|dhtml+xml|l|h-voice+xml|dliff+xml|dml|f|f|f|f-dtd|gexternal-parsed-entity|gpatch+xml|epp+xml|dop+xml|dproc+xml|dslt+xml|k|epf+xml|dv+xml|i|i|i|cyaml|eng|g-data+cbor|mjson|mxml|hpatch+json|nxml|hsid+json|din+xml|czip|f+dotlottie|dlib|dstd|1udio/1d-interleaved-parityfec|632kadpcm|7gpp|a2|6aac|9|7c3|7dpcm|7mr|9-wb|c+|7ptx|7sc|7trac-advanced-lossless|cx|b3|6basic|b|7v16|832|6clearmode|7n|6dat12|7ls|7sr-es201108|e2050|f211|h2|7v|8i4|6eac3|7ncaprtp|7vrc|a-qcp|a0|a1|ab|b0|b1|anw|c0|c1|awb|c0|c1|8s|6flac|8exfec|7wdred|6g711-0|99|822|a1|93|96-16|b24|b32|b40|98|99|a1|ad|ae|7sm|9-efr|ahr-08|6ilbc|7p-mr_v2.5|7sac|6l16|720|84|78|7pc|6matroska|7elp|a1200|a2400|a600|7has|7idi|a|a|a|a-clip|7obile-xmf|7p3|84|9|9|9a-latm|8a|9-robust|8eg|a|a|a|a|a|a4-generic|7usepack|6ogg|9|9|9|7pus|6parityfec|7cma|a-wb|9u|a-wb|7rs.sid|6qcelp|6raptorfec|7ed|7tp-enc-aescm128|amidi|9loopback|8x|6s3m|7cip|7ilk|7mv|9-qcp|90|7ofa|8undfont|7p-midi|8eex|6t140c|738|7elephone-event|8tra_acelp|h_bb|7one|7svcis|6uemclip|7lpfec|7sac|6vdvi|7mr-wb|7nd.3gpp.iufp|a4sb|aaudiokoz|ablockfact.facta|acelp|bisco.nse|bmles.radio-events|bns.anp1|einf1|adece.audio|k|bigital-winds|blna.adts|bolby.heaac.1|m2|gmlp|hps|gpl2|jx|jz|hulse.1|bra|bts|d.hd|euhd|bvb.file|aeverad.plj|ahns.audio|alucent.voice|ams-playready.media.pya|anokia.mobile-xmf|crtel.vbk|buera.ecelp4800|l7470|l9600|aoctel.sbc|apresonus.multitrack|aqcelp|arhetorex.32kadpcm|bip|bn-realaudio|asealedmedia.softseal.mpeg|avmx.cvsd|awave|7orbis|c-config|6wav|9e|7ebm|6x-aac|9iff|c|c|8caf|8flac|8m4a|9atroska|9pegurl|9s-wax|cma|8pn-realaudio|k|k-plugin|8realaudio|8tta|8wav|7m|0chemical/x-cdx|cif|cmdf|dl|csml|bpdb|bxyz|0font/collection|5otf|5sfnt|5ttf|5woff|92|0image/aces|7png|7vci|9s|8if|6bmp|9|6cgm|6dicom-rle|7px|6emf|6fits|6g3fax|7if|6heic|a-sequence|9f|a-sequence|8j2k|6ief|6j2c|7aii|9s|7ls|7p2|9|8eg|a|a|8h|9c|8m|9|8x|9|7xl|8r|9a|9s|8s|9c|9i|9s|6ktx|92|6naplps|6pjpeg|7ng|7rs.btif|e|apti|7wg-raster|6sgi|7vg+xml|d|6t38|7iff|a|a-fx|6vnd.adobe.photoshop|birzip.accelerator.azv|ablockfact.facti|aclip|bns.inf2|adece.graphic|m|m|m|bjvu|e|bvb.subtitle|bwg|bxf|afastbidsheet|bpx|bst|bujixerox.edmics-mmr|rrlc|aglobalgraphics.pgb|amicrosoft.icon|cx|bozilla.apng|bs-dds|dmodi|dphoto|anet-fpx|apco.b16|aradiance|asealed.png|gmedia.softseal.gif|vjpg|bvf|atencent.tap|avalve.source.texture|awap.wbmp|axiff|azbrush.pcx|6webp|7mf|6x-3ds|8adobe-dng|8cmu-raster|ax|8emf|8freehand|g|g|g|g|8icon|8jng|8mrsid-image|9s-bmp|8pcx|9ict|c|9ortable-anymap|hbitmap|hgraymap|hpixmap|8rgb|8tga|8wmf|8xbitmap|9cf|9pixmap|9windowdump|0message/bhttp|8cpim|8delivery-status|9isposition-notification|8external-body|8feedback-report|8global|e-delivery-status|gisposition-notification|fheaders|8http|8imdn+xml|8mls|8news|8ohttp-req|gs|8partial|8rfc822|e|e|e|8s-http|9ip|bfrag|8tracking-status|8vnd.si.simp|cwfa.wsc|1odel/3mf|6e57|6gltf+json|a-binary|6iges|a|6jt|6mesh|a|a|7tl|6obj|6prc|6step|a|a|a|a|a+xml|bzip|a-xml+zip|8l|6u3d|6vnd.bary|acld|bollada+xml|adwf|aflatland.3dml|agdl|bs-gdl|c.gdl|btw|amoml+xml|bts|aopengex|aparasolid.transmit.binary|ttext|bytha.pyox|k|arosette.annotated-data-model|asap.vds|ausda|dz+zip|avalve.source.compiled-map|btu|7rml|a|6x3d+binary|g|afastinfoset|avrml|e|axml|d|9-vrml|1ultipart/alternative|bppledouble|abyteranges|adigest|aencrypted|aform-data|aheader-set|amixed|bultilingual|aparallel|arelated|cport|asigned|avnd.bint.med-plus|boice-message|ax-mixed-replace|0text/1d-interleaved-parityfec|5cache-manifest|j|7lendar|d|6md|6offeescript|h|6ql|8-expression|9identifier|6ss|7v|8-schema|5directory|6ns|5ecmascript|6ncaprtp|7riched|5fhirpath|6lexfec|6wdred|5gff3|6rammar-ref-list|5hl7v2|6tml|9|9|5jade|7vascript|f|6cr-cnd|6sx|5less|5markdown|d|7thml|6dx|6izar|5n3|5org|5parameters|8ityfec|6lain|a|a|a|a|a|a|a|6rovenance-notation|7s.fallenstein.rst|9lines.tag|9prop.logic|9texi|5raptorfec|6ed|6fc822-headers|6ichtext|6tf|7p-enc-aescm128|8loopback|7x|5sgml|9|6haclc|7ex|6lim|9|6pdx|6trings|7ylus|b|5t140|6ab-separated-values|6roff|a|a|a|a|a|6urtle|5ulpfec|6ri-list|d|d|5vcard|6nd.a|abc|ascii-art|9curl|d.dcurl|emcurl|escurl|9debian.copyright|amclientscript|avb.subtitle|9esmertec.theme-descriptor|axchangeable|9familysearch.gedcom|aiclab.flt|aly|ami.flexstor|9gml|araphviz|9hans|agl|9in3d.3dml|espot|aptc.newsml|fitf|9latex-z|9motorola.reflex|as-mediapackage|9net2phone.commcenter.command|9radisys.msml-basic-layout|9senx.warpscript|ai.uricatalogue|aosi|aun.j2me.app-descriptor|9trolltech.linguist|aypst|9vcf|9wap.si|el|dwml|gscript|9zoo.kcl|6tt|5wgsl|5x-asm|a|7c|8|8|8|8|8|8|8omponent|7fortran|e|e|e|7gwt-rpc|7handlebars-template|7java-source|8query-tmpl|7lua|7markdown|7nfo|7opml|8rg|7pascal|d|8hp|8rocessing|7sass|8css|8etext|8fv|8use-ymp|7uuencode|7vcalendar|ard|6ml|8-external-parsed-entity|5yaml|9|0video/1d-interleaved-parityfec|63gpp|a|a-tt|a2|6av1|6bmpeg|7t656|6celb|6dv|6encaprtp|7vc|6ffv1|7lexfec|6h261|93|a-1998|b2000|94|a-rcdo|bsvc|95|96|6iso.segment|6jpeg|a2000|e-scl|8m|9|7xsv|6lottie+json|6matroska|e-3d|7j2|9|7p1s|82p|9t|a|a|a|84|9|9|9v-es|8eg|a|a|a|a|a4-generic|8v|6nv|6ogg|6parityfec|7ointer|6quicktime|f|6raptorfec|8w|7tp-enc-aescm128|9loopback|8x|6scip|7mpte291|d2m|6ulpfec|6vc1|82|7nd.blockfact.factv|acctv|adece.hd|h|fmobile|l|gp4|fpd|h|fsd|h|fvideo|k|birectv.mpeg|m-tts|blna.mpeg-tts|bvb.file|afvt|ahns.video|aiptvforum.1dparityfec-1010|w2005|k2dparityfec-1010|w2005|kttsavc|nmpeg2|amotorola.video|op|bpegurl|h|bs-playready.media.pyv|anokia.interleaved-multimedia|gmp4vr|gvideovoip|aobjectvideo|aplanar|aradgamettools.bink|osmacker|asealed.mpeg1|l4|hswf|gmedia.softseal.mov|auvvu.mp4|i|avivo|ayoutube.yt|7p8|89|6webm|6x-f4v|9li|av|8m4v|9atroska|g|g|9ng|9s-asf|e|bvob|bwm|dv|dx|cvx|avideo|8sgi-movie|9mv|0x-conference/x-cooltalk|2shader/x-fragment|bvertex","sep":"|"}]}]);
const COLONY = [
{"id":"n-02497990","guard":[["has","type"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml","which MIME type goes with the extension xhtml":"application/xhtml+xml","what is the media type of a .gnumeric file":"application/x-gnumeric","which MIME type goes with the extension me":"text/troff","what is the media type of a .xlt file":"application/vnd.ms-excel","what is the media type of a .ez file":"application/andrew-inset","which MIME type goes with the extension gxf":"application/gxf","name the content type for .qam files":"application/vnd.epson.quickanime","what is the media type of a .oth file":"application/vnd.oasis.opendocument.text-web","what is the media type of a .texi file":"application/x-texinfo","name the content type for .frame files":"application/vnd.framemaker","name the content type for .ttc files":"font/collection","name the content type for .dataless files":"application/vnd.fdsn.seed","name the content type for .wpd files":"application/vnd.wordperfect","name the content type for .qxb files":"application/vnd.quark.quarkxpress","what is the media type of a .webmanifest file":"application/manifest+json","which MIME type goes with the extension es3":"application/vnd.eszigno3+xml","which MIME type goes with the extension glb":"model/gltf-binary","name the content type for .ustar files":"application/x-ustar","name the content type for .jad files":"text/vnd.sun.j2me.app-descriptor","which MIME type goes with the extension m4u":"video/vnd.mpegurl","which MIME type goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template","what is the media type of a .h file":"text/x-c","name the content type for .xpi files":"application/x-xpinstall","name the content type for .kml files":"application/vnd.google-earth.kml+xml","which MIME type goes with the extension stpnc":"model/step","which MIME type goes with the extension rsheet":"application/urc-ressheet+xml","name the content type for .prf files":"application/pics-rules","what is the media type of a .fvt file":"video/vnd.fvt","what is the media type of a .stw file":"application/vnd.sun.xml.writer.template","what is the media type of a .edx file":"application/vnd.novadigm.edx","what is the media type of a .mvt file":"application/vnd.mapbox-vector-tile","what is the media type of a .sbml file":"application/sbml+xml","name the content type for .hdf files":"application/x-hdf","what is the media type of a .stpxz file":"model/step-xml+zip","what is the media type of a .rusd file":"application/route-usd+xml","what is the media type of a .gif file":"image/gif","what is the media type of a .mpkg file":"application/vnd.apple.installer+xml","which MIME type goes with the extension uvv":"video/vnd.dece.video","which MIME type goes with the extension lostxml":"application/lost+xml","which MIME type goes with the extension au":"audio/basic","name the content type for .evy files":"application/x-envoy","name the content type for .txf files":"application/vnd.mobius.txf","which MIME type goes with the extension 3ds":"image/x-3ds","what is the media type of a .jais file":"image/jais","which MIME type goes with the extension wmx":"video/x-ms-wmx","which MIME type goes with the extension uvg":"image/vnd.dece.graphic","name the content type for .cjs files":"application/node","name the content type for .held files":"application/atsc-held+xml","name the content type for .less files":"text/less","name the content type for .u8mdn files":"message/global-disposition-notification","name the content type for .pas files":"text/x-pascal","what is the media type of a .xo file":"application/vnd.olpc-sugar","what is the media type of a .spx file":"audio/ogg","what is the media type of a .nsc file":"application/x-conference","which MIME type goes with the extension spl":"application/x-futuresplash","name the content type for .tpl files":"application/vnd.groove-tool-template","which MIME type goes with the extension ppt":"application/vnd.ms-powerpoint","which MIME type goes with the extension cdmid":"application/cdmi-domain","what is the media type of a .ova file":"application/x-virtualbox-ova","name the content type for .spdx files":"text/spdx","what is the media type of a .arj file":"application/x-arj","what is the media type of a .umj file":"application/vnd.umajin","name the content type for .vtx files":"application/vnd.visio","which MIME type goes with the extension oas":"application/vnd.fujitsu.oasys","what is the media type of a .rdz file":"application/vnd.data-vision.rdz","name the content type for .dot files":"application/msword","name the content type for .tsd files":"application/timestamped-data","which MIME type goes with the extension m4b":"audio/mp4","which MIME type goes with the extension amlx":"application/automationml-amlx+zip","what is the media type of a .yaml file":"text/yaml","what is the media type of a .sieve file":"application/sieve","which MIME type goes with the extension exr":"image/aces","name the content type for .fhc files":"image/x-freehand","which MIME type goes with the extension n3":"text/n3","name the content type for .vcard files":"text/vcard","which MIME type goes with the extension p":"text/x-pascal","which MIME type goes with the extension sfv":"text/x-sfv","which MIME type goes with the extension vec":"application/vec+xml","which MIME type goes with the extension sdc":"application/vnd.stardivision.calc","name the content type for .mmf files":"application/vnd.smaf","which MIME type goes with the extension dvb":"video/vnd.dvb.file","name the content type for .spf files":"application/vnd.yamaha.smaf-phrase","name the content type for .c4p files":"application/vnd.clonk.c4group","what is the media type of a .rq file":"application/sparql-query","name the content type for .ice files":"x-conference/x-cooltalk","which MIME type goes with the extension h261":"video/h261","name the content type for .hdd files":"application/x-virtualbox-hdd","which MIME type goes with the extension gph":"application/vnd.flographit","what is the media type of a .text file":"text/plain","what is the media type of a .pic file":"image/x-pict","what is the media type of a .gbr file":"application/rpki-ghostbusters","what is the media type of a .wmlc file":"application/vnd.wap.wmlc","what is the media type of a .mxs file":"application/vnd.triscape.mxs","which MIME type goes with the extension clkt":"application/vnd.crick.clicker.template","which MIME type goes with the extension wbxml":"application/vnd.wap.wbxml","which MIME type goes with the extension onetoc":"application/onenote","name the content type for .xls files":"application/vnd.ms-excel","what is the media type of a .x3dbz file":"model/x3d+binary","what is the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-3bfb5f21","guard":[["has","type"],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml","which MIME type goes with the extension xhtml":"application/xhtml+xml","what is the media type of a .gnumeric file":"application/x-gnumeric","which MIME type goes with the extension me":"text/troff","what is the media type of a .xlt file":"application/vnd.ms-excel","what is the media type of a .ez file":"application/andrew-inset","which MIME type goes with the extension gxf":"application/gxf","name the content type for .qam files":"application/vnd.epson.quickanime","what is the media type of a .oth file":"application/vnd.oasis.opendocument.text-web","what is the media type of a .texi file":"application/x-texinfo","name the content type for .frame files":"application/vnd.framemaker","name the content type for .ttc files":"font/collection","name the content type for .dataless files":"application/vnd.fdsn.seed","name the content type for .wpd files":"application/vnd.wordperfect","name the content type for .qxb files":"application/vnd.quark.quarkxpress","what is the media type of a .webmanifest file":"application/manifest+json","which MIME type goes with the extension es3":"application/vnd.eszigno3+xml","which MIME type goes with the extension glb":"model/gltf-binary","name the content type for .ustar files":"application/x-ustar","name the content type for .jad files":"text/vnd.sun.j2me.app-descriptor","which MIME type goes with the extension m4u":"video/vnd.mpegurl","which MIME type goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template","what is the media type of a .h file":"text/x-c","name the content type for .xpi files":"application/x-xpinstall","name the content type for .kml files":"application/vnd.google-earth.kml+xml","which MIME type goes with the extension stpnc":"model/step","which MIME type goes with the extension rsheet":"application/urc-ressheet+xml","name the content type for .prf files":"application/pics-rules","what is the media type of a .fvt file":"video/vnd.fvt","what is the media type of a .stw file":"application/vnd.sun.xml.writer.template","what is the media type of a .edx file":"application/vnd.novadigm.edx","what is the media type of a .mvt file":"application/vnd.mapbox-vector-tile","what is the media type of a .sbml file":"application/sbml+xml","name the content type for .hdf files":"application/x-hdf","what is the media type of a .stpxz file":"model/step-xml+zip","what is the media type of a .rusd file":"application/route-usd+xml","what is the media type of a .gif file":"image/gif","what is the media type of a .mpkg file":"application/vnd.apple.installer+xml","which MIME type goes with the extension uvv":"video/vnd.dece.video","which MIME type goes with the extension lostxml":"application/lost+xml","which MIME type goes with the extension au":"audio/basic","name the content type for .evy files":"application/x-envoy","name the content type for .txf files":"application/vnd.mobius.txf","which MIME type goes with the extension 3ds":"image/x-3ds","what is the media type of a .jais file":"image/jais","which MIME type goes with the extension wmx":"video/x-ms-wmx","which MIME type goes with the extension uvg":"image/vnd.dece.graphic","name the content type for .cjs files":"application/node","name the content type for .held files":"application/atsc-held+xml","name the content type for .less files":"text/less","name the content type for .u8mdn files":"message/global-disposition-notification","name the content type for .pas files":"text/x-pascal","what is the media type of a .xo file":"application/vnd.olpc-sugar","what is the media type of a .spx file":"audio/ogg","what is the media type of a .nsc file":"application/x-conference","which MIME type goes with the extension spl":"application/x-futuresplash","name the content type for .tpl files":"application/vnd.groove-tool-template","which MIME type goes with the extension ppt":"application/vnd.ms-powerpoint","which MIME type goes with the extension cdmid":"application/cdmi-domain","what is the media type of a .ova file":"application/x-virtualbox-ova","name the content type for .spdx files":"text/spdx","what is the media type of a .arj file":"application/x-arj","what is the media type of a .umj file":"application/vnd.umajin","name the content type for .vtx files":"application/vnd.visio","which MIME type goes with the extension oas":"application/vnd.fujitsu.oasys","what is the media type of a .rdz file":"application/vnd.data-vision.rdz","name the content type for .dot files":"application/msword","name the content type for .tsd files":"application/timestamped-data","which MIME type goes with the extension m4b":"audio/mp4","which MIME type goes with the extension amlx":"application/automationml-amlx+zip","what is the media type of a .yaml file":"text/yaml","what is the media type of a .sieve file":"application/sieve","which MIME type goes with the extension exr":"image/aces","name the content type for .fhc files":"image/x-freehand","which MIME type goes with the extension n3":"text/n3","name the content type for .vcard files":"text/vcard","which MIME type goes with the extension p":"text/x-pascal","which MIME type goes with the extension sfv":"text/x-sfv","which MIME type goes with the extension vec":"application/vec+xml","which MIME type goes with the extension sdc":"application/vnd.stardivision.calc","name the content type for .mmf files":"application/vnd.smaf","which MIME type goes with the extension dvb":"video/vnd.dvb.file","name the content type for .spf files":"application/vnd.yamaha.smaf-phrase","name the content type for .c4p files":"application/vnd.clonk.c4group","what is the media type of a .rq file":"application/sparql-query","name the content type for .ice files":"x-conference/x-cooltalk","which MIME type goes with the extension h261":"video/h261","name the content type for .hdd files":"application/x-virtualbox-hdd","which MIME type goes with the extension gph":"application/vnd.flographit","what is the media type of a .text file":"text/plain","what is the media type of a .pic file":"image/x-pict","what is the media type of a .gbr file":"application/rpki-ghostbusters","what is the media type of a .wmlc file":"application/vnd.wap.wmlc","what is the media type of a .mxs file":"application/vnd.triscape.mxs","which MIME type goes with the extension clkt":"application/vnd.crick.clicker.template","which MIME type goes with the extension wbxml":"application/vnd.wap.wbxml","which MIME type goes with the extension onetoc":"application/onenote","name the content type for .xls files":"application/vnd.ms-excel","what is the media type of a .x3dbz file":"model/x3d+binary","what is the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-a66a2121","guard":[["has","type"],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml","which MIME type goes with the extension xhtml":"application/xhtml+xml","what is the media type of a .gnumeric file":"application/x-gnumeric","which MIME type goes with the extension me":"text/troff","what is the media type of a .xlt file":"application/vnd.ms-excel","what is the media type of a .ez file":"application/andrew-inset","which MIME type goes with the extension gxf":"application/gxf","name the content type for .qam files":"application/vnd.epson.quickanime","what is the media type of a .oth file":"application/vnd.oasis.opendocument.text-web","what is the media type of a .texi file":"application/x-texinfo","name the content type for .frame files":"application/vnd.framemaker","name the content type for .ttc files":"font/collection","name the content type for .dataless files":"application/vnd.fdsn.seed","name the content type for .wpd files":"application/vnd.wordperfect","name the content type for .qxb files":"application/vnd.quark.quarkxpress","what is the media type of a .webmanifest file":"application/manifest+json","which MIME type goes with the extension es3":"application/vnd.eszigno3+xml","which MIME type goes with the extension glb":"model/gltf-binary","name the content type for .ustar files":"application/x-ustar","name the content type for .jad files":"text/vnd.sun.j2me.app-descriptor","which MIME type goes with the extension m4u":"video/vnd.mpegurl","which MIME type goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template","what is the media type of a .h file":"text/x-c","name the content type for .xpi files":"application/x-xpinstall","name the content type for .kml files":"application/vnd.google-earth.kml+xml","which MIME type goes with the extension stpnc":"model/step","which MIME type goes with the extension rsheet":"application/urc-ressheet+xml","name the content type for .prf files":"application/pics-rules","what is the media type of a .fvt file":"video/vnd.fvt","what is the media type of a .stw file":"application/vnd.sun.xml.writer.template","what is the media type of a .edx file":"application/vnd.novadigm.edx","what is the media type of a .mvt file":"application/vnd.mapbox-vector-tile","what is the media type of a .sbml file":"application/sbml+xml","name the content type for .hdf files":"application/x-hdf","what is the media type of a .stpxz file":"model/step-xml+zip","what is the media type of a .rusd file":"application/route-usd+xml","what is the media type of a .gif file":"image/gif","what is the media type of a .mpkg file":"application/vnd.apple.installer+xml","which MIME type goes with the extension uvv":"video/vnd.dece.video","which MIME type goes with the extension lostxml":"application/lost+xml","which MIME type goes with the extension au":"audio/basic","name the content type for .evy files":"application/x-envoy","name the content type for .txf files":"application/vnd.mobius.txf","which MIME type goes with the extension 3ds":"image/x-3ds","what is the media type of a .jais file":"image/jais","which MIME type goes with the extension wmx":"video/x-ms-wmx","which MIME type goes with the extension uvg":"image/vnd.dece.graphic","name the content type for .cjs files":"application/node","name the content type for .held files":"application/atsc-held+xml","name the content type for .less files":"text/less","name the content type for .u8mdn files":"message/global-disposition-notification","name the content type for .pas files":"text/x-pascal","what is the media type of a .xo file":"application/vnd.olpc-sugar","what is the media type of a .spx file":"audio/ogg","what is the media type of a .nsc file":"application/x-conference","which MIME type goes with the extension spl":"application/x-futuresplash","name the content type for .tpl files":"application/vnd.groove-tool-template","which MIME type goes with the extension ppt":"application/vnd.ms-powerpoint","which MIME type goes with the extension cdmid":"application/cdmi-domain","what is the media type of a .ova file":"application/x-virtualbox-ova","name the content type for .spdx files":"text/spdx","what is the media type of a .arj file":"application/x-arj","what is the media type of a .umj file":"application/vnd.umajin","name the content type for .vtx files":"application/vnd.visio","which MIME type goes with the extension oas":"application/vnd.fujitsu.oasys","what is the media type of a .rdz file":"application/vnd.data-vision.rdz","name the content type for .dot files":"application/msword","name the content type for .tsd files":"application/timestamped-data","which MIME type goes with the extension m4b":"audio/mp4","which MIME type goes with the extension amlx":"application/automationml-amlx+zip","what is the media type of a .yaml file":"text/yaml","what is the media type of a .sieve file":"application/sieve","which MIME type goes with the extension exr":"image/aces","name the content type for .fhc files":"image/x-freehand","which MIME type goes with the extension n3":"text/n3","name the content type for .vcard files":"text/vcard","which MIME type goes with the extension p":"text/x-pascal","which MIME type goes with the extension sfv":"text/x-sfv","which MIME type goes with the extension vec":"application/vec+xml","which MIME type goes with the extension sdc":"application/vnd.stardivision.calc","name the content type for .mmf files":"application/vnd.smaf","which MIME type goes with the extension dvb":"video/vnd.dvb.file","name the content type for .spf files":"application/vnd.yamaha.smaf-phrase","name the content type for .c4p files":"application/vnd.clonk.c4group","what is the media type of a .rq file":"application/sparql-query","name the content type for .ice files":"x-conference/x-cooltalk","which MIME type goes with the extension h261":"video/h261","name the content type for .hdd files":"application/x-virtualbox-hdd","which MIME type goes with the extension gph":"application/vnd.flographit","what is the media type of a .text file":"text/plain","what is the media type of a .pic file":"image/x-pict","what is the media type of a .gbr file":"application/rpki-ghostbusters","what is the media type of a .wmlc file":"application/vnd.wap.wmlc","what is the media type of a .mxs file":"application/vnd.triscape.mxs","which MIME type goes with the extension clkt":"application/vnd.crick.clicker.template","which MIME type goes with the extension wbxml":"application/vnd.wap.wbxml","which MIME type goes with the extension onetoc":"application/onenote","name the content type for .xls files":"application/vnd.ms-excel","what is the media type of a .x3dbz file":"model/x3d+binary","what is the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-d9b256b5","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml","which MIME type goes with the extension xhtml":"application/xhtml+xml","what is the media type of a .gnumeric file":"application/x-gnumeric","which MIME type goes with the extension me":"text/troff","what is the media type of a .xlt file":"application/vnd.ms-excel","what is the media type of a .ez file":"application/andrew-inset","which MIME type goes with the extension gxf":"application/gxf","name the content type for .qam files":"application/vnd.epson.quickanime","what is the media type of a .oth file":"application/vnd.oasis.opendocument.text-web","what is the media type of a .texi file":"application/x-texinfo","name the content type for .frame files":"application/vnd.framemaker","name the content type for .ttc files":"font/collection","name the content type for .dataless files":"application/vnd.fdsn.seed","name the content type for .wpd files":"application/vnd.wordperfect","name the content type for .qxb files":"application/vnd.quark.quarkxpress","what is the media type of a .webmanifest file":"application/manifest+json","which MIME type goes with the extension es3":"application/vnd.eszigno3+xml","which MIME type goes with the extension glb":"model/gltf-binary","name the content type for .ustar files":"application/x-ustar","name the content type for .jad files":"text/vnd.sun.j2me.app-descriptor","which MIME type goes with the extension m4u":"video/vnd.mpegurl","which MIME type goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template","what is the media type of a .h file":"text/x-c","name the content type for .xpi files":"application/x-xpinstall","name the content type for .kml files":"application/vnd.google-earth.kml+xml","which MIME type goes with the extension stpnc":"model/step","which MIME type goes with the extension rsheet":"application/urc-ressheet+xml","name the content type for .prf files":"application/pics-rules","what is the media type of a .fvt file":"video/vnd.fvt","what is the media type of a .stw file":"application/vnd.sun.xml.writer.template","what is the media type of a .edx file":"application/vnd.novadigm.edx","what is the media type of a .mvt file":"application/vnd.mapbox-vector-tile","what is the media type of a .sbml file":"application/sbml+xml","name the content type for .hdf files":"application/x-hdf","what is the media type of a .stpxz file":"model/step-xml+zip","what is the media type of a .rusd file":"application/route-usd+xml","what is the media type of a .gif file":"image/gif","what is the media type of a .mpkg file":"application/vnd.apple.installer+xml","which MIME type goes with the extension uvv":"video/vnd.dece.video","which MIME type goes with the extension lostxml":"application/lost+xml","which MIME type goes with the extension au":"audio/basic","name the content type for .evy files":"application/x-envoy","name the content type for .txf files":"application/vnd.mobius.txf","which MIME type goes with the extension 3ds":"image/x-3ds","what is the media type of a .jais file":"image/jais","which MIME type goes with the extension wmx":"video/x-ms-wmx","which MIME type goes with the extension uvg":"image/vnd.dece.graphic","name the content type for .cjs files":"application/node","name the content type for .held files":"application/atsc-held+xml","name the content type for .less files":"text/less","name the content type for .u8mdn files":"message/global-disposition-notification","name the content type for .pas files":"text/x-pascal","what is the media type of a .xo file":"application/vnd.olpc-sugar","what is the media type of a .spx file":"audio/ogg","what is the media type of a .nsc file":"application/x-conference","which MIME type goes with the extension spl":"application/x-futuresplash","name the content type for .tpl files":"application/vnd.groove-tool-template","which MIME type goes with the extension ppt":"application/vnd.ms-powerpoint","which MIME type goes with the extension cdmid":"application/cdmi-domain","what is the media type of a .ova file":"application/x-virtualbox-ova","name the content type for .spdx files":"text/spdx","what is the media type of a .arj file":"application/x-arj","what is the media type of a .umj file":"application/vnd.umajin","name the content type for .vtx files":"application/vnd.visio","which MIME type goes with the extension oas":"application/vnd.fujitsu.oasys","what is the media type of a .rdz file":"application/vnd.data-vision.rdz","name the content type for .dot files":"application/msword","name the content type for .tsd files":"application/timestamped-data","which MIME type goes with the extension m4b":"audio/mp4","which MIME type goes with the extension amlx":"application/automationml-amlx+zip","what is the media type of a .yaml file":"text/yaml","what is the media type of a .sieve file":"application/sieve","which MIME type goes with the extension exr":"image/aces","name the content type for .fhc files":"image/x-freehand","which MIME type goes with the extension n3":"text/n3","name the content type for .vcard files":"text/vcard","which MIME type goes with the extension p":"text/x-pascal","which MIME type goes with the extension sfv":"text/x-sfv","which MIME type goes with the extension vec":"application/vec+xml","which MIME type goes with the extension sdc":"application/vnd.stardivision.calc","name the content type for .mmf files":"application/vnd.smaf","which MIME type goes with the extension dvb":"video/vnd.dvb.file","name the content type for .spf files":"application/vnd.yamaha.smaf-phrase","name the content type for .c4p files":"application/vnd.clonk.c4group","what is the media type of a .rq file":"application/sparql-query","name the content type for .ice files":"x-conference/x-cooltalk","which MIME type goes with the extension h261":"video/h261","name the content type for .hdd files":"application/x-virtualbox-hdd","which MIME type goes with the extension gph":"application/vnd.flographit","what is the media type of a .text file":"text/plain","what is the media type of a .pic file":"image/x-pict","what is the media type of a .gbr file":"application/rpki-ghostbusters","what is the media type of a .wmlc file":"application/vnd.wap.wmlc","what is the media type of a .mxs file":"application/vnd.triscape.mxs","which MIME type goes with the extension clkt":"application/vnd.crick.clicker.template","which MIME type goes with the extension wbxml":"application/vnd.wap.wbxml","which MIME type goes with the extension onetoc":"application/onenote","name the content type for .xls files":"application/vnd.ms-excel","what is the media type of a .x3dbz file":"model/x3d+binary","what is the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-11494244","guard":[["has","type"],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"type"}]]],"mem":{"table":{"for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml","goes with the extension xhtml":"application/xhtml+xml","of a .gnumeric file":"application/x-gnumeric","goes with the extension me":"text/troff","of a .xlt file":"application/vnd.ms-excel","of a .ez file":"application/andrew-inset","goes with the extension gxf":"application/gxf","for .qam files":"application/vnd.epson.quickanime","of a .oth file":"application/vnd.oasis.opendocument.text-web","of a .texi file":"application/x-texinfo","for .frame files":"application/vnd.framemaker","for .ttc files":"font/collection","for .dataless files":"application/vnd.fdsn.seed","for .wpd files":"application/vnd.wordperfect","for .qxb files":"application/vnd.quark.quarkxpress","of a .webmanifest file":"application/manifest+json","goes with the extension es3":"application/vnd.eszigno3+xml","goes with the extension glb":"model/gltf-binary","for .ustar files":"application/x-ustar","for .jad files":"text/vnd.sun.j2me.app-descriptor","goes with the extension m4u":"video/vnd.mpegurl","goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template","of a .h file":"text/x-c","for .xpi files":"application/x-xpinstall","for .kml files":"application/vnd.google-earth.kml+xml","goes with the extension stpnc":"model/step","goes with the extension rsheet":"application/urc-ressheet+xml","for .prf files":"application/pics-rules","of a .fvt file":"video/vnd.fvt","of a .stw file":"application/vnd.sun.xml.writer.template","of a .edx file":"application/vnd.novadigm.edx","of a .mvt file":"application/vnd.mapbox-vector-tile","of a .sbml file":"application/sbml+xml","for .hdf files":"application/x-hdf","of a .stpxz file":"model/step-xml+zip","of a .rusd file":"application/route-usd+xml","of a .gif file":"image/gif","of a .mpkg file":"application/vnd.apple.installer+xml","goes with the extension uvv":"video/vnd.dece.video","goes with the extension lostxml":"application/lost+xml","goes with the extension au":"audio/basic","for .evy files":"application/x-envoy","for .txf files":"application/vnd.mobius.txf","goes with the extension 3ds":"image/x-3ds","of a .jais file":"image/jais","goes with the extension wmx":"video/x-ms-wmx","goes with the extension uvg":"image/vnd.dece.graphic","for .cjs files":"application/node","for .held files":"application/atsc-held+xml","for .less files":"text/less","for .u8mdn files":"message/global-disposition-notification","for .pas files":"text/x-pascal","of a .xo file":"application/vnd.olpc-sugar","of a .spx file":"audio/ogg","of a .nsc file":"application/x-conference","goes with the extension spl":"application/x-futuresplash","for .tpl files":"application/vnd.groove-tool-template","goes with the extension ppt":"application/vnd.ms-powerpoint","goes with the extension cdmid":"application/cdmi-domain","of a .ova file":"application/x-virtualbox-ova","for .spdx files":"text/spdx","of a .arj file":"application/x-arj","of a .umj file":"application/vnd.umajin","for .vtx files":"application/vnd.visio","goes with the extension oas":"application/vnd.fujitsu.oasys","of a .rdz file":"application/vnd.data-vision.rdz","for .dot files":"application/msword","for .tsd files":"application/timestamped-data","goes with the extension m4b":"audio/mp4","goes with the extension amlx":"application/automationml-amlx+zip","of a .yaml file":"text/yaml","of a .sieve file":"application/sieve","goes with the extension exr":"image/aces","for .fhc files":"image/x-freehand","goes with the extension n3":"text/n3","for .vcard files":"text/vcard","goes with the extension p":"text/x-pascal","goes with the extension sfv":"text/x-sfv","goes with the extension vec":"application/vec+xml","goes with the extension sdc":"application/vnd.stardivision.calc","for .mmf files":"application/vnd.smaf","goes with the extension dvb":"video/vnd.dvb.file","for .spf files":"application/vnd.yamaha.smaf-phrase","for .c4p files":"application/vnd.clonk.c4group","of a .rq file":"application/sparql-query","for .ice files":"x-conference/x-cooltalk","goes with the extension h261":"video/h261","for .hdd files":"application/x-virtualbox-hdd","goes with the extension gph":"application/vnd.flographit","of a .text file":"text/plain","of a .pic file":"image/x-pict","of a .gbr file":"application/rpki-ghostbusters","of a .wmlc file":"application/vnd.wap.wmlc","of a .mxs file":"application/vnd.triscape.mxs","goes with the extension clkt":"application/vnd.crick.clicker.template","goes with the extension wbxml":"application/vnd.wap.wbxml","goes with the extension onetoc":"application/onenote","for .xls files":"application/vnd.ms-excel","of a .x3dbz file":"model/x3d+binary","of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-135bf5d3","guard":[["has","type"],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"type"}]]],"mem":{"table":{"for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml","goes with the extension xhtml":"application/xhtml+xml","of a .gnumeric file":"application/x-gnumeric","goes with the extension me":"text/troff","of a .xlt file":"application/vnd.ms-excel","of a .ez file":"application/andrew-inset","goes with the extension gxf":"application/gxf","for .qam files":"application/vnd.epson.quickanime","of a .oth file":"application/vnd.oasis.opendocument.text-web","of a .texi file":"application/x-texinfo","for .frame files":"application/vnd.framemaker","for .ttc files":"font/collection","for .dataless files":"application/vnd.fdsn.seed","for .wpd files":"application/vnd.wordperfect","for .qxb files":"application/vnd.quark.quarkxpress","of a .webmanifest file":"application/manifest+json","goes with the extension es3":"application/vnd.eszigno3+xml","goes with the extension glb":"model/gltf-binary","for .ustar files":"application/x-ustar","for .jad files":"text/vnd.sun.j2me.app-descriptor","goes with the extension m4u":"video/vnd.mpegurl","goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template","of a .h file":"text/x-c","for .xpi files":"application/x-xpinstall","for .kml files":"application/vnd.google-earth.kml+xml","goes with the extension stpnc":"model/step","goes with the extension rsheet":"application/urc-ressheet+xml","for .prf files":"application/pics-rules","of a .fvt file":"video/vnd.fvt","of a .stw file":"application/vnd.sun.xml.writer.template","of a .edx file":"application/vnd.novadigm.edx","of a .mvt file":"application/vnd.mapbox-vector-tile","of a .sbml file":"application/sbml+xml","for .hdf files":"application/x-hdf","of a .stpxz file":"model/step-xml+zip","of a .rusd file":"application/route-usd+xml","of a .gif file":"image/gif","of a .mpkg file":"application/vnd.apple.installer+xml","goes with the extension uvv":"video/vnd.dece.video","goes with the extension lostxml":"application/lost+xml","goes with the extension au":"audio/basic","for .evy files":"application/x-envoy","for .txf files":"application/vnd.mobius.txf","goes with the extension 3ds":"image/x-3ds","of a .jais file":"image/jais","goes with the extension wmx":"video/x-ms-wmx","goes with the extension uvg":"image/vnd.dece.graphic","for .cjs files":"application/node","for .held files":"application/atsc-held+xml","for .less files":"text/less","for .u8mdn files":"message/global-disposition-notification","for .pas files":"text/x-pascal","of a .xo file":"application/vnd.olpc-sugar","of a .spx file":"audio/ogg","of a .nsc file":"application/x-conference","goes with the extension spl":"application/x-futuresplash","for .tpl files":"application/vnd.groove-tool-template","goes with the extension ppt":"application/vnd.ms-powerpoint","goes with the extension cdmid":"application/cdmi-domain","of a .ova file":"application/x-virtualbox-ova","for .spdx files":"text/spdx","of a .arj file":"application/x-arj","of a .umj file":"application/vnd.umajin","for .vtx files":"application/vnd.visio","goes with the extension oas":"application/vnd.fujitsu.oasys","of a .rdz file":"application/vnd.data-vision.rdz","for .dot files":"application/msword","for .tsd files":"application/timestamped-data","goes with the extension m4b":"audio/mp4","goes with the extension amlx":"application/automationml-amlx+zip","of a .yaml file":"text/yaml","of a .sieve file":"application/sieve","goes with the extension exr":"image/aces","for .fhc files":"image/x-freehand","goes with the extension n3":"text/n3","for .vcard files":"text/vcard","goes with the extension p":"text/x-pascal","goes with the extension sfv":"text/x-sfv","goes with the extension vec":"application/vec+xml","goes with the extension sdc":"application/vnd.stardivision.calc","for .mmf files":"application/vnd.smaf","goes with the extension dvb":"video/vnd.dvb.file","for .spf files":"application/vnd.yamaha.smaf-phrase","for .c4p files":"application/vnd.clonk.c4group","of a .rq file":"application/sparql-query","for .ice files":"x-conference/x-cooltalk","goes with the extension h261":"video/h261","for .hdd files":"application/x-virtualbox-hdd","goes with the extension gph":"application/vnd.flographit","of a .text file":"text/plain","of a .pic file":"image/x-pict","of a .gbr file":"application/rpki-ghostbusters","of a .wmlc file":"application/vnd.wap.wmlc","of a .mxs file":"application/vnd.triscape.mxs","goes with the extension clkt":"application/vnd.crick.clicker.template","goes with the extension wbxml":"application/vnd.wap.wbxml","goes with the extension onetoc":"application/onenote","for .xls files":"application/vnd.ms-excel","of a .x3dbz file":"model/x3d+binary","of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-3fe6c5cf","guard":[["has","type"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"type"}]]],"mem":{"table":{"for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml","goes with the extension xhtml":"application/xhtml+xml","of a .gnumeric file":"application/x-gnumeric","goes with the extension me":"text/troff","of a .xlt file":"application/vnd.ms-excel","of a .ez file":"application/andrew-inset","goes with the extension gxf":"application/gxf","for .qam files":"application/vnd.epson.quickanime","of a .oth file":"application/vnd.oasis.opendocument.text-web","of a .texi file":"application/x-texinfo","for .frame files":"application/vnd.framemaker","for .ttc files":"font/collection","for .dataless files":"application/vnd.fdsn.seed","for .wpd files":"application/vnd.wordperfect","for .qxb files":"application/vnd.quark.quarkxpress","of a .webmanifest file":"application/manifest+json","goes with the extension es3":"application/vnd.eszigno3+xml","goes with the extension glb":"model/gltf-binary","for .ustar files":"application/x-ustar","for .jad files":"text/vnd.sun.j2me.app-descriptor","goes with the extension m4u":"video/vnd.mpegurl","goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template","of a .h file":"text/x-c","for .xpi files":"application/x-xpinstall","for .kml files":"application/vnd.google-earth.kml+xml","goes with the extension stpnc":"model/step","goes with the extension rsheet":"application/urc-ressheet+xml","for .prf files":"application/pics-rules","of a .fvt file":"video/vnd.fvt","of a .stw file":"application/vnd.sun.xml.writer.template","of a .edx file":"application/vnd.novadigm.edx","of a .mvt file":"application/vnd.mapbox-vector-tile","of a .sbml file":"application/sbml+xml","for .hdf files":"application/x-hdf","of a .stpxz file":"model/step-xml+zip","of a .rusd file":"application/route-usd+xml","of a .gif file":"image/gif","of a .mpkg file":"application/vnd.apple.installer+xml","goes with the extension uvv":"video/vnd.dece.video","goes with the extension lostxml":"application/lost+xml","goes with the extension au":"audio/basic","for .evy files":"application/x-envoy","for .txf files":"application/vnd.mobius.txf","goes with the extension 3ds":"image/x-3ds","of a .jais file":"image/jais","goes with the extension wmx":"video/x-ms-wmx","goes with the extension uvg":"image/vnd.dece.graphic","for .cjs files":"application/node","for .held files":"application/atsc-held+xml","for .less files":"text/less","for .u8mdn files":"message/global-disposition-notification","for .pas files":"text/x-pascal","of a .xo file":"application/vnd.olpc-sugar","of a .spx file":"audio/ogg","of a .nsc file":"application/x-conference","goes with the extension spl":"application/x-futuresplash","for .tpl files":"application/vnd.groove-tool-template","goes with the extension ppt":"application/vnd.ms-powerpoint","goes with the extension cdmid":"application/cdmi-domain","of a .ova file":"application/x-virtualbox-ova","for .spdx files":"text/spdx","of a .arj file":"application/x-arj","of a .umj file":"application/vnd.umajin","for .vtx files":"application/vnd.visio","goes with the extension oas":"application/vnd.fujitsu.oasys","of a .rdz file":"application/vnd.data-vision.rdz","for .dot files":"application/msword","for .tsd files":"application/timestamped-data","goes with the extension m4b":"audio/mp4","goes with the extension amlx":"application/automationml-amlx+zip","of a .yaml file":"text/yaml","of a .sieve file":"application/sieve","goes with the extension exr":"image/aces","for .fhc files":"image/x-freehand","goes with the extension n3":"text/n3","for .vcard files":"text/vcard","goes with the extension p":"text/x-pascal","goes with the extension sfv":"text/x-sfv","goes with the extension vec":"application/vec+xml","goes with the extension sdc":"application/vnd.stardivision.calc","for .mmf files":"application/vnd.smaf","goes with the extension dvb":"video/vnd.dvb.file","for .spf files":"application/vnd.yamaha.smaf-phrase","for .c4p files":"application/vnd.clonk.c4group","of a .rq file":"application/sparql-query","for .ice files":"x-conference/x-cooltalk","goes with the extension h261":"video/h261","for .hdd files":"application/x-virtualbox-hdd","goes with the extension gph":"application/vnd.flographit","of a .text file":"text/plain","of a .pic file":"image/x-pict","of a .gbr file":"application/rpki-ghostbusters","of a .wmlc file":"application/vnd.wap.wmlc","of a .mxs file":"application/vnd.triscape.mxs","goes with the extension clkt":"application/vnd.crick.clicker.template","goes with the extension wbxml":"application/vnd.wap.wbxml","goes with the extension onetoc":"application/onenote","for .xls files":"application/vnd.ms-excel","of a .x3dbz file":"model/x3d+binary","of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-ae7fe5c0","guard":[],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"type"}]]],"mem":{"table":{"for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml","goes with the extension xhtml":"application/xhtml+xml","of a .gnumeric file":"application/x-gnumeric","goes with the extension me":"text/troff","of a .xlt file":"application/vnd.ms-excel","of a .ez file":"application/andrew-inset","goes with the extension gxf":"application/gxf","for .qam files":"application/vnd.epson.quickanime","of a .oth file":"application/vnd.oasis.opendocument.text-web","of a .texi file":"application/x-texinfo","for .frame files":"application/vnd.framemaker","for .ttc files":"font/collection","for .dataless files":"application/vnd.fdsn.seed","for .wpd files":"application/vnd.wordperfect","for .qxb files":"application/vnd.quark.quarkxpress","of a .webmanifest file":"application/manifest+json","goes with the extension es3":"application/vnd.eszigno3+xml","goes with the extension glb":"model/gltf-binary","for .ustar files":"application/x-ustar","for .jad files":"text/vnd.sun.j2me.app-descriptor","goes with the extension m4u":"video/vnd.mpegurl","goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template","of a .h file":"text/x-c","for .xpi files":"application/x-xpinstall","for .kml files":"application/vnd.google-earth.kml+xml","goes with the extension stpnc":"model/step","goes with the extension rsheet":"application/urc-ressheet+xml","for .prf files":"application/pics-rules","of a .fvt file":"video/vnd.fvt","of a .stw file":"application/vnd.sun.xml.writer.template","of a .edx file":"application/vnd.novadigm.edx","of a .mvt file":"application/vnd.mapbox-vector-tile","of a .sbml file":"application/sbml+xml","for .hdf files":"application/x-hdf","of a .stpxz file":"model/step-xml+zip","of a .rusd file":"application/route-usd+xml","of a .gif file":"image/gif","of a .mpkg file":"application/vnd.apple.installer+xml","goes with the extension uvv":"video/vnd.dece.video","goes with the extension lostxml":"application/lost+xml","goes with the extension au":"audio/basic","for .evy files":"application/x-envoy","for .txf files":"application/vnd.mobius.txf","goes with the extension 3ds":"image/x-3ds","of a .jais file":"image/jais","goes with the extension wmx":"video/x-ms-wmx","goes with the extension uvg":"image/vnd.dece.graphic","for .cjs files":"application/node","for .held files":"application/atsc-held+xml","for .less files":"text/less","for .u8mdn files":"message/global-disposition-notification","for .pas files":"text/x-pascal","of a .xo file":"application/vnd.olpc-sugar","of a .spx file":"audio/ogg","of a .nsc file":"application/x-conference","goes with the extension spl":"application/x-futuresplash","for .tpl files":"application/vnd.groove-tool-template","goes with the extension ppt":"application/vnd.ms-powerpoint","goes with the extension cdmid":"application/cdmi-domain","of a .ova file":"application/x-virtualbox-ova","for .spdx files":"text/spdx","of a .arj file":"application/x-arj","of a .umj file":"application/vnd.umajin","for .vtx files":"application/vnd.visio","goes with the extension oas":"application/vnd.fujitsu.oasys","of a .rdz file":"application/vnd.data-vision.rdz","for .dot files":"application/msword","for .tsd files":"application/timestamped-data","goes with the extension m4b":"audio/mp4","goes with the extension amlx":"application/automationml-amlx+zip","of a .yaml file":"text/yaml","of a .sieve file":"application/sieve","goes with the extension exr":"image/aces","for .fhc files":"image/x-freehand","goes with the extension n3":"text/n3","for .vcard files":"text/vcard","goes with the extension p":"text/x-pascal","goes with the extension sfv":"text/x-sfv","goes with the extension vec":"application/vec+xml","goes with the extension sdc":"application/vnd.stardivision.calc","for .mmf files":"application/vnd.smaf","goes with the extension dvb":"video/vnd.dvb.file","for .spf files":"application/vnd.yamaha.smaf-phrase","for .c4p files":"application/vnd.clonk.c4group","of a .rq file":"application/sparql-query","for .ice files":"x-conference/x-cooltalk","goes with the extension h261":"video/h261","for .hdd files":"application/x-virtualbox-hdd","goes with the extension gph":"application/vnd.flographit","of a .text file":"text/plain","of a .pic file":"image/x-pict","of a .gbr file":"application/rpki-ghostbusters","of a .wmlc file":"application/vnd.wap.wmlc","of a .mxs file":"application/vnd.triscape.mxs","goes with the extension clkt":"application/vnd.crick.clicker.template","goes with the extension wbxml":"application/vnd.wap.wbxml","goes with the extension onetoc":"application/onenote","for .xls files":"application/vnd.ms-excel","of a .x3dbz file":"model/x3d+binary","of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-532803f8","guard":[["hasAny",["3ds","amlx","arj","au","cdmid","clkt","content","dvb","edx","es3","exr","ez","fvt","gbr","gif","glb","gnumeric","gph","gxf","h261","ipynb","item number","jais","leading zeros","lostxml","m4b","m4u","mpkg","mvt","mxs","nsc","nth","oas","onetoc","oth","ots","ova","p","pad with","padded to","pic","ppt","rdz","rq","rsheet","rusd","sbml","sdc","sfv","sieve","spl","spx","stpnc","stpxz","stw","texi","umj","uvg","uvv","vec","wbxml","wmlc","wmx","x3dbz","xhtml","xlt","xo","yaml","zero pad"]],["has","type"],["words<=",9],["words>=",7],["not",["has","breed"]],["has","the"],["not",["colon"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-9e03b7f3","guard":[["hasAny",["3ds","amlx","arj","au","cdmid","clkt","content","dvb","edx","es3","exr","ez","fvt","gbr","gif","glb","gnumeric","gph","gxf","h261","ipynb","item number","jais","leading zeros","lostxml","m4b","m4u","mpkg","mvt","mxs","nsc","nth","oas","onetoc","oth","ots","ova","p","pad with","padded to","pic","ppt","rdz","rq","rsheet","rusd","sbml","sdc","sfv","sieve","spl","spx","stpnc","stpxz","stw","texi","umj","uvg","uvv","vec","wbxml","wmlc","wmx","x3dbz","xhtml","xlt","xo","yaml","zero pad"]],["has","type"],["words<=",9],["words>=",7],["not",["has","breed"]],["has","the"],["not",["colon"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-9b062907","guard":[["hasAny",["3ds","amlx","arj","au","cdmid","clkt","content","dvb","edx","es3","exr","ez","fvt","gbr","gif","glb","gnumeric","gph","gxf","h261","ipynb","item number","jais","leading zeros","lostxml","m4b","m4u","mpkg","mvt","mxs","nsc","nth","oas","onetoc","oth","ots","ova","p","pad with","padded to","pic","ppt","rdz","rq","rsheet","rusd","sbml","sdc","sfv","sieve","spl","spx","stpnc","stpxz","stw","texi","umj","uvg","uvv","vec","wbxml","wmlc","wmx","x3dbz","xhtml","xlt","xo","yaml","zero pad"]],["has","type"],["words<=",9],["words>=",7],["not",["has","breed"]],["has","the"],["not",["colon"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]],"mem":null},
{"id":"n-5c6cc260","guard":[["has","type"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml","which MIME type goes with the extension xhtml":"application/xhtml+xml","what is the media type of a .gnumeric file":"application/x-gnumeric","which MIME type goes with the extension me":"text/troff","what is the media type of a .xlt file":"application/vnd.ms-excel","what is the media type of a .ez file":"application/andrew-inset","which MIME type goes with the extension gxf":"application/gxf","name the content type for .qam files":"application/vnd.epson.quickanime","what is the media type of a .oth file":"application/vnd.oasis.opendocument.text-web","what is the media type of a .texi file":"application/x-texinfo","name the content type for .frame files":"application/vnd.framemaker","name the content type for .ttc files":"font/collection","name the content type for .dataless files":"application/vnd.fdsn.seed","name the content type for .wpd files":"application/vnd.wordperfect","name the content type for .qxb files":"application/vnd.quark.quarkxpress","what is the media type of a .webmanifest file":"application/manifest+json","which MIME type goes with the extension glb":"model/gltf-binary","name the content type for .ustar files":"application/x-ustar","name the content type for .jad files":"text/vnd.sun.j2me.app-descriptor","which MIME type goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template","what is the media type of a .h file":"text/x-c","name the content type for .xpi files":"application/x-xpinstall","name the content type for .kml files":"application/vnd.google-earth.kml+xml","which MIME type goes with the extension stpnc":"model/step","which MIME type goes with the extension rsheet":"application/urc-ressheet+xml","name the content type for .prf files":"application/pics-rules","what is the media type of a .fvt file":"video/vnd.fvt","what is the media type of a .stw file":"application/vnd.sun.xml.writer.template","what is the media type of a .edx file":"application/vnd.novadigm.edx","what is the media type of a .mvt file":"application/vnd.mapbox-vector-tile","what is the media type of a .sbml file":"application/sbml+xml","name the content type for .hdf files":"application/x-hdf","what is the media type of a .stpxz file":"model/step-xml+zip","what is the media type of a .rusd file":"application/route-usd+xml","what is the media type of a .gif file":"image/gif","what is the media type of a .mpkg file":"application/vnd.apple.installer+xml","which MIME type goes with the extension uvv":"video/vnd.dece.video","which MIME type goes with the extension lostxml":"application/lost+xml","which MIME type goes with the extension au":"audio/basic","name the content type for .evy files":"application/x-envoy","name the content type for .txf files":"application/vnd.mobius.txf","what is the media type of a .jais file":"image/jais","which MIME type goes with the extension wmx":"video/x-ms-wmx","which MIME type goes with the extension uvg":"image/vnd.dece.graphic","name the content type for .cjs files":"application/node","name the content type for .held files":"application/atsc-held+xml","name the content type for .less files":"text/less","name the content type for .pas files":"text/x-pascal","what is the media type of a .xo file":"application/vnd.olpc-sugar","what is the media type of a .spx file":"audio/ogg","what is the media type of a .nsc file":"application/x-conference","which MIME type goes with the extension spl":"application/x-futuresplash","name the content type for .tpl files":"application/vnd.groove-tool-template","which MIME type goes with the extension ppt":"application/vnd.ms-powerpoint","which MIME type goes with the extension cdmid":"application/cdmi-domain","what is the media type of a .ova file":"application/x-virtualbox-ova","name the content type for .spdx files":"text/spdx","what is the media type of a .arj file":"application/x-arj","what is the media type of a .umj file":"application/vnd.umajin","name the content type for .vtx files":"application/vnd.visio","which MIME type goes with the extension oas":"application/vnd.fujitsu.oasys","what is the media type of a .rdz file":"application/vnd.data-vision.rdz","name the content type for .dot files":"application/msword","name the content type for .tsd files":"application/timestamped-data","which MIME type goes with the extension amlx":"application/automationml-amlx+zip","what is the media type of a .yaml file":"text/yaml","what is the media type of a .sieve file":"application/sieve","which MIME type goes with the extension exr":"image/aces","name the content type for .fhc files":"image/x-freehand","name the content type for .vcard files":"text/vcard","which MIME type goes with the extension p":"text/x-pascal","which MIME type goes with the extension sfv":"text/x-sfv","which MIME type goes with the extension vec":"application/vec+xml","which MIME type goes with the extension sdc":"application/vnd.stardivision.calc","name the content type for .mmf files":"application/vnd.smaf","which MIME type goes with the extension dvb":"video/vnd.dvb.file","name the content type for .spf files":"application/vnd.yamaha.smaf-phrase","what is the media type of a .rq file":"application/sparql-query","name the content type for .ice files":"x-conference/x-cooltalk","name the content type for .hdd files":"application/x-virtualbox-hdd","which MIME type goes with the extension gph":"application/vnd.flographit","what is the media type of a .text file":"text/plain","what is the media type of a .pic file":"image/x-pict","what is the media type of a .gbr file":"application/rpki-ghostbusters","what is the media type of a .wmlc file":"application/vnd.wap.wmlc","what is the media type of a .mxs file":"application/vnd.triscape.mxs","which MIME type goes with the extension clkt":"application/vnd.crick.clicker.template","which MIME type goes with the extension wbxml":"application/vnd.wap.wbxml","which MIME type goes with the extension onetoc":"application/onenote","name the content type for .xls files":"application/vnd.ms-excel","what is the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-1d6048a2","guard":[["hasAny",["3ds","amlx","arj","au","c4p","cdmid","cjs","clkt","dataless","dvb","edx","es3","evy","exr","ez","fhc","frame","fvt","gbr","glb","gnumeric","gph","gxf","h261","hdd","hdf","held","ipynb","item number","jad","jais","kml","leading zeros","lostxml","m4u","mmf","mpkg","mvt","mxs","nsc","nth","oas","onetoc","osfpvg","oth","ots","ova","p","pad with","padded to","pas","pic","ppt","prf","qam","qxb","rdz","rq","rsheet","rusd","sbml","sdc","sfv","sieve","spf","spl","stpnc","stpxz","stw","texi","tpl","ttc","txf","u8mdn","umj","ustar","uvg","uvv","vcard","vec","vtx","wbxml","wmlc","wmx","wpd","x3dbz","xhtml","xls","xlt","xo","xpi","zero pad"]],["has","type"],["words<=",9],["words>=",7],["not",["has","breed"]],["has","the"],["not",["colon"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],{"lit":10},["sense.lastWord"]]],"mem":null},
{"id":"n-a789baea","guard":[["hasAny",["3ds","amlx","arj","au","c4p","cdmid","cjs","clkt","dataless","dvb","edx","es3","evy","exr","ez","fhc","frame","fvt","gbr","glb","gnumeric","gph","gxf","h261","hdd","hdf","held","ipynb","item number","jad","jais","kml","leading zeros","lostxml","m4u","mmf","mpkg","mvt","mxs","nsc","nth","oas","onetoc","osfpvg","oth","ots","ova","p","pad with","padded to","pas","pic","ppt","prf","qam","qxb","rdz","rq","rsheet","rusd","sbml","sdc","sfv","sieve","spf","spl","stpnc","stpxz","stw","texi","tpl","ttc","txf","u8mdn","umj","ustar","uvg","uvv","vcard","vec","vtx","wbxml","wmlc","wmx","wpd","x3dbz","xhtml","xls","xlt","xo","xpi","zero pad"]],["has","type"],["words<=",9],["words>=",7],["not",["has","breed"]],["has","the"],["not",["colon"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-0d569b78","guard":[["hasAny",["3ds","amlx","arj","au","c4p","cdmid","cjs","clkt","dataless","dvb","edx","es3","evy","exr","ez","fhc","frame","fvt","gbr","glb","gnumeric","gph","gxf","h261","hdd","hdf","held","ipynb","item number","jad","jais","kml","leading zeros","lostxml","m4u","mmf","mpkg","mvt","mxs","nsc","nth","oas","onetoc","osfpvg","oth","ots","ova","p","pad with","padded to","pas","pic","ppt","prf","qam","qxb","rdz","rq","rsheet","rusd","sbml","sdc","sfv","sieve","spf","spl","stpnc","stpxz","stw","texi","tpl","ttc","txf","u8mdn","umj","ustar","uvg","uvv","vcard","vec","vtx","wbxml","wmlc","wmx","wpd","x3dbz","xhtml","xls","xlt","xo","xpi","zero pad"]],["has","type"],["words<=",9],["words>=",7],["not",["has","breed"]],["has","the"],["not",["colon"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]],"mem":null},
{"id":"n-06bd2968","guard":[["hasAny",["amlx","arj","c4p","cdmid","cjs","clkt","dataless","dot","dvb","edx","es3","evy","ez","fhc","frame","fvt","gbr","glb","gnumeric","gph","gxf","hdd","hdf","held","ipynb","item number","jad","kml","leading zeros","lostxml","m4u","mmf","mpkg","mvt","mxs","nsc","nth","oas","onetoc","osfpvg","oth","ots","ova","p","pad with","padded to","pas","pic","ppt","prf","qam","qxb","rdz","rq","rsheet","rusd","sbml","sdc","sieve","spf","spl","stpxz","stw","texi","tpl","ttc","txf","u8mdn","umj","ustar","uvg","uvv","vec","vtx","wbxml","wmlc","wmx","wpd","x3dbz","xhtml","xls","xlt","xo","xpi","zero pad"]],["has","type"],["not",["has","accountant"]],["words>=",7]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],{"lit":12},["sense.lastWord"]]],"mem":null},
{"id":"n-5c16caad","guard":[["hasAny",["amlx","arj","c4p","cdmid","cjs","clkt","dataless","dot","dvb","edx","es3","evy","ez","fhc","frame","fvt","gbr","glb","gnumeric","gph","gxf","hdd","hdf","held","ipynb","item number","jad","kml","leading zeros","lostxml","m4u","mmf","mpkg","mvt","mxs","nsc","nth","oas","onetoc","osfpvg","oth","ots","ova","p","pad with","padded to","pas","pic","ppt","prf","qam","qxb","rdz","rq","rsheet","rusd","sbml","sdc","sieve","spf","spl","stpxz","stw","texi","tpl","ttc","txf","u8mdn","umj","ustar","uvg","uvv","vec","vtx","wbxml","wmlc","wmx","wpd","x3dbz","xhtml","xls","xlt","xo","xpi","zero pad"]],["has","type"],["not",["has","accountant"]],["words>=",7]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-76f046da","guard":[["hasAny",["amlx","arj","c4p","cdmid","cjs","clkt","dataless","dot","dvb","edx","es3","evy","ez","fhc","frame","fvt","gbr","glb","gnumeric","gph","gxf","hdd","hdf","held","ipynb","item number","jad","kml","leading zeros","lostxml","m4u","mmf","mpkg","mvt","mxs","nsc","nth","oas","onetoc","osfpvg","oth","ots","ova","p","pad with","padded to","pas","pic","ppt","prf","qam","qxb","rdz","rq","rsheet","rusd","sbml","sdc","sieve","spf","spl","stpxz","stw","texi","tpl","ttc","txf","u8mdn","umj","ustar","uvg","uvv","vec","vtx","wbxml","wmlc","wmx","wpd","x3dbz","xhtml","xls","xlt","xo","xpi","zero pad"]],["has","type"],["not",["has","accountant"]],["words>=",7]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]],"mem":null},
{"id":"n-d85fdc3a","guard":[["hasAny",["amlx","au","cdmid","clkt","content","dvb","es3","exr","glb","gph","gxf","h261","item number","lostxml","m4b","m4u","n3","normalise","normalize","nth","oas","onetoc","ots","p","ppt","rsheet","sdc","sfv","simplify the text","spl","stpnc","uvg","uvv","vec","wbxml","wmx","xhtml"]],["has","type"],["nums==",0],["words<=",9],["not",["has","breed"]],["has","the"],["not",["colon"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.howMany"]]],"mem":null},
{"id":"n-dbbb3743","guard":[["hasAny",["amlx","au","caesar cipher","cdmid","clkt","content","dvb","es3","exr","glb","gph","gxf","h261","item number","lostxml","m4b","m4u","n3","nth","oas","onetoc","ots","p","ppt","rotate the letters","rsheet","sdc","sfv","shift by","shift each letter","spl","stpnc","uvg","uvv","vec","wbxml","wmx","xhtml"]],["has","type"],["nums==",0],["words<=",9],["not",["has","breed"]],["has","the"],["not",["colon"]]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.howMany"]]],"mem":null},
{"id":"n-0406f15d","guard":[["hasAny",["arj","content","edx","ez","fvt","gbr","gif","gnumeric","ipynb","item number","mpkg","mvt","nsc","nth","ova","pic","rq","rusd","sbml","separate by","sieve","split by","spx","stpxz","stw","texi","umj","wmlc","x3dbz","xlt","xo","yaml"]],["has","type"],["words<=",9],["words>=",7],["not",["has","applicationcalendarxml"]],["not",["has","applicationntriples"]],["not",["has","applicationp2poverlayxml"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-246caad9","guard":[["hasAny",["arj","content","edx","ez","fvt","gbr","gif","gnumeric","ipynb","item number","mpkg","mvt","nsc","nth","ova","pic","rq","rusd","sbml","separate by","sieve","split by","spx","stpxz","stw","texi","umj","wmlc","x3dbz","xlt","xo","yaml"]],["has","type"],["words<=",9],["words>=",7],["not",["has","applicationcalendarxml"]],["not",["has","applicationntriples"]],["not",["has","applicationp2poverlayxml"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a0593894","guard":[["hasAny",["arj","content","edx","ez","fvt","gbr","gif","gnumeric","ipynb","item number","mpkg","mvt","nsc","nth","ova","pic","rq","rusd","sbml","separate by","sieve","split by","spx","stpxz","stw","texi","umj","wmlc","x3dbz","xlt","xo","yaml"]],["has","type"],["words<=",9],["words>=",7],["not",["has","applicationcalendarxml"]],["not",["has","applicationntriples"]],["not",["has","applicationp2poverlayxml"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-b7ec155e","guard":[["hasAny",["arj","content","delete","edx","ez","fvt","gbr","gif","gnumeric","ipynb","item number","mpkg","mvt","nsc","nth","ova","pic","remove","rq","rusd","sbml","sieve","spx","stpxz","strip out","stw","texi","umj","wmlc","x3dbz","xlt","xo","yaml"]],["has","type"],["words<=",9],["words>=",7],["not",["has","applicationcalendarxml"]],["not",["has","applicationntriples"]],["not",["has","applicationp2poverlayxml"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a0b599f0","guard":[["hasAny",["cdmid","clkt","content","es3","exr","glb","gph","item number","lostxml","m4b","m4u","nth","onetoc","ots","ppt","rsheet","sdc","separate by","split by","stpnc","uvg","uvv"]],["has","type"],["nums==",0],["words<=",9],["not",["has","breed"]],["not",["colon"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.lastWord"]]],"mem":null},
{"id":"n-b3ef23a8","guard":[["hasAny",["cdmid","clkt","content","delete","es3","exr","glb","gph","item number","lostxml","m4b","m4u","nth","onetoc","ots","ppt","remove","rsheet","sdc","stpnc","strip out","uvg","uvv"]],["has","type"],["nums==",0],["words<=",9],["not",["has","breed"]],["not",["colon"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.lastWord"]]],"mem":null},
{"id":"n-b64199af","guard":[["hasAny",["cdmid","clkt","content","es3","exr","glb","gph","item number","lostxml","m4b","m4u","nth","onetoc","ots","ppt","rsheet","sdc","separate by","split by","stpnc","uvg","uvv"]],["has","type"],["nums==",0],["words<=",9],["not",["has","breed"]],["not",["colon"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.lastWord"]]],"mem":null},
{"id":"n-ecd1d25b","guard":[["hasAny",["cdmid","clkt","content","es3","exr","glb","gph","item number","lostxml","m4b","m4u","nth","onetoc","ots","ppt","rsheet","sdc","separate by","split by","stpnc","uvg","uvv"]],["has","type"],["nums==",0],["words<=",9],["not",["has","breed"]],["not",["colon"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.lastWord"]]],"mem":null},
{"id":"n-c25a9d0b","guard":[["hasAny",["cdmid","change to","clkt","content","es3","exr","glb","gph","item number","lostxml","m4b","m4u","nth","onetoc","ots","ppt","replace","rsheet","sdc","stpnc","swap","uvg","uvv"]],["has","type"],["nums==",0],["words<=",9],["not",["has","breed"]],["not",["colon"]]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-129b732e","guard":[["hasAny",["c4p","cdmid","cjs","clkt","dataless","delete","es3","evy","exr","ez","fhc","gbr","glb","gph","item number","jad","lostxml","m4b","m4u","mmf","mpkg","mvt","nsc","nth","onetoc","oth","ots","ppt","prf","qam","qxb","remove","rsheet","rusd","sdc","spf","spx","stpnc","stpxz","strip out","stw","tpl","ttc","u8mdn","umj","uvg","uvv","vtx","wpd","x3dbz","xls","xlt","xo"]],["has","type"],["nums==",0],["words<=",9],["not",["has","breed"]],["not",["colon"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]],"mem":null},
{"id":"n-36818f02","guard":[["hasAny",["c4p","cdmid","cjs","clkt","dataless","es3","evy","exr","ez","fhc","gbr","glb","gph","item number","jad","lostxml","m4b","m4u","mmf","mpkg","mvt","nsc","nth","onetoc","oth","ots","ppt","prf","qam","qxb","rsheet","rusd","sdc","separate by","spf","split by","spx","stpnc","stpxz","stw","tpl","ttc","u8mdn","umj","uvg","uvv","vtx","wpd","x3dbz","xls","xlt","xo"]],["has","type"],["nums==",0],["words<=",9],["not",["has","breed"]],["not",["colon"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]],"mem":null},
{"id":"n-78c55613","guard":[["hasAny",["c4p","cdmid","cjs","clkt","dataless","es3","evy","exr","ez","fhc","gbr","glb","gph","item number","jad","lostxml","m4b","m4u","mmf","mpkg","mvt","nsc","nth","onetoc","oth","ots","ppt","prf","qam","qxb","rsheet","rusd","sdc","separate by","spf","split by","spx","stpnc","stpxz","stw","tpl","ttc","u8mdn","umj","uvg","uvv","vtx","wpd","x3dbz","xls","xlt","xo"]],["has","type"],["nums==",0],["words<=",9],["not",["has","breed"]],["not",["colon"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]],"mem":null},
{"id":"n-f0fd3f2e","guard":[["hasAny",["c4p","cdmid","cjs","clkt","dataless","es3","evy","exr","ez","fhc","gbr","glb","gph","item number","jad","lostxml","m4b","m4u","mmf","mpkg","mvt","nsc","nth","onetoc","oth","ots","ppt","prf","qam","qxb","rsheet","rusd","sdc","separate by","spf","split by","spx","stpnc","stpxz","stw","tpl","ttc","u8mdn","umj","uvg","uvv","vtx","wpd","x3dbz","xls","xlt","xo"]],["has","type"],["nums==",0],["words<=",9],["not",["has","breed"]],["not",["colon"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]],"mem":null},
{"id":"n-8e838ede","guard":[["hasAny",["c4p","cdmid","change to","cjs","clkt","dataless","es3","evy","exr","ez","fhc","gbr","glb","gph","item number","jad","lostxml","m4b","m4u","mmf","mpkg","mvt","nsc","nth","onetoc","oth","ots","ppt","prf","qam","qxb","replace","rsheet","rusd","sdc","spf","spx","stpnc","stpxz","stw","swap","tpl","ttc","u8mdn","umj","uvg","uvv","vtx","wpd","x3dbz","xls","xlt","xo"]],["has","type"],["nums==",0],["words<=",9],["not",["has","breed"]],["not",["colon"]]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],["sense.text"]]],"mem":null},
{"id":"n-4d22f7a5","guard":[["hasAny",["delete","file","item number","nth","remove","strip out"]],["has","media"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-00ad1803","guard":[],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"a .gnumeric file":"application/x-gnumeric","a .xlt file":"application/vnd.ms-excel","a .ez file":"application/andrew-inset","a .oth file":"application/vnd.oasis.opendocument.text-web","a .texi file":"application/x-texinfo","a .webmanifest file":"application/manifest+json","a .h file":"text/x-c","a .fvt file":"video/vnd.fvt","a .stw file":"application/vnd.sun.xml.writer.template","a .edx file":"application/vnd.novadigm.edx","a .mvt file":"application/vnd.mapbox-vector-tile","a .sbml file":"application/sbml+xml","a .stpxz file":"model/step-xml+zip","a .rusd file":"application/route-usd+xml","a .gif file":"image/gif","a .mpkg file":"application/vnd.apple.installer+xml","a .jais file":"image/jais","a .xo file":"application/vnd.olpc-sugar","a .spx file":"audio/ogg","a .nsc file":"application/x-conference","a .ova file":"application/x-virtualbox-ova","a .arj file":"application/x-arj","a .umj file":"application/vnd.umajin","a .rdz file":"application/vnd.data-vision.rdz","a .yaml file":"text/yaml","a .sieve file":"application/sieve","a .rq file":"application/sparql-query","a .text file":"text/plain","a .pic file":"image/x-pict","a .gbr file":"application/rpki-ghostbusters","a .wmlc file":"application/vnd.wap.wmlc","a .mxs file":"application/vnd.triscape.mxs","a .x3dbz file":"model/x3d+binary","a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-123c8409","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"a .gnumeric file":"application/x-gnumeric","a .xlt file":"application/vnd.ms-excel","a .ez file":"application/andrew-inset","a .oth file":"application/vnd.oasis.opendocument.text-web","a .texi file":"application/x-texinfo","a .webmanifest file":"application/manifest+json","a .h file":"text/x-c","a .fvt file":"video/vnd.fvt","a .stw file":"application/vnd.sun.xml.writer.template","a .edx file":"application/vnd.novadigm.edx","a .mvt file":"application/vnd.mapbox-vector-tile","a .sbml file":"application/sbml+xml","a .stpxz file":"model/step-xml+zip","a .rusd file":"application/route-usd+xml","a .gif file":"image/gif","a .mpkg file":"application/vnd.apple.installer+xml","a .jais file":"image/jais","a .xo file":"application/vnd.olpc-sugar","a .spx file":"audio/ogg","a .nsc file":"application/x-conference","a .ova file":"application/x-virtualbox-ova","a .arj file":"application/x-arj","a .umj file":"application/vnd.umajin","a .rdz file":"application/vnd.data-vision.rdz","a .yaml file":"text/yaml","a .sieve file":"application/sieve","a .rq file":"application/sparql-query","a .text file":"text/plain","a .pic file":"image/x-pict","a .gbr file":"application/rpki-ghostbusters","a .wmlc file":"application/vnd.wap.wmlc","a .mxs file":"application/vnd.triscape.mxs","a .x3dbz file":"model/x3d+binary","a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-21f84520","guard":[["has","file"],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the media type of a .gnumeric file":"application/x-gnumeric","the media type of a .xlt file":"application/vnd.ms-excel","the media type of a .ez file":"application/andrew-inset","the media type of a .oth file":"application/vnd.oasis.opendocument.text-web","the media type of a .texi file":"application/x-texinfo","the media type of a .webmanifest file":"application/manifest+json","the media type of a .h file":"text/x-c","the media type of a .fvt file":"video/vnd.fvt","the media type of a .stw file":"application/vnd.sun.xml.writer.template","the media type of a .edx file":"application/vnd.novadigm.edx","the media type of a .mvt file":"application/vnd.mapbox-vector-tile","the media type of a .sbml file":"application/sbml+xml","the media type of a .stpxz file":"model/step-xml+zip","the media type of a .rusd file":"application/route-usd+xml","the media type of a .gif file":"image/gif","the media type of a .mpkg file":"application/vnd.apple.installer+xml","the media type of a .jais file":"image/jais","the media type of a .xo file":"application/vnd.olpc-sugar","the media type of a .spx file":"audio/ogg","the media type of a .nsc file":"application/x-conference","the media type of a .ova file":"application/x-virtualbox-ova","the media type of a .arj file":"application/x-arj","the media type of a .umj file":"application/vnd.umajin","the media type of a .rdz file":"application/vnd.data-vision.rdz","the media type of a .yaml file":"text/yaml","the media type of a .sieve file":"application/sieve","the media type of a .rq file":"application/sparql-query","the media type of a .text file":"text/plain","the media type of a .pic file":"image/x-pict","the media type of a .gbr file":"application/rpki-ghostbusters","the media type of a .wmlc file":"application/vnd.wap.wmlc","the media type of a .mxs file":"application/vnd.triscape.mxs","the media type of a .x3dbz file":"model/x3d+binary","the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-8c8d39b4","guard":[["has","file"],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the media type of a .gnumeric file":"application/x-gnumeric","the media type of a .xlt file":"application/vnd.ms-excel","the media type of a .ez file":"application/andrew-inset","the media type of a .oth file":"application/vnd.oasis.opendocument.text-web","the media type of a .texi file":"application/x-texinfo","the media type of a .webmanifest file":"application/manifest+json","the media type of a .h file":"text/x-c","the media type of a .fvt file":"video/vnd.fvt","the media type of a .stw file":"application/vnd.sun.xml.writer.template","the media type of a .edx file":"application/vnd.novadigm.edx","the media type of a .mvt file":"application/vnd.mapbox-vector-tile","the media type of a .sbml file":"application/sbml+xml","the media type of a .stpxz file":"model/step-xml+zip","the media type of a .rusd file":"application/route-usd+xml","the media type of a .gif file":"image/gif","the media type of a .mpkg file":"application/vnd.apple.installer+xml","the media type of a .jais file":"image/jais","the media type of a .xo file":"application/vnd.olpc-sugar","the media type of a .spx file":"audio/ogg","the media type of a .nsc file":"application/x-conference","the media type of a .ova file":"application/x-virtualbox-ova","the media type of a .arj file":"application/x-arj","the media type of a .umj file":"application/vnd.umajin","the media type of a .rdz file":"application/vnd.data-vision.rdz","the media type of a .yaml file":"text/yaml","the media type of a .sieve file":"application/sieve","the media type of a .rq file":"application/sparql-query","the media type of a .text file":"text/plain","the media type of a .pic file":"image/x-pict","the media type of a .gbr file":"application/rpki-ghostbusters","the media type of a .wmlc file":"application/vnd.wap.wmlc","the media type of a .mxs file":"application/vnd.triscape.mxs","the media type of a .x3dbz file":"model/x3d+binary","the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-8ebd8f1d","guard":[["has","file"],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"a .gnumeric file":"application/x-gnumeric","a .xlt file":"application/vnd.ms-excel","a .ez file":"application/andrew-inset","a .oth file":"application/vnd.oasis.opendocument.text-web","a .texi file":"application/x-texinfo","a .webmanifest file":"application/manifest+json","a .h file":"text/x-c","a .fvt file":"video/vnd.fvt","a .stw file":"application/vnd.sun.xml.writer.template","a .edx file":"application/vnd.novadigm.edx","a .mvt file":"application/vnd.mapbox-vector-tile","a .sbml file":"application/sbml+xml","a .stpxz file":"model/step-xml+zip","a .rusd file":"application/route-usd+xml","a .gif file":"image/gif","a .mpkg file":"application/vnd.apple.installer+xml","a .jais file":"image/jais","a .xo file":"application/vnd.olpc-sugar","a .spx file":"audio/ogg","a .nsc file":"application/x-conference","a .ova file":"application/x-virtualbox-ova","a .arj file":"application/x-arj","a .umj file":"application/vnd.umajin","a .rdz file":"application/vnd.data-vision.rdz","a .yaml file":"text/yaml","a .sieve file":"application/sieve","a .rq file":"application/sparql-query","a .text file":"text/plain","a .pic file":"image/x-pict","a .gbr file":"application/rpki-ghostbusters","a .wmlc file":"application/vnd.wap.wmlc","a .mxs file":"application/vnd.triscape.mxs","a .x3dbz file":"model/x3d+binary","a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-a65ca48b","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml","goes with the extension xhtml":"application/xhtml+xml","of a .gnumeric file":"application/x-gnumeric","goes with the extension me":"text/troff","of a .xlt file":"application/vnd.ms-excel","of a .ez file":"application/andrew-inset","goes with the extension gxf":"application/gxf","for .qam files":"application/vnd.epson.quickanime","of a .oth file":"application/vnd.oasis.opendocument.text-web","of a .texi file":"application/x-texinfo","for .frame files":"application/vnd.framemaker","for .ttc files":"font/collection","for .dataless files":"application/vnd.fdsn.seed","for .wpd files":"application/vnd.wordperfect","for .qxb files":"application/vnd.quark.quarkxpress","of a .webmanifest file":"application/manifest+json","goes with the extension es3":"application/vnd.eszigno3+xml","goes with the extension glb":"model/gltf-binary","for .ustar files":"application/x-ustar","for .jad files":"text/vnd.sun.j2me.app-descriptor","goes with the extension m4u":"video/vnd.mpegurl","goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template","of a .h file":"text/x-c","for .xpi files":"application/x-xpinstall","for .kml files":"application/vnd.google-earth.kml+xml","goes with the extension stpnc":"model/step","goes with the extension rsheet":"application/urc-ressheet+xml","for .prf files":"application/pics-rules","of a .fvt file":"video/vnd.fvt","of a .stw file":"application/vnd.sun.xml.writer.template","of a .edx file":"application/vnd.novadigm.edx","of a .mvt file":"application/vnd.mapbox-vector-tile","of a .sbml file":"application/sbml+xml","for .hdf files":"application/x-hdf","of a .stpxz file":"model/step-xml+zip","of a .rusd file":"application/route-usd+xml","of a .gif file":"image/gif","of a .mpkg file":"application/vnd.apple.installer+xml","goes with the extension uvv":"video/vnd.dece.video","goes with the extension lostxml":"application/lost+xml","goes with the extension au":"audio/basic","for .evy files":"application/x-envoy","for .txf files":"application/vnd.mobius.txf","goes with the extension 3ds":"image/x-3ds","of a .jais file":"image/jais","goes with the extension wmx":"video/x-ms-wmx","goes with the extension uvg":"image/vnd.dece.graphic","for .cjs files":"application/node","for .held files":"application/atsc-held+xml","for .less files":"text/less","for .u8mdn files":"message/global-disposition-notification","for .pas files":"text/x-pascal","of a .xo file":"application/vnd.olpc-sugar","of a .spx file":"audio/ogg","of a .nsc file":"application/x-conference","goes with the extension spl":"application/x-futuresplash","for .tpl files":"application/vnd.groove-tool-template","goes with the extension ppt":"application/vnd.ms-powerpoint","goes with the extension cdmid":"application/cdmi-domain","of a .ova file":"application/x-virtualbox-ova","for .spdx files":"text/spdx","of a .arj file":"application/x-arj","of a .umj file":"application/vnd.umajin","for .vtx files":"application/vnd.visio","goes with the extension oas":"application/vnd.fujitsu.oasys","of a .rdz file":"application/vnd.data-vision.rdz","for .dot files":"application/msword","for .tsd files":"application/timestamped-data","goes with the extension m4b":"audio/mp4","goes with the extension amlx":"application/automationml-amlx+zip","of a .yaml file":"text/yaml","of a .sieve file":"application/sieve","goes with the extension exr":"image/aces","for .fhc files":"image/x-freehand","goes with the extension n3":"text/n3","for .vcard files":"text/vcard","goes with the extension p":"text/x-pascal","goes with the extension sfv":"text/x-sfv","goes with the extension vec":"application/vec+xml","goes with the extension sdc":"application/vnd.stardivision.calc","for .mmf files":"application/vnd.smaf","goes with the extension dvb":"video/vnd.dvb.file","for .spf files":"application/vnd.yamaha.smaf-phrase","for .c4p files":"application/vnd.clonk.c4group","of a .rq file":"application/sparql-query","for .ice files":"x-conference/x-cooltalk","goes with the extension h261":"video/h261","for .hdd files":"application/x-virtualbox-hdd","goes with the extension gph":"application/vnd.flographit","of a .text file":"text/plain","of a .pic file":"image/x-pict","of a .gbr file":"application/rpki-ghostbusters","of a .wmlc file":"application/vnd.wap.wmlc","of a .mxs file":"application/vnd.triscape.mxs","goes with the extension clkt":"application/vnd.crick.clicker.template","goes with the extension wbxml":"application/vnd.wap.wbxml","goes with the extension onetoc":"application/onenote","for .xls files":"application/vnd.ms-excel","of a .x3dbz file":"model/x3d+binary","of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-afdbb333","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the media type of a .gnumeric file":"application/x-gnumeric","the media type of a .xlt file":"application/vnd.ms-excel","the media type of a .ez file":"application/andrew-inset","the media type of a .oth file":"application/vnd.oasis.opendocument.text-web","the media type of a .texi file":"application/x-texinfo","the media type of a .webmanifest file":"application/manifest+json","the media type of a .h file":"text/x-c","the media type of a .fvt file":"video/vnd.fvt","the media type of a .stw file":"application/vnd.sun.xml.writer.template","the media type of a .edx file":"application/vnd.novadigm.edx","the media type of a .mvt file":"application/vnd.mapbox-vector-tile","the media type of a .sbml file":"application/sbml+xml","the media type of a .stpxz file":"model/step-xml+zip","the media type of a .rusd file":"application/route-usd+xml","the media type of a .gif file":"image/gif","the media type of a .mpkg file":"application/vnd.apple.installer+xml","the media type of a .jais file":"image/jais","the media type of a .xo file":"application/vnd.olpc-sugar","the media type of a .spx file":"audio/ogg","the media type of a .nsc file":"application/x-conference","the media type of a .ova file":"application/x-virtualbox-ova","the media type of a .arj file":"application/x-arj","the media type of a .umj file":"application/vnd.umajin","the media type of a .rdz file":"application/vnd.data-vision.rdz","the media type of a .yaml file":"text/yaml","the media type of a .sieve file":"application/sieve","the media type of a .rq file":"application/sparql-query","the media type of a .text file":"text/plain","the media type of a .pic file":"image/x-pict","the media type of a .gbr file":"application/rpki-ghostbusters","the media type of a .wmlc file":"application/vnd.wap.wmlc","the media type of a .mxs file":"application/vnd.triscape.mxs","the media type of a .x3dbz file":"model/x3d+binary","the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-d32c709d","guard":[["has","file"],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"a .gnumeric file":"application/x-gnumeric","a .xlt file":"application/vnd.ms-excel","a .ez file":"application/andrew-inset","a .oth file":"application/vnd.oasis.opendocument.text-web","a .texi file":"application/x-texinfo","a .webmanifest file":"application/manifest+json","a .h file":"text/x-c","a .fvt file":"video/vnd.fvt","a .stw file":"application/vnd.sun.xml.writer.template","a .edx file":"application/vnd.novadigm.edx","a .mvt file":"application/vnd.mapbox-vector-tile","a .sbml file":"application/sbml+xml","a .stpxz file":"model/step-xml+zip","a .rusd file":"application/route-usd+xml","a .gif file":"image/gif","a .mpkg file":"application/vnd.apple.installer+xml","a .jais file":"image/jais","a .xo file":"application/vnd.olpc-sugar","a .spx file":"audio/ogg","a .nsc file":"application/x-conference","a .ova file":"application/x-virtualbox-ova","a .arj file":"application/x-arj","a .umj file":"application/vnd.umajin","a .rdz file":"application/vnd.data-vision.rdz","a .yaml file":"text/yaml","a .sieve file":"application/sieve","a .rq file":"application/sparql-query","a .text file":"text/plain","a .pic file":"image/x-pict","a .gbr file":"application/rpki-ghostbusters","a .wmlc file":"application/vnd.wap.wmlc","a .mxs file":"application/vnd.triscape.mxs","a .x3dbz file":"model/x3d+binary","a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-f798590b","guard":[],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the media type of a .gnumeric file":"application/x-gnumeric","the media type of a .xlt file":"application/vnd.ms-excel","the media type of a .ez file":"application/andrew-inset","the media type of a .oth file":"application/vnd.oasis.opendocument.text-web","the media type of a .texi file":"application/x-texinfo","the media type of a .webmanifest file":"application/manifest+json","the media type of a .h file":"text/x-c","the media type of a .fvt file":"video/vnd.fvt","the media type of a .stw file":"application/vnd.sun.xml.writer.template","the media type of a .edx file":"application/vnd.novadigm.edx","the media type of a .mvt file":"application/vnd.mapbox-vector-tile","the media type of a .sbml file":"application/sbml+xml","the media type of a .stpxz file":"model/step-xml+zip","the media type of a .rusd file":"application/route-usd+xml","the media type of a .gif file":"image/gif","the media type of a .mpkg file":"application/vnd.apple.installer+xml","the media type of a .jais file":"image/jais","the media type of a .xo file":"application/vnd.olpc-sugar","the media type of a .spx file":"audio/ogg","the media type of a .nsc file":"application/x-conference","the media type of a .ova file":"application/x-virtualbox-ova","the media type of a .arj file":"application/x-arj","the media type of a .umj file":"application/vnd.umajin","the media type of a .rdz file":"application/vnd.data-vision.rdz","the media type of a .yaml file":"text/yaml","the media type of a .sieve file":"application/sieve","the media type of a .rq file":"application/sparql-query","the media type of a .text file":"text/plain","the media type of a .pic file":"image/x-pict","the media type of a .gbr file":"application/rpki-ghostbusters","the media type of a .wmlc file":"application/vnd.wap.wmlc","the media type of a .mxs file":"application/vnd.triscape.mxs","the media type of a .x3dbz file":"model/x3d+binary","the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-a21e8219","guard":[["hasAny",["content","delete","item number","nth","position","remove","strip out"]],["has","name"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-21ff3069","guard":[],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{".osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml",".qam files":"application/vnd.epson.quickanime",".frame files":"application/vnd.framemaker",".ttc files":"font/collection",".dataless files":"application/vnd.fdsn.seed",".wpd files":"application/vnd.wordperfect",".qxb files":"application/vnd.quark.quarkxpress",".ustar files":"application/x-ustar",".jad files":"text/vnd.sun.j2me.app-descriptor",".xpi files":"application/x-xpinstall",".kml files":"application/vnd.google-earth.kml+xml",".prf files":"application/pics-rules",".hdf files":"application/x-hdf",".evy files":"application/x-envoy",".txf files":"application/vnd.mobius.txf",".cjs files":"application/node",".held files":"application/atsc-held+xml",".less files":"text/less",".u8mdn files":"message/global-disposition-notification",".pas files":"text/x-pascal",".tpl files":"application/vnd.groove-tool-template",".spdx files":"text/spdx",".vtx files":"application/vnd.visio",".dot files":"application/msword",".tsd files":"application/timestamped-data",".fhc files":"image/x-freehand",".vcard files":"text/vcard",".mmf files":"application/vnd.smaf",".spf files":"application/vnd.yamaha.smaf-phrase",".c4p files":"application/vnd.clonk.c4group",".ice files":"x-conference/x-cooltalk",".hdd files":"application/x-virtualbox-hdd",".xls files":"application/vnd.ms-excel"}}},
{"id":"n-33cb3bb4","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{".osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml",".qam files":"application/vnd.epson.quickanime",".frame files":"application/vnd.framemaker",".ttc files":"font/collection",".dataless files":"application/vnd.fdsn.seed",".wpd files":"application/vnd.wordperfect",".qxb files":"application/vnd.quark.quarkxpress",".ustar files":"application/x-ustar",".jad files":"text/vnd.sun.j2me.app-descriptor",".xpi files":"application/x-xpinstall",".kml files":"application/vnd.google-earth.kml+xml",".prf files":"application/pics-rules",".hdf files":"application/x-hdf",".evy files":"application/x-envoy",".txf files":"application/vnd.mobius.txf",".cjs files":"application/node",".held files":"application/atsc-held+xml",".less files":"text/less",".u8mdn files":"message/global-disposition-notification",".pas files":"text/x-pascal",".tpl files":"application/vnd.groove-tool-template",".spdx files":"text/spdx",".vtx files":"application/vnd.visio",".dot files":"application/msword",".tsd files":"application/timestamped-data",".fhc files":"image/x-freehand",".vcard files":"text/vcard",".mmf files":"application/vnd.smaf",".spf files":"application/vnd.yamaha.smaf-phrase",".c4p files":"application/vnd.clonk.c4group",".ice files":"x-conference/x-cooltalk",".hdd files":"application/x-virtualbox-hdd",".xls files":"application/vnd.ms-excel"}}},
{"id":"n-754a1b2e","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml","goes with the extension xhtml":"application/xhtml+xml","of a .gnumeric file":"application/x-gnumeric","goes with the extension me":"text/troff","of a .xlt file":"application/vnd.ms-excel","of a .ez file":"application/andrew-inset","goes with the extension gxf":"application/gxf","for .qam files":"application/vnd.epson.quickanime","of a .oth file":"application/vnd.oasis.opendocument.text-web","of a .texi file":"application/x-texinfo","for .frame files":"application/vnd.framemaker","for .ttc files":"font/collection","for .dataless files":"application/vnd.fdsn.seed","for .wpd files":"application/vnd.wordperfect","for .qxb files":"application/vnd.quark.quarkxpress","of a .webmanifest file":"application/manifest+json","goes with the extension es3":"application/vnd.eszigno3+xml","goes with the extension glb":"model/gltf-binary","for .ustar files":"application/x-ustar","for .jad files":"text/vnd.sun.j2me.app-descriptor","goes with the extension m4u":"video/vnd.mpegurl","goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template","of a .h file":"text/x-c","for .xpi files":"application/x-xpinstall","for .kml files":"application/vnd.google-earth.kml+xml","goes with the extension stpnc":"model/step","goes with the extension rsheet":"application/urc-ressheet+xml","for .prf files":"application/pics-rules","of a .fvt file":"video/vnd.fvt","of a .stw file":"application/vnd.sun.xml.writer.template","of a .edx file":"application/vnd.novadigm.edx","of a .mvt file":"application/vnd.mapbox-vector-tile","of a .sbml file":"application/sbml+xml","for .hdf files":"application/x-hdf","of a .stpxz file":"model/step-xml+zip","of a .rusd file":"application/route-usd+xml","of a .gif file":"image/gif","of a .mpkg file":"application/vnd.apple.installer+xml","goes with the extension uvv":"video/vnd.dece.video","goes with the extension lostxml":"application/lost+xml","goes with the extension au":"audio/basic","for .evy files":"application/x-envoy","for .txf files":"application/vnd.mobius.txf","goes with the extension 3ds":"image/x-3ds","of a .jais file":"image/jais","goes with the extension wmx":"video/x-ms-wmx","goes with the extension uvg":"image/vnd.dece.graphic","for .cjs files":"application/node","for .held files":"application/atsc-held+xml","for .less files":"text/less","for .u8mdn files":"message/global-disposition-notification","for .pas files":"text/x-pascal","of a .xo file":"application/vnd.olpc-sugar","of a .spx file":"audio/ogg","of a .nsc file":"application/x-conference","goes with the extension spl":"application/x-futuresplash","for .tpl files":"application/vnd.groove-tool-template","goes with the extension ppt":"application/vnd.ms-powerpoint","goes with the extension cdmid":"application/cdmi-domain","of a .ova file":"application/x-virtualbox-ova","for .spdx files":"text/spdx","of a .arj file":"application/x-arj","of a .umj file":"application/vnd.umajin","for .vtx files":"application/vnd.visio","goes with the extension oas":"application/vnd.fujitsu.oasys","of a .rdz file":"application/vnd.data-vision.rdz","for .dot files":"application/msword","for .tsd files":"application/timestamped-data","goes with the extension m4b":"audio/mp4","goes with the extension amlx":"application/automationml-amlx+zip","of a .yaml file":"text/yaml","of a .sieve file":"application/sieve","goes with the extension exr":"image/aces","for .fhc files":"image/x-freehand","goes with the extension n3":"text/n3","for .vcard files":"text/vcard","goes with the extension p":"text/x-pascal","goes with the extension sfv":"text/x-sfv","goes with the extension vec":"application/vec+xml","goes with the extension sdc":"application/vnd.stardivision.calc","for .mmf files":"application/vnd.smaf","goes with the extension dvb":"video/vnd.dvb.file","for .spf files":"application/vnd.yamaha.smaf-phrase","for .c4p files":"application/vnd.clonk.c4group","of a .rq file":"application/sparql-query","for .ice files":"x-conference/x-cooltalk","goes with the extension h261":"video/h261","for .hdd files":"application/x-virtualbox-hdd","goes with the extension gph":"application/vnd.flographit","of a .text file":"text/plain","of a .pic file":"image/x-pict","of a .gbr file":"application/rpki-ghostbusters","of a .wmlc file":"application/vnd.wap.wmlc","of a .mxs file":"application/vnd.triscape.mxs","goes with the extension clkt":"application/vnd.crick.clicker.template","goes with the extension wbxml":"application/vnd.wap.wbxml","goes with the extension onetoc":"application/onenote","for .xls files":"application/vnd.ms-excel","of a .x3dbz file":"model/x3d+binary","of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-b04d2ef8","guard":[["has","content"],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{".osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml",".qam files":"application/vnd.epson.quickanime",".frame files":"application/vnd.framemaker",".ttc files":"font/collection",".dataless files":"application/vnd.fdsn.seed",".wpd files":"application/vnd.wordperfect",".qxb files":"application/vnd.quark.quarkxpress",".ustar files":"application/x-ustar",".jad files":"text/vnd.sun.j2me.app-descriptor",".xpi files":"application/x-xpinstall",".kml files":"application/vnd.google-earth.kml+xml",".prf files":"application/pics-rules",".hdf files":"application/x-hdf",".evy files":"application/x-envoy",".txf files":"application/vnd.mobius.txf",".cjs files":"application/node",".held files":"application/atsc-held+xml",".less files":"text/less",".u8mdn files":"message/global-disposition-notification",".pas files":"text/x-pascal",".tpl files":"application/vnd.groove-tool-template",".spdx files":"text/spdx",".vtx files":"application/vnd.visio",".dot files":"application/msword",".tsd files":"application/timestamped-data",".fhc files":"image/x-freehand",".vcard files":"text/vcard",".mmf files":"application/vnd.smaf",".spf files":"application/vnd.yamaha.smaf-phrase",".c4p files":"application/vnd.clonk.c4group",".ice files":"x-conference/x-cooltalk",".hdd files":"application/x-virtualbox-hdd",".xls files":"application/vnd.ms-excel"}}},
{"id":"n-d7af47b5","guard":[["has","content"],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{".osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml",".qam files":"application/vnd.epson.quickanime",".frame files":"application/vnd.framemaker",".ttc files":"font/collection",".dataless files":"application/vnd.fdsn.seed",".wpd files":"application/vnd.wordperfect",".qxb files":"application/vnd.quark.quarkxpress",".ustar files":"application/x-ustar",".jad files":"text/vnd.sun.j2me.app-descriptor",".xpi files":"application/x-xpinstall",".kml files":"application/vnd.google-earth.kml+xml",".prf files":"application/pics-rules",".hdf files":"application/x-hdf",".evy files":"application/x-envoy",".txf files":"application/vnd.mobius.txf",".cjs files":"application/node",".held files":"application/atsc-held+xml",".less files":"text/less",".u8mdn files":"message/global-disposition-notification",".pas files":"text/x-pascal",".tpl files":"application/vnd.groove-tool-template",".spdx files":"text/spdx",".vtx files":"application/vnd.visio",".dot files":"application/msword",".tsd files":"application/timestamped-data",".fhc files":"image/x-freehand",".vcard files":"text/vcard",".mmf files":"application/vnd.smaf",".spf files":"application/vnd.yamaha.smaf-phrase",".c4p files":"application/vnd.clonk.c4group",".ice files":"x-conference/x-cooltalk",".hdd files":"application/x-virtualbox-hdd",".xls files":"application/vnd.ms-excel"}}},
{"id":"n-fb2558c0","guard":[["hasAny",["c4p","change to","cjs","dataless","dot","evy","ez","fhc","gbr","item number","jad","mmf","mpkg","mvt","nsc","nth","oth","prf","qam","qxb","replace","rusd","spf","spx","stpxz","stw","swap","tpl","ttc","u8mdn","umj","vtx","wpd","x3dbz","xls","xlt","xo"]],["has","type"],["not",["has","accountant"]],["not",["has","applicationcalendarxml"]],["not",["has","applicationntriples"]],["not",["has","applicationp2poverlayxml"]],["not",["has","applicationsrgsxml"]]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],["sense.lastWord"]]],"mem":null},
{"id":"n-792fdf78","guard":[["hasAny",["3ds","au","characters from","exr","gif","h261","item number","jais","less","letters from to","m4b","n3","nth","pic","sfv","slice of the text","spdx","spx","stpnc","substring","vcard","yaml"]],["has","type"],["words<=",9],["words>=",7],["not",["has","breed"]],["has","the"],["not",["colon"]]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-21910f07","guard":[["hasAny",["characters from","exr","gif","h261","item number","jais","less","letters from to","m4b","n3","nth","sfv","slice of the text","spdx","spx","stpnc","substring","vcard","yaml"]],["has","type"],["nums==",0],["words<=",9],["not",["has","breed"]],["not",["colon"]],["words>=",7]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-537ffb20","guard":[["has","type"],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.numeral"]]],"mem":{"table":{"es3":"application/vnd.eszigno3+xml","m4u":"video/vnd.mpegurl","3ds":"image/x-3ds","u8mdn":"message/global-disposition-notification","m4b":"audio/mp4","n3":"text/n3","c4p":"application/vnd.clonk.c4group","h261":"video/h261","x3dbz":"model/x3d+binary"}}},
{"id":"n-7a33b8f1","guard":[["has","type"],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.numeral"]]],"mem":{"table":{"es3":"application/vnd.eszigno3+xml","m4u":"video/vnd.mpegurl","3ds":"image/x-3ds","u8mdn":"message/global-disposition-notification","m4b":"audio/mp4","n3":"text/n3","c4p":"application/vnd.clonk.c4group","h261":"video/h261","x3dbz":"model/x3d+binary"}}},
{"id":"n-cfc6ae2a","guard":[["has","type"]],"pyramid":["render.str",["memory.lookup",["sense.numeral"]]],"mem":{"table":{"es3":"application/vnd.eszigno3+xml","m4u":"video/vnd.mpegurl","3ds":"image/x-3ds","u8mdn":"message/global-disposition-notification","m4b":"audio/mp4","n3":"text/n3","c4p":"application/vnd.clonk.c4group","h261":"video/h261","x3dbz":"model/x3d+binary"}}},
{"id":"n-502ea740","guard":[["hasAny",["3ds","content","es3","file","h261","item number","leading zeros","m4b","m4u","nth","pad","pad with","padded to","position","zero pad"]],["has","type"],["not",["has","does"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.wordCount"],["sense.numeral"]]],"mem":null},
{"id":"n-f76edc6b","guard":[["hasAny",["3ds","content","es3","file","h261","item number","leading zeros","m4u","nth","pad","pad with","padded to","position","zero pad"]],["has","type"],["not",["has","does"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],{"lit":10},["sense.numeral"]]],"mem":null},
{"id":"n-a87e2d3a","guard":[["hasAny",["content","delete","es3","file","item number","m4b","m4u","nth","position","remove","strip out"]],["has","type"],["not",["has","does"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.numeral"]]],"mem":null},
{"id":"n-18d48b0f","guard":[["hasAny",["change to","content","es3","file","item number","m4b","m4u","nth","position","replace","swap"]],["has","type"],["not",["has","does"]]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.numeral"],["sense.text"]]],"mem":null},
{"id":"n-5e130c9a","guard":[["hasAny",["change to","extension","item number","nth","position","replace","swap"]],["has","which"],["not",["has","applicationvndmspowerpointaddinmacroenabled12"]]],"pyramid":["render.str",["transform.replace",["sense.numeral"],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}]]],"mem":null},
{"id":"n-c7f9aef1","guard":[["hasAny",["change to","extension","item number","nth","position","replace","swap"]],["has","which"],["not",["has","applicationvndmspowerpointaddinmacroenabled12"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.numeral"],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}]]],"mem":null},
{"id":"n-8773cb32","guard":[["has","extension"],["has","which"]],"pyramid":["render.str",["memory.lookup",["sense.lastWord"]]],"mem":{"table":{"es3":"application/vnd.eszigno3+xml","m4u":"video/vnd.mpegurl","3ds":"image/x-3ds","u8mdn":"message/global-disposition-notification","m4b":"audio/mp4","n3":"text/n3","c4p":"application/vnd.clonk.c4group","h261":"video/h261","x3dbz":"model/x3d+binary"}}},
{"id":"n-3d18de35","guard":[["hasAny",["content","es3","file","item number","leading zeros","m4u","nth","pad","pad with","padded to","position","zero pad"]],["has","type"],["not",["has","does"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],{"lit":12},["sense.numeral"]]],"mem":null},
{"id":"n-49db3381","guard":[["hasAny",["characters from","gif","item number","letters from to","n3","nth","slice of the text","spx","substring","yaml"]],["has","type"],["words>=",8]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-b8d3d8be","guard":[["hasAny",["h261","item number","jais","leading zeros","nth","pad with","padded to","sfv","vcard","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":10},["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}]]],"mem":null},
{"id":"n-cef1df52","guard":[["hasAny",["item number","less","nth","spdx","vcard"]],["has","name"]],"pyramid":["render.template",{"lit":["text/",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4c1172e7","guard":[["hasAny",["item number","nth","separate by","split by","xls","xlt"]]],"pyramid":["render.list",["transform.split",{"lit":"application/vnd.ms-excel"},["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]],"mem":null},
{"id":"n-83eca104","guard":[["hasAny",["item number","nth","separate by","split by","xls","xlt"]]],"pyramid":["render.lines",["transform.split",{"lit":"application/vnd.ms-excel"},["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]],"mem":null},
{"id":"n-e2a7dc2d","guard":[["hasAny",["delete","item number","nth","remove","strip out","xls","xlt"]]],"pyramid":["render.str",["transform.remove",{"lit":"application/vnd.ms-excel"},["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]],"mem":null},
{"id":"n-e9c271e5","guard":[["hasAny",["item number","nth","separate by","split by","xls","xlt"]]],"pyramid":["render.and",["transform.split",{"lit":"application/vnd.ms-excel"},["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]],"mem":null},
{"id":"n-42692a63","guard":[["hasAny",["item number","leading zeros","nth","pad with","padded to","sfv","vcard","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":10},{"lit":"text/x-pascal"}]],"mem":null},
{"id":"n-af732504","guard":[["hasAny",["change to","item number","nth","replace","swap","xls","xlt"]]],"pyramid":["render.str",["transform.replace",{"lit":"application/vnd.ms-excel"},["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],["sense.text"]]],"mem":null},
{"id":"n-7c70e753","guard":[["hasAny",["h261","item number","leading zeros","nth","pad with","padded to","sfv","zero pad"]]],"pyramid":["render.str",["transform.padStart",["sense.lastWord"],{"lit":10},["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}]]],"mem":null},
{"id":"n-cd295bbe","guard":[["hasAny",["gif","item number","leading zeros","nth","pad with","padded to","yaml","zero pad"]],["has","what"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],["sense.wordCount"],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}]]],"mem":null},
{"id":"n-1b54b847","guard":[["hasAny",["vec","xhtml"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["sense.lastWord"]],"mem":null},
{"id":"n-52b3b1d7","guard":[["hasAny",["vec","xhtml"]],["not",["colon"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["sense.lastWord"]],"mem":null},
{"id":"n-e448cab2","guard":[["hasAny",["vec","xhtml"]],["not",["quoted"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["sense.lastWord"]],"mem":null},
{"id":"n-0ed86c95","guard":[["hasAny",["hdd","ova","shortest","shortest one","shortest word"]],["has","type"]],"pyramid":["render.template",{"lit":["application/x-virtualbox-",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-28a97043","guard":[["hasAny",["invert case","swap case","toggle case","vec","xhtml"]],["not",["quoted"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3bc38c46","guard":[["hasAny",["arj","hdf","shortest","shortest one","shortest word"]],["not",["quoted"]]],"pyramid":["render.template",{"lit":["application/x-",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4c4d168e","guard":[["hasAny",["normalise","normalize","simplify the text","xls","xlt"]]],"pyramid":["render.str",["transform.norm",{"lit":"application/vnd.ms-excel"},["sense.howMany"]]],"mem":null},
{"id":"n-4cb6db93","guard":[["hasAny",["normalise","normalize","simplify the text","xls","xlt"]],["not",["quoted"]]],"pyramid":["render.str",["transform.norm",{"lit":"application/vnd.ms-excel"},["sense.howMany"]]],"mem":null},
{"id":"n-6217adc1","guard":[["hasAny",["normalise","normalize","simplify the text","xls","xlt"]],["not",["colon"]]],"pyramid":["render.str",["transform.norm",{"lit":"application/vnd.ms-excel"},["sense.howMany"]]],"mem":null},
{"id":"n-7e27015c","guard":[["hasAny",["arj","hdf","shortest","shortest one","shortest word"]],["not",["colon"]]],"pyramid":["render.template",{"lit":["application/x-",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9ee58be8","guard":[["hasAny",["invert case","swap case","toggle case","vec","xhtml"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9f71a7ad","guard":[["hasAny",["capitalise","capitalize","capitalize each word","vec","xhtml"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ac281e0f","guard":[["hasAny",["caesar cipher","rotate the letters","shift by","shift each letter","xls","xlt"]]],"pyramid":["render.str",["transform.caesar",{"lit":"application/vnd.ms-excel"},["sense.howMany"]]],"mem":null},
{"id":"n-ad5869fd","guard":[["hasAny",["caesar cipher","p","pas","rotate the letters","shift by","shift each letter"]],["has","type"]],"pyramid":["render.str",["transform.caesar",{"lit":"text/x-pascal"},["sense.howMany"]]],"mem":null},
{"id":"n-c01f0f8b","guard":[["hasAny",["arj","hdf","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["application/x-",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ce6c606d","guard":[["hasAny",["delete","strip out","xls","xlt"]]],"pyramid":["render.str",["transform.remove",{"lit":"application/vnd.ms-excel"},["sense.text"]]],"mem":null},
{"id":"n-d4eeadb0","guard":[["hasAny",["normalise","normalize","p","pas","simplify the text"]],["has","type"],["not",["quoted"]]],"pyramid":["render.str",["transform.norm",{"lit":"text/x-pascal"},["sense.howMany"]]],"mem":null},
{"id":"n-e753e921","guard":[["hasAny",["normalise","normalize","p","pas","simplify the text"]],["has","type"],["not",["colon"]]],"pyramid":["render.str",["transform.norm",{"lit":"text/x-pascal"},["sense.howMany"]]],"mem":null},
{"id":"n-eb800005","guard":[["hasAny",["invert case","swap case","toggle case","vec","xhtml"]],["not",["colon"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f2c7171c","guard":[["hasAny",["normalise","normalize","p","pas","simplify the text"]],["has","type"]],"pyramid":["render.str",["transform.norm",{"lit":"text/x-pascal"},["sense.howMany"]]],"mem":null},
{"id":"n-2f243825","guard":[["hasAny",["arj","gnumeric","item number","nth"]]],"pyramid":["render.template",{"lit":["application/x-",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-346e2212","guard":[["hasAny",["normalise","normalize","simplify the text","vec","xhtml"]],["not",["colon"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-5302e23e","guard":[["hasAny",["hdf","item number","nth","ustar"]]],"pyramid":["render.template",{"lit":["application/x-",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6304bd82","guard":[["hasAny",["normalise","normalize","simplify the text","vec","xhtml"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-705f85ac","guard":[["hasAny",["each word","split into words","vec","xhtml"]],["not",["quoted"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-92eb8348","guard":[["hasAny",["gif","item number","jais","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["image/",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-95babcfc","guard":[["hasAny",["item number","nth","vec","xhtml"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-a1bbcd5d","guard":[["hasAny",["each word","split into words","vec","xhtml"]],["not",["colon"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bef4d045","guard":[["hasAny",["each word","split into words","vec","xhtml"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d3fb1954","guard":[["hasAny",["each word","split into words","vec","xhtml"]],["not",["colon"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d8c823e3","guard":[["hasAny",["each word","split into words","vec","xhtml"]],["not",["quoted"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-edfa1673","guard":[["hasAny",["each word","split into words","vec","xhtml"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fa9cce8e","guard":[["hasAny",["normalise","normalize","simplify the text","vec","xhtml"]],["not",["quoted"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-2d017721","guard":[["hasAny",["change to","item number","nth","p","replace","swap"]],["has","mime"]],"pyramid":["render.str",["transform.replace",{"lit":"text/x-pascal"},["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],["sense.lastWord"]]],"mem":null},
{"id":"n-367fd547","guard":[["hasAny",["change to","item number","nth","p","replace","swap"]],["has","mime"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],["sense.lastWord"],{"lit":"text/x-pascal"}]],"mem":null},
{"id":"n-c0871f8d","guard":[["hasAny",["item number","leading zeros","nth","pad with","padded to","yaml","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],["sense.wordCount"],{"lit":"text/x-pascal"}]],"mem":null},
{"id":"n-db9f8dc5","guard":[["hasAny",["change to","item number","nth","p","replace","swap"]],["has","mime"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"text/x-pascal"}]],"mem":null},
{"id":"n-46ebda1e","guard":[["hasAny",["3ds","item number","nth","position"]]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.howMany"]]],"mem":null},
{"id":"n-62c10b28","guard":[["not",["hasAny",["10260031","10397455e4","10436516e4","1061487242","10756446","107878058","108288","10873393e4","110060","113614","114074","11502871e4","115760","116710","117950","1195722","12140807e4","12336644","13057017e4","133709","13th","14205331e4","154189235","15542435e4","15772731e4","16146914e4","1630880","16549861e4","1732698","17604871","17670321e4","18592953e4","19091617e4","1930438974","20200209","20200211","20200216","20200226","20200312","20200315","20200329","20200331","20200412","20200501","20200504","20200510","20200622","20200625","20200704","20200706","20200728","20201006","20201125","20201127","20201955e4","20210104","20210114","20210206","20210208","20210218","20210301","20210322","20210326","20210504","20210510","20210605","20210716","20210720","20210725","20210730","20210812","20210826","20211012","20211020","20211119","20211207","20211221","20220130","20220306","20220327","2075","22198165e4","24199863e4","26184341e4","282931982","303379246","31651635e4","339156","34588508e4","35557074e5","3603668843","38005435e4","42162082e4","46371043e4","47308358","4812634","537383869","53779401","60375826e4","60376828e4","6545480486","67266337","68413","72039259","74798","77458848e5","79499754e5","79859286","80690","8165482e5","862737634","8734524e4","87360","89429317","93040380","adult","age30","agency","airline","al12","album","alpha","alpha3","angeles","artist","author","bg11","bound","capita","captions","carriages","cars","category","cb","cent","china","city","clean","close","code","company","composition","confirmed","consecutive","cougar","country","cpi","crayola","creators","current","date","deaths","degreez","description","devils","director","discards","dividend","do17","economy","ee714","electric","element","emissions","en150","ep","episode","exchange","feb","firefox","fr10","ft","fuel","galaxy","gc","gd10","gender","glucose","gmsl","gold","groups","high","httpscommunitybmccomsgroup0f93n000000plutcaksentrysoftware","hubble","id","imdb","increase","internet","ir12","irlandais","j2000","jan","jp14","judge1","ke27","keycap","lbs","lc10","legal","level","life","link","loa","location","lt59","ma07","make","males","material","max","me22","mean","min","mk701","mm17","model","month","mt18","name","national","network","nfl20102017","ngc","no11","north","number","offset","open","opendate","origin","original","pc","phoenix","phrase","plan","planet","player","price","programme","proposed","qualification","rank","rate","rating","recovered","recreational","rhythm","schedule","season","security","short","si060","si070","si091","si120","si135","si181","south","sp500","speaking","special","species","stderr","strcity","streetaddr","strstate","subcategory","substitute","subtype","sucountry","sugar","suname","sutype","symbol","test","time","title","to04","total","ug122","uncertainty","usd","vndrs274x","winner","wreck","writers","yarn","year","years"]]]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.howMany"]]],"mem":null},
{"id":"n-58daf3fc","guard":[["hasAny",["h261","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["sense.numeral"],{"lit":10},["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}]]],"mem":null},
{"id":"n-b989549b","guard":[["hasAny",["3ds","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}],{"lit":"mime-types"},{"lit":"file extension"},{"lit":"media type"}],["sense.first"],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]],"mem":null},
{"id":"n-00272229","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension glb":"model/gltf-binary"}}},
{"id":"n-00db3d6b","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .wmlc file":"application/vnd.wap.wmlc"}}},
{"id":"n-017ffe5d","guard":[["hasAny",["content","files","name","osfpvg","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml"}}},
{"id":"n-01d7915c","guard":[["hasAny",["content","files","name","qam","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .qam files":"application/vnd.epson.quickanime"}}},
{"id":"n-037e8d62","guard":[["hasAny",["content","files","name","pas","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .pas files":"text/x-pascal"}}},
{"id":"n-03dd359e","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml"}}},
{"id":"n-03f1683b","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .spx file":"audio/ogg"}}},
{"id":"n-0403c171","guard":[["hasAny",["file","media","spx","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .spx file":"audio/ogg"}}},
{"id":"n-059dca9b","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension m4b":"audio/mp4"}}},
{"id":"n-05df738a","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension vec":"application/vec+xml"}}},
{"id":"n-06b8091c","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .pas files":"text/x-pascal"}}},
{"id":"n-06e74abb","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension lostxml":"application/lost+xml"}}},
{"id":"n-0824e7f9","guard":[["hasAny",["extension","goes","mime","type","uvg"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvg":"image/vnd.dece.graphic"}}},
{"id":"n-0871ccba","guard":[["has","wbxml"]],"pyramid":["render.template",{"lit":["application/vnd.wap.",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-0a21dc53","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .fvt file":"video/vnd.fvt"}}},
{"id":"n-0b2b5079","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .spdx files":"text/spdx"}}},
{"id":"n-0c3b64b9","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .ttc files":"font/collection"}}},
{"id":"n-0c543062","guard":[["hasAny",["content","files","name","type","vcard"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .vcard files":"text/vcard"}}},
{"id":"n-0c6ab3ac","guard":[["hasAny",["content","files","name","ttc","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .ttc files":"font/collection"}}},
{"id":"n-0cc6fe96","guard":[["has","dvb"],["not",["colon"]]],"pyramid":["render.template",{"lit":["video/vnd.",{"slot":0},".file"]},["sense.lastWord"]],"mem":null},
{"id":"n-0d5d6376","guard":[["hasAny",["file","media","text","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .text file":"text/plain"}}},
{"id":"n-0e672696","guard":[["hasAny",["content","files","name","txf","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .txf files":"application/vnd.mobius.txf"}}},
{"id":"n-0fe88588","guard":[["has","sfv"]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-105681ae","guard":[["hasAny",["file","fvt","media","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .fvt file":"video/vnd.fvt"}}},
{"id":"n-10e99273","guard":[["hasAny",["amlx","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension amlx":"application/automationml-amlx+zip"}}},
{"id":"n-10f31e01","guard":[["has","clkt"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension clkt":"application/vnd.crick.clicker.template"}}},
{"id":"n-12ab3865","guard":[["hasAny",["dvb","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension dvb":"video/vnd.dvb.file"}}},
{"id":"n-1319daa8","guard":[["hasAny",["au","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension au":"audio/basic"}}},
{"id":"n-1372f090","guard":[["hasAny",["extension","goes","mime","ots","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template"}}},
{"id":"n-137563ba","guard":[["hasAny",["file","media","rusd","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .rusd file":"application/route-usd+xml"}}},
{"id":"n-13984402","guard":[["hasAny",["extension","goes","mime","type","vec"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension vec":"application/vec+xml"}}},
{"id":"n-14436e1f","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .mxs file":"application/vnd.triscape.mxs"}}},
{"id":"n-145fd880","guard":[["hasAny",["file","media","sbml","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .sbml file":"application/sbml+xml"}}},
{"id":"n-149f3159","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension wbxml":"application/vnd.wap.wbxml"}}},
{"id":"n-14ade36b","guard":[["has","sfv"],["not",["colon"]]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-158e2e71","guard":[["hasAny",["content","dataless","files","name","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .dataless files":"application/vnd.fdsn.seed"}}},
{"id":"n-1590aa8c","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .xls files":"application/vnd.ms-excel"}}},
{"id":"n-16988c3c","guard":[["hasAny",["file","media","spx","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .spx file":"audio/ogg"}}},
{"id":"n-178aa374","guard":[["hasAny",["content","files","kml","name","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .kml files":"application/vnd.google-earth.kml+xml"}}},
{"id":"n-18f91809","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .nsc file":"application/x-conference"}}},
{"id":"n-1a230d77","guard":[["hasAny",["extension","goes","mime","onetoc","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension onetoc":"application/onenote"}}},
{"id":"n-1ce3d6da","guard":[["hasAny",["file","gnumeric","media","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gnumeric file":"application/x-gnumeric"}}},
{"id":"n-1d5413a0","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .arj file":"application/x-arj"}}},
{"id":"n-1d57452b","guard":[["hasAny",["file","media","type","umj"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .umj file":"application/vnd.umajin"}}},
{"id":"n-1d76cb46","guard":[["hasAny",["file","media","nsc","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .nsc file":"application/x-conference"}}},
{"id":"n-1e7c697f","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gnumeric file":"application/x-gnumeric"}}},
{"id":"n-1e90a85c","guard":[["hasAny",["file","media","mpkg","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .mpkg file":"application/vnd.apple.installer+xml"}}},
{"id":"n-1f66cf33","guard":[["hasAny",["content","evy","files","name","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .evy files":"application/x-envoy"}}},
{"id":"n-1f67c1eb","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .ttc files":"font/collection"}}},
{"id":"n-1f85515e","guard":[["has","wbxml"],["not",["colon"]]],"pyramid":["render.template",{"lit":["application/vnd.wap.",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-20e3f79b","guard":[["hasAny",["file","ipynb","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-2145f6da","guard":[["hasAny",["extension","goes","mime","onetoc","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension onetoc":"application/onenote"}}},
{"id":"n-225ec381","guard":[["has","h261"]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["sense.numeral"]],"mem":null},
{"id":"n-226938fa","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .mvt file":"application/vnd.mapbox-vector-tile"}}},
{"id":"n-22ecbcbe","guard":[["hasAny",["arj","file","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .arj file":"application/x-arj"}}},
{"id":"n-22fe6d05","guard":[["hasAny",["content","files","name","qam","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .qam files":"application/vnd.epson.quickanime"}}},
{"id":"n-23424389","guard":[["hasAny",["content","files","hdd","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .hdd files":"application/x-virtualbox-hdd"}}},
{"id":"n-23b2b999","guard":[["has","wmx"]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-248d1dc7","guard":[["has","wbxml"],["not",["quoted"]]],"pyramid":["render.template",{"lit":["application/vnd.wap.",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-24a080a8","guard":[["hasAny",["extension","goes","mime","onetoc","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension onetoc":"application/onenote"}}},
{"id":"n-24f32a97","guard":[["hasAny",["content","files","kml","name","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .kml files":"application/vnd.google-earth.kml+xml"}}},
{"id":"n-25ab76d9","guard":[["hasAny",["file","media","type","umj"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .umj file":"application/vnd.umajin"}}},
{"id":"n-25b4ae1b","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .stw file":"application/vnd.sun.xml.writer.template"}}},
{"id":"n-25e08783","guard":[["hasAny",["es3","extension","goes","mime","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension es3":"application/vnd.eszigno3+xml"}}},
{"id":"n-264136d3","guard":[["hasAny",["extension","goes","mime","spl","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension spl":"application/x-futuresplash"}}},
{"id":"n-26ae3581","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvg":"image/vnd.dece.graphic"}}},
{"id":"n-26b68fcb","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .webmanifest file":"application/manifest+json"}}},
{"id":"n-275f5e35","guard":[["hasAny",["es3","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension es3":"application/vnd.eszigno3+xml"}}},
{"id":"n-27f636b9","guard":[["hasAny",["file","media","texi","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .texi file":"application/x-texinfo"}}},
{"id":"n-28202fa0","guard":[["hasAny",["content","files","name","pas","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .pas files":"text/x-pascal"}}},
{"id":"n-29b5e037","guard":[["has","arj"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .arj file":"application/x-arj"}}},
{"id":"n-2a6b727e","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension glb":"model/gltf-binary"}}},
{"id":"n-2aa006d2","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template"}}},
{"id":"n-2aa72d03","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension spl":"application/x-futuresplash"}}},
{"id":"n-2bb791c4","guard":[["hasAny",["file","media","nsc","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .nsc file":"application/x-conference"}}},
{"id":"n-2eb7250f","guard":[["hasAny",["clkt","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension clkt":"application/vnd.crick.clicker.template"}}},
{"id":"n-2ed5342e","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .text file":"text/plain"}}},
{"id":"n-2f89d35f","guard":[["hasAny",["content","dot","files","name","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .dot files":"application/msword"}}},
{"id":"n-3505f3e9","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension vec":"application/vec+xml"}}},
{"id":"n-352ff5a5","guard":[["hasAny",["file","media","spx","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .spx file":"audio/ogg"}}},
{"id":"n-35a7dc76","guard":[["hasAny",["file","media","type","xlt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .xlt file":"application/vnd.ms-excel"}}},
{"id":"n-35aef1c3","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .dot files":"application/msword"}}},
{"id":"n-36641402","guard":[["hasAny",["content","evy","files","name","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .evy files":"application/x-envoy"}}},
{"id":"n-36bcb362","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .kml files":"application/vnd.google-earth.kml+xml"}}},
{"id":"n-3840586b","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .hdd files":"application/x-virtualbox-hdd"}}},
{"id":"n-38a8ca4b","guard":[["hasAny",["content","files","name","type","xls"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .xls files":"application/vnd.ms-excel"}}},
{"id":"n-39e32971","guard":[["hasAny",["content","files","jad","name","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .jad files":"text/vnd.sun.j2me.app-descriptor"}}},
{"id":"n-3a49061c","guard":[["hasAny",["extension","goes","m4u","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension m4u":"video/vnd.mpegurl"}}},
{"id":"n-3ae93d4e","guard":[["hasAny",["extension","goes","mime","p","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension p":"text/x-pascal"}}},
{"id":"n-3b181ab2","guard":[["hasAny",["content","files","name","type","ustar"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .ustar files":"application/x-ustar"}}},
{"id":"n-3b5339fc","guard":[["hasAny",["content","dataless","files","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .dataless files":"application/vnd.fdsn.seed"}}},
{"id":"n-3cb7db1d","guard":[["hasAny",["content","files","jad","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .jad files":"text/vnd.sun.j2me.app-descriptor"}}},
{"id":"n-40012923","guard":[["has","wmx"],["not",["colon"]]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-410e720e","guard":[["hasAny",["content","files","name","osfpvg","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml"}}},
{"id":"n-41ce9335","guard":[["hasAny",["file","gbr","media","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gbr file":"application/rpki-ghostbusters"}}},
{"id":"n-420bf27d","guard":[["hasAny",["extension","goes","mime","type","xhtml"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension xhtml":"application/xhtml+xml"}}},
{"id":"n-4294c4e5","guard":[["hasAny",["file","media","sbml","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .sbml file":"application/sbml+xml"}}},
{"id":"n-43605bfd","guard":[["hasAny",["content","dot","files","name","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .dot files":"application/msword"}}},
{"id":"n-43abe860","guard":[["hasAny",["extension","goes","mime","p","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension p":"text/x-pascal"}}},
{"id":"n-44a3aad1","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .vcard files":"text/vcard"}}},
{"id":"n-45cdc809","guard":[["hasAny",["extension","goes","mime","type","xhtml"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension xhtml":"application/xhtml+xml"}}},
{"id":"n-46007fad","guard":[["has","dvb"]],"pyramid":["render.template",{"lit":["video/vnd.",{"slot":0},".file"]},["sense.lastWord"]],"mem":null},
{"id":"n-461ec796","guard":[["hasAny",["file","fvt","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .fvt file":"video/vnd.fvt"}}},
{"id":"n-46f43c96","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .txf files":"application/vnd.mobius.txf"}}},
{"id":"n-4717a73e","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .yaml file":"text/yaml"}}},
{"id":"n-47c5bb59","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .spdx files":"text/spdx"}}},
{"id":"n-49071512","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gif file":"image/gif"}}},
{"id":"n-49710e7b","guard":[["hasAny",["content","files","name","type","xls"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .xls files":"application/vnd.ms-excel"}}},
{"id":"n-4a39750f","guard":[["hasAny",["extension","goes","mime","type","uvv"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvv":"video/vnd.dece.video"}}},
{"id":"n-4a6fcc7a","guard":[["hasAny",["file","gbr","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gbr file":"application/rpki-ghostbusters"}}},
{"id":"n-4e3956a5","guard":[["hasAny",["content","files","name","osfpvg","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml"}}},
{"id":"n-4eaddfc5","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .xls files":"application/vnd.ms-excel"}}},
{"id":"n-4ec3fc7a","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension onetoc":"application/onenote"}}},
{"id":"n-4f0ef214","guard":[["hasAny",["content","evy","files","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .evy files":"application/x-envoy"}}},
{"id":"n-5048e092","guard":[["hasAny",["file","media","mpkg","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .mpkg file":"application/vnd.apple.installer+xml"}}},
{"id":"n-527a2fe3","guard":[["hasAny",["content","files","kml","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .kml files":"application/vnd.google-earth.kml+xml"}}},
{"id":"n-530b894c","guard":[["has","n3"],["has","which"]],"pyramid":["render.template",{"lit":["text/",{"slot":0}]},["sense.numeral"]],"mem":null},
{"id":"n-5336125c","guard":[["hasAny",["extension","glb","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension glb":"model/gltf-binary"}}},
{"id":"n-53bca07c","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .jad files":"text/vnd.sun.j2me.app-descriptor"}}},
{"id":"n-53bf61f5","guard":[["hasAny",["file","media","rusd","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .rusd file":"application/route-usd+xml"}}},
{"id":"n-564d7d16","guard":[["hasAny",["extension","goes","mime","type","uvg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvg":"image/vnd.dece.graphic"}}},
{"id":"n-56db3005","guard":[["has","amlx"],["has","mime"],["not",["quoted"]]],"pyramid":["render.template",{"lit":["application/automationml-",{"slot":0},"+zip"]},["sense.lastWord"]],"mem":null},
{"id":"n-57990a5d","guard":[["hasAny",["amlx","extension","goes","mime","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension amlx":"application/automationml-amlx+zip"}}},
{"id":"n-57b6a061","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension onetoc":"application/onenote"}}},
{"id":"n-5890b69f","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension clkt":"application/vnd.crick.clicker.template"}}},
{"id":"n-58ed71b0","guard":[["hasAny",["au","extension","goes","mime","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension au":"audio/basic"}}},
{"id":"n-5a0f42d2","guard":[["hasAny",["content","files","hdd","name","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .hdd files":"application/x-virtualbox-hdd"}}},
{"id":"n-5b598459","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvg":"image/vnd.dece.graphic"}}},
{"id":"n-5c3dd275","guard":[["hasAny",["extension","goes","m4b","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension m4b":"audio/mp4"}}},
{"id":"n-5ce3ca75","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gbr file":"application/rpki-ghostbusters"}}},
{"id":"n-5d047205","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .prf files":"application/pics-rules"}}},
{"id":"n-5d681362","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .qam files":"application/vnd.epson.quickanime"}}},
{"id":"n-5db15290","guard":[["hasAny",["extension","goes","mime","ots","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template"}}},
{"id":"n-5e22ead0","guard":[["hasAny",["content","files","name","spdx","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .spdx files":"text/spdx"}}},
{"id":"n-5ec2ba98","guard":[["hasAny",["content","files","name","type","xpi"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .xpi files":"application/x-xpinstall"}}},
{"id":"n-5ee3ce54","guard":[["hasAny",["file","media","stpxz","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .stpxz file":"model/step-xml+zip"}}},
{"id":"n-5f1edcbf","guard":[["has","amlx"],["has","mime"]],"pyramid":["render.template",{"lit":["application/automationml-",{"slot":0},"+zip"]},["sense.lastWord"]],"mem":null},
{"id":"n-5faddbfa","guard":[["hasAny",["file","media","type","umj"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .umj file":"application/vnd.umajin"}}},
{"id":"n-6060f212","guard":[["hasAny",["arj","file","media","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .arj file":"application/x-arj"}}},
{"id":"n-606dcf1d","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .ustar files":"application/x-ustar"}}},
{"id":"n-60a8cc1b","guard":[["hasAny",["content","files","name","type","vcard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .vcard files":"text/vcard"}}},
{"id":"n-6131623c","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .dot files":"application/msword"}}},
{"id":"n-615353a9","guard":[["has","es3"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension es3":"application/vnd.eszigno3+xml"}}},
{"id":"n-618fa1b1","guard":[["hasAny",["file","gnumeric","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gnumeric file":"application/x-gnumeric"}}},
{"id":"n-61936c8e","guard":[["hasAny",["extension","goes","mime","type","vec"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension vec":"application/vec+xml"}}},
{"id":"n-656ad0f0","guard":[["hasAny",["content","dot","files","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .dot files":"application/msword"}}},
{"id":"n-6585ee6f","guard":[["hasAny",["file","media","rusd","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .rusd file":"application/route-usd+xml"}}},
{"id":"n-668cc032","guard":[["has","cjs"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .cjs files":"application/node"}}},
{"id":"n-67b39780","guard":[["hasAny",["file","media","sieve","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .sieve file":"application/sieve"}}},
{"id":"n-67fab870","guard":[["hasAny",["content","files","name","spdx","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .spdx files":"text/spdx"}}},
{"id":"n-6939b78c","guard":[["hasAny",["extension","goes","mime","spl","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension spl":"application/x-futuresplash"}}},
{"id":"n-694b75e8","guard":[["hasAny",["file","media","type","yaml"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .yaml file":"text/yaml"}}},
{"id":"n-69c3aac4","guard":[["hasAny",["file","media","texi","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .texi file":"application/x-texinfo"}}},
{"id":"n-69f18d3b","guard":[["has","cdmid"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension cdmid":"application/cdmi-domain"}}},
{"id":"n-69f9a182","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension m4b":"audio/mp4"}}},
{"id":"n-6a92ce2f","guard":[["hasAny",["file","media","type","yaml"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .yaml file":"text/yaml"}}},
{"id":"n-6aa5eb98","guard":[["hasAny",["au","extension","goes","mime","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension au":"audio/basic"}}},
{"id":"n-6b488fbb","guard":[["hasAny",["content","files","name","qxb","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .qxb files":"application/vnd.quark.quarkxpress"}}},
{"id":"n-6cd3eb71","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension ppt":"application/vnd.ms-powerpoint"}}},
{"id":"n-6ce90f5b","guard":[["has","amlx"],["has","mime"],["not",["colon"]]],"pyramid":["render.template",{"lit":["application/automationml-",{"slot":0},"+zip"]},["sense.lastWord"]],"mem":null},
{"id":"n-6cf040c2","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .nsc file":"application/x-conference"}}},
{"id":"n-6dfeb363","guard":[["hasAny",["file","media","stpxz","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .stpxz file":"model/step-xml+zip"}}},
{"id":"n-6e5ccfeb","guard":[["hasAny",["file","ipynb","media","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-6ec97980","guard":[["hasAny",["file","media","nsc","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .nsc file":"application/x-conference"}}},
{"id":"n-6ed89bfd","guard":[["hasAny",["content","files","name","ttc","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .ttc files":"font/collection"}}},
{"id":"n-6f56d1a4","guard":[["hasAny",["content","files","name","type","xpi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .xpi files":"application/x-xpinstall"}}},
{"id":"n-6f7c52ac","guard":[["hasAny",["file","gif","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gif file":"image/gif"}}},
{"id":"n-6fb6da14","guard":[["hasAny",["content","files","name","qxb","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .qxb files":"application/vnd.quark.quarkxpress"}}},
{"id":"n-72153be1","guard":[["hasAny",["file","media","type","xlt"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .xlt file":"application/vnd.ms-excel"}}},
{"id":"n-7244aa94","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .xlt file":"application/vnd.ms-excel"}}},
{"id":"n-73521c2c","guard":[["hasAny",["file","media","mpkg","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .mpkg file":"application/vnd.apple.installer+xml"}}},
{"id":"n-741281be","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .sieve file":"application/sieve"}}},
{"id":"n-75556efd","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvv":"video/vnd.dece.video"}}},
{"id":"n-77926ad9","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .ustar files":"application/x-ustar"}}},
{"id":"n-77e5eec6","guard":[["hasAny",["extension","goes","mime","type","uvg"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvg":"image/vnd.dece.graphic"}}},
{"id":"n-7a9e09fa","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension sdc":"application/vnd.stardivision.calc"}}},
{"id":"n-7d24cdb9","guard":[["hasAny",["file","media","oth","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .oth file":"application/vnd.oasis.opendocument.text-web"}}},
{"id":"n-7d2d007e","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension es3":"application/vnd.eszigno3+xml"}}},
{"id":"n-7d33be0d","guard":[["has","wmx"],["not",["quoted"]]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-7ed34778","guard":[["has","h261"]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-7f631d8e","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .xpi files":"application/x-xpinstall"}}},
{"id":"n-7fd07187","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension au":"audio/basic"}}},
{"id":"n-7fee6b06","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .kml files":"application/vnd.google-earth.kml+xml"}}},
{"id":"n-81ae4bce","guard":[["hasAny",["extension","goes","mime","p","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension p":"text/x-pascal"}}},
{"id":"n-82c45800","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .fvt file":"video/vnd.fvt"}}},
{"id":"n-8410e7e1","guard":[["hasAny",["extension","goes","lostxml","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension lostxml":"application/lost+xml"}}},
{"id":"n-8437d1ae","guard":[["hasAny",["file","gif","media","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gif file":"image/gif"}}},
{"id":"n-86c9f8ee","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .vcard files":"text/vcard"}}},
{"id":"n-888a930a","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .stpxz file":"model/step-xml+zip"}}},
{"id":"n-88f42006","guard":[["hasAny",["file","fvt","media","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .fvt file":"video/vnd.fvt"}}},
{"id":"n-89716782","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension dvb":"video/vnd.dvb.file"}}},
{"id":"n-89bfc87c","guard":[["hasAny",["content","files","name","type","wpd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .wpd files":"application/vnd.wordperfect"}}},
{"id":"n-8a7a649e","guard":[["has","amlx"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension amlx":"application/automationml-amlx+zip"}}},
{"id":"n-8b874920","guard":[["hasAny",["content","files","jad","name","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .jad files":"text/vnd.sun.j2me.app-descriptor"}}},
{"id":"n-8bbbc68d","guard":[["hasAny",["file","ipynb","media","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-8da37dbf","guard":[["hasAny",["content","files","name","pas","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .pas files":"text/x-pascal"}}},
{"id":"n-8e4efcdd","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension spl":"application/x-futuresplash"}}},
{"id":"n-8e9b67eb","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .texi file":"application/x-texinfo"}}},
{"id":"n-8e9f73ac","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gif file":"image/gif"}}},
{"id":"n-8fd4498b","guard":[["hasAny",["file","media","sieve","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .sieve file":"application/sieve"}}},
{"id":"n-903a39d0","guard":[["hasAny",["content","fhc","files","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .fhc files":"image/x-freehand"}}},
{"id":"n-90440ab1","guard":[["hasAny",["content","files","name","txf","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .txf files":"application/vnd.mobius.txf"}}},
{"id":"n-92e9234e","guard":[["has","type"],["nums>=",1]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml","which MIME type goes with the extension xhtml":"application/xhtml+xml","what is the media type of a .gnumeric file":"application/x-gnumeric","which MIME type goes with the extension me":"text/troff","what is the media type of a .xlt file":"application/vnd.ms-excel","what is the media type of a .ez file":"application/andrew-inset","which MIME type goes with the extension gxf":"application/gxf","name the content type for .qam files":"application/vnd.epson.quickanime","what is the media type of a .oth file":"application/vnd.oasis.opendocument.text-web","what is the media type of a .texi file":"application/x-texinfo","name the content type for .frame files":"application/vnd.framemaker","name the content type for .ttc files":"font/collection","name the content type for .dataless files":"application/vnd.fdsn.seed","name the content type for .wpd files":"application/vnd.wordperfect","name the content type for .qxb files":"application/vnd.quark.quarkxpress","what is the media type of a .webmanifest file":"application/manifest+json","which MIME type goes with the extension es3":"application/vnd.eszigno3+xml","which MIME type goes with the extension glb":"model/gltf-binary","name the content type for .ustar files":"application/x-ustar","name the content type for .jad files":"text/vnd.sun.j2me.app-descriptor","which MIME type goes with the extension m4u":"video/vnd.mpegurl","which MIME type goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template","what is the media type of a .h file":"text/x-c","name the content type for .xpi files":"application/x-xpinstall","name the content type for .kml files":"application/vnd.google-earth.kml+xml","which MIME type goes with the extension stpnc":"model/step","which MIME type goes with the extension rsheet":"application/urc-ressheet+xml","name the content type for .prf files":"application/pics-rules","what is the media type of a .fvt file":"video/vnd.fvt","what is the media type of a .stw file":"application/vnd.sun.xml.writer.template","what is the media type of a .edx file":"application/vnd.novadigm.edx","what is the media type of a .mvt file":"application/vnd.mapbox-vector-tile","what is the media type of a .sbml file":"application/sbml+xml","name the content type for .hdf files":"application/x-hdf","what is the media type of a .stpxz file":"model/step-xml+zip","what is the media type of a .rusd file":"application/route-usd+xml","what is the media type of a .gif file":"image/gif","what is the media type of a .mpkg file":"application/vnd.apple.installer+xml","which MIME type goes with the extension uvv":"video/vnd.dece.video","which MIME type goes with the extension lostxml":"application/lost+xml","which MIME type goes with the extension au":"audio/basic","name the content type for .evy files":"application/x-envoy","name the content type for .txf files":"application/vnd.mobius.txf","which MIME type goes with the extension 3ds":"image/x-3ds","what is the media type of a .jais file":"image/jais","which MIME type goes with the extension wmx":"video/x-ms-wmx","which MIME type goes with the extension uvg":"image/vnd.dece.graphic","name the content type for .cjs files":"application/node","name the content type for .held files":"application/atsc-held+xml","name the content type for .less files":"text/less","name the content type for .u8mdn files":"message/global-disposition-notification","name the content type for .pas files":"text/x-pascal","what is the media type of a .xo file":"application/vnd.olpc-sugar","what is the media type of a .spx file":"audio/ogg","what is the media type of a .nsc file":"application/x-conference","which MIME type goes with the extension spl":"application/x-futuresplash","name the content type for .tpl files":"application/vnd.groove-tool-template","which MIME type goes with the extension ppt":"application/vnd.ms-powerpoint","which MIME type goes with the extension cdmid":"application/cdmi-domain","what is the media type of a .ova file":"application/x-virtualbox-ova","name the content type for .spdx files":"text/spdx","what is the media type of a .arj file":"application/x-arj","what is the media type of a .umj file":"application/vnd.umajin","name the content type for .vtx files":"application/vnd.visio","which MIME type goes with the extension oas":"application/vnd.fujitsu.oasys","what is the media type of a .rdz file":"application/vnd.data-vision.rdz","name the content type for .dot files":"application/msword","name the content type for .tsd files":"application/timestamped-data","which MIME type goes with the extension m4b":"audio/mp4","which MIME type goes with the extension amlx":"application/automationml-amlx+zip","what is the media type of a .yaml file":"text/yaml","what is the media type of a .sieve file":"application/sieve","which MIME type goes with the extension exr":"image/aces","name the content type for .fhc files":"image/x-freehand","which MIME type goes with the extension n3":"text/n3","name the content type for .vcard files":"text/vcard","which MIME type goes with the extension p":"text/x-pascal","which MIME type goes with the extension sfv":"text/x-sfv","which MIME type goes with the extension vec":"application/vec+xml","which MIME type goes with the extension sdc":"application/vnd.stardivision.calc","name the content type for .mmf files":"application/vnd.smaf","which MIME type goes with the extension dvb":"video/vnd.dvb.file","name the content type for .spf files":"application/vnd.yamaha.smaf-phrase","name the content type for .c4p files":"application/vnd.clonk.c4group","what is the media type of a .rq file":"application/sparql-query","name the content type for .ice files":"x-conference/x-cooltalk","which MIME type goes with the extension h261":"video/h261","name the content type for .hdd files":"application/x-virtualbox-hdd","which MIME type goes with the extension gph":"application/vnd.flographit","what is the media type of a .text file":"text/plain","what is the media type of a .pic file":"image/x-pict","what is the media type of a .gbr file":"application/rpki-ghostbusters","what is the media type of a .wmlc file":"application/vnd.wap.wmlc","what is the media type of a .mxs file":"application/vnd.triscape.mxs","which MIME type goes with the extension clkt":"application/vnd.crick.clicker.template","which MIME type goes with the extension wbxml":"application/vnd.wap.wbxml","which MIME type goes with the extension onetoc":"application/onenote","name the content type for .xls files":"application/vnd.ms-excel","what is the media type of a .x3dbz file":"model/x3d+binary","what is the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-953ede29","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .hdd files":"application/x-virtualbox-hdd"}}},
{"id":"n-95ef3394","guard":[["hasAny",["clkt","extension","goes","mime","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension clkt":"application/vnd.crick.clicker.template"}}},
{"id":"n-966c16f3","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .pas files":"text/x-pascal"}}},
{"id":"n-96c15ce8","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension m4u":"video/vnd.mpegurl"}}},
{"id":"n-96ed8d5d","guard":[["hasAny",["content","files","frame","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .frame files":"application/vnd.framemaker"}}},
{"id":"n-9774dfe8","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .jad files":"text/vnd.sun.j2me.app-descriptor"}}},
{"id":"n-992f0781","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .qam files":"application/vnd.epson.quickanime"}}},
{"id":"n-993ec2e3","guard":[["has","gxf"]],"pyramid":["render.template",{"lit":["application/",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-99a9f253","guard":[["hasAny",["file","h","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .h file":"text/x-c"}}},
{"id":"n-9ab11bed","guard":[["hasAny",["extension","goes","gxf","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension gxf":"application/gxf"}}},
{"id":"n-9ac7a56f","guard":[["hasAny",["dvb","extension","goes","mime","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension dvb":"video/vnd.dvb.file"}}},
{"id":"n-9b3a330a","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .less files":"text/less"}}},
{"id":"n-9c4340ec","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvv":"video/vnd.dece.video"}}},
{"id":"n-9c5bfe5e","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .txf files":"application/vnd.mobius.txf"}}},
{"id":"n-9ce46d26","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .spx file":"audio/ogg"}}},
{"id":"n-9d722ac2","guard":[["has","h261"],["not",["quoted"]]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["sense.numeral"]],"mem":null},
{"id":"n-9e22b102","guard":[["hasAny",["file","media","texi","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .texi file":"application/x-texinfo"}}},
{"id":"n-9e4dd8de","guard":[["hasAny",["extension","goes","mime","type","wbxml"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension wbxml":"application/vnd.wap.wbxml"}}},
{"id":"n-9e5584c5","guard":[["hasAny",["content","dataless","files","name","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .dataless files":"application/vnd.fdsn.seed"}}},
{"id":"n-9e5a2188","guard":[["hasAny",["content","files","name","type","vcard"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .vcard files":"text/vcard"}}},
{"id":"n-9e6e5b15","guard":[["hasAny",["extension","glb","goes","mime","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension glb":"model/gltf-binary"}}},
{"id":"n-9e8e27c5","guard":[["hasAny",["file","media","type","webmanifest"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .webmanifest file":"application/manifest+json"}}},
{"id":"n-9ee97aab","guard":[["hasAny",["content","files","name","type","xls"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .xls files":"application/vnd.ms-excel"}}},
{"id":"n-9f019dd8","guard":[["hasAny",["extension","goes","mime","type","uvv"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvv":"video/vnd.dece.video"}}},
{"id":"n-9fefd953","guard":[["has","ez"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .ez file":"application/andrew-inset"}}},
{"id":"n-a10d2a0a","guard":[["hasAny",["file","media","text","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .text file":"text/plain"}}},
{"id":"n-a1b0d566","guard":[["hasAny",["c4p","content","files","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .c4p files":"application/vnd.clonk.c4group"}}},
{"id":"n-a22d87db","guard":[["hasAny",["cdmid","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension cdmid":"application/cdmi-domain"}}},
{"id":"n-a270adb8","guard":[["hasAny",["extension","goes","mime","rsheet","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension rsheet":"application/urc-ressheet+xml"}}},
{"id":"n-a28c9b61","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .mpkg file":"application/vnd.apple.installer+xml"}}},
{"id":"n-a2d3ffe0","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml"}}},
{"id":"n-a3868cb9","guard":[["hasAny",["arj","file","media","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .arj file":"application/x-arj"}}},
{"id":"n-a7187ba2","guard":[["hasAny",["content","files","ice","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .ice files":"x-conference/x-cooltalk"}}},
{"id":"n-a7d02d14","guard":[["hasAny",["content","files","hdf","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .hdf files":"application/x-hdf"}}},
{"id":"n-a87d2c4d","guard":[["hasAny",["file","media","type","wmlc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .wmlc file":"application/vnd.wap.wmlc"}}},
{"id":"n-a88c1206","guard":[["hasAny",["extension","goes","mime","oas","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension oas":"application/vnd.fujitsu.oasys"}}},
{"id":"n-a8b57581","guard":[["hasAny",["amlx","extension","goes","mime","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension amlx":"application/automationml-amlx+zip"}}},
{"id":"n-a8d94352","guard":[["hasAny",["content","files","name","type","xpi"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .xpi files":"application/x-xpinstall"}}},
{"id":"n-ac64e837","guard":[["hasAny",["file","media","mvt","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .mvt file":"application/vnd.mapbox-vector-tile"}}},
{"id":"n-ac7dfb27","guard":[["hasAny",["exr","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension exr":"image/aces"}}},
{"id":"n-ae1dfa80","guard":[["hasAny",["extension","goes","mime","stpnc","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension stpnc":"model/step"}}},
{"id":"n-af4f3169","guard":[["hasAny",["content","files","mmf","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .mmf files":"application/vnd.smaf"}}},
{"id":"n-afd9a95c","guard":[["hasAny",["extension","goes","mime","ots","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template"}}},
{"id":"n-b1d34340","guard":[["hasAny",["file","media","rdz","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .rdz file":"application/vnd.data-vision.rdz"}}},
{"id":"n-b1d53bd6","guard":[["hasAny",["clkt","extension","goes","mime","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension clkt":"application/vnd.crick.clicker.template"}}},
{"id":"n-b293be5b","guard":[["hasAny",["extension","goes","m4u","mime","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension m4u":"video/vnd.mpegurl"}}},
{"id":"n-b35bd1bd","guard":[["hasAny",["extension","goes","gph","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension gph":"application/vnd.flographit"}}},
{"id":"n-b50daeed","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension xhtml":"application/xhtml+xml"}}},
{"id":"n-b62b6012","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension m4u":"video/vnd.mpegurl"}}},
{"id":"n-b6e595bb","guard":[["hasAny",["file","media","mxs","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .mxs file":"application/vnd.triscape.mxs"}}},
{"id":"n-b85d241a","guard":[["hasAny",["content","files","name","spf","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .spf files":"application/vnd.yamaha.smaf-phrase"}}},
{"id":"n-b8800219","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .hdf files":"application/x-hdf"}}},
{"id":"n-b8e24341","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .umj file":"application/vnd.umajin"}}},
{"id":"n-b9435033","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .qxb files":"application/vnd.quark.quarkxpress"}}},
{"id":"n-b96278b5","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-b9fafa78","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .xlt file":"application/vnd.ms-excel"}}},
{"id":"n-ba5698d2","guard":[["hasAny",["dvb","extension","goes","mime","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension dvb":"video/vnd.dvb.file"}}},
{"id":"n-bac964d5","guard":[["hasAny",["content","files","name","qam","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .qam files":"application/vnd.epson.quickanime"}}},
{"id":"n-baf888b9","guard":[["hasAny",["file","media","text","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .text file":"text/plain"}}},
{"id":"n-bb0eccc4","guard":[["hasAny",["content","files","held","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .held files":"application/atsc-held+xml"}}},
{"id":"n-bb8a1346","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .text file":"text/plain"}}},
{"id":"n-bbbebcdd","guard":[["hasAny",["extension","goes","mime","n3","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension n3":"text/n3"}}},
{"id":"n-bc265843","guard":[["hasAny",["3ds","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension 3ds":"image/x-3ds"}}},
{"id":"n-bcf0f38d","guard":[["has","h261"],["not",["colon"]]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["sense.numeral"]],"mem":null},
{"id":"n-bdcb4995","guard":[["hasAny",["cjs","content","files","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .cjs files":"application/node"}}},
{"id":"n-beba3e37","guard":[["hasAny",["es3","extension","goes","mime","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension es3":"application/vnd.eszigno3+xml"}}},
{"id":"n-bed55f5a","guard":[["hasAny",["content","files","hdd","name","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .hdd files":"application/x-virtualbox-hdd"}}},
{"id":"n-bff7fb75","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template"}}},
{"id":"n-c0da5c2f","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .dataless files":"application/vnd.fdsn.seed"}}},
{"id":"n-c134742d","guard":[["hasAny",["content","files","name","tpl","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .tpl files":"application/vnd.groove-tool-template"}}},
{"id":"n-c462ca26","guard":[["hasAny",["extension","goes","mime","type","xhtml"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension xhtml":"application/xhtml+xml"}}},
{"id":"n-c568f5d9","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .oth file":"application/vnd.oasis.opendocument.text-web"}}},
{"id":"n-c6324a04","guard":[["hasAny",["extension","goes","m4u","mime","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension m4u":"video/vnd.mpegurl"}}},
{"id":"n-c6c49486","guard":[["has","type"],["nums>=",1]],"pyramid":["render.str",["memory.lookup",["sense.numeral"]]],"mem":{"table":{"es3":"application/vnd.eszigno3+xml","m4u":"video/vnd.mpegurl","3ds":"image/x-3ds","u8mdn":"message/global-disposition-notification","m4b":"audio/mp4","n3":"text/n3","c4p":"application/vnd.clonk.c4group","h261":"video/h261","x3dbz":"model/x3d+binary"}}},
{"id":"n-c703f0c1","guard":[["hasAny",["extension","goes","mime","sdc","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension sdc":"application/vnd.stardivision.calc"}}},
{"id":"n-c7e7b8ee","guard":[["hasAny",["ez","file","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .ez file":"application/andrew-inset"}}},
{"id":"n-c86b24e9","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .rdz file":"application/vnd.data-vision.rdz"}}},
{"id":"n-c8b0dcd4","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .qxb files":"application/vnd.quark.quarkxpress"}}},
{"id":"n-c962eef8","guard":[["has","dvb"],["not",["quoted"]]],"pyramid":["render.template",{"lit":["video/vnd.",{"slot":0},".file"]},["sense.lastWord"]],"mem":null},
{"id":"n-caea38fa","guard":[["hasAny",["extension","goes","mime","type","uvv"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvv":"video/vnd.dece.video"}}},
{"id":"n-cb285222","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension p":"text/x-pascal"}}},
{"id":"n-cc1943bb","guard":[["hasAny",["file","media","sbml","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .sbml file":"application/sbml+xml"}}},
{"id":"n-cc2150b6","guard":[["hasAny",["content","files","name","type","ustar"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .ustar files":"application/x-ustar"}}},
{"id":"n-cd66c579","guard":[["hasAny",["file","jais","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .jais file":"image/jais"}}},
{"id":"n-cd9da7d3","guard":[["hasAny",["extension","goes","mime","type","wmx"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension wmx":"video/x-ms-wmx"}}},
{"id":"n-cf3753ae","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .rusd file":"application/route-usd+xml"}}},
{"id":"n-cff98812","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .texi file":"application/x-texinfo"}}},
{"id":"n-cff9969e","guard":[["hasAny",["file","media","ova","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .ova file":"application/x-virtualbox-ova"}}},
{"id":"n-d02419a1","guard":[["hasAny",["content","files","name","txf","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .txf files":"application/vnd.mobius.txf"}}},
{"id":"n-d0b194f7","guard":[["hasAny",["file","media","type","yaml"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .yaml file":"text/yaml"}}},
{"id":"n-d1aaa73d","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gnumeric file":"application/x-gnumeric"}}},
{"id":"n-d235eb49","guard":[["hasAny",["content","files","name","type","ustar"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .ustar files":"application/x-ustar"}}},
{"id":"n-d251e449","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .evy files":"application/x-envoy"}}},
{"id":"n-d2c77ced","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .sbml file":"application/sbml+xml"}}},
{"id":"n-d2ed27fa","guard":[["hasAny",["extension","glb","goes","mime","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension glb":"model/gltf-binary"}}},
{"id":"n-d4d9ec66","guard":[["has","n3"],["has","which"]],"pyramid":["render.template",{"lit":["text/",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-d586533f","guard":[["hasAny",["file","media","type","x3dbz"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .x3dbz file":"model/x3d+binary"}}},
{"id":"n-d5a113bd","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension p":"text/x-pascal"}}},
{"id":"n-d734ecc1","guard":[["hasAny",["content","files","name","spdx","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .spdx files":"text/spdx"}}},
{"id":"n-d7380e70","guard":[["hasAny",["content","files","name","type","u8mdn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .u8mdn files":"message/global-disposition-notification"}}},
{"id":"n-d7be764d","guard":[["hasAny",["extension","goes","m4b","mime","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension m4b":"audio/mp4"}}},
{"id":"n-d8e27ab6","guard":[["hasAny",["extension","goes","mime","type","vec"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension vec":"application/vec+xml"}}},
{"id":"n-d8ff6c11","guard":[["hasAny",["extension","goes","m4b","mime","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension m4b":"audio/mp4"}}},
{"id":"n-d94d7101","guard":[["has","au"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension au":"audio/basic"}}},
{"id":"n-d9be5a6e","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension amlx":"application/automationml-amlx+zip"}}},
{"id":"n-d9f37b0e","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .yaml file":"text/yaml"}}},
{"id":"n-d9fa0a7d","guard":[["hasAny",["extension","goes","mime","spl","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension spl":"application/x-futuresplash"}}},
{"id":"n-db471311","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .dataless files":"application/vnd.fdsn.seed"}}},
{"id":"n-dd581f24","guard":[["hasAny",["file","media","type","xo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .xo file":"application/vnd.olpc-sugar"}}},
{"id":"n-dd9a9c62","guard":[["hasAny",["file","gif","media","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gif file":"image/gif"}}},
{"id":"n-ddbdf2eb","guard":[["hasAny",["content","files","name","tsd","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .tsd files":"application/timestamped-data"}}},
{"id":"n-de983cc6","guard":[["hasAny",["edx","file","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .edx file":"application/vnd.novadigm.edx"}}},
{"id":"n-ded5cdac","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .mpkg file":"application/vnd.apple.installer+xml"}}},
{"id":"n-def463ac","guard":[["hasAny",["extension","goes","h261","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension h261":"video/h261"}}},
{"id":"n-df43e3d9","guard":[["hasAny",["file","media","pic","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .pic file":"image/x-pict"}}},
{"id":"n-e099d93b","guard":[["hasAny",["content","files","name","qxb","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .qxb files":"application/vnd.quark.quarkxpress"}}},
{"id":"n-e360826c","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension stpnc":"model/step"}}},
{"id":"n-e47bf2f8","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .tsd files":"application/timestamped-data"}}},
{"id":"n-e4c36255","guard":[["hasAny",["extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension me":"text/troff"}}},
{"id":"n-e7d8fe06","guard":[["hasAny",["extension","goes","mime","ppt","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension ppt":"application/vnd.ms-powerpoint"}}},
{"id":"n-e8a3607b","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .umj file":"application/vnd.umajin"}}},
{"id":"n-e9022966","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension xhtml":"application/xhtml+xml"}}},
{"id":"n-e9497a9a","guard":[["has","dvb"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension dvb":"video/vnd.dvb.file"}}},
{"id":"n-ea32881d","guard":[["hasAny",["content","files","name","type","vtx"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .vtx files":"application/vnd.visio"}}},
{"id":"n-ecd9b6b2","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .stpxz file":"model/step-xml+zip"}}},
{"id":"n-ee26f637","guard":[["hasAny",["file","media","stw","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .stw file":"application/vnd.sun.xml.writer.template"}}},
{"id":"n-ef24c753","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .evy files":"application/x-envoy"}}},
{"id":"n-f0137f2e","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .sbml file":"application/sbml+xml"}}},
{"id":"n-f1917bc1","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gbr file":"application/rpki-ghostbusters"}}},
{"id":"n-f3b9b6d8","guard":[["hasAny",["file","media","stpxz","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .stpxz file":"model/step-xml+zip"}}},
{"id":"n-f4c05e04","guard":[["hasAny",["file","media","rq","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .rq file":"application/sparql-query"}}},
{"id":"n-f5cfd8c5","guard":[["hasAny",["content","files","name","prf","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .prf files":"application/pics-rules"}}},
{"id":"n-f743bc88","guard":[["hasAny",["file","media","sieve","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .sieve file":"application/sieve"}}},
{"id":"n-f74772fb","guard":[["has","3ds"]],"pyramid":["render.template",{"lit":["image/x-",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-f777b4b5","guard":[["hasAny",["content","files","less","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .less files":"text/less"}}},
{"id":"n-f7a6235a","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .held files":"application/atsc-held+xml"}}},
{"id":"n-f7f93ff6","guard":[["hasAny",["file","gnumeric","media","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gnumeric file":"application/x-gnumeric"}}},
{"id":"n-f834f004","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-f8fd849c","guard":[["hasAny",["file","gbr","media","type"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gbr file":"application/rpki-ghostbusters"}}},
{"id":"n-f93d9239","guard":[["hasAny",["content","files","name","ttc","type"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .ttc files":"font/collection"}}},
{"id":"n-f9419df3","guard":[["has","sfv"],["not",["quoted"]]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-fa01e600","guard":[["hasAny",["extension","goes","mime","sfv","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension sfv":"text/x-sfv"}}},
{"id":"n-faaa6856","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .rq file":"application/sparql-query"}}},
{"id":"n-fd131b40","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .xpi files":"application/x-xpinstall"}}},
{"id":"n-fe292b7e","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .rusd file":"application/route-usd+xml"}}},
{"id":"n-ffa1e4fb","guard":[["hasAny",["file","media","type","xlt"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .xlt file":"application/vnd.ms-excel"}}},
{"id":"n-fff4911d","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .sieve file":"application/sieve"}}},
{"id":"n-012423d4","guard":[["hasAny",["invert case","sfv","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0a5b3a0a","guard":[["hasAny",["shortest","shortest one","shortest word","txf"]]],"pyramid":["render.template",{"lit":["application/vnd.mobius.",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0ee249b0","guard":[["hasAny",["3ds","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["image/x-",{"slot":0}]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0fc65410","guard":[["hasAny",["3ds","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["image/x-",{"slot":0}]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-2b3067cb","guard":[["hasAny",["no vowels","remove vowels","wbxml","without vowels"]]],"pyramid":["render.template",{"lit":["application/vnd.wap.",{"slot":0}]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-416263f3","guard":[["hasAny",["delete","pas","strip out"]],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"text/x-pascal"},["sense.lastWord"]]],"mem":null},
{"id":"n-4802cfd5","guard":[["hasAny",["gnumeric","longest one","longest word"]]],"pyramid":["render.template",{"lit":["application/x-",{"slot":0}]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-48f12f34","guard":[["hasAny",["pas","separate by","split by"]],["has","name"]],"pyramid":["render.and",["transform.split",{"lit":"text/x-pascal"},["sense.lastWord"]]],"mem":null},
{"id":"n-5250d214","guard":[["hasAny",["h261","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-566897cc","guard":[["hasAny",["pas","separate by","split by"]],["has","name"]],"pyramid":["render.lines",["transform.split",{"lit":"text/x-pascal"},["sense.lastWord"]]],"mem":null},
{"id":"n-574f255d","guard":[["hasAny",["rdz","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["application/vnd.data-vision.",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5a56c598","guard":[["hasAny",["dvb","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["video/vnd.",{"slot":0},".file"]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-5fc6a8ac","guard":[["hasAny",["shortest","shortest one","shortest word","vec"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6ac344c0","guard":[["hasAny",["3ds","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["image/x-",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-74a90a9c","guard":[["hasAny",["no vowels","remove vowels","without vowels","wmx"]]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-78008908","guard":[["hasAny",["gxf","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0}]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7a48c3e8","guard":[["hasAny",["edx","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["application/vnd.novadigm.",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-844751a7","guard":[["hasAny",["mxs","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["application/vnd.triscape.",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8bf97714","guard":[["has","type"],["nums>=",1]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"type"}]]],"mem":{"table":{"for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml","goes with the extension xhtml":"application/xhtml+xml","of a .gnumeric file":"application/x-gnumeric","goes with the extension me":"text/troff","of a .xlt file":"application/vnd.ms-excel","of a .ez file":"application/andrew-inset","goes with the extension gxf":"application/gxf","for .qam files":"application/vnd.epson.quickanime","of a .oth file":"application/vnd.oasis.opendocument.text-web","of a .texi file":"application/x-texinfo","for .frame files":"application/vnd.framemaker","for .ttc files":"font/collection","for .dataless files":"application/vnd.fdsn.seed","for .wpd files":"application/vnd.wordperfect","for .qxb files":"application/vnd.quark.quarkxpress","of a .webmanifest file":"application/manifest+json","goes with the extension es3":"application/vnd.eszigno3+xml","goes with the extension glb":"model/gltf-binary","for .ustar files":"application/x-ustar","for .jad files":"text/vnd.sun.j2me.app-descriptor","goes with the extension m4u":"video/vnd.mpegurl","goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template","of a .h file":"text/x-c","for .xpi files":"application/x-xpinstall","for .kml files":"application/vnd.google-earth.kml+xml","goes with the extension stpnc":"model/step","goes with the extension rsheet":"application/urc-ressheet+xml","for .prf files":"application/pics-rules","of a .fvt file":"video/vnd.fvt","of a .stw file":"application/vnd.sun.xml.writer.template","of a .edx file":"application/vnd.novadigm.edx","of a .mvt file":"application/vnd.mapbox-vector-tile","of a .sbml file":"application/sbml+xml","for .hdf files":"application/x-hdf","of a .stpxz file":"model/step-xml+zip","of a .rusd file":"application/route-usd+xml","of a .gif file":"image/gif","of a .mpkg file":"application/vnd.apple.installer+xml","goes with the extension uvv":"video/vnd.dece.video","goes with the extension lostxml":"application/lost+xml","goes with the extension au":"audio/basic","for .evy files":"application/x-envoy","for .txf files":"application/vnd.mobius.txf","goes with the extension 3ds":"image/x-3ds","of a .jais file":"image/jais","goes with the extension wmx":"video/x-ms-wmx","goes with the extension uvg":"image/vnd.dece.graphic","for .cjs files":"application/node","for .held files":"application/atsc-held+xml","for .less files":"text/less","for .u8mdn files":"message/global-disposition-notification","for .pas files":"text/x-pascal","of a .xo file":"application/vnd.olpc-sugar","of a .spx file":"audio/ogg","of a .nsc file":"application/x-conference","goes with the extension spl":"application/x-futuresplash","for .tpl files":"application/vnd.groove-tool-template","goes with the extension ppt":"application/vnd.ms-powerpoint","goes with the extension cdmid":"application/cdmi-domain","of a .ova file":"application/x-virtualbox-ova","for .spdx files":"text/spdx","of a .arj file":"application/x-arj","of a .umj file":"application/vnd.umajin","for .vtx files":"application/vnd.visio","goes with the extension oas":"application/vnd.fujitsu.oasys","of a .rdz file":"application/vnd.data-vision.rdz","for .dot files":"application/msword","for .tsd files":"application/timestamped-data","goes with the extension m4b":"audio/mp4","goes with the extension amlx":"application/automationml-amlx+zip","of a .yaml file":"text/yaml","of a .sieve file":"application/sieve","goes with the extension exr":"image/aces","for .fhc files":"image/x-freehand","goes with the extension n3":"text/n3","for .vcard files":"text/vcard","goes with the extension p":"text/x-pascal","goes with the extension sfv":"text/x-sfv","goes with the extension vec":"application/vec+xml","goes with the extension sdc":"application/vnd.stardivision.calc","for .mmf files":"application/vnd.smaf","goes with the extension dvb":"video/vnd.dvb.file","for .spf files":"application/vnd.yamaha.smaf-phrase","for .c4p files":"application/vnd.clonk.c4group","of a .rq file":"application/sparql-query","for .ice files":"x-conference/x-cooltalk","goes with the extension h261":"video/h261","for .hdd files":"application/x-virtualbox-hdd","goes with the extension gph":"application/vnd.flographit","of a .text file":"text/plain","of a .pic file":"image/x-pict","of a .gbr file":"application/rpki-ghostbusters","of a .wmlc file":"application/vnd.wap.wmlc","of a .mxs file":"application/vnd.triscape.mxs","goes with the extension clkt":"application/vnd.crick.clicker.template","goes with the extension wbxml":"application/vnd.wap.wbxml","goes with the extension onetoc":"application/onenote","for .xls files":"application/vnd.ms-excel","of a .x3dbz file":"model/x3d+binary","of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-96b01774","guard":[["hasAny",["amlx","capitalise","capitalize","capitalize each word","title case"]],["has","mime"]],"pyramid":["render.template",{"lit":["application/automationml-",{"slot":0},"+zip"]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9c9f8381","guard":[["hasAny",["no vowels","remove vowels","sfv","without vowels"]]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-a4ba0f8a","guard":[["hasAny",["gxf","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a5e01b52","guard":[["hasAny",["no vowels","remove vowels","without vowels","xhtml"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-ad2217e9","guard":[["hasAny",["gxf","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0}]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-b5bd8219","guard":[["hasAny",["dvb","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["video/vnd.",{"slot":0},".file"]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b706551b","guard":[["hasAny",["invert case","swap case","toggle case","wbxml"]]],"pyramid":["render.template",{"lit":["application/vnd.wap.",{"slot":0}]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ba86e464","guard":[["hasAny",["pas","separate by","split by"]],["has","name"]],"pyramid":["render.list",["transform.split",{"lit":"text/x-pascal"},["sense.lastWord"]]],"mem":null},
{"id":"n-bdaa339b","guard":[["hasAny",["sfv","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bdb45451","guard":[["hasAny",["invert case","swap case","toggle case","wmx"]]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c634d367","guard":[["hasAny",["shortest","shortest one","shortest word","wmx"]]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d28f8fd2","guard":[["hasAny",["kml","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["application/vnd.google-earth.",{"slot":0},"+xml"]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d66a55ed","guard":[["hasAny",["amlx","invert case","swap case","toggle case"]],["has","mime"]],"pyramid":["render.template",{"lit":["application/automationml-",{"slot":0},"+zip"]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-df02eec1","guard":[["hasAny",["fvt","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["video/vnd.",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ee3466c4","guard":[["hasAny",["h261","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f777f3a1","guard":[["hasAny",["dvb","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["video/vnd.",{"slot":0},".file"]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0083248c","guard":[["hasAny",["each word","split into words","wmx"]]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0e195c41","guard":[["hasAny",["item number","nth","yaml"]]],"pyramid":["render.template",{"lit":["text/",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-16aa106a","guard":[["hasAny",["h261","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-234a0326","guard":[["hasAny",["normalise","normalize","sfv","simplify the text"]]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-284a36d2","guard":[["hasAny",["dvb","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["video/vnd.",{"slot":0},".file"]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-2a0ba239","guard":[["hasAny",["gxf","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0}]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-34e3a0a8","guard":[["hasAny",["item number","nth","sbml"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-37107860","guard":[["hasAny",["amlx","each word","split into words"]],["has","mime"]],"pyramid":["render.template",{"lit":["application/automationml-",{"slot":0},"+zip"]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3f49aaf1","guard":[["hasAny",["item number","n3","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["text/",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-47339964","guard":[["hasAny",["delete","pas","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"text/x-pascal"},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-4b62a195","guard":[["hasAny",["each word","sfv","split into words"]]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4f2eb8ff","guard":[["hasAny",["each word","split into words","wmx"]]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4fd56b94","guard":[["hasAny",["amlx","each word","split into words"]],["has","mime"]],"pyramid":["render.template",{"lit":["application/automationml-",{"slot":0},"+zip"]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4fd9aad6","guard":[["hasAny",["delete","strip out","xlt"]]],"pyramid":["render.str",["transform.remove",{"lit":"application/vnd.ms-excel"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-5244f3df","guard":[["hasAny",["change to","pas","replace"]],["has","name"]],"pyramid":["render.str",["transform.replace",{"lit":"text/x-pascal"},["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-5c2c95b6","guard":[["hasAny",["3ds","each word","split into words"]]],"pyramid":["render.template",{"lit":["image/x-",{"slot":0}]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5f18253a","guard":[["hasAny",["leading zeros","pad with","padded to","sfv","zero pad"]]],"pyramid":["render.str",["transform.padStart",["sense.lastWord"],{"lit":10},{"lit":"text/x-pascal"}]],"mem":null},
{"id":"n-65a2f0ca","guard":[["hasAny",["delete","remove","strip out","xls"]]],"pyramid":["render.str",["transform.remove",{"lit":"application/vnd.ms-excel"},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-90f19f9c","guard":[["hasAny",["amlx","item number","nth","position"]],["has","mime"]],"pyramid":["render.template",{"lit":["application/automationml-",{"slot":0},"+zip"]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-967296a6","guard":[["hasAny",["each word","gxf","split into words"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0}]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-97d43d20","guard":[["hasAny",["3ds","each word","split into words"]]],"pyramid":["render.template",{"lit":["image/x-",{"slot":0}]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-988b2133","guard":[["hasAny",["each word","split into words","wbxml"]]],"pyramid":["render.template",{"lit":["application/vnd.wap.",{"slot":0}]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9e4ed6d7","guard":[["hasAny",["dvb","each word","split into words"]]],"pyramid":["render.template",{"lit":["video/vnd.",{"slot":0},".file"]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a25aad58","guard":[["hasAny",["dvb","each word","split into words"]]],"pyramid":["render.template",{"lit":["video/vnd.",{"slot":0},".file"]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-aa279786","guard":[["hasAny",["each word","h261","split into words"]]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b4002c6f","guard":[["hasAny",["each word","sfv","split into words"]]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ccde5dd1","guard":[["hasAny",["each word","gxf","split into words"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0}]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ce213c09","guard":[["hasAny",["normalise","normalize","simplify the text","wmx"]]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d3c0801f","guard":[["hasAny",["normalise","normalize","simplify the text","wbxml"]]],"pyramid":["render.template",{"lit":["application/vnd.wap.",{"slot":0}]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d6dd312d","guard":[["hasAny",["each word","split into words","wbxml"]]],"pyramid":["render.template",{"lit":["application/vnd.wap.",{"slot":0}]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-db3ef7ba","guard":[["hasAny",["each word","h261","split into words"]]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dc0e73b6","guard":[["hasAny",["amlx","normalise","normalize","simplify the text"]],["has","mime"]],"pyramid":["render.template",{"lit":["application/automationml-",{"slot":0},"+zip"]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-ec3186f8","guard":[["hasAny",["3ds","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["image/x-",{"slot":0}]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-01c1342a","guard":[["has","xls"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .xls files":"application/vnd.ms-excel"}}},
{"id":"n-01e59029","guard":[["has","ez"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .ez file":"application/andrew-inset"}}},
{"id":"n-039aaf0f","guard":[["has","ipynb"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-03e94736","guard":[["has","wbxml"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension wbxml":"application/vnd.wap.wbxml"}}},
{"id":"n-04c87f3b","guard":[["has","ipynb"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-053cf74f","guard":[["has","mvt"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .mvt file":"application/vnd.mapbox-vector-tile"}}},
{"id":"n-05d2d6b7","guard":[["has","sdc"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension sdc":"application/vnd.stardivision.calc"}}},
{"id":"n-065224a0","guard":[["has","xhtml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension xhtml":"application/xhtml+xml"}}},
{"id":"n-07d7af0c","guard":[["has","mxs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .mxs file":"application/vnd.triscape.mxs"}}},
{"id":"n-0ba27afd","guard":[["has","mxs"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .mxs file":"application/vnd.triscape.mxs"}}},
{"id":"n-0f6e7601","guard":[["has","rq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .rq file":"application/sparql-query"}}},
{"id":"n-0f79c6b3","guard":[["has","ez"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .ez file":"application/andrew-inset"}}},
{"id":"n-0faca55e","guard":[["has","held"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .held files":"application/atsc-held+xml"}}},
{"id":"n-0fb59f18","guard":[["has","ice"],["has","content"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .ice files":"x-conference/x-cooltalk"}}},
{"id":"n-111f7edd","guard":[["has","txf"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .txf files":"application/vnd.mobius.txf"}}},
{"id":"n-12a4317f","guard":[["has","amlx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension amlx":"application/automationml-amlx+zip"}}},
{"id":"n-12bd1b75","guard":[["has","xhtml"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension xhtml":"application/xhtml+xml"}}},
{"id":"n-13321a59","guard":[["has","held"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .held files":"application/atsc-held+xml"}}},
{"id":"n-16424d54","guard":[["has","rdz"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .rdz file":"application/vnd.data-vision.rdz"}}},
{"id":"n-165e8176","guard":[["has","xhtml"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension xhtml":"application/xhtml+xml"}}},
{"id":"n-170eed67","guard":[["has","uvg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvg":"image/vnd.dece.graphic"}}},
{"id":"n-1710bc4f","guard":[["has","wmlc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .wmlc file":"application/vnd.wap.wmlc"}}},
{"id":"n-173db57c","guard":[["has","cdmid"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension cdmid":"application/cdmi-domain"}}},
{"id":"n-1b26484b","guard":[["has","mvt"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .mvt file":"application/vnd.mapbox-vector-tile"}}},
{"id":"n-1bffa5ce","guard":[["has","cjs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .cjs files":"application/node"}}},
{"id":"n-1c73813e","guard":[["has","txf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .txf files":"application/vnd.mobius.txf"}}},
{"id":"n-1f5fb014","guard":[["has","spdx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .spdx files":"text/spdx"}}},
{"id":"n-20421e29","guard":[["has","stpxz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .stpxz file":"model/step-xml+zip"}}},
{"id":"n-230223df","guard":[["has","qxb"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .qxb files":"application/vnd.quark.quarkxpress"}}},
{"id":"n-231d3cad","guard":[["has","cdmid"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension cdmid":"application/cdmi-domain"}}},
{"id":"n-2cba00e3","guard":[["has","stpnc"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension stpnc":"model/step"}}},
{"id":"n-2eaf6baf","guard":[["has","less"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .less files":"text/less"}}},
{"id":"n-2f43a5fc","guard":[["has","uvv"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvv":"video/vnd.dece.video"}}},
{"id":"n-2ff04184","guard":[["has","texi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .texi file":"application/x-texinfo"}}},
{"id":"n-30c8866d","guard":[["has","sieve"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .sieve file":"application/sieve"}}},
{"id":"n-3150eab2","guard":[["has","onetoc"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension onetoc":"application/onenote"}}},
{"id":"n-3185cb1c","guard":[["has","mpkg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .mpkg file":"application/vnd.apple.installer+xml"}}},
{"id":"n-31b29f3b","guard":[["has","held"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .held files":"application/atsc-held+xml"}}},
{"id":"n-31cfb4f4","guard":[["has","hdf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .hdf files":"application/x-hdf"}}},
{"id":"n-337de0da","guard":[["has","cjs"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .cjs files":"application/node"}}},
{"id":"n-35ae12fb","guard":[["has","hdf"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .hdf files":"application/x-hdf"}}},
{"id":"n-36ba5dc1","guard":[["has","dvb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension dvb":"video/vnd.dvb.file"}}},
{"id":"n-377e8eb5","guard":[["has","stw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .stw file":"application/vnd.sun.xml.writer.template"}}},
{"id":"n-3b3c836c","guard":[["has","lostxml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension lostxml":"application/lost+xml"}}},
{"id":"n-3b6a3314","guard":[["has","amlx"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension amlx":"application/automationml-amlx+zip"}}},
{"id":"n-3bd0a782","guard":[["has","lostxml"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension lostxml":"application/lost+xml"}}},
{"id":"n-3d217f15","guard":[["has","mxs"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .mxs file":"application/vnd.triscape.mxs"}}},
{"id":"n-401c9dde","guard":[["has","xlt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .xlt file":"application/vnd.ms-excel"}}},
{"id":"n-402277e7","guard":[["has","hdd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .hdd files":"application/x-virtualbox-hdd"}}},
{"id":"n-43e8c17b","guard":[["has","xlt"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .xlt file":"application/vnd.ms-excel"}}},
{"id":"n-43f8de8d","guard":[["has","lostxml"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension lostxml":"application/lost+xml"}}},
{"id":"n-441a5878","guard":[["has","cjs"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .cjs files":"application/node"}}},
{"id":"n-44785a83","guard":[["has","stpxz"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .stpxz file":"model/step-xml+zip"}}},
{"id":"n-451a50e0","guard":[["has","ez"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .ez file":"application/andrew-inset"}}},
{"id":"n-451d6564","guard":[["has","qxb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .qxb files":"application/vnd.quark.quarkxpress"}}},
{"id":"n-45a5c87d","guard":[["has","stpnc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension stpnc":"model/step"}}},
{"id":"n-45e12871","guard":[["has","onetoc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension onetoc":"application/onenote"}}},
{"id":"n-47eac151","guard":[["has","amlx"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension amlx":"application/automationml-amlx+zip"}}},
{"id":"n-48de47f5","guard":[["has","rq"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .rq file":"application/sparql-query"}}},
{"id":"n-4bf855a2","guard":[["has","dvb"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension dvb":"video/vnd.dvb.file"}}},
{"id":"n-4da7d794","guard":[["has","stw"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .stw file":"application/vnd.sun.xml.writer.template"}}},
{"id":"n-5123b933","guard":[["has","texi"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .texi file":"application/x-texinfo"}}},
{"id":"n-515765d6","guard":[["has","stpnc"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension stpnc":"model/step"}}},
{"id":"n-517f67d5","guard":[["has","prf"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .prf files":"application/pics-rules"}}},
{"id":"n-51f5e556","guard":[["has","mvt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .mvt file":"application/vnd.mapbox-vector-tile"}}},
{"id":"n-5610207a","guard":[["has","xls"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .xls files":"application/vnd.ms-excel"}}},
{"id":"n-56faa8f3","guard":[["has","au"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension au":"audio/basic"}}},
{"id":"n-5bb6f59a","guard":[["has","sieve"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .sieve file":"application/sieve"}}},
{"id":"n-5d869711","guard":[["has","jad"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .jad files":"text/vnd.sun.j2me.app-descriptor"}}},
{"id":"n-5dfcb5b1","guard":[["has","ppt"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension ppt":"application/vnd.ms-powerpoint"}}},
{"id":"n-5e0d7f48","guard":[["has","jad"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .jad files":"text/vnd.sun.j2me.app-descriptor"}}},
{"id":"n-5f2bd9da","guard":[["has","ipynb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-60ab94e2","guard":[["has","uvv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvv":"video/vnd.dece.video"}}},
{"id":"n-62cf95b2","guard":[["has","sdc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension sdc":"application/vnd.stardivision.calc"}}},
{"id":"n-632e83b9","guard":[["has","pas"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .pas files":"text/x-pascal"}}},
{"id":"n-64a167f0","guard":[["has","ppt"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension ppt":"application/vnd.ms-powerpoint"}}},
{"id":"n-659428af","guard":[["has","ppt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension ppt":"application/vnd.ms-powerpoint"}}},
{"id":"n-68b93156","guard":[["has","tsd"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .tsd files":"application/timestamped-data"}}},
{"id":"n-6ab9c317","guard":[["has","au"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension au":"audio/basic"}}},
{"id":"n-6c8a1346","guard":[["has","wmlc"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .wmlc file":"application/vnd.wap.wmlc"}}},
{"id":"n-6dcf2208","guard":[["has","vcard"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .vcard files":"text/vcard"}}},
{"id":"n-70bdd6a5","guard":[["has","wbxml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension wbxml":"application/vnd.wap.wbxml"}}},
{"id":"n-7279c8df","guard":[["has","tsd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .tsd files":"application/timestamped-data"}}},
{"id":"n-72ea6fa9","guard":[["has","dvb"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension dvb":"video/vnd.dvb.file"}}},
{"id":"n-7415f8b7","guard":[["has","cdmid"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension cdmid":"application/cdmi-domain"}}},
{"id":"n-744f6044","guard":[["has","uvg"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvg":"image/vnd.dece.graphic"}}},
{"id":"n-74d89842","guard":[["has","prf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .prf files":"application/pics-rules"}}},
{"id":"n-7584bf2b","guard":[["has","hdd"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .hdd files":"application/x-virtualbox-hdd"}}},
{"id":"n-76242b99","guard":[["has","rdz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .rdz file":"application/vnd.data-vision.rdz"}}},
{"id":"n-7775d248","guard":[["has","webmanifest"],["has","a"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .webmanifest file":"application/manifest+json"}}},
{"id":"n-7a3db496","guard":[["has","spdx"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .spdx files":"text/spdx"}}},
{"id":"n-7b4da58e","guard":[["has","less"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .less files":"text/less"}}},
{"id":"n-7c227af3","guard":[["has","pas"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .pas files":"text/x-pascal"}}},
{"id":"n-7c68ca49","guard":[["has","rq"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .rq file":"application/sparql-query"}}},
{"id":"n-7f33b0dc","guard":[["has","spdx"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .spdx files":"text/spdx"}}},
{"id":"n-7f76e4b7","guard":[["has","vcard"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .vcard files":"text/vcard"}}},
{"id":"n-832c9d09","guard":[["has","txf"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .txf files":"application/vnd.mobius.txf"}}},
{"id":"n-83ec20c3","guard":[["has","clkt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension clkt":"application/vnd.crick.clicker.template"}}},
{"id":"n-84cca79a","guard":[["has","hdf"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .hdf files":"application/x-hdf"}}},
{"id":"n-86b6dd67","guard":[["has","ova"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .ova file":"application/x-virtualbox-ova"}}},
{"id":"n-88b2ba22","guard":[["has","m4u"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension m4u":"video/vnd.mpegurl"}}},
{"id":"n-88f235ff","guard":[["has","kml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .kml files":"application/vnd.google-earth.kml+xml"}}},
{"id":"n-8f418e89","guard":[["has","edx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .edx file":"application/vnd.novadigm.edx"}}},
{"id":"n-8fb2c7f2","guard":[["has","text"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .text file":"text/plain"}}},
{"id":"n-90362144","guard":[["has","xls"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .xls files":"application/vnd.ms-excel"}}},
{"id":"n-90a17335","guard":[["has","vcard"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .vcard files":"text/vcard"}}},
{"id":"n-92ed7c9b","guard":[["has","nsc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .nsc file":"application/x-conference"}}},
{"id":"n-93973c6c","guard":[["has","exr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension exr":"image/aces"}}},
{"id":"n-97421e44","guard":[["has","spf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .spf files":"application/vnd.yamaha.smaf-phrase"}}},
{"id":"n-98523198","guard":[["has","umj"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .umj file":"application/vnd.umajin"}}},
{"id":"n-9875974c","guard":[["has","qxb"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .qxb files":"application/vnd.quark.quarkxpress"}}},
{"id":"n-98e4b47b","guard":[["has","p"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension p":"text/x-pascal"}}},
{"id":"n-990da26b","guard":[["has","less"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .less files":"text/less"}}},
{"id":"n-9a00d0ca","guard":[["has","spl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension spl":"application/x-futuresplash"}}},
{"id":"n-9b4811ca","guard":[["has","stpxz"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .stpxz file":"model/step-xml+zip"}}},
{"id":"n-9c0eadaa","guard":[["has","spx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .spx file":"audio/ogg"}}},
{"id":"n-9e7f77d4","guard":[["has","xpi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .xpi files":"application/x-xpinstall"}}},
{"id":"n-a1069472","guard":[["has","gnumeric"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .gnumeric file":"application/x-gnumeric"}}},
{"id":"n-a256b92a","guard":[["has","ots"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template"}}},
{"id":"n-a4e26910","guard":[["has","dot"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .dot files":"application/msword"}}},
{"id":"n-a645a97a","guard":[["has","jad"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .jad files":"text/vnd.sun.j2me.app-descriptor"}}},
{"id":"n-a79ddb33","guard":[["has","gph"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension gph":"application/vnd.flographit"}}},
{"id":"n-a8e9aa72","guard":[["has","wbxml"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension wbxml":"application/vnd.wap.wbxml"}}},
{"id":"n-a91d86ad","guard":[["has","gbr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .gbr file":"application/rpki-ghostbusters"}}},
{"id":"n-a95b5c8d","guard":[["has","texi"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .texi file":"application/x-texinfo"}}},
{"id":"n-ad6eeb12","guard":[["has","oth"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .oth file":"application/vnd.oasis.opendocument.text-web"}}},
{"id":"n-b1f67733","guard":[["has","onetoc"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension onetoc":"application/onenote"}}},
{"id":"n-b2298daa","guard":[["has","gxf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension gxf":"application/gxf"}}},
{"id":"n-b29a8e8b","guard":[["has","fvt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .fvt file":"video/vnd.fvt"}}},
{"id":"n-b2ff77ce","guard":[["has","qam"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .qam files":"application/vnd.epson.quickanime"}}},
{"id":"n-b32efcf7","guard":[["has","sdc"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension sdc":"application/vnd.stardivision.calc"}}},
{"id":"n-b3aec8b6","guard":[["has","xo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .xo file":"application/vnd.olpc-sugar"}}},
{"id":"n-b9996dac","guard":[["has","m4b"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension m4b":"audio/mp4"}}},
{"id":"n-b9ddb788","guard":[["has","uvv"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvv":"video/vnd.dece.video"}}},
{"id":"n-ba014465","guard":[["has","rusd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .rusd file":"application/route-usd+xml"}}},
{"id":"n-bcffc5de","guard":[["has","ustar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .ustar files":"application/x-ustar"}}},
{"id":"n-bd481576","guard":[["has","rdz"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .rdz file":"application/vnd.data-vision.rdz"}}},
{"id":"n-c026c818","guard":[["has","ttc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .ttc files":"font/collection"}}},
{"id":"n-c2975e89","guard":[["has","glb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension glb":"model/gltf-binary"}}},
{"id":"n-c38840d6","guard":[["has","gif"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .gif file":"image/gif"}}},
{"id":"n-c3e9a0c7","guard":[["has","uvg"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvg":"image/vnd.dece.graphic"}}},
{"id":"n-c57f585d","guard":[["has","arj"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .arj file":"application/x-arj"}}},
{"id":"n-c7bd0eb6","guard":[["has","h"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .h file":"text/x-c"}}},
{"id":"n-ca5fb4f5","guard":[["has","fhc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .fhc files":"image/x-freehand"}}},
{"id":"n-cbd01443","guard":[["has","vtx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .vtx files":"application/vnd.visio"}}},
{"id":"n-cf46f10c","guard":[["has","prf"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .prf files":"application/pics-rules"}}},
{"id":"n-cf8444f0","guard":[["has","au"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension au":"audio/basic"}}},
{"id":"n-d06463e9","guard":[["has","dataless"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .dataless files":"application/vnd.fdsn.seed"}}},
{"id":"n-d0a66833","guard":[["has","evy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .evy files":"application/x-envoy"}}},
{"id":"n-d156b108","guard":[["has","frame"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .frame files":"application/vnd.framemaker"}}},
{"id":"n-d2a1cf32","guard":[["has","sieve"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .sieve file":"application/sieve"}}},
{"id":"n-d429f3af","guard":[["has","oas"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension oas":"application/vnd.fujitsu.oasys"}}},
{"id":"n-d6427b08","guard":[["has","sbml"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .sbml file":"application/sbml+xml"}}},
{"id":"n-d67d0d63","guard":[["has","wmlc"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .wmlc file":"application/vnd.wap.wmlc"}}},
{"id":"n-d849c799","guard":[["has","es3"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension es3":"application/vnd.eszigno3+xml"}}},
{"id":"n-dfac0fab","guard":[["has","osfpvg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml"}}},
{"id":"n-e25658a0","guard":[["has","wpd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .wpd files":"application/vnd.wordperfect"}}},
{"id":"n-e291f272","guard":[["has","vec"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension vec":"application/vec+xml"}}},
{"id":"n-e32b6fea","guard":[["has","rsheet"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension rsheet":"application/urc-ressheet+xml"}}},
{"id":"n-e423f533","guard":[["has","tsd"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .tsd files":"application/timestamped-data"}}},
{"id":"n-e49dc9dd","guard":[["has","sfv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension sfv":"text/x-sfv"}}},
{"id":"n-e51f1146","guard":[["has","xlt"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .xlt file":"application/vnd.ms-excel"}}},
{"id":"n-e6be0c4d","guard":[["has","wmx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension wmx":"video/x-ms-wmx"}}},
{"id":"n-e705b3dc","guard":[["has","mpkg"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .mpkg file":"application/vnd.apple.installer+xml"}}},
{"id":"n-e8b61140","guard":[["has","tpl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .tpl files":"application/vnd.groove-tool-template"}}},
{"id":"n-ef0f3da8","guard":[["has","mmf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .mmf files":"application/vnd.smaf"}}},
{"id":"n-f0113a82","guard":[["has","yaml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .yaml file":"text/yaml"}}},
{"id":"n-f46f1169","guard":[["has","jais"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .jais file":"image/jais"}}},
{"id":"n-f6bb9db7","guard":[["has","hdd"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .hdd files":"application/x-virtualbox-hdd"}}},
{"id":"n-f7156337","guard":[["has","pic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .pic file":"image/x-pict"}}},
{"id":"n-f80978d5","guard":[["has","pas"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .pas files":"text/x-pascal"}}},
{"id":"n-fe74416e","guard":[["has","mpkg"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .mpkg file":"application/vnd.apple.installer+xml"}}},
{"id":"n-fec3c6b9","guard":[["has","stw"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .stw file":"application/vnd.sun.xml.writer.template"}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the content type for .osfpvg files","expect":{"equals":"application/vnd.yamaha.openscoreformat.osfpvg+xml","notRefusal":true}},{"q":"which MIME type goes with the extension xhtml","expect":{"equals":"application/xhtml+xml","notRefusal":true}},{"q":"what is the media type of a .gnumeric file","expect":{"equals":"application/x-gnumeric","notRefusal":true}},{"q":"which MIME type goes with the extension me","expect":{"equals":"text/troff","notRefusal":true}},{"q":"what is the media type of a .xlt file","expect":{"equals":"application/vnd.ms-excel","notRefusal":true}},{"q":"what is the media type of a .ez file","expect":{"equals":"application/andrew-inset","notRefusal":true}},{"q":"which MIME type goes with the extension gxf","expect":{"equals":"application/gxf","notRefusal":true}},{"q":"name the content type for .qam files","expect":{"equals":"application/vnd.epson.quickanime","notRefusal":true}},{"q":"what is the media type of a .oth file","expect":{"equals":"application/vnd.oasis.opendocument.text-web","notRefusal":true}},{"q":"what is the media type of a .texi file","expect":{"equals":"application/x-texinfo","notRefusal":true}},{"q":"name the content type for .frame files","expect":{"equals":"application/vnd.framemaker","notRefusal":true}},{"q":"name the content type for .ttc files","expect":{"equals":"font/collection","notRefusal":true}},{"q":"name the content type for .dataless files","expect":{"equals":"application/vnd.fdsn.seed","notRefusal":true}},{"q":"name the content type for .wpd files","expect":{"equals":"application/vnd.wordperfect","notRefusal":true}},{"q":"name the content type for .qxb files","expect":{"equals":"application/vnd.quark.quarkxpress","notRefusal":true}},{"q":"what is the media type of a .webmanifest file","expect":{"equals":"application/manifest+json","notRefusal":true}},{"q":"which MIME type goes with the extension es3","expect":{"equals":"application/vnd.eszigno3+xml","notRefusal":true}},{"q":"which MIME type goes with the extension glb","expect":{"equals":"model/gltf-binary","notRefusal":true}},{"q":"name the content type for .ustar files","expect":{"equals":"application/x-ustar","notRefusal":true}},{"q":"name the content type for .jad files","expect":{"equals":"text/vnd.sun.j2me.app-descriptor","notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
