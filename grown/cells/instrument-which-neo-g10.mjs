// instrument-which-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"instrument-which-neo-g10","class":"instrument-which","generation":10,"lane":"neo","grownFrom":["which of these is a musical instrument: screwdriver, table or violin","among curtain, lamp or melodica, which one is a musical instrument","which of these is a musical instrument: vase, pan flute or kettle","among clavichord, screwdriver or backpack, which one is a musical instrument","pick a musical instrument from pipe organ, stapler or plate","among saxaphone, blanket or stapler, which one is a musical instrument","which of these is a musical instrument: sousaphone, fork or sponge","among sponge, backpack or ukulele, which one is a musical instrument","among fork, guitar or table, which one is a musical instrument","which of these is a musical instrument: umbrella, bagpipe or refrigerator","pick a musical instrument from baby grand piano, chair or table","pick a musical instrument from notebook, toaster or piano","which of these is a musical instrument: vase, dulcimer or eraser","among doormat, dobro or vase, which one is a musical instrument","pick a musical instrument from bathtub, xylophone or notebook","among lamp, bugle or plate, which one is a musical instrument","which of these is a musical instrument: wrench, flute or candle","pick a musical instrument from vuvuzela, wrench or vase","among broom, doormat or lyre, which one is a musical instrument","among cup, chair or French horn, which one is a musical instrument"],"version":1});

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
knowLoad([{"id":"corpora-instruments","columns":["item","member"],"n":89,"cols":[{"s":"accordion|air horn|baby grand piano|bagpipe|banjo|bass guitar|bassoon|bugle|calliope|cello|clarinet|clavichord|concertina|didgeridoo|dobro|dulcimer|fiddle|fife|flugelhorn|flute|French horn|glockenspiel|grand piano|guitar|harmonica|harp|harpsichord|hurdy-gurdy|kazoo|kick drum|lute|lyre|mandolin|marimba|mellotran|melodica|oboe|pan flute|piano|piccolo|pipe organ|saxaphone|sitar|sousaphone|tambourine|theremin|trombone|tuba|ukulele|viola|violin|vuvuzela|washtub bass|xylophone|zither|table|chair|lamp|pillow|blanket|toaster|kettle|fork|plate|cup|broom|mop|sofa|mirror|curtain|doormat|towel|sponge|ladder|hammer|screwdriver|wrench|stapler|pencil|eraser|notebook|umbrella|wallet|backpack|candle|vase|bathtub|shovel|refrigerator","sep":"|"},{"d":"yes|no","r":"0*1j,1*y","sep":"|"}]}]);
const COLONY = [
{"id":"n-c9c455a1","guard":[["hasAny",["element","instrument","item number","nth","position"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}]],"mem":null},
{"id":"n-16708b35","guard":[["hasAny",["element","instrument","item number","nth","position"]],["has","or"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical instrument."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}]],"mem":null},
{"id":"n-82fa623d","guard":[["hasAny",["all caps","capital letters","capitals","element","instrument","item number","nth","position","upper case","uppercase"]],["has","or"]],"pyramid":["render.str",["transform.upper",["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}]]],"mem":null},
{"id":"n-bdf42523","guard":[["hasAny",["element","instrument","item number","lower case","lowercase","nth","position","small letters"]],["has","or"]],"pyramid":["render.str",["transform.lower",["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}]]],"mem":null},
{"id":"n-e03fffa9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","instrument","item number","nth","position","title case"]],["has","or"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}]]],"mem":null},
{"id":"n-e19f4abe","guard":[["hasAny",["element","instrument","invert case","item number","nth","position","swap case","toggle case"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}]]],"mem":null},
{"id":"n-c9c69b62","guard":[["has","instrument"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a musical instrument: screwdriver, table or violin":"violin is a musical instrument.","among curtain, lamp or melodica, which one is a musical instrument":"melodica is a musical instrument.","which of these is a musical instrument: vase, pan flute or kettle":"pan flute is a musical instrument.","among clavichord, screwdriver or backpack, which one is a musical instrument":"clavichord is a musical instrument.","pick a musical instrument from pipe organ, stapler or plate":"pipe organ is a musical instrument.","among saxaphone, blanket or stapler, which one is a musical instrument":"saxaphone is a musical instrument.","which of these is a musical instrument: sousaphone, fork or sponge":"sousaphone is a musical instrument.","among sponge, backpack or ukulele, which one is a musical instrument":"ukulele is a musical instrument.","among fork, guitar or table, which one is a musical instrument":"guitar is a musical instrument.","which of these is a musical instrument: umbrella, bagpipe or refrigerator":"bagpipe is a musical instrument.","pick a musical instrument from baby grand piano, chair or table":"baby grand piano is a musical instrument.","pick a musical instrument from notebook, toaster or piano":"piano is a musical instrument.","which of these is a musical instrument: vase, dulcimer or eraser":"dulcimer is a musical instrument.","among doormat, dobro or vase, which one is a musical instrument":"dobro is a musical instrument.","pick a musical instrument from bathtub, xylophone or notebook":"xylophone is a musical instrument.","among lamp, bugle or plate, which one is a musical instrument":"bugle is a musical instrument.","which of these is a musical instrument: wrench, flute or candle":"flute is a musical instrument.","pick a musical instrument from vuvuzela, wrench or vase":"vuvuzela is a musical instrument.","among broom, doormat or lyre, which one is a musical instrument":"lyre is a musical instrument.","among cup, chair or French horn, which one is a musical instrument":"French horn is a musical instrument.","which of these is a musical instrument: calliope, screwdriver or doormat":"calliope is a musical instrument.","among concertina, candle or chair, which one is a musical instrument":"concertina is a musical instrument.","which of these is a musical instrument: viola, plate or broom":"viola is a musical instrument.","which of these is a musical instrument: grand piano, sofa or hammer":"grand piano is a musical instrument.","which of these is a musical instrument: sponge, washtub bass or sofa":"washtub bass is a musical instrument.","pick a musical instrument from pillow, lute or toaster":"lute is a musical instrument.","among stapler, harp or hammer, which one is a musical instrument":"harp is a musical instrument.","pick a musical instrument from fork, broom or hurdy-gurdy":"hurdy-gurdy is a musical instrument.","which of these is a musical instrument: clarinet, blanket or broom":"clarinet is a musical instrument.","among sofa, harmonica or pillow, which one is a musical instrument":"harmonica is a musical instrument.","among wrench, marimba or shovel, which one is a musical instrument":"marimba is a musical instrument.","pick a musical instrument from wallet, screwdriver or bassoon":"bassoon is a musical instrument.","pick a musical instrument from mop, harpsichord or cup":"harpsichord is a musical instrument.","pick a musical instrument from sponge, cello or mirror":"cello is a musical instrument.","among screwdriver, glockenspiel or lamp, which one is a musical instrument":"glockenspiel is a musical instrument.","pick a musical instrument from ladder, eraser or oboe":"oboe is a musical instrument.","pick a musical instrument from notebook, mandolin or wallet":"mandolin is a musical instrument.","pick a musical instrument from stapler, refrigerator or piccolo":"piccolo is a musical instrument.","pick a musical instrument from blanket, accordion or pencil":"accordion is a musical instrument.","which of these is a musical instrument: refrigerator, sponge or theremin":"theremin is a musical instrument.","which of these is a musical instrument: curtain, banjo or sponge":"banjo is a musical instrument.","which of these is a musical instrument: toaster, eraser or kazoo":"kazoo is a musical instrument.","pick a musical instrument from blanket, kick drum or sponge":"kick drum is a musical instrument.","which of these is a musical instrument: blanket, toaster or didgeridoo":"didgeridoo is a musical instrument."}}},
{"id":"n-4e3575f3","guard":[["hasAny",["accordion","backpack","broom","candle","cello","curtain","doormat","element","eraser","fork","harp","harpsichord","item number","lamp","notebook","nth","pillow","position","refrigerator","reverse the words","reverse word order","saxaphone","screwdriver","toaster","words backwards","wrench"]],["has","or"]],"pyramid":["render.str",["transform.reverseWords",["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}]]],"mem":null},
{"id":"n-b6b8fbde","guard":[["hasAny",["accordion","backpack","broom","candle","cello","curtain","dashes","doormat","element","eraser","fork","harp","harpsichord","hyphens","item number","kebab case","kebabcase","lamp","notebook","nth","pillow","position","refrigerator","saxaphone","screwdriver","slug","toaster","wrench"]],["has","or"]],"pyramid":["render.str",["transform.kebab",["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}]]],"mem":null},
{"id":"n-01c1804d","guard":[["hasAny",["accordion","backpack","candle","cello","clarinet","class name","curtain","doormat","element","eraser","guitar","harp","harpsichord","item number","lamp","notebook","nth","pascal case","pascalcase","pillow","position","refrigerator","saxaphone","screwdriver","sousaphone","toaster","upper camel case","viola","wrench"]],["has","or"]],"pyramid":["render.str",["transform.pascal",["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}]]],"mem":null},
{"id":"n-429701a4","guard":[["hasAny",["accordion","backpack","candle","cello","clarinet","curtain","doormat","element","eraser","guitar","harp","harpsichord","item number","lamp","notebook","nth","pillow","position","refrigerator","saxaphone","screwdriver","snake case","snakecase","sousaphone","toaster","underscores","variable name","viola","wrench"]],["has","or"]],"pyramid":["render.str",["transform.snake",["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}]]],"mem":null},
{"id":"n-46d6752a","guard":[["hasAny",["accordion","backpack","candle","cello","clarinet","curtain","doormat","each word","element","eraser","guitar","harp","harpsichord","item number","lamp","notebook","nth","pillow","position","refrigerator","saxaphone","screwdriver","sousaphone","split into words","toaster","viola","words","wrench"]],["has","or"]],"pyramid":["render.and",["transform.words",["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}]]],"mem":null},
{"id":"n-4e5c5709","guard":[["hasAny",["accordion","backpack","camel case","camelcase","candle","cello","clarinet","curtain","doormat","element","eraser","guitar","harp","harpsichord","item number","lamp","lower camel case","notebook","nth","pillow","position","refrigerator","saxaphone","screwdriver","sousaphone","toaster","viola","wrench"]],["has","or"]],"pyramid":["render.str",["transform.camel",["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}]]],"mem":null},
{"id":"n-51270ad7","guard":[["hasAny",["accordion","backpack","candle","cello","clarinet","curtain","doormat","each word","element","eraser","guitar","harp","harpsichord","item number","lamp","notebook","nth","pillow","position","refrigerator","saxaphone","screwdriver","sousaphone","split into words","toaster","viola","words","wrench"]],["has","or"]],"pyramid":["render.list",["transform.words",["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}]]],"mem":null},
{"id":"n-deb6b95e","guard":[["hasAny",["accordion","backpack","candle","cello","clarinet","curtain","doormat","each word","element","eraser","guitar","harp","harpsichord","item number","lamp","notebook","nth","pillow","position","refrigerator","saxaphone","screwdriver","sousaphone","split into words","toaster","viola","words","wrench"]],["has","or"]],"pyramid":["render.lines",["transform.words",["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}]]],"mem":null},
{"id":"n-6fddbf9a","guard":[["hasAny",["blanket","broom","cello","curtain","element","eraser","fork","french","hammer","item number","longest","longest one","longest word","notebook","nth","piano","plate","position","sofa","toaster","ukulele","vase","wrench"]],["has","or"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-579dbfd8","guard":[["has","instrument"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"instrument"}]]],"mem":{"table":{"screwdriver, table or violin":"violin is a musical instrument.","vase, pan flute or kettle":"pan flute is a musical instrument.","from pipe organ, stapler or plate":"pipe organ is a musical instrument.","sousaphone, fork or sponge":"sousaphone is a musical instrument.","umbrella, bagpipe or refrigerator":"bagpipe is a musical instrument.","from baby grand piano, chair or table":"baby grand piano is a musical instrument.","from notebook, toaster or piano":"piano is a musical instrument.","vase, dulcimer or eraser":"dulcimer is a musical instrument.","from bathtub, xylophone or notebook":"xylophone is a musical instrument.","wrench, flute or candle":"flute is a musical instrument.","from vuvuzela, wrench or vase":"vuvuzela is a musical instrument.","calliope, screwdriver or doormat":"calliope is a musical instrument.","viola, plate or broom":"viola is a musical instrument.","grand piano, sofa or hammer":"grand piano is a musical instrument.","sponge, washtub bass or sofa":"washtub bass is a musical instrument.","from pillow, lute or toaster":"lute is a musical instrument.","from fork, broom or hurdy-gurdy":"hurdy-gurdy is a musical instrument.","clarinet, blanket or broom":"clarinet is a musical instrument.","from wallet, screwdriver or bassoon":"bassoon is a musical instrument.","from mop, harpsichord or cup":"harpsichord is a musical instrument.","from sponge, cello or mirror":"cello is a musical instrument.","from ladder, eraser or oboe":"oboe is a musical instrument.","from notebook, mandolin or wallet":"mandolin is a musical instrument.","from stapler, refrigerator or piccolo":"piccolo is a musical instrument.","from blanket, accordion or pencil":"accordion is a musical instrument.","refrigerator, sponge or theremin":"theremin is a musical instrument.","curtain, banjo or sponge":"banjo is a musical instrument.","toaster, eraser or kazoo":"kazoo is a musical instrument.","from blanket, kick drum or sponge":"kick drum is a musical instrument.","blanket, toaster or didgeridoo":"didgeridoo is a musical instrument."}}},
{"id":"n-d228bc53","guard":[["hasAny",["bathtub","blanket","chair","cup","dulcimer","fork","kettle","lamp","longest","longest one","longest word","marimba","plate","sofa","vuvuzela"]],["has","or"],["has","a"]],"pyramid":["render.str",["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]],"mem":null},
{"id":"n-144e43a0","guard":[["hasAny",["bathtub","blanket","capitalise","capitalize","capitalize each word","chair","cup","dulcimer","fork","kettle","lamp","longest","longest one","longest word","marimba","plate","sofa","title case","vuvuzela"]],["has","or"],["has","a"]],"pyramid":["render.str",["transform.title",["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-27d7f49b","guard":[["hasAny",["bathtub","blanket","chair","cup","dulcimer","fork","kettle","lamp","longest","longest one","longest word","lower case","lowercase","marimba","plate","small letters","sofa","vuvuzela"]],["has","or"],["has","a"]],"pyramid":["render.str",["transform.lower",["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-2fb56793","guard":[["hasAny",["bathtub","blanket","chair","cup","dulcimer","fork","invert case","kettle","lamp","longest","longest one","longest word","marimba","plate","sofa","swap case","toggle case","vuvuzela"]],["has","or"],["has","a"]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-5d529caa","guard":[["hasAny",["all caps","bathtub","blanket","capital letters","capitals","chair","cup","dulcimer","fork","kettle","lamp","longest","longest one","longest word","marimba","plate","sofa","upper case","uppercase","vuvuzela"]],["has","or"],["has","a"]],"pyramid":["render.str",["transform.upper",["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-9e262942","guard":[["hasAny",["a to z","alphabetical","alphabetize","bathtub","blanket","chair","cup","dulcimer","fork","kettle","lamp","longest","longest one","longest word","mandolin","marimba","organ","sofa","vuvuzela"]],["has","or"],["has","a"]],"pyramid":["render.str",["aggregate.longest",["transform.sortStrs",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-8021a91e","guard":[["hasAny",["backwards","bathtub","blanket","chair","cup","dulcimer","fork","glockenspiel","kettle","longest","longest one","longest word","mandolin","marimba","melodica","organ","reverse","reverse order","reversed","sofa","vuvuzela"]],["has","or"],["has","a"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-67eb27ae","guard":[["hasAny",["bathtub","blanket","dulcimer","fork","french","grand","kettle","longest","longest one","longest word","marimba","melodica","plate","sofa","vuvuzela"]],["has","or"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2cb9b676","guard":[["hasAny",["accordion","bathtub","clarinet","concertina","drum","dulcimer","first n","glockenspiel","grand","guitar","harpsichord","kettle","longest","longest one","longest word","marimba","plate","saxaphone","sofa","sousaphone","top","vuvuzela"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-b52a1a50","guard":[["hasAny",["accordion","backwards","bagpipe","banjo","bass","bathtub","bugle","capitalise","capitalize","capitalize each word","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","mirror","nth","pillow","position","reverse","reversed","spell backwards","title case"]]],"pyramid":["render.str",["transform.reverse",["transform.title",["transform.reverse",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]]],"mem":null},
{"id":"n-f3a1941c","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position"]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],"mem":null},
{"id":"n-1fc33be3","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","capitalise","capitalize","capitalize each word","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","title case"]]],"pyramid":["render.str",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-cdedac32","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harp","harpsichord","invert case","item number","mandolin","marimba","nth","pillow","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-c3563b97","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","capitalise","capitalize","capitalize each word","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harp","harpsichord","invert case","item number","mandolin","marimba","nth","pillow","position","swap case","title case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-0a06cdfd","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harp","harpsichord","how many words","item number","mandolin","marimba","nth","number of words","pillow","position","word count"]]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-38e78ec6","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harp","harpsichord","how many words","item number","mandolin","marimba","nth","number of words","pillow","position","word count"]]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-4c50511f","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harp","harpsichord","how many words","item number","mandolin","marimba","nth","number of words","pillow","position","word count"]]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-c858ae8c","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harp","harpsichord","how many words","item number","mandolin","marimba","nth","number of words","pillow","position","word count"]]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-c8c1dcef","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harp","harpsichord","how many words","item number","mandolin","marimba","nth","number of words","pillow","position","word count"]]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-edffef3e","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harp","harpsichord","how many words","item number","mandolin","marimba","nth","number of words","pillow","position","word count"]]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-a2b9245f","guard":[["hasAny",["accordion","backwards","bagpipe","banjo","bathtub","bugle","dobro","dulcimer","element","flute","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","mirror","normalise","normalize","nth","pillow","position","reverse","reversed","simplify the text","spell backwards"]]],"pyramid":["render.str",["transform.reverse",["transform.norm",["transform.reverse",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],{"lit":3}]]],"mem":null},
{"id":"n-2b124e11","guard":[["hasAny",["accordion","bathtub","clarinet","concertina","dashes","didgeridoo","dulcimer","fork","harmonica","harpsichord","hyphens","kebab case","kebabcase","lamp","longest","longest one","longest word","marimba","saxaphone","slug","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.kebab",["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-2db44429","guard":[["hasAny",["accordion","bathtub","clarinet","concertina","didgeridoo","dulcimer","fork","harmonica","harpsichord","lamp","longest","longest one","longest word","marimba","reverse the words","reverse word order","saxaphone","viola","vuvuzela","words backwards"]],["has","or"]],"pyramid":["render.str",["transform.reverseWords",["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-858944ff","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","cello","delete","dobro","drum","dulcimer","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":"flute"}]],"mem":null},
{"id":"n-f15c6d28","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":"flute"}]],"mem":null},
{"id":"n-737a3564","guard":[["hasAny",["accordion","bathtub","bugle","cello","change to","didgeridoo","dobro","drum","element","glockenspiel","guitar","harp","harpsichord","item number","kazoo","mandolin","marimba","nth","pillow","position","replace","substitute","swap","theremin","violin"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-74e58729","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harmonica","harpsichord","item number","leading zeros","mandolin","marimba","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":5},["sense.subject"]]],"mem":null},
{"id":"n-96a88c5e","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harmonica","harpsichord","item number","leading zeros","mandolin","marimba","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":5},["sense.lastWord"]]],"mem":null},
{"id":"n-aa28f59e","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","cello","characters from","dobro","drum","dulcimer","element","flute","guitar","harp","item number","letters from to","mandolin","marimba","nth","pillow","position","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-e93cfbf1","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harmonica","harpsichord","item number","leading zeros","mandolin","marimba","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-28ae92d2","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harmonica","harpsichord","item number","leading zeros","mandolin","marimba","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":5},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-8b804066","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harmonica","harpsichord","item number","leading zeros","mandolin","marimba","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":5},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-dd99f5b1","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harmonica","harpsichord","item number","leading zeros","mandolin","marimba","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":5},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-19bd624f","guard":[["hasAny",["accordion","bathtub","clarinet","concertina","didgeridoo","dulcimer","each word","guitar","harmonica","harpsichord","lamp","longest","longest one","longest word","marimba","saxaphone","sousaphone","split into words","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.lines",["transform.words",["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-2f494cf6","guard":[["hasAny",["accordion","bathtub","clarinet","concertina","didgeridoo","dulcimer","each word","guitar","harmonica","harpsichord","lamp","longest","longest one","longest word","marimba","saxaphone","sousaphone","split into words","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.list",["transform.words",["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-456fed1c","guard":[["hasAny",["accordion","bathtub","clarinet","concertina","didgeridoo","dulcimer","each word","guitar","harmonica","harpsichord","lamp","longest","longest one","longest word","marimba","saxaphone","sousaphone","split into words","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.and",["transform.words",["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-4fdef57f","guard":[["hasAny",["accordion","bathtub","clarinet","concertina","didgeridoo","dulcimer","guitar","harmonica","harpsichord","lamp","longest","longest one","longest word","marimba","saxaphone","snake case","snakecase","sousaphone","underscores","variable name","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.snake",["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-552cef52","guard":[["hasAny",["accordion","bathtub","clarinet","class name","concertina","didgeridoo","dulcimer","guitar","harmonica","harpsichord","lamp","longest","longest one","longest word","marimba","pascal case","pascalcase","saxaphone","sousaphone","upper camel case","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.pascal",["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-d07ef054","guard":[["hasAny",["accordion","bathtub","camel case","camelcase","clarinet","concertina","didgeridoo","dulcimer","guitar","harmonica","harpsichord","lamp","longest","longest one","longest word","lower camel case","marimba","saxaphone","sousaphone","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.camel",["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-0864ad7d","guard":[["hasAny",["bagpipe","banjo","bass","bathtub","bugle","cello","delete","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harp","item number","marimba","nth","pillow","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-14e0a7bc","guard":[["hasAny",["bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harp","item number","marimba","nth","pillow","position","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-8bd1ca57","guard":[["hasAny",["bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harp","item number","marimba","nth","pillow","position","separate by","split","split by"]]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-d9ac91f9","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","characters from","dobro","drum","dulcimer","element","flute","guitar","harp","item number","letters from to","mandolin","marimba","nth","pillow","position","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-dcee2dc7","guard":[["hasAny",["bagpipe","banjo","bass","bathtub","bugle","cello","dobro","drum","dulcimer","element","flute","glockenspiel","guitar","harp","item number","marimba","nth","pillow","position","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-c475dc9b","guard":[["hasAny",["accordion","bagpipe","bass","bathtub","cello","change to","cup","curtain","drum","dulcimer","element","flute","item number","lute","lyre","mandolin","nth","position","replace","substitute","swap","ukulele"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-7d36164c","guard":[["hasAny",["accordion","backwards","bagpipe","banjo","bathtub","bugle","class name","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","mirror","nth","pascal case","pascalcase","pillow","position","reverse","reversed","spell backwards","upper camel case"]]],"pyramid":["render.str",["transform.reverse",["transform.pascal",["transform.reverse",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]]],"mem":null},
{"id":"n-d0e5a0e2","guard":[["hasAny",["accordion","backwards","bagpipe","banjo","bathtub","bugle","camel case","camelcase","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","item number","lower camel case","mandolin","marimba","mirror","nth","pillow","position","reverse","reversed","spell backwards"]]],"pyramid":["render.str",["transform.reverse",["transform.camel",["transform.reverse",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]]],"mem":null},
{"id":"n-284a20a4","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dashes","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","hyphens","item number","kebab case","kebabcase","mandolin","marimba","nth","pillow","position","slug"]]],"pyramid":["render.str",["transform.kebab",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-4955e0e9","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","class name","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pascal case","pascalcase","pillow","position","upper camel case"]]],"pyramid":["render.str",["transform.pascal",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-49e9246d","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.str",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-7c1cd5eb","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","each word","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","split into words","words"]]],"pyramid":["render.list",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-80a880d7","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","each word","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","split into words","words"]]],"pyramid":["render.lines",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-a64ab244","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","snake case","snakecase","underscores","variable name"]]],"pyramid":["render.str",["transform.snake",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-ce2ee84c","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","camel case","camelcase","cello","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","item number","lower camel case","mandolin","marimba","nth","pillow","position"]]],"pyramid":["render.str",["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-d1191fb4","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","each word","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","split into words","words"]]],"pyramid":["render.and",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-03ceb040","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","invert case","item number","mandolin","marimba","nth","pillow","position","snake case","snakecase","swap case","toggle case","underscores","variable name"]]],"pyramid":["render.str",["transform.swapCase",["transform.snake",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-056c6b17","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","reverse the words","reverse word order","snake case","snakecase","underscores","variable name","words backwards"]]],"pyramid":["render.str",["transform.snake",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-05b2508e","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dashes","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","hyphens","invert case","item number","kebab case","kebabcase","mandolin","marimba","nth","pillow","position","slug","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["transform.kebab",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-0860e217","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","invert case","item number","mandolin","marimba","nth","pillow","position","reverse the words","reverse word order","swap case","toggle case","words backwards"]]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-0d8feac8","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","capitalise","capitalize","capitalize each word","cello","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","reverse the words","reverse word order","title case","words backwards"]]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-0f70dc9b","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","each word","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","shortest","shortest one","shortest word","split into words","words"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-1aca2711","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","camel case","camelcase","cello","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","item number","lower camel case","lower case","lowercase","mandolin","marimba","nth","pillow","position","small letters"]]],"pyramid":["render.str",["transform.lower",["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-1daca2cc","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","capitalise","capitalize","capitalize each word","cello","dashes","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","hyphens","item number","kebab case","kebabcase","mandolin","marimba","nth","pillow","position","slug","title case"]]],"pyramid":["render.str",["transform.title",["transform.kebab",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-39c2ea8e","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","class name","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","invert case","item number","mandolin","marimba","nth","pascal case","pascalcase","pillow","position","swap case","toggle case","upper camel case"]]],"pyramid":["render.str",["transform.swapCase",["transform.pascal",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-3c24a1e6","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","camel case","camelcase","cello","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","item number","lower camel case","mandolin","marimba","nth","pillow","position","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.str",["transform.camel",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-4039f9c2","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dashes","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","hyphens","item number","kebab case","kebabcase","mandolin","marimba","nth","pillow","position","reverse the words","reverse word order","slug","words backwards"]]],"pyramid":["render.str",["transform.kebab",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-4c7df109","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","each word","element","glockenspiel","guitar","harp","harpsichord","item number","longest","longest one","longest word","mandolin","marimba","nth","pillow","position","split into words","words"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-4d06cc42","guard":[["hasAny",["accordion","all caps","bagpipe","banjo","bathtub","bugle","camel case","camelcase","capital letters","capitals","cello","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","item number","lower camel case","mandolin","marimba","nth","pillow","position","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-4d6251ef","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","capitalise","capitalize","capitalize each word","cello","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","snake case","snakecase","title case","underscores","variable name"]]],"pyramid":["render.str",["transform.title",["transform.snake",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-67efd625","guard":[["hasAny",["accordion","backwards","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","each word","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","reverse","reverse order","reversed","split into words","words"]]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-71aebdf9","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","camel case","camelcase","capitalise","capitalize","capitalize each word","cello","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","item number","lower camel case","mandolin","marimba","nth","pillow","position","title case"]]],"pyramid":["render.str",["transform.title",["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-8e0fe096","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","capitalise","capitalize","capitalize each word","cello","dobro","dulcimer","each word","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","split into words","title case","words"]]],"pyramid":["render.and",["transform.words",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-91495d12","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","capitalise","capitalize","capitalize each word","cello","dobro","dulcimer","each word","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","split into words","title case","words"]]],"pyramid":["render.list",["transform.words",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-9c7f8014","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","capitalise","capitalize","capitalize each word","cello","dobro","dulcimer","each word","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","split into words","title case","words"]]],"pyramid":["render.lines",["transform.words",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-9c98d698","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","class name","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pascal case","pascalcase","pillow","position","reverse the words","reverse word order","upper camel case","words backwards"]]],"pyramid":["render.str",["transform.pascal",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-9df0fc14","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","each word","element","glockenspiel","guitar","harp","harpsichord","invert case","item number","mandolin","marimba","nth","pillow","position","split into words","swap case","toggle case","words"]]],"pyramid":["render.and",["transform.words",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-aab42d1e","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","camel case","camelcase","cello","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","invert case","item number","lower camel case","mandolin","marimba","nth","pillow","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-b19929cb","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","each word","element","glockenspiel","guitar","harp","harpsichord","invert case","item number","mandolin","marimba","nth","pillow","position","split into words","swap case","toggle case","words"]]],"pyramid":["render.list",["transform.words",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-c4524e1e","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","each word","element","glockenspiel","guitar","harp","harpsichord","invert case","item number","mandolin","marimba","nth","pillow","position","split into words","swap case","toggle case","words"]]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-d91ca3cb","guard":[["hasAny",["accordion","backwards","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","each word","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","reverse","reverse order","reversed","split into words","words"]]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-e643b09a","guard":[["hasAny",["accordion","backwards","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","each word","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","reverse","reverse order","reversed","split into words","words"]]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-06746254","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","how many words","item number","mandolin","marimba","nth","number of words","pillow","position","word count"]]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-9d049b8f","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","how many words","item number","mandolin","marimba","nth","number of words","pillow","position","word count"]]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-c70dcaea","guard":[["hasAny",["accordion","bagpipe","banjo","bathtub","bugle","cello","dobro","dulcimer","element","glockenspiel","guitar","harp","harpsichord","how many words","item number","mandolin","marimba","nth","number of words","pillow","position","word count"]]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-6bd032c2","guard":[["hasAny",["accordion","bathtub","cello","change to","cup","didgeridoo","drum","element","item number","kazoo","lute","lyre","mandolin","melodica","nth","position","replace","substitute","swap","theremin","ukulele","violin"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-40b556b1","guard":[["hasAny",["bagpipe","banjo","bass","calliope","clarinet","didgeridoo","dulcimer","element","flute","item number","kazoo","nth","of","position","sousaphone","theremin","viola","violin"]],["has","these"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," instrument."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-68cf118a","guard":[["hasAny",["element","item number","nth","pick","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-71bf6bbc","guard":[["hasAny",["element","item number","nth","pick","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," instrument."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ccfc2fd0","guard":[["hasAny",["bagpipe","banjo","bass","calliope","clarinet","didgeridoo","dulcimer","element","flute","item number","kazoo","nth","of","position","sousaphone","theremin","viola","violin"]],["has","these"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9db74398","guard":[["hasAny",["element","item number","nth","pick","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6f12e537","guard":[["hasAny",["element","item number","nth","pick","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-73fcb803","guard":[["hasAny",["element","item number","nth","pick","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-82cb0c77","guard":[["hasAny",["class name","element","item number","nth","pascal case","pascalcase","pick","position","upper camel case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b5bb2b8e","guard":[["hasAny",["bagpipe","banjo","bass","calliope","clarinet","didgeridoo","dulcimer","element","flute","item number","kazoo","nth","of","position","sousaphone","theremin","viola","violin"]],["has","these"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d0b9dbf7","guard":[["hasAny",["element","invert case","item number","nth","pick","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-23cd6d0b","guard":[["hasAny",["bagpipe","banjo","bass","calliope","clarinet","didgeridoo","dulcimer","element","first n","flute","item number","kazoo","nth","of","position","sousaphone","take","theremin","top","viola","violin"]],["has","these"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4d501680","guard":[["hasAny",["each word","element","item number","nth","pick","position","split into words","words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-73ff0db5","guard":[["hasAny",["each word","element","item number","nth","pick","position","split into words","words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-eff8d870","guard":[["hasAny",["bagpipe","banjo","bass","calliope","clarinet","didgeridoo","dulcimer","element","first n","flute","item number","kazoo","nth","of","position","sousaphone","take","theremin","top","viola","violin"]],["has","these"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3ff15d02","guard":[["has","instrument"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"from"}]]],"mem":{"table":{"pipe organ, stapler or plate":"pipe organ is a musical instrument.","baby grand piano, chair or table":"baby grand piano is a musical instrument.","notebook, toaster or piano":"piano is a musical instrument.","bathtub, xylophone or notebook":"xylophone is a musical instrument.","vuvuzela, wrench or vase":"vuvuzela is a musical instrument.","pillow, lute or toaster":"lute is a musical instrument.","fork, broom or hurdy-gurdy":"hurdy-gurdy is a musical instrument.","wallet, screwdriver or bassoon":"bassoon is a musical instrument.","mop, harpsichord or cup":"harpsichord is a musical instrument.","sponge, cello or mirror":"cello is a musical instrument.","ladder, eraser or oboe":"oboe is a musical instrument.","notebook, mandolin or wallet":"mandolin is a musical instrument.","stapler, refrigerator or piccolo":"piccolo is a musical instrument.","blanket, accordion or pencil":"accordion is a musical instrument.","blanket, kick drum or sponge":"kick drum is a musical instrument."}}},
{"id":"n-f388c698","guard":[["has","instrument"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"these is a musical instrument: screwdriver, table or violin":"violin is a musical instrument.","these is a musical instrument: vase, pan flute or kettle":"pan flute is a musical instrument.","these is a musical instrument: sousaphone, fork or sponge":"sousaphone is a musical instrument.","these is a musical instrument: umbrella, bagpipe or refrigerator":"bagpipe is a musical instrument.","these is a musical instrument: vase, dulcimer or eraser":"dulcimer is a musical instrument.","these is a musical instrument: wrench, flute or candle":"flute is a musical instrument.","these is a musical instrument: calliope, screwdriver or doormat":"calliope is a musical instrument.","these is a musical instrument: viola, plate or broom":"viola is a musical instrument.","these is a musical instrument: grand piano, sofa or hammer":"grand piano is a musical instrument.","these is a musical instrument: sponge, washtub bass or sofa":"washtub bass is a musical instrument.","these is a musical instrument: clarinet, blanket or broom":"clarinet is a musical instrument.","these is a musical instrument: refrigerator, sponge or theremin":"theremin is a musical instrument.","these is a musical instrument: curtain, banjo or sponge":"banjo is a musical instrument.","these is a musical instrument: toaster, eraser or kazoo":"kazoo is a musical instrument.","these is a musical instrument: blanket, toaster or didgeridoo":"didgeridoo is a musical instrument."}}},
{"id":"n-18128cb0","guard":[["hasAny",["accordion","bathtub","bugle","cello","dobro","drum","element","glockenspiel","guitar","harp","harpsichord","how many words","item number","mandolin","marimba","nth","number of words","pillow","position","word count"]]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-351c50a5","guard":[["hasAny",["accordion","bathtub","bugle","cello","change to","dobro","drum","element","glockenspiel","guitar","harp","harpsichord","item number","mandolin","marimba","nth","pillow","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-8320890e","guard":[["hasAny",["accordion","bathtub","bugle","cello","dobro","drum","element","glockenspiel","guitar","harp","harpsichord","how many words","item number","mandolin","marimba","nth","number of words","pillow","position","word count"]]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-fdee8921","guard":[["hasAny",["accordion","bathtub","bugle","cello","dobro","drum","element","glockenspiel","guitar","harp","harpsichord","how many words","item number","mandolin","marimba","nth","number of words","pillow","position","word count"]]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-e288c3a9","guard":[["hasAny",["among","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["sense.lastWord"]],"mem":null},
{"id":"n-fec17831","guard":[["hasAny",["among","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["sense.subject"]],"mem":null},
{"id":"n-7f6c8ca5","guard":[["hasAny",["among","camel case","camelcase","element","item number","lower camel case","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.camel",["sense.subject"]]],"mem":null},
{"id":"n-84455c70","guard":[["hasAny",["among","class name","element","item number","nth","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.pascal",["sense.lastWord"]]],"mem":null},
{"id":"n-b86f7def","guard":[["hasAny",["among","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-18c8d279","guard":[["hasAny",["among","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-a1cf2d3f","guard":[["hasAny",["among","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f31a3432","guard":[["hasAny",["among","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-94079688","guard":[["hasAny",["bagpipe","banjo","bass","bugle","delete","element","glockenspiel","guitar","harmonica","harp","item number","nth","position","remove","strip out","vase","without","wrench"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-949338b2","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","cello","cup","delete","drum","dulcimer","element","flute","item number","lute","mandolin","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["sense.after",{"lit":"instrument"}]]],"mem":null},
{"id":"n-69751413","guard":[["hasAny",["accordion","bagpipe","banjo","bass","bathtub","cello","change to","drum","dulcimer","element","flute","harpsichord","item number","lute","mandolin","nth","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-df968f33","guard":[["hasAny",["backpack","concertina","dobro","element","guitar","harmonica","harp","item number","lamp","lyre","marimba","nth","position","saxaphone"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," instrument."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-740a7925","guard":[["hasAny",["backpack","concertina","dobro","element","guitar","harmonica","harp","item number","lamp","lyre","marimba","nth","position","saxaphone"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.subject"]],"mem":null},
{"id":"n-ad491da2","guard":[["hasAny",["backpack","concertina","dobro","element","guitar","harmonica","harp","item number","lamp","lyre","marimba","nth","position","saxaphone"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-1d150968","guard":[["hasAny",["backpack","concertina","dobro","element","guitar","harmonica","harp","invert case","item number","lamp","lyre","marimba","nth","position","saxaphone","swap case","toggle case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c6347d2e","guard":[["hasAny",["backpack","concertina","dashes","dobro","element","guitar","harmonica","harp","hyphens","item number","kebab case","kebabcase","lamp","lyre","marimba","nth","position","saxaphone","slug"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.kebab",["sense.subject"]]],"mem":null},
{"id":"n-cb93d54c","guard":[["hasAny",["backpack","camel case","camelcase","concertina","dobro","element","guitar","harmonica","harp","item number","lamp","lower camel case","lyre","marimba","nth","position","saxaphone"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.camel",["sense.subject"]]],"mem":null},
{"id":"n-e24f2ed7","guard":[["hasAny",["backpack","class name","concertina","dobro","element","guitar","harmonica","harp","item number","lamp","lyre","marimba","nth","pascal case","pascalcase","position","saxaphone","upper camel case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.pascal",["sense.lastWord"]]],"mem":null},
{"id":"n-04f55e6f","guard":[["hasAny",["backpack","concertina","dobro","each word","element","guitar","harmonica","harp","item number","lamp","lyre","marimba","nth","position","saxaphone","split into words","words"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-175d028b","guard":[["hasAny",["backpack","concertina","dobro","each word","element","guitar","harmonica","harp","item number","lamp","lyre","marimba","nth","position","saxaphone","split into words","words"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-481b030e","guard":[["hasAny",["backpack","concertina","dobro","element","guitar","harmonica","harp","item number","lamp","lyre","marimba","nth","position","saxaphone"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-41f4d019","guard":[["hasAny",["clarinet","didgeridoo","dobro","dulcimer","from position","guitar","harmonica","harpsichord","items from to","lamp","longest","longest one","longest word","marimba","slice","sousaphone","viola"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]]],"mem":null},
{"id":"n-f01189e1","guard":[["hasAny",["backwards","bassoon","capitalise","capitalize","capitalize each word","didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","reverse","reversed","spell backwards","theremin","title case","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.reverse",["transform.title",["transform.reverse",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]]],"mem":null},
{"id":"n-1d690ec0","guard":[["hasAny",["bassoon","didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","theremin","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]],"mem":null},
{"id":"n-50330ec5","guard":[["hasAny",["bassoon","didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","lower case","lowercase","lyre","melodica","nth","piccolo","position","small letters","theremin","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.lower",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-60fde6f0","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","theremin","title case","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-891a369a","guard":[["hasAny",["bassoon","didgeridoo","element","french","hurdygurdy","invert case","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","swap case","theremin","toggle case","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-b65b0c57","guard":[["hasAny",["all caps","bassoon","capital letters","capitals","didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","theremin","ukulele","upper case","uppercase","violin"]],["has","or"]],"pyramid":["render.str",["transform.upper",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-225286ce","guard":[["hasAny",["bassoon","delete","didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","remove","strip out","theremin","ukulele","violin","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":"piano"}]],"mem":null},
{"id":"n-7c063920","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","didgeridoo","element","french","hurdygurdy","invert case","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","swap case","theremin","title case","toggle case","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-2dfdd9d3","guard":[["hasAny",["bassoon","didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","leading zeros","lyre","melodica","nth","pad","pad with","padded to","piccolo","position","theremin","ukulele","violin","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":4},["sense.text"]]],"mem":null},
{"id":"n-0baa126f","guard":[["hasAny",["bassoon","didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","leading zeros","lyre","melodica","nth","pad","pad with","padded to","piccolo","position","theremin","ukulele","violin","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-0d3983e7","guard":[["hasAny",["bassoon","didgeridoo","element","french","how many words","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","number of words","piccolo","position","theremin","ukulele","violin","word count"]],["has","or"]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-1970f4cf","guard":[["hasAny",["calliope","change to","clarinet","element","french","grand","item number","lyre","melodica","nth","organ","position","replace","sousaphone","substitute","swap","ukulele","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-31734862","guard":[["hasAny",["bassoon","didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","leading zeros","lyre","melodica","nth","pad","pad with","padded to","piccolo","position","theremin","ukulele","violin","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-828d1fad","guard":[["hasAny",["bassoon","didgeridoo","element","french","how many words","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","number of words","piccolo","position","theremin","ukulele","violin","word count"]]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-abf09c7b","guard":[["hasAny",["bassoon","didgeridoo","element","french","how many words","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","number of words","piccolo","position","theremin","ukulele","violin","word count"]],["has","or"]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-b982fb71","guard":[["hasAny",["bassoon","didgeridoo","element","french","how many words","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","number of words","piccolo","position","theremin","ukulele","violin","word count"]]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-c39a6d59","guard":[["hasAny",["bassoon","didgeridoo","element","french","how many words","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","number of words","piccolo","position","theremin","ukulele","violin","word count"]]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-e396abbc","guard":[["hasAny",["bassoon","didgeridoo","element","french","how many words","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","number of words","piccolo","position","theremin","ukulele","violin","word count"]],["has","or"]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-f467b13c","guard":[["hasAny",["bassoon","didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","leading zeros","lyre","melodica","nth","pad","pad with","padded to","piccolo","position","theremin","ukulele","violin","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-4caac685","guard":[["hasAny",["bassoon","delete","didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","remove","strip out","theremin","ukulele","violin","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-be71f69b","guard":[["hasAny",["bassoon","delete","didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","remove","strip out","theremin","ukulele","violin","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-d743c5dc","guard":[["hasAny",["accordion","baby","cello","drum","element","hurdygurdy","item number","ladder","longest","longest one","longest word","lute","notebook","nth","organ","position","vuvuzela"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["sense.wordAt",{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-db4359bf","guard":[["hasAny",["bassoon","delete","didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","remove","strip out","theremin","ukulele","violin","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-1f07ab33","guard":[["hasAny",["accordion","baby","cello","class name","drum","element","hurdygurdy","item number","ladder","longest","longest one","longest word","lute","notebook","nth","organ","pascal case","pascalcase","position","upper camel case","vuvuzela"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.pascal",["sense.wordAt",{"lit":3}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3fbc372e","guard":[["hasAny",["accordion","baby","cello","drum","element","hurdygurdy","item number","ladder","longest","longest one","longest word","lute","notebook","nth","organ","position","vuvuzela"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a5b9d891","guard":[["hasAny",["accordion","baby","cello","drum","element","hurdygurdy","invert case","item number","ladder","longest","longest one","longest word","lute","notebook","nth","organ","position","swap case","toggle case","vuvuzela"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.swapCase",["sense.wordAt",{"lit":3}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1cf95422","guard":[["hasAny",["accordion","baby","cello","drum","each word","element","hurdygurdy","item number","ladder","longest","longest one","longest word","lute","notebook","nth","organ","position","split into words","vuvuzela","words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-86f6092f","guard":[["hasAny",["accordion","baby","cello","drum","each word","element","hurdygurdy","item number","ladder","longest","longest one","longest word","lute","notebook","nth","organ","position","split into words","vuvuzela","words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3553460a","guard":[["hasAny",["bugle","clarinet","didgeridoo","dobro","dulcimer","glockenspiel","guitar","harmonica","harp","how many vowels","item number","marimba","nth","number of vowels","position","theremin","viola","vowel count"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-536c78f1","guard":[["hasAny",["backwards","calliope","capitalise","capitalize","capitalize each word","clarinet","clavichord","concertina","element","grand","item number","nth","organ","position","reverse","reversed","saxaphone","sousaphone","spell backwards","title case","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.reverse",["transform.title",["transform.reverse",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]]],"mem":null},
{"id":"n-9aa8b955","guard":[["hasAny",["backwards","bassoon","dashes","didgeridoo","element","hurdygurdy","hyphens","item number","kazoo","kebab case","kebabcase","ladder","lyre","melodica","nth","piccolo","position","reverse","reversed","slug","spell backwards","theremin","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.reverse",["transform.kebab",["transform.reverse",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]]],"mem":null},
{"id":"n-ebb282ff","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","item number","nth","organ","position","saxaphone","sousaphone","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]],"mem":null},
{"id":"n-0eb546bd","guard":[["hasAny",["bassoon","didgeridoo","element","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","reverse the words","reverse word order","theremin","ukulele","violin","words backwards"]],["has","or"]],"pyramid":["render.str",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-27a5b1d3","guard":[["hasAny",["bassoon","dashes","didgeridoo","element","hurdygurdy","hyphens","item number","kazoo","kebab case","kebabcase","ladder","lyre","melodica","nth","piccolo","position","slug","theremin","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.kebab",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-48f07ec8","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","invert case","item number","nth","organ","position","saxaphone","sousaphone","swap case","toggle case","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-78b3d677","guard":[["hasAny",["calliope","capitalise","capitalize","capitalize each word","clarinet","clavichord","concertina","element","grand","item number","nth","organ","position","saxaphone","sousaphone","title case","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-129f9423","guard":[["hasAny",["all caps","bassoon","capital letters","capitals","didgeridoo","element","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","reverse the words","reverse word order","theremin","ukulele","upper case","uppercase","violin","words backwards"]],["has","or"]],"pyramid":["render.str",["transform.reverseWords",["transform.upper",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-1afc4123","guard":[["hasAny",["bassoon","dashes","didgeridoo","element","hurdygurdy","hyphens","item number","kazoo","kebab case","kebabcase","ladder","lyre","melodica","nth","piccolo","position","reverse the words","reverse word order","slug","theremin","ukulele","violin","words backwards"]],["has","or"]],"pyramid":["render.str",["transform.kebab",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-2f0a1f11","guard":[["hasAny",["bassoon","didgeridoo","element","hurdygurdy","invert case","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","reverse the words","reverse word order","swap case","theremin","toggle case","ukulele","violin","words backwards"]],["has","or"]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-3785f470","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","didgeridoo","element","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","reverse the words","reverse word order","theremin","title case","ukulele","violin","words backwards"]],["has","or"]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-6fceda01","guard":[["hasAny",["bassoon","didgeridoo","element","hurdygurdy","item number","kazoo","ladder","lower case","lowercase","lyre","melodica","nth","piccolo","position","reverse the words","reverse word order","small letters","theremin","ukulele","violin","words backwards"]],["has","or"]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-7a09595b","guard":[["hasAny",["calliope","capitalise","capitalize","capitalize each word","clarinet","clavichord","concertina","element","grand","invert case","item number","nth","organ","position","saxaphone","sousaphone","swap case","title case","toggle case","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-de2a6d09","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","dashes","didgeridoo","element","hurdygurdy","hyphens","item number","kazoo","kebab case","kebabcase","ladder","lyre","melodica","nth","piccolo","position","slug","theremin","title case","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.title",["transform.kebab",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-f0c08af9","guard":[["hasAny",["bassoon","didgeridoo","element","french","item number","kazoo","ladder","lyre","melodica","normalise","normalize","nth","piccolo","position","simplify the text","theremin","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.norm",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":1}]],"mem":null},
{"id":"n-fa79202d","guard":[["hasAny",["bassoon","dashes","didgeridoo","element","hurdygurdy","hyphens","invert case","item number","kazoo","kebab case","kebabcase","ladder","lyre","melodica","nth","piccolo","position","slug","swap case","theremin","toggle case","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.kebab",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-29882f9e","guard":[["hasAny",["delete","didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","remove","strip out","theremin","ukulele","violin","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-41bed03e","guard":[["hasAny",["didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","separate by","split","split by","theremin","ukulele","violin"]],["has","or"]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-842935c2","guard":[["hasAny",["didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","separate by","split","split by","theremin","ukulele","violin"]],["has","or"]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-913cd88a","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","item number","leading zeros","nth","organ","pad","pad with","padded to","position","saxaphone","sousaphone","viola","vuvuzela","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":4},["sense.text"]]],"mem":null},
{"id":"n-b6f7568d","guard":[["hasAny",["bassoon","characters from","didgeridoo","element","french","item number","kazoo","ladder","letters from to","lyre","melodica","nth","piccolo","position","slice of the text","substring","theremin","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-b7bf9239","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","item number","leading zeros","nth","organ","pad","pad with","padded to","position","saxaphone","sousaphone","viola","vuvuzela","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-ba581a4f","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","item number","leading zeros","nth","organ","pad","pad with","padded to","position","saxaphone","sousaphone","viola","vuvuzela","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":5},["sense.lastWord"]]],"mem":null},
{"id":"n-c8a2456e","guard":[["hasAny",["didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","separate by","split","split by","theremin","ukulele","violin"]],["has","or"]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-e54dfbf7","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","item number","leading zeros","nth","organ","pad","pad with","padded to","position","saxaphone","sousaphone","viola","vuvuzela","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":5},["sense.subject"]]],"mem":null},
{"id":"n-edec27a2","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","item number","leading zeros","nth","organ","pad","pad with","padded to","position","saxaphone","sousaphone","viola","vuvuzela","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":4},["sense.lastWord"]]],"mem":null},
{"id":"n-03d43d72","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","how many words","item number","nth","number of words","organ","position","saxaphone","sousaphone","viola","vuvuzela","word count"]],["has","or"]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-18710135","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","item number","leading zeros","nth","organ","pad","pad with","padded to","position","saxaphone","sousaphone","viola","vuvuzela","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-46c240db","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","item number","leading zeros","nth","organ","pad","pad with","padded to","position","saxaphone","sousaphone","viola","vuvuzela","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-6605abd2","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","how many words","item number","nth","number of words","organ","position","saxaphone","sousaphone","viola","vuvuzela","word count"]]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-6c87d7fa","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","how many words","item number","nth","number of words","organ","position","saxaphone","sousaphone","viola","vuvuzela","word count"]],["has","or"]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-72c8d561","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","item number","leading zeros","nth","organ","pad","pad with","padded to","position","saxaphone","sousaphone","viola","vuvuzela","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-7fb90442","guard":[["hasAny",["baby","change to","didgeridoo","element","french","item number","kazoo","lyre","melodica","nth","organ","position","replace","substitute","swap","theremin","ukulele","violin","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-981c8bcf","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","how many words","item number","nth","number of words","organ","position","saxaphone","sousaphone","viola","vuvuzela","word count"]],["has","or"]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-9f4e17c2","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","how many words","item number","nth","number of words","organ","position","saxaphone","sousaphone","viola","vuvuzela","word count"]]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-a9448820","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","item number","leading zeros","nth","organ","pad","pad with","padded to","position","saxaphone","sousaphone","viola","vuvuzela","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-bf0216c4","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","item number","leading zeros","nth","organ","pad","pad with","padded to","position","saxaphone","sousaphone","viola","vuvuzela","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-c9e6752f","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","how many words","item number","nth","number of words","organ","position","saxaphone","sousaphone","viola","vuvuzela","word count"]]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-cb287449","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","item number","leading zeros","nth","organ","pad","pad with","padded to","position","saxaphone","sousaphone","viola","vuvuzela","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-ce4da06e","guard":[["hasAny",["bassoon","change to","didgeridoo","element","french","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","replace","substitute","swap","theremin","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-94ad10b9","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","delete","element","grand","item number","nth","organ","position","remove","saxaphone","sousaphone","strip out","viola","vuvuzela","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-9aab991e","guard":[["hasAny",["bugle","calliope","clarinet","dobro","glockenspiel","guitar","harmonica","harp","item number","marimba","nth","position","sousaphone","viola"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ce3c3024","guard":[["hasAny",["bugle","calliope","clarinet","dobro","glockenspiel","guitar","harmonica","harp","item number","marimba","nth","sousaphone","viola"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1e1c2b7a","guard":[["hasAny",["bugle","calliope","capitalise","capitalize","capitalize each word","clarinet","dobro","glockenspiel","guitar","harmonica","harp","item number","marimba","nth","position","sousaphone","title case","viola"]],["has","or"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-9a115b0e","guard":[["hasAny",["bugle","calliope","clarinet","dobro","glockenspiel","guitar","harmonica","harp","invert case","item number","marimba","nth","position","sousaphone","swap case","toggle case","viola"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-3fcac2bd","guard":[["hasAny",["clarinet","dobro","dulcimer","from position","guitar","harmonica","items from to","lamp","longest","longest one","longest word","marimba","slice","sousaphone","viola"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]]],"mem":null},
{"id":"n-bf3efc9b","guard":[["hasAny",["accordion","bathtub","didgeridoo","dulcimer","from position","harpsichord","items from to","longest","longest one","longest word","lyre","melodica","slice","theremin","ukulele","violin","vuvuzela"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]]],"mem":null},
{"id":"n-bf9dfb1b","guard":[["hasAny",["bugle","change to","didgeridoo","dobro","glockenspiel","guitar","harmonica","harp","kazoo","marimba","replace","substitute","swap","theremin","violin"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-146ebec0","guard":[["hasAny",["backwards","bassoon","class name","didgeridoo","element","item number","kazoo","ladder","lyre","melodica","nth","pascal case","pascalcase","piccolo","position","reverse","reversed","spell backwards","theremin","ukulele","upper camel case","violin"]],["has","or"]],"pyramid":["render.str",["transform.reverse",["transform.pascal",["transform.reverse",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]]],"mem":null},
{"id":"n-38ad37cb","guard":[["hasAny",["backwards","bassoon","didgeridoo","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","reverse","reversed","snake case","snakecase","spell backwards","theremin","ukulele","underscores","variable name","violin"]],["has","or"]],"pyramid":["render.str",["transform.reverse",["transform.snake",["transform.reverse",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]]],"mem":null},
{"id":"n-bdf55a3b","guard":[["hasAny",["backwards","bassoon","camel case","camelcase","didgeridoo","element","item number","kazoo","ladder","lower camel case","lyre","melodica","nth","piccolo","position","reverse","reversed","spell backwards","theremin","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.reverse",["transform.camel",["transform.reverse",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]]],"mem":null},
{"id":"n-940eda26","guard":[["hasAny",["backwards","bassoon","didgeridoo","element","item number","kazoo","ladder","lyre","melodica","normalise","normalize","nth","piccolo","position","reverse","reversed","simplify the text","spell backwards","theremin","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.reverse",["transform.norm",["transform.reverse",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]],{"lit":3}]]],"mem":null},
{"id":"n-1e8231c4","guard":[["hasAny",["bassoon","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","split into words","theremin","ukulele","violin","words"]],["has","or"]],"pyramid":["render.lines",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-30c21b95","guard":[["hasAny",["bassoon","camel case","camelcase","didgeridoo","element","item number","kazoo","ladder","lower camel case","lyre","melodica","nth","piccolo","position","theremin","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-558ba8c5","guard":[["hasAny",["bassoon","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","split into words","theremin","ukulele","violin","words"]],["has","or"]],"pyramid":["render.and",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-65a6b230","guard":[["hasAny",["bassoon","didgeridoo","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","snake case","snakecase","theremin","ukulele","underscores","variable name","violin"]],["has","or"]],"pyramid":["render.str",["transform.snake",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-aa60559b","guard":[["hasAny",["bassoon","class name","didgeridoo","element","item number","kazoo","ladder","lyre","melodica","nth","pascal case","pascalcase","piccolo","position","theremin","ukulele","upper camel case","violin"]],["has","or"]],"pyramid":["render.str",["transform.pascal",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-add1abb5","guard":[["hasAny",["bassoon","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","split into words","theremin","ukulele","violin","words"]],["has","or"]],"pyramid":["render.list",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-04e6f025","guard":[["hasAny",["backwards","bassoon","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","reverse","reverse order","reversed","split into words","theremin","ukulele","violin","words"]],["has","or"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-17bc7c98","guard":[["hasAny",["bassoon","didgeridoo","each word","element","invert case","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","split into words","swap case","theremin","toggle case","ukulele","violin","words"]],["has","or"]],"pyramid":["render.list",["transform.words",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-1a95ee28","guard":[["hasAny",["bassoon","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","reverse the words","reverse word order","split into words","theremin","ukulele","violin","words","words backwards"]],["has","or"]],"pyramid":["render.lines",["transform.words",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-1aa4c092","guard":[["hasAny",["bassoon","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","reverse the words","reverse word order","split into words","theremin","ukulele","violin","words","words backwards"]],["has","or"]],"pyramid":["render.and",["transform.words",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-1deb4407","guard":[["hasAny",["bassoon","dashes","didgeridoo","each word","element","hyphens","item number","kazoo","kebab case","kebabcase","ladder","lyre","melodica","nth","piccolo","position","slug","split into words","theremin","ukulele","violin","words"]],["has","or"]],"pyramid":["render.lines",["transform.words",["transform.kebab",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-2072dd61","guard":[["hasAny",["bassoon","camel case","camelcase","capitalise","capitalize","capitalize each word","didgeridoo","element","item number","kazoo","ladder","lower camel case","lyre","melodica","nth","piccolo","position","theremin","title case","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.title",["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-297d5d89","guard":[["hasAny",["bassoon","camel case","camelcase","didgeridoo","element","invert case","item number","kazoo","ladder","lower camel case","lyre","melodica","nth","piccolo","position","swap case","theremin","toggle case","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.camel",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-3fdf34f9","guard":[["hasAny",["bassoon","didgeridoo","each word","element","invert case","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","split into words","swap case","theremin","toggle case","ukulele","violin","words"]],["has","or"]],"pyramid":["render.and",["transform.words",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-41fddd82","guard":[["hasAny",["a to z","alphabetical","alphabetize","bassoon","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","split into words","theremin","ukulele","violin","words"]],["has","or"]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-433bf3e2","guard":[["hasAny",["bassoon","dashes","didgeridoo","each word","element","hyphens","item number","kazoo","kebab case","kebabcase","ladder","lyre","melodica","nth","piccolo","position","slug","split into words","theremin","ukulele","violin","words"]],["has","or"]],"pyramid":["render.and",["transform.words",["transform.kebab",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-51a78358","guard":[["hasAny",["bassoon","didgeridoo","element","invert case","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","snake case","snakecase","swap case","theremin","toggle case","ukulele","underscores","variable name","violin"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.snake",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-5a97c294","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","split into words","theremin","title case","ukulele","violin","words"]],["has","or"]],"pyramid":["render.list",["transform.words",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-5e81391f","guard":[["hasAny",["bassoon","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","shortest","shortest one","shortest word","split into words","theremin","ukulele","violin","words"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-64a738f9","guard":[["hasAny",["bassoon","class name","didgeridoo","element","invert case","item number","kazoo","ladder","lyre","melodica","nth","pascal case","pascalcase","piccolo","position","swap case","theremin","toggle case","ukulele","upper camel case","violin"]],["has","or"]],"pyramid":["render.str",["transform.pascal",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-704ab6ea","guard":[["hasAny",["bassoon","camel case","camelcase","didgeridoo","element","item number","kazoo","ladder","lower camel case","lyre","melodica","nth","piccolo","position","reverse the words","reverse word order","theremin","ukulele","violin","words backwards"]],["has","or"]],"pyramid":["render.str",["transform.camel",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-750a5261","guard":[["hasAny",["all caps","bassoon","camel case","camelcase","capital letters","capitals","didgeridoo","element","item number","kazoo","ladder","lower camel case","lyre","melodica","nth","piccolo","position","theremin","ukulele","upper case","uppercase","violin"]],["has","or"]],"pyramid":["render.str",["transform.upper",["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-8410b81f","guard":[["hasAny",["bassoon","dashes","didgeridoo","each word","element","hyphens","item number","kazoo","kebab case","kebabcase","ladder","lyre","melodica","nth","piccolo","position","slug","split into words","theremin","ukulele","violin","words"]],["has","or"]],"pyramid":["render.list",["transform.words",["transform.kebab",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-8afe0b8e","guard":[["hasAny",["a to z","alphabetical","alphabetize","bassoon","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","split into words","theremin","ukulele","violin","words"]],["has","or"]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-9d3f0c83","guard":[["hasAny",["backwards","bassoon","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","reverse","reverse order","reversed","split into words","theremin","ukulele","violin","words"]],["has","or"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-a5737f84","guard":[["hasAny",["all caps","bassoon","capital letters","capitals","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","split into words","theremin","ukulele","upper case","uppercase","violin","words"]],["has","or"]],"pyramid":["render.lines",["transform.words",["transform.upper",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-a73222a6","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","grand","item number","normalise","normalize","nth","position","saxaphone","simplify the text","sousaphone","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.norm",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":3}]],"mem":null},
{"id":"n-a7ec4e31","guard":[["hasAny",["bassoon","class name","didgeridoo","element","invert case","item number","kazoo","ladder","lyre","melodica","nth","pascal case","pascalcase","piccolo","position","swap case","theremin","toggle case","ukulele","upper camel case","violin"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.pascal",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-b03f3541","guard":[["hasAny",["bassoon","didgeridoo","each word","element","invert case","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","split into words","swap case","theremin","toggle case","ukulele","violin","words"]],["has","or"]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-b9713eb9","guard":[["hasAny",["all caps","bassoon","capital letters","capitals","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","split into words","theremin","ukulele","upper case","uppercase","violin","words"]],["has","or"]],"pyramid":["render.and",["transform.words",["transform.upper",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-c0d107a4","guard":[["hasAny",["backwards","bassoon","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","reverse","reverse order","reversed","split into words","theremin","ukulele","violin","words"]],["has","or"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-c89329e9","guard":[["hasAny",["bassoon","camel case","camelcase","didgeridoo","element","invert case","item number","kazoo","ladder","lower camel case","lyre","melodica","nth","piccolo","position","swap case","theremin","toggle case","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-c9510afa","guard":[["hasAny",["bassoon","class name","didgeridoo","element","item number","kazoo","ladder","lyre","melodica","nth","pascal case","pascalcase","piccolo","position","reverse the words","reverse word order","theremin","ukulele","upper camel case","violin","words backwards"]],["has","or"]],"pyramid":["render.str",["transform.pascal",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-c9aab5e0","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","didgeridoo","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","snake case","snakecase","theremin","title case","ukulele","underscores","variable name","violin"]],["has","or"]],"pyramid":["render.str",["transform.title",["transform.snake",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-ce4090b8","guard":[["hasAny",["bassoon","didgeridoo","each word","element","item number","kazoo","ladder","longest","longest one","longest word","lyre","melodica","nth","piccolo","position","split into words","theremin","ukulele","violin","words"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-d22fc288","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","split into words","theremin","title case","ukulele","violin","words"]],["has","or"]],"pyramid":["render.lines",["transform.words",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-d745e687","guard":[["hasAny",["all caps","bassoon","capital letters","capitals","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","split into words","theremin","ukulele","upper case","uppercase","violin","words"]],["has","or"]],"pyramid":["render.list",["transform.words",["transform.upper",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-df31530f","guard":[["hasAny",["a to z","alphabetical","alphabetize","bassoon","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","split into words","theremin","ukulele","violin","words"]],["has","or"]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-e83b81f2","guard":[["hasAny",["bassoon","didgeridoo","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","reverse the words","reverse word order","snake case","snakecase","theremin","ukulele","underscores","variable name","violin","words backwards"]],["has","or"]],"pyramid":["render.str",["transform.snake",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-eb33ac68","guard":[["hasAny",["bassoon","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","reverse the words","reverse word order","split into words","theremin","ukulele","violin","words","words backwards"]],["has","or"]],"pyramid":["render.list",["transform.words",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-eb636022","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","didgeridoo","each word","element","item number","kazoo","ladder","lyre","melodica","nth","piccolo","position","split into words","theremin","title case","ukulele","violin","words"]],["has","or"]],"pyramid":["render.and",["transform.words",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-ed1df5b5","guard":[["hasAny",["bassoon","camel case","camelcase","didgeridoo","element","item number","kazoo","ladder","lower camel case","lower case","lowercase","lyre","melodica","nth","piccolo","position","small letters","theremin","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.lower",["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-4ff1a5c0","guard":[["hasAny",["baby","change to","clavichord","concertina","didgeridoo","element","item number","kazoo","nth","organ","position","replace","saxaphone","substitute","swap","theremin","violin","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-533456a5","guard":[["hasAny",["bassoon","didgeridoo","element","french","hurdygurdy","item number","kazoo","leading zeros","melodica","nth","pad","pad with","padded to","piccolo","position","theremin","ukulele","violin","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-929f95bd","guard":[["hasAny",["bassoon","didgeridoo","element","french","hurdygurdy","item number","kazoo","leading zeros","melodica","nth","pad","pad with","padded to","piccolo","position","theremin","ukulele","violin","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":5},["sense.lastWord"]]],"mem":null},
{"id":"n-a3ded75c","guard":[["hasAny",["bassoon","characters from","didgeridoo","element","item number","kazoo","ladder","letters from to","lyre","melodica","nth","piccolo","position","slice of the text","substring","theremin","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-e8e2abd7","guard":[["hasAny",["bassoon","camel case","camelcase","didgeridoo","element","item number","kazoo","ladder","lower camel case","lyre","melodica","normalise","normalize","nth","piccolo","position","simplify the text","theremin","ukulele","violin"]],["has","or"]],"pyramid":["render.str",["transform.camel",["transform.norm",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":1}]]],"mem":null},
{"id":"n-08688d67","guard":[["hasAny",["bassoon","didgeridoo","element","french","hurdygurdy","item number","kazoo","leading zeros","melodica","nth","pad","pad with","padded to","piccolo","position","theremin","ukulele","violin","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-3151508a","guard":[["hasAny",["bassoon","didgeridoo","element","how many words","item number","kazoo","ladder","lyre","melodica","nth","number of words","piccolo","position","theremin","ukulele","violin","word count"]],["has","or"]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-3b58e6e9","guard":[["hasAny",["bassoon","didgeridoo","element","how many words","item number","kazoo","ladder","lyre","melodica","nth","number of words","piccolo","position","theremin","ukulele","violin","word count"]],["has","or"]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-a6c3f3f7","guard":[["hasAny",["bassoon","didgeridoo","element","french","hurdygurdy","item number","kazoo","leading zeros","melodica","nth","pad","pad with","padded to","piccolo","position","theremin","ukulele","violin","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-d2810bca","guard":[["hasAny",["bassoon","didgeridoo","element","french","hurdygurdy","item number","kazoo","leading zeros","melodica","nth","pad","pad with","padded to","piccolo","position","theremin","ukulele","violin","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-e3c4b2ab","guard":[["hasAny",["bassoon","didgeridoo","element","how many words","item number","kazoo","ladder","lyre","melodica","nth","number of words","piccolo","position","theremin","ukulele","violin","word count"]],["has","or"]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-12d51f1b","guard":[["hasAny",["banjo","bass","clarinet","didgeridoo","dulcimer","element","flute","item number","kazoo","longest","longest one","longest word","nth","position","sousaphone","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-18293cd7","guard":[["hasAny",["bugle","dobro","element","guitar","harmonica","harp","item number","longest","longest one","longest word","lyre","marimba","melodica","nth","position","saxaphone","ukulele"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c06e95ef","guard":[["hasAny",["banjo","bass","clarinet","didgeridoo","dulcimer","element","first n","flute","item number","kazoo","longest","longest one","longest word","nth","position","sousaphone","take","top","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d235db1f","guard":[["hasAny",["banjo","bass","clarinet","didgeridoo","dulcimer","element","first n","flute","item number","kazoo","longest","longest one","longest word","nth","position","sousaphone","take","top","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6d1a5330","guard":[["hasAny",["bagpipe","banjo","cello","harp","kazoo","ladder","lute","lyre","shortest","shortest one","shortest word","viola"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]],"mem":null},
{"id":"n-546c4104","guard":[["hasAny",["backwards","bagpipe","banjo","cello","harp","kazoo","ladder","lute","lyre","piccolo","reverse","reverse order","reversed","shortest","shortest one","shortest word"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-886e43d8","guard":[["hasAny",["bagpipe","banjo","cello","class name","harp","kazoo","ladder","lute","lyre","pascal case","pascalcase","shortest","shortest one","shortest word","upper camel case","viola"]],["has","or"]],"pyramid":["render.str",["transform.pascal",["aggregate.shortest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-b20099c6","guard":[["hasAny",["a to z","alphabetical","alphabetize","bagpipe","banjo","cello","harp","kazoo","ladder","lute","lyre","piccolo","shortest","shortest one","shortest word"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-efdc63eb","guard":[["hasAny",["bagpipe","banjo","cello","harp","invert case","kazoo","ladder","lute","lyre","shortest","shortest one","shortest word","swap case","toggle case","viola"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]]]],"mem":null},
{"id":"n-ddd47d81","guard":[["hasAny",["bagpipe","banjo","calliope","cello","clavichord","dobro","first n","harp","lute","shortest","shortest one","shortest word","top","viola"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-23ad9c5d","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","delete","element","item number","nth","organ","position","remove","saxaphone","sousaphone","strip out","viola","vuvuzela","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":"grand"}]],"mem":null},
{"id":"n-7f75db33","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","delete","element","item number","nth","organ","position","remove","saxaphone","sousaphone","strip out","viola","vuvuzela","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":"piano"}]],"mem":null},
{"id":"n-bfddbb88","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","item number","nth","organ","position","saxaphone","separate by","sousaphone","split","split by","viola","vuvuzela"]],["has","or"]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":"grand"}]],"mem":null},
{"id":"n-d4fc4b5e","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","item number","nth","organ","position","saxaphone","separate by","sousaphone","split","split by","viola","vuvuzela"]],["has","or"]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":"grand"}]],"mem":null},
{"id":"n-daf21e2c","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","item number","nth","organ","position","saxaphone","separate by","sousaphone","split","split by","viola","vuvuzela"]],["has","or"]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":"grand"}]],"mem":null},
{"id":"n-e568313d","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","item number","nth","organ","position","saxaphone","separate by","sousaphone","split","split by","viola","vuvuzela"]],["has","or"]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":"piano"}]],"mem":null},
{"id":"n-558cbac2","guard":[["hasAny",["calliope","characters from","clarinet","clavichord","concertina","element","item number","letters from to","nth","organ","position","saxaphone","slice of the text","sousaphone","substring","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-601eeb61","guard":[["hasAny",["calliope","characters from","clarinet","clavichord","concertina","element","item number","letters from to","nth","organ","position","saxaphone","slice of the text","sousaphone","substring","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-7ecadfb2","guard":[["hasAny",["calliope","characters from","clarinet","clavichord","concertina","element","item number","letters from to","nth","organ","position","saxaphone","slice of the text","sousaphone","substring","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-7b61b2f7","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","delete","element","item number","nth","organ","position","remove","saxaphone","sousaphone","strip out","viola","vuvuzela","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-ad3db44c","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","delete","element","item number","nth","organ","position","remove","saxaphone","sousaphone","strip out","viola","vuvuzela","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-2f06ca25","guard":[["hasAny",["accordion","bathtub","clarinet","cup","didgeridoo","dulcimer","each word","longest","longest one","longest word","sousaphone","split into words","viola","vuvuzela","words"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"instrument"}]]]],"mem":null},
{"id":"n-786fd3b7","guard":[["hasAny",["accordion","backwards","bagpipe","banjo","bathtub","cello","dulcimer","harpsichord","item number","lute","mandolin","nth","position","reverse order","reversed"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":3}]],"mem":null},
{"id":"n-aa90f6d1","guard":[["hasAny",["bugle","calliope","didgeridoo","dobro","glockenspiel","guitar","harmonica","harp","how many vowels","item number","marimba","nth","number of vowels","position","vowel count"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-d1991ba8","guard":[["hasAny",["accordion","backwards","bagpipe","banjo","bathtub","cello","dulcimer","harpsichord","item number","lute","mandolin","nth","position","reverse order","reversed"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":2}]],"mem":null},
{"id":"n-055381ae","guard":[["hasAny",["concertina","from position","guitar","harmonica","harpsichord","items from to","lamp","longest","longest one","longest word","marimba","saxaphone","slice"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.content"],{"lit":2},{"lit":5}]]],"mem":null},
{"id":"n-94ea0bb9","guard":[["hasAny",["bagpipe","banjo","bugle","calliope","from position","harp","items from to","lyre","shortest","shortest one","shortest word","slice","ukulele","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]]],"mem":null},
{"id":"n-ad8894b1","guard":[["hasAny",["bugle","clarinet","dobro","guitar","harmonica","harp","item number","longest","longest one","longest word","marimba","nth","position","sousaphone","viola"]],["has","or"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0bbd5050","guard":[["hasAny",["backwards","calliope","clarinet","class name","clavichord","concertina","element","item number","nth","pascal case","pascalcase","position","reverse","reversed","saxaphone","sousaphone","spell backwards","upper camel case","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.reverse",["transform.pascal",["transform.reverse",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]]],"mem":null},
{"id":"n-29b2fdce","guard":[["hasAny",["backwards","calliope","camel case","camelcase","clarinet","clavichord","concertina","element","item number","lower camel case","nth","position","reverse","reversed","saxaphone","sousaphone","spell backwards","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.reverse",["transform.camel",["transform.reverse",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]]],"mem":null},
{"id":"n-78ac268f","guard":[["hasAny",["backwards","calliope","clarinet","clavichord","concertina","element","item number","normalise","normalize","nth","position","reverse","reversed","saxaphone","simplify the text","sousaphone","spell backwards","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.reverse",["transform.norm",["transform.reverse",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]],{"lit":3}]]],"mem":null},
{"id":"n-54bf5896","guard":[["hasAny",["calliope","camel case","camelcase","clarinet","clavichord","concertina","element","item number","lower camel case","nth","position","saxaphone","sousaphone","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-82391e2e","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","item number","nth","position","saxaphone","snake case","snakecase","sousaphone","underscores","variable name","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.snake",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-a4970518","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","each word","element","item number","nth","position","saxaphone","sousaphone","split into words","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.list",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-c379c6a2","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","item number","nth","position","reverse the words","reverse word order","saxaphone","sousaphone","viola","vuvuzela","words backwards"]],["has","or"]],"pyramid":["render.str",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-cdd39be9","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","dashes","element","hyphens","item number","kebab case","kebabcase","nth","position","saxaphone","slug","sousaphone","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.kebab",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-d5de4d36","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","each word","element","item number","nth","position","saxaphone","sousaphone","split into words","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.lines",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-e7bafd9e","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","each word","element","item number","nth","position","saxaphone","sousaphone","split into words","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.and",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-ecd67d75","guard":[["hasAny",["calliope","clarinet","class name","clavichord","concertina","element","item number","nth","pascal case","pascalcase","position","saxaphone","sousaphone","upper camel case","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.pascal",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-02755e59","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","dashes","element","hyphens","item number","kebab case","kebabcase","nth","position","reverse the words","reverse word order","saxaphone","slug","sousaphone","viola","vuvuzela","words backwards"]],["has","or"]],"pyramid":["render.str",["transform.kebab",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-06270ebb","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","invert case","item number","nth","position","saxaphone","snake case","snakecase","sousaphone","swap case","toggle case","underscores","variable name","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.snake",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-089c4d5c","guard":[["hasAny",["calliope","camel case","camelcase","capitalise","capitalize","capitalize each word","clarinet","clavichord","concertina","element","item number","lower camel case","nth","position","saxaphone","sousaphone","title case","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.title",["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-0cb84fc0","guard":[["hasAny",["calliope","clarinet","class name","clavichord","concertina","element","item number","nth","pascal case","pascalcase","position","reverse the words","reverse word order","saxaphone","sousaphone","upper camel case","viola","vuvuzela","words backwards"]],["has","or"]],"pyramid":["render.str",["transform.pascal",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-1308dcbc","guard":[["hasAny",["calliope","capitalise","capitalize","capitalize each word","clarinet","clavichord","concertina","each word","element","item number","nth","position","saxaphone","sousaphone","split into words","title case","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.list",["transform.words",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-1f991d58","guard":[["hasAny",["calliope","capitalise","capitalize","capitalize each word","clarinet","clavichord","concertina","dashes","element","hyphens","item number","kebab case","kebabcase","nth","position","saxaphone","slug","sousaphone","title case","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.title",["transform.kebab",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-1fbd1380","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","each word","element","item number","nth","position","saxaphone","shortest","shortest one","shortest word","sousaphone","split into words","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-240692ef","guard":[["hasAny",["a to z","alphabetical","alphabetize","calliope","clarinet","clavichord","concertina","each word","element","item number","nth","position","saxaphone","sousaphone","split into words","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-2ef2651d","guard":[["hasAny",["calliope","capitalise","capitalize","capitalize each word","clarinet","clavichord","concertina","element","item number","nth","position","reverse the words","reverse word order","saxaphone","sousaphone","title case","viola","vuvuzela","words backwards"]],["has","or"]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-32d48031","guard":[["hasAny",["calliope","capitalise","capitalize","capitalize each word","clarinet","clavichord","concertina","each word","element","item number","nth","position","saxaphone","sousaphone","split into words","title case","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.lines",["transform.words",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-46300fed","guard":[["hasAny",["a to z","alphabetical","alphabetize","calliope","clarinet","clavichord","concertina","each word","element","item number","nth","position","saxaphone","sousaphone","split into words","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-5a2cf723","guard":[["hasAny",["all caps","calliope","camel case","camelcase","capital letters","capitals","clarinet","clavichord","concertina","element","item number","lower camel case","nth","position","saxaphone","sousaphone","upper case","uppercase","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.upper",["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-5e01667b","guard":[["hasAny",["a to z","alphabetical","alphabetize","calliope","clarinet","clavichord","concertina","each word","element","item number","nth","position","saxaphone","sousaphone","split into words","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-6de5b253","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","each word","element","invert case","item number","nth","position","saxaphone","sousaphone","split into words","swap case","toggle case","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.list",["transform.words",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-6e1425eb","guard":[["hasAny",["backwards","calliope","clarinet","clavichord","concertina","each word","element","item number","nth","position","reverse","reverse order","reversed","saxaphone","sousaphone","split into words","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-73a1c154","guard":[["hasAny",["calliope","capitalise","capitalize","capitalize each word","clarinet","clavichord","concertina","element","item number","nth","position","saxaphone","snake case","snakecase","sousaphone","title case","underscores","variable name","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.title",["transform.snake",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-83ee4018","guard":[["hasAny",["calliope","camel case","camelcase","clarinet","clavichord","concertina","element","invert case","item number","lower camel case","nth","position","saxaphone","sousaphone","swap case","toggle case","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-8b982c00","guard":[["hasAny",["calliope","clarinet","class name","clavichord","concertina","element","invert case","item number","nth","pascal case","pascalcase","position","saxaphone","sousaphone","swap case","toggle case","upper camel case","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.pascal",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-92d1dc9c","guard":[["hasAny",["calliope","capitalise","capitalize","capitalize each word","clarinet","clavichord","concertina","each word","element","item number","nth","position","saxaphone","sousaphone","split into words","title case","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.and",["transform.words",["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-a0e67c78","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","each word","element","invert case","item number","nth","position","saxaphone","sousaphone","split into words","swap case","toggle case","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.and",["transform.words",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-a93a9269","guard":[["hasAny",["cup","delete","element","item number","lyre","melodica","nth","position","remove","strip out","theremin","toaster","ukulele","violin","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.subject"]]],"mem":null},
{"id":"n-a994c7db","guard":[["hasAny",["calliope","camel case","camelcase","clarinet","clavichord","concertina","element","item number","lower camel case","nth","position","reverse the words","reverse word order","saxaphone","sousaphone","viola","vuvuzela","words backwards"]],["has","or"]],"pyramid":["render.str",["transform.camel",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-ab7cbb45","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","dashes","element","hyphens","invert case","item number","kebab case","kebabcase","nth","position","saxaphone","slug","sousaphone","swap case","toggle case","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.kebab",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-af7ff1f6","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","invert case","item number","nth","position","reverse the words","reverse word order","saxaphone","sousaphone","swap case","toggle case","viola","vuvuzela","words backwards"]],["has","or"]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-bc614427","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","each word","element","invert case","item number","nth","position","saxaphone","sousaphone","split into words","swap case","toggle case","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-c06ccf5a","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","each word","element","item number","longest","longest one","longest word","nth","position","saxaphone","sousaphone","split into words","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-c802200d","guard":[["hasAny",["backwards","calliope","clarinet","clavichord","concertina","each word","element","item number","nth","position","reverse","reverse order","reversed","saxaphone","sousaphone","split into words","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-c9b902da","guard":[["hasAny",["backwards","calliope","clarinet","clavichord","concertina","each word","element","item number","nth","position","reverse","reverse order","reversed","saxaphone","sousaphone","split into words","viola","vuvuzela","words"]],["has","or"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-d9ad88d1","guard":[["hasAny",["calliope","camel case","camelcase","clarinet","clavichord","concertina","element","item number","lower camel case","lower case","lowercase","nth","position","saxaphone","small letters","sousaphone","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.lower",["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-feed4914","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","item number","nth","position","reverse the words","reverse word order","saxaphone","snake case","snakecase","sousaphone","underscores","variable name","viola","vuvuzela","words backwards"]],["has","or"]],"pyramid":["render.str",["transform.snake",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-17c06207","guard":[["hasAny",["bassoon","delete","didgeridoo","element","hurdygurdy","item number","kazoo","ladder","nth","piccolo","position","remove","strip out","theremin","violin","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.after",{"lit":"instrument"}]]],"mem":null},
{"id":"n-3f73e718","guard":[["hasAny",["calliope","clarinet","delete","element","grand","item number","nth","plate","position","remove","sousaphone","strip out","vuvuzela","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["sense.after",{"lit":"instrument"}]]],"mem":null},
{"id":"n-453258dc","guard":[["hasAny",["bassoon","element","french","how many words","hurdygurdy","item number","ladder","lyre","melodica","nth","number of words","piccolo","position","ukulele","word count"]],["has","or"]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-48db021d","guard":[["hasAny",["cup","delete","element","item number","lyre","melodica","nth","position","remove","strip out","theremin","toaster","ukulele","violin","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-6863e585","guard":[["hasAny",["bassoon","element","french","how many words","hurdygurdy","item number","ladder","lyre","melodica","nth","number of words","piccolo","position","ukulele","word count"]],["has","or"]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-9aff5012","guard":[["hasAny",["change to","didgeridoo","element","french","item number","kazoo","lyre","melodica","nth","position","replace","substitute","swap","theremin","ukulele","violin"]],["has","which"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.subject"],["sense.text"]]],"mem":null},
{"id":"n-aa1f8177","guard":[["hasAny",["bassoon","element","french","how many words","hurdygurdy","item number","ladder","lyre","melodica","nth","number of words","piccolo","position","ukulele","word count"]],["has","or"]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-ad65c28b","guard":[["hasAny",["didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","longest","longest one","longest word","lyre","melodica","nth","position","ukulele"]],["has","or"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c5c688f0","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","delete","element","grand","item number","nth","position","remove","saxaphone","sousaphone","strip out","viola","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ce3b5e33","guard":[["hasAny",["calliope","camel case","camelcase","clarinet","clavichord","concertina","element","item number","lower camel case","normalise","normalize","nth","position","saxaphone","simplify the text","sousaphone","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.camel",["transform.norm",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":3}]]],"mem":null},
{"id":"n-ebc175da","guard":[["hasAny",["bassoon","change to","element","french","hurdygurdy","item number","ladder","lyre","melodica","nth","piccolo","position","replace","substitute","swap","ukulele"]],["has","or"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-2565cc07","guard":[["hasAny",["capitalise","capitalize","capitalize each word","didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","longest","longest one","longest word","lyre","melodica","nth","position","title case","ukulele"]],["has","or"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7ba7b3d2","guard":[["hasAny",["all caps","capital letters","capitals","didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","longest","longest one","longest word","lyre","melodica","nth","position","ukulele","upper case","uppercase"]],["has","or"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.upper",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a392944d","guard":[["hasAny",["didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","longest","longest one","longest word","lower case","lowercase","lyre","melodica","nth","position","small letters","ukulele"]],["has","or"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.lower",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d010ace5","guard":[["hasAny",["didgeridoo","element","french","hurdygurdy","invert case","item number","kazoo","ladder","longest","longest one","longest word","lyre","melodica","nth","position","swap case","toggle case","ukulele"]],["has","or"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ee143681","guard":[["hasAny",["concertina","element","guitar","harmonica","item number","lamp","longest","longest one","longest word","marimba","nth","position","saxaphone"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-179e73e9","guard":[["hasAny",["didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","longest","longest one","longest word","lyre","melodica","nth","position","ukulele"]],["has","or"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":1}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9b84fc79","guard":[["hasAny",["didgeridoo","element","french","hurdygurdy","item number","kazoo","ladder","longest","longest one","longest word","lyre","melodica","nth","position","ukulele"]],["has","or"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":1}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b02535d0","guard":[["hasAny",["accordion","baby","bathtub","drum","element","harpsichord","hurdygurdy","item number","longest","longest one","longest word","nth","organ","position","vuvuzela"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4265e657","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","how many words","item number","nth","number of words","position","saxaphone","sousaphone","viola","vuvuzela","word count"]],["has","or"]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-843057a2","guard":[["hasAny",["calliope","change to","clarinet","element","grand","item number","nth","organ","position","replace","sousaphone","substitute","swap","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-aa61a73d","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","how many words","item number","nth","number of words","position","saxaphone","sousaphone","viola","vuvuzela","word count"]],["has","or"]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-dd0571e6","guard":[["hasAny",["calliope","clarinet","clavichord","concertina","element","how many words","item number","nth","number of words","position","saxaphone","sousaphone","viola","vuvuzela","word count"]],["has","or"]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-0c43d0b6","guard":[["hasAny",["backwards","blanket","broom","capitalise","capitalize","capitalize each word","fork","longest","longest one","longest word","mirror","reverse","reversed","sofa","spell backwards","title case","vase"]]],"pyramid":["render.str",["transform.reverse",["transform.title",["transform.reverse",["aggregate.longest",["sense.list"]]]]]],"mem":null},
{"id":"n-da4a1ea5","guard":[["hasAny",["blanket","broom","fork","longest","longest one","longest word","sofa","vase"]]],"pyramid":["render.str",["aggregate.longest",["sense.list"]]],"mem":null},
{"id":"n-0f082a08","guard":[["hasAny",["blanket","broom","fork","invert case","longest","longest one","longest word","sofa","swap case","toggle case","vase"]]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-30782d26","guard":[["hasAny",["bassoon","clarinet","didgeridoo","dulcimer","each word","ladder","longest one","longest word","piccolo","sousaphone","split into words","viola"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-721db3bb","guard":[["hasAny",["blanket","broom","capitalise","capitalize","capitalize each word","fork","longest","longest one","longest word","sofa","title case","vase"]]],"pyramid":["render.str",["transform.title",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-893da79c","guard":[["hasAny",["bassoon","clarinet","didgeridoo","dulcimer","each word","ladder","longest","longest one","longest word","piccolo","sousaphone","split into words","viola"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-1acb2ca8","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","clarinet","didgeridoo","dulcimer","each word","ladder","longest","longest one","longest word","piccolo","sousaphone","split into words","title case","viola"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["transform.title",["sense.subject"]]]]],"mem":null},
{"id":"n-357cdb5e","guard":[["hasAny",["concertina","first n","glockenspiel","guitar","harmonica","harpsichord","longest one","longest word","marimba","melodica","saxaphone"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.content"],{"lit":5}]]],"mem":null},
{"id":"n-939bcebb","guard":[["hasAny",["concertina","first n","glockenspiel","guitar","harmonica","harpsichord","longest","longest one","longest word","marimba","melodica","saxaphone","take"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.content"],{"lit":5}]]],"mem":null},
{"id":"n-cb24d959","guard":[["hasAny",["a to z","alphabetical","alphabetize","bugle","didgeridoo","dobro","glockenspiel","harpsichord","item number","mandolin","nth","pillow","position"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":2}]],"mem":null},
{"id":"n-eb9aec7b","guard":[["hasAny",["bassoon","clarinet","didgeridoo","dulcimer","each word","invert case","ladder","longest","longest one","longest word","piccolo","sousaphone","split into words","swap case","toggle case","viola"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["transform.swapCase",["sense.subject"]]]]],"mem":null},
{"id":"n-310d08a1","guard":[["hasAny",["accordion","bathtub","didgeridoo","dulcimer","from position","harpsichord","items from to","longest","longest one","longest word","slice","theremin","violin","vuvuzela"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]]],"mem":null},
{"id":"n-9e9c1295","guard":[["hasAny",["concertina","from position","guitar","harmonica","items from to","lamp","longest","longest one","longest word","marimba","saxaphone","slice"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.content"],{"lit":2},{"lit":4}]]],"mem":null},
{"id":"n-ca35da46","guard":[["hasAny",["concertina","from position","guitar","harmonica","items from to","lamp","longest","longest one","longest word","marimba","saxaphone","slice"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":2},{"lit":5}]]],"mem":null},
{"id":"n-f1fcec0e","guard":[["hasAny",["blanket","broom","fork","item number","longest","longest one","longest word","nth","position","sofa","vase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-08c07621","guard":[["hasAny",["bassoon","didgeridoo","element","how many words","item number","kazoo","ladder","nth","number of words","piccolo","position","theremin","violin","word count"]],["has","or"]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-0da02b66","guard":[["hasAny",["bassoon","didgeridoo","element","how many words","item number","kazoo","ladder","nth","number of words","piccolo","position","theremin","violin","word count"]]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-216c8a7e","guard":[["hasAny",["bassoon","didgeridoo","element","how many words","item number","kazoo","ladder","nth","number of words","piccolo","position","theremin","violin","word count"]],["has","or"]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-27f94b94","guard":[["hasAny",["bassoon","didgeridoo","element","item number","kazoo","ladder","leading zeros","nth","pad","pad with","padded to","piccolo","position","theremin","violin","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["sense.lastWord"],{"lit":4},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-4f38b2e0","guard":[["hasAny",["bassoon","didgeridoo","element","how many words","item number","kazoo","ladder","nth","number of words","piccolo","position","theremin","violin","word count"]],["has","or"]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-694d54b9","guard":[["hasAny",["bathtub","blanket","cup","delete","element","item number","lute","mandolin","nth","position","remove","sponge","strip out","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["sense.after",{"lit":"from"}]]],"mem":null},
{"id":"n-719a508b","guard":[["hasAny",["bassoon","didgeridoo","element","item number","kazoo","ladder","leading zeros","nth","pad","pad with","padded to","piccolo","position","theremin","violin","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["sense.lastWord"],{"lit":4},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-79e56438","guard":[["hasAny",["bassoon","didgeridoo","element","how many words","item number","kazoo","ladder","nth","number of words","piccolo","position","theremin","violin","word count"]],["has","or"]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-7d3fdf71","guard":[["hasAny",["camel case","camelcase","delete","element","item number","lower camel case","lyre","melodica","nth","position","remove","strip out","theremin","toaster","ukulele","violin","without"]],["has","which"]],"pyramid":["render.str",["transform.camel",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.subject"]]]],"mem":null},
{"id":"n-96b57b5c","guard":[["hasAny",["bassoon","didgeridoo","element","how many words","item number","kazoo","ladder","nth","number of words","piccolo","position","theremin","violin","word count"]],["has","or"]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-a111f8e9","guard":[["hasAny",["bassoon","didgeridoo","element","how many words","item number","kazoo","ladder","nth","number of words","piccolo","position","theremin","violin","word count"]],["has","or"]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-b2ec4c83","guard":[["hasAny",["bassoon","didgeridoo","element","how many words","item number","kazoo","ladder","nth","number of words","piccolo","position","theremin","violin","word count"]]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-f85defa7","guard":[["hasAny",["bassoon","didgeridoo","element","item number","kazoo","ladder","leading zeros","nth","pad","pad with","padded to","piccolo","position","theremin","violin","zero pad"]]],"pyramid":["render.str",["transform.padStart",["sense.lastWord"],{"lit":4},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-fe83d119","guard":[["hasAny",["bassoon","didgeridoo","element","how many words","item number","kazoo","ladder","nth","number of words","piccolo","position","theremin","violin","word count"]]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-6fdf7375","guard":[["hasAny",["bass","clarinet","didgeridoo","dulcimer","element","item number","kettle","longest","longest one","longest word","nth","position","sousaphone","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e8d6e0e5","guard":[["hasAny",["accordion","baby","bathtub","drum","element","hurdygurdy","item number","longest","longest one","longest word","nth","organ","position","vuvuzela"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2abf538b","guard":[["hasAny",["bassoon","delete","didgeridoo","element","item number","kazoo","ladder","nth","piccolo","position","remove","strip out","theremin","violin","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-4bfe8c18","guard":[["hasAny",["bassoon","delete","didgeridoo","element","item number","kazoo","ladder","nth","piccolo","position","remove","strip out","theremin","violin","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-98417767","guard":[["hasAny",["bassoon","delete","didgeridoo","element","item number","kazoo","ladder","nth","piccolo","position","remove","strip out","theremin","violin","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-388bebde","guard":[["hasAny",["accordion","bathtub","cello","change to","drum","element","harpsichord","item number","lute","mandolin","nth","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-e0291aa6","guard":[["hasAny",["accordion","bathtub","cello","drum","element","harpsichord","item number","lute","mandolin","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-32d3932b","guard":[["hasAny",["accordion","bathtub","capitalise","capitalize","capitalize each word","cello","drum","element","harpsichord","item number","lute","mandolin","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bd72b695","guard":[["hasAny",["accordion","bathtub","cello","drum","element","harpsichord","invert case","item number","lute","mandolin","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2ddba634","guard":[["hasAny",["accordion","bathtub","cello","drum","element","harpsichord","item number","lute","mandolin","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fda19b7a","guard":[["hasAny",["accordion","bathtub","cello","drum","element","harpsichord","item number","lute","mandolin","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-24e45646","guard":[["hasAny",["bassoon","class name","didgeridoo","kazoo","ladder","pascal case","pascalcase","piccolo","reversed","spell backwards","theremin","upper camel case","violin"]],["has","or"]],"pyramid":["render.str",["transform.reverse",["transform.pascal",["transform.reverse",["sense.lastWord"]]]]],"mem":null},
{"id":"n-d6f7e4cb","guard":[["hasAny",["backwards","bassoon","capitalise","capitalize","capitalize each word","didgeridoo","kazoo","ladder","piccolo","reversed","spell backwards","theremin","title case","violin"]],["has","or"]],"pyramid":["render.str",["transform.reverse",["transform.title",["transform.reverse",["sense.lastWord"]]]]],"mem":null},
{"id":"n-5e1dee49","guard":[["hasAny",["backwards","bassoon","clarinet","didgeridoo","dulcimer","each word","ladder","longest","longest one","longest word","piccolo","reversed","sousaphone","spell backwards","split into words"]],["has","or"]],"pyramid":["render.str",["transform.reverse",["aggregate.longest",["transform.words",["transform.reverse",["sense.subject"]]]]]],"mem":null},
{"id":"n-60dd692f","guard":[["hasAny",["backwards","bassoon","capitalise","capitalize","capitalize each word","didgeridoo","invert case","kazoo","ladder","piccolo","reversed","spell backwards","swap case","theremin","title case","toggle case","violin"]],["has","or"]],"pyramid":["render.str",["transform.reverse",["transform.swapCase",["transform.title",["transform.reverse",["sense.lastWord"]]]]]],"mem":null},
{"id":"n-7837bdf3","guard":[["hasAny",["backwards","bugle","capitalise","capitalize","capitalize each word","dobro","glockenspiel","guitar","harmonica","harp","marimba","reversed","spell backwards","title case"]],["has","among"]],"pyramid":["render.str",["transform.reverse",["transform.title",["transform.reverse",["sense.wordAt",{"lit":3}]]]]],"mem":null},
{"id":"n-c49042a2","guard":[["hasAny",["bugle","class name","dobro","glockenspiel","guitar","harmonica","harp","marimba","pascal case","pascalcase","reversed","spell backwards","upper camel case"]],["has","among"]],"pyramid":["render.str",["transform.reverse",["transform.pascal",["transform.reverse",["sense.wordAt",{"lit":3}]]]]],"mem":null},
{"id":"n-230d6e95","guard":[["hasAny",["bassoon","didgeridoo","each word","kazoo","ladder","piccolo","split into words","theremin","violin"]],["has","or"]],"pyramid":["render.list",["transform.words",["sense.lastWord"]]],"mem":null},
{"id":"n-786ede85","guard":[["hasAny",["bassoon","didgeridoo","invert case","kazoo","ladder","piccolo","swap case","theremin","toggle case","violin"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bd1f80e6","guard":[["hasAny",["bassoon","class name","didgeridoo","kazoo","ladder","pascal case","pascalcase","piccolo","theremin","upper camel case","violin"]],["has","or"]],"pyramid":["render.str",["transform.pascal",["sense.lastWord"]]],"mem":null},
{"id":"n-f077befd","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","didgeridoo","kazoo","ladder","piccolo","theremin","title case","violin"]],["has","or"]],"pyramid":["render.str",["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-29878600","guard":[["hasAny",["bassoon","class name","didgeridoo","invert case","kazoo","ladder","pascal case","pascalcase","piccolo","swap case","theremin","toggle case","upper camel case","violin"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.pascal",["sense.lastWord"]]]],"mem":null},
{"id":"n-2f78d919","guard":[["hasAny",["bugle","dobro","glockenspiel","guitar","harmonica","harp","invert case","marimba","swap case","toggle case"]],["has","among"]],"pyramid":["render.str",["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-32285997","guard":[["hasAny",["bugle","dobro","each word","glockenspiel","guitar","harmonica","harp","marimba","split into words"]],["has","among"]],"pyramid":["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-5823ad5d","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","didgeridoo","invert case","kazoo","ladder","piccolo","swap case","theremin","title case","toggle case","violin"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-5b48ee21","guard":[["hasAny",["bassoon","didgeridoo","item number","kazoo","ladder","nth","piccolo","theremin","violin"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-6e4b2f77","guard":[["hasAny",["bagpipe","curtain","dulcimer","item number","lyre","nth","ukulele","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7151ada3","guard":[["hasAny",["bagpipe","curtain","dulcimer","item number","lyre","nth","position","ukulele","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7db7b7f4","guard":[["hasAny",["bassoon","didgeridoo","item number","kazoo","ladder","nth","piccolo","position","theremin","violin"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-802ad24a","guard":[["hasAny",["bugle","capitalise","capitalize","capitalize each word","dobro","glockenspiel","guitar","harmonica","harp","marimba","title case"]],["has","among"]],"pyramid":["render.str",["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-d455cb4d","guard":[["hasAny",["backwards","blanket","fork","longest","longest one","longest word","reverse","reverse order","reversed","sofa","vase"]]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["sense.list"]]]],"mem":null},
{"id":"n-e4ef67f1","guard":[["hasAny",["bugle","class name","dobro","glockenspiel","guitar","harmonica","harp","marimba","pascal case","pascalcase","upper camel case"]],["has","among"]],"pyramid":["render.str",["transform.pascal",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-e753a195","guard":[["hasAny",["bassoon","delete","didgeridoo","kazoo","ladder","piccolo","strip out","theremin","violin"]],["has","or"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"piano"}]],"mem":null},
{"id":"n-00a2cadb","guard":[["hasAny",["concertina","each word","glockenspiel","guitar","harmonica","longest","longest one","longest word","marimba","melodica","saxaphone","split into words","words"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.before",{"lit":"musical"}]]]],"mem":null},
{"id":"n-017d8d91","guard":[["hasAny",["concertina","first n","glockenspiel","guitar","harmonica","longest one","longest word","marimba","melodica","saxaphone"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":5}]]],"mem":null},
{"id":"n-2273077b","guard":[["hasAny",["bassoon","didgeridoo","how many words","item number","kazoo","ladder","nth","number of words","piccolo","position","theremin","violin","word count"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.words",["sense.text"]]]],"mem":null},
{"id":"n-24e06d40","guard":[["hasAny",["bassoon","didgeridoo","digits backwards","digits reversed","item number","kazoo","ladder","nth","piccolo","position","reverse the digits","theremin","violin"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-2518d647","guard":[["hasAny",["bugle","dobro","glockenspiel","guitar","hammer","harmonica","how many vowels","item number","marimba","nth","number of vowels","position","vowel count"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-29887029","guard":[["hasAny",["concertina","each word","glockenspiel","guitar","harmonica","longest","longest one","longest word","marimba","melodica","saxaphone","split into words","words"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-2e3633ac","guard":[["hasAny",["concertina","first n","glockenspiel","harmonica","harpsichord","longest","longest one","longest word","marimba","melodica","saxaphone","take"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":10}]]],"mem":null},
{"id":"n-37c7b7e9","guard":[["hasAny",["broom","first n","fork","longest","longest one","longest word","sofa","vase"]]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-3837c62b","guard":[["hasAny",["bassoon","characters from","didgeridoo","kazoo","ladder","letters from to","piccolo","slice of the text","substring","theremin","violin"]],["has","or"]],"pyramid":["render.str",["transform.substr",["sense.lastWord"],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-51954c36","guard":[["hasAny",["bugle","dobro","glockenspiel","guitar","harmonica","harp","how many vowels","item number","marimba","nth","number of vowels","position","vowel count"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-677587ee","guard":[["hasAny",["concertina","first n","glockenspiel","guitar","harmonica","longest one","longest word","marimba","melodica","saxaphone"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-702c610c","guard":[["hasAny",["bagpipe","capitalise","capitalize","capitalize each word","curtain","dulcimer","item number","lyre","nth","position","title case","ukulele","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-73d459f7","guard":[["hasAny",["bugle","dobro","glockenspiel","guitar","hammer","harmonica","marimba","normalise","normalize","simplify the text"]],["has","among"]],"pyramid":["render.str",["transform.norm",["sense.wordAt",{"lit":3}],{"lit":2}]],"mem":null},
{"id":"n-789950bf","guard":[["hasAny",["bassoon","calliope","clarinet","each word","item number","ladder","nth","piccolo","position","sousaphone","split into words","viola"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.words",["sense.subject"]],{"lit":1}]],"mem":null},
{"id":"n-7c3dc2f5","guard":[["hasAny",["a to z","alphabetical","alphabetize","clarinet","clavichord","guitar","harp","harpsichord","item number","lute","mandolin","nth","position"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":4}]],"mem":null},
{"id":"n-7de12934","guard":[["hasAny",["a to z","accordion","alphabetical","alphabetize","bagpipe","banjo","bassoon","calliope","cello","dulcimer","item number","nth","position"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":2}]],"mem":null},
{"id":"n-81cdfaa4","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","didgeridoo","item number","kazoo","ladder","nth","piccolo","position","theremin","title case","violin"]],["has","or"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.words"],["sense.wordCount"]]]],"mem":null},
{"id":"n-82176d29","guard":[["hasAny",["bassoon","didgeridoo","invert case","item number","kazoo","ladder","nth","piccolo","position","swap case","theremin","toggle case","violin"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.words"],["sense.wordCount"]]]],"mem":null},
{"id":"n-88a8542e","guard":[["hasAny",["bassoon","didgeridoo","kazoo","ladder","leading zeros","pad with","padded to","piccolo","theremin","violin","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["sense.lastWord"],{"lit":4},["sense.text"]]],"mem":null},
{"id":"n-8e71f142","guard":[["hasAny",["concertina","first n","glockenspiel","harmonica","harpsichord","longest one","longest word","marimba","melodica","saxaphone"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":10}]]],"mem":null},
{"id":"n-939899f4","guard":[["hasAny",["bassoon","didgeridoo","divisor count","how many divisors","how many factors","kazoo","ladder","normalise","normalize","number of divisors","piccolo","simplify the text","theremin","violin"]],["has","or"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-99ae6495","guard":[["hasAny",["a to z","accordion","alphabetical","alphabetize","bagpipe","banjo","bassoon","calliope","cello","dulcimer","item number","nth","position"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":1}]],"mem":null},
{"id":"n-b4c2de1b","guard":[["hasAny",["concertina","first n","glockenspiel","guitar","harmonica","longest","longest one","longest word","marimba","melodica","saxaphone","take"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-b58519e1","guard":[["hasAny",["bassoon","delete","didgeridoo","kazoo","ladder","piccolo","remove","strip out","theremin","violin","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"instrument"}]]],"mem":null},
{"id":"n-ba39b9bb","guard":[["hasAny",["bassoon","didgeridoo","each word","item number","kazoo","ladder","nth","piccolo","position","split into words","theremin","violin"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.words",["sense.text"]],["sense.wordCount"]]],"mem":null},
{"id":"n-bab98447","guard":[["hasAny",["bassoon","characters from","didgeridoo","kazoo","ladder","letters from to","piccolo","slice of the text","substring","theremin","violin"]],["has","or"]],"pyramid":["render.str",["transform.substr",["sense.lastWord"],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-c42838b1","guard":[["hasAny",["bugle","capitalise","capitalize","capitalize each word","dobro","glockenspiel","guitar","harmonica","harp","invert case","marimba","swap case","title case","toggle case"]],["has","among"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-c98a71b5","guard":[["hasAny",["bassoon","change to","didgeridoo","kazoo","ladder","piccolo","replace","substitute","swap","theremin","violin"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],{"lit":"piano"},["sense.text"]]],"mem":null},
{"id":"n-cbea23ea","guard":[["hasAny",["concertina","first n","glockenspiel","guitar","harmonica","longest","longest one","longest word","marimba","melodica","saxaphone","take"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":5}]]],"mem":null},
{"id":"n-e9320bec","guard":[["hasAny",["bagpipe","curtain","dulcimer","invert case","item number","lyre","nth","position","swap case","toggle case","ukulele","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-eff6796f","guard":[["hasAny",["a to z","alphabetical","alphabetize","clarinet","clavichord","guitar","harp","item number","kazoo","marimba","nth","piccolo","position"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":3}]],"mem":null},
{"id":"n-f310dee7","guard":[["hasAny",["concertina","each word","glockenspiel","guitar","harmonica","longest one","longest word","marimba","melodica","saxaphone","split into words"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-1589f03a","guard":[["hasAny",["dobro","from position","guitar","harmonica","items from to","lamp","longest","longest one","longest word","marimba","slice"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":3},{"lit":5}]]],"mem":null},
{"id":"n-1f73c1e1","guard":[["hasAny",["bugle","concertina","from position","glockenspiel","guitar","harmonica","items from to","longest","longest one","longest word","marimba","saxaphone","slice"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.content"],{"lit":2},{"lit":3}]]],"mem":null},
{"id":"n-3d42e995","guard":[["hasAny",["bugle","delete","dobro","glockenspiel","guitar","harmonica","harp","marimba","remove","strip out","without"]],["has","among"]],"pyramid":["render.str",["transform.remove",["sense.wordAt",{"lit":3}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-4f65b899","guard":[["hasAny",["bugle","dobro","glockenspiel","guitar","harmonica","harp","marimba","separate by","split","split by"]],["has","among"]],"pyramid":["render.and",["transform.split",["sense.wordAt",{"lit":3}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-53cca797","guard":[["hasAny",["bugle","dobro","glockenspiel","guitar","harmonica","harp","marimba","separate by","split","split by"]],["has","among"]],"pyramid":["render.lines",["transform.split",["sense.wordAt",{"lit":3}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-53f8c716","guard":[["hasAny",["clarinet","didgeridoo","dulcimer","from position","glockenspiel","harpsichord","items from to","longest","longest one","longest word","slice","sousaphone","viola"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-573f30f6","guard":[["hasAny",["bassoon","change to","didgeridoo","kazoo","ladder","piccolo","replace","substitute","swap","theremin","violin"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.after",{"lit":"musical"}],["sense.text"]]],"mem":null},
{"id":"n-7332e8fc","guard":[["hasAny",["bagpipe","banjo","cello","from position","items from to","kazoo","ladder","lute","shortest","shortest one","shortest word","slice","viola"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-9694ae2d","guard":[["hasAny",["bugle","dobro","from position","glockenspiel","guitar","harmonica","harp","items from to","longest","longest one","longest word","marimba","slice"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":3},{"lit":4}]]],"mem":null},
{"id":"n-9a28a6fc","guard":[["hasAny",["bugle","change to","dobro","glockenspiel","guitar","harmonica","harp","marimba","replace","substitute","swap"]],["has","among"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.lastWord"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-9e68280d","guard":[["hasAny",["bugle","delete","dobro","glockenspiel","guitar","harmonica","harp","marimba","remove","strip out","without"]],["has","among"]],"pyramid":["render.str",["transform.remove",["sense.wordAt",{"lit":3}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-b3302d03","guard":[["hasAny",["bugle","concertina","from position","glockenspiel","guitar","harmonica","items from to","longest","longest one","longest word","marimba","saxaphone","slice"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":2},{"lit":3}]]],"mem":null},
{"id":"n-b59cb0a1","guard":[["hasAny",["change to","clavichord","concertina","didgeridoo","kazoo","replace","saxaphone","substitute","swap","theremin","violin"]],["has","which"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-be308b7b","guard":[["hasAny",["bugle","dobro","glockenspiel","guitar","harmonica","harp","marimba","separate by","split","split by"]],["has","among"]],"pyramid":["render.list",["transform.split",["sense.wordAt",{"lit":3}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-e5290dea","guard":[["hasAny",["bagpipe","banjo","cello","from position","items from to","kazoo","ladder","lute","shortest","shortest one","shortest word","slice","viola"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":2},["sense.wordCount"]]]],"mem":null},
{"id":"n-f3839882","guard":[["hasAny",["bugle","concertina","from position","glockenspiel","guitar","harmonica","items from to","longest","longest one","longest word","marimba","saxaphone","slice"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":2},{"lit":4}]]],"mem":null},
{"id":"n-c07225b9","guard":[["hasAny",["bugle","dobro","glockenspiel","guitar","harmonica","harp","item number","marimba","nth"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-241a3390","guard":[["hasAny",["bugle","dobro","glockenspiel","guitar","harmonica","harp","invert case","item number","marimba","nth","swap case","toggle case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-86cf90a7","guard":[["hasAny",["bugle","class name","dobro","glockenspiel","guitar","harmonica","harp","item number","marimba","nth","pascal case","pascalcase","upper camel case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-d6684029","guard":[["hasAny",["bugle","dobro","glockenspiel","guitar","harmonica","harp","item number","marimba","nth"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-0e522616","guard":[["hasAny",["bugle","dobro","each word","glockenspiel","guitar","harmonica","harp","item number","marimba","nth","split into words"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-affdd60c","guard":[["hasAny",["bugle","dobro","each word","glockenspiel","guitar","harmonica","harp","item number","marimba","nth","split into words"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-056dce68","guard":[["hasAny",["baby","change to","clavichord","concertina","element","item number","nth","organ","position","replace","saxaphone","substitute","swap","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-22874ded","guard":[["hasAny",["accordion","bathtub","cello","digit count","element","harpsichord","how many digits","item number","lute","mandolin","nth","number of digits","position"]]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-2721edd5","guard":[["hasAny",["clavichord","concertina","element","grand","item number","leading zeros","nth","organ","pad","pad with","padded to","position","sousaphone","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":10},["sense.lastWord"]]],"mem":null},
{"id":"n-36038312","guard":[["hasAny",["baby","clavichord","concertina","element","how many words","item number","nth","number of words","organ","position","saxaphone","vuvuzela","word count"]],["has","or"]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-3c9db814","guard":[["hasAny",["clavichord","concertina","element","grand","item number","leading zeros","nth","organ","pad","pad with","padded to","position","sousaphone","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":10},["sense.subject"]]],"mem":null},
{"id":"n-3e61e650","guard":[["hasAny",["accordion","bathtub","cello","digit count","element","harpsichord","how many digits","item number","lute","mandolin","nth","number of digits","position"]]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-4dab611d","guard":[["hasAny",["banjo","bugle","cello","characters from","dobro","element","harp","item number","letters from to","lute","nth","position","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":1},{"lit":5}]],"mem":null},
{"id":"n-5f8f7fdf","guard":[["hasAny",["clavichord","concertina","element","grand","item number","leading zeros","nth","organ","pad","pad with","padded to","position","sousaphone","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-754e4186","guard":[["hasAny",["baby","clavichord","concertina","element","how many words","item number","nth","number of words","organ","position","saxaphone","vuvuzela","word count"]],["has","or"]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-7e0548f4","guard":[["hasAny",["bassoon","didgeridoo","element","item number","kazoo","leading zeros","nth","pad","pad with","padded to","piccolo","position","theremin","violin","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["sense.lastWord"],{"lit":5},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-875c73c2","guard":[["hasAny",["accordion","bathtub","cello","digit count","element","harpsichord","how many digits","item number","lute","mandolin","nth","number of digits","position"]]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-8c4b81e4","guard":[["hasAny",["baby","clavichord","concertina","element","how many words","item number","nth","number of words","organ","position","saxaphone","vuvuzela","word count"]],["has","or"]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-90dc4a5b","guard":[["hasAny",["bassoon","didgeridoo","element","item number","kazoo","leading zeros","nth","pad","pad with","padded to","piccolo","position","theremin","violin","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["sense.lastWord"],{"lit":5},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-ccc8e69e","guard":[["hasAny",["bassoon","didgeridoo","element","item number","kazoo","leading zeros","nth","pad","pad with","padded to","piccolo","position","theremin","violin","zero pad"]]],"pyramid":["render.str",["transform.padStart",["sense.lastWord"],{"lit":5},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-2a3146c7","guard":[["hasAny",["bugle","element","guitar","harmonica","item number","longest","longest one","longest word","marimba","melodica","nth","position","saxaphone"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-77d11e3a","guard":[["hasAny",["accordion","bathtub","cello","drum","element","item number","longest","longest one","longest word","lute","mandolin","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c22373c3","guard":[["hasAny",["bugle","dobro","element","guitar","harmonica","harp","item number","longest","longest one","longest word","marimba","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1301ab57","guard":[["hasAny",["accordion","bathtub","cello","drum","element","invert case","item number","longest","longest one","longest word","lute","mandolin","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7e05b959","guard":[["hasAny",["clavichord","concertina","element","grand","item number","leading zeros","nth","organ","pad","pad with","padded to","position","sousaphone","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-8640abb4","guard":[["hasAny",["bugle","dobro","element","guitar","harmonica","harp","invert case","item number","longest","longest one","longest word","marimba","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-90391ba5","guard":[["hasAny",["bagpipe","banjo","bass","dulcimer","element","flute","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-974868e8","guard":[["hasAny",["clavichord","concertina","element","grand","item number","leading zeros","nth","organ","pad","pad with","padded to","position","sousaphone","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-c1109ca7","guard":[["hasAny",["clavichord","concertina","element","grand","item number","leading zeros","nth","organ","pad","pad with","padded to","position","sousaphone","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-eb3862ca","guard":[["hasAny",["accordion","bathtub","capitalise","capitalize","capitalize each word","cello","drum","element","item number","longest","longest one","longest word","lute","mandolin","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6bdec045","guard":[["hasAny",["bagpipe","banjo","bass","dulcimer","element","flute","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a4c4b735","guard":[["hasAny",["bagpipe","banjo","bass","capitalise","capitalize","capitalize each word","dulcimer","element","flute","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fd00f84d","guard":[["hasAny",["accordion","bathtub","camel case","camelcase","cello","element","harpsichord","item number","lower camel case","lute","mandolin","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1a0674ec","guard":[["hasAny",["accordion","bathtub","cello","drum","element","item number","longest","longest one","longest word","lute","mandolin","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6ab246d4","guard":[["hasAny",["accordion","bathtub","cello","drum","element","item number","longest","longest one","longest word","lute","mandolin","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-415f5f74","guard":[["hasAny",["bagpipe","banjo","bass","dulcimer","element","flute","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a0653753","guard":[["hasAny",["bagpipe","banjo","bass","dulcimer","element","flute","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-19e5a922","guard":[["hasAny",["backwards","didgeridoo","kazoo","ladder","piccolo","reversed","separate by","spell backwards","split","split by","theremin","violin"]],["has","or"]],"pyramid":["render.lines",["transform.split",["sense.lastWord"],["transform.reverse",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-32d9cb28","guard":[["hasAny",["backwards","didgeridoo","kazoo","ladder","piccolo","reversed","separate by","spell backwards","split","split by","theremin","violin"]],["has","or"]],"pyramid":["render.and",["transform.split",["sense.lastWord"],["transform.reverse",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-85e1b645","guard":[["hasAny",["backwards","didgeridoo","kazoo","ladder","piccolo","reversed","separate by","spell backwards","split","split by","theremin","violin"]],["has","or"]],"pyramid":["render.list",["transform.split",["sense.lastWord"],["transform.reverse",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-756a1bcd","guard":[["hasAny",["bagpipe","banjo","bass","flute","item number","nth","position","vase"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":2}]],"mem":null},
{"id":"n-01426fa5","guard":[["hasAny",["bassoon","didgeridoo","kazoo","leading zeros","pad with","padded to","piccolo","theremin","violin","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["sense.lastWord"],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-09fe3022","guard":[["hasAny",["concertina","first n","glockenspiel","guitar","harmonica","longest one","longest word","marimba","saxaphone"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":4}]]],"mem":null},
{"id":"n-21698926","guard":[["hasAny",["delete","didgeridoo","kazoo","ladder","piccolo","strip out","theremin","violin"]],["has","or"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-2571db6c","guard":[["hasAny",["didgeridoo","kazoo","ladder","piccolo","separate by","split by","theremin","violin"]],["has","or"]],"pyramid":["render.list",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-47c54065","guard":[["hasAny",["didgeridoo","kazoo","ladder","piccolo","separate by","split","split by","theremin","violin"]],["has","or"]],"pyramid":["render.list",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-5662c7c3","guard":[["hasAny",["bassoon","didgeridoo","kazoo","no vowels","piccolo","remove vowels","separate by","split","split by","theremin","violin","without vowels"]],["has","or"]],"pyramid":["render.lines",["transform.split",["sense.lastWord"],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-57f57158","guard":[["hasAny",["concertina","first n","glockenspiel","guitar","harmonica","longest","longest one","longest word","marimba","saxaphone","take"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-5954d8f9","guard":[["hasAny",["concertina","each word","glockenspiel","harmonica","longest","longest one","longest word","marimba","melodica","saxaphone","split into words","words"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.before",{"lit":"instrument"}]]]],"mem":null},
{"id":"n-5be825d6","guard":[["hasAny",["didgeridoo","kazoo","ladder","piccolo","separate by","split","split by","theremin","violin"]],["has","or"]],"pyramid":["render.lines",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-687b5dda","guard":[["hasAny",["bassoon","how many vowels","kazoo","ladder","normalise","normalize","number of vowels","refrigerator","simplify the text","violin","vowel count"]],["has","or"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-8186da2c","guard":[["hasAny",["didgeridoo","kazoo","ladder","piccolo","separate by","split by","theremin","violin"]],["has","or"]],"pyramid":["render.and",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-91d8a68a","guard":[["hasAny",["concertina","first n","glockenspiel","guitar","harmonica","longest one","longest word","marimba","saxaphone"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-a7545ef4","guard":[["hasAny",["didgeridoo","kazoo","ladder","piccolo","separate by","split","split by","theremin","violin"]],["has","or"]],"pyramid":["render.and",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-af7af59b","guard":[["hasAny",["concertina","first n","glockenspiel","guitar","harmonica","longest","longest one","longest word","marimba","saxaphone","take"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":3}]]],"mem":null},
{"id":"n-b3e81b06","guard":[["hasAny",["blanket","broom","dulcimer","fork","grand","longest","longest one","longest word","normalise","normalize","simplify the text"]],["has","musical"]],"pyramid":["render.str",["transform.norm",["aggregate.longest",["sense.list"]],{"lit":3}]],"mem":null},
{"id":"n-c515a92f","guard":[["hasAny",["add the digits","bassoon","clavichord","concertina","digit sum","item number","ladder","nth","piccolo","position","saxaphone","sum of the digits"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-d0ae998e","guard":[["hasAny",["concertina","first n","glockenspiel","guitar","harmonica","longest","longest one","longest word","marimba","saxaphone","take"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":4}]]],"mem":null},
{"id":"n-e54c9d7e","guard":[["hasAny",["didgeridoo","kazoo","ladder","piccolo","separate by","split by","theremin","violin"]],["has","or"]],"pyramid":["render.lines",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-ed2e59da","guard":[["hasAny",["bassoon","calliope","characters from","clarinet","ladder","letters from to","piccolo","slice of the text","sousaphone","substring"]],["has","or"]],"pyramid":["render.str",["transform.substr",["sense.subject"],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-eeabb5aa","guard":[["hasAny",["bassoon","didgeridoo","kazoo","no vowels","piccolo","remove vowels","separate by","split","split by","theremin","violin","without vowels"]],["has","or"]],"pyramid":["render.and",["transform.split",["sense.lastWord"],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-f9b598c9","guard":[["hasAny",["bassoon","didgeridoo","kazoo","no vowels","piccolo","remove vowels","separate by","split","split by","theremin","violin","without vowels"]],["has","or"]],"pyramid":["render.list",["transform.split",["sense.lastWord"],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-fddf48af","guard":[["hasAny",["concertina","first n","glockenspiel","guitar","harmonica","longest one","longest word","marimba","saxaphone"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":3}]]],"mem":null},
{"id":"n-0b8bd125","guard":[["hasAny",["accordion","bathtub","from position","harpsichord","items from to","longest","longest one","longest word","melodica","slice","ukulele","vuvuzela"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":5},{"lit":10}]]],"mem":null},
{"id":"n-16a2de71","guard":[["hasAny",["bagpipe","banjo","cello","from position","items from to","kazoo","lute","shortest","shortest one","shortest word","slice","viola"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":2},{"lit":5}]]],"mem":null},
{"id":"n-1b9ae716","guard":[["hasAny",["change to","didgeridoo","kazoo","ladder","piccolo","replace","substitute","swap","theremin","violin"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.wordAt",{"lit":2}],["sense.text"]]],"mem":null},
{"id":"n-21df78ac","guard":[["hasAny",["bagpipe","banjo","cello","from position","items from to","kazoo","lute","shortest","shortest one","shortest word","slice","viola"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]]],"mem":null},
{"id":"n-2a17c2ac","guard":[["hasAny",["bagpipe","banjo","calliope","from position","harp","items from to","lyre","shortest","shortest one","shortest word","slice","viola"]],["has","which"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":2},{"lit":4}]]],"mem":null},
{"id":"n-578cdbcf","guard":[["hasAny",["bass","didgeridoo","from position","items from to","longest","longest one","longest word","slice","table","theremin","vase"]]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]]],"mem":null},
{"id":"n-6d53ea91","guard":[["hasAny",["didgeridoo","kazoo","ladder","longest","longest one","longest word","piccolo","separate by","split","split by","theremin","violin"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-7132d7f9","guard":[["hasAny",["bagpipe","banjo","cello","from position","items from to","kazoo","ladder","lute","shortest","shortest one","shortest word","slice"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]]],"mem":null},
{"id":"n-90f2d94d","guard":[["hasAny",["calliope","clarinet","clavichord","dobro","from position","harp","items from to","shortest","shortest one","shortest word","slice","viola"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":2},{"lit":3}]]],"mem":null},
{"id":"n-90fb0918","guard":[["hasAny",["didgeridoo","kazoo","ladder","piccolo","separate by","shortest","shortest one","shortest word","split","split by","theremin","violin"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-d6cbbb7c","guard":[["hasAny",["change to","didgeridoo","kazoo","ladder","piccolo","replace","substitute","swap","theremin","violin"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.wordAt",{"lit":2}],["sense.lastWord"]]],"mem":null},
{"id":"n-ff1a8e95","guard":[["hasAny",["change to","didgeridoo","kazoo","ladder","piccolo","replace","substitute","swap","theremin","violin"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.wordAt",{"lit":2}],["sense.subject"]]],"mem":null},
{"id":"n-5bc7d5b9","guard":[["hasAny",["curtain","dulcimer","item number","longest","longest one","longest word","lyre","nth","position","ukulele","vuvuzela"]],["has","or"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-39c285e1","guard":[["hasAny",["bugle","dobro","guitar","harmonica","harp","item number","longest one","longest word","marimba","nth"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-41013073","guard":[["hasAny",["bugle","dobro","guitar","harmonica","harp","invert case","item number","longest one","longest word","marimba","nth","swap case","toggle case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4cfe0ec4","guard":[["hasAny",["bugle","dobro","guitar","harmonica","harp","item number","longest one","longest word","marimba","nth"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-bf40c4a8","guard":[["hasAny",["bugle","class name","dobro","guitar","harmonica","harp","item number","longest one","longest word","marimba","nth","pascal case","pascalcase","upper camel case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1ab1aa74","guard":[["hasAny",["bugle","dobro","each word","guitar","harmonica","harp","item number","longest one","longest word","marimba","nth","split into words"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2468999b","guard":[["hasAny",["bugle","dobro","each word","guitar","harmonica","harp","item number","longest one","longest word","marimba","nth","split into words"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-038626ab","guard":[["hasAny",["banjo","bathtub","caesar cipher","dulcimer","element","harp","how many letters","item number","kettle","letter count","nth","number of letters","position","rotate the letters","shift by","shift each letter"]]],"pyramid":["render.str",["transform.caesar",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.letters",["sense.text"]]]],"mem":null},
{"id":"n-287facc9","guard":[["hasAny",["calliope","clarinet","element","hammer","item number","nth","position","separate by","sousaphone","split","split by","viola"]],["has","these"]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-3f971223","guard":[["hasAny",["calliope","clarinet","element","hammer","item number","nth","position","separate by","sousaphone","split","split by","viola"]],["has","these"]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-5ec73ff9","guard":[["hasAny",["accordion","bass","bathtub","element","glockenspiel","harpsichord","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-6ef8a302","guard":[["hasAny",["accordion","bass","bathtub","element","glockenspiel","harpsichord","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["sense.wordCount"],["sense.subject"]]],"mem":null},
{"id":"n-967434b3","guard":[["hasAny",["calliope","clarinet","element","hammer","item number","nth","position","separate by","sousaphone","split","split by","viola"]],["has","these"]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a733dffb","guard":[["hasAny",["bassoon","clarinet","element","item number","ladder","longest","longest one","longest word","nth","piccolo","position","separate by","sousaphone","split","split by"]]],"pyramid":["render.str",["aggregate.longest",["transform.split",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-b0021e29","guard":[["hasAny",["accordion","bass","bathtub","element","glockenspiel","harpsichord","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-d55a1567","guard":[["hasAny",["bassoon","calliope","element","item number","ladder","nth","piccolo","position","separate by","shortest","shortest one","shortest word","split","split by","viola"]]],"pyramid":["render.str",["aggregate.shortest",["transform.split",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-e2a7b308","guard":[["hasAny",["calliope","clarinet","delete","element","hammer","item number","nth","position","remove","sousaphone","strip out","viola","without"]],["has","these"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a7af60bb","guard":[["hasAny",["banjo","bass","dulcimer","element","flute","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2df3831d","guard":[["hasAny",["accordion","bathtub","camel case","camelcase","cello","element","item number","longest","longest one","longest word","lower camel case","lute","mandolin","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-75230c68","guard":[["hasAny",["banjo","bass","capitalise","capitalize","capitalize each word","dulcimer","element","flute","item number","longest","longest one","longest word","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-76883fb9","guard":[["hasAny",["accordion","bathtub","cello","class name","element","item number","longest","longest one","longest word","lute","mandolin","nth","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.pascal",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-841e2d66","guard":[["hasAny",["accordion","bathtub","cello","dashes","element","hyphens","item number","kebab case","kebabcase","longest","longest one","longest word","lute","mandolin","nth","position","slug"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.kebab",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ba09fb49","guard":[["hasAny",["banjo","bass","dulcimer","element","flute","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-deb27b1d","guard":[["hasAny",["accordion","bass","bathtub","element","glockenspiel","harpsichord","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-dfcd4a79","guard":[["hasAny",["accordion","bass","bathtub","element","glockenspiel","harpsichord","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-eae3fa9a","guard":[["hasAny",["accordion","bass","bathtub","element","glockenspiel","harpsichord","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-1ba50f05","guard":[["hasAny",["banjo","bass","dulcimer","element","flute","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d98c68aa","guard":[["hasAny",["banjo","bass","dulcimer","element","flute","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4f176a82","guard":[["hasAny",["bagpipe","banjo","candle","kazoo","plate","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.str",["aggregate.shortest",["sense.list"]]],"mem":null},
{"id":"n-0141306b","guard":[["hasAny",["blanket","broom","dulcimer","each word","fork","longest","longest one","longest word","split into words"]]],"pyramid":["render.and",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-21c68de4","guard":[["hasAny",["blanket","broom","dulcimer","each word","fork","longest","longest one","longest word","split into words"]]],"pyramid":["render.lines",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-25905682","guard":[["hasAny",["backwards","bagpipe","banjo","kazoo","ladder","lute","reverse order","reversed","shortest","shortest one","shortest word"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-40e12be6","guard":[["hasAny",["blanket","broom","dulcimer","fork","longest","longest one","longest word","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.str",["transform.reverseWords",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-430f6e4e","guard":[["hasAny",["blanket","broom","camel case","camelcase","dulcimer","fork","longest","longest one","longest word","lower camel case"]]],"pyramid":["render.str",["transform.camel",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-4810ea3e","guard":[["hasAny",["blanket","broom","dashes","dulcimer","fork","hyphens","kebab case","kebabcase","longest","longest one","longest word","slug"]]],"pyramid":["render.str",["transform.kebab",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-636c7f5d","guard":[["hasAny",["blanket","broom","class name","dulcimer","fork","longest","longest one","longest word","pascal case","pascalcase","upper camel case"]]],"pyramid":["render.str",["transform.pascal",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-7a42eb35","guard":[["hasAny",["blanket","broom","dulcimer","fork","longest","longest one","longest word","snake case","snakecase","underscores","variable name"]]],"pyramid":["render.str",["transform.snake",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-7be7fe43","guard":[["hasAny",["broom","calliope","element","fork","grand","item number","nth","position"]],["has","musical"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":1}]],"mem":null},
{"id":"n-a85e47ad","guard":[["hasAny",["blanket","broom","dulcimer","each word","fork","longest","longest one","longest word","split into words"]]],"pyramid":["render.list",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-ca4acd98","guard":[["hasAny",["bagpipe","banjo","candle","invert case","kazoo","plate","shortest","shortest one","shortest word","swap case","toggle case"]],["has","which"]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-cc48a05d","guard":[["hasAny",["bagpipe","banjo","candle","class name","kazoo","pascal case","pascalcase","plate","shortest","shortest one","shortest word","upper camel case"]],["has","which"]],"pyramid":["render.str",["transform.pascal",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-dadf5b22","guard":[["hasAny",["broom","calliope","fork","grand","item number","nth","position"]],["has","musical"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":1}]],"mem":null},
{"id":"n-e0e0cc46","guard":[["hasAny",["a to z","alphabetical","alphabetize","bagpipe","banjo","kazoo","ladder","lute","shortest","shortest one","shortest word"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["sense.content"]]]],"mem":null},
{"id":"n-fa0f6a1f","guard":[["hasAny",["bagpipe","banjo","kazoo","ladder","lute","reverse order","reversed","shortest","shortest one","shortest word"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-1958dbe7","guard":[["hasAny",["broom","calliope","capitalise","capitalize","capitalize each word","element","fork","grand","item number","nth","position","title case"]],["has","musical"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.list"],{"lit":1}]]],"mem":null},
{"id":"n-1ae522e8","guard":[["hasAny",["didgeridoo","ladder","piccolo","separate by","shortest","shortest one","shortest word","split","split by","theremin","violin"]],["has","or"]],"pyramid":["render.list",["transform.split",["sense.lastWord"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-28534a3f","guard":[["hasAny",["didgeridoo","ladder","piccolo","separate by","shortest","shortest one","shortest word","split","split by","theremin","violin"]],["has","or"]],"pyramid":["render.lines",["transform.split",["sense.lastWord"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-3b219daa","guard":[["hasAny",["backwards","calliope","clarinet","item number","nth","position","reverse order","reversed","sousaphone","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":3}]],"mem":null},
{"id":"n-446433ba","guard":[["hasAny",["broom","calliope","element","fork","grand","invert case","item number","nth","position","swap case","toggle case"]],["has","musical"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.list"],{"lit":1}]]],"mem":null},
{"id":"n-60f7afb3","guard":[["hasAny",["blanket","broom","dulcimer","each word","fork","longest","longest one","longest word","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["aggregate.longest",["sense.list"]]]]],"mem":null},
{"id":"n-6e67455a","guard":[["hasAny",["backwards","calliope","clarinet","item number","nth","position","reverse order","reversed","sousaphone","viola","vuvuzela"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":4}]],"mem":null},
{"id":"n-a7f4c4cf","guard":[["hasAny",["blanket","broom","dulcimer","each word","fork","longest","longest one","longest word","split into words"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["aggregate.longest",["sense.list"]]]]],"mem":null},
{"id":"n-b8fe1e40","guard":[["hasAny",["bagpipe","banjo","calliope","candle","first n","plate","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-d475b4ac","guard":[["hasAny",["a to z","alphabetical","alphabetize","bagpipe","banjo","calliope","dulcimer","element","grand","item number","nth","position"]],["has","musical"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.list"]],{"lit":1}]],"mem":null},
{"id":"n-db855237","guard":[["hasAny",["didgeridoo","ladder","piccolo","separate by","shortest","shortest one","shortest word","split","split by","theremin","violin"]],["has","or"]],"pyramid":["render.and",["transform.split",["sense.lastWord"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-eb9e6f31","guard":[["hasAny",["a to z","alphabetical","alphabetize","bugle","didgeridoo","dobro","glockenspiel","harmonica","item number","nth","position"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":3}]],"mem":null},
{"id":"n-6a3d7d28","guard":[["hasAny",["from position","glockenspiel","harmonica","harpsichord","items from to","longest","longest one","longest word","marimba","melodica","slice"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":3},{"lit":10}]]],"mem":null},
{"id":"n-9ccc09ec","guard":[["hasAny",["bagpipe","banjo","cello","from position","items from to","kazoo","lute","shortest","shortest one","shortest word","slice"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]]],"mem":null},
{"id":"n-5eea5e7a","guard":[["hasAny",["banjo","bass","flute","item number","longest","longest one","longest word","nth","position","vase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ab1bfa2e","guard":[["hasAny",["broom","calliope","element","fork","grand","item number","nth","position"]],["has","musical"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7d91f729","guard":[["hasAny",["broom","calliope","element","first n","fork","grand","item number","nth","position","take","top"]],["has","musical"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c01be333","guard":[["hasAny",["broom","calliope","element","first n","fork","grand","item number","nth","position","take","top"]],["has","musical"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5e90e0ed","guard":[["hasAny",["cup","curtain","delete","element","item number","lyre","nth","position","remove","sponge","strip out","without"]],["has","among"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.lastWord"]]],"mem":null},
{"id":"n-011672e8","guard":[["hasAny",["change to","element","french","item number","lyre","melodica","nth","position","replace","substitute","swap","ukulele"]],["has","among"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-11aaea1a","guard":[["hasAny",["bassoon","digit count","element","how many digits","hurdygurdy","item number","ladder","nth","number of digits","piccolo","position"]],["has","pick"]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-9b67be53","guard":[["hasAny",["bassoon","digit count","element","how many digits","hurdygurdy","item number","ladder","nth","number of digits","piccolo","position"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-d7253e49","guard":[["hasAny",["bassoon","broom","delete","element","eraser","item number","nth","piccolo","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.after",{"lit":"from"}]]],"mem":null},
{"id":"n-fa0e88a9","guard":[["hasAny",["bassoon","digit count","element","how many digits","hurdygurdy","item number","ladder","nth","number of digits","piccolo","position"]],["has","pick"]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-229e27b7","guard":[["hasAny",["bugle","element","guitar","harpsichord","how many vowels","item number","marimba","nth","number of vowels","position","vowel count"]]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-37216aff","guard":[["hasAny",["calliope","clarinet","element","item number","nth","position","sousaphone","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5ca79c64","guard":[["hasAny",["bugle","element","guitar","harpsichord","how many vowels","item number","marimba","nth","number of vowels","position","vowel count"]]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-b28d42ee","guard":[["hasAny",["bugle","element","guitar","harpsichord","how many vowels","item number","marimba","nth","number of vowels","position","vowel count"]]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-e76f8409","guard":[["hasAny",["didgeridoo","element","item number","kazoo","nth","position","theremin","violin"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1cfeca43","guard":[["hasAny",["calliope","camel case","camelcase","clarinet","element","item number","lower camel case","nth","position","sousaphone","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-72205cf7","guard":[["hasAny",["calliope","clarinet","element","invert case","item number","nth","position","sousaphone","swap case","toggle case","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fb7b722a","guard":[["hasAny",["calliope","capitalise","capitalize","capitalize each word","clarinet","element","item number","nth","position","sousaphone","title case","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9a9ee61b","guard":[["hasAny",["calliope","clarinet","element","item number","normalise","normalize","nth","position","simplify the text","sousaphone","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a5534f6d","guard":[["hasAny",["calliope","clarinet","element","item number","nth","position","sousaphone","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b4ec4507","guard":[["hasAny",["calliope","clarinet","element","item number","nth","position","sousaphone","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-458cc5be","guard":[["hasAny",["backwards","change to","didgeridoo","kazoo","replace","reversed","spell backwards","substitute","swap","theremin","violin"]],["has","which"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["transform.reverse",["sense.lastWord"]]]],"mem":null},
{"id":"n-4bccc46b","guard":[["hasAny",["backwards","change to","didgeridoo","kazoo","replace","reversed","spell backwards","substitute","swap","theremin","violin"]],["has","which"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["transform.reverse",["sense.text"]]]],"mem":null},
{"id":"n-9011aef9","guard":[["hasAny",["backwards","didgeridoo","each word","glockenspiel","harpsichord","longest","longest one","longest word","reversed","sousaphone","spell backwards","split into words"]],["has","or"]],"pyramid":["render.str",["transform.reverse",["aggregate.longest",["transform.words",["transform.reverse",["sense.text"]]]]]],"mem":null},
{"id":"n-09812163","guard":[["hasAny",["a to z","alphabetical","alphabetize","bagpipe","banjo","candle","kazoo","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["sense.list"]]]],"mem":null},
{"id":"n-2cde9cd7","guard":[["hasAny",["backwards","bagpipe","banjo","candle","kazoo","reverse","reverse order","reversed","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.list"]]]],"mem":null},
{"id":"n-4b3e0a52","guard":[["hasAny",["backwards","didgeridoo","glockenspiel","harpsichord","longest","longest one","longest word","reverse order","reversed","sousaphone"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-70c50481","guard":[["hasAny",["didgeridoo","glockenspiel","harpsichord","longest one","longest word","reverse order","reversed","sousaphone"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-72705604","guard":[["hasAny",["a to z","alphabetical","alphabetize","concertina","didgeridoo","glockenspiel","harpsichord","longest one","longest word"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sortStrs",["sense.words"]]]],"mem":null},
{"id":"n-78404cbd","guard":[["hasAny",["item number","nth","position","table","theremin","toaster"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":3}]],"mem":null},
{"id":"n-a85eef81","guard":[["hasAny",["a to z","alphabetical","alphabetize","concertina","didgeridoo","glockenspiel","harpsichord","longest","longest one","longest word"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sortStrs",["sense.words"]]]],"mem":null},
{"id":"n-07842480","guard":[["hasAny",["change to","didgeridoo","kazoo","replace","substitute","swap","theremin","violin"]],["has","which"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],{"lit":"instrument"}]],"mem":null},
{"id":"n-0bb74689","guard":[["hasAny",["banjo","first n","harp","lyre","shortest","shortest one","shortest word","take","viola"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-0fe186e7","guard":[["hasAny",["add the digits","digit sum","normalise","normalize","simplify the text","sum of the digits","theremin","toaster","violin"]]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-12be72e1","guard":[["hasAny",["change to","didgeridoo","kazoo","replace","theremin","violin"]],["has","which"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.text"]]],"mem":null},
{"id":"n-18b94049","guard":[["hasAny",["delete","remove","strip out","theremin","toaster","violin","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-1dad4503","guard":[["hasAny",["bassoon","characters from","ladder","letters from to","piccolo","slice of the text","sousaphone","substring"]],["has","or"]],"pyramid":["render.str",["transform.substr",["sense.subject"],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-2fce9a7e","guard":[["hasAny",["didgeridoo","from position","items from to","kazoo","slice","theremin","violin"]]],"pyramid":["render.and",["transform.sliceStrs",["sense.content"],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-6aaa4a7a","guard":[["hasAny",["accordion","bathtub","cup","each word","longest","longest one","longest word","split into words","vase","words"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"from"}]]]],"mem":null},
{"id":"n-717b4c45","guard":[["hasAny",["didgeridoo","from position","items from to","kazoo","slice","theremin","violin"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-77897bba","guard":[["hasAny",["bagpipe","banjo","camel case","camelcase","candle","dulcimer","item number","lower camel case","nth","position"]]],"pyramid":["render.str",["transform.camel",["transform.nthStr",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-78e6777e","guard":[["hasAny",["change to","didgeridoo","kazoo","replace","substitute","swap","theremin","violin"]],["has","which"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],{"lit":"musical"}]],"mem":null},
{"id":"n-8a2b987d","guard":[["hasAny",["change to","didgeridoo","kazoo","replace","substitute","swap","theremin","violin"]],["has","which"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],{"lit":"flute"}]],"mem":null},
{"id":"n-9d270e60","guard":[["hasAny",["a to z","alphabetical","alphabetize","concertina","didgeridoo","each word","glockenspiel","harpsichord","longest","longest one","longest word","split into words"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sortStrs",["transform.words",["sense.text"]]]]],"mem":null},
{"id":"n-a7d7529e","guard":[["hasAny",["broom","calliope","camel case","camelcase","fork","item number","lower camel case","nth","position"]]],"pyramid":["render.str",["transform.camel",["transform.nthStr",["sense.list"],{"lit":1}]]],"mem":null},
{"id":"n-add848b6","guard":[["hasAny",["banjo","first n","harp","lyre","shortest","shortest one","shortest word","viola"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-ae2d1fce","guard":[["hasAny",["change to","didgeridoo","kazoo","replace","substitute","swap","theremin","violin"]],["has","which"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],{"lit":"piano"}]],"mem":null},
{"id":"n-c1e40441","guard":[["hasAny",["change to","didgeridoo","kazoo","replace","substitute","swap","theremin","violin"]],["has","which"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.text"]]],"mem":null},
{"id":"n-d4edcd30","guard":[["hasAny",["bassoon","eraser","from position","items from to","piano","piccolo"]],["has","pick"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],["sense.wordCount"],{"lit":10}]],"mem":null},
{"id":"n-d6c25b77","guard":[["hasAny",["change to","didgeridoo","kazoo","replace","substitute","swap","theremin","violin"]],["has","which"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],{"lit":"grand"}]],"mem":null},
{"id":"n-d96707c9","guard":[["hasAny",["bassoon","eraser","from position","items from to","piano","piccolo","slice"]],["has","pick"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],["sense.wordCount"],{"lit":10}]],"mem":null},
{"id":"n-df12ed1f","guard":[["hasAny",["bassoon","characters from","ladder","letters from to","piccolo","slice of the text","sousaphone","substring"]],["has","or"]],"pyramid":["render.str",["transform.substr",["sense.subject"],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-e5f3a275","guard":[["hasAny",["delete","strip out","theremin","toaster","violin"]],["has","which"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ed01f298","guard":[["hasAny",["didgeridoo","from position","items from to","kazoo","slice","theremin","violin"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-03c672a2","guard":[["hasAny",["change to","didgeridoo","kazoo","replace","substitute","swap","theremin","violin"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.after",{"lit":"instrument"}]]],"mem":null},
{"id":"n-129a09a6","guard":[["hasAny",["accordion","bathtub","from position","harpsichord","items from to","longest","longest one","longest word","slice","vuvuzela"]],["has","pick"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":5},["sense.wordCount"]]]],"mem":null},
{"id":"n-17961f63","guard":[["hasAny",["change to","didgeridoo","kazoo","replace","substitute","swap","theremin","violin"]],["has","which"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.before",{"lit":"instrument"}]]],"mem":null},
{"id":"n-62ccdbd2","guard":[["hasAny",["change to","didgeridoo","kazoo","replace","substitute","swap","theremin","violin"]],["has","which"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.before",{"lit":"musical"}]]],"mem":null},
{"id":"n-77455aac","guard":[["hasAny",["bagpipe","banjo","candle","from position","items from to","kazoo","shortest","shortest one","shortest word","slice"]]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]]],"mem":null},
{"id":"n-787cd7b0","guard":[["hasAny",["change to","didgeridoo","kazoo","replace","substitute","swap","theremin","violin"]],["has","which"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.after",{"lit":"musical"}]]],"mem":null},
{"id":"n-9851dc68","guard":[["hasAny",["change to","didgeridoo","kazoo","replace","substitute","swap","theremin","violin"]],["has","which"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-b6b562ec","guard":[["hasAny",["change to","replace","substitute","swap","theremin","toaster","violin"]],["has","which"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ae16e555","guard":[["hasAny",["bass","french","item number","kettle","nth","organ","position"]],["has","musical"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a musical instrument."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-5536f5f0","guard":[["hasAny",["didgeridoo","item number","kazoo","nth","theremin","violin"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-333f0ea4","guard":[["hasAny",["broom","element","fork","grand","item number","longest","longest one","longest word","nth","position"]],["has","musical"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8d28e84a","guard":[["hasAny",["didgeridoo","invert case","item number","kazoo","nth","swap case","theremin","toggle case","violin"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a2fa85bc","guard":[["hasAny",["bass","french","item number","kettle","longest","longest one","longest word","nth","organ","position"]],["has","musical"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a musical ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f752473b","guard":[["hasAny",["class name","didgeridoo","item number","kazoo","nth","pascal case","pascalcase","theremin","upper camel case","violin"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.pascal",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-00d233d5","guard":[["hasAny",["broom","element","first n","fork","grand","item number","longest","longest one","longest word","nth","position","take","top"]],["has","musical"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-72618a74","guard":[["hasAny",["didgeridoo","each word","item number","kazoo","nth","split into words","theremin","violin"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-732f62b0","guard":[["hasAny",["calliope","clarinet","item number","nth","sousaphone","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-77779596","guard":[["hasAny",["broom","element","first n","fork","grand","item number","longest","longest one","longest word","nth","position","take","top"]],["has","musical"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-944fc956","guard":[["hasAny",["didgeridoo","item number","kazoo","nth","theremin","violin"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c8712be4","guard":[["hasAny",["didgeridoo","item number","kazoo","nth","theremin","violin"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f7478275","guard":[["hasAny",["didgeridoo","each word","item number","kazoo","nth","split into words","theremin","violin"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-049009e5","guard":[["hasAny",["bassoon","element","item number","ladder","nth","piccolo","position","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-1d24699f","guard":[["hasAny",["bassoon","delete","element","item number","ladder","nth","piccolo","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-20f33276","guard":[["hasAny",["bassoon","delete","element","item number","ladder","nth","piccolo","position","remove","strip out","without"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-bce0e0c0","guard":[["hasAny",["bassoon","element","item number","ladder","nth","piccolo","position","separate by","split","split by"]]],"pyramid":["render.and",["transform.split",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-ccccb2d0","guard":[["hasAny",["bassoon","element","item number","ladder","nth","piccolo","position","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-134dc654","guard":[["hasAny",["bassoon","change to","element","item number","ladder","nth","piccolo","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["sense.text"]]],"mem":null},
{"id":"n-1b9b7c35","guard":[["hasAny",["bassoon","element","how many words","item number","ladder","nth","number of words","piccolo","position","word count"]],["has","pick"]],"pyramid":["render.and",["iterate.repeat",["sense.subject"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-2dddf83e","guard":[["hasAny",["bass","element","glockenspiel","harpsichord","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":10},["sense.lastWord"]]],"mem":null},
{"id":"n-3378ca8c","guard":[["hasAny",["characters from","element","item number","kazoo","ladder","letters from to","lyre","nth","position","slice of the text","substring"]],["has","or"]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":1},{"lit":5}]],"mem":null},
{"id":"n-34d72461","guard":[["hasAny",["bassoon","element","how many words","item number","ladder","nth","number of words","piccolo","position","word count"]]],"pyramid":["render.and",["iterate.repeat",["sense.subject"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-426eb0ec","guard":[["hasAny",["bassoon","camel case","camelcase","delete","element","item number","ladder","lower camel case","nth","piccolo","position","remove","strip out","without"]],["has","pick"]],"pyramid":["render.str",["transform.camel",["transform.remove",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-5149cf59","guard":[["hasAny",["bassoon","element","how many words","item number","ladder","nth","number of words","piccolo","position","word count"]]],"pyramid":["render.lines",["iterate.repeat",["sense.subject"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-56a462f3","guard":[["hasAny",["bassoon","element","item number","ladder","leading zeros","nth","pad","pad with","padded to","piccolo","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["sense.subject"],{"lit":4},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-56c22127","guard":[["hasAny",["bassoon","element","how many words","item number","ladder","nth","number of words","piccolo","position","word count"]],["has","pick"]],"pyramid":["render.and",["iterate.repeat",["sense.subject"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-6481af74","guard":[["hasAny",["bassoon","element","how many words","item number","ladder","nth","number of words","piccolo","position","word count"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-73f78535","guard":[["hasAny",["baby","delete","element","item number","nth","organ","position","remove","strip out","vase","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["sense.after",{"lit":"from"}]]],"mem":null},
{"id":"n-76aa6db0","guard":[["hasAny",["bassoon","element","how many words","item number","ladder","nth","number of words","piccolo","position","word count"]],["has","pick"]],"pyramid":["render.lines",["iterate.repeat",["sense.subject"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-94b8d191","guard":[["hasAny",["bassoon","change to","element","item number","ladder","nth","piccolo","position","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.subject"]]],"mem":null},
{"id":"n-9555218d","guard":[["hasAny",["bassoon","element","how many words","item number","ladder","nth","number of words","piccolo","position","word count"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-9845c350","guard":[["hasAny",["bassoon","element","how many words","item number","ladder","nth","number of words","piccolo","position","word count"]]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-9b2d3340","guard":[["hasAny",["bassoon","camel case","camelcase","delete","element","item number","ladder","lower camel case","nth","piccolo","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.camel",["transform.remove",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null},
{"id":"n-adb6482f","guard":[["hasAny",["bassoon","element","item number","ladder","leading zeros","nth","pad","pad with","padded to","piccolo","position","zero pad"]],["has","pick"]],"pyramid":["render.str",["transform.padStart",["sense.subject"],{"lit":4},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-c02895d4","guard":[["hasAny",["didgeridoo","element","french","hurdygurdy","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":10},["sense.lastWord"]]],"mem":null},
{"id":"n-c2bd392b","guard":[["hasAny",["camel case","camelcase","curtain","delete","element","item number","lower camel case","lyre","nth","position","remove","sponge","strip out","without"]],["has","among"]],"pyramid":["render.str",["transform.camel",["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-cfae630f","guard":[["hasAny",["didgeridoo","element","french","hurdygurdy","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":10},["sense.subject"]]],"mem":null},
{"id":"n-d3090a50","guard":[["hasAny",["bassoon","element","how many words","item number","ladder","nth","number of words","piccolo","position","word count"]],["has","pick"]],"pyramid":["render.lines",["iterate.repeat",["sense.subject"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]]],"mem":null},
{"id":"n-d5b6938a","guard":[["hasAny",["bassoon","element","item number","ladder","leading zeros","nth","pad","pad with","padded to","piccolo","position","zero pad"]],["has","pick"]],"pyramid":["render.str",["transform.padStart",["sense.subject"],{"lit":4},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-d9e0b1fd","guard":[["hasAny",["didgeridoo","element","french","hurdygurdy","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-df8bb5ab","guard":[["hasAny",["bass","element","glockenspiel","harpsichord","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":10},["sense.subject"]]],"mem":null},
{"id":"n-eb095769","guard":[["hasAny",["bass","element","glockenspiel","harpsichord","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-ee3e43cc","guard":[["hasAny",["bassoon","change to","element","item number","ladder","nth","piccolo","position","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["sense.subject"]]],"mem":null},
{"id":"n-f98f4164","guard":[["hasAny",["bassoon","change to","element","item number","ladder","nth","piccolo","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["sense.subject"]]],"mem":null},
{"id":"n-fca47f58","guard":[["hasAny",["bassoon","change to","element","item number","ladder","nth","piccolo","position","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["sense.text"]]],"mem":null},
{"id":"n-3b1b2779","guard":[["hasAny",["clavichord","concertina","element","item number","nth","position","saxaphone"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-7161c600","guard":[["hasAny",["banjo","element","item number","kazoo","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.shortest",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}]],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0763e797","guard":[["hasAny",["element","item number","longest","longest one","longest word","lyre","melodica","nth","position","ukulele"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-209f53f2","guard":[["hasAny",["bassoon","element","item number","ladder","nth","piccolo","position","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",["sense.subject"],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-250ec2f1","guard":[["hasAny",["camel case","camelcase","clavichord","concertina","element","item number","lower camel case","nth","position","saxaphone"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-2bd73510","guard":[["hasAny",["bassoon","delete","element","item number","ladder","nth","piccolo","position","remove","strip out","without"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-3234e7a5","guard":[["hasAny",["clavichord","concertina","element","invert case","item number","nth","position","saxaphone","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-3c038136","guard":[["hasAny",["bassoon","delete","element","item number","ladder","nth","piccolo","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.subject"],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-46d7c7c3","guard":[["hasAny",["bassoon","element","item number","ladder","nth","piccolo","position","separate by","split","split by"]],["has","pick"]],"pyramid":["render.list",["transform.split",["sense.subject"],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-693ba29c","guard":[["hasAny",["bassoon","element","item number","ladder","nth","piccolo","position","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",["sense.subject"],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-6dab6077","guard":[["hasAny",["bassoon","element","item number","ladder","nth","piccolo","position","separate by","split","split by"]],["has","pick"]],"pyramid":["render.and",["transform.split",["sense.subject"],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-885b822b","guard":[["hasAny",["baby","element","item number","longest","longest one","longest word","nth","organ","position","vuvuzela"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-badae033","guard":[["hasAny",["capitalise","capitalize","capitalize each word","clavichord","concertina","element","item number","nth","position","saxaphone","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-c470adbb","guard":[["hasAny",["bassoon","element","item number","ladder","nth","piccolo","position","separate by","split","split by"]],["has","pick"]],"pyramid":["render.lines",["transform.split",["sense.subject"],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-d605b7f9","guard":[["hasAny",["bassoon","delete","element","item number","ladder","nth","piccolo","position","remove","strip out","without"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-f4528312","guard":[["hasAny",["bassoon","element","item number","ladder","nth","piccolo","position","separate by","split","split by"]]],"pyramid":["render.and",["transform.split",["sense.subject"],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"}]]],"mem":null},
{"id":"n-f9919545","guard":[["hasAny",["clarinet","element","item number","longest","longest one","longest word","nth","position","sousaphone","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-13db51c2","guard":[["hasAny",["bassoon","change to","element","item number","ladder","nth","piccolo","position","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-38bddf6e","guard":[["hasAny",["clavichord","concertina","element","item number","normalise","normalize","nth","position","saxaphone","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-409ac51f","guard":[["hasAny",["bassoon","change to","element","item number","ladder","nth","piccolo","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-470cef53","guard":[["hasAny",["capitalise","capitalize","capitalize each word","clarinet","element","item number","longest","longest one","longest word","nth","position","sousaphone","title case","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5560f7b5","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","longest","longest one","longest word","lyre","melodica","nth","position","ukulele","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.upper",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-59032e36","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","lyre","melodica","nth","position","title case","ukulele"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-68832e6c","guard":[["hasAny",["baby","element","invert case","item number","longest","longest one","longest word","nth","organ","position","swap case","toggle case","vuvuzela"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6c71afdf","guard":[["hasAny",["clarinet","element","invert case","item number","longest","longest one","longest word","nth","position","sousaphone","swap case","toggle case","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-879d0d5e","guard":[["hasAny",["bassoon","change to","element","item number","ladder","nth","piccolo","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-98cd0023","guard":[["hasAny",["bass","element","glockenspiel","harpsichord","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":10},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-9eb2b87e","guard":[["hasAny",["bass","element","glockenspiel","harpsichord","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":10},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-a7b01d24","guard":[["hasAny",["didgeridoo","element","french","hurdygurdy","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-b8715111","guard":[["hasAny",["element","invert case","item number","longest","longest one","longest word","lyre","melodica","nth","position","swap case","toggle case","ukulele"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c315d960","guard":[["hasAny",["bassoon","change to","element","item number","ladder","nth","piccolo","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-caa0d041","guard":[["hasAny",["bass","element","glockenspiel","harpsichord","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":10},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-d617b770","guard":[["hasAny",["baby","capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","nth","organ","position","title case","vuvuzela"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f13e2dd9","guard":[["hasAny",["didgeridoo","element","french","hurdygurdy","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-f20cb1d8","guard":[["hasAny",["baby","change to","element","item number","nth","organ","position","replace","substitute","swap","vuvuzela"]]],"pyramid":["render.str",["transform.replace",["sense.subject"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-fa30b37a","guard":[["hasAny",["didgeridoo","element","french","hurdygurdy","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","or"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-fdab8f12","guard":[["hasAny",["element","item number","longest","longest one","longest word","lower case","lowercase","lyre","melodica","nth","position","small letters","ukulele"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.lower",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-21f74657","guard":[["hasAny",["clavichord","concertina","element","item number","nth","position","saxaphone"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":1}]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-691498b0","guard":[["hasAny",["bagpipe","banjo","camel case","camelcase","dulcimer","element","item number","lower camel case","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.camel",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-77e9f3e3","guard":[["hasAny",["bagpipe","banjo","class name","dulcimer","element","item number","nth","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.pascal",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9e755745","guard":[["hasAny",["bagpipe","banjo","dashes","dulcimer","element","hyphens","item number","kebab case","kebabcase","nth","position","slug"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.kebab",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b95d7a05","guard":[["hasAny",["clarinet","element","item number","longest","longest one","longest word","normalise","normalize","nth","position","simplify the text","sousaphone","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cef0ebeb","guard":[["hasAny",["clavichord","concertina","element","item number","nth","position","saxaphone"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":1}]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-01cf08ef","guard":[["hasAny",["clarinet","element","item number","longest","longest one","longest word","nth","position","sousaphone","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4a296277","guard":[["hasAny",["baby","element","item number","longest","longest one","longest word","nth","organ","position","vuvuzela"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4e6563f1","guard":[["hasAny",["clarinet","element","item number","longest","longest one","longest word","nth","position","sousaphone","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c17a7027","guard":[["hasAny",["element","item number","longest","longest one","longest word","lyre","melodica","nth","position","ukulele"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":1}]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c5140dec","guard":[["hasAny",["baby","element","item number","longest","longest one","longest word","nth","organ","position","vuvuzela"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-dfd0f89b","guard":[["hasAny",["element","item number","longest","longest one","longest word","lyre","melodica","nth","position","ukulele"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":1}]],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-885cb6d5","guard":[["hasAny",["bagpipe","calliope","didgeridoo","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":"corpora-instruments"},{"lit":"item"},{"lit":"member"},{"lit":"yes"}],{"lit":1}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-363b7177","guard":[["hasAny",["bassoon","class name","ladder","pascal case","pascalcase","piccolo","reversed","spell backwards","upper camel case"]],["has","pick"]],"pyramid":["render.str",["transform.reverse",["transform.pascal",["transform.reverse",["sense.subject"]]]]],"mem":null},
{"id":"n-9fb55f6e","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","ladder","piccolo","reversed","spell backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverse",["transform.title",["transform.reverse",["sense.subject"]]]]],"mem":null},
{"id":"n-b8bda627","guard":[["hasAny",["backwards","bassoon","capitalise","capitalize","capitalize each word","ladder","piccolo","reversed","spell backwards","title case"]],["has","pick"]],"pyramid":["render.str",["transform.reverse",["transform.title",["transform.reverse",["sense.subject"]]]]],"mem":null},
{"id":"n-db2112c3","guard":[["hasAny",["bassoon","camel case","camelcase","ladder","lower camel case","piccolo","reversed","spell backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverse",["transform.camel",["transform.reverse",["sense.subject"]]]]],"mem":null},
{"id":"n-3e23724b","guard":[["hasAny",["backwards","bassoon","ladder","normalise","normalize","piccolo","reversed","simplify the text","spell backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverse",["transform.norm",["transform.reverse",["sense.subject"]],{"lit":3}]]],"mem":null},
{"id":"n-85a0d799","guard":[["hasAny",["backwards","bassoon","capitalise","capitalize","capitalize each word","invert case","ladder","piccolo","reversed","spell backwards","swap case","title case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.reverse",["transform.swapCase",["transform.title",["transform.reverse",["sense.subject"]]]]]],"mem":null},
{"id":"n-a1c45c86","guard":[["hasAny",["backwards","capitalise","capitalize","capitalize each word","clavichord","concertina","reversed","saxaphone","spell backwards","title case"]],["has","among"]],"pyramid":["render.str",["transform.reverse",["transform.title",["transform.reverse",["sense.wordAt",{"lit":2}]]]]],"mem":null},
{"id":"n-ab20e793","guard":[["hasAny",["backwards","banjo","capitalise","capitalize","capitalize each word","kazoo","reversed","shortest","shortest one","shortest word","spell backwards","title case","viola"]],["has","which"]],"pyramid":["render.str",["transform.reverse",["transform.title",["transform.reverse",["aggregate.shortest",["sense.content"]]]]]],"mem":null},
{"id":"n-bf7736f8","guard":[["hasAny",["bassoon","ladder","normalise","normalize","piccolo","reversed","simplify the text","spell backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverse",["transform.norm",["transform.reverse",["sense.subject"]],{"lit":3}]]],"mem":null},
{"id":"n-c6c7a0c4","guard":[["hasAny",["class name","clavichord","concertina","pascal case","pascalcase","reversed","saxaphone","spell backwards","upper camel case"]],["has","among"]],"pyramid":["render.str",["transform.reverse",["transform.pascal",["transform.reverse",["sense.wordAt",{"lit":2}]]]]],"mem":null},
{"id":"n-dd2a7c06","guard":[["hasAny",["backwards","bassoon","capitalise","capitalize","capitalize each word","ladder","piccolo","reverse the words","reverse word order","reversed","spell backwards","title case","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverse",["transform.reverseWords",["transform.title",["transform.reverse",["sense.subject"]]]]]],"mem":null},
{"id":"n-f2c4d07b","guard":[["hasAny",["backwards","capitalise","capitalize","capitalize each word","concertina","glockenspiel","harpsichord","longest","longest one","longest word","reversed","spell backwards","title case"]],["has","or"]],"pyramid":["render.str",["transform.reverse",["transform.title",["transform.reverse",["aggregate.longest",["sense.words"]]]]]],"mem":null},
{"id":"n-026b6877","guard":[["hasAny",["backwards","bassoon","change to","ladder","piccolo","replace","reversed","spell backwards","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.reverse",["transform.replace",["sense.subject"],["sense.lastWord"],["transform.reverse",["sense.lastWord"]]]]],"mem":null},
{"id":"n-44f67696","guard":[["hasAny",["backwards","bassoon","change to","ladder","piccolo","replace","reversed","spell backwards","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.reverse",["transform.replace",["sense.subject"],["sense.lastWord"],["transform.reverse",["sense.subject"]]]]],"mem":null},
{"id":"n-8196257b","guard":[["hasAny",["backwards","bassoon","change to","ladder","piccolo","replace","reversed","spell backwards","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.reverse",["transform.replace",["sense.lastWord"],["sense.subject"],["transform.reverse",["sense.lastWord"]]]]],"mem":null},
{"id":"n-03637015","guard":[["hasAny",["bassoon","dashes","hyphens","kebab case","kebabcase","ladder","piccolo"]],["has","pick"]],"pyramid":["render.str",["transform.kebab",["sense.subject"]]],"mem":null},
{"id":"n-03884744","guard":[["hasAny",["concertina","glockenspiel","harpsichord","longest one","longest word"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-198602b6","guard":[["hasAny",["concertina","glockenspiel","harpsichord","longest","longest one","longest word"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1e3607d8","guard":[["hasAny",["banjo","kazoo","shortest","shortest one","shortest word","viola"]],["has","which"]],"pyramid":["render.str",["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-46a5cd39","guard":[["hasAny",["bassoon","each word","ladder","piccolo","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-4cc1bda0","guard":[["hasAny",["bassoon","class name","ladder","pascal case","pascalcase","piccolo","upper camel case"]],["has","pick"]],"pyramid":["render.str",["transform.pascal",["sense.subject"]]],"mem":null},
{"id":"n-84b05fe8","guard":[["hasAny",["bassoon","ladder","piccolo","snake case","snakecase","underscores","variable name"]],["has","pick"]],"pyramid":["render.str",["transform.snake",["sense.subject"]]],"mem":null},
{"id":"n-99a69828","guard":[["hasAny",["bassoon","camel case","camelcase","ladder","lower camel case","piccolo"]],["has","pick"]],"pyramid":["render.str",["transform.camel",["sense.subject"]]],"mem":null},
{"id":"n-b631b148","guard":[["hasAny",["bassoon","each word","ladder","piccolo","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-b636232d","guard":[["hasAny",["bassoon","each word","ladder","piccolo","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-b7249739","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","ladder","piccolo"]],["has","pick"]],"pyramid":["render.str",["transform.title",["sense.subject"]]],"mem":null},
{"id":"n-bfcea04a","guard":[["hasAny",["bassoon","invert case","ladder","piccolo","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["sense.subject"]]],"mem":null},
{"id":"n-cabee6d0","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","ladder","piccolo","title case"]],["has","pick"]],"pyramid":["render.str",["transform.title",["sense.subject"]]],"mem":null},
{"id":"n-f5518a3d","guard":[["hasAny",["bassoon","ladder","piccolo","reverse the words","reverse word order","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverseWords",["sense.subject"]]],"mem":null},
{"id":"n-020bc319","guard":[["hasAny",["bassoon","dashes","hyphens","kebab case","kebabcase","ladder","piccolo","reverse the words","reverse word order","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.kebab",["transform.reverseWords",["sense.subject"]]]],"mem":null},
{"id":"n-04a92ddb","guard":[["hasAny",["bassoon","delete","ladder","piccolo","strip out"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"flute"}]],"mem":null},
{"id":"n-12c5b78d","guard":[["hasAny",["a to z","alphabetical","alphabetize","bassoon","each word","ladder","piccolo","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-1565e684","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","split","split by"]],["has","pick"]],"pyramid":["render.lines",["transform.split",["sense.subject"],{"lit":"flute"}]],"mem":null},
{"id":"n-2472cdb8","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","split","split by"]],["has","pick"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"piano"}]],"mem":null},
{"id":"n-26128da7","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","each word","ladder","piccolo","split into words","title case"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-2a7919e5","guard":[["hasAny",["item number","lyre","melodica","nth","position","ukulele"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-35177842","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","split","split by"]],["has","pick"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"flute"}]],"mem":null},
{"id":"n-36d848fb","guard":[["hasAny",["bassoon","delete","ladder","piccolo","strip out"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"grand"}]],"mem":null},
{"id":"n-3810f455","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","split","split by"]],["has","pick"]],"pyramid":["render.and",["transform.split",["sense.subject"],{"lit":"piano"}]],"mem":null},
{"id":"n-39d68264","guard":[["hasAny",["a to z","alphabetical","alphabetize","bassoon","each word","ladder","piccolo","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-39f7e4af","guard":[["hasAny",["bassoon","camel case","camelcase","capitalise","capitalize","capitalize each word","ladder","lower camel case","piccolo"]],["has","pick"]],"pyramid":["render.str",["transform.title",["transform.camel",["sense.subject"]]]],"mem":null},
{"id":"n-3c05f73c","guard":[["hasAny",["clavichord","concertina","invert case","saxaphone","swap case","toggle case"]],["has","among"]],"pyramid":["render.str",["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-40b90c95","guard":[["hasAny",["bassoon","ladder","piccolo"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],{"lit":1}]],"mem":null},
{"id":"n-448c2b2a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","concertina","glockenspiel","harpsichord","longest","longest one","longest word","title case"]],["has","or"]],"pyramid":["render.str",["transform.title",["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-46968a67","guard":[["hasAny",["bassoon","ladder","normalise","normalize","piccolo","simplify the text"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":3}]],"mem":null},
{"id":"n-470b2c11","guard":[["hasAny",["bassoon","ladder","piccolo","reverse the words","reverse word order","snake case","snakecase","underscores","variable name","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.snake",["transform.reverseWords",["sense.subject"]]]],"mem":null},
{"id":"n-473fff62","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","each word","ladder","piccolo","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-490766b1","guard":[["hasAny",["clavichord","concertina","item number","nth","saxaphone"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4a685828","guard":[["hasAny",["a to z","alphabetical","alphabetize","bassoon","each word","ladder","piccolo","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-4da03bf3","guard":[["hasAny",["banjo","capitalise","capitalize","capitalize each word","kazoo","shortest","shortest one","shortest word","title case","viola"]],["has","which"]],"pyramid":["render.str",["transform.title",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-4ec09ff6","guard":[["hasAny",["clavichord","concertina","each word","saxaphone","split into words"]],["has","among"]],"pyramid":["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-5091b25a","guard":[["hasAny",["class name","clavichord","concertina","pascal case","pascalcase","saxaphone","upper camel case"]],["has","among"]],"pyramid":["render.str",["transform.pascal",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-516d26f1","guard":[["hasAny",["class name","concertina","glockenspiel","harpsichord","longest one","longest word","pascal case","pascalcase","upper camel case"]],["has","or"]],"pyramid":["render.str",["transform.pascal",["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-54754889","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","split","split by"]],["has","pick"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"grand"}]],"mem":null},
{"id":"n-5582affb","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","split by"]],["has","pick"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"grand"}]],"mem":null},
{"id":"n-5657e608","guard":[["hasAny",["bassoon","camel case","camelcase","ladder","lower camel case","lower case","lowercase","piccolo","small letters"]],["has","pick"]],"pyramid":["render.str",["transform.lower",["transform.camel",["sense.subject"]]]],"mem":null},
{"id":"n-5f09e84f","guard":[["hasAny",["bassoon","class name","invert case","ladder","pascal case","pascalcase","piccolo","swap case","toggle case","upper camel case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["transform.pascal",["sense.subject"]]]],"mem":null},
{"id":"n-6bee783f","guard":[["hasAny",["bassoon","delete","ladder","piccolo","remove","strip out","without"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"grand"}]],"mem":null},
{"id":"n-6c538dfc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","clavichord","concertina","saxaphone","title case"]],["has","among"]],"pyramid":["render.str",["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-6d9adb11","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","split by"]],["has","pick"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"piano"}]],"mem":null},
{"id":"n-70070015","guard":[["hasAny",["banjo","invert case","kazoo","shortest","shortest one","shortest word","swap case","toggle case","viola"]],["has","which"]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-707bebe7","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","split by"]],["has","pick"]],"pyramid":["render.lines",["transform.split",["sense.subject"],{"lit":"flute"}]],"mem":null},
{"id":"n-723b07f6","guard":[["hasAny",["bassoon","delete","ladder","piccolo","remove","strip out","without"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"flute"}]],"mem":null},
{"id":"n-72f6117b","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","split","split by"]],["has","pick"]],"pyramid":["render.lines",["transform.split",["sense.subject"],{"lit":"piano"}]],"mem":null},
{"id":"n-736d530a","guard":[["hasAny",["concertina","glockenspiel","harpsichord","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-74408df1","guard":[["hasAny",["bassoon","each word","ladder","piccolo","shortest","shortest one","shortest word","split into words"]],["has","pick"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-7491350c","guard":[["hasAny",["bassoon","delete","ladder","piccolo","strip out"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"piano"}]],"mem":null},
{"id":"n-79897423","guard":[["hasAny",["bassoon","each word","ladder","piccolo","reverse order","reversed","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-84796104","guard":[["hasAny",["bassoon","camel case","camelcase","invert case","ladder","lower camel case","piccolo","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["transform.camel",["sense.subject"]]]],"mem":null},
{"id":"n-8d3ad042","guard":[["hasAny",["backwards","bassoon","each word","ladder","piccolo","reverse order","reversed","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-8dea0e22","guard":[["hasAny",["concertina","glockenspiel","harpsichord","invert case","longest one","longest word","swap case","toggle case"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-9059d2d2","guard":[["hasAny",["backwards","bassoon","each word","ladder","piccolo","reverse order","reversed","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-9bec476b","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","dashes","hyphens","kebab case","kebabcase","ladder","piccolo"]],["has","pick"]],"pyramid":["render.str",["transform.title",["transform.kebab",["sense.subject"]]]],"mem":null},
{"id":"n-9de15eb6","guard":[["hasAny",["bassoon","camel case","camelcase","capital letters","capitals","ladder","lower camel case","piccolo","upper case","uppercase"]],["has","pick"]],"pyramid":["render.str",["transform.upper",["transform.camel",["sense.subject"]]]],"mem":null},
{"id":"n-9e19ae24","guard":[["hasAny",["bassoon","each word","ladder","piccolo","reverse order","reversed","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-9eacc159","guard":[["hasAny",["bassoon","ladder","normalise","normalize","piccolo","simplify the text"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":1}]],"mem":null},
{"id":"n-a1688431","guard":[["hasAny",["bassoon","each word","invert case","ladder","piccolo","split into words","swap case","toggle case"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-a42a3394","guard":[["hasAny",["bassoon","each word","invert case","ladder","piccolo","split into words","swap case","toggle case"]],["has","pick"]],"pyramid":["render.list",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-a43f7c39","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","ladder","piccolo","reverse the words","reverse word order","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-aa0e51d6","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","split by"]],["has","pick"]],"pyramid":["render.lines",["transform.split",["sense.subject"],{"lit":"piano"}]],"mem":null},
{"id":"n-ac48d137","guard":[["hasAny",["clavichord","concertina","item number","nth","position","saxaphone"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-af6225c9","guard":[["hasAny",["backwards","bassoon","each word","ladder","piccolo","reverse order","reversed","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-b94791e4","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","split by"]],["has","pick"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"flute"}]],"mem":null},
{"id":"n-b982e011","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","each word","ladder","piccolo","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-bd1aa552","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","each word","ladder","piccolo","split into words","title case"]],["has","pick"]],"pyramid":["render.and",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-bd4d0841","guard":[["hasAny",["banjo","class name","kazoo","pascal case","pascalcase","shortest","shortest one","shortest word","upper camel case","viola"]],["has","which"]],"pyramid":["render.str",["transform.pascal",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-c3cf87ba","guard":[["hasAny",["bassoon","invert case","ladder","piccolo","snake case","snakecase","swap case","toggle case","underscores","variable name"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["transform.snake",["sense.subject"]]]],"mem":null},
{"id":"n-c69ca25f","guard":[["hasAny",["bassoon","ladder","normalise","normalize","piccolo","simplify the text"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":2}]],"mem":null},
{"id":"n-c77380fa","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","split by"]],["has","pick"]],"pyramid":["render.and",["transform.split",["sense.subject"],{"lit":"flute"}]],"mem":null},
{"id":"n-d44f291d","guard":[["hasAny",["bassoon","dashes","hyphens","invert case","kebab case","kebabcase","ladder","piccolo","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["transform.kebab",["sense.subject"]]]],"mem":null},
{"id":"n-dc3f3e9f","guard":[["hasAny",["item number","lyre","melodica","nth","ukulele"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-dda4de85","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","invert case","ladder","piccolo","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-df06bdf5","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","split by"]],["has","pick"]],"pyramid":["render.and",["transform.split",["sense.subject"],{"lit":"piano"}]],"mem":null},
{"id":"n-df59b68c","guard":[["hasAny",["bassoon","delete","ladder","piccolo","remove","strip out","without"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"piano"}]],"mem":null},
{"id":"n-e189e4a8","guard":[["hasAny",["bassoon","invert case","ladder","piccolo","reverse the words","reverse word order","swap case","toggle case","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-e65c0b55","guard":[["hasAny",["bassoon","each word","ladder","piccolo","reverse order","reversed","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-e7f9b200","guard":[["hasAny",["bassoon","class name","ladder","pascal case","pascalcase","piccolo","reverse the words","reverse word order","upper camel case","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.pascal",["transform.reverseWords",["sense.subject"]]]],"mem":null},
{"id":"n-ebf3a0c5","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","ladder","piccolo","snake case","snakecase","underscores","variable name"]],["has","pick"]],"pyramid":["render.str",["transform.title",["transform.snake",["sense.subject"]]]],"mem":null},
{"id":"n-ee579d5e","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","split","split by"]],["has","pick"]],"pyramid":["render.and",["transform.split",["sense.subject"],{"lit":"flute"}]],"mem":null},
{"id":"n-eef97ff9","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","invert case","ladder","piccolo","swap case","title case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-f0e8d218","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","each word","ladder","piccolo","split into words","title case"]],["has","pick"]],"pyramid":["render.list",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-f4c5df7e","guard":[["hasAny",["bassoon","camel case","camelcase","ladder","lower camel case","piccolo","reverse the words","reverse word order","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.camel",["transform.reverseWords",["sense.subject"]]]],"mem":null},
{"id":"n-f53c2a68","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","ladder","piccolo","reverse the words","reverse word order","title case","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-f8fecd4c","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","each word","ladder","piccolo","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-f9d1df64","guard":[["hasAny",["bassoon","each word","invert case","ladder","piccolo","split into words","swap case","toggle case"]],["has","pick"]],"pyramid":["render.and",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-02dfc5f2","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","shortest","shortest one","shortest word","split","split by"]],["has","pick"]],"pyramid":["render.list",["transform.split",["sense.subject"],["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-036f16c3","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","shortest","shortest one","shortest word","split","split by"]],["has","pick"]],"pyramid":["render.and",["transform.split",["sense.subject"],["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-06b3e615","guard":[["hasAny",["bassoon","each word","invert case","ladder","piccolo","shortest","shortest one","shortest word","split into words","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["transform.swapCase",["sense.subject"]]]]],"mem":null},
{"id":"n-07cb90ed","guard":[["hasAny",["capitalise","capitalize","capitalize each word","clavichord","concertina","item number","nth","position","saxaphone","title case"]],["has","among"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-085b6da5","guard":[["hasAny",["bassoon","eraser","how many words","normalise","normalize","number of words","piccolo","simplify the text","word count"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-08759e9a","guard":[["hasAny",["clavichord","concertina","first n","longest","longest one","longest word","saxaphone","take"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":2}]]],"mem":null},
{"id":"n-0a51f2bb","guard":[["hasAny",["bassoon","ladder","leading zeros","pad with","padded to","piccolo","zero pad"]],["has","pick"]],"pyramid":["render.str",["transform.padStart",["sense.subject"],{"lit":4},["sense.text"]]],"mem":null},
{"id":"n-0fe33a3b","guard":[["hasAny",["bassoon","copies","how many words","ladder","number of words","piccolo","say it times","word count"]],["has","pick"]],"pyramid":["render.str",["transform.repeat",["sense.subject"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-110b537d","guard":[["hasAny",["clavichord","concertina","first n","longest one","longest word","saxaphone"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-19c629a0","guard":[["hasAny",["a to z","alphabetical","alphabetize","backwards","banjo","kazoo","reverse order","reversed","shortest","shortest one","shortest word","viola"]],["has","which"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["transform.sortStrs",["sense.content"]]]]],"mem":null},
{"id":"n-1c707f2b","guard":[["hasAny",["bassoon","copies","digit count","how many digits","ladder","number of digits","piccolo","say it times"]],["has","pick"]],"pyramid":["render.str",["transform.repeat",["sense.subject"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-1de1f4f6","guard":[["hasAny",["bassoon","ladder","normalise","normalize","piccolo","reverse the words","reverse word order","simplify the text","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverseWords",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-22ba3685","guard":[["hasAny",["bassoon","each word","first n","ladder","piccolo","split into words","take"]],["has","pick"]],"pyramid":["render.list",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":2}]],"mem":null},
{"id":"n-2424afc4","guard":[["hasAny",["bassoon","change to","ladder","piccolo","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],{"lit":"flute"},["sense.lastWord"]]],"mem":null},
{"id":"n-259f4ef1","guard":[["hasAny",["bassoon","invert case","ladder","normalise","normalize","piccolo","simplify the text","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["transform.norm",["sense.subject"],{"lit":2}]]],"mem":null},
{"id":"n-2e1c8a82","guard":[["hasAny",["clavichord","concertina","digit count","how many digits","item number","nth","number of digits","position","saxaphone"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-2f6a03bc","guard":[["hasAny",["bassoon","each word","first n","ladder","piccolo","split into words","take"]],["has","pick"]],"pyramid":["render.lines",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":4}]],"mem":null},
{"id":"n-3188e55f","guard":[["hasAny",["bassoon","each word","ladder","normalise","normalize","piccolo","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.words",["transform.norm",["sense.subject"],{"lit":2}]]],"mem":null},
{"id":"n-35035e23","guard":[["hasAny",["bassoon","each word","ladder","normalise","normalize","piccolo","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-36bbafe8","guard":[["hasAny",["bassoon","invert case","ladder","normalise","normalize","piccolo","simplify the text","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["transform.norm",["sense.subject"],{"lit":1}]]],"mem":null},
{"id":"n-36e4ea9f","guard":[["hasAny",["bassoon","each word","first n","ladder","piccolo","split into words","take"]],["has","pick"]],"pyramid":["render.and",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":4}]],"mem":null},
{"id":"n-3732cfae","guard":[["hasAny",["clavichord","concertina","divisor count","how many factors","item number","nth","number of divisors","position","saxaphone"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-37e946a5","guard":[["hasAny",["each word","item number","lyre","melodica","nth","position","split into words","ukulele"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["transform.words",["sense.text"]],{"lit":5}]],"mem":null},
{"id":"n-39609de5","guard":[["hasAny",["bassoon","how many words","ladder","number of words","piccolo","word count"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-3d008e90","guard":[["hasAny",["bassoon","ladder","normalise","normalize","piccolo","reverse the words","reverse word order","simplify the text","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["transform.reverseWords",["sense.subject"]],{"lit":2}]],"mem":null},
{"id":"n-41a2a5fa","guard":[["hasAny",["invert case","item number","lyre","melodica","nth","position","swap case","toggle case","ukulele"]],["has","among"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.words"],{"lit":5}]]],"mem":null},
{"id":"n-41c8b624","guard":[["hasAny",["a to z","alphabetical","alphabetize","concertina","item number","kazoo","marimba","nth","position"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":5}]],"mem":null},
{"id":"n-42701bf4","guard":[["hasAny",["bassoon","change to","ladder","piccolo","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],{"lit":"grand"},["sense.text"]]],"mem":null},
{"id":"n-4655d087","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","ladder","normalise","normalize","piccolo","simplify the text","title case"]],["has","pick"]],"pyramid":["render.str",["transform.title",["transform.norm",["sense.subject"],{"lit":2}]]],"mem":null},
{"id":"n-46dfcf0f","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","shortest","shortest one","shortest word","split","split by"]],["has","pick"]],"pyramid":["render.str",["aggregate.shortest",["transform.split",["sense.subject"],{"lit":"piano"}]]],"mem":null},
{"id":"n-4a6e2047","guard":[["hasAny",["bassoon","each word","ladder","normalise","normalize","piccolo","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.words",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-4b2162fc","guard":[["hasAny",["bassoon","how many words","ladder","number of words","piccolo","word count"]],["has","pick"]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-4b4c43d5","guard":[["hasAny",["bassoon","delete","ladder","piccolo","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.after",{"lit":"musical"}]]],"mem":null},
{"id":"n-4c8877b1","guard":[["hasAny",["bassoon","eraser","how many vowels","normalise","normalize","number of vowels","piccolo","simplify the text","vowel count"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-4df6bf6d","guard":[["hasAny",["clavichord","concertina","first n","longest","longest one","longest word","saxaphone","take"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-4e250c7c","guard":[["hasAny",["bassoon","change to","ladder","piccolo","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],{"lit":"piano"},["sense.text"]]],"mem":null},
{"id":"n-4ef0ab4b","guard":[["hasAny",["bassoon","each word","first n","ladder","piccolo","split into words","take"]],["has","pick"]],"pyramid":["render.and",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":3}]],"mem":null},
{"id":"n-56ac7082","guard":[["hasAny",["bassoon","delete","eraser","piccolo","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"from"}]]],"mem":null},
{"id":"n-57043b66","guard":[["hasAny",["bassoon","change to","ladder","piccolo","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],{"lit":"flute"},["sense.text"]]],"mem":null},
{"id":"n-5c8900a2","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","ladder","normalise","normalize","piccolo","simplify the text","title case"]],["has","pick"]],"pyramid":["render.str",["transform.title",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-5f071d8c","guard":[["hasAny",["bassoon","ladder","normalise","normalize","piccolo","reverse the words","reverse word order","simplify the text","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["transform.reverseWords",["sense.subject"]],{"lit":1}]],"mem":null},
{"id":"n-6710f2d0","guard":[["hasAny",["bassoon","each word","first n","ladder","piccolo","split into words","take"]],["has","pick"]],"pyramid":["render.and",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":2}]],"mem":null},
{"id":"n-67d50449","guard":[["hasAny",["bassoon","camel case","camelcase","ladder","lower camel case","normalise","normalize","piccolo","simplify the text"]],["has","pick"]],"pyramid":["render.str",["transform.camel",["transform.norm",["sense.subject"],{"lit":2}]]],"mem":null},
{"id":"n-6bc71884","guard":[["hasAny",["bassoon","each word","first n","ladder","piccolo","split into words","take"]],["has","pick"]],"pyramid":["render.lines",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":2}]],"mem":null},
{"id":"n-70990c84","guard":[["hasAny",["bassoon","camel case","camelcase","ladder","lower camel case","normalise","normalize","piccolo","simplify the text"]],["has","pick"]],"pyramid":["render.str",["transform.camel",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-735d9c3a","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","shortest","shortest one","shortest word","split","split by"]],["has","pick"]],"pyramid":["render.lines",["transform.split",["sense.subject"],["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-746ee104","guard":[["hasAny",["bassoon","change to","ladder","piccolo","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-77d0647a","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","ladder","normalise","normalize","piccolo","simplify the text","title case"]],["has","pick"]],"pyramid":["render.str",["transform.title",["transform.norm",["sense.subject"],{"lit":1}]]],"mem":null},
{"id":"n-7b3ee7c7","guard":[["hasAny",["bassoon","digit count","how many digits","ladder","number of digits","piccolo"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-7e7604db","guard":[["hasAny",["clavichord","concertina","invert case","item number","nth","position","saxaphone","swap case","toggle case"]],["has","among"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-80b87e04","guard":[["hasAny",["bassoon","how many words","ladder","number of words","piccolo","word count"]],["has","pick"]],"pyramid":["render.and",["iterate.repeat",["sense.subject"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-84438dbe","guard":[["hasAny",["bassoon","each word","joined with","ladder","piccolo","separated by","split into words"]],["has","pick"]],"pyramid":["render.str",["transform.join",["transform.words",["sense.subject"]],["sense.text"]]],"mem":null},
{"id":"n-8508e880","guard":[["hasAny",["bassoon","how many words","ladder","number of words","piccolo","word count"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-87cfab78","guard":[["hasAny",["bassoon","ladder","longest","longest one","longest word","piccolo","separate by","split","split by"]],["has","pick"]],"pyramid":["render.str",["aggregate.longest",["transform.split",["sense.subject"],{"lit":"piano"}]]],"mem":null},
{"id":"n-8a02c1dc","guard":[["hasAny",["clavichord","concertina","divisor count","how many factors","item number","nth","number of divisors","position","saxaphone"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-8f109577","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","each word","ladder","piccolo","shortest","shortest one","shortest word","split into words","title case"]],["has","pick"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["transform.title",["sense.subject"]]]]],"mem":null},
{"id":"n-940f141b","guard":[["hasAny",["bassoon","each word","ladder","normalise","normalize","piccolo","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.words",["transform.norm",["sense.subject"],{"lit":2}]]],"mem":null},
{"id":"n-9c329b09","guard":[["hasAny",["bassoon","how many words","ladder","number of words","piccolo","word count"]],["has","pick"]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-9d8137c3","guard":[["hasAny",["backwards","item number","lyre","melodica","nth","position","reverse order","reversed","ukulele"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":4}]],"mem":null},
{"id":"n-a209afcf","guard":[["hasAny",["bassoon","change to","ladder","piccolo","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],{"lit":"grand"},["sense.subject"]]],"mem":null},
{"id":"n-a66b0d5d","guard":[["hasAny",["bassoon","ladder","piccolo","separate by","shortest","shortest one","shortest word","split","split by"]],["has","pick"]],"pyramid":["render.str",["aggregate.shortest",["transform.split",["sense.subject"],{"lit":"flute"}]]],"mem":null},
{"id":"n-acac431e","guard":[["hasAny",["clavichord","concertina","digit count","how many digits","item number","nth","number of digits","position","saxaphone"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-acc8b7b6","guard":[["hasAny",["bassoon","each word","ladder","normalise","normalize","piccolo","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.words",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-b00e772c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","clavichord","concertina","invert case","saxaphone","swap case","title case","toggle case"]],["has","among"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-b0cf4610","guard":[["hasAny",["bassoon","digit count","how many digits","ladder","number of digits","piccolo"]],["has","pick"]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-b4b31214","guard":[["hasAny",["blanket","candle","clavichord","normalise","normalize","simplify the text"]],["has","among"]],"pyramid":["render.str",["transform.norm",["sense.wordAt",{"lit":2}],{"lit":2}]],"mem":null},
{"id":"n-b82feb92","guard":[["hasAny",["bassoon","each word","joined with","ladder","piccolo","separated by","split into words"]],["has","pick"]],"pyramid":["render.str",["transform.join",["transform.words",["sense.subject"]],["sense.subject"]]],"mem":null},
{"id":"n-ba2f96ba","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","lyre","melodica","nth","position","title case","ukulele"]],["has","among"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.words"],{"lit":5}]]],"mem":null},
{"id":"n-be8e5f2e","guard":[["hasAny",["bassoon","each word","ladder","normalise","normalize","piccolo","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["transform.norm",["sense.subject"],{"lit":2}]]],"mem":null},
{"id":"n-bec90969","guard":[["hasAny",["bassoon","each word","first n","ladder","piccolo","split into words","take"]],["has","pick"]],"pyramid":["render.list",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":3}]],"mem":null},
{"id":"n-c1d6f2c4","guard":[["hasAny",["bassoon","delete","ladder","piccolo","remove","shortest","shortest one","shortest word","strip out","without"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-c7dcea76","guard":[["hasAny",["bassoon","ladder","longest","longest one","longest word","piccolo","separate by","split","split by"]],["has","pick"]],"pyramid":["render.str",["aggregate.longest",["transform.split",["sense.subject"],{"lit":"flute"}]]],"mem":null},
{"id":"n-c81b4d8f","guard":[["hasAny",["bassoon","each word","joined with","ladder","piccolo","separated by","split into words"]],["has","pick"]],"pyramid":["render.str",["transform.join",["transform.words",["sense.subject"]],["sense.lastWord"]]],"mem":null},
{"id":"n-cc6b4637","guard":[["hasAny",["didgeridoo","kazoo","ladder","longest","longest one","longest word"]],["has","or"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d07d5026","guard":[["hasAny",["bassoon","change to","ladder","piccolo","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],{"lit":"flute"},["sense.subject"]]],"mem":null},
{"id":"n-d47c362e","guard":[["hasAny",["bassoon","how many vowels","ladder","normalise","normalize","number of vowels","piccolo","simplify the text","vowel count"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.subject"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-d4f26d94","guard":[["hasAny",["clavichord","concertina","first n","longest one","longest word","saxaphone"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":2}]]],"mem":null},
{"id":"n-da767c53","guard":[["hasAny",["bassoon","copies","how many words","ladder","number of words","piccolo","say it times","word count"]],["has","pick"]],"pyramid":["render.str",["transform.repeat",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-da9ae544","guard":[["hasAny",["bassoon","change to","ladder","piccolo","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],{"lit":"piano"},["sense.subject"]]],"mem":null},
{"id":"n-e06f1298","guard":[["hasAny",["bassoon","copies","digit count","how many digits","ladder","number of digits","piccolo","say it times"]],["has","pick"]],"pyramid":["render.str",["transform.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-e78cd21b","guard":[["hasAny",["bassoon","digit count","how many digits","ladder","number of digits","piccolo"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-e8d78c94","guard":[["hasAny",["bassoon","invert case","ladder","normalise","normalize","piccolo","simplify the text","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-ea1c8b37","guard":[["hasAny",["bassoon","digit count","how many digits","ladder","number of digits","piccolo"]],["has","pick"]],"pyramid":["render.lines",["iterate.repeat",["sense.subject"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-ed9ab1ba","guard":[["hasAny",["bassoon","each word","first n","ladder","piccolo","split into words","take"]],["has","pick"]],"pyramid":["render.list",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":4}]],"mem":null},
{"id":"n-ee1ec998","guard":[["hasAny",["bassoon","change to","ladder","piccolo","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],{"lit":"grand"},["sense.lastWord"]]],"mem":null},
{"id":"n-f5fe43a9","guard":[["hasAny",["bassoon","digit count","how many digits","ladder","number of digits","piccolo"]],["has","pick"]],"pyramid":["render.and",["iterate.repeat",["sense.subject"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-f860618d","guard":[["hasAny",["bassoon","each word","first n","ladder","piccolo","split into words","take"]],["has","pick"]],"pyramid":["render.lines",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":3}]],"mem":null},
{"id":"n-f9078502","guard":[["hasAny",["bassoon","how many words","ladder","number of words","piccolo","word count"]],["has","pick"]],"pyramid":["render.lines",["iterate.repeat",["sense.subject"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-fc1f4712","guard":[["hasAny",["bassoon","digit count","how many digits","ladder","number of digits","piccolo"]],["has","pick"]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-ffab1887","guard":[["hasAny",["bassoon","change to","ladder","piccolo","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],{"lit":"piano"},["sense.lastWord"]]],"mem":null},
{"id":"n-13bdb191","guard":[["hasAny",["bassoon","change to","ladder","piccolo","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.after",{"lit":"musical"}],["sense.text"]]],"mem":null},
{"id":"n-31a0660a","guard":[["hasAny",["bassoon","change to","ladder","piccolo","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.after",{"lit":"instrument"}],["sense.text"]]],"mem":null},
{"id":"n-5b3a3ee4","guard":[["hasAny",["clavichord","dobro","from position","harp","items from to","shortest","shortest one","shortest word","slice"]],["has","among"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.words"],{"lit":2},{"lit":3}]]],"mem":null},
{"id":"n-61c96966","guard":[["hasAny",["bassoon","item number","ladder","nth","piccolo","position"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-63425114","guard":[["hasAny",["from position","harpsichord","items from to","longest","longest one","longest word","melodica","slice","ukulele"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":4},{"lit":10}]]],"mem":null},
{"id":"n-8e048e39","guard":[["hasAny",["bassoon","item number","ladder","nth","piccolo","position"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," instrument."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9716100a","guard":[["hasAny",["from position","items from to","longest","longest one","longest word","lyre","melodica","slice","ukulele"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":4},{"lit":5}]]],"mem":null},
{"id":"n-e77f2812","guard":[["hasAny",["clavichord","concertina","item number","nth","position","saxaphone"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a musical ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.lastWord"]],"mem":null},
{"id":"n-eac7d2da","guard":[["hasAny",["change to","clavichord","concertina","replace","saxaphone","substitute","swap"]],["has","among"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-5c2ec7d2","guard":[["hasAny",["bassoon","item number","ladder","nth","piccolo","position"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1d632c88","guard":[["hasAny",["clavichord","concertina","item number","nth","saxaphone"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-6418d071","guard":[["hasAny",["bassoon","item number","ladder","nth","piccolo"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.subject"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a3d779d9","guard":[["hasAny",["bassoon","item number","ladder","nth","piccolo"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b2c5a76b","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","item number","ladder","nth","piccolo","position","title case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-cf303796","guard":[["hasAny",["bassoon","item number","ladder","nth","piccolo","position"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-d9fd603b","guard":[["hasAny",["bassoon","item number","ladder","nth","piccolo","position"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.subject"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dce02ca5","guard":[["hasAny",["bassoon","item number","ladder","nth","piccolo","position"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fd3be1e1","guard":[["hasAny",["bassoon","invert case","item number","ladder","nth","piccolo","position","swap case","toggle case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-09b3c285","guard":[["hasAny",["bassoon","camel case","camelcase","item number","ladder","lower camel case","nth","piccolo"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.camel",["sense.subject"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0c281f1a","guard":[["hasAny",["bassoon","each word","item number","ladder","nth","piccolo","position","split into words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1e7b033c","guard":[["hasAny",["clarinet","item number","longest one","longest word","nth","sousaphone","viola"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-316ce443","guard":[["hasAny",["bassoon","each word","item number","ladder","nth","piccolo","position","split into words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-60ecb6d2","guard":[["hasAny",["bassoon","invert case","item number","ladder","nth","piccolo","position","swap case","toggle case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["sense.subject"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8b8de013","guard":[["hasAny",["bassoon","capitalise","capitalize","capitalize each word","item number","ladder","nth","piccolo","position","title case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a026bc12","guard":[["hasAny",["bassoon","invert case","item number","ladder","nth","piccolo","position","swap case","toggle case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a34abdf7","guard":[["hasAny",["bassoon","invert case","item number","ladder","nth","piccolo","swap case","toggle case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-df63338b","guard":[["hasAny",["bassoon","item number","ladder","nth","piccolo","position","reverse the words","reverse word order","words backwards"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.reverseWords",["sense.subject"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e09abcd2","guard":[["hasAny",["bassoon","class name","item number","ladder","nth","pascal case","pascalcase","piccolo","upper camel case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.pascal",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ea7651e7","guard":[["hasAny",["item number","longest one","longest word","lyre","melodica","nth","ukulele"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0b2301c8","guard":[["hasAny",["bassoon","each word","item number","ladder","nth","piccolo","position","split into words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-152beb74","guard":[["hasAny",["bassoon","item number","ladder","nth","piccolo","position"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a74a7729","guard":[["hasAny",["bassoon","each word","item number","ladder","nth","piccolo","split into words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-abf564d3","guard":[["hasAny",["bassoon","each word","item number","ladder","nth","piccolo","split into words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-adbed3e7","guard":[["hasAny",["bassoon","item number","ladder","nth","piccolo"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-be1cfab8","guard":[["hasAny",["bassoon","each word","item number","ladder","nth","piccolo","position","split into words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0aa19c9c","guard":[["hasAny",["baby","element","item number","leading zeros","nth","organ","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-4e6a3104","guard":[["hasAny",["bass","element","glockenspiel","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-6c181d82","guard":[["hasAny",["characters from","element","item number","ladder","letters from to","lyre","nth","position","slice of the text","substring"]],["has","or"]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],{"lit":1},{"lit":4}]],"mem":null},
{"id":"n-77184a19","guard":[["hasAny",["bassoon","caesar cipher","element","how many letters","item number","kazoo","letter count","nth","number of letters","position","rotate the letters","shift by","shift each letter"]]],"pyramid":["render.str",["transform.caesar",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.letters",["sense.text"]]]],"mem":null},
{"id":"n-92daa072","guard":[["hasAny",["baby","element","item number","leading zeros","nth","organ","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["sense.wordCount"],["sense.subject"]]],"mem":null},
{"id":"n-9bdcdb0e","guard":[["hasAny",["characters from","element","harp","item number","letters from to","lute","nth","position","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":1},{"lit":4}]],"mem":null},
{"id":"n-9e63c4aa","guard":[["hasAny",["bass","caesar cipher","element","item number","kettle","nth","position","rotate the letters","shift by","shift each letter","sum of the first","triangular number"]]],"pyramid":["render.str",["transform.caesar",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],["compute.sumTo",["sense.wordCount"]]]],"mem":null},
{"id":"n-a683e112","guard":[["hasAny",["bassoon","element","item number","leading zeros","nth","pad","pad with","padded to","piccolo","position","zero pad"]],["has","pick"]],"pyramid":["render.str",["transform.padStart",["sense.subject"],{"lit":5},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]],"mem":null},
{"id":"n-ad77b673","guard":[["hasAny",["baby","element","item number","leading zeros","nth","organ","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-b3c35cef","guard":[["hasAny",["bass","element","glockenspiel","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":12},["sense.subject"]]],"mem":null},
{"id":"n-c1c7da55","guard":[["hasAny",["bassoon","element","item number","leading zeros","nth","pad","pad with","padded to","piccolo","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["sense.subject"],{"lit":5},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]],"mem":null},
{"id":"n-d2ae5a44","guard":[["hasAny",["bassoon","element","item number","leading zeros","nth","pad","pad with","padded to","piccolo","position","zero pad"]],["has","pick"]],"pyramid":["render.str",["transform.padStart",["sense.subject"],{"lit":5},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-e2f84bd1","guard":[["hasAny",["caesar cipher","character count","clarinet","element","how many characters","item number","length","nth","number of characters","position","rotate the letters","shift by","shift each letter","sousaphone"]]],"pyramid":["render.str",["transform.caesar",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["aggregate.chars",["sense.subject"]]]],"mem":null},
{"id":"n-f286720b","guard":[["hasAny",["bass","element","glockenspiel","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}],{"lit":12},["sense.lastWord"]]],"mem":null},
{"id":"n-c9ea2d94","guard":[["hasAny",["element","hurdygurdy","item number","ladder","longest","longest one","longest word","nth","position"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cadfc44a","guard":[["hasAny",["didgeridoo","element","item number","kazoo","longest","longest one","longest word","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-082e054f","guard":[["hasAny",["baby","element","item number","leading zeros","nth","organ","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]]],"mem":null},
{"id":"n-0a07aa23","guard":[["hasAny",["element","hurdygurdy","invert case","item number","ladder","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0dc6c44e","guard":[["hasAny",["element","french","how many vowels","hurdygurdy","item number","nth","number of vowels","position","vowel count"]],["has","or"]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":-1}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}]]]],"mem":null},
{"id":"n-1ad4540f","guard":[["hasAny",["element","how many vowels","item number","nth","number of vowels","position","sousaphone","vowel count","vuvuzela"]]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":1}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"corpora-instruments"},{"lit":"item"}],{"lit":2}]]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which of these is a musical instrument: screwdriver, table or violin","expect":{"contains":["violin"],"notContains":["screwdriver","table"],"notRefusal":true}},{"q":"among curtain, lamp or melodica, which one is a musical instrument","expect":{"contains":["melodica"],"notContains":["lamp","curtain"],"notRefusal":true}},{"q":"which of these is a musical instrument: vase, pan flute or kettle","expect":{"contains":["pan flute"],"notContains":["vase","kettle"],"notRefusal":true}},{"q":"among clavichord, screwdriver or backpack, which one is a musical instrument","expect":{"contains":["clavichord"],"notContains":["backpack","screwdriver"],"notRefusal":true}},{"q":"pick a musical instrument from pipe organ, stapler or plate","expect":{"contains":["pipe organ"],"notContains":["stapler","plate"],"notRefusal":true}},{"q":"among saxaphone, blanket or stapler, which one is a musical instrument","expect":{"contains":["saxaphone"],"notContains":["stapler","blanket"],"notRefusal":true}},{"q":"which of these is a musical instrument: sousaphone, fork or sponge","expect":{"contains":["sousaphone"],"notContains":["sponge","fork"],"notRefusal":true}},{"q":"among sponge, backpack or ukulele, which one is a musical instrument","expect":{"contains":["ukulele"],"notContains":["backpack","sponge"],"notRefusal":true}},{"q":"among fork, guitar or table, which one is a musical instrument","expect":{"contains":["guitar"],"notContains":["fork","table"],"notRefusal":true}},{"q":"which of these is a musical instrument: umbrella, bagpipe or refrigerator","expect":{"contains":["bagpipe"],"notContains":["refrigerator","umbrella"],"notRefusal":true}},{"q":"pick a musical instrument from baby grand piano, chair or table","expect":{"contains":["baby grand piano"],"notContains":["table","chair"],"notRefusal":true}},{"q":"pick a musical instrument from notebook, toaster or piano","expect":{"contains":["piano"],"notContains":["toaster","notebook"],"notRefusal":true}},{"q":"which of these is a musical instrument: vase, dulcimer or eraser","expect":{"contains":["dulcimer"],"notContains":["eraser","vase"],"notRefusal":true}},{"q":"among doormat, dobro or vase, which one is a musical instrument","expect":{"contains":["dobro"],"notContains":["vase","doormat"],"notRefusal":true}},{"q":"pick a musical instrument from bathtub, xylophone or notebook","expect":{"contains":["xylophone"],"notContains":["notebook","bathtub"],"notRefusal":true}},{"q":"among lamp, bugle or plate, which one is a musical instrument","expect":{"contains":["bugle"],"notContains":["lamp","plate"],"notRefusal":true}},{"q":"which of these is a musical instrument: wrench, flute or candle","expect":{"contains":["flute"],"notContains":["candle","wrench"],"notRefusal":true}},{"q":"pick a musical instrument from vuvuzela, wrench or vase","expect":{"contains":["vuvuzela"],"notContains":["vase","wrench"],"notRefusal":true}},{"q":"among broom, doormat or lyre, which one is a musical instrument","expect":{"contains":["lyre"],"notContains":["broom","doormat"],"notRefusal":true}},{"q":"among cup, chair or French horn, which one is a musical instrument","expect":{"contains":["French horn"],"notContains":["chair","cup"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
