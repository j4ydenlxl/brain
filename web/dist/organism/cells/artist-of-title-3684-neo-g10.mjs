// artist-of-title-3684-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"artist-of-title-3684-neo-g10","class":"artist-of-title-3684","generation":10,"lane":"neo","grownFrom":["what is the artist of One Mic","what is the artist of Follow The Leader","tell me the artist of the title Love Of My Life (An Ode To Hip Hop)","tell me the artist of the title Just A Moment","give the artist for Wipe Me Down (Remix)","tell me the artist of the title Fuck Tha Police","tell me the artist of the title The Bridge Is Over","what is the artist of Put It On","what is the artist of What About Me","what is the artist of As The Rhyme Goes On","what is the artist of Respiration","give the artist for Kyoto","tell me the artist of the title I Luv U","what is the artist of Ambitionz Az A Ridah","give the artist for Love Yourz","what is the artist of No Diggity","what is the artist of Regrets","what is the artist of Things Done Changed","tell me the artist of the title It’s Your World (Part 1 & 2)","give the artist for Sim Dope"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-rankings-e03730","columns":["title","artist","gender","n3"],"n":311,"cols":[{"s":"Juicy|Fight The Power|Shook Ones (Part II)|Nuthin’ But A ‘G’ Thang|C.R.E.A.M.|Passin’ Me By|N.Y. State Of Mind|Dear Mama|Paid In Full|Fuck Tha Police|Electric Relaxation|B.O.B.|It Was A Good Day|U.N.I.T.Y.|Doo Wop (That Thing)|Lose Yourself|Jesus Walks|Alright|Grindin’|Ready Or Not|Sucker MCs|Work It|Hip Hop|All Of The Lights|Party Up (Up In Here)|Codeine Crazy|Hard Knock Life|A Milli|Aiiight Chill|Kick Push|God’s Eye|Murder|America’s Most Blunted|Children’s Story|Love Is…|Push It|Worst Behavior|So What’cha Want|Ambitionz Az A Ridah|Brenda’s Got A Baby|Hit ’Em Up|I Get Around|So Many Tears|California Love|Changes|Keep It On The Real|In Da Club|Award Tour|Bonita Applebum|Can I Kick It|Excursions|God Lives Through|Scenario|Sim Dope|1 Train|Mic Check|Planet Rock|L'Americano|Mo(u)rning|Hold You Down|Top Billin’|Bling Bling|The Bridge Is Over|Learned from Texas|Dr Aden|Root Down|Warm It Up Kane|Put It On|Still Fly|Respiration|How To Rap About Africa|No Diggity|OVERSEAS|Tha Crossroads|Woo Hah!! Got You All In Check|How We Roll|Bodak Yellow|Love Sosa|We Got It For Cheap (Intro)|I Used To Love H.E.R.|It’s Your World (Part 1 & 2)|Flava In Ya Ear (Remix)|Insane In The Brain|Scotty|Slippin'|They Want EFX|Hahahaha jk?|I Am I Be|I've Seen Footage|Dipset Anthem|I Luv U|Double Trouble At The Amphitheatre|La Di Da Di|Puppet Master|Still D.R.E.|Fuck Wit Dre Day (And Everybody’s Celebratin’)|God’s Plan|Nice For What|HYFR|Sideways|Swangin’ and Bangin'|Get The Bozack|Grief|Tried by 12|Boyz-n-the-Hood|My Name Is|Stan|As The Rhyme Goes On|Don’t Sweat The Technique|Follow The Leader|Know The Ledge|Lyrics Of Fury|Paid In Full (Seven Minutes Of Madness – The Coldcut Remix)|Love Of My Life (An Ode To Hip Hop)|Wipe Me Down (Remix)|Oh Yeah|Self Control|Fight Da Faida|March Madness|Mask Off|Turn On The Lights|Play That Beat Mr DJ|Mass Appeal|Moment Of Truth|Above The Clouds|Mind Playing Tricks On Me|Nutmeg|Cherchez La Ghost|Black Ice|The Message|White Lines|Bible On The Dash|4th Chamber|Je Danse Le Mia|It Was A Good Day (B-Side Remix version)|Trap Beldi|Love Yourz|Who Dat|22 Two’s|Can I Live|Can’t Knock The Hustle|Dirt Off Your Shoulder|D’Evils|Heart Of The City (Ain’t No Love)|Hovi Baby|Lucifer|Marcy Me|Never Change|Party Life|Regrets|The Story Of OJ|Where I’m From|No Church in the Wild|Renegade|Ain’t No N*gga|Big Pimpin'|Livin’ It Up|I Like That|Exhibit C|Rock Wit U|Clear Blue Skies|Get Money|Concrete Schoolyard|Ha|Black Cop|Blood On The Leaves|Can’t Tell Me Nothing|I Wonder|Monster|Ultralight Beam|Lost In The World|Gold Digger|Runaway|All Of The Lights|All Falls Down|Ngqangqa|Backseat Freestyle|Bitch Don’t Kill My Vibe|DNA|Humble|Mortal Man|PRIDE|Swimming Pools (Drank)|The Blacker The Berry|m.A.A.d. city|Cartoons & Cereal|Day 'N' Nite|B.I.B.L.E. (Basic Instructions Before Leaving Earth)|Shinjitsu No Dangan|Gucci Gucci|The Breaks|Lost Ones|I Used To Love Him|What About Me|Old Town Road (Remix)|Cannon|Fuck Tha World|Gossip|La La La|Queen Bitch|Slow It Down|Déjà Vu (Uptown Baby)|I Got 5 On It|Jonylah Forever|Mural|Real|Paper Planes|Feelin’ Myself|All Caps|Looking At The Front Door|Bout It Bout It|Realer|Da Rockwilder|Still Tippin’|Lose Control|Get Ur Freak On|Pass That Dutch|The Rain (Supa Dupa Fly)|Sock It 2 Me|Quiet Storm (Remix ft. Lil Kim)|Quiet Storm (Remix)|Hip Hop|Straight Outta Compton|Straight Outta Compton (Extended Mix)|I Gave You Power|Memory Lane (Sittin’ in da Park)|One Love|One Mic|The World Is Yours|Life’s A Bitch|If I Ruled The World (Imagine That)|Just A Moment|O.P.P.|Country Grammar|Super Bass|Time’s Up|Last Dayz|Atrevido|Da Art Of Storytellin’|Da Art of Storytellin’ (Pt. 2)|Elevators (Me & You)|Liberation|Ms Jackson|Rosa Parks|Ain’t No Thang|SpottieOttieDopaliscious|They Reminisce Over You (T.R.O.Y.)|Soweto|We Can Get Gangsta|Black Steel In The Hour Of Chaos|Rebel Without A Pause|Terminator X To The Edge of Panic|I’ll Be Missing You|It’s All About The Benjamins (Remix)|Verbal Intercourse|Guess Who’s Back|Beat Bop|Nature of the Threat|Throw Some D’s|Flava|Witness (1 Hope)|Have a Nice Day|Peter Piper|Walk This Way|Love Again (Akinyele Back)|Shoop|Mtaktak|Baby Got Back|That’s Not Me|Umoya|Mona Lisa|Players|Who Am I (What’s My Name)?|93 ’Til Infinity|The Black God|Sub City|Self Destruction|Rapper’s Delight|Get By|Vicious Rap|Ghetto Manifesto|I Really Mean It|Fuck You|Sky’s The Limit|Hypnotize|Things Done Changed|Warning|I Love The Dough|The What|Act Too (Love of My Life)|You Got Me|Sippin On Some Syrup|Freaky Tales|Goosebumps|Bastard|One Day|International Players Anthem|Hard In Da Paint|Wot Do U Call It?|Ojuelegba (Remix)|Da Mystery Of Chessboxin'|Bring Da Ruckus|Protect Ya Neck|Triumph|Wu-Tang Clan Ain’t Nuthing Ta Fuck Wit|Look At Me!|New World Water|I Heard|Pacifier|Takkies|Kyoto","sep":"|"},{"f":"0The Notorious B.I.G.|0Public Enemy|0Mobb Deep|0Dr Dre ft. Snoop Doggy Dogg|0Wu-Tang Clan|0The Pharcyde|0Nas|02Pac|0Eric B & Rakim|0NWA|0A Tribe Called Quest|0OutKast|0Ice Cube|0Queen Latifah|0Lauryn Hill|0Eminem|0Kanye West|1endrick Lamar|0Clipse|0The Fugees|0Run DMC|0Missy Elliott|0Dead Prez|0Kanye West ft. Rihanna & Kid Cudi|0DMX|0Future|0JAY-Z|0Lil Wayne|0Gang Starr|0Lupe Fiasco|0Stogie T|0UGK|0Madvillain|0Slick Rick|0Common|0Salt-N-Pepa|0Drake|0Beastie Boys|02Pac|4|4|4|4|4 ft. Dr Dre|9Talent|03X Krazy|050 Cent|0A Tribe Called Quest|k|k|k|k|k|1KA|1SAP Rocky|1ceyalone|1frika Bambaataa & The Soulsonic Force|1khenaton|2ua Naru|1lchemist ft. Nina Sky & Prodigy & Illa Ghee|1udio Two|0B.G.|1DP|1IG K.R.I.T|1OB|1eastie Boys|1ig Daddy Kane|4L|4Tymers|1lack Star ft. Common|6Vulcanite|5street ft. Dr Dre and Queen Pen|1ohan Phoenix|2ne Thugs-N-Harmony|1usta Rhymes|0Canibus|2rdi B|1hief Keef|1lipse|1ommon|6|1raig Mack|1ypress Hill|0D4L|1MX|1as EFX|4Racist|1e La Soul|2ath Grips|1iplomats ft. Juelz Santana & Cam’ron|2zzee Rascal|1ouble Trouble|3g E Fresh & The Get Fresh Crew|1r Dre ft. B-Real|bSnoop Dogg|ly Dogg|2ake|5|5 ft. Lil Wayne|0E-40 feat B-Legit & Mac Shon|1.S.G.|1PMD|1arl Sweatshirt|2st Flatbush Project|2zy-E|1minem|6 ft. Dido|1ric B & Rakim|e|e|e|e|e|2ykah Badu ft. Common|0Foxx & Lil Boosie & Webbie|3y Brown|1rank Ocean|5ie HI-NRG MC|1uture|6|6|0GLOBE & Whiz Kid|1ang Starr|a|a ft. Inspectah Deck|1eto Boys|1hostface Killah|g ft. Madam Majestic & U-God|1oodie Mob ft. OutKast|1randmaster Flash & The Furious Five|cMelle Mel|1unplay|1za ft. Ghostface Killah & Killah Priest & RZA|0IAM|1ce Cube|1ssam|0J Cole|1.T. Money ft. Solé|1AY-Z|5|5|5|5|5|5|5|5|5|5|5|5|5|5 & Kanye West|6ft. Eminem|aFoxy Brown|aUGK|1a Rule ft. Case|2nelle Monae|2y Electronica|1oe ft. G-Unit|1uggaknots|2nior M.A.F.I.A. ft. The Notorious B.I.G.|2rassic 5|2venile|0KRS-One|1anye West|a|a|a|a|a ft. Bon Iver|fJamie Foxx|fPusha T|fRihanna & Kid Cudi|fSyleena Johnson|4i|1endrick Lamar|e|e|e|e|e|e|e|e|e ft. Gunplay|1id Cudi|2llah Priest|2ng Giddra|1reayshawn|1urtis Blow|0Lauryn Hill|b ft. Mary J Blige|1il Boosie|4Nas X ft. Billy Ray Cyrus|4Wayne|9|9|9|3’ Kim|2ttle Brother|1ord Tariq & Peter Gunz|1uniz|2pe Fiasco|b|b|0M.I.A.|1ac Dre|2dvillain|2in Source|2ster P|1egan Thee Stallion|2thod Man and Redman|1ike Jones|2ssy Elliot ft. Ciara and Fatman Scoop|ct|d|d|d ft. Da Brat|1obb Deep|9 ft. Lil’ Kim|2s Def|0NWA|3|1as|3|3|3|3|3 ft. A.Z.|8Lauryn Hill|8Quan|2ughty By Nature|1elly|1icki Minaj|0O.C.|1nyx|1rishas|1utKast|7|7|7|7|7|3kast|7|0Pete Rock & C.L. Smooth|1roKid|3ject Pat|1ublic Enemy|c|c|2ff Daddy ft. Faith Evans and 112|fThe Notorious B.I.G. & Lil’ Kim & The LOX|0Raekwon ft. Ghostface Killah and Nas|2kim|2mmellzee & K Rob|2s Kass|1ich Boy|5Gang|1oots Manuva|2xanne Shante|1un DMC|7|4The Jewels ft. Gangsta Boo|0Salt-N-Pepa|1habjdeed & Al Nather|1ir Mix-A-Lot|1kepta ft. Jme|2watta Kamp|1lick Rick|2um Village|1noop Dogg|1ouls of Mischief|1paceGhostPurrp|1togie T|3p The Violence Movement|1ugarhill Gang|0Talib Kweli|2nya ‘Sweet Tee’ Winley|1he Coup|4Diplomats|4LOX|4Notorious B.I.G ft. 112|j.|k|k|k ft. JAY-Z & Angela Winbush|pMethod Man|4Roots|9 ft. Erykah Badu|2ree 6 Mafia ft. UGK|1oo $hort|1ravis Scott ft. Kendrick Lamar|1yler The Creator|0UGK|3 ft. OutKast|0Waka Flocka Flame|1iley|2zkid ft. Drake & Skepta|1u-Tan Clan|6g Clan|c|c|c|0XXXTENTACION|0Yasiin Bey (Mos Def)|1oung Fathers|6Thug|5staCPT|1ung Lean","sep":"|"},{"d":"male|female|mixed","r":"0*d,1*2,0*4,2*1,0*1,1*1,0*1,2*1,0*b,1*1,0*m,1*1,2*1,0*b,2*1,0*4,1*1,0*t,2*1,0*6,2*1,0*1,1*1,0*b,2*1,0*9,2*1,0*g,2*1,0*2,1*1,0*2,2*1,0*d,2*1,1*1,0*d,1*1,0*1,1*2,0*6,1*1,0*6,1*1,0*4,1*1,0*2,2*1,1*4,0*1,2*1,0*9,2*1,0*3,1*1,0*h,2*2,0*7,1*1,0*2,2*1,1*1,0*a,2*1,0*2,1*1,0*7,2*1,0*2,2*1,0*k","sep":"|"},{"d":"3|1|2|0","r":"0*1,1*2,2*1,1*1,3*1,1*2,0*1,2*1,1*1,3*1,1*3,3*1,2*1,1*2,0*1,3*1,2*1,1*1,3*2,1*2,3*5,1*5,3*6,1*1,3*4,1*1,3*2,1*1,3*3,1*1,3*2,1*1,3*4,1*2,3*2,1*1,3*4,1*1,3*3,1*1,3*9,1*2,3*6,2*1,3*6,1*1,3*8,1*2,3*4,1*1,3*2,1*1,3*2,1*1,3*6,1*1,3*5,1*1,3*4,1*1,3*9,1*1,3*1,1*1,3*3,1*1,3*4,1*1,3*4,1*1,3*1,1*1,3*3,0*1,3*8,1*3,3*1,1*1,3*5,1*1,3*1,1*2,3*4,1*1,3*2,1*1,3*2,1*2,3*3,1*1,3*2,1*1,3*1,1*1,3*8,1*1,3*6,1*1,3*1,1*1,3*3,1*2,3*1,1*1,3*2,1*1,3*1,1*1,2*1,3*3,1*1,3*3,1*1,3*7,1*1,3*a,2*1,3*1,1*1,3*3,1*1,3*4,1*1,3*3,1*3,3*5,1*2,3*3,1*1,3*2,1*1,3*6","sep":"|"}]}]);
const COLONY = [
{"id":"n-f9a29742","guard":[["has","artist"],["not",["has","were"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of One Mic":"The artist of One Mic is Nas.","what is the artist of Follow The Leader":"The artist of Follow The Leader is Eric B & Rakim.","tell me the artist of the title Love Of My Life (An Ode To Hip Hop)":"The artist of Love Of My Life (An Ode To Hip Hop) is Erykah Badu ft. Common.","tell me the artist of the title Just A Moment":"The artist of Just A Moment is Nas ft. Quan.","give the artist for Wipe Me Down (Remix)":"The artist of Wipe Me Down (Remix) is Foxx & Lil Boosie & Webbie.","tell me the artist of the title Fuck Tha Police":"The artist of Fuck Tha Police is NWA.","tell me the artist of the title The Bridge Is Over":"The artist of The Bridge Is Over is BDP.","what is the artist of Put It On":"The artist of Put It On is Big L.","what is the artist of What About Me":"The artist of What About Me is Lil Boosie.","what is the artist of As The Rhyme Goes On":"The artist of As The Rhyme Goes On is Eric B & Rakim.","what is the artist of Respiration":"The artist of Respiration is Black Star ft. Common.","give the artist for Kyoto":"The artist of Kyoto is Yung Lean.","tell me the artist of the title I Luv U":"The artist of I Luv U is Dizzee Rascal.","what is the artist of Ambitionz Az A Ridah":"The artist of Ambitionz Az A Ridah is 2Pac.","give the artist for Love Yourz":"The artist of Love Yourz is J Cole.","what is the artist of No Diggity":"The artist of No Diggity is Blackstreet ft. Dr Dre and Queen Pen.","what is the artist of Regrets":"The artist of Regrets is JAY-Z.","what is the artist of Things Done Changed":"The artist of Things Done Changed is The Notorious B.I.G..","tell me the artist of the title It’s Your World (Part 1 & 2)":"The artist of It’s Your World (Part 1 & 2) is Common.","give the artist for Sim Dope":"The artist of Sim Dope is AKA.","tell me the artist of the title Runaway":"The artist of Runaway is Kanye West ft. Pusha T.","give the artist for Still Tippin’":"The artist of Still Tippin’ is Mike Jones.","what is the artist of Bling Bling":"The artist of Bling Bling is B.G..","what is the artist of Shinjitsu No Dangan":"The artist of Shinjitsu No Dangan is King Giddra.","what is the artist of A Milli":"The artist of A Milli is Lil Wayne.","give the artist for OVERSEAS":"The artist of OVERSEAS is Bohan Phoenix.","tell me the artist of the title Slow It Down":"The artist of Slow It Down is Little Brother.","give the artist for Bonita Applebum":"The artist of Bonita Applebum is A Tribe Called Quest.","what is the artist of Nature of the Threat":"The artist of Nature of the Threat is Ras Kass.","give the artist for You Got Me":"The artist of You Got Me is The Roots ft. Erykah Badu.","give the artist for Boyz-n-the-Hood":"The artist of Boyz-n-the-Hood is Eazy-E.","give the artist for I Got 5 On It":"The artist of I Got 5 On It is Luniz.","what is the artist of Renegade":"The artist of Renegade is JAY-Z ft. Eminem.","tell me the artist of the title Fuck You":"The artist of Fuck You is The LOX.","give the artist for All Falls Down":"The artist of All Falls Down is Kanye West ft. Syleena Johnson.","tell me the artist of the title Elevators (Me & You)":"The artist of Elevators (Me & You) is OutKast.","give the artist for We Can Get Gangsta":"The artist of We Can Get Gangsta is Project Pat.","tell me the artist of the title Protect Ya Neck":"The artist of Protect Ya Neck is Wu-Tang Clan.","give the artist for Hard Knock Life":"The artist of Hard Knock Life is JAY-Z.","what is the artist of B.I.B.L.E. (Basic Instructions Before Leaving Earth)":"The artist of B.I.B.L.E. (Basic Instructions Before Leaving Earth) is Killah Priest.","tell me the artist of the title Da Art Of Storytellin’":"The artist of Da Art Of Storytellin’ is OutKast.","what is the artist of Hypnotize":"The artist of Hypnotize is The Notorious B.I.G..","give the artist for Changes":"The artist of Changes is 2Pac ft. Talent.","give the artist for PRIDE":"The artist of PRIDE is Kendrick Lamar.","tell me the artist of the title Concrete Schoolyard":"The artist of Concrete Schoolyard is Jurassic 5.","what is the artist of The World Is Yours":"The artist of The World Is Yours is Nas.","tell me the artist of the title Still D.R.E.":"The artist of Still D.R.E. is Dr Dre ft. Snoop Dogg.","what is the artist of America’s Most Blunted":"The artist of America’s Most Blunted is Madvillain.","tell me the artist of the title La Di Da Di":"The artist of La Di Da Di is Doug E Fresh & The Get Fresh Crew.","tell me the artist of the title Grief":"The artist of Grief is Earl Sweatshirt.","what is the artist of SpottieOttieDopaliscious":"The artist of SpottieOttieDopaliscious is Outkast.","what is the artist of They Reminisce Over You (T.R.O.Y.)":"The artist of They Reminisce Over You (T.R.O.Y.) is Pete Rock & C.L. Smooth.","what is the artist of Warm It Up Kane":"The artist of Warm It Up Kane is Big Daddy Kane.","what is the artist of Paid In Full":"The artist of Paid In Full is Eric B & Rakim.","tell me the artist of the title Bring Da Ruckus":"The artist of Bring Da Ruckus is Wu-Tang Clan.","give the artist for Bodak Yellow":"The artist of Bodak Yellow is Cardi B.","tell me the artist of the title Alright":"The artist of Alright is Kendrick Lamar.","what is the artist of Queen Bitch":"The artist of Queen Bitch is Lil’ Kim.","tell me the artist of the title L'Americano":"The artist of L'Americano is Akhenaton.","tell me the artist of the title Bitch Don’t Kill My Vibe":"The artist of Bitch Don’t Kill My Vibe is Kendrick Lamar.","what is the artist of I Am I Be":"The artist of I Am I Be is De La Soul.","give the artist for We Got It For Cheap (Intro)":"The artist of We Got It For Cheap (Intro) is Clipse.","tell me the artist of the title Triumph":"The artist of Triumph is Wu-Tang Clan.","what is the artist of Terminator X To The Edge of Panic":"The artist of Terminator X To The Edge of Panic is Public Enemy.","tell me the artist of the title Dipset Anthem":"The artist of Dipset Anthem is Diplomats ft. Juelz Santana & Cam’ron.","tell me the artist of the title No Church in the Wild":"The artist of No Church in the Wild is JAY-Z & Kanye West.","tell me the artist of the title Know The Ledge":"The artist of Know The Ledge is Eric B & Rakim.","give the artist for Mtaktak":"The artist of Mtaktak is Shabjdeed & Al Nather.","give the artist for Codeine Crazy":"The artist of Codeine Crazy is Future.","tell me the artist of the title Fight Da Faida":"The artist of Fight Da Faida is Frankie HI-NRG MC.","what is the artist of Witness (1 Hope)":"The artist of Witness (1 Hope) is Roots Manuva.","give the artist for Can’t Tell Me Nothing":"The artist of Can’t Tell Me Nothing is Kanye West.","tell me the artist of the title All Caps":"The artist of All Caps is Madvillain.","what is the artist of Aiiight Chill":"The artist of Aiiight Chill is Gang Starr.","what is the artist of Old Town Road (Remix)":"The artist of Old Town Road (Remix) is Lil Nas X ft. Billy Ray Cyrus.","tell me the artist of the title One Day":"The artist of One Day is UGK.","give the artist for Work It":"The artist of Work It is Missy Elliott.","give the artist for International Players Anthem":"The artist of International Players Anthem is UGK ft. OutKast.","give the artist for Looking At The Front Door":"The artist of Looking At The Front Door is Main Source.","tell me the artist of the title Umoya":"The artist of Umoya is Skwatta Kamp.","give the artist for The What":"The artist of The What is The Notorious B.I.G. ft. Method Man.","tell me the artist of the title Love Is…":"The artist of Love Is… is Common.","tell me the artist of the title The Rain (Supa Dupa Fly)":"The artist of The Rain (Supa Dupa Fly) is Missy Elliott.","tell me the artist of the title Warning":"The artist of Warning is The Notorious B.I.G..","give the artist for Gold Digger":"The artist of Gold Digger is Kanye West ft. Jamie Foxx.","give the artist for March Madness":"The artist of March Madness is Future.","give the artist for 1 Train":"The artist of 1 Train is ASAP Rocky.","tell me the artist of the title B.O.B.":"The artist of B.O.B. is OutKast.","give the artist for Exhibit C":"The artist of Exhibit C is Jay Electronica.","what is the artist of Above The Clouds":"The artist of Above The Clouds is Gang Starr ft. Inspectah Deck.","what is the artist of One Love":"The artist of One Love is Nas.","what is the artist of Bible On The Dash":"The artist of Bible On The Dash is Gunplay.","give the artist for Da Art of Storytellin’ (Pt. 2)":"The artist of Da Art of Storytellin’ (Pt. 2) is OutKast.","give the artist for Lost Ones":"The artist of Lost Ones is Lauryn Hill.","give the artist for Flava":"The artist of Flava is Rich Gang.","tell me the artist of the title It Was A Good Day (B-Side Remix version)":"The artist of It Was A Good Day (B-Side Remix version) is Ice Cube.","give the artist for The Black God":"The artist of The Black God is SpaceGhostPurrp.","what is the artist of Mask Off":"The artist of Mask Off is Future.","give the artist for Life’s A Bitch":"The artist of Life’s A Bitch is Nas ft. A.Z..","what is the artist of If I Ruled The World (Imagine That)":"The artist of If I Ruled The World (Imagine That) is Nas ft. Lauryn Hill."}}},
{"id":"n-fda66b57","guard":[["has","artist"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"artist"}]]],"mem":{"table":{"of One Mic":"The artist of One Mic is Nas.","of Follow The Leader":"The artist of Follow The Leader is Eric B & Rakim.","of the title Love Of My Life (An Ode To Hip Hop)":"The artist of Love Of My Life (An Ode To Hip Hop) is Erykah Badu ft. Common.","of the title Just A Moment":"The artist of Just A Moment is Nas ft. Quan.","for Wipe Me Down (Remix)":"The artist of Wipe Me Down (Remix) is Foxx & Lil Boosie & Webbie.","of the title Fuck Tha Police":"The artist of Fuck Tha Police is NWA.","of the title The Bridge Is Over":"The artist of The Bridge Is Over is BDP.","of Put It On":"The artist of Put It On is Big L.","of What About Me":"The artist of What About Me is Lil Boosie.","of As The Rhyme Goes On":"The artist of As The Rhyme Goes On is Eric B & Rakim.","of Respiration":"The artist of Respiration is Black Star ft. Common.","for Kyoto":"The artist of Kyoto is Yung Lean.","of the title I Luv U":"The artist of I Luv U is Dizzee Rascal.","of Ambitionz Az A Ridah":"The artist of Ambitionz Az A Ridah is 2Pac.","for Love Yourz":"The artist of Love Yourz is J Cole.","of No Diggity":"The artist of No Diggity is Blackstreet ft. Dr Dre and Queen Pen.","of Regrets":"The artist of Regrets is JAY-Z.","of Things Done Changed":"The artist of Things Done Changed is The Notorious B.I.G..","of the title It’s Your World (Part 1 & 2)":"The artist of It’s Your World (Part 1 & 2) is Common.","for Sim Dope":"The artist of Sim Dope is AKA.","of the title Runaway":"The artist of Runaway is Kanye West ft. Pusha T.","for Still Tippin’":"The artist of Still Tippin’ is Mike Jones.","of Bling Bling":"The artist of Bling Bling is B.G..","of Shinjitsu No Dangan":"The artist of Shinjitsu No Dangan is King Giddra.","of A Milli":"The artist of A Milli is Lil Wayne.","for OVERSEAS":"The artist of OVERSEAS is Bohan Phoenix.","of the title Slow It Down":"The artist of Slow It Down is Little Brother.","for Bonita Applebum":"The artist of Bonita Applebum is A Tribe Called Quest.","of Nature of the Threat":"The artist of Nature of the Threat is Ras Kass.","for You Got Me":"The artist of You Got Me is The Roots ft. Erykah Badu.","for Boyz-n-the-Hood":"The artist of Boyz-n-the-Hood is Eazy-E.","for I Got 5 On It":"The artist of I Got 5 On It is Luniz.","of Renegade":"The artist of Renegade is JAY-Z ft. Eminem.","of the title Fuck You":"The artist of Fuck You is The LOX.","for All Falls Down":"The artist of All Falls Down is Kanye West ft. Syleena Johnson.","of the title Elevators (Me & You)":"The artist of Elevators (Me & You) is OutKast.","for We Can Get Gangsta":"The artist of We Can Get Gangsta is Project Pat.","of the title Protect Ya Neck":"The artist of Protect Ya Neck is Wu-Tang Clan.","for Hard Knock Life":"The artist of Hard Knock Life is JAY-Z.","of B.I.B.L.E. (Basic Instructions Before Leaving Earth)":"The artist of B.I.B.L.E. (Basic Instructions Before Leaving Earth) is Killah Priest.","of the title Da Art Of Storytellin’":"The artist of Da Art Of Storytellin’ is OutKast.","of Hypnotize":"The artist of Hypnotize is The Notorious B.I.G..","for Changes":"The artist of Changes is 2Pac ft. Talent.","for PRIDE":"The artist of PRIDE is Kendrick Lamar.","of the title Concrete Schoolyard":"The artist of Concrete Schoolyard is Jurassic 5.","of The World Is Yours":"The artist of The World Is Yours is Nas.","of the title Still D.R.E":"The artist of Still D.R.E. is Dr Dre ft. Snoop Dogg.","of America’s Most Blunted":"The artist of America’s Most Blunted is Madvillain.","of the title La Di Da Di":"The artist of La Di Da Di is Doug E Fresh & The Get Fresh Crew.","of the title Grief":"The artist of Grief is Earl Sweatshirt.","of SpottieOttieDopaliscious":"The artist of SpottieOttieDopaliscious is Outkast.","of They Reminisce Over You (T.R.O.Y.)":"The artist of They Reminisce Over You (T.R.O.Y.) is Pete Rock & C.L. Smooth.","of Warm It Up Kane":"The artist of Warm It Up Kane is Big Daddy Kane.","of Paid In Full":"The artist of Paid In Full is Eric B & Rakim.","of the title Bring Da Ruckus":"The artist of Bring Da Ruckus is Wu-Tang Clan.","for Bodak Yellow":"The artist of Bodak Yellow is Cardi B.","of the title Alright":"The artist of Alright is Kendrick Lamar.","of Queen Bitch":"The artist of Queen Bitch is Lil’ Kim.","of the title L'Americano":"The artist of L'Americano is Akhenaton.","of the title Bitch Don’t Kill My Vibe":"The artist of Bitch Don’t Kill My Vibe is Kendrick Lamar.","of I Am I Be":"The artist of I Am I Be is De La Soul.","for We Got It For Cheap (Intro)":"The artist of We Got It For Cheap (Intro) is Clipse.","of the title Triumph":"The artist of Triumph is Wu-Tang Clan.","of Terminator X To The Edge of Panic":"The artist of Terminator X To The Edge of Panic is Public Enemy.","of the title Dipset Anthem":"The artist of Dipset Anthem is Diplomats ft. Juelz Santana & Cam’ron.","of the title No Church in the Wild":"The artist of No Church in the Wild is JAY-Z & Kanye West.","of the title Know The Ledge":"The artist of Know The Ledge is Eric B & Rakim.","for Mtaktak":"The artist of Mtaktak is Shabjdeed & Al Nather.","for Codeine Crazy":"The artist of Codeine Crazy is Future.","of the title Fight Da Faida":"The artist of Fight Da Faida is Frankie HI-NRG MC.","of Witness (1 Hope)":"The artist of Witness (1 Hope) is Roots Manuva.","for Can’t Tell Me Nothing":"The artist of Can’t Tell Me Nothing is Kanye West.","of the title All Caps":"The artist of All Caps is Madvillain.","of Aiiight Chill":"The artist of Aiiight Chill is Gang Starr.","of Old Town Road (Remix)":"The artist of Old Town Road (Remix) is Lil Nas X ft. Billy Ray Cyrus.","of the title One Day":"The artist of One Day is UGK.","for Work It":"The artist of Work It is Missy Elliott.","for International Players Anthem":"The artist of International Players Anthem is UGK ft. OutKast.","for Looking At The Front Door":"The artist of Looking At The Front Door is Main Source.","of the title Umoya":"The artist of Umoya is Skwatta Kamp.","for The What":"The artist of The What is The Notorious B.I.G. ft. Method Man.","of the title Love Is…":"The artist of Love Is… is Common.","of the title The Rain (Supa Dupa Fly)":"The artist of The Rain (Supa Dupa Fly) is Missy Elliott.","of the title Warning":"The artist of Warning is The Notorious B.I.G..","for Gold Digger":"The artist of Gold Digger is Kanye West ft. Jamie Foxx.","for March Madness":"The artist of March Madness is Future.","for 1 Train":"The artist of 1 Train is ASAP Rocky.","of the title B.O.B":"The artist of B.O.B. is OutKast.","for Exhibit C":"The artist of Exhibit C is Jay Electronica.","of Above The Clouds":"The artist of Above The Clouds is Gang Starr ft. Inspectah Deck.","of One Love":"The artist of One Love is Nas.","of Bible On The Dash":"The artist of Bible On The Dash is Gunplay.","for Da Art of Storytellin’ (Pt. 2)":"The artist of Da Art of Storytellin’ (Pt. 2) is OutKast.","for Lost Ones":"The artist of Lost Ones is Lauryn Hill.","for Flava":"The artist of Flava is Rich Gang.","of the title It Was A Good Day (B-Side Remix version)":"The artist of It Was A Good Day (B-Side Remix version) is Ice Cube.","for The Black God":"The artist of The Black God is SpaceGhostPurrp.","of Mask Off":"The artist of Mask Off is Future.","for Life’s A Bitch":"The artist of Life’s A Bitch is Nas ft. A.Z..","of If I Ruled The World (Imagine That)":"The artist of If I Ruled The World (Imagine That) is Nas ft. Lauryn Hill."}}},
{"id":"n-c113eb78","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","capital letters","capitals","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kane","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","title","train","upper case","uppercase","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-cb531a6e","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","capital letters","capitals","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kane","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","title","train","upper case","uppercase","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.code",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-ce67394f","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","capital letters","capitals","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kane","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","title","train","upper case","uppercase","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-50ab9d1b","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","capital letters","capitals","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kane","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","title","train","upper case","uppercase","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is ",{"slot":1},"."]},["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-a26e3fdc","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kane","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","title","train","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-e8c001dc","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kane","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","title","train","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.code",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-07eb53b3","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kane","kyoto","lost","lower case","lowercase","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","small letters","spottieottiedopaliscious","still","title","train","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.code",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-5e8e6279","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kane","kyoto","lost","lower case","lowercase","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","small letters","spottieottiedopaliscious","still","title","train","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-84d0625f","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","invert case","item number","kane","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","swap case","title","toggle case","train","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-95ca9d2b","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","invert case","item number","kane","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","swap case","title","toggle case","train","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.code",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-9ae13010","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","capitalise","capitalize","capitalize each word","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kane","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","title","title case","train","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.code",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-ddfe0175","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","capitalise","capitalize","capitalize each word","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kane","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","title","title case","train","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-1c378f22","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kane","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","title","train","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-c54988a6","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kane","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","title","train","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is ",{"slot":1},"."]},["render.and",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-5253a26b","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kane","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","title","train","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-111f00fb","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","capitalise","capitalize","capitalize each word","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kane","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","title","title case","train","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is ",{"slot":1},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-a061838e","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","invert case","item number","kane","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","swap case","title","toggle case","train","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is ",{"slot":1},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-cdfc3fcb","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kane","kyoto","lost","lower case","lowercase","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","small letters","spottieottiedopaliscious","still","title","train","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is ",{"slot":1},"."]},["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-4f966037","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","changed","codeine","da","dash","delete","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","strip out","title","train","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.lastWord"]]],"mem":null},
{"id":"n-7f7acb62","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","changed","codeine","da","dash","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","separate by","split","split by","spottieottiedopaliscious","still","title","train","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.lastWord"]]],"mem":null},
{"id":"n-c2d59219","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","bodak","boyznthehood","c","cant","changed","codeine","da","dash","delete","digger","door","dope","down","edge","flava","follow","full","gangsta","goes","hope","hypnotize","item number","kyoto","lost","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","strip out","title","train","work"]],["has","artist"],["not",["has","bad"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.lastWord"]]],"mem":null},
{"id":"n-fd25e6c6","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","boyznthehood","c","cant","capital letters","capitals","changed","codeine","da","dash","digger","door","dope","edge","flava","follow","full","gangsta","goes","hard","hope","hypnotize","item number","kane","kyoto","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","title","train","upper case","uppercase"]],["has","artist"],["not",["has","around"]],["not",["has","bad"]]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is ",{"slot":1},"."]},["transform.upper",["transform.nthStr",["know.where",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"gender"},{"lit":"male"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-8ad6840c","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bitch","black","bling","boyznthehood","c","cant","changed","codeine","da","dash","digger","door","dope","edge","flava","follow","full","gangsta","goes","hard","hope","hypnotize","item number","kane","kyoto","madness","mask","milli","mtaktak","nature","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious","still","title","train"]],["has","artist"],["not",["has","around"]],["not",["has","bad"]]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is ",{"slot":1},"."]},["transform.nthStr",["know.where",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"gender"},{"lit":"male"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-2893fcd4","guard":[["hasAny",["about","above","aiiight","am","ambitionz","americas","anthem","applebum","bitch","black","bling","bob","bodak","boyznthehood","bring","c","caesar cipher","cant","changed","cheap","codeine","concrete","dash","di","digger","door","dope","down","dupa","edge","elevators","faida","flava","follow","fuck","full","gangsta","goes","grief","hypnotize","imagine","item number","kane","know","kyoto","lamericano","lost","luv","madness","mask","milli","moment","mtaktak","nature","neck","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","rotate the letters","runaway","shift by","shift each letter","spottieottiedopaliscious","still","triumph","umoya","warning","work","yours"]],["has","artist"],["not",["has","agin"]],["not",["has","beer"]],["not",["has","bruno"]],["nums==",0]],"pyramid":["render.code",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.howMany"]]],"mem":null},
{"id":"n-7bd1e4fd","guard":[["hasAny",["about","above","aiiight","am","ambitionz","americas","anthem","applebum","bitch","black","bling","bob","bodak","boyznthehood","bring","c","caesar cipher","cant","changed","cheap","codeine","concrete","dash","di","digger","door","dope","down","dupa","edge","elevators","faida","flava","follow","fuck","full","gangsta","goes","grief","hypnotize","imagine","item number","kane","know","kyoto","lamericano","lost","luv","madness","mask","milli","moment","mtaktak","nature","neck","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","rotate the letters","runaway","shift by","shift each letter","spottieottiedopaliscious","still","triumph","umoya","warning","work","yours"]],["has","artist"],["not",["has","agin"]],["not",["has","beer"]],["not",["has","bruno"]],["nums==",0]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.howMany"]]],"mem":null},
{"id":"n-a3df1fe0","guard":[["hasAny",["about","above","aiiight","am","ambitionz","americas","anthem","applebum","bitch","black","bling","bob","bodak","boyznthehood","bring","c","caesar cipher","cant","changed","cheap","codeine","concrete","dash","di","digger","door","dope","down","dupa","edge","elevators","faida","flava","follow","fuck","full","gangsta","goes","grief","hypnotize","imagine","item number","kane","know","kyoto","lamericano","lost","luv","madness","mask","milli","moment","mtaktak","nature","neck","nth","over","overseas","pride","put","regrets","remix","renegade","respiration","rotate the letters","runaway","shift by","shift each letter","spottieottiedopaliscious","still","triumph","umoya","warning","work","yours"]],["has","artist"],["not",["has","agin"]],["not",["has","beer"]],["not",["has","bruno"]],["nums==",0]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is ",{"slot":1},"."]},["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-945ed364","guard":[["hasAny",["about","aiiight","am","ambitionz","americas","applebum","art","black","bob","bodak","bridge","c","cant","caps","cheap","codeine","concrete","dangan","dash","door","dope","dupa","edge","elevators","flava","fuck","gangsta","grief","hope","item number","kane","kyoto","lamericano","lost","luv","madness","mask","milli","nature","normalise","normalize","nth","overseas","part","pride","put","simplify the text","slow","spottieottiedopaliscious","tippin","train","umoya","work","yours","yourz"]],["has","artist"],["not",["has","back"]],["not",["has","beer"]],["not",["has","boy"]],["not",["has","bruno"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],{"lit":1}]],"mem":null},
{"id":"n-ba5e2600","guard":[["hasAny",["about","aiiight","am","ambitionz","americas","applebum","art","black","bob","bodak","bridge","c","cant","caps","cheap","codeine","concrete","dangan","dash","door","dope","dupa","edge","elevators","flava","fuck","gangsta","grief","hope","item number","kane","kyoto","lamericano","lost","luv","madness","mask","milli","nature","normalise","normalize","nth","overseas","part","pride","put","simplify the text","slow","spottieottiedopaliscious","tippin","train","umoya","work","yours","yourz"]],["has","artist"],["not",["has","back"]],["not",["has","beer"]],["not",["has","boy"]],["not",["has","bruno"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],{"lit":1}]],"mem":null},
{"id":"n-574b826f","guard":[["hasAny",["about","aiiight","am","ambitionz","americas","art","black","bob","bodak","bridge","c","cant","caps","cheap","codeine","concrete","dangan","dash","door","dope","dupa","edge","elevators","flava","gangsta","grief","hope","item number","kane","kyoto","lamericano","lost","luv","madness","mask","milli","nature","normalise","normalize","nth","overseas","part","police","pride","put","simplify the text","slow","spottieottiedopaliscious","tippin","train","umoya","work","yours","yourz"]],["has","artist"],["not",["has","back"]],["not",["has","beer"]],["not",["has","boy"]],["not",["has","bruno"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],{"lit":2}]],"mem":null},
{"id":"n-65d285dc","guard":[["hasAny",["about","aiiight","am","ambitionz","americas","art","black","bob","bodak","bridge","c","cant","caps","cheap","codeine","concrete","dangan","dash","door","dope","dupa","edge","elevators","flava","gangsta","grief","hope","item number","kane","kyoto","lamericano","lost","luv","madness","mask","milli","nature","normalise","normalize","nth","overseas","part","police","pride","put","simplify the text","slow","spottieottiedopaliscious","tippin","train","umoya","work","yours","yourz"]],["has","artist"],["not",["has","back"]],["not",["has","beer"]],["not",["has","boy"]],["not",["has","bruno"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],{"lit":2}]],"mem":null},
{"id":"n-8e0d8448","guard":[["hasAny",["about","above","am","bitch","black","bling","bob","bodak","bridge","bring","capital letters","capitals","church","dash","di","digger","dipset","dope","down","dupa","faida","flava","follow","fuck","full","goes","grief","item number","kane","know","kyoto","longest","longest one","longest word","lost","luv","mask","milli","moment","nature","nth","old","part","pride","put","still","train","umoya","upper case","uppercase","work","yours"]],["has","artist"],["not",["has","beer"]],["not",["has","bruno"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-9966e8e6","guard":[["hasAny",["about","above","am","bitch","black","bling","bob","bodak","bridge","bring","capital letters","capitals","church","dash","di","digger","dipset","dope","down","dupa","faida","flava","follow","fuck","full","goes","grief","item number","kane","know","kyoto","longest","longest one","longest word","lost","luv","mask","milli","moment","nature","nth","old","part","pride","put","still","train","umoya","upper case","uppercase","work","yours"]],["has","artist"],["not",["has","beer"]],["not",["has","bruno"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.upper",["aggregate.longest",["sense.words"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-207709db","guard":[["hasAny",["about","above","am","bitch","black","bling","bob","bodak","bridge","bring","capital letters","capitals","church","dash","di","digger","dipset","dope","down","dupa","faida","flava","follow","fuck","full","goes","grief","item number","kane","know","kyoto","longest","longest one","longest word","lost","luv","mask","milli","moment","nature","nth","old","part","pride","put","still","train","umoya","upper case","uppercase","work","yours"]],["has","artist"],["not",["has","beer"]],["not",["has","bruno"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-e26d1c93","guard":[["hasAny",["about","above","am","bitch","black","bling","bob","bodak","bridge","bring","church","dash","di","digger","dipset","dope","down","dupa","faida","flava","follow","fuck","full","goes","grief","item number","kane","know","kyoto","longest","longest one","longest word","lost","luv","mask","milli","moment","nature","nth","old","part","pride","put","still","train","umoya","work","yours"]],["has","artist"],["not",["has","beer"]],["not",["has","bruno"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-f2c8628b","guard":[["hasAny",["about","above","am","bitch","black","bling","bob","bodak","bridge","bring","church","dash","di","digger","dipset","dope","down","dupa","faida","flava","follow","fuck","full","goes","grief","item number","kane","know","kyoto","longest","longest one","longest word","lost","luv","mask","milli","moment","nature","nth","old","part","pride","put","still","train","umoya","work","yours"]],["has","artist"],["not",["has","beer"]],["not",["has","bruno"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.and",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-5216f09b","guard":[["hasAny",["about","above","am","bitch","black","bling","bob","bodak","bridge","bring","church","dash","di","digger","dipset","dope","down","dupa","faida","flava","follow","fuck","full","goes","grief","item number","kane","know","kyoto","longest","longest one","longest word","lost","luv","mask","milli","moment","nature","nth","old","part","pride","put","still","train","umoya","work","yours"]],["has","artist"],["not",["has","beer"]],["not",["has","bruno"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-3dcfae4d","guard":[["hasAny",["about","above","am","bitch","black","bling","bob","bodak","bridge","bring","capitalise","capitalize","capitalize each word","church","dash","di","digger","dipset","dope","down","dupa","faida","flava","follow","fuck","full","goes","grief","item number","kane","know","kyoto","longest","longest one","longest word","lost","luv","mask","milli","moment","nature","nth","old","part","pride","put","still","title case","train","umoya","work","yours"]],["has","artist"],["not",["has","beer"]],["not",["has","bruno"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-86c0ed07","guard":[["hasAny",["about","above","am","bitch","black","bling","bob","bodak","bridge","bring","church","dash","di","digger","dipset","dope","down","dupa","faida","flava","follow","fuck","full","goes","grief","item number","kane","know","kyoto","longest","longest one","longest word","lost","lower case","lowercase","luv","mask","milli","moment","nature","nth","old","part","pride","put","small letters","still","train","umoya","work","yours"]],["has","artist"],["not",["has","beer"]],["not",["has","bruno"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-bce8f23f","guard":[["hasAny",["about","above","am","bitch","black","bling","bob","bodak","bridge","bring","church","dash","di","digger","dipset","dope","down","dupa","faida","flava","follow","fuck","full","goes","grief","invert case","item number","kane","know","kyoto","longest","longest one","longest word","lost","luv","mask","milli","moment","nature","nth","old","part","pride","put","still","swap case","toggle case","train","umoya","work","yours"]],["has","artist"],["not",["has","beer"]],["not",["has","bruno"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-75565d61","guard":[["hasAny",["about","above","am","bitch","black","bling","bob","bodak","bridge","bring","caesar cipher","cheap","church","dash","di","digger","dipset","dope","down","dupa","faida","flava","follow","fuck","full","goes","grief","item number","kane","know","kyoto","longest","longest one","longest word","lost","luv","mask","milli","moment","nature","nth","old","pride","put","rotate the letters","shift by","shift each letter","still","umoya","work","yours"]],["has","artist"],["not",["has","beer"]],["not",["has","bruno"]],["nums==",0]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-bac13639","guard":[["hasAny",["about","above","bitch","black","bling","bob","bridge","bring","capital letters","capitals","church","dash","di","digger","dipset","dope","down","faida","flava","follow","fuck","full","goes","grief","hard","item number","kane","know","kyoto","longest","longest one","longest word","luv","mask","milli","moment","nature","nth","old","pride","put","still","train","umoya","upper case","uppercase"]],["has","artist"],["words<=",13],["not",["has","around"]],["not",["has","bad"]],["not",["has","beer"]],["not",["has","bruno"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.upper",["transform.nthStr",["know.where",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"gender"},{"lit":"male"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-471a961e","guard":[["hasAny",["about","above","bitch","black","bling","bob","bridge","bring","church","dash","di","digger","dipset","dope","down","faida","flava","follow","fuck","full","goes","grief","hard","item number","kane","know","kyoto","longest","longest one","longest word","luv","mask","milli","moment","nature","nth","old","pride","put","still","train","umoya"]],["has","artist"],["words<=",13],["not",["has","around"]],["not",["has","bad"]],["not",["has","beer"]],["not",["has","bruno"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["know.where",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"gender"},{"lit":"male"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-3aa22ee2","guard":[["hasAny",["above","all","anthem","bible","bitch","black","bling","bob","bridge","cheap","di","digger","dope","down","dupa","element","faida","flava","follow","fuck","goes","grief","item number","kane","kyoto","longest","longest one","longest word","love","luv","milli","nature","nth","one","part","position","train","umoya","yours"]],["has","artist"],["not",["has","bruno"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["know.where",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"n3"},{"lit":"0"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-3229e03f","guard":[["has","artist"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"Wipe Me Down (Remix)":"The artist of Wipe Me Down (Remix) is Foxx & Lil Boosie & Webbie.","Kyoto":"The artist of Kyoto is Yung Lean.","Love Yourz":"The artist of Love Yourz is J Cole.","Sim Dope":"The artist of Sim Dope is AKA.","Still Tippin’":"The artist of Still Tippin’ is Mike Jones.","OVERSEAS":"The artist of OVERSEAS is Bohan Phoenix.","Bonita Applebum":"The artist of Bonita Applebum is A Tribe Called Quest.","You Got Me":"The artist of You Got Me is The Roots ft. Erykah Badu.","Boyz-n-the-Hood":"The artist of Boyz-n-the-Hood is Eazy-E.","I Got 5 On It":"The artist of I Got 5 On It is Luniz.","All Falls Down":"The artist of All Falls Down is Kanye West ft. Syleena Johnson.","We Can Get Gangsta":"The artist of We Can Get Gangsta is Project Pat.","Hard Knock Life":"The artist of Hard Knock Life is JAY-Z.","Changes":"The artist of Changes is 2Pac ft. Talent.","PRIDE":"The artist of PRIDE is Kendrick Lamar.","Bodak Yellow":"The artist of Bodak Yellow is Cardi B.","We Got It For Cheap (Intro)":"The artist of We Got It For Cheap (Intro) is Clipse.","Mtaktak":"The artist of Mtaktak is Shabjdeed & Al Nather.","Codeine Crazy":"The artist of Codeine Crazy is Future.","Can’t Tell Me Nothing":"The artist of Can’t Tell Me Nothing is Kanye West.","Work It":"The artist of Work It is Missy Elliott.","International Players Anthem":"The artist of International Players Anthem is UGK ft. OutKast.","Looking At The Front Door":"The artist of Looking At The Front Door is Main Source.","The What":"The artist of The What is The Notorious B.I.G. ft. Method Man.","Gold Digger":"The artist of Gold Digger is Kanye West ft. Jamie Foxx.","March Madness":"The artist of March Madness is Future.","1 Train":"The artist of 1 Train is ASAP Rocky.","Exhibit C":"The artist of Exhibit C is Jay Electronica.","Da Art of Storytellin’ (Pt. 2)":"The artist of Da Art of Storytellin’ (Pt. 2) is OutKast.","Lost Ones":"The artist of Lost Ones is Lauryn Hill.","Flava":"The artist of Flava is Rich Gang.","The Black God":"The artist of The Black God is SpaceGhostPurrp.","Life’s A Bitch":"The artist of Life’s A Bitch is Nas ft. A.Z.."}}},
{"id":"n-159690a4","guard":[["hasAny",["applebum","black","bodak","boyznthehood","c","cant","capital letters","capitals","changes","codeine","digger","door","dope","falls","flava","gangsta","got","hard","international","item number","kyoto","lifes","lost","madness","mtaktak","nth","overseas","pride","pt","tippin","train","upper case","uppercase","wipe","work","yourz"]],["has","artist"],["has","give"],["not",["has","around"]],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-f84a3b13","guard":[["hasAny",["applebum","black","bodak","boyznthehood","c","cant","capital letters","capitals","changes","codeine","digger","door","dope","falls","flava","gangsta","got","hard","international","item number","kyoto","lifes","lost","madness","mtaktak","nth","overseas","pride","pt","tippin","train","upper case","uppercase","wipe","work","yourz"]],["has","artist"],["has","give"],["not",["has","around"]],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.upper",["sense.wordAt",{"lit":3}]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-c246f52b","guard":[["hasAny",["applebum","black","bodak","boyznthehood","c","cant","capital letters","capitals","changes","codeine","digger","door","dope","falls","flava","gangsta","got","hard","international","item number","kyoto","lifes","lost","madness","mtaktak","nth","overseas","pride","pt","tippin","train","upper case","uppercase","wipe","work","yourz"]],["has","artist"],["has","give"],["not",["has","around"]],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-8eb7a7ce","guard":[["hasAny",["aiiight","am","ambitionz","americas","art","black","bob","bridge","cant","caps","cheap","codeine","dash","door","dope","elevators","grief","item number","kane","lamericano","luv","madness","mask","milli","normalise","normalize","nth","overseas","part","police","pride","put","simplify the text","spottieottiedopaliscious","train","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],{"lit":3}]],"mem":null},
{"id":"n-e8daad6d","guard":[["hasAny",["aiiight","am","ambitionz","americas","art","black","bob","bridge","cant","caps","cheap","codeine","dash","door","dope","elevators","grief","item number","kane","lamericano","luv","madness","mask","milli","normalise","normalize","nth","overseas","part","police","pride","put","simplify the text","spottieottiedopaliscious","train","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],{"lit":3}]],"mem":null},
{"id":"n-03c7bcde","guard":[["hasAny",["applebum","black","bodak","boyznthehood","c","cant","changes","codeine","digger","door","dope","falls","flava","gangsta","got","hard","international","item number","kyoto","lifes","lost","madness","mtaktak","nth","overseas","pride","pt","tippin","train","wipe","work","yourz"]],["has","artist"],["has","give"],["not",["has","around"]],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.and",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-24c6c6b4","guard":[["hasAny",["applebum","black","bodak","boyznthehood","c","cant","changes","codeine","digger","door","dope","falls","flava","gangsta","got","hard","international","item number","kyoto","lifes","lost","madness","mtaktak","nth","overseas","pride","pt","tippin","train","wipe","work","yourz"]],["has","artist"],["has","give"],["not",["has","around"]],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-b7775eaf","guard":[["hasAny",["applebum","black","bodak","boyznthehood","c","cant","changes","codeine","digger","door","dope","falls","flava","gangsta","got","hard","international","item number","kyoto","lifes","lost","madness","mtaktak","nth","overseas","pride","pt","tippin","train","wipe","work","yourz"]],["has","artist"],["has","give"],["not",["has","around"]],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-aefb3bde","guard":[["hasAny",["applebum","black","bodak","boyznthehood","c","cant","capitalise","capitalize","capitalize each word","changes","codeine","digger","door","dope","falls","flava","gangsta","got","hard","international","item number","kyoto","lifes","lost","madness","mtaktak","nth","overseas","pride","pt","tippin","title case","train","wipe","work","yourz"]],["has","artist"],["has","give"],["not",["has","around"]],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-bb86aa05","guard":[["hasAny",["applebum","black","bodak","boyznthehood","c","cant","changes","codeine","digger","door","dope","falls","flava","gangsta","got","hard","international","invert case","item number","kyoto","lifes","lost","madness","mtaktak","nth","overseas","pride","pt","swap case","tippin","toggle case","train","wipe","work","yourz"]],["has","artist"],["has","give"],["not",["has","around"]],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-edece7f6","guard":[["hasAny",["applebum","black","bodak","boyznthehood","c","cant","changes","codeine","digger","door","dope","falls","flava","gangsta","got","hard","international","item number","kyoto","lifes","lost","lower case","lowercase","madness","mtaktak","nth","overseas","pride","pt","small letters","tippin","train","wipe","work","yourz"]],["has","artist"],["has","give"],["not",["has","around"]],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-a3fbff35","guard":[["hasAny",["applebum","black","bodak","boyznthehood","c","caesar cipher","cant","changes","cheap","codeine","digger","door","dope","falls","flava","gangsta","hard","international","item number","kyoto","lifes","lost","madness","mtaktak","nth","overseas","pride","rotate the letters","shift by","shift each letter","tippin","wipe","work","yourz"]],["has","artist"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-49c447e6","guard":[["hasAny",["applebum","black","boyznthehood","c","cant","capital letters","capitals","changes","codeine","digger","door","dope","flava","gangsta","got","hard","international","item number","kyoto","lifes","madness","mtaktak","nth","overseas","pride","pt","tippin","train","upper case","uppercase","wipe","yourz"]],["has","artist"],["has","give"],["not",["has","around"]],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.upper",["transform.nthStr",["know.where",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"gender"},{"lit":"male"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-122be541","guard":[["hasAny",["applebum","black","boyznthehood","c","cant","changes","codeine","digger","door","dope","flava","gangsta","got","hard","international","item number","kyoto","lifes","madness","mtaktak","nth","overseas","pride","pt","tippin","train","wipe","yourz"]],["has","artist"],["has","give"],["not",["has","around"]],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.where",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"gender"},{"lit":"male"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-4981259a","guard":[["hasAny",["ambitionz","americas","art","black","bling","bob","boyznthehood","bridge","capital letters","capitals","caps","cheap","codeine","dash","dope","elevators","hard","item number","lamericano","madness","mask","nth","part","police","regrets","reverse the words","reverse word order","spottieottiedopaliscious","upper case","uppercase","words backwards","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.str",["transform.upper",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-59617d66","guard":[["hasAny",["ambitionz","americas","art","black","bling","bob","boyznthehood","bridge","capital letters","capitals","caps","cheap","codeine","dash","dope","elevators","hard","item number","lamericano","madness","mask","nth","part","police","regrets","reverse the words","reverse word order","spottieottiedopaliscious","upper case","uppercase","words backwards","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.code",["transform.upper",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-008fe7be","guard":[["hasAny",["ambitionz","americas","art","black","bling","bob","boyznthehood","bridge","caps","cheap","codeine","dash","dope","elevators","hard","item number","lamericano","madness","mask","nth","part","police","regrets","reverse the words","reverse word order","spottieottiedopaliscious","words backwards","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-808972ff","guard":[["hasAny",["ambitionz","americas","art","black","bling","bob","boyznthehood","bridge","caps","cheap","codeine","dash","dope","elevators","hard","item number","lamericano","madness","mask","nth","part","police","regrets","reverse the words","reverse word order","spottieottiedopaliscious","words backwards","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.code",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-55ab49ad","guard":[["hasAny",["americas","art","black","bob","boyznthehood","bridge","capital letters","capitals","caps","cheap","codeine","dash","dashes","dope","elevators","hard","hyphens","item number","kebab case","kebabcase","lamericano","madness","mask","nth","part","police","regrets","spottieottiedopaliscious","upper case","uppercase","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.code",["transform.kebab",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-cc5c8fea","guard":[["hasAny",["americas","art","black","bob","boyznthehood","bridge","capital letters","capitals","caps","cheap","codeine","dash","dashes","dope","elevators","hard","hyphens","item number","kebab case","kebabcase","lamericano","madness","mask","nth","part","police","regrets","spottieottiedopaliscious","upper case","uppercase","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.str",["transform.kebab",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-1337e924","guard":[["hasAny",["ambitionz","americas","art","black","bob","bridge","capital letters","capitals","caps","cheap","codeine","dash","dope","each word","elevators","item number","lamericano","madness","mask","nth","part","police","split into words","spottieottiedopaliscious","upper case","uppercase","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.and",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-1b14bfc2","guard":[["hasAny",["ambitionz","americas","art","black","bob","bridge","camel case","camelcase","capital letters","capitals","caps","cheap","codeine","dash","dope","elevators","item number","lamericano","lower camel case","madness","mask","nth","part","police","spottieottiedopaliscious","upper case","uppercase","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.code",["transform.camel",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-21cf04cd","guard":[["hasAny",["ambitionz","americas","art","black","bob","bridge","capital letters","capitals","caps","cheap","codeine","dash","dope","each word","elevators","item number","lamericano","madness","mask","nth","part","police","split into words","spottieottiedopaliscious","upper case","uppercase","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.list",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-32166360","guard":[["hasAny",["ambitionz","americas","art","black","bob","bridge","capital letters","capitals","caps","cheap","codeine","dash","dope","each word","elevators","item number","lamericano","madness","mask","nth","part","police","split into words","spottieottiedopaliscious","upper case","uppercase","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.lines",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-707d0438","guard":[["hasAny",["americas","boyznthehood","bridge","capital letters","capitals","caps","cheap","codeine","dash","dashes","dope","hard","hyphens","item number","kebab case","kebabcase","lamericano","madness","mask","nth","one","part","police","regrets","spottieottiedopaliscious","upper case","uppercase","yours"]],["has","artist"],["not",["has","band"]],["not",["has","cold"]]],"pyramid":["render.code",["transform.upper",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-7b262a1a","guard":[["hasAny",["ambitionz","americas","art","black","bob","bridge","camel case","camelcase","capital letters","capitals","caps","cheap","codeine","dash","dope","elevators","item number","lamericano","lower camel case","madness","mask","nth","part","police","spottieottiedopaliscious","upper case","uppercase","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.str",["transform.upper",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-7bed7bdd","guard":[["hasAny",["ambitionz","americas","art","black","bob","bridge","camel case","camelcase","capital letters","capitals","caps","cheap","codeine","dash","dope","elevators","item number","lamericano","lower camel case","madness","mask","nth","part","police","spottieottiedopaliscious","upper case","uppercase","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.str",["transform.camel",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-94265bd7","guard":[["hasAny",["americas","boyznthehood","bridge","capital letters","capitals","caps","cheap","codeine","dash","dashes","dope","hard","hyphens","item number","kebab case","kebabcase","lamericano","madness","mask","nth","one","part","police","regrets","spottieottiedopaliscious","upper case","uppercase","yours"]],["has","artist"],["not",["has","band"]],["not",["has","cold"]]],"pyramid":["render.str",["transform.upper",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-db5b8515","guard":[["hasAny",["ambitionz","americas","art","black","bob","bridge","capital letters","capitals","caps","cheap","class name","codeine","dash","dope","elevators","item number","lamericano","madness","mask","nth","part","pascal case","pascalcase","police","spottieottiedopaliscious","upper camel case","upper case","uppercase","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.str",["transform.pascal",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-f002de64","guard":[["hasAny",["ambitionz","americas","art","black","bob","bridge","capital letters","capitals","caps","cheap","class name","codeine","dash","dope","elevators","item number","lamericano","madness","mask","nth","part","pascal case","pascalcase","police","spottieottiedopaliscious","upper camel case","upper case","uppercase","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.code",["transform.pascal",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-fa84f591","guard":[["hasAny",["ambitionz","americas","art","black","bob","bridge","camel case","camelcase","capital letters","capitals","caps","cheap","codeine","dash","dope","elevators","item number","lamericano","lower camel case","madness","mask","nth","part","police","spottieottiedopaliscious","upper case","uppercase","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.code",["transform.upper",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-096c5092","guard":[["hasAny",["americas","boyznthehood","bridge","caps","cheap","codeine","dash","dashes","dope","hard","hyphens","item number","kebab case","kebabcase","lamericano","madness","mask","nth","one","part","police","regrets","spottieottiedopaliscious","yours"]],["has","artist"],["not",["has","band"]],["not",["has","cold"]]],"pyramid":["render.code",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-4c904cb4","guard":[["hasAny",["ambitionz","americas","art","black","bob","bridge","caps","cheap","codeine","dash","dope","each word","elevators","item number","lamericano","madness","mask","nth","part","police","split into words","spottieottiedopaliscious","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-5b423802","guard":[["hasAny",["ambitionz","americas","art","black","bob","bridge","caps","cheap","codeine","dash","dope","each word","elevators","item number","lamericano","madness","mask","nth","part","police","split into words","spottieottiedopaliscious","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-5b9dc82e","guard":[["hasAny",["ambitionz","americas","art","black","bob","bridge","caps","cheap","class name","codeine","dash","dope","elevators","item number","lamericano","madness","mask","nth","part","pascal case","pascalcase","police","spottieottiedopaliscious","upper camel case","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.code",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-68725f9d","guard":[["hasAny",["ambitionz","americas","art","black","bob","bridge","caps","cheap","codeine","dash","dope","each word","elevators","item number","lamericano","madness","mask","nth","part","police","split into words","spottieottiedopaliscious","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-6bcf91c3","guard":[["hasAny",["ambitionz","americas","art","black","bob","bridge","camel case","camelcase","caps","cheap","codeine","dash","dope","elevators","item number","lamericano","lower camel case","madness","mask","nth","part","police","spottieottiedopaliscious","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.code",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-84bcb2e0","guard":[["hasAny",["americas","boyznthehood","bridge","caps","cheap","codeine","dash","dashes","dope","hard","hyphens","item number","kebab case","kebabcase","lamericano","madness","mask","nth","one","part","police","regrets","spottieottiedopaliscious","yours"]],["has","artist"],["not",["has","band"]],["not",["has","cold"]]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-adb7a162","guard":[["hasAny",["ambitionz","americas","art","black","bob","bridge","camel case","camelcase","caps","cheap","codeine","dash","dope","elevators","item number","lamericano","lower camel case","madness","mask","nth","part","police","spottieottiedopaliscious","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-d47e5b31","guard":[["hasAny",["ambitionz","americas","art","black","bob","bridge","caps","cheap","class name","codeine","dash","dope","elevators","item number","lamericano","madness","mask","nth","part","pascal case","pascalcase","police","spottieottiedopaliscious","upper camel case","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-5e898243","guard":[["hasAny",["bitch","black","bodak","digger","dope","down","flava","got","hard","item number","kyoto","longest","longest one","longest word","lost","love","nth","position","pride","still","train","what","work"]],["has","artist"],["has","give"],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"for"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-c926e1b7","guard":[["hasAny",["ambitionz","americas","art","black","bob","bridge","camel case","camelcase","caps","cheap","codeine","dash","dope","elevators","item number","lamericano","lower camel case","madness","mask","nth","part","police","spottieottiedopaliscious","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-59f56cb6","guard":[["hasAny",["americas","art","black","bob","bridge","capital letters","capitals","caps","cheap","codeine","dash","dope","elevators","item number","lamericano","madness","mask","nth","part","police","snake case","snakecase","spottieottiedopaliscious","underscores","upper case","uppercase","variable name","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.str",["transform.snake",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-93b50672","guard":[["hasAny",["americas","art","black","bob","bridge","capital letters","capitals","caps","cheap","codeine","dash","dope","elevators","item number","lamericano","madness","mask","nth","part","police","snake case","snakecase","spottieottiedopaliscious","underscores","upper case","uppercase","variable name","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.code",["transform.snake",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-0dd7c49e","guard":[["hasAny",["alright","changes","flava","grief","hypnotize","item number","kyoto","lamericano","mtaktak","nth","overseas","pride","regrets","renegade","respiration","runaway","spottieottiedopaliscious","triumph","umoya","warning"]],["has","artist"],["not",["has","be"]],["not",["has","life"]]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-6d226c0f","guard":[["hasAny",["americas","bridge","capital letters","capitals","caps","cheap","codeine","dash","dope","item number","lamericano","madness","mask","nth","one","part","police","snake case","snakecase","spottieottiedopaliscious","underscores","upper case","uppercase","variable name","yours"]],["has","artist"],["not",["has","band"]],["not",["has","cold"]]],"pyramid":["render.code",["transform.upper",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-94019fe7","guard":[["hasAny",["americas","bridge","capital letters","capitals","caps","cheap","codeine","dash","dope","item number","lamericano","madness","mask","nth","one","part","police","snake case","snakecase","spottieottiedopaliscious","underscores","upper case","uppercase","variable name","yours"]],["has","artist"],["not",["has","band"]],["not",["has","cold"]]],"pyramid":["render.str",["transform.upper",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-7c1a120a","guard":[["hasAny",["americas","bridge","caps","cheap","codeine","dash","dope","item number","lamericano","madness","mask","nth","one","part","police","snake case","snakecase","spottieottiedopaliscious","underscores","variable name","yours"]],["has","artist"],["not",["has","band"]],["not",["has","cold"]]],"pyramid":["render.code",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-f060680f","guard":[["hasAny",["americas","bridge","caps","cheap","codeine","dash","dope","item number","lamericano","madness","mask","nth","one","part","police","snake case","snakecase","spottieottiedopaliscious","underscores","variable name","yours"]],["has","artist"],["not",["has","band"]],["not",["has","cold"]]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-bea54776","guard":[["hasAny",["about","above","am","bling","dash","follow","full","goes","item number","kane","longest","longest one","longest word","mask","mic","milli","nature","nth","old","put","queen","yours"]],["has","artist"],["not",["has","arclight"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-be437bf7","guard":[["hasAny",["alright","boyznthehood","capital letters","capitals","changes","hypnotize","item number","lamericano","longest","longest one","longest word","mtaktak","nth","overseas","regrets","renegade","respiration","runaway","spottieottiedopaliscious","triumph","upper case","uppercase","warning"]],["has","artist"],["not",["has","be"]],["not",["has","life"]]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is ",{"slot":1},"."]},["transform.upper",["aggregate.longest",["sense.words"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-43fc4197","guard":[["hasAny",["alright","boyznthehood","changes","hypnotize","item number","lamericano","longest","longest one","longest word","mtaktak","nth","overseas","regrets","renegade","respiration","runaway","spottieottiedopaliscious","triumph","warning"]],["has","artist"],["not",["has","be"]],["not",["has","life"]]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-9c44215c","guard":[["hasAny",["am","applebum","boyznthehood","capital letters","capitals","follow","hypnotize","international","item number","mtaktak","nature","nth","overseas","regrets","renegade","respiration","shortest","shortest one","shortest word","spottieottiedopaliscious","upper case","uppercase"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.upper",["aggregate.shortest",["sense.content"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-f4d31f13","guard":[["hasAny",["am","applebum","boyznthehood","capital letters","capitals","follow","hypnotize","international","item number","mtaktak","nature","nth","overseas","regrets","renegade","respiration","shortest","shortest one","shortest word","spottieottiedopaliscious","upper case","uppercase"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-b107566b","guard":[["hasAny",["am","applebum","boyznthehood","capital letters","capitals","follow","hypnotize","international","item number","mtaktak","nature","nth","overseas","regrets","renegade","respiration","shortest","shortest one","shortest word","spottieottiedopaliscious","upper case","uppercase"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-46d0e754","guard":[["hasAny",["am","applebum","boyznthehood","follow","hypnotize","international","item number","mtaktak","nature","nth","overseas","regrets","renegade","respiration","shortest","shortest one","shortest word","spottieottiedopaliscious"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.and",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-cdcc03e5","guard":[["hasAny",["am","applebum","boyznthehood","follow","hypnotize","international","item number","mtaktak","nature","nth","overseas","regrets","renegade","respiration","shortest","shortest one","shortest word","spottieottiedopaliscious"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-30899d7b","guard":[["hasAny",["am","applebum","boyznthehood","follow","hypnotize","international","item number","mtaktak","nature","nth","overseas","regrets","renegade","respiration","shortest","shortest one","shortest word","spottieottiedopaliscious"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-18966066","guard":[["hasAny",["am","applebum","boyznthehood","capitalise","capitalize","capitalize each word","follow","hypnotize","international","item number","mtaktak","nature","nth","overseas","regrets","renegade","respiration","shortest","shortest one","shortest word","spottieottiedopaliscious","title case"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-57ee591f","guard":[["hasAny",["am","applebum","boyznthehood","follow","hypnotize","international","item number","lower case","lowercase","mtaktak","nature","nth","overseas","regrets","renegade","respiration","shortest","shortest one","shortest word","small letters","spottieottiedopaliscious"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-fef1745b","guard":[["hasAny",["am","applebum","boyznthehood","follow","hypnotize","international","invert case","item number","mtaktak","nature","nth","overseas","regrets","renegade","respiration","shortest","shortest one","shortest word","spottieottiedopaliscious","swap case","toggle case"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-b74fb8aa","guard":[["hasAny",["am","applebum","boyznthehood","caesar cipher","follow","hypnotize","international","item number","mtaktak","nature","nth","overseas","regrets","renegade","respiration","rotate the letters","shift by","shift each letter","shortest","shortest one","shortest word","spottieottiedopaliscious"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-903c4110","guard":[["hasAny",["am","applebum","boyznthehood","follow","hypnotize","international","item number","mtaktak","nature","nth","overseas","regrets","renegade","respiration","shortest","shortest one","shortest word","spottieottiedopaliscious"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.where",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"gender"},{"lit":"male"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-62dd18db","guard":[["hasAny",["black","bob","bridge","camel case","camelcase","caps","cheap","dash","dope","item number","longest","longest one","longest word","lower camel case","mask","nth","part","police","yours"]],["has","artist"],["not",["has","band"]],["not",["has","bruno"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-91f980fd","guard":[["hasAny",["boyznthehood","capital letters","capitals","changes","hypnotize","item number","longest","longest one","longest word","mtaktak","nth","overseas","regrets","renegade","respiration","shortest","shortest one","shortest word","spottieottiedopaliscious","upper case","uppercase"]],["has","artist"],["not",["has","life"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.upper",["aggregate.longest",["sense.words"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-c166c95f","guard":[["hasAny",["boyznthehood","changes","hypnotize","item number","longest","longest one","longest word","mtaktak","nth","overseas","regrets","renegade","respiration","shortest","shortest one","shortest word","spottieottiedopaliscious"]],["has","artist"],["not",["has","life"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-42880cbb","guard":[["hasAny",["c","da","edge","got","imagine","item number","luv","nth","position","separate by","split","split by"]],["has","artist"],["not",["has","a"]],["not",["has","around"]],["not",["has","bad"]],["words<=",12]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.roman"]]],"mem":null},
{"id":"n-556af424","guard":[["hasAny",["c","da","delete","edge","got","imagine","item number","luv","nth","position","remove","strip out","without"]],["has","artist"],["not",["has","a"]],["not",["has","around"]],["not",["has","bad"]],["words<=",12]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.roman"]]],"mem":null},
{"id":"n-96592afb","guard":[["hasAny",["c","da","edge","got","imagine","item number","luv","nth","position","separate by","split","split by"]],["has","artist"],["not",["has","a"]],["not",["has","around"]],["not",["has","bad"]],["words<=",12]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.roman"]]],"mem":null},
{"id":"n-aeaf512c","guard":[["hasAny",["c","da","delete","edge","got","imagine","item number","luv","nth","position","remove","strip out","without"]],["has","artist"],["not",["has","a"]],["not",["has","around"]],["not",["has","bad"]],["words<=",12]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.roman"]]],"mem":null},
{"id":"n-f3f0026b","guard":[["hasAny",["c","da","edge","got","imagine","item number","luv","nth","position","separate by","split","split by"]],["has","artist"],["not",["has","a"]],["not",["has","around"]],["not",["has","bad"]],["words<=",12]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.roman"]]],"mem":null},
{"id":"n-79033378","guard":[["hasAny",["black","camel case","camelcase","cheap","codeine","dope","item number","lower camel case","madness","nth","pt"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-5b5d7e76","guard":[["hasAny",["art","bob","elevators","spottieottiedopaliscious"]],["has","artist"],["has","of"]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is OutKast."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-82059488","guard":[["hasAny",["artist","delete","item number","nth","position","remove","strip out"]],["not",["has","cover"]],["not",["has","all"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.numeral"]]],"mem":null},
{"id":"n-c50ca833","guard":[["hasAny",["artist","delete","item number","nth","position","remove","strip out"]],["not",["has","cover"]],["not",["has","all"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.numeral"]]],"mem":null},
{"id":"n-cee494d9","guard":[["hasAny",["flava","grief","item number","kyoto","longest","longest one","longest word","nth","pride","umoya"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-7b094021","guard":[["hasAny",["alphabetize the letters","ambitionz","bridge","capital letters","capitals","item number","letters in order","mic","nth","sort the letters","upper case","uppercase","yours"]],["has","artist"]],"pyramid":["render.str",["transform.upper",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-e15d947d","guard":[["hasAny",["alphabetize the letters","ambitionz","bridge","capital letters","capitals","item number","letters in order","mic","nth","sort the letters","upper case","uppercase","yours"]],["has","artist"]],"pyramid":["render.code",["transform.upper",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-73af5ceb","guard":[["hasAny",["follow","full","goes","know","longest","longest one","longest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Eric B & Rakim."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-0686c585","guard":[["hasAny",["alphabetize the letters","ambitionz","bridge","item number","letters in order","mic","nth","sort the letters","yours"]],["has","artist"]],"pyramid":["render.str",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-13086f6d","guard":[["hasAny",["alphabetize the letters","ambitionz","bridge","item number","letters in order","mic","nth","sort the letters","yours"]],["has","artist"]],"pyramid":["render.code",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-8a48a0a6","guard":[["hasAny",["artist","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.first"]]],"mem":null},
{"id":"n-b6e6e9dc","guard":[["hasAny",["art","copies","got","hope","item number","nth","position","repeat","say it times","train"]],["has","artist"]],"pyramid":["render.str",["transform.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.howMany"]]],"mem":null},
{"id":"n-c1d44702","guard":[["hasAny",["artist","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.first"]]],"mem":null},
{"id":"n-da6eb631","guard":[["hasAny",["art","got","hope","item number","nth","position","train"]],["has","artist"]],"pyramid":["render.and",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.howMany"]]],"mem":null},
{"id":"n-e274a1da","guard":[["hasAny",["art","got","hope","item number","nth","position","train"]],["has","artist"]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.howMany"]]],"mem":null},
{"id":"n-ea2e7c2b","guard":[["hasAny",["art","got","hope","item number","nth","position","train"]],["has","artist"]],"pyramid":["render.lines",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.howMany"]]],"mem":null},
{"id":"n-78f83bc2","guard":[["hasAny",["artist","delete","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"n3"}],{"lit":1}]]],"mem":null},
{"id":"n-a838f462","guard":[["hasAny",["artist","delete","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"n3"}],{"lit":1}]]],"mem":null},
{"id":"n-2cd720eb","guard":[["hasAny",["changed","hypnotize","warning"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is The Notorious B.I.G.."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-9618a3ca","guard":[["hasAny",["bring","neck","triumph"]],["has","tell"]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is Wu-Tang Clan."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-f67ed968","guard":[["hasAny",["alright","dont","pride"]],["has","artist"],["not",["has","be"]]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is Kendrick Lamar."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-0bbf8593","guard":[["hasAny",["copies","hope","item number","nth","pt","say it times","train"]],["has","artist"]],"pyramid":["render.code",["transform.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.howMany"]]],"mem":null},
{"id":"n-40491fd3","guard":[["hasAny",["copies","hope","item number","nth","part","position","repeat","say it times","train"]],["has","artist"]],"pyramid":["render.code",["transform.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.first"]]],"mem":null},
{"id":"n-702302a3","guard":[["hasAny",["hope","item number","nth","part","position","train"]],["has","artist"]],"pyramid":["render.lines",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.first"]]],"mem":null},
{"id":"n-9a842792","guard":[["hasAny",["hope","item number","nth","part","position","train"]],["has","artist"]],"pyramid":["render.and",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.first"]]],"mem":null},
{"id":"n-a608640b","guard":[["hasAny",["hope","item number","nth","part","position","train"]],["has","artist"]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.first"]]],"mem":null},
{"id":"n-ffa38e95","guard":[["hasAny",["copies","hope","item number","nth","part","position","repeat","say it times","train"]],["has","artist"]],"pyramid":["render.str",["transform.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.first"]]],"mem":null},
{"id":"n-03949a30","guard":[["hasAny",["bring","delete","neck","strip out","triumph"]],["has","artist"]],"pyramid":["render.str",["transform.remove",{"lit":"Wu-Tang Clan"},["sense.lastWord"]]],"mem":null},
{"id":"n-054c99cf","guard":[["hasAny",["bring","neck","normalise","normalize","simplify the text","triumph"]],["has","artist"]],"pyramid":["render.str",["transform.norm",{"lit":"Wu-Tang Clan"},["sense.howMany"]]],"mem":null},
{"id":"n-0976db55","guard":[["hasAny",["caesar cipher","changed","hypnotize","rotate the letters","shift by","shift each letter","warning"]],["has","artist"]],"pyramid":["render.str",["transform.caesar",{"lit":"The Notorious B.I.G."},["sense.howMany"]]],"mem":null},
{"id":"n-0cd48d41","guard":[["hasAny",["changed","delete","hypnotize","strip out","warning"]],["has","artist"]],"pyramid":["render.code",["transform.remove",{"lit":"The Notorious B.I.G."},["sense.lastWord"]]],"mem":null},
{"id":"n-21dfe729","guard":[["hasAny",["bring","caesar cipher","neck","rotate the letters","shift by","shift each letter","triumph"]],["has","artist"]],"pyramid":["render.code",["transform.caesar",{"lit":"Wu-Tang Clan"},["sense.howMany"]]],"mem":null},
{"id":"n-2d9dd36d","guard":[["hasAny",["bring","delete","neck","strip out","triumph"]],["has","artist"]],"pyramid":["render.code",["transform.remove",{"lit":"Wu-Tang Clan"},["sense.lastWord"]]],"mem":null},
{"id":"n-42aee20c","guard":[["hasAny",["changed","delete","hypnotize","strip out","warning"]],["has","artist"]],"pyramid":["render.str",["transform.remove",{"lit":"The Notorious B.I.G."},["sense.lastWord"]]],"mem":null},
{"id":"n-4e135ba9","guard":[["hasAny",["changed","hypnotize","normalise","normalize","simplify the text","warning"]],["has","artist"]],"pyramid":["render.code",["transform.norm",{"lit":"The Notorious B.I.G."},["sense.howMany"]]],"mem":null},
{"id":"n-6283c741","guard":[["hasAny",["changed","hypnotize","normalise","normalize","simplify the text","warning"]],["has","artist"]],"pyramid":["render.str",["transform.norm",{"lit":"The Notorious B.I.G."},["sense.howMany"]]],"mem":null},
{"id":"n-64539c1d","guard":[["hasAny",["bring","neck","separate by","split by","triumph"]],["has","artist"]],"pyramid":["render.list",["transform.split",{"lit":"Wu-Tang Clan"},["sense.lastWord"]]],"mem":null},
{"id":"n-8bf8f822","guard":[["hasAny",["changed","hypnotize","separate by","split by","warning"]],["has","artist"]],"pyramid":["render.list",["transform.split",{"lit":"The Notorious B.I.G."},["sense.lastWord"]]],"mem":null},
{"id":"n-8c5def1c","guard":[["hasAny",["bob","caesar cipher","elevators","rotate the letters","shift by","shift each letter","spottieottiedopaliscious"]],["has","artist"],["has","of"]],"pyramid":["render.str",["transform.caesar",{"lit":"OutKast"},["sense.howMany"]]],"mem":null},
{"id":"n-8d5831f9","guard":[["hasAny",["bob","caesar cipher","elevators","rotate the letters","shift by","shift each letter","spottieottiedopaliscious"]],["has","artist"],["has","of"]],"pyramid":["render.str",["transform.caesar",{"lit":"outkast"},["sense.howMany"]]],"mem":null},
{"id":"n-944827b3","guard":[["hasAny",["changed","hypnotize","separate by","split by","warning"]],["has","artist"]],"pyramid":["render.and",["transform.split",{"lit":"The Notorious B.I.G."},["sense.lastWord"]]],"mem":null},
{"id":"n-968abe1b","guard":[["hasAny",["changed","hypnotize","separate by","split by","warning"]],["has","artist"]],"pyramid":["render.lines",["transform.split",{"lit":"The Notorious B.I.G."},["sense.lastWord"]]],"mem":null},
{"id":"n-ab6819cf","guard":[["hasAny",["bring","caesar cipher","neck","rotate the letters","shift by","shift each letter","triumph"]],["has","artist"]],"pyramid":["render.str",["transform.caesar",{"lit":"Wu-Tang Clan"},["sense.howMany"]]],"mem":null},
{"id":"n-b542dd94","guard":[["hasAny",["bring","neck","normalise","normalize","simplify the text","triumph"]],["has","artist"]],"pyramid":["render.code",["transform.norm",{"lit":"Wu-Tang Clan"},["sense.howMany"]]],"mem":null},
{"id":"n-b72d50d5","guard":[["hasAny",["caesar cipher","codeine","madness","mask","rotate the letters","shift by","shift each letter"]],["has","artist"]],"pyramid":["render.code",["transform.caesar",{"lit":"Future"},["sense.howMany"]]],"mem":null},
{"id":"n-b7445e5a","guard":[["hasAny",["bob","caesar cipher","elevators","rotate the letters","shift by","shift each letter","spottieottiedopaliscious"]],["has","artist"],["has","of"]],"pyramid":["render.code",["transform.caesar",{"lit":"OutKast"},["sense.howMany"]]],"mem":null},
{"id":"n-cb0e7b8b","guard":[["hasAny",["caesar cipher","codeine","madness","mask","rotate the letters","shift by","shift each letter"]],["has","artist"]],"pyramid":["render.str",["transform.caesar",{"lit":"Future"},["sense.howMany"]]],"mem":null},
{"id":"n-db5368df","guard":[["hasAny",["caesar cipher","changed","hypnotize","rotate the letters","shift by","shift each letter","warning"]],["has","artist"]],"pyramid":["render.code",["transform.caesar",{"lit":"The Notorious B.I.G."},["sense.howMany"]]],"mem":null},
{"id":"n-f6cf25f6","guard":[["hasAny",["bob","caesar cipher","elevators","rotate the letters","shift by","shift each letter","spottieottiedopaliscious"]],["has","artist"],["has","of"]],"pyramid":["render.code",["transform.caesar",{"lit":"outkast"},["sense.howMany"]]],"mem":null},
{"id":"n-f8284d09","guard":[["hasAny",["bring","neck","separate by","split by","triumph"]],["has","artist"]],"pyramid":["render.and",["transform.split",{"lit":"Wu-Tang Clan"},["sense.lastWord"]]],"mem":null},
{"id":"n-fbbd7b7a","guard":[["hasAny",["bring","neck","separate by","split by","triumph"]],["has","artist"]],"pyramid":["render.lines",["transform.split",{"lit":"Wu-Tang Clan"},["sense.lastWord"]]],"mem":null},
{"id":"n-1cb6cec0","guard":[["hasAny",["bling","bridge","capital letters","capitals","item number","no vowels","nth","remove vowels","upper case","uppercase","without vowels"]],["has","artist"]],"pyramid":["render.str",["transform.upper",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-30c34b9e","guard":[["hasAny",["bling","bridge","capital letters","capitals","item number","no vowels","nth","remove vowels","upper case","uppercase","without vowels"]],["has","artist"]],"pyramid":["render.code",["transform.upper",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-89122a3c","guard":[["hasAny",["americas","caps"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is Madvillain."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-06e0e36e","guard":[["hasAny",["longest","longest one","longest word","mic","yours"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Nas."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-0be3b60a","guard":[["hasAny",["dupa","longest","longest one","longest word","work"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Missy Elliott."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-512bbc80","guard":[["hasAny",["codeine","madness"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Future."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-71a5a9ea","guard":[["hasAny",["dont","longest","longest one","longest word","pride"]],["has","artist"],["not",["has","be"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Kendrick Lamar."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-0d71c82c","guard":[["hasAny",["bling","bridge","item number","no vowels","nth","remove vowels","without vowels"]],["has","artist"]],"pyramid":["render.code",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-d81db28f","guard":[["hasAny",["bling","bridge","item number","no vowels","nth","remove vowels","without vowels"]],["has","artist"]],"pyramid":["render.str",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-057a3ea8","guard":[["hasAny",["hope","item number","nth","position","train"]],["has","artist"]],"pyramid":["render.lines",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.last"]]],"mem":null},
{"id":"n-1071daa1","guard":[["hasAny",["hope","item number","nth","position","train"]],["has","artist"]],"pyramid":["render.and",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.last"]]],"mem":null},
{"id":"n-923cee61","guard":[["hasAny",["copies","hope","item number","nth","position","repeat","say it times","train"]],["has","artist"]],"pyramid":["render.code",["transform.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.last"]]],"mem":null},
{"id":"n-b2e49a9b","guard":[["hasAny",["artist","delete","item number","nth","position","remove","strip out","without"]],["has","tell"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.unit"]]],"mem":null},
{"id":"n-bb49ffec","guard":[["hasAny",["hope","item number","nth","position","train"]],["has","artist"]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.last"]]],"mem":null},
{"id":"n-cb5391fc","guard":[["hasAny",["copies","hope","item number","nth","position","repeat","say it times","train"]],["has","artist"]],"pyramid":["render.str",["transform.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.last"]]],"mem":null},
{"id":"n-de15594d","guard":[["hasAny",["artist","delete","item number","nth","position","remove","strip out","without"]],["has","tell"]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.unit"]]],"mem":null},
{"id":"n-08468214","guard":[["hasAny",["delete","hard","regrets","strip out"]],["has","artist"]],"pyramid":["render.code",["transform.remove",{"lit":"JAY-Z"},["sense.lastWord"]]],"mem":null},
{"id":"n-0cedabfa","guard":[["hasAny",["hard","regrets","separate by","split by"]],["has","artist"]],"pyramid":["render.and",["transform.split",{"lit":"JAY-Z"},["sense.lastWord"]]],"mem":null},
{"id":"n-0faba058","guard":[["hasAny",["caesar cipher","mic","rotate the letters","shift by","shift each letter","yours"]],["has","artist"]],"pyramid":["render.code",["transform.caesar",{"lit":"nas"},["sense.howMany"]]],"mem":null},
{"id":"n-2040c7d5","guard":[["hasAny",["hard","normalise","normalize","regrets","simplify the text"]],["has","artist"]],"pyramid":["render.code",["transform.norm",{"lit":"JAY-Z"},["sense.howMany"]]],"mem":null},
{"id":"n-298773d4","guard":[["hasAny",["americas","caesar cipher","caps","rotate the letters","shift by","shift each letter"]],["has","artist"]],"pyramid":["render.str",["transform.caesar",{"lit":"Madvillain"},["sense.howMany"]]],"mem":null},
{"id":"n-374b1806","guard":[["hasAny",["caesar cipher","mic","rotate the letters","shift by","shift each letter","yours"]],["has","artist"]],"pyramid":["render.str",["transform.caesar",{"lit":"nas"},["sense.howMany"]]],"mem":null},
{"id":"n-41a06b43","guard":[["hasAny",["hard","regrets","separate by","split by"]],["has","artist"]],"pyramid":["render.list",["transform.split",{"lit":"JAY-Z"},["sense.lastWord"]]],"mem":null},
{"id":"n-4bff9521","guard":[["hasAny",["caesar cipher","mic","rotate the letters","shift by","shift each letter","yours"]],["has","artist"]],"pyramid":["render.code",["transform.caesar",{"lit":"Nas"},["sense.howMany"]]],"mem":null},
{"id":"n-579c1597","guard":[["hasAny",["follow","full","normalise","normalize","simplify the text"]],["has","artist"],["has","of"],["words<=",10]],"pyramid":["render.code",["transform.norm",{"lit":"Eric B & Rakim"},["sense.howMany"]]],"mem":null},
{"id":"n-61e43271","guard":[["hasAny",["delete","follow","full","strip out"]],["has","artist"],["has","of"],["words<=",10]],"pyramid":["render.str",["transform.remove",{"lit":"Eric B & Rakim"},["sense.lastWord"]]],"mem":null},
{"id":"n-6cab018b","guard":[["hasAny",["alright","caesar cipher","pride","rotate the letters","shift by","shift each letter"]],["has","artist"],["not",["has","be"]],["not",["has","baby"]],["not",["has","blame"]],["not",["has","from"]],["not",["has","it"]]],"pyramid":["render.code",["transform.caesar",{"lit":"Kendrick Lamar"},["sense.howMany"]]],"mem":null},
{"id":"n-780ecd3f","guard":[["hasAny",["follow","full","separate by","split by"]],["has","artist"],["has","of"],["words<=",10]],"pyramid":["render.lines",["transform.split",{"lit":"Eric B & Rakim"},["sense.lastWord"]]],"mem":null},
{"id":"n-797afe72","guard":[["hasAny",["caesar cipher","mic","rotate the letters","shift by","shift each letter","yours"]],["has","artist"]],"pyramid":["render.str",["transform.caesar",{"lit":"Nas"},["sense.howMany"]]],"mem":null},
{"id":"n-9d8686a9","guard":[["hasAny",["follow","full","normalise","normalize","simplify the text"]],["has","artist"],["has","of"],["words<=",10]],"pyramid":["render.str",["transform.norm",{"lit":"Eric B & Rakim"},["sense.howMany"]]],"mem":null},
{"id":"n-a2aef56e","guard":[["hasAny",["caesar cipher","follow","full","rotate the letters","shift by","shift each letter"]],["has","artist"],["has","of"],["words<=",10]],"pyramid":["render.code",["transform.caesar",{"lit":"Eric B & Rakim"},["sense.howMany"]]],"mem":null},
{"id":"n-a76ab49a","guard":[["hasAny",["hard","regrets","separate by","split by"]],["has","artist"]],"pyramid":["render.lines",["transform.split",{"lit":"JAY-Z"},["sense.lastWord"]]],"mem":null},
{"id":"n-acbc63c3","guard":[["hasAny",["caesar cipher","follow","full","rotate the letters","shift by","shift each letter"]],["has","artist"],["has","of"],["words<=",10]],"pyramid":["render.str",["transform.caesar",{"lit":"Eric B & Rakim"},["sense.howMany"]]],"mem":null},
{"id":"n-c4109964","guard":[["hasAny",["alright","caesar cipher","pride","rotate the letters","shift by","shift each letter"]],["has","artist"],["not",["has","be"]],["not",["has","baby"]],["not",["has","blame"]],["not",["has","from"]],["not",["has","it"]]],"pyramid":["render.str",["transform.caesar",{"lit":"Kendrick Lamar"},["sense.howMany"]]],"mem":null},
{"id":"n-c8a72c08","guard":[["hasAny",["follow","full","separate by","split by"]],["has","artist"],["has","of"],["words<=",10]],"pyramid":["render.and",["transform.split",{"lit":"Eric B & Rakim"},["sense.lastWord"]]],"mem":null},
{"id":"n-cef0e738","guard":[["hasAny",["delete","follow","full","strip out"]],["has","artist"],["has","of"],["words<=",10]],"pyramid":["render.code",["transform.remove",{"lit":"Eric B & Rakim"},["sense.lastWord"]]],"mem":null},
{"id":"n-d16c9ca0","guard":[["hasAny",["follow","full","separate by","split by"]],["has","artist"],["has","of"],["words<=",10]],"pyramid":["render.list",["transform.split",{"lit":"Eric B & Rakim"},["sense.lastWord"]]],"mem":null},
{"id":"n-d2e61234","guard":[["hasAny",["caesar cipher","hard","regrets","rotate the letters","shift by","shift each letter"]],["has","artist"]],"pyramid":["render.str",["transform.caesar",{"lit":"JAY-Z"},["sense.howMany"]]],"mem":null},
{"id":"n-e5a80bed","guard":[["hasAny",["delete","hard","regrets","strip out"]],["has","artist"]],"pyramid":["render.str",["transform.remove",{"lit":"JAY-Z"},["sense.lastWord"]]],"mem":null},
{"id":"n-e5b3ee95","guard":[["hasAny",["hard","normalise","normalize","regrets","simplify the text"]],["has","artist"]],"pyramid":["render.str",["transform.norm",{"lit":"JAY-Z"},["sense.howMany"]]],"mem":null},
{"id":"n-f48d4d9f","guard":[["hasAny",["americas","caesar cipher","caps","rotate the letters","shift by","shift each letter"]],["has","artist"]],"pyramid":["render.code",["transform.caesar",{"lit":"Madvillain"},["sense.howMany"]]],"mem":null},
{"id":"n-fc873896","guard":[["hasAny",["caesar cipher","hard","regrets","rotate the letters","shift by","shift each letter"]],["has","artist"]],"pyramid":["render.code",["transform.caesar",{"lit":"JAY-Z"},["sense.howMany"]]],"mem":null},
{"id":"n-00729f1d","guard":[["hasAny",["alphabetize the letters","bridge","capital letters","capitals","item number","letters in order","nth","sort the letters","upper case","uppercase"]],["has","tell"]],"pyramid":["render.str",["transform.sortLetters",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-29cadbea","guard":[["hasAny",["backwards","capital letters","capitals","dope","item number","mirror","nth","reversed","spell backwards","upper case","uppercase"]],["has","artist"]],"pyramid":["render.str",["transform.upper",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-d85b4756","guard":[["hasAny",["backwards","capital letters","capitals","dope","item number","mirror","nth","reversed","spell backwards","upper case","uppercase"]],["has","artist"]],"pyramid":["render.code",["transform.upper",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-f81e6535","guard":[["hasAny",["alphabetize the letters","bridge","capital letters","capitals","item number","letters in order","nth","sort the letters","upper case","uppercase"]],["has","tell"]],"pyramid":["render.code",["transform.sortLetters",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-161d1504","guard":[["hasAny",["am","capital letters","capitals","item number","longest","longest one","longest word","nth","upper case","uppercase"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of I Am I Be is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-c1d12cd6","guard":[["hasAny",["am","capital letters","capitals","item number","nth","shortest","shortest one","shortest word","upper case","uppercase"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of I Am I Be is ",{"slot":1},"."]},["transform.upper",["aggregate.shortest",["sense.content"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-ecdab75f","guard":[["hasAny",["am","capital letters","capitals","item number","longest","longest one","longest word","nth","upper case","uppercase"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of I Am I Be is ",{"slot":1},"."]},["transform.upper",["aggregate.longest",["sense.words"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-192da0d9","guard":[["has","diggity"],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is Blackstreet ft. Dr Dre and Queen Pen."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-1d1528e2","guard":[["has","hope"],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is Roots Manuva."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-4ae3242b","guard":[["has","concrete"],["has","tell"]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is Jurassic 5."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-4c6880a8","guard":[["has","lamericano"]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is Akhenaton."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-598793f6","guard":[["has","dangan"],["has","what"]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is King Giddra."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-645255aa","guard":[["has","ambitionz"],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is 2Pac."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-647b8a96","guard":[["has","runaway"],["has","tell"]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is Kanye West ft. Pusha T."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-667c049c","guard":[["has","bside"]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is Ice Cube."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-7d6d9a0f","guard":[["has","edge"],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is Public Enemy."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-b520481d","guard":[["has","reminisce"]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is Pete Rock & C.L. Smooth."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-d84a416a","guard":[["has","aiiight"],["has","what"]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is Gang Starr."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-fcb1a44d","guard":[["has","imagine"]],"pyramid":["render.template",{"lit":["The artist of ",{"slot":0}," is Nas ft. Lauryn Hill."]},["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-09e858aa","guard":[["hasAny",["changes","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is 2Pac ft. Talent."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-0f16b1ad","guard":[["hasAny",["regrets","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is JAY-Z."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-0faf430a","guard":[["hasAny",["shortest","shortest one","shortest word","spottieottiedopaliscious"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Outkast."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-13405b6f","guard":[["hasAny",["longest","longest one","longest word","yourz"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is J Cole."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-1356202c","guard":[["hasAny",["boyznthehood","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Eazy-E."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-16baa4d6","guard":[["hasAny",["kane","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Big Daddy Kane."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-26940a73","guard":[["has","cant"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Kanye West."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-273c9123","guard":[["hasAny",["respiration","shortest","shortest one","shortest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Black Star ft. Common."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-2a9a5ec3","guard":[["hasAny",["longest","longest one","longest word","lost"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Lauryn Hill."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-2dd62792","guard":[["hasAny",["above","longest","longest one","longest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Gang Starr ft. Inspectah Deck."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-36e8d1b2","guard":[["hasAny",["cheap","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Clipse."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-37e613de","guard":[["hasAny",["bodak","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Cardi B."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-39434473","guard":[["hasAny",["applebum","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is A Tribe Called Quest."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-3caa2d03","guard":[["hasAny",["overseas","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Bohan Phoenix."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-3fd6ffd9","guard":[["hasAny",["digger","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Kanye West ft. Jamie Foxx."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-41472a21","guard":[["hasAny",["about","longest","longest one","longest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Lil Boosie."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-49b20a3e","guard":[["hasAny",["longest","longest one","longest word","milli"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Lil Wayne."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-49c0161f","guard":[["hasAny",["flava","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Rich Gang."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-52987357","guard":[["hasAny",["longest","longest one","longest word","part"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Common."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-565d2786","guard":[["hasAny",["hard","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is JAY-Z."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-5d1cff62","guard":[["hasAny",["mtaktak","shortest","shortest one","shortest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Shabjdeed & Al Nather."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-5d235451","guard":[["hasAny",["longest","longest one","longest word","umoya"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Skwatta Kamp."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-5e1c5d02","guard":[["hasAny",["dash","longest","longest one","longest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Gunplay."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-63513668","guard":[["hasAny",["hip","longest","longest one","longest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Erykah Badu ft. Common."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-64563ffc","guard":[["hasAny",["bling","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is B.G.."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-6b5a8932","guard":[["has","gangsta"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Project Pat."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-6eb5574f","guard":[["hasAny",["falls","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Kanye West ft. Syleena Johnson."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-7467e59d","guard":[["has","c"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Jay Electronica."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-7a47577c","guard":[["hasAny",["longest","longest one","longest word","slow"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Little Brother."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-7d4154a7","guard":[["hasAny",["international","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is UGK ft. OutKast."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-7fb29691","guard":[["hasAny",["longest","longest one","longest word","put"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Big L."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-817942d8","guard":[["hasAny",["church","longest","longest one","longest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is JAY-Z & Kanye West."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-8b3758fc","guard":[["hasAny",["dre","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Dr Dre ft. Snoop Dogg."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-8baafb0b","guard":[["has","pt"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is OutKast."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-8f7f9734","guard":[["hasAny",["bridge","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is BDP."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-93b731c5","guard":[["hasAny",["bring","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Wu-Tang Clan."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-99ea5aae","guard":[["hasAny",["grief","longest","longest one","longest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Earl Sweatshirt."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-a1e6aaf0","guard":[["hasAny",["longest","longest one","longest word","nature"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Ras Kass."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-a2e8b78d","guard":[["hasAny",["dope","longest","longest one","longest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is AKA."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-a3388378","guard":[["has","door"],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Main Source."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-a6790ebd","guard":[["hasAny",["dipset","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Diplomats ft. Juelz Santana & Cam’ron."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-a69483a3","guard":[["hasAny",["kyoto","longest","longest one","longest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Yung Lean."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-a6cb94cd","guard":[["hasAny",["delete","item number","nth","part","position","remove","strip out"]],["has","artist"]],"pyramid":["render.str",["transform.remove",{"lit":"Common"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"n3"}],{"lit":1}]]],"mem":null},
{"id":"n-ab77585b","guard":[["hasAny",["bob","longest","longest one","longest word"]],["has","tell"],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is OutKast."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-b016ae38","guard":[["hasAny",["caps","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Madvillain."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-b80c99cd","guard":[["hasAny",["art","delete","item number","nth","position","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"OutKast"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"n3"}],{"lit":1}]]],"mem":null},
{"id":"n-bb7e99fd","guard":[["hasAny",["art","delete","item number","nth","position","remove","strip out"]]],"pyramid":["render.code",["transform.remove",{"lit":"OutKast"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"n3"}],{"lit":1}]]],"mem":null},
{"id":"n-bd5396a8","guard":[["hasAny",["hypnotize","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is The Notorious B.I.G.."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-c5d34092","guard":[["hasAny",["longest","longest one","longest word","moment"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Nas ft. Quan."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-c6be9dcd","guard":[["hasAny",["longest","longest one","longest word","mask"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Future."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-cddd378b","guard":[["hasAny",["longest","longest one","longest word","queen"]],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Lil’ Kim."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-d2dff0c7","guard":[["hasAny",["renegade","shortest","shortest one","shortest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is JAY-Z ft. Eminem."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-d46d633e","guard":[["hasAny",["black","longest","longest one","longest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is SpaceGhostPurrp."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-d56b0519","guard":[["hasAny",["longest","longest one","longest word","tippin"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Mike Jones."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-d91c573c","guard":[["hasAny",["delete","item number","nth","part","position","remove","strip out"]],["has","artist"]],"pyramid":["render.code",["transform.remove",{"lit":"Common"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"n3"}],{"lit":1}]]],"mem":null},
{"id":"n-d931a035","guard":[["hasAny",["longest","longest one","longest word","old"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Lil Nas X ft. Billy Ray Cyrus."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-dd862066","guard":[["hasAny",["di","longest","longest one","longest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Doug E Fresh & The Get Fresh Crew."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-ddc0b4fa","guard":[["hasAny",["longest","longest one","longest word","wipe"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Foxx & Lil Boosie & Webbie."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-e9a40495","guard":[["hasAny",["lifes","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Nas ft. A.Z.."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-f029dc44","guard":[["hasAny",["faida","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Frankie HI-NRG MC."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-f05798f4","guard":[["hasAny",["longest","longest one","longest word","luv"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Dizzee Rascal."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-f2b5b516","guard":[["hasAny",["longest","longest one","longest word","police"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is NWA."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-f9b0226b","guard":[["hasAny",["longest","longest one","longest word","train"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ASAP Rocky."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]]],"mem":null},
{"id":"n-2011b281","guard":[["hasAny",["alright","item number","nth"]],["has","title"]],"pyramid":["render.template",{"lit":["The artist of Alright is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-242477fd","guard":[["hasAny",["item number","nth","reminisce"]]],"pyramid":["render.template",{"lit":["The artist of They Reminisce Over You (T.R.O.Y.) is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-2d7a7db7","guard":[["hasAny",["concrete","item number","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The artist of Concrete Schoolyard is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-2e24481f","guard":[["hasAny",["bling","first letters of the name","initials","item number","nth"]],["has","what"]],"pyramid":["render.str",["transform.initials",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-49681a15","guard":[["hasAny",["backwards","dope","item number","mirror","nth","reversed","spell backwards"]],["has","artist"]],"pyramid":["render.str",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-4d87a441","guard":[["hasAny",["edge","item number","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of Terminator X To The Edge of Panic is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-4f8ff310","guard":[["hasAny",["imagine","item number","nth"]]],"pyramid":["render.template",{"lit":["The artist of If I Ruled The World (Imagine That) is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-51897215","guard":[["hasAny",["am","item number","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of I Am I Be is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-5ddd1db2","guard":[["hasAny",["diggity","item number","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of No Diggity is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-5e95c7c9","guard":[["hasAny",["hope","item number","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of Witness (1 Hope) is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-6d75aff1","guard":[["hasAny",["item number","nth","warning"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of Warning is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-73047763","guard":[["hasAny",["item number","neck","nth"]]],"pyramid":["render.template",{"lit":["The artist of Protect Ya Neck is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-7b38fc6e","guard":[["hasAny",["ambitionz","item number","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of Ambitionz Az A Ridah is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-7ed9e728","guard":[["hasAny",["item number","nth","runaway"]],["has","tell"]],"pyramid":["render.template",{"lit":["The artist of Runaway is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-85722bab","guard":[["hasAny",["elevators","item number","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The artist of Elevators (Me & You) is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-a9213f0a","guard":[["hasAny",["changed","item number","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of Things Done Changed is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-b25bcd02","guard":[["hasAny",["americas","item number","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of America’s Most Blunted is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-baf9c184","guard":[["hasAny",["item number","lamericano","nth"]]],"pyramid":["render.template",{"lit":["The artist of L'Americano is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-bb7f2889","guard":[["hasAny",["item number","nth","triumph"]],["has","tell"]],"pyramid":["render.template",{"lit":["The artist of Triumph is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-d25c3595","guard":[["hasAny",["bside","item number","nth"]]],"pyramid":["render.template",{"lit":["The artist of It Was A Good Day (B-Side Remix version) is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-ea41e572","guard":[["hasAny",["bling","first letters of the name","initials","item number","nth"]],["has","what"]],"pyramid":["render.code",["transform.initials",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-f83fda2a","guard":[["hasAny",["dangan","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The artist of Shinjitsu No Dangan is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-f8ed3685","guard":[["hasAny",["aiiight","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The artist of Aiiight Chill is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-fafc21be","guard":[["hasAny",["backwards","dope","item number","mirror","nth","reversed","spell backwards"]],["has","artist"]],"pyramid":["render.code",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-60ec66ee","guard":[["hasAny",["artist","element","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.second"]]],"mem":null},
{"id":"n-e622ffea","guard":[["hasAny",["artist","element","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["sense.second"]]],"mem":null},
{"id":"n-f0db4f0b","guard":[["hasAny",["basic","character at","item number","letter at","longest","longest one","longest word","nth","nth letter","which letter"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of B.I.B.L.",{"slot":0},". (Basic ",{"slot":1}," Before Leaving ",{"slot":2},") is Killah Priest."]},["transform.charAt",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":3}],["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-01693532","guard":[["hasAny",["item number","nth","regrets","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Regrets is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-0386c067","guard":[["hasAny",["item number","longest","longest one","longest word","mic","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of One Mic is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-057a6280","guard":[["hasAny",["changes","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Changes is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-094d170d","guard":[["hasAny",["item number","longest","longest one","longest word","mask","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Mask Off is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-0a04922c","guard":[["hasAny",["flava","item number","longest","longest one","longest word","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Flava is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-0b5f51cb","guard":[["hasAny",["goes","item number","longest","longest one","longest word","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of As The Rhyme Goes On is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-0cba0b65","guard":[["hasAny",["bob","item number","longest","longest one","longest word","nth"]],["has","tell"],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of B.O.B. is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-10be6acf","guard":[["hasAny",["item number","longest","longest one","longest word","luv","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of I Luv U is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-16242224","guard":[["hasAny",["caps","item number","longest","longest one","longest word","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of All Caps is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-1d57b399","guard":[["hasAny",["cant","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Can’t Tell Me Nothing is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-2134ea40","guard":[["hasAny",["dope","item number","longest","longest one","longest word","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Sim Dope is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-22e1996b","guard":[["hasAny",["church","item number","longest","longest one","longest word","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of No Church in the Wild is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-25402f4f","guard":[["hasAny",["digger","item number","longest","longest one","longest word","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Gold Digger is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-294c7701","guard":[["hasAny",["item number","longest","longest one","longest word","nth","work"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Work It is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-2c3edc8d","guard":[["hasAny",["am","item number","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of I Am I Be is ",{"slot":1},"."]},["render.and",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-2f8e6193","guard":[["hasAny",["dont","item number","longest","longest one","longest word","nth"]],["has","tell"],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bitch Don’t Kill My Vibe is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-32a73254","guard":[["hasAny",["item number","longest","longest one","longest word","nth","pride"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of PRIDE is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-34b0dc8f","guard":[["hasAny",["full","item number","longest","longest one","longest word","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Paid In Full is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-37290bdd","guard":[["hasAny",["item number","longest","longest one","longest word","nth","put"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Put It On is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-3995e662","guard":[["hasAny",["item number","nth","respiration","shortest","shortest one","shortest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Respiration is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-40883e3e","guard":[["hasAny",["hypnotize","item number","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Hypnotize is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-41483309","guard":[["hasAny",["item number","nth","pt"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Da Art of Storytellin’ (Pt. 2) is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-42689cdf","guard":[["hasAny",["am","item number","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of I Am I Be is ",{"slot":1},"."]},["render.list",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-446f4384","guard":[["hasAny",["follow","item number","longest","longest one","longest word","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Follow The Leader is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-46f038f1","guard":[["hasAny",["item number","nth","overseas","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of OVERSEAS is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-4b558a50","guard":[["hasAny",["item number","longest","longest one","longest word","nth","yourz"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Love Yourz is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-527dfbaf","guard":[["hasAny",["grief","item number","longest","longest one","longest word","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Grief is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-559ddeae","guard":[["hasAny",["door","item number","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Looking At The Front Door is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-561765e6","guard":[["hasAny",["applebum","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bonita Applebum is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-58932e89","guard":[["hasAny",["item number","longest","longest one","longest word","nth","tippin"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Still Tippin’ is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-616090da","guard":[["hasAny",["item number","longest","longest one","longest word","nth","police"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Fuck Tha Police is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-65105d4a","guard":[["hasAny",["codeine","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Codeine Crazy is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-6cb6dca7","guard":[["hasAny",["item number","longest","longest one","longest word","nth","queen"]],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Queen Bitch is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-6e953b83","guard":[["hasAny",["bridge","item number","longest","longest one","longest word","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Bridge Is Over is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-70fa25c0","guard":[["hasAny",["am","item number","longest","longest one","longest word","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of I Am I Be is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-7773e1aa","guard":[["hasAny",["c","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Exhibit C is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-79e20151","guard":[["hasAny",["bodak","item number","longest","longest one","longest word","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bodak Yellow is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-7aa7be5f","guard":[["hasAny",["item number","nth","renegade","shortest","shortest one","shortest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Renegade is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-7b17ffec","guard":[["hasAny",["item number","longest","longest one","longest word","nth","yours"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The World Is Yours is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-8438681f","guard":[["hasAny",["dupa","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Rain (Supa Dupa Fly) is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-847d28dd","guard":[["hasAny",["bring","item number","longest","longest one","longest word","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bring Da Ruckus is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-8506e974","guard":[["hasAny",["item number","longest","longest one","longest word","nth","slow"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Slow It Down is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-887694b6","guard":[["hasAny",["item number","longest","longest one","longest word","nature","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Nature of the Threat is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-88c2422a","guard":[["hasAny",["item number","kane","longest","longest one","longest word","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Warm It Up Kane is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-8b2a076f","guard":[["hasAny",["item number","longest","longest one","longest word","nth","wipe"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Wipe Me Down (Remix) is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-8c5daaa2","guard":[["hasAny",["item number","lifes","longest","longest one","longest word","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Life’s A Bitch is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-8c68c10b","guard":[["hasAny",["above","item number","longest","longest one","longest word","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Above The Clouds is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-8d819778","guard":[["hasAny",["item number","longest","longest one","longest word","moment","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Just A Moment is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-9836c8ed","guard":[["hasAny",["item number","longest","longest one","longest word","milli","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of A Milli is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-985d4e2e","guard":[["hasAny",["item number","longest","longest one","longest word","nth","part"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of It’s Your World (Part 1 & 2) is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-9b3ced61","guard":[["hasAny",["dipset","item number","longest","longest one","longest word","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Dipset Anthem is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-9b8556a4","guard":[["hasAny",["gangsta","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of We Can Get Gangsta is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-9e5c8b8c","guard":[["hasAny",["item number","mtaktak","nth","shortest","shortest one","shortest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Mtaktak is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-a17c3217","guard":[["hasAny",["faida","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Fight Da Faida is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-a205b971","guard":[["hasAny",["black","item number","longest","longest one","longest word","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Black God is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-a205d4d0","guard":[["hasAny",["about","item number","longest","longest one","longest word","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of What About Me is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-a279fa8d","guard":[["hasAny",["dash","item number","longest","longest one","longest word","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bible On The Dash is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-a6854af5","guard":[["hasAny",["cheap","item number","longest","longest one","longest word","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of We Got It For Cheap (Intro) is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-a7e7f40b","guard":[["hasAny",["hip","item number","longest","longest one","longest word","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Love Of My Life (An Ode To Hip Hop) is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-a88e9d07","guard":[["hasAny",["item number","longest","longest one","longest word","lost","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Lost Ones is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-b608b7bf","guard":[["hasAny",["item number","kyoto","longest","longest one","longest word","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Kyoto is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-bbc01984","guard":[["hasAny",["am","item number","nth","shortest","shortest one","shortest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of I Am I Be is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-bf6b2ca7","guard":[["hasAny",["item number","longest","longest one","longest word","nth","old"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Old Town Road (Remix) is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-c6f02bbe","guard":[["hasAny",["boyznthehood","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Boyz-n-the-Hood is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-cc8d44a7","guard":[["hasAny",["bling","item number","longest","longest one","longest word","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bling Bling is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-d829bf22","guard":[["hasAny",["item number","longest","longest one","longest word","nth","umoya"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Umoya is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-d931b479","guard":[["hasAny",["falls","item number","longest","longest one","longest word","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of All Falls Down is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-dd8fc460","guard":[["hasAny",["item number","madness","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of March Madness is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-df150425","guard":[["hasAny",["item number","longest","longest one","longest word","nth","train"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1 Train is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-e2def0e6","guard":[["hasAny",["di","item number","longest","longest one","longest word","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of La Di Da Di is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-e303ae59","guard":[["hasAny",["item number","know","longest","longest one","longest word","nth"]],["has","me"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Know The Ledge is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-e8814d2c","guard":[["hasAny",["international","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of International Players Anthem is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-efbcb416","guard":[["hasAny",["hard","item number","longest","longest one","longest word","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Hard Knock Life is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-f547ea3d","guard":[["hasAny",["dre","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Still D.R.E. is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-f80897df","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","spottieottiedopaliscious"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SpottieOttieDopaliscious is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-4f3b1a49","guard":[["hasAny",["a to z","alphabetical","alphabetize","am","item number","nth"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of I Am I Be is ",{"slot":1},"."]},["render.list",["transform.sortStrs",["sense.content"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-5b68dd57","guard":[["hasAny",["am","backwards","item number","nth","reverse order","reversed"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of I Am I Be is ",{"slot":1},"."]},["render.and",["transform.reverseStrs",["sense.content"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-6837af90","guard":[["hasAny",["am","backwards","item number","nth","reverse order","reversed"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of I Am I Be is ",{"slot":1},"."]},["render.list",["transform.reverseStrs",["sense.content"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]],"mem":null},
{"id":"n-0b34b54b","guard":[["hasAny",["artist","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"n3"}],{"lit":2}]]],"mem":null},
{"id":"n-ec022adf","guard":[["hasAny",["artist","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"n3"}],{"lit":2}]]],"mem":null},
{"id":"n-62a24de6","guard":[["hasAny",["camel case","camelcase","item number","lower camel case","nth","shortest","shortest one","shortest word","spottieottiedopaliscious"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-rankings-e03730"},{"lit":"title"},{"lit":"artist"}]]],"mem":null},
{"id":"n-34e55e1b","guard":[["hasAny",["abbreviate","acronym","basic","capital letters","capitals","longest one","longest word","upper case","uppercase"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of B.I.B.L.",{"slot":0},". (Basic ",{"slot":1}," Before Leaving ",{"slot":2},") is Killah Priest."]},["transform.acronym",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f64ca432","guard":[["hasAny",["abbreviate","acronym","basic","capital letters","capitals","longest one","longest word","upper case","uppercase"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of B.I.B.L.",{"slot":0},". (Basic ",{"slot":1}," Before Leaving ",{"slot":2},") is Killah Priest."]},["transform.acronym",["sense.lastWord"]],["transform.upper",["aggregate.longest",["sense.words"]]],["sense.lastWord"]],"mem":null},
{"id":"n-00ba770e","guard":[["hasAny",["art","artist","da","pt","storytellin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Da Art of Storytellin’ (Pt. 2)":"The artist of Da Art of Storytellin’ (Pt. 2) is OutKast."}}},
{"id":"n-03c6134b","guard":[["hasAny",["artist","elevators","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Elevators (Me & You)":"The artist of Elevators (Me & You) is OutKast."}}},
{"id":"n-06bbbc24","guard":[["hasAny",["artist","know","ledge","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Know The Ledge":"The artist of Know The Ledge is Eric B & Rakim."}}},
{"id":"n-071cd63a","guard":[["hasAny",["artist","bitch","lifes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Life’s A Bitch":"The artist of Life’s A Bitch is Nas ft. A.Z.."}}},
{"id":"n-0847c381","guard":[["hasAny",["artist","milli"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of A Milli":"The artist of A Milli is Lil Wayne."}}},
{"id":"n-155de9a7","guard":[["hasAny",["artist","title","umoya"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Umoya":"The artist of Umoya is Skwatta Kamp."}}},
{"id":"n-16e00421","guard":[["hasAny",["artist","kyoto"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Kyoto":"The artist of Kyoto is Yung Lean."}}},
{"id":"n-1736183b","guard":[["hasAny",["alright","artist","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Alright":"The artist of Alright is Kendrick Lamar."}}},
{"id":"n-17fd4f0d","guard":[["hasAny",["artist","still","tippin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Still Tippin’":"The artist of Still Tippin’ is Mike Jones."}}},
{"id":"n-1ae1003f","guard":[["hasAny",["artist","fuck","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Fuck You":"The artist of Fuck You is The LOX."}}},
{"id":"n-1c34c477","guard":[["hasAny",["artist","gangsta","get"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for We Can Get Gangsta":"The artist of We Can Get Gangsta is Project Pat."}}},
{"id":"n-2347bf1c","guard":[["hasAny",["artist","basic","before","bible","earth","instructions","leaving"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of B.I.B.L.E. (Basic Instructions Before Leaving Earth)":"The artist of B.I.B.L.E. (Basic Instructions Before Leaving Earth) is Killah Priest."}}},
{"id":"n-2529a197","guard":[["hasAny",["artist","bitch","dont","kill","title","vibe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Bitch Don’t Kill My Vibe":"The artist of Bitch Don’t Kill My Vibe is Kendrick Lamar."}}},
{"id":"n-26dcd33e","guard":[["hasAny",["artist","mtaktak"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Mtaktak":"The artist of Mtaktak is Shabjdeed & Al Nather."}}},
{"id":"n-27794773","guard":[["hasAny",["artist","full","paid"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Paid In Full":"The artist of Paid In Full is Eric B & Rakim."}}},
{"id":"n-3358c05e","guard":[["hasAny",["artist","love","one"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of One Love":"The artist of One Love is Nas."}}},
{"id":"n-3648d6e0","guard":[["hasAny",["artist","renegade"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Renegade":"The artist of Renegade is JAY-Z ft. Eminem."}}},
{"id":"n-36d01608","guard":[["hasAny",["artist","train"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for 1 Train":"The artist of 1 Train is ASAP Rocky."}}},
{"id":"n-3a3178f0","guard":[["hasAny",["artist","bible","dash"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Bible On The Dash":"The artist of Bible On The Dash is Gunplay."}}},
{"id":"n-3f96c86e","guard":[["hasAny",["artist","pride"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for PRIDE":"The artist of PRIDE is Kendrick Lamar."}}},
{"id":"n-436e52fb","guard":[["hasAny",["artist","imagine","ruled","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of If I Ruled The World (Imagine That)":"The artist of If I Ruled The World (Imagine That) is Nas ft. Lauryn Hill."}}},
{"id":"n-4a82b55e","guard":[["hasAny",["artist","mic","one"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of One Mic":"The artist of One Mic is Nas."}}},
{"id":"n-4cd74cb8","guard":[["hasAny",["artist","work"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Work It":"The artist of Work It is Missy Elliott."}}},
{"id":"n-4f44e4de","guard":[["hasAny",["artist","got"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for I Got 5 On It":"The artist of I Got 5 On It is Luniz."}}},
{"id":"n-51522407","guard":[["hasAny",["artist","bside","day","good","remix","title","version"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title It Was A Good Day (B-Side Remix version)":"The artist of It Was A Good Day (B-Side Remix version) is Ice Cube."}}},
{"id":"n-521fdb23","guard":[["hasAny",["above","artist","clouds"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Above The Clouds":"The artist of Above The Clouds is Gang Starr ft. Inspectah Deck."}}},
{"id":"n-54743c86","guard":[["hasAny",["artist","bridge","over","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title The Bridge Is Over":"The artist of The Bridge Is Over is BDP."}}},
{"id":"n-55f7c65f","guard":[["hasAny",["artist","part","title","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title It’s Your World (Part 1 & 2)":"The artist of It’s Your World (Part 1 & 2) is Common."}}},
{"id":"n-5b77fdd9","guard":[["hasAny",["artist","dupa","fly","rain","supa","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title The Rain (Supa Dupa Fly)":"The artist of The Rain (Supa Dupa Fly) is Missy Elliott."}}},
{"id":"n-622fd14f","guard":[["hasAny",["artist","church","no","title","wild"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title No Church in the Wild":"The artist of No Church in the Wild is JAY-Z & Kanye West."}}},
{"id":"n-623fb30b","guard":[["hasAny",["artist","fuck","police","tha","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Fuck Tha Police":"The artist of Fuck Tha Police is NWA."}}},
{"id":"n-63eca1ad","guard":[["hasAny",["artist","diggity","no"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of No Diggity":"The artist of No Diggity is Blackstreet ft. Dr Dre and Queen Pen."}}},
{"id":"n-64725dbb","guard":[["hasAny",["artist","over","reminisce","troy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of They Reminisce Over You (T.R.O.Y.)":"The artist of They Reminisce Over You (T.R.O.Y.) is Pete Rock & C.L. Smooth."}}},
{"id":"n-654e3d24","guard":[["hasAny",["artist","madness","march"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for March Madness":"The artist of March Madness is Future."}}},
{"id":"n-66f76fc8","guard":[["hasAny",["artist","da","di","la","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title La Di Da Di":"The artist of La Di Da Di is Doug E Fresh & The Get Fresh Crew."}}},
{"id":"n-670fd0e7","guard":[["hasAny",["artist","love","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Love Is…":"The artist of Love Is… is Common."}}},
{"id":"n-6a947927","guard":[["hasAny",["art","artist","da","storytellin","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Da Art Of Storytellin’":"The artist of Da Art Of Storytellin’ is OutKast."}}},
{"id":"n-6fb67c0c","guard":[["hasAny",["artist","spottieottiedopaliscious"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of SpottieOttieDopaliscious":"The artist of SpottieOttieDopaliscious is Outkast."}}},
{"id":"n-7333d461","guard":[["hasAny",["artist","black","god"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for The Black God":"The artist of The Black God is SpaceGhostPurrp."}}},
{"id":"n-778e6282","guard":[["hasAny",["artist","runaway","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Runaway":"The artist of Runaway is Kanye West ft. Pusha T."}}},
{"id":"n-87c26095","guard":[["hasAny",["artist","luv","title","u"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title I Luv U":"The artist of I Luv U is Dizzee Rascal."}}},
{"id":"n-8808c26b","guard":[["hasAny",["ambitionz","artist","az","ridah"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Ambitionz Az A Ridah":"The artist of Ambitionz Az A Ridah is 2Pac."}}},
{"id":"n-8ca24ac8","guard":[["hasAny",["artist","mask","off"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Mask Off":"The artist of Mask Off is Future."}}},
{"id":"n-90a11441","guard":[["hasAny",["artist","love","yourz"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Love Yourz":"The artist of Love Yourz is J Cole."}}},
{"id":"n-9170d15f","guard":[["hasAny",["artist","dre","still","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Still D.R.E.":"The artist of Still D.R.E. is Dr Dre ft. Snoop Dogg."}}},
{"id":"n-91fc2cff","guard":[["hasAny",["artist","dangan","no","shinjitsu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Shinjitsu No Dangan":"The artist of Shinjitsu No Dangan is King Giddra."}}},
{"id":"n-935e3c24","guard":[["hasAny",["artist","changes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Changes":"The artist of Changes is 2Pac ft. Talent."}}},
{"id":"n-946c91e8","guard":[["hasAny",["artist","cant","nothing"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Can’t Tell Me Nothing":"The artist of Can’t Tell Me Nothing is Kanye West."}}},
{"id":"n-9522c1e0","guard":[["hasAny",["artist","overseas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for OVERSEAS":"The artist of OVERSEAS is Bohan Phoenix."}}},
{"id":"n-98f67d66","guard":[["hasAny",["artist","door","front","looking"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Looking At The Front Door":"The artist of Looking At The Front Door is Main Source."}}},
{"id":"n-994150b8","guard":[["hasAny",["artist","moment","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Just A Moment":"The artist of Just A Moment is Nas ft. Quan."}}},
{"id":"n-9959a5c6","guard":[["hasAny",["artist","goes","rhyme"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of As The Rhyme Goes On":"The artist of As The Rhyme Goes On is Eric B & Rakim."}}},
{"id":"n-998757b4","guard":[["hasAny",["all","artist","down","falls"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for All Falls Down":"The artist of All Falls Down is Kanye West ft. Syleena Johnson."}}},
{"id":"n-9b090d13","guard":[["hasAny",["artist","hypnotize"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Hypnotize":"The artist of Hypnotize is The Notorious B.I.G.."}}},
{"id":"n-9ba1ddec","guard":[["hasAny",["artist","respiration"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Respiration":"The artist of Respiration is Black Star ft. Common."}}},
{"id":"n-9bfb446d","guard":[["hasAny",["artist","codeine","crazy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Codeine Crazy":"The artist of Codeine Crazy is Future."}}},
{"id":"n-9d32869c","guard":[["hasAny",["artist","title","warning"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Warning":"The artist of Warning is The Notorious B.I.G.."}}},
{"id":"n-9dc17aa5","guard":[["hasAny",["anthem","artist","international","players"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for International Players Anthem":"The artist of International Players Anthem is UGK ft. OutKast."}}},
{"id":"n-9e6f4af0","guard":[["hasAny",["artist","neck","protect","title","ya"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Protect Ya Neck":"The artist of Protect Ya Neck is Wu-Tang Clan."}}},
{"id":"n-a20c0d65","guard":[["hasAny",["artist","old","remix","road","town"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Old Town Road (Remix)":"The artist of Old Town Road (Remix) is Lil Nas X ft. Billy Ray Cyrus."}}},
{"id":"n-a25d3c96","guard":[["hasAny",["artist","lost","ones"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Lost Ones":"The artist of Lost Ones is Lauryn Hill."}}},
{"id":"n-a33a684f","guard":[["hasAny",["artist","edge","panic","terminator","x"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Terminator X To The Edge of Panic":"The artist of Terminator X To The Edge of Panic is Public Enemy."}}},
{"id":"n-a7d2ecff","guard":[["hasAny",["artist","dope","sim"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Sim Dope":"The artist of Sim Dope is AKA."}}},
{"id":"n-a7edb3d0","guard":[["hasAny",["artist","da","faida","fight","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Fight Da Faida":"The artist of Fight Da Faida is Frankie HI-NRG MC."}}},
{"id":"n-a85fb4eb","guard":[["hasAny",["artist","hope","witness"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Witness (1 Hope)":"The artist of Witness (1 Hope) is Roots Manuva."}}},
{"id":"n-b1adb0f1","guard":[["hasAny",["artist","day","one","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title One Day":"The artist of One Day is UGK."}}},
{"id":"n-b4be57d5","guard":[["hasAny",["applebum","artist","bonita"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Bonita Applebum":"The artist of Bonita Applebum is A Tribe Called Quest."}}},
{"id":"n-b6204756","guard":[["hasAny",["artist","hip","hop","life","love","ode","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Love Of My Life (An Ode To Hip Hop)":"The artist of Love Of My Life (An Ode To Hip Hop) is Erykah Badu ft. Common."}}},
{"id":"n-b81aa273","guard":[["hasAny",["artist","bling"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Bling Bling":"The artist of Bling Bling is B.G.."}}},
{"id":"n-b999f202","guard":[["hasAny",["artist","flava"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Flava":"The artist of Flava is Rich Gang."}}},
{"id":"n-be13e6c8","guard":[["hasAny",["artist","concrete","schoolyard","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Concrete Schoolyard":"The artist of Concrete Schoolyard is Jurassic 5."}}},
{"id":"n-c8a37c83","guard":[["hasAny",["artist","kane","up","warm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Warm It Up Kane":"The artist of Warm It Up Kane is Big Daddy Kane."}}},
{"id":"n-c8ad7ac2","guard":[["hasAny",["artist","down","slow","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Slow It Down":"The artist of Slow It Down is Little Brother."}}},
{"id":"n-cc0d687f","guard":[["hasAny",["artist","digger","gold"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Gold Digger":"The artist of Gold Digger is Kanye West ft. Jamie Foxx."}}},
{"id":"n-cc828bd1","guard":[["hasAny",["americas","artist","blunted","most"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of America’s Most Blunted":"The artist of America’s Most Blunted is Madvillain."}}},
{"id":"n-ccfb47ae","guard":[["hasAny",["anthem","artist","dipset","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Dipset Anthem":"The artist of Dipset Anthem is Diplomats ft. Juelz Santana & Cam’ron."}}},
{"id":"n-cea4fcd6","guard":[["hasAny",["artist","hard","knock","life"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Hard Knock Life":"The artist of Hard Knock Life is JAY-Z."}}},
{"id":"n-cf04e1c1","guard":[["hasAny",["artist","nature","threat"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Nature of the Threat":"The artist of Nature of the Threat is Ras Kass."}}},
{"id":"n-cf2e2ada","guard":[["hasAny",["artist","c","exhibit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Exhibit C":"The artist of Exhibit C is Jay Electronica."}}},
{"id":"n-cf7883c5","guard":[["hasAny",["artist","bitch","queen"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Queen Bitch":"The artist of Queen Bitch is Lil’ Kim."}}},
{"id":"n-dc45380f","guard":[["hasAny",["artist","cheap","got","intro"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for We Got It For Cheap (Intro)":"The artist of We Got It For Cheap (Intro) is Clipse."}}},
{"id":"n-dc5f9424","guard":[["hasAny",["aiiight","artist","chill"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Aiiight Chill":"The artist of Aiiight Chill is Gang Starr."}}},
{"id":"n-e2e5010b","guard":[["hasAny",["artist","title","triumph"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Triumph":"The artist of Triumph is Wu-Tang Clan."}}},
{"id":"n-e3dd244e","guard":[["hasAny",["all","artist","caps","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title All Caps":"The artist of All Caps is Madvillain."}}},
{"id":"n-ea3bab16","guard":[["hasAny",["artist","regrets"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Regrets":"The artist of Regrets is JAY-Z."}}},
{"id":"n-ead678af","guard":[["hasAny",["artist","lamericano","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title L'Americano":"The artist of L'Americano is Akhenaton."}}},
{"id":"n-ec3c377a","guard":[["hasAny",["artist","follow","leader"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Follow The Leader":"The artist of Follow The Leader is Eric B & Rakim."}}},
{"id":"n-ed366aae","guard":[["hasAny",["about","artist"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of What About Me":"The artist of What About Me is Lil Boosie."}}},
{"id":"n-eefd6f9e","guard":[["hasAny",["artist","changed","done","things"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Things Done Changed":"The artist of Things Done Changed is The Notorious B.I.G.."}}},
{"id":"n-f137f82a","guard":[["hasAny",["artist","put"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of Put It On":"The artist of Put It On is Big L."}}},
{"id":"n-f1da8ae4","guard":[["hasAny",["artist","down","remix","wipe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Wipe Me Down (Remix)":"The artist of Wipe Me Down (Remix) is Foxx & Lil Boosie & Webbie."}}},
{"id":"n-f737a940","guard":[["hasAny",["artist","world","yours"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the artist of The World Is Yours":"The artist of The World Is Yours is Nas."}}},
{"id":"n-f7a8d831","guard":[["hasAny",["artist","bodak","yellow"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Bodak Yellow":"The artist of Bodak Yellow is Cardi B."}}},
{"id":"n-f84d54c9","guard":[["hasAny",["artist","grief","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Grief":"The artist of Grief is Earl Sweatshirt."}}},
{"id":"n-f8a5b4c1","guard":[["hasAny",["artist","bob","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title B.O.B.":"The artist of B.O.B. is OutKast."}}},
{"id":"n-f94208b5","guard":[["hasAny",["artist","bring","da","ruckus","title"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Bring Da Ruckus":"The artist of Bring Da Ruckus is Wu-Tang Clan."}}},
{"id":"n-fc13a601","guard":[["hasAny",["artist","got"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for You Got Me":"The artist of You Got Me is The Roots ft. Erykah Badu."}}},
{"id":"n-fdd96b8e","guard":[["hasAny",["artist","boyznthehood"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the artist for Boyz-n-the-Hood":"The artist of Boyz-n-the-Hood is Eazy-E."}}},
{"id":"n-0a719f13","guard":[["hasAny",["delete","part","remove","strip out"]],["has","artist"]],"pyramid":["render.code",["transform.remove",{"lit":"Common"},["sense.numeral"]]],"mem":null},
{"id":"n-303c7607","guard":[["hasAny",["normalise","normalize","part","simplify the text"]],["has","artist"]],"pyramid":["render.str",["transform.norm",{"lit":"Common"},["sense.first"]]],"mem":null},
{"id":"n-34654e92","guard":[["hasAny",["copies","part","repeat","say it times"]],["has","artist"]],"pyramid":["render.code",["transform.repeat",{"lit":"Common"},["sense.first"]]],"mem":null},
{"id":"n-37c3ca3d","guard":[["hasAny",["art","copies","repeat","say it times"]]],"pyramid":["render.str",["transform.repeat",{"lit":"outkast"},["sense.howMany"]]],"mem":null},
{"id":"n-41c068ba","guard":[["hasAny",["art","delete","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"outkast"},["sense.numeral"]]],"mem":null},
{"id":"n-4298af6e","guard":[["hasAny",["copies","pt","say it times"]],["has","artist"]],"pyramid":["render.code",["transform.repeat",{"lit":"OutKast"},["sense.howMany"]]],"mem":null},
{"id":"n-5145c7f1","guard":[["has","part"],["has","artist"]],"pyramid":["render.lines",["iterate.repeat",{"lit":"Common"},["sense.first"]]],"mem":null},
{"id":"n-57ddb78c","guard":[["hasAny",["art","delete","remove","strip out"]]],"pyramid":["render.code",["transform.remove",{"lit":"OutKast"},["sense.numeral"]]],"mem":null},
{"id":"n-61818bd9","guard":[["hasAny",["art","copies","repeat","say it times"]]],"pyramid":["render.str",["transform.repeat",{"lit":"OutKast"},["sense.howMany"]]],"mem":null},
{"id":"n-6742586e","guard":[["hasAny",["art","normalise","normalize","simplify the text"]]],"pyramid":["render.str",["transform.norm",{"lit":"OutKast"},["sense.first"]]],"mem":null},
{"id":"n-6ee8f853","guard":[["has","art"]],"pyramid":["render.and",["iterate.repeat",{"lit":"OutKast"},["sense.howMany"]]],"mem":null},
{"id":"n-6f6b91b4","guard":[["has","part"],["has","artist"]],"pyramid":["render.list",["iterate.repeat",{"lit":"Common"},["sense.first"]]],"mem":null},
{"id":"n-764708e3","guard":[["has","art"]],"pyramid":["render.list",["iterate.repeat",{"lit":"OutKast"},["sense.howMany"]]],"mem":null},
{"id":"n-800f005d","guard":[["hasAny",["copies","part","repeat","say it times"]],["has","artist"]],"pyramid":["render.str",["transform.repeat",{"lit":"Common"},["sense.first"]]],"mem":null},
{"id":"n-8b3f8b51","guard":[["hasAny",["am","longest one","longest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of I Am I Be is De La Soul."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9439ff1e","guard":[["hasAny",["normalise","normalize","part","simplify the text"]],["has","artist"]],"pyramid":["render.code",["transform.norm",{"lit":"Common"},["sense.first"]]],"mem":null},
{"id":"n-a22bcff2","guard":[["hasAny",["copies","pt","say it times"]],["has","artist"]],"pyramid":["render.code",["transform.repeat",{"lit":"outkast"},["sense.howMany"]]],"mem":null},
{"id":"n-af4b28f4","guard":[["hasAny",["delete","part","strip out"]],["has","artist"]],"pyramid":["render.str",["transform.remove",{"lit":"Common"},["sense.lastWord"]]],"mem":null},
{"id":"n-bac3cac9","guard":[["has","art"]],"pyramid":["render.lines",["iterate.repeat",{"lit":"outkast"},["sense.howMany"]]],"mem":null},
{"id":"n-c4529ebb","guard":[["hasAny",["art","delete","remove","strip out"]]],"pyramid":["render.code",["transform.remove",{"lit":"outkast"},["sense.numeral"]]],"mem":null},
{"id":"n-c5a75bff","guard":[["has","part"],["has","artist"]],"pyramid":["render.and",["iterate.repeat",{"lit":"Common"},["sense.first"]]],"mem":null},
{"id":"n-d03bf1e6","guard":[["has","art"]],"pyramid":["render.lines",["iterate.repeat",{"lit":"OutKast"},["sense.howMany"]]],"mem":null},
{"id":"n-d367e786","guard":[["hasAny",["delete","part","remove","strip out"]],["has","artist"]],"pyramid":["render.str",["transform.remove",{"lit":"Common"},["sense.numeral"]]],"mem":null},
{"id":"n-d7f5f707","guard":[["has","art"]],"pyramid":["render.list",["iterate.repeat",{"lit":"outkast"},["sense.howMany"]]],"mem":null},
{"id":"n-e7b56848","guard":[["hasAny",["art","normalise","normalize","simplify the text"]]],"pyramid":["render.code",["transform.norm",{"lit":"OutKast"},["sense.first"]]],"mem":null},
{"id":"n-ec1ca36e","guard":[["hasAny",["art","delete","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"OutKast"},["sense.numeral"]]],"mem":null},
{"id":"n-f3fe6a9d","guard":[["hasAny",["delete","part","strip out"]],["has","artist"]],"pyramid":["render.code",["transform.remove",{"lit":"Common"},["sense.lastWord"]]],"mem":null},
{"id":"n-ff3109b2","guard":[["has","art"]],"pyramid":["render.and",["iterate.repeat",{"lit":"outkast"},["sense.howMany"]]],"mem":null},
{"id":"n-60e14e50","guard":[["hasAny",["basic","longest one","longest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of B.I.B.L.E. (Basic ",{"slot":0}," Before Leaving ",{"slot":1},") is Killah Priest."]},["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-d276589c","guard":[["hasAny",["abbreviate","acronym","basic"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of B.I.B.L.",{"slot":0},". (Basic Instructions Before Leaving ",{"slot":1},") is Killah Priest."]},["transform.acronym",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-3297378a","guard":[["hasAny",["abbreviate","acronym","basic","longest one","longest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of B.I.B.L.",{"slot":0},". (Basic ",{"slot":1}," Before Leaving Earth) is Killah Priest."]},["transform.acronym",["sense.lastWord"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c0a66fb6","guard":[["hasAny",["abbreviate","acronym","basic","longest one","longest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of B.I.B.L.",{"slot":0},". (Basic ",{"slot":1}," Before Leaving ",{"slot":2},") is Killah Priest."]},["transform.acronym",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-080973ab","guard":[["hasAny",["basic","character at","letter at","longest one","longest word","nth letter","which letter"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of B.I.B.L.",{"slot":0},". (Basic ",{"slot":1}," Before Leaving ",{"slot":2},") is Killah Priest."]},["transform.charAt",["sense.text"],["sense.wordCount"]],["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-3cf2f08d","guard":[["hasAny",["basic","character at","letter at","longest one","longest word","nth letter","which letter"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of B.I.B.L.",{"slot":0},". (Basic ",{"slot":1}," Before Leaving ",{"slot":2},") is Killah Priest."]},["transform.charAt",["sense.lastWord"],{"lit":1}],["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-6ae7e12b","guard":[["hasAny",["abbreviate","acronym","basic","class name","longest one","longest word","pascal case","pascalcase","upper camel case"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of B.I.B.L.",{"slot":0},". (Basic ",{"slot":1}," Before Leaving ",{"slot":2},") is Killah Priest."]},["transform.acronym",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["transform.pascal",["sense.lastWord"]]],"mem":null},
{"id":"n-702c2301","guard":[["hasAny",["abbreviate","acronym","basic","camel case","camelcase","longest one","longest word","lower camel case"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of B.I.B.L.",{"slot":0},". (Basic ",{"slot":1}," Before Leaving ",{"slot":2},") is Killah Priest."]},["transform.acronym",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-7703f7dc","guard":[["hasAny",["abbreviate","acronym","basic","longest one","longest word","lower case","lowercase","small letters"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of B.I.B.L.",{"slot":0},". (Basic ",{"slot":1}," Before Leaving ",{"slot":2},") is Killah Priest."]},["transform.acronym",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b866d877","guard":[["hasAny",["abbreviate","acronym","basic","invert case","longest one","longest word","swap case","toggle case"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of B.I.B.L.",{"slot":0},". (Basic ",{"slot":1}," Before Leaving ",{"slot":2},") is Killah Priest."]},["transform.acronym",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d6b17bd2","guard":[["hasAny",["abbreviate","acronym","basic","capitalise","capitalize","capitalize each word","longest one","longest word"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of B.I.B.L.",{"slot":0},". (Basic ",{"slot":1}," Before Leaving ",{"slot":2},") is Killah Priest."]},["transform.acronym",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-51d111a1","guard":[["hasAny",["abbreviate","acronym","basic","each word","longest one","longest word","split into words"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of B.I.B.L.",{"slot":0},". (Basic ",{"slot":1}," Before Leaving ",{"slot":2},") is Killah Priest."]},["transform.acronym",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5743d588","guard":[["hasAny",["abbreviate","acronym","basic","each word","longest one","longest word","split into words"]],["has","artist"]],"pyramid":["render.template",{"lit":["The artist of B.I.B.L.",{"slot":0},". (Basic ",{"slot":1}," Before Leaving ",{"slot":2},") is Killah Priest."]},["transform.acronym",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a804f319","guard":[["hasAny",["about","above","aiiight","ambitionz","americas","anthem","applebum","bible","bitch","black","bling","bodak","boyznthehood","c","cant","changed","cheap","codeine","digger","door","dope","edge","flava","follow","full","gangsta","hypnotize","kane","kyoto","lost","madness","mask","milli","mtaktak","nature","no","overseas","pride","put","regrets","remix","renegade","respiration","spottieottiedopaliscious"]],["has","artist"],["not",["has","dance"]],["not",["has","holy"]],["not",["has","aceyalone"]],["not",["has","aint"]],["not",["has","aka"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of One Mic":"The artist of One Mic is Nas.","what is the artist of Follow The Leader":"The artist of Follow The Leader is Eric B & Rakim.","tell me the artist of the title Love Of My Life (An Ode To Hip Hop)":"The artist of Love Of My Life (An Ode To Hip Hop) is Erykah Badu ft. Common.","tell me the artist of the title Just A Moment":"The artist of Just A Moment is Nas ft. Quan.","give the artist for Wipe Me Down (Remix)":"The artist of Wipe Me Down (Remix) is Foxx & Lil Boosie & Webbie.","tell me the artist of the title Fuck Tha Police":"The artist of Fuck Tha Police is NWA.","tell me the artist of the title The Bridge Is Over":"The artist of The Bridge Is Over is BDP.","what is the artist of Put It On":"The artist of Put It On is Big L.","what is the artist of What About Me":"The artist of What About Me is Lil Boosie.","what is the artist of As The Rhyme Goes On":"The artist of As The Rhyme Goes On is Eric B & Rakim.","what is the artist of Respiration":"The artist of Respiration is Black Star ft. Common.","give the artist for Kyoto":"The artist of Kyoto is Yung Lean.","tell me the artist of the title I Luv U":"The artist of I Luv U is Dizzee Rascal.","what is the artist of Ambitionz Az A Ridah":"The artist of Ambitionz Az A Ridah is 2Pac.","give the artist for Love Yourz":"The artist of Love Yourz is J Cole.","what is the artist of No Diggity":"The artist of No Diggity is Blackstreet ft. Dr Dre and Queen Pen.","what is the artist of Regrets":"The artist of Regrets is JAY-Z.","what is the artist of Things Done Changed":"The artist of Things Done Changed is The Notorious B.I.G..","give the artist for Sim Dope":"The artist of Sim Dope is AKA.","tell me the artist of the title Runaway":"The artist of Runaway is Kanye West ft. Pusha T.","give the artist for Still Tippin’":"The artist of Still Tippin’ is Mike Jones.","what is the artist of Bling Bling":"The artist of Bling Bling is B.G..","what is the artist of Shinjitsu No Dangan":"The artist of Shinjitsu No Dangan is King Giddra.","what is the artist of A Milli":"The artist of A Milli is Lil Wayne.","give the artist for OVERSEAS":"The artist of OVERSEAS is Bohan Phoenix.","tell me the artist of the title Slow It Down":"The artist of Slow It Down is Little Brother.","give the artist for Bonita Applebum":"The artist of Bonita Applebum is A Tribe Called Quest.","what is the artist of Nature of the Threat":"The artist of Nature of the Threat is Ras Kass.","give the artist for You Got Me":"The artist of You Got Me is The Roots ft. Erykah Badu.","give the artist for Boyz-n-the-Hood":"The artist of Boyz-n-the-Hood is Eazy-E.","what is the artist of Renegade":"The artist of Renegade is JAY-Z ft. Eminem.","tell me the artist of the title Fuck You":"The artist of Fuck You is The LOX.","give the artist for All Falls Down":"The artist of All Falls Down is Kanye West ft. Syleena Johnson.","tell me the artist of the title Elevators (Me & You)":"The artist of Elevators (Me & You) is OutKast.","give the artist for We Can Get Gangsta":"The artist of We Can Get Gangsta is Project Pat.","tell me the artist of the title Protect Ya Neck":"The artist of Protect Ya Neck is Wu-Tang Clan.","give the artist for Hard Knock Life":"The artist of Hard Knock Life is JAY-Z.","what is the artist of B.I.B.L.E. (Basic Instructions Before Leaving Earth)":"The artist of B.I.B.L.E. (Basic Instructions Before Leaving Earth) is Killah Priest.","tell me the artist of the title Da Art Of Storytellin’":"The artist of Da Art Of Storytellin’ is OutKast.","what is the artist of Hypnotize":"The artist of Hypnotize is The Notorious B.I.G..","give the artist for Changes":"The artist of Changes is 2Pac ft. Talent.","give the artist for PRIDE":"The artist of PRIDE is Kendrick Lamar.","tell me the artist of the title Concrete Schoolyard":"The artist of Concrete Schoolyard is Jurassic 5.","what is the artist of The World Is Yours":"The artist of The World Is Yours is Nas.","tell me the artist of the title Still D.R.E.":"The artist of Still D.R.E. is Dr Dre ft. Snoop Dogg.","what is the artist of America’s Most Blunted":"The artist of America’s Most Blunted is Madvillain.","tell me the artist of the title La Di Da Di":"The artist of La Di Da Di is Doug E Fresh & The Get Fresh Crew.","tell me the artist of the title Grief":"The artist of Grief is Earl Sweatshirt.","what is the artist of SpottieOttieDopaliscious":"The artist of SpottieOttieDopaliscious is Outkast.","what is the artist of They Reminisce Over You (T.R.O.Y.)":"The artist of They Reminisce Over You (T.R.O.Y.) is Pete Rock & C.L. Smooth.","what is the artist of Warm It Up Kane":"The artist of Warm It Up Kane is Big Daddy Kane.","what is the artist of Paid In Full":"The artist of Paid In Full is Eric B & Rakim.","tell me the artist of the title Bring Da Ruckus":"The artist of Bring Da Ruckus is Wu-Tang Clan.","give the artist for Bodak Yellow":"The artist of Bodak Yellow is Cardi B.","tell me the artist of the title Alright":"The artist of Alright is Kendrick Lamar.","what is the artist of Queen Bitch":"The artist of Queen Bitch is Lil’ Kim.","tell me the artist of the title L'Americano":"The artist of L'Americano is Akhenaton.","tell me the artist of the title Bitch Don’t Kill My Vibe":"The artist of Bitch Don’t Kill My Vibe is Kendrick Lamar.","what is the artist of I Am I Be":"The artist of I Am I Be is De La Soul.","give the artist for We Got It For Cheap (Intro)":"The artist of We Got It For Cheap (Intro) is Clipse.","tell me the artist of the title Triumph":"The artist of Triumph is Wu-Tang Clan.","what is the artist of Terminator X To The Edge of Panic":"The artist of Terminator X To The Edge of Panic is Public Enemy.","tell me the artist of the title Dipset Anthem":"The artist of Dipset Anthem is Diplomats ft. Juelz Santana & Cam’ron.","tell me the artist of the title No Church in the Wild":"The artist of No Church in the Wild is JAY-Z & Kanye West.","tell me the artist of the title Know The Ledge":"The artist of Know The Ledge is Eric B & Rakim.","give the artist for Mtaktak":"The artist of Mtaktak is Shabjdeed & Al Nather.","give the artist for Codeine Crazy":"The artist of Codeine Crazy is Future.","tell me the artist of the title Fight Da Faida":"The artist of Fight Da Faida is Frankie HI-NRG MC.","give the artist for Can’t Tell Me Nothing":"The artist of Can’t Tell Me Nothing is Kanye West.","tell me the artist of the title All Caps":"The artist of All Caps is Madvillain.","what is the artist of Aiiight Chill":"The artist of Aiiight Chill is Gang Starr.","what is the artist of Old Town Road (Remix)":"The artist of Old Town Road (Remix) is Lil Nas X ft. Billy Ray Cyrus.","tell me the artist of the title One Day":"The artist of One Day is UGK.","give the artist for Work It":"The artist of Work It is Missy Elliott.","give the artist for International Players Anthem":"The artist of International Players Anthem is UGK ft. OutKast.","give the artist for Looking At The Front Door":"The artist of Looking At The Front Door is Main Source.","tell me the artist of the title Umoya":"The artist of Umoya is Skwatta Kamp.","give the artist for The What":"The artist of The What is The Notorious B.I.G. ft. Method Man.","tell me the artist of the title Love Is…":"The artist of Love Is… is Common.","tell me the artist of the title The Rain (Supa Dupa Fly)":"The artist of The Rain (Supa Dupa Fly) is Missy Elliott.","tell me the artist of the title Warning":"The artist of Warning is The Notorious B.I.G..","give the artist for Gold Digger":"The artist of Gold Digger is Kanye West ft. Jamie Foxx.","give the artist for March Madness":"The artist of March Madness is Future.","tell me the artist of the title B.O.B.":"The artist of B.O.B. is OutKast.","give the artist for Exhibit C":"The artist of Exhibit C is Jay Electronica.","what is the artist of Above The Clouds":"The artist of Above The Clouds is Gang Starr ft. Inspectah Deck.","what is the artist of One Love":"The artist of One Love is Nas.","what is the artist of Bible On The Dash":"The artist of Bible On The Dash is Gunplay.","give the artist for Lost Ones":"The artist of Lost Ones is Lauryn Hill.","give the artist for Flava":"The artist of Flava is Rich Gang.","tell me the artist of the title It Was A Good Day (B-Side Remix version)":"The artist of It Was A Good Day (B-Side Remix version) is Ice Cube.","give the artist for The Black God":"The artist of The Black God is SpaceGhostPurrp.","what is the artist of Mask Off":"The artist of Mask Off is Future.","give the artist for Life’s A Bitch":"The artist of Life’s A Bitch is Nas ft. A.Z..","what is the artist of If I Ruled The World (Imagine That)":"The artist of If I Ruled The World (Imagine That) is Nas ft. Lauryn Hill."}}},
{"id":"n-04a8b868","guard":[["hasAny",["artist","dupa","fly","rain","supa","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title The Rain (Supa Dupa Fly)":"The artist of The Rain (Supa Dupa Fly) is Missy Elliott."}}},
{"id":"n-0a00f145","guard":[["hasAny",["artist","down","slow","title"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Slow It Down":"The artist of Slow It Down is Little Brother."}}},
{"id":"n-0a5a954b","guard":[["hasAny",["artist","bitch","dont","kill","title","vibe"]],["has","artist"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Bitch Don’t Kill My Vibe":"The artist of Bitch Don’t Kill My Vibe is Kendrick Lamar."}}},
{"id":"n-0bd0229a","guard":[["has","lamericano"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title L'Americano":"The artist of L'Americano is Akhenaton."}}},
{"id":"n-0ef581fe","guard":[["hasAny",["artist","bible","dash"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Bible On The Dash":"The artist of Bible On The Dash is Gunplay."}}},
{"id":"n-142eee45","guard":[["hasAny",["artist","gangsta","get"]],["has","we"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for We Can Get Gangsta":"The artist of We Can Get Gangsta is Project Pat."}}},
{"id":"n-1494990f","guard":[["has","milli"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of A Milli":"The artist of A Milli is Lil Wayne."}}},
{"id":"n-1785eeae","guard":[["hasAny",["artist","hard","knock","life"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Hard Knock Life":"The artist of Hard Knock Life is JAY-Z."}}},
{"id":"n-1796923a","guard":[["hasAny",["artist","black","god"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for The Black God":"The artist of The Black God is SpaceGhostPurrp."}}},
{"id":"n-1abf785a","guard":[["hasAny",["artist","dre","still","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Still D.R.E.":"The artist of Still D.R.E. is Dr Dre ft. Snoop Dogg."}}},
{"id":"n-1e3ed99f","guard":[["hasAny",["artist","know","ledge","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Know The Ledge":"The artist of Know The Ledge is Eric B & Rakim."}}},
{"id":"n-1e74484e","guard":[["has","mtaktak"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Mtaktak":"The artist of Mtaktak is Shabjdeed & Al Nather."}}},
{"id":"n-1f544462","guard":[["has","warning"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Warning":"The artist of Warning is The Notorious B.I.G.."}}},
{"id":"n-21ee59b0","guard":[["hasAny",["artist","digger","gold"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Gold Digger":"The artist of Gold Digger is Kanye West ft. Jamie Foxx."}}},
{"id":"n-2b16f9ff","guard":[["hasAny",["artist","mask","off"]],["has","artist"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Mask Off":"The artist of Mask Off is Future."}}},
{"id":"n-2bf858d2","guard":[["hasAny",["artist","changed","done","things"]],["has","artist"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Things Done Changed":"The artist of Things Done Changed is The Notorious B.I.G.."}}},
{"id":"n-2d4ca514","guard":[["hasAny",["artist","cant","nothing"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Can’t Tell Me Nothing":"The artist of Can’t Tell Me Nothing is Kanye West."}}},
{"id":"n-33eeed13","guard":[["hasAny",["artist","full","paid"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Paid In Full":"The artist of Paid In Full is Eric B & Rakim."}}},
{"id":"n-3e4fdaa1","guard":[["hasAny",["artist","still","tippin"]],["has","artist"],["has","tippin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Still Tippin’":"The artist of Still Tippin’ is Mike Jones."}}},
{"id":"n-3f2b9b17","guard":[["has","kyoto"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Kyoto":"The artist of Kyoto is Yung Lean."}}},
{"id":"n-3f39c5ed","guard":[["has","bling"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Bling Bling":"The artist of Bling Bling is B.G.."}}},
{"id":"n-3ffbf01a","guard":[["has","runaway"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Runaway":"The artist of Runaway is Kanye West ft. Pusha T."}}},
{"id":"n-413c7b1c","guard":[["hasAny",["artist","edge","panic","terminator","x"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Terminator X To The Edge of Panic":"The artist of Terminator X To The Edge of Panic is Public Enemy."}}},
{"id":"n-41cc84fa","guard":[["hasAny",["cheap","intro"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for We Got It For Cheap (Intro)":"The artist of We Got It For Cheap (Intro) is Clipse."}}},
{"id":"n-470de48f","guard":[["hasAny",["artist","old","remix","road","town"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Old Town Road (Remix)":"The artist of Old Town Road (Remix) is Lil Nas X ft. Billy Ray Cyrus."}}},
{"id":"n-48415baf","guard":[["hasAny",["all","artist","down","falls"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for All Falls Down":"The artist of All Falls Down is Kanye West ft. Syleena Johnson."}}},
{"id":"n-4853d4f5","guard":[["hasAny",["artist","basic","before","bible","earth","instructions","leaving"]],["has","artist"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of B.I.B.L.E. (Basic Instructions Before Leaving Earth)":"The artist of B.I.B.L.E. (Basic Instructions Before Leaving Earth) is Killah Priest."}}},
{"id":"n-4a907c06","guard":[["hasAny",["artist","goes","rhyme"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of As The Rhyme Goes On":"The artist of As The Rhyme Goes On is Eric B & Rakim."}}},
{"id":"n-4ba6f6f6","guard":[["has","yourz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Love Yourz":"The artist of Love Yourz is J Cole."}}},
{"id":"n-4ee621eb","guard":[["hasAny",["artist","c","exhibit"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Exhibit C":"The artist of Exhibit C is Jay Electronica."}}},
{"id":"n-5131ade7","guard":[["hasAny",["americas","artist","blunted","most"]],["has","artist"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of America’s Most Blunted":"The artist of America’s Most Blunted is Madvillain."}}},
{"id":"n-54d79154","guard":[["hasAny",["artist","diggity","no"]],["has","artist"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of No Diggity":"The artist of No Diggity is Blackstreet ft. Dr Dre and Queen Pen."}}},
{"id":"n-5802fe3d","guard":[["hasAny",["aiiight","artist","chill"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Aiiight Chill":"The artist of Aiiight Chill is Gang Starr."}}},
{"id":"n-58b2aa9d","guard":[["hasAny",["artist","follow","leader"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Follow The Leader":"The artist of Follow The Leader is Eric B & Rakim."}}},
{"id":"n-59072631","guard":[["hasAny",["artist","church","no","title","wild"]],["has","artist"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title No Church in the Wild":"The artist of No Church in the Wild is JAY-Z & Kanye West."}}},
{"id":"n-5926fde1","guard":[["has","moment"],["has","artist"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Just A Moment":"The artist of Just A Moment is Nas ft. Quan."}}},
{"id":"n-5adbf27f","guard":[["hasAny",["anthem","artist","international","players"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for International Players Anthem":"The artist of International Players Anthem is UGK ft. OutKast."}}},
{"id":"n-5b68c555","guard":[["has","work"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Work It":"The artist of Work It is Missy Elliott."}}},
{"id":"n-5d591629","guard":[["hasAny",["police","tha"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Fuck Tha Police":"The artist of Fuck Tha Police is NWA."}}},
{"id":"n-66927032","guard":[["has","regrets"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Regrets":"The artist of Regrets is JAY-Z."}}},
{"id":"n-675c5f97","guard":[["hasAny",["artist","codeine","crazy"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Codeine Crazy":"The artist of Codeine Crazy is Future."}}},
{"id":"n-6dc4afce","guard":[["hasAny",["applebum","artist","bonita"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Bonita Applebum":"The artist of Bonita Applebum is A Tribe Called Quest."}}},
{"id":"n-7072ee2d","guard":[["hasAny",["artist","da","di","la","title"]],["has","artist"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title La Di Da Di":"The artist of La Di Da Di is Doug E Fresh & The Get Fresh Crew."}}},
{"id":"n-7f6b0345","guard":[["hasAny",["all","artist","caps","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title All Caps":"The artist of All Caps is Madvillain."}}},
{"id":"n-7fa3c498","guard":[["hasAny",["artist","neck","protect","title","ya"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Protect Ya Neck":"The artist of Protect Ya Neck is Wu-Tang Clan."}}},
{"id":"n-8140ab7d","guard":[["hasAny",["ambitionz","artist","az","ridah"]],["has","artist"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Ambitionz Az A Ridah":"The artist of Ambitionz Az A Ridah is 2Pac."}}},
{"id":"n-819e8372","guard":[["has","respiration"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Respiration":"The artist of Respiration is Black Star ft. Common."}}},
{"id":"n-849d90b5","guard":[["hasAny",["artist","bridge","over","title"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title The Bridge Is Over":"The artist of The Bridge Is Over is BDP."}}},
{"id":"n-851b8cf3","guard":[["hasAny",["artist","hip","hop","life","love","ode","title"]],["has","artist"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Love Of My Life (An Ode To Hip Hop)":"The artist of Love Of My Life (An Ode To Hip Hop) is Erykah Badu ft. Common."}}},
{"id":"n-85c80178","guard":[["hasAny",["artist","day","one","title"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title One Day":"The artist of One Day is UGK."}}},
{"id":"n-86d7fd6b","guard":[["has","triumph"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Triumph":"The artist of Triumph is Wu-Tang Clan."}}},
{"id":"n-86e67ef5","guard":[["hasAny",["artist","dope","sim"]],["has","artist"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Sim Dope":"The artist of Sim Dope is AKA."}}},
{"id":"n-8f27f19f","guard":[["hasAny",["artist","bodak","yellow"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Bodak Yellow":"The artist of Bodak Yellow is Cardi B."}}},
{"id":"n-9222f740","guard":[["hasAny",["artist","imagine","ruled","world"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of If I Ruled The World (Imagine That)":"The artist of If I Ruled The World (Imagine That) is Nas ft. Lauryn Hill."}}},
{"id":"n-926b633b","guard":[["has","about"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of What About Me":"The artist of What About Me is Lil Boosie."}}},
{"id":"n-947a983e","guard":[["has","mic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of One Mic":"The artist of One Mic is Nas."}}},
{"id":"n-99735730","guard":[["hasAny",["artist","world","yours"]],["has","what"],["has","yours"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of The World Is Yours":"The artist of The World Is Yours is Nas."}}},
{"id":"n-9e799f0a","guard":[["hasAny",["artist","bring","da","ruckus","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Bring Da Ruckus":"The artist of Bring Da Ruckus is Wu-Tang Clan."}}},
{"id":"n-a1d6eef2","guard":[["hasAny",["artist","madness","march"]],["has","artist"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for March Madness":"The artist of March Madness is Future."}}},
{"id":"n-a32b34f2","guard":[["has","grief"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Grief":"The artist of Grief is Earl Sweatshirt."}}},
{"id":"n-a58c639a","guard":[["hasAny",["artist","da","faida","fight","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Fight Da Faida":"The artist of Fight Da Faida is Frankie HI-NRG MC."}}},
{"id":"n-ab2c36ee","guard":[["has","pride"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for PRIDE":"The artist of PRIDE is Kendrick Lamar."}}},
{"id":"n-aba49e0c","guard":[["hasAny",["artist","dangan","no","shinjitsu"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Shinjitsu No Dangan":"The artist of Shinjitsu No Dangan is King Giddra."}}},
{"id":"n-ae509436","guard":[["hasAny",["anthem","artist","dipset","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Dipset Anthem":"The artist of Dipset Anthem is Diplomats ft. Juelz Santana & Cam’ron."}}},
{"id":"n-aea3e00f","guard":[["has","umoya"],["has","artist"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Umoya":"The artist of Umoya is Skwatta Kamp."}}},
{"id":"n-afc7d02a","guard":[["has","bob"],["has","tell"],["has","artist"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title B.O.B.":"The artist of B.O.B. is OutKast."}}},
{"id":"n-b6ec1448","guard":[["has","overseas"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for OVERSEAS":"The artist of OVERSEAS is Bohan Phoenix."}}},
{"id":"n-bac82f0a","guard":[["hasAny",["artist","nature","threat"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Nature of the Threat":"The artist of Nature of the Threat is Ras Kass."}}},
{"id":"n-bbb98e64","guard":[["hasAny",["artist","luv","title","u"]],["has","artist"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title I Luv U":"The artist of I Luv U is Dizzee Rascal."}}},
{"id":"n-c2773ac1","guard":[["hasAny",["artist","bside","day","good","remix","title","version"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title It Was A Good Day (B-Side Remix version)":"The artist of It Was A Good Day (B-Side Remix version) is Ice Cube."}}},
{"id":"n-c4c54d1d","guard":[["hasAny",["artist","lost","ones"]],["has","lost"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Lost Ones":"The artist of Lost Ones is Lauryn Hill."}}},
{"id":"n-c75a731f","guard":[["hasAny",["artist","concrete","schoolyard","title"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Concrete Schoolyard":"The artist of Concrete Schoolyard is Jurassic 5."}}},
{"id":"n-d6f17e86","guard":[["hasAny",["above","artist","clouds"]],["has","artist"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Above The Clouds":"The artist of Above The Clouds is Gang Starr ft. Inspectah Deck."}}},
{"id":"n-dc1af7ca","guard":[["has","title"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Da Art Of Storytellin’":"The artist of Da Art Of Storytellin’ is OutKast."}}},
{"id":"n-dc2c5d42","guard":[["has","spottieottiedopaliscious"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of SpottieOttieDopaliscious":"The artist of SpottieOttieDopaliscious is Outkast."}}},
{"id":"n-dc602d84","guard":[["has","alright"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Alright":"The artist of Alright is Kendrick Lamar."}}},
{"id":"n-e18eed28","guard":[["has","elevators"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the artist of the title Elevators (Me & You)":"The artist of Elevators (Me & You) is OutKast."}}},
{"id":"n-e2ef8c41","guard":[["hasAny",["artist","kane","up","warm"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Warm It Up Kane":"The artist of Warm It Up Kane is Big Daddy Kane."}}},
{"id":"n-e7992692","guard":[["has","lifes"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Life’s A Bitch":"The artist of Life’s A Bitch is Nas ft. A.Z.."}}},
{"id":"n-e8526b36","guard":[["has","put"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Put It On":"The artist of Put It On is Big L."}}},
{"id":"n-e8dce9d9","guard":[["has","queen"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Queen Bitch":"The artist of Queen Bitch is Lil’ Kim."}}},
{"id":"n-e8e2bcc2","guard":[["has","changes"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Changes":"The artist of Changes is 2Pac ft. Talent."}}},
{"id":"n-ea14fce4","guard":[["has","boyznthehood"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Boyz-n-the-Hood":"The artist of Boyz-n-the-Hood is Eazy-E."}}},
{"id":"n-eb918242","guard":[["hasAny",["artist","down","remix","wipe"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Wipe Me Down (Remix)":"The artist of Wipe Me Down (Remix) is Foxx & Lil Boosie & Webbie."}}},
{"id":"n-f0b317fb","guard":[["hasAny",["artist","over","reminisce","troy"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of They Reminisce Over You (T.R.O.Y.)":"The artist of They Reminisce Over You (T.R.O.Y.) is Pete Rock & C.L. Smooth."}}},
{"id":"n-f19ebddf","guard":[["has","hypnotize"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Hypnotize":"The artist of Hypnotize is The Notorious B.I.G.."}}},
{"id":"n-f82f98d7","guard":[["has","renegade"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the artist of Renegade":"The artist of Renegade is JAY-Z ft. Eminem."}}},
{"id":"n-f8803be4","guard":[["hasAny",["artist","door","front","looking"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Looking At The Front Door":"The artist of Looking At The Front Door is Main Source."}}},
{"id":"n-fef8056a","guard":[["has","flava"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the artist for Flava":"The artist of Flava is Rich Gang."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the artist of One Mic","expect":{"contains":["Nas"],"notRefusal":true}},{"q":"what is the artist of Follow The Leader","expect":{"contains":["Eric B & Rakim"],"notRefusal":true}},{"q":"tell me the artist of the title Love Of My Life (An Ode To Hip Hop)","expect":{"contains":["Erykah Badu ft. Common"],"notRefusal":true}},{"q":"tell me the artist of the title Just A Moment","expect":{"contains":["Nas ft. Quan"],"notRefusal":true}},{"q":"give the artist for Wipe Me Down (Remix)","expect":{"contains":["Foxx & Lil Boosie & Webbie"],"notRefusal":true}},{"q":"tell me the artist of the title Fuck Tha Police","expect":{"contains":["NWA"],"notRefusal":true}},{"q":"tell me the artist of the title The Bridge Is Over","expect":{"contains":["BDP"],"notRefusal":true}},{"q":"what is the artist of Put It On","expect":{"contains":["Big L"],"notRefusal":true}},{"q":"what is the artist of What About Me","expect":{"contains":["Lil Boosie"],"notRefusal":true}},{"q":"what is the artist of As The Rhyme Goes On","expect":{"contains":["Eric B & Rakim"],"notRefusal":true}},{"q":"what is the artist of Respiration","expect":{"contains":["Black Star ft. Common"],"notRefusal":true}},{"q":"give the artist for Kyoto","expect":{"contains":["Yung Lean"],"notRefusal":true}},{"q":"tell me the artist of the title I Luv U","expect":{"contains":["Dizzee Rascal"],"notRefusal":true}},{"q":"what is the artist of Ambitionz Az A Ridah","expect":{"contains":["2Pac"],"notRefusal":true}},{"q":"give the artist for Love Yourz","expect":{"contains":["J Cole"],"notRefusal":true}},{"q":"what is the artist of No Diggity","expect":{"contains":["Blackstreet ft. Dr Dre and Queen Pen"],"notRefusal":true}},{"q":"what is the artist of Regrets","expect":{"contains":["JAY-Z"],"notRefusal":true}},{"q":"what is the artist of Things Done Changed","expect":{"contains":["The Notorious B.I.G."],"notRefusal":true}},{"q":"tell me the artist of the title It’s Your World (Part 1 & 2)","expect":{"contains":["Common"],"notRefusal":true}},{"q":"give the artist for Sim Dope","expect":{"contains":["AKA"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
