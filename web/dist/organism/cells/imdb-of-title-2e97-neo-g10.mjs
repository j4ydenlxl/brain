// imdb-of-title-2e97-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"imdb-of-title-2e97-neo-g10","class":"imdb-of-title-2e97","generation":10,"lane":"neo","grownFrom":["give the imdb for Lara Croft: Tomb Raider","give the imdb for Whatever Works","give the imdb for Valkyrie","what is the imdb of Remember Me","what is the imdb of The Texas Chain Saw Massacre","give the imdb for What to Expect When You&#39;re Expecting","what is the imdb of The Cell","what is the imdb of The Informant!","tell me the imdb of the title Osmosis Jones","tell me the imdb of the title Disturbing Behavior","tell me the imdb of the title Lost in Space","tell me the imdb of the title Insidious","tell me the imdb of the title Night at the Museum","give the imdb for Troop Beverly Hills","give the imdb for Doubt","what is the imdb of The Prince of Egypt","what is the imdb of American History X","tell me the imdb of the title Twister","give the imdb for The Fourth Kind","tell me the imdb of the title Fargo"],"version":1});

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
knowLoad([{"id":"fr-data-movies-f156c5","columns":["title","imdb","test"],"n":1794,"cols":[{"f":"021 &amp; Over|0Dredd 3D|012 Years a Slave|042|0Admission|0Beautiful Creatures|0Carrie|1loudy with a Chance of Meatballs 2|0Don Jon|0Evil Dead|0Frozen|0Grown Ups 2|0Peeples|0Runner Runner|0The Host|0Hannibal|0Safe|1parkle|0The Avengers|1otal Recall|0Conan the Barbarian|0Priest|0Straw Dogs|0The Girl with the Dragon Tattoo|4Illusionist|4Karate Kid|0Friday the 13th|0The Final Destination|0Day of the Dead|0Halloween|0Black Christmas|0Assault on Precinct 13|0Pride and Prejudice|0The Amityville Horror|4Fog|0Dawn of the Dead|1une|021 grams|0A Dangerous Method|2Home at the End of The World|1daptation|1irplane!|1nywhere But Here|1stro Boy|1ugust|0BloodRayne|0Capote|1lash of the Titans|2erks II|1onan the Destroyer|2pycat|2rpse Bride|1rocodile Dundee|0E.T.: The Extra-Terrestrial|0Fantastic Four: Rise of the Silver Surfer|2tal Attraction|1lash Gordon|1riday the 13th Part III|3ght Night|2om Hell|0Godzilla|0Halloween|1oward The Duck|1ugo|2stle &amp; Flow|0Johnny English Reborn|1ust Go with It|0Kill List|0Le Havre|2gend|0Malcolm X|2rs Needs Moms|1icmacs (Micmacs &agrave; tire-larigot)|2rror Mirror|0No Country for Old Men|2where Boy|0Osmosis Jones|0Paranormal Activity|3is je t&#39;aime|1olice Academy|0Ray|1obin Hood: Prince of Thieves|2meo + Juliet|0Sherrybaby|1kyline|1omething&#39;s Gotta Give|1pecies|1triptease|1uper Mario Bros.|5man II|1ynecdoche, New York|0Terminator 2: Judgement Day|1he Brothers Bloom|4Conspirator|4Faculty|5ountain|4Gift|6rlfriend Experience|5reat Gatsby|4Lake House|6st Emperor|5ost World: Jurassic Park|4New World|5otebook|4Painted Veil|6triot|5eacemaker|5urge|4Rules of Attraction|4School of Rock|4Talented Mr. Ripley|5ime Traveler&#39;s Wife|4Visitor|0Underworld|2stoppable|0Virus|0Welcome Home, Roscoe Jenkins|0127 Hours|0A Perfect Getaway|1VP: Alien vs. Predator|1braham Lincoln: Vampire Hunter|1mour|0Beasts of the Southern Wild|1oogie Nights|0Die Hard 2|1ogma|2nnie Darko|1rive|1une|0Evil Dead II|0Festen (The Celebration)|1light|0Inception|2glourious Basterds|2side Man|1ron Man 3|0Letters to Juliet|1ost In Translation|0Monkeybone|3sters vs Aliens|1uch Ado About Nothing|2lan|0Percy Jackson &amp; the Olympians: The Lightning Thief|0Return to Me|1obin Hood|0Saw II|1kyfall|1mokin&#39; Aces|1omewhere|2uth Park: Bigger Longer &amp; Uncut|1paceballs|1tar Trek: The Wrath of Khan|5Wars: Episode II - Attack of the Clones|4gate: The Ark of Truth|0Teeth|1he 13th Warrior|4Adjustment Bureau|4Cabin in the Woods|5urious Case of Benjamin Button|4Dark Knight|4Girl with the Dragon Tattoo|4Queen|4Rite|5ocky Horror Picture Show|4Sixth Sense|5trangers|4Twilight Saga: Breaking Dawn - Part 2|2or: The Dark World|1oy Story 3|1urbo|0Wall Street: Money Never Sleeps|1hatever Works|1orld War Z|0X-Men Origins: Wolverine|025th Hour|030 Days of Night|047 Ronin|0A Knight&#39;s Tale|2Serious Man|1ce Ventura: Pet Detective|1dam|1merican Graffiti|9Pie|1nimal House|2na and the King|2titrust|1ustin Powers: International Man of Mystery|4ralia|0Bill &amp; Ted&#39;s Excellent Adventure|1ody Double|2ogeyman|0Cars 2|1harlie Bartlett|1inderella Man|1onspiracy Theory|2riolanus|0Death to Smoochy|1olphin Tale|1ragonHeart|1ude, Where&#39;s My Car|2mb &amp; Dumber|0Ender&#39;s Game|1scape Plan|1ternal Sunshine of the Spotless Mind|1verybody&#39;s Fine|0Fast Times at Ridgemont High|1ido|2nal Destination 5|2reproof|1lubber|1or Love of the Game|0Get Real|1unless|0Hall Pass|1igh Fidelity|2tch|1ook|2p|0Igby Goes Down|2or|1mmortals|1nsidious: Chapter 2|0Jagten|0Kiss the Girls|0Lady in the Water|1icence to Kill|1ogan&#39;s Run|2rd of War|0Made of Honor|1eek&#39;s Cutoff|3t the Parents|1idnight Run|2racle at St. Anna|1onty Python and the Holy Grail|1r Deeds|2. &amp; Mrs. Smith|1usic and Lyrics|3t love Dogs|1y Beautiful Laundrette|4loody Valentine 3D|0Naked Gun 33 1/3: The Final Insult|0Once|2e Flew Over the Cuckoo&#39;s Nest|1ut of Sight|0Paa|1i|2neapple Express|1okemon: The Movie 2000|2rky&#39;s|2seidon|1redator 2|0Red Tails|2po Man|0Sexy Beast|1hattered Glass|2opgirl|1inbad: Legend of the Seven Seas|3ister|1omewhere in Time|1upporting Characters|0Team America: World Police|1he Adventures of Pluto Nash|5nt Bully|4Blind Side|5ourne Supremacy|4Cell|5rying Game|4Family|5ighter|5ugitive|4Ghost Writer|4Hangover part 3|4Impossible|5nvention of Lying|4Jacket|4Last Temptation of Christ|5ife Aquatic with Steve Zissou|4Proposition|4Quiet American|4Signal|5quid and the Whale|5witch|4Three Musketeers|4Ugly Truth|4Watch|6y of the Gun|1op Gun|1rainspotting|2istram Shandy: A Cock and Bull Story|1wins|0Valentine|1elvet Goldmine|1ideodrome|0White House Down|1ild Wild West|2ng Commander|0Young Frankenstein|050 First Dates|2/50|0A nightmare on Elm Street|1dventureland|1jami|1merican History X|1nchorman: The Legend of Ron Burgundy|2na Karenina|1rmy of Darkness|1vatar|0Batman &amp; Robin|1lue Valentine|1raveheart|0Casino|1hloe|1oyote Ugly|0Dead Snow|1ie Another Day|0Frida|5y the 13th|0Ghost|1oodfellas|1ran Torino|2oundhog Day|0Her|1oles|2me Alone|2w to Lose a Guy in 10 Days|0I Love You, Man|1dentity Thief|1ron Man|0Kate &amp; Leopold|1night and Day|0Love and Other Drugs|0Madagascar 3: Europe&#39;s Most Wanted|1ichael Clayton|1y Best Friend&#39;s Wedding|0Nine|0Oblivion|0Pearl Harbor|1irates of the Caribbean: Dead Man&#39;s Chest|qThe Curse of the Black Pearl|0Red|0Saw|1ex, Lies, and Videotape|1he&#39;s the Man|1tar Trek VI: The Undiscovered Country|0Tarzan|1ed|2rminator Salvation|1he 40 Year Old Virgin|4Amazing Spider-Man|4Butterfly Effect|4Chronicles of Riddick|5roods|4Phantom of the Opera|5rincess Bride|6oposal|4Shining|4Terminator|4World&#39;s End|1o Rome With Love|0Up in the Air|0Warm Bodies|2tchmen|1e Bought a Zoo|1ild Things|3ly Wonka &amp; the Chocolate Factory|01776|02 Fast 2 Furious|2Guns|030 Minutes or Less|054|08 Mile|18 Minutes|1MM|0A Beautiful Mind|3ridge Too Far|2Few Good Men|2Good Day to Die Hard|2Scanner Darkly|3ingle Man|2Very Harold &amp; Kumar 3D Christmas|1bout Schmidt|1ction Jackson|1fter Earth|1gora|1ir Bud|4Force One|1kira|1merican Outlaws|1nalyze This|2imal Kingdom|2twone Fisher|1ppaloosa|1rmageddon|2ound the World in 80 Days|2thur Christmas|3ificial Intelligence: AI|1ssassins|4ult on Precinct 13|1ustin Powers in Goldmember|0Back to the Future Part III|2rry Lyndon|2tman|6 Begins|7Forever|1e Kind Rewind|2astly|2ginners|2verly Hills Cop II|1ill &amp; Ted&#39;s Bogus Journey|2utiful|1lackthorn|3de|5 II|6Runner|3zing Saddles|2ood Diamond|5sport|3w|2ue Streak|1oiler Room|2n Cop, Bad Cop|2rat: Cultural Learnings of America for Make Benefit Glorious Nation of Kazakhstan|1rick|3de of Chucky|2okeback Mountain|3oklyn&#39;s Finest|1uffalo &#39;66|2rn After Reading|0Captain Phillips|2sino Royale|3t Away|1enturion|1hain Reaction|2e: Part One|3rnobyl Diaries|2ronicle|1lerks.|2iffhanger|2ose Encounters of the Third Kind|1olombiana|2mmando|2nan the Barbarian|3stantine|2p Out|2wboys &amp; Aliens|1radle 2 the Grave|1yrus|0Danny the dog|2rkness Falls|2ybreakers|1ead Poets Society|3r Wendy|3th Race|1iary of a Wimpy Kid: Rodrick Rules|2e Hard: With a Vengeance|2ner|3ner for Schmucks|2sturbing Behavior|1oom|1rumline|1ue Date|0Edge of Darkness|1nemy of the State|2ter the Void|1quilibrium|1ragon|1scape from L.A.|cthe Planet of the Apes|1verything Must Go|0Fantastic Mr. Fox|2st &amp; Furious|1ear and Loathing in Las Vegas|1inal Destination|2red Up!|1lawless|1our rooms|1riday the 13th Part 2|2om Dusk Till Dawn|3st/Nixon|3zen|1unny People|0G-Force|1amer|2ngs of New York|5ter Squad|1et Him To The Greek|1host Town|1one in Sixty Seconds|2od Morning, Vietnam|5Night, and Good Luck.|0Hannibal Rising|2rry Brown|1eavy Metal|2llboy|2ro|2sher|1igh Anxiety|5Plains Drifter|1ollywood Homicide|2me Alone 2: Lost in New York|2stel|2t Rod|4Tub Time Machine|1ulk|0I Am Number Four|2Spy|1ce Age: Dawn of the Dinosaurs|9The Meltdown|1dentity|1n Bruges|3Good Company|3Time|3the Company of Men|2diana Jones and the Kingdom of the Crystal Skull|2somnia|2to the Wild|2victus|1t&#39;s Kind of a Funny Story|0Jack Reacher|4ass Number Two|2ws|1ingle All the Way|1ourney to the Center of the Earth|1umper|0Kingpin|2ss Kiss Bang Bang|5of the Dragon|1nowing|0L.A. Confidential|2I.E.|1ast Vegas|2yer Cake|1etters from Iwo Jima|1imitless|2ttle Nicky|2ve Free or Die Hard|1ock, Stock and Two Smoking Barrels|0Major League|2n of the Year|1eet Dave|2mento|2n in Black|c II|fI|2rcury Rising|1iracle|2ssion to Mars|1oneyball|2onraker|2rtal Kombat|1r. Popper&#39;s Penguins|1unich|1y Cousin Vinny|0Ocean&#39;s Eleven|1ffice Space|1liver Twist|2ympus Has Fallen|1pen Season|1rgazmo|0Pain &amp; Gain|2ndorum|2yback|1hone Booth|1irates of the Caribbean: On Stranger Tides|1lanet 51|1olice Academy: Mission to Moscow|1rimer|1ublic Enemies|2ss in Boots|0Quantum of Solace|0R.I.P.D.|1adio Days|2ging Bull|2in Man|2venous|1eal Steel|2d Dragon|2ign of Fire|1io|2se of the Planet of the Apes|1oad House|2boCop|2cknRolla|4y|2unders|1ush|4 Hour 3|0Se7en|2condhand Lions|3ret Window|1haft|3me|3nghai Knights|3rk Tale|2erlock Holmes|2rek Forever After|2utter Island|1igns|2lent Movie|2x Days Seven Nights|1leeper|2umdog Millionaire|1mall Soldiers|1now Dogs|1olaris|2n of the Mask|1pace Jam|2here|2ider-Man|2lash|2y Hard|1tar Trek III: The Search for Spock|aV: The Final Frontier|9: Nemesis|bThe Motion Picture|5Wars|4gate|2ealth|2raw Dogs|1ubmarine|2per|5 Troopers|5man|8 Returns|2rrogates|0Takers|2xi Driver|1hank You for Smoking|3t&#39;s My Boy|2e Adventures of Sharkboy and Lavagirl 3-D|iTintin|5viator|4Beach|5lues Brothers|5ourne Identity|5reak Up|5ucket List|4Cable Guy|5onversation|4Da Vinci Code|6ngerous Lives of Altar Boys|5eer Hunter|6parted|5ictator|4Evil Dead|5xpendables|4Fan|6st and the Furious|5ifth Estate|5rench Connection|4Game|5limmer Man|5reen Hornet|5uard|4Hangover|5istory Boys|5udsucker Proxy|6nchback of Notre Dame|7t for Red October|4Imaginarium of Doctor Parnassus|5ncredible Burt Wonderstone|fHulk|6formant!|6ternship|4Killer Inside Me|4Legend of Zorro|5incoln Lawyer|5one Ranger|6rd of the Rings: The Return of the King|6sers|7t Boys|4Majestic|6n from Earth|8with the Iron Fists|6sk|5essenger|5ighty Ducks|5ummy|4Naked Gun 2 1/2: The Smell of Fear|5egotiator|5umber 23|4Pirates! Band of Misfits|5olar Express|6stman|5restige|4Reader|5ock|4Santa Clause|g 2|5oloist|6rcerer&#39;s Apprentice|5pecialist|5ting|4Terminal|6xas Chain Saw Massacre|5hin Red Line|5owering Inferno|7n|4Usual Suspects|4Whole Ten Yards|5oman in Black|6rds|5restler|2ir13en Ghosts|4teen days|3s Is the End|2ree Kingdoms: Resurrection of the Dragon|6to Tango|1ime Bandits|4cop|4line|2nker Tailor Soldier Spy|1otal Recall|2wer Heist|1raining Day|2easure Planet|2oy|1welve Monkeys|0UHF|1ltraviolet|1p|1rbania|0Valkyrie|2nilla Sky|1ertical Limit|0Wanted|2r of the Worlds|3Games|3rior|2yne&#39;s World|1e Are Marshall|2ekend|1here the Wild Things Are|2ite Fang|6Noise|b 2: The Light|2o Framed Roger Rabbit|1ild Target|1ristcutters: A Love Story|0You, Me and Dupree|3ng Guns|0xXx|0(500) Days of Summer|02012|0American Psycho|1tlantis: The Lost Empire|1ustin Powers: The Spy Who Shagged Me|0Back to the Future|2ttle: Los Angeles|6ship|1ig Fish|0Capitalism: A Love Story|3tain America: The First Avenger|2rs|2sino Jack|2tch Me If You Can|1harlie St. Cloud|1loudy with a Chance of Meatballs|1on Air|2ol Runnings|0Dark City|1istrict 9|1jango Unchained|0Eagle Eye|0Fantastic Four|1ight Club|2nding Nemo|1orrest Gump|0G.I. Joe: The Rise of Cobra|1alaxy Quest|2ttaca|1et Low|1hostbusters|1reen Lantern|3mlins|0Hamlet|2rry Potter and the Deathly Hallows: Part 2|lGoblet of Fire|1istory of the World: Part I|1ot Fuzz|0I Love You Phillip Morris|1, Robot|0Kick-Ass|1ung Fu Panda|0L&aring;t den r&auml;tte komma in (Let the Right One In)|1aw Abiding Citizen|1et Me In|3hal Weapon|1iar Liar|2fe of Pi|2ttle Shop of Horrors|1ucky Number Slevin|0Magnolia|2llrats|2rgin Call|1ilk|2nority Report|2ssion: Impossible|j - Ghost Protocol|1onsters, Inc.|2on|0Napoleon Dynamite|1ew York Minute|1inja Assassin|1ow You See Me|0Pacific Rim|2raNorman|1ocket Monsters: Mewtwo Strikes Back!|0Rango|1ed Dawn|2member the Titans|1iddick|2se of the Guardians|1obots|1un Lola Run|2shmore|0Seven Psychopaths|1hanghai Noon|2ooter|2rek|1ource Code|1pider-Man 2|1tar Trek Into Darkness|5Wars: Episode III - Revenge of the Sith|2ep Brothers|2uart Little|1unshine|2perbad|0TMNT|1he Artist|4Big Lebowski|4Dark Knight Rises|4Fifth Element|5orbidden Kingdom|4Godfather|5reen Mile|4Hitchhiker&#39;s Guide to the Galaxy|5obbit: The Desolation of Smaug|5urt Locker|4Italian Job|4Last Airbender|5ion King|5ong Kiss Goodnight|6rd of the Rings: The Fellowship of the Ring|rTwo Towers|4Man in the Iron Mask|6sk of Zorro|7ter|5uppet Christmas Carol|as|4Place Beyond the Pines|5rince of Egypt|4Quick and the Dead|4Road|4Social Network|4Truman Show|4Wind That Shakes the Barley|5olf of Wall Street|8man|1ootsie|2y Story|9 2|1ransformers|2on Legacy|2ue Lies|0WALL-E|1ar Horse|1hat Women Want|1rath of the Titans|0X-Men|0Yes Man|1outh in Revolt|03:10 to Yuma|09|0Act of Valor|1laddin|1ngels &amp; Demons|1pollo 18|1rmored|0Banlieue 13|1efore Sunrise|aset|2verly Hills Cop|h III|1roken Arrow|1ullet to the Head|0Congo|1rank|0Dark Angel (I Come in Peace)|2s Boot|2wn of the Dead|2y of the Dead|1ear John|1reamcatcher|1ylan Dog: Dead of Night|0El Mariachi|1raserhead|0Faster|1irst Blood|1light of the Phoenix|2ushed Away|2y Me to the Moon|0Gerry|2ttysburg|1ladiator|2engarry Glen Ross|0Hancock|1eaven&#39;s Gate|1obo with a Shotgun|0I Come with the Rain|2Spit on Your Grave|1ce Age|1mpostor|1ndiana Jones and the Temple of Doom|0Jarhead|0Killer Elite|4ing Them Softly|2ng Kong|4dom of Heaven|0Ladyhawke|2ra Croft: Tomb Raider|0Madagascar|2ster and Commander: The Far Side of the World|0Perrier&#39;s Bounty|1latoon|1redator|8s|2ince of Persia: The Sands of Time|0Red Planet|2servoir Dogs|1omeo Must Die|0Safe Men|2ving Private Ryan|1haolin Soccer|1tand By Me|0The Boondock Saints II: All Saints Day|4Illusionist|4Kite Runner|4Last Samurai|5eague of Extraordinary Gentlemen|4Mechanic|6n Who Stare at Goats|4One|4Princess and the Cobbler|4Road to El Dorado|4Shadow|4Taking of Pelham 123|5ourist|5ransporter|5uxedo|1rance|2opic Thunder|0Vampires (John Carpenter&#39;s)|0Waltz with Bashir|1e Own the Night|1innie the Pooh|0Yogi Bear|0Zathura: A Space Adventure|0300|0Alien 3|1pocalypse Now|0Batman Returns|1lack Hawk Down|1r&uuml;no|0Collateral|2nversations with Other Women|0Daredevil|2s Leben Der Anderen|0Escape from New York|0Frankenweenie|0Good Will Hunting|1ravity|2een Zone|0Haywire|1itman|0Indiana Jones and the Last Crusade|0Jack the Giant Slayer|0Kung Fu Hustle|0Lara Croft Tomb Raider: The Cradle of Life|0Megamind|1onsters|1ystery Men|0Nacho Libre|0O Brother, Where Art Thou?|0Pontypool|0Raiders of the Lost Ark|2tatouille|0Snatch.|1pirit: Stallion of the Cimarron|1tar Wars: Episode V - The Empire Strikes Back|kI - Return of the Jedi|0TRON|1he A-Team|4Boat That Rocked|6ondock Saints|4Frozen Ground|4Grey|4Hobbit: An Unexpected Journey|4Iron Giant|4Jungle Book 2|4Other Guys|4Pursuit of Happyness|4Remains of the Day|4Secret of Kells|5hawshank Redemption|4Tree of Life|3re Will Be Blood|3y Live|0Unbreakable|0Waterworld|010 Things I Hate About You|13 Going on 30|1408|02046|11|18 Days|7 Later...|3Weeks Later|0A Bug&#39;s Life|2Cinderella Story|2League of Their Own|3onely Place to Die|2Simple Wish|2Very Long Engagement|1Eon Flux|1cross the Universe|1keelah and the Bee|1lice in Wonderland|3en|5: Resurrection|2l About Steve|4or Nothing|2most Famous|2ong Came A Spider|1merican Beauty|1n Education|2astasia|2nie Hall|2other Earth|8Year|1quamarine|1s Good as It Gets|1tonement|1ugust: Osage County|1way We Go|0Baby Mama|2ck to the Future Part II|2ndidas|2rney&#39;s Version|1eautiful Creatures|5y Shop|2coming Jane|2dtime Stories|2etle Juice|2ing John Malkovich|2loved|2nd It Like Beckham|2owulf|2st in Show|2witched|2yond the Valley of the Dolls|1illy Elliot|1lack Christmas|6and White|3des of Glory|2indness|2ue Crush|5Like Jazz|1on voyage|2und|2ynton Beach Club|1rave|3zil|2ide Wars|4ge to Terabithia|6t Jones&#39;s Diary|d: The Edge of Reason|3ght Star|3ng It On|2ooklyn Rules|3thers|2uce Almighty|1uffy the Vampire Slayer|2g|2rlesque|2t I&#39;m a Cheerleader|0Cabin Fever|2n&#39;t Stop the Music|2rrie|6 2: The Rage|2se 39|3per|2t People|3s Don&#39;t Dance|3woman|1ecil B. Demented|2llular|2nter Stage|1hangeling|3rlie Wilson&#39;s War|8and the Chocolate Factory|7&#39;s Angels|k: Full Throttle|3sing Amy|2icago|4ken Run|3ld&#39;s Play|g 2|5ren of Men|3njeolhan geumjassi|2ocolat|1inderella|2rcumstance|2ty of Ember|1lockwatchers|3ser|3ud Atlas|3verfield|2ueless|1oach Carter|2co avant Chanel|2ld Mountain|2nnie and Carla|3tact|4raband|3viction|2raline|2untry Strong|1rash|2ooklyn|3ssroads|2uel Intentions|1ursed|0D.E.B.S.|1OA: Dead or Alive|1addy Day Care|2ncer in the Dark|3gerous Liaisons|2rk Water|2te Night|2ys of Heaven|1eath Becomes Her|2ep Impact|2fiance|4nitely, Maybe|2spicable Me 2|2tention|1iary of a Wimpy Kid|9the Dead|2ck|1odgeball: A True Underdog Story|2mino|2n&#39;t Be Afraid of the Dark|aSay A Word|2omsday|2ubt|1r. Dolittle 2|2ag Me to Hell|2eam House|2op Dead Gorgeous|0Eastern Promises|3y Virtue|1d Wood|2ward Scissorhands|1lection|2izabeth|2la Enchanted|1mma|1nchanted|1rin Brockovich|1scape from Planet Earth|1ulogy|1ve&#39;s Bayou|3nt Horizon|3r After|2olution|1ye for an Eye|3s Wide Shut|0Fair Game|2me|3ily Plot|2r from Heaven|1ever Pitch|1inal Destination 2|i3|3ding Neverland|2sh Tank|1lashdance|3tliners|2ightplan|1ootloose|2r Colored Girls|4Your Consideration|3getting Sarah Marshall|2ur Christmases|1reaky Friday|3eway|2iday the 13th Part IV: The Final Chapter|3ends with Money|2ozen River|1un with Dick and Jane|3ny Ha Ha|0G.I. Jane|1ake no ue no Ponyo|2rden State|1eorge of the Jungle|1host World|1irl with a Pearl Earring|4, Interrupted|1loria|1o!|2ing the Distance|2ne Baby Gone|2sford Park|1rease|2osse Pointe Blank|0Hairspray|2lloween H20: 20 Years Later|aII|2mlet 2|2nna|4ibal|3sel &amp; Gretel: Witch Hunters|2ppiness|2rriet the Spy|4y Potter and the Prisoner of Azkaban|lSorcerer&#39;s Stone|1e&#39;s Just Not That Into You|2llraiser|2nry V|2rb &amp; Dorothy|4ie Fully Loaded|1ide and Seek|2gh Crimes|5Heels and Low Lifes|5School Musical 3: Senior Year|4er Ground|1ocus Pocus|2llow Man|2me for the holidays|5on the Range|2odwinked!|2pe Floats|2rrible Bosses|2stel: Part II|2tel Transylvania|2use of Sand and Fog|2w to Train Your Dragon|1udson Hawk|0I Am Love|2Heart Huckabees|2Know What You Did Last Summer|1ce Princess|1dlewild|1n the Cut|2dependence Day|2kheart|1ris|2on Man 2|1t&#39;s Complicated|0Jackie Brown|2son X|2wbreaker|2y and Silent Bob Strike Back|1eepers Creepers|g II|2nnifer&#39;s Body|1in ling shi san chai|1osie and the Pussycats|1ulia|4e &amp; Julia|2manji|3ping the Broom|2nebug|3o|2st Like Heaven|0Kick-Ass 2|2nsey|2ssing Jessica Stein|1ung Fu Panda 2|0Lars and the real Girl|2st Holiday|1ee Daniels&#39; The Butler|2gally Blonde|e 2: Red, White &amp; Blonde|3ends of the Fall|3ion|2mony Snicket&#39;s A Series of Unfortunate Events|2s triplettes de Belleville|1ife During Wartime|2ttle Children|7Miss Sunshine|7Voice|7Women|1ondon To Brighton|2st in Space|2ve &amp; Basketball|5and Other Catastrophes|4ly and Amazing|0Machete|7 Kills|2de In Dagenham|2id in Manhattan|2ma|2n of the House|2rgaret|3ia Full of Grace|4e Antoinette|3s Attacks!|3tha Marcy May Marlene|2tch Point|2x Payne|2y|1e and You and Everyone We Know|2an Girls|2lancholia|2moirs of a Geisha|1idnight in Paris|2llion Dollar Baby|2rrorMask|2ss Congeniality|h 2: Armed &amp; Fabulous|5Potter|1ona Lisa Smile|3onoke-hime|3soon Wedding|4ter|7 House|2onrise Kingdom|2rning Glory|3tal Kombat: Annihilation|2ther and Child|2ulin Rouge!|1rs. Doubtfire|1ulholland Dr.|2ppets From Space|1y Big Fat Greek Wedding|3Sister&#39;s Keeper|4tepmother Is an Alien|4ummer of Love|2stic Pizza|7River|0Nanny McPhee and the Big Bang|1etwork|2ver Let Me Go|2w Year&#39;s Eve|1ick and Norah&#39;s Infinite Playlist|2ght at the Museum|2kita|2m&#39;s Island|1o Reservations|3Strings Attached|2rth Country|2tes on a Scandal|3ting Hill|2where in Africa|0October Baby|1ndine|2e for the Money|1ur Idiot Brother|2tbreak|0Panic Room|2ranormal Activity 2|k3|k4|3ental Guidance|3ker|2ul|1eggy Sue Got Married|2ople Like Us|2rcy Jackson: Sea of Monsters|3fume: The Story of a Murderer|3sepolis|2ter Pan|1ieces of April|2nk Flamingos|2rates of the Caribbean: At World&#39;s End|2tch Black|6Perfect|1lease Give|1oltergeist|b III|2ssession|1ractical Magic|2ecious: Based on the Novel Push by Sapphire|3mium Rush|4onition|3tty Woman|2ide and Prejudice|3est|3mary Colors|3soners|3vate Benjamin|2om Night|3of|1ush|0Quarantine|2een of the Damned|3st for Camelot|2inceanera|0Rabbit Hole|6-Proof Fence|2chel Getting Married|2ising Helen|2mona and Beezus|2ng De Basanti|1eal Women Have Curves|2d 2|4Eye|4Riding Hood|4Sonja|5tate|2member Me|2nt|2po Men|2quiem for a Dream|2sident Evil|d: Apocalypse|fExtinction|3tless|2turn to Oz|2volutionary Road|1ock of Ages|1ugrats in Paris:|2nning with Scissors|0S.W.A.T.|1abrina|2fe|4 Haven|2ve the Last Dance|3ing Grace|7Mr. Banks|1cary Movie 3|2hindler&#39;s List|2ooby-Doo|3tt Pilgrim vs. the World|2ream|6 2|73|3ooged|1ecretariat|6s &amp; Lies|2lena|2nse and Sensibility|2renity|2t It Off|2ven Pounds|2x and the City|ccity 2|1hakespeare in Love|3llow Hal|2ortbus|3wgirls|1ide Effects|4ways|2lent Hill|b: Revelation 3D|3ver Linings Playbook|2sters in Law|1ky High|1lacker|2eepy Hollow|2iding Doors|3ther|2ums of Beverly Hills|1milla&#39;s Sense of Snow|2oke Signals|1nakes on a Plane|2ow Flower and the Secret Fan|5White and the Huntsman|1omeone Like You...|2ngcatcher|2ul Surfer|3thland Tales|1panglish|3rkle|3wn|2eed|5 Racer|2lice|2ring Breakers|2un|2y Kids|8 2: Island of Lost Dreams|93-D: Game Over|1t. Trinian&#39;s|2ar Trek: Insurrection|5Wars: Episode I - The Phantom Menace|4dust|4ship Troopers|3te of Play|2ep Up Revolution|4mom|2ick It|2ranger Than Fiction|8s with Candy|3eet Fighter|1unshine Cleaning|2perman III|aV: The Quest for Peace|1wimming Pool|1ydney White|0Take Shelter|5the Lead|4n|2ngled|3k Girl|1eenage Mutant Ninja Turtles II: The Secret of the Ooze|2rminator 3: Rise of the Machines|1hat Thing You Do!|2e Addams Family|5ge of Innocence|5merican President|6ityville Horror|5vengers|4Back-up Plan|6llad of Jack and Rose|6nger Sisters|7k Job|5est Exotic Marigold Hotel|9Little Whorehouse in Texas|5ig Wedding|5lair Witch Project|5ook Thief|6x|5ridges of Madison County|4Call|5hronicles of Narnia: Prince Caspian|qThe Lion, the Witch and the Wardrobe|5lan of the Cave Bear|6ient|5olor Purple|6njuring|7stant Gardener|6re|6unselor|5raft|7zies|4Darkest Hour|6y After Tomorrow|8the Earth Stood Still|5ead Girl|6bt|6scent|6vil Wears Prada|9&#39;s Advocate|gRejects|5ivide|4English Patient|5xorcism of Emily Rose|bt|5ye|4First Wives Club|5og|6urth Kind|5uture|4Glass House|5odfather: Part II|6lden Compass|6od Girl|auy|5rudge|a 2|4Haunting|5eat|6lp|5ost|6urs|7se Bunny|5unger Games: Catching Fire|4Importance of Being Earnest|5ncredibly True Adventures of Two Girls in Love|5ron Lady|5sland|4Karate Kid|5ids Are All Right|4Land Before Time|6st Exorcism|h Part II|9Station|5egend of Suriyothai|5ovely Bones|5ucky Ones|4Messengers|5irror Has Two Faces|6ssing|7t|4Net|6xt Three Days|4Other Boleyn Girl|9s|4Player|5owerpuff Girls|5rincess Diaries|k 2: Royal Engagement|dand the Frog|4Ring|8 Two|5oommate|6yal Tenenbaums|5unaways|4Savages|5ecret Life of Bees|5impsons Movie|6sterhood of the Traveling Pants 2|5keleton Key|5murfs|a 2|5py Next Door|5tepford Wives|5weetest Thing|4Tale of Despereaux|5empest|5o Do List|5wilight Saga: Breaking Dawn - Part 1|4Unborn|4Village|5ow|4Wedding Date|cPlanner|5hole Nine Yards|5olverine|6men|4Young Victoria|3re&#39;s Something About Mary|2ink Like a Man|3rteen|1iny Furniture|2tan A.E.|5ic|1ombstone|2psy-Turvy|1ransamerica|5siberian|2emors|2oop Beverly Hills|1uck Everlasting|4er and Dale vs Evil|1wister|2o Weeks Notice|0Undead|4rworld: Awakening|1rban Legend|0Valentine&#39;s Day|2n Helsing|1era Drake|3onika Decides to Die|1icky Cristina Barcelona|1olcano|3ver|0Waiting...|4ress|2lk the Line|4ing and Talking|2nderlust|2ter|1e Were Soldiers|2&#39;re the Millers|2lcome to the Dollhouse|fRileys|2ndy and Lucy|1hale Rider|3t Happens In Vegas|5Lies Beneath|5to Expect When You&#39;re Expecting|4&#39;s Your Number|2en a Stranger Calls|5the Cat&#39;s Away|3re the Heart Is|2ip It|3te Chicks|6Oleander|5out|1imbledon|1o hu cang long (Crouching Tiger, Hidden Dragon)|2mb|2n&#39;t Back Down|1rong Turn|0X-Men: The Last Stand|0Yesterday Was a Lie|1ou Again|4Will Meet a Tall Dark Stranger|3&#39;ve Got Mail|3ng Adult|3r Sister&#39;s Sister|4s, Mine and Ours|0Zoom|1wartboek|0[Rec]|017 Again|08 femmes|0About Time|1liens|1madeus|2erican Hustle|1pollo 13|1rgo|1ttack the Block|0Bad Teacher|1eauty and the Beast|1lack Swan|2ue Jasmine|1olt|2ys Don&#39;t Cry|1ridesmaids|0Contagion|0Dazed and Confused|1eath at a Funeral|2spicable Me|2vil|1ie Hard|2sturbia|0Easy A|2t, Pray, Love|1l laberinto del fauno (Pan's Labyrinth)|2ysium|1pic|0Fargo|2st Five|5and Furious 6|0G.I. Joe: Retaliation|1oodbye Lenin!|1rown Ups|0Hard Candy|3old and Kumar Go to White Castle|3ry Potter and the Chamber of Secrets|lDeathly Hallows: Part 1|lHalf-Blood Prince|lOrder of the Phoenix|1edwig and the Angry Inch|2rcules|1ighlander|0I Am Legend|1nsidious|0John Carter|1urassic Park|0Kill Bill: Vol. 1|1nocked Up|0Les Miserables|1ike Crazy|2lo and Stitch|2ncoln|1ove Actually|0Man of Steel|0Nebraska|0Oz the Great and Powerful|0Pocahontas|1ride and Prejudice|1ulp Fiction|0Rush Hour|0Safety Not Guaranteed|2lt|2ved!|1haun of the Dead|2rek 2|6the Third|1in City|1ky Captain and the World of Tomorrow|1tar Trek|9: First Contact|1ucker Punch|2per 8|0Texas Chainsaw 3D|1he Abyss|4Chronicles of Narnia: The Voyage of the Dawn Treader|5ity of Your Final Destination|4Devil Inside|4Emperor&#39;s New Groove|5xpendables 2|4Holiday|5unger Games|4Incredibles|4King&#39;s Speech|4Matrix|a Reloaded|dvolutions|5ortal Instruments: City of Bones|4Silence of the Lambs|4Twilight Saga: Eclipse|4Way Way Back|2or|1ransformers: Dark of the Moon|eRevenge of the Fallen|2opa de Elite|2ue Grit|1wilight|0V for Vendetta|0Winter&#39;s Bone|1reck-It Ralph|0X-Men: First Class|12 (X-Men 2)|0Zero Dark Thirty|1ombieland|2olander","sep":"|"},{"f":"0tt1711425|3343727|22024544|20453562|21814621|3559547|3939659|485966|22229499|21288558|22294629|3191701|21699755|22364841|21517260|22243973|21656190|3876451|20848228|21386703|20816462|422847|3999913|21568346|20775489|21155076|20758746|21144884|20489018|3373883|3454082|3398712|3414387|3384806|3432291|3363547|3142032|3315733|21571222|20359423|3268126|3080339|3149691|3375568|3115591|3383222|479725|3800320|3424345|3087078|3112722|421164|3090555|483866|3486576|3093010|480745|53972|21438176|20120681|85|3077651|491225|3970179|3410097|21634122|3564367|3788391|3508675|20089469|3104797|21305591|3149361|3667353|20477348|21266029|20181739|21179904|20401711|3087928|3350258|3102798|417509|3423169|21564585|20337741|3114508|57765|408255|3081573|3383028|3103064|3844286|3968264|3133751|3414993|3219699|21103982|3343092|20410297|3093389|3119567|3402399|3332280|3446755|3187393|419874|22184339|20292644|3332379|3134119|3452694|3857191|3320691|3477080|3120458|3494652|21542344|20971209|3370263|21611224|402620|22125435|20118749|3099423|3120655|3246578|3780504|3087182|492991|3154420|21907668|3375666|20361748|3454848|21300854|20892318|3335266|3166276|3892782|22094064|20120762|3814255|3122459|3955308|3432348|21074638|20475394|21421051|20158983|3094012|484726|3121765|3942903|3780622|3120657|21385826|3259521|20421715|468569|21132620|20436697|21161864|20073629|3167404|3482606|21673434|3981115|20435761|21860353|3027718|3178663|20816711|3458525|3307901|489722|21335975|20183790|21019452|20109040|21185836|20069704|3163651|3077975|3166485|3218817|3118655|3455824|3096928|486984|3357507|21216475|20423977|3352248|3118883|21372686|20266452|21564349|20116136|3242423|3109686|21731141|3211956|20338013|3780511|3083929|3457572|21622979|3129423|20119137|426916|462973|21376195|20480687|3146882|3386588|3102057|21411704|20280760|3465502|21253864|22226417|3106476|20119468|3452637|3097742|474812|3399295|3866439|21518812|20212338|3095631|21046997|20071853|3280590|3356910|3758766|3417001|3091578|21179891|20110622|3907657|3073486|3120780|21532957|20138704|3910936|3257001|3084522|3409182|3100403|3485985|3087995|3203119|3323944|438427|3165982|21922777|20081534|21874789|20372588|3180052|3429589|3878804|3372183|3209958|3104036|22404311|20964517|3106977|21139328|3951261|3649419|3058017|20366627|3095497|3362270|3120108|3258068|3780607|3367089|3889573|21509767|3142988|3298649|20202677|3092099|3117951|3423409|3096320|3242998|3120879|3086541|22334879|20120891|431646|3072431|3343660|21306980|20087800|21091722|477262|20120586|3357413|21781769|20106308|3499549|3118688|21120985|20112573|6641|21352824|20200550|21278340|20246460|3120679|3080761|499653|785|21205489|20107048|21798709|20311289|3099785|3251127|21155056|22024432|20371746|3035423|21013743|20758752|21277953|20465538|3119738|3875034|21483013|20213149|3383574|425980|21245526|20387564|3098724|3454945|3102975|420855|21637725|20438488|405422|3948470|3289879|496572|3481499|3293508|3093779|21041829|20081505|58247|21213663|3859650|3193138|3588173|20409459|21389137|20120890|3067992|58156|3322259|21272878|3622547|20120577|3298203|3411061|3134273|3268978|3075784|3104257|21606378|20405296|21315981|3268799|20257360|3094612|21815862|3186830|20118570|81|3094625|3244000|3122933|21313092|20168786|3800308|3120591|3327437|21430607|20212720|3112401|3074156|3295178|3099088|472684|496895|3372784|3112462|3799934|21152398|3532503|20092644|3101452|21164999|3629705|20120611|487738|3083658|471230|3450259|3092675|3221027|3181316|6984|3479647|443453|3393109|3144120|3388795|21210042|20118789|3887883|21535109|20381061|3162222|21020558|20115857|3892255|21991245|3706593|20109445|56582|3075860|21657507|20088944|52198|3360486|21385867|20409847|3306685|21336617|20342258|3282209|3433362|3097165|3342272|3452608|21650043|20112864|3083833|3427152|3134619|3419706|3303933|21231583|426273|20120660|21191111|20238380|3449010|3116225|3067065|21531663|20432283|21013752|20120669|495714|21083456|20155711|413101|3082418|3116367|3870111|21323045|3201167|20436339|21034032|20217505|21321870|3226229|20995039|3187078|3093105|3433383|3367959|21289406|20082509|3167190|404412|21403177|20076141|468699|3329717|3104431|3450278|3787475|21231587|20286716|21464540|20297181|21080016|20438097|3309698|3780536|3385267|21637688|20119361|3367882|3278504|3758758|21057500|20804497|3790724|3493430|3073195|3116705|3373051|3489099|3116778|3373469|3271027|3448011|3119488|3242587|21204975|20375912|3498380|21219289|20185431|3337978|3120735|3097815|3483726|3765476|3209144|3119654|420912|21409024|20120749|3349825|3183523|21210166|20079574|3113855|21396218|20408306|3104952|3240772|3151804|3380599|22302755|20400717|3124819|21980209|3188729|20120784|483649|21298650|20762125|3110857|3390384|21152836|20448694|3830515|3790736|3093818|481398|495953|3129332|3433035|3289765|453556|21436562|3318514|20098206|53870|21032755|20075148|3128442|21979320|200293564|3114369|3327137|463988|3067741|21723811|20300471|57453|3988045|3892791|21130884|20286106|3075222|3120828|3070707|21010048|20122718|3281373|3307479|462165|3117705|420184|445487|3088161|3117723|3088170|498382|3253754|3079945|56759|3111282|3382992|3067800|21440292|3512235|20247745|3078346|3348150|3986263|21135084|20075314|3427944|21232200|20424774|3983193|3338751|3163978|3080455|3258463|3452594|3825232|3115798|3071360|3382625|3238924|3077416|3407887|21645170|20083907|21320253|20116277|3232500|21837703|20067116|3119174|56421|3990407|21540133|3119646|20464049|3110074|56583|3099810|21054606|20790628|3800080|21130080|22234155|20954947|3386140|21189340|3210819|20167260|3480255|3093437|3268995|3756683|21258972|20110475|3790712|3104868|420616|402510|420768|3481369|21430626|20338348|3119925|3482571|3976051|3117500|51070|3304669|3821642|3963966|3111255|3070735|3362227|3072271|3120863|3072308|3840361|3114814|3327247|21596365|3840417|3125849|20245674|3146309|21245492|20882978|3144640|3081633|3111438|3300556|21340800|20100802|3471042|3139654|53240|3332452|3114746|3098546|3370032|21049413|20182508|3985699|3259711|3190865|3493464|407304|3086567|21291584|20105793|3758794|21714210|20386117|3103247|3375210|3496436|3096438|21235189|20477139|463034|3096487|3295701|21022603|3190080|20144084|3230011|3145660|3088763|21217613|3440129|20319061|21232207|20458339|3317219|21194417|20264464|21438254|20844471|3118880|406611|418929|21136608|3853728|3059786|20120667|437523|3266543|3109830|21046173|20177789|419177|21194263|20087332|21133985|20087363|3116477|21201607|20330373|3082517|3425112|21045772|20343818|21250777|20441773|21139797|497624|3228987|20093409|3119528|3454876|3091419|3425210|3175880|413749|21615147|3013753|20181689|417060|21229238|20198781|21182345|20374900|463282|21186367|3670345|463662|423288|20190641|21192628|3234719|20210945|21411250|446192|20358082|3130827|428445|21931533|20184894|3822854|3126029|3945513|3316654|21408101|20121766|3838283|3164912|3448134|3829482|3453556|21655442|20118715|21345836|20119116|3865556|3068646|3120689|3371724|21170358|20887912|3317740|3938283|3110357|56908|420737|467261|420744|86|21560747|20104940|21204342|3817273|20120794|414214|3898367|21285016|20120382|3460989|3993846|3780653|3084805|3114709|420363|3418279|21104001|20111503|3910970|21568911|20207201|21646987|20120903|21068680|20403702|3381849|3472033|21591479|20103639|3808151|21772240|20913354|3414852|3112471|3381681|3086960|3109254|415759|21308729|20112715|3479884|3099817|482096|477402|488993|3989757|3285531|21013860|20104815|3074486|21433108|20083944|3377062|3424095|486321|3302674|3107007|472495|404348|3448157|3080855|21640459|3024744|20077713|3268380|3160399|3087469|3418763|21448755|3764234|20360717|420661|3089457|3146316|3351283|411113|21003034|20091763|53773|21424381|20473075|3199753|405236|465929|420813|85|3286112|3092005|21300851|20443543|419887|3325710|411429|3472399|21234548|20267804|3112389|438749|411143|21111422|3243957|20293662|50095|21924429|20942385|3120877|21185616|20498399|21449283|3302067|20406375|416449|3103644|3078788|3103776|3265086|3889583|3369339|3435623|3287978|3405094|3082340|21142977|20119217|21454468|20947810|21506999|20465494|3097576|21351685|20373074|425703|21001526|3470827|20132347|3457510|3190590|21226681|20082971|3382932|3208092|3166813|3080684|56190|54827|3429493|21131729|20144117|22005374|21601913|20903624|3129167|3283426|21386588|20454921|3107943|3485601|3111161|3478304|469494|3096256|3217869|3114898|447800|3337563|3450385|3212712|3478087|3191754|3289043|3463854|3120623|3356470|3104694|21422136|20120133|3344510|3402022|445922|437800|21014759|20078748|3118583|3881891|3286261|3181875|464334|59547|21174732|20118617|3075686|21549572|3431181|20429591|3119822|3783233|21322269|3176740|20871426|3096874|3416496|21423894|20221889|3388500|3416508|3960731|3094721|3120601|83|3286499|3442933|3218839|3374536|3065466|3249462|3071222|3165643|3445934|3861689|3300532|21758575|20310778|3115736|3439478|21217209|20088846|3901476|3398808|3243155|3317198|3810784|3204946|483503|3765010|3315327|3103893|3470705|21126591|20179116|3303816|3080492|3319970|3144814|3795351|3112642|3083722|3118829|3327554|3173716|3337921|3210616|3824747|3472062|3367594|3160127|3305357|3118842|3299658|3120630|3094862|59253|3206634|3451094|3241303|3128996|21684628|20970411|3118866|3376541|21371111|3060277|20112697|3393162|21035736|20159365|3345074|3118884|21524137|3244754|20327597|21555064|20375679|3109504|3275022|3139134|3257516|3367631|498913|417303|3168629|3094947|3382628|21279935|20077405|3104070|420647|21034303|20832266|21690953|3701990|3196141|20848557|3144168|3364725|3421054|21270761|20260866|3483607|3918927|3240462|21127180|3462041|20157503|3765443|3808244|3109707|3099487|3126886|57536|3327679|3116191|3461770|3195685|3765446|3349416|3119080|81|420631|3251075|3116260|420663|3977855|3080716|474512|3297884|3119114|3309593|3414982|3308644|21232776|20085549|499582|3408790|21068242|3405500|20470765|3800039|3369436|422330|3116361|3087298|3436331|3978759|3369441|427753|3119173|3876563|3333766|3119190|462346|3335119|3172493|22425486|20139239|21322312|20452623|3280707|3077631|3119229|3427327|3120694|3082495|21104733|20993842|3212985|21428538|20147612|416493|3304141|3241527|21001508|20093177|57499|21227929|20400497|3382077|3257756|53126|3962726|21562568|20107120|464052|413321|3299172|3443536|3119313|21499658|20498353|3837562|3315983|3892769|3102070|21226236|20356721|3119345|3396652|3417225|3199626|416629|3494238|21606618|3228705|430414|20119396|3211443|3155776|3261392|53488|3301470|21131734|3410063|20236348|3076245|21135503|20113497|21640484|20418773|467406|425123|21650554|20362269|3264761|21302011|20805564|3408985|21327773|20250494|3333780|3110322|21038686|20339291|3286244|3808526|3404203|449059|3147004|410367|3490166|3120738|499725|416931|3258273|3985694|22002718|21371155|20252076|22023587|20331933|3466893|3390221|3422720|3116996|21441326|20416320|467197|3303361|3415978|3377092|21527186|20397535|21605783|20405159|3366780|3212346|3385307|3482546|3304415|3119698|3265343|3340855|485880|21748122|3126618|20119707|21121977|20203009|3107614|466924|458811|3259446|21078588|20095687|3382189|3095690|3327056|21415283|20074958|21334260|3598822|20981227|3477347|3100263|3410377|481141|21411238|20395972|3465551|3125439|461860|21720182|3235796|3598828|3637706|20114069|3258000|21536044|3778304|22109184|21047540|3904996|3092026|20091738|21716777|3854564|20396171|3808417|3316396|51648|3069089|3449088|3134847|21981677|20878835|3084516|495889|3368563|3120791|3929632|21547234|20477071|3100405|3366920|3110889|59942|21392214|20081375|3926129|3377107|3465580|21082868|20238546|3120800|3451176|3935075|3252444|21084950|20350028|3493949|405508|3296166|21821694|20421239|21486185|20089893|3873886|21403981|20294870|21053424|20180093|420804|3318627|3432021|21498569|20089908|3959337|21336608|20213203|3439289|3257076|3114319|723|21702439|20206275|3195234|22140373|20306047|3108052|3267913|3446029|3117571|420082|434084|3096061|21028576|20117589|420094|414388|3379786|3117603|3814314|21000774|3261945|20138097|3256380|3367027|3114436|22053463|20375063|484537|3938330|21045658|20474361|405325|3102943|462661|420148|3439815|3120831|6152|6321|3417148|21541995|3735898|20244970|410299|21596346|20405336|3371246|3075249|3120177|411257|3811080|21017460|22101441|20283003|427538|487717|3338459|3964587|3120844|6915|3486655|3120201|3473705|21800741|20120686|3430634|420223|3369994|3111301|3862846|3086393|494074|3324133|3815244|21675192|20446046|3936501|3398286|3114614|403060|481852|417887|401272|56226|412346|3078767|3118661|21212436|20357110|3280460|400465|21412386|20083642|21931435|20185937|3816442|3362478|3112579|21911644|20499448|3363771|3090848|3109446|3088939|21457767|20387131|3298814|22193215|20115963|3455407|21093357|20319262|3970416|3783238|21226753|20435625|458352|3118971|3395584|21535616|20116209|3404032|3070047|3406759|3116313|3080749|21220198|435170|20221218|3071562|3385752|3279113|21247662|20391198|3433386|3171363|22404463|21454029|20468492|3274558|3852713|21951264|20278500|3113416|21007029|20399201|3087538|3842926|3095489|21320244|22034139|20824758|3290879|3380510|3981072|3425430|3117057|3338188|3884328|3113957|21458175|20467200|3230600|3105151|3289408|447638|3368933|3780521|3298130|3377109|21265990|20265666|21017451|20775529|3416212|462538|21018785|20397101|3472181|22017020|21273678|20327162|3253867|2420238|21274300|3758795|3324999|3139668|20368447|21606389|20372532|3209475|3190138|21430132|20430770|3962736|3129387|21621045|20328538|21570989|20120913|6338|408358|451568|3407265|3800241|3100814|3098519|3283084|21465522|20117998|3313737|439840|21496025|20146336|3817230|3338526|483694|21068678|20497465|3120461|3441909|3348333|3473308|3358273|3118113|21655460|20240200|477434|21723121|20114906|21183923|452850|20298228|21033643|20161081|21586265|20770703|3455857|3115856|498021|21172233|20381707|3283139|3365929|50201|3190332|21216520|3870529|20295700|3376994|3448182|21414382|3182350|20128853|21625346|3742336|20443295|3383060|59557|21038988|20974661|3283832|22194499|20090605|486879|21800241|20112384|21024648|3478964|3284575|20101414|3947798|22334873|20397892|3171804|21478338|3598778|20106677|3795368|21323594|414655|20095016|3486822|21282140|20879870|3457430|21535108|20848537|3116282|21596343|3905041|3583421|20301357|21375670|20424136|3366551|3295297|3926084|3417741|3373889|3248845|3119282|3091203|3480249|21591095|20401729|3107290|3266697|3478311|21707386|458692|20275847|3443272|3314331|3770828|21821549|3623205|20114148|52130|50912|420812|21862079|20944835|3332375|465748|3298148|3413267|401792|3346156|3796366|3117731|3978764|21650062|3572315|20096754|3980970|3896923|21560985|20120917|21764651|20457939|21392170|20317705|21504320|20133093|3234215|442653|21538403|20102926|21325004|3727388|20800369|21399103|3055369|20861739|21403865|3099212|20434409|21399683|3772341|3270798|20290334|21790885|3156398|20196229","sep":"|"},{"d":"notalk|ok-disagree|notalk-disagree|men|ok|nowomen-disagree|dubious-disagree|men-disagree|dubious|nowomen","r":"0*1,1*1,2*1,3*1,4*3,5*1,6*1,1*1,4*1,7*1,8*1,9*1,6*1,4*1,2*1,4*1,0*1,2*1,6*1,2*1,4*1,2*1,9*1,6*1,3*1,4*a,8*28,6*1l,3*3f,7*1w,0*ah,2*3m,9*2e,5*1g,4*iv,1*2x","sep":"|"}]}]);
const COLONY = [
{"id":"n-d5d0861b","guard":[["hasAny",["imdb","item number","nth"]],["not",["has","holiday"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-a1c9bced","guard":[["hasAny",["imdb","invert case","item number","nth","swap case","toggle case"]],["not",["has","holiday"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]],"mem":null},
{"id":"n-de366460","guard":[["hasAny",["class name","imdb","item number","nth","pascal case","pascalcase","upper camel case"]],["not",["has","holiday"]]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]],"mem":null},
{"id":"n-9011bacb","guard":[["hasAny",["imdb","item number","nth"]],["not",["has","holiday"]]],"pyramid":["render.template",{"lit":["The imdb of ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-8a3aa547","guard":[["has","imdb"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Lara Croft: Tomb Raider":"The imdb of Lara Croft: Tomb Raider is tt0146316.","give the imdb for Whatever Works":"The imdb of Whatever Works is tt1178663.","give the imdb for Valkyrie":"The imdb of Valkyrie is tt0985699.","what is the imdb of Remember Me":"The imdb of Remember Me is tt1403981.","what is the imdb of The Texas Chain Saw Massacre":"The imdb of The Texas Chain Saw Massacre is tt0072271.","give the imdb for What to Expect When You&#39;re Expecting":"The imdb of What to Expect When You&#39;re Expecting is tt1586265.","what is the imdb of The Cell":"The imdb of The Cell is tt0209958.","what is the imdb of The Informant!":"The imdb of The Informant! is tt1130080.","tell me the imdb of the title Osmosis Jones":"The imdb of Osmosis Jones is tt0181739.","tell me the imdb of the title Disturbing Behavior":"The imdb of Disturbing Behavior is tt0134619.","tell me the imdb of the title Lost in Space":"The imdb of Lost in Space is tt0120738.","tell me the imdb of the title Insidious":"The imdb of Insidious is tt1591095.","tell me the imdb of the title Night at the Museum":"The imdb of Night at the Museum is tt0477347.","give the imdb for Troop Beverly Hills":"The imdb of Troop Beverly Hills is tt0098519.","give the imdb for Doubt":"The imdb of Doubt is tt0918927.","what is the imdb of The Prince of Egypt":"The imdb of The Prince of Egypt is tt0120794.","what is the imdb of American History X":"The imdb of American History X is tt0120586.","tell me the imdb of the title Twister":"The imdb of Twister is tt0117998.","give the imdb for The Fourth Kind":"The imdb of The Fourth Kind is tt1220198.","tell me the imdb of the title Fargo":"The imdb of Fargo is tt0116282.","give the imdb for The Beach":"The imdb of The Beach is tt0163978.","give the imdb for Pain &amp; Gain":"The imdb of Pain &amp; Gain is tt1980209.","tell me the imdb of the title High Plains Drifter":"The imdb of High Plains Drifter is tt0068699.","give the imdb for Adam":"The imdb of Adam is tt1185836.","what is the imdb of All About Steve":"The imdb of All About Steve is tt0881891.","what is the imdb of Another Earth":"The imdb of Another Earth is tt1549572.","give the imdb for High Anxiety":"The imdb of High Anxiety is tt0076141.","what is the imdb of The Prestige":"The imdb of The Prestige is tt0482571.","what is the imdb of Baby Mama":"The imdb of Baby Mama is tt0871426.","tell me the imdb of the title Idlewild":"The imdb of Idlewild is tt0417225.","give the imdb for Nine":"The imdb of Nine is tt0875034.","tell me the imdb of the title The Painted Veil":"The imdb of The Painted Veil is tt0446755.","give the imdb for Gettysburg":"The imdb of Gettysburg is tt0107007.","what is the imdb of The Others":"The imdb of The Others is tt0230600.","what is the imdb of The Hunger Games":"The imdb of The Hunger Games is tt1392170.","give the imdb for Green Lantern":"The imdb of Green Lantern is tt1133985.","give the imdb for Mirror Mirror":"The imdb of Mirror Mirror is tt1667353.","tell me the imdb of the title Gamer":"The imdb of Gamer is tt1034032.","tell me the imdb of the title Rush Hour 3":"The imdb of Rush Hour 3 is tt00293564.","tell me the imdb of the title Contact":"The imdb of Contact is tt0118884.","tell me the imdb of the title The Tale of Despereaux":"The imdb of The Tale of Despereaux is tt420238.","give the imdb for 28 Days":"The imdb of 28 Days is tt0191754.","what is the imdb of Analyze This":"The imdb of Analyze This is tt0122933.","give the imdb for Beauty and the Beast":"The imdb of Beauty and the Beast is tt0101414.","what is the imdb of The Devil&#39;s Rejects":"The imdb of The Devil&#39;s Rejects is tt0395584.","tell me the imdb of the title Walking and Talking":"The imdb of Walking and Talking is tt0118113.","tell me the imdb of the title Henry V":"The imdb of Henry V is tt0097499.","what is the imdb of Restless":"The imdb of Restless is tt1498569.","tell me the imdb of the title Men in Black II":"The imdb of Men in Black II is tt0120912.","what is the imdb of No Strings Attached":"The imdb of No Strings Attached is tt1411238.","give the imdb for The Messenger":"The imdb of The Messenger is tt0790712.","give the imdb for Magnolia":"The imdb of Magnolia is tt0175880.","give the imdb for Transformers: Dark of the Moon":"The imdb of Transformers: Dark of the Moon is tt1399103.","tell me the imdb of the title Stuart Little":"The imdb of Stuart Little is tt0164912.","what is the imdb of Cars":"The imdb of Cars is tt0317219.","tell me the imdb of the title My Big Fat Greek Wedding":"The imdb of My Big Fat Greek Wedding is tt0259446.","what is the imdb of Space Jam":"The imdb of Space Jam is tt0117705.","give the imdb for The One":"The imdb of The One is tt0267804.","tell me the imdb of the title The Sweetest Thing":"The imdb of The Sweetest Thing is tt0253867.","give the imdb for Premium Rush":"The imdb of Premium Rush is tt1547234.","tell me the imdb of the title Practical Magic":"The imdb of Practical Magic is tt0120791.","what is the imdb of The Jacket":"The imdb of The Jacket is tt0366627.","what is the imdb of Star Wars":"The imdb of Star Wars is tt0076759.","tell me the imdb of the title Ondine":"The imdb of Ondine is tt1235796.","what is the imdb of Hot Rod":"The imdb of Hot Rod is tt0787475.","what is the imdb of Dangerous Liaisons":"The imdb of Dangerous Liaisons is tt0094947.","tell me the imdb of the title RoboCop":"The imdb of RoboCop is tt0093870.","what is the imdb of Marie Antoinette":"The imdb of Marie Antoinette is tt0422720.","tell me the imdb of the title Red":"The imdb of Red is tt1245526.","give the imdb for Poseidon":"The imdb of Poseidon is tt0409182.","give the imdb for Stranger Than Fiction":"The imdb of Stranger Than Fiction is tt0420223.","what is the imdb of Timeline":"The imdb of Timeline is tt0300556.","give the imdb for The Skeleton Key":"The imdb of The Skeleton Key is tt0397101.","give the imdb for Harry Potter and the Half-Blood Prince":"The imdb of Harry Potter and the Half-Blood Prince is tt0417741.","give the imdb for Raging Bull":"The imdb of Raging Bull is tt0081398.","what is the imdb of Willy Wonka &amp; the Chocolate Factory":"The imdb of Willy Wonka &amp; the Chocolate Factory is tt0067992.","tell me the imdb of the title The Dark Knight Rises":"The imdb of The Dark Knight Rises is tt1345836.","give the imdb for The City of Your Final Destination":"The imdb of The City of Your Final Destination is tt0896923.","tell me the imdb of the title Doom":"The imdb of Doom is tt0419706.","what is the imdb of Lee Daniels&#39; The Butler":"The imdb of Lee Daniels&#39; The Butler is tt1327773.","what is the imdb of Herb &amp; Dorothy":"The imdb of Herb &amp; Dorothy is tt1227929.","give the imdb for Quest for Camelot":"The imdb of Quest for Camelot is tt0120800.","tell me the imdb of the title Monsoon Wedding":"The imdb of Monsoon Wedding is tt0265343.","what is the imdb of Animal House":"The imdb of Animal House is tt0077975.","what is the imdb of Smokin&#39; Aces":"The imdb of Smokin&#39; Aces is tt0475394.","tell me the imdb of the title Cold Mountain":"The imdb of Cold Mountain is tt0159365.","what is the imdb of Max Payne":"The imdb of Max Payne is tt0467197.","tell me the imdb of the title Hellboy":"The imdb of Hellboy is tt0167190.","what is the imdb of The Rocky Horror Picture Show":"The imdb of The Rocky Horror Picture Show is tt0073629.","give the imdb for Easy A":"The imdb of Easy A is tt1282140.","what is the imdb of Hop":"The imdb of Hop is tt1411704.","what is the imdb of Requiem for a Dream":"The imdb of Requiem for a Dream is tt0180093.","tell me the imdb of the title Memento":"The imdb of Memento is tt0209144.","what is the imdb of Superman":"The imdb of Superman is tt0078346.","give the imdb for North Country":"The imdb of North Country is tt0395972.","tell me the imdb of the title Platoon":"The imdb of Platoon is tt0091763.","give the imdb for Escape from the Planet of the Apes":"The imdb of Escape from the Planet of the Apes is tt0067065.","tell me the imdb of the title The Runaways":"The imdb of The Runaways is tt1017451.","give the imdb for Fantastic Four: Rise of the Silver Surfer":"The imdb of Fantastic Four: Rise of the Silver Surfer is tt0486576.","tell me the imdb of the title The Wrestler":"The imdb of The Wrestler is tt1125849."}}},
{"id":"n-f4f9dad9","guard":[["has","imdb"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"imdb"}]]],"mem":{"table":{"for Lara Croft: Tomb Raider":"The imdb of Lara Croft: Tomb Raider is tt0146316.","for Whatever Works":"The imdb of Whatever Works is tt1178663.","for Valkyrie":"The imdb of Valkyrie is tt0985699.","of Remember Me":"The imdb of Remember Me is tt1403981.","of The Texas Chain Saw Massacre":"The imdb of The Texas Chain Saw Massacre is tt0072271.","for What to Expect When You&#39;re Expecting":"The imdb of What to Expect When You&#39;re Expecting is tt1586265.","of The Cell":"The imdb of The Cell is tt0209958.","of The Informant":"The imdb of The Informant! is tt1130080.","of the title Osmosis Jones":"The imdb of Osmosis Jones is tt0181739.","of the title Disturbing Behavior":"The imdb of Disturbing Behavior is tt0134619.","of the title Lost in Space":"The imdb of Lost in Space is tt0120738.","of the title Insidious":"The imdb of Insidious is tt1591095.","of the title Night at the Museum":"The imdb of Night at the Museum is tt0477347.","for Troop Beverly Hills":"The imdb of Troop Beverly Hills is tt0098519.","for Doubt":"The imdb of Doubt is tt0918927.","of The Prince of Egypt":"The imdb of The Prince of Egypt is tt0120794.","of American History X":"The imdb of American History X is tt0120586.","of the title Twister":"The imdb of Twister is tt0117998.","for The Fourth Kind":"The imdb of The Fourth Kind is tt1220198.","of the title Fargo":"The imdb of Fargo is tt0116282.","for The Beach":"The imdb of The Beach is tt0163978.","for Pain &amp; Gain":"The imdb of Pain &amp; Gain is tt1980209.","of the title High Plains Drifter":"The imdb of High Plains Drifter is tt0068699.","for Adam":"The imdb of Adam is tt1185836.","of All About Steve":"The imdb of All About Steve is tt0881891.","of Another Earth":"The imdb of Another Earth is tt1549572.","for High Anxiety":"The imdb of High Anxiety is tt0076141.","of The Prestige":"The imdb of The Prestige is tt0482571.","of Baby Mama":"The imdb of Baby Mama is tt0871426.","of the title Idlewild":"The imdb of Idlewild is tt0417225.","for Nine":"The imdb of Nine is tt0875034.","of the title The Painted Veil":"The imdb of The Painted Veil is tt0446755.","for Gettysburg":"The imdb of Gettysburg is tt0107007.","of The Others":"The imdb of The Others is tt0230600.","of The Hunger Games":"The imdb of The Hunger Games is tt1392170.","for Green Lantern":"The imdb of Green Lantern is tt1133985.","for Mirror Mirror":"The imdb of Mirror Mirror is tt1667353.","of the title Gamer":"The imdb of Gamer is tt1034032.","of the title Rush Hour 3":"The imdb of Rush Hour 3 is tt00293564.","of the title Contact":"The imdb of Contact is tt0118884.","of the title The Tale of Despereaux":"The imdb of The Tale of Despereaux is tt420238.","for 28 Days":"The imdb of 28 Days is tt0191754.","of Analyze This":"The imdb of Analyze This is tt0122933.","for Beauty and the Beast":"The imdb of Beauty and the Beast is tt0101414.","of The Devil&#39;s Rejects":"The imdb of The Devil&#39;s Rejects is tt0395584.","of the title Walking and Talking":"The imdb of Walking and Talking is tt0118113.","of the title Henry V":"The imdb of Henry V is tt0097499.","of Restless":"The imdb of Restless is tt1498569.","of the title Men in Black II":"The imdb of Men in Black II is tt0120912.","of No Strings Attached":"The imdb of No Strings Attached is tt1411238.","for The Messenger":"The imdb of The Messenger is tt0790712.","for Magnolia":"The imdb of Magnolia is tt0175880.","for Transformers: Dark of the Moon":"The imdb of Transformers: Dark of the Moon is tt1399103.","of the title Stuart Little":"The imdb of Stuart Little is tt0164912.","of Cars":"The imdb of Cars is tt0317219.","of the title My Big Fat Greek Wedding":"The imdb of My Big Fat Greek Wedding is tt0259446.","of Space Jam":"The imdb of Space Jam is tt0117705.","for The One":"The imdb of The One is tt0267804.","of the title The Sweetest Thing":"The imdb of The Sweetest Thing is tt0253867.","for Premium Rush":"The imdb of Premium Rush is tt1547234.","of the title Practical Magic":"The imdb of Practical Magic is tt0120791.","of The Jacket":"The imdb of The Jacket is tt0366627.","of Star Wars":"The imdb of Star Wars is tt0076759.","of the title Ondine":"The imdb of Ondine is tt1235796.","of Hot Rod":"The imdb of Hot Rod is tt0787475.","of Dangerous Liaisons":"The imdb of Dangerous Liaisons is tt0094947.","of the title RoboCop":"The imdb of RoboCop is tt0093870.","of Marie Antoinette":"The imdb of Marie Antoinette is tt0422720.","of the title Red":"The imdb of Red is tt1245526.","for Poseidon":"The imdb of Poseidon is tt0409182.","for Stranger Than Fiction":"The imdb of Stranger Than Fiction is tt0420223.","of Timeline":"The imdb of Timeline is tt0300556.","for The Skeleton Key":"The imdb of The Skeleton Key is tt0397101.","for Harry Potter and the Half-Blood Prince":"The imdb of Harry Potter and the Half-Blood Prince is tt0417741.","for Raging Bull":"The imdb of Raging Bull is tt0081398.","of Willy Wonka &amp; the Chocolate Factory":"The imdb of Willy Wonka &amp; the Chocolate Factory is tt0067992.","of the title The Dark Knight Rises":"The imdb of The Dark Knight Rises is tt1345836.","for The City of Your Final Destination":"The imdb of The City of Your Final Destination is tt0896923.","of the title Doom":"The imdb of Doom is tt0419706.","of Lee Daniels&#39; The Butler":"The imdb of Lee Daniels&#39; The Butler is tt1327773.","of Herb &amp; Dorothy":"The imdb of Herb &amp; Dorothy is tt1227929.","for Quest for Camelot":"The imdb of Quest for Camelot is tt0120800.","of the title Monsoon Wedding":"The imdb of Monsoon Wedding is tt0265343.","of Animal House":"The imdb of Animal House is tt0077975.","of Smokin&#39; Aces":"The imdb of Smokin&#39; Aces is tt0475394.","of the title Cold Mountain":"The imdb of Cold Mountain is tt0159365.","of Max Payne":"The imdb of Max Payne is tt0467197.","of the title Hellboy":"The imdb of Hellboy is tt0167190.","of The Rocky Horror Picture Show":"The imdb of The Rocky Horror Picture Show is tt0073629.","for Easy A":"The imdb of Easy A is tt1282140.","of Hop":"The imdb of Hop is tt1411704.","of Requiem for a Dream":"The imdb of Requiem for a Dream is tt0180093.","of the title Memento":"The imdb of Memento is tt0209144.","of Superman":"The imdb of Superman is tt0078346.","for North Country":"The imdb of North Country is tt0395972.","of the title Platoon":"The imdb of Platoon is tt0091763.","for Escape from the Planet of the Apes":"The imdb of Escape from the Planet of the Apes is tt0067065.","of the title The Runaways":"The imdb of The Runaways is tt1017451.","for Fantastic Four: Rise of the Silver Surfer":"The imdb of Fantastic Four: Rise of the Silver Surfer is tt0486576.","of the title The Wrestler":"The imdb of The Wrestler is tt1125849."}}},
{"id":"n-755e03ee","guard":[["hasAny",["about","aces","adam","american","amp","analyze","animal","another","antoinette","apes","attached","baby","beach","beast","behavior","beverly","black","bull","butler","camelot","cars","cell","chain","city","cold","contact","country","croft","dangerous","dark","days","delete","despereaux","devil39s","doom","doubt","dream","easy","expect","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","henry","high","hop","horror","hot","idlewild","informant","insidious","item number","jacket","jones","key","little","magic","magnolia","max","memento","messenger","mirror","museum","nine","nth","ondine","one","others","painted","platoon","poseidon","premium","prestige","prince","red","remember","restless","robocop","runaways","space","star","strip out","superman","sweetest","talking","timeline","twister","valkyrie","wedding","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}],["sense.lastWord"]]],"mem":null},
{"id":"n-896702ca","guard":[["hasAny",["about","aces","adam","american","amp","analyze","animal","another","antoinette","apes","attached","baby","beach","beast","behavior","beverly","black","bull","butler","camelot","cars","cell","chain","city","cold","contact","country","croft","dangerous","dark","days","despereaux","devil39s","doom","doubt","dream","easy","expect","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","henry","high","hop","horror","hot","idlewild","informant","insidious","item number","jacket","jones","key","little","magic","magnolia","max","memento","messenger","mirror","museum","nine","nth","ondine","one","others","painted","platoon","poseidon","premium","prestige","prince","red","remember","restless","robocop","runaways","separate by","space","split","split by","star","superman","sweetest","talking","timeline","twister","valkyrie","wedding","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}],["sense.lastWord"]]],"mem":null},
{"id":"n-ce15de6a","guard":[["hasAny",["about","aces","adam","american","amp","analyze","animal","another","antoinette","apes","attached","baby","beach","beast","behavior","beverly","black","bull","butler","camelot","cars","cell","chain","city","cold","contact","country","croft","dangerous","dark","days","despereaux","devil39s","doom","doubt","dream","easy","expect","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","henry","high","hop","horror","hot","idlewild","informant","insidious","item number","jacket","jones","key","little","magic","magnolia","max","memento","messenger","mirror","museum","nine","nth","ondine","one","others","painted","platoon","poseidon","premium","prestige","prince","red","remember","restless","robocop","runaways","separate by","space","split","split by","star","superman","sweetest","talking","timeline","twister","valkyrie","wedding","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}],["sense.lastWord"]]],"mem":null},
{"id":"n-d88e501a","guard":[["hasAny",["about","aces","adam","american","amp","analyze","animal","another","antoinette","apes","attached","baby","beach","beast","behavior","beverly","black","bull","butler","camelot","cars","cell","chain","city","cold","contact","country","croft","dangerous","dark","days","despereaux","devil39s","doom","doubt","dream","easy","expect","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","henry","high","hop","horror","hot","idlewild","informant","insidious","item number","jacket","jones","key","little","magic","magnolia","max","memento","messenger","mirror","museum","nine","nth","ondine","one","others","painted","platoon","poseidon","premium","prestige","prince","red","remember","restless","robocop","runaways","separate by","space","split","split by","star","superman","sweetest","talking","timeline","twister","valkyrie","wedding","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}],["sense.lastWord"]]],"mem":null},
{"id":"n-10a80366","guard":[["hasAny",["about","adam","american","amp","analyze","animal","another","antoinette","apes","attached","baby","beach","beast","behavior","beverly","black","bull","caesar cipher","camelot","cars","cell","chain","city","cold","contact","country","croft","dangerous","dark","despereaux","doom","doubt","dream","easy","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","henry","high","hop","horror","hot","idlewild","informant","insidious","item number","jacket","jones","key","little","magic","magnolia","max","memento","messenger","mirror","museum","nine","nth","ondine","one","others","painted","platoon","poseidon","premium","prestige","prince","red","remember","restless","robocop","rotate the letters","runaways","shift by","shift each letter","space","star","superman","sweetest","talking","timeline","twister","valkyrie","wedding","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}],["sense.howMany"]]],"mem":null},
{"id":"n-3159fca1","guard":[["hasAny",["aces","adam","analyze","animal","another","antoinette","apes","baby","beach","beast","behavior","beverly","bull","camelot","cars","cell","city","cold","contact","country","croft","dangerous","dark","despereaux","devil39s","doom","doubt","dream","easy","expect","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","high","horror","idlewild","informant","insidious","item number","jacket","jones","little","lost","magic","magnolia","memento","messenger","mirror","monsoon","museum","nine","nth","ondine","others","painted","platoon","poseidon","premium","prestige","prince","remember","restless","robocop","runaways","shortest","shortest one","shortest word","star","superman","sweetest","talking","timeline","twister","valkyrie","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-6d567907","guard":[["hasAny",["aces","adam","analyze","animal","another","antoinette","apes","baby","beach","beast","behavior","beverly","bull","camelot","cars","cell","city","cold","contact","country","croft","dangerous","dark","despereaux","devil39s","doom","doubt","dream","easy","expect","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","high","horror","idlewild","informant","insidious","item number","jacket","jones","little","lost","magic","magnolia","memento","messenger","mirror","monsoon","museum","nine","nth","ondine","others","painted","platoon","poseidon","premium","prestige","prince","remember","restless","robocop","runaways","shortest","shortest one","shortest word","star","superman","sweetest","talking","timeline","twister","valkyrie","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.and",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-3cc0b688","guard":[["hasAny",["aces","adam","analyze","animal","another","antoinette","apes","baby","beach","beast","behavior","beverly","bull","camelot","cars","cell","city","class name","cold","contact","country","croft","dangerous","dark","despereaux","devil39s","doom","doubt","dream","easy","expect","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","high","horror","idlewild","informant","insidious","item number","jacket","jones","little","lost","magic","magnolia","memento","messenger","mirror","monsoon","museum","nine","nth","ondine","others","painted","pascal case","pascalcase","platoon","poseidon","premium","prestige","prince","remember","restless","robocop","runaways","shortest","shortest one","shortest word","star","superman","sweetest","talking","timeline","twister","upper camel case","valkyrie","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]],"mem":null},
{"id":"n-5e051471","guard":[["hasAny",["aces","adam","analyze","animal","another","antoinette","apes","baby","beach","beast","behavior","beverly","bull","camelot","cars","cell","city","cold","contact","country","croft","dangerous","dark","despereaux","devil39s","doom","doubt","dream","easy","expect","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","high","horror","idlewild","informant","insidious","item number","jacket","jones","little","lost","magic","magnolia","memento","messenger","mirror","monsoon","museum","nine","nth","ondine","others","painted","platoon","poseidon","premium","prestige","prince","remember","restless","robocop","runaways","shortest","shortest one","shortest word","star","superman","sweetest","talking","timeline","twister","valkyrie","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-de2a5938","guard":[["hasAny",["aces","adam","analyze","animal","another","antoinette","apes","baby","beach","beast","behavior","beverly","bull","camelot","cars","cell","city","cold","contact","country","croft","dangerous","dark","despereaux","devil39s","doom","doubt","dream","easy","expect","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","high","horror","idlewild","informant","insidious","invert case","item number","jacket","jones","little","lost","magic","magnolia","memento","messenger","mirror","monsoon","museum","nine","nth","ondine","others","painted","platoon","poseidon","premium","prestige","prince","remember","restless","robocop","runaways","shortest","shortest one","shortest word","star","superman","swap case","sweetest","talking","timeline","toggle case","twister","valkyrie","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]],"mem":null},
{"id":"n-31c8d4b3","guard":[["hasAny",["aces","adam","analyze","animal","another","antoinette","apes","baby","beach","beast","behavior","beverly","bull","camelot","cars","cell","city","cold","contact","country","croft","dangerous","dark","despereaux","devil39s","doom","doubt","dream","easy","expect","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","high","horror","idlewild","informant","insidious","invert case","item number","jacket","jones","little","lost","magic","magnolia","memento","messenger","mirror","monsoon","museum","nine","nth","ondine","others","painted","platoon","poseidon","premium","prestige","prince","remember","restless","robocop","runaways","shortest","shortest one","shortest word","star","superman","swap case","sweetest","talking","timeline","toggle case","twister","valkyrie","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-33f58b0e","guard":[["hasAny",["aces","adam","analyze","animal","another","antoinette","apes","baby","beach","beast","behavior","beverly","bull","camelot","cars","cell","city","cold","contact","country","croft","dangerous","dark","despereaux","devil39s","doom","doubt","dream","each word","easy","expect","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","high","horror","idlewild","informant","insidious","item number","jacket","jones","little","lost","magic","magnolia","memento","messenger","mirror","monsoon","museum","nine","nth","ondine","others","painted","platoon","poseidon","premium","prestige","prince","remember","restless","robocop","runaways","shortest","shortest one","shortest word","split into words","star","superman","sweetest","talking","timeline","twister","valkyrie","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]]],"mem":null},
{"id":"n-5c47809c","guard":[["hasAny",["aces","adam","analyze","animal","another","antoinette","apes","baby","beach","beast","behavior","beverly","bull","camelot","cars","cell","city","cold","contact","country","croft","dangerous","dark","despereaux","devil39s","doom","doubt","dream","easy","expect","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","high","horror","idlewild","informant","insidious","item number","jacket","jones","little","lost","lower case","lowercase","magic","magnolia","memento","messenger","mirror","monsoon","museum","nine","nth","ondine","others","painted","platoon","poseidon","premium","prestige","prince","remember","restless","robocop","runaways","shortest","shortest one","shortest word","small letters","star","superman","sweetest","talking","timeline","twister","valkyrie","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-98958f3e","guard":[["hasAny",["aces","adam","analyze","animal","another","antoinette","apes","baby","beach","beast","behavior","beverly","bull","camelot","capital letters","capitals","cars","cell","city","cold","contact","country","croft","dangerous","dark","despereaux","devil39s","doom","doubt","dream","easy","expect","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","high","horror","idlewild","informant","insidious","item number","jacket","jones","little","lost","magic","magnolia","memento","messenger","mirror","monsoon","museum","nine","nth","ondine","others","painted","platoon","poseidon","premium","prestige","prince","remember","restless","robocop","runaways","shortest","shortest one","shortest word","star","superman","sweetest","talking","timeline","twister","upper case","uppercase","valkyrie","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-d32d9f72","guard":[["hasAny",["aces","adam","analyze","animal","another","antoinette","apes","baby","beach","beast","behavior","beverly","bull","camelot","capitalise","capitalize","capitalize each word","cars","cell","city","cold","contact","country","croft","dangerous","dark","despereaux","devil39s","doom","doubt","dream","easy","expect","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","high","horror","idlewild","informant","insidious","item number","jacket","jones","little","lost","magic","magnolia","memento","messenger","mirror","monsoon","museum","nine","nth","ondine","others","painted","platoon","poseidon","premium","prestige","prince","remember","restless","robocop","runaways","shortest","shortest one","shortest word","star","superman","sweetest","talking","timeline","twister","valkyrie","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-e333c446","guard":[["hasAny",["aces","adam","analyze","animal","another","antoinette","apes","baby","beach","beast","behavior","beverly","bull","camelot","cars","cell","city","cold","contact","country","croft","dangerous","dark","despereaux","devil39s","doom","doubt","dream","each word","easy","expect","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","high","horror","idlewild","informant","insidious","item number","jacket","jones","little","lost","magic","magnolia","memento","messenger","mirror","monsoon","museum","nine","nth","ondine","others","painted","platoon","poseidon","premium","prestige","prince","remember","restless","robocop","runaways","shortest","shortest one","shortest word","split into words","star","superman","sweetest","talking","timeline","twister","valkyrie","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]]],"mem":null},
{"id":"n-caf2769b","guard":[["hasAny",["aces","adam","analyze","animal","another","antoinette","apes","baby","beach","beast","behavior","beverly","bull","camelot","cars","cell","city","cold","contact","country","croft","dangerous","dark","despereaux","devil39s","doom","doubt","dream","easy","expect","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","high","horror","idlewild","informant","insidious","item number","jacket","jones","little","lost","magic","magnolia","memento","messenger","mirror","monsoon","museum","nine","normalise","normalize","nth","ondine","others","painted","platoon","poseidon","premium","prestige","prince","remember","restless","robocop","runaways","shortest","shortest one","shortest word","simplify the text","star","superman","sweetest","talking","timeline","twister","valkyrie","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-fdc0ba11","guard":[["hasAny",["adam","analyze","animal","another","antoinette","apes","baby","beach","beast","behavior","beverly","bull","caesar cipher","camelot","cars","cell","city","cold","contact","country","croft","dangerous","dark","despereaux","doom","doubt","dream","easy","fantastic","fargo","fiction","fourth","gamer","games","gettysburg","green","hellboy","high","horror","idlewild","informant","insidious","item number","jacket","jones","little","lost","magic","magnolia","memento","messenger","mirror","monsoon","museum","nine","nth","ondine","others","painted","platoon","poseidon","premium","prestige","prince","remember","restless","robocop","rotate the letters","runaways","shift by","shift each letter","shortest","shortest one","shortest word","star","superman","sweetest","talking","timeline","twister","valkyrie","whatever","wrestler"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-bf727499","guard":[["hasAny",["about","aces","american","analyze","animal","another","antoinette","attached","baby","butler","cars","cell","chain","chocolate","dangerous","devil39s","dorothy","dream","egypt","games","hop","horror","hot","informant","item number","jacket","max","nth","others","prestige","remember","restless","space","star","superman","timeline","title"]],["has","imdb"],["not",["colon"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-e0a0959d","guard":[["hasAny",["about","aces","american","analyze","animal","another","antoinette","attached","baby","butler","cars","cell","chain","chocolate","dangerous","devil39s","dorothy","dream","egypt","games","hop","horror","hot","informant","item number","jacket","max","nth","others","prestige","remember","restless","space","star","superman","timeline","title"]],["has","imdb"],["not",["colon"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-358749e5","guard":[["hasAny",["about","aces","american","analyze","animal","another","antoinette","attached","baby","butler","cars","cell","chain","chocolate","class name","dangerous","devil39s","dorothy","dream","egypt","games","hop","horror","hot","informant","item number","jacket","max","nth","others","pascal case","pascalcase","prestige","remember","restless","space","star","superman","timeline","title","upper camel case"]],["has","imdb"],["not",["colon"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]],"mem":null},
{"id":"n-8eb59e7a","guard":[["hasAny",["about","aces","american","analyze","animal","another","antoinette","attached","baby","butler","cars","cell","chain","chocolate","dangerous","devil39s","dorothy","dream","egypt","games","hop","horror","hot","informant","invert case","item number","jacket","max","nth","others","prestige","remember","restless","space","star","superman","swap case","timeline","title","toggle case"]],["has","imdb"],["not",["colon"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]],"mem":null},
{"id":"n-b8fe8896","guard":[["hasAny",["about","aces","american","analyze","animal","another","antoinette","attached","baby","butler","cars","cell","chain","chocolate","dangerous","devil39s","dorothy","dream","egypt","games","hop","horror","hot","informant","item number","jacket","max","nth","others","prestige","remember","restless","space","star","superman","timeline","title"]],["has","imdb"],["not",["colon"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-33b99dc3","guard":[["hasAny",["about","aces","american","analyze","animal","another","antoinette","attached","baby","butler","capital letters","capitals","cars","cell","chain","chocolate","dangerous","devil39s","dorothy","dream","egypt","games","hop","horror","hot","informant","item number","jacket","max","nth","others","prestige","remember","restless","space","star","superman","timeline","title","upper case","uppercase"]],["has","imdb"],["not",["colon"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-3d3f5406","guard":[["hasAny",["about","aces","american","analyze","animal","another","antoinette","attached","baby","butler","cars","cell","chain","chocolate","dangerous","devil39s","dorothy","dream","egypt","games","hop","horror","hot","informant","invert case","item number","jacket","max","nth","others","prestige","remember","restless","space","star","superman","swap case","timeline","title","toggle case"]],["has","imdb"],["not",["colon"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-4f418165","guard":[["hasAny",["about","aces","american","analyze","animal","another","antoinette","attached","baby","butler","capitalise","capitalize","capitalize each word","cars","cell","chain","chocolate","dangerous","devil39s","dorothy","dream","egypt","games","hop","horror","hot","informant","item number","jacket","max","nth","others","prestige","remember","restless","space","star","superman","timeline","title"]],["has","imdb"],["not",["colon"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-7cb7438d","guard":[["hasAny",["about","aces","american","analyze","animal","another","antoinette","attached","baby","butler","cars","cell","chain","chocolate","dangerous","devil39s","dorothy","dream","each word","egypt","games","hop","horror","hot","informant","item number","jacket","max","nth","others","prestige","remember","restless","space","split into words","star","superman","timeline","title"]],["has","imdb"],["not",["colon"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]]],"mem":null},
{"id":"n-8368fe1b","guard":[["hasAny",["about","aces","american","analyze","animal","another","antoinette","attached","baby","butler","cars","cell","chain","chocolate","dangerous","devil39s","dorothy","dream","egypt","games","hop","horror","hot","informant","item number","jacket","lower case","lowercase","max","nth","others","prestige","remember","restless","small letters","space","star","superman","timeline","title"]],["has","imdb"],["not",["colon"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-8ab16eff","guard":[["hasAny",["about","aces","american","analyze","animal","another","antoinette","attached","baby","butler","cars","cell","chain","chocolate","dangerous","devil39s","dorothy","dream","each word","egypt","games","hop","horror","hot","informant","item number","jacket","max","nth","others","prestige","remember","restless","space","split into words","star","superman","timeline","title"]],["has","imdb"],["not",["colon"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]]],"mem":null},
{"id":"n-25c7efca","guard":[["hasAny",["about","aces","american","analyze","animal","another","antoinette","attached","baby","butler","cars","cell","chain","chocolate","dangerous","devil39s","dorothy","dream","egypt","games","hop","horror","hot","informant","item number","jacket","max","normalise","normalize","nth","others","prestige","remember","restless","simplify the text","space","star","superman","timeline","title"]],["has","imdb"],["not",["colon"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-45f6b677","guard":[["hasAny",["about","aces","american","analyze","animal","another","antoinette","attached","baby","butler","cars","cell","chain","chocolate","dangerous","devil39s","dorothy","dream","egypt","games","hop","horror","hot","informant","item number","jacket","max","normalise","normalize","nth","others","prestige","remember","restless","simplify the text","space","star","superman","timeline","title"]],["has","imdb"],["not",["colon"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-60d91548","guard":[["hasAny",["about","american","analyze","animal","another","antoinette","attached","baby","behavior","black","caesar cipher","cars","cell","chain","chocolate","cold","contact","dangerous","despereaux","doom","dorothy","dream","drifter","egypt","fargo","gamer","games","hellboy","henry","hop","horror","hot","idlewild","informant","insidious","item number","jacket","jones","knight","little","magic","max","memento","museum","nth","ondine","others","painted","platoon","prestige","red","remember","restless","robocop","rotate the letters","runaways","shift by","shift each letter","space","star","superman","sweetest","talking","timeline","twister","wedding","wrestler"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-36828990","guard":[["hasAny",["about","aces","american","amp","analyze","animal","another","antoinette","attached","baby","butler","cars","cell","chain","dangerous","devil39s","dream","egypt","games","hop","horror","hot","informant","item number","jacket","jam","max","nth","others","prestige","remember","restless","star","superman","timeline"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-17256225","guard":[["hasAny",["about","aces","american","amp","analyze","animal","another","antoinette","attached","baby","butler","cars","cell","chain","dangerous","devil39s","dream","egypt","games","hop","horror","hot","informant","item number","jacket","jam","lower case","lowercase","max","nth","others","prestige","remember","restless","small letters","star","superman","timeline"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["sense.after",{"lit":"of"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-a5f32045","guard":[["has","imdb"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the imdb of Remember Me":"The imdb of Remember Me is tt1403981.","the imdb of The Texas Chain Saw Massacre":"The imdb of The Texas Chain Saw Massacre is tt0072271.","the imdb of The Cell":"The imdb of The Cell is tt0209958.","the imdb of The Informant":"The imdb of The Informant! is tt1130080.","the imdb of The Prince of Egypt":"The imdb of The Prince of Egypt is tt0120794.","the imdb of American History X":"The imdb of American History X is tt0120586.","the imdb of All About Steve":"The imdb of All About Steve is tt0881891.","the imdb of Another Earth":"The imdb of Another Earth is tt1549572.","the imdb of The Prestige":"The imdb of The Prestige is tt0482571.","the imdb of Baby Mama":"The imdb of Baby Mama is tt0871426.","the imdb of The Others":"The imdb of The Others is tt0230600.","the imdb of The Hunger Games":"The imdb of The Hunger Games is tt1392170.","the imdb of Analyze This":"The imdb of Analyze This is tt0122933.","the imdb of The Devil&#39;s Rejects":"The imdb of The Devil&#39;s Rejects is tt0395584.","the imdb of Restless":"The imdb of Restless is tt1498569.","the imdb of No Strings Attached":"The imdb of No Strings Attached is tt1411238.","the imdb of Cars":"The imdb of Cars is tt0317219.","the imdb of Space Jam":"The imdb of Space Jam is tt0117705.","the imdb of The Jacket":"The imdb of The Jacket is tt0366627.","the imdb of Star Wars":"The imdb of Star Wars is tt0076759.","the imdb of Hot Rod":"The imdb of Hot Rod is tt0787475.","the imdb of Dangerous Liaisons":"The imdb of Dangerous Liaisons is tt0094947.","the imdb of Marie Antoinette":"The imdb of Marie Antoinette is tt0422720.","the imdb of Timeline":"The imdb of Timeline is tt0300556.","the imdb of Willy Wonka &amp; the Chocolate Factory":"The imdb of Willy Wonka &amp; the Chocolate Factory is tt0067992.","the imdb of Lee Daniels&#39; The Butler":"The imdb of Lee Daniels&#39; The Butler is tt1327773.","the imdb of Herb &amp; Dorothy":"The imdb of Herb &amp; Dorothy is tt1227929.","the imdb of Animal House":"The imdb of Animal House is tt0077975.","the imdb of Smokin&#39; Aces":"The imdb of Smokin&#39; Aces is tt0475394.","the imdb of Max Payne":"The imdb of Max Payne is tt0467197.","the imdb of The Rocky Horror Picture Show":"The imdb of The Rocky Horror Picture Show is tt0073629.","the imdb of Hop":"The imdb of Hop is tt1411704.","the imdb of Requiem for a Dream":"The imdb of Requiem for a Dream is tt0180093.","the imdb of Superman":"The imdb of Superman is tt0078346."}}},
{"id":"n-34cbbba2","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","city","country","croft","days","doubt","easy","expect","fantastic","fiction","fourth","gain","gettysburg","green","halfblood","item number","key","magnolia","messenger","mirror","moon","nine","nth","one","poseidon","premium","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-f9dd27a4","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","city","country","croft","days","doubt","easy","expect","fantastic","fiction","fourth","gain","gettysburg","green","halfblood","item number","key","magnolia","messenger","mirror","moon","nine","nth","one","poseidon","premium","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.and",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-75aea221","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","city","country","croft","days","doubt","easy","expect","fantastic","fiction","fourth","gain","gettysburg","green","halfblood","item number","key","magnolia","messenger","mirror","moon","nine","nth","one","poseidon","premium","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-82de6f06","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","city","country","croft","days","doubt","easy","expect","fantastic","fiction","fourth","gain","gettysburg","green","halfblood","invert case","item number","key","magnolia","messenger","mirror","moon","nine","nth","one","poseidon","premium","swap case","toggle case","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-af9b7606","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","city","class name","country","croft","days","doubt","easy","expect","fantastic","fiction","fourth","gain","gettysburg","green","halfblood","item number","key","magnolia","messenger","mirror","moon","nine","nth","one","pascal case","pascalcase","poseidon","premium","upper camel case","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]],"mem":null},
{"id":"n-bbf02b93","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","city","class name","country","croft","days","doubt","easy","expect","fantastic","fiction","fourth","gain","gettysburg","green","halfblood","item number","key","magnolia","messenger","mirror","moon","nine","nth","one","pascal case","pascalcase","poseidon","premium","upper camel case","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-cc64d01d","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","city","country","croft","days","doubt","easy","expect","fantastic","fiction","fourth","gain","gettysburg","green","halfblood","invert case","item number","key","magnolia","messenger","mirror","moon","nine","nth","one","poseidon","premium","swap case","toggle case","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]],"mem":null},
{"id":"n-07060d5d","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","city","country","croft","days","doubt","each word","easy","expect","fantastic","fiction","fourth","gain","gettysburg","green","halfblood","item number","key","magnolia","messenger","mirror","moon","nine","nth","one","poseidon","premium","split into words","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]]],"mem":null},
{"id":"n-10809155","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","city","country","croft","days","doubt","each word","easy","expect","fantastic","fiction","fourth","gain","gettysburg","green","halfblood","item number","key","magnolia","messenger","mirror","moon","nine","nth","one","poseidon","premium","split into words","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]]],"mem":null},
{"id":"n-1d3c29e9","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","city","country","croft","days","doubt","easy","expect","fantastic","fiction","fourth","gain","gettysburg","green","halfblood","invert case","item number","key","magnolia","messenger","mirror","moon","nine","nth","one","poseidon","premium","swap case","toggle case","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-4f9ec1b0","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","capitalise","capitalize","capitalize each word","city","country","croft","days","doubt","easy","expect","fantastic","fiction","fourth","gain","gettysburg","green","halfblood","item number","key","magnolia","messenger","mirror","moon","nine","nth","one","poseidon","premium","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-66e5d574","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","capital letters","capitals","city","country","croft","days","doubt","easy","expect","fantastic","fiction","fourth","gain","gettysburg","green","halfblood","item number","key","magnolia","messenger","mirror","moon","nine","nth","one","poseidon","premium","upper case","uppercase","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-7f1a7727","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","city","country","croft","days","doubt","each word","easy","expect","fantastic","fiction","fourth","gain","gettysburg","green","halfblood","item number","key","magnolia","messenger","mirror","moon","nine","nth","one","poseidon","premium","split into words","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-8eb2969c","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","city","country","croft","days","doubt","easy","expect","fantastic","fiction","fourth","gain","gettysburg","green","halfblood","item number","key","lower case","lowercase","magnolia","messenger","mirror","moon","nine","nth","one","poseidon","premium","small letters","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-8fc7a791","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","city","country","croft","days","doubt","each word","easy","expect","fantastic","fiction","fourth","gain","gettysburg","green","halfblood","item number","key","magnolia","messenger","mirror","moon","nine","nth","one","poseidon","premium","split into words","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-6735d25d","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","city","country","croft","days","doubt","easy","expect","fantastic","fiction","fourth","gain","gettysburg","green","halfblood","item number","key","magnolia","messenger","mirror","moon","nine","normalise","normalize","nth","one","poseidon","premium","simplify the text","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-ab547b6a","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","caesar cipher","camelot","city","country","croft","doubt","easy","fantastic","fiction","fourth","gain","gettysburg","green","halfblood","item number","key","magnolia","messenger","mirror","moon","nine","nth","one","poseidon","premium","rotate the letters","shift by","shift each letter","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-61bbf61e","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","city","country","croft","dark","doubt","easy","element","expect","fantastic","fiction","fourth","gettysburg","green","halfblood","item number","magnolia","messenger","mirror","nine","nth","poseidon","position","premium","shortest","shortest one","shortest word","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"for"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-dfa4fdff","guard":[["hasAny",["adam","anxiety","apes","beach","beast","beverly","bull","camelot","city","country","croft","dark","doubt","easy","element","expect","fantastic","fiction","fourth","gettysburg","green","halfblood","item number","lower case","lowercase","magnolia","messenger","mirror","nine","nth","poseidon","position","premium","shortest","shortest one","shortest word","small letters","valkyrie","whatever"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.lower",["sense.after",{"lit":"for"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-893cc5fa","guard":[["hasAny",["adam","cars","contact","doom","doubt","fargo","gamer","gettysburg","hellboy","idlewild","insidious","item number","magnolia","memento","nine","nth","ondine","platoon","poseidon","restless","robocop","shortest","shortest one","shortest word","superman","timeline","twister","valkyrie"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-d2df4a03","guard":[["hasAny",["adam","cars","contact","doom","doubt","fargo","gamer","gettysburg","hellboy","idlewild","insidious","item number","magnolia","memento","nine","nth","ondine","platoon","poseidon","restless","robocop","shortest","shortest one","shortest word","superman","timeline","twister","valkyrie"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.subject"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-84a57757","guard":[["hasAny",["aces","analyze","animal","another","antoinette","baby","cars","cell","dangerous","devil39s","dream","egypt","games","horror","informant","item number","jacket","nth","others","prestige","remember","restless","shortest","shortest one","shortest word","star","superman","timeline"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-6e0459e1","guard":[["hasAny",["aces","analyze","animal","another","antoinette","baby","cars","cell","dangerous","devil39s","dream","egypt","games","horror","informant","item number","jacket","lower case","lowercase","nth","others","prestige","remember","restless","shortest","shortest one","shortest word","small letters","star","superman","timeline"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.lower",["sense.after",{"lit":"of"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-be0f2f87","guard":[["hasAny",["cars","contact","doom","fargo","gamer","hellboy","hop","idlewild","insidious","item number","memento","nth","ondine","platoon","red","restless","robocop","superman","timeline","twister"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-7d5e3317","guard":[["hasAny",["adam","baby","cars","cell","days","easy","gain","hop","hot","item number","longest","longest one","longest word","nine","nth","one","star"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-8fa2fca7","guard":[["hasAny",["adam","baby","cars","cell","days","easy","gain","hop","hot","item number","longest","longest one","longest word","nine","nth","one","star"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["render.and",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-7e68d442","guard":[["hasAny",["adam","baby","cars","cell","class name","days","easy","gain","hop","hot","item number","longest","longest one","longest word","nine","nth","one","pascal case","pascalcase","star","upper camel case"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]],"mem":null},
{"id":"n-8e021a1c","guard":[["hasAny",["adam","baby","cars","cell","days","easy","gain","hop","hot","item number","longest","longest one","longest word","nine","nth","one","star"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-99e9e699","guard":[["hasAny",["adam","baby","cars","cell","days","easy","gain","hop","hot","invert case","item number","longest","longest one","longest word","nine","nth","one","star","swap case","toggle case"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]],"mem":null},
{"id":"n-1250ad85","guard":[["hasAny",["adam","baby","cars","cell","days","each word","easy","gain","hop","hot","item number","longest","longest one","longest word","nine","nth","one","split into words","star"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]]],"mem":null},
{"id":"n-3735183f","guard":[["hasAny",["adam","baby","cars","cell","days","easy","gain","hop","hot","invert case","item number","longest","longest one","longest word","nine","nth","one","star","swap case","toggle case"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-814dfd0a","guard":[["hasAny",["adam","baby","capital letters","capitals","cars","cell","days","easy","gain","hop","hot","item number","longest","longest one","longest word","nine","nth","one","star","upper case","uppercase"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-96338fa5","guard":[["hasAny",["adam","baby","cars","cell","days","easy","gain","hop","hot","item number","longest","longest one","longest word","lower case","lowercase","nine","nth","one","small letters","star"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-b0364aea","guard":[["hasAny",["adam","baby","cars","cell","days","each word","easy","gain","hop","hot","item number","longest","longest one","longest word","nine","nth","one","split into words","star"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]]]],"mem":null},
{"id":"n-cde5c6dc","guard":[["hasAny",["adam","baby","capitalise","capitalize","capitalize each word","cars","cell","days","easy","gain","hop","hot","item number","longest","longest one","longest word","nine","nth","one","star"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-b1554ff8","guard":[["hasAny",["adam","baby","cars","cell","days","easy","gain","hop","hot","item number","longest","longest one","longest word","nine","normalise","normalize","nth","one","simplify the text","star"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-c388b80e","guard":[["hasAny",["adam","baby","cars","cell","days","easy","gain","hop","hot","item number","longest","longest one","longest word","nine","normalise","normalize","nth","one","simplify the text","star"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-b41a6a3b","guard":[["hasAny",["adam","baby","caesar cipher","cars","cell","easy","gain","hop","hot","item number","longest","longest one","longest word","nine","nth","one","rotate the letters","shift by","shift each letter","star"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-e27043ac","guard":[["hasAny",["imdb","item number","nth","position"]]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}],["sense.howMany"]]],"mem":null},
{"id":"n-1f0f159d","guard":[["hasAny",["imdb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-b736b057","guard":[["hasAny",["first n","imdb","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.takeStrs",["sense.content"],["sense.howMany"]]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-c3b8738c","guard":[["hasAny",["first n","imdb","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.takeStrs",["sense.content"],["sense.howMany"]]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-be77fbc1","guard":[["hasAny",["adam","cars","egypt","hop","item number","longest","longest one","longest word","nine","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-0271b80e","guard":[["hasAny",["butler","days","expect","item number","nth","position","separate by","split","split by"]],["has","imdb"]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}],["sense.numeral"]]],"mem":null},
{"id":"n-241958d8","guard":[["hasAny",["butler","days","expect","item number","nth","position","separate by","split","split by"]],["has","imdb"]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}],["sense.numeral"]]],"mem":null},
{"id":"n-4e7515aa","guard":[["hasAny",["delete","element","imdb","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}],["sense.roman"]]],"mem":null},
{"id":"n-4feaabae","guard":[["hasAny",["butler","days","delete","expect","item number","nth","position","remove","strip out","without"]],["has","imdb"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}],["sense.numeral"]]],"mem":null},
{"id":"n-514d7468","guard":[["hasAny",["butler","days","expect","item number","nth","position","separate by","split","split by"]],["has","imdb"]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}],["sense.numeral"]]],"mem":null},
{"id":"n-beb4e900","guard":[["hasAny",["delete","element","imdb","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}],["sense.unit"]]],"mem":null},
{"id":"n-704a618d","guard":[["hasAny",["hop","item number","nth","red","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-071593d9","guard":[["hasAny",["beach","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0163978."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-07a69c59","guard":[["hasAny",["fourth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1220198."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-0b978b9e","guard":[["hasAny",["fargo","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0116282."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-0de2459e","guard":[["hasAny",["camelot","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0120800."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-102bc7ef","guard":[["hasAny",["fiction","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0420223."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-11009ab3","guard":[["hasAny",["magnolia","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0175880."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-13b759cc","guard":[["hasAny",["egypt","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0120794."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-13c9fd62","guard":[["hasAny",["gain","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1980209."]},["aggregate.longest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-15436a33","guard":[["hasAny",["gettysburg","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0107007."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-15a882d3","guard":[["hasAny",["bull","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0081398."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-1998d2d5","guard":[["hasAny",["apes","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0067065."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-1a998600","guard":[["hasAny",["shortest","shortest one","shortest word","superman"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0078346."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-1c728393","guard":[["hasAny",["easy","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1282140."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-1d1fb3c8","guard":[["hasAny",["insidious","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1591095."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-2105e25b","guard":[["hasAny",["cell","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0209958."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-219df17c","guard":[["hasAny",["shortest","shortest one","shortest word","whatever"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1178663."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-27eb6a7b","guard":[["hasAny",["nine","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0875034."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-29b734cc","guard":[["hasAny",["beverly","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0098519."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-2daf58f9","guard":[["hasAny",["informant","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1130080."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-31490acd","guard":[["hasAny",["prestige","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0482571."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-34f2334f","guard":[["hasAny",["doom","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0419706."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-3570a7e9","guard":[["hasAny",["adam","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1185836."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-3a46bbe3","guard":[["hasAny",["horror","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0073629."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-3e7c7957","guard":[["hasAny",["aces","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0475394."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-417b7b36","guard":[["hasAny",["contact","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0118884."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-4426d618","guard":[["hasAny",["poseidon","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0409182."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-44df0405","guard":[["hasAny",["baby","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0871426."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-450fc888","guard":[["hasAny",["despereaux","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt420238."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-47e940c8","guard":[["hasAny",["hot","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0787475."]},["aggregate.longest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-4cf8db61","guard":[["hasAny",["magic","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0120791."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-4df12cdd","guard":[["hasAny",["mirror","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1667353."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-4f994860","guard":[["hasAny",["drifter","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0068699."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-5542a6fd","guard":[["hasAny",["museum","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0477347."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-564b9350","guard":[["hasAny",["shortest","shortest one","shortest word","wrestler"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1125849."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-57785f57","guard":[["hasAny",["remember","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1403981."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-58aed2d5","guard":[["hasAny",["devil39s","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0395584."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-5c01f4ba","guard":[["hasAny",["ondine","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1235796."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-5e332aca","guard":[["hasAny",["shortest","shortest one","shortest word","twister"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0117998."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-5ed66975","guard":[["hasAny",["days","longest","longest one","longest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0191754."]},["aggregate.longest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-5ffd4121","guard":[["hasAny",["platoon","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0091763."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-62bcf1c1","guard":[["hasAny",["fantastic","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0486576."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-66f2362d","guard":[["hasAny",["gamer","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1034032."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-6748aed5","guard":[["hasAny",["doubt","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0918927."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-73504843","guard":[["hasAny",["runaways","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1017451."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-7cd3eb61","guard":[["hasAny",["little","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0164912."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-7fb8884c","guard":[["hasAny",["restless","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1498569."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-8682df4a","guard":[["hasAny",["hop","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1411704."]},["aggregate.longest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-8806bd54","guard":[["hasAny",["painted","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0446755."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-89bbddcd","guard":[["hasAny",["country","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0395972."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-8aacec25","guard":[["hasAny",["monsoon","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0265343."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-8c3ba71f","guard":[["hasAny",["memento","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0209144."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-8f6d80bd","guard":[["hasAny",["green","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1133985."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-8fa8cbea","guard":[["hasAny",["hellboy","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0167190."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-9d19726d","guard":[["hasAny",["halfblood","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0417741."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-aa2d9582","guard":[["hasAny",["antoinette","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0422720."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-aa8472bb","guard":[["hasAny",["moon","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1399103."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-ae6d9b2f","guard":[["hasAny",["animal","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0077975."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-b032eeaa","guard":[["hasAny",["behavior","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0134619."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-b0bb2ea3","guard":[["hasAny",["premium","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1547234."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-b6759c8a","guard":[["hasAny",["shortest","shortest one","shortest word","timeline"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0300556."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-b72e62f8","guard":[["hasAny",["knight","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1345836."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-bacf1cef","guard":[["hasAny",["games","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1392170."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-bf252a82","guard":[["hasAny",["cold","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0159365."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-c155f581","guard":[["hasAny",["robocop","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0093870."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-c2aadb2a","guard":[["hasAny",["idlewild","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0417225."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-c6b3ee93","guard":[["hasAny",["shortest","shortest one","shortest word","star"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0076759."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-cdb13362","guard":[["hasAny",["shortest","shortest one","shortest word","sweetest"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0253867."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-d240a911","guard":[["hasAny",["jacket","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0366627."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-d7e50746","guard":[["hasAny",["beast","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0101414."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-d9b92b71","guard":[["hasAny",["others","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0230600."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-e057be6d","guard":[["hasAny",["shortest","shortest one","shortest word","talking"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0118113."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-e277c5e6","guard":[["hasAny",["jones","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0181739."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-e57d907d","guard":[["has","key"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0397101."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-e732f8dd","guard":[["hasAny",["shortest","shortest one","shortest word","valkyrie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0985699."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-e892447b","guard":[["hasAny",["longest","longest one","longest word","one"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0267804."]},["aggregate.longest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-ed5ca378","guard":[["hasAny",["analyze","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0122933."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-eea4d3b1","guard":[["hasAny",["anxiety","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0076141."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-f0929018","guard":[["hasAny",["messenger","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0790712."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-f0d7f9da","guard":[["hasAny",["expect","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1586265."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-f43fee79","guard":[["hasAny",["croft","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0146316."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-f5a2307b","guard":[["hasAny",["lost","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0120738."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-f68d0142","guard":[["hasAny",["city","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0896923."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-f9af2309","guard":[["hasAny",["another","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1549572."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-fac08aef","guard":[["hasAny",["cars","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0317219."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-fb082eeb","guard":[["hasAny",["dream","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0180093."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-fb4535ba","guard":[["hasAny",["dangerous","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0094947."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-1256d833","guard":[["hasAny",["american","item number","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0120586."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-1a09fa46","guard":[["hasAny",["item number","max","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0467197."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-2dabf48a","guard":[["hasAny",["chain","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0072271."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-4eb1743d","guard":[["hasAny",["henry","item number","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0097499."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-720c9970","guard":[["hasAny",["about","item number","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0881891."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-7a2e22f0","guard":[["hasAny",["hour","item number","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt00293564."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-7b51236f","guard":[["hasAny",["chocolate","item number","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0067992."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-9848962e","guard":[["hasAny",["butler","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1327773."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-99404eaa","guard":[["hasAny",["item number","nth","red"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1245526."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-b08e4736","guard":[["hasAny",["item number","jam","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0117705."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-b90823ec","guard":[["hasAny",["black","item number","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0120912."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-cf159de2","guard":[["hasAny",["attached","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1411238."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-e8c7e074","guard":[["hasAny",["big","item number","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt0259446."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-f91abb3c","guard":[["hasAny",["dorothy","item number","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is tt1227929."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}]]],"mem":null},
{"id":"n-d353106e","guard":[["hasAny",["element","hour","item number","normalise","normalize","nth","position","simplify the text"]],["has","tell"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}],["sense.first"]]],"mem":null},
{"id":"n-0068b9fa","guard":[["hasAny",["despereaux","item number","nth","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Tale of Despereaux is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-034d3b98","guard":[["hasAny",["city","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The City of Your Final Destination is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-0381afe4","guard":[["hasAny",["item number","mirror","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Mirror Mirror is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-047c8e82","guard":[["hasAny",["games","item number","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Hunger Games is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-051d1815","guard":[["hasAny",["doubt","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Doubt is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-064c933a","guard":[["hasAny",["item number","little","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Stuart Little is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-0dee724f","guard":[["hasAny",["item number","nth","ondine","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Ondine is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-188214c7","guard":[["hasAny",["doom","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Doom is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-1b6e921c","guard":[["hasAny",["item number","messenger","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Messenger is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-1ed8d488","guard":[["hasAny",["item number","key","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Skeleton Key is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-1ee38c82","guard":[["hasAny",["aces","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Smokin&#39; Aces is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-1fb17953","guard":[["hasAny",["item number","nth","remember","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Remember Me is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-20087a76","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","valkyrie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Valkyrie is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-244cfc2c","guard":[["hasAny",["horror","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Rocky Horror Picture Show is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-2640edd9","guard":[["hasAny",["country","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of North Country is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-34ff8687","guard":[["hasAny",["drifter","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of High Plains Drifter is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-3567bcf4","guard":[["hasAny",["item number","nth","painted","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Painted Veil is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-359f16b6","guard":[["hasAny",["dream","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Requiem for a Dream is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-3761ca55","guard":[["hasAny",["green","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Green Lantern is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-3883a7b7","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","whatever"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Whatever Works is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-3c86ea72","guard":[["hasAny",["item number","nth","others","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Others is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-3f660f98","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","twister"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Twister is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-3f87e42c","guard":[["hasAny",["item number","nth","poseidon","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Poseidon is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-450ef387","guard":[["hasAny",["item number","jones","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Osmosis Jones is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-46942148","guard":[["hasAny",["fargo","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Fargo is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-472d9baa","guard":[["hasAny",["anxiety","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of High Anxiety is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-4929327d","guard":[["hasAny",["item number","nth","premium","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Premium Rush is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-4bc78ed4","guard":[["hasAny",["animal","item number","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Animal House is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-4c81d557","guard":[["hasAny",["item number","lost","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Lost in Space is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-50cb4f72","guard":[["hasAny",["fourth","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Fourth Kind is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-54957e32","guard":[["hasAny",["contact","item number","nth","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Contact is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-5b5b8064","guard":[["hasAny",["item number","nth","platoon","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Platoon is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-5ed9165f","guard":[["hasAny",["insidious","item number","nth","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Insidious is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-5f50318c","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","superman"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Superman is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-6072fca0","guard":[["hasAny",["cell","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Cell is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-63a3106b","guard":[["hasAny",["devil39s","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Devil&#39;s Rejects is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-6559329f","guard":[["hasAny",["cold","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Cold Mountain is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-68340cbd","guard":[["hasAny",["item number","magic","nth","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Practical Magic is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-689c0d2e","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","star"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Star Wars is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-6a9ef8b6","guard":[["hasAny",["item number","nth","restless","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Restless is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-6cad643f","guard":[["hasAny",["item number","nth","runaways","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Runaways is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-7064d761","guard":[["hasAny",["apes","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Escape from the Planet of the Apes is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-710a0753","guard":[["hasAny",["expect","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of What to Expect When You&#39;re Expecting is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-7640da39","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","sweetest"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Sweetest Thing is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-7c1def0f","guard":[["hasAny",["item number","magnolia","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Magnolia is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-80707e79","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","wrestler"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Wrestler is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-8153c36f","guard":[["hasAny",["item number","knight","nth","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Dark Knight Rises is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-854d452b","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","talking"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Walking and Talking is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-872d5b53","guard":[["hasAny",["item number","nth","prestige","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Prestige is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-8ff826fe","guard":[["hasAny",["camelot","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Quest for Camelot is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-92654814","guard":[["hasAny",["item number","jacket","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Jacket is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-96997dfb","guard":[["hasAny",["easy","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Easy A is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-969a4953","guard":[["hasAny",["gettysburg","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Gettysburg is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-978d56fe","guard":[["hasAny",["item number","monsoon","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Monsoon Wedding is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-9893dc1c","guard":[["hasAny",["beverly","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Troop Beverly Hills is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-9c96f201","guard":[["hasAny",["adam","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Adam is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-9d47f022","guard":[["hasAny",["dangerous","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Dangerous Liaisons is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-a15948ef","guard":[["hasAny",["item number","moon","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Transformers: Dark of the Moon is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-a5f3feac","guard":[["hasAny",["hellboy","item number","nth","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Hellboy is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-a89174b3","guard":[["hasAny",["bull","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Raging Bull is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-ad9f69f2","guard":[["hasAny",["antoinette","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Marie Antoinette is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-b1214a8d","guard":[["hasAny",["hop","item number","longest","longest one","longest word","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Hop is ",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-b32b2225","guard":[["hasAny",["egypt","item number","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Prince of Egypt is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-b57eeaa2","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","timeline"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Timeline is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-b8b9d6ea","guard":[["hasAny",["fantastic","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Fantastic Four: Rise of the Silver Surfer is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-ba159071","guard":[["hasAny",["croft","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Lara Croft: Tomb Raider is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-bafd530a","guard":[["hasAny",["item number","nth","robocop","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of RoboCop is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-bdb7f07a","guard":[["hasAny",["fiction","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Stranger Than Fiction is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-be7b92e7","guard":[["hasAny",["beast","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Beauty and the Beast is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-bf1e5377","guard":[["hasAny",["cars","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Cars is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-c0db6678","guard":[["hasAny",["item number","museum","nth","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Night at the Museum is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-c161b25d","guard":[["hasAny",["days","item number","longest","longest one","longest word","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 28 Days is ",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-c3a3a947","guard":[["hasAny",["gamer","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Gamer is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-c560a4d5","guard":[["hasAny",["gain","item number","longest","longest one","longest word","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Pain &amp; Gain is ",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-c8635056","guard":[["hasAny",["item number","longest","longest one","longest word","nth","one"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The One is ",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-c98d6df8","guard":[["hasAny",["informant","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Informant! is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-d210ff52","guard":[["hasAny",["halfblood","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Harry Potter and the Half-Blood Prince is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-d4277403","guard":[["hasAny",["baby","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Baby Mama is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-d82f982c","guard":[["hasAny",["behavior","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Disturbing Behavior is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-d9025628","guard":[["hasAny",["another","item number","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Another Earth is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-d92b5262","guard":[["hasAny",["idlewild","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Idlewild is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-dad65fcf","guard":[["hasAny",["hot","item number","longest","longest one","longest word","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Hot Rod is ",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-e05a5e78","guard":[["hasAny",["item number","memento","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Memento is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-e33b9e6d","guard":[["hasAny",["item number","nine","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Nine is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-f18e4eda","guard":[["hasAny",["analyze","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Analyze This is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-fdaaa6e5","guard":[["hasAny",["beach","item number","nth","shortest","shortest one","shortest word"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Beach is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-1335b50b","guard":[["hasAny",["henry","item number","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Henry V is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-134ae39f","guard":[["hasAny",["attached","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of No Strings Attached is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-18596ae3","guard":[["hasAny",["big","item number","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of My Big Fat Greek Wedding is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-32023c65","guard":[["hasAny",["black","item number","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Men in Black II is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-37a9febe","guard":[["hasAny",["item number","jam","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Space Jam is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-38fcb9f9","guard":[["hasAny",["hour","item number","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Rush Hour 3 is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-3b05dc77","guard":[["hasAny",["about","item number","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of All About Steve is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-65672d68","guard":[["hasAny",["butler","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Lee Daniels&#39; The Butler is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-7b0245f1","guard":[["hasAny",["chain","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Texas Chain Saw Massacre is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-80c24c8d","guard":[["hasAny",["item number","nth","red"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Red is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-8142ce11","guard":[["hasAny",["chocolate","item number","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Willy Wonka &amp; the Chocolate Factory is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-a3771d65","guard":[["hasAny",["item number","max","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Max Payne is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-bea9766a","guard":[["hasAny",["dorothy","item number","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Herb &amp; Dorothy is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-e3479c60","guard":[["hasAny",["american","item number","nth"]],["has","imdb"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of American History X is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-65522653","guard":[["hasAny",["hop","item number","longest","longest one","longest word","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}]],"mem":null},
{"id":"n-899c37a6","guard":[["hasAny",["black","delete","element","item number","nth","position","remove","strip out","without"]],["has","imdb"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"title"}],{"lit":1}],{"lit":"fr-data-movies-f156c5"},{"lit":"title"},{"lit":"imdb"}],["transform.nthStr",["know.find",{"lit":"fr-data-movies-f156c5"},{"lit":"test"}],{"lit":1}]]],"mem":null},
{"id":"n-0681feea","guard":[["hasAny",["imdb","prestige"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of The Prestige":"The imdb of The Prestige is tt0482571."}}},
{"id":"n-06c3c839","guard":[["hasAny",["horror","imdb","picture","rocky"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of The Rocky Horror Picture Show":"The imdb of The Rocky Horror Picture Show is tt0073629."}}},
{"id":"n-0b56ed7a","guard":[["hasAny",["black","ii","imdb","men","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Men in Black II":"The imdb of Men in Black II is tt0120912."}}},
{"id":"n-0d9795f0","guard":[["hasAny",["baby","imdb","mama"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Baby Mama":"The imdb of Baby Mama is tt0871426."}}},
{"id":"n-0ecd8da9","guard":[["hasAny",["beach","imdb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for The Beach":"The imdb of The Beach is tt0163978."}}},
{"id":"n-10f6184f","guard":[["hasAny",["imdb","sweetest","thing","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title The Sweetest Thing":"The imdb of The Sweetest Thing is tt0253867."}}},
{"id":"n-1596d5e1","guard":[["hasAny",["easy","imdb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Easy A":"The imdb of Easy A is tt1282140."}}},
{"id":"n-1682ee77","guard":[["hasAny",["imdb","remember"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Remember Me":"The imdb of Remember Me is tt1403981."}}},
{"id":"n-20529b80","guard":[["hasAny",["amp","gain","imdb","pain"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Pain &amp; Gain":"The imdb of Pain &amp; Gain is tt1980209."}}},
{"id":"n-214b0f97","guard":[["hasAny",["camelot","imdb","quest"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Quest for Camelot":"The imdb of Quest for Camelot is tt0120800."}}},
{"id":"n-28e6715d","guard":[["hasAny",["croft","imdb","lara","raider","tomb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Lara Croft: Tomb Raider":"The imdb of Lara Croft: Tomb Raider is tt0146316."}}},
{"id":"n-2b70d08c","guard":[["hasAny",["big","fat","greek","imdb","title","wedding"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title My Big Fat Greek Wedding":"The imdb of My Big Fat Greek Wedding is tt0259446."}}},
{"id":"n-2bbe9d3e","guard":[["hasAny",["imdb","nine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Nine":"The imdb of Nine is tt0875034."}}},
{"id":"n-2e05131d","guard":[["hasAny",["chain","imdb","massacre","saw","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of The Texas Chain Saw Massacre":"The imdb of The Texas Chain Saw Massacre is tt0072271."}}},
{"id":"n-2ea6c1aa","guard":[["hasAny",["adam","imdb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Adam":"The imdb of Adam is tt1185836."}}},
{"id":"n-38b246a7","guard":[["hasAny",["imdb","jam","space"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Space Jam":"The imdb of Space Jam is tt0117705."}}},
{"id":"n-39bc1164","guard":[["hasAny",["amp","chocolate","factory","imdb","willy","wonka"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Willy Wonka &amp; the Chocolate Factory":"The imdb of Willy Wonka &amp; the Chocolate Factory is tt0067992."}}},
{"id":"n-3be9f9f6","guard":[["hasAny",["doom","imdb","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Doom":"The imdb of Doom is tt0419706."}}},
{"id":"n-3caebcbf","guard":[["hasAny",["imdb","robocop","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title RoboCop":"The imdb of RoboCop is tt0093870."}}},
{"id":"n-47335f33","guard":[["hasAny",["imdb","ondine","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Ondine":"The imdb of Ondine is tt1235796."}}},
{"id":"n-4ab44b69","guard":[["hasAny",["days","imdb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for 28 Days":"The imdb of 28 Days is tt0191754."}}},
{"id":"n-4be903eb","guard":[["hasAny",["animal","house","imdb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Animal House":"The imdb of Animal House is tt0077975."}}},
{"id":"n-4d2b6ecf","guard":[["hasAny",["fiction","imdb","stranger"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Stranger Than Fiction":"The imdb of Stranger Than Fiction is tt0420223."}}},
{"id":"n-4f7569ef","guard":[["hasAny",["drifter","high","imdb","plains","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title High Plains Drifter":"The imdb of High Plains Drifter is tt0068699."}}},
{"id":"n-503e38b3","guard":[["hasAny",["imdb","mirror"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Mirror Mirror":"The imdb of Mirror Mirror is tt1667353."}}},
{"id":"n-59aead86","guard":[["hasAny",["cars","imdb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Cars":"The imdb of Cars is tt0317219."}}},
{"id":"n-5bfd382d","guard":[["hasAny",["imdb","others"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of The Others":"The imdb of The Others is tt0230600."}}},
{"id":"n-5d79a644","guard":[["hasAny",["despereaux","imdb","tale","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title The Tale of Despereaux":"The imdb of The Tale of Despereaux is tt420238."}}},
{"id":"n-5f1dc03a","guard":[["hasAny",["green","imdb","lantern"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Green Lantern":"The imdb of Green Lantern is tt1133985."}}},
{"id":"n-635d90fb","guard":[["hasAny",["imdb","one"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for The One":"The imdb of The One is tt0267804."}}},
{"id":"n-663f97ea","guard":[["hasAny",["imdb","max","payne"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Max Payne":"The imdb of Max Payne is tt0467197."}}},
{"id":"n-69e9d267","guard":[["hasAny",["imdb","timeline"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Timeline":"The imdb of Timeline is tt0300556."}}},
{"id":"n-6c66a700","guard":[["hasAny",["imdb","red","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Red":"The imdb of Red is tt1245526."}}},
{"id":"n-6f74f482","guard":[["hasAny",["imdb","platoon","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Platoon":"The imdb of Platoon is tt0091763."}}},
{"id":"n-742a19d7","guard":[["hasAny",["imdb","jones","osmosis","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Osmosis Jones":"The imdb of Osmosis Jones is tt0181739."}}},
{"id":"n-77f13dd8","guard":[["hasAny",["imdb","title","wrestler"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title The Wrestler":"The imdb of The Wrestler is tt1125849."}}},
{"id":"n-78aba047","guard":[["hasAny",["imdb","poseidon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Poseidon":"The imdb of Poseidon is tt0409182."}}},
{"id":"n-7bac7efb","guard":[["hasAny",["imdb","memento","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Memento":"The imdb of Memento is tt0209144."}}},
{"id":"n-7d53ecd5","guard":[["hasAny",["imdb","star","wars"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Star Wars":"The imdb of Star Wars is tt0076759."}}},
{"id":"n-7fd6af13","guard":[["hasAny",["dangerous","imdb","liaisons"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Dangerous Liaisons":"The imdb of Dangerous Liaisons is tt0094947."}}},
{"id":"n-800192ff","guard":[["hasAny",["anxiety","high","imdb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for High Anxiety":"The imdb of High Anxiety is tt0076141."}}},
{"id":"n-8362714c","guard":[["hasAny",["bull","imdb","raging"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Raging Bull":"The imdb of Raging Bull is tt0081398."}}},
{"id":"n-844d4fdd","guard":[["hasAny",["imdb","title","twister"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Twister":"The imdb of Twister is tt0117998."}}},
{"id":"n-857cae19","guard":[["hasAny",["imdb","runaways","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title The Runaways":"The imdb of The Runaways is tt1017451."}}},
{"id":"n-86efdde5","guard":[["hasAny",["imdb","whatever","works"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Whatever Works":"The imdb of Whatever Works is tt1178663."}}},
{"id":"n-87ba2b58","guard":[["hasAny",["hop","imdb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Hop":"The imdb of Hop is tt1411704."}}},
{"id":"n-8ac90b40","guard":[["hasAny",["hour","imdb","rush","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Rush Hour 3":"The imdb of Rush Hour 3 is tt00293564."}}},
{"id":"n-8c6db439","guard":[["hasAny",["devil39s","imdb","rejects"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of The Devil&#39;s Rejects":"The imdb of The Devil&#39;s Rejects is tt0395584."}}},
{"id":"n-8d0ddd0e","guard":[["hasAny",["city","destination","final","imdb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for The City of Your Final Destination":"The imdb of The City of Your Final Destination is tt0896923."}}},
{"id":"n-8d82ed46","guard":[["hasAny",["imdb","key","skeleton"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for The Skeleton Key":"The imdb of The Skeleton Key is tt0397101."}}},
{"id":"n-90bc9d3b","guard":[["hasAny",["imdb","valkyrie"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Valkyrie":"The imdb of Valkyrie is tt0985699."}}},
{"id":"n-92bd9e3d","guard":[["hasAny",["gettysburg","imdb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Gettysburg":"The imdb of Gettysburg is tt0107007."}}},
{"id":"n-936e9cde","guard":[["hasAny",["amp","dorothy","herb","imdb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Herb &amp; Dorothy":"The imdb of Herb &amp; Dorothy is tt1227929."}}},
{"id":"n-95da9644","guard":[["hasAny",["fargo","imdb","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Fargo":"The imdb of Fargo is tt0116282."}}},
{"id":"n-99ed04cc","guard":[["hasAny",["contact","imdb","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Contact":"The imdb of Contact is tt0118884."}}},
{"id":"n-9ac2c0ad","guard":[["hasAny",["imdb","restless"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Restless":"The imdb of Restless is tt1498569."}}},
{"id":"n-9c312c35","guard":[["hasAny",["hot","imdb","rod"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Hot Rod":"The imdb of Hot Rod is tt0787475."}}},
{"id":"n-9d6466e0","guard":[["hasAny",["imdb","premium","rush"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Premium Rush":"The imdb of Premium Rush is tt1547234."}}},
{"id":"n-9d8daf69","guard":[["hasAny",["egypt","imdb","prince"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of The Prince of Egypt":"The imdb of The Prince of Egypt is tt0120794."}}},
{"id":"n-a40721d0","guard":[["hasAny",["cell","imdb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of The Cell":"The imdb of The Cell is tt0209958."}}},
{"id":"n-aa4da5c9","guard":[["hasAny",["imdb","monsoon","title","wedding"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Monsoon Wedding":"The imdb of Monsoon Wedding is tt0265343."}}},
{"id":"n-aa7da268","guard":[["hasAny",["aces","imdb","smokin39"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Smokin&#39; Aces":"The imdb of Smokin&#39; Aces is tt0475394."}}},
{"id":"n-abf34800","guard":[["hasAny",["imdb","magic","practical","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Practical Magic":"The imdb of Practical Magic is tt0120791."}}},
{"id":"n-ac11aa3c","guard":[["hasAny",["dark","imdb","knight","rises","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title The Dark Knight Rises":"The imdb of The Dark Knight Rises is tt1345836."}}},
{"id":"n-b0dae5a3","guard":[["hasAny",["butler","daniels39","imdb","lee"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Lee Daniels&#39; The Butler":"The imdb of Lee Daniels&#39; The Butler is tt1327773."}}},
{"id":"n-b19c1d58","guard":[["hasAny",["imdb","insidious","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Insidious":"The imdb of Insidious is tt1591095."}}},
{"id":"n-b27e8b75","guard":[["hasAny",["imdb","talking","title","walking"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Walking and Talking":"The imdb of Walking and Talking is tt0118113."}}},
{"id":"n-b68f56be","guard":[["hasAny",["hellboy","imdb","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Hellboy":"The imdb of Hellboy is tt0167190."}}},
{"id":"n-b76bcab6","guard":[["hasAny",["beast","beauty","imdb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Beauty and the Beast":"The imdb of Beauty and the Beast is tt0101414."}}},
{"id":"n-beb297c9","guard":[["hasAny",["imdb","jacket"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of The Jacket":"The imdb of The Jacket is tt0366627."}}},
{"id":"n-bf23fe21","guard":[["hasAny",["idlewild","imdb","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Idlewild":"The imdb of Idlewild is tt0417225."}}},
{"id":"n-bf5b068f","guard":[["hasAny",["imdb","painted","title","veil"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title The Painted Veil":"The imdb of The Painted Veil is tt0446755."}}},
{"id":"n-c2fcf296","guard":[["hasAny",["antoinette","imdb","marie"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Marie Antoinette":"The imdb of Marie Antoinette is tt0422720."}}},
{"id":"n-c3d3fd2f","guard":[["hasAny",["imdb","messenger"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for The Messenger":"The imdb of The Messenger is tt0790712."}}},
{"id":"n-c534190a","guard":[["hasAny",["imdb","little","stuart","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Stuart Little":"The imdb of Stuart Little is tt0164912."}}},
{"id":"n-c61d81b1","guard":[["hasAny",["analyze","imdb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Analyze This":"The imdb of Analyze This is tt0122933."}}},
{"id":"n-c8870846","guard":[["hasAny",["halfblood","harry","imdb","potter","prince"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Harry Potter and the Half-Blood Prince":"The imdb of Harry Potter and the Half-Blood Prince is tt0417741."}}},
{"id":"n-c97efc76","guard":[["hasAny",["imdb","superman"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Superman":"The imdb of Superman is tt0078346."}}},
{"id":"n-cc10a98f","guard":[["hasAny",["beverly","hills","imdb","troop"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Troop Beverly Hills":"The imdb of Troop Beverly Hills is tt0098519."}}},
{"id":"n-ce1a8909","guard":[["hasAny",["imdb","museum","night","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Night at the Museum":"The imdb of Night at the Museum is tt0477347."}}},
{"id":"n-ce58b440","guard":[["hasAny",["another","earth","imdb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Another Earth":"The imdb of Another Earth is tt1549572."}}},
{"id":"n-d2fa7052","guard":[["hasAny",["fourth","imdb","kind"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for The Fourth Kind":"The imdb of The Fourth Kind is tt1220198."}}},
{"id":"n-d417ab37","guard":[["hasAny",["american","history","imdb","x"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of American History X":"The imdb of American History X is tt0120586."}}},
{"id":"n-d6faf2e6","guard":[["hasAny",["henry","imdb","title","v"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Henry V":"The imdb of Henry V is tt0097499."}}},
{"id":"n-d80f38c1","guard":[["hasAny",["fantastic","four","imdb","rise","silver","surfer"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Fantastic Four: Rise of the Silver Surfer":"The imdb of Fantastic Four: Rise of the Silver Surfer is tt0486576."}}},
{"id":"n-dc1ba290","guard":[["hasAny",["imdb","lost","space","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Lost in Space":"The imdb of Lost in Space is tt0120738."}}},
{"id":"n-dda3bfe0","guard":[["hasAny",["country","imdb","north"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for North Country":"The imdb of North Country is tt0395972."}}},
{"id":"n-e09c5cb9","guard":[["hasAny",["cold","imdb","mountain","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Cold Mountain":"The imdb of Cold Mountain is tt0159365."}}},
{"id":"n-e0e0ac93","guard":[["hasAny",["imdb","informant"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of The Informant!":"The imdb of The Informant! is tt1130080."}}},
{"id":"n-e3a88b6b","guard":[["hasAny",["imdb","magnolia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Magnolia":"The imdb of Magnolia is tt0175880."}}},
{"id":"n-e4fb1a23","guard":[["hasAny",["dark","imdb","moon","transformers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Transformers: Dark of the Moon":"The imdb of Transformers: Dark of the Moon is tt1399103."}}},
{"id":"n-ea923d1f","guard":[["hasAny",["attached","imdb","no","strings"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of No Strings Attached":"The imdb of No Strings Attached is tt1411238."}}},
{"id":"n-eaf0df4e","guard":[["hasAny",["gamer","imdb","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Gamer":"The imdb of Gamer is tt1034032."}}},
{"id":"n-ed36a258","guard":[["hasAny",["behavior","disturbing","imdb","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Disturbing Behavior":"The imdb of Disturbing Behavior is tt0134619."}}},
{"id":"n-ed48f80a","guard":[["hasAny",["dream","imdb","requiem"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of Requiem for a Dream":"The imdb of Requiem for a Dream is tt0180093."}}},
{"id":"n-eefdf52d","guard":[["hasAny",["doubt","imdb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Doubt":"The imdb of Doubt is tt0918927."}}},
{"id":"n-f7dc3c63","guard":[["hasAny",["apes","escape","imdb","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for Escape from the Planet of the Apes":"The imdb of Escape from the Planet of the Apes is tt0067065."}}},
{"id":"n-f7e4a036","guard":[["hasAny",["games","hunger","imdb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of The Hunger Games":"The imdb of The Hunger Games is tt1392170."}}},
{"id":"n-fba5a1dc","guard":[["hasAny",["expect","expecting","imdb","you39re"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the imdb for What to Expect When You&#39;re Expecting":"The imdb of What to Expect When You&#39;re Expecting is tt1586265."}}},
{"id":"n-fd492a59","guard":[["hasAny",["about","all","imdb","steve"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the imdb of All About Steve":"The imdb of All About Steve is tt0881891."}}},
{"id":"n-7e4ebb39","guard":[["has","imdb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Lara Croft: Tomb Raider":"The imdb of Lara Croft: Tomb Raider is tt0146316.","give the imdb for Whatever Works":"The imdb of Whatever Works is tt1178663.","give the imdb for Valkyrie":"The imdb of Valkyrie is tt0985699.","what is the imdb of Remember Me":"The imdb of Remember Me is tt1403981.","what is the imdb of The Texas Chain Saw Massacre":"The imdb of The Texas Chain Saw Massacre is tt0072271.","what is the imdb of The Cell":"The imdb of The Cell is tt0209958.","what is the imdb of The Informant!":"The imdb of The Informant! is tt1130080.","tell me the imdb of the title Osmosis Jones":"The imdb of Osmosis Jones is tt0181739.","tell me the imdb of the title Disturbing Behavior":"The imdb of Disturbing Behavior is tt0134619.","tell me the imdb of the title Lost in Space":"The imdb of Lost in Space is tt0120738.","tell me the imdb of the title Insidious":"The imdb of Insidious is tt1591095.","tell me the imdb of the title Night at the Museum":"The imdb of Night at the Museum is tt0477347.","give the imdb for Troop Beverly Hills":"The imdb of Troop Beverly Hills is tt0098519.","give the imdb for Doubt":"The imdb of Doubt is tt0918927.","what is the imdb of The Prince of Egypt":"The imdb of The Prince of Egypt is tt0120794.","what is the imdb of American History X":"The imdb of American History X is tt0120586.","tell me the imdb of the title Twister":"The imdb of Twister is tt0117998.","give the imdb for The Fourth Kind":"The imdb of The Fourth Kind is tt1220198.","tell me the imdb of the title Fargo":"The imdb of Fargo is tt0116282.","give the imdb for The Beach":"The imdb of The Beach is tt0163978.","give the imdb for Pain &amp; Gain":"The imdb of Pain &amp; Gain is tt1980209.","tell me the imdb of the title High Plains Drifter":"The imdb of High Plains Drifter is tt0068699.","give the imdb for Adam":"The imdb of Adam is tt1185836.","what is the imdb of All About Steve":"The imdb of All About Steve is tt0881891.","what is the imdb of Another Earth":"The imdb of Another Earth is tt1549572.","give the imdb for High Anxiety":"The imdb of High Anxiety is tt0076141.","what is the imdb of The Prestige":"The imdb of The Prestige is tt0482571.","what is the imdb of Baby Mama":"The imdb of Baby Mama is tt0871426.","tell me the imdb of the title Idlewild":"The imdb of Idlewild is tt0417225.","give the imdb for Nine":"The imdb of Nine is tt0875034.","tell me the imdb of the title The Painted Veil":"The imdb of The Painted Veil is tt0446755.","give the imdb for Gettysburg":"The imdb of Gettysburg is tt0107007.","what is the imdb of The Others":"The imdb of The Others is tt0230600.","what is the imdb of The Hunger Games":"The imdb of The Hunger Games is tt1392170.","give the imdb for Green Lantern":"The imdb of Green Lantern is tt1133985.","give the imdb for Mirror Mirror":"The imdb of Mirror Mirror is tt1667353.","tell me the imdb of the title Gamer":"The imdb of Gamer is tt1034032.","tell me the imdb of the title Contact":"The imdb of Contact is tt0118884.","tell me the imdb of the title The Tale of Despereaux":"The imdb of The Tale of Despereaux is tt420238.","what is the imdb of Analyze This":"The imdb of Analyze This is tt0122933.","give the imdb for Beauty and the Beast":"The imdb of Beauty and the Beast is tt0101414.","tell me the imdb of the title Walking and Talking":"The imdb of Walking and Talking is tt0118113.","tell me the imdb of the title Henry V":"The imdb of Henry V is tt0097499.","what is the imdb of Restless":"The imdb of Restless is tt1498569.","tell me the imdb of the title Men in Black II":"The imdb of Men in Black II is tt0120912.","what is the imdb of No Strings Attached":"The imdb of No Strings Attached is tt1411238.","give the imdb for The Messenger":"The imdb of The Messenger is tt0790712.","give the imdb for Magnolia":"The imdb of Magnolia is tt0175880.","give the imdb for Transformers: Dark of the Moon":"The imdb of Transformers: Dark of the Moon is tt1399103.","tell me the imdb of the title Stuart Little":"The imdb of Stuart Little is tt0164912.","what is the imdb of Cars":"The imdb of Cars is tt0317219.","tell me the imdb of the title My Big Fat Greek Wedding":"The imdb of My Big Fat Greek Wedding is tt0259446.","what is the imdb of Space Jam":"The imdb of Space Jam is tt0117705.","give the imdb for The One":"The imdb of The One is tt0267804.","tell me the imdb of the title The Sweetest Thing":"The imdb of The Sweetest Thing is tt0253867.","give the imdb for Premium Rush":"The imdb of Premium Rush is tt1547234.","tell me the imdb of the title Practical Magic":"The imdb of Practical Magic is tt0120791.","what is the imdb of The Jacket":"The imdb of The Jacket is tt0366627.","what is the imdb of Star Wars":"The imdb of Star Wars is tt0076759.","tell me the imdb of the title Ondine":"The imdb of Ondine is tt1235796.","what is the imdb of Hot Rod":"The imdb of Hot Rod is tt0787475.","what is the imdb of Dangerous Liaisons":"The imdb of Dangerous Liaisons is tt0094947.","tell me the imdb of the title RoboCop":"The imdb of RoboCop is tt0093870.","what is the imdb of Marie Antoinette":"The imdb of Marie Antoinette is tt0422720.","tell me the imdb of the title Red":"The imdb of Red is tt1245526.","give the imdb for Poseidon":"The imdb of Poseidon is tt0409182.","give the imdb for Stranger Than Fiction":"The imdb of Stranger Than Fiction is tt0420223.","what is the imdb of Timeline":"The imdb of Timeline is tt0300556.","give the imdb for The Skeleton Key":"The imdb of The Skeleton Key is tt0397101.","give the imdb for Harry Potter and the Half-Blood Prince":"The imdb of Harry Potter and the Half-Blood Prince is tt0417741.","give the imdb for Raging Bull":"The imdb of Raging Bull is tt0081398.","what is the imdb of Willy Wonka &amp; the Chocolate Factory":"The imdb of Willy Wonka &amp; the Chocolate Factory is tt0067992.","tell me the imdb of the title The Dark Knight Rises":"The imdb of The Dark Knight Rises is tt1345836.","give the imdb for The City of Your Final Destination":"The imdb of The City of Your Final Destination is tt0896923.","tell me the imdb of the title Doom":"The imdb of Doom is tt0419706.","what is the imdb of Herb &amp; Dorothy":"The imdb of Herb &amp; Dorothy is tt1227929.","give the imdb for Quest for Camelot":"The imdb of Quest for Camelot is tt0120800.","tell me the imdb of the title Monsoon Wedding":"The imdb of Monsoon Wedding is tt0265343.","what is the imdb of Animal House":"The imdb of Animal House is tt0077975.","tell me the imdb of the title Cold Mountain":"The imdb of Cold Mountain is tt0159365.","what is the imdb of Max Payne":"The imdb of Max Payne is tt0467197.","tell me the imdb of the title Hellboy":"The imdb of Hellboy is tt0167190.","what is the imdb of The Rocky Horror Picture Show":"The imdb of The Rocky Horror Picture Show is tt0073629.","give the imdb for Easy A":"The imdb of Easy A is tt1282140.","what is the imdb of Hop":"The imdb of Hop is tt1411704.","what is the imdb of Requiem for a Dream":"The imdb of Requiem for a Dream is tt0180093.","tell me the imdb of the title Memento":"The imdb of Memento is tt0209144.","what is the imdb of Superman":"The imdb of Superman is tt0078346.","give the imdb for North Country":"The imdb of North Country is tt0395972.","tell me the imdb of the title Platoon":"The imdb of Platoon is tt0091763.","give the imdb for Escape from the Planet of the Apes":"The imdb of Escape from the Planet of the Apes is tt0067065.","tell me the imdb of the title The Runaways":"The imdb of The Runaways is tt1017451.","give the imdb for Fantastic Four: Rise of the Silver Surfer":"The imdb of Fantastic Four: Rise of the Silver Surfer is tt0486576.","tell me the imdb of the title The Wrestler":"The imdb of The Wrestler is tt1125849."}}},
{"id":"n-007c9aa8","guard":[["hasAny",["american","history","imdb","x"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of American History X":"The imdb of American History X is tt0120586."}}},
{"id":"n-0522e21e","guard":[["hasAny",["another","earth","imdb"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Another Earth":"The imdb of Another Earth is tt1549572."}}},
{"id":"n-07ac5741","guard":[["hasAny",["imdb","jones","osmosis","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Osmosis Jones":"The imdb of Osmosis Jones is tt0181739."}}},
{"id":"n-090946ab","guard":[["hasAny",["imdb","monsoon","title","wedding"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Monsoon Wedding":"The imdb of Monsoon Wedding is tt0265343."}}},
{"id":"n-096a4d78","guard":[["hasAny",["croft","imdb","lara","raider","tomb"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Lara Croft: Tomb Raider":"The imdb of Lara Croft: Tomb Raider is tt0146316."}}},
{"id":"n-0abcda24","guard":[["has","runaways"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title The Runaways":"The imdb of The Runaways is tt1017451."}}},
{"id":"n-1139a578","guard":[["hasAny",["imdb","informant"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of The Informant!":"The imdb of The Informant! is tt1130080."}}},
{"id":"n-17750d45","guard":[["hasAny",["imdb","star","wars"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Star Wars":"The imdb of Star Wars is tt0076759."}}},
{"id":"n-17dac47e","guard":[["hasAny",["imdb","talking","title","walking"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Walking and Talking":"The imdb of Walking and Talking is tt0118113."}}},
{"id":"n-1af0d043","guard":[["hasAny",["despereaux","imdb","tale","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title The Tale of Despereaux":"The imdb of The Tale of Despereaux is tt420238."}}},
{"id":"n-1b0de89d","guard":[["hasAny",["imdb","one"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for The One":"The imdb of The One is tt0267804."}}},
{"id":"n-1b8dc780","guard":[["hasAny",["easy","imdb"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Easy A":"The imdb of Easy A is tt1282140."}}},
{"id":"n-1bf3132d","guard":[["hasAny",["games","hunger","imdb"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of The Hunger Games":"The imdb of The Hunger Games is tt1392170."}}},
{"id":"n-22dad60c","guard":[["hasAny",["hot","imdb","rod"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Hot Rod":"The imdb of Hot Rod is tt0787475."}}},
{"id":"n-23f8490b","guard":[["hasAny",["fourth","imdb","kind"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for The Fourth Kind":"The imdb of The Fourth Kind is tt1220198."}}},
{"id":"n-2434bb92","guard":[["hasAny",["henry","imdb","title","v"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Henry V":"The imdb of Henry V is tt0097499."}}},
{"id":"n-283b005f","guard":[["hasAny",["halfblood","harry","imdb","potter","prince"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Harry Potter and the Half-Blood Prince":"The imdb of Harry Potter and the Half-Blood Prince is tt0417741."}}},
{"id":"n-2d3e4c31","guard":[["has","robocop"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title RoboCop":"The imdb of RoboCop is tt0093870."}}},
{"id":"n-30419e0a","guard":[["hasAny",["camelot","imdb","quest"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Quest for Camelot":"The imdb of Quest for Camelot is tt0120800."}}},
{"id":"n-305e07c8","guard":[["hasAny",["beach","imdb"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for The Beach":"The imdb of The Beach is tt0163978."}}},
{"id":"n-31329ff4","guard":[["hasAny",["city","destination","final","imdb"]],["has","imdb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for The City of Your Final Destination":"The imdb of The City of Your Final Destination is tt0896923."}}},
{"id":"n-33b5c1ef","guard":[["hasAny",["imdb","key","skeleton"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for The Skeleton Key":"The imdb of The Skeleton Key is tt0397101."}}},
{"id":"n-34ba0204","guard":[["has","ondine"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Ondine":"The imdb of Ondine is tt1235796."}}},
{"id":"n-34e64aa1","guard":[["hasAny",["dark","imdb","knight","rises","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title The Dark Knight Rises":"The imdb of The Dark Knight Rises is tt1345836."}}},
{"id":"n-39640a89","guard":[["hasAny",["beast","beauty","imdb"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Beauty and the Beast":"The imdb of Beauty and the Beast is tt0101414."}}},
{"id":"n-3a161cb1","guard":[["hasAny",["imdb","prestige"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of The Prestige":"The imdb of The Prestige is tt0482571."}}},
{"id":"n-3e0b8e70","guard":[["hasAny",["gettysburg","imdb"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Gettysburg":"The imdb of Gettysburg is tt0107007."}}},
{"id":"n-3ecd1167","guard":[["hasAny",["black","ii","imdb","men","title"]],["has","imdb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Men in Black II":"The imdb of Men in Black II is tt0120912."}}},
{"id":"n-3ed0c039","guard":[["hasAny",["dangerous","imdb","liaisons"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Dangerous Liaisons":"The imdb of Dangerous Liaisons is tt0094947."}}},
{"id":"n-43d8b64e","guard":[["hasAny",["anxiety","high","imdb"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for High Anxiety":"The imdb of High Anxiety is tt0076141."}}},
{"id":"n-46ae187f","guard":[["hasAny",["imdb","jacket"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of The Jacket":"The imdb of The Jacket is tt0366627."}}},
{"id":"n-46c156bb","guard":[["hasAny",["dark","imdb","moon","transformers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Transformers: Dark of the Moon":"The imdb of Transformers: Dark of the Moon is tt1399103."}}},
{"id":"n-48928407","guard":[["hasAny",["imdb","premium","rush"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Premium Rush":"The imdb of Premium Rush is tt1547234."}}},
{"id":"n-4b6d625e","guard":[["hasAny",["imdb","timeline"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Timeline":"The imdb of Timeline is tt0300556."}}},
{"id":"n-4c63bb48","guard":[["hasAny",["bull","imdb","raging"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Raging Bull":"The imdb of Raging Bull is tt0081398."}}},
{"id":"n-4e1d336d","guard":[["hasAny",["amp","gain","imdb","pain"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Pain &amp; Gain":"The imdb of Pain &amp; Gain is tt1980209."}}},
{"id":"n-4f1b427c","guard":[["hasAny",["imdb","remember"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Remember Me":"The imdb of Remember Me is tt1403981."}}},
{"id":"n-50293a03","guard":[["hasAny",["beverly","hills","imdb","troop"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Troop Beverly Hills":"The imdb of Troop Beverly Hills is tt0098519."}}},
{"id":"n-50987b26","guard":[["hasAny",["cars","imdb"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Cars":"The imdb of Cars is tt0317219."}}},
{"id":"n-52217827","guard":[["hasAny",["horror","imdb","picture","rocky"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of The Rocky Horror Picture Show":"The imdb of The Rocky Horror Picture Show is tt0073629."}}},
{"id":"n-550f1f98","guard":[["hasAny",["imdb","nine"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Nine":"The imdb of Nine is tt0875034."}}},
{"id":"n-57a2bef4","guard":[["hasAny",["antoinette","imdb","marie"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Marie Antoinette":"The imdb of Marie Antoinette is tt0422720."}}},
{"id":"n-589d3660","guard":[["hasAny",["chain","imdb","massacre","saw","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of The Texas Chain Saw Massacre":"The imdb of The Texas Chain Saw Massacre is tt0072271."}}},
{"id":"n-5c6c6a0b","guard":[["hasAny",["imdb","little","stuart","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Stuart Little":"The imdb of Stuart Little is tt0164912."}}},
{"id":"n-60dd755d","guard":[["hasAny",["imdb","messenger"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for The Messenger":"The imdb of The Messenger is tt0790712."}}},
{"id":"n-6724459d","guard":[["has","gamer"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Gamer":"The imdb of Gamer is tt1034032."}}},
{"id":"n-693ccfaf","guard":[["hasAny",["imdb","restless"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Restless":"The imdb of Restless is tt1498569."}}},
{"id":"n-6ae61544","guard":[["hasAny",["imdb","superman"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Superman":"The imdb of Superman is tt0078346."}}},
{"id":"n-7065c07a","guard":[["hasAny",["imdb","jam","space"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Space Jam":"The imdb of Space Jam is tt0117705."}}},
{"id":"n-73605fe0","guard":[["hasAny",["adam","imdb"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Adam":"The imdb of Adam is tt1185836."}}},
{"id":"n-74b2bab9","guard":[["hasAny",["fantastic","four","imdb","rise","silver","surfer"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Fantastic Four: Rise of the Silver Surfer":"The imdb of Fantastic Four: Rise of the Silver Surfer is tt0486576."}}},
{"id":"n-801a5204","guard":[["hasAny",["egypt","imdb","prince"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of The Prince of Egypt":"The imdb of The Prince of Egypt is tt0120794."}}},
{"id":"n-8114860f","guard":[["has","idlewild"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Idlewild":"The imdb of Idlewild is tt0417225."}}},
{"id":"n-82a0aa55","guard":[["hasAny",["fiction","imdb","stranger"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Stranger Than Fiction":"The imdb of Stranger Than Fiction is tt0420223."}}},
{"id":"n-8d21e450","guard":[["has","contact"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Contact":"The imdb of Contact is tt0118884."}}},
{"id":"n-8d5df718","guard":[["hasAny",["attached","imdb","no","strings"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of No Strings Attached":"The imdb of No Strings Attached is tt1411238."}}},
{"id":"n-904a0ce9","guard":[["has","twister"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Twister":"The imdb of Twister is tt0117998."}}},
{"id":"n-91e37597","guard":[["hasAny",["imdb","sweetest","thing","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title The Sweetest Thing":"The imdb of The Sweetest Thing is tt0253867."}}},
{"id":"n-93899900","guard":[["has","wrestler"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title The Wrestler":"The imdb of The Wrestler is tt1125849."}}},
{"id":"n-97ab6d22","guard":[["has","doom"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Doom":"The imdb of Doom is tt0419706."}}},
{"id":"n-9fc59f66","guard":[["hasAny",["doubt","imdb"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Doubt":"The imdb of Doubt is tt0918927."}}},
{"id":"n-a0ad6da9","guard":[["hasAny",["imdb","mirror"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Mirror Mirror":"The imdb of Mirror Mirror is tt1667353."}}},
{"id":"n-a4b6afa5","guard":[["hasAny",["imdb","poseidon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Poseidon":"The imdb of Poseidon is tt0409182."}}},
{"id":"n-a699ace2","guard":[["has","hellboy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Hellboy":"The imdb of Hellboy is tt0167190."}}},
{"id":"n-a81219ae","guard":[["hasAny",["animal","house","imdb"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Animal House":"The imdb of Animal House is tt0077975."}}},
{"id":"n-a909f39a","guard":[["hasAny",["imdb","max","payne"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Max Payne":"The imdb of Max Payne is tt0467197."}}},
{"id":"n-aa2d116d","guard":[["hasAny",["analyze","imdb"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Analyze This":"The imdb of Analyze This is tt0122933."}}},
{"id":"n-ad4e7df4","guard":[["hasAny",["big","fat","greek","imdb","title","wedding"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title My Big Fat Greek Wedding":"The imdb of My Big Fat Greek Wedding is tt0259446."}}},
{"id":"n-b1b68f85","guard":[["hasAny",["amp","chocolate","factory","imdb","willy","wonka"]],["has","imdb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Willy Wonka &amp; the Chocolate Factory":"The imdb of Willy Wonka &amp; the Chocolate Factory is tt0067992."}}},
{"id":"n-b4fcc3c9","guard":[["hasAny",["imdb","lost","space","title"]],["has","imdb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Lost in Space":"The imdb of Lost in Space is tt0120738."}}},
{"id":"n-bf051708","guard":[["has","memento"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Memento":"The imdb of Memento is tt0209144."}}},
{"id":"n-bf5ecab2","guard":[["has","fargo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Fargo":"The imdb of Fargo is tt0116282."}}},
{"id":"n-c28bd3e2","guard":[["hasAny",["imdb","valkyrie"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Valkyrie":"The imdb of Valkyrie is tt0985699."}}},
{"id":"n-c65abe46","guard":[["hasAny",["baby","imdb","mama"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Baby Mama":"The imdb of Baby Mama is tt0871426."}}},
{"id":"n-c6f3b08b","guard":[["hasAny",["country","imdb","north"]],["has","imdb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for North Country":"The imdb of North Country is tt0395972."}}},
{"id":"n-cc06db60","guard":[["has","red"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Red":"The imdb of Red is tt1245526."}}},
{"id":"n-ce6b82a0","guard":[["hasAny",["imdb","magic","practical","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Practical Magic":"The imdb of Practical Magic is tt0120791."}}},
{"id":"n-d86ce693","guard":[["has","platoon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Platoon":"The imdb of Platoon is tt0091763."}}},
{"id":"n-da49e04d","guard":[["hasAny",["drifter","high","imdb","plains","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title High Plains Drifter":"The imdb of High Plains Drifter is tt0068699."}}},
{"id":"n-db988f80","guard":[["hasAny",["cell","imdb"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of The Cell":"The imdb of The Cell is tt0209958."}}},
{"id":"n-dc91df22","guard":[["hasAny",["apes","escape","imdb","planet"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Escape from the Planet of the Apes":"The imdb of Escape from the Planet of the Apes is tt0067065."}}},
{"id":"n-df5ada18","guard":[["hasAny",["green","imdb","lantern"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Green Lantern":"The imdb of Green Lantern is tt1133985."}}},
{"id":"n-e8c89546","guard":[["hasAny",["about","all","imdb","steve"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of All About Steve":"The imdb of All About Steve is tt0881891."}}},
{"id":"n-eaac3b91","guard":[["hasAny",["imdb","painted","title","veil"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title The Painted Veil":"The imdb of The Painted Veil is tt0446755."}}},
{"id":"n-eaebea84","guard":[["hasAny",["behavior","disturbing","imdb","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Disturbing Behavior":"The imdb of Disturbing Behavior is tt0134619."}}},
{"id":"n-f0b1010a","guard":[["hasAny",["dream","imdb","requiem"]],["has","imdb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Requiem for a Dream":"The imdb of Requiem for a Dream is tt0180093."}}},
{"id":"n-f13801f5","guard":[["hasAny",["hop","imdb"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Hop":"The imdb of Hop is tt1411704."}}},
{"id":"n-f2228a0b","guard":[["hasAny",["imdb","museum","night","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Night at the Museum":"The imdb of Night at the Museum is tt0477347."}}},
{"id":"n-f25162cb","guard":[["hasAny",["imdb","magnolia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Magnolia":"The imdb of Magnolia is tt0175880."}}},
{"id":"n-f2996f62","guard":[["has","insidious"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Insidious":"The imdb of Insidious is tt1591095."}}},
{"id":"n-f4a18bd3","guard":[["hasAny",["imdb","whatever","works"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the imdb for Whatever Works":"The imdb of Whatever Works is tt1178663."}}},
{"id":"n-f4a79510","guard":[["hasAny",["amp","dorothy","herb","imdb"]],["has","imdb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of Herb &amp; Dorothy":"The imdb of Herb &amp; Dorothy is tt1227929."}}},
{"id":"n-f8b68527","guard":[["hasAny",["imdb","others"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the imdb of The Others":"The imdb of The Others is tt0230600."}}},
{"id":"n-fbed71ad","guard":[["hasAny",["cold","imdb","mountain","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the imdb of the title Cold Mountain":"The imdb of Cold Mountain is tt0159365."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"give the imdb for Lara Croft: Tomb Raider","expect":{"contains":["tt0146316"],"notRefusal":true}},{"q":"give the imdb for Whatever Works","expect":{"contains":["tt1178663"],"notRefusal":true}},{"q":"give the imdb for Valkyrie","expect":{"contains":["tt0985699"],"notRefusal":true}},{"q":"what is the imdb of Remember Me","expect":{"contains":["tt1403981"],"notRefusal":true}},{"q":"what is the imdb of The Texas Chain Saw Massacre","expect":{"contains":["tt0072271"],"notRefusal":true}},{"q":"give the imdb for What to Expect When You&#39;re Expecting","expect":{"contains":["tt1586265"],"notRefusal":true}},{"q":"what is the imdb of The Cell","expect":{"contains":["tt0209958"],"notRefusal":true}},{"q":"what is the imdb of The Informant!","expect":{"contains":["tt1130080"],"notRefusal":true}},{"q":"tell me the imdb of the title Osmosis Jones","expect":{"contains":["tt0181739"],"notRefusal":true}},{"q":"tell me the imdb of the title Disturbing Behavior","expect":{"contains":["tt0134619"],"notRefusal":true}},{"q":"tell me the imdb of the title Lost in Space","expect":{"contains":["tt0120738"],"notRefusal":true}},{"q":"tell me the imdb of the title Insidious","expect":{"contains":["tt1591095"],"notRefusal":true}},{"q":"tell me the imdb of the title Night at the Museum","expect":{"contains":["tt0477347"],"notRefusal":true}},{"q":"give the imdb for Troop Beverly Hills","expect":{"contains":["tt0098519"],"notRefusal":true}},{"q":"give the imdb for Doubt","expect":{"contains":["tt0918927"],"notRefusal":true}},{"q":"what is the imdb of The Prince of Egypt","expect":{"contains":["tt0120794"],"notRefusal":true}},{"q":"what is the imdb of American History X","expect":{"contains":["tt0120586"],"notRefusal":true}},{"q":"tell me the imdb of the title Twister","expect":{"contains":["tt0117998"],"notRefusal":true}},{"q":"give the imdb for The Fourth Kind","expect":{"contains":["tt1220198"],"notRefusal":true}},{"q":"tell me the imdb of the title Fargo","expect":{"contains":["tt0116282"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
