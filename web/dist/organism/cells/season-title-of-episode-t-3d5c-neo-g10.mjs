// season-title-of-episode-t-3d5c-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"season-title-of-episode-t-3d5c-neo-g10","class":"season-title-of-episode-t-3d5c","generation":10,"lane":"neo","grownFrom":["what is the season title of The Rescue","what is the season title of Forgive and Forget","give the season title for An Evil Game","what is the season title of Origins Part 2","give the season title for Echoes of Evil","give the season title for Frax's Fury","what is the season title of Sowing the Seas of Evil","what is the season title of Glyph Hanger","tell me the season title of the episode title Cruisin' for a Bruisin'","give the season title for Gold Rush","give the season title for A Gem of a Day","give the season title for The Ranger Ribbon","give the season title for Party Monsters","tell me the season title of the episode title Sigh of the Tiger","what is the season title of True Friends, True Spirits","tell me the season title of the episode title Song Sung Yellow","what is the season title of Tools of the Betrayed","give the season title for Foul Play in the Sky","give the season title for Recipe for Disaster","tell me the season title of the episode title One Last Hope"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-power-rangers-episodes-623e94","columns":["episode title","season title"],"n":921,"cols":[{"f":"0The Lost Episode|0Something Fishy|0The Mutiny: Part I|0A Friend in Need: Part I|2Zeo Beginning: Part I|0Shift Into Turbo: Part I|0From Out of Nowhere: Part 1|0The Silver Secret|0A Date with Danger|0Quasar Quest: Part 1|0Operation Lightspeed|0Force from the Future: Part 1|0Lionheart|0Three's a Crowd|0Prelude to a Storm|0Day of the Dino: Part I|0Game On|0Beginnings: Part 1|1roken Spell: Part 1|0Kick Into Overdrive|0Once a Ranger|0Welcome to the Jungle|0The Road to Corinth|0End Game|0Origins Part 1|0Boxed In|0Super Samurai|0Mega Mission|0Super Megaforce|0Powers from the Past|0When Evil Stirs|0Return of the Prism|0Echoes of Evil|0Beasts Unleashed|2lieve It or Not|0A Bad Reflection on You|3lue Streak|3rief Mystery of Time|4ush with Destiny|2Calm Before the Storm|3himp in Charge|3rack in the World|2Date with Danger|3ifferent Shade of Pink: Part I|xI|yI|3rive to Win|2Face from the Past|4ther's Footsteps|3ew Bad Seeds|3ool's Hour|3riend Indeed|9in Need: Part II|pI|2Gem of a Day|3olden Homecoming|2Line in the Sand|4on's Alliance|2Matter of Trust|3onster of Global Proportions|3ystery to Me|2Parting of Ways|3ig Surprise|3ressing Engagement|2Ranger Among Thieves|9Catastrophe: Part I|sI|9Exclusive|3ed Romance|4el Fish Story|3ift in the Rangers|2Season to Remember|3mall Problem|3tar Is Born|aTorn|4icky Situation|2Taste of Poison|3est of Trust|2Zeo Beginning: Part II|1-Bridged|1bandoned|2rakadanger|1ce and the Race|1larmed and Dangerous|2ien Rangers of Aquitar: Part I|wI|2l About Beevil|4Hail Prince Vekar|2ong Came a Spider|2ways a Chance|1n Evil Game|3Oyster Stew|2cient Awakening|8History|2d... Action|3ros and the Stowaway|2other Brick in the Wall|8Song and Dance|1rise the Crystal Eyes|2tist Anonymous|1s Time Runs Out|2tronema Thinks Twice|1t All Cost|2tack of the 60' Bulk|eGalactic Ninjas|0Back in Black|2d to the Bone|3ge|2ttle of the Zords|1east King Rampage|3uty and the Beach|ist|2ginnings: Part 2|2hind the Scenes|2lly of the Beast|2neath the Surface|2st Man for the Job|4ies 4Eva!|2ware the Knight|bMutiny|bThird Wish|2yond a Doubt|1icycle Built for the Blues|2g Sisters|2rds of a Feather|1lind Leading the Blind|3tz|2oom of Doom|2ue Ranger Gone Bad|b, Twin Danger|5Saber Saga|5to the Test|1odyguard in Blue|2mber in the Summer|2om|2th Sides Now|2xed In|3ing Bopp-a-roo|1reak Out|5ing Black|2oken Dreams|7Spell: Part 2|3ther's Keeper|7, Can You Spare an Arrowhead?|7s in Arms|1uilt for Speed|2lk Fiction|3ly for Ethan|2rning at Both Ends|0Calamity Kimberly|2n't Win Them All|2r Trouble|3los and the Count|7on Call|3s Attacks|2ssie's Best Friend|2tching Some Rays|2ught Red-Handed|1hallenges|3nging of the Zords: Part I|tI|uI|3se Into Space: Part 1|n2|2ristmas Together, Friends Forever|1ircuit Unsure|1lash for Control: Part 1|o2|6of the Megazords|dRed Rangers Part 1|u2|2ean-Up Club|2ick, Click, Zoom|3mb Every Fountain|1ode Busters|2nfronted|3trol-Alt-Delete|2py That|2untdown to Destruction: Part 1|v2|1rown and Punishment|2uisin' for a Bruisin'|3nch Time|2ystal of Nightmares|1urse of the Cobra|dWolf|1yborg Rangers|0Dance the Night Away|3ger and Destiny: Part 1|p2|2rk Specter's Revenge: Part 1|t2|5Warrior|6ish: Part 1|g2|g3|4ness Awakening|2sh for the Dagger|2wn of Destiny|2y Off|4of the Dino: Part II|cumpster|1eal with a Nighlok|2ep Down Under|2stined for Greatness|6y Defeated|1ifferent Drum|2gital Deception|2mensions in Danger|2sappearing Act|3missed|2va in Distress|1o I Know You?|2ctor K|2gged|2n't Blow That Dough|2om Signal|4sday: Part I|gI|2uble Duty|7Ranger, Double Danger|6-Edged Blake|2wn and Dirty|1rawn into Danger|2eam Battle|6Snatcher|2ive to Survive|0Earth Fights Back|1dge of Extinction|1mbodied|2peror Mavro|1nd Game|4of Extinction|7the Road|3ings: Part 1|e2|2ter the Lost Galaxy|5... The Lizzinator|1scape the Lost Galaxy|1very Dog Has His Day|2il Reborn|2ox Unleashed|4's Revenge|4: Upgraded|1ye of the Storm|0Face to Face: Part 1|j2|3ing the Past|2de to Black|2mily Fusion|2n Frenzy|1ear and the Phantoms|1ight Against Fate|6Fire with Fire|5ing Spirit|2nal Face-Off|3ders Keepers|2re Heart|5in Your Tank|2sh Out of Water|4ing for a Friend|2ve of a Kind|1lashes of Darkonda|1ollow That Cab!|7the Ranger|2od Fight|3tball Season|2r Cryin' Out Loud|4Whom the Bell Trolls|3ce from the Future: Part 2|3est for the Trees|4ver Friends|8Red|3ged Under Fire|7in Steel|4ive and Forget|2ssil Frenzy|2ul Play in the Sky|3nd and Lost|3rth Down and Long|2wl Play|1rax's Fury|2eaky Fightday|2iends Don't Fade Away|2om Deep in the Shadows|5Out of Nowhere: Part 2|1ull Exposure|2ture Unknown|0Galvanax Rises|2me On!|5Plan|5of Honor|2rdner of Evil|1eneral Deception: Part I|pI|1host of a Chance|h II|5s|6 in the Machine|1lyph Hanger|1o Volcanic|3for the Green|2in' Ape|4g Viral|2ld Rush|4ar's Vice-Versa|4en Boy|7Opportunity|2ne Fishin|2od Karma, Bad Karma|5Will Hunter|5as Gold|2rilla Art|2sei Ultimate|1raduation Blues|3ndma Matchmaker|3ve Robber|2een Courage|6No More: Part I|lI|6with Evil: Part I|nI|oI|nV|mV|2id Connection|2umble Bee|3nchor on the Loose|1ung Ho!|0Hack Attack|2ndshake|3gar Heist|2ppy Birthday, Zack|6to Be Me|2rd Heads|3mony and Dizchord|2waii Zeo|1e Ain't Heavy Metal, He's My Brother|3Blasted Me with Science|2art of Blue|2ir Apparent: Part 1|k2|5to the Throne|2lping Hand|2re Comes Heximas|3oes Among Us|2xuba's Graveyard|1igh Five|2story|1ogday Afternoon: Part I|oI|2me Run Koda|5and Away: Part 1|k2|4coming|4sick|2ney, I Shrunk the Rangers: Part 1|y2|2use of Cards|1ypnotic Halloween|0I Love Lothor|1'm Dreaming of a White Ranger|2ve Got a Spell on Blue|1, Eye Guy|1dentity Crisis|2ol|1f Venjix Won|1mpact|1n Your Dreams|3or Out|3the Driver's Seat|7Freeze Zone|7Limelight|2ner Spirit|7trength|2somnia|3trument of Destruction|2truder Alert!|2vasion of the Body Switcher|gRanger Snatchers|1sland of Illusion: Part I|qI|2n't It Lava-ly|1t Came from Angel Grove|2's Hammer Time|5a Mad Mad Mackerel|2sy Bitsy Spider|0Jayden's Challenge|1en's Revenge|1ourney's End: Part 1|k2|k3|1ust Like Me|0Katastrophe|1evin's Choice|2y to the Past|1ick Into Overdrive|2ng for a Day: Part I|mI|1night After Knights|1oragg's Trial|0Last Laugh|1eader of the Whack|2gacy of Power|3endary Battle|aCatastros|2t Sleeping Zords Lie|1ife's a Masquerade|2ght Source: Part 1|j2|5s, Camera, Action|gDAX|6peed Teamwork|2ons & Blizzards|2ttle Strong Man|2ve and Learn|1ong Ago|2oming Thunder|2st & Found in Translation|2ve Is in the Air|5Stings|5at First Fight|4struck Rangers|2yax' Last Battle|0Magic Misfire|2king Bad|7Waves|2n and Machine|4of Mercury: Part 1|l2|2ryl and the Monkeys|2ster Vile and the Metallic Armor: Part I|z Part II|z Part III|1ean Screen|5Wheels Mantis|2mories of Mirinoi|2ssenger: Part 1|g2|1ighty Morphin' Mutants|2rror of Regret|2ssing|7 Green|4on to Secret City|1oment of Truth|2ndo's Last Stand|3itoring Earth|3key Business|3ster Mix-Up|2vie Madness: Part 1|k2|1r. Billy's Wild Ride|1y Friend Redbot|2stic Fate: Part 1|i2|0Nadira's Dream Date|1eptune's Daughter|2ver Give Up!|6Stop Searching|1ightmare in Amber Beach|2nja Quest: Part I|jI|kI|jV|1o \"I\" in Leader|3Clowning Around|3Matter How You Slice It|2t So Simple|3hing to Lose|2w the Final Fury|3here to Grow|0Ocean Alert|6Blue|1ily to Bed, Oily to Rise|1lympius Ascends|9Unbound|1n Fins and Needles|2ce a Ranger|2e Fine Day|4Gets Away|4Last Hope|9Second Chance|4Master too Many|5ore Energem|1pposites Attract|1rchestral Maneuvers in the Park|2igins Part 2|3on Returns|7ising|1ut of Luck|3foxed|0Parts and Parcel|4y Monsters|2ssing the Lantern|cTorch: Part 1|o2|3t, Present and Fusion|ds, and Future|2th of the Rhino|dighteous|1eace, Love, and Woe|2rspective|2trified Xander|1irate in Pink|2zza Slice of Life|1lague of the Mantis|1oisonous Plots|2rk Chopped|2wer Play|6Ranger Punks|6of Six|1redazord, Awaken|3pare To Fail|3sto Chango-O|2ince Takes Knight|3soners|2otect the Quasar Saber|1ushed to the Edge|2tty on the Brain|0Quantum Secrets|3sar Quest: Part 2|0Race to Rescue Christmas|8the Nexus|cRescue|2in|3se the Titanisaur|4ing Spirits|2lly Ranger|2nger Blue|7Down|7Green|7Red|9veal|7Yellow|d: Part 2|6s Back in Time: Part I|sI|8Gone Psycho|8in Reverse|bthe Outfield|8of Two Worlds: Part I|tI|3sik Lives|1eaching The Nexus|3l Steel|2cipe for Disaster|3ognition|2d Ranger Unplugged|4with Envy|3emption Day|2flection: Part 1|h2|as of Evil|2ign of the Jellyfish|3nforcements from the Future: Part 1|zt 2|2surrection|2turn of Thunder: Part I|pI|qI|pV|aan Old Friend: Part I|vI|athe Caveman|eGreen Ranger: Part I|yI|zI|2velations of Gold|4nge of Zen-Aku|2writing History|1iches and Rags|3o the Robot|2ding the Edge|2se of a Ranger|8the Super Demons|3ing from Ashes|2ta's Pita|7Seed of Evil|1oar of the Red Ranger|2bo Knight|4tpalooza|2ck Solid|4-a-Bye Power Rangers|4ing & Rolling|4y Just Wants to Have Fun|2nny on Empty: Part 1|l2|2okie in Red|3m for One More|1un Ziggy Run|3away Spike|1yan's Destiny|0S.W.A.T.: Part 1|f2|1am: Part 1|a2|3urai|7 Forever|8Surprise|2tellite Search|2ve Our Ship|bores|1caredy Cat|3venger Hunt|2ent of a Ranger|bWeasel|2rozzle's Revenge|1ealing the Nexus|2cond Chance|3ret Struggle|6s and Lies|2eing Red|2nsei Switcheroo|1hadow Rangers|6: Part 1|d2|3ne's Karma: Part I|lI|3rk Attack|2ell Game|6Shocked|3riff Skyfire|2ift Into Turbo: Part II|pI|3mazu Returns: Part I|nI|2ort-Circuited|1igh of the Tiger|2lence Is Golden|5t Sleep|3ver Lining, Part 1|k2|7Sacrifice|8ecret|2ng Song|1nip It, Snip It Good|1omething Fishy|ato Fight For|2ng Sung Yellow|2rcerer of the Sands|2ul Bird Salvation|5Searching|6pecter|3nd and Fury|3rce Code|2wing the Seas of Evil|1pirit of the Tiger|eWoods|1takeout|3ying on Track|2icks & Stones|3tch Witchery|2olen Beauty|3p the Hate Master: Part I|sI|3rm Before the Calm: Part I|tI|4ybook Rangers: Part I|pI|2range Relations|7r Ranger|9Within: Part 1|m2|3ength of the Sun|3oke of Fate|2uck on Christmas|1urvival of the Silver|1witching Places|1ync or Swim|0TJ's Identity Crisis|1aking Care of Business|2ming of the Zords|2rget Rangers|6: Tower|1eam Carnival|5Spirit|4work|2ch Support|2st of the Leader|1he Accident|5dventures of Redbot|5lien Trap|5ncient Warrior|4Barillian Sting|5ear Necessities|6etle Invasion|5lame Game|6ue Crush|9and the Gold|5ullZord|4Chameliac Warrior|6osen Path|5obra Strikes|5raterite Invasion|5urve Ball|5ybergate Opens|4Darkest Day|5elta Discovery|5ome Dolls|4End of Time: Part 1|m2|m3|bthe Power Rangers: Part 1|z2|6emy Within|5vox Snare|4Fall of the Phantom|6te of Lightspeed: Part 1|t2|5ifth Crystal|5lute|4Gatekeeper: Part 1|l2|5hostest with the Mostest|5rass Is Always Greener or Bluer|6eat Bookala Escape|aDuel|aEgg Caper|bvilyzer|9er Good|7en Candle: Part I|oI|aDream|4Human Condition|aFactor|6nter|4Impenetrable Web|4Joke's on Blue|4Last Race|bnger|5egend of the Clock Tower|5ight|9s of Orion|5one Wolf|6re of Auric|6st Galactabeasts: Part 1|t2|4Magna Defender|6ster Returns|a's Herald: Part 1|q2|dLast Stand|5essenger|5ighty Mega Battles|6llennium Message|6ssing Bone|5utiny: Part II|jI|4Need For Speed|5inja Encounter: Part I|rI|sI|4Omega Project|4Passion of Conner|5erfect Storm|5hantom Phenomenon|5oisy Show|6tion Notion|6wer Stealer|aTransfer: Part I|qI|aof Gold|dPink|5uppet Blaster|4Quantum Quest|6een's Return|4Ranger Ribbon|bWho Came in from the Gold|as Rock!|b' Leap of Faith|dMega Voyage|5escue|a Mission|6turn|5ival Rangers|5obo Knight Before Christmas|8t Ranger|6ckstar|6yal Rangers|bival|bumble|4Samurai's Journey: Part I|tI|uI|5ealing Symbol|6cret of the Locket|5hooting Star|5ilva Switch|5now Prince|5ong of Confusion|cGuitardo|6ul of Humanity|7nd of Dischordia|5pirit of Kindness|7t Flower|5trange Case of the Munchies|5unflower Search|4Team Unites|6ngen Gate|5ime Shadow|5ooth Hurts|6rnado Spin|5rouble with Shellshock|5urn of the Wretched Wrench|4Ultimate Duel|5nderwater World|4Wanna-Be Ranger|6sp with a Heart|5edding: Part I|jI|kI|5heel of Fate|6ole Lie|5ild Wipeout|6ngs of Animaria|5rath|4Yolk's on You!|3re Go the Brides|5's No 'I' in Team|bBusiness Like Snow Business: Part I|zess: Part II|zess: Part III|2ings Not Said|2ree's a Crowd|3ills and Drills|2under Storm: Part 1|k2|arangers: Part I|pI|qI|buck: Part 1|lII|1igers Fall, Lions Rise|2me Force Traitor|5for Lightspeed|1o Earn Your Stripes|3Flea or Not to Flee|3the Tenth Power|2ngue and Cheek|2ols of the Betrayed|2ugh Love|1rading Places|3keena's Revenge: Part 1|p2|3nsmission Impossible|2ial by Fire|4ssic Triumph|3ck or Treat|bial|5ster Treat|3p Takes a Stand|2ouble by the Slice|2ue Black|7ue to the Rescue|5Friends, True Spirits|3st Me|6and Triumph|6in Me|3th Discovered|6and Consequences|1uba Triumph|2rn Up the Volume|2tenhawken's Curse|1wo Fallen Foes|4Heads Are Better Than One|4for One|0Ultra Power|1ndercover Rangers|2expected Arrival|2finished Business|2iquely Trip|3ted We Stand|7as One|2til Sunset|1p to the Challenge|0Vanishing Act|1rak Is Back, Part 1|j2|0Walls|2ter You Thinking?|2ve Goodbye|2y Back When|4of the Master|1eather or Not|2b War|2ight and See|2lcome to Venus Island|bthe Jungle II|1heel of Misfortune|5s of Destruction|3n Is a Ranger Not a Ranger?|5Logic Fails|5Push Comes to Shove|5Time Freezes Over|3re There's Smoke, There's Fire|6in the World Is Zeo Ranger 5?|2ispering Voices|3te Light: Part I|jI|6Thunder: Part 1|k2|k3|2o's Crying Now?|1ild West Rangers: Part I|pI|2ngs of Danger|2red: Part 1|c2|2shes on the Water|4ing for a Hero|2zard for a Day|1orgworld|3ld Famous! (In New Zealand)|5s Apart|3mhole|1rath of the Queen|0Yesterday Again|0Zapped|1edd Waves|4's Monster Mash|1hane's Destiny","sep":"|"},{"d":"Mighty Morphin (Season 1)|Mighty Morphin (Season 2)|Mighty Morphin (Season 3)|Zeo|Turbo|In Space|Lost Galaxy|Lightspeed Rescue|Time Force|Wild Force|Ninja Storm|Dino Thunder|S.P.D.|Mystic Force|Operation Overdrive|Jungle Fury|R.P.M.|Samurai|Super Samurai|Megaforce|Super Megaforce|Dino Charge|Dino Super Charge|Ninja Steel|Super Ninja Steel|Beast Morphers (Season 1)|Beast Morphers (Season 2)","i":"0,0,1,2,3,4,5,5,5,6,7,8,9,9,a,b,b,c,d,e,e,f,g,g,h,h,i,j,k,l,m,n,o,p,q,0,8,3,2,8,2,i,m,2,2,2,4,7,9,3,l,p,2,2,a,3,5,k,7,1,3,8,0,0,5,2,2,b,6,1,5,3,3,0,b,i,f,b,3,c,c,n,n,4,2,2,a,k,2,5,6,0,9,g,g,5,2,3,f,q,7,5,e,2,o,b,f,c,9,q,a,1,c,e,g,b,1,m,8,6,4,g,4,0,0,f,g,1,1,f,k,6,8,3,c,e,q,a,l,l,h,d,g,3,a,4,3,b,b,0,f,o,4,5,4,4,m,o,3,2,2,2,4,4,h,8,8,8,4,h,h,0,9,2,d,c,g,b,5,5,e,q,q,0,7,9,7,f,g,g,5,5,0,d,d,d,9,f,8,h,b,0,h,l,6,8,0,p,o,b,c,b,3,g,c,f,o,0,0,6,l,a,a,b,6,j,n,k,m,g,k,j,m,p,c,c,6,0,6,3,i,q,p,p,a,e,e,6,g,n,o,f,8,i,b,2,q,d,4,h,9,5,5,2,e,0,0,3,0,8,h,1,9,m,n,m,q,0,3,2,0,8,m,f,7,5,8,8,n,q,o,3,4,a,a,f,f,g,5,4,7,g,q,j,n,1,b,q,m,f,a,3,p,j,3,5,n,6,1,1,0,0,0,0,0,q,0,6,0,n,g,p,0,o,d,j,3,i,j,e,d,d,6,n,m,g,6,0,c,2,2,m,e,e,9,6,4,4,b,p,a,2,h,0,9,c,g,c,b,g,k,7,7,3,d,c,3,q,5,3,0,0,b,3,e,b,0,h,8,6,6,6,e,c,i,g,e,3,3,l,d,j,b,b,k,d,l,0,d,d,1,e,7,0,4,n,d,a,b,k,o,m,8,6,o,q,o,j,e,e,f,2,2,2,3,6,6,c,c,0,1,c,1,5,o,3,9,n,o,8,8,3,n,d,d,8,7,9,5,m,2,2,2,2,f,0,l,g,e,f,a,b,7,3,7,7,0,e,e,e,4,f,f,l,1,1,h,6,6,e,o,4,h,2,4,4,l,n,f,f,0,c,d,e,f,0,n,a,9,0,k,9,o,n,j,g,6,f,1,8,6,l,f,6,g,6,j,4,g,d,g,g,p,g,g,1,1,5,2,3,3,3,8,o,p,m,c,e,5,6,c,c,8,0,9,9,c,a,a,a,a,0,0,l,1,1,1,3,9,p,m,j,7,l,7,7,2,0,m,j,c,d,3,n,1,e,e,6,h,g,i,7,c,c,c,c,c,i,k,5,5,q,d,1,a,3,p,9,0,q,9,p,a,4,c,c,a,a,6,i,5,o,4,4,a,a,8,f,5,6,k,k,p,m,9,a,i,8,3,7,9,9,d,p,q,2,k,4,c,j,h,4,6,2,2,a,a,1,1,b,j,d,d,7,i,i,5,0,l,5,p,9,3,p,9,h,0,o,h,4,n,2,9,5,9,1,q,6,h,i,6,7,7,5,4,p,4,5,g,8,8,8,9,9,5,q,4,7,7,7,9,d,d,l,k,1,i,7,5,q,0,0,1,j,j,d,5,3,8,7,8,d,6,9,3,6,6,6,i,9,9,9,j,7,4,b,1,1,o,1,1,1,7,b,k,4,o,2,1,1,1,3,6,3,8,7,n,3,m,5,5,i,6,d,4,j,4,0,l,n,n,a,a,a,i,5,3,q,d,4,1,9,2,f,0,i,6,h,h,8,l,9,0,4,h,e,1,5,1,1,1,4,4,a,9,k,0,h,a,3,3,3,e,g,p,b,b,a,a,a,b,b,f,8,8,f,0,6,a,p,o,i,7,7,4,7,b,0,m,i,8,4,l,5,f,i,8,3,7,b,p,6,b,e,0,1,j,8,h,9,8,j,k,6,7,4,k,k,c,2,b,e,f,e,7,4,1,f,0,7,1,l,5,4,1,3,d,1,1,b,b,b,j,1,1,m,c,c,9,l,2,m,l,8,c,7,7,c,1,1,5","sep":"|"}]}]);
const COLONY = [
{"id":"n-17700d27","guard":[["hasAny",["abridged","action","all","amber","apart","arms","bad","beast","betrayed","bitsy","blind","brief","bruisin","catastros","chameliac","chance","charge","christmas","city","clash","day","destined","destruction","dizchord","dolls","doom","drivers","element","emperor","empty","encounter","evil","evilyzer","extinction","eye","five","forget","foul","fraxs","friend","friends","future","galactabeasts","galvanax","gatekeeper","glyph","gold","green","hunt","ii","iii","item number","jens","know","last","learn","lights","maneuvers","mantis","monsters","no","normalise","normalize","nth","origins","pig","pink","prism","quasar","race","ranger","red","rescue","rise","sigh","silva","silver","simplify the text","song","soul","stand","taming","thunder","trick","trust","underwater","venjix"]],["has","season"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}],["sense.howMany"]]],"mem":null},
{"id":"n-9353c9ae","guard":[["hasAny",["abridged","action","all","amber","apart","arms","bad","beast","betrayed","bitsy","blind","brief","bruisin","caesar cipher","catastros","chameliac","chance","charge","christmas","city","day","destined","destruction","dizchord","dolls","doom","drivers","element","emperor","encounter","evil","evilyzer","extinction","eye","five","forget","foul","fraxs","friend","friends","future","galvanax","glyph","gold","green","hunt","ii","iii","item number","jens","know","last","learn","lights","maneuvers","mantis","monsters","no","nth","pig","pink","prism","race","ranger","red","rescue","rise","rotate the letters","shift by","shift each letter","sigh","silva","silver","song","soul","stand","taming","thunder","trick","trust","underwater","venjix"]],["has","season"]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}],["sense.howMany"]]],"mem":null},
{"id":"n-0a1877d2","guard":[["hasAny",["all","amber","apart","arms","blind","brief","catastros","chameliac","chance","christmas","city","clash","day","destined","destruction","dizchord","doom","drivers","echoes","element","emperor","empty","evilyzer","extinction","forget","fraxs","friends","future","galactabeasts","galvanax","game","gatekeeper","glyph","gold","ii","item number","jens","know","last","learn","lights","monsters","no","normalise","normalize","nth","origins","pirate","prism","quasar","race","red","rescue","ribbon","rise","sigh","silver","simplify the text","song","soul","stand","taming","thunder","trial","trust","underwater"]],["has","season"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}],{"lit":1}]],"mem":null},
{"id":"n-bce7d40e","guard":[["hasAny",["all","amber","apart","arms","blind","brief","catastros","chameliac","chance","christmas","clash","day","destined","destruction","dizchord","doom","drivers","echoes","element","emperor","empty","extinction","forget","fraxs","friends","future","galactabeasts","galvanax","game","gatekeeper","glyph","gold","ii","item number","jens","know","last","learn","lights","monsters","no","normalise","normalize","nth","origins","pirate","prism","quasar","race","red","rescue","ribbon","rise","sigh","simplify the text","song","soul","stand","taming","thunder","trial","trust","underwater"]],["has","season"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}],{"lit":2}]],"mem":null},
{"id":"n-bdc99a26","guard":[["hasAny",["amber","arms","bad","beast","before","betrayed","blind","bruisin","caesar cipher","candle","catastros","chance","charge","city","destined","destruction","different","dizchord","dolls","doom","drivers","element","emperor","encounter","evilyzer","extinction","eye","forget","friends","future","glyph","hunt","ii","item number","jens","know","last","lights","maneuvers","mantis","no","nth","pig","prism","red","rise","rotate the letters","seas","shift by","shift each letter","sigh","silva","soul","stand","sung","thunder","trial","trust","v","venjix"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-6f3f535b","guard":[["hasAny",["amber","bad","beast","before","betrayed","blind","candle","charge","clash","different","dolls","doom","drivers","element","evilyzer","extinction","eye","forget","friends","future","galactabeasts","glyph","is","item number","lights","maneuvers","nth","origins","red","seas","soul","stand","thunder","trial","trust"]],["has","season"],["has","title"],["not",["has","boom"]]],"pyramid":["render.template",{"lit":["The season ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-b0cd10b8","guard":[["hasAny",["amber","bad","beast","before","betrayed","blind","candle","charge","clash","different","dolls","doom","drivers","element","evilyzer","extinction","eye","forget","friends","future","galactabeasts","glyph","is","item number","lights","maneuvers","nth","origins","red","seas","soul","stand","thunder","trial","trust"]],["has","season"],["has","title"],["not",["has","boom"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," title of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-012149cc","guard":[["hasAny",["amber","bad","beast","before","betrayed","blind","candle","charge","clash","different","dolls","doom","drivers","element","evilyzer","extinction","eye","forget","friends","future","galactabeasts","glyph","is","item number","lights","maneuvers","nth","origins","red","seas","soul","stand","thunder","trial","trust"]],["has","season"],["has","title"],["not",["has","boom"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-38c101e4","guard":[["hasAny",["amber","bad","beast","before","betrayed","blind","candle","charge","clash","different","dolls","doom","drivers","element","evilyzer","extinction","eye","forget","friends","future","galactabeasts","glyph","is","item number","lights","maneuvers","nth","origins","red","seas","soul","stand","thunder","trial","trust"]],["has","season"],["has","title"],["not",["has","boom"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-03b902c9","guard":[["hasAny",["all caps","amber","bad","beast","before","betrayed","blind","candle","capital letters","capitals","charge","clash","different","dolls","doom","drivers","element","evilyzer","extinction","eye","forget","friends","future","galactabeasts","glyph","is","item number","lights","maneuvers","nth","origins","red","seas","soul","stand","thunder","trial","trust","upper case","uppercase"]],["has","season"],["has","title"],["not",["has","boom"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-28181603","guard":[["hasAny",["amber","bad","beast","before","betrayed","blind","candle","charge","clash","different","dolls","doom","drivers","element","evilyzer","extinction","eye","forget","friends","future","galactabeasts","glyph","is","item number","lights","maneuvers","nth","origins","red","seas","soul","stand","thunder","trial","trust"]],["has","season"],["has","title"],["not",["has","boom"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-34b2c87b","guard":[["hasAny",["amber","bad","beast","before","betrayed","blind","candle","charge","clash","different","dolls","doom","drivers","element","evilyzer","extinction","eye","forget","friends","future","galactabeasts","glyph","is","item number","lights","lower case","lowercase","maneuvers","nth","origins","red","seas","small letters","soul","stand","thunder","trial","trust"]],["has","season"],["has","title"],["not",["has","boom"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-770338fc","guard":[["hasAny",["amber","bad","beast","before","betrayed","blind","candle","charge","clash","different","dolls","doom","drivers","element","evilyzer","extinction","eye","forget","friends","future","galactabeasts","glyph","invert case","is","item number","lights","maneuvers","nth","origins","red","seas","soul","stand","swap case","thunder","toggle case","trial","trust"]],["has","season"],["has","title"],["not",["has","boom"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-79070cba","guard":[["hasAny",["amber","bad","beast","before","betrayed","blind","candle","capitalise","capitalize","capitalize each word","charge","clash","different","dolls","doom","drivers","element","evilyzer","extinction","eye","forget","friends","future","galactabeasts","glyph","is","item number","lights","maneuvers","nth","origins","red","seas","soul","stand","thunder","title case","trial","trust"]],["has","season"],["has","title"],["not",["has","boom"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-04dacfc4","guard":[["hasAny",["amber","bad","beast","before","betrayed","blind","candle","charge","clash","different","dolls","doom","drivers","element","evilyzer","extinction","eye","forget","friends","future","galactabeasts","glyph","invert case","is","item number","lights","maneuvers","nth","origins","red","seas","soul","stand","swap case","thunder","toggle case","trial","trust"]],["has","season"],["has","title"],["not",["has","boom"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-5a07b531","guard":[["hasAny",["amber","bad","beast","before","betrayed","blind","candle","charge","clash","different","dolls","doom","drivers","element","evilyzer","extinction","eye","forget","friends","future","galactabeasts","glyph","is","item number","lights","lower case","lowercase","maneuvers","nth","origins","red","seas","small letters","soul","stand","thunder","trial","trust"]],["has","season"],["has","title"],["not",["has","boom"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-5f52b530","guard":[["hasAny",["amber","bad","beast","before","betrayed","blind","candle","capitalise","capitalize","capitalize each word","charge","clash","different","dolls","doom","drivers","element","evilyzer","extinction","eye","forget","friends","future","galactabeasts","glyph","is","item number","lights","maneuvers","nth","origins","red","seas","soul","stand","thunder","title case","trial","trust"]],["has","season"],["has","title"],["not",["has","boom"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-644a096a","guard":[["hasAny",["all caps","amber","bad","beast","before","betrayed","blind","candle","capital letters","capitals","charge","clash","different","dolls","doom","drivers","element","evilyzer","extinction","eye","forget","friends","future","galactabeasts","glyph","is","item number","lights","maneuvers","nth","origins","red","seas","soul","stand","thunder","trial","trust","upper case","uppercase"]],["has","season"],["has","title"],["not",["has","boom"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-3b870933","guard":[["hasAny",["amber","bad","beast","before","betrayed","blind","candle","charge","clash","different","dolls","doom","drivers","element","evilyzer","extinction","eye","forget","friends","future","galactabeasts","glyph","is","item number","lights","maneuvers","normalise","normalize","nth","origins","red","seas","simplify the text","soul","stand","thunder","trial","trust"]],["has","season"],["has","title"],["not",["has","boom"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-c656445e","guard":[["hasAny",["amber","bad","beast","before","betrayed","blind","candle","charge","clash","different","dolls","doom","drivers","element","evilyzer","extinction","eye","forget","friends","future","galactabeasts","glyph","is","item number","lights","maneuvers","normalise","normalize","nth","origins","red","seas","simplify the text","soul","stand","thunder","trial","trust"]],["has","season"],["has","title"],["not",["has","boom"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-41cbf24f","guard":[["hasAny",["abridged","action","amber","apart","beast","betrayed","blind","bruisin","catastros","chameliac","chance","charge","destined","destruction","dizchord","element","emperor","evilyzer","forget","galvanax","glyph","item number","light","lights","mantis","monsters","nth","prism","ribbon","shortest","shortest one","shortest word","silva","silver","stand","taming","trick","trust","underwater"]],["has","season"],["not",["has","eaters"]]],"pyramid":["render.template",{"lit":["The season ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-fc384e61","guard":[["hasAny",["action","all","apart","bad","beast","bitsy","candle","charge","day","dolls","doom","echoes","element","eye","five","foul","fraxs","friend","game","glyph","gold","item number","learn","light","lights","longest","longest one","longest word","nexus","nth","pirate","quasar","red","ribbon","seas","stand","taming","trick","trust"]],["has","season"],["not",["has","eaters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," title of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-dd7b37c1","guard":[["hasAny",["amber","bad","beast","before","betrayed","blind","candle","charge","clash","different","dolls","doom","drivers","element","end","evilyzer","eye","forget","friends","future","galactabeasts","glyph","item number","lights","maneuvers","nth","origins","red","rescue","seas","soul","stand","thunder","trial","trust"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-39b050ec","guard":[["hasAny",["amber","bad","beast","before","betrayed","blind","candle","charge","clash","different","dolls","doom","drivers","element","end","evilyzer","eye","forget","friends","future","galactabeasts","glyph","item number","lights","lower case","lowercase","maneuvers","nth","origins","red","rescue","seas","small letters","soul","stand","thunder","trial","trust"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.after",{"lit":"of"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-07401e56","guard":[["has","season"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the season title of The Rescue":"The season title of The Rescue is Super Samurai.","the season title of Forgive and Forget":"The season title of Forgive and Forget is Dino Super Charge.","the season title of Origins Part 2":"The season title of Origins Part 2 is Samurai.","the season title of Sowing the Seas of Evil":"The season title of Sowing the Seas of Evil is Mighty Morphin (Season 3).","the season title of Glyph Hanger":"The season title of Glyph Hanger is Turbo.","the season title of True Friends, True Spirits":"The season title of True Friends, True Spirits is Jungle Fury.","the season title of Tools of the Betrayed":"The season title of Tools of the Betrayed is Beast Morphers (Season 1).","the season title of Thunder Struck: Part II":"The season title of Thunder Struck: Part II is Dino Thunder.","the season title of United We Stand":"The season title of United We Stand is Megaforce.","the season title of The Lost Galactabeasts: Part 2":"The season title of The Lost Galactabeasts: Part 2 is Lost Galaxy.","the season title of Past, Presents, and Future":"The season title of Past, Presents, and Future is Ninja Steel.","the season title of Blind Leading the Blind":"The season title of Blind Leading the Blind is Jungle Fury.","the season title of Orchestral Maneuvers in the Park":"The season title of Orchestral Maneuvers in the Park is Mighty Morphin (Season 2).","the season title of A Chimp in Charge":"The season title of A Chimp in Charge is Mighty Morphin (Season 3).","the season title of Doom Signal":"The season title of Doom Signal is Super Ninja Steel.","the season title of The Green Candle: Part I":"The season title of The Green Candle: Part I is Mighty Morphin (Season 1).","the season title of Nightmare in Amber Beach":"The season title of Nightmare in Amber Beach is Dino Super Charge.","the season title of Rookie in Red":"The season title of Rookie in Red is Lost Galaxy.","the season title of Beauty and the Beast":"The season title of Beauty and the Beast is Mighty Morphin (Season 2).","the season title of The Great Evilyzer":"The season title of The Great Evilyzer is In Space.","the season title of Making Bad":"The season title of Making Bad is Beast Morphers (Season 2).","the season title of Trust Me":"The season title of Trust Me is Super Samurai.","the season title of In the Driver's Seat":"The season title of In the Driver's Seat is Super Megaforce.","the season title of Soul Specter":"The season title of Soul Specter is Mystic Force.","the season title of The Lights of Orion":"The season title of The Lights of Orion is Lost Galaxy.","the season title of Thunder Strangers: Part I":"The season title of Thunder Strangers: Part I is Ninja Storm.","the season title of End of Extinction":"The season title of End of Extinction is Dino Super Charge.","the season title of Friends Don't Fade Away":"The season title of Friends Don't Fade Away is Jungle Fury.","the season title of A Different Shade of Pink: Part III":"The season title of A Different Shade of Pink: Part III is Mighty Morphin (Season 3).","the season title of I, Eye Guy":"The season title of I, Eye Guy is Mighty Morphin (Season 1).","the season title of The Dome Dolls":"The season title of The Dome Dolls is R.P.M..","the season title of Trick or Trial":"The season title of Trick or Trial is Dino Super Charge.","the season title of The Robo Knight Before Christmas":"The season title of The Robo Knight Before Christmas is Megaforce.","the season title of Clash for Control: Part 2":"The season title of Clash for Control: Part 2 is Time Force."}}},
{"id":"n-903c6f44","guard":[["hasAny",["abridged","action","all","another","apart","armor","bitsy","brief","chameliac","confusion","day","disaster","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","item number","learn","light","monsters","nth","pirate","quasar","race","ribbon","silver","taming","treat","underwater"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," title of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-4688554d","guard":[["hasAny",["abridged","action","all","another","apart","armor","bitsy","brief","chameliac","confusion","day","disaster","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","item number","learn","light","monsters","nth","pirate","quasar","race","ribbon","silver","taming","treat","underwater"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The season ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-568bf3d3","guard":[["hasAny",["abridged","action","all","another","apart","armor","bitsy","brief","chameliac","confusion","day","disaster","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","item number","learn","light","monsters","nth","pirate","quasar","race","ribbon","silver","taming","treat","underwater"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-700b9c2a","guard":[["hasAny",["abridged","action","all","another","apart","armor","bitsy","brief","chameliac","confusion","day","disaster","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","item number","learn","light","monsters","nth","pirate","quasar","race","ribbon","silver","taming","treat","underwater"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-422d8043","guard":[["hasAny",["abridged","action","all","another","apart","armor","bitsy","brief","chameliac","confusion","day","disaster","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","invert case","item number","learn","light","monsters","nth","pirate","quasar","race","ribbon","silver","swap case","taming","toggle case","treat","underwater"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-596953ba","guard":[["hasAny",["abridged","action","all","another","apart","armor","bitsy","brief","chameliac","confusion","day","disaster","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","item number","learn","light","lower case","lowercase","monsters","nth","pirate","quasar","race","ribbon","silver","small letters","taming","treat","underwater"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-8ac8ef1d","guard":[["hasAny",["abridged","action","all","another","apart","armor","bitsy","brief","capitalise","capitalize","capitalize each word","chameliac","confusion","day","disaster","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","item number","learn","light","monsters","nth","pirate","quasar","race","ribbon","silver","taming","title case","treat","underwater"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-9f117267","guard":[["hasAny",["abridged","action","all","all caps","another","apart","armor","bitsy","brief","capital letters","capitals","chameliac","confusion","day","disaster","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","item number","learn","light","monsters","nth","pirate","quasar","race","ribbon","silver","taming","treat","underwater","upper case","uppercase"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-bf65595b","guard":[["hasAny",["abridged","action","all","another","apart","armor","bitsy","brief","chameliac","class name","confusion","day","disaster","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","item number","learn","light","monsters","nth","pascal case","pascalcase","pirate","quasar","race","ribbon","silver","taming","treat","underwater","upper camel case"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-d37d45aa","guard":[["hasAny",["abridged","action","all","another","apart","armor","bitsy","brief","chameliac","confusion","day","disaster","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","invert case","item number","learn","light","monsters","nth","pirate","quasar","race","ribbon","silver","swap case","taming","toggle case","treat","underwater"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-eafb3a00","guard":[["hasAny",["abridged","action","all","another","apart","armor","bitsy","brief","chameliac","confusion","day","disaster","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","item number","learn","light","monsters","nth","pirate","quasar","race","ribbon","silver","taming","treat","underwater"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-1f27bb67","guard":[["hasAny",["abridged","action","all","all caps","another","apart","armor","bitsy","brief","capital letters","capitals","chameliac","confusion","day","disaster","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","item number","learn","light","monsters","nth","pirate","quasar","race","ribbon","silver","taming","treat","underwater","upper case","uppercase"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-43814f28","guard":[["hasAny",["abridged","action","all","another","apart","armor","bitsy","brief","capitalise","capitalize","capitalize each word","chameliac","confusion","day","disaster","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","item number","learn","light","monsters","nth","pirate","quasar","race","ribbon","silver","taming","title case","treat","underwater"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-4891fcca","guard":[["hasAny",["abridged","action","all","another","apart","armor","bitsy","brief","chameliac","confusion","day","disaster","each word","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","item number","learn","light","monsters","nth","pirate","quasar","race","ribbon","silver","split into words","taming","treat","underwater","words"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-5019c521","guard":[["hasAny",["abridged","action","all","another","apart","armor","bitsy","brief","chameliac","confusion","day","disaster","each word","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","item number","learn","light","monsters","nth","pirate","quasar","race","ribbon","silver","split into words","taming","treat","underwater","words"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-51876731","guard":[["hasAny",["abridged","action","all","another","apart","armor","bitsy","brief","chameliac","confusion","day","disaster","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","invert case","item number","learn","light","monsters","nth","pirate","quasar","race","ribbon","silver","swap case","taming","toggle case","treat","underwater"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-8c0a66fa","guard":[["hasAny",["abridged","action","all","another","apart","armor","bitsy","brief","chameliac","confusion","day","disaster","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","item number","learn","light","lower case","lowercase","monsters","nth","pirate","quasar","race","ribbon","silver","small letters","taming","treat","underwater"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-40e7d48e","guard":[["hasAny",["abridged","action","all","another","apart","armor","bitsy","brief","chameliac","confusion","day","disaster","echoes","element","five","foul","fraxs","friend","galvanax","game","give","gold","item number","learn","light","monsters","normalise","normalize","nth","pirate","quasar","race","ribbon","silver","simplify the text","taming","treat","underwater"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-881426dc","guard":[["hasAny",["element","episode","item number","nth"]],["has","season"],["not",["has","boom"]],["not",["has","eaters"]]],"pyramid":["render.template",{"lit":["The season ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-1ec9d200","guard":[["hasAny",["element","episode","item number","nth"]],["has","season"],["not",["has","boom"]],["not",["has","eaters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-8083c29a","guard":[["hasAny",["element","episode","item number","nth"]],["has","season"],["not",["has","boom"]],["not",["has","eaters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-01163df0","guard":[["hasAny",["all caps","capital letters","capitals","element","episode","item number","nth","upper case","uppercase"]],["has","season"],["not",["has","boom"]],["not",["has","eaters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-2c3a74ae","guard":[["hasAny",["element","episode","item number","lower case","lowercase","nth","small letters"]],["has","season"],["not",["has","boom"]],["not",["has","eaters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-3eb1695e","guard":[["hasAny",["element","episode","item number","nth"]],["has","season"],["not",["has","boom"]],["not",["has","eaters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-452b2fdc","guard":[["hasAny",["element","episode","invert case","item number","nth","swap case","toggle case"]],["has","season"],["not",["has","boom"]],["not",["has","eaters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-68e1277f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","episode","item number","nth","title case"]],["has","season"],["not",["has","boom"]],["not",["has","eaters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-681b951f","guard":[["hasAny",["element","episode","invert case","item number","nth","swap case","toggle case"]],["has","season"],["not",["has","boom"]],["not",["has","eaters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-80900128","guard":[["hasAny",["element","episode","item number","lower case","lowercase","nth","small letters"]],["has","season"],["not",["has","boom"]],["not",["has","eaters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-d873686d","guard":[["hasAny",["all caps","capital letters","capitals","element","episode","item number","nth","upper case","uppercase"]],["has","season"],["not",["has","boom"]],["not",["has","eaters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-fefa9434","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","episode","item number","nth","title case"]],["has","season"],["not",["has","boom"]],["not",["has","eaters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-c4651765","guard":[["hasAny",["element","episode","item number","normalise","normalize","nth","simplify the text"]],["has","season"],["not",["has","boom"]],["not",["has","eaters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-dc71cb12","guard":[["hasAny",["arms","before","brief","day","destruction","dizchord","element","empty","future","galvanax","glyph","gold","ii","item number","know","last","learn","monsters","no","normalise","normalize","nth","origins","pirate","prism","ribbon","rise","simplify the text","song","stand","thunder","underwater"]],["has","season"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}],{"lit":3}]],"mem":null},
{"id":"n-27db34e4","guard":[["hasAny",["abridged","action","all","another","apart","armor","bitsy","brief","caesar cipher","chameliac","confusion","day","disaster","echoes","element","five","foul","fraxs","friend","galvanax","game","gold","item number","learn","light","monsters","nth","pirate","race","ribbon","rotate the letters","shift by","shift each letter","silver","taming","treat","underwater"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-a30a7529","guard":[["hasAny",["arms","bruisin","caesar cipher","catastros","chance","city","deception","destined","destruction","dizchord","edge","element","emperor","encounter","hunt","item number","jens","know","last","mantis","no","nth","pig","prism","rise","rotate the letters","shift by","shift each letter","sigh","silva","sung","v","venjix"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-388424ac","guard":[["hasAny",["amber","beast","betrayed","blind","bruisin","catastros","chance","charge","destined","destruction","dizchord","element","emperor","evilyzer","forget","glyph","item number","lights","mantis","nth","prism","shortest","shortest one","shortest word","silva","stand","trial","trust"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-5166e8dd","guard":[["hasAny",["amber","beast","betrayed","blind","bruisin","catastros","chance","charge","destined","destruction","dizchord","element","emperor","evilyzer","forget","glyph","item number","lights","mantis","nth","prism","shortest","shortest one","shortest word","silva","stand","trial","trust"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.and",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-1e551d5b","guard":[["hasAny",["amber","beast","betrayed","blind","bruisin","catastros","chance","charge","destined","destruction","dizchord","element","emperor","evilyzer","forget","glyph","invert case","item number","lights","mantis","nth","prism","shortest","shortest one","shortest word","silva","stand","swap case","toggle case","trial","trust"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-2b7de403","guard":[["hasAny",["all caps","amber","beast","betrayed","blind","bruisin","capital letters","capitals","catastros","chance","charge","destined","destruction","dizchord","element","emperor","evilyzer","forget","glyph","item number","lights","mantis","nth","prism","shortest","shortest one","shortest word","silva","stand","trial","trust","upper case","uppercase"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-3851a17b","guard":[["hasAny",["amber","beast","betrayed","blind","bruisin","catastros","chance","charge","destined","destruction","dizchord","element","emperor","evilyzer","forget","glyph","item number","lights","mantis","nth","prism","shortest","shortest one","shortest word","silva","stand","trial","trust"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-7d530786","guard":[["hasAny",["amber","beast","betrayed","blind","bruisin","capitalise","capitalize","capitalize each word","catastros","chance","charge","destined","destruction","dizchord","element","emperor","evilyzer","forget","glyph","item number","lights","mantis","nth","prism","shortest","shortest one","shortest word","silva","stand","title case","trial","trust"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-8f1e4147","guard":[["hasAny",["amber","beast","betrayed","blind","bruisin","catastros","chance","charge","destined","destruction","dizchord","element","emperor","evilyzer","forget","glyph","item number","lights","lower case","lowercase","mantis","nth","prism","shortest","shortest one","shortest word","silva","small letters","stand","trial","trust"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-0441b02d","guard":[["hasAny",["amber","beast","betrayed","blind","bruisin","catastros","chance","charge","destined","destruction","dizchord","element","emperor","evilyzer","forget","glyph","item number","lights","lower case","lowercase","mantis","nth","prism","shortest","shortest one","shortest word","silva","small letters","stand","trial","trust"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-1699ec75","guard":[["hasAny",["all caps","amber","beast","betrayed","blind","bruisin","capital letters","capitals","catastros","chance","charge","destined","destruction","dizchord","element","emperor","evilyzer","forget","glyph","item number","lights","mantis","nth","prism","shortest","shortest one","shortest word","silva","stand","trial","trust","upper case","uppercase"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-5e6a934a","guard":[["hasAny",["amber","beast","betrayed","blind","bruisin","capitalise","capitalize","capitalize each word","catastros","chance","charge","destined","destruction","dizchord","element","emperor","evilyzer","forget","glyph","item number","lights","mantis","nth","prism","shortest","shortest one","shortest word","silva","stand","title case","trial","trust"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-e48c388b","guard":[["hasAny",["amber","beast","betrayed","blind","bruisin","catastros","chance","charge","destined","destruction","dizchord","element","emperor","evilyzer","forget","glyph","invert case","item number","lights","mantis","nth","prism","shortest","shortest one","shortest word","silva","stand","swap case","toggle case","trial","trust"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-a1ab9eda","guard":[["hasAny",["amber","beast","betrayed","blind","bruisin","catastros","chance","charge","destined","destruction","dizchord","element","emperor","evilyzer","forget","glyph","item number","lights","mantis","normalise","normalize","nth","prism","shortest","shortest one","shortest word","silva","simplify the text","stand","trial","trust"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-c19c3e40","guard":[["hasAny",["amber","beast","betrayed","blind","bruisin","caesar cipher","catastros","chance","charge","destined","destruction","dizchord","element","emperor","evilyzer","forget","glyph","item number","lights","mantis","nth","prism","rotate the letters","shift by","shift each letter","shortest","shortest one","shortest word","silva","stand","trial","trust"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-8c66f7cb","guard":[["hasAny",["action","all","apart","bitsy","day","element","evil","five","foul","fraxs","friend","gold","item number","learn","light","longest","longest one","longest word","nexus","nth","pink","position","quasar","ranger","taming","treat"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"for"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-33daa9cf","guard":[["hasAny",["action","all","apart","bitsy","day","element","evil","five","foul","fraxs","friend","gold","item number","learn","light","longest","longest one","longest word","lower case","lowercase","nexus","nth","pink","position","quasar","ranger","small letters","taming","treat"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["sense.after",{"lit":"for"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-8e79040b","guard":[["hasAny",["action","all","apart","bitsy","day","echoes","element","five","foul","fraxs","friend","game","gold","item number","learn","light","longest","longest one","longest word","nexus","nth","pirate","quasar","ribbon","taming","treat"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-aa47939e","guard":[["hasAny",["action","all","apart","bitsy","day","echoes","element","five","foul","fraxs","friend","game","gold","item number","learn","light","longest","longest one","longest word","nexus","nth","pirate","quasar","ribbon","taming","treat"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-18a23057","guard":[["hasAny",["action","all","apart","bitsy","capitalise","capitalize","capitalize each word","day","echoes","element","five","foul","fraxs","friend","game","gold","item number","learn","light","longest","longest one","longest word","nexus","nth","pirate","quasar","ribbon","taming","title case","treat"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-8d2fa2ca","guard":[["hasAny",["action","all","apart","bitsy","day","echoes","element","five","foul","fraxs","friend","game","gold","invert case","item number","learn","light","longest","longest one","longest word","nexus","nth","pirate","quasar","ribbon","swap case","taming","toggle case","treat"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-9728bb55","guard":[["hasAny",["action","all","apart","bitsy","day","echoes","element","five","foul","fraxs","friend","game","gold","item number","learn","light","longest","longest one","longest word","nexus","nth","pirate","quasar","ribbon","taming","treat"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-af595dcb","guard":[["hasAny",["action","all","apart","bitsy","day","echoes","element","five","foul","fraxs","friend","game","gold","item number","learn","light","longest","longest one","longest word","lower case","lowercase","nexus","nth","pirate","quasar","ribbon","small letters","taming","treat"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-c9954986","guard":[["hasAny",["action","all","all caps","apart","bitsy","capital letters","capitals","day","echoes","element","five","foul","fraxs","friend","game","gold","item number","learn","light","longest","longest one","longest word","nexus","nth","pirate","quasar","ribbon","taming","treat","upper case","uppercase"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-4cb2223b","guard":[["hasAny",["action","all","apart","bitsy","day","echoes","element","five","foul","fraxs","friend","game","gold","item number","learn","light","longest","longest one","longest word","lower case","lowercase","nexus","nth","pirate","quasar","ribbon","small letters","taming","treat"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-b9740bc5","guard":[["hasAny",["action","all","apart","bitsy","capitalise","capitalize","capitalize each word","day","echoes","element","five","foul","fraxs","friend","game","gold","item number","learn","light","longest","longest one","longest word","nexus","nth","pirate","quasar","ribbon","taming","title case","treat"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-d03593b6","guard":[["hasAny",["action","all","all caps","apart","bitsy","capital letters","capitals","day","echoes","element","five","foul","fraxs","friend","game","gold","item number","learn","light","longest","longest one","longest word","nexus","nth","pirate","quasar","ribbon","taming","treat","upper case","uppercase"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-e57ee928","guard":[["hasAny",["action","all","apart","bitsy","day","echoes","element","five","foul","fraxs","friend","game","gold","invert case","item number","learn","light","longest","longest one","longest word","nexus","nth","pirate","quasar","ribbon","swap case","taming","toggle case","treat"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-b1332c99","guard":[["hasAny",["action","all","apart","bitsy","day","echoes","element","five","foul","fraxs","friend","game","gold","item number","learn","light","longest","longest one","longest word","nexus","normalise","normalize","nth","pirate","quasar","ribbon","simplify the text","taming","treat"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-99592709","guard":[["hasAny",["abridged","action","bed","before","brief","dizchord","dolls","element","glyph","hope","item number","know","monsters","nth","origins","reflection","reverse the words","reverse word order","sam","song","stand","venjix","words backwards"]],["has","season"]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-a8c55efe","guard":[["hasAny",["action","all","apart","bitsy","caesar cipher","day","echoes","element","five","foul","fraxs","friend","game","gold","item number","learn","light","longest","longest one","longest word","nexus","nth","pirate","ribbon","rotate the letters","shift by","shift each letter","taming","treat"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-cd216866","guard":[["hasAny",["bad","beast","candle","charge","dolls","doom","element","eye","glyph","item number","lights","longest","longest one","longest word","nth","red","seas","stand","trial","trust"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-2170d587","guard":[["hasAny",["bed","before","brief","class name","dizchord","element","glyph","hope","item number","know","monsters","nth","origins","pascal case","pascalcase","song","stand","upper camel case"]],["has","season"]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-782a7d58","guard":[["hasAny",["bed","before","brief","dizchord","each word","element","glyph","hope","item number","know","monsters","nth","origins","song","split into words","stand","words"]],["has","season"]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-7a814f2d","guard":[["hasAny",["bed","before","brief","dizchord","each word","element","glyph","hope","item number","know","monsters","nth","origins","song","split into words","stand","words"]],["has","season"]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-8a73e61d","guard":[["hasAny",["bed","before","brief","dashes","dizchord","element","glyph","hope","hyphens","item number","kebab case","kebabcase","know","monsters","nth","origins","slug","song","stand"]],["has","season"]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-8f81e19b","guard":[["hasAny",["bed","before","brief","camel case","camelcase","dizchord","element","glyph","hope","item number","know","lower camel case","monsters","nth","origins","song","stand"]],["has","season"]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-a7a5fe6e","guard":[["hasAny",["bed","before","brief","dizchord","each word","element","glyph","hope","item number","know","monsters","nth","origins","song","split into words","stand","words"]],["has","season"]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-dfdf01e5","guard":[["hasAny",["bed","before","brief","dizchord","element","glyph","hope","item number","know","monsters","nth","origins","snake case","snakecase","song","stand","underscores","variable name"]],["has","season"]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-3a883579","guard":[["hasAny",["bed","before","brief","dizchord","each word","element","glyph","hope","item number","know","longest","longest one","longest word","monsters","nth","origins","song","split into words","stand","words"]],["has","season"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]]],"mem":null},
{"id":"n-774512a1","guard":[["hasAny",["bed","before","brief","dizchord","each word","element","glyph","hope","item number","know","monsters","nth","origins","shortest","shortest one","shortest word","song","split into words","stand","words"]],["has","season"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]]],"mem":null},
{"id":"n-c73242ad","guard":[["hasAny",["abridged","action","apart","chameliac","disaster","element","galvanax","item number","light","monsters","nth","ribbon","shortest","shortest one","shortest word","silver","taming","treat","underwater"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-de79cd5e","guard":[["hasAny",["action","apart","beast","charge","element","glyph","item number","light","lights","longest","longest one","longest word","nth","ribbon","shortest","shortest one","shortest word","stand","taming","trick","trust"]],["has","season"],["not",["has","eaters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-d72d8202","guard":[["hasAny",["bed","before","dizchord","dolls","element","glyph","hope","item number","know","nth","origins","reflection","reverse the words","reverse word order","sam","stand","sung","venjix","words backwards"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-bd55e8c4","guard":[["hasAny",["delete","element","item number","nth","position","remove","season","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}],["sense.roman"]]],"mem":null},
{"id":"n-755da202","guard":[["hasAny",["bed","before","class name","dizchord","element","glyph","hope","item number","know","nth","origins","pascal case","pascalcase","stand","sung","upper camel case"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-7f0b2e19","guard":[["hasAny",["bed","before","camel case","camelcase","dizchord","element","glyph","hope","item number","know","lower camel case","nth","origins","stand","sung"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-f83b610c","guard":[["hasAny",["bed","before","dashes","dizchord","element","glyph","hope","hyphens","item number","kebab case","kebabcase","know","nth","origins","slug","stand","sung"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-0e05c2ec","guard":[["hasAny",["bitsy","candle","eye","five","foul","mantis","normalise","normalize","pig","simplify the text","treat","v"]],["has","season"]],"pyramid":["render.str",["transform.norm",{"lit":"Mighty Morphin (Season 1)"},["sense.howMany"]]],"mem":null},
{"id":"n-30d38197","guard":[["hasAny",["bitsy","candle","eye","five","foul","mantis","pig","separate by","split by","treat","v"]],["has","season"]],"pyramid":["render.lines",["transform.split",{"lit":"Mighty Morphin (Season 1)"},["sense.lastWord"]]],"mem":null},
{"id":"n-42ccc1fd","guard":[["hasAny",["bitsy","candle","eye","five","foul","mantis","pig","separate by","split by","treat","v"]],["has","season"]],"pyramid":["render.and",["transform.split",{"lit":"Mighty Morphin (Season 1)"},["sense.lastWord"]]],"mem":null},
{"id":"n-c7ba05d2","guard":[["hasAny",["bitsy","candle","delete","eye","five","foul","mantis","pig","strip out","treat","v"]],["has","season"]],"pyramid":["render.str",["transform.remove",{"lit":"Mighty Morphin (Season 1)"},["sense.lastWord"]]],"mem":null},
{"id":"n-d20c5909","guard":[["hasAny",["bitsy","candle","eye","five","foul","mantis","pig","separate by","split by","treat","v"]],["has","season"]],"pyramid":["render.list",["transform.split",{"lit":"Mighty Morphin (Season 1)"},["sense.lastWord"]]],"mem":null},
{"id":"n-d3266420","guard":[["hasAny",["bitsy","caesar cipher","candle","eye","five","foul","mantis","pig","rotate the letters","shift by","shift each letter","treat","v"]],["has","season"]],"pyramid":["render.str",["transform.caesar",{"lit":"Mighty Morphin (Season 1)"},["sense.howMany"]]],"mem":null},
{"id":"n-57ad3394","guard":[["hasAny",["element","item number","nth","part","position"]],["has","season"]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}],["sense.howMany"]]],"mem":null},
{"id":"n-077efe50","guard":[["hasAny",["bed","dizchord","element","hope","item number","know","nth","reflection","reverse the words","reverse word order","sam","sung","venjix","words backwards"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-c5b00b7b","guard":[["hasAny",["clash","element","episode","galactabeasts","item number","nth","origins","position"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-4057bbe3","guard":[["hasAny",["clash","element","episode","first n","galactabeasts","item number","nth","origins","position","take"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.takeStrs",["sense.content"],["sense.howMany"]]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-81112fa6","guard":[["hasAny",["clash","element","episode","first n","galactabeasts","item number","nth","origins","position","take"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.takeStrs",["sense.content"],["sense.howMany"]]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-0d87bca1","guard":[["hasAny",["all","blind","chance","friends","nexus","separate by","sigh","split by"]],["has","season"],["has","title"]],"pyramid":["render.list",["transform.split",{"lit":"Jungle Fury"},["sense.lastWord"]]],"mem":null},
{"id":"n-46810e36","guard":[["hasAny",["all","blind","caesar cipher","chance","friends","nexus","rotate the letters","shift by","shift each letter","sigh"]],["has","season"],["has","title"]],"pyramid":["render.str",["transform.caesar",{"lit":"Jungle Fury"},["sense.howMany"]]],"mem":null},
{"id":"n-b8791eb8","guard":[["hasAny",["all","blind","chance","delete","friends","nexus","sigh","strip out"]],["has","season"],["has","title"]],"pyramid":["render.str",["transform.remove",{"lit":"Jungle Fury"},["sense.lastWord"]]],"mem":null},
{"id":"n-1c9b3ddc","guard":[["hasAny",["abridged","action","dolls","element","item number","no vowels","nth","reflection","remove vowels","sam","venjix","without vowels"]],["has","season"]],"pyramid":["render.str",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-d4bbbd47","guard":[["hasAny",["abridged","action","dolls","element","first letters of the name","initials","item number","nth","reflection","sam","venjix"]],["has","season"]],"pyramid":["render.str",["transform.initials",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-faa95646","guard":[["hasAny",["clash","element","empty","galactabeasts","gatekeeper","item number","normalise","normalize","nth","origins","position","quasar","simplify the text"]],["has","season"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}],["sense.first"]]],"mem":null},
{"id":"n-588c49d0","guard":[["hasAny",["abridged","action","another","brief","confusion","element","item number","monsters","nth","reverse the words","reverse word order","words backwards"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-b0d0ec2a","guard":[["hasAny",["caesar cipher","future","galvanax","gold","learn","prism","ribbon","rotate the letters","shift by","shift each letter"]],["has","season"]],"pyramid":["render.str",["transform.caesar",{"lit":"Ninja Steel"},["sense.howMany"]]],"mem":null},
{"id":"n-8b4342e1","guard":[["hasAny",["alphabetize the letters","another","bed","brief","element","item number","know","letters in order","nth","sort the letters","sung"]]],"pyramid":["render.str",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-1446ccb2","guard":[["hasAny",["amber","element","extinction","forget","item number","nth","trial"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Dino Super Charge."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-8b21ee2b","guard":[["hasAny",["blind","chance","element","friends","item number","nth","sigh"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Jungle Fury."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-fd815b7f","guard":[["hasAny",["candle","element","eye","item number","mantis","nth","pig","v"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mighty Morphin (Season 1)."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-f493b439","guard":[["hasAny",["clash","element","galactabeasts","item number","nth","origins","position","reflection","sam"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],["sense.first"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-0b6f86df","guard":[["hasAny",["bed","class name","dizchord","element","hope","item number","know","nth","pascal case","pascalcase","sung","upper camel case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-54d16996","guard":[["hasAny",["bed","dashes","dizchord","element","hope","hyphens","item number","kebab case","kebabcase","know","nth","slug","sung"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-89d66e5b","guard":[["hasAny",["bed","camel case","camelcase","dizchord","element","hope","item number","know","lower camel case","nth","sung"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-21221cf0","guard":[["hasAny",["amber","extinction","forget","separate by","split by","trial"]],["has","season"]],"pyramid":["render.list",["transform.split",{"lit":"Dino Super Charge"},["sense.lastWord"]]],"mem":null},
{"id":"n-32d7b53c","guard":[["hasAny",["amber","delete","extinction","forget","strip out","trial"]],["has","season"]],"pyramid":["render.str",["transform.remove",{"lit":"Dino Super Charge"},["sense.lastWord"]]],"mem":null},
{"id":"n-3fd9207a","guard":[["hasAny",["charge","friend","iii","normalise","normalize","seas","simplify the text"]],["has","season"]],"pyramid":["render.str",["transform.norm",{"lit":"Mighty Morphin (Season 3)"},["sense.howMany"]]],"mem":null},
{"id":"n-425d4e89","guard":[["hasAny",["caesar cipher","chameliac","destined","game","lights","red","rotate the letters","shift by","shift each letter"]],["has","season"]],"pyramid":["render.str",["transform.caesar",{"lit":"Lost Galaxy"},["sense.howMany"]]],"mem":null},
{"id":"n-7fe0d891","guard":[["hasAny",["caesar cipher","charge","friend","iii","rotate the letters","seas","shift by","shift each letter"]],["has","season"]],"pyramid":["render.str",["transform.caesar",{"lit":"Mighty Morphin (Season 3)"},["sense.howMany"]]],"mem":null},
{"id":"n-88581455","guard":[["hasAny",["another","bed","brief","caesar cipher","know","rotate the letters","shift by","shift each letter","sung"]],["has","season"]],"pyramid":["render.str",["transform.caesar",{"lit":"Zeo"},["sense.howMany"]]],"mem":null},
{"id":"n-a764eba5","guard":[["hasAny",["amber","caesar cipher","extinction","forget","rotate the letters","shift by","shift each letter","trial"]],["has","season"]],"pyramid":["render.str",["transform.caesar",{"lit":"Dino Super Charge"},["sense.howMany"]]],"mem":null},
{"id":"n-0fc70659","guard":[["hasAny",["bitsy","element","five","foul","item number","longest","longest one","longest word","nth","treat"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mighty Morphin (Season 1)."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-9c896869","guard":[["hasAny",["element","galvanax","gold","item number","learn","nth","ribbon"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Ninja Steel."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-02549d8d","guard":[["hasAny",["beast","element","encounter","hunt","item number","maneuvers","nth"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mighty Morphin (Season 2)."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-12a1ab2e","guard":[["hasAny",["arms","deception","element","item number","no","nth","strangers"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Ninja Storm."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-d0605b76","guard":[["hasAny",["destined","element","galactabeasts","item number","lights","nth","red"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Lost Galaxy."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-0bf4ba89","guard":[["hasAny",["another","brief","class name","confusion","element","item number","monsters","nth","pascal case","pascalcase","upper camel case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-20d8f386","guard":[["hasAny",["element","episode","item number","nth","position"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-36774b2f","guard":[["hasAny",["another","brief","confusion","dashes","element","hyphens","item number","kebab case","kebabcase","monsters","nth","slug"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-e4dbf58b","guard":[["hasAny",["another","brief","camel case","camelcase","confusion","element","item number","lower camel case","monsters","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-29ed0ded","guard":[["hasAny",["dolls","element","item number","no vowels","nth","reflection","remove vowels","sam","venjix","without vowels"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-2d8bce36","guard":[["hasAny",["element","episode","first n","item number","nth","position","take"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.takeStrs",["sense.content"],["sense.howMany"]]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-f04c001d","guard":[["hasAny",["element","episode","first n","item number","nth","position","take"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.takeStrs",["sense.content"],["sense.howMany"]]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-fb78f3d9","guard":[["hasAny",["dolls","element","first letters of the name","initials","item number","nth","reflection","sam","venjix"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.initials",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-8110f6fe","guard":[["hasAny",["element","episode","item number","nth","position"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],["sense.howMany"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-9d5574b8","guard":[["hasAny",["element","episode","item number","nth","position"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],["sense.howMany"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-02b45ba0","guard":[["hasAny",["beast","delete","encounter","hunt","maneuvers","strip out"]],["has","season"],["has","title"],["not",["has","below"]]],"pyramid":["render.str",["transform.remove",{"lit":"Mighty Morphin (Season 2)"},["sense.lastWord"]]],"mem":null},
{"id":"n-0ee1f9b7","guard":[["hasAny",["beast","encounter","hunt","maneuvers","normalise","normalize","simplify the text"]],["has","season"],["has","title"],["not",["has","below"]]],"pyramid":["render.str",["transform.norm",{"lit":"Mighty Morphin (Season 2)"},["sense.howMany"]]],"mem":null},
{"id":"n-12a36c0a","guard":[["hasAny",["beast","encounter","hunt","maneuvers","separate by","split by"]],["has","season"],["has","title"],["not",["has","below"]]],"pyramid":["render.lines",["transform.split",{"lit":"Mighty Morphin (Season 2)"},["sense.lastWord"]]],"mem":null},
{"id":"n-461df6ee","guard":[["hasAny",["beast","delete","encounter","hunt","maneuvers","strip out"]],["has","season"],["has","title"],["not",["has","below"]]],"pyramid":["render.str",["transform.remove",{"lit":"Mighty Morphin (Season 2)"},["sense.subject"]]],"mem":null},
{"id":"n-4dc8f2cb","guard":[["hasAny",["arms","caesar cipher","deception","no","rotate the letters","shift by","shift each letter","strangers"]],["has","season"],["has","title"]],"pyramid":["render.str",["transform.caesar",{"lit":"Ninja Storm"},["sense.howMany"]]],"mem":null},
{"id":"n-574b8baf","guard":[["hasAny",["beast","encounter","hunt","maneuvers","separate by","split by"]],["has","season"],["has","title"],["not",["has","below"]]],"pyramid":["render.lines",["transform.split",{"lit":"Mighty Morphin (Season 2)"},["sense.subject"]]],"mem":null},
{"id":"n-6a0e01a5","guard":[["hasAny",["beast","caesar cipher","encounter","hunt","maneuvers","rotate the letters","shift by","shift each letter"]],["has","season"],["has","title"],["not",["has","below"]]],"pyramid":["render.str",["transform.caesar",{"lit":"Mighty Morphin (Season 2)"},["sense.howMany"]]],"mem":null},
{"id":"n-74050162","guard":[["hasAny",["beast","encounter","hunt","maneuvers","separate by","split by"]],["has","season"],["has","title"],["not",["has","below"]]],"pyramid":["render.list",["transform.split",{"lit":"Mighty Morphin (Season 2)"},["sense.subject"]]],"mem":null},
{"id":"n-bf93e979","guard":[["hasAny",["beast","encounter","hunt","maneuvers","separate by","split by"]],["has","season"],["has","title"],["not",["has","below"]]],"pyramid":["render.list",["transform.split",{"lit":"Mighty Morphin (Season 2)"},["sense.lastWord"]]],"mem":null},
{"id":"n-d32373fc","guard":[["hasAny",["beast","encounter","hunt","maneuvers","separate by","split by"]],["has","season"],["has","title"],["not",["has","below"]]],"pyramid":["render.and",["transform.split",{"lit":"Mighty Morphin (Season 2)"},["sense.lastWord"]]],"mem":null},
{"id":"n-dd3c8875","guard":[["hasAny",["beast","encounter","hunt","maneuvers","separate by","split by"]],["has","season"],["has","title"],["not",["has","below"]]],"pyramid":["render.and",["transform.split",{"lit":"Mighty Morphin (Season 2)"},["sense.subject"]]],"mem":null},
{"id":"n-81db77ce","guard":[["hasAny",["chameliac","element","game","item number","nth","quasar"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Lost Galaxy."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-8a9441ac","guard":[["hasAny",["element","gold","item number","learn","longest","longest one","longest word","nth","ribbon"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Ninja Steel."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-c942af67","guard":[["hasAny",["amber","element","forget","item number","nth","shortest","shortest one","shortest word","trial"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Dino Super Charge."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-043d60ee","guard":[["hasAny",["element","item number","mantis","nth","pig","v"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mighty Morphin (Season 1)."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-2226f265","guard":[["hasAny",["catastros","element","gatekeeper","item number","nth","soul"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mystic Force."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-32cadbae","guard":[["hasAny",["bad","bruisin","element","item number","nth","silva"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Beast Morphers (Season 2)."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-462e6c60","guard":[["hasAny",["charge","different","element","item number","nth","seas"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mighty Morphin (Season 3)."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-8d9d8bd6","guard":[["hasAny",["arms","deception","element","item number","no","nth"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Ninja Storm."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-be6e306e","guard":[["hasAny",["bed","element","item number","know","nth","sung"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Zeo."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-c630c74d","guard":[["hasAny",["before","dizchord","element","item number","nth","stand"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Megaforce."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-0edac395","guard":[["hasAny",["dizchord","element","glyph","item number","nth","reverse the words","reverse word order","shortest","shortest one","shortest word","stand","words backwards"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-2259d8cb","guard":[["hasAny",["camel case","camelcase","dizchord","element","glyph","item number","lower camel case","nth","shortest","shortest one","shortest word","stand"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-373e154c","guard":[["hasAny",["dashes","dizchord","element","glyph","hyphens","item number","kebab case","kebabcase","nth","shortest","shortest one","shortest word","slug","stand"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-69a1d690","guard":[["hasAny",["class name","dizchord","element","glyph","item number","nth","pascal case","pascalcase","shortest","shortest one","shortest word","stand","upper camel case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-0f163c25","guard":[["hasAny",["element","item number","no vowels","nth","reflection","remove vowels","sam","venjix","without vowels"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-a7a7b277","guard":[["hasAny",["element","first letters of the name","initials","item number","nth","reflection","sam","venjix"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.initials",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-72261f08","guard":[["hasAny",["delete","friend","iii","remove","strip out"]],["has","season"]],"pyramid":["render.str",["transform.remove",{"lit":"Mighty Morphin (Season 3)"},["sense.roman"]]],"mem":null},
{"id":"n-d5a4a8dd","guard":[["hasAny",["deception","delete","no","remove","strangers","strip out"]],["has","season"]],"pyramid":["render.str",["transform.remove",{"lit":"Ninja Storm"},["sense.roman"]]],"mem":null},
{"id":"n-d825078e","guard":[["hasAny",["caesar cipher","catastros","light","rotate the letters","shift by","shift each letter","soul"]],["has","season"],["not",["has","eaters"]]],"pyramid":["render.str",["transform.caesar",{"lit":"Mystic Force"},["sense.howMany"]]],"mem":null},
{"id":"n-db5a252e","guard":[["hasAny",["delete","eye","green","remove","strip out"]],["has","season"]],"pyramid":["render.str",["transform.remove",{"lit":"Mighty Morphin (Season 1)"},["sense.roman"]]],"mem":null},
{"id":"n-00b54aa2","guard":[["hasAny",["armor","element","friend","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mighty Morphin (Season 3)."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-01025e8e","guard":[["hasAny",["another","brief","element","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Zeo."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-13a9252a","guard":[["hasAny",["destined","element","item number","lights","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Lost Galaxy."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-4431ddad","guard":[["hasAny",["blind","chance","element","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Jungle Fury."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-81935228","guard":[["hasAny",["apart","element","fraxs","item number","longest","longest one","longest word","nth"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Time Force."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-89b120c2","guard":[["hasAny",["all","element","item number","longest","longest one","longest word","nexus","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Jungle Fury."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-8db8e080","guard":[["hasAny",["dizchord","element","item number","nth","shortest","shortest one","shortest word","stand"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Megaforce."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-9d131ea6","guard":[["hasAny",["bruisin","element","item number","nth","shortest","shortest one","shortest word","silva"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Beast Morphers (Season 2)."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-a0c7a93f","guard":[["hasAny",["element","game","item number","longest","longest one","longest word","nth","quasar"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Lost Galaxy."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-e002ca87","guard":[["hasAny",["element","item number","nth","pirate","underwater"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Operation Overdrive."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-09835178","guard":[["hasAny",["dolls","element","item number","nth","venjix"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is R.P.M.."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-224a409c","guard":[["hasAny",["copies","element","empty","gatekeeper","item number","nth","position","repeat","say it times"]]],"pyramid":["render.str",["transform.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}],["sense.first"]]],"mem":null},
{"id":"n-27138d03","guard":[["hasAny",["chance","element","item number","nth","sigh"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Jungle Fury."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-55877f89","guard":[["hasAny",["element","encounter","hunt","item number","nth"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mighty Morphin (Season 2)."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-71fbe667","guard":[["hasAny",["demons","destruction","element","item number","nth"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Lightspeed Rescue."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-77716cb7","guard":[["hasAny",["catastros","element","gatekeeper","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mystic Force."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-84742ac1","guard":[["hasAny",["element","empty","gatekeeper","item number","nth","position"]]],"pyramid":["render.lines",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}],["sense.first"]]],"mem":null},
{"id":"n-9808bc5a","guard":[["hasAny",["element","empty","gatekeeper","item number","nth","position"]]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}],["sense.first"]]],"mem":null},
{"id":"n-a64dc4d7","guard":[["hasAny",["clash","element","item number","jens","nth"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Time Force."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-a6dc804a","guard":[["hasAny",["element","item number","nth","reflection","sam"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is S.P.D.."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-b318ea20","guard":[["hasAny",["element","future","item number","nth","prism"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Ninja Steel."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-be9900c1","guard":[["hasAny",["drivers","element","emperor","item number","nth"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Super Megaforce."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-ce4a07b0","guard":[["hasAny",["element","empty","gatekeeper","item number","nth","position"]]],"pyramid":["render.and",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}],["sense.first"]]],"mem":null},
{"id":"n-22c09622","guard":[["hasAny",["abridged","action","element","item number","no vowels","nth","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-95cbf376","guard":[["hasAny",["element","empty","gatekeeper","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.first"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-eb06ae53","guard":[["hasAny",["abridged","action","element","first letters of the name","initials","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.initials",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-29e7e7d0","guard":[["hasAny",["element","empty","first n","gatekeeper","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.takeStrs",["sense.content"],["sense.first"]]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-491e80f9","guard":[["hasAny",["element","empty","first n","gatekeeper","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.takeStrs",["sense.content"],["sense.first"]]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-755475c2","guard":[["hasAny",["galactabeasts","quasar"]]],"pyramid":["render.list",["iterate.repeat",{"lit":"Lost Galaxy"},["sense.howMany"]]],"mem":null},
{"id":"n-ae715f83","guard":[["hasAny",["galactabeasts","normalise","normalize","quasar","simplify the text"]]],"pyramid":["render.str",["transform.norm",{"lit":"Lost Galaxy"},["sense.first"]]],"mem":null},
{"id":"n-00361ade","guard":[["hasAny",["charge","element","item number","nth","shortest","shortest one","shortest word"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mighty Morphin (Season 3)."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-01069455","guard":[["hasAny",["betrayed","element","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Beast Morphers (Season 1)."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-020004b4","guard":[["hasAny",["disaster","element","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Dino Super Charge."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-06023a42","guard":[["hasAny",["abridged","element","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is S.P.D.."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-08cd943e","guard":[["hasAny",["element","item number","monsters","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Samurai."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-093f1b6b","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","taming"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Wild Force."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-1040e7bc","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","pirate"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Operation Overdrive."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-21af66f5","guard":[["hasAny",["echoes","element","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Super Ninja Steel."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-33b9e37f","guard":[["hasAny",["beast","element","item number","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mighty Morphin (Season 2)."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-498349c3","guard":[["hasAny",["confusion","element","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Turbo."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-51393ca8","guard":[["hasAny",["element","item number","mantis","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mighty Morphin (Season 1)."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-5f928d5a","guard":[["hasAny",["destruction","element","item number","nth","shortest","shortest one","shortest word"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Lightspeed Rescue."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-83ba3266","guard":[["hasAny",["element","glyph","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Turbo."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-a1f6822f","guard":[["hasAny",["element","item number","light","longest","longest one","longest word","nth"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mystic Force."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-be31ec72","guard":[["hasAny",["element","friend","item number","longest","longest one","longest word","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mighty Morphin (Season 3)."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-ccbbc19c","guard":[["hasAny",["element","item number","nth","prism","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Ninja Steel."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-d1abf4d3","guard":[["hasAny",["day","element","item number","longest","longest one","longest word","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Ninja Storm."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-dbfc2422","guard":[["hasAny",["element","emperor","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Super Megaforce."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-df2335b7","guard":[["hasAny",["catastros","element","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mystic Force."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-ef6fba17","guard":[["hasAny",["action","element","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is R.P.M.."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-fd3f8fef","guard":[["hasAny",["element","item number","nth","silver"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is In Space."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-fdbe853e","guard":[["hasAny",["element","evilyzer","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is In Space."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-fe089943","guard":[["hasAny",["element","item number","nth","shortest","shortest one","shortest word","trust"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Super Samurai."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-08bbb0d6","guard":[["hasAny",["element","hope","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Turbo."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-0b59c39a","guard":[["hasAny",["element","item number","nth","venjix"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is R.P.M.."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-22574c5c","guard":[["hasAny",["delete","element","episode","item number","nth","position","remove","strip out","without"]],["has","season"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}],["sense.quoted"]]],"mem":null},
{"id":"n-5dbf6b08","guard":[["hasAny",["edge","element","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Dino Super Charge."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-65a81807","guard":[["hasAny",["element","item number","jens","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Time Force."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-6805b4ea","guard":[["hasAny",["element","item number","nth","origins"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Samurai."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-73481dda","guard":[["hasAny",["element","item number","nth","struck"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Dino Thunder."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-79bc411e","guard":[["hasAny",["day","delete","element","item number","nth","position","remove","strip out","without"]],["has","give"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}],["sense.unit"]]],"mem":null},
{"id":"n-c3eebe20","guard":[["hasAny",["city","element","item number","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is In Space."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-f72c58a0","guard":[["hasAny",["doom","element","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Super Ninja Steel."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-fa5cc845","guard":[["hasAny",["element","empty","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Operation Overdrive."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]]],"mem":null},
{"id":"n-04240a42","guard":[["hasAny",["element","item number","nth","prism","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Return of the Prism is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-0601fd76","guard":[["hasAny",["element","five","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of High Five is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-0e1295e9","guard":[["hasAny",["apart","element","item number","longest","longest one","longest word","nth"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Worlds Apart is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-11bd3db8","guard":[["hasAny",["element","gold","item number","longest","longest one","longest word","nth"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Gold Rush is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-1ee8b039","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","ribbon"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Ranger Ribbon is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-1f7bb083","guard":[["hasAny",["destined","element","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Destined for Greatness is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-20e5c2b7","guard":[["hasAny",["element","item number","nth","shortest","shortest one","shortest word","silva"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Silva Switch is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-28529ab1","guard":[["hasAny",["another","element","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Another Song and Dance is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-2ad04fc0","guard":[["hasAny",["element","item number","nth","shortest","shortest one","shortest word","stand"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of United We Stand is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-2bf6fc4a","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","quasar"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Quasar Quest: Part 2 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-322cbe05","guard":[["hasAny",["element","item number","monsters","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Party Monsters is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-32e9f02e","guard":[["hasAny",["element","fraxs","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Frax's Fury is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-3aa8475a","guard":[["hasAny",["destruction","element","item number","nth","shortest","shortest one","shortest word"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Wheels of Destruction is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-3e855abb","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","taming"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Taming of the Zords is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-3ff53942","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","treat"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Trick or Treat is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-42fb3d1a","guard":[["hasAny",["element","item number","nth","shortest","shortest one","shortest word","trial"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Trick or Trial is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-4a96ac6c","guard":[["hasAny",["all","element","item number","longest","longest one","longest word","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Can't Win Them All is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-4b734b06","guard":[["hasAny",["disaster","element","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Recipe for Disaster is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-5716c9d9","guard":[["hasAny",["brief","element","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of A Brief Mystery of Time is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-5c3a2473","guard":[["hasAny",["blind","element","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Blind Leading the Blind is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-65152b6c","guard":[["hasAny",["armor","element","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Master Vile and the Metallic Armor: Part III is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-755e443f","guard":[["hasAny",["charge","element","item number","nth","shortest","shortest one","shortest word"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of A Chimp in Charge is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-7ae114ab","guard":[["hasAny",["element","game","item number","longest","longest one","longest word","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of An Evil Game is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-81fa9b58","guard":[["hasAny",["beast","element","item number","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Beauty and the Beast is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-83cb0f58","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","pirate"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Pirate in Pink is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-8885badc","guard":[["hasAny",["betrayed","element","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tools of the Betrayed is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-89dd2b72","guard":[["hasAny",["element","emperor","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Emperor Mavro is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-8a29ed6e","guard":[["hasAny",["echoes","element","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Echoes of Evil is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-8c9425ba","guard":[["hasAny",["action","element","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of And... Action is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-9207df85","guard":[["hasAny",["bruisin","element","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Cruisin' for a Bruisin' is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-939bde8f","guard":[["hasAny",["element","item number","longest","longest one","longest word","nexus","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Race to the Nexus is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-95c87833","guard":[["hasAny",["chameliac","element","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Chameliac Warrior is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-9890c796","guard":[["hasAny",["element","item number","nth","shortest","shortest one","shortest word","trust"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Trust Me is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-98d50d08","guard":[["hasAny",["element","glyph","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Glyph Hanger is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-9f78178b","guard":[["hasAny",["element","friend","item number","longest","longest one","longest word","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of A Friend in Need: Part I is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-a5e06bbf","guard":[["hasAny",["element","item number","lights","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Lights of Orion is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-a9cd61bd","guard":[["hasAny",["bitsy","element","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Itsy Bitsy Spider is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-ac787103","guard":[["hasAny",["element","item number","learn","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Live and Learn is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-acc20831","guard":[["hasAny",["amber","element","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Nightmare in Amber Beach is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-ba8ee4d2","guard":[["hasAny",["abridged","element","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of A-Bridged is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-bec8a623","guard":[["hasAny",["element","galvanax","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Galvanax Rises is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-cc8c0646","guard":[["hasAny",["element","item number","nth","silver"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Survival of the Silver is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-cf99b338","guard":[["hasAny",["element","item number","nth","underwater"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Underwater World is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-d146b463","guard":[["hasAny",["element","forget","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Forgive and Forget is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-d44550ec","guard":[["hasAny",["element","item number","light","longest","longest one","longest word","nth"]],["has","season"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Light is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-d4615abe","guard":[["hasAny",["chance","element","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Ghost of a Chance is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-d8417219","guard":[["hasAny",["catastros","element","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Legendary Catastros is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-dadcb037","guard":[["hasAny",["element","evilyzer","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Great Evilyzer is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-dced7d31","guard":[["hasAny",["element","foul","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Foul Play in the Sky is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-dfe3c237","guard":[["hasAny",["confusion","element","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Song of Confusion is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-e542f8eb","guard":[["hasAny",["element","item number","mantis","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Plague of the Mantis is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-e70c9434","guard":[["hasAny",["dizchord","element","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Harmony and Dizchord is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-f29e5720","guard":[["hasAny",["day","element","item number","longest","longest one","longest word","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of A Gem of a Day is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-0114c4d6","guard":[["hasAny",["element","item number","nth","soul"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Soul Specter is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-0d534f58","guard":[["hasAny",["element","item number","know","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Do I Know You? is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-0f16b061","guard":[["hasAny",["element","item number","nth","sung"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Song Sung Yellow is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-17a87a41","guard":[["hasAny",["demons","element","item number","nth"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Rise of the Super Demons is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-1a9a1a5c","guard":[["hasAny",["doom","element","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Doom Signal is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-2d7b3f48","guard":[["hasAny",["element","item number","jens","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Jen's Revenge is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-310dfda4","guard":[["hasAny",["element","item number","nth","v"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Green with Evil: Part V is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-34b00977","guard":[["hasAny",["away","element","item number","nth"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Friends Don't Fade Away is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-352b5aa7","guard":[["hasAny",["element","end","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of End of Extinction is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-365f9c9f","guard":[["hasAny",["dolls","element","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Dome Dolls is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-3c8ce973","guard":[["hasAny",["element","item number","nth","reflection"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Reflection: Part 2 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-3d909c95","guard":[["hasAny",["bad","element","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Making Bad is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-3e995c29","guard":[["hasAny",["element","future","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Past, Presents, and Future is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-46ae4652","guard":[["hasAny",["element","item number","nth","red"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Rookie in Red is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-47ee145c","guard":[["hasAny",["element","item number","nth","strangers"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Thunder Strangers: Part I is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-4cda8d80","guard":[["hasAny",["different","element","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of A Different Shade of Pink: Part III is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-4dd0f60d","guard":[["hasAny",["element","eye","item number","nth"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of I, Eye Guy is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-4f02c312","guard":[["hasAny",["before","element","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Robo Knight Before Christmas is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-50a88572","guard":[["hasAny",["arms","element","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Brothers in Arms is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-521bf663","guard":[["hasAny",["element","item number","nth","sigh"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Sigh of the Tiger is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-573867e2","guard":[["hasAny",["element","item number","no","nth"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of There's No 'I' in Team is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-5dfe18ba","guard":[["hasAny",["candle","element","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Green Candle: Part I is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-5f831d7b","guard":[["hasAny",["deception","element","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of General Deception: Part II is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-63bec546","guard":[["hasAny",["drivers","element","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of In the Driver's Seat is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-6421279d","guard":[["hasAny",["bed","element","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Oily to Bed, Oily to Rise is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-67769769","guard":[["hasAny",["element","item number","nth","spirits"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of True Friends, True Spirits is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-69d4cd87","guard":[["hasAny",["element","item number","maneuvers","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Orchestral Maneuvers in the Park is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-6e29c64b","guard":[["hasAny",["element","item number","nth","sam"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Sam: Part 2 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-72657e54","guard":[["hasAny",["element","hope","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of One Last Hope is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-74e69eae","guard":[["hasAny",["element","galactabeasts","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Lost Galactabeasts: Part 2 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-773ea4c1","guard":[["hasAny",["city","element","item number","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Misson to Secret City is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-8812dc67","guard":[["hasAny",["element","encounter","item number","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Ninja Encounter: Part I is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-9274976e","guard":[["hasAny",["element","item number","nth","struck"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Thunder Struck: Part II is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-9c02ed51","guard":[["hasAny",["element","gatekeeper","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of The Gatekeeper: Part 1 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-b26d62a1","guard":[["hasAny",["element","item number","nth","origins"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Origins Part 2 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-b4ac20df","guard":[["hasAny",["element","hunt","item number","nth"]],["has","season"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Scavenger Hunt is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-bc63a1b7","guard":[["hasAny",["element","empty","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Ronny on Empty: Part 1 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-bd6b0120","guard":[["hasAny",["edge","element","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Edge of Extinction is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-c992d5f3","guard":[["hasAny",["element","item number","nth","pig"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of A Pig Surprise is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-cb256987","guard":[["hasAny",["element","item number","nth","venjix"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of If Venjix Won is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-df57c37d","guard":[["hasAny",["clash","element","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Clash for Control: Part 2 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-fe9c8b6f","guard":[["hasAny",["element","item number","nth","seas"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Sowing the Seas of Evil is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-1d17a0d8","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","quasar"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],["sense.first"]],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-0399083f","guard":[["hasAny",["action","element","item number","longest","longest one","longest word","nth","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-3ef87028","guard":[["hasAny",["element","item number","nth","position","quasar"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-5a7c1059","guard":[["hasAny",["action","element","item number","longest","longest one","longest word","no vowels","nth","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-ad340d52","guard":[["hasAny",["action","element","first letters of the name","initials","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["transform.initials",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]]],"mem":null},
{"id":"n-389f6c17","guard":[["hasAny",["element","first n","item number","nth","position","quasar","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.takeStrs",["sense.content"],["sense.howMany"]]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-a14df340","guard":[["hasAny",["element","first n","item number","nth","position","quasar","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.takeStrs",["sense.content"],["sense.howMany"]]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"}],{"lit":1}],{"lit":"fr-tidytuesday-power-rangers-episodes-623e94"},{"lit":"episode title"},{"lit":"season title"}]],"mem":null},
{"id":"n-01846f40","guard":[["hasAny",["confusion","season","song","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for The Song of Confusion":"The season title of The Song of Confusion is Turbo."}}},
{"id":"n-02931916","guard":[["hasAny",["season","title","trust"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Trust Me":"The season title of Trust Me is Super Samurai."}}},
{"id":"n-03a0a214","guard":[["hasAny",["destruction","episode","season","title","wheels"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Wheels of Destruction":"The season title of Wheels of Destruction is Lightspeed Rescue."}}},
{"id":"n-045f4295","guard":[["hasAny",["forget","forgive","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Forgive and Forget":"The season title of Forgive and Forget is Dino Super Charge."}}},
{"id":"n-058fa122","guard":[["hasAny",["episode","last","ranger","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title The Last Ranger":"The season title of The Last Ranger is Lightspeed Rescue."}}},
{"id":"n-05d48ccd","guard":[["hasAny",["deception","episode","general","ii","part","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title General Deception: Part II":"The season title of General Deception: Part II is Ninja Storm."}}},
{"id":"n-092c9d7d","guard":[["hasAny",["maneuvers","orchestral","park","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Orchestral Maneuvers in the Park":"The season title of Orchestral Maneuvers in the Park is Mighty Morphin (Season 2)."}}},
{"id":"n-09441ae6","guard":[["hasAny",["lights","orion","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of The Lights of Orion":"The season title of The Lights of Orion is Lost Galaxy."}}},
{"id":"n-0945a65c","guard":[["hasAny",["disaster","recipe","season","title"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Recipe for Disaster":"The season title of Recipe for Disaster is Dino Super Charge."}}},
{"id":"n-0c267cf8","guard":[["hasAny",["season","soul","specter","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Soul Specter":"The season title of Soul Specter is Mystic Force."}}},
{"id":"n-12091ded","guard":[["hasAny",["episode","season","title","venjix","won"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title If Venjix Won":"The season title of If Venjix Won is R.P.M.."}}},
{"id":"n-1248d208","guard":[["hasAny",["part","quasar","quest","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Quasar Quest: Part 2":"The season title of Quasar Quest: Part 2 is Lost Galaxy."}}},
{"id":"n-18e8f84f","guard":[["hasAny",["ranger","ribbon","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for The Ranger Ribbon":"The season title of The Ranger Ribbon is Ninja Steel."}}},
{"id":"n-1c854458","guard":[["hasAny",["emperor","episode","mavro","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Emperor Mavro":"The season title of Emperor Mavro is Super Megaforce."}}},
{"id":"n-1ca152ee","guard":[["hasAny",["episode","part","sam","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Sam: Part 2":"The season title of Sam: Part 2 is S.P.D.."}}},
{"id":"n-213d8825","guard":[["hasAny",["part","season","strangers","thunder","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Thunder Strangers: Part I":"The season title of Thunder Strangers: Part I is Ninja Storm."}}},
{"id":"n-23ddb3e3","guard":[["hasAny",["empty","episode","part","ronny","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Ronny on Empty: Part 1":"The season title of Ronny on Empty: Part 1 is Operation Overdrive."}}},
{"id":"n-2419c701","guard":[["hasAny",["charge","chimp","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of A Chimp in Charge":"The season title of A Chimp in Charge is Mighty Morphin (Season 3)."}}},
{"id":"n-263a560a","guard":[["hasAny",["chance","episode","ghost","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Ghost of a Chance":"The season title of Ghost of a Chance is Jungle Fury."}}},
{"id":"n-28bf14b1","guard":[["hasAny",["friends","season","spirits","title","true"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of True Friends, True Spirits":"The season title of True Friends, True Spirits is Jungle Fury."}}},
{"id":"n-2bfbedcb","guard":[["hasAny",["green","ranger","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Ranger Green":"The season title of Ranger Green is R.P.M.."}}},
{"id":"n-3043fbb9","guard":[["hasAny",["foul","play","season","sky","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Foul Play in the Sky":"The season title of Foul Play in the Sky is Mighty Morphin (Season 1)."}}},
{"id":"n-3097ccc8","guard":[["hasAny",["candle","green","part","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of The Green Candle: Part I":"The season title of The Green Candle: Part I is Mighty Morphin (Season 1)."}}},
{"id":"n-30e7be61","guard":[["hasAny",["episode","pig","season","surprise","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title A Pig Surprise":"The season title of A Pig Surprise is Mighty Morphin (Season 1)."}}},
{"id":"n-31f9676a","guard":[["hasAny",["galactabeasts","lost","part","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of The Lost Galactabeasts: Part 2":"The season title of The Lost Galactabeasts: Part 2 is Lost Galaxy."}}},
{"id":"n-3637e930","guard":[["hasAny",["gold","rush","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Gold Rush":"The season title of Gold Rush is Ninja Steel."}}},
{"id":"n-38aa9c35","guard":[["hasAny",["amber","beach","nightmare","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Nightmare in Amber Beach":"The season title of Nightmare in Amber Beach is Dino Super Charge."}}},
{"id":"n-39db0aea","guard":[["hasAny",["season","title","trial","trick"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Trick or Trial":"The season title of Trick or Trial is Dino Super Charge."}}},
{"id":"n-3c050b7a","guard":[["hasAny",["arms","brothers","episode","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Brothers in Arms":"The season title of Brothers in Arms is Ninja Storm."}}},
{"id":"n-3d12434b","guard":[["hasAny",["echoes","evil","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Echoes of Evil":"The season title of Echoes of Evil is Super Ninja Steel."}}},
{"id":"n-3e1c6b5f","guard":[["hasAny",["episode","season","sigh","tiger","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Sigh of the Tiger":"The season title of Sigh of the Tiger is Jungle Fury."}}},
{"id":"n-431abfec","guard":[["hasAny",["episode","season","silva","switch","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title The Silva Switch":"The season title of The Silva Switch is Beast Morphers (Season 2)."}}},
{"id":"n-44f23ca1","guard":[["hasAny",["episode","evil","green","part","season","title","v"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Green with Evil: Part V":"The season title of Green with Evil: Part V is Mighty Morphin (Season 1)."}}},
{"id":"n-461749cb","guard":[["hasAny",["monsters","party","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Party Monsters":"The season title of Party Monsters is Samurai."}}},
{"id":"n-49d8cd85","guard":[["hasAny",["light","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for The Light":"The season title of The Light is Mystic Force."}}},
{"id":"n-4db95320","guard":[["hasAny",["future","past","presents","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Past, Presents, and Future":"The season title of Past, Presents, and Future is Ninja Steel."}}},
{"id":"n-505881bc","guard":[["hasAny",["episode","part","reflection","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Reflection: Part 2":"The season title of Reflection: Part 2 is S.P.D.."}}},
{"id":"n-5084c5e6","guard":[["hasAny",["evil","game","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for An Evil Game":"The season title of An Evil Game is Lost Galaxy."}}},
{"id":"n-5356d001","guard":[["hasAny",["episode","no","season","team","theres","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title There's No 'I' in Team":"The season title of There's No 'I' in Team is Ninja Storm."}}},
{"id":"n-56d02bb8","guard":[["hasAny",["episode","prism","return","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Return of the Prism":"The season title of Return of the Prism is Ninja Steel."}}},
{"id":"n-572ca2d1","guard":[["hasAny",["apart","season","title","worlds"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Worlds Apart":"The season title of Worlds Apart is Time Force."}}},
{"id":"n-5ef3e98e","guard":[["hasAny",["away","dont","fade","friends","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Friends Don't Fade Away":"The season title of Friends Don't Fade Away is Jungle Fury."}}},
{"id":"n-6377753b","guard":[["hasAny",["evil","seas","season","sowing","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Sowing the Seas of Evil":"The season title of Sowing the Seas of Evil is Mighty Morphin (Season 3)."}}},
{"id":"n-6680614b","guard":[["hasAny",["five","high","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for High Five":"The season title of High Five is Mighty Morphin (Season 1)."}}},
{"id":"n-67d0cce9","guard":[["hasAny",["season","silver","survival","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Survival of the Silver":"The season title of Survival of the Silver is In Space."}}},
{"id":"n-6a228602","guard":[["hasAny",["brief","mystery","season","time","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for A Brief Mystery of Time":"The season title of A Brief Mystery of Time is Zeo."}}},
{"id":"n-6a800017","guard":[["hasAny",["nexus","race","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Race to the Nexus":"The season title of Race to the Nexus is Jungle Fury."}}},
{"id":"n-6daf6acc","guard":[["hasAny",["season","title","underwater","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for The Underwater World":"The season title of The Underwater World is Operation Overdrive."}}},
{"id":"n-717f1269","guard":[["hasAny",["season","stand","title","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of United We Stand":"The season title of United We Stand is Megaforce."}}},
{"id":"n-728f7059","guard":[["hasAny",["episode","mantis","plague","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Plague of the Mantis":"The season title of Plague of the Mantis is Mighty Morphin (Season 1)."}}},
{"id":"n-78f387d9","guard":[["hasAny",["episode","jens","revenge","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Jen's Revenge":"The season title of Jen's Revenge is Time Force."}}},
{"id":"n-7f85f332","guard":[["hasAny",["bruisin","cruisin","episode","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Cruisin' for a Bruisin'":"The season title of Cruisin' for a Bruisin' is Beast Morphers (Season 2)."}}},
{"id":"n-810a58ef","guard":[["hasAny",["pink","pirate","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Pirate in Pink":"The season title of Pirate in Pink is Operation Overdrive."}}},
{"id":"n-811214db","guard":[["hasAny",["betrayed","season","title","tools"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Tools of the Betrayed":"The season title of Tools of the Betrayed is Beast Morphers (Season 1)."}}},
{"id":"n-8a1d9d94","guard":[["hasAny",["learn","live","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Live and Learn":"The season title of Live and Learn is Ninja Steel."}}},
{"id":"n-8dd36c0e","guard":[["hasAny",["season","title","treat","trick"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Trick or Treat":"The season title of Trick or Treat is Mighty Morphin (Season 1)."}}},
{"id":"n-8debe4be","guard":[["hasAny",["christmas","race","rescue","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Race to Rescue Christmas":"The season title of Race to Rescue Christmas is Dino Charge."}}},
{"id":"n-8ef2d169","guard":[["hasAny",["different","iii","part","pink","season","shade","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of A Different Shade of Pink: Part III":"The season title of A Different Shade of Pink: Part III is Mighty Morphin (Season 3)."}}},
{"id":"n-90171544","guard":[["hasAny",["demons","episode","rise","season","super","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Rise of the Super Demons":"The season title of Rise of the Super Demons is Lightspeed Rescue."}}},
{"id":"n-91e1f83f","guard":[["hasAny",["red","rookie","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Rookie in Red":"The season title of Rookie in Red is Lost Galaxy."}}},
{"id":"n-930d8b11","guard":[["hasAny",["episode","hunt","scavenger","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Scavenger Hunt":"The season title of Scavenger Hunt is Mighty Morphin (Season 2)."}}},
{"id":"n-948d5dc9","guard":[["hasAny",["friend","need","part","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for A Friend in Need: Part I":"The season title of A Friend in Need: Part I is Mighty Morphin (Season 3)."}}},
{"id":"n-99c5cd44","guard":[["hasAny",["origins","part","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Origins Part 2":"The season title of Origins Part 2 is Samurai."}}},
{"id":"n-9b0b2625","guard":[["hasAny",["day","gem","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for A Gem of a Day":"The season title of A Gem of a Day is Ninja Storm."}}},
{"id":"n-9f5d30e0","guard":[["hasAny",["bitsy","itsy","season","spider","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Itsy Bitsy Spider":"The season title of Itsy Bitsy Spider is Mighty Morphin (Season 1)."}}},
{"id":"n-9fb9e4b2","guard":[["hasAny",["episode","know","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Do I Know You?":"The season title of Do I Know You? is Zeo."}}},
{"id":"n-a0422f43","guard":[["hasAny",["another","dance","season","song","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Another Song and Dance":"The season title of Another Song and Dance is Zeo."}}},
{"id":"n-a10b1142","guard":[["hasAny",["catastros","episode","legendary","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Legendary Catastros":"The season title of Legendary Catastros is Mystic Force."}}},
{"id":"n-a967291a","guard":[["hasAny",["episode","gatekeeper","part","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title The Gatekeeper: Part 1":"The season title of The Gatekeeper: Part 1 is Mystic Force."}}},
{"id":"n-aadcba19","guard":[["hasAny",["glyph","hanger","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Glyph Hanger":"The season title of Glyph Hanger is Turbo."}}},
{"id":"n-ac75cc6f","guard":[["hasAny",["dolls","dome","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of The Dome Dolls":"The season title of The Dome Dolls is R.P.M.."}}},
{"id":"n-ad03f5a6","guard":[["hasAny",["city","episode","misson","season","secret","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Misson to Secret City":"The season title of Misson to Secret City is In Space."}}},
{"id":"n-b0f67622","guard":[["hasAny",["doom","season","signal","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Doom Signal":"The season title of Doom Signal is Super Ninja Steel."}}},
{"id":"n-b13f020e","guard":[["hasAny",["destined","episode","greatness","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Destined for Greatness":"The season title of Destined for Greatness is Lost Galaxy."}}},
{"id":"n-b298eaa8","guard":[["hasAny",["eye","guy","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of I, Eye Guy":"The season title of I, Eye Guy is Mighty Morphin (Season 1)."}}},
{"id":"n-b9ece0d8","guard":[["hasAny",["end","extinction","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of End of Extinction":"The season title of End of Extinction is Dino Super Charge."}}},
{"id":"n-bcbf2260","guard":[["hasAny",["chameliac","season","title","warrior"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for The Chameliac Warrior":"The season title of The Chameliac Warrior is Lost Galaxy."}}},
{"id":"n-bee01e48","guard":[["hasAny",["clash","control","part","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Clash for Control: Part 2":"The season title of Clash for Control: Part 2 is Time Force."}}},
{"id":"n-c28d3c4e","guard":[["hasAny",["bad","making","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Making Bad":"The season title of Making Bad is Beast Morphers (Season 2)."}}},
{"id":"n-c4872624","guard":[["hasAny",["evilyzer","great","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of The Great Evilyzer":"The season title of The Great Evilyzer is In Space."}}},
{"id":"n-c6225490","guard":[["hasAny",["fraxs","fury","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Frax's Fury":"The season title of Frax's Fury is Time Force."}}},
{"id":"n-cd85f242","guard":[["hasAny",["all","cant","season","title","win"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Can't Win Them All":"The season title of Can't Win Them All is Jungle Fury."}}},
{"id":"n-d14a0138","guard":[["hasAny",["galvanax","rises","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Galvanax Rises":"The season title of Galvanax Rises is Ninja Steel."}}},
{"id":"n-d2973b7b","guard":[["hasAny",["episode","hope","last","one","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title One Last Hope":"The season title of One Last Hope is Turbo."}}},
{"id":"n-d38b6481","guard":[["hasAny",["beast","beauty","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Beauty and the Beast":"The season title of Beauty and the Beast is Mighty Morphin (Season 2)."}}},
{"id":"n-d39ed804","guard":[["hasAny",["season","taming","title","zords"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Taming of the Zords":"The season title of Taming of the Zords is Wild Force."}}},
{"id":"n-d836fc42","guard":[["hasAny",["edge","episode","extinction","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Edge of Extinction":"The season title of Edge of Extinction is Dino Super Charge."}}},
{"id":"n-d8c9cbb2","guard":[["hasAny",["before","christmas","knight","robo","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of The Robo Knight Before Christmas":"The season title of The Robo Knight Before Christmas is Megaforce."}}},
{"id":"n-dc1c8ae2","guard":[["hasAny",["ii","part","season","struck","thunder","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Thunder Struck: Part II":"The season title of Thunder Struck: Part II is Dino Thunder."}}},
{"id":"n-e136eea3","guard":[["hasAny",["bed","episode","oily","rise","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Oily to Bed, Oily to Rise":"The season title of Oily to Bed, Oily to Rise is Zeo."}}},
{"id":"n-e73525ac","guard":[["hasAny",["episode","season","song","sung","title","yellow"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Song Sung Yellow":"The season title of Song Sung Yellow is Zeo."}}},
{"id":"n-ea121a14","guard":[["hasAny",["blind","leading","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of Blind Leading the Blind":"The season title of Blind Leading the Blind is Jungle Fury."}}},
{"id":"n-f19cc149","guard":[["hasAny",["action","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for And... Action":"The season title of And... Action is R.P.M.."}}},
{"id":"n-f25a0a27","guard":[["hasAny",["drivers","season","seat","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of In the Driver's Seat":"The season title of In the Driver's Seat is Super Megaforce."}}},
{"id":"n-f4580f7f","guard":[["hasAny",["armor","iii","master","metallic","part","season","title","vile"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for Master Vile and the Metallic Armor: Part III":"The season title of Master Vile and the Metallic Armor: Part III is Mighty Morphin (Season 3)."}}},
{"id":"n-f7ee93b6","guard":[["hasAny",["dizchord","episode","harmony","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Harmony and Dizchord":"The season title of Harmony and Dizchord is Megaforce."}}},
{"id":"n-f98f16af","guard":[["hasAny",["rescue","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the season title of The Rescue":"The season title of The Rescue is Super Samurai."}}},
{"id":"n-fbe09f14","guard":[["hasAny",["encounter","episode","ninja","part","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title The Ninja Encounter: Part I":"The season title of The Ninja Encounter: Part I is Mighty Morphin (Season 2)."}}},
{"id":"n-fcc0e3b9","guard":[["hasAny",["abridged","season","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the season title for A-Bridged":"The season title of A-Bridged is S.P.D.."}}},
{"id":"n-338089d0","guard":[["hasAny",["gatekeeper","normalise","normalize","simplify the text"]]],"pyramid":["render.str",["transform.norm",{"lit":"Mystic Force"},["sense.first"]]],"mem":null},
{"id":"n-4eca137c","guard":[["has","gatekeeper"]],"pyramid":["render.and",["iterate.repeat",{"lit":"Mystic Force"},["sense.first"]]],"mem":null},
{"id":"n-51073741","guard":[["hasAny",["delete","encounter","remove","strip out"]],["has","tell"]],"pyramid":["render.str",["transform.remove",{"lit":"Mighty Morphin (Season 2)"},["sense.roman"]]],"mem":null},
{"id":"n-6e727df1","guard":[["has","gatekeeper"]],"pyramid":["render.list",["iterate.repeat",{"lit":"Mystic Force"},["sense.first"]]],"mem":null},
{"id":"n-741db41c","guard":[["has","gatekeeper"]],"pyramid":["render.list",["iterate.repeat",{"lit":"Mystic Force"},["sense.howMany"]]],"mem":null},
{"id":"n-8e0ac184","guard":[["hasAny",["copies","gatekeeper","repeat","say it times"]]],"pyramid":["render.str",["transform.repeat",{"lit":"Mystic Force"},["sense.first"]]],"mem":null},
{"id":"n-a0c92914","guard":[["hasAny",["delete","know","remove","strip out"]],["has","season"]],"pyramid":["render.str",["transform.remove",{"lit":"Zeo"},["sense.roman"]]],"mem":null},
{"id":"n-c993a7c7","guard":[["has","gatekeeper"]],"pyramid":["render.lines",["iterate.repeat",{"lit":"Mystic Force"},["sense.first"]]],"mem":null},
{"id":"n-cf1fbe15","guard":[["hasAny",["abridged","action","all","amber","apart","arms","bad","beast","betrayed","bitsy","blind","brief","bruisin","catastros","chameliac","chance","charge","christmas","city","day","destined","destruction","dizchord","dolls","doom","drivers","emperor","encounter","evil","evilyzer","extinction","eye","five","forget","foul","fraxs","friend","friends","future","galvanax","glyph","gold","green","hunt","ii","iii","jens","know","last","learn","light","lights","maneuvers","mantis","monsters","no","pig","pink","prism","race","ranger","red","rescue","rise","sigh","silva","silver","song","soul","stand","taming","thunder","trick","trust","underwater","venjix"]],["has","season"],["not",["has","number"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of The Rescue":"The season title of The Rescue is Super Samurai.","what is the season title of Forgive and Forget":"The season title of Forgive and Forget is Dino Super Charge.","give the season title for An Evil Game":"The season title of An Evil Game is Lost Galaxy.","give the season title for Echoes of Evil":"The season title of Echoes of Evil is Super Ninja Steel.","give the season title for Frax's Fury":"The season title of Frax's Fury is Time Force.","what is the season title of Sowing the Seas of Evil":"The season title of Sowing the Seas of Evil is Mighty Morphin (Season 3).","what is the season title of Glyph Hanger":"The season title of Glyph Hanger is Turbo.","tell me the season title of the episode title Cruisin' for a Bruisin'":"The season title of Cruisin' for a Bruisin' is Beast Morphers (Season 2).","give the season title for Gold Rush":"The season title of Gold Rush is Ninja Steel.","give the season title for A Gem of a Day":"The season title of A Gem of a Day is Ninja Storm.","give the season title for The Ranger Ribbon":"The season title of The Ranger Ribbon is Ninja Steel.","give the season title for Party Monsters":"The season title of Party Monsters is Samurai.","tell me the season title of the episode title Sigh of the Tiger":"The season title of Sigh of the Tiger is Jungle Fury.","what is the season title of True Friends, True Spirits":"The season title of True Friends, True Spirits is Jungle Fury.","tell me the season title of the episode title Song Sung Yellow":"The season title of Song Sung Yellow is Zeo.","what is the season title of Tools of the Betrayed":"The season title of Tools of the Betrayed is Beast Morphers (Season 1).","give the season title for Foul Play in the Sky":"The season title of Foul Play in the Sky is Mighty Morphin (Season 1).","give the season title for Recipe for Disaster":"The season title of Recipe for Disaster is Dino Super Charge.","tell me the season title of the episode title One Last Hope":"The season title of One Last Hope is Turbo.","what is the season title of Thunder Struck: Part II":"The season title of Thunder Struck: Part II is Dino Thunder.","tell me the season title of the episode title Edge of Extinction":"The season title of Edge of Extinction is Dino Super Charge.","what is the season title of United We Stand":"The season title of United We Stand is Megaforce.","tell me the season title of the episode title Return of the Prism":"The season title of Return of the Prism is Ninja Steel.","give the season title for A-Bridged":"The season title of A-Bridged is S.P.D..","tell me the season title of the episode title The Ninja Encounter: Part I":"The season title of The Ninja Encounter: Part I is Mighty Morphin (Season 2).","what is the season title of Past, Presents, and Future":"The season title of Past, Presents, and Future is Ninja Steel.","what is the season title of Blind Leading the Blind":"The season title of Blind Leading the Blind is Jungle Fury.","what is the season title of Orchestral Maneuvers in the Park":"The season title of Orchestral Maneuvers in the Park is Mighty Morphin (Season 2).","give the season title for And... Action":"The season title of And... Action is R.P.M..","what is the season title of A Chimp in Charge":"The season title of A Chimp in Charge is Mighty Morphin (Season 3).","what is the season title of Doom Signal":"The season title of Doom Signal is Super Ninja Steel.","tell me the season title of the episode title The Last Ranger":"The season title of The Last Ranger is Lightspeed Rescue.","what is the season title of The Green Candle: Part I":"The season title of The Green Candle: Part I is Mighty Morphin (Season 1).","tell me the season title of the episode title A Pig Surprise":"The season title of A Pig Surprise is Mighty Morphin (Season 1).","tell me the season title of the episode title If Venjix Won":"The season title of If Venjix Won is R.P.M..","tell me the season title of the episode title Destined for Greatness":"The season title of Destined for Greatness is Lost Galaxy.","tell me the season title of the episode title Green with Evil: Part V":"The season title of Green with Evil: Part V is Mighty Morphin (Season 1).","what is the season title of Nightmare in Amber Beach":"The season title of Nightmare in Amber Beach is Dino Super Charge.","give the season title for Taming of the Zords":"The season title of Taming of the Zords is Wild Force.","what is the season title of Rookie in Red":"The season title of Rookie in Red is Lost Galaxy.","what is the season title of Beauty and the Beast":"The season title of Beauty and the Beast is Mighty Morphin (Season 2).","tell me the season title of the episode title Do I Know You?":"The season title of Do I Know You? is Zeo.","give the season title for Master Vile and the Metallic Armor: Part III":"The season title of Master Vile and the Metallic Armor: Part III is Mighty Morphin (Season 3).","tell me the season title of the episode title Wheels of Destruction":"The season title of Wheels of Destruction is Lightspeed Rescue.","what is the season title of The Great Evilyzer":"The season title of The Great Evilyzer is In Space.","tell me the season title of the episode title Jen's Revenge":"The season title of Jen's Revenge is Time Force.","what is the season title of Making Bad":"The season title of Making Bad is Beast Morphers (Season 2).","tell me the season title of the episode title Scavenger Hunt":"The season title of Scavenger Hunt is Mighty Morphin (Season 2).","tell me the season title of the episode title Rise of the Super Demons":"The season title of Rise of the Super Demons is Lightspeed Rescue.","what is the season title of Trust Me":"The season title of Trust Me is Super Samurai.","give the season title for High Five":"The season title of High Five is Mighty Morphin (Season 1).","give the season title for The Song of Confusion":"The season title of The Song of Confusion is Turbo.","give the season title for Galvanax Rises":"The season title of Galvanax Rises is Ninja Steel.","give the season title for The Underwater World":"The season title of The Underwater World is Operation Overdrive.","give the season title for Can't Win Them All":"The season title of Can't Win Them All is Jungle Fury.","give the season title for Ranger Green":"The season title of Ranger Green is R.P.M..","tell me the season title of the episode title Oily to Bed, Oily to Rise":"The season title of Oily to Bed, Oily to Rise is Zeo.","tell me the season title of the episode title The Silva Switch":"The season title of The Silva Switch is Beast Morphers (Season 2).","what is the season title of In the Driver's Seat":"The season title of In the Driver's Seat is Super Megaforce.","what is the season title of Soul Specter":"The season title of Soul Specter is Mystic Force.","tell me the season title of the episode title Misson to Secret City":"The season title of Misson to Secret City is In Space.","what is the season title of The Lights of Orion":"The season title of The Lights of Orion is Lost Galaxy.","what is the season title of Thunder Strangers: Part I":"The season title of Thunder Strangers: Part I is Ninja Storm.","tell me the season title of the episode title Ghost of a Chance":"The season title of Ghost of a Chance is Jungle Fury.","what is the season title of End of Extinction":"The season title of End of Extinction is Dino Super Charge.","tell me the season title of the episode title General Deception: Part II":"The season title of General Deception: Part II is Ninja Storm.","what is the season title of Friends Don't Fade Away":"The season title of Friends Don't Fade Away is Jungle Fury.","tell me the season title of the episode title There's No 'I' in Team":"The season title of There's No 'I' in Team is Ninja Storm.","give the season title for Live and Learn":"The season title of Live and Learn is Ninja Steel.","tell me the season title of the episode title Legendary Catastros":"The season title of Legendary Catastros is Mystic Force.","what is the season title of A Different Shade of Pink: Part III":"The season title of A Different Shade of Pink: Part III is Mighty Morphin (Season 3).","give the season title for A Friend in Need: Part I":"The season title of A Friend in Need: Part I is Mighty Morphin (Season 3).","give the season title for Itsy Bitsy Spider":"The season title of Itsy Bitsy Spider is Mighty Morphin (Season 1).","what is the season title of I, Eye Guy":"The season title of I, Eye Guy is Mighty Morphin (Season 1).","what is the season title of The Dome Dolls":"The season title of The Dome Dolls is R.P.M..","give the season title for Survival of the Silver":"The season title of Survival of the Silver is In Space.","what is the season title of Trick or Trial":"The season title of Trick or Trial is Dino Super Charge.","give the season title for The Light":"The season title of The Light is Mystic Force.","tell me the season title of the episode title Harmony and Dizchord":"The season title of Harmony and Dizchord is Megaforce.","tell me the season title of the episode title Emperor Mavro":"The season title of Emperor Mavro is Super Megaforce.","give the season title for Worlds Apart":"The season title of Worlds Apart is Time Force.","tell me the season title of the episode title Brothers in Arms":"The season title of Brothers in Arms is Ninja Storm.","what is the season title of The Robo Knight Before Christmas":"The season title of The Robo Knight Before Christmas is Megaforce.","give the season title for Trick or Treat":"The season title of Trick or Treat is Mighty Morphin (Season 1).","give the season title for Another Song and Dance":"The season title of Another Song and Dance is Zeo.","give the season title for The Chameliac Warrior":"The season title of The Chameliac Warrior is Lost Galaxy.","give the season title for Race to Rescue Christmas":"The season title of Race to Rescue Christmas is Dino Charge.","give the season title for Race to the Nexus":"The season title of Race to the Nexus is Jungle Fury.","give the season title for Pirate in Pink":"The season title of Pirate in Pink is Operation Overdrive.","give the season title for A Brief Mystery of Time":"The season title of A Brief Mystery of Time is Zeo.","tell me the season title of the episode title Plague of the Mantis":"The season title of Plague of the Mantis is Mighty Morphin (Season 1)."}}},
{"id":"n-02967e1e","guard":[["hasAny",["maneuvers","orchestral","park","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Orchestral Maneuvers in the Park":"The season title of Orchestral Maneuvers in the Park is Mighty Morphin (Season 2)."}}},
{"id":"n-069d1ec2","guard":[["hasAny",["silva","switch"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title The Silva Switch":"The season title of The Silva Switch is Beast Morphers (Season 2)."}}},
{"id":"n-06ce37e5","guard":[["has","nexus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Race to the Nexus":"The season title of Race to the Nexus is Jungle Fury."}}},
{"id":"n-06f3c684","guard":[["hasAny",["pink","pirate","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Pirate in Pink":"The season title of Pirate in Pink is Operation Overdrive."}}},
{"id":"n-07adf5bf","guard":[["hasAny",["hope","one"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title One Last Hope":"The season title of One Last Hope is Turbo."}}},
{"id":"n-0eb75b36","guard":[["has","light"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for The Light":"The season title of The Light is Mystic Force."}}},
{"id":"n-0f005f9e","guard":[["has","christmas"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Race to Rescue Christmas":"The season title of Race to Rescue Christmas is Dino Charge."}}},
{"id":"n-10c98c5d","guard":[["hasAny",["deception","episode","general","ii","part","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title General Deception: Part II":"The season title of General Deception: Part II is Ninja Storm."}}},
{"id":"n-12a96e79","guard":[["hasAny",["destruction","wheels"]],["has","season"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Wheels of Destruction":"The season title of Wheels of Destruction is Lightspeed Rescue."}}},
{"id":"n-144454b1","guard":[["hasAny",["chameliac","season","title","warrior"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for The Chameliac Warrior":"The season title of The Chameliac Warrior is Lost Galaxy."}}},
{"id":"n-15ca9804","guard":[["hasAny",["season","stand","title","united"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of United We Stand":"The season title of United We Stand is Megaforce."}}},
{"id":"n-165ad4b6","guard":[["hasAny",["disaster","recipe","season","title"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Recipe for Disaster":"The season title of Recipe for Disaster is Dino Super Charge."}}},
{"id":"n-194a9675","guard":[["hasAny",["armor","iii","master","metallic","part","season","title","vile"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Master Vile and the Metallic Armor: Part III":"The season title of Master Vile and the Metallic Armor: Part III is Mighty Morphin (Season 3)."}}},
{"id":"n-1af01f64","guard":[["hasAny",["catastros","legendary"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Legendary Catastros":"The season title of Legendary Catastros is Mystic Force."}}},
{"id":"n-1da66548","guard":[["hasAny",["day","gem","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for A Gem of a Day":"The season title of A Gem of a Day is Ninja Storm."}}},
{"id":"n-1defc08a","guard":[["hasAny",["five","high","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for High Five":"The season title of High Five is Mighty Morphin (Season 1)."}}},
{"id":"n-1eb989e4","guard":[["hasAny",["chance","ghost"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Ghost of a Chance":"The season title of Ghost of a Chance is Jungle Fury."}}},
{"id":"n-20bcfb8f","guard":[["hasAny",["jens","revenge"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Jen's Revenge":"The season title of Jen's Revenge is Time Force."}}},
{"id":"n-21137d8b","guard":[["hasAny",["forget","forgive","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Forgive and Forget":"The season title of Forgive and Forget is Dino Super Charge."}}},
{"id":"n-21fcf71c","guard":[["hasAny",["charge","chimp","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of A Chimp in Charge":"The season title of A Chimp in Charge is Mighty Morphin (Season 3)."}}},
{"id":"n-276e7362","guard":[["hasAny",["brief","mystery","season","time","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for A Brief Mystery of Time":"The season title of A Brief Mystery of Time is Zeo."}}},
{"id":"n-2846e322","guard":[["has","abridged"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for A-Bridged":"The season title of A-Bridged is S.P.D.."}}},
{"id":"n-2ac969e8","guard":[["hasAny",["future","past","presents","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Past, Presents, and Future":"The season title of Past, Presents, and Future is Ninja Steel."}}},
{"id":"n-2b169cf4","guard":[["hasAny",["encounter","ninja"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title The Ninja Encounter: Part I":"The season title of The Ninja Encounter: Part I is Mighty Morphin (Season 2)."}}},
{"id":"n-2cd50339","guard":[["has","candle"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of The Green Candle: Part I":"The season title of The Green Candle: Part I is Mighty Morphin (Season 1)."}}},
{"id":"n-2e4dfbcb","guard":[["hasAny",["bed","oily"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Oily to Bed, Oily to Rise":"The season title of Oily to Bed, Oily to Rise is Zeo."}}},
{"id":"n-3046afc2","guard":[["hasAny",["seas","sowing"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Sowing the Seas of Evil":"The season title of Sowing the Seas of Evil is Mighty Morphin (Season 3)."}}},
{"id":"n-326de925","guard":[["hasAny",["fraxs","fury","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Frax's Fury":"The season title of Frax's Fury is Time Force."}}},
{"id":"n-39984d21","guard":[["hasAny",["eye","guy","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of I, Eye Guy":"The season title of I, Eye Guy is Mighty Morphin (Season 1)."}}},
{"id":"n-3a290c90","guard":[["hasAny",["gold","rush","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Gold Rush":"The season title of Gold Rush is Ninja Steel."}}},
{"id":"n-3cd9f949","guard":[["hasAny",["episode","no","season","team","theres","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title There's No 'I' in Team":"The season title of There's No 'I' in Team is Ninja Storm."}}},
{"id":"n-4256291d","guard":[["hasAny",["demons","super"]],["has","season"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Rise of the Super Demons":"The season title of Rise of the Super Demons is Lightspeed Rescue."}}},
{"id":"n-44973b0b","guard":[["hasAny",["bruisin","cruisin"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Cruisin' for a Bruisin'":"The season title of Cruisin' for a Bruisin' is Beast Morphers (Season 2)."}}},
{"id":"n-4a43b3b8","guard":[["hasAny",["pig","surprise"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title A Pig Surprise":"The season title of A Pig Surprise is Mighty Morphin (Season 1)."}}},
{"id":"n-4df7da70","guard":[["hasAny",["red","rookie","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Rookie in Red":"The season title of Rookie in Red is Lost Galaxy."}}},
{"id":"n-50ad65d1","guard":[["hasAny",["friend","need","part","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for A Friend in Need: Part I":"The season title of A Friend in Need: Part I is Mighty Morphin (Season 3)."}}},
{"id":"n-546c72ec","guard":[["has","confusion"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for The Song of Confusion":"The season title of The Song of Confusion is Turbo."}}},
{"id":"n-5771a29d","guard":[["hasAny",["episode","season","song","sung","title","yellow"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Song Sung Yellow":"The season title of Song Sung Yellow is Zeo."}}},
{"id":"n-5b6c6887","guard":[["hasAny",["blind","leading","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Blind Leading the Blind":"The season title of Blind Leading the Blind is Jungle Fury."}}},
{"id":"n-5c5cfcfd","guard":[["hasAny",["dizchord","harmony"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Harmony and Dizchord":"The season title of Harmony and Dizchord is Megaforce."}}},
{"id":"n-6330e3d5","guard":[["hasAny",["glyph","hanger","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Glyph Hanger":"The season title of Glyph Hanger is Turbo."}}},
{"id":"n-690391b7","guard":[["hasAny",["another","dance"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Another Song and Dance":"The season title of Another Song and Dance is Zeo."}}},
{"id":"n-692021b6","guard":[["hasAny",["episode","evil","v"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Green with Evil: Part V":"The season title of Green with Evil: Part V is Mighty Morphin (Season 1)."}}},
{"id":"n-6db784a0","guard":[["hasAny",["friends","season","spirits","title","true"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of True Friends, True Spirits":"The season title of True Friends, True Spirits is Jungle Fury."}}},
{"id":"n-6fd6c399","guard":[["hasAny",["doom","season","signal","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Doom Signal":"The season title of Doom Signal is Super Ninja Steel."}}},
{"id":"n-722d3582","guard":[["hasAny",["monsters","party","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Party Monsters":"The season title of Party Monsters is Samurai."}}},
{"id":"n-738922f6","guard":[["hasAny",["betrayed","season","title","tools"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Tools of the Betrayed":"The season title of Tools of the Betrayed is Beast Morphers (Season 1)."}}},
{"id":"n-74d9672c","guard":[["hasAny",["hunt","scavenger"]],["has","season"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Scavenger Hunt":"The season title of Scavenger Hunt is Mighty Morphin (Season 2)."}}},
{"id":"n-7706d794","guard":[["hasAny",["venjix","won"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title If Venjix Won":"The season title of If Venjix Won is R.P.M.."}}},
{"id":"n-77d5a70c","guard":[["has","treat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Trick or Treat":"The season title of Trick or Treat is Mighty Morphin (Season 1)."}}},
{"id":"n-868aa467","guard":[["hasAny",["galvanax","rises","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Galvanax Rises":"The season title of Galvanax Rises is Ninja Steel."}}},
{"id":"n-8a8eca7e","guard":[["hasAny",["different","iii","part","pink","season","shade","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of A Different Shade of Pink: Part III":"The season title of A Different Shade of Pink: Part III is Mighty Morphin (Season 3)."}}},
{"id":"n-8ace0519","guard":[["has","trust"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Trust Me":"The season title of Trust Me is Super Samurai."}}},
{"id":"n-8c976990","guard":[["hasAny",["season","soul","specter","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Soul Specter":"The season title of Soul Specter is Mystic Force."}}},
{"id":"n-8e19e4da","guard":[["has","action"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for And... Action":"The season title of And... Action is R.P.M.."}}},
{"id":"n-9133a263","guard":[["has","trial"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Trick or Trial":"The season title of Trick or Trial is Dino Super Charge."}}},
{"id":"n-9180bd72","guard":[["hasAny",["emperor","mavro"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Emperor Mavro":"The season title of Emperor Mavro is Super Megaforce."}}},
{"id":"n-956aa618","guard":[["hasAny",["sigh","tiger"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Sigh of the Tiger":"The season title of Sigh of the Tiger is Jungle Fury."}}},
{"id":"n-97775222","guard":[["hasAny",["all","cant","season","title","win"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Can't Win Them All":"The season title of Can't Win Them All is Jungle Fury."}}},
{"id":"n-9fee2126","guard":[["has","strangers"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Thunder Strangers: Part I":"The season title of Thunder Strangers: Part I is Ninja Storm."}}},
{"id":"n-a0877d7e","guard":[["hasAny",["before","christmas","knight","robo","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of The Robo Knight Before Christmas":"The season title of The Robo Knight Before Christmas is Megaforce."}}},
{"id":"n-a2640af3","guard":[["hasAny",["evilyzer","great","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of The Great Evilyzer":"The season title of The Great Evilyzer is In Space."}}},
{"id":"n-a3a6bcf3","guard":[["hasAny",["beast","beauty","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Beauty and the Beast":"The season title of Beauty and the Beast is Mighty Morphin (Season 2)."}}},
{"id":"n-a75272cf","guard":[["hasAny",["amber","beach","nightmare","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Nightmare in Amber Beach":"The season title of Nightmare in Amber Beach is Dino Super Charge."}}},
{"id":"n-a7a756b8","guard":[["hasAny",["bitsy","itsy","season","spider","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Itsy Bitsy Spider":"The season title of Itsy Bitsy Spider is Mighty Morphin (Season 1)."}}},
{"id":"n-b46df7e2","guard":[["hasAny",["season","title","underwater","world"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for The Underwater World":"The season title of The Underwater World is Operation Overdrive."}}},
{"id":"n-bb982d7f","guard":[["hasAny",["ii","struck"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Thunder Struck: Part II":"The season title of Thunder Struck: Part II is Dino Thunder."}}},
{"id":"n-bc02aae2","guard":[["has","know"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Do I Know You?":"The season title of Do I Know You? is Zeo."}}},
{"id":"n-bcc88763","guard":[["hasAny",["prism","return"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Return of the Prism":"The season title of Return of the Prism is Ninja Steel."}}},
{"id":"n-bd77316a","guard":[["hasAny",["drivers","season","seat","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of In the Driver's Seat":"The season title of In the Driver's Seat is Super Megaforce."}}},
{"id":"n-c0447505","guard":[["hasAny",["away","dont","fade","friends","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Friends Don't Fade Away":"The season title of Friends Don't Fade Away is Jungle Fury."}}},
{"id":"n-c770ba8e","guard":[["has","ribbon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for The Ranger Ribbon":"The season title of The Ranger Ribbon is Ninja Steel."}}},
{"id":"n-cbab22c6","guard":[["hasAny",["mantis","plague"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Plague of the Mantis":"The season title of Plague of the Mantis is Mighty Morphin (Season 1)."}}},
{"id":"n-cbee54cd","guard":[["hasAny",["apart","season","title","worlds"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Worlds Apart":"The season title of Worlds Apart is Time Force."}}},
{"id":"n-d4003c1c","guard":[["has","echoes"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Echoes of Evil":"The season title of Echoes of Evil is Super Ninja Steel."}}},
{"id":"n-d852218e","guard":[["hasAny",["dolls","dome","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of The Dome Dolls":"The season title of The Dome Dolls is R.P.M.."}}},
{"id":"n-d9e30906","guard":[["hasAny",["foul","play","season","sky","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Foul Play in the Sky":"The season title of Foul Play in the Sky is Mighty Morphin (Season 1)."}}},
{"id":"n-de6a4532","guard":[["hasAny",["arms","brothers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Brothers in Arms":"The season title of Brothers in Arms is Ninja Storm."}}},
{"id":"n-e2a4deba","guard":[["hasAny",["destined","greatness"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Destined for Greatness":"The season title of Destined for Greatness is Lost Galaxy."}}},
{"id":"n-e511e677","guard":[["hasAny",["bad","making","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of Making Bad":"The season title of Making Bad is Beast Morphers (Season 2)."}}},
{"id":"n-ea87fa06","guard":[["hasAny",["season","silver","survival","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Survival of the Silver":"The season title of Survival of the Silver is In Space."}}},
{"id":"n-eace2268","guard":[["hasAny",["season","taming","title","zords"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Taming of the Zords":"The season title of Taming of the Zords is Wild Force."}}},
{"id":"n-ec17d075","guard":[["hasAny",["lights","orion","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of The Lights of Orion":"The season title of The Lights of Orion is Lost Galaxy."}}},
{"id":"n-ef0e2181","guard":[["hasAny",["city","episode","misson","season","secret","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Misson to Secret City":"The season title of Misson to Secret City is In Space."}}},
{"id":"n-f2401f27","guard":[["has","edge"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the season title of the episode title Edge of Extinction":"The season title of Edge of Extinction is Dino Super Charge."}}},
{"id":"n-f2a713f1","guard":[["has","game"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for An Evil Game":"The season title of An Evil Game is Lost Galaxy."}}},
{"id":"n-f4515c4b","guard":[["has","end"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the season title of End of Extinction":"The season title of End of Extinction is Dino Super Charge."}}},
{"id":"n-f6fa5142","guard":[["hasAny",["learn","live","season","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the season title for Live and Learn":"The season title of Live and Learn is Ninja Steel."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the season title of The Rescue","expect":{"contains":["Super Samurai"],"notRefusal":true}},{"q":"what is the season title of Forgive and Forget","expect":{"contains":["Dino Super Charge"],"notRefusal":true}},{"q":"give the season title for An Evil Game","expect":{"contains":["Lost Galaxy"],"notRefusal":true}},{"q":"what is the season title of Origins Part 2","expect":{"contains":["Samurai"],"notRefusal":true}},{"q":"give the season title for Echoes of Evil","expect":{"contains":["Super Ninja Steel"],"notRefusal":true}},{"q":"give the season title for Frax's Fury","expect":{"contains":["Time Force"],"notRefusal":true}},{"q":"what is the season title of Sowing the Seas of Evil","expect":{"contains":["Mighty Morphin (Season 3)"],"notRefusal":true}},{"q":"what is the season title of Glyph Hanger","expect":{"contains":["Turbo"],"notRefusal":true}},{"q":"tell me the season title of the episode title Cruisin' for a Bruisin'","expect":{"contains":["Beast Morphers (Season 2)"],"notRefusal":true}},{"q":"give the season title for Gold Rush","expect":{"contains":["Ninja Steel"],"notRefusal":true}},{"q":"give the season title for A Gem of a Day","expect":{"contains":["Ninja Storm"],"notRefusal":true}},{"q":"give the season title for The Ranger Ribbon","expect":{"contains":["Ninja Steel"],"notRefusal":true}},{"q":"give the season title for Party Monsters","expect":{"contains":["Samurai"],"notRefusal":true}},{"q":"tell me the season title of the episode title Sigh of the Tiger","expect":{"contains":["Jungle Fury"],"notRefusal":true}},{"q":"what is the season title of True Friends, True Spirits","expect":{"contains":["Jungle Fury"],"notRefusal":true}},{"q":"tell me the season title of the episode title Song Sung Yellow","expect":{"contains":["Zeo"],"notRefusal":true}},{"q":"what is the season title of Tools of the Betrayed","expect":{"contains":["Beast Morphers (Season 1)"],"notRefusal":true}},{"q":"give the season title for Foul Play in the Sky","expect":{"contains":["Mighty Morphin (Season 1)"],"notRefusal":true}},{"q":"give the season title for Recipe for Disaster","expect":{"contains":["Dino Super Charge"],"notRefusal":true}},{"q":"tell me the season title of the episode title One Last Hope","expect":{"contains":["Turbo"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
