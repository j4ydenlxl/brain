// air-date-of-title-fbf4-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"air-date-of-title-fbf4-neo-g10","class":"air-date-of-title-fbf4","generation":10,"lane":"neo","grownFrom":["tell me the air date of the title Cold War","what is the air date of Once More Unto the Breach","give the air date for Stalked","what is the air date of First Blood","give the air date for The Weasel","what is the air date of After the Rescue","give the air date for The Gamble","give the air date for Storm Rising","tell me the air date of the title Winter's Grasp","tell me the air date of the title The Kill","give the air date for The Beaver","what is the air date of Fire and Ice","give the air date for Snared","tell me the air date of the title The Ice Cometh","tell me the air date of the title Of Wolf and Man","tell me the air date of the title The Wolves","give the air date for Gut Feeling","what is the air date of Thicker Than Water","tell me the air date of the title Out Cold","what is the air date of The Musk Ox"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-episodes-025e62","columns":["title","air date"],"n":98,"cols":[{"s":"And So It Begins|Of Wolf and Man|The Talons of Fear|Stalked|Winds of Hell|Rain of Terror|The Hunger|After the Rescue|The Freeze|Brokedown Palace|Triumph|Once More Unto the Breach|The Knife's Edge|The Beasts of the Night|Hunger's Grip|Storm Rising|Adrift|Trial By Fire|The Ascent|The Madness|The Gamble|Winter's Fury|Into the Abyss|The End Game|A New Land|First Blood|Eternal Darkness|Outfoxed|The Lone Wolf|Along Came a Spider|Hungry Beasts|Of Feast & Famine|The Point of No Return|Day 87|Divide and Conquer|Hell on Earth|Margin of Error|The Last Mile|Double or Nothing|Thicker Than Water|Hooked|Flare-Up|My Brother's Keeper|Flesh and Blood|Redemption|The Haunting|The Serpent|Mongolia's Wrath|The Bowels Of Hell|Of Mice And Men|Desperate Measures|Slayer II|Starvation's Shadow|Cold War|Icebreaker|Tainted|Up In Flames|The Moose|The Kill|Ablaze|Night Raider|Out Cold|The Ice Cometh|Thin Ice|Fire and Ice|Million Dollar Mistake|The Rock House|That Was No Bunny|The Fly|The Rock|The Musk Ox|Snared|Up In Smoke|The Wolves|Pins and Needles|Over the Edge|The Hunted|Open Season|Chewed Up|Far From Home|The Buck|Smoked|Surrounded|The Grizzly|The Troll|All In|The Reckoning|Drop Shock|Consequences|The Law of the Land|The Beaver|The Land Giveth…|The Weasel|The Birds|Gut Feeling|The Ice Up|Winter's Grasp|Fight, Flight or Freeze","sep":"|"},{"f":"02015-06-18|825|67-02|99|816|823|830|68-05|96|813|820|36-04-21|98|65-05|812|99|826|66-09|816|823|830|67-07|814|a|512-08|815|822|99|37-01-05|812|99|826|62-02|99|66-15|822|99|67-06|813|820|97|68-03|810|97|38-06-14|821|98|67-05|812|99|826|68-02|99|816|39-06-06|813|820|97|67-11|98|825|68-01|98|815|822|220-06-11|98|825|67-02|99|816|823|830|68-06|813|820|31-06-03|810|97|824|67-01|98|815|822|68-05|812|99|32-05-26|66-02|99|816|823|830|67-07|814|821|98|68-04","sep":"|"}]}]);
const COLONY = [
{"id":"n-83ec8294","guard":[["hasAny",["abyss","after","ascent","beasts","beaver","begins","blood","breach","brokedown","conquer","consequences","darkness","element","end","error","famine","feeling","fire","freeze","gamble","hell","hunted","ice","icebreaker","item number","last","men","mongolias","moose","needles","nth","position","reckoning","rising","rock","shadow","shortest","shortest one","shortest word","smoked","snared","stalked","tainted","thicker","title","triumph","weasel","winters","wolf"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," date of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-b9c352d8","guard":[["hasAny",["air","appears in","contains","element","includes","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.yesNo",["compare.contains",["sense.after",{"lit":"of"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],["render.template",{"lit":["The ",{"slot":0}," date of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]]],"mem":null},
{"id":"n-bd1aaf74","guard":[["not",["hasAny",["845r","act","album","antarcticatroll","artist","author","black","castle","consecutive","country","ep","episode","fixedincome","gender","hex","id","imdb","intention","little","moonlight","n3","ncaa","nickname","original","polonius","published","rating","region","roll","september","shortcode","song","state","steep","subcategory","tconst","ticker","trapped","type","writers","you"]]]],"pyramid":["render.yesNo",["compare.contains",["sense.after",{"lit":"of"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],["render.template",{"lit":["The ",{"slot":0}," date of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]]],"mem":null},
{"id":"n-0ce9572c","guard":[["hasAny",["abyss","after","ascent","begins","breach","chewed","conquer","element","end","first","flames","freeze","hell","is","item number","men","moose","musk","no","nth","outfoxed","position","reckoning","rock","shadow","thicker","title","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The air ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-eee35b7e","guard":[["hasAny",["abyss","after","ascent","begins","breach","chewed","conquer","element","end","first","flames","freeze","hell","is","item number","men","moose","musk","no","nth","outfoxed","position","reckoning","rock","shadow","thicker","title","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," date of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-e37a3e97","guard":[["hasAny",["abyss","after","ascent","begins","breach","chewed","conquer","element","end","first","flames","freeze","hell","is","item number","men","moose","musk","no","nth","outfoxed","position","reckoning","rock","shadow","thicker","title","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-f764425f","guard":[["hasAny",["abyss","after","ascent","begins","breach","chewed","conquer","element","end","first","flames","freeze","hell","is","item number","men","moose","musk","no","nth","outfoxed","position","reckoning","rock","shadow","thicker","title","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-7627a7f9","guard":[["hasAny",["abyss","after","ascent","begins","breach","chewed","conquer","element","end","first","flames","freeze","hell","is","item number","men","moose","musk","no","nth","outfoxed","position","reckoning","rock","shadow","thicker","title","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-132cfe4f","guard":[["hasAny",["abyss","after","ascent","begins","breach","capitalise","capitalize","capitalize each word","chewed","conquer","element","end","first","flames","freeze","hell","is","item number","men","moose","musk","no","nth","outfoxed","position","reckoning","rock","shadow","thicker","title","title case","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-1f00bf14","guard":[["hasAny",["abyss","after","ascent","begins","breach","chewed","conquer","element","end","first","flames","freeze","hell","invert case","is","item number","men","moose","musk","no","nth","outfoxed","position","reckoning","rock","shadow","swap case","thicker","title","toggle case","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-3c99ee7b","guard":[["hasAny",["abyss","after","all caps","ascent","begins","breach","capital letters","capitals","chewed","conquer","element","end","first","flames","freeze","hell","is","item number","men","moose","musk","no","nth","outfoxed","position","reckoning","rock","shadow","thicker","title","upper case","uppercase","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-963c864d","guard":[["hasAny",["abyss","after","ascent","begins","breach","chewed","conquer","element","end","first","flames","freeze","hell","is","item number","lower case","lowercase","men","moose","musk","no","nth","outfoxed","position","reckoning","rock","shadow","small letters","thicker","title","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-ac2d4084","guard":[["hasAny",["abyss","after","ascent","begins","breach","chewed","conquer","element","end","first","flames","freeze","hell","is","item number","men","moose","musk","no","normalise","normalize","nth","outfoxed","position","reckoning","rock","shadow","simplify the text","thicker","title","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-11cfbdbe","guard":[["hasAny",["abyss","after","ascent","begins","breach","conquer","element","end","first","freeze","hell","item number","men","moose","nth","outfoxed","position","reckoning","rock","shadow","shortest","shortest one","shortest word","thicker","title","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-eed2e39e","guard":[["hasAny",["abyss","after","ascent","begins","breach","conquer","element","end","first","freeze","hell","item number","men","moose","nth","outfoxed","position","reckoning","rock","shadow","shortest","shortest one","shortest word","thicker","title","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-0077e55a","guard":[["hasAny",["abyss","after","ascent","begins","breach","conquer","element","end","first","freeze","hell","item number","men","moose","nth","outfoxed","position","reckoning","rock","shadow","shortest","shortest one","shortest word","thicker","title","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-5d690d3a","guard":[["hasAny",["abyss","after","ascent","begins","breach","capitalise","capitalize","capitalize each word","conquer","element","end","first","freeze","hell","item number","men","moose","nth","outfoxed","position","reckoning","rock","shadow","shortest","shortest one","shortest word","thicker","title","title case","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-c092f94c","guard":[["hasAny",["abyss","after","all caps","ascent","begins","breach","capital letters","capitals","conquer","element","end","first","freeze","hell","item number","men","moose","nth","outfoxed","position","reckoning","rock","shadow","shortest","shortest one","shortest word","thicker","title","upper case","uppercase","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-c8e00d92","guard":[["hasAny",["abyss","after","ascent","begins","breach","conquer","element","end","first","freeze","hell","item number","lower case","lowercase","men","moose","nth","outfoxed","position","reckoning","rock","shadow","shortest","shortest one","shortest word","small letters","thicker","title","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-fcec296e","guard":[["hasAny",["abyss","after","ascent","begins","breach","conquer","element","end","first","freeze","hell","invert case","item number","men","moose","nth","outfoxed","position","reckoning","rock","shadow","shortest","shortest one","shortest word","swap case","thicker","title","toggle case","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-c4b07f2c","guard":[["hasAny",["abyss","after","ascent","begins","breach","conquer","element","end","first","freeze","hell","item number","men","moose","normalise","normalize","nth","outfoxed","position","reckoning","rock","shadow","shortest","shortest one","shortest word","simplify the text","thicker","title","winters","wolf"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-6f2e0461","guard":[["hasAny",["abyss","after","ascent","begins","blood","bowels","breach","conquer","earth","element","end","fight","fire","fury","item number","lone","men","moose","musk","no","nth","outfoxed","position","reckoning","rock","shadow","thicker","up"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-73e49800","guard":[["has","air"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the air date of Once More Unto the Breach":"The air date of Once More Unto the Breach is 2016-04-21.","the air date of First Blood":"The air date of First Blood is 2016-12-15.","the air date of After the Rescue":"The air date of After the Rescue is 2015-08-05.","the air date of Fire and Ice":"The air date of Fire and Ice is 2019-08-22.","the air date of Thicker Than Water":"The air date of Thicker Than Water is 2017-07-20.","the air date of The Musk Ox":"The air date of The Musk Ox is 2020-07-16.","the air date of Into the Abyss":"The air date of Into the Abyss is 2016-07-14.","the air date of The Point of No Return":"The air date of The Point of No Return is 2017-02-02.","the air date of Fight, Flight or Freeze":"The air date of Fight, Flight or Freeze is 2022-08-04.","the air date of The Rock House":"The air date of The Rock House is 2020-06-18.","the air date of The Moose":"The air date of The Moose is 2019-06-27.","the air date of Up In Flames":"The air date of Up In Flames is 2019-06-20.","the air date of Divide and Conquer":"The air date of Divide and Conquer is 2017-06-15.","the air date of The Rock":"The air date of The Rock is 2020-07-09.","the air date of The End Game":"The air date of The End Game is 2016-07-14.","the air date of The Ascent":"The air date of The Ascent is 2016-06-16.","the air date of Chewed Up":"The air date of Chewed Up is 2021-06-17.","the air date of And So It Begins":"The air date of And So It Begins is 2015-06-18.","the air date of Of Mice And Men":"The air date of Of Mice And Men is 2018-07-19.","the air date of The Reckoning":"The air date of The Reckoning is 2021-08-19.","the air date of Winter's Fury":"The air date of Winter's Fury is 2016-07-07.","the air date of The Lone Wolf":"The air date of The Lone Wolf is 2017-01-05.","the air date of Hell on Earth":"The air date of Hell on Earth is 2017-06-22.","the air date of Outfoxed":"The air date of Outfoxed is 2016-12-29.","the air date of Starvation's Shadow":"The air date of Starvation's Shadow is 2018-08-09.","the air date of The Bowels Of Hell":"The air date of The Bowels Of Hell is 2018-07-12.","the air date of That Was No Bunny":"The air date of That Was No Bunny is 2020-06-25."}}},
{"id":"n-ee02a1e8","guard":[["not",["hasAny",["act","akron","artist","author","consecutive","country","didst","director","fixedincome","id","moonlight","n3","number","outfoxed","rating","release","september","test","title","type","week"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"for"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-efa58389","guard":[["hasAny",["air","element","item number","nth","position"]],["not",["has","outfoxed"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"for"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-a478d77a","guard":[["has","air"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"Stalked":"The air date of Stalked is 2015-07-09.","The Weasel":"The air date of The Weasel is 2022-06-30.","The Gamble":"The air date of The Gamble is 2016-06-30.","Storm Rising":"The air date of Storm Rising is 2016-05-19.","The Beaver":"The air date of The Beaver is 2022-06-16.","Snared":"The air date of Snared is 2020-07-23.","Gut Feeling":"The air date of Gut Feeling is 2022-07-14.","Consequences":"The air date of Consequences is 2022-06-02.","Pins and Needles":"The air date of Pins and Needles is 2020-08-13.","Eternal Darkness":"The air date of Eternal Darkness is 2016-12-22.","Brokedown Palace":"The air date of Brokedown Palace is 2015-08-13.","Of Feast & Famine":"The air date of Of Feast & Famine is 2017-01-26.","Up In Smoke":"The air date of Up In Smoke is 2020-07-30.","Flesh and Blood":"The air date of Flesh and Blood is 2017-08-17.","The Hunted":"The air date of The Hunted is 2021-06-03.","Thin Ice":"The air date of Thin Ice is 2019-08-15.","The Last Mile":"The air date of The Last Mile is 2017-07-06.","Trial By Fire":"The air date of Trial By Fire is 2016-06-09.","Margin of Error":"The air date of Margin of Error is 2017-06-29.","Smoked":"The air date of Smoked is 2021-07-08.","Mongolia's Wrath":"The air date of Mongolia's Wrath is 2018-07-05.","Slayer II":"The air date of Slayer II is 2018-08-02.","Tainted":"The air date of Tainted is 2019-06-13.","Icebreaker":"The air date of Icebreaker is 2019-06-06.","Triumph":"The air date of Triumph is 2015-08-20.","The Beasts of the Night":"The air date of The Beasts of the Night is 2016-05-05."}}},
{"id":"n-6318582a","guard":[["hasAny",["beaver","brokedown","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","ii","item number","last","mongolias","needles","nth","position","rising","smoke","smoked","snared","stalked","tainted","thin","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," date of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-87c05142","guard":[["hasAny",["beaver","brokedown","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","ii","item number","last","mongolias","needles","nth","position","rising","smoke","smoked","snared","stalked","tainted","thin","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The air ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-5f3a7d5d","guard":[["hasAny",["beaver","brokedown","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","ii","item number","last","mongolias","needles","nth","position","rising","smoke","smoked","snared","stalked","tainted","thin","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-c00ed4ea","guard":[["hasAny",["beaver","brokedown","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","ii","item number","last","mongolias","needles","nth","position","rising","smoke","smoked","snared","stalked","tainted","thin","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-1b5379a9","guard":[["hasAny",["alphabetize the letters","beaver","brokedown","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","ii","item number","last","letters in order","mongolias","needles","nth","position","rising","smoke","smoked","snared","sort the letters","stalked","tainted","thin","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.sortLetters",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-1c914624","guard":[["hasAny",["beaver","brokedown","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","ii","item number","last","mongolias","needles","nth","position","rising","smoke","smoked","snared","stalked","tainted","thin","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-816ee9e2","guard":[["hasAny",["beaver","brokedown","class name","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","ii","item number","last","mongolias","needles","nth","pascal case","pascalcase","position","rising","smoke","smoked","snared","stalked","tainted","thin","trial","triumph","upper camel case","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-8eeee971","guard":[["hasAny",["beaver","brokedown","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","ii","invert case","item number","last","mongolias","needles","nth","position","rising","smoke","smoked","snared","stalked","swap case","tainted","thin","toggle case","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-131953b5","guard":[["hasAny",["all caps","beaver","brokedown","capital letters","capitals","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","ii","item number","last","mongolias","needles","nth","position","rising","smoke","smoked","snared","stalked","tainted","thin","trial","triumph","upper case","uppercase","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-480906a1","guard":[["hasAny",["beaver","brokedown","consequences","darkness","each word","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","ii","item number","last","mongolias","needles","nth","position","rising","smoke","smoked","snared","split into words","stalked","tainted","thin","trial","triumph","weasel","words"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-49b401c8","guard":[["hasAny",["beaver","brokedown","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","ii","item number","last","lower case","lowercase","mongolias","needles","nth","position","rising","small letters","smoke","smoked","snared","stalked","tainted","thin","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-6d065093","guard":[["hasAny",["beaver","brokedown","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","ii","invert case","item number","last","mongolias","needles","nth","position","rising","smoke","smoked","snared","stalked","swap case","tainted","thin","toggle case","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-7e360974","guard":[["hasAny",["beaver","brokedown","capitalise","capitalize","capitalize each word","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","ii","item number","last","mongolias","needles","nth","position","rising","smoke","smoked","snared","stalked","tainted","thin","title case","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-c62e305d","guard":[["hasAny",["beaver","brokedown","consequences","darkness","each word","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","ii","item number","last","mongolias","needles","nth","position","rising","smoke","smoked","snared","split into words","stalked","tainted","thin","trial","triumph","weasel","words"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-f8d0662d","guard":[["hasAny",["beaver","brokedown","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","ii","item number","last","mongolias","needles","normalise","normalize","nth","position","rising","simplify the text","smoke","smoked","snared","stalked","tainted","thin","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-4eb2f56f","guard":[["hasAny",["beasts","beaver","blood","brokedown","consequences","darkness","element","error","famine","feeling","fire","gamble","hunted","ice","icebreaker","item number","last","mongolias","needles","nth","position","rising","shortest","shortest one","shortest word","smoked","snared","stalked","tainted","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"for"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-199174d1","guard":[["hasAny",["beasts","beaver","blood","brokedown","consequences","darkness","element","error","famine","feeling","fire","gamble","hunted","ice","icebreaker","item number","last","lower case","lowercase","mongolias","needles","nth","position","rising","shortest","shortest one","shortest word","small letters","smoked","snared","stalked","tainted","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["sense.after",{"lit":"for"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-3dc06070","guard":[["not",["hasAny",["845r","angry","antarcticatroll","artist","author","because","category","consecutive","country","cryptocurrency","didst","draw","featuring","gender","icao","id","infected","moonlight","n3","nickname","outfoxed","procter","published","rockn","sparks","state","tconst","test","type","writers"]]]],"pyramid":["render.yesNo",["compare.isEven",["transform.div",["sense.wordCount"],{"lit":3}]],["render.template",{"lit":["The ",{"slot":0}," date of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]]],"mem":null},
{"id":"n-bdd1f56d","guard":[["hasAny",["air","an even number","divide","divided by","element","even","is even","item number","nth","over","per","position","quotient","shortest","shortest one","shortest word","split"]],["has","the"],["not",["has","outfoxed"]]],"pyramid":["render.yesNo",["compare.isEven",["transform.div",["sense.wordCount"],{"lit":3}]],["render.template",{"lit":["The ",{"slot":0}," date of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]]],"mem":null},
{"id":"n-574fbb9d","guard":[["hasAny",["beaver","brokedown","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","item number","last","mongolias","needles","nth","position","rising","shortest","shortest one","shortest word","smoked","snared","stalked","tainted","thin","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-9d665e09","guard":[["hasAny",["beaver","brokedown","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","item number","last","mongolias","needles","nth","position","rising","shortest","shortest one","shortest word","smoked","snared","stalked","tainted","thin","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-41fe5764","guard":[["hasAny",["beaver","brokedown","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","item number","last","mongolias","needles","nth","position","rising","shortest","shortest one","shortest word","smoked","snared","stalked","tainted","thin","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-73913219","guard":[["hasAny",["all caps","beaver","brokedown","capital letters","capitals","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","item number","last","mongolias","needles","nth","position","rising","shortest","shortest one","shortest word","smoked","snared","stalked","tainted","thin","trial","triumph","upper case","uppercase","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-84517e3c","guard":[["hasAny",["beaver","brokedown","capitalise","capitalize","capitalize each word","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","item number","last","mongolias","needles","nth","position","rising","shortest","shortest one","shortest word","smoked","snared","stalked","tainted","thin","title case","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-89f6205e","guard":[["hasAny",["beaver","brokedown","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","invert case","item number","last","mongolias","needles","nth","position","rising","shortest","shortest one","shortest word","smoked","snared","stalked","swap case","tainted","thin","toggle case","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-a19b4fee","guard":[["hasAny",["beaver","brokedown","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","item number","last","lower case","lowercase","mongolias","needles","nth","position","rising","shortest","shortest one","shortest word","small letters","smoked","snared","stalked","tainted","thin","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-c081574e","guard":[["hasAny",["beaver","brokedown","consequences","darkness","element","error","famine","feeling","flesh","gamble","hunted","icebreaker","item number","last","mongolias","needles","normalise","normalize","nth","position","rising","shortest","shortest one","shortest word","simplify the text","smoked","snared","stalked","tainted","thin","trial","triumph","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-bd5b77e3","guard":[["hasAny",["abyss","after","ascent","begins","blood","bowels","breach","conquer","earth","element","end","fight","fire","fury","item number","lone","men","moose","nth","outfoxed","position","reckoning","rock","shadow","shortest","shortest one","shortest word","thicker"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-69acb99e","guard":[["hasAny",["abyss","after","ascent","begins","blood","bowels","breach","conquer","earth","element","end","fight","fire","fury","item number","lone","lower case","lowercase","men","moose","nth","outfoxed","position","reckoning","rock","shadow","shortest","shortest one","shortest word","small letters","thicker"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.after",{"lit":"of"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-cb24e9b7","guard":[["hasAny",["chewed","cold","desperate","drop","element","first","flareup","hooked","hungry","item number","normalise","normalize","nth","outfoxed","position","raider","redemption","shadow","simplify the text","winters"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-26ca20e5","guard":[["hasAny",["cold","desperate","drop","element","first","flareup","hooked","hungry","item number","normalise","normalize","nth","outfoxed","position","raider","redemption","shadow","shortest","shortest one","shortest word","simplify the text","winters"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-2dd96472","guard":[["hasAny",["brokedown","consequences","darkness","element","feeling","icebreaker","ii","item number","mongolias","normalise","normalize","nth","position","rising","simplify the text","smoked","snared","stalked","tainted","thin","triumph"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-c2fcf7c9","guard":[["hasAny",["brokedown","consequences","darkness","element","feeling","icebreaker","item number","mongolias","normalise","normalize","nth","position","rising","shortest","shortest one","shortest word","simplify the text","smoked","snared","stalked","tainted","thin","triumph"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-c76bcec4","guard":[["hasAny",["consequences","element","icebreaker","item number","nth","position","shortest","shortest one","shortest word","smoked","snared","stalked","tainted","triumph"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-2eeed8d2","guard":[["hasAny",["class name","consequences","element","icebreaker","item number","nth","pascal case","pascalcase","position","shortest","shortest one","shortest word","smoked","snared","stalked","tainted","triumph","upper camel case"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.pascal",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-b2809939","guard":[["hasAny",["camel case","camelcase","consequences","element","icebreaker","item number","lower camel case","nth","position","shortest","shortest one","shortest word","smoked","snared","stalked","tainted","triumph"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-e4fc4663","guard":[["hasAny",["consequences","element","icebreaker","invert case","item number","nth","position","shortest","shortest one","shortest word","smoked","snared","stalked","swap case","tainted","toggle case","triumph"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-16599ad9","guard":[["hasAny",["element","end","item number","last","lone","longest","longest one","longest word","men","musk","nth","position","thin"]],["has","air"]],"pyramid":["render.template",{"lit":["The air ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-8cedbd81","guard":[["hasAny",["element","end","fire","item number","lone","longest","longest one","longest word","men","musk","nth","position"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.content"]],["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-6b429153","guard":[["hasAny",["element","end","item number","last","lone","longest","longest one","longest word","men","nth","position","shortest","shortest one","shortest word","thin"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]],["render.and",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-8fe39ca1","guard":[["hasAny",["element","end","item number","last","lone","longest","longest one","longest word","men","nth","position","shortest","shortest one","shortest word","thin"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-79e4a41b","guard":[["hasAny",["element","end","item number","last","lone","longest","longest one","longest word","men","nth","position","shortest","shortest one","shortest word","thin"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-0bca2f8f","guard":[["hasAny",["all caps","capital letters","capitals","element","end","item number","last","lone","longest","longest one","longest word","men","nth","position","shortest","shortest one","shortest word","thin","upper case","uppercase"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-6fd3fb4a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","end","item number","last","lone","longest","longest one","longest word","men","nth","position","shortest","shortest one","shortest word","thin","title case"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-d6386a57","guard":[["hasAny",["element","end","invert case","item number","last","lone","longest","longest one","longest word","men","nth","position","shortest","shortest one","shortest word","swap case","thin","toggle case"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-db4a46f8","guard":[["hasAny",["element","end","item number","last","lone","longest","longest one","longest word","lower case","lowercase","men","nth","position","shortest","shortest one","shortest word","small letters","thin"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-dbdf8bef","guard":[["hasAny",["element","end","item number","last","lone","longest","longest one","longest word","men","normalise","normalize","nth","position","shortest","shortest one","shortest word","simplify the text","thin"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-a400afe2","guard":[["hasAny",["element","end","fire","item number","lone","longest","longest one","longest word","men","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]],["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-11b396fd","guard":[["hasAny",["element","end","item number","lone","longest","longest one","longest word","men","musk","nth","position"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-3ac10d44","guard":[["hasAny",["element","end","item number","lone","longest","longest one","longest word","men","musk","nth","position"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.content"]],["render.and",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-38463f49","guard":[["hasAny",["element","end","item number","lone","longest","longest one","longest word","men","musk","nth","position"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-4c843ea4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","end","item number","lone","longest","longest one","longest word","men","musk","nth","position","title case"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.content"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-5c23ff08","guard":[["hasAny",["element","end","item number","lone","longest","longest one","longest word","lower case","lowercase","men","musk","nth","position","small letters"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.content"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-8ebf7ea7","guard":[["hasAny",["element","end","invert case","item number","lone","longest","longest one","longest word","men","musk","nth","position","swap case","toggle case"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-cca7078c","guard":[["hasAny",["dashes","element","flareup","hooked","hyphens","item number","kebab case","kebabcase","nth","outfoxed","position","redemption","shortest","shortest one","shortest word","slug"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.kebab",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-cd69c9fd","guard":[["hasAny",["element","flareup","hooked","item number","nth","outfoxed","position","redemption","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-e43a1c7a","guard":[["hasAny",["all caps","capital letters","capitals","element","end","item number","lone","longest","longest one","longest word","men","musk","nth","position","upper case","uppercase"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.content"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-15bea8bd","guard":[["hasAny",["element","end","item number","lone","longest","longest one","longest word","men","musk","normalise","normalize","nth","position","simplify the text"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-574255b6","guard":[["hasAny",["element","hooked","item number","nth","outfoxed","position","redemption","shortest","shortest one","shortest word"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-61676655","guard":[["hasAny",["class name","element","hooked","item number","nth","outfoxed","pascal case","pascalcase","position","redemption","shortest","shortest one","shortest word","upper camel case"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.pascal",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-806ca252","guard":[["hasAny",["element","hooked","invert case","item number","nth","outfoxed","position","redemption","shortest","shortest one","shortest word","swap case","toggle case"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-b1aee6f4","guard":[["hasAny",["camel case","camelcase","element","hooked","item number","lower camel case","nth","outfoxed","position","redemption","shortest","shortest one","shortest word"]],["has","air"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-f7ed4e74","guard":[["hasAny",["abyss","element","end","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2016-07-14."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-8c314045","guard":[["hasAny",["lone","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2017-01-05."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-c9dd279e","guard":[["hasAny",["longest","longest one","longest word","men","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2018-07-19."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-f48daab9","guard":[["hasAny",["end","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2016-07-14."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-0170cf60","guard":[["hasAny",["brokedown","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2015-08-13."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-049f2cc0","guard":[["hasAny",["element","item number","needles","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2020-08-13."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-071a4d2b","guard":[["hasAny",["element","ii","item number","nth","position"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2018-08-02."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-09512f84","guard":[["hasAny",["beaver","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2022-06-16."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-0d545025","guard":[["hasAny",["element","famine","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2017-01-26."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-17223506","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","trial"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2016-06-09."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-1b032064","guard":[["hasAny",["begins","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2015-06-18."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-1e74988d","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","triumph"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2015-08-20."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-293f6341","guard":[["hasAny",["buck","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2021-07-01."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-2d0e3632","guard":[["hasAny",["element","grizzly","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2021-07-22."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-31e69d38","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","stalked"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2015-07-09."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-32bb0938","guard":[["hasAny",["element","hunger","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2015-07-30."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-3e0ddcfc","guard":[["hasAny",["darkness","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2016-12-22."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-404a8f7e","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","smoked"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2021-07-08."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-40757d48","guard":[["hasAny",["breach","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2016-04-21."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-4a9f6c2b","guard":[["hasAny",["element","item number","nth","outfoxed","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2016-12-29."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-4ac3ec8c","guard":[["hasAny",["element","item number","nth","position","rising","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2016-05-19."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-4c3bc725","guard":[["hasAny",["element","feeling","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2022-07-14."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-4eccfd0a","guard":[["hasAny",["consequences","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2022-06-02."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-4efc2af9","guard":[["hasAny",["after","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2015-08-05."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-5218a5a0","guard":[["hasAny",["element","item number","last","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2017-07-06."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-523604eb","guard":[["hasAny",["element","item number","nth","over","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2020-08-20."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-53b7026f","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","snared"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2020-07-23."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-554ed780","guard":[["hasAny",["element","item number","kill","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2019-07-11."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-59a9f4b5","guard":[["hasAny",["element","hooked","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2017-07-27."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-5af7bea2","guard":[["hasAny",["element","item number","longest","longest one","longest word","musk","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2020-07-16."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-5c16864b","guard":[["hasAny",["element","fear","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2015-07-02."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-62c7de78","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","winds"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2015-07-16."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-6bbaf976","guard":[["hasAny",["element","item number","nth","position","shadow","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2018-08-09."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-71897b18","guard":[["hasAny",["element","flareup","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2017-08-03."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-7625834d","guard":[["hasAny",["element","item number","nth","position","smoke"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2020-07-30."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-7b00f9ef","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","wolves"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2020-08-06."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-873196c9","guard":[["hasAny",["element","item number","nth","position","raider","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2019-07-25."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-883879b5","guard":[["hasAny",["element","gamble","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2016-06-30."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-896128b5","guard":[["hasAny",["earth","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2017-06-22."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-896acff5","guard":[["hasAny",["element","fight","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2022-08-04."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-8f07a47a","guard":[["hasAny",["element","item number","nth","out","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2019-08-01."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-93db0ddd","guard":[["hasAny",["element","fury","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2016-07-07."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-9a5f7c56","guard":[["hasAny",["element","haunting","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2018-06-21."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-a13d60a0","guard":[["hasAny",["double","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2017-07-13."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-a336400e","guard":[["hasAny",["element","item number","nth","position","reckoning","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2021-08-19."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-a41c7a9d","guard":[["hasAny",["element","item number","madness","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2016-06-23."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-a479ad98","guard":[["hasAny",["element","flesh","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2017-08-17."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-bdf4c876","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","thicker"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2017-07-20."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-bf76ce0e","guard":[["hasAny",["element","item number","knifes","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2016-04-28."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-c07421d7","guard":[["hasAny",["element","hungry","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2017-01-19."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-cd61a2ee","guard":[["hasAny",["element","fly","item number","nth","position","shortest","shortest one","shortest word"]],["has","date"],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2020-07-02."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-d0796351","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2022-06-30."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-d204c1a9","guard":[["hasAny",["element","item number","nth","position","redemption","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2018-06-14."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-d4651544","guard":[["hasAny",["element","item number","man","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2015-06-25."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-d5c5f255","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","thin"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2019-08-15."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-d80fc86e","guard":[["hasAny",["element","hunted","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2021-06-03."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-dbf30cf4","guard":[["hasAny",["ascent","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2016-06-16."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-e20748c9","guard":[["hasAny",["element","house","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2020-06-18."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-e36ebf02","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tainted"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2019-06-13."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-e56caca0","guard":[["hasAny",["element","item number","mongolias","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2018-07-05."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-e8c8458c","guard":[["hasAny",["element","item number","moose","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2019-06-27."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-e8ebe114","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","war"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2018-08-16."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-e91d83ed","guard":[["hasAny",["bowels","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2018-07-12."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-f66301e4","guard":[["hasAny",["element","error","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2017-06-29."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-fa34ccd8","guard":[["hasAny",["element","icebreaker","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2019-06-06."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-fbcdee95","guard":[["hasAny",["element","first","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2016-12-15."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-fc23fe42","guard":[["hasAny",["element","grasp","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2022-07-28."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-fd5cbd75","guard":[["hasAny",["desperate","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2018-07-26."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-fe2da02f","guard":[["hasAny",["cometh","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2019-08-08."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-ff33a59f","guard":[["hasAny",["conquer","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2017-06-15."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-ffc2342d","guard":[["hasAny",["drop","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2022-05-26."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-16410a03","guard":[["hasAny",["element","flames","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2019-06-20."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-5558778d","guard":[["hasAny",["element","item number","nth","point","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2017-02-02."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-66aa860a","guard":[["hasAny",["chewed","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2021-06-17."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-cc2e55ff","guard":[["hasAny",["air","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}],["sense.roman"]]],"mem":null},
{"id":"n-d9307e28","guard":[["hasAny",["bunny","element","item number","nth","position"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is 2020-06-25."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}]]],"mem":null},
{"id":"n-f5e15178","guard":[["hasAny",["air","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}],["sense.unit"]]],"mem":null},
{"id":"n-0fbd61f9","guard":[["hasAny",["element","end","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The End Game is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-86a899f7","guard":[["hasAny",["element","item number","lone","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Lone Wolf is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-b7cc10d6","guard":[["hasAny",["element","item number","longest","longest one","longest word","men","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Of Mice And Men is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-02e36865","guard":[["hasAny",["element","first","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of First Blood is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-05d29594","guard":[["hasAny",["element","item number","moose","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Moose is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-067e9b91","guard":[["hasAny",["element","hunger","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Hunger is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-072fa5f2","guard":[["hasAny",["element","fury","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Winter's Fury is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-085ba951","guard":[["hasAny",["element","item number","madness","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Madness is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-0968581e","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","thicker"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Thicker Than Water is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-0a451911","guard":[["hasAny",["element","fly","item number","nth","position","shortest","shortest one","shortest word"]],["has","date"],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Fly is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-0e335d02","guard":[["hasAny",["double","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Double or Nothing is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-11e33522","guard":[["hasAny",["element","ii","item number","nth","position"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Slayer II is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-124a4434","guard":[["hasAny",["element","item number","kill","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Kill is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-134dcb4c","guard":[["hasAny",["buck","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Buck is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-138a0977","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","trial"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Trial By Fire is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-150cf5fe","guard":[["hasAny",["breach","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Once More Unto the Breach is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-16a11fd9","guard":[["hasAny",["element","item number","nth","out","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Out Cold is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-16f750f8","guard":[["hasAny",["element","item number","nth","position","smoke"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Up In Smoke is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-1a35889e","guard":[["hasAny",["element","item number","mongolias","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Mongolia's Wrath is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-1d208748","guard":[["hasAny",["element","item number","needles","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Pins and Needles is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-255e1acd","guard":[["hasAny",["element","item number","man","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Of Wolf and Man is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-26a13401","guard":[["hasAny",["element","hooked","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Hooked is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-26a4fe95","guard":[["hasAny",["element","haunting","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Haunting is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-2766ac47","guard":[["hasAny",["darkness","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Eternal Darkness is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-2b2cb8b4","guard":[["hasAny",["element","flareup","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Flare-Up is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-2f96e4b2","guard":[["hasAny",["consequences","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Consequences is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-32d0a8a5","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","wolves"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Wolves is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-33acf842","guard":[["hasAny",["earth","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Hell on Earth is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-3b574480","guard":[["hasAny",["beaver","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Beaver is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-409d0f64","guard":[["hasAny",["element","grizzly","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Grizzly is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-424eab1c","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","smoked"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Smoked is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-44df4407","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","triumph"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Triumph is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-4d6259a2","guard":[["hasAny",["desperate","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Desperate Measures is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-4dde3c0a","guard":[["hasAny",["element","item number","nth","position","redemption","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Redemption is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-4dee8ff9","guard":[["hasAny",["begins","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of And So It Begins is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-522f62ea","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","weasel"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Weasel is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-58c832d8","guard":[["hasAny",["element","hungry","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Hungry Beasts is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-6672703e","guard":[["hasAny",["element","icebreaker","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Icebreaker is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-6807795a","guard":[["hasAny",["element","item number","nth","position","shadow","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Starvation's Shadow is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-714359b2","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","winds"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Winds of Hell is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-73bbc605","guard":[["hasAny",["element","item number","nth","position","reckoning","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Reckoning is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-7a113386","guard":[["hasAny",["element","item number","knifes","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Knife's Edge is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-7abd9043","guard":[["hasAny",["bowels","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Bowels Of Hell is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-7be71a5b","guard":[["hasAny",["element","item number","nth","position","raider","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Night Raider is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-8234c144","guard":[["hasAny",["drop","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Drop Shock is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-850c5bc7","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tainted"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tainted is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-8810ca33","guard":[["hasAny",["ascent","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Ascent is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-88eb866e","guard":[["hasAny",["element","flesh","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Flesh and Blood is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-918ad349","guard":[["hasAny",["element","hunted","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Hunted is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-918c63a7","guard":[["hasAny",["element","item number","nth","outfoxed","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Outfoxed is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-94f24c5b","guard":[["hasAny",["element","house","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Rock House is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-a965877d","guard":[["hasAny",["after","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of After the Rescue is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-b0bfab8c","guard":[["hasAny",["element","gamble","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Gamble is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-b8cd721f","guard":[["hasAny",["abyss","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Into the Abyss is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-b98d5a5a","guard":[["hasAny",["element","item number","nth","position","rising","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Storm Rising is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-bd4f7d5c","guard":[["hasAny",["element","fight","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Fight, Flight or Freeze is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-be334d59","guard":[["hasAny",["element","error","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Margin of Error is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-bf4786c3","guard":[["hasAny",["conquer","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Divide and Conquer is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-c1b22be1","guard":[["hasAny",["cometh","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Ice Cometh is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-c7fa871b","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","snared"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Snared is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-c97c93c0","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","stalked"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Stalked is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-d03507e7","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","thin"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Thin Ice is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-d5fe7ba0","guard":[["hasAny",["brokedown","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Brokedown Palace is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-e25a2ba9","guard":[["hasAny",["element","item number","last","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Last Mile is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-e50a5d64","guard":[["hasAny",["element","fear","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Talons of Fear is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-eeafcb0d","guard":[["hasAny",["element","famine","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Of Feast & Famine is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-f18fb6c4","guard":[["hasAny",["element","item number","nth","over","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Over the Edge is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-f25057f7","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","war"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Cold War is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-f550c80e","guard":[["hasAny",["element","grasp","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Winter's Grasp is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-f61349c0","guard":[["hasAny",["element","feeling","item number","nth","position","shortest","shortest one","shortest word"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Gut Feeling is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-ffeca3a5","guard":[["hasAny",["element","item number","longest","longest one","longest word","musk","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Musk Ox is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-95a9d611","guard":[["hasAny",["bunny","element","item number","nth","position"]],["has","air"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of That Was No Bunny is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-a65a56c8","guard":[["hasAny",["chewed","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Chewed Up is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-c263da91","guard":[["hasAny",["element","flames","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Up In Flames is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-cb5c575a","guard":[["hasAny",["element","item number","nth","point","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Point of No Return is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-episodes-025e62"},{"lit":"title"},{"lit":"air date"}]],"mem":null},
{"id":"n-059d57c1","guard":[["hasAny",["air","date","icebreaker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Icebreaker":"The air date of Icebreaker is 2019-06-06."}}},
{"id":"n-060988fc","guard":[["hasAny",["air","brokedown","date","palace"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Brokedown Palace":"The air date of Brokedown Palace is 2015-08-13."}}},
{"id":"n-085b32b0","guard":[["hasAny",["air","breach","date","more","once","unto"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of Once More Unto the Breach":"The air date of Once More Unto the Breach is 2016-04-21."}}},
{"id":"n-0eb65d8c","guard":[["hasAny",["air","date","reckoning"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of The Reckoning":"The air date of The Reckoning is 2021-08-19."}}},
{"id":"n-136cf83d","guard":[["hasAny",["air","date","edge","over","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Over the Edge":"The air date of Over the Edge is 2020-08-20."}}},
{"id":"n-1506300d","guard":[["hasAny",["air","date","kill","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Kill":"The air date of The Kill is 2019-07-11."}}},
{"id":"n-20a58d88","guard":[["hasAny",["air","date","stalked"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Stalked":"The air date of Stalked is 2015-07-09."}}},
{"id":"n-2564b195","guard":[["hasAny",["air","bowels","date","hell"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of The Bowels Of Hell":"The air date of The Bowels Of Hell is 2018-07-12."}}},
{"id":"n-281b7933","guard":[["hasAny",["air","date","fight","flight","freeze"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of Fight, Flight or Freeze":"The air date of Fight, Flight or Freeze is 2022-08-04."}}},
{"id":"n-2b50f3d6","guard":[["hasAny",["air","date","freeze","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Freeze":"The air date of The Freeze is 2015-08-06."}}},
{"id":"n-2caa3c61","guard":[["hasAny",["air","date","flareup","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Flare-Up":"The air date of Flare-Up is 2017-08-03."}}},
{"id":"n-2ccb840f","guard":[["hasAny",["air","date","snared"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Snared":"The air date of Snared is 2020-07-23."}}},
{"id":"n-3438ae3b","guard":[["hasAny",["air","cold","date","out","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Out Cold":"The air date of Out Cold is 2019-08-01."}}},
{"id":"n-3688505e","guard":[["hasAny",["air","cometh","date","ice","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Ice Cometh":"The air date of The Ice Cometh is 2019-08-08."}}},
{"id":"n-3781aca8","guard":[["hasAny",["air","consequences","date"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Consequences":"The air date of Consequences is 2022-06-02."}}},
{"id":"n-3810c271","guard":[["hasAny",["air","date","grizzly","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Grizzly":"The air date of The Grizzly is 2021-07-22."}}},
{"id":"n-3a5786b7","guard":[["hasAny",["air","date","redemption","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Redemption":"The air date of Redemption is 2018-06-14."}}},
{"id":"n-3b2379f1","guard":[["hasAny",["air","date","fire","ice"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of Fire and Ice":"The air date of Fire and Ice is 2019-08-22."}}},
{"id":"n-3b2d180c","guard":[["hasAny",["air","date","men","mice"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of Of Mice And Men":"The air date of Of Mice And Men is 2018-07-19."}}},
{"id":"n-3d21db9c","guard":[["hasAny",["air","blood","date","first"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of First Blood":"The air date of First Blood is 2016-12-15."}}},
{"id":"n-439b7da4","guard":[["hasAny",["air","date","gamble"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for The Gamble":"The air date of The Gamble is 2016-06-30."}}},
{"id":"n-44fff284","guard":[["hasAny",["air","date","no","point","return"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of The Point of No Return":"The air date of The Point of No Return is 2017-02-02."}}},
{"id":"n-4acd7a4c","guard":[["hasAny",["air","darkness","date","eternal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Eternal Darkness":"The air date of Eternal Darkness is 2016-12-22."}}},
{"id":"n-50bb3e9a","guard":[["hasAny",["air","date","smoked"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Smoked":"The air date of Smoked is 2021-07-08."}}},
{"id":"n-54a1d667","guard":[["hasAny",["air","beasts","date","hungry","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Hungry Beasts":"The air date of Hungry Beasts is 2017-01-19."}}},
{"id":"n-5723edef","guard":[["hasAny",["air","date","smoke","up"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Up In Smoke":"The air date of Up In Smoke is 2020-07-30."}}},
{"id":"n-5bbb2bac","guard":[["hasAny",["air","date","lone","wolf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of The Lone Wolf":"The air date of The Lone Wolf is 2017-01-05."}}},
{"id":"n-5e0d7112","guard":[["hasAny",["air","date","musk","ox"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of The Musk Ox":"The air date of The Musk Ox is 2020-07-16."}}},
{"id":"n-5f0d43e2","guard":[["hasAny",["air","bunny","date","no"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of That Was No Bunny":"The air date of That Was No Bunny is 2020-06-25."}}},
{"id":"n-5f2c8845","guard":[["hasAny",["air","date","ice","thin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Thin Ice":"The air date of Thin Ice is 2019-08-15."}}},
{"id":"n-64099764","guard":[["hasAny",["air","date","end","game"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of The End Game":"The air date of The End Game is 2016-07-14."}}},
{"id":"n-6409d7ab","guard":[["hasAny",["air","date","moose"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of The Moose":"The air date of The Moose is 2019-06-27."}}},
{"id":"n-78c4f40d","guard":[["hasAny",["air","date","hunger","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Hunger":"The air date of The Hunger is 2015-07-30."}}},
{"id":"n-79823814","guard":[["hasAny",["air","beasts","date","night"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for The Beasts of the Night":"The air date of The Beasts of the Night is 2016-05-05."}}},
{"id":"n-7d6a043e","guard":[["hasAny",["air","date","feeling","gut"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Gut Feeling":"The air date of Gut Feeling is 2022-07-14."}}},
{"id":"n-82ef681f","guard":[["hasAny",["air","date","drop","shock","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Drop Shock":"The air date of Drop Shock is 2022-05-26."}}},
{"id":"n-87b9050a","guard":[["hasAny",["air","date","grasp","title","winters"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Winter's Grasp":"The air date of Winter's Grasp is 2022-07-28."}}},
{"id":"n-8cb13afd","guard":[["hasAny",["air","date","madness","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Madness":"The air date of The Madness is 2016-06-23."}}},
{"id":"n-8e1f6b9e","guard":[["hasAny",["air","date","last","mile"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for The Last Mile":"The air date of The Last Mile is 2017-07-06."}}},
{"id":"n-8f015eca","guard":[["hasAny",["air","date","title","wolves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Wolves":"The air date of The Wolves is 2020-08-06."}}},
{"id":"n-90175ff5","guard":[["hasAny",["air","buck","date","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Buck":"The air date of The Buck is 2021-07-01."}}},
{"id":"n-96874454","guard":[["hasAny",["air","date","hunted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for The Hunted":"The air date of The Hunted is 2021-06-03."}}},
{"id":"n-96e73a2c","guard":[["hasAny",["air","date","man","title","wolf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Of Wolf and Man":"The air date of Of Wolf and Man is 2015-06-25."}}},
{"id":"n-9858f188","guard":[["hasAny",["air","date","hell","title","winds"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Winds of Hell":"The air date of Winds of Hell is 2015-07-16."}}},
{"id":"n-9db0df4f","guard":[["hasAny",["air","date","double","nothing","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Double or Nothing":"The air date of Double or Nothing is 2017-07-13."}}},
{"id":"n-a0fb5d5c","guard":[["hasAny",["air","date","needles","pins"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Pins and Needles":"The air date of Pins and Needles is 2020-08-13."}}},
{"id":"n-a1cdfd9c","guard":[["hasAny",["air","date","triumph"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Triumph":"The air date of Triumph is 2015-08-20."}}},
{"id":"n-a26acd02","guard":[["hasAny",["air","date","weasel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for The Weasel":"The air date of The Weasel is 2022-06-30."}}},
{"id":"n-a41e5399","guard":[["hasAny",["air","date","edge","knifes","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Knife's Edge":"The air date of The Knife's Edge is 2016-04-28."}}},
{"id":"n-a94be7a3","guard":[["hasAny",["air","beaver","date"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for The Beaver":"The air date of The Beaver is 2022-06-16."}}},
{"id":"n-afb19c8a","guard":[["hasAny",["air","date","haunting","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Haunting":"The air date of The Haunting is 2018-06-21."}}},
{"id":"n-b0dddf20","guard":[["hasAny",["air","date","desperate","measures","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Desperate Measures":"The air date of Desperate Measures is 2018-07-26."}}},
{"id":"n-b17c5fef","guard":[["hasAny",["air","ascent","date"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of The Ascent":"The air date of The Ascent is 2016-06-16."}}},
{"id":"n-b5898b12","guard":[["hasAny",["air","date","fury","winters"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of Winter's Fury":"The air date of Winter's Fury is 2016-07-07."}}},
{"id":"n-b7bbff71","guard":[["hasAny",["air","conquer","date","divide"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of Divide and Conquer":"The air date of Divide and Conquer is 2017-06-15."}}},
{"id":"n-b916b118","guard":[["hasAny",["air","date","rock"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of The Rock":"The air date of The Rock is 2020-07-09."}}},
{"id":"n-b92503b6","guard":[["hasAny",["air","date","rising","storm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Storm Rising":"The air date of Storm Rising is 2016-05-19."}}},
{"id":"n-beaec552","guard":[["hasAny",["abyss","air","date"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of Into the Abyss":"The air date of Into the Abyss is 2016-07-14."}}},
{"id":"n-c0bf5df6","guard":[["hasAny",["air","date","night","raider","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Night Raider":"The air date of Night Raider is 2019-07-25."}}},
{"id":"n-c1862014","guard":[["hasAny",["air","date","fly","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Fly":"The air date of The Fly is 2020-07-02."}}},
{"id":"n-c2e75ef8","guard":[["hasAny",["air","cold","date","title","war"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Cold War":"The air date of Cold War is 2018-08-16."}}},
{"id":"n-c39092aa","guard":[["hasAny",["air","date","ii","slayer"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Slayer II":"The air date of Slayer II is 2018-08-02."}}},
{"id":"n-c41763f6","guard":[["hasAny",["air","date","house","rock"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of The Rock House":"The air date of The Rock House is 2020-06-18."}}},
{"id":"n-c4c9f5ca","guard":[["hasAny",["air","date","outfoxed"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of Outfoxed":"The air date of Outfoxed is 2016-12-29."}}},
{"id":"n-cb55c478","guard":[["hasAny",["air","date","hooked","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Hooked":"The air date of Hooked is 2017-07-27."}}},
{"id":"n-d67c05d8","guard":[["hasAny",["air","date","error","margin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Margin of Error":"The air date of Margin of Error is 2017-06-29."}}},
{"id":"n-d9572632","guard":[["hasAny",["air","date","tainted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Tainted":"The air date of Tainted is 2019-06-13."}}},
{"id":"n-da4daf9f","guard":[["hasAny",["air","date","fire","trial"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Trial By Fire":"The air date of Trial By Fire is 2016-06-09."}}},
{"id":"n-e45e5917","guard":[["hasAny",["after","air","date","rescue"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of After the Rescue":"The air date of After the Rescue is 2015-08-05."}}},
{"id":"n-e4e11c10","guard":[["hasAny",["air","date","flames","up"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of Up In Flames":"The air date of Up In Flames is 2019-06-20."}}},
{"id":"n-ecdf7d58","guard":[["hasAny",["air","date","shadow","starvations"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of Starvation's Shadow":"The air date of Starvation's Shadow is 2018-08-09."}}},
{"id":"n-f0269240","guard":[["hasAny",["air","blood","date","flesh"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Flesh and Blood":"The air date of Flesh and Blood is 2017-08-17."}}},
{"id":"n-f0e3fc89","guard":[["hasAny",["air","chewed","date","up"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of Chewed Up":"The air date of Chewed Up is 2021-06-17."}}},
{"id":"n-faa8905f","guard":[["hasAny",["air","date","fear","talons","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Talons of Fear":"The air date of The Talons of Fear is 2015-07-02."}}},
{"id":"n-fb71b355","guard":[["hasAny",["air","begins","date"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of And So It Begins":"The air date of And So It Begins is 2015-06-18."}}},
{"id":"n-fc5005c7","guard":[["hasAny",["air","date","famine","feast"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Of Feast & Famine":"The air date of Of Feast & Famine is 2017-01-26."}}},
{"id":"n-fc5eb04a","guard":[["hasAny",["air","date","thicker","water"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of Thicker Than Water":"The air date of Thicker Than Water is 2017-07-20."}}},
{"id":"n-ffe1932b","guard":[["hasAny",["air","date","mongolias","wrath"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the air date for Mongolia's Wrath":"The air date of Mongolia's Wrath is 2018-07-05."}}},
{"id":"n-ffe310a4","guard":[["hasAny",["air","date","earth","hell"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the air date of Hell on Earth":"The air date of Hell on Earth is 2017-06-22."}}},
{"id":"n-0173cda9","guard":[["has","reckoning"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of The Reckoning":"The air date of The Reckoning is 2021-08-19."}}},
{"id":"n-02c5df3e","guard":[["has","earth"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of Hell on Earth":"The air date of Hell on Earth is 2017-06-22."}}},
{"id":"n-02f17513","guard":[["hasAny",["fight","flight"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of Fight, Flight or Freeze":"The air date of Fight, Flight or Freeze is 2022-08-04."}}},
{"id":"n-03d62833","guard":[["has","lone"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of The Lone Wolf":"The air date of The Lone Wolf is 2017-01-05."}}},
{"id":"n-090639ec","guard":[["has","begins"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of And So It Begins":"The air date of And So It Begins is 2015-06-18."}}},
{"id":"n-0b900f6c","guard":[["has","hungry"],["has","air"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Hungry Beasts":"The air date of Hungry Beasts is 2017-01-19."}}},
{"id":"n-0dc8c6ec","guard":[["has","bunny"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of That Was No Bunny":"The air date of That Was No Bunny is 2020-06-25."}}},
{"id":"n-10ee3a82","guard":[["has","outfoxed"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of Outfoxed":"The air date of Outfoxed is 2016-12-29."}}},
{"id":"n-115907f8","guard":[["hasAny",["air","conquer","date","divide"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of Divide and Conquer":"The air date of Divide and Conquer is 2017-06-15."}}},
{"id":"n-15f9df8d","guard":[["has","abyss"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of Into the Abyss":"The air date of Into the Abyss is 2016-07-14."}}},
{"id":"n-1657be03","guard":[["hasAny",["air","date","shadow","starvations"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of Starvation's Shadow":"The air date of Starvation's Shadow is 2018-08-09."}}},
{"id":"n-213737b5","guard":[["has","war"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Cold War":"The air date of Cold War is 2018-08-16."}}},
{"id":"n-226be9c8","guard":[["has","man"],["has","wolf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Of Wolf and Man":"The air date of Of Wolf and Man is 2015-06-25."}}},
{"id":"n-24514d40","guard":[["has","buck"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Buck":"The air date of The Buck is 2021-07-01."}}},
{"id":"n-29f8bee2","guard":[["has","cometh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Ice Cometh":"The air date of The Ice Cometh is 2019-08-08."}}},
{"id":"n-2ab94a1c","guard":[["has","house"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of The Rock House":"The air date of The Rock House is 2020-06-18."}}},
{"id":"n-2dbfd8ff","guard":[["has","consequences"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Consequences":"The air date of Consequences is 2022-06-02."}}},
{"id":"n-2fe5e9fb","guard":[["has","stalked"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Stalked":"The air date of Stalked is 2015-07-09."}}},
{"id":"n-36c29961","guard":[["hasAny",["air","date","end","game"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of The End Game":"The air date of The End Game is 2016-07-14."}}},
{"id":"n-37a4039c","guard":[["hasAny",["air","date","musk","ox"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of The Musk Ox":"The air date of The Musk Ox is 2020-07-16."}}},
{"id":"n-37d3593c","guard":[["hasAny",["air","date","men","mice"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of Of Mice And Men":"The air date of Of Mice And Men is 2018-07-19."}}},
{"id":"n-40237101","guard":[["has","knifes"],["has","air"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Knife's Edge":"The air date of The Knife's Edge is 2016-04-28."}}},
{"id":"n-47e4c6fa","guard":[["hasAny",["air","date","famine","feast"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Of Feast & Famine":"The air date of Of Feast & Famine is 2017-01-26."}}},
{"id":"n-4a9907ed","guard":[["hasAny",["after","air","date","rescue"]],["has","rescue"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of After the Rescue":"The air date of After the Rescue is 2015-08-05."}}},
{"id":"n-4d3aca29","guard":[["hasAny",["fear","talons"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Talons of Fear":"The air date of The Talons of Fear is 2015-07-02."}}},
{"id":"n-4db258a4","guard":[["has","triumph"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Triumph":"The air date of Triumph is 2015-08-20."}}},
{"id":"n-50ef6fa4","guard":[["has","snared"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Snared":"The air date of Snared is 2020-07-23."}}},
{"id":"n-51f0113f","guard":[["hasAny",["air","date","needles","pins"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Pins and Needles":"The air date of Pins and Needles is 2020-08-13."}}},
{"id":"n-5ceedf51","guard":[["has","ascent"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of The Ascent":"The air date of The Ascent is 2016-06-16."}}},
{"id":"n-618d4bd9","guard":[["has","fury"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of Winter's Fury":"The air date of Winter's Fury is 2016-07-07."}}},
{"id":"n-624f1ff9","guard":[["has","smoke"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Up In Smoke":"The air date of Up In Smoke is 2020-07-30."}}},
{"id":"n-6c6b739f","guard":[["has","out"],["has","cold"],["has","air"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Out Cold":"The air date of Out Cold is 2019-08-01."}}},
{"id":"n-75cbf7ca","guard":[["has","beaver"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for The Beaver":"The air date of The Beaver is 2022-06-16."}}},
{"id":"n-82544fc0","guard":[["has","fly"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Fly":"The air date of The Fly is 2020-07-02."}}},
{"id":"n-827a5abf","guard":[["has","flesh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Flesh and Blood":"The air date of Flesh and Blood is 2017-08-17."}}},
{"id":"n-85afe9a1","guard":[["has","hunted"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for The Hunted":"The air date of The Hunted is 2021-06-03."}}},
{"id":"n-86dbaa5b","guard":[["has","weasel"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for The Weasel":"The air date of The Weasel is 2022-06-30."}}},
{"id":"n-8853ef60","guard":[["hasAny",["point","return"]],["words>=",11]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of The Point of No Return":"The air date of The Point of No Return is 2017-02-02."}}},
{"id":"n-91046c83","guard":[["has","grizzly"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Grizzly":"The air date of The Grizzly is 2021-07-22."}}},
{"id":"n-994d2d37","guard":[["hasAny",["air","date","feeling","gut"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Gut Feeling":"The air date of Gut Feeling is 2022-07-14."}}},
{"id":"n-9d301e7f","guard":[["has","over"],["has","air"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Over the Edge":"The air date of Over the Edge is 2020-08-20."}}},
{"id":"n-9e41c1dc","guard":[["has","madness"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Madness":"The air date of The Madness is 2016-06-23."}}},
{"id":"n-9ec751ea","guard":[["hasAny",["drop","shock"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Drop Shock":"The air date of Drop Shock is 2022-05-26."}}},
{"id":"n-a086bba0","guard":[["has","gamble"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for The Gamble":"The air date of The Gamble is 2016-06-30."}}},
{"id":"n-a0c19544","guard":[["has","grasp"],["has","air"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Winter's Grasp":"The air date of Winter's Grasp is 2022-07-28."}}},
{"id":"n-a2611dd7","guard":[["has","raider"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Night Raider":"The air date of Night Raider is 2019-07-25."}}},
{"id":"n-a31f839b","guard":[["hasAny",["air","date","rising","storm"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Storm Rising":"The air date of Storm Rising is 2016-05-19."}}},
{"id":"n-a9b1a246","guard":[["hasAny",["air","date","thicker","water"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of Thicker Than Water":"The air date of Thicker Than Water is 2017-07-20."}}},
{"id":"n-ab9dba9a","guard":[["has","smoked"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Smoked":"The air date of Smoked is 2021-07-08."}}},
{"id":"n-abe09ef4","guard":[["hasAny",["air","date","ii","slayer"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Slayer II":"The air date of Slayer II is 2018-08-02."}}},
{"id":"n-b0db3eb4","guard":[["has","wolves"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Wolves":"The air date of The Wolves is 2020-08-06."}}},
{"id":"n-b1a802d3","guard":[["has","trial"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Trial By Fire":"The air date of Trial By Fire is 2016-06-09."}}},
{"id":"n-b73c7749","guard":[["has","icebreaker"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Icebreaker":"The air date of Icebreaker is 2019-06-06."}}},
{"id":"n-bb41b549","guard":[["hasAny",["air","date","last","mile"]],["has","mile"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for The Last Mile":"The air date of The Last Mile is 2017-07-06."}}},
{"id":"n-bc354278","guard":[["has","bowels"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of The Bowels Of Hell":"The air date of The Bowels Of Hell is 2018-07-12."}}},
{"id":"n-bf9fc93f","guard":[["has","redemption"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Redemption":"The air date of Redemption is 2018-06-14."}}},
{"id":"n-c01229de","guard":[["has","tainted"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Tainted":"The air date of Tainted is 2019-06-13."}}},
{"id":"n-c4c9a026","guard":[["hasAny",["desperate","measures"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Desperate Measures":"The air date of Desperate Measures is 2018-07-26."}}},
{"id":"n-c9684e37","guard":[["has","haunting"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Haunting":"The air date of The Haunting is 2018-06-21."}}},
{"id":"n-cac342c4","guard":[["hasAny",["air","date","mongolias","wrath"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Mongolia's Wrath":"The air date of Mongolia's Wrath is 2018-07-05."}}},
{"id":"n-cc2f887a","guard":[["has","hunger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Hunger":"The air date of The Hunger is 2015-07-30."}}},
{"id":"n-ce3d9ead","guard":[["has","thin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Thin Ice":"The air date of Thin Ice is 2019-08-15."}}},
{"id":"n-ce601f98","guard":[["hasAny",["air","date","error","margin"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Margin of Error":"The air date of Margin of Error is 2017-06-29."}}},
{"id":"n-ce7fb28f","guard":[["hasAny",["air","darkness","date","eternal"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Eternal Darkness":"The air date of Eternal Darkness is 2016-12-22."}}},
{"id":"n-d1ee163d","guard":[["has","flareup"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Flare-Up":"The air date of Flare-Up is 2017-08-03."}}},
{"id":"n-d4a5d8b2","guard":[["has","winds"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Winds of Hell":"The air date of Winds of Hell is 2015-07-16."}}},
{"id":"n-d50ffb0b","guard":[["hasAny",["air","brokedown","date","palace"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the air date for Brokedown Palace":"The air date of Brokedown Palace is 2015-08-13."}}},
{"id":"n-d5489c8e","guard":[["has","moose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of The Moose":"The air date of The Moose is 2019-06-27."}}},
{"id":"n-e03dc62e","guard":[["has","chewed"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of Chewed Up":"The air date of Chewed Up is 2021-06-17."}}},
{"id":"n-ebb25176","guard":[["has","flames"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of Up In Flames":"The air date of Up In Flames is 2019-06-20."}}},
{"id":"n-ef050ff0","guard":[["hasAny",["double","nothing"]],["words>=",11]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Double or Nothing":"The air date of Double or Nothing is 2017-07-13."}}},
{"id":"n-f03b574b","guard":[["has","kill"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title The Kill":"The air date of The Kill is 2019-07-11."}}},
{"id":"n-f1a76c06","guard":[["has","hooked"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the air date of the title Hooked":"The air date of Hooked is 2017-07-27."}}},
{"id":"n-f3ccbed2","guard":[["has","first"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of First Blood":"The air date of First Blood is 2016-12-15."}}},
{"id":"n-fcc1c730","guard":[["hasAny",["air","breach","date","more","once","unto"]],["has","air"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the air date of Once More Unto the Breach":"The air date of Once More Unto the Breach is 2016-04-21."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"tell me the air date of the title Cold War","expect":{"contains":["2018-08-16"],"notRefusal":true}},{"q":"what is the air date of Once More Unto the Breach","expect":{"contains":["2016-04-21"],"notRefusal":true}},{"q":"give the air date for Stalked","expect":{"contains":["2015-07-09"],"notRefusal":true}},{"q":"what is the air date of First Blood","expect":{"contains":["2016-12-15"],"notRefusal":true}},{"q":"give the air date for The Weasel","expect":{"contains":["2022-06-30"],"notRefusal":true}},{"q":"what is the air date of After the Rescue","expect":{"contains":["2015-08-05"],"notRefusal":true}},{"q":"give the air date for The Gamble","expect":{"contains":["2016-06-30"],"notRefusal":true}},{"q":"give the air date for Storm Rising","expect":{"contains":["2016-05-19"],"notRefusal":true}},{"q":"tell me the air date of the title Winter's Grasp","expect":{"contains":["2022-07-28"],"notRefusal":true}},{"q":"tell me the air date of the title The Kill","expect":{"contains":["2019-07-11"],"notRefusal":true}},{"q":"give the air date for The Beaver","expect":{"contains":["2022-06-16"],"notRefusal":true}},{"q":"what is the air date of Fire and Ice","expect":{"contains":["2019-08-22"],"notRefusal":true}},{"q":"give the air date for Snared","expect":{"contains":["2020-07-23"],"notRefusal":true}},{"q":"tell me the air date of the title The Ice Cometh","expect":{"contains":["2019-08-08"],"notRefusal":true}},{"q":"tell me the air date of the title Of Wolf and Man","expect":{"contains":["2015-06-25"],"notRefusal":true}},{"q":"tell me the air date of the title The Wolves","expect":{"contains":["2020-08-06"],"notRefusal":true}},{"q":"give the air date for Gut Feeling","expect":{"contains":["2022-07-14"],"notRefusal":true}},{"q":"what is the air date of Thicker Than Water","expect":{"contains":["2017-07-20"],"notRefusal":true}},{"q":"tell me the air date of the title Out Cold","expect":{"contains":["2019-08-01"],"notRefusal":true}},{"q":"what is the air date of The Musk Ox","expect":{"contains":["2020-07-16"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
