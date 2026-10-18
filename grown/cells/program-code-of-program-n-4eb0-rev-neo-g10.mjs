// program-code-of-program-n-4eb0-rev-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"program-code-of-program-n-4eb0-rev-neo-g10","class":"program-code-of-program-n-4eb0-rev","generation":10,"lane":"neo","grownFrom":["which program name has the program code 024-003","name the program name whose program code is 009-063","which program name has the program code 015-077","018-007 is the program code of which program name","name the program name whose program code is 015-024","which program name has the program code 012-010","012-009 is the program code of which program name","name the program name whose program code is 019-043","name the program name whose program code is 029-060","name the program name whose program code is 018-035","012-031 is the program code of which program name","name the program name whose program code is 029-028","name the program name whose program code is 020-010","name the program name whose program code is 020-088","019-040 is the program code of which program name","018-034 is the program code of which program name","name the program name whose program code is 010-093","name the program name whose program code is 029-093","name the program name whose program code is 018-105","name the program name whose program code is 009-030"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-fpi-codes-a6058b","columns":["program name","program code"],"n":1554,"cols":[{"f":"0Land Acquisition|0Executive Direction|0Office of the Inspector General|0Maternal and Child Health|0Office of Inspector General|0Miscellaneous Permanent Appropriations|0Land Acquisition (Mandatory)|0Miscellaneous Trust Funds|0Construction|2operative Endangered Species Conservation Fund|0Urban Park and Recreation Recovery|0Federal Land Acquisition|0State Assistance|0Preparedness|0Suppression Operations|0Investigations|0Administrative Expenses|1udit|0Manufacturing|0Protection|0Inspector General|0Environment|0(Primary Program Not Available)|0|0|0|0|0|0|0|0|0|0|0|0|0(Primary Program Not Available)|v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|021st Century Community Learning Centers (CFDA # 84.287)|dSpace Launch Complex|0504 Certified Development Loans|07(a) Loan Guarantees|2j) Technical Assistance|08(a) Business Development|0AHRQ Program Support|1IDS Policy and Budget|1ccreditation|2quired Direct Loan|5sition Management (Environmental Programs & Management, Superfund, Leaking Underground Storage Tanks)|cWorkforce Training Program|cand Operations Support|2tivities Supporting Bombers & ICBMs|1dam Walsh Act Implementation|2judication Services|2ministration and Enterprise Information Science Support|fof Cases|cve Expenses|fLaw (Environmental Programs & Management)|fOperations, General Support Services, Executive Direction|2ult Basic and Literacy Education State Grants (CFDA # 84.002)|6Day Health Care|2vanced Development|9Exploration Systems|9Manufacturing Office (formerly Industrial Technologies)|nTechnology Consortia|9Placement (CFDA # 84.330)|9Research Projects Agency-Energy (ARPA-E)|9Scientific Computing Research|aimulation and Computing Campaign|6ing Translational Sciences Research|3ocacy|1eronautics Strategy and Management|cTest|4space Research and Career Development|1gency Management|7Operations and Award Management (AOAM)|2ing Research|6Services|2ricultural Estimates|ae|1ir Defense Initiative|4Force|4Traffic Organization (Operations)|3lift Forces|3ports|3space Systems|1laska Native Education Equity (CFDA # 84.356)|2cohol Abuse and Alcoholism Research|2l Hazards Preparedness and Response|3ergy and Infectious Diseases Research|2ternative Dispute Resolution (Environmental Programs & Management, Superfund)|1mbulatory Care|2erican International Group|9Printing House for the Blind (CFDA # 84.906)|9Sections|2phibious Forces|1nalysis and Operations|2imal Drugs and Feeds|7Welfare|2titrust Division (ATR)|1pplied Sciences|3renticeship (ETA)|1rmy Base Operations Support (BOS) and Mgmt., Headquarters (HQ)s|5Division Increment|5Non-Divisional Combat Increment|5Operational Support|5Research and Development Support (R&D)|5Special Mission Forces|6ystems Support|5Tactical Support Increment|2thritis and Musculoskeletal and Skin Diseases Research|3s in Education (CFDA # 84.351)|1ssessment (CFDA # 84.902)|4t Guarantee Program (AGP)|3isted Acquisition Services Program|9Living Conversion Program|6ive Technology Programs (CFDA # 84.224)|2trophysics Explorer Program|dResearch|1udit|5|5s, Evaluations, and Investigations (Inspector General, Superfund)|8Inspections, and Investigations|2tomation Modernization|5otive Industry Financing Program (AIFP)|1viation Safety|f (Operations)|0Ballistic Missile Defense|2nk Enterprise Award (BEA) Program|5Secrecy Act (BSA) Administration and Analysis|2sic Education|7nergy Sciences|1each / Fish Programs (Environmental Programs & Management)|1ilateral Debt Reduction/Contribution to the HIPC Trust Fund|2oenergy Technologies (formerly Biomass and Biorefinery R&D)|3logical Sciences (BIO)|band Environmental Research|8s|3medical Imaging and Bioengineering Research|2rth Defects, Developmental Disabilities, Disabilities and Health|1lind Rehabilitation Service (BRS)|1oard of Veterans’ Appeals|2mber Forces|2nd Guarantee Program|3neville Power Administration (BPA)|2rder Enforcement Grants|7Prosecution Initiatives|1roadband Programs|3wnfields (Environmental Programs & Management)|cProjects (State & Tribal Assistance Grants)|1uilding Operations Program|9Technologies|8s and Facilities|o at NIH|2reau of Economic Analysis|aPrison, Construction|3ial Benefits|3ned Area Rehabilitation|2siness Systems and Modernization|8USA|1yrne Competitive Grants|7riminal Justice Innovation Program|0CDBG (Community Development Loan Guarantee (Section 108))|6Disaster Recovery Assistance)|6Entitlement)|2C-Wide Activities and Program Support|1OPS Hiring Program|1alifornia Bay‐Delta Restoration|2mpus Violence|2ncer Research|2pacity Building (Section 4)|3ital Improvement and Maintenance|9nvestment Fund|jGrants|8Litigation Improvement Grant Program|8Magnet Fund|8Purchase Program (CPP)|8and Debt Service Grants to Amtrak|2reer and Technical Education State Grants (CFDA # 84.048)|2tegorical Grant: Beaches Protection (State & Tribal Assistance Grants)|krownfields (State & Tribal Assistance Grants)|jEnvironmental Information (State & Tribal Assistance Grants)|kvaluation Grants|jHazardous Waste Financial Assistance (State & Tribal Assistance Grants)|jLead (State & Tribal Assistance Grants)|jNonpoint Source (Sec. 319) (State & Tribal Assistance Grants)|jPesticides Enforcement (State & Tribal Assistance Grants)|uProgram Implementation (State & Tribal Assistance Grants)|kollution Control (Sec. 106) (State & Tribal Assistance Grants)|tPrevention (State & Tribal Assistance Grants)|kublic Water System Supervision (PWSS) (State & Tribal Assistance Grants)|jRadon (State & Tribal Assistance Grants)|jState and Local Air Quality Management (State & Tribal Assistance Grants)|jToxics Substances Compliance (State & Tribal Assistance Grants)|kribal Air Quality Management (State & Tribal Assistance Grants)|qGeneral Assistance Program (State & Tribal Assistance Grants)|jUnderground Injection Control (UIC) (State & Tribal Assistance Grants)|vStorage Tanks (State & Tribal Assistance Grants)|jWetlands Program Development (State & Tribal Assistance Grants)|1ensus Working Capital Fund (Centralized Services)|7of Agriculture|3ter Management and Operations|7for Nutrition Policy and Promotion|bTobacco Products|4ral Hazardous Materials Fund|8Utah Project Completion Account ‐ proposed to be included under BOR in 2013 & 2014|8Valley Project Restoration Fund|7ly Managed Communications|1hallenge Cost Share|3rter|7 Schools Grants (CFDA # 84.282)|2ild Abuse Training for Judicial Personnel|cand Child Welfare|6Care Access Means Parents in School (CFDA # 84.335)|bDevelopment Fund|6Health and Human Development Research|6Nutrition Programs|5ren Exposed to Violence|9and Other Sensitive Populations: Agency Coordination (Environmental Programs & Management)|9of Women Vietnam Veterans (CWVV)|8’s Health Insurance Program|bResearch and Technical Assistance|2oice Neighborhoods|2ronic Disease and Prevention and Health Promotion|1itizen Services and Innovative Technologies Program|7ship|2vil Division (CIV) - Legal Representation|6Enforcement (Environmental Programs & Management, Leaking Underground Storage Tanks, Oil Spill Response)|6Litigation|6Rights / Title VI Compliance (Environmental Programs & Management)|dDivision (CRT) - Civil Rights Enforcements|6Society|5ian Health and Medical Program of the Department of Veterans Affairs (CHAMPVA)|9Personnel Training|1lean Air Allowance Trading Programs (Science & Technology, Environmental Programs & Management)|2ient Assistance State Grants (CFDA # 84.161)|3mate Protection Program (Science & Technology, Environmental Programs & Management)|8and Land Use Change|3nical Laboratory Improvement Amendments|9Services|1oal Mine Workers’ Compensation (OWCP)|2llecting the Revenue|8ons|5ge Access Challenge Grant Program (CFDA # 84.378A)|8Housing and Academic Facilities Loans Program|3orado Dam Fund, Boulder Canyon Project|2mbating Weapons of Mass Destruction (WMD)|3mand & Control Activities|8Centers|4ercial Crew|bDrive License Program Improvement|bMotor Vehicle Operating Grants (Safety Operations and Programs)|bSpace Transportation (Operations)|bVehicle Information Systems and Networks Grants|4issary Fund|4odity Assistance Programs|aPrograms, Commodity Credit Corporation|burchases|4unication Site Management|ds|7ty Development Capital Initiative|mFinancial Institutions (CDFI) Program|aFacilities|aLiving Centers (CLCs)|aNursing Homes|aService Employment for Older Americans (ETA)|hs Programs|aand Economic Development|9-Based Violence Prevention Initiatives|3pact of Free Association|4ensation and Working Conditions (BLS)|5titive Grants to Underrepresented Communities|4lementary and Alternative Medicine Research|5iance Monitoring (Environmental Programs & Management, Superfund, Oil Spill Response)|4rehensive Centers (CFDA # 84.283)|4uter and Information Science and Engineering (CISE)|2nflict Mitigation|9Resolution and Violence Prevention Program Operations|9Stabilization Operations|3gressional, Intergovernmental, External Relations (Environmental Programs & Management)|3servation Easements|dOperations|dPrograms, Commodity Credit Corporation|c, Enforcement and Science (new title & components 2014)|4olidated Cybercrime and Economic Crime/Intellectual Property Enforcement Program|dPlan|dYouth Oriented Program|4truction|c|c|c Management|dand Acquisition of Facilities Program|hMajor Renovations|d– Major Projects|ginor Projects|4umer Operated and Oriented Plan Program|3tract Confinement|9Support Costs|5ibuted Funds|9ion to the African Development Bank (AfDB)|zment Fund (AfDF)|lsian Development Bank (AsDB)|znt Fund (AsDF)|kClean Technology Fund (CTF)|kEuropean Bank for Reconstruction and Development|kGlobal Agriculture and Food Security Program (GAFSP)|rEnvironment Facility (GEF)|kInter-American Development Bank (IDB and FSO)|zInvestment Corporation (IIC)|pnational Bank for Reconstruction and Development (IBRD)|yDevelopment Association (IDA)|yFinance Corporation|zund for Agricultural Development (IFAD)|kMultilateral Debt Relief Initiative for IDA|zbt Relief Initiative for the AfDF|xInvestment Fund (MIF)|zvestment Guarantee Agency|kNorth American Development Bank|kStrategic Climate Funds (SCF)|cs to International Organizations|vPeacekeeping Activities|3ventional Energy|2operative Endangered Species Conservation Fund|cHousing (Section 213)|cLandscape Conservation (new title & components 2014)|2re Science Systems|3porate Services|2smic Origins|2unter-Narcotics|8Terrorism|7drug Support|7terrorism and Counterproliferation|g/Counterintelligence|3rt-Appointed Special Advocate|2venant Grants|4rdell Forensic Science Grants|1redit Enhancement for Charter School Facilities (CFDA # 84.354)|2ime Victims Fund|4inal Division (CRM) - Enforcing Federal Criminal Laws|9Enforcement (Environmental Programs & Management, Superfund)|bterprise/Federal Crimes|9Investigations|9Justice Services (CJS)|itatistical Program (Bureau of Justice Statistics) (BJS)|9Litigation|2oss-Cutting Capital Investments|6Department IT|hManagement|6cutting Investments|5cutting Space Tech Development|1ultural Programs|2rrent Passenger Rail Service|8Surveys and Statistics|1ybersecurity and Communications|0DNA Initiative|1OL management and other|1airy Indemnity Payment Program (DIPP)|2ta Processing|1eafness and Other Communication Disorders Research|2fense Nuclear Nonproliferation Research and Development|gSecurity|8Operations|7-Wide Intelligence Program|2mographic Statistics Program|durveys Sample Redesign|4nstration and Training Programs (CFDA # 84.235)|2ntal Care|7and Craniofacial Research|2partment Leadership|bof Housing and Urban Development-VA Supportive Housing (HUD-VASH)|a-wide Systems and Capital Investments Program|aal Administration: Support Offices/Corporate Management|dBOS & Mgmt., HQs|dHQ|dServices|etaff Services|r (Centralized Services )|3endency Indemnity Compensation (DIC)|8t Education|2veloping Hispanic-Serving Institutions (CFDA # 84.031)|7ment|3ices and Radiological Health|1iabetes and Digestive and Kidney Disease Research|2esel Emissions Reduction Grant Program (State & Tribal Assistance Grants)|2gital Television Transition and Public Safety Fund (mandatory)|2plomatic Policy & Support|2rect Administrative Costs|6ed Stockpile Work|2sabilities Program|9y Insurance|4ster Assistance|9Human Services Case Management|9Readiness|bcovery Assistance|bsponse and Emergency Management|3covery|3tance Learning Telemedicine and Broadband|2version Control Program|1o Not Pay (DNP) Business Center|2mestic Enforcement|9Finance and Tax Policy|9Rad/Nuc Detection, Forensics and Prevention Capability|9and International Policy|1rinking Water Programs (Science & Technology, Environmental Programs & Management)|2ug Abuse Research|5Court Program|5Enforcement Administration, Construction|0EDA Revolving Fund|1TA management and other|1arth Science Multi-Mission Operations|eResearch|eTechnology|7ystem Science Pathfinder|catic Missions|1cological Services|3nomic Adjustment Assistance Grants|9Opportunity|9Research, Market Outlook, and Policy Analysis|9Statistics Programs|3systems|1ducation Construction|aManagement|aand Cultural Exchanges Programs|eHuman Resources (EHR)|afor Native Hawaiians (CFDA # 84.362)|aof Homeless Children & Youth (CFDA # 84.196)|9al, Technology, Media, and Materials (CFDA # 84.327)|1lder Program|2ectricity Delivery and Energy Reliability (OE)|6onic Government Program|3mentary and Secondary Programs|pSchool Counseling (CFDA # 84.215)|1mbassy Security, Construction and Maintenance|2ergencies in the Diplomatic and Consular Service|8y Conservation Program|aForest Restoration Program|aHomeowners' Loan Program|5ing Leaders|9and Zoonotic Infectious Diseases|2ployee Benefits Security Administration|6ment Service (ETA)|3owerment Zones|1ndocrine Disruptors (Environmental Programs & Management)|2ergy Assistance Loan Guarantees and Payments|7Efficient Mortgage Insurance|8mployees Occupational Illness Compensation (OWCP)|zss Compensation Program|7Information Administration (EIA)|7and Minerals Management (Oil, Natural Gas and Coal; includes offsetting fees)|xther Mineral Resources)|wRenewable Energy)|6, Minerals, and Environmental Health|3wetak Support|2forcement and Compliance (New in FY 2014)|gIntervention Programs (Safety Operations and Programs)|gRemoval Operations|2gineering (ENG)|cCampaign|3lish Learner Education (CFDA # 84.365)|2hancing Safety for Victims and their Children in Family Law Matters|2vironment|b and Natural Resources Division (ENRD) - Civil Litigation|zivision (ENRD) - Criminal Litigation|bal Assessment|eCompliance and Restoration|eEducation (Environmental Programs & Management)|fnforcement|eHealth|k Sciences Research|eJustice (Environmental Programs & Management, Superfund)|eManagement (EM)|eQuality Incentives Program|eand Compliance Review|1valuation|a Clearinghouse|1xams and Collections|2change Network (Environmental Programs & Management, Superfund)|9Stabilization Fund (ESF)|2ecutive Direction|j|j (Centralized Services)|kand Administration|zive Services|oStaff Services (BLS)|aOffice for Immigration Review (EOIR)|aSupport and Professional Responsibilities|2isting Multifamily Rental Housing (Section 207/223(f))|2oplanet Exlporer|2ploration Construction of Facilities (CoF)|cGround Systems|cTechnology Development|3ort Administration|7Enforcement|2tension|4rnal Administrative Costs|1ye Research|0FDA Headquarters and Program Support|1IE Programs of National Significance (CFDA # 84.215)|1acilities|a Construction and Maintenance|bMaintenance|band Equipment (F&E): Engineering, Development, Test and Evaluation|o: Facilities, Equipment, Mission Support and General Expenses|fInfrastructure Recapitalization Program|7y Maintenance and Rehabilitation|9Operations|2mily Housing|7Planning|f and Reproductive Health|7Self-Sufficiency (FSS) Program|9rvicemembers’ Group Life Insurance (FSGLI)|7Unification Vouchers|7Violence Prevention and Services|2rm Loans|5labor Housing|1ederal Acquisition Service Integrators Program|9dministration|m & USERRA Enforcement (VETS)|9gency Human Resource Services|fSupport|9id in Sport Fish Restoration Fund|fWildlife Restoration|8Bureau of Investigation (Construction)|8Crop Insurance Corporation Fund|8Deposit Insurance Corporation Payments|9irect Student Loans|8Employee Healthcare and Insurance|hPolicy Oversight|hRetirement|gs’ Compensation Act (OWCP)|9nergy Management Program|8Family Education Loans|9inancing Bank (FFB)|8Guarantees for Financing for Tribal Housing Activities (Title VI)|8Housing Administration (FHA)-Refinance Program|9uman Resources Information Technology Human Resources Line of Business (HRLOB)|8Investigative Services|8Land Acquisition|cs Recreation Enhancement Act (included in W&RR in MAX because under $million)|8Pell Grants (CFDA # 84.063)|9rison Industries (FPI)|eer Detention|aotective Service|8Services|9tationary Source Regulations (Environmental Programs & Management)|9upplemental Educational Opportunity Grants (SEOG) (CFDA # 84.007)|cort for Air Quality Management (Science & Technology, Environmental Programs & Management)|8TRIO Program (CFDA # 84.042, 84.044, 84.047, 84.066, 84.217)|9rust Programs|8Vehicle and Fuels Standards and Certification (Science & Technology|8Work-Study (CFDA # 84.033)|8and State Technology Partnership (FAST) Program|7-Aid Highways & Highway Safety Construction Programs|8State Unemployment Insurance System (ETA)|2es and Expenses of Witnesses (FEW)|1iduciary Services|2ling and Account Services|4pino Veterans Compensation|2nancial Assistance Grants / IAG Management (Environmental Programs & Management, Superfund)|aEducation and Counseling Pilot Program|zPilot Program (Hawaii)|aSector|btability Oversight Council|2sh and Aquatic Conservation (new title 2013)|9Wildlife Management and Development ‐ Endangered Species Conservation/Recovery Program|zvelopment ‐ Other|3sile Materials Disposition|1leet Support|2ight Training|2ood Risk Management|1ood Safety and Inspection|5for Peace Title II Grants|4s Program|2reign Claims|8Labor Certification (ETA)|8Medical Program (FMP)|4nsics Support (Science & Technology, Superfund)|4st Service Permanent Appropriations and Trust Funds|7and Rangeland Research|3mer Presidents Program|4ula Grants Programs|2ssil Energy R&D|1ranchise Fund|1ugitive Apprehension|2nd for the improvement of Postsecondary Education (CFDA # 84.116)|4amental Aeronautics|2sion Energy Sciences|0GPRA Data/HEA Program Evaluation (CFDA # 84.895)|1SE Mortgage-Backed Securities (MBS) Purchase Program|1aining Early Awareness and Readiness for Undergraduate Programs (CFDA # 84.334)|2llaudet University (CFDA # 84.910)|1eneral Administration|m (Construction)|kve Expenses|nSupport (Operations)|8Management and Support Services Program|9edical Sciences Research|8Operations|8Purpose Support|8Supplies and Services Program|cort Services|2ographic Program: Chesapeake Bay (Environmental Programs & Management)|kGulf of Mexico (Environmental Programs & Management)|kLake Champlain (Environmental Programs & Management)|long Island Sound (Environmental Programs & Management)|kOther (Environmental Programs & Management)|kPuget Sound (Environmental Programs & Management)|kSan Francisco Bay (Environmental Programs & Management)|louth Florida (Environmental Programs & Management)|bSupport|3physical Activities|cBOS & Mgmt., HQs|3sciences (GEO)|3thermal Technology|1ifts and Bequests Trust Fund|aDonations|1lobal Health|7Markets (New in FY 2014)|7Threat Reduction Initiative|1ood Governance|2vernment Agency Investment Services (GAIS)|a-wide Accounting and Reporting (GWA)|gPolicy Program|1raduate Assistance in Areas of National Need (CFDA # 84.200)|3in Regulatory Program|3nt Administration|6and Per Diem (GPD) Program|5s for Infants and Families (CFDA # 84.181)|bSpecified Energy Property|7to Combat Violence Against Women (STOP)|aEncourage Arrest Policies|aLocal Educational Agencies (CFDA # 84.060)|zs (Title I) (CFDA # 84.010)|aStates (CFDA # 84.027)|aWool Manufacturers (mandatory)|6‐in‐Aid to States and Territories|hTribes|3ssroots Source Water Protection Program|2eat Lakes Restoration (Environmental Programs & Management)|3en Retrofit Program|1uaranteed Loan Sale Securities|0HCHB Renovation and Modernization|1HS Policy Development and Program Support|1IV/AID|7S, Viral Hepatitis, Sexually Transmitted Diseases (STD), and Tuberculosis (TB) Prevention|1OME Investment Partnerships Program|1UBZone|2D-Veterans Affairs Supportive Housing (VASH)|1azardous Fuels Reduction|aMaterials Safety|1ead Start|3lth Care Fraud and Abuse Control|cSystems|cfor Homeless Veterans (HCHV)|7Education Assistance Loans Program|7Information Technology and Quality|9surance Marketplaces|7Personnel Training|8rofession Opportunity Grants|7Surveillance and Program Support|7Threats Resilience|7Workforce|6y Food Financing Initiative (HFFI)|8Homes|3rt, Lung, and Blood Research|2len Keller National Center for Deaf-Blind Youths and Adults (CFDA # 84.904)|3iophysics Explorer Program|4um Fund|2ritage Partnership Programs|1igh Energy Physics|5School Graduation Initiative (CFDA # 84.360)|5Visibility Enforcement|4er Education|4way Safety Research and Development|2storically Black College and University Capital Financing Program (CFDA # 84.951)|1ollings Manufacturing Extension Partnership|2me Based Primary Care|5Equity Conversion Mortgage (HECM) Program (Section 255)|4land Security Investigations|h: Communication and Information (Environmental Programs & Management)|kritical Infrastructure Protection (Science & Technology, Environmental Programs & Management)|5ess Prevention and Rapid Rehousing|9Veterans Supported Employment Program (HVSEP)|h' Reintegration Program (VETS)|4maker and Home Health Aide Care|2spice and Palliative Care|5tals & Other Medical Activities|2using Counseling Assistance|8Finance Agencies Initiative|ly (HFA) Hardest-Hit Fund|8Guaranteed Loan|8Opportunities for Persons with AIDS (HOPWA)|8Trust Fund|2ward University (CFDA # 84.915)|1uman Drugs|6Genome Research|6Health Risk Assessment (Science & Technology, Superfund)|6Research Program|9ources|f Management (Environmental Programs & Management, Superfund)|6Services|7pace Flight Operations|1ydrogen and Fuel Cell Technologies|5power|0INTERPOL Washington|1mmigration Security and Integrity|dtatus Verification|3unization and Respiratory Diseases|2port Administration (Thru FY 2013)|3roving Teacher Quality State Grants (CFDA # 84.367)|1n-Flight Security|2definite User Fees|4pendent Living|3ian Arts and Crafts Board|8ssistance|7Community Development Block Grant (CDBG)|9untry - Sexual Assault Clearinghouse|7Guaranteed Loan Program|7Health Facilities|8ousing Loan Guarantee Fund (Section 184)|7Land and Water Claim Settlements & Miscellaneous Payments to Indians|7and Native American Program (ETA)|4viduals|3oor Air: Radon Program (Science & Technology, Environmental Programs & Management)|3ustry and Analysis (New in FY 2014)|2ertial Confinement Fusion Ignition and High Yield Campaign|2formation Clearinghouse Program|cIntegration and Technology Transformation|cManagement Activities|cSecurity (Environmental Programs & Management, Superfund)|ervices|cTechnology Development and Sustainment (Safety Operations and Programs)|cand Customer Service|3rastructure|e Assistance: Alaska Native Villages (State & Tribal Assistance Grants)|rClean Water SRF (State & Tribal Assistance Grants)|rDrinking Water SRF (State & Tribal Assistance Grants)|rMexico Border (State & Tribal Assistance Grants)|fProtection|2jury Prevention and Control|2mate Care & Programs|2patient Care|2spection and Grading of Farm Products|7or General|h Program|3titution Security and Administration|bal Construction of Facilities (CoF)|2tegrated Activities|cward Environment Program|bEnvironmental Strategies (Environmental Programs & Management)|bOperations|bSystems Research|bTechnology Services Program|4llectual and Developmental Disabilities|6igence|c Skill Training|dand Targeting|4rceptors|6ontinental Ballistic Missiles (ICBMs)|5governmental Relations|5modal Assessments and Enforcement|bScreening Operations|5national Affairs and Economic Policy|eBoundary and Water Commission – Construction|zmmission – Salaries and Expenses|eChancery Center|eEnforcement|eFisheries Commission|eLabor Affairs Bureau|eMaterial Protection and Cooperation|ePark Affairs|eSources of Pollution (Environmental Programs & Management)|fpace Station Program|fupport|eTrade|eand Integrative Activities (IIA)|2vestigations|e|e|e|bve Expenses (Definite Authority)|eSupport Services (new for FY14)|7ng in Innovation Fund (CFDA # 84.396)|dManufacturing Communities Fund (New in FY 2014|1raq and Afghanistan Service Grants (CFDA # 84.408)|0James Webb Space Telescope|1ob Corps (ETA)|3s for Veterans State Grants (VETS)|2hn E. Fogarty International Center|5R. Justice Student Loan Repayment Program|2int Fire Science Program|1udicial and Courthouse Security|2stice Assistance Grants (JAG)|8Information Sharing Technology|8Management Division|2venile Accountability Block Grant Program (JABG)|0Labor Force Statistics (BLS)|5atory Facilities|bPrograms|2nd Acquisition|g|g (Mandatory)|5Management and Development|6obility Forces|5Resources (Management of Cultural Resources)|uPublic Domain Forestry)|uRangeland)|t: Soil, Water & Air; Riparian; Wild Horse & Burro; partial Rangeland)|2unch Services|2w Enforcement Operations (new for FY14)|gTraining|1ead Regulatory Enforcement Program|5Technical Studies and Programmatic Support|3king Underground Storage Tanks / UST (Environmental Programs & Management, Superfund)|yCooperative Agreements (Leaking Underground Storage Tanks)|yPrevention (Leaking Underground Storage Tanks)|2gacy Management (LM)|4l Advice: Environmental Program (Environmental Programs & Management, Superfund)|eSupport Program (Environmental Programs & Management)|7ssistance Program|6Education|1oan Programs (LP)|4s to the International Monetary Fund (IMF)|2gistics BOS & Mgmt. HQs|aSupport to MILCON Activities|lProcurement Activities|lR&D Activities|2ngshore and Harbor Workers Compensation (OWCP)|2ss Mitigation|2w Income Home Energy Assistance|3er Colorado River Basin Development Fund|1unar Quest|0MCSAP High Priority Grants|6New Entrant Grants|1acroeconomic Foundations for Growth|2gnet Schools Assistance (CFDA # 84.165)|2intenance Operations|2jor Research Equipment and Facilities Construction (MREFC)|2king Home Affordable Program (MHA)|2laria|2nagement Activities|band Administration - BOP|fPolicy Coordination|3datory Developing HIS STEM and Articulation Program (CFDA # 84.031)|aGrants to States and Tribes (AML)|3ufactured Homes Loan Insurance (Title I)|fusing Programs|aing|d and Services (Thru FY 2013)|2rine|6 Ground Forces|k Support|7Pollution (Environmental Programs & Management)|7Transportation System Management|4time Guaranteed Loan Program|9Law Enforcement|9Patrol & Undersea Surveillance|arevention|9Response|9Security Operations|iProgram|3k-to-Market Program|4et Access and Compliance (Thru FY 2013)|7Development and Food Assistance|6ing Services|3s Exploration|2ster’s Degree Programs at HBCUs and Predominantly Black Institutions (CFDA # 84.382)|2ternal and Child Health|3hematical and Physical Sciences (MPS)|as and Science Partnerships (CFDA # 84.366)|1cGovern-Dole International Food for Education and Child Nutrition Program|2Kinney-Vento Homeless Assistance Grants|1edicaid|6l BOS & Mgmt. HQs|8Countermeasure Advanced Development|8Expenditure Panel Survey|6re|8 – Administrative Support|2morial Services|2ntal Health|d Research|hidential Rehabilitation Treatment Programs (MH RRTP)|eService, General Outpatient Care|d, Inpatient Care|htensive Recovery-Oriented Program|6ly Ill Offender Act|2rit System Accountability & Compliance|2thamphetamine Enforcement and Cleanup|1icroloan|2grant (CFDA # 84.011)|8and Seasonal Farmworker (ETA)|vs (CFDA # 84.128)|5tion Management|6ory Bird Conservation Account|2litary Personnel Training|2ne Safety and Health Administration|5Warfare Forces|3ing Law Administration|3ority Business Development|iOutreach|iResource Center|9HIV/AIDS|aealth and Health Disparities Research|9Science and Engineering Improvement (CFDA # 84.120)|2scellaneous Permanent Accounts ‐ O&M of Quarters (included in W&RR in MAX because under $million)|pppropriations|oPayment Accounts|eTrust Funds|3sing Alzheimer's Program|8and Exploited Children's Program (MECP)|5on Support|2tigation|1odel Transition Programs for Student With Intellectual Disabilities Into Higher Education (CFDA # 84.407)|4rnization and Repair (M&R)|2nitoring and Evaluation|3tgomery GI Bill – Active Duty|lSelected Reserve|2rtgage Backed Securitization Program|9Insurance for Hospital Facilities (Section 242)|pusing for the Elderly (Section 231)|nResidential Care Facilities (Section 232)|9and Major Home Improvement Loan Insurance for Urban Renewal Areas (Section 220)|2tor Carrier Safety Assistance Program Grants|1ulti-Family Housing|5family Housing Service Coordinators|cRental Housing for Moderate-Income Families (Section 221(d)(3) and (4))|disk-Sharing Programs (Section 542 (B) and 542(c))|5mode & lntermodal Lift|5national Species Conservation Fund|0NIH Program Support and Crosscutting Research Projects|2ST Working Capital Fund (Centralized Services)|1NSA CIO Activities|5Office of the Administrator|1ational Activities (CFDA # 84.850)|9Call Center for Homeless Veterans (NCCHV)|aenter for Toxicological Research|ariminal History Improvement Program (NCHIP)|9Environmental Policy Act Implementation (Environmental Programs & Management)|nSatellite, Data and Information Service|astuary Program / Coastal Waterways (Environmental Programs & Management)|9Forest System|cum on Youth Violence Prevention|9Healthcare Operations|aomeless Registry|9Infrastructure Investments|bstant Criminal Background Check System Record Improvement Program (NICS)|ditute for Occupational Safety and Health|jof Justice (NIJ)|kn Disability and Rehabilitation Research (CFDA # 84.133)|9Landscape Conservation System|aeadership Activities (CFDA # 84.051)|aibrary of Medicine|9Marine Fisheries Service|9Network for Manufacturing Innovation (mandatory)|9Ocean Service|9Priority Safety Programs|bograms (CFDA # 84.051)|9Research|cource Center on Workplace Responses|9Security|brvice Life Insurance|bx Offender Public Website|9Technical Institute for the Deaf (CFDA # 84.908)|9Weather Service|aildlife Refuge Fund|pSystem|4ve American CDFI Assistance (NACA) Program|gDirect Loan|gHousing Block Grants|gOutreach|gPrograms|7Hawaiian Housing Block Grants|gLoan Guarantee Fund (Section 184A)|3ural Hazards|8Programs|8Resource Damage Assessment and Restoration|gs Revenue|2val Reactors|3igation|3y|4 BOS & Mgmt., HQs|5R&D Support|5Systems Support|1eglected and Delinquent (CFDA # 84.013)|2ighborhood Stabilization Program (NSP)|2otropical Migratory Bird Conservation Fund|2urological Disorders and Stroke Research|2w Frontiers|4Loan Subsidies|1on-Strategic Nuclear Naval Forces|4elderly disabled vouchers|3insured Crop Disaster Assistance Program (NAP)|3proliferation and International Security|2rth American Aerospace Defense Command (NORAD) and Space Command (SPACECOM) Support|fWetlands Conservation Fund|1uclear Counterterrorism Incident Response Program|8Energy (NE)|8Physics|9rograms|8Weapons Support|2rsing Research|2trition|0OIG Audits, Inspections, Investigations, and Reviews|1SMRE Regulatory Program for active mining (Title V of the Surface Mining Control and Reclamation Act)|1WCP management and other|1ccupational Safety and Health Administration|2eanic and Atmospheric Research|1ffice of Acquisitions, Logistics and Construction|aCivil Rights|bongressional and Legislative Affairs|aDisability Employment Policy|aFederal Contractor Compliance Programs|binancial Research|aGeneral Counsel|aHuman Resources and Administration|aInspector General|r|aLabor Management Standards|begal Counsel (OLC) - Legal Counsel|aManagement|bedicare Hearings and Appeals|aPardon Attorney (OPA)|bolicy and Planning|bublic and Intergovernmental Affairs|aSecurity and Preparedness|aTechnical Assistance (OTA)|athe Inspector General|v|v|v|v (OIG)|eNational Science Board (NSB)|eSecretary|n and Executive Management|folicitor General (OSG) – Federal Appellate Activity|1il Spill Research|dponse Spill: Prevention, Preparedness and Response (Oil Spill Response)|1ld Age and Survivors Insurance|1mbudsman Program|1ne to Four Family Home Mortgage Insurance (Section 203(b))|1perating Expense Program|aGrants to Amtrak|7on and Maintenance of Quarters|9s Grants|band Administration (O&A)|fMaintenance|fPrograms (Operations and Training)|a, Safety and Regulation|dupport, and Other Services|1regon & California Grant Lands (Western Oregon Resource Management Planning)|zstern Oregon transportation and facilities maintenance)|2ion Multi-Purpose Crew Vehicle|1ther Logistics Support|6Operational Support|6Permanent Appropriations|9sonnel Support Activities|7ublic Health Threats|1uter Continental Shelf Oil Lease Revenue|6Planets|1verseas Programs|0PRIME Program|2OMISE: Promoting Readiness of Minors in SSI (CFDA # 84.418P)|1ackers and Stockyards Program|2lau Compact Support|2ndemic Influenza and Other Emerging Threats (PIOET)|2rent Information Centers (CFDA # 84.328)|3k Management|3t B: Formula Grants|4nership Development and Strategic Integration|cPlanning Grants|2tents|2yment to DoD Medicare-Eligible Retiree Health Care Fund|bthe American Institute in Taiwan|7s|8 for Federal Property|kly Connected Children|9in Lieu of Taxes|9to Air Carriers/Essential Air Service|cStates and Possessions|jfor Child Support Enforcement and Family Support Programs|nFoster Care and Permanency|jin Lieu of Coal Fee Receipts|cthe U.S. Territories, Fiscal Assistance|hMWA from AML Interest|1ension Benefit Guaranty Corporation|2rishable Agricultural Commodities Act|3manent (Indefinite Authority)|aOperating Funds|3sonnel Acquisition|l Base Operations|aBOS & Mgmt., HQs|aPreparation (CFDA # 84.323)|2sticides: Protect Human Health from Pesticide Risk (Science & Technology, Environmental Programs & Management)|kthe Environment from Pesticide Risk (Science & Technology, Environmental Programs & Management)|cRealize the Value of Pesticide Availability (Science & Technology, Environmental Programs & Management)|2troleum Reserves|1harmacy|2ysical Education Program (CFDA # 84.215)|6s of the Cosmos|1ipeline Safety|1lanetary Science Research|iTechnology|1olicies, Regulations, and Systems|5y Support|7and Administration|4tical Competition and Consensus-Building|3lution Prevention Program (Environmental Programs & Management)|2st Secondary Programs|4-9/11 GI Bill|5Vietnam Era Veteran’s Educational Assistance Program|1re-Filing Taxpayer Assistance and Education|3ferred Stock Purchase Agreements (PSPA)|3paredness|3school Grants (CFDA # 84.173)|5ription Drug Monitoring Program|4idential Nominating Conventions|dTransition Program|3ventive Health|2ices and Cost of Living (BLS)|3mary Health Care|3son Rape Prevention and Prosecution Program|6er Security and Transportation|3vate Market Insurance|8Sector Competitiveness|2ocurement Assistance Program|3ductivity and Technology (BLS)|3gram Administration|8Management|i and Administration|8Support|8of All Inclusive Care of the Elderly (PACE)|bComprehensive Assistance for Family Caregivers|3ject-Based Rental Assistance (PBRA) aka Section 8 for Projects|3mise Neighborhoods (CFDA # 84.215)|4oting Safe and Stable Families|4pting Postbaccalaureate Opportunities for Hispanic American (CFDA # 84.031)|3perty Improvement Loan Insurance (Title I)|3secutions|4thetics and Sensory Aids Service (PSAS)|3tect the Public|7ion|a & Advocacy of Individual Rights (CFDA # 84.240)|bof Foreign Missions and Officials|eWitnesses|a, Assistance, and Solutions|8ve Intelligence|1ublic Health Preparedness and Response|eScientific Services|8ousing|7Law 480 Title I Direct Credit and Food for Progress Program Account|7Safety & Justice Construction|eBroadband Corporation (mandatory)|eand Justice|7Telecommunications Facilities, Planning and Construction|7Works Grants|6-Private Investment Program (PPIP)|0R&D BOS & Mgmt. HQs|4Support Activities|1CRA: Corrective Action (Environmental Programs & Management, Oil Spill Response)|6Waste Management (Environmental Programs & Management, E-Manifest)|dinimization & Recycling (Environmental Programs & Management, E-Manifest)|1ace to The Top Fund (CFDA # 84.395, 84.412, 84.416)|2diation: Protection (Environmental Programs & Management, Science & Technology, Superfund)|bResponse Preparedness (Science & Technology, Environmental Programs & Management)|2il Service Improvement Program|4road Research and Development|2nge Improvements (Includes Public Lands Improvements, Farm Tenant Act Lands Improvements, and Administrative Expenses)|1eadiness Campaign|4justment Counseling|4y-to-Learn Television (CFDA # 84.295)|3l Property Disposal Program|eRelocation Program|4ty and Ownership Management|2clamation Trust Funds|cWater Settlements Fund|3overy|3reation|a Enhancement Fee Program|bFee Permanent Appropriations|bManagement (Recreation)|nWilderness)|bPrograms|2duce Risks from Indoor Air (Science & Technology, Environmental Programs & Management)|2forestation Pilot Program|3ugee and Entrant Assistance|2gional Educational Laboratories|axport Challenge (New in FY 2014)|9Information Sharing System (RISS)|bnovation Clusters|9Science and Technology (Environmental Programs & Management)|3ulate|7ion and Aquatic Resources|7ory|a/Economic-Management and Analysis (Environmental Programs & Management)|2habilitation Loan Insurance (Section 203(k))|2integration of Ex-Offenders (ETA)|2lated Programs|2newable Energy|3t Supplement|4al Assistance|h Demonstration|iProgram (RAP)|7Housing Assistance (Section 236)|7of Space Program|2pairs and Alterations Program|4triation Loans Program Account|3resentation Allowances|2search|8 & Technology|l (Safety Operations and Programs)|9and Development|dEducation|evaluation Grants|oViolence Against Women (NIJ)|dStatistics|9in Special Education (CFDA # 84.324)|9on Health Costs, Quality and Outcomes|cViolence Against Indian Women|8, Demonstrations and Innovations|cvelopment Demonstration and Deployment Projects|l, and Innovation|aEngineering and Development|8: Air, Climate and Energy (Science & Technology)|aChemical Safety and Sustainability (Science & Technology)|aSafe and Sustainable Water Resources (Science & Technology)|4rve Educational Assistance Program|3ident Opportunity and Self-Sufficiency (ROSS) Program|8ial Substance Abuse Treatment (RSAT) (Improving Reentry)|3ource Protection and Maintenance (Land Use Planning, Abandoned Mine Lands, Hazardous Materials)|z (Law Enforcement)|8s Management Construction|3pite Care|4onse|2tail Securities Services (RSS)|3irement Pay and Medical Benefits for Commissioned Officers|1ocket Propulsion Test|2wley Training Center|1ule of Law and Human Rights|2naway and Homeless Youth Programs|2ral Business Grants|fLoans|6Domestic Violence & Child Abuse Enforcement Assistance|6Education (CFDA # 84.358)|7lectrification and Telecommunication Loans|6Health|6Water and Waste Loans and Grants|1yan White HIV/AIDS Program|0S&L Gun Crime Prosecution Assist/Gun Violence Reduction|1CORE|1OF Operations|4Support Activities|1TEM Education and Accountability|1afe & Drug-free Schools and Communities National Programs (CFDA # 84.184)|5Trade and International Technical Assistance|4guarding and Emergency Preparedness/Response|4ty Data Improvements Grants|7Mission Support (Safety Operations and Programs)|7and Mission Success|bOperations|2int Lawrence Seaway Development Corporation|2laries and Expenses (S&E)|2n Joaquin Restoration Fund|2tellite Communications|1chool Improvement State Grants (CFDA # 84.377)|7Leadership (CFDA # 84.363)|2ience Advisory Board (Environmental Programs & Management)|8Campaign|8Policy and Biotechnology (Environmental Programs & Management)|1ea Based Anti-Submarine Warfare (ASW) Air Forces|3lift Forces|2cond Chance/Prisoner Reentry|6ary Market Guarantees|3ure Transportation Asset|5ing America's Borders|9and Expediting Trade|rvel|6ty & Investigative Activities|9Programs|2lf-Help Homeownership and Opportunity Program (SHOP)|2ptember 11th Victims Compensation Fund|2rvice Forces|7-Disabled Veteran-Owned Small Business Procurement|os’ Insurance|7members’ Group Life Insurance (SGLI)|ze Traumatic Injury Protection (TSGLI)|2xual Assault Services (SASP)|1hared Services and Support|2ip Disposal Program|1ingle Family Housing|2te Stewardship|2ze Standards|1killed Home Health Care|1mall Business Administration (SBA) 7(a) Securities Purchase Program|fDevelopment Centers (SBDC)|fInnovation Research (SBIR)|zand Small Business Technology Transfer|hvestment Companies (SBIC)|fLending Fund|fOmbudsman (Environmental Programs & Management)|fProcurement Set-Aside|fTechnology Transfer Program (STTR)|6Minority Business Assistance (Environmental Programs & Management)|1ocial Assistance|7Services|f Block Grant|gResearch and Demonstration|6, Behavioral and Economic Sciences (SBE)|2lar Energy|3icitor’s Office|2utheastern Power Administration (SEPA)|5western Power Administration (SWPA)|1pace Communications and Navigation|6Defense|6Launch Support|eystem|6Operations Construction of Facilities (CoF)|2ecial Diabetes Program for Indians|8Education Studies and Evaluations (CFDA # 84.329)|8Olympics Education Programs (CFDA # 84.380)|8Programs for Indian Children (CFDA # 84.299)|lMigrant Students (CFDA # 84.141, 84.149)|7ly Adapted Housing (SAH) & Special Housing Adaptation (SHA)|4trum Management|2ina Bifida Program|5l Cord Injury and Disorders (SCI/D) Service|1tabilization Operations and Security Sector Reform|3ffing and Administration|3ndards Coordination and Special Programs|3te Assessments (CFDA # 84.369)|9istance|6Children’s Health Insurance Program (mandatory)|7ourt Improvement Grants|7riminal Alien Assistance Program (SCAAP)|6Maritime Academies Support (Operations and Training)|7ediation Grants|6Personnel Development (CFDA # 84.323)|6Small Business Credit Initiative Program|6Veterans Home Program|6and Community Highway Safety Grants|aLocal Assistance|gPrevention and Preparedness (Environmental Programs & Management)|aPrivate Forestry|aTribal Wildlife Grants Fund|5wide Data Systems (CFDA # 84.372)|2rategic Capabilities Assets Program|aLand-Based missile (SLBM)|5ospheric Ozone: Domestic Programs (Environmental Programs & Management)|lMultilateral Fund (Environmental Programs & Management)|3engthening Alaska Native and Native Hawaii-serving Institutions (CFDA # 84.031)|fsian American and Native American Pacific Islander-Serving Institutions (CFDA # 84.031L; 84.382B)|eHBCUs (CFDA # 84.031)|fistorically Black Graduate Institutions (CFDA # 84.031)|eInstitutions (CFDA # 84.031)|eNative American-serving Nontribal Institutions (CFDA # 84.031; 84.382)|ePredominantly Black Institutions (CFDA # 84.031P; 84.382A)|eTribally Controlled Colleges and Universities (CFDA # 84.031)|3iving Readers (CFDA # 84.371)|2udent Aid Administration|1ubmarines|3stance Abuse Prevention|gTreatment|2mmary Debt Accounting (SDA)|2perfund: EPA Emergency Preparedness (Superfund)|cmergency Response and Removal (Environmental Programs & Management, Superfund, Oil Spill Respond|cnforcement (Superfund)|bFederal Facilities (Environmental Programs & Management, Superfund, Oil Spill Response)|uEnforcement (Superfund|bRemedial (Superfund)|bSupport to Other Federal Agencies (Superfund)|5vise|3plemental Education Grants (CFDA # 84.841)|dLoans for Multifamily Projects (Section 241)|dNutrition Assistance Program|dPayments to UMWA Health Plans|dSecurity Income|5y Operations|4orted Employment State Grants (CFDA # 84.187)|7ive Housing for Persons with Disabilities (Section 811)|nthe Elderly (Section 202)|bServices for Low Income Veterans and Families (SSVF)|4ression Operations|2rety Bond Guarantees|3face Combatants|8Transportation Board|8Water Protection (Environmental Programs & Management)|3veillance|c/Warning|5y of Program Dynamics (mandatory)|4ivors Compensation|aPension|9’ and Dependents’ Educational Assistance|2stainable Communities Initiative|0TAA Community College & Career Training Grants (ETA)|2X Division (TAX) - General Tax Matters|1EACH Grants|1RI / Right to Know (Environmental Programs & Management)|1actical Operations|2rgeted Investment Program (TIP)|1eacher Incentive Fund Grants (CFDA # 84.374)|8Quality Partnership (CFDA # 84.336)|2chnical Assistance Grants|land Dissemination (CFDA # 84.326)|pWorkforce Development Programs|5ology Base|bInnovation Programs|2en Pregnancy Prevention|2lecommunications Science Research|4health Care|2mporary Assistance to Needy Families|2nant-Based Rental Assistance (TBRA)/Housing Choice Vouchers aka Section 8 for tenants|2rm Asset-Backed Securities Loan Facility (TALF)|3ritorial Assistance|4orism Risk Insurance Program|aand Financial Intelligence (TFI)|1heater Missile Defense|2reatened and Endangered Species|1itle V: Local Delinquency Prevention Incentive Grants|1oxic Substances and Environmental Public Health|g: Chemical Risk Management (Environmental Programs & Management)|wReview and Reduction (Environmental Programs & Management)|iLead Risk Reducation Program (Environmental Programs & Management)|1rade Adjustment Assistance|r (ETA)|6and Governance (Environmental Programs & Management)|aInvestment|5marks|3ining (CFDA # 84.133)|9BOS & Management. HQs|9and Advisory Services|3nsit Safety and Oversight|7ion Assistance Program Employment Workshop (VETS)|bto Teaching (CFDA # 84.350)|aal Housing|k Loan|5national Crime|5portation Audits Program|fInfrastructure Finance and Innovation Program|fPlanning, Research and Development|fand Facilities Mgmt.|3vel, Motor Vehicle and Card Services Program|2easury Forfeiture Fund|8-wide Management and Programs|2ibal - Capacity Building (Environmental Programs & Management)|7Government|7Law Enforcement|7Special Fund|7Trust Fund|6ly Controlled Postsecondary Career and Technical Institutions (CFDA # 84.245)|2opical Forest Conservation Act (TFCA)|2ust ‐ Natural Resources Management|8Real Estate Services|1uberculosis|0U.S. Marshals Service - Construction|5Parole Commission (USPC)|5and Foreign Commercial Service (Thru FY 2013|1S Merchant Marine Academy (Operations and Training)|5xico Border (Environmental Programs & Management)|2-VISIT|2AJOBS|1nder Secretary for Management|3istributed Demonstration / Validation (DemVal) Programs|eEngineering and Manufacturing Development (EMD) Programs|2ited State Government Life Insurance|cs Arctic Research Commission (USARC)|eQuota, International Monetary Fund (IMF)|3versity Programs|1pper Colorado River Basin Fund|1rban Park and Recreation Recovery|1tah Reclamation Mitigation and Conservation Account ‐ proposed to be included under BOR in 2013 & 2014|0VHA Research and Development|1accine Injury Compensation|7s for Children|1ehicle Safety|8Technologies|2ndee Direct Loan|2terans Benefits – Administration of Benefits|9Disability Compensation|9Justice Outreach (VJO) Program|9Mortgage Life Insurance|9Pension|9Reopened Insurance|btraining Assistance Program|8’ Cemetery Grants|aGroup Life Insurance (VGLI)|aSpecial Life Insurance|7’s Business Development|1ictim of Crimes Act of 1984 (VOCA) - Improving the Investigation & Prosecution Of Child Abuse|6s of Trafficking|1ocational Rehabilitation Loan|qState Grants|qand Employment Program|zyment – Independent Living (IL)|zyment – VetSuccess On Campus (VSOC)|0WIA Dislocated Worker (ETA)|4Youth (ETA)|1age & Hour Division|2shington Metropolitan Area Transit Authority|2ter Power|6Quality Research and Support Grants (Science & Technology, Environmental Programs & Management)|6Resources|6Supply|c and Sanitation|6and Energy Management Development ‐ Basin Studies|zment ‐ Cooperative Watershed Management|zment ‐ Indian Water Rights Settlements|zment ‐ Other|zment ‐ Rural Water Programs|zment ‐ San Joaquin River Restoration Program|zment ‐ Title XVI Projects|zment ‐ Water Conservation Field Services|zment ‐ WaterSMART Grants|1eatherization and Intergovernmental Programs|2stern Area Power Administration (WAPA)|2tlands (Environmental Programs & Management)|1hite Earth Settlement Fund|2olesale Securities Services (WSS)|1ildland Fire Management|5ife and Fisheries|2nd Energy|2reless Broadband Access|9Innovation (WIN) Fund (mandatory)|1omen Veterans Health Care|5-Owned Small Business Federal Contracting|5’s Bureau|asiness Centers (WBS)|2rkforce Development for Teachers and Scientists|aHealth and Medical Support|aInformation (ETA)|cnovation Fund (ETA)|cvestment Act (WIA) Adult (ETA)|aand Organizational Support|0Youth Mentoring|5Build (ETA)","sep":"|"},{"f":"0005-033|26-013|520|29-015|4109|110-018|545|550|599|4102|523|69|530|559|560|21-038|4100|25-011|564|124-007|26-053|0184-032|0005-000|110-046|578|69|580|4151|28-093|120-028|543|560|61|572|597|100-000|26-000|27-000|29-000|110-000|21-000|22-000|24-000|25-000|26-000|28-000|29-000|120-000|21-000|23-000|24-000|25-000|26-000|27-000|28-000|29-000|0184-000|0202-000|0422-000|0018-015|126-038|28-002|61|68|67|109-074|563|124-010|29-023|20-001|23-018|24-019|107-004|111-088|124-026|110-172|21-036|121-018|20-002|110-091|28-070|129-057|107-055|126-036|119-001|106-050|118-039|29-021|63|534|109-067|128-031|26-026|64|543|66|0422-011|0009-044|4104|25-042|0184-029|0007-010|524|121-001|107-041|121-008|26-022|118-019|109-062|4112|4053|120-003|29-041|115-051|28-065|24-020|107-029|124-001|109-004|25-053|111-022|126-006|112-017|107-019|64|65|520|61|518|522|516|29-056|118-042|4109|25-046|123-007|25-018|118-064|126-018|64|115-013|65|120-004|24-018|545|115-052|126-021|21-002|107-006|115-018|525|0184-020|0019-024|120-005|115-087|29-005|0422-001|0019-025|109-003|566|530|129-050|582|107-001|115-024|29-016|121-026|111-068|106-065|120-006|67|23-004|119-002|109-010|543|26-021|111-052|129-004|110-162|25-043|128-026|111-066|589|125-004|63|62|109-038|111-103|20-074|21-112|109-047|125-001|105-030|114-005|121-015|111-076|25-023|544|121-039|118-068|120-008|69|510|61|62|63|64|65|66|67|68|69|520|61|62|63|64|65|66|67|106-012|25-043|126-045|105-057|29-007|110-147|4087|575|107-050|110-041|25-068|28-036|21-096|109-094|118-100|109-089|545|25-054|111-084|120-029|29-069|109-075|4103|125-048|109-029|123-019|24-027|111-015|120-030|111-024|120-031|111-019|0184-010|0029-066|107-076|120-032|118-055|120-033|110-167|109-079|521|112-024|25-026|68|28-103|65|20-085|0184-002|0007-052|512|126-034|21-029|530|503|528|111-059|105-055|513|550|110-036|107-013|115-047|517|105-011|129-054|65|112-010|109-099|110-007|21-095|20-145|22-033|20-127|109-064|120-034|118-023|0422-002|0184-006|0011-033|24-007|120-035|105-028|67|514|110-095|21-090|125-005|111-107|20-128|28-011|124-046|110-013|123-001|106-051|129-092|63|109-083|111-056|20-002|4105|25-078|69|66|67|584|60|62|66|573|65|61|60|62|583|68|69|574|594|581|65|24-016|67|20-055|4106|125-019|110-097|4171|106-046|126-015|0184-004|61|0007-048|119-048|21-041|578|20-140|21-086|28-037|21-119|4014|120-036|111-042|124-049|111-043|561|523|124-032|25-064|65|24-028|26-029|110-119|121-040|106-004|124-014|111-083|22-044|105-018|26-011|29-058|119-046|60|124-033|107-049|26-008|69|118-057|129-051|109-051|111-001|129-070|115-010|29-053|107-091|589|590|26-014|69|129-007|107-086|118-090|129-079|109-005|552|120-037|106-068|114-003|0184-036|0019-030|21-113|26-002|128-017|109-098|0184-034|0006-032|0202-006|0026-009|105-004|111-049|25-029|21-046|25-003|124-004|106-062|120-038|109-061|111-071|548|106-033|112-018|126-004|61|65|63|62|110-093|106-027|0184-031|0005-041|26-007|110-166|4009|522|24-009|0422-009|0018-018|67|551|21-114|29-015|123-017|110-020|28-028|24-006|512|105-019|520|125-020|28-029|109-028|112-019|64|125-006|20-039|105-003|125-021|112-023|109-035|119-022|20-032|64|63|4168|542|106-042|121-019|24-047|0422-003|0019-032|28-043|21-111|0202-003|0011-016|67|20-056|126-052|20-040|110-089|109-032|549|120-041|119-051|105-029|110-121|28-006|21-063|25-039|120-042|115-009|20-058|25-001|106-018|539|110-008|22-035|21-008|63|125-022|26-017|550|533|60|106-002|63|25-038|110-116|109-055|508|118-041|20-173|563|28-010|121-005|66|119-038|20-072|61|107-085|29-019|0184-017|0025-049|29-019|25-050|109-100|25-012|509|123-012|109-097|112-043|127-005|107-084|110-114|507|21-044|105-022|115-062|28-078|127-002|61|68|112-021|29-011|28-079|25-069|125-051|115-055|127-010|504|110-135|4084|28-072|21-058|506|124-012|110-141|120-044|118-073|120-045|118-097|20-156|120-046|118-074|128-022|21-009|112-013|21-021|129-011|115-037|129-008|20-047|115-021|62|0184-027|0015-061|20-096|570|569|29-044|107-035|577|0202-002|0005-058|524|29-001|111-011|22-015|129-067|20-048|105-032|61|123-021|21-012|119-013|106-017|111-027|28-094|126-023|119-026|28-102|25-057|28-098|567|121-058|110-012|121-011|504|23-014|109-048|110-098|107-046|123-009|110-057|120-049|550|61|62|63|64|65|66|106-010|27-060|61|0422-004|0019-006|106-016|110-016|109-036|26-043|119-042|0184-008|0015-030|61|123-015|118-099|105-044|110-122|129-071|118-046|25-008|21-104|68|28-024|501|544|106-040|110-125|66|105-015|120-057|25-023|29-025|106-015|29-108|0184-011|0009-027|125-007|28-009|25-052|110-161|121-043|109-092|577|517|129-072|109-012|4110|4082|27-079|29-091|571|124-016|109-014|115-020|125-015|109-050|118-062|126-020|110-053|4124|29-027|28-008|121-035|0184-021|0021-032|118-106|106-049|129-058|25-024|24-048|20-058|69|25-008|29-076|112-042|129-059|560|107-081|125-025|115-058|64|129-022|25-009|510|118-104|109-002|559|120-062|26-035|114-001|120-063|110-003|126-040|119-007|0202-004|0011-020|124-029|530|109-026|26-037|118-013|124-023|109-009|118-061|20-023|21-077|125-053|111-116|20-015|109-024|125-054|110-014|22-005|107-083|120-064|106-041|119-033|106-061|124-050|107-053|120-065|115-042|121-021|24-031|0184-028|0020-066|67|68|69|24-013|109-033|111-054|129-040|105-046|128-030|23-020|111-055|126-049|105-039|123-011|20-070|24-040|26-025|23-008|109-105|111-040|107-078|124-041|107-007|62|111-002|124-024|65|115-002|24-019|68|65|21-045|24-021|22-037|29-043|20-120|120-071|26-037|107-064|128-021|0422-007|0015-012|64|66|538|21-034|551|28-032|106-031|118-075|126-019|112-009|540|109-042|111-085|20-164|21-026|564|505|64|598|22-031|124-020|106-045|110-044|4100|61|4068|107-043|110-025|67|66|64|126-041|111-050|124-011|25-016|67|20-075|66|67|119-052|120-073|64|111-110|4025|29-020|25-093|107-071|60|569|68|112-022|125-026|109-085|110-076|126-008|21-024|65|0184-025|0018-038|107-067|0422-010|0015-053|0184-013|0005-059|111-057|106-001|118-091|20-155|125-027|68|115-065|106-035|27-025|517|523|120-078|24-038|21-050|24-034|107-032|124-035|66|67|21-049|25-029|106-036|25-026|547|126-011|118-085|0184-016|0422-005|0018-014|105-025|125-011|109-076|27-082|29-113|4073|68|116-004|129-001|109-068|60|129-045|62|64|63|111-072|127-006|111-102|128-003|118-004|22-006|28-058|0184-035|0010-108|107-075|112-030|107-031|110-043|106-044|121-056|67|109-106|4065|118-089|20-081|4110|4051|4132|21-075|599|124-039|505|118-095|21-053|0184-037|0029-031|62|25-014|531|62|63|60|21-023|105-008|125-035|64|66|107-040|110-109|109-046|26-052|119-041|550|28-026|129-074|109-006|111-080|120-080|106-059|120-079|105-034|111-094|127-003|29-077|21-055|111-079|109-034|111-060|28-063|20-040|28-071|109-041|26-056|64|65|121-034|118-069|105-040|111-117|4037|129-014|111-087|28-066|106-058|110-111|4094|25-019|129-026|25-055|28-025|109-095|125-056|67|110-169|518|549|68|29-049|0202-001|0007-026|538|67|66|118-005|125-012|110-103|109-054|126-010|118-076|107-034|125-058|105-021|119-045|107-008|110-112|29-047|514|528|536|107-063|29-057|0184-019|0011-007|20-150|22-025|69|106-057|129-090|118-115|129-089|112-039|528|25-063|129-083|65|112-045|28-116|22-026|21-018|129-084|109-111|111-009|129-086|68|67|115-091|24-008|121-059|27-007|29-091|0422-013|62|0029-081|24-002|111-012|20-092|120-081|116-001|128-027|25-037|23-016|21-038|110-019|4139|106-034|129-078|21-047|110-090|109-023|110-047|68|126-031|107-072|539|110-133|107-087|0184-015|0010-131|126-012|114-002|128-023|118-053|105-045|110-143|0184-014|0018-050|20-115|21-091|126-028|106-024|570|29-115|114-014|25-032|28-012|509|20-146|121-054|105-048|29-084|4101|110-152|544|554|22-020|105-049|111-035|20-052|107-073|64|588|118-049|120-082|63|64|119-012|129-047|118-029|126-016|21-044|26-007|513|0184-022|0006-022|110-073|0184-009|0020-085|110-021|129-030|66|115-036|556|124-006|118-045|21-073|565|123-022|109-022|112-032|109-013|111-074|528|109-081|0184-030|0028-005|112-034|28-113|109-020|128-032|106-060|129-061|64|25-038|118-030|109-087|118-092|125-039|111-039|129-052|115-027|124-051|118-059|24-011|21-029|0184-033|0024-052|109-037|61|125-059|105-023|110-010|106-069|110-006|106-067|526|115-048|107-059|68|120-088|69|590|118-031|120-086|67|21-041|537|110-049|29-035|129-046|118-040|123-005|66|110-035|586|63|124-009|0202-007|0010-113|534|4031|60|4117|120-091|105-016|29-086|118-108|106-030|111-062|128-024|20-092|115-067|0202-005|0015-040|120-093|25-040|112-008|24-022|20-054|125-041|105-010|125-060|542|63|23-003|62|114-013|60|125-047|21-053|522|542|105-037|26-028|111-105|28-107|510|109-072|111-118|109-080|121-013|24-021|21-007|20-094|65|66|29-034|25-061|111-070|20-037|68|511|129-062|24-008|115-033|109-114|126-042|24-053|0184-007|0009-093|25-002|61|111-109|28-021|105-005|29-018|25-006|29-016|111-081|128-015|107-044|65|126-044|118-027|105-052|61|121-027|60|26-047|21-036|551|106-023|110-082|107-051|118-002|535|120-098|119-031|120-099|107-033|542|111-082|128-028|119-037|124-042|63|64|107-065|114-004|125-013|111-032|107-030|128-011|29-017|68|520|111-115|25-041|121-048|105-007|119-039|128-012|29-063|115-050|128-013|69|26-027|28-018|115-059|120-100|28-006|520|20-101|0184-024|63|0009-090|66|0422-006|0019-008|22-036|29-017|68|126-039|107-005|562|126-032|551|109-025|118-112|4052|525|507|129-027|106-063|129-068|549|0184-003|0029-080|106-047|118-016|20-136|106-006|29-088|111-067|121-046|105-017|118-047|25-060|129-056|21-033|111-047|120-102|105-035|110-104|28-111|126-048|107-003|120-103|64|118-082|67|63|64|60|68|66|61|503|4114|107-027|29-069|570|115-034|120-107|65|66|68|511|509|510|115-066|28-022|125-044|105-056|110-153|26-003|107-066|118-060|125-045|66|29-073|110-165|128-004|107-028|121-060|20-112|107-009|511|26-005|129-006|510|533|25-063|112-012|21-013|28-077|120-117|111-030|25-045|28-033|4101|106-025|118-048|121-014|107-054|26-048|29-107|26-064|129-065|109-102|125-062|115-049|20-138|25-007|64|107-047|110-029|21-093|109-040|120-113|64|65|106-029|112-011|120-116|0184-026|0006-071|118-056|107-080|118-020|121-017|112-041|28-034|21-106|129-029|0184-005|0023-013|21-010|552|110-039|123-010|115-006|65|120-118|110-001|21-101|20-157|68|28-096|25-090|20-004|65|0184-012|0011-031|510|106-038|121-045|20-119|24-015|27-009|24-003|107-056|67|129-013|0422-008|0015-092|124-022|110-077|4137|4088|129-048|109-011|539|121-031|119-003|129-024|503|65|575|512|509|516|535|502|521|515|28-016|111-097|569|129-028|118-054|129-037|69|68|112-002|63|527|121-016|119-009|120-120|110-170|0202-008|0184-018|0010-062|61|66|559|565|67|63|64|60|29-004|519|120-121|110-017|25-035|105-036|110-028|29-010|106-066|553|129-053|28-010|112-038|128-014|119-029|124-017|112-016|504|61|20-042|21-092|22-007","sep":"|"}]}]);
const COLONY = [
{"id":"n-58c867cd","guard":[],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],["sense.lastWord"]],["render.template",{"lit":["The program name whose program ",{"slot":0}," is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],["render.template",{"lit":["The ",{"slot":0}," name whose program code is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-d85e2406","guard":[["hasAny",["appears in","code","contains","element","has","includes","item number","nth","position"]]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],["sense.lastWord"]],["render.template",{"lit":["The program name whose program ",{"slot":0}," is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],["render.template",{"lit":["The ",{"slot":0}," name whose program code is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-1d5d1649","guard":[["hasAny",["code","element","item number","nth","position"]]],"pyramid":["render.code",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-2eb5691b","guard":[],"pyramid":["render.code",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-30799ae0","guard":[["hasAny",["code","element","item number","nth","position"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-450464ba","guard":[],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-0a2bbc82","guard":[],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-1b2b94bb","guard":[["hasAny",["code","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.code",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-33350324","guard":[["hasAny",["all caps","capital letters","capitals","code","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-6c90166c","guard":[],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-73cabadb","guard":[],"pyramid":["render.code",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-7ad4f7ca","guard":[["hasAny",["code","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-822306d1","guard":[],"pyramid":["render.code",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-910f2b29","guard":[],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-9a09fcb0","guard":[["hasAny",["code","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-b19a781b","guard":[["hasAny",["code","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.code",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-bd3142e0","guard":[["hasAny",["all caps","capital letters","capitals","code","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.code",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-c001d207","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","element","item number","nth","position","title case"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-c9bcf2c7","guard":[],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-d52ce75e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","code","element","item number","nth","position","title case"]]],"pyramid":["render.code",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-e94b9111","guard":[],"pyramid":["render.code",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-e9674dc9","guard":[],"pyramid":["render.code",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-f7789a62","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 024-003":"The program name whose program code is 024-003 is Under Secretary for Management.","name the program name whose program code is 009-063":"The program name whose program code is 009-063 is AIDS Policy and Budget.","which program name has the program code 015-077":"The program name whose program code is 015-077 is Contribution to the Asian Development Fund (AsDF).","018-007 is the program code of which program name":"The program name whose program code is 018-007 is Special Programs for Migrant Students (CFDA # 84.141, 84.149).","name the program name whose program code is 015-024":"The program name whose program code is 015-024 is Bond Guarantee Program.","which program name has the program code 012-010":"The program name whose program code is 012-010 is Community Service Employment for Older Americans (ETA).","012-009 is the program code of which program name":"The program name whose program code is 012-009 is Job Corps (ETA).","name the program name whose program code is 019-043":"The program name whose program code is 019-043 is International Material Protection and Cooperation.","name the program name whose program code is 029-060":"The program name whose program code is 029-060 is Hospice and Palliative Care.","name the program name whose program code is 018-035":"The program name whose program code is 018-035 is School Leadership (CFDA # 84.363).","012-031 is the program code of which program name":"The program name whose program code is 012-031 is Labor Force Statistics (BLS).","name the program name whose program code is 029-028":"The program name whose program code is 029-028 is Vocational Rehabilitation Loan.","name the program name whose program code is 020-010":"The program name whose program code is 020-010 is Categorical Grant: Environmental Information (State & Tribal Assistance Grants).","name the program name whose program code is 020-088":"The program name whose program code is 020-088 is RCRA: Corrective Action (Environmental Programs & Management, Oil Spill Response).","019-040 is the program code of which program name":"The program name whose program code is 019-040 is Defense Nuclear Security.","018-034 is the program code of which program name":"The program name whose program code is 018-034 is Transition to Teaching (CFDA # 84.350).","name the program name whose program code is 010-093":"The program name whose program code is 010-093 is Ecological Services.","name the program name whose program code is 029-093":"The program name whose program code is 029-093 is Construction – Minor Projects.","name the program name whose program code is 018-105":"The program name whose program code is 018-105 is College Housing and Academic Facilities Loans Program.","name the program name whose program code is 009-030":"The program name whose program code is 009-030 is Birth Defects, Developmental Disabilities, Disabilities and Health.","which program name has the program code 010-042":"The program name whose program code is 010-042 is Workforce and Organizational Support.","name the program name whose program code is 019-027":"The program name whose program code is 019-027 is High Energy Physics.","021-028 is the program code of which program name":"The program name whose program code is 021-028 is Commercial Vehicle Information Systems and Networks Grants.","name the program name whose program code is 029-010":"The program name whose program code is 029-010 is Survivors Pension.","which program name has the program code 014-021":"The program name whose program code is 014-021 is International Fisheries Commission.","name the program name whose program code is 184-014":"The program name whose program code is 184-014 is Pandemic Influenza and Other Emerging Threats (PIOET).","name the program name whose program code is 011-011":"The program name whose program code is 011-011 is Foreign Claims.","name the program name whose program code is 184-031":"The program name whose program code is 184-031 is Economic Opportunity.","name the program name whose program code is 024-002":"The program name whose program code is 024-002 is Office of the Secretary and Executive Management.","which program name has the program code 011-031":"The program name whose program code is 011-031 is U.S. Marshals Service - Construction.","which program name has the program code 018-060":"The program name whose program code is 018-060 is Supported Employment State Grants (CFDA # 84.187).","020-103 is the program code of which program name":"The program name whose program code is 020-103 is Stratospheric Ozone: Domestic Programs (Environmental Programs & Management).","which program name has the program code 015-075":"The program name whose program code is 015-075 is Contribution to the Inter-American Investment Corporation (IIC).","name the program name whose program code is 024-006":"The program name whose program code is 024-006 is Preparedness.","009-059 is the program code of which program name":"The program name whose program code is 009-059 is Human Genome Research.","020-053 is the program code of which program name":"The program name whose program code is 020-053 is Geographic Program: Other (Environmental Programs & Management).","026-004 is the program code of which program name":"The program name whose program code is 026-004 is Earth Science Multi-Mission Operations.","name the program name whose program code is 010-039":"The program name whose program code is 010-039 is Transportation and Facilities Mgmt..","184-028 is the program code of which program name":"The program name whose program code is 184-028 is Infrastructure.","which program name has the program code 009-032":"The program name whose program code is 009-032 is Environmental Health.","184-037 is the program code of which program name":"The program name whose program code is 184-037 is Monitoring and Evaluation.","019-011 is the program code of which program name":"The program name whose program code is 019-011 is Federal Energy Management Program.","007-054 is the program code of which program name":"The program name whose program code is 007-054 is Technology Base.","name the program name whose program code is 023-017":"The program name whose program code is 023-017 is Electronic Government Program.","which program name has the program code 020-111":"The program name whose program code is 020-111 is Superfund: Federal Facilities Enforcement (Superfund.","name the program name whose program code is 006-013":"The program name whose program code is 006-013 is Executive Direction.","024-046 is the program code of which program name":"The program name whose program code is 024-046 is Construction.","which program name has the program code 010-083":"The program name whose program code is 010-083 is Reclamation Water Settlements Fund.","which program name has the program code 029-088":"The program name whose program code is 029-088 is Office of Public and Intergovernmental Affairs.","name the program name whose program code is 009-067":"The program name whose program code is 009-067 is Advancing Translational Sciences Research.","006-021 is the program code of which program name":"The program name whose program code is 006-021 is Bureau of Economic Analysis.","which program name has the program code 029-026":"The program name whose program code is 029-026 is Native American Direct Loan.","which program name has the program code 020-003":"The program name whose program code is 020-003 is Alternative Dispute Resolution (Environmental Programs & Management, Superfund).","011-110 is the program code of which program name":"The program name whose program code is 011-110 is Legal Assistance Program.","name the program name whose program code is 020-105":"The program name whose program code is 020-105 is Superfund: Emergency Response and Removal (Environmental Programs & Management, Superfund, Oil Spill Respond.","006-027 is the program code of which program name":"The program name whose program code is 006-027 is Economic Adjustment Assistance Grants.","which program name has the program code 028-005":"The program name whose program code is 028-005 is Procurement Assistance Program.","which program name has the program code 019-001":"The program name whose program code is 019-001 is Advanced Manufacturing Office (formerly Industrial Technologies).","which program name has the program code 018-017":"The program name whose program code is 018-017 is Education of Homeless Children & Youth (CFDA # 84.196).","which program name has the program code 026-044":"The program name whose program code is 026-044 is STEM Education and Accountability.","name the program name whose program code is 009-048":"The program name whose program code is 009-048 is General Medical Sciences Research.","which program name has the program code 024-028":"The program name whose program code is 024-028 is Cross-cutting Investments.","name the program name whose program code is 011-048":"The program name whose program code is 011-048 is Drug Enforcement Administration, Construction.","name the program name whose program code is 009-077":"The program name whose program code is 009-077 is Health Care Fraud and Abuse Control.","009-016 is the program code of which program name":"The program name whose program code is 009-016 is Ryan White HIV/AIDS Program.","which program name has the program code 024-019":"The program name whose program code is 024-019 is Acquisition and Operations Support.","name the program name whose program code is 018-057":"The program name whose program code is 018-057 is Demonstration and Training Programs (CFDA # 84.235).","which program name has the program code 029-014":"The program name whose program code is 029-014 is National Service Life Insurance.","021-011 is the program code of which program name":"The program name whose program code is 021-011 is General Administrative Expenses.","018-048 is the program code of which program name":"The program name whose program code is 018-048 is Technical Assistance and Dissemination (CFDA # 84.326).","which program name has the program code 018-044":"The program name whose program code is 018-044 is Grants to States (CFDA # 84.027).","name the program name whose program code is 024-025":"The program name whose program code is 024-025 is Intermodal Screening Operations.","009-029 is the program code of which program name":"The program name whose program code is 009-029 is Chronic Disease and Prevention and Health Promotion.","007-003 is the program code of which program name":"The program name whose program code is 007-003 is Strategic Land-Based missile (SLBM).","which program name has the program code 019-052":"The program name whose program code is 019-052 is Legacy Management (LM).","010-003 is the program code of which program name":"The program name whose program code is 010-003 is Human Services.","015-058 is the program code of which program name":"The program name whose program code is 015-058 is Housing Finance Agencies Initiative.","name the program name whose program code is 029-069":"The program name whose program code is 029-069 is Children of Women Vietnam Veterans (CWVV).","name the program name whose program code is 028-013":"The program name whose program code is 028-013 is Small Business Development Centers (SBDC).","012-002 is the program code of which program name":"The program name whose program code is 012-002 is WIA Dislocated Worker (ETA).","which program name has the program code 010-089":"The program name whose program code is 010-089 is Environmental Enforcement.","009-058 is the program code of which program name":"The program name whose program code is 009-058 is Deafness and Other Communication Disorders Research.","which program name has the program code 026-009":"The program name whose program code is 026-009 is Discovery.","name the program name whose program code is 025-000":"The program name whose program code is 025-000 is (Primary Program Not Available).","023-008 is the program code of which program name":"The program name whose program code is 023-008 is Integrated Technology Services Program.","which program name has the program code 009-089":"The program name whose program code is 009-089 is Child Care Development Fund.","which program name has the program code 010-051":"The program name whose program code is 010-051 is Miscellaneous Permanent Payment Accounts.","which program name has the program code 010-139":"The program name whose program code is 010-139 is Operations Grants.","025-025 is the program code of which program name":"The program name whose program code is 025-025 is Housing Counseling Assistance.","020-115 is the program code of which program name":"The program name whose program code is 020-115 is Toxic Substances: Lead Risk Reducation Program (Environmental Programs & Management).","which program name has the program code 023-016":"The program name whose program code is 023-016 is Operating Expense Program.","029-049 is the program code of which program name":"The program name whose program code is 029-049 is Spinal Cord Injury and Disorders (SCI/D) Service.","which program name has the program code 005-043":"The program name whose program code is 005-043 is Census of Agriculture.","which program name has the program code 024-042":"The program name whose program code is 024-042 is Securing America's Borders.","which program name has the program code 009-036":"The program name whose program code is 009-036 is Global Health.","which program name has the program code 184-023":"The program name whose program code is 184-023 is Social Services.","021-025 is the program code of which program name":"The program name whose program code is 021-025 is MCSAP New Entrant Grants.","021-033 is the program code of which program name":"The program name whose program code is 021-033 is State and Community Highway Safety Grants.","name the program name whose program code is 007-035":"The program name whose program code is 007-035 is Fleet Support.","which program name has the program code 006-051":"The program name whose program code is 006-051 is Construction and Major Renovations."}}},
{"id":"n-6e3cafd8","guard":[["hasAny",["appears in","code","contains","element","has","includes","item number","nth","position"]]],"pyramid":["render.yesNo",["compare.contains",["sense.before",{"lit":"name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}]],["render.template",{"lit":["The ",{"slot":0}," name whose program code is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],["render.template",{"lit":["The program ",{"slot":0}," whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-9e3c77da","guard":[],"pyramid":["render.yesNo",["compare.contains",["sense.before",{"lit":"name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}]],["render.template",{"lit":["The ",{"slot":0}," name whose program code is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],["render.template",{"lit":["The program ",{"slot":0}," whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-4395af20","guard":[["hasAny",["element","has","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The program name whose program ",{"slot":0}," is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-65032e5d","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"name"}]]],"mem":{"table":{"has the program code 024-003":"The program name whose program code is 024-003 is Under Secretary for Management.","the program name whose program code is 009-063":"The program name whose program code is 009-063 is AIDS Policy and Budget.","has the program code 015-077":"The program name whose program code is 015-077 is Contribution to the Asian Development Fund (AsDF).","the program name whose program code is 015-024":"The program name whose program code is 015-024 is Bond Guarantee Program.","has the program code 012-010":"The program name whose program code is 012-010 is Community Service Employment for Older Americans (ETA).","the program name whose program code is 019-043":"The program name whose program code is 019-043 is International Material Protection and Cooperation.","the program name whose program code is 029-060":"The program name whose program code is 029-060 is Hospice and Palliative Care.","the program name whose program code is 018-035":"The program name whose program code is 018-035 is School Leadership (CFDA # 84.363).","the program name whose program code is 029-028":"The program name whose program code is 029-028 is Vocational Rehabilitation Loan.","the program name whose program code is 020-010":"The program name whose program code is 020-010 is Categorical Grant: Environmental Information (State & Tribal Assistance Grants).","the program name whose program code is 020-088":"The program name whose program code is 020-088 is RCRA: Corrective Action (Environmental Programs & Management, Oil Spill Response).","the program name whose program code is 010-093":"The program name whose program code is 010-093 is Ecological Services.","the program name whose program code is 029-093":"The program name whose program code is 029-093 is Construction – Minor Projects.","the program name whose program code is 018-105":"The program name whose program code is 018-105 is College Housing and Academic Facilities Loans Program.","the program name whose program code is 009-030":"The program name whose program code is 009-030 is Birth Defects, Developmental Disabilities, Disabilities and Health.","has the program code 010-042":"The program name whose program code is 010-042 is Workforce and Organizational Support.","the program name whose program code is 019-027":"The program name whose program code is 019-027 is High Energy Physics.","the program name whose program code is 029-010":"The program name whose program code is 029-010 is Survivors Pension.","has the program code 014-021":"The program name whose program code is 014-021 is International Fisheries Commission.","the program name whose program code is 184-014":"The program name whose program code is 184-014 is Pandemic Influenza and Other Emerging Threats (PIOET).","the program name whose program code is 011-011":"The program name whose program code is 011-011 is Foreign Claims.","the program name whose program code is 184-031":"The program name whose program code is 184-031 is Economic Opportunity.","the program name whose program code is 024-002":"The program name whose program code is 024-002 is Office of the Secretary and Executive Management.","has the program code 011-031":"The program name whose program code is 011-031 is U.S. Marshals Service - Construction.","has the program code 018-060":"The program name whose program code is 018-060 is Supported Employment State Grants (CFDA # 84.187).","has the program code 015-075":"The program name whose program code is 015-075 is Contribution to the Inter-American Investment Corporation (IIC).","the program name whose program code is 024-006":"The program name whose program code is 024-006 is Preparedness.","the program name whose program code is 010-039":"The program name whose program code is 010-039 is Transportation and Facilities Mgmt..","has the program code 009-032":"The program name whose program code is 009-032 is Environmental Health.","the program name whose program code is 023-017":"The program name whose program code is 023-017 is Electronic Government Program.","has the program code 020-111":"The program name whose program code is 020-111 is Superfund: Federal Facilities Enforcement (Superfund.","the program name whose program code is 006-013":"The program name whose program code is 006-013 is Executive Direction.","has the program code 010-083":"The program name whose program code is 010-083 is Reclamation Water Settlements Fund.","has the program code 029-088":"The program name whose program code is 029-088 is Office of Public and Intergovernmental Affairs.","the program name whose program code is 009-067":"The program name whose program code is 009-067 is Advancing Translational Sciences Research.","has the program code 029-026":"The program name whose program code is 029-026 is Native American Direct Loan.","has the program code 020-003":"The program name whose program code is 020-003 is Alternative Dispute Resolution (Environmental Programs & Management, Superfund).","the program name whose program code is 020-105":"The program name whose program code is 020-105 is Superfund: Emergency Response and Removal (Environmental Programs & Management, Superfund, Oil Spill Respond.","has the program code 028-005":"The program name whose program code is 028-005 is Procurement Assistance Program.","has the program code 019-001":"The program name whose program code is 019-001 is Advanced Manufacturing Office (formerly Industrial Technologies).","has the program code 018-017":"The program name whose program code is 018-017 is Education of Homeless Children & Youth (CFDA # 84.196).","has the program code 026-044":"The program name whose program code is 026-044 is STEM Education and Accountability.","the program name whose program code is 009-048":"The program name whose program code is 009-048 is General Medical Sciences Research.","has the program code 024-028":"The program name whose program code is 024-028 is Cross-cutting Investments.","the program name whose program code is 011-048":"The program name whose program code is 011-048 is Drug Enforcement Administration, Construction.","the program name whose program code is 009-077":"The program name whose program code is 009-077 is Health Care Fraud and Abuse Control.","has the program code 024-019":"The program name whose program code is 024-019 is Acquisition and Operations Support.","the program name whose program code is 018-057":"The program name whose program code is 018-057 is Demonstration and Training Programs (CFDA # 84.235).","has the program code 029-014":"The program name whose program code is 029-014 is National Service Life Insurance.","has the program code 018-044":"The program name whose program code is 018-044 is Grants to States (CFDA # 84.027).","the program name whose program code is 024-025":"The program name whose program code is 024-025 is Intermodal Screening Operations.","has the program code 019-052":"The program name whose program code is 019-052 is Legacy Management (LM).","the program name whose program code is 029-069":"The program name whose program code is 029-069 is Children of Women Vietnam Veterans (CWVV).","the program name whose program code is 028-013":"The program name whose program code is 028-013 is Small Business Development Centers (SBDC).","has the program code 010-089":"The program name whose program code is 010-089 is Environmental Enforcement.","has the program code 026-009":"The program name whose program code is 026-009 is Discovery.","the program name whose program code is 025-000":"The program name whose program code is 025-000 is (Primary Program Not Available).","has the program code 009-089":"The program name whose program code is 009-089 is Child Care Development Fund.","has the program code 010-051":"The program name whose program code is 010-051 is Miscellaneous Permanent Payment Accounts.","has the program code 010-139":"The program name whose program code is 010-139 is Operations Grants.","has the program code 023-016":"The program name whose program code is 023-016 is Operating Expense Program.","has the program code 005-043":"The program name whose program code is 005-043 is Census of Agriculture.","has the program code 024-042":"The program name whose program code is 024-042 is Securing America's Borders.","has the program code 009-036":"The program name whose program code is 009-036 is Global Health.","has the program code 184-023":"The program name whose program code is 184-023 is Social Services.","the program name whose program code is 007-035":"The program name whose program code is 007-035 is Fleet Support.","has the program code 006-051":"The program name whose program code is 006-051 is Construction and Major Renovations."}}},
{"id":"n-9e020c45","guard":[["hasAny",["element","is","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name whose program code is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-9f5d5b9c","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The program ",{"slot":0}," whose program code is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-18c03142","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The program ",{"slot":0}," whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-31e1a76a","guard":[["hasAny",["dashes","element","has","hyphens","item number","kebab case","kebabcase","nth","position","slug"]]],"pyramid":["render.template",{"lit":["The program ",{"slot":0}," whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.kebab",["sense.after",{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-bf129a10","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The program ",{"slot":0}," whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-e9208bd9","guard":[["hasAny",["element","has","item number","nth","position","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.template",{"lit":["The program ",{"slot":0}," whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.reverseWords",["sense.after",{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-fb29be03","guard":[["hasAny",["element","has","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The program ",{"slot":0}," whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.noVowels",["sense.after",{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-2dfa7085","guard":[["hasAny",["class name","element","has","item number","nth","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.template",{"lit":["The program ",{"slot":0}," whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-59aee84a","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The program ",{"slot":0}," whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-631f0ad3","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The program ",{"slot":0}," whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-9dedce48","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The program ",{"slot":0}," whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-948a1bd1","guard":[["hasAny",["element","has","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The program ",{"slot":0}," whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-bcaf07f9","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The program ",{"slot":0}," whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-4224cfef","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-500b975d","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-54e994b6","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," code is ",{"slot":3}," is ",{"slot":4},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-c21a580f","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-e3286a37","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The program ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-1a0fffbe","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-2dcf45cf","guard":[["hasAny",["element","has","item number","nth","position","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.reverseWords",["sense.after",{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-45f39baa","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["sense.wordAt",{"lit":2}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-8c75be99","guard":[["hasAny",["element","has","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.noVowels",["sense.after",{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-a59cc750","guard":[["hasAny",["dashes","element","has","hyphens","item number","kebab case","kebabcase","nth","position","slug"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.kebab",["sense.after",{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-1455c2f8","guard":[["hasAny",["class name","element","has","item number","nth","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.pascal",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-502e4764","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-7996557c","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-8acf83eb","guard":[["hasAny",["class name","element","has","item number","nth","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["sense.wordAt",{"lit":2}],["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-ab2a2439","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-e856e01f","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.words"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-58a0216e","guard":[["hasAny",["class name","element","has","item number","nth","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.pascal",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-6d0653b8","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-9c10266b","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],["sense.howMany"]],["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-c657434f","guard":[["hasAny",["element","has","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-d3aaf1bb","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-f64e2a49","guard":[["hasAny",["element","item number","nth","of","position"]]],"pyramid":["render.template",{"lit":["The program ",{"slot":0}," whose program code is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-16c7ea84","guard":[["hasAny",["element","item number","nth","of","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["sense.before",{"lit":"is"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-02985e0a","guard":[["hasAny",["dashes","element","hyphens","item number","kebab case","kebabcase","nth","of","position","slug"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.kebab",["sense.before",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-1b9303fd","guard":[["hasAny",["element","item number","nth","of","position","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.reverseWords",["sense.before",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-33b3bd26","guard":[["hasAny",["element","item number","no vowels","nth","of","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.noVowels",["sense.before",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-5b5d6ca6","guard":[["hasAny",["element","item number","nth","of","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-9d2a4b32","guard":[["hasAny",["element","item number","nth","of","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["render.and",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-bad1a612","guard":[["hasAny",["element","item number","nth","of","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-c1edf544","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"is"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-3a2e8807","guard":[["hasAny",["dashes","element","hyphens","item number","kebab case","kebabcase","nth","position","slug","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.kebab",["sense.after",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-43228376","guard":[["hasAny",["element","item number","no vowels","nth","position","remove vowels","whose","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.noVowels",["sense.after",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-78210721","guard":[["hasAny",["element","item number","nth","position","reverse the words","reverse word order","whose","words backwards"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.reverseWords",["sense.after",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-7b8e5e30","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-a5dc9c99","guard":[["hasAny",["element","item number","nth","of","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-c249eab9","guard":[["hasAny",["element","invert case","item number","nth","of","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.swapCase",["sense.lastWord"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-c7f8012a","guard":[["hasAny",["element","item number","lower case","lowercase","nth","of","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-f5f1f1ac","guard":[["hasAny",["class name","element","item number","nth","of","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.pascal",["sense.lastWord"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-0f0f76e2","guard":[["hasAny",["each word","element","item number","nth","of","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["transform.words",["sense.lastWord"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-1e46a162","guard":[["hasAny",["delete","element","item number","nth","of","position","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.remove",["sense.lastWord"],["sense.numeral"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-30c182d5","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The program ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-3384f375","guard":[["hasAny",["class name","element","item number","nth","pascal case","pascalcase","position","upper camel case","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-4e1b2a47","guard":[["hasAny",["element","item number","nth","of","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-5f1b91f0","guard":[["hasAny",["each word","element","item number","nth","of","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.and",["transform.words",["sense.lastWord"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-9a5e623f","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-c45cbdc4","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-ca25d460","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-f82e5c2a","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-1bf58c20","guard":[["hasAny",["delete","element","item number","nth","of","position","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-3311d9dd","guard":[["hasAny",["element","item number","nth","of","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-55530f55","guard":[["hasAny",["element","item number","nth","of","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-56aaa296","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.before",{"lit":"is"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-63c67ce6","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-a5882ba9","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name whose program ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-db518bc7","guard":[["hasAny",["element","item number","nth","of","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," code is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-43239350","guard":[["hasAny",["element","item number","no vowels","nth","of","position","remove vowels","shortest","shortest one","shortest word","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.noVowels",["sense.before",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-5a20665e","guard":[["hasAny",["element","item number","nth","of","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program code is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-5c0662cf","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-89bd341a","guard":[["hasAny",["dashes","element","hyphens","item number","kebab case","kebabcase","nth","of","position","shortest","shortest one","shortest word","slug"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.kebab",["sense.before",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-8bbd1efe","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The program ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-ad24e1b0","guard":[["hasAny",["element","item number","nth","of","position","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.reverseWords",["sense.before",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-b5224e5c","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," code is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-c6e97bae","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-10e3d8a0","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-1977736a","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"is"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-484cfed2","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose program ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-6971b5a8","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-6d9aaddb","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.and",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-f6dcb7af","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.nthStr",["sense.content"],["sense.howMany"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-1eede1f3","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-3bb337e6","guard":[["hasAny",["element","item number","lower case","lowercase","nth","of","position","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-441b6357","guard":[["hasAny",["element","item number","nth","position","reverse the words","reverse word order","whose","words backwards"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.reverseWords",["sense.after",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-91570721","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.wordAt",{"lit":1}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-92972d90","guard":[["hasAny",["element","item number","nth","of","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-a0410592","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-c02ed025","guard":[["hasAny",["element","item number","no vowels","nth","position","remove vowels","whose","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.noVowels",["sense.after",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-d2f9e20e","guard":[["hasAny",["class name","element","item number","nth","of","pascal case","pascalcase","position","shortest","shortest one","shortest word","upper camel case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.pascal",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-d59e2b85","guard":[["hasAny",["element","invert case","item number","nth","of","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-dd61cb11","guard":[["hasAny",["dashes","element","hyphens","item number","kebab case","kebabcase","nth","position","slug","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.kebab",["sense.after",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-eca85607","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-138fb384","guard":[["hasAny",["each word","element","item number","nth","of","position","shortest","shortest one","shortest word","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-2e9aea2c","guard":[["hasAny",["delete","element","item number","nth","of","position","remove","shortest","shortest one","shortest word","strip out","without"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.remove",["sense.lastWord"],["sense.numeral"]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-3647e88d","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-71aab29b","guard":[["hasAny",["class name","element","item number","nth","pascal case","pascalcase","position","upper camel case","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.pascal",["sense.wordAt",{"lit":1}]],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-7abaa485","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-a3ab7a1c","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.words"],{"lit":1}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-cabea773","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-cee49cca","guard":[["hasAny",["class name","element","item number","nth","pascal case","pascalcase","position","upper camel case","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":1}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-cf7355f3","guard":[["hasAny",["each word","element","item number","nth","of","position","shortest","shortest one","shortest word","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-eeb52660","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-f88f9abe","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.words"],{"lit":4}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-192eabc5","guard":[["hasAny",["delete","element","item number","nth","of","position","remove","shortest","shortest one","shortest word","strip out","without"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-2f30c583","guard":[["hasAny",["class name","element","item number","nth","pascal case","pascalcase","position","upper camel case","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-64f6e41f","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-7faea79f","guard":[["hasAny",["element","item number","nth","of","position","separate by","shortest","shortest one","shortest word","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.and",["transform.split",["sense.lastWord"],["sense.numeral"]]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-ce40459d","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-d234d490","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]]],"mem":null},
{"id":"n-d689bad8","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-e46ebb08","guard":[["hasAny",["element","item number","nth","of","position","separate by","shortest","shortest one","shortest word","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["transform.split",["sense.lastWord"],["sense.numeral"]]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-8a4c703b","guard":[["hasAny",["element","item number","nth","of","position","separate by","shortest","shortest one","shortest word","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," ",{"slot":3}," is ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"}],{"lit":1}],{"lit":"fr-tidytuesday-fpi-codes-a6058b"},{"lit":"program code"},{"lit":"program name"}]],"mem":null},
{"id":"n-55fce8d7","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"of"}]]],"mem":{"table":{"018-007 is the program code":"The program name whose program code is 018-007 is Special Programs for Migrant Students (CFDA # 84.141, 84.149).","012-009 is the program code":"The program name whose program code is 012-009 is Job Corps (ETA).","012-031 is the program code":"The program name whose program code is 012-031 is Labor Force Statistics (BLS).","019-040 is the program code":"The program name whose program code is 019-040 is Defense Nuclear Security.","018-034 is the program code":"The program name whose program code is 018-034 is Transition to Teaching (CFDA # 84.350).","021-028 is the program code":"The program name whose program code is 021-028 is Commercial Vehicle Information Systems and Networks Grants.","020-103 is the program code":"The program name whose program code is 020-103 is Stratospheric Ozone: Domestic Programs (Environmental Programs & Management).","009-059 is the program code":"The program name whose program code is 009-059 is Human Genome Research.","020-053 is the program code":"The program name whose program code is 020-053 is Geographic Program: Other (Environmental Programs & Management).","026-004 is the program code":"The program name whose program code is 026-004 is Earth Science Multi-Mission Operations.","184-028 is the program code":"The program name whose program code is 184-028 is Infrastructure.","184-037 is the program code":"The program name whose program code is 184-037 is Monitoring and Evaluation.","019-011 is the program code":"The program name whose program code is 019-011 is Federal Energy Management Program.","007-054 is the program code":"The program name whose program code is 007-054 is Technology Base.","024-046 is the program code":"The program name whose program code is 024-046 is Construction.","006-021 is the program code":"The program name whose program code is 006-021 is Bureau of Economic Analysis.","011-110 is the program code":"The program name whose program code is 011-110 is Legal Assistance Program.","006-027 is the program code":"The program name whose program code is 006-027 is Economic Adjustment Assistance Grants.","009-016 is the program code":"The program name whose program code is 009-016 is Ryan White HIV/AIDS Program.","021-011 is the program code":"The program name whose program code is 021-011 is General Administrative Expenses.","018-048 is the program code":"The program name whose program code is 018-048 is Technical Assistance and Dissemination (CFDA # 84.326).","009-029 is the program code":"The program name whose program code is 009-029 is Chronic Disease and Prevention and Health Promotion.","007-003 is the program code":"The program name whose program code is 007-003 is Strategic Land-Based missile (SLBM).","010-003 is the program code":"The program name whose program code is 010-003 is Human Services.","015-058 is the program code":"The program name whose program code is 015-058 is Housing Finance Agencies Initiative.","012-002 is the program code":"The program name whose program code is 012-002 is WIA Dislocated Worker (ETA).","009-058 is the program code":"The program name whose program code is 009-058 is Deafness and Other Communication Disorders Research.","023-008 is the program code":"The program name whose program code is 023-008 is Integrated Technology Services Program.","025-025 is the program code":"The program name whose program code is 025-025 is Housing Counseling Assistance.","020-115 is the program code":"The program name whose program code is 020-115 is Toxic Substances: Lead Risk Reducation Program (Environmental Programs & Management).","029-049 is the program code":"The program name whose program code is 029-049 is Spinal Cord Injury and Disorders (SCI/D) Service.","021-025 is the program code":"The program name whose program code is 021-025 is MCSAP New Entrant Grants.","021-033 is the program code":"The program name whose program code is 021-033 is State and Community Highway Safety Grants."}}},
{"id":"n-0358291f","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 009-063":"The program name whose program code is 009-063 is AIDS Policy and Budget."}}},
{"id":"n-03dc8533","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"026-004 is the program code of which program name":"The program name whose program code is 026-004 is Earth Science Multi-Mission Operations."}}},
{"id":"n-0446d2ef","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 024-028":"The program name whose program code is 024-028 is Cross-cutting Investments."}}},
{"id":"n-04b74132","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 020-003":"The program name whose program code is 020-003 is Alternative Dispute Resolution (Environmental Programs & Management, Superfund)."}}},
{"id":"n-04e0aa46","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"021-025 is the program code of which program name":"The program name whose program code is 021-025 is MCSAP New Entrant Grants."}}},
{"id":"n-04fa83ef","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"012-031 is the program code of which program name":"The program name whose program code is 012-031 is Labor Force Statistics (BLS)."}}},
{"id":"n-05454276","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 029-069":"The program name whose program code is 029-069 is Children of Women Vietnam Veterans (CWVV)."}}},
{"id":"n-05aa0acc","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 024-025":"The program name whose program code is 024-025 is Intermodal Screening Operations."}}},
{"id":"n-05dbcf33","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"009-016 is the program code of which program name":"The program name whose program code is 009-016 is Ryan White HIV/AIDS Program."}}},
{"id":"n-06234a9e","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 029-093":"The program name whose program code is 029-093 is Construction – Minor Projects."}}},
{"id":"n-0a7435f6","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 026-044":"The program name whose program code is 026-044 is STEM Education and Accountability."}}},
{"id":"n-0b7848ad","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 018-057":"The program name whose program code is 018-057 is Demonstration and Training Programs (CFDA # 84.235)."}}},
{"id":"n-0ca4eb1f","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 024-006":"The program name whose program code is 024-006 is Preparedness."}}},
{"id":"n-0e42aa2f","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 012-010":"The program name whose program code is 012-010 is Community Service Employment for Older Americans (ETA)."}}},
{"id":"n-10499ba7","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 018-035":"The program name whose program code is 018-035 is School Leadership (CFDA # 84.363)."}}},
{"id":"n-11284e0e","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"019-040 is the program code of which program name":"The program name whose program code is 019-040 is Defense Nuclear Security."}}},
{"id":"n-14cf5427","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 018-017":"The program name whose program code is 018-017 is Education of Homeless Children & Youth (CFDA # 84.196)."}}},
{"id":"n-1f3be988","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 020-111":"The program name whose program code is 020-111 is Superfund: Federal Facilities Enforcement (Superfund."}}},
{"id":"n-20699248","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 184-014":"The program name whose program code is 184-014 is Pandemic Influenza and Other Emerging Threats (PIOET)."}}},
{"id":"n-207f90e1","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"023-008 is the program code of which program name":"The program name whose program code is 023-008 is Integrated Technology Services Program."}}},
{"id":"n-29abcd80","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 019-027":"The program name whose program code is 019-027 is High Energy Physics."}}},
{"id":"n-2ce23dfe","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"184-037 is the program code of which program name":"The program name whose program code is 184-037 is Monitoring and Evaluation."}}},
{"id":"n-2fb8cf61","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"007-054 is the program code of which program name":"The program name whose program code is 007-054 is Technology Base."}}},
{"id":"n-30db0ee6","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 184-031":"The program name whose program code is 184-031 is Economic Opportunity."}}},
{"id":"n-3cd1c6b0","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 020-105":"The program name whose program code is 020-105 is Superfund: Emergency Response and Removal (Environmental Programs & Management, Superfund, Oil Spill Respond."}}},
{"id":"n-3f498d98","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 024-002":"The program name whose program code is 024-002 is Office of the Secretary and Executive Management."}}},
{"id":"n-3f8a6ea2","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"021-011 is the program code of which program name":"The program name whose program code is 021-011 is General Administrative Expenses."}}},
{"id":"n-432e7a60","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"012-009 is the program code of which program name":"The program name whose program code is 012-009 is Job Corps (ETA)."}}},
{"id":"n-43638fb6","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 015-024":"The program name whose program code is 015-024 is Bond Guarantee Program."}}},
{"id":"n-4a4bae15","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"020-115 is the program code of which program name":"The program name whose program code is 020-115 is Toxic Substances: Lead Risk Reducation Program (Environmental Programs & Management)."}}},
{"id":"n-4e7f7fee","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 005-043":"The program name whose program code is 005-043 is Census of Agriculture."}}},
{"id":"n-4ed9e16d","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 024-003":"The program name whose program code is 024-003 is Under Secretary for Management."}}},
{"id":"n-527dc80d","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 029-026":"The program name whose program code is 029-026 is Native American Direct Loan."}}},
{"id":"n-5328ddba","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 006-051":"The program name whose program code is 006-051 is Construction and Major Renovations."}}},
{"id":"n-542c6f97","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 015-075":"The program name whose program code is 015-075 is Contribution to the Inter-American Investment Corporation (IIC)."}}},
{"id":"n-566751e5","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 029-014":"The program name whose program code is 029-014 is National Service Life Insurance."}}},
{"id":"n-5c4d7f53","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 028-005":"The program name whose program code is 028-005 is Procurement Assistance Program."}}},
{"id":"n-5d808b63","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"019-011 is the program code of which program name":"The program name whose program code is 019-011 is Federal Energy Management Program."}}},
{"id":"n-5dd4fb67","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 010-042":"The program name whose program code is 010-042 is Workforce and Organizational Support."}}},
{"id":"n-5e2bf43d","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 010-093":"The program name whose program code is 010-093 is Ecological Services."}}},
{"id":"n-5f756757","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 009-030":"The program name whose program code is 009-030 is Birth Defects, Developmental Disabilities, Disabilities and Health."}}},
{"id":"n-674d522d","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 024-042":"The program name whose program code is 024-042 is Securing America's Borders."}}},
{"id":"n-6a9bcf47","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 184-023":"The program name whose program code is 184-023 is Social Services."}}},
{"id":"n-6d85b1b1","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 006-013":"The program name whose program code is 006-013 is Executive Direction."}}},
{"id":"n-732f67a5","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 023-017":"The program name whose program code is 023-017 is Electronic Government Program."}}},
{"id":"n-777f636c","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"029-049 is the program code of which program name":"The program name whose program code is 029-049 is Spinal Cord Injury and Disorders (SCI/D) Service."}}},
{"id":"n-7b9e73ec","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"018-048 is the program code of which program name":"The program name whose program code is 018-048 is Technical Assistance and Dissemination (CFDA # 84.326)."}}},
{"id":"n-7c944911","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 014-021":"The program name whose program code is 014-021 is International Fisheries Commission."}}},
{"id":"n-7cdefb26","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 009-036":"The program name whose program code is 009-036 is Global Health."}}},
{"id":"n-8067afc1","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 018-044":"The program name whose program code is 018-044 is Grants to States (CFDA # 84.027)."}}},
{"id":"n-86a0df43","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 019-043":"The program name whose program code is 019-043 is International Material Protection and Cooperation."}}},
{"id":"n-87ec68cd","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 029-010":"The program name whose program code is 029-010 is Survivors Pension."}}},
{"id":"n-897a8ccc","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"020-053 is the program code of which program name":"The program name whose program code is 020-053 is Geographic Program: Other (Environmental Programs & Management)."}}},
{"id":"n-8c5d6c52","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 015-077":"The program name whose program code is 015-077 is Contribution to the Asian Development Fund (AsDF)."}}},
{"id":"n-8c81ef7a","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 029-028":"The program name whose program code is 029-028 is Vocational Rehabilitation Loan."}}},
{"id":"n-8e0933a2","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 010-039":"The program name whose program code is 010-039 is Transportation and Facilities Mgmt.."}}},
{"id":"n-91116b5d","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 009-089":"The program name whose program code is 009-089 is Child Care Development Fund."}}},
{"id":"n-9211e48f","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 018-060":"The program name whose program code is 018-060 is Supported Employment State Grants (CFDA # 84.187)."}}},
{"id":"n-93aaae94","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 023-016":"The program name whose program code is 023-016 is Operating Expense Program."}}},
{"id":"n-9588c2b0","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"009-029 is the program code of which program name":"The program name whose program code is 009-029 is Chronic Disease and Prevention and Health Promotion."}}},
{"id":"n-99a2f4c1","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"006-021 is the program code of which program name":"The program name whose program code is 006-021 is Bureau of Economic Analysis."}}},
{"id":"n-9bb9892d","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"010-003 is the program code of which program name":"The program name whose program code is 010-003 is Human Services."}}},
{"id":"n-9cb67247","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 011-011":"The program name whose program code is 011-011 is Foreign Claims."}}},
{"id":"n-a0195c7a","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"021-028 is the program code of which program name":"The program name whose program code is 021-028 is Commercial Vehicle Information Systems and Networks Grants."}}},
{"id":"n-a1c260ae","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 010-089":"The program name whose program code is 010-089 is Environmental Enforcement."}}},
{"id":"n-a1ede614","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 029-088":"The program name whose program code is 029-088 is Office of Public and Intergovernmental Affairs."}}},
{"id":"n-a9d29cff","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 019-052":"The program name whose program code is 019-052 is Legacy Management (LM)."}}},
{"id":"n-aa8f231f","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"018-007 is the program code of which program name":"The program name whose program code is 018-007 is Special Programs for Migrant Students (CFDA # 84.141, 84.149)."}}},
{"id":"n-ad95c02a","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 020-010":"The program name whose program code is 020-010 is Categorical Grant: Environmental Information (State & Tribal Assistance Grants)."}}},
{"id":"n-af3da604","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 028-013":"The program name whose program code is 028-013 is Small Business Development Centers (SBDC)."}}},
{"id":"n-b0ed58f6","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"025-025 is the program code of which program name":"The program name whose program code is 025-025 is Housing Counseling Assistance."}}},
{"id":"n-b6593251","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"020-103 is the program code of which program name":"The program name whose program code is 020-103 is Stratospheric Ozone: Domestic Programs (Environmental Programs & Management)."}}},
{"id":"n-b84a434d","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 010-051":"The program name whose program code is 010-051 is Miscellaneous Permanent Payment Accounts."}}},
{"id":"n-b8582735","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 019-001":"The program name whose program code is 019-001 is Advanced Manufacturing Office (formerly Industrial Technologies)."}}},
{"id":"n-b94d5dfa","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 009-032":"The program name whose program code is 009-032 is Environmental Health."}}},
{"id":"n-b9ab6026","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"184-028 is the program code of which program name":"The program name whose program code is 184-028 is Infrastructure."}}},
{"id":"n-bf395df5","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 009-077":"The program name whose program code is 009-077 is Health Care Fraud and Abuse Control."}}},
{"id":"n-bf85be51","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"007-003 is the program code of which program name":"The program name whose program code is 007-003 is Strategic Land-Based missile (SLBM)."}}},
{"id":"n-c03054c5","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 009-067":"The program name whose program code is 009-067 is Advancing Translational Sciences Research."}}},
{"id":"n-c08dfd31","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"021-033 is the program code of which program name":"The program name whose program code is 021-033 is State and Community Highway Safety Grants."}}},
{"id":"n-c438f2a8","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 007-035":"The program name whose program code is 007-035 is Fleet Support."}}},
{"id":"n-c4f30cf1","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 010-083":"The program name whose program code is 010-083 is Reclamation Water Settlements Fund."}}},
{"id":"n-c7e13818","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"006-027 is the program code of which program name":"The program name whose program code is 006-027 is Economic Adjustment Assistance Grants."}}},
{"id":"n-ca39e20c","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 029-060":"The program name whose program code is 029-060 is Hospice and Palliative Care."}}},
{"id":"n-cb27a263","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"018-034 is the program code of which program name":"The program name whose program code is 018-034 is Transition to Teaching (CFDA # 84.350)."}}},
{"id":"n-cb72a702","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 025-000":"The program name whose program code is 025-000 is (Primary Program Not Available)."}}},
{"id":"n-cd047893","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"015-058 is the program code of which program name":"The program name whose program code is 015-058 is Housing Finance Agencies Initiative."}}},
{"id":"n-cd9ea01e","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"011-110 is the program code of which program name":"The program name whose program code is 011-110 is Legal Assistance Program."}}},
{"id":"n-d4ed7496","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 024-019":"The program name whose program code is 024-019 is Acquisition and Operations Support."}}},
{"id":"n-d7d25a2f","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 009-048":"The program name whose program code is 009-048 is General Medical Sciences Research."}}},
{"id":"n-dcf57ba1","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"012-002 is the program code of which program name":"The program name whose program code is 012-002 is WIA Dislocated Worker (ETA)."}}},
{"id":"n-e096c1fa","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"009-059 is the program code of which program name":"The program name whose program code is 009-059 is Human Genome Research."}}},
{"id":"n-efc73360","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 010-139":"The program name whose program code is 010-139 is Operations Grants."}}},
{"id":"n-f3d7a2a8","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"009-058 is the program code of which program name":"The program name whose program code is 009-058 is Deafness and Other Communication Disorders Research."}}},
{"id":"n-f587cba5","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 026-009":"The program name whose program code is 026-009 is Discovery."}}},
{"id":"n-f7078499","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 020-088":"The program name whose program code is 020-088 is RCRA: Corrective Action (Environmental Programs & Management, Oil Spill Response)."}}},
{"id":"n-f80f089b","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 011-048":"The program name whose program code is 011-048 is Drug Enforcement Administration, Construction."}}},
{"id":"n-fab7d0a7","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"024-046 is the program code of which program name":"The program name whose program code is 024-046 is Construction."}}},
{"id":"n-fd1f728a","guard":[["hasAny",["code","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the program name whose program code is 018-105":"The program name whose program code is 018-105 is College Housing and Academic Facilities Loans Program."}}},
{"id":"n-ffe7e9b5","guard":[["hasAny",["code","has","name","program"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which program name has the program code 011-031":"The program name whose program code is 011-031 is U.S. Marshals Service - Construction."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which program name has the program code 024-003","expect":{"contains":["Under Secretary for Management"],"notRefusal":true}},{"q":"name the program name whose program code is 009-063","expect":{"contains":["AIDS Policy and Budget"],"notRefusal":true}},{"q":"which program name has the program code 015-077","expect":{"contains":["Contribution to the Asian Development Fund (AsDF)"],"notRefusal":true}},{"q":"018-007 is the program code of which program name","expect":{"contains":["Special Programs for Migrant Students (CFDA # 84.141, 84.149)"],"notRefusal":true}},{"q":"name the program name whose program code is 015-024","expect":{"contains":["Bond Guarantee Program"],"notRefusal":true}},{"q":"which program name has the program code 012-010","expect":{"contains":["Community Service Employment for Older Americans (ETA)"],"notRefusal":true}},{"q":"012-009 is the program code of which program name","expect":{"contains":["Job Corps (ETA)"],"notRefusal":true}},{"q":"name the program name whose program code is 019-043","expect":{"contains":["International Material Protection and Cooperation"],"notRefusal":true}},{"q":"name the program name whose program code is 029-060","expect":{"contains":["Hospice and Palliative Care"],"notRefusal":true}},{"q":"name the program name whose program code is 018-035","expect":{"contains":["School Leadership (CFDA # 84.363)"],"notRefusal":true}},{"q":"012-031 is the program code of which program name","expect":{"contains":["Labor Force Statistics (BLS)"],"notRefusal":true}},{"q":"name the program name whose program code is 029-028","expect":{"contains":["Vocational Rehabilitation Loan"],"notRefusal":true}},{"q":"name the program name whose program code is 020-010","expect":{"contains":["Categorical Grant: Environmental Information (State & Tribal Assistance Grants)"],"notRefusal":true}},{"q":"name the program name whose program code is 020-088","expect":{"contains":["RCRA: Corrective Action (Environmental Programs & Management, Oil Spill Response)"],"notRefusal":true}},{"q":"019-040 is the program code of which program name","expect":{"contains":["Defense Nuclear Security"],"notRefusal":true}},{"q":"018-034 is the program code of which program name","expect":{"contains":["Transition to Teaching (CFDA # 84.350)"],"notRefusal":true}},{"q":"name the program name whose program code is 010-093","expect":{"contains":["Ecological Services"],"notRefusal":true}},{"q":"name the program name whose program code is 029-093","expect":{"contains":["Construction – Minor Projects"],"notRefusal":true}},{"q":"name the program name whose program code is 018-105","expect":{"contains":["College Housing and Academic Facilities Loans Program"],"notRefusal":true}},{"q":"name the program name whose program code is 009-030","expect":{"contains":["Birth Defects, Developmental Disabilities, Disabilities and Health"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
