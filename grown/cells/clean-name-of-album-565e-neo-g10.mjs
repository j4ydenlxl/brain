// clean-name-of-album-565e-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"clean-name-of-album-565e-neo-g10","class":"clean-name-of-album-565e","generation":10,"lane":"neo","grownFrom":["what is the clean name of Avalon","give the clean name for The Birth of Soul","what is the clean name of Little Earthquakes","tell me the clean name of the album In the Aeroplane Over the Sea","give the clean name for The Joshua Tree","what is the clean name of Violator","tell me the clean name of the album Help!","what is the clean name of Moving Pictures","give the clean name for Body Talk","give the clean name for Time Out of Mind","give the clean name for Entroducing","tell me the clean name of the album Dummy","what is the clean name of Chief","give the clean name for Ram","tell me the clean name of the album Freak Out!","what is the clean name of King of the Delta Blues Singers","tell me the clean name of the album Born to Run","tell me the clean name of the album Aladdin Sane","give the clean name for Outlandos d'Amour","what is the clean name of Rapture"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-rolling-stone-b1c082","columns":["album","sort name","clean name","type"],"n":691,"cols":[{"s":"In the Wee Small Hours|Elvis Presley|Lemonade|The \"Chirping\" Crickets|Kind of Blue|Giant Steps|Baduizm|Moanin' in the Moonlight|Red|When the Pawn...|The Genius of Ray Charles|Control|Hejira|Muddy Waters at Newport 1960|Amazing Grace|King of the Delta Blues Singers|Diamond Life|Homogenic|Live at the Apollo, 1962|The Freewheelin' Bob Dylan|Please Please Me|A Christmas Gift for You From Phil Spector|What's the 411?|Stories From the City, Stories From the Sea|Arular|Lucinda Williams|Coal Miner's Daughter|Otis Blue: Otis Redding Sings Soul|Mr. Tambourine Man|Live at the Regal|The Beach Boys Today!|Out of Our Heads|My Generation|Having a Rave Up|My Beautiful Dark Twisted Fantasy|To Pimp a Butterfly|Fresh Cream|Parsley, Sage, Rosemary and Thyme|Freak Out!|If You Can Believe Your Eyes and Ears|Are You Experienced|The Doors|The Piper at the Gates of Dawn|Something Else by The Kinks|Aquemini|The Best of Little Walter|Branded Man|The Velvet Underground & Nico|Surrealistic Pillow|Astral Weeks|Music From Big Pink|At Folsom Prison|Gris Gris|Blonde|Anthem of the Sun|Take Care|Led Zeppelin|Willy and the Poor Boys|Kick Out the Jams|Everybody Knows This Is Nowhere|The Stooges|Santana|Five Leaves Left|Stand!|Plastic Ono Band|Paranoid|Let It Be|The Black Album|Look-Ka Py Py|12 Songs|Tumbleweed Connection|Greatest Hits|What's Going On|Hunky Dory|Brown Sugar|Maggot Brain|Midnight Marauders|Tha Carter III|Talking Book|Unknown Pleasures|Wildflowers|Definitely Maybe|Superfly|Transformer|Can't Buy a Thrill|The Harder They Come|De La Soul Is Dead|Eagles|I'm Still in Love With You|Discovery|Paul Simon|#1 Record|Mama Said Knock You Out|American Idiot|All the Young Dudes|Check Your Head|Power, Corruption & Lies|Wowee Zowee|The Wild, the Innocent & the E Street Shuffle|For Your Pleasure|Burnin'|For Everyman|Tres Hombres|Just As I Am|Band on the Run|Here Come the Warm Jets|Natty Dread|The Heart of Saturday Night|Modern Vampires of the City|461 Ocean Boulevard|I Want to See the Bright Lights Tonight|Heart Like a Wheel|AM|Red Headed Stranger|Alive!|Toys in the Attic|Fleetwood Mac|Ramones|In Rainbows|The Clash|The Stranger|My Aim Is True|Pretty Hate Machine|In Color|Talking Heads: 77|Clandestino|Outlandos d'Amour|Parallel Lines|Off the Wall|Highway to Hell|Boys Don't Cry|Goo|Dirty Mind|Boy|Los Angeles|The Indestructible Beat of Soweto|Murmur|Pyromania|40 Greatest Hits|Let It Be|Run D.M.C.|The Smiths|Live at the Harlem Square Club, 1963|Master of Puppets|Yo! Bum Rush the Show|Nothing's Shocking|Surfer Rosa|Like a Prayer|Nick of Time|Nevermind|Ten|Blood Sugar Sex Magik|Blue Lines|Rage Against the Machine|Siamese Dream|Ready to Die|Tragic Kingdom|Odelay|The Slim Shady LP|Anthology|White Blood Cells|All Eyez on Me|Get Rich or Die Tryin'|The Low End Theory|The Definitive Collection|Back in Black|One in A Million|21|Rocks|Call Me|Greatest Hits|Jagged Little Pill|Born Under a Bad Sign|Journey in Satchidanada|Love It to Death|The Diary of Alicia Keys|Back to Black|Rapture|Funeral|Whatever People Say I Am, That's What I'm Not|I Never Loved a Man the Way I Love You|Lady Soul|Young, Gifted and Black|Live in Cook County Jail|X 100pre|Can't Get Enough|Licensed to Ill|Paul's Boutique|Sea Change|Saturday Night Fever: The Original Movie Sound Track|If You're Feeling Sinister|Beyonce|Cheap Thrills|Radio City|Third/Sister Lovers|Still Bill|When We All Fall Asleep Where Do We Go?|Lady in Satin|52nd Street|Post|Damaged|Black Sabbath|Master of Reality|Blondie|Child Is Father to the Man|Parklife|Bo Diddley / Go Bo Diddley|\"Love and Theft\"|Blonde on Blonde|Blood on the Tracks|Bringing It All Back Home|Desire|Highway 61 Revisited|John Wesley Harding|Modern Times|The Basement Tapes|Time Out of Mind|Catch a Fire|Exodus|Legend: The Best of Bob Marley and The Wailers|Two Steps From the Blues|For Emma, Forever Ago|Give It Up|Criminal Minded|II|Boz Scaggs|Another Green World|Smile|Blackout|Born in the U.S.A.|Born to Run|Darkness on the Edge of Town|Greetings from Asbury Park, NJ|Nebraska|The Rising|The River|Tunnel of Love|20 Golden Greats|Buena Vista Social Club|Buffalo Springfield Again|Singles Going Steady|Ege Bamyasi|Trout Mask Replica|Tapestry|The Cars|Tea for the Tillerman|Mingus Ah Um|Cheap Trick at Budokan|Risque|The Great Twenty-Eight|Heaven or Las Vegas|A Rush of Blood to the Head|Disraeli Gears|Wheels of Fire|Chronicle: The 20 Greatest Hits|Cosmo's Factory|Green River|Crosby, Stills & Nash|Deja vu|Curtis|The Anthology: 1961-1977|She's So Unusual|Black Messiah|Voodoo|Q: Are We Not Men? A: We Are Devo!|Entroducing|Barrio Fino|Random Access Memories|Aladdin Sane|ChangesOneBowie|Low|Scary Monsters|Station to Station|The Rise and Fall of Ziggy Stardust and the Spiders From Mars|3 Feet High and Rising|Hysteria|Violator|Layla and Other Assorted Love Songs|The Writing's On the Wall|Diana|Brothers in Arms|Coat of Many Colors|The End of the Innocence|Bad Girls|The Chronic|Dr. John's Gumbo|If You're Reading This It's Too Late|Dusty in Memphis|Strictly Business|Hotel California|That's the Way of the World|Heaven Up Here|Either/Or|Captain Fantastic and the Brown Dirt Cowboy|Elton John|Goodbye Yellow Brick Road|Greatest Hits|Honky Chateau|Armed Forces|Imperial Bedroom|This Year's Model|From Elvis in Memphis|The Sun Sessions|The Eminem Show|The Marshall Mathers LP|Paid in Full|Chief|Slowhand|Mama's Gun|At Last!|Touch|Expensive Shit|Extraordinary Machine|The Idler Wheel|Rumours|Reach Out|Channel Orange|Songs for Swingin' Lovers!|The Score|One Nation Under a Groove|Liquid Swords|Entertainment!|All Things Must Pass|Faith|Getz / Gilberto|Supreme Clientele|Time (The Revelator)|Squeezing Out Sparks|Grievous Angel|American Beauty|Live/Dead|Workingman's Dead|Dookie|Appetite for Destruction|The Complete Hank Williams|Nilsson Schmilsson|Fine Line|Head Hunters|Live Through This|Howlin' Wolf|New Day Rising|New Boots & Panties!!|AmeriKKKa's Most Wanted|Proud Mary: The Best of Ike and Tina Turner|Hot Buttered Soul|Donuts|Mr. Excitement!|Late for the Sky|The Pretender|Greatest Hits|In the Jungle Groove|Sex Machine|Star Time|Sweet Baby James|Ritual de lo Habitual|Rhythm Nation 1814|The Velvet Rope|Pearl|Southeastern|Reasonable Doubt|The Blueprint|Grace|Volunteers|All Killer No Filler! The Jerry Lee Lewis Anthology|Aqualung|Axis: Bold as Love|Electric Ladyland|A Love Supreme|The Ultimate Collection: 1948-1990|Imagine|Bluesbreakers|Continuum|John Prine|American Recordings|Blue|Court and Spark|The Hissing of Summer Lawns|Closer|400 Degreez|Destroyer|Golden Hour|808s and Heartbreak|Graduation|Late Registration|The College Dropout|Yeezus|Hounds of Love|Kaleidoscope|DAMN|good kid, m.A.A.d city|Man on the Moon: The End of the Day|Best of the Classic Years|Trans-Europe Express|Sound of Silver|Radio|Nightbirds|Born This Way|Norman Fucking Rockwell|Eli & the 13th Confession|The Miseducation of Lauryn Hill|Houses of the Holy|Led Zeppelin II|Led Zeppelin IV|Physical Graffiti|Songs of Love and Hate|Tha Carter II|The Very Best of Linda Ronstadt|Here's Little Richard|Exile in Guyville|Melodrama|All Time Greatest Hits|How Will the Wolf Survive?|Berlin|Forever Changes|Car Wheels on a Gravel Road|Never Too Much|(pronounced 'leh-'nerd 'skin-'nerd)|Kala|Back in the USA|Oracular Spectacular|Music|Ray of Light|The Immaculate Collection|Madvillainy|Proxima estacion: Esperanza|The Emancipation of Mimi|Here, My Dear|Let's Get It On|My Life|Mezzanine|BLACKsummers'night|Bat Out of Hell|Down Every Road|Metallica|Bad|Thriller|Bitches Brew|Sketches of Spain|Double Nickels on the Dime|The Weight of These Wings|Supa Dupa Fly|The Infamous|Play|Moby Grape|Mott|Ace of Spades|Folk Singer|The Anthology|Loveless|The Black Parade|Z|Straight Outta Compton|Illmatic|The Neil Diamond Collection|After the Gold Rush|Harvest|On the Beach|Rust Never Sleeps|Tonight's the Night|In the Aeroplane Over the Sea|Substance 1987|New York Dolls|Bryter Later|Pink Moon|Wild is the Wind|The Downward Spiral|In Utero|MTV Unplugged in New York|Rock Steady|(What's the Story) Morning Glory?|The Shape of Jazz to Come|Complete & Unbelievable: The Otis Redding Dictionary of Soul|Dreams to Remember: The Otis Redding Anthology, Otis Redding|Live in Europe|The Dock of the Bay|Speakerboxxx/The Love Below|Stankonia|Rid of Me|To Bring You My Love|Mothership Connection|The Ultimate Collection|Horses|The Paul Butterfield Blues Band|Ram|Graceland|Crooked Rain Crooked Rain|Slanted and Enchanted|Vitalogy|Actually|So|Sleepless|Back to Mono (1958-1969)|The Dark Side of the Moon|The Wall|Wish You Were Here|Doolittle|Dummy|Pretenders|Screamadelica|1999|Purple Rain|Sign O' The Times|New Orleans Piano|Fear of a Black Planet|It Takes a Nation of Millions to Hold Us Back|Metal Box|Different Class|A Night at the Opera|Happy Trails|Automatic for the People|Document|Amnesiac|Kid A|OK Computer|The Bends|Only Built 4 Cuban Linx|The Battle of Los Angeles|Rocket to Russia|Good Old Boys|Sail Away|Modern Sounds in Country and Western Music|The Birth of Soul|Californication|Shoot Out the Lights|Anti|King of the Delta Blues Singers, vol 2|The Complete Recordings|First Take|Body Talk|Every Picture Tells a Story|Aftermath|Beggars Banquet|Between the Buttons|Exile on Main St.|Let It Bleed|Some Girls|Sticky Fingers|Tattoo You|The Rolling Stones, Now!|El Mal Querer|Avalon|Country Life|Siren|Ask Rufus|Raising Hell|Moving Pictures|Ctrl|Love Deluxe|Portrait of a Legend 1951-1964|Abraxas|Amor Prohibido|Never Mind the Bollocks Here's the Sex Pistols|Donde Estan Los Ladrones|Come On Over|Sheryl Crow|Bookends|Bridge Over Troubled Water|Greatest Hits|I Do Not Want What I Haven't Got|Dig Me Out|Fresh|There's a Riot Goin' On|Going to a Go-Go|Doggystyle|A Seat at the Table|Daydream Nation|Superunknown|Kimono My House|Aja|Pretzel Logic|Guitar Town|Fly Like an Eagle|Innervisions|Music of My Mind|Songs in the Key of Life|Suicide|Electric Warrior|CrazySexyCool|More Songs About Buildings and Food|Remain in Light|Stop Making Sense|Currents|1989|Marquee Moon|At Fillmore East|The B 52's / Play Loud|The Band|Pet Sounds|Sunflower|The Smile Sessions|Wild Honey|A Hard Day's Night|Abbey Road|Help!|Meet The Beatles!|Revolver|Rubber Soul|Sgt. Pepper's Lonely Hearts Club Band|The Beatles|With the Beatles|Last Splash|Greatist Hits|Sweetheart of the Rodeo|The Notorious Byrd Brothers|Younger Than Yesterday|Close to You|Fly|London Calling|Sandinista!|Disintegration|L.A. Woman|Strange Days|The Drifters' Golden Hits|The Gilded Palace of Sin|Beauty and the Beat|3 + 3|Psychocandy|The Kink Kronikles|The Kinks Are The Village Green Preservation Society|69 Love Songs|Greatest Hits|Rejuvenation|The Modern Lovers|We're Only in It for the Money|Life After Death|Back Stabbers|Bizarre Ride II the Pharcyde|Rum Sodomy & the Lash|Ghost in the Machine|Reggatta de Blanc|Synchronicity|The Raincoats|Tim|Presenting the Fabulous Ronettes Featuring Veronica|Things Fall Apart|Cut|Mellon Collie and the Infinite Sadness|Louder Than Bombs|Meat Is Murder|The Queen Is Dead|The Stone Roses|Fun House|Raw Power|Is This It|Anthology: The Best of The Temptations|Loaded|The Velvet Underground|White Light/White Heat|Beauty Behind the Madness|Elephant|A Quick One|Live at Leeds|Quadrophenia|The Who Sell Out|Tommy|Who's Next|Roger the Engineer|Odessey & Oracle|Something / Anything?|Damn the Torpedoes|Full Moon Fever|Mule Variations|Rain Dogs|Funky Kingston|Little Earthquakes|Tracy Chapman|Achtung Baby|All That You Can't Leave Behind|The Joshua Tree|War|Confessions|Vampire Weekend|Van Halen|Moondance|Anthology of American Folk Music|Nuggets: Original Artyfacts From the First Psychedelic Era, 1965-1968|The Best of the Girl Groups, Volume 1|The Sun Records Collection|The World Is a Ghetto|Weezer|Whitney Houston|Yankee Hotel Foxtrot|Stardust|Pink Flag|Enter the Wu-Tang: 36 Chambers|Wild Gift|Germ Free Adolescents|Fever to Tell|Close to the Edge|I Can Hear the Heart Beating as One|Eliminator","sep":"|"},{"f":"0Sinatra, Frank|0Presley, Elvis|0Beyonce|0Crickets|0Davis, Miles|0Coltrane, John|0Badu, Erykah|0Howlin' Wolf|0Swift, Taylor|0Apple, Fiona|0Charles, Ray|0Jackson, Janet|0Mitchell, Joni|0Waters, Muddy|0Franklin, Aretha|0Johnson, Robert|0Sade|0Bjork|1rown, James|0Dylan, Bob|0Beatles|0Spector, Phil|0Blige, Mary J.|0Harvey, PJ|0M.I.A.|0WIlliams, Lucinda|0Lynn, Loretta|0Redding, Otis|0Byrds|0King, B.B.|0Beach Boys|0Rolling Stones|0Who, The|0Yardbirds|0West, Kanye|0Lamar, Kendrick|0Cream|0Simon & Garfunkel|0Mothers of Invention|1amas and the Papas|0Jimi Hendrix Experience|0Doors|0Pink Floyd|0Kinks|0OutKast|0Little Walter|0Haggard, Merle|0Velvet Underground|0Jefferson Airplane|0Morrison, Van|0Band, The|0Cash, Johnny|0Dr. John|0Ocean, Frank|0Grateful Dead|0Drake|0Led Zeppelin|0Creedence Clearwater Revival|0MC5|0Young, Neil|0Stooges|1antana|0Drake, Nick|0Sly & The Family Stone|0Lennon, John|0Black Sabbath|1eatles|0Jay-Z|0Meters|0Newman, Randy|0John, Elton|0Sly & The Family Stone|0Gaye, Marvin|0Bowie, David|0D'Angelo|0Funkadelic|0A Tribe Called Quest|0Lil Wayne|0Wonder, Stevie|0Joy Division|0Petty, Tom|0Oasis|0Mayfield, Curtis|0Reed, Lou|0Steely Dan|0Various Artists|0De La Soul|0Eagles|0Green, Al|0Daft Punk|0Simon, Paul|0Big Star|0LL Cool J|0Green Day|0Mott the Hoople|0Beastie Boys|0New Order|0Pavement|0Springsteen, Bruce|0Roxy Music|0Wailers|0Browne, Jackson|0ZZ Top|0Withers, Bill|0Paul McCartney & Wings|0Eno, Brian|0Marley, Bob|0Waits, Tom|0Vampire Weekend|0Clapton, Eric|0Thompson, Richard & Linda|0Ronstadt, Linda|0Arctic Monkeys|0Nelson, Willie|0KISS|0Aerosmith|0Fleetwood Mac|0Ramones|2diohead|0Clash|0Joel, Billy|0Costello, Elvis|0Nine Inch Nails|0Cheap Trick|0Talking Heads|0Chao, Manu|0Police|0Blondie|0Jackson, Michael|0AC/DC|0Cure|0Sonic Youth|0Prince|0U2|0X|0Various Artists|0R.E.M.|0Def Leppard|0Williams, Hank|0Replacements|1un D.M.C.|0Smiths|0Cooke, Sam|0Metallica|0Public Enemy|0Jane's Addiction|0Pixies|0Madonna|0Raitt, Bonnie|0Nirvana|0Pearl Jam|0Red Hot Chili Peppers|0Massive Attack|0Rage Against the Machine|0Smashing Pumpkins|0Notorious B.I.G.|2 Doubt|0Beck|0Eminem|0Ross, Diana & the Supremes|0White Stripes|02Pac|050 Cent|0A Tribe Called Quest|1BBA|1C/DC|1aliyah|1dele|1erosmith|0Green, Al|9|0Morrissette, Alanis|0King, Albert|0Coltrane, Alice|2oper, Alice|0Keys, Alicia|0Winehouse, Amy|0Baker, Anita|0Arcade Fire|3tic Monkeys|0Franklin, Aretha|g|g|0King, B.B.|0Bad Bunny|0White, Barry|0Beastie Boys|c|2ck|0Various Artists|0Belle & Sebastian|2yonce|1ig Brother & the Holding Company|4Star|8|0Withers, Bill|0EIlish, Billie|0Holiday, Billie|0Joel, Billy|0Bjork|1lack Flag|6Sabbath|d|2ondie|3od, Sweat & Tears|2ur|0Diddley, Bo|1ylan, Bob|a|a|a|a|a|a|a|a|a|0Wailers|0Marley, Bob|b|0Bland, Bobby \"Blue\"|1on Iver|0Raitt, Bonnie|0Boogie Down Productions|2yz II Men|0Scaggs, Boz|0Eno, Brian|0Wilson, Brian|0Spears, Britney|2ringsteen, Bruce|i|i|i|i|i|i|i|0Holly, Buddy|0Buena Vista Social Club|2ffalo Springfield|2zzcocks|0Can|2ptain Beefheart & His Magic Band|0King, Carole|0Cars|0Stevens, Cat|0Mingus, Charles|0Cheap Trick|2ic|0Berry, Chuck|0Cocteau Twins|2ldplay|1ream|5|3edence Clearwater Revival|s|s|2osby, Stills & Nash|e, Nash & Young|0Mayfield, Curtis|g|0Lauper, Cyndi|0D'Angelo|8|1EVO|1J Shadow|1addy Yankee|2ft Punk|0Bowie, David|c|c|c|c|c|0De La Soul|2f Leppard|2peche Mode|2rek and the Dominos|2stiny's Child|0Ross, Diana|0Dire Straits|0Parton, Dolly|0Henley, Don|0Summer, Donna|0Dr. Dre|4John|2ake|1usty Springfield|0EPMD|1agles|2rth, Wind & Fire|1cho and The Bunnymen|0Smith, Elliott|0John, Elton|b|b|b|b|0Costello, Elvis|f|f|0Presley, Elvis|e|0Eminem|6|1ric B. & Rakim|0Church, Eric|1lapton, Eric|0Badu, Erykah|0Etta James|1urythmics|0Kuti, Fela|0Apple, Fiona|c|0Fleetwood Mac|1our Tops|0Ocean, Frank|0Sinatra, Frank|0Fugees|2nkadelic|0GZA|1ang of Four|0Harrison, George|0Michael, George|0Getz & Gilberto|1hostface Killah|0Welch, Gillian|0Parker, Graham|3sons, Gram|0Grateful Dead|d|d|2een Day|1uns N' Roses|0Williams, Hank|0Nilsson, Harry|0Styles, Harry|0Hancock, Herbie|1ole|2wlin' Wolf|1usker Du|0Dury, Ian and the Blockheads|0Ice Cube|0Turner, Ike & Tina|0Hayes, Isaac|0J. Dilla|0Wilson, Jackie|0Browne, Jackson|f|5, James|c|c|c|0Taylor, James|0Jane's Addiction|2ckson, Janet|e|2nis Joplin|0Isbell, Jason|0Jay-Z|5|0Buckley, Jeff|0Jefferson Airplane|0Lewis, Jerry Lee|0Jethro Tull|1imi Hendrix Experience|n|0Coltrane, John|0Hooker, John Lee|0Lennon, John|0Mayall, John & the Bluesbreakers|3er, John|0Prine, John|0Cash, Johnny|0Mitchell, Joni|e|e|0Joy Division|1uvenile|0KISS|0Musgraves, Kacey|0West, Kanye|b|b|b|b|0Bush, Kate|0Kelis|0Lamar, Kendrick|f|0Kid Cudi|2ng Sunny Ade|1raftwerk|0LCD Soundsystem|1L Cool J|1aBelle|2dy Gaga|0Del Ray, Lana|0Nyro, Laura|0Hill, Lauryn|0Led Zeppelin|c|c|c|0Cohen, Leonard|0Lil Wayne|0Ronstadt, Linda|0Little Richard|0Phair, Liz|0Lorde|1ynn, Loretta|1os Lobos|0Reed, Lou|0Love|0Williams, Lucinda|0Vandross, Luther|0Lynyrd Skynyrd|0M.I.A.|1C5|1GMT|1adonna|7|7|3villain|0Chao, Manu|1arey, Mariah|0Gaye, Marvin|c|0Blige, Mary J.|0Massive Attack|2xwell|1eat Loaf|0Haggard, Merle|0Metallica|0Jackson, Michael|g|0Davis, Miles|c|0Minutemen|0Lambert, Miranda|0Elliott, Missy|0Mobb Deep|3y|4 Grape|2tt the Hoople|3orhead|0Waters, Muddy|d|0My Bloody Valentine|3Chemical Romance|3Morning Jacket|0N.W.A|1as|0Diamond, Neil|0Young, Neil|b|b|b|b|0Neutral Milk Hotel|2w Order|4York Dolls|0Drake, Nick|b|0Simone, Nina|0Nine Inch Nails|2rvana|7|1o Doubt|0Oasis|0Coleman, Ornette|0Redding, Otis|d|d|d|0OutKast|7|0Harvey, PJ|a|0Parliament|0Cline, Patsy|0Smith, Patti|0Paul Butterfield Blues Band|0McCartney, Paul|0Simon, Paul|0Pavement|8|1earl Jam|2t Shop Boys|0Gabriel, Peter|0Wolf, Peter|0Spector, Phil|0Pink Floyd|a|a|2xies|1ortishead|1retenders|2imal Scream|3nce|6 and the Revolution|6|2ofessor Longhair|1ublic Enemy|c|7Image Ltd.|2lp|0Queen|2icksilver Messenger Service|0R.E.M.|6|1adiohead|9|9|9|2ekwon|2ge Against the Machine|2mones|0Newman, Randy|d|0Charles, Ray|c|0Red Hot Chili Peppers|0Thompson, Richard & Linda|0Rihanna|0Johnson, Robert|f|0Flack, Roberta|0Robyn|0Stewart, Rod|0Rolling Stones|e|e|e|e|e|e|e|e|2salia|2xy Music|a|a|1ufus|2n D.M.C.|2sh|0SZA|1ade|0Cooke, Sam|0Santana|1elena|2x Pistols|1hakira|0Twain, Shania|0Crow, Sheryl|0Simon & Garfunkel|h|h|0O'Connor, Sinead|0Sleater Kinney|2y & The Family Stone|m|0Robinson, Smokey & the Miracles|0Snoop Doggy Dogg|1olange|2nic Youth|2undgarden|1parks|1teely Dan|a|0Earle, Steve|0Miller, Steve Band|0Wonder, Stevie|e|e|0Suicide|0T. Rex|1LC|1alking Heads|d|d|2me Impala|0Swift, Taylor|0Television|0Allman Brothers Band|0B-52s|1and, The|1each Boys|a|a|a|3tles|7|7|7|7|7|7|7|7|1reeders|1yrds|5|5|5|0Carpenters|0Dixie Chicks|0Clash|5|1ure|0Doors|5|1rifters|0Flying Burrito Brothers|0Go Gos|0Isley Brothers|0Jesus and Mary Chain|0Kinks|5|0Magnetic Fields|2mas and the Papas|1eters|1odern Lovers|2thers of Invention|0Notorious B.I.G.|0O'Jays|0Pharcyde|1ogues|2lice|6|6|0Raincoats|1eplacements|1onettes|2ots|0Slits|1mashing Pumpkins|2iths|6|6|1tone Roses|3oges|0Iggy and The Stooges|0Strokes|0Temptations|0Velvet Underground|i|i|0Weeknd|1hite Stripes|2o, The|8|8|8|8|8|0Yardbirds|0Zombies|0Rundgren, Todd|0Petty, Tom & the Heartbreakers|a|0Waits, Tom|a|0Toots & The Maytals|0Amos, Tori|0Chapman, Tracey|0U2|2|2|2|1sher|0Vampire Weekend|2n Halen|0Morrison, Van|0Various Artists|f|f|f|0War|1eezer|0Houston, Whitney|0Wilco|0Nelson, Willie|0Wire|1u Tang Clan|0X|1-Ray Spex|0Yeah Yeah Yeahs|2s|1o La Tengo|0ZZ Top","sep":"|"},{"f":"0Frank Sinatra|0Elvis Presley|0Beyonce|1uddy Holly|0Miles Davis|0John Coltrane|0Erykah Badu|0Howlin' Wolf|0Taylor Swift|0Fiona Apple|0Ray Charles|0Janet Jackson|1oni Mitchell|0Muddy Waters|0Aretha Franklin|0Robert Johnson|0Sade|0Bjork|0James Brown|0Bob Dylan|0The Beatles|0Phil Spector|0Mary J. Blige|0PJ Harvey|0M.I.A.|0Lucinda Williams|1oretta Lynn|0Otis Redding|0The Byrds|0B.B. King|0The Beach Boys|0Rolling Stones|0The Who|4Yardbirds|0Kanye West|1endrick Lamar|0Cream|0Simon & Garfunkel|0The Mothers of Invention|5amas and the Papas|0Jimi Hendrix Experience|0The Doors|0Pink Floyd|0The Kinks|0OutKast|0Little Walter|0Merle Haggard|0The Velvet Underground|0Jefferson Airplane|0Van Morrison|0The Band|0Johnny Cash|0Dr. John|0Frank Ocean|0Grateful Dead|0Drake|0Led Zeppelin|0Creedence Clearwater Revival|0MC5|0Neil Young|0The Stooges|0Santana|0Nick Drake|0Sly & The Family Stone|0John Lennon|0Black Sabbath|0The Beatles|0Jay-Z|0The Meters|0Randy Newman|0Elton John|0Sly & The Family Stone|0Marvin Gaye|0David Bowie|1'Angelo|0Funkadelic|0A Tribe Called Quest|0Lil Wayne|0Stevie Wonder|0Joy Division|0Tom Petty|0Oasis|0Curtis Mayfield|0Lou Reed|0Steely Dan|0Jimmy Cliff|0De La Soul|0Eagles|0Al Green|0Daft Punk|0Paul Simon|0Big Star|0LL Cool J|0Green Day|0Mott the Hoople|0Beastie Boys|0New Order|0Pavement|0Bruce Springsteen|0Roxy Music|0Bob Marley|0Jackson Browne|0ZZ Top|0Bill Withers|0Paul McCartney|0Brian Eno|1ob Marley|0Tom Waits|0Vampire Weekend|0Eric Clapton|0Richard & Linda Thompson|0Linda Ronstadt|0Arctic Monkeys|0Willie Nelson|0KISS|0Aerosmith|0Fleetwood Mac|0Ramones|2diohead|0The Clash|0Billy Joel|0Elvis Costello|0Nine Inch Nails|0Cheap Trick|0Talking Heads|0Manu Chao|0The Police|0Blondie|0Michael Jackson|0AC/DC|0The Cure|0Sonic Youth|0Prince|0U2|0X|0Various Artists|0R.E.M.|0Def Leppard|0Hank Williams|0The Replacements|0Run-DMC|0The Smiths|0Sam Cooke|0Metallica|0Public Enemy|0Jane's Addiction|0Pixies|0Madonna|0Bonnie Raitt|0Nirvana|0Pearl Jam|0Red Hot Chili Peppers|0Massive Attack|0Rage Against the Machine|0The Smashing Pumpkins|4Notorious B.I.G.|0No Doubt|0Beck|0Eminem|0The Supremes|4White Stripes|02Pac|050 Cent|0A Tribe Called Quest|1BBA|1C/DC|1aliyah|1dele|1erosmith|1l Green|8|2anis Morissette|2bert King|2ice Coltrane|8oper|4ia Keys|1my Winehouse|1nita Baker|1rcade Fire|3tic Monkeys|2etha Franklin|f|f|0B.B. King|1ad Bunny|2rry White|1eastie Boys|c|2ck|2e Gees|2lle & Sebastian|2yonce|1ig Brother & the Holding Company|4Star|8|2ll Withers|4ie EIlish|7Holiday|4y Joel|1jork|1lack Flag|6Sabbath|d|2ondie|3od, Sweat & Tears|2ur|1o Diddley|2b Dylan|9|9|9|9|9|9|9|9|9|4Marley|a|a|3by \"Blue\" Bland|2n Iver|3nie Raitt|2ogie Down Productions|2yz II Men|2z Scaggs|1rian Eno|6Wilson|3tney Spears|2uce Springsteen|h|h|h|h|h|h|h|1uddy Holly|2ena Vista Social Club|2ffalo Springfield|2zzcocks|0Can|2ptain Beefheart & His Magic Band|2role King|3s|2t Stevens|1harles Mingus|2eap Trick|2ic|2uck Berry|1octeau Twins|2ldplay|1ream|5|3edence Clearwater Revival|s|s|2osby, Stills & Nash|e, Nash & Young|1urtis Mayfield|f|1yndi Lauper|0D'Angelo|8|1EVO|1J Shadow|1addy Yankee|2ft Punk|2vid Bowie|b|b|b|b|b|1e La Soul|2f Leppard|2peche Mode|2rek and the Dominos|2stiny's Child|1iana Ross|2re Straits|1olly Parton|2n Henley|3na Summer|1r. Dre|4John|2ake|1usty Springfield|0EPMD|1agles|2rth, Wind & Fire|1cho and The Bunnymen|1lliott Smith|2ton John|a|a|a|a|2vis Costello|e|e|6Presley|d|1minem|6|1ric B. & Rakim|5Church|6lapton|2ykah Badu|1tta James|1urythmics|0Fela Kuti|1iona Apple|b|1leetwood Mac|1our Tops|1rank Ocean|6Sinatra|1ugees|2nkadelic|0GZA|1ang of Four|1eorge Harrison|7Michael|2tz & Gilberto|1hostface Killah|1illian Welch|1raham Parker|3m Parsons|3teful Dead|d|d|2een Day|1uns N' Roses|0Hank Williams|2rry Nilsson|6Styles|1erbie Hancock|1ole|2wlin' Wolf|1üsker Dü|0Ian Dury and the Blockheads|1ce Cube|1ke & Tina Turner|1saac Hayes|0J Dilla|1ackie Wilson|4son Browne|e|2mes Brown|b|b|b|6Taylor|2ne's Addiction|4t Jackson|d|3is Joplin|2son Isbell|2y-Z|5|1eff Buckley|4erson Airplane|2rry Lee Lewis|2thro Tull|1imi Hendrix Experience|n|1ohn Coltrane|5Lee Hooker|7nnon|5Mayall & the Bluesbreakers|8er|5Prince|4ny Cash|2ni Mitchell|d|d|2y Division|1uvenile|0KISS|1acey Musgraves|2nye West|a|a|a|a|2te Bush|1elis|2ndrick Lamar|e|1id Cudi|2ng Sunny Ade|1raftwerk|0LCD Soundsystem|1L Cool J|1aBelle|2dy Gaga|2na Del Ray|2ura Nyro|4yn Hill|1ed Zeppelin|c|c|c|2onard Cohen|1il Wayne|2nda Ronstadt|2ttle Richard|2z Phair|1orde|3etta Lynn|2s Lobos|2u Reed|2ve|1ucinda Williams|2ther Vandross|1ynyrd Skynyrd|0M.I.A.|1C5|1GMT|1adonna|7|7|3villain|2nu Chao|2riah Carey|3vin Gaye|b|3y J. Blige|2ssive Attack|2xwell|1eat Loaf|2rle Haggard|2tallica|1ichael Jackson|f|2les Davis|b|2nutemen|2randa Lambert|2ssy Elliott|1obb Deep|3y|4 Grape|2tt the Hoople|3örhead|1uddy Waters|c|1y Bloody Valentine|3Chemical Romance|3Morning Jacket|0N.W.A|1as|1eil Diamond|5Young|a|a|a|a|2utral Milk Hotel|2w Order|4York Dolls|1ick Drake|a|2na Simone|3e Inch Nails|2rvana|7|1o Doubt|0Oasis|1rnette Coleman|1tis Redding|c|c|c|1utKast|7|0PJ Harvey|9|1arliament|2tsy Cline|3ti Smith|2ul Butterfield Blues Band|5McCartney|5Simon|2vement|8|1earl Jam|2t Shop Boys|3er Gabriel|6Wolf|1hil Spector|1ink Floyd|a|a|2xies|1ortishead|1retenders|2imal Scream|3nce|6|6|2ofessor Longhair|1ublic Enemy|c|7Image Ltd.|2lp|0Queen|2icksilver Messenger Service|0R.E.M.|6|1adiohead|9|9|9|2ekwon|2ge Against the Machine|2mones|2ndy Newman|c|2y Charles|b|1ed Hot Chili Peppers|1ichard & Linda Thompson|2hanna|1obert Johnson|e|6a Flack|3yn|2d Stewart|2lling Stones|e|e|e|e|e|e|e|e|2salia|2xy Music|a|a|1ufus|2n-DMC|2sh|0SZA|1ade|2m Cooke|2ntana|1elena|2x Pistols|1hakira|3nia Twain|2eryl Crow|1imon & Garfunkel|h|h|2nead O'Connor|1leater-Kinney|2y & The Family Stone|m|1mokey Robinson & the Miracles|1noop Dogg|1olange|2nic Youth|2undgarden|1parks|1teely Dan|a|3ve Earle|6Miller|4ie Wonder|d|d|1uicide|0T. Rex|1LC|1alking Heads|d|d|2me Impala|2ylor Swift|1elevision|1he Allman Brothers Band|4B-52s|5and|5each Boys|e|e|e|7tles|b|b|b|b|b|b|b|b|5reeders|5yrds|9|9|9|4Carpenters|5hicks|5lash|9|5ure|4Doors|9|5rifters|4Flying Burrito Brothers|4Go-Go's|4Isley Brothers|4Jesus and Mary Chain|4Kinks|9|4Magnetic Fields|6mas and the Papas|5eters|5odern Lovers|6thers of Invention|4Notorious B.I.G.|4O'Jays|4Pharcyde|5ogues|6lice|a|a|4Raincoats|5eplacements|5onettes|6ots|4Slits|5mashing Pumpkins|6iths|a|a|5tone Roses|7oges|b|6rokes|4Temptations|4Velvet Underground|m|m|4Weeknd|5hite Stripes|6o|7|7|7|7|7|4Yardbirds|4Zombies|1odd Rundgren|2m Petty|9|4Waits|9|2ots & The Maytals|2ri Amos|1racey Chapman|0U2|2|2|2|1sher|0Vampire Weekend|2n Halen|4Morrison|2rious Artists|f|f|f|0War|1eezer|1hitney Houston|1ilco|3lie Nelson|2re|1u-Tang Clan|0X|1-Ray Spex|0Yeah Yeah Yeahs|2s|1o La Tengo|0ZZ Top","sep":"|"},{"d":"Studio|Compilation|Live|Greatest Hits|Soundtrack","r":"0*7,1*1,0*5,2*2,1*1,0*2,2*1,0*2,1*1,0*7,2*1,0*f,3*1,0*5,2*1,0*6,2*1,0*c,3*1,0*a,4*1,0*2,4*1,0*s,2*1,0*f,1*1,0*4,1*1,0*2,3*1,0*3,2*1,0*g,3*1,0*a,3*1,0*1,1*1,0*a,2*1,0*5,4*1,0*t,3*1,1*1,0*g,3*1,0*2,1*1,0*6,2*1,0*1,3*1,0*4,3*1,0*5,1*1,0*8,1*1,0*q,3*1,0*5,1*1,0*r,2*1,0*3,1*1,0*4,1*1,0*3,3*1,0*2,1*1,0*2,3*1,1*1,2*1,1*1,0*a,1*1,0*4,1*1,0*m,1*1,0*e,3*1,0*3,3*1,0*b,3*1,0*9,1*1,0*e,1*1,0*5,3*1,0*3,2*1,0*2,1*1,0*6,2*1,0*4,1*1,2*1,1*1,0*5,3*1,0*a,1*1,0*a,1*1,0*5,2*1,0*c,1*1,0*3,1*2,0*l,3*1,0*8,3*1,0*m,2*1,0*3,2*1,0*4,1*1,0*a,1*1,3*1,0*a,3*1,0*4,1*1,0*2,3*1,0*g,1*1,0*6,3*1,0*6,2*1,0*b,1*1,0*a,1*4,0*d","sep":"|"}]}]);
const COLONY = [
{"id":"n-78583433","guard":[["hasAny",["clean","item number","nth","position"]],["has","name"],["not",["has","which"]],["not",["has","crosby"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-007f1ec8","guard":[["hasAny",["clean","invert case","item number","nth","position","swap case","toggle case"]],["has","name"],["not",["has","which"]],["not",["has","crosby"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-545387f4","guard":[["hasAny",["clean","item number","lower case","lowercase","nth","position","small letters"]],["has","name"],["not",["has","which"]],["not",["has","crosby"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-d76ea24c","guard":[["hasAny",["all caps","capital letters","capitals","clean","item number","nth","position","upper case","uppercase"]],["has","name"],["not",["has","which"]],["not",["has","crosby"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-fba451c3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","clean","item number","nth","position","title case"]],["has","name"],["not",["has","which"]],["not",["has","crosby"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-ac69bab1","guard":[["has","clean"],["not",["has","which"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"name"}]]],"mem":{"table":{"for The Birth of Soul":"The clean name of The Birth of Soul is Ray Charles.","of Avalon":"The clean name of Avalon is Roxy Music.","of Little Earthquakes":"The clean name of Little Earthquakes is Tori Amos.","of the album In the Aeroplane Over the Sea":"The clean name of In the Aeroplane Over the Sea is Neutral Milk Hotel.","for The Joshua Tree":"The clean name of The Joshua Tree is U2.","of Violator":"The clean name of Violator is Depeche Mode.","of the album Help":"The clean name of Help! is The Beatles.","of Moving Pictures":"The clean name of Moving Pictures is Rush.","for Body Talk":"The clean name of Body Talk is Robyn.","for Time Out of Mind":"The clean name of Time Out of Mind is Bob Dylan.","for Entroducing":"The clean name of Entroducing is DJ Shadow.","of the album Dummy":"The clean name of Dummy is Portishead.","of Chief":"The clean name of Chief is Eric Church.","for Ram":"The clean name of Ram is Paul McCartney.","of the album Freak Out":"The clean name of Freak Out! is The Mothers of Invention.","of King of the Delta Blues Singers":"The clean name of King of the Delta Blues Singers is Robert Johnson.","of the album Born to Run":"The clean name of Born to Run is Bruce Springsteen.","of the album Aladdin Sane":"The clean name of Aladdin Sane is David Bowie.","for Outlandos d'Amour":"The clean name of Outlandos d'Amour is The Police.","of Rapture":"The clean name of Rapture is Anita Baker.","of the album Black Messiah":"The clean name of Black Messiah is D'Angelo.","of the album Illmatic":"The clean name of Illmatic is Nas.","for Amazing Grace":"The clean name of Amazing Grace is Aretha Franklin.","of the album Yeezus":"The clean name of Yeezus is Kanye West.","for Extraordinary Machine":"The clean name of Extraordinary Machine is Fiona Apple.","of Raising Hell":"The clean name of Raising Hell is Run-DMC.","for Out of Our Heads":"The clean name of Out of Our Heads is Rolling Stones.","for The Infamous":"The clean name of The Infamous is Mobb Deep.","of the album Criminal Minded":"The clean name of Criminal Minded is Boogie Down Productions.","of the album Songs in the Key of Life":"The clean name of Songs in the Key of Life is Stevie Wonder.","for 400 Degreez":"The clean name of 400 Degreez is Juvenile.","of the album Tonight's the Night":"The clean name of Tonight's the Night is Neil Young.","of Close to the Edge":"The clean name of Close to the Edge is Yes.","for Yo! Bum Rush the Show":"The clean name of Yo! Bum Rush the Show is Public Enemy.","for The Wild, the Innocent & the E Street Shuffle":"The clean name of The Wild, the Innocent & the E Street Shuffle is Bruce Springsteen.","of Born This Way":"The clean name of Born This Way is Lady Gaga.","for Wish You Were Here":"The clean name of Wish You Were Here is Pink Floyd.","of the album Head Hunters":"The clean name of Head Hunters is Herbie Hancock.","of Sandinista":"The clean name of Sandinista! is The Clash.","of the album Mr. Excitement":"The clean name of Mr. Excitement! is Jackie Wilson.","of the album Stankonia":"The clean name of Stankonia is OutKast.","of the album Exodus":"The clean name of Exodus is Bob Marley.","of Time (The Revelator)":"The clean name of Time (The Revelator) is Gillian Welch.","for 1999":"The clean name of 1999 is Prince.","of Parsley, Sage, Rosemary and Thyme":"The clean name of Parsley, Sage, Rosemary and Thyme is Simon & Garfunkel.","of the album So":"The clean name of So is Peter Gabriel.","of the album The Definitive Collection":"The clean name of The Definitive Collection is ABBA.","for Man on the Moon: The End of the Day":"The clean name of Man on the Moon: The End of the Day is Kid Cudi.","of King of the Delta Blues Singers, vol 2":"The clean name of King of the Delta Blues Singers, vol 2 is Robert Johnson.","of the album Germ Free Adolescents":"The clean name of Germ Free Adolescents is X-Ray Spex.","of Substance 1987":"The clean name of Substance 1987 is New Order.","of My Beautiful Dark Twisted Fantasy":"The clean name of My Beautiful Dark Twisted Fantasy is Kanye West.","of the album The Black Parade":"The clean name of The Black Parade is My Chemical Romance.","of Barrio Fino":"The clean name of Barrio Fino is Daddy Yankee.","of the album Purple Rain":"The clean name of Purple Rain is Prince.","of the album Thriller":"The clean name of Thriller is Michael Jackson.","of the album Wild Honey":"The clean name of Wild Honey is The Beach Boys.","for Synchronicity":"The clean name of Synchronicity is The Police.","of the album Let It Bleed":"The clean name of Let It Bleed is Rolling Stones.","of the album 69 Love Songs":"The clean name of 69 Love Songs is The Magnetic Fields.","for Quadrophenia":"The clean name of Quadrophenia is The Who.","for Tattoo You":"The clean name of Tattoo You is Rolling Stones.","of the album John Wesley Harding":"The clean name of John Wesley Harding is Bob Dylan.","for Live at the Apollo, 1962":"The clean name of Live at the Apollo, 1962 is James Brown.","of the album Music From Big Pink":"The clean name of Music From Big Pink is The Band.","for The Complete Recordings":"The clean name of The Complete Recordings is Robert Johnson.","of Here Come the Warm Jets":"The clean name of Here Come the Warm Jets is Brian Eno.","for Oracular Spectacular":"The clean name of Oracular Spectacular is MGMT.","of Born in the U.S.A":"The clean name of Born in the U.S.A. is Bruce Springsteen.","of American Recordings":"The clean name of American Recordings is Johnny Cash.","for What's Going On":"The clean name of What's Going On is Marvin Gaye.","for Paid in Full":"The clean name of Paid in Full is Eric B. & Rakim.","of the album Confessions":"The clean name of Confessions is Usher.","of Pet Sounds":"The clean name of Pet Sounds is The Beach Boys.","for Kala":"The clean name of Kala is M.I.A..","for Hotel California":"The clean name of Hotel California is Eagles.","of Eliminator":"The clean name of Eliminator is ZZ Top.","of Love Deluxe":"The clean name of Love Deluxe is Sade.","for Here, My Dear":"The clean name of Here, My Dear is Marvin Gaye.","of Portrait of a Legend 1951-1964":"The clean name of Portrait of a Legend 1951-1964 is Sam Cooke.","for The Immaculate Collection":"The clean name of The Immaculate Collection is Madonna.","of the album Stardust":"The clean name of Stardust is Willie Nelson.","for Live/Dead":"The clean name of Live/Dead is Grateful Dead.","of How Will the Wolf Survive":"The clean name of How Will the Wolf Survive? is Los Lobos.","for Live at Leeds":"The clean name of Live at Leeds is The Who.","of Songs of Love and Hate":"The clean name of Songs of Love and Hate is Leonard Cohen.","of Enter the Wu-Tang: 36 Chambers":"The clean name of Enter the Wu-Tang: 36 Chambers is Wu-Tang Clan.","for Kaleidoscope":"The clean name of Kaleidoscope is Kelis."}}},
{"id":"n-dffa497f","guard":[["has","clean"],["not",["has","which"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"clean"}]]],"mem":{"table":{"name for The Birth of Soul":"The clean name of The Birth of Soul is Ray Charles.","name of Avalon":"The clean name of Avalon is Roxy Music.","name of Little Earthquakes":"The clean name of Little Earthquakes is Tori Amos.","name of the album In the Aeroplane Over the Sea":"The clean name of In the Aeroplane Over the Sea is Neutral Milk Hotel.","name for The Joshua Tree":"The clean name of The Joshua Tree is U2.","name of Violator":"The clean name of Violator is Depeche Mode.","name of the album Help":"The clean name of Help! is The Beatles.","name of Moving Pictures":"The clean name of Moving Pictures is Rush.","name for Body Talk":"The clean name of Body Talk is Robyn.","name for Time Out of Mind":"The clean name of Time Out of Mind is Bob Dylan.","name for Entroducing":"The clean name of Entroducing is DJ Shadow.","name of the album Dummy":"The clean name of Dummy is Portishead.","name of Chief":"The clean name of Chief is Eric Church.","name for Ram":"The clean name of Ram is Paul McCartney.","name of the album Freak Out":"The clean name of Freak Out! is The Mothers of Invention.","name of King of the Delta Blues Singers":"The clean name of King of the Delta Blues Singers is Robert Johnson.","name of the album Born to Run":"The clean name of Born to Run is Bruce Springsteen.","name of the album Aladdin Sane":"The clean name of Aladdin Sane is David Bowie.","name for Outlandos d'Amour":"The clean name of Outlandos d'Amour is The Police.","name of Rapture":"The clean name of Rapture is Anita Baker.","name of the album Black Messiah":"The clean name of Black Messiah is D'Angelo.","name of the album Illmatic":"The clean name of Illmatic is Nas.","name for Amazing Grace":"The clean name of Amazing Grace is Aretha Franklin.","name of the album Yeezus":"The clean name of Yeezus is Kanye West.","name for Extraordinary Machine":"The clean name of Extraordinary Machine is Fiona Apple.","name of Raising Hell":"The clean name of Raising Hell is Run-DMC.","name for Out of Our Heads":"The clean name of Out of Our Heads is Rolling Stones.","name for The Infamous":"The clean name of The Infamous is Mobb Deep.","name of the album Criminal Minded":"The clean name of Criminal Minded is Boogie Down Productions.","name of the album Songs in the Key of Life":"The clean name of Songs in the Key of Life is Stevie Wonder.","name for 400 Degreez":"The clean name of 400 Degreez is Juvenile.","name of the album Tonight's the Night":"The clean name of Tonight's the Night is Neil Young.","name of Close to the Edge":"The clean name of Close to the Edge is Yes.","name for Yo! Bum Rush the Show":"The clean name of Yo! Bum Rush the Show is Public Enemy.","name for The Wild, the Innocent & the E Street Shuffle":"The clean name of The Wild, the Innocent & the E Street Shuffle is Bruce Springsteen.","name of Born This Way":"The clean name of Born This Way is Lady Gaga.","name for Wish You Were Here":"The clean name of Wish You Were Here is Pink Floyd.","name of the album Head Hunters":"The clean name of Head Hunters is Herbie Hancock.","name of Sandinista":"The clean name of Sandinista! is The Clash.","name of the album Mr. Excitement":"The clean name of Mr. Excitement! is Jackie Wilson.","name of the album Stankonia":"The clean name of Stankonia is OutKast.","name of the album Exodus":"The clean name of Exodus is Bob Marley.","name of Time (The Revelator)":"The clean name of Time (The Revelator) is Gillian Welch.","name for 1999":"The clean name of 1999 is Prince.","name of Parsley, Sage, Rosemary and Thyme":"The clean name of Parsley, Sage, Rosemary and Thyme is Simon & Garfunkel.","name of the album So":"The clean name of So is Peter Gabriel.","name of the album The Definitive Collection":"The clean name of The Definitive Collection is ABBA.","name for Man on the Moon: The End of the Day":"The clean name of Man on the Moon: The End of the Day is Kid Cudi.","name of King of the Delta Blues Singers, vol 2":"The clean name of King of the Delta Blues Singers, vol 2 is Robert Johnson.","name of the album Germ Free Adolescents":"The clean name of Germ Free Adolescents is X-Ray Spex.","name of Substance 1987":"The clean name of Substance 1987 is New Order.","name of My Beautiful Dark Twisted Fantasy":"The clean name of My Beautiful Dark Twisted Fantasy is Kanye West.","name of the album The Black Parade":"The clean name of The Black Parade is My Chemical Romance.","name of Barrio Fino":"The clean name of Barrio Fino is Daddy Yankee.","name of the album Purple Rain":"The clean name of Purple Rain is Prince.","name of the album Thriller":"The clean name of Thriller is Michael Jackson.","name of the album Wild Honey":"The clean name of Wild Honey is The Beach Boys.","name for Synchronicity":"The clean name of Synchronicity is The Police.","name of the album Let It Bleed":"The clean name of Let It Bleed is Rolling Stones.","name of the album 69 Love Songs":"The clean name of 69 Love Songs is The Magnetic Fields.","name for Quadrophenia":"The clean name of Quadrophenia is The Who.","name for Tattoo You":"The clean name of Tattoo You is Rolling Stones.","name of the album John Wesley Harding":"The clean name of John Wesley Harding is Bob Dylan.","name for Live at the Apollo, 1962":"The clean name of Live at the Apollo, 1962 is James Brown.","name of the album Music From Big Pink":"The clean name of Music From Big Pink is The Band.","name for The Complete Recordings":"The clean name of The Complete Recordings is Robert Johnson.","name of Here Come the Warm Jets":"The clean name of Here Come the Warm Jets is Brian Eno.","name for Oracular Spectacular":"The clean name of Oracular Spectacular is MGMT.","name of Born in the U.S.A":"The clean name of Born in the U.S.A. is Bruce Springsteen.","name of American Recordings":"The clean name of American Recordings is Johnny Cash.","name for What's Going On":"The clean name of What's Going On is Marvin Gaye.","name for Paid in Full":"The clean name of Paid in Full is Eric B. & Rakim.","name of the album Confessions":"The clean name of Confessions is Usher.","name of Pet Sounds":"The clean name of Pet Sounds is The Beach Boys.","name for Kala":"The clean name of Kala is M.I.A..","name for Hotel California":"The clean name of Hotel California is Eagles.","name of Eliminator":"The clean name of Eliminator is ZZ Top.","name of Love Deluxe":"The clean name of Love Deluxe is Sade.","name for Here, My Dear":"The clean name of Here, My Dear is Marvin Gaye.","name of Portrait of a Legend 1951-1964":"The clean name of Portrait of a Legend 1951-1964 is Sam Cooke.","name for The Immaculate Collection":"The clean name of The Immaculate Collection is Madonna.","name of the album Stardust":"The clean name of Stardust is Willie Nelson.","name for Live/Dead":"The clean name of Live/Dead is Grateful Dead.","name of How Will the Wolf Survive":"The clean name of How Will the Wolf Survive? is Los Lobos.","name for Live at Leeds":"The clean name of Live at Leeds is The Who.","name of Songs of Love and Hate":"The clean name of Songs of Love and Hate is Leonard Cohen.","name of Enter the Wu-Tang: 36 Chambers":"The clean name of Enter the Wu-Tang: 36 Chambers is Wu-Tang Clan.","name for Kaleidoscope":"The clean name of Kaleidoscope is Kelis."}}},
{"id":"n-64bf0da1","guard":[["hasAny",["amazing","avalon","barrio","beautiful","birth","blues","body","born","bum","california","chief","close","collection","damour","day","degreez","earthquakes","eliminator","entroducing","extraordinary","for","full","going","hell","here","infamous","item number","joshua","kala","kaleidoscope","legend","live","livedead","love","moving","normalise","normalize","nth","oracular","out","parsley","pet","position","quadrophenia","ram","rapture","recordings","sandinista","simplify the text","substance","survive","synchronicity","tattoo","time","violator","wild"]],["has","clean"],["has","name"],["not",["has","band"]],["not",["has","bland"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}],["sense.howMany"]]],"mem":null},
{"id":"n-5781a375","guard":[["hasAny",["amazing","avalon","barrio","beautiful","birth","blues","body","born","bum","california","chambers","chief","close","collection","damour","day","degreez","delete","earthquakes","eliminator","entroducing","extraordinary","full","going","hell","here","infamous","item number","joshua","kala","kaleidoscope","legend","live","love","moving","nth","oracular","out","parsley","pet","position","quadrophenia","ram","rapture","recordings","remove","sandinista","strip out","substance","survive","synchronicity","tattoo","time","violator","wild"]],["has","clean"],["has","name"],["not",["has","band"]],["not",["has","bland"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}],["sense.lastWord"]]],"mem":null},
{"id":"n-a172dc63","guard":[["hasAny",["amazing","avalon","barrio","beautiful","birth","blues","body","born","bum","california","chambers","chief","close","collection","damour","day","degreez","earthquakes","eliminator","entroducing","extraordinary","full","going","hell","here","infamous","item number","joshua","kala","kaleidoscope","legend","live","love","moving","nth","oracular","out","parsley","pet","position","quadrophenia","ram","rapture","recordings","sandinista","separate by","split","split by","substance","survive","synchronicity","tattoo","time","violator","wild"]],["has","clean"],["has","name"],["not",["has","band"]],["not",["has","bland"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}],["sense.lastWord"]]],"mem":null},
{"id":"n-8cdf1897","guard":[["hasAny",["adolescents","aeroplane","avalon","barrio","black","bleed","body","bum","california","close","collection","confessions","criminal","day","degreez","deluxe","dummy","eliminator","entroducing","full","heads","illmatic","infamous","item number","joshua","kala","kaleidoscope","livedead","moving","nth","oracular","parsley","position","stankonia","substance","survive","tattoo","violator","way","wish"]],["has","clean"]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]],"mem":null},
{"id":"n-0fa9c2e9","guard":[["hasAny",["adolescents","aeroplane","avalon","barrio","black","bleed","body","bum","california","close","collection","confessions","criminal","day","degreez","deluxe","dummy","eliminator","entroducing","full","heads","illmatic","infamous","item number","joshua","kala","kaleidoscope","livedead","lower case","lowercase","moving","nth","oracular","parsley","position","small letters","stankonia","substance","survive","tattoo","violator","way","wish"]],["has","clean"]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-30b8cbad","guard":[["hasAny",["adolescents","aeroplane","all caps","avalon","barrio","black","bleed","body","bum","california","capital letters","capitals","close","collection","confessions","criminal","day","degreez","deluxe","dummy","eliminator","entroducing","full","heads","illmatic","infamous","item number","joshua","kala","kaleidoscope","livedead","moving","nth","oracular","parsley","position","stankonia","substance","survive","tattoo","upper case","uppercase","violator","way","wish"]],["has","clean"]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-37637af5","guard":[["hasAny",["adolescents","aeroplane","avalon","barrio","black","bleed","body","bum","california","capitalise","capitalize","capitalize each word","close","collection","confessions","criminal","day","degreez","deluxe","dummy","eliminator","entroducing","full","heads","illmatic","infamous","item number","joshua","kala","kaleidoscope","livedead","moving","nth","oracular","parsley","position","stankonia","substance","survive","tattoo","title case","violator","way","wish"]],["has","clean"]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-9bb1387f","guard":[["hasAny",["adolescents","aeroplane","avalon","barrio","black","bleed","body","bum","california","close","collection","confessions","criminal","day","degreez","deluxe","dummy","eliminator","entroducing","full","heads","illmatic","infamous","invert case","item number","joshua","kala","kaleidoscope","livedead","moving","nth","oracular","parsley","position","stankonia","substance","survive","swap case","tattoo","toggle case","violator","way","wish"]],["has","clean"]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-6c96018c","guard":[["hasAny",["adolescents","aeroplane","avalon","barrio","black","bleed","body","bum","california","close","collection","confessions","criminal","day","degreez","deluxe","dummy","eliminator","entroducing","full","heads","illmatic","infamous","item number","joshua","kala","kaleidoscope","livedead","moving","normalise","normalize","nth","oracular","parsley","position","simplify the text","stankonia","substance","survive","tattoo","violator","way","wish"]],["has","clean"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}],["sense.howMany"]]],"mem":null},
{"id":"n-b2edf03d","guard":[["hasAny",["adolescents","aeroplane","avalon","barrio","black","bleed","body","bum","california","close","collection","confessions","criminal","day","degreez","delete","deluxe","dummy","eliminator","entroducing","full","heads","illmatic","infamous","item number","joshua","kala","kaleidoscope","moving","nth","oracular","parsley","position","remove","stankonia","strip out","substance","survive","tattoo","violator","way","wish"]],["has","clean"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}],["sense.lastWord"]]],"mem":null},
{"id":"n-b562f152","guard":[["hasAny",["adolescents","aeroplane","avalon","barrio","black","bleed","body","bum","california","close","collection","confessions","criminal","day","degreez","deluxe","dummy","eliminator","entroducing","full","heads","illmatic","infamous","item number","joshua","kala","kaleidoscope","moving","nth","oracular","parsley","position","separate by","split","split by","stankonia","substance","survive","tattoo","violator","way","wish"]],["has","clean"]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}],["sense.lastWord"]]],"mem":null},
{"id":"n-44236ade","guard":[["hasAny",["adolescents","aeroplane","avalon","barrio","black","bleed","body","bum","caesar cipher","california","close","collection","confessions","criminal","day","deluxe","dummy","eliminator","entroducing","full","heads","illmatic","infamous","item number","joshua","kala","kaleidoscope","livedead","moving","nth","oracular","parsley","position","rotate the letters","shift by","shift each letter","stankonia","survive","tattoo","violator","way","wish"]],["has","clean"]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}],["sense.howMany"]]],"mem":null},
{"id":"n-05cc5ddc","guard":[["hasAny",["aeroplane","avalon","barrio","bleed","body","bum","california","close","collection","confessions","criminal","day","degreez","deluxe","dummy","eliminator","entroducing","heads","illmatic","infamous","item number","joshua","kaleidoscope","livedead","moving","normalise","normalize","nth","oracular","parade","position","simplify the text","stankonia","substance","survive","tattoo","violator","way","wish"]],["has","clean"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}],{"lit":1}]],"mem":null},
{"id":"n-1784c7de","guard":[["hasAny",["aeroplane","avalon","barrio","bleed","body","bum","california","close","collection","confessions","criminal","day","degreez","deluxe","dummy","eliminator","entroducing","heads","illmatic","infamous","item number","joshua","kaleidoscope","livedead","moving","normalise","normalize","nth","oracular","position","simplify the text","stankonia","substance","survive","tattoo","violator","way","wish"]],["has","clean"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}],{"lit":2}]],"mem":null},
{"id":"n-8d15a103","guard":[["hasAny",["amazing","birth","body","bum","california","complete","damour","day","dear","degreez","e","entroducing","extraordinary","for","full","going","heads","immaculate","infamous","item number","joshua","kala","kaleidoscope","live","livedead","mind","nth","oracular","position","quadrophenia","ram","synchronicity","tattoo","wish"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-134e4726","guard":[["hasAny",["clean","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"for"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-225819c1","guard":[["not",["hasAny",["19990530","19991031","20130421","20140921","act","adult","album","applicationvndopenxmlformatsofficedocumentwordprocessingmldocument","april","artist","author","bank","carr","castello","category","character","cheddar","code","consecutive","consortium","country","date","director","ep","exposition","featuring","gender","hex","id","imdb","language","loa","lowcarbon","manhattan","manufacturer","mcgraw","n3","nationality","nontertiary","number","published","rating","region","release","ring","scene","season","shortcode","sort","startling","surgeons","test","title","type","usds","v","week","writers"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"for"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-ee4f5ca8","guard":[["hasAny",["amazing","birth","body","bum","california","complete","damour","day","dear","degreez","e","entroducing","extraordinary","for","full","going","heads","immaculate","infamous","item number","joshua","kala","kaleidoscope","live","livedead","mind","nth","oracular","position","quadrophenia","ram","synchronicity","tattoo","wish"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The clean ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-24868686","guard":[["not",["hasAny",["19990530","19991031","20130421","20140921","act","adult","album","applicationvndopenxmlformatsofficedocumentwordprocessingmldocument","april","artist","author","bank","carr","castello","category","character","cheddar","code","consecutive","consortium","country","date","director","ep","exposition","featuring","gender","hex","id","imdb","language","loa","lowcarbon","manhattan","manufacturer","mcgraw","n3","nationality","nontertiary","number","published","rating","region","release","ring","scene","season","shortcode","sort","startling","surgeons","test","title","type","usds","v","week","writers"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["sense.after",{"lit":"for"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-2a9b922a","guard":[["hasAny",["clean","element","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["sense.after",{"lit":"for"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-7169404d","guard":[["hasAny",["amazing","birth","body","bum","california","complete","damour","day","dear","degreez","e","entroducing","extraordinary","for","full","going","heads","immaculate","infamous","item number","joshua","kala","kaleidoscope","live","livedead","mind","nth","oracular","position","quadrophenia","ram","synchronicity","tattoo","wish"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-ce26fef0","guard":[["hasAny",["amazing","birth","body","bum","california","complete","damour","day","dear","degreez","e","entroducing","extraordinary","for","full","going","heads","immaculate","infamous","item number","joshua","kala","kaleidoscope","live","livedead","mind","nth","oracular","position","quadrophenia","ram","synchronicity","tattoo","wish"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-0392d187","guard":[["hasAny",["amazing","birth","body","bum","california","complete","damour","day","dear","degreez","e","entroducing","extraordinary","for","full","going","heads","immaculate","infamous","item number","joshua","kala","kaleidoscope","live","livedead","mind","nth","oracular","position","quadrophenia","ram","synchronicity","tattoo","wish"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-7b32dc3b","guard":[["hasAny",["amazing","birth","body","bum","california","complete","damour","day","dear","degreez","e","entroducing","extraordinary","for","full","going","heads","immaculate","infamous","item number","joshua","kala","kaleidoscope","live","livedead","lower case","lowercase","mind","nth","oracular","position","quadrophenia","ram","small letters","synchronicity","tattoo","wish"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-fbe891e9","guard":[["hasAny",["amazing","birth","body","bum","california","class name","complete","damour","day","dear","degreez","e","entroducing","extraordinary","for","full","going","heads","immaculate","infamous","item number","joshua","kala","kaleidoscope","live","livedead","mind","nth","oracular","pascal case","pascalcase","position","quadrophenia","ram","synchronicity","tattoo","upper camel case","wish"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-02a71782","guard":[["hasAny",["amazing","birth","body","bum","california","complete","damour","day","dear","degreez","e","entroducing","extraordinary","for","full","going","heads","immaculate","infamous","item number","joshua","kala","kaleidoscope","live","livedead","lower case","lowercase","mind","nth","oracular","position","quadrophenia","ram","small letters","synchronicity","tattoo","wish"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-25017bfc","guard":[["hasAny",["amazing","birth","body","bum","california","complete","damour","day","dear","degreez","e","entroducing","extraordinary","for","full","going","heads","immaculate","infamous","invert case","item number","joshua","kala","kaleidoscope","live","livedead","mind","nth","oracular","position","quadrophenia","ram","swap case","synchronicity","tattoo","toggle case","wish"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-315a185e","guard":[["hasAny",["all caps","amazing","birth","body","bum","california","capital letters","capitals","complete","damour","day","dear","degreez","e","entroducing","extraordinary","for","full","going","heads","immaculate","infamous","item number","joshua","kala","kaleidoscope","live","livedead","mind","nth","oracular","position","quadrophenia","ram","synchronicity","tattoo","upper case","uppercase","wish"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-497f51c0","guard":[["hasAny",["amazing","birth","body","bum","california","capitalise","capitalize","capitalize each word","complete","damour","day","dear","degreez","e","entroducing","extraordinary","for","full","going","heads","immaculate","infamous","item number","joshua","kala","kaleidoscope","live","livedead","mind","nth","oracular","position","quadrophenia","ram","synchronicity","tattoo","title case","wish"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-4c877615","guard":[["hasAny",["amazing","birth","body","bum","california","complete","damour","day","dear","degreez","e","entroducing","extraordinary","for","full","going","heads","immaculate","infamous","item number","joshua","kala","kaleidoscope","live","livedead","mind","normalise","normalize","nth","oracular","position","quadrophenia","ram","simplify the text","synchronicity","tattoo","wish"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-4de2e9e9","guard":[["hasAny",["amazing","birth","body","bum","california","complete","damour","day","dear","degreez","e","entroducing","extraordinary","for","full","going","heads","immaculate","infamous","item number","joshua","kala","kaleidoscope","live","livedead","mind","normalise","normalize","nth","oracular","position","quadrophenia","ram","simplify the text","synchronicity","tattoo","wish"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-b3b8d913","guard":[["has","clean"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"1999":"The clean name of 1999 is Prince.","The Birth of Soul":"The clean name of The Birth of Soul is Ray Charles.","The Joshua Tree":"The clean name of The Joshua Tree is U2.","Body Talk":"The clean name of Body Talk is Robyn.","Time Out of Mind":"The clean name of Time Out of Mind is Bob Dylan.","Entroducing":"The clean name of Entroducing is DJ Shadow.","Ram":"The clean name of Ram is Paul McCartney.","Outlandos d'Amour":"The clean name of Outlandos d'Amour is The Police.","Amazing Grace":"The clean name of Amazing Grace is Aretha Franklin.","Extraordinary Machine":"The clean name of Extraordinary Machine is Fiona Apple.","Out of Our Heads":"The clean name of Out of Our Heads is Rolling Stones.","The Infamous":"The clean name of The Infamous is Mobb Deep.","400 Degreez":"The clean name of 400 Degreez is Juvenile.","Yo! Bum Rush the Show":"The clean name of Yo! Bum Rush the Show is Public Enemy.","The Wild, the Innocent & the E Street Shuffle":"The clean name of The Wild, the Innocent & the E Street Shuffle is Bruce Springsteen.","Wish You Were Here":"The clean name of Wish You Were Here is Pink Floyd.","Man on the Moon: The End of the Day":"The clean name of Man on the Moon: The End of the Day is Kid Cudi.","Synchronicity":"The clean name of Synchronicity is The Police.","Quadrophenia":"The clean name of Quadrophenia is The Who.","Tattoo You":"The clean name of Tattoo You is Rolling Stones.","Live at the Apollo, 1962":"The clean name of Live at the Apollo, 1962 is James Brown.","The Complete Recordings":"The clean name of The Complete Recordings is Robert Johnson.","Oracular Spectacular":"The clean name of Oracular Spectacular is MGMT.","What's Going On":"The clean name of What's Going On is Marvin Gaye.","Paid in Full":"The clean name of Paid in Full is Eric B. & Rakim.","Kala":"The clean name of Kala is M.I.A..","Hotel California":"The clean name of Hotel California is Eagles.","Here, My Dear":"The clean name of Here, My Dear is Marvin Gaye.","The Immaculate Collection":"The clean name of The Immaculate Collection is Madonna.","Live/Dead":"The clean name of Live/Dead is Grateful Dead.","Live at Leeds":"The clean name of Live at Leeds is The Who.","Kaleidoscope":"The clean name of Kaleidoscope is Kelis."}}},
{"id":"n-36c93074","guard":[["hasAny",["big","birth","bleed","body","born","bum","chief","close","day","dummy","full","going","help","here","honey","item number","kala","leeds","longest","longest one","longest word","nth","out","position","ram","so","songs"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-58889656","guard":[["hasAny",["american","avalon","barrio","beautiful","blues","born","chambers","chief","close","come","earthquakes","eliminator","hell","item number","legend","love","moving","nth","parsley","pet","position","rapture","revelator","sandinista","substance","survive","violator"]],["has","clean"],["has","name"],["has","of"],["not",["has","band"]],["not",["has","bland"]]],"pyramid":["render.template",{"lit":["The clean ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-e18191f8","guard":[["hasAny",["american","avalon","barrio","beautiful","blues","born","chambers","chief","close","come","earthquakes","eliminator","hell","item number","legend","love","moving","nth","parsley","pet","position","rapture","revelator","sandinista","substance","survive","violator"]],["has","clean"],["has","name"],["has","of"],["not",["has","band"]],["not",["has","bland"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-22dd290b","guard":[["hasAny",["american","avalon","barrio","beautiful","blues","born","chambers","chief","close","come","earthquakes","eliminator","hell","item number","legend","love","moving","nth","parsley","pet","position","rapture","revelator","sandinista","substance","survive","violator"]],["has","clean"],["has","name"],["has","of"],["not",["has","band"]],["not",["has","bland"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-33d289aa","guard":[["hasAny",["american","avalon","barrio","beautiful","blues","born","chambers","chief","close","come","earthquakes","eliminator","hell","item number","legend","love","moving","nth","parsley","pet","position","rapture","revelator","sandinista","substance","survive","violator"]],["has","clean"],["has","name"],["has","of"],["not",["has","band"]],["not",["has","bland"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-397ee059","guard":[["hasAny",["american","avalon","barrio","beautiful","blues","born","chambers","chief","close","come","earthquakes","eliminator","hell","item number","legend","love","moving","nth","parsley","pet","position","rapture","revelator","sandinista","substance","survive","violator"]],["has","clean"],["has","name"],["has","of"],["not",["has","band"]],["not",["has","bland"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-63dbe51c","guard":[["hasAny",["american","avalon","barrio","beautiful","blues","born","chambers","chief","close","come","earthquakes","eliminator","hell","item number","legend","love","lower case","lowercase","moving","nth","parsley","pet","position","rapture","revelator","sandinista","small letters","substance","survive","violator"]],["has","clean"],["has","name"],["has","of"],["not",["has","band"]],["not",["has","bland"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-1d3590f8","guard":[["hasAny",["american","avalon","barrio","beautiful","blues","born","capitalise","capitalize","capitalize each word","chambers","chief","close","come","earthquakes","eliminator","hell","item number","legend","love","moving","nth","parsley","pet","position","rapture","revelator","sandinista","substance","survive","title case","violator"]],["has","clean"],["has","name"],["has","of"],["not",["has","band"]],["not",["has","bland"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-46167207","guard":[["hasAny",["american","avalon","barrio","beautiful","blues","born","chambers","chief","close","come","earthquakes","eliminator","hell","invert case","item number","legend","love","moving","nth","parsley","pet","position","rapture","revelator","sandinista","substance","survive","swap case","toggle case","violator"]],["has","clean"],["has","name"],["has","of"],["not",["has","band"]],["not",["has","bland"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-586d4ebe","guard":[["hasAny",["amazing","birth","body","bum","caesar cipher","california","complete","damour","day","dear","e","entroducing","extraordinary","full","going","heads","immaculate","infamous","item number","joshua","kala","kaleidoscope","leeds","livedead","mind","nth","oracular","position","quadrophenia","ram","rotate the letters","shift by","shift each letter","synchronicity","tattoo","wish"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-80286ca3","guard":[["hasAny",["american","avalon","barrio","beautiful","blues","born","chambers","chief","close","come","earthquakes","eliminator","hell","item number","legend","love","lower case","lowercase","moving","nth","parsley","pet","position","rapture","revelator","sandinista","small letters","substance","survive","violator"]],["has","clean"],["has","name"],["has","of"],["not",["has","band"]],["not",["has","bland"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-efd9b06f","guard":[["hasAny",["all caps","american","avalon","barrio","beautiful","blues","born","capital letters","capitals","chambers","chief","close","come","earthquakes","eliminator","hell","item number","legend","love","moving","nth","parsley","pet","position","rapture","revelator","sandinista","substance","survive","upper case","uppercase","violator"]],["has","clean"],["has","name"],["has","of"],["not",["has","band"]],["not",["has","bland"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-28743343","guard":[["hasAny",["american","avalon","barrio","beautiful","blues","born","chambers","chief","close","come","earthquakes","eliminator","hell","item number","legend","love","moving","normalise","normalize","nth","parsley","pet","position","rapture","revelator","sandinista","simplify the text","substance","survive","violator"]],["has","clean"],["has","name"],["has","of"],["not",["has","band"]],["not",["has","bland"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-03e630d9","guard":[["hasAny",["american","avalon","barrio","beautiful","blues","born","chambers","chief","close","come","earthquakes","eliminator","hell","item number","love","moving","normalise","normalize","nth","parsley","pet","position","rapture","revelator","sandinista","simplify the text","substance","survive","violator"]],["has","clean"],["has","of"],["not",["has","band"]],["not",["has","bland"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-e9433050","guard":[["hasAny",["american","avalon","barrio","beautiful","blues","chambers","chief","close","come","deluxe","earthquakes","eliminator","hate","hell","item number","legend","moving","nth","parsley","pet","position","rapture","revelator","sandinista","substance","survive","usa","violator","way"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-b67b486e","guard":[["hasAny",["american","avalon","barrio","beautiful","blues","chambers","chief","close","come","deluxe","earthquakes","eliminator","hate","hell","item number","legend","lower case","lowercase","moving","nth","parsley","pet","position","rapture","revelator","sandinista","small letters","substance","survive","usa","violator","way"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.after",{"lit":"of"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-eaeb6ffe","guard":[["has","clean"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the clean name of Avalon":"The clean name of Avalon is Roxy Music.","the clean name of Little Earthquakes":"The clean name of Little Earthquakes is Tori Amos.","the clean name of Violator":"The clean name of Violator is Depeche Mode.","the clean name of Moving Pictures":"The clean name of Moving Pictures is Rush.","the clean name of Chief":"The clean name of Chief is Eric Church.","the clean name of King of the Delta Blues Singers":"The clean name of King of the Delta Blues Singers is Robert Johnson.","the clean name of Rapture":"The clean name of Rapture is Anita Baker.","the clean name of Raising Hell":"The clean name of Raising Hell is Run-DMC.","the clean name of Close to the Edge":"The clean name of Close to the Edge is Yes.","the clean name of Born This Way":"The clean name of Born This Way is Lady Gaga.","the clean name of Sandinista":"The clean name of Sandinista! is The Clash.","the clean name of Time (The Revelator)":"The clean name of Time (The Revelator) is Gillian Welch.","the clean name of Parsley, Sage, Rosemary and Thyme":"The clean name of Parsley, Sage, Rosemary and Thyme is Simon & Garfunkel.","the clean name of King of the Delta Blues Singers, vol 2":"The clean name of King of the Delta Blues Singers, vol 2 is Robert Johnson.","the clean name of Substance 1987":"The clean name of Substance 1987 is New Order.","the clean name of My Beautiful Dark Twisted Fantasy":"The clean name of My Beautiful Dark Twisted Fantasy is Kanye West.","the clean name of Barrio Fino":"The clean name of Barrio Fino is Daddy Yankee.","the clean name of Here Come the Warm Jets":"The clean name of Here Come the Warm Jets is Brian Eno.","the clean name of Born in the U.S.A":"The clean name of Born in the U.S.A. is Bruce Springsteen.","the clean name of American Recordings":"The clean name of American Recordings is Johnny Cash.","the clean name of Pet Sounds":"The clean name of Pet Sounds is The Beach Boys.","the clean name of Eliminator":"The clean name of Eliminator is ZZ Top.","the clean name of Love Deluxe":"The clean name of Love Deluxe is Sade.","the clean name of Portrait of a Legend 1951-1964":"The clean name of Portrait of a Legend 1951-1964 is Sam Cooke.","the clean name of How Will the Wolf Survive":"The clean name of How Will the Wolf Survive? is Los Lobos.","the clean name of Songs of Love and Hate":"The clean name of Songs of Love and Hate is Leonard Cohen.","the clean name of Enter the Wu-Tang: 36 Chambers":"The clean name of Enter the Wu-Tang: 36 Chambers is Wu-Tang Clan."}}},
{"id":"n-18157020","guard":[["hasAny",["amazing","birth","body","california","complete","damour","dear","entroducing","extraordinary","full","going","immaculate","infamous","item number","joshua","kala","kaleidoscope","live","livedead","nth","oracular","position","quadrophenia","shortest","shortest one","shortest word","synchronicity","tattoo","wish"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-a8db9cd0","guard":[["hasAny",["adolescents","aeroplane","avalon","barrio","black","bleed","close","confessions","criminal","definitive","deluxe","dummy","eliminator","illmatic","item number","moving","nth","parsley","position","stankonia","substance","survive","violator","way"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]],"mem":null},
{"id":"n-a74cde7f","guard":[["hasAny",["adolescents","aeroplane","avalon","barrio","black","bleed","close","confessions","criminal","definitive","deluxe","dummy","eliminator","illmatic","item number","lower case","lowercase","moving","nth","parsley","position","small letters","stankonia","substance","survive","violator","way"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-882f4951","guard":[["hasAny",["american","avalon","barrio","beautiful","chief","close","come","deluxe","earthquakes","eliminator","hate","hell","item number","legend","moving","nth","parsley","position","rapture","revelator","sandinista","shortest","shortest one","shortest word","substance","survive","violator"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-188d36d3","guard":[["hasAny",["american","avalon","barrio","beautiful","chief","close","come","deluxe","earthquakes","eliminator","hate","hell","item number","legend","lower case","lowercase","moving","nth","parsley","position","rapture","revelator","sandinista","shortest","shortest one","shortest word","small letters","substance","survive","violator"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.after",{"lit":"of"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-0ff2f5ea","guard":[["hasAny",["adolescents","avalon","barrio","black","bleed","close","confessions","criminal","definitive","deluxe","dummy","eliminator","illmatic","item number","moving","nth","parsley","position","shortest","shortest one","shortest word","stankonia","substance","survive","violator"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]],"mem":null},
{"id":"n-83745704","guard":[["hasAny",["amazing","birth","body","california","complete","dear","degreez","e","extraordinary","going","immaculate","item number","joshua","kala","kaleidoscope","live","mind","nth","oracular","position","quadrophenia","ram","reverse the words","reverse word order","words backwards"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-d0e473a1","guard":[["hasAny",["adolescents","avalon","barrio","black","bleed","close","confessions","criminal","definitive","deluxe","dummy","eliminator","illmatic","item number","lower case","lowercase","moving","nth","parsley","position","shortest","shortest one","shortest word","small letters","stankonia","substance","survive","violator"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-96706fa2","guard":[["hasAny",["body","california","close","collection","confessions","degreez","deluxe","dummy","hell","illmatic","item number","joshua","kala","kaleidoscope","messiah","moving","nth","oracular","position","purple","reverse the words","reverse word order","stankonia","words backwards"]],["has","clean"]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-33da4aea","guard":[["hasAny",["body","california","close","collection","confessions","degreez","deluxe","dummy","each word","illmatic","item number","joshua","kaleidoscope","messiah","moving","nth","oracular","position","purple","split into words","stankonia","words"]],["has","clean"]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-73e56f3a","guard":[["hasAny",["body","california","close","collection","confessions","degreez","deluxe","dummy","each word","illmatic","item number","joshua","kaleidoscope","messiah","moving","nth","oracular","position","purple","split into words","stankonia","words"]],["has","clean"]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-935c9d02","guard":[["hasAny",["body","california","close","collection","confessions","degreez","deluxe","dummy","each word","illmatic","item number","joshua","kaleidoscope","messiah","moving","nth","oracular","position","purple","split into words","stankonia","words"]],["has","clean"]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-268c0d38","guard":[["hasAny",["birth","bleed","body","chief","close","dummy","full","going","hate","help","here","honey","item number","kala","leeds","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","so"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-f1e4df77","guard":[["hasAny",["body","bum","california","day","degreez","entroducing","full","heads","immaculate","infamous","item number","joshua","kala","kaleidoscope","livedead","nth","oracular","position","tattoo","wish"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]],"mem":null},
{"id":"n-f4dc5eef","guard":[["hasAny",["body","bum","california","day","degreez","entroducing","full","heads","immaculate","infamous","item number","joshua","kala","kaleidoscope","livedead","lower case","lowercase","nth","oracular","position","small letters","tattoo","wish"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-698d1ffc","guard":[["hasAny",["body","california","close","collection","confessions","dashes","degreez","deluxe","dummy","hell","hyphens","illmatic","item number","joshua","kaleidoscope","kebab case","kebabcase","moving","nth","oracular","position","purple"]],["has","clean"]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-97b116a8","guard":[["hasAny",["body","california","close","collection","confessions","degreez","deluxe","dummy","each word","illmatic","item number","joshua","kaleidoscope","messiah","moving","nth","oracular","position","split into words","stankonia","words"]],["has","clean"]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-9dcb2fb9","guard":[["hasAny",["body","california","class name","close","collection","confessions","degreez","deluxe","dummy","illmatic","item number","joshua","kaleidoscope","moving","nth","oracular","pascal case","pascalcase","position","purple","stankonia","upper camel case"]],["has","clean"]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-c4b50099","guard":[["hasAny",["body","california","close","collection","confessions","degreez","deluxe","dummy","each word","illmatic","item number","joshua","kaleidoscope","messiah","moving","nth","oracular","position","split into words","stankonia","words"]],["has","clean"]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-d8043101","guard":[["hasAny",["body","california","close","collection","confessions","degreez","deluxe","dummy","each word","illmatic","item number","joshua","kaleidoscope","messiah","moving","nth","oracular","position","split into words","stankonia","words"]],["has","clean"]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-f8277e80","guard":[["hasAny",["body","california","camel case","camelcase","close","collection","confessions","degreez","deluxe","dummy","illmatic","item number","joshua","kaleidoscope","lower camel case","moving","nth","oracular","position","purple","stankonia"]],["has","clean"]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-fbcb2e7a","guard":[["hasAny",["big","bleed","born","chief","close","come","dummy","freak","help","honey","item number","longest","longest one","longest word","nth","position","so","songs"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-2ea32b12","guard":[["hasAny",["body","california","camel case","camelcase","close","collection","confessions","degreez","deluxe","dummy","illmatic","item number","joshua","kaleidoscope","lower camel case","moving","nth","oracular","position","stankonia"]],["has","clean"]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-5fe916a9","guard":[["hasAny",["body","california","close","collection","confessions","degreez","deluxe","dummy","illmatic","item number","joshua","kaleidoscope","moving","nth","oracular","position","purple","snake case","snakecase","underscores","variable name"]],["has","clean"]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-b91dfc81","guard":[["hasAny",["body","california","class name","close","collection","confessions","degreez","deluxe","dummy","illmatic","item number","joshua","kaleidoscope","moving","nth","oracular","pascal case","pascalcase","position","stankonia","upper camel case"]],["has","clean"]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-80eb2f51","guard":[["hasAny",["body","california","close","collection","confessions","dashes","degreez","deluxe","dummy","hyphens","illmatic","item number","joshua","kaleidoscope","kebab case","kebabcase","moving","nth","oracular","position"]],["has","clean"]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-bf9cc8d6","guard":[["hasAny",["body","california","close","collection","confessions","degreez","deluxe","dummy","illmatic","item number","joshua","kaleidoscope","moving","nth","oracular","position","snake case","snakecase","underscores","variable name"]],["has","clean"]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-56eac8be","guard":[["hasAny",["birth","body","bum","day","dear","full","going","heads","item number","kala","leeds","longest","longest one","longest word","mind","nth","position","ram","wish"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-ede68ad4","guard":[["hasAny",["birth","body","bum","day","dear","full","going","heads","item number","kala","leeds","longest","longest one","longest word","mind","nth","position","ram","wish"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-c6e651ff","guard":[["hasAny",["birth","body","bum","day","dear","full","going","heads","item number","kala","leeds","longest","longest one","longest word","mind","nth","position","ram","wish"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-fd69c0be","guard":[["hasAny",["birth","body","bum","day","dear","full","going","heads","item number","kala","leeds","longest","longest one","longest word","lower case","lowercase","mind","nth","position","ram","small letters","wish"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-11516425","guard":[["hasAny",["birth","body","bum","capitalise","capitalize","capitalize each word","day","dear","full","going","heads","item number","kala","leeds","longest","longest one","longest word","mind","nth","position","ram","title case","wish"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-226f60dd","guard":[["hasAny",["all caps","birth","body","bum","capital letters","capitals","day","dear","full","going","heads","item number","kala","leeds","longest","longest one","longest word","mind","nth","position","ram","upper case","uppercase","wish"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-2bc3ea41","guard":[["hasAny",["birth","body","bum","day","dear","full","going","heads","invert case","item number","kala","leeds","longest","longest one","longest word","mind","nth","position","ram","swap case","toggle case","wish"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-9b0e0e87","guard":[["hasAny",["birth","body","bum","day","dear","full","going","heads","item number","kala","leeds","longest","longest one","longest word","lower case","lowercase","mind","nth","position","ram","small letters","wish"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-3f45b59d","guard":[["hasAny",["birth","body","bum","day","dear","full","going","heads","item number","kala","leeds","longest","longest one","longest word","mind","normalise","normalize","nth","position","ram","simplify the text","wish"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-65e410ee","guard":[["hasAny",["birth","body","bum","caesar cipher","day","dear","full","going","heads","item number","kala","leeds","longest","longest one","longest word","mind","nth","position","ram","rotate the letters","shift by","shift each letter","wish"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-e0edb90b","guard":[["hasAny",["close","confessions","definitive","deluxe","dummy","hell","illmatic","item number","messiah","moving","nth","position","purple","reverse the words","reverse word order","shortest","shortest one","shortest word","stankonia","words backwards"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-09c3153e","guard":[["hasAny",["camel case","camelcase","close","confessions","definitive","deluxe","dummy","illmatic","item number","lower camel case","moving","nth","position","purple","shortest","shortest one","shortest word","stankonia"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-a39a5779","guard":[["hasAny",["close","confessions","dashes","definitive","deluxe","dummy","hell","hyphens","illmatic","item number","kebab case","kebabcase","moving","nth","position","purple","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-d16072fb","guard":[["hasAny",["class name","close","confessions","definitive","deluxe","dummy","illmatic","item number","moving","nth","pascal case","pascalcase","position","purple","shortest","shortest one","shortest word","stankonia","upper camel case"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-764db978","guard":[["hasAny",["clean","delete","item number","nth","position","remove","strip out","without"]],["has","name"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}],["sense.numeral"]]],"mem":null},
{"id":"n-2436917c","guard":[["hasAny",["birth","body","dear","going","item number","kala","leeds","longest","longest one","longest word","mind","nth","position","ram","reverse the words","reverse word order","words backwards"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-99c44005","guard":[["hasAny",["camel case","camelcase","close","confessions","definitive","deluxe","dummy","illmatic","item number","lower camel case","moving","nth","position","shortest","shortest one","shortest word","stankonia"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-aaaa35ca","guard":[["hasAny",["close","confessions","definitive","deluxe","dummy","illmatic","item number","moving","nth","position","purple","shortest","shortest one","shortest word","snake case","snakecase","underscores","variable name"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-d90ea49a","guard":[["hasAny",["class name","close","confessions","definitive","deluxe","dummy","illmatic","item number","moving","nth","pascal case","pascalcase","position","shortest","shortest one","shortest word","stankonia","upper camel case"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-dced7b65","guard":[["hasAny",["body","california","degreez","immaculate","item number","joshua","kala","kaleidoscope","nth","oracular","position","reverse the words","reverse word order","words backwards"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-2134b69e","guard":[["hasAny",["album","apollo","blues","chambers","copies","degreez","for","item number","nth","position","repeat","say it times","substance"]],["has","clean"],["has","name"]],"pyramid":["render.str",["transform.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}],["sense.howMany"]]],"mem":null},
{"id":"n-50770833","guard":[["hasAny",["album","apollo","blues","chambers","degreez","for","item number","nth","position","substance"]],["has","clean"],["has","name"]],"pyramid":["render.and",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}],["sense.howMany"]]],"mem":null},
{"id":"n-78068c06","guard":[["hasAny",["album","apollo","blues","chambers","degreez","for","item number","nth","position","substance"]],["has","clean"],["has","name"]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}],["sense.howMany"]]],"mem":null},
{"id":"n-e616e747","guard":[["hasAny",["album","apollo","blues","chambers","degreez","for","item number","nth","position","substance"]],["has","clean"],["has","name"]],"pyramid":["render.lines",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}],["sense.howMany"]]],"mem":null},
{"id":"n-c810a865","guard":[["hasAny",["body","bum","day","full","heads","item number","kala","longest","longest one","longest word","nth","position","wish"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]],"mem":null},
{"id":"n-4d033bd0","guard":[["hasAny",["body","california","dashes","degreez","hyphens","immaculate","item number","joshua","kaleidoscope","kebab case","kebabcase","nth","oracular","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-568d29dc","guard":[["hasAny",["body","california","camel case","camelcase","degreez","immaculate","item number","joshua","kaleidoscope","lower camel case","nth","oracular","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-5a32087c","guard":[["hasAny",["body","california","class name","degreez","immaculate","item number","joshua","kaleidoscope","nth","oracular","pascal case","pascalcase","position","upper camel case"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-5ea8f016","guard":[["hasAny",["body","bum","day","full","heads","item number","kala","longest","longest one","longest word","lower case","lowercase","nth","position","small letters","wish"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-fd13f574","guard":[["hasAny",["close","confessions","dashes","definitive","deluxe","dummy","hyphens","illmatic","item number","kebab case","kebabcase","moving","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-fab9a53f","guard":[["hasAny",["entroducing","item number","kala","kaleidoscope","nth","position","quadrophenia","ram","synchronicity"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-38bce154","guard":[["hasAny",["entroducing","item number","kaleidoscope","livedead","longest","longest one","longest word","nth","position","quadrophenia","synchronicity"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-4fc383a2","guard":[["hasAny",["clean","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","band"]],["not",["has","crosby"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"sort name"}],{"lit":1}]]],"mem":null},
{"id":"n-4e979812","guard":[["hasAny",["album","blues","chambers","item number","nth","position","substance"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-887a6a57","guard":[["hasAny",["alphabetize the letters","close","deluxe","illmatic","item number","letters in order","nth","position","sort the letters"]],["has","clean"]],"pyramid":["render.str",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-e8d085fc","guard":[["hasAny",["alphabetize the letters","close","deluxe","illmatic","item number","letters in order","nth","position","sort the letters"]],["has","clean"]],"pyramid":["render.str",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-8d00bc1c","guard":[["hasAny",["clean","delete","element","item number","nth","position","remove","strip out"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"type"}],{"lit":1}]]],"mem":null},
{"id":"n-efff8c48","guard":[["hasAny",["apollo","degreez","for","item number","nth","position"]],["has","clean"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-5c6b4c1d","guard":[["hasAny",["caesar cipher","e","rotate the letters","run","shift by","shift each letter","usa"]],["has","clean"]],"pyramid":["render.str",["transform.caesar",{"lit":"Bruce Springsteen"},["sense.howMany"]]],"mem":null},
{"id":"n-d95c239e","guard":[["hasAny",["bleed","caesar cipher","heads","rotate the letters","shift by","shift each letter","tattoo"]],["has","clean"]],"pyramid":["render.str",["transform.caesar",{"lit":"Rolling Stones"},["sense.howMany"]]],"mem":null},
{"id":"n-f32289b1","guard":[["hasAny",["leeds","quadrophenia"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of ",{"slot":1}," is The Who."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-7d781b05","guard":[["hasAny",["item number","leeds","nth","position","quadrophenia"]]],"pyramid":["render.template",{"lit":["The clean ",{"slot":0}," of ",{"slot":1}," is The Who."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-b65378f3","guard":[["hasAny",["leeds","quadrophenia","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-57c1795b","guard":[["hasAny",["item number","leeds","nth","position","quadrophenia"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-681684b1","guard":[["hasAny",["heads","item number","nth","position","tattoo"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Rolling Stones."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-81475eee","guard":[["hasAny",["dear","going","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Marvin Gaye."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-8a5fe216","guard":[["hasAny",["item number","leeds","nth","position","quadrophenia"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-9a5b47c9","guard":[["hasAny",["damour","item number","nth","position","synchronicity"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Police."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-f8b11421","guard":[["hasAny",["beautiful","item number","nth","position","shortest","shortest one","shortest word","yeezus"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Kanye West."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-002c715e","guard":[["hasAny",["degreez","item number","nth","position","substance"]],["has","clean"]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}],["sense.howMany"]]],"mem":null},
{"id":"n-03b9cf8f","guard":[["hasAny",["item number","leeds","nth","position","quadrophenia"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]],"mem":null},
{"id":"n-09eee4bc","guard":[["hasAny",["blues","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Robert Johnson."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-69256201","guard":[["hasAny",["class name","item number","leeds","nth","pascal case","pascalcase","position","quadrophenia","upper camel case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-735da220","guard":[["hasAny",["honey","item number","nth","pet","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Beach Boys."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-9dbef72e","guard":[["hasAny",["degreez","item number","nth","position","substance"]],["has","clean"]],"pyramid":["render.lines",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}],["sense.howMany"]]],"mem":null},
{"id":"n-b5a4ce01","guard":[["hasAny",["degreez","item number","nth","position","substance"]],["has","clean"]],"pyramid":["render.and",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}],["sense.howMany"]]],"mem":null},
{"id":"n-bb32a8f2","guard":[["hasAny",["degreez","delete","item number","nth","position","remove","strip out","substance","without"]],["has","clean"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}],["sense.numeral"]]],"mem":null},
{"id":"n-e24f513f","guard":[["hasAny",["copies","degreez","item number","nth","position","repeat","say it times","substance"]],["has","clean"]],"pyramid":["render.str",["transform.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}],["sense.howMany"]]],"mem":null},
{"id":"n-f1f2cf64","guard":[["hasAny",["item number","nth","position","run","usa"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Bruce Springsteen."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-424a392b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","leeds","nth","position","quadrophenia","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]]],"mem":null},
{"id":"n-7297ce0a","guard":[["hasAny",["all caps","capital letters","capitals","item number","leeds","nth","position","quadrophenia","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]]],"mem":null},
{"id":"n-e0fc9a0b","guard":[["hasAny",["item number","leeds","lower case","lowercase","nth","position","quadrophenia","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]]],"mem":null},
{"id":"n-ea7dc421","guard":[["hasAny",["invert case","item number","leeds","nth","position","quadrophenia","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]]],"mem":null},
{"id":"n-6ec67147","guard":[["hasAny",["bum","delete","deluxe","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"sort name"}],{"lit":1}]]],"mem":null},
{"id":"n-cd28f140","guard":[["hasAny",["item number","kala","longest","longest one","longest word","nth","position","ram"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["sense.subject"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-fff23afa","guard":[["hasAny",["item number","kala","longest","longest one","longest word","nth","position","ram"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-b1610787","guard":[["hasAny",["apollo","item number","nth","position","shortest","shortest one","shortest word","substance"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-3c9d38e3","guard":[["hasAny",["body","item number","kala","longest","longest one","longest word","nth","position","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-0a662bc7","guard":[["hasAny",["caesar cipher","dear","going","rotate the letters","shift by","shift each letter"]],["has","clean"]],"pyramid":["render.str",["transform.caesar",{"lit":"Marvin Gaye"},["sense.howMany"]]],"mem":null},
{"id":"n-2aafb93a","guard":[["hasAny",["beautiful","caesar cipher","rotate the letters","shift by","shift each letter","yeezus"]],["has","clean"],["has","name"]],"pyramid":["render.str",["transform.caesar",{"lit":"Kanye West"},["sense.howMany"]]],"mem":null},
{"id":"n-445385fd","guard":[["hasAny",["honey","normalise","normalize","pet","simplify the text"]],["has","clean"],["has","of"]],"pyramid":["render.str",["transform.norm",{"lit":"The Beach Boys"},["sense.howMany"]]],"mem":null},
{"id":"n-4a4e5afe","guard":[["hasAny",["caesar cipher","honey","pet","rotate the letters","shift by","shift each letter"]],["has","clean"],["has","of"]],"pyramid":["render.str",["transform.caesar",{"lit":"The Beach Boys"},["sense.howMany"]]],"mem":null},
{"id":"n-641c9426","guard":[["hasAny",["caesar cipher","harding","mind","rotate the letters","shift by","shift each letter"]],["has","clean"]],"pyramid":["render.str",["transform.caesar",{"lit":"Bob Dylan"},["sense.howMany"]]],"mem":null},
{"id":"n-7142dd07","guard":[["hasAny",["leeds","normalise","normalize","quadrophenia","simplify the text"]]],"pyramid":["render.str",["transform.norm",{"lit":"The Who"},["sense.howMany"]]],"mem":null},
{"id":"n-8a1dc90d","guard":[["hasAny",["caesar cipher","leeds","quadrophenia","rotate the letters","shift by","shift each letter"]]],"pyramid":["render.str",["transform.caesar",{"lit":"The Who"},["sense.howMany"]]],"mem":null},
{"id":"n-911b0fff","guard":[["hasAny",["caesar cipher","damour","rotate the letters","shift by","shift each letter","synchronicity"]]],"pyramid":["render.str",["transform.caesar",{"lit":"The Police"},["sense.howMany"]]],"mem":null},
{"id":"n-d837469e","guard":[["hasAny",["damour","normalise","normalize","simplify the text","synchronicity"]]],"pyramid":["render.str",["transform.norm",{"lit":"The Police"},["sense.howMany"]]],"mem":null},
{"id":"n-11986ae2","guard":[["hasAny",["delete","element","item number","leeds","nth","position","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"The Who"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"type"}],{"lit":1}]]],"mem":null},
{"id":"n-21c89726","guard":[["hasAny",["leeds","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of ",{"slot":1}," is The Who."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-9579a1c9","guard":[["hasAny",["leeds","longest","longest one","longest word","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-02587244","guard":[["hasAny",["aladdin","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is David Bowie."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-045d0272","guard":[["hasAny",["item number","kala","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is M.I.A.."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-084ac023","guard":[["hasAny",["bleed","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Rolling Stones."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-08df58f1","guard":[["hasAny",["come","item number","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Brian Eno."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-0d39242b","guard":[["hasAny",["item number","nth","parsley","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Simon & Garfunkel."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-0e32a7e8","guard":[["hasAny",["bum","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Public Enemy."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-135119c0","guard":[["hasAny",["item number","livedead","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Grateful Dead."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-137d6e23","guard":[["hasAny",["honey","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Beach Boys."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-1d1f8b2a","guard":[["hasAny",["dummy","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Portishead."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-1e11c1c2","guard":[["hasAny",["degreez","item number","nth","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Juvenile."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-1f581120","guard":[["hasAny",["item number","joshua","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is U2."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-1f96cbd6","guard":[["hasAny",["item number","no vowels","nth","oracular","position","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-20cedb7c","guard":[["hasAny",["backwards","definitive","item number","mirror","nth","position","reverse","reversed","spell backwards"]]],"pyramid":["render.str",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-210512e3","guard":[["hasAny",["item number","kaleidoscope","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Kelis."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-2174b9bd","guard":[["hasAny",["backwards","definitive","item number","mirror","nth","position","reverse","reversed","spell backwards"]]],"pyramid":["render.str",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-2530c1ad","guard":[["hasAny",["item number","moving","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Rush."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-2bf3c6bc","guard":[["hasAny",["exodus","item number","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Bob Marley."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-301a665b","guard":[["hasAny",["complete","item number","nth","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Robert Johnson."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-31aeadd9","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","thriller"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Michael Jackson."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-36457f7d","guard":[["hasAny",["item number","nth","position","purple","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Prince."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-36eda40a","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","wish"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Pink Floyd."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-37bc5a7c","guard":[["hasAny",["birth","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Ray Charles."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-3b4358ce","guard":[["hasAny",["california","item number","nth","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Eagles."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-403051e5","guard":[["hasAny",["item number","longest","longest one","longest word","mind","nth","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Bob Dylan."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-43a8b184","guard":[["hasAny",["immaculate","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Madonna."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-45dca686","guard":[["hasAny",["item number","nth","position","rapture","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Anita Baker."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-483556d4","guard":[["hasAny",["definitive","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ABBA."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-49f9299c","guard":[["hasAny",["barrio","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Daddy Yankee."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-4d97ec33","guard":[["hasAny",["close","item number","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Yes."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-4e395de7","guard":[["hasAny",["item number","nth","parade","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is My Chemical Romance."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-4eef3138","guard":[["hasAny",["extraordinary","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Fiona Apple."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-512280fa","guard":[["hasAny",["item number","night","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Neil Young."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-513bfe0e","guard":[["hasAny",["e","item number","nth","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Bruce Springsteen."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-5e184786","guard":[["hasAny",["eliminator","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ZZ Top."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-6387c7af","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","stankonia"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is OutKast."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-645baf4b","guard":[["hasAny",["deluxe","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Sade."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-66917045","guard":[["hasAny",["earthquakes","item number","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Tori Amos."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-681769f0","guard":[["hasAny",["illmatic","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Nas."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-687dc0a9","guard":[["hasAny",["item number","leeds","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-6b503d43","guard":[["hasAny",["amazing","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Aretha Franklin."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-6cca0272","guard":[["hasAny",["infamous","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mobb Deep."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-6ecece94","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","substance"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is New Order."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-736aff0d","guard":[["hasAny",["item number","nth","oracular","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is MGMT."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-738ac7dc","guard":[["hasAny",["harding","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Bob Dylan."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-754eef53","guard":[["hasAny",["apollo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is James Brown."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-77324a52","guard":[["hasAny",["criminal","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Boogie Down Productions."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-7d15a784","guard":[["hasAny",["item number","no vowels","nth","oracular","position","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-8a2d3648","guard":[["hasAny",["help","item number","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Beatles."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-8bb892ed","guard":[["hasAny",["hate","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Leonard Cohen."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-8f9702c4","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","survive"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Los Lobos."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-8fd1fd94","guard":[["hasAny",["american","item number","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Johnny Cash."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-9d856117","guard":[["hasAny",["item number","messiah","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is D'Angelo."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-9ea125ab","guard":[["hasAny",["entroducing","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is DJ Shadow."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-a4a0d233","guard":[["hasAny",["item number","leeds","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-ac4ed4ff","guard":[["hasAny",["first letters of the name","initials","item number","kala","nth","position"]]],"pyramid":["render.str",["transform.initials",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-b084942b","guard":[["hasAny",["day","item number","longest","longest one","longest word","nth","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Kid Cudi."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-b2c93da3","guard":[["hasAny",["body","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Robyn."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-b407284f","guard":[["hasAny",["confessions","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Usher."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-b43fb0d1","guard":[["hasAny",["item number","legend","nth","position","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Sam Cooke."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-ba94191e","guard":[["hasAny",["chief","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Eric Church."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-bc61f7c3","guard":[["hasAny",["item number","nth","position","revelator","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Gillian Welch."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-c61be45e","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","violator"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Depeche Mode."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-db0131c7","guard":[["hasAny",["hell","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Run-DMC."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-e16399e1","guard":[["hasAny",["item number","nth","position","sandinista","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Clash."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-e3121686","guard":[["hasAny",["adolescents","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is X-Ray Spex."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-e6af8073","guard":[["hasAny",["heads","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Rolling Stones."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-eb5db45c","guard":[["hasAny",["full","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Eric B. & Rakim."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-edb6becd","guard":[["hasAny",["head","item number","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Herbie Hancock."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-ef3cf822","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","ram"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Paul McCartney."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-efa146c2","guard":[["hasAny",["avalon","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Roxy Music."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-fec5b4aa","guard":[["hasAny",["first letters of the name","initials","item number","kala","nth","position"]]],"pyramid":["render.str",["transform.initials",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-10567ad4","guard":[["hasAny",["blues","element","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}],["sense.first"]]],"mem":null},
{"id":"n-112a2570","guard":[["hasAny",["chambers","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Wu-Tang Clan."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-196536cc","guard":[["hasAny",["excitement","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Jackie Wilson."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-2dff4010","guard":[["hasAny",["item number","leeds","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]],"mem":null},
{"id":"n-3143dfdc","guard":[["hasAny",["item number","nth","position","way"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Lady Gaga."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-99d04983","guard":[["hasAny",["aeroplane","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Neutral Milk Hotel."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-9b6f25f2","guard":[["hasAny",["item number","key","nth","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Stevie Wonder."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-ba2a535e","guard":[["hasAny",["big","item number","nth","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Band."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-cbf94db5","guard":[["hasAny",["clean","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}],["sense.unit"]]],"mem":null},
{"id":"n-fa903cc3","guard":[["hasAny",["freak","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Mothers of Invention."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]]],"mem":null},
{"id":"n-421b545a","guard":[["hasAny",["item number","leeds","longest","longest one","longest word","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]]],"mem":null},
{"id":"n-b754cb84","guard":[["hasAny",["invert case","item number","leeds","longest","longest one","longest word","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]]],"mem":null},
{"id":"n-cfc14800","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","leeds","longest","longest one","longest word","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]]],"mem":null},
{"id":"n-e95a8ca4","guard":[["hasAny",["all caps","capital letters","capitals","item number","leeds","longest","longest one","longest word","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}]]],"mem":null},
{"id":"n-f62762b1","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","so"]],["has","clean"]],"pyramid":["render.template",{"lit":["The clean ",{"slot":0}," of So is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-96fe0303","guard":[["hasAny",["item number","leeds","longest","longest one","longest word","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],["sense.howMany"]]],"mem":null},
{"id":"n-ac7fc4b1","guard":[["hasAny",["item number","nth","position","so"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of So is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-bc2b1f6c","guard":[["hasAny",["caesar cipher","item number","leeds","longest","longest one","longest word","nth","position","rotate the letters","shift by","shift each letter"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],["sense.howMany"]]],"mem":null},
{"id":"n-d6bafb69","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","so"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of So is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-037009bd","guard":[["hasAny",["confessions","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Confessions is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-0a87663d","guard":[["hasAny",["entroducing","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Entroducing is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-105ec6e0","guard":[["hasAny",["extraordinary","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Extraordinary Machine is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-16341bcc","guard":[["hasAny",["eliminator","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Eliminator is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-1f301e21","guard":[["hasAny",["item number","nth","position","tattoo"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tattoo You is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-22e41901","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yeezus"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Yeezus is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-29b503db","guard":[["hasAny",["degreez","item number","nth","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of 400 Degreez is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-2a588696","guard":[["hasAny",["hell","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Raising Hell is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-2b7575f3","guard":[["hasAny",["complete","item number","nth","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Complete Recordings is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-30e4c141","guard":[["hasAny",["earthquakes","item number","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Little Earthquakes is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-328e2a5e","guard":[["hasAny",["aladdin","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Aladdin Sane is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-32cc146f","guard":[["hasAny",["going","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of What's Going On is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-3384902d","guard":[["hasAny",["exodus","item number","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Exodus is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-34041ce3","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","ram"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Ram is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-358fec0b","guard":[["hasAny",["item number","livedead","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Live/Dead is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-39f9d8c8","guard":[["hasAny",["damour","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Outlandos d'Amour is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-3dd0989a","guard":[["hasAny",["heads","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Out of Our Heads is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-3e316788","guard":[["hasAny",["avalon","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Avalon is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-4afddd85","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","thriller"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Thriller is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-511113b2","guard":[["hasAny",["hate","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Songs of Love and Hate is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-56015fcf","guard":[["hasAny",["full","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Paid in Full is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-56fa30a8","guard":[["hasAny",["item number","nth","oracular","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Oracular Spectacular is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-590e2573","guard":[["hasAny",["item number","nth","position","synchronicity"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Synchronicity is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-5a08a5f5","guard":[["hasAny",["help","item number","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Help! is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-612dbc67","guard":[["hasAny",["body","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Body Talk is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-6177264e","guard":[["hasAny",["delete","element","item number","livedead","nth","position","remove","strip out"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"type"}],{"lit":1}]]],"mem":null},
{"id":"n-658eb957","guard":[["hasAny",["day","item number","longest","longest one","longest word","nth","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Man on the Moon: The End of the Day is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-66cbe8d7","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","substance"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Substance 1987 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-6a621f13","guard":[["hasAny",["item number","nth","parade","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Black Parade is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-701187c2","guard":[["hasAny",["apollo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Live at the Apollo, 1962 is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-7496d97c","guard":[["hasAny",["bleed","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Let It Bleed is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-754b8b11","guard":[["hasAny",["item number","nth","position","rapture","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Rapture is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-7defde0e","guard":[["hasAny",["item number","joshua","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Joshua Tree is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-800f3332","guard":[["hasAny",["item number","nth","position","sandinista","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Sandinista! is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-8417ed9b","guard":[["hasAny",["item number","kaleidoscope","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Kaleidoscope is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-8afb9fc4","guard":[["hasAny",["honey","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Wild Honey is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-8bec935c","guard":[["hasAny",["item number","longest","longest one","longest word","mind","nth","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Time Out of Mind is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-90d5134f","guard":[["hasAny",["illmatic","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Illmatic is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-95484397","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","so"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of So is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-97d931ea","guard":[["hasAny",["item number","nth","position","purple","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Purple Rain is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-9d98be0b","guard":[["hasAny",["deluxe","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Love Deluxe is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-9f951024","guard":[["hasAny",["adolescents","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Germ Free Adolescents is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-a1e294b5","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","stankonia"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Stankonia is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-a2660ac6","guard":[["hasAny",["item number","kala","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Kala is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-a28bbadf","guard":[["hasAny",["infamous","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Infamous is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-a39655d9","guard":[["hasAny",["chief","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Chief is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-a58c2d52","guard":[["hasAny",["criminal","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Criminal Minded is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-ad171446","guard":[["hasAny",["harding","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of John Wesley Harding is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-b1ee821d","guard":[["hasAny",["item number","legend","nth","position","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Portrait of a Legend 1951-1964 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-b40d5b14","guard":[["hasAny",["dear","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Here, My Dear is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-b6a08b0a","guard":[["hasAny",["dummy","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Dummy is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-bf69aa73","guard":[["hasAny",["e","item number","nth","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Wild, the Innocent & the E Street Shuffle is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-bf73f80e","guard":[["hasAny",["item number","nth","position","revelator","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Time (The Revelator) is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-c0e80848","guard":[["hasAny",["beautiful","item number","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of My Beautiful Dark Twisted Fantasy is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-c1668060","guard":[["hasAny",["barrio","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Barrio Fino is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-c764a954","guard":[["hasAny",["immaculate","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Immaculate Collection is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-c92c299f","guard":[["hasAny",["amazing","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Amazing Grace is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-d1c8c0b2","guard":[["hasAny",["item number","nth","parsley","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Parsley, Sage, Rosemary and Thyme is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-d1f7d4cf","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","wish"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Wish You Were Here is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-d7100916","guard":[["hasAny",["birth","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Birth of Soul is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-d73982e8","guard":[["hasAny",["item number","messiah","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Black Messiah is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-db3a8ea8","guard":[["hasAny",["come","item number","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Here Come the Warm Jets is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-dfe272e9","guard":[["hasAny",["bum","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Yo! Bum Rush the Show is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-e39a7a97","guard":[["hasAny",["close","item number","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Close to the Edge is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-e8ec6bb7","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","violator"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Violator is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-ec4416c1","guard":[["hasAny",["american","item number","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of American Recordings is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-fc00f988","guard":[["hasAny",["definitive","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Definitive Collection is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-fdc4bab3","guard":[["hasAny",["item number","night","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tonight's the Night is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-fdd18118","guard":[["hasAny",["california","item number","nth","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Hotel California is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-fedf247d","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","survive"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of How Will the Wolf Survive? is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-ffb52e94","guard":[["hasAny",["item number","moving","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Moving Pictures is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-fff687b0","guard":[["hasAny",["head","item number","nth","position","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Head Hunters is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-1a1dffc5","guard":[["hasAny",["item number","nth","position","run"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Born to Run is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-2b2835d1","guard":[["hasAny",["item number","nth","position","usa"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Born in the U.S.A. is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-2fd5d052","guard":[["hasAny",["item number","nth","pet","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Pet Sounds is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-351b19c2","guard":[["hasAny",["chambers","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Enter the Wu-Tang: 36 Chambers is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-5b654c53","guard":[["hasAny",["excitement","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Mr. Excitement! is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-5e92dfc2","guard":[["hasAny",["item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","so"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of So is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]]],"mem":null},
{"id":"n-718cbb85","guard":[["hasAny",["item number","nth","position","vol"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of King of the Delta Blues Singers, vol 2 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-75574c1a","guard":[["hasAny",["item number","nth","position","so"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of So is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-790bdb98","guard":[["hasAny",["freak","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Freak Out! is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-9b94116d","guard":[["hasAny",["item number","nth","position","way"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Born This Way is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-b8e581bc","guard":[["hasAny",["item number","key","nth","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Songs in the Key of Life is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-dfb6db54","guard":[["hasAny",["aeroplane","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of In the Aeroplane Over the Sea is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-ef0b3207","guard":[["hasAny",["big","item number","nth","position"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Music From Big Pink is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-e936cd96","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","ram","shortest","shortest one","shortest word"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-396efda7","guard":[["hasAny",["item number","legend","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"clean name"}]],"mem":null},
{"id":"n-4ff095fb","guard":[["hasAny",["body","camel case","camelcase","item number","longest","longest one","longest word","lower camel case","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-e9455861","guard":[["hasAny",["body","dashes","hyphens","item number","kebab case","kebabcase","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-f54abd0a","guard":[["hasAny",["body","class name","item number","longest","longest one","longest word","nth","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"}],{"lit":1}],{"lit":"fr-tidytuesday-rolling-stone-b1c082"},{"lit":"album"},{"lit":"sort name"}]]],"mem":null},
{"id":"n-03f06e89","guard":[["hasAny",["clean","dear","here","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Here, My Dear":"The clean name of Here, My Dear is Marvin Gaye."}}},
{"id":"n-04b2db3f","guard":[["hasAny",["album","clean","name","purple","rain"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Purple Rain":"The clean name of Purple Rain is Prince."}}},
{"id":"n-0541f72b","guard":[["hasAny",["clean","livedead","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Live/Dead":"The clean name of Live/Dead is Grateful Dead."}}},
{"id":"n-14e86ad0","guard":[["hasAny",["clean","name","quadrophenia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Quadrophenia":"The clean name of Quadrophenia is The Who."}}},
{"id":"n-178af9f0","guard":[["hasAny",["clean","name","parsley","rosemary","sage","thyme"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Parsley, Sage, Rosemary and Thyme":"The clean name of Parsley, Sage, Rosemary and Thyme is Simon & Garfunkel."}}},
{"id":"n-1d300240","guard":[["hasAny",["clean","name","oracular","spectacular"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Oracular Spectacular":"The clean name of Oracular Spectacular is MGMT."}}},
{"id":"n-1e0c9282","guard":[["hasAny",["album","clean","help","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Help!":"The clean name of Help! is The Beatles."}}},
{"id":"n-1f6a965d","guard":[["hasAny",["aladdin","album","clean","name","sane"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Aladdin Sane":"The clean name of Aladdin Sane is David Bowie."}}},
{"id":"n-200f0c2d","guard":[["hasAny",["album","black","clean","messiah","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Black Messiah":"The clean name of Black Messiah is D'Angelo."}}},
{"id":"n-227e2549","guard":[["hasAny",["album","clean","name","night","tonights"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Tonight's the Night":"The clean name of Tonight's the Night is Neil Young."}}},
{"id":"n-2448620a","guard":[["hasAny",["clean","hate","love","name","songs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Songs of Love and Hate":"The clean name of Songs of Love and Hate is Leonard Cohen."}}},
{"id":"n-2526bc6f","guard":[["hasAny",["album","clean","name"]],["has","tell"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album So":"The clean name of So is Peter Gabriel."}}},
{"id":"n-276a19ec","guard":[["hasAny",["album","clean","harding","john","name","wesley"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album John Wesley Harding":"The clean name of John Wesley Harding is Bob Dylan."}}},
{"id":"n-27d29bdc","guard":[["hasAny",["clean","name","synchronicity"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Synchronicity":"The clean name of Synchronicity is The Police."}}},
{"id":"n-2dcc724d","guard":[["hasAny",["aeroplane","album","clean","name","over","sea"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album In the Aeroplane Over the Sea":"The clean name of In the Aeroplane Over the Sea is Neutral Milk Hotel."}}},
{"id":"n-2deba5c0","guard":[["hasAny",["clean","damour","name","outlandos"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Outlandos d'Amour":"The clean name of Outlandos d'Amour is The Police."}}},
{"id":"n-2f9b76c3","guard":[["hasAny",["beautiful","clean","dark","fantasy","name","twisted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of My Beautiful Dark Twisted Fantasy":"The clean name of My Beautiful Dark Twisted Fantasy is Kanye West."}}},
{"id":"n-37ef3d33","guard":[["hasAny",["album","clean","head","hunters","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Head Hunters":"The clean name of Head Hunters is Herbie Hancock."}}},
{"id":"n-3bd71cc2","guard":[["hasAny",["clean","infamous","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for The Infamous":"The clean name of The Infamous is Mobb Deep."}}},
{"id":"n-3e2e73c7","guard":[["hasAny",["bum","clean","name","rush","yo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Yo! Bum Rush the Show":"The clean name of Yo! Bum Rush the Show is Public Enemy."}}},
{"id":"n-406591e9","guard":[["hasAny",["born","clean","name","usa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Born in the U.S.A.":"The clean name of Born in the U.S.A. is Bruce Springsteen."}}},
{"id":"n-40afe94a","guard":[["hasAny",["album","clean","love","name","songs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album 69 Love Songs":"The clean name of 69 Love Songs is The Magnetic Fields."}}},
{"id":"n-44d372b8","guard":[["hasAny",["clean","day","end","man","moon","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Man on the Moon: The End of the Day":"The clean name of Man on the Moon: The End of the Day is Kid Cudi."}}},
{"id":"n-48cf191e","guard":[["hasAny",["album","clean","confessions","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Confessions":"The clean name of Confessions is Usher."}}},
{"id":"n-4be97b1d","guard":[["hasAny",["clean","mind","name","out","time"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Time Out of Mind":"The clean name of Time Out of Mind is Bob Dylan."}}},
{"id":"n-4e54d622","guard":[["hasAny",["clean","name","substance"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Substance 1987":"The clean name of Substance 1987 is New Order."}}},
{"id":"n-5219f17c","guard":[["hasAny",["chambers","clean","enter","name","wutang"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Enter the Wu-Tang: 36 Chambers":"The clean name of Enter the Wu-Tang: 36 Chambers is Wu-Tang Clan."}}},
{"id":"n-543ab3cb","guard":[["hasAny",["chief","clean","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Chief":"The clean name of Chief is Eric Church."}}},
{"id":"n-54c417a3","guard":[["hasAny",["clean","legend","name","portrait"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Portrait of a Legend 1951-1964":"The clean name of Portrait of a Legend 1951-1964 is Sam Cooke."}}},
{"id":"n-55cb03bf","guard":[["hasAny",["album","big","clean","music","name","pink"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Music From Big Pink":"The clean name of Music From Big Pink is The Band."}}},
{"id":"n-5c388975","guard":[["hasAny",["clean","collection","immaculate","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for The Immaculate Collection":"The clean name of The Immaculate Collection is Madonna."}}},
{"id":"n-5ff404fb","guard":[["hasAny",["clean","name","tattoo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Tattoo You":"The clean name of Tattoo You is Rolling Stones."}}},
{"id":"n-61d06dff","guard":[["hasAny",["album","clean","dummy","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Dummy":"The clean name of Dummy is Portishead."}}},
{"id":"n-6279a47d","guard":[["hasAny",["clean","complete","name","recordings"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for The Complete Recordings":"The clean name of The Complete Recordings is Robert Johnson."}}},
{"id":"n-69c6c15e","guard":[["hasAny",["barrio","clean","fino","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Barrio Fino":"The clean name of Barrio Fino is Daddy Yankee."}}},
{"id":"n-69f17eb6","guard":[["hasAny",["birth","clean","name","soul"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for The Birth of Soul":"The clean name of The Birth of Soul is Ray Charles."}}},
{"id":"n-6cbe9184","guard":[["hasAny",["clean","name","survive","wolf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of How Will the Wolf Survive?":"The clean name of How Will the Wolf Survive? is Los Lobos."}}},
{"id":"n-6e8de697","guard":[["hasAny",["clean","e","innocent","name","shuffle","street","wild"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for The Wild, the Innocent & the E Street Shuffle":"The clean name of The Wild, the Innocent & the E Street Shuffle is Bruce Springsteen."}}},
{"id":"n-71238c75","guard":[["hasAny",["album","clean","criminal","minded","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Criminal Minded":"The clean name of Criminal Minded is Boogie Down Productions."}}},
{"id":"n-7140480c","guard":[["hasAny",["california","clean","hotel","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Hotel California":"The clean name of Hotel California is Eagles."}}},
{"id":"n-71d7d95e","guard":[["hasAny",["clean","come","here","jets","name","warm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Here Come the Warm Jets":"The clean name of Here Come the Warm Jets is Brian Eno."}}},
{"id":"n-768daf13","guard":[["hasAny",["blues","clean","delta","king","name","singers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of King of the Delta Blues Singers":"The clean name of King of the Delta Blues Singers is Robert Johnson."}}},
{"id":"n-7a535b69","guard":[["hasAny",["clean","name","rapture"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Rapture":"The clean name of Rapture is Anita Baker."}}},
{"id":"n-7d871ec1","guard":[["hasAny",["album","black","clean","name","parade"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album The Black Parade":"The clean name of The Black Parade is My Chemical Romance."}}},
{"id":"n-8083d151","guard":[["hasAny",["album","clean","name","stardust"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Stardust":"The clean name of Stardust is Willie Nelson."}}},
{"id":"n-80d77131","guard":[["hasAny",["clean","name","pet","sounds"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Pet Sounds":"The clean name of Pet Sounds is The Beach Boys."}}},
{"id":"n-8779ccbb","guard":[["hasAny",["album","bleed","clean","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Let It Bleed":"The clean name of Let It Bleed is Rolling Stones."}}},
{"id":"n-887337a9","guard":[["hasAny",["clean","deluxe","love","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Love Deluxe":"The clean name of Love Deluxe is Sade."}}},
{"id":"n-88cf753d","guard":[["hasAny",["clean","full","name","paid"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Paid in Full":"The clean name of Paid in Full is Eric B. & Rakim."}}},
{"id":"n-8be68c4c","guard":[["hasAny",["clean","name","violator"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Violator":"The clean name of Violator is Depeche Mode."}}},
{"id":"n-8e71b2af","guard":[["hasAny",["album","clean","illmatic","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Illmatic":"The clean name of Illmatic is Nas."}}},
{"id":"n-98c253a6","guard":[["hasAny",["adolescents","album","clean","free","germ","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Germ Free Adolescents":"The clean name of Germ Free Adolescents is X-Ray Spex."}}},
{"id":"n-9b070e31","guard":[["hasAny",["amazing","clean","grace","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Amazing Grace":"The clean name of Amazing Grace is Aretha Franklin."}}},
{"id":"n-a239b0b9","guard":[["hasAny",["album","clean","collection","definitive","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album The Definitive Collection":"The clean name of The Definitive Collection is ABBA."}}},
{"id":"n-ab65e7fa","guard":[["hasAny",["album","clean","name","stankonia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Stankonia":"The clean name of Stankonia is OutKast."}}},
{"id":"n-b0707207","guard":[["hasAny",["clean","moving","name","pictures"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Moving Pictures":"The clean name of Moving Pictures is Rush."}}},
{"id":"n-b310920d","guard":[["hasAny",["clean","name","revelator","time"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Time (The Revelator)":"The clean name of Time (The Revelator) is Gillian Welch."}}},
{"id":"n-b47fb9b2","guard":[["hasAny",["album","clean","excitement","mr","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Mr. Excitement!":"The clean name of Mr. Excitement! is Jackie Wilson."}}},
{"id":"n-b4c30589","guard":[["hasAny",["clean","entroducing","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Entroducing":"The clean name of Entroducing is DJ Shadow."}}},
{"id":"n-b9550697","guard":[["hasAny",["blues","clean","delta","king","name","singers","vol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of King of the Delta Blues Singers, vol 2":"The clean name of King of the Delta Blues Singers, vol 2 is Robert Johnson."}}},
{"id":"n-b977aef9","guard":[["hasAny",["clean","eliminator","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Eliminator":"The clean name of Eliminator is ZZ Top."}}},
{"id":"n-bd7671b1","guard":[["hasAny",["clean","extraordinary","machine","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Extraordinary Machine":"The clean name of Extraordinary Machine is Fiona Apple."}}},
{"id":"n-bdb55b10","guard":[["hasAny",["avalon","clean","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Avalon":"The clean name of Avalon is Roxy Music."}}},
{"id":"n-c3f08206","guard":[["hasAny",["american","clean","name","recordings"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of American Recordings":"The clean name of American Recordings is Johnny Cash."}}},
{"id":"n-c43a0e02","guard":[["hasAny",["clean","kala","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Kala":"The clean name of Kala is M.I.A.."}}},
{"id":"n-c620806b","guard":[["hasAny",["clean","name","ram"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Ram":"The clean name of Ram is Paul McCartney."}}},
{"id":"n-c8228660","guard":[["hasAny",["clean","kaleidoscope","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Kaleidoscope":"The clean name of Kaleidoscope is Kelis."}}},
{"id":"n-c9f19a1f","guard":[["hasAny",["album","clean","exodus","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Exodus":"The clean name of Exodus is Bob Marley."}}},
{"id":"n-cafbca4a","guard":[["hasAny",["clean","leeds","live","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Live at Leeds":"The clean name of Live at Leeds is The Who."}}},
{"id":"n-cd285d12","guard":[["hasAny",["clean","close","edge","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Close to the Edge":"The clean name of Close to the Edge is Yes."}}},
{"id":"n-d0000286","guard":[["hasAny",["born","clean","name","way"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Born This Way":"The clean name of Born This Way is Lady Gaga."}}},
{"id":"n-d0e40314","guard":[["hasAny",["clean","name","sandinista"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Sandinista!":"The clean name of Sandinista! is The Clash."}}},
{"id":"n-d47fa80e","guard":[["hasAny",["album","clean","key","life","name","songs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Songs in the Key of Life":"The clean name of Songs in the Key of Life is Stevie Wonder."}}},
{"id":"n-d5112d56","guard":[["hasAny",["clean","joshua","name","tree"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for The Joshua Tree":"The clean name of The Joshua Tree is U2."}}},
{"id":"n-d68ec1fe","guard":[["hasAny",["clean","hell","name","raising"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Raising Hell":"The clean name of Raising Hell is Run-DMC."}}},
{"id":"n-d97d28ad","guard":[["hasAny",["apollo","clean","live","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Live at the Apollo, 1962":"The clean name of Live at the Apollo, 1962 is James Brown."}}},
{"id":"n-e48131f3","guard":[["hasAny",["clean","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for 1999":"The clean name of 1999 is Prince."}}},
{"id":"n-e64611b7","guard":[["hasAny",["clean","earthquakes","little","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the clean name of Little Earthquakes":"The clean name of Little Earthquakes is Tori Amos."}}},
{"id":"n-e6c4e1d2","guard":[["hasAny",["body","clean","name","talk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Body Talk":"The clean name of Body Talk is Robyn."}}},
{"id":"n-e8908c25","guard":[["hasAny",["album","clean","name","thriller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Thriller":"The clean name of Thriller is Michael Jackson."}}},
{"id":"n-f64d1651","guard":[["hasAny",["clean","degreez","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for 400 Degreez":"The clean name of 400 Degreez is Juvenile."}}},
{"id":"n-f71ce358","guard":[["hasAny",["clean","heads","name","out"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Out of Our Heads":"The clean name of Out of Our Heads is Rolling Stones."}}},
{"id":"n-f742beb1","guard":[["hasAny",["album","clean","honey","name","wild"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Wild Honey":"The clean name of Wild Honey is The Beach Boys."}}},
{"id":"n-f866abf0","guard":[["hasAny",["clean","here","name","wish"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for Wish You Were Here":"The clean name of Wish You Were Here is Pink Floyd."}}},
{"id":"n-fb6d7a14","guard":[["hasAny",["album","born","clean","name","run"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Born to Run":"The clean name of Born to Run is Bruce Springsteen."}}},
{"id":"n-fe353cb9","guard":[["hasAny",["album","clean","freak","name","out"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Freak Out!":"The clean name of Freak Out! is The Mothers of Invention."}}},
{"id":"n-fe3c6ace","guard":[["hasAny",["clean","going","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the clean name for What's Going On":"The clean name of What's Going On is Marvin Gaye."}}},
{"id":"n-fe44559d","guard":[["hasAny",["album","clean","name","yeezus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Yeezus":"The clean name of Yeezus is Kanye West."}}},
{"id":"n-2de9f2b3","guard":[["hasAny",["caesar cipher","complete","rotate the letters","shift by","shift each letter"]],["has","clean"]],"pyramid":["render.str",["transform.caesar",{"lit":"Robert Johnson"},["sense.howMany"]]],"mem":null},
{"id":"n-71c4893b","guard":[["has","blues"]],"pyramid":["render.lines",["iterate.repeat",{"lit":"Robert Johnson"},["sense.howMany"]]],"mem":null},
{"id":"n-932b0cb7","guard":[["has","blues"]],"pyramid":["render.and",["iterate.repeat",{"lit":"Robert Johnson"},["sense.howMany"]]],"mem":null},
{"id":"n-95e49e7c","guard":[["hasAny",["caesar cipher","purple","rotate the letters","shift by","shift each letter"]],["has","clean"]],"pyramid":["render.str",["transform.caesar",{"lit":"Prince"},["sense.howMany"]]],"mem":null},
{"id":"n-c785e892","guard":[["hasAny",["blues","copies","repeat","say it times"]]],"pyramid":["render.str",["transform.repeat",{"lit":"Robert Johnson"},["sense.howMany"]]],"mem":null},
{"id":"n-eb8efcb6","guard":[["has","blues"]],"pyramid":["render.list",["iterate.repeat",{"lit":"Robert Johnson"},["sense.howMany"]]],"mem":null},
{"id":"n-f9967e28","guard":[["hasAny",["blues","delete","remove","strip out"]],["has","what"]],"pyramid":["render.str",["transform.remove",{"lit":"Robert Johnson"},["sense.numeral"]]],"mem":null},
{"id":"n-ab26d46f","guard":[["hasAny",["item number","leeds","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Live at Leeds is The Who."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ae1f8bc0","guard":[["hasAny",["item number","nth","quadrophenia"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Quadrophenia is The Who."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-da7d0b64","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","so"]],["has","clean"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of So is Peter Gabriel."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fbe8ab0c","guard":[["hasAny",["item number","nth","quadrophenia"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-b1f92ad5","guard":[["hasAny",["item number","longest one","longest word","nth","quadrophenia"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is The Who."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-85fd9300","guard":[["hasAny",["adolescents","aeroplane","aladdin","amazing","avalon","barrio","beautiful","big","birth","black","bleed","body","born","bum","california","chief","close","collection","confessions","criminal","damour","day","deluxe","dummy","earthquakes","eliminator","entroducing","excitement","exodus","extraordinary","full","going","harding","hate","head","hell","help","here","illmatic","infamous","joshua","kala","kaleidoscope","key","leeds","livedead","moving","night","oracular","out","parsley","pet","purple","quadrophenia","ram","rapture","recordings","sandinista","so","stankonia","stardust","survive","synchronicity","tattoo","thriller","time","violator","wild","yeezus"]],["has","clean"],["not",["has","boys"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for The Birth of Soul":"The clean name of The Birth of Soul is Ray Charles.","what is the clean name of Avalon":"The clean name of Avalon is Roxy Music.","what is the clean name of Little Earthquakes":"The clean name of Little Earthquakes is Tori Amos.","tell me the clean name of the album In the Aeroplane Over the Sea":"The clean name of In the Aeroplane Over the Sea is Neutral Milk Hotel.","give the clean name for The Joshua Tree":"The clean name of The Joshua Tree is U2.","what is the clean name of Violator":"The clean name of Violator is Depeche Mode.","tell me the clean name of the album Help!":"The clean name of Help! is The Beatles.","what is the clean name of Moving Pictures":"The clean name of Moving Pictures is Rush.","give the clean name for Body Talk":"The clean name of Body Talk is Robyn.","give the clean name for Time Out of Mind":"The clean name of Time Out of Mind is Bob Dylan.","give the clean name for Entroducing":"The clean name of Entroducing is DJ Shadow.","tell me the clean name of the album Dummy":"The clean name of Dummy is Portishead.","what is the clean name of Chief":"The clean name of Chief is Eric Church.","give the clean name for Ram":"The clean name of Ram is Paul McCartney.","tell me the clean name of the album Freak Out!":"The clean name of Freak Out! is The Mothers of Invention.","what is the clean name of King of the Delta Blues Singers":"The clean name of King of the Delta Blues Singers is Robert Johnson.","tell me the clean name of the album Born to Run":"The clean name of Born to Run is Bruce Springsteen.","tell me the clean name of the album Aladdin Sane":"The clean name of Aladdin Sane is David Bowie.","give the clean name for Outlandos d'Amour":"The clean name of Outlandos d'Amour is The Police.","what is the clean name of Rapture":"The clean name of Rapture is Anita Baker.","tell me the clean name of the album Black Messiah":"The clean name of Black Messiah is D'Angelo.","tell me the clean name of the album Illmatic":"The clean name of Illmatic is Nas.","give the clean name for Amazing Grace":"The clean name of Amazing Grace is Aretha Franklin.","tell me the clean name of the album Yeezus":"The clean name of Yeezus is Kanye West.","give the clean name for Extraordinary Machine":"The clean name of Extraordinary Machine is Fiona Apple.","what is the clean name of Raising Hell":"The clean name of Raising Hell is Run-DMC.","give the clean name for Out of Our Heads":"The clean name of Out of Our Heads is Rolling Stones.","give the clean name for The Infamous":"The clean name of The Infamous is Mobb Deep.","tell me the clean name of the album Criminal Minded":"The clean name of Criminal Minded is Boogie Down Productions.","tell me the clean name of the album Songs in the Key of Life":"The clean name of Songs in the Key of Life is Stevie Wonder.","tell me the clean name of the album Tonight's the Night":"The clean name of Tonight's the Night is Neil Young.","what is the clean name of Close to the Edge":"The clean name of Close to the Edge is Yes.","give the clean name for Yo! Bum Rush the Show":"The clean name of Yo! Bum Rush the Show is Public Enemy.","give the clean name for The Wild, the Innocent & the E Street Shuffle":"The clean name of The Wild, the Innocent & the E Street Shuffle is Bruce Springsteen.","what is the clean name of Born This Way":"The clean name of Born This Way is Lady Gaga.","give the clean name for Wish You Were Here":"The clean name of Wish You Were Here is Pink Floyd.","tell me the clean name of the album Head Hunters":"The clean name of Head Hunters is Herbie Hancock.","what is the clean name of Sandinista!":"The clean name of Sandinista! is The Clash.","tell me the clean name of the album Mr. Excitement!":"The clean name of Mr. Excitement! is Jackie Wilson.","tell me the clean name of the album Stankonia":"The clean name of Stankonia is OutKast.","tell me the clean name of the album Exodus":"The clean name of Exodus is Bob Marley.","what is the clean name of Time (The Revelator)":"The clean name of Time (The Revelator) is Gillian Welch.","what is the clean name of Parsley, Sage, Rosemary and Thyme":"The clean name of Parsley, Sage, Rosemary and Thyme is Simon & Garfunkel.","tell me the clean name of the album So":"The clean name of So is Peter Gabriel.","tell me the clean name of the album The Definitive Collection":"The clean name of The Definitive Collection is ABBA.","give the clean name for Man on the Moon: The End of the Day":"The clean name of Man on the Moon: The End of the Day is Kid Cudi.","tell me the clean name of the album Germ Free Adolescents":"The clean name of Germ Free Adolescents is X-Ray Spex.","what is the clean name of My Beautiful Dark Twisted Fantasy":"The clean name of My Beautiful Dark Twisted Fantasy is Kanye West.","tell me the clean name of the album The Black Parade":"The clean name of The Black Parade is My Chemical Romance.","what is the clean name of Barrio Fino":"The clean name of Barrio Fino is Daddy Yankee.","tell me the clean name of the album Purple Rain":"The clean name of Purple Rain is Prince.","tell me the clean name of the album Thriller":"The clean name of Thriller is Michael Jackson.","tell me the clean name of the album Wild Honey":"The clean name of Wild Honey is The Beach Boys.","give the clean name for Synchronicity":"The clean name of Synchronicity is The Police.","tell me the clean name of the album Let It Bleed":"The clean name of Let It Bleed is Rolling Stones.","give the clean name for Quadrophenia":"The clean name of Quadrophenia is The Who.","give the clean name for Tattoo You":"The clean name of Tattoo You is Rolling Stones.","tell me the clean name of the album John Wesley Harding":"The clean name of John Wesley Harding is Bob Dylan.","tell me the clean name of the album Music From Big Pink":"The clean name of Music From Big Pink is The Band.","give the clean name for The Complete Recordings":"The clean name of The Complete Recordings is Robert Johnson.","what is the clean name of Here Come the Warm Jets":"The clean name of Here Come the Warm Jets is Brian Eno.","give the clean name for Oracular Spectacular":"The clean name of Oracular Spectacular is MGMT.","what is the clean name of Born in the U.S.A.":"The clean name of Born in the U.S.A. is Bruce Springsteen.","what is the clean name of American Recordings":"The clean name of American Recordings is Johnny Cash.","give the clean name for What's Going On":"The clean name of What's Going On is Marvin Gaye.","give the clean name for Paid in Full":"The clean name of Paid in Full is Eric B. & Rakim.","tell me the clean name of the album Confessions":"The clean name of Confessions is Usher.","what is the clean name of Pet Sounds":"The clean name of Pet Sounds is The Beach Boys.","give the clean name for Kala":"The clean name of Kala is M.I.A..","give the clean name for Hotel California":"The clean name of Hotel California is Eagles.","what is the clean name of Eliminator":"The clean name of Eliminator is ZZ Top.","what is the clean name of Love Deluxe":"The clean name of Love Deluxe is Sade.","give the clean name for Here, My Dear":"The clean name of Here, My Dear is Marvin Gaye.","give the clean name for The Immaculate Collection":"The clean name of The Immaculate Collection is Madonna.","tell me the clean name of the album Stardust":"The clean name of Stardust is Willie Nelson.","give the clean name for Live/Dead":"The clean name of Live/Dead is Grateful Dead.","what is the clean name of How Will the Wolf Survive?":"The clean name of How Will the Wolf Survive? is Los Lobos.","give the clean name for Live at Leeds":"The clean name of Live at Leeds is The Who.","what is the clean name of Songs of Love and Hate":"The clean name of Songs of Love and Hate is Leonard Cohen.","give the clean name for Kaleidoscope":"The clean name of Kaleidoscope is Kelis."}}},
{"id":"n-0367be64","guard":[["has","going"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for What's Going On":"The clean name of What's Going On is Marvin Gaye."}}},
{"id":"n-07ef802e","guard":[["has","american"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of American Recordings":"The clean name of American Recordings is Johnny Cash."}}},
{"id":"n-08321c00","guard":[["has","dear"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Here, My Dear":"The clean name of Here, My Dear is Marvin Gaye."}}},
{"id":"n-0d17c7ac","guard":[["hasAny",["clean","earthquakes","little","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Little Earthquakes":"The clean name of Little Earthquakes is Tori Amos."}}},
{"id":"n-0e072cb5","guard":[["hasAny",["beautiful","clean","dark","fantasy","name","twisted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of My Beautiful Dark Twisted Fantasy":"The clean name of My Beautiful Dark Twisted Fantasy is Kanye West."}}},
{"id":"n-10906467","guard":[["hasAny",["big","music","pink"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Music From Big Pink":"The clean name of Music From Big Pink is The Band."}}},
{"id":"n-11de4ff6","guard":[["hasAny",["clean","close","edge","name"]],["has","clean"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Close to the Edge":"The clean name of Close to the Edge is Yes."}}},
{"id":"n-132a6eb8","guard":[["has","synchronicity"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Synchronicity":"The clean name of Synchronicity is The Police."}}},
{"id":"n-137a6ae7","guard":[["has","dummy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Dummy":"The clean name of Dummy is Portishead."}}},
{"id":"n-149798d8","guard":[["has","revelator"],["has","clean"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Time (The Revelator)":"The clean name of Time (The Revelator) is Gillian Welch."}}},
{"id":"n-1577c39b","guard":[["hasAny",["aladdin","sane"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Aladdin Sane":"The clean name of Aladdin Sane is David Bowie."}}},
{"id":"n-179774f0","guard":[["has","exodus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Exodus":"The clean name of Exodus is Bob Marley."}}},
{"id":"n-17d383c1","guard":[["hasAny",["clean","name","oracular","spectacular"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Oracular Spectacular":"The clean name of Oracular Spectacular is MGMT."}}},
{"id":"n-18d69665","guard":[["has","ram"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Ram":"The clean name of Ram is Paul McCartney."}}},
{"id":"n-190d2876","guard":[["has","thriller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Thriller":"The clean name of Thriller is Michael Jackson."}}},
{"id":"n-1a6d0f0c","guard":[["hasAny",["california","clean","hotel","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Hotel California":"The clean name of Hotel California is Eagles."}}},
{"id":"n-25768691","guard":[["has","entroducing"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Entroducing":"The clean name of Entroducing is DJ Shadow."}}},
{"id":"n-2dfef3cd","guard":[["hasAny",["clean","e","innocent","name","shuffle","street","wild"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for The Wild, the Innocent & the E Street Shuffle":"The clean name of The Wild, the Innocent & the E Street Shuffle is Bruce Springsteen."}}},
{"id":"n-317980ac","guard":[["hasAny",["key","life"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Songs in the Key of Life":"The clean name of Songs in the Key of Life is Stevie Wonder."}}},
{"id":"n-33d7d449","guard":[["hasAny",["bum","clean","name","rush","yo"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Yo! Bum Rush the Show":"The clean name of Yo! Bum Rush the Show is Public Enemy."}}},
{"id":"n-356949e7","guard":[["hasAny",["clean","hell","name","raising"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Raising Hell":"The clean name of Raising Hell is Run-DMC."}}},
{"id":"n-37292e1b","guard":[["has","usa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Born in the U.S.A.":"The clean name of Born in the U.S.A. is Bruce Springsteen."}}},
{"id":"n-38a60d59","guard":[["has","heads"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Out of Our Heads":"The clean name of Out of Our Heads is Rolling Stones."}}},
{"id":"n-3a220c8b","guard":[["has","complete"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for The Complete Recordings":"The clean name of The Complete Recordings is Robert Johnson."}}},
{"id":"n-3ea9f2da","guard":[["has","eliminator"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Eliminator":"The clean name of Eliminator is ZZ Top."}}},
{"id":"n-424c0c42","guard":[["has","chief"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Chief":"The clean name of Chief is Eric Church."}}},
{"id":"n-432072b0","guard":[["has","deluxe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Love Deluxe":"The clean name of Love Deluxe is Sade."}}},
{"id":"n-4633d091","guard":[["has","illmatic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Illmatic":"The clean name of Illmatic is Nas."}}},
{"id":"n-46d28d6d","guard":[["has","livedead"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Live/Dead":"The clean name of Live/Dead is Grateful Dead."}}},
{"id":"n-4b8131bd","guard":[["hasAny",["excitement","mr"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Mr. Excitement!":"The clean name of Mr. Excitement! is Jackie Wilson."}}},
{"id":"n-4ba95560","guard":[["hasAny",["clean","name","pet","sounds"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Pet Sounds":"The clean name of Pet Sounds is The Beach Boys."}}},
{"id":"n-4dc97f31","guard":[["hasAny",["aeroplane","over","sea"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album In the Aeroplane Over the Sea":"The clean name of In the Aeroplane Over the Sea is Neutral Milk Hotel."}}},
{"id":"n-509bdf8c","guard":[["has","yeezus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Yeezus":"The clean name of Yeezus is Kanye West."}}},
{"id":"n-525b58ab","guard":[["hasAny",["clean","come","here","jets","name","warm"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Here Come the Warm Jets":"The clean name of Here Come the Warm Jets is Brian Eno."}}},
{"id":"n-55f70c9b","guard":[["has","help"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Help!":"The clean name of Help! is The Beatles."}}},
{"id":"n-575a4d81","guard":[["has","stankonia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Stankonia":"The clean name of Stankonia is OutKast."}}},
{"id":"n-5a9a6a7a","guard":[["hasAny",["barrio","clean","fino","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Barrio Fino":"The clean name of Barrio Fino is Daddy Yankee."}}},
{"id":"n-61652b3d","guard":[["hasAny",["clean","day","end","man","moon","name"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Man on the Moon: The End of the Day":"The clean name of Man on the Moon: The End of the Day is Kid Cudi."}}},
{"id":"n-623647e6","guard":[["has","violator"],["has","clean"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Violator":"The clean name of Violator is Depeche Mode."}}},
{"id":"n-6321be39","guard":[["has","messiah"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Black Messiah":"The clean name of Black Messiah is D'Angelo."}}},
{"id":"n-6777a667","guard":[["has","run"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Born to Run":"The clean name of Born to Run is Bruce Springsteen."}}},
{"id":"n-6ccc0fc4","guard":[["hasAny",["clean","moving","name","pictures"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Moving Pictures":"The clean name of Moving Pictures is Rush."}}},
{"id":"n-6f655bb5","guard":[["hasAny",["clean","joshua","name","tree"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for The Joshua Tree":"The clean name of The Joshua Tree is U2."}}},
{"id":"n-70d2bf48","guard":[["hasAny",["night","tonights"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Tonight's the Night":"The clean name of Tonight's the Night is Neil Young."}}},
{"id":"n-755d328f","guard":[["has","wish"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Wish You Were Here":"The clean name of Wish You Were Here is Pink Floyd."}}},
{"id":"n-75e5e71d","guard":[["hasAny",["clean","name","parsley","rosemary","sage","thyme"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Parsley, Sage, Rosemary and Thyme":"The clean name of Parsley, Sage, Rosemary and Thyme is Simon & Garfunkel."}}},
{"id":"n-7aedbece","guard":[["hasAny",["criminal","minded"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Criminal Minded":"The clean name of Criminal Minded is Boogie Down Productions."}}},
{"id":"n-80bbab2f","guard":[["has","freak"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Freak Out!":"The clean name of Freak Out! is The Mothers of Invention."}}},
{"id":"n-813d1eff","guard":[["has","bleed"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Let It Bleed":"The clean name of Let It Bleed is Rolling Stones."}}},
{"id":"n-826c7595","guard":[["has","way"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Born This Way":"The clean name of Born This Way is Lady Gaga."}}},
{"id":"n-834e9b67","guard":[["has","immaculate"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for The Immaculate Collection":"The clean name of The Immaculate Collection is Madonna."}}},
{"id":"n-8bc935ad","guard":[["hasAny",["head","hunters"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Head Hunters":"The clean name of Head Hunters is Herbie Hancock."}}},
{"id":"n-919ecfc4","guard":[["hasAny",["birth","clean","name","soul"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for The Birth of Soul":"The clean name of The Birth of Soul is Ray Charles."}}},
{"id":"n-9681f630","guard":[["has","mind"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Time Out of Mind":"The clean name of Time Out of Mind is Bob Dylan."}}},
{"id":"n-a1085006","guard":[["hasAny",["clean","extraordinary","machine","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Extraordinary Machine":"The clean name of Extraordinary Machine is Fiona Apple."}}},
{"id":"n-a19f8449","guard":[["has","hate"],["has","clean"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Songs of Love and Hate":"The clean name of Songs of Love and Hate is Leonard Cohen."}}},
{"id":"n-a8e0c231","guard":[["hasAny",["clean","damour","name","outlandos"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Outlandos d'Amour":"The clean name of Outlandos d'Amour is The Police."}}},
{"id":"n-a8f0654b","guard":[["has","leeds"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Live at Leeds":"The clean name of Live at Leeds is The Who."}}},
{"id":"n-b1617d6c","guard":[["has","parade"],["has","clean"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album The Black Parade":"The clean name of The Black Parade is My Chemical Romance."}}},
{"id":"n-b3e55e6c","guard":[["hasAny",["adolescents","free","germ"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Germ Free Adolescents":"The clean name of Germ Free Adolescents is X-Ray Spex."}}},
{"id":"n-b5a90b0d","guard":[["has","infamous"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for The Infamous":"The clean name of The Infamous is Mobb Deep."}}},
{"id":"n-badcd25f","guard":[["has","definitive"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album The Definitive Collection":"The clean name of The Definitive Collection is ABBA."}}},
{"id":"n-bc3f832f","guard":[["hasAny",["body","clean","name","talk"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Body Talk":"The clean name of Body Talk is Robyn."}}},
{"id":"n-bc46e504","guard":[["hasAny",["honey","wild"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Wild Honey":"The clean name of Wild Honey is The Beach Boys."}}},
{"id":"n-c4aa2af5","guard":[["has","sandinista"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Sandinista!":"The clean name of Sandinista! is The Clash."}}},
{"id":"n-c893ac17","guard":[["has","rapture"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Rapture":"The clean name of Rapture is Anita Baker."}}},
{"id":"n-caab0d3b","guard":[["hasAny",["clean","full","name","paid"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Paid in Full":"The clean name of Paid in Full is Eric B. & Rakim."}}},
{"id":"n-d8884cab","guard":[["has","tattoo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Tattoo You":"The clean name of Tattoo You is Rolling Stones."}}},
{"id":"n-e0a63f7b","guard":[["has","quadrophenia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Quadrophenia":"The clean name of Quadrophenia is The Who."}}},
{"id":"n-e2759ffa","guard":[["hasAny",["harding","john","wesley"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album John Wesley Harding":"The clean name of John Wesley Harding is Bob Dylan."}}},
{"id":"n-e4805087","guard":[["has","confessions"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Confessions":"The clean name of Confessions is Usher."}}},
{"id":"n-e7027dec","guard":[["has","kaleidoscope"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Kaleidoscope":"The clean name of Kaleidoscope is Kelis."}}},
{"id":"n-ee5cb582","guard":[["has","stardust"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Stardust":"The clean name of Stardust is Willie Nelson."}}},
{"id":"n-f429f583","guard":[["has","kala"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Kala":"The clean name of Kala is M.I.A.."}}},
{"id":"n-f81e5a11","guard":[["hasAny",["clean","name","survive","wolf"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of How Will the Wolf Survive?":"The clean name of How Will the Wolf Survive? is Los Lobos."}}},
{"id":"n-fccf2b68","guard":[["hasAny",["amazing","clean","grace","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the clean name for Amazing Grace":"The clean name of Amazing Grace is Aretha Franklin."}}},
{"id":"n-fd6c3ad2","guard":[["has","avalon"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the clean name of Avalon":"The clean name of Avalon is Roxy Music."}}},
{"id":"n-fd9042f6","guard":[["hasAny",["purple","rain"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the clean name of the album Purple Rain":"The clean name of Purple Rain is Prince."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the clean name of Avalon","expect":{"contains":["Roxy Music"],"notRefusal":true}},{"q":"give the clean name for The Birth of Soul","expect":{"contains":["Ray Charles"],"notRefusal":true}},{"q":"what is the clean name of Little Earthquakes","expect":{"contains":["Tori Amos"],"notRefusal":true}},{"q":"tell me the clean name of the album In the Aeroplane Over the Sea","expect":{"contains":["Neutral Milk Hotel"],"notRefusal":true}},{"q":"give the clean name for The Joshua Tree","expect":{"contains":["U2"],"notRefusal":true}},{"q":"what is the clean name of Violator","expect":{"contains":["Depeche Mode"],"notRefusal":true}},{"q":"tell me the clean name of the album Help!","expect":{"contains":["The Beatles"],"notRefusal":true}},{"q":"what is the clean name of Moving Pictures","expect":{"contains":["Rush"],"notRefusal":true}},{"q":"give the clean name for Body Talk","expect":{"contains":["Robyn"],"notRefusal":true}},{"q":"give the clean name for Time Out of Mind","expect":{"contains":["Bob Dylan"],"notRefusal":true}},{"q":"give the clean name for Entroducing","expect":{"contains":["DJ Shadow"],"notRefusal":true}},{"q":"tell me the clean name of the album Dummy","expect":{"contains":["Portishead"],"notRefusal":true}},{"q":"what is the clean name of Chief","expect":{"contains":["Eric Church"],"notRefusal":true}},{"q":"give the clean name for Ram","expect":{"contains":["Paul McCartney"],"notRefusal":true}},{"q":"tell me the clean name of the album Freak Out!","expect":{"contains":["The Mothers of Invention"],"notRefusal":true}},{"q":"what is the clean name of King of the Delta Blues Singers","expect":{"contains":["Robert Johnson"],"notRefusal":true}},{"q":"tell me the clean name of the album Born to Run","expect":{"contains":["Bruce Springsteen"],"notRefusal":true}},{"q":"tell me the clean name of the album Aladdin Sane","expect":{"contains":["David Bowie"],"notRefusal":true}},{"q":"give the clean name for Outlandos d'Amour","expect":{"contains":["The Police"],"notRefusal":true}},{"q":"what is the clean name of Rapture","expect":{"contains":["Anita Baker"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
