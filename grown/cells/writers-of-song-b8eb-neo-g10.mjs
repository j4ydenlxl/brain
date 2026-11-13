// writers-of-song-b8eb-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"writers-of-song-b8eb-neo-g10","class":"writers-of-song-b8eb","generation":10,"lane":"neo","grownFrom":["what is the writers of Thought About You","what is the writers of I Hold On","what is the writers of Somewhere In My Car","give the writers for Turnin' Me On","give the writers for I Met A Girl","tell me the writers of the song Caught Up in the Country","give the writers for Girl","what is the writers of Say You Do","what is the writers of Hell of a Night","tell me the writers of the song God Made Girls","give the writers for Mean To Me","tell me the writers of the song Criminal","tell me the writers of the song If I Told You","what is the writers of H.O.L.Y.","give the writers for Simple","give the writers for Babe","what is the writers of Night's On Fire","what is the writers of Shotgun Rider","what is the writers of Buy My Own Dranks","what is the writers of Make Me Wanna"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-country-lyrics-92d7ec","columns":["song","artist","writers"],"n":484,"cols":[{"s":"Young Love|Beat of the Music|Goodnight Kiss|19 You + Me|Helluva Life|Chillin' It|Compass|Drink A Beer|I Hold On|Lettin The Night Roll|Mona Lisa|Invisible|This is How We Roll|Keep Them Kisses Comin'|Lookin For That Girl|Automatic|Cop Car|Get Me Some of That|Bottoms Up|Give Me Back My Hometown|Drink To That All Night|See You Tonight|Doin' What She Likes|When She Says Baby|We Are Tonight|Beachin'|Whiskey In My Water|Yeah|Who I Am With You|Chainsaw|Song About A Girl|Dust|I Don't Dance|I Got A Car|Where It's At|Ready Set Roll|Meanwhile Back At Mama's|Look At You|All Alright|Close Your Eyes|American Kids|Leave The Night On|Payback|Day Drinking|Kiss You Tonight|Girl In A Country Song|Take It On Back|People Loving People|Rum|Homegrown Honey|Something in the Water|God Made Girls|Baby Be My Love Song|Smoke|Love Me Like You Mean It|Lay Low|Love You Like That|Crushin It|Kiss You in the Morning|Like A Wrecking Ball|Little Toy Guns|Buy Me A Boat|John Cougar John Deere John 3:16|Break Up With Him|I Love This Life|Die A Happy Man|Backroad Song|Nobody To Blame|Fix|Head Over Boots|My Church|Record Year|I Met A Girl|Livin' The Dream|Sleep Without You|Parachute|Road Less Traveled|Make You Mine|Kill A Word|Lipstick|Hurricane|My Girl|Drinkin' Problem|The Way I Talk|Every Little Thing|What Ifs|Greatest Love Story|Yours|Singles You Up|Still the Same|Kiss Somebody|Best Shot|There Was This Girl|Lose My Mind|Vacation|Outta Style|How Not To|Every Time I Heart That Song|Talk You Out Of It|Yours If You Want It|Neon Light|Save It For A Rainy Day|A Guy With A Girl|I Don't Know About You|One Big Country Song|A Girl Like You|Hide the Wine|T-Shirt|Do I Make You Wanna|A Little Dive Bar in Dahlonega|Little Red Wagon|Think A Little Less|Diamond Rings and Old Bar Stools|Whiskey Glasses|Neon Church|Homemade|The Difference|Lovin' Lately|It Don't Hurt Like It Used To|Heaven|Turnin' Me On|Meant to Be|Burning Man|Today|Country Nation|River Bank|Bucked Off|Without A Fight|Perfect Storm|Last Time for Everything|Song For Another Time|Snapback|We Back|Thought About You|Drowns the Whiskey|Born to Love You|Drunk Americans|The Weekend|Small Town Throwdown|Ones That Like Me|Stone Cold Sober|One Hell of an Amen|What Happens in a Small Town|Cold Beer With Your Name On It|Lonely Tonight|Gonna Know We Were Here|Her World or Mine|The Long Way|Drunk On Your Love|Love Someone|Wanna Be That Song|Mean To Me|Somethin' I'm Good At|The Heart of Dixie|On My Way To You|Here Tonight|Like I Loved You|Catch|In Case You Didn't Know|Mercy|Lights Come On|All Day Long|Burning House|Hole In A Bottle|I Hope You're Happy Now|Love Wins|Smoke Break|Southbound|Cry Pretty|Heartbeat|Summer Fever|Raised on Country|Little Bit of You|Eyes On You|Somethin Bad|Just Gettin' Started|Fix A Drink|Holdin' Her|How I'll Always Be|Drunk Girl|Good Vibes|Feels Like A Party|Hold On|Broken Halos|Either Way|Sober Saturday Night|Losing Sleep|Hangin' On|She Ain't In It|You Should Be Here|Hope You Get Lonely Tonight|Flatliner|Ain't Worth The Whiskey|Love You Too Late|Let Me See Ya Girl|Middle Of A Memory|Caught Up in the Country|I Got The Boy|Think Of You|I'm Comin Over|Outskirts of Heaven|Chasin' You|Play It Again|Bring It On Over|Kick the Dust Up|\"21\"|Tonight Looks Good On You|Tequila|From The Ground Up|Nothin Like You|Show You Off|Speechless|All To Myself|10,000 Hours|For The First Time|Craving You|Heart Break|Bartender|Freestyle|Most People Are Good|Hell Right|Everything's Gonna Be Alright|Came Here To Forget|Any Ol' Barstool|All On Me|God's Country|Black|Drunk On A Plane|Woman Amen|Living|Makin' Me Look Good Again|Ridin' Roads|Good Girl|Mr. Misunderstood|We Were|Monsters|Some of It|Round Here Buzz|Cold One|Talladega|Desperate Man|She Don't Love You|Every Girl in This Town|Anything Goes|In Between|Feelin' It|I Hope|Dive Bar|Every Little Honky Tonk Bar|Happens Like That|Rednecker|Up Down|Take Back Home Girl|Closer To You|You Look Good|Long Stretch of Love|Tattoo|More Hearts Than Mine|Sangria|Bar at the End of the World|Different For Girls|Sunshine and Whiskey|Girl Like You|Riot|Unlove You|It All Started With A Beer|A Little More Summertime|Make A Little|Burn Out|Crash and Burn|Ring on Every Finger|One That Got Away|I Like The Sound of That|Make Me Want To|The Bones|Home Alone Tonight|Stay|Gentle On My Mind|Stay A Little Longer|21 Summer|It Ain't My Fault|Shoot Me Straight|Run Away With You|California|Lonely Eyes|Break Up In The End|Knockin' Boots|Gonna Wanna Tonight|Three Chords and the Truth|Heartache Medication|Heartache on the Dance Floor|Night's On Fire|A Guy Walks Into A Bar|Take It From Me|Slow Dance in a Parking Lot|If The Boot Fits|Drinking Class|God, Your Mama, And Me|Never Comin Down|Top of the World|Wake Up Lovin You|The Ones That Didn't Make It Back Home|After A Few|We Went|Homesick|Lose It|Good As You|Everything I Shouldn't Be Thinking About|Wasted Time|Coming Home|Somewhere In My Car|The Fighter|Rearview Town|Somebody Else Will|For Her|Miss Me More|Peter Pan|Yeah Boy|Legends|Dibs|Homecoming Queen|I Hate Love Songs|Tip of My Tongue|Noise|Wild Child|Baby, Let's Lay Down And Dance|Millionaire|Live Forever|Last Shot|I'm To Blame|More Girls Like You|Running For You|Trailer Hitch|They Don't Know|Real Men Love Jesus|Doin' Fine|Rumor|That Don't Sound Like You|Criminal|Hooked|Humble And Kind|Girl Crush|Games|I See You|Light It Up|Huntin', Fishin' and Lovin' Every Day|What She Wants Tonight|Strip It Down|Move|Fast|Beer Never Broke My Heart|When It Rains It Pours|She Got The Best of Me|One Number Away|Even Though I'm Leaving|Beautiful Crazy|Gonna|Hometown Girl|Girl|Rich|I Could Use A Love Song|Dear Hate|80s Mercedes|Missing|Mr. Lonely|Slow Me Down|Shotgun Rider|I'll Name The Dogs|Stay Downtown|Prayed For You|Already Callin' You Mine|No Such Thing As A Broken Heart|One Man Band|Written in the Sand|Hotel Key|Make It Sweet|Roller Coaster|(This Ain't No) Drunk Dial|Somewhere On A Beach|We Should Be Friends|It All Comes Out in the Wash|Tin Man|Vice|Ask Me How I Know|Drunk Me|Day Drunk|Better In Boots|Buy My Own Dranks|Boy|All The Pretty Girls|Home Sweet Home|Get To You|Trouble|Love Triangle|Like A Cowboy|I Lived It|Young and Crazy|Mind Reader|Going Out Like That|Small Town Boy|Kinda Don't Care|Dirt On My Boots|I Wish Grandpas Never Died|Hard To Be Cool|Callin' Me When I'm Lonely|Dirt|Burnin' It Down|Til It's Gone|May We All|Down to the Honkytonk|Sippin' On Fire|You Look Like I Need A Drink|Confession|Don't It|Love Ain't|American Country Love Song|I Know Somebody|Break On Me|Setting The World On Fire|If I Told You|Every Little Thing|Blue Tacoma|Later On|To A T|What If I Never Get Over You|Make You Miss Me|Take Your Time|House Party|Kinfolks|Break Up In A Small Town|Body Like A Back Road|Downtown's Dead|This Is It|Five More Minutes|She's With Me|Real Life|Say You Do|Get Along|A Little More Love|Female|Back To Life|Speak To A Girl|The Rest of Our Life|Blue Ain't Your Color|Shut Up and Fish|Fly|Better Man|Babe|Somebody's Daughter|Remember You Young|Make Me Wanna|Unforgettable|Life Changes|Star of the Show|Look What God Gave Her|Sixteen|Marry Me|Night Shift|Raise Em Up|I Was Jack (You Were Diane)|My Eyes|Better Boat|Riser|What We Ain't Got|There's A Girl|Rock On|Seein' Red|Sun Daze|Simple|You Make It Easy|Smooth|You Broke Up With Me|She's Got A Way With Words|Beautiful Drug|Loving You Easy|My Old Man|Homegrown|Castaway|Someone I Used To Know|Hell of a Night|Dirty Laundry|Church Bells|Sunrise, Sunburn, Sunset|H.O.L.Y.","sep":"|"},{"d":"Kip Moore|Brett Eldredge|Randy Houser|Dan + Shay|Frankie Ballard|Cole Swindell|Lady Antebellum|Luke Bryan|Dierks Bentley|Justin Moore|Brad Paisley|Hunter Hayes|Florida Georgia Line|Craig Campbell|Tim McGraw|Miranda Lambert|Keith Urban|Thomas Rhett|Brantley Gilbert|Eric Church|Jerrod Niemann|Scotty McCreery|Blake Shelton|Jason Aldean|Billy Currington|Jake Owen|Tyler Farr|Joe Nichols|Chris Young|The Band Perry|Eric Paslay|Eli Young Band|Lee Brice|George Strait|Dustin Lynch|Chase Rice|Big & Rich|Zac Brown Band|Parmalee|Kenny Chesney|Sam Hunt|Rascal Flatts|Little Big Town|David Nail|Maddie & Tae|Chase Bryant|Garth Brooks|Brothers Osborne|Darius Rucker|Carrie Underwood|RaeLynn|Easton Corbin|A Thousand Horses|Kelsea Ballerini|Josh Turner|Canaan Smith|Michael Ray|Chris Janson|Old Dominion|LoCash|Granger Smith|Chris Stapleton|Chris Lane|Jon Pardi|Maren Morris|William Michael Morgan|Drake White|Brett Young|Lauren Alaina|High Valley|Runaway June|Luke Combs|Dylan Scott|Midland|Morgan Wallen|Carly Pearce|Kane Brown|LANCO|Russell Dickerson|Jordan Davis|Sugarland|Morgan Evans|Jimmie Allen|Riley Green|Aaron Watson|LOCASH|Ashley McBryde|Tyler Rich|Bebe Rexha|Toby Keith|Josh Thompson|Danielle Bradbery|Cody Johnson|Cam|Hootie & the Blowfish|Rodney Atkins|Jana Kramer|David Lee Murphy|Devin Dawson|Trisha Yearwood|Gabby Barrett|HARDY|Ingrid Andress|Jennifer Nettles|Craig Morgan|Travis Denning|Thompson Square|Kristian Bush|Lindsay Ell|Sara Evans|Matt Stell|Mitchell Tenpenny|Gloriana|Reba McIntire|Sheryl Crow|The Swon Brothers|Ryan Hurd|Tenille Townes|Trent Harmon|Tucker Beathard|Walker Hayes","i":"0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,e,10,11,12,13,14,15,16,17,18,19,1a,1b,1c,1d,1e,1f,1g,1h,1i,1j,a,1k,j,1d,1l,g,1m,1n,h,1o,1p,1q,1r,1s,j,1t,1u,1v,1p,1w,1x,j,1y,1z,20,21,22,23,24,25,26,27,28,29,2a,2b,1,h,2c,3,m,c,15,m,13,m,1q,2d,1f,23,h,o,2e,f,1k,e,22,e,p,2f,10,o,24,m,2g,8,a,a,a,a,a,a,a,1m,1m,n,e,n,25,2h,i,i,i,i,i,i,2i,m,n,1k,1,1,1,1,1,1,2j,2k,1v,1v,1v,1v,1v,n,1a,2l,1j,w,1d,1d,1d,1d,1d,16,s,19,z,f,n,1l,1l,e,1l,1l,2d,2m,1p,1p,s,s,s,1r,5,5,5,5,5,5,5,2n,2o,s,s,d,22,7,o,7,b,n,3,3,3,3,3,3,3,1c,h,6,6,6,7,m,2p,m,n,2q,m,8,8,8,8,1u,y,y,j,g,j,j,j,j,j,j,u,2r,c,l,l,2s,1a,x,1o,2t,22,1q,23,6,6,b,2u,m,13,8,4,n,15,2v,4,n,21,21,h,1n,1k,15,2a,1s,7,c,t,1b,1b,1b,1b,10,10,s,5,7,z,z,1r,1r,17,q,27,27,1o,w,c,g,e,2w,9,2x,2,24,24,24,2y,g,g,g,g,n,9,1q,1h,1h,1h,1h,1h,1h,1h,13,13,13,1a,1p,t,0,0,0,0,2z,n,1k,1w,w,w,30,20,e,16,7,7,7,7,7,7,7,7,1z,1z,1z,1z,1z,1z,m,1i,1s,1s,1s,1s,1s,1t,21,31,e,m,5,32,12,1m,1m,1m,1m,1m,7,1g,8,f,f,f,f,1a,33,29,q,1y,w,13,9,1k,34,1e,2,m,4,y,35,y,9,1r,2b,r,36,c,n,13,c,p,c,9,c,o,v,p,1n,g,13,1c,26,26,37,38,6,14,14,14,14,14,14,14,l,l,1x,p,8,13,k,g,15,e,e,g,18,18,16,28,39,h,h,h,h,h,h,h,h,1r,g,p,m,13,8,p,3a,3b,y,c,c,n,c,3c,m,11,11,11,11,11,11,y,1d,1d,7,c","sep":"|"},{"f":"0Kip Moore, Dan Couch, Westin Davis|0Brett Eldredge, Ross Copperman, Heather Morgan|0Rob Hatch, Jason Sellers, Randy Houser|0Dan Smyers, Shay Mooney, Danny Orton|0Rodney Clawson, Chris Tompkins, Josh Kear|0Cole Swindell, Shane Minor|0Mikkel Eriksen, Tor Erik Hemransen, Ammar Malik, Ross Golan, Daniel Omelio, Emile Haynie|0Jim Beavers Chris Stapleton|0Brett James, Dierks Bentley|0Justin Moore, Jeremy Stover. Rodney Clawson|0Brad Paisley, Chris Dubois|0Hunter Hayes, Bonnie Baker, Haille Walker, Katrina Elam|0Tyler Hubbard, Brian Kelley, Cole Swindell, Luke Bryan|0Dallas Davidson, Ben Hayslip|0Mark Irwin, James T. Slater, Chris Tompkins|0Natalie Hemby, Nicolle Galyon, Miranda Lambert|0Matthew Jenkins, Miller Crowell, Matt Jenkins, Sam Hunt|0Rhett Akins, Michael Carter, Cole Swindell|0Brantley Gilbert, Justin Weaver, Brett James|0Eric Church, Luke Laird|0Derek George, Lance Miller, Brad Warren, Brett Warren|0Ashley Gorley, Zach Crowell, Scotty Mccreery, Miller Crowell|0Philip O'donnell, Wade Kirby|0Ben Hayslip, Rhett Akins|0Marc Beeson, Sam Hunt, Josh Osborne|0Jaren Johnston, Jon Nite, Jimmy Robbins|0Tyler Farr, Phillip LaRue, Jon Ozier|0Ashley Gorley, Bryan Simpson|0Marv Green, Paul Jenkins, Jason Sellers|0Shane McAnally, Josh Osborne, Matthew Ramsey|0Eric Paslay, Jessi Alexander, Gordie Sampson|0Jon Jones, James Young, Kyle Jacobs, Josh Osborne|0Lee Brice, Rob Hatch, Dallas Davidson|0Tom Douglas, Keith Gattis|0Cary Barlowe, Zach Crowell, Matt Jenkins|1hris DeStefano, Rhett Akins, Chase Rice|0Tom Douglas, Jaren Johnston, Jeffrey Steele|0John Rich, Shannon Lawson|0Zac Brown, Eric Church, Jimmy De Martini, Wyatt Durrette, John Driskell Hopkins|0Adam Craig, Trent Tomlinson, Shane Minor|0Rodney Clawson, Luke Laird, Shane McAnally|0Sam Hunt, Josh Osborne, Shane McAnally|0Aaron Eshuis, Neil Mason, Ryan Hurd|0Karen Fairchild, Jimi Westbrook, Phillip Sweet, Troy Verges, Barry Dean|0David Cook, Jay Knowles, Trent Summar|0Taylor Dye, Maddie Marlow, Aaron Scherz|0Dylan Altman, Chase Bryant, Tommy Lee James|0busbee, Lee Thomas Miller, Chris Wallin|0John Osborne, T. J. Osborne, Barry Dean|0Darius Rucker, Charles Kelley, Nathan Chapman|0Chris DeStefano, Brett James, Carrie Underwood|0RaeLynn, Nicolle Galyon, Lori McKenna, Liz Rose|0Jim Collins, Brett James|0Michael Hobby, Ross Copperman, Jon Nite|0Kelsea Ballerini, Josh Kerr, Forest Glen Whitehead, Lance Carpenter|0Tony Martin, Mark Nesler, Ross Copperman|0Canaan Smith, Brett Beavers, Jim Beavers|0Brad Paisley, Kelley Lovelace, Lee Thomas Miller|0Justin Wilson, Michael White|0Eric Church, Casey Beathard|0Carrie Underwood, Chris DeStefano, Hillary Lindsey|1hris DuBois, Chris Janson|0Shane McAnally, Ross Copperman, Josh Osborne|0Matthew Ramsey, Trevor Rosen, Whit Sellers, Geoff Sprung, Brad Tursi|0Danny Myrick, Chris Janson, Chris Lucas, Preston Brust|0Thomas Rhett, Sean Douglas, Joe Spargur|0Granger Smith, Frank Rogers|0Chris Stapleton, Barry Bales, Ronnie Bowman|0Sarah Buxton, Jesse Frasure, Abe Stoklasa|0Jon Pardi, Luke Laird|0busbee, Maren Morris|0Eric Church, Jeff Hyde|0Sam Hunt, Trevor Rosen, Shane McAnally|0Tom Douglas, Jaren Johnston, Luke Laird|0Brett Young, Justin Ebach, Kelly Archer|0Chris Stapleton, Jim Beavers|0Lauren Alaina, Jesse Frasure, Meghan Trainor|0Steh Mosley, Brad Rempel, Ben Stennis|0Eric Church, Luke Dick, Jeff Hyde|0Rebecca Lynn Howard, Caroline Hobby, Elisha Hoffman, Naomi Cooke, Hannah Mulholland, Jennifer Wayne|0Luke Combs, Thomas Archer, Taylor Phillips|0Dylan Scott, Josh Kerr|0Mark Wystrach, Cameron Duddy, Jess Carson, Shane McAnally, Josh Osborne|0Jessi Alexander, Ben Hayslip, Chase McGill|0Carly Pearce, busbee, Emily Shackelton|0Kane Brown, Matt McGinn, Jordan Schmidt|0Brandon Lancaster|0Russell Dickerson, Parker Welling, Casey Brown|0Jordan Davis, Steven Dale Jones, Justin Ebach|1ennifer Nettles, Kristian Bush|0Morgan Evans, Chris DeStefano, Josh Osborne|0Jimmie Allen, Josh London, J.P. Williams|0Riley Green, Erik Dylan|0|0|0Aaron Watson|1dam Hambrick, Paul DiGiovanni, Kevin Bard|1imee Mayo, Chris Lindsey, Brad Warren, Brett Warren|1lysa Vanderheym, Hunter Phelps, Jameson Rodgers, Michael Hardy|1ndrew Dorff, Jonathan Singleton|eMark Irwin, Josh Kear|gtthew Ramsey, Brad Tursi|1shley Gorley, Bryan Simpson|fHardy, Hunter Phelps, Jameson Rodgers|fJesse Frasure, Michael Hardy|uRhett Akins|fLuke Laird, Hillary Lindsey|rShane McAnally|fZach Crowell, Matt Jenkins, Jerry Flowers|7McBryde, Nicolette Hayford, Jesse Rice|1udra Mae, Joe Ginsberg|0Barry Dean, Jon Nite, Thomas Rhett, Jimmy Robbins|cLuke Laird, Jonathan Singleton|1en Burgess, Kevin Kadish|4Goldsmith, Ben Stennis, Ross Ellis Lipsey|gobby Pinson, Drew Parker, Jared Mullins|3hamin Burgess, Jacob Durrett, Devin Dawson, Rhett Akins|1ig Kenny, John Rich, Tim McGraw|2lly Currington, Cary Barlowe, Shy Carter|1lake Anthony Carter, Matt McGinn, Lindsay Rimes|6Shelton, Josh Osborne, Jessi Alexander|2eta Rexha, Tyler Hubbard, Josh Miller, David Garcia|1obby Pinson, Luke Dick|1rad Paisley, Chris DuBois, Ashley Gorley|sKelley Lovelace|eKelley Lovelace|t, Chris DuBois|vLee Thomas Miller|eLee Thomas Miller|eSmith Ahnquist, Brent Anderson, Chris DuBois, Mike Ryan|5Tursi, Matt Jenkins, Matthew Ramsey, Trevor Rosen|ghew Ramsey,Trevor Rosen|5Warren, Brett Warren, Jordan Schmidt, Tyler Hubbard|rLee Thomas Miller|3ndon Kinney, Jeff Middleton, Josh Thompson|8Lancaster, Ross Copperman, Ashley Gorley, Josh Osborne|5y Clark, Bob DiPiero, Shane McAnally|4tley Gilbert, Andrew DeRoberts|iBen Hayslip, Rhett Akins, Dallas Davidson|jobby Pinson, Blake Chaffin|jrett James, Dan Layus|iMike Dekle, Brian Davis|iRhett Akins, Brock Berryhill, Josh Dunne|2ent Anderson, Clint Daniels|gRyan Hurd|3tt Beavers, Brett James|fJamie Paulin, Travis Denning|6Eldredge, Matt Rogers|gRoss Copperman|u, Heather Morgan|wScooter Carusoe|gScooter Carusoe|gTom Douglas|6James, Caitlyn Smith, Troy Verges|dTony Lane|6Young, Ben Caver, Justin Ebach, Charles Kelley|dJesse Lee|dRoss Copperman, Ashley Gorley|dTrent Tomlinson, Tyler Reeve, Kyle Schlienger|5y Young, Sean McConnell|2ian Kelley, Tyler Hubbard, Jordan Schmidt, Jimmy Robbins, Brad Warren, Brett Warren|2yan Kennedy, Garth Brooks, Mitch Rossell|0Cam, Jeff Bhasker, Tyler Johnson|2naan Smith, Brett Beavers, Dan Couch|2rly Pearce, Luke Combs, Randy Montana, Jonathan Singleton|3rie Underwood, Brett James, David Garcia|iChris DeStefano, Hillary Lindsey|iDavid Garcia, Josh Miller|iHillary Lindsey, Liz Rose, Lori McKenna|iZach Crowell, Ashley Gorley|3y Barlowe, Karen Fairchild, Jesse Frasure, Samuel Roman|5Ryan Barlowe, Christopher Alan Young, Corey Justin Crowder|1hase Bryant, Derek George, Ashley Gorley|2ris DeStefano, Ashley Gorley, Chase Rice|hBrett James, Priscilla Renea|hRhett Akins, Ashley Gorley|6Janson, Chris DuBois, Ashley Gorley|eJames Otto|hie Paulin, Jeremy Stover|eTom Douglas, Scooter Carusoe|eZach Crowell, Ashley Gorley|6Lucas, Corey Crowder, Preston Brust, Tyler Hubbard|6Stapleton, Jim Beavers|hMike Henderson|hTim James, Kendell Marvel|6Young, Brad Warren, Brett Warren|dChris DeStefano, Josh Hoge|dJosh Hoge, Corey Crowder|1lint Daniels, Wynn Varble|1ole Swindell, Ashley Gorley|fBrian Kelley, Tyler Hubbard, Michael Carter|fJaron Boyer, Matt Bronleewe|gosh Martin, Adam Sanders|fMichael Carter, Brandon Kinney|vJody Stevens|fZach Crowell, Ashley Gorley|2nnie Harrington, Jordan Schmidt, Mike Walker|jTim Nichols, Jamie Lynn Spears|2rey Crowder, Chris Young, Josh Hoge|fJosh Hoge, Chris Young|1raig Campbell, Dave Turnbull|6Michael Wiseman, Jamie Moore, Morgan Wallen|0Dallas Davidson, Ashley Gorley|hBen Hayslip, Jesse Frasure, Rhett Akins|hChris DeStefano, Ashley Gorley|hKelley Lovelace, Ashley Gorley, Hunter Hayes|hRhett Akins, Ashley Gorley|2n Smyers, Nicolle Galyon, Jordan Reynolds|cShay Mooney, Chris DeStefano|zefano, Ashley Gorley|pDanny Orton|pJordan Reynolds, Laura Veltz|znolds, Nicolle Galyon|qustin Bieber, Jessie Jo Dillon, Jason Boyd, Jordan Reynolds|2rius Rucker, Derek George, Scooter Carusoe|2ve Barnes, Julian Bunetta|5Haywood, Charles Kelley, Hillary Scott, Jesse Frasure, Nicolle Galyon|zry Scott, Rodney Clawson|zry Scott, Shane McAnally|3id Frasier, Ed Hill, Josh Kear|6Garcia, Brett Tyler, Hardy|6Lee Murphy, Jimmy Yeary, Chris Stevens|1eric Ruttan, Craig Wiseman|eJosh Thompson|2vin Dawson, Jacob Durrett, Austin Smith|fordan Schmidt, Hardy|1ierks Bentley Ross Copperman, Ashley Gorley|e, Chris Tompkins, Josh Kear|gJosh Kear, Ross Copperman|gRoss Copperman, Ashley Gorley, Jon Nite|1rake White, Monty Criswell, Shane Minor|1ustin Lynch, Ashley Gorley, Zach Crowell|eJustin Ebach, Andy Albert|0Eric Church, Casey Beathard|dHarold Ryan Tyndell, Jeff Hyde|dJeff Hyde|m, Clint Daniels, Bobby Pinson|dLuke Dick, Jeff Hyde|iHutton, Jeff Hyde|iLaird|dRay Wylie Hubbard|5Paslay, Jennifer Wayne|3k Dylan, Connie Harrington, Caitlyn Smith|0Felix McTeigue, Chris Tompkins, Craig Wiseman|1rank Rogers, Jessi Alexander, Jonathan Singleton, Scotty McCreery|eMatthew West|0Gabby Barrett, Zachary Kale, Jon Nite|2rth Brooks, Bryan Kennedy, Mitch Rossell|1eorge Strait, Bubba Strait, Dean Dillon|1ranger Smith, Justin Wilson, Andy Albert, Tyler Hubbard|0HARDY, Jordan Schmidt, Andy Albert|1ardy, Brad Clawson, CJ Solar|1illary Lindsey, David Garcia, Josh Miller|hGordie Sampson, Troy Verges|hRyan Hurd, busbee|8Scott, Charles Kelley, Dave Haywood, Josh Kear|1unter Hayes, Troy Verges, Barry Dean|0Ingrid Andress, Sam Ellis, Derrick Southerland|0J. T. Harding, Josh Osborne, Trevor Rosen|2T. Harding, Aimee Mayo, David Lee Murphy|eShane McAnally|1aren Johnston, Luke Laird|3on Boyer, Josh Mirenda, Michael Tyler|dSara Haze|1ennifer Nettles, Brandy Clark|2remy Stover, Jaren Johnston, Neil Mason|3ry Flowers, Tony Martin, Wendell Mobley|2ss Carson, Cameron Duddy, Mark Wystrach, Shane McAnally|zstrach, Shane McAnally, Josh Osborne|4e Frasure, Chris Stapleton|fJosh Kear, Thomas Rhett|kOsborne, Matthew Ramsey, Trevor Rosen|fShay Mooney, Meghan Trainor|1immie Allen, Jennifer Denmark, Paul Sikes|4y Robbins, Laura Veltz, Maren Morris|1ody Stevens, Cole Taylor, Jaida Dreyer, Tommy Cecil|2ey Moi|2hn Hartford|5Osborne, T. J. Osborne, Shane McAnally|gJ. Osborne, Craig Wiseman|sLee Thomas Miller|fJ Osborne, Lee Thomas Miller|5Rich, Michael Ray|bRodney Clawson, Vicky McGehee|4ny Bulford, Jason Matthews, Laura Veltz|2n Nite, Chase McGill, Jessie Jo Dillon|aHillary Lindsey, Gordie Sampson|aJimmy Robbins, Shane McAnally|aRoss Copperman, Chase Rice|4Pardi, Barry Dean, Natalie Hemby|et Butler, Brice Long|3athan Singleton, Deric Ruttan|kMelissa Peirce, Brad Tursi|2rdan Davis, Jacob Davis, Jason Gantt|eLonnie Fowler|7Schmidt, Andy Albert, Mitchell Tenpenny|2sh Kear, David Frasier, Ed Hill|bHillary Lindsey, Gordie Sampson|7rr, James Abrahart, Shy Carter|5Osborne, Jimmy Robbins, Jon Nite|eMatthew Ramsey, Trevor Rosen|1ustin Moore, Paul DiGiovanni, Chase McGill, Jeremy Stover|7Weaver, Kelly Archer, Travis Denning|8ilson, Matt Rogers, John King|0Kane Brown, Brock Berryhill, Matt McGinn, Taylor Phillips|cChase McGill, Will Weatherly|cRobert Brock Berryhill, Shy Carter, Taylor Phillips, William Bradfore Weatherly|1eifer Thompson, Shawna Thompson, David Lee Murphy, Brett James|3th Urban, Greg Wells, James Abrahart|dJ.R. Rotem, Julia Michaels, Nicolle Galyon, Merle Haggard|fT. Harding|dbusbee|2lley Lovelace, Bobby Pinson, Neil Thrasher|4y Archer, Adam Hambrick, Tebey Ottoh|eSarah Buxton, Matt Dragstrem|3sea Ballerini, David Hodges, Brett McLaughlin|iForest Glen Whitehead, Jesse Lee|zhead, Keesy Timmer|iHillary Lindsey, Forest Glen Whitehead|iJosh Kerr, Ryan Griffin, Jason Duke|iNicolle Galyon, Jimmy Robbins|iShane McAnally, Trevor Rosen|2nny Chesney, Ross Copperman, Ed Sheeran|vShane McAnally, Jon Nite|fShane McAnally, Josh Osborne|3t Blazy, Steve Dorff, Victoria Shaw, Kim Williams, Garth Brooks|2vin Welch|1imberly Perry, Reid Perry, Neil Perry, Jenna Andrews, Nadir Khayat, Jakke Erixson, Karl-Ola Kjellholm|2p Moore, Dan Couch, David Lee Murphy|bJustin Weaver, Weston Davis|bSteven Lee Olsen, Josh Miller, David Garcia|bTroy Verges, Blair Daly|1ristian Bush, Brandon Bush, Tim Owens|1urt Allison, Jaron Boyer, Josh Mirenda|0Lance Miller, Adam Sanders, Brad Warren, Brett Warren|2uren Alaina, Emily Shackelton, busbee|1ee Brice, Kyle Jacobs, Ashley Gorley|bRhett Akins, Ashley Gorley|1indsay Ell, Fred Wilhelm, Chris Stevens|8Rimes, Seth Ennis, Morgan Evans|1ori McKenna|c, Hillary Lindsey, Liz Rose|1uke Bryan, Ashley Gorley|p, Luke Laird|cBrad Tursi|cDallas Davidson, Rhett Akins, Ben Hayslip|cHillary Lindsey, Ross Copperman, Jon Nite|cJon Nite, Ross Copperman|cMichael Carter, Jay Clementi|cRodney Clawson, Luke Laird|5Combs, Randy Montana, Jonathan Singleton|ey Fulcher, Jordan Walker|dob Snyder, Channing Wilson|cSammy Mitchell, Steven Battey, Robert Williford|cWyatt Durrette, Ray Fulcher|tobert Williford|5Laird, Craig Wiseman|0Marc Beeson, Daniel Tashian|3en Morris, Greg Kurstin, Sarah Aarons|eJessie Jo DIllon, Laura Veltz|fimmy Robbins, Laura Veltz|eTom Douglas, David Hodges|ebusbee|3k Irwin, Andrew Dorff, Josh Kear|5Wystrach, Jess Carson, Cameron Duddy, Josh Osborne, Shane McAnally|3v Green, Heather Lynn Morgan, Jimmy Robbins|dillary Lindsey, Troy Verges|2tt Dragstrem, Ben Hayslip, Josh Thompson|gCole Taylor|5Stell, Allison Veltz, Ash Bowers|5Thomas, Scott Thomas, Barry Knox, Phil O'Donnell, Wade Kirby|4hew Ramsey, Trevor Rosen, Brad Tursi, Jesse Frasure|zTursi, Josh Osborne|zTursi, Shane McAnally|uJosh Osborne|uWhit Sellers, Geoff Sprung, Brad Tursi, Shane McAnally|1ichael Carter, Cole Swindell|8Hobby, Corey Crowder, Neil Mason, Cale Dodds|8Tyler, Dave Kuncio, Josh Mirenda, Jaron Boyer, Alex Palmer|2randa Lambert|f, Hillary Lindsey, Lori McKenna, Liz Rose|hJack Ingram, Jon Randall|iosh Osborne, Shane McAnally|2tch Rossell|5ell Tenpenny, Jordan Schmidt, Justin Wilson|1organ Evans, Chris DeStefano, Lindy Robbins|0Naomi Cook,e Justin Wilson, Dave Pittenger|ae, Josh Kear, Hillary Lindsey, Hannah Mullholand, Jennifer Wayne|1icolle Galyon, Jon Nite|gTommy Lee Hames, Josh Osborne|2kki Sixx, Vince Neil, Tommy Lee|0Pavel Dovgalyuk, Abe Stoklasa|0Rachel Reinert, Mike Gossin, Ross Copperman, Jon Nite|2eLynn, Nicolle Galyon, Jimmy Robbins|2ndy Houser, Brice Long|1hett Akins, Ashley Gorley, Ben Hayslip, Ross Copperman|sShane McAnally|dBen Hayslip|o, Jason Sellers|qKyle Fishman|qRoss Copperman|dJesse Frasure, Ashley Gorley|1iley Green, Buford Green, Lendon Bonds|1ob Hatch, Jason Sellers|2dney Clawson, Brent Anderson|gChris Tompkins|u, Tyler Hubbard, Brian Kelley|gDavid Lee Murphy, Jimmy Yeary|gJamie Moore|gLuke Laird, Shane McAnally|gMatt Dragstrem, Cole Taylor|wNatalie Hemby|gRoss Copperman, Matt Jenkins|2ss Copperman, Ashley Gorley, Jaren Johnston|vShane McAnally|gJaren Johnston, Ashley Gorley|heremy Stover, Rhett Akins|hon Nite|gMatt Jenkins, Josh Osborne|gShane McAnally, Jon Nite|1ussell Dickerson, Casey Brown, Parker Welling|jParker Welling, Casey Brown|1yan Hurd, Joey Hyde, Justin Wilson|bNathan Spicer, Laura Veltz|bSam Ellis, Laura Veltz, Jon Green|0Sam Hunt, Josh Osborne, Matthew Ramsey|oShane McAnally|aZach Crowell, Jerry Flowers|zrs, Josh Osborne|oShane McAnally|zlly, Josh Osborne|zlly, Josh Osborne, Charlie Handsome|1cotty McCreery, Frank Rogers, Aaron Eshuis|vMonty Criswell|1eth Mosley, Brad Rempel, Ben Stennis|1hane McAnally, Josh Osborne, Ashley Gorley, Ross Copperman|gMatthew Ramsey, Trevor Rosen|gRoss Copperman, Josh Osborne|wNatalie Hemby, Kristi Neumann|xicolle Galyon|3y Mooney, Niko Moon, Fred Wilhelm, Cary Barlowe|2y Carter, Dave Gibson, Joe Spargur|1teve Mac, Johnny McDaid, Ed Sheeran, Amy Wadge|5n Lee Olsen, Hillary Lindsey, Clint Lagerberg|0Taylor Dye, Maddie Marlow, Aaron Scherz, Pete Sallis|rTiffany Vartanyan|7Swift|c, Patrick Monahan|1enille Townes, Barry Dean, Luke Laird|1homas Rhett, Ashley Gorley, Jesse Frasure|eBart Butler, Larry McCoy|eJesse Frasure, Ashley Gorley, Shane McAnally|eRhett Akins, Ashley Gorley, Jesse Frasure|rBen Hayslip|rJulian Bunetta, Josh Ryan, Jacob Kashar, Ammar Malik|eSean Douglas, Joe Spargur|fhane McAnally, Ashley Gorley, Jesse Frasure|1ofer Brown, Phillip LaRue, Billy Montana|2m Douglas, Jaren Johnston, Jeffrey Steele|3my Cecil, David Ray, Jody Stevens, Craig Wiseman, John Mellencamp|6Lee James, Josh Osborne, Andrew Dorff|1ravis Meadows, Liz Rose|gSteve Moakler|gTravis Jerome Goff|2ent Harmon, Jimmy Robbins, Laura Veltz|1ucker Beathard, Casey Beathard, Marla Cannon-Goodman|2lly Kennedy, Kurt Allison, Steve Bogard, Jason Sever|1yler Hubbard, Brian Kelley, Cary Barlowe, Jesse Frasure, Sarah Buxton|tHardy, Mark Holman|tMorgan Wallen, Jordan Schmidt|tNicolle Galyon, Jordan Schmidt|0Walker Hayes, Kylie Sackley, Thomas Archer|1yatt Earp, Andy Albert, Marc Beeson|0Zac Brown, Niko Moon|k, Al Anderson|mBen Simonetti|mWyatt Durrette|ze, Coy Bowles, John Driskell Hopkins|bShawn Mendes, Niko Moon, Andrew Watt, Ben Simonetti|3h Crowell, Adam Sanders, Jaron Boyer|fshley Gorley, Hillary Lindsey|eBrett James, Hillary Lindsey|eRyan Hurd, Chase McGill|0busbee, Nate Cyphert, William Wiik Larsen","sep":"|"}]}]);
const COLONY = [
{"id":"n-11334138","guard":[["hasAny",["about","always","amen","babe","bank","bar","beautiful","boot","break","buy","came","child","chillin","church","come","compass","country","craving","criminal","crushin","daughter","day","died","dirty","doin","element","eyes","fighter","first","fix","get","girl","heartbeat","hell","hold","holy","it","item number","last","lately","legends","life","mean","mine","normalise","normalize","nth","outta","position","rednecker","riser","same","say","simple","simplify the text","smooth","speechless","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]],["not",["has","born"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.howMany"]]],"mem":null},
{"id":"n-30adc374","guard":[["hasAny",["about","always","amen","babe","bank","bar","beautiful","boot","break","buy","came","child","chillin","church","come","compass","country","craving","criminal","crushin","daughter","day","died","dirty","doin","element","eyes","fighter","first","fix","get","girl","heartbeat","hell","hold","holy","it","item number","last","lately","legends","life","mean","mine","normalise","normalize","nth","outta","position","rednecker","riser","same","say","simple","simplify the text","smooth","speechless","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.howMany"]]],"mem":null},
{"id":"n-ab9dc624","guard":[["hasAny",["about","always","amen","babe","bank","bar","beautiful","boot","break","buy","caesar cipher","came","child","chillin","church","come","compass","country","craving","criminal","crushin","daughter","day","died","dirty","doin","element","eyes","fighter","first","fix","get","girl","heartbeat","hell","hold","holy","it","item number","last","lately","legends","life","mean","mine","nth","outta","position","rednecker","riser","rotate the letters","same","say","shift by","shift each letter","simple","smooth","speechless","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.howMany"]]],"mem":null},
{"id":"n-edd33917","guard":[["hasAny",["about","always","amen","babe","bank","bar","beautiful","boot","break","buy","caesar cipher","came","child","chillin","church","come","compass","country","craving","criminal","crushin","daughter","day","died","dirty","doin","element","eyes","fighter","first","fix","get","girl","heartbeat","hell","hold","holy","it","item number","last","lately","legends","life","mean","mine","nth","outta","position","rednecker","riser","rotate the letters","same","say","shift by","shift each letter","simple","smooth","speechless","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]],["not",["has","born"]]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.howMany"]]],"mem":null},
{"id":"n-5df7e4d7","guard":[["hasAny",["about","always","amen","babe","bank","bar","beautiful","boot","break","buy","came","child","chillin","church","come","compass","country","craving","criminal","crushin","daughter","day","died","dirty","doin","element","eyes","fighter","first","fix","get","girl","heartbeat","hell","hold","holy","it","item number","last","lately","leading zeros","legends","life","mean","mine","nth","outta","pad","pad with","padded to","position","rednecker","riser","same","say","simple","smooth","speechless","today","told","tonight","trouble","turnin","vice","wanna","zero pad"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-c82d6eb3","guard":[["hasAny",["about","always","amen","babe","bank","bar","beautiful","boot","break","buy","came","child","chillin","church","come","compass","country","craving","criminal","crushin","daughter","day","died","dirty","doin","element","eyes","fighter","first","fix","get","girl","heartbeat","hell","hold","holy","it","item number","last","lately","leading zeros","legends","life","mean","mine","nth","outta","pad","pad with","padded to","position","rednecker","riser","same","say","simple","smooth","speechless","today","told","tonight","trouble","turnin","vice","wanna","zero pad"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-0699f231","guard":[["hasAny",["about","always","amen","babe","bank","bar","beautiful","boot","break","buy","came","child","chillin","church","come","compass","country","craving","criminal","crushin","daughter","day","died","dirty","doin","element","eyes","fighter","first","fix","get","girl","heartbeat","hell","hold","holy","it","item number","last","lately","leading zeros","legends","life","mean","mine","nth","outta","pad","pad with","padded to","position","rednecker","riser","same","say","simple","smooth","speechless","today","told","tonight","trouble","turnin","vice","wanna","zero pad"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]]],"mem":null},
{"id":"n-cebfbf0f","guard":[["hasAny",["about","always","amen","babe","bank","bar","beautiful","boot","break","buy","came","child","chillin","church","come","compass","country","craving","criminal","crushin","daughter","day","died","dirty","doin","element","eyes","fighter","first","fix","get","girl","heartbeat","hell","hold","holy","it","item number","last","lately","leading zeros","legends","life","mean","mine","nth","outta","pad","pad with","padded to","position","rednecker","riser","same","say","simple","smooth","speechless","today","told","tonight","trouble","turnin","vice","wanna","zero pad"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]]],"mem":null},
{"id":"n-79118d72","guard":[["hasAny",["about","already","always","amen","babe","bank","bar","beautiful","boot","break","buy","came","child","chillin","church","come","compass","country","craving","criminal","crushin","daughter","day","died","dirty","doin","element","fighter","first","fix","get","girl","heartbeat","hell","hold","holy","it","item number","last","lately","legends","life","mean","nth","outta","position","rednecker","riser","same","separate by","simple","smooth","speechless","split","split by","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-7e8cced4","guard":[["hasAny",["about","already","always","amen","babe","bank","bar","beautiful","boot","break","buy","came","child","chillin","church","come","compass","country","craving","criminal","crushin","daughter","day","died","dirty","doin","element","fighter","first","fix","get","girl","heartbeat","hell","hold","holy","it","item number","last","lately","legends","life","mean","nth","outta","position","rednecker","riser","same","separate by","simple","smooth","speechless","split","split by","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-b042d539","guard":[["hasAny",["about","already","always","amen","babe","bank","bar","beautiful","boot","break","buy","came","child","chillin","church","come","compass","country","craving","criminal","crushin","daughter","day","delete","died","dirty","doin","element","fighter","first","fix","get","girl","heartbeat","hell","hold","holy","it","item number","last","lately","legends","life","mean","nth","outta","position","rednecker","remove","riser","same","simple","smooth","speechless","strip out","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-bb5ed0c5","guard":[["hasAny",["about","already","always","amen","babe","bank","bar","beautiful","boot","break","buy","came","child","chillin","church","come","compass","country","craving","criminal","crushin","daughter","day","died","dirty","doin","element","fighter","first","fix","get","girl","heartbeat","hell","hold","holy","it","item number","last","lately","legends","life","mean","nth","outta","position","rednecker","riser","same","separate by","simple","smooth","speechless","split","split by","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-0b1fe7cc","guard":[["hasAny",["about","amen","babe","bar","beautiful","boot","break","buy","child","chillin","church","come","compass","country","craving","criminal","crush","crushin","daughter","died","dirty","doin","element","eyes","fighter","first","get","good","greatest","heartbeat","hell","hold","holy","hometown","item number","last","lately","legends","life","mean","met","mine","nth","outta","position","rednecker","riser","say","separate by","simple","smooth","some","speechless","split","split by","this","tin","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","back"]],["not",["has","bells"]],["not",["has","chasin"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-2449b6ec","guard":[["hasAny",["about","amen","babe","bar","beautiful","boot","break","buy","child","chillin","church","come","compass","country","craving","criminal","crush","crushin","daughter","died","dirty","doin","element","eyes","fighter","first","get","good","greatest","heartbeat","hell","hold","holy","hometown","item number","last","lately","legends","life","mean","met","mine","nth","outta","position","rednecker","riser","say","separate by","simple","smooth","some","speechless","split","split by","this","tin","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","back"]],["not",["has","bells"]],["not",["has","chasin"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-97d218eb","guard":[["hasAny",["about","amen","babe","bar","beautiful","boot","break","buy","child","chillin","church","come","compass","country","craving","criminal","crush","crushin","daughter","delete","died","dirty","doin","element","eyes","fighter","first","get","good","greatest","heartbeat","hell","hold","holy","hometown","item number","last","lately","legends","life","mean","met","mine","nth","outta","position","rednecker","remove","riser","say","simple","smooth","some","speechless","strip out","this","tin","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","back"]],["not",["has","bells"]],["not",["has","chasin"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a3a75e2c","guard":[["hasAny",["about","amen","babe","bar","beautiful","boot","break","buy","child","chillin","church","come","compass","country","craving","criminal","crush","crushin","daughter","died","dirty","doin","element","eyes","fighter","first","get","good","greatest","heartbeat","hell","hold","holy","hometown","item number","last","lately","legends","life","mean","met","mine","nth","outta","position","rednecker","riser","say","separate by","simple","smooth","some","speechless","split","split by","this","tin","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","back"]],["not",["has","bells"]],["not",["has","chasin"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-34aadbcf","guard":[["hasAny",["about","always","amen","babe","bank","boot","break","buy","came","child","chillin","church","come","compass","country","craving","crush","crushin","day","dirty","doin","element","eyes","fighter","first","fix","get","good","hell","hold","holy","it","item number","last","lately","legends","life","longest","longest one","longest word","lookin","mean","met","mine","nth","outta","position","riser","same","say","simple","smooth","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]],["not",["has","born"]],["not",["has","chasin"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.and",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-35b10a76","guard":[["hasAny",["about","always","amen","babe","bank","boot","break","buy","came","child","chillin","church","come","compass","country","craving","crush","crushin","day","dirty","doin","element","eyes","fighter","first","fix","get","good","hell","hold","holy","it","item number","last","lately","legends","life","longest","longest one","longest word","lookin","mean","met","mine","nth","outta","position","riser","same","say","simple","smooth","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]],["not",["has","born"]],["not",["has","chasin"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-106c985d","guard":[["hasAny",["about","always","amen","babe","bank","boot","break","buy","came","child","chillin","church","come","compass","country","craving","crush","crushin","day","dirty","doin","element","eyes","fighter","first","fix","get","good","hell","hold","holy","invert case","it","item number","last","lately","legends","life","longest","longest one","longest word","lookin","mean","met","mine","nth","outta","position","riser","same","say","simple","smooth","swap case","today","toggle case","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]],["not",["has","born"]],["not",["has","chasin"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-ac5fc20c","guard":[["hasAny",["about","always","amen","babe","bank","boot","break","buy","came","capitalise","capitalize","capitalize each word","child","chillin","church","come","compass","country","craving","crush","crushin","day","dirty","doin","element","eyes","fighter","first","fix","get","good","hell","hold","holy","it","item number","last","lately","legends","life","longest","longest one","longest word","lookin","mean","met","mine","nth","outta","position","riser","same","say","simple","smooth","title case","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]],["not",["has","born"]],["not",["has","chasin"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-cf4ad43d","guard":[["hasAny",["about","always","amen","babe","bank","boot","break","buy","came","child","chillin","church","come","compass","country","craving","crush","crushin","day","dirty","doin","element","eyes","fighter","first","fix","get","good","hell","hold","holy","it","item number","last","lately","legends","life","longest","longest one","longest word","lookin","lower case","lowercase","mean","met","mine","nth","outta","position","riser","same","say","simple","small letters","smooth","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]],["not",["has","born"]],["not",["has","chasin"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-e93b7c34","guard":[["hasAny",["about","all caps","always","amen","babe","bank","boot","break","buy","came","capital letters","capitals","child","chillin","church","come","compass","country","craving","crush","crushin","day","dirty","doin","element","eyes","fighter","first","fix","get","good","hell","hold","holy","it","item number","last","lately","legends","life","longest","longest one","longest word","lookin","mean","met","mine","nth","outta","position","riser","same","say","simple","smooth","today","told","tonight","trouble","turnin","upper case","uppercase","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]],["not",["has","born"]],["not",["has","chasin"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-ff41630f","guard":[["hasAny",["about","always","amen","babe","bank","boot","break","buy","came","child","chillin","church","come","compass","country","craving","crush","crushin","day","dirty","doin","element","eyes","fighter","first","fix","get","good","hell","hold","holy","it","item number","last","lately","legends","life","longest","longest one","longest word","lookin","mean","met","mine","nth","outta","position","riser","same","say","simple","smooth","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]],["not",["has","born"]],["not",["has","chasin"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-1d4dcebf","guard":[["hasAny",["about","always","amen","babe","bank","boot","break","buy","came","child","chillin","church","come","compass","country","craving","crush","crushin","day","dirty","doin","element","eyes","fighter","first","fix","get","good","hell","hold","holy","it","item number","last","lately","legends","life","longest","longest one","longest word","lookin","lower case","lowercase","mean","met","mine","nth","outta","position","riser","same","say","simple","small letters","smooth","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]],["not",["has","born"]],["not",["has","chasin"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-69db820b","guard":[["hasAny",["about","all caps","always","amen","babe","bank","boot","break","buy","came","capital letters","capitals","child","chillin","church","come","compass","country","craving","crush","crushin","day","dirty","doin","element","eyes","fighter","first","fix","get","good","hell","hold","holy","it","item number","last","lately","legends","life","longest","longest one","longest word","lookin","mean","met","mine","nth","outta","position","riser","same","say","simple","smooth","today","told","tonight","trouble","turnin","upper case","uppercase","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]],["not",["has","born"]],["not",["has","chasin"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-9a1619be","guard":[["hasAny",["about","always","amen","babe","bank","boot","break","buy","came","child","chillin","church","come","compass","country","craving","crush","crushin","day","dirty","doin","element","eyes","fighter","first","fix","get","good","hell","hold","holy","invert case","it","item number","last","lately","legends","life","longest","longest one","longest word","lookin","mean","met","mine","nth","outta","position","riser","same","say","simple","smooth","swap case","today","toggle case","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]],["not",["has","born"]],["not",["has","chasin"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-fdf756b6","guard":[["hasAny",["about","always","amen","babe","bank","boot","break","buy","came","capitalise","capitalize","capitalize each word","child","chillin","church","come","compass","country","craving","crush","crushin","day","dirty","doin","element","eyes","fighter","first","fix","get","good","hell","hold","holy","it","item number","last","lately","legends","life","longest","longest one","longest word","lookin","mean","met","mine","nth","outta","position","riser","same","say","simple","smooth","title case","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]],["not",["has","born"]],["not",["has","chasin"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-4579318d","guard":[["hasAny",["about","always","amen","babe","bank","boot","break","buy","came","child","chillin","church","come","compass","country","craving","crush","crushin","day","dirty","doin","element","eyes","fighter","first","fix","get","good","hell","hold","holy","it","item number","last","lately","legends","life","longest","longest one","longest word","lookin","mean","met","mine","normalise","normalize","nth","outta","position","riser","same","say","simple","simplify the text","smooth","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]],["not",["has","born"]],["not",["has","chasin"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-767a9453","guard":[["hasAny",["about","always","amen","babe","bank","boot","break","buy","caesar cipher","came","child","chillin","church","come","compass","country","craving","crush","crushin","day","dirty","doin","element","eyes","fighter","first","fix","get","good","hell","hold","holy","it","item number","last","lately","legends","life","longest","longest one","longest word","lookin","mean","met","mine","nth","outta","position","riser","rotate the letters","same","say","shift by","shift each letter","simple","smooth","today","told","tonight","trouble","turnin","vice","wanna"]],["has","writers"],["not",["has","are"]],["not",["has","beer"]],["not",["has","bells"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-75280f67","guard":[["hasAny",["about","always","bank","beautiful","boot","break","bring","buy","caesar cipher","came","changes","chillin","church","come","country","craving","criminal","crush","daughter","died","dirty","element","eyes","fix","get","good","heartbeat","hell","hold","holy","item number","last","lately","legends","lookin","make","mine","more","nth","outta","position","rednecker","rotate the letters","same","say","shift by","shift each letter","smooth","some","tin","told","trouble","vice"]],["has","writers"],["not",["has","bells"]],["not",["has","born"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-22915d7d","guard":[["hasAny",["about","always","bank","beautiful","boot","break","bring","buy","came","changes","chillin","come","country","craving","criminal","crush","daughter","died","dirty","element","eyes","fix","get","good","heartbeat","hell","hold","holy","item number","last","lately","legends","lookin","make","mine","more","nth","outta","position","rednecker","same","say","smooth","tin","told","trouble","vice"]],["has","writers"],["not",["has","alright"]],["not",["has","and"]],["not",["has","are"]],["not",["has","away"]],["not",["has","back"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-3d4858ce","guard":[["hasAny",["about","always","bank","beautiful","boot","break","bring","buy","came","changes","chillin","come","country","craving","criminal","crush","daughter","died","dirty","element","eyes","fix","get","good","heartbeat","hell","hold","holy","item number","last","lately","legends","lookin","make","mine","more","nth","outta","position","rednecker","same","say","smooth","tin","told","trouble","vice"]],["has","writers"],["not",["has","alright"]],["not",["has","and"]],["not",["has","are"]],["not",["has","away"]],["not",["has","back"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-13ce1959","guard":[["hasAny",["about","always","bank","beautiful","boot","break","bring","buy","came","changes","chillin","come","country","craving","criminal","crush","daughter","died","dirty","element","eyes","fix","get","good","heartbeat","hell","hold","holy","invert case","item number","last","lately","legends","lookin","make","mine","more","nth","outta","position","rednecker","same","say","smooth","swap case","tin","toggle case","told","trouble","vice"]],["has","writers"],["not",["has","alright"]],["not",["has","and"]],["not",["has","are"]],["not",["has","away"]],["not",["has","back"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-17bc4113","guard":[["hasAny",["about","always","bank","beautiful","boot","break","bring","buy","came","capitalise","capitalize","capitalize each word","changes","chillin","come","country","craving","criminal","crush","daughter","died","dirty","element","eyes","fix","get","good","heartbeat","hell","hold","holy","item number","last","lately","legends","lookin","make","mine","more","nth","outta","position","rednecker","same","say","smooth","tin","title case","told","trouble","vice"]],["has","writers"],["not",["has","alright"]],["not",["has","and"]],["not",["has","are"]],["not",["has","away"]],["not",["has","back"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-82a5baf6","guard":[["hasAny",["about","all caps","always","bank","beautiful","boot","break","bring","buy","came","capital letters","capitals","changes","chillin","come","country","craving","criminal","crush","daughter","died","dirty","element","eyes","fix","get","good","heartbeat","hell","hold","holy","item number","last","lately","legends","lookin","make","mine","more","nth","outta","position","rednecker","same","say","smooth","tin","told","trouble","upper case","uppercase","vice"]],["has","writers"],["not",["has","alright"]],["not",["has","and"]],["not",["has","are"]],["not",["has","away"]],["not",["has","back"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-94900d37","guard":[["hasAny",["about","always","bank","beautiful","boot","break","bring","buy","came","changes","chillin","come","country","craving","criminal","crush","daughter","died","dirty","element","eyes","fix","get","good","heartbeat","hell","hold","holy","item number","last","lately","legends","lookin","lower case","lowercase","make","mine","more","nth","outta","position","rednecker","same","say","small letters","smooth","tin","told","trouble","vice"]],["has","writers"],["not",["has","alright"]],["not",["has","and"]],["not",["has","are"]],["not",["has","away"]],["not",["has","back"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-aee17cbf","guard":[["hasAny",["about","always","bank","beautiful","boot","break","bring","buy","came","changes","chillin","come","country","craving","criminal","crush","daughter","died","dirty","element","eyes","fix","get","good","heartbeat","hell","hold","holy","item number","last","lately","legends","lookin","make","mine","more","nth","outta","position","rednecker","same","say","smooth","tin","told","trouble","vice"]],["has","writers"],["not",["has","alright"]],["not",["has","and"]],["not",["has","are"]],["not",["has","away"]],["not",["has","back"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-77a3aa87","guard":[["hasAny",["about","always","bank","beautiful","boot","break","bring","buy","came","changes","chillin","come","country","craving","criminal","crush","daughter","died","dirty","element","eyes","fix","get","good","heartbeat","hell","hold","holy","item number","last","lately","legends","lookin","lower case","lowercase","make","mine","more","nth","outta","position","rednecker","same","say","small letters","smooth","tin","told","trouble","vice"]],["has","writers"],["not",["has","alright"]],["not",["has","and"]],["not",["has","are"]],["not",["has","away"]],["not",["has","back"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-913708f5","guard":[["hasAny",["about","always","bank","beautiful","boot","break","bring","buy","came","capitalise","capitalize","capitalize each word","changes","chillin","come","country","craving","criminal","crush","daughter","died","dirty","element","eyes","fix","get","good","heartbeat","hell","hold","holy","item number","last","lately","legends","lookin","make","mine","more","nth","outta","position","rednecker","same","say","smooth","tin","title case","told","trouble","vice"]],["has","writers"],["not",["has","alright"]],["not",["has","and"]],["not",["has","are"]],["not",["has","away"]],["not",["has","back"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-d7df316d","guard":[["hasAny",["about","always","bank","beautiful","boot","break","bring","buy","came","changes","chillin","come","country","craving","criminal","crush","daughter","died","dirty","element","eyes","fix","get","good","heartbeat","hell","hold","holy","invert case","item number","last","lately","legends","lookin","make","mine","more","nth","outta","position","rednecker","same","say","smooth","swap case","tin","toggle case","told","trouble","vice"]],["has","writers"],["not",["has","alright"]],["not",["has","and"]],["not",["has","are"]],["not",["has","away"]],["not",["has","back"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-f1b76b27","guard":[["hasAny",["about","all caps","always","bank","beautiful","boot","break","bring","buy","came","capital letters","capitals","changes","chillin","come","country","craving","criminal","crush","daughter","died","dirty","element","eyes","fix","get","good","heartbeat","hell","hold","holy","item number","last","lately","legends","lookin","make","mine","more","nth","outta","position","rednecker","same","say","smooth","tin","told","trouble","upper case","uppercase","vice"]],["has","writers"],["not",["has","alright"]],["not",["has","and"]],["not",["has","are"]],["not",["has","away"]],["not",["has","back"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-b19dad8a","guard":[["hasAny",["about","always","bank","beautiful","boot","break","bring","buy","came","changes","chillin","come","country","craving","criminal","crush","daughter","died","dirty","element","eyes","fix","get","good","heartbeat","hell","hold","holy","item number","last","lately","legends","lookin","make","mine","more","normalise","normalize","nth","outta","position","rednecker","same","say","simplify the text","smooth","tin","told","trouble","vice"]],["has","writers"],["not",["has","alright"]],["not",["has","and"]],["not",["has","are"]],["not",["has","away"]],["not",["has","back"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-a878f275","guard":[["hasAny",["already","always","babe","band","beautiful","boot","break","bring","buy","came","caught","come","compass","craving","crush","day","delete","dirty","doin","element","eyes","get","greatest","ground","hell","holy","hometown","item number","lately","lookin","met","nth","position","remove","riser","same","say","simple","smooth","speechless","strip out","summertime","thought","told","tonight","trouble"]],["has","writers"],["not",["has","are"]],["not",["has","back"]],["not",["has","born"]],["not",["has","chasin"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}]]],"mem":null},
{"id":"n-ea4d3883","guard":[["hasAny",["already","always","babe","band","beautiful","boot","break","bring","buy","came","caught","come","compass","craving","crush","day","dirty","doin","element","eyes","get","greatest","ground","hell","holy","hometown","item number","lately","lookin","met","nth","position","riser","same","say","separate by","simple","smooth","speechless","split","split by","summertime","thought","told","tonight","trouble"]],["has","writers"],["not",["has","are"]],["not",["has","back"]],["not",["has","born"]],["not",["has","chasin"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}]]],"mem":null},
{"id":"n-18f9e348","guard":[["has","writers"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the writers of Thought About You":"The writers of Thought About You is Brad Warren, Brett Warren, Lee Thomas Miller.","the writers of I Hold On":"The writers of I Hold On is Brett James, Dierks Bentley.","the writers of Somewhere In My Car":"The writers of Somewhere In My Car is Keith Urban, J.T. Harding.","the writers of Say You Do":"The writers of Say You Do is Shane McAnally, Matthew Ramsey, Trevor Rosen.","the writers of Hell of a Night":"The writers of Hell of a Night is Zach Crowell, Adam Sanders, Jaron Boyer.","the writers of H.O.L.Y":"The writers of H.O.L.Y. is busbee, Nate Cyphert, William Wiik Larsen.","the writers of Night's On Fire":"The writers of Night's On Fire is Jonathan Singleton, Deric Ruttan.","the writers of Shotgun Rider":"The writers of Shotgun Rider is Marv Green, Hillary Lindsey, Troy Verges.","the writers of Buy My Own Dranks":"The writers of Buy My Own Dranks is Naomi Cooke, Josh Kear, Hillary Lindsey, Hannah Mullholand, Jennifer Wayne.","the writers of Make Me Wanna":"The writers of Make Me Wanna is Thomas Rhett, Bart Butler, Larry McCoy.","the writers of Better Man":"The writers of Better Man is Taylor Swift.","the writers of Bring It On Over":"The writers of Bring It On Over is Dallas Davidson, Ben Hayslip, Jesse Frasure, Rhett Akins.","the writers of I Wish Grandpas Never Died":"The writers of I Wish Grandpas Never Died is Riley Green, Buford Green, Lendon Bonds.","the writers of Tin Man":"The writers of Tin Man is Miranda Lambert, Jack Ingram, Jon Randall.","the writers of Smooth":"The writers of Smooth is Tyler Hubbard, Brian Kelley, Nicolle Galyon, Jordan Schmidt.","the writers of Came Here To Forget":"The writers of Came Here To Forget is Deric Ruttan, Craig Wiseman.","the writers of How I'll Always Be":"The writers of How I'll Always Be is Chris Janson, Jamie Paulin, Jeremy Stover.","the writers of Still the Same":"The writers of Still the Same is Jennifer Nettles, Kristian Bush.","the writers of Heartbeat":"The writers of Heartbeat is Carrie Underwood, Zach Crowell, Ashley Gorley.","the writers of Light It Up":"The writers of Light It Up is Luke Bryan, Brad Tursi.","the writers of Get Me Some of That":"The writers of Get Me Some of That is Rhett Akins, Michael Carter, Cole Swindell.","the writers of If The Boot Fits":"The writers of If The Boot Fits is Jordan Schmidt, Andy Albert, Mitchell Tenpenny.","the writers of Fix A Drink":"The writers of Fix A Drink is Chris Janson, Chris DuBois, Ashley Gorley.","the writers of Kiss You Tonight":"The writers of Kiss You Tonight is David Cook, Jay Knowles, Trent Summar.","the writers of Lovin' Lately":"The writers of Lovin' Lately is Big Kenny, John Rich, Tim McGraw.","the writers of Greatest Love Story":"The writers of Greatest Love Story is Brandon Lancaster.","the writers of I Hate Love Songs":"The writers of I Hate Love Songs is Kelsea Ballerini, Shane McAnally, Trevor Rosen.","the writers of A Little More Summertime":"The writers of A Little More Summertime is Jerry Flowers, Tony Martin, Wendell Mobley.","It":"The writers of This Is It is Scotty McCreery, Frank Rogers, Aaron Eshuis.","the writers of Legends":"The writers of Legends is Kelsea Ballerini, Hillary Lindsey, Forest Glen Whitehead.","the writers of Trouble":"The writers of Trouble is Rachel Reinert, Mike Gossin, Ross Copperman, Jon Nite.","the writers of Dirty Laundry":"The writers of Dirty Laundry is Zach Crowell, Ashley Gorley, Hillary Lindsey.","the writers of Better In Boots":"The writers of Better In Boots is Naomi Cook,e Justin Wilson, Dave Pittenger.","the writers of Lonely Eyes":"The writers of Lonely Eyes is Johnny Bulford, Jason Matthews, Laura Veltz.","the writers of River Bank":"The writers of River Bank is Brad Paisley, Kelley Lovelace."}}},
{"id":"n-5cd8df2e","guard":[["hasAny",["delete","element","item number","nth","position","remove","strip out","without","writers"]],["not",["has","different"]],["not",["has","running"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-6610fe07","guard":[["hasAny",["alright","amen","babe","band","bar","beachin","child","compass","crushin","dance","day","dead","dirt","doin","element","fighter","first","give","goodnight","head","hometown","item number","mean","met","nth","position","real","riser","see","simple","speechless","today","turnin"]],["has","writers"],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.and",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-f115cc44","guard":[["hasAny",["alright","amen","babe","band","bar","beachin","child","compass","crushin","dance","day","dead","dirt","doin","element","fighter","first","give","goodnight","head","hometown","item number","mean","met","nth","position","real","riser","see","simple","speechless","today","turnin"]],["has","writers"],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-1386ad42","guard":[["hasAny",["alright","amen","babe","band","bar","beachin","capitalise","capitalize","capitalize each word","child","compass","crushin","dance","day","dead","dirt","doin","element","fighter","first","give","goodnight","head","hometown","item number","mean","met","nth","position","real","riser","see","simple","speechless","title case","today","turnin"]],["has","writers"],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-8040c3f5","guard":[["hasAny",["alright","amen","babe","band","bar","beachin","child","class name","compass","crushin","dance","day","dead","dirt","doin","element","fighter","first","give","goodnight","head","hometown","item number","mean","met","nth","pascal case","pascalcase","position","real","riser","see","simple","speechless","today","turnin","upper camel case"]],["has","writers"],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-87abfbfd","guard":[["hasAny",["all caps","alright","amen","babe","band","bar","beachin","capital letters","capitals","child","compass","crushin","dance","day","dead","dirt","doin","element","fighter","first","give","goodnight","head","hometown","item number","mean","met","nth","position","real","riser","see","simple","speechless","today","turnin","upper case","uppercase"]],["has","writers"],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-924eeece","guard":[["hasAny",["alright","amen","babe","band","bar","beachin","child","compass","crushin","dance","day","dead","dirt","doin","element","fighter","first","give","goodnight","head","hometown","item number","lower case","lowercase","mean","met","nth","position","real","riser","see","simple","small letters","speechless","today","turnin"]],["has","writers"],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-979e6e15","guard":[["hasAny",["alright","amen","babe","band","bar","beachin","child","compass","crushin","dance","day","dead","dirt","doin","element","fighter","first","give","goodnight","head","hometown","invert case","item number","mean","met","nth","position","real","riser","see","simple","speechless","swap case","today","toggle case","turnin"]],["has","writers"],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-aec108e9","guard":[["hasAny",["alright","amen","babe","band","bar","beachin","child","compass","crushin","dance","day","dead","dirt","doin","element","fighter","first","give","goodnight","head","hometown","invert case","item number","mean","met","nth","position","real","riser","see","simple","speechless","swap case","today","toggle case","turnin"]],["has","writers"],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-d2905c1b","guard":[["hasAny",["alright","amen","babe","band","bar","beachin","child","compass","crushin","dance","day","dead","dirt","doin","element","fighter","first","give","goodnight","head","hometown","item number","mean","met","nth","position","real","riser","see","simple","speechless","today","turnin"]],["has","writers"],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-3b941bdc","guard":[["hasAny",["alright","amen","babe","band","bar","beachin","child","compass","crushin","dance","day","dead","dirt","doin","element","fighter","first","give","goodnight","head","hometown","invert case","item number","mean","met","nth","position","real","riser","see","simple","speechless","swap case","today","toggle case","turnin"]],["has","writers"],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-7403516d","guard":[["hasAny",["alright","amen","babe","band","bar","beachin","child","compass","crushin","dance","day","dead","dirt","doin","each word","element","fighter","first","give","goodnight","head","hometown","item number","mean","met","nth","position","real","riser","see","simple","speechless","split into words","today","turnin"]],["has","writers"],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-823fdecb","guard":[["hasAny",["alright","amen","babe","band","bar","beachin","child","compass","crushin","dance","day","dead","dirt","doin","each word","element","fighter","first","give","goodnight","head","hometown","item number","mean","met","nth","position","real","riser","see","simple","speechless","split into words","today","turnin"]],["has","writers"],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-a8db8a56","guard":[["hasAny",["alright","amen","babe","band","bar","beachin","child","compass","crushin","dance","day","dead","dirt","doin","element","fighter","first","give","goodnight","head","hometown","item number","lower case","lowercase","mean","met","nth","position","real","riser","see","simple","small letters","speechless","today","turnin"]],["has","writers"],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-d596bb4c","guard":[["hasAny",["alright","amen","babe","band","bar","beachin","capitalise","capitalize","capitalize each word","child","compass","crushin","dance","day","dead","dirt","doin","element","fighter","first","give","goodnight","head","hometown","item number","mean","met","nth","position","real","riser","see","simple","speechless","title case","today","turnin"]],["has","writers"],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-f8e515d3","guard":[["hasAny",["all caps","alright","amen","babe","band","bar","beachin","capital letters","capitals","child","compass","crushin","dance","day","dead","dirt","doin","element","fighter","first","give","goodnight","head","hometown","item number","mean","met","nth","position","real","riser","see","simple","speechless","today","turnin","upper case","uppercase"]],["has","writers"],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-5e2d51df","guard":[["hasAny",["alright","amen","babe","band","bar","beachin","child","compass","crushin","dance","day","dead","dirt","doin","element","fighter","first","give","goodnight","head","hometown","item number","mean","met","normalise","normalize","nth","position","real","riser","see","simple","simplify the text","speechless","today","turnin"]],["has","writers"],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-b081df7f","guard":[["hasAny",["alright","amen","babe","band","bar","beachin","caesar cipher","child","compass","crushin","dance","day","dead","dirt","doin","element","fighter","first","give","goodnight","head","hometown","item number","mean","met","nth","position","real","riser","rotate the letters","see","shift by","shift each letter","simple","speechless","today","turnin"]],["has","writers"],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-c3c02070","guard":[["hasAny",["babe","change to","compass","criminal","dirt","element","heartbeat","item number","legends","nth","position","rednecker","replace","riser","simple","smooth","speechless","substitute","swap","today","trouble","vice"]],["has","writers"],["not",["has","boots"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-d81eee5d","guard":[["hasAny",["babe","change to","compass","criminal","dirt","element","heartbeat","item number","legends","nth","position","rednecker","replace","riser","simple","smooth","speechless","substitute","swap","today","trouble","vice"]],["has","writers"],["not",["has","boots"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-cd79d672","guard":[["hasAny",["element","item number","leading zeros","nth","pad","pad with","padded to","position","writers","zero pad"]],["not",["has","car"]],["not",["has","dance"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.howMany"],["sense.roman"]]],"mem":null},
{"id":"n-696f3f0f","guard":[["hasAny",["compass","crushin","element","fighter","heartbeat","item number","legends","nth","position","shortest","shortest one","shortest word","speechless","trouble"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.and",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-843b8e4a","guard":[["hasAny",["compass","crushin","element","fighter","heartbeat","item number","legends","nth","position","shortest","shortest one","shortest word","speechless","trouble"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-0d32b53c","guard":[["hasAny",["all caps","capital letters","capitals","compass","crushin","element","fighter","heartbeat","item number","legends","nth","position","shortest","shortest one","shortest word","speechless","trouble","upper case","uppercase"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-4e577a06","guard":[["hasAny",["compass","crushin","element","fighter","heartbeat","item number","legends","nth","position","shortest","shortest one","shortest word","speechless","trouble"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-a1f2ca89","guard":[["hasAny",["capitalise","capitalize","capitalize each word","compass","crushin","element","fighter","heartbeat","item number","legends","nth","position","shortest","shortest one","shortest word","speechless","title case","trouble"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-a752fa5f","guard":[["hasAny",["compass","crushin","element","fighter","heartbeat","invert case","item number","legends","nth","position","shortest","shortest one","shortest word","speechless","swap case","toggle case","trouble"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-d6f36892","guard":[["hasAny",["compass","crushin","element","fighter","heartbeat","item number","legends","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","speechless","trouble"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]]],"mem":null},
{"id":"n-3ccea90e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","compass","crushin","element","fighter","heartbeat","item number","legends","nth","position","shortest","shortest one","shortest word","speechless","title case","trouble"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-f99c0fd0","guard":[["hasAny",["compass","crushin","element","fighter","heartbeat","item number","legends","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","speechless","trouble"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-fd0f4be1","guard":[["hasAny",["all caps","capital letters","capitals","compass","crushin","element","fighter","heartbeat","item number","legends","nth","position","shortest","shortest one","shortest word","speechless","trouble","upper case","uppercase"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-fdbd6223","guard":[["hasAny",["compass","crushin","element","fighter","heartbeat","invert case","item number","legends","nth","position","shortest","shortest one","shortest word","speechless","swap case","toggle case","trouble"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-39a5c4ce","guard":[["hasAny",["caesar cipher","compass","crushin","element","fighter","heartbeat","item number","legends","nth","position","rotate the letters","shift by","shift each letter","shortest","shortest one","shortest word","speechless","trouble"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-47b4019b","guard":[["hasAny",["died","element","girl","hold","item number","love","nth","position","separate by","song","split","split by"]],["has","writers"]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.roman"]]],"mem":null},
{"id":"n-6a8a41b4","guard":[["hasAny",["delete","died","element","girl","hold","item number","love","nth","position","remove","song","strip out","without"]],["has","writers"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.roman"]]],"mem":null},
{"id":"n-80416ec2","guard":[["hasAny",["died","element","girl","hold","item number","love","nth","position","separate by","song","split","split by"]],["has","writers"]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.roman"]]],"mem":null},
{"id":"n-da6625a3","guard":[["hasAny",["died","element","girl","hold","item number","love","nth","position","separate by","song","split","split by"]],["has","writers"]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.roman"]]],"mem":null},
{"id":"n-197f0a7d","guard":[["hasAny",["change to","died","element","girl","hold","item number","love","nth","position","replace","song","substitute","swap"]],["has","writers"]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.roman"],["sense.lastWord"]]],"mem":null},
{"id":"n-dc7c05bd","guard":[["hasAny",["change to","died","element","girl","hold","item number","love","nth","position","replace","song","substitute","swap"]],["has","writers"]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.roman"],["sense.text"]]],"mem":null},
{"id":"n-4639bb36","guard":[["hasAny",["change to","died","element","girl","hold","item number","love","nth","position","replace","song","substitute","swap"]],["has","writers"]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.roman"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]]],"mem":null},
{"id":"n-eb964333","guard":[["hasAny",["delete","element","item number","nth","position","remove","strip out","without","writers"]],["not",["has","between"]],["not",["has","kiss"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-1165567d","guard":[["hasAny",["element","greatest","item number","normalise","normalize","nth","outta","position","simplify the text","stay"]],["has","writers"],["words>=",8]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],{"lit":1}]],"mem":null},
{"id":"n-127acb2a","guard":[["hasAny",["element","greatest","item number","normalise","normalize","nth","outta","position","simplify the text","stay"]],["has","writers"],["words>=",8]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],{"lit":3}]],"mem":null},
{"id":"n-cccbdb90","guard":[["hasAny",["delete","element","item number","nth","position","remove","strip out","without","writers"]],["not",["has","born"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.before",{"lit":"to"}]]],"mem":null},
{"id":"n-96193b95","guard":[["hasAny",["criminal","element","heartbeat","item number","longest","longest one","longest word","nth","position","rednecker"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-1669689a","guard":[["hasAny",["characters from","element","item number","letters from to","nth","outta","position","slice of the text","stay","substring"]],["has","song"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-b5ad26a5","guard":[["hasAny",["delete","element","item number","nth","position","remove","strip out","without","writers"]],["not",["has","born"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.after",{"lit":"to"}]]],"mem":null},
{"id":"n-c2434b78","guard":[["hasAny",["about","delete","element","item number","nth","position","remove","strip out","without"]],["has","writers"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.after",{"lit":"about"}]]],"mem":null},
{"id":"n-ef486aff","guard":[["hasAny",["element","heartbeat","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","speechless"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-32c03438","guard":[["hasAny",["count","element","how many","how many items","item number","normalise","normalize","nth","number of items","position","simplify the text","stay"]],["has","song"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-05b8e306","guard":[["hasAny",["longest","longest one","longest word","riser"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Travis Meadows, Steve Moakler."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-0c6a6098","guard":[["hasAny",["longest","longest one","longest word","turnin"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Blake Shelton, Josh Osborne, Jessi Alexander."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-0cb197c9","guard":[["hasAny",["longest","longest one","longest word","vice"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Miranda Lambert, Josh Osborne, Shane McAnally."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-0e34994f","guard":[["hasAny",["caught","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Connie Harrington, Jordan Schmidt, Mike Walker."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-1095ab1d","guard":[["hasAny",["longest","longest one","longest word","simple"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Tyler Hubbard, Brian Kelley, Hardy, Mark Holman."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-14c6b40d","guard":[["hasAny",["boot","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Jordan Schmidt, Andy Albert, Mitchell Tenpenny."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-16de812e","guard":[["hasAny",["bank","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Brad Paisley, Kelley Lovelace."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-1afeacd8","guard":[["hasAny",["drink","longest","longest one","longest word"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Chris Janson, Chris DuBois, Ashley Gorley."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-1b321b37","guard":[["hasAny",["longest","longest one","longest word","real"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Shane McAnally, Josh Osborne, Ashley Gorley, Ross Copperman."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-1bce920d","guard":[["hasAny",["holy","longest","longest one","longest word"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is busbee, Nate Cyphert, William Wiik Larsen."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-27fc3ca2","guard":[["hasAny",["compass","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Mikkel Eriksen, Tor Erik Hemransen, Ammar Malik, Ross Golan, Daniel Omelio, Emile Haynie."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-34f209e8","guard":[["hasAny",["legends","longest","longest one","longest word"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Kelsea Ballerini, Hillary Lindsey, Forest Glen Whitehead."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-35ae4acb","guard":[["hasAny",["crush","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Lori McKenna, Hillary Lindsey, Liz Rose."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-373e711a","guard":[["hasAny",["good","longest","longest one","longest word"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Dustin Lynch, Justin Ebach, Andy Albert."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-381d363a","guard":[["hasAny",["longest","longest one","longest word","wins"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Carrie Underwood, Brett James, David Garcia."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-40b890b1","guard":[["hasAny",["longest","longest one","longest word","rider"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Marv Green, Hillary Lindsey, Troy Verges."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-46faf2c0","guard":[["hasAny",["day","longest","longest one","longest word"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Andrew Dorff, Matthew Ramsey, Brad Tursi."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-474e441d","guard":[["hasAny",["longest","longest one","longest word","today"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Brad Paisley, Chris DuBois, Ashley Gorley."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-49738acb","guard":[["hasAny",["come","longest","longest one","longest word"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Brian Kelley, Tyler Hubbard, Jordan Schmidt, Jimmy Robbins, Brad Warren, Brett Warren."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-50354d70","guard":[["hasAny",["longest","longest one","longest word","tin"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Miranda Lambert, Jack Ingram, Jon Randall."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-521382f0","guard":[["hasAny",["dirt","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Rodney Clawson, Chris Tompkins."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-52a4c083","guard":[["hasAny",["doin","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Philip O'donnell, Wade Kirby."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-57070882","guard":[["hasAny",["church","longest","longest one","longest word"]],["has","my"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is busbee, Maren Morris."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-570bf182","guard":[["hasAny",["longest","longest one","longest word","stay"]],["has","song"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Joey Moi."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-57fa041b","guard":[["hasAny",["dirty","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Zach Crowell, Ashley Gorley, Hillary Lindsey."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-592c519d","guard":[["hasAny",["dance","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Jordan Davis, Lonnie Fowler."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-5a48c1ac","guard":[["hasAny",["longest","longest one","longest word","see"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Ashley Gorley, Zach Crowell, Scotty Mccreery, Miller Crowell."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-5b524634","guard":[["hasAny",["lately","longest","longest one","longest word"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Big Kenny, John Rich, Tim McGraw."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-5c8344e4","guard":[["hasAny",["babe","longest","longest one","longest word"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Taylor Swift, Patrick Monahan."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-62b97412","guard":[["hasAny",["amen","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Dierks Bentley, Josh Kear, Ross Copperman."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-675556f1","guard":[["hasAny",["girls","longest","longest one","longest word"]],["has","song"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is RaeLynn, Nicolle Galyon, Lori McKenna, Liz Rose."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-67bf2abd","guard":[["hasAny",["drunk","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Dierks Bentley, Chris Tompkins, Josh Kear."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-67d933fd","guard":[["hasAny",["first","longest","longest one","longest word"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Darius Rucker, Derek George, Scooter Carusoe."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-6d7e02e5","guard":[["hasAny",["longest","longest one","longest word","same"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Jennifer Nettles, Kristian Bush."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-6f02c173","guard":[["hasAny",["bring","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Dallas Davidson, Ben Hayslip, Jesse Frasure, Rhett Akins."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-712baad1","guard":[["hasAny",["already","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Matt Thomas, Scott Thomas, Barry Knox, Phil O'Donnell, Wade Kirby."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-743b0133","guard":[["hasAny",["eyes","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Johnny Bulford, Jason Matthews, Laura Veltz."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-7610548e","guard":[["hasAny",["changes","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Thomas Rhett, Rhett Akins, Ashley Gorley, Jesse Frasure."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-7a0ca328","guard":[["hasAny",["craving","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Dave Barnes, Julian Bunetta."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-7aca7ca2","guard":[["has","dead"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Sam Hunt, Zach Crowell, Shane McAnally, Josh Osborne, Charlie Handsome."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-7b514132","guard":[["has","dahlonega"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Ashley McBryde, Nicolette Hayford, Jesse Rice."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-84537609","guard":[["has","alright"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is David Lee Murphy, Jimmy Yeary, Chris Stevens."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-84b8a59e","guard":[["hasAny",["last","longest","longest one","longest word"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Kip Moore, Dan Couch, David Lee Murphy."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-89328351","guard":[["hasAny",["comin","longest","longest one","longest word"]],["has","song"],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Corey Crowder, Josh Hoge, Chris Young."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-9a74576e","guard":[["hasAny",["longest","longest one","longest word","met"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Sam Hunt, Trevor Rosen, Shane McAnally."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-9abbc38b","guard":[["hasAny",["longest","longest one","longest word","thought"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Brad Warren, Brett Warren, Lee Thomas Miller."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-9d17037e","guard":[["hasAny",["chillin","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Cole Swindell, Shane Minor."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-9fa80d27","guard":[["hasAny",["ground","longest","longest one","longest word"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Dan Smyers, Shay Mooney, Chris DeStefano."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-a00ca0ba","guard":[["hasAny",["longest","longest one","longest word","trouble"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Rachel Reinert, Mike Gossin, Ross Copperman, Jon Nite."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-a0ca46c1","guard":[["hasAny",["heartbeat","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Carrie Underwood, Zach Crowell, Ashley Gorley."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-a0dd31e3","guard":[["hasAny",["always","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Chris Janson, Jamie Paulin, Jeremy Stover."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-a9931da7","guard":[["hasAny",["get","longest","longest one","longest word"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Rhett Akins, Michael Carter, Cole Swindell."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-aa331252","guard":[["hasAny",["buy","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Naomi Cooke, Josh Kear, Hillary Lindsey, Hannah Mullholand, Jennifer Wayne."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-ac0ca845","guard":[["hasAny",["longest","longest one","longest word","nation"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Brad Paisley, Chris DuBois, Kelley Lovelace."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-ac94210b","guard":[["hasAny",["longest","longest one","longest word","told"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Ross Copperman, Shane McAnally, Jon Nite."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-aed1844e","guard":[["hasAny",["crushin","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Brad Paisley, Kelley Lovelace, Lee Thomas Miller."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-b27fa69e","guard":[["hasAny",["longest","longest one","longest word","mean"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Brett Eldredge, Scooter Carusoe."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-b2b934d2","guard":[["hasAny",["beachin","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Jaren Johnston, Jon Nite, Jimmy Robbins."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-b3d568e9","guard":[["hasAny",["light","longest","longest one","longest word"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Luke Bryan, Brad Tursi."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-b767704a","guard":[["hasAny",["fire","longest","longest one","longest word"]],["has","writers"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Jonathan Singleton, Deric Ruttan."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-b92772db","guard":[["has","goodnight"],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Rob Hatch, Jason Sellers, Randy Houser."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-bb2efeea","guard":[["hasAny",["band","longest","longest one","longest word"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Matthew Ramsey, Trevor Rosen, Brad Tursi, Josh Osborne."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-bb8bbf87","guard":[["hasAny",["shortest","shortest one","shortest word","speechless"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Dan Smyers, Shay Mooney, Jordan Reynolds, Laura Veltz."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-bcba2f91","guard":[["hasAny",["longest","longest one","longest word","say"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Shane McAnally, Matthew Ramsey, Trevor Rosen."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-c12ae893","guard":[["hasAny",["head","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Jon Pardi, Luke Laird."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-cad42faf","guard":[["hasAny",["hearts","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Ingrid Andress, Sam Ellis, Derrick Southerland."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-ce59aef8","guard":[["hasAny",["longest","longest one","longest word","make"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Thomas Rhett, Bart Butler, Larry McCoy."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-decda36b","guard":[["hasAny",["longest","longest one","longest word","lookin"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Mark Irwin, James T. Slater, Chris Tompkins."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-e1a84dd0","guard":[["hasAny",["longest","longest one","longest word","outta"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Aaron Watson."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-e26164f2","guard":[["hasAny",["child","longest","longest one","longest word"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Kenny Chesney, Shane McAnally, Josh Osborne."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-e2a431d0","guard":[["has","hometown"],["has","girl"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Marc Beeson, Daniel Tashian."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-e3a77836","guard":[["hasAny",["dont","longest","longest one","longest word"]],["words>=",14]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Billy Currington, Cary Barlowe, Shy Carter."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-ed841de3","guard":[["hasAny",["longest","longest one","longest word","smooth"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Tyler Hubbard, Brian Kelley, Nicolle Galyon, Jordan Schmidt."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-f1e32838","guard":[["hasAny",["hold","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Brett James, Dierks Bentley."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-f41957f7","guard":[["hasAny",["fighter","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Keith Urban, busbee."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-f6d2ab38","guard":[["hasAny",["hell","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Zach Crowell, Adam Sanders, Jaron Boyer."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-f76c726a","guard":[["hasAny",["came","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Deric Ruttan, Craig Wiseman."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-fbc509e1","guard":[["hasAny",["hate","longest","longest one","longest word"]],["has","what"],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Kelsea Ballerini, Shane McAnally, Trevor Rosen."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-fc3c3604","guard":[["hasAny",["break","longest","longest one","longest word"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Ross Copperman, Jon Nite."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-2e56951b","guard":[["hasAny",["daughter","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Tenille Townes, Barry Dean, Luke Laird."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-32c602ce","guard":[["hasAny",["element","item number","nth","position","summertime"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Jerry Flowers, Tony Martin, Wendell Mobley."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-3de7c42c","guard":[["hasAny",["element","item number","nth","position","rednecker"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is HARDY, Jordan Schmidt, Andy Albert."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-402323b2","guard":[["hasAny",["criminal","element","item number","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Lindsay Ell, Fred Wilhelm, Chris Stevens."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-5007a7eb","guard":[["hasAny",["beautiful","element","item number","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Zac Brown, Niko Moon."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-7c5a04b5","guard":[["hasAny",["died","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Riley Green, Buford Green, Lendon Bonds."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-836f485c","guard":[["hasAny",["car","element","item number","nth","position"]],["has","writers"],["has","somewhere"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Keith Urban, J.T. Harding."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-e402ecac","guard":[["hasAny",["element","greatest","item number","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Brandon Lancaster."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]]],"mem":null},
{"id":"n-61403d74","guard":[["hasAny",["element","item number","nth","outta","position"]],["has","tell"]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}]],"mem":null},
{"id":"n-0e2192cb","guard":[["hasAny",["element","item number","lower case","lowercase","nth","outta","position","small letters"]],["has","tell"]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}]]],"mem":null},
{"id":"n-3555691a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","outta","position","title case"]],["has","tell"]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}]]],"mem":null},
{"id":"n-8893776e","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","outta","position","upper case","uppercase"]],["has","tell"]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}]]],"mem":null},
{"id":"n-a866fce7","guard":[["hasAny",["element","invert case","item number","nth","outta","position","swap case","toggle case"]],["has","tell"]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}]]],"mem":null},
{"id":"n-336f2205","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","invert case","item number","nth","outta","position","swap case","title case","toggle case"]],["has","tell"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}]]]],"mem":null},
{"id":"n-3d4d39ae","guard":[["hasAny",["element","item number","normalise","normalize","nth","outta","position","simplify the text"]],["has","tell"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],{"lit":1}]],"mem":null},
{"id":"n-472e4c41","guard":[["hasAny",["element","item number","normalise","normalize","nth","outta","position","simplify the text"]],["has","tell"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],{"lit":3}]],"mem":null},
{"id":"n-48867de7","guard":[["hasAny",["element","item number","normalise","normalize","nth","outta","position","simplify the text"]],["has","tell"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],["sense.howMany"]]],"mem":null},
{"id":"n-62fe469c","guard":[["hasAny",["day","delete","element","item number","nth","position","remove","strip out","without"]],["has","writers"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.unit"]]],"mem":null},
{"id":"n-7c43d446","guard":[["hasAny",["caesar cipher","element","item number","nth","outta","position","rotate the letters","shift by","shift each letter"]],["has","tell"]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],["sense.howMany"]]],"mem":null},
{"id":"n-9f388051","guard":[["hasAny",["element","item number","nth","position","song"]]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],["sense.howMany"]]],"mem":null},
{"id":"n-0080b0a3","guard":[["hasAny",["element","item number","longest","longest one","longest word","lookin","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Lookin For That Girl is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-01005f74","guard":[["hasAny",["element","head","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Head Over Boots is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-0163b5da","guard":[["hasAny",["element","item number","light","longest","longest one","longest word","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Light It Up is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-04f31709","guard":[["hasAny",["comin","element","item number","longest","longest one","longest word","nth","position"]],["has","song"],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of I'm Comin Over is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-08a021e3","guard":[["hasAny",["bank","element","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of River Bank is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-09309cd1","guard":[["hasAny",["delete","element","item number","nth","outta","position","remove","strip out"]],["has","tell"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-0d33ea29","guard":[["hasAny",["dirt","element","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Dirt is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-0ea0de79","guard":[["hasAny",["element","hold","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of I Hold On is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-1220df0c","guard":[["hasAny",["day","element","item number","longest","longest one","longest word","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Save It For A Rainy Day is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-1493e5db","guard":[["hasAny",["band","element","item number","longest","longest one","longest word","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of One Man Band is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-181f3e2f","guard":[["hasAny",["element","get","item number","longest","longest one","longest word","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Get Me Some of That is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-1b86a511","guard":[["hasAny",["beachin","element","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Beachin' is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-23beb136","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","trouble"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Trouble is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-247166e5","guard":[["hasAny",["craving","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Craving You is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-26222909","guard":[["hasAny",["element","item number","leading zeros","nth","outta","pad","pad with","padded to","position","zero pad"]],["has","tell"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-31a855fc","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","simple"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Simple is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-33460328","guard":[["hasAny",["caught","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Caught Up in the Country is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-3c0cc700","guard":[["hasAny",["characters from","element","item number","letters from to","nth","outta","position","slice of the text","substring"]],["has","tell"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-3ffd5bde","guard":[["hasAny",["element","item number","leading zeros","nth","outta","pad","pad with","padded to","position","zero pad"]],["has","tell"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-40e5ee4c","guard":[["hasAny",["alright","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Everything's Gonna Be Alright is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-4249e427","guard":[["hasAny",["dead","element","item number","nth","position"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Downtown's Dead is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-45bb3bce","guard":[["hasAny",["element","item number","leading zeros","nth","outta","pad","pad with","padded to","position","zero pad"]],["has","tell"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-4c2d3cdb","guard":[["hasAny",["element","hell","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Hell of a Night is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-4d72d170","guard":[["hasAny",["compass","element","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Compass is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-4ff2985c","guard":[["hasAny",["dont","element","item number","longest","longest one","longest word","nth","position"]],["words>=",14]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of It Don't Hurt Like It Used To is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-5198a902","guard":[["hasAny",["crush","element","item number","longest","longest one","longest word","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Girl Crush is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-58f97eb2","guard":[["hasAny",["element","eyes","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Lonely Eyes is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-59181163","guard":[["hasAny",["element","item number","nth","outta","position","separate by","split","split by"]],["has","tell"]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-5c42f06c","guard":[["hasAny",["already","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Already Callin' You Mine is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-5e183bd1","guard":[["hasAny",["characters from","element","item number","letters from to","nth","position","slice of the text","stay","substring"]],["has","song"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-5ed6e1dd","guard":[["hasAny",["boot","element","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of If The Boot Fits is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-5ef79404","guard":[["hasAny",["buy","element","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Buy My Own Dranks is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-60c012c0","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","turnin"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Turnin' Me On is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-6a7dda52","guard":[["hasAny",["babe","element","item number","longest","longest one","longest word","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Babe is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-6b94cbea","guard":[["hasAny",["element","item number","leading zeros","nth","outta","pad","pad with","padded to","position","zero pad"]],["has","tell"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-72ca9203","guard":[["hasAny",["element","holy","item number","longest","longest one","longest word","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of H.O.L.Y. is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-7a7f70db","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","see"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of See You Tonight is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-7b69b622","guard":[["hasAny",["element","item number","legends","longest","longest one","longest word","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Legends is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-7cdd1795","guard":[["hasAny",["element","item number","longest","longest one","longest word","mean","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Mean To Me is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-7f1f4aa0","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","outta","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Outta Style is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-834ac25d","guard":[["hasAny",["changes","element","item number","longest","longest one","longest word","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Life Changes is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-8406f06a","guard":[["hasAny",["element","girls","item number","longest","longest one","longest word","nth","position"]],["has","song"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of God Made Girls is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-895decf1","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","rider"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Shotgun Rider is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-8a20baf9","guard":[["hasAny",["always","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of How I'll Always Be is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-8c833952","guard":[["hasAny",["element","item number","leading zeros","nth","outta","pad","pad with","padded to","position","zero pad"]],["has","tell"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],{"lit":12},["sense.lastWord"]]],"mem":null},
{"id":"n-8ee75efa","guard":[["hasAny",["church","element","item number","longest","longest one","longest word","nth","position"]],["has","my"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of My Church is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-909e43a8","guard":[["hasAny",["delete","element","item number","nth","outta","position","remove","strip out"]],["has","tell"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-9285bdf2","guard":[["hasAny",["came","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Came Here To Forget is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-93e41a9e","guard":[["hasAny",["element","item number","last","longest","longest one","longest word","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Last Shot is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-940a7bac","guard":[["hasAny",["element","goodnight","item number","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Goodnight Kiss is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-94bb148e","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","thought"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Thought About You is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-95e87e11","guard":[["hasAny",["dirty","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Dirty Laundry is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-984f89a2","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","stay"]],["has","song"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Stay is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-985d21d7","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","smooth"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Smooth is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-98a954e5","guard":[["hasAny",["element","ground","item number","longest","longest one","longest word","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of From The Ground Up is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-9bd1c395","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","same"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Still the Same is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-9d39c6c2","guard":[["hasAny",["element","item number","lately","longest","longest one","longest word","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Lovin' Lately is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-9ee0c4c9","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","say"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Say You Do is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-9ff6f23f","guard":[["hasAny",["element","item number","nth","outta","position","separate by","split","split by"]],["has","tell"]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a08f6db7","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","wins"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Love Wins is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-a199228c","guard":[["hasAny",["dance","element","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Slow Dance in a Parking Lot is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-a2a7bc4b","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","real"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Real Life is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-a3be0641","guard":[["hasAny",["element","hate","item number","longest","longest one","longest word","nth","position"]],["has","what"],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of I Hate Love Songs is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-ab09fe2e","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","vice"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Vice is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-ab9ff48d","guard":[["hasAny",["element","hometown","item number","nth","position"]],["has","girl"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Hometown Girl is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-abc54a22","guard":[["hasAny",["dahlonega","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of A Little Dive Bar in Dahlonega is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-ad88a788","guard":[["hasAny",["element","item number","longest","longest one","longest word","met","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of I Met A Girl is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-af8ad04a","guard":[["hasAny",["characters from","element","item number","letters from to","nth","position","slice of the text","stay","substring"]],["has","song"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-b583fa11","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","speechless"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Speechless is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-bd2b7b77","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","tin"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Tin Man is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-c0d28dc3","guard":[["hasAny",["element","fire","item number","longest","longest one","longest word","nth","position"]],["has","writers"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Night's On Fire is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-c1ff1e90","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","told"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of If I Told You is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-c4e0902d","guard":[["hasAny",["come","element","item number","longest","longest one","longest word","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Lights Come On is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-c8b178c2","guard":[["hasAny",["element","good","item number","longest","longest one","longest word","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Good Girl is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-c9d58f24","guard":[["hasAny",["element","heartbeat","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Heartbeat is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-ca111793","guard":[["hasAny",["element","fighter","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Fighter is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-cf30432b","guard":[["hasAny",["amen","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Woman Amen is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-d35acf69","guard":[["hasAny",["child","element","item number","longest","longest one","longest word","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Wild Child is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-d3ed6b29","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","riser"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Riser is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-d7e1a21d","guard":[["hasAny",["doin","element","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Doin' What She Likes is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-d8deeea5","guard":[["hasAny",["drink","element","item number","longest","longest one","longest word","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Fix A Drink is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-dd0a1353","guard":[["hasAny",["chillin","element","item number","longest","longest one","longest word","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Chillin' It is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-de13195f","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","today"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Today is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-df5da86e","guard":[["hasAny",["element","item number","longest","longest one","longest word","nation","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Country Nation is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-e16d3ecd","guard":[["hasAny",["crushin","element","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Crushin It is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-e63184d6","guard":[["hasAny",["element","item number","leading zeros","nth","outta","pad","pad with","padded to","position","zero pad"]],["has","tell"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],{"lit":10},["sense.lastWord"]]],"mem":null},
{"id":"n-ea2580af","guard":[["hasAny",["element","item number","longest","longest one","longest word","make","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Make Me Wanna is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-ebe6f4dd","guard":[["hasAny",["element","item number","nth","outta","position","separate by","split","split by"]],["has","tell"]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-ed07c7fc","guard":[["hasAny",["drunk","element","item number","longest","longest one","longest word","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Drunk On A Plane is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-f356a303","guard":[["hasAny",["element","first","item number","longest","longest one","longest word","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of For The First Time is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-f9017916","guard":[["hasAny",["element","hearts","item number","longest","longest one","longest word","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of More Hearts Than Mine is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-f9aab90f","guard":[["hasAny",["bring","element","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bring It On Over is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-ff67f366","guard":[["hasAny",["break","element","item number","longest","longest one","longest word","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Break On Me is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-4fe02c3b","guard":[["hasAny",["beautiful","element","item number","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Beautiful Drug is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-5cd60909","guard":[["hasAny",["element","item number","nth","position","rednecker"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Rednecker is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-714f6c3c","guard":[["hasAny",["element","item number","nth","position","summertime"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of A Little More Summertime is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-75ca2ca2","guard":[["hasAny",["car","element","item number","nth","position"]],["has","writers"],["has","somewhere"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Somewhere In My Car is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-bee5c1b1","guard":[["hasAny",["criminal","element","item number","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Criminal is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-c6e91aec","guard":[["hasAny",["died","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of I Wish Grandpas Never Died is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-eb8fe7a9","guard":[["hasAny",["element","greatest","item number","nth","position"]],["has","writers"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Greatest Love Story is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-fb240686","guard":[["hasAny",["daughter","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Somebody's Daughter is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"writers"}]],"mem":null},
{"id":"n-2ab3e699","guard":[["hasAny",["element","item number","leading zeros","nth","outta","pad","pad with","padded to","position","zero pad"]],["has","tell"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]]],"mem":null},
{"id":"n-30e3b2ce","guard":[["hasAny",["element","item number","leading zeros","nth","outta","pad","pad with","padded to","position","zero pad"]],["has","tell"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]]],"mem":null},
{"id":"n-4a7392a5","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","outta","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}]],"mem":null},
{"id":"n-dd750a40","guard":[["hasAny",["element","item number","leading zeros","nth","outta","pad","pad with","padded to","position","zero pad"]],["has","tell"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}]]],"mem":null},
{"id":"n-2a015246","guard":[["hasAny",["element","invert case","item number","longest","longest one","longest word","nth","outta","position","swap case","toggle case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}]]],"mem":null},
{"id":"n-a7d980b9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","nth","outta","position","title case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}]]],"mem":null},
{"id":"n-fc0c396b","guard":[["hasAny",["element","item number","longest","longest one","longest word","lower case","lowercase","nth","outta","position","small letters"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lyrics-92d7ec"},{"lit":"song"},{"lit":"artist"}]]],"mem":null},
{"id":"n-00959ea4","guard":[["hasAny",["girl","met","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for I Met A Girl":"The writers of I Met A Girl is Sam Hunt, Trevor Rosen, Shane McAnally."}}},
{"id":"n-0a0a070d","guard":[["has","writers"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for This Is It":"The writers of This Is It is Scotty McCreery, Frank Rogers, Aaron Eshuis."}}},
{"id":"n-0c066083","guard":[["hasAny",["say","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Say You Do":"The writers of Say You Do is Shane McAnally, Matthew Ramsey, Trevor Rosen."}}},
{"id":"n-1040529f","guard":[["hasAny",["alright","everythings","gonna","writers"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Everything's Gonna Be Alright":"The writers of Everything's Gonna Be Alright is David Lee Murphy, Jimmy Yeary, Chris Stevens."}}},
{"id":"n-108d26be","guard":[["hasAny",["mean","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Mean To Me":"The writers of Mean To Me is Brett Eldredge, Scooter Carusoe."}}},
{"id":"n-10f65e50","guard":[["hasAny",["song","vice","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Vice":"The writers of Vice is Miranda Lambert, Josh Osborne, Shane McAnally."}}},
{"id":"n-1135b881","guard":[["hasAny",["fighter","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for The Fighter":"The writers of The Fighter is Keith Urban, busbee."}}},
{"id":"n-15295db8","guard":[["hasAny",["fix","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Fix":"The writers of Fix is Sarah Buxton, Jesse Frasure, Abe Stoklasa."}}},
{"id":"n-1cb8b47f","guard":[["hasAny",["caught","country","song","up","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Caught Up in the Country":"The writers of Caught Up in the Country is Connie Harrington, Jordan Schmidt, Mike Walker."}}},
{"id":"n-1e2e0f9d","guard":[["hasAny",["hell","night","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Hell of a Night":"The writers of Hell of a Night is Zach Crowell, Adam Sanders, Jaron Boyer."}}},
{"id":"n-1f454e44","guard":[["hasAny",["eyes","lonely","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Lonely Eyes":"The writers of Lonely Eyes is Johnny Bulford, Jason Matthews, Laura Veltz."}}},
{"id":"n-222ec720","guard":[["hasAny",["boot","fits","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of If The Boot Fits":"The writers of If The Boot Fits is Jordan Schmidt, Andy Albert, Mitchell Tenpenny."}}},
{"id":"n-234462c7","guard":[["hasAny",["make","wanna","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Make Me Wanna":"The writers of Make Me Wanna is Thomas Rhett, Bart Butler, Larry McCoy."}}},
{"id":"n-24351c76","guard":[["hasAny",["first","time","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for For The First Time":"The writers of For The First Time is Darius Rucker, Derek George, Scooter Carusoe."}}},
{"id":"n-27ba30db","guard":[["hasAny",["life","real","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Real Life":"The writers of Real Life is Shane McAnally, Josh Osborne, Ashley Gorley, Ross Copperman."}}},
{"id":"n-28550e73","guard":[["hasAny",["bank","river","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of River Bank":"The writers of River Bank is Brad Paisley, Kelley Lovelace."}}},
{"id":"n-28f0cbae","guard":[["hasAny",["comin","over","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song I'm Comin Over":"The writers of I'm Comin Over is Corey Crowder, Josh Hoge, Chris Young."}}},
{"id":"n-292e5ae0","guard":[["hasAny",["greatest","love","story","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Greatest Love Story":"The writers of Greatest Love Story is Brandon Lancaster."}}},
{"id":"n-2d21ef23","guard":[["hasAny",["ground","song","up","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song From The Ground Up":"The writers of From The Ground Up is Dan Smyers, Shay Mooney, Chris DeStefano."}}},
{"id":"n-2d22168d","guard":[["hasAny",["chillin","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Chillin' It":"The writers of Chillin' It is Cole Swindell, Shane Minor."}}},
{"id":"n-34a19703","guard":[["hasAny",["crush","girl","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Girl Crush":"The writers of Girl Crush is Lori McKenna, Hillary Lindsey, Liz Rose."}}},
{"id":"n-4131c145","guard":[["hasAny",["legends","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Legends":"The writers of Legends is Kelsea Ballerini, Hillary Lindsey, Forest Glen Whitehead."}}},
{"id":"n-461af6d4","guard":[["hasAny",["simple","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Simple":"The writers of Simple is Tyler Hubbard, Brian Kelley, Hardy, Mark Holman."}}},
{"id":"n-4694bf58","guard":[["hasAny",["girl","good","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Good Girl":"The writers of Good Girl is Dustin Lynch, Justin Ebach, Andy Albert."}}},
{"id":"n-49611ce8","guard":[["hasAny",["died","grandpas","never","wish","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of I Wish Grandpas Never Died":"The writers of I Wish Grandpas Never Died is Riley Green, Buford Green, Lendon Bonds."}}},
{"id":"n-4a510096","guard":[["hasAny",["about","girl","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Song About A Girl":"The writers of Song About A Girl is Eric Paslay, Jessi Alexander, Gordie Sampson."}}},
{"id":"n-4b812768","guard":[["hasAny",["love","song","wins","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Love Wins":"The writers of Love Wins is Carrie Underwood, Brett James, David Garcia."}}},
{"id":"n-560ddfc2","guard":[["hasAny",["rednecker","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Rednecker":"The writers of Rednecker is HARDY, Jordan Schmidt, Andy Albert."}}},
{"id":"n-59ee1b51","guard":[["hasAny",["about","thought","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Thought About You":"The writers of Thought About You is Brad Warren, Brett Warren, Lee Thomas Miller."}}},
{"id":"n-5a0fa4c4","guard":[["hasAny",["little","more","summertime","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of A Little More Summertime":"The writers of A Little More Summertime is Jerry Flowers, Tony Martin, Wendell Mobley."}}},
{"id":"n-5c821981","guard":[["hasAny",["bar","dahlonega","dive","little","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for A Little Dive Bar in Dahlonega":"The writers of A Little Dive Bar in Dahlonega is Ashley McBryde, Nicolette Hayford, Jesse Rice."}}},
{"id":"n-5d4df1c4","guard":[["hasAny",["hearts","mine","more","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song More Hearts Than Mine":"The writers of More Hearts Than Mine is Ingrid Andress, Sam Ellis, Derrick Southerland."}}},
{"id":"n-5f990647","guard":[["hasAny",["song","told","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song If I Told You":"The writers of If I Told You is Ross Copperman, Shane McAnally, Jon Nite."}}},
{"id":"n-5fd9e822","guard":[["hasAny",["heartbeat","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Heartbeat":"The writers of Heartbeat is Carrie Underwood, Zach Crowell, Ashley Gorley."}}},
{"id":"n-62f39584","guard":[["hasAny",["better","boots","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Better In Boots":"The writers of Better In Boots is Naomi Cook,e Justin Wilson, Dave Pittenger."}}},
{"id":"n-6315bed0","guard":[["hasAny",["buy","dranks","own","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Buy My Own Dranks":"The writers of Buy My Own Dranks is Naomi Cooke, Josh Kear, Hillary Lindsey, Hannah Mullholand, Jennifer Wayne."}}},
{"id":"n-68d02b05","guard":[["hasAny",["doin","likes","she","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Doin' What She Likes":"The writers of Doin' What She Likes is Philip O'donnell, Wade Kirby."}}},
{"id":"n-68ddcd5c","guard":[["hasAny",["country","nation","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Country Nation":"The writers of Country Nation is Brad Paisley, Chris DuBois, Kelley Lovelace."}}},
{"id":"n-68f02da0","guard":[["hasAny",["daughter","somebodys","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Somebody's Daughter":"The writers of Somebody's Daughter is Tenille Townes, Barry Dean, Luke Laird."}}},
{"id":"n-6954cb01","guard":[["hasAny",["drunk","plane","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Drunk On A Plane":"The writers of Drunk On A Plane is Dierks Bentley, Chris Tompkins, Josh Kear."}}},
{"id":"n-6a38587f","guard":[["hasAny",["bring","over","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Bring It On Over":"The writers of Bring It On Over is Dallas Davidson, Ben Hayslip, Jesse Frasure, Rhett Akins."}}},
{"id":"n-6d36bd10","guard":[["hasAny",["changes","life","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Life Changes":"The writers of Life Changes is Thomas Rhett, Rhett Akins, Ashley Gorley, Jesse Frasure."}}},
{"id":"n-6ff4cc37","guard":[["hasAny",["song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Some of It":"The writers of Some of It is Eric Church, Jeff Hyde, Clint Daniels, Bobby Pinson."}}},
{"id":"n-7047a664","guard":[["hasAny",["dirt","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Dirt":"The writers of Dirt is Rodney Clawson, Chris Tompkins."}}},
{"id":"n-72e2db9d","guard":[["hasAny",["fire","nights","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Night's On Fire":"The writers of Night's On Fire is Jonathan Singleton, Deric Ruttan."}}},
{"id":"n-76d4fc6c","guard":[["hasAny",["amen","woman","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Woman Amen":"The writers of Woman Amen is Dierks Bentley, Josh Kear, Ross Copperman."}}},
{"id":"n-76fbe243","guard":[["hasAny",["break","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Break On Me":"The writers of Break On Me is Ross Copperman, Jon Nite."}}},
{"id":"n-783c6c8e","guard":[["hasAny",["dead","downtowns","writers"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Downtown's Dead":"The writers of Downtown's Dead is Sam Hunt, Zach Crowell, Shane McAnally, Josh Osborne, Charlie Handsome."}}},
{"id":"n-7aa574cf","guard":[["hasAny",["riser","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Riser":"The writers of Riser is Travis Meadows, Steve Moakler."}}},
{"id":"n-7d45d6f6","guard":[["hasAny",["see","tonight","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for See You Tonight":"The writers of See You Tonight is Ashley Gorley, Zach Crowell, Scotty Mccreery, Miller Crowell."}}},
{"id":"n-80d6d5c9","guard":[["hasAny",["song","stay","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Stay":"The writers of Stay is Joey Moi."}}},
{"id":"n-82137941","guard":[["hasAny",["day","rainy","save","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Save It For A Rainy Day":"The writers of Save It For A Rainy Day is Andrew Dorff, Matthew Ramsey, Brad Tursi."}}},
{"id":"n-86260037","guard":[["hasAny",["lately","lovin","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Lovin' Lately":"The writers of Lovin' Lately is Big Kenny, John Rich, Tim McGraw."}}},
{"id":"n-89d0fd2a","guard":[["hasAny",["turnin","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Turnin' Me On":"The writers of Turnin' Me On is Blake Shelton, Josh Osborne, Jessi Alexander."}}},
{"id":"n-8a82c7d1","guard":[["hasAny",["outta","song","style","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Outta Style":"The writers of Outta Style is Aaron Watson."}}},
{"id":"n-8e3ec0e2","guard":[["hasAny",["today","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Today":"The writers of Today is Brad Paisley, Chris DuBois, Ashley Gorley."}}},
{"id":"n-90f765d8","guard":[["hasAny",["girls","god","made","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song God Made Girls":"The writers of God Made Girls is RaeLynn, Nicolle Galyon, Lori McKenna, Liz Rose."}}},
{"id":"n-986dd806","guard":[["hasAny",["goodnight","kiss","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Goodnight Kiss":"The writers of Goodnight Kiss is Rob Hatch, Jason Sellers, Randy Houser."}}},
{"id":"n-9ae278e7","guard":[["hasAny",["beautiful","drug","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Beautiful Drug":"The writers of Beautiful Drug is Zac Brown, Niko Moon."}}},
{"id":"n-9df82b36","guard":[["hasAny",["dirty","laundry","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Dirty Laundry":"The writers of Dirty Laundry is Zach Crowell, Ashley Gorley, Hillary Lindsey."}}},
{"id":"n-9e0ec625","guard":[["hasAny",["boots","head","over","writers"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Head Over Boots":"The writers of Head Over Boots is Jon Pardi, Luke Laird."}}},
{"id":"n-9f116978","guard":[["hasAny",["came","forget","here","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Came Here To Forget":"The writers of Came Here To Forget is Deric Ruttan, Craig Wiseman."}}},
{"id":"n-9f9762d0","guard":[["hasAny",["hold","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of I Hold On":"The writers of I Hold On is Brett James, Dierks Bentley."}}},
{"id":"n-9f9cfb27","guard":[["hasAny",["girl","hometown","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Hometown Girl":"The writers of Hometown Girl is Marc Beeson, Daniel Tashian."}}},
{"id":"n-a37da194","guard":[["hasAny",["better","man","writers"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Better Man":"The writers of Better Man is Taylor Swift."}}},
{"id":"n-a48b3437","guard":[["hasAny",["church","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song My Church":"The writers of My Church is busbee, Maren Morris."}}},
{"id":"n-a85be064","guard":[["hasAny",["last","shot","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Last Shot":"The writers of Last Shot is Kip Moore, Dan Couch, David Lee Murphy."}}},
{"id":"n-a9dc4df8","guard":[["hasAny",["holy","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of H.O.L.Y.":"The writers of H.O.L.Y. is busbee, Nate Cyphert, William Wiik Larsen."}}},
{"id":"n-ab21af86","guard":[["hasAny",["kiss","tonight","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Kiss You Tonight":"The writers of Kiss You Tonight is David Cook, Jay Knowles, Trent Summar."}}},
{"id":"n-abea3855","guard":[["hasAny",["hate","love","songs","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of I Hate Love Songs":"The writers of I Hate Love Songs is Kelsea Ballerini, Shane McAnally, Trevor Rosen."}}},
{"id":"n-ae245d46","guard":[["hasAny",["craving","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Craving You":"The writers of Craving You is Dave Barnes, Julian Bunetta."}}},
{"id":"n-ae8aa2ae","guard":[["hasAny",["come","lights","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Lights Come On":"The writers of Lights Come On is Brian Kelley, Tyler Hubbard, Jordan Schmidt, Jimmy Robbins, Brad Warren, Brett Warren."}}},
{"id":"n-b117d57c","guard":[["hasAny",["get","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Get Me Some of That":"The writers of Get Me Some of That is Rhett Akins, Michael Carter, Cole Swindell."}}},
{"id":"n-b2bddd2b","guard":[["hasAny",["man","tin","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Tin Man":"The writers of Tin Man is Miranda Lambert, Jack Ingram, Jon Randall."}}},
{"id":"n-b2d5b303","guard":[["hasAny",["smooth","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Smooth":"The writers of Smooth is Tyler Hubbard, Brian Kelley, Nicolle Galyon, Jordan Schmidt."}}},
{"id":"n-b3938113","guard":[["hasAny",["light","up","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Light It Up":"The writers of Light It Up is Luke Bryan, Brad Tursi."}}},
{"id":"n-b51d566a","guard":[["hasAny",["beachin","writers"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Beachin'":"The writers of Beachin' is Jaren Johnston, Jon Nite, Jimmy Robbins."}}},
{"id":"n-b68ec54b","guard":[["hasAny",["bar","dive","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Dive Bar":"The writers of Dive Bar is Garth Brooks, Bryan Kennedy, Mitch Rossell."}}},
{"id":"n-bc6508f9","guard":[["hasAny",["song","wanna","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Wanna Be That Song":"The writers of Wanna Be That Song is Brett Eldredge, Ross Copperman, Scooter Carusoe."}}},
{"id":"n-bda6afb3","guard":[["hasAny",["song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song 19 You + Me":"The writers of 19 You + Me is Dan Smyers, Shay Mooney, Danny Orton."}}},
{"id":"n-bde4f097","guard":[["hasAny",["babe","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Babe":"The writers of Babe is Taylor Swift, Patrick Monahan."}}},
{"id":"n-c0af4ccb","guard":[["hasAny",["same","still","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Still the Same":"The writers of Still the Same is Jennifer Nettles, Kristian Bush."}}},
{"id":"n-c46fe1e1","guard":[["hasAny",["trouble","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Trouble":"The writers of Trouble is Rachel Reinert, Mike Gossin, Ross Copperman, Jon Nite."}}},
{"id":"n-ce37451d","guard":[["hasAny",["compass","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Compass":"The writers of Compass is Mikkel Eriksen, Tor Erik Hemransen, Ammar Malik, Ross Golan, Daniel Omelio, Emile Haynie."}}},
{"id":"n-d1a7c465","guard":[["hasAny",["crushin","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Crushin It":"The writers of Crushin It is Brad Paisley, Kelley Lovelace, Lee Thomas Miller."}}},
{"id":"n-d5e2fd35","guard":[["hasAny",["girl","lookin","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Lookin For That Girl":"The writers of Lookin For That Girl is Mark Irwin, James T. Slater, Chris Tompkins."}}},
{"id":"n-d779fd37","guard":[["hasAny",["dont","hurt","like","song","used","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song It Don't Hurt Like It Used To":"The writers of It Don't Hurt Like It Used To is Billy Currington, Cary Barlowe, Shy Carter."}}},
{"id":"n-db490860","guard":[["hasAny",["life","love","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song I Love This Life":"The writers of I Love This Life is Danny Myrick, Chris Janson, Chris Lucas, Preston Brust."}}},
{"id":"n-dc0db8d6","guard":[["hasAny",["speechless","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Speechless":"The writers of Speechless is Dan Smyers, Shay Mooney, Jordan Reynolds, Laura Veltz."}}},
{"id":"n-e20e300f","guard":[["hasAny",["criminal","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Criminal":"The writers of Criminal is Lindsay Ell, Fred Wilhelm, Chris Stevens."}}},
{"id":"n-e56dd102","guard":[["hasAny",["already","callin","mine","song","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Already Callin' You Mine":"The writers of Already Callin' You Mine is Matt Thomas, Scott Thomas, Barry Knox, Phil O'Donnell, Wade Kirby."}}},
{"id":"n-e6e86076","guard":[["hasAny",["car","somewhere","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Somewhere In My Car":"The writers of Somewhere In My Car is Keith Urban, J.T. Harding."}}},
{"id":"n-e8040e51","guard":[["hasAny",["child","wild","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Wild Child":"The writers of Wild Child is Kenny Chesney, Shane McAnally, Josh Osborne."}}},
{"id":"n-ee8dcdf1","guard":[["hasAny",["always","ill","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of How I'll Always Be":"The writers of How I'll Always Be is Chris Janson, Jamie Paulin, Jeremy Stover."}}},
{"id":"n-f4ea67b6","guard":[["hasAny",["drink","fix","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Fix A Drink":"The writers of Fix A Drink is Chris Janson, Chris DuBois, Ashley Gorley."}}},
{"id":"n-f5ab366b","guard":[["hasAny",["rider","shotgun","writers"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the writers of Shotgun Rider":"The writers of Shotgun Rider is Marv Green, Hillary Lindsey, Troy Verges."}}},
{"id":"n-fb45506b","guard":[["hasAny",["dance","lot","parking","slow","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for Slow Dance in a Parking Lot":"The writers of Slow Dance in a Parking Lot is Jordan Davis, Lonnie Fowler."}}},
{"id":"n-fb6b6a5a","guard":[["hasAny",["band","man","one","writers"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the writers for One Man Band":"The writers of One Man Band is Matthew Ramsey, Trevor Rosen, Brad Tursi, Josh Osborne."}}},
{"id":"n-c5012d70","guard":[["hasAny",["about","always","amen","babe","bank","bar","beautiful","boot","break","buy","came","car","child","chillin","church","come","compass","country","craving","criminal","crush","crushin","dance","daughter","day","died","dirty","doin","dont","eyes","fighter","fire","first","fix","get","girls","good","heartbeat","hell","hold","holy","hometown","it","kiss","last","lately","legends","life","little","lookin","love","mean","met","mine","outta","rednecker","riser","same","say","simple","smooth","speechless","today","told","tonight","trouble","turnin","up","vice","wanna"]],["has","writers"],["not",["has","name"]],["not",["has","are"]],["not",["has","back"]],["not",["has","got"]],["not",["has","morning"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Thought About You":"The writers of Thought About You is Brad Warren, Brett Warren, Lee Thomas Miller.","what is the writers of I Hold On":"The writers of I Hold On is Brett James, Dierks Bentley.","what is the writers of Somewhere In My Car":"The writers of Somewhere In My Car is Keith Urban, J.T. Harding.","give the writers for Turnin' Me On":"The writers of Turnin' Me On is Blake Shelton, Josh Osborne, Jessi Alexander.","give the writers for I Met A Girl":"The writers of I Met A Girl is Sam Hunt, Trevor Rosen, Shane McAnally.","tell me the writers of the song Caught Up in the Country":"The writers of Caught Up in the Country is Connie Harrington, Jordan Schmidt, Mike Walker.","give the writers for Girl":"The writers of Girl is Maren Morris, Greg Kurstin, Sarah Aarons.","what is the writers of Say You Do":"The writers of Say You Do is Shane McAnally, Matthew Ramsey, Trevor Rosen.","what is the writers of Hell of a Night":"The writers of Hell of a Night is Zach Crowell, Adam Sanders, Jaron Boyer.","tell me the writers of the song God Made Girls":"The writers of God Made Girls is RaeLynn, Nicolle Galyon, Lori McKenna, Liz Rose.","give the writers for Mean To Me":"The writers of Mean To Me is Brett Eldredge, Scooter Carusoe.","tell me the writers of the song Criminal":"The writers of Criminal is Lindsay Ell, Fred Wilhelm, Chris Stevens.","tell me the writers of the song If I Told You":"The writers of If I Told You is Ross Copperman, Shane McAnally, Jon Nite.","what is the writers of H.O.L.Y.":"The writers of H.O.L.Y. is busbee, Nate Cyphert, William Wiik Larsen.","give the writers for Simple":"The writers of Simple is Tyler Hubbard, Brian Kelley, Hardy, Mark Holman.","give the writers for Babe":"The writers of Babe is Taylor Swift, Patrick Monahan.","what is the writers of Night's On Fire":"The writers of Night's On Fire is Jonathan Singleton, Deric Ruttan.","what is the writers of Shotgun Rider":"The writers of Shotgun Rider is Marv Green, Hillary Lindsey, Troy Verges.","what is the writers of Buy My Own Dranks":"The writers of Buy My Own Dranks is Naomi Cooke, Josh Kear, Hillary Lindsey, Hannah Mullholand, Jennifer Wayne.","what is the writers of Make Me Wanna":"The writers of Make Me Wanna is Thomas Rhett, Bart Butler, Larry McCoy.","what is the writers of Better Man":"The writers of Better Man is Taylor Swift.","give the writers for Everything's Gonna Be Alright":"The writers of Everything's Gonna Be Alright is David Lee Murphy, Jimmy Yeary, Chris Stevens.","give the writers for For The First Time":"The writers of For The First Time is Darius Rucker, Derek George, Scooter Carusoe.","give the writers for Save It For A Rainy Day":"The writers of Save It For A Rainy Day is Andrew Dorff, Matthew Ramsey, Brad Tursi.","what is the writers of Bring It On Over":"The writers of Bring It On Over is Dallas Davidson, Ben Hayslip, Jesse Frasure, Rhett Akins.","tell me the writers of the song More Hearts Than Mine":"The writers of More Hearts Than Mine is Ingrid Andress, Sam Ellis, Derrick Southerland.","tell me the writers of the song Break On Me":"The writers of Break On Me is Ross Copperman, Jon Nite.","tell me the writers of the song Life Changes":"The writers of Life Changes is Thomas Rhett, Rhett Akins, Ashley Gorley, Jesse Frasure.","what is the writers of I Wish Grandpas Never Died":"The writers of I Wish Grandpas Never Died is Riley Green, Buford Green, Lendon Bonds.","tell me the writers of the song From The Ground Up":"The writers of From The Ground Up is Dan Smyers, Shay Mooney, Chris DeStefano.","give the writers for Woman Amen":"The writers of Woman Amen is Dierks Bentley, Josh Kear, Ross Copperman.","what is the writers of Tin Man":"The writers of Tin Man is Miranda Lambert, Jack Ingram, Jon Randall.","tell me the writers of the song I Love This Life":"The writers of I Love This Life is Danny Myrick, Chris Janson, Chris Lucas, Preston Brust.","tell me the writers of the song Lookin For That Girl":"The writers of Lookin For That Girl is Mark Irwin, James T. Slater, Chris Tompkins.","what is the writers of Smooth":"The writers of Smooth is Tyler Hubbard, Brian Kelley, Nicolle Galyon, Jordan Schmidt.","what is the writers of Came Here To Forget":"The writers of Came Here To Forget is Deric Ruttan, Craig Wiseman.","give the writers for Wanna Be That Song":"The writers of Wanna Be That Song is Brett Eldredge, Ross Copperman, Scooter Carusoe.","give the writers for Real Life":"The writers of Real Life is Shane McAnally, Josh Osborne, Ashley Gorley, Ross Copperman.","give the writers for Dirt":"The writers of Dirt is Rodney Clawson, Chris Tompkins.","give the writers for See You Tonight":"The writers of See You Tonight is Ashley Gorley, Zach Crowell, Scotty Mccreery, Miller Crowell.","tell me the writers of the song Lights Come On":"The writers of Lights Come On is Brian Kelley, Tyler Hubbard, Jordan Schmidt, Jimmy Robbins, Brad Warren, Brett Warren.","give the writers for Riser":"The writers of Riser is Travis Meadows, Steve Moakler.","what is the writers of How I'll Always Be":"The writers of How I'll Always Be is Chris Janson, Jamie Paulin, Jeremy Stover.","give the writers for Beachin'":"The writers of Beachin' is Jaren Johnston, Jon Nite, Jimmy Robbins.","give the writers for A Little Dive Bar in Dahlonega":"The writers of A Little Dive Bar in Dahlonega is Ashley McBryde, Nicolette Hayford, Jesse Rice.","what is the writers of Still the Same":"The writers of Still the Same is Jennifer Nettles, Kristian Bush.","tell me the writers of the song Stay":"The writers of Stay is Joey Moi.","tell me the writers of the song Last Shot":"The writers of Last Shot is Kip Moore, Dan Couch, David Lee Murphy.","what is the writers of Heartbeat":"The writers of Heartbeat is Carrie Underwood, Zach Crowell, Ashley Gorley.","what is the writers of Light It Up":"The writers of Light It Up is Luke Bryan, Brad Tursi.","what is the writers of Get Me Some of That":"The writers of Get Me Some of That is Rhett Akins, Michael Carter, Cole Swindell.","give the writers for Goodnight Kiss":"The writers of Goodnight Kiss is Rob Hatch, Jason Sellers, Randy Houser.","give the writers for Speechless":"The writers of Speechless is Dan Smyers, Shay Mooney, Jordan Reynolds, Laura Veltz.","give the writers for Hometown Girl":"The writers of Hometown Girl is Marc Beeson, Daniel Tashian.","give the writers for Wild Child":"The writers of Wild Child is Kenny Chesney, Shane McAnally, Josh Osborne.","tell me the writers of the song Craving You":"The writers of Craving You is Dave Barnes, Julian Bunetta.","tell me the writers of the song Good Girl":"The writers of Good Girl is Dustin Lynch, Justin Ebach, Andy Albert.","give the writers for My Girl":"The writers of My Girl is Dylan Scott, Josh Kerr.","what is the writers of If The Boot Fits":"The writers of If The Boot Fits is Jordan Schmidt, Andy Albert, Mitchell Tenpenny.","give the writers for Crushin It":"The writers of Crushin It is Brad Paisley, Kelley Lovelace, Lee Thomas Miller.","tell me the writers of the song Love Wins":"The writers of Love Wins is Carrie Underwood, Brett James, David Garcia.","tell me the writers of the song Fix":"The writers of Fix is Sarah Buxton, Jesse Frasure, Abe Stoklasa.","what is the writers of Fix A Drink":"The writers of Fix A Drink is Chris Janson, Chris DuBois, Ashley Gorley.","tell me the writers of the song Rednecker":"The writers of Rednecker is HARDY, Jordan Schmidt, Andy Albert.","what is the writers of Kiss You Tonight":"The writers of Kiss You Tonight is David Cook, Jay Knowles, Trent Summar.","what is the writers of Lovin' Lately":"The writers of Lovin' Lately is Big Kenny, John Rich, Tim McGraw.","give the writers for Head Over Boots":"The writers of Head Over Boots is Jon Pardi, Luke Laird.","tell me the writers of the song Beautiful Drug":"The writers of Beautiful Drug is Zac Brown, Niko Moon.","what is the writers of Greatest Love Story":"The writers of Greatest Love Story is Brandon Lancaster.","tell me the writers of the song Chillin' It":"The writers of Chillin' It is Cole Swindell, Shane Minor.","tell me the writers of the song Outta Style":"The writers of Outta Style is Aaron Watson.","tell me the writers of the song Somebody's Daughter":"The writers of Somebody's Daughter is Tenille Townes, Barry Dean, Luke Laird.","tell me the writers of the song Girl Crush":"The writers of Girl Crush is Lori McKenna, Hillary Lindsey, Liz Rose.","what is the writers of I Hate Love Songs":"The writers of I Hate Love Songs is Kelsea Ballerini, Shane McAnally, Trevor Rosen.","tell me the writers of the song Song About A Girl":"The writers of Song About A Girl is Eric Paslay, Jessi Alexander, Gordie Sampson.","what is the writers of A Little More Summertime":"The writers of A Little More Summertime is Jerry Flowers, Tony Martin, Wendell Mobley.","give the writers for This Is It":"The writers of This Is It is Scotty McCreery, Frank Rogers, Aaron Eshuis.","give the writers for The Fighter":"The writers of The Fighter is Keith Urban, busbee.","tell me the writers of the song Vice":"The writers of Vice is Miranda Lambert, Josh Osborne, Shane McAnally.","give the writers for Doin' What She Likes":"The writers of Doin' What She Likes is Philip O'donnell, Wade Kirby.","give the writers for Compass":"The writers of Compass is Mikkel Eriksen, Tor Erik Hemransen, Ammar Malik, Ross Golan, Daniel Omelio, Emile Haynie.","what is the writers of Legends":"The writers of Legends is Kelsea Ballerini, Hillary Lindsey, Forest Glen Whitehead.","give the writers for Slow Dance in a Parking Lot":"The writers of Slow Dance in a Parking Lot is Jordan Davis, Lonnie Fowler.","what is the writers of Trouble":"The writers of Trouble is Rachel Reinert, Mike Gossin, Ross Copperman, Jon Nite.","give the writers for Dive Bar":"The writers of Dive Bar is Garth Brooks, Bryan Kennedy, Mitch Rossell.","what is the writers of Dirty Laundry":"The writers of Dirty Laundry is Zach Crowell, Ashley Gorley, Hillary Lindsey.","tell me the writers of the song It Don't Hurt Like It Used To":"The writers of It Don't Hurt Like It Used To is Billy Currington, Cary Barlowe, Shy Carter.","tell me the writers of the song I'm Comin Over":"The writers of I'm Comin Over is Corey Crowder, Josh Hoge, Chris Young.","give the writers for One Man Band":"The writers of One Man Band is Matthew Ramsey, Trevor Rosen, Brad Tursi, Josh Osborne.","tell me the writers of the song Already Callin' You Mine":"The writers of Already Callin' You Mine is Matt Thomas, Scott Thomas, Barry Knox, Phil O'Donnell, Wade Kirby.","what is the writers of Better In Boots":"The writers of Better In Boots is Naomi Cook,e Justin Wilson, Dave Pittenger.","give the writers for Downtown's Dead":"The writers of Downtown's Dead is Sam Hunt, Zach Crowell, Shane McAnally, Josh Osborne, Charlie Handsome.","tell me the writers of the song Drunk On A Plane":"The writers of Drunk On A Plane is Dierks Bentley, Chris Tompkins, Josh Kear.","tell me the writers of the song Country Nation":"The writers of Country Nation is Brad Paisley, Chris DuBois, Kelley Lovelace.","give the writers for Today":"The writers of Today is Brad Paisley, Chris DuBois, Ashley Gorley.","what is the writers of Lonely Eyes":"The writers of Lonely Eyes is Johnny Bulford, Jason Matthews, Laura Veltz.","tell me the writers of the song My Church":"The writers of My Church is busbee, Maren Morris.","tell me the writers of the song Some of It":"The writers of Some of It is Eric Church, Jeff Hyde, Clint Daniels, Bobby Pinson.","what is the writers of River Bank":"The writers of River Bank is Brad Paisley, Kelley Lovelace."}}},
{"id":"n-03ae13e0","guard":[["hasAny",["child","wild","writers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Wild Child":"The writers of Wild Child is Kenny Chesney, Shane McAnally, Josh Osborne."}}},
{"id":"n-0447e267","guard":[["hasAny",["dahlonega","little"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for A Little Dive Bar in Dahlonega":"The writers of A Little Dive Bar in Dahlonega is Ashley McBryde, Nicolette Hayford, Jesse Rice."}}},
{"id":"n-04736d0c","guard":[["has","criminal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Criminal":"The writers of Criminal is Lindsay Ell, Fred Wilhelm, Chris Stevens."}}},
{"id":"n-0b887173","guard":[["hasAny",["daughter","somebodys"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Somebody's Daughter":"The writers of Somebody's Daughter is Tenille Townes, Barry Dean, Luke Laird."}}},
{"id":"n-0c2782c9","guard":[["hasAny",["amen","woman","writers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Woman Amen":"The writers of Woman Amen is Dierks Bentley, Josh Kear, Ross Copperman."}}},
{"id":"n-10f48fcb","guard":[["has","today"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Today":"The writers of Today is Brad Paisley, Chris DuBois, Ashley Gorley."}}},
{"id":"n-118c1dac","guard":[["has","changes"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Life Changes":"The writers of Life Changes is Thomas Rhett, Rhett Akins, Ashley Gorley, Jesse Frasure."}}},
{"id":"n-1250c138","guard":[["has","beachin"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Beachin'":"The writers of Beachin' is Jaren Johnston, Jon Nite, Jimmy Robbins."}}},
{"id":"n-1285126a","guard":[["has","church"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song My Church":"The writers of My Church is busbee, Maren Morris."}}},
{"id":"n-15905c74","guard":[["has","boots"],["has","better"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Better In Boots":"The writers of Better In Boots is Naomi Cook,e Justin Wilson, Dave Pittenger."}}},
{"id":"n-15ea7ea7","guard":[["hasAny",["already","callin","mine","song","writers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Already Callin' You Mine":"The writers of Already Callin' You Mine is Matt Thomas, Scott Thomas, Barry Knox, Phil O'Donnell, Wade Kirby."}}},
{"id":"n-17f1df8e","guard":[["hasAny",["car","somewhere","writers"]],["has","writers"],["has","somewhere"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Somewhere In My Car":"The writers of Somewhere In My Car is Keith Urban, J.T. Harding."}}},
{"id":"n-189df02d","guard":[["has","lookin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Lookin For That Girl":"The writers of Lookin For That Girl is Mark Irwin, James T. Slater, Chris Tompkins."}}},
{"id":"n-1bf971a0","guard":[["hasAny",["band","man","one","writers"]],["has","writers"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for One Man Band":"The writers of One Man Band is Matthew Ramsey, Trevor Rosen, Brad Tursi, Josh Osborne."}}},
{"id":"n-223ef382","guard":[["has","caught"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Caught Up in the Country":"The writers of Caught Up in the Country is Connie Harrington, Jordan Schmidt, Mike Walker."}}},
{"id":"n-240e1631","guard":[["has","heartbeat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Heartbeat":"The writers of Heartbeat is Carrie Underwood, Zach Crowell, Ashley Gorley."}}},
{"id":"n-243d2613","guard":[["hasAny",["lately","lovin","writers"]],["has","writers"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Lovin' Lately":"The writers of Lovin' Lately is Big Kenny, John Rich, Tim McGraw."}}},
{"id":"n-2450b60b","guard":[["hasAny",["dead","downtowns","writers"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Downtown's Dead":"The writers of Downtown's Dead is Sam Hunt, Zach Crowell, Shane McAnally, Josh Osborne, Charlie Handsome."}}},
{"id":"n-248a0b7a","guard":[["hasAny",["died","grandpas","never","wish","writers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of I Wish Grandpas Never Died":"The writers of I Wish Grandpas Never Died is Riley Green, Buford Green, Lendon Bonds."}}},
{"id":"n-268c949f","guard":[["has","holy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of H.O.L.Y.":"The writers of H.O.L.Y. is busbee, Nate Cyphert, William Wiik Larsen."}}},
{"id":"n-2e7079fb","guard":[["has","say"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Say You Do":"The writers of Say You Do is Shane McAnally, Matthew Ramsey, Trevor Rosen."}}},
{"id":"n-30c7080f","guard":[["hasAny",["last","shot"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Last Shot":"The writers of Last Shot is Kip Moore, Dan Couch, David Lee Murphy."}}},
{"id":"n-353f679c","guard":[["hasAny",["fire","nights","writers"]],["has","writers"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Night's On Fire":"The writers of Night's On Fire is Jonathan Singleton, Deric Ruttan."}}},
{"id":"n-3676ac5e","guard":[["hasAny",["hate","love","songs","writers"]],["has","writers"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of I Hate Love Songs":"The writers of I Hate Love Songs is Kelsea Ballerini, Shane McAnally, Trevor Rosen."}}},
{"id":"n-396275ca","guard":[["has","trouble"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Trouble":"The writers of Trouble is Rachel Reinert, Mike Gossin, Ross Copperman, Jon Nite."}}},
{"id":"n-3a55e27b","guard":[["has","smooth"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Smooth":"The writers of Smooth is Tyler Hubbard, Brian Kelley, Nicolle Galyon, Jordan Schmidt."}}},
{"id":"n-3cbb4645","guard":[["hasAny",["day","rainy","save","writers"]],["has","writers"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Save It For A Rainy Day":"The writers of Save It For A Rainy Day is Andrew Dorff, Matthew Ramsey, Brad Tursi."}}},
{"id":"n-4097bb9f","guard":[["has","crushin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Crushin It":"The writers of Crushin It is Brad Paisley, Kelley Lovelace, Lee Thomas Miller."}}},
{"id":"n-4374035f","guard":[["has","break"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Break On Me":"The writers of Break On Me is Ross Copperman, Jon Nite."}}},
{"id":"n-446a1fa1","guard":[["hasAny",["came","forget","here","writers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Came Here To Forget":"The writers of Came Here To Forget is Deric Ruttan, Craig Wiseman."}}},
{"id":"n-4818b88d","guard":[["has","crush"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Girl Crush":"The writers of Girl Crush is Lori McKenna, Hillary Lindsey, Liz Rose."}}},
{"id":"n-48f62f2e","guard":[["has","legends"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Legends":"The writers of Legends is Kelsea Ballerini, Hillary Lindsey, Forest Glen Whitehead."}}},
{"id":"n-50dcafcb","guard":[["hasAny",["same","still","writers"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Still the Same":"The writers of Still the Same is Jennifer Nettles, Kristian Bush."}}},
{"id":"n-548be4cd","guard":[["hasAny",["doin","likes","she","writers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Doin' What She Likes":"The writers of Doin' What She Likes is Philip O'donnell, Wade Kirby."}}},
{"id":"n-5999d981","guard":[["hasAny",["about","thought","writers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Thought About You":"The writers of Thought About You is Brad Warren, Brett Warren, Lee Thomas Miller."}}},
{"id":"n-5bdc723c","guard":[["hasAny",["always","ill","writers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of How I'll Always Be":"The writers of How I'll Always Be is Chris Janson, Jamie Paulin, Jeremy Stover."}}},
{"id":"n-5c0888a7","guard":[["hasAny",["hell","night","writers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Hell of a Night":"The writers of Hell of a Night is Zach Crowell, Adam Sanders, Jaron Boyer."}}},
{"id":"n-5d2ffa7b","guard":[["has","speechless"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Speechless":"The writers of Speechless is Dan Smyers, Shay Mooney, Jordan Reynolds, Laura Veltz."}}},
{"id":"n-605402c6","guard":[["has","turnin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Turnin' Me On":"The writers of Turnin' Me On is Blake Shelton, Josh Osborne, Jessi Alexander."}}},
{"id":"n-60fbb79a","guard":[["has","about"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Song About A Girl":"The writers of Song About A Girl is Eric Paslay, Jessi Alexander, Gordie Sampson."}}},
{"id":"n-644e0167","guard":[["hasAny",["bring","over","writers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Bring It On Over":"The writers of Bring It On Over is Dallas Davidson, Ben Hayslip, Jesse Frasure, Rhett Akins."}}},
{"id":"n-6c7c62cd","guard":[["hasAny",["dirty","laundry","writers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Dirty Laundry":"The writers of Dirty Laundry is Zach Crowell, Ashley Gorley, Hillary Lindsey."}}},
{"id":"n-6cb08321","guard":[["hasAny",["eyes","lonely","writers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Lonely Eyes":"The writers of Lonely Eyes is Johnny Bulford, Jason Matthews, Laura Veltz."}}},
{"id":"n-6edff42c","guard":[["has","hometown"],["has","for"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Hometown Girl":"The writers of Hometown Girl is Marc Beeson, Daniel Tashian."}}},
{"id":"n-73cb8480","guard":[["has","vice"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Vice":"The writers of Vice is Miranda Lambert, Josh Osborne, Shane McAnally."}}},
{"id":"n-754c743c","guard":[["hasAny",["outta","style"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Outta Style":"The writers of Outta Style is Aaron Watson."}}},
{"id":"n-76e1484a","guard":[["has","met"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for I Met A Girl":"The writers of I Met A Girl is Sam Hunt, Trevor Rosen, Shane McAnally."}}},
{"id":"n-790e18a3","guard":[["has","chillin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Chillin' It":"The writers of Chillin' It is Cole Swindell, Shane Minor."}}},
{"id":"n-79fa9130","guard":[["has","rednecker"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Rednecker":"The writers of Rednecker is HARDY, Jordan Schmidt, Andy Albert."}}},
{"id":"n-7b8eb514","guard":[["hasAny",["boot","fits","writers"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of If The Boot Fits":"The writers of If The Boot Fits is Jordan Schmidt, Andy Albert, Mitchell Tenpenny."}}},
{"id":"n-7c876db2","guard":[["has","get"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Get Me Some of That":"The writers of Get Me Some of That is Rhett Akins, Michael Carter, Cole Swindell."}}},
{"id":"n-7d81695e","guard":[["has","dirt"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Dirt":"The writers of Dirt is Rodney Clawson, Chris Tompkins."}}},
{"id":"n-80b39c14","guard":[["hasAny",["rider","shotgun","writers"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Shotgun Rider":"The writers of Shotgun Rider is Marv Green, Hillary Lindsey, Troy Verges."}}},
{"id":"n-81a29cdd","guard":[["has","craving"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Craving You":"The writers of Craving You is Dave Barnes, Julian Bunetta."}}},
{"id":"n-8dd2016f","guard":[["has","babe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Babe":"The writers of Babe is Taylor Swift, Patrick Monahan."}}},
{"id":"n-92dd3233","guard":[["hasAny",["light","up","writers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Light It Up":"The writers of Light It Up is Luke Bryan, Brad Tursi."}}},
{"id":"n-9e72341f","guard":[["hasAny",["life","real","writers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Real Life":"The writers of Real Life is Shane McAnally, Josh Osborne, Ashley Gorley, Ross Copperman."}}},
{"id":"n-9f073f16","guard":[["hasAny",["drunk","plane"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Drunk On A Plane":"The writers of Drunk On A Plane is Dierks Bentley, Chris Tompkins, Josh Kear."}}},
{"id":"n-9f281095","guard":[["has","compass"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Compass":"The writers of Compass is Mikkel Eriksen, Tor Erik Hemransen, Ammar Malik, Ross Golan, Daniel Omelio, Emile Haynie."}}},
{"id":"n-a2a00f3a","guard":[["has","goodnight"],["has","writers"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Goodnight Kiss":"The writers of Goodnight Kiss is Rob Hatch, Jason Sellers, Randy Houser."}}},
{"id":"n-a45bf378","guard":[["hasAny",["buy","dranks","own","writers"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Buy My Own Dranks":"The writers of Buy My Own Dranks is Naomi Cooke, Josh Kear, Hillary Lindsey, Hannah Mullholand, Jennifer Wayne."}}},
{"id":"n-a5bba953","guard":[["hasAny",["girls","god","made","song","writers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song God Made Girls":"The writers of God Made Girls is RaeLynn, Nicolle Galyon, Lori McKenna, Liz Rose."}}},
{"id":"n-ac96d02e","guard":[["hasAny",["come","lights"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Lights Come On":"The writers of Lights Come On is Brian Kelley, Tyler Hubbard, Jordan Schmidt, Jimmy Robbins, Brad Warren, Brett Warren."}}},
{"id":"n-b0ad27d8","guard":[["has","ground"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song From The Ground Up":"The writers of From The Ground Up is Dan Smyers, Shay Mooney, Chris DeStefano."}}},
{"id":"n-b296a258","guard":[["hasAny",["alright","everythings","gonna","writers"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Everything's Gonna Be Alright":"The writers of Everything's Gonna Be Alright is David Lee Murphy, Jimmy Yeary, Chris Stevens."}}},
{"id":"n-b3c1e2ef","guard":[["has","wins"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Love Wins":"The writers of Love Wins is Carrie Underwood, Brett James, David Garcia."}}},
{"id":"n-b74bee87","guard":[["hasAny",["little","more","summertime","writers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of A Little More Summertime":"The writers of A Little More Summertime is Jerry Flowers, Tony Martin, Wendell Mobley."}}},
{"id":"n-b92bf7db","guard":[["has","stay"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Stay":"The writers of Stay is Joey Moi."}}},
{"id":"n-bb4502ae","guard":[["has","told"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song If I Told You":"The writers of If I Told You is Ross Copperman, Shane McAnally, Jon Nite."}}},
{"id":"n-bdad17ff","guard":[["hasAny",["comin","over"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song I'm Comin Over":"The writers of I'm Comin Over is Corey Crowder, Josh Hoge, Chris Young."}}},
{"id":"n-bdc51ba9","guard":[["has","simple"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Simple":"The writers of Simple is Tyler Hubbard, Brian Kelley, Hardy, Mark Holman."}}},
{"id":"n-beb88dcc","guard":[["has","drink"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Fix A Drink":"The writers of Fix A Drink is Chris Janson, Chris DuBois, Ashley Gorley."}}},
{"id":"n-bff6c88a","guard":[["has","fighter"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for The Fighter":"The writers of The Fighter is Keith Urban, busbee."}}},
{"id":"n-c37e306e","guard":[["hasAny",["greatest","love","story","writers"]],["has","writers"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Greatest Love Story":"The writers of Greatest Love Story is Brandon Lancaster."}}},
{"id":"n-c7cff742","guard":[["has","hold"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of I Hold On":"The writers of I Hold On is Brett James, Dierks Bentley."}}},
{"id":"n-ce0bd7fe","guard":[["hasAny",["dance","lot","parking","slow","writers"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Slow Dance in a Parking Lot":"The writers of Slow Dance in a Parking Lot is Jordan Davis, Lonnie Fowler."}}},
{"id":"n-d10b52d9","guard":[["hasAny",["dont","hurt","like","song","used","writers"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song It Don't Hurt Like It Used To":"The writers of It Don't Hurt Like It Used To is Billy Currington, Cary Barlowe, Shy Carter."}}},
{"id":"n-d5d39720","guard":[["hasAny",["boots","head","over","writers"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Head Over Boots":"The writers of Head Over Boots is Jon Pardi, Luke Laird."}}},
{"id":"n-d5d855ef","guard":[["has","tin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Tin Man":"The writers of Tin Man is Miranda Lambert, Jack Ingram, Jon Randall."}}},
{"id":"n-e1f54f5a","guard":[["has","make"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of Make Me Wanna":"The writers of Make Me Wanna is Thomas Rhett, Bart Butler, Larry McCoy."}}},
{"id":"n-e218f774","guard":[["hasAny",["bank","river","writers"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the writers of River Bank":"The writers of River Bank is Brad Paisley, Kelley Lovelace."}}},
{"id":"n-e6a7ba31","guard":[["has","riser"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Riser":"The writers of Riser is Travis Meadows, Steve Moakler."}}},
{"id":"n-e973875a","guard":[["hasAny",["hearts","mine","more","song","writers"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song More Hearts Than Mine":"The writers of More Hearts Than Mine is Ingrid Andress, Sam Ellis, Derrick Southerland."}}},
{"id":"n-ee228e0b","guard":[["has","good"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Good Girl":"The writers of Good Girl is Dustin Lynch, Justin Ebach, Andy Albert."}}},
{"id":"n-f00c3f80","guard":[["hasAny",["beautiful","drug"]],["has","writers"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Beautiful Drug":"The writers of Beautiful Drug is Zac Brown, Niko Moon."}}},
{"id":"n-fa4daf65","guard":[["has","nation"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the writers of the song Country Nation":"The writers of Country Nation is Brad Paisley, Chris DuBois, Kelley Lovelace."}}},
{"id":"n-fa8ad3a0","guard":[["has","mean"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for Mean To Me":"The writers of Mean To Me is Brett Eldredge, Scooter Carusoe."}}},
{"id":"n-fae01d81","guard":[["has","see"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for See You Tonight":"The writers of See You Tonight is Ashley Gorley, Zach Crowell, Scotty Mccreery, Miller Crowell."}}},
{"id":"n-fb2377c2","guard":[["hasAny",["first","time","writers"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the writers for For The First Time":"The writers of For The First Time is Darius Rucker, Derek George, Scooter Carusoe."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the writers of Thought About You","expect":{"contains":["Brad Warren, Brett Warren, Lee Thomas Miller"],"notRefusal":true}},{"q":"what is the writers of I Hold On","expect":{"contains":["Brett James, Dierks Bentley"],"notRefusal":true}},{"q":"what is the writers of Somewhere In My Car","expect":{"contains":["Keith Urban, J.T. Harding"],"notRefusal":true}},{"q":"give the writers for Turnin' Me On","expect":{"contains":["Blake Shelton, Josh Osborne, Jessi Alexander"],"notRefusal":true}},{"q":"give the writers for I Met A Girl","expect":{"contains":["Sam Hunt, Trevor Rosen, Shane McAnally"],"notRefusal":true}},{"q":"tell me the writers of the song Caught Up in the Country","expect":{"contains":["Connie Harrington, Jordan Schmidt, Mike Walker"],"notRefusal":true}},{"q":"give the writers for Girl","expect":{"contains":["Maren Morris, Greg Kurstin, Sarah Aarons"],"notRefusal":true}},{"q":"what is the writers of Say You Do","expect":{"contains":["Shane McAnally, Matthew Ramsey, Trevor Rosen"],"notRefusal":true}},{"q":"what is the writers of Hell of a Night","expect":{"contains":["Zach Crowell, Adam Sanders, Jaron Boyer"],"notRefusal":true}},{"q":"tell me the writers of the song God Made Girls","expect":{"contains":["RaeLynn, Nicolle Galyon, Lori McKenna, Liz Rose"],"notRefusal":true}},{"q":"give the writers for Mean To Me","expect":{"contains":["Brett Eldredge, Scooter Carusoe"],"notRefusal":true}},{"q":"tell me the writers of the song Criminal","expect":{"contains":["Lindsay Ell, Fred Wilhelm, Chris Stevens"],"notRefusal":true}},{"q":"tell me the writers of the song If I Told You","expect":{"contains":["Ross Copperman, Shane McAnally, Jon Nite"],"notRefusal":true}},{"q":"what is the writers of H.O.L.Y.","expect":{"contains":["busbee, Nate Cyphert, William Wiik Larsen"],"notRefusal":true}},{"q":"give the writers for Simple","expect":{"contains":["Tyler Hubbard, Brian Kelley, Hardy, Mark Holman"],"notRefusal":true}},{"q":"give the writers for Babe","expect":{"contains":["Taylor Swift, Patrick Monahan"],"notRefusal":true}},{"q":"what is the writers of Night's On Fire","expect":{"contains":["Jonathan Singleton, Deric Ruttan"],"notRefusal":true}},{"q":"what is the writers of Shotgun Rider","expect":{"contains":["Marv Green, Hillary Lindsey, Troy Verges"],"notRefusal":true}},{"q":"what is the writers of Buy My Own Dranks","expect":{"contains":["Naomi Cooke, Josh Kear, Hillary Lindsey, Hannah Mullholand, Jennifer Wayne"],"notRefusal":true}},{"q":"what is the writers of Make Me Wanna","expect":{"contains":["Thomas Rhett, Bart Butler, Larry McCoy"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
